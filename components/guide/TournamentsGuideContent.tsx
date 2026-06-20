'use client';

import { useState, useCallback, useRef, useId } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import TournamentLifecycleDemo from '@/components/tournament/TournamentLifecycleDemo';

const FEATURE_DEMOS = [
  {
    id: 'create',
    emoji: '🏆',
    title: '대진표 만들기',
    desc: '대회명, 경기 종류, 스코어 형식을 설정하고 참가자를 등록하세요.',
  },
  {
    id: 'draw',
    emoji: '🎲',
    title: '대진 추첨',
    desc: '시드 배정 또는 랜덤 추첨으로 대진표를 자동 생성합니다.',
  },
  {
    id: 'live',
    emoji: '📊',
    title: '실시간 점수 입력',
    desc: '경기 결과를 입력하면 대진표가 실시간으로 업데이트됩니다.',
  },
  {
    id: 'share',
    emoji: '📤',
    title: '대진표 공유',
    desc: '카카오톡이나 링크로 대진표를 공유하고 모두가 실시간으로 확인합니다.',
  },
] as const;

type DemoId = (typeof FEATURE_DEMOS)[number]['id'];

const GUIDE_STEPS = [
  {
    step: 1,
    title: '대진표 생성',
    desc: '대회명, 형식(싱글 엘리미네이션 등), 경기 종류(단식/남복/여복/혼복/잡복), 스코어 방식을 설정합니다.',
    icon: '📝',
  },
  {
    step: 2,
    title: '참가자 등록',
    desc: '참가자 이름을 입력하고, 필요시 시드 번호를 지정합니다. 복식의 경우 파트너도 함께 등록합니다.',
    icon: '👥',
  },
  {
    step: 3,
    title: '대진 추첨',
    desc: '랜덤 또는 시드 방식으로 대진표를 생성합니다. 참가자 수에 맞게 bye가 자동 배치되며, 코트 수를 설정했다면 각 매치에 코트 번호가 자동 배정됩니다.',
    icon: '🎯',
  },
  {
    step: 4,
    title: '경기 진행',
    desc: '각 매치의 점수를 입력하면 승자가 자동으로 다음 라운드에 배치됩니다.',
    icon: '🎾',
  },
  {
    step: 5,
    title: '우승자 확정',
    desc: '모든 경기가 완료되면 우승자 경로가 빨간색으로 빛나며 대회가 종료됩니다.',
    icon: '🏅',
  },
];

const MATCH_TYPES = [
  { type: '단식', desc: '1:1 개인전' },
  { type: '남복', desc: '남자 2인 복식' },
  { type: '여복', desc: '여자 2인 복식' },
  { type: '혼복', desc: '남녀 혼합 복식' },
  { type: '잡복', desc: '성별 무관 랜덤 복식 (한국 동호회 문화)' },
];

const SCORING_FORMATS = [
  { format: '4게임', desc: '가장 빠른 형식. 동호회 월례대회에서 주로 사용' },
  { format: '6게임', desc: '한 세트. 클럽 대회 기본 형식' },
  { format: '8게임 프로세트', desc: '한 세트로 결판. 시간 제한 대회에 적합' },
  { format: '10포인트 타이브레이크', desc: '초고속 결판. 많은 참가자 소화 시' },
  { format: '3세트 매치', desc: '정식 경기. 결승전이나 중요 대회' },
];

const TIPS = [
  {
    title: '적절한 참가자 수',
    desc: '4, 8, 16, 32명 등 2의 거듭제곱이 이상적입니다. 그 외 인원은 bye(부전승)가 자동 배치됩니다.',
  },
  {
    title: '시드 활용',
    desc: '실력이 높은 참가자에게 시드를 부여하면 상위 시드끼리 일찍 만나는 것을 방지할 수 있습니다.',
  },
  {
    title: '노애드 스코어링',
    desc: '듀스 없이 진행하여 경기 시간을 단축할 수 있습니다. 동호회 대회에서 가장 많이 사용됩니다.',
  },
  {
    title: '대진표 공유',
    desc: '대회 시작 전에 대진표를 카카오톡으로 공유하면 참가자들이 미리 자신의 경기 순서를 확인할 수 있습니다.',
  },
  {
    title: '코트 번호 배정',
    desc: '사용 코트 수를 설정하면 대진 추첨 시 각 매치에 코트 번호가 자동 배정됩니다. 참가자들이 자신의 코트를 바로 확인할 수 있습니다.',
  },
];

export default function TournamentsGuideContent() {
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
          <div className="text-4xl mb-4">🏆</div>
          <h1 className={cn('text-3xl font-bold mb-3', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
            테니스 대진표 가이드
          </h1>
          <p className={cn('text-lg', themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400'))}>
            동호회 친선 경기부터 클럽 월례대회까지
          </p>
        </div>

        <div className={cn('space-y-12', themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400'))}>
          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">🎬</span> 대진표 진행 과정
            </h2>
            <p className="leading-relaxed mb-4">
              대진표가 만들어지고 경기가 진행되는 전체 과정을 확인해보세요.
            </p>
            <div className={cn(
              'p-4 rounded-lg',
              themeClass('bg-gray-50 dark:bg-slate-800 border-2 border-black/10 dark:border-slate-700', 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700')
            )}>
              <TournamentLifecycleDemo autoPlay />
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">✨</span> 주요 기능
            </h2>
            <p className="leading-relaxed mb-6">
              카드를 눌러 각 기능의 상세 설명을 확인해보세요.
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
                        {feature.id === 'create' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>대회 설정 예시</span>
                            <div className={cn('p-4 rounded-lg space-y-2 text-sm', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">대회명</span><span className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>3월 월례 친선대회</span></div>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">형식</span><span>싱글 엘리미네이션</span></div>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">종목</span><span>남복 (남자 복식)</span></div>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">스코어</span><span>4게임 (노애드)</span></div>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">참가자</span><span>8팀</span></div>
                              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">사용 코트</span><span>3면 (자동 배정)</span></div>
                            </div>
                          </div>
                        )}
                        {feature.id === 'draw' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>추첨 방식</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className={cn('p-3 rounded-lg', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                                <div className={cn('font-bold text-sm mb-1', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>🎲 랜덤 추첨</div>
                                <p className="text-xs">모든 참가자를 무작위로 배치합니다. 완전 공정한 방식.</p>
                              </div>
                              <div className={cn('p-3 rounded-lg', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                                <div className={cn('font-bold text-sm mb-1', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>🎯 시드 배정</div>
                                <p className="text-xs">상위 시드가 일찍 만나지 않도록 대진표 상하단에 배치합니다.</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {feature.id === 'live' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>점수 입력 예시</span>
                            <div className={cn('p-4 rounded-lg', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                              <div className={cn('text-sm font-bold mb-3 text-center', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>1라운드 - 매치 1</div>
                              <div className="flex items-center justify-center gap-4 mb-3">
                                <div className="text-center">
                                  <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>김철수</div>
                                  <div className={cn('text-2xl font-black mt-1', themeClass('text-black dark:text-slate-100', 'text-green-700'))}>4</div>
                                </div>
                                <div className="text-gray-400 dark:text-slate-500 text-sm">vs</div>
                                <div className="text-center">
                                  <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>이영희</div>
                                  <div className={cn('text-2xl font-black mt-1', themeClass('text-black dark:text-slate-100', 'text-gray-500 dark:text-slate-400'))}>2</div>
                                </div>
                              </div>
                              <div className={cn('text-center text-xs px-3 py-1 rounded-full inline-block', themeClass('bg-green-200 text-green-800 border border-black font-bold', 'bg-green-100 text-green-700'))}>
                                김철수 승리 → 다음 라운드 자동 진출
                              </div>
                            </div>
                          </div>
                        )}
                        {feature.id === 'share' && (
                          <div className="space-y-3">
                            <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded', themeClass('bg-black text-white', 'bg-red-100 text-red-700'))}>공유 방법</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className={cn('p-3 rounded-lg flex items-center gap-3', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                                <span className="text-2xl">💬</span>
                                <div>
                                  <div className={cn('font-bold text-sm', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>카카오톡 공유</div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">대진표 미리보기와 함께 전송</p>
                                </div>
                              </div>
                              <div className={cn('p-3 rounded-lg flex items-center gap-3', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8]', 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700'))}>
                                <span className="text-2xl">🔗</span>
                                <div>
                                  <div className={cn('font-bold text-sm', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>링크 공유</div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">공유 링크로 실시간 확인</p>
                                </div>
                              </div>
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
              {GUIDE_STEPS.map((step) => (
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
                      themeClass('bg-black text-white', 'bg-red-600 text-white')
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
              <span className="text-2xl">🎾</span> 경기 종류
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATCH_TYPES.map((mt) => (
                <div
                  key={mt.type}
                  className={cn(
                    'p-3',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[6px]',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg'
                    )
                  )}
                >
                  <div className={cn('font-bold text-sm mb-1', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>{mt.type}</div>
                  <p className="text-xs">{mt.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">📋</span> 스코어 형식
            </h2>
            <div className="space-y-2">
              {SCORING_FORMATS.map((sf) => (
                <div
                  key={sf.format}
                  className={cn(
                    'flex items-start gap-3 p-3',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[6px]',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg'
                    )
                  )}
                >
                  <span className={cn('inline-block text-xs font-bold px-2 py-1 rounded shrink-0', themeClass('bg-yellow-200 border border-black', 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'))}>{sf.format}</span>
                  <p className="text-sm">{sf.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={cn('text-xl font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              <span className="text-2xl">💡</span> 대진표 팁
            </h2>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✓</span>
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
                href="/tournaments"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-black text-white border-2 border-black dark:border-[#f1f3f8] hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8]',
                    'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                  )
                )}
              >
                대진표 둘러보기
              </Link>
              <Link
                href="/tournaments/new"
                className={cn(
                  'px-6 py-3 rounded-lg text-center font-bold transition-all',
                  themeClass(
                    'bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-2 border-black dark:border-[#f1f3f8] hover:bg-gray-100 dark:hover:bg-slate-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8]',
                    'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow'
                  )
                )}
              >
                대진표 만들기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
