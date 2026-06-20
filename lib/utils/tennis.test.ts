import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildRecordSummary,
  calculateWinRate,
  formatCost,
  formatDuration,
  formatICSDate,
  formatPlayedAt,
  formatPlayedTime,
  formatScore,
  generateShareToken,
  inferResult,
  validateScore,
} from './tennis';
import type { GameRecord, MatchScore, SetScore } from '@/lib/constants/tennis';

/** Build a MatchScore from [my, opp] tuples, optional tb as a 3rd element [tbMy, tbOpp]. */
function score(...sets: Array<[number, number] | [number, number, [number, number]]>): MatchScore {
  return {
    sets: sets.map(([my, opp, tb]) => {
      const s: SetScore = { my, opp };
      if (tb) s.tb = { my: tb[0], opp: tb[1] };
      return s;
    }),
  };
}

// ---------------------------------------------------------------------------
// formatScore
// ---------------------------------------------------------------------------
describe('formatScore', () => {
  it('formats a single set without tiebreak', () => {
    expect(formatScore(score([6, 4]))).toBe('6-4');
  });

  it('joins multiple sets with ", "', () => {
    expect(formatScore(score([6, 4], [3, 6], [6, 2]))).toBe('6-4, 3-6, 6-2');
  });

  it('appends tiebreak score in parentheses', () => {
    expect(formatScore(score([7, 6, [7, 5]]))).toBe('7-6(7-5)');
  });

  it('mixes tiebreak and non-tiebreak sets', () => {
    expect(formatScore(score([6, 4], [6, 7, [5, 7]], [7, 6, [10, 8]]))).toBe('6-4, 6-7(5-7), 7-6(10-8)');
  });

  it('returns "-" for an empty sets array', () => {
    expect(formatScore({ sets: [] })).toBe('-');
  });

  it('returns "-" when sets is missing', () => {
    // The function uses optional chaining, so a malformed object is tolerated.
    expect(formatScore({} as MatchScore)).toBe('-');
  });

  it('returns "-" for null/undefined score', () => {
    expect(formatScore(null as unknown as MatchScore)).toBe('-');
    expect(formatScore(undefined as unknown as MatchScore)).toBe('-');
  });

  it('renders a 0-0 tiebreak object (tb is truthy even when its values are zero)', () => {
    expect(formatScore(score([7, 6, [0, 0]]))).toBe('7-6(0-0)');
  });
});

// ---------------------------------------------------------------------------
// validateScore
// ---------------------------------------------------------------------------
describe('validateScore', () => {
  it('accepts a valid single-set score', () => {
    expect(validateScore(score([6, 4]))).toEqual({ valid: true });
  });

  it('accepts a valid 5-set score (upper boundary)', () => {
    expect(validateScore(score([6, 4], [4, 6], [6, 3], [3, 6], [7, 5]))).toEqual({ valid: true });
  });

  it('accepts a 0-0 set (zero is a valid non-negative integer)', () => {
    expect(validateScore(score([0, 0]))).toEqual({ valid: true });
  });

  it('accepts a valid tiebreak', () => {
    expect(validateScore(score([7, 6, [7, 5]]))).toEqual({ valid: true });
  });

  it('accepts a tiebreak with 0-0 values', () => {
    expect(validateScore(score([7, 6, [0, 0]]))).toEqual({ valid: true });
  });

  it('rejects when sets is missing', () => {
    expect(validateScore({} as MatchScore)).toEqual({
      valid: false,
      error: '스코어 정보가 필요합니다.',
    });
  });

  it('rejects when sets is not an array', () => {
    expect(validateScore({ sets: 'nope' } as unknown as MatchScore)).toEqual({
      valid: false,
      error: '스코어 정보가 필요합니다.',
    });
  });

  it('rejects null/undefined score', () => {
    expect(validateScore(null as unknown as MatchScore)).toEqual({
      valid: false,
      error: '스코어 정보가 필요합니다.',
    });
    expect(validateScore(undefined as unknown as MatchScore)).toEqual({
      valid: false,
      error: '스코어 정보가 필요합니다.',
    });
  });

  it('rejects an empty sets array (lower boundary)', () => {
    expect(validateScore({ sets: [] })).toEqual({
      valid: false,
      error: '세트 수는 1~5개여야 합니다.',
    });
  });

  it('rejects more than 5 sets (upper boundary + 1)', () => {
    expect(validateScore(score([6, 0], [6, 0], [6, 0], [6, 0], [6, 0], [6, 0]))).toEqual({
      valid: false,
      error: '세트 수는 1~5개여야 합니다.',
    });
  });

  it('rejects a negative "my" score, identifying the set number (1-based)', () => {
    expect(validateScore(score([6, 4], [-1, 3]))).toEqual({
      valid: false,
      error: '2세트 내 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a non-integer "my" score', () => {
    expect(validateScore(score([6.5, 4]))).toEqual({
      valid: false,
      error: '1세트 내 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a NaN "my" score', () => {
    expect(validateScore({ sets: [{ my: Number.NaN, opp: 4 }] })).toEqual({
      valid: false,
      error: '1세트 내 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a negative "opp" score', () => {
    expect(validateScore(score([6, -2]))).toEqual({
      valid: false,
      error: '1세트 상대 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a non-integer "opp" score', () => {
    expect(validateScore(score([6, 4.2]))).toEqual({
      valid: false,
      error: '1세트 상대 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a negative tiebreak "my" value', () => {
    expect(validateScore({ sets: [{ my: 7, opp: 6, tb: { my: -1, opp: 5 } }] })).toEqual({
      valid: false,
      error: '1세트 타이브레이크 스코어가 올바르지 않습니다.',
    });
  });

  it('rejects a non-integer tiebreak "opp" value', () => {
    expect(validateScore({ sets: [{ my: 7, opp: 6, tb: { my: 7, opp: 5.5 } }] })).toEqual({
      valid: false,
      error: '1세트 타이브레이크 스코어가 올바르지 않습니다.',
    });
  });

  it('reports the first invalid set when several are bad', () => {
    expect(validateScore(score([-1, 0], [-2, 0]))).toEqual({
      valid: false,
      error: '1세트 내 스코어가 올바르지 않습니다.',
    });
  });
});

// ---------------------------------------------------------------------------
// inferResult
// ---------------------------------------------------------------------------
describe('inferResult', () => {
  it('infers a win when more sets are won', () => {
    expect(inferResult(score([6, 4], [6, 3]))).toBe('win');
  });

  it('infers a loss when more sets are lost', () => {
    expect(inferResult(score([4, 6], [3, 6]))).toBe('loss');
  });

  it('infers a draw on a one-set-each split', () => {
    expect(inferResult(score([6, 4], [4, 6]))).toBe('draw');
  });

  it('counts only sets won, ignoring games-difference', () => {
    // Win 2 sets narrowly, lose 1 set big — still a win on set count.
    expect(inferResult(score([7, 6], [7, 6], [0, 6]))).toBe('win');
  });

  it('treats a single tied set (e.g. 6-6) as a draw — neither side wins it', () => {
    // 6-6 contributes to neither mySetWins nor oppSetWins, so 0 === 0 -> draw.
    expect(inferResult(score([6, 6]))).toBe('draw');
  });

  it('treats an all-tied multi-set score as a draw', () => {
    expect(inferResult(score([6, 6], [3, 3]))).toBe('draw');
  });

  it('infers a win for a single set won', () => {
    expect(inferResult(score([6, 0]))).toBe('win');
  });

  it('infers a loss for a single set lost', () => {
    expect(inferResult(score([0, 6]))).toBe('loss');
  });

  it('returns null for an empty sets array', () => {
    expect(inferResult({ sets: [] })).toBeNull();
  });

  it('returns null for null/undefined/malformed score', () => {
    expect(inferResult(null as unknown as MatchScore)).toBeNull();
    expect(inferResult(undefined as unknown as MatchScore)).toBeNull();
    expect(inferResult({} as MatchScore)).toBeNull();
  });

  it('ignores the tiebreak field — set winner is decided by my vs opp only', () => {
    // my < opp in the set, even though tb my > tb opp -> counts as a lost set.
    expect(inferResult(score([6, 7, [9, 7]]))).toBe('loss');
  });
});

// ---------------------------------------------------------------------------
// calculateWinRate
// ---------------------------------------------------------------------------
describe('calculateWinRate', () => {
  it('returns 0 when total is 0 (divide-by-zero guard)', () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it('computes 100% when all matches are wins', () => {
    expect(calculateWinRate(10, 10)).toBe(100);
  });

  it('computes 0% when there are no wins', () => {
    expect(calculateWinRate(0, 5)).toBe(0);
  });

  it('computes 50%', () => {
    expect(calculateWinRate(5, 10)).toBe(50);
  });

  it('rounds to the nearest integer (1/3 -> 33)', () => {
    expect(calculateWinRate(1, 3)).toBe(33);
  });

  it('rounds half up (2/3 -> 67)', () => {
    expect(calculateWinRate(2, 3)).toBe(67);
  });

  it('rounds .5 up (1/8 = 12.5 -> 13)', () => {
    expect(calculateWinRate(1, 8)).toBe(13);
  });

  it('does not clamp wins greater than total (characterization)', () => {
    // No upper bound enforced — 3/2 = 150%.
    expect(calculateWinRate(3, 2)).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------
describe('formatDuration', () => {
  it('returns "-" for null', () => {
    expect(formatDuration(null)).toBe('-');
  });

  it('returns "-" for 0 minutes (falsy guard)', () => {
    expect(formatDuration(0)).toBe('-');
  });

  it('formats sub-hour durations as minutes only', () => {
    expect(formatDuration(45)).toBe('45분');
  });

  it('formats whole hours without minutes', () => {
    expect(formatDuration(120)).toBe('2시간');
  });

  it('formats hours and minutes together', () => {
    expect(formatDuration(90)).toBe('1시간 30분');
    expect(formatDuration(135)).toBe('2시간 15분');
  });

  it('formats exactly 60 minutes as 1 hour', () => {
    expect(formatDuration(60)).toBe('1시간');
  });
});

// ---------------------------------------------------------------------------
// formatCost
// ---------------------------------------------------------------------------
describe('formatCost', () => {
  it('returns "-" for null', () => {
    expect(formatCost(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatCost(undefined as unknown as number)).toBe('-');
  });

  it('returns "무료" for 0 (free)', () => {
    expect(formatCost(0)).toBe('무료');
  });

  it('formats a positive cost with ko-KR thousands separators and 원 suffix', () => {
    expect(formatCost(15000)).toBe('15,000원');
    expect(formatCost(1000000)).toBe('1,000,000원');
  });

  it('formats a small positive cost without separators', () => {
    expect(formatCost(500)).toBe('500원');
  });
});

// ---------------------------------------------------------------------------
// Date formatters — use explicit local datetime strings for determinism.
// ---------------------------------------------------------------------------
describe('formatPlayedAt', () => {
  it('formats a date with Korean weekday (Sunday)', () => {
    // 2026-02-15 is a Sunday.
    expect(formatPlayedAt('2026-02-15T09:30:00')).toBe('2026. 2. 15. (일)');
  });

  it('formats a date with Korean weekday (Wednesday)', () => {
    // 2026-06-17 is a Wednesday.
    expect(formatPlayedAt('2026-06-17T00:00:00')).toBe('2026. 6. 17. (수)');
  });

  it('does not zero-pad month or day', () => {
    expect(formatPlayedAt('2026-01-05T12:00:00')).toBe('2026. 1. 5. (월)');
  });
});

describe('formatPlayedTime', () => {
  it('zero-pads hours and minutes', () => {
    expect(formatPlayedTime('2026-06-17T09:05:00')).toBe('09:05');
  });

  it('formats midnight as 00:00', () => {
    expect(formatPlayedTime('2026-06-17T00:00:00')).toBe('00:00');
  });

  it('formats a late afternoon time', () => {
    expect(formatPlayedTime('2026-06-17T14:30:00')).toBe('14:30');
  });
});

describe('formatICSDate', () => {
  it('formats local datetime as YYYYMMDDThhmmss with zero-padding', () => {
    expect(formatICSDate('2026-02-08T14:00:00')).toBe('20260208T140000');
  });

  it('zero-pads single-digit month/day/seconds', () => {
    expect(formatICSDate('2026-01-05T09:05:07')).toBe('20260105T090507');
  });
});

// ---------------------------------------------------------------------------
// buildRecordSummary
// ---------------------------------------------------------------------------
describe('buildRecordSummary', () => {
  function record(overrides: Partial<GameRecord>): GameRecord {
    return {
      id: 'r1',
      user_id: 'u1',
      played_at: '2026-06-17T14:00:00',
      duration_minutes: 90,
      location_type: 'custom',
      court_id: null,
      court_name: '강남테니스장',
      district: '강남구',
      match_type: 'singles',
      match_format: '6game_1set',
      score: score([6, 4], [6, 3]),
      result: 'win',
      court_surface: 'hard',
      opponent_name: null,
      opponent_level: null,
      cost: null,
      notes: null,
      images: [],
      is_public: false,
      share_token: null,
      created_at: '2026-06-17T15:00:00',
      updated_at: '2026-06-17T15:00:00',
      ...overrides,
    };
  }

  it('joins date, court name and score with " | "', () => {
    const r = record({ opponent_name: null });
    expect(buildRecordSummary(r)).toBe('2026. 6. 17. (수) | 강남테니스장 | 6-4, 6-3');
  });

  it('appends "vs <opponent>" when opponent_name is present', () => {
    const r = record({ opponent_name: '홍길동' });
    expect(buildRecordSummary(r)).toBe('2026. 6. 17. (수) | 강남테니스장 | 6-4, 6-3 | vs 홍길동');
  });

  it('omits the opponent segment when opponent_name is an empty string', () => {
    const r = record({ opponent_name: '' });
    expect(buildRecordSummary(r)).toBe('2026. 6. 17. (수) | 강남테니스장 | 6-4, 6-3');
  });

  it('renders "-" for an empty score', () => {
    const r = record({ score: { sets: [] }, opponent_name: null });
    expect(buildRecordSummary(r)).toBe('2026. 6. 17. (수) | 강남테니스장 | -');
  });
});

// ---------------------------------------------------------------------------
// generateShareToken
// ---------------------------------------------------------------------------
describe('generateShareToken', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('produces a URL-safe base64url token with no padding/+//', () => {
    const token = generateShareToken();
    // 12 random bytes -> 16 base64 chars; trailing "=" padding is stripped.
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain('+');
    expect(token).not.toContain('/');
    expect(token).not.toContain('=');
  });

  it('encodes 12 bytes into 16 characters', () => {
    const token = generateShareToken();
    expect(token.length).toBe(16);
  });

  it('is deterministic given a stubbed crypto.getRandomValues', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView | null>(arr: T): T => {
      const view = arr as unknown as Uint8Array;
      for (let i = 0; i < view.length; i++) view[i] = i; // 0,1,2,...,11
      return arr;
    });

    const token = generateShareToken();
    // btoa of bytes 0..11, then base64url-cleaned. Compute the expected value the same way.
    const expected = btoa(String.fromCharCode(...Array.from({ length: 12 }, (_, i) => i)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(token).toBe(expected);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('produces different tokens across calls (real RNG)', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateShareToken()));
    expect(tokens.size).toBe(50);
  });
});
