'use client';

import Link from 'next/link';
import { useThemeClass } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAlertSettings, AlertSetting } from '@/lib/hooks/useAlertSettings';
import { usePushSubscription } from '@/lib/hooks/usePushSubscription';

function AlertTypeLabel({ type }: { type: AlertSetting['alert_type'] }) {
  if (type === 'favorite_available') return <span>접수 시작</span>;
  return <span>코트 오픈</span>;
}

function getAlertHref(alert: AlertSetting): string | null {
  if (alert.alert_type === 'favorite_available' && alert.district_slug) {
    return `/${alert.district_slug}/${encodeURIComponent(alert.target_id)}`;
  }
  if (alert.alert_type === 'district_available') {
    return `/${alert.target_id}`;
  }
  return null;
}

export default function AlertSettingsSection() {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const { alerts, isLoading, removeAlert } = useAlertSettings();
  const { isSubscribed, permission, subscribe, unsubscribe } = usePushSubscription();

  const handleTogglePush = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) showToast('푸시 알림이 해제되었습니다', 'info');
    } else {
      const success = await subscribe();
      if (success) {
        showToast('푸시 알림이 활성화되었습니다', 'success');
      } else if (permission === 'denied') {
        showToast('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요', 'error');
      } else {
        showToast('알림 설정에 실패했습니다. 잠시 후 다시 시도해주세요', 'error');
      }
    }
  };

  const handleRemoveAlert = async (alert: AlertSetting) => {
    const success = await removeAlert(alert.id);
    if (success) showToast(`${alert.target_name} 알림이 삭제되었습니다`, 'info');
  };

  return (
    <div className="mb-8">
      <h2 className={`text-lg mb-4 flex items-center gap-2 ${themeClass('font-black text-black uppercase', 'font-semibold text-gray-900')}`}>
        {isNeoBrutalism ? '🔔' : (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
        알림 설정
      </h2>

      {permission !== 'unsupported' && (
        <div className={`flex items-center justify-between p-4 mb-4 ${
          isNeoBrutalism
            ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
            : 'bg-white rounded-xl border border-gray-200'
        }`}>
          <div>
            <p className={themeClass('font-bold text-black', 'font-medium text-gray-900')}>
              푸시 알림
            </p>
            <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
              {permission === 'denied'
                ? '브라우저 설정에서 알림을 허용해주세요'
                : isSubscribed ? '활성화됨' : '비활성화됨'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePush}
            disabled={permission === 'denied'}
            className={themeClass(
              `px-4 py-2 border-2 border-black rounded-[5px] font-bold transition-all ${
                isSubscribed
                  ? 'bg-[#fca5a5] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                  : 'bg-[#a3e635] shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
              } disabled:opacity-50 disabled:cursor-not-allowed`,
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSubscribed
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`
            )}
          >
            {isSubscribed ? '해제' : '활성화'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((v) => (
            <div key={`alert-skeleton-${v}`} className={`h-16 ${themeClass('skeleton-neo', 'skeleton !rounded-xl')}`} />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className={`py-8 px-6 text-center ${
          isNeoBrutalism
            ? 'bg-white border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000]'
            : 'bg-white rounded-2xl border border-gray-100'
        }`}>
          <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center ${
            isNeoBrutalism
              ? 'bg-[#facc15] border-2 border-black rounded-[5px]'
              : 'bg-amber-50 rounded-full'
          }`}>
            <svg className={`w-6 h-6 ${themeClass('text-black', 'text-amber-400')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className={themeClass('font-bold text-black', 'text-gray-500')}>
            설정된 알림이 없습니다
          </p>
          <p className={`text-sm mt-1 ${themeClass('text-black/60', 'text-gray-400')}`}>
            코트 상세 페이지에서 알림을 설정해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const href = getAlertHref(alert);
            const cardClass = `flex items-center justify-between p-4 ${
              isNeoBrutalism
                ? 'bg-white border-2 border-black rounded-[5px] shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white rounded-xl border border-gray-200'
            }`;
            const content = (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`truncate ${themeClass('font-bold text-black', 'font-medium text-gray-900')}`}>
                      {alert.target_name}
                    </p>
                    {href && (
                      <svg className={`w-4 h-4 shrink-0 ${themeClass('text-black/60', 'text-gray-300')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm ${themeClass('text-black/60', 'text-gray-500')}`}>
                    <AlertTypeLabel type={alert.alert_type} />
                    {' · '}
                    {alert.enabled ? '활성' : '비활성'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveAlert(alert);
                  }}
                  className={`shrink-0 p-2 transition-colors ${themeClass('text-black/60 hover:text-red-600', 'text-gray-400 hover:text-red-500')}`}
                  aria-label={`${alert.target_name} 알림 삭제`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            );

            return href ? (
              <Link key={alert.id} href={href} className={cardClass}>
                {content}
              </Link>
            ) : (
              <div key={alert.id} className={cardClass}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
