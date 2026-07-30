// ======================================
// ALERTAS.JS - NOTIFICACIONES FLOTANTES Y AVISOS EN TIEMPO REAL
// ======================================

function inicializarSistemaAlertas() {
    if (typeof firebase === 'undefined') return;

    // Escuchamos la última alerta o mensaje crítico en tiempo real
    const dbRef = firebase.database().ref('mensajes').limitToLast(1);
    
    let primerCarga = true;
    dbRef.on('child_added', (snapshot) => {
        if (primerCarga) {
            // Evitamos lanzar alerta por los mensajes históricos al cargar la app
            primerCarga = false;
            return;
        }

        const msg = snapshot.val();
        if (!msg || !msg.texto) return;

        // Si es una alerta de pánico o aviso importante, lanzamos el Toast neón
        if (msg.texto.includes("🚨") || msg.texto.includes("ALERTA")) {
            mostrarAlertaFlotante(msg.autor, msg.texto);
            reproducirEfectoSonoroAlerta();
        }
    });
}

function mostrarAlertaFlotante(autor, texto) {
    // Buscar si ya existe un contenedor de alertas y si no, crearlo dinámicamente
    let toastContainer = document.getElementById('toast-alertas-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-alertas-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 70px;
            left: 16px;
            right: 16px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(15, 15, 15, 0.95);
        border: 1px solid #ff3366;
        border-left: 4px solid #ff3366;
        border-radius: 10px;
        padding: 12px 16px;
        color: #fff;
        box-shadow: 0 5px 20px rgba(255, 51, 102, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: auto;
        animation: entradaToast 0.3s ease-out forwards;
    `;

    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 0.8rem; color: #ff3366;">🚨 ALERTA DE ${escapeHtmlSimple(autor)}</span>
            <span style="font-size: 0.65rem; color: #888;">Hace un momento</span>
        </div>
        <div style="font-size: 0.82rem; color: #ddd; word-break: break-word;">
            ${escapeHtmlSimple(texto)}
        </div>
    `;

    toastContainer.appendChild(toast);

    // Vibración de atención si el dispositivo lo soporta
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }

    // Desvanecer y remover después de 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease-out';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

function reproducirEfectoSonoroAlerta() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.log("Audio de alerta bloqueado o no soportado", e);
    }
}

function escapeHtmlSimple(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Iniciar sistema de alertas al cargar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarSistemaAlertas, 1000);
});

window.mostrarAlertaFlotante = mostrarAlertaFlotante;
