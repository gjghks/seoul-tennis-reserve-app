import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '서울 테니스 개인정보 처리방침 — 수집하는 개인정보 항목, 이용 목적, 보유 기간을 안내합니다.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: '개인정보 처리방침 | 서울 테니스',
    description: '서울 테니스 개인정보 처리방침 — 수집하는 개인정보 항목, 이용 목적, 보유 기간을 안내합니다.',
    url: 'https://seoul-tennis.com/privacy',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
