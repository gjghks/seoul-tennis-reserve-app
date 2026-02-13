'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData } from '@/contexts/TennisDataContext';
import { SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN, KOREAN_TO_SLUG } from '@/lib/constants/districts';
import Link from 'next/link';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import LastUpdated from '@/components/ui/LastUpdated';
import { useThemeClass } from '@/lib/cn';
import FacilityTags from '@/components/ui/FacilityTags';
import { extractFacilityTags } from '@/lib/utils/facilityTags';
import { convertToWeatherGrid } from '@/lib/utils/weatherGrid';
import WeatherBadge from '@/components/weather/WeatherBadge';
import { isCourtAvailable } from '@/lib/utils/courtStatus';

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
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

  const handleMapPlaceSelect = (placeName: string) => {
    const el = document.getElementById(`place-group-${placeName}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const availableCount = courts.filter(court => court.SVCSTATNM === '접수중').length;
  const filteredCourts = showAvailableOnly
    ? courts.filter(court => court.SVCSTATNM === '접수중')
    : courts;

  const groupedCourts = useMemo(() => {
    const groups: Record<string, SeoulService[]> = {};
    for (const court of filteredCourts) {
      const place = court.PLACENM || '기타';
      if (!groups[place]) groups[place] = [];
      groups[place].push(court);
    }
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aHasAvailable = a.some(c => c.SVCSTATNM === '접수중');
      const bHasAvailable = b.some(c => c.SVCSTATNM === '접수중');
      if (aHasAvailable && !bHasAvailable) return -1;
      if (!aHasAvailable && bHasAvailable) return 1;
      return b.length - a.length;
    });
  }, [filteredCourts]);

  const districtWeatherGrid = useMemo(() => {
    const courtWithCoords = filteredCourts.find(c => {
      const x = Number.parseFloat(c.X);
      const y = Number.parseFloat(c.Y);
      return Number.isFinite(x) && Number.isFinite(y) && x !== 0 && y !== 0;
    });
    if (!courtWithCoords) return null;
    return convertToWeatherGrid(Number.parseFloat(courtWithCoords.X), Number.parseFloat(courtWithCoords.Y));
  }, [filteredCourts]);

  const loading = isLoading && initialCourts.length === 0;

  return (
     <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')} `}>
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
                <WeatherBadge nx={districtWeatherGrid.nx} ny={districtWeatherGrid.ny} compact district={koreanDistrict} />
              )}
            </div>
            {lastUpdated && (
              <LastUpdated timestamp={lastUpdated} className="justify-center mt-0.5" />
            )}
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => setShowAvailableOnly(prev => !prev)}
              className={showAvailableOnly
                ? themeClass(
                    'h-9 rounded-lg border-2 border-black bg-[#a3e635] px-3 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                    'h-9 rounded-lg border border-green-600 bg-green-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-green-700'
                  )
                : themeClass(
                    'h-9 rounded-lg border-2 border-black bg-white px-3 text-xs font-black text-black transition-colors hover:bg-[#facc15]/30',
                    'h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:border-green-300 hover:text-green-700'
                  )
              }
            >
              {showAvailableOnly ? `접수중만 ✓ (${availableCount})` : `접수중만 (${availableCount})`}
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

      {viewMode === 'map' && !loading && filteredCourts.length > 0 && (
        <div ref={mapContainerRef} className="container mb-4">
          <KakaoMapView courts={filteredCourts} district={district} focusPlaceName={focusPlaceName} onPlaceSelect={handleMapPlaceSelect} />
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
        ) : filteredCourts.length === 0 ? (
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
              {showAvailableOnly ? '접수중인 테니스장이 없습니다' : '등록된 테니스장이 없습니다'}
            </h3>
            <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')} `}>
              {showAvailableOnly
                ? `${districtName}에 현재 접수중인 테니스장이 없습니다. 필터를 해제하면 전체 목록을 볼 수 있습니다.`
                : `${districtName}에는 아직 공공 테니스장 정보가 등록되지 않았습니다.`}
            </p>
            {showAvailableOnly ? (
              <button
                type="button"
                onClick={() => setShowAvailableOnly(false)}
                className={isNeoBrutalism
                  ? 'inline-flex items-center gap-2 bg-[#facc15] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
                  : 'inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700'
                }
              >
                전체 보기
              </button>
            ) : (
              <>
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
                {(() => {
                  const otherDistricts = Object.entries(
                    allCourts
                      .filter(c => c.AREANM !== koreanDistrict && c.SVCSTATNM === '접수중')
                      .reduce<Record<string, number>>((acc, c) => {
                        acc[c.AREANM] = (acc[c.AREANM] || 0) + 1;
                        return acc;
                      }, {})
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);

                  if (otherDistricts.length === 0) return null;

                  return (
                    <div className="mt-8">
                      <p className={`text-xs mb-3 ${themeClass('text-black/50 font-bold uppercase', 'text-gray-400')}`}>
                        접수중인 코트가 있는 다른 지역
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {otherDistricts.map(([name, count]) => (
                          <Link
                            key={name}
                            href={`/${KOREAN_TO_SLUG[name]}`}
                            className={themeClass(
                              'px-3 py-1.5 text-sm font-bold border-2 border-black rounded-[5px] bg-white hover:bg-[#a3e635] transition-colors',
                              'px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:border-green-300 hover:text-green-700 transition-colors'
                            )}
                          >
                            {name} ({count})
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedCourts.map(([placeName, placeCourts]) => {
              const placeAvailable = placeCourts.filter(c => c.SVCSTATNM === '접수중').length;
              return (
                <div key={placeName} id={`place-group-${placeName}`}>
                  <button
                    type="button"
                    onClick={() => handlePlaceClick(placeName)}
                    className={`flex items-center gap-2 mb-3 group ${themeClass('', '')}`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${themeClass('text-black/70', 'text-gray-400 group-hover:text-green-600')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className={`text-base ${themeClass('font-black text-black uppercase tracking-tight group-hover:text-[#16a34a]', 'font-semibold text-gray-800 group-hover:text-green-600')}`}>
                      {placeName}
                    </h2>
                    <span className={`text-xs ${themeClass('font-bold text-black/50', 'text-gray-400')}`}>
                      {placeCourts.length}개{placeAvailable > 0 && ` · 접수중 ${placeAvailable}`}
                    </span>
                  </button>
                  <div className="grid gap-3">
                    {placeCourts.map((court) => {
                      const isAvailable = isCourtAvailable(court.SVCSTATNM);
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
                </div>
              );
            })}
          </div>
        )}

        <div className={`mt-6 p-4 ${themeClass(
          'bg-[#fef3c7] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-amber-50 rounded-xl border border-amber-100'
        )}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className={`font-bold ${themeClass('text-black uppercase', 'text-gray-900')}`}>
                {districtName} 테니스장 가이드
              </h3>
              <p className={`text-sm mt-1 ${themeClass('text-black/70', 'text-gray-600')}`}>
                시설 비교, 예약 팁, 서울 평균과의 비교를 확인하세요.
              </p>
            </div>
            <Link
              href={`/guide/${district}`}
              className={`px-4 py-2 text-sm font-bold transition-all ${themeClass(
                'bg-black text-[#facc15] border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
                'bg-green-600 text-white rounded-lg hover:bg-green-700'
              )}`}
            >
              가이드 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
