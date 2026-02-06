'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import ReviewForm from './ReviewForm';
import ReviewList, { Review } from './ReviewList';

interface ReviewSectionProps {
  courtId: string;
  courtName: string;
  district: string;
}

export default function ReviewSection({ courtId, courtName, district }: ReviewSectionProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?court_id=${encodeURIComponent(courtId)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
     } catch {
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

  return (
    <section className={`${themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] overflow-hidden', 'bg-white rounded-2xl border border-gray-100 overflow-hidden')} `}>
      <div className={`p-5 ${themeClass('border-b-2 border-black', 'border-b border-gray-100')} `}>
        <div className="flex items-center justify-between">
          <h2 className={`font-bold flex items-center gap-2 ${themeClass('text-black uppercase', 'text-gray-900')} `}>
            <svg className={`w-5 h-5 ${themeClass('text-black', 'text-green-600')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            이용 후기
          </h2>
          {averageRating && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">★</span>
              <span className={themeClass('font-black text-black', 'font-bold text-gray-900')}>
                {averageRating}
              </span>
              <span className={`text-sm ${themeClass('text-black/50', 'text-gray-400')} `}>
                ({reviews.length}개)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        <ReviewForm
          courtId={courtId}
          courtName={courtName}
          district={district}
          onReviewAdded={fetchReviews}
        />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-pulse h-24 ${
                  isNeoBrutalism
                    ? 'bg-gray-100 border-2 border-black rounded-[5px]'
                    : 'bg-gray-100 rounded-xl'
                }`}
              />
            ))}
          </div>
        ) : (
          <ReviewList reviews={reviews} onReviewDeleted={fetchReviews} />
        )}
      </div>
    </section>
  );
}
