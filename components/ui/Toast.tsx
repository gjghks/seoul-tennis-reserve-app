'use client';

import { useEffect, useState } from 'react';
import { useToast, ToastType } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';

const icons: Record<ToastType, string> = {
  success: '💚',
  error: '❌',
  info: 'ℹ️',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();
  const { isNeoBrutalism } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          isNeoBrutalism={isNeoBrutalism}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
  isNeoBrutalism: boolean;
  onRemove: (id: string) => void;
}

function ToastItem({ id, message, type, isNeoBrutalism, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 2500);

    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(leaveTimer);
    };
  }, []);

  const handleAnimationEnd = () => {
    if (isLeaving) {
      onRemove(id);
    }
  };

  const baseClasses = isNeoBrutalism
    ? 'bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f1f3f8] px-4 py-3 font-bold text-black dark:text-slate-100'
    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 text-gray-800 dark:text-slate-200';

  const typeClasses = isNeoBrutalism
    ? {
        success: 'border-[#16a34a] shadow-[3px_3px_0px_0px_#16a34a]',
        error: 'border-red-500 shadow-[3px_3px_0px_0px_#ef4444]',
        info: 'border-[#88aaee] shadow-[3px_3px_0px_0px_#88aaee]',
      }
    : {
        success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40',
        error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40',
        info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40',
      };

  return (
    <div
      className={`
        ${baseClasses}
        ${typeClasses[type]}
        flex items-center gap-2 pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      onTransitionEnd={handleAnimationEnd}
      role="alert"
      aria-live="polite"
    >
      <span className="text-base" aria-hidden="true">{icons[type]}</span>
      <span className="text-sm">{message}</span>
    </div>
  );
}
