import { describe, it, expect } from 'vitest';
import {
  DISTRICTS,
  SLUG_TO_KOREAN,
  KOREAN_TO_SLUG,
  getDistrictBySlug,
  getDistrictByKorean,
} from './districts';

describe('districts', () => {
  describe('DISTRICTS', () => {
    it('should have 25 Seoul districts', () => {
      expect(DISTRICTS).toHaveLength(25);
    });

    it('should have valid structure for each district', () => {
      DISTRICTS.forEach(district => {
        expect(district).toHaveProperty('slug');
        expect(district).toHaveProperty('nameKo');
        expect(district).toHaveProperty('nameEn');
        expect(district.slug).toMatch(/^[a-z]+-gu$/);
        expect(district.nameKo).toMatch(/구$/);
      });
    });
  });

  describe('SLUG_TO_KOREAN', () => {
    it('should convert slug to Korean name', () => {
      expect(SLUG_TO_KOREAN['gangnam-gu']).toBe('강남구');
      expect(SLUG_TO_KOREAN['songpa-gu']).toBe('송파구');
      expect(SLUG_TO_KOREAN['jung-gu']).toBe('중구');
    });

    it('should return undefined for invalid slug', () => {
      expect(SLUG_TO_KOREAN['invalid-gu']).toBeUndefined();
    });
  });

  describe('KOREAN_TO_SLUG', () => {
    it('should convert Korean name to slug', () => {
      expect(KOREAN_TO_SLUG['강남구']).toBe('gangnam-gu');
      expect(KOREAN_TO_SLUG['송파구']).toBe('songpa-gu');
      expect(KOREAN_TO_SLUG['중구']).toBe('jung-gu');
    });

    it('should return undefined for invalid Korean name', () => {
      expect(KOREAN_TO_SLUG['부산구']).toBeUndefined();
    });
  });

  describe('getDistrictBySlug', () => {
    it('should find district by slug', () => {
      const district = getDistrictBySlug('gangnam-gu');
      expect(district).toBeDefined();
      expect(district?.nameKo).toBe('강남구');
      expect(district?.nameEn).toBe('Gangnam-gu');
    });

    it('should return undefined for invalid slug', () => {
      expect(getDistrictBySlug('invalid-gu')).toBeUndefined();
    });
  });

  describe('getDistrictByKorean', () => {
    it('should find district by Korean name', () => {
      const district = getDistrictByKorean('강남구');
      expect(district).toBeDefined();
      expect(district?.slug).toBe('gangnam-gu');
      expect(district?.nameEn).toBe('Gangnam-gu');
    });

    it('should return undefined for invalid Korean name', () => {
      expect(getDistrictByKorean('부산구')).toBeUndefined();
    });
  });
});
