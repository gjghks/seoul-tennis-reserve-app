'use client';

import { useState, useCallback } from 'react';
import { useThemeClass } from '@/lib/cn';
import { usePWAInstall } from '@/contexts/PWAInstallContext';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7일

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    if (Date.now() - Number(raw) < DISMISS_DURATION_MS) return true;
    localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const themeClass = useThemeClass();
  const { ready, isInstalled, canInstallNatively, isIOSSafari, requestInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isDismissed();
  });

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* noop */ }
    setDismissed(true);
  }, []);

  // Only surface the banner when we can actually help: a native prompt is ready,
  // or the user is on iOS Safari (where we show the manual add-to-home-screen guide).
  // A persistent entry point also lives in the "더보기" menu for every other case.
  if (!ready || isInstalled || dismissed) return null;
  if (!canInstallNatively && !isIOSSafari) return null;

  return (
    <div className={`${themeClass(
      'bg-[#dbeafe] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-4',
      'bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40 shadow-sm'
    )}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">📲</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900 dark:text-slate-100')}`}>
            홈 화면에 추가
          </h3>
          <p className={`text-sm mb-3 ${themeClass('text-black/70', 'text-gray-600 dark:text-slate-300')}`}>
            홈 화면에 추가하면 앱처럼 빠르게 접근할 수 있어요.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestInstall}
              className={themeClass(
                'bg-black text-white font-bold px-4 py-1.5 text-sm rounded-[5px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
                'bg-blue-500 text-white px-4 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors'
              )}
            >
              {canInstallNatively ? '설치하기' : '설치 방법 보기'}
            </button>
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
