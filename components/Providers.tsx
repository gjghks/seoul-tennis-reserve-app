'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TennisDataProvider } from '@/contexts/TennisDataContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TennisDataProvider>
          {children}
        </TennisDataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
