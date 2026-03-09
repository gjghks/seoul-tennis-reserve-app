'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchingPosts } from '@/lib/hooks/useMatchingPosts';
import MatchingPostCard from '@/components/matching/MatchingPostCard';
import Skeleton from '@/components/ui/Skeleton';
import { DISTRICTS } from '@/lib/constants/districts';
import { MatchType, MATCH_TYPE_OPTIONS } from '@/lib/constants/tennis';
import { VALID_POST_STATUSES, MATCH_POST_STATUS_LABELS, MatchPostStatus } from '@/lib/constants/matching';
import ProfileGate from '@/components/profile/ProfileGate';

const PAGE_SIZE = 20;

export default function MatchingContent() {
  const themeClass = useThemeClass();
  const { user } = useAuth();
  
  const [offset, setOffset] = useState(0);
  const [district, setDistrict] = useState<string>('');
  const [matchType, setMatchType] = useState<string>('');
  const [status, setStatus] = useState<string>('open');
  const [myMode, setMyMode] = useState(false);

  const { posts, total, isLoading, error, mutate } = useMatchingPosts({
    limit: PAGE_SIZE,
    offset,
    my: myMode || undefined,
    district: myMode ? undefined : (district || undefined),
    matchType: myMode ? undefined : ((matchType as MatchType) || undefined),
    status: myMode ? undefined : ((status as MatchPostStatus) || undefined),
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const RefreshIndicator = (
    <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  return (
    <ProfileGate feature="matching">
      <>
      <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
    >
      <div className="container mx-auto px-4 py-6">
        {user && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setMyMode(false); setOffset(0); }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                !myMode
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass('bg-white border-2 border-black hover:bg-gray-100', 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
              )}
            >
              전체 매칭
            </button>
            <button
              type="button"
              onClick={() => { setMyMode(true); setOffset(0); }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                myMode
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass('bg-white border-2 border-black hover:bg-gray-100', 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
              )}
            >
              내 매칭
            </button>
          </div>
        )}

        {!myMode && (
        <div className={cn(
          'mb-6 p-4 rounded-xl flex flex-wrap gap-3',
          themeClass(
            'bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]',
            'bg-white border border-gray-100 shadow-sm'
          )
        )}>
          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setOffset(0); }}
            className={cn(
              'px-3 py-2 outline-none cursor-pointer flex-1 min-w-[120px]',
              themeClass(
                'bg-[#facc15] border-2 border-black rounded-[5px] font-black text-black',
                'bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:ring-2 focus:ring-green-500'
              )
            )}
          >
            <option value="">모든 지역</option>
            {DISTRICTS.map(d => (
              <option key={d.slug} value={d.nameKo}>{d.nameKo}</option>
            ))}
          </select>

          <select
            value={matchType}
            onChange={(e) => { setMatchType(e.target.value); setOffset(0); }}
            className={cn(
              'px-3 py-2 outline-none cursor-pointer flex-1 min-w-[120px]',
              themeClass(
                'bg-[#ff90e8] border-2 border-black rounded-[5px] font-black text-black',
                'bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:ring-2 focus:ring-green-500'
              )
            )}
          >
            <option value="">모든 경기방식</option>
            {MATCH_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
            className={cn(
              'px-3 py-2 outline-none cursor-pointer flex-1 min-w-[120px]',
              themeClass(
                'bg-white border-2 border-black rounded-[5px] font-black text-black',
                'bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700 focus:ring-2 focus:ring-green-500'
              )
            )}
          >
            <option value="">모든 상태</option>
            {VALID_POST_STATUSES.map(s => (
              <option key={s} value={s}>{MATCH_POST_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        )}

        {error ? (
          <div className={cn(
            'text-center py-12',
            themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white rounded-2xl border border-gray-100')
          )}>
            <div className={cn('text-lg mb-2', themeClass('font-black text-black', 'font-bold text-gray-900'))}>오류가 발생했습니다</div>
            <p className={themeClass('text-black/60 font-bold', 'text-gray-500')}>{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cn(
                'p-5 h-[200px]',
                themeClass(
                  'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                  'bg-white rounded-2xl border border-gray-100 shadow-sm'
                )
              )}>
                <Skeleton className="w-1/3 h-6 mb-4" />
                <Skeleton className="w-full h-8 mb-4" />
                <Skeleton className="w-2/3 h-5 mb-2" />
                <Skeleton className="w-1/2 h-5" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className={cn(
            'text-center py-16',
            themeClass('bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white rounded-2xl border border-gray-100 shadow-sm')
          )}>
            <div className="text-4xl mb-4">🎾</div>
            <div className={cn('text-xl mb-2', themeClass('font-black text-black', 'font-bold text-gray-900'))}>
              {myMode ? '참여한 매칭이 없습니다' : '조건에 맞는 매칭이 없습니다'}
            </div>
            <p className={themeClass('text-black/60 font-bold', 'text-gray-500')}>
              {myMode ? '매칭글을 작성하거나 다른 매칭에 신청해보세요.' : '다른 필터를 선택하거나 직접 모집글을 올려보세요.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map(post => (
                <MatchingPostCard key={post.id} post={post} />
              ))}
            </div>

            {total > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-4 py-8">
                <button
                  type="button"
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={currentPage === 1}
                  className={cn(
                    'px-3 py-2 text-sm transition-all',
                    themeClass(
                      'border-2 border-black rounded-[5px] font-bold disabled:opacity-40 hover:bg-white',
                      'border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 bg-white font-medium text-gray-700'
                    )
                  )}
                >
                  이전
                </button>
                <span className={cn('text-sm', themeClass('font-bold', 'text-gray-600'))}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'px-3 py-2 text-sm transition-all',
                    themeClass(
                      'border-2 border-black rounded-[5px] font-bold disabled:opacity-40 hover:bg-white',
                      'border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 bg-white font-medium text-gray-700'
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

    </PullToRefresh>

      <Link
        href="/matching/new"
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
      </>
    </ProfileGate>
  );
}
