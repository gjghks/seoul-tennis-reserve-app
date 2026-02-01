'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites, Favorite } from '@/hooks/useFavorites';
import { SeoulService } from '@/lib/seoulApi';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import FavoriteButton from './FavoriteButton';

interface FavoriteWithStatus extends Favorite {
  status?: string;
  isAvailable?: boolean;
}

export default function FavoriteCourtSection() {
  const { user, loading: authLoading } = useAuth();
  const { isNeoBrutalism } = useTheme();
  const { favorites, loading: favLoading } = useFavorites();
  const [favoritesWithStatus, setFavoritesWithStatus] = useState<FavoriteWithStatus[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) {
      setFavoritesWithStatus([]);
      return;
    }

    const fetchStatuses = async () => {
      setStatusLoading(true);
      try {
        const res = await fetch('/api/tennis');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const courts: SeoulService[] = data.courts || [];

        const courtMap = new Map<string, SeoulService>();
        courts.forEach(court => courtMap.set(court.SVCID, court));

        const updated = favorites.map(fav => {
          const court = courtMap.get(fav.svc_id);
          return {
            ...fav,
            status: court?.SVCSTATNM || '정보 없음',
            isAvailable: court?.SVCSTATNM === '접수중' || court?.SVCSTATNM?.includes('예약가능'),
          };
        });

        updated.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return 0;
        });

        setFavoritesWithStatus(updated);
      } catch (err) {
        console.error('Error fetching court statuses:', err);
        setFavoritesWithStatus(favorites.map(f => ({ ...f, status: '정보 없음' })));
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatuses();
  }, [favorites]);

  if (authLoading || favLoading) {
    return null;
  }

  if (!user) {
    return (
      <section className="container">
        <div className={`${
          isNeoBrutalism 
            ? 'bg-[#fef3c7] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-4 lg:p-3'
            : 'bg-amber-50 rounded-xl p-4 lg:p-3 border border-amber-100'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{isNeoBrutalism ? '⭐' : '💡'}</span>
            <h2 className={`font-bold ${isNeoBrutalism ? 'text-black uppercase' : 'text-gray-900'}`}>
              즐겨찾기 기능
            </h2>
          </div>
          <p className={`mb-4 ${isNeoBrutalism ? 'text-black/80' : 'text-gray-600'}`}>
            로그인하면 자주 이용하는 테니스장을 즐겨찾기에 추가하고 예약 현황을 빠르게 확인할 수 있어요.
          </p>
          <Link
            href="/login"
            className={`inline-block ${
              isNeoBrutalism
                ? 'bg-black text-[#facc15] font-bold px-4 py-2 rounded-[5px] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all'
                : 'bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors'
            }`}
          >
            Google로 로그인하기
          </Link>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="container">
        <div className={`${
          isNeoBrutalism 
            ? 'bg-white border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-4 lg:p-3'
            : 'bg-white rounded-xl p-4 lg:p-3 border border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💚</span>
            <h2 className={`font-bold ${isNeoBrutalism ? 'text-black uppercase' : 'text-gray-900'}`}>
              내 즐겨찾기
            </h2>
          </div>
          <p className={`${isNeoBrutalism ? 'text-black/70' : 'text-gray-500'}`}>
            아직 즐겨찾기한 테니스장이 없습니다. 지역을 선택하고 ♡ 버튼을 눌러 추가해보세요!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="mb-3">
        <h2 className={`mb-0.5 ${isNeoBrutalism ? 'text-lg font-black text-black uppercase tracking-tight' : 'text-base font-semibold text-gray-900'}`}>
          {isNeoBrutalism ? '⭐ 내 즐겨찾기' : '내 즐겨찾기'}
        </h2>
        <p className={`text-xs sm:text-sm ${isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-500'}`}>
          즐겨찾기한 테니스장의 예약 현황
        </p>
      </div>

      {statusLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className={`h-24 animate-pulse ${
                isNeoBrutalism 
                  ? 'bg-gray-100 border-[3px] border-black/30 rounded-[10px]'
                  : 'bg-gray-50 rounded-xl'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favoritesWithStatus.map(fav => {
            const districtSlug = KOREAN_TO_SLUG[fav.district] || 'gangnam-gu';
            return (
              <Link
                key={fav.id}
                href={`/${districtSlug}/${fav.svc_id}`}
                className={`block relative ${
                  isNeoBrutalism
                    ? `border-[3px] border-black rounded-[10px] p-4 transition-all hover:translate-x-[3px] hover:translate-y-[3px] ${
                        fav.isAvailable 
                          ? 'bg-[#a3e635] shadow-[4px_4px_0px_0px_#000] hover:shadow-none' 
                          : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-none'
                      }`
                    : `rounded-xl p-4 border transition-all hover:shadow-md ${
                        fav.isAvailable 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-100'
                      }`
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                    isNeoBrutalism
                      ? fav.isAvailable 
                        ? 'bg-black text-white' 
                        : 'bg-gray-200 text-black'
                      : fav.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {fav.status}
                  </span>
                  <div onClick={e => e.preventDefault()}>
                    <FavoriteButton
                      svcId={fav.svc_id}
                      svcName={fav.svc_name}
                      district={fav.district}
                      placeName={fav.place_name || undefined}
                      className="!p-1 !shadow-none"
                    />
                  </div>
                </div>
                <h3 className={`font-bold mb-1 line-clamp-1 ${
                  isNeoBrutalism ? 'text-black' : 'text-gray-900'
                }`}>
                  {fav.svc_name}
                </h3>
                <p className={`text-sm line-clamp-1 ${
                  isNeoBrutalism ? 'text-black/60' : 'text-gray-500'
                }`}>
                  {fav.place_name || fav.district}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
