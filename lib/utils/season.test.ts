import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectSeasonByDate,
  resolveSeason,
  isValidSeason,
  nextSeason,
  SEASON_ORDER,
  type Season,
} from './season';
import { APPEARANCE_INIT_SCRIPT } from './appearanceInitScript';

/** Build a local Date for the given 1-12 month / day (year is arbitrary, non-wrapping). */
function d(month: number, day: number, year = 2026): Date {
  return new Date(year, month - 1, day);
}

describe('detectSeasonByDate — window boundaries', () => {
  const cases: Array<[number, number, Season]> = [
    // cherry-blossom 3/15–4/20
    [3, 14, 'tennis-winter'],
    [3, 15, 'cherry-blossom'],
    [4, 20, 'cherry-blossom'],
    // tennis-spring 4/21–6/15
    [4, 21, 'tennis-spring'],
    [5, 1, 'tennis-spring'],
    [6, 15, 'tennis-spring'],
    // tennis-summer 6/16–8/31
    [6, 16, 'tennis-summer'],
    [6, 20, 'tennis-summer'], // today (2026-06-20)
    [7, 31, 'tennis-summer'],
    [8, 31, 'tennis-summer'],
    // tennis-autumn 9/1–10/31
    [9, 1, 'tennis-autumn'],
    [10, 31, 'tennis-autumn'],
    // tennis-winter 11/1–3/14 (year-wrap)
    [11, 1, 'tennis-winter'],
    [12, 25, 'tennis-winter'],
    [1, 15, 'tennis-winter'],
    [2, 28, 'tennis-winter'],
    [3, 1, 'tennis-winter'],
  ];

  it.each(cases)('%i/%i -> %s', (m, day, expected) => {
    expect(detectSeasonByDate(d(m, day))).toBe(expected);
  });
});

describe('detectSeasonByDate — full-year coverage & disjointness', () => {
  it('maps every day of a leap year to exactly one season and reaches all 6 windows', () => {
    const seen = new Set<Season>();
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const date = new Date(2024, month - 1, day); // 2024 = leap year
        if (date.getMonth() !== month - 1) continue; // skip invalid (e.g. Feb 30)
        const s = detectSeasonByDate(date);
        expect(isValidSeason(s)).toBe(true);
        seen.add(s);
      }
    }
    // Every window except the bare 'default' is reachable; 'default' is fully covered.
    expect(seen.has('cherry-blossom')).toBe(true);
    expect(seen.has('tennis-spring')).toBe(true);
    expect(seen.has('tennis-summer')).toBe(true);
    expect(seen.has('tennis-autumn')).toBe(true);
    expect(seen.has('tennis-winter')).toBe(true);
    expect(seen.has('default')).toBe(false); // summer+winter now fill the old gaps
  });
});

describe('resolveSeason — manual override wins', () => {
  it('returns a valid manual season regardless of date', () => {
    expect(resolveSeason('cherry-blossom', d(6, 20))).toBe('cherry-blossom');
    expect(resolveSeason('tennis-winter', d(7, 1))).toBe('tennis-winter');
    expect(resolveSeason('default', d(1, 1))).toBe('default');
  });

  it('falls back to auto-detect for invalid/empty manual values', () => {
    expect(resolveSeason(null, d(6, 20))).toBe('tennis-summer');
    expect(resolveSeason('garbage', d(12, 25))).toBe('tennis-winter');
  });
});

describe('nextSeason — cycle order', () => {
  it('cycles through all 6 seasons and wraps', () => {
    const visited: Season[] = [];
    let cur: Season = 'default';
    for (let i = 0; i < SEASON_ORDER.length; i++) {
      visited.push(cur);
      cur = nextSeason(cur);
    }
    expect(visited).toEqual(SEASON_ORDER);
    expect(cur).toBe('default'); // wrapped back to start
  });
});

describe('APPEARANCE_INIT_SCRIPT — drift guard (real inline script execution)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.documentElement.removeAttribute('data-season');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function runScript() {
    // eslint-disable-next-line no-eval
    eval(APPEARANCE_INIT_SCRIPT);
  }

  const dateCases: Array<[number, number, Season]> = [
    [3, 15, 'cherry-blossom'],
    [5, 1, 'tennis-spring'],
    [6, 20, 'tennis-summer'],
    [9, 10, 'tennis-autumn'],
    [12, 25, 'tennis-winter'],
    [1, 15, 'tennis-winter'],
    [3, 14, 'tennis-winter'],
  ];

  it.each(dateCases)(
    'inline script agrees with detectSeasonByDate for %i/%i',
    (m, day, expected) => {
      vi.setSystemTime(d(m, day));
      runScript();
      expect(document.documentElement.getAttribute('data-season')).toBe(expected);
      expect(detectSeasonByDate(d(m, day))).toBe(expected);
    }
  );

  it('honors a valid manual season override', () => {
    vi.setSystemTime(d(6, 20));
    localStorage.setItem('tennis-season-manual', 'tennis-winter');
    runScript();
    expect(document.documentElement.getAttribute('data-season')).toBe('tennis-winter');
  });

  it('sets data-theme from localStorage, defaulting to neo-brutalism', () => {
    vi.setSystemTime(d(6, 20));
    runScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('neo-brutalism');

    localStorage.setItem('tennis-theme', 'default');
    runScript();
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
  });

  it('clears the legacy tennis-season key', () => {
    vi.setSystemTime(d(6, 20));
    localStorage.setItem('tennis-season', 'stale');
    runScript();
    expect(localStorage.getItem('tennis-season')).toBeNull();
  });
});
