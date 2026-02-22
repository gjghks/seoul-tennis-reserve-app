'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';

interface ParkingSectionProps {
  lat: number;
  lng: number;
  isNeoBrutalism: boolean;
}

interface ParkingLotInfo {
  name: string;
  type: string;
  capacity: number;
  payYn: boolean;
  rates: number;
  timeRates: number;
  addRates: number;
  addTimeRates: number;
  address: string;
  lat: number;
  lng: number;
}

interface ParkingResponse {
  area: string;
  areaCode: string;
  matchedAreaDistance?: number;
  parking: ParkingLotInfo[];
}

const fetcher = async (url: string): Promise<ParkingResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch parking');
  return response.json();
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function formatRates(payYn: boolean, rates: number, timeRates: number, addRates: number, addTimeRates: number): string {
  if (!payYn) return '무료';
  if (rates === 0 && addRates > 0) return `${timeRates}분 무료 / +${addRates.toLocaleString('ko-KR')}원·${addTimeRates}분`;
  if (rates === 0) return '무료';
  return `${rates.toLocaleString('ko-KR')}원/${timeRates}분`;
}

function formatParkingType(type: string): { label: string; color: string; colorNeo: string } {
  switch (type) {
    case '노상':
      return { label: '노상', color: 'bg-blue-100 text-blue-700', colorNeo: 'bg-[#88aaee] text-black border-black' };
    case '노외':
      return { label: '노외', color: 'bg-green-100 text-green-700', colorNeo: 'bg-[#a3e635] text-black border-black' };
    case '부설':
      return { label: '부설', color: 'bg-gray-100 text-gray-600', colorNeo: 'bg-gray-200 text-black border-black' };
    default:
      return { label: type || '기타', color: 'bg-gray-100 text-gray-600', colorNeo: 'bg-gray-200 text-black border-black' };
  }
}

const INITIAL_SHOW_COUNT = 5;
const MAX_AREA_DISTANCE_METERS = 1000;

export default function ParkingSection({ lat, lng, isNeoBrutalism }: ParkingSectionProps) {
  const themeClass = useThemeClass();
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useSWR<ParkingResponse>(
    `/api/city-data?lat=${lat}&lng=${lng}&fields=parking`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10 * 60 * 1000,
      dedupingInterval: 10 * 60 * 1000,
      keepPreviousData: true,
    }
  );
  const parkingLots = data?.parking;

  const sortedParking = useMemo(() => {
    if (!parkingLots) return [];
    return [...parkingLots]
      .map(p => ({
        ...p,
        distance: haversineDistance(lat, lng, p.lat, p.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [parkingLots, lat, lng]);

  const visibleParking = showAll ? sortedParking : sortedParking.slice(0, INITIAL_SHOW_COUNT);

  const handleDirections = useCallback((parkingLat: number, parkingLng: number, parkingName: string) => {
    const destParam = `${encodeURIComponent(parkingName)},${parkingLat},${parkingLng}`;
    const fallbackUrl = `https://map.kakao.com/link/to/${destParam}`;

    if (!navigator.geolocation) {
      window.open(fallbackUrl, '_blank');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const fromParam = `${encodeURIComponent('현재위치')},${latitude},${longitude}`;
        const toParam = destParam;
        window.open(`https://map.kakao.com/link/from/${fromParam}/to/${toParam}`, '_blank');
      },
      () => {
        window.open(fallbackUrl, '_blank');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  if (isLoading && !data) return null;
  if (!sortedParking.length) return null;
  if (data?.matchedAreaDistance !== undefined && data.matchedAreaDistance > MAX_AREA_DISTANCE_METERS) return null;

  return (
    <div className={isNeoBrutalism
      ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] overflow-hidden mb-6'
      : 'bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6'
    }>
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={isNeoBrutalism
          ? 'w-full p-5 flex items-center justify-between border-b-2 border-black'
          : `w-full p-5 flex items-center justify-between ${expanded ? 'border-b border-gray-100' : ''}`
        }
        aria-expanded={expanded}
      >
        <h2 className={themeClass(
          'font-black text-black flex items-center gap-2 uppercase',
          'font-bold text-gray-900 flex items-center gap-2'
        )}>
          <span className="text-lg">🅿️</span>
          주변 주차장
          <span className={themeClass(
            'inline-flex items-center justify-center w-6 h-6 rounded-[3px] border-2 border-black bg-[#88aaee] text-xs font-black',
            'inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold'
          )}>
            {sortedParking.length}
          </span>
        </h2>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''} ${themeClass('text-black', 'text-gray-400')}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div>
          <div className="divide-y divide-gray-50">
            {visibleParking.map((p, idx) => {
              const typeInfo = formatParkingType(p.type);
              const rateText = formatRates(p.payYn, p.rates, p.timeRates, p.addRates, p.addTimeRates);
              const isFree = !p.payYn || (p.rates === 0 && p.addRates === 0);

              return (
                <div key={`${p.name}-${p.lat}-${p.lng}-${idx}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={themeClass(
                          'font-black text-sm text-black truncate',
                          'font-semibold text-sm text-gray-800 truncate'
                        )}>
                          {p.name}
                        </span>
                        <span className={themeClass(
                          `shrink-0 px-1.5 py-0.5 text-[10px] font-black rounded-[3px] border ${typeInfo.colorNeo}`,
                          `shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded ${typeInfo.color}`
                        )}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className={themeClass(
                        'flex items-center gap-1.5 text-[11px] font-bold text-black/40',
                        'flex items-center gap-1.5 text-[11px] text-gray-400'
                      )}>
                        <span>{formatDistance(p.distance)}</span>
                        <span>·</span>
                        <span>수용 {p.capacity}대</span>
                        <span>·</span>
                        <span className={isFree ? (isNeoBrutalism ? 'text-[#16a34a] font-black' : 'text-green-600 font-semibold') : ''}>
                          {rateText}
                        </span>
                      </div>
                      {p.address && (
                        <p className={themeClass(
                          'text-[11px] text-black/30 font-bold mt-0.5 truncate',
                          'text-[11px] text-gray-300 mt-0.5 truncate'
                        )}>
                          {p.address}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDirections(p.lat, p.lng, p.name)}
                      className={themeClass(
                        'shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black rounded-[3px] border-2 border-black bg-[#88aaee] text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_#000] transition-all',
                        'shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors'
                      )}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                      </svg>
                      길찾기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedParking.length > INITIAL_SHOW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className={themeClass(
                'w-full py-3 text-center text-xs font-black text-black/50 border-t-2 border-black/10 hover:bg-black/5 transition-colors',
                'w-full py-3 text-center text-xs text-gray-400 border-t border-gray-100 hover:bg-gray-50 transition-colors'
              )}
            >
              {showAll ? '접기' : `나머지 ${sortedParking.length - INITIAL_SHOW_COUNT}개 더보기`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
