'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useThemeClass } from '@/lib/cn';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoShareButtonProps {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  className?: string;
}

export default function KakaoShareButton({
  title,
  description,
  url,
  imageUrl,
  className = '',
}: KakaoShareButtonProps) {
  const { isNeoBrutalism } = useTheme();
  const themeClass = useThemeClass();
  const { showToast } = useToast();
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  useEffect(() => {
    const initKakao = async () => {
      if (typeof window === 'undefined') return;

      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
        }
        setIsKakaoReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
        }
        setIsKakaoReady(true);
      };
      script.onerror = () => {
        setIsKakaoReady(false);
      };
      document.head.appendChild(script);
    };

    initKakao();
  }, []);

  const handleKakaoShare = async () => {
    if (!isKakaoReady || !window.Kakao) {
      showToast(`[debug] SDK not ready: isKakaoReady=${isKakaoReady}, Kakao=${!!window.Kakao}`, 'error');
      await copyToClipboard(url || window.location.href);
      return;
    }

    try {
      const shareUrl = url || window.location.href;
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: imageUrl || 'https://seoul-tennis.com/opengraph-image',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '예약 현황 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } catch (error) {
      console.error('Kakao share failed:', error);
      showToast(`[debug] share error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      await copyToClipboard(url || window.location.href);
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
      onClick={handleKakaoShare}
      aria-label="카카오톡 공유"
      className={themeClass(
        `flex items-center gap-2 px-3 py-2 border-2 border-black rounded-[5px] bg-[#FFE812] text-black font-bold shadow-[3px_3px_0px_0px_#000] transition-all hover:bg-[#FFD700] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${className}`,
        `flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 transition-all hover:bg-yellow-200 hover:text-yellow-800 ${className}`
      )}
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
