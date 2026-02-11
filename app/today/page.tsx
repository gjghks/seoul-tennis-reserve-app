import type { Metadata } from 'next';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import TodayContent from '@/components/today/TodayContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '오늘 예약 가능한 테니스장 | 서울 테니스',
  description:
    '서울시 공공 테니스장 중 오늘 예약 가능한 시설을 실시간으로 확인하세요. 지역별로 그룹화된 예약 가능한 테니스 코트를 한눈에 보고 바로 예약하세요.',
  keywords: [
    '오늘 예약 가능',
    '테니스장 예약',
    '서울 테니스장',
    '공공 테니스장',
    '실시간 예약',
    '테니스 코트',
  ],
  alternates: {
    canonical: '/today',
  },
  openGraph: {
    title: '오늘 예약 가능한 테니스장 | 서울 테니스',
    description:
      '서울시 공공 테니스장 중 오늘 예약 가능한 시설을 실시간으로 확인하세요.',
    url: 'https://seoul-tennis.com/today',
    type: 'website',
  },
};

export default async function TodayPage() {
  const services = await fetchTennisAvailability();

  const availableCourts = services.filter((court) =>
    isCourtAvailable(court.SVCSTATNM)
  );

  const groupedByDistrict = availableCourts.reduce(
    (acc, court) => {
      const district = court.AREANM;
      if (!acc[district]) {
        acc[district] = [];
      }
      acc[district].push(court);
      return acc;
    },
    {} as Record<string, typeof availableCourts>
  );

  const totalAvailable = availableCourts.length;
  const totalDistricts = Object.keys(groupedByDistrict).length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '오늘 예약 가능한 테니스장',
    description:
      '서울시 공공 테니스장 중 오늘 예약 가능한 시설을 실시간으로 확인하세요.',
    url: 'https://seoul-tennis.com/today',
    publisher: {
      '@type': 'Organization',
      name: '서울 테니스',
      url: 'https://seoul-tennis.com',
    },
    dateModified: new Date().toISOString(),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: 'https://seoul-tennis.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '오늘 예약 가능',
          item: 'https://seoul-tennis.com/today',
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TodayContent
        courts={groupedByDistrict}
        totalAvailable={totalAvailable}
        totalDistricts={totalDistricts}
      />
    </>
  );
}
