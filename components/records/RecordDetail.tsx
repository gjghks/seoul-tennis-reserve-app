'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { isNeoBrutalism } = useTheme();

  const getResultStyles = (result: MatchResult) => {
    switch (result) {
      case 'win':
        return themeClass('bg-[#22c55e] text-black', 'bg-green-100 text-green-700');
      case 'loss':
        return themeClass('bg-[#f87171] text-black', 'bg-red-100 text-red-700');
      case 'draw':
        return themeClass('bg-[#d4d4d4] text-black', 'bg-gray-100 text-gray-600');
      case 'retired':
        return themeClass('bg-[#facc15] text-black', 'bg-yellow-100 text-yellow-700');
      default:
        return themeClass('bg-gray-200 text-black', 'bg-gray-100 text-gray-600');
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
          'rounded-[5px] border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_#000]',
          'rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
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
          <h3 className="text-sm font-bold text-gray-500">사진</h3>
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
                  'relative aspect-square overflow-hidden rounded-[5px] border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                  'relative aspect-square overflow-hidden rounded-xl border border-gray-200'
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
          <h3 className="text-sm font-bold text-gray-500">메모</h3>
          <div
            className={themeClass(
              'rounded-[5px] border-2 border-black bg-yellow-50 p-4 shadow-[4px_4px_0px_0px_#000]',
              'rounded-xl border border-gray-200 bg-gray-50 p-4'
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
              'flex items-center justify-center rounded-[5px] border-2 border-black bg-white py-3 font-bold shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]',
              'flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50'
            )}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className={themeClass(
              'flex items-center justify-center rounded-[5px] border-2 border-black bg-red-100 py-3 font-bold text-red-600 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]',
              'flex items-center justify-center rounded-xl border border-red-100 bg-red-50 py-3 font-medium text-red-600 hover:bg-red-100'
            )}
          >
            삭제
          </button>
        </div>
        <Link
          href="/records"
          className={themeClass(
            'flex items-center justify-center rounded-[5px] border-2 border-black bg-gray-100 py-3 font-bold shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]',
            'flex items-center justify-center rounded-xl bg-gray-100 py-3 font-medium text-gray-600 hover:bg-gray-200'
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
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
