'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LOGIN_PROVIDER_KEY } from '@/lib/hooks/useReservationTip';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    let loginProvider: string | null = null;
    try {
      loginProvider = localStorage.getItem(LOGIN_PROVIDER_KEY);
      localStorage.removeItem(LOGIN_PROVIDER_KEY);
    } catch { /* noop */ }

    await supabase.auth.signOut({ scope: 'local' });

    // 카카오 로그인이었으면 카카오 세션도 파괴 (브라우저 쿠키 제거)
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    if (loginProvider === 'kakao' && kakaoClientId) {
      const logoutRedirectUri = `${window.location.origin}/login`;
      window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${kakaoClientId}&logout_redirect_uri=${encodeURIComponent(logoutRedirectUri)}`;
      return;
    }
  }, []);

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
