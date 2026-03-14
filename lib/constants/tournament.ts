export type TournamentFormat = 'single_elimination' | 'round_robin' | 'round_robin_playoff';
export type TournamentStatus = 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
export type TournamentMatchType =
  | 'singles'
  | 'mens_doubles'
  | 'womens_doubles'
  | 'mixed_doubles'
  | 'random_doubles';
export type ScoringFormat = 'games_4' | 'games_6' | 'pro_set_8' | 'tiebreak_10' | 'best_of_3';
export type DrawType = 'random' | 'seeded' | 'manual';
export type BracketMatchStatus = 'pending' | 'in_progress' | 'completed' | 'bye';

export interface Tournament {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  format: TournamentFormat;
  match_type: TournamentMatchType;
  scoring_format: ScoringFormat;
  no_ad_scoring: boolean;
  max_participants: number;
  status: TournamentStatus;
  share_token: string;
  is_public: boolean;
  draw_type: DrawType;
  play_date: string | null;
  location: string | null;
  district: string | null;
  court_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string | null;
  name: string;
  seed_number: number | null;
  partner_name: string | null;
  created_at: string;
}

export interface BracketScoreSet {
  participant1: number;
  participant2: number;
  tiebreak_participant1?: number;
  tiebreak_participant2?: number;
}

export interface BracketScore {
  sets: BracketScoreSet[];
  notes?: string;
}

export interface BracketMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  score: BracketScore | null;
  status: BracketMatchStatus;
  next_match_id: string | null;
  court_number: number | null;
  completed_at: string | null;
  created_at: string;
}

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  single_elimination: '싱글 엘리미네이션',
  round_robin: '라운드 로빈 (리그전)',
  round_robin_playoff: '라운드 로빈 + 결선',
};

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  draft: '임시저장',
  registration: '참가 모집',
  in_progress: '진행중',
  completed: '종료',
  cancelled: '취소',
};

export const TOURNAMENT_MATCH_TYPE_LABELS: Record<TournamentMatchType, string> = {
  singles: '단식',
  mens_doubles: '남복',
  womens_doubles: '여복',
  mixed_doubles: '혼복',
  random_doubles: '잡복',
};

export const SCORING_FORMAT_LABELS: Record<ScoringFormat, string> = {
  games_4: '4게임',
  games_6: '6게임',
  pro_set_8: '8게임 프로세트',
  tiebreak_10: '10포인트 타이브레이크',
  best_of_3: '3세트 매치',
};

export const DRAW_TYPE_LABELS: Record<DrawType, string> = {
  random: '랜덤',
  seeded: '시드 배정',
  manual: '수동 배정',
};

export const BRACKET_MATCH_STATUS_LABELS: Record<BracketMatchStatus, string> = {
  pending: '대기',
  in_progress: '진행중',
  completed: '완료',
  bye: '부전승',
};

export const MIN_PARTICIPANTS = 4;
export const MAX_PARTICIPANTS = 64;

export const VALID_TOURNAMENT_FORMATS: TournamentFormat[] = Object.keys(
  TOURNAMENT_FORMAT_LABELS
) as TournamentFormat[];
export const VALID_TOURNAMENT_STATUSES: TournamentStatus[] = Object.keys(
  TOURNAMENT_STATUS_LABELS
) as TournamentStatus[];
export const VALID_TOURNAMENT_MATCH_TYPES: TournamentMatchType[] = Object.keys(
  TOURNAMENT_MATCH_TYPE_LABELS
) as TournamentMatchType[];
export const VALID_SCORING_FORMATS: ScoringFormat[] = Object.keys(
  SCORING_FORMAT_LABELS
) as ScoringFormat[];
export const VALID_DRAW_TYPES: DrawType[] = Object.keys(DRAW_TYPE_LABELS) as DrawType[];
export const VALID_BRACKET_MATCH_STATUSES: BracketMatchStatus[] = Object.keys(
  BRACKET_MATCH_STATUS_LABELS
) as BracketMatchStatus[];

export const TOURNAMENT_FORMAT_OPTIONS = VALID_TOURNAMENT_FORMATS.map(k => ({
  value: k,
  label: TOURNAMENT_FORMAT_LABELS[k],
}));

export const TOURNAMENT_STATUS_OPTIONS = VALID_TOURNAMENT_STATUSES.map(k => ({
  value: k,
  label: TOURNAMENT_STATUS_LABELS[k],
}));

export const TOURNAMENT_MATCH_TYPE_OPTIONS = VALID_TOURNAMENT_MATCH_TYPES.map(k => ({
  value: k,
  label: TOURNAMENT_MATCH_TYPE_LABELS[k],
}));

export const SCORING_FORMAT_OPTIONS = VALID_SCORING_FORMATS.map(k => ({
  value: k,
  label: SCORING_FORMAT_LABELS[k],
}));

export const DRAW_TYPE_OPTIONS = VALID_DRAW_TYPES.map(k => ({
  value: k,
  label: DRAW_TYPE_LABELS[k],
}));
