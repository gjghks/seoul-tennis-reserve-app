'use client';

import { useState, useEffect } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';

const DISMISS_KEY = 'tennis-season-banner-dismissed:winter';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return !Number.isNaN(ts) && Date.now() - ts < DISMISS_DURATION_MS;
}

export default function WinterSeasonBanner() {
  const { isTennisWinter } = useSeason();
  const themeClass = useThemeClass();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => setDismissed(isDismissed()));
  }, []);

  if (!isTennisWinter || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  return (
    <output
      className={themeClass(
        'block relative bg-[#A8D8F0] text-black border-b-2 border-black',
        'block relative bg-[#EFF6FF] text-[#0C4A6E] border-b border-[#CFE3F2]'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-base leading-none shrink-0">❄️</span>
        <p className={themeClass(
          'flex-1 min-w-0 text-sm font-black truncate',
          'flex-1 min-w-0 text-sm font-medium truncate'
        )}>
          겨울 코트 시즌
          {/* neo subtext black/60 on #A8D8F0 composites to ~5.0:1 (AA pass); matches other banners */}
          <span className={themeClass('text-black/60 font-bold', 'text-[#0369A1]')}>
            {' · '}실내·돔 코트와 한낮 플레이 추천
            <span className="hidden sm:inline">{' · 한파·이른 일몰·결빙 코트 주의'}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className={themeClass(
            'shrink-0 p-1 hover:bg-black/10 rounded-[3px] transition-colors',
            'shrink-0 p-1 hover:bg-[#DCEEFB] rounded transition-colors'
          )}
          aria-label="겨울 시즌 배너 닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </output>
  );
}
