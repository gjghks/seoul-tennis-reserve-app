'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import TournamentContent from '@/components/tournament/TournamentContent';
import Link from 'next/link';

export default function TournamentsPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black dark:text-slate-100 font-bold', 'text-gray-400 dark:text-slate-500')}>로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen scrollbar-hide', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      {!user && <PromoSection themeClass={themeClass} />}
      <TournamentContent />
    </div>
  );
}

function PromoSection({ themeClass }: { themeClass: (nb: string, min: string) => string }) {
  return (
    <div className="container mx-auto px-4 pt-12 pb-4">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-10">
          <h1 className={`text-3xl md:text-4xl mb-4 ${themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-bold text-gray-900 dark:text-slate-100')}`}>
            테니스 대진표를<br className="md:hidden" /> 만들어보세요
          </h1>
          <p className={`text-lg ${themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-600 dark:text-slate-400')}`}>
            동호회 친선 경기부터 클럽 월례대회까지,<br className="md:hidden" /> 대진표를 만들고 경기를 진행해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#ff90e8] border-2 border-black rounded-[5px]', 'bg-pink-50 dark:bg-pink-950/40 rounded-xl text-pink-500')}`}>
              🏆
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>자동 대진표</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>참가자 등록만 하면 시드 배정부터 대진표 생성까지 자동으로 완성됩니다.</p>
          </div>
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#22c55e] border-2 border-black rounded-[5px]', 'bg-green-50 dark:bg-green-950/40 rounded-xl text-green-500')}`}>
              🎯
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>실시간 진행</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>점수를 입력하면 대진표가 실시간으로 업데이트됩니다.</p>
          </div>
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#88aaee] border-2 border-black rounded-[5px]', 'bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-500')}`}>
              📤
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>쉬운 공유</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>카카오톡으로 대진표를 공유하고, 모두가 실시간으로 진행 상황을 확인합니다.</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/login?redirect=/tournaments/new"
            className={cn(
              'inline-block px-8 py-3 text-lg transition-all',
              themeClass(
                'bg-[#a3e635] border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] font-black text-black hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
                'bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700'
              )
            )}
          >
            로그인하고 대진표 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
