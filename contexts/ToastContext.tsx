'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const PENDING_TOAST_KEY = 'seoul-tennis.pending-toast';

/**
 * Shows a toast on the next page load — for flows that end in a hard
 * navigation (e.g. 회원 탈퇴 → window.location.replace), where a toast shown
 * before navigating would be lost.
 */
export function queueToastAfterReload(message: string, type: ToastType = 'success') {
  try {
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({ message, type }));
  } catch {
    /* storage unavailable: skip the toast */
  }
}

function takePendingToast(): { message: string; type: ToastType } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_TOAST_KEY);
    const parsed = JSON.parse(raw) as { message?: unknown; type?: unknown };
    if (typeof parsed.message !== 'string') return null;
    const type: ToastType = parsed.type === 'error' || parsed.type === 'info' ? parsed.type : 'success';
    return { message: parsed.message, type };
  } catch {
    return null;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  // Read after mount (sessionStorage is client-only); deferred so the toast
  // is not set synchronously inside the effect.
  useEffect(() => {
    const timer = setTimeout(() => {
      const pending = takePendingToast();
      if (pending) showToast(pending.message, pending.type);
    }, 0);
    return () => clearTimeout(timer);
  }, [showToast]);

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
