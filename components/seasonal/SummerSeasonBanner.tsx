'use client';

import { useState, useEffect } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';

const DISMISS_KEY = 'tennis-season-banner-dismissed:summer';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return !Number.isNaN(ts) && Date.now() - ts < DISMISS_DURATION_MS;
}

export default function SummerSeasonBanner() {
  const { isTennisSummer } = useSeason();
  const themeClass = useThemeClass();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => setDismissed(isDismissed()));
  }, []);

  if (!isTennisSummer || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <output
      className={themeClass(
        'block relative bg-[#67E8F9] text-black border-b-2 border-black',
        'block relative bg-[#ECFEFF] text-[#164E63] border-b border-[#BAE6FD]'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-base leading-none shrink-0">🌊</span>
        <p className={themeClass(
          'flex-1 min-w-0 text-sm font-black truncate',
          'flex-1 min-w-0 text-sm font-medium truncate'
        )}>
          폭염엔 새벽·밤 테니스
          <span className={themeClass('text-black/60 font-bold', 'text-[#0E7490]')}>
            {' · '}자외선·장마 피해 시원하게
            <span className="hidden sm:inline">{' · 하단 푸터에서 테마를 변경할 수 있어요'}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className={themeClass(
            'shrink-0 p-1 hover:bg-black/10 rounded-[3px] transition-colors',
            'shrink-0 p-1 hover:bg-[#CFFAFE] rounded transition-colors'
          )}
          aria-label="여름 시즌 배너 닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </output>
  );
}
