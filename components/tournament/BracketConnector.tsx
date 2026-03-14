'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BracketConnectorProps {
  fromPosition: Rect;
  toPosition: { x: number; y: number; height: number };
  isWinnerPath: boolean;
  animationDelay: number;
  roundIndex: number;
}

function getConnectorPath(from: Rect, to: { x: number; y: number; height: number }): string {
  const startX = from.x + from.width;
  const startY = from.y + from.height / 2;
  const endX = to.x;
  const endY = to.y + to.height / 2;
  const midX = (startX + endX) / 2;

  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}

export default function BracketConnector({
  fromPosition,
  toPosition,
  isWinnerPath,
  animationDelay,
  roundIndex,
}: BracketConnectorProps) {
  const [pathLength, setPathLength] = useState(300);

  const pathData = getConnectorPath(fromPosition, toPosition);
  const drawDelay = roundIndex * 0.3 + animationDelay;

  const pathRef = useCallback((el: SVGPathElement | null) => {
    if (el) {
      const length = el.getTotalLength();
      setPathLength(Math.ceil(length));
    }
  }, []);

  return (
    <g>
      <path
        ref={pathRef}
        d={pathData}
        className={`bracket-connector${isWinnerPath ? ' winner' : ''}`}
        style={
          {
            '--path-length': pathLength,
            '--draw-delay': `${drawDelay}s`,
          } as React.CSSProperties
        }
      />

      <AnimatePresence>
        {isWinnerPath && (
          <motion.path
            d={pathData}
            fill="none"
            stroke="#ef4444"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              filter: 'drop-shadow(0 0 6px #ef4444)',
            }}
            exit={{ opacity: 0 }}
            transition={{
              pathLength: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: drawDelay + 0.3,
              },
              opacity: {
                duration: 0.2,
                delay: drawDelay + 0.2,
              },
              filter: {
                delay: drawDelay + 0.9,
                duration: 0.3,
              },
            }}
          />
        )}
      </AnimatePresence>
    </g>
  );
}
