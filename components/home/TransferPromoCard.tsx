'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useSeason } from '@/contexts/SeasonalContext';
import { useAuth } from '@/contexts/AuthContext';

export default function TransferPromoCard() {
  const themeClass = useThemeClass();
  const { user, loading: authLoading } = useAuth();
  const { season } = useSeason();

  const palette = {
    'default':        { bg: 'bg-red-50',   border: 'border-red-100',   text: 'text-red-600',   textDark: 'text-red-700',   hoverText: 'hover:text-red-700',   hoverBg: 'hover:bg-red-100',   iconBg: 'bg-red-200',   iconMinimal: 'bg-red-100 text-red-600',     deco: 'bg-red-600' },
    'cherry-blossom': { bg: 'bg-rose-50',  border: 'border-rose-100',  text: 'text-rose-600',  textDark: 'text-rose-700',  hoverText: 'hover:text-rose-700',  hoverBg: 'hover:bg-rose-100',  iconBg: 'bg-rose-200',  iconMinimal: 'bg-rose-100 text-rose-600',   deco: 'bg-rose-600' },
    'tennis-spring':  { bg: 'bg-lime-50',  border: 'border-lime-100',  text: 'text-lime-700',  textDark: 'text-lime-800',  hoverText: 'hover:text-lime-800',  hoverBg: 'hover:bg-lime-100',  iconBg: 'bg-lime-200',  iconMinimal: 'bg-lime-100 text-lime-700',   deco: 'bg-lime-600' },
    'tennis-autumn':  { bg: 'bg-rose-50',  border: 'border-rose-100',  text: 'text-rose-700',  textDark: 'text-rose-800',  hoverText: 'hover:text-rose-800',  hoverBg: 'hover:bg-rose-100',  iconBg: 'bg-rose-200',  iconMinimal: 'bg-rose-100 text-rose-700',   deco: 'bg-rose-700' },
  } as const;
  const { bg, border, text, textDark, hoverText, hoverBg, iconBg, iconMinimal, deco } = palette[season];

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
          themeClass(`${bg} border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`, `${bg} border ${border} shadow-sm`)
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                테니스 양도 마켓
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
                코트 예약을 양도하거나 구해보세요.
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
                  href="/guide/transfers"
                  className={cn('text-xs', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={cn('w-12 h-12 flex items-center justify-center rounded-full', themeClass(`${iconBg} border-2 border-black`, iconMinimal))}>
              <span className="text-xl">🔄</span>
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
        themeClass(`${bg} border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`, `${bg} border ${border} shadow-sm`)
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-lg font-bold', themeClass('text-black', 'text-gray-900'))}>
                테니스 양도 마켓
              </h3>
            </div>
            <p className={cn('text-sm mb-2 sm:mb-0', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
              코트 예약을 양도하거나 구해보세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href="/transfers"
              className={cn(
                'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                themeClass(`${bg} ${textDark} border-2 border-black ${hoverBg}`, `${bg} ${text} ${hoverBg}`)
              )}
            >
              양도 마켓 바로가기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/transfers"
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
