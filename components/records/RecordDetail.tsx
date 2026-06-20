'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import {
  GameRecord,
  MATCH_TYPE_LABELS,
  MATCH_FORMAT_LABELS,
  MATCH_RESULT_LABELS,
  COURT_SURFACE_LABELS,
  MatchResult,
} from '@/lib/constants/tennis';
import {
  formatScore,
  formatPlayedAt,
  formatPlayedTime,
  formatDuration,
  formatCost,
} from '@/lib/utils/tennis';

interface RecordDetailProps {
  record: GameRecord;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function RecordDetail({
  record,
  onDelete,
  onEdit,
}: RecordDetailProps) {
  const themeClass = useThemeClass();

  const getResultStyles = (result: MatchResult) => {
    switch (result) {
      case 'win':
        return themeClass('bg-[#22c55e] text-black', 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300');
      case 'loss':
        return themeClass('bg-[#f87171] text-black', 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300');
      case 'draw':
        return themeClass('bg-[#d4d4d4] text-black', 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300');
      case 'retired':
        return themeClass('bg-[#facc15] text-black', 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300');
      default:
        return themeClass('bg-gray-200 dark:bg-slate-700 text-black dark:text-slate-100', 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Result Header */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            'inline-flex items-center justify-center px-6 py-2 text-lg font-bold',
            themeClass(
              'rounded-[5px] border-2 border-black shadow-[4px_4px_0px_0px_#000]',
              'rounded-full'
            ),
            getResultStyles(record.result)
          )}
        >
          {MATCH_RESULT_LABELS[record.result]}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-center">
          {formatScore(record.score)}
        </h1>
      </div>

      {/* Info Grid */}
      <div
        className={themeClass(
          'rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-white dark:bg-slate-800 p-6 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
          'rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm'
        )}
      >
        <div className="grid gap-y-4 gap-x-8 md:grid-cols-2">
          <InfoItem
            label="날짜"
            value={`${formatPlayedAt(record.played_at)} ${formatPlayedTime(
              record.played_at
            )}`}
          />
          <InfoItem
            label="경기 유형"
            value={MATCH_TYPE_LABELS[record.match_type]}
          />
          <InfoItem
            label="경기 형식"
            value={MATCH_FORMAT_LABELS[record.match_format]}
          />
          <InfoItem
            label="장소"
            value={
              record.district
                ? `${record.district} ${record.court_name}`
                : record.court_name
            }
          />
          <InfoItem
            label="코트 표면"
            value={
              record.court_surface
                ? COURT_SURFACE_LABELS[record.court_surface]
                : '-'
            }
          />
          <InfoItem
            label="상대"
            value={
              record.opponent_name
                ? `${record.opponent_name} ${
                    record.opponent_level ? `(${record.opponent_level})` : ''
                  }`
                : '-'
            }
          />
          <InfoItem
            label="경기 시간"
            value={formatDuration(record.duration_minutes)}
          />
          <InfoItem label="비용" value={formatCost(record.cost)} />
        </div>
      </div>

      {/* Images */}
      {record.images && record.images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400">사진</h3>
          <div
            className={cn(
              'grid gap-2',
              record.images.length === 1
                ? 'grid-cols-1'
                : record.images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            )}
          >
            {record.images.map((url, i) => (
              <div
                key={`image-${i}`}
                className={themeClass(
                  'relative aspect-square overflow-hidden rounded-[5px] border-2 border-black dark:border-[#f1f3f8] shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#f1f3f8]',
                  'relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700'
                )}
                onClick={() => window.open(url, '_blank')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Game record image ${i + 1}`}
                  className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {record.notes && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400">메모</h3>
          <div
            className={themeClass(
              'rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-yellow-50 dark:bg-yellow-950/40 p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
              'rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4'
            )}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {record.notes}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onEdit}
            className={themeClass(
              'flex items-center justify-center rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-white dark:bg-slate-800 dark:text-slate-100 py-3 font-bold shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] dark:active:shadow-[2px_2px_0px_0px_#f1f3f8]',
              'flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
            )}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className={themeClass(
              'flex items-center justify-center rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-red-100 dark:bg-red-950/40 py-3 font-bold text-red-600 dark:text-red-300 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] dark:active:shadow-[2px_2px_0px_0px_#f1f3f8]',
              'flex items-center justify-center rounded-xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 py-3 font-medium text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
            )}
          >
            삭제
          </button>
        </div>
        <Link
          href="/records"
          className={themeClass(
            'flex items-center justify-center rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-gray-100 dark:bg-slate-800 dark:text-slate-100 py-3 font-bold shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] dark:active:shadow-[2px_2px_0px_0px_#f1f3f8]',
            'flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 py-3 font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          )}
        >
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
