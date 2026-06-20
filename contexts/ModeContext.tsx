'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import { type Mode, MODE_KEY, DEFAULT_MODE, isValidMode, resolveDark } from '@/lib/utils/appearanceMode';

export type { Mode };

interface ModeContextType {
  mode: Mode;            // user preference: light | dark | system
  resolvedDark: boolean; // concrete dark on/off after resolving 'system'
  setMode: (m: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

function applyMode(dark: boolean, mode: Mode) {
  const el = document.documentElement;
  el.classList.toggle('dark', dark);
  el.setAttribute('data-mode', mode);
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(DEFAULT_MODE);
  const [resolvedDark, setResolvedDark] = useState(false);
  // The inline <head> script already applied the class pre-paint; skip the first
  // sync so this provider doesn't stomp it before hydration resolves the value.
  const syncedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(MODE_KEY);
    const initial = isValidMode(stored) ? stored : DEFAULT_MODE;
    // Defer state to next frame: the inline script already applied the .dark class
    // pre-paint, so this only settles React state (and avoids sync-setState-in-effect).
    requestAnimationFrame(() => {
      setModeState(initial);
      setResolvedDark(resolveDark(initial));
    });
  }, []);

  // Follow OS changes while on 'system'.
  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setResolvedDark(mq.matches);
      applyMode(mq.matches, 'system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  useEffect(() => {
    if (!syncedRef.current) {
      syncedRef.current = true;
      return;
    }
    const dark = resolveDark(mode);
    applyMode(dark, mode);
    requestAnimationFrame(() => setResolvedDark(dark));
  }, [mode]);

  const setMode = useCallback((m: Mode) => {
    localStorage.setItem(MODE_KEY, m);
    setModeState(m);
  }, []);

  const value = useMemo(() => ({ mode, resolvedDark, setMode }), [mode, resolvedDark, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
