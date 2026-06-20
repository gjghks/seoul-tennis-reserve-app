import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오픈 매칭',
  description: '서울 곳곳에서 함께 칠 테니스 파트너를 찾아보세요. 날짜·지역·실력대별 오픈 매칭 모집글을 확인하고 바로 신청할 수 있습니다.',
  alternates: {
    canonical: '/matching',
  },
  openGraph: {
    title: '오픈 매칭 | 서울 테니스',
    description: '날짜·지역·실력대별 테니스 파트너 모집글을 확인하고 신청하세요.',
    url: 'https://seoul-tennis.com/matching',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
