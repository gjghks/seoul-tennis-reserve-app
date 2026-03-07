'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeClass } from '@/lib/cn';

const HeaderAuth = dynamic(
  () => import('@/components/layout/HeaderAuth'),
  { ssr: false, loading: () => <div className="w-16 h-8 skeleton rounded" /> }
);

export default function Header() {
  const pathname = usePathname();
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

          <nav aria-label="주요 탐색" className="flex items-center gap-2">
            {[
              { href: '/today', label: '오늘 예약' },
              { href: '/map', label: '지도' },
              { href: '/compare', label: '구별 비교' },
              { href: '/trends', label: '경쟁률' },
              { href: '/calendar', label: '캘린더' },
              { href: '/records', label: '경기 기록' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
              >
                {label}
              </Link>
            ))}
            <HeaderAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
