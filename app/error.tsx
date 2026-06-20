'use client';

import { useThemeClass } from '@/lib/cn';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const themeClass = useThemeClass();

  return (
    <div className="container py-16" role="alert" aria-live="assertive">
      <div className={`max-w-md mx-auto text-center ${themeClass('bg-[#ff6b6b] border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8')}`}>
        <svg className={themeClass('w-24 h-24 mx-auto mb-4', 'w-20 h-20 mx-auto mb-4')} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <g style={{ animation: 'lock-wiggle 2.5s ease-in-out infinite', transformOrigin: 'center' }}>
            <path d="M43 65 L53 65 L51 90 L45 90 Z" className={themeClass('fill-[#facc15] stroke-black stroke-[2.5]', 'fill-gray-100 stroke-gray-400 stroke-[1.5]')} />
            <path d="M43 70 L53 70 M44 75 L52 75 M44 80 L52 80 M45 85 L51 85" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-400 stroke-[1.5]')} />
            
            <path d="M45 65 L40 50 L56 50 L51 65 Z" className={themeClass('fill-white stroke-black stroke-[2.5]', 'fill-white stroke-gray-400 stroke-[1.5]')} />
            <path d="M48 65 L48 50" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-400 stroke-[1.5]')} />
            
            <ellipse cx="48" cy="32" rx="22" ry="28" className={themeClass('fill-white stroke-black stroke-[2.5]', 'fill-white stroke-gray-400 stroke-[1.5]')} />
            
            <path d="M32 20 L64 20 M28 28 L68 28 M28 36 L68 36 M32 44 L64 44" className={themeClass('stroke-black stroke-[1]', 'stroke-gray-300 stroke-[1]')} />
            <path d="M34 10 L34 54 M41 6 L41 58 M48 5 L48 59 M55 6 L55 58 M62 10 L62 54" className={themeClass('stroke-black stroke-[1]', 'stroke-gray-300 stroke-[1]')} />
            
            <path d="M26 32 L36 36 L40 28 L50 38 L54 26 L64 34 L70 28" className={themeClass('stroke-black stroke-[3]', 'stroke-red-400 stroke-[2]')} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            <path d="M76 12 L76 24 M76 30 L76 32" className={themeClass('stroke-black stroke-[3]', 'stroke-red-500 stroke-[2.5]')} strokeLinecap="round" />
          </g>
          <circle cx="16" cy="40" r="3" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
          <circle cx="84" cy="50" r="2" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
          <path d="M24 76 Q24 80 28 80 Q24 80 24 84 Q24 80 20 80 Q24 80 24 76 Z" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '1s' }} />
        </svg>
        <h1 className={`text-2xl font-bold mb-2 ${themeClass('text-black', 'text-gray-900 dark:text-slate-100')}`}>
          문제가 발생했습니다
        </h1>
        <p className={`mb-6 ${themeClass('text-black/80', 'text-gray-600 dark:text-slate-400')}`}>
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
