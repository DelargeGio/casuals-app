let enviandoBloqueado = false;

document.addEventListener('DOMContentLoaded', () => {
    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar) {
        btnEnviar.onclick = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            enviarMensajeSeguro();
        };
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto) {
        inputTexto.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
                enviarMensajeSeguro();
            }
        };
    }

    if (typeof window.inicializarChat === 'function') {
        window.inicializarChat();
    } else {
        inicializarChatSeguro();
    }
});

function enviarMensajeSeguro() {
    if (enviandoBloqueado) return; // Candado: bloquea cualquier intento duplicado en ráfaga
    
    const input = document.getElementById('chat-in');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto || typeof firebase === 'undefined') return;

    enviandoBloqueado = true; // Cerramos el portón
    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = '';
        setTimeout(() => { enviandoBloqueado = false; }, 1500); // Abrimos el portón tras 1.5 segundos
    }).catch(err => {
        console.error("Error al enviar:", err);
        enviandoBloqueado = false;
    });
}

function inicializarChatSeguro() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista || typeof firebase === 'undefined') return;

    const chatRef = firebase.database().ref('mensajes').limitToLast(50);
    chatRef.off();
    mensajesLista.innerHTML = '';

    chatRef.on('child_added', (snapshot) => {
        const id = snapshot.key;
        if (document.getElementById(`msg-${id}`)) return;

        const msg = snapshot.val();
        if (!msg) return;

        const autor = msg.autor || 'Anónimo';
        const texto = msg.texto || '';

        const div = document.createElement('div');
        div.id = `msg-${id}`;
        div.style.cssText = "margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.6); border-radius: 6px; color: #fff; font-family: monospace; font-size: 0.85rem;";
        div.innerHTML = `<b style="color: #00f3ff;">${autor}:</b> ${texto}`;
        
        mensajesLista.appendChild(div);
        mensajesLista.scrollTop = mensajesLista.scrollHeight;
    });
}
