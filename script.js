// ======================================
// SCRIPT.JS - NÚCLEO CENTRAL Y ROUTER OPTIMIZADO (CASUALS)
// ======================================

// 9. CACHÉ GLOBAL DEL DOM (Optimización de rendimiento para móviles)
window.DOM = {
    get feedContainer() { return document.getElementById('feed-container'); },
    get mensajesContainer() { return document.getElementById('mensajes-container'); },
    get feedPostsLista() { return document.getElementById('feed-posts-lista'); },
    get inputTextoFeed() { return document.getElementById('feed-input-texto'); }
};

// 1. FUNCIÓN ÚNICA DE SEGURIDAD (Antídoto contra XSS - Sin duplicados)
window.escaparHTML = function(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// 2. ROUTER CENTRAL LIMPIO (Controlando visibilidad de contenedores)
window.renderView = function(view) {
    console.log(`[Router] Navegando a vista: ${view}`);

    const feedCont = window.DOM.feedContainer;
    const msjCont = window.DOM.mensajesContainer;

    // Ocultar todo por defecto para evitar sobreposiciones
    if (feedCont) feedCont.style.display = 'none';
    if (msjCont) msjCont.style.display = 'none';

    // Despachar a los módulos correspondientes y mostrar su contenedor activo
    switch(view) {
        case 'feed':
            if (feedCont) {
                feedCont.style.display = 'flex';
                feedCont.style.position = 'absolute';
            }
            if (typeof window.renderFeedContainer === 'function') {
                window.renderFeedContainer();
            } else {
                console.error("El módulo 'feeds.js' no está cargado correctamente.");
            }
            break;
            
        case 'chat':
            if (msjCont) {
                msjCont.style.display = 'flex'; // ¡Encendemos el chat de nuevo!
            }
            if (typeof window.renderChatContainer === 'function') {
                window.renderChatContainer();
            } else if (typeof window.cargarChat === 'function') {
                window.cargarChat();
            }
            break;

        default:
            console.warn(`Vista desconocida: ${view}`);
            break;
    }
};

// Inicialización general del sistema
document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ CASUALS CORE // Sistema inicializado correctamente.");
    
    const usuario = localStorage.getItem('casuals_user');
    if (!usuario && typeof window.mostrarLogin === 'function') {
        window.mostrarLogin();
    }
});
