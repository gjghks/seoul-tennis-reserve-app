'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, useThemeClass } from '@/lib/cn';

interface SkillProgressChartProps {
  trend: Array<{
    month: string;
    winRate: number;
    total: number;
  }>;
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  if (!year || !month) {
    return monthKey;
  }

  return `${Number(month)}/${year.slice(-2)}`;
}

function buildTimeline(trend: SkillProgressChartProps['trend']) {
  const dataMap = new Map(trend.map((item) => [item.month, item]));
  const now = new Date();
  const months: SkillProgressChartProps['trend'] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = toMonthKey(date);
    const item = dataMap.get(key);

    months.push(
      item || {
        month: key,
        winRate: 0,
        total: 0,
      }
    );
  }

  return months;
}

function getTrendDirection(timeline: SkillProgressChartProps['trend']) {
  if (timeline.length < 2) {
    return { label: '유지 중 →', color: 'text-gray-600' };
  }

  const half = Math.ceil(timeline.length / 2);
  const firstHalf = timeline.slice(0, half);
  const secondHalf = timeline.slice(half);

  const firstAvg = firstHalf.reduce((sum, item) => sum + item.winRate, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.winRate, 0) / secondHalf.length;
  const diff = secondAvg - firstAvg;

  if (diff > 5) {
    return { label: '상승 중 ↑', color: 'text-green-600' };
  }

  if (diff < -5) {
    return { label: '하락 중 ↓', color: 'text-red-500' };
  }

  return { label: '유지 중 →', color: 'text-gray-600' };
}

export default function SkillProgressChart({ trend }: SkillProgressChartProps) {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();

  const timeline = useMemo(() => buildTimeline(trend), [trend]);
  const trendDirection = useMemo(() => getTrendDirection(timeline), [timeline]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const points = timeline.map((item, index) => {
    const x = timeline.length === 1 ? 0 : (index / (timeline.length - 1)) * 100;
    const y = Math.max(0, Math.min(100, item.winRate));
    return { ...item, x, y };
  });

  return (
    <section
      className={themeClass(
        'rounded-[5px] border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_#000]',
        'rounded-xl border border-gray-200 bg-white p-4 shadow-sm'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500">실력 추이</h3>
        <span className={cn('text-xs font-bold', trendDirection.color)}>{trendDirection.label}</span>
      </div>

      <div className="mb-2 flex justify-between text-[11px] text-gray-400">
        <span>0%</span>
        <span>100%</span>
      </div>

      <div className="relative h-36 w-full">
        <div className="absolute inset-0 rounded-md bg-gray-50" />
        <div className="absolute left-0 right-0 top-3 border-t border-dashed border-gray-200" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200" />
        <div className="absolute bottom-3 left-0 right-0 border-t border-gray-200" />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {points.slice(0, -1).map((point, index) => {
            const nextPoint = points[index + 1];
            const y1 = 90 - point.y * 0.78;
            const y2 = 90 - nextPoint.y * 0.78;

            return (
              <line
                key={`${point.month}-${nextPoint.month}`}
                x1={point.x}
                y1={y1}
                x2={nextPoint.x}
                y2={y2}
                stroke={isNeoBrutalism ? '#000000' : '#6b7280'}
                strokeWidth="1.5"
              />
            );
          })}

          {points.map((point) => {
            const y = 90 - point.y * 0.78;
            const isCurrentMonth = point.month === currentMonth;

            return (
              <circle
                key={point.month}
                cx={point.x}
                cy={y}
                r="2.2"
                fill={isCurrentMonth ? '#22c55e' : '#ffffff'}
                stroke={isCurrentMonth || isNeoBrutalism ? '#000000' : '#6b7280'}
                strokeWidth="1.5"
              >
                <title>{`${toMonthLabel(point.month)} ${point.winRate}% (${point.total}경기)`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1">
        {timeline.map((item) => {
          const isCurrentMonth = item.month === currentMonth;

          return (
            <div key={item.month} className="text-center">
              <p className={cn('text-[10px] font-medium text-gray-500', isCurrentMonth && 'text-gray-900')}>
                {toMonthLabel(item.month)}
              </p>
              <p className="text-[10px] text-gray-400">{item.winRate}%</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
