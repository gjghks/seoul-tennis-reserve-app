'use client';

import useSWR from 'swr';
import type { MatchPost, MatchPostStatus } from '@/lib/constants/matching';
import type { MatchType } from '@/lib/constants/tennis';

interface UseMatchingPostsParams {
  district?: string;
  matchType?: MatchType;
  status?: MatchPostStatus;
  date?: string;
  my?: boolean;
  limit?: number;
  offset?: number;
}

interface MatchingPostsResponse {
  posts: MatchPost[];
  total: number;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch matching posts');
  return r.json();
});

export function useMatchingPosts(params: UseMatchingPostsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.my) searchParams.set('my', 'true');
  if (params.district) searchParams.set('district', params.district);
  if (params.matchType) searchParams.set('match_type', params.matchType);
  if (params.status) searchParams.set('status', params.status);
  if (params.date) searchParams.set('date', params.date);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const qs = searchParams.toString();
  const url = `/api/matching${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<MatchingPostsResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  return {
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
