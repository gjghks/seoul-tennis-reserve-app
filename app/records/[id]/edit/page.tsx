'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import RecordForm from '@/components/records/RecordForm';
import useSWR from 'swr';
import type { GameRecord } from '@/lib/constants/tennis';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => { 
  if (!r.ok) throw new Error('Failed'); 
  return r.json(); 
});

export default function EditRecordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const [showLogin, setShowLogin] = useState(false);

  const { data, error, isLoading } = useSWR<{ record: GameRecord }>(
    id ? `/api/records/${id}` : null, 
    fetcher
  );

  if (authLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className={themeClass(
          'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] py-12 px-6 text-center max-w-md mx-auto',
          'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 py-12 px-6 text-center max-w-md mx-auto'
        )}>
          <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${themeClass(
            'bg-[#a3e635] border-2 border-black rounded-[5px]',
            'bg-green-50 dark:bg-green-950/40 rounded-full'
          )}`}>
            <svg className={`w-8 h-8 ${themeClass('text-black', 'text-green-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className={`text-lg mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-semibold text-gray-900 dark:text-slate-100')}`}>
            로그인이 필요합니다
          </h3>
          <p className={`mb-6 ${themeClass('text-black/60 dark:text-slate-400 font-medium', 'text-gray-500 dark:text-slate-400')}`}>
            경기 기록을 수정하려면 로그인해주세요
          </p>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className={themeClass(
              'inline-flex items-center gap-2 bg-[#88aaee] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all',
              'inline-flex items-center gap-2 bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors'
            )}
          >
            로그인하기
          </button>
        </div>
        <LoginPrompt
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="경기 기록을 수정하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

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
        <div className="mb-6 flex items-center">
          <Link 
            href={`/records/${id}`} 
            className={themeClass(
              'mr-4 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors rounded-[5px]',
              'mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors rounded-full'
            )}
            aria-label="뒤로 가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className={themeClass(
            'text-2xl font-black text-black dark:text-slate-100 uppercase',
            'text-2xl font-bold text-gray-900 dark:text-slate-100'
          )}>
            경기 기록 수정
          </h1>
        </div>

        <RecordForm 
          mode="edit" 
          initialData={data.record}
          onSuccess={() => router.push(`/records/${id}`)} 
          onCancel={() => router.back()} 
        />
      </div>
    </div>
  );
}
