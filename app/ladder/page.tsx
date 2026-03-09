import { Metadata } from 'next';
import LadderContent from '@/components/ladder/LadderContent';

export const metadata: Metadata = {
  title: '테니스 래더 | 서울 테니스',
  description: '서울 테니스 래더 시스템에 참여하여 ELO 점수를 쌓고 순위를 올려보세요. 실력이 비슷한 상대를 찾을 수 있습니다.',
  openGraph: {
    title: '테니스 래더 | 서울 테니스',
    description: '서울 테니스 래더 시스템에 참여하여 ELO 점수를 쌓고 순위를 올려보세요. 실력이 비슷한 상대를 찾을 수 있습니다.',
    type: 'website',
  },
};

export default function LadderPage() {
  return (
    <div className="min-h-screen">
      <LadderContent />
    </div>
  );
}
