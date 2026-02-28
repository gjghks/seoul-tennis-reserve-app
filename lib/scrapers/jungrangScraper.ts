export interface ScrapedCourtStatus {
  svcId: string;
  status: string;
  availableSlots: number;
  totalSlots: number;
  scrapedAt: string;
}

export interface CourtScrapeConfig {
  svcId: string;
  url: string;
  format: 'jnrent2' | 'myeonmok';
}

const REQUEST_TIMEOUT_MS = 8_000;

export const SCRAPE_TARGETS: CourtScrapeConfig[] = [
  {
    svcId: 'INDEP_JN001',
    url: 'https://jnrent2.jungnangimc.or.kr/page/rent/s01.od.list.php',
    format: 'jnrent2',
  },
  {
    svcId: 'INDEP_JN002',
    url: 'https://jnrent2.jungnangimc.or.kr/page/rent/s02.od.list.php',
    format: 'jnrent2',
  },
  {
    svcId: 'INDEP_JN003',
    url: 'https://tennis.jungnangimc.or.kr/page/rent/s01.od.list.php',
    format: 'myeonmok',
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTodayKstLabel(): string {
  const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const month = String(nowKst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(nowKst.getUTCDate()).padStart(2, '0');
  return `${month}.${day}`;
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

function findTodayCell(html: string, todayLabel: string): string | null {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*tbl_scm1[^"']*["'][^>]*>[\s\S]*?<\/table>/i);
  const source = tableMatch?.[0] ?? html;
  const tdMatches = source.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) ?? [];
  const datePattern = new RegExp(`<h6[^>]*>\\s*${escapeRegex(todayLabel)}\\s*<\\/h6>`, 'i');

  for (const td of tdMatches) {
    if (datePattern.test(td)) {
      return td;
    }
  }

  return null;
}

function parseJnrent2Cell(tdHtml: string): Pick<ScrapedCourtStatus, 'status' | 'availableSlots' | 'totalSlots'> {
  const normalMatches = tdHtml.match(/fn_cote_odchk1\s*\(/g) ?? [];
  const waitMatches = tdHtml.match(/fn_wait_cote_odchk1\s*\(/g) ?? [];
  const availableSlots = normalMatches.length + waitMatches.length;
  const liMatches = tdHtml.match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
  const totalSlots = liMatches.length > 0 ? liMatches.length : availableSlots;

  return {
    status: availableSlots > 0 ? '접수중' : '외부예약',
    availableSlots,
    totalSlots,
  };
}

function parseMyeonmokCell(tdHtml: string): Pick<ScrapedCourtStatus, 'status' | 'availableSlots' | 'totalSlots'> {
  const availableSlots = (tdHtml.match(/<span[^>]*class=["'][^"']*status_y[^"']*["'][^>]*>[\s\S]*?<\/span>/gi) ?? []).length;
  const closedSlots = (tdHtml.match(/<span[^>]*class=["'][^"']*status_e[^"']*["'][^>]*>[\s\S]*?<\/span>/gi) ?? []).length;
  const totalSlots = availableSlots + closedSlots;

  let status: ScrapedCourtStatus['status'] = '외부예약';
  if (availableSlots > 0) {
    status = '접수중';
  } else if (totalSlots > 0 && closedSlots === totalSlots) {
    status = '예약마감';
  }

  return {
    status,
    availableSlots,
    totalSlots,
  };
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch external page (${response.status})`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function scrapeJungrangCourt(config: CourtScrapeConfig): Promise<ScrapedCourtStatus> {
  const scrapedAt = new Date().toISOString();

  try {
    const html = await fetchHtml(config.url);
    const todayCell = findTodayCell(html, getTodayKstLabel());
    if (!todayCell) {
      return getFallbackResult(config.svcId, scrapedAt);
    }

    const parsed = config.format === 'jnrent2' ? parseJnrent2Cell(todayCell) : parseMyeonmokCell(todayCell);

    return {
      svcId: config.svcId,
      status: parsed.status,
      availableSlots: parsed.availableSlots,
      totalSlots: parsed.totalSlots,
      scrapedAt,
    };
  } catch (error) {
    console.error(`[JungrangScraper] Failed to scrape ${config.svcId}:`, error);
    return getFallbackResult(config.svcId, scrapedAt);
  }
}

export async function scrapeAllJungrangCourts(): Promise<ScrapedCourtStatus[]> {
  const results = await Promise.all(SCRAPE_TARGETS.map((target) => scrapeJungrangCourt(target)));
  return results;
}
