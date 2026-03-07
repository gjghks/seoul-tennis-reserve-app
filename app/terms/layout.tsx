import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: '서울 테니스 서비스 이용약관입니다.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: '이용약관 | 서울 테니스',
    description: '서울 테니스 서비스 이용약관입니다.',
    url: 'https://seoul-tennis.com/terms',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
