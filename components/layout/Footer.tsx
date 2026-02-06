'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

export default function Footer() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-40 ${themeClass('py-4 lg:py-2 text-center text-sm bg-black text-white border-t-[3px] border-black', 'py-4 lg:py-2 text-center text-sm text-gray-400 border-t border-gray-100 bg-white')}`}>
      <div className="container space-y-3">
        <p className={themeClass('font-bold uppercase tracking-wide', '')}>
          {isNeoBrutalism ? '🎾 ' : ''}서울시 공공서비스예약 데이터 기반
        </p>
        <div className={`flex justify-center gap-[clamp(4px,1.5vw,16px)] text-[clamp(10px,2.8vw,14px)] flex-nowrap whitespace-nowrap ${themeClass('text-white/70', 'text-gray-400')}`}>
          <Link 
            href="/about" 
            className={`hover:underline ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
          >
            서비스 소개
          </Link>
          <span>|</span>
          <Link 
            href="/privacy" 
            className={`hover:underline ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
          >
            개인정보처리방침
          </Link>
          <span>|</span>
          <Link 
            href="/terms" 
            className={`hover:underline ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
          >
            이용약관
          </Link>
          <span>|</span>
          <Link 
            href="/contact" 
            className={`hover:underline ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
          >
            문의하기
          </Link>
          <span>|</span>
          <Link 
            href="/sitemap-page" 
            className={`hover:underline ${themeClass('hover:text-white', 'hover:text-gray-600')}`}
          >
            사이트맵
          </Link>
        </div>
      </div>
    </footer>
  );
}
