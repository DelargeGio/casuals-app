importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({ apiKey: "AIzaSyAxvm2p6CzSOXJlR5m1JX-jWKkf_0S6oPc", authDomain: "casuals-8-32a4d.firebaseapp.com", databaseURL: "https://casuals-8-32a4d-default-rtdb.firebaseio.com/", projectId: "casuals-8-32a4d", storageBucket: "casuals-8-32a4d.firebasestorage.app", messagingSenderId: "552015693448", appId: "1:552015693448:web:e3cdb8df21007b5a27c13d" });

const messaging = firebase.messaging();
const CACHE_NAME = 'casuals-v5-final';

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '🚨 Alerta CASUALS';
  const opts = { body: payload.notification?.body || 'Nuevo aviso.', icon: './icono.png', badge: './icono.png', vibrate: [200,100,200] };
  self.registration.showNotification(title, opts);
});

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
  if(e.request.url.includes('fcm') || e.request.url.includes('firebase')) return;
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{ if(e.request.method==='GET' && res.ok) caches.open(CACHE_NAME).then(c=>c.put(e.request,res.clone())); return res; })));
});