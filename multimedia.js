// ======================================
// MULTIMEDIA.JS - PROCESADOR Y SUBIDA BLINDADA DE FOTOS
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
// ENVÍO DIRECTO Y SEGURO DE ARCHIVOS LOCALES
// ======================================

async function enviarArchivoLocal(event) {
    const file = event.target.files[0];
    if (!file) return;

    const autor = localStorage.getItem("casuals_user") || "Agente Anónimo";
    
    // Feedback visual rápido en consola o alerta de subida
    console.log("📤 Subiendo archivo multimedia:", file.name);

    try {
        const storageRef = firebase.storage().ref();
        const fileName = `chat_media/${Date.now()}_${file.name}`;
        const fileRef = storageRef.child(fileName);

        // Subimos el archivo directamente sin compresión bloqueante para garantizar éxito en red móvil
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();

        let contenidoHtml = "";
        if (file.type.startsWith('image/')) {
            contenidoHtml = `<div style="margin-bottom:4px;">📸 [Imagen compartida]</div><a href="${downloadURL}" target="_blank"><img src="${downloadURL}" style="max-width:100%; max-height:250px; border-radius:8px; border:1px solid var(--neon-azul); object-fit:cover;"></a>`;
        } else if (file.type.startsWith('video/')) {
            contenidoHtml = `<video controls style="max-width:100%; max-height:250px; border-radius:8px; border:1px solid var(--oro);"><source src="${downloadURL}" type="${file.type}"></video>`;
        } else {
            contenidoHtml = `<a href="${downloadURL}" target="_blank" style="color:var(--neon-azul); text-decoration:underline;">📁 Archivo adjunto: ${file.name}</a>`;
        }

        // Mandamos el mensaje a Firebase Database
        await firebase.database().ref('mensajes').push({
            autor: autor,
            texto: contenidoHtml,
            tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });

        console.log("✅ Archivo enviado exitosamente al chat.");
    } catch (error) {
        console.error("❌ Error crítico al subir archivo a Firebase Storage:", error);
        alert("Error al enviar el archivo. Revisa los permisos de Firebase Storage.");
    } finally {
        // Limpiar input
        event.target.value = '';
    }
}

// Asignaciones globales
window.procesarContenidoMensaje = procesarContenidoMensaje;
window.enviarArchivoLocal = enviarArchivoLocal;
