import { describe, it, expect } from 'vitest';
import { resolveCourtLookup } from './courtLookup';
import type { SeoulService } from '@/lib/seoulApi';

const court = (SVCID: string) => ({ SVCID }) as SeoulService;
const fresh = { isStale: false, isPartial: false };

describe('resolveCourtLookup', () => {
  it('finds a served court', () => {
    const result = resolveCourtLookup([court('S1'), court('INDEP_A')], 'S1', fresh);
    expect(result).toEqual({ type: 'found', court: court('S1') });
  });

  it('is not-found for an unknown SVCID when fresh, complete Seoul API rows exist', () => {
    expect(resolveCourtLookup([court('S1'), court('INDEP_A')], 'S404', fresh)).toEqual({ type: 'not-found' });
  });

  it('is not-found for an unknown INDEP_ id (static data is always included)', () => {
    expect(resolveCourtLookup([court('INDEP_A')], 'INDEP_ZZZ', { isStale: true, isPartial: false })).toEqual({ type: 'not-found' });
  });

  it('is api-error when only independent courts were served (Seoul API + snapshot down)', () => {
    expect(resolveCourtLookup([court('INDEP_A')], 'S1', { isStale: true, isPartial: false })).toEqual({ type: 'api-error' });
  });

  it('is api-error when the served data is partial (some Seoul API pages failed)', () => {
    expect(resolveCourtLookup([court('S1'), court('INDEP_A')], 'S2', { isStale: false, isPartial: true })).toEqual({ type: 'api-error' });
  });

  it('is api-error when the served data is a stale fallback', () => {
    expect(resolveCourtLookup([court('S1'), court('INDEP_A')], 'S2', { isStale: true, isPartial: false })).toEqual({ type: 'api-error' });
  });
});
