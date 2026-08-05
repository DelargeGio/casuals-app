// ==========================================
// CHAT.JS - MÓDULO INDEPENDIENTE DE CHAT
// ==========================================

let chatEnviandoBloqueado = false;
let chatRefModulo = null;

function construirHTMLMensajeChat(msg, id) {
    const usuarioActual = localStorage.getItem("usuario_nombre") || "";
    const autor = window.escaparHTML ? window.escaparHTML(msg.autor || 'Anónimo') : (msg.autor || 'Anónimo');
    
    const colorInfo = (typeof COLORES_USUARIOS !== 'undefined' ? COLORES_USUARIOS[autor] : null) || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
    const esMio = (autor === usuarioActual);
    const claseAlineacion = esMio ? 'derecha' : 'izquierda';

    let multimediaHTML = '';
    if (msg.multimedia) {
        multimediaHTML = `
            <div style="width: 100%; max-width: 280px; margin-top: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--oro); background: #000;">
                <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media" style="width: 100%; height: auto; display: block; cursor: pointer; touch-action: manipulation;">
            </div>
        `;
    }

    const textoHTML = (msg.multimedia && msg.texto) ? `<p class="texto-mensaje" style="word-break: break-word; white-space: pre-wrap;">${window.escaparHTML(msg.texto)}</p>` : (window.procesarContenidoMensaje ? window.procesarContenidoMensaje(msg.texto) : `<p>${msg.texto || ''}</p>`);
    const tiempo = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.tiempo || '');

    return `
        <div id="msg-${id}" class="mensaje-wrapper ${claseAlineacion}">
            <div class="burbuja-industrial">
                <span class="autor-tag" style="color: ${colorInfo.color} !important; text-shadow: ${colorInfo.sombra};">${autor}</span>
                ${textoHTML}
                ${multimediaHTML}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        </div>
    `;
}

window.cargarMensajes = function() {
    if (typeof firebase === 'undefined') return;
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    if (chatRefModulo) chatRefModulo.off();
    mensajesLista.innerHTML = '';
    
    chatRefModulo = firebase.database().ref('mensajes').limitToLast(50);

    chatRefModulo.on('child_added', (snapshot) => {
        const id = snapshot.key;
        if (document.getElementById(`msg-${id}`)) return; 

        const msg = snapshot.val();
        if (!msg) return;

        const divTemp = document.createElement('div');
        divTemp.innerHTML = construirHTMLMensajeChat(msg, id);
        
        const elementoFinal = divTemp.firstElementChild;
        if (!elementoFinal) return;

        mensajesLista.appendChild(elementoFinal);
        mensajesLista.scrollTop = mensajesLista.scrollHeight;
    });
};

window.enviarMensajeSeguro = function() {
    if (chatEnviandoBloqueado) return; // Candado anti-ráfaga
    
    const input = document.getElementById('chat-in');
    if (!input || typeof firebase === 'undefined') return;
    
    const texto = input.value.trim();
    if (!texto) return;

    chatEnviandoBloqueado = true;
    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (typeof window.reproducirSonidoMessenger === 'function') {
        window.reproducirSonidoMessenger();
    }

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        tiempo: tiempo,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = '';
        setTimeout(() => { chatEnviandoBloqueado = false; }, 1200);
    }).catch(err => {
        console.error("Error al enviar:", err);
        chatEnviandoBloqueado = false;
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar) {
        // .onclick evita duplicidad acumulando listeners
        btnEnviar.onclick = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.enviarMensajeSeguro();
        };
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto) {
        inputTexto.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.enviarMensajeSeguro();
            }
        };
    }

    window.cargarMensajes();
});
