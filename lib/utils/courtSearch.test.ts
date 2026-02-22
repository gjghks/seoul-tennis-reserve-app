import { describe, expect, it } from 'vitest';
import { getQueryFeatures, rankCourtsByQuery } from './courtSearch';

interface MockCourt {
  SVCID: string;
  SVCNM: string;
  PLACENM: string;
  AREANM: string;
  SVCSTATNM: string;
}

const COURTS: MockCourt[] = [
  {
    SVCID: '1',
    SVCNM: '강남테니스장',
    PLACENM: '강남공원',
    AREANM: '강남구',
    SVCSTATNM: '접수중',
  },
  {
    SVCID: '2',
    SVCNM: '잠실테니스코트',
    PLACENM: '잠실종합운동장',
    AREANM: '송파구',
    SVCSTATNM: '예약마감',
  },
  {
    SVCID: '3',
    SVCNM: '강동실내코트',
    PLACENM: '강동체육관',
    AREANM: '강동구',
    SVCSTATNM: '접수중',
  },
];

describe('courtSearch utilities', () => {
  it('extracts query features for choseong input', () => {
    const features = getQueryFeatures('ㄱㄷ');

    expect(features.isChoseongOnly).toBe(true);
    expect(features.scriptType).toBe('hangul');
    expect(features.lengthBucket).toBe('2-3');
  });

  it('ranks exact/prefix matches above loose matches', () => {
    const ranked = rankCourtsByQuery(COURTS, '강남', { includeDistrict: true });

    expect(ranked[0]?.SVCID).toBe('1');
  });

  it('supports choseong matching', () => {
    const ranked = rankCourtsByQuery(COURTS, 'ㄱㄷ', { includeDistrict: true });

    expect(ranked.some((court) => court.SVCID === '3')).toBe(true);
  });

  it('applies result limit', () => {
    const ranked = rankCourtsByQuery(COURTS, '강', { limit: 1, includeDistrict: true });

    expect(ranked).toHaveLength(1);
  });
});
