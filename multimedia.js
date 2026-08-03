// ==========================================
// MULTIMEDIA.JS - SUBIDA INSTANTÁNEA Y REPRODUCCIÓN FLUIDA
// ==========================================

window.enviarArchivoLocal = function(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const autor = localStorage.getItem("usuario_nombre") || "Anónimo";
    const tiempo = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Limpiar input de inmediato para máxima fluidez
    event.target.value = "";

    // Subida a Firebase Storage en segundo plano
    const storageRef = firebase.storage().ref();
    const rutaArchivo = 'casuals_media/' + Date.now() + '_' + archivo.name;
    const archivoRef = storageRef.child(rutaArchivo);

    archivoRef.put(archivo)
        .then((snapshot) => {
            return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
            let contenidoHtml = "";
            if (archivo.type.startsWith("video/")) {
                contenidoHtml = `<div class="multimedia-box"><video controls playsinline preload="metadata" src="${downloadURL}"></video></div>`;
            } else {
                contenidoHtml = `<div class="multimedia-box"><img src="${downloadURL}" alt="Imagen"></div>`;
            }

            // Enviar a la base de datos una vez subido con éxito
            return firebase.database().ref('mensajes').push({
                autor: autor,
                texto: contenidoHtml,
                esHtml: true,
                tiempo: tiempo,
                timestamp: Date.now()
            });
        })
        .catch((error) => {
            console.error("❌ Error al subir archivo multimedia:", error);
            alert("No se pudo subir el archivo multimedia.");
        });
};
