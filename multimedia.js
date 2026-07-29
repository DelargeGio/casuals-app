// ======================================
// MULTIMEDIA.JS - PROCESADOR DE SHORTS, VIDEOS Y MULTIMEDIA (LIMPIO)
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

window.procesarContenidoMensaje = procesarContenidoMensaje;
