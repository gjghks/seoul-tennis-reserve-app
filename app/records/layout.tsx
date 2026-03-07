import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '경기 기록',
  description: '나의 테니스 경기를 기록하고 승률, 세트 스코어, 코트별 전적 등 통계를 확인하세요.',
  alternates: {
    canonical: '/records',
  },
  openGraph: {
    title: '경기 기록 | 서울 테니스',
    description: '나의 테니스 경기를 기록하고 승률, 세트 스코어, 코트별 전적 등 통계를 확인하세요.',
    url: 'https://seoul-tennis.com/records',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
