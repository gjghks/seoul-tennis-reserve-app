'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import InstallInstructionsModal from '@/components/pwa/InstallInstructionsModal';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PWAPlatform = 'ios' | 'android' | 'desktop' | 'other';

interface PWAInstallState {
  /** true after the client mount effect runs — gate all install UI on this to avoid SSR/hydration flash */
  ready: boolean;
  /** app is running installed (standalone display-mode or iOS home-screen) */
  isInstalled: boolean;
  /** a native `beforeinstallprompt` was captured and can be fired */
  canInstallNatively: boolean;
  platform: PWAPlatform;
  isIOSSafari: boolean;
  /**
   * Single entry point for any "install" affordance: fires the native prompt when
   * available, otherwise opens the platform-aware instructions modal.
   */
  requestInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallState | null>(null);

function detectPlatform(): PWAPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  // treat non-touch / large screens as desktop
  if (!/Mobi/.test(ua)) return 'desktop';
  return 'other';
}

function detectIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua);
  return isIOS && isSafari;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  // Static per-session detections — safe to compute lazily because they never appear
  // in the initial (pre-mount) render output, so they can't cause a hydration mismatch.
  const [platform] = useState<PWAPlatform>(detectPlatform);
  const [isIOSSafari] = useState(detectIOSSafari);
  // `ready` + `isInstalled` DO gate visible install UI, so they must start at the SSR
  // defaults (false) and only flip after mount to stay hydration-safe.
  const [mount, setMount] = useState<{ ready: boolean; isInstalled: boolean }>({ ready: false, isInstalled: false });

  useEffect(() => {
    // One-time client-only mount detection (see note above); an effect is required so the
    // server HTML (ready:false) matches the first client render before we reveal install UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMount({ ready: true, isInstalled: detectStandalone() });

    const onBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome's mini-infobar so we can trigger install on our own affordance.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setMount((m) => ({ ...m, isInstalled: true }));
      setDeferred(null);
      setInstructionsOpen(false);
    };
    const displayModeMq = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => setMount((m) => ({ ...m, isInstalled: detectStandalone() }));

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    displayModeMq.addEventListener?.('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      displayModeMq.removeEventListener?.('change', onDisplayModeChange);
    };
  }, []);

  const { ready, isInstalled } = mount;

  const requestInstall = useCallback(async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        setDeferred(null);
        if (outcome === 'accepted') setMount((m) => ({ ...m, isInstalled: true }));
        return;
      } catch {
        // fall through to manual instructions if the native prompt fails
        setDeferred(null);
      }
    }
    setInstructionsOpen(true);
  }, [deferred]);

  return (
    <PWAInstallContext.Provider
      value={{
        ready,
        isInstalled,
        canInstallNatively: !!deferred,
        platform,
        isIOSSafari,
        requestInstall,
      }}
    >
      {children}
      <InstallInstructionsModal
        open={instructionsOpen}
        platform={platform}
        isIOSSafari={isIOSSafari}
        onClose={() => setInstructionsOpen(false)}
      />
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall(): PWAInstallState {
  const ctx = useContext(PWAInstallContext);
  if (!ctx) throw new Error('usePWAInstall must be used within PWAInstallProvider');
  return ctx;
}
