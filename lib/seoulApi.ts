const API_KEY = process.env.SEOUL_OPEN_DATA_KEY;
const BASE_URL = 'http://openAPI.seoul.go.kr:8088';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000] as const;

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

export async function fetchTennisAvailability(startIndex = 1, endIndex = 1000): Promise<SeoulService[]> {
    if (!API_KEY) {
        console.error('SEOUL_OPEN_DATA_KEY is missing');
        return [];
    }

    // API Format: KEY/TYPE/SERVICE/START_INDEX/END_INDEX/
    const url = `${BASE_URL}/${API_KEY}/json/ListPublicReservationSport/${startIndex}/${endIndex}/`;

    let lastError: unknown;

    for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
        const attempt = retryCount + 1;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const res = await fetch(url, {
                next: { revalidate: 300 },
                signal: controller.signal,
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch Seoul API: ${res.status}`);
            }

            const data: SeoulApiResponse = await res.json();

            if (!data.ListPublicReservationSport) {
                tennisDataCache = { data: [], timestamp: Date.now() };
                return [];
            }

            // Filter client-side for "테니스장" just in case, though usually we might fetch all and filter in logic
            // The API might allow filtering by name in arguments but the standard path is bulk fetch.
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
        } finally {
            clearTimeout(timeoutId);
        }
    }

    if (tennisDataCache) {
        console.warn('Serving stale tennis data from in-memory cache after Seoul API failures');
        return tennisDataCache.data;
    }

    console.error('Error fetching tennis availability:', lastError);
    throw lastError;
}
