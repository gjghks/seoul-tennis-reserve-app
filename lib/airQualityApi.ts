const API_KEY = process.env.SEOUL_AIR_QUALITY_KEY || process.env.SEOUL_OPEN_DATA_KEY;
const BASE_URL = 'http://openAPI.seoul.go.kr:8088';
const REQUEST_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (data updates hourly)

export interface AirQualityData {
  district: string;       // 자치구명 (e.g. "강남구")
  grade: string;          // 통합대기환경지수 등급 (좋음/보통/나쁨/매우나쁨)
  cai: number | null;     // 통합대기환경지수
  pm10: number | null;    // 미세먼지 (μg/m³)
  pm25: number | null;    // 초미세먼지 (μg/m³)
  mainPollutant: string;  // 지수결정 물질 (e.g. "PM-2.5")
  measuredAt: string;     // 측정 시간 (e.g. "202602131000")
}

interface AirQualityCache {
  data: Map<string, AirQualityData>;
  timestamp: number;
}

let airQualityCache: AirQualityCache | null = null;

function isCacheFresh(): boolean {
  return !!airQualityCache && (Date.now() - airQualityCache.timestamp) < CACHE_TTL_MS;
}

function parseXmlTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : '';
}

function parseNumericValue(value: string): number | null {
  if (!value || value === '점검중' || value === '-') return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseXmlResponse(xml: string): Map<string, AirQualityData> {
  const result = new Map<string, AirQualityData>();

  const code = parseXmlTag(xml, 'CODE');
  if (code !== 'INFO-000') {
    console.error(`Air quality API error: ${code} - ${parseXmlTag(xml, 'MESSAGE')}`);
    return result;
  }

  const rows = xml.match(/<row>[\s\S]*?<\/row>/g) || [];

  for (const row of rows) {
    const district = parseXmlTag(row, 'MSRSTN_NM');
    if (!district) continue;

    result.set(district, {
      district,
      grade: parseXmlTag(row, 'CAI_GRD') || '정보없음',
      cai: parseNumericValue(parseXmlTag(row, 'CAI')),
      pm10: parseNumericValue(parseXmlTag(row, 'PM')),
      pm25: parseNumericValue(parseXmlTag(row, 'FPM')),
      mainPollutant: parseXmlTag(row, 'CRST_SBSTN'),
      measuredAt: parseXmlTag(row, 'MSRMT_YMD'),
    });
  }

  return result;
}

export function resolveAirQualityGradeColor(grade: string): {
  bg: string;
  text: string;
  bgNeo: string;
  textNeo: string;
  icon: string;
} {
  switch (grade) {
    case '좋음':
      return { bg: 'bg-blue-100', text: 'text-blue-700', bgNeo: 'bg-[#88aaee]', textNeo: 'text-black', icon: '😊' };
    case '보통':
      return { bg: 'bg-green-100', text: 'text-green-700', bgNeo: 'bg-[#a3e635]', textNeo: 'text-black', icon: '🙂' };
    case '나쁨':
      return { bg: 'bg-orange-100', text: 'text-orange-700', bgNeo: 'bg-[#facc15]', textNeo: 'text-black', icon: '😷' };
    case '매우나쁨':
      return { bg: 'bg-red-100', text: 'text-red-700', bgNeo: 'bg-[#fca5a5]', textNeo: 'text-black', icon: '🚫' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', bgNeo: 'bg-gray-200', textNeo: 'text-black/50', icon: '❓' };
  }
}

export function resolvePmColor(type: 'pm25' | 'pm10', value: number): string {
  if (type === 'pm25') {
    if (value <= 15) return 'text-blue-500';
    if (value <= 35) return 'text-green-500';
    if (value <= 75) return 'text-orange-500';
    return 'text-red-500';
  }
  if (value <= 30) return 'text-blue-500';
  if (value <= 80) return 'text-green-500';
  if (value <= 150) return 'text-orange-500';
  return 'text-red-500';
}

export function resolvePmColorLight(type: 'pm25' | 'pm10', value: number): string {
  if (type === 'pm25') {
    if (value <= 15) return 'text-blue-300';
    if (value <= 35) return 'text-green-300';
    if (value <= 75) return 'text-orange-300';
    return 'text-red-300';
  }
  if (value <= 30) return 'text-blue-300';
  if (value <= 80) return 'text-green-300';
  if (value <= 150) return 'text-orange-300';
  return 'text-red-300';
}

export function resolvePmColorNeo(type: 'pm25' | 'pm10', value: number): string {
  if (type === 'pm25') {
    if (value <= 15) return 'text-[#3b82f6]';
    if (value <= 35) return 'text-[#16a34a]';
    if (value <= 75) return 'text-[#ea580c]';
    return 'text-[#dc2626]';
  }
  if (value <= 30) return 'text-[#3b82f6]';
  if (value <= 80) return 'text-[#16a34a]';
  if (value <= 150) return 'text-[#ea580c]';
  return 'text-[#dc2626]';
}

export function isAirQualityBad(grade: string): boolean {
  return grade === '나쁨' || grade === '매우나쁨';
}

async function fetchAllAirQuality(): Promise<Map<string, AirQualityData>> {
  if (isCacheFresh()) {
    return airQualityCache!.data;
  }

  if (!API_KEY) {
    console.error('SEOUL_AIR_QUALITY_KEY / SEOUL_OPEN_DATA_KEY is missing');
    return new Map();
  }

  const url = `${BASE_URL}/${API_KEY}/xml/ListAirQualityByDistrictService/1/25/`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Air quality API HTTP ${res.status}`);
    }

    const xml = await res.text();
    const data = parseXmlResponse(xml);

    if (data.size > 0) {
      airQualityCache = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    console.error('Air quality API fetch failed:', error);

    if (airQualityCache) {
      console.warn('Serving stale air quality data from cache');
      return airQualityCache.data;
    }

    return new Map();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getAirQualityByDistrict(district: string): Promise<AirQualityData | null> {
  const allData = await fetchAllAirQuality();
  return allData.get(district) ?? null;
}

export async function getSeoulAverageAirQuality(): Promise<AirQualityData | null> {
  const allData = await fetchAllAirQuality();
  if (allData.size === 0) return null;

  let totalCai = 0;
  let totalPm10 = 0;
  let totalPm25 = 0;
  let caiCount = 0;
  let pm10Count = 0;
  let pm25Count = 0;
  let worstGrade = '좋음';
  let measuredAt = '';

  const gradeRank: Record<string, number> = { '좋음': 0, '보통': 1, '나쁨': 2, '매우나쁨': 3 };

  for (const d of allData.values()) {
    if (d.cai !== null) { totalCai += d.cai; caiCount++; }
    if (d.pm10 !== null) { totalPm10 += d.pm10; pm10Count++; }
    if (d.pm25 !== null) { totalPm25 += d.pm25; pm25Count++; }
    if ((gradeRank[d.grade] ?? -1) > (gradeRank[worstGrade] ?? -1)) {
      worstGrade = d.grade;
    }
    if (!measuredAt && d.measuredAt) measuredAt = d.measuredAt;
  }

  const avgCai = caiCount > 0 ? Math.round(totalCai / caiCount) : null;
  let avgGrade: string;
  if (avgCai === null) {
    avgGrade = '정보없음';
  } else if (avgCai <= 50) {
    avgGrade = '좋음';
  } else if (avgCai <= 100) {
    avgGrade = '보통';
  } else if (avgCai <= 250) {
    avgGrade = '나쁨';
  } else {
    avgGrade = '매우나쁨';
  }

  return {
    district: '서울',
    grade: avgGrade,
    cai: avgCai,
    pm10: pm10Count > 0 ? Math.round(totalPm10 / pm10Count) : null,
    pm25: pm25Count > 0 ? Math.round(totalPm25 / pm25Count) : null,
    mainPollutant: 'PM-2.5',
    measuredAt,
  };
}
