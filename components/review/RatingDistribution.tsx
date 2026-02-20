'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import type { Review } from './ReviewList';

interface RatingDistributionProps {
  reviews: Review[];
}

export default function RatingDistribution({ reviews }: RatingDistributionProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();

  const distribution = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: reviews.filter((review) => review.rating === score).length,
  }));

  const maxCount = Math.max(...distribution.map((item) => item.count), 0);
  const average = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <section className={themeClass('p-4 border-2 border-black rounded-[5px] bg-gray-50', 'p-4 rounded-xl border border-gray-100 bg-white')}>
      <div className="flex items-center gap-2 mb-4">
        <span className={themeClass('text-4xl font-black text-black', 'text-4xl font-bold text-gray-900')}>
          {average}
        </span>
        <span className={themeClass('text-3xl text-[#facc15]', 'text-3xl text-green-500')} aria-hidden="true">★</span>
        <span className={themeClass('text-sm font-bold text-black/60', 'text-sm text-gray-500')}>
          {reviews.length}개 후기
        </span>
      </div>

      <div className="space-y-2">
        {distribution.map(({ score, count }) => {
          const width = maxCount === 0 ? 0 : (count / maxCount) * 100;

          return (
            <div key={score} className="grid grid-cols-[32px_1fr_24px] items-center gap-2">
              <span className={themeClass('text-xs font-bold text-black', 'text-xs text-gray-600')}>
                {score}★
              </span>
              <div className={themeClass('h-3 border-2 border-black rounded-[5px] bg-white overflow-hidden', 'h-3 rounded-full bg-gray-100 overflow-hidden')}>
                <div
                  className={`h-full transition-all ${isNeoBrutalism ? 'bg-[#facc15] border-r-2 border-black' : 'bg-green-500 rounded-full'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className={themeClass('text-xs font-bold text-black text-right', 'text-xs text-gray-500 text-right')}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
