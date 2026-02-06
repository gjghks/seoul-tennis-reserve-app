'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { DISTRICTS, District } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';

interface DistrictStats {
  count: number;
  available: number;
}

interface DistrictGridProps {
  stats?: Record<string, DistrictStats>;
  loading?: boolean;
}

const DistrictCard = memo(function DistrictCard({
  district,
  stats,
  loading,
  isNeoBrutalism
}: {
  district: District;
  stats?: DistrictStats;
  loading?: boolean;
  isNeoBrutalism: boolean;
}) {
  const available = stats?.available || 0;
  const total = stats?.count || 0;
  const hasAvailable = available > 0;

  if (isNeoBrutalism) {
    const bgColor = hasAvailable ? 'bg-[#a3e635]' : total > 0 ? 'bg-white' : 'bg-gray-200';
    return (
      <Link
        href={`/${district.slug}`}
        className={`
          flex items-center px-3 py-[16px] border-2 border-black rounded-[5px] 
          shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]
          transition-all duration-150 active:scale-[0.98]
          hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
          sm:hover:translate-x-[3px] sm:hover:translate-y-[3px]
          ${bgColor}
        `}
      >
        <div className="w-full flex items-center justify-between gap-2">
          <h3 className={`font-bold text-sm sm:text-base uppercase tracking-tight truncate ${total === 0 ? 'text-black/50' : 'text-black'}`}>
            {district.nameKo}
          </h3>
          {loading ? (
            <div className="w-10 h-5 bg-gray-300 animate-pulse rounded-[3px] shrink-0" />
          ) : hasAvailable ? (
            <span className="bg-black text-[#a3e635] px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black rounded-[3px] uppercase shrink-0">
              {available}
            </span>
          ) : total > 0 ? (
            <span className="text-[10px] sm:text-xs font-bold text-black/50 uppercase shrink-0">
              마감
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-bold text-black/40 uppercase shrink-0">
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
      className={`card flex items-center px-3 py-[16px] hover:shadow-md transition-all group active:scale-[0.98] ${total === 0 ? 'bg-gray-50' : ''}`}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <h3 className={`font-medium text-sm sm:text-base transition-colors truncate ${total === 0 ? 'text-gray-400' : 'text-gray-900 group-hover:text-green-600'}`}>
          {district.nameKo}
        </h3>
        {loading ? (
          <div className="w-10 h-5 skeleton shrink-0" />
        ) : hasAvailable ? (
          <span className="badge badge-available text-[10px] sm:text-xs shrink-0">
            {available}개
          </span>
        ) : total > 0 ? (
          <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">
            마감
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs text-gray-300 shrink-0">
            -
          </span>
        )}
      </div>
    </Link>
  );
});

export default function DistrictGrid({ stats, loading }: DistrictGridProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  
  const sortedDistricts = useMemo(() => {
    return [...DISTRICTS].sort((a, b) => {
      const aStats = stats?.[a.nameKo];
      const bStats = stats?.[b.nameKo];
      
      const aAvailable = aStats?.available || 0;
      const bAvailable = bStats?.available || 0;
      const aTotal = aStats?.count || 0;
      const bTotal = bStats?.count || 0;
      
      const aCategory = aAvailable > 0 ? 0 : aTotal > 0 ? 1 : 2;
      const bCategory = bAvailable > 0 ? 0 : bTotal > 0 ? 1 : 2;
      
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
            className={`h-14 animate-pulse ${
              isNeoBrutalism
                ? 'bg-gray-100 border-2 border-black/20 rounded-[5px]'
                : 'bg-gray-50 rounded-lg'
            }`}
            style={{ animationDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${themeClass('gap-3.5', 'gap-3')} `}>
      {sortedDistricts.map((district) => (
        <DistrictCard
          key={district.slug}
          district={district}
          stats={stats?.[district.nameKo]}
          loading={false}
          isNeoBrutalism={isNeoBrutalism}
        />
      ))}
    </div>
  );
}
