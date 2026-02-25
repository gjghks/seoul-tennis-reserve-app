'use client';

import React from 'react';
import type { WeatherIconProps } from './SunnyIcon';

export function PartlyCloudyIcon({ size = 24, className = '' }: WeatherIconProps) {
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
        .partly-cloudy-sun {
          transform-origin: 8px 8px;
          animation: weather-sun-spin-slow 25s linear infinite;
        }
        .partly-cloudy-cloud {
          animation: weather-cloud-drift 12s ease-in-out infinite alternate;
        }
        
        @keyframes weather-sun-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes weather-cloud-drift {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-3px); }
        }
      `}</style>
      
      <g className="partly-cloudy-sun" transform="translate(1, 1)">
        <circle cx="8" cy="8" r="4" fill="#fbbf24" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="8"
            y1="1.5"
            x2="8"
            y2="0"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${angle} 8 8)`}
          />
        ))}
      </g>
      
      <path
        d="M7.5 19C5.01472 19 3 16.9853 3 14.5C3 12.0147 5.01472 10 7.5 10C7.88372 10 8.25624 10.0481 8.61118 10.1396C9.52554 7.70773 11.8524 6 14.5 6C18.0899 6 21 8.91015 21 12.5C21 12.8706 20.9688 13.2338 20.9094 13.5882C22.1197 14.2336 23 15.5186 23 17C23 19.2091 21.2091 21 19 21H7.5Z"
        fill="#d1d5db"
        className="partly-cloudy-cloud"
        stroke="#9ca3af"
        strokeWidth="0.5"
      />
    </svg>
  );
}
