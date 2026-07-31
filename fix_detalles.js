// 1. VISOR GLOBAL PARA ABRIR IMAGENES DEL CHAT Y FEED
window.abrirImagenModal = function(src) {
    let modal = document.getElementById('visor-img-global');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'visor-img-global';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px); opacity:0; transition:opacity 0.3s;';
        modal.onclick = function() {
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        };
        modal.innerHTML = `
            <img id="visor-img-src" src="" style="max-width:95%; max-height:90%; object-fit:contain; border: 1px solid var(--neon-azul); border-radius: 8px; box-shadow: 0 0 20px rgba(0, 242, 255, 0.3); transform: scale(0.9); transition: transform 0.3s;">
            <div style="position:absolute; top:20px; right:20px; color:var(--neon-azul); font-size:24px; font-family:monospace; background:rgba(0,0,0,0.7); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid var(--neon-azul);">X</div>
        `;
        document.body.appendChild(modal);
    }
    const imgEl = document.getElementById('visor-img-src');
    imgEl.src = src;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
    }, 10);
};

// Escuchar clics en cualquier imagen para abrirla
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG') {
        // Si la imagen esta en el chat o en el carrusel del feed
        if (e.target.closest('.multimedia-box') || e.target.closest('.feed-carrusel-item') || e.target.closest('.burbuja-industrial')) {
            window.abrirImagenModal(e.target.src);
        }
    }
});

// 2. FORZAR LIMPIEZA DE UI Y ARREGLAR SCROLL DEL FEED
const originalRenderFeed = window.renderFeedContainer;
if (typeof originalRenderFeed === 'function') {
    window.renderFeedContainer = function() {
        originalRenderFeed();
        
        // Limpiar el estado visual atorado "Subiendo..."
        if (typeof limpiarImagenesFeed === 'function') {
            setTimeout(() => limpiarImagenesFeed(), 200);
        }
        
        // Destrabar el Scroll del contenedor del Feed
        setTimeout(() => {
            const feedPostsLista = document.getElementById('feed-posts-lista');
            if (feedPostsLista) {
                feedPostsLista.style.flex = '1 1 auto';
                feedPostsLista.style.overflowY = 'auto';
                feedPostsLista.style.paddingBottom = '120px'; 
                feedPostsLista.style.height = '100%';
                feedPostsLista.style.webkitOverflowScrolling = 'touch';
            }
        }, 500);
    };
}
