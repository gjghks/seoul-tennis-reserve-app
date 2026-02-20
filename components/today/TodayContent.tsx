'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass } from '@/lib/cn';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import type { SeoulService } from '@/lib/seoulApi';
import Spinner from '@/components/ui/Spinner';
import { useState } from 'react';

interface TodayContentProps {
  courts: Record<string, SeoulService[]>;
  totalAvailable: number;
  totalDistricts: number;
}

export default function TodayContent({
  courts,
  totalAvailable,
  totalDistricts,
}: TodayContentProps) {
  const themeClass = useThemeClass();
  const router = useRouter();
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
    new Set(Object.keys(courts).slice(0, 3))
  );

  const handleRefresh = async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const toggleDistrict = (district: string) => {
    const newExpanded = new Set(expandedDistricts);
    if (newExpanded.has(district)) {
      newExpanded.delete(district);
    } else {
      newExpanded.add(district);
    }
    setExpandedDistricts(newExpanded);
  };

  const now = new Date();
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const sortedDistricts = Object.keys(courts).sort();

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <Spinner size="md" className="mr-2" />
          <span>새로고침 중...</span>
        </div>
      }
    >
    <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50')}`}>
      <section className={themeClass('court-pattern-nb text-white py-6', 'court-pattern text-white py-6')}>
        <div className="container relative z-10">
          <nav className="mb-3">
            <ol className="flex items-center gap-1.5 text-sm text-white/70">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>/</li>
              <li className="text-white font-bold">오늘 예약 가능</li>
            </ol>
          </nav>
          <h1
            className={themeClass(
              'text-2xl sm:text-3xl font-black uppercase tracking-tight',
              'text-2xl sm:text-3xl font-bold'
            )}
          >
            오늘 예약 가능한 테니스장
          </h1>
          <p className={`mt-2 text-sm ${themeClass('text-white/80 font-medium', 'text-green-100')}`}>
            지금 바로 예약할 수 있는 코트를 확인하세요.
          </p>

          <div className={`mt-4 flex flex-wrap gap-3 ${themeClass('', '')}`}>
            <div
              className={`px-4 py-2 rounded-lg ${themeClass(
                'bg-black/20 border-2 border-white/30',
                'bg-white/10 backdrop-blur-sm'
              )}`}
            >
              <div className={`text-2xl font-bold ${themeClass('text-[#facc15]', 'text-white')}`}>
                {totalAvailable}
              </div>
              <div className="text-xs text-white/70">예약 가능</div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg ${themeClass(
                'bg-black/20 border-2 border-white/30',
                'bg-white/10 backdrop-blur-sm'
              )}`}
            >
              <div className={`text-2xl font-bold ${themeClass('text-[#facc15]', 'text-white')}`}>
                {totalDistricts}
              </div>
              <div className="text-xs text-white/70">운영 지역</div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg ${themeClass(
                'bg-black/20 border-2 border-white/30',
                'bg-white/10 backdrop-blur-sm'
              )}`}
            >
              <div className={`text-sm font-bold ${themeClass('text-white', 'text-white')}`}>
                {dateStr}
              </div>
              <div className="text-xs text-white/70">{timeStr} 기준</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-6">
        {totalAvailable === 0 ? (
          <div
            className={`p-8 text-center rounded-xl ${themeClass(
              'bg-white border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
              'bg-white border border-gray-100'
            )}`}
          >
            <div className={`text-4xl mb-3 ${themeClass('', '')}`}>😔</div>
            <h2 className={`text-lg font-bold mb-2 ${themeClass('text-black', 'text-gray-900')}`}>
              현재 예약 가능한 코트가 없습니다
            </h2>
            <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
              잠시 후 다시 확인해주세요.
            </p>
          </div>
        ) : (
          <>
            <h2
              className={`text-xl mb-4 ${themeClass(
                'font-black text-black uppercase tracking-tight',
                'font-bold text-gray-900'
              )}`}
            >
              지역별 예약 가능 코트
            </h2>

            <div className="space-y-3">
              {sortedDistricts.map((district) => {
                const districtCourts = courts[district];
                const isExpanded = expandedDistricts.has(district);
                const districtSlug = KOREAN_TO_SLUG[district];

                return (
                  <div
                    key={district}
                    className={`rounded-lg overflow-hidden ${themeClass(
                      'border-[3px] border-black shadow-[4px_4px_0px_0px_#000]',
                      'border border-gray-200'
                    )}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDistrict(district)}
                      className={`w-full px-4 py-3 flex items-center justify-between font-bold transition-colors ${themeClass(
                        'bg-[#a3e635] text-black hover:bg-[#84cc16]',
                        'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      )}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{district}</span>
                        <span className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
                          ({districtCourts.length})
                        </span>
                      </span>
                      <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <div className={`${themeClass('bg-white', 'bg-white')}`}>
                        <div className="divide-y divide-gray-200">
                          {districtCourts.map((court) => (
                            <div
                              key={court.SVCID}
                              className={`p-4 ${themeClass('hover:bg-gray-50', 'hover:bg-gray-50')}`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`font-bold text-sm mb-1 ${themeClass(
                                      'text-black',
                                      'text-gray-900'
                                    )}`}
                                  >
                                    {court.SVCNM}
                                  </h3>
                                  <p
                                    className={`text-xs ${themeClass(
                                      'text-black/60',
                                      'text-gray-500'
                                    )}`}
                                  >
                                    {court.PLACENM}
                                  </p>
                                </div>
                                <Link
                                  href={`/${districtSlug}/${encodeURIComponent(court.SVCID)}`}
                                  className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${themeClass(
                                    'bg-[#facc15] text-black border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                                    'bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                                  )}`}
                                >
                                  예약
                                </Link>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className={`${themeClass('text-black/60', 'text-gray-500')}`}>
                                    이용료
                                  </span>
                                  <p className={`font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                                    {court.PAYATNM}
                                  </p>
                                </div>
                                <div>
                                  <span className={`${themeClass('text-black/60', 'text-gray-500')}`}>
                                    운영시간
                                  </span>
                                  <p className={`font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                                    {court.V_MIN || '-'} ~ {court.V_MAX || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
    </PullToRefresh>
  );
}
