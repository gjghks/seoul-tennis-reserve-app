'use client';

import { useState } from 'react';
import Link from 'next/link';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useTransfers } from '@/lib/hooks/useTransfers';
import { DISTRICTS } from '@/lib/constants/districts';
import type { TransferStatus } from '@/lib/constants/transfers';
import TransferCard from './TransferCard';
import Skeleton from '@/components/ui/Skeleton';
import ProfileGate from '@/components/profile/ProfileGate';

export default function TransfersContent() {
  const themeClass = useThemeClass();
  const { user } = useAuth();
  const [district, setDistrict] = useState<string>('');
  const [status, setStatus] = useState<TransferStatus>('available');
  const [myMode, setMyMode] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  const { transfers, isLoading, mutate } = useTransfers({
    district: myMode ? undefined : district,
    status: myMode ? undefined : status,
    my: myMode || undefined,
  });

  const handleRefresh = async () => {
    await mutate();
  };

  return (
    <div className={cn('container mx-auto px-4 py-6 min-h-screen scrollbar-hide', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      <div className="flex items-center justify-between mb-4">
        <h1 className={cn('text-xl', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
          양도 마켓
        </h1>
        <Link
          href="/guide/transfers"
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

    <ProfileGate feature="transfers">
    <div className="relative min-h-[calc(100vh-200px)]">
      <div>
        <div className="mb-6 space-y-4">

          {user && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMyMode(false)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                  !myMode
                    ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                    : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                )}
              >
                전체 양도
              </button>
              <button
                type="button"
                onClick={() => setMyMode(true)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold transition-colors',
                  myMode
                    ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                    : themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700', 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700')
                )}
              >
                내 양도
              </button>
            </div>
          )}

          {!myMode && (<>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => setDistrict('')}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors',
                district === ''
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass(
                      'bg-white dark:bg-slate-800 dark:text-slate-100 border-2 border-black hover:bg-gray-100 dark:hover:bg-slate-700',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    )
              )}
            >
              전체
            </button>
            {DISTRICTS.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setDistrict(d.nameKo)}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors',
                  district === d.nameKo
                    ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                    : themeClass(
                        'bg-white border-2 border-black hover:bg-gray-100',
                        'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      )
                )}
              >
                {d.nameKo}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus('available')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-colors',
                status === 'available'
                  ? themeClass(
                      'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900 shadow-sm'
                    )
                  : themeClass(
                      'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-2 border-black hover:bg-gray-50 dark:hover:bg-slate-700',
                      'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                    )
              )}
            >
              양도 가능
            </button>
            <button
              type="button"
              onClick={() => setStatus('completed')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-colors',
                status === 'completed'
                  ? themeClass(
                      'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-300 dark:border-slate-600 shadow-sm'
                    )
                  : themeClass(
                      'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-2 border-black hover:bg-gray-50 dark:hover:bg-slate-700',
                      'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                    )
              )}
            >
              양도 완료
            </button>
            <button
              type="button"
              onClick={() => setStatus('expired')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-bold flex-1 transition-colors',
                status === 'expired'
                  ? themeClass(
                      'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-900 shadow-sm'
                    )
                  : themeClass(
                      'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-2 border-black hover:bg-gray-50 dark:hover:bg-slate-700',
                      'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                    )
              )}
            >
              기간 만료
            </button>
          </div>
          </>)}
        </div>
      </div>

      <div className={cn(myMode ? 'h-[calc(100vh-220px)]' : 'h-[calc(100vh-280px)]', 'overflow-y-auto')}>
        <PullToRefresh onRefresh={handleRefresh} pullingContent="" refreshingContent="">
          <div className="container pb-6">
            <div className={cn(
              'relative mb-4 transition-all',
              themeClass(
                'bg-white dark:bg-slate-800 border-2 border-dashed border-black/30 dark:border-slate-600 rounded-[10px] overflow-hidden',
                'bg-gray-50/80 dark:bg-slate-800/80 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden'
              )
            )}>
              <button
                type="button"
                onClick={() => setExampleOpen(!exampleOpen)}
                className="w-full text-left cursor-pointer"
              >
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 text-xs font-bold rounded-full', themeClass('bg-green-100/50 dark:bg-green-950/30 text-green-800/50 dark:text-green-300/60 border border-green-800/30 dark:border-green-900/50', 'bg-green-100/70 dark:bg-green-950/30 text-green-800/60 dark:text-green-300/60'))}>양도 가능</span>
                      <span className="text-xs font-medium text-gray-400 dark:text-slate-500">송파구</span>
                    </div>
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded', themeClass('bg-black/10 text-black/50 dark:bg-white/10 dark:text-slate-300', 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'))}>예시 {exampleOpen ? '▲' : '▼'}</span>
                  </div>
                  <h3 className={cn('font-bold text-base mb-1 line-clamp-2', themeClass('text-black/50 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>올림픽공원 테니스장 주말 오전 코트</h3>
                  <div className="text-sm text-gray-400 dark:text-slate-500 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-50">🏟️</span>
                      <span>올림픽공원 테니스장 A코트</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-50">📅</span>
                      <span>3월 22일(토) 10:00~12:00</span>
                    </div>
                  </div>
                </div>
                <div className={cn('p-4 flex items-center justify-between border-t', themeClass('border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40', 'border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30'))}>
                  <span className="text-sm font-medium text-gray-400 dark:text-slate-500 truncate max-w-[80px]">테니스러버</span>
                  <span className={cn('font-black text-lg', themeClass('text-black/40 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>15,000원</span>
                </div>
                {!exampleOpen && (
                  <p className={cn('pb-3 text-xs text-center', themeClass('text-black/40 font-bold dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>눌러서 예시 상세 보기</p>
                )}
              </button>
              <div className={cn(
                'transition-all duration-300 ease-in-out overflow-hidden',
                exampleOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              )}>
                <div className={cn('px-4 pb-4 pt-0 space-y-4', themeClass('border-t border-dashed border-black/20 dark:border-white/15', 'border-t border-dashed border-gray-200 dark:border-slate-700'))}>
                  <div className={cn('pt-3 text-sm leading-relaxed', themeClass('text-black/50 dark:text-slate-400', 'text-gray-400 dark:text-slate-500'))}>
                    <p>급한 일정으로 코트를 양도합니다. 코트비 15,000원(2시간 기준)에 캔볼 1캔 포함 가격입니다. 올림픽공원 내 하드코트이며 조명 시설 완비되어 있습니다.</p>
                  </div>
                  <div className={cn('p-3 rounded-lg', themeClass('bg-black/5 dark:bg-white/5', 'bg-gray-100 dark:bg-slate-700'))}>
                    <p className={cn('text-[10px] mb-2 text-center', themeClass('font-bold text-black/40 dark:text-slate-400', 'font-semibold text-gray-400 dark:text-slate-400'))}>양도 진행 과정</p>
                    <div className="flex items-center justify-between gap-1">
                      {[
                        { step: '등록', icon: '📝', active: true },
                        { step: '관심표시', icon: '💛', active: false },
                        { step: '연락', icon: '💬', active: false },
                        { step: '양도완료', icon: '🤝', active: false },
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
                    href="/transfers/new"
                    className={cn(
                      'block w-full py-2.5 text-center text-sm font-bold rounded-lg transition-all',
                      themeClass('bg-black/10 text-black/60 dark:bg-white/10 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-white/20', 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600')
                    )}
                  >
                    나도 양도글 작성하기 →
                  </Link>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4">🎾</div>
                <h3 className={cn('text-lg font-bold mb-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  {myMode ? '참여한 양도가 없습니다' : '등록된 양도글이 없습니다'}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  {myMode ? '양도글을 등록하거나 관심 표시를 해보세요.' : '첫 양도글을 등록해보세요!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfers.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>

      <Link
        href="/transfers/new"
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
    </ProfileGate>
    </div>
  );
}