'use client';

import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/contexts/ToastContext';

const TIP_STORAGE_KEY = 'reserve_tip_shown';
export const LOGIN_PROVIDER_KEY = 'current_login_provider';

export type LoginProvider = 'kakao' | 'google' | null;

function readStoredProvider(): LoginProvider {
  try {
    const stored = localStorage.getItem(LOGIN_PROVIDER_KEY);
    if (stored === 'kakao' || stored === 'google') return stored;
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function getLoginProvider(user: User | null): LoginProvider {
  if (!user) return null;

  const stored = readStoredProvider();
  if (stored) return stored;

  const identities = user.identities?.filter(
    (i): i is typeof i & { provider: 'kakao' | 'google' } =>
      i.provider === 'kakao' || i.provider === 'google'
  );

  if (identities && identities.length > 1) {
    const sorted = [...identities].sort((a, b) => {
      const timeA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const timeB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      return timeB - timeA;
    });
    return sorted[0].provider;
  }

  if (identities && identities.length === 1) {
    return identities[0].provider;
  }

  const provider = user.app_metadata?.provider;
  if (provider === 'kakao' || provider === 'google') return provider;

  return null;
}

export function hasKakaoIdentity(user: User | null): boolean {
  if (!user) return false;
  return (
    user.app_metadata?.provider === 'kakao' ||
    user.app_metadata?.providers?.includes('kakao') ||
    user.identities?.some(i => i.provider === 'kakao') ||
    false
  );
}

export function useReservationTip() {
  const { showToast } = useToast();

  const handleReservationClick = useCallback(() => {
    try {
      const tipShown = localStorage.getItem(TIP_STORAGE_KEY);
      if (tipShown) return;

      localStorage.setItem(TIP_STORAGE_KEY, 'true');
      showToast(
        '예약 시 서울시 통합회원 로그인이 필요합니다 (간편로그인·비회원 예약 불가)',
        'info'
      );
    } catch {
      // localStorage unavailable (private browsing etc.)
    }
  }, [showToast]);

  return { handleReservationClick };
}
