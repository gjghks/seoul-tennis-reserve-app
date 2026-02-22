'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import type { LocationType } from '@/lib/constants/tennis';
import { rankCourtsByQuery } from '@/lib/utils/courtSearch';
import { splitHighlightSegments } from '@/lib/utils/searchHighlight';
import { buildSearchTelemetry, trackSearchEvent } from '@/lib/utils/searchAnalytics';
import { getSearchExperiment } from '@/lib/utils/searchExperiment';

interface CourtLocationInputProps {
  locationType: LocationType;
  courtId: string | null;
  courtName: string;
  district: string | null;
  onChange: (data: {
    locationType: LocationType;
    courtId: string | null;
    courtName: string;
    district: string | null;
  }) => void;
}

interface CourtItem {
  SVCID: string;
  SVCNM: string;
  AREANM: string;
  PLACENM?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

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

export default function CourtLocationInput({ locationType, courtId, courtName, district, onChange }: CourtLocationInputProps) {
  const themeClass = useThemeClass();
  const searchExperiment = useMemo(() => getSearchExperiment(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const noResultTrackedRef = useRef<string>('');

  useEffect(() => {
    if (isComposing) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchTerm, isComposing]);

  const canSearch = locationType === 'seoul_court' && debouncedSearch.length >= 1;

  const { data: tennisData } = useSWR(
    canSearch ? '/api/tennis' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const filteredCourts: CourtItem[] = useMemo(() => {
    if (!tennisData?.courts) {
      return [];
    }

    if (searchExperiment.variant === 'legacy') {
      const keyword = debouncedSearch.toLowerCase();

      return (tennisData.courts as CourtItem[])
        .filter((court) =>
          court.SVCNM?.toLowerCase().includes(keyword)
          || court.AREANM?.includes(debouncedSearch)
          || court.PLACENM?.toLowerCase().includes(keyword)
        )
        .slice(0, 10);
    }

    return rankCourtsByQuery(tennisData.courts as CourtItem[], debouncedSearch, {
      limit: 10,
      includeDistrict: true,
      profile: searchExperiment.rankingProfile,
    });
  }, [tennisData, debouncedSearch, searchExperiment]);

  useEffect(() => {
    if (!showDropdown || !canSearch || isComposing || filteredCourts.length > 0) {
      return;
    }

    if (debouncedSearch.length < 2 || noResultTrackedRef.current === debouncedSearch) {
      return;
    }

    trackSearchEvent('search_no_results', {
      source: 'records_form',
      ...buildSearchTelemetry(debouncedSearch),
      result_count: 0,
      search_variant: searchExperiment.variant,
      ranking_profile: searchExperiment.rankingProfile,
      algo_version: searchExperiment.algoVersion,
    });
    noResultTrackedRef.current = debouncedSearch;
  }, [showDropdown, canSearch, isComposing, filteredCourts.length, debouncedSearch, searchExperiment]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputClass = themeClass(
    'w-full border-2 border-black rounded-[5px] p-2.5 font-bold text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#88aaee]',
    'w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onChange({ locationType: 'seoul_court', courtId: null, courtName: '', district: null });
            setSearchTerm('');
            setDebouncedSearch('');
            noResultTrackedRef.current = '';
          }}
          className={locationType === 'seoul_court'
            ? themeClass(
                'px-3 py-1.5 border-2 border-black rounded-[5px] font-bold bg-[#a3e635] text-black text-sm',
                'px-3 py-1.5 rounded-lg font-medium bg-green-600 text-white text-sm'
              )
            : themeClass(
                'px-3 py-1.5 border-2 border-black rounded-[5px] font-bold bg-white text-black text-sm',
                'px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 text-sm'
              )
          }
        >
          서울 공공코트
        </button>
        <button
          type="button"
          onClick={() => {
            onChange({ locationType: 'custom', courtId: null, courtName: '', district: null });
            setSearchTerm('');
            setDebouncedSearch('');
            noResultTrackedRef.current = '';
          }}
          className={locationType === 'custom'
            ? themeClass(
                'px-3 py-1.5 border-2 border-black rounded-[5px] font-bold bg-[#a3e635] text-black text-sm',
                'px-3 py-1.5 rounded-lg font-medium bg-green-600 text-white text-sm'
              )
            : themeClass(
                'px-3 py-1.5 border-2 border-black rounded-[5px] font-bold bg-white text-black text-sm',
                'px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 text-sm'
              )
          }
        >
          직접 입력
        </button>
      </div>

      {locationType === 'seoul_court' ? (
        <div className="relative" ref={dropdownRef}>
          {courtId ? (
            <div className={themeClass(
              'flex items-center justify-between border-2 border-black rounded-[5px] p-2.5 bg-[#a3e635]/20',
              'flex items-center justify-between border border-green-200 rounded-lg p-2.5 bg-green-50'
            )}>
              <div>
                <p className={themeClass('font-bold text-black', 'font-medium text-gray-900')}>{courtName}</p>
                {district && <p className={themeClass('text-sm text-black/60', 'text-sm text-gray-500')}>{district}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({ locationType: 'seoul_court', courtId: null, courtName: '', district: null });
                  setSearchTerm('');
                  setDebouncedSearch('');
                  noResultTrackedRef.current = '';
                }}
                className={themeClass('text-black/50 hover:text-red-600 font-bold', 'text-gray-400 hover:text-red-500')}
              >
                변경
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!isComposing && !e.target.value.trim()) {
                    noResultTrackedRef.current = '';
                  }
                }}
                onFocus={() => {
                  setShowDropdown(true);
                  trackSearchEvent('search_open', {
                    source: 'records_form',
                    search_variant: searchExperiment.variant,
                    ranking_profile: searchExperiment.rankingProfile,
                    algo_version: searchExperiment.algoVersion,
                  });
                }}
                onCompositionStart={() => {
                  setIsComposing(true);
                }}
                onCompositionEnd={(event) => {
                  const value = event.currentTarget.value;
                  setIsComposing(false);
                  setSearchTerm(value);
                  setDebouncedSearch(value.trim());
                  setShowDropdown(true);
                }}
                placeholder="코트 이름으로 검색"
                className={inputClass}
              />
              {showDropdown && canSearch && (
                <div className={themeClass(
                  'absolute z-20 w-full mt-1 border-2 border-black rounded-[5px] bg-white shadow-[3px_3px_0px_0px_#000] max-h-48 overflow-y-auto',
                  'absolute z-20 w-full mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto'
                )}>
                  {filteredCourts.length > 0 ? (
                    <ul>
                      {filteredCourts.map((court, index) => (
                        <li key={court.SVCID}>
                          <button
                            type="button"
                            className={themeClass(
                              'w-full text-left px-3 py-2 hover:bg-[#88aaee]/20 font-bold',
                              'w-full text-left px-3 py-2 hover:bg-gray-50'
                            )}
                            onClick={() => {
                              trackSearchEvent('search_select', {
                                source: 'records_form',
                                ...buildSearchTelemetry(debouncedSearch),
                                result_count: filteredCourts.length,
                                selected_rank: index + 1,
                                district: court.AREANM,
                                court_id: court.SVCID,
                                search_variant: searchExperiment.variant,
                                ranking_profile: searchExperiment.rankingProfile,
                                algo_version: searchExperiment.algoVersion,
                              });
                              onChange({
                                locationType: 'seoul_court',
                                courtId: court.SVCID,
                                courtName: court.SVCNM,
                                district: court.AREANM,
                              });
                              setSearchTerm('');
                              setDebouncedSearch('');
                              setShowDropdown(false);
                              noResultTrackedRef.current = '';
                            }}
                          >
                            <span className={themeClass('text-black', 'text-gray-900')}>
                              {renderHighlightedText(
                                court.SVCNM,
                                debouncedSearch,
                                themeClass('rounded bg-[#facc15] px-0.5 text-black', 'rounded bg-green-100 px-0.5 text-green-900')
                              )}
                            </span>
                            <span className={themeClass('text-black/50 text-sm ml-2', 'text-gray-400 text-sm ml-2')}>
                              {renderHighlightedText(
                                court.AREANM,
                                debouncedSearch,
                                themeClass('rounded bg-[#facc15] px-0.5 text-black', 'rounded bg-green-100 px-0.5 text-gray-700')
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={themeClass('px-3 py-2 text-sm font-bold text-black/60', 'px-3 py-2 text-sm text-gray-500')}>
                      검색 결과가 없습니다
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={courtName}
            onChange={e => onChange({ locationType: 'custom', courtId: null, courtName: e.target.value, district })}
            placeholder="코트 이름 입력"
            className={inputClass}
          />
          <input
            type="text"
            value={district || ''}
            onChange={e => onChange({ locationType: 'custom', courtId: null, courtName, district: e.target.value || null })}
            placeholder="지역 (선택사항)"
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
