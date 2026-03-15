'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { DISTRICTS, KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { isIndependentCourt } from '@/lib/data/independentCourts';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';
import type { SeoulService } from '@/lib/seoulApi';
import { isCourtAccepting } from '@/lib/utils/courtStatus';
import Link from 'next/link';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Seoul API format: "2025-03-01 00:00:00.0" — trailing fractional seconds must be stripped
  const d = new Date(dateStr.replace(/\.\d+$/, ''));
  return Number.isNaN(d.getTime()) ? null : d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

function isReceiptOpenOn(court: SeoulService, dateKey: string): boolean {
  const begin = parseDate(court.RCPTBGNDT);
  const end = parseDate(court.RCPTENDDT);
  if (!begin || !end) return false;
  return dateKey >= toDateKey(begin) && dateKey <= toDateKey(end);
}

function getDotClass(count: number, isNeo: boolean): string {
  if (count === 0) return '';
  if (isNeo) {
    if (count >= 16) return 'bg-[#22c55e] border border-black';
    if (count >= 6) return 'bg-[#a3e635] border border-black';
    return 'bg-[#facc15] border border-black';
  }
  if (count >= 16) return 'bg-green-600';
  if (count >= 6) return 'bg-green-400';
  return 'bg-green-200';
}

interface CalendarContentProps {
  courts: SeoulService[];
}

export default function CalendarContent({ courts }: CalendarContentProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, [router]);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const filteredCourts = useMemo(() => {
    if (selectedDistrict === 'all') return courts;
    return courts.filter(c => c.AREANM === selectedDistrict);
  }, [courts, selectedDistrict]);

  const dateCourtMap = useMemo(() => {
    const map = new Map<string, number>();
    const days = getDaysInMonth(viewYear, viewMonth);
    for (let day = 1; day <= days; day++) {
      const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
      let count = 0;
      for (const court of filteredCourts) {
        if (isReceiptOpenOn(court, dateKey)) count++;
      }
      map.set(dateKey, count);
    }
    return map;
  }, [filteredCourts, viewYear, viewMonth]);

  const selectedDateCourts = useMemo(() => {
    if (!selectedDate) return [];
    return filteredCourts.filter(c => isReceiptOpenOn(c, selectedDate));
  }, [filteredCourts, selectedDate]);

  const externalCourts = useMemo(() => {
    const sourceCourts = selectedDistrict === 'all'
      ? courts
      : courts.filter(c => c.AREANM === selectedDistrict);
    return sourceCourts.filter(c => isIndependentCourt(c.SVCID));
  }, [courts, selectedDistrict]);

  const groupedExternalCourts = useMemo(() => {
    const grouped: Record<string, SeoulService[]> = {};
    for (const court of externalCourts) {
      if (!grouped[court.AREANM]) {
        grouped[court.AREANM] = [];
      }
      grouped[court.AREANM].push(court);
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'ko-KR'));
  }, [externalCourts]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
    setSelectedDate(null);
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(toDateKey(now));
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const cardClass = isNeoBrutalism
    ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
    : 'bg-white rounded-2xl border border-gray-100';

  const sectionHeaderClass = isNeoBrutalism
    ? 'p-5 border-b-2 border-black'
    : 'p-5 border-b border-gray-100';

  const availableDistricts = useMemo(() => {
    const set = new Set(courts.map(c => c.AREANM));
    return DISTRICTS.filter(d => set.has(d.nameKo));
  }, [courts]);

  const todayKey = toDateKey(now);
  const todayCount = dateCourtMap.get(todayKey) ?? 0;
  const totalThisMonth = Array.from(dateCourtMap.values()).reduce((a, b) => a + b, 0);
  const peakDay = Array.from(dateCourtMap.entries()).reduce(
    (max, [key, val]) => (val > max.val ? { key, val } : max),
    { key: '', val: 0 }
  );
  const peakDayNum = peakDay.key ? Number.parseInt(peakDay.key.split('-')[2]) : 0;

  const { ref: summaryRef, inView: summaryInView } = useInView();
  const animTodayCount = useCountUp(todayCount, summaryInView);
  const animTotalMonth = useCountUp(totalThisMonth, summaryInView);
  const animPeakDay = useCountUp(peakDayNum, summaryInView);

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
    <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className={`text-2xl mb-2 ${themeClass('font-black text-black uppercase tracking-tight', 'font-bold text-gray-900')}`}>
            {isNeoBrutalism ? '📅 예약 캘린더' : '예약 캘린더'}
          </h1>
          <p className={themeClass('text-black/60', 'text-gray-500')}>
            날짜별 접수 가능한 테니스장을 확인하세요
          </p>
        </div>

        {/* District filter */}
        <div className="mb-6">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className={`px-4 py-2 text-sm ${
              isNeoBrutalism
                ? 'bg-white border-2 border-black rounded-[5px] font-bold text-black'
                : 'bg-white border border-gray-200 rounded-lg text-gray-700'
            }`}
          >
            <option value="all">전체 지역</option>
            {availableDistricts.map(d => (
              <option key={d.slug} value={d.nameKo}>{d.nameKo}</option>
            ))}
          </select>
        </div>

        {/* Calendar card */}
        <div className={`${cardClass} overflow-hidden mb-6`}>
          <div className={sectionHeaderClass}>
            <div className="flex items-center justify-between">
              <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                {isNeoBrutalism ? (
                  <span className="w-6 h-6 bg-[#facc15] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">📅</span>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {viewYear}년 {viewMonth + 1}월
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className={`px-3 py-1 text-xs ${
                    isNeoBrutalism
                      ? 'bg-[#facc15] border-2 border-black rounded-[3px] font-bold text-black hover:bg-[#fbbf24]'
                      : 'bg-green-50 border border-green-200 rounded-md text-green-700 hover:bg-green-100'
                  }`}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={goPrev}
                  className={`w-8 h-8 flex items-center justify-center ${
                    isNeoBrutalism
                      ? 'border-2 border-black rounded-[3px] bg-white hover:bg-gray-100 font-bold'
                      : 'border border-gray-200 rounded-lg hover:bg-gray-50'
                  }`}
                  aria-label="이전 달"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className={`w-8 h-8 flex items-center justify-center ${
                    isNeoBrutalism
                      ? 'border-2 border-black rounded-[3px] bg-white hover:bg-gray-100 font-bold'
                      : 'border border-gray-200 rounded-lg hover:bg-gray-50'
                  }`}
                  aria-label="다음 달"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`text-center text-xs py-1 ${
                    i === 0
                      ? themeClass('font-bold text-red-500', 'font-medium text-red-400')
                      : i === 6
                        ? themeClass('font-bold text-blue-500', 'font-medium text-blue-400')
                        : themeClass('font-bold text-black/60', 'font-medium text-gray-400')
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDay }, (_, offset) => {
                const prevDate = new Date(viewYear, viewMonth, -firstDay + offset + 1);
                return <div key={`pad-${toDateKey(prevDate)}`} className="aspect-square" />;
              })}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
                const count = dateCourtMap.get(dateKey) ?? 0;
                const today = isToday(viewYear, viewMonth, day);
                const isSelected = selectedDate === dateKey;
                const dayOfWeek = (firstDay + i) % 7;
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`aspect-square flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative ${
                      isSelected
                        ? isNeoBrutalism
                          ? 'bg-black text-white rounded-[3px]'
                          : 'bg-green-600 text-white rounded-lg'
                        : today
                          ? isNeoBrutalism
                            ? 'bg-[#facc15] border-2 border-black rounded-[3px] font-black'
                            : 'bg-green-50 border border-green-300 rounded-lg font-semibold'
                          : isNeoBrutalism
                            ? 'hover:bg-gray-100 rounded-[3px]'
                            : 'hover:bg-gray-50 rounded-lg'
                    } ${
                      !isSelected && isSunday ? themeClass('text-red-500', 'text-red-400') : ''
                    } ${
                      !isSelected && isSaturday ? themeClass('text-blue-500', 'text-blue-400') : ''
                    }`}
                  >
                    <span className={isNeoBrutalism ? 'font-bold text-xs sm:text-sm' : 'text-xs sm:text-sm'}>
                      {day}
                    </span>
                    {count > 0 && (
                      <span
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full anim-pop-in ${
                          isSelected
                            ? 'bg-white/70'
                            : getDotClass(count, isNeoBrutalism)
                        }`}
                        key={`dot-${viewYear}-${viewMonth}-${day}`}
                        style={{ animationDelay: `${day * 15}ms` }}
                        title={`${count}개 접수 가능`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className={`flex items-center justify-center gap-4 mt-4 pt-4 ${themeClass('border-t-2 border-black/15', 'border-t border-gray-100')}`}>
              {[
                { label: '1~5개', cls: getDotClass(1, isNeoBrutalism) },
                { label: '6~15개', cls: getDotClass(6, isNeoBrutalism) },
                { label: '16개+', cls: getDotClass(16, isNeoBrutalism) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.cls}`} />
                  <span className={`text-xs ${themeClass('text-black/60 font-bold', 'text-gray-400')}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div ref={summaryRef} className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '오늘 접수', value: `${animTodayCount}개` },
            { label: '이번 달 총', value: `${animTotalMonth}건` },
            { label: '최다 접수일', value: peakDayNum > 0 ? `${animPeakDay}일` : '-' },
          ].map(item => (
            <div key={item.label} className={`${cardClass} p-4 text-center`}>
              <p className={`text-xs mb-1 ${themeClass('text-black/60 font-bold uppercase', 'text-gray-400')}`}>{item.label}</p>
              <p className={`text-xl ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className={`${cardClass} overflow-hidden`}>
            <div className={sectionHeaderClass}>
              <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                {isNeoBrutalism ? (
                  <span className="w-6 h-6 bg-[#a3e635] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">🎾</span>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {selectedDate.replace(/-/g, '.')} 접수 가능 ({selectedDateCourts.length}개)
              </h2>
            </div>
            <div className="p-5">
              {selectedDateCourts.length === 0 ? (
                <div className="text-center py-6">
                  <svg className={themeClass('w-12 h-12 mx-auto mb-2', 'w-10 h-10 mx-auto mb-2')} viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
                      <rect x="10" y="14" width="44" height="40" rx="4" className={themeClass('fill-white stroke-black stroke-[2.5]', 'fill-white stroke-gray-300 stroke-[1.5]')} />
                      <rect x="10" y="14" width="44" height="12" rx="4" className={themeClass('fill-[#a3e635] stroke-black stroke-[2.5]', 'fill-green-100 stroke-gray-300 stroke-[1.5]')} />
                      <line x1="24" y1="10" x2="24" y2="20" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-300 stroke-[1.5]')} strokeLinecap="round" />
                      <line x1="40" y1="10" x2="40" y2="20" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-300 stroke-[1.5]')} strokeLinecap="round" />
                      <line x1="26" y1="36" x2="38" y2="48" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-400 stroke-[1.5]')} strokeLinecap="round" />
                      <line x1="38" y1="36" x2="26" y2="48" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-400 stroke-[1.5]')} strokeLinecap="round" />
                    </g>
                    <circle cx="56" cy="10" r="2" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
                    <circle cx="6" cy="46" r="1.5" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
                  </svg>
                  <p className={themeClass('text-black/60', 'text-gray-400')}>
                    이 날짜에 접수 가능한 테니스장이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateCourts.map(court => {
                    const slug = KOREAN_TO_SLUG[court.AREANM];
                    return (
                      <Link
                        key={court.SVCID}
                        href={slug ? `/${slug}` : '#'}
                        className={`block p-3 transition-all ${
                          isNeoBrutalism
                            ? 'border-2 border-black rounded-[5px] hover:shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5'
                            : 'border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm truncate ${themeClass('font-bold text-black', 'font-medium text-gray-900')}`}>
                              {court.SVCNM}
                            </p>
                            <p className={`text-xs mt-0.5 ${themeClass('text-black/60', 'text-gray-400')}`}>
                              {court.PLACENM} · {court.AREANM}
                            </p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${
                            isCourtAccepting(court.SVCSTATNM)
                              ? isNeoBrutalism
                                ? 'bg-[#a3e635] border border-black font-bold'
                                : 'bg-green-100 text-green-700'
                              : isNeoBrutalism
                                ? 'bg-gray-200 border border-black font-bold'
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {court.SVCSTATNM}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 mt-2 text-xs ${themeClass('text-black/60', 'text-gray-400')}`}>
                          <span>접수: {court.RCPTBGNDT?.slice(0, 10)} ~ {court.RCPTENDDT?.slice(0, 10)}</span>
                          <span>{court.PAYATNM}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {externalCourts.length > 0 && (
          <div className={`${cardClass} overflow-hidden mt-6`}>
            <div className={sectionHeaderClass}>
              <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black font-black', 'text-gray-900')}`}>
                {isNeoBrutalism ? (
                  <span className="w-6 h-6 bg-[#93c5fd] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">🌐</span>
                ) : (
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs">🌐</span>
                )}
                상시 예약 가능 (외부 예약)
              </h2>
              <p className={`mt-1 text-xs ${themeClass('text-black/60 font-bold', 'text-gray-500')}`}>
                아래 시설은 별도의 예약 사이트에서 상시 예약 가능합니다.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {groupedExternalCourts.map(([district, districtCourts]) => {
                const districtSlug = KOREAN_TO_SLUG[district];
                return (
                  <div
                    key={`external-${district}`}
                    className={themeClass(
                      'border-2 border-black rounded-[5px] overflow-hidden',
                      'border border-blue-200 rounded-xl overflow-hidden'
                    )}
                  >
                    <div className={`px-3 py-2 flex items-center justify-between ${themeClass('bg-[#93c5fd] border-b-2 border-black', 'bg-blue-100 border-b border-blue-200')}`}>
                      <p className={themeClass('font-black text-black uppercase tracking-tight text-sm', 'font-semibold text-blue-900 text-sm')}>
                        {district}
                      </p>
                      <p className={`text-xs ${themeClass('font-bold text-black/70', 'text-blue-700')}`}>
                        {districtCourts.length}개
                      </p>
                    </div>

                    <div className="divide-y divide-blue-100">
                      {districtCourts.map(court => (
                        <div key={court.SVCID} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm truncate ${themeClass('font-bold text-black', 'font-medium text-gray-900')}`}>
                                {court.SVCNM}
                              </p>
                              <p className={`text-xs mt-0.5 ${themeClass('text-black/60', 'text-gray-500')}`}>
                                {court.PLACENM} · {court.AREANM}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {isIndependentCourt(court.SVCID) && (
                                <span className={`px-1.5 py-0.5 text-[11px] rounded ${themeClass('bg-[#93c5fd] border border-black font-bold text-black', 'bg-blue-100 text-blue-700')}`}>
                                  독립
                                </span>
                              )}
                              {court.SVCURL && (
                                <a
                                  href={court.SVCURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-2.5 py-1 text-xs font-bold whitespace-nowrap ${themeClass('bg-[#93c5fd] border-2 border-black rounded-[3px] text-black hover:bg-[#60a5fa]', 'bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200')}`}
                                >
                                  외부 사이트
                                </a>
                              )}
                            </div>
                          </div>

                          <div className={`flex items-center gap-2 mt-2 text-xs ${themeClass('text-black/60', 'text-gray-500')}`}>
                            <span>{court.V_MIN || '-'} ~ {court.V_MAX || '-'}</span>
                            <span>·</span>
                            <span>{court.PAYATNM}</span>
                            {districtSlug && (
                              <>
                                <span>·</span>
                                <Link
                                  href={`/${districtSlug}`}
                                  className={themeClass('font-bold text-black underline', 'font-medium text-blue-700 hover:text-blue-800')}
                                >
                                  지역 보기
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}
