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
