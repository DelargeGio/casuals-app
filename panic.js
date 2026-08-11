// ==========================================
// PANIC.JS - MOTOR DE EMERGENCIA INTEGRADO (v7.5 - Con Sacudida JS Directa)
// ==========================================

// Función puente para inyectar alertas de pánico directamente al chat de Firebase
window.enviarTextoForzado = async function(texto) {
    if (typeof firebase === 'undefined') return;
    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        await firebase.database().ref('mensajes').push({
            autor: autor,
            texto: texto,
            multimedia: null,
            tiempo: tiempo,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (err) {
        console.error("Error al enviar alerta forzada a Firebase:", err);
    }
};

window.activarBengalaYHumio = function() {
    const btn = document.getElementById('btn-bengala-humo');
    if (btn) {
        btn.style.boxShadow = '0 0 15px #ff6600, 0 0 30px #ff6600';
        btn.style.borderColor = '#ff6600';
        btn.style.background = '#220800';
        setTimeout(() => {
            btn.style.boxShadow = '';
            btn.style.borderColor = '';
            btn.style.background = '';
        }, 600);
    }

    // 1. Reproducir sonido y sacudida localmente una sola vez
    reproducirSonidoBengalaHumo();

    // 2. Enviar zumbido a Firebase con ID único para sincronizar a todos los conectados
    if (typeof firebase !== 'undefined') {
        const remitente = localStorage.getItem('usuario_nombre') || 'Agente';
        const zumbidoId = 'z_' + Math.random().toString(36).substr(2, 9);
        window.ultimoZumbidoEnviadoId = zumbidoId;

        firebase.database().ref('zumbidos').push({
            id: zumbidoId,
            remitente: remitente,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
};

// Función de sacudida directa por JavaScript (Infalible y fluida)
function hacerEfectoSacudida() {
    const pantalla = document.getElementById('app-screen') || document.body;
    if (!pantalla) return;

    const steps = [
        "translate(5px, 5px)",
        "translate(-5px, -4px)",
        "translate(-5px, 4px)",
        "translate(5px, -4px)",
        "translate(-4px, 5px)",
        "translate(4px, -5px)",
        "translate(5px, 2px)",
        "translate(-2px, -5px)",
        "translate(0px, 0px)"
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            pantalla.style.transform = steps[i];
            i++;
        } else {
            clearInterval(interval);
            pantalla.style.transform = "none";
        }
    }, 35);
}

function reproducirSonidoBengalaHumo() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const ahora = audioCtx.currentTime;

        const bufferSize = audioCtx.sampleRate * 2.2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, ahora);
        filter.Q.setValueAtTime(4.0, ahora);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.01, ahora);
        gain.gain.linearRampToValueAtTime(0.4, ahora + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ahora + 2.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(ahora);
        noise.stop(ahora + 2.2);

        // Disparar la sacudida directa por JS
        hacerEfectoSacudida();

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }
    } catch(e) {
        console.log("Audio omitido:", e);
        // Forzar la sacudida y vibración incluso si el contexto de audio se bloquea
        hacerEfectoSacudida();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
    }
}

let zumbidosIniciados = false;
window.iniciarEscuchaZumbidos = function() {
    if (zumbidosIniciados || typeof firebase === 'undefined') return;
    zumbidosIniciados = true;

    const ref = firebase.database().ref('zumbidos').limitToLast(1);
    let primeraVez = true;

    ref.on('child_added', (snapshot) => {
        if (primeraVez) {
            primeraVez = false;
            return;
        }
        const data = snapshot.val();
        if (data) {
            if (data.id && data.id === window.ultimoZumbidoEnviadoId) {
                return;
            }
            reproducirSonidoBengalaHumo();
        }
    });
};

// ACTIVAR ALERTA A.C.A.B. CON UBICACIÓN GPS CORREGIDA
window.activarAlertaACAB = function() {
    reproducirSirenaPolicia();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                const mensajeAlerta = `🚨 ¡ALERTA A.C.A.B. 1.3.1.2 ACTIVADA! 🚨\n📍 Ubicación GPS:\n${mapsUrl}`;
                
                window.enviarTextoForzado(mensajeAlerta);
            },
            (error) => {
                const mensajeAlerta = "🚨 ¡ALERTA A.C.A.B. 1.3.1.2 ACTIVADA! (GPS no disponible)";
                window.enviarTextoForzado(mensajeAlerta);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    } else {
        const mensajeAlerta = "🚨 ¡ALERTA A.C.A.B. 1.3.1.2 ACTIVADA!";
        window.enviarTextoForzado(mensajeAlerta);
    }
};

function reproducirSirenaPolicia() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';

        const now = audioCtx.currentTime;
        for (let i = 0; i < 4; i++) {
            osc.frequency.linearRampToValueAtTime(850, now + (i * 0.35) + 0.15);
            osc.frequency.linearRampToValueAtTime(500, now + (i * 0.35) + 0.3);
        }

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 1.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.4);
    } catch(e) {
        console.log("Sirena omitida:", e);
    }
};