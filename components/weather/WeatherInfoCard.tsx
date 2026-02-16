'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import { useScrollFade } from '@/lib/hooks/useScrollFade';
import type { AirQualityData } from '@/lib/airQualityApi';
import { resolveAirQualityGradeColor, isAirQualityBad, resolvePmColor, resolvePmColorNeo, getOverallDustAlert, getDustAlertColor } from '@/lib/airQualityApi';
import type { SeoulDustAlertStatus } from '@/lib/airkoreaApi';
import type { LivingWeatherData } from '@/lib/livingWeatherApi';

interface WeatherInfoCardProps {
  nx: number;
  ny: number;
  isOutdoor: boolean;
  isNeoBrutalism: boolean;
  district?: string;
  courtLat?: number;
  courtLng?: number;
}

interface WeatherResponse {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
  sky: string | null;
}

interface CityDataWeatherResponse {
  area: string;
  weather: {
    temp: number;
    sensibleTemp: number;
    uvIndex: string;
    uvIndexLevel: string;
    uvMsg: string;
    sunrise: string;
    sunset: string;
    pcpMsg: string;
    forecast24h: { time: string; temp: number; rainChance: number; sky: string; precipitation: string }[];
  } | null;
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

const cityDataFetcher = async (url: string): Promise<CityDataWeatherResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch city data');
  return response.json();
};

const livingWeatherFetcher = async (url: string): Promise<LivingWeatherData> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch living weather');
  return response.json();
};

function resolveIcon(sky: string | null, rainfall: number | null): string {
  if (sky === '눈' || sky === '비/눈') return '❄️';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '🌧️';
  if (sky === '맑음') return '☀️';
  return '☁️';
}

function resolveForecastIcon(sky: string, precipType: string): string {
  if (precipType === '눈' || precipType === '비/눈') return '❄️';
  if (precipType === '비' || precipType === '소나기') return '🌧️';
  if (sky === '맑음') return '☀️';
  if (sky === '구름많음') return '⛅';
  return '☁️';
}

function resolveWarning(
  sky: string | null,
  rainfall: number | null,
  airGrade?: string,
  dustAlertLevel?: string | null,
  isOfficialAlert?: boolean
): string | null {
  const suffix = isOfficialAlert ? ' 발령 중!' : '급!';

  if (sky === '눈' || sky === '비/눈') return '실외 코트 강설 주의';
  if (sky === '비' || sky === '소나기' || (rainfall ?? 0) > 0) return '실외 코트 우천 주의';
  if (dustAlertLevel === '경보') return `미세먼지 경보${suffix} 야외 활동을 자제하세요`;
  if (dustAlertLevel === '주의보') return `미세먼지 주의보${suffix} 실내 코트를 추천합니다`;
  if (airGrade && isAirQualityBad(airGrade)) return '미세먼지 주의! 실내 코트를 추천합니다';
  return null;
}

function resolveUvLabel(value: number): string {
  if (value >= 11) return '위험';
  if (value >= 8) return '매우높음';
  if (value >= 6) return '높음';
  if (value >= 3) return '보통';
  return '낮음';
}

function resolveAirDiffusionColor(level: number) {
  if (level >= 100) return { bg: 'bg-red-50', text: 'text-red-700', bgNeo: 'bg-[#fca5a5]', textNeo: 'text-black', borderNeo: 'border-black', border: 'border-red-200' };
  return { bg: 'bg-orange-50', text: 'text-orange-700', bgNeo: 'bg-[#fed7aa]', textNeo: 'text-black', borderNeo: 'border-black', border: 'border-orange-200' };
}

function resolveUvColor(levelStr: string): { bg: string; text: string; bgNeo: string; textNeo: string } {
  const level = Number.parseInt(levelStr, 10);
  if (level >= 5) return { bg: 'bg-red-100', text: 'text-red-700', bgNeo: 'bg-[#fca5a5]', textNeo: 'text-black' };
  if (level >= 4) return { bg: 'bg-orange-100', text: 'text-orange-700', bgNeo: 'bg-[#facc15]', textNeo: 'text-black' };
  if (level >= 3) return { bg: 'bg-yellow-100', text: 'text-yellow-700', bgNeo: 'bg-[#facc15]', textNeo: 'text-black' };
  return { bg: 'bg-green-100', text: 'text-green-700', bgNeo: 'bg-[#a3e635]', textNeo: 'text-black' };
}

function formatForecastHour(fcstDt: string): string {
  if (fcstDt.length >= 10) {
    return `${fcstDt.slice(8, 10)}시`;
  }
  return fcstDt;
}

export default function WeatherInfoCard({ nx, ny, isOutdoor, isNeoBrutalism, district, courtLat, courtLng }: WeatherInfoCardProps) {
  const themeClass = useThemeClass();
  const [forecastExpanded, setForecastExpanded] = useState(false);
  const { scrollRef: forecastScrollRef, showFade: showForecastFade } = useScrollFade();

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

  const cityDataUrl = (courtLat && courtLng) ? `/api/city-data?lat=${courtLat}&lng=${courtLng}&fields=weather` : null;
  const { data: cityWeather } = useSWR<CityDataWeatherResponse>(cityDataUrl, cityDataFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 10 * 60 * 1000,
    dedupingInterval: 10 * 60 * 1000,
    keepPreviousData: true,
  });

  const livingWeatherUrl = district ? `/api/living-weather?district=${encodeURIComponent(district)}` : null;
  const { data: livingWeather } = useSWR<LivingWeatherData>(livingWeatherUrl, livingWeatherFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 3 * 60 * 60 * 1000,
    dedupingInterval: 3 * 60 * 60 * 1000,
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
  const dustAlert = airData ? getOverallDustAlert(airData.pm25, airData.pm10) : { level: null, type: null, value: null };
  const isOfficialAlert = officialAlert?.hasAlert === true;
  const warning = isOutdoor ? resolveWarning(data.sky, data.rainfall, airData?.grade, dustAlert.level, isOfficialAlert) : null;
  const airGradeColor = airData?.grade ? resolveAirQualityGradeColor(airData.grade) : null;
  const dustAlertColor = dustAlert.level ? getDustAlertColor(dustAlert.level) : null;
  const showAirQuality = airData && airData.grade !== '정보없음' && airGradeColor;

  const uvData = cityWeather?.weather;
  const showUv = isOutdoor && uvData && uvData.uvIndexLevel && uvData.uvIndex;
  const uvLevel = Number.parseInt(uvData?.uvIndexLevel ?? '0', 10);
  const showUvWarning = showUv && uvLevel >= 3;
  const uvColor = showUv ? resolveUvColor(uvData.uvIndexLevel) : null;

  const forecast = uvData?.forecast24h ?? [];
  const hasForecast = forecast.length > 0;

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
            {uvData?.sensibleTemp !== undefined && (
              <>
                <span>·</span>
                <span>체감 {Math.round(uvData.sensibleTemp)}°C</span>
              </>
            )}
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
              {dustAlertColor && dustAlert.level && (
                <div className={themeClass(
                  `mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-black rounded-[3px] border-2 ${dustAlertColor.borderNeo} ${dustAlertColor.bgNeo} ${dustAlertColor.textNeo}`,
                  `mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded border ${dustAlertColor.border} ${dustAlertColor.bg} ${dustAlertColor.text}`
                )}>
                  <span className="text-xs leading-none">{dustAlertColor.icon}</span>
                  <span>{dustAlert.type === 'pm25' ? '초미세먼지' : '미세먼지'} {dustAlert.level}{isOfficialAlert ? ' 발령 중' : '급'}</span>
                </div>
              )}
              {livingWeather?.airDiffusion && livingWeather.airDiffusion.currentLevel !== null && livingWeather.airDiffusion.currentLevel >= 75 && (() => {
                const adColor = resolveAirDiffusionColor(livingWeather.airDiffusion.currentLevel);
                return (
                  <div className={themeClass(
                    `mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-black rounded-[3px] border-2 ${adColor.borderNeo} ${adColor.bgNeo} ${adColor.textNeo}`,
                    `mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded border ${adColor.border} ${adColor.bg} ${adColor.text}`
                  )}>
                    <span className="text-xs leading-none">🌬️</span>
                    <span>대기정체 {livingWeather.airDiffusion.currentLabel}</span>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {showUv && uvColor && (
        <div className={themeClass(
          'mt-3 pt-3 border-t-2 border-black/10 flex items-center gap-2',
          'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2'
        )}>
          <span className="text-sm leading-none">☀️</span>
          <span className={themeClass(
            `inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-black rounded-[3px] border-2 border-black ${uvColor.bgNeo} ${uvColor.textNeo}`,
            `inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold rounded border ${uvColor.bg} ${uvColor.text}`
          )}>
            자외선 {uvData.uvIndex}
          </span>
          {showUvWarning && (
            <p className={themeClass(
              'text-[11px] font-bold text-black/50 flex-1 min-w-0 truncate',
              'text-[11px] text-gray-400 flex-1 min-w-0 truncate'
            )}>
              {uvData.uvMsg.split('.')[0]}
            </p>
          )}
        </div>
      )}

      {isOutdoor && livingWeather?.uv && (livingWeather.uv.todayMax > 0 || livingWeather.uv.tomorrowMax > 0) && (
        <div className={themeClass(
          'mt-3 pt-3 border-t-2 border-black/10 flex items-center gap-2 flex-wrap',
          'mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap'
        )}>
          <span className="text-sm leading-none">☀️</span>
          <span className={themeClass('text-[11px] font-black text-black/50', 'text-[11px] text-gray-400')}>자외선 예보</span>
          {[
            { label: '오늘', value: livingWeather.uv.todayMax },
            { label: '내일', value: livingWeather.uv.tomorrowMax },
            { label: '모레', value: livingWeather.uv.dayAfterMax },
          ].filter(d => d.value > 0).map(d => {
            const color = resolveUvColor(String(d.value));
            return (
              <span
                key={d.label}
                className={themeClass(
                  `inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-black rounded-[3px] border-2 border-black ${color.bgNeo} ${color.textNeo}`,
                  `inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded border ${color.bg} ${color.text}`
                )}
              >
                {d.label} {resolveUvLabel(d.value)}
              </span>
            );
          })}
        </div>
      )}

      {uvData?.sunrise && uvData?.sunset && (
        <div className={themeClass(
          'mt-3 pt-3 border-t-2 border-black/10 flex items-center gap-3',
          'mt-3 pt-3 border-t border-gray-100 flex items-center gap-3'
        )}>
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">🌅</span>
            <span className={themeClass('text-[11px] font-black text-black/50', 'text-[11px] text-gray-400')}>
              {uvData.sunrise}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">🌇</span>
            <span className={themeClass('text-[11px] font-black text-black/50', 'text-[11px] text-gray-400')}>
              {uvData.sunset}
            </span>
          </div>
          {!warning && uvData.pcpMsg && (
            <p className={themeClass(
              'text-[11px] font-bold text-black/40 flex-1 min-w-0 truncate',
              'text-[11px] text-gray-400 flex-1 min-w-0 truncate'
            )}>
              {uvData.pcpMsg}
            </p>
          )}
        </div>
      )}

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

      {hasForecast && (
        <>
          <button
            type="button"
            onClick={() => setForecastExpanded(prev => !prev)}
            className={themeClass(
              'mt-3 pt-3 border-t-2 border-black/10 w-full flex items-center justify-between text-xs font-black text-black/50',
              'mt-3 pt-3 border-t border-gray-100 w-full flex items-center justify-between text-xs text-gray-400'
            )}
          >
            <span>24시간 예보</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${forecastExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {forecastExpanded && (
            <div className="relative mt-2">
              <div ref={forecastScrollRef} className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-1.5 min-w-max pb-1">
                  {forecast.slice(0, 12).map((f) => (
                    <div
                      key={f.time}
                      className={themeClass(
                        'flex flex-col items-center gap-1 px-2.5 py-2 rounded-[5px] border-2 border-black/15 min-w-[52px]',
                        'flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg border border-gray-100 min-w-[52px]'
                      )}
                    >
                      <span className={themeClass('text-[10px] font-black text-black/40', 'text-[10px] text-gray-400')}>
                        {formatForecastHour(f.time)}
                      </span>
                      <span className="text-sm leading-none">
                        {resolveForecastIcon(f.sky, f.precipitation)}
                      </span>
                      <span className={themeClass('text-[11px] font-black text-black', 'text-[11px] font-semibold text-gray-700')}>
                        {f.temp}°
                      </span>
                      {f.rainChance > 0 && (
                        <span className={themeClass('text-[9px] font-bold text-[#3b82f6]', 'text-[9px] text-blue-500')}>
                          {f.rainChance}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {showForecastFade && (
                <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
