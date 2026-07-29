// ======================================
// SCRIPT.JS - ROUTER MAESTRO BLINDADO
// ======================================

window.DOM = {
    get feedContainer() { return document.getElementById('feed-container'); },
    get mensajesContainer() { return document.getElementById('mensajes-container'); },
    get feedPostsLista() { return document.getElementById('feed-posts-lista'); },
    get inputTextoFeed() { return document.getElementById('feed-input-texto'); }
};

window.escaparHTML = function(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

window.renderView = function(view) {
    console.log(`[Router] Navegando a vista: ${view}`);

    const feedCont = window.DOM.feedContainer;
    const msjCont = window.DOM.mensajesContainer;

    // Ocultar todo por defecto
    if (feedCont) feedCont.style.display = 'none';
    if (msjCont) msjCont.style.display = 'none';

    switch(view) {
        case 'feed':
            if (feedCont) {
                feedCont.style.display = 'flex';
                feedCont.style.position = 'absolute';
            }
            if (typeof window.renderFeedContainer === 'function') {
                window.renderFeedContainer();
            }
            break;
            
        case 'chat':
            if (msjCont) {
                msjCont.style.display = 'flex';
                msjCont.style.position = 'absolute';
                msjCont.style.top = '95px';
                msjCont.style.bottom = '65px';
                msjCont.style.left = '0';
                msjCont.style.right = '0';
                msjCont.style.flexDirection = 'column';
            }
            
            // Probamos todas las funciones posibles que manejen el chat en tus otros archivos
            if (typeof window.renderChatContainer === 'function') {
                window.renderChatContainer();
            } else if (typeof window.cargarChat === 'function') {
                window.cargarChat();
            } else if (typeof window.cargarMensajes === 'function') {
                window.cargarMensajes();
            } else if (typeof window.iniciarChat === 'function') {
                window.iniciarChat();
            } else {
                console.warn("[Router] El chat está visible pero no se encontró ninguna función de carga.");
            }
            break;

        default:
            console.warn(`Vista desconocida: ${view}`);
            break;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ CASUALS CORE // Sistema inicializado correctamente.");
});
