import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';

const { mockRequest, agentOptions } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
  agentOptions: [] as unknown[],
}));
vi.mock('node:https', () => ({
  default: {
    request: mockRequest,
    Agent: class {
      constructor(options: unknown) {
        agentOptions.push(options);
      }
    },
  },
}));

import {
  FMCS_SCRAPE_TARGETS,
  resolveTodayStatus,
  scrapeFmcsCourt,
  type FmcsMonthStateItem,
} from './fmcsScraper';

// Trimmed from live dfmc responses captured 2026-09-29
// (POST https://www.dfmc.kr:8443/course/sports/rest/facilities/place_month_state_list)
function item(date: string, state_cd: string, state_nm: string, place_cd = '3'): FmcsMonthStateItem {
  return { comcd: 'DFMC02', part_cd: '09', place_cd, date, state_cd, state_nm } as FmcsMonthStateItem;
}

const IMUN_COURT_A = [
  item('2026-09-29', '10', '마감'),
  item('2026-09-30', '10', '예약가능'),
  item('2026-10-04', '20', '예약완료'),
  item('2026-10-05', '20', '예약불가'),
  item('2026-10-06', '10', '예약가능'),
];
const IMUN_COURT_B = [
  item('2026-09-29', '10', '마감', '4'),
  item('2026-09-30', '10', '예약가능', '4'),
  item('2026-10-04', '20', '예약완료', '4'),
  item('2026-10-05', '20', '예약불가', '4'),
  item('2026-10-06', '30', '휴관일', '4'),
];

describe('FMCS_SCRAPE_TARGETS (dfmc)', () => {
  it('uses the /course/sports/rest root and live place codes for 동대문 courts', () => {
    const imun = FMCS_SCRAPE_TARGETS.find((t) => t.svcId === 'INDEP_DD002');
    const jungnangcheon = FMCS_SCRAPE_TARGETS.find((t) => t.svcId === 'INDEP_DD003');

    expect(imun).toMatchObject({ restPath: '/course/sports/rest', companyCode: 'DFMC02', partCode: '09', placeCodes: ['3', '4'] });
    expect(jungnangcheon).toMatchObject({ restPath: '/course/sports/rest', companyCode: 'DFMC09', partCode: '03', placeCodes: ['2', '3'] });
  });
});

describe('resolveTodayStatus', () => {
  it('counts each court that is 예약가능 today', () => {
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-09-30')).toEqual({
      status: '접수중',
      availableSlots: 2,
      totalSlots: 2,
    });
  });

  it('treats state_cd 10 with state_nm 마감 (same-day cutoff) as closed', () => {
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-09-29')).toEqual({
      status: '예약마감',
      availableSlots: 0,
      totalSlots: 2,
    });
  });

  it('maps state_cd 20 (예약완료/예약불가) to 예약마감', () => {
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-10-04')?.status).toBe('예약마감');
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-10-05')?.status).toBe('예약마감');
  });

  it('is 접수중 when at least one court is open even if another is 휴관일', () => {
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-10-06')).toEqual({
      status: '접수중',
      availableSlots: 1,
      totalSlots: 2,
    });
  });

  it('does not treat state_cd 20 예약예정 (not open yet) as 예약마감', () => {
    expect(resolveTodayStatus([[item('2026-10-07', '20', '예약예정')]], '2026-10-07')?.status).toBe('외부예약');
    expect(
      resolveTodayStatus([[item('2026-10-07', '20', '예약예정')], [item('2026-10-07', '20', '예약완료', '4')]], '2026-10-07')?.status,
    ).toBe('예약마감');
  });

  it('falls back to 외부예약 when every court is 휴관일 (state_cd 30)', () => {
    expect(resolveTodayStatus([[item('2026-10-06', '30', '휴관일')]], '2026-10-06')?.status).toBe('외부예약');
  });

  it('returns null when today is missing from every court', () => {
    expect(resolveTodayStatus([IMUN_COURT_A, IMUN_COURT_B], '2026-12-25')).toBeNull();
  });
});

type Responder = (url: string, body: string) => { status: number; json: unknown };

/** Mock https.request: collect the written body, then answer via `respond`. */
function mockHttps(respond: Responder): void {
  mockRequest.mockImplementation(
    (url: string, _opts: unknown, callback: (res: EventEmitter & { statusCode: number }) => void) => {
      const req = Object.assign(new EventEmitter(), {
        destroy: vi.fn(),
        end: (body: string) => {
          const { status, json } = respond(url, body);
          const res = Object.assign(new EventEmitter(), { statusCode: status });
          Promise.resolve().then(() => {
            callback(res);
            res.emit('data', Buffer.from(JSON.stringify(json)));
            res.emit('end');
          });
        },
      });
      return req;
    },
  );
}

describe('scrapeFmcsCourt', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // 2026-09-30 10:00 KST
    vi.setSystemTime(new Date('2026-09-30T01:00:00Z'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockRequest.mockReset();
  });

  const imun = FMCS_SCRAPE_TARGETS.find((t) => t.svcId === 'INDEP_DD002')!;

  it('POSTs one month-state request per court to the dfmc /course/sports/rest endpoint', async () => {
    mockHttps((_url, body) => {
      const place = new URLSearchParams(body).get('place_code');
      return { status: 200, json: place === '3' ? IMUN_COURT_A : IMUN_COURT_B };
    });

    const result = await scrapeFmcsCourt(imun);

    expect(result).toMatchObject({ svcId: 'INDEP_DD002', status: '접수중', availableSlots: 2, totalSlots: 2 });
    expect(mockRequest).toHaveBeenCalledTimes(2);
    const [url, opts] = mockRequest.mock.calls[0];
    expect(url).toBe('https://www.dfmc.kr:8443/course/sports/rest/facilities/place_month_state_list');
    expect(opts).toMatchObject({ method: 'POST' });
  });

  it('sends company/part/base_date/place codes in the form body', async () => {
    const bodies: string[] = [];
    mockHttps((_url, body) => {
      bodies.push(body);
      return { status: 200, json: IMUN_COURT_A };
    });

    await scrapeFmcsCourt(imun);

    const first = new URLSearchParams(bodies[0]);
    expect(first.get('company_code')).toBe('DFMC02');
    expect(first.get('part_code')).toBe('09');
    expect(first.get('base_date')).toBe('20260930');
    expect(bodies.map((b) => new URLSearchParams(b).get('place_code'))).toEqual(['3', '4']);
  });

  it('falls back to 외부예약 on the FMCS error payload for invalid codes', async () => {
    mockHttps(() => ({ status: 200, json: { description: 'User-Defined Exception (1)', error: true, message: '오류' } }));

    const result = await scrapeFmcsCourt(imun);

    expect(result).toMatchObject({ svcId: 'INDEP_DD002', status: '외부예약', availableSlots: 0, totalSlots: 0 });
  });

  it('falls back to 외부예약 on a non-2xx response', async () => {
    mockHttps(() => ({ status: 404, json: {} }));

    const result = await scrapeFmcsCourt(imun);

    expect(result).toMatchObject({ svcId: 'INDEP_DD002', status: '외부예약' });
  });

  it('skips certificate verification only via a scoped agent, never the process-wide env', async () => {
    const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    let envDuringRequest: string | undefined = 'unset-sentinel';
    mockHttps(() => {
      envDuringRequest = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      return { status: 200, json: IMUN_COURT_A };
    });

    await Promise.all(FMCS_SCRAPE_TARGETS.map((t) => scrapeFmcsCourt(t)));

    expect(envDuringRequest).toBeUndefined();
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined();
    expect(agentOptions).toContainEqual({ rejectUnauthorized: false });
    const agents = mockRequest.mock.calls.map(([, opts]) => (opts as { agent: unknown }).agent);
    expect(agents.every((a) => a && a === agents[0])).toBe(true);
    if (prev !== undefined) process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev;
  });
});
