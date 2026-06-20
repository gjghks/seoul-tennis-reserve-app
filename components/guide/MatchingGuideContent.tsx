'use client';

import { useState, useCallback, useRef, useId } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import MatchingPostCard from '@/components/matching/MatchingPostCard';
import { DEMO_MATCHING_POSTS } from '@/lib/mockData/guideExamples';

const FEATURE_DEMOS = [
  {
    id: 'post',
    emoji: '✍️',
    title: '모집글 작성',
    desc: '원하는 날짜와 장소, 모집 조건을 설정하여 매칭 글을 올리세요.',
  },
  {
    id: 'apply',
    emoji: '🤝',
    title: '매칭 신청',
    desc: '조건에 맞는 매칭글을 찾고 신청 메시지를 보낼 수 있습니다.',
  },
  {
    id: 'manage',
    emoji: '✅',
    title: '신청 관리',
    desc: '신청자를 확인하고 수락/거절을 관리하세요.',
  },
  {
    id: 'notify',
    emoji: '🔔',
    title: '실시간 알림',
    desc: '매칭 신청, 수락, 거절 시 상대방에게 푸시 알림이 즉시 전달됩니다.',
  },
] as const;

type DemoId = (typeof FEATURE_DEMOS)[number]['id'];

const MATCHING_STEPS = [
  {
    step: 1,
    title: '모집글 작성',
    desc: '구력, 연령, 게임 방식 등 세부 조건을 입력합니다.',
    icon: '📝',
  },
  {
    step: 2,
    title: '신청자 확인',
    desc: '누군가 신청하면 푸시 알림으로 바로 알려드립니다. 메시지와 프로필을 확인하세요.',
    icon: '👀',
  },
  {
    step: 3,
    title: '수락 및 매칭',
    desc: '조건에 맞는 신청자를 수락하면 매칭이 완료됩니다.',
    icon: '🎉',
  },
];

const TIPS = [
  {
    title: '상세한 소개',
    desc: '나의 플레이 스타일과 원하는 상대방의 조건을 자세히 적을수록 좋은 매칭이 성사됩니다.',
  },
  {
    title: '신청 전 확인',
    desc: '모집글의 조건을 꼼꼼히 확인하고 나에게 맞는 모임인지 확인 후 신청하세요.',
  },
  {
    title: '매너 있는 소통',
    desc: '수락/거절 시 매너 있는 메시지를 남겨주세요.',
  },
  {
    title: '푸시 알림 활용',
    desc: '마이페이지에서 푸시 알림을 활성화하면 매칭 신청/수락/거절 시 즉시 알림을 받을 수 있습니다.',
  },
];

export default function MatchingGuideContent() {
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
            'bg-white dark:bg-slate-900 border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8',
            'bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8'
          )
        )}
      >
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h1 className={cn('text-3xl font-bold mb-3', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
            테니스 매칭 가이드
          </h1>
          <p className={cn('text-lg', themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400'))}>
            함께 테니스를 칠 파트너를 찾는 방법
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
                          'bg-white dark:bg-slate-800 border-2 border-black rounded-[6px] shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[1px]',
                          'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        ),
                        isOpen &&
                          themeClass(
                            'shadow-[4px_4px_0px_0px_#000] -translate-y-[1px] bg-blue-50 dark:bg-blue-950/40',
                            'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 shadow-md'
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
                            'bg-gray-50 dark:bg-slate-800 border-2 border-t-0 border-black rounded-[6px]',
                            'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-inner'
                          )
                        )}
                      >
                        {feature.id === 'post' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-blue-100 text-blue-700'))}>예시 화면</span>
                            <div className="pointer-events-none">
                              <MatchingPostCard post={DEMO_MATCHING_POSTS[0]} />
                            </div>
                          </div>
                        )}
                        {feature.id === 'apply' && (
                          <div className="space-y-4">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-blue-100 text-blue-700'))}>신청 팝업 예시</span>
                            <div className={cn('p-4 rounded-lg', themeClass('bg-white dark:bg-slate-900 border-2 border-black shadow-[4px_4px_0px_0px_#000]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm'))}>
                              <div className="text-sm font-bold mb-2">호스트에게 보낼 메시지</div>
                              <div className={cn('w-full p-3 rounded-lg text-sm mb-4', themeClass('bg-gray-100 dark:bg-slate-800 border-2 border-black', 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'))}>
                                안녕하세요! 구력 2년차 백핸드가 장기인 테린이입니다. 즐겁게 치고 싶습니다~
                              </div>
                              <button type="button" className={cn('w-full py-2 rounded-lg font-bold transition-all', themeClass('bg-black text-white border-2 border-black hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#000]', 'bg-blue-600 text-white shadow-md hover:bg-blue-700'))}>
                                매칭 신청하기
                              </button>
                            </div>
                          </div>
                        )}
                        {feature.id === 'manage' && (
                          <div className="space-y-4">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-blue-100 text-blue-700'))}>신청자 관리 예시</span>
                            <div className={cn('p-4 rounded-lg flex items-center justify-between', themeClass('bg-white dark:bg-slate-900 border-2 border-black shadow-[4px_4px_0px_0px_#000]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm'))}>
                              <div className="flex items-center gap-3">
                                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold', themeClass('bg-yellow-200 border-2 border-black', 'bg-blue-100 text-blue-700'))}>테</div>
                                <div>
                                  <div className={cn('font-bold text-sm', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>테린이 (NTRP 2.0)</div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400">&ldquo;안녕하세요! 즐테 원합니다.&rdquo;</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" className={cn('px-3 py-1.5 text-xs font-bold rounded-md', themeClass('bg-black text-white border-2 border-black', 'bg-blue-600 text-white'))}>수락</button>
                                <button type="button" className={cn('px-3 py-1.5 text-xs font-bold rounded-md', themeClass('bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-2 border-black', 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200'))}>거절</button>
                              </div>
                            </div>
                          </div>
                        )}
                        {feature.id === 'notify' && (
                          <div className="space-y-4">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-blue-100 text-blue-700'))}>알림 예시</span>
                            <div className="space-y-2">
                              {[
                                { icon: '🎾', title: '매칭 신청', body: '테린이님이 매칭에 신청했습니다' },
                                { icon: '✅', title: '매칭 수락', body: '매칭 신청이 수락되었습니다!' },
                              ].map((notif) => (
                                <div
                                  key={notif.title}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg',
                                    themeClass(
                                      'bg-white dark:bg-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                                      'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm'
                                    )
                                  )}
                                >
                                  <span className="text-xl shrink-0">{notif.icon}</span>
                                  <div className="min-w-0">
                                    <div className={cn('font-bold text-sm', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>{notif.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400">{notif.body}</div>
                                  </div>
                                </div>
                              ))}
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
              <span className="text-2xl">✍️</span> 이용 방법
            </h2>
            <div className="space-y-4">
              {MATCHING_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={cn(
                    'flex items-start gap-4 p-4',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black rounded-[6px]',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg'
                    )
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold',
                      themeClass('bg-black text-white', 'bg-blue-600 text-white')
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
              <span className="text-2xl">💡</span> 매칭 팁
            </h2>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold shrink-0">✓</span>
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
                href="/matching"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                    'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  )
                )}
              >
                매칭 파트너 찾기
              </Link>
              <Link
                href="/matching/new"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                    'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow'
                  )
                )}
              >
                매칭글 작성하기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}