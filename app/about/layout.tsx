import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: '서울 테니스 서비스 소개 — 서울시 25개 자치구 공공 테니스장 예약 현황을 실시간으로 확인하세요.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: '서비스 소개 | 서울 테니스',
    description: '서울 테니스 서비스 소개 — 서울시 25개 자치구 공공 테니스장 예약 현황을 실시간으로 확인하세요.',
    url: 'https://seoul-tennis.com/about',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
