'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const themeClass = useThemeClass();
  const { isNeoBrutalism } = useTheme();

  // Size variations
  const containerSize = {
    sm: 'py-6 px-4',
    md: 'py-12 px-4',
    lg: 'py-16 px-6',
  }[size];

  const iconWrapperSizeNeo = {
    sm: 'w-12 h-12 mb-3',
    md: 'w-20 h-20 mb-4',
    lg: 'w-24 h-24 mb-6',
  }[size];

  const iconWrapperSizeMinimal = {
    sm: 'w-10 h-10 mb-2',
    md: 'w-16 h-16 mb-4',
    lg: 'w-20 h-20 mb-5',
  }[size];

  const iconSizeNeo = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  }[size];

  const iconSizeMinimal = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  const titleSizeNeo = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const titleSizeMinimal = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  }[size];

  const descSizeNeo = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const descSizeMinimal = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const btnSizeNeo = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  }[size];

  const btnSizeMinimal = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const renderAction = () => {
    if (!action) return null;

    const actionClassName = themeClass(
      `inline-block bg-[#a3e635] text-black font-black uppercase border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000] transition-all ${btnSizeNeo}`,
      `inline-block bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm ${btnSizeMinimal}`
    );

    if (action.href) {
      return (
        <Link href={action.href} className={actionClassName}>
          {action.label}
        </Link>
      );
    }

    if (action.onClick) {
      return (
        <button type="button" onClick={action.onClick} className={actionClassName}>
          {action.label}
        </button>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        themeClass(
          `flex flex-col items-center justify-center text-center ${containerSize}`,
          `flex flex-col items-center justify-center text-center ${containerSize}`
        ),
        className
      )}
    >
      {icon && (
        typeof icon === 'string' ? (
          <div
            className={themeClass(
              `${iconWrapperSizeNeo} bg-white dark:bg-slate-900 border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#000]`,
              `${iconWrapperSizeMinimal} bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full flex items-center justify-center`
            )}
            style={{ animation: 'gentle-float 3s ease-in-out infinite' }}
          >
            {isNeoBrutalism ? (
              <span className={iconSizeNeo}>{icon}</span>
            ) : (
              <span className={iconSizeMinimal}>{icon}</span>
            )}
          </div>
        ) : (
          icon
        )
      )}

      <h3
        className={themeClass(
          `${titleSizeNeo} font-black uppercase mb-2`,
          `${titleSizeMinimal} font-semibold text-gray-900 dark:text-slate-100 mb-1`
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={themeClass(
            `${descSizeNeo} text-gray-600 dark:text-slate-400 font-bold mb-6`,
            `${descSizeMinimal} text-gray-500 dark:text-slate-400 mb-6`
          )}
        >
          {description}
        </p>
      )}

      {renderAction()}
    </div>
  );
}
