// AVIEL ניהול: התראה כשמתאמן/ת שולח/ת שאלה, הודעה קולית או צ׳ק-אין
const API = 'https://script.google.com/macros/s/AKfycbxSkxJJ1ODs067IOfDkuosXzKX-pVi2W7uTcWKAS-7YFuh8PW9mrjSS8bNC4SaiRTkP/exec';
const ps = () => caches.open('aviel-coach-ps').then(c => c.match('ps')).then(r => r ? r.text() : '').catch(() => '');
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
// פתיחת הדשבורד: תמיד בודקים מול השרת (304 אם לא השתנה) — עדכון מגיע מיד ולא אחרי 10 דק׳ מטמון של GitHub Pages
self.addEventListener('fetch', e => { if (e.request.mode === 'navigate') e.respondWith(fetch(new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' })).catch(() => fetch(e.request))); });
self.addEventListener('push', e => {
  e.waitUntil(ps().then(s => fetch(API + '?api=coachnote&ps=' + encodeURIComponent(s) + '&_=' + Date.now()).then(r => r.json()))
    .then(j => (j && j.ok && j.r) ? j.r : null).catch(() => null)
    .then(m => self.registration.showNotification((m && m.title) || 'AVIEL ניהול', { body: (m && m.body) || 'יש עדכון מהמתאמנים', icon: 'icon-192.png', badge: 'icon-192.png', lang: 'he', dir: 'rtl', tag: 'coach-' + Date.now(), data: { url: (m && m.url) || '' } })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const u = String((e.notification.data && e.notification.data.url) || '');
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { if (ws.length) { if (u) ws[0].postMessage({ go: u }); return ws[0].focus(); } return clients.openWindow('./' + u.replace(/^\.\//, '')); }));
});
