// Custom service worker for LondonFlat PWA
// Workbox will inject its manifest and imports during build

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Push Notification Handler ──
self.addEventListener('push', (event) => {
  let data = {
    title: 'LondonFlat',
    body: 'New notification',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-icon-192x192.png',
    badge: '/pwa-icon-192x192.png',
    tag: data.tag || 'londonflat',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: data.url
      ? [{ action: 'open', title: 'View' }]
      : undefined,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── Notification Click Handler ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ── Push Subscription Change ──
self.addEventListener('pushsubscriptionchange', () => {
  // Re-subscribe handled client-side on next page load
});
