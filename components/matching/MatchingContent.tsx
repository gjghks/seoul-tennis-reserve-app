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
  const [exampleOpen, setExampleOpen] = useState(false);

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
    <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold dark:text-slate-100', 'text-green-600')}`}>
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span>새로고침 중...</span>
    </div>
  );

  return (
    <div className={cn('container mx-auto px-4 py-6 min-h-screen scrollbar-hide', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      <div className="flex items-center justify-between mb-4">
        <h1 className={cn('text-xl', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>매칭</h1>
        <Link
          href="/guide/matching"
          className={cn(
            'flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-all',
            themeClass(
              'bg-[#facc15] border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
              'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-semibold border border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/50'
            )
          )}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>사용법</span>
        </Link>
      </div>

    <ProfileGate feature="matching">
      <>
      <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className={`flex items-center justify-center py-4 ${themeClass('text-black font-bold dark:text-slate-100', 'text-green-600')}`}>
          <span>↓ 당겨서 새로고침</span>
        </div>
      }
      refreshingContent={RefreshIndicator}
    >
      <div>

        {user && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setMyMode(false); setOffset(0); }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                !myMode
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
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
                  : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
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
            'bg-white dark:bg-slate-800 border-2 border-black shadow-[4px_4px_0px_0px_#000]',
            'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm'
          )
        )}>
          <select
            value={district}
            onChange={(e) => { setDistrict(e.target.value); setOffset(0); }}
            className={cn(
              'px-3 py-2 outline-none cursor-pointer flex-1 min-w-[120px]',
              themeClass(
                'bg-[#facc15] border-2 border-black rounded-[5px] font-black text-black',
                'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500'
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
                'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500'
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
                'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] font-black text-black dark:text-slate-100',
                'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-green-500'
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

        <div className={cn(
          'relative mb-6 transition-all',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-dashed border-black/30 dark:border-slate-600 rounded-[5px] overflow-hidden',
            'bg-gray-50/80 dark:bg-slate-800/80 border border-dashed border-gray-300 dark:border-slate-600 rounded-2xl overflow-hidden'
          )
        )}>
          <button
            type="button"
            onClick={() => setExampleOpen(!exampleOpen)}
            className={cn(
              'w-full p-5 text-left cursor-pointer transition-colors',
              themeClass('hover:bg-black/[0.02] dark:hover:bg-white/[0.04]', 'hover:bg-gray-50 dark:hover:bg-slate-700/50')
            )}
          >
            <span className={cn(
              'absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded z-10',
              themeClass('bg-black/10 text-black/50 dark:bg-white/10 dark:text-slate-300', 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-300')
            )}>
              예시 {exampleOpen ? '▲' : '▼'}
            </span>
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('px-2 py-0.5 text-xs font-bold rounded', themeClass('bg-[#22c55e]/50 text-black/50 dark:text-slate-300 border border-black/20 dark:border-white/20', 'bg-green-100/70 dark:bg-green-950/40 text-green-700/60 dark:text-green-300/70 border border-green-200 dark:border-green-900'))}>모집중</span>
                <span className={cn('px-2 py-0.5 text-xs font-bold rounded', themeClass('bg-black/10 text-black/50 dark:bg-white/10 dark:text-slate-300', 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300'))}>송파구</span>
                <span className={cn('px-2 py-0.5 text-xs font-bold rounded', themeClass('bg-[#88aaee]/40 text-black/50 dark:text-slate-300 border border-black/20 dark:border-white/20', 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700/60 dark:text-blue-300/70 border border-blue-100 dark:border-blue-900'))}>남복</span>
              </div>
            </div>
            <h3 className={cn('text-lg mb-4 line-clamp-1', themeClass('font-black text-black/50 dark:text-slate-400', 'font-bold text-gray-400 dark:text-slate-500'))}>잠실 테니스장 주말 남복 한 게임 하실 분</h3>
            <div className="grid grid-cols-2 gap-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg opacity-50">📅</span>
                <span className={cn('text-sm', themeClass('font-bold text-black/50 dark:text-slate-400', 'font-medium text-gray-400 dark:text-slate-500'))}>3.22(토) 14:00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg opacity-50">🏟️</span>
                <span className={cn('text-sm', themeClass('font-bold text-black/50 dark:text-slate-400', 'font-medium text-gray-400 dark:text-slate-500'))}>잠실 테니스장</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg opacity-50">👥</span>
                <span className={cn('text-sm', themeClass('font-bold text-black/50 dark:text-slate-400', 'font-medium text-gray-400 dark:text-slate-500'))}>중급 (NTRP 3.0~4.0)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg opacity-50">💰</span>
                <span className={cn('text-sm', themeClass('font-bold text-black/50 dark:text-slate-400', 'font-medium text-gray-400 dark:text-slate-500'))}>10,000원</span>
              </div>
            </div>
            <div className={cn('pt-3 border-t flex justify-between items-center', themeClass('border-black/10 dark:border-white/10', 'border-gray-100 dark:border-slate-700'))}>
              <span className={cn('text-sm', themeClass('font-bold text-black/30 dark:text-slate-500', 'text-gray-300 dark:text-slate-500'))}>테니스매니아</span>
              <span className={cn('text-sm font-bold', themeClass('text-[#22c55e]/50', 'text-green-600/50'))}>2 / 4명</span>
            </div>
            {!exampleOpen && (
              <p className={cn('mt-3 text-xs text-center', themeClass('text-black/40 font-bold dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>눌러서 예시 상세 보기</p>
            )}
          </button>
          <div className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            exampleOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <div className={cn('px-5 pb-5 pt-0 space-y-4', themeClass('border-t border-dashed border-black/20 dark:border-white/15', 'border-t border-dashed border-gray-200 dark:border-slate-700'))}>
              <div className={cn('pt-4 text-sm leading-relaxed', themeClass('text-black/50 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>
                <p className="mb-2">안녕하세요! 주말 오후에 잠실에서 남복 한 게임 같이 하실 분 모집합니다.</p>
                <p>NTRP 3.0~4.0 수준이면 좋겠습니다. 4게임 노애드로 가볍게 즐겁게 치실 분 환영합니다. 코트비는 1/n 입니다.</p>
              </div>
              <div className={cn('p-3 rounded-lg', themeClass('bg-black/5 dark:bg-white/5', 'bg-gray-100 dark:bg-slate-700'))}>
                <p className={cn('text-[10px] mb-2 text-center', themeClass('font-bold text-black/40 dark:text-slate-400', 'font-semibold text-gray-400 dark:text-slate-400'))}>매칭 진행 과정</p>
                <div className="flex items-center justify-between gap-1">
                  {[
                    { step: '모집중', icon: '✍️', active: true },
                    { step: '신청', icon: '🤝', active: false },
                    { step: '수락', icon: '✅', active: false },
                    { step: '경기', icon: '🎾', active: false },
                  ].map((s, i) => (
                    <div key={s.step} className="flex items-center gap-1 flex-1">
                      <div className={cn(
                        'flex flex-col items-center flex-1',
                        s.active ? themeClass('text-black/60 dark:text-slate-300', 'text-green-600/70') : themeClass('text-black/25 dark:text-slate-500', 'text-gray-300 dark:text-slate-600')
                      )}>
                        <span className="text-base">{s.icon}</span>
                        <span className={cn('text-[9px] mt-0.5', s.active ? 'font-bold' : 'font-medium')}>{s.step}</span>
                      </div>
                      {i < 3 && <span className={cn('text-[10px] -mt-3', themeClass('text-black/20 dark:text-slate-600', 'text-gray-300 dark:text-slate-600'))}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/matching/new"
                className={cn(
                  'block w-full py-2.5 text-center text-sm font-bold rounded-lg transition-all',
                  themeClass('bg-black/10 text-black/60 dark:bg-white/10 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-white/20', 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600')
                )}
              >
                나도 매칭글 작성하기 →
              </Link>
            </div>
          </div>
        </div>

        {error ? (
          <div className={cn(
            'text-center py-12',
            themeClass('bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700')
          )}>
            <div className={cn('text-lg mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>오류가 발생했습니다</div>
            <p className={themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cn(
                'p-5 h-[200px]',
                themeClass(
                  'bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]',
                  'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm'
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
            themeClass('bg-white dark:bg-slate-800 border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]', 'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm')
          )}>
            <div className="text-4xl mb-4">🎾</div>
            <div className={cn('text-xl mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
              {myMode ? '참여한 매칭이 없습니다' : '조건에 맞는 매칭이 없습니다'}
            </div>
            <p className={themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>
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
                      'border-2 border-black rounded-[5px] font-bold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 dark:text-slate-100',
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
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'px-3 py-2 text-sm transition-all',
                    themeClass(
                      'border-2 border-black rounded-[5px] font-bold disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700 dark:text-slate-100',
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
    </div>
  );
}
