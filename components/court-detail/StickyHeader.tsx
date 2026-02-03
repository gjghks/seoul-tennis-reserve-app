'use client';

import { SeoulService } from '@/lib/seoulApi';

function StickyHeader({ 
  court, 
  isAvailable, 
  isVisible,
  isNeoBrutalism 
}: { 
  court: SeoulService; 
  isAvailable: boolean;
  isVisible: boolean;
  isNeoBrutalism: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className={`fixed top-14 left-0 right-0 z-40 transform transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`${
        isNeoBrutalism 
          ? 'bg-white border-b-[3px] border-black' 
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
      }`}>
        <div className="container py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold ${
                isNeoBrutalism
                  ? `border-2 border-black rounded-[3px] ${isAvailable ? 'bg-[#a3e635] text-black font-black' : 'bg-gray-200 text-black/60'}`
                  : `rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`
              }`}>
                {!isNeoBrutalism && <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />}
                {court.SVCSTATNM}
              </span>
              <h2 className={`truncate text-sm font-bold ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
                {court.SVCNM}
              </h2>
            </div>
            {court.SVCURL && isAvailable && (
              <a
                href={court.SVCURL}
                target="_blank"
                rel="noopener noreferrer"
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-all ${
                  isNeoBrutalism
                    ? 'bg-[#22c55e] text-black border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'
                    : 'bg-green-600 text-white rounded-lg hover:bg-green-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                예약
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyHeader;
