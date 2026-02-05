import type { Metadata } from 'next';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import HomeContent from '@/components/home/HomeContent';
import { DistrictStats } from '@/contexts/TennisDataContext';
import { isCourtAvailable } from '@/lib/utils/courtStatus';

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

async function getInitialData(): Promise<Record<string, DistrictStats>> {
  try {
    const services = await fetchTennisAvailability();
    
    const byDistrict = services.reduce((acc, svc) => {
      const area = svc.AREANM;
      if (!acc[area]) {
        acc[area] = { count: 0, available: 0 };
      }
      acc[area].count++;
      if (isCourtAvailable(svc.SVCSTATNM)) {
        acc[area].available++;
      }
      return acc;
    }, {} as Record<string, DistrictStats>);

    return byDistrict;
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {};
  }
}

export default async function Home() {
  const initialStats = await getInitialData();

  return <HomeContent initialStats={initialStats} />;
}
