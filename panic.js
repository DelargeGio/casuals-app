// ======================================
// BOTÓN DE PÁNICO A.C.A.B. (TIEMPO REAL / GPS BLINDADO)
// ======================================

function activarAlertaACAB() {
    const usuario = localStorage.getItem("casuals_user") || "Anónimo";
    
    // Verificamos soporte de geolocalización con alta precisión
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    // Feedback táctil inmediato de emergencia (vibración fuerte)
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 500]);
    }

    // Opciones de GPS de alta precisión
    const opcionesGeo = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const precision = position.coords.accuracy; // metros de precisión
            
            // Enlace directo a Google Maps con chincheta en las coordenadas exactas
            const linkMapa = `https://www.google.com/maps?q=${lat},${lng}`;
            
            const textoAlerta = `🚨 ¡ALERTA A.C.A.B. ACTIVA! 🚨\nEl agente ${usuario} reporta presencia policial o emergencia.\n📍 Ubicación exacta (Margen de error ~${Math.round(precision)}m):\n${linkMapa}`;

            if (typeof firebase !== 'undefined') {
                firebase.database().ref('mensajes').push({
                    autor: usuario,
                    texto: textoAlerta,
                    esAlertaAcab: true, // Identificador especial para emergencias
                    tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                });
            } else {
                console.error("Firebase no disponible para enviar la alerta.");
            }
        }, 
        (error) => {
            let mensajeError = "No se pudo obtener la ubicación.";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensajeError = "Permiso de ubicación denegado. Activa el GPS.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensajeError = "Información de ubicación no disponible.";
                    break;
                case error.TIMEOUT:
                    mensajeError = "Tiempo de espera agotado al buscar GPS.";
                    break;
            }
            alert(`⚠️ ERROR DE ALERTA: ${mensajeError}`);
            
            // Aunque falle el GPS, mandamos el grito de auxilio al chat
            if (typeof firebase !== 'undefined') {
                firebase.database().ref('mensajes').push({
                    autor: usuario,
                    texto: `🚨 ¡ALERTA A.C.A.B.! 🚨 (${usuario} solicitó auxilio pero el GPS falló o está bloqueado)`,
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
