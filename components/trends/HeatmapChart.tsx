'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_INDEX_ORDER = [1, 2, 3, 4, 5, 6, 0];

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: '아침(6-12시)',
  afternoon: '오후(12-18시)',
  evening: '저녁(18-22시)',
  night: '밤(22-6시)',
};

const TIME_SLOT_ORDER = ['morning', 'afternoon', 'evening', 'night'] as const;

interface HeatmapChartProps {
  data: Record<number, Record<string, { avgBookingRate: number; sampleCount: number }>>;
}

function getCellColorNeo(rate: number): string {
  if (rate === 0) return 'bg-gray-100 border-black/20';
  if (rate < 30) return 'bg-[#a3e635] border-black';
  if (rate < 60) return 'bg-[#facc15] border-black';
  return 'bg-[#fca5a5] border-black';
}

function getCellColorMinimal(rate: number): string {
  if (rate === 0) return 'bg-gray-50';
  if (rate < 30) return 'bg-green-200';
  if (rate < 60) return 'bg-yellow-200';
  return 'bg-red-200';
}

function getDayFullName(dayLabel: string): string {
  const names: Record<string, string> = {
    '월': '월요일', '화': '화요일', '수': '수요일', '목': '목요일',
    '금': '금요일', '토': '토요일', '일': '일요일',
  };
  return names[dayLabel] ?? dayLabel;
}

function getTimeSlotKorean(slot: string): string {
  const names: Record<string, string> = {
    morning: '아침', afternoon: '오후', evening: '저녁', night: '밤',
  };
  return names[slot] ?? slot;
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [selected, setSelected] = useState<{ day: number; slot: string } | null>(null);

  const selectedCell = selected
    ? data[selected.day]?.[selected.slot]
    : null;

  const selectedDayLabel = selected
    ? DAY_LABELS[DAY_INDEX_ORDER.indexOf(selected.day)]
    : '';

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
            <div />
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className={`text-center text-xs py-1.5 ${themeClass(
                  'font-black text-black',
                  'font-medium text-gray-500'
                )}`}
              >
                {label}
              </div>
            ))}

            {TIME_SLOT_ORDER.map((slot) => (
              <div key={slot} className="contents">
                <div
                  className={`text-[11px] pr-2 flex items-center justify-end whitespace-nowrap ${themeClass(
                    'font-bold text-black',
                    'font-medium text-gray-500'
                  )}`}
                >
                  {TIME_SLOT_LABELS[slot]}
                </div>

                {DAY_INDEX_ORDER.map((dayIdx, colIdx) => {
                  const cell = data[dayIdx]?.[slot];
                  const rate = cell?.avgBookingRate ?? 0;
                  const hasSample = (cell?.sampleCount ?? 0) > 0;
                  const isSelected = selected?.day === dayIdx && selected?.slot === slot;

                  return (
                    <button
                      key={`${dayIdx}-${slot}`}
                      type="button"
                      onClick={() =>
                        setSelected(
                          isSelected ? null : { day: dayIdx, slot }
                        )
                      }
                      className={`
                        aspect-square rounded-sm transition-all flex items-center justify-center text-[10px]
                        ${isNeoBrutalism
                          ? `border ${isSelected ? 'border-2 border-black scale-110 z-10' : 'border'} ${getCellColorNeo(hasSample ? rate : 0)}`
                          : `${isSelected ? 'ring-2 ring-green-500 scale-110 z-10' : ''} ${getCellColorMinimal(hasSample ? rate : 0)}`
                        }
                        ${hasSample ? 'cursor-pointer' : 'cursor-default opacity-50'}
                      `}
                      aria-label={`${DAY_LABELS[colIdx]} ${getTimeSlotKorean(slot)}: ${hasSample ? `${rate}%` : '데이터 없음'}`}
                    >
                      {hasSample && rate > 0 && (
                        <span className={`${themeClass('font-bold text-black', 'font-medium text-gray-700')} leading-none`}>
                          {rate}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && selectedCell && selectedCell.sampleCount > 0 && (
        <div
          className={`text-sm px-3 py-2 rounded-md ${themeClass(
            'bg-[#facc15]/30 border border-black/20 font-bold text-black',
            'bg-green-50 text-gray-700'
          )}`}
        >
          {getDayFullName(selectedDayLabel)} {getTimeSlotKorean(selected.slot)}: 평균 마감률{' '}
          <span className={themeClass('text-black', 'text-green-700 font-semibold')}>
            {selectedCell.avgBookingRate}%
          </span>
          <span className={`ml-2 text-xs ${themeClass('text-black/50', 'text-gray-400')}`}>
            (데이터 {selectedCell.sampleCount}건)
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 justify-center">
        <span className={`text-[10px] ${themeClass('text-black/50 font-bold', 'text-gray-400')}`}>여유</span>
        {[
          { neo: 'bg-[#a3e635]', min: 'bg-green-200' },
          { neo: 'bg-[#facc15]', min: 'bg-yellow-200' },
          { neo: 'bg-[#fca5a5]', min: 'bg-red-200' },
        ].map((color) => (
          <div
            key={`legend-${color.neo}`}
            className={`w-5 h-3 rounded-sm ${themeClass(
              `${color.neo} border border-black`,
              color.min
            )}`}
          />
        ))}
        <span className={`text-[10px] ${themeClass('text-black/50 font-bold', 'text-gray-400')}`}>치열</span>
      </div>
    </div>
  );
}
