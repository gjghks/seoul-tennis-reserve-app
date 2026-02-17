'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import { hasKakaoIdentity } from '@/lib/hooks/useReservationTip';

export default function KakaoReserveTip() {
  const { user } = useAuth();
  const themeClass = useThemeClass();

  if (!hasKakaoIdentity(user)) return null;

  return (
    <p className={themeClass(
      'text-xs text-black/50 font-medium text-center mt-2',
      'text-xs text-gray-400 text-center mt-2'
    )}>
      카카오 계정으로 로그인 중 — 예약 사이트에서도 카카오 로그인 한 번이면 바로 예약 가능
    </p>
  );
}
