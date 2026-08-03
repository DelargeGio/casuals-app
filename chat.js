// ==========================================
// CHAT.JS - MÓDULO CON DIAGNÓSTICO DE FOTOS (v2.2)
// ==========================================

let imagenChatTemporal = null;

window.inicializarChat = function() {
    console.log("💬 [CHAT] Inicializando módulo de chat...");
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) {
        console.warn("⚠️ [CHAT] No se encontró el contenedor 'mensajes-lista'.");
        return;
    }

    if (typeof firebase === 'undefined') {
        console.error('❌ [CHAT] Firebase no está disponible.');
        return;
    }

    const chatRef = firebase.database().ref('mensajes').limitToLast(50);
    chatRef.off();

    chatRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            mensajesLista.innerHTML = `<div style="text-align:center; color:#00f3ff; margin-top:20px; font-family:monospace; font-size:0.75rem;">[SIN MENSAJES EN TRIBUNA]</div>`;
            return;
        }

        const usuarioActual = localStorage.getItem('usuario_nombre') || '';
        let htmlMensajes = '';

        Object.keys(data).forEach(key => {
            const msg = data[key];
            const autor = escaparHTML(msg.autor || 'Anónimo');
            const texto = escaparHTML(msg.texto || '');
            const esMio = (msg.autor === usuarioActual);
            const claseAlineacion = esMio ? 'derecha' : 'izquierda';
            const tiempo = calcularTiempoChat(msg.timestamp);

            let multimediaHTML = '';
            if (msg.multimedia) {
                if (msg.multimedia.startsWith('data:image') || msg.multimedia.startsWith('http')) {
                    multimediaHTML = `
                        <div class="multimedia-box">
                            <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media tribuna">
                        </div>
                    `;
                }
            } else if (texto.includes('youtube.com') || texto.includes('youtu.be')) {
                const embedUrl = convertirAEmbedYouTube(texto);
                if (embedUrl) {
                    multimediaHTML = `
                        <div class="multimedia-box">
                            <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                }
            }

            htmlMensajes += `
                <div class="mensaje-wrapper ${claseAlineacion}">
                    <div class="burbuja-industrial">
                        <span class="autor-tag">${autor}</span>
                        ${texto ? `<p class="texto-mensaje">${texto}</p>` : ''}
                        ${multimediaHTML}
                        <span class="mensaje-tiempo">${tiempo}</span>
                    </div>
                </div>
            `;
        });

        mensajesLista.innerHTML = htmlMensajes;
        mensajesLista.scrollTop = mensajesLista.scrollHeight;

        mensajesLista.querySelectorAll('.chat-img-zoom').forEach(img => {
            img.addEventListener('click', (e) => {
                const url = e.currentTarget.getAttribute('data-url');
                if (window.abrirVisorImagen) window.abrirVisorImagen(url);
            });
        });
    });

    // Conectar inputs de fotos
    const inputGaleria = document.getElementById('input-foto-galeria');
    if (inputGaleria && !inputGaleria.dataset.listenerConfigured) {
        inputGaleria.dataset.listenerConfigured = "true";
        inputGaleria.addEventListener('change', prepararImagenChat);
        console.log("📸 [CHAT] Listener conectado a 'input-foto-galeria'");
    }

    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam && !inputCam.dataset.listenerConfigured) {
        inputCam.dataset.listenerConfigured = "true";
        inputCam.addEventListener('change', prepararImagenChat);
        console.log("📸 [CHAT] Listener conectado a 'input-foto-cam'");
    }

    // Conectar botón enviar
    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar && !btnEnviar.dataset.listenerConfigured) {
        btnEnviar.dataset.listenerConfigured = "true";
        btnEnviar.addEventListener('click', enviarMensajeChat);
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto && !inputTexto.dataset.listenerConfigured) {
        inputTexto.dataset.listenerConfigured = "true";
        inputTexto.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensajeChat();
        });
    }
};

function prepararImagenChat(event) {
    console.log("🖼️ [CHAT] Archivo de imagen seleccionado...");
    const file = event.target.files[0];
    if (!file) {
        console.warn("⚠️ [CHAT] No se seleccionó ningún archivo.");
        return;
    }
    if (!file.type.startsWith('image/')) {
        console.warn("⚠️ [CHAT] El archivo seleccionado no es una imagen válida:", file.type);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            console.log("📐 [CHAT] Imagen cargada en memoria. Redimensionando con canvas...");
            const canvas = document.createElement('canvas');
            const MAX = 900;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
            else { if (h > MAX) { w *= MAX / h; h = MAX; } }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            
            imagenChatTemporal = canvas.toDataURL('image/jpeg', 0.80);
            console.log("✅ [CHAT] Imagen comprimida con éxito. Enviando automáticamente a Firebase...");
            
            enviarMensajeChat();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.enviarMensajeChat = function() {
    const inputTexto = document.getElementById('chat-in');
    const texto = inputTexto ? inputTexto.value.trim() : '';

    if (!texto && !imagenChatTemporal) {
        console.warn("⚠️ [CHAT] Intento de enviar mensaje vacío.");
        return;
    }
    if (typeof firebase === 'undefined') return;

    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const nuevoMensaje = {
        autor: autor,
        texto: texto,
        multimedia: imagenChatTemporal || '',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    console.log("🚀 [CHAT] Enviando mensaje a Firebase...", nuevoMensaje);

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar) btnEnviar.disabled = true;

    firebase.database().ref('mensajes').push(nuevoMensaje)
        .then(() => {
            console.log("🎉 [CHAT] ¡Mensaje enviado con éxito a Firebase!");
            if (inputTexto) inputTexto.value = '';
            imagenChatTemporal = null;
            
            const inputGaleria = document.getElementById('input-foto-galeria');
            if (inputGaleria) inputGaleria.value = '';
            const inputCam = document.getElementById('input-foto-cam');
            if (inputCam) inputCam.value = '';
        })
        .catch(err => {
            console.error("❌ [CHAT] Error al enviar mensaje a Firebase:", err);
            alert("No se pudo enviar el mensaje: " + err.message);
        })
        .finally(() => {
            if (btnEnviar) btnEnviar.disabled = false;
        });
};

function escaparHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function calcularTiempoChat(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function convertirAEmbedYouTube(url) {
    try {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
        return null;
    }
}
