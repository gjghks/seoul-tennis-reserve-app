import {
  LEGACY_SEARCH_ALGO_VERSION,
  SEARCH_ALGO_VERSION,
  type SearchRankingProfile,
} from '@/lib/utils/courtSearch';

export type SearchVariant = 'legacy' | 'v2';

interface SearchExperiment {
  variant: SearchVariant;
  rankingProfile: SearchRankingProfile;
  algoVersion: string;
}

const VARIANT_STORAGE_KEY = 'seoul-tennis.search.variant';
const ANON_ID_STORAGE_KEY = 'seoul-tennis.search.anon-id';

const SEARCH_ROLLOUT_PERCENT = Number(process.env.NEXT_PUBLIC_SEARCH_V2_ROLLOUT_PERCENT ?? '100');
const SEARCH_FORCE_VARIANT = process.env.NEXT_PUBLIC_SEARCH_V2_FORCE?.trim().toLowerCase();
const SEARCH_PROFILE = process.env.NEXT_PUBLIC_SEARCH_V2_PROFILE?.trim().toLowerCase();

const parseRolloutPercent = (): number => {
  if (Number.isNaN(SEARCH_ROLLOUT_PERCENT)) {
    return 100;
  }

  return Math.min(100, Math.max(0, SEARCH_ROLLOUT_PERCENT));
};

const getForcedVariant = (): SearchVariant | null => {
  if (SEARCH_FORCE_VARIANT === 'legacy' || SEARCH_FORCE_VARIANT === 'off' || SEARCH_FORCE_VARIANT === 'false') {
    return 'legacy';
  }
  if (SEARCH_FORCE_VARIANT === 'v2' || SEARCH_FORCE_VARIANT === 'on' || SEARCH_FORCE_VARIANT === 'true') {
    return 'v2';
  }

  return null;
};

const getRankingProfile = (): SearchRankingProfile => {
  if (SEARCH_PROFILE === 'precision' || SEARCH_PROFILE === 'recall' || SEARCH_PROFILE === 'balanced') {
    return SEARCH_PROFILE;
  }

  return 'balanced';
};

const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) + value.charCodeAt(i);
  }

  return Math.abs(hash);
};

const createAnonymousId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const resolveRolloutVariant = (): SearchVariant => {
  const rolloutPercent = parseRolloutPercent();
  if (rolloutPercent <= 0) {
    return 'legacy';
  }
  if (rolloutPercent >= 100) {
    return 'v2';
  }

  if (typeof window === 'undefined') {
    return 'v2';
  }

  const cached = window.localStorage.getItem(VARIANT_STORAGE_KEY);
  if (cached === 'legacy' || cached === 'v2') {
    return cached;
  }

  let anonId = window.localStorage.getItem(ANON_ID_STORAGE_KEY);
  if (!anonId) {
    anonId = createAnonymousId();
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, anonId);
  }

  const bucket = hashString(anonId) % 100;
  const variant: SearchVariant = bucket < rolloutPercent ? 'v2' : 'legacy';
  window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);

  return variant;
};

export const getSearchExperiment = (): SearchExperiment => {
  const forced = getForcedVariant();
  const variant = forced ?? resolveRolloutVariant();
  const rankingProfile = getRankingProfile();

  if (variant === 'legacy') {
    return {
      variant,
      rankingProfile,
      algoVersion: LEGACY_SEARCH_ALGO_VERSION,
    };
  }

  return {
    variant,
    rankingProfile,
    algoVersion: SEARCH_ALGO_VERSION,
  };
};
