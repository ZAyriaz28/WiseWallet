// --- ESTADO DE LA APLICACIÓN ---
let userData = {
    name: "",
    movements: [
        { id: 1, type: "gasto", name: "Netflix", amount: 12, category: "Suscripciones", date: "26/12/2025" },
        { id: 2, type: "gasto", name: "Spotify", amount: 10, category: "Suscripciones", date: "26/12/2025" },
        { id: 3, type: "ingreso", name: "Saldo Inicial", amount: 500, category: "Sueldo", date: "26/12/2025" }
    ],
    isLoggedIn: false
};

// --- ELEMENTOS DEL DOM ---
const welcomeScreen = document.getElementById('welcome-screen');
const mainDashboard = document.getElementById('main-dashboard');
const setupForm = document.getElementById('setup-form');
const financeForm = document.getElementById('finance-form');
const movementsList = document.getElementById('movements-list');

// --- CARGA INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('finanzaData');
    if (savedData) {
        userData = JSON.parse(savedData);
        if (userData.isLoggedIn) {
            showDashboard();
        }
    }
});

// --- LOGIN (Solo nombre) ---
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userData.name = document.getElementById('user-name').value;
    userData.isLoggedIn = true;
    saveAndRefresh();
    showDashboard();
});

// --- REGISTRO DE MOVIMIENTO (Ingreso/Gasto) ---
financeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const movType = document.getElementById('mov-type').value;
    const movAmount = parseFloat(document.getElementById('mov-amount').value);

    const newMov = {
        id: Date.now(),
        type: movType,
        name: document.getElementById('mov-name').value,
        amount: movAmount,
        category: document.getElementById('mov-category').value,
        date: new Date().toLocaleDateString()
    };

    userData.movements.push(newMov);
    financeForm.reset();
    saveAndRefresh();
});

// --- FUNCIONES DE NAVEGACIÓN Y PERSISTENCIA ---
function showDashboard() {
    welcomeScreen.classList.add('d-none');
    mainDashboard.classList.remove('d-none');
    renderAll();
}

function logout() {
    userData.isLoggedIn = false; // Solo cerramos sesión
    localStorage.setItem('finanzaData', JSON.stringify(userData)); // Guardamos antes de irnos
    location.reload();
}

function saveAndRefresh() {
    localStorage.setItem('finanzaData', JSON.stringify(userData));
    renderAll();
}

function deleteMov(id) {
    userData.movements = userData.movements.filter(m => m.id !== id);
    saveAndRefresh();
}

// --- RENDERIZADO Y CÁLCULOS ---
function renderAll() {
    document.getElementById('greeting').innerText = `Hola, ${userData.name}`;

    // Filtrar y Calcular
    const totalIncome = userData.movements
        .filter(m => m.type === 'ingreso')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = userData.movements
        .filter(m => m.type === 'gasto')
        .reduce((sum, m) => sum + m.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Actualizar Tarjetas
    document.getElementById('display-income').innerText = `$${totalIncome.toLocaleString()}`;
    document.getElementById('display-expenses').innerText = `$${totalExpenses.toLocaleString()}`;
    document.getElementById('display-balance').innerText = `$${balance.toLocaleString()}`;

    // Estilo dinámico del Balance (Rojo si es negativo)
    const balanceCard = document.getElementById('balance-card');
    if (balance < 0) {
        balanceCard.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        balanceCard.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
    }

    // Barra de Progreso
    const percent = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
    document.getElementById('budget-progress').style.width = `${percent}%`;
    document.getElementById('progress-text').innerText = `${Math.round(percent)}% utilizado`;

    // Renderizar Tabla (Invertida para ver lo último primero)
    movementsList.innerHTML = '';
    [...userData.movements].reverse().forEach(m => {
        const isIngreso = m.type === 'ingreso';
        movementsList.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="icon-box me-3 ${isIngreso ? 'bg-success-light' : 'bg-danger-light'}">
                            <i class="fas ${isIngreso ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${m.name}</div>
                            <small class="text-muted">${m.date}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-light text-dark border">${m.category}</span></td>
                <td class="${isIngreso ? 'text-success' : 'text-danger'} fw-bold">
                    ${isIngreso ? '+' : '-'}$${m.amount.toLocaleString()}
                </td>
                <td class="text-end">
                    <button onclick="deleteMov(${m.id})" class="btn btn-link text-muted p-0 shadow-none">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}