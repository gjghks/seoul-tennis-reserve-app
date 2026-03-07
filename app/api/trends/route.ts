import { NextRequest, NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

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

  const rpcParams: { p_since: string; p_district?: string } = {
    p_since: since.toISOString(),
  };
  if (district) {
    rpcParams.p_district = district;
  }

  const { data: trendsData, error: trendsError } = await supabase.rpc('get_daily_trends', rpcParams);

  if (trendsError) {
    console.error('Daily trends query error:', trendsError);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }

  const dailyTrends = (trendsData ?? []) as Array<{
    day: string;
    total_courts: number;
    available_courts: number;
    booked_courts: number;
    booking_rate: number;
  }>;

  return NextResponse.json({
    dailyTrends,
    period: { from: since.toISOString(), to: new Date().toISOString(), days },
    hasHistory: dailyTrends.length >= 2,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  });
}

async function handleHeatmapAnalysis(
  supabase: ReturnType<typeof createAnonSupabaseClient>,
  since: Date,
  district: string | null,
) {
  const rpcParams: { p_since: string; p_district?: string } = {
    p_since: since.toISOString(),
  };
  if (district) {
    rpcParams.p_district = district;
  }

  const { data, error } = await supabase.rpc('get_heatmap_data', rpcParams);

  if (error) {
    console.error('Heatmap query error:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
  }

  const rows = (data ?? []) as Array<{
    day_of_week: number;
    time_slot: string;
    avg_booking_rate: number;
    sample_count: number;
  }>;

  if (rows.length === 0) {
    return NextResponse.json({ heatmap: {}, insights: null, hasData: false }, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    });
  }

  const heatmap: Record<number, Record<string, HeatmapCell>> = {};

  for (let day = 0; day < 7; day++) {
    heatmap[day] = {};
    for (const slot of TIME_SLOTS) {
      heatmap[day][slot] = { avgBookingRate: 0, sampleCount: 0 };
    }
  }

  for (const row of rows) {
    if (heatmap[row.day_of_week]?.[row.time_slot]) {
      heatmap[row.day_of_week][row.time_slot] = {
        avgBookingRate: row.avg_booking_rate,
        sampleCount: row.sample_count,
      };
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

  return NextResponse.json({ heatmap, insights, hasData: true }, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  });
}
