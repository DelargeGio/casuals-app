importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAxvm2p6CzSOXJlR5m1JX-jWKkf_0S6oPc",
    authDomain: "casuals-8-32a4d.firebaseapp.com",
    databaseURL: "https://casuals-8-32a4d-default-rtdb.firebaseio.com/",
    projectId: "casuals-8-32a4d",
    storageBucket: "casuals-8-32a4d.firebasestorage.app",
    messagingSenderId: "552015693448",
    appId: "1:552015693448:web:e3cdb8df21007b5a27c13d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);
    const notificationTitle = payload.notification?.title || '🚨 Alerta CASUALS';
    const notificationOptions = {
        body: payload.notification?.body || 'Nuevo aviso en la red.',
        icon: '/img/banner.png',
        badge: '/img/banner.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
