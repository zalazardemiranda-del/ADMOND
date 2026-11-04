import re

# 1. Update app.js
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update SYSTEM_RELEASE_VERSION
old_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_purge_89_90_v4';"
new_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_consecutivo_totales_v6';"
assert old_ver in content, f"Could not find {old_ver}"
content = content.replace(old_ver, new_ver, 1)

# Update default consecutivoStFilter to 'PP'
old_state = "    consecutivoStFilter: 'all',"
new_state = "    consecutivoStFilter: 'PP',"
assert old_state in content, f"Could not find {old_state}"
content = content.replace(old_state, new_state, 1)

# Update calculateAdminTotals for ingresos
old_admin_ingresos = """    // Ingresos: resultado del total que aparece en Consecutivo (Total de Pendiente Cobro / Imagen 2)
    let ingresos = 0;
    if (typeof getConsecutivoPendienteCobroTotals === 'function') {
        ingresos = getConsecutivoPendienteCobroTotals().total;
    } else if (Array.isArray(appState.consecutivo)) {"""

new_admin_ingresos = """    // Ingresos: resultado del total que aparece en Consecutivo (Total Por Programar / Activo)
    let ingresos = 0;
    if (typeof getConsecutivoPorProgramarTotals === 'function') {
        ingresos = getConsecutivoPorProgramarTotals().total;
    }
    if (!ingresos && typeof getConsecutivoPendienteCobroTotals === 'function') {
        ingresos = getConsecutivoPendienteCobroTotals().total;
    } else if (!ingresos && Array.isArray(appState.consecutivo)) {"""

assert old_admin_ingresos in content, "Could not find old_admin_ingresos"
content = content.replace(old_admin_ingresos, new_admin_ingresos, 1)

# Update getFilteredConsecutivoList
old_filtered = """function getFilteredConsecutivoList() {
    let list = appState.consecutivo || [];
    
    // 1. ST Filter (P = Pagados / Archivo, C = Por Cobrar, PP = Por programar)
    if (appState.consecutivoArchivoMode || appState.consecutivoStFilter === 'P') {
        list = list.filter(item => String(item.st || '').trim().toUpperCase() === 'P');
    } else if (appState.consecutivoStFilter === 'C') {
        list = list.filter(item => String(item.st || '').trim().toUpperCase() === 'C');
    } else if (appState.consecutivoStFilter === 'PP' || appState.consecutivoStFilter === 'PROG' || appState.consecutivoStFilter === 'Cancelado') {
        list = list.filter(item => {
            const st = String(item.st || 'PP').trim().toUpperCase();
            return st !== 'P' && st !== 'C';
        });
    }"""

new_filtered = """function getFilteredConsecutivoList() {
    let list = appState.consecutivo || [];
    
    // 1. ST Filter (P = Pagados / Archivo, C = Por Cobrar, PP = Por programar)
    if (appState.consecutivoArchivoMode || appState.consecutivoStFilter === 'P') {
        list = list.filter(item => String(item.st || '').trim().toUpperCase() === 'P');
    } else if (appState.consecutivoStFilter === 'C') {
        list = list.filter(item => String(item.st || '').trim().toUpperCase() === 'C');
    } else if (appState.consecutivoStFilter === 'PP' || appState.consecutivoStFilter === 'PROG' || appState.consecutivoStFilter === 'Por programar' || appState.consecutivoStFilter === 'Cancelado') {
        list = list.filter(item => {
            const st = String(item.st || 'PP').trim().toUpperCase();
            return st !== 'P' && st !== 'C';
        });
    } else {
        // En vista activa 'Todos': NUNCA mostrar los 'P' (Cobrados), pertenecen exclusivamente al Archivo
        list = list.filter(item => String(item.st || '').trim().toUpperCase() !== 'P');
    }"""

assert old_filtered in content, "Could not find old_filtered"
content = content.replace(old_filtered, new_filtered, 1)

# Update toggleConsecutivoArchivoView
old_toggle = """    if (nextState) {
        appState.consecutivoStFilter = 'P';
        const btnP = document.querySelector(".consecutivo-filter-btn[data-st='P']");
        if (btnP) btnP.classList.add("active");
    } else {
        appState.consecutivoStFilter = 'all';
        const btnAll = document.querySelector(".consecutivo-filter-btn[data-st='all']");
        if (btnAll) btnAll.classList.add("active");
    }"""

new_toggle = """    if (nextState) {
        appState.consecutivoStFilter = 'P';
        const btnP = document.querySelector(".consecutivo-filter-btn[data-st='P']");
        if (btnP) btnP.classList.add("active");
    } else {
        appState.consecutivoStFilter = 'PP';
        const btnPP = document.querySelector(".consecutivo-filter-btn[data-st='PP']");
        if (btnPP) btnPP.classList.add("active");
    }"""

assert old_toggle in content, "Could not find old_toggle"
content = content.replace(old_toggle, new_toggle, 1)

# Update isConsecutivoPendienteCobro, getConsecutivoPendienteCobroTotals, updateConsecutivoKPIs, renderConsecutivoFooterTotals
old_kpi_block = """function isConsecutivoPendienteCobro(item) {
    if (!item) return false;
    const st = String(item.st || 'PP').trim().toUpperCase();
    if (st === 'P' || st.includes('PAG') || st.includes('COBRAD')) return false;
    if (st === 'PP' || st === 'PROG' || st.includes('PROG') || st.includes('CANCEL')) return false;
    return (st === 'C' || st.includes('COBR') || st.includes('PEND'));
}
window.isConsecutivoPendienteCobro = isConsecutivoPendienteCobro;

function getConsecutivoPendienteCobroTotals() {
    let subtotal = 0;
    let iva = 0;
    let total = 0;
    
    (appState.consecutivo || []).forEach(item => {
        if (!item) return;
        if (isConsecutivoPendienteCobro(item)) {
            const sub = Number(item.subtotal) || 0;
            const iv = (item.iva !== '' && item.iva !== null && item.iva !== undefined) 
                ? Number(item.iva) 
                : (sub > 0 ? Math.round(sub * 0.16 * 100) / 100 : 0);
            const tot = (item.total !== '' && item.total !== null && item.total !== undefined && Number(item.total) > 0) 
                ? Number(item.total) 
                : (sub + iv);
            subtotal += sub;
            iva += iv;
            total += tot;
        }
    });
    
    return { subtotal, iva, total };
}
window.getConsecutivoPendienteCobroTotals = getConsecutivoPendienteCobroTotals;

function updateConsecutivoKPIs(list) {
    // Todos los expedientes que estén en el filtro "Pendiente Cobro" (C) se reflejan en las tarjetas superiores
    const pcTotals = getConsecutivoPendienteCobroTotals();
    
    const subEl = document.getElementById("consecutivo-kpi-subtotal");
    const ivaEl = document.getElementById("consecutivo-kpi-iva");
    const totEl = document.getElementById("consecutivo-kpi-total");
    
    if (subEl) subEl.innerText = formatCurrency(pcTotals.subtotal);
    if (ivaEl) ivaEl.innerText = formatCurrency(pcTotals.iva);
    if (totEl) totEl.innerText = formatCurrency(pcTotals.total);

    if (typeof renderVisualizacion === 'function') {
        renderVisualizacion();
    }
}

function renderConsecutivoFooterTotals(list) {
    const pcTotals = getConsecutivoPendienteCobroTotals();
    
    let sumSubtotal = 0;
    let sumIva = 0;
    let sumTotal = 0;
    
    list.forEach(item => {
        sumSubtotal += Number(item.subtotal) || 0;
        sumIva += Number(item.iva) || 0;
        sumTotal += Number(item.total) || 0;
    });

    const currentFilter = String(appState.consecutivoStFilter || 'all').trim().toUpperCase();
    const isViewingAllOrC = (currentFilter === 'ALL' || currentFilter === 'TODOS' || currentFilter === 'C' || currentFilter.includes('COBR') || currentFilter.includes('PEND') || currentFilter === '');

    // El total de la sección / tabla solo tiene que ser de las operaciones que están en el filtro "Pendiente Cobro"
    if (isViewingAllOrC) {
        sumSubtotal = pcTotals.subtotal;
        sumIva = pcTotals.iva;
        sumTotal = pcTotals.total;
    }
    
    const totalsRow = document.getElementById("excel-consecutivo-totals-row");
    if (totalsRow) {
        totalsRow.innerHTML = `
            <td style="text-align: center; font-weight: 800;">TOT</td>
            <td colspan="4" style="font-weight: 800; font-size: 10px;">${list.length} regs</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumSubtotal)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumIva)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumTotal)}</td>
            <td colspan="4"></td>
        `;
    }
}"""

new_kpi_block = """function isConsecutivoPendienteCobro(item) {
    if (!item) return false;
    const st = String(item.st || 'PP').trim().toUpperCase();
    if (st === 'P' || st.includes('PAG') || st.includes('COBRAD')) return false;
    if (st === 'PP' || st === 'PROG' || st.includes('PROG') || st.includes('CANCEL')) return false;
    return (st === 'C' || st.includes('COBR') || st.includes('PEND'));
}
window.isConsecutivoPendienteCobro = isConsecutivoPendienteCobro;

function isConsecutivoPorProgramar(item) {
    if (!item) return false;
    const st = String(item.st || 'PP').trim().toUpperCase();
    if (st === 'P' || st.includes('PAG') || st.includes('COBRAD')) return false;
    if (st === 'C' || st.includes('COBR') || st.includes('PEND')) return false;
    return true; // PP, PROG, Por Programar
}
window.isConsecutivoPorProgramar = isConsecutivoPorProgramar;

function getConsecutivoPorProgramarTotals() {
    let subtotal = 0;
    let iva = 0;
    let total = 0;
    
    (appState.consecutivo || []).forEach(item => {
        if (!item) return;
        if (isConsecutivoPorProgramar(item)) {
            const sub = Number(item.subtotal) || 0;
            const iv = (item.iva !== '' && item.iva !== null && item.iva !== undefined) 
                ? Number(item.iva) 
                : (sub > 0 ? Math.round(sub * 0.16 * 100) / 100 : 0);
            const tot = (item.total !== '' && item.total !== null && item.total !== undefined && Number(item.total) > 0) 
                ? Number(item.total) 
                : (sub + iv);
            subtotal += sub;
            iva += iv;
            total += tot;
        }
    });
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        total: Math.round(total * 100) / 100
    };
}
window.getConsecutivoPorProgramarTotals = getConsecutivoPorProgramarTotals;

function getConsecutivoPendienteCobroTotals() {
    let subtotal = 0;
    let iva = 0;
    let total = 0;
    
    (appState.consecutivo || []).forEach(item => {
        if (!item) return;
        if (isConsecutivoPendienteCobro(item)) {
            const sub = Number(item.subtotal) || 0;
            const iv = (item.iva !== '' && item.iva !== null && item.iva !== undefined) 
                ? Number(item.iva) 
                : (sub > 0 ? Math.round(sub * 0.16 * 100) / 100 : 0);
            const tot = (item.total !== '' && item.total !== null && item.total !== undefined && Number(item.total) > 0) 
                ? Number(item.total) 
                : (sub + iv);
            subtotal += sub;
            iva += iv;
            total += tot;
        }
    });
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        iva: Math.round(iva * 100) / 100,
        total: Math.round(total * 100) / 100
    };
}
window.getConsecutivoPendienteCobroTotals = getConsecutivoPendienteCobroTotals;

function updateConsecutivoKPIs(list) {
    const currentFilter = String(appState.consecutivoStFilter || 'PP').trim().toUpperCase();
    
    let subtotal = 0;
    let iva = 0;
    let total = 0;

    // Los proyectos al crearse en operaciones entran por defecto en "Por Programar",
    // y esos de "Por Programar" (uno o muchos) forman el total reflejado en las tarjetas superiores.
    let targetItems = [];
    if (appState.consecutivoArchivoMode || currentFilter === 'P') {
        targetItems = (appState.consecutivo || []).filter(item => String(item.st || '').trim().toUpperCase() === 'P');
    } else if (currentFilter === 'C') {
        targetItems = (appState.consecutivo || []).filter(item => isConsecutivoPendienteCobro(item));
    } else if (currentFilter === 'ALL') {
        // Vista activa 'Todos': proyectos no cobrados (Por Programar + Pendiente Cobro)
        targetItems = (appState.consecutivo || []).filter(item => String(item.st || '').trim().toUpperCase() !== 'P');
    } else {
        // Filtro 'PP' / 'Por Programar' por defecto
        targetItems = (appState.consecutivo || []).filter(item => isConsecutivoPorProgramar(item));
    }

    targetItems.forEach(item => {
        if (!item) return;
        const sub = Number(item.subtotal) || 0;
        const iv = (item.iva !== '' && item.iva !== null && item.iva !== undefined) 
            ? Number(item.iva) 
            : (sub > 0 ? Math.round(sub * 0.16 * 100) / 100 : 0);
        const tot = (item.total !== '' && item.total !== null && item.total !== undefined && Number(item.total) > 0) 
            ? Number(item.total) 
            : (sub + iv);
        subtotal += sub;
        iva += iv;
        total += tot;
    });

    subtotal = Math.round(subtotal * 100) / 100;
    iva = Math.round(iva * 100) / 100;
    total = Math.round(total * 100) / 100;
    
    const subEl = document.getElementById("consecutivo-kpi-subtotal");
    const ivaEl = document.getElementById("consecutivo-kpi-iva");
    const totEl = document.getElementById("consecutivo-kpi-total");
    
    if (subEl) subEl.innerText = formatCurrency(subtotal);
    if (ivaEl) ivaEl.innerText = formatCurrency(iva);
    if (totEl) totEl.innerText = formatCurrency(total);

    if (typeof renderVisualizacion === 'function') {
        renderVisualizacion();
    }
}

function renderConsecutivoFooterTotals(list) {
    let sumSubtotal = 0;
    let sumIva = 0;
    let sumTotal = 0;
    
    (list || []).forEach(item => {
        if (!item) return;
        const sub = Number(item.subtotal) || 0;
        const iv = (item.iva !== '' && item.iva !== null && item.iva !== undefined) 
            ? Number(item.iva) 
            : (sub > 0 ? Math.round(sub * 0.16 * 100) / 100 : 0);
        const tot = (item.total !== '' && item.total !== null && item.total !== undefined && Number(item.total) > 0) 
            ? Number(item.total) 
            : (sub + iv);
        sumSubtotal += sub;
        sumIva += iv;
        sumTotal += tot;
    });

    sumSubtotal = Math.round(sumSubtotal * 100) / 100;
    sumIva = Math.round(sumIva * 100) / 100;
    sumTotal = Math.round(sumTotal * 100) / 100;
    
    const totalsRow = document.getElementById("excel-consecutivo-totals-row");
    if (totalsRow) {
        totalsRow.innerHTML = `
            <td style="text-align: center; font-weight: 800;">TOT</td>
            <td colspan="4" style="font-weight: 800; font-size: 10px;">${(list || []).length} regs</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumSubtotal)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumIva)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumTotal)}</td>
            <td colspan="4"></td>
        `;
    }
}"""

assert old_kpi_block in content, "Could not find old_kpi_block"
content = content.replace(old_kpi_block, new_kpi_block, 1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.js successfully.")

# 2. Update index.html filter buttons
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

old_html_btn = """                                        <button class="consecutivo-filter-btn active" data-st="all" onclick="filterConsecutivoByST('all', this)">Todos</button>

                                        <button class="consecutivo-filter-btn" data-st="P" onclick="filterConsecutivoByST('P', this)" title="Cobrado">Cobrado</button>

                                        <button class="consecutivo-filter-btn" data-st="C" onclick="filterConsecutivoByST('C', this)" title="Pendiente Cobro">Pendiente Cobro</button>

                                        <button class="consecutivo-filter-btn" data-st="PP" onclick="filterConsecutivoByST('PP', this)" title="Por programar">Por Programar</button>"""

new_html_btn = """                                        <button class="consecutivo-filter-btn" data-st="all" onclick="filterConsecutivoByST('all', this)">Todos</button>

                                        <button class="consecutivo-filter-btn" data-st="P" onclick="filterConsecutivoByST('P', this)" title="Cobrado">Cobrado</button>

                                        <button class="consecutivo-filter-btn" data-st="C" onclick="filterConsecutivoByST('C', this)" title="Pendiente Cobro">Pendiente Cobro</button>

                                        <button class="consecutivo-filter-btn active" data-st="PP" onclick="filterConsecutivoByST('PP', this)" title="Por programar">Por Programar</button>"""

assert old_html_btn in html_content, "Could not find old_html_btn in index.html"
html_content = html_content.replace(old_html_btn, new_html_btn, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
print("Updated index.html successfully.")
