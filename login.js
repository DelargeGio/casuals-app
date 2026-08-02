// ==========================================
// CASUALS - Lógica de Login Oficial (Con Presencia y Chat Automáticos)
// ==========================================

let pinIngresado = "";

// Diccionario oficial de accesos de 4 dígitos
const ACCESOS_VALIDOS = {
    "1111": "Apple 🍎",
    "2222": "Calavera ☠️",
    "3333": "Pelu 🧸",
    "4444": "Manu 🇦🇷",
    "5555": "GioDelarge 🤹🏽"
};

document.addEventListener("DOMContentLoaded", () => {
    // Verificar si ya hay una sesión activa guardada
    const sesionActiva = localStorage.getItem("sesion_activa");
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");

    if (sesionActiva === "true") {
        if (loginScreen) loginScreen.style.display = "none";
        if (appScreen) appScreen.style.display = "flex";
        console.log("🔓 Sesión restaurada automáticamente.");

        // Disparar funciones de red al restaurar sesión
        if (typeof iniciarPresencia === "function") iniciarPresencia();
        if (typeof cargarMensajes === "function") cargarMensajes();
        if (typeof renderView === "function") renderView("feed");
    } else {
        if (loginScreen) loginScreen.style.display = "flex";
        if (appScreen) appScreen.style.display = "none";
    }
});

// Función para manejar los botones del teclado numérico ("0"-"9", "C")
window.anadirDigito = function(valor) {
    const errorBox = document.getElementById("error-pin-box");
    if (errorBox) errorBox.style.display = "none";

    if (valor === "C") {
        window.limpiarPin();
        return;
    }

    if (pinIngresado.length < 4) {
        pinIngresado += String(valor);
        actualizarVisualizadorPin();
    }
};

window.limpiarPin = function() {
    pinIngresado = "";
    actualizarVisualizadorPin();
    const errorBox = document.getElementById("error-pin-box");
    if (errorBox) errorBox.style.display = "none";
};

function actualizarVisualizadorPin() {
    const puntos = document.querySelectorAll("#pin-display .pin-dot");
    puntos.forEach((punto, index) => {
        if (index < pinIngresado.length) {
            punto.classList.add("activo");
            punto.style.background = "var(--neon-azul, #0ff)";
        } else {
            punto.classList.remove("activo");
            punto.style.background = "";
        }
    });
}

// Validación manual obligatoria al presionar el botón OK
window.verificarPinManual = function() {
    const errorBox = document.getElementById("error-pin-box");

    if (ACCESOS_VALIDOS[pinIngresado]) {
        const usuarioActivo = ACCESOS_VALIDOS[pinIngresado];
        
        const loginScreen = document.getElementById("login-screen");
        const appScreen = document.getElementById("app-screen");

        if (loginScreen) loginScreen.style.display = "none";
        if (appScreen) appScreen.style.display = "flex";

        localStorage.setItem("sesion_activa", "true");
        localStorage.setItem("usuario_nombre", usuarioActivo);
        console.log(`🔓 Acceso concedido para: ${usuarioActivo}`);
        
        // 🟢 Activar presencia y cargar mensajes de inmediato al entrar
        if (typeof iniciarPresencia === "function") {
            iniciarPresencia();
        }
        if (typeof cargarMensajes === "function") {
            cargarMensajes();
        }
        if (typeof renderView === "function") {
            renderView("feed");
        }
    } else {
        if (errorBox) {
            errorBox.style.display = "block";
        }
        window.limpiarPin();
    }
};

// Función para cerrar sesión y regresar al login
window.cerrarSesion = function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
};
