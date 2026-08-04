// ==========================================
// CHAT.JS - CORRECCIÓN DIRECTA DE ENVÍO Y ZOOM
// ==========================================

let chatCargadoInicialmente = false;

document.addEventListener('DOMContentLoaded', () => {
    configurarInputsChatSeparado();
    if (typeof window.inicializarChat === 'function') {
        window.inicializarChat();
    }
});

function configurarInputsChatSeparado() {
    const inputGaleria = document.getElementById('input-foto-galeria');
    if (inputGaleria) {
        inputGaleria.onchange = (e) => procesarYEnviarFoto(e);
    }

    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam) {
        inputCam.onchange = (e) => procesarYEnviarFoto(e);
    }

    const btnEnviar = document.getElementById('btn-enviar-msg');
    if (btnEnviar) {
        btnEnviar.onclick = (e) => {
            e.preventDefault();
            enviarTexto();
        };
    }

    const inputTexto = document.getElementById('chat-in');
    if (inputTexto) {
        inputTexto.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarTexto();
            }
        };
    }
}

function procesarYEnviarFoto(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 900;
            let w = img.width, h = img.height;
            if (w > h) {
                if (w > MAX) { h *= MAX / w; w = MAX; }
            } else {
                if (h > MAX) { w *= MAX / h; h = MAX; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            if (typeof firebase === 'undefined') return;
            const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
            
            firebase.database().ref('mensajes').push({
                autor: autor,
                multimedia: base64,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                event.target.value = '';
            }).catch(err => console.error("Error al enviar foto:", err));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.inicializarChat = function() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista || typeof firebase === 'undefined') return;

    const chatRef = firebase.database().ref('mensajes').limitToLast(50);
    chatRef.off();
    mensajesLista.innerHTML = '';
    chatCargadoInicialmente = false;

    chatRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            mensajesLista.innerHTML = `<div style="text-align:center; color:#00f3ff; margin-top:20px; font-family:monospace; font-size:0.75rem;">[SIN MENSAJES EN TRIBUNA]</div>`;
            chatCargadoInicialmente = true;
            return;
        }
        let html = '';
        Object.keys(data).forEach(key => {
            html += construirHTML(data[key], key);
        });
        mensajesLista.innerHTML = html;
        mensajesLista.scrollTop = mensajesLista.scrollHeight;
        chatCargadoInicialmente = true;
        vincularZoom(mensajesLista);
    });

    chatRef.on('child_added', (snapshot) => {
        if (!chatCargadoInicialmente) return;
        const id = snapshot.key;
        if (document.getElementById(`msg-${id}`)) return;

        const msg = snapshot.val();
        const div = document.createElement('div');
        div.innerHTML = construirHTML(msg, id);

        const estaAbajo = (mensajesLista.scrollHeight - mensajesLista.scrollTop - mensajesLista.clientHeight) < 120;
        mensajesLista.appendChild(div.firstElementChild);
        if (estaAbajo) mensajesLista.scrollTop = mensajesLista.scrollHeight;
        vincularZoom(mensajesLista);
    });
};

function construirHTML(msg, id) {
    const usuarioActual = localStorage.getItem('usuario_nombre') || '';
    const autor = window.escaparHTML ? window.escaparHTML(msg.autor || 'Anónimo') : (msg.autor || 'Anónimo');
    const colorInfo = (window.COLORES_USUARIOS && window.COLORES_USUARIOS[msg.autor]) || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
    const esMio = (msg.autor === usuarioActual);
    const claseAlineacion = esMio ? 'derecha' : 'izquierda';
    
    let multimediaHTML = '';
    if (msg.multimedia) {
        multimediaHTML = `
            <div style="width: 100%; max-width: 260px; margin-top: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--oro); background: #000;">
                <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media" style="width: 100%; height: auto; display: block; cursor: pointer;">
            </div>
        `;
    }

    const textoHTML = (!msg.multimedia && msg.texto)
        ? (window.procesarContenidoMensaje ? window.procesarContenidoMensaje(msg.texto) : `<p class="texto-mensaje">${msg.texto}</p>`)
        : '';

    const tiempo = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return `
        <div id="msg-${id}" class="mensaje-wrapper ${claseAlineacion}">
            <div class="burbuja-industrial">
                <span class="autor-tag" style="color:${colorInfo.color} !important; text-shadow:${colorInfo.sombra};">${autor}</span>
                ${textoHTML}
                ${multimediaHTML}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        </div>
    `;
}

function vincularZoom(container) {
    container.querySelectorAll('.chat-img-zoom').forEach(img => {
        if (!img.dataset.zoomSet) {
            img.dataset.zoomSet = "true";
            img.onclick = (e) => {
                const url = e.currentTarget.getAttribute('data-url');
                if (window.abrirVisorImagen) window.abrirVisorImagen(url);
            };
        }
    });
}

function enviarTexto() {
    const input = document.getElementById('chat-in');
    const texto = input ? input.value.trim() : '';
    if (!texto || typeof firebase === 'undefined') return;

    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    if (window.reproducirSonidoMessenger) window.reproducirSonidoMessenger();

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        if (input) input.value = '';
    });
}
