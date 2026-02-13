'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TennisDataProvider } from '@/contexts/TennisDataContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Toast from '@/components/ui/Toast';

function useServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
}

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  useServiceWorkerRegistration();

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <TennisDataProvider>
            {children}
          </TennisDataProvider>
          <Toast />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
