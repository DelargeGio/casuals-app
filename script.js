// ==========================================
// SCRIPT.JS - MOTOR GENERAL & CHAT UNIFICADO
// ==========================================

const COLORES_USUARIOS = {
    "Apple 🍎": { color: "#ff3366", sombra: "0 0 10px #ff3366" },
    "Calavera ☠️": { color: "#00ff66", sombra: "0 0 10px #00ff66" },
    "Pelu 🧸": { color: "#ffcc00", sombra: "0 0 10px #ffcc00" },
    "Manu 🇦🇷": { color: "#4da6ff", sombra: "0 0 10px #4da6ff" },
    "GioDelarge 🤹🏽": { color: "#ff6600", sombra: "0 0 10px #ff6600" }
};

let enviandoBloqueado = false;
let chatRefGeneral = null;

// ==========================================
// 1. UTILIDADES Y AUDIO
// ==========================================
window.reproducirSonidoMessenger = function() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') { audioCtx.resume(); }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch(e) {
        console.log("Audio omitido:", e);
    }
};

window.escaparHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
};

// ==========================================
// 2. PROCESAMIENTO MULTIMEDIA
// ==========================================
window.procesarContenidoMensaje = function(texto) {
    if (!texto) return '';
    const textoEscapado = window.escaparHTML(texto);
    
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    let procesado = textoEscapado.replace(youtubeRegex, (match, videoId) => {
        return `<br><div class="multimedia-box"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:200px; border-radius:4px; margin-top:5px;"></iframe></div>`;
    });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    procesado = procesado.replace(urlRegex, (url) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) return url;

        if (url.match(/\.(jpeg|jpg|gif|png|webp)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box"><a href="${url}" target="_blank"><img src="${url}" class="chat-img-zoom" data-url="${url}" alt="Imagen" style="width:100%; max-height:220px; object-fit:contain; border-radius:4px; margin-top:5px; cursor:pointer;"></a></div>`;
        } else if (url.match(/\.(mp4|webm|ogg|mov)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box"><video controls playsinline preload="metadata" src="${url}" style="width:100%; max-height:220px; background:#000; border-radius:4px; margin-top:5px;"></video></div>`;
        } else if (url.match(/\.(mp3|wav|ogg|m4a)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box" style="padding:5px;"><audio controls src="${url}" style="width:100%; margin-top:5px;"></audio></div>`;
        }
        
        return `<a href="${url}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${url}</a>`;
    });

    return `<p class="texto-mensaje" style="word-break: break-word; white-space: pre-wrap;">${procesado}</p>`;
};

// ==========================================
// 3. CONSTRUCTOR DE HTML PARA MENSAJES
// ==========================================
function construirHTMLMensaje(msg, id) {
    const usuarioActual = localStorage.getItem("usuario_nombre") || "";
    const autor = window.escaparHTML ? window.escaparHTML(msg.autor || 'Anónimo') : (msg.autor || 'Anónimo');
    
    const colorInfo = COLORES_USUARIOS[autor] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
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

// ==========================================
// 4. CARGA DE MENSAJES (ÚNICO LISTENER)
// ==========================================
window.cargarMensajes = function() {
    if (typeof firebase === 'undefined') return;
    const mensajesLista = document.getElementById('mensajes-lista');
    if (!mensajesLista) return;

    if (chatRefGeneral) chatRefGeneral.off();
    mensajesLista.innerHTML = '';
    
    chatRefGeneral = firebase.database().ref('mensajes').limitToLast(50);

    chatRefGeneral.on('child_added', (snapshot) => {
        const id = snapshot.key;
        if (document.getElementById(`msg-${id}`)) return; 

        const msg = snapshot.val();
        if (!msg) return;

        const divTemp = document.createElement('div');
        divTemp.innerHTML = construirHTMLMensaje(msg, id);
        
        const elementoFinal = divTemp.firstElementChild;
        if (!elementoFinal) return;

        mensajesLista.appendChild(elementoFinal);
        mensajesLista.scrollTop = mensajesLista.scrollHeight;
    });
};

// ==========================================
// 5. ENVÍO SEGURO Y ANTIVANDÁLICO
// ==========================================
window.enviarTextoForzado = function(texto) {
    if (enviandoBloqueado || !texto || typeof firebase === 'undefined') return;
    
    enviandoBloqueado = true;
    const autor = localStorage.getItem("usuario_nombre") || "Calavera ☠️";
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    window.reproducirSonidoMessenger();

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        tiempo: tiempo,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        setTimeout(() => { enviandoBloqueado = false; }, 1200);
    }).catch(err => {
        console.error("Error al enviar mensaje:", err);
        enviandoBloqueado = false;
    });
};

window.enviarMensaje = function() {
    const input = document.getElementById('chat-in');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    input.value = '';
    window.enviarTextoForzado(texto);
};

// ==========================================
// 6. GESTIÓN DE PRESENCIA Y VISTAS
// ==========================================
window.iniciarPresencia = function() {
    const usuario = localStorage.getItem("usuario_nombre");
    if (!usuario || typeof firebase === 'undefined') return;

    const sanitizedUser = usuario.replace(/[.#$\/\[\]]/g, '_');
    const miConexionRef = firebase.database().ref('conectados/' + sanitizedUser);
    const conectadoRef = firebase.database().ref('.info/connected');

    conectadoRef.on('value', (snap) => {
        if (snap.val() === true) {
            miConexionRef.set({
                nombre: usuario,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            miConexionRef.onDisconnect().remove();
        }
    });

    firebase.database().ref('conectados').on('value', (snapshot) => {
        const data = snapshot.val();
        const listaSpan = document.getElementById('lista-nombres-conectados');
        if (!listaSpan) return;

        if (!data) {
            listaSpan.textContent = "Nadie conectado";
            return;
        }

        let elementosHTML = [];
        Object.values(data).forEach(item => {
            if (item && item.nombre) {
                const nombreUser = item.nombre;
                const estilo = COLORES_USUARIOS[nombreUser] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
                elementosHTML.push(`<span style="color: ${estilo.color} !important; text-shadow: ${estilo.sombra}; font-weight: bold; margin: 0 4px;">${nombreUser}</span>`);
            }
        });

        listaSpan.innerHTML = elementosHTML.length > 0 ? elementosHTML.join(' • ') : "Nadie conectado";
    });
};

window.renderView = function(vista) {
    const body = document.body;
    const navFeed = document.getElementById("nav-feed");
    const navChat = document.getElementById("nav-chat");

    if (vista === "feed") {
        body.className = "vista-feed";
        if (navFeed) navFeed.classList.add("active");
        if (navChat) navChat.classList.remove("active");
        if (typeof window.renderFeed === "function") window.renderFeed();
    } else if (vista === "chat") {
        body.className = "vista-chat";
        if (navChat) navChat.classList.add("active");
        if (navFeed) navFeed.classList.remove("active");
        
        const lista = document.getElementById('mensajes-lista');
        if (lista) lista.scrollTop = lista.scrollHeight;
    }
};

// ==========================================
// 7. INICIALIZACIÓN GENERAL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const navFeed = document.getElementById("nav-feed");
    const navChat = document.getElementById("nav-chat");
    if (navFeed) navFeed.addEventListener("click", () => window.renderView("feed"));
    if (navChat) navChat.addEventListener("click", () => window.renderView("chat"));

    const btnEnviar = document.getElementById("btn-enviar-msg");
    if (btnEnviar) {
        btnEnviar.onclick = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.enviarMensaje();
        };
    }

    const inputChat = document.getElementById("chat-in");
    if (inputChat) {
        inputChat.onkeydown = (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.enviarMensaje();
            }
        };
    }

    const btnPanic = document.getElementById("btn-panic-acab");
    if (btnPanic) {
        btnPanic.addEventListener("click", () => {
            if (typeof window.activarAlertaACAB === "function") window.activarAlertaACAB();
        });
    }

    const btnBengala = document.getElementById("btn-bengala-humo");
    if (btnBengala) {
        btnBengala.addEventListener("click", () => {
            if (typeof window.activarBengalaYHumio === "function") window.activarBengalaYHumio();
        });
    }

    if (typeof window.cargarFeed === "function") {
        window.cargarFeed();
    }
    
    window.cargarMensajes();
    window.iniciarPresencia();
});
