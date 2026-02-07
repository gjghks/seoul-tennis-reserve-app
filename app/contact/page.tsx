'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function ContactPage() {
  const themeClass = useThemeClass();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <h1 className={`text-2xl font-bold mb-6 ${themeClass('text-black', 'text-gray-900')}`}>
          문의하기
        </h1>

        <div className={`space-y-8 ${themeClass('text-black/80', 'text-gray-600')}`}>
          <section>
            <p className="leading-relaxed">
              서울 테니스 서비스에 대한 문의, 건의사항, 오류 신고 등
              언제든지 연락해 주세요. 빠르게 확인하고 답변 드리겠습니다.
            </p>
          </section>

          <section className={`p-6 rounded-lg ${themeClass('bg-green-100 border-2 border-black', 'bg-green-50')}`}>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              간단한 의견은 의견 보내기로!
            </h2>
            <p className={`text-sm mb-4 ${themeClass('text-black/70', 'text-gray-500')}`}>
              로그인 없이 간편하게 개선 제안, 오류 신고, 기타 의견을 보낼 수 있어요.
            </p>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                themeClass(
                  'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-[3px_3px_0px_0px_#000]',
                  'bg-green-600 text-white hover:bg-green-700'
                )
              }`}
            >
              의견 보내기
            </button>
          </section>

          <section className={`p-6 rounded-lg ${themeClass('bg-yellow-100 border-2 border-black', 'bg-gray-50')}`}>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              상세한 문의는 이메일로
            </h2>
            <p className={`text-sm mb-3 ${themeClass('text-black/70', 'text-gray-500')}`}>
              답변이 필요한 문의나 상세한 설명이 필요한 경우 이메일로 연락해 주세요.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <a
                href="mailto:gjghks84@gmail.com"
                className={`text-lg font-semibold hover:underline ${themeClass('text-black', 'text-green-600')}`}
              >
                gjghks84@gmail.com
              </a>
            </div>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-4 ${themeClass('text-black', 'text-gray-900')} `}>
              문의 유형
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${themeClass('bg-green-300 border-2 border-black', 'bg-green-100')}`}>
                  💡
                </span>
                <div>
                  <strong className={themeClass('text-black', 'text-gray-900')}>
                    서비스 개선 제안
                  </strong>
                  <p className="text-sm mt-1">
                    더 나은 서비스를 위한 아이디어가 있으시다면 알려주세요.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${themeClass('bg-red-300 border-2 border-black', 'bg-red-100')}`}>
                  🐛
                </span>
                <div>
                  <strong className={themeClass('text-black', 'text-gray-900')}>
                    오류 신고
                  </strong>
                  <p className="text-sm mt-1">
                    서비스 이용 중 발견한 오류나 버그를 알려주세요.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${themeClass('bg-blue-300 border-2 border-black', 'bg-blue-100')}`}>
                  ❓
                </span>
                <div>
                  <strong className={themeClass('text-black', 'text-gray-900')}>
                    이용 문의
                  </strong>
                  <p className="text-sm mt-1">
                    서비스 이용 방법에 대한 궁금한 점이 있으시면 질문해 주세요.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section className={`p-4 rounded-lg ${themeClass('bg-gray-100 border-2 border-black', 'bg-gray-50')} `}>
            <h2 className={`text-sm font-bold mb-2 ${themeClass('text-black', 'text-gray-900')} `}>
              📌 참고 사항
            </h2>
            <ul className={`text-sm space-y-1 ${themeClass('text-black/70', 'text-gray-500')} `}>
              <li>• 실제 테니스장 예약은 서울시 공공서비스예약 시스템에서 진행됩니다.</li>
              <li>• 예약 관련 문의는 해당 시설에 직접 연락해 주세요.</li>
              <li>• 문의에 대한 답변은 영업일 기준 1~2일 내에 드립니다.</li>
            </ul>
          </section>

          <div className="pt-4 text-center">
            <Link
              href="/about"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                themeClass('bg-black text-white border-2 border-black hover:bg-gray-800', 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }`}
            >
              ← 서비스 소개 보기
            </Link>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
