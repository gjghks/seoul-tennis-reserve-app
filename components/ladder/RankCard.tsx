import { useThemeClass, cn } from '@/lib/cn';
import type { LeaderboardPlayer } from '@/lib/constants/ladder';
import { getEloTier } from '@/lib/constants/ladder';

interface RankCardProps {
  player: LeaderboardPlayer;
  isCurrentUser?: boolean;
}

export default function RankCard({ player, isCurrentUser = false }: RankCardProps) {
  const themeClass = useThemeClass();
  const tier = getEloTier(player.elo);

  let rankDisplay: React.ReactNode = player.rank === 0 ? '-' : player.rank;
  if (player.rank === 1) rankDisplay = '🥇';
  else if (player.rank === 2) rankDisplay = '🥈';
  else if (player.rank === 3) rankDisplay = '🥉';

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 transition-all',
        themeClass(
          'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
          'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm'
        ),
        isCurrentUser && themeClass('bg-[#facc15] border-black', 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900')
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-12 h-12 shrink-0 font-black text-xl',
        typeof rankDisplay === 'string' ? 'text-2xl' : themeClass('text-black', 'text-gray-900 dark:text-slate-100')
      )}>
        {rankDisplay}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('font-bold truncate', themeClass('text-black', 'text-gray-900 dark:text-slate-100'))}>
            {player.full_name || '익명 플레이어'}
          </span>
          {player.is_provisional && (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              themeClass('bg-black text-white', 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300')
            )}>
              잠정
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span 
            className="font-bold flex items-center gap-1"
            style={{ color: themeClass('inherit', tier.color) }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
            {tier.label}
          </span>
          <span className={themeClass('text-black/60 font-bold', 'text-gray-500 dark:text-slate-400')}>
            {player.elo}점
          </span>
        </div>
      </div>

      <div className={cn(
        'shrink-0 text-right',
        themeClass('text-black/80 font-bold', 'text-gray-600 dark:text-slate-300')
      )}>
        <div className="text-sm">
          {player.matches_played}전
        </div>
        <div className="text-xs mt-1">
          최고 {player.peak_elo}
        </div>
      </div>
    </div>
  );
}
