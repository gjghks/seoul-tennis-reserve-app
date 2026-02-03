import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('seoulApi', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('fetchTennisAvailability', () => {
    it('should return empty array when API_KEY is missing', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', '');
      
      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();
      
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and filter tennis courts', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      
      const mockResponse = {
        ListPublicReservationSport: {
          list_total_count: 3,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '테니스장', SVCNM: '강남 테니스장', AREANM: '강남구' },
            { SVCID: '2', MINCLASSNM: '축구장', SVCNM: '강남 축구장', AREANM: '강남구' },
            { SVCID: '3', MINCLASSNM: '테니스장', SVCNM: '부산 테니스장', AREANM: '해운대구' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toHaveLength(1);
      expect(result[0].SVCID).toBe('1');
      expect(result[0].MINCLASSNM).toBe('테니스장');
      expect(result[0].AREANM).toBe('강남구');
    });

    it('should include courts with 테니스 in name', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      
      const mockResponse = {
        ListPublicReservationSport: {
          list_total_count: 2,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '기타', SVCNM: '실내테니스연습장', AREANM: '송파구' },
            { SVCID: '2', MINCLASSNM: '기타', SVCNM: '배드민턴장', AREANM: '송파구' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toHaveLength(1);
      expect(result[0].SVCNM).toContain('테니스');
    });

    it('should return empty array when API returns no data', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toEqual([]);
    });

    it('should throw error when API request fails', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      
      await expect(fetchTennisAvailability()).rejects.toThrow('Failed to fetch Seoul API: 500');
    });
  });
});
