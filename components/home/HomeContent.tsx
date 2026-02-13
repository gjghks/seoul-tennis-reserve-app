'use client';

import dynamic from 'next/dynamic';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData, DistrictStats } from '@/contexts/TennisDataContext';
import DistrictGrid from '@/components/district/DistrictGrid';
import AdBanner from '@/components/ads/AdBanner';
import { AD_SLOTS } from '@/lib/adConfig';
import LastUpdated from '@/components/ui/LastUpdated';
import { useThemeClass } from '@/lib/cn';
import { convertToWeatherGrid } from '@/lib/utils/weatherGrid';
import HomeWeatherCard from '@/components/weather/HomeWeatherCard';
import CourtSearch from '@/components/home/CourtSearch';
import DustAlertBanner from '@/components/weather/DustAlertBanner';

const SEOUL_WEATHER_GRID = convertToWeatherGrid(126.978, 37.5665);

const FavoriteCourtSection = dynamic(
  () => import('@/components/favorite/FavoriteCourtSection'),
  { ssr: false }
);

const PopularCourts = dynamic(
  () => import('@/components/home/PopularCourts'),
  { ssr: false }
);

const InstallPrompt = dynamic(
  () => import('@/components/pwa/InstallPrompt'),
  { ssr: false }
);

interface HomeContentProps {
  initialStats?: Record<string, DistrictStats>;
}

export default function HomeContent({ initialStats }: HomeContentProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { stats, isLoading, error, mutate, lastUpdated } = useTennisData();

  const displayStats = stats || initialStats;

  const handleRefresh = async () => {
    await mutate();
  };

  const totalAvailable = displayStats
    ? Object.values(displayStats).reduce((sum, s) => sum + s.available, 0)
    : 0;

  const totalCourts = displayStats
    ? Object.values(displayStats).reduce((sum, s) => sum + s.count, 0)
    : 0;

  const RefreshIndicator = (
    <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  const showLoading = isLoading && !displayStats;

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
      className={`min-h-[var(--main-height)] flex flex-col ${themeClass('bg-nb-bg', '')}`}
    >
      <DustAlertBanner />
      <section className={themeClass('court-pattern-nb text-white py-4 lg:py-3', 'court-pattern text-white py-4 lg:py-3')}>
        <div className="container relative z-10">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h1 className={`${themeClass('text-2xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight', 'text-2xl sm:text-2xl md:text-2xl font-bold')}`}>
                {isNeoBrutalism ? '서울 공공 테니스장' : '서울시 공공 테니스장'}
              </h1>
              <p className={`text-xs sm:text-sm hidden sm:block ${themeClass('text-white/80 font-medium', 'text-green-100')}`}>
                예약 가능한 테니스장을 찾아보세요
              </p>
              {lastUpdated && (
                <LastUpdated 
                  timestamp={lastUpdated} 
                  className={`mt-1 ${themeClass('text-white/60', 'text-green-200/80')}`} 
                />
              )}
            </div>

            {!showLoading && !error && (
              <div className={`flex gap-3 sm:gap-6 md:gap-8 shrink-0 ${themeClass('bg-black/20 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-3 rounded-[5px] border-2 border-white/30', '')}`}>
                <div className="text-center">
                  <div className={`font-bold ${themeClass('text-2xl sm:text-3xl md:text-4xl text-[#facc15]', 'text-2xl sm:text-3xl md:text-4xl')}`}>{totalAvailable}</div>
                  <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${themeClass('text-white/70 font-semibold uppercase', 'text-green-200')}`}>예약 가능</div>
                </div>
                <div className={themeClass('w-[2px] bg-white/30', 'w-px bg-green-400/30')} />
                <div className="text-center">
                  <div className={`font-bold ${themeClass('text-2xl sm:text-3xl md:text-4xl', 'text-2xl sm:text-3xl md:text-4xl')}`}>{totalCourts}</div>
                  <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${themeClass('text-white/70 font-semibold uppercase', 'text-green-200')}`}>전체 시설</div>
                </div>
              </div>
            )}

            {showLoading && (
              <div className={`flex gap-3 sm:gap-6 shrink-0 ${themeClass('bg-black/20 px-3 sm:px-5 py-2 sm:py-3 rounded-[5px] border-2 border-white/30', '')}`}>
                <div className="text-center">
                  <div className="h-7 sm:h-9 w-10 sm:w-14 skeleton-light rounded mb-1" />
                  <div className="h-3 w-10 sm:w-14 skeleton-light rounded" />
                </div>
                <div className={themeClass('w-[2px] bg-white/30', 'w-px bg-green-400/30')} />
                <div className="text-center">
                  <div className="h-7 sm:h-9 w-10 sm:w-14 skeleton-light rounded mb-1" />
                  <div className="h-3 w-10 sm:w-14 skeleton-light rounded" />
                </div>
              </div>
            )}
          </div>
          {SEOUL_WEATHER_GRID && (
            <HomeWeatherCard nx={SEOUL_WEATHER_GRID.nx} ny={SEOUL_WEATHER_GRID.ny} />
          )}
          <CourtSearch />
        </div>
      </section>

      <section className="container pt-4 pb-6 lg:pt-3 lg:pb-4 flex-1 flex flex-col">
        <div className="mb-4 lg:mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <h2 className={themeClass('text-xl font-black text-black uppercase tracking-tight', 'text-lg font-semibold text-gray-900')}>
              지역 선택
            </h2>
          </div>
          <p className={themeClass('text-sm text-black/70 font-medium', 'text-sm text-gray-500')}>
            원하는 지역을 선택하면 해당 지역의 테니스장 목록을 확인할 수 있습니다
          </p>
        </div>

        {error && (
          <div className={themeClass('card-nb p-8 text-center bg-white', 'card p-8 text-center')}>
            <p className={themeClass('text-red-600 font-bold mb-4', 'text-red-500 mb-4')}>데이터를 불러오는데 실패했습니다.</p>
            <button
              type="button"
              onClick={() => mutate()}
              className={themeClass('btn-nb btn-nb-yellow', 'btn btn-secondary')}
            >
              다시 시도
            </button>
          </div>
        )}

        {!error && (
          <DistrictGrid stats={displayStats || undefined} loading={showLoading} />
        )}
      </section>

      {AD_SLOTS.HOME_TOP && (
        <div className="container mb-4">
          <AdBanner adSlot={AD_SLOTS.HOME_TOP} adFormat="horizontal" className="min-h-[90px]" />
        </div>
      )}

      <div className="pt-2 pb-6 lg:pt-1 lg:pb-4">
        <FavoriteCourtSection />
      </div>

      <div className="pb-6 lg:pb-4">
        <PopularCourts />
      </div>

      <div className="container pb-6 lg:pb-4">
        <InstallPrompt />
      </div>

      {AD_SLOTS.HOME_BOTTOM && (
        <div className="container mb-4">
          <AdBanner adSlot={AD_SLOTS.HOME_BOTTOM} adFormat="auto" className="min-h-[250px]" />
        </div>
      )}
    </PullToRefresh>
  );
}
