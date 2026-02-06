'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

export default function Error({
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
          {isNeoBrutalism ? '💥' : '⚠️'}
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
          문제가 발생했습니다
        </h1>
        <p className={`mb-6 ${themeClass('text-black/80', 'text-gray-600')}`}>
          일시적인 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`px-6 py-3 font-bold transition-all ${themeClass('bg-black text-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff]', 'bg-green-600 text-white rounded-lg hover:bg-green-700')}`}
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
