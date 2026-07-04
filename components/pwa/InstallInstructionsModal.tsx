'use client';

import { useEffect } from 'react';
import { useThemeClass } from '@/lib/cn';
import type { PWAPlatform } from '@/contexts/PWAInstallContext';

interface InstallInstructionsModalProps {
  open: boolean;
  platform: PWAPlatform;
  isIOSSafari: boolean;
  onClose: () => void;
}

interface Guide {
  intro: string;
  steps: string[];
  note?: string;
}

function getGuide(platform: PWAPlatform, isIOSSafari: boolean): Guide {
  if (platform === 'ios') {
    if (!isIOSSafari) {
      return {
        intro: 'iPhone·iPad에서는 Safari 브라우저에서만 홈 화면에 추가할 수 있어요.',
        steps: [
          '이 페이지를 Safari로 다시 열어주세요',
          '하단 가운데의 공유 버튼(□ 위로 화살표)을 누르세요',
          '"홈 화면에 추가"를 선택하고 "추가"를 누르세요',
        ],
        note: 'Chrome·네이버 등 다른 브라우저에서는 설치 메뉴가 없습니다.',
      };
    }
    return {
      intro: 'Safari에서 몇 번의 탭으로 앱처럼 설치할 수 있어요.',
      steps: [
        '하단 가운데의 공유 버튼(□ 위로 화살표)을 누르세요',
        '메뉴를 내려 "홈 화면에 추가"를 선택하세요',
        '오른쪽 위 "추가"를 누르면 완료!',
      ],
    };
  }
  if (platform === 'android') {
    return {
      intro: '브라우저 메뉴에서 바로 설치할 수 있어요.',
      steps: [
        '오른쪽 위 메뉴(⋮)를 누르세요',
        '"앱 설치" 또는 "홈 화면에 추가"를 선택하세요',
        '"설치"를 누르면 홈 화면에 추가돼요!',
      ],
      note: '카카오톡·인스타그램 인앱 브라우저에서는 설치가 안 됩니다. Chrome·삼성 인터넷으로 열어주세요.',
    };
  }
  // desktop
  return {
    intro: 'PC에서도 앱처럼 창으로 실행할 수 있어요.',
    steps: [
      '주소창 오른쪽 끝의 설치 아이콘(⊕ 또는 모니터 모양)을 클릭하세요',
      '아이콘이 없다면 메뉴(⋮) → "앱 설치 / 페이지를 앱으로 설치"',
      '"설치"를 누르면 완료!',
    ],
    note: 'Chrome·Edge에서 지원됩니다. (Safari 데스크톱은 Dock에 추가)',
  };
}

export default function InstallInstructionsModal({ open, platform, isIOSSafari, onClose }: InstallInstructionsModalProps) {
  const themeClass = useThemeClass();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const guide = getGuide(platform, isIOSSafari);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative w-full sm:max-w-md m-0 sm:m-4 p-6 ${themeClass(
          'bg-white dark:bg-slate-900 border-[3px] border-black dark:border-[#f1f3f8] rounded-t-[16px] sm:rounded-[16px] shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#f1f3f8]',
          'bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl'
        )}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${themeClass(
            'bg-black rounded-[8px]',
            'rounded-xl bg-green-600'
          )}`}>
            <svg className={`w-7 h-7 ${themeClass('text-[#84cc16]', 'text-white')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12C7.5 12 12 7.5 12 2" />
              <path d="M22 12C16.5 12 12 16.5 12 22" />
            </svg>
          </div>
          <h2 id="install-guide-title" className={`text-lg font-bold ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
            홈 화면에 앱 설치
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={`ml-auto w-8 h-8 flex items-center justify-center rounded-full ${themeClass(
              'hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-slate-200',
              'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400'
            )}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className={`text-sm mb-4 ${themeClass('text-black/70 dark:text-slate-300', 'text-gray-600 dark:text-slate-300')}`}>
          {guide.intro}
        </p>

        <ol className="flex flex-col gap-3 mb-4">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`shrink-0 w-6 h-6 flex items-center justify-center text-sm font-bold ${themeClass(
                'bg-[var(--nb-accent-bg)] text-black border-2 border-black rounded-[6px]',
                'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full'
              )}`}>
                {i + 1}
              </span>
              <span className={`text-sm pt-0.5 ${themeClass('text-black dark:text-slate-200', 'text-gray-800 dark:text-slate-200')}`}>
                {step}
              </span>
            </li>
          ))}
        </ol>

        {guide.note && (
          <p className={`text-xs px-3 py-2 rounded-[8px] ${themeClass(
            'bg-[#fef9c3] text-black/80 border-2 border-black/15',
            'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
          )}`}>
            💡 {guide.note}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`mt-5 w-full py-2.5 font-bold text-sm ${themeClass(
            'bg-black text-white rounded-[8px] border-2 border-black shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#f1f3f8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
            'bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors'
          )}`}
        >
          확인
        </button>
      </div>
    </div>
  );
}
