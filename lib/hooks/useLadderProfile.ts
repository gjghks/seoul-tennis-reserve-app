import useSWR from 'swr';
import type { LadderProfile } from '@/lib/constants/ladder';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseLadderProfileOptions {
  enabled?: boolean;
}

export function useLadderProfile(options: UseLadderProfileOptions = {}) {
  const { enabled = true } = options;

  const { data, error, isLoading, mutate } = useSWR<{ profile: LadderProfile | null }>(
    enabled ? '/api/ladder/profile' : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    profile: data?.profile ?? null,
    isLoading,
    error,
    mutate,
  };
}
