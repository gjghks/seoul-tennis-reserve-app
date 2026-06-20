/**
 * Light/Dark/System mode — the THIRD appearance axis, independent of data-theme
 * (neo-brutalism|minimal) and data-season. Driven by a `dark` class + `data-mode`
 * attribute on <html>; Tailwind `dark:` variants and `.dark` CSS-variable overrides
 * key off it. The inline <head> script (appearanceInitScript) applies it pre-paint;
 * ModeContext keeps it in sync and reacts to system changes.
 */

export type Mode = 'light' | 'dark' | 'system';

export const MODE_KEY = 'tennis-mode';
export const DEFAULT_MODE: Mode = 'system';

/** Cycle/selector order. */
export const MODE_ORDER: Mode[] = ['system', 'light', 'dark'];

export const MODE_LABEL: Record<Mode, string> = {
  system: '시스템',
  light: '라이트',
  dark: '다크',
};

export function isValidMode(value: unknown): value is Mode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Resolve a mode to a concrete dark on/off. */
export function resolveDark(mode: Mode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return systemPrefersDark();
}

export function nextMode(current: Mode): Mode {
  const i = MODE_ORDER.indexOf(current);
  return MODE_ORDER[(i + 1) % MODE_ORDER.length];
}
