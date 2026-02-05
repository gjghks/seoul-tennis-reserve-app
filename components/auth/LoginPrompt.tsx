'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginPrompt({ isOpen, onClose, message }: LoginPromptProps) {
  const { isNeoBrutalism } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent backdrop:bg-black/50"
      onClose={onClose}
    >
      <div className={isNeoBrutalism
        ? 'bg-white border-[3px] border-black rounded-[5px] shadow-[8px_8px_0px_0px_#000] p-6 max-w-sm mx-auto'
        : 'bg-white rounded-xl border border-gray-200 shadow-xl p-6 max-w-sm mx-auto'
      }>
        <h2 className={`text-xl mb-3 ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-semibold text-gray-900'}`}>
          {isNeoBrutalism ? '🔒 ' : ''}로그인이 필요합니다
        </h2>
        <p className={`mb-6 ${isNeoBrutalism ? 'text-black/70 font-medium' : 'text-gray-500'}`}>
          {message || '이 기능을 사용하려면 로그인해주세요.'}
        </p>

        <div className="flex gap-3">
          <Link
            href={loginUrl}
            className={isNeoBrutalism
              ? 'flex-1 py-3 bg-[#22c55e] text-black font-black text-center border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase'
              : 'flex-1 py-3 rounded-lg bg-green-600 text-white font-medium text-center hover:bg-green-700 transition-colors'
            }
          >
            로그인하기
          </Link>
          <button
            type="button"
            onClick={onClose}
            className={isNeoBrutalism
              ? 'flex-1 py-3 bg-white text-black font-bold border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
              : 'flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
            }
          >
            나중에
          </button>
        </div>
      </div>
    </dialog>
  );
}
