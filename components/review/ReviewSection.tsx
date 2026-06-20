'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useThemeClass } from '@/lib/cn';

import ReviewForm from './ReviewForm';
import ReviewList, { Review } from './ReviewList';
import RatingDistribution from './RatingDistribution';
import Skeleton from '@/components/ui/Skeleton';

interface ReviewSectionProps {
  courtId: string;
  courtName: string;
  district: string;
}

export default function ReviewSection({ courtId, courtName, district }: ReviewSectionProps) {
  const themeClass = useThemeClass();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'highest' | 'lowest'>('latest');

  const fetchReviews = useCallback(async () => {
    setFetchError(false);
    try {
      const res = await fetch(`/api/reviews?court_id=${encodeURIComponent(courtId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [courtId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'highest') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sortBy === 'lowest') {
        if (a.rating !== b.rating) return a.rating - b.rating;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reviews, sortBy]);

  return (
    <section className={`${themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] overflow-hidden', 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden')} `}>
      <div className={`p-5 ${themeClass('border-b-2 border-black dark:border-slate-700', 'border-b border-gray-100 dark:border-slate-700')} `}>
        <div className="flex items-center justify-between">
          <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black dark:text-slate-100 uppercase', 'text-gray-900 dark:text-slate-100')} `}>
            <svg className={`w-5 h-5 ${themeClass('text-black dark:text-slate-100', 'text-green-700 dark:text-green-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            이용 후기
          </h2>
          <div className="flex items-center gap-2">
            {averageRating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">★</span>
                <span className={themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100')}>
                  {averageRating}
                </span>
                <span className={`text-sm ${themeClass('text-black/60 dark:text-slate-400', 'text-gray-400 dark:text-slate-500')} `}>
                  ({reviews.length}개)
                </span>
              </div>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'highest' | 'lowest')}
              aria-label="후기 정렬"
              className={themeClass(
                'border-2 border-black dark:border-slate-700 rounded-[5px] font-bold text-xs px-2 py-1 bg-white dark:bg-slate-900 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#22c55e]',
                'border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 px-2.5 py-1.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500'
              )}
            >
              <option value="latest">최신순</option>
              <option value="highest">높은평점순</option>
              <option value="lowest">낮은평점순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <RatingDistribution reviews={reviews} />

        <ReviewForm
          courtId={courtId}
          courtName={courtName}
          district={district}
          onReviewAdded={fetchReviews}
        />

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
            <Skeleton variant="card" height={96} />
          </div>
        ) : fetchError ? (
          <div className={`p-6 text-center ${themeClass('bg-gray-100 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-[5px]', 'bg-gray-50 dark:bg-slate-900 rounded-xl')}`}>
            <p className={`mb-3 ${themeClass('text-black/60 dark:text-slate-400 font-bold', 'text-gray-400 dark:text-slate-500')}`}>후기를 불러올 수 없습니다</p>
            <button
              type="button"
              onClick={() => { setLoading(true); fetchReviews(); }}
              className={themeClass(
                'text-sm font-bold bg-[#facc15] text-black px-4 py-2 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all',
                'text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-700 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-green-300 transition-colors'
              )}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <ReviewList reviews={sortedReviews} onReviewDeleted={fetchReviews} />
        )}
      </div>
    </section>
  );
}
