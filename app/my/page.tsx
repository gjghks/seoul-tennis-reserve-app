'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { useThemeClass } from '@/lib/cn';

interface Favorite {
  id: string;
  svc_id: string;
  svc_name: string;
  district: string;
  place_name?: string;
  created_at: string;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      setFetchError(false);

      const { data: favData, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(true);
        showToast('즐겨찾기를 불러오는데 실패했습니다.', 'error');
      } else if (favData) {
        setFavorites(favData);
      }

      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, showToast]);

  const handleDeleteFavorite = async (svcId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('svc_id', svcId);

    if (!error) {
      setFavorites(favorites.filter(f => f.svc_id !== svcId));
      showToast('즐겨찾기에서 제거되었습니다', 'info');
    }
  };

  if (authLoading || !user) {
    return (
      <div className={`container mx-auto px-4 py-8 scrollbar-hide ${themeClass('bg-nb-bg min-h-screen', '')}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className={themeClass('text-black font-bold', 'text-gray-400')}>로딩중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', '')}`}>
      <div className="mb-8">
        <h1 className={`text-2xl mb-2 ${themeClass('font-black text-black uppercase', 'font-bold text-gray-900')} `}>
          {isNeoBrutalism ? '👤 마이페이지' : '마이페이지'}
        </h1>
        <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>{user?.email}</p>
      </div>

      <div className="max-w-2xl">
        <h2 className={`text-lg mb-4 flex items-center gap-2 ${themeClass('font-black text-black uppercase', 'font-semibold text-gray-900')} `}>
          {isNeoBrutalism ? '❤️' : (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          즐겨찾기 ({favorites.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((value) => (
              <div key={`skeleton-${value}`} className={`h-20 animate-pulse ${themeClass('bg-white border-2 border-black rounded-[5px]', 'bg-gray-100 rounded-xl')} `} />
            ))}
          </div>
        ) : fetchError ? (
          <div className={`p-8 text-center ${themeClass('bg-white border-2 border-black rounded-[5px]', 'bg-white rounded-2xl border border-gray-100')} `}>
            <p className={`mb-4 ${themeClass('text-red-600 font-bold', 'text-red-500')} `}>
              데이터를 불러오는데 실패했습니다.
            </p>
            <button
              type="button"
              onClick={() => { if (user) { setLoading(true); setFetchError(false); supabase.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => { if (data) setFavorites(data); setLoading(false); }); } }}
              className={themeClass('btn-nb btn-nb-yellow', 'btn btn-secondary')}
            >
              다시 시도
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className={isNeoBrutalism
            ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] py-12 px-6 text-center'
            : 'bg-white rounded-2xl border border-gray-100 py-12 px-6 text-center'
          }>
            <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              isNeoBrutalism 
                ? 'bg-[#f472b6] border-2 border-black rounded-[5px]' 
                : 'bg-pink-50 rounded-full'
            }`}>
            <svg className={`w-8 h-8 ${themeClass('text-black', 'text-pink-400')} `} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className={`text-lg mb-2 ${themeClass('font-black text-black', 'font-semibold text-gray-900')} `}>
              즐겨찾기가 비어있습니다
            </h3>
            <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')} `}>
              자주 가는 테니스장을 즐겨찾기에 추가해보세요!
            </p>
            <Link href="/" className={isNeoBrutalism
              ? 'inline-flex items-center gap-2 bg-[#88aaee] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
              : 'inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700'
            }>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
                    <h3 className={`truncate transition-colors ${themeClass('font-bold text-black hover:text-[#16a34a]', 'font-medium text-gray-900 hover:text-green-600')} `}>
                      {fav.svc_name}
                    </h3>
                    <p className={`text-sm truncate ${themeClass('text-black/60', 'text-gray-500')} `}>
                      {fav.district} {fav.place_name && `· ${fav.place_name}`}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteFavorite(fav.svc_id)}
                    className={`shrink-0 p-2 transition-colors ${themeClass('text-black/50 hover:text-red-600', 'text-gray-400 hover:text-red-500')} `}
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
