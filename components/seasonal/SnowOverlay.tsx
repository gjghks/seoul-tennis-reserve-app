'use client';

import { useMemo } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';

const FLAKE_COUNT = 14;

function generateFlakes() {
  return Array.from({ length: FLAKE_COUNT }, (_, i) => ({
    id: i,
    left: `${(i * 7 + Math.random() * 5) % 100}%`,
    fallDelay: `${(i * 1.1 + Math.random() * 5).toFixed(1)}s`,
    fallDuration: `${(13 + Math.random() * 9).toFixed(1)}s`,
    swayDuration: `${(4 + Math.random() * 3).toFixed(1)}s`,
    size: `${5 + Math.random() * 6}px`,
    drift: `${-26 + Math.random() * 52}px`,
    sway: `${6 + Math.random() * 10}px`,
    opacity: 0.55 + Math.random() * 0.35,
  }));
}

export default function SnowOverlay() {
  const { isTennisWinter } = useSeason();
  const flakes = useMemo(() => generateFlakes(), []);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // reduced-motion: build zero DOM (defense-in-depth with the CSS guard).
  if (!isTennisWinter || reduceMotion) return null;

  return (
    <div className="snow-overlay" aria-hidden="true">
      {flakes.map((f) => (
        <div
          key={f.id}
          className="snow-flake"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDelay: `${f.fallDelay}, 0s`,
            animationDuration: `${f.fallDuration}, ${f.swayDuration}`,
            '--snow-drift': f.drift,
            '--snow-sway': f.sway,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
