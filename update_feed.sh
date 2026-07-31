cat << 'INNER' > feeds.js
// ======================================
// FEEDS.JS - SELECCION Y SUBIDA DIRECTA BLINDADA
// ======================================

function renderFeed() {
    renderFeedContainer();
}

function cargarFeed() {
    renderFeedContainer();
}

let categoriaSeleccionadaFeed = 'general';
let imagenesFeedArrayTemporal = [];

function renderFeedContainer() {
    const feedContainer = window.DOM.feedContainer;
    const mensajesContainer = window.DOM.mensajesContainer;
    
    if (!feedContainer) return;

    feedContainer.style.position = 'absolute';
    feedContainer.style.top = '95px';
    feedContainer.style.bottom = '65px';
    feedContainer.style.left = '0';
    feedContainer.style.right = '0';
    feedContainer.style.display = 'flex';
    feedContainer.style.flexDirection = 'column';
    feedContainer.style.zIndex = '5';
    feedContainer.style.overflow = 'hidden';
    
    if (mensajesContainer) {
        mensajesContainer.style.display = 'none';
    }

    if (feedContainer.innerHTML.trim() !== "" && document.getElementById('feed-posts-lista')) {
        return;
    }

    feedContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background: #0b0b0b; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow: hidden;">
            
            <div style="padding: 8px 16px; background: rgba(15,15,15,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; z-index: 10;">
                <span style="font-weight: 800; font-size: 0.95rem; letter-spacing: 1px; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--neon-azul, #00f3ff);">⚡</span> CASUALS // FEED
                </span>
                <span style="font-size: 0.65rem; color: #777; background: #161616; padding: 3px 8px; border-radius: 20px; border: 1px solid #282828;">LIVE_FEED</span>
            </div>

            <div style="display: flex; gap: 6px; padding: 8px 12px; background: #0f0f0f; border-bottom: 1px solid #1f1f1f; overflow-x: auto; flex-shrink: 0; -webkit-overflow-scrolling: touch;">
                <button onclick="cambiarCategoriaFeed('general', this)" class="feed-cat-btn" style="background: #222; border: 1px solid var(--neon-azul); color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🌐 Todo</button>
                <button onclick="cambiarCategoriaFeed('trapos', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🏴‍☠️ Trapos & Banderas</button>
                <button onclick="cambiarCategoriaFeed('afanes', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🔥 Afanes</button>
                <button onclick="cambiarCategoriaFeed('arte_musica', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🎨 Arte & Música</button>
            </div>

            <div style="padding: 10px 16px; background: #121212; border-bottom: 1px solid #1f1f1f; flex-shrink: 0;">
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div id="feed-user-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-azul, #00f3ff), var(--oro, #ffd700)); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000; font-size: 0.85rem; flex-shrink: 0;">U</div>
                    <div style="flex: 1;">
                        <textarea id="feed-input-texto" placeholder="Sube tus fotos en carrusel, evento o reporte..." rows="2" style="width: 100%; background: #181818; color: #fff; border: 1px solid #2a2a2a; padding: 8px 12px; border-radius: 10px; font-family: inherit; resize: none; outline: none; font-size: 0.85rem;"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-left: 46px;">
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <label style="cursor: pointer; background: #1a1a1a; border: 1px solid #333; padding: 5px 10px; border-radius: 20px; font-size: 0.72rem; color: var(--neon-azul); display: flex; align-items: center; gap: 5px;">
                            📸 <span>Fotos (Carrusel)</span> <input type="file" id="feed-file-input" accept="image/*" multiple style="display:none;" onchange="prepararImagenesFeed(event)">
                        </label>
                        <span id="feed-file-status" style="font-size: 0.72rem; color: var(--oro);"></span>
                    </div>
                    
                    <button onclick="publicarEnFeed()" style="background: #fff; color: #000; border: none; font-weight: 700; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 0.78rem;">
                        Publicar
                    </button>
                </div>

                <div id="feed-preview-container" style="margin-top: 8px; margin-left: 46px; display: none; gap: 6px; overflow-x: auto; padding-bottom: 4px;"></div>
            </div>

            <div id="feed-posts-lista" style="flex: 1; min-height: 0; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; -webkit-overflow-scrolling: touch;">
                <div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">Cargando muro...</div>
            </div>

        </div>
    `;

    const userActual = localStorage.getItem('casuals_user') || 'U';
    const avatarEl = document.getElementById('feed-user-avatar');
    if (avatarEl) avatarEl.innerText = userActual.charAt(0).toUpperCase();

    escucharPublicacionesFeed();
}

function cambiarCategoriaFeed(categoria, btnElement) {
    categoriaSeleccionadaFeed = categoria;
    document.querySelectorAll('.feed-cat-btn').forEach(btn => {
        btn.style.background = '#141414';
        btn.style.borderColor = '#333';
        btn.style.color = '#aaa';
    });
    btnElement.style.background = '#222';
    btnElement.style.borderColor = 'var(--neon-azul)';
    btnElement.style.color = '#fff';

    escucharPublicacionesFeed();
}

function prepararImagenesFeed(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const previewContainer = document.getElementById('feed-preview-container');
    const statusLabel = document.getElementById('feed-file-status');
    
    previewContainer.style.display = 'flex';
    imagenesFeedArrayTemporal = [];
    previewContainer.innerHTML = "";

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenesFeedArrayTemporal.push(e.target.result);

            const thumbDiv = document.createElement('div');
            thumbDiv.style.cssText = "position: relative; flex-shrink: 0; width: 60px; height: 60px;";
            thumbDiv.innerHTML = `<img src="${e.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #333;">`;
            previewContainer.appendChild(thumbDiv);

            statusLabel.innerText = `${imagenesFeedArrayTemporal.length} foto(s)`;
        };
        reader.readAsDataURL(file);
    });
}

function limpiarImagenesFeed() {
    imagenesFeedArrayTemporal = [];
    const fileInput = document.getElementById('feed-file-input');
    if (fileInput) fileInput.value = "";
    const previewContainer = document.getElementById('feed-preview-container');
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = "";
    }
    const statusLabel = document.getElementById('feed-file-status');
    if (statusLabel) statusLabel.innerText = "";
}

window.publicarEnFeed = async function() {
    const textoInput = document.getElementById('feed-input-texto');
    const texto = textoInput ? textoInput.value.trim() : '';

    if (!texto && imagenesFeedArrayTemporal.length === 0) {
        alert("Escribe algo o adjunta al menos una foto.");
        return;
    }

    const autor = localStorage.getItem('casuals_user') || 'Agente Anónimo';
    const nuevoPost = {
        autor: autor,
        texto: texto,
        fotos: [...imagenesFeedArrayTemporal],
        categoria: categoriaSeleccionadaFeed,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    try {
        await window.db.ref('feed_posts').push().set(nuevoPost);
        if (textoInput) textoInput.value = "";
        limpiarImagenesFeed();
        console.log("¡Publicado con éxito!");
    } catch (err) {
        console.error("Error al publicar:", err);
        alert("No se pudo enviar la publicación.");
    }
};

function generarHTMLCarrusel(fotos) {
    if (!fotos || fotos.length === 0) return '';
    if (fotos.length === 1) {
        return `<div style="margin-top: 8px; border-radius: 8px; overflow: hidden; background: #000; border: 1px solid #222;"><img src="${window.escaparHTML(fotos[0])}" style="width: 100%; max-height: 350px; object-fit: cover; display: block;" loading="lazy"></div>`;
    }

    let itemsHTML = '';
    let dotsHTML = '';
    fotos.forEach((foto, index) => {
        const activeClass = index === 0 ? 'active' : '';
        itemsHTML += `<div style="min-width: 100%; height: 280px; flex-shrink: 0; scroll-snap-align: start;"><img src="${window.escaparHTML(foto)}" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy"></div>`;
        dotsHTML += `<span class="carrusel-dot ${activeClass}" style="width: 6px; height: 6px; border-radius: 50%; background: ${index === 0 ? 'var(--neon-azul, #00f3ff)' : '#555'}; transition: 0.2s;"></span>`;
    });

    return `
        <div style="margin-top: 8px; position: relative; border-radius: 8px; overflow: hidden; background: #000; border: 1px solid #222;">
            <div style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch;" onscroll="actualizarPuntosCarrusel(this)">
                ${itemsHTML}
            </div>
            <div style="position: absolute; bottom: 8px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; pointer-events: none;">
                ${dotsHTML}
            </div>
        </div>
    `;
}

window.actualizarPuntosCarrusel = function(track) {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    const container = track.closest('div[style*="position: relative"]');
    if (!container) return;
    container.querySelectorAll('span[class*="carrusel-dot"]').forEach((dot, i) => {
        dot.style.background = i === index ? 'var(--neon-azul, #00f3ff)' : '#555';
    });
};

function escucharPublicacionesFeed() {
    const listaDiv = window.DOM.feedPostsLista;
    if (!listaDiv) return;

    window.db.ref('feed_posts').on('value', (snapshot) => {
        listaDiv.innerHTML = "";
        
        if (!snapshot.exists()) {
            listaDiv.innerHTML = `<div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">📭 No hay publicaciones.</div>`;
            return;
        }

        let posts = [];
        snapshot.forEach((childSnapshot) => {
            let p = { id: childSnapshot.key, ...childSnapshot.val() };
            if (categoriaSeleccionadaFeed === 'general' || p.categoria === categoriaSeleccionadaFeed || (!p.categoria && categoriaSeleccionadaFeed === 'general')) {
                posts.push(p);
            }
        });

        posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (posts.length === 0) {
            listaDiv.innerHTML = `<div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">📁 No hay contenido en esta sección.</div>`;
            return;
        }

        posts.forEach((post) => {
            const fecha = post.timestamp ? formatearTiempoRelativo(post.timestamp) : 'Hace un momento';
            const inicialAutor = post.autor ? post.autor.charAt(0).toUpperCase() : 'A';
            const badgeCat = post.categoria && post.categoria !== 'general' ? `<span style="font-size: 0.60rem; background: #1a1a1a; color: var(--oro); padding: 2px 6px; border-radius: 6px;">#${post.categoria}</span>` : '';
            
            let listaFotos = [];
            if (post.fotos && Array.isArray(post.fotos)) listaFotos = post.fotos;
            else if (post.imagen) listaFotos = [post.imagen];

            let card = document.createElement('div');
            card.style.cssText = "background: #141414; border: 1px solid #222; border-radius: 12px; padding: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.3);";
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #222; border: 1px solid var(--neon-azul); color: var(--neon-azul); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.75rem;">
                            ${inicialAutor}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #fff; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                                ${ window.escaparHTML(post.autor) } ${badgeCat}
                            </div>
                            <div style="font-size: 0.65rem; color: #666;">${fecha}</div>
                        </div>
                    </div>
                </div>
                ${post.texto ? `<div style="font-size: 0.85rem; color: #e0e0e0; word-break: break-word; line-height: 1.4; margin-bottom: 4px;">${ window.escaparHTML(post.texto).replace(/\n/g, '<br>') }</div>` : ''}
                ${generarHTMLCarrusel(listaFotos)}
            `;
            listaDiv.appendChild(card);
        });
    });
}

function formatearTiempoRelativo(timestamp) {
    const ahora = Date.now();
    const diff = ahora - timestamp;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    return `Hace ${dias} d`;
}

window.renderFeed = renderFeed;
window.renderFeedContainer = renderFeedContainer;
window.cargarFeed = cargarFeed;
INNER
