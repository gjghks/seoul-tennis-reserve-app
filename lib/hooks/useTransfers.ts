import useSWR from 'swr';
import type { CourtTransfer, TransferStatus } from '@/lib/constants/transfers';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseTransfersOptions {
  limit?: number;
  offset?: number;
  district?: string;
  status?: TransferStatus;
  my?: boolean;
}

export function useTransfers(options: UseTransfersOptions = {}) {
  const { limit = 20, offset = 0, district, status = 'available', my } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    status,
  });
  if (my) params.set('my', 'true');
  if (district) params.set('district', district);

  const { data, error, isLoading, mutate } = useSWR<{ transfers: CourtTransfer[]; total: number }>(
    `/api/transfers?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );

  return {
    transfers: data?.transfers ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
