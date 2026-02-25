'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'button';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  delay?: number;
  light?: boolean;
}

export default function Skeleton({
  variant = 'default',
  width,
  height,
  className,
  count = 1,
  delay = 300,
  light = false,
}: SkeletonProps) {
  const { isNeoBrutalism } = useTheme();
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circle':
        return 'rounded-full';
      case 'button':
        return 'h-10 w-24 rounded-md';
      case 'card':
        return 'h-32 w-full rounded-xl';
      default:
        return 'rounded';
    }
  };

  const baseClasses = getVariantClasses();
  
  const themeClasses = light
    ? 'skeleton-light'
    : isNeoBrutalism
    ? 'skeleton-neo'
    : 'skeleton';

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={cn(baseClasses, themeClasses, className)}
      style={{
        width: width,
        height: height,
        ...(count > 1 && i > 0 ? { animationDelay: `${i * 100}ms` } : {}),
      }}
    />
  ));

  if (count === 1) {
    return <>{skeletons[0]}</>;
  }

  return <>{skeletons}</>;
}
