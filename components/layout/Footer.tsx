'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Footer() {
  const { isNeoBrutalism } = useTheme();

  return (
    <footer className={isNeoBrutalism
      ? 'py-6 text-center text-sm bg-black text-white border-t-[3px] border-black'
      : 'py-6 text-center text-sm text-gray-400 border-t border-gray-100'
    }>
      <div className="container">
        <p className={isNeoBrutalism ? 'font-bold uppercase tracking-wide' : ''}>
          {isNeoBrutalism ? '🎾 ' : ''}서울시 공공서비스예약 데이터 기반
        </p>
      </div>
    </footer>
  );
}
