'use client';

import { useState, useEffect } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';

const DISMISS_PREFIX = 'tennis-season-banner-dismissed:';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  const ts = Number(raw);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < DISMISS_DURATION_MS;
}

export default function TennisSeasonBanner() {
  const { isTennisSpring, isTennisAutumn } = useSeason();
  const themeClass = useThemeClass();
  const [dismissed, setDismissed] = useState(true);

  const seasonKey = isTennisSpring ? 'spring' : isTennisAutumn ? 'autumn' : null;
  const dismissKey = seasonKey ? `${DISMISS_PREFIX}${seasonKey}` : null;

  useEffect(() => {
    if (!dismissKey) return;
    requestAnimationFrame(() => setDismissed(isDismissed(dismissKey)));
  }, [dismissKey]);

  if (!seasonKey || dismissed) return null;

  const handleDismiss = () => {
    if (!dismissKey) return;
    localStorage.setItem(dismissKey, String(Date.now()));
    setDismissed(true);
  };

  const config = isTennisSpring
    ? {
        emoji: '🎾',
        title: '코트 오픈 시즌이 시작됐어요!',
        sub: '본격 야외 테니스의 골든타임',
        bgNeo: 'bg-[#A8D49A] text-black border-b-2 border-black',
        bgMin: 'bg-emerald-50 text-emerald-900 border-b border-emerald-200',
        subNeo: 'text-black/60 font-bold',
        subMin: 'text-emerald-700',
        hoverNeo: 'hover:bg-black/10',
        hoverMin: 'hover:bg-emerald-100',
      }
    : {
        emoji: '🍂🎾',
        title: '골든 코트 시즌입니다',
        sub: '가장 쾌적한 야외 테니스의 계절',
        bgNeo: 'bg-[#FCD34D] text-black border-b-2 border-black',
        bgMin: 'bg-amber-50 text-amber-900 border-b border-amber-200',
        subNeo: 'text-black/60 font-bold',
        subMin: 'text-amber-700',
        hoverNeo: 'hover:bg-black/10',
        hoverMin: 'hover:bg-amber-100',
      };

  return (
    <output
      className={themeClass(
        `block relative ${config.bgNeo}`,
        `block relative ${config.bgMin}`
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-base leading-none shrink-0">{config.emoji}</span>
        <p className={themeClass(
          'flex-1 min-w-0 text-sm font-black truncate',
          'flex-1 min-w-0 text-sm font-medium truncate'
        )}>
          {config.title}
          <span className={themeClass(config.subNeo, config.subMin)}>
            {' · '}{config.sub}
            <span className="hidden sm:inline">{' · 하단 푸터에서 테마를 변경할 수 있어요'}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className={themeClass(
            `shrink-0 p-1 ${config.hoverNeo} rounded-[3px] transition-colors`,
            `shrink-0 p-1 ${config.hoverMin} rounded transition-colors`
          )}
          aria-label="테니스 시즌 배너 닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </output>
  );
}
