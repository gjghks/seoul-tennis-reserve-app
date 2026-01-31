'use client';

import { useState, useMemo } from 'react';

interface AvailabilityCalendarProps {
  serviceOpenBegin?: string;  // SVCOPNBGNDT
  serviceOpenEnd?: string;    // SVCOPNENDDT
  receiptBegin?: string;      // RCPTBGNDT
  receiptEnd?: string;        // RCPTENDDT
}

// 날짜 파싱 (Seoul API 형식: "2026-01-15 00:00:00.0")
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const cleanDate = dateStr.split(' ')[0]; // "2026-01-15"
    return new Date(cleanDate);
  } catch {
    return null;
  }
}

// 날짜 포맷
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function AvailabilityCalendar({
  serviceOpenBegin,
  serviceOpenEnd,
  receiptBegin,
  receiptEnd,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const openBegin = parseDate(serviceOpenBegin);
  const openEnd = parseDate(serviceOpenEnd);
  const rcptBegin = parseDate(receiptBegin);
  const rcptEnd = parseDate(receiptEnd);

  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 해당 월의 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 첫 주의 시작 (일요일부터)
    const startPadding = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // 이전 달의 날짜들
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // 다음 달의 날짜들 (6주 채우기)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  // 날짜 상태 확인
  const getDayStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // 과거 날짜
    if (checkDate < today) return 'past';

    // 예약 가능 기간 내
    if (rcptBegin && rcptEnd) {
      const begin = new Date(rcptBegin);
      begin.setHours(0, 0, 0, 0);
      const end = new Date(rcptEnd);
      end.setHours(0, 0, 0, 0);

      if (checkDate >= begin && checkDate <= end) {
        return 'available';
      }
    }

    // 서비스 기간 내
    if (openBegin && openEnd) {
      const begin = new Date(openBegin);
      begin.setHours(0, 0, 0, 0);
      const end = new Date(openEnd);
      end.setHours(0, 0, 0, 0);

      if (checkDate >= begin && checkDate <= end) {
        return 'service';
      }
    }

    return 'none';
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-[#112240] rounded-xl border border-[#233554] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[#233554] transition-colors text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-white">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[#233554] transition-colors text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const status = getDayStatus(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg
                ${!isCurrentMonth ? 'text-gray-600' : ''}
                ${status === 'past' ? 'text-gray-600' : ''}
                ${status === 'available' && isCurrentMonth ? 'bg-[#64ffda]/20 text-[#64ffda] font-medium' : ''}
                ${status === 'service' && isCurrentMonth ? 'bg-[#233554] text-gray-300' : ''}
                ${status === 'none' && isCurrentMonth ? 'text-gray-400' : ''}
                ${isToday ? 'ring-2 ring-[#64ffda]' : ''}
              `}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#233554] flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#64ffda]/20" />
          <span className="text-gray-400">예약 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#233554]" />
          <span className="text-gray-400">서비스 기간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded ring-2 ring-[#64ffda]" />
          <span className="text-gray-400">오늘</span>
        </div>
      </div>

      {/* Date Info */}
      {(rcptBegin || rcptEnd || openBegin || openEnd) && (
        <div className="mt-4 pt-4 border-t border-[#233554] space-y-2 text-sm">
          {rcptBegin && rcptEnd && (
            <div className="flex justify-between">
              <span className="text-gray-500">예약 가능 기간</span>
              <span className="text-[#64ffda]">
                {formatDate(rcptBegin)} ~ {formatDate(rcptEnd)}
              </span>
            </div>
          )}
          {openBegin && openEnd && (
            <div className="flex justify-between">
              <span className="text-gray-500">서비스 기간</span>
              <span className="text-gray-400">
                {formatDate(openBegin)} ~ {formatDate(openEnd)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
