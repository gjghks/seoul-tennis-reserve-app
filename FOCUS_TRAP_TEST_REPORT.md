# LoginPrompt Modal - Focus Trap & Return Test Report

**Test Date**: 2026-02-17  
**Tester**: Playwright Browser Automation  
**Component**: LoginPrompt Modal (native HTML `<dialog>` with `showModal()`)  
**Status**: ❌ **CRITICAL ACCESSIBILITY ISSUES FOUND**

---

## Executive Summary

The LoginPrompt modal has **TWO CRITICAL ACCESSIBILITY BUGS** related to focus management:

1. **Focus is NOT trapped within the modal** - Focus escapes to page elements outside the dialog
2. **Focus is NOT returned to trigger element on close** - Focus moves to BODY instead of the favorite button

These issues violate WCAG 2.1 Level AA accessibility standards and create a poor user experience for keyboard users.

---

## Test Procedure

### Step 1: Navigate to Court Detail Page
- ✅ Navigated to http://localhost:3000
- ✅ Clicked on "강남구" (Gangnam-gu) district
- ✅ Clicked on "마루공원 테니스장 1면" court card
- ✅ Arrived at court detail page

### Step 2: Trigger LoginPrompt Dialog
- ✅ Located "즐겨찾기 추가" (Add to Favorites) button
- ✅ Clicked the button
- ✅ LoginPrompt dialog appeared with:
  - Heading: "🔒 로그인이 필요합니다" (Login required)
  - Message: "즐겨찾기 기능을 사용하려면 로그인해주세요"
  - Two focusable elements:
    1. "로그인하기" (Login) - Link
    2. "나중에" (Later) - Button

### Step 3: Test Focus Trapping
- ✅ Dialog confirmed open: `dialog.open === true`
- ✅ Pressed Tab key 15 times
- ✅ Tracked focus position after each Tab press

---

## Test Results

### Focus Trapping Test Results

```
Tab 0:  A(로그인하기)      [InDialog: true]  ✅
Tab 1:  BUTTON(나중에)     [InDialog: true]  ✅
Tab 2:  BODY               [InDialog: false] ❌ FOCUS ESCAPED!
Tab 3:  A(로그인하기)      [InDialog: true]  ✅
Tab 4:  BUTTON(나중에)     [InDialog: true]  ✅
Tab 5:  BODY               [InDialog: false] ❌ FOCUS ESCAPED!
Tab 6:  A(로그인하기)      [InDialog: true]  ✅
Tab 7:  BUTTON(나중에)     [InDialog: true]  ✅
Tab 8:  BODY               [InDialog: false] ❌ FOCUS ESCAPED!
Tab 9:  A(로그인하기)      [InDialog: true]  ✅
Tab 10: BUTTON(나중에)     [InDialog: true]  ✅
Tab 11: A(로그인하기)      [InDialog: true]  ✅
Tab 12: BUTTON(나중에)     [InDialog: true]  ✅
Tab 13: BODY               [InDialog: false] ❌ FOCUS ESCAPED!
Tab 14: A(로그인하기)      [InDialog: true]  ✅
```

**Pattern**: Focus cycles through the 2 dialog elements, then escapes to BODY (page root), then returns to dialog. This pattern repeats inconsistently.

**Expected Behavior**: Focus should cycle ONLY between the 2 dialog elements (Login and Later buttons) and never escape to page elements.

### Focus Return Test Results

**Before Escape**:
- Dialog: Open (`dialog.open === true`)
- Focused Element: One of the dialog buttons

**After Pressing Escape**:
- Dialog: Closed (no dialog element found)
- Focused Element: **BODY** ❌
- Expected: **"즐겨찾기 추가" button** (the trigger element)

**Result**: ❌ **FAILED** - Focus was NOT returned to the trigger element

---

## Root Cause Analysis

### Issue 1: Focus Trapping Not Working

The native HTML `<dialog>` element with `showModal()` should automatically trap focus per the HTML specification. However, the focus is escaping to page elements.

**Possible Causes**:
1. The dialog might not be properly using `showModal()` (should use modal mode, not modeless)
2. There might be JavaScript code preventing default focus trap behavior
3. The dialog might be missing proper ARIA attributes
4. Browser/React compatibility issue with focus management

### Issue 2: Focus Not Returned on Close

When the dialog closes (via Escape key), focus should return to the element that triggered the dialog opening. Instead, focus moves to BODY.

**Possible Causes**:
1. No code to store and restore focus on dialog close
2. The dialog close handler doesn't explicitly manage focus
3. React state management might be interfering with focus restoration

---

## Code Recommendations

### Fix 1: Implement Manual Focus Trapping

Add a focus trap utility if the native dialog focus trapping isn't working:

```typescript
// In LoginPrompt component
useEffect(() => {
  if (!dialogRef.current?.open) return;

  const dialog = dialogRef.current;
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift+Tab on first element -> focus last element
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab on last element -> focus first element
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  dialog.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => dialog.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

### Fix 2: Restore Focus on Dialog Close

```typescript
// Store trigger element reference
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setIsOpen(false);
  // Return focus to trigger element
  triggerRef.current?.focus();
};

const handleEscape = (e: React.KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose();
  }
};
```

### Fix 3: Verify Dialog Usage

Ensure the dialog is using `showModal()` correctly:

```typescript
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.showModal(); // Modal mode (traps focus)
    // NOT: dialogRef.current?.show(); // Modeless (doesn't trap focus)
  } else {
    dialogRef.current?.close();
  }
}, [isOpen]);
```

---

## WCAG Compliance Issues

| WCAG Criterion | Status | Issue |
|---|---|---|
| 2.1.2 No Keyboard Trap | ❌ FAIL | Focus can escape dialog via Tab key |
| 2.4.3 Focus Order | ❌ FAIL | Focus order is not logical when escaping dialog |
| 2.4.7 Focus Visible | ⚠️ PARTIAL | Focus is visible but escapes modal |
| 3.2.1 On Focus | ⚠️ PARTIAL | Unexpected focus changes when tabbing |

---

## Screenshots

1. **login-prompt-dialog-open.png** - Dialog open with focus on first button
2. **dialog-closed-focus-lost.png** - Dialog closed, focus lost to BODY

---

## Recommendations

### Priority: CRITICAL 🔴

1. **Implement manual focus trapping** - Add keyboard event listener to prevent Tab from escaping dialog
2. **Restore focus on close** - Store trigger element reference and restore focus when dialog closes
3. **Test with keyboard navigation** - Verify Tab/Shift+Tab behavior works correctly
4. **Add ARIA attributes** - Ensure dialog has proper `role="dialog"` and `aria-modal="true"`

### Priority: HIGH 🟠

1. Test with screen readers (NVDA, JAWS, VoiceOver)
2. Test with different browsers (Chrome, Firefox, Safari, Edge)
3. Add automated accessibility tests to CI/CD pipeline
4. Document focus management behavior in component comments

---

## Test Environment

- **Browser**: Chromium (Playwright)
- **URL**: http://localhost:3000/gangnam-gu/S210205141719898815
- **Component**: LoginPrompt modal
- **Framework**: Next.js with React
- **Dialog Implementation**: Native HTML `<dialog>` element

---

## Conclusion

The LoginPrompt modal has **critical accessibility issues** that must be fixed before production deployment. The focus trapping is not working as expected, and focus is not being returned to the trigger element on close. These issues will significantly impact keyboard users and violate WCAG accessibility standards.

**Immediate action required** to implement proper focus management in the LoginPrompt component.
