'use client';

import { useThemeClass } from '@/lib/cn';

export default function PrivacyPage() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <h1 className={`text-2xl font-bold mb-6 ${themeClass('text-black', 'text-gray-900')}`}>
          개인정보처리방침
        </h1>

        <div className={`space-y-6 ${themeClass('text-black/80', 'text-gray-600')}`}>
          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              1. 개인정보의 처리 목적
            </h2>
            <p>
              서울 테니스(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>소셜 로그인을 통한 회원 가입 및 관리</li>
              <li>즐겨찾기, 이용 후기 등 개인화 기능 제공</li>
              <li>서비스 이용 통계 분석 및 서비스 개선</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              2. 수집하는 개인정보 항목
            </h2>
            <p className="mb-2">서비스는 소셜 로그인(OAuth) 방식을 통해 최소한의 정보만 수집합니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>카카오 로그인</strong>: 이메일 주소, 닉네임, 프로필 이미지</li>
              <li><strong>구글 로그인</strong>: 이메일 주소, 이름, 프로필 이미지</li>
              <li><strong>자동 수집 항목</strong>: 서비스 이용 기록, 접속 로그, 쿠키, 기기 정보(Google Analytics를 통해 수집)</li>
            </ul>
            <p className="mt-2 text-sm">
              ※ 서비스는 비밀번호를 직접 수집하지 않으며, 소셜 로그인 제공자(카카오, 구글)의 인증 시스템을 사용합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              3. 개인정보의 처리 및 보유 기간
            </h2>
            <p>
              서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
              동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>이용 후기 및 즐겨찾기 데이터: 회원 탈퇴 시까지</li>
              <li>서비스 이용 기록: 3년</li>
              <li>익명 피드백 데이터: 서비스 개선 목적으로 보관 (개인 식별 정보 미포함)</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              4. 개인정보의 제3자 제공 및 위탁
            </h2>
            <p className="mb-2">
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong>: 회원 인증 및 데이터 저장 (후기, 즐겨찾기, 리뷰 이미지)</li>
              <li><strong>Google Analytics</strong>: 서비스 이용 통계 분석</li>
              <li><strong>Google AdSense</strong>: 광고 제공 (쿠키 기반)</li>
              <li><strong>Vercel</strong>: 웹 서비스 호스팅</li>
              <li><strong>서울 열린데이터 광장</strong>: 공공서비스예약 현황 및 자치구별 실시간 대기환경(미세먼지) 정보 제공 (개인정보 미포함)</li>
              <li><strong>기상청</strong>: 단기예보 API를 통한 실시간 날씨 정보 제공 (개인정보 미포함)</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              5. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p>정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-2">
              권리 행사는 이메일(gjghks84@gmail.com)을 통해 가능하며, 서비스는 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              6. 개인정보의 안전성 확보조치
            </h2>
            <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>개인정보의 암호화 (Supabase 기반 데이터 암호화 전송 및 저장)</li>
              <li>소셜 로그인 OAuth 2.0 프로토콜 사용 (비밀번호 미저장)</li>
              <li>HTTPS를 통한 통신 구간 암호화</li>
              <li>Row Level Security(RLS)를 통한 데이터 접근 제어</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              7. 쿠키 및 자동 수집 장치의 사용
            </h2>
            <p className="mb-2">
              서비스는 이용자의 편의와 서비스 개선을 위해 쿠키 및 유사 기술을 사용합니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>인증 쿠키</strong>: 로그인 상태 유지를 위한 세션 쿠키</li>
              <li><strong>테마 설정</strong>: 선택한 디자인 테마 기억 (로컬 스토리지)</li>
              <li><strong>Google Analytics 쿠키</strong>: 방문 통계 분석 (익명화 처리)</li>
              <li><strong>Google AdSense 쿠키</strong>: 맞춤 광고 제공</li>
            </ul>
            <p className="mt-2 text-sm">
              ※ 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              8. 개인정보 보호책임자
            </h2>
            <p>
              서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <p className="mt-2">
              문의: <a href="mailto:gjghks84@gmail.com" className={`font-medium hover:underline ${themeClass('text-black', 'text-green-600')}`}>gjghks84@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              9. 개인정보처리방침의 변경
            </h2>
            <p>
              이 개인정보처리방침은 2025년 2월 14일부터 적용됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
