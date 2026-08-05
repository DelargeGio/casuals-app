// ==========================================
// AUDIO.JS - GESTOR ÚNICO DE EFECTOS (SINGLETON)
// ==========================================

window._audioHumoSingleton = window._audioHumoSingleton || new Audio();
window._audioHumoSingleton.src = ''; // Recuerda poner aquí tu ruta de audio o cadena Base64

function dispararEfectoUnicoHumo() {
    const audio = window._audioHumoSingleton;
    audio.pause();
    audio.currentTime = 0;
    
    audio.play().catch(err => {
        console.warn("Reproducción bloqueada por políticas del navegador:", err);
    });
}

function inicializarBotonHumoGlobal() {
    // CORRECCIÓN: Se actualizó el ID para que coincida con el HTML
    const btnHumo = document.getElementById('btn-bengala-humo'); 
    if (!btnHumo) return;

    btnHumo.onclick = function(e) {
        if (e) e.stopPropagation();
        dispararEfectoUnicoHumo();
        console.log("⚡ Efecto de humo activado limpiamente");
    };
}

document.addEventListener('DOMContentLoaded', inicializarBotonHumoGlobal);
window.reengancharBotonHumo = inicializarBotonHumoGlobal;
