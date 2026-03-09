import { Metadata } from 'next';
import LadderGuideContent from '@/components/guide/LadderGuideContent';

export const metadata: Metadata = {
  title: '래더 시스템 가이드 - 서울 테니스',
  description: '테니스 래더 시스템 이용 방법을 알아보세요.',
};

export default function LadderGuidePage() {
  return <LadderGuideContent />;
}