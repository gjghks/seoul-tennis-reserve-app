'use client';

import { useRouter, useParams } from 'next/navigation';
import { useThemeClass } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import RecordDetail from '@/components/records/RecordDetail';
import useSWR from 'swr';
import type { GameRecord } from '@/lib/constants/tennis';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => { 
  if (!r.ok) throw new Error('Failed'); 
  return r.json(); 
});

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const themeClass = useThemeClass();
  const { showToast } = useToast();

  const { data, error, isLoading } = useSWR<{ record: GameRecord }>(
    id ? `/api/records/${id}` : null, 
    fetcher
  );

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      showToast('기록이 삭제되었습니다', 'success');
      router.push('/records');
    } catch {
      showToast('삭제 중 오류가 발생했습니다', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <Spinner />
      </div>
    );
  }

  if (error || !data?.record) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${themeClass('bg-nb-bg', '')}`}>
        <p className={`text-lg mb-4 ${themeClass('font-bold text-black dark:text-slate-100', 'text-gray-600 dark:text-slate-400')}`}>기록을 찾을 수 없습니다</p>
        <Link 
          href="/records" 
          className={themeClass(
            'px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-[5px] hover:bg-gray-800 transition-colors',
            'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          )}
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${themeClass('bg-nb-bg', '')}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <RecordDetail 
          record={data.record} 
          onEdit={() => router.push(`/records/${id}/edit`)} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
}
