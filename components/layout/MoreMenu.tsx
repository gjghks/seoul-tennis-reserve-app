'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeason } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';

const NAV_ITEMS = [
  {
    href: '/my',
    label: '마이페이지',
    description: '즐겨찾기, 알림, 프로필 관리',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/records',
    label: '경기 기록',
    description: '나의 테니스 경기 기록 관리',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/map',
    label: '지도',
    description: '서울 전체 테니스장 지도',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/ladder',
    label: '래더',
    description: 'ELO 랭킹과 리더보드',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: '오늘 예약',
    description: '오늘 바로 예약 가능한 코트',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/compare',
    label: '구별 비교',
    description: '자치구별 코트 현황 비교',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    href: '/trends',
    label: '타이밍',
    description: '언제 예약하면 좋을지 분석',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: '캘린더',
    description: '날짜별 예약 현황 달력',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <rect x="7" y="14" width="3" height="3" rx="0.5" />
      </svg>
    ),
  },
] as const;

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
  const pathname = usePathname();
  const themeClass = useThemeClass();
  const { user } = useAuth();
  const { toggleTheme, isNeoBrutalism } = useTheme();
  const { season, toggleSeason } = useSeason();
  // Blind-cycle toggle: label shows the NEXT season in SEASON_ORDER.
  const seasonLabel =
    season === 'default' ? '🌸 벚꽃 시즌'
    : season === 'cherry-blossom' ? '🎾 테니스 봄'
    : season === 'tennis-spring' ? '🌊 한여름 코트'
    : season === 'tennis-summer' ? '🍂 테니스 가을'
    : season === 'tennis-autumn' ? '❄️ 테니스 겨울'
    : '✨ 기본 테마';

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;

  const [myPageItem, ...analysisItems] = NAV_ITEMS;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed left-0 right-0 z-40 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${themeClass(
          'bg-white border-t-[3px] border-x-[3px] border-black rounded-t-[16px]',
          'bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]'
        )}`}
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
        role="dialog"
        aria-modal="true"
        aria-label="더보기 메뉴"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className={`w-10 h-1 rounded-full ${themeClass('bg-black/20', 'bg-gray-300')}`} />
        </div>

        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          <Link
            href={user ? myPageItem.href : loginUrl}
            onClick={onClose}
            className={`flex items-center gap-3 p-3 mb-3 transition-colors ${themeClass(
              'bg-[var(--nb-accent-bg-muted)] hover:bg-[var(--nb-accent-bg-hover)] border-2 border-black rounded-[10px]',
              'bg-gray-50 rounded-xl hover:bg-gray-100'
            )}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${themeClass(
              'bg-black text-[var(--nb-icon-accent)]',
              'bg-[var(--minimal-icon-accent-bg)] text-[var(--minimal-icon-accent-text)]'
            )}`}>
              {myPageItem.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold truncate ${themeClass('text-black', 'text-gray-900')}`}>
                {user ? '마이페이지' : '로그인'}
              </p>
              <p className={`text-xs truncate ${themeClass('text-black/60', 'text-gray-500')}`}>
                {user ? myPageItem.description : '로그인하고 더 많은 기능을 이용하세요'}
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`w-4 h-4 shrink-0 ${themeClass('text-black/30', 'text-gray-400')}`} aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <div className="space-y-1 mb-3">
            {analysisItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-3 transition-colors ${themeClass(
                    `rounded-[10px] ${active ? 'bg-[var(--nb-accent-bg-active)] font-bold' : 'hover:bg-gray-100'}`,
                    `rounded-xl ${active ? 'bg-[var(--minimal-active-bg)] text-[var(--minimal-active-text)]' : 'hover:bg-gray-50'}`
                  )}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${themeClass(
                    'bg-black/10',
                    active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  )}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${themeClass('text-black', 'text-gray-900')}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ${themeClass('text-black/60', 'text-gray-500')}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={`border-t pt-3 ${themeClass('border-black/15', 'border-gray-100')}`}>
            <div className="flex items-center gap-2">
              <Link
                href="/about"
                onClick={onClose}
                className={`flex-1 text-center px-3 min-h-[44px] inline-flex items-center justify-center text-xs transition-colors ${themeClass(
                  'text-black/60 hover:bg-gray-100 font-medium rounded-[8px]',
                  'text-gray-500 hover:bg-gray-50 rounded-lg'
                )}`}
              >
                서비스 소개
              </Link>
              <Link
                href="/guide"
                onClick={onClose}
                className={`flex-1 text-center px-3 min-h-[44px] inline-flex items-center justify-center text-xs transition-colors ${themeClass(
                  'text-black/60 hover:bg-gray-100 font-medium rounded-[8px]',
                  'text-gray-500 hover:bg-gray-50 rounded-lg'
                )}`}
              >
                이용 가이드
              </Link>
              <button
                type="button"
                onClick={() => { toggleTheme(); onClose(); }}
                className={`flex-1 text-center px-3 min-h-[44px] inline-flex items-center justify-center text-xs transition-colors ${themeClass(
                  'text-black/60 hover:bg-gray-100 font-medium rounded-[8px]',
                  'text-gray-500 hover:bg-gray-50 rounded-lg'
                )}`}
              >
                {isNeoBrutalism ? '🎨 Minimal' : '🎨 Neo-Brutal'}
              </button>
              <button
                type="button"
                onClick={() => { toggleSeason(); onClose(); }}
                className={`flex-1 text-center px-3 min-h-[44px] inline-flex items-center justify-center text-xs transition-colors ${themeClass(
                  'text-black/60 hover:bg-gray-100 font-medium rounded-[8px]',
                  'text-gray-500 hover:bg-gray-50 rounded-lg'
                )}`}
              >
                {seasonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
