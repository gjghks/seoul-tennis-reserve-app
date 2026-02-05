'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';
  return path;
}

export default function AuthComplete() {
  const router = useRouter();

  useEffect(() => {
    const redirectPath = sanitizeRedirectPath(localStorage.getItem('auth_redirect'));
    localStorage.removeItem('auth_redirect');
    router.replace(redirectPath);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">로그인 완료 중...</div>
    </div>
  );
}
