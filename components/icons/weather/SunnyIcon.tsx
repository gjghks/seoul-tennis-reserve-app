'use client';

import React from 'react';

export interface WeatherIconProps {
  size?: number;
  className?: string;
}

export function SunnyIcon({ size = 24, className = '' }: WeatherIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <style>{`
        .sunny-rays {
          transform-origin: 12px 12px;
          animation: weather-sun-spin 20s linear infinite;
        }
        @keyframes weather-sun-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <g className="sunny-rays">
        <circle cx="12" cy="12" r="5" fill="#fbbf24" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="12"
            y1="4"
            x2="12"
            y2="2"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}
