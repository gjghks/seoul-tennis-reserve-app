'use client';

import { useThemeClass } from '@/lib/cn';

export default function TermsPage() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-8 scrollbar-hide">
      <div className={`max-w-3xl mx-auto ${themeClass('bg-white dark:bg-slate-900 border-[3px] border-black dark:border-[#f1f3f8] rounded-[10px] shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#f1f3f8] p-8', 'bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8')}`}>
        <h1 className={`text-2xl font-bold mb-6 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
          이용약관
        </h1>

        <div className={`space-y-6 ${themeClass('text-black/80 dark:text-slate-300', 'text-gray-600 dark:text-slate-400')}`}>
          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제1조 (목적)
            </h2>
            <p>
              이 약관은 서울 테니스(이하 &quot;서비스&quot;)가 제공하는 테니스장 예약 정보 서비스의 이용조건 및
              절차, 이용자와 서비스의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제2조 (정의)
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;서비스&quot;란 서울시 공공 테니스장의 예약 현황 정보를 제공하는 웹 서비스를 말합니다.</li>
              <li>&quot;이용자&quot;란 서비스에 접속하여 이 약관에 따라 서비스가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며 서비스가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제3조 (서비스의 제공)
            </h2>
            <p>서비스는 다음의 서비스를 제공합니다:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>서울시 공공 테니스장 예약 현황 정보 제공</li>
              <li>즐겨찾기 기능</li>
              <li>이용자 후기 및 평점 등록·조회</li>
              <li>경기 기록 및 통계 분석 기능</li>
              <li>테니스 프로필 관리 기능</li>
              <li>캘린더 뷰 및 경쟁률 추이 분석</li>
              <li>테니스장 위치 기반 지도 뷰 제공</li>
              <li>테니스장 인기 랭킹 정보 제공</li>
              <li>테니스장 위치 기반 날씨 정보 제공</li>
              <li>자치구별 실시간 대기질(미세먼지) 정보 제공</li>
              <li>비슷한 테니스장 추천 기능</li>
              <li>테니스 파트너 매칭 기능 (오픈 매칭 게시판)</li>
              <li>ELO 기반 래더 랭킹 시스템</li>
              <li>코트 예약 양도 마켓 기능</li>
              <li>동호회 대진표 생성 및 관리 기능</li>
              <li>유저 프로필 관리 기능 (닉네임, 아바타, 성별)</li>
              <li>푸시 알림 서비스 (예약 접수 시작 알림)</li>
              <li>PWA 설치 지원 (홈 화면 추가)</li>
              <li>익명 의견 보내기(피드백) 기능</li>
              <li>기타 서비스가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제4조 (서비스 이용)
            </h2>
            <p>
              서비스는 서울시 공공데이터를 기반으로 정보를 제공하며, 실제 예약은 서울시 공공서비스예약
              시스템을 통해 이루어집니다. 서비스는 정보 제공의 정확성을 위해 노력하나, 실시간 데이터
              갱신의 특성상 실제 예약 가능 여부와 차이가 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
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
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제6조 (사용자 생성 콘텐츠)
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>이용자가 서비스에 작성한 후기, 평점, 이미지 등 사용자 생성 콘텐츠(이하 &quot;UGC&quot;)의 내용에 대한 책임은 해당 이용자에게 있습니다.</li>
              <li>서비스는 다음에 해당하는 UGC를 사전 통지 없이 삭제하거나 게시를 거부할 수 있습니다:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>타인의 명예를 훼손하거나 권리를 침해하는 내용</li>
                  <li>허위 또는 과장된 정보</li>
                  <li>광고, 스팸 등 서비스 목적에 부합하지 않는 내용</li>
                  <li>법령 또는 공공질서에 위반되는 내용</li>
                </ul>
              </li>
              <li>이용자가 서비스에 UGC를 게시하는 경우, 서비스 내에서의 노출·홍보 목적으로 해당 콘텐츠를 사용할 수 있는 권리를 서비스에 부여하는 것으로 간주합니다.</li>
              <li>익명 의견 보내기(피드백)를 통해 제출된 내용은 서비스 개선 목적으로 수집·활용되며, 별도의 개인정보는 수집하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제7조 (면책조항)
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
              <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
              <li>서비스는 제공되는 정보의 신뢰도, 정확성 등에 대해 보증하지 않으며, 이로 인해 발생한 이용자의 손해에 대하여 책임을 지지 않습니다.</li>
              <li>이용자가 작성한 UGC로 인해 발생하는 분쟁에 대하여 서비스는 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              제8조 (분쟁해결)
            </h2>
            <p>
              서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며,
              서비스의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
              부칙
            </h2>
            <p>이 약관은 2025년 2월 14일부터 시행합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
