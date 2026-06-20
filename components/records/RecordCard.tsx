'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import type { GameRecord } from '@/lib/constants/tennis';
import {
  MATCH_TYPE_LABELS,
  MATCH_RESULT_LABELS,
} from '@/lib/constants/tennis';
import {
  formatScore,
  formatPlayedAt,
  formatDuration,
  formatCost,
} from '@/lib/utils/tennis';

interface RecordCardProps {
  record: GameRecord;
}

export default function RecordCard({ record }: RecordCardProps) {
  const themeClass = useThemeClass();

  const resultColors = {
    win: themeClass('bg-[#22c55e]', 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'),
    loss: themeClass('bg-[#f87171]', 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'),
    draw: themeClass('bg-[#d4d4d4]', 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'),
    retired: themeClass('bg-[#facc15]', 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300'),
  };

  const resultBadgeStyle = cn(
    themeClass(
      'absolute top-0 left-0 px-3 py-1 border-b-2 border-r-2 border-black font-black text-sm z-10',
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2'
    ),
    resultColors[record.result]
  );

  return (
    <Link href={`/records/${record.id}`} className="block">
      <div className={themeClass(
        'relative bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] transition-all overflow-hidden',
        'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4'
      )}>
        {/* Result Badge */}
        <div className={themeClass('', 'flex items-center justify-between mb-2')}>
          <div className={resultBadgeStyle}>
            {MATCH_RESULT_LABELS[record.result]}
          </div>
          
          {/* Minimal theme: Match Type Badge (Top Right) */}
          <div className={themeClass('hidden', 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300')}>
            {MATCH_TYPE_LABELS[record.match_type]}
          </div>
        </div>

        <div className={themeClass('p-4 pt-10', '')}>
          {/* Neo theme: Match Type Badge (Top Right Absolute) */}
          <div className={themeClass(
            'absolute top-3 right-3 px-2 py-1 bg-black text-white text-xs font-bold rounded-sm',
            'hidden'
          )}>
            {MATCH_TYPE_LABELS[record.match_type]}
          </div>

          {/* Score */}
          <div className={themeClass(
            'text-2xl font-black mb-1 truncate',
            'text-xl font-bold text-gray-900 dark:text-slate-100 mb-1'
          )}>
            {formatScore(record.score)}
          </div>

          {/* Court & Date */}
          <div className={themeClass(
            'text-sm font-bold text-gray-600 dark:text-slate-400 mb-3 truncate',
            'text-sm text-gray-600 dark:text-slate-400 mb-3 truncate'
          )}>
            {record.court_name}
            {record.district && ` · ${record.district}`}
            <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
            {formatPlayedAt(record.played_at)}
          </div>

          {/* Info Row */}
          <div className={themeClass(
            'flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-slate-400 border-t-2 border-gray-100 dark:border-slate-700 pt-2',
            'flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 pt-2'
          )}>
            {record.opponent_name && (
              <span className="flex items-center gap-1">
                <span className="opacity-70">VS</span>
                {record.opponent_name}
              </span>
            )}
            
            {record.duration_minutes && (
              <>
                <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
                <span>{formatDuration(record.duration_minutes)}</span>
              </>
            )}

            {record.cost !== null && record.cost > 0 && (
              <>
                <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
                <span>{formatCost(record.cost)}</span>
              </>
            )}

            {record.images && record.images.length > 0 && (
              <div className="ml-auto flex items-center gap-1 text-gray-400 dark:text-slate-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <title>Image Icon</title>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>{record.images.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
