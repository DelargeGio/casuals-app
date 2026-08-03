// ==========================================
// SCRIPT.JS - MOTOR GENERAL & CHAT ESTABLE
// ==========================================

const COLORES_USUARIOS = {
    "Apple 🍎": { color: "#ff3366", sombra: "0 0 10px #ff3366" },
    "Calavera ☠️": { color: "#00ff66", sombra: "0 0 10px #00ff66" },
    "Pelu 🧸": { color: "#ffcc00", sombra: "0 0 10px #ffcc00" },
    "Manu 🇦🇷": { color: "#4da6ff", sombra: "0 0 10px #4da6ff" },
    "GioDelarge 🤹🏽": { color: "#ff6600", sombra: "0 0 10px #ff6600" }
};

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

window.iniciarPresencia = function() {
    const usuario = localStorage.getItem("usuario_nombre");
    if (!usuario) return;

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

window.procesarContenidoMensaje = function(texto) {
    if (!texto) return '';
    const textoEscapado = window.escaparHTML ? window.escaparHTML(texto) : texto;
    
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    let procesado = textoEscapado.replace(youtubeRegex, (match, videoId) => {
        return `<br><div class="multimedia-box"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:200px; border-radius:4px; margin-top:5px;"></iframe></div>`;
    });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    procesado = procesado.replace(urlRegex, (url) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) return url;

        if (url.match(/\.(jpeg|jpg|gif|png|webp)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box"><a href="${url}" target="_blank"><img src="${url}" alt="Imagen" style="width:100%; max-height:220px; object-fit:contain; border-radius:4px; margin-top:5px;"></a></div>`;
        } else if (url.match(/\.(mp4|webm|ogg|mov)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box"><video controls playsinline preload="metadata" src="${url}" style="width:100%; max-height:220px; background:#000; border-radius:4px; margin-top:5px;"></video></div>`;
        } else if (url.match(/\.(mp3|wav|ogg|m4a)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box" style="padding:5px;"><audio controls src="${url}" style="width:100%; margin-top:5px;"></audio></div>`;
        }
        
        return `<a href="${url}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${url}</a>`;
    });

    return `<p class="texto-mensaje" style="word-break: break-word; white-space: pre-wrap;">${procesado}</p>`;
};

let chatRefChatGeneral = null;
window.cargarMensajes = function() {
    if (typeof firebase === 'undefined') return;
    const lista = document.getElementById('mensajes-lista');
    if (!lista) return;

    if (chatRefChatGeneral) chatRefChatGeneral.off();

    chatRefChatGeneral = firebase.database().ref('mensajes').limitToLast(30);

    chatRefChatGeneral.on('child_added', (snapshot) => {
        const key = snapshot.key;
        if (document.getElementById(`msg-firebase-${key}`)) return;

        const msg = snapshot.val();
        if (!msg) return;

        const autor = msg.autor || 'Anónimo';
        const texto = msg.texto || '';
        const tiempo = msg.tiempo || '';
        const esMia = autor === localStorage.getItem("usuario_nombre");

        const div = document.createElement('div');
        div.id = `msg-firebase-${key}`;
        div.className = `mensaje-wrapper ${esMia ? 'derecha' : 'izquierda'}`;

        let contenidoVisual = window.procesarContenidoMensaje ? window.procesarContenidoMensaje(texto) : `<p>${texto}</p>`;
        const estiloAutor = COLORES_USUARIOS[autor] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };

        div.innerHTML = `
            <div class="burbuja-industrial">
                <span class="autor-tag" style="color: ${estiloAutor.color} !important; text-shadow: ${estiloAutor.sombra};">${autor}</span>
                ${contenidoVisual}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        `;

        lista.appendChild(div);
        lista.scrollTop = lista.scrollHeight;
    });
};

window.escaparHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
};

window.enviarTextoForzado = function(texto) {
    if (!texto) return;
    const autor = localStorage.getItem("usuario_nombre") || "Anónimo";
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    window.reproducirSonidoMessenger();

    const lista = document.getElementById('mensajes-lista');
    if (lista) {
        const placeholder = lista.querySelector('div[style*="text-align:center"]');
        if (placeholder) placeholder.remove();

        const div = document.createElement('div');
        const esMia = autor === localStorage.getItem("usuario_nombre");
        div.className = `mensaje-wrapper ${esMia ? 'derecha' : 'izquierda'}`;

        const estiloAutor = COLORES_USUARIOS[autor] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
        const contenido = window.procesarContenidoMensaje(texto);

        div.innerHTML = `
            <div class="burbuja-industrial">
                <span class="autor-tag" style="color: ${estiloAutor.color} !important; text-shadow: ${estiloAutor.sombra};">${autor}</span>
                ${contenido}
                <span class="mensaje-tiempo">${tiempo}</span>
            </div>
        `;
        lista.appendChild(div);
        lista.scrollTop = lista.scrollHeight;
    }

    firebase.database().ref('mensajes').push({
        autor: autor,
        texto: texto,
        tiempo: tiempo,
        timestamp: Date.now()
    }).catch(err => {
        console.error("Error al enviar mensaje:", err);
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

document.addEventListener("DOMContentLoaded", () => {
    const navFeed = document.getElementById("nav-feed");
    const navChat = document.getElementById("nav-chat");
    if (navFeed) navFeed.addEventListener("click", () => window.renderView("feed"));
    if (navChat) navChat.addEventListener("click", () => window.renderView("chat"));

    const btnEnviar = document.getElementById("btn-enviar-msg");
    const inputChat = document.getElementById("chat-in");
    if (btnEnviar) btnEnviar.addEventListener("click", () => window.enviarMensaje());
    if (inputChat) {
        inputChat.addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.enviarMensaje();
        });
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

    const inputCam = document.getElementById("input-foto-cam");
    if (inputCam) {
        inputCam.addEventListener("change", (e) => {
            if (typeof window.enviarArchivoLocal === "function") window.enviarArchivoLocal(e);
        });
    }

    const inputGaleria = document.getElementById("input-foto-galeria");
    if (inputGaleria) {
        inputGaleria.addEventListener("change", (e) => {
            if (typeof window.enviarArchivoLocal === "function") window.enviarArchivoLocal(e);
        });
    }

    // Inicializar motores al arrancar la app
    window.cargarFeed();
    window.cargarMensajes();
});
