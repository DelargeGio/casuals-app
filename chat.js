// ==========================================
// CHAT Y PRESENCIA UNIFICADO (Fuente de verdad)
// ==========================================

function obtenerColorUsuario(nombreOriginal) {
    const nombre = (nombreOriginal || "").toLowerCase().trim();
    if (nombre.includes("calavera")) return "#00FF66";
    if (nombre.includes("apple")) return "#FF0055";
    if (nombre.includes("pelu")) return "#D2691E";
    if (nombre.includes("manu")) return "#00F2FF";
    if (nombre.includes("gio")) return "#FF5E00";
    return "#00F2FF"; 
}

function obtenerIconoUsuario(nombreOriginal) {
    const nombre = (nombreOriginal || "").toLowerCase().trim();
    if (nombre.includes("calavera")) return "☠️";
    if (nombre.includes("apple")) return "🍎";
    if (nombre.includes("pelu")) return "🧸";
    if (nombre.includes("manu")) return "🇦🇷";
    if (nombre.includes("gio")) return "🤹🏽";
    return "👤"; 
}

window.enviarMensaje = function() {
    const input = document.getElementById("chat-in");
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    // Llave unificada y correcta
    const usuario = localStorage.getItem("usuario_nombre") || "Anónimo";
    
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
};

window.cargarMensajes = function() {
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
            
            const div = document.createElement("div");
            div.style.margin = "8px";
            div.style.padding = "8px";
            div.style.background = "#222";
            div.style.borderRadius = "5px";
            div.style.borderLeft = `4px solid ${colorUser}`;
            
            div.innerHTML = `
                <span style="color: ${colorUser}; font-weight: bold;">${iconoUser} ${msg.autor}</span>
                <p style="margin: 4px 0; color: #fff;">${msg.texto}</p>
                <span style="font-size: 10px; color: #888;">${msg.tiempo || ""}</span>
            `;
            lista.appendChild(div);
        });
        lista.scrollTop = lista.scrollHeight;
    });
};

window.iniciarPresencia = function() {
    if (typeof firebase === 'undefined') return;
    
    // Llave unificada y correcta
    const usuario = localStorage.getItem("usuario_nombre");
    if (!usuario) {
        console.warn("⚠️ No hay usuario_nombre para la presencia.");
        return;
    }

    const idUsuarioLimpio = usuario.replace(/[.#$\/\[\]]/g, '_');

    const conexionRef = firebase.database().ref('.info/connected');
    const presenciaRef = firebase.database().ref('presencia/' + idUsuarioLimpio);

    conexionRef.on('value', (snapshot) => {
        if (snapshot.val() === true) {
            presenciaRef.onDisconnect().remove();
            presenciaRef.set({
                nombre: usuario,
                conectado: true,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).catch(err => console.error("Error al escribir presencia:", err));
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
            if (userObj && userObj.nombre) {
                const icono = obtenerIconoUsuario(userObj.nombre);
                const color = obtenerColorUsuario(userObj.nombre);
                htmlNombres += `<span style="color: ${color}; margin-right: 10px; font-weight: bold;">${icono} ${userObj.nombre}</span>`;
            }
        });
        contenedorNombres.innerHTML = htmlNombres || "Ninguno conectado";
    }, (error) => {
        console.error("Error al leer la presencia:", error);
    });
};
