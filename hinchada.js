// ======================================
// HINCHADA.JS - MÓDULO DE CÁNTICOS Y AGENDA
// ======================================

const canticosHinchada = [
    {
        titulo: "Dale alegría a mi corazón",
        letra: "Dale alegría, alegría a mi corazón,\nlo único que te pido es ser campeón...\nya no importa en qué cancha juguemos,\nla vuelta queremos dar."
    },
    {
        titulo: "Muchachos, esta noche cuueste lo que cueste",
        letra: "Muchachos, esta noche cueste lo que cueste,\nmuchachos, la medalla nos tenemos que llevar...\nhuevos, ¡pongan más huevos!\npara salir primeros y a la 12 festejar."
    }
];

const eventosHinchada = [
    {
        titulo: "Tokin en el Barrio",
        lugar: "Centro Cultural / Zona Norte",
        hora: "Sábado, 8:00 PM",
        mapaUrl: "https://maps.google.com/?q=Ecatepec"
    }
];

function renderizarModuloHinchada() {
    return `
        <div id="hinchada-view" style="padding: 12px; color: #fff; font-family: monospace;">
            <h2 style="color: var(--oro); border-bottom: 2px solid var(--neon-rojo); padding-bottom: 6px; margin-bottom: 12px;">🏴‍☠️ LA TRIBUNA & AGENDA</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--neon-azul); margin-bottom: 8px;">🎶 Cancionero</h3>
                ${canticosHinchada.c.map(c => `
                    <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--neon-azul); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
                        <h4 style="color: var(--oro); margin: 0 0 6px 0;">${c.titulo}</h4>
                        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #ddd; margin: 0;">${c.letra}</pre>
                    </div>
                `).join('')}
            </div>

            <div>
                <h3 style="color: var(--neon-azul); margin-bottom: 8px;">📍 Próximos Tokins / Reuniones</h3>
                ${eventosHinchada.map(e => `
                    <div style="background: rgba(0,0,0,0.6); border: 1px solid var(--oro); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
                        <h4 style="color: var(--neon-rojo); margin: 0 0 4px 0;">${e.titulo}</h4>
                        <p style="margin: 2px 0; font-size: 13px;"><strong>Lugar:</strong> ${e.lugar}</p>
                        <p style="margin: 2px 0; font-size: 13px;"><strong>Hora:</strong> ${e.hora}</p>
                        <a href="${e.mapaUrl}" target="_blank" style="display: inline-block; margin-top: 6px; color: var(--neon-azul); text-decoration: underline; font-size: 13px;">Ver ubicación exacta 🗺️</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.renderizarModuloHinchada = renderizarModuloHinchada;
