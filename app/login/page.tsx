'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

type LoginProvider = 'google' | 'kakao';
type SupabaseProvider = 'google' | 'kakao';

export default function Login() {
  const { isNeoBrutalism } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleOAuthLogin = async (displayProvider: LoginProvider, supabaseProvider: SupabaseProvider, scopes?: string) => {
    setLoadingProvider(displayProvider);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: scopes,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('google', 'google');
  const handleKakaoLogin = () => handleOAuthLogin('kakao', 'kakao');

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 scrollbar-hide ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
      <div className={isNeoBrutalism
        ? 'w-full max-w-md bg-white border-[3px] border-black rounded-[5px] shadow-[8px_8px_0px_0px_#000] p-8'
        : 'w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100'
      }>
        <h1 className={`text-2xl mb-2 text-center ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-bold text-gray-900'}`}>
          {isNeoBrutalism ? '🎾 로그인' : '로그인'}
        </h1>
        <p className={`text-center mb-8 ${isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-500'}`}>
          소셜 계정으로 간편하게 로그인하세요
        </p>

        {error && (
          <div className={isNeoBrutalism
            ? 'bg-red-100 border-2 border-black text-red-700 font-bold p-4 rounded-[5px] mb-6 text-center'
            : 'bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-center'
          }>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={loadingProvider !== null}
            className={isNeoBrutalism
              ? 'w-full py-4 bg-[#FEE500] text-[#191919] font-black uppercase border-[3px] border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-3'
              : 'w-full py-4 bg-[#FEE500] text-[#191919] font-semibold rounded-lg hover:bg-[#FDD800] transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm'
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.734 1.8 5.129 4.503 6.47-.177.637-.64 2.309-.732 2.665-.114.442.162.436.341.317.14-.093 2.238-1.519 3.147-2.138.553.08 1.123.122 1.704.122 5.523 0 10-3.463 10-7.737C22 6.463 17.523 3 12 3z" />
            </svg>
            {loadingProvider === 'kakao' ? '로그인 중...' : '카카오로 계속하기'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingProvider !== null}
            className={isNeoBrutalism
              ? 'w-full py-4 bg-white text-black font-black uppercase border-[3px] border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-3'
              : 'w-full py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm'
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loadingProvider === 'google' ? '로그인 중...' : 'Google로 계속하기'}
          </button>

        </div>

        <p className={`text-center text-xs mt-6 ${isNeoBrutalism ? 'text-black/50 font-medium' : 'text-gray-400'}`}>
          로그인 시 <a href="/terms" className="underline">이용약관</a> 및 <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
