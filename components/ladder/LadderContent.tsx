'use client';

import { useState, useCallback, useMemo } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { useLadderProfile } from '@/lib/hooks/useLadderProfile';
import { useEloHistory } from '@/lib/hooks/useEloHistory';
import RankCard from '@/components/ladder/RankCard';
import EloChart from '@/components/ladder/EloChart';
import Skeleton from '@/components/ui/Skeleton';
import { DISTRICTS } from '@/lib/constants/districts';
import { LadderMatchType, LEADERBOARD_PAGE_SIZE, LeaderboardPlayer } from '@/lib/constants/ladder';
import ProfileGate from '@/components/profile/ProfileGate';

export default function LadderContent() {
  const themeClass = useThemeClass();
  const { user, loading: authLoading } = useAuth();
  
  const [matchType, setMatchType] = useState<LadderMatchType>('singles');
  const [district, setDistrict] = useState<string>('');
  const [offset, setOffset] = useState(0);

  const { players, total, isLoading: leaderboardLoading, error, mutate: mutateLeaderboard } = useLeaderboard({
    matchType,
    district: district || undefined,
    limit: LEADERBOARD_PAGE_SIZE,
    offset,
  });

  const { profile, isLoading: profileLoading, mutate: mutateProfile } = useLadderProfile({
    enabled: !!user,
  });

  const { history } = useEloHistory({
    userId: user?.id,
    matchType,
    enabled: !!user && !!profile?.ladder_opt_in,
  });

  const totalPages = Math.ceil(total / LEADERBOARD_PAGE_SIZE) || 1;
  const currentPage = Math.floor(offset / LEADERBOARD_PAGE_SIZE) + 1;

  const handleRefresh = useCallback(async () => {
    await Promise.all([mutateLeaderboard(), user ? mutateProfile() : Promise.resolve()]);
  }, [mutateLeaderboard, mutateProfile, user]);

  const toggleOptIn = async () => {
    if (!profile) return;
    try {
      const res = await fetch('/api/ladder/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ladder_opt_in: !profile.ladder_opt_in })
      });
      if (res.ok) {
        mutateProfile();
        mutateLeaderboard();
      } else {
        alert('설정 변경에 실패했습니다.');
      }
    } catch {
      alert('오류가 발생했습니다.');
    }
  };

  const currentUserPlayer: LeaderboardPlayer | null = useMemo(() => {
    if (!user || !profile || !profile.ladder_opt_in) return null;
    
    const found = players.find(p => p.user_id === user.id);
    if (found) return found;

    const elo = matchType === 'singles' ? profile.singles_elo : profile.doubles_elo;
    const peak_elo = matchType === 'singles' ? profile.singles_peak_elo : profile.doubles_peak_elo;
    const matches = matchType === 'singles' ? profile.singles_matches : profile.doubles_matches;
    
    return {
      user_id: user.id,
      full_name: user.user_metadata?.name || '나의 순위',
      avatar_url: user.user_metadata?.avatar_url || null,
      ntrp_rating: null,
      skill_level: null,
      primary_district: profile.primary_district,
      elo,
      matches_played: matches,
      peak_elo,
      last_match_at: profile.last_match_at,
      is_provisional: matches < 15,
      rank: 0,
    };
  }, [user, profile, players, matchType]);

  const RefreshIndicator = (
    <div className={cn('flex items-center justify-center py-4', themeClass('text-black font-bold dark:text-slate-100', 'text-green-700'))}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  return (
    <ProfileGate feature="ladder">
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={cn('flex items-center justify-center py-4', themeClass('text-black font-bold dark:text-slate-100', 'text-green-700'))}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
    >
      <div className="container mx-auto px-4 py-6 min-h-screen scrollbar-hide">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className={cn('text-2xl font-black mb-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
            테니스 래더
          </h1>
          <p className={themeClass('text-black/80 font-bold dark:text-slate-300', 'text-gray-600 dark:text-slate-400')}>
            실력 기반 매칭과 랭킹 시스템
          </p>
        </div>

        {user && !authLoading && (
          <div className="mb-8">
            {profileLoading ? (
              <div className={cn(
                'p-6 h-32',
                themeClass(
                  'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
                  'bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm'
                )
              )}>
                <Skeleton className="w-1/3 h-6 mb-4" />
                <Skeleton className="w-full h-8" />
              </div>
            ) : profile?.ladder_opt_in ? (
              <div className="space-y-4">
                {currentUserPlayer && (
                  <div>
                    <h2 className={cn('text-lg font-bold mb-3', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>나의 랭킹</h2>
                    <RankCard player={currentUserPlayer} isCurrentUser={true} />
                  </div>
                )}
                
                {history && history.length > 0 && (
                  <EloChart history={history} />
                )}

                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={toggleOptIn}
                    className={themeClass('text-sm font-bold text-black/50 dark:text-slate-400 underline', 'text-sm text-gray-400 dark:text-slate-500 underline')}
                  >
                    래더 시스템 탈퇴
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn(
                'p-6 text-center transition-all',
                themeClass(
                  'bg-[#facc15] border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                  'bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-xl shadow-sm'
                )
              )}>
                <h3 className={cn('text-xl font-black mb-2', themeClass('text-black', 'text-gray-900 dark:text-yellow-100'))}>
                  래더 시스템에 참여해보세요!
                </h3>
                <p className={cn('text-sm mb-4', themeClass('font-bold text-black/80', 'text-gray-700 dark:text-yellow-200/80'))}>
                  나와 비슷한 실력의 상대를 찾고, 경기를 통해 ELO 점수를 올려보세요.
                  5경기 이상 완료하면 순위표에 이름을 올릴 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={toggleOptIn}
                  className={cn(
                    'px-6 py-3 font-black text-lg transition-transform',
                    themeClass(
                      'bg-black text-white rounded-[5px] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
                      'bg-gray-900 text-white rounded-lg hover:bg-gray-800'
                    )
                  )}
                >
                  지금 참여하기
                </button>
              </div>
            )}
          </div>
        )}

        <div className={cn(
          'mb-6 p-4 rounded-xl flex flex-wrap gap-3',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
            'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm'
          )
        )}>
          <div className="flex rounded-md overflow-hidden flex-1 min-w-[200px] border-2 border-black dark:border-[#f1f3f8]">
            <button
              type="button"
              onClick={() => { setMatchType('singles'); setOffset(0); }}
              className={cn(
                'flex-1 py-2 font-black transition-colors',
                matchType === 'singles' 
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass('bg-white dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700')
              )}
            >
              단식
            </button>
            <div className="w-[2px] bg-black"></div>
            <button
              type="button"
              onClick={() => { setMatchType('doubles'); setOffset(0); }}
              className={cn(
                'flex-1 py-2 font-black transition-colors',
                matchType === 'doubles' 
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass('bg-white dark:bg-slate-800 text-black dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700')
              )}
            >
              복식
            </button>
          </div>

          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setOffset(0); }}
            className={cn(
              'px-3 py-2 outline-none cursor-pointer flex-1 min-w-[120px]',
              themeClass(
                'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black',
                'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500'
              )
            )}
          >
            <option value="">모든 지역</option>
            {DISTRICTS.map(d => (
              <option key={d.slug} value={d.nameKo}>{d.nameKo}</option>
            ))}
          </select>
        </div>

        <div>
          {error ? (
            <div className={cn(
              'text-center py-12',
              themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]', 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700')
            )}>
              <div className={cn('text-lg mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>오류가 발생했습니다</div>
              <p className={themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>{error.message}</p>
            </div>
          ) : leaderboardLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={cn(
                  'p-4 h-[88px]',
                  themeClass(
                    'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
                    'bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm'
                  )
                )}>
                  <div className="flex gap-4 h-full items-center">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-1/3 h-5" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className={cn(
              'text-center py-16',
              themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]', 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm')
            )}>
              <div className="text-4xl mb-4">🏆</div>
              <div className={cn('text-xl mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>랭킹 정보가 없습니다</div>
              <p className={themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>아직 랭킹에 등록된 플레이어가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 mb-8">
                {players.map(player => (
                  <RankCard key={player.user_id} player={player} />
                ))}
              </div>

              {total > LEADERBOARD_PAGE_SIZE && (
                <div className="flex justify-center items-center gap-4 py-8">
                  <button
                    type="button"
                    onClick={() => setOffset(Math.max(0, offset - LEADERBOARD_PAGE_SIZE))}
                    disabled={currentPage === 1}
                    className={cn(
                      'px-3 py-2 text-sm transition-all',
                      themeClass(
                        'border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 dark:text-slate-100',
                        'border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 font-medium text-gray-700 dark:text-slate-200'
                      )
                    )}
                  >
                    이전
                  </button>
                  <span className={cn('text-sm', themeClass('font-bold', 'text-gray-600 dark:text-slate-400'))}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOffset(offset + LEADERBOARD_PAGE_SIZE)}
                    disabled={currentPage >= totalPages}
                    className={cn(
                      'px-3 py-2 text-sm transition-all',
                      themeClass(
                        'border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 dark:text-slate-100',
                        'border border-gray-300 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 font-medium text-gray-700 dark:text-slate-200'
                      )
                    )}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
    </ProfileGate>
  );
}
