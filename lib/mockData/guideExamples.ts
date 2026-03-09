import type { MatchScore, MatchResult } from '@/lib/constants/tennis';
import type { MatchPost } from '@/lib/constants/matching';
import type { CourtTransfer } from '@/lib/constants/transfers';
import { getEloTier } from '@/lib/constants/ladder';

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

export const DEMO_MATCHING_POSTS: MatchPost[] = [
  {
    id: 'demo-1',
    author_id: 'user-1',
    author_name: '테린이구함',
    play_date: '2026-03-15',
    play_time_start: '10:00',
    play_time_end: '12:00',
    location_type: 'seoul_court',
    court_id: null,
    court_name: '보라매공원 테니스장',
    district: '동작구',
    match_type: 'mens_doubles',
    ntrp_min: 2.0,
    ntrp_max: 3.5,
    skill_level: 'beginner',
    max_participants: 3,
    accepted_count: 1,
    cost_per_person: 5000,
    title: '주말 오전 즐겁게 치실 초보분들 모십니다',
    description: '서브 넣고 랠리 조금 되시는 분들이면 좋겠습니다.',
    contact_type: 'kakao',
    contact_info: null,
    status: 'open',
    created_at: '2026-03-09T10:00:00Z',
    updated_at: '2026-03-09T10:00:00Z',
  },
  {
    id: 'demo-2',
    author_id: 'user-2',
    author_name: '강스매시',
    play_date: '2026-03-16',
    play_time_start: '19:00',
    play_time_end: '21:00',
    location_type: 'custom',
    court_id: null,
    court_name: '장충테니스장',
    district: '중구',
    match_type: 'singles',
    ntrp_min: 3.5,
    ntrp_max: 4.5,
    skill_level: 'intermediate',
    max_participants: 1,
    accepted_count: 1,
    cost_per_person: 10000,
    title: '평일 저녁 단식 빡겜하실 분',
    description: '진지하게 단식 매치하실 중급자 1분 모십니다.',
    contact_type: null,
    contact_info: null,
    status: 'closed',
    created_at: '2026-03-08T10:00:00Z',
    updated_at: '2026-03-08T10:00:00Z',
  },
];

export const DEMO_ELO_TIERS = [
  getEloTier(900),
  getEloTier(1100),
  getEloTier(1300),
  getEloTier(1500),
  getEloTier(1700),
  getEloTier(1900),
];

export const DEMO_TRANSFERS: CourtTransfer[] = [
  {
    id: 'trans-1',
    seller_id: 'user-1',
    seller_name: '테니스러버',
    court_id: null,
    court_name: '양재시민의숲 테니스장',
    district: '서초구',
    play_date: '2026-03-20',
    play_time_start: '18:00',
    play_time_end: '20:00',
    original_price: 16000,
    asking_price: 16000,
    is_free: false,
    title: '양재 시민의숲 저녁시간 원가양도',
    description: '갑자기 야근이 잡혀서 원가 양도합니다.',
    status: 'available',
    buyer_id: null,
    buyer_name: null,
    created_at: '2026-03-09T08:00:00Z',
    updated_at: '2026-03-09T08:00:00Z',
  },
  {
    id: 'trans-2',
    seller_id: 'user-2',
    seller_name: '마음씨좋은분',
    court_id: null,
    court_name: '응봉공원 테니스장',
    district: '성동구',
    play_date: '2026-03-12',
    play_time_start: '08:00',
    play_time_end: '10:00',
    original_price: 8000,
    asking_price: 0,
    is_free: true,
    title: '응봉공원 아침 코트 무료나눔',
    description: '비가 올거같아서 그냥 무료로 나눔합니다 ㅠㅠ 칠수있으신분 가져가세요',
    status: 'completed',
    buyer_id: 'user-3',
    buyer_name: '행운아',
    created_at: '2026-03-08T15:00:00Z',
    updated_at: '2026-03-08T18:00:00Z',
  },
];

