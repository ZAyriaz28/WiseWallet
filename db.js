// Crear la base de datos llamada "MiAppFinanzas"
const db = new Dexie("MiAppFinanzas");

// Definir las tablas
// "config" guardará el nombre del usuario
// "transacciones" guardará gastos e ingresos (++id es para que sea autoincrementable)
db.version(1).stores({
    config: 'clave, valor',
    transacciones: '++id, tipo, concepto, monto, fecha'
});

async function guardarNombre(nombre) {
    await db.config.put({ clave: 'nombreUsuario', valor: nombre });
    window.location.href = "dashboard.html"; // Redirigir al dashboard
}

async function guardarNombre(nombre) {
    await db.config.put({ clave: 'nombreUsuario', valor: nombre });
    window.location.href = "dashboard.html"; // Redirigir al dashboard
}

async function agregarRegistro(tipo, concepto, monto) {
    await db.transacciones.add({
        tipo: tipo, // "gasto" o "entrada"
        concepto: concepto,
        monto: parseFloat(monto),
        fecha: new Date().toISOString()
    });
    actualizarInterfaz(); // Función para volver a dibujar la lista en pantalla
}

async function actualizarInterfaz() {
    // Obtener todos los registros de la base de datos
    const registros = await db.transacciones.toArray();
    
    // Aquí limpias tu contenedor de la lista y haces un .forEach para mostrar los datos
    const listaUI = document.getElementById('lista-registros');
    listaUI.innerHTML = ""; 

    registros.forEach(reg => {
        listaUI.innerHTML += `<li>${reg.concepto} - $${reg.monto} (${reg.tipo})</li>`;
    });
}

// Llamar al cargar la página
window.onload = async () => {
    // También recuperar el nombre para el saludo
    const user = await db.config.get('nombreUsuario');
    document.getElementById('saludo').innerText = `Hola, ${user.valor}`;
    
    actualizarInterfaz();
};
