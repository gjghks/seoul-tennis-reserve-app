'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import LoginPrompt from '@/components/auth/LoginPrompt';

interface ReviewFormProps {
  courtId: string;
  courtName: string;
  district: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ courtId, courtName, district, onReviewAdded }: ReviewFormProps) {
  const { user } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (content.length < 10) {
      setError('후기는 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          court_id: courtId,
          court_name: courtName,
          district,
          rating,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '후기 작성에 실패했습니다.');
      }

      setContent('');
      setRating(5);
      onReviewAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : '후기 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarButton = ({ value }: { value: number }) => (
    <button
      type="button"
      onClick={() => setRating(value)}
      className={`text-2xl transition-colors ${
        value <= rating ? 'text-yellow-400' : 'text-gray-300'
      } hover:scale-110`}
      aria-label={`${value}점`}
    >
      ★
    </button>
  );

  if (!user) {
    return (
      <>
        <div className={`p-4 text-center ${
          isNeoBrutalism
            ? 'bg-gray-100 border-2 border-black rounded-[5px]'
            : 'bg-gray-50 rounded-xl'
        }`}>
          <p className={isNeoBrutalism ? 'text-black/70 font-medium' : 'text-gray-500'}>
            후기를 작성하려면{' '}
            <button
              type="button"
              onClick={() => setShowLoginPrompt(true)}
              className={isNeoBrutalism
                ? 'text-[#22c55e] font-bold underline underline-offset-2'
                : 'text-green-600 font-medium hover:underline'
              }
            >
              로그인
            </button>
            이 필요합니다.
          </p>
        </div>
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          message="후기를 작성하려면 로그인해주세요."
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`p-4 ${
      isNeoBrutalism
        ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]'
        : 'bg-white rounded-xl border border-gray-100 shadow-sm'
    }`}>
      <fieldset className="mb-4 border-none p-0 m-0">
        <legend className={`mb-2 ${
          isNeoBrutalism ? 'font-bold text-black' : 'font-medium text-gray-700'
        }`}>
          평점
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <StarButton key={value} value={value} />
          ))}
          <span className={`ml-2 ${isNeoBrutalism ? 'font-bold' : 'text-gray-600'}`}>
            {rating}점
          </span>
        </div>
      </fieldset>

      <div className="mb-4">
        <label htmlFor="review-content" className={`block mb-2 ${
          isNeoBrutalism ? 'font-bold text-black' : 'font-medium text-gray-700'
        }`}>
          후기 내용
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 테니스장에 대한 후기를 작성해주세요. (10자 이상)"
          maxLength={500}
          rows={4}
          className={`w-full p-3 resize-none ${
            isNeoBrutalism
              ? 'border-2 border-black rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2'
              : 'border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
          }`}
        />
        <div className={`text-right text-sm mt-1 ${
          isNeoBrutalism ? 'text-black/60' : 'text-gray-400'
        }`}>
          {content.length}/500
        </div>
      </div>

      {error && (
        <div className={`mb-4 p-3 text-sm ${
          isNeoBrutalism
            ? 'bg-red-100 border-2 border-black rounded-[5px] text-red-700 font-medium'
            : 'bg-red-50 rounded-lg text-red-600'
        }`}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || content.length < 10}
        className={`w-full py-3 font-bold transition-all ${
          isNeoBrutalism
            ? `border-2 border-black rounded-[5px] ${
                isSubmitting || content.length < 10
                  ? 'bg-gray-200 text-black/40 cursor-not-allowed'
                  : 'bg-[#22c55e] text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'
              }`
            : `rounded-lg ${
                isSubmitting || content.length < 10
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`
        }`}
      >
        {isSubmitting ? '등록 중...' : '후기 등록'}
      </button>
    </form>
  );
}
