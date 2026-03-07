'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTennisData } from '@/contexts/TennisDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { rankCourtsByQuery } from '@/lib/utils/courtSearch';
import { splitHighlightSegments } from '@/lib/utils/searchHighlight';
import { buildSearchTelemetry, trackSearchEvent } from '@/lib/utils/searchAnalytics';
import { getSearchExperiment } from '@/lib/utils/searchExperiment';
import { useRecentSearches } from '@/lib/hooks/useRecentSearches';

function renderHighlightedText(text: string, query: string, highlightClass: string) {
  const segments = splitHighlightSegments(text, query);

  return segments.map((segment, index) => (
    <span
      key={`${text}-${index}-${segment.matched ? 'm' : 'n'}`}
      className={segment.matched ? highlightClass : undefined}
    >
      {segment.text}
    </span>
  ));
}

export default function CourtSearch() {
  const router = useRouter();
  const { courts } = useTennisData();
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();
  const searchExperiment = useMemo(() => getSearchExperiment(), []);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const noResultTrackedRef = useRef<string>('');

  useEffect(() => {
    if (isComposing) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, isComposing]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
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
    if (searchExperiment.variant === 'legacy') {
      if (!debouncedQuery) {
        return [];
      }

      const keyword = debouncedQuery.toLowerCase();

      return courts
        .filter((court) => {
          const courtName = court.SVCNM?.toLowerCase() || '';
          const placeName = court.PLACENM?.toLowerCase() || '';

          return courtName.includes(keyword) || placeName.includes(keyword);
        })
        .slice(0, 8);
    }

    return rankCourtsByQuery(courts, debouncedQuery, {
      limit: 8,
      includeDistrict: true,
      isAvailable: (court) => isCourtAvailable(court.SVCSTATNM),
      profile: searchExperiment.rankingProfile,
    });
  }, [courts, debouncedQuery, searchExperiment]);

  const hasQuery = debouncedQuery.length > 0;
  const showRecent = isOpen && query.trim().length === 0 && searches.length > 0;
  const showResults = isOpen && query.trim().length > 0;
  const showDropdown = showResults || showRecent;
  const dropdownOffset = isNeoBrutalism ? 'top-[calc(100%+10px)]' : 'top-[calc(100%+8px)]';

  useEffect(() => {
    if (!showDropdown || isComposing || filteredCourts.length > 0) {
      return;
    }

    const normalized = debouncedQuery.trim();
    if (normalized.length < 2) {
      return;
    }

    if (noResultTrackedRef.current === normalized) {
      return;
    }

    trackSearchEvent('search_no_results', {
      source: 'home',
      ...buildSearchTelemetry(normalized),
      result_count: 0,
      search_variant: searchExperiment.variant,
      ranking_profile: searchExperiment.rankingProfile,
      algo_version: searchExperiment.algoVersion,
    });
    noResultTrackedRef.current = normalized;
  }, [showDropdown, isComposing, debouncedQuery, filteredCourts.length, searchExperiment]);

  useEffect(() => {
    if (activeIndex >= 0) {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelectCourt = (districtName: string, serviceId: string) => {
    const districtSlug = KOREAN_TO_SLUG[districtName];
    if (!districtSlug) return;

    if (debouncedQuery.trim()) {
      addSearch(debouncedQuery.trim());
    }

    setIsOpen(false);
    router.push(`/${districtSlug}/${encodeURIComponent(serviceId)}`);
  };

  const handleRecentSearchClick = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    setActiveIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = showResults
      ? filteredCourts.length
      : showRecent
        ? searches.length
        : 0;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!showDropdown) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) => (prev >= totalItems - 1 ? 0 : prev + 1));
    } else if (event.key === 'ArrowUp') {
      if (!showDropdown) return;
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      if (activeIndex < 0 || !showDropdown) return;
      event.preventDefault();
      if (showResults && filteredCourts[activeIndex]) {
        const court = filteredCourts[activeIndex];
        trackSearchEvent('search_select', {
          source: 'home',
          ...buildSearchTelemetry(debouncedQuery),
          result_count: filteredCourts.length,
          selected_rank: activeIndex + 1,
          district: court.AREANM,
          court_id: court.SVCID,
          search_variant: searchExperiment.variant,
          ranking_profile: searchExperiment.rankingProfile,
          algo_version: searchExperiment.algoVersion,
        });
        handleSelectCourt(court.AREANM, court.SVCID);
      } else if (showRecent && searches[activeIndex]) {
        handleRecentSearchClick(searches[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setActiveIndex(-1);
    }
  };

  const activeDescendantId =
    activeIndex >= 0
      ? showResults
        ? `court-option-${activeIndex}`
        : showRecent
          ? `recent-option-${activeIndex}`
          : undefined
      : undefined;

  return (
    <div ref={wrapperRef} className="relative mt-4 sm:mt-5 max-w-2xl">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {showResults && hasQuery && `${filteredCourts.length}개의 검색 결과`}
        {showResults && hasQuery && filteredCourts.length === 0 && '검색 결과 없음'}
      </div>

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
            setActiveIndex(-1);
            setIsOpen(true);
            if (!isComposing && !event.target.value.trim()) {
              noResultTrackedRef.current = '';
            }
          }}
          onFocus={() => {
            trackSearchEvent('search_open', {
              source: 'home',
              search_variant: searchExperiment.variant,
              ranking_profile: searchExperiment.rankingProfile,
              algo_version: searchExperiment.algoVersion,
            });
            setIsOpen(true);
          }}
          onCompositionStart={() => {
            setIsComposing(true);
          }}
          onCompositionEnd={(event) => {
            const value = event.currentTarget.value;
            setIsComposing(false);
            setQuery(value);
            setDebouncedQuery(value.trim());
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="테니스장 검색 (이름, 장소)"
          className={themeClass(
            'w-full bg-white text-black placeholder:text-black/60 font-bold text-sm sm:text-base outline-none',
            'w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm sm:text-base outline-none'
          )}
          aria-label="테니스장 검색"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="court-search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
        />
      </div>

      {showDropdown && (
        <div
          id="court-search-listbox"
          role="listbox"
          aria-label="검색 결과"
          className={`${themeClass(
            'absolute left-0 right-0 z-30 max-h-80 overflow-y-auto rounded-xl border-[3px] border-black bg-white shadow-[5px_5px_0px_0px_#000]',
            'absolute left-0 right-0 z-30 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg'
          )} ${dropdownOffset}`}
        >
          {showResults && hasQuery && filteredCourts.length === 0 ? (
            <div className={themeClass('px-4 py-8 text-center', 'px-4 py-8 text-center')}>
              <svg className={themeClass('w-12 h-12 mx-auto mb-3', 'w-10 h-10 mx-auto mb-3')} viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <g style={{ animation: 'search-drift 4s ease-in-out infinite' }}>
                  <circle cx="28" cy="28" r="16" className={themeClass('fill-[#facc15]/30 stroke-black stroke-[2]', 'fill-gray-100 stroke-gray-300 stroke-[1.5]')} />
                  <circle cx="28" cy="28" r="6" className={themeClass('fill-[#a3e635] stroke-black stroke-[2]', 'fill-green-200 stroke-gray-300 stroke-[1.5]')} />
                  <path d="M26 26 A 5 5 0 0 0 26 30 M30 26 A 5 5 0 0 1 30 30" className={themeClass('stroke-black stroke-[1.5]', 'stroke-gray-300 stroke-[1]')} fill="none" />
                  <line x1="40" y1="40" x2="52" y2="52" className={themeClass('stroke-black stroke-[2.5]', 'stroke-gray-300 stroke-[2]')} strokeLinecap="round" />
                </g>
                <circle cx="52" cy="12" r="2" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0s' }} />
                <circle cx="10" cy="50" r="1.5" className={themeClass('fill-black', 'fill-gray-400')} style={{ animation: 'fav-sparkle 2.5s ease-in-out infinite', animationDelay: '0.5s' }} />
              </svg>
              <p className={themeClass('text-base font-bold text-black mb-1', 'text-base font-medium text-gray-900 mb-1')}>
                &apos;{query}&apos;에 대한 검색 결과가 없습니다
              </p>
              <p className={themeClass('text-sm font-medium text-black/60', 'text-sm text-gray-500')}>
                테니스장 이름이나 장소로 검색해보세요
              </p>
            </div>
          ) : showResults ? (
            <>
              <div className={themeClass('px-4 py-2 border-b-[3px] border-black/15 bg-gray-50/50 text-xs font-bold text-black/60', 'px-4 py-2 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500')}>
                {filteredCourts.length}개의 검색 결과
              </div>
              {filteredCourts.map((court, index) => {
                const available = isCourtAvailable(court.SVCSTATNM);
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${court.SVCID}-${court.AREANM}`}
                    type="button"
                    role="option"
                    id={`court-option-${index}`}
                    aria-selected={isActive}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    onClick={() => {
                      trackSearchEvent('search_select', {
                        source: 'home',
                        ...buildSearchTelemetry(debouncedQuery),
                        result_count: filteredCourts.length,
                        selected_rank: index + 1,
                        district: court.AREANM,
                        court_id: court.SVCID,
                        search_variant: searchExperiment.variant,
                        ranking_profile: searchExperiment.rankingProfile,
                        algo_version: searchExperiment.algoVersion,
                      });
                      handleSelectCourt(court.AREANM, court.SVCID);
                    }}
                    className={themeClass(
                      `w-full border-b-2 border-black/15 px-4 py-3 text-left transition-colors last:border-b-0 ${isActive ? 'bg-[#facc15]/30' : 'hover:bg-[#facc15]/30'}`,
                      `w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 ${isActive ? 'bg-green-50' : 'hover:bg-green-50'}`
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={themeClass('truncate text-sm font-black text-black uppercase tracking-tight', 'truncate text-sm font-semibold text-gray-900')}>
                          {renderHighlightedText(
                            court.SVCNM,
                            debouncedQuery,
                            themeClass('rounded bg-[#facc15] px-0.5 text-black', 'rounded bg-green-100 px-0.5 text-green-900')
                          )}
                        </p>
                        <p className={themeClass('mt-0.5 truncate text-xs font-medium text-black/60', 'mt-0.5 truncate text-xs text-gray-500')}>
                          {renderHighlightedText(
                            court.AREANM,
                            debouncedQuery,
                            themeClass('rounded bg-[#facc15] px-0.5 text-black', 'rounded bg-green-100 px-0.5 text-gray-700')
                          )}
                          {' · '}
                          {renderHighlightedText(
                            court.PLACENM,
                            debouncedQuery,
                            themeClass('rounded bg-[#facc15] px-0.5 text-black', 'rounded bg-green-100 px-0.5 text-gray-700')
                          )}
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
              })}
            </>
          ) : showRecent ? (
            <>
              <div className={themeClass('px-4 py-2 border-b-[3px] border-black bg-gray-100 flex justify-between items-center', 'px-4 py-2 border-b border-gray-100 flex justify-between items-center')}>
                <span className={themeClass('text-xs font-black text-black', 'text-xs font-semibold text-gray-500')}>최근 검색어</span>
              </div>
              <div>
                {searches.map((term, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={term}
                      role="option"
                      id={`recent-option-${index}`}
                      aria-selected={isActive}
                      tabIndex={-1}
                      ref={(el) => { itemRefs.current[index] = el; }}
                      className={themeClass(
                        `w-full flex items-center justify-between border-b-2 border-black/15 px-4 py-3 text-left transition-colors last:border-b-0 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}`,
                        `w-full flex items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`
                      )}
                    >
                      <button
                        type="button"
                        className="flex-1 flex items-center gap-2 text-left"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        {isNeoBrutalism ? (
                          <span>🕐</span>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className={themeClass('text-sm font-bold text-black', 'text-sm text-gray-700')}>{term}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(term);
                        }}
                        className={themeClass(
                          'p-1 text-black/60 hover:text-black hover:bg-black/5 rounded',
                          'p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full'
                        )}
                        aria-label="검색어 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className={themeClass('border-t-[3px] border-black bg-gray-50', 'border-t border-gray-100 bg-gray-50')}>
                <button
                  type="button"
                  onClick={clearAll}
                  className={themeClass(
                    'w-full py-2.5 text-xs font-bold text-black/60 hover:text-black hover:bg-gray-200 transition-colors',
                    'w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors'
                  )}
                >
                  최근 검색어 전체 삭제
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
