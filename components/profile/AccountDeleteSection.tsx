'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { queueToastAfterReload } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { useThemeClass, cn } from '@/lib/cn';
import { ACCOUNT_DELETE_CONFIRM_TEXT } from '@/lib/account/constants';
import Button from '@/components/ui/Button';

/** Browser-side keys that hold personal data (theme/mode/PWA preferences are kept). */
const PERSONAL_LOCAL_STORAGE_KEYS = [
  'seoul-tennis-recent-courts', // lib/hooks/useRecentCourts.ts
  'tennis-recent-searches', // lib/hooks/useRecentSearches.ts
  'current_login_provider', // lib/hooks/useReservationTip.ts
  'auth_redirect', // app/login/page.tsx
  'seoul-tennis.search.anon-id', // lib/utils/searchExperiment.ts
  'seoul-tennis.search.variant', // lib/utils/searchExperiment.ts
];

const DELETED_ITEMS = [
  '프로필 정보 (이메일, 닉네임, 성별, 소개)',
  '테니스 프로필, 래더 랭킹·ELO 기록',
  '경기 기록과 첨부 사진',
  '작성한 리뷰와 사진',
  '즐겨찾기, 빈자리 알림 설정, 푸시 알림 구독',
  '내가 만든 매칭 글·양도 글·대회 (다른 회원의 신청·관심 표시 포함)',
  '다른 회원의 글에 남긴 매칭 신청·양도 관심 표시',
];

function clearPersonalLocalStorage() {
  for (const key of PERSONAL_LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  }
}

async function unsubscribeBrowserPush() {
  try {
    if (!('serviceWorker' in navigator)) return;
    // getRegistration() resolves undefined when no SW is registered
    // (unlike serviceWorker.ready, which would hang in dev).
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  } catch {
    /* best effort: the server-side subscription row is already deleted */
  }
}

export default function AccountDeleteSection() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const errorId = useId();

  const canSubmit = confirmText.trim() === ACCOUNT_DELETE_CONFIRM_TEXT && !isDeleting;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [isOpen, mounted]);

  const openDialog = () => {
    setConfirmText('');
    setErrorMessage(null);
    setIsOpen(true);
  };

  const closeDialog = useCallback(() => {
    if (isDeleting) return;
    setIsOpen(false);
  }, [isDeleting]);

  const handleCancel = useCallback((e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    closeDialog();
  }, [closeDialog]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href]'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: confirmText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || '회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setIsDeleting(false);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.');
      setIsDeleting(false);
      return;
    }

    // Account is deleted on the server. Clean up this browser BEFORE signOut:
    // signOut emits SIGNED_OUT, AuthContext drops the user and /my unmounts
    // this component, so nothing after it may depend on component state.
    await unsubscribeBrowserPush();
    clearPersonalLocalStorage();
    queueToastAfterReload('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.', 'success');
    try {
      // Returns { error } instead of throwing; either way the hard navigation
      // below reloads auth state from the cookies the server already expired.
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* session is already invalid */
    }
    // Hard navigation resets AuthContext, the in-memory SWR cache and every
    // hook's state for sure (a soft router.replace + refresh would not).
    window.location.replace('/');
  };

  const mutedText = themeClass(
    'text-black/70 dark:text-slate-300 font-medium',
    'text-gray-500 dark:text-slate-400'
  );

  return (
    <section className="mt-10 mb-8" aria-labelledby={`${titleId}-section`}>
      <h2
        id={`${titleId}-section`}
        className={`text-lg mb-4 flex items-center gap-2 ${themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-semibold text-gray-900 dark:text-slate-100')}`}
      >
        {isNeoBrutalism ? '⚙️ ' : ''}계정 관리
      </h2>

      <div className={themeClass(
        'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-5',
        'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5'
      )}>
        <h3 className={themeClass('font-black text-black dark:text-slate-100', 'font-semibold text-gray-900 dark:text-slate-100')}>
          회원 탈퇴
        </h3>
        <p className={cn('mt-2 text-sm', mutedText)}>
          탈퇴하면 아래 정보가 <strong className={themeClass('font-black text-red-600 dark:text-red-400', 'font-semibold text-red-600 dark:text-red-400')}>즉시 영구 삭제되며 복구할 수 없습니다.</strong>
        </p>
        <ul className={cn('mt-3 text-sm list-disc pl-5 space-y-1', mutedText)}>
          {DELETED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul className={cn('mt-3 text-xs space-y-1', themeClass('text-black/60 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>
          <li>· 다른 회원이 만든 대회에 이름으로 등록된 참가 기록은 대진표 보존을 위해 남고, 계정과의 연결만 해제됩니다.</li>
          <li>· 다른 회원이 직접 입력한 상대 이름(경기 기록) 등은 해당 회원의 데이터로 남습니다.</li>
          <li>· 로그인 없이 보낸 익명 의견은 계정과 연결되어 있지 않아 삭제 대상이 아닙니다.</li>
          <li>· 시스템 백업본에 남은 사본은 보관 주기가 지나면 자동으로 삭제됩니다.</li>
          <li>
            · 카카오·구글 계정과의 연결(앱 권한)은 자동으로 해제되지 않습니다. 카카오톡 설정 &gt; 카카오계정 &gt; 연결된 서비스 관리, 또는 Google 계정 &gt; 보안 &gt; 서드 파티 연결에서 직접 해제할 수 있습니다.
          </li>
        </ul>

        <div className="mt-5">
          <button
            ref={triggerRef}
            type="button"
            onClick={openDialog}
            aria-haspopup="dialog"
            className={themeClass(
              'px-4 py-2 text-sm font-bold bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 rounded-[5px] shadow-[3px_3px_0px_0px_#dc2626] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all',
              'px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors'
            )}
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {mounted && createPortal(
        <dialog
          ref={dialogRef}
          className="fixed inset-0 z-50 bg-transparent backdrop:bg-black/50 p-4"
          onCancel={handleCancel}
          onKeyDown={handleKeyDown}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <form
            onSubmit={handleSubmit}
            className={themeClass(
              'bg-white dark:bg-slate-900 border-[3px] border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#f1f3f8] p-6 max-w-sm mx-auto',
              'bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl p-6 max-w-sm mx-auto'
            )}
          >
            <h2 id={titleId} className={`text-xl mb-3 ${themeClass('font-black text-black dark:text-slate-100', 'font-semibold text-gray-900 dark:text-slate-100')}`}>
              정말 탈퇴하시겠어요?
            </h2>
            <p id={descId} className={cn('mb-4 text-sm', mutedText)}>
              계정과 모든 활동 기록이 즉시 삭제되며 되돌릴 수 없습니다. 같은 카카오·구글 계정으로 다시 가입할 수는 있지만 이전 데이터는 복구되지 않습니다.
            </p>

            <label htmlFor={inputId} className={cn('block text-sm mb-2', themeClass('font-bold text-black dark:text-slate-100', 'font-medium text-gray-700 dark:text-slate-200'))}>
              확인을 위해 &apos;{ACCOUNT_DELETE_CONFIRM_TEXT}&apos;를 입력해주세요
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? errorId : undefined}
              placeholder={ACCOUNT_DELETE_CONFIRM_TEXT}
              className={themeClass(
                'w-full px-3 py-2 bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold focus:outline-none focus:ring-2 focus:ring-red-500',
                'w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
              )}
            />

            <p id={errorId} role="alert" className={cn('min-h-[1.25rem] mt-2 text-sm', themeClass('font-bold text-red-600 dark:text-red-400', 'text-red-600 dark:text-red-400'))}>
              {errorMessage}
            </p>

            <div className="flex gap-3 mt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={isDeleting}
                className="flex-1 py-3"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={!canSubmit}
                loading={isDeleting}
                className="flex-1 py-3"
              >
                {isDeleting ? '탈퇴 처리 중' : '탈퇴하기'}
              </Button>
            </div>
          </form>
        </dialog>,
        document.body,
      )}
    </section>
  );
}
