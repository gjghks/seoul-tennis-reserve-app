'use client';

import { useEffect, useRef, useCallback, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useThemeClass, cn } from '@/lib/cn';
import { MAP_PROVIDERS, openMapApp, isMobile, type MapDestination, type MapProvider } from '@/lib/utils/mapNavigation';

interface MapAppSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  destination: MapDestination;
}

const PROVIDER_ICONS: Record<MapProvider, { emoji: string; label: string }> = {
  tmap: { emoji: '🔴', label: 'T맵' },
  naver: { emoji: '🟢', label: '네이버 지도' },
  kakao: { emoji: '🟡', label: '카카오맵' },
};

export default function MapAppSelector({ isOpen, onClose, destination }: MapAppSelectorProps) {
  const themeClass = useThemeClass();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      const first = dialog.querySelector<HTMLElement>('button:not([disabled])');
      first?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger) {
        requestAnimationFrame(() => { trigger.focus(); });
      }
    }
  }, [isOpen]);

  const handleCancel = useCallback((e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableEls = dialog.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (focusableEls.length === 0) return;

    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback((provider: MapProvider) => {
    setLoading(true);
    openMapApp(provider, destination).finally(() => {
      setLoading(false);
      onClose();
    });
  }, [destination, onClose]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 z-50 bg-transparent',
        'backdrop:bg-black/50',
      )}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby={titleId}
    >

      <div className="fixed inset-0 flex items-end justify-center">

        <button
          type="button"
          className="absolute inset-0 cursor-default"
          onClick={onClose}
          tabIndex={-1}
          aria-hidden="true"
        />


        <div
          className={cn(
            'relative w-full max-w-lg animate-slide-up',
            themeClass(
              'bg-[#fffbeb] border-t-[3px] border-x-[3px] border-black rounded-t-[8px] shadow-[0_-4px_0px_0px_#000]',
              'bg-white rounded-t-2xl shadow-xl border-t border-x border-gray-200',
            ),
          )}
        >

          <div className="flex justify-center pt-3 pb-1">
            <div className={cn(
              'w-10 h-1 rounded-full',
              themeClass('bg-black/30', 'bg-gray-300'),
            )} />
          </div>


          <div className="flex items-center justify-between px-5 pb-3">
            <h2
              id={titleId}
              className={cn(
                'text-base',
                themeClass('font-black text-black uppercase', 'font-semibold text-gray-900'),
              )}
            >
              길찾기 앱 선택
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'w-7 h-7 flex items-center justify-center text-sm',
                themeClass(
                  'border-2 border-black bg-white hover:bg-red-100 font-black',
                  'text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100',
                ),
              )}
            >
              ✕
            </button>
          </div>


          <div className={cn(
            'mx-5 mb-3 px-3 py-2 rounded-md text-xs truncate',
            themeClass(
              'bg-black/10 font-bold text-black/70 border border-black/20',
              'bg-gray-50 text-gray-500 border border-gray-100',
            ),
          )}>
            <span className="mr-1.5">📍</span>
            {destination.name}
          </div>


          {loading ? (
            <div className="px-5 pb-5 flex flex-col items-center gap-2 py-6">
              <div className={cn(
                'w-5 h-5 border-2 border-t-transparent rounded-full animate-spin',
                themeClass('border-black', 'border-gray-400'),
              )} />
              <span className={cn(
                'text-xs',
                themeClass('font-bold text-black/60', 'text-gray-400'),
              )}>
                위치 확인 중...
              </span>
            </div>
          ) : (
            <div className="px-5 pb-5 space-y-2">
              {MAP_PROVIDERS.filter((p) => p.id !== 'tmap' || isMobile()).map((provider) => {
                const icon = PROVIDER_ICONS[provider.id];
                return (
                  <button
                    type="button"
                    key={provider.id}
                    onClick={() => handleSelect(provider.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all',
                      themeClass(
                        cn(
                          'border-2 border-black font-black rounded-[5px]',
                          'shadow-[3px_3px_0px_0px_#000]',
                          'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
                          'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
                          provider.colorNeo,
                        ),
                        cn(
                          'border rounded-xl',
                          provider.color,
                          'hover:shadow-md',
                        ),
                      ),
                    )}
                  >
                    <span className="text-lg">{icon.emoji}</span>
                    <span className="flex-1 text-left">{icon.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-50">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}


          <div className="h-safe-bottom" />
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
