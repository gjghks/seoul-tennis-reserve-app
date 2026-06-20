'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTennisData } from '@/contexts/TennisDataContext';
import { useFavorites, Favorite } from '@/hooks/useFavorites';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { useThemeClass } from '@/lib/cn';
import FavoriteButton from './FavoriteButton';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

interface FavoriteWithStatus extends Favorite {
  status?: string;
  isAvailable?: boolean;
}

export default function FavoriteCourtSection() {
  const { user, loading: authLoading } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { favorites, loading: favLoading } = useFavorites();
  const { courts, isLoading: courtsLoading } = useTennisData();
  const pathname = usePathname();
  const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;

  const favoritesWithStatus = useMemo(() => {
    if (favorites.length === 0) return [];

    const courtMap = new Map(courts.map(court => [court.SVCID, court]));

    const updated: FavoriteWithStatus[] = favorites.map(fav => {
      const court = courtMap.get(fav.svc_id);
      return {
        ...fav,
        status: court?.SVCSTATNM || '정보 없음',
        isAvailable: isCourtAvailable(court?.SVCSTATNM),
      };
    });

    return updated.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });
  }, [favorites, courts]);

  if (authLoading || favLoading) {
    return null;
  }

  if (!user) {
    return (
      <section className="container">
        <div className={`${themeClass('bg-[#fef3c7] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-5', 'bg-amber-50 dark:bg-amber-950/40 rounded-xl p-5 border border-amber-100 dark:border-amber-900/40')} `}>
          <div className="flex items-start gap-4">
            <svg
              className={themeClass('w-12 h-12 shrink-0 mt-0.5', 'w-10 h-10 shrink-0 mt-0.5')}
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              {/* outer heart pulse */}
              <path
                d="M24 42s-18-10.2-18-22.8C6 12.36 11.16 8 17.4 8c3.48 0 5.64 1.8 6.6 3.6C24.96 9.8 27.12 8 30.6 8 36.84 8 42 12.36 42 19.2 42 31.8 24 42 24 42z"
                className={themeClass('fill-[#facc15]/30 stroke-black stroke-[2.5]', 'fill-amber-200/50 stroke-amber-400 stroke-[1.5]')}
                style={{ animation: 'fav-pulse 2s ease-in-out infinite' }}
              />
              {/* inner heart */}
              <path
                d="M24 36s-12-7-12-15.6C12 15.6 15.24 13 18.6 13c2.04 0 3.72 1.08 5.4 3 1.68-1.92 3.36-3 5.4-3C32.76 13 36 15.6 36 20.4 36 29 24 36 24 36z"
                className={themeClass('fill-[#facc15] stroke-black stroke-[2]', 'fill-amber-400 stroke-amber-500 stroke-[1]')}
                style={{ animation: 'fav-beat 2s ease-in-out infinite', transformOrigin: 'center' }}
              />
              {/* sparkle top-right */}
              <circle
                cx="38" cy="12" r="2"
                className={themeClass('fill-black', 'fill-amber-400')}
                style={{ animation: 'fav-sparkle 2s ease-in-out infinite' }}
              />
              {/* sparkle left */}
              <circle
                cx="10" cy="16" r="1.5"
                className={themeClass('fill-black', 'fill-amber-300')}
                style={{ animation: 'fav-sparkle 2s ease-in-out infinite 0.5s' }}
              />
              {/* sparkle bottom-right */}
              <circle
                cx="40" cy="38" r="2.5"
                className={themeClass('fill-black', 'fill-amber-400')}
                style={{ animation: 'fav-sparkle 2s ease-in-out infinite 1s' }}
              />
              {/* star sparkle bottom-left */}
              <path
                d="M8 36 Q8 40 12 40 Q8 40 8 44 Q8 40 4 40 Q8 40 8 36 Z"
                className={themeClass('fill-black', 'fill-amber-300')}
                style={{ animation: 'fav-sparkle 2s ease-in-out infinite 0.3s' }}
              />
            </svg>
            <div>
              <h2 className={`font-bold mb-2 ${themeClass('text-black uppercase', 'text-gray-900 dark:text-slate-100')} `}>
                즐겨찾기 기능
              </h2>
              <p className={`mb-4 ${themeClass('text-sm text-black/80', 'text-sm text-gray-600 dark:text-slate-300')} `}>
                로그인하면 자주 이용하는 테니스장을 즐겨찾기에 추가하고 예약 현황을 빠르게 확인할 수 있어요.
              </p>
              <Link
                href={loginUrl}
                className={`inline-block ${themeClass('bg-black text-[#facc15] font-bold px-4 py-2 rounded-[5px] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all', 'bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors')}`}
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="container">
        <div className={`${themeClass('bg-white border-[3px] border-black dark:border-[#f1f3f8] rounded-[10px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] p-5', 'bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm')} `}>
          <EmptyState
            icon="💚"
            title="내 즐겨찾기"
            description="아직 즐겨찾기한 테니스장이 없습니다. 지역을 선택하고 ♡ 버튼을 눌러 추가해보세요!"
            size="sm"
          />
        </div>
      </section>
    );
  }

  const statusLoading = courtsLoading && courts.length === 0;

  return (
    <section className="container">
      <div className="mb-4">
        <h2 className={`mb-1 ${themeClass('text-lg font-black text-black uppercase tracking-tight', 'text-base font-semibold text-gray-900 dark:text-slate-100')} `}>
          내 즐겨찾기
        </h2>
        <p className={`text-sm ${themeClass('text-black/60 font-medium', 'text-gray-500 dark:text-slate-400')} `}>
          즐겨찾기한 테니스장의 예약 현황
        </p>
      </div>

      {statusLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          <Skeleton variant="card" height={96} />
          <Skeleton variant="card" height={96} />
          <Skeleton variant="card" height={96} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritesWithStatus.map(fav => {
            const districtSlug = KOREAN_TO_SLUG[fav.district] || 'gangnam-gu';
            return (
              <Link
                key={fav.id}
                href={`/${districtSlug}/${fav.svc_id}`}
                className={`block relative ${
                  isNeoBrutalism
                    ? `border-[3px] border-black dark:border-[#f1f3f8] rounded-[10px] p-4 transition-all hover:translate-x-[3px] hover:translate-y-[3px] ${
                        fav.isAvailable
                          ? 'bg-[#a3e635] shadow-[4px_4px_0px_0px_#000] hover:shadow-none'
                          : 'bg-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:shadow-none'
                      }`
                    : `rounded-xl p-4 border transition-all hover:shadow-md ${
                        fav.isAvailable
                          ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/40'
                          : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800'
                      }`
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                    isNeoBrutalism
                      ? fav.isAvailable 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-black'
                      : fav.isAvailable
                        ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300'
                  }`}>
                    {fav.status}
                  </span>
                  <FavoriteButton
                    svcId={fav.svc_id}
                    svcName={fav.svc_name}
                    district={fav.district}
                    placeName={fav.place_name || undefined}
                    className="!p-1 !shadow-none"
                  />
                </div>
                <h3 className={`font-bold mb-1 line-clamp-1 ${themeClass('text-black', 'text-gray-900 dark:text-slate-100')} `}>
                  {fav.svc_name}
                </h3>
                <p className={`text-sm line-clamp-1 ${themeClass('text-black/60', 'text-gray-500 dark:text-slate-400')} `}>
                  {fav.place_name || fav.district}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
