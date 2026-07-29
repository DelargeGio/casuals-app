// ======================================
// MULTIMEDIA.JS - PROCESADOR DE SHORTS, VIDEOS Y COMPRESIÓN DE FOTOS (BLINDADO)
// ======================================

function procesarContenidoMensaje(texto) {
    if (!texto) return '';

    // Usamos window.escaparHTML centralizado en lugar de redefinirlo aquí
    let htmlModificado = window.escaparHTML(texto);

    // 1. Detección exacta para YouTube Shorts
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

    // 2. Detección para YouTube Normal (watch?v= o youtu.be/)
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

    // 3. Enlaces normales convertidos en texto seguro clickeable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    htmlModificado = htmlModificado.replace(urlRegex, (url) => {
        const urlSegura = window.escaparHTML(url);
        return `<a href="${urlSegura}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${urlSegura}</a>`;
    });

    return `<p class="texto-mensaje">${htmlModificado}</p>`;
}

// ======================================
// COMPRESIÓN Y ENVÍO DE ARCHIVOS LOCALES (FOTOS/VIDEOS)
// ======================================

async function enviarArchivoLocal(event) {
    const file = event.target.files[0];
    if (!file) return;

    const autor = localStorage.getItem("casuals_user") || "Agente Anónimo";
    const inputChat = document.getElementById('chat-in');

    // Si es imagen, la comprimimos antes de subir para ahorrar datos y espacio
    if (file.type.startsWith('image/')) {
        comprimirImagenYEnviar(file, autor);
    } else {
        // Videos u otros archivos se suben directo con barra de progreso básica o alerta
        subirArchivoDirecto(file, autor);
    }

    // Limpiar input para permitir subir la misma imagen dos veces seguidas si es necesario
    event.target.value = '';
}

function comprimirImagenYEnviar(file, autor) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a JPEG con calidad 0.75 (equilibrio perfecto entre peso y nitidez)
            canvas.toBlob(async (blob) => {
                try {
                    const storageRef = firebase.storage().ref();
                    const fileName = `chat_media/img_${Date.now()}_${file.name}`;
                    const fileRef = storageRef.child(fileName);

                    const snapshot = await fileRef.put(blob);
                    const downloadURL = await snapshot.ref.getDownloadURL();

                    // Enviar mensaje al chat con la imagen integrada
                    firebase.database().ref('mensajes').push({
                        autor: autor,
                        texto: `<div style="margin-bottom:4px;">📸 [Imagen compartida]</div><a href="${downloadURL}" target="_blank"><img src="${downloadURL}" style="max-width:100%; max-height:250px; border-radius:8px; border:1px solid var(--neon-azul); object-fit:cover;"></a>`,
                        tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error("Error al subir imagen comprimida:", error);
                    alert("Error al enviar la imagen.");
                }
            }, 'image/jpeg', 0.75);
        };
    };
}

async function subirArchivoDirecto(file, autor) {
    try {
        const storageRef = firebase.storage().ref();
        const fileName = `chat_media/file_${Date.now()}_${file.name}`;
        const fileRef = storageRef.child(fileName);

        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();

        const esVideo = file.type.startsWith('video/');
        let contenidoHtml = esVideo ? 
            `<video controls style="max-width:100%; max-height:250px; border-radius:8px; border:1px solid var(--oro);"><source src="${downloadURL}" type="${file.type}"></video>` :
            `<a href="${downloadURL}" target="_blank" style="color:var(--neon-azul); text-decoration:underline;">📁 Archivo adjunto: ${file.name}</a>`;

        firebase.database().ref('mensajes').push({
            autor: autor,
            texto: contenidoHtml,
            tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    } catch (error) {
        console.error("Error al subir archivo:", error);
        alert("Error al subir el archivo.");
    }
}

// Asignaciones globales
window.procesarContenidoMensaje = procesarContenidoMensaje;
window.enviarArchivoLocal = enviarArchivoLocal;
