import { Metadata } from 'next';
import TransferForm from '@/components/transfers/TransferForm';

export const metadata: Metadata = {
  title: '양도글 작성 - 서울 테니스',
  description: '테니스장 양도글을 등록하세요.',
};

export default function NewTransferPage() {
  return <TransferForm />;
}