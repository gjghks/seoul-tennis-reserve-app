'use client';

import { useState } from 'react';
import Link from 'next/link';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useThemeClass, cn } from '@/lib/cn';
import { useTransfers } from '@/lib/hooks/useTransfers';
import { DISTRICTS } from '@/lib/constants/districts';
import type { TransferStatus } from '@/lib/constants/transfers';
import TransferCard from './TransferCard';
import Skeleton from '@/components/ui/Skeleton';
import ProfileGate from '@/components/profile/ProfileGate';

export default function TransfersContent() {
  const themeClass = useThemeClass();
  const [district, setDistrict] = useState<string>('');
  const [status, setStatus] = useState<TransferStatus>('available');

  const { transfers, isLoading, mutate } = useTransfers({ district, status });

  const handleRefresh = async () => {
    await mutate();
  };

  return (
    <ProfileGate feature="transfers">
    <div className="relative min-h-[calc(100vh-140px)]">
      <div className="container py-6 relative z-10">
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className={cn('text-2xl font-black', themeClass('text-black', 'text-gray-900'))}>
              양도 마켓
            </h1>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => setDistrict('')}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors',
                district === ''
                  ? themeClass('bg-black text-white', 'bg-gray-900 text-white')
                  : themeClass(
                      'bg-white border-2 border-black hover:bg-gray-100',
                      'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
                        'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
                      'bg-green-100 text-green-800 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-green-50 text-green-700 border-green-200 shadow-sm'
                    )
                  : themeClass(
                      'bg-white text-gray-600 border-2 border-black hover:bg-gray-50',
                      'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
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
                      'bg-gray-200 text-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
                    )
                  : themeClass(
                      'bg-white text-gray-600 border-2 border-black hover:bg-gray-50',
                      'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
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
                      'bg-orange-100 text-orange-800 border-2 border-black shadow-[2px_2px_0px_0px_#000]',
                      'bg-orange-50 text-orange-700 border-orange-300 shadow-sm'
                    )
                  : themeClass(
                      'bg-white text-gray-600 border-2 border-black hover:bg-gray-50',
                      'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    )
              )}
            >
              기간 만료
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-280px)] overflow-y-auto">
        <PullToRefresh onRefresh={handleRefresh} pullingContent="" refreshingContent="">
          <div className="container pb-24">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-4">🎾</div>
                <h3 className={cn('text-lg font-bold mb-2', themeClass('text-black', 'text-gray-900'))}>
                  등록된 양도글이 없습니다
                </h3>
                <p className="text-gray-500 text-sm">
                  첫 양도글을 등록해보세요!
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
        aria-label="양도글 작성하기"
        className={cn(
          'fixed bottom-20 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full transition-transform hover:scale-105 active:scale-95',
          themeClass(
            'bg-black text-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
            'bg-green-600 text-white shadow-lg hover:bg-green-700'
          )
        )}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>양도글 작성</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
    </ProfileGate>
  );
}