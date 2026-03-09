import useSWR from 'swr';
import type { TransferInterest } from '@/lib/constants/transfers';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseTransferInterestOptions {
  transferId: string;
  enabled?: boolean;
}

export function useTransferInterest({ transferId, enabled = true }: UseTransferInterestOptions) {
  const { data, error, isLoading, mutate } = useSWR<{
    myInterest: TransferInterest | null;
    interests: TransferInterest[];
    isSeller: boolean;
  }>(
    enabled && transferId ? `/api/transfers/${transferId}/interest` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const expressInterest = async (message?: string) => {
    const res = await fetch(`/api/transfers/${transferId}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '관심 표시에 실패했습니다.');
    }
    await mutate();
    return res.json();
  };

  const withdrawInterest = async () => {
    const res = await fetch(`/api/transfers/${transferId}/interest`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '관심 철회에 실패했습니다.');
    }
    await mutate();
  };

  const updateInterestStatus = async (interestId: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`/api/transfers/${transferId}/interest`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interest_id: interestId, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '상태 변경에 실패했습니다.');
    }
    await mutate();
    return res.json();
  };

  return {
    myInterest: data?.myInterest ?? null,
    interests: data?.interests ?? [],
    isSeller: data?.isSeller ?? false,
    isLoading,
    error,
    mutate,
    expressInterest,
    withdrawInterest,
    updateInterestStatus,
  };
}
