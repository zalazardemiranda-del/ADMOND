/**
 * Rodipack Gestión - Módulo de Esquematización de Sistema
 * Pizarrón Infinito estilo Canva / Miro / FigJam con barra de herramientas izquierda,
 * lienzo interactivo (Pan & Zoom), arrastre libre de tarjetas (Drag & Drop),
 * flechas SVG dinámicas con estados de bloqueo en tiempo real, notas adhesivas y textos.
 * 
 * 100% Localhost / Offline / LocalStorage
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'rp_system_schemas_v4';
    const ACTIVE_SCHEMA_KEY = 'rp_active_schema_id_v4';
    const CANVAS_VIEW_KEY = 'rp_schema_canvas_view_v4';

    // Departamentos estándar y configuración visual
    const DEPARTMENTS_CONFIG = {
        'IT': { name: 'IT (Tecnología)', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: 'terminal' },
        'Ventas': { name: 'Ventas & Comercial', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: 'storefront' },
        'Operaciones': { name: 'Operaciones & Logística', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: 'local_shipping' },
        'Facturación': { name: 'Facturación & Finanzas', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: 'receipt_long' },
        'Gerencia': { name: 'Gerencia General', color: '#0F172A', bg: '#F1F5F9', border: '#CBD5E1', icon: 'business_center' },
        'Marketing': { name: 'Marketing & Difusión', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', icon: 'campaign' }
    };

    function hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(71, 85, 105, ${alpha})`;
        let c = hex.substring(1);
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    function getDeptConfig(deptName, deptObj) {
        if (deptObj && deptObj.color) {
            return {
                name: deptObj.name || deptName,
                color: deptObj.color,
                bg: hexToRgba(deptObj.color, 0.08),
                border: hexToRgba(deptObj.color, 0.3),
                icon: deptObj.icon || 'domain'
            };
        }
        if (DEPARTMENTS_CONFIG[deptName]) return DEPARTMENTS_CONFIG[deptName];
        return {
            name: deptName || 'General',
            color: '#475569',
            bg: '#F8FAFC',
            border: '#E2E8F0',
            icon: 'domain'
        };
    }

    // Esquema inicial según el boceto del usuario (Admond / Esquema Tareas)
    function getDefaultSchemas() {
        return [
            {
                id: 'schema-admond-central',
                name: 'Admond / Esquema Tareas',
                description: 'Estructura operativa interdepartamental y tareas esquematizadas.',
                rootPos: { x: 480, y: 40 },
                departments: [
                    {
                        id: 'dept-it',
                        name: 'IT',
                        description: 'Desarrollo Software',
                        manager: 'Roberto Miranda',
                        color: '#2563EB',
                        x: 100,
                        y: 230,
                        subdepartments: [
                            {
                                id: 'subdept-portilaw',
                                name: 'Portilaw',
                                description: 'Sistema MVE',
                                manager: 'Roberto Miranda'
                            }
                        ]
                    }
                ],
                tasks: [
                    {
                        id: 'task-portilaw-init',
                        title: 'Arquitectura del Sistema MVE',
                        description: 'Estructurar módulos base y esquemas de base de datos para Portilaw.',
                        assignee: 'Roberto Miranda',
                        priority: 'alta',
                        status: 'pending',
                        departmentId: 'dept-it',
                        department: 'IT',
                        subdepartmentId: 'subdept-portilaw',
                        subdepartment: 'Portilaw',
                        dependencies: []
                    }
                ],
                conceptTexts: [],
                stickyNotes: []
            }
        ];
    }

    // Migración automática para asegurar estructura de subdepartamentos y encargados
    function migrateSchemaData(schema) {
        if (!schema) return;
        if (!schema.name) schema.name = 'Tema Central';
        if (!schema.rootPos) schema.rootPos = { x: 480, y: 40 };
        if (!Array.isArray(schema.departments)) schema.departments = [];
        if (!Array.isArray(schema.tasks)) schema.tasks = [];

        schema.departments.forEach((dept, dIdx) => {
            if (!dept.id) dept.id = 'dept-' + dIdx + '-' + Date.now().toString(36);
            if (!dept.name) dept.name = 'Departamento';
            if (!dept.description) dept.description = dept.name === 'IT' ? 'Desarrollo Software' : 'Área operativa';
            if (!dept.manager) dept.manager = 'Roberto Miranda';
            if (!dept.color) dept.color = '#2563EB';
            if (typeof dept.x !== 'number') dept.x = 100 + dIdx * 400;
            if (typeof dept.y !== 'number') dept.y = 230;
            if (!Array.isArray(dept.subdepartments)) dept.subdepartments = [];

            // Si no tiene subdepartamento pero tiene tareas, crear uno
            const deptTasks = schema.tasks.filter(t => t.department === dept.name || t.departmentId === dept.id);
            if (dept.subdepartments.length === 0) {
                if (dept.name === 'IT') {
                    dept.subdepartments.push({
                        id: 'subdept-portilaw-' + dept.id,
                        name: 'Portilaw',
                        description: 'Sistema MVE',
                        manager: 'Roberto Miranda'
                    });
                } else if (deptTasks.length > 0) {
                    dept.subdepartments.push({
                        id: 'subdept-general-' + dept.id,
                        name: dept.name + ' Operativo',
                        description: 'Sub-área principal',
                        manager: dept.manager || 'Roberto Miranda'
                    });
                }
            }

            // Asignar tareas sin subdepartamento al primer subdepartamento
            if (dept.subdepartments.length > 0) {
                const firstSub = dept.subdepartments[0];
                deptTasks.forEach(t => {
                    if (!t.subdepartmentId) {
                        t.subdepartmentId = firstSub.id;
                        t.subdepartment = firstSub.name;
                        t.departmentId = dept.id;
                    }
                });
            }
        });
    }

    // Estado global del canvas y del motor
    const schemaState = {
        schemas: [],
        activeSchemaId: null,
        activeTool: 'select', // 'select', 'task', 'draw', 'eraser', 'connect', 'sticky', 'text'
        panX: 40,
        panY: 20,
        scale: 1.0,
        isPanning: false,
        isDrawing: false,
        isDraggingNode: false,
        dragTarget: null,
        dragStartMouse: { x: 0, y: 0 },
        dragStartNodePos: { x: 0, y: 0 },
        connectingSourceId: null,
        editingTaskId: null,
        diagnosticOpen: false,
        currentCollaboratorFilter: 'all'
    };

    // Inicialización y limpieza profunda de datos inventados / demo
    function initSchemaEngine() {
        // Limpiar claves antiguas de versiones con datos inventados
        try {
            localStorage.removeItem('rp_system_schemas');
            localStorage.removeItem('rp_system_schemas_v2');
        } catch (e) {}

        try {
            let raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                // Intentar migrar desde v3 si existe
                raw = localStorage.getItem('rp_system_schemas_v3');
            }
            if (raw) {
                schemaState.schemas = JSON.parse(raw);
            }
        } catch (e) {
            console.warn('Error al leer esquemas de localStorage:', e);
        }

        // Si no hay esquemas o array vacío, cargar esquema inicial
        if (!schemaState.schemas || !schemaState.schemas.length) {
            schemaState.schemas = getDefaultSchemas();
            saveSchemasToLocal();
        } else {
            // Migrar todos los esquemas existentes al modelo con subdepartamentos
            schemaState.schemas.forEach(s => migrateSchemaData(s));
            saveSchemasToLocal();
        }

        const savedActiveId = localStorage.getItem(ACTIVE_SCHEMA_KEY);
        if (savedActiveId && schemaState.schemas.some(s => s.id === savedActiveId)) {
            schemaState.activeSchemaId = savedActiveId;
        } else {
            schemaState.activeSchemaId = schemaState.schemas[0].id;
        }

        try {
            const savedView = localStorage.getItem(CANVAS_VIEW_KEY);
            if (savedView) {
                const v = JSON.parse(savedView);
                if (typeof v.panX === 'number') schemaState.panX = v.panX;
                if (typeof v.panY === 'number') schemaState.panY = v.panY;
                if (typeof v.scale === 'number') schemaState.scale = v.scale;
            }
        } catch (e) {}
    }

    function saveSchemasToLocal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(schemaState.schemas));
            if (schemaState.activeSchemaId) {
                localStorage.setItem(ACTIVE_SCHEMA_KEY, schemaState.activeSchemaId);
            }
            localStorage.setItem(CANVAS_VIEW_KEY, JSON.stringify({
                panX: schemaState.panX,
                panY: schemaState.panY,
                scale: schemaState.scale
            }));
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
        }
    }

    function getActiveSchema() {
        if (!schemaState.activeSchemaId && schemaState.schemas.length > 0) {
            schemaState.activeSchemaId = schemaState.schemas[0].id;
        }
        const active = schemaState.schemas.find(s => s.id === schemaState.activeSchemaId) || schemaState.schemas[0];
        if (active && active.tasks && Array.isArray(active.tasks)) {
            active.tasks.forEach(t => {
                if (!t.priority || (t.title && t.title.toUpperCase().includes('RODILAW'))) {
                    t.priority = 'alta';
                }
            });
        }
        return active;
    }

    // Cálculo y análisis de dependencias de tareas
    function evaluateTasks(tasks) {
        if (!tasks) return [];
        return tasks.map(task => {
            const blockingTasks = [];
            if (task.dependencies && Array.isArray(task.dependencies)) {
                task.dependencies.forEach(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    if (!depTask || depTask.status !== 'completed') {
                        blockingTasks.push(depTask || {
                            id: depId,
                            title: 'Tarea no encontrada o pendiente',
                            department: 'Desconocido',
                            status: 'pending'
                        });
                    }
                });
            }

            const isBlocked = blockingTasks.length > 0;
            const dependents = tasks.filter(t => t.dependencies && t.dependencies.includes(task.id));
            const isBottleneck = (task.status !== 'completed') && (dependents.length > 0);

            return {
                ...task,
                isBlocked,
                blockingTasks,
                dependents,
                isBottleneck
            };
        });
    }

    // RENDER PRINCIPAL DE LA ESQUEMATIZACIÓN (PIZARRÓN INFINITO)
    function renderSchemaView() {
        const container = document.getElementById('tab-schema');
        if (!container) return;

        initSchemaEngine();
        renderTopBar();
        renderCanvasElements();
        attachCanvasEvents();
        updateCanvasTransform();
    }

    // Barra superior flotante del canvas
    function renderTopBar() {
        const schema = getActiveSchema();
        if (!schema) return;

        // Selector de proyectos
        const selectEl = document.getElementById('schema-active-project-select');
        if (selectEl) {
            selectEl.innerHTML = schemaState.schemas.map(s => `
                <option value="${s.id}" ${s.id === schemaState.activeSchemaId ? 'selected' : ''}>
                    ${escapeHtml(s.name)}
                </option>
            `).join('');
        }

        // Poblar y actualizar Panel de Filtro de Colaborador y Métricas (Imagen 2)
        populateSchemaUserFilterMenu();
        updateSchemaUserFilterMetrics();
    }

    // =========================================================================
    // FILTRADO DE COLABORADORES Y MÉTRICAS (PANEL SUPERIOR TIPO IMAGEN 2)
    // =========================================================================

    function checkTaskMatchesUser(task, filterVal) {
        if (!task) return false;
        if (!filterVal || filterVal === 'all') return true;
        const taskAssignee = (task.assignee || '').trim().toLowerCase();
        const f = filterVal.trim().toLowerCase();
        if (!taskAssignee || taskAssignee === 'sin asignar') return false;
        if (taskAssignee === f) return true;
        if (f.includes(taskAssignee) || taskAssignee.includes(f)) return true;

        // Comparación flexible por tokens de nombre (ej. "Roberto Miranda" vs "Roberto Miranda Perez")
        const fTokens = f.split(/\s+/).filter(t => t.length > 2);
        const aTokens = taskAssignee.split(/\s+/).filter(t => t.length > 2);
        if (fTokens.length > 0 && aTokens.length > 0) {
            const matches = fTokens.filter(t => aTokens.includes(t));
            if (matches.length >= 2 || (fTokens.length === 1 && matches.length === 1)) {
                return true;
            }
        }
        return false;
    }

    function toggleUserFilterMenu(event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById('schema-custom-user-filter-menu');
        const trigger = document.getElementById('schema-user-filter-trigger');
        if (!menu || !trigger) return;

        const isOpen = menu.classList.contains('open');
        if (isOpen) {
            menu.classList.remove('open');
            trigger.classList.remove('active');
        } else {
            populateSchemaUserFilterMenu();
            menu.classList.add('open');
            trigger.classList.add('active');
        }
    }

    function setCollaboratorFilter(filterVal) {
        schemaState.currentCollaboratorFilter = filterVal;
        const menu = document.getElementById('schema-custom-user-filter-menu');
        const trigger = document.getElementById('schema-user-filter-trigger');
        if (menu) menu.classList.remove('open');
        if (trigger) trigger.classList.remove('active');

        populateSchemaUserFilterMenu();
        updateSchemaUserFilterMetrics();
        applyCanvasCollaboratorHighlight();
    }

    function populateSchemaUserFilterMenu() {
        const menu = document.getElementById('schema-custom-user-filter-menu');
        const select = document.getElementById('schema-task-user-filter-select');
        const displayEl = document.getElementById('schema-filter-selected-user-display');
        if (!menu) return;

        const currentVal = schemaState.currentCollaboratorFilter || 'all';
        const collabs = getSchemaCollaborators();
        const usersMap = new Map();

        // 1. Agregar colaboradores conocidos del sistema
        collabs.forEach(u => {
            if (u && u.nombre && !usersMap.has(u.nombre)) {
                usersMap.set(u.nombre, {
                    displayName: u.nombre,
                    userObj: u,
                    pending: 0,
                    completed: 0,
                    total: 0
                });
            }
        });

        // 2. Extraer de appState.tasks y schema.tasks
        const allSystemTasks = (window.appState && window.appState.tasks) ? window.appState.tasks : [];
        const schema = getActiveSchema();
        const schemaTasks = (schema && schema.tasks) ? schema.tasks : [];

        // Tareas unificadas sin duplicados
        const taskPool = [...allSystemTasks];
        schemaTasks.forEach(st => {
            if (!taskPool.some(t => t.id === st.id)) {
                taskPool.push(st);
            }
        });

        const fakeUsers = new Set(['sofía castro', 'sofia castro', 'carlos ruiz', 'juan pérez', 'juan perez', 'maría gómez', 'maria gomez', 'gerente principal']);

        taskPool.forEach(t => {
            const a = (t.assignee || '').trim();
            if (a && a !== 'Sin asignar' && !fakeUsers.has(a.toLowerCase())) {
                let matchedKey = null;
                for (const [key, val] of usersMap.entries()) {
                    if (key.toLowerCase() === a.toLowerCase() || checkTaskMatchesUser(t, key)) {
                        matchedKey = key;
                        break;
                    }
                }
                if (!matchedKey) {
                    usersMap.set(a, {
                        displayName: a,
                        userObj: { nombre: a },
                        pending: 0,
                        completed: 0,
                        total: 0
                    });
                }
            }
        });

        // 3. Contar tareas por usuario
        taskPool.forEach(t => {
            const st = (t.status || '').toLowerCase();
            const isComp = st === 'completed' || st === 'completada';
            for (const [key, val] of usersMap.entries()) {
                if (checkTaskMatchesUser(t, key)) {
                    val.total++;
                    if (isComp) val.completed++;
                    else val.pending++;
                    break;
                }
            }
        });

        const totalAllTasks = taskPool.length;

        // 4. Generar HTML del menú desplegable personalizado (Idéntico a Imagen 2)
        let menuHtml = `
            <li class="custom-filter-item ${currentVal === 'all' ? 'selected' : ''}" onclick="window.schemaEngine.setCollaboratorFilter('all')">
                <div class="custom-filter-item-avatar icon-all">
                    <span class="material-symbols-outlined">groups</span>
                </div>
                <div class="custom-filter-item-info">
                    <span class="custom-filter-item-name">Todos los colaboradores</span>
                    <span class="custom-filter-item-sub">Supervisión general del equipo</span>
                </div>
                <span class="custom-filter-badge total">${totalAllTasks} tareas</span>
                ${currentVal === 'all' ? '<span class="material-symbols-outlined check-icon">check</span>' : ''}
            </li>
        `;

        usersMap.forEach((u, key) => {
            const isSelected = currentVal === key;
            const initials = getAssigneeInitials(u.displayName);
            const r = (u.userObj && u.userObj.rol ? u.userObj.rol : '').toLowerCase();
            const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
            const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
            const avatarBg = isGerente ? '#DBEAFE' : (isAdmin ? '#D1FAE5' : '#F1F5F9');
            const avatarColor = isGerente ? '#1D4ED8' : (isAdmin ? '#047857' : '#475569');

            const escapedKey = key.replace(/'/g, "\\'");

            menuHtml += `
                <li class="custom-filter-item ${isSelected ? 'selected' : ''}" onclick="window.schemaEngine.setCollaboratorFilter('${escapedKey}')">
                    <div class="custom-filter-item-avatar" style="background: ${avatarBg}; color: ${avatarColor};">
                        ${initials}
                    </div>
                    <div class="custom-filter-item-info">
                        <span class="custom-filter-item-name">${escapeHtml(u.displayName)}</span>
                        <span class="custom-filter-item-sub">${u.pending} pend. • ${u.completed} comp.</span>
                    </div>
                    <div class="custom-filter-metrics-pills">
                        <span class="custom-filter-pill pending">${u.pending} pend.</span>
                        <span class="custom-filter-pill completed">${u.completed} comp.</span>
                    </div>
                    ${isSelected ? '<span class="material-symbols-outlined check-icon">check</span>' : ''}
                </li>
            `;
        });

        menu.innerHTML = menuHtml;

        // 5. Actualizar el gatillo del selector
        if (displayEl) {
            if (currentVal === 'all') {
                displayEl.innerHTML = `
                    <div class="trigger-avatar icon-all">
                        <span class="material-symbols-outlined">groups</span>
                    </div>
                    <div class="trigger-text-wrap">
                        <span class="selected-name">Todos los colaboradores</span>
                        <span class="selected-metrics-badge">${totalAllTasks} tareas</span>
                    </div>
                `;
            } else {
                const selectedUserObj = usersMap.get(currentVal) || { displayName: currentVal, pending: 0, completed: 0, total: 0 };
                const initials = getAssigneeInitials(selectedUserObj.displayName);
                displayEl.innerHTML = `
                    <div class="trigger-avatar user-initials">
                        ${initials}
                    </div>
                    <div class="trigger-text-wrap">
                        <span class="selected-name">${escapeHtml(selectedUserObj.displayName)}</span>
                        <span class="selected-metrics-badge">${selectedUserObj.pending} pend., ${selectedUserObj.completed} comp.</span>
                    </div>
                `;
            }
        }
    }

    function updateSchemaUserFilterMetrics() {
        const filterVal = schemaState.currentCollaboratorFilter || 'all';
        const allSystemTasks = (window.appState && window.appState.tasks) ? window.appState.tasks : [];
        const schema = getActiveSchema();
        const schemaTasks = (schema && schema.tasks) ? schema.tasks : [];

        const taskPool = [...allSystemTasks];
        schemaTasks.forEach(st => {
            if (!taskPool.some(t => t.id === st.id)) {
                taskPool.push(st);
            }
        });

        let filtered = taskPool;
        if (filterVal !== 'all') {
            filtered = taskPool.filter(t => checkTaskMatchesUser(t, filterVal));
        }

        const total = filtered.length;
        const pending = filtered.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s === 'pending' || s === 'pendiente';
        }).length;
        const completed = filtered.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s === 'completed' || s === 'completada';
        }).length;

        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const totalEl = document.getElementById('schema-stat-total');
        const pendingEl = document.getElementById('schema-stat-pending');
        const completedEl = document.getElementById('schema-stat-completed');
        const pctEl = document.getElementById('schema-stat-progress-pct');
        const barEl = document.getElementById('schema-stat-progress-bar');

        if (totalEl) totalEl.innerText = total;
        if (pendingEl) pendingEl.innerText = pending;
        if (completedEl) completedEl.innerText = completed;
        if (pctEl) pctEl.innerText = `${pct}%`;
        if (barEl) barEl.style.width = `${pct}%`;
    }

    function applyCanvasCollaboratorHighlight() {
        const filterVal = schemaState.currentCollaboratorFilter || 'all';
        const schema = getActiveSchema();
        const taskCards = document.querySelectorAll('.canvas-dept-tasks .task-card');
        const deptColumns = document.querySelectorAll('.canvas-dept-column');

        // Remover floating pill anterior si existe
        const existingPill = document.getElementById('canvas-filter-floating-pill');
        if (existingPill) existingPill.remove();

        if (!filterVal || filterVal === 'all') {
            taskCards.forEach(card => {
                card.classList.remove('task-spotlight-focus', 'task-spotlight-dimmed');
                const tag = card.querySelector('.task-spotlight-tag');
                if (tag) tag.remove();
            });
            deptColumns.forEach(col => {
                col.classList.remove('dept-dimmed', 'dept-has-filtered');
                const chip = col.querySelector('.dept-filtered-counter-chip');
                if (chip) chip.remove();
            });
            return;
        }

        let matchCountTotal = 0;
        const deptCounts = {};

        taskCards.forEach(card => {
            const taskId = card.getAttribute('data-task-id');
            const task = (schema && schema.tasks) ? schema.tasks.find(t => t.id === taskId) : null;
            const assignee = card.getAttribute('data-assignee') || (task ? task.assignee : '');
            const isMatch = checkTaskMatchesUser({ assignee: assignee }, filterVal);

            if (isMatch) {
                matchCountTotal++;
                card.classList.add('task-spotlight-focus');
                card.classList.remove('task-spotlight-dimmed');

                let tag = card.querySelector('.task-spotlight-tag');
                if (!tag) {
                    tag = document.createElement('div');
                    tag.className = 'task-spotlight-tag';
                    tag.innerHTML = `<span class="material-symbols-outlined" style="font-size: 13px;">person_pin</span> Tarea de ${escapeHtml(assignee || filterVal)}`;
                    card.insertBefore(tag, card.firstChild);
                }

                const dept = task ? task.department : null;
                if (dept) {
                    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                }
            } else {
                card.classList.remove('task-spotlight-focus');
                card.classList.add('task-spotlight-dimmed');
                const tag = card.querySelector('.task-spotlight-tag');
                if (tag) tag.remove();
            }
        });

        // Actualizar encabezados de departamentos
        deptColumns.forEach(col => {
            const deptId = col.getAttribute('data-dept-id');
            const count = deptCounts[deptId] || 0;
            const header = col.querySelector('.dept-column-header h3');

            const prevChip = col.querySelector('.dept-filtered-counter-chip');
            if (prevChip) prevChip.remove();

            if (count > 0) {
                col.classList.add('dept-has-filtered');
                col.classList.remove('dept-dimmed');
                if (header) {
                    const chip = document.createElement('span');
                    chip.className = 'dept-filtered-counter-chip';
                    chip.innerText = `⭐ ${count} asignada${count === 1 ? '' : 's'}`;
                    header.appendChild(chip);
                }
            } else {
                col.classList.remove('dept-has-filtered');
                col.classList.add('dept-dimmed');
            }
        });

        // Píldora informativa inferior
        const viewport = document.getElementById('canvas-infinite-viewport');
        if (viewport) {
            const pill = document.createElement('div');
            pill.id = 'canvas-filter-floating-pill';
            pill.className = 'canvas-filter-floating-pill';
            pill.innerHTML = `
                <span class="material-symbols-outlined" style="font-size: 18px; color: #60A5FA;">person_search</span>
                <span>Filtrando por: <strong>${escapeHtml(filterVal)}</strong> (${matchCountTotal} en este pizarrón)</span>
                <button type="button" onclick="window.schemaEngine.setCollaboratorFilter('all')">Restablecer todos ✕</button>
            `;
            viewport.appendChild(pill);
        }
    }

    // Render de Nodos, Departamentos, Sub-departamentos, Notas y Conectores en el Lienzo
    function renderCanvasElements() {
        const schema = getActiveSchema();
        if (!schema) return;

        const nodesLayer = document.getElementById('canvas-nodes-layer');
        if (!nodesLayer) return;

        const calculatedTasks = evaluateTasks(schema.tasks || []);

        let html = '';

        // 1. Nodo Raíz Central (Tema Central / Proyecto)
        const rootPos = schema.rootPos || { x: 480, y: 40 };
        html += `
            <div class="canvas-root-card" id="canvas-node-root" style="left: ${rootPos.x}px; top: ${rootPos.y}px;" data-node-type="root">
                <div class="root-inner">
                    <div class="root-icon-badge" style="width: 44px; height: 44px; border-radius: 12px; background: rgba(37, 99, 235, 0.25); color: #60A5FA; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span class="material-symbols-outlined" style="font-size: 26px;">hub</span>
                    </div>
                    <div class="root-details" style="flex: 1;">
                        <span style="font-size: 10px; font-weight: 800; color: #93C5FD; letter-spacing: 1.5px; text-transform: uppercase;">TEMA CENTRAL</span>
                        <h2 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #FFFFFF;">${escapeHtml(schema.name || 'Tema Central')}</h2>
                        <p style="margin: 0 0 10px 0; font-size: 11px; color: #94A3B8; line-height: 1.3;">${escapeHtml(schema.description || 'Estructura operativa interdepartamental y tareas esquematizadas')}</p>
                        <!-- Botones según boceto: [+ Nuevo departamento] y [✏️ Editar nombre] -->
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button type="button" class="btn-root-add-dept" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.openNewDeptModal()" title="Añadir nuevo departamento">
                                <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">add</span> Nuevo departamento
                            </button>
                            <button type="button" class="btn-root-edit-name" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.openEditRootModal()" title="Editar nombre del tema central">
                                <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">edit</span> Editar nombre
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const depts = schema.departments || [];

        // Render de ramas departamentales con sus fichas y sub-departamentos
        depts.forEach((deptObj, idx) => {
            const deptName = deptObj.name || deptObj.id;
            const currentDeptId = deptObj.id || deptName;
            deptObj.id = currentDeptId;

            const conf = getDeptConfig(deptName, deptObj);
            const posX = deptObj.x !== undefined ? deptObj.x : (100 + idx * 420);
            const posY = deptObj.y !== undefined ? deptObj.y : 230;

            const subdepartments = deptObj.subdepartments || [];

            // Subdepartamentos HTML
            let subdeptsHtml = '';
            if (subdepartments.length > 0) {
                subdeptsHtml = subdepartments.map(sub => {
                    // Obtener tareas asignadas a este subdepartamento
                    const subTasks = calculatedTasks.filter(t => 
                        t.subdepartmentId === sub.id || 
                        (t.department === deptName && t.subdepartment === sub.name) ||
                        (!t.subdepartmentId && (t.department === deptName || t.departmentId === currentDeptId))
                    );

                    const subTasksHtml = subTasks.length > 0
                        ? subTasks.map(task => renderTaskCardHtml(task)).join('')
                        : `
                            <div style="padding: 16px 10px; text-align: center; border: 1.5px dashed #CBD5E1; border-radius: 14px; background: #F8FAFC;">
                                <span class="material-symbols-outlined" style="font-size: 22px; color: #94A3B8;">assignment_add</span>
                                <p style="margin: 4px 0 8px 0; font-size: 11px; font-weight: 600; color: #64748B;">Sin tareas asignadas aún</p>
                                <button type="button" class="btn-subdept-add-task" onclick="event.stopPropagation(); window.schemaEngine.openAddTaskForSubDept('${currentDeptId}', '${sub.id}')" style="justify-content: center; width: 100%;">
                                    <span class="material-symbols-outlined" style="font-size: 13px; pointer-events: none;">add</span> Crear Tarea
                                </button>
                            </div>
                        `;

                    return `
                        <div class="canvas-subdept-card" id="canvas-subdept-card-${sub.id}">
                            <!-- Cabecera Oval del Sub-departamento (Exacto a boceto: • Portilaw / Sistema MVE / Roberto Miranda) -->
                            <div class="subdept-pill-header">
                                <div class="subdept-pill-top">
                                    <span class="subdept-title" onclick="event.stopPropagation(); window.schemaEngine.openEditSubDeptModal('${currentDeptId}', '${sub.id}')" style="cursor: pointer;" title="Editar sub-departamento">
                                        <span style="color: #2563EB; font-size: 18px;">•</span> ${escapeHtml(sub.name)}
                                    </span>
                                    <div style="display: flex; gap: 4px;">
                                        <button type="button" class="btn-card-action" onclick="event.stopPropagation(); window.schemaEngine.openEditSubDeptModal('${currentDeptId}', '${sub.id}')" title="Editar sub-departamento" style="background: none; border: none; cursor: pointer; color: #94A3B8; padding: 2px;">
                                            <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">edit</span>
                                        </button>
                                        <button type="button" class="btn-card-action" onclick="event.stopPropagation(); window.schemaEngine.deleteSubDepartment('${currentDeptId}', '${sub.id}')" title="Eliminar sub-departamento" style="background: none; border: none; cursor: pointer; color: #94A3B8; padding: 2px;">
                                            <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <p class="subdept-desc">${escapeHtml(sub.description || '')}</p>
                                <div class="subdept-manager-badge" onclick="event.stopPropagation(); window.schemaEngine.openEditSubDeptModal('${currentDeptId}', '${sub.id}')" style="cursor: pointer;" title="Clic para cambiar encargado de ${escapeHtml(sub.name)}">
                                    <span class="material-symbols-outlined" style="font-size: 13px;">person</span>
                                    <span>${escapeHtml(sub.manager || 'Roberto Miranda')}</span>
                                    <span class="material-symbols-outlined" style="font-size: 12px; margin-left: 2px; color: #94A3B8;">edit</span>
                                </div>
                            </div>

                            <!-- Tareas Esquematizadas dentro del Sub-departamento (Requisito explícito del usuario) -->
                            <div class="canvas-subdept-tasks">
                                <div class="subdept-tasks-bar">
                                    <span class="subdept-tasks-title">
                                        <span class="material-symbols-outlined" style="font-size: 14px; color: #2563EB;">task_alt</span>
                                        Tareas Esquematizadas (${subTasks.length})
                                    </span>
                                    <button type="button" class="btn-subdept-add-task" onclick="event.stopPropagation(); window.schemaEngine.openAddTaskForSubDept('${currentDeptId}', '${sub.id}')" title="Añadir tarea esquematizada">
                                        <span class="material-symbols-outlined" style="font-size: 14px; pointer-events: none;">add</span> Añadir tarea
                                    </button>
                                </div>

                                ${subTasksHtml}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                subdeptsHtml = `
                    <div style="padding: 18px 16px; text-align: center; border: 2px dashed #CBD5E1; border-radius: 18px; background: #FFFFFF; width: 280px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                        <span class="material-symbols-outlined" style="font-size: 26px; color: #3B82F6;">add_circle</span>
                        <p style="margin: 6px 0 2px 0; font-size: 12px; font-weight: 700; color: #1E293B;">Sin sub-departamentos</p>
                        <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748B;">Usa el botón (+) para crear sub-departamentos y esquematizar tareas dentro de ellos.</p>
                        <button type="button" class="btn-primary-action" onclick="event.stopPropagation(); window.schemaEngine.openNewSubDeptModal('${currentDeptId}')" style="width: 100%; justify-content: center; font-size: 11px; padding: 6px 12px; background: #2563EB; cursor: pointer;">
                            <span class="material-symbols-outlined" style="font-size: 14px; pointer-events: none;">add</span> Añadir Sub-departamento
                        </button>
                    </div>
                `;
            }

            html += `
                <div class="canvas-dept-branch" id="canvas-node-dept-${currentDeptId}" style="left: ${posX}px; top: ${posY}px;" data-node-type="dept" data-dept-id="${currentDeptId}">
                    <!-- Ficha Principal de Departamento (Exacto a boceto: IT / Desarrollo Software / Roberto Miranda / Botón (+)) -->
                    <div class="canvas-dept-main-card" id="canvas-dept-main-${currentDeptId}" style="border-top: 4px solid ${conf.color};">
                        <div style="padding: 14px 16px; background: ${conf.bg}; border-bottom: 1px solid #F1F5F9;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span class="material-symbols-outlined" style="color: ${conf.color}; font-size: 22px;">${conf.icon}</span>
                                    <strong style="font-size: 16px; font-weight: 800; color: #0F172A; text-transform: uppercase;">${escapeHtml(deptName)}</strong>
                                </div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <!-- Botón (+) redondo para añadir subdepartamento (Exacto a boceto) -->
                                    <button type="button" class="btn-dept-add-sub" onclick="event.stopPropagation(); window.schemaEngine.openNewSubDeptModal('${currentDeptId}')" title="Añadir sub-departamento a ${escapeHtml(deptName)}">
                                        <span class="material-symbols-outlined" style="font-size: 20px; pointer-events: none;">add</span>
                                    </button>
                                    <!-- Botón Lápiz para editar departamento (nombre, descripción, encargado) según Imagen 1 -->
                                    <button type="button" class="btn-dept-edit" onclick="event.stopPropagation(); window.schemaEngine.openEditDeptModal('${currentDeptId}')" title="Editar departamento: nombre, descripción y encargado">
                                        <span class="material-symbols-outlined" style="font-size: 18px; pointer-events: none;">edit</span>
                                    </button>
                                </div>
                            </div>
                            <p style="margin: 2px 0 6px 0; font-size: 12px; color: #475569; font-weight: 500;">${escapeHtml(deptObj.description || 'Área operativa')}</p>
                            <!-- Badge de Encargado de Departamento (Clickable para editar directamente) -->
                            <div class="dept-manager-badge" onclick="event.stopPropagation(); window.schemaEngine.openEditDeptModal('${currentDeptId}')" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; cursor: pointer; padding: 3px 8px; border-radius: 8px; background: rgba(37, 99, 235, 0.08); border: 1px dashed rgba(37, 99, 235, 0.3); transition: all 0.2s ease;" title="Clic para cambiar el encargado de ${escapeHtml(deptName)}">
                                <span class="material-symbols-outlined" style="font-size: 14px; color: #2563EB;">person</span>
                                <span style="font-size: 11px; font-weight: 700; color: #1E293B;">${escapeHtml(deptObj.manager || 'Roberto Miranda')}</span>
                                <span class="material-symbols-outlined" style="font-size: 13px; color: #2563EB; margin-left: 2px;">edit</span>
                                <span style="font-size: 10px; color: #94A3B8; margin-left: 8px;">${subdepartments.length} sub-dept.</span>
                            </div>
                        </div>
                    </div>

                    <!-- Fila de Sub-departamentos subordinados (Pueden haber varios en un departamento según boceto) -->
                    <div class="canvas-subdepts-row" id="canvas-subdepts-row-${currentDeptId}">
                        ${subdeptsHtml}
                    </div>
                </div>
            `;
        });

        // 3. Textos conceptuales flotantes (Imagen 2: PROYECTO ADMOND, características, etc.)
        if (schema.conceptTexts && Array.isArray(schema.conceptTexts)) {
            schema.conceptTexts.forEach(item => {
                html += `
                    <div class="canvas-concept-text ${item.type || 'concept-body'}" id="canvas-text-${item.id}" style="left: ${item.x}px; top: ${item.y}px;" data-node-type="text" data-text-id="${item.id}">
                        ${item.text.replace(/\n/g, '<br>')}
                    </div>
                `;
            });
        }

        // 4. Notas adhesivas (Post-its)
        if (schema.stickyNotes && Array.isArray(schema.stickyNotes)) {
            schema.stickyNotes.forEach(note => {
                html += `
                    <div class="canvas-sticky-note sticky-${note.color || 'yellow'}" id="canvas-sticky-${note.id}" style="left: ${note.x}px; top: ${note.y}px;" data-node-type="sticky" data-sticky-id="${note.id}">
                        <div class="sticky-header">
                            <div class="sticky-pin"></div>
                            <button type="button" class="sticky-delete-btn" onclick="window.schemaEngine.deleteSticky('${note.id}')" title="Eliminar nota">✕</button>
                        </div>
                        <textarea class="sticky-content" onchange="window.schemaEngine.updateStickyText('${note.id}', this.value)">${escapeHtml(note.text)}</textarea>
                    </div>
                `;
            });
        }

        nodesLayer.innerHTML = html;

        // Renderizar flechas y conectores SVG
        setTimeout(renderSvgConnectors, 20);
        setTimeout(applyCanvasCollaboratorHighlight, 25);
    }

    function getAssigneeInitials(name) {
        if (!name || name === 'Sin asignar') return 'U';
        const clean = name.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return clean.substring(0, 2).toUpperCase() || 'U';
    }

    // Render de tarjeta de tarea individual (Formato idéntico a Imagen 1)
    function renderTaskCardHtml(task) {
        const rawPriority = (task.priority || 'alta').toLowerCase();
        const priority = ['alta', 'media', 'baja'].includes(rawPriority) ? rawPriority : 'alta';
        const isCompleted = task.status === 'completed';
        const initials = getAssigneeInitials(task.assignee);
        const assigneeName = escapeHtml(task.assignee || 'Sin asignar');

        // Botón de acción / estatus (Idéntico a Imagen 1: ◯ Pendiente / ✓ Completada / 🔒 Bloqueada)
        let actionBtnHtml = '';
        if (isCompleted) {
            actionBtnHtml = `
                <button type="button" class="btn-complete-task completed" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.toggleTaskStatus('${task.id}')" title="Reabrir tarea">
                    <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">check_circle</span>
                    <span>Completada</span>
                </button>
            `;
        } else if (task.isBlocked) {
            actionBtnHtml = `
                <button type="button" class="btn-complete-task disabled" disabled title="Bloqueada por requisitos no completados">
                    <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">lock</span>
                    <span>Bloqueada</span>
                </button>
            `;
        } else {
            actionBtnHtml = `
                <button type="button" class="btn-complete-task" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.toggleTaskStatus('${task.id}')" title="Marcar como completada">
                    <span class="material-symbols-outlined" style="font-size: 16px; pointer-events: none;">radio_button_unchecked</span>
                    <span>Pendiente</span>
                </button>
            `;
        }

        // Advertencia si la tarea frena a otras (Cuello de botella)
        let bottleneckWarningHtml = '';
        if (task.isBottleneck) {
            const depNames = task.dependents.map(d => escapeHtml(d.department)).join(', ');
            bottleneckWarningHtml = `
                <div class="task-bottleneck-warning" title="Esta tarea detiene la operación de otras áreas">
                    <span class="material-symbols-outlined pulse-icon" style="font-size: 14px;">priority_high</span>
                    <span><strong>Frena a ${task.dependents.length} tarea${task.dependents.length === 1 ? '' : 's'}</strong> (${depNames})</span>
                </div>
            `;
        }

        // Alerta de bloqueo
        let blockedAlertHtml = '';
        if (task.isBlocked) {
            const blockingNames = task.blockingTasks.map(bt => 
                `<strong>[${escapeHtml(bt.department)}] ${escapeHtml(bt.title)}</strong>`
            ).join(' y ');

            blockedAlertHtml = `
                <div class="task-blocked-notice">
                    <div class="notice-header">
                        <span class="material-symbols-outlined" style="font-size: 13px;">lock_clock</span>
                        <span>OPERACIÓN DETENIDA AQUÍ</span>
                    </div>
                    <p class="notice-desc">
                        No se puede proceder con esta tarea ya que espera que se termine primero: ${blockingNames}.
                    </p>
                    <div class="notice-actions">
                        ${task.blockingTasks.map(bt => `
                            <button type="button" class="btn-jump-block" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.focusTask('${bt.id}')" title="Ver tarea que bloquea">
                                Ver ${escapeHtml(bt.department)} →
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const cardClass = `task-card schema-task-card priority-${priority} status-${task.status} ${task.isBlocked ? 'is-blocked' : ''}`;

        return `
            <div class="${cardClass}" id="schema-task-card-${task.id}" data-task-id="${task.id}" data-assignee="${escapeHtml(task.assignee || '')}">
                <!-- Encabezado: Título + Icono de Edición + Badge de Prioridad (Imagen 1) -->
                <div class="task-card-header">
                    <h4>${escapeHtml(task.title)}</h4>
                    <button type="button" class="btn-edit-task" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.openEditModal('${task.id}')" title="Editar tarea">
                        <span class="material-symbols-outlined" style="font-size: 17px; pointer-events: none;">edit</span>
                    </button>
                    <span class="priority-badge ${priority}">${priority.toUpperCase()}</span>
                </div>

                <!-- Descripción de la tarea (Imagen 1) -->
                ${(task.description || task.desc) ? `<p class="task-desc-p">${escapeHtml(task.description || task.desc)}</p>` : ''}

                ${bottleneckWarningHtml}
                ${blockedAlertHtml}

                <!-- Pie de tarjeta: Avatar + Nombre + Botón Estatus + Ramificar + Eliminar (Imagen 1) -->
                <div class="task-card-footer">
                    <div class="task-assignee-info" title="Asignado a: ${assigneeName}">
                        <div class="assignee-avatar">${initials}</div>
                        <span class="assignee-name">${assigneeName}</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${actionBtnHtml}
                        <!-- Botón para entrelazar tareas y bloquear avance (Imagen 3) -->
                        <button type="button" class="btn-branch-task ${(task.dependencies && task.dependencies.length) ? 'has-dependencies' : ''} ${(task.dependents && task.dependents.length) ? 'has-dependents' : ''}" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.openLinkTaskModal('${task.id}')" title="Entrelazar tarea y bloquear avance de otra">
                            <span class="material-symbols-outlined" style="font-size: 17px; pointer-events: none;">alt_route</span>
                        </button>
                        <button type="button" class="btn-delete-task" onmousedown="event.stopPropagation()" onclick="window.schemaEngine.deleteTask('${task.id}')" title="Eliminar tarea">
                            <span class="material-symbols-outlined" style="font-size: 17px; pointer-events: none;">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Render de Flechas y Conectores Dinámicos SVG (IMAGEN 2: Tareas, Departamentos y Subdepartamentos Entrelazados)
    function renderSvgConnectors() {
        const svgLayer = document.getElementById('canvas-svg-layer');
        if (!svgLayer) return;

        const schema = getActiveSchema();
        if (!schema) return;

        // Marcadores de flechas para cada tipo de conexión
        const defsHtml = `
            <defs>
                <marker id="arrow-locked" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#EF4444" />
                </marker>
                <marker id="arrow-unlocked" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#10B981" />
                </marker>
                <marker id="arrow-neutral" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
                </marker>
                <marker id="arrow-dept" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563EB" />
                </marker>
            </defs>
        `;

        let pathsHtml = defsHtml;

        const surface = document.getElementById('canvas-surface');
        if (!surface) return;

        const surfaceRect = surface.getBoundingClientRect();
        const scale = schemaState.scale || 1.0;

        function getCardCenter(elementId) {
            const el = document.getElementById(elementId);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
                x: (r.left - surfaceRect.left + r.width / 2) / scale,
                y: (r.top - surfaceRect.top + r.height / 2) / scale,
                top: (r.top - surfaceRect.top) / scale,
                bottom: (r.bottom - surfaceRect.top) / scale,
                left: (r.left - surfaceRect.left) / scale,
                right: (r.right - surfaceRect.left) / scale,
                width: r.width / scale,
                height: r.height / scale
            };
        }

        // 1. Conexión desde el Tema Raíz hacia cada Departamento con Troncal Horizontal (Imagen 2)
        const rootCenter = getCardCenter('canvas-node-root');
        if (rootCenter && schema.departments && schema.departments.length > 0) {
            const deptBoxes = schema.departments
                .map(d => ({ dept: d, box: getCardCenter(`canvas-dept-main-${d.id}`) || getCardCenter(`canvas-node-dept-${d.id}`) }))
                .filter(item => item.box !== null);

            if (deptBoxes.length > 0) {
                const minDeptX = Math.min(...deptBoxes.map(d => d.box.x));
                const maxDeptX = Math.max(...deptBoxes.map(d => d.box.x));
                const minDeptTop = Math.min(...deptBoxes.map(d => d.box.top));

                // Nivel de la barra troncal horizontal superior
                const trunkY = Math.max(rootCenter.bottom + 20, minDeptTop - 35);

                // Línea vertical desde el Tema Central hasta la barra troncal
                pathsHtml += `
                    <path d="M ${rootCenter.x} ${rootCenter.bottom} L ${rootCenter.x} ${trunkY}" 
                          class="canvas-svg-arrow tree-arrow trunk" />
                `;

                // Barra troncal horizontal que une y entrelaza todos los departamentos (incluyendo el rootCenter si esta desplazado)
                const minTrunkX = Math.min(rootCenter.x, minDeptX);
                const maxTrunkX = Math.max(rootCenter.x, maxDeptX);
                if (maxTrunkX > minTrunkX) {
                    pathsHtml += `
                        <path d="M ${minTrunkX} ${trunkY} L ${maxTrunkX} ${trunkY}" 
                              class="canvas-svg-arrow tree-arrow trunk" />
                    `;
                }

                // Bajadas verticales desde la troncal hacia la cabecera de cada departamento
                deptBoxes.forEach(item => {
                    const dx = item.box.x;
                    const dTop = item.box.top;
                    pathsHtml += `
                        <path d="M ${dx} ${trunkY} L ${dx} ${dTop}" 
                              class="canvas-svg-arrow tree-arrow" 
                              marker-end="url(#arrow-neutral)" />
                    `;
                });
            }
        }

        // 2. Conexión desde cada Departamento hacia sus Sub-departamentos (según boceto del usuario)
        if (schema.departments) {
            schema.departments.forEach(deptObj => {
                const deptCard = getCardCenter(`canvas-dept-main-${deptObj.id}`);
                if (!deptCard || !deptObj.subdepartments || deptObj.subdepartments.length === 0) return;

                const subCenters = deptObj.subdepartments
                    .map(s => ({ sub: s, box: getCardCenter(`canvas-subdept-card-${s.id}`) }))
                    .filter(item => item.box !== null);

                if (subCenters.length === 0) return;

                const x1 = deptCard.x;
                const y1 = deptCard.bottom;

                if (subCenters.length === 1) {
                    // Conector simple directo
                    const targetBox = subCenters[0].box;
                    const x2 = targetBox.x;
                    const y2 = targetBox.top;
                    pathsHtml += `
                        <path d="M ${x1} ${y1} L ${x2} ${y2}" 
                              class="canvas-svg-arrow tree-arrow" 
                              marker-end="url(#arrow-neutral)" />
                    `;
                } else {
                    // Conector en horquilla ortogonal para múltiples subdepartamentos
                    const minY = Math.min(...subCenters.map(s => s.box.top));
                    const forkY = y1 + (minY - y1) * 0.45;

                    const minX = Math.min(...subCenters.map(s => s.box.x));
                    const maxX = Math.max(...subCenters.map(s => s.box.x));

                    pathsHtml += `<path d="M ${x1} ${y1} L ${x1} ${forkY}" class="canvas-svg-arrow tree-arrow" />`;
                    pathsHtml += `<path d="M ${minX} ${forkY} L ${maxX} ${forkY}" class="canvas-svg-arrow tree-arrow" />`;

                    subCenters.forEach(item => {
                        const sx = item.box.x;
                        const sy = item.box.top;
                        pathsHtml += `
                            <path d="M ${sx} ${forkY} L ${sx} ${sy}" 
                                  class="canvas-svg-arrow tree-arrow" 
                                  marker-end="url(#arrow-neutral)" />
                        `;
                    });
                }
            });
        }

        // 3. Conexiones de tareas entrelazadas entre departamentos y sub-departamentos (Imagen 2 y 3)
        const calculatedTasks = evaluateTasks(schema.tasks || []);

        calculatedTasks.forEach(targetTask => {
            if (targetTask.dependencies && targetTask.dependencies.length > 0) {
                targetTask.dependencies.forEach(sourceId => {
                    const sourceTask = calculatedTasks.find(t => t.id === sourceId);
                    if (!sourceTask) return;

                    const sourceBox = getCardCenter(`schema-task-card-${sourceTask.id}`);
                    const targetBox = getCardCenter(`schema-task-card-${targetTask.id}`);

                    if (sourceBox && targetBox) {
                        const isSourceDone = sourceTask.status === 'completed';

                        let x1, y1, x2, y2;
                        if (sourceBox.right < targetBox.left) {
                            x1 = sourceBox.right;
                            y1 = sourceBox.y;
                            x2 = targetBox.left;
                            y2 = targetBox.y;
                        } else if (sourceBox.left > targetBox.right) {
                            x1 = sourceBox.left;
                            y1 = sourceBox.y;
                            x2 = targetBox.right;
                            y2 = targetBox.y;
                        } else {
                            x1 = sourceBox.right;
                            y1 = sourceBox.bottom;
                            x2 = targetBox.right;
                            y2 = targetBox.top;
                        }

                        const dx = Math.max(Math.abs(x2 - x1) * 0.45, 45);
                        const cx1 = x1 + (x2 >= x1 ? dx : -dx);
                        const cy1 = y1;
                        const cx2 = x2 - (x2 >= x1 ? dx : -dx);
                        const cy2 = y2;

                        const arrowClass = isSourceDone ? 'unlocked-arrow' : 'blocked-arrow';
                        const markerId = isSourceDone ? 'arrow-unlocked' : 'arrow-locked';

                        pathsHtml += `
                            <path d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}" 
                                  class="canvas-svg-arrow ${arrowClass}" 
                                  marker-end="url(#${markerId})" />
                        `;

                        // Etiqueta flotante explicativa en el centro de la curva de bloqueo
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        if (!isSourceDone) {
                            pathsHtml += `
                                <g class="connector-label" transform="translate(${midX - 58}, ${midY - 12})">
                                    <rect width="116" height="24" rx="12" fill="#FEF2F2" stroke="#EF4444" stroke-width="1.5" />
                                    <text x="58" y="16" fill="#DC2626" font-size="10.5" font-weight="800" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">🔒 Bloquea avance</text>
                                </g>
                            `;
                        } else {
                            pathsHtml += `
                                <g class="connector-label" transform="translate(${midX - 58}, ${midY - 12})">
                                    <rect width="116" height="24" rx="12" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5" />
                                    <text x="58" y="16" fill="#059669" font-size="10.5" font-weight="800" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif">✓ Desbloqueada</text>
                                </g>
                            `;
                        }
                    }
                });
            }
        });

        svgLayer.innerHTML = pathsHtml;
    }

    // Transformación y manejo de Zoom / Pan del Pizarrón
    function updateCanvasTransform() {
        const surface = document.getElementById('canvas-surface');
        const viewport = document.getElementById('canvas-infinite-viewport');
        const zoomLabel = document.getElementById('canvas-zoom-label');

        if (surface) {
            surface.style.transform = `translate(${schemaState.panX}px, ${schemaState.panY}px) scale(${schemaState.scale})`;
        }

        if (viewport) {
            // Ajustar el fondo de puntos para que se desplace exactamente con el pan
            viewport.style.backgroundPosition = `${schemaState.panX}px ${schemaState.panY}px`;
            viewport.style.backgroundSize = `${26 * schemaState.scale}px ${26 * schemaState.scale}px`;
        }

        if (zoomLabel) {
            zoomLabel.innerText = Math.round(schemaState.scale * 100) + '%';
        }
    }

    // Eventos del Lienzo (Pan, Zoom, Arrastre de Tarjetas)
    function attachCanvasEvents() {
        const viewport = document.getElementById('canvas-infinite-viewport');
        if (!viewport || viewport.dataset.eventsBound) return;
        viewport.dataset.eventsBound = 'true';

        let lastMouseX = 0;
        let lastMouseY = 0;

        // MOUSE DOWN
        viewport.addEventListener('mousedown', function(e) {
            // Si el clic fue en cualquier botón, enlace, input, dropdown o elemento interactivo, no iniciar pan/drag de canvas
            if (e.target.closest('button, input, textarea, select, a, label, .dept-dropdown-menu, .dept-menu-wrapper, .btn-primary-action, .btn-dept-menu, .btn-dept-edit, .btn-dept-add-sub, .dept-manager-badge, .subdept-manager-badge, .btn-subdept-add-task, .btn-root-add-dept, .btn-root-edit-name, .btn-card-action, .btn-card-toggle, .btn-add-task-col, .btn-branch-task, .btn-delete-task, .btn-complete-task, .task-item, [onclick]')) {
                return;
            }

            const clientX = e.clientX;
            const clientY = e.clientY;
            lastMouseX = clientX;
            lastMouseY = clientY;

            // Comprobar si se hizo clic en un nodo arrastrable
            const nodeEl = e.target.closest('[data-node-type]');
            if (nodeEl && schemaState.activeTool === 'select') {
                schemaState.isDraggingNode = true;
                schemaState.dragTarget = nodeEl;
                schemaState.dragStartMouse = { x: clientX, y: clientY };

                const currentLeft = parseFloat(nodeEl.style.left) || 0;
                const currentTop = parseFloat(nodeEl.style.top) || 0;
                schemaState.dragStartNodePos = { x: currentLeft, y: currentTop };
                
                // Traer al frente
                nodeEl.style.zIndex = '35';
                e.preventDefault();
                return;
            }

            // Si es herramienta de dibujo
            if (schemaState.activeTool === 'draw') {
                startDrawing(e);
                return;
            }

            // De lo contrario, iniciar Pan del Pizarrón
            schemaState.isPanning = true;
            viewport.classList.add('panning');
            e.preventDefault();
        });

        // MOUSE MOVE
        window.addEventListener('mousemove', function(e) {
            const clientX = e.clientX;
            const clientY = e.clientY;
            const dx = clientX - lastMouseX;
            const dy = clientY - lastMouseY;
            lastMouseX = clientX;
            lastMouseY = clientY;

            // Arrastre de Nodo
            if (schemaState.isDraggingNode && schemaState.dragTarget) {
                const totalDx = (clientX - schemaState.dragStartMouse.x) / schemaState.scale;
                const totalDy = (clientY - schemaState.dragStartMouse.y) / schemaState.scale;

                const newX = Math.round(schemaState.dragStartNodePos.x + totalDx);
                const newY = Math.round(schemaState.dragStartNodePos.y + totalDy);

                schemaState.dragTarget.style.left = `${newX}px`;
                schemaState.dragTarget.style.top = `${newY}px`;

                // Recalcular flechas conectadas
                renderSvgConnectors();
                return;
            }

            // Pan del Canvas
            if (schemaState.isPanning) {
                schemaState.panX += dx;
                schemaState.panY += dy;
                updateCanvasTransform();
                return;
            }

            // Dibujo libre
            if (schemaState.isDrawing) {
                draw(e);
            }
        });

        // MOUSE UP
        window.addEventListener('mouseup', function(e) {
            if (schemaState.isDraggingNode && schemaState.dragTarget) {
                // Guardar la nueva posición en el esquema
                saveNodePosition(schemaState.dragTarget);
                schemaState.dragTarget.style.zIndex = '';
                schemaState.isDraggingNode = false;
                schemaState.dragTarget = null;
            }

            if (schemaState.isPanning) {
                schemaState.isPanning = false;
                viewport.classList.remove('panning');
                saveSchemasToLocal();
            }

            if (schemaState.isDrawing) {
                stopDrawing();
            }
        });

        // WHEEL (ZOOM INFINITO CENTRADO EN MOUSE)
        viewport.addEventListener('wheel', function(e) {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
            zoomAtPoint(e.clientX, e.clientY, zoomFactor);
        }, { passive: false });
    }

    function zoomAtPoint(clientX, clientY, factor) {
        const viewport = document.getElementById('canvas-infinite-viewport');
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const newScale = Math.min(Math.max(schemaState.scale * factor, 0.25), 2.5);
        if (newScale === schemaState.scale) return;

        // Ajustar panX y panY para que el punto bajo el mouse no se mueva
        schemaState.panX = mouseX - (mouseX - schemaState.panX) * (newScale / schemaState.scale);
        schemaState.panY = mouseY - (mouseY - schemaState.panY) * (newScale / schemaState.scale);
        schemaState.scale = newScale;

        updateCanvasTransform();
        renderSvgConnectors();
        saveSchemasToLocal();
    }

    function zoomStep(delta) {
        const viewport = document.getElementById('canvas-infinite-viewport');
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const factor = delta > 0 ? 1.15 : 0.85;
        zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    }

    function resetZoom() {
        schemaState.scale = 1.0;
        updateCanvasTransform();
        renderSvgConnectors();
        saveSchemasToLocal();
    }

    function centerCanvas() {
        schemaState.panX = 60;
        schemaState.panY = 30;
        schemaState.scale = 0.95;
        updateCanvasTransform();
        renderSvgConnectors();
        saveSchemasToLocal();
        showToast('Vista centrada en el esquema.', 'info');
    }

    // Auto-organizar cuadrícula y flowchart
    function autoArrange() {
        const schema = getActiveSchema();
        if (!schema) return;

        schema.rootPos = { x: 500, y: 40 };

        if (schema.departments && Array.isArray(schema.departments)) {
            schema.departments.forEach((dept, idx) => {
                dept.x = 60 + idx * 360;
                dept.y = 200;
            });
        }

        saveSchemasToLocal();
        renderSchemaView();
        centerCanvas();
        showToast('Nodos organizados automáticamente.', 'success');
    }

    // Guardar posición del nodo tras arrastrarlo
    function saveNodePosition(nodeEl) {
        const schema = getActiveSchema();
        if (!schema) return;

        const posX = Math.round(parseFloat(nodeEl.style.left) || 0);
        const posY = Math.round(parseFloat(nodeEl.style.top) || 0);
        const nodeType = nodeEl.dataset.nodeType;

        if (nodeType === 'root') {
            schema.rootPos = { x: posX, y: posY };
        } else if (nodeType === 'dept') {
            const deptId = nodeEl.dataset.deptId;
            const dept = (schema.departments || []).find(d => d.id === deptId);
            if (dept) {
                dept.x = posX;
                dept.y = posY;
            }
        } else if (nodeType === 'text') {
            const textId = nodeEl.dataset.textId;
            const item = (schema.conceptTexts || []).find(t => t.id === textId);
            if (item) {
                item.x = posX;
                item.y = posY;
            }
        } else if (nodeType === 'sticky') {
            const stickyId = nodeEl.dataset.stickyId;
            const note = (schema.stickyNotes || []).find(s => s.id === stickyId);
            if (note) {
                note.x = posX;
                note.y = posY;
            }
        }

        saveSchemasToLocal();
    }

    // Dibujo Libre con Lápiz
    let drawCtx = null;
    function initDrawingCanvas() {
        const canvas = document.getElementById('canvas-drawing-layer');
        if (!canvas) return;
        canvas.width = 10000;
        canvas.height = 10000;
        drawCtx = canvas.getContext('2d');
        drawCtx.strokeStyle = '#EF4444';
        drawCtx.lineWidth = 3;
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
    }

    function startDrawing(e) {
        if (!drawCtx) initDrawingCanvas();
        if (!drawCtx) return;

        const surface = document.getElementById('canvas-surface');
        const sRect = surface.getBoundingClientRect();

        const x = (e.clientX - sRect.left) / schemaState.scale;
        const y = (e.clientY - sRect.top) / schemaState.scale;

        schemaState.isDrawing = true;
        drawCtx.beginPath();
        drawCtx.moveTo(x, y);
    }

    function draw(e) {
        if (!schemaState.isDrawing || !drawCtx) return;

        const surface = document.getElementById('canvas-surface');
        const sRect = surface.getBoundingClientRect();

        const x = (e.clientX - sRect.left) / schemaState.scale;
        const y = (e.clientY - sRect.top) / schemaState.scale;

        drawCtx.lineTo(x, y);
        drawCtx.stroke();
    }

    function stopDrawing() {
        if (schemaState.isDrawing && drawCtx) {
            schemaState.isDrawing = false;
            drawCtx.closePath();
        }
    }

    // Herramientas de la Barra Lateral Izquierda (Imagen 2)
    function setTool(toolName) {
        schemaState.activeTool = toolName;

        const buttons = document.querySelectorAll('.canvas-tool-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        const targetBtn = document.getElementById(`tool-btn-${toolName}`);
        if (targetBtn) targetBtn.classList.add('active');

        const viewport = document.getElementById('canvas-infinite-viewport');
        if (viewport) {
            viewport.classList.remove('drawing', 'connecting');
            if (toolName === 'draw') viewport.classList.add('drawing');
            if (toolName === 'connect') viewport.classList.add('connecting');
        }

        if (toolName === 'eraser') {
            if (drawCtx) {
                drawCtx.clearRect(0, 0, 10000, 10000);
                showToast('Trazos del lienzo borrados.', 'info');
            }
            setTool('select');
        }
    }

    function toggleToolbar() {
        const tb = document.getElementById('canvas-floating-toolbar');
        if (tb) tb.classList.toggle('collapsed');
    }

    // Añadir Nota Adhesiva en el centro visible
    function addStickyNoteAtCenter() {
        const schema = getActiveSchema();
        if (!schema) return;

        if (!schema.stickyNotes) schema.stickyNotes = [];

        // Calcular posición central de la pantalla en coordenadas del lienzo
        const viewport = document.getElementById('canvas-infinite-viewport');
        const r = viewport ? viewport.getBoundingClientRect() : { width: 800, height: 600 };
        const posX = Math.round((-schemaState.panX + r.width / 2 - 100) / schemaState.scale);
        const posY = Math.round((-schemaState.panY + r.height / 2 - 80) / schemaState.scale);

        const colors = ['yellow', 'green', 'pink', 'blue'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newNote = {
            id: 'sticky-' + Date.now().toString(36),
            color: randomColor,
            text: 'Escribe aquí tu nota adhesiva...',
            x: posX,
            y: posY
        };

        schema.stickyNotes.push(newNote);
        saveSchemasToLocal();
        renderCanvasElements();
        setTool('select');
        showToast('Nota adhesiva añadida al pizarrón.', 'success');
    }

    function updateStickyText(id, newText) {
        const schema = getActiveSchema();
        if (!schema || !schema.stickyNotes) return;
        const note = schema.stickyNotes.find(s => s.id === id);
        if (note) {
            note.text = newText;
            saveSchemasToLocal();
        }
    }

    function deleteSticky(id) {
        const schema = getActiveSchema();
        if (!schema || !schema.stickyNotes) return;
        schema.stickyNotes = schema.stickyNotes.filter(s => s.id !== id);
        saveSchemasToLocal();
        renderCanvasElements();
    }

    // Añadir Texto Libre en el centro
    function addTextNoteAtCenter() {
        const schema = getActiveSchema();
        if (!schema) return;

        const userText = prompt('Introduce el texto o título para el pizarrón:', 'Nueva Característica / Anotación');
        if (!userText || !userText.trim()) return;

        if (!schema.conceptTexts) schema.conceptTexts = [];

        const viewport = document.getElementById('canvas-infinite-viewport');
        const r = viewport ? viewport.getBoundingClientRect() : { width: 800, height: 600 };
        const posX = Math.round((-schemaState.panX + r.width / 2 - 120) / schemaState.scale);
        const posY = Math.round((-schemaState.panY + r.height / 2 - 40) / schemaState.scale);

        schema.conceptTexts.push({
            id: 'text-' + Date.now().toString(36),
            type: 'concept-body',
            text: userText.trim(),
            x: posX,
            y: posY
        });

        saveSchemasToLocal();
        renderCanvasElements();
        setTool('select');
        showToast('Texto añadido al lienzo.', 'success');
    }

    const DEPT_COLORS = [
        { name: 'Azul', hex: '#2563EB' },
        { name: 'Verde', hex: '#059669' },
        { name: 'Naranja', hex: '#D97706' },
        { name: 'Púrpura', hex: '#7C3AED' },
        { name: 'Rojo', hex: '#DC2626' },
        { name: 'Cyan', hex: '#0284C7' },
        { name: 'Rosa', hex: '#DB2777' },
        { name: 'Teal', hex: '#0D9488' },
        { name: 'Gris Oscuro', hex: '#334155' }
    ];

    // ========================================================
    // MODALES Y GESTIÓN: DEPARTAMENTOS, SUB-DEPARTAMENTOS Y TEMA
    // ========================================================

    // 1. NUEVO DEPARTAMENTO (Tema Central) -> Nombre, Descripción, Encargado, Color
    function openNewDeptModal() {
        const modal = document.getElementById('modal-schema-new-dept');
        if (!modal) return;

        const nameInput = document.getElementById('schema-new-dept-name');
        const descInput = document.getElementById('schema-new-dept-desc');
        const managerInput = document.getElementById('schema-new-dept-manager');
        const colorInput = document.getElementById('schema-new-dept-color');

        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        if (managerInput) managerInput.value = 'Roberto Miranda';
        updateCollabTriggerDisplay('schema-new-dept-manager', 'Roberto Miranda');
        if (colorInput) colorInput.value = '#2563EB';

        renderNewDeptColorPicker('#2563EB');
        modal.style.display = 'flex';
        setTimeout(() => { if (nameInput) nameInput.focus(); }, 60);
    }

    function closeNewDeptModal() {
        const modal = document.getElementById('modal-schema-new-dept');
        if (modal) modal.style.display = 'none';
    }

    function renderNewDeptColorPicker(selectedColor) {
        const container = document.getElementById('schema-new-dept-color-picker');
        if (!container) return;
        container.innerHTML = DEPT_COLORS.map(c => {
            const isSelected = c.hex.toLowerCase() === (selectedColor || '').toLowerCase();
            return `
                <button type="button" class="color-picker-swatch ${isSelected ? 'active' : ''}" 
                        style="background: ${c.hex};" 
                        title="${c.name}" 
                        onclick="window.schemaEngine.selectNewDeptColor('${c.hex}', this)">
                    ${isSelected ? '<span class="material-symbols-outlined" style="font-size: 16px; color: #FFF;">check</span>' : ''}
                </button>
            `;
        }).join('');
    }

    function selectNewDeptColor(hex, btnEl) {
        const input = document.getElementById('schema-new-dept-color');
        if (input) input.value = hex;
        const swatches = document.querySelectorAll('#schema-new-dept-color-picker .color-picker-swatch');
        swatches.forEach(s => {
            s.classList.remove('active');
            s.innerHTML = '';
        });
        if (btnEl) {
            btnEl.classList.add('active');
            btnEl.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: #FFF;">check</span>';
        }
    }

    function handleSaveNewDept(event) {
        if (event) event.preventDefault();
        const schema = getActiveSchema();
        if (!schema) return;

        const name = (document.getElementById('schema-new-dept-name').value || '').trim();
        const desc = (document.getElementById('schema-new-dept-desc').value || '').trim();
        const manager = (document.getElementById('schema-new-dept-manager').value || '').trim() || 'Roberto Miranda';
        const color = document.getElementById('schema-new-dept-color').value || '#2563EB';

        if (!name) {
            alert('Por favor introduce un nombre para el departamento.');
            return;
        }

        if (!schema.departments) schema.departments = [];

        // Calcular posición a la derecha
        let maxX = 100;
        if (schema.departments.length > 0) {
            const xPositions = schema.departments.map(d => (typeof d.x === 'number' ? d.x : 100));
            maxX = Math.max(...xPositions) + 420;
        }

        const newId = 'dept-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);

        schema.departments.push({
            id: newId,
            name: name,
            description: desc,
            manager: manager,
            color: color,
            x: maxX,
            y: 230,
            subdepartments: []
        });

        saveSchemasToLocal();
        closeNewDeptModal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Departamento "${name}" creado exitosamente. Usa el botón (+) para añadirle sub-departamentos.`, 'success');
    }

    function addDepartmentRight() {
        openNewDeptModal();
    }

    // 2. NUEVO SUB-DEPARTAMENTO (Botón (+) en ficha de Departamento) -> Nombre, Descripción, Encargado
    function openNewSubDeptModal(deptId) {
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept) {
            showToast('No se encontró el departamento padre.', 'error');
            return;
        }

        const modal = document.getElementById('modal-schema-new-subdept');
        if (!modal) return;

        const effectiveId = dept.id || dept.name || deptId;
        document.getElementById('schema-new-subdept-dept-id').value = effectiveId;
        const badge = document.getElementById('schema-new-subdept-parent-badge');
        if (badge) badge.innerText = `Departamento padre: ${dept.name || dept.id}`;

        const nameInput = document.getElementById('schema-new-subdept-name');
        const descInput = document.getElementById('schema-new-subdept-desc');
        const managerInput = document.getElementById('schema-new-subdept-manager');

        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        const defaultMgr = dept.manager || 'Roberto Miranda';
        if (managerInput) managerInput.value = defaultMgr;
        updateCollabTriggerDisplay('schema-new-subdept-manager', defaultMgr);

        modal.style.display = 'flex';
        setTimeout(() => { if (nameInput) nameInput.focus(); }, 60);
    }

    function closeNewSubDeptModal() {
        const modal = document.getElementById('modal-schema-new-subdept');
        if (modal) modal.style.display = 'none';
    }

    function handleSaveNewSubDept(event) {
        if (event) event.preventDefault();
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;

        const deptId = document.getElementById('schema-new-subdept-dept-id').value;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept) {
            showToast('No se encontró el departamento padre para guardar el sub-departamento.', 'error');
            return;
        }

        const name = (document.getElementById('schema-new-subdept-name').value || '').trim();
        const desc = (document.getElementById('schema-new-subdept-desc').value || '').trim();
        const manager = (document.getElementById('schema-new-subdept-manager').value || '').trim() || dept.manager || 'Roberto Miranda';

        if (!name) {
            alert('Por favor introduce un nombre para el sub-departamento.');
            return;
        }

        if (!Array.isArray(dept.subdepartments)) dept.subdepartments = [];

        const subId = 'subdept-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);

        dept.subdepartments.push({
            id: subId,
            name: name,
            description: desc,
            manager: manager
        });

        saveSchemasToLocal();
        closeNewSubDeptModal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Sub-departamento "${name}" añadido a ${dept.name}. Ahora puedes crear tareas esquematizadas dentro de él.`, 'success');
    }

    // 3. EDITAR SUB-DEPARTAMENTO
    function openEditSubDeptModal(deptId, subDeptId) {
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept || !dept.subdepartments) return;
        const sub = dept.subdepartments.find(s => s.id === subDeptId || s.name === subDeptId);
        if (!sub) return;

        const modal = document.getElementById('modal-schema-edit-subdept');
        if (!modal) return;

        const effectiveDeptId = dept.id || dept.name || deptId;
        const effectiveSubId = sub.id || sub.name || subDeptId;

        const deptIdInput = document.getElementById('schema-edit-subdept-dept-id');
        const subIdInput = document.getElementById('schema-edit-subdept-id');
        const nameInput = document.getElementById('schema-edit-subdept-name');
        const descInput = document.getElementById('schema-edit-subdept-desc');
        const managerInput = document.getElementById('schema-edit-subdept-manager');

        if (deptIdInput) deptIdInput.value = effectiveDeptId;
        if (subIdInput) subIdInput.value = effectiveSubId;
        if (nameInput) nameInput.value = sub.name || '';
        const defaultMgr = sub.manager || dept.manager || 'Roberto Miranda';
        if (managerInput) managerInput.value = defaultMgr;
        updateCollabTriggerDisplay('schema-edit-subdept-manager', defaultMgr);

        modal.style.display = 'flex';
        setTimeout(() => { if (nameInput) nameInput.focus(); }, 60);
    }

    function closeEditSubDeptModal() {
        const modal = document.getElementById('modal-schema-edit-subdept');
        if (modal) modal.style.display = 'none';
    }

    function handleSaveEditSubDept(event) {
        if (event) event.preventDefault();
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;

        const deptId = document.getElementById('schema-edit-subdept-dept-id').value;
        const subId = document.getElementById('schema-edit-subdept-id').value;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept || !dept.subdepartments) return;
        const sub = dept.subdepartments.find(s => s.id === subId || s.name === subId);
        if (!sub) return;

        const newName = (document.getElementById('schema-edit-subdept-name').value || '').trim();
        const newDesc = (document.getElementById('schema-edit-subdept-desc').value || '').trim();
        const newManager = (document.getElementById('schema-edit-subdept-manager').value || '').trim();

        if (!newName) {
            alert('Por favor introduce un nombre para el sub-departamento.');
            return;
        }

        const oldName = sub.name;
        sub.name = newName;
        sub.description = newDesc;
        sub.manager = newManager || dept.manager || 'Roberto Miranda';

        // Actualizar tareas asociadas
        if (schema.tasks && oldName !== newName) {
            schema.tasks.forEach(t => {
                if (t.subdepartmentId === subId || t.subdepartment === oldName) {
                    t.subdepartment = newName;
                }
            });
        }

        saveSchemasToLocal();
        closeEditSubDeptModal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Sub-departamento "${newName}" actualizado. Encargado: ${sub.manager}`, 'success');
    }

    function deleteSubDepartment(deptId, subDeptId) {
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept || !dept.subdepartments) return;
        const sub = dept.subdepartments.find(s => s.id === subDeptId || s.name === subDeptId);
        if (!sub) return;

        if (!confirm(`¿Eliminar el sub-departamento "${sub.name}" y sus tareas esquematizadas?`)) {
            return;
        }

        dept.subdepartments = dept.subdepartments.filter(s => s !== sub && s.id !== subDeptId && s.name !== subDeptId);
        if (schema.tasks) {
            schema.tasks = schema.tasks.filter(t => t.subdepartmentId !== subDeptId && t.subdepartment !== sub.name);
        }

        saveSchemasToLocal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Sub-departamento "${sub.name}" eliminado.`, 'info');
    }

    // 4. EDITAR TEMA CENTRAL
    function openEditRootModal() {
        const schema = getActiveSchema();
        if (!schema) return;

        const modal = document.getElementById('modal-schema-edit-root');
        if (!modal) return;

        document.getElementById('schema-root-name-input').value = schema.name || 'Tema Central';
        document.getElementById('schema-root-desc-input').value = schema.description || '';

        modal.style.display = 'flex';
    }

    function closeEditRootModal() {
        const modal = document.getElementById('modal-schema-edit-root');
        if (modal) modal.style.display = 'none';
    }

    function handleSaveEditRoot(event) {
        if (event) event.preventDefault();
        const schema = getActiveSchema();
        if (!schema) return;

        const newName = (document.getElementById('schema-root-name-input').value || '').trim();
        const newDesc = (document.getElementById('schema-root-desc-input').value || '').trim();

        if (!newName) {
            alert('Por favor introduce un nombre para el tema central.');
            return;
        }

        schema.name = newName;
        schema.description = newDesc;

        saveSchemasToLocal();
        closeEditRootModal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Tema Central actualizado a "${newName}".`, 'success');
    }

    // 5. AÑADIR TAREA ESQUEMATIZADA DENTRO DE UN SUB-DEPARTAMENTO (Requisito clave)
    function openAddTaskForSubDept(deptId, subDeptId) {
        const schema = getActiveSchema();
        if (!schema) return;
        const dept = (schema.departments || []).find(d => d.id === deptId);
        if (!dept) return;
        const sub = (dept.subdepartments || []).find(s => s.id === subDeptId);
        const subName = sub ? sub.name : 'General';

        schemaState.editingTaskId = null;
        const modal = document.getElementById('modal-schema-task');
        if (!modal) return;

        const titleEl = document.getElementById('modal-task-title-text');
        if (titleEl) titleEl.innerText = 'Asignar Nueva Tarea Esquematizada';

        const deptBadge = document.getElementById('modal-task-dept-badge');
        if (deptBadge) deptBadge.innerText = `${dept.name} → ${subName}`;

        document.getElementById('schema-form-task-id').value = '';
        document.getElementById('schema-form-dept').value = dept.name;
        document.getElementById('schema-form-dept-id').value = dept.id;
        document.getElementById('schema-form-subdept').value = subName;
        document.getElementById('schema-form-subdept-id').value = sub ? sub.id : '';
        document.getElementById('schema-form-title').value = '';
        document.getElementById('schema-form-desc').value = '';
        document.getElementById('schema-form-status').value = 'pending';
        document.getElementById('schema-form-duedate').value = '';

        // Preasignar al Encargado del Sub-departamento (ej: Roberto Miranda)
        const defaultAssignee = (sub && sub.manager) ? sub.manager : (dept.manager || 'Roberto Miranda');
        document.getElementById('schema-form-assignee').value = defaultAssignee;

        setSchemaPrioritySegment('alta');
        populateDependenciesChecklist([], null);

        modal.style.display = 'flex';
        setTimeout(() => {
            const titleInput = document.getElementById('schema-form-title');
            if (titleInput) titleInput.focus();
        }, 60);
    }

    // 6. MENU DESPLEGABLE DE COLABORADORES / ENCARGADOS (IDENTICO A IMAGEN 2)
    function getUserAvatarStyle(rol) {
        const r = (rol || '').toLowerCase();
        const isGerente = r === 'gerente' || r === 'manager' || r === 'director' || r.includes('gerent');
        const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
        if (isGerente) {
            return { bg: '#DBEAFE', color: '#1D4ED8' };
        } else if (isAdmin) {
            return { bg: '#D1FAE5', color: '#047857' };
        } else {
            return { bg: '#F1F5F9', color: '#475569' };
        }
    }

    function updateCollabTriggerDisplay(inputId, userName) {
        const input = document.getElementById(inputId);
        const nameToUse = (userName || (input ? input.value : '') || 'Roberto Miranda').trim();
        if (input) input.value = nameToUse;

        const trigger = document.getElementById(inputId + '-trigger');
        if (!trigger) return;

        const collabs = getSchemaCollaborators();
        const found = collabs.find(c => (c.nombre || '').toLowerCase() === nameToUse.toLowerCase());
        const effectiveName = found ? found.nombre : nameToUse;
        const role = found ? (found.rol || found.departamento || 'Colaborador') : 'Encargado';
        const initials = getAssigneeInitials(effectiveName);
        const style = getUserAvatarStyle(role);

        trigger.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <div class="collab-trigger-avatar" style="background: ${style.bg}; color: ${style.color};">
                    ${initials}
                </div>
                <div style="display: flex; flex-direction: column; text-align: left; overflow: hidden;">
                    <span class="collab-trigger-name">${escapeHtml(effectiveName)}</span>
                    <span class="collab-trigger-sub">${escapeHtml(role)}</span>
                </div>
            </div>
            <span class="material-symbols-outlined collab-trigger-chevron">expand_more</span>
        `;
    }

    function toggleCollabSelectDropdown(inputId, dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const trigger = document.getElementById(inputId + '-trigger');
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('open');
        closeAllCollabDropdowns();

        if (!isOpen) {
            renderCollabDropdownItems(inputId, dropdownId, '');
            dropdown.classList.add('open');
            dropdown.style.display = 'block';
            if (trigger) trigger.classList.add('active');

            setTimeout(() => {
                const search = dropdown.querySelector('.collab-dropdown-search-input');
                if (search) search.focus();
            }, 60);
        }
    }

    function closeAllCollabDropdowns() {
        document.querySelectorAll('.custom-collab-dropdown-menu').forEach(menu => {
            menu.classList.remove('open');
            menu.style.display = 'none';
        });
        document.querySelectorAll('.custom-collab-select-trigger').forEach(trigger => {
            trigger.classList.remove('active');
        });
    }

    function renderCollabDropdownItems(inputId, dropdownId, filterText) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const currentVal = (document.getElementById(inputId)?.value || '').trim();
        const collabs = getSchemaCollaborators();
        const query = (filterText || '').toLowerCase().trim();

        const filtered = query
            ? collabs.filter(u => {
                const n = (u.nombre || '').toLowerCase();
                const r = (u.rol || '').toLowerCase();
                const d = (u.departamento || '').toLowerCase();
                return n.includes(query) || r.includes(query) || d.includes(query);
            })
            : collabs;

        let html = `
            <div class="collab-dropdown-search-wrap" onclick="event.stopPropagation()">
                <span class="material-symbols-outlined" style="font-size: 18px; color: #94A3B8;">search</span>
                <input type="text" placeholder="Buscar colaborador..." value="${escapeHtml(filterText || '')}" 
                       oninput="window.schemaEngine.filterCollabSelectDropdown('${inputId}', '${dropdownId}', this.value)"
                       onclick="event.stopPropagation()"
                       class="collab-dropdown-search-input">
            </div>
            <div class="collab-dropdown-list-wrap">
        `;

        if (filtered.length === 0) {
            html += `
                <div class="collab-dropdown-empty">
                    <div>No se encontraron colaboradores para "${escapeHtml(filterText)}"</div>
                    <button type="button" class="btn-collab-use-custom" onclick="window.schemaEngine.selectCollabUser('${inputId}', '${dropdownId}', '${escapeHtml(filterText)}')">
                        ➕ Asignar "${escapeHtml(filterText)}" como encargado
                    </button>
                </div>
            `;
        } else {
            html += filtered.map(u => {
                const isSelected = (u.nombre || '').toLowerCase() === currentVal.toLowerCase();
                const initials = getAssigneeInitials(u.nombre);
                const role = u.rol || u.departamento || 'Colaborador';
                const style = getUserAvatarStyle(role);
                const escapedName = escapeHtml(u.nombre);

                return `
                    <div class="collab-dropdown-item ${isSelected ? 'selected' : ''}" 
                         onclick="window.schemaEngine.selectCollabUser('${inputId}', '${dropdownId}', '${escapedName}')">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="collab-item-avatar" style="background: ${style.bg}; color: ${style.color};">
                                ${initials}
                            </div>
                            <div class="collab-item-details">
                                <span class="collab-item-name">${escapedName}</span>
                                <span class="collab-item-sub">${escapeHtml(role)}</span>
                            </div>
                        </div>
                        ${isSelected ? '<span class="material-symbols-outlined collab-check-icon">check</span>' : ''}
                    </div>
                `;
            }).join('');

            if (query && !collabs.some(c => (c.nombre || '').toLowerCase() === query)) {
                html += `
                    <div class="collab-dropdown-item custom-item" 
                         onclick="window.schemaEngine.selectCollabUser('${inputId}', '${dropdownId}', '${escapeHtml(filterText)}')">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="collab-item-avatar" style="background: rgba(37,99,235,0.1); color: #2563EB;">➕</div>
                            <div class="collab-item-details">
                                <span class="collab-item-name">Usar "${escapeHtml(filterText)}"</span>
                                <span class="collab-item-sub">Asignar como nuevo encargado</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        html += `</div>`;
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
        dropdown.classList.add('open');
    }

    function filterCollabSelectDropdown(inputId, dropdownId, text) {
        renderCollabDropdownItems(inputId, dropdownId, text);
    }

    function selectCollabUser(inputId, dropdownId, name) {
        updateCollabTriggerDisplay(inputId, name);
        closeAllCollabDropdowns();
        const input = document.getElementById(inputId);
        if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Funciones de compatibilidad hacia atrás
    function openCollabDropdown(inputId, dropdownId) {
        toggleCollabSelectDropdown(inputId, dropdownId);
    }

    function filterCollabDropdown(inputId, dropdownId, filterText) {
        filterCollabSelectDropdown(inputId, dropdownId, filterText);
    }

    function selectCollab(inputId, dropdownId, name) {
        selectCollabUser(inputId, dropdownId, name);
    }

    // Control del Menú Desplegable de 3 puntos por Departamento (Imagen 3)
    function toggleDeptMenu(event, deptId) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        const menu = document.getElementById(`dept-menu-${deptId}`);
        if (!menu) return;
        const isOpen = menu.classList.contains('show');
        closeAllDeptMenus();
        if (!isOpen) {
            menu.classList.add('show');
        }
    }

    function closeAllDeptMenus() {
        const menus = document.querySelectorAll('.dept-dropdown-menu');
        menus.forEach(m => m.classList.remove('show'));
    }

    // Helper flexible para encontrar departamento por ID o Nombre (evita fallos si el ID difiere)
    function findDeptInSchema(schema, deptId) {
        if (!schema || !schema.departments || !Array.isArray(schema.departments)) return null;
        if (!deptId) return null;
        const q = String(deptId).trim().toLowerCase();
        return schema.departments.find(d => 
            (d.id && String(d.id).trim().toLowerCase() === q) ||
            (d.name && String(d.name).trim().toLowerCase() === q)
        ) || null;
    }

    // Eliminar departamento (Imagen 3)
    function deleteDepartment(deptId) {
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept) return;

        const deptName = dept.name || dept.id;
        if (!confirm(`¿Estás seguro de que deseas eliminar el departamento "${deptName}" y todas sus subtareas asignadas?`)) {
            return;
        }

        const effectiveId = dept.id || deptName;
        schema.departments = schema.departments.filter(d => d !== dept && d.id !== effectiveId && d.name !== deptName);
        if (schema.tasks) {
            schema.tasks = schema.tasks.filter(t => t.department !== deptName && t.departmentId !== effectiveId);
        }

        saveSchemasToLocal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Departamento "${deptName}" eliminado correctamente.`, 'info');
    }

    // Modal para Editar Departamento: nombre, descripción, encargado y color
    function openEditDeptModal(deptId) {
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;
        const dept = findDeptInSchema(schema, deptId);
        if (!dept) {
            showToast('No se encontró el departamento a editar.', 'error');
            return;
        }

        const modal = document.getElementById('modal-schema-edit-dept');
        if (!modal) return;

        const effectiveId = dept.id || dept.name || deptId;
        dept.id = effectiveId;

        const idInput = document.getElementById('schema-edit-dept-id');
        const nameInput = document.getElementById('schema-edit-dept-name');
        const descInput = document.getElementById('schema-edit-dept-desc');
        const managerInput = document.getElementById('schema-edit-dept-manager');
        const colorInput = document.getElementById('schema-edit-dept-color');

        if (idInput) idInput.value = effectiveId;
        if (nameInput) nameInput.value = dept.name || dept.id;
        const defaultMgr = dept.manager || 'Roberto Miranda';
        if (managerInput) managerInput.value = defaultMgr;
        updateCollabTriggerDisplay('schema-edit-dept-manager', defaultMgr);

        const currColor = dept.color || (DEPARTMENTS_CONFIG[dept.name] ? DEPARTMENTS_CONFIG[dept.name].color : '#2563EB');
        if (colorInput) colorInput.value = currColor;

        renderDeptColorPicker(currColor);
        modal.style.display = 'flex';
        setTimeout(() => { if (nameInput) nameInput.focus(); }, 60);
    }

    function closeEditDeptModal() {
        const modal = document.getElementById('modal-schema-edit-dept');
        if (modal) modal.style.display = 'none';
    }

    function renderDeptColorPicker(selectedColor) {
        const container = document.getElementById('schema-dept-color-picker');
        if (!container) return;

        container.innerHTML = DEPT_COLORS.map(c => {
            const isSelected = c.hex.toLowerCase() === (selectedColor || '').toLowerCase();
            return `
                <button type="button" class="color-picker-swatch ${isSelected ? 'active' : ''}" 
                        style="background: ${c.hex};" 
                        title="${c.name}" 
                        onclick="window.schemaEngine.selectDeptColor('${c.hex}', this)">
                    ${isSelected ? '<span class="material-symbols-outlined" style="font-size: 16px; color: #FFF;">check</span>' : ''}
                </button>
            `;
        }).join('');
    }

    function selectDeptColor(hex, btnEl) {
        const input = document.getElementById('schema-edit-dept-color');
        if (input) input.value = hex;

        const swatches = document.querySelectorAll('#schema-dept-color-picker .color-picker-swatch');
        swatches.forEach(s => {
            s.classList.remove('active');
            s.innerHTML = '';
        });
        if (btnEl) {
            btnEl.classList.add('active');
            btnEl.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px; color: #FFF;">check</span>';
        }
    }

    function handleSaveEditDept(event) {
        if (event) event.preventDefault();
        const schema = getActiveSchema();
        if (!schema || !schema.departments) return;

        const deptId = document.getElementById('schema-edit-dept-id').value;
        const newName = (document.getElementById('schema-edit-dept-name').value || '').trim();
        const newDesc = (document.getElementById('schema-edit-dept-desc').value || '').trim();
        const newManager = (document.getElementById('schema-edit-dept-manager').value || '').trim();
        const newColor = document.getElementById('schema-edit-dept-color').value;

        if (!newName) {
            alert('Por favor introduce un nombre para el departamento.');
            return;
        }

        const dept = findDeptInSchema(schema, deptId);
        if (!dept) {
            showToast('No se encontró el departamento para guardar los cambios.', 'error');
            return;
        }

        const oldName = dept.name || dept.id;
        dept.name = newName;
        dept.description = newDesc;
        dept.manager = newManager || 'Roberto Miranda';
        dept.color = newColor;

        // Si cambió el nombre, actualizar las tareas asociadas a ese departamento
        if (schema.tasks && oldName !== newName) {
            schema.tasks.forEach(t => {
                if (t.department === oldName || t.department === deptId) {
                    t.department = newName;
                }
            });
        }

        saveSchemasToLocal();
        closeEditDeptModal();
        renderTopBar();
        renderCanvasElements();
        showToast(`Departamento "${newName}" actualizado. Encargado: ${dept.manager}`, 'success');
    }

    function openNewTaskModalFromTool() {
        openNewSchemaTaskModal();
    }

    // Alternar estatus de tarea (¡completar y desbloquear dependencias!)
    function toggleTaskStatus(taskId) {
        const schema = getActiveSchema();
        if (!schema || !schema.tasks) return;

        const task = schema.tasks.find(t => t.id === taskId);
        if (!task) return;

        const calculated = evaluateTasks(schema.tasks);
        const calcTask = calculated.find(t => t.id === taskId);

        // Si está bloqueada y no terminada, impedir completar
        if (calcTask && calcTask.isBlocked && calcTask.status !== 'completed') {
            const blockingNames = calcTask.blockingTasks.map(bt => `[${bt.department}] "${bt.title}"`).join('\n• ');
            alert(`⛔ TAREA CERRADA / BLOQUEADA:\n\nEsta tarea no puede proceder hasta que el departamento previo finalice:\n• ${blockingNames}`);
            return;
        }

        if (task.status === 'completed') {
            task.status = 'in_progress';
            showToast(`Tarea "${task.title}" reabierta.`, 'info');
        } else {
            task.status = 'completed';

            // Comprobar si se desbloqueó alguna otra tarea
            const dependents = schema.tasks.filter(t => t.dependencies && t.dependencies.includes(task.id));
            if (dependents.length > 0) {
                const depNames = dependents.map(d => `[${d.department}] "${d.title}"`).join(', ');
                showToast(`🎉 ¡VÍA LIBRE! Al completar "${task.title}", se desbloqueó la operación de: ${depNames}`, 'success');
            } else {
                showToast(`Tarea "${task.title}" completada.`, 'success');
            }
        }

        // Sincronizar estatus en appState.tasks
        if (window.appState && Array.isArray(window.appState.tasks)) {
            const stTask = window.appState.tasks.find(t => t.id === taskId);
            if (stTask) {
                stTask.status = task.status;
                try { localStorage.setItem('rp_tasks', JSON.stringify(window.appState.tasks)); } catch (e) {}
                if (typeof window.renderTasks === 'function') { try { window.renderTasks(); } catch (e) {} }
                if (typeof window.updateTaskMetrics === 'function') { try { window.updateTaskMetrics(); } catch (e) {} }
            }
        }

        saveSchemasToLocal();
        renderTopBar();
        renderCanvasElements();
    }

    function deleteTask(taskId) {
        const schema = getActiveSchema();
        if (!schema || !schema.tasks) return;

        const task = schema.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!confirm(`¿Eliminar la tarea "${task.title}" del esquema?`)) return;

        schema.tasks = schema.tasks.filter(t => t.id !== taskId);
        schema.tasks.forEach(t => {
            if (t.dependencies && t.dependencies.includes(taskId)) {
                t.dependencies = t.dependencies.filter(id => id !== taskId);
            }
        });

        // Eliminar de appState.tasks
        if (window.appState && Array.isArray(window.appState.tasks)) {
            window.appState.tasks = window.appState.tasks.filter(t => t.id !== taskId);
            try { localStorage.setItem('rp_tasks', JSON.stringify(window.appState.tasks)); } catch (e) {}
            if (typeof window.renderTasks === 'function') { try { window.renderTasks(); } catch (e) {} }
            if (typeof window.updateTaskMetrics === 'function') { try { window.updateTaskMetrics(); } catch (e) {} }
        }

        saveSchemasToLocal();
        renderTopBar();
        renderCanvasElements();
        showToast('Tarea eliminada.', 'info');
    }

    function focusTask(taskId) {
        const cardEl = document.getElementById(`schema-task-card-${taskId}`);
        if (!cardEl) return;

        const colEl = cardEl.closest('.canvas-dept-column');
        if (colEl) {
            const left = parseFloat(colEl.style.left) || 0;
            const top = parseFloat(colEl.style.top) || 0;

            const viewport = document.getElementById('canvas-infinite-viewport');
            const r = viewport ? viewport.getBoundingClientRect() : { width: 800, height: 600 };

            schemaState.panX = -(left * schemaState.scale) + r.width / 2 - 160;
            schemaState.panY = -(top * schemaState.scale) + r.height / 2 - 100;

            updateCanvasTransform();
            renderSvgConnectors();

            cardEl.classList.add('highlight-pulse');
            setTimeout(() => cardEl.classList.remove('highlight-pulse'), 2500);
        }
    }

    // Modal para Añadir / Editar Tarea (Imagen 2)
    function openNewSchemaTaskModal(preselectedDept, preselectedDependencyId) {
        schemaState.editingTaskId = null;
        const modal = document.getElementById('modal-schema-task');
        if (!modal) {
            console.error('Modal #modal-schema-task no fue encontrado en el DOM');
            return;
        }

        const titleEl = document.getElementById('modal-task-title-text');
        if (titleEl) titleEl.innerText = 'Asignar Nueva Tarea';

        const targetDept = preselectedDept || 'IT';
        const deptBadge = document.getElementById('modal-task-dept-badge');
        if (deptBadge) deptBadge.innerText = `Departamento: ${targetDept}`;

        const deptInput = document.getElementById('schema-form-dept');
        if (deptInput) deptInput.value = targetDept;

        const idEl = document.getElementById('schema-form-task-id');
        if (idEl) idEl.value = '';
        const titleInput = document.getElementById('schema-form-title');
        if (titleInput) titleInput.value = '';
        const descInput = document.getElementById('schema-form-desc');
        if (descInput) descInput.value = '';
        const assigneeInput = document.getElementById('schema-form-assignee');
        if (assigneeInput) assigneeInput.value = '';
        const statusInput = document.getElementById('schema-form-status');
        if (statusInput) statusInput.value = 'pending';
        const dueDateInput = document.getElementById('schema-form-duedate');
        if (dueDateInput) dueDateInput.value = '';

        setSchemaPrioritySegment('alta');

        populateDependenciesChecklist([], null, preselectedDependencyId);

        modal.style.display = 'flex';
        modal.style.zIndex = '999999';
        setTimeout(() => {
            if (titleInput) titleInput.focus();
        }, 50);
    }

    function openEditModal(taskId) {
        const schema = getActiveSchema();
        if (!schema || !schema.tasks) return;
        const task = schema.tasks.find(t => t.id === taskId);
        if (!task) return;

        schemaState.editingTaskId = taskId;
        const modal = document.getElementById('modal-schema-task');
        if (!modal) return;

        const titleEl = document.getElementById('modal-task-title-text');
        if (titleEl) titleEl.innerText = 'Editar Tarea del Esquema';

        const deptBadge = document.getElementById('modal-task-dept-badge');
        if (deptBadge) {
            deptBadge.innerText = `${task.department || 'IT'}${task.subdepartment ? ' → ' + task.subdepartment : ''}`;
        }

        const deptInput = document.getElementById('schema-form-dept');
        if (deptInput) deptInput.value = task.department || 'IT';

        const deptIdInput = document.getElementById('schema-form-dept-id');
        if (deptIdInput) deptIdInput.value = task.departmentId || '';

        const subdeptInput = document.getElementById('schema-form-subdept');
        if (subdeptInput) subdeptInput.value = task.subdepartment || '';

        const subdeptIdInput = document.getElementById('schema-form-subdept-id');
        if (subdeptIdInput) subdeptIdInput.value = task.subdepartmentId || '';

        document.getElementById('schema-form-task-id').value = task.id;
        document.getElementById('schema-form-title').value = task.title || '';
        document.getElementById('schema-form-desc').value = task.description || '';
        document.getElementById('schema-form-assignee').value = task.assignee || '';
        document.getElementById('schema-form-status').value = task.status || 'pending';
        document.getElementById('schema-form-duedate').value = task.dueDate || '';

        setSchemaPrioritySegment(task.priority || 'alta');

        populateDependenciesChecklist(task.dependencies || [], taskId);

        modal.style.display = 'flex';
    }

    // Autocompletado de Colaboradores para el campo "Asignar a" (Exactamente los mismos de la Sección 2)
    function getSchemaCollaborators() {
        const collabs = [];
        const seenNames = new Set();

        // 1. Obtener de getAvailableAssignees() de app.js (Sección 2) si está disponible
        if (typeof window.getAvailableAssignees === 'function') {
            try {
                const appAssignees = window.getAvailableAssignees();
                if (Array.isArray(appAssignees)) {
                    appAssignees.forEach(u => {
                        if (!u || !u.nombre) return;
                        const name = u.nombre.trim();
                        if (name && !seenNames.has(name.toLowerCase())) {
                            seenNames.add(name.toLowerCase());
                            collabs.push(u);
                        }
                    });
                }
            } catch (e) {
                console.warn('Error al obtener getAvailableAssignees:', e);
            }
        }

        // 2. Extraer de las tareas de la Sección 2 (Tablero de Tareas - appState.tasks)
        if (window.appState && Array.isArray(window.appState.tasks)) {
            window.appState.tasks.forEach(t => {
                const a = (t.assignee || '').trim();
                if (a && a !== 'Sin asignar' && !seenNames.has(a.toLowerCase())) {
                    seenNames.add(a.toLowerCase());
                    collabs.push({
                        id: 'task-user-' + collabs.length,
                        nombre: a,
                        email: '',
                        rol: 'colaborador',
                        departamento: t.departamento || t.department || 'Operaciones',
                        isSelf: false
                    });
                }
            });
        }

        // 3. Extraer de localStorage de tareas si appState.tasks no estuviera en memoria
        try {
            const rawTasks = localStorage.getItem('rp_tasks') || localStorage.getItem('rp_system_tasks');
            if (rawTasks) {
                const localTasks = JSON.parse(rawTasks);
                if (Array.isArray(localTasks)) {
                    localTasks.forEach(t => {
                        const a = (t.assignee || '').trim();
                        if (a && a !== 'Sin asignar' && !seenNames.has(a.toLowerCase())) {
                            seenNames.add(a.toLowerCase());
                            collabs.push({
                                id: 'task-user-' + collabs.length,
                                nombre: a,
                                email: '',
                                rol: 'colaborador',
                                departamento: t.departamento || 'Operaciones',
                                isSelf: false
                            });
                        }
                    });
                }
            }
        } catch (e) {}

        // 4. Extraer de perfiles locales almacenados
        try {
            const localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles') || '[]');
            if (Array.isArray(localProfiles)) {
                localProfiles.forEach(p => {
                    const name = (p.nombre || p.name || '').trim();
                    if (name && !seenNames.has(name.toLowerCase())) {
                        seenNames.add(name.toLowerCase());
                        collabs.push({
                            id: p.id || 'prof-' + collabs.length,
                            nombre: name,
                            email: p.email || '',
                            rol: p.rol || 'colaborador',
                            departamento: p.departamento || 'Operaciones',
                            isSelf: false
                        });
                    }
                });
            }
        } catch (e) {}

        // 5. Garantizar exactamente los usuarios corporativos de la Imagen 2
        const systemUsers = [
            { nombre: 'Gerente Principal', rol: 'gerente', departamento: 'Gerencia General' },
            { nombre: 'Roberto Miranda', rol: 'gerente', departamento: 'Operaciones' },
            { nombre: 'Manuel Morales', rol: 'colaborador', departamento: 'Logística' },
            { nombre: 'Maria Perez', rol: 'administrador', departamento: 'Finanzas' }
        ];

        systemUsers.forEach(su => {
            if (!seenNames.has(su.nombre.toLowerCase())) {
                seenNames.add(su.nombre.toLowerCase());
                collabs.push({
                    id: 'sys-' + collabs.length,
                    nombre: su.nombre,
                    email: '',
                    rol: su.rol,
                    departamento: su.departamento,
                    isSelf: false
                });
            }
        });

        return collabs;
    }

    function openSchemaAssigneeDropdown() {
        renderSchemaAssigneeDropdown('');
    }

    function filterSchemaAssigneeDropdown(val) {
        renderSchemaAssigneeDropdown(val);
    }

    function renderSchemaAssigneeDropdown(filterText) {
        const dropdown = document.getElementById('schema-task-assignee-dropdown');
        if (!dropdown) return;
        const collabs = getSchemaCollaborators();
        const query = (filterText || '').toLowerCase().trim();
        const filtered = query 
            ? collabs.filter(u => {
                const n = (u.nombre || '').toLowerCase();
                const e = (u.email || '').toLowerCase();
                const d = (u.departamento || '').toLowerCase();
                const r = (u.rol || '').toLowerCase();
                return n.includes(query) || e.includes(query) || d.includes(query) || r.includes(query);
            }) 
            : collabs;

        let itemsHtml = '';

        if (filtered.length === 0) {
            itemsHtml = `
                <li class="assignee-dropdown-item custom-add" onmousedown="event.preventDefault(); window.schemaEngine.selectSchemaAssignee('${escapeHtml(filterText)}')">
                    <div class="assignee-item-user">
                        <div class="assignee-item-avatar" style="background: rgba(37,99,235,0.1); color: #2563EB;">➕</div>
                        <div class="assignee-item-details">
                            <span class="assignee-item-name">Asignar a "${escapeHtml(filterText)}"</span>
                            <span class="assignee-item-sub">Usar este colaborador personalizado</span>
                        </div>
                    </div>
                </li>
            `;
        } else {
            itemsHtml = filtered.map(u => {
                const initial = (u.nombre || u.email || 'U').charAt(0).toUpperCase();
                const r = (u.rol || '').toLowerCase();
                const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
                const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
                const roleColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#64748B');
                const roleBg = isGerente ? 'rgba(37, 99, 235, 0.1)' : (isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)');
                const roleLabel = isGerente ? 'Gerente' : (isAdmin ? 'Admin' : (u.departamento || 'Colaborador'));
                const escapedName = escapeHtml(u.nombre || '');

                const badgeHtml = u.isSelf 
                    ? `<span class="assignee-badge-self">⭐ Tú</span>`
                    : `<span class="assignee-badge-role" style="background: ${roleBg}; color: ${roleColor};">${escapeHtml(roleLabel)}</span>`;

                return `
                    <li class="assignee-dropdown-item" onmousedown="event.preventDefault(); window.schemaEngine.selectSchemaAssignee('${escapedName}')">
                        <div class="assignee-item-user">
                            <div class="assignee-item-avatar" style="background: ${roleBg}; color: ${roleColor}; border-color: ${roleColor};">
                                ${initial}
                            </div>
                            <div class="assignee-item-details">
                                <span class="assignee-item-name">${escapeHtml(u.nombre)}</span>
                                <span class="assignee-item-sub">${escapeHtml(u.email || u.departamento || 'Colaborador')}</span>
                            </div>
                        </div>
                        ${badgeHtml}
                    </li>
                `;
            }).join('');

            if (query && !collabs.some(c => (c.nombre || '').toLowerCase() === query)) {
                itemsHtml += `
                    <li class="assignee-dropdown-item custom-add" onmousedown="event.preventDefault(); window.schemaEngine.selectSchemaAssignee('${escapeHtml(filterText)}')">
                        <div class="assignee-item-user">
                            <div class="assignee-item-avatar" style="background: rgba(37,99,235,0.1); color: #2563EB;">➕</div>
                            <div class="assignee-item-details">
                                <span class="assignee-item-name">Asignar a "${escapeHtml(filterText)}"</span>
                                <span class="assignee-item-sub">Usar colaborador personalizado</span>
                            </div>
                        </div>
                    </li>
                `;
            }
        }

        dropdown.innerHTML = itemsHtml;
        dropdown.style.display = 'block';
        dropdown.classList.add('open');
    }

    function selectSchemaAssignee(name) {
        const input = document.getElementById('schema-form-assignee');
        if (input) {
            input.value = name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const dropdown = document.getElementById('schema-task-assignee-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            dropdown.classList.remove('open');
        }
    }

    function setSchemaPrioritySegment(priority) {
        const input = document.getElementById('schema-form-priority');
        if (input) input.value = priority;

        const container = document.getElementById('schema-priority-segmented');
        if (container) {
            const btns = container.querySelectorAll('.priority-segment-btn');
            btns.forEach(btn => {
                if (btn.dataset.priority === priority) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    // ==============================================================
    // MODAL DE ENTRELAZAR TAREAS / TRAZABILIDAD DE BLOQUEOS (IMAGEN 3)
    // ==============================================================
    function openLinkTaskModal(sourceTaskId) {
        const schema = getActiveSchema();
        if (!schema) return;

        let sourceTask = (schema.tasks || []).find(t => t.id === sourceTaskId);
        if (!sourceTask && window.appState && window.appState.tasks) {
            sourceTask = window.appState.tasks.find(t => t.id === sourceTaskId);
            if (sourceTask) {
                if (!schema.tasks) schema.tasks = [];
                schema.tasks.push({ ...sourceTask });
                saveSchemasToLocal();
            }
        }
        if (!sourceTask) return;

        const modal = document.getElementById('modal-schema-link-task');
        if (!modal) return;

        schemaState.linkingSourceTaskId = sourceTaskId;
        schemaState.linkingSelectedTargetId = null;
        schemaState.linkingDirection = 'target_blocked';

        const sourceInput = document.getElementById('schema-link-source-task-id');
        if (sourceInput) sourceInput.value = sourceTaskId;
        const targetInput = document.getElementById('schema-link-selected-target-id');
        if (targetInput) targetInput.value = '';

        setLinkDirection('target_blocked');

        const searchInput = document.getElementById('schema-link-search-input');
        if (searchInput) searchInput.value = '';

        const previewEl = document.getElementById('schema-link-origin-preview');
        if (previewEl) {
            const statusLabel = sourceTask.status === 'completed' ? 'Completada' : 'Pendiente';
            const statusColor = sourceTask.status === 'completed' ? '#059669' : '#D97706';
            const statusBg = sourceTask.status === 'completed' ? '#ECFDF5' : '#FFFBEB';

            previewEl.innerHTML = `
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span class="link-task-item-dept" style="background: #DBEAFE; color: #1D4ED8;">${escapeHtml(sourceTask.department || 'GENERAL')}</span>
                        ${sourceTask.subdepartment ? `<span class="link-task-item-dept" style="background: #F1F5F9; color: #475569;">${escapeHtml(sourceTask.subdepartment)}</span>` : ''}
                        <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${statusBg}; color: ${statusColor};">${statusLabel}</span>
                    </div>
                    <div style="font-size: 13.5px; font-weight: 800; color: #0F172A;">${escapeHtml(sourceTask.title)}</div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                        Responsable: <strong>${escapeHtml(sourceTask.assignee || 'Sin asignar')}</strong>
                    </div>
                </div>
            `;
        }

        renderExistingLinks(sourceTaskId);
        renderLinkCandidateTasks('');
        modal.style.display = 'flex';
    }

    function closeLinkTaskModal() {
        const modal = document.getElementById('modal-schema-link-task');
        if (modal) modal.style.display = 'none';
        schemaState.linkingSourceTaskId = null;
        schemaState.linkingSelectedTargetId = null;
    }

    function setLinkDirection(direction) {
        schemaState.linkingDirection = direction;
        const optTarget = document.getElementById('link-option-target-blocked');
        const optSource = document.getElementById('link-option-source-blocked');
        const radioTarget = optTarget ? optTarget.querySelector('input') : null;
        const radioSource = optSource ? optSource.querySelector('input') : null;

        if (direction === 'target_blocked') {
            if (optTarget) optTarget.classList.add('selected');
            if (optSource) optSource.classList.remove('selected');
            if (radioTarget) radioTarget.checked = true;
            if (radioSource) radioSource.checked = false;
        } else {
            if (optTarget) optTarget.classList.remove('selected');
            if (optSource) optSource.classList.add('selected');
            if (radioTarget) radioTarget.checked = false;
            if (radioSource) radioSource.checked = true;
        }
    }

    function renderExistingLinks(taskId) {
        const container = document.getElementById('schema-link-existing-section');
        const listEl = document.getElementById('schema-link-existing-list');
        if (!container || !listEl) return;

        const schema = getActiveSchema();
        const tasks = (schema && schema.tasks) ? schema.tasks : [];
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            container.style.display = 'none';
            return;
        }

        const blockedByThis = tasks.filter(t => t.dependencies && t.dependencies.includes(taskId));
        const blockingThis = (task.dependencies || []).map(depId => tasks.find(t => t.id === depId)).filter(Boolean);

        if (blockedByThis.length === 0 && blockingThis.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        let html = '';

        blockedByThis.forEach(t => {
            html += `
                <div class="existing-link-pill blocks-other" title="Esta tarea bloquea el avance de ${escapeHtml(t.title)}">
                    <span class="material-symbols-outlined" style="font-size: 14px;">lock</span>
                    <span>Bloquea a: <strong>[${escapeHtml(t.department || '')}] ${escapeHtml(t.title)}</strong></span>
                    <button type="button" onclick="window.schemaEngine.removeTaskLink('${t.id}', '${taskId}')" title="Desvincular / Desbloquear">✕</button>
                </div>
            `;
        });

        blockingThis.forEach(t => {
            html += `
                <div class="existing-link-pill blocked-by" title="Esta tarea no puede avanzar hasta que se termine ${escapeHtml(t.title)}">
                    <span class="material-symbols-outlined" style="font-size: 14px;">warning</span>
                    <span>Esperando a: <strong>[${escapeHtml(t.department || '')}] ${escapeHtml(t.title)}</strong></span>
                    <button type="button" onclick="window.schemaEngine.removeTaskLink('${taskId}', '${t.id}')" title="Desvincular / Desbloquear">✕</button>
                </div>
            `;
        });

        listEl.innerHTML = html;
    }

    function renderLinkCandidateTasks(query) {
        const listEl = document.getElementById('schema-link-tasks-list');
        if (!listEl) return;

        const schema = getActiveSchema();
        const currentTaskId = schemaState.linkingSourceTaskId;
        const allSystemTasks = (window.appState && window.appState.tasks) ? window.appState.tasks : [];
        const schemaTasks = (schema && schema.tasks) ? schema.tasks : [];

        const pool = [...schemaTasks];
        allSystemTasks.forEach(st => {
            if (!pool.some(t => t.id === st.id)) {
                pool.push(st);
            }
        });

        const q = (query || '').toLowerCase().trim();
        const candidates = pool.filter(t => {
            if (t.id === currentTaskId) return false;
            if (!q) return true;
            const titleMatch = (t.title || '').toLowerCase().includes(q);
            const deptMatch = (t.department || '').toLowerCase().includes(q);
            const subMatch = (t.subdepartment || '').toLowerCase().includes(q);
            const assigneeMatch = (t.assignee || '').toLowerCase().includes(q);
            return titleMatch || deptMatch || subMatch || assigneeMatch;
        });

        if (candidates.length === 0) {
            listEl.innerHTML = `
                <div style="padding: 24px 16px; text-align: center; color: #94A3B8; font-size: 12px;">
                    <span class="material-symbols-outlined" style="font-size: 28px; color: #CBD5E1; display: block; margin-bottom: 4px;">search_off</span>
                    No se encontraron tareas coincidentes.
                </div>
            `;
            return;
        }

        const selectedId = schemaState.linkingSelectedTargetId;

        listEl.innerHTML = candidates.map(t => {
            const isSelected = t.id === selectedId;
            const deptConf = getDeptConfig(t.department || '');
            const isCompleted = t.status === 'completed';
            const isBlocked = t.dependencies && t.dependencies.length > 0;
            const statusLabel = isCompleted ? 'Completada' : (isBlocked ? 'Bloqueada' : 'Pendiente');
            const statusColor = isCompleted ? '#059669' : (isBlocked ? '#DC2626' : '#D97706');
            const statusBg = isCompleted ? '#ECFDF5' : (isBlocked ? '#FEF2F2' : '#FFFBEB');

            return `
                <div class="link-task-item ${isSelected ? 'selected' : ''}" onclick="window.schemaEngine.selectLinkTargetTask('${t.id}')">
                    <input type="radio" name="link-target-radio" value="${t.id}" ${isSelected ? 'checked' : ''} style="accent-color: #2563EB;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                            <span class="link-task-item-dept" style="background: ${deptConf.bg}; color: ${deptConf.color};">${escapeHtml(t.department || 'GENERAL')}</span>
                            ${t.subdepartment ? `<span class="link-task-item-dept" style="background: #F1F5F9; color: #475569;">${escapeHtml(t.subdepartment)}</span>` : ''}
                            <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${statusBg}; color: ${statusColor}; margin-left: auto;">${statusLabel}</span>
                        </div>
                        <div class="link-task-item-title">${escapeHtml(t.title)}</div>
                        <div class="link-task-item-meta">
                            <span><span class="material-symbols-outlined" style="font-size: 13px; vertical-align: middle;">person</span> ${escapeHtml(t.assignee || 'Sin asignar')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function filterLinkTaskModal(query) {
        renderLinkCandidateTasks(query);
    }

    function selectLinkTargetTask(targetId) {
        schemaState.linkingSelectedTargetId = targetId;
        const targetInput = document.getElementById('schema-link-selected-target-id');
        if (targetInput) targetInput.value = targetId;
        const currentQuery = (document.getElementById('schema-link-search-input') || {}).value || '';
        renderLinkCandidateTasks(currentQuery);
    }

    function handleSaveLinkTask() {
        const sourceId = document.getElementById('schema-link-source-task-id').value;
        const targetId = document.getElementById('schema-link-selected-target-id').value;
        const direction = schemaState.linkingDirection || 'target_blocked';

        if (!targetId) {
            showToast('Por favor selecciona una tarea para entrelazar', 'error');
            return;
        }

        const schema = getActiveSchema();
        if (!schema) return;

        const allSystemTasks = (window.appState && window.appState.tasks) ? window.appState.tasks : [];
        if (!schema.tasks) schema.tasks = [];

        [sourceId, targetId].forEach(id => {
            if (!schema.tasks.some(t => t.id === id)) {
                const found = allSystemTasks.find(t => t.id === id);
                if (found) schema.tasks.push({ ...found });
            }
        });

        const sourceTask = schema.tasks.find(t => t.id === sourceId);
        const targetTask = schema.tasks.find(t => t.id === targetId);

        if (!sourceTask || !targetTask) {
            showToast('No se pudieron encontrar las tareas para entrelazar', 'error');
            return;
        }

        if (direction === 'target_blocked') {
            // Requisito Imagen 3: la tarea seleccionada se bloquea, no la entrelazada
            if (!targetTask.dependencies) targetTask.dependencies = [];
            if (!targetTask.dependencies.includes(sourceId)) {
                targetTask.dependencies.push(sourceId);
            }
            showToast(`"${targetTask.title}" ha quedado BLOQUEADA en espera de "${sourceTask.title}"`, 'success');
        } else {
            // Dirección inversa: esta tarea se bloquea por la seleccionada
            if (!sourceTask.dependencies) sourceTask.dependencies = [];
            if (!sourceTask.dependencies.includes(targetId)) {
                sourceTask.dependencies.push(targetId);
            }
            showToast(`"${sourceTask.title}" ha quedado BLOQUEADA en espera de "${targetTask.title}"`, 'success');
        }

        if (window.appState && window.appState.tasks) {
            const appTarget = window.appState.tasks.find(t => t.id === targetId);
            if (appTarget) appTarget.dependencies = targetTask.dependencies;
            const appSource = window.appState.tasks.find(t => t.id === sourceId);
            if (appSource) appSource.dependencies = sourceTask.dependencies;
        }

        saveSchemasToLocal();
        renderCanvasElements();
        closeLinkTaskModal();
    }

    function removeTaskLink(targetTaskId, sourceTaskId) {
        const schema = getActiveSchema();
        if (!schema || !schema.tasks) return;

        const targetTask = schema.tasks.find(t => t.id === targetTaskId);
        if (targetTask && targetTask.dependencies) {
            targetTask.dependencies = targetTask.dependencies.filter(id => id !== sourceTaskId);
        }

        if (window.appState && window.appState.tasks) {
            const appTarget = window.appState.tasks.find(t => t.id === targetTaskId);
            if (appTarget && appTarget.dependencies) {
                appTarget.dependencies = appTarget.dependencies.filter(id => id !== sourceTaskId);
            }
        }

        saveSchemasToLocal();
        renderCanvasElements();
        renderExistingLinks(schemaState.linkingSourceTaskId);
        showToast('Vínculo y bloqueo retirados con éxito', 'info');
    }

    function openBranchModal(parentTaskId) {
        // Redirigir a entrelazar tareas según requerimiento del usuario (Imagen 3)
        openLinkTaskModal(parentTaskId);
    }

    function openAddTaskForDept(dept) {
        openNewSchemaTaskModal(dept);
    }

    function closeSchemaTaskModal() {
        const modal = document.getElementById('modal-schema-task');
        if (modal) modal.style.display = 'none';
        schemaState.editingTaskId = null;
    }

    function populateDeptDropdown(selectedDept) {
        const select = document.getElementById('schema-form-dept');
        if (!select) return;

        const schema = getActiveSchema();
        const activeDeptNames = (schema && schema.departments) 
            ? schema.departments.map(d => d.name || d.id) 
            : Object.keys(DEPARTMENTS_CONFIG);

        const allDepts = Array.from(new Set([...activeDeptNames, ...Object.keys(DEPARTMENTS_CONFIG)]));

        select.innerHTML = allDepts.map(d => `
            <option value="${escapeHtml(d)}" ${d === selectedDept ? 'selected' : ''}>${escapeHtml(d)}</option>
        `).join('') + `
            <option value="__custom__">+ Otro departamento personalizado...</option>
        `;

        select.onchange = function() {
            const customWrap = document.getElementById('schema-custom-dept-wrap');
            if (this.value === '__custom__') {
                customWrap.style.display = 'block';
                document.getElementById('schema-form-custom-dept').focus();
            } else {
                customWrap.style.display = 'none';
            }
        };

        const customWrap = document.getElementById('schema-custom-dept-wrap');
        if (customWrap) customWrap.style.display = 'none';
    }

    function populateDependenciesChecklist(selectedIds, currentEditingTaskId, forceSelectId) {
        const listEl = document.getElementById('schema-form-dependencies-list');
        if (!listEl) return;

        const schema = getActiveSchema();
        const availableTasks = (schema.tasks || []).filter(t => t.id !== currentEditingTaskId);

        if (availableTasks.length === 0) {
            listEl.innerHTML = '<p style="color: #64748B; font-size: 12px; margin: 0;">No hay otras tareas creadas aún para establecer dependencias.</p>';
            return;
        }

        listEl.innerHTML = availableTasks.map(t => {
            const isChecked = selectedIds.includes(t.id) || (forceSelectId && forceSelectId === t.id);
            const conf = getDeptConfig(t.department);
            return `
                <label class="schema-dependency-checkbox-item">
                    <input type="checkbox" name="schema_dep" value="${t.id}" ${isChecked ? 'checked' : ''}>
                    <div class="dep-check-label">
                        <span class="dep-dept-tag" style="background: ${conf.bg}; color: ${conf.color};">
                            ${escapeHtml(t.department)}
                        </span>
                        <strong>${escapeHtml(t.title)}</strong>
                        <span class="dep-status-pill">${t.status === 'completed' ? '✓ Completada' : '⏳ Incompleta'}</span>
                    </div>
                </label>
            `;
        }).join('');
    }

    function handleSaveSchemaTask(event) {
        if (event) event.preventDefault();

        const schema = getActiveSchema();
        if (!schema) return;

        const taskId = document.getElementById('schema-form-task-id').value;
        const title = document.getElementById('schema-form-title').value.trim();
        const desc = document.getElementById('schema-form-desc').value.trim();
        const assignee = document.getElementById('schema-form-assignee').value.trim();
        const status = document.getElementById('schema-form-status').value;
        const dueDate = document.getElementById('schema-form-duedate').value.trim();
        const priority = document.getElementById('schema-form-priority').value;

        const deptIdInput = document.getElementById('schema-form-dept-id');
        const deptId = deptIdInput ? deptIdInput.value : '';

        const subdeptInput = document.getElementById('schema-form-subdept');
        const subdept = subdeptInput ? subdeptInput.value : '';

        const subdeptIdInput = document.getElementById('schema-form-subdept-id');
        const subdeptId = subdeptIdInput ? subdeptIdInput.value : '';

        let dept = document.getElementById('schema-form-dept').value;
        if (dept === '__custom__') {
            const customVal = document.getElementById('schema-form-custom-dept').value.trim();
            dept = customVal || 'General';
        }

        if (!title) {
            alert('Por favor introduce un título para la tarea.');
            return;
        }

        // Obtener dependencias seleccionadas
        const selectedDeps = [];
        const depCheckboxes = document.querySelectorAll('input[name="schema_dep"]:checked');
        depCheckboxes.forEach(cb => selectedDeps.push(cb.value));

        if (taskId) {
            const task = schema.tasks.find(t => t.id === taskId);
            if (task) {
                task.title = title;
                task.department = dept;
                if (deptId) task.departmentId = deptId;
                if (subdept) task.subdepartment = subdept;
                if (subdeptId) task.subdepartmentId = subdeptId;
                task.description = desc;
                task.assignee = assignee;
                task.status = status;
                task.dueDate = dueDate;
                task.priority = priority;
                task.dependencies = selectedDeps;
            }
            showToast('Tarea actualizada.', 'success');
        } else {
            const newId = 'task-' + (subdeptId || dept).toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString(36);
            schema.tasks.push({
                id: newId,
                title,
                department: dept,
                departmentId: deptId,
                subdepartment: subdept,
                subdepartmentId: subdeptId,
                description: desc,
                assignee,
                status,
                dueDate,
                priority,
                dependencies: selectedDeps
            });

            showToast(`Nueva tarea esquematizada añadida: "${title}"`, 'success');
        }

        // Sincronizar con appState.tasks (Sección 2 - Tablero de Tareas)
        if (window.appState && Array.isArray(window.appState.tasks)) {
            const syncId = taskId || (schema.tasks[schema.tasks.length - 1] ? schema.tasks[schema.tasks.length - 1].id : null);
            if (syncId) {
                const existingIdx = window.appState.tasks.findIndex(t => t.id === syncId);
                const syncTask = {
                    id: syncId,
                    title: title,
                    desc: desc,
                    assignee: assignee,
                    priority: priority,
                    status: status || 'pending',
                    departamento: dept,
                    dueDate: dueDate,
                    createdAt: new Date().toISOString()
                };
                if (existingIdx >= 0) {
                    window.appState.tasks[existingIdx] = { ...window.appState.tasks[existingIdx], ...syncTask };
                } else {
                    window.appState.tasks.unshift(syncTask);
                }
                try {
                    localStorage.setItem('rp_tasks', JSON.stringify(window.appState.tasks));
                } catch (e) {}
                if (typeof window.renderTasks === 'function') {
                    try { window.renderTasks(); } catch (e) {}
                }
                if (typeof window.updateTaskMetrics === 'function') {
                    try { window.updateTaskMetrics(); } catch (e) {}
                }
            }
        }

        saveSchemasToLocal();
        closeSchemaTaskModal();
        renderTopBar();
        renderCanvasElements();
    }

    // Modal para Nuevo Tema / Proyecto
    function openNewSchemaProjectModal() {
        const modal = document.getElementById('modal-schema-project');
        if (!modal) return;
        document.getElementById('schema-project-name').value = '';
        document.getElementById('schema-project-desc').value = '';
        modal.style.display = 'flex';
    }

    function closeSchemaProjectModal() {
        const modal = document.getElementById('modal-schema-project');
        if (modal) modal.style.display = 'none';
    }

    function handleCreateSchemaProject(event) {
        if (event) event.preventDefault();

        const name = document.getElementById('schema-project-name').value.trim();
        const desc = document.getElementById('schema-project-desc').value.trim();
        const template = document.getElementById('schema-project-template').value;

        if (!name) {
            alert('Por favor indica un nombre para el tema o proyecto.');
            return;
        }

        const newId = 'schema-' + Date.now().toString(36);
        let tasks = [];
        let departments = [
            { id: 'IT', name: 'IT', x: 60, y: 220 },
            { id: 'Ventas', name: 'Ventas', x: 440, y: 220 },
            { id: 'Operaciones', name: 'Operaciones', x: 820, y: 220 },
            { id: 'Facturación', name: 'Facturación', x: 1200, y: 220 }
        ];

        const newProject = {
            id: newId,
            name,
            description: desc,
            rootPos: { x: 480, y: 40 },
            departments,
            tasks,
            conceptTexts: [],
            stickyNotes: []
        };

        schemaState.schemas.push(newProject);
        schemaState.activeSchemaId = newId;

        saveSchemasToLocal();
        closeSchemaProjectModal();
        renderSchemaView();
        showToast(`Tema "${name}" creado exitosamente.`, 'success');
    }

    function editCurrentProject() {
        const schema = getActiveSchema();
        if (!schema) return;

        const newName = prompt('Editar nombre del proyecto / tema:', schema.name);
        if (newName === null || !newName.trim()) return;

        const newDesc = prompt('Editar descripción del proyecto:', schema.description || '');

        schema.name = newName.trim();
        schema.description = newDesc ? newDesc.trim() : '';

        saveSchemasToLocal();
        renderTopBar();
        renderCanvasElements();
        showToast('Proyecto actualizado.', 'success');
    }

    function resetDefaultRodipackSchema() {
        if (!confirm('¿Deseas limpiar el pizarrón para comenzar desde cero con la generación de tareas?')) {
            return;
        }

        schemaState.schemas = getDefaultSchemas();
        schemaState.activeSchemaId = schemaState.schemas[0].id;
        schemaState.panX = 40;
        schemaState.panY = 20;
        schemaState.scale = 1.0;

        saveSchemasToLocal();
        renderSchemaView();
        showToast('Pizarrón limpio y listo para generar tus tareas.', 'info');
    }

    function handleSelectSchemaProject(projectId) {
        schemaState.activeSchemaId = projectId;
        saveSchemasToLocal();
        renderSchemaView();
    }

    // Drawer de Diagnóstico de Cuellos de Botella
    function toggleDiagnosticDrawer() {
        const drawer = document.getElementById('canvas-diagnostic-drawer');
        if (!drawer) return;

        if (drawer.style.display === 'none' || !drawer.style.display) {
            renderDiagnosticDrawerContent();
            drawer.style.display = 'flex';
            schemaState.diagnosticOpen = true;
        } else {
            drawer.style.display = 'none';
            schemaState.diagnosticOpen = false;
        }
    }

    function renderDiagnosticDrawerContent() {
        const body = document.getElementById('canvas-diagnostic-drawer-body');
        if (!body) return;

        const schema = getActiveSchema();
        if (!schema) return;

        const calculatedTasks = evaluateTasks(schema.tasks || []);
        const bottlenecks = calculatedTasks.filter(t => t.isBottleneck);
        const blockedTasks = calculatedTasks.filter(t => t.isBlocked);
        const completed = calculatedTasks.filter(t => t.status === 'completed').length;
        const total = calculatedTasks.length;

        let contentHtml = '';

        if (bottlenecks.length === 0) {
            contentHtml = `
                <div style="text-align: center; padding: 20px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; color: #065F46;">
                    <span class="material-symbols-outlined" style="font-size: 40px; color: #059669;">check_circle</span>
                    <h4 style="margin: 8px 0 4px 0; font-weight: 800;">Operación Despejada</h4>
                    <p style="margin: 0; font-size: 12px;">No hay cuellos de botella activos en este momento.</p>
                </div>
            `;
        } else {
            contentHtml = bottlenecks.map(b => {
                const depList = b.dependents.map(d => `<li><strong>[${escapeHtml(d.department)}]</strong> ${escapeHtml(d.title)}</li>`).join('');
                return `
                    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px;">
                        <div style="display: flex; align-items: center; gap: 6px; color: #DC2626; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                            <span class="material-symbols-outlined" style="font-size: 16px;">error</span> CUELLO DE BOTELLA CRÍTICO
                        </div>
                        <h4 style="margin: 6px 0 4px 0; font-size: 14px; font-weight: 800; color: #0F172A;">
                            [${escapeHtml(b.department)}] ${escapeHtml(b.title)}
                        </h4>
                        <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748B;">
                            Asignado: ${escapeHtml(b.assignee || 'Sin asignar')}
                        </p>
                        <div style="font-size: 12px; color: #991B1B; margin-bottom: 10px;">
                            <strong>Mantiene bloqueadas las siguientes áreas:</strong>
                            <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 11px;">
                                ${depList}
                            </ul>
                        </div>
                        <button type="button" class="btn-primary-action" style="width: 100%; justify-content: center; background: #059669;" onclick="window.schemaEngine.toggleTaskStatus('${b.id}'); window.schemaEngine.toggleDiagnosticDrawer();">
                            <span class="material-symbols-outlined" style="font-size: 14px;">check</span> Completar y Desbloquear Áreas
                        </button>
                    </div>
                `;
            }).join('');
        }

        body.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: 800; color: #0F172A;">${completed}/${total}</div>
                    <div style="font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase;">Completadas</div>
                </div>
                <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 10px; padding: 10px; text-align: center;">
                    <div style="font-size: 20px; font-weight: 800; color: #DC2626;">${blockedTasks.length}</div>
                    <div style="font-size: 10px; color: #991B1B; font-weight: 700; text-transform: uppercase;">Bloqueadas</div>
                </div>
            </div>
            ${contentHtml}
        `;
    }

    // Toasts visuales
    function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('schema-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'schema-toast-container';
            toastContainer.className = 'schema-toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `schema-toast toast-${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        if (type === 'danger' || type === 'error') icon = 'error';

        toast.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <div class="toast-text">${escapeHtml(message)}</div>
            <button type="button" class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
        }, 4000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Cerrar menús de departamentos al hacer click en cualquier parte del lienzo
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dept-menu-wrapper')) {
            closeAllDeptMenus();
        }
    });

    // Exponer API global
    window.schemaEngine = {
        init: initSchemaEngine,
        render: renderSchemaView,
        toggleTaskStatus,
        deleteTask,
        focusTask,
        setTool,
        toggleToolbar,
        zoomStep,
        resetZoom,
        centerCanvas,
        autoArrange,
        addStickyNoteAtCenter,
        updateStickyText,
        deleteSticky,
        addTextNoteAtCenter,
        openNewDeptModal,
        closeNewDeptModal,
        handleSaveNewDept,
        selectNewDeptColor,
        addDepartmentRight,
        toggleDeptMenu,
        closeAllDeptMenus,
        deleteDepartment,
        openEditDeptModal,
        closeEditDeptModal,
        handleSaveEditDept,
        selectDeptColor,
        openNewSubDeptModal,
        closeNewSubDeptModal,
        handleSaveNewSubDept,
        openEditSubDeptModal,
        closeEditSubDeptModal,
        handleSaveEditSubDept,
        deleteSubDepartment,
        openEditRootModal,
        closeEditRootModal,
        handleSaveEditRoot,
        openAddTaskForSubDept,
        openCollabDropdown,
        filterCollabDropdown,
        selectCollab,
        setSchemaPrioritySegment,
        openSchemaAssigneeDropdown,
        filterSchemaAssigneeDropdown,
        selectSchemaAssignee,
        openNewTaskModalFromTool,
        toggleDiagnosticDrawer,
        openNewSchemaTaskModal,
        openEditModal,
        openLinkTaskModal,
        closeLinkTaskModal,
        setLinkDirection,
        filterLinkTaskModal,
        selectLinkTargetTask,
        handleSaveLinkTask,
        removeTaskLink,
        openBranchModal,
        openAddTaskForDept,
        closeSchemaTaskModal,
        handleSaveSchemaTask,
        openNewSchemaProjectModal,
        closeSchemaProjectModal,
        handleCreateSchemaProject,
        editCurrentProject,
        resetDefaultRodipackSchema,
        handleSelectSchemaProject,
        toggleUserFilterMenu,
        setCollaboratorFilter,
        applyCanvasCollaboratorHighlight,
        populateSchemaUserFilterMenu,
        updateSchemaUserFilterMetrics,
        toggleCollabSelectDropdown,
        closeAllCollabDropdowns,
        renderCollabDropdownItems,
        filterCollabSelectDropdown,
        selectCollabUser,
        updateCollabTriggerDisplay,
        showToast
    };

    // Cerrar dropdown de colaboradores al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-collab-select-wrapper')) {
            closeAllCollabDropdowns();
        }
        if (!e.target.closest('.assignee-autocomplete-wrapper')) {
            const dd = document.getElementById('schema-task-assignee-dropdown');
            if (dd) dd.style.display = 'none';
            document.querySelectorAll('.assignee-dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
                menu.classList.remove('open');
            });
        }
        const userFilterWrap = document.getElementById('schema-user-filter-panel');
        if (userFilterWrap && !userFilterWrap.contains(e.target)) {
            const menu = document.getElementById('schema-custom-user-filter-menu');
            const trigger = document.getElementById('schema-user-filter-trigger');
            if (menu) menu.classList.remove('open');
            if (trigger) trigger.classList.remove('active');
        }
    });

    // Funciones globales directas para onclick en HTML
    window.renderSchemaView = renderSchemaView;
    window.initSchemaEngine = initSchemaEngine;
    window.openAddTaskForDept = openAddTaskForDept;
    window.openAddTaskForSubDept = openAddTaskForSubDept;
    window.openNewSchemaTaskModal = openNewSchemaTaskModal;
    window.closeSchemaTaskModal = closeSchemaTaskModal;
    window.handleSaveSchemaTask = handleSaveSchemaTask;
    window.openEditModal = openEditModal;
    window.openBranchModal = openBranchModal;
    window.openLinkTaskModal = openLinkTaskModal;
    window.closeLinkTaskModal = closeLinkTaskModal;
    window.setLinkDirection = setLinkDirection;
    window.filterLinkTaskModal = filterLinkTaskModal;
    window.selectLinkTargetTask = selectLinkTargetTask;
    window.handleSaveLinkTask = handleSaveLinkTask;
    window.removeTaskLink = removeTaskLink;
    window.deleteTask = deleteTask;
    window.toggleTaskStatus = toggleTaskStatus;
    window.focusTask = focusTask;
    window.openNewSchemaProjectModal = openNewSchemaProjectModal;
    window.closeSchemaProjectModal = closeSchemaProjectModal;
    window.handleCreateSchemaProject = handleCreateSchemaProject;
    window.resetDefaultRodipackSchema = resetDefaultRodipackSchema;
    window.handleSelectSchemaProject = handleSelectSchemaProject;
    window.setSchemaPrioritySegment = setSchemaPrioritySegment;
    window.openNewDeptModal = openNewDeptModal;
    window.closeNewDeptModal = closeNewDeptModal;
    window.handleSaveNewDept = handleSaveNewDept;
    window.selectNewDeptColor = selectNewDeptColor;
    window.addDepartmentRight = addDepartmentRight;
    window.openNewSubDeptModal = openNewSubDeptModal;
    window.closeNewSubDeptModal = closeNewSubDeptModal;
    window.handleSaveNewSubDept = handleSaveNewSubDept;
    window.openEditSubDeptModal = openEditSubDeptModal;
    window.closeEditSubDeptModal = closeEditSubDeptModal;
    window.handleSaveEditSubDept = handleSaveEditSubDept;
    window.deleteSubDepartment = deleteSubDepartment;
    window.openEditRootModal = openEditRootModal;
    window.closeEditRootModal = closeEditRootModal;
    window.handleSaveEditRoot = handleSaveEditRoot;
    window.openCollabDropdown = openCollabDropdown;
    window.filterCollabDropdown = filterCollabDropdown;
    window.selectCollab = selectCollab;
    window.toggleCollabSelectDropdown = toggleCollabSelectDropdown;
    window.closeAllCollabDropdowns = closeAllCollabDropdowns;
    window.renderCollabDropdownItems = renderCollabDropdownItems;
    window.filterCollabSelectDropdown = filterCollabSelectDropdown;
    window.selectCollabUser = selectCollabUser;
    window.updateCollabTriggerDisplay = updateCollabTriggerDisplay;
    window.openSchemaAssigneeDropdown = openSchemaAssigneeDropdown;
    window.filterSchemaAssigneeDropdown = filterSchemaAssigneeDropdown;
    window.selectSchemaAssignee = selectSchemaAssignee;
    window.toggleDeptMenu = toggleDeptMenu;
    window.closeAllDeptMenus = closeAllDeptMenus;
    window.openEditDeptModal = openEditDeptModal;
    window.closeEditDeptModal = closeEditDeptModal;
    window.handleSaveEditDept = handleSaveEditDept;
    window.selectDeptColor = selectDeptColor;
    window.deleteDepartment = deleteDepartment;
    window.toggleUserFilterMenu = toggleUserFilterMenu;
    window.setCollaboratorFilter = setCollaboratorFilter;
    window.applyCanvasCollaboratorHighlight = applyCanvasCollaboratorHighlight;

})(window);
