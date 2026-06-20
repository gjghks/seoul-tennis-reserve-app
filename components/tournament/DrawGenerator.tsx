'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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

interface DrawGeneratorProps {
  tournamentId: string;
  matchType: string;
  maxParticipants: number;
  initialParticipants?: TournamentParticipant[];
  onUpdated?: () => void;
}

const isPowerOfTwo = (value: number) => value > 0 && (value & (value - 1)) === 0;

export default function DrawGenerator({
  tournamentId,
  matchType,
  maxParticipants,
  initialParticipants = [],
  onUpdated,
}: DrawGeneratorProps) {
  const themeClass = useThemeClass();
  const { showToast } = useToast();

  const [participants, setParticipants] = useState<TournamentParticipant[]>(initialParticipants);
  const [name, setName] = useState('');
  const [seedNumber, setSeedNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [slotText, setSlotText] = useState('');

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  const warningMessage = useMemo(() => {
    if (participants.length < 2) {
      return '참가자가 너무 적습니다. 최소 2명 이상 등록해주세요.';
    }

    if (!isPowerOfTwo(participants.length)) {
      return '현재 인원은 2의 거듭제곱이 아니어서 부전승(BYE)이 발생할 수 있습니다.';
    }

    return null;
  }, [participants.length]);

  const addParticipant = useCallback(async () => {
    if (!name.trim()) {
      showToast('참가자 이름을 입력해주세요.', 'error');
      return;
    }

    if (participants.length >= maxParticipants) {
      showToast(`최대 참가자 수(${maxParticipants}명)를 초과할 수 없습니다.`, 'error');
      return;
    }

    const seed = seedNumber ? Number(seedNumber) : null;
    if (seed !== null && (!Number.isInteger(seed) || seed < 1)) {
      showToast('시드 번호는 1 이상의 정수여야 합니다.', 'error');
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          seed_number: seed,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || '참가자 추가에 실패했습니다.');
      }

      const createdParticipant: TournamentParticipant = data.participant || {
        id: `${Date.now()}`,
        tournament_id: tournamentId,
        user_id: null,
        name: name.trim(),
        seed_number: seed,
        partner_name: null,
        created_at: new Date().toISOString(),
      };

      setParticipants((prev) => [...prev, createdParticipant]);
      setName('');
      setSeedNumber('');
      showToast('참가자가 추가되었습니다.', 'success');
      onUpdated?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '참가자 추가 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsAdding(false);
    }
  }, [name, seedNumber, participants.length, maxParticipants, showToast, tournamentId, onUpdated]);

  const removeParticipant = useCallback(
    async (participantId: string) => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/participants/${participantId}`, {
          method: 'DELETE',
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || '참가자 삭제에 실패했습니다.');
        }

        setParticipants((prev) => prev.filter((participant) => participant.id !== participantId));
        showToast('참가자가 삭제되었습니다.', 'success');
        onUpdated?.();
      } catch (error) {
        showToast(error instanceof Error ? error.message : '참가자 삭제 중 오류가 발생했습니다.', 'error');
      }
    },
    [showToast, tournamentId, onUpdated]
  );

  const runSlotAnimation = useCallback(async () => {
    if (matchType !== 'random_doubles' || participants.length < 2) {
      return;
    }

    const allNames = participants.map((participant) => participant.name);
    const endAt = Date.now() + 1800;

    while (Date.now() < endAt) {
      const first = allNames[Math.floor(Math.random() * allNames.length)] || '';
      const second = allNames[Math.floor(Math.random() * allNames.length)] || '';
      setSlotText(`${first} + ${second}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setSlotText('파트너 배정 완료');
  }, [matchType, participants]);

  const handleDraw = useCallback(
    async (drawType: 'random' | 'seeded') => {
      if (participants.length < 2) {
        showToast('대진 추첨을 위해 최소 2명의 참가자가 필요합니다.', 'error');
        return;
      }

      setIsDrawing(true);

      try {
        await runSlotAnimation();

        const response = await fetch(`/api/tournaments/${tournamentId}/draw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draw_type: drawType,
            participants: participants.map((participant) => ({
              id: participant.id,
              name: participant.name,
              seed_number: participant.seed_number,
            })),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || '대진 추첨에 실패했습니다.');
        }

        showToast(drawType === 'seeded' ? '시드 추첨이 완료되었습니다.' : '랜덤 추첨이 완료되었습니다.', 'success');
        onUpdated?.();
      } catch (error) {
        showToast(error instanceof Error ? error.message : '대진 추첨 중 오류가 발생했습니다.', 'error');
      } finally {
        setIsDrawing(false);
      }
    },
    [participants, runSlotAnimation, showToast, tournamentId, onUpdated]
  );

  const inputClass = cn(
    'w-full px-3 py-2 outline-none transition-all',
    themeClass(
      'bg-white dark:bg-slate-900 border-2 border-black rounded-[5px] font-bold text-black dark:text-slate-100 focus:shadow-[3px_3px_0px_0px_#000]',
      'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500'
    )
  );

  return (
    <section
      className={cn(
        'p-5 space-y-4',
        themeClass(
          'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
          'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm'
        )
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className={cn('text-lg', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>참가자 관리</h3>
        <span className={cn('text-sm', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
          {participants.length}/{maxParticipants}명
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_110px_90px] gap-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          placeholder="참가자 이름"
          maxLength={30}
        />
        <input
          type="number"
          min={1}
          value={seedNumber}
          onChange={(event) => setSeedNumber(event.target.value)}
          className={inputClass}
          placeholder="시드"
        />
        <button
          type="button"
          onClick={addParticipant}
          disabled={isAdding}
          className={cn(
            'px-3 py-2 text-sm transition-all disabled:opacity-50',
            themeClass(
              'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black',
              'bg-green-600 rounded-lg font-bold text-white hover:bg-green-700'
            )
          )}
        >
          {isAdding ? <Spinner className="mx-auto border-current border-t-transparent" /> : '추가'}
        </button>
      </div>

      {participants.length === 0 ? (
        <p className={themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>등록된 참가자가 없습니다.</p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className={cn(
                'flex items-center justify-between px-3 py-2',
                themeClass('bg-[#f8fafc] dark:bg-slate-900 border-2 border-black rounded-[5px]', 'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg')
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {participant.seed_number ? (
                  <span className={cn('text-xs px-2 py-0.5 rounded', themeClass('font-black bg-[#facc15] border-2 border-black text-black', 'font-bold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/50'))}>
                    #{participant.seed_number}
                  </span>
                ) : null}
                <span className={cn('truncate', themeClass('font-bold text-black dark:text-slate-100', 'font-medium text-gray-800 dark:text-slate-200'))}>{participant.name}</span>
                {participant.partner_name ? (
                  <span className={cn('text-xs truncate', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
                    ({participant.partner_name})
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeParticipant(participant.id)}
                className={cn('text-xs transition-colors', themeClass('font-black text-red-600 hover:text-red-700', 'font-medium text-red-500 hover:text-red-600'))}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {warningMessage ? (
        <div className={cn('p-3 text-sm', themeClass('bg-[#fff7ed] dark:bg-amber-950/40 border-2 border-black rounded-[5px] font-bold text-black dark:text-amber-200', 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300'))}>
          {warningMessage}
        </div>
      ) : null}

      {matchType === 'random_doubles' && slotText ? (
        <div
          className={cn(
            'p-3 text-center animate-pulse',
            themeClass('bg-[#f0fdf4] dark:bg-green-950/40 border-2 border-black rounded-[5px] font-black text-black dark:text-green-200', 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-lg font-bold text-green-700 dark:text-green-300')
          )}
        >
          {slotText}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleDraw('random')}
          disabled={isDrawing || participants.length < 2}
          className={cn(
            'flex-1 py-3 transition-all disabled:opacity-50',
            themeClass(
              'bg-[#88aaee] border-2 border-black rounded-[5px] font-black text-black shadow-[3px_3px_0px_0px_#000]',
              'bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700'
            )
          )}
        >
          {isDrawing ? <Spinner className="mx-auto border-current border-t-transparent" /> : '랜덤 추첨'}
        </button>
        <button
          type="button"
          onClick={() => handleDraw('seeded')}
          disabled={isDrawing || participants.length < 2}
          className={cn(
            'flex-1 py-3 transition-all disabled:opacity-50',
            themeClass(
              'bg-[#facc15] border-2 border-black rounded-[5px] font-black text-black shadow-[3px_3px_0px_0px_#000]',
              'bg-amber-500 rounded-lg font-bold text-white hover:bg-amber-600'
            )
          )}
        >
          {isDrawing ? <Spinner className="mx-auto border-current border-t-transparent" /> : '시드 추첨'}
        </button>
      </div>
    </section>
  );
}
