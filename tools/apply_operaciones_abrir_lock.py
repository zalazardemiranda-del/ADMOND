import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SYSTEM_RELEASE_VERSION
old_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_consecutivo_totales_v6';"
new_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_bloqueo_abrir_v7';"
assert old_ver in content, f"Could not find {old_ver}"
content = content.replace(old_ver, new_ver, 1)

# 2. Update isLockOwnedByMe to be strict on browser session / clientId
old_is_owned = """function isLockOwnedByMe(lock) {
    if (!lock || !lock.isLocked) return false;
    const myInfo = getOperacionesCurrentUserInfo();

    // 1. Coincidencia por clientId de navegador
    if (lock.clientId && myInfo.clientId && lock.clientId === myInfo.clientId) {
        return true;
    }

    // 2. Coincidencia por userId
    if (lock.userId && myInfo.userId && String(lock.userId).trim().toLowerCase() === String(myInfo.userId).trim().toLowerCase()) {
        return true;
    }

    // 3. Coincidencia por email
    const myEmail = (myInfo.userEmail || '').trim().toLowerCase();
    const lockEmail = (lock.userEmail || '').trim().toLowerCase();
    if (myEmail && lockEmail && myEmail === lockEmail) {
        return true;
    }
    if (myEmail && lock.userId && myEmail === String(lock.userId).trim().toLowerCase()) {
        return true;
    }

    // Si uno es Diego y el otro no es Diego, son usuarios distintos: NUNCA coinciden
    const isDiegoMe = myEmail.includes('diego') || (myInfo.userName || '').toLowerCase().includes('diego') || String(myInfo.userId || '').toLowerCase().includes('diego');
    const isDiegoLock = lockEmail.includes('diego') || (lock.userName || '').toLowerCase().includes('diego') || String(lock.userId || '').toLowerCase().includes('diego');
    if (isDiegoMe !== isDiegoLock) {
        return false;
    }

    // 4. Coincidencia por userName exacto o inclusión
    const myName = (myInfo.userName || '').trim().toLowerCase();
    const lockName = (lock.userName || '').trim().toLowerCase();
    if (myName && lockName && (myName === lockName || (myName.length > 5 && lockName.length > 5 && (myName.includes(lockName) || lockName.includes(myName))))) {
        return true;
    }

    // 5. Coincidencia por prefijo de correo
    const myPrefix = (myInfo.userPrefix || '').toLowerCase();
    const lockPrefix = (lock.userPrefix || (lockEmail.includes('@') ? lockEmail.split('@')[0] : '')).toLowerCase();
    if (myPrefix && (lockName === myPrefix || lockPrefix === myPrefix)) {
        return true;
    }
    if (lockName && myEmail && (myEmail.startsWith(lockName + '@') || myEmail === lockName)) {
        return true;
    }
    if (myName && lockEmail && (lockEmail.startsWith(myName + '@') || lockEmail === myName)) {
        return true;
    }

    return false;
}"""

new_is_owned = """function isLockOwnedByMe(lock) {
    if (!lock || !lock.isLocked) return false;
    const myInfo = getOperacionesCurrentUserInfo();

    // 1. REGLA ESTRICTA DE SESIÓN / DISPOSITIVO:
    // Cada navegador, pestaña o dispositivo tiene un clientId único.
    // Si el candado tiene clientId, solo le pertenece al dispositivo que lo abrió.
    if (lock.clientId && myInfo.clientId) {
        return lock.clientId === myInfo.clientId;
    }

    // 2. Si no hay clientId (datos heredados), comparar por userId exacto
    if (lock.userId && myInfo.userId) {
        return String(lock.userId).trim().toLowerCase() === String(myInfo.userId).trim().toLowerCase();
    }

    return false;
}"""

assert old_is_owned in content, "Could not find old_is_owned"
content = content.replace(old_is_owned, new_is_owned, 1)

# 3. Update heartbeat in app.js so it also syncs to cloud
pattern_hb = r"if \(typeof window !== 'undefined' && !window\._operacionesLockHeartbeatStarted\) \{[\s\S]*?setInterval\(\(\) => \{[\s\S]*?saveOperacionesLocksMapToLocal\(\);\s*\}\s*\}\s*\}, 10000\);\s*\}"

replacement_hb = """if (typeof window !== 'undefined' && !window._operacionesLockHeartbeatStarted) {
    window._operacionesLockHeartbeatStarted = true;
    setInterval(async () => {
        const detailPane = document.getElementById("operaciones-view-detail");
        const isDetailVisible = detailPane && detailPane.style.display !== "none";
        if (appState.activeOperacionesProjectId && isDetailVisible) {
            const myLock = appState._myActiveProjectLock;
            if (myLock && isLockOwnedByMe(myLock)) {
                myLock.timestamp = Date.now();
                const locks = ensureOperacionesLocksMap();
                const targetKeys = getAllOperacionesProjectKeys(appState.activeOperacionesProjectId);
                targetKeys.forEach(k => {
                    if (locks[k]) locks[k].timestamp = myLock.timestamp;
                });
                saveOperacionesLocksMapToLocal();
                // Sincronizar timestamp fresco a la nube para que nunca expire mientras el usuario sigue adentro
                if (typeof window.syncOperacionesProjectLocksToCloud === 'function') {
                    try {
                        await window.syncOperacionesProjectLocksToCloud();
                    } catch (e) {}
                }
            }
        }
    }, 10000);
}"""

content, count_hb = re.subn(pattern_hb, replacement_hb, content, count=1)
assert count_hb == 1, "Could not replace heartbeat"

# 4. Update renderOperacionesProyectosTable row rendering for locked state
pattern_row = r"const lockInfo = getProjectLockByOther\(p\);[\s\S]*?<button type=\"button\" class=\"btn-op-abrir\" data-project-id=\"\$\{pId\}\" onclick=\"event\.stopPropagation\(\); openOperacionesDetail\('\$\{pId\}'\)\"[\s\S]*?<\/button>\s*`\s*\}\s*<\/td>\s*<\/tr>\s*`;"

replacement_row = """const lockInfo = getProjectLockByOther(p);
        const isLockedByOther = Boolean(lockInfo);
        const myLockInfo = !isLockedByOther ? getOperacionesProjectLock(p) : null;
        const isLockedByMe = Boolean(myLockInfo && isLockOwnedByMe(myLockInfo) && appState.activeOperacionesProjectId);
        const lockMsg = isLockedByOther
            ? `En uso por ${lockInfo.userName || 'otro usuario'}`
            : '';
        const facturaDisplay = getOperacionesProjectFacturaDisplay(p);

        return `
        <tr data-op-id="${pId}" class="${isLockedByOther ? 'op-row-locked' : ''}" ${isLockedByOther ? `title="${lockMsg}"` : ''}>
            <td>
                <strong>${consecutivoDisplay}</strong>
                ${isLockedByOther ? `<div class="op-locked-project-msg" style="margin-top: 4px; color: #DC2626; font-size: 11.5px; font-weight: 600;"><span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">lock</span> En uso por ${lockInfo.userName || 'otro usuario'}</div>` : ''}
                ${isLockedByMe ? `<div class="op-locked-project-msg" style="margin-top: 4px; background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE;"><span class="material-symbols-outlined" style="font-size: 14px; color: #4F46E5;">visibility</span> Abierto por ti</div>` : ''}
            </td>
            <td>${p.fechaInicioDisplay || p.fechaInicio || '-'}</td>
            <td>${facturaDisplay}</td>
            <td><span class="op-status-badge ${p.estatus}">${p.estatus}</span></td>
            <td style="white-space: nowrap;">
                ${isLockedByOther ? `
                    <button type="button" class="btn-op-abrir" data-project-id="${pId}" disabled style="opacity: 0.6; cursor: not-allowed; background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1;" title="En uso por ${lockInfo.userName || 'otro usuario'}. Espera a que regrese a Operaciones.">
                        <span class="material-symbols-outlined" style="font-size: 16px;">lock</span> BLOQUEADO
                    </button>
                ` : `
                    <button type="button" class="btn-op-abrir" data-project-id="${pId}" onclick="event.stopPropagation(); openOperacionesDetail('${pId}')" title="${isLockedByMe ? 'Continuar en tu proyecto' : 'Abrir expediente'}">
                        <span class="material-symbols-outlined" style="font-size: 16px;">${isLockedByMe ? 'visibility' : 'folder_open'}</span> ${isLockedByMe ? 'ABIERTO' : 'ABRIR'}
                    </button>
                `}
            </td>
        </tr>
    `;"""

content, count_row = re.subn(pattern_row, replacement_row, content, count=1)
assert count_row == 1, "Could not replace table row rendering"

# 5. Update openOperacionesDetail to strictly lock on open and block others
pattern_open = r"function openOperacionesDetail\(projectId, clickTimestamp = null\) \{[\s\S]*?// Registrar timestamp de apertura para control de concurrencia\s*claimOperacionesProjectLock\(p, clickTimestamp !== null \? clickTimestamp : Date\.now\(\)\);"

replacement_open = """async function openOperacionesDetail(projectId, clickTimestamp = null) {
    window.openOperacionesDetail = openOperacionesDetail;
    try {
        if (!projectId) {
            projectId = appState.activeOperacionesProjectId;
        }
        const cleanTargetId = String(projectId || '').trim().toLowerCase();

        // 1. ANTES DE ABRIR: Consultar inmediatamente el estado más fresco de bloqueos en la nube
        if (typeof window.fetchOperacionesProjectLocksFromCloud === 'function') {
            try {
                await window.fetchOperacionesProjectLocksFromCloud();
            } catch (e) {}
        }

        if (!appState.operacionesProyectos || appState.operacionesProyectos.length === 0) {
            try {
                const stored = localStorage.getItem('rp_operaciones_proyectos');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        appState.operacionesProyectos = parsed.filter(p => isProjectGenerado(p));
                    }
                }
            } catch(e) {}
        }

        const proyectos = (appState.operacionesProyectos && appState.operacionesProyectos.length > 0)
            ? appState.operacionesProyectos
            : (appState.draftOperacionesProject ? [appState.draftOperacionesProject] : defaultOperacionesProyectos);

        let p = null;
        if (appState.draftOperacionesProject && (!cleanTargetId || String(appState.draftOperacionesProject.id || '').trim().toLowerCase() === cleanTargetId)) {
            p = appState.draftOperacionesProject;
        }

        if (!p && cleanTargetId) {
            p = proyectos.find(x => {
                if (!x) return false;
                const idMatch = String(x.id || '').trim().toLowerCase() === cleanTargetId;
                const consecutivoMatch = String(x.consecutivo || '').trim().toLowerCase() === cleanTargetId;
                const numConsecutivoMatch = String(x.numConsecutivo || '').trim().toLowerCase() === cleanTargetId;
                const numProyectoMatch = String(x.numProyecto || '').trim().toLowerCase() === cleanTargetId;
                return idMatch || consecutivoMatch || numConsecutivoMatch || numProyectoMatch;
            });
        }

        if (!p && proyectos.length > 0) {
            p = proyectos[0];
        }

        if (!p) {
            console.warn("No project found to open in Operaciones detail for id:", projectId);
            return;
        }

        // 2. REGLA ESTRICTA DE BLOQUEO EN APERTURA:
        // Si el usuario 1 ya dio clic en "ABRIR" (incluso para solo visualizar),
        // el usuario 2 o 3 tiene TOTALMENTE BLOQUEADA la entrada hasta que el usuario 1 regrese a Operaciones.
        const lockByOther = getProjectLockByOther(p);
        if (lockByOther && !isLockOwnedByMe(lockByOther)) {
            const userName = lockByOther.userName || 'otro usuario';
            const consDisplay = p.consecutivo || p.numConsecutivo || p.numProyecto || p.id || '';
            const blockMsg = `El proyecto ${consDisplay} está actualmente en uso por ${userName}. La entrada está bloqueada hasta que regrese a Operaciones.`;
            
            if (typeof showCustomNotification === 'function') {
                showCustomNotification(blockMsg, "warning");
            } else {
                alert(blockMsg);
            }
            if (typeof renderOperaciones === 'function') {
                renderOperaciones();
            }
            return; // BLOQUEADO: No se permite entrar ni para visualizar
        }

        // Si teníamos otro proyecto abierto previamente por nosotros, liberarlo
        if (appState.activeOperacionesProjectId && normalizeOperacionesProjectKey(appState.activeOperacionesProjectId) !== normalizeOperacionesProjectKey(p)) {
            releaseOperacionesProjectLock(appState.activeOperacionesProjectId);
        }

        appState.activeOperacionesProjectId = p.id;
        try {
            sessionStorage.setItem('rp_active_operaciones_project_id', p.id);
            localStorage.removeItem('rp_active_operaciones_project_id');
        } catch(e) {}

        // Registrar bloqueo exclusivo de apertura inmediatamente
        claimOperacionesProjectLock(p, clickTimestamp !== null ? clickTimestamp : Date.now());
        if (typeof window.syncOperacionesProjectLocksToCloud === 'function') {
            await window.syncOperacionesProjectLocksToCloud();
        }"""

content, count_open = re.subn(pattern_open, replacement_open, content, count=1)
assert count_open == 1, "Could not replace openOperacionesDetail"

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Operaciones lock rules successfully.")
