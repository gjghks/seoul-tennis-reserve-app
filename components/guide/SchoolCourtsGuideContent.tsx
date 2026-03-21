'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

const SCHOOL_COURTS = [
  { district: '강남구', name: '봉은중학교', level: '중' },
  { district: '강북구', name: '번동중학교', level: '중' },
  { district: '강서구', name: '서울발산초등학교', level: '초' },
  { district: '강서구', name: '서울송정초등학교', level: '초' },
  { district: '관악구', name: '당곡고등학교', level: '고' },
  { district: '노원구', name: '상계제일중학교', level: '중' },
  { district: '도봉구', name: '서울신화초등학교', level: '초' },
  { district: '동대문구', name: '서울반도체고등학교', level: '고' },
  { district: '동대문구', name: '전농중학교', level: '중' },
  { district: '동작구', name: '강현중학교', level: '중' },
  { district: '마포구', name: '서울여자고등학교', level: '고' },
  { district: '송파구', name: '서울토성초등학교', level: '초' },
  { district: '송파구', name: '서울풍납초등학교', level: '초' },
  { district: '송파구', name: '창덕여자고등학교', level: '고' },
  { district: '양천구', name: '금옥여자고등학교', level: '고' },
  { district: '양천구', name: '서울금융고등학교', level: '고' },
  { district: '양천구', name: '양강중학교', level: '중' },
  { district: '용산구', name: '한강중학교', level: '중' },
  { district: '종로구', name: '청운중학교', level: '중' },
];

const INTRO_FEATURES = [
  { emoji: '🏫', title: '학교체육시설 개방', desc: '서울시교육청이 운영하는 학교시설 민간개방 프로그램입니다' },
  { emoji: '🎾', title: '테니스장 19개교', desc: '서울 내 19개 초·중·고등학교가 테니스장을 일반에 개방합니다' },
  { emoji: '💰', title: '저렴한 이용료', desc: '학교장이 결정하며, 공공 테니스장 대비 저렴한 경우가 많습니다' },
];

const RESERVATION_STEPS = [
  {
    step: 1,
    title: '예약시스템 접속',
    desc: '서울시교육청 학교시설 예약시스템(crs.sen.go.kr)에 접속합니다',
    icon: '🌐',
  },
  {
    step: 2,
    title: '회원가입',
    desc: '일반 시민도 회원가입이 가능합니다. 본인인증이 필요합니다',
    icon: '👤',
  },
  {
    step: 3,
    title: '시설 검색',
    desc: '시설물 종류에서 "테니스장"을 선택하고, 희망 지역과 날짜를 지정하여 검색합니다',
    icon: '🔍',
  },
  {
    step: 4,
    title: '예약 신청',
    desc: '원하는 학교와 시간대를 선택하여 예약을 신청합니다',
    icon: '📝',
  },
  {
    step: 5,
    title: '학교장 승인 대기',
    desc: '예약 신청 후 학교장의 승인을 기다립니다. 자동 승인이 아닌 점에 유의하세요',
    icon: '⏳',
  },
  {
    step: 6,
    title: '사용료 납부 및 이용',
    desc: '승인 후 사용료를 납부하고 해당 시간에 방문하여 이용합니다',
    icon: '✅',
  },
];

const TIPS = [
  {
    title: '이용 가능 시간',
    desc: '학교 수업이 없는 방과 후(평일 저녁), 주말, 방학 기간에 이용 가능합니다. 학교별로 개방 시간이 다릅니다.',
  },
  {
    title: '예약 가능 기간',
    desc: '현재일로부터 7일 후 ~ 60일(2개월) 이내의 날짜를 예약할 수 있습니다.',
  },
  {
    title: '사용료 감면',
    desc: '해당 자치구 주민 단체로 6개월 이상 장기 사용 시 60% 감면, 65세 이상 노인단체 50% 감면이 적용됩니다.',
  },
  {
    title: '학교별 문의',
    desc: '예약 시스템에서 학교 연락처를 확인할 수 있습니다. 개방 여부가 불확실한 경우 학교에 직접 전화 문의가 가장 정확합니다.',
  },
  {
    title: '개방 변동 가능성',
    desc: '학교 행사, 시설 보수 등의 이유로 개방이 일시 중단될 수 있습니다. 방문 전 반드시 예약 확정 여부를 확인하세요.',
  },
];

const LEVEL_BADGE: Record<string, { label: string; color: string; neoColor: string }> = {
  '초': { label: '초등학교', color: 'bg-green-100 text-green-700', neoColor: 'bg-green-200 text-green-900 border border-green-400' },
  '중': { label: '중학교', color: 'bg-blue-100 text-blue-700', neoColor: 'bg-blue-200 text-blue-900 border border-blue-400' },
  '고': { label: '고등학교', color: 'bg-purple-100 text-purple-700', neoColor: 'bg-purple-200 text-purple-900 border border-purple-400' },
};

export default function SchoolCourtsGuideContent() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <div className="mb-10 text-center">
          <div className="text-4xl mb-4">🏫</div>
          <h1 className={`text-3xl font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
            학교 테니스장 이용 가이드
          </h1>
          <p className={`text-lg ${themeClass('text-black/80', 'text-gray-600')}`}>
            서울시 학교체육시설 개방 프로그램을 통해 학교 테니스장을 이용할 수 있습니다
          </p>
        </div>

        <div className={`space-y-12 ${themeClass('text-black/80', 'text-gray-600')}`}>
          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">👋</span> 학교 테니스장이란?
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
              <span className="text-2xl">📋</span> 테니스장 개방 학교 ({SCHOOL_COURTS.length}개교)
            </h2>
            <p className="text-sm mb-4">
              2025년 9월 기준, 서울시교육청 민간개방 학교시설물 현황 데이터 기준입니다.
            </p>
            <div className={`overflow-x-auto ${themeClass(
              'border-2 border-black rounded-[6px]',
              'border border-gray-200 rounded-lg'
            )}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={themeClass('bg-black text-white', 'bg-gray-100 text-gray-700')}>
                    <th className="text-left px-4 py-3 font-bold">자치구</th>
                    <th className="text-left px-4 py-3 font-bold">학교명</th>
                    <th className="text-center px-4 py-3 font-bold">학교급</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHOOL_COURTS.map((school, idx) => {
                    const badge = LEVEL_BADGE[school.level];
                    return (
                      <tr
                        key={`${school.district}-${school.name}`}
                        className={`${idx % 2 === 0
                          ? themeClass('bg-white', 'bg-white')
                          : themeClass('bg-gray-50', 'bg-gray-50')
                        } ${themeClass('border-t border-black/10', 'border-t border-gray-100')}`}
                      >
                        <td className="px-4 py-3">{school.district}</td>
                        <td className={`px-4 py-3 font-medium ${themeClass('text-black', 'text-gray-900')}`}>
                          {school.name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${themeClass(badge.neoColor, badge.color)}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

          <section>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${themeClass('text-black', 'text-gray-900')}`}>
              <span className="text-2xl">🔗</span> 참고 링크
            </h2>
            <div className="space-y-3">
              {[
                { label: '서울시교육청 학교시설 예약시스템 (CRS)', url: 'http://crs.sen.go.kr', desc: '학교 테니스장 검색·예약 통합 포털' },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 transition-all ${themeClass(
                    'bg-white border-2 border-black rounded-[6px] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000]',
                    'bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100'
                  )}`}
                >
                  <div className={`font-bold ${themeClass('text-black', 'text-blue-600')}`}>
                    {link.label} ↗
                  </div>
                  <p className="text-sm mt-1">{link.desc}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="http://crs.sen.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                )}`}
              >
                학교시설 예약시스템 바로가기
              </a>
              <Link
                href="/"
                className={`px-6 py-3 rounded-lg text-center font-bold transition-all ${themeClass(
                  'bg-white text-black border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md hover:shadow-lg'
                )}`}
              >
                공공 코트 둘러보기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
