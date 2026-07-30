// ======================================
// SCRIPT.JS - ROUTER Y CONTROL DE VISTAS
// ======================================

function renderView(view) {
    const feedContainer = document.getElementById('feed-container');
    const mensajesContainer = document.getElementById('mensajes-container');

    if (feedContainer) feedContainer.style.display = 'none';
    if (mensajesContainer) mensajesContainer.style.display = 'none';

    // Actualizar botones de navegación inferior
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
