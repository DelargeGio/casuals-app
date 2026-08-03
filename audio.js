// ==========================================
// AUDIO.JS - GESTOR ÚNICO DE EFECTOS (SINGLETON)
// ==========================================

// Instancia única global de control de audio para el botón de humo/alerta
window._audioHumoSingleton = window._audioHumoSingleton || new Audio();

// Configura la ruta del archivo de audio (puedes usar una URL directa o formato Base64)
// Ejemplo: window._audioHumoSingleton.src = 'assets/audio/explosion.mp3';
window._audioHumoSingleton.src = ''; // Reemplaza con tu ruta de audio o cadena Base64

function dispararEfectoUnicoHumo() {
    const audio = window._audioHumoSingleton;
    
    // Si ya se está reproduciendo, lo pausamos y regresamos al inicio para un disparo limpio
    audio.pause();
    audio.currentTime = 0;
    
    audio.play().catch(err => {
        console.warn("Reproducción bloqueada por políticas del navegador (requiere interacción previa):", err);
    });
}

// Vinculación automática al botón de la interfaz apenas se cargue la vista
function inicializarBotonHumoGlobal() {
    const btnHumo = document.getElementById('btn-humo');
    if (!btnHumo) return;

    // Usamos onclick directo para sobrescribir y evitar que se dupliquen los eventos
    btnHumo.onclick = function(e) {
        if (e) e.stopPropagation();
        dispararEfectoUnicoHumo();
        
        // Aquí puedes agregar cualquier efecto visual adicional que lleve el botón
        console.log("⚡ Efecto de humo activado limpiamente");
    };
}

// Ejecutar el buscador del botón cuando el DOM o las vistas cambien
document.addEventListener('DOMContentLoaded', inicializarBotonHumoGlobal);

// Por si cargas las vistas de manera dinámica mediante funciones de JS en tu app:
window.reengancharBotonHumo = inicializarBotonHumoGlobal;
