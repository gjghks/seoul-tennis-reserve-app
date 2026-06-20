'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import { useSeason } from '@/contexts/SeasonalContext';
import { useRecordStats } from '@/lib/hooks/useRecordStats';
import { User } from '@supabase/supabase-js';

interface RecordsPromoCardProps {
  user: User | null;
  authLoading: boolean;
}

export default function RecordsPromoCard({ user, authLoading }: RecordsPromoCardProps) {
  const themeClass = useThemeClass();
  const { season } = useSeason();

  const { stats, isLoading: statsLoading } = useRecordStats({ enabled: !!user });

  const palette = {
    'default':         { bg: 'bg-blue-50',    text: 'text-blue-600',    textDark: 'text-blue-700',    hoverText: 'hover:text-blue-700',    hoverBg: 'hover:bg-blue-100',    iconBg: 'bg-blue-100',    iconMinimal: 'bg-blue-50 text-blue-600',       deco: 'bg-blue-500',    statText: 'text-blue-600',    winDot: 'bg-blue-500',    emptyNeoBg: 'bg-yellow-50', emptyMinBg: 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100', emptyIconText: 'text-yellow-500'  },
    'cherry-blossom':  { bg: 'bg-pink-50',    text: 'text-pink-600',    textDark: 'text-pink-700',    hoverText: 'hover:text-pink-700',    hoverBg: 'hover:bg-pink-100',    iconBg: 'bg-pink-100',    iconMinimal: 'bg-pink-50 text-pink-600',       deco: 'bg-pink-500',    statText: 'text-pink-600',    winDot: 'bg-pink-500',    emptyNeoBg: 'bg-pink-50',   emptyMinBg: 'bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100',     emptyIconText: 'text-pink-500'    },
    'tennis-spring':   { bg: 'bg-emerald-50', text: 'text-emerald-600', textDark: 'text-emerald-700', hoverText: 'hover:text-emerald-700', hoverBg: 'hover:bg-emerald-100', iconBg: 'bg-emerald-100', iconMinimal: 'bg-emerald-50 text-emerald-600', deco: 'bg-emerald-500', statText: 'text-emerald-600', winDot: 'bg-emerald-500', emptyNeoBg: 'bg-emerald-50', emptyMinBg: 'bg-gradient-to-r from-emerald-50 to-lime-50 border border-emerald-100', emptyIconText: 'text-emerald-500' },
    'tennis-autumn':   { bg: 'bg-orange-50',  text: 'text-orange-600',  textDark: 'text-orange-700',  hoverText: 'hover:text-orange-700',  hoverBg: 'hover:bg-orange-100',  iconBg: 'bg-orange-100',  iconMinimal: 'bg-orange-50 text-orange-600',   deco: 'bg-orange-500',  statText: 'text-orange-600',  winDot: 'bg-orange-500',  emptyNeoBg: 'bg-orange-50', emptyMinBg: 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100', emptyIconText: 'text-orange-500' },
    'tennis-summer':   { bg: 'bg-cyan-50',    text: 'text-cyan-600',    textDark: 'text-cyan-700',    hoverText: 'hover:text-cyan-700',    hoverBg: 'hover:bg-cyan-100',    iconBg: 'bg-cyan-100',    iconMinimal: 'bg-cyan-50 text-cyan-600',       deco: 'bg-cyan-500',    statText: 'text-cyan-600',    winDot: 'bg-cyan-500',    emptyNeoBg: 'bg-cyan-50',  emptyMinBg: 'bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-100',     emptyIconText: 'text-cyan-500'   },
    'tennis-winter':   { bg: 'bg-sky-50',     text: 'text-sky-600',     textDark: 'text-sky-700',     hoverText: 'hover:text-sky-700',     hoverBg: 'hover:bg-sky-100',     iconBg: 'bg-sky-100',     iconMinimal: 'bg-sky-50 text-sky-600',         deco: 'bg-sky-500',     statText: 'text-sky-600',     winDot: 'bg-sky-500',     emptyNeoBg: 'bg-sky-50',   emptyMinBg: 'bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100',       emptyIconText: 'text-sky-500'    },
  } as const;
  const { bg, text, textDark, hoverText, hoverBg, iconBg, iconMinimal, deco, statText, winDot, emptyNeoBg, emptyMinBg, emptyIconText } = palette[season] ?? palette.default;

  if (authLoading || (user && statsLoading)) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`w-full h-32 ${themeClass('skeleton-neo', 'skeleton')} rounded-xl`} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_#f1f3f8]', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm')}`}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
                나만의 테니스 기록을 시작하세요
              </h3>
              <p className={`text-sm mb-3 ${themeClass('text-gray-600 dark:text-slate-400 font-medium', 'text-gray-500 dark:text-slate-400')}`}>
                경기 결과를 기록하고 승률과 통계를 확인해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className={`inline-flex items-center text-sm font-bold ${themeClass(`${text} hover:underline`, `${text} ${hoverText}`)}`}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/records"
                  className={`text-xs ${themeClass('text-black/40 dark:text-slate-500 font-bold hover:text-black/60 dark:hover:text-slate-300', 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300')}`}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${themeClass(`${iconBg} border-2 border-black`, iconMinimal)}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10 ${deco}`} />
        </div>
      </div>
    );
  }

  if (!stats || stats.total_matches === 0) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass(
          `${emptyNeoBg} dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_#f1f3f8]`,
          emptyMinBg
        )}`}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${themeClass('text-black dark:text-slate-100', 'text-gray-900')}`}>
                첫 경기를 기록해보세요!
              </h3>
              <p className={`text-sm mb-3 ${themeClass('text-gray-700 dark:text-slate-300 font-medium', 'text-gray-600')}`}>
                아직 기록된 경기가 없습니다.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/records/new" 
                  className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors ${themeClass(`${bg} ${textDark} border-2 border-black ${hoverBg}`, `${bg} ${text} ${hoverBg}`)}`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  기록하기
                </Link>
                <Link
                  href="/guide/records"
                  className={`text-xs ${themeClass('text-black/40 dark:text-slate-500 font-bold hover:text-black/60 dark:hover:text-slate-300', 'text-gray-400 hover:text-gray-600')}`}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={`hidden sm:flex w-16 h-16 items-center justify-center rounded-full ${themeClass(
              'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8]',
              `bg-white shadow-sm ${emptyIconText}`
            )}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-6 lg:my-4">
      <div className={`relative overflow-hidden rounded-xl p-5 ${themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_#f1f3f8]', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm')}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-bold ${themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100')}`}>
                나의 테니스 기록
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${themeClass('bg-black text-white', 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300')}`}>
                {stats.total_matches}경기
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div>
                <div className={`text-xs ${themeClass('text-gray-500 dark:text-slate-400 font-bold uppercase', 'text-gray-500 dark:text-slate-400')}`}>승률</div>
                <div className={`text-xl font-black ${statText}`}>
                  {stats.win_rate}%
                </div>
              </div>
              <div className={`w-px h-8 ${themeClass('bg-gray-200 dark:bg-slate-700', 'bg-gray-100 dark:bg-slate-700')}`} />
              <div>
                <div className={`text-xs ${themeClass('text-gray-500 dark:text-slate-400 font-bold uppercase', 'text-gray-500 dark:text-slate-400')}`}>최근 전적</div>
                <div className="flex gap-1 mt-1">
                  {stats.recent_form.slice(0, 5).map((result, i) => (
                    (() => {
                      const occurrence = stats.recent_form
                        .slice(0, i + 1)
                        .filter((value) => value === result).length;
                      return (
                    <div 
                      key={`${result}-${occurrence}`}
                      className={`w-2 h-2 rounded-full ${
                        result === 'win' ? winDot :
                        result === 'loss' ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    />
                      );
                    })()
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link 
              href="/records" 
               className={`inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors ${themeClass(`${bg} ${textDark} border-2 border-black ${hoverBg}`, `${bg} ${text} ${hoverBg}`)}`}
            >
              전체 기록 보기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/records"
              className={`inline-flex justify-center items-center px-4 py-2 text-xs transition-colors ${themeClass('text-black/40 dark:text-slate-500 font-bold hover:text-black/60 dark:hover:text-slate-300', 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300')}`}
            >
              사용법 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
