'use client';

import { useMemo, useId } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, useThemeClass } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';

interface SkillProgressChartProps {
  trend: Array<{
    month: string;
    winRate: number;
    total: number;
  }>;
}

const CHART_W = 280;
const CHART_H = 100;
const PX = 10;
const PT = 14;
const PB = 8;
const PLOT_LEFT = PX;
const PLOT_RIGHT = CHART_W - PX;
const PLOT_TOP = PT;
const PLOT_BOTTOM = CHART_H - PB;
const PLOT_W = PLOT_RIGHT - PLOT_LEFT;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-');
  if (!year || !month) return monthKey;
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
    months.push(item || { month: key, winRate: 0, total: 0 });
  }
  return months;
}

function getTrendDirection(timeline: SkillProgressChartProps['trend']) {
  const withData = timeline.filter((t) => t.total > 0);
  if (withData.length < 2) return { label: '유지 중 →', color: 'text-gray-600' };

  const half = Math.ceil(withData.length / 2);
  const firstAvg = withData.slice(0, half).reduce((s, i) => s + i.winRate, 0) / half;
  const secondAvg = withData.slice(half).reduce((s, i) => s + i.winRate, 0) / (withData.length - half);
  const diff = secondAvg - firstAvg;

  if (diff > 5) return { label: '상승 중 ↑', color: 'text-green-600' };
  if (diff < -5) return { label: '하락 중 ↓', color: 'text-red-500' };
  return { label: '유지 중 →', color: 'text-gray-600' };
}

function toPlotXY(winRate: number, index: number, count: number) {
  const x = count === 1 ? PLOT_LEFT + PLOT_W / 2 : PLOT_LEFT + (index / (count - 1)) * PLOT_W;
  const y = PLOT_BOTTOM - (Math.max(0, Math.min(100, winRate)) / 100) * PLOT_H;
  return { x, y };
}

function buildSmoothPath(pts: Array<{ x: number; y: number }>, tension = 0.25): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function SkillProgressChart({ trend }: SkillProgressChartProps) {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();
  const gradId = useId();

  const timeline = useMemo(() => buildTimeline(trend), [trend]);
  const trendDirection = useMemo(() => getTrendDirection(timeline), [timeline]);

  const now = new Date();
  const currentMonth = toMonthKey(now);

  const { ref: chartRef, inView } = useInView();

  const plotPoints = useMemo(
    () => timeline.map((item, i) => ({ ...item, ...toPlotXY(item.winRate, i, timeline.length) })),
    [timeline]
  );

  const dataPoints = useMemo(() => plotPoints.filter((p) => p.total > 0), [plotPoints]);
  const hasEnoughData = dataPoints.length >= 2;
  const linePath = useMemo(() => buildSmoothPath(dataPoints), [dataPoints]);
  const areaPath = useMemo(() => {
    if (!hasEnoughData) return '';
    const last = dataPoints[dataPoints.length - 1];
    const first = dataPoints[0];
    return `${linePath} L ${last.x} ${PLOT_BOTTOM} L ${first.x} ${PLOT_BOTTOM} Z`;
  }, [linePath, dataPoints, hasEnoughData]);

  const lineColor = isNeoBrutalism ? '#000000' : '#22c55e';
  const areaColor = isNeoBrutalism ? '#a3e635' : '#22c55e';

  const lastDataIndex = (() => {
    for (let i = plotPoints.length - 1; i >= 0; i--) {
      if (plotPoints[i].total > 0) return i;
    }
    return -1;
  })();

  if (dataPoints.length === 0) return null;

  return (
    <section
      className={themeClass(
        'rounded-[5px] border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000]',
        'rounded-xl border border-gray-200 bg-white p-3 shadow-sm'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500">실력 추이</h3>
        <span className={cn('text-[10px] font-bold', trendDirection.color)}>{trendDirection.label}</span>
      </div>

      <div ref={chartRef} className="relative w-full" style={{ aspectRatio: `${CHART_W} / ${CHART_H}` }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={areaColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_W} height={PLOT_H} rx="3" fill={isNeoBrutalism ? '#fafafa' : '#f9fafb'} />

          {[25, 50, 75].map((pct) => {
            const y = PLOT_BOTTOM - (pct / 100) * PLOT_H;
            return (
              <line
                key={pct}
                x1={PLOT_LEFT}
                y1={y}
                x2={PLOT_RIGHT}
                y2={y}
                stroke={isNeoBrutalism ? '#e5e5e5' : '#e5e7eb'}
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}

          {hasEnoughData && (
            <>
              <path
                d={areaPath}
                fill={`url(#${gradId}-area)`}
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.8s ease 0.4s',
                }}
              />
              <path
                d={linePath}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={inView ? 0 : 1}
                style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
            </>
          )}

          {plotPoints.map((point, i) => {
            const hasData = point.total > 0;
            const isLatest = i === lastDataIndex;

            return (
              <g
                key={point.month}
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  transitionDelay: '1s',
                }}
              >
                {hasData && (
                  <>
                    {isLatest && (
                      <circle cx={point.x} cy={point.y} r="7" fill={areaColor} opacity="0.15" />
                    )}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isLatest ? 3.5 : 3}
                      fill={isLatest ? areaColor : '#ffffff'}
                      stroke={isLatest ? lineColor : '#d1d5db'}
                      strokeWidth={isLatest ? 2 : 1}
                    />
                    <text
                      x={point.x}
                      y={point.y - 8}
                      textAnchor="middle"
                      fill={isNeoBrutalism ? '#000000' : '#374151'}
                      fontSize="8"
                      fontWeight="700"
                    >
                      {point.winRate}%
                    </text>
                  </>
                )}
                {!hasData && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={2.5}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                )}
                <title>{`${toMonthLabel(point.month)} ${point.winRate}% (${point.total}경기)`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {!hasEnoughData && dataPoints.length === 1 && (
        <p className="mt-1 text-center text-[10px] text-gray-400">
          기록이 쌓이면 추이를 확인할 수 있어요
        </p>
      )}

      <div className="mt-2 grid grid-cols-6 gap-1">
        {timeline.map((item) => {
          const isCurrent = item.month === currentMonth;
          return (
            <div key={item.month} className="text-center">
              <p className={cn('text-[10px] font-medium text-gray-400', isCurrent && 'text-gray-900 font-bold')}>
                {toMonthLabel(item.month)}
              </p>
              {item.total > 0 && (
                <p className="text-[9px] text-gray-400">{item.total}경기</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
