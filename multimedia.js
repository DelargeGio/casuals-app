// ======================================
// MULTIMEDIA.JS - PROCESADOR DE SHORTS Y VIDEOS
// ======================================

function procesarContenidoMensaje(texto) {
    if (!texto) return '';

    let htmlModificado = texto;

    // 1. Detección exacta para YouTube Shorts
    const ytShortsRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytShortsRegex.test(texto)) {
        ytShortsRegex.lastIndex = 0;
        htmlModificado = htmlModificado.replace(ytShortsRegex, (match, videoId) => {
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${match}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${match}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
        return htmlModificado;
    }

    // 2. Detección para YouTube Normal (watch?v= o youtu.be/)
    const ytNormalRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytNormalRegex.test(texto)) {
        ytNormalRegex.lastIndex = 0;
        htmlModificado = htmlModificado.replace(ytNormalRegex, (match, videoId) => {
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${match}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${match}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
        return htmlModificado;
    }

    // 3. Enlaces normales (texto plano clickeable)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    htmlModificado = htmlModificado.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${url}</a>`;
    });

    return `<p class="texto-mensaje">${htmlModificado}</p>`;
}

window.procesarContenidoMensaje = procesarContenidoMensaje;
