import { describe, it, expect } from 'vitest';
import { estimateOpponentElo, DEFAULT_OPPONENT_ELO } from './elo';

// ntrpToElo is not exported; replicate its formula for assertion clarity:
// ELO = round(800 + (ntrp - 1.0) * 200)  =>  NTRP 1.0->800, 3.0->1200, 4.0->1400, 5.0->1600
const ntrpElo = (n: number) => Math.round(800 + (n - 1.0) * 200);

describe('elo: constants', () => {
  it('DEFAULT_OPPONENT_ELO is the neutral 1200 baseline', () => {
    expect(DEFAULT_OPPONENT_ELO).toBe(1200);
  });
});

describe('estimateOpponentElo: null/undefined/empty -> default 1200', () => {
  it('returns default for undefined (no argument)', () => {
    expect(estimateOpponentElo()).toBe(DEFAULT_OPPONENT_ELO);
  });

  it('returns default for explicit undefined', () => {
    expect(estimateOpponentElo(undefined)).toBe(1200);
  });

  it('returns default for null', () => {
    expect(estimateOpponentElo(null)).toBe(1200);
  });

  it('returns default for empty string', () => {
    expect(estimateOpponentElo('')).toBe(1200);
  });

  it('returns default for whitespace-only string', () => {
    expect(estimateOpponentElo('   ')).toBe(1200);
    expect(estimateOpponentElo('\t\n  ')).toBe(1200);
  });

  it('returns default for a non-string value cast through any (defensive typeof guard)', () => {
    // The function guards `typeof opponentLevel !== 'string'`; characterize that path.
    expect(estimateOpponentElo(123 as unknown as string)).toBe(1200);
    expect(estimateOpponentElo({} as unknown as string)).toBe(1200);
    expect(estimateOpponentElo([] as unknown as string)).toBe(1200);
    expect(estimateOpponentElo(true as unknown as string)).toBe(1200);
  });
});

describe('estimateOpponentElo: NTRP numeric mapping', () => {
  it('maps the documented anchor values exactly', () => {
    expect(estimateOpponentElo('1.0')).toBe(800);
    expect(estimateOpponentElo('3.0')).toBe(1200);
    expect(estimateOpponentElo('4.0')).toBe(1400);
    expect(estimateOpponentElo('5.0')).toBe(1600);
  });

  it('maps half-step NTRP values (round result is exact here)', () => {
    expect(estimateOpponentElo('1.5')).toBe(ntrpElo(1.5)); // 900
    expect(estimateOpponentElo('2.5')).toBe(1100);
    expect(estimateOpponentElo('3.5')).toBe(1300);
    expect(estimateOpponentElo('4.5')).toBe(1500);
  });

  it('parses NTRP embedded in free text with a prefix label', () => {
    expect(estimateOpponentElo('NTRP 3.0')).toBe(1200);
    expect(estimateOpponentElo('ntrp 4')).toBe(ntrpElo(4)); // 1400
    expect(estimateOpponentElo('NTRP3.5')).toBe(1300);
    expect(estimateOpponentElo('ntrp: 2.0')).toBe(1000);
  });

  it('accepts an integer NTRP without a decimal', () => {
    expect(estimateOpponentElo('3')).toBe(1200);
    expect(estimateOpponentElo('2')).toBe(1000);
    expect(estimateOpponentElo('7')).toBe(ntrpElo(7)); // 2000
  });

  it('matches the FIRST single digit (with optional one decimal) — regex is not multi-digit aware', () => {
    // "10" -> regex captures "1" -> NTRP 1.0 -> 800 (NOT 10, which would be out of range)
    expect(estimateOpponentElo('10')).toBe(800);
    // "3.55" -> captures "3.5" (one decimal place only) -> 1300
    expect(estimateOpponentElo('3.55')).toBe(1300);
    // leading text then number; first digit found wins
    expect(estimateOpponentElo('level 4 player')).toBe(ntrpElo(4)); // 1400
  });
});

describe('estimateOpponentElo: NTRP out-of-range falls through to keyword/default', () => {
  it('NTRP below 1.0 is rejected then falls through', () => {
    // "0.5" matches the regex as "0.5" but 0.5 < 1.0 -> not NTRP -> no keyword -> default
    expect(estimateOpponentElo('0.5')).toBe(1200);
    // bare "0" -> n=0 -> rejected -> default
    expect(estimateOpponentElo('0')).toBe(1200);
  });

  it('NTRP above 7.0 (as a single matched digit) cannot exceed 7 because only one digit is captured', () => {
    // "8" -> n=8 -> 8 > 7.0 -> rejected -> no keyword -> default
    expect(estimateOpponentElo('8')).toBe(1200);
    expect(estimateOpponentElo('9.0')).toBe(1200);
  });

  it('out-of-range number still defers to a Korean keyword that appears alongside it', () => {
    // "초급 0.5": regex matches "0.5" (rejected as NTRP), then 초급 -> 1000
    expect(estimateOpponentElo('초급 0.5')).toBe(1000);
    // "상급 8단": "8" rejected, 상급 -> 1600
    expect(estimateOpponentElo('상급 8단')).toBe(1600);
  });
});

describe('estimateOpponentElo: numeric match takes precedence over keywords', () => {
  it('an in-range digit anywhere wins even when a keyword is present', () => {
    // "중급 3.0" -> digit "3.0" matches first (in range) -> 1200 (happens to equal 중급's 1200)
    expect(estimateOpponentElo('중급 3.0')).toBe(1200);
    // "초급 4.5" -> digit "4.5" in range wins over 초급(1000) -> 1500
    expect(estimateOpponentElo('초급 4.5')).toBe(1500);
    // "선수 2.0" -> digit "2.0" wins over 선수(1600) -> 1000
    expect(estimateOpponentElo('선수 2.0')).toBe(1000);
  });
});

describe('estimateOpponentElo: Korean skill keywords', () => {
  it('초급 (beginner) -> 1000', () => {
    expect(estimateOpponentElo('초급')).toBe(1000);
  });

  it('입문 (entry) -> 1000', () => {
    expect(estimateOpponentElo('입문')).toBe(1000);
  });

  it('초보 (novice) -> 1000', () => {
    expect(estimateOpponentElo('초보')).toBe(1000);
  });

  it('중급 (intermediate) -> 1200 (equals default baseline)', () => {
    expect(estimateOpponentElo('중급')).toBe(1200);
  });

  it('중상 / 중상급 (upper-intermediate) -> 1400', () => {
    expect(estimateOpponentElo('중상')).toBe(1400);
    expect(estimateOpponentElo('중상급')).toBe(1400);
  });

  it('상급 (advanced) -> 1600', () => {
    expect(estimateOpponentElo('상급')).toBe(1600);
  });

  it('고급 (advanced/high) -> 1600', () => {
    expect(estimateOpponentElo('고급')).toBe(1600);
  });

  it('선수 (player/pro) -> 1600', () => {
    expect(estimateOpponentElo('선수')).toBe(1600);
  });
});

describe('estimateOpponentElo: 중상 ordering guard (must not mis-bucket as 중급/상급)', () => {
  it('중상급 matches the 중상 rule BEFORE the 중급 or 상급 rules', () => {
    // Contains both 중 (중급 substring start) and 상 (상급 substring start);
    // 중상 must win -> 1400, not 1200 (중급) nor 1600 (상급).
    expect(estimateOpponentElo('중상급')).toBe(1400);
    expect(estimateOpponentElo('중상')).toBe(1400);
  });

  it('plain 중급 still resolves to 1200 (no spurious 중상 match)', () => {
    expect(estimateOpponentElo('중급')).toBe(1200);
  });

  it('plain 상급 still resolves to 1600 (no spurious 중상 match)', () => {
    expect(estimateOpponentElo('상급')).toBe(1600);
  });
});

describe('estimateOpponentElo: English keywords (case-insensitive)', () => {
  it('beginner -> 1000 regardless of casing', () => {
    expect(estimateOpponentElo('beginner')).toBe(1000);
    expect(estimateOpponentElo('BEGINNER')).toBe(1000);
    expect(estimateOpponentElo('Beginner')).toBe(1000);
  });

  it('intermediate -> 1200', () => {
    expect(estimateOpponentElo('intermediate')).toBe(1200);
    expect(estimateOpponentElo('INTERMEDIATE')).toBe(1200);
  });

  it('advanced / expert / pro -> 1600 (case-insensitive)', () => {
    expect(estimateOpponentElo('advanced')).toBe(1600);
    expect(estimateOpponentElo('Expert')).toBe(1600);
    expect(estimateOpponentElo('PRO')).toBe(1600);
  });
});

describe('estimateOpponentElo: whitespace and casing tolerance', () => {
  it('trims surrounding whitespace before evaluating', () => {
    expect(estimateOpponentElo('  초급  ')).toBe(1000);
    expect(estimateOpponentElo('\t상급\n')).toBe(1600);
    expect(estimateOpponentElo('   3.0   ')).toBe(1200);
  });

  it('keyword can appear anywhere within a longer phrase', () => {
    expect(estimateOpponentElo('완전 초급입니다')).toBe(1000);
    expect(estimateOpponentElo('동호회 상급 회원')).toBe(1600);
    expect(estimateOpponentElo('아마 중상 정도')).toBe(1400);
  });
});

describe('estimateOpponentElo: unknown/unmatched input -> default 1200', () => {
  it('returns default for arbitrary text with no recognizable signal', () => {
    expect(estimateOpponentElo('hello world')).toBe(1200);
    expect(estimateOpponentElo('모름')).toBe(1200);
    expect(estimateOpponentElo('???')).toBe(1200);
    expect(estimateOpponentElo('잘 모르겠음')).toBe(1200);
  });

  it('pro keyword embedded as substring of "professional" still triggers (regex is substring-based)', () => {
    // 'pro' regex has no word boundary -> "professional" contains "pro" -> 1600.
    expect(estimateOpponentElo('professional')).toBe(1600);
  });
});

describe('estimateOpponentElo: determinism & purity', () => {
  it('is pure — repeated calls with the same input return the same value', () => {
    const inputs = ['초급', 'NTRP 4.0', '중상급', null, '', 'garbage'];
    for (const input of inputs) {
      const first = estimateOpponentElo(input);
      const second = estimateOpponentElo(input);
      expect(second).toBe(first);
    }
  });

  it('does not mutate the input string', () => {
    const input = '  상급  ';
    estimateOpponentElo(input);
    expect(input).toBe('  상급  ');
  });
});
