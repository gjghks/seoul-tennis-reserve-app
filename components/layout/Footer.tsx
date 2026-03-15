'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import VisitorCounter from '@/components/layout/VisitorCounter';

const NAV_LINKS = [
  { href: '/about', label: '서비스 소개' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/terms', label: '이용약관' },
  { href: '/contact', label: '문의하기' },
] as const;

export default function Footer() {
  const themeClass = useThemeClass();
  const { toggleTheme, isNeoBrutalism } = useTheme();
  const { isCherryBlossom, toggleSeason } = useSeason();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className={`${themeClass(
        'py-2.5 text-center text-sm bg-black text-white border-t-[3px] border-black',
        'py-2.5 text-center text-sm text-gray-400 border-t border-gray-100 bg-white'
      )}`}>
        <div className="container space-y-1.5">
          <VisitorCounter />
          <div className={`flex items-center justify-center gap-2 text-[clamp(10px,2.8vw,13px)] ${themeClass('text-white/50', 'text-gray-300')}`}>
            <span>{themeClass('© 서울 테니스', '© 서울 테니스')}</span>
            <span>·</span>
            <span>서울시 공공서비스예약 데이터 기반</span>
          </div>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <div className={`flex items-center gap-[clamp(6px,1.5vw,12px)] text-[clamp(10px,2.8vw,12px)] ${themeClass('text-white/70', 'text-gray-400')}`}>
              {NAV_LINKS.map((link, i) => (
                <span key={link.href} className="flex items-center gap-[clamp(6px,1.5vw,12px)]">
                  {i > 0 && <span className={themeClass('text-white/25', 'text-gray-200')}>·</span>}
                  <Link
                    href={link.href}
                    className={`min-h-[44px] inline-flex items-center hover:underline underline-offset-2 ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
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
                'bg-gray-100 text-gray-500 rounded-full border border-gray-200 hover:bg-gray-200 hover:text-gray-700'
              )}`}
            >
              💬 의견 보내기
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isNeoBrutalism ? '미니멀 테마로 변경' : '네오브루탈 테마로 변경'}
              className={`ml-1 px-2.5 py-2 min-h-[44px] text-[clamp(10px,2.5vw,11px)] font-medium transition-colors ${themeClass(
                'bg-white/15 text-white/80 rounded-[4px] border border-white/25 hover:bg-white/25 hover:text-white',
                'bg-gray-100 text-gray-500 rounded-full border border-gray-200 hover:bg-gray-200 hover:text-gray-700'
              )}`}
            >
              {isNeoBrutalism ? '🎨 Minimal' : '🎨 Neo-Brutal'}
            </button>
            <button
              type="button"
              onClick={toggleSeason}
              aria-label={isCherryBlossom ? '기본 테마로 변경' : '벚꽃 시즌 테마로 변경'}
              className={`ml-1 px-2.5 py-2 min-h-[44px] text-[clamp(10px,2.5vw,11px)] font-medium transition-colors ${themeClass(
                'bg-white/15 text-white/80 rounded-[4px] border border-white/25 hover:bg-white/25 hover:text-white',
                'bg-gray-100 text-gray-500 rounded-full border border-gray-200 hover:bg-gray-200 hover:text-gray-700'
              )}`}
            >
              {isCherryBlossom ? '🌿 기본 테마' : '🌸 벚꽃 시즌'}
            </button>
          </div>
        </div>
      </footer>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
