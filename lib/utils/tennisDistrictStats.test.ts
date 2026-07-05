import { describe, it, expect, vi } from 'vitest';

// Control which SVCIDs count as "external" (independent) so externalCount is deterministic.
vi.mock('@/lib/data/independentCourts', () => ({
  isIndependentCourt: (id: string) => id.startsWith('EXT'),
}));

import { buildByDistrict } from './tennisDistrictStats';
import type { SeoulService } from '@/lib/seoulApi';

function svc(overrides: Partial<SeoulService>): SeoulService {
  return {
    SVCID: 'S1',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '접수중',
    SVCNM: '코트',
    PAYATNM: '유료',
    PLACENM: '한남테니스장',
    USETGTINFO: '',
    SVCURL: '',
    X: '',
    Y: '',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '용산구',
    IMGURL: '',
    DTLCONT: '',
    TELNO: '',
    V_MIN: '',
    V_MAX: '',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
    ...overrides,
  };
}

describe('buildByDistrict', () => {
  it('collapses many reservation rows of one facility into a single facility count', () => {
    const services = [
      svc({ SVCID: 'S1', SVCNM: '1번코트 평일', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'S2', SVCNM: '2번코트 평일', SVCSTATNM: '예약마감' }),
      svc({ SVCID: 'S3', SVCNM: '3번코트 야간', SVCSTATNM: '접수종료' }),
      svc({ SVCID: 'S4', SVCNM: '1번코트 주말', SVCSTATNM: '안내중' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['용산구'].count).toBe(1); // 4 rows, 1 facility
    expect(stats['용산구'].available).toBe(1); // at least one 접수중 (facility-based)
    expect(stats['용산구'].availableSlots).toBe(1); // only S1 is open (row-based)
    expect(stats['용산구'].externalCount).toBe(0);
  });

  it('marks a facility available when NO row is open, otherwise not', () => {
    const services = [
      svc({ SVCID: 'S1', SVCSTATNM: '예약마감' }),
      svc({ SVCID: 'S2', SVCSTATNM: '접수종료' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['용산구'].count).toBe(1);
    expect(stats['용산구'].available).toBe(0);
    expect(stats['용산구'].availableSlots).toBe(0);
  });

  it('counts distinct facilities per district and only the open ones as available', () => {
    const services = [
      svc({ AREANM: '용산구', PLACENM: '한남테니스장', SVCSTATNM: '접수중' }),
      svc({ AREANM: '용산구', PLACENM: '이촌 한강공원 테니스장', SVCSTATNM: '예약마감' }),
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCSTATNM: '접수중' }),
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCSTATNM: '예약마감' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['용산구'].count).toBe(2);
    expect(stats['용산구'].available).toBe(1);
    expect(stats['종로구'].count).toBe(1); // same PLACENM collapses
    expect(stats['종로구'].available).toBe(1);
  });

  it('tracks availableSlots as the raw open-row count, independent of facility dedup', () => {
    const services = [
      // one facility, 3 open reservation rows -> 1 facility available, 3 open slots
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCNM: '평일', SVCSTATNM: '접수중' }),
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCNM: '야간', SVCSTATNM: '접수중' }),
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCNM: '주말', SVCSTATNM: '접수중' }),
      svc({ AREANM: '종로구', PLACENM: '삼청테니스장', SVCNM: '마감분', SVCSTATNM: '예약마감' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['종로구'].count).toBe(1); // facility
    expect(stats['종로구'].available).toBe(1); // facility with an opening
    expect(stats['종로구'].availableSlots).toBe(3); // 회차 (badge) — 3 open rows
  });

  it('does not collapse rows that have no PLACENM (falls back to SVCID)', () => {
    const services = [
      svc({ SVCID: 'A', PLACENM: '', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'B', PLACENM: '', SVCSTATNM: '접수중' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['용산구'].count).toBe(2);
    expect(stats['용산구'].available).toBe(2);
    expect(stats['용산구'].availableSlots).toBe(2);
  });

  it('counts a facility as external when any of its rows is an independent court', () => {
    const services = [
      svc({ SVCID: 'EXT1', PLACENM: '노원구 독립코트', AREANM: '노원구', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'EXT2', PLACENM: '노원구 독립코트', AREANM: '노원구', SVCSTATNM: '예약마감' }),
      svc({ SVCID: 'S9', PLACENM: '서울API코트', AREANM: '노원구', SVCSTATNM: '접수중' }),
    ];
    const stats = buildByDistrict(services);
    expect(stats['노원구'].count).toBe(2);
    expect(stats['노원구'].externalCount).toBe(1);
    expect(stats['노원구'].available).toBe(2);
    expect(stats['노원구'].availableSlots).toBe(2); // EXT1 + S9 are 접수중
  });

  it('returns an empty object for no services', () => {
    expect(buildByDistrict([])).toEqual({});
  });
});
