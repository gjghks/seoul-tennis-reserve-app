'use client';

import { cn, useThemeClass } from '@/lib/cn';
import type { CourtSurface } from '@/lib/constants/tennis';
import { COURT_SURFACE_OPTIONS } from '@/lib/constants/tennis';

interface RecordOptionalDetailsSectionProps {
  courtSurface: CourtSurface | '';
  onCourtSurfaceChange: (value: CourtSurface | '') => void;
  opponentName: string;
  onOpponentNameChange: (value: string) => void;
  opponentLevel: string;
  onOpponentLevelChange: (value: string) => void;
  durationMinutes: string;
  onDurationMinutesChange: (value: string) => void;
  cost: string;
  onCostChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

function isCourtSurface(value: string): value is CourtSurface {
  return COURT_SURFACE_OPTIONS.some((option) => option.value === value);
}

export default function RecordOptionalDetailsSection({
  courtSurface,
  onCourtSurfaceChange,
  opponentName,
  onOpponentNameChange,
  opponentLevel,
  onOpponentLevelChange,
  durationMinutes,
  onDurationMinutesChange,
  cost,
  onCostChange,
  notes,
  onNotesChange,
}: RecordOptionalDetailsSectionProps) {
  const themeClass = useThemeClass();
  const labelClass = themeClass(
    'block mb-2 font-bold text-black text-lg',
    'block mb-1.5 font-medium text-gray-700 text-sm'
  );
  const inputClass = themeClass(
    'w-full p-3 border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 shadow-[4px_4px_0px_0px_#000] transition-all',
    'w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
  );

  return (
    <>
      <div>
        <label htmlFor="court_surface" className={labelClass}>
          코트 표면 <span className="text-gray-400 text-sm">(선택)</span>
        </label>
        <select
          id="court_surface"
          value={courtSurface}
          onChange={(event) => {
            const value = event.target.value;
            onCourtSurfaceChange(isCourtSurface(value) ? value : '');
          }}
          className={inputClass}
        >
          <option value="">선택 안 함</option>
          {COURT_SURFACE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="opponent_name" className={labelClass}>
            상대 이름 <span className="text-gray-400 text-sm">(선택)</span>
          </label>
          <input
            type="text"
            id="opponent_name"
            value={opponentName}
            onChange={(event) => onOpponentNameChange(event.target.value)}
            placeholder="상대 이름"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="opponent_level" className={labelClass}>
            상대 수준 <span className="text-gray-400 text-sm">(선택)</span>
          </label>
          <input
            type="text"
            id="opponent_level"
            value={opponentLevel}
            onChange={(event) => onOpponentLevelChange(event.target.value)}
            placeholder="예: 초급, NTRP 3.0"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="duration_minutes" className={labelClass}>
          경기 시간 (분) <span className="text-gray-400 text-sm">(선택)</span>
        </label>
        <input
          type="number"
          id="duration_minutes"
          value={durationMinutes}
          onChange={(event) => onDurationMinutesChange(event.target.value)}
          min="0"
          max="600"
          placeholder="분 단위 입력"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cost" className={labelClass}>
          비용 (원) <span className="text-gray-400 text-sm">(선택)</span>
        </label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(event) => onCostChange(event.target.value)}
          min="0"
          placeholder="원 단위 입력"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          메모 <span className="text-gray-400 text-sm">(선택)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          maxLength={1000}
          rows={4}
          className={cn(inputClass, 'resize-none')}
          placeholder="경기 내용이나 특이사항을 기록하세요."
          aria-describedby="notes-count"
        />
        <div
          id="notes-count"
          className={themeClass(
            'text-right text-sm mt-1 text-black/60',
            'text-right text-sm mt-1 text-gray-400'
          )}
        >
          {notes.length}/1000
        </div>
      </div>
    </>
  );
}
