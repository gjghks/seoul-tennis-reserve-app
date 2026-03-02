import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createRateLimiter } from '@/lib/rateLimit';
import { getKSTNow } from '@/lib/date';

type WeatherPayload = {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
  sky: string | null;
};

interface KmaItem {
  category: string;
  obsrValue: string;
}

interface KmaFcstItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

interface KmaResponse {
  response?: {
    body?: {
      items?: {
        item?: KmaItem[];
      };
    };
  };
}

interface KmaFcstResponse {
  response?: {
    body?: {
      items?: {
        item?: KmaFcstItem[];
      };
    };
  };
}

const CACHE_TTL = 30 * 60;
const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const EMPTY_WEATHER: WeatherPayload = {
  temperature: null,
  humidity: null,
  rainfall: null,
  windSpeed: null,
  sky: null,
};

function formatKstDateTime(kstDate: Date) {
  const year = kstDate.getFullYear();
  const month = `${kstDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${kstDate.getDate()}`.padStart(2, '0');
  const hour = `${kstDate.getHours()}`.padStart(2, '0');
  return { year, month, day, hour };
}

/** 초단기실황 base_time: 매시 정각 발표, 약 40분 후 제공 */
function toNcstBaseDateTime() {
  const kstNow = getKSTNow();
  const minutes = kstNow.getMinutes();

  // 실황 데이터는 매시 40분경 발표. 45분 이후면 현재 시각 데이터 사용 가능
  if (minutes < 45) {
    kstNow.setHours(kstNow.getHours() - 1);
  }
  kstNow.setMinutes(0, 0, 0);

  const { year, month, day, hour } = formatKstDateTime(kstNow);
  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}00`,
  };
}

/** 초단기예보 base_time: 매시 30분 생성, 약 45분 후 제공 */
function toFcstBaseDateTime() {
  const kstNow = getKSTNow();
  const minutes = kstNow.getMinutes();

  // 초단기예보는 매시 30분 생성, 45분경 발표
  if (minutes < 45) {
    kstNow.setHours(kstNow.getHours() - 1);
  }
  kstNow.setMinutes(0, 0, 0);

  const { year, month, day, hour } = formatKstDateTime(kstNow);
  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}30`,
  };
}

function parseNumeric(value?: string): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized === '강수없음') {
    return 0;
  }

  const parsed = Number.parseFloat(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

/** PTY(강수형태) → 강수 문자열. PTY=0이면 null (강수 없음 ≠ 맑음) */
function resolvePrecipitation(pty?: string): string | null {
  switch (pty) {
    case '1':
      return '비';
    case '2':
      return '비/눈';
    case '3':
      return '눈';
    case '4':
      return '소나기';
    case '5':
      return '비'; // 빗방울 (초단기실황 전용)
    case '6':
      return '비/눈'; // 빗방울눈날림 (초단기실황 전용)
    case '7':
      return '눈'; // 눈날림 (초단기실황 전용)
    default:
      return null;
  }
}

/** SKY(하늘상태) 코드 → 문자열 (초단기예보에서 제공) */
function resolveSkyCode(skyCode?: string): string | null {
  switch (skyCode) {
    case '1':
      return '맑음';
    case '3':
      return '구름많음';
    case '4':
      return '흐림';
    default:
      return null;
  }
}

/** PTY + SKY 조합으로 최종 sky 결정. 강수가 있으면 PTY 우선, 없으면 SKY 사용 */
function resolveSky(pty?: string, skyCode?: string): string | null {
  const precipitation = resolvePrecipitation(pty);
  if (precipitation) return precipitation;
  return resolveSkyCode(skyCode);
}

/** 초단기예보(getUltraSrtFcst)에서 가장 가까운 시간대의 SKY 값을 가져온다 */
async function fetchSkyFromForecast(
  nx: string,
  ny: string,
  weatherKey: string,
): Promise<string | null> {
  try {
    const { baseDate, baseTime } = toFcstBaseDateTime();
    const params = new URLSearchParams({
      pageNo: '1',
      numOfRows: '60',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx,
      ny,
      authKey: weatherKey,
    });

    const response = await fetch(
      `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtFcst?${params.toString()}`,
    );

    if (!response.ok) return null;

    const data = (await response.json()) as KmaFcstResponse;
    const items = data.response?.body?.items?.item;
    if (!items || items.length === 0) return null;

    const skyItem = items
      .filter((item) => item.category === 'SKY')
      .sort((a, b) => {
        const timeA = `${a.fcstDate}${a.fcstTime}`;
        const timeB = `${b.fcstDate}${b.fcstTime}`;
        return timeA.localeCompare(timeB);
      })[0];

    return skyItem?.fcstValue ?? null;
  } catch {
    return null;
  }
}

function fetchWeatherData(nx: string, ny: string): Promise<WeatherPayload> {
  return unstable_cache(
    async (): Promise<WeatherPayload> => {
      const weatherKey = process.env.WEATHER_API_KEY;
      if (!weatherKey) {
        console.error('[weather] WEATHER_API_KEY is not set');
        return EMPTY_WEATHER;
      }

      const { baseDate, baseTime } = toNcstBaseDateTime();
      const ncstParams = new URLSearchParams({
        pageNo: '1',
        numOfRows: '100',
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
        authKey: weatherKey,
      });

      const [ncstResponse, skyCode] = await Promise.all([
        fetch(
          `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?${ncstParams.toString()}`,
        ),
        fetchSkyFromForecast(nx, ny, weatherKey),
      ]);

      if (!ncstResponse.ok) {
        console.error(`[weather] KMA API returned HTTP ${ncstResponse.status} for nx=${nx}, ny=${ny}`);
        return EMPTY_WEATHER;
      }

      const data = (await ncstResponse.json()) as KmaResponse;
      const items = data.response?.body?.items?.item;

      if (!items || items.length === 0) {
        console.error(`[weather] KMA API returned no items for nx=${nx}, ny=${ny}`, JSON.stringify(data).slice(0, 500));
        return EMPTY_WEATHER;
      }

      const itemMap = new Map(items.map((item) => [item.category, item.obsrValue]));

      return {
        temperature: parseNumeric(itemMap.get('T1H')),
        humidity: parseNumeric(itemMap.get('REH')),
        rainfall: parseNumeric(itemMap.get('RN1')),
        windSpeed: parseNumeric(itemMap.get('WSD')),
        sky: resolveSky(itemMap.get('PTY'), skyCode ?? undefined),
      };
    },
    [`weather-${nx}-${ny}`],
    { revalidate: CACHE_TTL, tags: ['weather'] }
  )();
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const nx = searchParams.get('nx');
    const ny = searchParams.get('ny');

    if (!nx || !ny) {
      return NextResponse.json(EMPTY_WEATHER);
    }

    const payload = await fetchWeatherData(nx, ny);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[weather] Unexpected error:', error);
    return NextResponse.json(EMPTY_WEATHER);
  }
}
