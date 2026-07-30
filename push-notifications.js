// ======================================
// PUSH-NOTIFICATIONS.JS - REGISTRO Y GESTIÓN DE PUSH FCM
// ======================================

function inicializarNotificacionesPush() {
    if (!('serviceWorker' in navigator)) {
        console.log("Este navegador no soporta Service Workers.");
        return;
    }

    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration);

            if (typeof firebase === 'undefined') return;
            const messaging = firebase.messaging();

            // Solicitar permiso de notificaciones al usuario
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Permiso de notificaciones concedido.');

                    // Obtener el Token FCM del dispositivo
                    // Nota: Asegúrate de poner tu clave VAPID pública de la consola de Firebase si la requieres,
                    // o déjalo sin argumento si usas la configuración por defecto de Cloud Messaging web.
                    messaging.getToken({ 
                        vapidKey: '' // Pon aquí tu VAPID key de Firebase si la generaste, o déjala vacía si tu proyecto usa la llave web predeterminada
                    }).then((currentToken) => {
                        if (currentToken) {
                            console.log('Token FCM obtenido:', currentToken);
                            guardarTokenEnFirebase(currentToken);
                        } else {
                            console.log('No se pudo obtener el token de registro.');
                        }
                    }).catch((err) => {
                        console.error('Error al recuperar el token de mensajería:', err);
                    });

                } else {
                    console.log('Permiso de notificaciones denegado.');
                }
            });
        })
        .catch((err) => {
            console.error('Error al registrar el Service Worker:', err);
        });
}

function guardarTokenEnFirebase(token) {
    const usuario = localStorage.getItem("casuals_user") || "Agente_" + Math.floor(Math.random() * 9000 + 1000);
    const tokenLimpio = token.replace(/[.#$\/\[\]]/g, '_');
    
    if (typeof firebase !== 'undefined') {
        firebase.database().ref('fcm_tokens/' + tokenLimpio).set({
            usuario: usuario,
            token: token,
            actualizado: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

// Ejecutar al cargar la app con un pequeño respiro
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarNotificacionesPush, 2500);
});
