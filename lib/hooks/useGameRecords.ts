'use client';

import useSWR from 'swr';
import type { GameRecord, MatchType, MatchResult } from '@/lib/constants/tennis';

interface UseGameRecordsParams {
  matchType?: MatchType;
  result?: MatchResult;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

interface GameRecordsResponse {
  records: GameRecord[];
  total: number;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch records');
  return r.json();
});

export function useGameRecords(params: UseGameRecordsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.matchType) searchParams.set('match_type', params.matchType);
  if (params.result) searchParams.set('result', params.result);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const qs = searchParams.toString();
  const url = `/api/records${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<GameRecordsResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    records: data?.records ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
