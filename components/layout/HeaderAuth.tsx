'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import { ProviderIcon } from '@/components/auth/ProviderBadge';

export default function HeaderAuth() {
  const { user, loading, signOut } = useAuth();
  const themeClass = useThemeClass();
  const router = useRouter();
  const pathname = usePathname();
  const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  if (loading) {
    return <div className="w-16 h-8 skeleton rounded" />;
  }

  if (user) {
    return (
      <>
        <Link
          href="/my"
          className={`px-3 py-1.5 text-sm transition-colors inline-flex items-center gap-1.5 ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
        >
          <ProviderIcon />
          마이페이지
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className={`px-3 py-1.5 text-sm transition-colors ${themeClass('text-black/70 font-medium hover:underline underline-offset-4', 'text-gray-400 hover:text-gray-600')}`}
        >
          로그아웃
        </button>
      </>
    );
  }

  return (
    <Link
      href={loginUrl}
      className={`text-sm py-2 px-4 ${themeClass('btn-nb btn-nb-primary', 'btn btn-primary')}`}
    >
      로그인
    </Link>
  );
}
