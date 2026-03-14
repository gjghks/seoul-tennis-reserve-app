import { Metadata } from 'next';
import TournamentsGuideContent from '@/components/guide/TournamentsGuideContent';

export const metadata: Metadata = {
  title: '테니스 대진표 가이드 - 서울 테니스',
  description: '동호회 대진표를 만들고 경기를 진행하는 방법을 알아보세요.',
};

export default function TournamentsGuidePage() {
  return <TournamentsGuideContent />;
}
