import type { Metadata } from 'next';
import TrendsContent from '@/components/trends/TrendsContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '경쟁률 트렌드 | 서울 테니스',
  description:
    '서울시 25개 구별 테니스장 예약 경쟁률을 실시간으로 확인하세요. 구별 마감률 비교, 시간대별 변화 추이를 제공합니다.',
  keywords: ['테니스장 경쟁률', '서울 테니스 예약', '마감률', '테니스장 트렌드'],
  alternates: { canonical: '/trends' },
  openGraph: {
    title: '경쟁률 트렌드 | 서울 테니스',
    description: '서울시 구별 테니스장 예약 경쟁률을 실시간으로 확인하세요.',
    url: 'https://seoul-tennis.com/trends',
    type: 'website',
  },
};

export default function TrendsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '경쟁률 트렌드',
    description: '서울시 구별 테니스장 예약 경쟁률 트렌드',
    url: 'https://seoul-tennis.com/trends',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://seoul-tennis.com' },
        { '@type': 'ListItem', position: 2, name: '경쟁률 트렌드', item: 'https://seoul-tennis.com/trends' },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrendsContent />
    </>
  );
}
