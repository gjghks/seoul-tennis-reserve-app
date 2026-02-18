'use client';

import { useThemeClass, cn } from '@/lib/cn';
import type { MatchScore, SetScore } from '@/lib/constants/tennis';
import { useCallback, useId } from 'react';

interface ScoreInputProps {
  score: MatchScore;
  onChange: (score: MatchScore) => void;
}

export default function ScoreInput({ score, onChange }: ScoreInputProps) {
  const themeClass = useThemeClass();
  const id = useId();

  const handleSetChange = useCallback((setIdx: number, field: keyof SetScore, value: number | undefined) => {
    const newSets = [...score.sets];
    if (field === 'tb') {
      if (value === undefined) {
        const { tb: _tb, ...rest } = newSets[setIdx];
        newSets[setIdx] = rest;
      } else {
        newSets[setIdx] = { ...newSets[setIdx], tb: { my: 0, opp: 0 } };
      }
    } else {
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
    }
    onChange({ ...score, sets: newSets });
  }, [score, onChange]);

  const handleTbChange = useCallback((setIdx: number, field: 'my' | 'opp', value: number) => {
    const newSets = [...score.sets];
    if (newSets[setIdx].tb) {
      newSets[setIdx] = {
        ...newSets[setIdx],
        tb: { ...newSets[setIdx].tb!, [field]: value }
      };
      onChange({ ...score, sets: newSets });
    }
  }, [score, onChange]);

  const addSet = useCallback(() => {
    if (score.sets.length < 5) {
      onChange({
        ...score,
        sets: [...score.sets, { my: 0, opp: 0 }]
      });
    }
  }, [score, onChange]);

  const removeSet = useCallback((setIdx: number) => {
    if (score.sets.length > 1) {
      const newSets = score.sets.filter((_, i) => i !== setIdx);
      onChange({ ...score, sets: newSets });
    }
  }, [score, onChange]);

  return (
    <div className="w-full space-y-4">
      {score.sets.map((set, setIndex) => {
        const myId = `${id}-${setIndex}-my`;
        const oppId = `${id}-${setIndex}-opp`;
        const tbId = `${id}-${setIndex}-tb`;

        return (
          <div
            key={myId}
            className={cn(
              "relative p-4 transition-all",
              themeClass(
                "bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]",
                "bg-white border border-gray-200 rounded-lg shadow-sm"
              )
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "text-sm",
                themeClass("font-bold text-black", "font-medium text-gray-500")
              )}>
                SET {setIndex + 1}
              </span>
              {score.sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(setIndex)}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                    themeClass(
                      "bg-black text-white hover:bg-red-600",
                      "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600"
                    )
                  )}
                  aria-label={`${setIndex + 1}세트 삭제`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex flex-col items-center gap-1">
                <label htmlFor={myId} className={cn("text-xs", themeClass("font-bold", "text-gray-500"))}>나</label>
                <input
                  id={myId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={set.my}
                  onChange={(e) => handleSetChange(setIndex, 'my', parseInt(e.target.value) || 0)}
                  className={cn(
                    "w-16 text-center text-lg transition-colors",
                    themeClass(
                      "border-2 border-black rounded-[5px] p-2 font-bold focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2",
                      "border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    )
                  )}
                />
              </div>
              <span className={cn("text-xl mt-5", themeClass("font-black", "font-medium text-gray-400"))} aria-hidden="true">-</span>
              <div className="flex flex-col items-center gap-1">
                <label htmlFor={oppId} className={cn("text-xs", themeClass("font-bold", "text-gray-500"))}>상대</label>
                <input
                  id={oppId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={set.opp}
                  onChange={(e) => handleSetChange(setIndex, 'opp', parseInt(e.target.value) || 0)}
                  className={cn(
                    "w-16 text-center text-lg transition-colors",
                    themeClass(
                      "border-2 border-black rounded-[5px] p-2 font-bold focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2",
                      "border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    )
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <label htmlFor={tbId} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id={tbId}
                  type="checkbox"
                  checked={!!set.tb}
                  onChange={(e) => handleSetChange(setIndex, 'tb', e.target.checked ? 0 : undefined)}
                  className={cn(
                    "w-4 h-4 rounded transition-colors",
                    themeClass(
                      "border-2 border-black text-black focus:ring-0 checked:bg-black",
                      "border-gray-300 text-green-600 focus:ring-green-500 rounded"
                    )
                  )}
                />
                <span className={cn("text-sm", themeClass("font-bold", "text-gray-600"))}>타이브레이크</span>
              </label>
            </div>

            {set.tb && (
              <div className={cn(
                "mt-3 pt-3 border-t flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2",
                themeClass("border-black/10", "border-gray-100")
              )}>
                <div className="flex items-center gap-2">
                  <label htmlFor={`${tbId}-my`} className={cn("text-xs", themeClass("font-bold text-black/60", "text-gray-400"))}>TB</label>
                  <input
                    id={`${tbId}-my`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={set.tb.my}
                    onChange={(e) => handleTbChange(setIndex, 'my', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-12 text-center text-sm transition-colors",
                      themeClass(
                        "border-2 border-black rounded-[5px] p-1 font-bold focus:outline-none focus:ring-2 focus:ring-[#22c55e]",
                        "border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      )
                    )}
                    placeholder="0"
                  />
                  <span className={themeClass("font-bold text-black/40", "text-gray-300")} aria-hidden="true">:</span>
                  <label htmlFor={`${tbId}-opp`} className="sr-only">상대 타이브레이크</label>
                  <input
                    id={`${tbId}-opp`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={set.tb.opp}
                    onChange={(e) => handleTbChange(setIndex, 'opp', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-12 text-center text-sm transition-colors",
                      themeClass(
                        "border-2 border-black rounded-[5px] p-1 font-bold focus:outline-none focus:ring-2 focus:ring-[#22c55e]",
                        "border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                      )
                    )}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {score.sets.length < 5 && (
        <button
          type="button"
          onClick={addSet}
          className={cn(
            "w-full py-3 flex items-center justify-center gap-2 transition-all",
            themeClass(
              "bg-[#fffbeb] border-2 border-black rounded-[5px] font-bold hover:bg-[#fef3c7] active:translate-y-[2px]",
              "bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            )
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          세트 추가
        </button>
      )}
    </div>
  );
}
