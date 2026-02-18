import type { Metadata } from 'next';
import RecordsGuideContent from '@/components/guide/RecordsGuideContent';

export const metadata: Metadata = {
  title: '경기 기록 가이드 | 서울 테니스',
  description: '테니스 경기 기록부터 통계 분석까지, 서울 테니스의 경기 기록 기능을 100% 활용하는 방법을 알려드립니다.',
  openGraph: {
    title: '경기 기록 가이드 | 서울 테니스',
    description: '나의 테니스 실력을 체계적으로 관리하는 방법. 경기 기록, 승률 분석, 상대 관리까지.',
    url: 'https://seoul-tennis.com/guide/records',
    type: 'article',
  },
};

export default function RecordsGuidePage() {
  return <RecordsGuideContent />;
}
