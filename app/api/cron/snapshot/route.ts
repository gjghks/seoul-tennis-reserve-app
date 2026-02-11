import { NextResponse } from 'next/server';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { createServiceRoleClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const services = await fetchTennisAvailability();
    if (services.length === 0) {
      return NextResponse.json({ error: 'No data from Seoul API' }, { status: 502 });
    }

    const districtMap = new Map<string, { total: number; available: number; booked: number; free: number; paid: number }>();

    for (const svc of services) {
      const stats = districtMap.get(svc.AREANM) ?? { total: 0, available: 0, booked: 0, free: 0, paid: 0 };

      stats.total++;

      const status = svc.SVCSTATNM;
      if (status === '접수중' || status.includes('예약가능')) {
        stats.available++;
      } else {
        stats.booked++;
      }

      if (svc.PAYATNM === '무료') {
        stats.free++;
      } else {
        stats.paid++;
      }

      districtMap.set(svc.AREANM, stats);
    }

    const snapshotAt = new Date().toISOString();
    const rows = Array.from(districtMap.entries()).map(([district, stats]) => ({
      snapshot_at: snapshotAt,
      district,
      total_courts: stats.total,
      available_courts: stats.available,
      booked_courts: stats.booked,
      free_courts: stats.free,
      paid_courts: stats.paid,
    }));

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('reservation_snapshots').insert(rows);

    if (error) {
      console.error('Failed to insert snapshots:', error);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      districts: rows.length,
      totalCourts: services.length,
      snapshotAt,
    });
  } catch (err) {
    console.error('Snapshot cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
