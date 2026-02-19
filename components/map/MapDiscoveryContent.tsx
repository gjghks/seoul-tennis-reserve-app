'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Map as KakaoMap, MapMarker, CustomOverlayMap, ZoomControl } from 'react-kakao-maps-sdk';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { useKakaoLoaderWithHttps } from '@/lib/hooks/useKakaoLoaderWithHttps';
import { isCourtAccepting } from '@/lib/utils/courtStatus';
import { DISTRICTS, KOREAN_TO_SLUG } from '@/lib/constants/districts';
import type { SeoulService } from '@/lib/seoulApi';

interface CourtGroup {
  key: string;
  lat: number;
  lng: number;
  placeName: string;
  district: string;
  courts: SeoulService[];
  hasAvailable: boolean;
  availableCount: number;
}

function getShortName(svcnm: string, placeName: string): string {
  const normalized = placeName.replace(/\s/g, '');
  const svcNormalized = svcnm.replace(/\s/g, '');
  if (svcNormalized.startsWith(normalized)) {
    const rest = svcnm.slice(svcnm.indexOf(placeName.trim()) + placeName.trim().length).trim();
    return rest || svcnm;
  }
  return svcnm;
}

interface MapDiscoveryContentProps {
  courts: SeoulService[];
}

export default function MapDiscoveryContent({ courts }: MapDiscoveryContentProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [, error] = useKakaoLoaderWithHttps();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<CourtGroup | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [locating, setLocating] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validCourts = useMemo(
    () => courts.filter(c => c.X && c.Y && parseFloat(c.X) !== 0 && parseFloat(c.Y) !== 0),
    [courts]
  );

  const filteredCourts = useMemo(() => {
    if (selectedDistrict === 'all') return validCourts;
    return validCourts.filter(c => c.AREANM === selectedDistrict);
  }, [validCourts, selectedDistrict]);

  const courtGroups = useMemo(() => {
    const map = new Map<string, CourtGroup>();
    for (const court of filteredCourts) {
      const lat = parseFloat(court.Y);
      const lng = parseFloat(court.X);
      const key = `${lat.toFixed(5)}_${lng.toFixed(5)}`;
      const existing = map.get(key);
      const accepting = isCourtAccepting(court.SVCSTATNM);
      if (existing) {
        existing.courts.push(court);
        if (accepting) {
          existing.hasAvailable = true;
          existing.availableCount++;
        }
      } else {
        map.set(key, {
          key,
          lat,
          lng,
          placeName: court.PLACENM,
          district: court.AREANM,
          courts: [court],
          hasAvailable: accepting,
          availableCount: accepting ? 1 : 0,
        });
      }
    }
    return Array.from(map.values());
  }, [filteredCourts]);

  const totalAvailable = useMemo(
    () => filteredCourts.filter(c => isCourtAccepting(c.SVCSTATNM)).length,
    [filteredCourts]
  );

  const availableDistricts = useMemo(() => {
    const set = new Set(validCourts.map(c => c.AREANM));
    return DISTRICTS.filter(d => set.has(d.nameKo));
  }, [validCourts]);

  const handleMarkerClick = useCallback((group: CourtGroup) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setSelectedGroup(group);
    setMapCenter({ lat: group.lat, lng: group.lng });
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    if (!window.isSecureContext) {
      alert('HTTPS가 아닌 환경에서는 위치 기능을 사용할 수 없습니다.\nlocalhost 또는 HTTPS로 접속해주세요.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        const messages: Record<number, string> = {
          1: '위치 권한이 차단되었습니다.\n\n• 브라우저 주소창 왼쪽 아이콘 → 위치 → 허용\n• Windows: 설정 → 개인정보 → 위치 서비스 켜기',
          2: '현재 위치를 확인할 수 없습니다.',
          3: '위치 요청 시간이 초과되었습니다.',
        };
        alert(messages[err.code] ?? `위치 요청 실패 (코드: ${err.code})`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
        <p className={themeClass('text-black/60 font-medium', 'text-gray-400')}>
          지도를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
        <p className={themeClass('text-black/60 font-medium', 'text-gray-400')}>
          카카오 맵 API 키가 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col" style={{ height: 'calc(100dvh - 56px - 56px)' }}>
      {/* District filter chips */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 overflow-x-auto scrollbar-hide ${
          themeClass('bg-nb-bg/90 backdrop-blur-sm', 'bg-white/90 backdrop-blur-sm')
        }`}
        style={{ paddingBottom: 4 }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 min-w-max">
          <button
            type="button"
            onClick={() => {
              setSelectedDistrict('all');
              setSelectedGroup(null);
              setMapCenter({ lat: 37.5665, lng: 126.978 });
            }}
            className={`shrink-0 px-3 py-1.5 text-xs font-bold transition-all ${
              selectedDistrict === 'all'
                ? themeClass(
                    'bg-black text-white border-2 border-black rounded-[5px]',
                    'bg-green-600 text-white rounded-full'
                  )
                : themeClass(
                    'bg-white border-2 border-black rounded-[5px] text-black hover:bg-gray-100',
                    'bg-white border border-gray-200 rounded-full text-gray-600 hover:border-green-300'
                  )
            }`}
          >
            전체
          </button>
          {availableDistricts.map(d => (
            <button
              key={d.slug}
              type="button"
              onClick={() => {
                setSelectedDistrict(d.nameKo);
                setSelectedGroup(null);
              }}
              className={`shrink-0 px-3 py-1.5 text-xs font-bold transition-all ${
                selectedDistrict === d.nameKo
                  ? themeClass(
                      'bg-black text-white border-2 border-black rounded-[5px]',
                      'bg-green-600 text-white rounded-full'
                    )
                  : themeClass(
                      'bg-white border-2 border-black rounded-[5px] text-black hover:bg-gray-100',
                      'bg-white border border-gray-200 rounded-full text-gray-600 hover:border-green-300'
                    )
              }`}
            >
              {d.nameKo.replace(/구$/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div
        className={`absolute top-10 left-3 z-10 px-3 py-1.5 text-xs font-bold ${
          themeClass(
            'bg-white border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] text-black',
            'bg-white border border-gray-200 rounded-full shadow-sm text-gray-700'
          )
        }`}
      >
        전체 {filteredCourts.length}개 · <span className={themeClass('text-[#16a34a]', 'text-green-600')}>예약가능 {totalAvailable}개</span>
      </div>

      {/* Locate me button */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={locating}
        className={`absolute bottom-4 right-3 z-10 w-10 h-10 flex items-center justify-center transition-all ${
          themeClass(
            'bg-white border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:bg-gray-100',
            'bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50'
          )
        }`}
        aria-label="내 위치로 이동"
      >
        {locating ? (
          <svg className="w-5 h-5 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className={themeClass('w-5 h-5 text-black', 'w-5 h-5 text-green-600')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
          </svg>
        )}
      </button>

      {/* Map */}
      <KakaoMap
        center={mapCenter}
        style={{ width: '100%', height: '100%' }}
        level={8}
        onClick={() => {
          if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
          }
          setSelectedGroup(null);
        }}
      >
        <ZoomControl position="RIGHT" />

        {courtGroups.map(group => (
          <MapMarker
            key={group.key}
            position={{ lat: group.lat, lng: group.lng }}
            image={{
              src: group.hasAvailable
                ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
                : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
              size: { width: 24, height: 35 },
            }}
            onClick={() => handleMarkerClick(group)}
          />
        ))}

        {/* User location marker */}
        {userLocation && (
          <CustomOverlayMap position={userLocation} zIndex={20}>
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30" />
            </div>
          </CustomOverlayMap>
        )}

        {/* Selected group overlay */}
        {selectedGroup && (
          <CustomOverlayMap
            position={{ lat: selectedGroup.lat, lng: selectedGroup.lng }}
            yAnchor={1.15}
            zIndex={10}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{ width: 300, padding: 14, boxSizing: 'border-box', whiteSpace: 'normal' }}
              className={
                isNeoBrutalism
                  ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white border border-gray-200 rounded-xl shadow-lg'
              }
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isNeoBrutalism ? '#000' : '#111' }}>
                    {selectedGroup.placeName}
                    {selectedGroup.courts.length > 1 && (
                      <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 400, color: isNeoBrutalism ? 'rgba(0,0,0,0.4)' : '#999' }}>
                        ({selectedGroup.courts.length}개)
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGroup(null)}
                  style={{ flexShrink: 0, marginLeft: 8, fontSize: 12, padding: 2, cursor: 'pointer', background: 'none', border: 'none', color: '#aaa' }}
                >
                  ✕
                </button>
              </div>

              {/* District badge */}
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: isNeoBrutalism ? 3 : 12,
                    background: isNeoBrutalism ? '#facc15' : '#f0fdf4',
                    border: isNeoBrutalism ? '1px solid #000' : '1px solid #bbf7d0',
                    color: isNeoBrutalism ? '#000' : '#15803d',
                  }}
                >
                  {selectedGroup.district}
                </span>
                <span style={{ marginLeft: 6, fontSize: 11, color: isNeoBrutalism ? 'rgba(0,0,0,0.4)' : '#9ca3af' }}>
                  접수중 {selectedGroup.availableCount}/{selectedGroup.courts.length}개
                </span>
              </div>

              {/* Court list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                maxHeight: selectedGroup.courts.length > 6 ? 220 : undefined,
                overflowY: selectedGroup.courts.length > 6 ? 'auto' : undefined,
              }}>
                {selectedGroup.courts.map(court => {
                  const isAvailable = isCourtAccepting(court.SVCSTATNM);
                  const shortName = getShortName(court.SVCNM, selectedGroup.placeName);
                  const slug = KOREAN_TO_SLUG[court.AREANM];
                  return (
                    <Link
                      key={court.SVCID}
                      href={slug ? `/${slug}/${encodeURIComponent(court.SVCID)}` : '#'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        fontSize: 13,
                        lineHeight: 1.4,
                        textDecoration: 'none',
                        border: isNeoBrutalism ? '1px solid rgba(0,0,0,0.15)' : '1px solid #e5e5e5',
                        borderRadius: 5,
                      }}
                    >
                      <span style={{
                        fontWeight: 500,
                        color: isNeoBrutalism ? '#000' : '#333',
                        wordBreak: 'keep-all',
                      }}>
                        {shortName}
                      </span>
                      <span style={{
                        flexShrink: 0,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 3,
                        background: isAvailable ? (isNeoBrutalism ? '#a3e635' : '#dcfce7') : (isNeoBrutalism ? '#e5e5e5' : '#f3f4f6'),
                        color: isAvailable ? (isNeoBrutalism ? '#000' : '#15803d') : (isNeoBrutalism ? 'rgba(0,0,0,0.4)' : '#9ca3af'),
                      }}>
                        {court.SVCSTATNM}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </KakaoMap>
    </div>
  );
}
