import { describe, expect, it } from 'vitest';
import type { SeoulService } from '@/lib/seoulApi';
import { extractFacilityTags } from './facilityTags';
import { toCourtList, toCourtListItem } from './courtListView';

function makeCourt(overrides: Partial<SeoulService> = {}): SeoulService {
  return {
    GUBUN: '자체',
    SVCID: 'S1',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '접수중',
    SVCNM: '테스트 테니스장',
    PAYATNM: '유료',
    PLACENM: '테스트공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://yeyak.seoul.go.kr/x',
    X: '127.0',
    Y: '37.5',
    SVCOPNBGNDT: '2026-11-01',
    SVCOPNENDDT: '2026-11-30',
    RCPTBGNDT: '2026-10-25',
    RCPTENDDT: '2026-11-30',
    AREANM: '강남구',
    IMGURL: 'https://example.com/a.jpg',
    DTLCONT: '<p>◎ 시설현황 - 인조잔디 코트 3면, 야간 조명, 주차 가능, 샤워장</p>'.repeat(50),
    TELNO: '02-000-0000',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '접수일',
    REVSTDDAY: '1',
    ...overrides,
  } as SeoulService;
}

describe('toCourtListItem', () => {
  it('drops the heavy DTLCONT detail text', () => {
    expect(toCourtListItem(makeCourt()).DTLCONT).toBe('');
  });

  it('keeps every other field unchanged', () => {
    const court = makeCourt();
    const { DTLCONT: _a, FACILITY_TAGS: _b, ...rest } = toCourtListItem(court);
    const { DTLCONT: _c, ...expected } = court;
    expect(rest).toEqual(expected);
  });

  it('precomputes the same facility tags the full record would produce', () => {
    const court = makeCourt();
    expect(toCourtListItem(court).FACILITY_TAGS).toEqual(extractFacilityTags(court));
    expect(toCourtListItem(court).FACILITY_TAGS!.length).toBeGreaterThan(0);
  });

  it('does not mutate the input record', () => {
    const court = makeCourt();
    const before = court.DTLCONT;
    toCourtListItem(court);
    expect(court.DTLCONT).toBe(before);
    expect(court.FACILITY_TAGS).toBeUndefined();
  });

  it('passes a record with empty DTLCONT through untouched (no tags precomputed)', () => {
    const court = makeCourt({ DTLCONT: '' });
    const out = toCourtListItem(court);
    expect(out).toBe(court);
    expect(out.FACILITY_TAGS).toBeUndefined();
  });

  it('makes the serialized list much smaller', () => {
    const courts = Array.from({ length: 20 }, (_, i) => makeCourt({ SVCID: `S${i}` }));
    const full = JSON.stringify(courts).length;
    const slim = JSON.stringify(toCourtList(courts)).length;
    expect(slim).toBeLessThan(full / 3);
  });
});

describe('extractFacilityTags on a slimmed record', () => {
  it('returns the precomputed tags instead of rescanning the (now empty) detail text', () => {
    const court = makeCourt();
    const slim = toCourtListItem(court);
    expect(extractFacilityTags(slim)).toEqual(extractFacilityTags(court));
  });
});
