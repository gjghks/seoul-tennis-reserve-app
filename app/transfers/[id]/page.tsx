import { Metadata } from 'next';
import TransferDetail from '@/components/transfers/TransferDetail';

export const metadata: Metadata = {
  title: '양도글 상세 - 서울 테니스',
  description: '테니스장 양도 상세 정보를 확인하세요.',
};

export default async function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TransferDetail id={id} />;
}