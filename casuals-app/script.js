// ==========================================
// SCRIPT.JS - MOTOR GENERAL & VISTAS (v2.9)
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

window.escaparHTML = function(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

window.procesarContenidoMensaje = function(texto) {
    if (!texto) return '';
    const textoEscapado = window.escaparHTML(texto);
    let procesado = textoEscapado;

    const youtubeRegex = /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?/g;
    procesado = procesado.replace(youtubeRegex, (match, videoId) => {
        return `<br><div class="multimedia-box" style="margin-top:8px;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; max-width:400px; height:220px; border-radius:6px; background:#000; display:block;"></iframe></div>`;
    });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    procesado = procesado.replace(urlRegex, (url) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            return url; 
        }

        if (url.match(/\.(jpeg|jpg|gif|png|webp)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box" style="margin-top:8px;"><a href="${url}" target="_blank"><img src="${url}" class="chat-img-zoom" data-url="${url}" alt="Imagen" style="width:100%; max-height:220px; object-fit:contain; border-radius:6px; cursor:pointer;"></a></div>`;
        } else if (url.match(/\.(mp4|webm|ogg|mov)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box" style="margin-top:8px;"><video controls playsinline preload="metadata" src="${url}" style="width:100%; max-height:220px; background:#000; border-radius:6px;"></video></div>`;
        } else if (url.match(/\.(mp3|wav|ogg|m4a)(\?[^\s]*)?$/i)) {
            return `<br><div class="multimedia-box" style="margin-top:8px; padding:5px;"><audio controls src="${url}" style="width:100%;"></audio></div>`;
        } else {
            let etiquetaRed = "🔗 ENLACE";
            let colorBorde = "#4da6ff";
            if (url.includes("instagram.com")) { etiquetaRed = "📸 INSTAGRAM"; colorBorde = "#ff3366"; }
            else if (url.includes("facebook.com") || url.includes("fb.watch")) { etiquetaRed = "📘 FACEBOOK"; colorBorde = "#3b5998"; }
            else if (url.includes("tiktok.com")) { etiquetaRed = "🎵 TIKTOK"; colorBorde = "#ff0050"; }

            return `<br><div class="multimedia-box" style="background: rgba(0,0,0,0.3); border-left: 3px solid ${colorBorde}; padding: 8px 12px; border-radius: 4px; margin-top: 8px; display: inline-block; max-width: 100%;">
                <span style="font-size: 0.75rem; font-weight: bold; color: ${colorBorde}; display: block; margin-bottom: 2px;">${etiquetaRed}</span>
                <a href="${url}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all; font-size: 0.9rem;">${url}</a>
            </div>`;
        }
    });

    return `<p class="texto-mensaje" style="word-break: break-word; white-space: pre-wrap; margin:0;">${procesado}</p>`;
};

// ==========================================
// CONTROL DE PRESENCIA DINÁMICO POR USUARIO REAL
// ==========================================
let presenciaActualRef = null;
let sesionPresenciaId = null;

window.iniciarPresencia = function() {
    // Obtener el nombre real del usuario logueado en este dispositivo/pestaña
    let usuarioActivo = localStorage.getItem("usuario_nombre");
    
    // Si no hay un nombre definido, aseguramos que tome uno de los permitidos o un identificador único por sesión
    if (!usuarioActivo || usuarioActivo.trim() === "") {
        usuarioActivo = "Calavera ☠️"; // Valor por defecto solo si está completamente vacío
        localStorage.setItem("usuario_nombre", usuarioActivo);
    }
    
    if (typeof firebase === 'undefined' || !firebase.database) {
        setTimeout(window.iniciarPresencia, 300);
        return;
    }

    if (presenciaActualRef) {
        try { presenciaActualRef.remove(); } catch(e) {}
    }

    const db = firebase.database();
    const conectadoRef = db.ref('.info/connected');

    conectadoRef.on('value', (snap) => {
        if (snap.val() === true) {
            // Refrescar el nombre actual por si cambió en el storage
            const nombreParaBD = localStorage.getItem("usuario_nombre") || usuarioActivo;
            if (!sesionPresenciaId) {
                sesionPresenciaId = db.ref('conectados').push().key;
            }
            presenciaActualRef = db.ref('conectados/' + sesionPresenciaId);
            presenciaActualRef.set({
                nombre: nombreParaBD,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            presenciaActualRef.onDisconnect().remove();
        }
    });

    if (!window._conectadosListenerConfigurado) {
        window._conectadosListenerConfigurado = true;
        db.ref('conectados').on('value', (snapshot) => {
            const data = snapshot.val();
            const listaSpan = document.getElementById('lista-nombres-conectados');
            if (!listaSpan) return;

            if (!data) {
                listaSpan.textContent = "Nadie conectado";
                return;
            }

            let nombresUnicos = new Set();
            Object.values(data).forEach(item => {
                if (item && item.nombre) nombresUnicos.add(item.nombre);
            });

            let elementosHTML = [];
            nombresUnicos.forEach(nombreUser => {
                const estilo = COLORES_USUARIOS[nombreUser] || { color: "#4da6ff", sombra: "0 0 8px #4da6ff" };
                elementosHTML.push(`<span style="color: ${estilo.color} !important; text-shadow: ${estilo.sombra}; font-weight: bold; margin: 0 4px;">${nombreUser}</span>`);
            });

            listaSpan.innerHTML = elementosHTML.length > 0 ? elementosHTML.join(' • ') : "Nadie conectado";
        });
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
        if (typeof window.cargarPostsFeed === "function") window.cargarPostsFeed();
    } else if (vista === "chat") {
        body.className = "vista-chat";
        if (navChat) navChat.classList.add("active");
        if (navFeed) navFeed.classList.remove("active");
        
        const lista = document.getElementById('mensajes-lista');
        if (lista) lista.scrollTop = lista.scrollHeight;
    }
};

window.inicializarAppCompleta = function() {
    if (typeof window.iniciarPresencia === "function") window.iniciarPresencia();
    if (typeof window.cargarPostsFeed === "function") window.cargarPostsFeed();
    if (typeof window.cargarMensajes === "function") window.cargarMensajes();
    if (typeof window.iniciarEscuchaZumbidos === "function") window.iniciarEscuchaZumbidos();
};

document.addEventListener("DOMContentLoaded", () => {
    const navFeed = document.getElementById("nav-feed");
    const navChat = document.getElementById("nav-chat");
    if (navFeed) navFeed.addEventListener("click", () => window.renderView("feed"));
    if (navChat) navChat.addEventListener("click", () => window.renderView("chat"));

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

    if (window.CASUALS && typeof window.CASUALS.whenAuthReady === "function") {
        window.CASUALS.whenAuthReady(window.inicializarAppCompleta);
    } else {
        window.inicializarAppCompleta();
    }
});