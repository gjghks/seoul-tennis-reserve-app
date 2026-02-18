'use client';

import useSWR from 'swr';
import type { RecordStats } from '@/lib/constants/tennis';

interface UseRecordStatsParams {
  from?: string;
  to?: string;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch stats');
  return r.json();
});

export function useRecordStats(params: UseRecordStatsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);

  const qs = searchParams.toString();
  const url = `/api/records/stats${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<{ stats: RecordStats }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    stats: data?.stats ?? null,
    isLoading,
    error,
    mutate,
  };
}
