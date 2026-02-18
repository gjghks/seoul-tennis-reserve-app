'use client';

import { useThemeClass, cn } from '@/lib/cn';
import { useRecordStats } from '@/lib/hooks/useRecordStats';
import { type RecordStats as RecordStatsType, MATCH_TYPE_LABELS, MatchResult } from '@/lib/constants/tennis';
import { calculateWinRate } from '@/lib/utils/tennis';
import { useTheme } from '@/contexts/ThemeContext';

export default function RecordStats() {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();
  const { stats, isLoading } = useRecordStats();

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (!stats || stats.total_matches === 0) {
    return null;
  }

  const winRateColor =
    stats.win_rate >= 60
      ? 'text-green-600'
      : stats.win_rate >= 40
      ? 'text-yellow-600'
      : 'text-red-600';

  const getResultColor = (result: MatchResult) => {
    switch (result) {
      case 'win':
        return 'bg-green-500';
      case 'loss':
        return 'bg-red-500';
      case 'draw':
        return 'bg-gray-400';
      case 'retired':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox label="전체 경기" value={`${stats.total_matches}전`} />
        <StatBox
          label="승률"
          value={`${stats.win_rate}%`}
          valueClassName={winRateColor}
        />
        <StatBox
          label="승/패"
          value={`${stats.wins}승 ${stats.losses}패 ${stats.draws}무`}
          valueClassName="text-sm"
        />
        <StatBox
          label="평균 비용"
          value={
            stats.avg_cost
              ? `${stats.avg_cost.toLocaleString('ko-KR')}원`
              : '-'
          }
        />
      </div>

      {/* Recent Form */}
      <div className={themeClass('space-y-2', 'space-y-2')}>
        <h3 className="text-sm font-bold text-gray-500">최근 전적</h3>
        <div className="flex gap-2">
          {stats.recent_form.map((result, i) => (
            <div
              key={`recent-${i}`}
              className={cn(
                'h-8 w-8 rounded-full border-2 border-white shadow-sm',
                getResultColor(result)
              )}
              title={result}
            />
          ))}
        </div>
      </div>

      {/* Match Type Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500">경기 유형별</h3>
        <div className="space-y-3">
          {Object.entries(stats.by_match_type).map(([type, data]) => {
            if (!data) return null;
            const winRate = calculateWinRate(data.wins, data.total);
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {MATCH_TYPE_LABELS[type as keyof typeof MATCH_TYPE_LABELS]}
                  </span>
                  <span className="text-gray-500">
                    {data.wins}승 / {data.total}전 ({winRate}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(data.total / stats.total_matches) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500">월별 활동</h3>
        <div className="space-y-2">
          {stats.monthly_activity.map((monthData) => {
            const maxTotal = Math.max(
              ...stats.monthly_activity.map((m) => m.total)
            );
            const widthPercent = (monthData.total / maxTotal) * 100;
            const winPercent = (monthData.wins / monthData.total) * 100;

            return (
              <div key={monthData.month} className="flex items-center gap-3">
                <span className="w-12 text-xs font-medium text-gray-500">
                  {monthData.month}
                </span>
                <div className="flex-1">
                  <div
                    className="relative h-6 rounded bg-gray-100"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-l bg-green-500/80"
                      style={{ width: `${winPercent}%` }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">
                      {monthData.total}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Played Court */}
      {stats.most_played_court && (
        <div className={themeClass(
          'border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] rounded-[5px]',
          'rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
        )}>
          <h3 className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
            가장 많이 방문한 코트
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold truncate mr-2">
              {stats.most_played_court.name}
            </span>
            <span className="shrink-0 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {stats.most_played_court.count}회 방문
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  const themeClass = useThemeClass();

  return (
    <div
      className={themeClass(
        'flex flex-col items-center justify-center rounded-[5px] border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000]',
        'flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
      )}
    >
      <span className="mb-1 text-xs font-bold text-gray-500">{label}</span>
      <span className={cn('text-lg font-bold', valueClassName)}>{value}</span>
    </div>
  );
}

function StatsSkeleton() {
  const themeClass = useThemeClass();
  
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className={themeClass(
            'h-24 rounded-[5px] border-2 border-black bg-gray-100 shadow-[4px_4px_0px_0px_#000] animate-pulse',
            'h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse'
          )}
        />
      ))}
    </div>
  );
}
