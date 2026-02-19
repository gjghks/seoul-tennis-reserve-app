import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import type { GameRecord, MatchType, MatchResult, RecordStats } from '@/lib/constants/tennis';
import { calculateWinRate } from '@/lib/utils/tennis';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({
      stats: {
        total_matches: 0, wins: 0, losses: 0, draws: 0,
        win_rate: 0, by_match_type: {}, monthly_activity: [],
        recent_form: [], avg_cost: null, most_played_court: null,
        opponents: [], current_streak: null, win_rate_trend: [],
      }
    });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('game_records')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false });

  if (from) {
    query = query.gte('played_at', from);
  }

  if (to) {
    query = query.lte('played_at', to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching records for stats:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  const records = (data || []) as GameRecord[];

  const wins = records.filter(r => r.result === 'win').length;
  const losses = records.filter(r => r.result === 'loss').length;
  const draws = records.filter(r => r.result === 'draw').length;
  const totalMatches = records.length;

  const byMatchType: RecordStats['by_match_type'] = {};
  for (const record of records) {
    const mt = record.match_type as MatchType;
    if (!byMatchType[mt]) {
      byMatchType[mt] = { total: 0, wins: 0 };
    }
    byMatchType[mt].total++;
    if (record.result === 'win') {
      byMatchType[mt].wins++;
    }
  }

  const now = new Date();
  const monthlyMap = new Map<string, { total: number; wins: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, { total: 0, wins: 0 });
  }
  for (const record of records) {
    const d = new Date(record.played_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthlyMap.get(key);
    if (entry) {
      entry.total++;
      if (record.result === 'win') {
        entry.wins++;
      }
    }
  }
  const monthlyActivity = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    total: data.total,
    wins: data.wins,
  }));

  const recentForm: MatchResult[] = records
    .slice(0, 10)
    .map(r => r.result);

  const costsWithValue = records
    .map(r => r.cost)
    .filter((c): c is number => c !== null && c !== undefined);
  const avgCost = costsWithValue.length > 0
    ? Math.round(costsWithValue.reduce((sum, c) => sum + c, 0) / costsWithValue.length)
    : null;

  const courtCounts = new Map<string, number>();
  for (const record of records) {
    const name = record.court_name;
    courtCounts.set(name, (courtCounts.get(name) || 0) + 1);
  }
  let mostPlayedCourt: RecordStats['most_played_court'] = null;
  let maxCount = 0;
  for (const [name, count] of courtCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostPlayedCourt = { name, count };
    }
  }

  const opponentStats = new Map<string, {
    total: number;
    wins: number;
    losses: number;
    draws: number;
    lastPlayed: string;
    displayName: string;
  }>();

  for (const record of records) {
    const name = record.opponent_name?.trim();
    if (!name) continue;

    const normalized = name.toLowerCase();
    const existing = opponentStats.get(normalized) || {
      total: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      lastPlayed: record.played_at,
      displayName: name,
    };

    existing.total++;
    if (record.result === 'win') existing.wins++;
    else if (record.result === 'loss') existing.losses++;
    else if (record.result === 'draw') existing.draws++;

    if (record.played_at > existing.lastPlayed) {
      existing.lastPlayed = record.played_at;
      existing.displayName = name;
    }

    opponentStats.set(normalized, existing);
  }

  const opponents = Array.from(opponentStats.entries())
    .map(([, data]) => ({
      name: data.displayName,
      displayName: data.displayName,
      total: data.total,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
      winRate: calculateWinRate(data.wins, data.total),
      lastPlayed: data.lastPlayed,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  let currentStreak = 0;
  let streakType: 'win' | 'loss' | null = null;

  for (const record of records) {
    if (record.result === 'win') {
      if (streakType === null || streakType === 'win') {
        streakType = 'win';
        currentStreak++;
      } else {
        break;
      }
    } else if (record.result === 'loss') {
      if (streakType === null || streakType === 'loss') {
        streakType = 'loss';
        currentStreak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const winRateTrend = monthlyActivity
    .filter((m) => m.total > 0)
    .map((m) => ({
      month: m.month,
      winRate: calculateWinRate(m.wins, m.total),
      total: m.total,
    }));

  const stats: RecordStats = {
    total_matches: totalMatches,
    wins,
    losses,
    draws,
    win_rate: calculateWinRate(wins, totalMatches),
    by_match_type: byMatchType,
    monthly_activity: monthlyActivity,
    recent_form: recentForm,
    avg_cost: avgCost,
    most_played_court: mostPlayedCourt,
    opponents,
    current_streak: currentStreak > 1 && streakType
      ? { type: streakType, count: currentStreak }
      : null,
    win_rate_trend: winRateTrend,
  };

  return NextResponse.json({ stats });
}
