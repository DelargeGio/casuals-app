// ======================================
// CONFIGURACIÓN DE IDENTIDAD Y COLORES NEÓN (BLINDADO)
// ======================================

function obtenerColorUsuario(nombreOriginal) {
    const nombre = (nombreOriginal || "").toLowerCase().trim();
    
    if (nombre.includes("calavera")) return "#00FF66";    // Verde Neón
    if (nombre.includes("apple")) return "#FF0055";       // Roja Neón
    if (nombre.includes("pelu")) return "#D2691E";        // Café Neón
    if (nombre.includes("manu")) return "#00F2FF";        // Azul Neón
    if (nombre.includes("gio") || nombre.includes("giodelarge")) return "#FF5E00";  // Naranja Radioactivo
    
    return "#00F2FF"; 
}

function obtenerIconoUsuario(nombreOriginal) {
    const nombre = (nombreOriginal || "").toLowerCase().trim();
    
    if (nombre.includes("calavera")) return "☠️";
    if (nombre.includes("apple")) return "🍎";
    if (nombre.includes("pelu")) return "🧸";
    if (nombre.includes("manu")) return "🇺🇦";
    if (nombre.includes("gio") || nombre.includes("giodelarge")) return "🤹🏽";
    
    return "👤"; 
}

// ======================================
// EFECTO AUDIO Y ZUMBIDO DE BENGALA
// ======================================

function reproducirEfectoBengala() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }

    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const bufferSize = audioCtx.sampleRate * 1.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 1.5);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    } catch (e) {
        console.log("Audio contextual no soportado o bloqueado por navegador", e);
    }

    const appScreen = document.getElementById("app-screen");
    if (appScreen) {
        appScreen.classList.add("bengala-effect-anim");
        setTimeout(() => {
            appScreen.classList.remove("bengala-effect-anim");
        }, 800);
    }
}

// ======================================
// FUNCIONES DE ENVÍO Y ACCIONES DE CHAT
// ======================================

function enviarMensaje() {
    const input = document.getElementById("chat-in");
    if (!input) {
        console.error("No se encontró el input #chat-in");
        return;
    }
    const texto = input.value.trim();
    if (!texto) return;

    const usuario = localStorage.getItem("casuals_user") || "Anónimo";
    
    if (typeof firebase !== 'undefined') {
        const dbRef = firebase.database().ref('mensajes');
        dbRef.push({
            autor: usuario,
            texto: texto,
            tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    }
    
    input.value = "";
    if (typeof vibrar === "function") vibrar(30);
}

function activarBengalaYHumio() {
    reproducirEfectoBengala();
}

function activarAlertaACAB() {
    const usuario = localStorage.getItem("casuals_user") || "Anónimo";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const linkMapa = `https://www.google.com/maps?q=${lat},${lng}`;
            
            if (typeof firebase !== 'undefined') {
                firebase.database().ref('mensajes').push({
                    autor: usuario,
                    texto: `🚨 ¡ALERTA A.C.A.B.! 🚨 Ubicación exacta: ${linkMapa}`,
                    tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    timestamp: Date.now()
                });
            }
        }, () => {
            alert("No se pudo obtener la ubicación o estás en entorno local sin HTTPS.");
        });
    }
}

// ======================================
// PROCESADOR DE MULTIMEDIA BLINDADO (SHORTS Y VIDEOS)
// ======================================

function procesarContenidoMensaje(texto) {
    if (!texto) return '';

    let htmlModificado = texto;

    const ytShortsRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytShortsRegex.test(texto)) {
        ytShortsRegex.lastIndex = 0;
        htmlModificado = htmlModificado.replace(ytShortsRegex, (match, videoId) => {
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${match}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${match}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
        return htmlModificado;
    }

    const ytNormalRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
    if (ytNormalRegex.test(texto)) {
        ytNormalRegex.lastIndex = 0;
        htmlModificado = htmlModificado.replace(ytNormalRegex, (match, videoId) => {
            return `
                <div class="texto-mensaje" style="margin-bottom: 6px; word-break: break-all;">
                    <a href="${match}" target="_blank" style="color: var(--neon-azul); text-decoration: underline;">${match}</a>
                </div>
                <div class="multimedia-box" style="margin-top: 8px;">
                    <iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                    </iframe>
                </div>
            `;
        });
        return htmlModificado;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    htmlModificado = htmlModificado.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" style="color: var(--neon-azul); text-decoration: underline; word-break: break-all;">${url}</a>`;
    });

    return `<p class="texto-mensaje">${htmlModificado}</p>`;
}

function cargarMensajes() {
    const lista = document.getElementById("mensajes-lista");
    if (!lista) return;

    if (typeof firebase === 'undefined') return;

    const dbRef = firebase.database().ref('mensajes').limitToLast(100);
    dbRef.on('value', (snapshot) => {
        lista.innerHTML = "";
        const data = snapshot.val();
        if (!data) return;

        Object.keys(data).forEach((key) => {
            const msg = data[key];
            if (!msg || !msg.autor) return;

            const colorUser = obtenerColorUsuario(msg.autor);
            const iconoUser = obtenerIconoUsuario(msg.autor);
            
            const usuarioActual = localStorage.getItem("casuals_user");
            const esMio = msg.autor === usuarioActual;
            const claseWrapper = esMio ? "mensaje-wrapper derecha" : "mensaje-wrapper izquierda";

            const contenidoHtml = procesarContenidoMensaje(msg.texto);

            const div = document.createElement("div");
            div.className = claseWrapper;
            
            div.innerHTML = `
                <div class="burbuja-industrial" style="border-left: 4px solid ${colorUser} !important;">
                    <span class="autor-tag" style="color: ${colorUser} !important;">${iconoUser} ${msg.autor}</span>
                    ${contenidoHtml}
                    <span class="mensaje-tiempo">${msg.tiempo || ""}</span>
                </div>
            `;
            lista.appendChild(div);
        });
        lista.scrollTop = lista.scrollHeight;
    });
}

// ======================================
// GESTIÓN DE PRESENCIA EN TIEMPO REAL
// ======================================
function iniciarPresencia() {
    if (typeof firebase === 'undefined') return;
    const usuario = localStorage.getItem("casuals_user");
    if (!usuario) return;

    const conexionRef = firebase.database().ref('.info/connected');
    const presenciaRef = firebase.database().ref('presencia/' + usuario.replace(/[.#$\/\[\]]/g, '_'));

    conexionRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            presenciaRef.onDisconnect().remove();
            presenciaRef.set({
                nombre: usuario,
                conectado: true,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }
    });

    firebase.database().ref('presencia').on('value', (snapshot) => {
        const contenedorNombres = document.getElementById("lista-nombres-conectados");
        if (!contenedorNombres) return;

        const conectados = snapshot.val();
        if (!conectados) {
            contenedorNombres.innerHTML = "Ninguno conectado";
            return;
        }

        let htmlNombres = "";
        Object.keys(conectados).forEach(key => {
            const userObj = conectados[key];
            const icono = obtenerIconoUsuario(userObj.nombre);
            const color = obtenerColorUsuario(userObj.nombre);
            htmlNombres += `<span style="color: ${color} !important; margin-right: 10px; font-weight: bold;">${icono} ${userObj.nombre}</span>`;
        });
        contenedorNombres.innerHTML = htmlNombres;
    });
}

// Exponer funciones globalmente
window.obtenerColorUsuario = obtenerColorUsuario;
window.obtenerIconoUsuario = obtenerIconoUsuario;
window.enviarMensaje = enviarMensaje;
window.activarBengalaYHumio = activarBengalaYHumio;
window.activarAlertaACAB = activarAlertaACAB;
window.cargarMensajes = cargarMensajes;
window.iniciarPresencia = iniciarPresencia;

// ======================================
// SCRIPT.JS - ROUTER MAESTRO FLEX
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
                feedCont.style.display = 'block';
            }
            if (typeof window.renderFeedContainer === 'function') {
                window.renderFeedContainer();
            }
            break;
            
        case 'chat':
            if (msjCont) {
                // Restauramos display flex para que el chat y los botones del CSS original seacomoden bien
                msjCont.style.display = 'flex';
                msjCont.style.flexDirection = 'column';
                // Limpiamos cualquier posición absoluta forzada
                msjCont.style.position = '';
                msjCont.style.top = '';
                msjCont.style.bottom = '';
                msjCont.style.left = '';
                msjCont.style.right = '';
            }
            cargarMensajes();
            iniciarPresencia();
            break;

        default:
            console.warn(`Vista desconocida: ${view}`);
            break;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("⚡ CASUALS CORE // Sistema inicializado correctamente.");
    setTimeout(() => {
        cargarMensajes();
        iniciarPresencia();
    }, 300);
});
