import useSWR from 'swr';
import type { LeaderboardResponse, LadderMatchType } from '@/lib/constants/ladder';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseLeaderboardOptions {
  matchType?: LadderMatchType;
  district?: string;
  limit?: number;
  offset?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { matchType = 'singles', district, limit = 50, offset = 0 } = options;

  const params = new URLSearchParams({
    match_type: matchType,
    limit: String(limit),
    offset: String(offset),
  });
  if (district) params.set('district', district);

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    `/api/ladder?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );

  return {
    players: data?.players ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
