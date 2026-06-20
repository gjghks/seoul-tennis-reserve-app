'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeClass } from '@/lib/cn';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return true;
    localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch { /* noop */ }
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
}

export default function InstallPrompt() {
  const themeClass = useThemeClass();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isStandalone() && !isDismissed() && isIOSSafari();
  });
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !isStandalone() && !isDismissed() && isIOSSafari();
  });

  useEffect(() => {
    if (showIOSGuide) return;
    if (isStandalone() || isDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [showIOSGuide]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    dismiss();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className={`${themeClass(
      'bg-[#dbeafe] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-4',
      'bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40 shadow-sm'
    )}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">📲</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900 dark:text-slate-100')}`}>
            홈 화면에 추가
          </h3>

          {showIOSGuide ? (
            <p className={`text-sm mb-3 ${themeClass('text-black/70', 'text-gray-600 dark:text-slate-300')}`}>
              Safari 하단의{' '}
              <span className="inline-flex items-center align-middle mx-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </span>
              {' '}공유 버튼을 누른 뒤 <strong>&quot;홈 화면에 추가&quot;</strong>를 선택하면 앱처럼 사용할 수 있어요.
            </p>
          ) : (
            <p className={`text-sm mb-3 ${themeClass('text-black/70', 'text-gray-600 dark:text-slate-300')}`}>
              홈 화면에 추가하면 앱처럼 빠르게 접근할 수 있어요.
            </p>
          )}

          <div className="flex items-center gap-2">
            {!showIOSGuide && (
              <button
                type="button"
                onClick={handleInstall}
                className={themeClass(
                  'bg-black text-white font-bold px-4 py-1.5 text-sm rounded-[5px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
                  'bg-blue-500 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors'
                )}
              >
                설치하기
              </button>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className={`text-sm ${themeClass(
                'text-black/60 font-bold hover:text-black/80',
                'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              )} transition-colors`}
            >
              다음에
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
