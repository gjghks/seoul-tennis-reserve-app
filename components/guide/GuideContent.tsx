'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import {
  AllDistrictStats,
  DistrictGuideStats,
  getCompetitionLabel,
  getCompetitionStars,
} from '@/lib/utils/districtStats';

interface GuideContentProps {
  district: string;
  stat: DistrictGuideStats;
  allStats: AllDistrictStats;
  facilityRank: number;
}

export default function GuideContent({
  district,
  stat,
  allStats,
  facilityRank,
}: GuideContentProps) {
  const themeClass = useThemeClass();
  const avg = allStats.seoulAverage;
  const totalDistricts = allStats.districts.length;

  return (
    <div className={`min-h-screen scrollbar-hide ${themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900')}`}>
      <section className={themeClass('court-pattern-nb text-white py-6', 'court-pattern text-white py-6')}>
        <div className="container relative z-10">
          <nav className="mb-3">
            <ol className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap">
              <li>
                <Link href="/" className="hover:text-white transition-colors">홈</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">구별 비교</Link>
              </li>
              <li>/</li>
              <li className="text-white font-bold">{stat.nameKo} 가이드</li>
            </ol>
          </nav>
          <h1 className={themeClass(
            'text-2xl sm:text-3xl font-black uppercase tracking-tight',
            'text-2xl sm:text-3xl font-bold'
          )}>
            {stat.nameKo} 테니스장 가이드
          </h1>
          <p className={`mt-2 text-sm ${themeClass('text-white/80 font-medium', 'text-green-100')}`}>
            {stat.nameKo} 공공 테니스장의 모든 정보를 한눈에
          </p>
        </div>
      </section>

      <section className="container py-6 space-y-6">
        <div className={`p-5 ${themeClass(
          'bg-[#a3e635] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-100 dark:border-green-900/50'
        )}`}>
          <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black uppercase', 'text-gray-900 dark:text-slate-100')}`}>
            {stat.nameKo} 한눈에 보기
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox
              themeClass={themeClass}
              label="전체 시설"
              value={`${stat.totalCourts}개`}
              sub={`서울 ${facilityRank}위 / ${totalDistricts}구`}
            />
            <StatBox
              themeClass={themeClass}
              label="예약 가능"
              value={`${stat.availableCourts}개`}
              sub={`가능률 ${stat.availableRate}%`}
            />
            <StatBox
              themeClass={themeClass}
              label="무료 코트"
              value={`${stat.freeCourts}개`}
              sub={`무료 비율 ${stat.freeRate}%`}
            />
            <StatBox
              themeClass={themeClass}
              label="운영시간"
              value={stat.earliestOpen && stat.latestClose ? `${stat.earliestOpen}~${stat.latestClose}` : '-'}
              sub="최대 운영 범위"
            />
          </div>
        </div>

        <div className={`p-5 ${themeClass(
          'bg-white dark:bg-slate-900 border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800'
        )}`}>
          <h2 className={`text-lg font-bold mb-4 ${themeClass('text-black dark:text-slate-100 uppercase', 'text-gray-900 dark:text-slate-100')}`}>
            {stat.nameKo} 테니스장 특징
          </h2>
          <div className={`space-y-3 text-sm leading-relaxed ${themeClass('text-black/80 dark:text-slate-300', 'text-gray-700 dark:text-slate-200')}`}>
            <p>
              <strong>{stat.nameKo}</strong>에는 총 <strong>{stat.totalCourts}개</strong>의 공공 테니스장 프로그램이 운영되고 있으며,
              서울 {totalDistricts}개 구 중 <strong>{facilityRank}번째</strong>로 시설이{' '}
              {facilityRank <= Math.ceil(totalDistricts / 3) ? '많습니다' :
               facilityRank <= Math.ceil(totalDistricts * 2 / 3) ? '있습니다' : '적은 편입니다'}.
            </p>

            <p>
              현재 예약 가능한 시설은 <strong>{stat.availableCourts}개</strong>로
              예약 가능률은 <strong>{stat.availableRate}%</strong>입니다.
              서울 평균({avg.availableRate}%)
              {stat.availableRate > avg.availableRate ? '보다 높아 비교적 여유롭게 예약할 수 있습니다.' :
               stat.availableRate < avg.availableRate ? '보다 낮아 예약 경쟁이 치열한 편입니다.' :
               '와 비슷한 수준입니다.'}
            </p>

            <p>
              무료 시설은 <strong>{stat.freeCourts}개({stat.freeRate}%)</strong>로,
              서울 평균({avg.freeRate}%)
              {stat.freeRate > avg.freeRate ? '보다 높습니다. 비용 부담 없이 테니스를 즐기기 좋은 지역입니다.' :
               stat.freeRate < avg.freeRate ? '보다 낮습니다.' :
               '와 비슷한 수준입니다.'}
            </p>

            <p>
              예약 경쟁률은 <strong>{getCompetitionLabel(stat.competitionRate)}</strong>{' '}
              <span className={themeClass('text-[#facc15]', 'text-amber-500')}>{getCompetitionStars(stat.competitionRate)}</span>{' '}
              수준입니다.
              {stat.competitionRate >= 50
                ? ' 인기 시간대는 빠르게 마감되므로 예약 오픈 시간에 맞춰 신청하는 것을 추천합니다.'
                : ' 비교적 여유롭게 원하는 시간을 선택할 수 있습니다.'}
            </p>

            {stat.earliestOpen && stat.latestClose && (
              <p>
                운영시간은 가장 이른 곳이 <strong>{stat.earliestOpen}</strong>부터,
                가장 늦은 곳은 <strong>{stat.latestClose}</strong>까지 운영합니다.
              </p>
            )}
          </div>
        </div>

        <div className={`p-5 ${themeClass(
          'bg-[#fef3c7] border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/50'
        )}`}>
          <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black uppercase', 'text-gray-900 dark:text-slate-100')}`}>
            예약 팁
          </h2>
          <ul className={`space-y-2 text-sm ${themeClass('text-black/80', 'text-gray-700 dark:text-slate-200')}`}>
            {stat.competitionRate >= 50 && (
              <li className="flex items-start gap-2">
                <span className="shrink-0">💡</span>
                <span>경쟁이 치열한 지역입니다. 예약 오픈 시간(보통 매월 1일 또는 전월 말)에 맞춰 빠르게 신청하세요.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="shrink-0">💡</span>
              <span>평일 오전 시간대가 가장 여유롭습니다. 주말은 경쟁이 심하므로 평일을 노려보세요.</span>
            </li>
            {stat.freeCourts > 0 && (
              <li className="flex items-start gap-2">
                <span className="shrink-0">💡</span>
                <span>
                  {stat.nameKo}에는 무료 코트가 {stat.freeCourts}개 있습니다.
                  비용을 절약하고 싶다면 무료 시설을 먼저 확인해 보세요.
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="shrink-0">💡</span>
              {stat.hasExternalOnly ? (
                <span>각 자치구 시설관리공단 예약 시스템에서 직접 예약해야 합니다. 서울 테니스에서 해당 예약 사이트로 바로 이동할 수 있습니다.</span>
              ) : (
                <span>서울시 공공서비스예약 시스템에서 직접 예약해야 합니다. 서울 테니스에서 예약 페이지로 바로 이동할 수 있습니다.</span>
              )}
            </li>
          </ul>
        </div>

        <div className={`p-5 ${themeClass(
          'bg-white dark:bg-slate-900 border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800'
        )}`}>
          <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black dark:text-slate-100 uppercase', 'text-gray-900 dark:text-slate-100')}`}>
            서울 평균과 비교
          </h2>
          <div className="space-y-3">
            <CompareBar themeClass={themeClass} label="시설 수" value={stat.totalCourts} avg={avg.totalCourts} unit="개" />
            <CompareBar themeClass={themeClass} label="예약가능률" value={stat.availableRate} avg={avg.availableRate} unit="%" max={100} />
            <CompareBar themeClass={themeClass} label="무료 비율" value={stat.freeRate} avg={avg.freeRate} unit="%" max={100} />
            <CompareBar themeClass={themeClass} label="경쟁률" value={stat.competitionRate} avg={avg.competitionRate} unit="%" max={100} />
          </div>
        </div>

        {stat.placeNames.length > 0 && (
          <div className={`p-5 ${themeClass(
            'bg-white dark:bg-slate-900 border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000]',
            'bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800'
          )}`}>
            <h2 className={`text-lg font-bold mb-3 ${themeClass('text-black dark:text-slate-100 uppercase', 'text-gray-900 dark:text-slate-100')}`}>
              {stat.nameKo} 테니스장 시설 목록
            </h2>
            <div className="flex flex-wrap gap-2">
              {stat.placeNames.map((name) => (
                <span
                  key={name}
                  className={`px-3 py-1.5 text-sm ${themeClass(
                    'bg-gray-100 dark:bg-slate-800 text-black dark:text-slate-100 font-bold border-2 border-black rounded-[5px]',
                    'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-lg'
                  )}`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${district}`}
            className={`flex-1 text-center px-5 py-3 font-bold transition-all ${themeClass(
              'bg-[#a3e635] text-black border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none uppercase',
              'bg-green-600 text-white rounded-xl hover:bg-green-700'
            )}`}
          >
            {stat.nameKo} 테니스장 예약하기
          </Link>
          <Link
            href="/compare"
            className={`flex-1 text-center px-5 py-3 font-bold transition-all ${themeClass(
              'bg-white dark:bg-slate-800 text-black dark:text-slate-100 border-[3px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
              'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            )}`}
          >
            다른 구와 비교하기
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatBox({
  themeClass,
  label,
  value,
  sub,
}: {
  themeClass: <T>(neo: T, def: T) => T;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className={`p-3 ${themeClass(
      'bg-white/80 border-2 border-black rounded-[5px]',
      'bg-white dark:bg-slate-800 rounded-lg'
    )}`}>
      <div className={`text-xs mb-1 ${themeClass('font-bold text-black/60 uppercase', 'text-gray-500 dark:text-slate-400')}`}>
        {label}
      </div>
      <div className={`text-lg font-bold ${themeClass('text-black', 'text-gray-900 dark:text-slate-100')}`}>
        {value}
      </div>
      <div className={`text-xs ${themeClass('text-black/60', 'text-gray-400 dark:text-slate-500')}`}>
        {sub}
      </div>
    </div>
  );
}

function CompareBar({
  themeClass,
  label,
  value,
  avg,
  unit,
  max,
}: {
  themeClass: <T>(neo: T, def: T) => T;
  label: string;
  value: number;
  avg: number;
  unit: string;
  max?: number;
}) {
  const barMax = max || Math.max(value, avg) * 1.3;
  const valueWidth = Math.min((value / barMax) * 100, 100);
  const avgWidth = Math.min((avg / barMax) * 100, 100);
  const isAboveAvg = value > avg;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold ${themeClass('text-black dark:text-slate-100', 'text-gray-700 dark:text-slate-200')}`}>{label}</span>
        <span className={`text-sm font-bold ${
          isAboveAvg
            ? themeClass('text-[#16a34a]', 'text-green-600')
            : themeClass('text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400')
        }`}>
          {value}{unit}
          <span className={`text-xs ml-1 ${themeClass('text-black/60 dark:text-slate-400', 'text-gray-400 dark:text-slate-500')}`}>
            (평균 {avg}{unit})
          </span>
        </span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${themeClass('bg-gray-200 dark:bg-slate-700 border border-black', 'bg-gray-100 dark:bg-slate-800')}`}>
        <div className="relative h-full">
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${themeClass(
              isAboveAvg ? 'bg-[#a3e635]' : 'bg-gray-400',
              isAboveAvg ? 'bg-green-500' : 'bg-gray-300'
            )}`}
            style={{ width: `${valueWidth}%` }}
          />
          <div
            className={`absolute top-0 bottom-0 w-0.5 ${themeClass('bg-black', 'bg-red-400')}`}
            style={{ left: `${avgWidth}%` }}
            title={`서울 평균: ${avg}${unit}`}
          />
        </div>
      </div>
    </div>
  );
}
