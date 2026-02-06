'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData } from '@/contexts/TennisDataContext';
import { SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';
import Link from 'next/link';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import LastUpdated from '@/components/ui/LastUpdated';
import { useThemeClass } from '@/lib/cn';

interface DistrictContentProps {
  district: string;
  initialCourts: SeoulService[];
  districtName: string;
}

export default function DistrictContent({ 
  district, 
  initialCourts,
  districtName 
}: DistrictContentProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { courts: allCourts, isLoading, lastUpdated } = useTennisData();

  const koreanDistrict = SLUG_TO_KOREAN[district] || district;
  
  const liveCourts = allCourts.length > 0 
    ? allCourts.filter(c => c.AREANM === koreanDistrict)
    : initialCourts;

  const courts = [...liveCourts].sort((a, b) => {
    const isAAvailable = a.SVCSTATNM === '접수중';
    const isBAvailable = b.SVCSTATNM === '접수중';
    if (isAAvailable && !isBAvailable) return -1;
    if (!isAAvailable && isBAvailable) return 1;
    return 0;
  });

  const loading = isLoading && initialCourts.length === 0;

  return (
    <div className={`min-h-screen pb-20 scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')} `}>
      <div className={`sticky top-14 z-40 ${
        isNeoBrutalism 
          ? 'bg-[#88aaee] border-b-[3px] border-black' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className={`text-sm ${
            isNeoBrutalism 
              ? 'text-black font-bold hover:underline underline-offset-4' 
              : 'text-gray-500 hover:text-green-600'
          }`}>
            ← 전체 지역
          </Link>
          <div className="text-center">
            <h1 className={`text-lg ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900')} `}>
              {isNeoBrutalism ? `${districtName}` : `${districtName} 테니스장`}
            </h1>
            {lastUpdated && (
              <LastUpdated timestamp={lastUpdated} className="justify-center mt-0.5" />
            )}
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="h-6" aria-hidden="true" />

      {AD_SLOTS.DISTRICT_TOP && (
        <div className="container mb-4">
          <AdBanner adSlot={AD_SLOTS.DISTRICT_TOP} adFormat="horizontal" className="min-h-[90px]" />
        </div>
      )}

      <div className="container pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-${i}`} className={`h-32 animate-pulse ${
                isNeoBrutalism 
                  ? 'bg-white border-2 border-black rounded-[5px]' 
                  : 'bg-gray-200 rounded-xl'
              }`} />
            ))}
          </div>
        ) : courts.length === 0 ? (
          <div className={`text-center py-16 ${
            isNeoBrutalism 
              ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]' 
              : 'bg-white rounded-2xl border border-gray-100'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center ${
              isNeoBrutalism 
                ? 'bg-[#facc15] border-2 border-black rounded-[5px]' 
                : 'bg-gray-100 rounded-full'
            }`}>
              <svg className={`w-10 h-10 ${themeClass('text-black', 'text-gray-400')} `} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-lg mb-2 ${themeClass('font-black text-black uppercase', 'font-semibold text-gray-900')} `}>
              등록된 테니스장이 없습니다
            </h3>
            <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')} `}>
              {districtName}에는 아직 공공 테니스장 정보가 등록되지 않았습니다.
            </p>
            <Link
              href="/"
              className={isNeoBrutalism
                ? 'inline-flex items-center gap-2 bg-[#88aaee] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
                : 'inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              다른 지역 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {courts.map((court) => {
              const isAvailable = court.SVCSTATNM === '접수중';
              
              if (isNeoBrutalism) {
                return (
                  <div
                    key={court.SVCID}
                    className={`p-5 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] transition-all ${
                      isAvailable ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link
                        href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                        className="flex-1 group"
                      >
                        <h3 className="text-lg font-black text-black group-hover:text-[#16a34a] uppercase tracking-tight">
                          {court.SVCNM}
                        </h3>
                        <p className="text-sm text-black/70 mt-1 font-medium">{court.PLACENM}</p>
                      </Link>
                      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black rounded-[3px] ${
                        isAvailable ? 'bg-[#a3e635] text-black' : 'bg-gray-300 text-black/50'
                      }`}>
                        {court.SVCSTATNM}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="bg-[#facc15] text-black px-2 py-1 border-2 border-black rounded-[3px]">
                          {court.PAYATNM}
                        </span>
                        <span className="bg-[#22d3ee] text-black px-2 py-1 border-2 border-black rounded-[3px]">
                          {court.V_MIN}~{court.V_MAX}
                        </span>
                      </div>
                      {isAvailable && court.SVCURL && (
                        <a
                          href={court.SVCURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#22c55e] text-black font-black text-sm py-2 px-4 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase"
                          onClick={(e) => e.stopPropagation()}
                        >
                          예약하기
                        </a>
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <div
                  key={court.SVCID}
                  className="card p-5 bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                      className="flex-1 group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700">
                        {court.SVCNM}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{court.PLACENM}</p>
                    </Link>
                    <span className={`badge ${isAvailable ? 'badge-available' : 'badge-closed'}`}>
                      {court.SVCSTATNM}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {court.PAYATNM}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {court.V_MIN}~{court.V_MAX}
                      </span>
                    </div>
                    {isAvailable && court.SVCURL && (
                      <a
                        href={court.SVCURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-sm py-2 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        바로 예약
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
