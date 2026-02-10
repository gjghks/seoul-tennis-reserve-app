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
    vi.useRealTimers();
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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
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

      const { fetchTennisAvailability, getCachedTennisData } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toEqual([]);
      expect(getCachedTennisData()).toEqual({ data: [], timestamp: expect.any(Number) });
    });

    it('should retry failures and succeed on a later attempt', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      const mockResponse = {
        ListPublicReservationSport: {
          list_total_count: 1,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '테니스장', SVCNM: '강남 테니스장', AREANM: '강남구' },
          ],
        },
      };

      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const resultPromise = fetchTennisAvailability();

      await vi.advanceTimersByTimeAsync(3_000);
      const result = await resultPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(1);
      expect(result[0].SVCID).toBe('1');
    });

    it('should timeout each attempt after 10 seconds and throw after retries when no cache exists', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockFetch.mockImplementation((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = init?.signal;
          if (!signal) {
            reject(new Error('Missing AbortSignal'));
            return;
          }

          signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        });
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const resultPromise = fetchTennisAvailability();
      const rejectionExpectation = expect(resultPromise).rejects.toThrow('The operation was aborted.');

      await vi.advanceTimersByTimeAsync(47_000);

      await rejectionExpectation;
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should return cached data when all retries fail after a previous success', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      const mockResponse = {
        ListPublicReservationSport: {
          list_total_count: 1,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: 'cached-1', MINCLASSNM: '테니스장', SVCNM: '캐시 테니스장', AREANM: '강남구' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { fetchTennisAvailability, getCachedTennisData } = await import('./seoulApi');
      const freshResult = await fetchTennisAvailability();
      expect(freshResult).toHaveLength(1);
      expect(getCachedTennisData()?.data).toEqual(freshResult);

      mockFetch.mockReset();
      mockFetch.mockRejectedValue(new Error('Network down'));

      const stalePromise = fetchTennisAvailability();
      await vi.advanceTimersByTimeAsync(7_000);
      const staleResult = await stalePromise;

      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(staleResult).toEqual(freshResult);
    });
  });
});
