'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

const CARDS = [
  {
    href: '/compare',
    title: '구별 비교',
    description: '코트 수·예약률 비교',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    href: '/trends',
    title: '경쟁률',
    description: '시간대별 추이 분석',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    title: '캘린더',
    description: '날짜별 예약 현황',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <rect x="7" y="14" width="3" height="3" rx="0.5" />
      </svg>
    ),
  },
] as const;

export default function DiscoveryCards() {
  const themeClass = useThemeClass();

  return (
    <section className="container py-4 lg:py-3">
      <h2 className={`mb-3 ${themeClass(
        'text-lg font-black text-black uppercase tracking-tight',
        'text-base font-semibold text-gray-900'
      )}`}>
        더 알아보기
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`flex flex-col items-center gap-2 p-3 sm:p-4 text-center transition-colors ${themeClass(
              'bg-white border-[3px] border-black rounded-[10px] hover:bg-[#facc15]/20 shadow-[3px_3px_0_0_rgba(0,0,0,1)]',
              'bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-200'
            )}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${themeClass(
              'bg-[#facc15] text-black',
              'bg-green-50 text-green-600'
            )}`}>
              {card.icon}
            </div>
            <div>
              <p className={`text-sm font-semibold ${themeClass('text-black', 'text-gray-900')}`}>
                {card.title}
              </p>
              <p className={`text-[11px] mt-0.5 hidden sm:block ${themeClass('text-black/50', 'text-gray-500')}`}>
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
