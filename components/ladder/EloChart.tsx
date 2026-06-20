import { useId, useMemo, useState, useEffect } from 'react';
import { useThemeClass, cn } from '@/lib/cn';
import { buildSmoothPath } from '@/lib/utils/svgPath';
import type { EloHistoryEntry } from '@/lib/constants/ladder';

interface EloChartProps {
  history: EloHistoryEntry[];
  enabled?: boolean;
}

const MINI_W = 280;
const MINI_H = 100;
const MINI_PX = 10;
const MINI_PT = 14;
const MINI_PB = 8;
const MINI_PLOT_LEFT = MINI_PX;
const MINI_PLOT_RIGHT = MINI_W - MINI_PX;
const MINI_PLOT_TOP = MINI_PT;
const MINI_PLOT_BOTTOM = MINI_H - MINI_PB;
const MINI_PLOT_W = MINI_PLOT_RIGHT - MINI_PLOT_LEFT;
const MINI_PLOT_H = MINI_PLOT_BOTTOM - MINI_PLOT_TOP;

function miniPlotXY(elo: number, minElo: number, maxElo: number, index: number, count: number) {
  const x = count === 1 
    ? MINI_PLOT_LEFT + MINI_PLOT_W / 2 
    : MINI_PLOT_LEFT + (index / (count - 1)) * MINI_PLOT_W;
  const range = maxElo - minElo;
  const normalized = range === 0 ? 0.5 : (elo - minElo) / range;
  const y = MINI_PLOT_BOTTOM - normalized * MINI_PLOT_H;
  return { x, y };
}

export default function EloChart({ history, enabled = true }: EloChartProps) {
  const themeClass = useThemeClass();
  const gradId = useId();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // hydration guard: enable chart rendering after mount
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const { plotPoints, areaPath, linePath, isRising } = useMemo(() => {
    if (!history || history.length === 0) {
      return { plotPoints: [], areaPath: '', linePath: '', isRising: true };
    }

    const reversedHistory = [...history].reverse();
    const eloValues = reversedHistory.map(entry => entry.elo_after);
    const minElo = Math.min(...eloValues);
    const maxElo = Math.max(...eloValues);
    const minV = Math.max(0, minElo - 20);
    const maxV = maxElo + 20;

    const points = eloValues.map((elo, i) => ({
      elo,
      ...miniPlotXY(elo, minV, maxV, i, eloValues.length),
    }));

    const lPath = buildSmoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    const aPath = points.length > 1 
      ? `${lPath} L ${last.x} ${MINI_PLOT_BOTTOM} L ${first.x} ${MINI_PLOT_BOTTOM} Z`
      : '';

    const rising = points.length > 1 ? last.elo >= first.elo : true;

    return { 
      plotPoints: points, 
      areaPath: aPath, 
      linePath: lPath, 
      isRising: rising,
    };
  }, [history]);

  if (!mounted || plotPoints.length === 0) {
    return null;
  }

  const lineColor = isRising 
    ? themeClass('#22c55e', '#22c55e') 
    : themeClass('#ef4444', '#ef4444');
  const areaColor = isRising
    ? themeClass('#a3e635', '#22c55e')
    : themeClass('#fca5a5', '#ef4444');

  return (
    <div
      className={themeClass(
        'rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-white dark:bg-slate-800 p-3 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#f1f3f8]',
        'rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400">ELO 추이</h4>
        {plotPoints.length > 1 && (
          <span className={cn('text-[10px] font-bold', isRising ? 'text-green-700' : 'text-red-600')}>
            {isRising ? '상승 중 ↑' : '하락 중 ↓'}
          </span>
        )}
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${MINI_W} / ${MINI_H}` }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${MINI_W} ${MINI_H}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${gradId}-mini-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={areaColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x={MINI_PLOT_LEFT} y={MINI_PLOT_TOP} width={MINI_PLOT_W} height={MINI_PLOT_H} rx="3" fill="#f9fafb" />

          {[0, 0.5, 1].map((pct) => {
            const y = MINI_PLOT_BOTTOM - pct * MINI_PLOT_H;
            return (
              <line
                key={pct}
                x1={MINI_PLOT_LEFT}
                y1={y}
                x2={MINI_PLOT_RIGHT}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}

          {plotPoints.length > 1 && (
            <path
              d={areaPath}
              fill={`url(#${gradId}-mini-area)`}
              style={{
                opacity: enabled ? 1 : 0,
                transition: 'opacity 0.8s ease 0.4s',
              }}
            />
          )}

          {plotPoints.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={enabled ? 0 : 1}
              style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          )}

          {plotPoints.map((point, i) => {
            const isLast = i === plotPoints.length - 1;
            if (!isLast && i !== 0 && plotPoints.length > 1) return null;

            return (
              <g
                key={point.x}
                style={{
                  opacity: enabled ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  transitionDelay: '1s',
                }}
              >
                {isLast && plotPoints.length > 1 && (
                  <circle cx={point.x} cy={point.y} r="7" fill={areaColor} opacity="0.15" />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isLast ? 3.5 : 3}
                  fill={isLast ? areaColor : '#ffffff'}
                  stroke={isLast ? lineColor : '#d1d5db'}
                  strokeWidth={isLast ? 2 : 1}
                />
                <text
                  x={point.x}
                  y={point.y - 8}
                  textAnchor="middle"
                  fill={themeClass('#000000', '#374151')}
                  fontSize="8"
                  fontWeight="700"
                >
                  {Math.round(point.elo)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
