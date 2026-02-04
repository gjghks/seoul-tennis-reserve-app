'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR, { SWRConfig } from 'swr';
import { SeoulService } from '@/lib/seoulApi';

export interface DistrictStats {
  count: number;
  available: number;
}

export interface TennisApiResponse {
  total: number;
  byDistrict: Record<string, DistrictStats>;
  courts: SeoulService[];
  lastUpdated?: string;
}

interface TennisDataContextType {
  data: TennisApiResponse | undefined;
  stats: Record<string, DistrictStats> | undefined;
  courts: SeoulService[];
  isLoading: boolean;
  error: Error | undefined;
  lastUpdated: string | undefined;
  mutate: () => Promise<TennisApiResponse | undefined>;
}

const TennisDataContext = createContext<TennisDataContextType | null>(null);

const fetcher = async (url: string): Promise<TennisApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tennis data');
  return res.json();
};

export function useTennisData() {
  const context = useContext(TennisDataContext);
  if (!context) {
    throw new Error('useTennisData must be used within TennisDataProvider');
  }
  return context;
}

export function useDistrictCourts(district: string) {
  const { courts, isLoading, error } = useTennisData();
  
  const filteredCourts = courts.filter(c => c.AREANM === district);
  const sortedCourts = [...filteredCourts].sort((a, b) => {
    const isAAvailable = a.SVCSTATNM === '접수중';
    const isBAvailable = b.SVCSTATNM === '접수중';
    if (isAAvailable && !isBAvailable) return -1;
    if (!isAAvailable && isBAvailable) return 1;
    return 0;
  });

  return {
    courts: sortedCourts,
    isLoading,
    error,
    district,
  };
}

function TennisDataProviderInner({ 
  children,
  initialData 
}: { 
  children: ReactNode;
  initialData?: TennisApiResponse;
}) {
  const { data, error, isLoading, mutate } = useSWR<TennisApiResponse>(
    '/api/tennis',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
      dedupingInterval: 60 * 1000, // 1분 내 중복 요청 방지
    }
  );

  const value: TennisDataContextType = {
    data,
    stats: data?.byDistrict,
    courts: data?.courts || [],
    isLoading: isLoading && !data,
    error,
    lastUpdated: data?.lastUpdated,
    mutate,
  };

  return (
    <TennisDataContext.Provider value={value}>
      {children}
    </TennisDataContext.Provider>
  );
}

export function TennisDataProvider({ 
  children,
  initialData 
}: { 
  children: ReactNode;
  initialData?: TennisApiResponse;
}) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        isOnline() {
          return typeof navigator !== 'undefined' ? navigator.onLine : true;
        },
        isVisible() {
          return typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
        },
      }}
    >
      <TennisDataProviderInner initialData={initialData}>
        {children}
      </TennisDataProviderInner>
    </SWRConfig>
  );
}
