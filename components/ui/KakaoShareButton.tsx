'use client';

import { useToast } from '@/contexts/ToastContext';
import { useThemeClass } from '@/lib/cn';

interface KakaoSharePayload {
  objectType: 'feed';
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: { mobileWebUrl: string; webUrl: string };
  };
  buttons: Array<{
    title: string;
    link: { mobileWebUrl: string; webUrl: string };
  }>;
}

interface KakaoSdk {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Share: {
    cleanup: () => void;
    sendDefault: (payload: KakaoSharePayload) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

interface KakaoShareButtonProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  className?: string;
}

function ensureKakaoInit(): boolean {
  if (!window.Kakao) return false;
  if (!window.Kakao.isInitialized()) {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appKey) return false;
    window.Kakao.init(appKey);
  }
  return window.Kakao.isInitialized();
}

// Fallback: dynamically load SDK with cache-busting when SW serves stale response
function loadKakaoSdkFallback(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js?_=${Date.now()}`;
    script.onload = () => resolve(ensureKakaoInit());
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function KakaoShareButton({
  title,
  description,
  url,
  imageUrl,
  className = '',
}: KakaoShareButtonProps) {
  const themeClass = useThemeClass();
  const { showToast } = useToast();

  const sendKakaoShare = (shareUrl: string) => {
    const kakao = window.Kakao;
    if (!kakao) return;
    try { kakao.Share.cleanup(); } catch {}
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: imageUrl || 'https://seoul-tennis.com/opengraph-image',
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [{
        title: '예약 현황 보기',
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      }],
    });
  };

  const handleKakaoShare = async () => {
    const shareUrl = url || window.location.href;

    if (ensureKakaoInit() && window.Kakao?.Share) {
      try {
        sendKakaoShare(shareUrl);
        return;
      } catch (error) {
        console.error('Kakao share failed:', error);
      }
    }

    const fallbackLoaded = await loadKakaoSdkFallback();
    if (fallbackLoaded && window.Kakao?.Share) {
      try {
        sendKakaoShare(shareUrl);
        return;
      } catch (error) {
        console.error('Kakao share fallback failed:', error);
      }
    }

    await copyToClipboard(shareUrl);
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
      onClick={handleKakaoShare}
      aria-label="카카오톡 공유"
      className={`interact-press ${themeClass(
        `flex items-center gap-2 px-3 py-2 border-2 border-black rounded-[5px] bg-[#FFE812] text-black font-bold shadow-[3px_3px_0px_0px_#000] transition-all active:duration-0 active:bg-[#FFD700] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${className}`,
        `flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 transition-all active:duration-0 active:bg-yellow-200 active:text-yellow-800 ${className}`
      )}`}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.19 4.85 3.15 6.37.08 2.85-1.18 4.4-1.18 4.4s2.85-.56 4.81-2.04c.52.1 1.08.16 1.66.16 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z" />
      </svg>
    </button>
  );
}
