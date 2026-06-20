'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import AppearanceControls from '@/components/layout/AppearanceControls';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import VisitorCounter from '@/components/layout/VisitorCounter';

const NAV_LINKS = [
  { href: '/about', label: '서비스 소개' },
  { href: '/guide', label: '이용 가이드' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/terms', label: '이용약관' },
  { href: '/contact', label: '문의하기' },
] as const;

export default function Footer() {
  const themeClass = useThemeClass();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className={`${themeClass(
        'py-2.5 text-center text-sm bg-black text-white border-t-[3px] border-black',
        'py-2.5 text-center text-sm text-gray-400 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'
      )}`}>
        <div className="container space-y-1.5">
          <VisitorCounter />
          <div className={`flex items-center justify-center gap-2 text-[clamp(10px,2.8vw,13px)] ${themeClass('text-white/50', 'text-gray-300 dark:text-slate-400')}`}>
            <span>{themeClass('© 서울 테니스', '© 서울 테니스')}</span>
            <span>·</span>
            <span>서울시 공공서비스예약 데이터 기반</span>
          </div>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <div className={`flex items-center gap-[clamp(6px,1.5vw,12px)] text-[clamp(10px,2.8vw,12px)] ${themeClass('text-white/70', 'text-gray-400 dark:text-slate-400')}`}>
              {NAV_LINKS.map((link, i) => (
                <span key={link.href} className="flex items-center gap-[clamp(6px,1.5vw,12px)]">
                  {i > 0 && <span className={themeClass('text-white/25', 'text-gray-200 dark:text-slate-600')}>·</span>}
                  <Link
                    href={link.href}
                    className={`min-h-[44px] inline-flex items-center hover:underline underline-offset-2 ${themeClass('hover:text-white', 'hover:text-gray-600 dark:hover:text-slate-200')}`}
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className={`ml-2 px-2.5 py-2 min-h-[44px] text-[clamp(10px,2.5vw,11px)] font-medium transition-colors ${themeClass(
                'bg-white/15 text-white/80 rounded-[4px] border border-white/25 hover:bg-white/25 hover:text-white',
                'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200'
              )}`}
            >
              💬 의견 보내기
            </button>
            <details className="relative ml-1">
              <summary
                aria-label="외관 설정 (테마·다크모드·시즌)"
                className={`list-none [&::-webkit-details-marker]:hidden cursor-pointer px-2.5 py-2 min-h-[44px] inline-flex items-center text-[clamp(10px,2.5vw,11px)] font-medium transition-colors ${themeClass(
                  'bg-white/15 text-white/80 rounded-[4px] border border-white/25 hover:bg-white/25 hover:text-white',
                  'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200'
                )}`}
              >
                🎨 외관 설정
              </summary>
              <div className="absolute right-0 bottom-full mb-2 w-72 max-w-[calc(100vw-2rem)] p-3 rounded-xl border shadow-lg z-50 text-left bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-700">
                <AppearanceControls />
              </div>
            </details>
          </div>
        </div>
      </footer>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
