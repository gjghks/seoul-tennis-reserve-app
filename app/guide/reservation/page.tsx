import type { Metadata } from 'next';
import ReservationGuideContent from '@/components/guide/ReservationGuideContent';

export const metadata: Metadata = {
  title: '예약 가이드 | 서울 테니스',
  description: '서울시 공공 테니스장 예약 방법을 알려드립니다. 통합회원 가입부터 예약 완료까지 단계별 가이드.',
  openGraph: {
    title: '예약 가이드 | 서울 테니스',
    description: '서울시 공공 테니스장 예약 방법을 알려드립니다. 통합회원 가입부터 예약 완료까지 단계별 가이드.',
    url: 'https://seoul-tennis.com/guide/reservation',
    type: 'article',
  },
};

export default function ReservationGuidePage() {
  return <ReservationGuideContent />;
}
