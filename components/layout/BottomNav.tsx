'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeClass } from '@/lib/cn';
import MoreMenu from '@/components/layout/MoreMenu';

const MORE_PATHS = ['/compare', '/trends', '/calendar', '/my', '/about'];

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
    href: '/today',
    label: '오늘 예약',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/records',
    label: '기록',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/map',
    label: '지도',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
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
