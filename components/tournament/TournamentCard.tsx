'use client';

import Link from 'next/link';
import { useThemeClass, cn } from '@/lib/cn';

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

interface TournamentCardProps {
  tournament: Tournament;
}

const STATUS_LABELS: Record<string, string> = {
  draft: '임시저장',
  registration: '모집중',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

const MATCH_TYPE_LABELS: Record<string, string> = {
  singles: '단식',
  mens_doubles: '남복',
  womens_doubles: '여복',
  mixed_doubles: '혼복',
  random_doubles: '잡복',
};

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: '싱글엘림',
  round_robin: '라운드로빈',
  round_robin_playoff: '라운드로빈+토너먼트',
};

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const themeClass = useThemeClass();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'registration':
        return themeClass('bg-[#88aaee] text-black border-2 border-black', 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50');
      case 'in_progress':
        return themeClass('bg-[#22c55e] text-black border-2 border-black', 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/50');
      case 'completed':
        return themeClass('bg-[#facc15] text-black border-2 border-black', 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900/50');
      case 'cancelled':
        return themeClass('bg-[#ff90e8] text-black border-2 border-black', 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50');
      case 'draft':
      default:
        return themeClass('bg-gray-300 text-black border-2 border-black', 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700');
    }
  };

  const participantCount = tournament.participants?.length ?? 0;
  const dateLabel = tournament.play_date
    ? new Date(tournament.play_date).toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
      })
    : '날짜 미정';

  return (
    <Link href={`/tournaments/${tournament.id}`} className="block">
      <article
        className={cn(
          'relative overflow-hidden transition-all p-5',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-[2px_2px_0px_0px_#f1f3f8]',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1'
          )
        )}
      >
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('px-2 py-0.5 text-xs font-bold rounded', getStatusClass(tournament.status))}>
              {STATUS_LABELS[tournament.status] || '상태 미정'}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-bold rounded',
                themeClass('bg-black text-white', 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200')
              )}
            >
              {MATCH_TYPE_LABELS[tournament.match_type] || '기타'}
            </span>
          </div>
          <span className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>{dateLabel}</span>
        </div>

        <h3 className={cn('text-lg mb-3 line-clamp-1', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>{tournament.title}</h3>

        <p className={cn('text-sm mb-4', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
          {FORMAT_LABELS[tournament.format] || tournament.format}
        </p>

        <div className={cn('pt-3 border-t flex items-center justify-between', themeClass('border-black/10 dark:border-slate-700', 'border-gray-100 dark:border-slate-700'))}>
          <span className={cn('text-sm', themeClass('font-bold text-black/70 dark:text-slate-300', 'font-medium text-gray-600 dark:text-slate-400'))}>
            {tournament.district || '지역 미정'}
          </span>
          <span
            className={cn(
              'text-sm font-bold',
              participantCount >= tournament.max_participants
                ? themeClass('text-[#ff90e8]', 'text-red-500')
                : themeClass('text-[#22c55e]', 'text-green-700')
            )}
          >
            {participantCount}/{tournament.max_participants}명
          </span>
        </div>
      </article>
    </Link>
  );
}
