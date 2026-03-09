import { Metadata } from 'next';
import MatchingPostDetail from '@/components/matching/MatchingPostDetail';

export const metadata: Metadata = {
  title: '테니스 매칭 상세 | 서울시 테니스장 예약 현황',
  description: '테니스 파트너 매칭 상세 정보입니다.',
};

export default async function MatchingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchingPostDetail id={id} />;
}
