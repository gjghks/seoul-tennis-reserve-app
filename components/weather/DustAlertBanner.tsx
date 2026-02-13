'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useThemeClass } from '@/lib/cn';
import type { SeoulDustAlertStatus, DustAlertItem } from '@/lib/airkoreaApi';

const fetcher = async (url: string): Promise<SeoulDustAlertStatus> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch dust alert');
  return response.json();
};

function formatItemCode(code: DustAlertItem['itemCode']): string {
  return code === 'PM25' ? '초미세먼지 (PM2.5)' : '미세먼지 (PM10)';
}

function formatClearStatus(alert: DustAlertItem): string {
  if (!alert.clearDate || !alert.clearTime) return '미해제';
  return `${alert.clearDate} ${alert.clearTime} (농도: ${alert.clearVal ?? '-'}㎍/㎥)`;
}

export default function DustAlertBanner() {
  const themeClass = useThemeClass();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { data } = useSWR<SeoulDustAlertStatus>('/api/dust-alert', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30 * 60 * 1000,
    dedupingInterval: 30 * 60 * 1000,
    keepPreviousData: true,
  });

  if (!data?.hasAlert || dismissed) return null;

  const isGyeongbo = data.highestLevel === '경보';
  const itemLabel = data.highestItemCode === 'PM25' ? '초미세먼지' : '미세먼지';
  const icon = isGyeongbo ? '🚨' : '⚠️';
  const message = isGyeongbo
    ? `서울 ${itemLabel} 경보 발령 중`
    : `서울 ${itemLabel} 주의보 발령 중`;
  const primaryAlert = data.alerts[0];

  return (
    <div
      role="alert"
      className={themeClass(
        `relative border-b-2 border-black ${
          isGyeongbo ? 'bg-[#fca5a5] text-black' : 'bg-[#facc15] text-black'
        }`,
        `relative ${
          isGyeongbo
            ? 'bg-red-50 text-red-800 border-b border-red-200'
            : 'bg-orange-50 text-orange-800 border-b border-orange-200'
        }`
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-base leading-none shrink-0">{icon}</span>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className={themeClass(
            'flex-1 min-w-0 flex items-center gap-1.5 text-left text-sm font-black',
            'flex-1 min-w-0 flex items-center gap-1.5 text-left text-sm font-medium'
          )}
          aria-expanded={expanded}
          aria-controls="dust-alert-detail"
        >
          <span className="truncate">{message}</span>
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true"
          >
            <title>상세 정보 토글</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {data.highestValue !== null && (
          <span className={themeClass(
            'shrink-0 text-xs font-black bg-black/10 px-2 py-0.5 rounded-[3px]',
            `shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isGyeongbo ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`
          )}>
            {data.highestValue}㎍/㎥
          </span>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={themeClass(
            'shrink-0 p-1 hover:bg-black/10 rounded-[3px] transition-colors',
            'shrink-0 p-1 hover:bg-black/5 rounded transition-colors'
          )}
          aria-label="경보 배너 닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <title>닫기</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {expanded && primaryAlert && (
        <div
          id="dust-alert-detail"
          className="px-4 pb-3 pt-0"
        >
          <div className={themeClass(
            'border-t-2 border-black/15 pt-2.5',
            `border-t pt-2.5 ${isGyeongbo ? 'border-red-200/60' : 'border-orange-200/60'}`
          )}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px]">
              <dt className={themeClass('font-black text-black/50', 'font-medium text-current/50')}>발령</dt>
              <dd className={themeClass('font-bold', 'font-medium')}>
                {primaryAlert.issueDate} {primaryAlert.issueTime}
              </dd>

              <dt className={themeClass('font-black text-black/50', 'font-medium text-current/50')}>지역</dt>
              <dd className={themeClass('font-bold', 'font-medium')}>
                {primaryAlert.districtName} · {primaryAlert.moveName}
              </dd>

              <dt className={themeClass('font-black text-black/50', 'font-medium text-current/50')}>항목</dt>
              <dd className={themeClass('font-bold', 'font-medium')}>
                {formatItemCode(primaryAlert.itemCode)}
              </dd>

              <dt className={themeClass('font-black text-black/50', 'font-medium text-current/50')}>경보단계</dt>
              <dd className={themeClass('font-bold', 'font-medium')}>
                {primaryAlert.issueGbn} (농도: {primaryAlert.issueVal}㎍/㎥)
              </dd>

              <dt className={themeClass('font-black text-black/50', 'font-medium text-current/50')}>해제</dt>
              <dd className={themeClass('font-bold', 'font-medium')}>
                {formatClearStatus(primaryAlert)}
              </dd>
            </dl>

            <p className={themeClass(
              'mt-2.5 text-[11px] font-bold text-black/60 flex items-center gap-1',
              'mt-2.5 text-[11px] font-medium text-current/60 flex items-center gap-1'
            )}>
              <span>💡</span>
              <span>{isGyeongbo ? '야외 활동을 자제하세요' : '실내 코트를 추천합니다'}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
