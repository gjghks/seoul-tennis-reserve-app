/**
 * Single source of truth for the seasonal-theme system (the `data-season` axis).
 *
 * The inline <head> FOUC script (`lib/utils/appearanceInitScript.ts`) runs before
 * React hydrates and cannot import this module at runtime, so it inlines the same
 * window logic as a string. `season.test.ts` executes that script and asserts it
 * agrees with `detectSeasonByDate()` for sampled dates — this is the anti-drift guard.
 *
 * Windows are kept disjoint. Winter wraps the year boundary (Nov–Dec + Jan–mid-Mar);
 * a naive `month >= 11 && month <= 3` is always false, hence the OR form below.
 */

export type Season =
  | 'default'
  | 'cherry-blossom'
  | 'tennis-spring'
  | 'tennis-summer'
  | 'tennis-autumn'
  | 'tennis-winter';

export type Theme = 'default' | 'neo-brutalism';

export const MANUAL_SEASON_KEY = 'tennis-season-manual';
export const LEGACY_SEASON_KEY = 'tennis-season';
export const THEME_KEY = 'tennis-theme';
export const DEFAULT_THEME: Theme = 'neo-brutalism';

/** Order used by the footer / more-menu cycle toggle. */
export const SEASON_ORDER: Season[] = [
  'default',
  'cherry-blossom',
  'tennis-spring',
  'tennis-summer',
  'tennis-autumn',
  'tennis-winter',
];

export function isValidSeason(value: unknown): value is Season {
  return (
    value === 'default' ||
    value === 'cherry-blossom' ||
    value === 'tennis-spring' ||
    value === 'tennis-summer' ||
    value === 'tennis-autumn' ||
    value === 'tennis-winter'
  );
}

export function isValidTheme(value: unknown): value is Theme {
  return value === 'default' || value === 'neo-brutalism';
}

// ── Date windows (month is 1-12) ──────────────────────────────────────────────

// 벚꽃: 3/15~4/20 (개화 전 분위기 조성 포함)
export function isCherryBlossomWindow(month: number, day: number): boolean {
  return (month === 3 && day >= 15) || (month === 4 && day <= 20);
}

// 봄 골든 윈도우: 4/21~6/15 (황사 끝, 장마 전, 프렌치 오픈/KTA 춘계대회)
export function isTennisSpringWindow(month: number, day: number): boolean {
  return (month === 4 && day >= 21) || month === 5 || (month === 6 && day <= 15);
}

// 여름: 6/16~8/31 (장마·폭염·열대야 — 새벽/야간 플레이 시즌)
export function isTennisSummerWindow(month: number, day: number): boolean {
  return (month === 6 && day >= 16) || month === 7 || month === 8;
}

// 가을 골든 윈도우: 9/1~10/31 (US 오픈/KTA 추계대회)
export function isTennisAutumnWindow(month: number, _day: number): boolean {
  return month === 9 || month === 10;
}

// 겨울: 11/1~3/14 — 연도 경계 wrap. OR 로직 필수 (naive AND는 모든 달에 false).
export function isTennisWinterWindow(month: number, day: number): boolean {
  return month >= 11 || month <= 2 || (month === 3 && day <= 14);
}

/** Auto-detect the season for a given date. Returns exactly one season. */
export function detectSeasonByDate(date: Date): Season {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (isCherryBlossomWindow(month, day)) return 'cherry-blossom';
  if (isTennisSpringWindow(month, day)) return 'tennis-spring';
  if (isTennisSummerWindow(month, day)) return 'tennis-summer';
  if (isTennisAutumnWindow(month, day)) return 'tennis-autumn';
  if (isTennisWinterWindow(month, day)) return 'tennis-winter';
  return 'default';
}

/** A valid manual override (from localStorage) always wins; otherwise auto-detect. */
export function resolveSeason(manual: string | null, date: Date): Season {
  if (isValidSeason(manual)) return manual;
  return detectSeasonByDate(date);
}

/** Next season in the cycle (for the blind-cycle toggle). */
export function nextSeason(current: Season): Season {
  const idx = SEASON_ORDER.indexOf(current);
  return SEASON_ORDER[(idx + 1) % SEASON_ORDER.length];
}
