import { Metadata } from 'next';
import TournamentDetail from '@/components/tournament/TournamentDetail';

export const metadata: Metadata = {
  title: '테니스 대진표 | 서울시 테니스장 예약 현황',
  description: '테니스 대진표 상세 정보입니다.',
};

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TournamentDetail id={id} />;
}
