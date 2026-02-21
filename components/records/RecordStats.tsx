'use client';

import { useThemeClass, cn } from '@/lib/cn';
import { useRecordStats } from '@/lib/hooks/useRecordStats';
import { MATCH_TYPE_LABELS, MatchResult } from '@/lib/constants/tennis';
import { calculateWinRate } from '@/lib/utils/tennis';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';
import OpponentHistory from '@/components/records/OpponentHistory';
import SkillProgressChart from '@/components/records/SkillProgressChart';

export default function RecordStats() {
  const themeClass = useThemeClass();
  const { stats, isLoading } = useRecordStats();
  const { ref: summaryRef, inView: summaryInView } = useInView();
  const { ref: formRef, inView: formInView } = useInView();
  const { ref: matchTypeRef, inView: matchTypeInView } = useInView();
  const { ref: monthlyRef, inView: monthlyInView } = useInView();

  const totalMatches = stats?.total_matches ?? 0;
  const winRate = stats?.win_rate ?? 0;
  const animTotal = useCountUp(totalMatches, summaryInView);
  const animWinRate = useCountUp(winRate, summaryInView);

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

  const recentResultCounts: Partial<Record<MatchResult, number>> = {};
  const recentFormItems = stats.recent_form.map((result) => {
    recentResultCounts[result] = (recentResultCounts[result] || 0) + 1;
    return {
      result,
      key: `recent-${result}-${recentResultCounts[result]}`,
    };
  });

  return (
    <div className="space-y-8">
      {stats.current_streak && (
        <div
          className={themeClass(
            'rounded-[5px] border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000]',
            'rounded-xl border border-gray-200 bg-white p-3 shadow-sm'
          )}
        >
          {stats.current_streak.type === 'win' ? (
            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700">
              🔥 {stats.current_streak.count}연승 중!
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-600">{stats.current_streak.count}연패 중</p>
          )}
        </div>
      )}

      <div ref={summaryRef} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: '전체 경기', value: `${animTotal}전`, className: undefined },
          { label: '승률', value: `${animWinRate}%`, className: winRateColor },
          { label: '승/패', value: `${stats.wins}승 ${stats.losses}패 ${stats.draws}무`, className: 'text-sm' },
          { label: '평균 비용', value: stats.avg_cost ? `${stats.avg_cost.toLocaleString('ko-KR')}원` : '-', className: undefined },
        ].map((item, i) => (
          <div
            key={item.label}
            className={summaryInView ? 'anim-fade-up' : 'opacity-0'}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <StatBox label={item.label} value={item.value} valueClassName={item.className} />
          </div>
        ))}
      </div>

      <div ref={formRef} className={themeClass('space-y-2', 'space-y-2')}>
        <h3 className="text-sm font-bold text-gray-500">최근 전적</h3>
        <div className="flex gap-2">
          {recentFormItems.map(({ result, key }, i) => (
            <div
              key={key}
              className={cn(
                'h-8 w-8 rounded-full border-2 border-white shadow-sm',
                getResultColor(result),
                formInView ? 'anim-pop-in' : 'opacity-0 scale-0'
              )}
              style={{ animationDelay: `${i * 60}ms` }}
              title={result}
            />
          ))}
        </div>
      </div>

      <div ref={matchTypeRef} className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500">경기 유형별</h3>
        <div className="space-y-3">
          {Object.entries(stats.by_match_type).map(([type, data], i) => {
            if (!data) return null;
            const typeWinRate = calculateWinRate(data.wins, data.total);
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {MATCH_TYPE_LABELS[type as keyof typeof MATCH_TYPE_LABELS]}
                  </span>
                  <span className="text-gray-500">
                    {data.wins}승 / {data.total}전 ({typeWinRate}%)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: matchTypeInView ? `${(data.total / stats.total_matches) * 100}%` : '0%',
                      transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={monthlyRef} className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500">월별 활동</h3>
        <div className="space-y-2">
          {stats.monthly_activity.map((monthData, i) => {
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
                    style={{
                      width: monthlyInView ? `${widthPercent}%` : '0%',
                      transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                    }}
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

      <OpponentHistory opponents={stats.opponents} />
      <SkillProgressChart trend={stats.win_rate_trend} />
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
  const skeletonKeys = ['a', 'b', 'c', 'd'];
  
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {skeletonKeys.map((key) => (
        <div
          key={`skeleton-${key}`}
          className={themeClass(
            'h-24 rounded-[5px] border-2 border-black bg-gray-100 shadow-[4px_4px_0px_0px_#000] animate-pulse',
            'h-24 rounded-xl border border-gray-200 bg-gray-50 animate-pulse'
          )}
        />
      ))}
    </div>
  );
}
