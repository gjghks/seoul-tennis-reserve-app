'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';

export default function NotFound() {
  const themeClass = useThemeClass();

  return (
    <div className="container py-16">
      <div className={`max-w-md mx-auto text-center ${themeClass('bg-[#a8e6cf] border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000] p-8', 'bg-white rounded-xl shadow-lg p-8')}`}>
        <svg className={themeClass('w-24 h-24 mx-auto mb-4', 'w-20 h-20 mx-auto mb-4')} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            <path d="M28 80 L68 80 L78 92 L18 92 Z" className={themeClass('fill-[#22c55e] stroke-black stroke-[2.5]', 'fill-green-100 stroke-green-400 stroke-[1.5]')} />
            <path d="M48 80 L48 92 M23 86 L73 86" className={themeClass('stroke-black stroke-[2.5]', 'stroke-green-400 stroke-[1.5]')} />
            
            <path d="M48 80 Q60 50 68 28" strokeDasharray="4 4" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-400 stroke-[1.5]')} fill="none" />
            
            <g transform="translate(68, 28) rotate(20)">
              <circle cx="0" cy="0" r="14" className={themeClass('fill-[#a3e635] stroke-black stroke-[2.5]', 'fill-green-200 stroke-green-400 stroke-[1.5]')} />
              <path d="M -9 -9 A 12 12 0 0 0 -9 9 M 9 -9 A 12 12 0 0 1 9 9" className={themeClass('stroke-black stroke-[2]', 'stroke-green-400 stroke-[1.5]')} fill="none" />
            </g>
          </g>
          <circle cx="20" cy="30" r="3" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
          <circle cx="80" cy="60" r="2" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
          <path d="M24 16 Q24 20 28 20 Q24 20 24 24 Q24 20 20 20 Q24 20 24 16 Z" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.3s' }} />
        </svg>
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
