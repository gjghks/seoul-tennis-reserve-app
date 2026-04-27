'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';

export type Season = 'default' | 'cherry-blossom' | 'tennis-spring' | 'tennis-autumn';

interface SeasonalContextType {
  season: Season;
  isCherryBlossom: boolean;
  isTennisSpring: boolean;
  isTennisAutumn: boolean;
  isTennisSeason: boolean;
  toggleSeason: () => void;
}

const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined);

const MANUAL_KEY = 'tennis-season-manual';
const LEGACY_KEY = 'tennis-season';

const SEASON_ORDER: Season[] = ['default', 'cherry-blossom', 'tennis-spring', 'tennis-autumn'];

// 벚꽃: 3/15~4/20 (개화 전 분위기 조성 포함)
function isCherryBlossomWindow(): boolean {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return (m === 3 && d >= 15) || (m === 4 && d <= 20);
}

// 봄 골든 윈도우: 4/21~6/15 (황사 끝, 장마 전, 프렌치 오픈/KTA 춘계대회)
function isTennisSpringWindow(): boolean {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return (m === 4 && d >= 21) || m === 5 || (m === 6 && d <= 15);
}

// 가을 골든 윈도우: 9/1~10/31 (US 오픈/KTA 추계대회)
function isTennisAutumnWindow(): boolean {
  const now = new Date();
  const m = now.getMonth() + 1;
  return m === 9 || m === 10;
}

function isValidSeason(value: string | null): value is Season {
  return value === 'default' || value === 'cherry-blossom' || value === 'tennis-spring' || value === 'tennis-autumn';
}

function detectSeason(): Season {
  const manual = typeof window !== 'undefined' ? localStorage.getItem(MANUAL_KEY) : null;
  if (isValidSeason(manual)) return manual;
  if (isCherryBlossomWindow()) return 'cherry-blossom';
  if (isTennisSpringWindow()) return 'tennis-spring';
  if (isTennisAutumnWindow()) return 'tennis-autumn';
  return 'default';
}

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>('default');

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY);
    const resolved = detectSeason();
    requestAnimationFrame(() => setSeason(resolved));
    document.documentElement.setAttribute('data-season', resolved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
  }, [season]);

  const toggleSeason = useCallback(() => {
    setSeason(prev => {
      const idx = SEASON_ORDER.indexOf(prev);
      const next = SEASON_ORDER[(idx + 1) % SEASON_ORDER.length];
      localStorage.setItem(MANUAL_KEY, next);
      return next;
    });
  }, []);

  const isCherryBlossom = season === 'cherry-blossom';
  const isTennisSpring = season === 'tennis-spring';
  const isTennisAutumn = season === 'tennis-autumn';
  const isTennisSeason = isTennisSpring || isTennisAutumn;

  const value = useMemo(
    () => ({ season, isCherryBlossom, isTennisSpring, isTennisAutumn, isTennisSeason, toggleSeason }),
    [season, isCherryBlossom, isTennisSpring, isTennisAutumn, isTennisSeason, toggleSeason]
  );

  return (
    <SeasonalContext.Provider value={value}>
      {children}
    </SeasonalContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonalContext);
  if (context === undefined) {
    throw new Error('useSeason must be used within a SeasonalProvider');
  }
  return context;
}
