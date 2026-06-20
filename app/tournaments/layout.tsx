import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '테니스 대회',
  description: '동호회 테니스 대회를 만들고 대진표·실시간 스코어·순위를 관리하세요. 싱글 엘리미네이션 토너먼트를 손쉽게 운영하고 공유할 수 있습니다.',
  alternates: {
    canonical: '/tournaments',
  },
  openGraph: {
    title: '테니스 대회 | 서울 테니스',
    description: '대진표·실시간 스코어·순위까지, 동호회 테니스 대회를 손쉽게 운영하세요.',
    url: 'https://seoul-tennis.com/tournaments',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
