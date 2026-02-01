'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const { isNeoBrutalism } = useTheme();

  return (
    <footer className={isNeoBrutalism
      ? 'mt-8 lg:mt-4 py-6 text-center text-sm bg-black text-white border-t-[3px] border-black'
      : 'mt-8 lg:mt-4 py-6 text-center text-sm text-gray-400 border-t border-gray-100'
    }>
      <div className="container space-y-3">
        <p className={isNeoBrutalism ? 'font-bold uppercase tracking-wide' : ''}>
          {isNeoBrutalism ? '🎾 ' : ''}서울시 공공서비스예약 데이터 기반
        </p>
        <div className={`flex justify-center gap-4 ${
          isNeoBrutalism ? 'text-white/70' : 'text-gray-400'
        }`}>
          <Link 
            href="/privacy" 
            className={`hover:underline ${isNeoBrutalism ? 'hover:text-white' : 'hover:text-gray-600'}`}
          >
            개인정보처리방침
          </Link>
          <span>|</span>
          <Link 
            href="/terms" 
            className={`hover:underline ${isNeoBrutalism ? 'hover:text-white' : 'hover:text-gray-600'}`}
          >
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
}
