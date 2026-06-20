'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass, cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { useGameRecords } from '@/lib/hooks/useGameRecords';
import RecordCard from '@/components/records/RecordCard';
import RecordStats from '@/components/records/RecordStats';
import EmptyRecords from '@/components/records/EmptyRecords';
import Skeleton from '@/components/ui/Skeleton';

const PAGE_SIZE = 20;

export default function RecordsContent() {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();
  const [offset, setOffset] = useState(0);
  const { records, total, isLoading, error, mutate } = useGameRecords({ limit: PAGE_SIZE, offset });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const RefreshIndicator = (
    <div className={`flex items-center justify-center py-4 ${themeClass('text-black dark:text-slate-100 font-bold', 'text-green-700')}`}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black dark:text-slate-100 font-bold', 'text-green-700')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
    >
    <div className={cn('min-h-screen scrollbar-hide', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className={cn(
              'text-2xl',
              themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-bold text-gray-900 dark:text-slate-100')
            )}>
              {isNeoBrutalism ? '🎾 경기 기록' : '경기 기록'}
            </h1>
            <Link
              href="/guide/records"
              className={cn(
                'text-xs px-2 py-1 transition-colors',
                themeClass(
                  'font-bold text-black/50 dark:text-slate-400 border-2 border-black/20 dark:border-slate-700 rounded-[4px] hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-slate-100',
                  'text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300'
                )
              )}
            >
              사용법
            </Link>
          </div>
          <Link
            href="/records/new"
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm transition-all',
              themeClass(
                'bg-[#22c55e] text-black font-bold border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
                'bg-green-600 text-white font-medium rounded-lg hover:bg-green-700'
              )
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 기록
          </Link>
        </div>

        <div className="max-w-2xl">
          <div className="mb-8">
            <RecordStats />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton variant="card" height={112} count={3} className={themeClass('', '!rounded-xl')} />
            </div>
          ) : error ? (
            <div className={cn(
              'p-8 text-center',
              themeClass(
                'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px]',
                'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800'
              )
            )}>
              <p className={cn('mb-4', themeClass('text-red-600 font-bold', 'text-red-500'))}>
                기록을 불러오는데 실패했습니다.
              </p>
            </div>
          ) : records.length === 0 ? (
            <EmptyRecords />
          ) : (
            <>
              <div className="space-y-3">
                {records.map(record => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    type="button"
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                    disabled={currentPage <= 1}
                    className={cn(
                      'px-3 py-2 text-sm transition-all',
                      themeClass(
                        'border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-800',
                        'border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800'
                      )
                    )}
                  >
                    이전
                  </button>
                  <span className={cn('text-sm', themeClass('font-bold', 'text-gray-600 dark:text-slate-300'))}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                    disabled={currentPage >= totalPages}
                    className={cn(
                      'px-3 py-2 text-sm transition-all',
                      themeClass(
                        'border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-slate-800',
                        'border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800'
                      )
                    )}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Link
        href="/records/new"
        className={cn(
          'fixed bottom-20 right-4 sm:bottom-6 sm:right-6 w-14 h-14 flex items-center justify-center z-40 transition-all',
          themeClass(
            'bg-[#22c55e] text-black border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
            'bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl'
          )
        )}
        aria-label="새 경기 기록"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
    </PullToRefresh>
  );
}
