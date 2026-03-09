import { Metadata } from 'next';
import TransfersContent from '@/components/transfers/TransfersContent';

export const metadata: Metadata = {
  title: '양도 마켓 - 서울 테니스',
  description: '서울 지역 공공 테니스장 예약 양도 및 나눔을 확인하세요.',
};

export default function TransfersPage() {
  return <TransfersContent />;
}