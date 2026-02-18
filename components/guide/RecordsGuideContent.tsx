'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

const INTRO_FEATURES = [
  { emoji: '📝', title: '경기 기록', desc: '날짜, 장소, 스코어, 상대방 정보를 상세하게 기록하세요.' },
  { emoji: '📊', title: '통계 분석', desc: '승률, 월별 활동량, 코트별 성적을 자동으로 분석해드립니다.' },
  { emoji: '🤝', title: '상대 관리', desc: '자주 만나는 상대와의 전적을 관리하고 실력을 비교해보세요.' },
];

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

const STATS_FEATURES = [
  { title: '승률 분석', desc: '전체 승률 및 경기 유형별(단식/복식) 승률을 확인하세요.' },
  { title: '월별 추이', desc: '월별 경기 수와 승리 횟수를 그래프로 확인하여 활동량을 파악하세요.' },
  { title: '코트별 성적', desc: '어떤 코트에서 승률이 높은지, 자주 가는 코트는 어디인지 분석해드립니다.' },
  { title: '최근 전적', desc: '최근 5경기의 승패 흐름을 한눈에 파악하세요.' },
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

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h1 className={`text-3xl font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
            경기 기록 가이드
          </h1>
          <p className={`text-lg ${themeClass('text-black/80', 'text-gray-600')}`}>
            나의 테니스 실력을 체계적으로 관리하는 방법
          </p>
        </div>

        <div className={`space-y-12 ${themeClass('text-black/80', 'text-gray-600')}`}>
          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">👋</span> 소개
            </h2>
            <p className="leading-relaxed mb-6">
              테니스 실력 향상의 첫걸음은 자신의 경기를 복기하는 것입니다.
              서울 테니스의 <strong>경기 기록</strong> 기능을 통해 승패뿐만 아니라
              경기 내용, 코트 환경, 상대방 스타일까지 꼼꼼하게 기록하고 분석해보세요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {INTRO_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`p-4 ${themeClass(
                    'bg-white border-2 border-black rounded-[6px] shadow-[2px_2px_0px_0px_#000]',
                    'bg-gray-50 border border-gray-200 rounded-lg'
                  )}`}
                >
                  <div className="text-2xl mb-2">{feature.emoji}</div>
                  <div className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
                    {feature.title}
                  </div>
                  <p className="text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">🚀</span> 시작하기
            </h2>
            <div className={`p-5 rounded-lg ${themeClass('bg-blue-50 border-2 border-black', 'bg-blue-50 border border-blue-100')}`}>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>로그인</strong>: 카카오 또는 구글 계정으로 로그인합니다.
                </li>
                <li>
                  <strong>프로필 설정</strong>: 구력, NTRP, 주손 등 나의 테니스 프로필을 설정합니다.
                </li>
                <li>
                  <strong>기록 시작</strong>: 메뉴의 <span className="font-bold text-blue-600">경기 기록</span> 탭으로 이동하여 첫 기록을 남겨보세요.
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
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
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold ${themeClass(
                    'bg-black text-white',
                    'bg-green-600 text-white'
                  )}`}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
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
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">📈</span> 통계 활용
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STATS_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`p-4 ${themeClass(
                    'bg-gray-50 border-2 border-black rounded-[6px]',
                    'bg-gray-50 rounded-lg'
                  )}`}
                >
                  <h3 className={`font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">💡</span> 활용 팁
            </h2>
            <ul className="space-y-3">
              {TIPS.map((tip) => (
                <li key={tip.title} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span>
                    <strong className={themeClass('text-black', 'text-gray-900')}>{tip.title}</strong>
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
