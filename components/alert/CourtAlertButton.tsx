'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useThemeClass } from '@/lib/cn';
import { usePushSubscription } from '@/lib/hooks/usePushSubscription';
import { useAlertSettings } from '@/lib/hooks/useAlertSettings';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Spinner from '@/components/ui/Spinner';

interface CourtAlertButtonProps {
  svcId: string;
  svcName: string;
  className?: string;
}

export default function CourtAlertButton({ svcId, svcName, className = '' }: CourtAlertButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const { isSubscribed, permission, subscribe: subscribePush } = usePushSubscription();
  const { isAlertEnabled, toggleAlert } = useAlertSettings();
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const alertOn = isAlertEnabled('favorite_available', svcId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (permission === 'unsupported') {
      showToast('이 브라우저는 알림을 지원하지 않습니다', 'error');
      return;
    }

    if (permission === 'denied') {
      showToast('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요', 'error');
      return;
    }

    setLoading(true);
    try {
      if (!isSubscribed) {
        const subscribed = await subscribePush();
        if (!subscribed) {
          showToast('알림 권한을 허용해주세요', 'error');
          return;
        }
      }

      const success = await toggleAlert('favorite_available', svcId, svcName);
      if (success) {
        showToast(
          alertOn ? '접수 알림이 해제되었습니다' : '접수 시작 시 알림을 보내드립니다',
          alertOn ? 'info' : 'success'
        );
      }
    } catch {
      showToast('오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className={`w-8 h-8 ${themeClass('skeleton-neo', 'skeleton rounded-lg')} ${className}`} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={alertOn ? '접수 알림 해제' : '접수 시작 알림 받기'}
        aria-pressed={alertOn}
        className={themeClass(
          `flex items-center gap-2 px-3 py-2 border-2 border-black rounded-[5px] transition-all font-bold ${
            alertOn
              ? 'bg-[#facc15] text-black shadow-[3px_3px_0px_0px_#000]'
              : 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#facc15]'
          } ${loading ? 'cursor-not-allowed' : 'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'} ${className}`,
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            alertOn
              ? 'bg-amber-50 text-amber-600'
              : 'bg-gray-100 text-gray-500 hover:text-amber-600'
          } ${loading ? 'cursor-not-allowed' : 'hover:bg-amber-50'} ${className}`
        )}
      >
        {loading ? (
          <Spinner />
        ) : (
          <svg
            className="w-5 h-5"
            fill={alertOn ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        )}
      </button>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        message="접수 알림을 받으려면 로그인해주세요."
      />
    </>
  );
}
