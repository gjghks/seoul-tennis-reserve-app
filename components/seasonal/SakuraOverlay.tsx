'use client';

import { useMemo } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';

const PETAL_COUNT = 22;

function generatePetals() {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    left: `${(i * 4.5 + Math.random() * 3) % 100}%`,
    fallDelay: `${(i * 0.7 + Math.random() * 3).toFixed(1)}s`,
    fallDuration: `${(7 + Math.random() * 5).toFixed(1)}s`,
    swayDuration: `${(3 + Math.random() * 2).toFixed(1)}s`,
    size: `${9 + Math.random() * 7}px`,
    drift: `${-30 + Math.random() * 60}px`,
    sway: `${8 + Math.random() * 14}px`,
    opacity: 0.6 + Math.random() * 0.3,
  }));
}

export default function SakuraOverlay() {
  const { isCherryBlossom } = useSeason();

  const petals = useMemo(() => generatePetals(), []);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // reduced-motion: build zero DOM (defense-in-depth with the CSS guard).
  if (!isCherryBlossom || reduceMotion) return null;

  return (
    <div className="sakura-overlay" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="sakura-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.fallDelay}, 0s`,
            animationDuration: `${p.fallDuration}, ${p.swayDuration}`,
            '--sakura-drift': p.drift,
            '--sakura-sway': p.sway,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
