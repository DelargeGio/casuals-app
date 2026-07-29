// ===============================
// panic.js - CASUALS v2.0
// Botón de emergencia A.C.A.B.
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const boton = document.querySelector(".panic-btn");
    if (!boton) return;
    boton.addEventListener("click", activarPanico);
});

function activarPanico() {
    const usuario = localStorage.getItem("casuals_user");
    if (!usuario) return;

    const confirmar = confirm("⚠️ ¿Enviar alerta de emergencia con tu ubicación?");
    if (!confirmar) return;

    if (!navigator.geolocation) {
        enviarAlerta(usuario, null, null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            enviarAlerta(usuario, posicion.coords.latitude, posicion.coords.longitude);
        },
        () => {
            enviarAlerta(usuario, null, null);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function enviarAlerta(usuario, lat, lng) {
    const datos = {
        usuario,
        fecha: firebase.database.ServerValue.TIMESTAMP,
        activa: true
    };

    if (lat !== null && lng !== null) {
        datos.latitud = lat;
        datos.longitud = lng;
        datos.maps = `https://maps.google.com/?q=${lat},${lng}`;
    }

    const database = typeof db !== 'undefined' ? db : firebase.database();

    database.ref("alertas").push(datos)
        .then(() => {
            alert("🚨 Alerta enviada.");
        })
        .catch((error) => {
            console.error(error);
            alert("Error al enviar la alerta de pánico.");
        });
}
