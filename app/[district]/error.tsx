'use client';

import { useThemeClass } from '@/lib/cn';
import Link from 'next/link';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const themeClass = useThemeClass();

  return (
    <div className="container py-16" role="alert" aria-live="assertive">
      <div className={`max-w-md mx-auto text-center ${themeClass('bg-[#ff6b6b] border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <svg className={themeClass('w-20 h-20 mx-auto mb-4', 'w-16 h-16 mx-auto mb-4')} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M32 4 L58 56 L6 56 Z" className={themeClass('fill-[#facc15] stroke-black stroke-[2]', 'fill-yellow-100 stroke-yellow-600 stroke-[1.5]')} />
          <circle cx="32" cy="40" r="2.5" className={themeClass('fill-black', 'fill-yellow-600')} />
          <path d="M32 20 L32 36" className={themeClass('stroke-black stroke-[2.5]', 'stroke-yellow-600 stroke-[2]')} strokeLinecap="round" />
        </svg>
        <h1 className={`text-2xl font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
          문제가 발생했습니다
        </h1>
        <p className={`mb-6 ${themeClass('text-black/80', 'text-gray-600')}`}>
          테니스장 목록을 불러오는 중 문제가 발생했습니다
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className={`flex-1 px-6 py-3 font-bold transition-all ${themeClass('bg-black text-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff]', 'bg-green-600 text-white rounded-lg hover:bg-green-700')}`}
          >
            다시 시도
          </button>
          <Link
            href="/"
            className={`flex-1 px-6 py-3 font-bold transition-all text-center ${themeClass('bg-white text-black border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]', 'bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200')}`}
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
