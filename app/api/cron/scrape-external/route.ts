import { NextResponse } from 'next/server';
import { getIndependentCourts } from '@/lib/data/independentCourts';
import { SCRAPE_TARGETS, scrapeJungrangCourt } from '@/lib/scrapers/jungrangScraper';
import { FMCS_SCRAPE_TARGETS, scrapeFmcsCourt } from '@/lib/scrapers/fmcsScraper';
import { createServiceRoleClient } from '@/lib/supabaseServer';
import type { ScrapedCourtStatus } from '@/lib/scrapers/jungrangScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [jungrangResults, fmcsResults] = await Promise.all([
      Promise.allSettled(SCRAPE_TARGETS.map((target) => scrapeJungrangCourt(target))),
      Promise.allSettled(FMCS_SCRAPE_TARGETS.map((target) => scrapeFmcsCourt(target))),
    ]);

    const allResults = [...jungrangResults, ...fmcsResults];
    const allTargetIds = [
      ...SCRAPE_TARGETS.map((t) => t.svcId),
      ...FMCS_SCRAPE_TARGETS.map((t) => t.svcId),
    ];

    const courtMap = new Map(
      getIndependentCourts().map((court) => [court.SVCID, { name: court.SVCNM, district: court.AREANM }])
    );

    const fmcsDistrictMap = new Map(
      FMCS_SCRAPE_TARGETS.map((t) => [t.svcId, t.district])
    );

    const successfulResults = allResults
      .filter((result): result is PromiseFulfilledResult<ScrapedCourtStatus> => result.status === 'fulfilled')
      .map((result) => result.value);

    const failedResults = allResults
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return null;
        }

        return {
          svcId: allTargetIds[index],
          error: getErrorMessage(result.reason),
        };
      })
      .filter((result): result is { svcId: string; error: string } => result !== null);

    const upsertRows = successfulResults.map((result) => {
      const courtInfo = courtMap.get(result.svcId);
      const district = courtInfo?.district ?? fmcsDistrictMap.get(result.svcId) ?? '기타';

      return {
        svc_id: result.svcId,
        status: result.status,
        svc_name: courtInfo?.name ?? result.svcId,
        district,
        updated_at: result.scrapedAt,
      };
    });

    if (upsertRows.length > 0) {
      const supabase = createServiceRoleClient();
      const { error: upsertError } = await supabase
        .from('court_status_cache')
        .upsert(upsertRows, { onConflict: 'svc_id' });

      if (upsertError) {
        console.error('Failed to upsert scraped external statuses:', upsertError);
        return NextResponse.json({ error: 'DB write failed' }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      totalTargets: allTargetIds.length,
      scrapedCount: successfulResults.length,
      failedCount: failedResults.length,
      results: successfulResults,
      errors: failedResults,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Scrape external cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
