let data = JSON.parse(localStorage.getItem('finanzaData'));

if (!data) window.location.href = 'index.html';

document.getElementById('finance-form').onsubmit = (e) => {
    e.preventDefault();
    data.movements.push({
        id: Date.now(),
        type: document.getElementById('type').value,
        concept: document.getElementById('concept').value,
        amount: parseFloat(document.getElementById('amount').value)
    });
    update();
    e.target.reset();
};

function update() {
    localStorage.setItem('finanzaData', JSON.stringify(data));
    document.getElementById('user-greeting').innerText = `Hola, ${data.name}`;
    
    let inc = 0, exp = 0;
    const body = document.getElementById('list-body');
    body.innerHTML = "";

    [...data.movements].reverse().forEach(m => {
        const isInc = m.type === 'ingreso';
        if(isInc) inc += m.amount; else exp += m.amount;

        body.innerHTML += `
            <tr class="border-transparent">
                <td width="50"><div class="rounded-circle p-2 text-center ${isInc ? 'bg-success text-white' : 'bg-danger text-white'}" style="width:35px; height:35px; line-height:18px"><i class="fas ${isInc?'fa-plus':'fa-minus'} small"></i></div></td>
                <td><span class="fw-bold d-block">${m.concept}</span><small class="text-muted text-uppercase" style="font-size:10px">${m.type}</small></td>
                <td class="${isInc?'text-success':'text-danger'} fw-bold text-end">$${m.amount.toLocaleString()}</td>
                <td class="text-end"><button onclick="del(${m.id})" class="btn btn-link text-muted"><i class="fas fa-trash-alt"></i></button></td>
            </tr>
        `;
    });

    document.getElementById('inc-val').innerText = `$${inc.toLocaleString()}`;
    document.getElementById('exp-val').innerText = `$${exp.toLocaleString()}`;
    const bal = inc - exp;
    document.getElementById('bal-val').innerText = `$${bal.toLocaleString()}`;
    document.getElementById('bal-card').style.background = bal < 0 ? 'var(--card-expense)' : 'var(--card-balance)';
}

function del(id) {
    data.movements = data.movements.filter(m => m.id !== id);
    update();
}

function logout() {
    data.isLoggedIn = false;
    localStorage.setItem('finanzaData', JSON.stringify(data));
    window.location.href = 'index.html';
}

update();