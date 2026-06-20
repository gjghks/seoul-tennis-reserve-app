'use client';

import { useState, useCallback, useEffect } from 'react';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import Spinner from '@/components/ui/Spinner';

interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string | null;
  name: string;
  seed_number: number | null;
  partner_name: string | null;
  created_at: string;
}

interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  score: { p1: number; p2: number }[] | null;
  status: string;
  next_match_id: string | null;
  court_number: number | null;
  completed_at: string | null;
  created_at: string;
  participant1?: TournamentParticipant | null;
  participant2?: TournamentParticipant | null;
  winner?: TournamentParticipant | null;
}

interface LiveScoreInputProps {
  isOpen: boolean;
  tournamentId: string;
  scoringFormat: string;
  match: TournamentMatch | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

function getInitialSetCount(scoringFormat: string): number {
  if (scoringFormat === 'best_of_3') {
    return 3;
  }
  return 1;
}

export default function LiveScoreInput({
  isOpen,
  tournamentId,
  scoringFormat,
  match,
  onClose,
  onSubmitted,
}: LiveScoreInputProps) {
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const [sets, setSets] = useState<{ p1: number; p2: number }[]>([{ p1: 0, p2: 0 }]);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!match) {
      return;
    }

    const count = getInitialSetCount(scoringFormat);
    const existingScore = match.score && match.score.length > 0 ? match.score : [];
    const nextSets = Array.from({ length: count }, (_, index) => existingScore[index] || { p1: 0, p2: 0 });
    setSets(nextSets);
    setWinnerId(match.winner_id || null);
  }, [match, scoringFormat]);

  const updateSet = useCallback((index: number, key: 'p1' | 'p2', value: number) => {
    setSets((prev) => prev.map((set, setIndex) => (setIndex === index ? { ...set, [key]: value } : set)));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!match) {
      return;
    }

    if (!winnerId) {
      showToast('승자를 선택해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: match.id,
          score: sets,
          winner_id: winnerId,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || '점수 저장에 실패했습니다.');
      }

      showToast('점수가 저장되었습니다.', 'success');
      onSubmitted?.();
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '점수 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [match, winnerId, showToast, tournamentId, sets, onSubmitted, onClose]);

  if (!isOpen || !match) {
    return null;
  }

  const player1Name = match.participant1?.name || '참가자 1';
  const player2Name = match.participant2?.name || '참가자 2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
      <div
        className={cn(
          'w-full max-w-lg max-h-[90vh] overflow-y-auto p-5',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[6px_6px_0px_0px_#000]',
            'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl'
          )
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className={cn('text-lg', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>실시간 점수 입력</h3>
            <p className={cn('text-sm mt-1', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
              {player1Name} vs {player2Name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn('text-sm', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'))}
          >
            닫기
          </button>
        </div>

        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={`set-${index + 1}`}
              className={cn(
                'p-3',
                themeClass('bg-gray-50 dark:bg-slate-900 border-2 border-black rounded-[5px]', 'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg')
              )}
            >
              <p className={cn('text-xs mb-2', themeClass('font-black text-black/70 dark:text-slate-300', 'font-bold text-gray-500 dark:text-slate-400'))}>SET {index + 1}</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={set.p1}
                  onChange={(event) => updateSet(index, 'p1', Number(event.target.value))}
                  className={cn(
                    'w-full text-center px-2 py-2 outline-none',
                    themeClass(
                      'bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-black text-black dark:text-slate-100',
                      'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500'
                    )
                  )}
                />
                <span className={cn('text-lg', themeClass('font-black text-black dark:text-slate-100', 'font-medium text-gray-400 dark:text-slate-500'))}>-</span>
                <input
                  type="number"
                  min={0}
                  value={set.p2}
                  onChange={(event) => updateSet(index, 'p2', Number(event.target.value))}
                  className={cn(
                    'w-full text-center px-2 py-2 outline-none',
                    themeClass(
                      'bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-black text-black dark:text-slate-100',
                      'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500'
                    )
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className={cn('text-sm mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-700 dark:text-slate-200'))}>승자 선택</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWinnerId(match.participant1_id)}
              disabled={!match.participant1_id}
              className={cn(
                'px-3 py-2 text-sm transition-all disabled:opacity-50',
                winnerId === match.participant1_id
                  ? themeClass('bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black', 'bg-green-600 rounded-lg font-bold text-white')
                  : themeClass('bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-bold text-black dark:text-slate-100', 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200')
              )}
            >
              {player1Name}
            </button>
            <button
              type="button"
              onClick={() => setWinnerId(match.participant2_id)}
              disabled={!match.participant2_id}
              className={cn(
                'px-3 py-2 text-sm transition-all disabled:opacity-50',
                winnerId === match.participant2_id
                  ? themeClass('bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black', 'bg-green-600 rounded-lg font-bold text-white')
                  : themeClass('bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-bold text-black dark:text-slate-100', 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200')
              )}
            >
              {player2Name}
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-1 py-3 text-sm transition-all',
              themeClass(
                'bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-black text-black dark:text-slate-100',
                'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
              )
            )}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'flex-[2] py-3 text-sm transition-all disabled:opacity-50',
              themeClass(
                'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black shadow-[3px_3px_0px_0px_#000]',
                'bg-green-600 rounded-lg font-bold text-white hover:bg-green-700'
              )
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="border-current border-t-transparent" />
                저장 중...
              </span>
            ) : (
              '점수 저장'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
