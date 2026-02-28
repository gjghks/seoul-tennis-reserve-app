'use client';

import { SeoulService } from '@/lib/seoulApi';
import { cn } from '@/lib/cn';
import { isIndependentCourt } from '@/lib/data/independentCourts';

function StickyHeader({ 
  court, 
  isAvailable, 
  isVisible,
  isNeoBrutalism,
  onReservationClick,
}: { 
  court: SeoulService; 
  isAvailable: boolean;
  isVisible: boolean;
  isNeoBrutalism: boolean;
  onReservationClick?: () => void;
}) {
  if (!isVisible) return null;

  const isExternal = isIndependentCourt(court.SVCID);
  const canReserve = isAvailable || isExternal;

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
                  ? `border-2 border-black rounded-[3px] ${
                      isExternal
                        ? 'bg-[#93c5fd] text-black font-black'
                        : isAvailable
                          ? 'bg-[#a3e635] text-black font-black'
                          : 'bg-gray-200 text-black/60'
                    }`
                  : `rounded-full ${
                      isExternal
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                    }`
              }`}>
                {!isNeoBrutalism && <span className={`w-1.5 h-1.5 rounded-full ${isExternal ? 'bg-blue-500' : isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />}
                {court.SVCSTATNM}
              </span>
              <h2 className={cn('truncate text-sm font-bold', isNeoBrutalism && 'text-black', !isNeoBrutalism && 'text-gray-900')}>
                {court.SVCNM}
              </h2>
            </div>
            {court.SVCURL && canReserve && (
              <a
                href={court.SVCURL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onReservationClick}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-all ${
                  isNeoBrutalism
                    ? `${isExternal ? 'bg-[#60a5fa]' : 'bg-[#22c55e]'} text-black border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none`
                    : `${isExternal ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg`
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExternal ? 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-1.5-7.5H21m0 0v4.5m0-4.5L10.5 13.5' : 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'} />
                </svg>
                {isExternal ? '외부 예약' : '예약'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyHeader;
