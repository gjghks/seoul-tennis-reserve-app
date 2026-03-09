'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { DEMO_ELO_TIERS } from '@/lib/mockData/guideExamples';

const LADDER_STEPS = [
  {
    step: 1,
    title: '래더 참여하기',
    desc: '프로필 설정에서 래더 시스템 참여를 켭니다.',
    icon: '⚡',
  },
  {
    step: 2,
    title: '경기 기록하기',
    desc: '래더 경기를 기록하면 자동으로 상대방의 래더 점수를 반영하여 내 점수가 변동됩니다.',
    icon: '📝',
  },
  {
    step: 3,
    title: '티어 상승',
    desc: '점수를 올려 상위 티어로 올라가보세요!',
    icon: '🏆',
  },
];

const TIPS = [
  {
    title: '꾸준한 경기',
    desc: '오랫동안 경기를 하지 않으면 점수가 조금씩 하락할 수 있습니다. 꾸준히 경기를 즐겨보세요!',
  },
  {
    title: '비슷한 실력과 매칭',
    desc: '나와 비슷한 티어의 상대와 경기할 때 점수 변동폭이 가장 적절하게 계산됩니다.',
  },
];

export default function LadderGuideContent() {
  const themeClass = useThemeClass();
  const [demoWins, setDemoWins] = useState(0);
  const [demoLosses, setDemoLosses] = useState(0);
  
  const baseElo = 1200;
  const currentElo = baseElo + (demoWins * 25) - (demoLosses * 15);
  const currentTier = DEMO_ELO_TIERS.slice().reverse().find(t => currentElo >= (t as any).minElo) || DEMO_ELO_TIERS[0];

  return (
    <div className="container py-8 scrollbar-hide">
      <div
        className={cn(
          'max-w-3xl mx-auto',
          themeClass(
            'bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8',
            'bg-white rounded-xl shadow-lg p-8'
          )
        )}
      >
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h1 className={cn('text-3xl font-bold mb-3', themeClass('text-black', 'text-gray-900'))}>
            래더 랭킹 가이드
          </h1>
          <p className={cn('text-lg', themeClass('text-black/80', 'text-gray-600'))}>
            승패에 따른 ELO 점수와 티어 시스템
          </p>
        </div>

        <div className={cn('space-y-12', themeClass('text-black/80', 'text-gray-600'))}>
          
          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black', 'text-gray-900'))}>
              <span className="text-2xl">⚡</span> ELO 시스템 체험하기
            </h2>
            <div className={cn('p-6 rounded-lg text-center', themeClass('bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_#000]', 'bg-gray-50 border border-gray-200'))}>
              <div className="mb-6">
                <div className="text-sm font-bold text-gray-500 mb-2">나의 예상 점수</div>
                <div className={cn('text-5xl font-black mb-2', themeClass('text-black', 'text-gray-900'))}>
                  {currentElo} <span className="text-xl text-gray-400">점</span>
                </div>
                <div className="inline-block px-4 py-1 rounded-full text-white font-bold text-sm" style={{ backgroundColor: currentTier.color }}>
                  {currentTier.label} 티어
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setDemoWins(w => w + 1)}
                  className={cn('px-4 py-2 rounded-lg font-bold', themeClass('bg-white border-2 border-black hover:-translate-y-[2px] shadow-[2px_2px_0px_0px_#000]', 'bg-white border border-gray-200 hover:bg-gray-100 shadow-sm'))}
                >
                  <span className="text-green-600 mr-2">승리</span>+25
                </button>
                <button
                  type="button"
                  onClick={() => setDemoLosses(l => l + 1)}
                  className={cn('px-4 py-2 rounded-lg font-bold', themeClass('bg-white border-2 border-black hover:-translate-y-[2px] shadow-[2px_2px_0px_0px_#000]', 'bg-white border border-gray-200 hover:bg-gray-100 shadow-sm'))}
                >
                  <span className="text-red-600 mr-2">패배</span>-15
                </button>
                <button
                  type="button"
                  onClick={() => { setDemoWins(0); setDemoLosses(0); }}
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  초기화
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black', 'text-gray-900'))}>
              <span className="text-2xl">🎖️</span> 티어 소개
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEMO_ELO_TIERS.map((tier: any) => (
                <div
                  key={tier.key}
                  className={cn(
                    'p-4 rounded-lg text-center flex flex-col items-center justify-center',
                    themeClass('bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]', 'bg-white border border-gray-200 shadow-sm')
                  )}
                >
                  <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: tier.color }} />
                  <div className={cn('font-bold', themeClass('text-black', 'text-gray-900'))}>
                    {tier.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black', 'text-gray-900'))}>
              <span className="text-2xl">🚀</span> 시작하기
            </h2>
            <div className="space-y-4">
              {LADDER_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={cn(
                    'flex items-start gap-4 p-4',
                    themeClass(
                      'bg-white border-2 border-black rounded-[6px]',
                      'bg-white border border-gray-200 rounded-lg'
                    )
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold',
                      themeClass('bg-black text-white', 'bg-purple-600 text-white')
                    )}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className={cn('font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                      {step.title}
                    </h3>
                    <p className="text-sm">{step.desc}</p>
                  </div>
                  <div className="text-2xl ml-auto">{step.icon}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black', 'text-gray-900'))}>
              <span className="text-2xl">💡</span> 래더 팁
            </h2>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold shrink-0">✓</span>
                  <span>
                    <strong className={themeClass('text-black', 'text-gray-900')}>
                      {tip.title}
                    </strong>
                    <span className="block text-sm mt-1">{tip.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <div className="flex justify-center">
              <Link
                href="/ladder"
                className={cn(
                  'px-8 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                    'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                  )
                )}
              >
                래더 랭킹 보러가기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}