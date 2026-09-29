import { describe, it, expect } from 'vitest';
import { pickFacilityRepresentatives } from './sitemapCourts';
import type { SeoulService } from '@/lib/seoulApi';

const svc = (over: Partial<SeoulService>) => ({ SVCID: 'S1', AREANM: '종로구', PLACENM: '삼청테니스장', SVCOPNENDDT: '', ...over }) as SeoulService;

describe('pickFacilityRepresentatives', () => {
  it('keeps one SVCID per facility, preferring the latest SVCOPNENDDT then the smallest SVCID', () => {
    const picked = pickFacilityRepresentatives([
      svc({ SVCID: 'S3', SVCOPNENDDT: '2026-10-31' }),
      svc({ SVCID: 'S2', SVCOPNENDDT: '2026-12-31' }),
      svc({ SVCID: 'S1', SVCOPNENDDT: '2026-12-31' }),
    ]);
    expect(picked.map(c => c.SVCID)).toEqual(['S1']);
  });

  it('collapses 광진 A/B코트 and 양천 에너지공사 1면/2면 into one facility each', () => {
    const picked = pickFacilityRepresentatives([
      svc({ SVCID: 'A', AREANM: '광진구', PLACENM: '테니스장 A코트' }),
      svc({ SVCID: 'B', AREANM: '광진구', PLACENM: '테니스장 B코트' }),
      svc({ SVCID: 'E1', AREANM: '양천구', PLACENM: '서울에너지공사 목동 테니스장 1면' }),
      svc({ SVCID: 'E2', AREANM: '양천구', PLACENM: '서울에너지공사 목동 테니스장 2면' }),
    ]);
    expect(picked.map(c => c.SVCID).sort()).toEqual(['A', 'E1']);
  });

  it('prefers a stable INDEP_ id and skips excluded fallback ids', () => {
    const courts = [
      svc({ SVCID: 'S1', AREANM: '강서구', PLACENM: '구립테니스장' }),
      svc({ SVCID: 'INDEP_GS002', AREANM: '강서구', PLACENM: '구립테니스장' }),
      svc({ SVCID: 'INDEP_SDM001', AREANM: '서대문구', PLACENM: '현저테니스장' }),
    ];
    const picked = pickFacilityRepresentatives(courts, new Set(['INDEP_SDM001']));
    expect(picked.map(c => c.SVCID)).toEqual(['INDEP_GS002']);
  });
});
