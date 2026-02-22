export type QueryScriptType = 'empty' | 'hangul' | 'latin' | 'number' | 'mixed' | 'other';

export type QueryLengthBucket = '0' | '1' | '2-3' | '4-6' | '7+';

export type SearchRankingProfile = 'balanced' | 'precision' | 'recall';

export const SEARCH_ALGO_VERSION = 'court-search-v2.2';

export const LEGACY_SEARCH_ALGO_VERSION = 'court-search-v1-legacy-substring';

interface ScoringProfile {
  placeWeight: number;
  districtWeight: number;
  nameMatchBoost: number;
  availabilityBoost: number;
}

interface SearchableCourt {
  SVCID: string;
  SVCNM?: string;
  PLACENM?: string;
  AREANM?: string;
  SVCSTATNM?: string;
}

interface RankedCourt<T> {
  court: T;
  score: number;
  isAvailable: boolean;
  index: number;
}

interface MatchTokens {
  normalized: string;
  compact: string;
  jamo: string;
  choseong: string;
}

export interface QueryFeatures {
  normalized: string;
  normalizedCompact: string;
  jamo: string;
  choseong: string;
  scriptType: QueryScriptType;
  length: number;
  lengthBucket: QueryLengthBucket;
  isChoseongOnly: boolean;
}

export interface RankCourtsOptions<T> {
  limit?: number;
  includeDistrict?: boolean;
  isAvailable?: (court: T) => boolean;
  profile?: SearchRankingProfile;
}

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const CHOSEONG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSEONG_LIST = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSEONG_LIST = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const SCORING_PROFILES: Record<SearchRankingProfile, ScoringProfile> = {
  balanced: {
    placeWeight: 0.72,
    districtWeight: 0.55,
    nameMatchBoost: 120,
    availabilityBoost: 15,
  },
  precision: {
    placeWeight: 0.65,
    districtWeight: 0.4,
    nameMatchBoost: 150,
    availabilityBoost: 10,
  },
  recall: {
    placeWeight: 0.8,
    districtWeight: 0.65,
    nameMatchBoost: 90,
    availabilityBoost: 20,
  },
};

const normalizeSearchText = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

const compactSearchText = (value: string): string =>
  normalizeSearchText(value).replace(/\s+/g, '');

const decomposeHangulToJamo = (value: string): string => {
  let result = '';

  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < HANGUL_BASE || code > HANGUL_END) {
      result += char;
      continue;
    }

    const offset = code - HANGUL_BASE;
    const choseongIndex = Math.floor(offset / 588);
    const jungseongIndex = Math.floor((offset % 588) / 28);
    const jongseongIndex = offset % 28;

    result += CHOSEONG_LIST[choseongIndex] + JUNGSEONG_LIST[jungseongIndex] + JONGSEONG_LIST[jongseongIndex];
  }

  return result;
};

const extractChoseong = (value: string): string => {
  let result = '';

  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code >= HANGUL_BASE && code <= HANGUL_END) {
      const offset = code - HANGUL_BASE;
      result += CHOSEONG_LIST[Math.floor(offset / 588)];
      continue;
    }

    if (/^[ㄱ-ㅎ]$/.test(char)) {
      result += char;
    }
  }

  return result;
};

const detectQueryScript = (query: string): QueryScriptType => {
  const compact = compactSearchText(query);
  if (!compact) {
    return 'empty';
  }

  const hasHangul = /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(compact);
  const hasLatin = /[a-z]/i.test(compact);
  const hasNumber = /\d/.test(compact);

  if (hasHangul && (hasLatin || hasNumber)) {
    return 'mixed';
  }
  if (hasHangul) {
    return 'hangul';
  }
  if (hasLatin && hasNumber) {
    return 'mixed';
  }
  if (hasLatin) {
    return 'latin';
  }
  if (hasNumber) {
    return 'number';
  }

  return 'other';
};

const getQueryLengthBucket = (length: number): QueryLengthBucket => {
  if (length <= 0) {
    return '0';
  }
  if (length === 1) {
    return '1';
  }
  if (length <= 3) {
    return '2-3';
  }
  if (length <= 6) {
    return '4-6';
  }

  return '7+';
};

export const getQueryFeatures = (query: string): QueryFeatures => {
  const normalized = normalizeSearchText(query);
  const normalizedCompact = compactSearchText(query);
  const jamo = decomposeHangulToJamo(normalizedCompact);
  const choseong = extractChoseong(normalizedCompact);

  return {
    normalized,
    normalizedCompact,
    jamo,
    choseong,
    scriptType: detectQueryScript(query),
    length: normalizedCompact.length,
    lengthBucket: getQueryLengthBucket(normalizedCompact.length),
    isChoseongOnly: normalizedCompact.length > 0 && /^[ㄱ-ㅎ]+$/.test(normalizedCompact),
  };
};

const getMatchTokens = (value: string | undefined): MatchTokens => {
  const normalized = normalizeSearchText(value ?? '');
  const compact = normalized.replace(/\s+/g, '');

  return {
    normalized,
    compact,
    jamo: decomposeHangulToJamo(compact),
    choseong: extractChoseong(compact),
  };
};

const scoreFieldMatch = (query: QueryFeatures, target: MatchTokens): number => {
  if (!target.compact || !query.normalizedCompact) {
    return 0;
  }

  let score = 0;

  if (target.compact === query.normalizedCompact) {
    score = Math.max(score, 1000);
  } else if (target.compact.startsWith(query.normalizedCompact)) {
    score = Math.max(score, 850);
  } else if (target.compact.includes(query.normalizedCompact)) {
    score = Math.max(score, 520);
  }

  if (target.normalized.startsWith(query.normalized)) {
    score = Math.max(score, 760);
  } else if (target.normalized.includes(query.normalized)) {
    score = Math.max(score, 460);
  }

  if (query.jamo) {
    if (target.jamo.startsWith(query.jamo)) {
      score = Math.max(score, 690);
    } else if (target.jamo.includes(query.jamo)) {
      score = Math.max(score, 430);
    }
  }

  if (query.isChoseongOnly && query.choseong) {
    if (target.choseong.startsWith(query.choseong)) {
      score = Math.max(score, 660);
    } else if (target.choseong.includes(query.choseong)) {
      score = Math.max(score, 400);
    }
  }

  return score;
};

export const rankCourtsByQuery = <T extends SearchableCourt>(
  courts: T[],
  query: string,
  options: RankCourtsOptions<T> = {},
): T[] => {
  const features = getQueryFeatures(query);
  if (!features.normalizedCompact) {
    return [];
  }

  const includeDistrict = options.includeDistrict ?? true;
  const isAvailable = options.isAvailable ?? ((court: T) => court.SVCSTATNM === '접수중' || (court.SVCSTATNM ?? '').includes('예약가능'));
  const limit = options.limit ?? courts.length;
  const profile = SCORING_PROFILES[options.profile ?? 'balanced'];

  const ranked: RankedCourt<T>[] = courts
    .map((court, index) => {
      const nameScore = scoreFieldMatch(features, getMatchTokens(court.SVCNM));
      const placeScore = scoreFieldMatch(features, getMatchTokens(court.PLACENM));
      const districtScore = includeDistrict ? scoreFieldMatch(features, getMatchTokens(court.AREANM)) : 0;

      let score = nameScore + Math.round(placeScore * profile.placeWeight) + Math.round(districtScore * profile.districtWeight);
      if (nameScore > 0) {
        score += profile.nameMatchBoost;
      }
      if (isAvailable(court)) {
        score += profile.availabilityBoost;
      }

      return {
        court,
        score,
        isAvailable: isAvailable(court),
        index,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }

      const nameCompare = (a.court.SVCNM ?? '').localeCompare((b.court.SVCNM ?? ''), 'ko');
      if (nameCompare !== 0) {
        return nameCompare;
      }

      const placeCompare = (a.court.PLACENM ?? '').localeCompare((b.court.PLACENM ?? ''), 'ko');
      if (placeCompare !== 0) {
        return placeCompare;
      }

      const idCompare = a.court.SVCID.localeCompare(b.court.SVCID);
      if (idCompare !== 0) {
        return idCompare;
      }

      return a.index - b.index;
    });

  return ranked.slice(0, limit).map((item) => item.court);
};
