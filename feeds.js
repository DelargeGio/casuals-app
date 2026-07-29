// ======================================
// FEEDS.JS - MURO INDUSTRIAL PUNK / COMUNICADOS
// ======================================

function renderFeed() {
    renderFeedContainer();
}

function cargarFeed() {
    renderFeedContainer();
}

function renderFeedContainer() {
    const feedContainer = document.getElementById('feed-container');
    const mensajesContainer = document.getElementById('mensajes-container');
    
    if (!feedContainer) {
        console.error("❌ Error crítico: No se encontró el elemento #feed-container en el HTML.");
        return;
    }

    // Asegurar visibilidad correcta de las vistas
    feedContainer.style.display = 'flex';
    if (mensajesContainer) {
        mensajesContainer.style.display = 'none';
    }

    // Estructura moderna con toque industrial punk
    feedContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; width: 100%; background: #050505; color: #fff; font-family: monospace; overflow: hidden;">
            
            <!-- Cabecera del Feed -->
            <div style="padding: 12px 16px; background: #0a0a0a; border-bottom: 2px solid var(--neon-azul, #00f3ff); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                <span style="font-weight: bold; font-size: 0.9rem; letter-spacing: 2px; color: var(--oro, #ffd700);">⚡ TABLÓN // FEED OFICIAL</span>
                <span style="font-size: 0.7rem; color: #666;">SECURE_FEED_v2</span>
            </div>

            <!-- Formulario para crear publicación (Creador Táctico) -->
            <div style="padding: 12px; background: #0f0f0f; border-bottom: 1px solid #222; flex-shrink: 0;">
                <textarea id="feed-input-texto" placeholder="Escribe un comunicado o reporte..." rows="2" style="width: 100%; background: #000; color: #fff; border: 1px solid #333; padding: 10px; border-radius: 4px; font-family: monospace; resize: none; outline: none; font-size: 0.85rem;" onfocus="this.style.borderColor='var(--neon-azul)'" onblur="this.style.borderColor='#333'"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <!-- Input oculto para subir imagen al feed -->
                    <label style="cursor: pointer; background: #1a1a1a; border: 1px solid #444; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; color: var(--neon-azul);">
                        📷 Adjuntar Imagen <input type="file" id="feed-file-input" accept="image/*" style="display:none;" onchange="prepararImagenFeed(event)">
                    </label>
                    <span id="feed-file-status" style="font-size: 0.7rem; color: var(--oro); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                    
                    <button onclick="publicarEnFeed()" style="background: var(--neon-azul, #00f3ff); color: #000; border: none; font-weight: bold; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-family: monospace; font-size: 0.8rem; letter-spacing: 1px;">
                        PUBLICAR 🚀
                    </button>
                </div>
                <div id="feed-preview-container" style="margin-top: 8px; display: none; position: relative;">
                    <img id="feed-img-preview" src="" style="max-height: 80px; border-radius: 4px; border: 1px solid var(--oro);">
                    <button onclick="limpiarImagenFeed()" style="background: var(--fuego, #ff3333); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; position: absolute; top: -5px; left: 100px;">✕</button>
                </div>
            </div>

            <!-- Lista de Publicaciones en tiempo real -->
            <div id="feed-posts-lista" style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; -webkit-overflow-scrolling: touch;">
                <div style="text-align: center; color: #555; margin-top: 20px; font-size: 0.8rem;">Cargando transmisiones...</div>
            </div>

        </div>
    `;

    escucharPublicacionesFeed();
}

let imagenFeedUrlTemporal = "";

async function prepararImagenFeed(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusLabel = document.getElementById('feed-file-status');
    const previewContainer = document.getElementById('feed-preview-container');
    const previewImg = document.getElementById('feed-img-preview');

    statusLabel.innerText = "Subiendo imagen...";

    try {
        const storageRef = firebase.storage().ref();
        const fileName = `feed_media/${Date.now()}_${file.name}`;
        const fileRef = storageRef.child(fileName);

        const snapshot = await fileRef.put(file);
        imagenFeedUrlTemporal = await snapshot.ref.getDownloadURL();

        previewImg.src = imagenFeedUrlTemporal;
        previewContainer.style.display = 'block';
        statusLabel.innerText = "¡Imagen lista!";
    } catch (error) {
        console.error("Error al subir imagen al feed:", error);
        alert("Error al subir la imagen.");
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
        alert("Escribe un texto o adjunta una imagen para publicar.");
        return;
    }

    const autor = localStorage.getItem('casuals_user') || 'Agente Anónimo';

    const nuevoPost = {
        autor: autor,
        texto: texto,
        imagen: imagenFeedUrlTemporal || "",
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    const dbRef = window.db.ref('feed_posts').push();
    dbRef.set(nuevoPost).then(() => {
        textoInput.value = "";
        limpiarImagenFeed();
        console.log("Publicación enviada con éxito.");
    }).catch((err) => {
        console.error("Error al publicar:", err);
        alert("No se pudo enviar la publicación.");
    });
}

function escucharPublicacionesFeed() {
    const listaDiv = document.getElementById('feed-posts-lista');
    if (!listaDiv) return;

    const dbRef = window.db.ref('feed_posts').orderByChild('timestamp').limitToLast(30);

    dbRef.on('value', (snapshot) => {
        listaDiv.innerHTML = "";
        
        if (!snapshot.exists()) {
            listaDiv.innerHTML = `<div style="text-align: center; color: #444; margin-top: 30px; font-size: 0.8rem;">No hay comunicados en el feed todavía. ¡Sé el primero!</div>`;
            return;
        }

        let posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        posts.reverse();

        posts.forEach((post) => {
            const fecha = post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Hace un momento';
            
            let imagenHtml = post.imagen ? `
                <div style="margin-top: 8px;">
                    <img src="${post.imagen}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; border: 1px solid #333;" loading="lazy">
                </div>
            ` : '';

            let card = document.createElement('div');
            card.style.cssText = "background: #0a0a0a; border: 1px solid #222; border-left: 3px solid var(--neon-azul, #00f3ff); padding: 12px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);";
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #1a1a1a; padding-bottom: 4px;">
                    <span style="font-weight: bold; color: var(--oro, #ffd700); font-size: 0.8rem;">[ ${ escaparHTMLFeed(post.autor) } ]</span>
                    <span style="font-size: 0.65rem; color: #555;">${fecha}</span>
                </div>
                <div style="font-size: 0.85rem; color: #ddd; word-break: break-word; line-height: 1.4; margin-bottom: 6px;">
                    ${ escaparHTMLFeed(post.texto).replace(/\n/g, '<br>') }
                </div>
                ${imagenHtml}
            `;

            listaDiv.appendChild(card);
        });
    });
}

function escaparHTMLFeed(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Exponer globalmente todas las variantes posibles
window.renderFeed = renderFeed;
window.renderFeedContainer = renderFeedContainer;
window.cargarFeed = cargarFeed;
