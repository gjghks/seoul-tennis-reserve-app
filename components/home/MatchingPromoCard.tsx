'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { User } from '@supabase/supabase-js';

interface MatchingPromoCardProps {
  user: User | null;
  authLoading: boolean;
}

export default function MatchingPromoCard({ user, authLoading }: MatchingPromoCardProps) {
  const themeClass = useThemeClass();

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
          themeClass('bg-blue-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-blue-50 border border-blue-100 shadow-sm')
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                테니스 파트너를 찾아보세요
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
                나와 맞는 실력의 테니스 친구를 구해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center text-sm font-bold',
                    themeClass('text-blue-600 hover:underline', 'text-blue-600 hover:text-blue-700')
                  )}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/matching"
                  className={cn('text-xs', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={cn('w-12 h-12 flex items-center justify-center rounded-full', themeClass('bg-blue-200 border-2 border-black', 'bg-blue-100 text-blue-600'))}>
              <span className="text-xl">🤝</span>
            </div>
          </div>
          <div className={cn('absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10', themeClass('bg-blue-600', 'bg-blue-600'))} />
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 lg:my-4">
      <div className={cn(
        'relative overflow-hidden rounded-xl p-5',
        themeClass('bg-blue-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-blue-50 border border-blue-100 shadow-sm')
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-lg font-bold', themeClass('text-black', 'text-gray-900'))}>
                우리 동네 매칭
              </h3>
            </div>
            <p className={cn('text-sm mb-2 sm:mb-0', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
              같이 테니스 칠 파트너를 구해보세요!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href="/matching"
              className={cn(
                'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                themeClass('bg-black text-white hover:bg-gray-800', 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm')
              )}
            >
              매칭 바로가기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/matching"
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