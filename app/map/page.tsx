import type { Metadata } from 'next';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import MapDiscoveryContent from '@/components/map/MapDiscoveryContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '지도로 찾기 | 서울 테니스',
  description:
    '서울시 공공 테니스장을 지도에서 찾아보세요. 내 위치 주변 예약 가능한 코트를 한눈에 확인할 수 있습니다.',
  keywords: [
    '테니스장 지도',
    '서울 테니스장 위치',
    '내 주변 테니스장',
    '테니스장 찾기',
    '공공 테니스장 지도',
  ],
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: '지도로 찾기 | 서울 테니스',
    description:
      '서울시 공공 테니스장을 지도에서 찾아보세요. 내 위치 주변 예약 가능한 코트를 한눈에 확인합니다.',
    url: 'https://seoul-tennis.com/map',
    type: 'website',
  },
};

export default async function MapPage() {
  const courts = await fetchTennisAvailability();
  return <MapDiscoveryContent courts={courts} />;
}
