'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTennisData } from '@/contexts/TennisDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';

export default function CourtSearch() {
  const router = useRouter();
  const { courts } = useTennisData();
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredCourts = useMemo(() => {
    if (!debouncedQuery) return [];
    const keyword = debouncedQuery.toLowerCase();

    return courts
      .filter((court) => {
        const courtName = court.SVCNM?.toLowerCase() || '';
        const placeName = court.PLACENM?.toLowerCase() || '';
        return courtName.includes(keyword) || placeName.includes(keyword);
      })
      .slice(0, 8);
  }, [courts, debouncedQuery]);

  const hasQuery = debouncedQuery.length > 0;
  const showDropdown = isOpen && query.trim().length > 0;
  const dropdownOffset = isNeoBrutalism ? 'top-[calc(100%+10px)]' : 'top-[calc(100%+8px)]';

  const handleSelectCourt = (districtName: string, serviceId: string) => {
    const districtSlug = KOREAN_TO_SLUG[districtName];
    if (!districtSlug) return;

    setIsOpen(false);
    router.push(`/${districtSlug}/${encodeURIComponent(serviceId)}`);
  };

  return (
    <div ref={wrapperRef} className="relative mt-4 sm:mt-5 max-w-2xl">
      <div
        className={themeClass(
          'flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-3 py-2 shadow-[4px_4px_0px_0px_#000]',
          'flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm'
        )}
      >
        <svg
          className={themeClass('h-5 w-5 shrink-0 text-black', 'h-5 w-5 shrink-0 text-gray-400')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          type="text"
          placeholder="테니스장 검색 (이름, 장소)"
          className={themeClass(
            'w-full bg-white text-black placeholder:text-black/40 font-bold text-sm sm:text-base outline-none',
            'w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm sm:text-base outline-none'
          )}
          aria-label="테니스장 검색"
        />
      </div>

      {showDropdown && (
        <div
          className={`${themeClass(
            'absolute left-0 right-0 z-30 max-h-80 overflow-y-auto rounded-xl border-[3px] border-black bg-white shadow-[5px_5px_0px_0px_#000]',
            'absolute left-0 right-0 z-30 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg'
          )} ${dropdownOffset}`}
        >
          {hasQuery && filteredCourts.length === 0 ? (
            <div className={themeClass('px-4 py-4 text-sm font-bold text-black/70', 'px-4 py-4 text-sm text-gray-500')}>
              검색 결과가 없습니다
            </div>
          ) : (
            filteredCourts.map((court) => {
              const available = isCourtAvailable(court.SVCSTATNM);

              return (
                <button
                  key={`${court.SVCID}-${court.AREANM}`}
                  type="button"
                  onClick={() => handleSelectCourt(court.AREANM, court.SVCID)}
                  className={themeClass(
                    'w-full border-b-2 border-black/10 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#facc15]/30',
                    'w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-green-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={themeClass('truncate text-sm font-black text-black uppercase tracking-tight', 'truncate text-sm font-semibold text-gray-900')}>
                        {court.SVCNM}
                      </p>
                      <p className={themeClass('mt-0.5 truncate text-xs font-medium text-black/60', 'mt-0.5 truncate text-xs text-gray-500')}>
                        {court.AREANM} · {court.PLACENM}
                      </p>
                    </div>
                    <span
                      className={themeClass(
                        available
                          ? 'shrink-0 rounded-md border-2 border-black bg-[#a3e635] px-2 py-1 text-[11px] font-black text-black'
                          : 'shrink-0 rounded-md border-2 border-black bg-gray-200 px-2 py-1 text-[11px] font-black text-black/60',
                        available
                          ? 'shrink-0 rounded-md bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700'
                          : 'shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500'
                      )}
                    >
                      {available ? '접수중' : '마감'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
