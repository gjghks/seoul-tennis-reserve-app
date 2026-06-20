'use client';

import Link from 'next/link';
import { useTennisData } from '@/contexts/TennisDataContext';
import { District } from '@/lib/constants/districts';
import { useThemeClass } from '@/lib/cn';
import CourtDetailClient from './CourtDetailClient';

interface CourtDetailFallbackProps {
  districtSlug: string;
  courtId: string;
  district: District;
}

export default function CourtDetailFallback({ districtSlug, courtId, district }: CourtDetailFallbackProps) {
  const themeClass = useThemeClass();
  const { courts, isLoading, error, mutate } = useTennisData();

  const court = courts.find(c => c.SVCID === courtId);

  if (court) {
    return (
      <CourtDetailClient
        court={court}
        district={district}
        districtSlug={districtSlug}
        allCourts={courts}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className={themeClass('text-black dark:text-slate-100 font-bold', 'text-gray-600 dark:text-slate-400')}>
          테니스장 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  if (error || courts.length === 0) {
    return (
      <div className="container py-12">
        <div className={`max-w-md mx-auto text-center ${themeClass('card-nb p-8 bg-white dark:bg-slate-900', 'card p-8')}`}>
          <p className={`mb-4 ${themeClass('text-red-600 dark:text-red-400 font-bold', 'text-red-500 dark:text-red-400')}`}>
            데이터를 불러오는데 실패했습니다.
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className={themeClass('btn-nb btn-nb-yellow', 'btn btn-secondary')}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className={`max-w-md mx-auto text-center ${themeClass('card-nb p-8 bg-white dark:bg-slate-900', 'card p-8')}`}>
        <p className={`mb-4 ${themeClass('text-black dark:text-slate-100 font-bold', 'text-gray-700 dark:text-slate-200')}`}>
          해당 테니스장을 찾을 수 없습니다.
        </p>
        <Link
          href={`/${districtSlug}`}
          className={themeClass('btn-nb btn-nb-yellow', 'btn btn-secondary')}
        >
          {district.nameKo} 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
