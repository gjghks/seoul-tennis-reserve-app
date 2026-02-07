'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import FeedbackModal from '@/components/feedback/FeedbackModal';

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
          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              서울 테니스란?
            </h2>
            <p className="leading-relaxed">
              서울 테니스는 서울시 25개 자치구의 공공 테니스장 예약 현황을 실시간으로 제공하는 서비스입니다.
              서울시 공공서비스예약 시스템과 기상청 데이터를 기반으로, 예약 가능한 테니스장을 한눈에 확인하고
              바로 예약할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              주요 기능
            </h2>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>지역별 테니스장 검색</strong> — 서울시 25개 자치구별 테니스장을 목록·지도 뷰로 조회</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>실시간 예약 현황</strong> — 접수중·마감 등 예약 상태를 즉시 확인하고 바로 예약 페이지로 이동</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>인기 랭킹 TOP 5</strong> — 평점, 즐겨찾기, 예약 경쟁률을 종합한 실시간 인기 테니스장 랭킹</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>이용 후기 &amp; 평점</strong> — 실제 이용자들의 후기와 사진으로 코트 선택에 참고</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>즐겨찾기</strong> — 자주 이용하는 테니스장을 저장하고 예약 현황을 홈에서 바로 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>실시간 날씨</strong> — 코트 위치 기반 현재 기온·날씨를 제공, 실외 코트는 우천 주의 안내</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>카카오 지도</strong> — 지역 내 테니스장 위치를 지도에서 한눈에 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold shrink-0">✓</span>
                <span><strong>테마 전환</strong> — 미니멀·네오브루탈리즘 두 가지 디자인 테마 지원</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black', 'text-gray-900')}`}>
              데이터 출처
            </h2>
            <p className="leading-relaxed mb-3">
              본 서비스는 다음 공공데이터를 활용하여 제작되었습니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>서울 열린데이터 광장 — 공공서비스예약 API (data.seoul.go.kr)</li>
              <li>기상청 단기예보 API — 실시간 기온·강수 정보</li>
            </ul>
          </section>

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
