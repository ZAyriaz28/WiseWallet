document.addEventListener('DOMContentLoaded', async () => {
    const db = new Dexie("MiAppFinanzas");
    db.version(1).stores({
        config: 'clave, valor',
        transacciones: '++id, tipo, concepto, monto, fecha'
    });

    const actualizarInterfaz = async () => {
        // Recuperar moneda
        const monedaDoc = await db.config.get('moneda');
        const simbolo = monedaDoc ? monedaDoc.valor : 'C$'; // Si no hay, forzamos C$
        
        const registros = await db.transacciones.toArray();
        const listBody = document.getElementById('list-body');
        if (!listBody) return;

        listBody.innerHTML = "";
        let inc = 0, exp = 0;

        registros.reverse().forEach(reg => {
            const m = parseFloat(reg.monto) || 0;
            const esIngreso = reg.tipo === 'ingreso' || reg.tipo === 'entrada';
            if (esIngreso) inc += m; else exp += m;

            listBody.innerHTML += `
                <tr class="align-middle border-transparent">
                    <td><div class="rounded-circle p-2 text-center ${esIngreso ? 'bg-success text-white' : 'bg-danger text-white'}" style="width:35px; height:35px; line-height:18px"><i class="fas ${esIngreso?'fa-plus':'fa-minus'} small"></i></div></td>
                    <td><span class="fw-bold d-block text-capitalize">${reg.concepto}</span><small class="text-muted text-uppercase" style="font-size:10px">${reg.tipo}</small></td>
                    <td class="${esIngreso?'text-success':'text-danger'} fw-bold text-end">
                        ${esIngreso ? '+' : '-'}${simbolo}${m.toFixed(2)}
                    </td>
                    <td class="text-end"><button onclick="borrar(${reg.id})" class="btn btn-link text-muted"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
        });

        // Totales con el símbolo correcto
        document.getElementById('inc-val').innerText = `${simbolo}${inc.toFixed(2)}`;
        document.getElementById('exp-val').innerText = `${simbolo}${exp.toFixed(2)}`;
        
        const bal = inc - exp;
        document.getElementById('bal-val').innerText = `${simbolo}${bal.toFixed(2)}`;
        
        // Cambio de color dinámico del cuadro de Balance
        const balCard = document.getElementById('bal-card');
        if (balCard) balCard.style.backgroundColor = bal < 0 ? '#fdecea' : '#eafaf1';
    };

    document.getElementById('finance-form').onsubmit = async (e) => {
        e.preventDefault();
        await db.transacciones.add({
            tipo: document.getElementById('type').value,
            concepto: document.getElementById('concept').value,
            monto: parseFloat(document.getElementById('amount').value) || 0,
            fecha: new Date().toISOString()
        });
        e.target.reset();
        actualizarInterfaz();
    };

    window.borrar = async (id) => {
        if(confirm("¿Eliminar este registro?")) {
            await db.transacciones.delete(id);
            actualizarInterfaz();
        }
    };

    const userDoc = await db.config.get('nombreUsuario');
    if (userDoc) document.getElementById('user-greeting').innerText = `Hola, ${userDoc.valor}`;
    
    actualizarInterfaz();
});

// Función para el botón Salir
function logout() {
    window.location.href = 'index.html';
}