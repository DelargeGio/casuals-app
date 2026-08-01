// Bypass automático y seguro al feed de trapos y música
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

// Exponer la función cerrarSesion globalmente para que el onclick del HTML la encuentre sin fallas
window.cerrarSesion = function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.pathname; // Recarga limpia de la app
};

// Funciones de respaldo auxiliares para evitar errores de consola
window.verificarAccesoPin = function() { return true; };
window.verificarPinManual = function() { return true; };
window.anadirDigito = function() {};
window.limpiarPin = function() {};
