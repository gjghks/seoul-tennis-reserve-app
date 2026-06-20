'use client';

import { useMemo } from 'react';
import { useSeason } from '@/contexts/SeasonalContext';

const DROP_COUNT = 7;

function generateDrops() {
  return Array.from({ length: DROP_COUNT }, (_, i) => ({
    id: i,
    left: `${(i * 14 + Math.random() * 9) % 100}%`,
    fallDelay: `${(i * 2.1 + Math.random() * 5).toFixed(1)}s`,
    fallDuration: `${(14 + Math.random() * 8).toFixed(1)}s`,
    swayDuration: `${(3 + Math.random() * 2).toFixed(1)}s`,
    width: `${9 + Math.random() * 5}px`,
    height: `${13 + Math.random() * 7}px`,
    drift: `${-24 + Math.random() * 48}px`,
    sway: `${4 + Math.random() * 6}px`,
    opacity: 0.3 + Math.random() * 0.25,
  }));
}

export default function SummerDropletOverlay() {
  const { isTennisSummer } = useSeason();
  const drops = useMemo(() => generateDrops(), []);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // reduced-motion: build zero DOM (defense-in-depth with the CSS guard).
  if (!isTennisSummer || reduceMotion) return null;

  return (
    <div className="tennis-summer-overlay" aria-hidden="true">
      {drops.map((d) => (
        <div
          key={d.id}
          className="tennis-summer-drop"
          style={{
            left: d.left,
            width: d.width,
            height: d.height,
            opacity: d.opacity,
            animationDelay: `${d.fallDelay}, 0s`,
            animationDuration: `${d.fallDuration}, ${d.swayDuration}`,
            '--summer-drift': d.drift,
            '--summer-sway': d.sway,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
