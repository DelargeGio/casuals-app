// ==========================================
// CHAT.JS - DEPURADOR DE DATOS Y MULTIMEDIA (v5.1)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 CHAT.JS CARGADO (VERSIÓN 5.1 - DEPURACIÓN)");
    configurarInputsChatGlobales();
});

function configurarInputsChatGlobales() {
    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam && !inputCam.dataset.listenerConfigured) {
        inputCam.dataset.listenerConfigured = "true";
        inputCam.addEventListener('change', (e) => procesarArchivoDirecto(e));
    }

    const inputGaleria = document.getElementById('input-foto-galeria');
    if (inputGaleria && !inputGaleria.dataset.listenerConfigured) {
        inputGaleria.dataset.listenerConfigured = "true";
        inputGaleria.addEventListener('change', (e) => procesarArchivoDirecto(e));
    }

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar && !btnEnviar.dataset.listenerConfigured) {
        btnEnviar.dataset.listenerConfigured = "true";
        btnEnviar.addEventListener('click', () => enviarMensajeChat());
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto && !inputTexto.dataset.listenerConfigured) {
        inputTexto.dataset.listenerConfigured = "true";
        inputTexto.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensajeChat();
        });
    }
}

function procesarArchivoDirecto(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    console.log("📂 Archivo detectado. Procesando...");
    const reader = new FileReader();
    reader.onload = (e) => {
        const rawBase64 = e.target.result;
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 350; // Reducido para asegurar ligereza en la base de datos
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_WIDTH) {
                        width *= MAX_WIDTH / height;
                        height = MAX_WIDTH;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64Comprimido = canvas.toDataURL('image/jpeg', 0.45);
                console.log("✅ Imagen comprimida. Tamaño Base64:", base64Comprimido.length);

                if (typeof firebase === 'undefined') return;

                const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
                const nuevoMensaje = {
                    autor: autor,
                    multimedia: base64Comprimido,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };

                firebase.database().ref('mensajes').push(nuevoMensaje)
                    .then(() => {
                        console.log("🎉 ¡Foto enviada correctamente a Firebase!");
                        event.target.value = ''; 
                    })
                    .catch(err => {
                        console.error("❌ Error al subir a Firebase:", err);
                    });

            } catch (err) {
                console.error("❌ Error en compresión:", err);
            }
        };
        img.src = rawBase64;
    };
    reader.readAsDataURL(file);
}

window.inicializarChat = function() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    if (typeof firebase === 'undefined') return;

    firebase.database().ref('mensajes').limitToLast(50).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            mensajesLista.innerHTML = `<div style="text-align:center; color:#00f3ff; margin-top:20px; font-family:monospace; font-size:0.75rem;">[SIN MENSAJES EN TRIBUNA]</div>`;
            return;
        }

        const usuarioActual = localStorage.getItem('usuario_nombre') || '';
        let htmlMensajes = '';

        Object.keys(data).forEach(key => {
            const msg = data[key];
            console.log("📥 Mensaje leído de DB:", { autor: msg.autor, tieneMultimedia: !!msg.multimedia, largoMedia: msg.multimedia ? msg.multimedia.length : 0 });

            const autor = escaparHTML(msg.autor || 'Anónimo');
            const texto = escaparHTML(msg.texto || '');
            const esMio = (msg.autor === usuarioActual);
            const claseAlineacion = esMio ? 'derecha' : 'izquierda';
            const tiempo = calcularTiempoChat(msg.timestamp);

            let multimediaHTML = '';
            if (msg.multimedia) {
                multimediaHTML = `
                    <div style="margin: 8px 0; border-radius: 6px; overflow: hidden; border: 2px solid #00f3ff; background: #000; max-width: 200px;">
                        <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Foto tribuna" style="width: 100%; height: auto; display: block; cursor: pointer;" onload="console.log('✅ IMAGEN RENDERIZADA EXITOSAMENTE')" onerror="console.error('❌ ERROR AL PINTAR BASE64 EN ETIQUETA IMG')" loading="lazy">
                    </div>
                `;
            } else if (texto.includes('youtube.com') || texto.includes('youtu.be')) {
                const embedUrl = convertirAEmbedYouTube(texto);
                if (embedUrl) {
                    multimediaHTML = `
                        <div style="margin-top: 6px; margin-bottom: 6px;">
                            <iframe src="${embedUrl}" style="width: 100%; height: 160px; border: none;" allowfullscreen></iframe>
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
};

window.enviarMensajeChat = function() {
    const inputTexto = document.getElementById('chat-in');
    const texto = inputTexto ? inputTexto.value.trim() : '';

    if (!texto) return;
    if (typeof firebase === 'undefined') return;

    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    
    const nuevoMensaje = {
        autor: autor,
        texto: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar) btnEnviar.disabled = true;

    firebase.database().ref('mensajes').push(nuevoMensaje)
        .then(() => {
            if (inputTexto) {
                inputTexto.value = '';
                inputTexto.placeholder = "Escribe un mensaje...";
            }
        })
        .catch(err => {
            console.error("Error al enviar texto:", err);
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
