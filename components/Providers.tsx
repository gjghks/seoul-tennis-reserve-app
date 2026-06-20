'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModeProvider } from '@/contexts/ModeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SeasonalProvider } from '@/contexts/SeasonalContext';
import { TennisDataProvider } from '@/contexts/TennisDataContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Toast from '@/components/ui/Toast';
import ScrollToTop from '@/components/ui/ScrollToTop';
import UpdatePrompt from '@/components/pwa/UpdatePrompt';
import SakuraOverlay from '@/components/seasonal/SakuraOverlay';
import TennisBallOverlay from '@/components/seasonal/TennisBallOverlay';
import SummerDropletOverlay from '@/components/seasonal/SummerDropletOverlay';
import SnowOverlay from '@/components/seasonal/SnowOverlay';

function useServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    } else {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
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
      <ModeProvider>
      <ThemeProvider>
        <SeasonalProvider>
          <ToastProvider>
            <TennisDataProvider>
              {children}
            </TennisDataProvider>
            <Toast />
            <UpdatePrompt />
            <ScrollToTop />
            <SakuraOverlay />
            <TennisBallOverlay />
            <SummerDropletOverlay />
            <SnowOverlay />
          </ToastProvider>
        </SeasonalProvider>
      </ThemeProvider>
      </ModeProvider>
    </AuthProvider>
  );
}
