import { NextResponse } from 'next/server';
import { computePopularCourts } from '@/lib/popularCourts';
import { createServiceRoleClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courts = await computePopularCourts();
    const updatedAt = new Date().toISOString();
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from('popular_courts_cache').upsert(
      {
        id: 1,
        data: courts,
        updated_at: updatedAt,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Failed to update popular courts cache:', error);
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, courts: courts.length, updatedAt });
  } catch (error) {
    console.error('Popular courts cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
