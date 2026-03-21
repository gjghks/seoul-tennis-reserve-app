import { describe, it, expect } from 'vitest';
import { isCourtAvailable, getReservationButtonLabel } from './courtStatus';

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

  describe('getReservationButtonLabel', () => {
    it('should return "예약 마감" for closed statuses', () => {
      expect(getReservationButtonLabel('예약마감')).toBe('예약 마감');
      expect(getReservationButtonLabel('접수마감')).toBe('예약 마감');
    });

    it('should return "예약 준비중" for 안내중 status', () => {
      expect(getReservationButtonLabel('안내중')).toBe('예약 준비중');
    });

    it('should return "예약 일시중지" for suspended status', () => {
      expect(getReservationButtonLabel('예약일시중지')).toBe('예약 일시중지');
    });

    it('should return "예약 불가" for unknown statuses', () => {
      expect(getReservationButtonLabel('대기중')).toBe('예약 불가');
      expect(getReservationButtonLabel('종료')).toBe('예약 불가');
      expect(getReservationButtonLabel('준비중')).toBe('예약 불가');
    });

    it('should return "예약 불가" for null/undefined/empty', () => {
      expect(getReservationButtonLabel(null)).toBe('예약 불가');
      expect(getReservationButtonLabel(undefined)).toBe('예약 불가');
      expect(getReservationButtonLabel('')).toBe('예약 불가');
    });
  });
});
