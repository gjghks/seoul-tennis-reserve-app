import { fetchTennisAvailability } from '@/lib/seoulApi';
import HomeContent from '@/components/home/HomeContent';
import { DistrictStats } from '@/contexts/TennisDataContext';

export const revalidate = 300;

async function getInitialData(): Promise<Record<string, DistrictStats>> {
  try {
    const services = await fetchTennisAvailability();
    
    const byDistrict = services.reduce((acc, svc) => {
      const area = svc.AREANM;
      if (!acc[area]) {
        acc[area] = { count: 0, available: 0 };
      }
      acc[area].count++;
      if (svc.SVCSTATNM === '접수중' || svc.SVCSTATNM.includes('예약가능')) {
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
