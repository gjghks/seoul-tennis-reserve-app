'use client';

import { useThemeClass, cn } from '@/lib/cn';

interface Participant {
  id: string;
  name: string;
  seed?: number;
}

interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  participant1: Participant | null;
  participant2: Participant | null;
  winner: { id: string; name: string } | null;
  score: { p1: number; p2: number }[] | null;
  status: 'pending' | 'in_progress' | 'completed' | 'bye';
  nextMatchId: string | null;
  courtNumber?: number | null;
}

interface MatchCardProps {
  match: BracketMatch;
  position: { x: number; y: number };
  width: number;
  height: number;
  animationDelay: number;
  isChampionMatch?: boolean;
  isLive?: boolean;
  onClick?: () => void;
}

function PlayerRow({
  participant,
  isWinner,
  score,
  isBye,
  themeClass,
}: {
  participant: Participant | null;
  isWinner: boolean;
  score: { p1: number; p2: number }[] | null;
  isBye: boolean;
  themeClass: <T>(neo: T, minimal: T) => T;
}) {
  if (!participant && !isBye) {
    return (
      <div className="flex h-[30px] items-center px-2.5 text-[11px] text-gray-300 dark:text-slate-500 italic">
        대진 미정
      </div>
    );
  }

  if (isBye && !participant) {
    return (
      <div className="flex h-[30px] items-center px-2.5 text-[11px] text-gray-400 dark:text-slate-500 italic opacity-60">
        BYE
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-[30px] items-center justify-between px-2.5 transition-colors',
        isWinner &&
          themeClass(
            'bg-[#dcfce7]',
            'bg-green-50 dark:bg-green-950/40'
          )
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {participant?.seed != null && (
          <span
            className={cn(
              'shrink-0 text-[9px] font-bold',
              themeClass('text-black/50 dark:text-slate-400', 'text-gray-400 dark:text-slate-500')
            )}
          >
            [{participant.seed}]
          </span>
        )}
        <span
          className={cn(
            'truncate text-[12px]',
            isWinner
              ? themeClass('font-black text-black', 'font-bold text-gray-900 dark:text-slate-100')
              : themeClass('font-bold text-black/70 dark:text-slate-200', 'font-medium text-gray-600 dark:text-slate-400')
          )}
        >
          {participant?.name ?? ''}
        </span>
        {isWinner && (
          <span className="shrink-0 text-[10px]">
            ✓
          </span>
        )}
      </div>

      {score && score.length > 0 && (
        <div className="bracket-score flex items-center gap-1 shrink-0 ml-1.5">
          {score.map((set, setIndex) => {
            const setKey = `s${set.p1}-${set.p2}-${setIndex}`;
            const playerScore = isWinner
              ? Math.max(set.p1, set.p2)
              : Math.min(set.p1, set.p2);
            return (
              <span
                key={setKey}
                className={cn(
                  'text-[10px] tabular-nums',
                  isWinner
                    ? themeClass('font-black text-black', 'font-bold text-gray-800 dark:text-slate-200')
                    : themeClass('font-bold text-black/40 dark:text-slate-500', 'font-medium text-gray-400 dark:text-slate-500')
                )}
                style={{ '--score-delay': `${setIndex * 0.1}s` } as React.CSSProperties}
              >
                {playerScore}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MatchCard({
  match,
  position,
  width,
  height,
  animationDelay,
  isChampionMatch = false,
  isLive = false,
  onClick,
}: MatchCardProps) {
  const themeClass = useThemeClass();

  const isP1Winner = match.winner?.id === match.participant1?.id && match.participant1 !== null;
  const isP2Winner = match.winner?.id === match.participant2?.id && match.participant2 !== null;
  const isActive = match.status === 'in_progress';
  const isBye = match.status === 'bye';
  const isCompleted = match.status === 'completed';
  const courtNum = match.courtNumber ?? (match as unknown as Record<string, unknown>).court_number as number | undefined;

  const p1Score = match.score;
  const p2Score = match.score;

  return (
    <foreignObject
      x={position.x}
      y={position.y}
      width={width}
      height={height}
    >
      <button
        type="button"
        className={cn(
          'bracket-match-card h-full w-full cursor-pointer select-none overflow-hidden text-left',
          themeClass(
            cn(
              'rounded-[5px] border-2 border-black bg-white dark:bg-slate-800',
              isCompleted && (isP1Winner || isP2Winner)
                ? 'shadow-[4px_4px_0px_#22c55e]'
                : 'shadow-[4px_4px_0px_#000]'
            ),
            cn(
              'rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md',
              isCompleted && 'border-gray-300 dark:border-slate-600'
            )
          ),
          isActive && 'bracket-match-active',
          isChampionMatch && match.winner && 'bracket-champion',
          isBye && 'opacity-50'
        )}
        style={
          {
            '--card-delay': `${animationDelay}s`,
          } as React.CSSProperties
        }
        onClick={onClick}
        aria-label={`${match.participant1?.name ?? '미정'} vs ${match.participant2?.name ?? '미정'}`}
      >
        {isActive && isLive && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-[2px] text-[9px] font-bold',
              themeClass(
                'bg-red-500 text-white',
                'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300'
              )
            )}
          >
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            진행 중
          </div>
        )}

        {courtNum && !isBye && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-[2px] text-[9px] font-bold',
              themeClass(
                'bg-[#facc15] text-black',
                'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300'
              )
            )}
          >
            {courtNum}번 코트
          </div>
        )}

        <PlayerRow
          participant={match.participant1}
          isWinner={isP1Winner}
          score={isCompleted ? p1Score : null}
          isBye={isBye && match.participant1 === null}
          themeClass={themeClass}
        />

        <div
          className={themeClass(
            'h-[1px] bg-black/20 dark:bg-slate-700',
            'h-[1px] bg-gray-100 dark:bg-slate-700'
          )}
        />

        <PlayerRow
          participant={match.participant2}
          isWinner={isP2Winner}
          score={isCompleted ? p2Score : null}
          isBye={isBye && match.participant2 === null}
          themeClass={themeClass}
        />
      </button>
    </foreignObject>
  );
}
