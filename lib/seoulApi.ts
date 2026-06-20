import http from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { getIndependentCourts } from '@/lib/data/independentCourts';
import { getEnrichmentOperatingHours, getEnrichmentImageUrl } from '@/lib/data/facilityEnrichment';

const API_KEY = process.env.SEOUL_OPEN_DATA_KEY;
const BASE_URL = 'http://openAPI.seoul.go.kr:8088';
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [1_000, 2_000] as const;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (matches ISR revalidate interval)
const PAGE_SIZE = 1000;
const MAX_FETCHABLE_ROWS = 5000;
const INCLUDE_INDEPENDENT_COURTS = process.env.NODE_ENV !== 'test';
// Minimum Seoul-API tennis courts required before overwriting the durable snapshot —
// prevents persisting a degraded/sparse response (e.g. partial outage) over a good one.
const SNAPSHOT_MIN_SEOUL_COURTS = 10;

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

/**
 * Courts that Seoul API still lists but whose reservations actually use
 * independent (non-Seoul) systems.  The Seoul API entries show misleading
 * statuses like "접수중" even though yeyak.seoul.go.kr cannot accept bookings.
 * These are replaced by corrected entries in independentCourts.ts.
 */
const SEOUL_API_EXCLUDED_COURTS: ReadonlyArray<{ areanm: string; keyword: string }> = [
    { areanm: '도봉구', keyword: '다락원' },
];

function isExcludedSeoulApiCourt(court: SeoulService): boolean {
    return SEOUL_API_EXCLUDED_COURTS.some(
        excluded =>
            court.AREANM === excluded.areanm &&
            (court.PLACENM.includes(excluded.keyword) || court.SVCNM.includes(excluded.keyword))
    );
}

function mergeIndependentCourts(courts: SeoulService[]): SeoulService[] {
    if (!INCLUDE_INDEPENDENT_COURTS) {
        return courts;
    }

    const filtered = courts.filter(court => !isExcludedSeoulApiCourt(court));
    const independentCourts = getIndependentCourts();
    const existingIds = new Set(filtered.map(court => court.SVCID));
    return [...filtered, ...independentCourts.filter(court => !existingIds.has(court.SVCID))];
}

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

/**
 * Service-role Supabase client for the durable snapshot cache. Returns null in
 * tests and when env is unconfigured so callers degrade gracefully.
 */
function getServiceRoleClient() {
    if (process.env.NODE_ENV === 'test') return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Persist the last-good full court snapshot. Serves as a cross-instance fallback
 * when the Seoul API is down (survives cold starts / fresh deploys, unlike the
 * per-instance in-memory cache). Best-effort: never throws into the caller.
 */
async function persistSnapshot(courts: SeoulService[]): Promise<void> {
    try {
        const client = getServiceRoleClient();
        if (!client) return;
        const { error } = await client
            .from('tennis_snapshot_cache')
            .upsert(
                { id: true, snapshot: courts, court_count: courts.length, updated_at: new Date().toISOString() },
                { onConflict: 'id' },
            );
        if (error) console.error('Failed to persist tennis snapshot:', error.message);
    } catch (error) {
        console.error('Unexpected error persisting tennis snapshot:', error);
    }
}

/** Read the last-good durable snapshot. Returns null if absent/unconfigured. */
async function readSnapshot(): Promise<SeoulService[] | null> {
    try {
        const client = getServiceRoleClient();
        if (!client) return null;
        const { data, error } = await client
            .from('tennis_snapshot_cache')
            .select('snapshot')
            .eq('id', true)
            .maybeSingle();
        if (error || !data?.snapshot) return null;
        const snapshot = data.snapshot as SeoulService[];
        return Array.isArray(snapshot) && snapshot.length > 0 ? snapshot : null;
    } catch (error) {
        console.error('Unexpected error reading tennis snapshot:', error);
        return null;
    }
}

export async function fetchTennisAvailability(): Promise<SeoulService[]> {
    if (isCacheFresh()) {
        return tennisDataCache!.data;
    }

    if (!API_KEY) {
        console.error('SEOUL_OPEN_DATA_KEY is missing');
        return INCLUDE_INDEPENDENT_COURTS ? getIndependentCourts() : [];
    }

    let lastError: unknown;

    for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
        const attempt = retryCount + 1;

        try {
            const firstUrl = `${BASE_URL}/${API_KEY}/json/ListPublicReservationSport/1/${PAGE_SIZE}/`;
            const text = await httpGet(firstUrl, REQUEST_TIMEOUT_MS);

            let data: SeoulApiResponse;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(`Seoul API returned non-JSON response: ${text.slice(0, 200)}`);
            }

            if (!data.ListPublicReservationSport) {
                throw new Error('Seoul API response missing ListPublicReservationSport (possible error code or maintenance)');
            }

            const totalCount = data.ListPublicReservationSport.list_total_count;
            const allServices = [...data.ListPublicReservationSport.row];

            if (totalCount > PAGE_SIZE) {
                const cappedTotal = Math.min(totalCount, MAX_FETCHABLE_ROWS);
                const pagePromises: Promise<string>[] = [];

                for (let start = PAGE_SIZE + 1; start <= cappedTotal; start += PAGE_SIZE) {
                    const end = Math.min(start + PAGE_SIZE - 1, cappedTotal);
                    const pageUrl = `${BASE_URL}/${API_KEY}/json/ListPublicReservationSport/${start}/${end}/`;
                    pagePromises.push(httpGet(pageUrl, REQUEST_TIMEOUT_MS));
                }

                const results = await Promise.allSettled(pagePromises);

                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        try {
                            const pageData: SeoulApiResponse = JSON.parse(result.value);
                            if (pageData.ListPublicReservationSport?.row) {
                                allServices.push(...pageData.ListPublicReservationSport.row);
                            }
                        } catch {
                            console.warn('Seoul API: failed to parse additional page');
                        }
                    } else {
                        console.warn('Seoul API: additional page fetch failed:', result.reason);
                    }
                }
            }

            const tennisServices = allServices.filter(svc =>
                (svc.MINCLASSNM === '테니스장' || svc.SVCNM.includes('테니스')) &&
                SEOUL_DISTRICTS.includes(svc.AREANM)
            );

            const allCourts = mergeIndependentCourts(tennisServices);

            // Apply enrichment operating hours for courts with empty/missing V_MIN/V_MAX
            for (const court of allCourts) {
                if (!court.V_MIN && !court.V_MAX) {
                    const hours = getEnrichmentOperatingHours(court.SVCNM, court.AREANM, court.PLACENM);
                    if (hours) {
                        court.V_MIN = hours.start;
                        court.V_MAX = hours.end;
                    }
                }
            }

            for (const court of allCourts) {
                if (!court.IMGURL) {
                    const imageUrl = getEnrichmentImageUrl(court.SVCNM, court.AREANM, court.PLACENM);
                    if (imageUrl) {
                        court.IMGURL = imageUrl;
                    }
                }
                if (court.IMGURL && court.IMGURL.startsWith('http://')) {
                    court.IMGURL = court.IMGURL.replace('http://', 'https://');
                }
            }

            tennisDataCache = {
                data: allCourts,
                timestamp: Date.now(),
            };

            // Persist a durable cross-instance snapshot — ONLY when the Seoul API
            // returned a healthy set, so a degraded response never overwrites a good one.
            if (tennisServices.length >= SNAPSHOT_MIN_SEOUL_COURTS) {
                await persistSnapshot(allCourts);
            }

            return allCourts;
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
        return mergeIndependentCourts(tennisDataCache.data);
    }

    // Cross-instance fallback: serve the last-good durable snapshot (survives cold
    // starts / fresh deploys) before degrading to independent courts only.
    const snapshot = await readSnapshot();
    if (snapshot) {
        console.warn('Serving last-good durable snapshot from Supabase after Seoul API failures');
        return mergeIndependentCourts(snapshot);
    }

    console.error('Seoul API failed with no durable fallback. Returning independent courts only:', lastError);
    return INCLUDE_INDEPENDENT_COURTS ? getIndependentCourts() : [];
}

type CachedIndependentStatusRow = {
    svc_id: string;
    status: string;
    updated_at: string;
};

/**
 * Apply scraped statuses from court_status_cache to independent courts.
 * Gracefully returns original services if Supabase is unavailable.
 */
export async function applyScrapedStatuses(services: SeoulService[]): Promise<SeoulService[]> {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return services;
        }

        const twoHoursAgoIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );

        const { data, error } = await supabase
            .from('court_status_cache')
            .select('svc_id, status, updated_at')
            .like('svc_id', 'INDEP_%')
            .gte('updated_at', twoHoursAgoIso);

        if (error) {
            console.error('Failed to read scraped external statuses:', error);
            return services;
        }

        const rows = (data ?? []) as CachedIndependentStatusRow[];
        if (rows.length === 0) {
            return services;
        }

        const statusMap = new Map(rows.map((row) => [row.svc_id, row.status]));

        return services.map((service) => {
            const cachedStatus = statusMap.get(service.SVCID);
            if (!cachedStatus) {
                return service;
            }

            return {
                ...service,
                SVCSTATNM: cachedStatus,
            };
        });
    } catch (error) {
        console.error('Unexpected scraped status apply error:', error);
        return services;
    }
}

/**
 * Fetch tennis courts with scraped statuses applied.
 * Use this instead of fetchTennisAvailability() for all server components
 * and API routes that need accurate independent court statuses.
 */
export async function fetchTennisDataWithStatuses(): Promise<SeoulService[]> {
    const services = await fetchTennisAvailability();
    return applyScrapedStatuses(services);
}
