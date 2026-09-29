import { describe, it, expect } from 'vitest';
import { getIndependentCourts, TEMPORARY_CLOSURE_STATUS } from './independentCourts';

const statusOf = (now: Date, id: string) => getIndependentCourts(now).find(c => c.SVCID === id)?.SVCSTATNM;

describe('getIndependentCourts temporary closures', () => {
  it('shows 방화(INDEP_GS002) as 휴장 only during 2026-10-12..11-08 (KST, inclusive)', () => {
    // 2026-10-11 23:59 KST
    expect(statusOf(new Date('2026-10-11T14:59:00Z'), 'INDEP_GS002')).toBe('외부예약');
    // 2026-10-12 00:00 KST
    expect(statusOf(new Date('2026-10-11T15:00:00Z'), 'INDEP_GS002')).toBe(TEMPORARY_CLOSURE_STATUS);
    // 2026-11-08 23:59 KST
    expect(statusOf(new Date('2026-11-08T14:59:00Z'), 'INDEP_GS002')).toBe(TEMPORARY_CLOSURE_STATUS);
    // 2026-11-09 00:00 KST
    expect(statusOf(new Date('2026-11-08T15:00:00Z'), 'INDEP_GS002')).toBe('외부예약');
  });

  it('does not touch other courts or mutate the static data', () => {
    const during = new Date('2026-10-20T03:00:00Z');
    getIndependentCourts(during);
    expect(statusOf(new Date('2026-09-29T03:00:00Z'), 'INDEP_GS002')).toBe('외부예약');
    const others = getIndependentCourts(during).filter(c => c.SVCID !== 'INDEP_GS002');
    expect(others.every(c => c.SVCSTATNM !== TEMPORARY_CLOSURE_STATUS)).toBe(true);
  });
});
