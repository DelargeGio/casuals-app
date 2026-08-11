// ==========================================
// CHAT.JS - MOTOR DE MENSAJERÍA CON ESTILO NEÓN POR USUARIO
// ==========================================

const COLORES_USUARIOS_CHAT = {
    "Apple 🍎": { color: "#ff3366", sombra: "0 0 10px #ff3366" },
    "Calavera ☠️": { color: "#00ff66", sombra: "0 0 10px #00ff66" },
    "Pelu 🧸": { color: "#ffcc00", sombra: "0 0 10px #ffcc00" },
    "Manu 🇦🇷": { color: "#4da6ff", sombra: "0 0 10px #4da6ff" },
    "GioDelarge 🤹🏽": { color: "#ff6600", sombra: "0 0 10px #ff6600" }
};

window.cargarMensajes = function() {
    const db = window.db || (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
    if (!db) {
        setTimeout(window.cargarMensajes, 300);
        return;
    }

    const lista = document.getElementById('mensajes-lista');
    if (!lista) return;

    try {
        db.ref('mensajes').off();
    } catch(e) {}

    lista.innerHTML = '<div style="text-align:center; color:var(--neon-morado); padding:15px; font-family:monospace;">Conectando canal cifrado...</div>';

    const refMensajes = db.ref('mensajes').limitToLast(50);

    refMensajes.on('value', (snapshot) => {
        lista.innerHTML = '';
        let msgs = [];

        snapshot.forEach((child) => {
            const data = child.val();
            const autorReal = data.autor || data.nombre || "Calavera ☠️";
            msgs.push({ id: child.key, ...data, autor: autorReal });
        });

        msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        if (msgs.length === 0) {
            lista.innerHTML = '<div style="text-align:center; color:#777; padding:20px; font-style:italic;">No hay mensajes recientes. ¡Inicia la charla!</div>';
            return;
        }

        let ultimoAutor = null;
        const usuarioActual = localStorage.getItem("usuario_nombre") || "Calavera ☠️";

        msgs.forEach(msg => {
            const esMio = msg.autor === usuarioActual;
            const div = document.createElement('div');
            div.className = `mensaje-wrapper ${esMio ? 'derecha' : 'izquierda'}`;

            // Obtener el estilo de color neón del usuario
            const estiloUser = COLORES_USUARIOS_CHAT[msg.autor] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };

            let contenidoMult = '';
            if (msg.multimedia) {
                if (msg.esVideo) {
                    contenidoMult = `<div class="multimedia-box"><video src="${msg.multimedia}" controls playsinline preload="metadata" style="width:100%; max-height:200px; background:#000; border-radius:6px;"></video></div>`;
                } else {
                    contenidoMult = `<div class="multimedia-box"><img src="${msg.multimedia}" onclick="if(typeof abrirVisorImagen==='function')abrirVisorImagen('${msg.multimedia}')" alt="Imagen chat" style="width:100%; max-height:200px; object-fit:contain; border-radius:6px; cursor:pointer;"></div>`;
                }
            }

            const textoProc = msg.texto ? window.procesarContenidoMensaje(msg.texto) : '';
            const mostrarAutor = msg.autor !== ultimoAutor;
            ultimoAutor = msg.autor;

            div.innerHTML = `
                <div class="burbuja-industrial" style="border: 1px solid ${estiloUser.color}; box-shadow: ${estiloUser.sombra};">
                    ${mostrarAutor ? `<span class="autor-tag" style="color: ${estiloUser.color}; text-shadow: ${estiloUser.sombra};">${window.escaparHTML(msg.autor)}</span>` : ''}
                    ${textoProc}
                    ${contenidoMult}
                </div>
            `;
            lista.appendChild(div);
        });

        lista.scrollTop = lista.scrollHeight;
    }, (error) => {
        console.error("Error al cargar mensajes:", error);
        lista.innerHTML = '<div style="text-align:center; color:var(--fuego); padding:15px;">Error al sincronizar mensajes.</div>';
    });
};

window.enviarMensajeSeguro = async function(textoPersonalizado = null, multimediaUrl = null, esVideo = false) {
    const input = document.getElementById('chat-in');
    const texto = textoPersonalizado !== null ? textoPersonalizado : (input ? input.value.trim() : '');
    const autor = localStorage.getItem("usuario_nombre") || "Calavera ☠️";

    if (!texto && !multimediaUrl) return;

    const db = window.db || firebase.database();
    try {
        await db.ref('mensajes').push({
            autor: autor,
            nombre: autor,
            texto: texto,
            multimedia: multimediaUrl || null,
            esVideo: esVideo || false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        if (input && textoPersonalizado === null) {
            input.value = '';
        }
        if (typeof window.reproducirSonidoMessenger === 'function') {
            window.reproducirSonidoMessenger();
        }
    } catch (err) {
        console.error("Error al enviar mensaje:", err);
        alert("No se pudo enviar el mensaje.");
    }
};

window.subirArchivoChat = function(file, esVideo = false) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        window.enviarMensajeSeguro(null, base64Data, esVideo);
    };
    reader.readAsDataURL(file);
};

document.addEventListener('DOMContentLoaded', () => {
    const inputChat = document.getElementById('chat-in');
    if (inputChat) {
        inputChat.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.enviarMensajeSeguro();
            }
        });
    }

    const inputCam = document.getElementById('input-foto-cam');
    if (inputCam) {
        inputCam.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                window.subirArchivoChat(e.target.files[0], false);
                e.target.value = '';
            }
        });
    }

    const inputGal = document.getElementById('input-foto-galeria');
    if (inputGal) {
        inputGal.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const isVid = file.type.startsWith('video/');
                window.subirArchivoChat(file, isVid);
                e.target.value = '';
            }
        });
    }
});