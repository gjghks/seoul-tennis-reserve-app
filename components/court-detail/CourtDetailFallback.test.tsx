import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { SeoulService } from '@/lib/seoulApi';
import type { District } from '@/lib/constants/districts';

const received: SeoulService[] = [];
vi.mock('./CourtDetailClient', () => ({
  default: ({ court }: { court: SeoulService }) => {
    received.push(court);
    return <div data-testid="detail">{court.DTLCONT || '(no detail)'}</div>;
  },
}));

const listCourt = { SVCID: 'S1', SVCNM: '테스트', AREANM: '강남구', DTLCONT: '' } as SeoulService;
vi.mock('@/contexts/TennisDataContext', () => ({
  useTennisData: () => ({ courts: [listCourt], isLoading: false, error: undefined, mutate: vi.fn() }),
}));

vi.mock('@/lib/cn', () => ({ useThemeClass: () => (a: string) => a }));

const swrCalls: (string | null)[] = [];
let swrData: unknown;
let swrError: unknown;
let swrLoading = false;
vi.mock('swr', () => ({
  default: (key: string | null) => {
    swrCalls.push(key);
    return key ? { data: swrData, error: swrError, isLoading: swrLoading } : { data: undefined, isLoading: false };
  },
}));

const district = { slug: 'gangnam-gu', nameKo: '강남구' } as District;

describe('CourtDetailFallback', () => {
  beforeEach(() => {
    received.length = 0;
    swrCalls.length = 0;
    swrData = undefined;
    swrError = undefined;
    swrLoading = false;
  });

  it('requests the full court record by svcId (list data has no detail text)', async () => {
    const { default: CourtDetailFallback } = await import('./CourtDetailFallback');
    render(<CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />);
    expect(swrCalls).toContain('/api/tennis?svcId=S1');
  });

  it('waits for the full record instead of flashing the detail-less list record', async () => {
    const { default: CourtDetailFallback } = await import('./CourtDetailFallback');
    swrLoading = true;
    const { queryByTestId, getByTestId, rerender } = render(
      <CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />
    );
    expect(queryByTestId('detail')).toBeNull();

    swrLoading = false;
    swrData = { court: { ...listCourt, DTLCONT: '◎ 시설현황 상세' } };
    rerender(<CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />);
    expect(getByTestId('detail').textContent).toBe('◎ 시설현황 상세');
  });

  it('falls back to the list record when the full-record request fails', async () => {
    const { default: CourtDetailFallback } = await import('./CourtDetailFallback');
    swrError = new Error('boom');
    const { getByTestId } = render(<CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />);
    expect(getByTestId('detail').textContent).toBe('(no detail)');
  });
});
