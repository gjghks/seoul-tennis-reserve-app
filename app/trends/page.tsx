import type { Metadata } from 'next';
import TrendsContent from '@/components/trends/TrendsContent';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: '예약 타이밍 가이드 | 서울 테니스',
  description:
    '서울시 테니스장 예약 경쟁이 가장 적은 요일과 시간대를 확인하세요. 요일별·시간대별 패턴 분석과 일별 마감률 추이를 제공합니다.',
  keywords: ['테니스장 경쟁률', '서울 테니스 예약', '예약 타이밍', '테니스장 트렌드'],
  alternates: { canonical: '/trends' },
  openGraph: {
    title: '예약 타이밍 가이드 | 서울 테니스',
    description: '서울시 테니스장 예약 경쟁이 가장 적은 요일과 시간대를 확인하세요.',
    url: 'https://seoul-tennis.com/trends',
    type: 'website',
  },
};

export default function TrendsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '예약 타이밍 가이드',
    description: '서울시 테니스장 예약 경쟁이 적은 요일·시간대 분석',
    url: 'https://seoul-tennis.com/trends',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://seoul-tennis.com' },
        { '@type': 'ListItem', position: 2, name: '예약 타이밍 가이드', item: 'https://seoul-tennis.com/trends' },
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
