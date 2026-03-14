'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import { useRecordStats } from '@/lib/hooks/useRecordStats';
import { User } from '@supabase/supabase-js';

interface RecordsPromoCardProps {
  user: User | null;
  authLoading: boolean;
}

export default function RecordsPromoCard({ user, authLoading }: RecordsPromoCardProps) {
  const themeClass = useThemeClass();
  
  const { stats, isLoading: statsLoading } = useRecordStats({ enabled: !!user });

  if (authLoading || (user && statsLoading)) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`w-full h-32 ${themeClass('skeleton-neo', 'skeleton')} rounded-xl`} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass('bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-white border border-gray-200 shadow-sm')}`}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
                나만의 테니스 기록을 시작하세요
              </h3>
              <p className={`text-sm mb-3 ${themeClass('text-gray-600 font-medium', 'text-gray-500')}`}>
                경기 결과를 기록하고 승률과 통계를 확인해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className={`inline-flex items-center text-sm font-bold ${themeClass('text-blue-600 hover:underline', 'text-blue-600 hover:text-blue-700')}`}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/records"
                  className={`text-xs ${themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600')}`}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${themeClass('bg-blue-100 border-2 border-black', 'bg-blue-50 text-blue-600')}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10 ${themeClass('bg-blue-500', 'bg-blue-500')}`} />
        </div>
      </div>
    );
  }

  if (!stats || stats.total_matches === 0) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass('bg-yellow-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100')}`}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
                첫 경기를 기록해보세요!
              </h3>
              <p className={`text-sm mb-3 ${themeClass('text-gray-700 font-medium', 'text-gray-600')}`}>
                아직 기록된 경기가 없습니다.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/records/new" 
                  className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors ${themeClass('bg-black text-white hover:bg-gray-800', 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm')}`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  기록하기
                </Link>
                <Link
                  href="/guide/records"
                  className={`text-xs ${themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600')}`}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={`hidden sm:flex w-16 h-16 items-center justify-center rounded-full ${themeClass('bg-white border-2 border-black', 'bg-white shadow-sm text-yellow-500')}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 lg:my-4">
      <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass('bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-white border border-gray-200 shadow-sm')}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                나의 테니스 기록
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${themeClass('bg-black text-white', 'bg-gray-100 text-gray-600')}`}>
                {stats.total_matches}경기
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div>
                <div className={`text-xs ${themeClass('text-gray-500 font-bold uppercase', 'text-gray-500')}`}>승률</div>
                <div className={`text-xl font-black ${themeClass('text-blue-600', 'text-blue-600')}`}>
                  {stats.win_rate}%
                </div>
              </div>
              <div className={`w-px h-8 ${themeClass('bg-gray-200', 'bg-gray-100')}`} />
              <div>
                <div className={`text-xs ${themeClass('text-gray-500 font-bold uppercase', 'text-gray-500')}`}>최근 전적</div>
                <div className="flex gap-1 mt-1">
                  {stats.recent_form.slice(0, 5).map((result, i) => (
                    (() => {
                      const occurrence = stats.recent_form
                        .slice(0, i + 1)
                        .filter((value) => value === result).length;
                      return (
                    <div 
                      key={`${result}-${occurrence}`}
                      className={`w-2 h-2 rounded-full ${
                        result === 'win' ? 'bg-blue-500' : 
                        result === 'loss' ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    />
                      );
                    })()
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link 
              href="/records" 
               className={`inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors ${themeClass('bg-black text-white hover:bg-gray-800', 'bg-green-600 text-white hover:bg-green-700 shadow-sm')}`}
            >
              전체 기록 보기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/records"
              className={`inline-flex justify-center items-center px-4 py-2 text-xs transition-colors ${themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600')}`}
            >
              사용법 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
