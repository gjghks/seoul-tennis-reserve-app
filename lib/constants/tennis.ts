export type MatchType = 'singles' | 'mens_doubles' | 'womens_doubles' | 'mixed_doubles';
export type MatchFormat = '4game_nodeuce' | '6game_1set' | '3set_match' | '8game_proset' | 'tiebreak' | 'custom';
export type MatchResult = 'win' | 'loss' | 'draw' | 'retired';
export type CourtSurface = 'hard' | 'clay' | 'artificial_grass' | 'grass' | 'indoor' | 'other';
export type LocationType = 'seoul_court' | 'custom';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type PreferredHand = 'right' | 'left' | 'both';
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus';

export interface SetScore {
  my: number;
  opp: number;
  tb?: { my: number; opp: number };
}

export interface MatchScore {
  sets: SetScore[];
}

export interface GameRecord {
  id: string;
  user_id: string;
  played_at: string;
  duration_minutes: number | null;
  location_type: LocationType;
  court_id: string | null;
  court_name: string;
  district: string | null;
  match_type: MatchType;
  match_format: MatchFormat;
  score: MatchScore;
  result: MatchResult;
  court_surface: CourtSurface | null;
  opponent_name: string | null;
  opponent_level: string | null;
  cost: number | null;
  notes: string | null;
  images: string[];
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerProfile {
  user_id: string;
  career_years: number | null;
  ntrp_rating: number | null;
  skill_level: SkillLevel | null;
  preferred_hand: PreferredHand | null;
  age_group: AgeGroup | null;
  created_at: string;
  updated_at: string;
}

export interface OpponentStats {
  name: string;
  displayName: string;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lastPlayed: string;
}

export interface RecordStats {
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  by_match_type: Partial<Record<MatchType, { total: number; wins: number }>>;
  monthly_activity: { month: string; total: number; wins: number }[];
  recent_form: MatchResult[];
  avg_cost: number | null;
  most_played_court: { name: string; count: number } | null;
  opponents: OpponentStats[];
  current_streak: { type: 'win' | 'loss'; count: number } | null;
  win_rate_trend: { month: string; winRate: number; total: number }[];
}

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  singles: '단식',
  mens_doubles: '남자복식',
  womens_doubles: '여자복식',
  mixed_doubles: '혼합복식',
};

export const MATCH_FORMAT_LABELS: Record<MatchFormat, string> = {
  '4game_nodeuce': '4게임 노듀스',
  '6game_1set': '6게임 1세트',
  '3set_match': '3세트 매치',
  '8game_proset': '8게임 프로세트',
  tiebreak: '타이브레이크',
  custom: '기타',
};

export const MATCH_RESULT_LABELS: Record<MatchResult, string> = {
  win: '승리',
  loss: '패배',
  draw: '무승부',
  retired: '기권',
};

export const COURT_SURFACE_LABELS: Record<CourtSurface, string> = {
  hard: '하드코트',
  clay: '클레이',
  artificial_grass: '인조잔디',
  grass: '잔디',
  indoor: '실내',
  other: '기타',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '상급',
  pro: '선수급',
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s_plus': '60대 이상',
};

export const PREFERRED_HAND_LABELS: Record<PreferredHand, string> = {
  right: '오른손',
  left: '왼손',
  both: '양손',
};

export const MATCH_TYPE_OPTIONS = (Object.keys(MATCH_TYPE_LABELS) as MatchType[]).map(k => ({
  value: k,
  label: MATCH_TYPE_LABELS[k],
}));

export const MATCH_FORMAT_OPTIONS = (Object.keys(MATCH_FORMAT_LABELS) as MatchFormat[]).map(k => ({
  value: k,
  label: MATCH_FORMAT_LABELS[k],
}));

export const MATCH_RESULT_OPTIONS = (Object.keys(MATCH_RESULT_LABELS) as MatchResult[]).map(k => ({
  value: k,
  label: MATCH_RESULT_LABELS[k],
}));

export const COURT_SURFACE_OPTIONS = (Object.keys(COURT_SURFACE_LABELS) as CourtSurface[]).map(k => ({
  value: k,
  label: COURT_SURFACE_LABELS[k],
}));

export const SKILL_LEVEL_OPTIONS = (Object.keys(SKILL_LEVEL_LABELS) as SkillLevel[]).map(k => ({
  value: k,
  label: SKILL_LEVEL_LABELS[k],
}));

export const AGE_GROUP_OPTIONS = (Object.keys(AGE_GROUP_LABELS) as AgeGroup[]).map(k => ({
  value: k,
  label: AGE_GROUP_LABELS[k],
}));

export const PREFERRED_HAND_OPTIONS = (Object.keys(PREFERRED_HAND_LABELS) as PreferredHand[]).map(k => ({
  value: k,
  label: PREFERRED_HAND_LABELS[k],
}));

export const CAREER_YEARS_OPTIONS = [
  ...Array.from({ length: 21 }, (_, i) => ({
    value: i,
    label: i === 0 ? '1년 미만' : `${i}년`,
  })),
  { value: 25, label: '20년 이상' },
];
