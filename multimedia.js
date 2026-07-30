// ======================================
// MULTIMEDIA.JS - ENVÍO DIRECTO A REALTIME DATABASE
// ======================================

function procesarContenidoMensaje(texto) {
    if (!texto) return '';

    let htmlModificado = window.escaparHTML(texto);

    // 1. YouTube Shorts
    const ytShortsRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytShortsRegex.test(texto)) {
        ytShortsRegex.lastIndex = 0;
        return texto.replace(ytShortsRegex, (match, videoId) => {
            const urlSegura = window.escaparHTML(match);
            const idSeguro = window.escaparHTML(videoId);
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${urlSegura}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${urlSegura}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${idSeguro}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
    }

    // 2. YouTube Normal
    const ytNormalRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytNormalRegex.test(texto)) {
        ytNormalRegex.lastIndex = 0;
        return texto.replace(ytNormalRegex, (match, videoId) => {
            const urlSegura = window.escaparHTML(match);
            const idSeguro = window.escaparHTML(videoId);
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${urlSegura}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${urlSegura}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${idSeguro}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
    }

    // 3. Enlaces normales
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    htmlModificado = htmlModificado.replace(urlRegex, (url) => {
        const urlSegura = window.escaparHTML(url);
        return `<a href="${urlSegura}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${urlSegura}</a>`;
    });

    return `<p class="texto-mensaje">${htmlModificado}</p>`;
}

// ======================================
// ENVÍO DE ARCHIVOS DIRECTO A REALTIME DB
// ======================================

function enviarArchivoLocal(event) {
    const file = event.target.files[0];
    if (!file) return;

    const autor = localStorage.getItem("casuals_user") || "Agente Anónimo";
    console.log("📤 Procesando archivo para Realtime Database:", file.name);

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1024; // Resolución excelente y nítida
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Calidad al 85% para conservar excelente definición de imagen
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            const contenidoHtml = `<div style="margin-bottom:4px;">📸 [Imagen]</div><a href="${dataUrl}" target="_blank"><img src="${dataUrl}" style="max-width:100%; max-height:300px; border-radius:8px; border:1px solid var(--neon-azul); object-fit:cover;"></a>`;

            // Publicar directamente en Realtime Database
            firebase.database().ref('mensajes').push({
                autor: autor,
                texto: contenidoHtml,
                tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            }).then(() => {
                console.log("✅ Imagen enviada al chat correctamente.");
            }).catch(err => {
                console.error("❌ Error al guardar en base de datos:", err);
                alert("Error al enviar la imagen.");
            });

            // Registrar notificación
            const iconoUser = (typeof window.obtenerIconoUsuario === 'function') ? window.obtenerIconoUsuario(autor) : '👤';
            firebase.database().ref('cola_notificaciones').push({
                title: `${iconoUser} ${autor} compartió contenido`,
                body: `Envió una nueva foto al chat.`,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            event.target.value = '';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Asignaciones globales
window.procesarContenidoMensaje = procesarContenidoMensaje;
window.enviarArchivoLocal = enviarArchivoLocal;
