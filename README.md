# 서울 테니스

> 서울시 25개 자치구 공공 테니스장 예약 현황을 실시간으로 확인하고, 바로 예약할 수 있는 서비스

**[seoul-tennis.com](https://seoul-tennis.com)**

---

## 왜 만들었나요?

서울시에는 많은 공공 테니스장이 있지만, 예약 정보가 여러 곳에 흩어져 있어 원하는 시간에 예약 가능한 코트를 찾기가 어렵습니다. 서울 테니스는 이 정보를 한곳에 모아, 누구나 쉽게 빈 코트를 찾고 예약할 수 있도록 만들었습니다.

## 주요 기능

### 핵심 페이지

| 페이지 | 설명 |
|--------|------|
| **홈** | 25개 자치구별 테니스장 목록, 인기 랭킹 TOP 5, 즐겨찾기 현황, 날씨/미세먼지 요약 |
| **오늘 예약** | 오늘 바로 예약 가능한 테니스장만 모아서 보기 |
| **구별 비교** | 자치구별 코트 수/예약률/무료 코트/경쟁률/평점 비교 |
| **경쟁률** | 시간대/요일별 예약 경쟁률 추이 분석 |
| **캘린더** | 날짜별 예약 현황을 달력 뷰로 확인 |
| **경기 기록** | 테니스 경기 기록 관리 (승패, 스코어, 상대, 코트, 비용, 사진) |
| **매칭** | 같이 테니스 칠 파트너를 모집하거나 참여하는 오픈 매칭 게시판 |
| **래더** | ELO 기반 랭킹 시스템으로 실력 증명 및 순위 경쟁 |
| **양도 마켓** | 코트 예약을 양도하거나 원하는 시간대의 코트를 구하는 마켓 |

### 코트 상세 정보

- **실시간 예약 상태** -- 접수중/마감 등 상태 확인 후 바로 예약 페이지 이동
- **이용 후기 & 별점** -- 실제 이용자의 리뷰와 사진으로 코트 선택 참고
- **실시간 날씨** -- 코트 위치 기반 기온/강수 정보, 실외 코트 우천 주의
- **실시간 미세먼지** -- PM2.5/PM10 등급과 수치, 나쁨 시 실내 코트 안내
- **비슷한 테니스장 추천** -- 같은 장소/인근 지역의 대안 코트 자동 추천
- **길찾기** -- T맵·네이버 지도·카카오맵으로 테니스장까지 길찾기
- **전화번호 바로 연결** -- 시설 연락처 탭 한 번으로 전화

### 경기 기록

- **매치 기록** -- 단식/복식 경기 결과, 스코어, 상대 정보 기록
- **통계 분석** -- 승률, 매치 수, 코트별/매치 타입별 통계
- **테니스 프로필** -- NTRP 레이팅, 구력, 실력 레벨, 선호 손 등 프로필 관리
- **이미지 첨부** -- 경기 사진 업로드 (최대 3장)

### 커뮤니티

- **오픈 매칭** -- 날짜·장소·실력 수준을 지정해 테니스 파트너를 모집하고 신청
- **ELO 래더** -- 단식/복식 ELO 랭킹 시스템, 티어별 리더보드
- **양도 마켓** -- 코트 예약 양도 등록, 관심 표시, 연락처 비공개(관심 표시 후 공개)
- **유저 프로필** -- 닉네임·성별 아바타·NTRP 레이팅으로 커뮤니티 프로필 구성

### 편의 기능

- **즐겨찾기** -- 자주 가는 테니스장 저장, 홈에서 바로 확인
- **푸시 알림** -- 즐겨찾기한 코트 예약 시작 시 알림
- **자치구 가이드** -- 지역별 테니스장 특징/접근성/주차 등 상세 가이드
- **인기 랭킹 TOP 5** -- 평점/즐겨찾기/경쟁률 종합 랭킹
- **PWA 설치** -- 홈 화면에 추가하여 앱처럼 사용
- **테마 전환** -- 미니멀 / 네오브루탈리즘 두 가지 디자인 테마
- **카카오 공유** -- 코트 정보를 카카오톡으로 공유

## 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **DB / 인증** | Supabase (Kakao/Google OAuth) |
| **데이터 페칭** | SWR |
| **지도** | Kakao Maps SDK, T맵/네이버 지도/카카오맵 길찾기 연동 |
| **PWA** | Serwist |
| **테스트** | Vitest + Testing Library |
| **배포** | Vercel (ICN 리전) |
| **분석** | Google Analytics, AdSense |

## 데이터 출처

| 데이터 | 출처 |
|--------|------|
| 테니스장 예약 현황 | [서울 열린데이터광장](https://data.seoul.go.kr) -- 공공서비스예약 API |
| 실시간 대기질 | 서울 열린데이터광장 -- 자치구별 대기환경 API |
| 전국 대기질 | [에어코리아](https://www.airkorea.or.kr) -- 대기오염 정보 API |
| 실시간 날씨 | [기상청](https://www.weather.go.kr) -- 단기예보 API |

## 시작하기

### 사전 준비

- Node.js 18+
- [Supabase](https://supabase.com) 프로젝트
- [서울 열린데이터광장](https://data.seoul.go.kr) API 키

### 설치 및 실행

```bash
git clone https://github.com/your-username/seoul-tennis-reserve-app.git
cd seoul-tennis-reserve-app

npm install

cp .env.example .env.local
# .env.local 파일에 환경변수 값을 입력하세요

npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

### 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | O |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (클라이언트) | O |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 키 (서버) | O |
| `SEOUL_OPEN_DATA_KEY` | 서울 열린데이터 API 키 | O |
| `SEOUL_AIR_QUALITY_KEY` | 서울 대기질 API 키 | O |
| `WEATHER_API_KEY` | 기상청 단기예보 API 키 | O |
| `AIRKOREA_API_KEY` | 에어코리아 대기질 API 키 | O |
| `LIVING_WEATHER_API_KEY` | 생활기상지수 API 키 | O |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오 지도 SDK 키 | O |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID 공개 키 | O |
| `VAPID_PRIVATE_KEY` | Web Push VAPID 비밀 키 | O |
| `CRON_SECRET` | Cron 엔드포인트 인증 Bearer 토큰 | O |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense 클라이언트 ID | - |
| `NEXT_PUBLIC_AD_SLOT_HOME_TOP` | AdSense 슬롯: 홈 상단 | - |
| `NEXT_PUBLIC_AD_SLOT_HOME_BOTTOM` | AdSense 슬롯: 홈 하단 | - |
| `NEXT_PUBLIC_AD_SLOT_DISTRICT_TOP` | AdSense 슬롯: 자치구 상단 | - |
| `NEXT_PUBLIC_AD_SLOT_COURT_MIDDLE` | AdSense 슬롯: 코트 상세 중간 | - |
| `NEXT_PUBLIC_AD_SLOT_COURT_BOTTOM` | AdSense 슬롯: 코트 상세 하단 | - |
| `NEXT_PUBLIC_AD_SLOT_SIDEBAR` | AdSense 슬롯: 사이드바 | - |
| `NEXT_PUBLIC_SEARCH_V2_ROLLOUT_PERCENT` | v2 검색 랭킹 롤아웃 비율 (0~100, 기본 100) | - |
| `NEXT_PUBLIC_SEARCH_V2_FORCE` | 검색 변형 강제 (`v2` 또는 `legacy`) | - |
| `NEXT_PUBLIC_SEARCH_V2_PROFILE` | v2 랭킹 프로파일 (`balanced`/`precision`/`recall`) | - |

`NEXT_PUBLIC_SEARCH_V2_FORCE`가 설정되면 롤아웃 비율보다 우선 적용됩니다.

### 주요 명령어

```bash
npm run dev        # 개발 서버 (webpack)
npm run build      # 프로덕션 빌드 (webpack)
npm run lint       # ESLint
npm run test       # Vitest 테스트 (watch 모드)
npm run test:run   # 테스트 1회 실행
```

## 프로젝트 구조

```
app/
  page.tsx                  # 홈 (자치구 그리드, 인기 코트, 즐겨찾기)
  today/                    # 오늘 예약 가능 코트
  compare/                  # 자치구별 비교
  trends/                   # 경쟁률 추이
  calendar/                 # 캘린더 뷰
  records/                  # 경기 기록 (목록, 작성, 상세, 수정)
  matching/                 # 매칭 (게시판, 글쓰기, 상세)
  ladder/                   # 래더 (ELO 리더보드)
  transfers/                # 양도 마켓 (목록, 등록, 상세)
  [district]/               # 자치구별 코트 목록
    [courtId]/              # 코트 상세 (리뷰, 날씨, 지도)
  my/                       # 마이페이지 (즐겨찾기, 알림, 테니스 프로필)
  guide/[district]/         # 자치구 가이드
  guide/matching/           # 매칭 기능 가이드
  guide/ladder/             # 래더 시스템 가이드
  guide/transfers/          # 양도 마켓 가이드
  login/                    # 로그인 (Kakao, Google)
  about/                    # 서비스 소개
  api/
    tennis/                 # 테니스장 데이터 (서울 API 프록시)
    weather/                # 실시간 날씨
    air-quality/            # 실시간 대기질
    records/                # 경기 기록 CRUD + 통계
    profile/tennis/         # 테니스 프로필
    profile/me/             # 유저 프로필 (닉네임, 아바타)
    matching/               # 매칭 게시판 CRUD + 신청
    ladder/                 # 래더 리더보드 + 프로필 + 히스토리
    transfers/              # 양도 마켓 CRUD + 관심 표시
    reviews/                # 리뷰 CRUD
    favorites/              # 즐겨찾기 CRUD
    trends/                 # 경쟁률 데이터
    popular-courts/         # 인기 코트 랭킹
    push/                   # 푸시 알림 구독
    alerts/                 # 알림 설정
    feedback/               # 피드백 제출
    cron/                   # 스케줄 작업 (스냅샷, 랭킹, 알림, 정리, 양도 만료)

components/                 # React 컴포넌트
  layout/                   # Header, Footer, BottomNav
  home/                     # 홈페이지 (검색, 인기 코트)
  court-detail/             # 코트 상세 (지도, 요금, 유사 코트)
  weather/                  # 날씨, 미세먼지
  review/                   # 리뷰 폼, 목록
  favorite/                 # 즐겨찾기 버튼, 섹션
  alert/                    # 알림 설정
  records/                  # 경기 기록 (폼, 카드, 상세, 통계)
  matching/                 # 매칭 (게시판, 카드, 폼, 상세)
  ladder/                   # 래더 (리더보드, 랭크 카드, ELO 차트)
  transfers/                # 양도 (목록, 카드, 폼, 상세)
  profile/                  # 프로필 (테니스, 유저, 아바타, ProfileGate)
  ui/                       # 공통 UI (Toast, Spinner, ShareButton 등)
  pwa/                      # PWA 설치 프롬프트

lib/                        # 유틸리티
  seoulApi.ts               # 서울 API 클라이언트
  supabase.ts               # Supabase 브라우저 클라이언트
  supabaseServer.ts         # Supabase 서버 클라이언트
  hooks/                    # 커스텀 훅 (즐겨찾기, 기록, 프로필 등)
  constants/                # 상수 (자치구, 테니스, 매칭, 래더, 양도, 프로필)
  utils/                    # 유틸리티 (상태, 통계, 날씨 등)

contexts/                   # React Context (Auth, Theme, TennisData, Toast)

supabase/
  schema.sql                # DB 스키마
  migrations/               # 마이그레이션
```

## 배포

Vercel에 배포됩니다. 자세한 가이드는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
