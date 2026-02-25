'use client';

import React from 'react';
import { SunnyIcon } from './SunnyIcon';
import { RainyIcon } from './RainyIcon';
import { SnowyIcon } from './SnowyIcon';
import { CloudyIcon } from './CloudyIcon';
import { PartlyCloudyIcon } from './PartlyCloudyIcon';

export interface AnimatedWeatherIconProps {
  sky: string | null;
  rainfall: number | null;
  size?: number;
  className?: string;
}

export function AnimatedWeatherIcon({
  sky,
  rainfall,
  size = 24,
  className = '',
}: AnimatedWeatherIconProps) {
  const isRain = sky === '비' || sky === '소나기' || (rainfall !== null && rainfall > 0);
  const isSnow = sky === '눈' || sky === '비/눈';
  
  if (isSnow) {
    return <SnowyIcon size={size} className={className} />;
  }
  
  if (isRain) {
    return <RainyIcon size={size} className={className} />;
  }
  
  if (sky === '맑음') {
    return <SunnyIcon size={size} className={className} />;
  }
  
  if (sky === '구름많음') {
    return <PartlyCloudyIcon size={size} className={className} />;
  }
  
  return <CloudyIcon size={size} className={className} />;
}
