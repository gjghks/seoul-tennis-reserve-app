'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { useThemeClass } from '@/lib/cn';
import { useRecentCourts } from '@/lib/hooks/useRecentCourts';
import AlertSettingsSection from '@/components/alert/AlertSettingsSection';
import TennisProfileSection from '@/components/profile/TennisProfileSection';
import { ProviderBadge } from '@/components/auth/ProviderBadge';

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
  const { recentCourts, clearRecentCourts, isHydrated } = useRecentCourts();
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

  if (authLoading) {
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
        {user && (
          <div className="flex items-center gap-2 flex-wrap">
            <p className={themeClass('text-black/70 font-medium', 'text-gray-500')}>{user.email}</p>
            <ProviderBadge />
          </div>
        )}
      </div>

      <div className="max-w-2xl">
      {isHydrated && recentCourts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg flex items-center gap-2 ${themeClass('font-black text-black uppercase', 'font-semibold text-gray-900')} `}>
              {isNeoBrutalism ? '🕐' : (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              최근 본 코트 ({recentCourts.length})
            </h2>
            <button
              type="button"
              onClick={clearRecentCourts}
              className={`text-sm ${themeClass('font-bold text-black/60 hover:text-red-600', 'text-gray-400 hover:text-red-500')} transition-colors`}
            >
              전체 삭제
            </button>
          </div>
          <div className="space-y-3">
            {recentCourts.map((court) => (
              <div
                key={court.svcId}
                className={isNeoBrutalism
                  ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] p-4 flex items-center justify-between gap-4'
                  : 'bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4'
                }
              >
                <Link
                  href={`/${court.districtSlug}/${encodeURIComponent(court.svcId)}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className={`truncate transition-colors ${themeClass('font-bold text-black hover:text-[#16a34a]', 'font-medium text-gray-900 hover:text-green-600')} `}>
                    {court.svcName}
                  </h3>
                  <p className={`text-sm truncate ${themeClass('text-black/60', 'text-gray-500')} `}>
                    {court.district} {court.placeName && `· ${court.placeName}`}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {isHydrated && recentCourts.length === 0 && !user && (
        <div className={isNeoBrutalism
          ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] py-12 px-6 text-center mb-8'
          : 'bg-white rounded-2xl border border-gray-100 py-12 px-6 text-center mb-8'
        }>
          <svg className={themeClass('w-20 h-20 mx-auto mb-4', 'w-16 h-16 mx-auto mb-4')} viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
              <circle cx="40" cy="40" r="24" className={themeClass('fill-[#bfdbfe] stroke-black stroke-[2.5]', 'fill-blue-100 stroke-blue-400 stroke-[1.5]')} />
              <circle cx="40" cy="40" r="2" className={themeClass('fill-black', 'fill-blue-500')} />
              <line x1="40" y1="40" x2="40" y2="26" className={themeClass('stroke-black stroke-[2.5]', 'stroke-blue-500 stroke-[1.5]')} strokeLinecap="round" />
              <line x1="40" y1="40" x2="52" y2="40" className={themeClass('stroke-black stroke-[2]', 'stroke-blue-400 stroke-[1]')} strokeLinecap="round" style={{ animation: 'clock-tick 3s ease-in-out infinite', transformOrigin: '40px 40px' }} />
            </g>
            <circle cx="16" cy="14" r="2.5" className={themeClass('fill-black', 'fill-blue-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
            <circle cx="68" cy="20" r="2" className={themeClass('fill-black', 'fill-blue-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.7s' }} />
            <path d="M66 60 Q66 64 70 64 Q66 64 66 68 Q66 64 62 64 Q66 64 66 60 Z" className={themeClass('fill-black', 'fill-blue-300')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.4s' }} />
          </svg>
          <h3 className={`text-lg mb-2 ${themeClass('font-black text-black', 'font-semibold text-gray-900')} `}>
            최근 본 코트가 없습니다
          </h3>
          <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')} `}>
            테니스장을 둘러보면 여기에 표시됩니다
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
      )}

      {user && (
        <div className="max-w-2xl">
        <TennisProfileSection />
        <AlertSettingsSection />

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
              <div key={`skeleton-${value}`} className={`h-20 ${themeClass('skeleton-neo', 'skeleton !rounded-xl')} `} />
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
            <svg
              className={themeClass('w-24 h-24 mx-auto mb-4', 'w-20 h-20 mx-auto mb-4')}
              viewBox="0 0 96 96"
              fill="none"
              aria-hidden="true"
            >
              {/* outer heart - pulse */}
              <path
                d="M48 80S12 62 12 36c0-11.4 7.8-18 16.8-18 5.4 0 9.6 2.4 11.4 4.8L48 32l7.8-9.2C57.6 20.4 61.8 18 67.2 18 76.2 18 84 24.6 84 36 84 62 48 80 48 80z"
                className={themeClass('fill-[#f472b6]/30 stroke-black stroke-[2.5]', 'fill-pink-200/40 stroke-pink-300 stroke-[1.5]')}
                style={{ animation: 'fav-pulse 2.5s ease-in-out infinite' }}
              />
              {/* inner heart - beat */}
              <path
                d="M48 70S24 56 24 40c0-7.8 4.8-12 10.2-12 3.6 0 6.6 1.8 8.4 3.6L48 38l5.4-6.4c1.8-1.8 4.8-3.6 8.4-3.6C67.2 28 72 32.2 72 40 72 56 48 70 48 70z"
                className={themeClass('fill-[#f472b6] stroke-black stroke-[2]', 'fill-pink-400 stroke-pink-500 stroke-[1]')}
                style={{ animation: 'fav-beat 2.5s ease-in-out infinite', transformOrigin: 'center' }}
              />
              {/* sparkle top-right */}
              <circle
                cx="76" cy="20" r="3.5"
                className={themeClass('fill-black', 'fill-pink-400')}
                style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite' }}
              />
              {/* sparkle top-left */}
              <circle
                cx="18" cy="28" r="2.5"
                className={themeClass('fill-black', 'fill-pink-300')}
                style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite 0.6s' }}
              />
              {/* sparkle bottom-right */}
              <circle
                cx="80" cy="52" r="2"
                className={themeClass('fill-black', 'fill-pink-300')}
                style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite 1.2s' }}
              />
              {/* star sparkle top */}
              <path
                d="M60 12l1.5 3 3 .5-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3-2.2-2.1 3-.5z"
                className={themeClass('fill-black', 'fill-pink-400')}
                style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite 0.3s' }}
              />
            </svg>
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
                    className={`shrink-0 p-2 transition-colors ${themeClass('text-black/60 hover:text-red-600', 'text-gray-400 hover:text-red-500')} `}
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
      )}

      {!user && (
        <div className={isNeoBrutalism
          ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] py-12 px-6 text-center'
          : 'bg-white rounded-2xl border border-gray-100 py-12 px-6 text-center'
        }>
          <svg className={themeClass('w-20 h-20 mx-auto mb-4', 'w-16 h-16 mx-auto mb-4')} viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <g style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
              {/* lock body */}
              <rect x="24" y="38" width="32" height="24" rx="4" className={themeClass('fill-[#fca5a5] stroke-black stroke-[2.5]', 'fill-red-100 stroke-red-400 stroke-[1.5]')} />
              {/* lock shackle */}
              <path d="M30 38V28a10 10 0 0120 0v10" fill="none" className={themeClass('stroke-black stroke-[2.5]', 'stroke-red-400 stroke-[1.5]')} style={{ animation: 'lock-wiggle 4s ease-in-out infinite', transformOrigin: '40px 38px' }} />
              {/* keyhole */}
              <circle cx="40" cy="48" r="3" className={themeClass('fill-black', 'fill-red-500')} />
              <rect x="39" y="48" width="2" height="6" className={themeClass('fill-black', 'fill-red-500')} />
            </g>
            <circle cx="14" cy="20" r="2.5" className={themeClass('fill-black', 'fill-red-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
            <circle cx="70" cy="24" r="2" className={themeClass('fill-black', 'fill-red-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.8s' }} />
            <path d="M64 66 Q64 70 68 70 Q64 70 64 74 Q64 70 60 70 Q64 70 64 66 Z" className={themeClass('fill-black', 'fill-red-300')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.4s' }} />
          </svg>
          <h3 className={`text-lg mb-2 ${themeClass('font-black text-black', 'font-semibold text-gray-900')} `}>
            로그인이 필요합니다
          </h3>
          <p className={`mb-6 ${themeClass('text-black/60 font-medium', 'text-gray-500')} `}>
            로그인하면 즐겨찾기를 이용할 수 있습니다
          </p>
          <Link href="/" className={isNeoBrutalism
            ? 'inline-flex items-center gap-2 bg-[#88aaee] text-black font-bold px-5 py-2.5 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
            : 'inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700'
          }>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
   );
}
