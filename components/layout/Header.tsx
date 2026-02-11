'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const themeClass = useThemeClass();
  const router = useRouter();
  const pathname = usePathname();
  const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className={`shrink-0 sticky top-0 z-50 ${themeClass('bg-[#facc15] border-b-[3px] border-black', 'bg-white border-b border-gray-100')}`}>
      <div className="container">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center ${themeClass('bg-black rounded-[5px]', 'rounded-lg bg-green-600')}`}>
              <svg className={`w-5 h-5 ${themeClass('text-[#84cc16]', 'text-white')}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2C12 12 12 12 22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 22C12 12 12 12 2 12" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span className={`font-semibold ${themeClass('text-black font-bold', 'text-gray-900')}`}>
              서울 테니스
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/today"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              오늘 예약
            </Link>
            <Link
              href="/compare"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              구별 비교
            </Link>
            <Link
              href="/trends"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              경쟁률
            </Link>
            <Link
              href="/calendar"
              className={`hidden sm:block px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
            >
              캘린더
            </Link>
            {loading ? (
              <div className="w-16 h-8 skeleton rounded" />
            ) : user ? (
              <>
                <Link
                  href="/my"
                  className={`px-3 py-1.5 text-sm transition-colors ${themeClass('text-black font-bold hover:underline underline-offset-4', 'text-gray-600 hover:text-green-600')}`}
                >
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
            ) : (
              <Link
                href={loginUrl}
                className={`text-sm py-2 px-4 ${themeClass('btn-nb btn-nb-primary', 'btn btn-primary')}`}
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
