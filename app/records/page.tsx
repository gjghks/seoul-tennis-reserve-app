'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass } from '@/lib/cn';
import RecordsContent from '@/components/records/RecordsContent';
import LoginPrompt from '@/components/auth/LoginPrompt';
import { useState } from 'react';

export default function RecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const [showLogin, setShowLogin] = useState(false);

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black font-bold', 'text-gray-400')}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-3xl md:text-4xl mb-4 ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900')}`}>
              나의 테니스 기록을<br className="md:hidden" /> 한눈에 관리하세요
            </h1>
            <p className={`text-lg ${themeClass('text-black/70 font-medium', 'text-gray-600')}`}>
              경기 스코어부터 승률 분석까지, 더 나은 플레이를 위한 데이터 파트너
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className={themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all',
              'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow'
            )}>
              <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass(
                'bg-[#ff90e8] border-2 border-black rounded-[5px]',
                'bg-pink-50 rounded-xl text-pink-500'
              )}`}>
                📝
              </div>
              <h3 className={`text-xl mb-2 ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>
                간편한 스코어 기록
              </h3>
              <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>
                날짜, 장소, 상대방, 스코어를 쉽고 빠르게 기록하세요. 타이브레이크까지 상세하게 남길 수 있습니다.
              </p>
            </div>

            <div className={themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all',
              'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow'
            )}>
              <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass(
                'bg-[#22c55e] border-2 border-black rounded-[5px]',
                'bg-green-50 rounded-xl text-green-500'
              )}`}>
                📊
              </div>
              <h3 className={`text-xl mb-2 ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>
                승률 데이터 분석
              </h3>
              <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>
                전체 승률, 월별 추이, 코트별 성적을 자동으로 분석해드립니다. 나의 강점과 약점을 파악해보세요.
              </p>
            </div>

            <div className={themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all',
              'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow'
            )}>
              <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass(
                'bg-[#ffc400] border-2 border-black rounded-[5px]',
                'bg-yellow-50 rounded-xl text-yellow-500'
              )}`}>
                🤝
              </div>
              <h3 className={`text-xl mb-2 ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>
                상대 전적 관리
              </h3>
              <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>
                자주 만나는 상대와의 역대 전적을 한눈에. 라이벌과의 승부를 기록하고 관리할 수 있습니다.
              </p>
            </div>

            <div className={themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all',
              'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow'
            )}>
              <div className={`w-12 h-12 mb-4 flex items-center justify-center text-2xl ${themeClass(
                'bg-[#88aaee] border-2 border-black rounded-[5px]',
                'bg-blue-50 rounded-xl text-blue-500'
              )}`}>
                🏟️
              </div>
              <h3 className={`text-xl mb-2 ${themeClass('font-black text-black', 'font-bold text-gray-900')}`}>
                코트별 기록
              </h3>
              <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>
                어떤 코트에서 승률이 가장 높을까요? 클레이, 하드, 잔디 등 코트 재질별 성적도 확인하세요.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className={themeClass(
                'inline-flex items-center gap-2 bg-black text-white font-black text-lg px-8 py-4 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#88aaee] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#88aaee] transition-all uppercase',
                'inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl'
              )}
            >
              <span>로그인하고 나의 경기 기록 시작하기</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className={`mt-4 text-sm ${themeClass('text-black/60 font-bold', 'text-gray-400')}`}>
              * 카카오 또는 구글 계정으로 3초 만에 시작할 수 있습니다
            </p>
          </div>
        </div>
        
        <LoginPrompt
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="경기 기록을 시작하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  return <RecordsContent />;
}
