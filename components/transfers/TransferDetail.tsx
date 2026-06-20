'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useThemeClass, cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTransferInterest } from '@/lib/hooks/useTransferInterest';
import { 
  TRANSFER_STATUS_LABELS, 
  CONTACT_TYPE_LABELS, 
  INTEREST_STATUS_LABELS 
} from '@/lib/constants/transfers';
import type { CourtTransfer } from '@/lib/constants/transfers';
import Spinner from '@/components/ui/Spinner';

interface TransferDetailProps {
  id: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const w = days[d.getDay()];
  return `${d.getFullYear()}년 ${m}월 ${day}일(${w})`;
}

export default function TransferDetail({ id }: TransferDetailProps) {
  const themeClass = useThemeClass();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const { 
    data, 
    error: transferError, 
    isLoading: isTransferLoading,
    mutate: mutateTransfer
  } = useSWR<{ transfer: CourtTransfer, myInterestStatus: string | null }>(
    `/api/transfers/${id}`, 
    fetcher
  );

  const { 
    myInterest, 
    interests, 
    expressInterest, 
    withdrawInterest, 
    updateInterestStatus 
  } = useTransferInterest({ transferId: id, enabled: !!user });

  if (isTransferLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (transferError || !data?.transfer) {
    return (
      <div className="container py-12 text-center text-red-500 font-bold">
        양도글을 불러오는데 실패했습니다.
      </div>
    );
  }

  const { transfer } = data;
  const isSeller = user?.id === transfer.seller_id;
  const isAvailable = transfer.status === 'available';

  const handleStatusChange = async (newStatus: typeof transfer.status) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/transfers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('상태 변경 실패');
      
      await mutateTransfer();
      showToast('상태가 변경되었습니다.', 'success');
    } catch {
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpressInterest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await expressInterest(message);
      showToast('관심을 표시했습니다.', 'success');
      setMessage('');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawInterest = async () => {
    if (isSubmitting) return;
    if (!window.confirm('관심 표시를 철회하시겠습니까?')) return;
    
    setIsSubmitting(true);
    try {
      await withdrawInterest();
      showToast('관심 표시를 철회했습니다.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInterest = async (interestId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateInterestStatus(interestId, 'accepted');
      showToast('승인되었습니다.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectInterest = async (interestId: string) => {
    if (isSubmitting) return;
    if (!window.confirm('거절하시겠습니까?')) return;
    
    setIsSubmitting(true);
    try {
      await updateInterestStatus(interestId, 'rejected');
      showToast('거절되었습니다.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            'mb-6 flex items-center text-sm font-bold transition-colors',
            themeClass('text-black dark:text-slate-100 hover:opacity-70', 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100')
          )}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>뒤로가기</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all',
            themeClass(
              'bg-white dark:bg-slate-800 border-[3px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_#000]',
              'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-md'
            )
          )}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span
                className={cn(
                  'px-3 py-1 text-sm font-bold rounded-full',
                  isAvailable
                    ? themeClass(
                        'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-2 border-green-800 dark:border-green-700 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]',
                        'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                      )
                    : transfer.status === 'expired'
                      ? themeClass(
                          'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-2 border-orange-800 dark:border-orange-700 shadow-[2px_2px_0px_0px_rgba(154,52,18,1)]',
                          'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                        )
                      : themeClass(
                          'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-2 border-gray-700 dark:border-slate-500 shadow-[2px_2px_0px_0px_rgba(55,65,81,1)]',
                          'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                        )
                )}
              >
                {TRANSFER_STATUS_LABELS[transfer.status]}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{transfer.district}</span>
            </div>

            <h1 className={cn('text-2xl font-black mb-6', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
              {transfer.title}
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                  themeClass('bg-blue-100 border-2 border-black', 'bg-blue-50 text-blue-600')
                )}
              >
                {transfer.seller_name?.[0] || '익'}
              </div>
              <div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  {transfer.seller_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {new Date(transfer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div
              className={cn(
                'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg',
                themeClass('bg-yellow-50 dark:bg-yellow-950/30 border-2 border-black', 'bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700')
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">🏟️</span>
                <div>
                  <div className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-0.5">코트</div>
                  <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                    {transfer.court_name}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <div className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-0.5">일시</div>
                  <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                    {formatDate(transfer.play_date)} {transfer.play_time_start}
                    {transfer.play_time_end ? `~${transfer.play_time_end}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-3">상세 내용</h3>
              <p className={cn('whitespace-pre-wrap leading-relaxed', themeClass('text-black dark:text-slate-200', 'text-gray-700 dark:text-slate-300'))}>
                {transfer.description || '상세 내용이 없습니다.'}
              </p>
            </div>
            
            {transfer.contact_info && transfer.contact_type && (
              <div className={cn(
                'mb-8 p-5 rounded-lg border-2 border-dashed',
                themeClass('border-black bg-blue-50 dark:bg-blue-950/40', 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40')
              )}>
                <h3 className={cn('font-bold mb-2 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  <span className="text-xl">🔓</span> 판매자 연락처
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                    {CONTACT_TYPE_LABELS[transfer.contact_type]}
                  </span>
                  <span className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                    {transfer.contact_info}
                  </span>
                </div>
              </div>
            )}
            
            {!isSeller && (
              <div className={cn('mt-8 pt-8 border-t', themeClass('border-black dark:border-slate-700', 'border-gray-200 dark:border-slate-700'))}>
                {!user ? (
                  <div className="text-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="mb-4 text-gray-600 dark:text-slate-300">이 코트에 관심이 있으신가요?</p>
                    <Link 
                      href={`/login?redirect=/transfers/${id}`}
                      className={cn(
                        'inline-block px-6 py-2 rounded-lg font-bold transition-all',
                        themeClass('bg-black text-white hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000]', 'bg-gray-900 text-white hover:bg-gray-800')
                      )}
                    >
                      로그인하고 관심 표시하기
                    </Link>
                  </div>
                ) : !myInterest ? (
                  isAvailable ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-slate-200 mb-2">
                          판매자에게 남길 메시지 (선택)
                        </label>
                        <textarea
                          id="message"
                          maxLength={200}
                          rows={3}
                          className={cn(
                            'w-full p-3 rounded-lg resize-none',
                            themeClass(
                              'border-[2px] border-black dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-slate-100 focus:ring-0 focus:outline-none',
                              'border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            )
                          )}
                          placeholder="예: 꼭 양도받고 싶습니다!"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className="text-right text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {message.length} / 200
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleExpressInterest}
                        disabled={isSubmitting}
                        className={cn(
                          'w-full py-4 rounded-lg font-bold text-lg transition-all',
                          themeClass(
                            'bg-yellow-400 text-black border-[3px] border-black hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#000]',
                            'bg-yellow-400 text-gray-900 border border-yellow-500 hover:bg-yellow-500 shadow-md'
                          )
                        )}
                      >
                        관심 있어요 💛
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg font-bold">
                      {transfer.status === 'expired' ? '기간이 만료된 글입니다.' : '거래가 완료된 글입니다.'}
                    </div>
                  )
                ) : (
                  <div className={cn(
                    'p-4 rounded-lg flex items-center justify-between',
                    myInterest.status === 'pending' && themeClass('bg-gray-100 dark:bg-slate-700 border-2 border-black', 'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700'),
                    myInterest.status === 'accepted' && themeClass('bg-green-100 dark:bg-green-950/40 border-2 border-green-800 dark:border-green-700', 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900'),
                    myInterest.status === 'rejected' && themeClass('bg-red-100 dark:bg-red-950/40 border-2 border-red-800 dark:border-red-700', 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900')
                  )}>
                    <div>
                      <div className="font-bold flex items-center gap-2 mb-1">
                        내 관심 표시 
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          myInterest.status === 'pending' && 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200',
                          myInterest.status === 'accepted' && 'bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-200',
                          myInterest.status === 'rejected' && 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200'
                        )}>
                          {INTEREST_STATUS_LABELS[myInterest.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{myInterest.message || '메시지 없음'}</p>
                    </div>
                    
                    {myInterest.status !== 'accepted' && (
                      <button
                        type="button"
                        onClick={handleWithdrawInterest}
                        disabled={isSubmitting}
                        className={cn(
                          'px-3 py-1.5 text-sm font-bold rounded',
                          themeClass('border-2 border-black dark:border-slate-500 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-600', 'border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700')
                        )}
                      >
                        철회
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {isSeller && (
              <div className={cn('mt-8 pt-8 border-t', themeClass('border-black dark:border-slate-700', 'border-gray-200 dark:border-slate-700'))}>
                <h3 className={cn('font-bold mb-4 flex items-center gap-2', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  관심 표시한 유저
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    themeClass('bg-black text-white', 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300')
                  )}>
                    {interests.length}명
                  </span>
                </h3>

                {interests.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    아직 관심 표시한 유저가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interests.map((interest) => (
                      <div 
                        key={interest.id}
                        className={cn(
                          'p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                          themeClass('border-2 border-black dark:border-slate-600', 'border border-gray-200 dark:border-slate-700')
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold dark:text-slate-100">{interest.buyer_name}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {new Date(interest.created_at).toLocaleString()}
                            </span>
                            {interest.status !== 'pending' && (
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-bold',
                                interest.status === 'accepted' ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                              )}>
                                {INTEREST_STATUS_LABELS[interest.status]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-slate-300">{interest.message || '메시지 없음'}</p>
                        </div>
                        
                        {interest.status === 'pending' && isAvailable && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptInterest(interest.id)}
                              disabled={isSubmitting}
                              className={cn(
                                'px-4 py-1.5 text-sm font-bold rounded transition-colors',
                                themeClass('bg-green-400 border-2 border-black hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#000]', 'bg-green-500 text-white hover:bg-green-600')
                              )}
                            >
                              수락
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectInterest(interest.id)}
                              disabled={isSubmitting}
                              className={cn(
                                'px-4 py-1.5 text-sm font-bold rounded transition-colors',
                                themeClass('bg-red-400 border-2 border-black hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#000]', 'bg-white dark:bg-slate-800 border border-red-500 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40')
                              )}
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={cn(
              'p-6 border-t flex flex-col md:flex-row items-center justify-between gap-4',
              themeClass('border-black dark:border-slate-700 bg-gray-50 dark:bg-slate-900', 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50')
            )}
          >
            <div>
              <div className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">양도 금액</div>
              {transfer.is_free ? (
                <div className={cn('text-3xl font-black', themeClass('text-blue-600', 'text-blue-600'))}>
                  무료 나눔
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className={cn('text-3xl font-black', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                    {transfer.asking_price.toLocaleString()}원
                  </span>
                  {transfer.asking_price < transfer.original_price && (
                    <span className="text-sm text-gray-400 dark:text-slate-500 line-through mb-1">
                      원가 {transfer.original_price.toLocaleString()}원
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {isSeller && (
                <>
                  {isAvailable && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('completed')}
                      disabled={isSubmitting}
                      className={cn(
                        'w-full md:w-auto px-6 py-3 rounded-lg font-bold transition-all',
                        themeClass(
                          'bg-black text-white border-2 border-black hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#000]',
                          'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                        )
                      )}
                    >
                      양도 완료 처리
                    </button>
                  )}
                  {isAvailable && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={isSubmitting}
                      className={cn(
                        'w-full md:w-auto px-6 py-3 rounded-lg font-bold transition-all',
                        themeClass(
                          'bg-white text-red-600 border-2 border-red-600 hover:-translate-y-[2px] shadow-[4px_4px_0px_0px_#dc2626]',
                          'bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm'
                        )
                      )}
                    >
                      거래 취소
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
