'use client';

import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import type { AirQualityData } from '@/lib/airQualityApi';
import { resolveAirQualityGradeColor, isAirQualityBad, resolvePmColor, resolvePmColorNeo } from '@/lib/airQualityApi';

interface WeatherInfoCardProps {
  nx: number;
  ny: number;
  isOutdoor: boolean;
  isNeoBrutalism: boolean;
  district?: string;
}

interface WeatherResponse {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
  sky: string | null;
}

const weatherFetcher = async (url: string): Promise<WeatherResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather');
  return response.json();
};

const airFetcher = async (url: string): Promise<AirQualityData> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch air quality');
  return response.json();
};

function resolveIcon(sky: string | null, rainfall: number | null): string {
  if (sky === '눈' || sky === '비/눈') return '❄️';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '🌧️';
  if (sky === '맑음') return '☀️';
  return '☁️';
}

function resolveWarning(sky: string | null, rainfall: number | null, airGrade?: string): string | null {
  if (sky === '눈' || sky === '비/눈') return '실외 코트 강설 주의';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '실외 코트 우천 주의';
  if (airGrade && isAirQualityBad(airGrade)) return '미세먼지 주의! 실내 코트를 추천합니다';
  return null;
}

export default function WeatherInfoCard({ nx, ny, isOutdoor, isNeoBrutalism, district }: WeatherInfoCardProps) {
  const themeClass = useThemeClass();

  const { data, isLoading } = useSWR<WeatherResponse>(`/api/weather?nx=${nx}&ny=${ny}`, weatherFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    keepPreviousData: true,
  });

  const airQualityUrl = district ? `/api/air-quality?district=${encodeURIComponent(district)}` : null;
  const { data: airData } = useSWR<AirQualityData>(airQualityUrl, airFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    keepPreviousData: true,
  });

  if (isLoading && !data) {
    return (
      <div className={isNeoBrutalism
        ? 'border-2 border-black rounded-[5px] p-4 shadow-[3px_3px_0px_0px_#000] skeleton-neo h-24'
        : 'rounded-xl p-4 border border-gray-100 skeleton h-24'
      } />
    );
  }

  const hasData = data && data.temperature !== null;
  if (!hasData) return null;

  const icon = resolveIcon(data.sky, data.rainfall);
  const warning = isOutdoor ? resolveWarning(data.sky, data.rainfall, airData?.grade) : null;
  const airGradeColor = airData?.grade ? resolveAirQualityGradeColor(airData.grade) : null;
  const showAirQuality = airData && airData.grade !== '정보없음' && airGradeColor;

  return (
    <div className={isNeoBrutalism
      ? 'bg-white border-2 border-black rounded-[5px] p-4 shadow-[3px_3px_0px_0px_#000]'
      : 'bg-white rounded-xl p-4 border border-gray-100'
    }>
      <div className="flex items-stretch gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl leading-none">{icon}</span>
            <div>
              <p className={themeClass('text-xs text-black/50 font-bold uppercase', 'text-xs text-gray-400')}>현재 날씨</p>
              <p className={themeClass('font-black text-black text-base', 'font-semibold text-gray-800 text-base')}>
                {Math.round(data.temperature!)}°C {data.sky ?? ''}
              </p>
            </div>
          </div>
          <div className={themeClass(
            'flex items-center gap-1.5 text-[11px] font-bold text-black/40',
            'flex items-center gap-1.5 text-[11px] text-gray-400'
          )}>
            {data.humidity !== null && <span>습도 {data.humidity}%</span>}
            {data.humidity !== null && data.windSpeed !== null && <span>·</span>}
            {data.windSpeed !== null && <span>바람 {data.windSpeed}m/s</span>}
          </div>
        </div>

        {showAirQuality && (
          <>
            <div className={themeClass('w-[2px] bg-black/10 self-stretch', 'w-px bg-gray-100 self-stretch')} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl leading-none">{airGradeColor.icon}</span>
                <div>
                  <p className={themeClass('text-xs text-black/50 font-bold uppercase', 'text-xs text-gray-400')}>미세먼지</p>
                  <p className={themeClass(
                    `font-black text-base ${isAirQualityBad(airData.grade) ? 'text-red-600' : 'text-black'}`,
                    `font-semibold text-base ${isAirQualityBad(airData.grade) ? 'text-red-600' : 'text-gray-800'}`
                  )}>
                    {airData.grade}
                  </p>
                </div>
              </div>
              <div className={themeClass(
                'flex items-center gap-1.5 text-[11px] font-bold',
                'flex items-center gap-1.5 text-[11px]'
              )}>
                {airData.pm25 !== null && (
                  <span>
                    <span className={themeClass('text-black/40', 'text-gray-400')}>PM2.5 </span>
                    <span className={themeClass(resolvePmColorNeo('pm25', airData.pm25), resolvePmColor('pm25', airData.pm25))}>{airData.pm25}</span>
                  </span>
                )}
                {airData.pm25 !== null && airData.pm10 !== null && <span className={themeClass('text-black/20', 'text-gray-300')}>·</span>}
                {airData.pm10 !== null && (
                  <span>
                    <span className={themeClass('text-black/40', 'text-gray-400')}>PM10 </span>
                    <span className={themeClass(resolvePmColorNeo('pm10', airData.pm10), resolvePmColor('pm10', airData.pm10))}>{airData.pm10}</span>
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {warning && (
        <div className={themeClass(
          'mt-3 pt-3 border-t-2 border-black/10 flex items-center gap-1.5',
          'mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5'
        )}>
          <span className="text-sm">⚠️</span>
          <p className={themeClass(
            'text-xs font-bold text-red-600',
            'text-xs font-medium text-amber-600'
          )}>
            {warning}
          </p>
        </div>
      )}
    </div>
  );
}
