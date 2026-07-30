// ======================================
// SCRIPT.JS - INICIALIZACIÓN Y ROUTER
// ======================================

window.DOM = {
    get feedContainer() { return document.getElementById('feed-container'); },
    get mensajesContainer() { return document.getElementById('mensajes-container'); },
    get feedPostsLista() { return document.getElementById('feed-posts-lista'); }
};

window.escaparHTML = function(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

function renderView(view) {
    const feedContainer = window.DOM.feedContainer;
    const mensajesContainer = window.DOM.mensajesContainer;

    if (feedContainer) feedContainer.style.display = 'none';
    if (mensajesContainer) mensajesContainer.style.display = 'none';

    const btnFeed = document.getElementById('nav-feed');
    const btnChat = document.getElementById('nav-chat');
    
    if (btnFeed) btnFeed.classList.remove('active');
    if (btnChat) btnChat.classList.remove('active');

    if (view === 'feed') {
        if (feedContainer) feedContainer.style.display = 'block';
        if (btnFeed) btnFeed.classList.add('active');
        if (typeof renderFeedContainer === 'function') {
            renderFeedContainer();
        } else if (typeof cargarFeed === 'function') {
            cargarFeed();
        }
    } else if (view === 'chat') {
        if (mensajesContainer) {
            mensajesContainer.style.display = 'flex';
            mensajesContainer.style.flexDirection = 'column';
        }
        if (btnChat) btnChat.classList.add('active');
        if (typeof cargarMensajes === 'function') {
            cargarMensajes();
        }
        if (typeof iniciarPresencia === 'function') {
            iniciarPresencia();
        }
    }
}

window.renderView = renderView;
