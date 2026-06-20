'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeClass } from '@/lib/cn';

export default function UpdatePrompt() {
  const themeClass = useThemeClass();
  const [showUpdate, setShowUpdate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    // Only show update notification if a SW was already controlling this page.
    // On first-ever visit there's no controller, so controllerchange would be
    // the initial claim — not an update.
    const hadController = !!navigator.serviceWorker.controller;

    const handleControllerChange = () => {
      if (hadController) {
        setShowUpdate(true);
        requestAnimationFrame(() => setIsVisible(true));
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (!isVisible) {
      setShowUpdate(false);
    }
  }, [isVisible]);

  if (!showUpdate) return null;

  return (
    <div
      className={`
        fixed bottom-20 sm:bottom-6 left-4 right-4 z-50
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      onTransitionEnd={handleTransitionEnd}
      role="alert"
      aria-live="polite"
    >
      <div className={`max-w-lg mx-auto ${themeClass(
        'bg-[#d1fae5] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-3',
        'bg-green-50 dark:bg-green-950/40 rounded-xl p-3 border border-green-200 dark:border-green-900/40 shadow-lg'
      )}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0" aria-hidden="true">🎾</span>
          <p className={`flex-1 min-w-0 text-sm ${themeClass('text-black font-bold', 'text-gray-800 dark:text-slate-200')}`}>
            새 버전이 적용되었어요!
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReload}
              className={themeClass(
                'bg-black text-white font-bold px-3 py-1.5 text-xs rounded-[5px] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
                'bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg font-medium hover:bg-green-700 transition-colors'
              )}
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="닫기"
              className={`p-1 ${themeClass(
                'text-black/40 hover:text-black/70',
                'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
              )} transition-colors`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
