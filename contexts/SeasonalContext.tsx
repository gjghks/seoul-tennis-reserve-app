'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import {
  type Season,
  SEASON_ORDER,
  MANUAL_SEASON_KEY,
  LEGACY_SEASON_KEY,
  resolveSeason,
  detectSeasonByDate,
  isValidSeason,
} from '@/lib/utils/season';

export type { Season };

interface SeasonalContextType {
  season: Season;
  isAutoSeason: boolean; // true when no manual override (auto-detected by date)
  isCherryBlossom: boolean;
  isTennisSpring: boolean;
  isTennisSummer: boolean;
  isTennisAutumn: boolean;
  isTennisWinter: boolean;
  isTennisSeason: boolean;
  toggleSeason: () => void;            // legacy blind cycle (kept for back-compat)
  setSeasonOverride: (season: Season) => void; // explicit pick
  setSeasonAuto: () => void;           // clear override → auto-detect by date
}

const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined);

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>('default');
  const [isAutoSeason, setIsAutoSeason] = useState(true);
  // The inline <head> script already set the correct data-season attribute before
  // paint. Skip the first sync so this provider doesn't briefly stomp it.
  const syncedRef = useRef(false);

  useEffect(() => {
    localStorage.removeItem(LEGACY_SEASON_KEY);
    const manual = localStorage.getItem(MANUAL_SEASON_KEY);
    const resolved = resolveSeason(manual, new Date());
    requestAnimationFrame(() => {
      setIsAutoSeason(!isValidSeason(manual));
      setSeason(resolved);
    });
  }, []);

  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      return;
    }
    document.documentElement.setAttribute('data-season', season);
  }, [season]);

  const toggleSeason = useCallback(() => {
    setSeason(prev => {
      const idx = SEASON_ORDER.indexOf(prev);
      const next = SEASON_ORDER[(idx + 1) % SEASON_ORDER.length];
      localStorage.setItem(MANUAL_SEASON_KEY, next);
      return next;
    });
    setIsAutoSeason(false);
  }, []);

  const setSeasonOverride = useCallback((next: Season) => {
    localStorage.setItem(MANUAL_SEASON_KEY, next);
    setIsAutoSeason(false);
    setSeason(next);
  }, []);

  const setSeasonAuto = useCallback(() => {
    localStorage.removeItem(MANUAL_SEASON_KEY);
    setIsAutoSeason(true);
    setSeason(detectSeasonByDate(new Date()));
  }, []);

  const isCherryBlossom = season === 'cherry-blossom';
  const isTennisSpring = season === 'tennis-spring';
  const isTennisSummer = season === 'tennis-summer';
  const isTennisAutumn = season === 'tennis-autumn';
  const isTennisWinter = season === 'tennis-winter';
  // NOTE: isTennisSeason intentionally gates only the tennis-BALL overlay
  // (spring/autumn). Summer uses its own droplet overlay, winter uses snow.
  const isTennisSeason = isTennisSpring || isTennisAutumn;

  const value = useMemo(
    () => ({
      season,
      isAutoSeason,
      isCherryBlossom,
      isTennisSpring,
      isTennisSummer,
      isTennisAutumn,
      isTennisWinter,
      isTennisSeason,
      toggleSeason,
      setSeasonOverride,
      setSeasonAuto,
    }),
    [season, isAutoSeason, isCherryBlossom, isTennisSpring, isTennisSummer, isTennisAutumn, isTennisWinter, isTennisSeason, toggleSeason, setSeasonOverride, setSeasonAuto]
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
