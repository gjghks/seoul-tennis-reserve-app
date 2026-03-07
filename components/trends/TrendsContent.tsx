'use client';

import { useState, useCallback, Fragment } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import useSWR from 'swr';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';
import HeatmapChart from './HeatmapChart';

interface DailyTrend {
  day: string;
  total_courts: number;
  available_courts: number;
  booked_courts: number;
  booking_rate: number;
}

interface TrendsData {
  dailyTrends: DailyTrend[];
  period: { from: string; to: string; days: number };
  hasHistory: boolean;
}

interface HeatmapCell {
  avgBookingRate: number;
  sampleCount: number;
}

interface HeatmapData {
  heatmap: Record<number, Record<string, HeatmapCell>>;
  insights: {
    bestTimeToBook: { day: string; timeSlot: string; avgRate: number };
    worstTimeToBook: { day: string; timeSlot: string; avgRate: number };
    weekdayAvg: number;
    weekendAvg: number;
  } | null;
  hasData: boolean;
}

const TIME_SLOT_KOREAN: Record<string, string> = {
  morning: '아침',
  afternoon: '오후',
  evening: '저녁',
  night: '밤',
};

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => {
    if (d.error) throw new Error(d.error);
    return d;
  });

const PERIOD_OPTIONS = [7, 14, 30] as const;

export default function TrendsContent() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [days, setDays] = useState<number>(7);

  const { data, error, isLoading, mutate } = useSWR<TrendsData>(
    `/api/trends?days=${days}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: heatmapData, mutate: mutateHeatmap } = useSWR<HeatmapData>(
    `/api/trends?analysis=heatmap&days=${days}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([mutate(), mutateHeatmap()]);
  }, [mutate, mutateHeatmap]);

  const cardClass = isNeoBrutalism
    ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
    : 'bg-white rounded-2xl border border-gray-100';

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>새로고침 중...</span>
        </div>
      }
    >
    <div className={`min-h-screen ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl mb-2 ${themeClass('font-black text-black uppercase tracking-tight', 'font-bold text-gray-900')}`}>
            {isNeoBrutalism ? '📊 예약 타이밍 가이드' : '예약 타이밍 가이드'}
          </h1>
          <p className={themeClass('text-black/60', 'text-gray-500')}>
            언제 예약하면 경쟁이 적을지 확인하세요
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDays(p)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                days === p
                  ? isNeoBrutalism
                    ? 'bg-black text-white border-2 border-black rounded-[5px]'
                    : 'bg-green-600 text-white rounded-lg'
                  : isNeoBrutalism
                    ? 'bg-white border-2 border-black rounded-[5px] text-black hover:bg-gray-100'
                    : 'bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-green-300'
              }`}
            >
              {p}일
            </button>
          ))}
        </div>

        {isLoading && (
          <div className={`${cardClass} p-6 mb-6`}>
            <div className="space-y-4">
              {['s1','s2','s3','s4','s5','s6','s7','s8'].map((id) => (
                <div key={id} className="flex items-center gap-3">
                  <div className="w-16 h-4 skeleton rounded" />
                  <div className="flex-1 h-6 skeleton rounded" />
                  <div className="w-10 h-4 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={`${cardClass} p-6 mb-6 text-center`}>
            <p className={themeClass('text-black/60', 'text-gray-500')}>데이터를 불러오는 데 실패했습니다.</p>
            <button
              type="button"
              onClick={() => setDays(days)}
              className={`mt-3 px-4 py-2 text-sm ${themeClass('btn-nb btn-nb-primary', 'btn btn-primary')}`}
            >
              다시 시도
            </button>
          </div>
        )}

        {data && !isLoading && (
          <Fragment key={days}>
            {heatmapData?.hasData && heatmapData.insights ? (
              <div className={`${cardClass} overflow-hidden mb-6`}>
                <div className={isNeoBrutalism ? 'p-5 border-b-2 border-black' : 'p-5 border-b border-gray-100'}>
                  <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                    {isNeoBrutalism ? (
                      <span className="w-6 h-6 bg-[#facc15] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">📊</span>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                    요일별 예약 패턴
                  </h2>
                </div>
                <div className="p-5">
                  <HeatmapChart data={heatmapData.heatmap} />
                </div>

                <div className={`px-5 pb-5 space-y-2 ${themeClass('border-t-2 border-black pt-4', 'border-t border-gray-100 pt-4')}`}>
                  <div className={`flex items-start gap-2 text-sm ${themeClass('text-black', 'text-gray-700')}`}>
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs ${themeClass('bg-[#a3e635] border border-black font-bold', 'bg-green-100 text-green-700')}`}>
                      {isNeoBrutalism ? '✓' : '✓'}
                    </span>
                    <span>
                      예약하기 가장 좋은 시간:{' '}
                      <strong className={themeClass('font-black', 'font-semibold text-green-700')}>
                        {heatmapData.insights.bestTimeToBook.day}요일 {TIME_SLOT_KOREAN[heatmapData.insights.bestTimeToBook.timeSlot]}
                      </strong>
                      {' '}(평균 마감률 {heatmapData.insights.bestTimeToBook.avgRate}%)
                    </span>
                  </div>

                  <div className={`flex items-start gap-2 text-sm ${themeClass('text-black', 'text-gray-700')}`}>
                    <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs ${themeClass('bg-[#fca5a5] border border-black font-bold', 'bg-red-100 text-red-700')}`}>
                      !
                    </span>
                    <span>
                      가장 경쟁이 치열한 시간:{' '}
                      <strong className={themeClass('font-black', 'font-semibold text-red-600')}>
                        {heatmapData.insights.worstTimeToBook.day}요일 {TIME_SLOT_KOREAN[heatmapData.insights.worstTimeToBook.timeSlot]}
                      </strong>
                      {' '}(평균 마감률 {heatmapData.insights.worstTimeToBook.avgRate}%)
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 text-sm pt-1 ${themeClass('text-black/70', 'text-gray-500')}`}>
                    <span>주중 평균 <strong className={themeClass('font-black text-black', 'font-semibold text-gray-700')}>{heatmapData.insights.weekdayAvg}%</strong></span>
                    <span className={themeClass('text-black/30', 'text-gray-300')}>|</span>
                    <span>주말 평균 <strong className={themeClass('font-black text-black', 'font-semibold text-gray-700')}>{heatmapData.insights.weekendAvg}%</strong></span>
                  </div>
                </div>
              </div>
            ) : !heatmapData?.hasData && heatmapData !== undefined ? (
              <div className={`${cardClass} p-6 mb-6`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full ${themeClass('bg-[#facc15] border-2 border-black', 'bg-blue-50')}`}>
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>요일별 패턴 데이터 수집 중</h3>
                    <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
                      하루 4회 데이터가 수집되면 요일·시간대별 예약 패턴 분석이 활성화됩니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {data.hasHistory ? (
              <div className={`${cardClass} overflow-hidden mb-6`}>
                <div className={isNeoBrutalism ? 'p-5 border-b-2 border-black' : 'p-5 border-b border-gray-100'}>
                  <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                    {isNeoBrutalism ? (
                      <span className="w-6 h-6 bg-[#facc15] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">📈</span>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                    일별 마감률 추이
                  </h2>
                </div>
                <div className="p-5">
                  <TrendTimeline trends={data.dailyTrends} isNeoBrutalism={isNeoBrutalism} />
                </div>
              </div>
            ) : (
              <div className={`${cardClass} p-6 mb-6`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full ${themeClass('bg-[#facc15] border-2 border-black', 'bg-blue-50')}`}>
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>데이터 수집 중</h3>
                    <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
                      현재 실시간 데이터만 표시됩니다. 매일 오전 9시에 데이터가 수집되며, 약 1주일 후 일별 트렌드 차트가 활성화됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}

function TrendTimeline({ trends, isNeoBrutalism }: { trends: DailyTrend[]; isNeoBrutalism: boolean }) {
  const { ref, inView } = useInView();

  const timeline = trends.slice(-30);

  if (timeline.length < 2) {
    return <p className={isNeoBrutalism ? 'text-black/60' : 'text-gray-400'}>데이터가 충분하지 않습니다.</p>;
  }

  const maxRate = Math.max(...timeline.map(t => t.booking_rate), 100);
  const chartHeight = 120;

  return (
    <div ref={ref} className="overflow-x-auto scrollbar-hide">
      <div className="flex items-end gap-1 min-w-[400px]" style={{ height: chartHeight }}>
        {timeline.map((point, i) => {
          const height = (point.booking_rate / maxRate) * chartHeight;
          const date = new Date(point.day + 'T00:00:00');
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <div key={point.day} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: chartHeight }}>
              <span className={`text-[10px] ${isNeoBrutalism ? 'font-bold text-black' : 'text-gray-500'}`}>
                {point.booking_rate}%
              </span>
              <div
                className={`w-full min-w-[12px] rounded-t ${
                  isNeoBrutalism
                    ? `border border-black ${point.booking_rate >= 70 ? 'bg-[#fca5a5]' : point.booking_rate >= 40 ? 'bg-[#facc15]' : 'bg-[#a3e635]'}`
                    : point.booking_rate >= 70 ? 'bg-red-400' : point.booking_rate >= 40 ? 'bg-yellow-400' : 'bg-green-400'
                } ${inView ? 'anim-bar-y' : 'scale-y-0'}`}
                style={{
                  height: Math.max(height, 4),
                  transformOrigin: 'center bottom',
                  animationDelay: `${i * 35}ms`,
                }}
              />
              {i % Math.max(1, Math.floor(timeline.length / 7)) === 0 && (
                <span className={`text-[9px] leading-none mt-0.5 whitespace-nowrap ${isNeoBrutalism ? 'text-black/60' : 'text-gray-400'}`}>
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
