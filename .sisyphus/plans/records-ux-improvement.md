# 경기 기록 UX 개선 — 핵심 기능 프로모션 및 접근성 강화

## TL;DR

> **Quick Summary**: 경기 기록 기능을 앱의 핵심 기능으로 격상시키기 위해 모바일 네비게이션 재구성, 소프트 로그인 게이트, 홈 프로모션 카드, 코트 상세 CTA, 튜토리얼 가이드 페이지를 구축하고 서비스 문서를 업데이트한다.
> 
> **Deliverables**:
> - BottomNav 5탭 재구성 (홈|오늘예약|기록|비교|MY)
> - Header 경기 기록 링크 비로그인 사용자에게도 노출
> - /records 소프트 게이트 (비로그인 사용자도 미리보기 가능)
> - EmptyRecords 온보딩 콘텐츠 강화
> - 홈 페이지 3-state 경기 기록 프로모션 카드
> - 코트 상세 "이 코트에서 기록하기" 인라인 CTA
> - RecordForm 쿼리 파라미터 코트 프리필
> - /guide/records 튜토리얼 가이드 페이지
> - About 페이지 경기 기록 기능 추가
> - CLAUDE.md 문서 업데이트
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (BottomNav) → Task 5 (Home Promo) → Task 8 (Guide Page) → Final Verification

---

## Context

### Original Request
사용자가 경기 기록 기능을 앱의 핵심 기능으로 만들고 싶다고 요청. 비로그인 상태에서도 메뉴가 보이고, 사용 시 로그인 유도. 메뉴 위치/레이아웃/디자인 고려, 서비스 소개 문서 업데이트, 튜토리얼/예시 페이지 추가 요구.

### Interview Summary
**Key Discussions**:
- **BottomNav 재구성**: 홈|오늘예약|기록|비교|MY (경쟁률/캘린더 제거 → 홈이나 MY에서 접근)
- **소프트 게이트**: /records에서 비로그인 사용자도 미리보기 가능, 기록 작성 시 로그인 유도
- **하드 게이트 유지**: /records/new, /records/[id]/edit은 기존 하드 게이트 유지
- **홈 프로모 카드**: 히어로 바로 아래, 3가지 상태 (비로그인/로그인+기록없음/로그인+기록있음)
- **코트 CTA**: 코트 상세에서 "이 코트에서 게임 기록하기" 인라인 CTA (NOT fixed-bottom)
- **튜토리얼**: 정적 가이드 페이지 + 인라인 온보딩 (둘 다)
- **문서**: About 페이지 + 가이드 페이지 + CLAUDE.md 업데이트

**Research Findings**:
- Strava/NRC/MyFitnessPal 벤치마크: 소프트 게이트, 컨텍스트 CTA, 빈 상태를 전환 도구로 활용
- BottomNav는 코트 상세 페이지에서 숨겨짐 (`/^\/[^/]+-gu\/S/` regex)
- 기존 코트 상세 fixed-bottom 예약 CTA (lines 562-577)와 충돌 방지 필요
- RecordsContent FAB은 `bottom-20` (z-40), BottomNav는 z-50 — 스택킹 확인 필요

### Metis Review
**Identified Gaps** (addressed):
- MY 탭 비로그인 시 redirect flash → 수용 가능 (middleware /my 보호 유지)
- /trends, /calendar 접근 경로 소실 위험 → 홈에서 빠른 링크 제공
- 코트 CTA 프리필 메커니즘 미정 → 쿼리 파라미터 방식 확정 (`?courtName=X&district=Y`)
- 헤더 링크 5개 overflow 위험 → sm breakpoint에서 테스트 필수
- 샘플 데이터 정의 부재 → 소프트 게이트 미리보기는 기능 소개 카드로 대체 (가짜 데이터 불필요)
- EmptyRecords 개선 범위 → 기존 컴포넌트 확장 (Props 추가), 레이아웃 변경 없음

---

## Work Objectives

### Core Objective
경기 기록 기능을 비로그인 사용자에게도 발견 가능하게 만들고, 모든 주요 진입점(네비게이션, 홈, 코트 상세)에서 자연스러운 CTA를 제공하여 기록 기능 사용률을 극대화한다.

### Concrete Deliverables
- `components/layout/BottomNav.tsx` — 5탭 재구성
- `components/layout/Header.tsx` — 경기 기록 링크 조건부 렌더링 제거
- `app/records/page.tsx` — 소프트 게이트 페이지
- `components/records/EmptyRecords.tsx` — 온보딩 콘텐츠 강화
- `components/home/RecordsPromoCard.tsx` — 새 컴포넌트 (3-state)
- `components/home/HomeContent.tsx` — 프로모 카드 삽입
- `components/court-detail/CourtDetailClient.tsx` — 인라인 CTA 추가
- `components/records/RecordForm.tsx` — 쿼리 파라미터 프리필
- `app/guide/records/page.tsx` — 가이드 페이지
- `components/guide/RecordsGuideContent.tsx` — 가이드 콘텐츠
- `app/about/page.tsx` — 경기 기록 기능 추가
- `CLAUDE.md` — 문서 업데이트

### Definition of Done
- [ ] `npm run build` 성공 (0 errors)
- [ ] 모든 12개 파일이 올바르게 수정/생성됨
- [ ] 모바일 BottomNav에 "기록" 탭 표시
- [ ] 비로그인 사용자가 /records 접근 시 미리보기 표시
- [ ] 홈 페이지에 경기 기록 프로모 카드 표시
- [ ] 코트 상세에서 "이 코트에서 기록하기" CTA 표시
- [ ] /guide/records 페이지 접근 가능
- [ ] About 페이지에 경기 기록 기능 포함

### Must Have
- BottomNav 5탭: 홈|오늘예약|기록|비교|MY
- 비로그인 /records 접근 시 기능 미리보기 + 로그인 유도
- /records/new, /records/[id]/edit 하드 게이트 유지
- 홈 프로모 카드 3가지 상태 (비로그인/로그인+기록없음/로그인+기록있음)
- 코트 상세 CTA는 반드시 인라인 (fixed-bottom 금지)
- 듀얼 테마 (Neo-Brutalism + Minimal) 모든 새 UI에 적용
- 한국어 우선 UI
- 모바일 우선 반응형 디자인

### Must NOT Have (Guardrails)
- RecordForm, RecordCard, RecordDetail, RecordStats 컴포넌트 수정 금지 (Phase 1 산출물 보호)
- `/records`를 middleware PROTECTED_PATHS에 추가 금지
- 코트 상세의 기존 fixed-bottom 예약 CTA (lines 562-577) 수정/제거 금지
- 가짜 샘플 데이터 생성 금지 (소프트 게이트에서는 기능 소개 카드 사용)
- 외부 의존성 추가 금지 (package.json 변경 없음)
- 코트 상세 CTA를 fixed-bottom 위치에 배치 금지

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + @testing-library/react)
- **Automated tests**: Tests-after (선택적, UI 중심 변경이므로 Playwright QA 우선)
- **Framework**: vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

| Deliverable Type | Verification Tool | Method |
|------------------|-------------------|--------|
| BottomNav/Header | Playwright | Navigate, check visibility, click, assert DOM |
| Soft Gate | Playwright | Visit /records without auth, assert preview content |
| Home Promo Card | Playwright | Check rendering at /, assert state transitions |
| Court Detail CTA | Playwright | Navigate to court detail, assert inline CTA |
| Guide Page | Playwright | Navigate /guide/records, verify content |
| About Page | Playwright | Navigate /about, verify records mention |
| RecordForm Pre-fill | Playwright | Navigate with query params, assert field values |
| Build | Bash | `npm run build` → exit code 0 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Navigation — foundation, start immediately):
├── Task 1: BottomNav 5탭 재구성 [visual-engineering]
├── Task 2: Header 경기 기록 링크 조건부 렌더링 제거 [quick]
└── Task 3: /records 소프트 게이트 전환 [visual-engineering]

Wave 2 (Core UX — after Wave 1):
├── Task 4: EmptyRecords 온보딩 콘텐츠 강화 [visual-engineering]
├── Task 5: RecordsPromoCard 3-state 컴포넌트 + HomeContent 삽입 [visual-engineering]
└── Task 6: 코트 상세 인라인 CTA + RecordForm 쿼리 파라미터 프리필 [visual-engineering]

Wave 3 (Documentation — after Wave 2):
├── Task 7: /guide/records 튜토리얼 가이드 페이지 [visual-engineering]
├── Task 8: About 페이지 경기 기록 기능 추가 [quick]
└── Task 9: CLAUDE.md 문서 업데이트 [quick]

Wave FINAL (Verification — after ALL tasks):
├── Task F1: Plan Compliance Audit [oracle]
├── Task F2: Code Quality Review [unspecified-high]
├── Task F3: Real Manual QA [unspecified-high + playwright]
└── Task F4: Scope Fidelity Check [deep]
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|------------|--------|------|
| 1 | — | 4, 5 | 1 |
| 2 | — | — | 1 |
| 3 | — | 4, 5, 6 | 1 |
| 4 | 3 | 7 | 2 |
| 5 | 1 | 7 | 2 |
| 6 | 3 | — | 2 |
| 7 | 4, 5 | — | 3 |
| 8 | — | — | 3 |
| 9 | 7 | — | 3 |
| F1-F4 | 1-9 | — | FINAL |

### Agent Dispatch Summary

| Wave | # Parallel | Tasks → Agent Category |
|------|------------|----------------------|
| 1 | **3** | T1 → `visual-engineering`, T2 → `quick`, T3 → `visual-engineering` |
| 2 | **3** | T4 → `visual-engineering`, T5 → `visual-engineering`, T6 → `visual-engineering` |
| 3 | **3** | T7 → `visual-engineering`, T8 → `quick`, T9 → `quick` |
| FINAL | **4** | F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

- [x] 1. BottomNav 5탭 재구성

  **What to do**:
  - `components/layout/BottomNav.tsx`의 `NAV_ITEMS` 배열을 수정
  - 현재 5탭: 홈|오늘 예약|구별 비교|경쟁률|캘린더
  - 변경: 홈|오늘 예약|기록|비교|MY
  - "기록" 탭: `href: '/records'`, 적절한 테니스/기록 아이콘 SVG 사용
  - "비교" 탭: 기존 "구별 비교"의 href `/compare` 유지, 라벨만 "비교"로 축약
  - "MY" 탭: `href: '/my'`, 사용자 아이콘 SVG 사용
  - 경쟁률(`/trends`), 캘린더(`/calendar`) 탭 제거
  - `isActive` 로직 유지 (`pathname.startsWith(href)` 패턴)
  - 기존 듀얼 테마 스타일링 유지 (`themeClass` 호출)
  - "기록" 탭은 비로그인 사용자에게도 항상 표시 (별도 auth 조건 없음)

  **Must NOT do**:
  - BottomNav의 코트 상세 페이지 숨김 로직 (`isCourtDetail` regex) 수정 금지
  - z-index (z-50) 변경 금지
  - safe-area-inset-bottom 패딩 변경 금지
  - 5탭 초과 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 컴포넌트 수정, SVG 아이콘 선택, 네비게이션 레이아웃 조정
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 네비게이션 UX 패턴, 아이콘 선택, 모바일 탭바 디자인
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요, Final QA에서 사용

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5 (Wave 2에서 BottomNav 존재 전제)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/layout/BottomNav.tsx:7-65` — 현재 NAV_ITEMS 배열 구조, SVG 아이콘 패턴, as const 타입 패턴
  - `components/layout/BottomNav.tsx:67-107` — isActive 로직, themeClass 듀얼 스타일링, isCourtDetail 숨김 로직

  **API/Type References**: N/A

  **Test References**: N/A

  **External References**: N/A

  **WHY Each Reference Matters**:
  - `BottomNav.tsx:7-65`: NAV_ITEMS 배열 교체 대상. SVG viewBox/stroke 패턴을 새 아이콘에도 동일하게 적용해야 함
  - `BottomNav.tsx:67-107`: isCourtDetail regex와 isActive 로직을 건드리지 않으면서 NAV_ITEMS만 교체해야 함

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 모바일에서 BottomNav 5탭 표시 확인 (Happy path)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running at localhost:3000, viewport 390x844 (iPhone 14)
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert bottom nav is visible: `nav.fixed.bottom-0` selector exists
      3. Assert exactly 5 tab items: `nav.fixed.bottom-0 a` count === 5
      4. Assert tab labels in order: ['홈', '오늘 예약', '기록', '비교', 'MY']
      5. Assert tab hrefs in order: ['/', '/today', '/records', '/compare', '/my']
      6. Take screenshot
    Expected Result: 5탭 모두 올바른 라벨과 href로 표시
    Failure Indicators: 탭 수 ≠ 5, 라벨 순서 불일치, href 불일치
    Evidence: .sisyphus/evidence/task-1-bottomnav-5tabs.png

  Scenario: "기록" 탭 클릭 시 /records 이동
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, mobile viewport
    Steps:
      1. Navigate to http://localhost:3000
      2. Click bottom nav link with text "기록"
      3. Wait for navigation
      4. Assert URL contains '/records'
      5. Assert "기록" tab has active styling
    Expected Result: /records로 이동, 기록 탭 활성화 스타일 적용
    Failure Indicators: 404, 다른 페이지로 이동, 활성화 스타일 미적용
    Evidence: .sisyphus/evidence/task-1-records-tab-active.png

  Scenario: 코트 상세 페이지에서 BottomNav 숨김 유지
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, mobile viewport
    Steps:
      1. Navigate to any court detail page (e.g., http://localhost:3000/송파구/S210401)
      2. Assert `nav.fixed.bottom-0` does NOT exist in DOM
    Expected Result: BottomNav가 코트 상세에서 숨겨짐 (기존 동작 유지)
    Failure Indicators: BottomNav가 보임
    Evidence: .sisyphus/evidence/task-1-court-detail-no-nav.png

  Scenario: 데스크톱에서 BottomNav 숨김 확인
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, viewport 1280x800
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert `nav.fixed.bottom-0` has `sm:hidden` class (not visible on desktop)
    Expected Result: 데스크톱에서 BottomNav 미표시
    Failure Indicators: 데스크톱에서 BottomNav 표시
    Evidence: .sisyphus/evidence/task-1-desktop-no-bottomnav.png
  ```

  **Commit**: YES
  - Message: `feat(nav): restructure BottomNav to promote records`
  - Files: `components/layout/BottomNav.tsx`
  - Pre-commit: `npm run build`

- [x] 2. Header 경기 기록 링크 비로그인 사용자에게도 노출

  **What to do**:
  - `components/layout/Header.tsx`에서 "경기 기록" 링크의 `{user && ...}` 조건부 렌더링 제거
  - Lines 63-70의 `{user && ( ... )}` 래핑을 제거하고, 내부 `<Link>` 만 남김
  - 기존 `hidden sm:block` 클래스 유지 (모바일에서는 BottomNav가 담당)
  - 기존 themeClass 스타일링 유지
  - 다른 헤더 링크들의 순서/스타일 유지

  **Must NOT do**:
  - 다른 헤더 링크(오늘 예약, 구별 비교, 경쟁률, 캘린더) 수정 금지
  - 로그인/로그아웃 버튼 로직 수정 금지
  - 마이페이지 링크 로직 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 파일, 조건문 제거만 필요한 매우 간단한 변경
  - **Skills**: []
    - 추가 스킬 불필요
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 단순 조건문 제거이므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/layout/Header.tsx:63-70` — 제거 대상: `{user && ( <Link href="/records" ... 경기 기록 </Link> )}` 조건부 래핑
  - `components/layout/Header.tsx:39-62` — 다른 nav 링크 패턴 참고 (조건 없이 `hidden sm:block`으로 렌더링)

  **WHY Each Reference Matters**:
  - `Header.tsx:63-70`: 정확히 이 6줄의 `{user && (...)}` 래핑만 제거하고 내부 `<Link>`는 보존해야 함
  - `Header.tsx:39-62`: "오늘 예약", "구별 비교" 등 다른 링크는 조건 없이 렌더링되므로, "경기 기록"도 동일 패턴으로 만드는 것

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 비로그인 상태에서 Header에 "경기 기록" 링크 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, viewport 1280x800, NOT logged in
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert header `nav` contains link with text "경기 기록"
      3. Assert link href is "/records"
      4. Assert link has `hidden sm:block` class (desktop only)
      5. Take screenshot
    Expected Result: "경기 기록" 링크가 비로그인 데스크톱에서도 표시
    Failure Indicators: 링크 미표시, href 불일치
    Evidence: .sisyphus/evidence/task-2-header-records-link-noauth.png

  Scenario: 헤더 링크 5개 sm breakpoint overflow 확인
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, viewport 640x800 (sm breakpoint 경계)
    Steps:
      1. Navigate to http://localhost:3000
      2. Check header nav doesn't overflow: no horizontal scroll on header
      3. Assert all 5 desktop links visible: 오늘 예약, 구별 비교, 경쟁률, 캘린더, 경기 기록
    Expected Result: 640px에서 레이아웃 깨짐 없음 (overflow-x 없음)
    Failure Indicators: 가로 스크롤, 링크 겹침, 줄바꿈
    Evidence: .sisyphus/evidence/task-2-header-sm-breakpoint.png
  ```

  **Commit**: YES
  - Message: `feat(nav): show records link to all users in Header`
  - Files: `components/layout/Header.tsx`
  - Pre-commit: `npm run build`

- [x] 3. /records 소프트 게이트 전환

  **What to do**:
  - `app/records/page.tsx` 전면 리디자인
  - 현재: 비로그인 시 "로그인이 필요합니다" 하드 게이트 → 변경: 기능 소개 미리보기 + 로그인 유도
  - **비로그인 상태 UI**:
    - 상단에 경기 기록 기능 소개 영역 (제목 + 설명)
    - 3-4개 기능 카드 (예: "경기 스코어 기록", "통계 분석", "승률 추적", "코트별 기록")
    - 각 카드에 아이콘 + 제목 + 짧은 설명
    - 하단에 "로그인하고 나의 경기 기록 시작하기" CTA 버튼
    - CTA 클릭 시 기존 LoginPrompt 모달 열기 (button-triggered 패턴)
    - 가이드 페이지로 가는 링크 (Task 7 이후 활성화)
  - **로그인 상태 UI**: 기존 `<RecordsContent />` 그대로 렌더링
  - 듀얼 테마 적용 필수
  - 로딩 상태 유지

  **Must NOT do**:
  - RecordsContent 컴포넌트 수정 금지
  - `/records`를 middleware PROTECTED_PATHS에 추가 금지
  - LoginPrompt에 `isOpen={true}` 직접 전달 금지 (timing bug — button-triggered만 사용)
  - 가짜 샘플 데이터/통계 표시 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 새 UI 디자인, 기능 소개 카드 레이아웃, CTA 디자인, 듀얼 테마
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 소프트 게이트 UX 패턴, 카드 레이아웃, CTA 배치
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6 (소프트 게이트 패턴 기반)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `app/records/page.tsx:1-67` — 현재 전체 코드. 비로그인 하드 게이트(lines 24-62)를 소프트 게이트로 교체. 로그인 상태(line 65)는 유지
  - `components/auth/LoginPrompt.tsx` — LoginPrompt 모달 컴포넌트. `isOpen` + `onClose` props. 반드시 button-triggered로 사용 (useState false → onClick true)
  - `app/records/page.tsx:12` — `const [showLogin, setShowLogin] = useState(false)` 패턴 유지

  **API/Type References**: N/A

  **External References**: N/A

  **WHY Each Reference Matters**:
  - `app/records/page.tsx:24-62`: 이 하드 게이트 블록 전체를 기능 소개 미리보기 UI로 교체
  - `LoginPrompt`: 소프트 게이트 CTA 클릭 시 모달 열기 패턴. isOpen={true} 직접 전달은 timing bug 발생 — 반드시 button onClick에서 true로 전환
  - `RecordsContent`: line 65의 `<RecordsContent />` 렌더링은 그대로 유지

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 비로그인 상태에서 /records 미리보기 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, NOT logged in, mobile viewport
    Steps:
      1. Navigate to http://localhost:3000/records
      2. Assert page does NOT show "로그인이 필요합니다" (하드 게이트 제거 확인)
      3. Assert page contains 기능 소개 카드 (최소 3개 카드 요소)
      4. Assert CTA button exists with text containing "로그인"
      5. Take screenshot
    Expected Result: 기능 소개 미리보기 UI 표시, CTA 버튼 존재
    Failure Indicators: 하드 게이트 표시, 빈 페이지, CTA 미존재
    Evidence: .sisyphus/evidence/task-3-soft-gate-preview.png

  Scenario: 소프트 게이트 CTA 클릭 시 LoginPrompt 모달 열기
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, NOT logged in
    Steps:
      1. Navigate to http://localhost:3000/records
      2. Click CTA button containing "로그인"
      3. Wait for LoginPrompt modal to appear (500ms)
      4. Assert modal is visible with login options
      5. Take screenshot
    Expected Result: LoginPrompt 모달 정상 표시
    Failure Indicators: 모달 미표시, 페이지 이동
    Evidence: .sisyphus/evidence/task-3-login-modal.png

  Scenario: 로그인 상태에서 /records 정상 콘텐츠 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, logged in (Supabase auth session)
    Steps:
      1. Navigate to http://localhost:3000/records
      2. Assert RecordsContent is rendered (경기 기록 heading 존재)
      3. Assert 미리보기/소프트 게이트 UI 미표시
    Expected Result: 기존 RecordsContent 정상 렌더링
    Failure Indicators: 미리보기 표시, 하드 게이트 표시
    Evidence: .sisyphus/evidence/task-3-authed-records.png
  ```

  **Commit**: YES
  - Message: `feat(records): convert records page to soft login gate`
  - Files: `app/records/page.tsx`
  - Pre-commit: `npm run build`

- [ ] 4. EmptyRecords 온보딩 콘텐츠 강화

  **What to do**:
  - `components/records/EmptyRecords.tsx` 확장 (기존 레이아웃 유지하면서 콘텐츠 추가)
  - 현재: 🎾 아이콘 + "아직 기록이 없습니다" + "첫 경기를 기록해보세요!" + CTA 버튼
  - **추가할 콘텐츠** (CTA 버튼 위에 삽입):
    - 3개 간단한 가치 제안 아이템 (아이콘 + 짧은 텍스트)
      - "📊 승률, 세트별 스코어 등 통계 자동 분석"
      - "🏟️ 코트별·파트너별 기록 관리"
      - "📈 구력에 따른 실력 변화 추적"
    - /guide/records 가이드 페이지 링크 (Task 7 이후 동작): "자세한 사용법 보기 →"
  - 듀얼 테마 적용 (themeClass)
  - 기존 `showCreateButton` prop 로직 유지
  - 컴포넌트 전체 구조/레이아웃은 센터 정렬 유지

  **Must NOT do**:
  - 기존 아이콘, 제목("아직 기록이 없습니다"), 설명, CTA 버튼 스타일 변경 금지
  - 컴포넌트 Props 인터페이스 변경 금지 (showCreateButton 유지)
  - 외부 의존성 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 콘텐츠 추가, 카드/리스트 레이아웃, 듀얼 테마 적용
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 빈 상태 UX 패턴, 온보딩 가치 제안 디자인
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7 (가이드 링크 포함)
  - **Blocked By**: Task 3 (소프트 게이트에서 EmptyRecords 사용 확인)

  **References**:

  **Pattern References**:
  - `components/records/EmptyRecords.tsx:1-64` — 전체 현재 코드. 수정 대상. 기존 구조(아이콘 → 제목 → 설명 → CTA) 사이에 가치 제안 삽입
  - `components/records/EmptyRecords.tsx:50-60` — showCreateButton 조건부 CTA. 이 위에 가치 제안 + 가이드 링크 삽입

  **WHY Each Reference Matters**:
  - `EmptyRecords.tsx:1-64`: 전체 구조를 파악하여 삽입 위치 결정. 기존 코드 한 줄도 변경하지 않고 새 콘텐츠만 추가
  - `EmptyRecords.tsx:50-60`: CTA 버튼 바로 위에 가치 제안을 배치하여 CTA로의 시선 흐름 유지

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 로그인 + 기록 없음 상태에서 온보딩 콘텐츠 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, logged in, no game records, mobile viewport
    Steps:
      1. Navigate to http://localhost:3000/records
      2. Assert "아직 기록이 없습니다" 텍스트 존재
      3. Assert 가치 제안 아이템 최소 3개 존재
      4. Assert "경기 기록하기" CTA 버튼 존재
      5. Assert 가이드 링크 존재 (text containing "사용법" or "가이드")
      6. Take screenshot
    Expected Result: 기존 EmptyRecords + 온보딩 가치 제안 + 가이드 링크 모두 표시
    Failure Indicators: 가치 제안 미표시, CTA 사라짐, 기존 텍스트 변경
    Evidence: .sisyphus/evidence/task-4-empty-records-onboarding.png

  Scenario: showCreateButton=false 시 CTA 숨김 확인
    Tool: Bash (node REPL or build check)
    Preconditions: Component renders correctly
    Steps:
      1. Run `npm run build`
      2. Verify build succeeds (showCreateButton prop still works)
    Expected Result: Build success, prop interface intact
    Failure Indicators: Type error, build failure
    Evidence: .sisyphus/evidence/task-4-build-pass.txt
  ```

  **Commit**: YES
  - Message: `feat(records): enhance EmptyRecords with onboarding content`
  - Files: `components/records/EmptyRecords.tsx`
  - Pre-commit: `npm run build`

- [x] 5. RecordsPromoCard 3-state 컴포넌트 + HomeContent 삽입

  **What to do**:
  - **신규 컴포넌트** `components/home/RecordsPromoCard.tsx` 생성:
    - 3가지 상태 분기:
      - **State A (비로그인)**: 경기 기록 기능 소개 + "로그인하고 시작하기" CTA
      - **State B (로그인 + 기록 없음)**: "첫 경기를 기록해보세요!" + "기록하기" CTA → `/records/new`
      - **State C (로그인 + 기록 있음)**: 최근 기록 요약 (최근 N경기, 승률 등) + "전체 기록 보기" → `/records`
    - Props: `user`, `authLoading` (AuthContext에서 받음)
    - State C의 통계 데이터: `/api/records/stats` SWR 호출 (`useRecordStats` 훅 사용)
    - State C에서 기록 수 0이면 State B로 폴백
    - 듀얼 테마 필수 (Neo-Brutalism: 볼드 카드 + 그림자, Minimal: 깔끔한 카드)
    - 모바일 우선 반응형
  - **HomeContent.tsx 수정**:
    - `components/home/HomeContent.tsx`에 RecordsPromoCard를 dynamic import 추가 (line 21-34 패턴 따름)
    - 히어로 섹션 (`</section>` line 139) 바로 다음, FavoriteCourtSection (line 141) 바로 전에 삽입
    - `<RecordsPromoCard />` 렌더링 (user, authLoading props 전달)

  **Must NOT do**:
  - useRecordStats 훅 수정 금지 (Phase 1 산출물)
  - FavoriteCourtSection 위치/로직 변경 금지
  - PopularCourts 컴포넌트 변경 금지
  - 히어로 섹션 내부 변경 금지
  - LoginPrompt `isOpen={true}` 직접 전달 금지 (State A CTA는 `/records` 이동 또는 LoginPrompt button-triggered)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 새 UI 컴포넌트 생성, 3-state 분기 디자인, 통계 데이터 표시, 듀얼 테마
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 프로모션 카드 디자인, CTA 배치, 3-state UX 패턴
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 7 (가이드 페이지에서 프로모 카드 참조 가능)
  - **Blocked By**: Task 1 (BottomNav 기록 탭 존재 전제)

  **References**:

  **Pattern References**:
  - `components/home/HomeContent.tsx:21-34` — dynamic import 패턴 (FavoriteCourtSection, PopularCourts, InstallPrompt). 동일 패턴으로 RecordsPromoCard를 dynamic import
  - `components/home/HomeContent.tsx:139-156` — 히어로 섹션 종료 후 ~ FavoriteCourtSection. 이 사이에 RecordsPromoCard 삽입
  - `components/home/HomeContent.tsx:44` — `const { user, loading: authLoading } = useAuth()` — 이미 HomeContent에 존재하는 auth 상태. RecordsPromoCard에 props로 전달

  **API/Type References**:
  - `lib/hooks/useRecordStats.ts` — useRecordStats 훅: `{ stats, isLoading }` 반환, stats에 totalGames, winRate, recentForm 등
  - `app/api/records/stats/route.ts` — 통계 API 엔드포인트 (State C에서 최근 기록 요약에 사용)

  **WHY Each Reference Matters**:
  - `HomeContent.tsx:21-34`: dynamic import SSR false 패턴 정확히 따라야 함. 이 패턴을 어기면 빌드 에러
  - `HomeContent.tsx:139-156`: 정확한 삽입 위치. 히어로 다음 + 즐겨찾기 전에 프로모 카드 배치
  - `useRecordStats`: State C에서 통계 요약을 표시하기 위해 사용. 이미 구현된 훅이므로 그대로 import

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 홈 — 비로그인 State A 프로모 카드
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, NOT logged in, mobile viewport
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll past hero section
      3. Assert RecordsPromoCard exists (기록 관련 키워드 포함)
      4. Assert CTA contains "로그인" or "시작" 텍스트
      5. Assert 카드가 FavoriteCourtSection 위에 표시
      6. Take screenshot
    Expected Result: 비로그인 프로모 카드 표시, CTA 존재
    Failure Indicators: 프로모 카드 미표시, CTA 미존재
    Evidence: .sisyphus/evidence/task-5-promo-state-a.png

  Scenario: 홈 — 로그인 + 기록 있음 State C 프로모 카드
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, logged in, has game records
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll past hero section
      3. Assert RecordsPromoCard shows statistics (경기 수, 승률 등)
      4. Assert "전체 기록" or "기록 보기" 링크 존재
      5. Take screenshot
    Expected Result: 통계 요약 + 전체 기록 링크 표시
    Failure Indicators: State A/B 표시, 통계 미표시
    Evidence: .sisyphus/evidence/task-5-promo-state-c.png

  Scenario: 홈 — 프로모 카드 테마 전환
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Screenshot with current theme
      3. Toggle theme (click theme button)
      4. Screenshot with alternate theme
      5. Compare: both should have distinct styling
    Expected Result: 두 테마 모두 적절한 스타일링 적용
    Failure Indicators: 테마 전환 시 스타일 깨짐, 동일 스타일
    Evidence: .sisyphus/evidence/task-5-promo-theme-toggle.png
  ```

  **Commit**: YES
  - Message: `feat(home): add records promo card with 3-state UI`
  - Files: `components/home/RecordsPromoCard.tsx`, `components/home/HomeContent.tsx`
  - Pre-commit: `npm run build`

- [x] 6. 코트 상세 인라인 CTA + RecordForm 쿼리 파라미터 프리필

  **What to do**:
  - **CourtDetailClient.tsx 수정**:
    - `components/court-detail/CourtDetailClient.tsx`에 "이 코트에서 게임 기록하기" 인라인 CTA 추가
    - 위치: 기존 콘텐츠 내부, AdBanner (line 555-558) 위, SimilarCourts 아래 근처에 인라인 배치
    - CTA는 `<Link>` 태그: `href="/records/new?courtName={court.SVCNM}&district={district}&placeName={court.PLACENM}"`
    - court.SVCNM, district(URL params), court.PLACENM을 쿼리 파라미터로 전달
    - 듀얼 테마 적용
    - 인라인 배치 (절대 fixed-bottom 금지 — 기존 예약 CTA lines 562-577과 충돌)
    - 로그인 여부와 무관하게 항상 표시 (비로그인 시 /records/new → 하드 게이트가 처리)
  - **RecordForm.tsx 수정** (최소한의 변경):
    - `components/records/RecordForm.tsx`에서 쿼리 파라미터 읽기 추가
    - `useSearchParams()`로 `courtName`, `district`, `placeName` 읽기
    - `mode === 'create'` && 초기값 없을 때만 쿼리 파라미터로 프리필:
      - `courtName` → court name 필드
      - `district` → district 필드
      - `placeName` → place name 필드 (또는 location 관련 필드)
    - 기존 initialData가 있으면 (edit mode) 쿼리 파라미터 무시

  **Must NOT do**:
  - 기존 fixed-bottom 예약 CTA (lines 562-577) 수정/제거 금지
  - RecordForm의 기존 form 구조/제출 로직 수정 금지
  - StickyHeader 수정 금지
  - CourtDetailClient의 기존 레이아웃 순서 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 인라인 CTA 디자인, 쿼리 파라미터 핸들링, 듀얼 테마 적용
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: CTA 배치 디자인, 컨텍스트 유도 UX
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: None
  - **Blocked By**: Task 3 (소프트 게이트 패턴 참고)

  **References**:

  **Pattern References**:
  - `components/court-detail/CourtDetailClient.tsx:555-577` — AdBanner 위치(line 555) + fixed-bottom 예약 CTA(lines 562-577). CTA를 line 555 위쯤에 인라인 배치. fixed-bottom CTA는 건드리지 않음
  - `components/court-detail/CourtDetailClient.tsx:230-256` — 상단 예약 버튼 패턴 참고 (링크 스타일, themeClass 사용). 유사한 스타일로 기록 CTA 생성
  - `components/records/RecordForm.tsx:39-44` — RecordFormProps 인터페이스. mode, initialData props 확인

  **API/Type References**:
  - `components/records/CourtLocationInput.tsx` — 코트 위치 입력 컴포넌트. courtName, district 등이 어떤 필드명으로 사용되는지 확인

  **WHY Each Reference Matters**:
  - `CourtDetailClient.tsx:555-577`: CTA 삽입 위치와 절대 수정해선 안 되는 fixed-bottom 예약 CTA의 정확한 위치
  - `CourtDetailClient.tsx:230-256`: 버튼/링크 스타일 참고. 동일한 themeClass 패턴 사용
  - `RecordForm.tsx:39-44`: mode='create' 조건 확인, initialData 부재 시 쿼리 파라미터 프리필 로직

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 코트 상세에서 기록 CTA 인라인 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, mobile viewport
    Steps:
      1. Navigate to a court detail page (e.g., http://localhost:3000/송파구/S210401)
      2. Scroll down to find 기록 CTA
      3. Assert CTA contains "기록" 키워드 텍스트
      4. Assert CTA is NOT position:fixed (인라인 확인)
      5. Assert CTA href contains "/records/new?courtName=" with URL-encoded params
      6. Assert 기존 fixed-bottom 예약 CTA still exists (lines 562-577 보존)
      7. Take screenshot showing both CTAs visible
    Expected Result: 인라인 기록 CTA + 기존 예약 CTA 공존
    Failure Indicators: CTA 미표시, fixed 위치, 기존 예약 CTA 사라짐
    Evidence: .sisyphus/evidence/task-6-court-detail-cta.png

  Scenario: CTA 클릭 → /records/new에서 코트 정보 프리필
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, logged in
    Steps:
      1. Navigate to a court detail page
      2. Click 기록 CTA link
      3. Wait for /records/new to load
      4. Assert court name field is pre-filled with court name from URL
      5. Assert district field is pre-filled
    Expected Result: RecordForm에 코트 정보가 자동 입력됨
    Failure Indicators: 필드 비어있음, 쿼리 파라미터 무시됨
    Evidence: .sisyphus/evidence/task-6-prefill-form.png

  Scenario: Edit 모드에서 쿼리 파라미터 무시 확인
    Tool: Bash
    Preconditions: Build succeeds
    Steps:
      1. Run `npm run build`
      2. Verify no type errors related to useSearchParams
    Expected Result: Build success
    Failure Indicators: Type errors
    Evidence: .sisyphus/evidence/task-6-build-pass.txt
  ```

  **Commit**: YES
  - Message: `feat(records): add court detail CTA and query param pre-fill`
  - Files: `components/court-detail/CourtDetailClient.tsx`, `components/records/RecordForm.tsx`
  - Pre-commit: `npm run build`

- [x] 7. /guide/records 튜토리얼 가이드 페이지

  **What to do**:
  - **신규 페이지** `app/guide/records/page.tsx` 생성:
    - metadata 설정 (title: "경기 기록 사용법 | 서울 테니스", description)
    - `RecordsGuideContent` 컴포넌트 렌더링
  - **신규 컴포넌트** `components/guide/RecordsGuideContent.tsx` 생성:
    - 섹션 구성:
      1. **소개**: 경기 기록 기능 개요 (1-2문장)
      2. **시작하기**: 로그인 → 프로필 설정 → 첫 기록 작성 스텝
      3. **기록 작성법**: 경기 유형(단식/복식/혼합복식), 스코어 입력 방법 (세트별), 코트 위치 선택, 부가 정보 (비용, 메모, 사진)
      4. **통계 활용**: 통계 대시보드 읽는 법, 승률/전적 분석
      5. **활용 팁**: 코트 상세에서 바로 기록하기, 즐겨찾기 코트 활용 등
    - 각 섹션은 아이콘 + 제목 + 설명 텍스트
    - 필요시 시각적 예시 (스코어 입력 예시: "6-4, 7-6(5)" 등 텍스트 기반)
    - /records, /records/new, /my 등으로 가는 CTA 링크
    - 듀얼 테마 적용 필수
    - 모바일 우선 반응형
    - 한국어 전용

  **Must NOT do**:
  - 기존 /guide/[district] 라우트와 충돌하지 않도록 주의 (/guide/records는 [district] catch-all에 매칭 안 됨 — district는 XX구 형태)
  - 스크린샷 이미지 사용 금지 (텍스트 + 아이콘으로만 구성)
  - 외부 의존성 추가 금지

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 새 가이드 페이지 디자인, 섹션 레이아웃, 스텝 UI, 듀얼 테마
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 튜토리얼 페이지 UX 패턴, 스텝별 가이드 디자인
  - **Skills Evaluated but Omitted**:
    - `playwright`: 구현 단계에서는 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: None
  - **Blocked By**: Tasks 4, 5 (가이드에서 참조하는 EmptyRecords 온보딩, 프로모 카드 완성 후)

  **References**:

  **Pattern References**:
  - `app/guide/[district]/page.tsx` — 기존 가이드 페이지 패턴 참고. metadata 설정, 컴포넌트 구조
  - `components/guide/GuideContent.tsx` — 기존 가이드 컨텐츠 컴포넌트 패턴 (있다면). 섹션 구조, themeClass 사용 패턴
  - `app/about/page.tsx:8-35` — 기능 소개 카드 배열 패턴 (CORE_FEATURES, COURT_DETAIL_FEATURES). 유사 패턴으로 가이드 섹션 정의

  **API/Type References**:
  - `lib/constants/tennis.ts` — 매치 타입, 포맷, 결과 등 용어/라벨. 가이드에서 정확한 용어 사용을 위해 참조

  **External References**: N/A

  **WHY Each Reference Matters**:
  - `app/guide/[district]/page.tsx`: Next.js App Router 가이드 페이지 패턴. metadata, 레이아웃 일관성
  - `app/about/page.tsx:8-35`: 기능 카드 배열 패턴을 가이드 섹션 정의에 재사용
  - `lib/constants/tennis.ts`: 단식/복식/혼합복식 등 정확한 한국어 라벨 참조. 가이드에서 일관된 용어 사용

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: /guide/records 페이지 접근 및 콘텐츠 확인
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, mobile viewport
    Steps:
      1. Navigate to http://localhost:3000/guide/records
      2. Assert page title contains "경기 기록" or "사용법"
      3. Assert at least 4 섹션 headings 존재
      4. Assert 스코어 입력 관련 설명 존재 (text containing "스코어" or "세트")
      5. Assert CTA link to /records or /records/new 존재
      6. Scroll to bottom, take screenshot
    Expected Result: 가이드 페이지 정상 렌더링, 모든 섹션 존재
    Failure Indicators: 404, 섹션 누락, 콘텐츠 비어있음
    Evidence: .sisyphus/evidence/task-7-guide-page.png

  Scenario: /guide/records 테마 전환
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/guide/records
      2. Take screenshot (current theme)
      3. Toggle theme
      4. Take screenshot (alternate theme)
    Expected Result: 두 테마 모두 적절한 스타일링
    Failure Indicators: 테마 전환 시 스타일 깨짐
    Evidence: .sisyphus/evidence/task-7-guide-theme.png

  Scenario: /guide/[district]와 라우트 충돌 없음
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/guide/records — assert loads guide page
      2. Navigate to http://localhost:3000/guide/강남구 — assert loads district guide
      3. Both pages should render correctly without 404
    Expected Result: 두 라우트 모두 정상 동작
    Failure Indicators: 404, 잘못된 컴포넌트 렌더링
    Evidence: .sisyphus/evidence/task-7-route-no-conflict.png
  ```

  **Commit**: YES
  - Message: `feat(guide): add records tutorial guide page`
  - Files: `app/guide/records/page.tsx`, `components/guide/RecordsGuideContent.tsx`
  - Pre-commit: `npm run build`

- [x] 8. About 페이지 경기 기록 기능 추가

  **What to do**:
  - `app/about/page.tsx` 수정
  - **CORE_FEATURES 배열 (line 8-14)에 경기 기록 추가**:
    - `{ emoji: '🎾', title: '경기 기록', desc: '나의 테니스 경기를 기록하고 통계로 실력 변화를 추적' }` 추가
    - 위치: 배열 마지막 아이템으로 추가
  - **CONVENIENCE_FEATURES 배열 (line 26-35)에 관련 편의 기능 추가**:
    - `{ title: '경기 통계', desc: '승률, 세트 스코어, 코트별 전적 등 자동 분석' }` 추가
  - **이용 안내 섹션 (lines 147-152)에 경기 기록 관련 안내 추가**:
    - "로그인하면 경기 기록 및 통계 기능을 이용할 수 있습니다." 항목 추가

  **Must NOT do**:
  - 기존 CORE_FEATURES, COURT_DETAIL_FEATURES, CONVENIENCE_FEATURES 아이템 수정 금지
  - 페이지 레이아웃/구조 변경 금지
  - 의견 보내기 섹션 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 배열에 아이템 추가만 하는 단순 변경
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 배열 아이템 추가이므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: None
  - **Blocked By**: None (독립적 변경, 다른 태스크와 의존성 없음)

  **References**:

  **Pattern References**:
  - `app/about/page.tsx:8-14` — CORE_FEATURES 배열. 마지막에 경기 기록 아이템 추가
  - `app/about/page.tsx:26-35` — CONVENIENCE_FEATURES 배열. 마지막에 경기 통계 아이템 추가
  - `app/about/page.tsx:147-152` — 이용 안내 `<ul>` 리스트. 새 `<li>` 아이템 추가

  **WHY Each Reference Matters**:
  - `about/page.tsx:8-14`: 기존 배열 구조 (`{ emoji, title, desc }`)와 동일한 형태로 추가
  - `about/page.tsx:26-35`: 편의 기능 배열 구조 (`{ title, desc }`)와 동일한 형태로 추가
  - `about/page.tsx:147-152`: 이용 안내 리스트에 자연스럽게 새 항목 추가

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: About 페이지에 경기 기록 기능 표시
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/about
      2. Assert "핵심 기능" 섹션에 "경기 기록" 텍스트 존재
      3. Assert "편의 기능" 섹션에 "경기 통계" 텍스트 존재
      4. Assert "이용 안내" 섹션에 "경기 기록" 관련 안내 텍스트 존재
      5. Take screenshot
    Expected Result: 3곳 모두에 경기 기록 관련 콘텐츠 추가됨
    Failure Indicators: 텍스트 미존재, 기존 기능 목록 변경됨
    Evidence: .sisyphus/evidence/task-8-about-records.png

  Scenario: 기존 About 콘텐츠 보존 확인
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/about
      2. Assert 기존 CORE_FEATURES 5개 모두 존재: "홈", "오늘 예약", "구별 비교", "경쟁률", "캘린더"
      3. Assert 기존 CONVENIENCE_FEATURES 8개 모두 존재
    Expected Result: 기존 콘텐츠 100% 보존
    Failure Indicators: 기존 아이템 누락
    Evidence: .sisyphus/evidence/task-8-about-preserved.png
  ```

  **Commit**: YES
  - Message: `docs(about): add records feature to about page`
  - Files: `app/about/page.tsx`
  - Pre-commit: `npm run build`

- [x] 9. CLAUDE.md 문서 업데이트

  **What to do**:
  - `CLAUDE.md` 파일에 Phase 2 변경사항 반영:
  - **Page Routes 테이블에 추가**:
    - `/guide/records` — 경기 기록 사용 가이드
  - **Component Structure에 추가**:
    - `home/` 아래: `RecordsPromoCard`
    - `guide/` 아래: `RecordsGuideContent`
  - **BottomNav 설명 업데이트** (변경된 탭 구성 반영)
  - **경기 기록 관련 정보 섹션**: 이미 Phase 1에서 추가되었다면 검증만, 누락 시 추가

  **Must NOT do**:
  - Phase 1에서 이미 추가된 records 관련 문서 내용 중복 추가 금지
  - 기존 문서 내용 삭제 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 문서 업데이트, 테이블/리스트 항목 추가만
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `writing`: 소량 업데이트이므로 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 7 (가이드 페이지 완성 후 정확한 라우트/컴포넌트명 반영)

  **References**:

  **Pattern References**:
  - `CLAUDE.md` — 전체 파일. Page Routes 테이블, Component Structure, Architecture 섹션 구조 참고

  **WHY Each Reference Matters**:
  - `CLAUDE.md`: 업데이트 대상 파일. 기존 테이블/리스트 구조에 맞춰 새 항목 추가

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: CLAUDE.md에 /guide/records 라우트 추가 확인
    Tool: Bash (grep)
    Preconditions: File exists
    Steps:
      1. Run `grep '/guide/records' CLAUDE.md`
      2. Assert output contains the route entry
      3. Run `grep 'RecordsPromoCard' CLAUDE.md`
      4. Assert output contains the component entry
      5. Run `grep 'RecordsGuideContent' CLAUDE.md`
      6. Assert output contains the component entry
    Expected Result: 3개 항목 모두 CLAUDE.md에 존재
    Failure Indicators: grep 결과 없음
    Evidence: .sisyphus/evidence/task-9-claudemd-updated.txt
  ```

  **Commit**: YES
  - Message: `docs: update CLAUDE.md with records UX changes`
  - Files: `CLAUDE.md`
  - Pre-commit: N/A

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp). Verify dual theme applied to ALL new components.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Execute EVERY QA scenario from EVERY task. Test cross-task integration:
  - BottomNav "기록" tap → /records → soft gate (not logged in)
  - Home promo card → click → /records
  - Court detail CTA → click → /records/new with query params
  - /guide/records accessible from multiple paths
  - BottomNav active state on /records
  - Theme toggle on every new component
  Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Verify RecordForm/RecordCard/RecordDetail/RecordStats unchanged except RecordForm query param addition. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(nav): restructure BottomNav to promote records` | `components/layout/BottomNav.tsx` | `npm run build` |
| 2 | `feat(nav): show records link to all users in Header` | `components/layout/Header.tsx` | `npm run build` |
| 3 | `feat(records): convert records page to soft login gate` | `app/records/page.tsx` | `npm run build` |
| 4 | `feat(records): enhance EmptyRecords with onboarding content` | `components/records/EmptyRecords.tsx` | `npm run build` |
| 5 | `feat(home): add records promo card with 3-state UI` | `components/home/RecordsPromoCard.tsx`, `components/home/HomeContent.tsx` | `npm run build` |
| 6 | `feat(records): add court detail CTA and query param pre-fill` | `components/court-detail/CourtDetailClient.tsx`, `components/records/RecordForm.tsx` | `npm run build` |
| 7 | `feat(guide): add records tutorial guide page` | `app/guide/records/page.tsx`, `components/guide/RecordsGuideContent.tsx` | `npm run build` |
| 8 | `docs(about): add records feature to about page` | `app/about/page.tsx` | `npm run build` |
| 9 | `docs: update CLAUDE.md with records UX changes` | `CLAUDE.md` | — |

---

## Success Criteria

### Verification Commands
```bash
npm run build            # Expected: exit code 0, no errors
npm run lint             # Expected: no errors
```

### Final Checklist
- [ ] All "Must Have" present (8 items verified)
- [ ] All "Must NOT Have" absent (6 guardrails verified)
- [ ] Build passes
- [ ] All 12 deliverable files exist
- [ ] Playwright QA passes for all scenarios
- [ ] Dual theme applied to all new UI components
