'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyPage() {
  const { isNeoBrutalism } = useTheme();

  return (
    <div className="container py-8">
      <div className={`max-w-3xl mx-auto ${
        isNeoBrutalism 
          ? 'bg-white border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8'
          : 'bg-white rounded-xl shadow-lg p-8'
      }`}>
        <h1 className={`text-2xl font-bold mb-6 ${
          isNeoBrutalism ? 'text-black' : 'text-gray-900'
        }`}>
          개인정보처리방침
        </h1>

        <div className={`space-y-6 ${isNeoBrutalism ? 'text-black/80' : 'text-gray-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              1. 개인정보의 처리 목적
            </h2>
            <p>
              서울 테니스(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>회원 가입 및 관리</li>
              <li>테니스장 예약 현황 정보 제공</li>
              <li>서비스 개선 및 맞춤형 서비스 제공</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              2. 수집하는 개인정보 항목
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>필수항목: 이메일 주소</li>
              <li>자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              3. 개인정보의 처리 및 보유 기간
            </h2>
            <p>
              서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
              동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>서비스 이용 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며,
              정보주체의 동의, 법률의 특별한 규정 등의 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              5. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p>정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              6. 개인정보의 안전성 확보조치
            </h2>
            <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>접속기록의 보관 및 위변조 방지</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              7. 쿠키의 사용
            </h2>
            <p>
              서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키(cookie)를 사용합니다.
              쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에게 보내는 작은 텍스트 파일로,
              이용자의 컴퓨터 하드디스크에 저장됩니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              8. 개인정보 보호책임자
            </h2>
            <p>
              서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <p className="mt-2">
              문의: 서비스 내 문의하기 또는 이메일을 통해 연락해 주시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              9. 개인정보처리방침의 변경
            </h2>
            <p>
              이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
              이전의 개인정보처리방침은 아래에서 확인할 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
