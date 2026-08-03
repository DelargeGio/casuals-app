// ==========================================
// CHAT.JS - MOTOR DE DEBUG Y ENVÍO (v4.2)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 CHAT.JS CARGADO (MODO DEBUG)");
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
}

function prepararArchivoChat(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
        alert("⚠️ DEBUG: No se detectó ningún archivo seleccionado.");
        return;
    }

    alert("📂 DEBUG: Archivo detectado. Procesando...");

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
                alert("✅ DEBUG: Imagen comprimida. Subiendo a Firebase...");

                if (typeof firebase === 'undefined') {
                    alert("❌ ERROR: Firebase no está disponible.");
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
                        alert("🎉 ¡EXITO: Foto enviada al chat!");
                        event.target.value = ''; // Limpiar input
                    })
                    .catch(err => {
                        alert("❌ ERROR FIREBASE: " + err.message);
                    });

            } catch (err) {
                alert("❌ ERROR EN COMPRESIÓN: " + err.message);
            }
        };

        img.onerror = () => {
            alert("❌ ERROR: El navegador no pudo leer la imagen.");
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
    });
};

function escaparHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function calcularTiempoChat(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
