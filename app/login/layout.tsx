import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: '카카오 또는 구글 계정으로 로그인하여 즐겨찾기, 후기, 푸시 알림 기능을 이용하세요.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: '로그인 | 서울 테니스',
    description: '카카오 또는 구글 계정으로 로그인하여 즐겨찾기, 후기, 푸시 알림 기능을 이용하세요.',
    url: 'https://seoul-tennis.com/login',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
