// ==========================================
// FEEDS.JS - MOTOR TURBO INDUSTRIAL (v3.4 - ICONO LIMPIO)
// ==========================================

const ADMINS_AUTORIZADOS = ["Calavera ☠️", "Calavera"];
let categoriaSeleccionadaFeed = 'jornada';
let feedEstructuraCreada = false;
let imagenesFeedTemporal = [];

window.renderFeed = function() {
    inicializarFeedEstructuraUnica();
};

window.cargarFeed = function() {
    inicializarFeedEstructuraUnica();
};

function inicializarFeedEstructuraUnica() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;

    if (!feedEstructuraCreada) {
        feedContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #050706;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
        `;

        feedContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; color: #fff; font-family: 'Special Elite', monospace, sans-serif; box-sizing: border-box; overflow: hidden;">
                
                <div style="padding: 10px 14px; background: rgba(5, 8, 7, 0.98); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(0, 243, 255, 0.3); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; z-index: 10; box-sizing: border-box;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 900; font-size: 0.9rem; letter-spacing: 2px; color: #fff; text-shadow: 0 0 10px rgba(0,243,255,0.6);">
                            CASUALS<span style="color: #00f3ff;">.FEED</span>
                        </span>
                    </div>
                    <div style="font-size: 0.55rem; color: #00ff66; background: rgba(0,255,102,0.1); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(0,255,102,0.4); font-weight: bold; letter-spacing: 1px;">
                        [TURBO_ACTIVE]
                    </div>
                </div>

                <div style="display: flex; gap: 6px; padding: 8px 12px; background: rgba(8, 12, 10, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); overflow-x: auto; flex-shrink: 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; box-sizing: border-box;">
                    <button id="btn-cat-jornada" onclick="cambiarCategoriaFeed('jornada')" style="touch-action: manipulation; padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: monospace;">⚽ 4ta Jornada</button>
                    <button id="btn-cat-banderas" onclick="cambiarCategoriaFeed('banderas')" style="touch-action: manipulation; padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: monospace;">🏴‍☠️ Trapos</button>
                    <button id="btn-cat-viajes" onclick="cambiarCategoriaFeed('viajes')" style="touch-action: manipulation; padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: monospace;">🚌 Away Days</button>
                    <button id="btn-cat-ropero" onclick="cambiarCategoriaFeed('ropero')" style="touch-action: manipulation; padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: monospace;">🧥 Ropero</button>
                    <button id="btn-cat-afanes" onclick="cambiarCategoriaFeed('afanes')" style="touch-action: manipulation; padding: 5px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: monospace;">🔥 Tribuna</button>
                </div>

                <div id="feed-composer-wrapper" style="padding: 8px 12px; background: rgba(10, 15, 12, 0.98); border-bottom: 2px solid rgba(0, 243, 255, 0.25); flex-shrink: 0; box-sizing: border-box;">
                    <textarea id="feed-input-texto" placeholder="// Transmitir reporte o flayer..." rows="2" style="width: 100%; background: #030504; color: #00f3ff; border: 1px solid rgba(0,243,255,0.3); padding: 6px; border-radius: 4px; font-family: monospace; resize: none; outline: none; font-size: 0.75rem; box-sizing: border-box;"></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; gap: 6px;">
                        <label style="cursor:pointer; background: rgba(0,243,255,0.08); border: 1px solid rgba(0,243,255,0.3); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; color: #00f3ff; display: flex; align-items: center; gap: 4px; font-family: monospace;">
                            📸 Foto <input type="file" id="feed-input-fotos" accept="image/*" style="display:none;">
                        </label>
                        <span id="feed-status-fotos" style="font-size: 0.6rem; color: #888; flex: 1; text-align: center; font-family: monospace;"></span>
                        <button id="feed-btn-publicar" style="background: #00f3ff; color: #000; border: none; font-weight: bold; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-family: monospace;">TRANSMITIR</button>
                    </div>
                    <div id="feed-preview-imagenes" style="display:none; gap: 6px; margin-top: 5px;"></div>
                </div>

                <div id="feed-posts-lista" style="flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 12px; padding-bottom: 40px; box-sizing: border-box; width: 100%;">
                    <div style="text-align: center; color: #00f3ff; margin-top: 30px; font-size: 0.75rem; font-family: monospace;">[SINCRONIZANDO...]</div>
                </div>
            </div>
        `;
        feedEstructuraCreada = true;

        const inputFotos = document.getElementById('feed-input-fotos');
        if (inputFotos) inputFotos.addEventListener('change', prepararImagenesFeed);

        const btnPublicar = document.getElementById('feed-btn-publicar');
        if (btnPublicar) btnPublicar.addEventListener('click', window.publicarEnFeed);
    }

    actualizarPermisosYEstilos(categoriaSeleccionadaFeed);
    cargarPostsFirebase(categoriaSeleccionadaFeed);
}

window.cambiarCategoriaFeed = function(cat) {
    categoriaSeleccionadaFeed = cat;
    actualizarPermisosYEstilos(cat);
    cargarPostsFirebase(cat);
};

function actualizarPermisosYEstilos(catActiva) {
    const usuarioActual = localStorage.getItem('usuario_nombre') || '';
    const esAdmin = ADMINS_AUTORIZADOS.some(a => usuarioActual.includes("Calavera") || usuarioActual === a);
    const composer = document.getElementById('feed-composer-wrapper');

    if (composer) {
        if (catActiva === 'jornada' && !esAdmin) {
            composer.style.display = 'none';
        } else {
            composer.style.display = 'block';
        }
    }

    ['jornada', 'banderas', 'viajes', 'ropero', 'afanes'].forEach(c => {
        const btn = document.getElementById(`btn-cat-${c}`);
        if (!btn) return;
        if (c === catActiva) {
            btn.style.background = '#00f3ff';
            btn.style.border = '1px solid #00f3ff';
            btn.style.color = '#000';
            btn.style.boxShadow = '0 0 8px rgba(0,243,255,0.5)';
        } else {
            btn.style.background = 'rgba(255,255,255,0.03)';
            btn.style.border = '1px solid rgba(255,255,255,0.15)';
            btn.style.color = '#888';
            btn.style.boxShadow = 'none';
        }
    });
}

function prepararImagenesFeed(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const status = document.getElementById('feed-status-fotos');
    const preview = document.getElementById('feed-preview-imagenes');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 800;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
            else { if (h > MAX) { w *= MAX / h; h = MAX; } }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            
            imagenesFeedTemporal = [canvas.toDataURL('image/jpeg', 0.75)];
            if (preview) {
                preview.innerHTML = `<img src="${imagenesFeedTemporal[0]}" style="width:45px; height:45px; object-fit:cover; border-radius:4px; border:1px solid #00f3ff;">`;
                preview.style.display = 'flex';
            }
            if (status) status.textContent = '[Flayer listo]';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.publicarEnFeed = function() {
    const textarea = document.getElementById('feed-input-texto');
    const texto = textarea ? textarea.value.trim() : '';

    if (!texto && imagenesFeedTemporal.length === 0) return;
    if (typeof firebase === 'undefined') return;

    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const nuevoPost = {
        autor: autor,
        descripcion: texto,
        imagen: imagenesFeedTemporal[0] || '',
        tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    const btn = document.getElementById('feed-btn-publicar');
    if (btn) btn.disabled = true;

    firebase.database().ref('feed_' + categoriaSeleccionadaFeed).push(nuevoPost)
        .then(() => {
            imagenesFeedTemporal = [];
            if (textarea) textarea.value = '';
            const prev = document.getElementById('feed-preview-imagenes');
            if (prev) { prev.innerHTML = ''; prev.style.display = 'none'; }
            const stat = document.getElementById('feed-status-fotos');
            if (stat) stat.textContent = '';
        })
        .catch(err => console.error(err))
        .finally(() => { if (btn) btn.disabled = false; });
};

function cargarPostsFirebase(categoria) {
    const listaPosts = document.getElementById('feed-posts-lista');
    if (!listaPosts) return;
    if (typeof firebase === 'undefined') return;

    const usuarioActual = localStorage.getItem('usuario_nombre') || '';
    const ref = firebase.database().ref('feed_' + categoria).limitToLast(15);
    
    ref.off();
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            listaPosts.innerHTML = `<div style="text-align: center; color: #666; margin-top: 30px; font-size: 0.75rem; font-family: monospace;">[!] SIN NOVEDADES EN ESTA SECCIÓN</div>`;
            return;
        }

        const escapar = window.escaparHTML || (s => s);

        const htmlPosts = Object.keys(data).reverse().map(key => {
            const post = data[key];
            const autor = escapar(post.autor || 'Calavera ☠️');
            const desc = escapar(post.descripcion || '');
            const tiempo = escapar(post.tiempo || '');
            const img = post.imagen ? `<div style="width:100%; background:#000; max-height:350px; overflow:hidden;"><img src="${post.imagen}" onclick="window.abrirVisorImagen('${post.imagen}')" style="width:100%; height:auto; object-fit:cover; display:block; cursor:zoom-in;"></div>` : '';

            const esAutor = (post.autor === usuarioActual);
            const esAdmin = ADMINS_AUTORIZADOS.some(a => usuarioActual.includes("Calavera") || usuarioActual === a);
            let botonBorrarHTML = '';
            
            if (esAutor || esAdmin) {
                botonBorrarHTML = `
                    <button onclick="window.confirmarEliminacionPost('${categoria}', '${key}')" style="background:transparent; border:none; cursor:pointer; font-size:0.9rem; padding:0; opacity:0.7; outline:none;" title="Eliminar transmisión">
                        🗑️
                    </button>
                `;
            }

            return `
                <div id="post-card-${key}" style="width:100%; max-width:440px; background:#080c09; border:1px solid rgba(0,243,255,0.25); border-radius:6px; overflow:hidden; font-family:monospace; box-sizing:border-box;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:rgba(0,0,0,0.8); border-bottom:1px solid rgba(255,255,255,0.06);">
                        <span style="font-size:0.75rem; font-weight:bold; color:#00ff66;">☠️ ${autor}</span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.6rem; color:#777;">${tiempo}</span>
                            ${botonBorrarHTML}
                        </div>
                    </div>
                    ${img}
                    ${desc ? `<div style="padding:8px 10px; font-size:0.75rem; color:#e0e0e0; line-height:1.35; word-break:break-word;">${desc}</div>` : ''}
                </div>
            `;
        }).join('');

        listaPosts.innerHTML = htmlPosts;
    });
}

window.confirmarEliminacionPost = function(categoria, postId) {
    const seguro = confirm("[ATENCIÓN] ¿Eliminar esta transmisión del feed?");
    if (!seguro) return;

    firebase.database().ref('feed_' + categoria).child(postId).remove()
        .then(() => {
            const card = document.getElementById(`post-card-${postId}`);
            if (card) card.remove();
        })
        .catch(err => {
            console.error("Error al eliminar post:", err);
            alert("No se pudo eliminar la transmisión.");
        });
};

window.abrirVisorImagen = function(url) {
    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:9999; display:flex; align-items:center; justify-content:center; cursor:zoom-out;";
    modal.innerHTML = `<img src="${url}" style="max-width:95%; max-height:95%; object-fit:contain; border:1px solid #00f3ff;">`;
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
};
