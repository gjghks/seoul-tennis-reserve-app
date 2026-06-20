'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeClass, cn } from '@/lib/cn';
import { useToast } from '@/contexts/ToastContext';
import { useMatchingPost } from '@/lib/hooks/useMatchingPost';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Skeleton from '@/components/ui/Skeleton';
import { 
  MATCH_POST_STATUS_LABELS, 
  MATCH_SKILL_FILTER_LABELS,
  APPLICATION_STATUS_LABELS 
} from '@/lib/constants/matching';
import { MATCH_TYPE_LABELS } from '@/lib/constants/tennis';
import { CONTACT_TYPE_LABELS } from '@/lib/constants/transfers';

export default function MatchingPostDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const router = useRouter();
  const { post, isLoading, error, mutate } = useMatchingPost(id);
  
  const [showLogin, setShowLogin] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (isLoading) {
    return (
      <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
        <div className="container mx-auto px-4 max-w-2xl">
          <Skeleton className="w-full h-12 mb-4" />
          <Skeleton className="w-full h-[400px] mb-4" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={cn('min-h-screen py-8 text-center', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
        <div className="container mx-auto px-4 max-w-2xl mt-12">
          <h1 className={cn('text-2xl mb-4', themeClass('font-black', 'font-bold'))}>
            모집글을 찾을 수 없습니다
          </h1>
          <button type="button" onClick={() => router.push('/matching')} className="underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === post.author_id;
  const isFull = post.accepted_count >= post.max_participants;

  const dateObj = new Date(post.play_date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${dateObj.getMonth() + 1}.${dateObj.getDate()}(${days[dateObj.getDay()]})`;
  const formatTime = (time: string) => time.substring(0, 5);

  const handleApply = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    setIsApplying(true);
    try {
      const res = await fetch(`/api/matching/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: applyMessage || null })
      });
      if (!res.ok) throw new Error('신청에 실패했습니다.');
      showToast('매칭 신청이 완료되었습니다.', 'success');
      setApplyMessage('');
      mutate();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!confirm('정말 신청을 취소하시겠습니까?')) return;
    setIsApplying(true);
    try {
      const res = await fetch(`/api/matching/${id}/apply`, { method: 'DELETE' });
      if (!res.ok) throw new Error('취소에 실패했습니다.');
      showToast('신청이 취소되었습니다.', 'success');
      mutate();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/matching/${id}/apply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, status })
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      showToast(status === 'accepted' ? '수락되었습니다.' : '거절되었습니다.', 'success');
      mutate();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('정말 이 모집글을 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/matching/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      showToast('삭제되었습니다.', 'success');
      router.push('/matching');
    } catch (err) {
      showToast((err as Error).message, 'error');
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (status: 'open' | 'closed' | 'completed' | 'cancelled') => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/matching/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status })
      });
      if (!res.ok) throw new Error('상태 변경에 실패했습니다.');
      showToast('상태가 변경되었습니다.', 'success');
      mutate();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className={cn('min-h-screen py-8', themeClass('bg-nb-bg', 'bg-gray-50 dark:bg-slate-900'))}>
      <div className="container mx-auto px-4 max-w-2xl">
        <button type="button" onClick={() => router.push('/matching')} className={cn('mb-6 flex items-center gap-2 font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100'))}>
          <span>←</span> 목록으로
        </button>

        <div className={cn(
          'p-6 mb-6',
          themeClass(
            'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
            'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm'
          )
        )}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={cn(
              'px-2 py-1 text-sm font-bold rounded',
              post.status === 'open' ? themeClass('bg-[#22c55e] text-black border-2 border-black', 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300') :
              post.status === 'closed' ? themeClass('bg-[#ffc400] text-black border-2 border-black', 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300') :
              themeClass('bg-gray-200 text-black border-2 border-black dark:border-[#f1f3f8]', 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300')
            )}>
              {MATCH_POST_STATUS_LABELS[post.status]}
            </span>
            <span className={cn('px-2 py-1 text-sm font-bold rounded', themeClass('bg-black text-white', 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'))}>
              {post.district}
            </span>
            <span className={cn('px-2 py-1 text-sm font-bold rounded', themeClass('bg-[#88aaee] text-black border-2 border-black', 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'))}>
              {MATCH_TYPE_LABELS[post.match_type]}
            </span>
          </div>

          <h1 className={cn('text-2xl mb-6', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
            {post.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>일시</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  {formattedDate} {formatTime(post.play_time_start)} 
                  {post.play_time_end && ` ~ ${formatTime(post.play_time_end)}`}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏟️</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>장소</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>{post.court_name}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>모집 현황</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  <span className={post.accepted_count >= post.max_participants ? 'text-red-500' : 'text-green-700'}>
                    {post.accepted_count}
                  </span>
                   / {post.max_participants}명
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>조건</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  {post.skill_level ? MATCH_SKILL_FILTER_LABELS[post.skill_level] : '실력무관'}
                  {post.ntrp_min && post.ntrp_max && ` (NTRP ${post.ntrp_min}-${post.ntrp_max})`}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>비용 (1인)</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>
                  {post.cost_per_person ? `${post.cost_per_person.toLocaleString()}원` : '무료/협의'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <div className={cn('text-xs', themeClass('font-bold text-black/50 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>작성자</div>
                <div className={cn('font-bold', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>{post.author_name}</div>
              </div>
            </div>
          </div>

          <div className={cn('pt-6 border-t', themeClass('border-black dark:border-slate-700', 'border-gray-100 dark:border-slate-700'))}>
            <h3 className={cn('text-lg mb-3', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>상세 내용</h3>
            <div className={cn('whitespace-pre-wrap leading-relaxed', themeClass('font-medium text-black dark:text-slate-200', 'text-gray-700 dark:text-slate-300'))}>
              {post.description || '상세 내용이 없습니다.'}
            </div>
          </div>

          {post.contact_info && post.contact_type && (
            <div className={cn('pt-6 border-t', themeClass('border-black dark:border-slate-700', 'border-gray-100 dark:border-slate-700'))}>
              <div className={cn(
                'p-4 rounded-xl',
                themeClass('bg-green-50 dark:bg-green-950/40 border-2 border-black dark:border-[#f1f3f8]', 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900')
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔓</span>
                  <h3 className={cn('text-base', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
                    작성자 연락처
                  </h3>
                </div>
                <div className={cn('text-sm', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
                  {CONTACT_TYPE_LABELS[post.contact_type]}
                </div>
                <div className={cn('text-lg mt-1', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
                  {post.contact_info}
                </div>
              </div>
            </div>
          )}

          {!post.contact_info && post.has_applied && !isAuthor && (
            <div className={cn('pt-6 border-t', themeClass('border-black dark:border-slate-700', 'border-gray-100 dark:border-slate-700'))}>
              <div className={cn(
                'p-4 rounded-xl text-center',
                themeClass('bg-gray-50 dark:bg-slate-700/40 border-2 border-black dark:border-[#f1f3f8]', 'bg-gray-50 dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600')
              )}>
                <span className="text-xl">🔒</span>
                <p className={cn('text-sm mt-1', themeClass('font-bold text-black/60 dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
                  신청이 수락되면 작성자의 연락처가 공개됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {isAuthor && (
          <div className={cn(
            'p-6 mb-6 flex flex-wrap gap-3',
            themeClass(
              'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
              'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm'
            )
          )}>
            <div className="w-full mb-2"><h3 className={cn('text-lg', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>관리</h3></div>
            {post.status === 'open' && (
              <button type="button" onClick={() => handleUpdateStatus('closed')} disabled={isUpdatingStatus} className={cn('px-4 py-2 text-sm', themeClass('bg-[#ffc400] font-black border-2 border-black rounded-[5px]', 'bg-yellow-100 text-yellow-800 font-bold rounded-lg'))}>모집 마감</button>
            )}
            {post.status === 'closed' && (
              <button type="button" onClick={() => handleUpdateStatus('open')} disabled={isUpdatingStatus} className={cn('px-4 py-2 text-sm', themeClass('bg-[#22c55e] font-black border-2 border-black rounded-[5px]', 'bg-green-100 text-green-800 font-bold rounded-lg'))}>모집 재개</button>
            )}
            {(post.status === 'open' || post.status === 'closed') && (
              <>
                <button type="button" onClick={() => handleUpdateStatus('completed')} disabled={isUpdatingStatus} className={cn('px-4 py-2 text-sm', themeClass('bg-gray-300 font-black border-2 border-black dark:border-[#f1f3f8] rounded-[5px]', 'bg-gray-200 text-gray-800 font-bold rounded-lg'))}>경기 완료</button>
                <button type="button" onClick={() => handleUpdateStatus('cancelled')} disabled={isUpdatingStatus} className={cn('px-4 py-2 text-sm', themeClass('bg-[#ff90e8] font-black border-2 border-black rounded-[5px]', 'bg-red-100 text-red-800 font-bold rounded-lg'))}>경기 취소</button>
              </>
            )}
            <div className="w-full mt-2 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button type="button" onClick={handleDeletePost} disabled={isDeleting} className="text-red-500 font-bold text-sm underline">삭제하기</button>
            </div>
          </div>
        )}

        {isAuthor && post.applications && (
          <div className={cn(
            'p-6 mb-6',
            themeClass(
              'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
              'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm'
            )
          )}>
            <h3 className={cn('text-lg mb-4', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
              신청자 목록 ({post.applications.length})
            </h3>
            {post.applications.length === 0 ? (
              <p className={themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400')}>아직 신청자가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {post.applications.map(app => (
                  <div key={app.id} className={cn('p-4 rounded-xl', themeClass('border-2 border-black dark:border-[#f1f3f8] bg-gray-50 dark:bg-slate-700/40', 'border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/40'))}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={cn('font-bold text-lg', themeClass('text-black dark:text-slate-100', 'text-gray-900 dark:text-slate-100'))}>{app.applicant_name}</div>
                      <span className={cn(
                        'px-2 py-1 text-xs font-bold rounded',
                        app.status === 'pending' ? themeClass('bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] text-black dark:text-slate-100', 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300') :
                        app.status === 'accepted' ? themeClass('bg-[#22c55e] border-2 border-black text-black', 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300') :
                        themeClass('bg-[#ff90e8] border-2 border-black text-black', 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300')
                      )}>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                    </div>
                    {app.message && (
                      <div className={cn('mb-4 p-3 rounded', themeClass('bg-white dark:bg-slate-900 border-2 border-black dark:border-[#f1f3f8] text-sm font-medium dark:text-slate-200', 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300'))}>
                        {app.message}
                      </div>
                    )}
                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleApplicationStatus(app.id, 'accepted')}
                          disabled={isFull}
                          className={cn('flex-1 py-2 text-sm', themeClass('bg-[#22c55e] font-black border-2 border-black rounded-[5px]', 'bg-green-600 text-white font-bold rounded-lg'))}
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplicationStatus(app.id, 'rejected')}
                          className={cn('flex-1 py-2 text-sm', themeClass('bg-white dark:bg-slate-800 dark:text-slate-100 font-black border-2 border-black dark:border-[#f1f3f8] rounded-[5px]', 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-bold rounded-lg'))}
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

        {!isAuthor && (
          <div className={cn(
            'p-6 mb-6',
            themeClass(
              'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
              'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm'
            )
          )}>
            {post.has_applied ? (
              <div className="text-center">
                <div className={cn('text-xl mb-2', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>이미 신청하셨습니다</div>
                <p className={cn('mb-6', themeClass('text-black/60 font-bold dark:text-slate-400', 'text-gray-500 dark:text-slate-400'))}>
                  작성자가 수락하면 매칭이 성사됩니다.
                </p>
                <button
                  type="button"
                  onClick={handleCancelApplication}
                  disabled={isApplying}
                  className={cn(
                    'w-full py-4 text-center transition-all',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-black text-black dark:text-slate-100 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#f1f3f8]',
                      'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm'
                    )
                  )}
                >
                  신청 취소
                </button>
              </div>
            ) : post.status !== 'open' || isFull ? (
              <div className="text-center py-4">
                <div className={cn('text-xl', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>
                  모집이 마감되었습니다
                </div>
              </div>
            ) : (
              <div>
                <h3 className={cn('text-lg mb-4', themeClass('font-black text-black dark:text-slate-100', 'font-bold text-gray-900 dark:text-slate-100'))}>매칭 신청하기</h3>
                <textarea
                  id="applyMessage"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="작성자에게 남길 메시지를 적어주세요. (선택)"
                  className={cn(
                    'w-full px-4 py-3 outline-none transition-all mb-4 min-h-[100px] resize-y',
                    themeClass(
                      'bg-white dark:bg-slate-800 border-2 border-black dark:border-[#f1f3f8] rounded-[5px] font-bold text-black dark:text-slate-100 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#f1f3f8]',
                      'bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500'
                    )
                  )}
                  maxLength={500}
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying}
                  className={cn(
                    'w-full py-4 text-center transition-all',
                    themeClass(
                      'bg-[#22c55e] border-2 border-black rounded-[5px] font-black text-black shadow-[4px_4px_0px_0px_#000]',
                      'bg-green-600 rounded-xl font-bold text-white hover:bg-green-700 shadow-md'
                    )
                  )}
                >
                  {isApplying ? '신청 중...' : '신청하기'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <LoginPrompt
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message="매칭을 신청하려면 로그인이 필요합니다."
      />
    </div>
  );
}
