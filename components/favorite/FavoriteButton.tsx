'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import LoginPrompt from '@/components/auth/LoginPrompt';

interface FavoriteButtonProps {
  svcId: string;
  svcName: string;
  district: string;
  placeName?: string;
  className?: string;
  showLabel?: boolean;
}

export default function FavoriteButton({
  svcId,
  svcName,
  district,
  placeName,
  className = '',
  showLabel = false,
}: FavoriteButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 즐겨찾기 상태 확인
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('svc_id', svcId)
        .single();

      setIsFavorite(!!data);
    };

    if (!authLoading) {
      checkFavorite();
    }
  }, [user, svcId, authLoading]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // 즐겨찾기 삭제
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('svc_id', svcId);

        if (!error) {
          setIsFavorite(false);
        }
      } else {
        // 즐겨찾기 추가
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            svc_id: svcId,
            svc_name: svcName,
            district: district,
            place_name: placeName,
          }]);

        if (!error) {
          setIsFavorite(true);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={`w-8 h-8 animate-pulse ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'rounded-lg bg-gray-200'} ${className}`} />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        aria-pressed={isFavorite}
        className={isNeoBrutalism
          ? `flex items-center gap-2 px-3 py-2 border-2 border-black rounded-[5px] transition-all font-bold ${
              isFavorite
                ? 'bg-[#f472b6] text-black shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#f472b6]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'} ${className}`
          : `flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isFavorite
                ? 'bg-pink-50 text-pink-600'
                : 'bg-gray-100 text-gray-500 hover:text-pink-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-50'} ${className}`
        }
      >
        <svg
          className="w-5 h-5"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {showLabel && (
          <span className={`text-sm ${isNeoBrutalism ? 'uppercase' : ''}`}>
            {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
          </span>
        )}
      </button>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="즐겨찾기 기능을 사용하려면 로그인해주세요."
      />
    </>
  );
}
