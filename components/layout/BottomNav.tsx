'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeClass } from '@/lib/cn';
import MoreMenu from '@/components/layout/MoreMenu';

const MORE_PATHS = ['/records', '/map', '/ladder', '/today', '/compare', '/trends', '/calendar', '/my', '/about'];

const NAV_ITEMS = [
  {
    href: '/',
    label: '홈',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    href: '/matching',
    label: '매칭',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/transfers',
    label: '양도',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    href: '/tournaments',
    label: '대진표',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M6 3v4" /><path d="M18 3v4" /><path d="M6 7h4" /><path d="M14 7h4" /><path d="M10 7v5" /><path d="M14 7v5" /><path d="M10 12h4" /><path d="M12 12v5" /><path d="M12 17v4" />
      </svg>
    ),
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const themeClass = useThemeClass();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleMoreClose = useCallback(() => {
    setIsMoreOpen(false);
  }, []);

  const isCourtDetail = /^\/[^/]+-gu\/.+/.test(pathname);
  if (isCourtDetail) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isMoreActive = MORE_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      <MoreMenu isOpen={isMoreOpen} onClose={handleMoreClose} />
      <nav
        aria-label="하단 탐색"
        className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden ${themeClass(
          'bg-[#facc15] border-t-[3px] border-black',
          'bg-white border-t border-gray-200'
        )}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMoreClose}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                  active
                    ? themeClass('text-black font-bold', 'text-green-600 font-medium')
                    : themeClass('text-black/60', 'text-gray-400')
                }`}
              >
                {item.icon}
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isMoreActive || isMoreOpen
                ? themeClass('text-black font-bold', 'text-green-600 font-medium')
                : themeClass('text-black/60', 'text-gray-400')
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-[10px] leading-tight">더보기</span>
          </button>
        </div>
      </nav>
    </>
  );
}
