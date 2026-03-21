'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

const INTRO_FEATURES = [
  { emoji: '📋', title: '통합회원 가입', desc: '서울시 공공서비스 이용을 위한 통합회원 계정이 필요합니다' },
  { emoji: '🔐', title: '본인인증', desc: '휴대폰 또는 아이핀으로 본인인증을 완료해야 합니다' },
  { emoji: '💳', title: '결제 수단', desc: '예약 확정 시 카드 또는 계좌이체로 결제합니다' },
];

const REGISTRATION_STEPS = [
  {
    step: 1,
    title: '가입 페이지 접속',
    desc: 'seoul.go.kr에서 일반회원 가입을 선택합니다',
    icon: '📱',
  },
  {
    step: 2,
    title: '약관 동의',
    desc: '필수 약관에 동의합니다',
    icon: '✅',
  },
  {
    step: 3,
    title: '본인인증',
    desc: '휴대폰 본인확인 또는 아이핀으로 인증합니다',
    icon: '🔐',
  },
  {
    step: 4,
    title: '회원정보 입력',
    desc: '아이디(중복확인 필수), 비밀번호(영문+숫자+특수문자), 이메일을 입력합니다',
    icon: '📝',
  },
];

const RESERVATION_STEPS = [
  {
    step: 1,
    title: '로그인',
    desc: 'yeyak.seoul.go.kr에서 통합회원 아이디로 로그인합니다',
    icon: '🔑',
  },
  {
    step: 2,
    title: '코트 선택',
    desc: '원하는 테니스장을 검색하거나 카테고리에서 선택합니다',
    icon: '🎾',
  },
  {
    step: 3,
    title: '날짜 선택',
    desc: '달력에서 예약 가능한 날짜(초록색)를 선택합니다',
    icon: '📅',
  },
  {
    step: 4,
    title: '시간 선택',
    desc: '원하는 시간대(보통 2시간 단위)를 선택합니다',
    icon: '⏰',
  },
  {
    step: 5,
    title: '결제',
    desc: '예약 확정 후 2시간 이내에 결제를 완료합니다',
    icon: '💳',
  },
];

const TIPS = [
  {
    title: '통합회원 필수',
    desc: '간편로그인(카카오·네이버)과 비회원으로는 예약이 불가합니다. 반드시 서울시 통합회원으로 가입하세요.',
  },
  {
    title: '접수 시작 알림 활용',
    desc: '서울 테니스 앱에서 코트별 접수 알림을 설정하면, 예약 접수가 시작될 때 푸시 알림을 받을 수 있습니다.',
  },
  {
    title: '결제 시간 주의',
    desc: '예약 후 2시간 이내에 결제를 완료하지 않으면 자동 취소됩니다.',
  },
  {
    title: '취소 규정 확인',
    desc: '이용일 2일 전 100% 환불, 1일 전 70% 환불, 당일 취소 시 환불 불가가 일반적입니다.',
  },
  {
    title: '야간·조조 조명료',
    desc: '일부 코트는 조조(06~07시)와 야간(19~22시)에 조명료(+30%)가 현장 결제됩니다.',
  },
];

export default function ReservationGuideContent() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🎾</div>
          <h1 className={`text-3xl font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
            예약 가이드
          </h1>
          <p className={`text-lg ${themeClass('text-black/80', 'text-gray-600')}`}>
            서울시 공공 테니스장 예약 방법을 알려드립니다
          </p>
        </div>

        <div className={`space-y-12 ${themeClass('text-black/80', 'text-gray-600')}`}>
          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">👋</span> 시작하기 전에
            </h2>
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
              <span className="text-2xl">👤</span> 통합회원 가입 방법
            </h2>
            <div className="space-y-4">
              {REGISTRATION_STEPS.map((step) => (
                <div
                  key={step.step}
                  className={`flex items-start gap-4 p-4 ${themeClass(
                    'bg-white border-2 border-black rounded-[6px]',
                    'bg-white border border-gray-200 rounded-lg'
                  )}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold ${themeClass(
                    'bg-black text-white',
                    'bg-blue-600 text-white'
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
              <span className="text-2xl">🗓️</span> 예약 방법
            </h2>
            <div className="space-y-4">
              {RESERVATION_STEPS.map((step) => (
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
              <span className="text-2xl">💡</span> 알아두면 좋은 팁
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
                href="/"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                )}`}
              >
                코트 둘러보기
              </Link>
              <Link
                href="/guide/school-courts"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-white text-black border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md hover:shadow-lg'
                )}`}
              >
                학교 테니스장 안내
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
