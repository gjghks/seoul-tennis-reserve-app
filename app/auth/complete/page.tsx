'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeRedirectPath } from '@/lib/utils/sanitizeRedirect';

export default function AuthComplete() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = sanitizeRedirectPath(localStorage.getItem('auth_redirect'));
    localStorage.removeItem('auth_redirect');

    // router.replace can silently fail during auth state transitions;
    // fall back to window.location if it doesn't navigate within 2s
    router.replace(redirectPath);

    const fallbackTimer = setTimeout(() => {
      window.location.href = redirectPath;
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">로그인 완료 중...</div>
    </div>
  );
}
