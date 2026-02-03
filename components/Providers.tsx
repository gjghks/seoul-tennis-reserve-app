'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TennisDataProvider } from '@/contexts/TennisDataContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Toast from '@/components/ui/Toast';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
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
