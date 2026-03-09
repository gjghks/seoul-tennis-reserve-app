import { Metadata } from 'next';
import TransfersGuideContent from '@/components/guide/TransfersGuideContent';

export const metadata: Metadata = {
  title: '양도 마켓 가이드 - 서울 테니스',
  description: '서울 지역 공공 테니스장 양도 서비스 이용 방법을 알아보세요.',
};

export default function TransfersGuidePage() {
  return <TransfersGuideContent />;
}