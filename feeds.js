// ==========================================
// FEEDS.JS - MOTOR INDUSTRIAL PUNK (FILTROS FLUIDOS SIN CORTES)
// ==========================================

let categoriaActualFeed = 'todos';

function escaparHTMLSeguroFeed(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function inicializarFiltrosFeed() {
    const contenedorFiltros = document.getElementById('feed-filtros');
    if (!contenedorFiltros) return;

    const categorias = [
        { id: 'todos', nombre: '🔥 Todo' },
        { id: 'general', nombre: '📢 Noticias' },
        { id: 'trapos', nombre: '🏴‍☠️ Trapos' },
        { id: 'away-days', nombre: '🚌 Away Days' },
        { id: 'ropero', nombre: '🧥 Ropero' },
        { id: 'tribuna', nombre: '🔥 Tribuna' },
        { id: 'equipo', nombre: '⚽ Equipo' }
    ];

    let wrapper = contenedorFiltros.querySelector('.filtros-wrapper');
    
    if (!wrapper) {
        contenedorFiltros.innerHTML = `<div class="filtros-wrapper"></div>`;
        wrapper = contenedorFiltros.querySelector('.filtros-wrapper');
        
        wrapper.innerHTML = categorias.map(cat => `
            <button class="btn-filtro-feed ${cat.id === categoriaActualFeed ? 'activo' : ''}" 
                    data-categoria="${cat.id}">
                ${cat.nombre}
            </button>
        `).join('');

        wrapper.querySelectorAll('.btn-filtro-feed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nuevaCat = e.currentTarget.getAttribute('data-categoria');
                if (categoriaActualFeed === nuevaCat) return;
                categoriaActualFeed = nuevaCat;
                
                wrapper.querySelectorAll('.btn-filtro-feed').forEach(b => {
                    if (b.getAttribute('data-categoria') === categoriaActualFeed) {
                        b.classList.add('activo');
                    } else {
                        b.classList.remove('activo');
                    }
                });

                window.cargarPostsFeed();
            });
        });
    } else {
        wrapper.querySelectorAll('.btn-filtro-feed').forEach(b => {
            if (b.getAttribute('data-categoria') === categoriaActualFeed) {
                b.classList.add('activo');
            } else {
                b.classList.remove('activo');
            }
        });
    }
}

window.cargarPostsFeed = function() {
    const db = window.db || (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
    
    const listaPosts = document.getElementById('feed-posts-lista');
    if (!listaPosts) return;

    if (!document.body.classList.contains('vista-chat')) {
        document.body.classList.add('vista-feed');
    }

    listaPosts.innerHTML = '<div style="text-align:center; color:var(--oro, #ffcc00); padding:30px; font-family:monospace; font-size: 0.85rem; letter-spacing: 1px; text-shadow: 0 0 8px rgba(255,204,0,0.4);">⚡ SINCRONIZANDO SEÑAL SEGURA...</div>';

    if (!db) {
        setTimeout(window.cargarPostsFeed, 300);
        return;
    }

    try {
        db.ref('posts').off();
    } catch(e) {}

    const refPosts = db.ref('posts').limitToLast(50);
    
    refPosts.on('value', (snapshot) => {
        listaPosts.innerHTML = '';
        let postsArray = [];

        snapshot.forEach((childSnapshot) => {
            postsArray.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        postsArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const postsFiltrados = postsArray.filter(post => {
            if (categoriaActualFeed === 'todos') return true;
            return post.categoria === categoriaActualFeed;
        });

        const postsConMedia = postsArray.filter(p => p.multimedia);
        if (postsConMedia.length > 0) {
            const carruselContainer = document.createElement('div');
            carruselContainer.style.cssText = "margin: 0 12px 18px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;";
            carruselContainer.innerHTML = `
                <div style="font-size: 0.7rem; color: #777; font-family: monospace; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">📡 Transmisiones Multimedia</div>
                <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch;">
                    ${postsConMedia.slice(0, 10).map(post => `
                        <div onclick="if(typeof abrirVisorImagen==='function')abrirVisorImagen('${post.multimedia}')" style="flex: 0 0 88px; height: 88px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,204,0,0.4); background: #000; cursor: pointer; position: relative; box-shadow: 0 6px 12px rgba(0,0,0,0.7);">
                            <img src="${post.multimedia}" style="width: 100%; height: 100%; object-fit: cover;" alt="Miniatura">
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); font-size: 0.55rem; color: #fff; padding: 4px 2px; text-align: center; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${post.autor || 'Anónimo'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            listaPosts.appendChild(carruselContainer);
        }

        if (postsFiltrados.length === 0) {
            listaPosts.innerHTML += `
                <div style="text-align:center; color:#666; padding:45px 20px; font-family: monospace; font-size: 0.85rem;">
                    [!] Frecuencia limpia. Sin transmisiones en esta categoría.<br><br>
                    <button onclick="window.crearPostPrueba()" style="padding: 10px 20px; background: linear-gradient(135deg, rgba(255,204,0,0.2), rgba(0,0,0,0.8)); color: var(--oro, #ffcc00); border: 1px solid var(--oro, #ffcc00); border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem; font-family: monospace; box-shadow: 0 4px 15px rgba(255,204,0,0.2);">
                        + TRANSMITIR PRUEBA
                    </button>
                </div>`;
            return;
        }

        postsFiltrados.forEach(post => {
            listaPosts.appendChild(crearElementoPostFeed(post));
        });
    }, (error) => {
        listaPosts.innerHTML = `<div style="text-align:center; color:#ff3366; padding:20px; font-family: monospace;">ERROR DE ENLACE DB: ${error.message}</div>`;
    });
};

function crearElementoPostFeed(post) {
    const div = document.createElement('div');
    div.className = 'card-post-industrial';
    div.style.cssText = "background: linear-gradient(145deg, rgba(14,14,14,0.95), rgba(6,6,6,0.98)); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid var(--oro, #ffcc00); border-radius: 8px; padding: 14px; margin: 0 12px 14px 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05); font-family: monospace;";

    let mediaHTML = '';
    if (post.multimedia) {
        if (post.esVideo) {
            mediaHTML = `
                <div style="width: 100%; max-height: 400px; margin-top: 10px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                    <video src="${post.multimedia}" controls playsinline preload="metadata" style="width: 100%; height: auto; display: block;"></video>
                </div>
            `;
        } else {
            mediaHTML = `
                <div style="width: 100%; max-height: 420px; margin-top: 10px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                    <img src="${post.multimedia}" onclick="if(typeof abrirVisorImagen==='function')abrirVisorImagen('${post.multimedia}')" alt="Media" style="width: 100%; height: auto; display: block; cursor: pointer; object-fit: cover;">
                </div>
            `;
        }
    }

    const textoSeguro = escaparHTMLSeguroFeed(post.texto || '');
    const textoHTML = `<p style="margin: 10px 0 0 0; word-break: break-word; white-space: pre-wrap; color: #e2e2e2; font-size: 0.92rem; line-height: 1.5; font-family: system-ui, -apple-system, sans-serif;">${textoSeguro}</p>`;
    const tiempo = post.timestamp ? new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items: center; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: bold; color: var(--oro, #ffcc00); text-shadow: 0 0 6px rgba(255,204,0,0.3);">${escaparHTMLSeguroFeed(post.autor || 'Anónimo')}</span>
                <span style="text-transform: uppercase; font-size: 0.6rem; background: linear-gradient(135deg, rgba(255,204,0,0.15), rgba(255,204,0,0.05)); color: var(--oro, #ffcc00); padding: 3px 7px; border-radius: 4px; border: 1px solid rgba(255,204,0,0.25); font-weight: bold;">${post.categoria || 'general'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.65rem; color: #666;">${tiempo}</span>
                <button onclick="window.eliminarPost('${post.id}')" title="Eliminar transmisión" style="background: rgba(255,51,102,0.1); border: 1px solid rgba(255,51,102,0.3); color: #ff3366; cursor: pointer; font-size: 0.75rem; padding: 3px 6px; border-radius: 4px;">🗑️</button>
            </div>
        </div>
        ${post.texto ? textoHTML : ''}
        ${mediaHTML}
    `;
    return div;
};

window.eliminarPost = async function(postId) {
    if (confirm("¿Estás seguro de eliminar esta transmisión de la red?")) {
        try {
            const db = window.db || firebase.database();
            await db.ref('posts/' + postId).remove();
        } catch (err) {
            alert("Error al eliminar: " + err.message);
        }
    }
};

window.crearPostPrueba = async function() {
    try {
        const db = window.db || firebase.database();
        await db.ref('posts').push({
            autor: localStorage.getItem("casuals_usuario") || "Calavera ☠️",
            categoria: categoriaActualFeed === 'todos' ? 'away-days' : categoriaActualFeed,
            texto: "Transmisión de prueba con desplazamiento fluido.",
            multimedia: null,
            esVideo: false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch(err) {
        alert("Error al crear post: " + err.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltrosFeed();
    if (window.CASUALS && typeof window.CASUALS.whenAuthReady === "function") {
        window.CASUALS.whenAuthReady(window.cargarPostsFeed);
    } else {
        window.cargarPostsFeed();
    }
});