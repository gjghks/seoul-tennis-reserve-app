'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';

export default function TournamentPromoCard() {
  const themeClass = useThemeClass();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={cn('w-full h-32 rounded-xl', themeClass('skeleton-neo', 'skeleton'))} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={cn(
          'relative overflow-hidden rounded-xl p-5',
          themeClass('bg-amber-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-amber-50 border border-amber-100 shadow-sm')
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                테니스 대진표
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
                동호회 대진표를 만들고 경기를 진행해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center text-sm font-bold',
                    themeClass('text-amber-600 hover:underline', 'text-amber-600 hover:text-amber-700')
                  )}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/tournaments"
                  className={cn('text-xs', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={cn('w-12 h-12 flex items-center justify-center rounded-full', themeClass('bg-amber-200 border-2 border-black', 'bg-amber-100 text-amber-600'))}>
              <span className="text-xl">🏆</span>
            </div>
          </div>
          <div className={cn('absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10', themeClass('bg-amber-600', 'bg-amber-600'))} />
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 lg:my-4">
      <div className={cn(
        'relative overflow-hidden rounded-xl p-5',
        themeClass('bg-amber-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-amber-50 border border-amber-100 shadow-sm')
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-lg font-bold', themeClass('text-black', 'text-gray-900'))}>
                테니스 대진표
              </h3>
            </div>
            <p className={cn('text-sm mb-2 sm:mb-0', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
              동호회 대진표를 만들고 경기를 진행해보세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href="/tournaments"
              className={cn(
                'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                themeClass('bg-black text-white hover:bg-gray-800', 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm')
              )}
            >
              대진표 바로가기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/tournaments"
              className={cn('inline-flex justify-center items-center px-4 py-2 text-xs transition-colors', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
            >
              사용법 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
