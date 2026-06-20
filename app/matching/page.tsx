'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import MatchingContent from '@/components/matching/MatchingContent';

export default function MatchingPage() {
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
      <MatchingContent />
    </div>
  );
}

function PromoSection({ themeClass }: { themeClass: (nb: string, min: string) => string }) {
  return (
    <div className="container mx-auto px-4 pt-12 pb-4">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-10">
          <h1 className={`text-3xl md:text-4xl mb-4 ${themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-bold text-gray-900 dark:text-slate-100')}`}>
            테니스 파트너를<br className="md:hidden" /> 쉽게 찾아보세요
          </h1>
          <p className={`text-lg ${themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-600 dark:text-slate-400')}`}>
            실력과 매너를 겸비한 테니스 친구를 지금 바로 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#ff90e8] border-2 border-black rounded-[5px]', 'bg-pink-50 dark:bg-pink-950/40 rounded-xl text-pink-500')}`}>
              🎾
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>쉬운 매칭</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>가까운 지역, 원하는 시간대의 게임을 찾아 바로 신청하세요.</p>
          </div>
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#22c55e] border-2 border-black rounded-[5px]', 'bg-green-50 dark:bg-green-950/40 rounded-xl text-green-500')}`}>
              ⭐
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>조건 확인</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>구력, NTRP, 성별 등 나와 잘 맞는 파트너를 선택할 수 있습니다.</p>
          </div>
          <div className={themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8] transition-all',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow'
          )}>
            <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass('bg-[#88aaee] border-2 border-black rounded-[5px]', 'bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-500')}`}>
              🔔
            </div>
            <h3 className={`text-xl mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}`}>빠른 소통</h3>
            <p className={themeClass('text-black/70 dark:text-slate-300 font-medium', 'text-gray-500 dark:text-slate-400')}>모집글을 올리고 파트너를 수락하여 즐거운 경기를 시작하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
