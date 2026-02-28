'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

export default function ReservationNotice() {
  const themeClass = useThemeClass();

  return (
    <p className={themeClass(
      'text-xs text-black/60 font-medium text-center mt-2',
      'text-xs text-gray-400 text-center mt-2'
    )}>
      예약 시 서울시 통합회원 로그인 필요{' '}
      <Link
        href="/guide/reservation"
        className={themeClass(
          'underline underline-offset-2 hover:text-black/80',
          'underline underline-offset-2 hover:text-gray-600'
        )}
      >
        예약 가이드
      </Link>
    </p>
  );
}
