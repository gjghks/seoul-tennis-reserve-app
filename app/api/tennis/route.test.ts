import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/seoulApi', () => ({
  fetchTennisDataWithStatuses: vi.fn(),
  applyScrapedStatuses: vi.fn((services: unknown[]) => Promise.resolve(services)),
  getCachedTennisData: vi.fn(),
  getServedDataMeta: vi.fn(() => ({ lastUpdatedAt: '2026-06-20T00:00:00.000Z', isStale: false })),
}));

vi.mock('@/lib/utils/courtStatus', () => ({
  isCourtAvailable: vi.fn(),
}));

vi.mock('@/lib/data/independentCourts', () => ({
  isIndependentCourt: vi.fn((svcId: string) => svcId.startsWith('INDEP_')),
}));

const mockTennisData = [
  {
    SVCID: '1',
    SVCNM: '강남 테니스장',
    AREANM: '강남구',
    SVCSTATNM: '접수중',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    PAYATNM: '유료',
    PLACENM: '강남 테니스장',
    USETGTINFO: '성인',
    SVCURL: '',
    X: '127.0276',
    Y: '37.4979',
    SVCOPNBGNDT: '2024-01-01',
    SVCOPNENDDT: '2024-12-31',
    RCPTBGNDT: '2024-01-01',
    RCPTENDDT: '2024-12-31',
    IMGURL: '',
    DTLCONT: '',
    TELNO: '',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '7일전',
    REVSTDDAY: '7',
  },
  {
    SVCID: '2',
    SVCNM: '송파 테니스장',
    AREANM: '송파구',
    SVCSTATNM: '예약가능',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    PAYATNM: '유료',
    PLACENM: '송파 테니스장',
    USETGTINFO: '성인',
    SVCURL: '',
    X: '127.1063',
    Y: '37.5145',
    SVCOPNBGNDT: '2024-01-01',
    SVCOPNENDDT: '2024-12-31',
    RCPTBGNDT: '2024-01-01',
    RCPTENDDT: '2024-12-31',
    IMGURL: '',
    DTLCONT: '',
    TELNO: '',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '7일전',
    REVSTDDAY: '7',
  },
  {
    SVCID: '3',
    SVCNM: '강남 테니스장 2',
    AREANM: '강남구',
    SVCSTATNM: '접수마감',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    PAYATNM: '유료',
    PLACENM: '강남 테니스장 2',
    USETGTINFO: '성인',
    SVCURL: '',
    X: '127.0276',
    Y: '37.4979',
    SVCOPNBGNDT: '2024-01-01',
    SVCOPNENDDT: '2024-12-31',
    RCPTBGNDT: '2024-01-01',
    RCPTENDDT: '2024-12-31',
    IMGURL: '',
    DTLCONT: '',
    TELNO: '',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '7일전',
    REVSTDDAY: '7',
  },
];

describe('GET /api/tennis', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return all courts when no district filter is provided', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { isCourtAvailable } = await import('@/lib/utils/courtStatus');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockResolvedValue(mockTennisData);
    vi.mocked(isCourtAvailable).mockImplementation((status) => 
      status === '접수중' || status === '예약가능'
    );

    const request = new NextRequest('http://localhost:3000/api/tennis');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe(3);
    expect(data.courts).toHaveLength(3);
    expect(data.byDistrict).toBeDefined();
    expect(data.byDistrict['강남구'].count).toBe(2);
    expect(data.byDistrict['강남구'].available).toBe(1);
    expect(data.byDistrict['강남구'].externalCount).toBe(0);
    expect(data.byDistrict['송파구'].count).toBe(1);
    expect(data.byDistrict['송파구'].available).toBe(1);
    expect(data.byDistrict['송파구'].externalCount).toBe(0);
    expect(data.lastUpdated).toBeDefined();
  });

  it('should filter courts by district slug', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockResolvedValue(mockTennisData);

    const request = new NextRequest('http://localhost:3000/api/tennis?district=gangnam-gu');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.district).toBe('강남구');
    expect(data.count).toBe(2);
    expect(data.courts).toHaveLength(2);
    expect(data.courts[0].AREANM).toBe('강남구');
    expect(data.courts[1].AREANM).toBe('강남구');
  });

  it('should filter courts by Korean district name', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockResolvedValue(mockTennisData);

    const request = new NextRequest('http://localhost:3000/api/tennis?district=송파구');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.district).toBe('송파구');
    expect(data.count).toBe(1);
    expect(data.courts).toHaveLength(1);
    expect(data.courts[0].SVCNM).toBe('송파 테니스장');
  });

  it('should return empty array for non-existent district', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockResolvedValue(mockTennisData);

    const request = new NextRequest('http://localhost:3000/api/tennis?district=invalid-gu');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.district).toBe('invalid-gu');
    expect(data.count).toBe(0);
    expect(data.courts).toHaveLength(0);
  });

  it('should count external courts separately in externalCount', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { isCourtAvailable } = await import('@/lib/utils/courtStatus');
    const { GET } = await import('./route');

    const dataWithExternal = [
      ...mockTennisData,
      {
        SVCID: 'INDEP_GB001',
        SVCNM: '오동근린공원 테니스장',
        AREANM: '강북구',
        SVCSTATNM: '외부예약',
        MAXCLASSNM: '체육시설',
        MINCLASSNM: '테니스장',
        PAYATNM: '유료',
        PLACENM: '오동근린공원',
        USETGTINFO: '제한없음',
        SVCURL: '',
        X: '127.0435',
        Y: '37.6227',
        SVCOPNBGNDT: '',
        SVCOPNENDDT: '',
        RCPTBGNDT: '',
        RCPTENDDT: '',
        IMGURL: '',
        DTLCONT: '',
        TELNO: '',
        V_MIN: '06:00',
        V_MAX: '22:00',
        REVSTDDAYNM: '',
        REVSTDDAY: '',
      },
    ];

    vi.mocked(fetchTennisDataWithStatuses).mockResolvedValue(dataWithExternal);
    vi.mocked(isCourtAvailable).mockImplementation((status) =>
      status === '접수중' || status === '예약가능'
    );

    const request = new NextRequest('http://localhost:3000/api/tennis');
    const response = await GET(request);
    const data = await response.json();

    expect(data.byDistrict['강북구'].count).toBe(1);
    expect(data.byDistrict['강북구'].available).toBe(0);
    expect(data.byDistrict['강북구'].externalCount).toBe(1);
  });

  it('should return 500 error when fetchTennisDataWithStatuses throws', async () => {
    const { fetchTennisDataWithStatuses } = await import('@/lib/seoulApi');
    const { getCachedTennisData } = await import('@/lib/seoulApi');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockRejectedValue(new Error('API Error'));
    vi.mocked(getCachedTennisData).mockReturnValue(null);

    const request = new NextRequest('http://localhost:3000/api/tennis');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch tennis data');
  });

  it('should return 200 with stale data when fetchTennisDataWithStatuses throws and cache exists', async () => {
    const { fetchTennisDataWithStatuses, getCachedTennisData } = await import('@/lib/seoulApi');
    const { isCourtAvailable } = await import('@/lib/utils/courtStatus');
    const { GET } = await import('./route');

    vi.mocked(fetchTennisDataWithStatuses).mockRejectedValue(new Error('API Error'));
    vi.mocked(getCachedTennisData).mockReturnValue({
      data: mockTennisData,
      timestamp: Date.now() - 60_000,
    });
    vi.mocked(isCourtAvailable).mockImplementation((status) =>
      status === '접수중' || status === '예약가능'
    );

    const request = new NextRequest('http://localhost:3000/api/tennis');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stale).toBe(true);
    expect(data.total).toBe(3);
    expect(data.courts).toHaveLength(3);
    expect(data.byDistrict['강남구'].count).toBe(2);
    expect(data.byDistrict['송파구'].available).toBe(1);
    expect(data.lastUpdated).toBeDefined();
  });
});
