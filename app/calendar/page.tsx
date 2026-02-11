import type { Metadata } from 'next';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import CalendarContent from '@/components/calendar/CalendarContent';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '예약 캘린더 | 서울 테니스',
  description:
    '서울시 공공 테니스장 접수 일정을 월간 캘린더로 한눈에 확인하세요. 날짜별 접수 가능한 코트 수와 상세 정보를 제공합니다.',
  keywords: ['테니스장 캘린더', '서울 테니스 예약 일정', '접수 캘린더', '테니스장 스케줄'],
  alternates: { canonical: '/calendar' },
  openGraph: {
    title: '예약 캘린더 | 서울 테니스',
    description: '서울시 공공 테니스장 접수 일정을 월간 캘린더로 확인하세요.',
    url: 'https://seoul-tennis.com/calendar',
    type: 'website',
  },
};

export default async function CalendarPage() {
  const courts = await fetchTennisAvailability();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '예약 캘린더',
    description: '서울시 공공 테니스장 접수 일정 캘린더',
    url: 'https://seoul-tennis.com/calendar',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://seoul-tennis.com' },
        { '@type': 'ListItem', position: 2, name: '예약 캘린더', item: 'https://seoul-tennis.com/calendar' },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CalendarContent courts={courts} />
    </>
  );
}
