'use client';

import { useThemeClass } from '@/lib/cn';
import { MATCH_TYPE_OPTIONS } from '@/lib/constants/tennis';
import type { MatchType } from '@/lib/constants/tennis';

interface MatchTypeSelectProps {
  value: MatchType;
  onChange: (value: MatchType) => void;
}

export default function MatchTypeSelect({ value, onChange }: MatchTypeSelectProps) {
  const themeClass = useThemeClass();

  return (
    <div className="flex flex-wrap gap-2">
      {MATCH_TYPE_OPTIONS.map(option => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={isSelected
              ? themeClass(
                  'px-4 py-2 border-2 border-black rounded-[5px] font-bold bg-[#88aaee] shadow-[2px_2px_0px_0px_#000] text-black',
                  'px-4 py-2 rounded-lg font-medium bg-green-600 text-white'
                )
              : themeClass(
                  'px-4 py-2 border-2 border-black rounded-[5px] font-bold bg-white dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700',
                  'px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                )
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
