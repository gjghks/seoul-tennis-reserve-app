'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import ShareButton from '@/components/ui/ShareButton';
import KakaoShareButton from '@/components/ui/KakaoShareButton';
import DrawGenerator from '@/components/tournament/DrawGenerator';
import LiveScoreInput from '@/components/tournament/LiveScoreInput';
import Spinner from '@/components/ui/Spinner';

interface Tournament {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  format: string;
  match_type: string;
  scoring_format: string;
  no_ad_scoring: boolean;
  max_participants: number;
  status: string;
  share_token: string | null;
  is_public: boolean;
  draw_type: string;
  play_date: string | null;
  location: string | null;
  district: string | null;
  court_name: string | null;
  created_at: string;
  updated_at: string;
  participants?: TournamentParticipant[];
  matches?: TournamentMatch[];
  creator_name?: string;
}

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

interface TournamentDetailResponse {
  tournament?: Tournament;
  data?: Tournament;
}

interface BracketViewProps {
  tournament: Tournament;
  matches: TournamentMatch[];
  participants: TournamentParticipant[];
  onMatchClick?: (match: TournamentMatch) => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: '임시저장',
  registration: '모집중',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: '싱글 엘리미네이션',
  round_robin: '라운드 로빈',
  round_robin_playoff: '라운드 로빈 + 토너먼트',
};

const MATCH_TYPE_LABELS: Record<string, string> = {
  singles: '단식',
  mens_doubles: '남복',
  womens_doubles: '여복',
  mixed_doubles: '혼복',
  random_doubles: '잡복',
};

const SCORING_LABELS: Record<string, string> = {
  games_4: '4게임',
  games_6: '6게임',
  pro_set_8: '8게임 프로세트',
  tiebreak_10: '10포인트 타이브레이크',
  best_of_3: '3세트 매치',
};

const BRACKET_VIEW_MODULE = './BracketView';

const BracketView = dynamic<BracketViewProps>(
  async () => {
    try {
      const mod = await import(BRACKET_VIEW_MODULE);
      return mod.default;
    } catch {
      return function BracketFallback() {
        return (
          <div className="w-full py-10 text-center text-sm text-gray-500">
            브래킷 뷰를 불러올 수 없습니다.
          </div>
        );
      };
    }
  },
  { ssr: false }
);

const fetcher = async (url: string): Promise<TournamentDetailResponse> => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || '대회 상세를 불러오지 못했습니다.');
  }

  return data;
};

export default function TournamentDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const router = useRouter();
  const [showDrawGenerator, setShowDrawGenerator] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [isLiveScoreOpen, setIsLiveScoreOpen] = useState(false);

  const { data, isLoading, error, mutate } = useSWR<TournamentDetailResponse>(`/api/tournaments/${id}`, fetcher);
  const tournament = data?.tournament || data?.data;

  const isCreator = user?.id && tournament?.creator_id === user.id;
  const participants = tournament?.participants || [];
  const matches = tournament?.matches || [];
  const hasDraw = matches.length > 0;

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return `${window.location.origin}/tournaments/${id}`;
  }, [id]);

  const openScoreInput = useCallback(() => {
    const candidate = matches.find((match) => match.status === 'in_progress' || match.status === 'pending') || null;
    if (!candidate) {
      showToast('점수를 입력할 경기가 없습니다.', 'error');
      return;
    }
    setSelectedMatch(candidate);
    setIsLiveScoreOpen(true);
  }, [matches, showToast]);

  if (isLoading) {
    return (
      <div className={cn('min-h-screen py-10', themeClass('bg-nb-bg', 'bg-gray-50'))}>
        <div className="container mx-auto px-4 max-w-4xl flex items-center justify-center py-28">
          <Spinner size="md" className={themeClass('text-black', 'text-green-600')} />
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className={cn('min-h-screen py-10', themeClass('bg-nb-bg', 'bg-gray-50'))}>
        <div className="container mx-auto px-4 max-w-4xl text-center py-20">
          <h1 className={cn('text-2xl mb-3', themeClass('font-black text-black', 'font-bold text-gray-900'))}>대회를 찾을 수 없습니다</h1>
          <p className={cn('mb-5', themeClass('font-bold text-black/60', 'text-gray-500'))}>{error?.message}</p>
          <Link href="/tournaments" className="underline font-bold">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50'))}>
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <button type="button" onClick={() => router.push('/tournaments')} className={cn('flex items-center gap-2', themeClass('font-black text-black', 'font-bold text-gray-600 hover:text-gray-900'))}>
          <span>←</span>
          목록으로
        </button>

        <section
          className={cn(
            'p-6',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
              'bg-white rounded-2xl border border-gray-100 shadow-sm'
            )
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 text-xs rounded font-bold',
                  tournament.status === 'registration'
                    ? themeClass('bg-[#88aaee] border-2 border-black text-black', 'bg-blue-100 border border-blue-200 text-blue-700')
                    : tournament.status === 'in_progress'
                      ? themeClass('bg-[#22c55e] border-2 border-black text-black', 'bg-green-100 border border-green-200 text-green-700')
                      : tournament.status === 'completed'
                        ? themeClass('bg-[#facc15] border-2 border-black text-black', 'bg-yellow-100 border border-yellow-200 text-yellow-700')
                        : tournament.status === 'cancelled'
                          ? themeClass('bg-[#ff90e8] border-2 border-black text-black', 'bg-red-100 border border-red-200 text-red-700')
                          : themeClass('bg-gray-300 border-2 border-black text-black', 'bg-gray-100 border border-gray-200 text-gray-700')
                )}
              >
                {STATUS_LABELS[tournament.status] || '상태 미정'}
              </span>
              <span className={cn('text-sm', themeClass('font-bold text-black/60', 'text-gray-500'))}>
                주최자: {tournament.creator_name || '익명'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton title={tournament.title} text="대회 대진표를 확인해보세요" url={shareUrl} showLabel />
              <KakaoShareButton title={tournament.title} description="서울 테니스 대회 대진표" url={shareUrl} />
            </div>
          </div>

          <h1 className={cn('text-2xl mb-2', themeClass('font-black text-black', 'font-bold text-gray-900'))}>{tournament.title}</h1>
          <p className={cn('text-sm whitespace-pre-wrap', themeClass('font-bold text-black/70', 'text-gray-600'))}>
            {tournament.description || '대회 설명이 없습니다.'}
          </p>
        </section>

        <section
          className={cn(
            'p-6',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
              'bg-white rounded-2xl border border-gray-100 shadow-sm'
            )
          )}
        >
          <h2 className={cn('text-lg mb-4', themeClass('font-black text-black', 'font-bold text-gray-900'))}>대회 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>형식</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>{FORMAT_LABELS[tournament.format] || tournament.format}</p>
            </div>
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>경기 종류</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>
                {MATCH_TYPE_LABELS[tournament.match_type] || tournament.match_type}
              </p>
            </div>
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>스코어 형식</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>
                {SCORING_LABELS[tournament.scoring_format] || tournament.scoring_format}
              </p>
            </div>
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>노애드</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>{tournament.no_ad_scoring ? '사용' : '미사용'}</p>
            </div>
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>경기 날짜</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>
                {tournament.play_date ? new Date(tournament.play_date).toLocaleDateString('ko-KR') : '미정'}
              </p>
            </div>
            <div>
              <span className={themeClass('font-black text-black/60', 'font-bold text-gray-500')}>장소</span>
              <p className={themeClass('font-bold text-black', 'text-gray-800')}>
                {[tournament.location, tournament.district, tournament.court_name].filter(Boolean).join(' / ') || '미정'}
              </p>
            </div>
          </div>
        </section>

        <section
          className={cn(
            'p-6',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
              'bg-white rounded-2xl border border-gray-100 shadow-sm'
            )
          )}
        >
          <h2 className={cn('text-lg mb-4', themeClass('font-black text-black', 'font-bold text-gray-900'))}>참가자 ({participants.length}/{tournament.max_participants})</h2>
          {participants.length === 0 ? (
            <p className={themeClass('font-bold text-black/60', 'text-gray-500')}>아직 참가자가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={cn(
                    'px-3 py-2 flex items-center gap-2',
                    themeClass('bg-gray-50 border-2 border-black rounded-[5px]', 'bg-gray-50 border border-gray-200 rounded-lg')
                  )}
                >
                  {participant.seed_number ? (
                    <span className={cn('text-xs px-2 py-0.5 rounded', themeClass('font-black bg-[#facc15] border-2 border-black text-black', 'font-bold bg-yellow-100 border border-yellow-200 text-yellow-700'))}>
                      #{participant.seed_number}
                    </span>
                  ) : null}
                  <span className={cn('text-sm', themeClass('font-bold text-black', 'font-medium text-gray-800'))}>{participant.name}</span>
                  {participant.partner_name ? (
                    <span className={cn('text-xs', themeClass('font-bold text-black/60', 'text-gray-500'))}>({participant.partner_name})</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {hasDraw && tournament.format === 'single_elimination' ? (
          <section
            className={cn(
              'p-6',
              themeClass(
                'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                'bg-white rounded-2xl border border-gray-100 shadow-sm'
              )
            )}
          >
            <h2 className={cn('text-lg mb-4', themeClass('font-black text-black', 'font-bold text-gray-900'))}>브래킷</h2>
            <div className="overflow-x-auto">
              <BracketView tournament={tournament} matches={matches} participants={participants} onMatchClick={(match: TournamentMatch) => {
                setSelectedMatch(match);
                setIsLiveScoreOpen(true);
              }} />
            </div>
          </section>
        ) : (
          <section
            className={cn(
              'p-6 text-center',
              themeClass(
                'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                'bg-white rounded-2xl border border-gray-100 shadow-sm'
              )
            )}
          >
            <h2 className={cn('text-lg mb-2', themeClass('font-black text-black', 'font-bold text-gray-900'))}>브래킷</h2>
            <p className={themeClass('font-bold text-black/60', 'text-gray-500')}>
              대진 추첨 후 브래킷이 표시됩니다.
            </p>
          </section>
        )}

        <section
          className={cn(
            'p-6',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
              'bg-white rounded-2xl border border-gray-100 shadow-sm'
            )
          )}
        >
          <h2 className={cn('text-lg mb-4', themeClass('font-black text-black', 'font-bold text-gray-900'))}>액션</h2>

          {isCreator ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowDrawGenerator((prev) => !prev)}
                  className={cn(
                    'px-4 py-2 text-sm transition-all',
                    themeClass(
                      'bg-white border-2 border-black rounded-[5px] font-black text-black',
                      'bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50'
                    )
                  )}
                >
                  참가자 관리
                </button>
                <button
                  type="button"
                  onClick={() => setShowDrawGenerator(true)}
                  className={cn(
                    'px-4 py-2 text-sm transition-all',
                    themeClass(
                      'bg-[#88aaee] border-2 border-black rounded-[5px] font-black text-black',
                      'bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700'
                    )
                  )}
                >
                  대진 추첨
                </button>
                <button
                  type="button"
                  onClick={openScoreInput}
                  className={cn(
                    'px-4 py-2 text-sm transition-all',
                    themeClass(
                      'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black',
                      'bg-green-600 rounded-lg font-bold text-white hover:bg-green-700'
                    )
                  )}
                >
                  점수 입력
                </button>
              </div>

              {showDrawGenerator ? (
                <DrawGenerator
                  tournamentId={tournament.id}
                  matchType={tournament.match_type}
                  maxParticipants={tournament.max_participants}
                  initialParticipants={participants}
                  onUpdated={() => mutate()}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShareButton title={tournament.title} text="대회 대진표를 공유해보세요" url={shareUrl} showLabel />
              <KakaoShareButton title={tournament.title} description="서울 테니스 대회 대진표" url={shareUrl} />
            </div>
          )}
        </section>
      </div>

      <LiveScoreInput
        isOpen={isLiveScoreOpen}
        tournamentId={tournament.id}
        scoringFormat={tournament.scoring_format}
        match={selectedMatch}
        onClose={() => {
          setSelectedMatch(null);
          setIsLiveScoreOpen(false);
        }}
        onSubmitted={() => mutate()}
      />
    </div>
  );
}
