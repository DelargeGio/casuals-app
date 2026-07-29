// ======================================
// LOGIN.JS - CASUALS v2.0 (ORDENADO)
// ======================================

const usuariosPermitidos = {
    "1111": "Apple",
    "2222": "Calavera",
    "3333": "Pelu",
    "4444": "Manu",
    "5555": "GioDelarge"
};

let pin = "";

window.anadirDigito = (n) => {
    if (n === 'C') {
        clearPin();
        return;
    }
    if (pin.length < 4) {
        pin += n;
        updatePinDisplay();
    }
};

window.clearPin = () => {
    pin = "";
    updatePinDisplay();
};

window.updatePinDisplay = () => {
    const display = document.getElementById('pin-display');
    if (!display) return;
    const dots = display.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < pin.length) {
            dot.classList.add('activo');
        } else {
            dot.classList.remove('activo');
        }
    });
};

function ingresarApp() {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = 'flex';
    
    if (typeof renderView === 'function') {
        renderView('chat');
    } else if (typeof cargarMensajes === 'function') {
        cargarMensajes();
    }

    if (typeof iniciarPresencia === "function") {
        iniciarPresencia();
    }
}

window.verificarPinManual = () => {
    const usuarioEncontrado = usuariosPermitidos[pin];
    if (usuarioEncontrado) {
        localStorage.setItem("casuals_user", usuarioEncontrado);
        ingresarApp();
    } else {
        mostrarErrorPin();
    }
};

function mostrarErrorPin() {
    const errorBox = document.getElementById('error-pin-box');
    if (errorBox) errorBox.style.display = 'block';
    setTimeout(() => {
        if (errorBox) errorBox.style.display = 'none';
        clearPin();
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem("casuals_user");
    if (usuarioGuardado && Object.values(usuariosPermitidos).includes(usuarioGuardado)) {
        ingresarApp();
    }
});

window.cerrarSesion = () => {
    localStorage.removeItem("casuals_user");
    location.reload();
};
