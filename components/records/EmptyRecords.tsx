'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyRecordsProps {
  showCreateButton?: boolean;
}

export default function EmptyRecords({ showCreateButton = true }: EmptyRecordsProps) {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();

  return (
    <div className={themeClass(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      'flex flex-col items-center justify-center py-12 px-4 text-center'
    )}>
      <div className={themeClass(
        'w-20 h-20 bg-[#a3e635] border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000] animate-bounce',
        'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce'
      )}
      style={{ animationDuration: '3s' }}
      >
        {isNeoBrutalism ? (
          <span className="text-4xl">🎾</span>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
            <title>Tennis Racket Icon</title>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" fillOpacity="0.2"/>
            <path d="M14.5 13.5L11 17L7.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      
      <h3 className={themeClass(
        'text-xl font-black mb-2',
        'text-lg font-semibold text-gray-900 mb-1'
      )}>
        아직 기록이 없습니다
      </h3>
      
      <p className={themeClass(
        'text-gray-600 font-bold mb-6',
        'text-gray-500 text-sm mb-6'
      )}>
        첫 경기를 기록해보세요!
      </p>

      <div className={themeClass(
        'w-full max-w-xs bg-white border-2 border-black p-4 mb-6 text-left shadow-[4px_4px_0px_0px_#000]',
        'w-full max-w-xs bg-gray-50 rounded-lg p-4 mb-6 text-left'
      )}>
        <ul className="space-y-2">
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700'
          )}>
            <span className="mr-2">📊</span>
            <span>승률, 세트별 스코어 등 통계 자동 분석</span>
          </li>
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700'
          )}>
            <span className="mr-2">🏟️</span>
            <span>코트별·파트너별 기록 관리</span>
          </li>
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700'
          )}>
            <span className="mr-2">📈</span>
            <span>구력에 따른 실력 변화 추적</span>
          </li>
        </ul>
      </div>

      <Link 
        href="/guide/records"
        className={themeClass(
          'text-sm font-bold underline decoration-2 underline-offset-4 mb-6 hover:text-gray-600',
          'text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1'
        )}
      >
        자세한 사용법 보기 →
      </Link>

      {showCreateButton && (
        <Link
          href="/records/new"
          className={themeClass(
            'px-6 py-3 bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_#a3e635] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#a3e635] transition-all',
            'px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm'
          )}
        >
          경기 기록하기
        </Link>
      )}
    </div>
  );
}
