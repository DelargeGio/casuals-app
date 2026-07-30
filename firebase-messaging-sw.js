importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAxvm2p6CzSOXJlR5m1JX-jWKkf_0S6oPc",
    authDomain: "casuals-8-32a4d.firebaseapp.com",
    databaseURL: "https://casuals-8-32a4d-default-rtdb.firebaseio.com/",
    projectId: "casuals-8-32a4d",
    storageBucket: "casuals-8-32a4d.firebasestorage.app",
    messagingSenderId: "552015693448",
    appId: "1:552015693448:web:e3cdb8df21007b5a27c13d"
});

const db = firebase.database();

// Escuchar en tiempo real la cola de notificaciones directamente desde la base de datos
db.ref('cola_notificaciones').limitToLast(1).on('child_added', (snapshot) => {
    const notifData = snapshot.val();
    if (!notifData) return;

    // Evitar disparar notificaciones viejas al abrir la app comprobando el tiempo (últimos 10 segundos)
    const ahora = Date.now();
    if (notifData.timestamp && (ahora - notifData.timestamp > 10000)) {
        return;
    }

    const title = notifData.title || "🚨 Alerta CASUALS";
    const options = {
        body: notifData.body || "Nuevo mensaje en la red.",
        icon: '/img/banner.png',
        badge: '/img/banner.png',
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(title, options);
});
