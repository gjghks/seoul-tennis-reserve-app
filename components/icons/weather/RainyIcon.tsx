'use client';

import React from 'react';
import type { WeatherIconProps } from './SunnyIcon';

export function RainyIcon({ size = 24, className = '' }: WeatherIconProps) {
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
        .rain-drop {
          animation: rain-fall 1.5s linear infinite;
        }
        .rain-drop-1 { animation-delay: 0s; }
        .rain-drop-2 { animation-delay: 0.5s; }
        .rain-drop-3 { animation-delay: 1.0s; }
        
        @keyframes rain-fall {
          0% { transform: translateY(-2px); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateY(6px); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
      `}</style>
      <path
        d="M6.5 16C4.01472 16 2 13.9853 2 11.5C2 9.01472 4.01472 7 6.5 7C6.88372 7 7.25624 7.04812 7.61118 7.1396C8.52554 4.70773 10.8524 3 13.5 3C17.0899 3 20 5.91015 20 9.5C20 9.87062 19.9688 10.2338 19.9094 10.5882C21.1197 11.2336 22 12.5186 22 14C22 16.2091 20.2091 18 18 18H6.5Z"
        fill="#94a3b8"
        opacity="0.9"
      />
      <g stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
        <line x1="8" y1="17" x2="8" y2="19" className="rain-drop rain-drop-1" />
        <line x1="12" y1="18" x2="12" y2="20" className="rain-drop rain-drop-2" />
        <line x1="16" y1="17" x2="16" y2="19" className="rain-drop rain-drop-3" />
      </g>
    </svg>
  );
}
