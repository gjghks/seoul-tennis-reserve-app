'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface UsePushSubscriptionReturn {
  isSubscribed: boolean;
  permission: PushPermissionState;
  isLoading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

async function waitForServiceWorker(timeoutMs = 10000): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (!existing) {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }

  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('SW registration timeout')), timeoutMs)
    ),
  ]);
  return registration;
}

async function getExistingSubscription(): Promise<PushSubscription | null> {
  const registration = await waitForServiceWorker();
  return registration.pushManager.getSubscription();
}

export function usePushSubscription(): UsePushSubscriptionReturn {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<PushPermissionState>('prompt');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPushSupported()) {
      setPermission('unsupported');
      setIsLoading(false);
      return;
    }

    setPermission(Notification.permission as PushPermissionState);

    getExistingSubscription()
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => setIsSubscribed(false))
      .finally(() => setIsLoading(false));
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported() || !user) return false;

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);
      if (perm !== 'granted') return false;

      const registration = await waitForServiceWorker();
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return false;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const subJson = subscription.toJSON();

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
        }),
      });

      if (!res.ok) {
        await subscription.unsubscribe();
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) return false;

    setIsLoading(true);
    try {
      const subscription = await getExistingSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return true;
      }

      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      await subscription.unsubscribe();
      setIsSubscribed(false);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSubscribed, permission, isLoading, subscribe, unsubscribe };
}
