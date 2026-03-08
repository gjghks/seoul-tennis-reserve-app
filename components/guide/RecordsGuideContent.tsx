'use client';

import { useState, useEffect, useCallback, useRef, useId } from 'react';
import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { buildSmoothPath } from '@/lib/utils/svgPath';
import ScoreInput from '@/components/records/ScoreInput';
import OpponentHistory from '@/components/records/OpponentHistory';
import type { MatchScore, MatchResult } from '@/lib/constants/tennis';
import {
  DEMO_SCORE_INITIAL,
  SCORE_ANIMATION_STEPS,
  DEMO_STATS,
  DEMO_OPPONENTS,
  DEMO_COURTS,
  DEMO_TREND,
} from '@/lib/mockData/guideExamples';

const FEATURE_DEMOS = [
  {
    id: 'score',
    emoji: '📝',
    title: '간편한 스코어 기록',
    desc: '세트별 스코어를 직관적으로 입력하세요. 타이브레이크도 한 번에!',
  },
  {
    id: 'stats',
    emoji: '📊',
    title: '승률 데이터 분석',
    desc: '내 실력을 숫자로 확인하세요. 승률, 전적, 비용까지 자동 분석.',
  },
  {
    id: 'opponent',
    emoji: '🤝',
    title: '상대 전적 관리',
    desc: '라이벌과의 승부를 기록하고 전적을 한눈에 비교하세요.',
  },
  {
    id: 'court',
    emoji: '🏟️',
    title: '코트별 기록',
    desc: '어떤 코트에서 승률이 높은지, 자주 가는 곳은 어디인지 분석해드립니다.',
  },
] as const;

type DemoId = (typeof FEATURE_DEMOS)[number]['id'];

const RECORD_STEPS = [
  {
    step: 1,
    title: '경기 유형 선택',
    desc: '단식, 복식, 혼합복식 중 선택하세요.',
    icon: '🎾',
  },
  {
    step: 2,
    title: '스코어 입력',
    desc: '세트별 스코어를 입력하세요. (예: 6-4, 7-6(5))',
    icon: '🔢',
  },
  {
    step: 3,
    title: '코트 및 상대 정보',
    desc: '경기한 코트와 상대방 정보를 입력하여 나중에 분석할 수 있습니다.',
    icon: '📍',
  },
  {
    step: 4,
    title: '부가 정보',
    desc: '코트 비용, 메모, 사진을 추가하여 추억을 남기세요.',
    icon: '📸',
  },
];

const TIPS = [
  {
    title: '코트 상세에서 바로 기록',
    desc: '테니스장 상세 페이지에서 "기록하기" 버튼을 누르면 코트 정보가 자동으로 입력됩니다.',
  },
  {
    title: '즐겨찾기 활용',
    desc: '자주 가는 코트를 즐겨찾기 해두면 기록할 때 더 빠르게 선택할 수 있습니다.',
  },
  {
    title: '상대방 프로필',
    desc: '상대방의 레벨(NTRP)과 스타일을 메모해두면 다음 경기 전략을 세우는 데 도움이 됩니다.',
  },
];

export default function RecordsGuideContent() {
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
        className={`max-w-3xl mx-auto ${themeClass(
          'bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8',
          'bg-white rounded-xl shadow-lg p-8'
        )}`}
      >
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h1
            className={`text-3xl font-bold mb-3 ${themeClass(
              'text-black',
              'text-gray-900'
            )}`}
          >
            경기 기록 가이드
          </h1>
          <p
            className={`text-lg ${themeClass('text-black/80', 'text-gray-600')}`}
          >
            나의 테니스 실력을 체계적으로 관리하는 방법
          </p>
        </div>

        <div
          className={`space-y-12 ${themeClass(
            'text-black/80',
            'text-gray-600'
          )}`}
        >
          <section>
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass(
                'text-black',
                'text-gray-900'
              )}`}
            >
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
                          'bg-white border-2 border-black rounded-[6px] shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-[1px]',
                          'bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300'
                        ),
                        isOpen &&
                          themeClass(
                            'shadow-[4px_4px_0px_0px_#000] -translate-y-[1px] bg-yellow-50',
                            'bg-white border-green-300 shadow-md'
                          )
                      )}
                    >
                      <div className="text-2xl shrink-0">{feature.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-bold mb-0.5 ${themeClass(
                            'text-black',
                            'text-gray-900'
                          )}`}
                        >
                          {feature.title}
                        </div>
                        <p className="text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                      <div
                        className={cn(
                          'shrink-0 text-xs font-bold transition-transform duration-300',
                          themeClass('text-black', 'text-gray-400'),
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
                            'bg-gray-50 border-2 border-t-0 border-black rounded-[6px]',
                            'bg-white border border-gray-200 rounded-lg shadow-inner'
                          )
                        )}
                      >
                        {feature.id === 'score' && <ScoreDemo isOpen={isOpen} />}
                        {feature.id === 'stats' && <StatsDemo isOpen={isOpen} />}
                        {feature.id === 'opponent' && <OpponentDemo isOpen={isOpen} />}
                        {feature.id === 'court' && <CourtDemo isOpen={isOpen} />}
                      </div>
                    </section>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass(
                'text-black',
                'text-gray-900'
              )}`}
            >
              <span className="text-2xl">🚀</span> 시작하기
            </h2>
            <div
              className={`p-5 rounded-lg ${themeClass(
                'bg-blue-50 border-2 border-black',
                'bg-blue-50 border border-blue-100'
              )}`}
            >
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>로그인</strong>: 카카오 또는 구글 계정으로
                  로그인합니다.
                </li>
                <li>
                  <strong>프로필 설정</strong>: 구력, NTRP, 주손 등 나의 테니스
                  프로필을 설정합니다.
                </li>
                <li>
                  <strong>기록 시작</strong>: 메뉴의{' '}
                  <span className="font-bold text-blue-600">경기 기록</span>{' '}
                  탭으로 이동하여 첫 기록을 남겨보세요.
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass(
                'text-black',
                'text-gray-900'
              )}`}
            >
              <span className="text-2xl">✍️</span> 기록 작성법
            </h2>
            <div className="space-y-4">
              {RECORD_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={`flex items-start gap-4 p-4 ${themeClass(
                    'bg-white border-2 border-black rounded-[6px]',
                    'bg-white border border-gray-200 rounded-lg'
                  )}`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold ${themeClass(
                      'bg-black text-white',
                      'bg-green-600 text-white'
                    )}`}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h3
                      className={`font-bold mb-1 ${themeClass(
                        'text-black',
                        'text-gray-900'
                      )}`}
                    >
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
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass(
                'text-black',
                'text-gray-900'
              )}`}
            >
              <span className="text-2xl">💡</span> 활용 팁
            </h2>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/records/new"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                )}`}
              >
                기록 작성하기
              </Link>
              <Link
                href="/records"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-white text-black border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow'
                )}`}
              >
                나의 기록 보기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ScoreDemo({ isOpen }: { isOpen: boolean }) {
  const themeClass = useThemeClass();
  const [score, setScore] = useState<MatchScore>(DEMO_SCORE_INITIAL);
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runAnimation = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setScore({ sets: [{ my: 0, opp: 0 }] });
    setAnimating(true);
    setDone(false);

    SCORE_ANIMATION_STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setScore(step.score);
        if (i === SCORE_ANIMATION_STEPS.length - 1) {
          setAnimating(false);
          setDone(true);
        }
      }, step.delay);
      timersRef.current.push(timer);
    });
  }, []);

   useEffect(() => {
     if (isOpen && !done) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       runAnimation();
     }
     if (!isOpen && done) {
       setDone(false);
     }
     return () => {
       timersRef.current.forEach(clearTimeout);
       timersRef.current = [];
     };
   }, [isOpen, done, runAnimation]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-bold px-2 py-1 rounded',
            themeClass('bg-black text-white', 'bg-green-100 text-green-700')
          )}
        >
          {animating ? '자동 입력 중...' : '직접 수정해보세요'}
        </span>
        {done && (
          <button
            type="button"
            onClick={runAnimation}
            className={cn(
              'text-xs font-bold px-2 py-1 rounded transition-colors',
              themeClass(
                'bg-white border border-black hover:bg-gray-100',
                'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )
            )}
          >
            다시 보기 🔄
          </button>
        )}
      </div>
      <ScoreInput score={score} onChange={setScore} />
    </div>
  );
}

function StatsDemo({ isOpen }: { isOpen: boolean }) {
  const themeClass = useThemeClass();
  const { ref, inView } = useInView({ once: false });
  const enabled = isOpen && inView;

  const animTotal = useCountUp(DEMO_STATS.total_matches, enabled);
  const animWinRate = useCountUp(DEMO_STATS.win_rate, enabled);
  const animAvgCost = useCountUp(DEMO_STATS.avg_cost, enabled, 1000);

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

  const resultCounts: Partial<Record<MatchResult, number>> = {};
  const recentFormItems = DEMO_STATS.recent_form.map((result) => {
    resultCounts[result] = (resultCounts[result] || 0) + 1;
    return {
      result,
      key: `demo-${result}-${resultCounts[result]}`,
    };
  });

  return (
    <div ref={ref} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            'text-xs font-bold px-2 py-1 rounded',
            themeClass('bg-black text-white', 'bg-green-100 text-green-700')
          )}
        >
          예시 데이터
        </span>
        {DEMO_STATS.current_streak && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
            🔥 {DEMO_STATS.current_streak.count}연승 중!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '전체 경기', value: `${animTotal}전` },
          { label: '승률', value: `${animWinRate}%`, className: 'text-green-600' },
          {
            label: '승/패',
            value: `${DEMO_STATS.wins}승 ${DEMO_STATS.losses}패 ${DEMO_STATS.draws}무`,
            className: 'text-sm',
          },
          {
            label: '평균 비용',
            value: `${animAvgCost.toLocaleString('ko-KR')}원`,
          },
        ].map((item, i) => (
          <div
            key={item.label}
            className={cn(
              enabled ? 'anim-fade-up' : 'opacity-0',
              themeClass(
                'flex flex-col items-center justify-center rounded-[5px] border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000]',
                'flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-3 shadow-sm'
              )
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="mb-1 text-[10px] font-bold text-gray-500">
              {item.label}
            </span>
            <span className={cn('text-base font-bold', item.className)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold text-gray-500">최근 전적</h4>
        <div className="flex gap-2">
          {recentFormItems.map(({ result, key }, i) => (
            <div
              key={key}
              className={cn(
                'h-6 w-6 rounded-full border-2 border-white shadow-sm',
                getResultColor(result),
                enabled ? 'anim-pop-in' : 'opacity-0 scale-0'
              )}
              style={{ animationDelay: `${i * 60}ms` }}
              title={result === 'win' ? '승리' : result === 'loss' ? '패배' : '무승부'}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-500">월별 활동</h4>
        {DEMO_STATS.monthly_activity.map((monthData, i) => {
          const maxTotal = Math.max(
            ...DEMO_STATS.monthly_activity.map((m) => m.total)
          );
          const widthPercent = (monthData.total / maxTotal) * 100;
          const winPercent = (monthData.wins / monthData.total) * 100;

          return (
            <div key={monthData.month} className="flex items-center gap-3">
              <span className="w-8 text-[10px] font-medium text-gray-500">
                {monthData.month}
              </span>
              <div className="flex-1">
                <div
                  className="relative h-5 rounded bg-gray-100"
                  style={{
                    width: enabled ? `${widthPercent}%` : '0%',
                    transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-l bg-green-500/80"
                    style={{ width: `${winPercent}%` }}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-600">
                    {monthData.total}경기
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MiniTrendChart enabled={enabled} />
    </div>
  );
}

const MINI_W = 280;
const MINI_H = 100;
const MINI_PX = 10;
const MINI_PT = 14;
const MINI_PB = 8;
const MINI_PLOT_LEFT = MINI_PX;
const MINI_PLOT_RIGHT = MINI_W - MINI_PX;
const MINI_PLOT_TOP = MINI_PT;
const MINI_PLOT_BOTTOM = MINI_H - MINI_PB;
const MINI_PLOT_W = MINI_PLOT_RIGHT - MINI_PLOT_LEFT;
const MINI_PLOT_H = MINI_PLOT_BOTTOM - MINI_PLOT_TOP;

function miniPlotXY(winRate: number, index: number, count: number) {
  const x = count === 1 ? MINI_PLOT_LEFT + MINI_PLOT_W / 2 : MINI_PLOT_LEFT + (index / (count - 1)) * MINI_PLOT_W;
  const y = MINI_PLOT_BOTTOM - (Math.max(0, Math.min(100, winRate)) / 100) * MINI_PLOT_H;
  return { x, y };
}



function MiniTrendChart({ enabled }: { enabled: boolean }) {
  const themeClass = useThemeClass();
  const gradId = useId();

  const plotPoints = DEMO_TREND.map((item, i) => ({
    ...item,
    ...miniPlotXY(item.winRate, i, DEMO_TREND.length),
  }));

  const linePath = buildSmoothPath(plotPoints);
  const last = plotPoints[plotPoints.length - 1];
  const first = plotPoints[0];
  const areaPath = `${linePath} L ${last.x} ${MINI_PLOT_BOTTOM} L ${first.x} ${MINI_PLOT_BOTTOM} Z`;

  const lineColor = themeClass('#000000', '#22c55e');
  const areaColor = themeClass('#a3e635', '#22c55e');

  return (
    <div
      className={themeClass(
        'rounded-[5px] border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_#000]',
        'rounded-xl border border-gray-200 bg-white p-3 shadow-sm'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-500">실력 추이</h4>
        <span className="text-[10px] font-bold text-green-600">상승 중 ↑</span>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${MINI_W} / ${MINI_H}` }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${MINI_W} ${MINI_H}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`${gradId}-mini-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={areaColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect x={MINI_PLOT_LEFT} y={MINI_PLOT_TOP} width={MINI_PLOT_W} height={MINI_PLOT_H} rx="3" fill="#f9fafb" />

          {[25, 50, 75].map((pct) => {
            const y = MINI_PLOT_BOTTOM - (pct / 100) * MINI_PLOT_H;
            return (
              <line
                key={pct}
                x1={MINI_PLOT_LEFT}
                y1={y}
                x2={MINI_PLOT_RIGHT}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}

          <path
            d={areaPath}
            fill={`url(#${gradId}-mini-area)`}
            style={{
              opacity: enabled ? 1 : 0,
              transition: 'opacity 0.8s ease 0.4s',
            }}
          />

          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={enabled ? 0 : 1}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />

          {plotPoints.map((point, i) => {
            const isLast = i === plotPoints.length - 1;
            return (
              <g
                key={point.month}
                style={{
                  opacity: enabled ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  transitionDelay: '1s',
                }}
              >
                {isLast && (
                  <circle cx={point.x} cy={point.y} r="7" fill={areaColor} opacity="0.15" />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isLast ? 3.5 : 3}
                  fill={isLast ? areaColor : '#ffffff'}
                  stroke={isLast ? lineColor : '#d1d5db'}
                  strokeWidth={isLast ? 2 : 1}
                />
                <text
                  x={point.x}
                  y={point.y - 8}
                  textAnchor="middle"
                  fill={themeClass('#000000', '#374151')}
                  fontSize="8"
                  fontWeight="700"
                >
                  {point.winRate}%
                </text>
                <title>{`${point.winRate}% (${point.total}경기)`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function OpponentDemo({ isOpen }: { isOpen: boolean }) {
  const themeClass = useThemeClass();

  return (
    <div className="space-y-3">
      <span
        className={cn(
          'inline-block text-xs font-bold px-2 py-1 rounded',
          themeClass('bg-black text-white', 'bg-green-100 text-green-700')
        )}
      >
        예시 데이터
      </span>
      {isOpen && <OpponentHistory opponents={DEMO_OPPONENTS} />}
    </div>
  );
}

function CourtDemo({ isOpen }: { isOpen: boolean }) {
  const themeClass = useThemeClass();
  const { ref, inView } = useInView({ once: false });
  const enabled = isOpen && inView;

  return (
    <div ref={ref} className="space-y-3">
      <span
        className={cn(
          'inline-block text-xs font-bold px-2 py-1 rounded',
          themeClass('bg-black text-white', 'bg-green-100 text-green-700')
        )}
      >
        예시 데이터
      </span>

      {DEMO_COURTS.map((court, i) => (
        <div
          key={court.name}
          className={cn(
            'p-3 transition-all',
            enabled ? 'anim-fade-up' : 'opacity-0',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]',
              'bg-white border border-gray-200 rounded-lg shadow-sm'
            ),
            i === 0 &&
              themeClass(
                'border-[#22c55e] shadow-[2px_2px_0px_0px_#22c55e]',
                'border-green-300'
              )
          )}
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {i === 0 && <span className="text-sm">👑</span>}
              <span
                className={cn(
                  'font-bold text-sm truncate',
                  themeClass('text-black', 'text-gray-900')
                )}
              >
                {court.name}
              </span>
            </div>
            <span
              className={cn(
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                themeClass(
                  'bg-black text-white',
                  'bg-gray-100 text-gray-600'
                )
              )}
            >
              {court.count}회 방문
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-gray-500 w-12">
              승률 {court.winRate}%
            </span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  court.winRate >= 60 ? 'bg-green-500' : 'bg-yellow-500'
                )}
                style={{
                  width: enabled ? `${court.winRate}%` : '0%',
                  transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100 + 200}ms`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
