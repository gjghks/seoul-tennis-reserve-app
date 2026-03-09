self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "\uc11c\uc6b8 \ud14c\ub2c8\uc2a4", body: event.data.text() };
  }

  const options = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: { url: payload.url || "/", svcUrl: payload.svcUrl },
    tag: "tennis-alert-" + Date.now(),
  };

  if (payload.svcUrl) {
    options.actions = [{ action: "reserve", title: "\ubc14\ub85c \uc608\uc57d" }];
  }

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};

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
