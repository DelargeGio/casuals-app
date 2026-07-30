// ======================================
// PUSH-NOTIFICATIONS.JS - REGISTRO Y GESTIÓN DE PUSH FCM
// ======================================

function inicializarNotificacionesPush() {
    if (!('serviceWorker' in navigator)) {
        console.log("Este navegador no soporta Service Workers.");
        return;
    }

    // Detectar ruta base automáticamente para GitHub Pages o entorno local
    const swUrl = './firebase-messaging-sw.js';
    console.log("Intentando registrar SW en:", swUrl);

    navigator.serviceWorker.register(swUrl)
        .then((registration) => {
            console.log('✅ Service Worker registrado con éxito:', registration.scope);

            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase no está definido todavía.');
                return;
            }
            
            const messaging = firebase.messaging();

            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('✅ Permiso de notificaciones concedido.');

                    messaging.getToken().then((currentToken) => {
                        if (currentToken) {
                            console.log('🔥 Token FCM obtenido:', currentToken);
                            guardarTokenEnFirebase(currentToken);
                        } else {
                            console.log('⚠️ No se pudo obtener el token de registro.');
                        }
                    }).catch((err) => {
                        console.error('❌ Error Token:', err);
                    });

                } else {
                    console.log('❌ Permiso de notificaciones denegado.');
                }
            });
        })
        .catch((error) => {
            // Imprimir de forma segura las propiedades de cadena del error
            console.error('❌ Error crítico en Service Worker:', error ? error.toString() : 'Desconocido');
            if (error && error.message) console.error('Mensaje:', error.message);
            if (error && error.stack) console.error('Stack:', error.stack);
        });
}

function guardarTokenEnFirebase(token) {
    const usuario = localStorage.getItem("casuals_user") || "Agente_" + Math.floor(Math.random() * 9000 + 1000);
    const tokenLimpio = token.replace(/[.#$\/\[\]]/g, '_');
    
    if (typeof firebase !== 'undefined' && window.db) {
        window.db.ref('fcm_tokens/' + tokenLimpio).set({
            usuario: usuario,
            token: token,
            actualizado: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            console.log('💾 Token guardado en Firebase.');
        }).catch((err) => {
            console.error('❌ Error Firebase Token:', err);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarNotificacionesPush, 2500);
});
