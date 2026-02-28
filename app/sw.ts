/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, NetworkOnly, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope & typeof globalThis;

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

const externalImageCache = {
  matcher: ({ request, url }: { request: Request; url: URL }) =>
    request.destination === "image" && url.hostname !== self.location.hostname,
  handler: new NetworkFirst({
    cacheName: "external-images",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: THIRTY_DAYS_IN_SECONDS,
        purgeOnQuotaError: true,
      }),
    ],
  }),
};

const localImageCache = {
  matcher: ({ request, url }: { request: Request; url: URL }) =>
    request.destination === "image" && url.hostname === self.location.hostname,
  handler: new CacheFirst({
    cacheName: "local-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: THIRTY_DAYS_IN_SECONDS,
        purgeOnQuotaError: true,
      }),
    ],
  }),
};

const kakaoSdkBypass = {
  matcher: ({ url }: { url: URL }) =>
    url.hostname === 't1.kakaocdn.net' || url.hostname === 'developers.kakao.com',
  handler: new NetworkOnly({ fetchOptions: { cache: 'no-store' } }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [kakaoSdkBypass, externalImageCache, localImageCache, ...defaultCache],
});

serwist.addEventListeners();

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  svcUrl?: string;
}

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushPayload;
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    payload = { title: "서울 테니스", body: event.data.text() };
  }

  const notificationOptions: NotificationOptions & { actions?: { action: string; title: string }[] } = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: { url: payload.url || "/", svcUrl: payload.svcUrl },
    tag: `tennis-alert-${Date.now()}`,
  };

  if (payload.svcUrl) {
    notificationOptions.actions = [
      { action: "reserve", title: "바로 예약" },
    ];
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data as { url?: string; svcUrl?: string };

  if (event.action === "reserve" && data.svcUrl) {
    event.waitUntil(self.clients.openWindow(data.svcUrl));
    return;
  }

  const targetUrl = data.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
