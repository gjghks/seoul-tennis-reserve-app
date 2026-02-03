import { fetchTennisAvailability, SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';
import DistrictContent from '@/components/district/DistrictContent';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 300;

interface DistrictPageProps {
  params: Promise<{
    district: string;
  }>;
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { district } = await params;
  const koreanDistrict = SLUG_TO_KOREAN[district];
  
  if (!koreanDistrict) {
    return { title: '페이지를 찾을 수 없습니다' };
  }

  return {
    title: `${koreanDistrict} 테니스장`,
    description: `${koreanDistrict} 공공 테니스장 예약 현황을 확인하세요.`,
  };
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_KOREAN).map((district) => ({
    district,
  }));
}

async function getDistrictCourts(district: string): Promise<{ courts: SeoulService[]; districtName: string } | null> {
  const koreanDistrict = SLUG_TO_KOREAN[district];
  
  if (!koreanDistrict) {
    return null;
  }

  try {
    const services = await fetchTennisAvailability();
    const filtered = services.filter(s => s.AREANM === koreanDistrict);
    
    const sorted = [...filtered].sort((a, b) => {
      const isAAvailable = a.SVCSTATNM === '접수중';
      const isBAvailable = b.SVCSTATNM === '접수중';
      if (isAAvailable && !isBAvailable) return -1;
      if (!isAAvailable && isBAvailable) return 1;
      return 0;
    });

    return {
      courts: sorted,
      districtName: koreanDistrict,
    };
  } catch (error) {
    console.error('Failed to fetch district courts:', error);
    return {
      courts: [],
      districtName: koreanDistrict,
    };
  }
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { district } = await params;
  const data = await getDistrictCourts(district);

  if (!data) {
    notFound();
  }

  return (
    <DistrictContent 
      district={district}
      initialCourts={data.courts}
      districtName={data.districtName}
    />
  );
}
