import type { SeoulService } from '@/lib/seoulApi';

const INDEPENDENT_COURTS: SeoulService[] = [
  {
    SVCID: 'INDEP_GB001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '오동근린공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '오동근린공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://blog.naver.com/680720_4',
    X: '127.0435',
    Y: '37.6227',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강북구',
    IMGURL: '/images/courts/odong-tennis.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3면\r\n- 강북구테니스협회 운영\r\n\r\n◎ 운영시간\r\n- 06:00~22:00 (수요일, 공휴일 휴장)\r\n\r\n◎ 예약방법\r\n- 전화예약: 010-9976-3143\r\n- 강북구테니스협회 문의',
    TELNO: '010-9976-3143',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_NW001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '마들스포츠타운 테니스장',
    PAYATNM: '유료',
    PLACENM: '마들스포츠타운',
    USETGTINFO: '제한없음',
    SVCURL: 'https://reservation.nowonsc.kr/sports/tennis_list',
    X: '127.0575',
    Y: '37.6440',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '노원구',
    IMGURL: '/images/courts/nowon-madeul.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 9면 (조명탑, 샤워장, 탈의실)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간: 4,000원\r\n- 평일 야간: 5,200원 + 조명료 3,000원\r\n- 주말: 5,200원 + 조명료 3,000원\r\n\r\n◎ 예약방법\r\n- 노원구시설관리공단 통합예약 (reservation.nowonsc.kr)\r\n- 매월 19일 10시 관내, 14시 관외 예약 오픈\r\n\r\n◎ 당일예약\r\n- 이용 3시간 전까지 예약 가능\r\n- 예약 후 3시간 이내 미납 시 자동 취소\r\n\r\n◎ 강습 프로그램\r\n- 성인/주니어 테니스 강습 운영\r\n- 상세 일정 및 수강료는 공단 문의\r\n\r\n◎ 환불정책 (서울특별시 도시공원조례)\r\n- 7일 전/예약 당일: 전액 환불\r\n- 6~3일 전: 10% 공제\r\n- 2~1일 전: 30% 공제\r\n- 이용 당일: 환불 불가\r\n- 기상악화(호우/폭설 등): 전액 환불',
    TELNO: '02-2289-6855',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_NW002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '초안산스포츠타운 테니스장',
    PAYATNM: '유료',
    PLACENM: '초안산스포츠타운',
    USETGTINFO: '제한없음',
    SVCURL: 'https://reservation.nowonsc.kr/sports/tennis_list',
    X: '127.0516',
    Y: '37.6379',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '노원구',
    IMGURL: '/images/courts/nowon-choansan.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 4면 (조명탑)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간: 4,000원\r\n- 평일 야간: 5,200원 + 조명료 3,000원\r\n- 주말: 5,200원 + 조명료 3,000원\r\n\r\n◎ 예약방법\r\n- 노원구시설관리공단 통합예약 (reservation.nowonsc.kr)\r\n- 매월 19일 예약 오픈\r\n\r\n◎ 당일예약\r\n- 이용 3시간 전까지 예약 가능\r\n- 예약 후 3시간 이내 미납 시 자동 취소\r\n\r\n◎ 환불정책 (서울특별시 도시공원조례)\r\n- 7일 전/예약 당일: 전액 환불\r\n- 6~3일 전: 10% 공제\r\n- 2~1일 전: 30% 공제\r\n- 이용 당일: 환불 불가\r\n- 기상악화(호우/폭설 등): 전액 환불',
    TELNO: '02-2289-6855',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_NW003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '불암산스포츠타운 테니스장',
    PAYATNM: '유료',
    PLACENM: '불암산스포츠타운',
    USETGTINFO: '제한없음',
    SVCURL: 'https://reservation.nowonsc.kr/sports/tennis_list',
    X: '127.0849',
    Y: '37.6380',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '노원구',
    IMGURL: '/images/courts/nowon-bulamsan.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3면 (조명탑)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간: 4,000원\r\n- 평일 야간: 5,200원 + 조명료 3,000원\r\n- 주말: 5,200원 + 조명료 3,000원\r\n\r\n◎ 예약방법\r\n- 노원구시설관리공단 통합예약 (reservation.nowonsc.kr)\r\n- 매월 19일 예약 오픈\r\n\r\n◎ 당일예약\r\n- 이용 3시간 전까지 예약 가능\r\n- 예약 후 3시간 이내 미납 시 자동 취소\r\n\r\n◎ 환불정책 (서울특별시 도시공원조례)\r\n- 7일 전/예약 당일: 전액 환불\r\n- 6~3일 전: 10% 공제\r\n- 2~1일 전: 30% 공제\r\n- 이용 당일: 환불 불가\r\n- 기상악화(호우/폭설 등): 전액 환불',
    TELNO: '02-2289-6855',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_NW004',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '수락산스포츠타운 테니스장',
    PAYATNM: '유료',
    PLACENM: '수락산스포츠타운',
    USETGTINFO: '제한없음',
    SVCURL: 'https://reservation.nowonsc.kr/sports/tennis_list',
    X: '127.0721',
    Y: '37.6689',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '노원구',
    IMGURL: '/images/courts/nowon-suraksan.png',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3면 (조명탑)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간: 4,000원\r\n- 평일 야간: 5,200원 + 조명료 3,000원\r\n- 주말: 5,200원 + 조명료 3,000원\r\n\r\n◎ 예약방법\r\n- 노원구시설관리공단 통합예약 (reservation.nowonsc.kr)\r\n- 매월 19일 예약 오픈\r\n\r\n◎ 당일예약\r\n- 이용 3시간 전까지 예약 가능\r\n- 예약 후 3시간 이내 미납 시 자동 취소\r\n\r\n◎ 환불정책 (서울특별시 도시공원조례)\r\n- 7일 전/예약 당일: 전액 환불\r\n- 6~3일 전: 10% 공제\r\n- 2~1일 전: 30% 공제\r\n- 이용 당일: 환불 불가\r\n- 기상악화(호우/폭설 등): 전액 환불',
    TELNO: '02-2289-6855',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_DB001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '다락원체육공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '다락원체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://yeyak.dobongsiseol.or.kr/rent/index.php?c_id=05&page_info=index&n_type=rent',
    X: '127.0470',
    Y: '37.6915',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '도봉구',
    IMGURL: '/images/courts/dobong-darakwon.png',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 실내 케미칼코트 3면 + 실외 케미칼코트 5면 = 총 8면\r\n' +
      '- 탈의실, 샤워실, 개인사물함 (배드민턴장과 공동 사용)\r\n' +
      '- 주차장 63면\r\n\r\n' +
      '◎ 이용요금 (1면당 2시간)\r\n' +
      '- 실내 평일: 25,000원 / 야간·주말·공휴일: 32,500원\r\n' +
      '- 실외 평일: 8,000원 / 야간·주말·공휴일: 10,400원\r\n' +
      '- 조명료: 3,000원/면/시간\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 실내 평일: 06:00~22:00 (청소 12:00~13:00)\r\n' +
      '- 실내 주말·공휴일: 06:00~21:00\r\n' +
      '- 실외: 06:00~22:00\r\n' +
      '- 휴관: 명절연휴(신정, 설날, 추석), 근로자의 날, 정기휴관일\r\n\r\n' +
      '◎ 대관방법 (도봉구시설관리공단 자체 예약)\r\n' +
      '- 1순위: 도봉구테니스연합회 소속 클럽 (매월 19~20일 선배정)\r\n' +
      '- 2순위: 일반/개인 (매월 23일~말일, 온라인 선착순)\r\n' +
      '- 사용 횟수: 일반/개인 월 4회 (1회 1면 최대 4시간)\r\n' +
      '- 당일 사용: 온라인 불가, 현장 방문\r\n' +
      '- ※ 서울시 공공서비스예약(yeyak.seoul.go.kr) 불가\r\n\r\n' +
      '◎ 할인대상\r\n' +
      '- 경로(만65세이상), 장애인, 국가/5.18민주 유공자, 기초생활수급자, 다둥이\r\n' +
      '- ※ 코트대관 할인: 구성원 모두가 할인대상자여야 적용\r\n\r\n' +
      '◎ 환불 (서울특별시 도시공원 조례10조 준용)\r\n' +
      '- 7일 전/예약당일: 전액 / 6~3일 전: 10% 공제 / 2~1일 전: 30% 공제 / 당일: 불가\r\n' +
      '- 우천·천재지변: 전액 환불\r\n\r\n' +
      '◎ 교통\r\n' +
      '- 도봉산역 (1호선/7호선) 도보 5분',
    TELNO: '02-901-5198',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_DB002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '창골테니스장 (초안산근린공원)',
    PAYATNM: '무료',
    PLACENM: '초안산근린공원',
    USETGTINFO: '도봉구민',
    SVCURL: 'https://dbgta.or.kr/m/sub01_07_01.html',
    X: '127.0418',
    Y: '37.6491',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '도봉구',
    IMGURL: '/images/courts/dobong-changgol.webp',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 3면\r\n' +
      '- 초안산근린공원 내 위치\r\n' +
      '- 도봉구테니스협회 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 무료\r\n\r\n' +
      '◎ 이용대상\r\n' +
      '- 도봉구민 누구나\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 09:00~18:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 도봉구테니스협회 홈페이지 (dbgta.or.kr)\r\n' +
      '- 사무국장(010-8776-7333)에게 전화로 도봉구민 ID 발급 후 온라인 예약\r\n' +
      '- 참석자 전원 온라인 회원가입 필수\r\n\r\n' +
      '◎ 이용규칙\r\n' +
      '- 1일 1회 예약 가능 (최대 2시간)\r\n' +
      '- 7일 이내 중복 예약 불가\r\n' +
      '- 참석자 전원 명단 제출 의무\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 창골근린공원 주차장 이용 (유료)',
    TELNO: '010-8776-7333',
    V_MIN: '09:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_DD002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '이문체육문화센터 테니스장',
    PAYATNM: '유료',
    PLACENM: '이문체육문화센터',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.dfmc.kr:8443/course/sports/fmcs/14?center=DFMC02&type=1002&part=09',
    X: '127.0686',
    Y: '37.6023',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '동대문구',
    IMGURL: '/images/courts/dongdaemun-imun.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 2면 (코트A, 코트B)\r\n- 2026년 2월 2일 재개장 (인조잔디 전면교체, 펜스/출입문 신설, 휴게컨테이너 2동)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 4,500원/면 (최대 3시간)\r\n\r\n◎ 운영시간\r\n- 주중: 06:00~22:00\r\n- 토요일: 06:00~18:00\r\n- 일요일: 골프장만 운영 (테니스 휴장)\r\n- 매월 넷째 일요일, 공휴일: 전체 휴관\r\n\r\n◎ 예약방법\r\n- 서울시 공공서비스예약 (yeyak.seoul.go.kr) 매월 24일 익월분 오픈\r\n- 동대문구통합예약 (dfmc.kr:8443) 매월 20일 익월분 오픈\r\n\r\n◎ 문의\r\n- 직통전화: 02-6929-0987',
    TELNO: '02-6929-0987',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_DD003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '중랑천제1체육공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '중랑천제1체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.dfmc.kr:8443/course/sports/fmcs/14?center=DFMC09&type=1001&part=03',
    X: '127.0729',
    Y: '37.5644',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '동대문구',
    IMGURL: '/images/courts/dongdaemun-jungnangcheon.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 2면 (1코트, 2코트)\r\n\r\n◎ 이용요금 (2시간 기준)\r\n- 평일: 6,600원\r\n- 주말/공휴일: 8,580원\r\n\r\n◎ 운영시간\r\n- 07:00~19:00 (연중, 계절적 요인에 따라 탄력 운영)\r\n- 휴장일: 1월 1일(신정), 설·추석 연휴\r\n\r\n◎ 주차\r\n- 주차 불가 (하천변 시설)\r\n\r\n◎ 예약방법\r\n- 동대문구통합예약 (dfmc.kr:8443) 선착순\r\n- 문의: 02-2247-9611',
    TELNO: '02-2247-9611',
    V_MIN: '07:00',
    V_MAX: '19:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_EP001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '은평구립테니스장 (주말 대관)',
    PAYATNM: '유료',
    PLACENM: '은평구민체육센터',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.efmc.or.kr/fmcs/32',
    X: '126.9236',
    Y: '37.6305',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '은평구',
    IMGURL: '/images/courts/eunpyeong-gulib.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3면 (LED 조명)\r\n- 휴게실 2곳, 지하주차장 28면\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 주말: 14,300원/면\r\n- 평일: 강습 프로그램 운영으로 대관 불가\r\n\r\n◎ 운영시간\r\n- 토·일요일 09:00~18:00 (동절기 09:00~17:00)\r\n- 휴장일: 신정, 구정, 추석, 법정공휴일\r\n\r\n◎ 예약방법\r\n- 은평구시설관리공단 (efmc.or.kr)\r\n- 매월 1일 09시 예약 오픈\r\n- 예약 후 4시간 이내 미결제 시 자동 취소',
    TELNO: '02-350-5393',
    V_MIN: '09:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_EP002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '장미테니스장 (북한산저류조)',
    PAYATNM: '유료',
    PLACENM: '북한산근린공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.efmc.or.kr/fmcs/32',
    X: '126.9380',
    Y: '37.6100',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '은평구',
    IMGURL: '/images/courts/eunpyeong-jangmi.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 2면 (북한산저류조 상부)\r\n- 족구장 1면, 간이농구장 1/2면 (복합체육시설)\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일: 8,800원/면\r\n- 주말/공휴일: 11,440원/면\r\n\r\n◎ 운영시간\r\n- 매일 06:00~22:00\r\n- 휴장일: 신정, 구정연휴, 추석연휴 등\r\n\r\n◎ 예약방법\r\n- 은평구시설관리공단 (efmc.or.kr)\r\n- 매월 1일 09시 예약 오픈\r\n- 예약 후 4시간 이내 미결제 시 자동 취소',
    TELNO: '02-350-5358',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_EP003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '서오릉근린공원 선정테니스장',
    PAYATNM: '유료',
    PLACENM: '선정테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.efmc.or.kr/fmcs/32',
    X: '126.9108',
    Y: '37.6201',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '은평구',
    IMGURL: '/images/courts/eunpyeong-sunjeong.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3.5면 (정식 3면 + 연습 0.5면)\r\n- 2024년 11월 개장\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일: 8,800원/면\r\n- 주말/공휴일: 11,440원/면\r\n\r\n◎ 운영시간\r\n- 매일 06:00~22:00\r\n- 휴장일: 신정, 구정연휴, 추석연휴 등\r\n\r\n◎ 예약방법\r\n- 은평구시설관리공단 (efmc.or.kr)\r\n- 매월 1일 09시 예약 오픈',
    TELNO: '02-350-5236',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_JN001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '중랑구립테니스장 (중랑IC)',
    PAYATNM: '유료',
    PLACENM: '중랑IC',
    USETGTINFO: '제한없음',
    SVCURL: 'https://jnrent2.jungnangimc.or.kr/page/rent/s01.od.list.php',
    X: '127.1141',
    Y: '37.6122',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '중랑구',
    IMGURL: '/images/courts/jungnang-ic.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 8면 (야간 조명, 샤워장, 탈의실)\r\n- 주차 30대\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간(06:00~18:00): 5,000원\r\n- 평일 야간(18:00~22:00): 6,500원\r\n- 토·일·공휴일: 6,500원\r\n- 조명료: 3,000원/시간\r\n\r\n◎ 할인\r\n- 중랑구민 10%, 경로 30%, 장애인/기초수급자/국가유공자 50%, 다자녀 20~50%\r\n\r\n◎ 운영시간\r\n- 매일 06:00~22:00 (신정, 설/추석연휴 휴장)\r\n\r\n◎ 예약방법\r\n- 중랑구시설관리공단 통합예약 (jnrent2.jungnangimc.or.kr)\r\n- 우선순위: 1순위(월, 구민3인+) / 2순위(화, 구민2인+) / 3순위(수~일, 누구나)\r\n- 예약시간: 1·2순위 09:00~18:00, 3순위 24시간\r\n- 예약제한: 1일 1회(2시간), 1주 2회(4시간)\r\n\r\n◎ 환불\r\n- 7일 전: 전액 / 4~6일 전: 5% 공제 / 1~3일 전: 10% 공제 / 당일: 불가\r\n- 우천·강설 시 당일 전액 환불',
    TELNO: '02-433-2949',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_JN002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '용마폭포공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '용마폭포공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://jnrent2.jungnangimc.or.kr/page/rent/s02.od.list.php',
    X: '127.0908',
    Y: '37.5740',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '중랑구',
    IMGURL: '/images/courts/jungnang-yongma.jpg',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 3면 (야간 조명, 샤워장, 탈의실)\r\n- 휴게실 18㎡\r\n\r\n◎ 이용요금 (1시간 기준)\r\n- 평일 주간(06:00~18:00): 5,000원\r\n- 평일 야간(18:00~22:00): 6,500원\r\n- 토·일·공휴일: 6,500원\r\n- 조명료: 3,000원/시간\r\n\r\n◎ 할인\r\n- 중랑구민 10%, 경로 30%, 장애인/기초수급자/국가유공자 50%, 다자녀 20~50%\r\n\r\n◎ 운영시간\r\n- 매일 06:00~22:00 (신정, 설/추석연휴 휴장)\r\n\r\n◎ 예약방법\r\n- 중랑구시설관리공단 통합예약 (jnrent2.jungnangimc.or.kr)\r\n- 우선순위: 1순위(월, 구민3인+) / 2순위(화, 구민2인+) / 3순위(수~일, 누구나)\r\n- 예약시간: 1·2순위 09:00~18:00, 3순위 24시간\r\n- 예약제한: 1일 1회(2시간), 1주 2회(4시간)\r\n\r\n◎ 환불\r\n- 7일 전: 전액 / 4~6일 전: 5% 공제 / 1~3일 전: 10% 공제 / 당일: 불가\r\n- 우천·강설 시 당일 전액 환불',
    TELNO: '02-437-2949',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_JN003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '면목구립테니스장 (중랑천)',
    PAYATNM: '유료',
    PLACENM: '면목구립테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://tennis.jungnangimc.or.kr',
    X: '127.0788',
    Y: '37.5745',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '중랑구',
    IMGURL: '/images/courts/jungnang-myeonmok.png',
    DTLCONT: '◎ 시설현황\r\n- 인조잔디 코트 5면 (중랑천 둔치)\r\n- 주차 불가 (하천변 시설)\r\n- 야간 조명 없음\r\n\r\n◎ 이용요금 (2시간 기준)\r\n- 평일: 10,000원\r\n- 주말/공휴일: 13,000원\r\n\r\n◎ 할인\r\n- 중랑구민 10%, 경로 30%, 장애인/기초수급자/국가유공자 50%, 다자녀 20~50%\r\n\r\n◎ 운영시간\r\n- 하절기(4~9월): 07:00~18:50 / 동절기(10~3월): 08:00~17:00\r\n- 부별 2시간 운영 (부 사이 10분 휴장)\r\n\r\n◎ 예약방법\r\n- 면목구립테니스장 전용사이트 (tennis.jungnangimc.or.kr)\r\n- 2주 후 1주분 사전예약, 매주 월요일 09시 오픈\r\n- 우선순위: 1순위(월, 구민3인+) / 2순위(화, 구민2인+) / 3순위(수~일, 누구나)\r\n- 팀 구성: 최소 2명 ~ 최대 4명\r\n- 현장결제 불가 (온라인 결제만 가능)\r\n\r\n◎ 휴장일\r\n- 신정, 설날 당일, 추석 당일, 공단 창립기념일(12.1)\r\n\r\n◎ 환불\r\n- 7일 전: 카드 취소 / 4~6일 전: 5% 공제 / 1~3일 전: 10% 공제 / 당일: 불가\r\n- 우천·재난 시 당일 전액 환불\r\n- 취소 페널티: 이용월 2회 취소 시 1개월 이용 제한 (3일 전 취소분부터 적용)',
    TELNO: '070-8824-3599',
    V_MIN: '07:00',
    V_MAX: '18:50',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_YD001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '안양천 하드코트테니스장',
    PAYATNM: '유료',
    PLACENM: '안양천체육시설',
    USETGTINFO: '제한없음',
    SVCURL: 'https://srent.y-sisul.or.kr/page/rent/s04.od.list.asp',
    X: '126.8855',
    Y: '37.5447',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '영등포구',
    IMGURL: '/images/courts/yeongdeungpo-anyangcheon.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 7면 (대관 5면 + 강습 2면, 6,500㎡)\r\n' +
      '- 야간 조명 (기본사용료의 30% 할증)\r\n' +
      '- 영등포구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금 (2시간 기준)\r\n' +
      '- 평일: 8,000원/팀\r\n' +
      '- 공휴일(토요일 포함): 10,400원/팀\r\n' +
      '- 조명비: 기본사용료의 30% 할증\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00 (2시간 단위)\r\n' +
      '- 폭염특보 시 12:00~16:00 운영중단\r\n' +
      '- 휴장: 신정, 설날연휴, 추석연휴\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 영등포구시설관리공단 예약 (srent.y-sisul.or.kr)\r\n' +
      '- 영등포구민: 매월 20~24일 익월분 신청\r\n' +
      '- 수시(타구민): 매월 25일~말일\r\n' +
      '- 팀등록 필수 (팀원 2명 이상)\r\n\r\n' +
      '◎ 강습 프로그램\r\n' +
      '- 1:1 개인강습: 평일 12회 150,000원 / 8회 120,000원\r\n' +
      '- 소수반(1:6): 평일 12회 75,000원/인 / 8회 60,000원/인\r\n' +
      '- 주말 강습 별도 운영\r\n\r\n' +
      '◎ 환불\r\n' +
      '- 사용개시예정일(매월1일) 전: 전액 환불\r\n' +
      '- 사용개시예정일 이후: 일할 계산 + 10% 공제\r\n' +
      '- 천재지변/우천: 전액 환불',
    TELNO: '010-7389-2988',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_YD002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '대림운동장 테니스장',
    PAYATNM: '유료',
    PLACENM: '대림운동장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://srent.y-sisul.or.kr/daerim/page/rent/s02.od.list.asp',
    X: '126.8949',
    Y: '37.4998',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '영등포구',
    IMGURL: '/images/courts/yeongdeungpo-daerim.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 3면 (1,500㎡)\r\n' +
      '- 2023년 8월 인조잔디 전면 교체\r\n' +
      '- 영등포구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금 (2시간 기준)\r\n' +
      '- 평일: 8,000원/팀\r\n' +
      '- 공휴일(토요일 포함): 10,400원/팀\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 하계: 06:00~18:00 / 동계: 08:00~18:00 (2시간 단위)\r\n' +
      '- 18시 이후 자유이용\r\n' +
      '- 폭염특보 시 12:00~16:00 운영중단\r\n' +
      '- 휴장: 신정, 설날연휴, 추석연휴\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 영등포구시설관리공단 예약 (srent.y-sisul.or.kr)\r\n' +
      '- 영등포구민: 매월 20~24일 익월분 신청\r\n' +
      '- 수시(타구민): 매월 25일~말일\r\n' +
      '- 팀등록 필수 (팀원 2명 이상)\r\n\r\n' +
      '◎ 환불\r\n' +
      '- 사용개시예정일(매월1일) 전: 전액 환불\r\n' +
      '- 사용개시예정일 이후: 일할 계산 + 10% 공제\r\n' +
      '- 당일 사용분 환불 불가\r\n' +
      '- 천재지변/우천: 전액 환불',
    TELNO: '010-2640-8895',
    V_MIN: '06:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GN001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '봉은테니스장',
    PAYATNM: '유료',
    PLACENM: '봉은테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://life.gangnam.go.kr/fmcs/54',
    X: '127.0554',
    Y: '37.5140',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강남구',
    IMGURL: '/images/courts/gangnam-bongeun.png',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 클레이코트 4면 (야간 조명), 강남도시관리공단 운영, 1994년 개관\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 조명 미사용 6,000원 / 조명 사용 16,000원, 주말 7,000원 / 17,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 매일 06:00~22:00, 법정 공휴일 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강남도시관리공단 (life.gangnam.go.kr), 수시대관 매월 19~25일 신청, 정기대관 반기별 추첨\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 무료 (약 20대, 협소)',
    TELNO: '02-2176-0890',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GN002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '포이테니스장',
    PAYATNM: '유료',
    PLACENM: '포이테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://life.gangnam.go.kr/fmcs/54',
    X: '127.0544',
    Y: '37.4758',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강남구',
    IMGURL: '/images/courts/gangnam-poi.png',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 클레이코트 3면 (반코트 1면 포함, 야간 조명), 강남도시관리공단 운영, 1990년 개관\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 조명 미사용 6,000원 / 조명 사용 16,000원, 주말 7,000원 / 17,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 매일 06:00~22:00, 법정 공휴일 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강남도시관리공단 (life.gangnam.go.kr), 수시대관 매월 19~25일 신청\r\n\r\n' +
      '◎ 강습\r\n' +
      '- 황상철 강사, 월·목/화·금 프로그램 운영',
    TELNO: '02-2176-0876',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GN003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '강남세곡체육공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '강남세곡체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://life.gangnam.go.kr/fmcs/54',
    X: '127.1131',
    Y: '37.4668',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강남구',
    IMGURL: '/images/courts/gangnam-segok.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 4면, 강남도시관리공단 운영, 2024년 1월 개관\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 화~일 06:00~22:00, 매주 월요일 + 법정 공휴일 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강남도시관리공단 (life.gangnam.go.kr), 매월 19~25일 신청, 강남구민 우선 → 강남구 직장인 → 타지역 순\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 협소 (대중교통 권장)',
    TELNO: '02-2176-0870',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GN004',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '대치유수지체육공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '대치유수지체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'http://www.xn--vk1b79znxd34c61h.kr',
    X: '127.0690',
    Y: '37.5026',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강남구',
    IMGURL: '/images/courts/gangnam-daechi.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 3면 (A·B·C코트), 연중무휴\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 8,000원/2시간\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 07:00~21:00, 연중무휴\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 자체 사이트 (대치유수지체육공원.kr), 강남구민 우선 추첨(매월 둘째 주) → 셋째 주 월요일 09:00 전체 선착순\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 없음',
    TELNO: '02-2051-2285',
    V_MIN: '07:00',
    V_MAX: '21:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GD001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '강일테니스장',
    PAYATNM: '유료',
    PLACENM: '강일테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://gdgd.igangdong.or.kr',
    X: '127.1642',
    Y: '37.5748',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강동구',
    IMGURL: '/images/courts/gangdong-gangil.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 10면 + 족구장 1면 (18,060㎡), 강동구도시관리공단 운영\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 매일 06:00~22:00, 매월 2·4번째 수요일 + 신정 + 설/추석 연휴 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강동구도시관리공단 (gdgd.igangdong.or.kr), 강동구민 전월 말일 10시 오픈, 타지역 당월 1일 10시\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 무료 50면\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 강동대교 하부 위치, 신분증 지참 필수',
    TELNO: '02-2045-7872',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GD002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '명일테니스장',
    PAYATNM: '유료',
    PLACENM: '명일테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://gdgd.igangdong.or.kr',
    X: '127.1540',
    Y: '37.5445',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강동구',
    IMGURL: '/images/courts/gangdong-myeongil.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 5면 (1번 레슨 전용, 2~5번 일반), 강동구도시관리공단 운영\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 매일 06:00~22:00, 매월 2·4번째 월요일 + 신정 + 설/추석 연휴 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강동구도시관리공단 (gdgd.igangdong.or.kr), 강동구민 우선 오픈\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 무료 (협소)',
    TELNO: '02-2045-7870',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GS001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '우장산테니스장',
    PAYATNM: '유료',
    PLACENM: '우장산테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://sports.gangseo.seoul.kr/fmcs/64',
    X: '126.8456',
    Y: '37.5507',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강서구',
    IMGURL: '/images/courts/gangseo-ujangsan.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 코트 4면, 우장산근린공원 내\r\n\r\n' +
      '◎ 이용요금 (하절기 3시간)\r\n' +
      '- 평일 11,000원, 주말 14,300원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 동절기(11~2월) 09:00~17:00, 하절기(3~10월) 09:00~18:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강서구 공공체육시설 예약 (sports.gangseo.seoul.kr), 전월 3번째 금요일 13:00 선착순\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 유료 (협소)\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 07:00~09:00 구민테니스교실 운영 (무료)',
    TELNO: '02-2600-4193',
    V_MIN: '09:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GS002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '강서구립테니스장 (방화대교 남단)',
    PAYATNM: '유료',
    PLACENM: '구립테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://sports.gangseo.seoul.kr/fmcs/64',
    X: '126.8156',
    Y: '37.5838',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강서구',
    IMGURL: '/images/courts/gangseo-gurib.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 코트 6면 (1~2번 현장예약, 3~6번 온라인, 6번 연습공 전용), 조명 8기, 인천공항고속도로 하부\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 09:00~21:00, 07:00~09:00 무료 개방, 설/추석 휴장\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 강서구민 매월 셋째 화요일 09:00~수요일 우선, 일반 목요일~월말, 1아이디 1일 1타임 월 5회\r\n\r\n' +
      '◎ 현장예약 (1~2코트)\r\n' +
      '- 당일 무인발권기, 장애인/65세 이상 우선\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 20대 (이용자 전용)',
    TELNO: '02-2600-6579',
    V_MIN: '09:00',
    V_MAX: '21:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GS003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '황금내테니스장',
    PAYATNM: '무료',
    PLACENM: '황금내테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://sports.gangseo.seoul.kr/fmcs/64',
    X: '126.8633',
    Y: '37.5624',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '강서구',
    IMGURL: '/images/courts/gangseo-hwanggeumnae.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 1면, 황금내근린공원 내\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 무료\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 주말만 운영 (평일 미운영), 동절기 09:00~17:00 / 하절기 09:00~18:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 온라인 전용 (sports.gangseo.seoul.kr), 강서구민 전주 화요일 13:00, 비강서구민 전주 수요일 13:00, 1아이디 1일 1시간 월 4타임\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 없음 (인근 공영주차장 이용)',
    TELNO: '02-2600-4186',
    V_MIN: '09:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GJ001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '아차산배수지체육공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '아차산배수지체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://booking.gwangjin.or.kr/fmcs/3',
    X: '127.0976',
    Y: '37.5485',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '광진구',
    IMGURL: '/images/courts/gwangjin-achasan.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 5면 (2025.10 5번코트 신설), 광진구시설관리공단 운영\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 광진구시설관리공단 (booking.gwangjin.or.kr), 광진구민 매월 20~21일 우선, 관외 22~24일, 누구나 25일 이후, 주1회 월3회 1일4시간 제한\r\n\r\n' +
      '◎ 코트배정\r\n' +
      '- 1~3번 협회/단체 우선, 4번 일반인 우선, 5번 1:1 개인레슨 우선',
    TELNO: '02-3437-7234',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GA001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '관악구민운동장 테니스장',
    PAYATNM: '유료',
    PLACENM: '관악구민운동장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://booking.gwanakgongdan.or.kr/booking/1515',
    X: '126.9570',
    Y: '37.4756',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '관악구',
    IMGURL: '/images/courts/gwanak-guminundong.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 4면 (야간 조명), 관악구시설관리공단 운영, 낙성대역 인근\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 주간 평일 5,500원 / 주말·공휴일 7,700원 / 야간 11,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00, 신정 + 설/추석 연휴 휴장\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 관악구시설관리공단 (booking.gwanakgongdan.or.kr), 추첨제 (등록팀 매월 1~19일 신청 → 20일 추첨, 일반팀 24일 선착순)\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 있음',
    TELNO: '02-2015-2750',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SC001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '반포종합운동장 테니스장',
    PAYATNM: '유료',
    PLACENM: '반포종합운동장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.thetennisplay.com',
    X: '126.9956',
    Y: '37.5010',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '서초구',
    IMGURL: '/images/courts/seocho-banpo.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 12면, 서초구테니스협회 운영\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 9,000원, 주말·공휴일 11,000원, 조명료 3,000원 별도\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 평일 06:00~22:00, 주말·공휴일 06:00~20:00, 명절 당일 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 온라인 예약 (thetennisplay.com), 사용일 1주일 전 오전 9시부터\r\n\r\n' +
      '◎ 환불\r\n' +
      '- 우천·폭설·사용일 3일 전 100% / 1~2일 전 50% / 당일 불가',
    TELNO: '02-536-0555',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SC002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '내곡동체육시설 테니스장',
    PAYATNM: '유료',
    PLACENM: '내곡동체육시설',
    USETGTINFO: '제한없음',
    SVCURL: 'https://booking.naver.com/booking/10/bizes/217811',
    X: '127.0829',
    Y: '37.4587',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '서초구',
    IMGURL: '/images/courts/seocho-naegok.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 6면 (3,419㎡), 미래생활체육연합회 운영\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 6,000원, 주말·공휴일 8,000원, 야간조명료 2,000원 별도\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 네이버 예약 (검색: 내곡테니스장), 단체 1일 2시간 제한',
    TELNO: '02-451-4777',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SC003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '매헌시민의숲 양재테니스장',
    PAYATNM: '유료',
    PLACENM: '시민의숲',
    USETGTINFO: '제한없음',
    SVCURL: 'https://booking.naver.com/booking/10/bizes/210031',
    X: '127.0359',
    Y: '37.4717',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '서초구',
    IMGURL: '/images/courts/seocho-maeheon.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 실내 3면 + 실외 8면 = 총 11면, 미래생활체육연합회 운영\r\n\r\n' +
      '◎ 이용요금 — 실외 (1시간)\r\n' +
      '- 평일 9,000원, 주말·공휴일 11,000원, 야간조명료 2,000원 별도\r\n\r\n' +
      '◎ 이용요금 — 실내 (1시간)\r\n' +
      '- 평일 27,000원/면, 주말·공휴일 31,000원/면 (조명료 포함)\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 네이버 예약 (검색: 양재테니스장)\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 매헌시민의숲 주차장 이용 가능',
    TELNO: '02-575-4777',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SD001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '마장테니스장',
    PAYATNM: '유료',
    PLACENM: '마장테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://sports.happysd.or.kr/fmcs/192',
    X: '127.0389',
    Y: '37.5641',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '성동구',
    IMGURL: '/images/courts/seongdong-majang.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 클레이코트 2면 (1코트, 2코트), 성동구도시관리공단 운영\r\n\r\n' +
      '◎ 이용요금 (1면 2시간)\r\n' +
      '- 평일 10,000원, 토·일·공휴일 13,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 09:00~18:00, 신정 + 설/추석 연휴 휴관\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 성동구도시관리공단 (sports.happysd.or.kr), 정기대관 매월 15~20일, 수시대관 성동구민 전월 21일~ / 타구민 매월 1일~\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 보험증권 제출 필수, 클레이코트용 테니스화 착용 의무',
    TELNO: '02-2204-7640',
    V_MIN: '09:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '올림픽공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '올림픽테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.ksponco.or.kr/online/tennis/resrvtn_aplictn.do',
    X: '127.1284',
    Y: '37.5154',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-olympic.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트(케미칼) 실외 14면, 한국체육산업개발(KSPO&CO) 운영, 올림픽공원 내\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 주간 10,000원, 새벽·야간 13,000원 / 주말 주간 15,000원, 새벽·야간 18,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- KSPO&CO 온라인 (ksponco.or.kr), 이용 7일 전 오전 9시 오픈, 선착순, 1인 최대 2시간\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 신분증 지참 필수, 주차권 5,000원 (2시간 예약 시)',
    TELNO: '02-2180-3778',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '올림픽공원 실내테니스장',
    PAYATNM: '유료',
    PLACENM: '올림픽실내테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.ksponco.or.kr/online/tennis/resrvtn_aplictn.do',
    X: '127.1282',
    Y: '37.5136',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-olympic-indoor.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트(케미칼) 실내 4면 + 센터코트 1면, 한국체육산업개발(KSPO&CO) 운영\r\n\r\n' +
      '◎ 이용요금 (1시간)\r\n' +
      '- 평일 30,000원, 주말·공휴일 35,000원 / 센터코트 주말 50,000원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~21:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- KSPO&CO 온라인 (ksponco.or.kr), 이용 7일 전 오전 9시 오픈, 선착순',
    TELNO: '02-2180-3778',
    V_MIN: '06:00',
    V_MAX: '21:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP003',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '오금공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '오금공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://yeyak.seoul.go.kr',
    X: '127.1333',
    Y: '37.5005',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-ogeum.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 코트 2면, 송파구시설관리공단 운영, 오금근린공원 내\r\n\r\n' +
      '◎ 이용요금 (1면 1시간)\r\n' +
      '- 평일 주간 4,000원, 야간 5,200원 / 주말 5,200원\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 서울시 공공서비스예약 (yeyak.seoul.go.kr), 방문/전화예약도 가능 (02-402-3700)\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 송파구민 전용',
    TELNO: '02-402-3700',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP004',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '오륜테니스장',
    PAYATNM: '유료',
    PLACENM: '오륜테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://yeyak.seoul.go.kr',
    X: '127.1408',
    Y: '37.5129',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-oryun.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 클레이코트 6면 (2024.11 복토공사 완료), 송파구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 16,000원/2시간 (평일), 주말·야간 30% 할증\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 서울시 공공서비스예약 (yeyak.seoul.go.kr), 송파구민 우선\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 2024.11 화장실·샤워장·휴게실 리모델링 완료',
    TELNO: '02-402-8174',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP005',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '송파테니스장',
    PAYATNM: '유료',
    PLACENM: '송파테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.songpagongdan.or.kr',
    X: '127.1125',
    Y: '37.5042',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-songpa.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 코트 2면, 송파구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 16,000원/2시간 (평일), 주말·야간 30% 할증\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 07:00~18:00 (야간 없음, 다른 송파구 코트와 다름)\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 송파구공공체육시설 통합사이트 (songpagongdan.or.kr), 송파구민 우선',
    TELNO: '02-402-8174',
    V_MIN: '07:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_SP006',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '성내천테니스장',
    PAYATNM: '유료',
    PLACENM: '성내천테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.songpagongdan.or.kr',
    X: '127.1152',
    Y: '37.5242',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '송파구',
    IMGURL: '/images/courts/songpa-seongnaecheon.jpg',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 2면 (2024.11 인조잔디로 교체), 송파구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 16,000원/2시간 (평일), 주말·야간 30% 할증\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 송파구공공체육시설 통합사이트 (songpagongdan.or.kr), 송파구민 우선',
    TELNO: '02-402-8174',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_YC001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '목동테니스장 (양천구시설관리공단)',
    PAYATNM: '유료',
    PLACENM: '목동테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.ycs.or.kr',
    X: '126.8778',
    Y: '37.5280',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '양천구',
    IMGURL: '/images/courts/yangcheon-mokdong.webp',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 실외 15면 + 실내 3면 = 총 18면, 양천구시설관리공단 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 실외 평일 9,900원/2시간, 실내 평일 23,000원/2시간\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 양천구시설관리공단 (ycs.or.kr), 양천구민 09:00~09:30 우선, 이후 누구나 선착순, 이용일 기준 1주일 후까지 예약\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 서울시 최대 규모 공공 테니스장. 서울에너지공사 목동(공휴일 2면)과 동일 부지이나 별도 예약 시스템',
    TELNO: '02-2643-0686',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_MP001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '난지물재생센터 테니스장',
    PAYATNM: '무료',
    PLACENM: '난지물재생센터',
    USETGTINFO: '제한없음',
    SVCURL: 'https://yeyak.seoul.go.kr',
    X: '126.8502',
    Y: '37.5900',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '마포구',
    IMGURL: '/images/courts/mapo-nanji.webp',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 인조잔디 코트 4면 (A·B·C·D코트), 서울시 물재생센터 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 무료 (서울시민)\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 서울시 공공서비스예약 (yeyak.seoul.go.kr)\r\n\r\n' +
      '◎ 참고\r\n' +
      '- 행정 주소는 경기도 고양시 덕양구이나 마포구 상암동 인근 위치. 난지한강테니스장과 별도 시설',
    TELNO: '',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GR001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '고척근린공원 테니스장',
    PAYATNM: '유료',
    PLACENM: '고척근린공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.guro-gurosportsclub.or.kr/fmcs/3',
    X: '126.8511',
    Y: '37.5060',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '구로구',
    IMGURL: '/images/courts/guro-gocheok.webp',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 하드코트 3면 (조명탑 4기), 구로스포츠클럽 운영\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 5,000원/일\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 06:00~22:00\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 구로스포츠클럽 (guro-gurosportsclub.or.kr), 2025.6 온라인 예약 전환\r\n\r\n' +
      '◎ 편의시설\r\n' +
      '- 화장실, 음수대, 그늘막',
    TELNO: '02-2066-3004',
    V_MIN: '06:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_GC001',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '가산유수지 체육공원 테니스장',
    PAYATNM: '무료',
    PLACENM: '가산유수지 체육공원',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.geumcheon.go.kr/reserve/webErntList.do?key=115&rep=1',
    X: '126.8754',
    Y: '37.4826',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '금천구',
    IMGURL: '',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 가산2빗물펌프장 유수지 체육공원 내 다목적구장\r\n' +
      '- 테니스장 2면 (테니스·농구 겸용 34m×21m 포장코트), 야간조명 완비\r\n' +
      '- 배드민턴장 2면, 농구장 1면, 족구장 1면 병설 (유수지 약 3,827㎡)\r\n' +
      '- 금천구청 치수과 직영 (자율이용)\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 무료 (자율이용) ※ 별도 요금표 미고지, 이용 전 확인 권장\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 평일 09:00~22:00\r\n' +
      '- 주말 07:00~22:00 (4~9월) / 08:00~22:00 (10~3월)\r\n' +
      '- 1회 최대 2시간, 정원 4명\r\n' +
      '- ※ 우기·수방기간(5.15~10.15)에는 유수지 치수기능 유지를 위해 이용이 제한될 수 있음\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 금천구 통합예약(인터넷) 온라인 신청\r\n' +
      '- 이용일 10일 전 09시 ~ 5일 전 09시 접수, 취소는 이용일 1일 전까지\r\n' +
      '- 문의: 금천구청 치수과 02-2627-2038',
    TELNO: '02-2627-2038',
    V_MIN: '09:00',
    V_MAX: '22:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
  {
    SVCID: 'INDEP_YC002',
    MAXCLASSNM: '체육시설',
    MINCLASSNM: '테니스장',
    SVCSTATNM: '외부예약',
    SVCNM: '안양천 테니스장 (신정교 하부)',
    PAYATNM: '무료',
    PLACENM: '안양천 테니스장',
    USETGTINFO: '제한없음',
    SVCURL: 'https://www.yangcheon.go.kr/reservation/reservation/main.do',
    X: '126.8781',
    Y: '37.5220',
    SVCOPNBGNDT: '',
    SVCOPNENDDT: '',
    RCPTBGNDT: '',
    RCPTENDDT: '',
    AREANM: '양천구',
    IMGURL: '',
    DTLCONT:
      '◎ 시설현황\r\n' +
      '- 안양천 신정교 하부 둔치, 양천구청 직영 야외 테니스장\r\n' +
      '- 인조잔디 코트 3면 (1·2·3코트, 최근 재시공)\r\n\r\n' +
      '◎ 이용요금\r\n' +
      '- 무료\r\n\r\n' +
      '◎ 운영시간\r\n' +
      '- 08:00~18:00 (2시간 단위 예약)\r\n' +
      '- 주말 14:00~18:00은 1·2코트 주말리그·대회 운영, 3코트는 매월 2·4주 토 08:00~10:00 구민 무료강좌\r\n' +
      '- ※ 우천 시 사용 금지, 하천부지 특성상 집중호우·증수 시 통제될 수 있음\r\n\r\n' +
      '◎ 예약방법\r\n' +
      '- 서울시 공공서비스예약(yeyak.seoul.go.kr) 아님\r\n' +
      '- 양천구청 통합예약포털(yangcheon.go.kr/reservation)에서 온라인 선착순\r\n' +
      '- 당월분은 전월 마지막 주 수요일 오전 10시 오픈 (주중 2타임·주말 1타임, 양천구민·관내 직장인 우선)\r\n' +
      '- 테니스화 착용·테니스공 지참 필수\r\n' +
      '- 문의: 양천구청 체육과 02-2620-3416~9\r\n\r\n' +
      '◎ 주차\r\n' +
      '- 신정교 하부 무료 주차장 이용',
    TELNO: '02-2620-3416',
    V_MIN: '08:00',
    V_MAX: '18:00',
    REVSTDDAYNM: '',
    REVSTDDAY: '',
  },
];

export function getIndependentCourts(): SeoulService[] {
  return INDEPENDENT_COURTS;
}

/** Check if a court is from independent data (not Seoul API) */
export function isIndependentCourt(svcId: string): boolean {
  return svcId.startsWith('INDEP_');
}
