'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';

interface PopularCourt {
  court_id: string;
  court_name: string;
  district: string;
  district_slug: string;
  avg_rating: number;
  review_count: number;
  favorite_count: number;
  score: number;
  popularity_reasons: string[];
}

interface PopularCourtsResponse {
  courts: PopularCourt[];
}

const fetcher = async (url: string): Promise<PopularCourtsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch popular courts');
  }
  return res.json();
};

function getRankLabel(rank: number, isNeoBrutalism: boolean) {
  if (!isNeoBrutalism) {
    return `${rank}`;
  }
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

function RatingStars({ rating }: { rating: number }) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));
  return <span className="tracking-[0.08em] text-[#f59e0b]">{'★'.repeat(stars)}</span>;
}

export default function PopularCourts() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { data, isLoading, error, mutate } = useSWR<PopularCourtsResponse>('/api/popular-courts', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60 * 1000,
    keepPreviousData: true,
  });

  if (error && !data) {
    return (
      <section className="container">
        <div className={themeClass(
          'p-6 text-center bg-white border-2 border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'p-6 text-center bg-white rounded-xl border border-gray-100'
        )}>
          <p className={themeClass('text-black/60 font-bold mb-3', 'text-gray-400 mb-3')}>인기 랭킹을 불러올 수 없습니다</p>
          <button
            type="button"
            onClick={() => mutate()}
            className={themeClass(
              'text-sm font-bold bg-[#facc15] text-black px-4 py-2 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
              'text-sm font-medium text-green-600 hover:text-green-700 px-4 py-2 border border-gray-200 rounded-lg hover:border-green-300 transition-colors'
            )}
          >
            다시 시도
          </button>
        </div>
      </section>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={`popular-skeleton-${i}`}
            className={themeClass(
              'h-20 skeleton-neo !rounded-[10px] !border-[3px]',
              'h-20 skeleton !rounded-xl'
            )}
          />
        ))}
      </div>
    );
  }

  const topCourts = (data?.courts || []).slice(0, 5);

  if (topCourts.length === 0) {
    return null;
  }

  return (
    <section className="container">
      <div className="mb-4">
        <h2 className={themeClass('mb-1 text-lg font-black uppercase tracking-tight text-black', 'mb-1 text-base font-semibold text-gray-900')}>
          인기 테니스장 TOP 5
        </h2>
        <p className={themeClass('text-sm font-medium text-black/60', 'text-sm text-gray-500')}>
          예약 경쟁률, 평점, 즐겨찾기를 종합한 실시간 랭킹
        </p>
      </div>

      <div className="space-y-3">
      {topCourts.map((court, index) => {
        const rank = index + 1;
        const districtSlug = court.district_slug || KOREAN_TO_SLUG[court.district];
        if (!districtSlug) return null;

        return (
          <Link
            key={court.court_id}
            href={`/${districtSlug}/${court.court_id}`}
            className={themeClass(
              'group block rounded-[10px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none',
              'group block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-green-200 hover:bg-green-50/40'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={themeClass(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border-2 border-black bg-[#facc15] text-lg font-black text-black',
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700'
                  )}
                >
                  {getRankLabel(rank, isNeoBrutalism)}
                </div>
                <div className="min-w-0">
                  <p className={themeClass('truncate font-black text-black uppercase tracking-tight', 'truncate font-semibold text-gray-900')}>
                    {court.court_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={themeClass('text-sm font-medium text-black/65', 'text-sm text-gray-500')}>
                      {court.district}
                    </span>
                    {court.popularity_reasons?.slice(0, 2).map((reason) => (
                      <span
                        key={reason}
                        className={themeClass(
                          'inline-block rounded-[3px] border border-black/30 bg-[#facc15]/30 px-1.5 py-0.5 text-[10px] font-bold text-black/70',
                          'inline-block rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700'
                        )}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {court.avg_rating > 0 ? (
                  <p className={themeClass('font-bold text-black', 'font-medium text-gray-800')}>
                    <RatingStars rating={court.avg_rating} />
                    <span className="ml-1">{court.avg_rating.toFixed(1)}</span>
                  </p>
                ) : (
                  <p className={themeClass('text-xs font-bold text-black/40', 'text-xs font-medium text-gray-400')}>
                    평점 없음
                  </p>
                )}
                {(court.review_count > 0 || court.favorite_count > 0) && (
                  <p className={themeClass('text-xs font-medium text-black/65', 'text-xs text-gray-500')}>
                    {court.review_count > 0 && `후기 ${court.review_count}`}
                    {court.review_count > 0 && court.favorite_count > 0 && ' · '}
                    {court.favorite_count > 0 && `즐겨찾기 ${court.favorite_count}`}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
      </div>
    </section>
  );
}
