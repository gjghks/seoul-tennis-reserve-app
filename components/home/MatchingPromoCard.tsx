'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useSeason } from '@/contexts/SeasonalContext';
import { User } from '@supabase/supabase-js';

interface MatchingPromoCardProps {
  user: User | null;
  authLoading: boolean;
}

export default function MatchingPromoCard({ user, authLoading }: MatchingPromoCardProps) {
  const themeClass = useThemeClass();
  const { season } = useSeason();

  const palette = {
    'default':         { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-600',    textDark: 'text-blue-700',    hoverText: 'hover:text-blue-700',    hoverBg: 'hover:bg-blue-100',    iconBg: 'bg-blue-200',    iconMinimal: 'bg-blue-100 text-blue-600',       deco: 'bg-blue-600' },
    'cherry-blossom':  { bg: 'bg-pink-50',    border: 'border-pink-100',    text: 'text-pink-600',    textDark: 'text-pink-700',    hoverText: 'hover:text-pink-700',    hoverBg: 'hover:bg-pink-100',    iconBg: 'bg-pink-200',    iconMinimal: 'bg-pink-100 text-pink-600',       deco: 'bg-pink-600' },
    'tennis-spring':   { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', textDark: 'text-emerald-700', hoverText: 'hover:text-emerald-700', hoverBg: 'hover:bg-emerald-100', iconBg: 'bg-emerald-200', iconMinimal: 'bg-emerald-100 text-emerald-600', deco: 'bg-emerald-600' },
    'tennis-autumn':   { bg: 'bg-orange-50',  border: 'border-orange-100',  text: 'text-orange-600',  textDark: 'text-orange-700',  hoverText: 'hover:text-orange-700',  hoverBg: 'hover:bg-orange-100',  iconBg: 'bg-orange-200',  iconMinimal: 'bg-orange-100 text-orange-600',   deco: 'bg-orange-600' },
    'tennis-summer':   { bg: 'bg-cyan-50',    border: 'border-cyan-100',    text: 'text-cyan-600',    textDark: 'text-cyan-700',    hoverText: 'hover:text-cyan-700',    hoverBg: 'hover:bg-cyan-100',    iconBg: 'bg-cyan-200',    iconMinimal: 'bg-cyan-100 text-cyan-600',       deco: 'bg-cyan-600' },
    'tennis-winter':   { bg: 'bg-sky-50',     border: 'border-sky-100',     text: 'text-sky-600',     textDark: 'text-sky-700',     hoverText: 'hover:text-sky-700',     hoverBg: 'hover:bg-sky-100',     iconBg: 'bg-sky-200',     iconMinimal: 'bg-sky-100 text-sky-600',         deco: 'bg-sky-600' },
  } as const;
  const { bg, border, text, textDark, hoverText, hoverBg, iconBg, iconMinimal, deco } = palette[season] ?? palette.default;

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
          themeClass(`${bg} dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_#f1f3f8]`, `${bg} border ${border} shadow-sm`)
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                테니스 파트너를 찾아보세요
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 dark:text-slate-300 font-medium', 'text-gray-600 dark:text-slate-400'))}>
                나와 맞는 실력의 테니스 친구를 구해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center text-sm font-bold',
                    themeClass(`${text} hover:underline`, `${text} ${hoverText}`)
                  )}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/matching"
                  className={cn('text-xs', themeClass('text-black/40 dark:text-slate-500 font-bold hover:text-black/60 dark:hover:text-slate-300', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={cn('w-12 h-12 flex items-center justify-center rounded-full', themeClass(`${iconBg} dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8]`, iconMinimal))}>
              <span className="text-xl">🤝</span>
            </div>
          </div>
          <div className={cn(`absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10 ${deco}`)} />
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 lg:my-4">
      <div className={cn(
        'relative overflow-hidden rounded-xl p-5',
        themeClass(`${bg} dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_#f1f3f8]`, `${bg} border ${border} shadow-sm`)
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-lg font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                우리 동네 매칭
              </h3>
            </div>
            <p className={cn('text-sm mb-2 sm:mb-0', themeClass('text-gray-700 dark:text-slate-300 font-medium', 'text-gray-600 dark:text-slate-400'))}>
              같이 테니스 칠 파트너를 구해보세요!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href="/matching"
              className={cn(
                'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                themeClass(`${bg} dark:bg-slate-700 ${textDark} dark:text-slate-100 border-2 border-black dark:border-[#f1f3f8] ${hoverBg} dark:hover:bg-slate-600`, `${bg} ${text} ${hoverBg}`)
              )}
            >
              매칭 바로가기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/matching"
              className={cn('inline-flex justify-center items-center px-4 py-2 text-xs transition-colors', themeClass('text-black/40 dark:text-slate-500 font-bold hover:text-black/60 dark:hover:text-slate-300', 'text-gray-400 hover:text-gray-600'))}
            >
              사용법 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
