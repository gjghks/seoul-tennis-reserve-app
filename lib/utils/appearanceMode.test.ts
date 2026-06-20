import { describe, it, expect } from 'vitest';
import { resolveDark, isValidMode, nextMode, MODE_ORDER } from './appearanceMode';

describe('appearanceMode', () => {
  it('resolveDark resolves explicit modes', () => {
    expect(resolveDark('dark')).toBe(true);
    expect(resolveDark('light')).toBe(false);
  });

  it('isValidMode', () => {
    expect(isValidMode('system')).toBe(true);
    expect(isValidMode('light')).toBe(true);
    expect(isValidMode('dark')).toBe(true);
    expect(isValidMode('nope')).toBe(false);
    expect(isValidMode(null)).toBe(false);
  });

  it('nextMode cycles through MODE_ORDER', () => {
    expect(MODE_ORDER).toEqual(['system', 'light', 'dark']);
    expect(nextMode('system')).toBe('light');
    expect(nextMode('light')).toBe('dark');
    expect(nextMode('dark')).toBe('system');
  });
});
