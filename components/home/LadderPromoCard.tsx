'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';
import { User } from '@supabase/supabase-js';
import { useLadderProfile } from '@/lib/hooks/useLadderProfile';
import { getEloTier } from '@/lib/constants/ladder';

interface LadderPromoCardProps {
  user: User | null;
  authLoading: boolean;
}

export default function LadderPromoCard({ user, authLoading }: LadderPromoCardProps) {
  const themeClass = useThemeClass();
  const { profile, isLoading: profileLoading } = useLadderProfile({ enabled: !!user });

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={cn('w-full h-32 rounded-xl', themeClass('skeleton-neo', 'skeleton'))} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={cn(
          'relative overflow-hidden rounded-xl p-5',
          themeClass('bg-purple-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-purple-50 border border-purple-100 shadow-sm')
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                실력을 증명하세요
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
                테니스 래더에 참여하여 랭킹을 올려보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={cn(
                    'inline-flex items-center text-sm font-bold',
                    themeClass('text-purple-600 hover:underline', 'text-purple-600 hover:text-purple-700')
                  )}
                >
                  로그인하고 시작하기
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/guide/ladder"
                  className={cn('text-xs', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
            <div className={cn('w-12 h-12 flex items-center justify-center rounded-full', themeClass('bg-purple-200 border-2 border-black', 'bg-purple-100 text-purple-600'))}>
              <span className="text-xl">🏆</span>
            </div>
          </div>
          <div className={cn('absolute -right-4 -bottom-8 w-24 h-24 rounded-full opacity-10', themeClass('bg-purple-600', 'bg-purple-600'))} />
        </div>
      </div>
    );
  }

  if (!profile || !profile.ladder_opt_in) {
    return (
      <div className="container my-6 lg:my-4">
        <div className={cn(
          'relative overflow-hidden rounded-xl p-5',
          themeClass('bg-purple-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-purple-50 border border-purple-100 shadow-sm')
        )}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className={cn('text-lg font-bold mb-1', themeClass('text-black', 'text-gray-900'))}>
                래더에 참여하세요
              </h3>
              <p className={cn('text-sm mb-3', themeClass('text-gray-700 font-medium', 'text-gray-600'))}>
                내 실력은 어느 정도일까요? 지금 바로 확인해보세요.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/my"
                  className={cn(
                    'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                    themeClass('bg-black text-white hover:bg-gray-800', 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm')
                  )}
                >
                  참여 설정하기
                </Link>
                <Link
                  href="/guide/ladder"
                  className={cn('text-xs', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
                >
                  사용법 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tier = getEloTier(profile.singles_elo);

  return (
    <div className="container my-6 lg:my-4">
      <div className={cn(
        'relative overflow-hidden rounded-xl p-5',
        themeClass('bg-purple-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]', 'bg-purple-50 border border-purple-100 shadow-sm')
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-lg font-bold', themeClass('text-black', 'text-gray-900'))}>
                나의 래더 랭킹
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: tier.color }}>
                {tier.label}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div>
                <div className={cn('text-xs font-bold uppercase', themeClass('text-gray-500', 'text-gray-500'))}>단식 ELO</div>
                <div className={cn('text-xl font-black', themeClass('text-purple-600', 'text-purple-600'))}>
                  {profile.singles_elo}
                </div>
              </div>
              <div className={cn('w-px h-8', themeClass('bg-purple-200', 'bg-purple-100'))} />
              <div>
                <div className={cn('text-xs font-bold uppercase', themeClass('text-gray-500', 'text-gray-500'))}>복식 ELO</div>
                <div className={cn('text-xl font-black', themeClass('text-purple-600', 'text-purple-600'))}>
                  {profile.doubles_elo}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href="/ladder"
              className={cn(
                'inline-flex justify-center items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors',
                themeClass('bg-black text-white hover:bg-gray-800', 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm')
              )}
            >
              리더보드 보기
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/guide/ladder"
              className={cn('inline-flex justify-center items-center px-4 py-2 text-xs transition-colors', themeClass('text-black/40 font-bold hover:text-black/60', 'text-gray-400 hover:text-gray-600'))}
            >
              사용법 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}