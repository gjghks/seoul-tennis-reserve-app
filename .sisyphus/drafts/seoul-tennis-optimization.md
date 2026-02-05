# Draft: Seoul Tennis Reserve App Optimization

## Requirements (confirmed from user)

### Phase 1: Performance Optimization
1. **DetailContent.tsx refactoring** (CRITICAL - 1300+ lines)
   - Move parsing logic to useMemo
   - Extract inline functions outside component
   - Split into smaller components
   - File: `components/court-detail/DetailContent.tsx`

2. **SWR refresh interval**: Change 5 min → 15 min
   - File: `contexts/TennisDataContext.tsx`

3. **Scroll event throttle**: Add throttle to scroll listener
   - File: `components/court-detail/CourtDetailClient.tsx`

4. **GA/AdSense script strategy**: Change afterInteractive → lazyOnload
   - Files: `components/GoogleAnalytics.tsx`, `components/GoogleAdSense.tsx`

### Phase 2: Code Quality
1. **Fix empty catch blocks**: Add proper error handling
   - Files: `components/favorite/FavoriteButton.tsx`, `components/review/ReviewList.tsx`

2. **Consolidate duplicate AdSense components**
   - Files: `components/AdSense.tsx`, `components/GoogleAdSense.tsx`

3. **Extract status check utility**: Remove duplication
   - Currently in: `app/page.tsx`, `app/api/tennis/route.ts`, `lib/seoulApi.ts`

### Phase 3: Accessibility
1. **Skip-to-content link + main landmark**
   - File: `app/layout.tsx`

2. **role="alert" for error messages**
   - Files: `app/login/page.tsx`, `components/review/ReviewForm.tsx`, `app/error.tsx`

3. **aria-busy for loading states**
   - Files: Components with skeleton loaders (TBD)

4. **Focus trap in LoginPrompt**
   - File: `components/auth/LoginPrompt.tsx`

## Technical Decisions
- Parallel task execution: User requested wave-based parallelization
- Category + skills: User requested for each task

## Research Findings

### DetailContent.tsx Analysis (CRITICAL)
- **Total Lines**: 1,488 lines (confirmed larger than expected)
- **Inline Functions**: 13 major functions, ALL defined inside component
- **Memoization**: ZERO useMemo/useCallback/React.memo usage
- **Critical function**: `parseContent()` is 814 lines alone!
- **Extraction targets**:
  - Utils: `contentParser.ts`, `htmlSanitizer.ts`, `styleMapping.ts`
  - Components: `<ContentSection/>`, `<ContentItem/>`, `<TableRenderer/>`, `<FeeTable/>`, `<InfoCardGrid/>`, `<HtmlRenderer/>`
- **LSP Errors**: 16 array-index-as-key violations

### Performance Files
- **SWR**: Currently 5 min refresh at line 79 of TennisDataContext.tsx
- **Scroll**: No throttling, uses passive listener (lines 34-44 of CourtDetailClient.tsx)
- **GA/AdSense**: Both use `strategy="afterInteractive"`

### Code Quality Issues
- **Empty catch blocks**:
  - `FavoriteButton.tsx:97-98` - completely empty catch
  - `ReviewList.tsx:88-90` - has alert but no error logging
- **AdSense duplication**: `AdSense.tsx` is UNUSED dead code; only `GoogleAdSense.tsx` is imported
- **Status checking**: Duplicated 7 times with INCONSISTENCIES:
  - Some check: `'접수중' || '예약가능'`
  - Others only check: `'접수중'`
  - Files: page.tsx, route.ts, TennisDataContext, [district]/page, FavoriteCourtSection, CourtDetailClient, DistrictContent

### Accessibility Patterns
- **Layout**: Has `<main>` element, `lang="ko"`, but NO skip links
- **Error messages**: Displayed but NO `role="alert"` (except Toast which has it)
- **Skeleton loaders**: Use `animate-pulse` but NO `aria-busy`
- **LoginPrompt**: Uses `<dialog>` with `showModal()` but NO focus trap, NO focus restoration
- **Good patterns found**: Toast has role="alert", ReviewList modal has role="dialog"

### Test Infrastructure
- **Framework**: Vitest 4.0.18 with @testing-library/react
- **Config**: vitest.config.ts, vitest.setup.ts present
- **Scripts**: `npm test`, `npm test:run`, `npm test:coverage`
- **Existing tests**: Only 2 files (seoulApi.test.ts, districts.test.ts)
- **Gap**: No component tests exist

## Open Questions
- **Test strategy**: TDD, tests-after, or none? (Infrastructure exists)

## Scope Boundaries
- INCLUDE: Performance, code quality, accessibility improvements as listed
- EXCLUDE: New features, UI changes beyond accessibility

## Technical Decisions
- **Parallel execution**: Will structure as waves for independent tasks
- **DetailContent refactoring**: Multi-phase (utils → memoization → components)
- **Status utility**: Create `lib/courtStatus.ts` for consolidation
- **Dead code**: Delete unused `AdSense.tsx`
