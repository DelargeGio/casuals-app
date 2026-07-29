// ==========================================================
// FEEDS.JS - CASUALS v2.0 (INTEGRACIÓN TOTAL)
// ==========================================================

const REACCIONES_CONFIG = [
    { tipo: 'cheers', emoji: '🍻', color: '#d4af37' },
    { tipo: 'soccer', emoji: '⚽️', color: '#ffffff' },
    { tipo: 'fuego', emoji: '🔥', color: '#ff4500' },
    { tipo: 'patrulla', emoji: '🚓', color: '#1e90ff' },
    { tipo: 'cool', emoji: '😎', color: '#ffcc00' }
];

window.renderFeed = () => {
    const contenedor = document.getElementById('feed-container') || document.getElementById('view-content');
    if (!contenedor) return;
    
    const mensajesContainer = document.getElementById('mensajes-container');
    if (mensajesContainer) mensajesContainer.style.display = 'none';

    contenedor.style.display = 'flex';
    contenedor.style.flexDirection = 'column';
    contenedor.style.height = '100%';

    contenedor.innerHTML = `
        <div style="padding: 10px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; background: #000;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 2px solid var(--oro); padding-bottom: 6px;">
                <h2 style="color: var(--oro); margin: 0; font-family: 'Special Elite', cursive; font-size: 1rem; text-shadow: 0 0 5px rgba(212,175,55,0.4);">📰 FEED DE LA BANDA</h2>
                <label style="background: var(--oro); color: #000; padding: 5px 10px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 0.75rem; box-shadow: 0 0 8px rgba(212,175,55,0.5);">
                    ➕ SUBIR FOTO / VIDEO
                    <input type="file" accept="image/*,video/*" style="display: none;" onchange="subirArchivoFeed(event)">
                </label>
            </div>
            <div id="feed-galeria" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; padding-bottom: 20px; align-items: center;">
                <div style="text-align: center; margin-top: 40px; color: var(--oro);">
                    <p>Cargando publicaciones...</p>
                </div>
            </div>
        </div>
    `;

    cargarFeedFirebase();
};

function cargarFeedFirebase() {
    const galeria = document.getElementById('feed-galeria');
    if (!galeria) return;

    db.ref('feed').on('value', (snapshot) => {
        galeria.innerHTML = '';
        const data = snapshot.val();

        let postsArray = [];
        if (data) {
            postsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }

        // Ordenar por fecha: publicaciones nuevas arriba (timestamp mayor primero)
        postsArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        postsArray.forEach((post) => {
            if (!post) return;

            const card = document.createElement('div');
            card.className = 'tarjeta-feed';
            card.style.cssText = `
                background: #111;
                border: 1px solid var(--oro);
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
                box-sizing: border-box;
                width: 100%;
                max-width: 420px;
            `;

            let mediaUrl = post.imagen || post.imagenUrl || post.url || post.img || post.image;
            let mediaHtml = '';
            if (mediaUrl) {
                if (mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) || mediaUrl.startsWith('data:video')) {
                    mediaHtml = `<video controls style="width: 100%; max-height: 350px; border-radius: 4px; background: #000; margin-top: 8px;"><source src="${mediaUrl}"></video>`;
                } else {
                    mediaHtml = `<img src="${mediaUrl}" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 4px; margin-top: 8px;" alt="Post" loading="lazy">`;
                }
            }

            const autor = post.autor || 'Casual';
            const iconoUser = post.icono || (typeof obtenerIconoUsuario === 'function' ? obtenerIconoUsuario(autor) : '💀');
            const texto = post.texto || '';
            
            let fechaLegible = 'Hace un momento';
            if (post.timestamp) {
                const d = new Date(post.timestamp);
                fechaLegible = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Generar botones de reacciones con los emojis oficiales
            let reaccionesHtml = '<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; width: 100%;">';
            REACCIONES_CONFIG.forEach(r => {
                const total = (post.reacciones && post.reacciones[r.tipo]) ? post.reacciones[r.tipo] : 0;
                reaccionesHtml += `
                    <button onclick="darReaccion('${post.id}', '${r.tipo}')" style="background: rgba(0,0,0,0.6); border: 1px solid ${r.color}; color: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-family: 'Special Elite', cursive; display: flex; align-items: center; gap: 4px; font-size: 0.75rem;">
                        ${r.emoji} <span id="rec-${post.id}-${r.tipo}">${total}</span>
                    </button>
                `;
            });
            reaccionesHtml += '</div>';

            // Generar lista de comentarios
            let comentariosHtml = '<div style="margin-top: 12px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;">';
            comentariosHtml += '<div style="font-size: 0.8rem; color: #aaa; margin-bottom: 4px;">Comentarios</div>';
            comentariosHtml += '<div style="max-height: 120px; overflow-y: auto; margin-bottom: 8px; padding-right: 2px; display: flex; flex-direction: column; gap: 4px;">';

            if (post.comentarios) {
                Object.values(post.comentarios).forEach(c => {
                    comentariosHtml += `
                        <div style="background: #1a1a1a; border-left: 2px solid var(--oro); padding: 5px 8px; border-radius: 4px; font-size: 0.8rem;">
                            <strong style="color: var(--oro);">${c.autor}:</strong> <span style="color: #ddd; word-break: break-word;">${c.texto}</span>
                        </div>
                    `;
                });
            } else {
                comentariosHtml += '<div style="color: #666; font-size: 0.75rem; font-style: italic;">Sin comentarios todavía.</div>';
            }

            comentariosHtml += `</div>
                <div style="display: flex; gap: 6px;">
                    <input type="text" id="input-comentario-${post.id}" placeholder="Escribe un comentario..." style="flex: 1; background: #000; border: 1px solid #333; color: #fff; padding: 6px; border-radius: 4px; font-size: 0.8rem; outline: none;" onkeydown="if(event.key === 'Enter') enviarComentario('${post.id}')">
                    <button onclick="enviarComentario('${post.id}')" style="background: var(--oro); color: #000; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">➤</button>
                </div>
            </div>`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem; background: #222; padding: 4px; border-radius: 50%;">${iconoUser}</span>
                        <span style="color: var(--oro); font-weight: bold; font-size: 0.9rem; text-shadow: 0 0 4px rgba(212,175,55,0.4);">${autor}</span>
                    </div>
                    <span style="color: #888; font-size: 0.7rem;">${fechaLegible}</span>
                </div>
                ${mediaHtml}
                ${texto ? `<p style="color: #fff; font-size: 0.9rem; margin-top: 10px; word-break: break-word; line-height: 1.4;">${texto}</p>` : ''}
                ${reaccionesHtml}
                ${comentariosHtml}
            `;
            galeria.appendChild(card);
        });
    });
}

window.subirArchivoFeed = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const usuarioActual = localStorage.getItem("casuals_user") || "Casual";
        const iconoActual = typeof obtenerIconoUsuario === 'function' ? obtenerIconoUsuario(usuarioActual) : '💀';
        const textoDesc = prompt("Escribe una descripción para la publicación (opcional):") || "";
        const timestampActual = Date.now();

        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_W = 800;
                let w = img.width;
                let h = img.height;
                if (w > MAX_W) {
                    h = h * (MAX_W / w);
                    w = MAX_W;
                }
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                db.ref('feed').push({
                    autor: usuarioActual,
                    icono: iconoActual,
                    imagen: canvas.toDataURL('image/jpeg', 0.75),
                    texto: textoDesc,
                    timestamp: timestampActual
                });
            };
            img.src = e.target.result;
        } else {
            db.ref('feed').push({
                autor: usuarioActual,
                icono: iconoActual,
                imagen: e.target.result,
                texto: textoDesc,
                timestamp: timestampActual
            });
        }
    };
    reader.readAsDataURL(file);
};

window.darReaccion = (postId, tipo) => {
    if (!postId || !tipo) return;
    const ref = db.ref(`feed/${postId}/reacciones/${tipo}`);
    ref.transaction((current) => (current || 0) + 1);
};

window.enviarComentario = (postId) => {
    const input = document.getElementById(`input-comentario-${postId}`);
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    const usuario = localStorage.getItem("casuals_user") || "Anónimo";

    db.ref(`feed/${postId}/comentarios`).push({
        autor: usuario,
        texto: texto,
        timestamp: Date.now()
    }).then(() => {
        input.value = '';
    });
};
