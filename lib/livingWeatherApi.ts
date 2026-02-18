import { getKSTComponents } from '@/lib/date';

const API_KEY = process.env.LIVING_WEATHER_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1360000/LivingWthrIdxServiceV4';
const REQUEST_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3시간 (API 갱신 주기)

// 서울 25개 구 → 10자리 행정구역코드
const DISTRICT_AREA_CODES: Record<string, string> = {
  '강남구': '1168000000',
  '강동구': '1174000000',
  '강북구': '1130500000',
  '강서구': '1150000000',
  '관악구': '1162000000',
  '광진구': '1121500000',
  '구로구': '1153000000',
  '금천구': '1154500000',
  '노원구': '1135000000',
  '도봉구': '1132000000',
  '동대문구': '1123000000',
  '동작구': '1159000000',
  '마포구': '1144000000',
  '서대문구': '1141000000',
  '서초구': '1165000000',
  '성동구': '1120000000',
  '성북구': '1129000000',
  '송파구': '1171000000',
  '양천구': '1147000000',
  '영등포구': '1156000000',
  '용산구': '1117000000',
  '은평구': '1138000000',
  '종로구': '1111000000',
  '중구': '1114000000',
  '중랑구': '1126000000',
};

export function getAreaCode(districtNameKo: string): string | null {
  return DISTRICT_AREA_CODES[districtNameKo] ?? null;
}

interface KmaApiResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body?: {
      dataType: string;
      items: { item: T[] };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

interface UVIndexItem {
  code: string;
  areaNo: string;
  date: string;
  [key: string]: string;
}

interface AirDiffusionItem {
  code: string;
  areaNo: string;
  date: string;
  [key: string]: string;
}

export interface HourlyIndex {
  hoursFromBase: number;
  value: number | null;
}

export interface UVForecast {
  areaNo: string;
  date: string;
  hourly: HourlyIndex[];
  todayMax: number;
  tomorrowMax: number;
  dayAfterMax: number;
}

export interface AirDiffusionForecast {
  areaNo: string;
  date: string;
  hourly: HourlyIndex[];
  currentLevel: number | null;
  currentLabel: string;
}

export interface LivingWeatherData {
  uv: UVForecast | null;
  airDiffusion: AirDiffusionForecast | null;
  updatedAt: string;
}

interface CacheEntry {
  data: LivingWeatherData;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCachedData(key: string): LivingWeatherData | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp >= CACHE_TTL_MS) return null;
  return entry.data;
}

function getStaleCachedData(key: string): LivingWeatherData | null {
  return cache.get(key)?.data ?? null;
}

function parseHourlyValues(item: Record<string, string>, maxHour: number): HourlyIndex[] {
  const result: HourlyIndex[] = [];
  for (let h = 0; h <= maxHour; h += 3) {
    const raw = item[`h${h}`];
    const value = raw !== undefined && raw !== '' ? Number.parseInt(raw, 10) : null;
    result.push({ hoursFromBase: h, value: Number.isFinite(value) ? value : null });
  }
  return result;
}

function computeMaxByDay(hourly: HourlyIndex[]): { todayMax: number; tomorrowMax: number; dayAfterMax: number } {
  const getMaxInRange = (from: number, to: number) => {
    let max = 0;
    for (const h of hourly) {
      if (h.hoursFromBase >= from && h.hoursFromBase < to && h.value !== null && h.value > max) {
        max = h.value;
      }
    }
    return max;
  };
  return {
    todayMax: getMaxInRange(0, 24),
    tomorrowMax: getMaxInRange(24, 48),
    dayAfterMax: getMaxInRange(48, 75),
  };
}

function resolveAirDiffusionLabel(value: number | null): string {
  if (value === null) return '정보없음';
  if (value >= 100) return '매우높음';
  if (value >= 75) return '높음';
  if (value >= 50) return '보통';
  return '낮음';
}

function buildApiTimeParam(): string {
  const kst = getKSTComponents();
  const baseHour = kst.hours >= 18 ? 18 : kst.hours >= 6 ? 6 : 18;

  let { year, month, day } = kst;
  if (kst.hours < 6) {
    const yesterday = new Date(year, month - 1, day - 1);
    year = yesterday.getFullYear();
    month = yesterday.getMonth() + 1;
    day = yesterday.getDate();
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const hh = String(baseHour).padStart(2, '0');
  return `${year}${mm}${dd}${hh}`;
}

async function fetchApi<T>(endpoint: string, areaNo: string, time: string): Promise<T[] | null> {
  if (!API_KEY) {
    console.error('LIVING_WEATHER_API_KEY is missing');
    return null;
  }

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    areaNo,
    time,
    dataType: 'JSON',
    pageNo: '1',
    numOfRows: '10',
  });

  const url = `${BASE_URL}${endpoint}?${params.toString()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Living weather API HTTP ${res.status}`);
    }

    const json: KmaApiResponse<T> = await res.json();

    if (json.response.header.resultCode === '03') {
      // NO_DATA — e.g. seasonal service not available
      return [];
    }

    if (json.response.header.resultCode !== '00') {
      throw new Error(`Living weather API error: ${json.response.header.resultCode} - ${json.response.header.resultMsg}`);
    }

    return json.response.body?.items?.item ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getLivingWeatherData(districtNameKo: string): Promise<LivingWeatherData> {
  const areaNo = getAreaCode(districtNameKo);
  if (!areaNo) {
    return { uv: null, airDiffusion: null, updatedAt: new Date().toISOString() };
  }

  const cacheKey = areaNo;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const time = buildApiTimeParam();

  try {
    const [uvItems, airItems] = await Promise.all([
      fetchApi<UVIndexItem>('/getUVIdxV4', areaNo, time),
      fetchApi<AirDiffusionItem>('/getAirDiffusionIdxV4', areaNo, time),
    ]);

    let uv: UVForecast | null = null;
    if (uvItems && uvItems.length > 0) {
      const item = uvItems[0];
      const hourly = parseHourlyValues(item, 75);
      const maxes = computeMaxByDay(hourly);
      uv = { areaNo: item.areaNo, date: item.date, hourly, ...maxes };
    }

    let airDiffusion: AirDiffusionForecast | null = null;
    if (airItems && airItems.length > 0) {
      const item = airItems[0];
      const hourly = parseHourlyValues(item, 78);
      const currentValue = hourly[0]?.value ?? hourly[1]?.value ?? null;
      airDiffusion = {
        areaNo: item.areaNo,
        date: item.date,
        hourly,
        currentLevel: currentValue,
        currentLabel: resolveAirDiffusionLabel(currentValue),
      };
    }

    const data: LivingWeatherData = { uv, airDiffusion, updatedAt: new Date().toISOString() };

    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Living weather API fetch failed:', error);

    const stale = getStaleCachedData(cacheKey);
    if (stale) {
      console.warn(`Serving stale living weather data for ${districtNameKo}`);
      return stale;
    }

    return { uv: null, airDiffusion: null, updatedAt: new Date().toISOString() };
  }
}
