'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import Link from 'next/link';

interface DistrictRate {
  district: string;
  total: number;
  available: number;
  booked: number;
  bookingRate: number;
}

interface Snapshot {
  snapshot_at: string;
  district: string;
  total_courts: number;
  available_courts: number;
  booked_courts: number;
}

interface TrendsData {
  snapshots: Snapshot[];
  currentRates: DistrictRate[];
  period: { from: string; to: string; days: number };
  hasHistory: boolean;
}

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => {
    if (d.error) throw new Error(d.error);
    return d;
  });

function getBarColor(rate: number, isNeo: boolean): string {
  if (isNeo) {
    if (rate >= 70) return 'bg-[#fca5a5] border-black';
    if (rate >= 40) return 'bg-[#facc15] border-black';
    return 'bg-[#a3e635] border-black';
  }
  if (rate >= 70) return 'bg-red-400';
  if (rate >= 40) return 'bg-yellow-400';
  return 'bg-green-400';
}

function getBarLabel(rate: number): string {
  if (rate >= 70) return '치열';
  if (rate >= 40) return '보통';
  return '여유';
}

const PERIOD_OPTIONS = [7, 14, 30] as const;

export default function TrendsContent() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [days, setDays] = useState<number>(7);

  const { data, error, isLoading } = useSWR<TrendsData>(
    `/api/trends?days=${days}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const cardClass = isNeoBrutalism
    ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
    : 'bg-white rounded-2xl border border-gray-100';

  return (
    <div className={`min-h-screen ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className={`text-2xl sm:text-3xl mb-2 ${themeClass('font-black text-black uppercase tracking-tight', 'font-bold text-gray-900')}`}>
            {isNeoBrutalism ? '📊 경쟁률 트렌드' : '경쟁률 트렌드'}
          </h1>
          <p className={themeClass('text-black/60', 'text-gray-500')}>
            서울시 테니스장 예약 경쟁률을 확인하세요
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
          <>
            {(data.currentRates?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(() => {
                  const totals = data.currentRates.reduce(
                    (acc, r) => ({ total: acc.total + r.total, available: acc.available + r.available, booked: acc.booked + r.booked }),
                    { total: 0, available: 0, booked: 0 }
                  );
                  const overallRate = totals.total > 0 ? Math.round((totals.booked / totals.total) * 100) : 0;
                  return [
                    { label: '전체 코트', value: `${totals.total}개` },
                    { label: '예약 가능', value: `${totals.available}개` },
                    { label: '전체 마감률', value: `${overallRate}%` },
                  ].map((item) => (
                    <div key={item.label} className={`${cardClass} p-4 text-center`}>
                      <p className={`text-xs mb-1 ${themeClass('text-black/50 font-bold uppercase', 'text-gray-400')}`}>{item.label}</p>
                      <p className={`text-xl ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>{item.value}</p>
                    </div>
                  ));
                })()}
              </div>
            )}

            <div className={`${cardClass} overflow-hidden mb-6`}>
              <div className={isNeoBrutalism ? 'p-5 border-b-2 border-black' : 'p-5 border-b border-gray-100'}>
                <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                  {isNeoBrutalism ? (
                    <span className="w-6 h-6 bg-[#facc15] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">📊</span>
                  ) : (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  구별 마감률
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {data.currentRates.length === 0 ? (
                  <p className={`text-center py-8 ${themeClass('text-black/40', 'text-gray-400')}`}>
                    아직 수집된 데이터가 없습니다.
                  </p>
                ) : (
                  data.currentRates.map((rate) => {
                    const slug = KOREAN_TO_SLUG[rate.district];
                    return (
                      <Link
                        key={rate.district}
                        href={slug ? `/${slug}` : '#'}
                        className="group flex items-center gap-3"
                      >
                        <span className={`w-16 text-xs text-right shrink-0 ${themeClass('font-bold text-black', 'font-medium text-gray-700')}`}>
                          {rate.district.replace('구', '')}
                        </span>
                        <div className={`flex-1 h-7 rounded-full overflow-hidden ${themeClass('border border-black/10 bg-white', 'bg-gray-100')}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(rate.bookingRate, isNeoBrutalism)}`}
                            style={{ width: `${Math.max(rate.bookingRate, 2)}%` }}
                          />
                        </div>
                        <span className={`w-20 text-xs text-right shrink-0 ${themeClass('font-bold text-black', 'font-medium text-gray-600')}`}>
                          {rate.bookingRate}% {getBarLabel(rate.bookingRate)}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

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
                  <TrendTimeline snapshots={data.snapshots} isNeoBrutalism={isNeoBrutalism} />
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
          </>
        )}
      </div>
    </div>
  );
}

function TrendTimeline({ snapshots, isNeoBrutalism }: { snapshots: Snapshot[]; isNeoBrutalism: boolean }) {
  const grouped = new Map<string, { day: string; total: number; booked: number }>();
  for (const s of snapshots) {
    const dayKey = s.snapshot_at.slice(0, 10);
    const existing = grouped.get(dayKey) ?? { day: dayKey, total: 0, booked: 0 };
    existing.total += s.total_courts;
    existing.booked += s.booked_courts;
    grouped.set(dayKey, existing);
  }

  const timeline = Array.from(grouped.values())
    .map(g => ({ ...g, rate: g.total > 0 ? Math.round((g.booked / g.total) * 100) : 0 }))
    .slice(-30);

  if (timeline.length < 2) {
    return <p className={isNeoBrutalism ? 'text-black/40' : 'text-gray-400'}>데이터가 충분하지 않습니다.</p>;
  }

  const maxRate = Math.max(...timeline.map(t => t.rate), 100);
  const chartHeight = 120;

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-end gap-1 min-w-[400px]" style={{ height: chartHeight }}>
        {timeline.map((point, i) => {
          const height = (point.rate / maxRate) * chartHeight;
          const date = new Date(point.day);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <div key={point.day} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: chartHeight }}>
              <span className={`text-[10px] ${isNeoBrutalism ? 'font-bold text-black' : 'text-gray-500'}`}>
                {point.rate}%
              </span>
              <div
                className={`w-full min-w-[12px] rounded-t transition-all ${
                  isNeoBrutalism
                    ? `border border-black ${point.rate >= 70 ? 'bg-[#fca5a5]' : point.rate >= 40 ? 'bg-[#facc15]' : 'bg-[#a3e635]'}`
                    : point.rate >= 70 ? 'bg-red-400' : point.rate >= 40 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ height: Math.max(height, 4) }}
              />
              {i % Math.max(1, Math.floor(timeline.length / 7)) === 0 && (
                <span className={`text-[9px] leading-none mt-0.5 whitespace-nowrap ${isNeoBrutalism ? 'text-black/40' : 'text-gray-400'}`}>
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
