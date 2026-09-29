/**
 * FMCS (Facility Management Common System) Scraper
 *
 * Scrapes real-time reservation availability from FMCS-based facility management sites:
 * - 은평구시설관리공단 (efmc.or.kr)
 * - 동대문구시설관리공단 (dfmc.kr:8443)
 *
 * Both sites use the same FMCS REST API (REST root differs per site):
 *   efmc: POST https://www.efmc.or.kr/rest/facilities/place_month_state_list
 *   dfmc: POST https://www.dfmc.kr:8443/course/sports/rest/facilities/place_month_state_list
 *     → Returns daily availability for the calendar grid of base_date's month
 *     → state_cd: 10=예약가능, 20=마감/예약완료/예약불가/예약예정, 30=휴관일
 *       (20 + state_nm '예약예정' = booking not open yet → not '예약마감')
 *     → state_nm can be '마감' while state_cd is still '10' (today, after the
 *       same-day cutoff) — treat that as closed, not available.
 *
 * SSL bypass is required — both sites have incomplete certificate chains. It is
 * scoped to these requests via a dedicated https.Agent (see fmcsInsecureAgent).
 */

import https from 'node:https';
import type { ScrapedCourtStatus } from './jungrangScraper';

const REQUEST_TIMEOUT_MS = 10_000;

export interface FmcsCourtConfig {
  svcId: string;
  baseUrl: string;        // e.g. 'https://www.efmc.or.kr' or 'https://www.dfmc.kr:8443'
  restPath: string;       // REST root under baseUrl: '/rest' (efmc) or '/course/sports/rest' (dfmc)
  companyCode: string;    // FMCS company code
  partCode: string;       // FMCS part (facility category) code
  placeCodes: string[];   // FMCS place (court) codes — one per court, aggregated for today's status
  district: string;       // e.g. '은평구', '동대문구'
}

export interface FmcsMonthStateItem {
  date: string;
  state_cd: string;    // '10'=available, '20'=closed, '30'=unavailable
  state_nm: string;    // human-readable state name
}

/**
 * FMCS scrape targets
 *
 * Codes discovered via the FMCS REST API hierarchy:
 *   {restPath}/common/company → {restPath}/common/part → {restPath}/common/place
 *
 * Eunpyeong (efmc.or.kr):
 *   EP001 은평구립테니스장: company=EFMC, part=07(테니스장), place=0701/0702/0703 (A/B/C코트)
 *   EP002 장미테니스장: company=EFMC04, part=01(테니스장), place=0101/0102 (A/B코트)
 *   EP003 선정테니스장: company=EFMC06, part=01(테니스장), place=0101/0102/0103/0104 (A~D코트)
 *
 * Dongdaemun (dfmc.kr:8443, restPath=/course/sports/rest — /rest/... returns 404):
 *   DD002 이문체육문화센터: company=DFMC02, part=09(테니스장), place=3/4 (코트A/코트B)
 *   DD003 중랑천제1체육공원: company=DFMC09(중랑천체육시설), part=03(테니스장), place=2/3 (테니스[1코트]/[2코트])
 *   (verified 2026-09-29 via common/place; old codes 0901/0301 return {"error":true,"message":"오류"})
 */
export const FMCS_SCRAPE_TARGETS: FmcsCourtConfig[] = [
  // 은평구 - 은평구립테니스장 (3 courts → pick first court to determine day availability)
  {
    svcId: 'INDEP_EP001',
    baseUrl: 'https://www.efmc.or.kr',
    restPath: '/rest',
    companyCode: 'EFMC',
    partCode: '07',
    placeCodes: ['0701'],
    district: '은평구',
  },
  // 은평구 - 장미테니스장
  {
    svcId: 'INDEP_EP002',
    baseUrl: 'https://www.efmc.or.kr',
    restPath: '/rest',
    companyCode: 'EFMC04',
    partCode: '01',
    placeCodes: ['0101'],
    district: '은평구',
  },
  // 은평구 - 선정테니스장
  {
    svcId: 'INDEP_EP003',
    baseUrl: 'https://www.efmc.or.kr',
    restPath: '/rest',
    companyCode: 'EFMC06',
    partCode: '01',
    placeCodes: ['0101'],
    district: '은평구',
  },
  // 동대문구 - 이문체육문화센터 (코트A/B)
  {
    svcId: 'INDEP_DD002',
    baseUrl: 'https://www.dfmc.kr:8443',
    restPath: '/course/sports/rest',
    companyCode: 'DFMC02',
    partCode: '09',
    placeCodes: ['3', '4'],
    district: '동대문구',
  },
  // 동대문구 - 중랑천제1체육공원 (온라인 대관 1·2코트만)
  {
    svcId: 'INDEP_DD003',
    baseUrl: 'https://www.dfmc.kr:8443',
    restPath: '/course/sports/rest',
    companyCode: 'DFMC09',
    partCode: '03',
    placeCodes: ['2', '3'],
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

// efmc.or.kr and dfmc.kr:8443 serve incomplete certificate chains. Certificate
// verification is skipped ONLY for these requests through a dedicated agent — never
// via the process-wide NODE_TLS_REJECT_UNAUTHORIZED, which would also disable
// verification for every concurrent HTTPS request in the process (e.g. jungrangScraper).
const fmcsInsecureAgent = new https.Agent({ rejectUnauthorized: false });

function httpsPostForm(url: string, body: string, timeoutMs: number): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        agent: fmcsInsecureAgent,
        timeout: timeoutMs,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Content-Length': Buffer.byteLength(body),
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString('utf-8') }));
        res.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error('FMCS request timed out')));
    req.on('error', reject);
    req.end(body);
  });
}

async function fmcsPost(baseUrl: string, path: string, params: Record<string, string>): Promise<unknown> {
  const url = `${baseUrl}${path}`;
  const body = new URLSearchParams(params).toString();

  const { status, text } = await httpsPostForm(url, body, REQUEST_TIMEOUT_MS);
  if (status < 200 || status >= 300) {
    throw new Error(`FMCS POST ${path} failed (${status})`);
  }
  return JSON.parse(text);
}

/**
 * Query monthly availability for a specific court/place
 */
async function getMonthState(config: FmcsCourtConfig, placeCode: string): Promise<FmcsMonthStateItem[]> {
  const baseDate = getTodayKstString();

  const data = await fmcsPost(
    config.baseUrl,
    `${config.restPath}/facilities/place_month_state_list`,
    {
      company_code: config.companyCode,
      part_code: config.partCode,
      place_code: placeCode,
      base_date: baseDate,
      rent_type: '1001',
      mem_no: '',
    },
  );

  if (!Array.isArray(data)) {
    // Invalid codes come back as HTTP 200 {"error":true,"message":"오류"}
    throw new Error(`Unexpected FMCS response format: ${JSON.stringify(data).slice(0, 200)}`);
  }

  return data as FmcsMonthStateItem[];
}

type DayState = 'available' | 'closed' | 'unavailable';

function classifyDayState(entry: FmcsMonthStateItem): DayState {
  // state_cd '10' + state_nm '마감' = today after the same-day booking cutoff
  if (entry.state_cd === '10') {
    return entry.state_nm?.includes('마감') ? 'closed' : 'available';
  }
  if (entry.state_cd === '20') {
    // '예약예정' = booking window not open yet, not sold out
    return entry.state_nm?.includes('예정') ? 'unavailable' : 'closed';
  }
  return 'unavailable';
}

/**
 * Aggregate today's state across a facility's courts (one month-state list per court).
 * Returns null when today is missing from every list.
 */
export function resolveTodayStatus(
  monthStatesPerCourt: FmcsMonthStateItem[][],
  todayStr: string,
): Pick<ScrapedCourtStatus, 'status' | 'availableSlots' | 'totalSlots'> | null {
  const todayStates = monthStatesPerCourt
    .map((items) => items.find((item) => item.date === todayStr))
    .filter((item): item is FmcsMonthStateItem => item !== undefined)
    .map(classifyDayState);

  if (todayStates.length === 0) return null;

  const availableSlots = todayStates.filter((state) => state === 'available').length;
  let status = '외부예약';
  if (availableSlots > 0) {
    status = '접수중';
  } else if (todayStates.includes('closed')) {
    status = '예약마감';
  }

  return { status, availableSlots, totalSlots: todayStates.length };
}

/**
 * Scrape a single FMCS facility's today availability (all configured courts)
 */
export async function scrapeFmcsCourt(config: FmcsCourtConfig): Promise<ScrapedCourtStatus> {
  const scrapedAt = new Date().toISOString();

  try {
    // Promise.all: any court failing falls back to '외부예약' rather than a partial (possibly wrong) status
    const monthStates = await Promise.all(
      config.placeCodes.map((placeCode) => getMonthState(config, placeCode)),
    );
    const resolved = resolveTodayStatus(monthStates, getTodayKstDateString());

    if (!resolved) {
      // Today not found in response — might be outside the month range
      return getFallbackResult(config.svcId, scrapedAt);
    }

    return { svcId: config.svcId, ...resolved, scrapedAt };
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
