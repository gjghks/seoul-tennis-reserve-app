'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import Link from 'next/link';
import RecordsContent from '@/components/records/RecordsContent';
import LoginPrompt from '@/components/auth/LoginPrompt';
import { useState } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { DEMO_STATS } from '@/lib/mockData/guideExamples';
import type { MatchResult } from '@/lib/constants/tennis';

export default function RecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const [showLogin, setShowLogin] = useState(false);

  if (authLoading) {
    return (
      <div className={`container mx-auto px-4 py-6 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black font-bold', 'text-gray-400')}>로딩중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-6 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-3xl md:text-4xl mb-4 ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900')}`}>
              나의 테니스 기록을<br className="md:hidden" /> 한눈에 관리하세요
            </h1>
            <p className={`text-lg ${themeClass('text-black/70 font-medium', 'text-gray-600')}`}>
              경기 스코어부터 승률 분석까지, 더 나은 플레이를 위한 데이터 파트너
            </p>
          </div>

          <StatsPreview />

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
            <Link
              href="/guide/records"
              className={cn(
                'inline-flex items-center gap-1 mt-3 text-sm transition-colors',
                themeClass(
                  'text-black/40 font-bold hover:text-black/70 underline decoration-1 underline-offset-4',
                  'text-gray-400 hover:text-gray-600'
                )
              )}
            >
              먼저 기능을 자세히 알아보고 싶다면?
            </Link>
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

function StatsPreview() {
  const themeClass = useThemeClass();
  const { ref, inView } = useInView();
  const animTotal = useCountUp(DEMO_STATS.total_matches, inView);
  const animWinRate = useCountUp(DEMO_STATS.win_rate, inView);
  const animAvgCost = useCountUp(DEMO_STATS.avg_cost, inView, 1000);

  const getResultColor = (result: MatchResult) => {
    switch (result) {
      case 'win':
        return 'bg-green-500';
      case 'loss':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const resultCounts: Partial<Record<string, number>> = {};
  const recentFormItems = DEMO_STATS.recent_form.map((result) => {
    resultCounts[result] = (resultCounts[result] || 0) + 1;
    return { result, key: `preview-${result}-${resultCounts[result]}` };
  });

  return (
    <div ref={ref} className="mb-10">
      <div className={cn(
        'overflow-hidden p-5',
        themeClass(
          'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white rounded-2xl border border-gray-100 shadow-sm'
        )
      )}>
        <div className="flex items-center gap-2 mb-4">
          <span className={cn(
            'text-xs font-bold px-2 py-1 rounded',
            themeClass('bg-black text-white', 'bg-green-100 text-green-700')
          )}>
            예시 데이터
          </span>
          {DEMO_STATS.current_streak && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
              🔥 {DEMO_STATS.current_streak.count}연승 중!
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: '전체 경기', value: `${animTotal}전` },
            { label: '승률', value: `${animWinRate}%`, valueClass: 'text-green-600' },
            { label: '승/패', value: `${DEMO_STATS.wins}승 ${DEMO_STATS.losses}패 ${DEMO_STATS.draws}무`, valueClass: 'text-sm' },
            { label: '평균 비용', value: `${animAvgCost.toLocaleString('ko-KR')}원` },
          ].map((item, i) => (
            <div
              key={item.label}
              className={cn(
                'flex flex-col items-center justify-center p-3',
                inView ? 'anim-fade-up' : 'opacity-0',
                themeClass(
                  'rounded-[5px] border-2 border-black bg-gray-50',
                  'rounded-xl border border-gray-200 bg-gray-50'
                )
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="mb-1 text-[10px] font-bold text-gray-500">{item.label}</span>
              <span className={cn('text-base font-bold', item.valueClass)}>{item.value}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-500 mb-1.5">최근 전적</div>
          <div className="flex gap-2">
            {recentFormItems.map(({ result, key }, i) => (
              <div
                key={key}
                className={cn(
                  'h-7 w-7 rounded-full border-2 border-white shadow-sm',
                  getResultColor(result),
                  inView ? 'anim-pop-in' : 'opacity-0 scale-0'
                )}
                style={{ animationDelay: `${i * 60}ms` }}
                title={result === 'win' ? '승리' : result === 'loss' ? '패배' : '무승부'}
              />
            ))}
          </div>
        </div>

        <div className={cn(
          'flex items-center justify-between mt-4 pt-3 border-t',
          themeClass('border-black/10', 'border-gray-100')
        )}>
          <p className={cn(
            'text-xs',
            themeClass('text-black/40 font-bold', 'text-gray-400')
          )}>
            로그인하면 나만의 통계를 확인할 수 있어요
          </p>
          <Link
            href="/guide/records"
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold shrink-0 transition-colors',
              themeClass('text-black/50 hover:text-black', 'text-green-600 hover:text-green-700')
            )}
          >
            모든 기능 체험
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
