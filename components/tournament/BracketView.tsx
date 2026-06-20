'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeClass } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';
import MatchCard from './MatchCard';
import BracketConnector from './BracketConnector';

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
}

interface BracketViewProps {
  matches: BracketMatch[];
  totalRounds: number;
  tournamentName?: string;
  onMatchClick?: (matchId: string) => void;
  isLive?: boolean;
  championId?: string | null;
}

const CARD_W = 200;
const CARD_H = 64;
const H_GAP = 80;
const BASE_V_GAP = 16;
const LEFT_PAD = 40;
const TOP_PAD = 48;

function calculateMatchPosition(
  round: number,
  matchIndex: number,
  firstRoundMatches: number
) {
  const x = (round - 1) * (CARD_W + H_GAP) + LEFT_PAD;

  const matchesInRound = firstRoundMatches / Math.pow(2, round - 1);
  const vSpacing = (CARD_H + BASE_V_GAP) * Math.pow(2, round - 1);
  const totalHeight = matchesInRound * vSpacing;
  const fullHeight = firstRoundMatches * (CARD_H + BASE_V_GAP);
  const startY = (fullHeight - totalHeight) / 2 + TOP_PAD;
  const y = startY + matchIndex * vSpacing + vSpacing / 2 - CARD_H / 2;

  return { x, y };
}

function getRoundLabel(round: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - round;
  if (roundsFromEnd === 0) return '결승';
  if (roundsFromEnd === 1) return '4강';
  if (roundsFromEnd === 2) return '8강';
  if (roundsFromEnd === 3) return '16강';
  return `${round}라운드`;
}

function buildWinnerPath(
  matches: BracketMatch[],
  championId: string
): Set<string> {
  const winnerMatchIds = new Set<string>();
  const matchMap = new Map<string, BracketMatch>();

  for (const m of matches) {
    matchMap.set(m.id, m);
  }

  for (const m of matches) {
    if (m.winner?.id === championId) {
      winnerMatchIds.add(m.id);
    }
  }

  return winnerMatchIds;
}

function buildConnectorKey(fromId: string, toId: string): string {
  return `${fromId}->${toId}`;
}

export default function BracketView({
  matches,
  totalRounds,
  tournamentName,
  onMatchClick,
  isLive = false,
  championId = null,
}: BracketViewProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { ref: bracketRef, inView } = useInView({ threshold: 0.05 });

  const firstRoundMatches = useMemo(() => {
    const round1 = matches.filter((m) => m.round === 1);
    return round1.length > 0 ? round1.length : Math.pow(2, totalRounds - 1);
  }, [matches, totalRounds]);

  const winnerMatchIds = useMemo(() => {
    if (!championId) return new Set<string>();
    return buildWinnerPath(matches, championId);
  }, [matches, championId]);

  const { positions, svgWidth, svgHeight } = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();

    for (const m of matches) {
      const matchIndex = m.matchNumber - 1;
      const pos = calculateMatchPosition(m.round, matchIndex, firstRoundMatches);
      posMap.set(m.id, pos);
    }

    const w = totalRounds * (CARD_W + H_GAP) + LEFT_PAD + 40;
    const h = firstRoundMatches * (CARD_H + BASE_V_GAP) + TOP_PAD + 40;

    return { positions: posMap, svgWidth: w, svgHeight: h };
  }, [matches, totalRounds, firstRoundMatches]);

  const connectors = useMemo(() => {
    const result: Array<{
      key: string;
      fromPosition: { x: number; y: number; width: number; height: number };
      toPosition: { x: number; y: number; height: number };
      isWinnerPath: boolean;
      roundIndex: number;
    }> = [];

    for (const m of matches) {
      if (!m.nextMatchId) continue;
      const fromPos = positions.get(m.id);
      const toPos = positions.get(m.nextMatchId);
      if (!fromPos || !toPos) continue;

      const isWinner =
        championId !== null &&
        winnerMatchIds.has(m.id) &&
        winnerMatchIds.has(m.nextMatchId);

      result.push({
        key: buildConnectorKey(m.id, m.nextMatchId),
        fromPosition: { ...fromPos, width: CARD_W, height: CARD_H },
        toPosition: { ...toPos, height: CARD_H },
        isWinnerPath: isWinner,
        roundIndex: m.round - 1,
      });
    }

    return result;
  }, [matches, positions, championId, winnerMatchIds]);

  const roundHeaders = useMemo(() => {
    const headers: Array<{ round: number; label: string; x: number }> = [];
    for (let r = 1; r <= totalRounds; r++) {
      const x = (r - 1) * (CARD_W + H_GAP) + LEFT_PAD + CARD_W / 2;
      headers.push({ round: r, label: getRoundLabel(r, totalRounds), x });
    }
    return headers;
  }, [totalRounds]);

  const finalMatch = matches.find(
    (m) => m.round === totalRounds && m.status === 'completed' && m.winner
  );

  return (
    <div className="space-y-3">
      {tournamentName && (
        <h2
          className={themeClass(
            'text-xl font-black text-black dark:text-slate-100',
            'text-xl font-bold text-gray-900 dark:text-slate-100'
          )}
        >
          {tournamentName}
        </h2>
      )}

      <div
        ref={bracketRef}
        className={`overflow-x-auto ${themeClass(
          'rounded-[5px] border-2 border-black dark:border-[#f1f3f8] bg-gray-50 dark:bg-slate-900 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
          'rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm'
        )}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`min-w-[${svgWidth}px]`}
          role="img"
          aria-label={tournamentName ?? '토너먼트 대진표'}
        >
          {inView &&
            roundHeaders.map((header) => (
              <text
                key={`round-header-${header.round}`}
                x={header.x}
                y={28}
                textAnchor="middle"
                className={isNeoBrutalism ? 'fill-black dark:fill-slate-100' : 'fill-gray-500 dark:fill-slate-400'}
                fontSize="13"
                fontWeight={isNeoBrutalism ? '900' : '600'}
              >
                {header.label}
              </text>
            ))}

          {inView &&
            connectors.map((conn) => (
              <BracketConnector
                key={conn.key}
                fromPosition={conn.fromPosition}
                toPosition={conn.toPosition}
                isWinnerPath={conn.isWinnerPath}
                animationDelay={0}
                roundIndex={conn.roundIndex}
              />
            ))}

          {inView &&
            matches.map((match) => {
              const pos = positions.get(match.id);
              if (!pos) return null;

              const isFinalMatch =
                match.round === totalRounds && match.status === 'completed';
              const isChampionMatch = isFinalMatch && match.winner?.id === championId;
              const cardDelay = (match.round - 1) * 0.15 + (match.matchNumber - 1) * 0.05;

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  position={pos}
                  width={CARD_W}
                  height={CARD_H}
                  animationDelay={cardDelay}
                  isChampionMatch={isChampionMatch}
                  isLive={isLive}
                  onClick={onMatchClick ? () => onMatchClick(match.id) : undefined}
                />
              );
            })}

          {inView && finalMatch?.winner && championId && (
            <g>
              <text
                x={(totalRounds - 1) * (CARD_W + H_GAP) + LEFT_PAD + CARD_W + 30}
                y={svgHeight / 2 - 8}
                textAnchor="start"
                className={isNeoBrutalism ? 'fill-black dark:fill-slate-100' : 'fill-gray-800 dark:fill-slate-200'}
                fontSize="11"
                fontWeight="700"
              >
                우승
              </text>
              <text
                x={(totalRounds - 1) * (CARD_W + H_GAP) + LEFT_PAD + CARD_W + 30}
                y={svgHeight / 2 + 10}
                textAnchor="start"
                className="fill-red-500"
                fontSize="15"
                fontWeight="900"
              >
                {finalMatch.winner.name}
              </text>
            </g>
          )}
        </svg>
      </div>

      {championId && finalMatch?.winner && (
        <div
          className={themeClass(
            'flex items-center gap-2 rounded-[5px] border-2 border-black bg-[#facc15] px-4 py-2.5 shadow-[4px_4px_0px_0px_#000]',
            'flex items-center gap-2 rounded-xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-950/40 px-4 py-2.5 shadow-sm'
          )}
        >
          <span className="text-lg">🏆</span>
          <span
            className={themeClass(
              'font-black text-black',
              'font-bold text-gray-900 dark:text-yellow-100'
            )}
          >
            우승: {finalMatch.winner.name}
          </span>
        </div>
      )}
    </div>
  );
}
