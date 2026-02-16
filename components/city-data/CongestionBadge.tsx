'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';

interface CongestionBadgeProps {
  lat: number;
  lng: number;
  isNeoBrutalism: boolean;
  variant?: 'compact' | 'full';
}

interface CongestionForecast {
  time: string;
  level: string;
  min: number;
  max: number;
}

interface CongestionData {
  level: '여유' | '보통' | '약간 붐빔' | '붐빔';
  message: string;
  populationMin: number;
  populationMax: number;
  populationTime: string;
  forecast: CongestionForecast[];
}

interface CongestionResponse {
  area: string;
  areaCode: string;
  congestion: CongestionData | null;
}

const fetcher = async (url: string): Promise<CongestionResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch congestion');
  return response.json();
};

function resolveCongestionColor(level: string) {
  switch (level) {
    case '여유':
      return {
        bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500',
        bgNeo: 'bg-[#a3e635]', textNeo: 'text-black',
      };
    case '보통':
      return {
        bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500',
        bgNeo: 'bg-[#88aaee]', textNeo: 'text-black',
      };
    case '약간 붐빔':
      return {
        bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500',
        bgNeo: 'bg-[#facc15]', textNeo: 'text-black',
      };
    case '붐빔':
      return {
        bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500',
        bgNeo: 'bg-[#fca5a5]', textNeo: 'text-black',
      };
    default:
      return {
        bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400',
        bgNeo: 'bg-gray-200', textNeo: 'text-black/50',
      };
  }
}

function formatPopulation(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatForecastTime(time: string): string {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return `${date.getHours()}시`;
}

function formatUpdatedTime(time: string): string {
  if (!time) return '';
  const parts = time.split(' ');
  return parts[1] ? `${parts[1]} 기준` : time;
}

export default function CongestionBadge({ lat, lng, isNeoBrutalism, variant = 'compact' }: CongestionBadgeProps) {
  const themeClass = useThemeClass();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useSWR<CongestionResponse>(
    `/api/city-data?lat=${lat}&lng=${lng}&fields=congestion`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000,
      dedupingInterval: 5 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  if (isLoading && !data) {
    if (variant === 'compact') return null;
    return (
      <div className={isNeoBrutalism
        ? 'border-2 border-black rounded-[5px] p-4 shadow-[3px_3px_0px_0px_#000] skeleton-neo h-20'
        : 'rounded-xl p-4 border border-gray-100 skeleton h-20'
      } />
    );
  }

  if (!data?.congestion) return null;

  const { congestion, area } = data;
  const color = resolveCongestionColor(congestion.level);

  if (variant === 'compact') {
    return (
      <span className={themeClass(
        `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border-2 border-black ${color.bgNeo} ${color.textNeo} text-xs font-black`,
        `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${color.bg} ${color.text} text-xs font-semibold`
      )}>
        <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
        <span>{congestion.level}</span>
      </span>
    );
  }

  return (
    <div className={isNeoBrutalism
      ? 'bg-white border-2 border-black rounded-[5px] p-4 shadow-[3px_3px_0px_0px_#000]'
      : 'bg-white rounded-xl p-4 border border-gray-100'
    }>
      <div className="flex items-stretch gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl leading-none">👥</span>
            <div>
              <p className={themeClass(
                'text-xs text-black/50 font-bold uppercase',
                'text-xs text-gray-400'
              )}>주변 혼잡도</p>
              <div className="flex items-center gap-2">
                <span className={themeClass(
                  `inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] border-2 border-black text-xs font-black ${color.bgNeo} ${color.textNeo}`,
                  `inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${color.bg} ${color.text}`
                )}>
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                  {congestion.level}
                </span>
                <span className={themeClass(
                  'text-[11px] font-bold text-black/40',
                  'text-[11px] text-gray-400'
                )}>
                  {area}
                </span>
              </div>
            </div>
          </div>
          <p className={themeClass(
            'text-xs font-bold text-black/50 mt-1',
            'text-xs text-gray-500 mt-1'
          )}>
            {congestion.message}
          </p>
          <div className={themeClass(
            'flex items-center gap-1.5 text-[11px] font-bold text-black/40 mt-1',
            'flex items-center gap-1.5 text-[11px] text-gray-400 mt-1'
          )}>
            <span>현재 약 {formatPopulation(congestion.populationMin)}~{formatPopulation(congestion.populationMax)}명</span>
            <span>·</span>
            <span>{formatUpdatedTime(congestion.populationTime)}</span>
          </div>
        </div>
      </div>

      {congestion.forecast.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className={themeClass(
              'mt-3 pt-3 border-t-2 border-black/10 w-full flex items-center justify-between text-xs font-black text-black/50',
              'mt-3 pt-3 border-t border-gray-100 w-full flex items-center justify-between text-xs text-gray-400'
            )}
            aria-expanded={expanded}
          >
            <span>향후 12시간 예측</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {expanded && (
            <div className="mt-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex gap-2 min-w-max pb-1">
                {congestion.forecast.map((f) => {
                  const fColor = resolveCongestionColor(f.level);
                  return (
                    <div
                      key={f.time}
                      className={themeClass(
                        'flex flex-col items-center gap-1 px-2.5 py-2 rounded-[5px] border-2 border-black/15 min-w-[60px]',
                        'flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg border border-gray-100 min-w-[60px]'
                      )}
                    >
                      <span className={themeClass(
                        'text-[10px] font-black text-black/40',
                        'text-[10px] text-gray-400'
                      )}>
                        {formatForecastTime(f.time)}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${fColor.dot}`} />
                      <span className={themeClass(
                        `text-[10px] font-black ${fColor.textNeo}`,
                        `text-[10px] font-semibold ${fColor.text}`
                      )}>
                        {f.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
