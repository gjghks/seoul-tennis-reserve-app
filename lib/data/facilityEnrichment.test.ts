import { describe, expect, it } from 'vitest';
import { findEnrichment, getAllFacilities, getMapPOIName } from './facilityEnrichment';

// Regression cases from the 2026-09-29 25-district data audit.
describe('findEnrichment — 2026-09-29 audit fixes', () => {
  it('matches 서울에너지공사 목동 1면/2면 to its own 2-court record, not 목동테니스장 (18면)', () => {
    for (const placenm of ['서울에너지공사 목동 테니스장 1면', '서울에너지공사 목동 테니스장 2면']) {
      const e = findEnrichment(`${placenm} (공휴일) 08:00~18:00`, '양천구', placenm);
      expect(e?.facilityName).toBe('서울에너지공사 목동 테니스장');
      expect(e?.courtCount).toBe(2);
      expect(e?.manager).toBe('서울에너지공사');
    }
  });

  it('keeps 목동테니스장 on the 18-court record with its own map POI name', () => {
    const e = findEnrichment('목동테니스장', '양천구', '목동테니스장');
    expect(e?.courtCount).toBe(18);
    expect(getMapPOIName('목동테니스장', '양천구', '목동테니스장')).toBe('목동테니스장');
  });

  it('links 잠원한강테니스장 to the 한강공원 잠원지구 record', () => {
    const e = findEnrichment('잠원 한강공원 테니스장 1번 코트 평일', '서초구', '잠원한강테니스장');
    expect(e?.normalizedName).toBe('한강공원잠원지구');
  });

  it('resolves 응봉테니스장 variants to the 6-court 인조잔디 record, not 응봉공원(대현산배수지)', () => {
    for (const placenm of ['응봉테니스장', '응봉체육공원', '응봉야외체육시설']) {
      const e = findEnrichment(placenm, '성동구', placenm);
      expect(e?.normalizedName).toBe('응봉');
      expect(e?.courtCount).toBe(6);
      expect(e?.surfaceCategory).toBe('artificial_grass');
    }
    expect(findEnrichment('응봉공원 테니스장', '성동구', '응봉공원')?.normalizedName).toBe('응봉공원');
  });

  it('shows 내곡 as 8면 (하드 6 + 인조잔디 2) and 중랑천 제1 as 4면, matching their DTLCONT', () => {
    const naegok = findEnrichment('내곡동체육시설 테니스장', '서초구', '내곡동체육시설');
    expect(naegok?.courtCount).toBe(8);
    expect(naegok?.surfaceCategory).toBe('mixed');
    expect(naegok?.surfaces).toEqual([{ type: '하드코트', count: 6 }, { type: '인조잔디', count: 2 }]);
    const jn = findEnrichment('중랑천제1체육공원 테니스장', '동대문구', '중랑천제1체육공원');
    expect(jn?.courtCount).toBe(4);
    expect(jn?.area).toBe(3049);
  });

  it('attaches the 공단-run 오금공원 테니스장 attributes (not the 오금동 51 정구장)', () => {
    const e = findEnrichment('오금공원 테니스장', '송파구', '오금공원');
    expect(e).toMatchObject({ address: '동남로 263 (오금공원)', manager: '송파구시설관리공단', surfaceCategory: 'unknown' });
  });

  it('uses each facility\'s own map POI name (명일, 광나루, 난우)', () => {
    expect(getMapPOIName('명일테니스장', '강동구', '명일테니스장')).toBe('명일테니스장');
    expect(getMapPOIName('광나루 한강공원 테니스장', '강동구', '광나루 한강공원 테니스장')).toBe('한강공원광나루지구 테니스장');
    expect(getMapPOIName('난우공원 테니스장 B코트 (평일주간)', '관악구', '난우공원 테니스장')).toBe('난우공원 테니스장');
  });

  it('maps both 어린이대공원 A/B코트 PLACENMs to the same single 3-court record', () => {
    const a = findEnrichment('어린이대공원 테니스장 A코트 - 평일 주간', '광진구', '테니스장 A코트');
    const b = findEnrichment('어린이대공원 테니스장 B코트 - 평일 주간', '광진구', '테니스장 B코트');
    expect(a).not.toBeNull();
    expect(a).toBe(b);
    expect(a?.courtCount).toBe(3);
  });

  it('no map POI name points at a private academy', () => {
    const names = getAllFacilities().map(f => f.mapPOIName ?? '');
    expect(names.some(n => n.includes('테니스마스터'))).toBe(false);
  });
});
