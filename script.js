// ==========================================
// SCRIPT.JS - MOTOR GENERAL & VISTAS
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
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
};

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

let presenciaYaIniciada = false;
window.iniciarPresencia = function() {
    if (presenciaYaIniciada) return;
    const usuario = localStorage.getItem("usuario_nombre");
    if (!usuario || typeof firebase === 'undefined') return;

    presenciaYaIniciada = true;

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

    const bootstrap = () => {
        if (typeof window.cargarFeed === "function") window.cargarFeed();
        window.iniciarPresencia();
        if (typeof window.iniciarEscuchaZumbidos === "function") window.iniciarEscuchaZumbidos();
    };

    if (window.CASUALS && typeof window.CASUALS.whenAuthReady === "function") {
        window.CASUALS.whenAuthReady(bootstrap);
    } else {
        bootstrap();
    }
});
