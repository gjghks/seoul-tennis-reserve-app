'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';

type Season = 'default' | 'cherry-blossom';

interface SeasonalContextType {
  season: Season;
  isCherryBlossom: boolean;
  toggleSeason: () => void;
}

const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined);

const MANUAL_KEY = 'tennis-season-manual';
const LEGACY_KEY = 'tennis-season';

// 벚꽃 시즌: 3/15~4/20 (개화 전 분위기 조성 포함)
function isCherryBlossomSeason(): boolean {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return (m === 3 && d >= 15) || (m === 4 && d <= 20);
}

function detectSeason(): Season {
  const manual = typeof window !== 'undefined' ? localStorage.getItem(MANUAL_KEY) : null;
  if (manual === 'cherry-blossom' || manual === 'default') return manual;
  return isCherryBlossomSeason() ? 'cherry-blossom' : 'default';
}

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>('default');

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY);
    const resolved = detectSeason();
    setSeason(resolved);
    document.documentElement.setAttribute('data-season', resolved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-season', season);
  }, [season]);

  const toggleSeason = useCallback(() => {
    setSeason(prev => {
      const next: Season = prev === 'default' ? 'cherry-blossom' : 'default';
      localStorage.setItem(MANUAL_KEY, next);
      return next;
    });
  }, []);

  const isCherryBlossom = season === 'cherry-blossom';
  const value = useMemo(() => ({ season, isCherryBlossom, toggleSeason }), [season, isCherryBlossom, toggleSeason]);

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
