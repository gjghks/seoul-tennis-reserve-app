'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface LastUpdatedProps {
  timestamp: string | undefined;
  className?: string;
}

export default function LastUpdated({ timestamp, className = '' }: LastUpdatedProps) {
  const { isNeoBrutalism } = useTheme();

  if (!timestamp) return null;

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs ${
      isNeoBrutalism 
        ? 'text-black/50 font-medium' 
        : 'text-gray-400'
    } ${className}`}>
      <svg 
        className="w-3.5 h-3.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span>업데이트: {formatRelativeTime(timestamp)}</span>
    </div>
  );
}
