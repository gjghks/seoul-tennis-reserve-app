'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import type { LocationType } from '@/lib/constants/tennis';

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

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function CourtLocationInput({ locationType, courtId, courtName, district, onChange }: CourtLocationInputProps) {
  const themeClass = useThemeClass();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: tennisData } = useSWR(
    locationType === 'seoul_court' && debouncedSearch.length >= 1 ? '/api/tennis' : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const filteredCourts: CourtItem[] = tennisData?.courts
    ? tennisData.courts.filter((c: CourtItem) =>
        c.SVCNM?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.AREANM?.includes(debouncedSearch) ||
        c.PLACENM?.toLowerCase().includes(debouncedSearch.toLowerCase())
      ).slice(0, 10)
    : [];

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
                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="코트 이름으로 검색"
                className={inputClass}
              />
              {showDropdown && filteredCourts.length > 0 && (
                <ul className={themeClass(
                  'absolute z-20 w-full mt-1 border-2 border-black rounded-[5px] bg-white shadow-[3px_3px_0px_0px_#000] max-h-48 overflow-y-auto',
                  'absolute z-20 w-full mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto'
                )}>
                  {filteredCourts.map(court => (
                    <li key={court.SVCID}>
                      <button
                        type="button"
                        className={themeClass(
                          'w-full text-left px-3 py-2 hover:bg-[#88aaee]/20 font-bold',
                          'w-full text-left px-3 py-2 hover:bg-gray-50'
                        )}
                        onClick={() => {
                          onChange({
                            locationType: 'seoul_court',
                            courtId: court.SVCID,
                            courtName: court.SVCNM,
                            district: court.AREANM,
                          });
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                      >
                        <span className={themeClass('text-black', 'text-gray-900')}>{court.SVCNM}</span>
                        <span className={themeClass('text-black/50 text-sm ml-2', 'text-gray-400 text-sm ml-2')}>{court.AREANM}</span>
                      </button>
                    </li>
                  ))}
                </ul>
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
