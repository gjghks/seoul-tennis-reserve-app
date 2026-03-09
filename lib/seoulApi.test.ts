import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';

const mockGet = vi.fn();
vi.mock('node:http', () => ({
  default: { get: mockGet },
}));

function createReq(): EventEmitter & { destroy: ReturnType<typeof vi.fn> } {
  const req = new EventEmitter() as EventEmitter & { destroy: ReturnType<typeof vi.fn> };
  req.destroy = vi.fn();
  return req;
}

type MockHttpResponse = EventEmitter & { statusCode: number; resume: ReturnType<typeof vi.fn> };

function mockSuccess(body: object): void {
  mockGet.mockImplementationOnce((_url: string, _opts: unknown, callback: (response: MockHttpResponse) => void) => {
    const req = createReq();
    const res = Object.assign(new EventEmitter(), { statusCode: 200, resume: vi.fn() }) as MockHttpResponse;

    Promise.resolve()
      .then(() => callback(res))
      .then(() => {
        res.emit('data', Buffer.from(JSON.stringify(body)));
        res.emit('end');
      });

    return req;
  });
}

function mockError(error: Error): void {
  mockGet.mockImplementationOnce(() => {
    const req = createReq();
    Promise.resolve().then(() => req.emit('error', error));
    return req;
  });
}

function mockTimeout(): void {
  mockGet.mockImplementationOnce((_url: string, opts: { timeout: number }) => {
    const req = createReq();
    setTimeout(() => req.emit('timeout'), opts.timeout);
    return req;
  });
}

const TENNIS_RESPONSE = {
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

describe('seoulApi', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGet.mockReset();
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
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should fetch and filter tennis courts', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      mockSuccess(TENNIS_RESPONSE);

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toHaveLength(1);
      expect(result[0].SVCID).toBe('1');
      expect(result[0].MINCLASSNM).toBe('테니스장');
      expect(result[0].AREANM).toBe('강남구');
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should include courts with 테니스 in name', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 2,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '기타', SVCNM: '실내테니스연습장', AREANM: '송파구' },
            { SVCID: '2', MINCLASSNM: '기타', SVCNM: '배드민턴장', AREANM: '송파구' },
          ],
        },
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toHaveLength(1);
      expect(result[0].SVCNM).toContain('테니스');
    });

    it('should cache empty result when API returns no tennis data', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 0,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [],
        },
      });

      const { fetchTennisAvailability, getCachedTennisData } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result).toEqual([]);
      expect(getCachedTennisData()).toEqual({ data: [], timestamp: expect.any(Number) });
    });

    it('should retry failures and succeed on a later attempt', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockError(new Error('Network error'));
      mockError(new Error('Network error'));
      mockSuccess(TENNIS_RESPONSE);

      const { fetchTennisAvailability } = await import('./seoulApi');
      const resultPromise = fetchTennisAvailability();

      await vi.advanceTimersByTimeAsync(5_000);
      const result = await resultPromise;

      expect(mockGet).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(1);
      expect(result[0].SVCID).toBe('1');
    });

    it('should return empty array after all retries timeout when no cache exists', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockTimeout();
      mockTimeout();
      mockTimeout();

      const { fetchTennisAvailability } = await import('./seoulApi');
      const resultPromise = fetchTennisAvailability();

      await vi.advanceTimersByTimeAsync(30_000);
      const result = await resultPromise;

      expect(result).toEqual([]);
      expect(mockGet).toHaveBeenCalledTimes(3);
    });

    it('should fetch additional pages when list_total_count exceeds page size', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 1500,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '테니스장', SVCNM: '강남 테니스장', AREANM: '강남구' },
          ],
        },
      });

      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 1500,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '10', MINCLASSNM: '테니스장', SVCNM: '송파 테니스장', AREANM: '송파구' },
          ],
        },
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.SVCID)).toContain('1');
      expect(result.map(r => r.SVCID)).toContain('10');
    });

    it('should still return first page data when additional pages fail', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 1500,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            { SVCID: '1', MINCLASSNM: '테니스장', SVCNM: '강남 테니스장', AREANM: '강남구' },
          ],
        },
      });

      mockError(new Error('Page 2 network error'));

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0].SVCID).toBe('1');
    });

    it('should return stale cached data when all retries fail', async () => {
      vi.useFakeTimers();
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockSuccess(TENNIS_RESPONSE);

      const { fetchTennisAvailability } = await import('./seoulApi');

      const freshResult = await fetchTennisAvailability();
      expect(freshResult).toHaveLength(1);

      await vi.advanceTimersByTimeAsync(31 * 60 * 1000); // exceed 30-min cache TTL

      mockGet.mockReset();
      mockError(new Error('Network down'));
      mockError(new Error('Network down'));
      mockError(new Error('Network down'));

      const stalePromise = fetchTennisAvailability();
      await vi.advanceTimersByTimeAsync(10_000);
      const staleResult = await stalePromise;

      expect(staleResult).toEqual(freshResult);
      expect(mockGet).toHaveBeenCalledTimes(3);
    });
  });
});
