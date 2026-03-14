'use client';

import useSWR from 'swr';
import type {
  BracketMatch,
  Tournament,
  TournamentFormat,
  TournamentMatchType,
  TournamentParticipant,
  TournamentStatus,
} from '@/lib/constants/tournament';

interface UseTournamentsParams {
  status?: TournamentStatus;
  format?: TournamentFormat;
  matchType?: TournamentMatchType;
  district?: string;
  my?: boolean;
  limit?: number;
  offset?: number;
}

interface TournamentsResponse {
  data: Tournament[];
  total: number;
}

interface TournamentResponse {
  tournament: Tournament;
  participants: TournamentParticipant[];
  matches: BracketMatch[];
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch tournaments');
  return r.json();
});

export function useTournaments(params: UseTournamentsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.format) searchParams.set('format', params.format);
  if (params.matchType) searchParams.set('match_type', params.matchType);
  if (params.district) searchParams.set('district', params.district);
  if (params.my) searchParams.set('my', 'true');
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const qs = searchParams.toString();
  const url = `/api/tournaments${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<TournamentsResponse>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    tournaments: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useTournament(id: string | null, shareToken?: string) {
  const searchParams = new URLSearchParams();
  if (shareToken) {
    searchParams.set('share_token', shareToken);
  }
  const qs = searchParams.toString();

  const { data, error, isLoading, mutate } = useSWR<TournamentResponse>(
    id ? `/api/tournaments/${id}${qs ? `?${qs}` : ''}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    tournament: data?.tournament ?? null,
    participants: data?.participants ?? [],
    matches: data?.matches ?? [],
    isLoading,
    error,
    mutate,
  };
}
