// Bypass automático de acceso para entrar directo al feed
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container") || document.querySelector(".login-view");
    if (loginContainer) {
        loginContainer.style.display = "none";
    }
    const appMain = document.getElementById("app") || document.querySelector("main") || document.body;
    if (appMain) {
        appMain.style.display = "block";
    }
    console.log("🔓 Acceso libre directo al feed y contenido.");
});
let pinActual = "";

function anadirDigito(digito) {
    if (pinActual.length < 4) {
        pinActual += digito;
        actualizarPuntosPin();
    }
}

function limpiarPin() {
    pinActual = "";
    actualizarPuntosPin();
}

function actualizarPuntosPin() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < pinActual.length) {
            dot.classList.add('activo');
        } else {
            dot.classList.remove('activo');
        }
    });
    
    if (pinActual.length === 4) {
        // Aquí validas tu PIN o la lógica que tenías para entrar al feed
        verificarAccesoPin(pinActual);
    }
}
// Bypass automático y limpio para entrar directo al feed de trapos y música
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container") || document.querySelector(".login-view") || document.querySelector(".login-body");
    if (loginContainer) {
        loginContainer.style.display = "none";
    }
    
    const appScreen = document.getElementById("app-screen") || document.getElementById("app") || document.querySelector("main");
    if (appScreen) {
        appScreen.style.display = "flex";
    }
    
    console.log("🔓 Acceso directo y libre al feed de trapos y música.");
});

// Funciones de respaldo para evitar ReferenceError en la consola
function verificarAccesoPin(pin) { return true; }
function verificarPinManual() { return true; }
function anadirDigito(digito) {}
function limpiarPin() {}
// Forzar enlace del botón de salir de manera dinámica
document.addEventListener("DOMContentLoaded", () => {
    const btnSalir = document.getElementById("btn-salir") || document.querySelector(".btn-salir") || document.querySelector("[onclick*='cerrarSesion']") || document.getElementById("salir");
    if (btnSalir) {
        btnSalir.addEventListener("click", (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
});

function cerrarSesion() {
    localStorage.clear();
    location.reload();
}
