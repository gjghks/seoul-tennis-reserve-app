'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

const HeaderAuth = dynamic(
  () => import('@/components/layout/HeaderAuth'),
  { ssr: false, loading: () => <div className="w-16 h-8 skeleton rounded" /> }
);

export default function Header() {
  const themeClass = useThemeClass();

  return (
    <header className={`shrink-0 sticky top-0 z-50 ${themeClass('bg-[#facc15] border-b-[3px] border-black', 'bg-white border-b border-gray-100')}`}>
      <div className="container">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center ${themeClass('bg-black rounded-[5px]', 'rounded-lg bg-green-600')}`}>
              <svg className={`w-5 h-5 ${themeClass('text-[#84cc16]', 'text-white')}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2C12 12 12 12 22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 22C12 12 12 12 2 12" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span className={`font-semibold ${themeClass('text-black font-bold', 'text-gray-900')}`}>
              서울 테니스
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/today"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              오늘 예약
            </Link>
            <Link
              href="/map"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              지도
            </Link>
            <Link
              href="/compare"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              구별 비교
            </Link>
            <Link
              href="/trends"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              경쟁률
            </Link>
            <Link
              href="/calendar"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              캘린더
            </Link>
            <Link
              href="/records"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              경기 기록
            </Link>
            <HeaderAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
