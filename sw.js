// Service worker do painel: recebe as notificações de alarme mesmo com o app fechado
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { titulo: 'Recalque', msg: e.data ? e.data.text() : '' }; }
  const titulo = d.titulo || 'Recalque';
  const urgente = (d.prio || 3) >= 5;
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.msg || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || ('rec-' + Date.now()),
    renotify: true,
    requireInteraction: urgente,
    vibrate: urgente ? [400, 150, 400, 150, 400] : [200],
    data: { url: d.url || self.registration.scope }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if (w.url.startsWith(self.registration.scope) && 'focus' in w) return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
