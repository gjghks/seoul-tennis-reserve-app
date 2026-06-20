'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeClass } from '@/lib/cn';

interface LastUpdatedProps {
  timestamp: string | undefined;
  /** When true, the data is a stale fallback (e.g. Seoul API down) — show an honest delay notice. */
  stale?: boolean;
  className?: string;
}

export default function LastUpdated({ timestamp, stale = false, className = '' }: LastUpdatedProps) {
  const themeClass = useThemeClass();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timestamp) return;
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [timestamp]);

  const formatRelativeTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const formatExactTime = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  if (!timestamp) return null;

  // Stale fallback: be honest instead of stamping "방금 전" on hours-old data.
  if (stale) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white dark:bg-amber-600 ${className}`}
        title={`마지막 정상 데이터: ${formatExactTime(timestamp)} (${formatRelativeTime(timestamp)})`}
      >
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>데이터 지연 · 서울시 API 점검 중</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${themeClass('text-black/60 dark:text-slate-400 font-medium', 'text-gray-400 dark:text-slate-500')} ${className}`}
      title={formatExactTime(timestamp)}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>업데이트: {formatRelativeTime(timestamp)}</span>
    </div>
  );
}
