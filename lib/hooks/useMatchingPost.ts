'use client';

import useSWR from 'swr';
import type { MatchPost } from '@/lib/constants/matching';

interface MatchingPostResponse {
  post: MatchPost;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch matching post');
  return r.json();
});

export function useMatchingPost(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MatchingPostResponse>(
    id ? `/api/matching/${id}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  return {
    post: data?.post ?? null,
    isLoading,
    error,
    mutate,
  };
}
