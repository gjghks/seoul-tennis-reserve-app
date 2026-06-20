'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, useThemeClass } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';

interface OpponentHistoryProps {
  opponents: Array<{
    name: string;
    total: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    lastPlayed: string;
  }>;
}

function formatLastPlayed(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function OpponentHistory({ opponents }: OpponentHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();
  const { ref: listRef, inView } = useInView();

  const visibleOpponents = expanded ? opponents : opponents.slice(0, 5);

  return (
    <section
      className={themeClass(
        'rounded-[5px] border-2 border-black bg-white dark:bg-slate-800 p-4 shadow-[3px_3px_0px_0px_#000]',
        'rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm'
      )}
    >
      <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400">상대 전적</h3>

      {opponents.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">상대 정보가 있는 기록이 없습니다</p>
      ) : (
        <>
          <div ref={listRef} className="mt-2">
            {visibleOpponents.map((opponent, index) => {
              const winPercent = (opponent.wins / opponent.total) * 100;
              const lossPercent = (opponent.losses / opponent.total) * 100;
              const drawPercent = 100 - winPercent - lossPercent;

              return (
                <div
                  key={`${opponent.name}-${opponent.lastPlayed}-${index}`}
                  className={cn(
                    themeClass('border-b-2 border-black/15 py-3', 'border-b border-gray-100 dark:border-slate-800 py-3'),
                    index === visibleOpponents.length - 1 && 'border-b-0 pb-1'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-gray-900 dark:text-slate-100">{opponent.name}</span>
                    <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-slate-400">{opponent.total}경기</span>
                  </div>

                  <div className="mb-2 flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-slate-400">
                    <span>{opponent.wins}승 {opponent.losses}패 {opponent.draws}무</span>
                    <span>{opponent.winRate}%</span>
                  </div>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
                    <div
                      className="flex h-full"
                      style={{
                        width: inView ? '100%' : '0%',
                        transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms`,
                      }}
                    >
                      <div className="h-full bg-green-500" style={{ width: `${winPercent}%` }} />
                      <div className="h-full bg-red-400" style={{ width: `${lossPercent}%` }} />
                      <div className="h-full bg-gray-300" style={{ width: `${drawPercent}%` }} />
                    </div>
                  </div>

                  <p className="mt-2 text-right text-[11px] text-gray-500 dark:text-slate-400">
                    최근 대결 {formatLastPlayed(opponent.lastPlayed)}
                  </p>
                </div>
              );
            })}
          </div>

          {opponents.length > 5 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className={cn(
                'mt-3 text-sm font-semibold transition-colors',
                isNeoBrutalism ? 'text-black dark:text-slate-100 hover:text-gray-600 dark:hover:text-slate-400' : 'text-gray-700 dark:text-slate-200 hover:text-gray-500 dark:hover:text-slate-400'
              )}
            >
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
