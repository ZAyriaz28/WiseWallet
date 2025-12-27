// CONFIGURACIÓN OFICIAL DE TU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyALC-dHgu5KAgpr0G0d6VfDacHZw3hDJzs",
    authDomain: "wisewallet-18e98.firebaseapp.com",
    projectId: "wisewallet-18e98",
    storageBucket: "wisewallet-18e98.firebasestorage.app",
    messagingSenderId: "567441749008",
    appId: "1:567441749008:web:ed69d680b4f8a61c068695",
    measurementId: "G-84SYLF05Z9"
};

// Inicializar Firebase (Nube)
firebase.initializeApp(firebaseConfig);
const dbCloud = firebase.firestore();

// Conectar con la base local que creaste en db.js
// Asumimos que la variable se llama 'db'
document.addEventListener('DOMContentLoaded', async () => {
    
    const actualizarInterfaz = async () => {
        // BUSCAR MONEDA O FORZAR C$
        const monedaDoc = await db.config.get('moneda');
        const simbolo = (monedaDoc && monedaDoc.valor) ? monedaDoc.valor : 'C$';
        
        const registros = await db.transacciones.toArray();
        const listBody = document.getElementById('list-body');
        if (!listBody) return;

        listBody.innerHTML = "";
        let inc = 0, exp = 0;

        registros.reverse().forEach(reg => {
            const m = parseFloat(reg.monto) || 0;
            const esInc = reg.tipo === 'ingreso' || reg.tipo === 'entrada';
            if (esInc) inc += m; else exp += m;

            listBody.innerHTML += `
                <tr class="align-middle">
                    <td><div class="rounded-circle p-2 text-center ${esInc ? 'bg-success text-white' : 'bg-danger text-white'}" style="width:35px; height:35px; line-height:18px"><i class="fas ${esInc?'fa-plus':'fa-minus'} small"></i></div></td>
                    <td><span class="fw-bold d-block text-capitalize">${reg.concepto}</span><small class="text-muted text-uppercase" style="font-size:10px">${reg.tipo}</small></td>
                    <td class="${esInc?'text-success':'text-danger'} fw-bold text-end">
                        ${esInc ? '+' : '-'}${simbolo}${m.toFixed(2)}
                    </td>
                    <td class="text-end">
                        <button onclick="borrarRegistro(${reg.id}, '${reg.fecha}')" class="btn btn-link text-muted p-0"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>`;
        });

        // Actualizar los 3 cuadros grandes
        document.getElementById('inc-val').innerText = `${simbolo}${inc.toFixed(2)}`;
        document.getElementById('exp-val').innerText = `${simbolo}${exp.toFixed(2)}`;
        document.getElementById('bal-val').innerText = `${simbolo}${(inc - exp).toFixed(2)}`;
    };

    // GUARDAR EN AMBOS LADOS
    document.getElementById('finance-form').onsubmit = async (e) => {
        e.preventDefault();
        const userDoc = await db.config.get('nombreUsuario');
        const nuevo = {
            tipo: document.getElementById('type').value,
            concepto: document.getElementById('concept').value,
            monto: parseFloat(document.getElementById('amount').value) || 0,
            fecha: new Date().toISOString()
        };

        await db.transacciones.add(nuevo); // Local
        
        if (userDoc) {
            // Guardar en la nube automáticamente
            await dbCloud.collection(userDoc.valor).doc(nuevo.fecha).set(nuevo);
        }

        e.target.reset();
        actualizarInterfaz();
    };

    // BORRAR EN AMBOS LADOS
    window.borrarRegistro = async (id, fechaDoc) => {
        if(confirm("¿Eliminar movimiento?")) {
            const userDoc = await db.config.get('nombreUsuario');
            await db.transacciones.delete(id);
            if (userDoc) {
                await dbCloud.collection(userDoc.valor).doc(fechaDoc).delete();
            }
            actualizarInterfaz();
        }
    };

    // CARGA INICIAL Y SALUDO
    const userDoc = await db.config.get('nombreUsuario');
    if (userDoc) {
        document.getElementById('user-greeting').innerText = `Hola, ${userDoc.valor}`;
        
        // Si el navegador está vacío, traer de la nube
        const totalLocal = await db.transacciones.count();
        if (totalLocal === 0) {
            const snapshot = await dbCloud.collection(userDoc.valor).get();
            if (!snapshot.empty) {
                const datosNube = snapshot.docs.map(doc => doc.data());
                await db.transacciones.bulkAdd(datosNube);
            }
        }
    }
    
    actualizarInterfaz();
});