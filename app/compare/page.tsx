import type { Metadata } from 'next';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { computeAllDistrictStats } from '@/lib/utils/districtStats';
import CompareContent from '@/components/compare/CompareContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '서울시 구별 테니스장 비교 | 서울 테니스',
  description:
    '서울시 25개 자치구 공공 테니스장을 한눈에 비교하세요. 시설 수, 예약 가능률, 무료 코트 비율, 경쟁률, 운영시간을 구별로 비교합니다.',
  keywords: [
    '서울 테니스장 비교',
    '구별 테니스장',
    '서울 공공 테니스장',
    '테니스장 추천',
    '테니스장 순위',
  ],
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: '서울시 구별 테니스장 비교 | 서울 테니스',
    description:
      '서울시 25개 자치구 공공 테니스장을 한눈에 비교하세요.',
    url: 'https://seoul-tennis.com/compare',
    type: 'website',
  },
};

export default async function ComparePage() {
  const services = await fetchTennisAvailability();
  const stats = computeAllDistrictStats(services);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '서울시 구별 테니스장 비교',
    description:
      '서울시 25개 자치구 공공 테니스장 시설 수, 예약률, 무료 비율, 경쟁률을 비교합니다.',
    url: 'https://seoul-tennis.com/compare',
    publisher: {
      '@type': 'Organization',
      name: '서울 테니스',
      url: 'https://seoul-tennis.com',
    },
    dateModified: stats.lastUpdated,
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
          name: '구별 비교',
          item: 'https://seoul-tennis.com/compare',
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
      <CompareContent stats={stats} />
    </>
  );
}
