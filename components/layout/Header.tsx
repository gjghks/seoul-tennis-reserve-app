'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { theme, toggleTheme, isNeoBrutalism } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className={`sticky top-0 z-50 ${
      isNeoBrutalism 
        ? 'bg-[#facc15] border-b-[3px] border-black' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center ${
              isNeoBrutalism 
                ? 'bg-black rounded-[5px]' 
                : 'rounded-lg bg-green-600'
            }`}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2C12 12 12 12 22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 22C12 12 12 12 2 12" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span className={`font-semibold ${isNeoBrutalism ? 'text-black font-bold' : 'text-gray-900'}`}>
              서울 테니스
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                isNeoBrutalism
                  ? 'bg-black text-[#facc15] border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                  : 'bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200'
              }`}
            >
              {isNeoBrutalism ? 'MINIMAL' : 'NEO-BRUTAL'}
            </button>
            
            {loading ? (
              <div className="w-16 h-8 skeleton rounded" />
            ) : user ? (
              <>
                <Link
                  href="/my"
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    isNeoBrutalism
                      ? 'text-black font-bold hover:underline underline-offset-4'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    isNeoBrutalism
                      ? 'text-black/70 font-medium hover:underline underline-offset-4'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-sm py-2 px-4 ${
                  isNeoBrutalism
                    ? 'btn-nb btn-nb-primary'
                    : 'btn btn-primary'
                }`}
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
