import { Metadata } from 'next';
import MatchingGuideContent from '@/components/guide/MatchingGuideContent';

export const metadata: Metadata = {
  title: '테니스 매칭 가이드 - 서울 테니스',
  description: '테니스 파트너 매칭 서비스 이용 방법을 알아보세요.',
};

export default function MatchingGuidePage() {
  return <MatchingGuideContent />;
}