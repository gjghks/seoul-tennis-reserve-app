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

export function useRecordStats(params: UseRecordStatsParams & { enabled?: boolean } = {}) {
  const { enabled = true, from, to } = params;
  const searchParams = new URLSearchParams();
  if (from) searchParams.set('from', from);
  if (to) searchParams.set('to', to);

  const qs = searchParams.toString();
  const url = enabled ? `/api/records/stats${qs ? `?${qs}` : ''}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ stats: RecordStats }>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    stats: data?.stats ?? null,
    isLoading: enabled ? isLoading : false,
    error,
    mutate,
  };
}
