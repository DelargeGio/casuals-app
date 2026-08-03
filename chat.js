// ==========================================
// CHAT.JS - MOTOR BLINDADO MÓVIL (v4.3)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 CHAT.JS CARGADO (MODO MÓVIL BLINDADO)");
    configurarInputsChatGlobales();
});

function configurarInputsChatGlobales() {
    const inputGaleria = document.getElementById('input-foto-galeria');
    if (inputGaleria && !inputGaleria.dataset.listenerConfigured) {
        inputGaleria.dataset.listenerConfigured = "true";
        inputGaleria.addEventListener('change', (e) => {
            prepararArchivoChat(e);
        });
    }

    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam && !inputCam.dataset.listenerConfigured) {
        inputCam.dataset.listenerConfigured = "true";
        inputCam.addEventListener('change', (e) => {
            prepararArchivoChat(e);
        });
    }

    // EL TRUCO CLAVE PARA ANDROID: Al volver de la cámara externa, atrapamos la foto por el foco
    window.addEventListener('focus', () => {
        if (inputCam && inputCam.files && inputCam.files[0]) {
            console.log("📸 Foto de cámara detectada al recuperar el foco.");
            const file = inputCam.files[0];
            inputCam.value = ''; // Limpiar
            procesarYEnviarArchivo(file);
        } else if (inputGaleria && inputGaleria.files && inputGaleria.files[0]) {
            console.log("📂 Foto de galería detectada al recuperar el foco.");
            const file = inputGaleria.files[0];
            inputGaleria.value = ''; // Limpiar
            procesarYEnviarArchivo(file);
        }
    });

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar && !btnEnviar.dataset.listenerConfigured) {
        btnEnviar.dataset.listenerConfigured = "true";
        btnEnviar.addEventListener('click', () => {
            enviarMensajeChat();
        });
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto && !inputTexto.dataset.listenerConfigured) {
        inputTexto.dataset.listenerConfigured = "true";
        inputTexto.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enviarMensajeChat();
            }
        });
    }
}

function prepararArchivoChat(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    event.target.value = ''; // Limpiar
    procesarYEnviarArchivo(file);
}

function procesarYEnviarArchivo(file) {
    console.log("📂 Procesando y comprimiendo imagen localmente...");
    const reader = new FileReader();
    reader.onload = (e) => {
        const rawBase64 = e.target.result;
        const img = new Image();

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500; 
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

                const base64Comprimido = canvas.toDataURL('image/jpeg', 0.60);
                console.log("✅ Imagen comprimida. Subiendo a Firebase...");

                if (typeof firebase === 'undefined') {
                    console.error("Firebase no disponible");
                    return;
                }

                const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
                const nuevoMensaje = {
                    autor: autor,
                    multimedia: base64Comprimido,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                };

                firebase.database().ref('mensajes').push(nuevoMensaje)
                    .then(() => {
                        console.log("🎉 ¡Foto enviada con éxito al chat!");
                    })
                    .catch(err => {
                        console.error("Error al enviar foto:", err);
                        alert("Error al enviar foto: " + err.message);
                    });

            } catch (err) {
                console.error("Error al comprimir:", err);
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
            const autor = escaparHTML(msg.autor || 'Anónimo');
            const texto = escaparHTML(msg.texto || '');
            const esMio = (msg.autor === usuarioActual);
            const claseAlineacion = esMio ? 'derecha' : 'izquierda';
            const tiempo = calcularTiempoChat(msg.timestamp);

            let multimediaHTML = '';
            if (msg.multimedia) {
                multimediaHTML = `
                    <div class="multimedia-box">
                        <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media tribuna" loading="lazy">
                    </div>
                `;
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
