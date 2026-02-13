'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { SeoulService } from '@/lib/seoulApi';
import { KOREAN_TO_SLUG, ADJACENT_DISTRICTS } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';

interface SimilarCourtsProps {
  currentCourtId: string;
  currentPlaceName: string;
  district: string;
  allCourts: SeoulService[];
  isNeoBrutalism: boolean;
}

function getDistrictPriority(courtDistrict: string, currentDistrict: string): number {
  if (courtDistrict === currentDistrict) return 0;
  const adjacent = ADJACENT_DISTRICTS[currentDistrict];
  if (adjacent?.includes(courtDistrict)) return 1;
  return 2;
}

export default function SimilarCourts({
  currentCourtId,
  currentPlaceName,
  district,
  allCourts,
  isNeoBrutalism,
}: SimilarCourtsProps) {
  const adjacentSet = new Set(ADJACENT_DISTRICTS[district] ?? []);
  adjacentSet.add(district);

  const differentFacilities = allCourts
    .filter(court =>
      court.SVCID !== currentCourtId &&
      court.PLACENM !== currentPlaceName &&
      adjacentSet.has(court.AREANM)
    )
    .sort((a, b) => {
      const priorityDiff = getDistrictPriority(a.AREANM, district) - getDistrictPriority(b.AREANM, district);
      if (priorityDiff !== 0) return priorityDiff;

      const aIsAvailable = isCourtAvailable(a.SVCSTATNM);
      const bIsAvailable = isCourtAvailable(b.SVCSTATNM);
      if (aIsAvailable && !bIsAvailable) return -1;
      if (!aIsAvailable && bIsAvailable) return 1;

      return 0;
    });

  const seen = new Set<string>();
  const uniqueFacilities = differentFacilities.filter(court => {
    if (seen.has(court.PLACENM)) return false;
    seen.add(court.PLACENM);
    return true;
  });

  const filteredCourts = uniqueFacilities.slice(0, 4);
  const districtSlug = KOREAN_TO_SLUG[district];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const scrollLeft = el.scrollLeft;
    const gap = 12;
    let closest = 0;
    let minDist = Infinity;

    for (let i = 0; i < children.length; i++) {
      const offset = i * (children[0].offsetWidth + gap);
      const dist = Math.abs(scrollLeft - offset);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (filteredCourts.length === 0) {
    return null;
  }

  return (
    <div className={
      isNeoBrutalism
        ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000] mb-6'
        : 'bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6'
    }>
      <div className={
        isNeoBrutalism
          ? 'p-5 border-b-2 border-black'
          : 'p-5 border-b border-gray-100'
      }>
        <h2 className={`font-bold flex items-center gap-2 ${
          isNeoBrutalism ? 'text-black font-black uppercase tracking-tight' : 'text-gray-900'
        }`}>
          {isNeoBrutalism ? (
            <span className="w-6 h-6 bg-[#facc15] border-2 border-black rounded-[3px] flex items-center justify-center text-xs">🎾</span>
          ) : (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )}
          비슷한 테니스장
        </h2>
        <p className={`text-sm mt-1 ${
          isNeoBrutalism ? 'text-black/50' : 'text-gray-500'
        }`}>
          같은 지역 또는 인근 지역의 다른 테니스장을 확인해보세요
        </p>
      </div>

      <div className="p-5">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
          {filteredCourts.map((court) => {
            const isAvailable = isCourtAvailable(court.SVCSTATNM);
            const isSameDistrict = court.AREANM === district;
            const courtSlug = KOREAN_TO_SLUG[court.AREANM];

            return (
              <Link
                key={court.SVCID}
                href={`/${courtSlug}/${encodeURIComponent(court.SVCID)}`}
                className={`group relative snap-start shrink-0 min-w-[240px] sm:min-w-0 transition-all ${
                  isNeoBrutalism
                    ? 'border-2 border-black rounded-[5px] p-4 bg-white hover:shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                    : 'rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-green-200'
                }`}
              >
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-3 ${
                  isNeoBrutalism
                    ? `border border-black ${isAvailable ? 'bg-[#a3e635] text-black' : 'bg-[#fca5a5] text-black'}`
                    : isAvailable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-50 text-red-600'
                }`}>
                  {court.SVCSTATNM}
                </span>

                <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${
                  isNeoBrutalism ? 'text-black' : 'text-gray-900'
                }`}>
                  {court.SVCNM}
                </h3>

                <p className={`text-xs truncate mb-3 ${
                  isNeoBrutalism ? 'text-black/50' : 'text-gray-500'
                }`}>
                  {court.PLACENM}
                </p>

                <div className={`flex items-center gap-1.5 text-xs flex-wrap ${
                  isNeoBrutalism ? 'text-black/60' : 'text-gray-600'
                }`}>
                  <span className={`px-2 py-0.5 rounded-full ${
                    isNeoBrutalism
                      ? 'bg-white border border-black/20'
                      : 'bg-white border border-gray-200'
                  }`}>
                    {court.PAYATNM}
                  </span>
                  {court.V_MIN && court.V_MAX && (
                    <span className={`px-2 py-0.5 rounded-full ${
                      isNeoBrutalism
                        ? 'bg-white border border-black/20'
                        : 'bg-white border border-gray-200'
                    }`}>
                      {court.V_MIN} - {court.V_MAX}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full ${
                    isSameDistrict
                      ? isNeoBrutalism
                        ? 'bg-white border border-black/20'
                        : 'bg-white border border-gray-200'
                      : isNeoBrutalism
                        ? 'bg-[#facc15]/30 border border-black/20 font-bold'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {isSameDistrict ? '' : '📍 '}{court.AREANM}
                  </span>
                </div>

                <svg
                  className={`absolute bottom-4 right-4 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 ${
                    isNeoBrutalism ? 'text-black' : 'text-green-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>

        {filteredCourts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
            {filteredCourts.map((court, i) => (
              <button
                key={court.SVCID}
                type="button"
                aria-label={`${i + 1}번째 테니스장으로 이동`}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const child = el.children[i] as HTMLElement;
                  if (child) {
                    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
                  }
                }}
                className={`rounded-full transition-all ${
                  i === activeIndex
                    ? `w-5 h-2 ${isNeoBrutalism ? 'bg-black' : 'bg-green-500'}`
                    : `w-2 h-2 ${isNeoBrutalism ? 'bg-black/25' : 'bg-gray-300'}`
                }`}
              />
            ))}
          </div>
        )}

        {districtSlug && (
          <div className={`mt-4 pt-4 text-center ${
            isNeoBrutalism ? 'border-t-2 border-black/10' : 'border-t border-gray-100'
          }`}>
            <Link
              href={`/${districtSlug}`}
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                isNeoBrutalism
                  ? 'text-black hover:underline underline-offset-4 font-bold'
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              같은 지역 테니스장 더보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
