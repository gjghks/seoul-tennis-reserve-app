'use client';

import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import type { AirQualityData } from '@/lib/airQualityApi';
import { resolveAirQualityGradeColor, isAirQualityBad, resolvePmColorLight, getOverallDustAlert } from '@/lib/airQualityApi';
import type { SeoulDustAlertStatus } from '@/lib/airkoreaApi';

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

const dustAlertFetcher = async (url: string): Promise<SeoulDustAlertStatus> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch dust alert');
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
  temperature: number,
  airGrade?: string,
  dustAlertLevel?: string | null,
  isOfficialAlert?: boolean
): string {
  const isRainOrSnow = sky === '비' || sky === '소나기' || sky === '눈' || sky === '비/눈' || (rainfall ?? 0) > 0;
  const suffix = isOfficialAlert ? ' 발령 중!' : '급!';

  if (isRainOrSnow) return '우천 시 실내 코트를 확인해보세요';
  if (dustAlertLevel === '경보') return `미세먼지 경보${suffix} 야외 활동을 자제하세요`;
  if (dustAlertLevel === '주의보') return `미세먼지 주의보${suffix} 실내 코트를 추천합니다`;
  if (airGrade && isAirQualityBad(airGrade)) return '미세먼지 주의! 실내 코트를 추천합니다';
  if (temperature < 0) return '체감 온도가 낮아요. 방한 준비를 하세요';
  if (temperature > 33) return '무더위 주의! 충분한 수분을 섭취하세요';
  if (sky === '맑음' && temperature >= 5 && temperature <= 30) return '테니스 하기 좋은 날씨예요!';
  return '오늘의 테니스장을 확인해보세요';
}

export default function HomeWeatherCard({ nx, ny }: HomeWeatherCardProps) {
  const themeClass = useThemeClass();

  const { data, isLoading } = useSWR<WeatherResponse>(
    `/api/weather?nx=${nx}&ny=${ny}`,
    weatherFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30 * 60 * 1000,
      dedupingInterval: 30 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  const { data: airData } = useSWR<AirQualityData>(
    '/api/air-quality',
    airFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30 * 60 * 1000,
      dedupingInterval: 30 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  const { data: officialAlert } = useSWR<SeoulDustAlertStatus>(
    '/api/dust-alert',
    dustAlertFetcher,
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
  const dustAlert = airData ? getOverallDustAlert(airData.pm25, airData.pm10) : { level: null, type: null, value: null };
  const isOfficialAlert = officialAlert?.hasAlert === true;
  const message = resolveTennisMessage(data.sky, data.rainfall, data.temperature, airData?.grade, dustAlert.level, isOfficialAlert);
  const isRainOrSnow = data.sky === '비' || data.sky === '소나기' || data.sky === '눈' || data.sky === '비/눈' || (data.rainfall ?? 0) > 0;

  const details: string[] = [];
  if (data.humidity !== null) details.push(`습도 ${data.humidity}%`);
  if (data.windSpeed !== null) details.push(`바람 ${data.windSpeed}m/s`);
  if (isRainOrSnow && data.rainfall !== null) details.push(`강수 ${data.rainfall}mm`);

  const airGradeColor = airData?.grade ? resolveAirQualityGradeColor(airData.grade) : null;

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
          <div className="flex items-center gap-2 mt-0.5">
            <p className={themeClass(
              'text-xs font-bold text-white/70',
              'text-xs text-white/70'
            )}>
              {message}
            </p>
          </div>
        </div>
        {airData && airData.grade !== '정보없음' && airGradeColor && (() => {
          const gradeBg: Record<string, string> = {
            '좋음': 'bg-blue-500/20 border-blue-400/30',
            '보통': 'bg-green-500/20 border-green-400/30',
            '나쁨': 'bg-orange-500/25 border-orange-400/30',
            '매우나쁨': 'bg-red-500/25 border-red-400/30',
          };
          const gradeText: Record<string, string> = {
            '좋음': 'text-blue-300',
            '보통': 'text-green-300',
            '나쁨': 'text-orange-300',
            '매우나쁨': 'text-red-300',
          };
          const bg = gradeBg[airData.grade] ?? 'bg-white/15 border-white/20';
          const txt = gradeText[airData.grade] ?? 'text-white';

          return (
            <div className={themeClass(
              `shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-[5px] border ${bg}`,
              `shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md border ${bg}`
            )}>
              <span className="text-sm leading-none">{airGradeColor.icon}</span>
              <div>
                <span className="text-[10px] text-white/60 block leading-tight">미세먼지</span>
                <span className={themeClass(
                  `text-xs font-black ${txt}`,
                  `text-xs font-semibold ${txt}`
                )}>
                  {airData.grade}
                </span>
                {airData.pm25 !== null && (
                  <span className={`text-[10px] ml-1 ${resolvePmColorLight('pm25', airData.pm25)}`}>
                    PM2.5 {airData.pm25}
                  </span>
                )}
                {dustAlert.level && (
                  <span className={`text-[10px] ml-1 font-bold ${dustAlert.level === '경보' ? 'text-red-300' : 'text-orange-300'}`}>
                    {dustAlert.level}{isOfficialAlert ? ' 발령 중' : '급'}
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
