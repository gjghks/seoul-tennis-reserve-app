import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SeoulService } from '@/lib/seoulApi';
import {
  computeAllDistrictStats,
  computeDistrictStats,
  getCompetitionLabel,
  getCompetitionStars,
  getDistrictRank,
  type AllDistrictStats,
} from './districtStats';

/**
 * Minimal SeoulService factory. Only fields read by districtStats matter:
 * SVCID (external detection via INDEP_ prefix), SVCSTATNM (available/closed),
 * PAYATNM (free/paid), AREANM (grouping/slug), SVCNM/PLACENM (name sets),
 * V_MIN/V_MAX (open/close window). Everything else is filler.
 */
function svc(overrides: Partial<SeoulService> = {}): SeoulService {
  return {
    SVCID: 'SEOUL_001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '접수중',
    SVCNM: '테니스장A',
    PAYATNM: '유료',
    PLACENM: '공원A',
    USETGTINFO: '제한없음',
    SVCURL: 'https://example.com',
    X: '127.0',
    Y: '37.5',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강남구',
    IMGURL: '',
    DTLCONT: '',
    TELNO: '',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
    ...overrides,
  };
}

describe('computeDistrictStats — aggregation basics', () => {
  it('counts total/available/free/paid and derives slug from AREANM', () => {
    const services = [
      svc({ SVCID: 'S1', SVCSTATNM: '접수중', PAYATNM: '무료', SVCNM: 'A', PLACENM: 'P1' }),
      svc({ SVCID: 'S2', SVCSTATNM: '예약마감', PAYATNM: '유료', SVCNM: 'B', PLACENM: 'P2' }),
      svc({ SVCID: 'S3', SVCSTATNM: '접수중', PAYATNM: '유료', SVCNM: 'C', PLACENM: 'P3' }),
      svc({ SVCID: 'S4', SVCSTATNM: '안내중', PAYATNM: '무료', SVCNM: 'D', PLACENM: 'P4' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.nameKo).toBe('강남구');
    expect(stats.slug).toBe('gangnam-gu');
    expect(stats.totalCourts).toBe(4);
    expect(stats.availableCourts).toBe(2); // two 접수중
    expect(stats.externalCourts).toBe(0);
    expect(stats.freeCourts).toBe(2);
    expect(stats.paidCourts).toBe(2);
    expect(stats.hasExternalOnly).toBe(false);
  });

  it('treats both "접수중" and statuses containing "예약가능" as available', () => {
    const services = [
      svc({ SVCID: 'S1', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'S2', SVCSTATNM: '예약가능' }),
      svc({ SVCID: 'S3', SVCSTATNM: '일부 예약가능' }), // .includes('예약가능')
      svc({ SVCID: 'S4', SVCSTATNM: '예약마감' }), // not available
    ];
    const stats = computeDistrictStats(services);

    expect(stats.availableCourts).toBe(3);
    // availableRate = round(3/4 * 100) = 75
    expect(stats.availableRate).toBe(75);
  });

  it('computes availableRate/freeRate/competitionRate as rounded percentages', () => {
    // 3 Seoul-API courts: 1 접수중, 1 예약마감, 1 안내중; 1 free
    const services = [
      svc({ SVCID: 'S1', SVCSTATNM: '접수중', PAYATNM: '무료' }),
      svc({ SVCID: 'S2', SVCSTATNM: '예약마감', PAYATNM: '유료' }),
      svc({ SVCID: 'S3', SVCSTATNM: '안내중', PAYATNM: '유료' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.totalCourts).toBe(3);
    // seoulApiTotal = 3 (no external)
    expect(stats.availableRate).toBe(33); // round(1/3*100) = 33
    expect(stats.freeRate).toBe(33); // round(1/3*100) over TOTAL courts
    expect(stats.competitionRate).toBe(33); // round(1 closed / 3 seoulApi *100)
  });

  it('deduplicates court and place names preserving first-seen order', () => {
    const services = [
      svc({ SVCID: 'S1', SVCNM: '코트A', PLACENM: '공원1' }),
      svc({ SVCID: 'S2', SVCNM: '코트A', PLACENM: '공원2' }), // dup SVCNM
      svc({ SVCID: 'S3', SVCNM: '코트B', PLACENM: '공원1' }), // dup PLACENM
    ];
    const stats = computeDistrictStats(services);

    expect(stats.courtNames).toEqual(['코트A', '코트B']);
    expect(stats.placeNames).toEqual(['공원1', '공원2']);
  });
});

describe('computeDistrictStats — open/close time window', () => {
  it('picks earliest open and latest close across courts', () => {
    const services = [
      svc({ SVCID: 'S1', V_MIN: '08:00', V_MAX: '20:00' }),
      svc({ SVCID: 'S2', V_MIN: '06:30', V_MAX: '22:30' }),
      svc({ SVCID: 'S3', V_MIN: '07:00', V_MAX: '21:00' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.earliestOpen).toBe('06:30');
    expect(stats.latestClose).toBe('22:30');
  });

  it('ignores unparseable times but keeps valid ones', () => {
    const services = [
      svc({ SVCID: 'S1', V_MIN: '', V_MAX: '' }), // skipped (empty)
      svc({ SVCID: 'S2', V_MIN: 'abc', V_MAX: 'xyz' }), // skipped (no colon-separated nums)
      svc({ SVCID: 'S3', V_MIN: '오전 09:15', V_MAX: '오후 18:45' }), // strips non-digits/colon
    ];
    const stats = computeDistrictStats(services);

    // "오전 09:15" -> "09:15" -> 9*60+15; minutesToTime zero-pads back to "09:15"
    expect(stats.earliestOpen).toBe('09:15');
    expect(stats.latestClose).toBe('18:45');
  });

  it('returns null open/close when no court has a parseable time', () => {
    const services = [
      svc({ SVCID: 'S1', V_MIN: '', V_MAX: '' }),
      svc({ SVCID: 'S2', V_MIN: 'noon', V_MAX: 'midnight' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.earliestOpen).toBeNull();
    expect(stats.latestClose).toBeNull();
  });

  it('zero-pads single-digit hours and minutes', () => {
    const services = [svc({ SVCID: 'S1', V_MIN: '6:5', V_MAX: '9:0' })];
    const stats = computeDistrictStats(services);

    expect(stats.earliestOpen).toBe('06:05');
    expect(stats.latestClose).toBe('09:00');
  });
});

describe('computeDistrictStats — external (외부예약) rule', () => {
  it('marks hasExternalOnly=true and zeroes Seoul-API rates when ALL courts are external', () => {
    const services = [
      svc({ SVCID: 'INDEP_A1', SVCSTATNM: '외부예약', PAYATNM: '유료' }),
      svc({ SVCID: 'INDEP_A2', SVCSTATNM: '외부예약', PAYATNM: '무료' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.externalCourts).toBe(2);
    expect(stats.totalCourts).toBe(2);
    expect(stats.hasExternalOnly).toBe(true);
    // seoulApiTotal = total - external = 0 -> guarded rates are 0
    expect(stats.availableRate).toBe(0);
    expect(stats.competitionRate).toBe(0);
    expect(stats.availableCourts).toBe(0); // none 접수중
    // freeRate still uses TOTAL as denominator: round(1/2*100) = 50
    expect(stats.freeRate).toBe(50);
    expect(stats.paidCourts).toBe(1);
  });

  it('externalCount uses the INDEP_ id prefix, not the SVCSTATNM label', () => {
    // A Seoul-API court whose status text happens to be '외부예약' is NOT counted external.
    const services = [
      svc({ SVCID: 'SEOUL_X', SVCSTATNM: '외부예약' }),
      svc({ SVCID: 'INDEP_Y', SVCSTATNM: '외부예약' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.externalCourts).toBe(1); // only the INDEP_ one
    expect(stats.hasExternalOnly).toBe(false); // not ALL ids are INDEP_
  });

  it('mixes external + Seoul-API: rates use only the Seoul-API denominator', () => {
    const services = [
      svc({ SVCID: 'INDEP_E1', SVCSTATNM: '외부예약', PAYATNM: '유료' }),
      svc({ SVCID: 'S1', SVCSTATNM: '접수중', PAYATNM: '유료' }),
      svc({ SVCID: 'S2', SVCSTATNM: '예약마감', PAYATNM: '무료' }),
    ];
    const stats = computeDistrictStats(services);

    expect(stats.totalCourts).toBe(3);
    expect(stats.externalCourts).toBe(1);
    expect(stats.availableCourts).toBe(1);
    // seoulApiTotal = 3 - 1 = 2
    expect(stats.availableRate).toBe(50); // round(1/2*100)
    expect(stats.competitionRate).toBe(50); // round(1 closed/2*100)
    expect(stats.freeRate).toBe(33); // round(1 free / 3 TOTAL *100)
    expect(stats.hasExternalOnly).toBe(false);
  });
});

describe('computeDistrictStats — empty / single inputs', () => {
  it('returns all-zero/empty stats for an empty array', () => {
    const stats = computeDistrictStats([]);

    expect(stats.nameKo).toBe('');
    expect(stats.slug).toBe('');
    expect(stats.totalCourts).toBe(0);
    expect(stats.externalCourts).toBe(0);
    expect(stats.availableCourts).toBe(0);
    expect(stats.availableRate).toBe(0);
    expect(stats.freeCourts).toBe(0);
    expect(stats.freeRate).toBe(0);
    expect(stats.paidCourts).toBe(0);
    expect(stats.competitionRate).toBe(0);
    expect(stats.earliestOpen).toBeNull();
    expect(stats.latestClose).toBeNull();
    expect(stats.courtNames).toEqual([]);
    expect(stats.placeNames).toEqual([]);
    expect(stats.hasExternalOnly).toBe(false); // total > 0 is false
  });

  it('handles a single available free Seoul-API court', () => {
    const stats = computeDistrictStats([
      svc({ SVCID: 'S1', SVCSTATNM: '접수중', PAYATNM: '무료', AREANM: '송파구' }),
    ]);

    expect(stats.slug).toBe('songpa-gu');
    expect(stats.availableRate).toBe(100);
    expect(stats.freeRate).toBe(100);
    expect(stats.competitionRate).toBe(0);
    expect(stats.paidCourts).toBe(0);
  });

  it('yields empty slug for an unknown district name', () => {
    const stats = computeDistrictStats([svc({ SVCID: 'S1', AREANM: '없는구' })]);
    expect(stats.nameKo).toBe('없는구');
    expect(stats.slug).toBe('');
  });
});

describe('computeAllDistrictStats — grouping, sorting, seoul averages', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-21T03:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('groups by AREANM and sorts districts by totalCourts descending', () => {
    const services = [
      // 강남구: 3 courts
      svc({ SVCID: 'G1', AREANM: '강남구', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'G2', AREANM: '강남구', SVCSTATNM: '예약마감' }),
      svc({ SVCID: 'G3', AREANM: '강남구', SVCSTATNM: '접수중' }),
      // 송파구: 1 court
      svc({ SVCID: 'P1', AREANM: '송파구', SVCSTATNM: '접수중' }),
      // 강동구: 2 courts
      svc({ SVCID: 'D1', AREANM: '강동구', SVCSTATNM: '예약마감' }),
      svc({ SVCID: 'D2', AREANM: '강동구', SVCSTATNM: '접수중' }),
    ];
    const all = computeAllDistrictStats(services);

    expect(all.districts.map(d => d.nameKo)).toEqual(['강남구', '강동구', '송파구']);
    expect(all.districts.map(d => d.totalCourts)).toEqual([3, 2, 1]);
    expect(all.totalCourtsSeoul).toBe(6);
    // available: 강남 2 + 강동 1 + 송파 1 = 4
    expect(all.totalAvailableSeoul).toBe(4);
  });

  it('computes seoulAverage from summed totals', () => {
    const services = [
      svc({ SVCID: 'G1', AREANM: '강남구', SVCSTATNM: '접수중', PAYATNM: '무료' }),
      svc({ SVCID: 'G2', AREANM: '강남구', SVCSTATNM: '예약마감', PAYATNM: '유료' }),
      svc({ SVCID: 'D1', AREANM: '강동구', SVCSTATNM: '접수중', PAYATNM: '유료' }),
      svc({ SVCID: 'D2', AREANM: '강동구', SVCSTATNM: '예약마감', PAYATNM: '유료' }),
    ];
    const all = computeAllDistrictStats(services);

    // totalCourts=4 over 2 districts -> avg 2
    expect(all.seoulAverage.totalCourts).toBe(2);
    // totalAvailable=2, totalSeoulApi=4 -> 50
    expect(all.seoulAverage.availableRate).toBe(50);
    // totalFree=1 over totalCourts 4 -> 25
    expect(all.seoulAverage.freeRate).toBe(25);
    // totalClosed (Seoul-API, 예약마감) = 2 over seoulApi 4 -> 50
    expect(all.seoulAverage.competitionRate).toBe(50);
  });

  it('excludes external courts from competition/availability denominators in seoulAverage', () => {
    const services = [
      svc({ SVCID: 'INDEP_E1', AREANM: '강남구', SVCSTATNM: '외부예약', PAYATNM: '유료' }),
      svc({ SVCID: 'INDEP_E2', AREANM: '강남구', SVCSTATNM: '외부예약', PAYATNM: '유료' }),
      svc({ SVCID: 'S1', AREANM: '강동구', SVCSTATNM: '예약마감', PAYATNM: '유료' }),
      svc({ SVCID: 'S2', AREANM: '강동구', SVCSTATNM: '접수중', PAYATNM: '무료' }),
    ];
    const all = computeAllDistrictStats(services);

    // totalCourts=4, totalExternal=2 -> totalSeoulApi=2
    expect(all.totalCourtsSeoul).toBe(4);
    // available: only 강동 S2 접수중 = 1
    expect(all.totalAvailableSeoul).toBe(1);
    expect(all.seoulAverage.availableRate).toBe(50); // 1/2
    // totalClosed counts only non-INDEP 예약마감 = 1 (강동 S1); /2 seoulApi = 50
    expect(all.seoulAverage.competitionRate).toBe(50);
    // freeRate over TOTAL 4 -> 1/4 = 25
    expect(all.seoulAverage.freeRate).toBe(25);
  });

  it('returns zeroed seoulAverage and empty districts for empty input', () => {
    const all = computeAllDistrictStats([]);

    expect(all.districts).toEqual([]);
    expect(all.totalCourtsSeoul).toBe(0);
    expect(all.totalAvailableSeoul).toBe(0);
    expect(all.seoulAverage).toEqual({
      totalCourts: 0,
      availableRate: 0,
      freeRate: 0,
      competitionRate: 0,
    });
  });

  it('drops districts whose name is not in the DISTRICTS list', () => {
    const services = [
      svc({ SVCID: 'G1', AREANM: '강남구', SVCSTATNM: '접수중' }),
      svc({ SVCID: 'X1', AREANM: '없는구', SVCSTATNM: '접수중' }),
    ];
    const all = computeAllDistrictStats(services);

    expect(all.districts.map(d => d.nameKo)).toEqual(['강남구']);
    // Unknown-district courts do not appear in per-district stats, so the
    // summed totalCourtsSeoul also excludes them.
    expect(all.totalCourtsSeoul).toBe(1);
  });

  it('stamps lastUpdated with the current ISO time', () => {
    const all = computeAllDistrictStats([
      svc({ SVCID: 'G1', AREANM: '강남구', SVCSTATNM: '접수중' }),
    ]);
    expect(all.lastUpdated).toBe('2026-06-21T03:00:00.000Z');
  });
});

describe('getDistrictRank', () => {
  function buildStats(): AllDistrictStats {
    return {
      districts: [
        { nameKo: '강남구', totalCourts: 5, competitionRate: 80 } as never,
        { nameKo: '송파구', totalCourts: 3, competitionRate: 40 } as never,
        { nameKo: '강동구', totalCourts: 8, competitionRate: 60 } as never,
      ],
      seoulAverage: { totalCourts: 0, availableRate: 0, freeRate: 0, competitionRate: 0 },
      totalCourtsSeoul: 16,
      totalAvailableSeoul: 0,
      lastUpdated: '2026-06-21T00:00:00.000Z',
    };
  }

  it('ranks by a numeric key descending (1-based)', () => {
    const stats = buildStats();
    // totalCourts order: 강동(8) > 강남(5) > 송파(3)
    expect(getDistrictRank(stats, '강동구', 'totalCourts')).toBe(1);
    expect(getDistrictRank(stats, '강남구', 'totalCourts')).toBe(2);
    expect(getDistrictRank(stats, '송파구', 'totalCourts')).toBe(3);
  });

  it('ranks by a different numeric key independently', () => {
    const stats = buildStats();
    // competitionRate order: 강남(80) > 강동(60) > 송파(40)
    expect(getDistrictRank(stats, '강남구', 'competitionRate')).toBe(1);
    expect(getDistrictRank(stats, '강동구', 'competitionRate')).toBe(2);
    expect(getDistrictRank(stats, '송파구', 'competitionRate')).toBe(3);
  });

  it('returns 0 when the district is not present (findIndex -1 + 1)', () => {
    const stats = buildStats();
    expect(getDistrictRank(stats, '없는구', 'totalCourts')).toBe(0);
  });

  it('does not reorder for non-numeric keys (stable order, returns original index)', () => {
    const stats = buildStats();
    // 'nameKo' is a string key -> comparator returns 0 -> original order preserved
    expect(getDistrictRank(stats, '강남구', 'nameKo')).toBe(1);
    expect(getDistrictRank(stats, '송파구', 'nameKo')).toBe(2);
    expect(getDistrictRank(stats, '강동구', 'nameKo')).toBe(3);
  });

  it('does not mutate the input districts array', () => {
    const stats = buildStats();
    const before = stats.districts.map(d => d.nameKo);
    getDistrictRank(stats, '강동구', 'totalCourts');
    expect(stats.districts.map(d => d.nameKo)).toEqual(before);
  });
});

describe('getCompetitionLabel — threshold buckets', () => {
  const cases: Array<[number, string]> = [
    [100, '매우 높음'],
    [70, '매우 높음'], // boundary >=70
    [69, '높음'],
    [50, '높음'], // boundary >=50
    [49, '보통'],
    [30, '보통'], // boundary >=30
    [29, '낮음'],
    [10, '낮음'], // boundary >=10
    [9, '매우 낮음'],
    [0, '매우 낮음'],
  ];
  it.each(cases)('rate %i -> %s', (rate, expected) => {
    expect(getCompetitionLabel(rate)).toBe(expected);
  });
});

describe('getCompetitionStars — threshold buckets', () => {
  const cases: Array<[number, string]> = [
    [100, '★★★★★'],
    [80, '★★★★★'], // boundary >=80
    [79, '★★★★'],
    [60, '★★★★'], // boundary >=60
    [59, '★★★'],
    [40, '★★★'], // boundary >=40
    [39, '★★'],
    [20, '★★'], // boundary >=20
    [19, '★'],
    [0, '★'],
  ];
  it.each(cases)('rate %i -> %s', (rate, expected) => {
    expect(getCompetitionStars(rate)).toBe(expected);
  });
});
