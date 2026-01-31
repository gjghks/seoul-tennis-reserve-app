'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import DistrictGrid from '@/components/district/DistrictGrid';

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
      <section className={isNeoBrutalism ? 'court-pattern-nb text-white py-12 mb-8' : 'court-pattern text-white py-12 mb-8'}>
        <div className="container relative z-10">
          <h1 className={`mb-2 ${isNeoBrutalism ? 'text-3xl md:text-4xl font-black uppercase tracking-tight' : 'text-2xl md:text-3xl font-bold'}`}>
            {isNeoBrutalism ? '🎾 서울 공공 테니스장' : '서울시 공공 테니스장'}
          </h1>
          <p className={isNeoBrutalism ? 'text-white/90 mb-6 font-medium' : 'text-green-100 mb-6'}>
            예약 가능한 테니스장을 찾아보세요
          </p>

          {!loading && !error && (
            <div className={`flex gap-6 ${isNeoBrutalism ? 'bg-black/20 backdrop-blur-sm p-4 rounded-[5px] border-2 border-white/30 inline-flex' : ''}`}>
              <div>
                <div className={`font-bold ${isNeoBrutalism ? 'text-4xl text-[#facc15]' : 'text-3xl'}`}>{totalAvailable}</div>
                <div className={`text-sm ${isNeoBrutalism ? 'text-white/80 font-semibold uppercase tracking-wide' : 'text-green-200'}`}>예약 가능</div>
              </div>
              <div className={isNeoBrutalism ? 'w-[2px] bg-white/40' : 'w-px bg-green-400/30'} />
              <div>
                <div className={`font-bold ${isNeoBrutalism ? 'text-4xl' : 'text-3xl'}`}>{totalCourts}</div>
                <div className={`text-sm ${isNeoBrutalism ? 'text-white/80 font-semibold uppercase tracking-wide' : 'text-green-200'}`}>전체 시설</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container pb-12">
        <div className="mb-6">
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
