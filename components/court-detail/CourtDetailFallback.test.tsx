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
vi.mock('swr', () => ({
  default: (key: string | null) => {
    swrCalls.push(key);
    return { data: key ? swrData : undefined };
  },
}));

const district = { slug: 'gangnam-gu', nameKo: '강남구' } as District;

describe('CourtDetailFallback', () => {
  beforeEach(() => {
    received.length = 0;
    swrCalls.length = 0;
    swrData = undefined;
  });

  it('requests the full court record by svcId (list data has no detail text)', async () => {
    const { default: CourtDetailFallback } = await import('./CourtDetailFallback');
    render(<CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />);
    expect(swrCalls).toContain('/api/tennis?svcId=S1');
  });

  it('renders the list record first, then the full record once loaded', async () => {
    const { default: CourtDetailFallback } = await import('./CourtDetailFallback');
    const { getByTestId, rerender } = render(
      <CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />
    );
    expect(getByTestId('detail').textContent).toBe('(no detail)');

    swrData = { court: { ...listCourt, DTLCONT: '◎ 시설현황 상세' } };
    rerender(<CourtDetailFallback districtSlug="gangnam-gu" courtId="S1" district={district} />);
    expect(getByTestId('detail').textContent).toBe('◎ 시설현황 상세');
  });
});
