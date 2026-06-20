'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Map as KakaoMap, MapMarker, CustomOverlayMap, ZoomControl } from 'react-kakao-maps-sdk';
import { useRouter } from 'next/navigation';
import { SeoulService } from '@/lib/seoulApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useKakaoLoaderWithHttps } from '@/lib/hooks/useKakaoLoaderWithHttps';
import { isCourtAccepting } from '@/lib/utils/courtStatus';

interface CourtGroup {
  key: string;
  lat: number;
  lng: number;
  placeName: string;
  courts: SeoulService[];
  hasAvailable: boolean;
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

interface KakaoMapViewProps {
  courts: SeoulService[];
  district: string;
  focusPlaceName?: string | null;
  onPlaceSelect?: (placeName: string) => void;
}

export default function KakaoMapView({ courts, district, focusPlaceName, onPlaceSelect }: KakaoMapViewProps) {
  const { isNeoBrutalism } = useTheme();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<CourtGroup | null>(null);
  const [hoveredGroup, setHoveredGroup] = useState<CourtGroup | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  const [, error] = useKakaoLoaderWithHttps();

  const validCourts = useMemo(
    () => courts.filter(c => c.X && c.Y && parseFloat(c.X) !== 0 && parseFloat(c.Y) !== 0),
    [courts]
  );

  const courtGroups = useMemo(() => {
    const map = new Map<string, CourtGroup>();
    for (const court of validCourts) {
      const lat = parseFloat(court.Y);
      const lng = parseFloat(court.X);
      const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
      const existing = map.get(key);
      if (existing) {
        existing.courts.push(court);
        if (isCourtAccepting(court.SVCSTATNM)) existing.hasAvailable = true;
      } else {
        map.set(key, {
          key,
          lat,
          lng,
          placeName: court.PLACENM,
          courts: [court],
          hasAvailable: isCourtAccepting(court.SVCSTATNM),
        });
      }
    }
    return Array.from(map.values());
  }, [validCourts]);

  const { initialCenter, initialLevel } = useMemo(() => {
    if (courtGroups.length === 0) {
      return { initialCenter: { lat: 37.5665, lng: 126.978 }, initialLevel: 5 };
    }
    if (courtGroups.length === 1) {
      return { initialCenter: { lat: courtGroups[0].lat, lng: courtGroups[0].lng }, initialLevel: 4 };
    }

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const g of courtGroups) {
      minLat = Math.min(minLat, g.lat);
      maxLat = Math.max(maxLat, g.lat);
      minLng = Math.min(minLng, g.lng);
      maxLng = Math.max(maxLng, g.lng);
    }

    const center = { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };

    const latDelta = maxLat - minLat;
    const lngDelta = maxLng - minLng;
    const latMeters = latDelta * 111320;
    const lngMeters = lngDelta * 88900;
    const maxSpanMeters = Math.max(latMeters, lngMeters);

    const MAP_HEIGHT_PX = 400;
    const PADDING_FACTOR = 2.2;
    const requiredMeters = maxSpanMeters * PADDING_FACTOR;

    let level = 1;
    for (let l = 1; l <= 14; l++) {
      const metersPerPx = Math.pow(2, l - 1) * 0.5;
      if (metersPerPx * MAP_HEIGHT_PX >= requiredMeters) {
        level = l;
        break;
      }
    }

    return { initialCenter: center, initialLevel: level };
  }, [courtGroups]);

  useEffect(() => {
    if (!focusPlaceName || courtGroups.length === 0) return;
    const target = courtGroups.find(g => g.placeName === focusPlaceName);
    if (target) {
      const timer = window.setTimeout(() => {
        setSelectedGroup(target);
        setMapCenter({ lat: target.lat, lng: target.lng });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [focusPlaceName, courtGroups]);

  const handleMarkerClick = useCallback((group: CourtGroup) => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setHoveredGroup(null);
    setSelectedGroup(group);
    setMapCenter({ lat: group.lat, lng: group.lng });
  }, []);

  const handleDetailClick = useCallback((svcId: string) => {
    router.push(`/${district}/${encodeURIComponent(svcId)}`);
  }, [router, district]);

  if (error) return null;

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
    return (
      <div className={`p-8 text-center ${isNeoBrutalism ? 'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px]' : 'bg-gray-50 dark:bg-slate-800 rounded-xl'}`}>
        <p className={isNeoBrutalism ? 'text-black/60 dark:text-slate-400 font-medium' : 'text-gray-400 dark:text-slate-500'}>
          지도를 표시하려면 카카오 맵 API 키가 필요합니다.
        </p>
      </div>
    );
  }

  if (courtGroups.length === 0) {
    return (
      <div className={`p-8 text-center ${isNeoBrutalism ? 'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px]' : 'bg-gray-50 dark:bg-slate-800 rounded-xl'}`}>
        <svg className={isNeoBrutalism ? 'w-12 h-12 mx-auto mb-2' : 'w-10 h-10 mx-auto mb-2'} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            <path d="M32 8 C22 8 14 16 14 26 C14 40 32 56 32 56 C32 56 50 40 50 26 C50 16 42 8 32 8 Z" className={isNeoBrutalism ? 'fill-[#a3e635] stroke-black stroke-[2.5]' : 'fill-green-100 stroke-gray-300 stroke-[1.5]'} />
            <text x="32" y="32" textAnchor="middle" dominantBaseline="central" className={isNeoBrutalism ? 'fill-black text-lg font-black' : 'fill-gray-400 text-lg font-bold'}>?</text>
          </g>
          <circle cx="54" cy="12" r="2" className={isNeoBrutalism ? 'fill-black' : 'fill-gray-400'} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
          <circle cx="10" cy="42" r="1.5" className={isNeoBrutalism ? 'fill-black' : 'fill-gray-400'} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
        </svg>
        <p className={isNeoBrutalism ? 'text-black/60 dark:text-slate-400 font-medium' : 'text-gray-400 dark:text-slate-500'}>
          위치 정보가 있는 테니스장이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${isNeoBrutalism ? 'border-2 border-black rounded-[5px]' : 'border border-gray-200 dark:border-slate-700 rounded-xl'}`}>
      <KakaoMap
        center={mapCenter || initialCenter}
        style={{ width: '100%', height: '400px' }}
        level={initialLevel}
        onClick={() => {
          if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
          setSelectedGroup(null);
          setHoveredGroup(null);
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
              onMouseOver={() => {
                if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
                if (!selectedGroup) setHoveredGroup(group);
              }}
              onMouseOut={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => { setHoveredGroup(null); hoverTimerRef.current = null; }, 50);
              }}
           />
         ))}

         {hoveredGroup && !selectedGroup && (
           <CustomOverlayMap
             position={{ lat: hoveredGroup.lat, lng: hoveredGroup.lng }}
             yAnchor={1.3}
             zIndex={5}
           >
              <div
                ref={(el) => {
                  if (el?.parentElement) el.parentElement.style.pointerEvents = 'none';
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
               className={
                 isNeoBrutalism
                   ? 'bg-white border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000]'
                   : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md'
               }
             >
               <span style={{ color: isNeoBrutalism ? '#000' : '#111' }}>
                 {hoveredGroup.placeName}
               </span>
               <span style={{
                 marginLeft: 6,
                 fontSize: 11,
                 fontWeight: 500,
                 color: isNeoBrutalism ? 'rgba(0,0,0,0.5)' : '#6b7280',
               }}>
                 · 접수중 {hoveredGroup.courts.filter(c => isCourtAccepting(c.SVCSTATNM)).length}/{hoveredGroup.courts.length}개
               </span>
             </div>
           </CustomOverlayMap>
         )}

         {selectedGroup && (
          <CustomOverlayMap
            position={{ lat: selectedGroup.lat, lng: selectedGroup.lng }}
            yAnchor={0.5}
            zIndex={10}
            clickable
          >
            <div
              style={{ display: 'block', whiteSpace: 'normal', width: 320, padding: 14, boxSizing: 'border-box' }}
                className={
                  isNeoBrutalism
                    ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg'
              }
            >
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
                  {onPlaceSelect && (
                    <button
                      type="button"
                      onClick={() => onPlaceSelect(selectedGroup.placeName)}
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        cursor: 'pointer',
                        background: isNeoBrutalism ? '#88aaee' : '#f0fdf4',
                        border: isNeoBrutalism ? '1px solid #000' : '1px solid #bbf7d0',
                        borderRadius: 3,
                        color: isNeoBrutalism ? '#000' : '#15803d',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      목록 ↓
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGroup(null)}
                  style={{ flexShrink: 0, marginLeft: 8, fontSize: 12, padding: 2, cursor: 'pointer', background: 'none', border: 'none', color: '#aaa' }}
                >
                  ✕
                </button>
              </div>

              <div
                onWheel={(e) => e.stopPropagation()}
                style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: selectedGroup.courts.length > 8 ? 300 : undefined, overflowY: selectedGroup.courts.length > 8 ? 'auto' : undefined }}
              >
                {selectedGroup.courts.map(court => {
                  const isAvailable = isCourtAccepting(court.SVCSTATNM);
                  const shortName = getShortName(court.SVCNM, selectedGroup.placeName);
                  return (
                    <button
                      key={court.SVCID}
                      type="button"
                      onClick={() => handleDetailClick(court.SVCID)}
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
                        cursor: 'pointer',
                        background: 'none',
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
                    </button>
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
