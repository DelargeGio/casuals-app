// ======================================
// BOTÓN DE PÁNICO A.C.A.B. (TEXTO DE ALERTA SIN LINK DIRECTO)
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
            
            // Mandamos los datos limpios en texto plano sin enlace interactivo
            const textoAlerta = `🚨 ¡ALERTA A.C.A.B. ACTIVA! 🚨\nEl agente [ ${usuario} ] reporta emergencia policial.\n📍 Coordenadas exactas: Lat: ${lat}, Lng: ${lng} (Margen de error ~${precision}m)`;

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
            alert("⚠️ No se pudo obtener la ubicación GPS. Verifica tu GPS y permisos.");
            
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
