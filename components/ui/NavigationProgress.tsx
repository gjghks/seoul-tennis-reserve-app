'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

type ProgressState = 'idle' | 'loading' | 'complete';

export default function NavigationProgress() {
  const pathname = usePathname();
  const { isNeoBrutalism } = useTheme();
  const [state, setState] = useState<ProgressState>('idle');
  const [width, setWidth] = useState(0);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const trickleRef = useRef<ReturnType<typeof setInterval>>(null);
  const completedAtRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);
  }, []);

  const start = useCallback(() => {
    if (Date.now() - completedAtRef.current < 500) return;

    cleanup();
    setState('loading');
    setWidth(15);

    trickleRef.current = setInterval(() => {
      setWidth(prev => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 8 : prev < 60 ? 4 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 300);
  }, [cleanup]);

  const complete = useCallback(() => {
    cleanup();
    completedAtRef.current = Date.now();
    setState('complete');
    setWidth(100);

    timerRef.current = setTimeout(() => {
      setState('idle');
      setWidth(0);
    }, 300);
  }, [cleanup]);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      complete();
      window.scrollTo(0, 0);
    }
  }, [pathname, complete]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (anchor.target === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      if (href !== pathname) {
        start();
      }
    };

    const originalPushState = history.pushState.bind(history);
    history.pushState = function pushStateIntercepted(...args: Parameters<typeof history.pushState>) {
      const url = args[2];
      if (url && String(url) !== pathname) {
        setTimeout(start, 0);
      }
      return originalPushState(...args);
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      history.pushState = originalPushState;
    };
  }, [pathname, start]);

  useEffect(() => () => cleanup(), [cleanup]);

  if (state === 'idle') return null;

  const bgColor = isNeoBrutalism ? '#000' : '#22c55e';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          backgroundColor: bgColor,
          transition: state === 'complete'
            ? 'width 200ms ease-out, opacity 200ms ease 150ms'
            : 'width 300ms ease',
          opacity: state === 'complete' ? 0 : 1,
          boxShadow: `0 0 8px ${bgColor}40`,
        }}
      />
    </div>
  );
}
