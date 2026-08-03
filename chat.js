// ==========================================
// CHAT.JS - MÓDULO BLINDADO Y SEGURO (v1.0)
// ==========================================

window.inicializarChat = function() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    if (typeof firebase === 'undefined') {
        console.error('Firebase no está disponible.');
        return;
    }

    const chatRef = firebase.database().ref('mensajes').limitToLast(50);
    
    // Limpiar oyentes previos para evitar fugas de memoria
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

            // Procesamiento multimedia seguro (Imágenes o YouTube)
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
        
        // Auto-scroll al final del chat para ver el mensaje más reciente
        mensajesLista.scrollTop = mensajesLista.scrollHeight;

        // Asignar listeners táctiles seguros a las imágenes del chat
        mensajesLista.querySelectorAll('.chat-img-zoom').forEach(img => {
            img.addEventListener('click', (e) => {
                const url = e.currentTarget.getAttribute('data-url');
                if (window.abrirVisorImagen) window.abrirVisorImagen(url);
            });
        });
    });
};

// Función auxiliar de sanitización
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
