'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import LoginPrompt from '@/components/auth/LoginPrompt';
import ProfileGate from '@/components/profile/ProfileGate';
import TournamentForm from '@/components/tournament/TournamentForm';
import Link from 'next/link';

export default function NewTournamentPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const [showLogin, setShowLogin] = useState(false);

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black dark:text-slate-100 font-bold', 'text-gray-400 dark:text-slate-500')}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className={themeClass(
          'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] py-12 px-6 text-center max-w-md mx-auto',
          'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 py-12 px-6 text-center max-w-md mx-auto'
        )}>
          <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${themeClass(
            'bg-[#a3e635] border-2 border-black rounded-[5px]',
            'bg-green-50 dark:bg-green-950/40 rounded-full'
          )}`}>
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className={`text-lg mb-2 ${themeClass('font-black text-black dark:text-slate-100', 'font-semibold text-gray-900 dark:text-slate-100')}`}>
            로그인이 필요합니다
          </h3>
          <p className={`mb-6 ${themeClass('text-black/60 dark:text-slate-400 font-medium', 'text-gray-500 dark:text-slate-400')}`}>
            대진표를 만들려면 로그인해주세요
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className={themeClass(
                'inline-flex items-center gap-2 bg-[#88aaee] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all',
                'inline-flex items-center gap-2 bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors'
              )}
            >
              로그인하기
            </button>
            <Link
              href="/tournaments"
              className={`text-sm ${themeClass('text-black/50 dark:text-slate-400 font-bold hover:text-black dark:hover:text-slate-100', 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300')} transition-colors`}
            >
              대진표 목록으로 돌아가기
            </Link>
          </div>
        </div>
        <LoginPrompt
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="대진표를 만들려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/tournaments"
              className={themeClass(
                'mr-4 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors rounded-[5px]',
                'mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors rounded-full'
              )}
              aria-label="뒤로 가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6"/>
              </svg>
            </Link>
            <h1 className={cn('text-2xl', themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-bold text-gray-900 dark:text-slate-100'))}>
              새 대진표 만들기
            </h1>
          </div>
          <Link
            href="/guide/tournaments"
            className={cn(
              'flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-all',
              themeClass(
                'bg-[#facc15] border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/40'
              )
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>사용법</span>
          </Link>
        </div>
        <ProfileGate feature="tournament">
          <TournamentForm />
        </ProfileGate>
      </div>
    </div>
  );
}
