// מטמון + התראות פוש (הודעה נמשכת מהשרת)
const C = 'aviel-live-110-f501a3e0', API = 'https://script.google.com/macros/s/AKfycbxSkxJJ1ODs067IOfDkuosXzKX-pVi2W7uTcWKAS-7YFuh8PW9mrjSS8bNC4SaiRTkP/exec';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'index.html', 'manifest.webmanifest', 'icon-192.png']))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k.indexOf(C.replace(/\d.*$/, '')) === 0).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const req = e.request.mode === 'navigate' ? new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' }) : e.request; // redirect manual: כתובת בלי / בסוף לא נשברת // פתיחת האפליקציה: תמיד בודקים מול השרת (304 אם לא השתנה), כדי שעדכון יגיע מיד ולא אחרי 10 דקות מטמון
  e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
const token = () => caches.open('aviel-beta-t').then(c => c.match('token')).then(r => r ? r.text() : '');
self.addEventListener('push', e => {
  e.waitUntil(token().then(t => fetch(API + '?api=inbox&t=' + encodeURIComponent(t) + '&_=' + Date.now()).then(r => r.json()))
    .then(j => (j && j.ok) ? j.r : { title: 'AVIEL', body: 'יש לך עדכון באפליקציה' })
    .catch(() => ({ title: 'AVIEL', body: 'יש לך עדכון באפליקציה' }))
    .then(m => self.registration.showNotification(m.title, { body: m.body, icon: 'icon-192.png', badge: 'icon-192.png', lang: 'he', dir: 'rtl', tag: 'aviel' })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(token().then(t => clients.matchAll({ type: 'window' }).then(ws => ws.length ? ws[0].focus() : clients.openWindow('./?t=' + t))));
});
