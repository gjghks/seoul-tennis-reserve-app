import { NextResponse } from 'next/server';
import { PopularCourt } from '@/lib/popularCourts';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type PopularCourtsCacheRow = {
  data: PopularCourt[] | null;
  updated_at: string | null;
};

export async function GET() {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase
    .from('popular_courts_cache')
    .select('data, updated_at')
    .eq('id', 1)
    .single();

  if (!error && data) {
    const cacheRow = data as PopularCourtsCacheRow;
    if (Array.isArray(cacheRow.data) && cacheRow.data.length > 0) {
      return NextResponse.json({
        courts: cacheRow.data,
        updatedAt: cacheRow.updated_at,
      });
    }
  }

  // Return empty array instead of running expensive computePopularCourts().
  // The cron job (/api/cron/popular-courts) will populate the cache.
  return NextResponse.json({ courts: [], updatedAt: null });
}
