'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function TermsPage() {
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
          이용약관
        </h1>

        <div className={`space-y-6 ${isNeoBrutalism ? 'text-black/80' : 'text-gray-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제1조 (목적)
            </h2>
            <p>
              이 약관은 서울 테니스(이하 &quot;서비스&quot;)가 제공하는 테니스장 예약 정보 서비스의 이용조건 및
              절차, 이용자와 서비스의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제2조 (정의)
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;서비스&quot;란 서울시 공공 테니스장의 예약 현황 정보를 제공하는 웹 서비스를 말합니다.</li>
              <li>&quot;이용자&quot;란 서비스에 접속하여 이 약관에 따라 서비스가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제3조 (서비스의 제공)
            </h2>
            <p>서비스는 다음의 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>서울시 공공 테니스장 예약 현황 정보 제공</li>
              <li>즐겨찾기 기능</li>
              <li>기타 서비스가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제4조 (서비스 이용)
            </h2>
            <p>
              서비스는 서울시 공공데이터를 기반으로 정보를 제공하며, 실제 예약은 서울시 공공서비스예약
              시스템을 통해 이루어집니다. 서비스는 정보 제공의 정확성을 위해 노력하나, 실시간 데이터
              갱신의 특성상 실제 예약 가능 여부와 차이가 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제5조 (이용자의 의무)
            </h2>
            <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>서비스에 게시된 정보의 변경</li>
              <li>서비스가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
              <li>서비스 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제6조 (면책조항)
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>서비스는 제공되는 정보의 신뢰도, 정확성 등에 대해 보증하지 않으며, 이로 인해 발생한 이용자의 손해에 대하여 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              제7조 (분쟁해결)
            </h2>
            <p>
              서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며,
              서비스의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
              부칙
            </h2>
            <p>이 약관은 2024년 1월 1일부터 시행합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
