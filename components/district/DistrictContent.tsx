'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData } from '@/contexts/TennisDataContext';
import { SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';
import Link from 'next/link';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import LastUpdated from '@/components/ui/LastUpdated';
import { useThemeClass } from '@/lib/cn';
import FacilityTags from '@/components/ui/FacilityTags';
import { extractFacilityTags } from '@/lib/utils/facilityTags';
import { convertToWeatherGrid } from '@/lib/utils/weatherGrid';
import WeatherBadge from '@/components/weather/WeatherBadge';

const KakaoMapView = dynamic(
  () => import('@/components/map/KakaoMapView'),
  { ssr: false }
);

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [focusPlaceName, setFocusPlaceName] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tennis-view-mode') as 'list' | 'map' | null;
    if (saved) setViewMode(saved);
  }, []);

  const toggleView = (mode: 'list' | 'map') => {
    setViewMode(mode);
    localStorage.setItem('tennis-view-mode', mode);
  };

  const handlePlaceClick = (placeName: string) => {
    setFocusPlaceName(placeName);
    setViewMode('map');
    localStorage.setItem('tennis-view-mode', 'map');
    setTimeout(() => {
      mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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

  const districtWeatherGrid = useMemo(() => {
    const courtWithCoords = courts.find(c => {
      const x = Number.parseFloat(c.X);
      const y = Number.parseFloat(c.Y);
      return Number.isFinite(x) && Number.isFinite(y) && x !== 0 && y !== 0;
    });
    if (!courtWithCoords) return null;
    return convertToWeatherGrid(Number.parseFloat(courtWithCoords.X), Number.parseFloat(courtWithCoords.Y));
  }, [courts]);

  const loading = isLoading && initialCourts.length === 0;

  return (
    <div className={`min-h-screen pb-16 scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')} `}>
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
            <div className="flex items-center justify-center gap-1.5">
              <h1 className={`text-lg ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900')} `}>
                {isNeoBrutalism ? `${districtName}` : `${districtName}`}
              </h1>
              {districtWeatherGrid && (
                <WeatherBadge nx={districtWeatherGrid.nx} ny={districtWeatherGrid.ny} compact />
              )}
            </div>
            {lastUpdated && (
              <LastUpdated timestamp={lastUpdated} className="justify-center mt-0.5" />
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => toggleView('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? isNeoBrutalism ? 'bg-black text-white' : 'bg-green-600 text-white'
                  : isNeoBrutalism ? 'text-black/50 hover:bg-black/10' : 'text-gray-400 hover:bg-gray-100'
              }`}
              aria-label="목록 보기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => toggleView('map')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? isNeoBrutalism ? 'bg-black text-white' : 'bg-green-600 text-white'
                  : isNeoBrutalism ? 'text-black/50 hover:bg-black/10' : 'text-gray-400 hover:bg-gray-100'
              }`}
              aria-label="지도 보기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="h-6" aria-hidden="true" />

      {AD_SLOTS.DISTRICT_TOP && (
        <div className="container mb-4">
          <AdBanner adSlot={AD_SLOTS.DISTRICT_TOP} adFormat="horizontal" className="min-h-[90px]" />
        </div>
      )}

      {viewMode === 'map' && !loading && courts.length > 0 && (
        <div ref={mapContainerRef} className="container mb-4">
          <KakaoMapView courts={courts} district={district} focusPlaceName={focusPlaceName} />
        </div>
      )}

      <div className="container pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-${i}`} className={`h-32 ${
                isNeoBrutalism 
                  ? 'skeleton-neo' 
                  : 'skeleton !rounded-xl'
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
              const facilityTags = extractFacilityTags(court).filter(tag => tag.key !== 'free' && tag.key !== 'paid');
              
              if (isNeoBrutalism) {
                return (
                  <div
                    key={court.SVCID}
                    className={`p-5 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] transition-all ${
                      isAvailable ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                          className="group"
                        >
                          <h3 className="text-lg font-black text-black group-hover:text-[#16a34a] uppercase tracking-tight">
                            {court.SVCNM}
                          </h3>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handlePlaceClick(court.PLACENM)}
                          className="text-sm text-black/70 mt-1 font-medium hover:text-[#16a34a] hover:underline underline-offset-4 cursor-pointer flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {court.PLACENM}
                        </button>
                        <FacilityTags tags={facilityTags} maxTags={3} className="mt-2" />
                      </div>
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
                    <div className="flex-1">
                      <Link
                        href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                        className="group"
                      >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700">
                          {court.SVCNM}
                        </h3>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handlePlaceClick(court.PLACENM)}
                        className="text-sm text-gray-500 mt-1 hover:text-green-600 hover:underline underline-offset-4 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {court.PLACENM}
                      </button>
                      <FacilityTags tags={facilityTags} maxTags={3} className="mt-2" />
                    </div>
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
