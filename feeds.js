// ======================================
// FEEDS.JS - RED SOCIAL / ESTILO INSTAGRAM-TELEGRAM (BLINDADO)
// ======================================

function renderFeed() {
    renderFeedContainer();
}

function cargarFeed() {
    renderFeedContainer();
}

let categoriaSeleccionadaFeed = 'general';

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
            
            <!-- Cabecera -->
            <div style="padding: 8px 16px; background: rgba(15,15,15,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; z-index: 10;">
                <span style="font-weight: 800; font-size: 0.95rem; letter-spacing: 1px; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--neon-azul, #00f3ff);">⚡</span> CASUALS // FEED
                </span>
                <span style="font-size: 0.65rem; color: #777; background: #161616; padding: 3px 8px; border-radius: 20px; border: 1px solid #282828;">LIVE_FEED</span>
            </div>

            <!-- Pestañas de Secciones (Trapos, Afanes, Arte, Música, General) -->
            <div style="display: flex; gap: 6px; padding: 8px 12px; background: #0f0f0f; border-bottom: 1px solid #1f1f1f; overflow-x: auto; flex-shrink: 0; -webkit-overflow-scrolling: touch;">
                <button onclick="cambiarCategoriaFeed('general', this)" class="feed-cat-btn active-cat" style="background: #222; border: 1px solid var(--neon-azul); color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🌐 Todo</button>
                <button onclick="cambiarCategoriaFeed('trapos', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🏴‍☠️ Trapos & Banderas</button>
                <button onclick="cambiarCategoriaFeed('afanes', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🔥 Afanes</button>
                <button onclick="cambiarCategoriaFeed('arte_musica', this)" class="feed-cat-btn" style="background: #141414; border: 1px solid #333; color: #aaa; padding: 4px 10px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; white-space: nowrap;">🎨 Arte & Música</button>
            </div>

            <!-- Creador de publicaciones -->
            <div style="padding: 10px 16px; background: #121212; border-bottom: 1px solid #1f1f1f; flex-shrink: 0;">
                <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div id="feed-user-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-azul, #00f3ff), var(--oro, #ffd700)); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #000; font-size: 0.85rem; flex-shrink: 0;">U</div>
                    <div style="flex: 1;">
                        <textarea id="feed-input-texto" placeholder="Sube una foto, evento, trapo o publicación..." rows="2" style="width: 100%; background: #181818; color: #fff; border: 1px solid #2a2a2a; padding: 8px 12px; border-radius: 10px; font-family: inherit; resize: none; outline: none; font-size: 0.85rem; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--neon-azul)'" onblur="this.style.borderColor='#2a2a2a'"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-left: 46px;">
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <label style="cursor: pointer; background: #1a1a1a; border: 1px solid #333; padding: 5px 10px; border-radius: 20px; font-size: 0.72rem; color: var(--neon-azul); display: flex; align-items: center; gap: 5px;">
                            📸 <span>Multimedia</span> <input type="file" id="feed-file-input" accept="image/*,video/*" style="display:none;" onchange="prepararImagenFeed(event)">
                        </label>
                        <span id="feed-file-status" style="font-size: 0.72rem; color: var(--oro); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                    </div>
                    
                    <button onclick="publicarEnFeed()" style="background: #fff; color: #000; border: none; font-weight: 700; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 0.78rem; letter-spacing: 0.5px;">
                        Publicar
                    </button>
                </div>

                <div id="feed-preview-container" style="margin-top: 8px; margin-left: 46px; display: none; position: relative; max-width: 130px;">
                    <img id="feed-img-preview" src="" style="width: 100%; max-height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #333;">
                    <button onclick="limpiarImagenFeed()" style="background: rgba(0,0,0,0.8); color: #ff5555; border: 1px solid #ff5555; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; position: absolute; top: -5px; right: -5px; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>
            </div>

            <!-- Lista de Feed con Scroll Propio -->
            <div id="feed-posts-lista" style="flex: 1; min-height: 0; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; -webkit-overflow-scrolling: touch;">
                <div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">Sincronizando muro...</div>
            </div>

        </div>
    `;

    const userActual = localStorage.getItem('casuals_user') || 'U';
    const avatarEl = document.getElementById('feed-user-avatar');
    if (avatarEl) {
        avatarEl.innerText = userActual.charAt(0).toUpperCase();
    }

    escucharPublicacionesFeed();
}

function cambiarCategoriaFeed(categoria, btnElement) {
    categoriaSeleccionadaFeed = categoria;
    
    // Actualizar estilos de los botones de categoría
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

let imagenFeedUrlTemporal = "";

async function prepararImagenFeed(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusLabel = document.getElementById('feed-file-status');
    const previewContainer = document.getElementById('feed-preview-container');
    const previewImg = document.getElementById('feed-img-preview');

    statusLabel.innerText = "Subiendo...";

    try {
        const storageRef = firebase.storage().ref();
        const fileName = `feed_media/${Date.now()}_${file.name}`;
        const fileRef = storageRef.child(fileName);

        const snapshot = await fileRef.put(file);
        imagenFeedUrlTemporal = await snapshot.ref.getDownloadURL();

        previewImg.src = imagenFeedUrlTemporal;
        previewContainer.style.display = 'block';
        statusLabel.innerText = "¡Listo!";
    } catch (error) {
        console.error("Error al subir archivo al feed:", error);
        alert("Error al subir el archivo.");
        statusLabel.innerText = "Error";
    }
}

function limpiarImagenFeed() {
    imagenFeedUrlTemporal = "";
    document.getElementById('feed-file-input').value = "";
    document.getElementById('feed-preview-container').style.display = 'none';
    document.getElementById('feed-file-status').innerText = "";
}

function publicarEnFeed() {
    const textoInput = document.getElementById('feed-input-texto');
    const texto = textoInput.value.trim();

    if (!texto && !imagenFeedUrlTemporal) {
        alert("Escribe algo o adjunta una imagen/video.");
        return;
    }

    const autor = localStorage.getItem('casuals_user') || 'Agente Anónimo';

    const nuevoPost = {
        autor: autor,
        texto: texto,
        imagen: imagenFeedUrlTemporal || "",
        categoria: categoriaSeleccionadaFeed,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    const dbRef = window.db.ref('feed_posts').push();
    dbRef.set(nuevoPost).then(() => {
        textoInput.value = "";
        limpiarImagenFeed();
        console.log("Post publicado en categoría:", categoriaSeleccionadaFeed);
    }).catch((err) => {
        console.error("Error al publicar:", err);
        alert("No se pudo enviar la publicación.");
    });
}

function escucharPublicacionesFeed() {
    const listaDiv = window.DOM.feedPostsLista;
    if (!listaDiv) return;

    const dbRef = window.db.ref('feed_posts').orderByChild('timestamp').limitToLast(40);

    dbRef.on('value', (snapshot) => {
        listaDiv.innerHTML = "";
        
        if (!snapshot.exists()) {
            listaDiv.innerHTML = `
                <div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">
                    <div style="font-size: 1.8rem; margin-bottom: 6px;">📭</div>
                    No hay publicaciones en esta sección.<br>¡Sé el primero en reportar!
                </div>`;
            return;
        }

        let posts = [];
        snapshot.forEach((childSnapshot) => {
            let p = { id: childSnapshot.key, ...childSnapshot.val() };
            // Filtrar por categoría si no es general
            if (categoriaSeleccionadaFeed === 'general' || p.categoria === categoriaSeleccionadaFeed || (!p.categoria && categoriaSeleccionadaFeed === 'general')) {
                posts.push(p);
            }
        });

        posts.reverse();

        if (posts.length === 0) {
            listaDiv.innerHTML = `
                <div style="text-align: center; color: #555; margin-top: 40px; font-size: 0.82rem;">
                    <div style="font-size: 1.8rem; margin-bottom: 6px;">📁</div>
                    No hay contenido en esta sección todavía.
                </div>`;
            return;
        }

        posts.forEach((post) => {
            const fecha = post.timestamp ? formatearTiempoRelativo(post.timestamp) : 'Hace un momento';
            const inicialAutor = post.autor ? post.autor.charAt(0).toUpperCase() : 'A';
            const badgeCat = post.categoria && post.categoria !== 'general' ? `<span style="font-size: 0.60rem; background: #1a1a1a; color: var(--oro); padding: 2px 6px; border-radius: 6px; border: 1px solid #333;">#${post.categoria}</span>` : '';
            
            let multimediaHtml = post.imagen ? `
                <div style="margin-top: 8px; border-radius: 10px; overflow: hidden; background: #000; border: 1px solid #222;">
                    <img src="${post.imagen}" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" loading="lazy">
                </div>
            ` : '';

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

                ${post.texto ? `
                    <div style="font-size: 0.85rem; color: #e0e0e0; word-break: break-word; line-height: 1.4; margin-bottom: 4px;">
                        ${ window.escaparHTML(post.texto).replace(/\n/g, '<br>') }
                    </div>
                ` : ''}

                ${multimediaHtml}

                <div style="display: flex; align-items: center; gap: 14px; margin-top: 10px; padding-top: 6px; border-top: 1px solid #1e1e1e; font-size: 0.72rem; color: #777;">
                    <button onclick="this.style.color = this.style.color === 'rgb(255, 51, 102)' ? '#777' : '#ff3366'; let c = this.querySelector('.like-count'); c.innerText = parseInt(c.innerText) + (this.style.color === 'rgb(255, 51, 102)' ? 1 : -1);" style="background: none; border: none; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 4px; font-family: inherit; font-size: 0.75rem; padding: 0;">
                        🔥 <span class="like-count">0</span>
                    </button>
                    <span style="display: flex; align-items: center; gap: 4px;">💬 Comentar</span>
                </div>
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

// Asignaciones globales requeridas
window.renderFeed = renderFeed;
window.renderFeedContainer = renderFeedContainer;
window.cargarFeed = cargarFeed;
