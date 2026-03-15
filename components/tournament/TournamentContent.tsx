'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import TournamentCard from '@/components/tournament/TournamentCard';
import TournamentLifecycleDemo from '@/components/tournament/TournamentLifecycleDemo';
import EmptyState from '@/components/ui/EmptyState';
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

interface TournamentListResponse {
  tournaments?: Tournament[];
  data?: Tournament[];
  total?: number;
}

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'registration', label: '모집중' },
  { value: 'in_progress', label: '진행중' },
  { value: 'completed', label: '완료' },
];

const fetcher = async (url: string): Promise<TournamentListResponse> => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || '대회 목록을 불러오지 못했습니다.');
  }

  return data;
};

export default function TournamentContent() {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const router = useRouter();

  const [status, setStatus] = useState('');
  const [myOnly, setMyOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [exampleOpen, setExampleOpen] = useState(false);

  const query = new URLSearchParams({
    limit: String(page * PAGE_SIZE),
    offset: '0',
  });

  if (status) {
    query.set('status', status);
  }

  if (myOnly) {
    query.set('my', 'true');
  }

  const { data, isLoading, error, mutate } = useSWR<TournamentListResponse>(
    `/api/tournaments?${query.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const tournaments = data?.tournaments || data?.data || [];
  const total = data?.total;
  const hasMore = typeof total === 'number' ? tournaments.length < total : tournaments.length >= page * PAGE_SIZE;

  const onToggleMyOnly = useCallback(() => {
    if (!user) {
      showToast('내 대회 보기는 로그인 후 이용할 수 있습니다.', 'error');
      router.push('/login?redirect=/tournaments');
      return;
    }

    setMyOnly((prev) => !prev);
    setPage(1);
  }, [user, showToast, router]);

  const onStatusChange = useCallback((next: string) => {
    setStatus(next);
    setPage(1);
  }, []);

  const onCreateClick = useCallback(() => {
    if (!user) {
      showToast('대진표 생성은 로그인 후 이용할 수 있습니다.', 'error');
      router.push('/login?redirect=/tournaments/new');
      return;
    }

    router.push('/tournaments/new');
  }, [user, showToast, router]);

  return (
    <div className={cn('container mx-auto px-4 py-6 min-h-screen scrollbar-hide', themeClass('bg-nb-bg', 'bg-gray-50'))}>
      <div className="flex items-center justify-between mb-4">
        <h1 className={cn('text-xl', themeClass('font-black text-black', 'font-bold text-gray-900'))}>대진표</h1>
        <Link
          href="/guide/tournaments"
          className={cn(
            'flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-all',
            themeClass(
              'bg-[#facc15] border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
              'bg-green-50 text-green-700 font-semibold border border-green-200 hover:bg-green-100'
            )
          )}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>사용법</span>
        </Link>
      </div>

      <div
        className={cn(
          'mb-6 p-4 rounded-xl flex flex-wrap gap-3',
          themeClass(
            'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]',
            'bg-white border border-gray-100 shadow-sm'
          )
        )}
      >
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className={cn(
            'px-3 py-2 outline-none cursor-pointer min-w-[140px]',
            themeClass(
              'bg-white border-2 border-black rounded-[5px] font-black text-black',
              'bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:ring-2 focus:ring-green-500'
            )
          )}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onToggleMyOnly}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-bold transition-colors',
            myOnly
              ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
              : themeClass('bg-white border-2 border-black hover:bg-gray-100', 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
          )}
        >
          내 대회만 보기
        </button>

        <button
          type="button"
          onClick={() => mutate()}
          className={cn(
            'ml-auto px-4 py-2 text-sm transition-all',
            themeClass(
              'border-2 border-black rounded-[5px] font-bold hover:bg-[#facc15]',
              'border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 bg-white'
            )
          )}
        >
          새로고침
        </button>
      </div>

      <div className={cn(
        'relative mb-6 transition-all',
        themeClass(
          'bg-white border-2 border-dashed border-black/30 rounded-[5px] overflow-hidden',
          'bg-gray-50/80 border border-dashed border-gray-300 rounded-2xl overflow-hidden'
        )
      )}>
        <button
          type="button"
          onClick={() => setExampleOpen(!exampleOpen)}
          className={cn(
            'w-full p-5 text-left cursor-pointer transition-colors',
            themeClass('hover:bg-black/[0.02]', 'hover:bg-gray-50')
          )}
        >
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('px-2 py-0.5 text-xs font-bold rounded', themeClass('bg-[#22c55e]/50 text-black/50 border border-black/20', 'bg-green-100/70 text-green-700/60 border border-green-200'))}>진행중</span>
              <span className={cn('px-2 py-0.5 text-xs font-bold rounded', themeClass('bg-black/10 text-black/50', 'bg-gray-100 text-gray-500'))}>남복</span>
              <span className={cn('text-xs', themeClass('font-bold text-black/30', 'text-gray-300'))}>3.22</span>
            </div>
            <span className={cn('flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded', themeClass('bg-black/10 text-black/50', 'bg-gray-200 text-gray-500'))}>예시 {exampleOpen ? '▲' : '▼'}</span>
          </div>
          <h3 className={cn('text-lg mb-3 line-clamp-1', themeClass('font-black text-black/50', 'font-bold text-gray-400'))}>3월 월례 친선대회</h3>
          <p className={cn('text-sm mb-4', themeClass('font-bold text-black/35', 'text-gray-400'))}>싱글엘림</p>
          <div className={cn('pt-3 border-t flex items-center justify-between', themeClass('border-black/10', 'border-gray-100'))}>
            <span className={cn('text-sm', themeClass('font-bold text-black/40', 'font-medium text-gray-400'))}>송파구</span>
            <span className={cn('text-sm font-bold', themeClass('text-[#22c55e]/50', 'text-green-600/50'))}>6/8명</span>
          </div>
          {!exampleOpen && (
            <p className={cn('mt-3 text-xs text-center', themeClass('text-black/40 font-bold', 'text-gray-400'))}>눌러서 대진표 예시 보기</p>
          )}
        </button>
        <div className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          exampleOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className={cn('px-5 pb-5 pt-0 space-y-3', themeClass('border-t border-dashed border-black/20', 'border-t border-dashed border-gray-200'))}>
            <div className="pt-3">
              {exampleOpen && <TournamentLifecycleDemo compact autoPlay />}
            </div>
            <Link
              href="/tournaments/new"
              className={cn(
                'block w-full py-2.5 text-center text-sm font-bold rounded-lg transition-all',
                themeClass('bg-black/10 text-black/60 hover:bg-black/20', 'bg-gray-200 text-gray-600 hover:bg-gray-300')
              )}
            >
              나도 대진표 만들기 →
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className={cn(
            'text-center py-14',
            themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white rounded-2xl border border-gray-100')
          )}
        >
          <p className={cn('text-lg mb-2', themeClass('font-black text-black', 'font-bold text-gray-900'))}>오류가 발생했습니다</p>
          <p className={themeClass('font-bold text-black/60', 'text-gray-500')}>{error.message}</p>
        </div>
      ) : isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <Spinner size="md" className={themeClass('text-black', 'text-green-600')} />
        </div>
      ) : tournaments.length === 0 ? (
        <EmptyState
          icon="🏆"
          title={myOnly ? '내 대회가 없습니다' : '등록된 대회가 없습니다'}
          description={myOnly ? '직접 대진표를 만들고 참가자를 모집해보세요.' : '첫 대진표를 만들어 경기를 시작해보세요.'}
          action={{
            label: '새 대진표 만들기',
            onClick: onCreateClick,
          }}
          className={cn(
            themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white rounded-2xl border border-gray-100 shadow-sm')
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>

          {hasMore && (
            <div className="py-8 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                className={cn(
                  'px-5 py-3 text-sm transition-all',
                  themeClass(
                    'bg-white border-2 border-black rounded-[5px] font-bold shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]',
                    'bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50'
                  )
                )}
              >
                더 보기
              </button>
            </div>
          )}
        </>
      )}

      <Link
        href="/tournaments/new"
        onClick={(event) => {
          if (!user) {
            event.preventDefault();
            onCreateClick();
          }
        }}
        className={cn(
          'fixed bottom-20 right-4 sm:bottom-6 sm:right-6 px-6 py-3 flex items-center justify-center z-40 transition-all gap-2',
          themeClass(
            'bg-[#22c55e] text-black border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] font-black uppercase',
            'bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl font-bold'
          )
        )}
      >
        <span className="text-xl leading-none">+</span>
        <span>글쓰기</span>
      </Link>
    </div>
  );
}
