import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '새 경기 기록',
  description: '테니스 경기 결과를 기록하세요 — 스코어, 상대, 코트, 비용 등을 입력할 수 있습니다.',
  alternates: {
    canonical: '/records/new',
  },
  openGraph: {
    title: '새 경기 기록 | 서울 테니스',
    description: '테니스 경기 결과를 기록하세요 — 스코어, 상대, 코트, 비용 등을 입력할 수 있습니다.',
    url: 'https://seoul-tennis.com/records/new',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
