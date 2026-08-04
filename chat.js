// ==========================================
// CHAT.JS - PURGA DE EVENTOS FANTASMA Y CLONACIÓN
// ==========================================

let chatCargadoInicialmente = false;
let enviandoLock = false;

document.addEventListener('DOMContentLoaded', () => {
    configurarInputsChatSeparado();
    inicializarDelegacionZoomGeneral();
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

    // PURGA TOTAL: Clonamos el botón de enviar para borrar cualquier evento oculto de script.js
    const btnEnviarViejo = document.getElementById('btn-enviar-msg');
    if (btnEnviarViejo) {
        const btnEnviar = btnEnviarViejo.cloneNode(true);
        btnEnviarViejo.parentNode.replaceChild(btnEnviar, btnEnviarViejo);
        
        btnEnviar.onclick = (e) => {
            e.preventDefault();
            enviarTexto();
        };
    }

    // Clonamos el input de texto para evitar duplicidad de eventos enter
    const inputTextoViejo = document.getElementById('chat-in');
    if (inputTextoViejo) {
        const inputTexto = inputTextoViejo.cloneNode(true);
        inputTextoViejo.parentNode.replaceChild(inputTexto, inputTextoViejo);
        
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

    const objectURL = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
        URL.revokeObjectURL(objectURL);
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const MAX = 1000;
        
        if (w > MAX || h > MAX) {
            if (w > h) {
                h = Math.round(h * (MAX / w));
                w = MAX;
            } else {
                w = Math.round(w * (MAX / h));
                h = MAX;
            }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

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

    img.onerror = () => { URL.revokeObjectURL(objectURL); };
    img.src = objectURL;
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
    });
};

function inicializarDelegacionZoomGeneral() {
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista || mensajesLista.dataset.zoomDelegated) return;
    mensajesLista.dataset.zoomDelegated = "true";

    mensajesLista.addEventListener('click', (e) => {
        const imgTarget = e.target.closest('.chat-img-zoom');
        if (imgTarget) {
            e.preventDefault();
            e.stopPropagation();
            const url = imgTarget.getAttribute('data-url');
            if (url) window.abrirVisorImagen(url);
        }
    });
}

function construirHTML(msg, id) {
    const usuarioActual = localStorage.getItem('usuario_nombre') || '';
    const autor = window.escaparHTML ? window.escaparHTML(msg.autor || 'Anónimo') : (msg.autor || 'Anónimo');
    const colorInfo = (window.COLORES_USUARIOS && window.COLORES_USUARIOS[msg.autor]) || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
    const sombraCSS = colorInfo.sombra || `0 0 8px ${colorInfo.color}`;

    const esMio = (msg.autor === usuarioActual);
    const claseAlineacion = esMio ? 'derecha' : 'izquierda';
    
    let multimediaHTML = '';
    if (msg.multimedia) {
        multimediaHTML = `
            <div style="width: 100%; max-width: 280px; margin-top: 6px; border-radius: 6px; overflow: hidden; border: 1px solid var(--oro); background: #000;">
                <img src="${msg.multimedia}" class="chat-img-zoom" data-url="${msg.multimedia}" alt="Media" style="width: 100%; height: auto; display: block; cursor: pointer; touch-action: manipulation;">
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
                <span class="autor-tag" style="color:${colorInfo.color} !important; text-shadow:${sombraCSS} !important;">${autor}</span>
                ${textoHTML}
                ${multimediaHTML}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        </div>
    `;
}

window.abrirVisorImagen = function(url) {
    let visor = document.getElementById('visor-imagen-nodal');
    if (!visor) {
        visor = document.createElement('div');
        visor.id = 'visor-imagen-nodal';
        visor.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index:99999; display:flex; align-items:center; justify-content:center; cursor:pointer; touch-action:none;';
        visor.innerHTML = `<img src="" style="max-width:95%; max-height:95%; object-fit:contain; border:2px solid var(--oro, #d4af37); border-radius:6px; box-shadow:0 0 25px rgba(0,0,0,0.9);">`;
        
        visor.onclick = (e) => {
            e.preventDefault();
            visor.style.display = 'none';
        };
        document.body.appendChild(visor);
    }
    const imgModal = visor.querySelector('img');
    if (imgModal) imgModal.src = url;
    visor.style.display = 'flex';
};

function enviarTexto() {
    if (enviandoLock) return;
    const input = document.getElementById('chat-in');
    const texto = input ? input.value.trim() : '';
    if (!texto || typeof firebase === 'undefined') return;

    enviandoLock = true;
    const autor = localStorage.getItem('usuario_nombre') || 'Calavera ☠️';
    if (window.reproducirSonidoMessenger) window.reproducirSonidoMessenger();

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        if (input) input.value = '';
        setTimeout(() => { enviandoLock = false; }, 800);
    }).catch(err => {
        console.error("Error al enviar texto:", err);
        enviandoLock = false;
    });
}
