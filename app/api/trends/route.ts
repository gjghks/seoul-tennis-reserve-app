import { NextRequest, NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const district = searchParams.get('district');
  const days = Math.min(Number(searchParams.get('days')) || 7, 30);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const supabase = createAnonSupabaseClient();

  let query = supabase
    .from('reservation_snapshots')
    .select('snapshot_at, district, total_courts, available_courts, booked_courts, free_courts, paid_courts')
    .gte('snapshot_at', since.toISOString())
    .order('snapshot_at', { ascending: true });

  if (district) {
    query = query.eq('district', district);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Trends query error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }

  const snapshots = data ?? [];

  const districtLatest = new Map<string, {
    total: number;
    available: number;
    booked: number;
    bookingRate: number;
  }>();

  for (const row of snapshots) {
    districtLatest.set(row.district, {
      total: row.total_courts,
      available: row.available_courts,
      booked: row.booked_courts,
      bookingRate: row.total_courts > 0
        ? Math.round((row.booked_courts / row.total_courts) * 100)
        : 0,
    });
  }

  const currentRates = Array.from(districtLatest.entries())
    .map(([d, stats]) => ({ district: d, ...stats }))
    .sort((a, b) => b.bookingRate - a.bookingRate);

  return NextResponse.json({
    snapshots,
    currentRates,
    period: { from: since.toISOString(), to: new Date().toISOString(), days },
    hasHistory: snapshots.length >= 50,
  });
}
