'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeRedirectPath } from '@/lib/utils/sanitizeRedirect';

export default function AuthComplete() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = sanitizeRedirectPath(localStorage.getItem('auth_redirect'));
    localStorage.removeItem('auth_redirect');
    router.replace(redirectPath);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">로그인 완료 중...</div>
    </div>
  );
}
