'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  showLabel?: boolean;
}

export default function ShareButton({
  title,
  text,
  url,
  className = '',
  showLabel = false,
}: ShareButtonProps) {
  const { isNeoBrutalism } = useTheme();
  const { showToast } = useToast();

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareData = {
      title,
      text: text || title,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('링크가 복사되었습니다', 'success');
    } catch {
      showToast('링크 복사에 실패했습니다', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="공유하기"
      className={isNeoBrutalism
        ? `flex items-center gap-2 px-3 py-2 border-2 border-black rounded-[5px] bg-white text-black font-bold shadow-[3px_3px_0px_0px_#000] transition-all hover:bg-[#88aaee] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${className}`
        : `flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 ${className}`
      }
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      {showLabel && (
        <span className={`text-sm ${isNeoBrutalism ? 'uppercase' : ''}`}>
          공유
        </span>
      )}
    </button>
  );
}
