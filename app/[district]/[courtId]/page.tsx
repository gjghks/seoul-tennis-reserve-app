'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SeoulService } from '@/lib/seoulApi';
import { getDistrictBySlug } from '@/lib/constants/districts';
import { useTheme } from '@/contexts/ThemeContext';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import StickyHeader from '@/components/court-detail/StickyHeader';

const DetailContent = dynamic(() => import('@/components/court-detail/DetailContent'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />,
  ssr: false
});

export default function CourtDetailPage() {
  const params = useParams();
  const { isNeoBrutalism } = useTheme();
  const districtSlug = params.district as string;
  const courtId = decodeURIComponent(params.courtId as string);
  const district = getDistrictBySlug(districtSlug);

  const [court, setCourt] = useState<SeoulService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourt = async () => {
      if (!district) {
        setError('잘못된 지역입니다.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/tennis?district=${districtSlug}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const foundCourt = (data.courts || []).find(
          (c: SeoulService) => c.SVCID === courtId
        );

        if (!foundCourt) {
          setError('테니스장을 찾을 수 없습니다.');
        } else {
          setCourt(foundCourt);
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [districtSlug, courtId, district]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowStickyHeader(headerBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAvailable = court && (court.SVCSTATNM === '접수중' || court.SVCSTATNM.includes('예약가능'));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className={`h-6 w-32 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded'}`} />
            <div className={`h-10 w-3/4 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded'}`} />
            <div className={`h-64 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-2xl'}`} />
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`h-40 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-xl'}`} />
              <div className={`h-40 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px]' : 'bg-gray-200 rounded-xl'}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !court || !district) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
        <div className={`text-center py-12 px-6 ${isNeoBrutalism ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]' : ''}`}>
          <div className={`w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
            isNeoBrutalism 
              ? 'bg-[#fb923c] border-2 border-black rounded-[5px]' 
              : 'bg-red-100 rounded-full'
          }`}>
            <svg className={`w-8 h-8 ${isNeoBrutalism ? 'text-black' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className={`mb-6 ${isNeoBrutalism ? 'text-black font-bold' : 'text-gray-600'}`}>
            {error || '테니스장을 찾을 수 없습니다.'}
          </p>
          <Link
            href={district ? `/${districtSlug}` : '/'}
            className={`inline-flex items-center gap-2 font-medium ${
              isNeoBrutalism 
                ? 'bg-[#88aaee] text-black border-2 border-black rounded-[5px] px-4 py-2 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-bold' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {district ? `${district.nameKo} 목록으로` : '홈으로 돌아가기'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 scrollbar-hide ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
      <StickyHeader 
        court={court} 
        isAvailable={isAvailable || false} 
        isVisible={showStickyHeader}
        isNeoBrutalism={isNeoBrutalism}
      />
      <div ref={headerRef} className={isNeoBrutalism ? 'bg-white border-b-[3px] border-black' : 'bg-white border-b border-gray-100'}>
        <div className="container py-4">
          <nav className={`flex items-center gap-2 text-sm mb-4 ${isNeoBrutalism ? 'font-bold' : ''}`}>
            <Link href="/" className={isNeoBrutalism ? 'text-black hover:underline underline-offset-4' : 'text-gray-400 hover:text-green-600 transition-colors'}>
              홈
            </Link>
            <svg className={`w-4 h-4 ${isNeoBrutalism ? 'text-black' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/${districtSlug}`} className={isNeoBrutalism ? 'text-black hover:underline underline-offset-4' : 'text-gray-400 hover:text-green-600 transition-colors'}>
              {district.nameKo}
            </Link>
            <svg className={`w-4 h-4 ${isNeoBrutalism ? 'text-black' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={`truncate max-w-[180px] ${isNeoBrutalism ? 'text-black/70' : 'text-gray-600'}`}>{court.SVCNM}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold ${
                  isNeoBrutalism
                    ? `border-2 border-black rounded-[5px] ${isAvailable ? 'bg-[#a3e635] text-black font-black' : 'bg-gray-200 text-black/60'}`
                    : `rounded-full ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`
                }`}>
                  {!isNeoBrutalism && <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />}
                  {court.SVCSTATNM}
                </span>
                <span className={`text-sm ${isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-400'}`}>{court.MINCLASSNM}</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl mb-2 break-keep ${isNeoBrutalism ? 'font-black text-black uppercase tracking-tight' : 'font-bold text-gray-900'}`}>
                {isNeoBrutalism ? `🎾 ${court.SVCNM}` : court.SVCNM}
              </h1>
              <p className={`flex items-center gap-2 ${isNeoBrutalism ? 'text-black/70 font-medium' : 'text-gray-500'}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {court.PLACENM}
              </p>
            </div>
            <FavoriteButton
              svcId={court.SVCID}
              svcName={court.SVCNM}
              district={court.AREANM}
              placeName={court.PLACENM}
              showLabel
            />
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="h-3" />
        {court.SVCURL && (
          <a
            href={court.SVCURL}
            target="_blank"
            rel="noopener noreferrer"
            className={isNeoBrutalism
              ? `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[5px] font-black text-lg uppercase tracking-wide mb-8 border-[3px] border-black transition-all ${
                  isAvailable
                    ? 'bg-[#22c55e] text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none'
                    : 'bg-gray-300 text-black/40 cursor-not-allowed'
                }`
              : `w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-8 ${
                  isAvailable
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-green-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`
            }
          >
            {isAvailable ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isNeoBrutalism ? '지금 예약!' : '지금 예약하기'}
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                예약 마감
              </>
            )}
          </a>
        )}

        {court.IMGURL && !imageError && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm">
            <Image
              src={court.IMGURL}
              alt={court.SVCNM}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6`}>
          {[
            { icon: '🕐', label: '운영시간', value: `${court.V_MIN || '00:00'} - ${court.V_MAX || '24:00'}`, color: 'blue' },
            { icon: '💰', label: '이용료', value: court.PAYATNM || '정보 없음', color: 'green' },
            { icon: '📍', label: '지역', value: court.AREANM, color: 'purple' },
            { icon: '👥', label: '이용대상', value: court.USETGTINFO || '누구나', color: 'orange' },
          ].map((item, idx) => (
            <div key={idx} className={isNeoBrutalism
              ? 'bg-white border-2 border-black rounded-[5px] p-4 text-center shadow-[3px_3px_0px_0px_#000]'
              : `bg-white rounded-xl p-4 border border-gray-100 text-center`
            }>
              <div className={isNeoBrutalism
                ? 'w-10 h-10 bg-[#facc15] border-2 border-black rounded-[5px] flex items-center justify-center mx-auto mb-2 text-lg'
                : `w-10 h-10 bg-${item.color}-50 rounded-full flex items-center justify-center mx-auto mb-2`
              }>
                {isNeoBrutalism ? item.icon : (
                  <svg className={`w-5 h-5 text-${item.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className={isNeoBrutalism ? 'text-xs text-black/60 mb-1 font-bold uppercase' : 'text-xs text-gray-400 mb-1'}>{item.label}</p>
              <p className={isNeoBrutalism ? 'font-black text-black text-sm truncate' : 'font-semibold text-gray-800 text-sm truncate'}>{item.value}</p>
            </div>
          ))}
        </div>

        {(court.RCPTBGNDT || court.RCPTENDDT) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-green-800">접수 기간</h3>
            </div>
            <p className="text-green-700 font-medium">
              {formatDate(court.RCPTBGNDT)} ~ {formatDate(court.RCPTENDDT)}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              시설 정보
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {court.PLACENM && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">위치</span>
                <span className="text-gray-900 font-medium text-sm">{court.PLACENM}</span>
              </div>
            )}
            {court.TELNO && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">연락처</span>
                <a href={`tel:${court.TELNO}`} className="text-green-600 font-medium text-sm hover:underline">
                  {court.TELNO}
                </a>
              </div>
            )}
            {(court.SVCOPNBGNDT || court.SVCOPNENDDT) && (
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="text-gray-500 text-sm">서비스 기간</span>
                <span className="text-gray-900 font-medium text-sm">
                  {formatDate(court.SVCOPNBGNDT)} ~ {formatDate(court.SVCOPNENDDT)}
                </span>
              </div>
            )}
          </div>
        </div>

        {court.DTLCONT && <DetailContent content={court.DTLCONT} />}

        <div className="flex gap-3">
          <Link
            href={`/${districtSlug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            목록보기
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로
          </Link>
        </div>
      </div>

      {court.SVCURL && isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 sm:hidden">
          <a
            href={court.SVCURL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            지금 예약하기
          </a>
        </div>
      )}
    </div>
  );
}
