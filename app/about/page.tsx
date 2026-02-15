'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import FeedbackModal from '@/components/feedback/FeedbackModal';

const CORE_FEATURES = [
  { emoji: '🏠', title: '홈', desc: '자치구별 테니스장 목록·지도 뷰, 인기 랭킹, 즐겨찾기 현황을 한 화면에서' },
  { emoji: '📅', title: '오늘 예약', desc: '오늘 바로 예약할 수 있는 테니스장만 모아 빠르게 탐색' },
  { emoji: '📊', title: '구별 비교', desc: '자치구별 코트 수·예약률·평점을 한눈에 비교' },
  { emoji: '📈', title: '경쟁률', desc: '시간대·요일별 예약 경쟁률 추이로 빈 시간대 공략' },
  { emoji: '🗓️', title: '캘린더', desc: '날짜별 예약 현황을 캘린더에서 직관적으로 확인' },
] as const;

const COURT_DETAIL_FEATURES = [
  { title: '실시간 예약 상태', desc: '접수중·마감 등 예약 상태를 즉시 확인하고 바로 예약 페이지로 이동' },
  { title: '이용 후기 & 별점', desc: '실제 이용자들의 리뷰와 사진으로 코트 선택에 참고' },
  { title: '실시간 날씨', desc: '코트 위치 기반 기온·강수 정보 제공, 실외 코트는 우천 주의 안내' },
  { title: '실시간 미세먼지', desc: '자치구별 대기질(PM2.5·PM10) 등급 및 수치, 나쁨 시 실내 코트 안내' },
  { title: '비슷한 테니스장 추천', desc: '같은 장소·인근 지역의 대안 코트를 자동 추천' },
  { title: '전화번호 바로 연결', desc: '시설 연락처를 탭 한 번으로 전화 연결' },
  { title: '카카오 지도', desc: '테니스장 위치를 지도에서 한눈에 확인' },
] as const;

const CONVENIENCE_FEATURES = [
  { title: '즐겨찾기', desc: '자주 이용하는 테니스장을 저장하고 홈에서 바로 확인' },
  { title: '푸시 알림', desc: '즐겨찾기한 코트의 예약이 시작되면 알림으로 안내' },
  { title: '자치구 가이드', desc: '지역별 테니스장 특징·접근성·주차 등 상세 가이드' },
  { title: '인기 랭킹 TOP 5', desc: '평점·즐겨찾기·경쟁률을 종합한 인기 테니스장 랭킹' },
  { title: '앱 설치 (PWA)', desc: '홈 화면에 추가하여 앱처럼 사용' },
  { title: '테마 전환', desc: '미니멀·네오브루탈리즘 두 가지 디자인 테마 지원' },
] as const;

export default function AboutPage() {
  const themeClass = useThemeClass();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <h1 className={`text-2xl font-bold mb-6 ${themeClass('text-black', 'text-gray-900')}`}>
          서울 테니스 소개
        </h1>

        <div className={`space-y-8 ${themeClass('text-black/80', 'text-gray-600')}`}>
          {/* 서울 테니스란? */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              서울 테니스란?
            </h2>
            <p className="leading-relaxed">
              서울 테니스는 서울시 25개 자치구의 공공 테니스장 예약 현황을 실시간으로 제공하는 서비스입니다.
              서울시 공공서비스예약 시스템, 기상청, 서울시 대기질 데이터를 기반으로, 예약 가능한 테니스장을 한눈에 확인하고
              바로 예약할 수 있습니다.
            </p>
          </section>

          {/* 핵심 기능 */}
          <section>
            <h2 className={`text-lg font-bold mb-4 ${themeClass('text-black', 'text-gray-900')}`}>
              핵심 기능
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CORE_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className={`p-4 ${themeClass(
                    'bg-white border-2 border-black rounded-[6px] shadow-[2px_2px_0px_0px_#000]',
                    'bg-gray-50 border border-gray-200 rounded-lg'
                  )}`}
                >
                  <div className={`text-base font-bold mb-1 ${themeClass('text-black', 'text-gray-900')}`}>
                    <span className="mr-1.5">{feature.emoji}</span>{feature.title}
                  </div>
                  <p className="text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 코트 상세 정보 */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              코트 상세 정보
            </h2>
            <ul className="space-y-2.5">
              {COURT_DETAIL_FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>{feature.title}</strong> — {feature.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 편의 기능 */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              편의 기능
            </h2>
            <ul className="space-y-2.5">
              {CONVENIENCE_FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">✓</span>
                  <span><strong>{feature.title}</strong> — {feature.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 데이터 출처 */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              데이터 출처
            </h2>
            <p className="leading-relaxed mb-3">
              본 서비스는 다음 공공데이터를 활용하여 제작되었습니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>서울 열린데이터 광장 — 공공서비스예약 API (data.seoul.go.kr)</li>
              <li>서울 열린데이터 광장 — 자치구별 실시간 대기환경 API (대기질·미세먼지)</li>
              <li>기상청 단기예보 API — 실시간 기온·강수 정보</li>
            </ul>
          </section>

          {/* 만든 이유 */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              만든 이유
            </h2>
            <p className="leading-relaxed">
              서울시에는 많은 공공 테니스장이 있지만, 예약 정보가 여러 곳에 흩어져 있어
              원하는 시간에 예약 가능한 코트를 찾기가 어려웠습니다.
              서울 테니스는 이러한 불편함을 해소하고, 누구나 쉽게 테니스장을 예약할 수 있도록
              만들어졌습니다.
            </p>
          </section>

          {/* 이용 안내 */}
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              이용 안내
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>본 서비스는 무료로 제공됩니다.</li>
              <li>실제 예약은 서울시 공공서비스예약 시스템에서 진행됩니다.</li>
              <li>데이터는 실시간으로 업데이트되지만, 실제 예약 가능 여부와 차이가 있을 수 있습니다.</li>
              <li>카카오 또는 구글 계정으로 로그인하면 즐겨찾기·후기 기능을 이용할 수 있습니다.</li>
            </ul>
          </section>

          {/* 의견을 들려주세요 */}
          <section className={`p-5 rounded-lg ${themeClass('bg-yellow-100 border-2 border-black', 'bg-gray-50')}`}>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              의견을 들려주세요
            </h2>
            <p className="mb-4">
              서비스 개선 아이디어, 버그 제보, 궁금한 점 등 어떤 의견이든 환영합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClass(
                  'bg-black text-white border-2 border-black hover:bg-gray-800 font-bold',
                  'bg-green-600 text-white hover:bg-green-700'
                )}`}
              >
                💬 의견 보내기
              </button>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${themeClass(
                  'bg-white text-black border-2 border-black hover:bg-gray-100 font-bold',
                  'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                )}`}
              >
                📧 이메일 문의
              </Link>
            </div>
          </section>
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
