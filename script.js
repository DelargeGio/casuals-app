// ======================================
// SCRIPT.JS - CONTROL DE NAVEGACIÓN Y VISTAS
// ======================================

window.renderView = (view) => {
    const feedContainer = document.getElementById('feed-container');
    const mensajesContainer = document.getElementById('mensajes-container');

    if (view === 'feed') {
        if (mensajesContainer) mensajesContainer.style.display = 'none';
        if (feedContainer) feedContainer.style.display = 'block';
        if (typeof renderFeed === 'function') renderFeed();
    } else if (view === 'chat') {
        if (feedContainer) feedContainer.style.display = 'none';
        if (mensajesContainer) mensajesContainer.style.display = 'flex';
        if (typeof cargarMensajes === 'function') cargarMensajes();
    }
};

