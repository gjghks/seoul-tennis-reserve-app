'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import type { CourtTransfer } from '@/lib/constants/transfers';
import { TRANSFER_STATUS_LABELS } from '@/lib/constants/transfers';

interface TransferCardProps {
  transfer: CourtTransfer;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const w = days[d.getDay()];
  return `${m}월 ${day}일(${w})`;
}

export default function TransferCard({ transfer }: TransferCardProps) {
  const themeClass = useThemeClass();

  const isAvailable = transfer.status === 'available';

  return (
    <Link href={`/transfers/${transfer.id}`} className="block h-full">
      <div
        className={cn(
          'flex flex-col h-full overflow-hidden transition-all duration-200',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[10px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#f1f3f8]',
            'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600'
          ),
          !isAvailable && themeClass('opacity-70 bg-gray-50 dark:bg-slate-900', 'opacity-70')
        )}
      >
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-bold rounded-full',
                isAvailable
                  ? themeClass(
                      'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-2 border-green-800 dark:border-green-700',
                      'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                    )
                  : transfer.status === 'expired'
                    ? themeClass(
                        'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-2 border-orange-800 dark:border-orange-700',
                        'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                      )
                    : themeClass(
                        'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-2 border-gray-700 dark:border-slate-500',
                        'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                      )
              )}
            >
              {TRANSFER_STATUS_LABELS[transfer.status]}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{transfer.district}</span>
          </div>

          <h3
            className={cn(
              'font-bold text-base mb-1 line-clamp-2',
              themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')
            )}
          >
            {transfer.title}
          </h3>

          <div className="text-sm text-gray-600 dark:text-slate-400 mb-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span>🏟️</span>
              <span className="truncate">{transfer.court_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📅</span>
              <span>
                {formatDate(transfer.play_date)} {transfer.play_time_start}
                {transfer.play_time_end ? `~${transfer.play_time_end}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'p-4 flex items-center justify-between border-t',
            themeClass('border-black dark:border-[#f1f3f8] bg-gray-50 dark:bg-slate-900', 'border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50')
          )}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="font-medium truncate max-w-[80px]">{transfer.seller_name}</span>
          </div>
          <div className="text-right">
            {transfer.is_free ? (
              <span
                className={cn(
                  'font-black text-lg',
                  themeClass('text-blue-600', 'text-blue-600')
                )}
              >
                무료
              </span>
            ) : (
              <div className="flex flex-col">
                {transfer.asking_price < transfer.original_price && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 line-through">
                    {transfer.original_price.toLocaleString()}원
                  </span>
                )}
                <span
                  className={cn(
                    'font-black text-lg',
                    themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')
                  )}
                >
                  {transfer.asking_price.toLocaleString()}원
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
