'use client';

import { useState, useRef, useEffect } from 'react';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function useCountUp(
  target: number,
  enabled: boolean,
  duration = 800
): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (!enabled || target === 0) {
      rafRef.current = requestAnimationFrame(() => {
        setValue(enabled ? target : 0);
      });
      return () => cancelAnimationFrame(rafRef.current);
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutCubic(progress) * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, duration]);

  return value;
}
