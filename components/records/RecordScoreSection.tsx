'use client';

import { cn, useThemeClass } from '@/lib/cn';
import type { MatchResult, MatchScore } from '@/lib/constants/tennis';
import { MATCH_RESULT_OPTIONS } from '@/lib/constants/tennis';
import ScoreInput from '@/components/records/ScoreInput';

interface RecordScoreSectionProps {
  labelClass: string;
  score: MatchScore;
  onScoreChange: (score: MatchScore) => void;
  result: MatchResult | null;
  isAutoInferred: boolean;
  onResultChange: (result: MatchResult) => void;
}

export default function RecordScoreSection({
  labelClass,
  score,
  onScoreChange,
  result,
  isAutoInferred,
  onResultChange,
}: RecordScoreSectionProps) {
  const themeClass = useThemeClass();

  return (
    <>
      <div>
        <span className={labelClass}>스코어</span>
        <ScoreInput score={score} onChange={onScoreChange} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={themeClass('font-bold text-black dark:text-slate-100 text-lg', 'font-medium text-gray-700 dark:text-slate-200 text-sm')}>
            경기 결과
          </span>
          {isAutoInferred && (
            <span
              className={themeClass(
                'text-xs px-2 py-0.5 bg-[#facc15] border border-black rounded-[3px] font-bold',
                'text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 rounded-full font-medium'
              )}
            >
              스코어에서 자동 추론됨
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MATCH_RESULT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onResultChange(option.value)}
              className={cn(
                'flex-1 px-3 py-3 text-sm transition-all',
                themeClass(
                  `border-2 border-black rounded-[5px] font-bold ${
                    result === option.value
                      ? 'bg-[#a3e635] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[1px] translate-y-[1px]'
                      : 'bg-white dark:bg-slate-800 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'
                  }`,
                  `rounded-lg border ${
                    result === option.value
                      ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 font-medium'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`
                )
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
