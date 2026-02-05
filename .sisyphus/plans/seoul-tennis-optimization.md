# Seoul Tennis Reserve App Optimization

## TL;DR

> **Quick Summary**: Comprehensive optimization of a Next.js tennis court reservation app across performance, code quality, and accessibility. The critical task is refactoring a 1,488-line component (DetailContent.tsx) with zero memoization.
>
> **Deliverables**:
> - Refactored DetailContent.tsx (from 1488 lines to ~300)
> - SWR interval optimized (5min → 15min)
> - Scroll performance improved (throttled)
> - Script loading optimized (lazyOnload)
> - Error handling fixed (empty catch blocks)
> - Dead code removed (AdSense.tsx)
> - Status checking consolidated (utility extracted)
> - Accessibility improvements (skip links, aria attributes)
>
> **Estimated Effort**: Large (3-4 days)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 (DetailContent) → Task 2 (memoization) → Task 3 (component extraction)

---

## Context

### Original Request
Optimize the Seoul Tennis Reserve App across three phases:
- Phase 1: Performance Optimization
- Phase 2: Code Quality
- Phase 3: Accessibility

### Interview Summary
**Key Discussions**:
- DetailContent.tsx is 1,488 lines with 13 inline functions and ZERO memoization
- SWR refresh interval is 5 minutes, to be changed to 15 minutes
- Status checking logic duplicated 7 times with two distinct patterns
- Vitest configured but user chose NO automated tests for this work

**Research Findings**:
- `parseContent()` function alone is 814 lines
- AdSense.tsx is dead code (never imported)
- Status checking has TWO intentional patterns: sorting vs. availability display
- LoginPrompt uses native `<dialog>.showModal()` which ALREADY provides focus trapping

### Metis Review
**Identified Gaps** (addressed):
- LoginPrompt focus trap: Native dialog already provides this - task changed to verification
- Status utility: Two patterns exist for different purposes - creating two utilities
- SWR/page revalidation alignment: Will only change SWR, not page-level revalidate
- Missing acceptance criteria: All tasks now have executable verification

---

## Work Objectives

### Core Objective
Improve application performance, code maintainability, and accessibility without changing user-facing behavior.

### Concrete Deliverables
- `components/court-detail/utils/contentParser.ts` - Extracted parsing logic
- `components/court-detail/utils/htmlSanitizer.ts` - Extracted HTML utilities
- `lib/courtStatus.ts` - Consolidated status checking utilities
- Updated `TennisDataContext.tsx` with 15min refresh
- Updated `CourtDetailClient.tsx` with throttled scroll
- Updated GA/AdSense with lazyOnload strategy
- Fixed error handling in FavoriteButton and ReviewList
- Deleted `components/AdSense.tsx`
- Updated `app/layout.tsx` with skip links
- Updated error components with role="alert"
- Updated skeleton loaders with aria-busy

### Definition of Done
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes (or errors unchanged from baseline)
- [ ] All Agent-Executed QA scenarios pass
- [ ] No visual regressions on court detail page

### Must Have
- DetailContent.tsx reduced to <400 lines
- All inline functions extracted or memoized
- SWR interval changed to 15 minutes
- Skip-to-content link functional

### Must NOT Have (Guardrails)
- NO behavior changes to rendered output during refactoring
- NO new dependencies introduced
- NO changes to page-level `revalidate` settings (only SWR interval)
- NO hunting for additional dead code beyond AdSense.tsx
- NO "while we're here" optimizations beyond scope
- NO changing logic while extracting (refactor ≠ rewrite)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.

### Test Decision
- **Infrastructure exists**: YES (Vitest 4.0.18)
- **Automated tests**: NONE (user decision)
- **Framework**: Vitest (not used for this work)

### Agent-Executed QA Scenarios

Every task uses Agent-Executed QA as the PRIMARY verification method:

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| **Build/Lint** | Bash | Run commands, check exit codes |
| **Code Structure** | Bash (grep, wc) | Verify line counts, pattern matches |
| **Performance** | Playwright + DevTools | Network tab inspection, timing |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent Setup):
├── Task 4: SWR interval change (quick, isolated)
├── Task 5: Scroll throttle (quick, isolated)
├── Task 6: GA/AdSense lazyOnload (quick, isolated)
├── Task 7: Fix empty catch blocks (quick, isolated)
├── Task 8: Delete dead AdSense.tsx (quick, isolated)
└── Task 10: Skip-to-content link (accessibility, isolated)

Wave 2 (After Wave 1 - Can parallel with Wave 1):
├── Task 9: Extract status utility (code quality)
└── Task 11: Add role="alert" to errors (accessibility)

Wave 3 (DetailContent Refactoring - Sequential):
├── Task 1: Extract utilities from DetailContent.tsx
├── Task 2: Add memoization to DetailContent.tsx (depends: 1)
└── Task 3: Extract components from DetailContent.tsx (depends: 2)

Wave 4 (Final):
├── Task 12: Add aria-busy to skeleton loaders
└── Task 13: Verify LoginPrompt focus behavior

Critical Path: Task 1 → Task 2 → Task 3
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | 4, 5, 6, 7, 8, 9, 10, 11 |
| 2 | 1 | 3 | 4-11 |
| 3 | 2 | None | 12, 13 |
| 4 | None | None | 1, 5, 6, 7, 8, 9, 10, 11 |
| 5 | None | None | 1, 4, 6, 7, 8, 9, 10, 11 |
| 6 | None | None | 1, 4, 5, 7, 8, 9, 10, 11 |
| 7 | None | None | 1, 4, 5, 6, 8, 9, 10, 11 |
| 8 | None | None | 1, 4, 5, 6, 7, 9, 10, 11 |
| 9 | None | None | 1, 4, 5, 6, 7, 8, 10, 11 |
| 10 | None | None | 1, 4, 5, 6, 7, 8, 9, 11 |
| 11 | None | None | 1, 4, 5, 6, 7, 8, 9, 10 |
| 12 | None | None | 13 |
| 13 | None | None | 12 |

---

## TODOs

### Phase 1: Performance Optimization

- [ ] 1. Extract utilities from DetailContent.tsx

  **What to do**:
  - Create `components/court-detail/utils/contentParser.ts`
    - Move `parseContent()` function (lines 260-1073)
    - Move nested functions: `parseFacilityInfo()`, `parseStructuredContent()`, `extractTitle()`, `cleanupTagRemnants()`
  - Create `components/court-detail/utils/htmlSanitizer.ts`
    - Move `restoreHtmlTags()` (lines 7-23)
    - Move `isHtmlRenderingReliable()` (lines 25-44)
    - Move `getSanitizedHtml()` (lines 53-99)
  - Create `components/court-detail/utils/styleMapping.ts`
    - Move `sectionStyles` object (lines 101-138)
    - Move `getStyle()` function (lines 140-145)
    - Move `colorClasses` object (lines 1394-1405)
  - Update imports in DetailContent.tsx

  **Must NOT do**:
  - Do NOT change any function logic during extraction
  - Do NOT rename any functions or parameters
  - Do NOT change return types
  - Do NOT modify any rendering output

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex multi-file refactoring requiring careful extraction without behavior change
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commits for each utility file extraction

  **Parallelization**:
  - **Can Run In Parallel**: NO (critical path start)
  - **Parallel Group**: Wave 3 - Sequential
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - `components/court-detail/DetailContent.tsx` - Source file, all functions to extract
  - `components/court-detail/types.ts` - Type definitions to import in new utility files

  **Acceptance Criteria**:

  ```
  Scenario: Utilities extracted correctly
    Tool: Bash (grep, wc)
    Preconditions: None
    Steps:
      1. Run: wc -l components/court-detail/utils/contentParser.ts
      2. Assert: Line count > 800 (parseContent is 814 lines)
      3. Run: grep -c "export" components/court-detail/utils/contentParser.ts
      4. Assert: At least 1 export
      5. Run: grep -c "parseContent" components/court-detail/DetailContent.tsx
      6. Assert: Shows import, not function definition
    Expected Result: Utilities extracted to separate files
    Evidence: Command outputs captured

  Scenario: Build still passes after extraction
    Tool: Bash
    Preconditions: Files modified
    Steps:
      1. Run: npm run build
      2. Assert: Exit code 0
      3. Run: npm run lint
      4. Assert: No new errors introduced
    Expected Result: Build succeeds
    Evidence: Build output captured

  Scenario: Visual output unchanged
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Click first available court card
      3. Wait for: .court-detail-content visible (timeout: 10s)
      4. Screenshot: .sisyphus/evidence/task-1-court-detail-after.png
      5. Compare with baseline (visual diff)
    Expected Result: Rendered output identical to before
    Evidence: .sisyphus/evidence/task-1-court-detail-after.png
  ```

  **Commit**: YES
  - Message: `refactor(court-detail): extract utilities from DetailContent.tsx`
  - Files: `components/court-detail/utils/*.ts`, `components/court-detail/DetailContent.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 2. Add memoization to DetailContent.tsx

  **What to do**:
  - Wrap `parseContent()` call with `useMemo`:
    ```typescript
    const parsedContent = useMemo(() => parseContent(content), [content]);
    ```
  - Wrap `getSanitizedHtml()` call with `useMemo`:
    ```typescript
    const sanitizedHtml = useMemo(() => getSanitizedHtml(content), [content]);
    ```
  - Wrap `highlight()` function with `useCallback`:
    ```typescript
    const highlight = useCallback((text: string) => { ... }, []);
    ```
  - Wrap `formatPenaltyText()` function with `useCallback`:
    ```typescript
    const formatPenaltyText = useCallback((text: string) => { ... }, []);
    ```

  **Must NOT do**:
  - Do NOT change any function logic
  - Do NOT change dependency arrays beyond what's strictly necessary
  - Do NOT add React.memo to the component itself (not needed for this task)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple memoization wrapping, clear pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1)
  - **Parallel Group**: Wave 3 - Sequential after Task 1
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `components/court-detail/DetailContent.tsx` - Target file after utility extraction
  - `components/court-detail/utils/contentParser.ts:parseContent` - Function to memoize
  - `components/court-detail/utils/htmlSanitizer.ts:getSanitizedHtml` - Function to memoize

  **Acceptance Criteria**:

  ```
  Scenario: Memoization hooks added
    Tool: Bash (grep)
    Preconditions: Task 1 complete
    Steps:
      1. Run: grep -c "useMemo" components/court-detail/DetailContent.tsx
      2. Assert: Count >= 2
      3. Run: grep -c "useCallback" components/court-detail/DetailContent.tsx
      4. Assert: Count >= 2
    Expected Result: Memoization hooks present
    Evidence: grep output captured

  Scenario: Build passes with memoization
    Tool: Bash
    Preconditions: Memoization added
    Steps:
      1. Run: npm run build
      2. Assert: Exit code 0
    Expected Result: No build errors
    Evidence: Build output captured
  ```

  **Commit**: YES
  - Message: `perf(court-detail): add memoization to DetailContent.tsx`
  - Files: `components/court-detail/DetailContent.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 3. Extract components from DetailContent.tsx

  **What to do**:
  - Create `components/court-detail/ContentSection.tsx`:
    - Extract section rendering logic (lines ~1428-1456)
    - Props: `section: ContentSection, emoji: string, color: string`
    - Wrap with `React.memo`
  - Create `components/court-detail/ContentItem.tsx`:
    - Extract `renderItem()` logic (lines 1172-1236)
    - Props: `item: ContentItem, index: number, highlight: (text: string) => string`
    - Wrap with `React.memo`
  - Create `components/court-detail/TableRenderer.tsx`:
    - Extract `renderTable()` logic (lines 1238-1309)
    - Props: `rows: string[][]`
    - Wrap with `React.memo`
  - Create `components/court-detail/FeeTable.tsx`:
    - Extract `renderFeeTable()` logic (lines 1341-1392)
    - Props: `fees: FeeInfo[]`
    - Wrap with `React.memo`
  - Update DetailContent.tsx to use new components

  **Must NOT do**:
  - Do NOT change any styling or CSS classes
  - Do NOT change the HTML structure
  - Do NOT add new props beyond what's needed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-component extraction requiring careful prop drilling
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commits for each component

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 2)
  - **Parallel Group**: Wave 3 - Final in sequence
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `components/court-detail/DetailContent.tsx:1172-1236` - renderItem logic
  - `components/court-detail/DetailContent.tsx:1238-1309` - renderTable logic
  - `components/court-detail/DetailContent.tsx:1341-1392` - renderFeeTable logic
  - `components/court-detail/types.ts` - Type definitions for props

  **Acceptance Criteria**:

  ```
  Scenario: Components extracted and line count reduced
    Tool: Bash (wc)
    Preconditions: Tasks 1-2 complete
    Steps:
      1. Run: wc -l components/court-detail/DetailContent.tsx
      2. Assert: Line count < 400 (was 1488)
      3. Run: ls components/court-detail/*.tsx | wc -l
      4. Assert: At least 5 .tsx files exist
    Expected Result: DetailContent significantly smaller
    Evidence: Line count output captured

  Scenario: React.memo applied to new components
    Tool: Bash (grep)
    Preconditions: Components extracted
    Steps:
      1. Run: grep -l "React.memo" components/court-detail/*.tsx
      2. Assert: At least 3 files use React.memo
    Expected Result: New components are memoized
    Evidence: grep output captured

  Scenario: Visual output still unchanged
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, all extractions complete
    Steps:
      1. Navigate to: http://localhost:3000
      2. Click first available court card
      3. Wait for: .court-detail-content visible (timeout: 10s)
      4. Scroll down to fees section
      5. Screenshot: .sisyphus/evidence/task-3-court-detail-final.png
      6. Visual comparison with task-1 baseline
    Expected Result: Identical rendering
    Evidence: .sisyphus/evidence/task-3-court-detail-final.png
  ```

  **Commit**: YES
  - Message: `refactor(court-detail): extract sub-components from DetailContent.tsx`
  - Files: `components/court-detail/*.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 4. Change SWR refresh interval from 5 to 15 minutes

  **What to do**:
  - Open `contexts/TennisDataContext.tsx`
  - Change line 79: `refreshInterval: 5 * 60 * 1000` → `refreshInterval: 15 * 60 * 1000`
  - Update comment to reflect new interval

  **Must NOT do**:
  - Do NOT change `revalidateOnFocus`, `revalidateOnReconnect`, or `dedupingInterval`
  - Do NOT change page-level `revalidate` in any page files
  - Do NOT add any other "optimizations"

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single line change, trivial task
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 5, 6, 7, 8, 10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `contexts/TennisDataContext.tsx:72-82` - SWR configuration block
  - Comment on line 79 explains current interval

  **Acceptance Criteria**:

  ```
  Scenario: Refresh interval changed to 15 minutes
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep "refreshInterval" contexts/TennisDataContext.tsx
      2. Assert: Contains "15 * 60 * 1000" OR "900000"
      3. Assert: Does NOT contain "5 * 60 * 1000"
    Expected Result: 15-minute interval configured
    Evidence: grep output captured

  Scenario: Build passes
    Tool: Bash
    Preconditions: Change applied
    Steps:
      1. Run: npm run build
      2. Assert: Exit code 0
    Expected Result: No build errors
    Evidence: Build output captured
  ```

  **Commit**: YES (groups with Task 5, 6)
  - Message: `perf: change SWR refresh interval from 5 to 15 minutes`
  - Files: `contexts/TennisDataContext.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 5. Add throttle to scroll event listener

  **What to do**:
  - Open `components/court-detail/CourtDetailClient.tsx`
  - Import throttle from lodash or implement simple throttle:
    ```typescript
    // Option 1: Use lodash (if already in project)
    import { throttle } from 'lodash';
    
    // Option 2: Simple implementation
    const throttle = (fn: Function, ms: number) => {
      let lastCall = 0;
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= ms) {
          lastCall = now;
          fn(...args);
        }
      };
    };
    ```
  - Wrap `handleScroll` with throttle (100ms recommended):
    ```typescript
    const throttledScroll = useMemo(
      () => throttle(handleScroll, 100),
      []
    );
    ```
  - Use `throttledScroll` in event listener

  **Must NOT do**:
  - Do NOT change the scroll detection logic itself
  - Do NOT change the sticky header behavior
  - Do NOT add new dependencies if lodash isn't already present

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple utility addition, clear pattern
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 6, 7, 8, 10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/court-detail/CourtDetailClient.tsx:34-44` - Current scroll handler
  - Check `package.json` for existing lodash dependency

  **Acceptance Criteria**:

  ```
  Scenario: Throttle implemented
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep -E "throttle|useMemo.*scroll" components/court-detail/CourtDetailClient.tsx
      2. Assert: Pattern found
    Expected Result: Throttle mechanism present
    Evidence: grep output captured

  Scenario: Scroll still works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Click first available court card
      3. Wait for: page load complete
      4. Scroll down: 500px
      5. Assert: Sticky header appears (or doesn't, depending on scroll position)
      6. Screenshot: .sisyphus/evidence/task-5-scroll-behavior.png
    Expected Result: Sticky header behavior unchanged
    Evidence: .sisyphus/evidence/task-5-scroll-behavior.png
  ```

  **Commit**: YES (groups with Task 4, 6)
  - Message: `perf: add throttle to scroll event listener`
  - Files: `components/court-detail/CourtDetailClient.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 6. Change GA/AdSense script strategy to lazyOnload

  **What to do**:
  - Open `components/GoogleAnalytics.tsx`
    - Change line 17: `strategy="afterInteractive"` → `strategy="lazyOnload"`
    - Change line 20: `strategy="afterInteractive"` → `strategy="lazyOnload"`
  - Open `components/GoogleAdSense.tsx`
    - Change line 15: `strategy="afterInteractive"` → `strategy="lazyOnload"`

  **Must NOT do**:
  - Do NOT change any other Script attributes
  - Do NOT modify the script content or src URLs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple attribute change, 3 lines total
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5, 7, 8, 10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/GoogleAnalytics.tsx:14-25` - GA Script components
  - `components/GoogleAdSense.tsx:11-16` - AdSense Script component

  **Acceptance Criteria**:

  ```
  Scenario: Script strategy changed to lazyOnload
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep "strategy=" components/GoogleAnalytics.tsx components/GoogleAdSense.tsx
      2. Assert: All matches show "lazyOnload"
      3. Assert: No matches show "afterInteractive"
    Expected Result: All scripts use lazyOnload
    Evidence: grep output captured

  Scenario: Scripts still load (eventually)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, GA_TRACKING_ID set
    Steps:
      1. Navigate to: http://localhost:3000
      2. Wait for: page fully loaded + 5 seconds
      3. Execute JS: window.gtag !== undefined
      4. Assert: gtag function exists (GA loaded)
    Expected Result: GA loads after page interaction
    Evidence: Console output captured
  ```

  **Commit**: YES (groups with Task 4, 5)
  - Message: `perf: change GA/AdSense script strategy to lazyOnload`
  - Files: `components/GoogleAnalytics.tsx`, `components/GoogleAdSense.tsx`
  - Pre-commit: `npm run build`

---

### Phase 2: Code Quality

- [ ] 7. Fix empty catch blocks with proper error handling

  **What to do**:
  - Open `components/favorite/FavoriteButton.tsx`
    - Line 97-98: Replace empty catch block with:
      ```typescript
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      } finally {
      ```
  - Open `components/review/ReviewList.tsx`
    - Line 88-90: Add error logging before alert:
      ```typescript
      } catch (error) {
        console.error('Failed to delete review:', error);
        alert('후기 삭제에 실패했습니다.');
      }
      ```

  **Must NOT do**:
  - Do NOT change the try block logic
  - Do NOT add toast notifications or other UI feedback (keep existing alert)
  - Do NOT re-throw errors (maintain current behavior)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple error logging additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5, 6, 8, 10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/favorite/FavoriteButton.tsx:97-98` - Empty catch block
  - `components/review/ReviewList.tsx:88-90` - Catch with alert but no logging

  **Acceptance Criteria**:

  ```
  Scenario: No more empty catch blocks
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep -A1 "catch" components/favorite/FavoriteButton.tsx
      2. Assert: Shows console.error, not empty braces
      3. Run: grep -B1 -A2 "catch" components/review/ReviewList.tsx
      4. Assert: Shows console.error before alert
    Expected Result: All catch blocks have error handling
    Evidence: grep output captured

  Scenario: Lint passes
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: npm run lint
      2. Assert: No new errors about empty catch blocks
    Expected Result: Lint clean
    Evidence: Lint output captured
  ```

  **Commit**: YES
  - Message: `fix: add error logging to empty catch blocks`
  - Files: `components/favorite/FavoriteButton.tsx`, `components/review/ReviewList.tsx`
  - Pre-commit: `npm run lint`

---

- [ ] 8. Delete unused AdSense.tsx (dead code)

  **What to do**:
  - Verify `components/AdSense.tsx` is not imported anywhere:
    ```bash
    grep -r "from.*AdSense" --include="*.tsx" --include="*.ts" .
    ```
  - Delete `components/AdSense.tsx`

  **Must NOT do**:
  - Do NOT delete `components/GoogleAdSense.tsx` (this is the ACTIVE one)
  - Do NOT hunt for other dead code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file deletion after verification
  - **Skills**: [`git-master`]
    - `git-master`: Proper commit for file deletion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5, 6, 7, 10)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/AdSense.tsx` - File to delete (17 lines, never imported)
  - `components/GoogleAdSense.tsx` - Active file, DO NOT DELETE
  - `app/layout.tsx:8` - Imports GoogleAdSense (NOT AdSense)

  **Acceptance Criteria**:

  ```
  Scenario: AdSense.tsx deleted
    Tool: Bash
    Preconditions: Verified no imports
    Steps:
      1. Run: ls components/AdSense.tsx 2>/dev/null || echo "DELETED"
      2. Assert: Output is "DELETED"
      3. Run: ls components/GoogleAdSense.tsx
      4. Assert: File exists (active file preserved)
    Expected Result: Dead code removed, active code preserved
    Evidence: ls output captured

  Scenario: Build still works
    Tool: Bash
    Preconditions: File deleted
    Steps:
      1. Run: npm run build
      2. Assert: Exit code 0 (no import errors)
    Expected Result: No broken imports
    Evidence: Build output captured
  ```

  **Commit**: YES
  - Message: `chore: remove unused AdSense.tsx component`
  - Files: `components/AdSense.tsx` (deleted)
  - Pre-commit: `npm run build`

---

- [ ] 9. Extract status checking utility

  **What to do**:
  - Create `lib/courtStatus.ts`:
    ```typescript
    /**
     * Court status checking utilities
     * 
     * Two patterns exist for different use cases:
     * - isAvailable: For display purposes (accepting OR reservable)
     * - isAccepting: For sorting priority (only actively accepting)
     */
    
    /** Check if court is available for reservation (display purposes) */
    export const isCourtAvailable = (status: string): boolean =>
      status === '접수중' || status.includes('예약가능');
    
    /** Check if court is actively accepting reservations (sorting priority) */
    export const isCourtAccepting = (status: string): boolean =>
      status === '접수중';
    
    /** Sort courts with accepting courts first */
    export const sortByAvailability = <T extends { SVCSTATNM: string }>(courts: T[]): T[] =>
      [...courts].sort((a, b) => {
        const aAccepting = isCourtAccepting(a.SVCSTATNM);
        const bAccepting = isCourtAccepting(b.SVCSTATNM);
        if (aAccepting && !bAccepting) return -1;
        if (!aAccepting && bAccepting) return 1;
        return 0;
      });
    ```
  - Update imports in these files (use appropriate function):
    - `app/page.tsx:24` → use `isCourtAvailable`
    - `app/api/tennis/route.ts:33` → use `isCourtAvailable`
    - `contexts/TennisDataContext.tsx:50-51` → use `sortByAvailability` or `isCourtAccepting`
    - `app/[district]/page.tsx:59-60` → use `sortByAvailability` or `isCourtAccepting`
    - `components/favorite/FavoriteCourtSection.tsx:36` → use `isCourtAvailable`
    - `components/court-detail/CourtDetailClient.tsx:46` → use `isCourtAvailable`
    - `components/district/DistrictContent.tsx:33-34` → use `sortByAvailability`

  **Must NOT do**:
  - Do NOT change the actual logic - preserve both patterns
  - Do NOT unify to a single function (they serve different purposes)
  - Do NOT add additional status values or conditions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Utility extraction with multiple file updates, but straightforward
  - **Skills**: [`git-master`]
    - `git-master`: Good commit hygiene for multi-file change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (can run with Wave 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/page.tsx:24` - Uses availability check for counting
  - `app/api/tennis/route.ts:33` - Uses availability check for API response
  - `contexts/TennisDataContext.tsx:50-51` - Uses for sorting (only '접수중')
  - `app/[district]/page.tsx:59-60` - Uses for sorting (only '접수중')
  - `components/favorite/FavoriteCourtSection.tsx:36` - Uses availability check
  - `components/court-detail/CourtDetailClient.tsx:46` - Uses availability check
  - `components/district/DistrictContent.tsx:33-34` - Uses for sorting (only '접수중')

  **Acceptance Criteria**:

  ```
  Scenario: Status utility created
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: cat lib/courtStatus.ts
      2. Assert: Contains isCourtAvailable function
      3. Assert: Contains isCourtAccepting function
      4. Assert: Contains sortByAvailability function
    Expected Result: Utility file with both patterns
    Evidence: File content captured

  Scenario: All usages updated
    Tool: Bash (grep)
    Preconditions: Utility created
    Steps:
      1. Run: grep -r "SVCSTATNM.*===" app/ components/ contexts/ --include="*.tsx" --include="*.ts" | grep -v courtStatus
      2. Assert: No direct SVCSTATNM comparisons outside courtStatus.ts
      3. Run: grep -r "from.*courtStatus" --include="*.tsx" --include="*.ts" | wc -l
      4. Assert: At least 7 imports
    Expected Result: All status checks use utility
    Evidence: grep output captured

  Scenario: Behavior unchanged
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: Courts sorted correctly (accepting first)
      3. Navigate to: http://localhost:3000/강남구
      4. Assert: District page shows courts
      5. Screenshot: .sisyphus/evidence/task-9-status-behavior.png
    Expected Result: Sorting and availability display unchanged
    Evidence: .sisyphus/evidence/task-9-status-behavior.png
  ```

  **Commit**: YES
  - Message: `refactor: extract status checking to lib/courtStatus.ts`
  - Files: `lib/courtStatus.ts`, `app/page.tsx`, `app/api/tennis/route.ts`, `contexts/TennisDataContext.tsx`, `app/[district]/page.tsx`, `components/favorite/FavoriteCourtSection.tsx`, `components/court-detail/CourtDetailClient.tsx`, `components/district/DistrictContent.tsx`
  - Pre-commit: `npm run build`

---

### Phase 3: Accessibility

- [ ] 10. Add skip-to-content link and main landmark

  **What to do**:
  - Open `app/layout.tsx`
  - Add skip link as first child of body:
    ```tsx
    <body>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        메인 콘텐츠로 건너뛰기
      </a>
      {/* existing content */}
    </body>
    ```
  - Add id to main element:
    ```tsx
    <main id="main-content" className="...existing classes...">
    ```

  **Must NOT do**:
  - Do NOT change the visual layout
  - Do NOT modify any existing styling
  - Do NOT add other accessibility features in this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTML additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5, 6, 7, 8)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/layout.tsx` - Root layout file
  - Current `<main>` element location for id addition

  **Acceptance Criteria**:

  ```
  Scenario: Skip link exists and works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Press Tab key
      3. Assert: First focused element is skip link (text: "메인 콘텐츠로 건너뛰기")
      4. Press Enter
      5. Assert: Focus moves to #main-content
      6. Screenshot: .sisyphus/evidence/task-10-skip-link.png
    Expected Result: Skip link navigates to main content
    Evidence: .sisyphus/evidence/task-10-skip-link.png

  Scenario: Skip link visually hidden until focused
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Assert: Skip link not visible (sr-only class applied)
      3. Press Tab key
      4. Assert: Skip link becomes visible (focus:not-sr-only)
    Expected Result: Skip link only visible on focus
    Evidence: Screenshots captured
  ```

  **Commit**: YES
  - Message: `a11y: add skip-to-content link and main landmark id`
  - Files: `app/layout.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 11. Add role="alert" to error messages

  **What to do**:
  - Open `app/login/page.tsx`
    - Find error message div (search for "text-red" or error display)
    - Add `role="alert"` to the error container
  - Open `components/review/ReviewForm.tsx`
    - Find error message display
    - Add `role="alert"` to the error container
  - Open `app/error.tsx`
    - Find error message element
    - Add `role="alert"` to announce error to screen readers

  **Must NOT do**:
  - Do NOT change error message content or styling
  - Do NOT add aria-live (role="alert" implies aria-live="assertive")

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple attribute additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 9)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/login/page.tsx` - Login error display
  - `components/review/ReviewForm.tsx` - Form validation errors
  - `app/error.tsx` - Error boundary display
  - `components/ui/Toast.tsx` - ALREADY has role="alert" (reference pattern)

  **Acceptance Criteria**:

  ```
  Scenario: Error elements have role="alert"
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep -l 'role="alert"' app/login/page.tsx components/review/ReviewForm.tsx app/error.tsx
      2. Assert: All 3 files listed
    Expected Result: All error displays have role="alert"
    Evidence: grep output captured

  Scenario: Error announced dynamically
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/login
      2. Find and submit form with invalid data (if applicable)
      3. Assert: Error element has role="alert" attribute
      4. Screenshot: .sisyphus/evidence/task-11-error-alert.png
    Expected Result: Error element properly marked
    Evidence: .sisyphus/evidence/task-11-error-alert.png
  ```

  **Commit**: YES
  - Message: `a11y: add role="alert" to error messages`
  - Files: `app/login/page.tsx`, `components/review/ReviewForm.tsx`, `app/error.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 12. Add aria-busy to loading states

  **What to do**:
  - Identify skeleton loader containers in:
    - `components/district/DistrictGrid.tsx` (line ~81)
    - `components/district/DistrictContent.tsx` (line ~81)
    - `components/favorite/FavoriteCourtSection.tsx` (line ~122)
    - `components/layout/Header.tsx` (line ~60)
  - Add `aria-busy="true"` to parent container during loading
  - Example pattern:
    ```tsx
    <div aria-busy={isLoading} aria-label="로딩 중...">
      {isLoading ? <SkeletonLoader /> : <ActualContent />}
    </div>
    ```
  - Ensure aria-busy is removed (set to false or removed) when loading completes

  **Must NOT do**:
  - Do NOT change skeleton visual appearance
  - Do NOT add other ARIA attributes beyond aria-busy

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple attribute additions across multiple files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 13)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/district/DistrictGrid.tsx:81` - Skeleton with animate-pulse
  - `components/district/DistrictContent.tsx:81` - Loading state
  - `components/favorite/FavoriteCourtSection.tsx:122` - Skeleton loader
  - `components/layout/Header.tsx:60` - Header skeleton

  **Acceptance Criteria**:

  ```
  Scenario: aria-busy added to loading containers
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Run: grep -l "aria-busy" components/district/DistrictGrid.tsx components/district/DistrictContent.tsx components/favorite/FavoriteCourtSection.tsx components/layout/Header.tsx
      2. Assert: At least 3 of 4 files have aria-busy
    Expected Result: Loading states are accessible
    Evidence: grep output captured

  Scenario: aria-busy toggles with loading state
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000 with slow network simulation
      2. Assert: Container has aria-busy="true" during load
      3. Wait for content to load
      4. Assert: aria-busy is false or removed
    Expected Result: aria-busy reflects loading state
    Evidence: DOM snapshots captured
  ```

  **Commit**: YES
  - Message: `a11y: add aria-busy to skeleton loading states`
  - Files: `components/district/DistrictGrid.tsx`, `components/district/DistrictContent.tsx`, `components/favorite/FavoriteCourtSection.tsx`, `components/layout/Header.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 13. Verify LoginPrompt focus behavior (changed from "implement focus trap")

  **What to do**:
  - This task was CHANGED based on Metis review
  - Native `<dialog>.showModal()` already provides focus trapping
  - VERIFY current behavior works correctly:
    1. Open LoginPrompt modal
    2. Tab through all focusable elements
    3. Verify focus stays within modal
    4. Close modal
    5. Verify focus returns to trigger element
  - If any issues found, document them for a follow-up task

  **Must NOT do**:
  - Do NOT implement custom focus trap (native dialog handles this)
  - Do NOT add focus-trap library
  - Do NOT modify the dialog implementation unless bugs are found

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task only, no code changes expected
  - **Skills**: [`playwright`]
    - `playwright`: Needed for focus testing automation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 12)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `components/auth/LoginPrompt.tsx:25` - Uses `dialogRef.current.showModal()`
  - HTML `<dialog>` spec: Native focus trapping with showModal()

  **Acceptance Criteria**:

  ```
  Scenario: Focus trapped within modal
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000
      2. Trigger LoginPrompt modal (click action that requires auth)
      3. Wait for: dialog[open] visible
      4. Press Tab repeatedly (10 times)
      5. Assert: Focus never leaves the dialog
      6. Screenshot: .sisyphus/evidence/task-13-focus-trap.png
    Expected Result: Focus stays within modal
    Evidence: .sisyphus/evidence/task-13-focus-trap.png

  Scenario: Focus returns on close
    Tool: Playwright (playwright skill)
    Preconditions: Modal is open
    Steps:
      1. Press Escape key (or click close button)
      2. Assert: Dialog closes
      3. Assert: Focus returns to trigger element (or reasonable fallback)
    Expected Result: Focus restored after close
    Evidence: Focus element captured

  Scenario: Document any issues found
    Tool: Manual note
    Preconditions: Verification complete
    Steps:
      1. If issues found: Create .sisyphus/evidence/task-13-issues.md
      2. Document: What's broken, expected behavior, suggested fix
    Expected Result: Clear documentation of any problems
    Evidence: Issues file if created
  ```

  **Commit**: NO (verification only, no code changes expected)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `refactor(court-detail): extract utilities from DetailContent.tsx` | utils/*.ts, DetailContent.tsx | npm run build |
| 2 | `perf(court-detail): add memoization to DetailContent.tsx` | DetailContent.tsx | npm run build |
| 3 | `refactor(court-detail): extract sub-components from DetailContent.tsx` | *.tsx | npm run build |
| 4, 5, 6 | `perf: optimize SWR interval, scroll throttle, and script loading` | 4 files | npm run build |
| 7 | `fix: add error logging to empty catch blocks` | 2 files | npm run lint |
| 8 | `chore: remove unused AdSense.tsx component` | (deleted) | npm run build |
| 9 | `refactor: extract status checking to lib/courtStatus.ts` | 8 files | npm run build |
| 10 | `a11y: add skip-to-content link and main landmark id` | layout.tsx | npm run build |
| 11 | `a11y: add role="alert" to error messages` | 3 files | npm run build |
| 12 | `a11y: add aria-busy to skeleton loading states` | 4 files | npm run build |
| 13 | (no commit - verification only) | - | - |

---

## Success Criteria

### Verification Commands
```bash
# Build passes
npm run build  # Expected: Exit code 0

# Lint passes
npm run lint  # Expected: No new errors

# DetailContent line count reduced
wc -l components/court-detail/DetailContent.tsx  # Expected: < 400

# Memoization present
grep -c "useMemo\|useCallback" components/court-detail/DetailContent.tsx  # Expected: >= 4

# SWR interval updated
grep "refreshInterval" contexts/TennisDataContext.tsx  # Expected: 15 * 60 * 1000

# No empty catch blocks
grep -r "catch.*{\s*}" components/  # Expected: 0 matches

# Status utility used
grep -c "from.*courtStatus" app/ components/ contexts/  # Expected: >= 7

# Skip link exists
grep "skip" app/layout.tsx  # Expected: Found

# role="alert" added
grep -l 'role="alert"' app/login/page.tsx components/review/ReviewForm.tsx app/error.tsx  # Expected: 3 files
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent (no behavior changes)
- [ ] All tests pass (npm run build, npm run lint)
- [ ] DetailContent.tsx < 400 lines
- [ ] All 13 tasks completed or verified
