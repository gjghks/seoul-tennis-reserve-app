'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

export default function NotFound() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-16">
      <div className={`max-w-md mx-auto text-center ${themeClass('bg-[#a8e6cf] border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <div className={`text-8xl font-black mb-4 ${themeClass('text-black', 'text-gray-200')}`}>
          404
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
          페이지를 찾을 수 없습니다
        </h1>
        <p className={`mb-6 ${themeClass('text-black/80', 'text-gray-600')}`}>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className={`inline-block px-6 py-3 font-bold transition-all ${
            themeClass('bg-[#facc15] text-black border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]', 'bg-green-600 text-white rounded-lg hover:bg-green-700')
          }`}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
