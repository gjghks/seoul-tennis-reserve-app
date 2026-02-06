import { describe, it, expect } from 'vitest';
import { isCourtAvailable } from './courtStatus';

describe('courtStatus', () => {
  describe('isCourtAvailable', () => {
    it('should return true for "접수중" status', () => {
      expect(isCourtAvailable('접수중')).toBe(true);
    });

    it('should return true for "예약가능" status', () => {
      expect(isCourtAvailable('예약가능')).toBe(true);
    });

    it('should return true for status containing "예약가능"', () => {
      expect(isCourtAvailable('현재 예약가능')).toBe(true);
      expect(isCourtAvailable('예약가능합니다')).toBe(true);
    });

    it('should return false for "접수마감" status', () => {
      expect(isCourtAvailable('접수마감')).toBe(false);
    });

    it('should return false for "예약마감" status', () => {
      expect(isCourtAvailable('예약마감')).toBe(false);
    });

    it('should return false for undefined status', () => {
      expect(isCourtAvailable(undefined)).toBe(false);
    });

    it('should return false for null status', () => {
      expect(isCourtAvailable(null)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isCourtAvailable('')).toBe(false);
    });

    it('should return false for other status values', () => {
      expect(isCourtAvailable('대기중')).toBe(false);
      expect(isCourtAvailable('종료')).toBe(false);
      expect(isCourtAvailable('준비중')).toBe(false);
    });
  });
});
