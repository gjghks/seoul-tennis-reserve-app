'use client';

import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';

interface HomeWeatherCardProps {
  nx: number;
  ny: number;
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

function resolveTennisMessage(
  sky: string | null,
  rainfall: number | null,
  temperature: number
): string {
  const isRainOrSnow = sky === '비' || sky === '소나기' || sky === '눈' || sky === '비/눈' || (rainfall ?? 0) > 0;

  if (isRainOrSnow) return '우천 시 실내 코트를 확인해보세요';
  if (temperature < 0) return '체감 온도가 낮아요. 방한 준비를 하세요';
  if (temperature > 33) return '무더위 주의! 충분한 수분을 섭취하세요';
  if (sky === '맑음' && temperature >= 5 && temperature <= 30) return '테니스 하기 좋은 날씨예요!';
  return '오늘의 테니스장을 확인해보세요';
}

export default function HomeWeatherCard({ nx, ny }: HomeWeatherCardProps) {
  const themeClass = useThemeClass();

  const { data, isLoading } = useSWR<WeatherResponse>(
    `/api/weather?nx=${nx}&ny=${ny}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30 * 60 * 1000,
      dedupingInterval: 30 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  if (isLoading && !data) {
    return (
      <div className="mt-3">
        <div className={themeClass(
          'h-5 w-48 rounded bg-white/20',
          'h-5 w-48 rounded bg-white/20'
        )} />
      </div>
    );
  }

  if (!data || data.temperature === null) return null;

  const icon = resolveIcon(data.sky, data.rainfall);
  const temp = Math.round(data.temperature);
  const message = resolveTennisMessage(data.sky, data.rainfall, data.temperature);
  const isRainOrSnow = data.sky === '비' || data.sky === '소나기' || data.sky === '눈' || data.sky === '비/눈' || (data.rainfall ?? 0) > 0;

  const details: string[] = [];
  if (data.humidity !== null) details.push(`습도 ${data.humidity}%`);
  if (data.windSpeed !== null) details.push(`바람 ${data.windSpeed}m/s`);
  if (isRainOrSnow && data.rainfall !== null) details.push(`강수 ${data.rainfall}mm`);

  return (
    <div className={themeClass(
      'mt-3 bg-black/15 backdrop-blur-sm rounded-[5px] border border-white/20 px-3 py-2.5',
      'mt-3 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-2.5'
    )}>
      <div className="flex items-center gap-2.5">
        <span className="text-xl leading-none shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={themeClass(
              'text-lg font-black text-white',
              'text-lg font-bold text-white'
            )}>
              {temp}°C
            </span>
            {data.sky && (
              <span className="text-sm font-medium text-white/80">
                {data.sky}
              </span>
            )}
            {details.length > 0 && (
              <span className="text-xs text-white/60">
                {details.join(' · ')}
              </span>
            )}
          </div>
          <p className={themeClass(
            'text-xs font-bold text-white/70 mt-0.5',
            'text-xs text-white/70 mt-0.5'
          )}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
