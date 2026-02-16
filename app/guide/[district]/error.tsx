'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

export default function GuideError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();

  return (
    <div className="container py-16" role="alert" aria-live="assertive">
      <div className={`max-w-md mx-auto text-center ${themeClass('bg-[#ff6b6b] border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <div className={`text-6xl mb-4 ${themeClass('', 'opacity-50')}`}>
          {isNeoBrutalism ? '🎾' : '⚠️'}
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
          가이드를 불러올 수 없습니다
        </h1>
        <p className={`mb-6 ${themeClass('text-black/80', 'text-gray-600')}`}>
          서울시 공공데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className={`px-6 py-3 font-bold transition-all ${themeClass('bg-black text-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff]', 'bg-green-600 text-white rounded-lg hover:bg-green-700')}`}
          >
            다시 시도
          </button>
          <Link
            href="/compare"
            className={`px-6 py-3 font-bold transition-all ${themeClass('bg-white text-black border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]', 'bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300')}`}
          >
            구별 비교
          </Link>
        </div>
      </div>
    </div>
  );
}
