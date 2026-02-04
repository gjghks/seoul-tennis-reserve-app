'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  user_id: string;
  court_id: string;
  court_name: string;
  district: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  onReviewDeleted: () => void;
}

export default function ReviewList({ reviews, onReviewDeleted }: ReviewListProps) {
  const { isNeoBrutalism } = useTheme();
  const { user } = useAuth();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('후기를 삭제하시겠습니까?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error('삭제 실패');
      }

      onReviewDeleted();
    } catch {
      alert('후기 삭제에 실패했습니다.');
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="sr-only">평점 {rating}점</span>
    </div>
  );

  if (reviews.length === 0) {
    return (
      <div className={`p-8 text-center ${
        isNeoBrutalism
          ? 'bg-gray-100 border-2 border-black rounded-[5px]'
          : 'bg-gray-50 rounded-xl'
      }`}>
        <p className={isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-400'}>
          아직 작성된 후기가 없습니다.
        </p>
        <p className={`mt-1 text-sm ${isNeoBrutalism ? 'text-black/40' : 'text-gray-300'}`}>
          첫 번째 후기를 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className={`p-4 ${
            isNeoBrutalism
              ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
              : 'bg-white rounded-xl border border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={review.rating} />
                <span className={`text-sm ${
                  isNeoBrutalism ? 'text-black/50 font-medium' : 'text-gray-400'
                }`}>
                  {formatDate(review.created_at)}
                </span>
              </div>
              <p className={`whitespace-pre-wrap break-words ${
                isNeoBrutalism ? 'text-black/80' : 'text-gray-700'
              }`}>
                {review.content}
              </p>
            </div>
            {user?.id === review.user_id && (
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                className={`shrink-0 p-2 ${
                  isNeoBrutalism
                    ? 'text-red-500 hover:bg-red-100 rounded-[5px] border border-transparent hover:border-black'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg'
                } transition-colors`}
                aria-label="삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
