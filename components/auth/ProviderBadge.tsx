'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import { getLoginProvider } from '@/lib/hooks/useReservationTip';
import type { LoginProvider } from '@/lib/hooks/useReservationTip';

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.734 1.8 5.129 4.503 6.47-.177.637-.64 2.309-.732 2.665-.114.442.162.436.341.317.14-.093 2.238-1.519 3.147-2.138.553.08 1.123.122 1.704.122 5.523 0 10-3.463 10-7.737C22 6.463 17.523 3 12 3z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const PROVIDER_CONFIG: Record<NonNullable<LoginProvider>, { label: string; Icon: typeof KakaoIcon }> = {
  kakao: { label: '카카오', Icon: KakaoIcon },
  google: { label: 'Google', Icon: GoogleIcon },
};

export function ProviderIcon() {
  const { user } = useAuth();
  const provider = getLoginProvider(user);

  if (!provider) return null;

  const { Icon } = PROVIDER_CONFIG[provider];

  return (
    <span className="inline-flex items-center" title={`${PROVIDER_CONFIG[provider].label} 로그인`}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

export function ProviderBadge() {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const provider = getLoginProvider(user);

  if (!provider) return null;

  const { label, Icon } = PROVIDER_CONFIG[provider];

  const badgeStyle = provider === 'kakao'
    ? themeClass(
        'bg-[#FEE500]/40 border-2 border-black/15 text-[#191919]',
        'bg-[#FEE500]/30 border border-[#FEE500] text-[#191919]'
      )
    : themeClass(
        'bg-white border-2 border-black/15 text-gray-700',
        'bg-gray-50 border border-gray-200 text-gray-600'
      );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeStyle}`}
      title={`${label} 로그인`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label} 로그인
    </span>
  );
}
