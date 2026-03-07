import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '문의하기',
  description: '서울 테니스 서비스에 대한 문의, 버그 제보, 개선 제안을 보내주세요.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: '문의하기 | 서울 테니스',
    description: '서울 테니스 서비스에 대한 문의, 버그 제보, 개선 제안을 보내주세요.',
    url: 'https://seoul-tennis.com/contact',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
