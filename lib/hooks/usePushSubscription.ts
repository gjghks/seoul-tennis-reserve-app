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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function waitForActive(
  reg: ServiceWorkerRegistration,
  timeoutMs: number,
): Promise<ServiceWorkerRegistration> {
  if (reg.active) return Promise.resolve(reg);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('SW activation timeout')),
      timeoutMs,
    );

    const sw = reg.installing ?? reg.waiting;
    if (!sw) {
      clearTimeout(timer);
      reject(new Error('No SW to wait on'));
      return;
    }

    sw.addEventListener('statechange', () => {
      if (sw.state === 'activated') {
        clearTimeout(timer);
        resolve(reg);
      }
    });
  });
}

async function waitForServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');

  if (existing?.active) {
    const url = existing.active.scriptURL;
    if (url.endsWith('/sw-push.js')) return existing;
    if (url.endsWith('/sw.js') && process.env.NODE_ENV === 'production')
      return existing;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((r) => r.unregister()));

  const reg = await navigator.serviceWorker.register('/sw-push.js', {
    scope: '/',
  });

  return waitForActive(reg, 5000);
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

    navigator.serviceWorker.getRegistration('/').then((reg) => {
      if (reg?.active) {
        return reg.pushManager.getSubscription();
      }
      return null;
    })
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => setIsSubscribed(false))
      .finally(() => setIsLoading(false));
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) {
      console.warn('[Push] Browser does not support push notifications');
      return false;
    }
    if (!user) {
      console.warn('[Push] No authenticated user');
      return false;
    }

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);
      if (perm !== 'granted') {
        console.warn('[Push] Permission denied or dismissed:', perm);
        return false;
      }

      const registration = await waitForServiceWorker();
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set');
        return false;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
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
        const errorText = await res.text().catch(() => 'unknown');
        console.error('[Push] Server subscribe failed:', res.status, errorText);
        await subscription.unsubscribe();
        return false;
      }

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('[Push] Subscribe error:', error);
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
