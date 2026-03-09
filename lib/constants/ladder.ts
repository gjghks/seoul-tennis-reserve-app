export const ELO_INITIAL = 1200;
export const ELO_FLOOR = 800;
export const ELO_PROVISIONAL_THRESHOLD = 15;
export const LEADERBOARD_MIN_MATCHES = 5;
export const LEADERBOARD_PAGE_SIZE = 50;
export const LEADERBOARD_INACTIVE_DAYS = 180;

export type LadderMatchType = 'singles' | 'doubles';

export interface LeaderboardPlayer {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  ntrp_rating: number | null;
  skill_level: string | null;
  primary_district: string | null;
  elo: number;
  matches_played: number;
  peak_elo: number;
  last_match_at: string | null;
  is_provisional: boolean;
  rank: number;
}

export interface LeaderboardResponse {
  players: LeaderboardPlayer[];
  total: number;
}

export interface EloHistoryEntry {
  id: number;
  user_id: string;
  game_record_id: string | null;
  match_type: LadderMatchType;
  elo_before: number;
  elo_after: number;
  elo_change: number;
  opponent_elo: number | null;
  result: 'win' | 'loss' | 'draw';
  created_at: string;
}

export interface EloCalculationResult {
  elo_before: number;
  elo_after: number;
  elo_change: number;
  peak_elo: number;
  k_factor: number;
  matches_played: number;
  is_provisional: boolean;
}

export interface LadderProfile {
  singles_elo: number;
  doubles_elo: number;
  singles_matches: number;
  doubles_matches: number;
  singles_peak_elo: number;
  doubles_peak_elo: number;
  primary_district: string | null;
  ladder_opt_in: boolean;
  last_match_at: string | null;
}

export const ELO_TIER_LABELS: Record<string, string> = {
  beginner: '입문',
  learning: '초급',
  recreational: '중급',
  club: '클럽',
  competitive: '상급',
  advanced: '고수',
};

export function getEloTier(elo: number): { key: string; label: string; color: string } {
  if (elo < 1000) return { key: 'beginner', label: '입문', color: '#9ca3af' };
  if (elo < 1200) return { key: 'learning', label: '초급', color: '#60a5fa' };
  if (elo < 1400) return { key: 'recreational', label: '중급', color: '#34d399' };
  if (elo < 1600) return { key: 'club', label: '클럽', color: '#fbbf24' };
  if (elo < 1800) return { key: 'competitive', label: '상급', color: '#f97316' };
  return { key: 'advanced', label: '고수', color: '#ef4444' };
}

export const LADDER_MATCH_TYPE_LABELS: Record<LadderMatchType, string> = {
  singles: '단식',
  doubles: '복식',
};
