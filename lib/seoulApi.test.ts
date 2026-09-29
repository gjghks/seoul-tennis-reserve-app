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
      expect(getCachedTennisData()).toEqual({ data: [], timestamp: expect.any(Number), isPartial: false });
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

    it('should flag served meta as partial and not cache-hit as complete when additional pages fail', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');

      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 1500,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [{ SVCID: '1', MINCLASSNM: '테니스장', SVCNM: '강남 테니스장', AREANM: '강남구' }],
        },
      });
      mockError(new Error('Page 2 network error'));

      const { fetchTennisAvailability, getServedDataMeta } = await import('./seoulApi');
      await fetchTennisAvailability();
      expect(getServedDataMeta().isPartial).toBe(true);

      // A fresh-cache hit keeps reporting the partial flag
      await fetchTennisAvailability();
      expect(getServedDataMeta().isPartial).toBe(true);
    });

    it('should report complete (not partial) data when every page succeeds', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      mockSuccess(TENNIS_RESPONSE);

      const { fetchTennisAvailability, getServedDataMeta } = await import('./seoulApi');
      await fetchTennisAvailability();

      expect(getServedDataMeta()).toMatchObject({ isStale: false, isPartial: false });
    });

    it('should apply facility hours overrides and decode SVCURL on the live path', async () => {
      vi.stubEnv('SEOUL_OPEN_DATA_KEY', 'test-api-key');
      mockSuccess({
        ListPublicReservationSport: {
          list_total_count: 2,
          RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
          row: [
            {
              SVCID: 'S1', MINCLASSNM: '테니스장', SVCNM: '삼청테니스장 코트이용(평일)', AREANM: '종로구',
              PLACENM: '삼청테니스장', V_MIN: '06:00', V_MAX: '16:00', SVCURL: 'https://x.kr/?a=1&amp;amp;b=2',
            },
            {
              SVCID: 'S2', MINCLASSNM: '테니스장', SVCNM: '삼청테니스장 코트이용(주말)', AREANM: '종로구',
              PLACENM: '삼청테니스장', V_MIN: '06:00', V_MAX: '18:00',
            },
          ],
        },
      });

      const { fetchTennisAvailability } = await import('./seoulApi');
      const result = await fetchTennisAvailability();

      expect(result.find(r => r.SVCID === 'S1')).toMatchObject({ V_MIN: '06:00', V_MAX: '21:00', SVCURL: 'https://x.kr/?a=1&b=2' });
      expect(result.find(r => r.SVCID === 'S2')).toMatchObject({ V_MIN: '06:00', V_MAX: '18:00' });
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

  describe('decodeUrlAmpEntities', () => {
    it('decodes single and double-escaped &amp;', async () => {
      const { decodeUrlAmpEntities } = await import('./seoulApi');
      expect(decodeUrlAmpEntities('https://a.kr/?x=1&amp;y=2')).toBe('https://a.kr/?x=1&y=2');
      expect(decodeUrlAmpEntities('https://a.kr/?x=1&amp;amp;y=2')).toBe('https://a.kr/?x=1&y=2');
      expect(decodeUrlAmpEntities('https://a.kr/?x=1&y=2')).toBe('https://a.kr/?x=1&y=2');
    });
  });

  describe('mergeWithIndependentCourts', () => {
    const row = (over: Record<string, string>) => ({
      SVCID: 'S1', AREANM: '서대문구', PLACENM: '', SVCNM: '', SVCSTATNM: '접수중', ...over,
    }) as unknown as import('./seoulApi').SeoulService;
    const hyeonjeo = row({ SVCID: 'INDEP_SDM001', PLACENM: '현저테니스장', SVCNM: '현저테니스장', SVCSTATNM: '외부예약' });
    const other = row({ SVCID: 'INDEP_X001', AREANM: '강서구', PLACENM: '독립', SVCSTATNM: '외부예약' });

    it('keeps the 현저 independent fallback while the Seoul API has no 현저 rows', async () => {
      const { mergeWithIndependentCourts } = await import('./seoulApi');
      const merged = mergeWithIndependentCourts([row({ SVCID: 'S9', PLACENM: '가좌테니스장' })], [hyeonjeo, other]);
      expect(merged.map(c => c.SVCID)).toEqual(['S9', 'INDEP_SDM001', 'INDEP_X001']);
    });

    it('drops the 현저 fallback once the Seoul API lists 현저 again', async () => {
      const { mergeWithIndependentCourts } = await import('./seoulApi');
      const merged = mergeWithIndependentCourts([row({ SVCID: 'S5', PLACENM: '현저테니스장' })], [hyeonjeo, other]);
      expect(merged.map(c => c.SVCID)).toEqual(['S5', 'INDEP_X001']);
    });

    it('replaces stale INDEP rows from a cache/snapshot with the current static data', async () => {
      const { mergeWithIndependentCourts } = await import('./seoulApi');
      const staleIndep = { ...other, DTLCONT: 'old', SVCSTATNM: '접수중' };
      const merged = mergeWithIndependentCourts([row({ SVCID: 'S9' }), staleIndep], [other]);
      expect(merged).toHaveLength(2);
      expect(merged[1]).toBe(other);
    });

    it('excludes Seoul API rows superseded by independent entries (다락원)', async () => {
      const { mergeWithIndependentCourts } = await import('./seoulApi');
      const darak = row({ SVCID: 'S7', AREANM: '도봉구', PLACENM: '다락원 체육공원' });
      expect(mergeWithIndependentCourts([darak], [])).toEqual([]);
    });
  });

  describe('normalizeCourts', () => {
    const base = {
      SVCID: 'S1', AREANM: '양천구', PLACENM: '서울에너지공사 목동 테니스장 2면',
      SVCNM: '서울에너지공사 목동 테니스장 2면 (공휴일) 08:00~18:00', V_MIN: '03:00', V_MAX: '19:00',
      IMGURL: 'http://img', SVCURL: '', DTLCONT: 'x',
    } as unknown as import('./seoulApi').SeoulService;

    it('overrides wrong non-empty API hours for 서울에너지공사 목동 and upgrades image to https', async () => {
      const { normalizeCourts } = await import('./seoulApi');
      const [court] = normalizeCourts([base]);
      expect(court).toMatchObject({ V_MIN: '08:00', V_MAX: '18:00', IMGURL: 'https://img' });
    });

    it('does not mutate the input objects and is idempotent', async () => {
      const { normalizeCourts } = await import('./seoulApi');
      const once = normalizeCourts([base]);
      expect(base.V_MIN).toBe('03:00');
      expect(normalizeCourts(once)).toEqual(once);
    });

    it('fills an empty DTLCONT for 손기정 XML-son12 with weekday/weekend hours, but never replaces API text', async () => {
      const { normalizeCourts } = await import('./seoulApi');
      const son = { ...base, SVCID: 'XML-son12', AREANM: '중구', PLACENM: '손기정문화체육센터 테니스장', SVCNM: '손기정', V_MIN: '', V_MAX: '', DTLCONT: '' };
      const [filled] = normalizeCourts([son]);
      expect(filled.DTLCONT).toContain('토·일·공휴일 07:00~20:00');
      const [kept] = normalizeCourts([{ ...son, DTLCONT: 'API 설명' }]);
      expect(kept.DTLCONT).toBe('API 설명');
    });
  });
});
