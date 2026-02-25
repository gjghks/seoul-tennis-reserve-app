'use client';

import React from 'react';
import type { WeatherIconProps } from './SunnyIcon';

export function CloudyIcon({ size = 24, className = '' }: WeatherIconProps) {
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
        .cloud-back {
          animation: drift-slow 20s linear infinite alternate;
        }
        .cloud-front {
          animation: drift-fast 15s linear infinite alternate;
        }
        
        @keyframes drift-slow {
          0% { transform: translateX(-2px); }
          100% { transform: translateX(2px); }
        }
        
        @keyframes drift-fast {
          0% { transform: translateX(2px); }
          100% { transform: translateX(-2px); }
        }
      `}</style>
      
      <path
        d="M5.5 13C3.567 13 2 11.433 2 9.5C2 7.567 3.567 6 5.5 6C5.812 6 6.115 6.039 6.404 6.113C7.147 4.135 9.039 2.75 11.25 2.75C14.15 2.75 16.5 5.1 16.5 8C16.5 8.302 16.475 8.597 16.427 8.885C17.41 9.41 18.125 10.455 18.125 11.65C18.125 13.445 16.67 14.9 14.875 14.9H5.5Z"
        fill="#d1d5db"
        opacity="0.6"
        className="cloud-back"
      />
      
      <path
        d="M7.5 18C5.01472 18 3 15.9853 3 13.5C3 11.0147 5.01472 9 7.5 9C7.88372 9 8.25624 9.04812 8.61118 9.1396C9.52554 6.70773 11.8524 5 14.5 5C18.0899 5 21 7.91015 21 11.5C21 11.8706 20.9688 12.2338 20.9094 12.5882C22.1197 13.2336 23 14.5186 23 16C23 18.2091 21.2091 20 19 20H7.5Z"
        fill="#9ca3af"
        className="cloud-front"
      />
    </svg>
  );
}
