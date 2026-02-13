const API_KEY = process.env.AIRKOREA_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/B552584/UlfptcaAlarmInqireSvc';
const REQUEST_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface DustAlertItem {
  sn: number;
  dataDate: string;          // 발령일 (e.g. "2026-02-13")
  districtName: string;      // 지역명 (e.g. "서울")
  moveName: string;          // 권역명 (e.g. "서울권역")
  itemCode: 'PM10' | 'PM25'; // 미세먼지 / 초미세먼지
  issueGbn: '주의보' | '경보'; // 경보단계
  issueDate: string;         // 발령 날짜
  issueTime: string;         // 발령 시간 (e.g. "13:00")
  issueVal: number;          // 발령 농도 (μg/m³)
  clearDate: string | null;  // 해제 날짜 (발령 중이면 "--" 또는 null)
  clearTime: string | null;  // 해제 시간
  clearVal: number | null;   // 해제 농도 (μg/m³)
}

export interface SeoulDustAlertStatus {
  hasAlert: boolean;
  alerts: DustAlertItem[];
  highestLevel: '경보' | '주의보' | null;
  highestItemCode: 'PM10' | 'PM25' | null;
  highestValue: number | null;
  updatedAt: string;
}

interface DustAlertCache {
  data: SeoulDustAlertStatus;
  timestamp: number;
}

let dustAlertCache: DustAlertCache | null = null;

function isCacheFresh(): boolean {
  return !!dustAlertCache && (Date.now() - dustAlertCache.timestamp) < CACHE_TTL_MS;
}

interface AirKoreaApiItem {
  sn: string;
  dataDate: string;
  districtName: string;
  moveName: string;
  itemCode: string;
  issueGbn: string;
  issueDate: string;
  issueTime: string;
  issueVal: string;
  clearDate: string;
  clearTime: string;
  clearVal: string | null;
}

interface AirKoreaApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      totalCount: number;
      items: AirKoreaApiItem[];
      pageNo: number;
      numOfRows: number;
    };
  };
}

function isAlertActive(item: AirKoreaApiItem): boolean {
  return !item.clearDate || item.clearDate === '--' || item.clearDate.trim() === '';
}

function isSeoulRelated(item: AirKoreaApiItem): boolean {
  return item.districtName === '서울';
}

function parseApiItem(raw: AirKoreaApiItem): DustAlertItem {
  return {
    sn: Number.parseInt(raw.sn, 10),
    dataDate: raw.dataDate,
    districtName: raw.districtName,
    moveName: raw.moveName,
    itemCode: raw.itemCode as DustAlertItem['itemCode'],
    issueGbn: raw.issueGbn as DustAlertItem['issueGbn'],
    issueDate: raw.issueDate,
    issueTime: raw.issueTime,
    issueVal: Number.parseInt(raw.issueVal, 10),
    clearDate: (!raw.clearDate || raw.clearDate === '--') ? null : raw.clearDate,
    clearTime: (!raw.clearTime || raw.clearTime === ':00') ? null : raw.clearTime,
    clearVal: raw.clearVal ? Number.parseInt(raw.clearVal, 10) : null,
  };
}

function buildAlertStatus(alerts: DustAlertItem[]): SeoulDustAlertStatus {
  if (alerts.length === 0) {
    return {
      hasAlert: false,
      alerts: [],
      highestLevel: null,
      highestItemCode: null,
      highestValue: null,
      updatedAt: new Date().toISOString(),
    };
  }

  const hasGyeongbo = alerts.some(a => a.issueGbn === '경보');
  const highestLevel = hasGyeongbo ? '경보' : '주의보';

  const highestAlerts = alerts.filter(a => a.issueGbn === highestLevel);
  const highest = highestAlerts.reduce((max, a) =>
    a.issueVal > max.issueVal ? a : max
  , highestAlerts[0]);

  return {
    hasAlert: true,
    alerts,
    highestLevel,
    highestItemCode: highest.itemCode,
    highestValue: highest.issueVal,
    updatedAt: new Date().toISOString(),
  };
}

export async function getSeoulDustAlertStatus(): Promise<SeoulDustAlertStatus> {
  if (isCacheFresh()) {
    return dustAlertCache!.data;
  }

  if (!API_KEY) {
    console.error('AIRKOREA_API_KEY is missing');
    return buildAlertStatus([]);
  }

  const year = new Date().getFullYear();
  const url = `${BASE_URL}/getUlfptcaAlarmInfo?serviceKey=${encodeURIComponent(API_KEY)}&returnType=json&numOfRows=100&pageNo=1&year=${year}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`AirKorea API HTTP ${res.status}`);
    }

    const json: AirKoreaApiResponse = await res.json();

    if (json.response.header.resultCode !== '00') {
      throw new Error(`AirKorea API error: ${json.response.header.resultCode} - ${json.response.header.resultMsg}`);
    }

    const items = json.response.body.items || [];

    const activeSeoulAlerts = items
      .filter(item => isAlertActive(item) && isSeoulRelated(item))
      .map(parseApiItem);

    const status = buildAlertStatus(activeSeoulAlerts);

    dustAlertCache = { data: status, timestamp: Date.now() };
    return status;
  } catch (error) {
    console.error('AirKorea dust alert API fetch failed:', error);

    if (dustAlertCache) {
      console.warn('Serving stale dust alert data from cache');
      return dustAlertCache.data;
    }

    return buildAlertStatus([]);
  } finally {
    clearTimeout(timeoutId);
  }
}
