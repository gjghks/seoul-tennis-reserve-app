import { NextRequest, NextResponse } from 'next/server';

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

interface KmaResponse {
  response?: {
    body?: {
      items?: {
        item?: KmaItem[];
      };
    };
  };
}

export const revalidate = 1800;

const EMPTY_WEATHER: WeatherPayload = {
  temperature: null,
  humidity: null,
  rainfall: null,
  windSpeed: null,
  sky: null,
};

function toKstBaseDateTime() {
  const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  kstNow.setMinutes(0, 0, 0);
  kstNow.setHours(kstNow.getHours() - 1);

  const year = kstNow.getFullYear();
  const month = `${kstNow.getMonth() + 1}`.padStart(2, '0');
  const day = `${kstNow.getDate()}`.padStart(2, '0');
  const hour = `${kstNow.getHours()}`.padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}00`,
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

function resolveSky(pty?: string): string | null {
  switch (pty) {
    case '0':
      return '맑음';
    case '1':
      return '비';
    case '2':
      return '비/눈';
    case '3':
      return '눈';
    case '4':
      return '소나기';
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const weatherKey = process.env.WEATHER_API_KEY;
    if (!weatherKey) {
      return NextResponse.json(EMPTY_WEATHER);
    }

    const { searchParams } = new URL(request.url);
    const nx = searchParams.get('nx');
    const ny = searchParams.get('ny');

    if (!nx || !ny) {
      return NextResponse.json(EMPTY_WEATHER);
    }

    const { baseDate, baseTime } = toKstBaseDateTime();
    const params = new URLSearchParams({
      pageNo: '1',
      numOfRows: '100',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx,
      ny,
      authKey: weatherKey,
    });

    const response = await fetch(
      `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?${params.toString()}`,
      { next: { revalidate: 1800 } }
    );

    if (!response.ok) {
      return NextResponse.json(EMPTY_WEATHER);
    }

    const data = (await response.json()) as KmaResponse;
    const items = data.response?.body?.items?.item;

    if (!items || items.length === 0) {
      return NextResponse.json(EMPTY_WEATHER);
    }

    const itemMap = new Map(items.map((item) => [item.category, item.obsrValue]));

    const payload: WeatherPayload = {
      temperature: parseNumeric(itemMap.get('T1H')),
      humidity: parseNumeric(itemMap.get('REH')),
      rainfall: parseNumeric(itemMap.get('RN1')),
      windSpeed: parseNumeric(itemMap.get('WSD')),
      sky: resolveSky(itemMap.get('PTY')),
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(EMPTY_WEATHER);
  }
}
