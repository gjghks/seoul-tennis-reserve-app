import { NextResponse } from 'next/server';
import { getIndependentCourts } from '@/lib/data/independentCourts';
import { SCRAPE_TARGETS, scrapeJungrangCourt } from '@/lib/scrapers/jungrangScraper';
import { createServiceRoleClient } from '@/lib/supabaseServer';

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
    const scrapeResults = await Promise.allSettled(SCRAPE_TARGETS.map((target) => scrapeJungrangCourt(target)));

    const courtNameMap = new Map(
      getIndependentCourts().map((court) => [court.SVCID, court.SVCNM])
    );

    const successfulResults = scrapeResults
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeJungrangCourt>>> => result.status === 'fulfilled')
      .map((result) => result.value);

    const failedResults = scrapeResults
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return null;
        }

        return {
          svcId: SCRAPE_TARGETS[index]?.svcId,
          error: getErrorMessage(result.reason),
        };
      })
      .filter((result): result is { svcId: string; error: string } => result !== null);

    const upsertRows = successfulResults.map((result) => ({
      svc_id: result.svcId,
      status: result.status,
      svc_name: courtNameMap.get(result.svcId) ?? result.svcId,
      district: '중랑구',
      updated_at: result.scrapedAt,
    }));

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
      totalTargets: SCRAPE_TARGETS.length,
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
