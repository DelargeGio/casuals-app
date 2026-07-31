// ======================================
// FEEDS.JS - CORREGIDO SIN DEPENDER DE INDEXON DE FIREBASE
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
                        <textarea id="feed-input-texto" placeholder="Sube tus fotos, evento o reporte..." rows="2" style="width: 100%; background: #181818; color: #fff; border: 1px solid #2a2a2a; padding: 8px 12px; border-radius: 10px; font-family: inherit; resize: none; outline: none; font-size: 0.85rem;"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-left: 46px;">
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <label style="cursor: pointer; background: #1a1a1a; border: 1px solid #333; padding: 5px 10px; border-radius: 20px; font-size: 0.72rem; color: var(--neon-azul); display: flex; align-items: center; gap: 5px;">
                            📸 <span>Fotos</span> <input type="file" id="feed-file-input" accept="image/*" multiple style="display:none;" onchange="prepararImagenesFeed(event)">
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

async function prepararImagenesFeed(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const statusLabel = document.getElementById('feed-file-status');
    const previewContainer = document.getElementById('feed-preview-container');

    statusLabel.innerText = "Subiendo...";
    previewContainer.style.display = 'flex';

    try {
        const storageRef = firebase.storage().ref();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `feed_media/${Date.now()}_${i}_${file.name}`;
            const fileRef = storageRef.child(fileName);
            const snapshot = await fileRef.put(file);
            const downloadUrl = await snapshot.ref.getDownloadURL();
            
            imagenesFeedArrayTemporal.push(downloadUrl);

            const thumbDiv = document.createElement('div');
            thumbDiv.style.cssText = "position: relative; flex-shrink: 0; width: 60px; height: 60px;";
            thumbDiv.innerHTML = `<img src="${downloadUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #333;">`;
            previewContainer.appendChild(thumbDiv);
        }
        statusLabel.innerText = `${imagenesFeedArrayTemporal.length} foto(s)`;
    } catch (error) {
        console.error("Error al subir:", error);
        statusLabel.innerText = "Error";
    }
}

function limpiarImagenesFeed() {
    imagenesFeedArrayTemporal = [];
    document.getElementById('feed-file-input').value = "";
    const previewContainer = document.getElementById('feed-preview-container');
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = "";
    document.getElementById('feed-file-status').innerText = "";
}

window.publicarEnFeed = async function() {
    const textoInput = document.getElementById('feed-input-texto');
    const texto = textoInput ? textoInput.value.trim() : '';

    if (!texto && imagenesFeedArrayTemporal.length === 0) {
        alert("Escribe algo o adjunta una foto.");
        return;
    }

    const autor = localStorage.getItem('casuals_user') || 'Agente Anónimo';
    const nuevoPost = {
        autor: autor,
        texto: texto,
        fotos: imagenesFeedArrayTemporal,
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
        alert("No se pudo enviar.");
    }
};

function generarHTMLCarrusel(fotos) {
    if (!fotos || fotos.length === 0) return '';
    if (fotos.length === 1) {
        return `<div class="feed-carrusel-container"><div class="feed-carrusel-item"><img src="${window.escaparHTML(fotos[0])}" loading="lazy"></div></div>`;
    }

    let itemsHTML = '';
    let dotsHTML = '';
    fotos.forEach((foto, index) => {
        const activeClass = index === 0 ? 'active' : '';
        itemsHTML += `<div class="feed-carrusel-item"><img src="${window.escaparHTML(foto)}" loading="lazy"></div>`;
        dotsHTML += `<span class="carrusel-dot ${activeClass}" data-index="${index}"></span>`;
    });

    return `
        <div class="feed-carrusel-container">
            <div class="feed-carrusel-track" onscroll="actualizarPuntosCarrusel(this)">
                ${itemsHTML}
            </div>
            <div class="carrusel-dots">
                ${dotsHTML}
            </div>
        </div>
    `;
}

window.actualizarPuntosCarrusel = function(track) {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    const container = track.closest('.feed-carrusel-container');
    if (!container) return;
    container.querySelectorAll('.carrusel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
};

function escucharPublicacionesFeed() {
    const listaDiv = window.DOM.feedPostsLista;
    if (!listaDiv) return;

    // Consulta limpia sin orderByChild para evitar el bloqueo por falta de índice
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

        // Ordenar en JS del más nuevo al más viejo usando timestamp
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
