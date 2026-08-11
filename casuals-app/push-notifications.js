/**
 * PUSH NOTIFICATIONS // SEGURO Y BLINDADO
 */

(function() {
    'use strict';

    // Comprobar soporte de Service Worker y Notificaciones
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        console.log("⚠️ Las notificaciones push no están soportadas en este navegador.");
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log("✅ SW Activo:", registration.scope);
                
                // Intentar solicitar permiso de forma silenciosa o preparada
                if (Notification.permission === 'default') {
                    // Opcional: puedes disparar esto con un botón de la UI si prefieres no invadir
                    console.log("📢 Notificaciones listas para solicitar permiso.");
                }
            })
            .catch((error) => {
                // Capturar cualquier fallo de ruta o red sin romper la consola de Eruda
                console.warn("Aviso de Service Worker (desarrollo local):", error.message || error);
            });
    });

    // Función global para solicitar permisos de notificación manualmente desde la app si se desea
    window.solicitarPermisoNotificaciones = async function() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log("🎉 Permiso de notificación concedido.");
                new Notification("CASUALS // PRIVATE", {
                    body: "¡Notificaciones activadas correctamente!",
                    icon: "./icon.png"
                });
            } else {
                console.log("❌ Permiso de notificación denegado.");
            }
        } catch (e) {
            console.error("Error al solicitar permisos:", e);
        }
    };
})();