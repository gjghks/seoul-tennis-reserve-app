'use client';

import React from 'react';
import type { WeatherIconProps } from './SunnyIcon';

export function SnowyIcon({ size = 24, className = '' }: WeatherIconProps) {
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
        .snow-flake {
          animation: snow-fall 2s ease-in-out infinite;
        }
        .snow-flake-1 { animation-delay: 0s; }
        .snow-flake-2 { animation-delay: 0.6s; }
        .snow-flake-3 { animation-delay: 1.2s; }
        
        @keyframes snow-fall {
          0% { transform: translate(0, -2px); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(-2px, 3px); }
          80% { transform: translate(1px, 6px); opacity: 1; }
          100% { transform: translate(0, 8px); opacity: 0; }
        }
      `}</style>
      <path
        d="M6.5 15C4.01472 15 2 12.9853 2 10.5C2 8.01472 4.01472 6 6.5 6C6.88372 6 7.25624 6.04812 7.61118 6.1396C8.52554 3.70773 10.8524 2 13.5 2C17.0899 2 20 4.91015 20 8.5C20 8.87062 19.9688 9.2338 19.9094 9.5882C21.1197 10.2336 22 11.5186 22 13C22 15.2091 20.2091 17 18 17H6.5Z"
        fill="#94a3b8"
        opacity="0.8"
      />
      <g fill="#bfdbfe">
        <circle cx="8" cy="17" r="1.5" className="snow-flake snow-flake-1" />
        <circle cx="12" cy="18" r="1.5" className="snow-flake snow-flake-2" />
        <circle cx="16" cy="17" r="1.5" className="snow-flake snow-flake-3" />
      </g>
    </svg>
  );
}
