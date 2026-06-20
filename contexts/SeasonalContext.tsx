'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import {
  type Season,
  SEASON_ORDER,
  MANUAL_SEASON_KEY,
  LEGACY_SEASON_KEY,
  resolveSeason,
} from '@/lib/utils/season';

export type { Season };

interface SeasonalContextType {
  season: Season;
  isCherryBlossom: boolean;
  isTennisSpring: boolean;
  isTennisSummer: boolean;
  isTennisAutumn: boolean;
  isTennisWinter: boolean;
  isTennisSeason: boolean;
  toggleSeason: () => void;
}

const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined);

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>('default');
  // The inline <head> script (lib/utils/appearanceInitScript) already set the
  // correct data-season attribute before paint. Skip the first sync so this
  // provider doesn't briefly stomp it back to 'default' before the resolve runs.
  const syncedRef = useRef(false);

  useEffect(() => {
    localStorage.removeItem(LEGACY_SEASON_KEY);
    const resolved = resolveSeason(localStorage.getItem(MANUAL_SEASON_KEY), new Date());
    // Defer to next frame: the palette is already correct via the inline-script
    // attribute + syncedRef guard, so this only settles the React-state-driven
    // overlay/banner components (and avoids a synchronous-setState-in-effect).
    requestAnimationFrame(() => setSeason(resolved));
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
      isCherryBlossom,
      isTennisSpring,
      isTennisSummer,
      isTennisAutumn,
      isTennisWinter,
      isTennisSeason,
      toggleSeason,
    }),
    [season, isCherryBlossom, isTennisSpring, isTennisSummer, isTennisAutumn, isTennisWinter, isTennisSeason, toggleSeason]
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
