'use client';

import { useState, useMemo } from 'react';
import { Map as KakaoMap, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import Link from 'next/link';
import { SeoulService } from '@/lib/seoulApi';
import { useTheme } from '@/contexts/ThemeContext';

interface KakaoMapViewProps {
  courts: SeoulService[];
  district: string;
}

export default function KakaoMapView({ courts, district }: KakaoMapViewProps) {
  const { isNeoBrutalism } = useTheme();
  const [selectedCourt, setSelectedCourt] = useState<SeoulService | null>(null);

  const [, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!,
  });

  const validCourts = useMemo(
    () => courts.filter(c => c.X && c.Y && parseFloat(c.X) !== 0 && parseFloat(c.Y) !== 0),
    [courts]
  );

  const center = useMemo(() => {
    if (validCourts.length === 0) return { lat: 37.5665, lng: 126.978 };
    const avgLat = validCourts.reduce((sum, c) => sum + parseFloat(c.Y), 0) / validCourts.length;
    const avgLng = validCourts.reduce((sum, c) => sum + parseFloat(c.X), 0) / validCourts.length;
    return { lat: avgLat, lng: avgLng };
  }, [validCourts]);

  if (error) return null;

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY) {
    return (
      <div className={`p-8 text-center ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-50 rounded-xl'}`}>
        <p className={isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-400'}>
          지도를 표시하려면 카카오 맵 API 키가 필요합니다.
        </p>
      </div>
    );
  }

  if (validCourts.length === 0) {
    return (
      <div className={`p-8 text-center ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-50 rounded-xl'}`}>
        <p className={isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-400'}>
          위치 정보가 있는 테니스장이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${isNeoBrutalism ? 'border-2 border-black rounded-[5px]' : 'border border-gray-200 rounded-xl'}`}>
      <KakaoMap
        center={center}
        style={{ width: '100%', height: '400px' }}
        level={5}
        onClick={() => setSelectedCourt(null)}
      >
        {validCourts.map(court => {
          const isAvailable = court.SVCSTATNM === '접수중';
          return (
            <MapMarker
              key={court.SVCID}
              position={{ lat: parseFloat(court.Y), lng: parseFloat(court.X) }}
              image={{
                src: isAvailable
                  ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
                  : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                size: { width: 24, height: 35 },
              }}
              onClick={() => setSelectedCourt(court)}
            />
          );
        })}

        {selectedCourt && (
          <CustomOverlayMap
            position={{ lat: parseFloat(selectedCourt.Y), lng: parseFloat(selectedCourt.X) }}
            yAnchor={1.3}
          >
            <div className={`min-w-[200px] max-w-[280px] p-3 ${
              isNeoBrutalism
                ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white border border-gray-200 rounded-xl shadow-lg'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`text-sm font-bold line-clamp-2 ${isNeoBrutalism ? 'text-black' : 'text-gray-900'}`}>
                  {selectedCourt.SVCNM}
                </h4>
                <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded ${
                  selectedCourt.SVCSTATNM === '접수중'
                    ? isNeoBrutalism ? 'bg-[#a3e635] text-black border border-black' : 'bg-green-100 text-green-700'
                    : isNeoBrutalism ? 'bg-gray-200 text-black/50 border border-black' : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedCourt.SVCSTATNM}
                </span>
              </div>
              <p className={`text-xs mb-2 ${isNeoBrutalism ? 'text-black/60' : 'text-gray-500'}`}>
                {selectedCourt.PLACENM}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/${district}/${encodeURIComponent(selectedCourt.SVCID)}`}
                  className={`flex-1 text-center text-xs py-1.5 font-bold ${
                    isNeoBrutalism
                      ? 'bg-[#88aaee] text-black border-2 border-black rounded-[3px]'
                      : 'bg-green-600 text-white rounded-lg'
                  }`}
                >
                  상세보기
                </Link>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedCourt(null); }}
                  className={`text-xs py-1.5 px-2 ${
                    isNeoBrutalism
                      ? 'text-black/50 border-2 border-black rounded-[3px]'
                      : 'text-gray-400 border border-gray-200 rounded-lg'
                  }`}
                >
                  닫기
                </button>
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </KakaoMap>
    </div>
  );
}
