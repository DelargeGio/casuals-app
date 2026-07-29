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
    // Zumbido en dispositivo móvil si está disponible
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Generar sonido de explosión / bengala por Web Audio API sintetizado (sin depender de archivos externos)
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Ruido blanco para la explosión de humo
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

    // Efecto visual de pantalla sacidiéndose (Bengala)
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
    if (!input) return;
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
    const usuario = localStorage.getItem("casuals_user") || "Anónimo";
    
    // Ejecutar sonido y zumbido local y en red si se desea
    reproducirEfectoBengala();

    if (typeof firebase !== 'undefined') {
        firebase.database().ref('mensajes').push({
            autor: usuario,
            texto: "💨 [¡BENGALA DE HUMO ACTIVADA! 🚨]",
            tiempo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    }
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

// Listener para cargar mensajes de Firebase en tiempo real
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

            let contenidoHtml = `<p class="texto-mensaje">${msg.texto}</p>`;
            
            if (msg.texto) {
                let videoId = "";
                if (msg.texto.includes("youtube.com/watch?v=")) {
                    videoId = msg.texto.split("v=")[1]?.split("&")[0];
                } else if (msg.texto.includes("youtu.be/")) {
                    videoId = msg.texto.split("youtu.be/")[1]?.split("?")[0];
                }

                if (videoId) {
                    contenidoHtml = `
                        <p class="texto-mensaje">${msg.texto}</p>
                        <div class="multimedia-box" style="margin-top: 8px;">
                            <iframe width="100%" height="160" src="https://www.youtube.com/embed/${videoId}" 
                                title="YouTube video player" frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen style="border-radius: 6px; border: 1px solid var(--oro);">
                            </iframe>
                        </div>
                    `;
                }
            }

            const div = document.createElement("div");
            div.className = claseWrapper;
            
            // AQUÍ METÍ EL BLINDAJE CON !important PARA EL BORDE Y EL NOMBRE
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

    // Escuchar todos los conectados para mostrarlos en la barra superior
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
            // TAMBIÉN BLINDÉ LOS COLORES DE LOS USUARIOS CONECTADOS AQUÍ ARRIBA
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
window. = iniciarPresencia;
