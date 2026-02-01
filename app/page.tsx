'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import DistrictGrid from '@/components/district/DistrictGrid';
import FavoriteCourtSection from '@/components/favorite/FavoriteCourtSection';

interface DistrictStats {
  count: number;
  available: number;
}

interface TennisApiResponse {
  total: number;
  byDistrict: Record<string, DistrictStats>;
}

export default function Home() {
  const { isNeoBrutalism } = useTheme();
  const [stats, setStats] = useState<Record<string, DistrictStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/tennis');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: TennisApiResponse = await res.json();
        setStats(data.byDistrict);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalAvailable = stats
    ? Object.values(stats).reduce((sum, s) => sum + s.available, 0)
    : 0;

  const totalCourts = stats
    ? Object.values(stats).reduce((sum, s) => sum + s.count, 0)
    : 0;

  return (
    <div className={isNeoBrutalism ? 'bg-nb-bg min-h-screen' : ''}>
      <section className={isNeoBrutalism ? 'court-pattern-nb text-white py-6 md:py-8' : 'court-pattern text-white py-6 md:py-8'}>
        <div className="container relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`mb-1 ${isNeoBrutalism ? 'text-2xl md:text-3xl font-black uppercase tracking-tight' : 'text-xl md:text-2xl font-bold'}`}>
                {isNeoBrutalism ? '🎾 서울 공공 테니스장' : '서울시 공공 테니스장'}
              </h1>
              <p className={`text-sm ${isNeoBrutalism ? 'text-white/80 font-medium' : 'text-green-100'}`}>
                예약 가능한 테니스장을 찾아보세요
              </p>
            </div>

            {!loading && !error && (
              <div className={`flex gap-4 sm:gap-6 ${isNeoBrutalism ? 'bg-black/20 backdrop-blur-sm px-4 py-2 rounded-[5px] border-2 border-white/30' : ''}`}>
                <div className="text-center">
                  <div className={`font-bold ${isNeoBrutalism ? 'text-2xl md:text-3xl text-[#facc15]' : 'text-2xl md:text-3xl'}`}>{totalAvailable}</div>
                  <div className={`text-xs ${isNeoBrutalism ? 'text-white/70 font-semibold uppercase' : 'text-green-200'}`}>예약 가능</div>
                </div>
                <div className={isNeoBrutalism ? 'w-[2px] bg-white/30' : 'w-px bg-green-400/30'} />
                <div className="text-center">
                  <div className={`font-bold ${isNeoBrutalism ? 'text-2xl md:text-3xl' : 'text-2xl md:text-3xl'}`}>{totalCourts}</div>
                  <div className={`text-xs ${isNeoBrutalism ? 'text-white/70 font-semibold uppercase' : 'text-green-200'}`}>전체 시설</div>
                </div>
              </div>
            )}

            {loading && (
              <div className={`flex gap-4 ${isNeoBrutalism ? 'bg-black/20 px-4 py-2 rounded-[5px] border-2 border-white/30' : ''}`}>
                <div className="text-center">
                  <div className={`h-7 w-12 ${isNeoBrutalism ? 'bg-white/20' : 'bg-white/10'} rounded animate-pulse mb-1`} />
                  <div className={`h-3 w-14 ${isNeoBrutalism ? 'bg-white/10' : 'bg-white/5'} rounded animate-pulse`} />
                </div>
                <div className={isNeoBrutalism ? 'w-[2px] bg-white/30' : 'w-px bg-green-400/30'} />
                <div className="text-center">
                  <div className={`h-7 w-12 ${isNeoBrutalism ? 'bg-white/20' : 'bg-white/10'} rounded animate-pulse mb-1`} />
                  <div className={`h-3 w-14 ${isNeoBrutalism ? 'bg-white/10' : 'bg-white/5'} rounded animate-pulse`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="py-6">
        <FavoriteCourtSection />
      </div>

      <section className="container pb-16">
        <div className="mb-5">
          <h2 className={`mb-1 ${isNeoBrutalism ? 'text-xl font-black text-black uppercase tracking-tight' : 'text-lg font-semibold text-gray-900'}`}>
            {isNeoBrutalism ? '📍 지역 선택' : '지역 선택'}
          </h2>
          <p className={isNeoBrutalism ? 'text-sm text-black/70 font-medium' : 'text-sm text-gray-500'}>
            원하는 지역을 선택하면 해당 지역의 테니스장 목록을 확인할 수 있습니다
          </p>
        </div>

        {error && (
          <div className={isNeoBrutalism ? 'card-nb p-8 text-center bg-white' : 'card p-8 text-center'}>
            <p className={isNeoBrutalism ? 'text-red-600 font-bold mb-4' : 'text-red-500 mb-4'}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={isNeoBrutalism ? 'btn-nb btn-nb-yellow' : 'btn btn-secondary'}
            >
              다시 시도
            </button>
          </div>
        )}

        {!error && (
          <DistrictGrid stats={stats || undefined} loading={loading} />
        )}
      </section>
    </div>
  );
}
