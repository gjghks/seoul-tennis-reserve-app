'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData } from '@/contexts/TennisDataContext';
import { SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN, KOREAN_TO_SLUG } from '@/lib/constants/districts';
import Link from 'next/link';
import PullToRefresh from 'react-simple-pull-to-refresh';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import LastUpdated from '@/components/ui/LastUpdated';
import { useThemeClass } from '@/lib/cn';
import FacilityTags from '@/components/ui/FacilityTags';
import { extractFacilityTags } from '@/lib/utils/facilityTags';
import { convertToWeatherGrid } from '@/lib/utils/weatherGrid';
import WeatherBadge from '@/components/weather/WeatherBadge';
import { isCourtAvailable, isCourtAccepting, sortByAvailability } from '@/lib/utils/courtStatus';
import { findEnrichment, getEnrichmentCoordinates, getMapPOIName } from '@/lib/data/facilityEnrichment';
import type { SurfaceCategory } from '@/lib/data/facilityEnrichment';
import { useReservationTip } from '@/lib/hooks/useReservationTip';
import ReservationNotice from '@/components/reservation/ReservationNotice';
import { isIndependentCourt } from '@/lib/data/independentCourts';
import MapAppSelector from '@/components/ui/MapAppSelector';
import { cleanCourtNameForMap } from '@/lib/utils/mapNavigation';
import type { MapDestination } from '@/lib/utils/mapNavigation';

const SURFACE_FILTER_OPTIONS: Array<{ value: SurfaceCategory | 'all'; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'clay', label: '클레이' },
  { value: 'artificial_grass', label: '인조잔디' },
  { value: 'hard', label: '하드코트' },
];

function getCourtCoords(court: SeoulService): { lat: number; lng: number } | null {
  const x = parseFloat(court.X);
  const y = parseFloat(court.Y);
  if (Number.isFinite(x) && Number.isFinite(y) && x !== 0 && y !== 0) {
    return { lat: y, lng: x };
  }
  const coords = getEnrichmentCoordinates(court.SVCNM, court.AREANM, court.PLACENM);
  if (coords) return { lat: coords.latitude, lng: coords.longitude };
  return null;
}

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
  const { courts: allCourts, isLoading, lastUpdated, stale, mutate } = useTennisData();
  const { handleReservationClick } = useReservationTip();
  const [viewMode, setViewMode] = useState<'list' | 'map'>(() => {
    if (typeof window === 'undefined') return 'map';
    const saved = localStorage.getItem('tennis-view-mode');
    return saved === 'list' || saved === 'map' ? saved : 'map';
  });
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceCategory | 'all'>('all');
  const [focusPlaceName, setFocusPlaceName] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [navDestination, setNavDestination] = useState<MapDestination | null>(null);

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

  const handleNavClick = (court: SeoulService) => {
    const coords = getCourtCoords(court);
    if (!coords) return;
    const poiName = getMapPOIName(court.SVCNM, court.AREANM, court.PLACENM);
    const placeName = court.PLACENM?.includes('>')
      ? court.PLACENM.split('>').pop()!.trim()
      : (court.PLACENM || court.SVCNM);
    const name = poiName || cleanCourtNameForMap(placeName);
    setNavDestination({ lat: coords.lat, lng: coords.lng, name });
  };

  const koreanDistrict = SLUG_TO_KOREAN[district] || district;
  
  const liveCourts = allCourts.length > 0 
    ? allCourts.filter(c => c.AREANM === koreanDistrict)
    : initialCourts;

  const courts = sortByAvailability(liveCourts);

  const availableCount = courts.filter(court => isCourtAccepting(court.SVCSTATNM)).length;
  const seoulApiAcceptingCount = courts.filter(court => isCourtAccepting(court.SVCSTATNM) && !isIndependentCourt(court.SVCID)).length;
  const filteredCourts = useMemo(() => {
    let result = courts;
    if (showAvailableOnly) {
      result = result.filter(
        court =>
          isCourtAccepting(court.SVCSTATNM) ||
          isIndependentCourt(court.SVCID)
      );
    }
    if (surfaceFilter !== 'all') {
      result = result.filter(court => {
        const e = findEnrichment(court.SVCNM, court.AREANM, court.PLACENM);
        if (!e) return false;
        if (surfaceFilter === 'clay') return e.surfaceCategory === 'clay' || e.surfaceCategory === 'mixed';
        return e.surfaceCategory === surfaceFilter;
      });
    }
    return result;
  }, [courts, showAvailableOnly, surfaceFilter]);

  // Patch courts with enrichment coordinates for the map when Seoul API returns empty X/Y
  const mapCourts = useMemo(() => {
    return filteredCourts.map(court => {
      if (court.X && court.Y && parseFloat(court.X) !== 0 && parseFloat(court.Y) !== 0) {
        return court;
      }
      const coords = getEnrichmentCoordinates(court.SVCNM, court.AREANM, court.PLACENM);
      if (!coords) return court;
      return { ...court, X: String(coords.longitude), Y: String(coords.latitude) };
    });
  }, [filteredCourts]);

  const groupedCourts = useMemo(() => {
    const groups: Record<string, SeoulService[]> = {};
    for (const court of filteredCourts) {
      const place = court.PLACENM || '기타';
      if (!groups[place]) groups[place] = [];
      groups[place].push(court);
    }
    return Object.entries(groups).sort(([, a], [, b]) => {
      const aHasAvailable = a.some(c => isCourtAccepting(c.SVCSTATNM));
      const bHasAvailable = b.some(c => isCourtAccepting(c.SVCSTATNM));
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

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const RefreshIndicator = (
    <div className={`flex items-center justify-center py-4 ${themeClass('text-black dark:text-slate-100 font-bold', 'text-green-600')}`}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black dark:text-slate-100 font-bold', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
    >
     <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900')} `}>
      <div className={`sticky top-14 z-40 ${
        isNeoBrutalism
          ? 'bg-[#88aaee] border-b-[3px] border-black'
          : 'bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700'
      }`}>
        <div className="container py-3">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Link href="/" className={`text-sm shrink-0 ${
              isNeoBrutalism
                ? 'text-black font-bold hover:underline underline-offset-4'
                : 'text-gray-500 dark:text-slate-400 hover:text-green-600'
            }`}>
              ← 전체 지역
            </Link>
            <h1 className={`text-center text-lg min-w-0 ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900 dark:text-slate-100')}`}>
              {districtName}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleView(viewMode === 'map' ? 'list' : 'map')}
                className={themeClass(
                  'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[5px] border-2 border-black dark:border-[#f1f3f8] transition-all bg-white dark:bg-slate-800 text-xs font-black hover:bg-[#facc15]/30',
                  'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-300 dark:border-slate-700 transition-colors bg-white dark:bg-slate-800 text-xs font-medium text-gray-700 dark:text-slate-200 hover:border-green-300 hover:text-green-700'
                )}
              >
                {viewMode === 'map' ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    목록
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    지도
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAvailableOnly(prev => !prev)}
                className={showAvailableOnly
                  ? themeClass(
                      'h-8 rounded-lg border-2 border-black bg-[#a3e635] px-2.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                      'h-8 rounded-lg border border-green-600 bg-green-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700'
                    )
                  : themeClass(
                      'h-8 rounded-lg border-2 border-black dark:border-[#f1f3f8] bg-white dark:bg-slate-800 px-2.5 text-xs font-black text-black dark:text-slate-100 transition-colors hover:bg-[#facc15]/30',
                      'h-8 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-gray-700 dark:text-slate-200 transition-colors hover:border-green-300 hover:text-green-700'
                    )
                }
              >
                {showAvailableOnly ? `접수중만 ✓ (${availableCount})` : `접수중만 (${availableCount})`}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-x-1.5 gap-y-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
              {SURFACE_FILTER_OPTIONS.map(opt => {
                const isActive = surfaceFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSurfaceFilter(opt.value)}
                    className={isActive
                      ? themeClass(
                          'h-7 rounded-full border-2 border-black bg-[#facc15] px-3 text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] transition-all whitespace-nowrap',
                          'h-7 rounded-full border border-green-600 bg-green-600 px-3 text-xs font-semibold text-white transition-colors whitespace-nowrap'
                        )
                      : themeClass(
                          'h-7 rounded-full border-2 border-black bg-white dark:bg-slate-800 px-3 text-xs font-black text-black dark:text-slate-100 transition-colors hover:bg-[#facc15]/30 whitespace-nowrap',
                          'h-7 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-gray-700 dark:text-slate-200 transition-colors hover:border-green-300 hover:text-green-700 whitespace-nowrap'
                        )
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {(lastUpdated || districtWeatherGrid) && (
              <div className="flex items-center gap-x-1.5 gap-y-1 ml-auto flex-wrap justify-end">
                {lastUpdated && (
                  <LastUpdated timestamp={lastUpdated} stale={stale} className="mt-0" />
                )}
                {lastUpdated && districtWeatherGrid && (
                  <span className={themeClass('text-black/30 dark:text-slate-600', 'text-gray-300 dark:text-slate-600')}>·</span>
                )}
                {districtWeatherGrid && (
                  <WeatherBadge nx={districtWeatherGrid.nx} ny={districtWeatherGrid.ny} compact district={koreanDistrict} />
                )}
              </div>
            )}
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
          <KakaoMapView courts={mapCourts} district={district} focusPlaceName={focusPlaceName} onPlaceSelect={handleMapPlaceSelect} />
        </div>
      )}

      <div className="container pb-6">
        {loading ? (
          <div className="space-y-4" aria-busy="true">
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
              ? 'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]'
              : 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800'
          }`}>
            <svg className={themeClass('w-24 h-24 mx-auto mb-6', 'w-20 h-20 mx-auto mb-6')} viewBox="0 0 96 96" fill="none" aria-hidden="true">
              <g style={{ animation: 'search-drift 4s ease-in-out infinite' }}>
                {/* magnifier glass */}
                <circle cx="42" cy="42" r="20" className={themeClass('fill-[#facc15]/30 stroke-black stroke-[2.5]', 'fill-gray-100 stroke-gray-400 stroke-[1.5]')} />
                {/* magnifier handle */}
                <line x1="56" y1="56" x2="72" y2="72" className={themeClass('stroke-black stroke-[3]', 'stroke-gray-400 stroke-[2]')} strokeLinecap="round" />
                {/* tennis ball inside magnifier */}
                <circle cx="42" cy="42" r="10" className={themeClass('fill-[#a3e635] stroke-black stroke-[2]', 'fill-green-200 stroke-green-400 stroke-[1]')} />
                <path d="M37 34 A 8 8 0 0 1 37 50" fill="none" className={themeClass('stroke-black stroke-[1.5]', 'stroke-green-500 stroke-[1]')} />
              </g>
              <circle cx="18" cy="18" r="2.5" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
              <circle cx="80" cy="28" r="2" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.6s' }} />
              <path d="M76 70 Q76 74 80 74 Q76 74 76 78 Q76 74 72 74 Q76 74 76 70 Z" className={themeClass('fill-black', 'fill-gray-300')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.3s' }} />
            </svg>
            <h3 className={`text-lg mb-2 ${themeClass('font-black text-black dark:text-slate-100 uppercase', 'font-semibold text-gray-900 dark:text-slate-100')} `}>
              {showAvailableOnly ? '접수중인 테니스장이 없습니다' : '등록된 테니스장이 없습니다'}
            </h3>
            <p className={`mb-6 ${themeClass('text-black/60 dark:text-slate-400 font-medium', 'text-gray-500 dark:text-slate-400')} `}>
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
                      .filter(c => c.AREANM !== koreanDistrict && isCourtAccepting(c.SVCSTATNM))
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
                      <p className={`text-xs mb-3 ${themeClass('text-black/60 dark:text-slate-400 font-bold uppercase', 'text-gray-400 dark:text-slate-500')}`}>
                        접수중인 코트가 있는 다른 지역
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {otherDistricts.map(([name, count]) => (
                          <Link
                            key={name}
                            href={`/${KOREAN_TO_SLUG[name]}`}
                            className={themeClass(
                              'px-3 py-1.5 text-sm font-bold border-2 border-black rounded-[5px] bg-white dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-[#a3e635] hover:text-black transition-colors',
                              'px-3 py-1.5 text-sm font-medium border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-green-300 hover:text-green-700 transition-colors'
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
              const placeAvailable = placeCourts.filter(c => isCourtAccepting(c.SVCSTATNM)).length;
              return (
                <div key={placeName} id={`place-group-${placeName}`}>
                  <button
                    type="button"
                    onClick={() => handlePlaceClick(placeName)}
                    className={`flex items-center gap-2 mb-3 group ${themeClass('', '')}`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${themeClass('text-black/70 dark:text-slate-300', 'text-gray-400 group-hover:text-green-600')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className={`text-base ${themeClass('font-black text-black dark:text-slate-100 uppercase tracking-tight group-hover:text-[#16a34a]', 'font-semibold text-gray-800 dark:text-slate-200 group-hover:text-green-600')}`}>
                      {placeName}
                    </h2>
                    <span className={`text-xs ${themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-400 dark:text-slate-500')}`}>
                      {placeCourts.length}개{placeAvailable > 0 && ` · 접수중 ${placeAvailable}`}
                    </span>
                  </button>
                  <div className="grid gap-3">
                    {placeCourts.map((court) => {
                      const isAvailable = isCourtAvailable(court.SVCSTATNM);
                      const isIndependent = isIndependentCourt(court.SVCID);
                      const isExternal = isIndependent;
                      const showReservationLink = (isAvailable || isExternal) && Boolean(court.SVCURL);
                      const facilityTags = extractFacilityTags(court).filter(tag => tag.key !== 'free' && tag.key !== 'paid');
                      
                      if (isNeoBrutalism) {
                        return (
                          <div
                            key={court.SVCID}
                            className={`p-5 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] transition-all ${
                              isAvailable || isExternal ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <Link
                                  href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                                  className="group"
                                >
                                  <h3 className="text-lg font-black text-black dark:text-slate-100 group-hover:text-[#16a34a] uppercase tracking-tight">
                                    {court.SVCNM}
                                  </h3>
                                </Link>
                                <FacilityTags tags={facilityTags} maxTags={3} className="mt-2" />
                              </div>
                              <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black rounded-[3px] ${
                                isExternal
                                  ? 'bg-[#93c5fd] text-black'
                                  : isAvailable
                                    ? 'bg-[#a3e635] text-black'
                                    : 'bg-gray-300 text-black/60'
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
                              <div className="flex items-center gap-2">
                                {getCourtCoords(court) && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleNavClick(court); }}
                                    className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-[5px] bg-[#88aaee] text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                    aria-label="길찾기"
                                    title="길찾기"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                    </svg>
                                  </button>
                                )}
                                {showReservationLink && (
                                  <a
                                    href={court.SVCURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-black font-black text-sm py-2 px-4 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase ${
                                      isExternal ? 'bg-[#60a5fa]' : 'bg-[#22c55e]'
                                    }`}
                                    onClick={(e) => { e.stopPropagation(); handleReservationClick(); }}
                                  >
                                    {isExternal || isIndependent ? '외부 예약 사이트' : '예약하기'}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div
                          key={court.SVCID}
                          className="card p-5 bg-white dark:bg-slate-800"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <Link
                                href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                                className="group"
                              >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-green-700">
                                  {court.SVCNM}
                                </h3>
                              </Link>
                              <FacilityTags tags={facilityTags} maxTags={3} className="mt-2" />
                            </div>
                            <span className={`badge ${
                              isExternal
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : isAvailable
                                  ? 'badge-available'
                                  : 'badge-closed'
                            }`}>
                              {court.SVCSTATNM}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2 text-xs text-gray-400 dark:text-slate-500">
                              <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {court.PAYATNM}
                              </span>
                              <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {court.V_MIN}~{court.V_MAX}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getCourtCoords(court) && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleNavClick(court); }}
                                  className="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:border-green-300 hover:text-green-600 transition-colors"
                                  aria-label="길찾기"
                                  title="길찾기"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                  </svg>
                                </button>
                              )}
                              {showReservationLink && (
                                <a
                                  href={court.SVCURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm py-2 px-4 ${isExternal ? 'btn bg-blue-600 text-white hover:bg-blue-700' : 'btn btn-primary'}`}
                                  onClick={(e) => { e.stopPropagation(); handleReservationClick(); }}
                                >
                                  {isExternal || isIndependent ? '외부 예약 사이트' : '바로 예약'}
                                </a>
                              )}
                            </div>
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

        {seoulApiAcceptingCount > 0 && <ReservationNotice />}

        <div className={`mt-6 p-4 ${themeClass(
          'bg-[#fef3c7] dark:bg-amber-950/40 border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40'
        )}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className={`font-bold ${themeClass('text-black dark:text-amber-100 uppercase', 'text-gray-900 dark:text-amber-100')}`}>
                {districtName} 테니스장 가이드
              </h3>
              <p className={`text-sm mt-1 ${themeClass('text-black/70 dark:text-amber-200/80', 'text-gray-600 dark:text-amber-200/80')}`}>
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

      <MapAppSelector
        isOpen={navDestination !== null}
        onClose={() => setNavDestination(null)}
        destination={navDestination ?? { lat: 0, lng: 0, name: '' }}
      />
    </PullToRefresh>
  );
}
