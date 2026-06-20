'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { DISTRICTS, District } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';
import { useSeason } from '@/contexts/SeasonalContext';
import type { Season } from '@/contexts/SeasonalContext';
import { useThemeClass } from '@/lib/cn';

const SEASON_PALETTE = {
  'default':        { neoAvailBg: 'bg-[#a3e635]', neoAvailText: 'text-[#a3e635]', minHover: 'group-hover:text-green-600',   minDot: 'bg-green-500'   },
  'cherry-blossom': { neoAvailBg: 'bg-[#FFB7C5]', neoAvailText: 'text-[#FFB7C5]', minHover: 'group-hover:text-pink-600',    minDot: 'bg-pink-500'    },
  'tennis-spring':  { neoAvailBg: 'bg-[#A8D49A]', neoAvailText: 'text-[#A8D49A]', minHover: 'group-hover:text-emerald-600', minDot: 'bg-emerald-500' },
  'tennis-autumn':  { neoAvailBg: 'bg-[#FCD34D]', neoAvailText: 'text-[#FCD34D]', minHover: 'group-hover:text-amber-600',   minDot: 'bg-amber-500'   },
  'tennis-summer':  { neoAvailBg: 'bg-[#5EEAD4]', neoAvailText: 'text-[#5EEAD4]', minHover: 'group-hover:text-cyan-600',    minDot: 'bg-cyan-500'    },
  'tennis-winter':  { neoAvailBg: 'bg-[#A8D8F0]', neoAvailText: 'text-[#A8D8F0]', minHover: 'group-hover:text-sky-600',     minDot: 'bg-sky-500'     },
} as const;

interface DistrictStats {
  count: number;
  available: number;
  externalCount: number;
}

interface DistrictGridProps {
  stats?: Record<string, DistrictStats>;
  loading?: boolean;
}

const DistrictCard = memo(function DistrictCard({
  district,
  stats,
  loading,
  isNeoBrutalism,
  season,
  index,
}: {
  district: District;
  stats?: DistrictStats;
  loading?: boolean;
  isNeoBrutalism: boolean;
  season: Season;
  index: number;
}) {
  const available = stats?.available || 0;
  const total = stats?.count || 0;
  const externalCount = stats?.externalCount || 0;
  const hasAvailable = available > 0;
  const isExternalOnly = total > 0 && externalCount === total;
  const tone = SEASON_PALETTE[season] ?? SEASON_PALETTE.default;

  if (isNeoBrutalism) {
    const bgColor = hasAvailable ? tone.neoAvailBg : isExternalOnly ? 'bg-amber-50 dark:bg-amber-950/40' : total > 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-200 dark:bg-slate-700';
    return (
      <Link
        href={`/${district.slug}`}
        className={`
          stagger-item flex items-center px-3 py-[16px] border-2 border-black dark:border-[#f1f3f8] rounded-[5px]
          shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#f1f3f8] sm:shadow-[3px_3px_0px_0px_#000] sm:dark:shadow-[3px_3px_0px_0px_#f1f3f8]
          transition-all duration-150 active:scale-[0.98]
          hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
          sm:hover:translate-x-[3px] sm:hover:translate-y-[3px]
          ${bgColor}
        `}
        style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <h3 className={`font-bold text-sm sm:text-base uppercase tracking-tight truncate ${total === 0 ? 'text-black/60 dark:text-slate-400' : 'text-black dark:text-slate-100'}`}>
            {district.nameKo}
          </h3>
          {loading ? (
            <div className="w-10 h-5 skeleton-neo !border-0 shrink-0" />
          ) : hasAvailable ? (
            <span className="relative shrink-0">
              <span className={`absolute inset-0 ${tone.neoAvailBg} rounded-[3px] animate-pulse opacity-40`} />
              <span className={`relative bg-black ${tone.neoAvailText} px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-[3px] uppercase`}>
                {available}
              </span>
            </span>
          ) : isExternalOnly ? (
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase shrink-0">
              외부예약
            </span>
          ) : total > 0 ? (
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-slate-400 uppercase shrink-0">
              마감
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-bold text-black/60 dark:text-slate-400 uppercase shrink-0">
              -
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${district.slug}`}
      className={`stagger-item card flex items-center px-3 py-[16px] hover:shadow-md transition-all group active:scale-[0.98] ${total === 0 ? 'bg-gray-50 dark:bg-slate-800' : ''}`}
      style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <h3 className={`font-medium text-sm sm:text-base transition-colors truncate ${total === 0 ? 'text-gray-400 dark:text-slate-400' : `text-gray-900 dark:text-slate-100 ${tone.minHover}`}`}>
          {district.nameKo}
        </h3>
        {loading ? (
          <div className="w-10 h-5 skeleton shrink-0" />
        ) : hasAvailable ? (
          <span className="badge badge-available text-[10px] sm:text-xs shrink-0 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${tone.minDot} animate-pulse`} />
            {available}개
          </span>
        ) : isExternalOnly ? (
          <span className="text-[10px] sm:text-xs text-amber-600 shrink-0">
            외부예약
          </span>
        ) : total > 0 ? (
          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-400 shrink-0">
            마감
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs text-gray-300 dark:text-slate-500 shrink-0">
            -
          </span>
        )}
      </div>
    </Link>
  );
});

export default function DistrictGrid({ stats, loading }: DistrictGridProps) {
  const { isNeoBrutalism } = useTheme();
  const { season } = useSeason();
  const themeClass = useThemeClass();
  
  const sortedDistricts = useMemo(() => {
    return [...DISTRICTS].sort((a, b) => {
      const aStats = stats?.[a.nameKo];
      const bStats = stats?.[b.nameKo];
      
      const aAvailable = aStats?.available || 0;
      const bAvailable = bStats?.available || 0;
      const aTotal = aStats?.count || 0;
      const bTotal = bStats?.count || 0;
      const aExternal = aStats?.externalCount || 0;
      const bExternal = bStats?.externalCount || 0;
      
      // 0: 예약 가능, 1: 외부예약만, 2: 마감, 3: 데이터 없음
      const aCategory = aAvailable > 0 ? 0 : aTotal > 0 && aExternal === aTotal ? 1 : aTotal > 0 ? 2 : 3;
      const bCategory = bAvailable > 0 ? 0 : bTotal > 0 && bExternal === bTotal ? 1 : bTotal > 0 ? 2 : 3;
      
      if (aCategory !== bCategory) {
        return aCategory - bCategory;
      }
      
      return a.nameKo.localeCompare(b.nameKo, 'ko');
    });
  }, [stats]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${themeClass('gap-3.5', 'gap-3')}`}
        aria-busy="true"
      >
        <span className="sr-only">지역 목록 로딩 중</span>
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={DISTRICTS[i]?.slug || `skeleton-${i + 1}`}
            className={`h-14 ${
              isNeoBrutalism
                ? 'skeleton-neo'
                : 'skeleton !rounded-lg'
            }`}
            style={{ animationDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${themeClass('gap-3.5', 'gap-3')} `}>
      {sortedDistricts.map((district, index) => (
        <DistrictCard
          key={district.slug}
          district={district}
          stats={stats?.[district.nameKo]}
          loading={false}
          isNeoBrutalism={isNeoBrutalism}
          season={season}
          index={index}
        />
      ))}
    </div>
  );
}
