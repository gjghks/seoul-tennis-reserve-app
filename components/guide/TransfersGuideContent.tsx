'use client';

import { useState, useCallback, useRef, useId } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import TransferCard from '@/components/transfers/TransferCard';
import { DEMO_TRANSFERS } from '@/lib/mockData/guideExamples';

const FEATURE_DEMOS = [
  {
    id: 'sell',
    emoji: '🎫',
    title: '코트 양도하기',
    desc: '부득이하게 취소해야 할 코트를 필요한 분에게 양도할 수 있습니다.',
  },
  {
    id: 'buy',
    emoji: '🔍',
    title: '코트 구하기',
    desc: '원하는 시간, 장소의 코트 양도글을 찾아보고 연락할 수 있습니다.',
  },
] as const;

type DemoId = (typeof FEATURE_DEMOS)[number]['id'];

const TRANSFER_STEPS = [
  {
    step: 1,
    title: '양도글 찾기',
    desc: '지역별, 상태별로 양도글을 검색합니다.',
    icon: '🔍',
  },
  {
    step: 2,
    title: '관심 표시',
    desc: '마음에 드는 양도글에 \'관심 있어요\'를 누르고 간단한 메시지를 남깁니다. 판매자에게 푸시 알림이 즉시 전달됩니다.',
    icon: '💛',
  },
  {
    step: 3,
    title: '연락처 확인',
    desc: '판매자가 승인하면 푸시 알림과 함께 연락처가 공개됩니다.',
    icon: '🔓',
  },
  {
    step: 4,
    title: '거래 완료',
    desc: '연락처로 직접 소통하여 안전하게 코트를 양도받습니다.',
    icon: '🤝',
  },
];

const SAFETY_TIPS = [
  {
    title: '원가 이하 양도 원칙',
    desc: '웃돈을 얹어 파는 행위는 강력히 금지되며 적발 시 서비스 이용이 영구 정지될 수 있습니다.',
  },
  {
    title: '직접 취소 권장',
    desc: '양도 거래는 개인 간 거래이므로 가급적 공식 예약 사이트의 취소를 권장합니다.',
  },
  {
    title: '푸시 알림 활용',
    desc: '마이페이지에서 푸시 알림을 켜두면 관심 표시, 승인, 거절 결과를 놓치지 않습니다.',
  },
];

export default function TransfersGuideContent() {
  const themeClass = useThemeClass();
  const [openDemo, setOpenDemo] = useState<DemoId | null>(null);
  const demoRefs = useRef<Record<string, HTMLElement | null>>({});
  const baseId = useId();

  const toggleDemo = useCallback(
    (id: DemoId) => {
      setOpenDemo((prev) => {
        const next = prev === id ? null : id;
        if (next) {
          requestAnimationFrame(() => {
            demoRefs.current[next]?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          });
        }
        return next;
      });
    },
    []
  );

  return (
    <div className="container py-8 scrollbar-hide">
      <div
        className={cn(
          'max-w-3xl mx-auto',
          themeClass(
            'bg-white dark:bg-slate-900 border-[3px] border-black dark:border-[#f1f3f8] rounded-[10px] shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#f1f3f8] p-8',
            'bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8'
          )
        )}
      >
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🎫</div>
          <h1 className={cn('text-3xl font-bold mb-3', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
            양도 마켓 가이드
          </h1>
          <p className={cn('text-lg', themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400'))}>
            테니스 코트 예약 양도/구함 서비스 이용 방법
          </p>
        </div>

        <div className={cn('space-y-12', themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400'))}>
          
          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">✨</span> 주요 기능
            </h2>
            <p className="leading-relaxed mb-6">
              카드를 눌러 각 기능의 실제 모습을 확인해보세요.
            </p>

            <div className="space-y-3">
              {FEATURE_DEMOS.map((feature) => {
                const isOpen = openDemo === feature.id;
                const cardId = `${baseId}-card-${feature.id}`;
                const panelId = `${baseId}-panel-${feature.id}`;

                return (
                  <div key={feature.id}>
                    <button
                      type="button"
                      id={cardId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleDemo(feature.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left cursor-pointer select-none transition-all',
                        themeClass(
                          'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[6px] shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#f1f3f8] hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#f1f3f8] hover:-translate-y-[1px]',
                          'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        ),
                        isOpen &&
                          themeClass(
                            'shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] -translate-y-[1px] bg-red-50 dark:bg-red-950/40',
                            'bg-white dark:bg-slate-900 border-red-300 dark:border-red-700 shadow-md'
                          )
                      )}
                    >
                      <div className="text-2xl shrink-0">{feature.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className={cn('font-bold mb-0.5', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                          {feature.title}
                        </div>
                        <p className="text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                      <div
                        className={cn(
                          'shrink-0 text-xs font-bold transition-transform duration-300',
                          themeClass('text-black dark:text-slate-100', 'text-gray-400 dark:text-slate-500'),
                          isOpen && 'rotate-180'
                        )}
                      >
                        ▼
                      </div>
                    </button>

                    <section
                      id={panelId}
                      ref={(el) => { demoRefs.current[feature.id] = el; }}
                      aria-labelledby={cardId}
                      className={cn(
                        'overflow-hidden transition-all duration-500 ease-in-out',
                        isOpen ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div
                        className={cn(
                          'p-4 rounded-b-lg',
                          themeClass(
                            'bg-gray-50 dark:bg-slate-800 border-2 border-t-0 border-black dark:border-[#f1f3f8] rounded-[6px]',
                            'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-inner'
                          )
                        )}
                      >
                        {feature.id === 'sell' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>예시 화면</span>
                            <div className="pointer-events-none">
                              <TransferCard transfer={DEMO_TRANSFERS[0]} />
                            </div>
                          </div>
                        )}
                        {feature.id === 'buy' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>무료 나눔 예시</span>
                            <div className="pointer-events-none">
                              <TransferCard transfer={DEMO_TRANSFERS[1]} />
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">✍️</span> 거래 방법
            </h2>
            <div className="space-y-4">
              {TRANSFER_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={cn(
                    'flex items-start gap-4 p-4',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[6px]',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg'
                    )
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold',
                      themeClass('bg-black text-white', 'bg-red-500 text-white')
                    )}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3 className={cn('font-bold mb-1', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
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
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">🚨</span> 안전 가이드
            </h2>
            <ul className="space-y-3">
              {SAFETY_TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-red-600 font-bold shrink-0">⚠️</span>
                  <span>
                    <strong className={themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}>
                      {tip.title}
                    </strong>
                    <span className="block text-sm mt-1">{tip.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/transfers"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-black text-white border-2 border-black dark:border-[#f1f3f8] hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8]',
                    'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                  )
                )}
              >
                양도 마켓 보러가기
              </Link>
              <Link
                href="/transfers/new"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-2 border-black dark:border-[#f1f3f8] hover:bg-gray-100 dark:hover:bg-slate-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8]',
                    'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow'
                  )
                )}
              >
                양도글 작성하기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}