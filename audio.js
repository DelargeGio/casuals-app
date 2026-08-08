window._audioHumoSingleton = window._audioHumoSingleton || new Audio();
// Pon tu mp3 en /sounds/humo.mp3 y base64 como fallback
window._audioHumoSingleton.src = './sounds/humo.mp3';
window._audioHumoSingleton.preload = 'auto';
window._audioHumoSingleton.volume = 0.7;

function dispararEfectoUnicoHumo() {
    const audio = window._audioHumoSingleton;
    if(!audio.src || audio.src.endsWith('/')) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(()=>{ /* silenciado hasta interacción */ });
}
function inicializarBotonHumoGlobal() {
    const btn = document.getElementById('btn-bengala-humo');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dispararEfectoUnicoHumo();
    }, { once: false });
}
document.addEventListener('DOMContentLoaded', inicializarBotonHumoGlobal);
window.reengancharBotonHumo = inicializarBotonHumoGlobal;