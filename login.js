// ==========================================
// LOGIN.JS - CORREGIDO PARA MÓVIL Y EJECUCIÓN INMEDIATA
// ==========================================

let pinIngresado = "";

const ACCESOS_VALIDOS = {
    "1111": "Apple 🍎",
    "2222": "Calavera ☠️",
    "3333": "Pelu 🧸",
    "4444": "Manu 🇦🇷",
    "5555": "GioDelarge 🤹🏽"
};

(function() {
    const sesionActiva = localStorage.getItem("sesion_activa");
    const usuarioGuardado = localStorage.getItem("usuario_nombre");
    
    if (!(sesionActiva === "true" && usuarioGuardado && Object.values(ACCESOS_VALIDOS).includes(usuarioGuardado))) {
        localStorage.clear();
    }
})();

function entrarAlaApp() {
    if (window.CASUALS && typeof window.CASUALS.whenAuthReady === "function") {
        window.CASUALS.whenAuthReady(() => {
            if (typeof iniciarPresencia === "function") iniciarPresencia();
            if (typeof cargarMensajes === "function") cargarMensajes();
            if (typeof renderView === "function") renderView("feed");
        });
    } else {
        if (typeof iniciarPresencia === "function") iniciarPresencia();
        if (typeof cargarMensajes === "function") cargarMensajes();
        if (typeof renderView === "function") renderView("feed");
    }
}

function inicializarLogin() {
    const sesionActiva = localStorage.getItem("sesion_activa");
    const usuarioGuardado = localStorage.getItem("usuario_nombre");
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");

    if (sesionActiva === "true" && usuarioGuardado && Object.values(ACCESOS_VALIDOS).includes(usuarioGuardado)) {
        if (loginScreen) loginScreen.style.display = "none";
        if (appScreen) appScreen.style.display = "flex";
        entrarAlaApp();
    } else {
        if (loginScreen) loginScreen.style.display = "flex";
        if (appScreen) appScreen.style.display = "none";
    }

    const tecladoGrid = document.getElementById("teclado-login");
    if (tecladoGrid && !tecladoGrid.dataset.listenerConfigured) {
        tecladoGrid.dataset.listenerConfigured = "true";
        
        tecladoGrid.addEventListener("pointerdown", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            
            if (btn.id === "btn-ok-pin") {
                window.verificarPinManual();
                return;
            }

            const digito = btn.getAttribute("data-digito");
            if (digito) {
                window.anadirDigito(digito);
            }
        });
    }

    const btnOk = document.getElementById("btn-ok-pin");
    if (btnOk && !btnOk.dataset.listenerConfigured) {
        btnOk.dataset.listenerConfigured = "true";
        btnOk.addEventListener("pointerdown", () => {
            if (typeof window.verificarPinManual === "function") window.verificarPinManual();
        });
    }

    const btnSalir = document.getElementById("nav-salir");
    if (btnSalir && !btnSalir.dataset.listenerConfigured) {
        btnSalir.dataset.listenerConfigured = "true";
        btnSalir.addEventListener("click", () => {
            if (typeof window.cerrarSesion === "function") window.cerrarSesion();
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarLogin);
} else {
    inicializarLogin();
}

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
            punto.style.background = "var(--neon-azul, #00f3ff)";
            punto.style.boxShadow = "0 0 12px var(--neon-azul, #00f3ff)";
        } else {
            punto.classList.remove("activo");
            punto.style.background = "";
            punto.style.boxShadow = "none";
        }
    });
}

window.verificarPinManual = function() {
    const errorBox = document.getElementById("error-pin-box");

    if (ACCESOS_VALIDOS[pinIngresado]) {
        const usuarioActivo = ACCESOS_VALIDOS[pinIngresado];
        
        localStorage.setItem("sesion_activa", "true");
        localStorage.setItem("usuario_nombre", usuarioActivo);

        const loginScreen = document.getElementById("login-screen");
        const appScreen = document.getElementById("app-screen");

        if (loginScreen) loginScreen.style.display = "none";
        if (appScreen) appScreen.style.display = "flex";
        
        entrarAlaApp();
    } else {
        if (errorBox) errorBox.style.display = "block";
        window.limpiarPin();
    }
};

window.cerrarSesion = function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
};
