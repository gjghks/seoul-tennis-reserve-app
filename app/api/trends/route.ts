import { NextRequest, NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'] as const;

type TimeSlot = (typeof TIME_SLOTS)[number];

interface HeatmapCell {
  avgBookingRate: number;
  sampleCount: number;
}

interface HeatmapInsights {
  bestTimeToBook: { day: string; timeSlot: string; avgRate: number };
  worstTimeToBook: { day: string; timeSlot: string; avgRate: number };
  weekdayAvg: number;
  weekendAvg: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const district = searchParams.get('district');
  const days = Math.min(Number(searchParams.get('days')) || 7, 30);
  const analysis = searchParams.get('analysis');

  const since = new Date();
  since.setDate(since.getDate() - days);

  const supabase = createAnonSupabaseClient();

  if (analysis === 'heatmap') {
    return handleHeatmapAnalysis(supabase, since, district);
  }

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

async function handleHeatmapAnalysis(
  supabase: ReturnType<typeof createAnonSupabaseClient>,
  since: Date,
  district: string | null,
) {
  let query = supabase
    .from('reservation_snapshots')
    .select('snapshot_at, total_courts, booked_courts, time_slot')
    .gte('snapshot_at', since.toISOString())
    .not('time_slot', 'is', null);

  if (district) {
    query = query.eq('district', district);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return NextResponse.json({ heatmap: {}, insights: null, hasData: false });
  }

  const buckets = new Map<string, { totalBooked: number; totalCourts: number; count: number }>();

  for (const row of rows) {
    const dayOfWeek = new Date(row.snapshot_at).getDay();
    const timeSlot = row.time_slot as TimeSlot;
    if (!TIME_SLOTS.includes(timeSlot)) continue;

    const key = `${dayOfWeek}_${timeSlot}`;
    const bucket = buckets.get(key) ?? { totalBooked: 0, totalCourts: 0, count: 0 };
    bucket.totalBooked += row.booked_courts;
    bucket.totalCourts += row.total_courts;
    bucket.count++;
    buckets.set(key, bucket);
  }

  const heatmap: Record<number, Record<string, HeatmapCell>> = {};

  for (let day = 0; day < 7; day++) {
    heatmap[day] = {};
    for (const slot of TIME_SLOTS) {
      const key = `${day}_${slot}`;
      const bucket = buckets.get(key);
      if (bucket && bucket.totalCourts > 0) {
        heatmap[day][slot] = {
          avgBookingRate: Math.round((bucket.totalBooked / bucket.totalCourts) * 100),
          sampleCount: bucket.count,
        };
      } else {
        heatmap[day][slot] = { avgBookingRate: 0, sampleCount: 0 };
      }
    }
  }

  let bestCell = { day: 0, slot: 'morning' as TimeSlot, rate: 100 };
  let worstCell = { day: 0, slot: 'morning' as TimeSlot, rate: 0 };
  let weekdayTotal = 0;
  let weekdayCount = 0;
  let weekendTotal = 0;
  let weekendCount = 0;

  for (let day = 0; day < 7; day++) {
    for (const slot of TIME_SLOTS) {
      const cell = heatmap[day][slot];
      if (cell.sampleCount === 0) continue;

      if (cell.avgBookingRate < bestCell.rate) {
        bestCell = { day, slot, rate: cell.avgBookingRate };
      }
      if (cell.avgBookingRate > worstCell.rate) {
        worstCell = { day, slot, rate: cell.avgBookingRate };
      }

      const isWeekend = day === 0 || day === 6;
      if (isWeekend) {
        weekendTotal += cell.avgBookingRate;
        weekendCount++;
      } else {
        weekdayTotal += cell.avgBookingRate;
        weekdayCount++;
      }
    }
  }

  const insights: HeatmapInsights = {
    bestTimeToBook: {
      day: DAY_NAMES[bestCell.day],
      timeSlot: bestCell.slot,
      avgRate: bestCell.rate,
    },
    worstTimeToBook: {
      day: DAY_NAMES[worstCell.day],
      timeSlot: worstCell.slot,
      avgRate: worstCell.rate,
    },
    weekdayAvg: weekdayCount > 0 ? Math.round(weekdayTotal / weekdayCount) : 0,
    weekendAvg: weekendCount > 0 ? Math.round(weekendTotal / weekendCount) : 0,
  };

  return NextResponse.json({ heatmap, insights, hasData: true });
}
