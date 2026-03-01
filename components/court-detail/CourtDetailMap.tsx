'use client';

import { useState, useMemo } from 'react';
import { Map as KakaoMap, MapMarker, CustomOverlayMap, ZoomControl } from 'react-kakao-maps-sdk';
import { useTheme } from '@/contexts/ThemeContext';
import { useKakaoLoaderWithHttps } from '@/lib/hooks/useKakaoLoaderWithHttps';
import MapAppSelector from '@/components/ui/MapAppSelector';
import { cleanCourtNameForMap } from '@/lib/utils/mapNavigation';
import type { MapDestination } from '@/lib/utils/mapNavigation';

interface CourtDetailMapProps {
  lat: number;
  lng: number;
  placeName: string;
  mapPOIName?: string;
}

export default function CourtDetailMap({ lat, lng, placeName, mapPOIName }: CourtDetailMapProps) {
  const { isNeoBrutalism } = useTheme();
  const [showMapSelector, setShowMapSelector] = useState(false);

  const [, error] = useKakaoLoaderWithHttps();

  const shortPlaceName = placeName.includes('>') ? placeName.split('>').pop()!.trim() : placeName;
  const destParam = `${encodeURIComponent(shortPlaceName)},${lat},${lng}`;
  const kakaoMapViewUrl = `https://map.kakao.com/link/map/${destParam}`;

  // For navigation: use enrichment POI name > cleaned name > raw name
  const navigationName = mapPOIName || cleanCourtNameForMap(shortPlaceName);

  const destination: MapDestination = useMemo(() => ({
    lat, lng, name: navigationName,
  }), [lat, lng, navigationName]);

  if (error || !process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) return null;

  return (
    <div>
      <div
        style={{ width: '100%', height: 200, borderRadius: isNeoBrutalism ? 5 : 12, overflow: 'hidden', border: isNeoBrutalism ? '2px solid #000' : '1px solid #e5e7eb' }}
      >
        <KakaoMap
          center={{ lat, lng }}
          style={{ width: '100%', height: '100%' }}
          level={4}
          draggable={true}
          zoomable={true}
        >
          <ZoomControl position="RIGHT" />
          <MapMarker
            position={{ lat, lng }}
            image={{
              src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              size: { width: 24, height: 35 },
            }}
          />
          <CustomOverlayMap
            position={{ lat, lng }}
            yAnchor={2.2}
          >
            <div style={{
              background: isNeoBrutalism ? '#000' : '#1f2937',
              color: '#fff',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {shortPlaceName}
            </div>
          </CustomOverlayMap>
        </KakaoMap>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setShowMapSelector(true)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: isNeoBrutalism ? 5 : 8,
            border: isNeoBrutalism ? '2px solid #000' : '1px solid #e5e7eb',
            background: isNeoBrutalism ? '#88aaee' : '#fff',
            color: isNeoBrutalism ? '#000' : '#374151',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          길찾기
        </button>
        <a
          href={kakaoMapViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: isNeoBrutalism ? 5 : 8,
            border: isNeoBrutalism ? '2px solid #000' : '1px solid #e5e7eb',
            background: '#fff',
            color: isNeoBrutalism ? '#000' : '#374151',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          지도에서 보기
        </a>
      </div>

      <MapAppSelector
        isOpen={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        destination={destination}
      />
    </div>
  );
}
