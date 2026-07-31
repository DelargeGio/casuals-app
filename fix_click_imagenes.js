document.addEventListener('click', function(e) {
    // Revisamos si lo que se toco es una imagen o un enlace de imagen
    let elemento = e.target;
    let enlace = elemento.closest('a');

    if ((elemento.tagName === 'IMG' && elemento.src.startsWith('data:image')) || 
        (enlace && enlace.href.startsWith('data:image'))) {
        
        // Evitamos que Chrome intente abrir la pantalla negra
        e.preventDefault();
        
        // Creamos el visor flotante si no existe
        let visor = document.getElementById('visor-flotante');
        if (!visor) {
            visor = document.createElement('div');
            visor.id = 'visor-flotante';
            visor.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; justify-content:center; align-items:center;';
            
            let img = document.createElement('img');
            img.id = 'visor-img';
            img.style.cssText = 'max-width:95%; max-height:95%; border-radius:8px; border:1px solid #00f2ff; box-shadow: 0 0 15px rgba(0,242,255,0.2);';
            
            visor.appendChild(img);
            document.body.appendChild(visor);
            
            // Al tocar el fondo oscuro, se cierra el visor
            visor.onclick = function() {
                visor.style.display = 'none';
            };
        }
        
        // Le pasamos la imagen al visor y lo mostramos
        let source = elemento.tagName === 'IMG' ? elemento.src : enlace.href;
        document.getElementById('visor-img').src = source;
        visor.style.display = 'flex';
    }
});
