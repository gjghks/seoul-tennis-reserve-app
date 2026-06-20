'use client';

import { useState, useEffect } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';
import type { Season } from '@/lib/utils/season';

const DISMISS_PREFIX = 'tennis-season-banner-dismissed:';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type BannerConfig = {
  emoji: string;
  title: string;
  sub: string;
  extra?: string; // desktop-only suffix
  neoBg: string;
  neoSub: string;
  neoHover: string;
  minBg: string;
  minSub: string;
  minHover: string;
};

// One config-driven banner replaces the per-season banner components. Only the
// active season (date-resolved or manually picked) renders; 'default' shows none.
const BANNERS: Partial<Record<Season, BannerConfig>> = {
  'cherry-blossom': {
    emoji: '🌸',
    title: '벚꽃 시즌 테마가 적용되었습니다!',
    sub: '하단 푸터/더보기에서 테마를 변경할 수 있어요',
    neoBg: 'bg-[#FFB7C5] text-black border-b-2 border-black',
    neoSub: 'text-black/60 font-bold',
    neoHover: 'hover:bg-black/10',
    minBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-900 dark:text-pink-300 border-b border-pink-200 dark:border-pink-700',
    minSub: 'text-pink-700 dark:text-pink-300',
    minHover: 'hover:bg-pink-100 dark:hover:bg-pink-900',
  },
  'tennis-spring': {
    emoji: '🎾',
    title: '코트 오픈 시즌이 시작됐어요!',
    sub: '본격 야외 테니스의 골든타임',
    extra: '하단 푸터에서 테마를 변경할 수 있어요',
    neoBg: 'bg-[#A8D49A] text-black border-b-2 border-black',
    neoSub: 'text-black/60 font-bold',
    neoHover: 'hover:bg-black/10',
    minBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-700',
    minSub: 'text-emerald-700 dark:text-emerald-300',
    minHover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900',
  },
  'tennis-summer': {
    emoji: '🌊',
    title: '폭염엔 새벽·밤 테니스',
    sub: '자외선·장마 피해 시원하게',
    extra: '하단 푸터에서 테마를 변경할 수 있어요',
    neoBg: 'bg-[#67E8F9] text-black border-b-2 border-black',
    neoSub: 'text-black/60 font-bold',
    neoHover: 'hover:bg-black/10',
    minBg: 'bg-[#ECFEFF] dark:bg-cyan-950/40 text-[#164E63] dark:text-cyan-300 border-b border-[#BAE6FD] dark:border-cyan-700',
    minSub: 'text-[#0E7490] dark:text-cyan-300',
    minHover: 'hover:bg-[#CFFAFE] dark:hover:bg-cyan-900',
  },
  'tennis-autumn': {
    emoji: '🍂🎾',
    title: '골든 코트 시즌입니다',
    sub: '가장 쾌적한 야외 테니스의 계절',
    extra: '하단 푸터에서 테마를 변경할 수 있어요',
    neoBg: 'bg-[#FCD34D] text-black border-b-2 border-black',
    neoSub: 'text-black/60 font-bold',
    neoHover: 'hover:bg-black/10',
    minBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-b border-amber-200 dark:border-amber-700',
    minSub: 'text-amber-700 dark:text-amber-300',
    minHover: 'hover:bg-amber-100 dark:hover:bg-amber-900',
  },
  'tennis-winter': {
    emoji: '❄️',
    title: '겨울 코트 시즌',
    sub: '실내·돔 코트와 한낮 플레이 추천',
    extra: '한파·이른 일몰·결빙 코트 주의',
    neoBg: 'bg-[#A8D8F0] text-black border-b-2 border-black',
    neoSub: 'text-black/60 font-bold',
    neoHover: 'hover:bg-black/10',
    minBg: 'bg-[#EFF6FF] dark:bg-sky-950/40 text-[#0C4A6E] dark:text-sky-300 border-b border-[#CFE3F2] dark:border-sky-700',
    minSub: 'text-[#0369A1] dark:text-sky-300',
    minHover: 'hover:bg-[#DCEEFB] dark:hover:bg-sky-900',
  },
};

export default function SeasonBanner() {
  const { season } = useSeason();
  const themeClass = useThemeClass();
  const [dismissed, setDismissed] = useState(true);

  const config = BANNERS[season];
  const dismissKey = config ? `${DISMISS_PREFIX}${season}` : null;

  useEffect(() => {
    if (!dismissKey) return;
    requestAnimationFrame(() => {
      const raw = localStorage.getItem(dismissKey);
      const ts = raw ? Number(raw) : Number.NaN;
      setDismissed(!Number.isNaN(ts) && Date.now() - ts < DISMISS_DURATION_MS);
    });
  }, [dismissKey]);

  if (!config || !dismissKey || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, String(Date.now()));
    setDismissed(true);
  };

  return (
    <output className={themeClass(`block relative ${config.neoBg}`, `block relative ${config.minBg}`)}>
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-base leading-none shrink-0">{config.emoji}</span>
        <p className={themeClass(
          'flex-1 min-w-0 text-sm font-black truncate',
          'flex-1 min-w-0 text-sm font-medium truncate'
        )}>
          {config.title}
          <span className={themeClass(config.neoSub, config.minSub)}>
            {' · '}{config.sub}
            {config.extra && <span className="hidden sm:inline">{' · '}{config.extra}</span>}
          </span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className={themeClass(
            `shrink-0 p-1 ${config.neoHover} rounded-[3px] transition-colors`,
            `shrink-0 p-1 ${config.minHover} rounded transition-colors`
          )}
          aria-label="시즌 배너 닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </output>
  );
}
