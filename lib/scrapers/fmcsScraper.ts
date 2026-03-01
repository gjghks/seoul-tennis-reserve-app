/**
 * FMCS (Facility Management Common System) Scraper
 *
 * Scrapes real-time reservation availability from FMCS-based facility management sites:
 * - 은평구시설관리공단 (efmc.or.kr)
 * - 동대문구시설관리공단 (dfmc.kr:8443)
 *
 * Both sites use the same FMCS REST API:
 *   POST /rest/facilities/place_month_state_list
 *     → Returns daily availability for a month
 *     → state_cd: 10=예약가능, 20=마감, 30=불가
 *
 * SSL bypass is required — both sites have incomplete certificate chains.
 */

import type { ScrapedCourtStatus } from './jungrangScraper';

const REQUEST_TIMEOUT_MS = 10_000;

export interface FmcsCourtConfig {
  svcId: string;
  baseUrl: string;        // e.g. 'https://www.efmc.or.kr' or 'https://www.dfmc.kr:8443'
  companyCode: string;    // FMCS company code
  partCode: string;       // FMCS part (facility category) code
  placeCode: string;      // FMCS place (court) code
  district: string;       // e.g. '은평구', '동대문구'
}

interface FmcsMonthStateItem {
  date: string;
  state_cd: string;    // '10'=available, '20'=closed, '30'=unavailable
  state_nm: string;    // human-readable state name
}

/**
 * FMCS scrape targets
 *
 * Codes discovered via the FMCS REST API hierarchy:
 *   /rest/common/company → /rest/common/part → /rest/common/place
 *
 * Eunpyeong (efmc.or.kr):
 *   EP001 은평구립테니스장: company=EFMC, part=07(테니스장), place=0701/0702/0703 (A/B/C코트)
 *   EP002 장미테니스장: company=EFMC04, part=01(테니스장), place=0101/0102 (A/B코트)
 *   EP003 선정테니스장: company=EFMC06, part=01(테니스장), place=0101/0102/0103/0104 (A~D코트)
 *
 * Dongdaemun (dfmc.kr:8443):
 *   DD002 이문체육문화센터: company=DFMC02, part=09(테니스장), place=0901/0902 (A/B코트)
 *   DD003 중랑천제1체육공원: company=DFMC09, part=03(테니스장), place=0301/0302 (1/2코트)
 */
export const FMCS_SCRAPE_TARGETS: FmcsCourtConfig[] = [
  // 은평구 - 은평구립테니스장 (3 courts → pick first court to determine day availability)
  {
    svcId: 'INDEP_EP001',
    baseUrl: 'https://www.efmc.or.kr',
    companyCode: 'EFMC',
    partCode: '07',
    placeCode: '0701',
    district: '은평구',
  },
  // 은평구 - 장미테니스장
  {
    svcId: 'INDEP_EP002',
    baseUrl: 'https://www.efmc.or.kr',
    companyCode: 'EFMC04',
    partCode: '01',
    placeCode: '0101',
    district: '은평구',
  },
  // 은평구 - 선정테니스장
  {
    svcId: 'INDEP_EP003',
    baseUrl: 'https://www.efmc.or.kr',
    companyCode: 'EFMC06',
    partCode: '01',
    placeCode: '0101',
    district: '은평구',
  },
  // 동대문구 - 이문체육문화센터
  {
    svcId: 'INDEP_DD002',
    baseUrl: 'https://www.dfmc.kr:8443',
    companyCode: 'DFMC02',
    partCode: '09',
    placeCode: '0901',
    district: '동대문구',
  },
  // 동대문구 - 중랑천제1체육공원
  {
    svcId: 'INDEP_DD003',
    baseUrl: 'https://www.dfmc.kr:8443',
    companyCode: 'DFMC09',
    partCode: '03',
    placeCode: '0301',
    district: '동대문구',
  },
];

function getTodayKstString(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getTodayKstDateString(): string {
  const yyyymmdd = getTodayKstString();
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function getFallbackResult(svcId: string, scrapedAt: string): ScrapedCourtStatus {
  return {
    svcId,
    status: '외부예약',
    availableSlots: 0,
    totalSlots: 0,
    scrapedAt,
  };
}

async function fmcsPost(baseUrl: string, path: string, params: Record<string, string>): Promise<unknown> {
  const url = `${baseUrl}${path}`;
  const body = new URLSearchParams(params).toString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // SSL bypass: efmc.or.kr and dfmc.kr:8443 have incomplete certificate chains
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`FMCS POST ${path} failed (${response.status})`);
    }

    return await response.json();
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
    clearTimeout(timeoutId);
  }
}

/**
 * Query monthly availability for a specific court/place
 */
async function getMonthState(config: FmcsCourtConfig): Promise<FmcsMonthStateItem[]> {
  const baseDate = getTodayKstString();

  const data = await fmcsPost(
    config.baseUrl,
    '/rest/facilities/place_month_state_list',
    {
      company_code: config.companyCode,
      part_code: config.partCode,
      place_code: config.placeCode,
      base_date: baseDate,
      rent_type: '1001',
      mem_no: '',
    },
  );

  if (!Array.isArray(data)) {
    throw new Error('Unexpected FMCS response format');
  }

  return data as FmcsMonthStateItem[];
}

/**
 * Scrape a single FMCS court's today availability
 */
export async function scrapeFmcsCourt(config: FmcsCourtConfig): Promise<ScrapedCourtStatus> {
  const scrapedAt = new Date().toISOString();

  try {
    const monthState = await getMonthState(config);
    const todayStr = getTodayKstDateString();

    const todayEntry = monthState.find((item) => item.date === todayStr);

    if (!todayEntry) {
      // Today not found in response — might be outside the month range
      return getFallbackResult(config.svcId, scrapedAt);
    }

    let status: string;
    switch (todayEntry.state_cd) {
      case '10':
        status = '접수중';
        break;
      case '20':
        status = '예약마감';
        break;
      case '30':
      default:
        status = '외부예약';
        break;
    }

    return {
      svcId: config.svcId,
      status,
      availableSlots: todayEntry.state_cd === '10' ? 1 : 0,
      totalSlots: 1,
      scrapedAt,
    };
  } catch (error) {
    console.error(`[FmcsScraper] Failed to scrape ${config.svcId}:`, error);
    return getFallbackResult(config.svcId, scrapedAt);
  }
}

/**
 * Scrape all FMCS courts (은평구 + 동대문구)
 */
export async function scrapeAllFmcsCourts(): Promise<ScrapedCourtStatus[]> {
  const results = await Promise.all(
    FMCS_SCRAPE_TARGETS.map((target) => scrapeFmcsCourt(target)),
  );
  return results;
}
