// ==========================================
// CHAT.JS - MOTOR ULTRA RESILIENTE (v11.1 - con soporte de video)
// ==========================================

let chatEnviandoBloqueado = false;

function escaparHTMLSeguro(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function construirHTMLMensajeChat(msg, id) {
    const usuarioActual = localStorage.getItem("usuario_nombre") || "";
    const autorCrudo = msg.autor || 'Anónimo';
    const autor = window.escaparHTML ? window.escaparHTML(autorCrudo) : escaparHTMLSeguro(autorCrudo);
    
    const colorInfo = (typeof COLORES_USUARIOS !== 'undefined' ? COLORES_USUARIOS[autorCrudo] : null) || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
    const esMio = (autorCrudo === usuarioActual);
    const claseAlineacion = esMio ? 'derecha' : 'izquierda';

    let multimediaHTML = '';
    if (msg.multimedia && msg.esVideo) {
        multimediaHTML = `
            <div style="width: 100%; max-width: 280px; margin-top: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--oro, #00f3ff); background: #000;">
                <video src="${msg.multimedia}" controls playsinline preload="metadata" style="width: 100%; height: auto; display: block;"></video>
            </div>
        `;
    } else if (msg.multimedia) {
        multimediaHTML = `
            <div style="width: 100%; max-width: 280px; margin-top: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--oro, #00f3ff); background: #000;">
                <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media" style="width: 100%; height: auto; display: block; cursor: pointer; touch-action: manipulation;">
            </div>
        `;
    }

    const textoSeguro = escaparHTMLSeguro(msg.texto || '');
    const textoHTML = `<p class="texto-mensaje" style="word-break: break-word; white-space: pre-wrap; margin: 0;">${textoSeguro}</p>`;
    const tiempo = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.tiempo || '');

    return `
        <div id="msg-${id}" class="mensaje-wrapper ${claseAlineacion}" style="animation: chatEntradaSuave 0.25s ease-out forwards;">
            <div class="burbuja-industrial">
                <span class="autor-tag" style="color: ${colorInfo.color} !important; text-shadow: ${colorInfo.sombra};">${autor}</span>
                ${msg.texto ? textoHTML : ''}
                ${multimediaHTML}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        </div>
    `;
}

(function asegurarEstilosChat() {
    if (document.getElementById('chat-industrial-styles')) return;
    const style = document.createElement('style');
    style.id = 'chat-industrial-styles';
    style.innerHTML = `
        @keyframes chatEntradaSuave {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        #mensajes-lista { scroll-behavior: smooth; }
        input[type="file"], label[for*="input-foto"], .chat-btn-multimedia {
            border: 1px solid var(--oro, #00f3ff) !important;
            background: rgba(0, 0, 0, 0.7) !important;
            box-sizing: border-box;
            border-radius: 6px !important;
        }
    `;
    document.head.appendChild(style);
})();

window.cargarMensajes = function() {
    if (typeof firebase === 'undefined' || (!window.db && !firebase.database)) {
        setTimeout(window.cargarMensajes, 300);
        return;
    }
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    try {
        firebase.database().ref('mensajes').off();
    } catch(e) {}

    mensajesLista.innerHTML = '';
    const refMensajes = firebase.database().ref('mensajes').limitToLast(50);

    refMensajes.on('child_added', (snapshot) => {
        const id = snapshot.key;
        if (document.getElementById(`msg-${id}`)) return; 

        const msg = snapshot.val();
        if (!msg) return;

        const cercaDelFondo = (mensajesLista.scrollHeight - mensajesLista.scrollTop - mensajesLista.clientHeight) < 120;
        const esMio = (msg.autor === (localStorage.getItem("usuario_nombre") || ''));

        const divTemp = document.createElement('div');
        divTemp.innerHTML = construirHTMLMensajeChat(msg, id);
        
        const elementoFinal = divTemp.firstElementChild;
        if (!elementoFinal) return;

        mensajesLista.appendChild(elementoFinal);

        if (cercaDelFondo || esMio) {
            mensajesLista.scrollTop = mensajesLista.scrollHeight;
        }
    });
};

// Comprime fotos (canvas) o lee videos directo como base64 (con tope de 2MB, sin comprimir)
function prepararArchivoParaChat(file) {
    return new Promise((resolve, reject) => {
        if (!file) { resolve(null); return; }

        if (file.type.startsWith('video/')) {
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error("El video pesa más de 2MB. Elegí uno más corto o comprimido."));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve({ url: e.target.result, esVideo: true });
            reader.onerror = () => reject(new Error("No se pudo leer el video."));
            reader.readAsDataURL(file);
            return;
        }

        if (!file.type.startsWith('image/')) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 800;
                let w = img.width, h = img.height;
                
                if (w > h) {
                    if (w > MAX_DIM) { h *= MAX_DIM / w; w = MAX_DIM; }
                } else {
                    if (h > MAX_DIM) { w *= MAX_DIM / h; h = MAX_DIM; }
                }
                
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve({ url: canvas.toDataURL('image/jpeg', 0.70), esVideo: false });
            };
            img.onerror = () => resolve(null);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

window.enviarMensajeSeguro = async function() {
    if (chatEnviandoBloqueado) return;

    const input = document.getElementById('chat-in') || document.querySelector('input[type="text"]');
    const inputCam = document.getElementById('input-foto-cam');
    const inputGaleria = document.getElementById('input-foto-galeria');
    
    const inputArchivo = (inputCam && inputCam.files && inputCam.files.length > 0) ? inputCam
                       : (inputGaleria && inputGaleria.files && inputGaleria.files.length > 0) ? inputGaleria
                       : null;

    if (!input || typeof firebase === 'undefined') {
        console.error("Error: No se encontró el input de texto o Firebase.");
        return;
    }

    const texto = input.value.trim();
    const tieneArchivo = inputArchivo && inputArchivo.files && inputArchivo.files[0];

    if (!texto && !tieneArchivo) return;

    chatEnviandoBloqueado = true;
    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (typeof window.reproducirSonidoMessenger === 'function') {
        window.reproducirSonidoMessenger();
    }

    try {
        let urlMultimedia = null;
        let esVideo = false;

        if (tieneArchivo) {
            input.placeholder = "[Transmitiendo...]";
            const resultado = await prepararArchivoParaChat(inputArchivo.files[0]);
            if (resultado) {
                urlMultimedia = resultado.url;
                esVideo = resultado.esVideo;
            }
        }

        await firebase.database().ref('mensajes').push({
            autor: autor,
            texto: texto,
            multimedia: urlMultimedia,
            esVideo: esVideo,
            tiempo: tiempo,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        input.value = '';
        input.placeholder = "Escribe un mensaje...";
        if (inputCam) inputCam.value = '';
        if (inputGaleria) inputGaleria.value = '';

    } catch (err) {
        console.error("Fallo de transmisión:", err);
        alert(err.message || "Error al enviar.");
        input.placeholder = "Escribe un mensaje...";
    } finally {
        setTimeout(() => { chatEnviandoBloqueado = false; }, 400);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputTexto = document.getElementById('chat-in') || document.querySelector('input[type="text"]');
    if (inputTexto) {
        inputTexto.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.enviarMensajeSeguro();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const img = e.target.closest('.chat-img-zoom');
        if (img && window.abrirVisorImagen) {
            window.abrirVisorImagen(img.getAttribute('data-url'));
        }
    });

    window.cargarMensajes();
});