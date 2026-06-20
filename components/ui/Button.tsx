'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  rel?: string;
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

function getNeoClasses(variant: string, size: string): string {
  const base =
    'inline-flex items-center justify-center gap-2 border-2 border-black rounded-[5px] font-bold uppercase tracking-tight transition-all interact-nb-press';

  const variants: Record<string, string> = {
    primary:
      'bg-[#a3e635] text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
    secondary:
      'bg-white dark:bg-slate-900 text-black dark:text-slate-100 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
    ghost:
      'bg-transparent text-black dark:text-slate-100 border-transparent shadow-none hover:bg-black/5',
    danger:
      'bg-[#ff6b6b] text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return cn(base, variants[variant], sizes[size]);
}

function getMinimalClasses(variant: string, size: string): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all interact-press';

  const variants: Record<string, string> = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary:
      'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:border-green-300 hover:text-green-700',
    ghost: 'bg-transparent text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return cn(base, variants[variant], sizes[size]);
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  className,
  children,
  type = 'button',
  target,
  rel,
}: ButtonProps) {
  const { isNeoBrutalism } = useTheme();

  const themeClasses = isNeoBrutalism
    ? getNeoClasses(variant, size)
    : getMinimalClasses(variant, size);

  const disabledClasses = disabled || loading ? 'opacity-50 pointer-events-none' : '';

  const classes = cn(themeClasses, disabledClasses, className);

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {children}
    </>
  );

  if (href && !disabled && !loading) {
    const isExternal = href.startsWith('http') || target === '_blank';

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target={target}
          rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
}
