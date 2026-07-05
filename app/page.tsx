import type { Metadata } from 'next';
import { fetchTennisDataWithStatuses } from '@/lib/seoulApi';
import HomeContent from '@/components/home/HomeContent';
import { DistrictStats } from '@/contexts/TennisDataContext';
import { buildByDistrict } from '@/lib/utils/tennisDistrictStats';

export const revalidate = 7200;

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

async function getInitialData(): Promise<Record<string, DistrictStats>> {
  try {
    const services = await fetchTennisDataWithStatuses();
    return buildByDistrict(services);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {};
  }
}

export default async function Home() {
  const initialStats = await getInitialData();

  return <HomeContent initialStats={initialStats} />;
}
