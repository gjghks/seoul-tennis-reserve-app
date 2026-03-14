'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import LoginPrompt from '@/components/auth/LoginPrompt';
import ProfileGate from '@/components/profile/ProfileGate';
import TournamentForm from '@/components/tournament/TournamentForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTournamentPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black font-bold', 'text-gray-400')}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen ${themeClass('bg-nb-bg', '')}`}>
        <div className={themeClass(
          'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] py-12 px-6 text-center max-w-md mx-auto',
          'bg-white rounded-2xl border border-gray-100 py-12 px-6 text-center max-w-md mx-auto'
        )}>
          <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${themeClass(
            'bg-[#a3e635] border-2 border-black rounded-[5px]',
            'bg-green-50 rounded-full'
          )}`}>
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className={`text-lg mb-2 ${themeClass('font-black text-black', 'font-semibold text-gray-900')}`}>
            로그인이 필요합니다
          </h3>
          <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')}`}>
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
              className={`text-sm ${themeClass('text-black/50 font-bold hover:text-black', 'text-gray-400 hover:text-gray-600')} transition-colors`}
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
    <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50'))}>
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 flex items-center">
          <Link
            href="/tournaments"
            className={themeClass(
              'mr-4 p-2 hover:bg-gray-200 transition-colors rounded-[5px]',
              'mr-4 p-2 hover:bg-gray-100 transition-colors rounded-full'
            )}
            aria-label="뒤로 가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <h1 className={cn('text-2xl', themeClass('font-black text-black uppercase', 'font-bold text-gray-900'))}>
            새 대진표 만들기
          </h1>
        </div>
        <ProfileGate feature="tournament">
          <TournamentForm />
        </ProfileGate>
      </div>
    </div>
  );
}
