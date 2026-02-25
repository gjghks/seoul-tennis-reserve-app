'use client';

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SeoulService } from '@/lib/seoulApi';
import { District } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import ShareButton from '@/components/ui/ShareButton';
import StickyHeader from '@/components/court-detail/StickyHeader';
import ReviewSection from '@/components/review/ReviewSection';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import { useThemeClass } from '@/lib/cn';
import FacilityTags from '@/components/ui/FacilityTags';
import { extractFacilityTags } from '@/lib/utils/facilityTags';
import { findEnrichment } from '@/lib/data/facilityEnrichment';
import { convertToWeatherGrid } from '@/lib/utils/weatherGrid';
import WeatherInfoCard from '@/components/weather/WeatherInfoCard';
import { useRecentCourts } from '@/lib/hooks/useRecentCourts';
import SimilarCourts from '@/components/court-detail/SimilarCourts';
import { renderPhoneLinks } from '@/lib/utils/phoneLink';
import CourtAlertButton from '@/components/alert/CourtAlertButton';
import KakaoReserveTip from '@/components/reservation/KakaoReserveTip';
import { useReservationTip } from '@/lib/hooks/useReservationTip';

const KakaoShareButton = dynamic(() => import('@/components/ui/KakaoShareButton'), {
  ssr: false,
});

const DetailContent = dynamic(() => import('@/components/court-detail/DetailContent'), {
  loading: () => <div className="skeleton h-64 !rounded-xl" />,
  ssr: false
});

const CourtDetailMap = dynamic(() => import('@/components/court-detail/CourtDetailMap'), {
  loading: () => <div className="skeleton h-[200px] !rounded-xl" />,
  ssr: false,
});

const ParkingSection = dynamic(() => import('@/components/court-detail/ParkingSection'), {
  ssr: false,
});

const CongestionBadge = dynamic(() => import('@/components/city-data/CongestionBadge'), {
  ssr: false,
});

interface CourtDetailClientProps {
  court: SeoulService;
  district: District;
  districtSlug: string;
  allCourts?: SeoulService[];
}

export default function CourtDetailClient({ court, district, districtSlug, allCourts }: CourtDetailClientProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { addRecentCourt } = useRecentCourts();
  const { handleReservationClick } = useReservationTip();
  const [imageError, setImageError] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addRecentCourt({
      svcId: court.SVCID,
      svcName: court.SVCNM,
      district: court.AREANM,
      placeName: court.PLACENM,
      districtSlug,
      viewedAt: Date.now(),
    });
  }, [court.SVCID, addRecentCourt, court.SVCNM, court.AREANM, court.PLACENM, districtSlug]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (headerRef.current) {
            const headerBottom = headerRef.current.getBoundingClientRect().bottom;
            setShowStickyHeader(headerBottom < 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAvailable = isCourtAvailable(court.SVCSTATNM);
  const facilityTags = extractFacilityTags(court);
  const enrichment = useMemo(() => findEnrichment(court.SVCNM, court.AREANM, court.PLACENM), [court.SVCNM, court.AREANM, court.PLACENM]);
  const weatherGrid = useMemo(() => {
    const longitude = Number.parseFloat(court.X);
    const latitude = Number.parseFloat(court.Y);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return null;
    }

    return convertToWeatherGrid(longitude, latitude);
  }, [court.X, court.Y]);

  const courtCoords = useMemo(() => {
    const lng = Number.parseFloat(court.X);
    const lat = Number.parseFloat(court.Y);
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || lng === 0 || lat === 0) return null;
    return { lat, lng };
  }, [court.X, court.Y]);

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const isOutdoorCourt = useMemo(() => {
    const source = `${court.SVCNM || ''} ${court.PLACENM || ''} ${court.DTLCONT || ''}`;
    const includesIndoor = /(실내|indoor)/i.test(source);
    return !includesIndoor;
  }, [court.DTLCONT, court.PLACENM, court.SVCNM]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const infoItems = [
    { icon: '🕐', label: '운영시간', value: `${court.V_MIN || '00:00'} - ${court.V_MAX || '24:00'}` },
    { icon: '💰', label: '이용료', value: court.PAYATNM || '정보 없음' },
    { icon: '📍', label: '지역', value: court.AREANM },
  ];

  return (
     <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')} `}>
      <StickyHeader 
        court={court} 
        isAvailable={isAvailable} 
        isVisible={showStickyHeader}
        isNeoBrutalism={isNeoBrutalism}
        onReservationClick={handleReservationClick}
      />
      
      <div ref={headerRef} className={themeClass('bg-white border-b-[3px] border-black', 'bg-white border-b border-gray-100')}>
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/${districtSlug}`}
              className={`inline-flex items-center gap-1.5 text-sm ${themeClass('font-bold text-black hover:underline underline-offset-4', 'text-gray-500 hover:text-green-600 transition-colors')}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {district.nameKo}
            </Link>
            <div className="flex items-center gap-2">
              <ShareButton
                title={court.SVCNM}
                text={`${court.AREANM} ${court.PLACENM} 테니스장`}
              />
              <KakaoShareButton
                title={court.SVCNM}
                description={`${court.AREANM} ${court.PLACENM} - ${court.SVCSTATNM}`}
                imageUrl={court.IMGURL}
              />
              <CourtAlertButton
                svcId={court.SVCID}
                svcName={court.SVCNM}
                districtSlug={districtSlug}
              />
              <FavoriteButton
                svcId={court.SVCID}
                svcName={court.SVCNM}
                district={court.AREANM}
                placeName={court.PLACENM}
              />
            </div>
          </div>

          <h1 className={`text-2xl sm:text-3xl mb-2 break-keep ${themeClass('font-black text-black uppercase tracking-tight', 'font-bold text-gray-900')}`}>
            {isNeoBrutalism ? `🎾 ${court.SVCNM}` : court.SVCNM}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            {courtCoords ? (
              <button
                type="button"
                onClick={scrollToMap}
                className={`inline-flex items-center gap-1.5 cursor-pointer hover:underline underline-offset-4 ${themeClass('text-black/70 font-medium', 'text-gray-500 hover:text-green-600')} transition-colors`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {court.PLACENM}
              </button>
            ) : (
              <span className={`inline-flex items-center gap-1.5 ${themeClass('text-black/70 font-medium', 'text-gray-500')}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {court.PLACENM}
              </span>
            )}
            <span className={themeClass('text-black/30', 'text-gray-300')}>·</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold ${
              isNeoBrutalism
                ? `border-2 border-black rounded-[5px] ${isAvailable ? 'bg-[#a3e635] text-black font-black' : 'bg-[#fca5a5] text-black font-black'}`
                : `rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600 border border-red-200'}`
            }`}>
              {isNeoBrutalism && <span className={`w-2.5 h-2.5 rounded-full border border-black ${isAvailable ? 'bg-[#a3e635] animate-pulse' : 'bg-red-400'}`} />}
              {!isNeoBrutalism && <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />}
              {court.SVCSTATNM}
            </span>
          </div>

          <FacilityTags tags={facilityTags} className="mt-3" />
        </div>
      </div>

      <div className="container py-6">
        {court.SVCURL && (
          <div className="mb-8">
            <a
              href={court.SVCURL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReservationClick}
              className={isNeoBrutalism
                ? `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[5px] font-black text-lg uppercase tracking-wide border-[3px] border-black transition-all ${
                    isAvailable
                      ? 'bg-[#22c55e] text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none'
                      : 'bg-gray-300 text-black/60 cursor-not-allowed'
                  }`
                : `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    isAvailable
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-green-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`
              }
            >
              {isAvailable ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isNeoBrutalism ? '지금 예약!' : '지금 예약하기'}
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  예약 마감
                </>
              )}
            </a>
            {isAvailable && <KakaoReserveTip />}
          </div>
        )}

        {court.IMGURL && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm">
            {!imageError ? (
              <Image
                src={court.IMGURL}
                alt={court.SVCNM}
                fill
                unoptimized
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-sm">이미지를 불러올 수 없습니다</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {infoItems.map((item) => (
            <div key={item.label} className={isNeoBrutalism
              ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
              : 'bg-white rounded-xl p-4 border border-gray-100 text-center'
            }>
              <div className={isNeoBrutalism
                ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
                : 'w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2'
              }>
                {item.icon}
              </div>
              <p className={themeClass('text-xs text-black/60 mb-1 font-bold uppercase', 'text-xs text-gray-400 mb-1')}>{item.label}</p>
              <p className={themeClass('font-black text-black text-sm truncate', 'font-semibold text-gray-800 text-sm truncate')}>{item.value}</p>
            </div>
          ))}
           <div className={isNeoBrutalism
            ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
            : 'bg-white rounded-xl p-4 border border-gray-100 text-center'
          }>
            <div className={isNeoBrutalism
              ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
              : 'w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2'
            }>
              📅
            </div>
            <p className={themeClass('text-xs text-black/60 mb-1 font-bold uppercase', 'text-xs text-gray-400 mb-1')}>예약기준</p>
            <p className={themeClass('font-black text-black text-sm truncate', 'font-semibold text-gray-800 text-sm truncate')}>
              {court.REVSTDDAY === '0' ? '이용 당일' : `이용 ${court.REVSTDDAY || '1'}일 전`}
            </p>
          </div>
        </div>

        {enrichment && (
          <div className={`mb-3 overflow-hidden ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]' : 'bg-white rounded-2xl border border-gray-100'}`}>
            <div className="p-5 border-b border-gray-100">
              <h2 className={`font-bold ${themeClass('text-black uppercase', 'text-gray-900')} flex items-center gap-2`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 text-sm ${themeClass('', 'text-green-600')}`}>🏟️</span>
                코트 시설 정보
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-100">
              {enrichment.courtCount > 0 && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">🎾</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>코트</p>
                  <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>{enrichment.courtCount}면</p>
                </div>
              )}
              {enrichment.surfaceDisplay && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">🏗️</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>바닥재</p>
                  <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>{enrichment.surfaceDisplay}</p>
                </div>
              )}
              {enrichment.area > 0 && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">📐</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>코트 면적</p>
                  <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>{enrichment.area.toLocaleString()}㎡</p>
                </div>
              )}
              {enrichment.builtYear && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">🏛️</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>준공</p>
                  <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>
                    {enrichment.builtYear}년 ({new Date().getFullYear() - enrichment.builtYear}년차)
                  </p>
                </div>
              )}
              {enrichment.lighting && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">💡</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>조명탑</p>
                  <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>
                    {enrichment.lighting.count}기{enrichment.lighting.lux ? ` (${enrichment.lighting.lux}lux)` : ''}
                  </p>
                </div>
              )}
              {enrichment.manager && (
                <div className={`flex flex-col items-center justify-center p-4 ${themeClass('bg-white', 'bg-white')}`}>
                  <span className="text-lg mb-1">🏢</span>
                  <p className={themeClass('text-xs text-black/60 font-bold', 'text-xs text-gray-400')}>관리</p>
                  <p className={`${themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')} text-center break-keep`}>
                    {enrichment.manager}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {weatherGrid && (
          <div className="mb-6">
            <WeatherInfoCard
              nx={weatherGrid.nx}
              ny={weatherGrid.ny}
              isOutdoor={isOutdoorCourt}
              isNeoBrutalism={isNeoBrutalism}
              district={court.AREANM}
              courtLat={courtCoords?.lat}
              courtLng={courtCoords?.lng}
            />
          </div>
        )}

        {courtCoords && (
          <div className="mb-6">
            <CongestionBadge
              lat={courtCoords.lat}
              lng={courtCoords.lng}
              isNeoBrutalism={isNeoBrutalism}
              variant="full"
            />
          </div>
        )}

        {(court.RCPTBGNDT || court.RCPTENDDT) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-green-800">접수 기간</h3>
            </div>
            <p className="text-green-700 font-medium">
              {formatDate(court.RCPTBGNDT)} ~ {formatDate(court.RCPTENDDT)}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              시설 정보
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {court.PLACENM && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">위치</span>
                {courtCoords ? (
                  <button
                    type="button"
                    onClick={scrollToMap}
                    className="text-green-600 font-medium text-sm hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {court.PLACENM}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                ) : (
                  <span className="text-gray-900 font-medium text-sm">{court.PLACENM}</span>
                )}
              </div>
            )}
            {court.TELNO && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">연락처</span>
                <span className="text-sm text-right">
                  {renderPhoneLinks(court.TELNO)}
                </span>
              </div>
            )}
            {(court.SVCOPNBGNDT || court.SVCOPNENDDT) && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">서비스 기간</span>
                <span className="text-gray-900 font-medium text-sm">
                  {formatDate(court.SVCOPNBGNDT)} ~ {formatDate(court.SVCOPNENDDT)}
                </span>
              </div>
            )}
          </div>
        </div>

        {courtCoords && (
          <div ref={mapRef} className={`mb-6 overflow-hidden ${isNeoBrutalism ? '' : 'bg-white rounded-2xl border border-gray-100'}`}>
            {!isNeoBrutalism && (
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  위치
                </h2>
              </div>
            )}
            <div className={isNeoBrutalism ? '' : 'p-5'}>
              <CourtDetailMap
                lat={courtCoords.lat}
                lng={courtCoords.lng}
                placeName={court.PLACENM}
              />
            </div>
          </div>
        )}

        {courtCoords && (
          <ParkingSection
            lat={courtCoords.lat}
            lng={courtCoords.lng}
            isNeoBrutalism={isNeoBrutalism}
          />
        )}

        {court.DTLCONT && <DetailContent content={court.DTLCONT} />}

        {AD_SLOTS.COURT_DETAIL_MIDDLE && (
          <div className="mb-6">
            <AdBanner adSlot={AD_SLOTS.COURT_DETAIL_MIDDLE} adFormat="auto" className="min-h-[250px]" />
          </div>
        )}

        <div className="mb-6">
          <ReviewSection
            courtId={court.SVCID}
            courtName={court.SVCNM}
            district={court.AREANM}
          />
        </div>

        {allCourts && allCourts.length > 0 && (
          <SimilarCourts
            currentCourtId={court.SVCID}
            currentPlaceName={court.PLACENM}
            district={court.AREANM}
            allCourts={allCourts}
            isNeoBrutalism={isNeoBrutalism}
          />
        )}

        <div className="flex gap-3">
          <Link
            href={`/${districtSlug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            목록보기
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href={`/records/new?courtName=${encodeURIComponent(court.SVCNM)}&district=${encodeURIComponent(court.AREANM)}&placeName=${encodeURIComponent(court.PLACENM || '')}`}
            className={themeClass(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black bg-[#88aaee] text-black font-bold shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all",
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            이 코트에서 게임 기록하기
          </Link>
        </div>

        {AD_SLOTS.COURT_DETAIL_BOTTOM && (
          <div className="mt-6">
            <AdBanner adSlot={AD_SLOTS.COURT_DETAIL_BOTTOM} adFormat="auto" className="min-h-[250px]" />
          </div>
        )}
      </div>

      {court.SVCURL && isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 sm:hidden">
          <a
            href={court.SVCURL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleReservationClick}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            지금 예약하기
          </a>
        </div>
      )}
    </div>
  );
}
