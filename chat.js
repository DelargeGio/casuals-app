// ==========================================
// CHAT.JS - MOTOR BLINDADO CON DETECCIÓN DE FOCO (v3.6)
// ==========================================

let multimediaChatTemporal = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 CHAT.JS CARGADO CORRECTAMENTE");
    configurarInputsChatGlobales();
});

function configurarInputsChatGlobales() {
    const inputGaleria = document.getElementById('input-foto-galeria');
    if (inputGaleria && !inputGaleria.dataset.listenerConfigured) {
        inputGaleria.dataset.listenerConfigured = "true";
        inputGaleria.addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            prepararArchivoChat(e);
        }, true);
    }

    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam && !inputCam.dataset.listenerConfigured) {
        inputCam.dataset.listenerConfigured = "true";
        inputCam.addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            prepararArchivoChat(e);
        }, true);
    }

    // ⭐ PARCHE CLAVE PARA ANDROID: Detecta cuando regresas de la cámara nativa
    window.addEventListener('focus', () => {
        if (!multimediaChatTemporal) {
            if (inputCam && inputCam.files && inputCam.files[0]) {
                console.log("🔄 Capturado archivo de cámara por retorno de enfoque");
                prepararArchivoChat({ target: inputCam });
            } else if (inputGaleria && inputGaleria.files && inputGaleria.files[0]) {
                console.log("🔄 Capturado archivo de galería por retorno de enfoque");
                prepararArchivoChat({ target: inputGaleria });
            }
        }
    });

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar && !btnEnviar.dataset.listenerConfigured) {
        btnEnviar.dataset.listenerConfigured = "true";
        btnEnviar.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            enviarMensajeChat();
        });
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto && !inputTexto.dataset.listenerConfigured) {
        inputTexto.dataset.listenerConfigured = "true";
        inputTexto.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.stopImmediatePropagation();
                enviarMensajeChat();
            }
        });
    }
}

window.inicializarChat = function() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    if (typeof firebase === 'undefined') {
        console.error('Firebase no está disponible.');
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
            
            let textoCrudo = msg.texto || '';
            if (textoCrudo.includes('data:image') || textoCrudo.includes('<div') || textoCrudo.includes('base64')) {
                textoCrudo = ''; 
            }
            const texto = escaparHTML(textoCrudo);

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
                } else if (msg.multimedia.startsWith('data:video')) {
                    multimediaHTML = `
                        <div class="multimedia-box">
                            <video src="${msg.multimedia}" controls playsinline preload="metadata" style="width:100%; max-height:250px; border-radius:4px;"></video>
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
};

function prepararArchivoChat(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
        console.log("⚠️ No se seleccionó ningún archivo.");
        return;
    }

    console.log("📂 Archivo detectado:", file.name, "Tamaño:", (file.size / 1024).toFixed(2), "KB");
    const inputTexto = document.getElementById('chat-in');

    const reader = new FileReader();
    reader.onload = (e) => {
        const rawBase64 = e.target.result;

        if (file.type.startsWith('image/')) {
            const img = new Image();
            let finished = false;

            const safetyTimeout = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    multimediaChatTemporal = rawBase64;
                    if (inputTexto) {
                        inputTexto.placeholder = "[📷 Foto lista para enviar]";
                        inputTexto.focus();
                    }
                }
            }, 3000);

            img.onload = () => {
                if (finished) return;
                finished = true;
                clearTimeout(safetyTimeout);

                try {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
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

                    multimediaChatTemporal = canvas.toDataURL('image/jpeg', 0.70);
                } catch (err) {
                    multimediaChatTemporal = rawBase64;
                }

                if (inputTexto) {
                    inputTexto.placeholder = "[📷 Foto lista para enviar]";
                    inputTexto.focus();
                }
            };

            img.onerror = () => {
                if (finished) return;
                finished = true;
                clearTimeout(safetyTimeout);
                multimediaChatTemporal = rawBase64;
                if (inputTexto) {
                    inputTexto.placeholder = "[📷 Foto lista para enviar]";
                    inputTexto.focus();
                }
            };

            img.src = rawBase64;
        } else {
            multimediaChatTemporal = rawBase64;
            if (inputTexto) {
                inputTexto.placeholder = "[📁 Archivo listo para enviar]";
                inputTexto.focus();
            }
        }
    };

    reader.readAsDataURL(file);
}

window.enviarMensajeChat = function() {
    const inputTexto = document.getElementById('chat-in');
    const texto = inputTexto ? inputTexto.value.trim() : '';

    if (!texto && !multimediaChatTemporal) return;
    if (typeof firebase === 'undefined') return;

    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const nuevoMensaje = {
        autor: autor,
        texto: texto,
        multimedia: multimediaChatTemporal || '',
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
            multimediaChatTemporal = null;
            
            const inputGaleria = document.getElementById('input-foto-galeria');
            if (inputGaleria) inputGaleria.value = '';
            const inputCam = document.getElementById('input-foto-cam');
            if (inputCam) inputCam.value = '';
        })
        .catch(err => {
            console.error("Error al enviar:", err);
            alert("No se pudo enviar el archivo.");
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
