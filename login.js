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
