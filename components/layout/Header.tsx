'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const { toggleTheme, isNeoBrutalism } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/about', label: '서비스 소개', icon: '📖' },
    { href: '/contact', label: '문의하기', icon: '📧' },
    { href: '/sitemap-page', label: '사이트맵', icon: '🗺️' },
  ];

  return (
    <header className={`shrink-0 sticky top-0 z-50 ${
      isNeoBrutalism 
        ? 'bg-[#facc15] border-b-[3px] border-black' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center ${
                isNeoBrutalism 
                  ? 'bg-black rounded-[5px]' 
                  : 'rounded-lg bg-green-600'
              }`}>
                <svg className={`w-5 h-5 ${isNeoBrutalism ? 'text-[#84cc16]' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2C12 12 12 12 22 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 22C12 12 12 12 2 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className={`font-semibold ${isNeoBrutalism ? 'text-black font-bold' : 'text-gray-900'}`}>
                서울 테니스
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    isNeoBrutalism
                      ? 'text-black font-bold hover:bg-black/10'
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <nav className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="메뉴 열기"
                aria-expanded={menuOpen}
                className={`p-2 rounded-lg transition-colors ${
                  isNeoBrutalism
                    ? 'text-black hover:bg-black/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Mobile Dropdown Menu */}
              {menuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-48 py-2 rounded-lg shadow-lg z-50 ${
                  isNeoBrutalism
                    ? 'bg-white border-2 border-black'
                    : 'bg-white border border-gray-200'
                }`}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        isNeoBrutalism
                          ? 'text-black font-bold hover:bg-yellow-100'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isNeoBrutalism ? '미니멀 테마로 변경' : '네오브루탈 테마로 변경'}
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
                  type="button"
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
