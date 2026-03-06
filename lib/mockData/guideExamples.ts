import type { MatchScore, MatchResult } from '@/lib/constants/tennis';

export const DEMO_SCORE_INITIAL: MatchScore = {
  sets: [{ my: 0, opp: 0 }],
};

export const DEMO_SCORE_FINAL: MatchScore = {
  sets: [
    { my: 6, opp: 4 },
    { my: 7, opp: 6, tb: { my: 7, opp: 5 } },
  ],
};

export const SCORE_ANIMATION_STEPS: Array<{
  delay: number;
  score: MatchScore;
}> = [
  {
    delay: 400,
    score: { sets: [{ my: 6, opp: 0 }] },
  },
  {
    delay: 800,
    score: { sets: [{ my: 6, opp: 4 }] },
  },
  {
    delay: 1400,
    score: { sets: [{ my: 6, opp: 4 }, { my: 0, opp: 0 }] },
  },
  {
    delay: 1900,
    score: { sets: [{ my: 6, opp: 4 }, { my: 7, opp: 0 }] },
  },
  {
    delay: 2400,
    score: { sets: [{ my: 6, opp: 4 }, { my: 7, opp: 6 }] },
  },
  {
    delay: 3000,
    score: { sets: [{ my: 6, opp: 4 }, { my: 7, opp: 6, tb: { my: 0, opp: 0 } }] },
  },
  {
    delay: 3500,
    score: { sets: [{ my: 6, opp: 4 }, { my: 7, opp: 6, tb: { my: 7, opp: 0 } }] },
  },
  {
    delay: 4000,
    score: { sets: [{ my: 6, opp: 4 }, { my: 7, opp: 6, tb: { my: 7, opp: 5 } }] },
  },
];

export const DEMO_STATS = {
  total_matches: 23,
  wins: 15,
  losses: 7,
  draws: 1,
  win_rate: 65,
  avg_cost: 12000,
  recent_form: ['win', 'win', 'loss', 'win', 'win'] as MatchResult[],
  current_streak: { type: 'win' as const, count: 3 },
  by_match_type: {
    singles: { total: 15, wins: 10 },
    mens_doubles: { total: 8, wins: 5 },
  } as Record<string, { total: number; wins: number }>,
  monthly_activity: [
    { month: '1월', total: 4, wins: 3 },
    { month: '2월', total: 6, wins: 4 },
    { month: '3월', total: 3, wins: 2 },
  ],
};

export const DEMO_OPPONENTS = [
  {
    name: '김테니',
    total: 5,
    wins: 3,
    losses: 2,
    draws: 0,
    winRate: 60,
    lastPlayed: '2026-03-01',
  },
  {
    name: '박서브',
    total: 4,
    wins: 1,
    losses: 3,
    draws: 0,
    winRate: 25,
    lastPlayed: '2026-02-20',
  },
  {
    name: '이발리',
    total: 3,
    wins: 2,
    losses: 0,
    draws: 1,
    winRate: 67,
    lastPlayed: '2026-02-15',
  },
];

export const DEMO_COURTS = [
  { name: '올림픽공원 테니스장', count: 8, wins: 6, winRate: 75 },
  { name: '잠실 테니스코트', count: 5, wins: 3, winRate: 60 },
  { name: '목동 테니스장', count: 4, wins: 2, winRate: 50 },
];

export const DEMO_TREND = [
  { month: '2025-10', winRate: 45, total: 3 },
  { month: '2025-11', winRate: 50, total: 4 },
  { month: '2025-12', winRate: 55, total: 5 },
  { month: '2026-01', winRate: 58, total: 4 },
  { month: '2026-02', winRate: 63, total: 6 },
  { month: '2026-03', winRate: 65, total: 3 },
];
