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
  return <span className="tracking-[0.08em] text-[#f59e0b]">{'★'.repeat(Math.round(rating))}</span>;
}

export default function PopularCourts() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { data, isLoading } = useSWR<PopularCourtsResponse>('/api/popular-courts', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60 * 1000,
  });

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={`popular-skeleton-${i}`}
            className={themeClass(
              'h-20 animate-pulse rounded-[10px] border-[3px] border-black/20 bg-gray-100',
              'h-20 animate-pulse rounded-xl border border-gray-100 bg-gray-50'
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
          평점, 후기 수, 즐겨찾기 수를 종합한 실시간 랭킹
        </p>
      </div>

      <div className="space-y-3">
      {topCourts.map((court, index) => {
        const rank = index + 1;
        const districtSlug = court.district_slug || KOREAN_TO_SLUG[court.district] || 'gangnam-gu';

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
                  <p className={themeClass('text-sm font-medium text-black/65', 'text-sm text-gray-500')}>
                    {court.district}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className={themeClass('font-bold text-black', 'font-medium text-gray-800')}>
                  <RatingStars rating={court.avg_rating} />
                  <span className="ml-1">{court.avg_rating.toFixed(1)}</span>
                </p>
                <p className={themeClass('text-xs font-medium text-black/65', 'text-xs text-gray-500')}>
                  후기 {court.review_count} · 즐겨찾기 {court.favorite_count}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
      </div>
    </section>
  );
}
