'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeClass, cn } from '@/lib/cn';

const HeaderAuth = dynamic(
  () => import('@/components/layout/HeaderAuth'),
  { ssr: false, loading: () => <div className="w-16 h-8 skeleton rounded" /> }
);

const PRIMARY_NAV = [
  { href: '/matching', label: '매칭' },
  { href: '/transfers', label: '양도' },
  { href: '/tournaments', label: '대진표' },
  { href: '/records', label: '경기 기록' },
] as const;

const SECONDARY_NAV = [
  { href: '/ladder', label: '래더' },
  { href: '/map', label: '지도' },
  { href: '/today', label: '오늘 예약' },
  { href: '/compare', label: '구별 비교' },
  { href: '/trends', label: '타이밍' },
  { href: '/calendar', label: '캘린더' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const themeClass = useThemeClass();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSecondaryActive = SECONDARY_NAV.some(({ href }) => pathname.startsWith(href));

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsDropdownOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <header className={`shrink-0 sticky top-0 z-50 ${themeClass('bg-[var(--nb-accent-bg)] border-b-[3px] border-black', 'bg-white border-b border-gray-100')}`}>
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
            {PRIMARY_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
              >
                {label}
              </Link>
            ))}

            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm transition-colors',
                  themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600'),
                  isSecondaryActive && themeClass('underline', 'text-green-600')
                )}
              >
                더보기
                <svg className={cn('w-3.5 h-3.5 transition-transform', isDropdownOpen && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-2 w-44 py-1 z-50',
                  themeClass(
                    'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                    'bg-white border border-gray-200 rounded-xl shadow-lg'
                  )
                )}>
                  {SECONDARY_NAV.map(({ href, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'block px-4 py-2.5 text-sm transition-colors',
                          themeClass(
                            `font-bold ${active ? 'bg-[#facc15]/30' : 'hover:bg-gray-100'}`,
                            `${active ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`
                          )
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <HeaderAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
