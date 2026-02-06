'use client';

import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';

interface WeatherBadgeProps {
  nx: number;
  ny: number;
  isOutdoor?: boolean;
  compact?: boolean;
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
  if (!response.ok) {
    throw new Error('Failed to fetch weather');
  }
  return response.json();
};

function resolveWeatherState(weather: WeatherResponse) {
  const snow = weather.sky === '눈' || weather.sky === '비/눈';
  const rain = weather.sky === '비' || weather.sky === '소나기' || weather.sky === '비/눈' || (weather.rainfall ?? 0) > 0;

  if (snow) {
    return { icon: '❄️', warning: '강설 주의' as const };
  }

  if (rain) {
    return { icon: '🌧️', warning: '우천 주의' as const };
  }

  if (weather.sky === '맑음') {
    return { icon: '☀️', warning: null };
  }

  return { icon: '☁️', warning: null };
}

export default function WeatherBadge({ nx, ny, isOutdoor = false, compact = false }: WeatherBadgeProps) {
  const themeClass = useThemeClass();

  const { data, isLoading } = useSWR<WeatherResponse>(`/api/weather?nx=${nx}&ny=${ny}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
  });

  if (isLoading) {
    if (compact) return null;
    return (
      <div className={themeClass('h-10 w-44 rounded-[5px] border-2 border-black bg-white animate-pulse', 'h-10 w-40 rounded-full border border-gray-200 bg-white animate-pulse')} />
    );
  }

  if (!data) {
    return null;
  }

  const hasWeatherData = [data.temperature, data.humidity, data.rainfall, data.windSpeed].some((value) => value !== null) || data.sky !== null;
  if (!hasWeatherData || data.temperature === null) {
    return null;
  }

  const weatherState = resolveWeatherState(data);
  const hasPrecipitation = weatherState.warning !== null;
  const warningLabel = isOutdoor && hasPrecipitation ? weatherState.warning : null;

  if (compact) {
    return (
      <span className={themeClass(
        'inline-flex items-center gap-1 text-xs font-bold text-black/70',
        'inline-flex items-center gap-1 text-xs text-gray-500'
      )}>
        <span className="text-sm leading-none">{weatherState.icon}</span>
        {Math.round(data.temperature)}°C
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className={themeClass(
          'inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]',
          'inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full'
        )}
      >
        <span className="text-base leading-none">{weatherState.icon}</span>
        <span className={themeClass('text-sm font-black text-black', 'text-sm font-semibold text-gray-800')}>
          {Math.round(data.temperature)}°C
        </span>
        {hasPrecipitation && (
          <span className={themeClass('text-xs font-bold text-black/80', 'text-xs text-gray-500')}>
            강수 {data.rainfall ?? 0}mm
          </span>
        )}
      </div>

      {warningLabel && (
        <span
          className={themeClass(
            'inline-flex items-center px-2.5 py-1 text-xs font-black uppercase bg-[#fef08a] text-black border-2 border-black rounded-[5px]',
            'inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200'
          )}
        >
          {warningLabel}
        </span>
      )}
    </div>
  );
}
