'use client';

import { useEffect, useState, use } from 'react';
import { SeoulService } from '@/lib/seoulApi';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

interface DistrictPageProps {
  params: Promise<{
    district: string;
  }>;
}

export default function DistrictPage({ params }: DistrictPageProps) {
  const { district } = use(params);
  const { isNeoBrutalism } = useTheme();
  const [courts, setCourts] = useState<SeoulService[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtName, setDistrictName] = useState('');

  useEffect(() => {
    const fetchCourts = async () => {
      const res = await fetch(`/api/tennis?district=${district}`);
      const data = await res.json();

      const sortedCourts = (data.courts || []).sort((a: SeoulService, b: SeoulService) => {
        // 접수중 우선 정렬
        const isAAvailable = a.SVCSTATNM === '접수중';
        const isBAvailable = b.SVCSTATNM === '접수중';
        if (isAAvailable && !isBAvailable) return -1;
        if (!isAAvailable && isBAvailable) return 1;
        return 0;
      });

      setCourts(sortedCourts);
      setDistrictName(data.district || district);
      setLoading(false);
    };

    fetchCourts();
  }, [district]);

  return (
    <div className={`min-h-screen pb-20 ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
      <div className={`sticky top-14 z-40 ${
        isNeoBrutalism 
          ? 'bg-[#88aaee] border-b-[3px] border-black' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className={`text-sm ${
            isNeoBrutalism 
              ? 'text-black font-bold hover:underline underline-offset-4' 
              : 'text-gray-500 hover:text-green-600'
          }`}>
            ← 전체 지역
          </Link>
          <h1 className={`text-lg ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-bold text-gray-900'}`}>
            {isNeoBrutalism ? `🎾 ${districtName}` : `${districtName} 테니스장`}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="container pt-8 pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-32 animate-pulse ${
                isNeoBrutalism 
                  ? 'bg-white border-2 border-black rounded-[5px]' 
                  : 'bg-gray-200 rounded-xl'
              }`} />
            ))}
          </div>
        ) : courts.length === 0 ? (
          <div className={`text-center py-20 ${
            isNeoBrutalism 
              ? 'text-black font-bold' 
              : 'text-gray-500'
          }`}>
            {isNeoBrutalism ? '😢 ' : ''}이 지역에는 등록된 공공 테니스장 정보가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4">
            {courts.map((court) => {
              const isAvailable = court.SVCSTATNM === '접수중';
              
              if (isNeoBrutalism) {
                return (
                  <div
                    key={court.SVCID}
                    className={`p-5 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] transition-all ${
                      isAvailable ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link
                        href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                        className="flex-1 group"
                      >
                        <h3 className="text-lg font-black text-black group-hover:text-[#16a34a] uppercase tracking-tight">
                          {court.SVCNM}
                        </h3>
                        <p className="text-sm text-black/70 mt-1 font-medium">{court.PLACENM}</p>
                      </Link>
                      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black rounded-[3px] ${
                        isAvailable ? 'bg-[#a3e635] text-black' : 'bg-gray-300 text-black/50'
                      }`}>
                        {court.SVCSTATNM}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="bg-[#facc15] text-black px-2 py-1 border-2 border-black rounded-[3px]">
                          {court.PAYATNM}
                        </span>
                        <span className="bg-[#22d3ee] text-black px-2 py-1 border-2 border-black rounded-[3px]">
                          {court.V_MIN}~{court.V_MAX}
                        </span>
                      </div>
                      {isAvailable && court.SVCURL && (
                        <a
                          href={court.SVCURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#22c55e] text-black font-black text-sm py-2 px-4 border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase"
                          onClick={(e) => e.stopPropagation()}
                        >
                          예약하기
                        </a>
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <div
                  key={court.SVCID}
                  className="card p-5 bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/${district}/${encodeURIComponent(court.SVCID)}`}
                      className="flex-1 group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700">
                        {court.SVCNM}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{court.PLACENM}</p>
                    </Link>
                    <span className={`badge ${isAvailable ? 'badge-available' : 'badge-closed'}`}>
                      {court.SVCSTATNM}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {court.PAYATNM}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {court.V_MIN}~{court.V_MAX}
                      </span>
                    </div>
                    {isAvailable && court.SVCURL && (
                      <a
                        href={court.SVCURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-sm py-2 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        바로 예약
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
