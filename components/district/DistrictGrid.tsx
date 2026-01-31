'use client';

import Link from 'next/link';
import { DISTRICTS, District } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';

interface DistrictStats {
  count: number;
  available: number;
}

interface DistrictGridProps {
  stats?: Record<string, DistrictStats>;
  loading?: boolean;
}

function DistrictCard({
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
          p-4 border-2 border-black rounded-[5px] 
          shadow-[4px_4px_0px_0px_#000] 
          transition-all duration-150
          hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none
          ${bgColor}
        `}
      >
        <div className="flex items-center justify-between">
          <h3 className={`font-bold uppercase tracking-tight ${total === 0 ? 'text-black/50' : 'text-black'}`}>
            {district.nameKo}
          </h3>
          {loading ? (
            <div className="w-12 h-5 bg-gray-300 animate-pulse rounded-[3px]" />
          ) : hasAvailable ? (
            <span className="bg-black text-[#a3e635] px-2 py-1 text-xs font-black rounded-[3px] uppercase">
              {available}개
            </span>
          ) : total > 0 ? (
            <span className="text-xs font-bold text-black/50 uppercase">
              마감
            </span>
          ) : (
            <span className="text-xs font-bold text-black/40 uppercase">
              정보없음
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${district.slug}`}
      className={`card p-4 hover:shadow-md transition-all group ${total === 0 ? 'bg-gray-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`font-medium transition-colors ${total === 0 ? 'text-gray-400' : 'text-gray-900 group-hover:text-green-600'}`}>
          {district.nameKo}
        </h3>
        {loading ? (
          <div className="w-12 h-5 skeleton" />
        ) : hasAvailable ? (
          <span className="badge badge-available">
            {available}개 가능
          </span>
        ) : total > 0 ? (
          <span className="text-sm text-gray-400">
            마감
          </span>
        ) : (
          <span className="text-xs text-gray-300">
            정보없음
          </span>
        )}
      </div>
    </Link>
  );
}

export default function DistrictGrid({ stats, loading }: DistrictGridProps) {
  const { isNeoBrutalism } = useTheme();
  
  const sortedDistricts = [...DISTRICTS].sort((a, b) => {
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
    
    if (aCategory === 0) {
      if (bAvailable !== aAvailable) {
        return bAvailable - aAvailable;
      }
    }
    
    return a.nameKo.localeCompare(b.nameKo, 'ko');
  });

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${isNeoBrutalism ? 'gap-4' : 'gap-3'}`}>
      {sortedDistricts.map((district) => (
        <DistrictCard
          key={district.slug}
          district={district}
          stats={stats?.[district.nameKo]}
          loading={loading}
          isNeoBrutalism={isNeoBrutalism}
        />
      ))}
    </div>
  );
}
