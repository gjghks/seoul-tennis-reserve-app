'use client';

import { useThemeClass } from '@/lib/cn';

export default function ReservationNotice() {
  const themeClass = useThemeClass();

  return (
    <p className={themeClass(
      'text-xs text-black/60 font-medium text-center mt-2',
      'text-xs text-gray-400 text-center mt-2'
    )}>
      예약 시 서울시 통합회원 로그인 필요 (간편로그인·비회원 예약 불가)
    </p>
  );
}
