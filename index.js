// index.js

const loginForm = document.getElementById('login-form');

// 1. Verificar si ya hay datos guardados al cargar la página
window.onload = async () => {
    const nombreGuardado = await db.config.get('nombreUsuario');
    if (nombreGuardado) {
        // Si ya existe el nombre, saltamos al dashboard automáticamente
        window.location.href = 'dashboard.html';
    }
};

// 2. Manejar el envío del formulario
loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('name').value;
    const moneda = document.getElementById('currency-select').value;

    try {
        // Guardamos en nuestra tabla "config" de IndexedDB
        await db.config.put({ clave: 'nombreUsuario', valor: nombre });
        await db.config.put({ clave: 'moneda', valor: moneda });

        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Error al guardar en la DB:", error);
        alert("Hubo un error al guardar tus datos localmente.");
    }
};

// Lógica de la PWA (Service Worker e Instalación)
let deferredPrompt;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker registrado"));
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
        if (confirm("¿Quieres instalar WiseWallet en tu pantalla de inicio?")) {
            if (deferredPrompt) {
                deferredPrompt.prompt();
            }
        }
    }, 3000);
});