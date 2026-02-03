'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';

interface Favorite {
  id: string;
  svc_id: string;
  svc_name: string;
  district: string;
  place_name?: string;
  created_at: string;
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);

      // 즐겨찾기 조회
      const { data: favData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favData) setFavorites(favData);

      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDeleteFavorite = async (svcId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('svc_id', svcId);

    if (!error) {
      setFavorites(favorites.filter(f => f.svc_id !== svcId));
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className={`container mx-auto px-4 py-8 scrollbar-hide ${isNeoBrutalism ? 'bg-nb-bg min-h-screen' : ''}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={isNeoBrutalism ? 'text-black font-bold' : 'text-gray-400'}>로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen scrollbar-hide ${isNeoBrutalism ? 'bg-nb-bg' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl mb-2 ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-bold text-gray-900'}`}>
          {isNeoBrutalism ? '👤 마이페이지' : '마이페이지'}
        </h1>
        <p className={isNeoBrutalism ? 'text-black/70 font-medium' : 'text-gray-500'}>{user?.email}</p>
      </div>

      <div className="max-w-2xl">
        <h2 className={`text-lg mb-4 flex items-center gap-2 ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-semibold text-gray-900'}`}>
          {isNeoBrutalism ? '❤️' : (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          즐겨찾기 ({favorites.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-20 animate-pulse ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-100 rounded-xl'}`} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className={isNeoBrutalism
            ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] p-6 text-center'
            : 'bg-white rounded-xl border border-gray-200 p-6 text-center'
          }>
            <p className={isNeoBrutalism ? 'text-black/60 font-medium mb-4' : 'text-gray-500 mb-4'}>즐겨찾기한 테니스장이 없습니다.</p>
            <Link href="/" className={isNeoBrutalism
              ? 'inline-block bg-[#88aaee] text-black font-bold px-4 py-2 border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm'
              : 'text-green-600 hover:underline text-sm'
            }>
              테니스장 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map(fav => {
              const districtSlug = KOREAN_TO_SLUG[fav.district] || fav.district;
              return (
                <div
                  key={fav.id}
                  className={isNeoBrutalism
                    ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] p-4 flex items-center justify-between gap-4'
                    : 'bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4'
                  }
                >
                  <Link
                    href={`/${districtSlug}/${encodeURIComponent(fav.svc_id)}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className={`truncate transition-colors ${isNeoBrutalism ? 'font-bold text-black hover:text-[#16a34a]' : 'font-medium text-gray-900 hover:text-green-600'}`}>
                      {fav.svc_name}
                    </h3>
                    <p className={`text-sm truncate ${isNeoBrutalism ? 'text-black/60' : 'text-gray-500'}`}>
                      {fav.district} {fav.place_name && `· ${fav.place_name}`}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteFavorite(fav.svc_id)}
                    className={`shrink-0 p-2 transition-colors ${isNeoBrutalism ? 'text-black/50 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                    aria-label={`${fav.svc_name} 즐겨찾기 삭제`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
