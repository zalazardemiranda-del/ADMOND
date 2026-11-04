import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SYSTEM_RELEASE_VERSION
old_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_bloqueo_abrir_v7';"
new_ver = "const SYSTEM_RELEASE_VERSION = 'release_2026_11_04_fix_create_projects_v8';"
assert old_ver in content, f"Could not find {old_ver}"
content = content.replace(old_ver, new_ver, 1)

# 2. Fix purgedProjectIds definition (lines 280-320)
# DO NOT purge 189, 190, or the active range of newly created projects!
old_purge_block = """    // Purga masiva y exhaustiva de todos los folios fantasma generados por el bucle de noviembre (con y sin sufijo)
    const specificPurge = [
        'RDP2611189-F', 'RDP2611189', 'RDP2611190-F', 'RDP2611190',
        'RDP261189-F', 'RDP261189', 'RDP261190-F', 'RDP261190',
        'RDP2611199', 'RDP2611199-F', 'RDP2611200', 'RDP2611200-F'
    ];
    specificPurge.forEach(id => purgedProjectIds.add(id));

    for (let i = 300; i <= 399; i++) {
        purgedProjectIds.add(`RDP2611${i}`);
        purgedProjectIds.add(`RDP2611${i}-F`);
        purgedProjectIds.add(`RDP2611${i}-L`);
    }
    for (let i = 180; i <= 210; i++) {
        if (i !== 188) { // Conservar estrictamente el 88 legítimo (RDP2611188-F)
            purgedProjectIds.add(`RDP2611${i}`);
            purgedProjectIds.add(`RDP2611${i}-F`);
            purgedProjectIds.add(`RDP2611${i}-L`);
        }
    }
    for (let i = 80; i <= 99; i++) {
        if (i !== 88) {
            purgedProjectIds.add(`RDP2611${i}`);
            purgedProjectIds.add(`RDP2611${i}-F`);
            purgedProjectIds.add(`RDP2611${i}-L`);
        }
    }
    window.purgedProjectIds = purgedProjectIds;"""

new_purge_block = """    // Solo purgar los folios fantasma confirmados del glitch anterior (199, 200 y serie 300)
    // Los folios nuevos legítimos (189, 190, etc.) NO están bloqueados para poder crear proyectos libremente
    const specificPurge = [
        'RDP2611199', 'RDP2611199-F', 'RDP2611200', 'RDP2611200-F'
    ];
    specificPurge.forEach(id => purgedProjectIds.add(id));

    for (let i = 310; i <= 399; i++) {
        purgedProjectIds.add(`RDP2611${i}`);
        purgedProjectIds.add(`RDP2611${i}-F`);
        purgedProjectIds.add(`RDP2611${i}-L`);
    }
    window.purgedProjectIds = purgedProjectIds;"""

assert old_purge_block in content, "Could not find old_purge_block"
content = content.replace(old_purge_block, new_purge_block, 1)

# 3. Fix runInstantForcedPurge to only purge items in purgedProjectIds
old_instant_purge = """(function runInstantForcedPurge() {
    try {
        const stored = localStorage.getItem('rp_operaciones_proyectos');
        if (stored) {
            let list = JSON.parse(stored);
            if (Array.isArray(list)) {
                const isGhost = (p) => {
                    if (!p) return true;
                    const id = String(p.id || p.consecutivo || p.numProyecto || p.numConsecutivo || '').trim().toUpperCase();
                    if (id.includes('188')) return false; // El 88 es el legítimo de Diego (RDP2611188-F)
                    if (id.includes('189') || id.includes('190') || id.endsWith('89-F') || id.endsWith('90-F')) return true; // Eliminar 89 y 90
                    if (id.startsWith('RDP26113')) return true; // Serie 300 fantasma
                    if (window.purgedProjectIds && (window.purgedProjectIds.has(id) || window.purgedProjectIds.has(p.id) || window.purgedProjectIds.has(p.consecutivo))) return true;
                    if (id.startsWith('RDP2611') && id !== 'RDP2611188-F' && id !== 'RDP2611188') return true;
                    return false;
                };
                const cleanList = list.filter(p => !isGhost(p));
                if (cleanList.length !== list.length) {
                    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(cleanList));
                    if (window.appState) {
                        window.appState.operacionesProyectos = cleanList;
                    }
                }
            }
        }
    } catch(e) {}
})();"""

new_instant_purge = """(function runInstantForcedPurge() {
    try {
        const stored = localStorage.getItem('rp_operaciones_proyectos');
        if (stored) {
            let list = JSON.parse(stored);
            if (Array.isArray(list)) {
                const isGhost = (p) => {
                    if (!p) return true;
                    const id = String(p.id || p.consecutivo || p.numProyecto || p.numConsecutivo || '').trim().toUpperCase();
                    if (id.endsWith('-')) return true;
                    if (window.purgedProjectIds && (window.purgedProjectIds.has(id) || window.purgedProjectIds.has(p.id) || window.purgedProjectIds.has(p.consecutivo))) return true;
                    return false;
                };
                const cleanList = list.filter(p => !isGhost(p));
                if (cleanList.length !== list.length) {
                    localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(cleanList));
                    if (window.appState) {
                        window.appState.operacionesProyectos = cleanList;
                    }
                }
            }
        }
    } catch(e) {}
})();"""

assert old_instant_purge in content, "Could not find old_instant_purge"
content = content.replace(old_instant_purge, new_instant_purge, 1)

# 4. Fix renderOperacionesProyectosTable filter
old_table_filter = """        if (key.includes('188')) {
            // El 88 es el bueno y legítimo
        } else if (key.includes('189') || key.includes('190') || key.endsWith('89-F') || key.endsWith('90-F') || key.startsWith('RDP26113') || activePurgedIds.has(key) || activePurgedIds.has(p.id) || activePurgedIds.has(p.consecutivo)) {
            return false;
        }"""

new_table_filter = """        if (key.endsWith('-') || activePurgedIds.has(key) || activePurgedIds.has(p.id) || activePurgedIds.has(p.consecutivo)) {
            return false;
        }"""

assert old_table_filter in content, "Could not find old_table_filter"
content = content.replace(old_table_filter, new_table_filter, 1)

# 5. Fix generateProjectConsecutivo to append -F by default for local/foráneo
old_gen_cons = """    const nextSeq = maxSeq + 1;
    if (isLavado) {
        return `RDP${year2}${month}${nextSeq}-L`;
    } else {
        return `RDP${year2}${month}${nextSeq}`;
    }"""

new_gen_cons = """    const nextSeq = maxSeq + 1;
    if (isLavado) {
        return `RDP${year2}${month}${nextSeq}-L`;
    } else {
        return `RDP${year2}${month}${nextSeq}-F`;
    }"""

assert old_gen_cons in content, "Could not find old_gen_cons"
content = content.replace(old_gen_cons, new_gen_cons, 1)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app.js to fix project creation.")
