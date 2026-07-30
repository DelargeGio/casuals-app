// ======================================
// PUSH-NOTIFICATIONS.JS - REGISTRO Y GESTIÓN DE PUSH FCM
// ======================================

function inicializarNotificacionesPush() {
    if (!('serviceWorker' in navigator)) {
        console.log("Este navegador no soporta Service Workers.");
        return;
    }

    navigator.serviceWorker.register('./firebase-messaging-sw.js')
        .then((registration) => {
            console.log('✅ Service Worker registrado con éxito:', registration);

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
                        console.error('❌ Error al recuperar el token de mensajería:', err);
                    });

                } else {
                    console.log('❌ Permiso de notificaciones denegado por el usuario.');
                }
            });
        })
        .catch((err) => {
            console.error('❌ Error al registrar el SW:', err);
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
            console.log('💾 Token guardado correctamente en Firebase.');
        }).catch((err) => {
            console.error('❌ Error al guardar el token en Firebase:', err);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarNotificacionesPush, 2500);
});
