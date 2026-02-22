import http from 'node:http';

const API_KEY = process.env.SEOUL_OPEN_DATA_KEY;
const BASE_URL = 'http://openAPI.seoul.go.kr:8088';
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [1_000, 2_000] as const;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (matches ISR revalidate interval)

// 서울시 25개 구
const SEOUL_DISTRICTS = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
];

export interface SeoulService {
    SVCID: string;
    MAXCLASSNM: string; // e.g. "체육시설"
    MINCLASSNM: string; // e.g. "테니스장"
    SVCSTATNM: string; // e.g. "접수중", "예약마감"
    SVCNM: string; // Service Name
    PAYATNM: string; // Payment Method e.g. "유료", "무료"
    PLACENM: string; // Place Name
    USETGTINFO: string; // Target Audience
    SVCURL: string; // URL
    X: string; // Longitude
    Y: string; // Latitude
    SVCOPNBGNDT: string; // Service Open Begin Date
    SVCOPNENDDT: string; // Service Open End Date
    RCPTBGNDT: string; // Receipt Begin Date
    RCPTENDDT: string; // Receipt End Date
    AREANM: string; // Area Name e.g. "강남구"
    IMGURL: string; // Image URL
    DTLCONT: string; // Detail Content
    TELNO: string; // Tel No
    V_MIN: string; // Start Time
    V_MAX: string; // End Time
    REVSTDDAYNM: string; // Reservation Standard Day
    REVSTDDAY: string; // Reservation Standard Day Value
}

export interface SeoulApiResponse {
    ListPublicReservationSport?: {
        list_total_count: number;
        RESULT: {
            CODE: string;
            MESSAGE: string;
        };
        row: SeoulService[];
    };
}

interface TennisDataCache {
    data: SeoulService[];
    timestamp: number;
}

let tennisDataCache: TennisDataCache | null = null;

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCachedTennisData(): TennisDataCache | null {
    return tennisDataCache;
}

function isCacheFresh(): boolean {
    return !!tennisDataCache && (Date.now() - tennisDataCache.timestamp) < CACHE_TTL_MS;
}

/**
 * Raw HTTP GET using node:http — bypasses Next.js fetch patching
 * to avoid DYNAMIC_SERVER_USAGE errors during static generation.
 */
function httpGet(url: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: timeoutMs }, (res) => {
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                res.resume();
                reject(new Error(`Seoul API HTTP ${res.statusCode}`));
                return;
            }
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            res.on('error', reject);
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('Seoul API request timed out')); });
        req.on('error', reject);
    });
}

export async function fetchTennisAvailability(startIndex = 1, endIndex = 1000): Promise<SeoulService[]> {
    if (isCacheFresh()) {
        return tennisDataCache!.data;
    }

    if (!API_KEY) {
        console.error('SEOUL_OPEN_DATA_KEY is missing');
        return [];
    }

    const url = `${BASE_URL}/${API_KEY}/json/ListPublicReservationSport/${startIndex}/${endIndex}/`;

    let lastError: unknown;

    for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
        const attempt = retryCount + 1;

        try {
            const text = await httpGet(url, REQUEST_TIMEOUT_MS);

            let data: SeoulApiResponse;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(`Seoul API returned non-JSON response: ${text.slice(0, 200)}`);
            }

            if (!data.ListPublicReservationSport) {
                throw new Error('Seoul API response missing ListPublicReservationSport (possible error code or maintenance)');
            }

            const allServices = data.ListPublicReservationSport.row;

            const tennisServices = allServices.filter(svc =>
                (svc.MINCLASSNM === '테니스장' || svc.SVCNM.includes('테니스')) &&
                SEOUL_DISTRICTS.includes(svc.AREANM)
            );

            tennisDataCache = {
                data: tennisServices,
                timestamp: Date.now(),
            };

            return tennisServices;
        } catch (error) {
            lastError = error;
            console.error(`Seoul API attempt ${attempt} failed:`, error);

            if (retryCount < MAX_RETRIES) {
                await wait(RETRY_DELAYS_MS[retryCount]);
            }
        }
    }

    if (tennisDataCache) {
        console.warn('Serving stale tennis data from in-memory cache after Seoul API failures');
        return tennisDataCache.data;
    }

    console.error('Seoul API failed with no cache fallback. Returning empty array:', lastError);
    return [];
}
