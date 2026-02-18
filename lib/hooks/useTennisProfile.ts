'use client';

import useSWR from 'swr';
import type { PlayerProfile } from '@/lib/constants/tennis';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch profile');
  return r.json();
});

export function useTennisProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ profile: PlayerProfile | null }>(
    '/api/profile/tennis',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const updateProfile = async (profileData: Partial<PlayerProfile>) => {
    const res = await fetch('/api/profile/tennis', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || '프로필 업데이트에 실패했습니다.');
    }

    const result = await res.json();
    mutate(result, false);
    return result.profile;
  };

  return {
    profile: data?.profile ?? null,
    isLoading,
    error,
    mutate,
    updateProfile,
  };
}
