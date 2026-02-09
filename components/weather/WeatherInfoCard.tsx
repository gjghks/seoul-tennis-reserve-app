'use client';

import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';

interface WeatherInfoCardProps {
  nx: number;
  ny: number;
  isOutdoor: boolean;
  isNeoBrutalism: boolean;
}

interface WeatherResponse {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
  sky: string | null;
}

const fetcher = async (url: string): Promise<WeatherResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather');
  return response.json();
};

function resolveIcon(sky: string | null, rainfall: number | null): string {
  if (sky === '눈' || sky === '비/눈') return '❄️';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '🌧️';
  if (sky === '맑음') return '☀️';
  return '☁️';
}

function resolveWarning(sky: string | null, rainfall: number | null): string | null {
  if (sky === '눈' || sky === '비/눈') return '강설 주의';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '우천 주의';
  return null;
}

export default function WeatherInfoCard({ nx, ny, isOutdoor, isNeoBrutalism }: WeatherInfoCardProps) {
  const themeClass = useThemeClass();

  const { data, isLoading } = useSWR<WeatherResponse>(`/api/weather?nx=${nx}&ny=${ny}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    keepPreviousData: true,
  });

  if (isLoading && !data) {
    return (
      <div className={isNeoBrutalism
        ? 'border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000] skeleton-neo'
        : 'rounded-xl p-4 border border-gray-100 text-center skeleton'
      }>
        <div className={isNeoBrutalism
          ? 'w-10 h-10 bg-[#facc15]/50 border-2 border-black/20 rounded-[5px] mx-auto mb-2'
          : 'w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2'
        } />
        <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
      </div>
    );
  }

  const hasData = data && data.temperature !== null;
  if (!hasData) {
    return (
      <div className={isNeoBrutalism
        ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
        : 'bg-white rounded-xl p-4 border border-gray-100 text-center'
      }>
        <div className={isNeoBrutalism
          ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
          : 'w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2'
        }>
          🌡️
        </div>
        <p className={themeClass('text-xs text-black/60 mb-1 font-bold uppercase', 'text-xs text-gray-400 mb-1')}>날씨</p>
        <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>정보 없음</p>
      </div>
    );
  }

  const icon = resolveIcon(data.sky, data.rainfall);
  const warning = isOutdoor ? resolveWarning(data.sky, data.rainfall) : null;

  return (
    <div className={isNeoBrutalism
      ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
      : 'bg-white rounded-xl p-4 border border-gray-100 text-center'
    }>
      <div className={isNeoBrutalism
        ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
        : 'w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2'
      }>
        {icon}
      </div>
      <p className={themeClass('text-xs text-black/60 mb-1 font-bold uppercase', 'text-xs text-gray-400 mb-1')}>현재 날씨</p>
      <p className={themeClass('font-black text-black text-sm', 'font-semibold text-gray-800 text-sm')}>
        {Math.round(data.temperature!)}°C {data.sky ?? ''}
      </p>
      <div className={themeClass('flex items-center justify-center gap-1.5 mt-1 text-[10px] font-bold text-black/50', 'flex items-center justify-center gap-1.5 mt-1 text-[10px] text-gray-400')}>
        {data.humidity !== null && <span>습도 {data.humidity}%</span>}
        {data.humidity !== null && data.windSpeed !== null && <span>·</span>}
        {data.windSpeed !== null && <span>바람 {data.windSpeed}m/s</span>}
      </div>
      {warning && (
        <p className={themeClass(
          'text-[10px] font-bold text-red-600 mt-1',
          'text-[10px] font-medium text-amber-600 mt-1'
        )}>
          ⚠️ {warning}
        </p>
      )}
    </div>
  );
}
