'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function AboutPage() {
  const { isNeoBrutalism } = useTheme();

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${
        isNeoBrutalism 
          ? 'bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8'
          : 'bg-white rounded-xl shadow-lg p-8'
      }`}>
        <h1 className={`text-2xl font-bold mb-6 ${
          isNeoBrutalism ? 'text-black' : 'text-gray-900'
        }`}>
          서울 테니스 소개
        </h1>

        <div className={`space-y-8 ${isNeoBrutalism ? 'text-black/80' : 'text-gray-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-3 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              서울 테니스란?
            </h2>
            <p className="leading-relaxed">
              서울 테니스는 서울시 25개 자치구의 공공 테니스장 예약 현황을 실시간으로 제공하는 서비스입니다. 
              서울시 공공서비스예약 시스템의 데이터를 기반으로 예약 가능한 테니스장을 한눈에 확인할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              주요 기능
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>지역별 테니스장 검색</strong> - 서울시 25개 자치구별 테니스장 조회</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>실시간 예약 현황</strong> - 예약 가능한 시간대 즉시 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>즐겨찾기 기능</strong> - 자주 이용하는 테니스장 저장</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>바로 예약</strong> - 서울시 공공서비스예약 페이지로 바로 이동</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              데이터 출처
            </h2>
            <p className="leading-relaxed mb-3">
              본 서비스는 다음 공공데이터를 활용하여 제작되었습니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>서울 열린데이터 광장 (data.seoul.go.kr)</li>
              <li>서울시 공공서비스예약 API</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
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
            <h2 className={`text-lg font-bold mb-3 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              이용 안내
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>본 서비스는 무료로 제공됩니다.</li>
              <li>실제 예약은 서울시 공공서비스예약 시스템에서 진행됩니다.</li>
              <li>데이터는 실시간으로 업데이트되지만, 실제 예약 가능 여부와 차이가 있을 수 있습니다.</li>
            </ul>
          </section>

          <section className={`p-4 rounded-lg ${isNeoBrutalism ? 'bg-yellow-100 border-2 border-black' : 'bg-gray-50'}`}>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              문의하기
            </h2>
            <p>
              서비스 이용 중 문의사항이 있으시면 아래 이메일로 연락해 주세요.
            </p>
            <p className={`mt-2 font-semibold ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              gjghks84@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
