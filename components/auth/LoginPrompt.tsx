'use client';

import { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginPrompt({ isOpen, onClose, message }: LoginPromptProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
  const titleId = useId();

  // Sync dialog open/close with isOpen prop + manage focus
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      const firstFocusable = dialog.querySelector<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      firstFocusable?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger) {
        requestAnimationFrame(() => {
          trigger.focus();
        });
      }
    }
  }, [isOpen]);

  // Handle Escape key — prevent native close, sync via React state
  const handleCancel = useCallback((e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  }, [onClose]);

  // Focus trap: cycle Tab / Shift+Tab within the dialog
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableEls = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
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

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent backdrop:bg-black/50"
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={themeClass('bg-white border-[3px] border-black rounded-[5px] shadow-[8px_8px_0px_0px_#000] p-6 max-w-sm mx-auto', 'bg-white rounded-xl border border-gray-200 shadow-xl p-6 max-w-sm mx-auto')}>
        <h2 id={titleId} className={`text-xl mb-3 ${themeClass('font-black text-black uppercase', 'font-semibold text-gray-900')}`}>
          {isNeoBrutalism ? '🔒 ' : ''}로그인이 필요합니다
        </h2>
        <p className={`mb-6 ${themeClass('text-black/70 font-medium', 'text-gray-500')}`}>
          {message || '이 기능을 사용하려면 로그인해주세요.'}
        </p>

        <div className="flex gap-3">
          <Link
            href={loginUrl}
            className={themeClass('flex-1 py-3 bg-[#22c55e] text-black font-black text-center border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase', 'flex-1 py-3 rounded-lg bg-green-600 text-white font-medium text-center hover:bg-green-700 transition-colors')}
          >
            로그인하기
          </Link>
          <button
            type="button"
            onClick={onClose}
            className={themeClass('flex-1 py-3 bg-white text-black font-bold border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all', 'flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors')}
          >
            나중에
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
