'use client';

import { useMemo } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';

const BALL_COUNT = 9;

function generateBalls() {
  return Array.from({ length: BALL_COUNT }, (_, i) => ({
    id: i,
    left: `${(i * 11 + Math.random() * 8) % 100}%`,
    fallDelay: `${(i * 1.6 + Math.random() * 4).toFixed(1)}s`,
    fallDuration: `${(11 + Math.random() * 7).toFixed(1)}s`,
    swayDuration: `${(2.4 + Math.random() * 1.6).toFixed(1)}s`,
    size: `${10 + Math.random() * 6}px`,
    drift: `${-40 + Math.random() * 80}px`,
    sway: `${4 + Math.random() * 8}px`,
    opacity: 0.55 + Math.random() * 0.3,
  }));
}

export default function TennisBallOverlay() {
  const { isTennisSeason } = useSeason();
  const balls = useMemo(() => generateBalls(), []);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // reduced-motion: build zero DOM (defense-in-depth with the CSS guard).
  if (!isTennisSeason || reduceMotion) return null;

  return (
    <div className="tennis-overlay" aria-hidden="true">
      {balls.map((b) => (
        <div
          key={b.id}
          className="tennis-ball"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            animationDelay: `${b.fallDelay}, 0s`,
            animationDuration: `${b.fallDuration}, ${b.swayDuration}`,
            '--tennis-drift': b.drift,
            '--tennis-sway': b.sway,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
