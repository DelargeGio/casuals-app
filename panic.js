// ======================================
// BOTÓN DE PÁNICO A.C.A.B. (GPS DIRECTO Y MAPA MÓVIL)
// ======================================

function activarAlertaACAB() {
    const usuario = localStorage.getItem("casuals_user") || "Anónimo";
    
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    // Vibración de emergencia fuerte
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
    }

    const opcionesGeo = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const precision = Math.round(position.coords.accuracy);
            
            // Usamos la URL universal de mapas que abre directo la app de Google Maps o el navegador con la chincheta exacta
            const linkMapa = `https://maps.google.com/?q=${lat},${lng}`;
            
            const textoAlerta = `🚨 ¡ALERTA A.C.A.B. ACTIVA! 🚨\nEl agente [ ${usuario} ] reporta emergencia policial.\n📍 Abrir ubicación exacta (~${precision}m de error):\n${linkMapa}`;

            if (typeof firebase !== 'undefined') {
                firebase.database().ref('mensajes').push({
                    autor: usuario,
                    texto: textoAlerta,
                    esAlertaAcab: true,
                    tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                });
            }
        }, 
        (error) => {
            alert("⚠️ No se pudo obtener la ubicación GPS. Verifica que tengas el GPS encendido y permisos concedidos.");
            
            if (typeof firebase !== 'undefined') {
                firebase.database().ref('mensajes').push({
                    autor: usuario,
                    texto: `🚨 ¡ALERTA A.C.A.B.! 🚨 (${usuario} activó el pánico pero falló la lectura del GPS)`,
                    esAlertaAcab: true,
                    tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                });
            }
        }, 
        opcionesGeo
    );
}

window.activarAlertaACAB = activarAlertaACAB;
