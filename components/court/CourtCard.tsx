'use client';

import Link from 'next/link';
import { SeoulService } from '@/lib/seoulApi';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';

interface CourtCardProps {
  court: SeoulService;
}

export default function CourtCard({ court }: CourtCardProps) {
  const isAvailable = court.SVCSTATNM === '접수중' || court.SVCSTATNM.includes('예약가능');
  const districtSlug = KOREAN_TO_SLUG[court.AREANM] || court.AREANM;
  const courtId = encodeURIComponent(court.SVCID);

  return (
    <Link
      href={`/${districtSlug}/${courtId}`}
      className="card p-4 hover:shadow-md transition-all group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
          {court.SVCNM}
        </h3>
        <span className={`badge shrink-0 ${isAvailable ? 'badge-available' : 'badge-closed'}`}>
          {court.SVCSTATNM}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-sm text-gray-500">
        {court.PLACENM && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{court.PLACENM}</span>
          </div>
        )}

        {(court.V_MIN && court.V_MAX) && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{court.V_MIN} - {court.V_MAX}</span>
          </div>
        )}

        {court.PAYATNM && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{court.PAYATNM}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
