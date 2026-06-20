'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

interface EmptyRecordsProps {
  showCreateButton?: boolean;
}

export default function EmptyRecords({ showCreateButton = true }: EmptyRecordsProps) {
  const themeClass = useThemeClass();

  return (
    <div className={themeClass(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      'flex flex-col items-center justify-center py-12 px-4 text-center'
    )}>
      <svg className={themeClass('w-24 h-24 mx-auto mb-4', 'w-20 h-20 mx-auto mb-4')} viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
          <circle cx="48" cy="48" r="28" className={themeClass('fill-[#a3e635] stroke-black stroke-[2.5]', 'fill-green-400 stroke-green-500 stroke-[1.5]')} />
          <path d="M33 24.5 A 22 22 0 0 1 33 71.5 M63 24.5 A 22 22 0 0 0 63 71.5" fill="none" className={themeClass('stroke-black stroke-[2.5]', 'stroke-green-500 stroke-[1.5]')} style={{ animation: 'fav-pulse 2.5s ease-in-out infinite' }} />
        </g>
        <circle cx="20" cy="20" r="3" className={themeClass('fill-black', 'fill-green-500')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
        <circle cx="80" cy="28" r="2" className={themeClass('fill-black', 'fill-green-500')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
        <circle cx="72" cy="76" r="3.5" className={themeClass('fill-black', 'fill-green-500')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '1s' }} />
        <path d="M24 64 Q24 72 32 72 Q24 72 24 80 Q24 72 16 72 Q24 72 24 64 Z" className={themeClass('fill-black', 'fill-green-500')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.3s' }} />
      </svg>
      
      <h3 className={themeClass(
        'text-xl font-black mb-2',
        'text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1'
      )}>
        아직 기록이 없습니다
      </h3>
      
      <p className={themeClass(
        'text-gray-600 dark:text-slate-400 font-bold mb-6',
        'text-gray-500 dark:text-slate-400 text-sm mb-6'
      )}>
        첫 경기를 기록해보세요!
      </p>

      <div className={themeClass(
        'w-full max-w-xs bg-white dark:bg-slate-800 border-2 border-black p-4 mb-6 text-left shadow-[4px_4px_0px_0px_#000]',
        'w-full max-w-xs bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-6 text-left'
      )}>
        <ul className="space-y-2">
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700 dark:text-slate-200'
          )}>
            <span className="mr-2">📊</span>
            <span>승률, 세트별 스코어 등 통계 자동 분석</span>
          </li>
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700 dark:text-slate-200'
          )}>
            <span className="mr-2">🏟️</span>
            <span>코트별·파트너별 기록 관리</span>
          </li>
          <li className={themeClass(
            'flex items-start text-sm font-bold',
            'flex items-start text-sm text-gray-700 dark:text-slate-200'
          )}>
            <span className="mr-2">📈</span>
            <span>구력에 따른 실력 변화 추적</span>
          </li>
        </ul>
      </div>

      <Link 
        href="/guide/records"
        className={themeClass(
          'text-sm font-bold underline decoration-2 underline-offset-4 mb-6 hover:text-gray-600 dark:hover:text-slate-400',
          'text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-6 flex items-center gap-1'
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
