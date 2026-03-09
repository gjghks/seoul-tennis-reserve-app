import useSWR from 'swr';
import type { EloHistoryEntry, LadderMatchType } from '@/lib/constants/ladder';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseEloHistoryOptions {
  userId?: string;
  matchType?: LadderMatchType;
  limit?: number;
  enabled?: boolean;
}

export function useEloHistory(options: UseEloHistoryOptions = {}) {
  const { userId, matchType = 'singles', limit = 30, enabled = true } = options;

  const params = new URLSearchParams({
    match_type: matchType,
    limit: String(limit),
  });
  if (userId) params.set('user_id', userId);

  const key = enabled && userId ? `/api/ladder/history?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ history: EloHistoryEntry[] }>(
    key,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    history: data?.history ?? [],
    isLoading,
    error,
    mutate,
  };
}
