'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass } from '@/lib/cn';
import { AllDistrictStats, DistrictGuideStats, getCompetitionStars } from '@/lib/utils/districtStats';
import { useInView } from '@/lib/hooks/useInView';
import { useCountUp } from '@/lib/hooks/useCountUp';

interface CompareContentProps {
  stats: AllDistrictStats;
}

export default function CompareContent({ stats }: CompareContentProps) {
  const themeClass = useThemeClass();
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, [router]);
  const { ref: heroRef, inView: heroInView } = useInView();
  const { ref: avgRef, inView: avgInView } = useInView();
  const { ref: topRef, inView: topInView } = useInView();
  const { ref: tableRef, inView: tableInView } = useInView();

  const animTotalCourts = useCountUp(stats.totalCourtsSeoul, heroInView);
  const animTotalAvailable = useCountUp(stats.totalAvailableSeoul, heroInView);
  const animDistrictCount = useCountUp(stats.districts.length, heroInView);

  const animAvgCourts = useCountUp(stats.seoulAverage.totalCourts, avgInView);
  const animAvgAvailableRate = useCountUp(stats.seoulAverage.availableRate, avgInView);
  const animAvgFreeRate = useCountUp(stats.seoulAverage.freeRate, avgInView);
  const animAvgCompetition = useCountUp(stats.seoulAverage.competitionRate, avgInView);

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
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
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
                <Link href="/" className="hover:text-white transition-colors">홈</Link>
              </li>
              <li>/</li>
              <li className="text-white font-bold">구별 비교</li>
            </ol>
          </nav>
          <h1 className={themeClass(
            'text-2xl sm:text-3xl font-black uppercase tracking-tight',
            'text-2xl sm:text-3xl font-bold'
          )}>
            서울시 구별 테니스장 비교
          </h1>
          <p className={`mt-2 text-sm ${themeClass('text-white/80 font-medium', 'text-green-100')}`}>
            어느 구에서 테니스 치기 가장 좋을까? 데이터로 비교해 보세요.
          </p>

          <div ref={heroRef} className={`mt-4 flex flex-wrap gap-3 ${themeClass('', '')}`}>
            <div className={`px-4 py-2 rounded-lg ${themeClass('bg-black/20 border-2 border-white/30', 'bg-white/10 backdrop-blur-sm')} ${heroInView ? 'anim-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0ms' }}>
              <div className={`text-2xl font-bold ${themeClass('text-[#facc15]', 'text-white')}`}>
                {animTotalCourts}
              </div>
              <div className="text-xs text-white/70">전체 시설</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${themeClass('bg-black/20 border-2 border-white/30', 'bg-white/10 backdrop-blur-sm')} ${heroInView ? 'anim-fade-up' : 'opacity-0'}`} style={{ animationDelay: '80ms' }}>
              <div className={`text-2xl font-bold ${themeClass('text-[#facc15]', 'text-white')}`}>
                {animTotalAvailable}
              </div>
              <div className="text-xs text-white/70">예약 가능</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${themeClass('bg-black/20 border-2 border-white/30', 'bg-white/10 backdrop-blur-sm')} ${heroInView ? 'anim-fade-up' : 'opacity-0'}`} style={{ animationDelay: '160ms' }}>
              <div className={`text-2xl font-bold ${themeClass('text-[#facc15]', 'text-white')}`}>
                {animDistrictCount}
              </div>
              <div className="text-xs text-white/70">운영 지역</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-6">
        <div ref={avgRef} className={`mb-6 p-4 ${themeClass(
          'bg-[#fef3c7] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-amber-50 rounded-xl border border-amber-100'
        )}`}>
          <h2 className={`font-bold mb-2 ${themeClass('text-black uppercase', 'text-gray-900')}`}>
            서울 평균
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className={avgInView ? 'anim-fade-up' : 'opacity-0'} style={{ animationDelay: '0ms' }}>
              <span className={themeClass('text-black/60 font-bold', 'text-gray-500')}>구당 평균 시설</span>
              <p className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                {animAvgCourts}개
              </p>
            </div>
            <div className={avgInView ? 'anim-fade-up' : 'opacity-0'} style={{ animationDelay: '80ms' }}>
              <span className={themeClass('text-black/60 font-bold', 'text-gray-500')}>평균 예약가능률</span>
              <p className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                {animAvgAvailableRate}%
              </p>
            </div>
            <div className={avgInView ? 'anim-fade-up' : 'opacity-0'} style={{ animationDelay: '160ms' }}>
              <span className={themeClass('text-black/60 font-bold', 'text-gray-500')}>평균 무료 비율</span>
              <p className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                {animAvgFreeRate}%
              </p>
            </div>
            <div className={avgInView ? 'anim-fade-up' : 'opacity-0'} style={{ animationDelay: '240ms' }}>
              <span className={themeClass('text-black/60 font-bold', 'text-gray-500')}>평균 경쟁률</span>
              <p className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                {animAvgCompetition}%
              </p>
            </div>
          </div>
        </div>

        <h2 className={`text-xl mb-4 ${themeClass('font-black text-black uppercase tracking-tight', 'font-bold text-gray-900')}`}>
          구별 상세 비교
        </h2>

        <div ref={tableRef} className="overflow-x-auto -mx-4 px-4">
          <table className={`w-full text-sm ${themeClass(
            'border-[3px] border-black',
            'border border-gray-200 rounded-xl overflow-hidden'
          )}`}>
            <thead>
              <tr className={themeClass('bg-black text-white', 'bg-gray-100 text-gray-600')}>
                <th className={`px-3 py-3 text-left font-bold ${themeClass('uppercase', '')}`}>구</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap">시설 수</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap">예약 가능</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap hidden sm:table-cell">무료</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap">경쟁률</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap hidden md:table-cell">운영시간</th>
                <th className="px-3 py-3 text-center font-bold whitespace-nowrap">가이드</th>
              </tr>
            </thead>
            <tbody>
              {stats.districts.map((d, i) => (
                <tr
                  key={d.slug}
                  className={`${themeClass(
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  )} ${themeClass('border-t-2 border-black', 'border-t border-gray-100')}`}
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/${d.slug}`}
                      className={`font-bold ${themeClass('text-black hover:underline', 'text-gray-900 hover:text-green-600')}`}
                    >
                      {d.nameKo}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`font-bold ${themeClass('text-black', 'text-gray-900')}`}>
                      {d.totalCourts}
                    </span>
                    {d.externalCourts > 0 && (
                      <span className={`ml-1 text-xs ${themeClass('font-bold text-[#2563eb]', 'text-blue-600')}`}>
                        +{d.externalCourts} 외부
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.availableCourts > 0 ? themeClass('bg-[#16a34a]', 'bg-green-500') : themeClass('bg-gray-400', 'bg-gray-300')} ${tableInView ? 'anim-bar-x' : 'w-0'}`}
                          style={{
                            width: `${Math.min(d.availableRate, 100)}%`,
                            animationDelay: `${i * 30}ms`,
                          }}
                        />
                      </div>
                      <span className={`font-bold text-sm ${d.availableCourts > 0
                        ? themeClass('text-[#16a34a]', 'text-green-600')
                        : themeClass('text-black/60', 'text-gray-400')
                      }`}>
                        {d.availableCourts}
                      </span>
                    </div>
                    <span className={`text-xs ml-1 ${themeClass('text-black/60', 'text-gray-400')}`}>
                      ({d.availableRate}%)
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center hidden sm:table-cell">
                    <span className={themeClass('text-black', 'text-gray-700')}>
                      {d.freeCourts}
                    </span>
                    <span className={`text-xs ml-1 ${themeClass('text-black/60', 'text-gray-400')}`}>
                      ({d.freeRate}%)
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-xs ${themeClass('text-[#facc15]', 'text-amber-500')}`}>
                      {getCompetitionStars(d.competitionRate)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center hidden md:table-cell whitespace-nowrap">
                    <span className={themeClass('text-black/70 text-xs', 'text-gray-500 text-xs')}>
                      {d.earliestOpen || '-'} ~ {d.latestClose || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Link
                      href={`/guide/${d.slug}`}
                      className={`inline-block px-2.5 py-1 text-xs font-bold transition-all ${themeClass(
                        'bg-[#a3e635] text-black border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                        'bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                      )}`}
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={topRef} className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: '시설이 가장 많은 구', emoji: '🏆', districts: [...stats.districts].sort((a, b) => b.totalCourts - a.totalCourts).slice(0, 3), getValue: (d: DistrictGuideStats) => d.totalCourts, unit: '개' },
            { title: '예약 가능률 높은 구', emoji: '✅', districts: [...stats.districts].sort((a, b) => b.availableRate - a.availableRate).slice(0, 3), getValue: (d: DistrictGuideStats) => d.availableRate, unit: '%' },
            { title: '무료 코트 많은 구', emoji: '🆓', districts: [...stats.districts].sort((a, b) => b.freeCourts - a.freeCourts).slice(0, 3), getValue: (d: DistrictGuideStats) => d.freeCourts, unit: '개' },
          ].map((card, i) => (
            <div
              key={card.title}
              className={topInView ? 'anim-fade-up' : 'opacity-0'}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <TopCard
                themeClass={themeClass}
                title={card.title}
                emoji={card.emoji}
                districts={card.districts}
                getValue={card.getValue}
                unit={card.unit}
              />
            </div>
          ))}
        </div>

        <div className={`mt-8 p-5 ${themeClass(
          'bg-white border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white rounded-xl border border-gray-100'
        )}`}>
          <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black uppercase', 'text-gray-900')}`}>
            구별 가이드 바로가기
          </h2>
          <p className={`mb-4 text-sm ${themeClass('text-black/70 font-medium', 'text-gray-500')}`}>
            각 구별 상세 정보와 예약 팁을 확인하세요.
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.districts.map((d) => (
              <Link
                key={d.slug}
                href={`/guide/${d.slug}`}
                className={`px-3 py-1.5 text-sm font-bold transition-all ${themeClass(
                  'bg-[#a3e635] text-black border-2 border-black rounded-[5px] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                  'bg-gray-100 text-gray-700 rounded-lg hover:bg-green-100 hover:text-green-700'
                )}`}
              >
                {d.nameKo}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
    </PullToRefresh>
  );
}

function TopCard({
  themeClass,
  title,
  emoji,
  districts,
  getValue,
  unit,
}: {
  themeClass: <T>(neo: T, def: T) => T;
  title: string;
  emoji: string;
  districts: DistrictGuideStats[];
  getValue: (d: DistrictGuideStats) => number;
  unit: string;
}) {
  return (
    <div className={themeClass(
      'bg-white border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] p-4',
      'bg-white rounded-xl border border-gray-100 p-4'
    )}>
      <h3 className={`font-bold mb-3 flex items-center gap-2 ${themeClass('text-black uppercase', 'text-gray-900')}`}>
        <span>{emoji}</span> {title}
      </h3>
      <ol className="space-y-2">
        {districts.map((d, i) => (
          <li key={d.slug} className={`flex items-center justify-between ${i > 0 ? 'stagger-item' : ''}`} style={i > 0 ? { animationDelay: `${i * 50}ms` } : {}}>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                i === 0
                  ? themeClass('bg-[#facc15] text-black border-2 border-black', 'bg-amber-100 text-amber-800')
                  : themeClass('bg-gray-200 text-black', 'bg-gray-100 text-gray-600')
              }`}>
                {i + 1}
              </span>
              <Link
                href={`/guide/${d.slug}`}
                className={`font-bold ${themeClass('text-black hover:underline', 'text-gray-800 hover:text-green-600')}`}
              >
                {d.nameKo}
              </Link>
            </div>
            <span className={`font-bold ${themeClass('text-black', 'text-gray-900')}`}>
              {getValue(d)}{unit}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
