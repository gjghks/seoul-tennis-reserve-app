'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';

export default function TransferPromoCard() {
  const themeClass = useThemeClass();

  return (
    <div className="container my-6 lg:my-4">
      <div className={cn(
        'relative overflow-hidden rounded-xl p-5',
        themeClass('bg-red-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-red-50 border border-red-100 shadow-sm')
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
                themeClass('bg-black text-white hover:bg-gray-800', 'bg-red-600 text-white hover:bg-red-700 shadow-sm')
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