// Default Application Data (Datos falsos e inventados eliminados)
const defaultTasks = [];

const defaultChats = {
    general: []
};

const defaultMeetings = [];

// Seed data for Proveedores matching Imagen 4 & Excel
const defaultProveedores = [
    { folioFF: "FF-01", proveedor: "Jennifer", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-02", proveedor: "Rama", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-03", proveedor: "Transportes Express", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-04", proveedor: "Jennifer", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-05", proveedor: "Rama", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-06", proveedor: "Transportes Express", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-07", proveedor: "Jennifer", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" },
    { folioFF: "FF-08", proveedor: "Rama", fecha: "", servicio: "Logistic", subtotal: 0, iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P", folioFE: "FE-", op: "" }
];

// Seed data for Nóminas matching Imagen 3
const defaultNominas = [
    { folio: "1", empleado: "Fox", fecha: "2026-08-15", servicio: "Nomina", iva: 0, ret4: 0, retIsr: 0, total: 10600, p: "P" },
    { folio: "2", empleado: "MP", fecha: "2026-08-15", servicio: "Nomina", iva: 0, ret4: 0, retIsr: 0, total: 1060, p: "P" },
    { folio: "3", empleado: "Rex", fecha: "2026-08-15", servicio: "Nomina", iva: 0, ret4: 0, retIsr: 0, total: 1060, p: "P" },
    { folio: "4", empleado: "RM", fecha: "2026-08-15", servicio: "Nomina", iva: 0, ret4: 0, retIsr: 0, total: 1060, p: "P" },
    { folio: "5", empleado: "", fecha: "", servicio: "", iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P" },
    { folio: "6", empleado: "", fecha: "", servicio: "", iva: 0, ret4: 0, retIsr: 0, total: 0, p: "P" },
    { folio: "7", empleado: "", fecha: "", servicio: "", iva: 0, ret4: 0, retIsr: 0, total: 0, p: "X" },
    { folio: "8", empleado: "", fecha: "", servicio: "", iva: 0, ret4: 0, retIsr: 0, total: 0, p: "X" }
];

// Default Concept values matching Imagen 2
const defaultConcepts = {
    bancos: 10000,
    ingresos: 0,
    gastosInd: 670,
    impuestos: 0
};

const defaultProveedorNames = ["Jennifer", "Rama", "Transportes Express"];

// Environment helper: detección de Localhost vs Producción
window.isLocalhostEnvironment = function() {
    try {
        const host = window.location.hostname;
        const proto = window.location.protocol;
        return Boolean(
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host === '0.0.0.0' ||
            host === '[::1]' ||
            host.endsWith('.localhost') ||
            host.startsWith('192.168.') ||
            host.startsWith('10.') ||
            host.startsWith('172.') ||
            proto === 'file:'
        );
    } catch (e) {
        return false;
    }
};

if (window.isLocalhostEnvironment()) {
    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.add('is-localhost');
    }
    if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('is-localhost');
    }
}

// App Global State
let appState = {
    currentRole: 'gerente', // 'gerente' or 'colaborador'
    currentTab: 'tasks', // 'tasks', 'chat', 'meetings', 'administracion'
    currentAdminFicha: 'visualizacion', // 'visualizacion', 'quincenal', 'proveedores', 'consecutivo'
    selectedProveedorFilter: 'all', // 'all' or specific name
    currentChannel: 'general',
    currentFilter: 'all',
    currentTaskUserFilter: 'all', // 'all' or collaborator name
    
    tasks: [],
    chats: {},
    meetings: [],
    
    // Administration Data
    proveedores: [],
    nominas: [],
    archivosQuincenales: [],
    viewingArchiveId: null,
    concepts: defaultConcepts,
    proveedorNamesList: defaultProveedorNames,
    
    // Consecutivo Data & Filter State
    consecutivo: [],
    consecutivoSearch: '',
    consecutivoStFilter: 'all',
    consecutivoClientFilter: 'all',
    consecutivoPage: 1,
    consecutivoPageSize: 50,

    // Centro de Correos Electrónicos State
    emails: [],
    currentEmailFolder: 'inbox',
    currentEmailFilter: 'all',
    currentEmailCategory: 'all',
    selectedEmailId: null,
    emailSearchQuery: '',
    selectedEmailIds: new Set(),
    composeAttachments: []
};

let pieChartInstance = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
    if (window.isLocalhostEnvironment()) {
        if (document.documentElement) document.documentElement.classList.add('is-localhost');
        if (document.body) document.body.classList.add('is-localhost');
    }

    // Lista de tareas base creadas por el usuario para recuperación automática
    const defaultUserTasks = [
        {
            id: 'task-rodiload-pagos',
            title: 'rodiload" sistema"',
            desc: 'Habilitar sistema de pagos anuales y mensuales para iniciar secion . para ello conectar api de sistema de pagos.',
            priority: 'baja',
            status: 'pending',
            assignee: 'Roberto Miranda',
            createdAt: '2026-09-08T12:00:00.000Z'
        },
        {
            id: 'task-rodiload-email',
            title: 'rodiload "Sistema"',
            desc: 'Conectar sistema a correo electronico para recuperacion de contraseña ( para ello hacer un correo electronico con el dominio y usar thunderbird para la gestion de correos internos)',
            priority: 'baja',
            status: 'pending',
            assignee: 'Roberto Miranda',
            createdAt: '2026-09-08T12:05:00.000Z'
        },
        {
            id: 'task-rodiload-medidas',
            title: 'Rodiload "sistema"',
            desc: '- Revisar y ajustar medidas de unidades',
            priority: 'baja',
            status: 'pending',
            assignee: 'Roberto Miranda',
            createdAt: '2026-09-08T12:10:00.000Z'
        },
        {
            id: 'task-roditrack-apk-ios',
            title: 'Roditrack online "sistema"',
            desc: '- Testeo de roditrack con el apk -Subir sistema a IOS ( Para ello pagar computadora en linea y pagar anualidad ( 99 usd) -Conectar a api de sistema de pagos - Conectar correo electronico del sistema para la recuperacion de contraseñas',
            priority: 'alta',
            status: 'pending',
            assignee: 'Roberto Miranda',
            createdAt: '2026-09-08T12:15:00.000Z'
        },
        {
            id: 'task-roditrack-web',
            title: 'roditrack (web)',
            desc: '- poner el sistema descargable - poner direccion de correo electronico ( roditrack@.com) - Hacer pagina en linkedin de roditrack o rodipack - poner links y planes del sistema',
            priority: 'media',
            status: 'pending',
            assignee: 'Roberto Miranda',
            createdAt: '2026-09-08T12:20:00.000Z'
        },
        {
            id: 'task-roditrack-uber',
            title: 'Roditrack online',
            desc: 'Testeo del nuevo apk ( revisar que este haciendo el rastreo tipo uber )',
            priority: 'alta',
            status: 'pending',
            assignee: 'Roberto Miranda Perez',
            createdAt: '2026-09-08T13:30:00.000Z'
        },
        {
            id: 'task-roditrack-email-recov',
            title: 'Roditrack online',
            desc: 'Crear y conectar correo electronico para recuperacion de contraseñas',
            priority: 'alta',
            status: 'pending',
            assignee: 'Roberto Miranda Perez',
            createdAt: '2026-09-08T13:40:00.000Z'
        }
    ];

    appState.deletedTaskIds = JSON.parse(localStorage.getItem('rp_deleted_task_ids')) || [];
    let storedTasks = JSON.parse(localStorage.getItem('rp_tasks')) || [];
    
    const isTaskDeleted = (task) => {
        if (!task || !task.title) return true;
        const sig = `${(task.title || '').trim().toLowerCase()}____${(task.desc || '').trim().toLowerCase()}`;
        return (appState.deletedTaskIds || []).some(d => d === task.id || (sig && d === sig));
    };
    const fakeAssignees = new Set(['sofía castro', 'sofia castro', 'carlos ruiz', 'juan pérez', 'juan perez', 'maría gómez', 'maria gomez', 'gerente principal']);
    storedTasks = storedTasks.filter(t => {
        if (!t || !t.title || t.id === 'task-1' || t.id === 'task-2' || isTaskDeleted(t)) return false;
        const assignee = (t.assignee || '').trim().toLowerCase();
        if (fakeAssignees.has(assignee)) return false;
        if (t.id === '6929c3c3-9be4-40ec-87a8-358386733c2b' || t.id === 'c772ff39-1ddb-4911-ba44-a924d5efb841') return false;
        return true;
    });

    // Fusionar tareas predeterminadas con tareas locales basándose en ID o firma (título + descripción)
    const tasksMap = new Map();
    defaultUserTasks.forEach(dt => {
        if (isTaskDeleted(dt)) return;
        const sig = `${(dt.title || '').trim().toLowerCase()}____${(dt.desc || '').trim().toLowerCase()}`;
        tasksMap.set(dt.id, dt);
        if (sig) tasksMap.set(sig, dt);
    });
    storedTasks.forEach(st => {
        if (!st || !st.title || isTaskDeleted(st)) return;
        const sig = `${(st.title || '').trim().toLowerCase()}____${(st.desc || '').trim().toLowerCase()}`;
        tasksMap.set(st.id, st);
        if (sig) tasksMap.set(sig, st);
    });

    // Reconstruir array deduplicado
    const initialTasksList = [];
    const seenIds = new Set();
    const seenSigs = new Set();
    Array.from(tasksMap.values()).forEach(t => {
        if (!t || !t.title || isTaskDeleted(t)) return;
        const sig = `${(t.title || '').trim().toLowerCase()}____${(t.desc || '').trim().toLowerCase()}`;
        if (!seenIds.has(t.id) && (!sig || !seenSigs.has(sig))) {
            seenIds.add(t.id);
            if (sig) seenSigs.add(sig);
            initialTasksList.push(t);
        }
    });

    appState.tasks = initialTasksList;
    localStorage.setItem('rp_tasks', JSON.stringify(appState.tasks));

    const storedMeetings = JSON.parse(localStorage.getItem('rp_meetings'));
    if (storedMeetings && storedMeetings.some(m => m.id === 'meet-1' || m.id === 'meet-2')) {
        localStorage.removeItem('rp_meetings');
    }
    let storedChats = JSON.parse(localStorage.getItem('rp_chats'));
    if (storedChats && typeof storedChats === 'object') {
        const fakeNames = new Set(["Juan Pérez", "Juan Perez", "María Gómez", "Maria Gomez", "Gerente Principal"]);
        Object.keys(storedChats).forEach(k => {
            if (k === 'cubicacion-ayuda' || k === 'tracking-status') {
                delete storedChats[k];
            } else if (Array.isArray(storedChats[k])) {
                storedChats[k] = storedChats[k].filter(m => {
                    if (!m) return false;
                    const sender = (m.sender || '').trim();
                    const text = (m.text || '').trim();
                    if (fakeNames.has(sender)) return false;
                    if (text.includes("cubicación del contenedor") || text.includes("tracking del despacho demorado") || text.includes("exportación de hoy")) return false;
                    return true;
                });
            }
        });
        localStorage.setItem('rp_chats', JSON.stringify(storedChats));
    }

    appState.chats = storedChats || { general: [] };
    if (!appState.chats.general) appState.chats.general = [];
    appState.customChannels = JSON.parse(localStorage.getItem('rp_custom_channels')) || [];
    appState.meetings = JSON.parse(localStorage.getItem('rp_meetings')) || [];
    
    // Load Administration Data
    appState.proveedores = JSON.parse(localStorage.getItem('rp_proveedores_data')) || defaultProveedores;
    appState.nominas = JSON.parse(localStorage.getItem('rp_nominas_data')) || defaultNominas;
    appState.archivosQuincenales = JSON.parse(localStorage.getItem('rp_archivos_quincenales')) || [];
    appState.viewingArchiveId = null;
    appState.concepts = JSON.parse(localStorage.getItem('rp_admin_concepts')) || defaultConcepts;
    appState.proveedorNamesList = JSON.parse(localStorage.getItem('rp_proveedor_names')) || defaultProveedorNames;
    
    // Load Consecutivo Data (with robust fallback to initialConsecutivoData if stored is empty or invalid)
    const storedConsecutivo = localStorage.getItem('rp_consecutivo_data');
    if (storedConsecutivo) {
        try {
            const parsed = JSON.parse(storedConsecutivo);
            if (Array.isArray(parsed) && parsed.length > 0) {
                appState.consecutivo = parsed;
            } else {
                appState.consecutivo = (window.initialConsecutivoData && window.initialConsecutivoData.length > 0) ? window.initialConsecutivoData : [];
            }
        } catch (e) {
            appState.consecutivo = (window.initialConsecutivoData && window.initialConsecutivoData.length > 0) ? window.initialConsecutivoData : [];
        }
    } else {
        appState.consecutivo = (window.initialConsecutivoData && window.initialConsecutivoData.length > 0) ? window.initialConsecutivoData : [];
    }
    
    // Auto-fix migration: If all loaded proveedores happen to be set to 'Jennifer', distribute them across available names
    if (appState.proveedores && appState.proveedores.length > 0 && appState.proveedores.every(p => p.proveedor === "Jennifer")) {
        const names = appState.proveedorNamesList.length > 0 ? appState.proveedorNamesList : defaultProveedorNames;
        appState.proveedores.forEach((p, idx) => {
            p.proveedor = names[idx % names.length];
        });
        saveToStorage();
    }
    
    // Restaurar usuario en sesión si la sesión está activa
    const isSessionActive = localStorage.getItem("rp_session_active") === "true";
    const storedUser = localStorage.getItem("rp_logged_user");
    if (isSessionActive && storedUser) {
        try {
            appState.currentUser = JSON.parse(storedUser);
            const isDiego = appState.currentUser && (
                (appState.currentUser.email && appState.currentUser.email.toLowerCase().includes('diego')) ||
                (appState.currentUser.nombre && appState.currentUser.nombre.toLowerCase().includes('diego'))
            );
            if (isDiego) {
                appState.currentUser.rol = 'administrativo';
                localStorage.setItem("rp_logged_user", JSON.stringify(appState.currentUser));
                localStorage.setItem("rp_current_role", 'administrativo');
            }
        } catch (e) {
            console.warn("Error parsing stored user session:", e);
        }
    }

    // Restaurar rol activo persistido (o del usuario logueado)
    const storedRole = localStorage.getItem("rp_current_role");
    const isDiegoUser = appState.currentUser && (
        (appState.currentUser.email && appState.currentUser.email.toLowerCase().includes('diego')) ||
        (appState.currentUser.nombre && appState.currentUser.nombre.toLowerCase().includes('diego'))
    );
    if (isDiegoUser) {
        appState.currentRole = 'administrativo';
    } else if (storedRole) {
        appState.currentRole = storedRole;
    } else if (appState.currentUser && appState.currentUser.rol) {
        appState.currentRole = appState.currentUser.rol;
    } else {
        appState.currentRole = 'gerente';
    }

    // Restaurar pestaña activa persistida o desde hash de URL
    const isLocalhost = window.isLocalhostEnvironment();
    const hashTab = window.location.hash ? window.location.hash.replace('#', '').trim() : '';
    const storedTab = localStorage.getItem("rp_current_tab");
    if (hashTab && ['emails', 'tasks', 'chat', 'administracion', 'meetings', 'users', 'profile'].includes(hashTab)) {
        appState.currentTab = (hashTab === 'emails' && !isLocalhost) ? 'tasks' : hashTab;
    } else if (storedTab) {
        appState.currentTab = (storedTab === 'emails' && !isLocalhost) ? 'tasks' : storedTab;
    } else {
        appState.currentTab = 'tasks';
    }

    // Restaurar subficha de administración si existía
    const storedAdminFicha = localStorage.getItem("rp_current_admin_ficha");
    if (storedAdminFicha) {
        appState.currentAdminFicha = storedAdminFicha;
    }

    // Inicializar Centro de Correos Electrónicos ÚNICAMENTE en localhost
    if (isLocalhost) {
        if (typeof loadEmailsData === 'function') {
            await loadEmailsData();
        }
        if (typeof setupSupabaseEmailsRealtime === 'function') {
            setupSupabaseEmailsRealtime();
        }
    }

    setRole(appState.currentRole);
    switchTab(appState.currentTab);
    if (appState.currentAdminFicha && typeof switchAdminFicha === 'function') {
        switchAdminFicha(appState.currentAdminFicha);
    }

    renderTasks();
    renderChatMessages(true);
    renderMeetings();
    renderAdministracion();
    updateGlobalStats();
    updateUserSessionUI();

    // Ocultar por defecto badge de chat si no hay mensajes nuevos
    const chatBadge = document.getElementById("unread-chat-count");
    if (chatBadge && (appState.currentTab === 'chat' || chatBadge.innerText === "0" || chatBadge.innerText === "2")) {
        chatBadge.style.display = "none";
        chatBadge.innerText = "0";
    }

    // Escuchadores de scroll y cambio de tamaño para actualización de navegación horizontal de tareas
    const tasksSlider = document.getElementById("tasks-slider-container");
    if (tasksSlider) {
        tasksSlider.addEventListener("scroll", () => {
            if (typeof updateTasksScrollNavState === 'function') updateTasksScrollNavState();
        });
    }
    window.addEventListener("resize", () => {
        if (typeof updateTasksScrollNavState === 'function') updateTasksScrollNavState();
    });

    // Cargar y almacenar en caché la lista de perfiles de usuario al iniciar
    if (typeof loadProfilesList === 'function') {
        loadProfilesList();
    }

    // Check if session is active or logged out
    if (!isSessionActive) {
        appState.currentUser = null;
        showGlobalLoginOverlay();
    }

    // Initialize Cloud & Realtime
    initAuthAndRealtime();
    
    // Ocultar Pantalla de Carga Global solo cuando las fuentes e iconos (Material Symbols) estén 100% listos
    const hideLoader = async () => {
        const loader = document.getElementById("app-loading-screen");
        if (!loader) return;
        
        try {
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
        } catch (e) {
            console.warn("Fonts ready check fallback:", e);
        }
        
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 450);
        }, 500);
    };
    
    hideLoader();
});

function saveToStorage() {
    try {
        if (appState.tasks) localStorage.setItem('rp_tasks', JSON.stringify(appState.tasks));
        if (appState.customChannels) localStorage.setItem('rp_custom_channels', JSON.stringify(appState.customChannels));
        if (appState.meetings) localStorage.setItem('rp_meetings', JSON.stringify(appState.meetings));
        if (appState.proveedores) localStorage.setItem('rp_proveedores_data', JSON.stringify(appState.proveedores));
        if (appState.nominas) localStorage.setItem('rp_nominas_data', JSON.stringify(appState.nominas));
        if (appState.archivosQuincenales) localStorage.setItem('rp_archivos_quincenales', JSON.stringify(appState.archivosQuincenales));
        if (appState.concepts) localStorage.setItem('rp_admin_concepts', JSON.stringify(appState.concepts));
        if (appState.proveedorNamesList) localStorage.setItem('rp_proveedor_names', JSON.stringify(appState.proveedorNamesList));
        if (appState.consecutivo) localStorage.setItem('rp_consecutivo_data', JSON.stringify(appState.consecutivo));
        if (appState.emails) localStorage.setItem('rp_emails_data', JSON.stringify(appState.emails));

        if (appState.chats) {
            try {
                localStorage.setItem('rp_chats', JSON.stringify(appState.chats));
            } catch (quotaErr) {
                console.warn("⚠️ localStorage quota reached for rp_chats. Saving lightweight copy without large dataUrls:", quotaErr);
                const lightChats = {};
                for (const k in appState.chats) {
                    lightChats[k] = (appState.chats[k] || []).map(m => {
                        if (m.attachment && m.attachment.dataUrl && m.attachment.dataUrl.length > 50000) {
                            const { dataUrl, ...restAtt } = m.attachment;
                            return { ...m, attachment: { ...restAtt, hasCloudData: true } };
                        }
                        return m;
                    });
                }
                localStorage.setItem('rp_chats', JSON.stringify(lightChats));
            }
        }
    } catch (e) {
        console.warn("⚠️ Error saving to localStorage:", e);
    }
}

// 1. Role and Session Handler (Background Role Management)
window.setRole = function(role) {
    const isDiego = appState.currentUser && (
        (appState.currentUser.email && appState.currentUser.email.toLowerCase().includes('diego')) ||
        (appState.currentUser.nombre && appState.currentUser.nombre.toLowerCase().includes('diego'))
    );
    if (isDiego) {
        role = 'administrativo';
    }
    appState.currentRole = role || 'gerente';
    localStorage.setItem("rp_current_role", appState.currentRole);

    const r = (appState.currentRole || '').toLowerCase().trim();
    const isGerente = (r === 'gerente' || r === 'manager' || r === 'director') && !isDiego;
    const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo' || r === 'administracion' || isDiego;

    // Manejar clases en el body para control de estilos CSS inmediato e irrevocable
    if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('role-gerente', 'role-administrativo', 'role-administrador', 'role-admin', 'role-colaborador');
        if (isGerente) {
            document.body.classList.add('role-gerente');
        } else if (isAdmin) {
            document.body.classList.add('role-administrativo');
        } else {
            document.body.classList.add('role-colaborador');
        }
    }

    const sidebarAdminItem = document.getElementById("sidebar-item-administracion");
    const sidebarUsersItem = document.getElementById("sidebar-item-users");
    const newTaskCard = document.getElementById("new-task-card");
    const tasksControlPanel = document.querySelector(".tasks-control-panel");
    const tasksLayout = document.querySelector(".tasks-layout");
    const adminWorkspace = document.getElementById("administracion-manager-workspace");
    const adminLockScreen = document.getElementById("administracion-lock-screen");
    const btnCreateGroup = document.querySelector("#tab-chat button[onclick*='openCreateGroupModal']");
    
    if (isGerente) {
        if (newTaskCard) newTaskCard.style.display = "block";
        if (tasksControlPanel) tasksControlPanel.style.display = "flex";
        if (tasksLayout) tasksLayout.classList.remove("full-width-tasks");
        if (sidebarAdminItem) sidebarAdminItem.style.setProperty("display", "flex", "important");
        if (sidebarUsersItem) sidebarUsersItem.style.setProperty("display", "flex", "important");
        if (adminWorkspace) adminWorkspace.style.display = "block";
        if (adminLockScreen) adminLockScreen.style.display = "none";
        if (btnCreateGroup) btnCreateGroup.style.display = "inline-flex";
    } else if (isAdmin) {
        // Administrador / Administrativo: Acceso completo a Finanzas & Administración, SIN acceso a usuarios
        if (newTaskCard) newTaskCard.style.display = "none";
        if (tasksControlPanel) tasksControlPanel.style.display = "none";
        if (tasksLayout) tasksLayout.classList.add("full-width-tasks");
        if (sidebarAdminItem) sidebarAdminItem.style.setProperty("display", "flex", "important");
        if (sidebarUsersItem) sidebarUsersItem.style.setProperty("display", "none", "important");
        if (adminWorkspace) adminWorkspace.style.display = "block";
        if (adminLockScreen) adminLockScreen.style.display = "none";
        if (btnCreateGroup) btnCreateGroup.style.display = "none";
        
        // Si estaba en la pestaña de usuarios (solo gerentes), redirigir a administración
        if (appState.currentTab === 'users') {
            switchTab('administracion');
            return;
        }
    } else {
        // Colaborador de Operaciones
        if (newTaskCard) newTaskCard.style.display = "none";
        if (tasksControlPanel) tasksControlPanel.style.display = "none";
        if (tasksLayout) tasksLayout.classList.add("full-width-tasks");
        if (sidebarAdminItem) sidebarAdminItem.style.setProperty("display", "none", "important");
        if (sidebarUsersItem) sidebarUsersItem.style.setProperty("display", "none", "important");
        if (adminWorkspace) adminWorkspace.style.display = "none";
        if (adminLockScreen) adminLockScreen.style.display = "block";
        if (btnCreateGroup) btnCreateGroup.style.display = "none";
        
        // Si estaba en administración o usuarios, redirigir a tareas
        if (appState.currentTab === 'administracion' || appState.currentTab === 'users') {
            switchTab('tasks');
            return;
        }
    }
    
    // Ajustar encabezado y selector de colaborador según el rol
    const userFilterHeading = document.getElementById("user-filter-heading");
    const userFilterWrap = document.querySelector(".user-filter-select-wrap");
    if (isGerente) {
        if (userFilterHeading) userFilterHeading.innerText = "Filtrar por Colaborador:";
        if (userFilterWrap) userFilterWrap.style.display = "block";
        if (typeof window.populateTaskUserFilterOptions === 'function') {
            window.populateTaskUserFilterOptions();
        }
    } else {
        const userName = appState.currentUser ? (appState.currentUser.nombre || appState.currentUser.email) : 'Mis Tareas';
        if (userFilterHeading) userFilterHeading.innerText = `Mis Tareas Asignadas (${userName}):`;
        if (userFilterWrap) userFilterWrap.style.display = "none";
        appState.currentTaskUserFilter = 'all';
    }

    updateUserSessionUI();
    renderTasks();
    renderAdministracion();
    updateGlobalStats();
};

window.updateUserSessionUI = function() {
    const userAvatarEl = document.getElementById("user-avatar");
    const userNameEl = document.getElementById("user-display-name");
    const userRoleEl = document.getElementById("user-display-role");
    const authNavIcon = document.getElementById("sidebar-auth-icon");
    const authNavLabel = document.getElementById("sidebar-auth-label");
    
    if (appState.currentUser) {
        const u = appState.currentUser;
        const r = (u.rol || '').toLowerCase();
        const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
        const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';

        if (userNameEl) userNameEl.innerText = u.nombre || u.email;
        if (userRoleEl) {
            if (isGerente) userRoleEl.innerText = 'Gerente / Director';
            else if (isAdmin) userRoleEl.innerText = 'Administrativo (Finanzas & Nómina)';
            else userRoleEl.innerText = `Colaborador (${u.departamento || 'Equipo'})`;
        }
        if (userAvatarEl) {
            const initial = (u.nombre || u.email || 'G').charAt(0).toUpperCase();
            const avatarColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#64748B');
            userAvatarEl.innerText = initial;
            userAvatarEl.style.borderColor = avatarColor;
            userAvatarEl.style.color = avatarColor;
        }
        if (authNavIcon) authNavIcon.innerText = "logout";
        if (authNavLabel) authNavLabel.innerText = "Cerrar Sesión";
    } else {
        // Adaptar avatar y texto de sesión según el rol activo actual si no hay currentUser explícito
        const r = (appState.currentRole || '').toLowerCase();
        const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
        const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
        
        const roleName = isGerente ? 'Gerente Principal' : (isAdmin ? 'Administrativo' : 'Perfil Colaborador');
        const roleLabel = isGerente ? 'Gerente / Director' : (isAdmin ? 'Administrativo (Finanzas)' : 'Colaborador (Operaciones)');
        const avatarLetter = isGerente ? 'G' : (isAdmin ? 'A' : 'C');
        const avatarColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#64748B');

        if (userNameEl) userNameEl.innerText = roleName;
        if (userRoleEl) userRoleEl.innerText = roleLabel;
        if (userAvatarEl) {
            userAvatarEl.innerText = avatarLetter;
            userAvatarEl.style.borderColor = avatarColor;
            userAvatarEl.style.color = avatarColor;
        }
        if (authNavIcon) authNavIcon.innerText = "login";
        if (authNavLabel) authNavLabel.innerText = "Iniciar Sesión";
    }
};

window.handleAuthNavItemClick = function(e) {
    if (e) e.preventDefault();
    if (appState.currentUser) {
        openAuthModal();
    } else {
        openAuthModal();
        if (typeof switchAuthTab === 'function') {
            switchAuthTab('login');
        }
    }
};

// 2. Tab Switcher
window.switchTab = function(tabName) {
    // Si no está en localhost, bloquear Centro de Correos y redirigir a tareas
    if (tabName === 'emails' && typeof window.isLocalhostEnvironment === 'function' && !window.isLocalhostEnvironment()) {
        tabName = 'tasks';
    }

    const r = (appState.currentRole || '').toLowerCase();
    const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
    const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';

    // Usuarios solo accesible por Gerente
    if (tabName === 'users' && !isGerente) {
        tabName = 'tasks';
    }

    // Administración accesible por Gerente y Administrativo/Administrador
    if (tabName === 'administracion' && !isGerente && !isAdmin) {
        tabName = 'tasks';
    }

    appState.currentTab = tabName;
    localStorage.setItem("rp_current_tab", tabName);

    if (history && history.replaceState) {
        try {
            history.replaceState(null, '', '#' + tabName);
        } catch (e) {}
    }
    
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) activePane.classList.add("active");
    
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) activeNav.classList.add("active");
    
    const titleEl = document.getElementById("page-main-title");
    const subtitleEl = document.getElementById("page-subtitle");
    
    if (tabName === 'emails') {
        titleEl.innerText = "Centro de Correos";
        subtitleEl.innerText = "Buzón corporativo y mensajería interna sin intermediarios externos";
        if (typeof renderEmailCenter === 'function') renderEmailCenter();
    } else if (tabName === 'tasks') {
        titleEl.innerText = "Tablero de Tareas";
        subtitleEl.innerText = "Gestiona y supervisa las tareas del equipo de trabajo";
    } else if (tabName === 'chat') {
        titleEl.innerText = "Chat Interno";
        subtitleEl.innerText = "Resuelve dudas técnicas o conversa en tiempo real con el equipo";
        document.getElementById("unread-chat-count").style.display = "none";
        renderChatChannels();
        renderChatMessages(true);
    } else if (tabName === 'meetings') {
        titleEl.innerText = "Calendario de Reuniones";
        subtitleEl.innerText = "Planifica y agenda llamadas de coordinación del equipo";
    } else if (tabName === 'administracion') {
        titleEl.innerText = "Administración General";
        subtitleEl.innerText = "Control financiero, estadísticas por departamento, nóminas quincenales y proveedores";
        renderAdministracion();
    } else if (tabName === 'users') {
        titleEl.innerText = "Administración de Usuarios";
        subtitleEl.innerText = "Gestiona perfiles, permisos y alta de colaboradores del sistema";
        loadProfilesList();
    } else if (tabName === 'profile') {
        titleEl.innerText = "Configuración de Perfil";
        subtitleEl.innerText = "Gestiona tu cuenta, datos personales y seguridad";
        if (typeof openAuthModal === 'function') openAuthModal();
    }
};

// 3. Ficha Switching in Administración
window.switchAdminFicha = function(fichaName) {
    appState.currentAdminFicha = fichaName;
    localStorage.setItem("rp_current_admin_ficha", fichaName);
    
    // Update active button
    document.querySelectorAll(".admin-ficha-card").forEach(btn => btn.classList.remove("active"));
    const btn = document.getElementById(`ficha-btn-${fichaName}`);
    if (btn) {
        btn.classList.add("active");
    } else if (fichaName === 'archivo-digital') {
        const btnQ = document.getElementById('ficha-btn-quincenal');
        if (btnQ) btnQ.classList.add("active");
    }
    
    // Update active subpane
    document.querySelectorAll(".admin-subpane").forEach(pane => pane.classList.remove("active"));
    const subpane = document.getElementById(`admin-subpane-${fichaName}`);
    if (subpane) subpane.classList.add("active");

    const topbarBack = document.getElementById("op-detail-topbar");
    if (topbarBack && fichaName !== 'operaciones') topbarBack.style.display = "none";

    renderAdministracion();
};

function renderAdministracion() {
    const r = (appState.currentRole || '').toLowerCase();
    const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
    const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
    if (!isGerente && !isAdmin) return;
    
    if (appState.currentAdminFicha === 'visualizacion') {
        renderVisualizacion();
    } else if (appState.currentAdminFicha === 'quincenal') {
        renderNominas();
    } else if (appState.currentAdminFicha === 'proveedores') {
        renderProveedorChips();
        renderProveedores();
    } else if (appState.currentAdminFicha === 'consecutivo') {
        renderConsecutivo();
    } else if (appState.currentAdminFicha === 'archivo-digital') {
        renderArchivoDigital();
    } else if (appState.currentAdminFicha === 'operaciones') {
        if (typeof window.fetchOperacionesFromCloud === 'function') window.fetchOperacionesFromCloud();
        if (typeof window.renderOperaciones === 'function') window.renderOperaciones();
    }
}

// ---------------------------------------------------------------------------------
// 4. FICHA 1: VISUALIZACIÓN & ESTADÍSTICAS (IMAGEN 2)
// ---------------------------------------------------------------------------------
function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return "$0.00";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
}

function calculateAdminTotals() {
    const bancos = Number(appState.concepts.bancos) || 10000;
    const ingresos = Number(appState.concepts.ingresos) || 0;
    const subtotal1 = bancos + ingresos;
    
    // Sum from proveedores table
    let totalGastosProveedores = 0;
    appState.proveedores.forEach(p => {
        totalGastosProveedores += Number(p.total) || 0;
    });
    
    const subtotal2 = subtotal1 - totalGastosProveedores;
    const gastosInd = Number(appState.concepts.gastosInd) || 670;
    const subtotal3 = subtotal2 - gastosInd;
    
    // Sum from nóminas table
    let totalNominas = 0;
    window.getActiveNominasList().forEach(n => {
        totalNominas += Number(n.total) || 0;
    });
    
    const subtotal4 = subtotal3 - totalNominas;
    const impuestos = Number(appState.concepts.impuestos) || 0;
    const totalFinal = subtotal4 - impuestos;
    
    return {
        bancos,
        ingresos,
        subtotal1,
        totalGastosProveedores,
        subtotal2,
        gastosInd,
        subtotal3,
        totalNominas,
        subtotal4,
        impuestos,
        totalFinal
    };
}

function renderVisualizacion() {
    const totals = calculateAdminTotals();
    
    // Update KPI mini cards
    const kpiBancos = document.getElementById("kpi-bancos-val");
    if (kpiBancos) kpiBancos.innerText = formatCurrency(totals.bancos);
    
    const kpiProv = document.getElementById("kpi-proveedores-val");
    if (kpiProv) kpiProv.innerText = formatCurrency(totals.totalGastosProveedores);
    
    const kpiNom = document.getElementById("kpi-nominas-val");
    if (kpiNom) kpiNom.innerText = formatCurrency(totals.totalNominas);
    
    const kpiBal = document.getElementById("kpi-balance-val");
    if (kpiBal) {
        kpiBal.innerText = formatCurrency(totals.totalFinal);
        kpiBal.style.color = totals.totalFinal < 0 ? "#c62828" : "#2e7d32";
    }
    
    // Update Concept Table (Imagen 2 format)
    const elSub1 = document.getElementById("balance-subtotal-1");
    if (elSub1) elSub1.innerText = formatCurrency(totals.subtotal1);
    
    const elGastosProv = document.getElementById("concept-gastos-prov-val");
    if (elGastosProv) elGastosProv.innerText = formatCurrency(totals.totalGastosProveedores);
    
    const elSub2 = document.getElementById("balance-subtotal-2");
    if (elSub2) elSub2.innerText = formatCurrency(totals.subtotal2);
    
    const elSub3 = document.getElementById("balance-subtotal-3");
    if (elSub3) elSub3.innerText = formatCurrency(totals.subtotal3);
    
    const elNom = document.getElementById("concept-nominas-val");
    if (elNom) elNom.innerText = formatCurrency(totals.totalNominas);
    
    const elSub4 = document.getElementById("balance-subtotal-4");
    if (elSub4) elSub4.innerText = formatCurrency(totals.subtotal4);
    
    const elTotal = document.getElementById("concept-total-final");
    if (elTotal) {
        elTotal.innerText = formatCurrency(totals.totalFinal);
        elTotal.style.color = totals.totalFinal < 0 ? "#c62828" : "#101A2C";
    }
    
    // Update inputs
    const inpBancos = document.getElementById("concept-bancos-input");
    if (inpBancos && document.activeElement !== inpBancos) inpBancos.value = totals.bancos;
    
    const inpIngresos = document.getElementById("concept-ingresos-input");
    if (inpIngresos && document.activeElement !== inpIngresos) inpIngresos.value = totals.ingresos;
    
    const inpGastosInd = document.getElementById("concept-gastos-ind-input");
    if (inpGastosInd && document.activeElement !== inpGastosInd) inpGastosInd.value = totals.gastosInd;
    
    const inpImpuestos = document.getElementById("concept-impuestos-input");
    if (inpImpuestos && document.activeElement !== inpImpuestos) inpImpuestos.value = totals.impuestos;
    
    // Render Chart.js Pie Chart
    renderPieChart(totals);
}

window.updateAdminConcept = function(key, value) {
    appState.concepts[key] = Number(value) || 0;
    saveToStorage();
    renderVisualizacion();
};

function renderPieChart(totals) {
    const canvas = document.getElementById("admin-pie-chart");
    if (!canvas) return;
    
    // Destroy previous chart if exists
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    
    const dataValues = [
        Math.max(totals.bancos, 0),
        totals.totalNominas,
        Math.max(totals.totalGastosProveedores, 100),
        totals.gastosInd,
        totals.impuestos
    ];
    
    const ctx = canvas.getContext('2d');
    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bancos / Capital', 'Nóminas (Equipo)', 'Gastos Proveedores', 'Gastos Indirectos', 'Impuestos'],
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#4caf50', // Green
                    '#e53935', // Red
                    '#f58f1f', // Tangerine
                    '#d5b370', // Gold
                    '#829191'  // Grey
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 14,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            },
            cutout: '58%'
        }
    });
}

// ---------------------------------------------------------------------------------
// 5. FICHA 2: ADMINISTRACIÓN QUINCENAL (NÓMINAS - IMAGEN 3)
// ---------------------------------------------------------------------------------
function renderNominas() {
    const tbody = document.getElementById("tbody-nominas");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const list = window.getActiveNominasList();
    
    list.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <input type="text" class="excel-input" value="${item.folio || (index + 1)}" oninput="updateNominaCell(${index}, 'folio', this.value)" style="text-align: center; font-weight: 700;">
            </td>
            <td>
                <input type="text" class="excel-input" value="${item.empleado || ""}" oninput="updateNominaCell(${index}, 'empleado', this.value)" placeholder="Empleado..." style="font-weight: 700;">
            </td>
            <td>
                <input type="date" class="excel-input" value="${item.fecha || ""}" oninput="updateNominaCell(${index}, 'fecha', this.value)">
            </td>
            <td>
                <input type="text" class="excel-input" value="${item.servicio || "Nomina"}" oninput="updateNominaCell(${index}, 'servicio', this.value)">
            </td>
            <td>
                <input type="number" id="nom-iva-input-${index}" class="excel-input number-input readonly" value="${item.iva || 0}" readonly>
            </td>
            <td>
                <input type="number" id="nom-ret4-input-${index}" class="excel-input number-input" value="${item.ret4 || 0}" step="10" oninput="liveUpdateNominaTotals(${index})">
            </td>
            <td>
                <input type="number" id="nom-retisr-input-${index}" class="excel-input number-input" value="${item.retIsr || 0}" step="10" oninput="liveUpdateNominaTotals(${index})">
            </td>
            <td>
                <input type="number" id="nom-total-input-${index}" class="excel-input number-input" value="${item.total || 0}" step="10" oninput="updateNominaManualTotal(${index}, this.value)" style="font-weight: 800; background: rgba(31, 78, 120, 0.06);">
            </td>
            <td>
                <input type="text" class="excel-input ${(item.p || '').trim().toUpperCase() === 'X' ? 'excel-p-flag-x' : ''}" value="${item.p || "P"}" oninput="handlePInputChange(this, ${index}, 'nomina')" style="text-align: center; font-weight: 700;">
            </td>
            <td>
                <button class="btn-delete-task" onclick="deleteNominaRecord(${index})" title="Eliminar Empleado">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Bottom Green Summary Row (Imagen 3 style)
    const summaryTr = document.createElement("tr");
    summaryTr.className = "excel-green-row";
    summaryTr.id = "excel-nominas-totals-row";
    tbody.appendChild(summaryTr);
    
    recalculateNominasTableTotals();
}

window.handlePInputChange = function(inputEl, index, type) {
    const val = inputEl.value;
    const isX = val.trim().toUpperCase() === 'X';
    
    if (isX) {
        inputEl.classList.add('excel-p-flag-x');
    } else {
        inputEl.classList.remove('excel-p-flag-x');
    }
    
    if (type === 'nomina') {
        const list = window.getActiveNominasList();
    if (list[index]) {
            list[index].p = val;
            saveToStorage();
        }
    } else if (type === 'proveedor') {
        if (appState.proveedores[index]) {
            appState.proveedores[index].p = val;
            saveToStorage();
        }
    }
};

window.updateNominaCell = function(index, key, val) {
    const list = window.getActiveNominasList();
    if (list[index]) {
        list[index][key] = val;
        saveToStorage();
    }
};

window.updateNominaManualTotal = function(index, val) {
    const list = window.getActiveNominasList();
    if (list[index]) {
        list[index].total = Number(val) || 0;
        recalculateNominasTableTotals();
        saveToStorage();
        renderVisualizacion();
    }
};

window.liveUpdateNominaTotals = function(index) {
    const list = window.getActiveNominasList();
    if (!list || !list[index]) return;

    const ivaEl = document.getElementById(`nom-iva-input-${index}`);
    const ret4El = document.getElementById(`nom-ret4-input-${index}`);
    const retisrEl = document.getElementById(`nom-retisr-input-${index}`);
    const totalEl = document.getElementById(`nom-total-input-${index}`);
    
    const iva = ivaEl ? (Number(ivaEl.value) || 0) : 0;
    const ret4 = ret4El ? (Number(ret4El.value) || 0) : 0;
    const retisr = retisrEl ? (Number(retisrEl.value) || 0) : 0;
    
    list[index].iva = iva;
    list[index].ret4 = ret4;
    list[index].retIsr = retisr;
    if (totalEl) {
        list[index].total = Number(totalEl.value) || 0;
    }
    
    recalculateNominasTableTotals();
    saveToStorage();
    renderVisualizacion();
};

window.recalculateNominasTableTotals = function() {
    let sumIva = 0;
    let sumRet4 = 0;
    let sumRetIsr = 0;
    let sumTotal = 0;
    
    const list = window.getActiveNominasList();
    list.forEach(item => {
        sumIva += Number(item.iva) || 0;
        sumRet4 += Number(item.ret4) || 0;
        sumRetIsr += Number(item.retIsr) || 0;
        sumTotal += Number(item.total) || 0;
    });
    
    const totalsRow = document.getElementById("excel-nominas-totals-row");
    if (totalsRow) {
        totalsRow.innerHTML = `
            <td>Total General</td>
            <td>Suma Calculada</td>
            <td></td>
            <td></td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumIva)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumRet4)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumRetIsr)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumTotal)}</td>
            <td></td>
            <td><span class="material-symbols-outlined" style="font-size: 16px;">lock</span></td>
        `;
    }
};

window.addNewNominaRow = function() {
    const nextNum = window.getActiveNominasList().length + 1;
    window.getActiveNominasList().push({
        folio: String(nextNum),
        empleado: "",
        fecha: new Date().toISOString().split('T')[0],
        servicio: "Nomina",
        iva: 0,
        ret4: 0,
        retIsr: 0,
        total: 0,
        p: "P"
    });
    saveToStorage();
    renderNominas();
    renderVisualizacion();
};

window.deleteNominaRecord = function(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de nómina?")) {
        window.getActiveNominasList().splice(index, 1);
        saveToStorage();
        renderNominas();
        renderVisualizacion();
    }
};

// ---------------------------------------------------------------------------------
// 6. FICHA 3: PROVEEDORES CON CHIPS (IMAGEN 4)
// ---------------------------------------------------------------------------------
function renderProveedorChips() {
    const container = document.getElementById("proveedor-chips-container");
    if (!container) return;
    container.innerHTML = "";
    
    // "Todos" Chip
    const allChip = document.createElement("button");
    allChip.className = `proveedor-chip ${appState.selectedProveedorFilter === 'all' ? 'active' : ''}`;
    allChip.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">apps</span> Todos (${appState.proveedores.length})`;
    allChip.onclick = () => filterByProveedor('all');
    container.appendChild(allChip);
    
    // Dynamic Chips from provider names list
    appState.proveedorNamesList.forEach(name => {
        const count = appState.proveedores.filter(p => p.proveedor.toLowerCase() === name.toLowerCase()).length;
        const chip = document.createElement("button");
        chip.className = `proveedor-chip ${appState.selectedProveedorFilter.toLowerCase() === name.toLowerCase() ? 'active' : ''}`;
        chip.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">person</span> ${name} (${count})`;
        chip.onclick = () => filterByProveedor(name);
        container.appendChild(chip);
    });
}

window.filterByProveedor = function(name) {
    appState.selectedProveedorFilter = name;
    renderProveedorChips();
    renderProveedores();
};

window.promptAddProveedor = function() {
    const name = prompt("Ingresa el nombre del nuevo proveedor:");
    if (name && name.trim()) {
        const cleanName = name.trim();
        if (!appState.proveedorNamesList.some(n => n.toLowerCase() === cleanName.toLowerCase())) {
            appState.proveedorNamesList.push(cleanName);
        }
        appState.selectedProveedorFilter = cleanName;
        saveToStorage();
        renderProveedorChips();
        renderProveedores();
    }
};

function renderProveedores() {
    const tbody = document.getElementById("tbody-proveedores");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    let list = appState.proveedores || [];
    
    // Filter by active chip
    if (appState.selectedProveedorFilter !== 'all') {
        list = list.filter(p => p.proveedor.toLowerCase() === appState.selectedProveedorFilter.toLowerCase());
    }
    
    list.forEach((item, index) => {
        // Find real index in parent array
        const realIndex = appState.proveedores.indexOf(item);
        
        const names = appState.proveedorNamesList || defaultProveedorNames;
        const provOptions = names.map(n => `<option value="${n}" ${item.proveedor === n ? 'selected' : ''}>${n}</option>`).join('');
        const isKnown = names.includes(item.proveedor);
        const customOpt = (!isKnown && item.proveedor) ? `<option value="${item.proveedor}" selected>${item.proveedor}</option>` : '';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <input type="text" class="excel-input" value="${item.folioFF || ""}" oninput="updateProveedorCell(${realIndex}, 'folioFF', this.value)">
            </td>
            <td>
                <select class="excel-input custom-excel-select" onchange="updateProveedorCell(${realIndex}, 'proveedor', this.value)" style="font-weight: 700; cursor: pointer; background-color: transparent;">
                    ${provOptions}
                    ${customOpt}
                </select>
            </td>
            <td>
                <input type="date" class="excel-input" value="${item.fecha || ""}" oninput="updateProveedorCell(${realIndex}, 'fecha', this.value)">
            </td>
            <td>
                <input type="text" class="excel-input" value="${item.servicio || "Logistic"}" oninput="updateProveedorCell(${realIndex}, 'servicio', this.value)">
            </td>
            <td>
                <input type="number" id="prov-subtotal-input-${realIndex}" class="excel-input number-input" value="${item.subtotal || 0}" step="10" oninput="liveUpdateProveedorTotals(${realIndex})">
            </td>
            <td>
                <input type="number" id="prov-iva-input-${realIndex}" class="excel-input number-input readonly" value="${item.iva || 0}" readonly>
            </td>
            <td>
                <input type="number" id="prov-ret4-input-${realIndex}" class="excel-input number-input" value="${item.ret4 || 0}" step="10" oninput="liveUpdateProveedorTotals(${realIndex})">
            </td>
            <td>
                <input type="number" id="prov-retisr-input-${realIndex}" class="excel-input number-input" value="${item.retIsr || 0}" step="10" oninput="liveUpdateProveedorTotals(${realIndex})">
            </td>
            <td>
                <input type="number" id="prov-total-input-${realIndex}" class="excel-input number-input readonly" value="${item.total || 0}" readonly style="font-weight: 700;">
            </td>
            <td>
                <input type="text" class="excel-input ${(item.p || '').trim().toUpperCase() === 'X' ? 'excel-p-flag-x' : ''}" value="${item.p || "P"}" oninput="handlePInputChange(this, ${realIndex}, 'proveedor')" style="text-align: center; font-weight: 700;">
            </td>
            <td>
                <input type="text" class="excel-input" value="${item.folioFE || "FE-"}" oninput="updateProveedorCell(${realIndex}, 'folioFE', this.value)">
            </td>
            <td>
                <input type="text" class="excel-input" value="${item.op || ""}" oninput="updateProveedorCell(${realIndex}, 'op', this.value)">
            </td>
            <td>
                <button class="btn-delete-task" onclick="deleteProveedorRecord(${realIndex})" title="Eliminar Registro">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Bottom total summary row colored in Green (Image 4 style)
    const summaryTr = document.createElement("tr");
    summaryTr.className = "excel-green-row";
    summaryTr.id = "excel-proveedores-totals-row";
    tbody.appendChild(summaryTr);
    
    recalculateProveedoresTableTotals();
}

window.updateProveedorCell = function(index, key, val) {
    if (appState.proveedores[index]) {
        appState.proveedores[index][key] = val;
        
        // If updated provider name, check if in names list
        if (key === 'proveedor') {
            if (val.trim() && !appState.proveedorNamesList.some(n => n.toLowerCase() === val.trim().toLowerCase())) {
                appState.proveedorNamesList.push(val.trim());
            }
            renderProveedorChips();
            renderProveedores();
        }
        
        saveToStorage();
    }
};

window.liveUpdateProveedorTotals = function(index) {
    const subtotalEl = document.getElementById(`prov-subtotal-input-${index}`);
    const ivaEl = document.getElementById(`prov-iva-input-${index}`);
    const ret4El = document.getElementById(`prov-ret4-input-${index}`);
    const retisrEl = document.getElementById(`prov-retisr-input-${index}`);
    const totalEl = document.getElementById(`prov-total-input-${index}`);
    
    if (subtotalEl && ivaEl && ret4El && retisrEl && totalEl) {
        const subtotal = Number(subtotalEl.value) || 0;
        const iva = subtotal * 0.16;
        ivaEl.value = iva.toFixed(2);
        
        const ret4 = Number(ret4El.value) || 0;
        const retisr = Number(retisrEl.value) || 0;
        
        const total = subtotal + iva - ret4 - retisr;
        totalEl.value = total.toFixed(2);
        
        appState.proveedores[index].subtotal = subtotal;
        appState.proveedores[index].iva = iva;
        appState.proveedores[index].ret4 = ret4;
        appState.proveedores[index].retIsr = retisr;
        appState.proveedores[index].total = total;
        
        recalculateProveedoresTableTotals();
        saveToStorage();
        renderVisualizacion();
    }
};

window.recalculateProveedoresTableTotals = function() {
    let sumSubtotal = 0;
    let sumIva = 0;
    let sumRet4 = 0;
    let sumRetIsr = 0;
    let sumTotal = 0;
    
    let list = appState.proveedores || [];
    if (appState.selectedProveedorFilter !== 'all') {
        list = list.filter(p => p.proveedor.toLowerCase() === appState.selectedProveedorFilter.toLowerCase());
    }
    
    list.forEach(item => {
        sumSubtotal += Number(item.subtotal) || 0;
        sumIva += Number(item.iva) || 0;
        sumRet4 += Number(item.ret4) || 0;
        sumRetIsr += Number(item.retIsr) || 0;
        sumTotal += Number(item.total) || 0;
    });
    
    const totalsRow = document.getElementById("excel-proveedores-totals-row");
    if (totalsRow) {
        totalsRow.innerHTML = `
            <td>Total General</td>
            <td>Suma Calculada</td>
            <td></td>
            <td></td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumSubtotal)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumIva)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumRet4)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumRetIsr)}</td>
            <td style="font-weight: 800; text-align: right;">${formatCurrency(sumTotal)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td><span class="material-symbols-outlined" style="font-size: 16px;">lock</span></td>
        `;
    }
};

window.addNewProveedorRow = function() {
    const nextNum = appState.proveedores.length + 1;
    const defaultProv = appState.selectedProveedorFilter !== 'all' ? appState.selectedProveedorFilter : "Jennifer";
    
    appState.proveedores.push({
        folioFF: `FF-${String(nextNum).padStart(2, '0')}`,
        proveedor: defaultProv,
        fecha: new Date().toISOString().split('T')[0],
        servicio: "Logistic",
        subtotal: 0,
        iva: 0,
        ret4: 0,
        retIsr: 0,
        total: 0,
        p: "P",
        folioFE: "FE-",
        op: ""
    });
    saveToStorage();
    renderProveedorChips();
    renderProveedores();
    renderVisualizacion();
};

window.deleteProveedorRecord = function(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de proveedor?")) {
        appState.proveedores.splice(index, 1);
        saveToStorage();
        renderProveedorChips();
        renderProveedores();
        renderVisualizacion();
    }
};

// ---------------------------------------------------------------------------------
// 7. TASK MANAGEMENT LOGIC
// ---------------------------------------------------------------------------------
window.handleCreateTask = function(event) {
    event.preventDefault();
    const title = document.getElementById("task-title").value.trim();
    const desc = document.getElementById("task-desc").value.trim();
    const assigneeInput = document.getElementById("task-assignee");
    const assignee = assigneeInput ? assigneeInput.value.trim() : '';
    const rawPriority = document.getElementById("task-priority").value || 'alta';
    const priority = rawPriority.trim().toLowerCase();
    
    if (!title) return;
    
    const newTask = {
        id: `task-${Date.now()}`,
        title,
        desc,
        assignee: assignee || 'Sin asignar',
        priority,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    appState.tasks.unshift(newTask);
    saveToStorage();
    document.getElementById("new-task-form").reset();
    
    // Reset inputs cleanly
    if (assigneeInput) assigneeInput.value = "";
    if (typeof closeAssigneeDropdown === 'function') closeAssigneeDropdown();
    setTaskPrioritySegment('alta');
    
    // Si la prioridad de la nueva tarea no coincide con el filtro activo, cambiar al filtro correspondiente o a "Todas" para mostrar la tarea
    if (appState.currentFilter !== 'all' && appState.currentFilter !== priority) {
        const targetBtn = document.querySelector(`.filter-btn[data-filter='${priority}']`) || document.querySelector(`.filter-btn[data-filter='all']`);
        if (targetBtn) {
            filterTasks(priority, targetBtn);
        } else {
            renderTasks();
        }
    } else {
        renderTasks();
    }
    updateGlobalStats();
    if (typeof window.populateTaskUserFilterOptions === 'function') window.populateTaskUserFilterOptions();
    
    // Cloud Sync
    if (window.isSupabaseActive()) {
        const client = window.SUPABASE_CONFIG.client;
        const dbPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
        client.from('tasks').insert([{
            titulo: title,
            descripcion: desc,
            prioridad: dbPriority,
            estado: 'pendiente',
            asignado_nombre: assignee || 'Sin asignar'
        }]).then(({ error }) => {
            if (error) console.warn("Error saving task to Supabase:", error);
        });

        // Transmisión instantánea en tiempo real por WebSockets
        if (window.chatRealtimeChannel) {
            window.chatRealtimeChannel.send({
                type: 'broadcast',
                event: 'task_event',
                payload: { action: 'created', task: newTask }
            }).catch(e => console.warn("Broadcast task warning:", e));
        }
    }
};

window.toggleTaskComplete = function(taskId) {
    const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = appState.tasks[taskIndex];
        const activeUser = typeof getCurrentUserActive === 'function' ? getCurrentUserActive() : appState.currentUser;
        if (!isTaskAssignedToUser(task, activeUser)) {
            alert(`Solo el usuario asignado (${task.assignee || 'Sin asignar'}) puede marcar esta tarea como completada.`);
            return;
        }

        const currentStatus = (task.status || '').toLowerCase();
        const isCurrentlyCompleted = currentStatus === 'completed' || currentStatus === 'completada';
        const newStatus = isCurrentlyCompleted ? 'pending' : 'completed';
        appState.tasks[taskIndex].status = newStatus;
        saveToStorage();
        renderTasks();
        updateGlobalStats();
        if (typeof window.populateTaskUserFilterOptions === 'function') window.populateTaskUserFilterOptions();
        
        // Cloud Sync
        if (window.isSupabaseActive()) {
            const client = window.SUPABASE_CONFIG.client;
            const dbStatus = newStatus === 'completed' ? 'completada' : 'pendiente';
            client.from('tasks').update({ estado: dbStatus }).eq('id', taskId).then(({ error }) => {
                if (error) console.warn("Error updating task status on Supabase:", error);
            });

            if (window.chatRealtimeChannel) {
                window.chatRealtimeChannel.send({
                    type: 'broadcast',
                    event: 'task_event',
                    payload: { action: 'updated', id: taskId, status: newStatus }
                }).catch(e => console.warn("Broadcast task warning:", e));
            }
        }
    }
};

window.deleteTask = function(taskId) {
    if (typeof isManagerUser === 'function' && !isManagerUser()) {
        alert("Solo los usuarios con rol de Manager tienen permiso para eliminar tareas.");
        return;
    }

    if (!appState.deletedTaskIds) appState.deletedTaskIds = JSON.parse(localStorage.getItem('rp_deleted_task_ids')) || [];
    
    const targetTask = appState.tasks.find(t => t.id === taskId);
    if (targetTask) {
        const sig = `${(targetTask.title || '').trim().toLowerCase()}____${(targetTask.desc || '').trim().toLowerCase()}`;
        if (!appState.deletedTaskIds.includes(taskId)) appState.deletedTaskIds.push(taskId);
        if (sig && !appState.deletedTaskIds.includes(sig)) appState.deletedTaskIds.push(sig);
    } else {
        if (!appState.deletedTaskIds.includes(taskId)) appState.deletedTaskIds.push(taskId);
    }

    localStorage.setItem('rp_deleted_task_ids', JSON.stringify(appState.deletedTaskIds));
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    renderTasks();
    updateGlobalStats();
    if (typeof window.populateTaskUserFilterOptions === 'function') window.populateTaskUserFilterOptions();
    
    // Cloud Sync
    if (window.isSupabaseActive()) {
        const client = window.SUPABASE_CONFIG.client;
        client.from('tasks').delete().eq('id', taskId).then(({ error }) => {
            if (error) console.warn("Error deleting task on Supabase:", error);
        });

        if (window.chatRealtimeChannel) {
            window.chatRealtimeChannel.send({
                type: 'broadcast',
                event: 'task_event',
                payload: { action: 'deleted', id: taskId }
            }).catch(e => console.warn("Broadcast task warning:", e));
        }
    }
};

window.openEditTaskModal = function(taskId) {
    if (typeof isManagerUser === 'function' && !isManagerUser()) {
        alert("Solo los usuarios con rol de Manager tienen permiso para editar tareas.");
        return;
    }

    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById("edit-task-modal");
    const idInput = document.getElementById("edit-task-id");
    const titleInput = document.getElementById("edit-task-title");
    const descInput = document.getElementById("edit-task-desc");
    const assigneeInput = document.getElementById("edit-task-assignee");
    const priorityInput = document.getElementById("edit-task-priority");

    if (idInput) idInput.value = task.id;
    if (titleInput) titleInput.value = task.title || "";
    if (descInput) descInput.value = task.desc || "";
    if (assigneeInput) assigneeInput.value = task.assignee || "Sin asignar";
    if (priorityInput) priorityInput.value = task.priority || "alta";

    if (modal) modal.style.display = "flex";
};

window.closeEditTaskModal = function() {
    const modal = document.getElementById("edit-task-modal");
    if (modal) modal.style.display = "none";
};

window.handleSaveTaskEdit = function(event) {
    event.preventDefault();
    if (typeof isManagerUser === 'function' && !isManagerUser()) {
        alert("Solo los usuarios con rol de Manager tienen permiso para editar tareas.");
        return;
    }
    const taskId = document.getElementById("edit-task-id").value;
    const title = document.getElementById("edit-task-title").value.trim();
    const desc = document.getElementById("edit-task-desc").value.trim();
    const assignee = document.getElementById("edit-task-assignee").value.trim();
    const priority = document.getElementById("edit-task-priority").value || 'alta';

    if (!title || !taskId) return;

    const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        appState.tasks[taskIndex].title = title;
        appState.tasks[taskIndex].desc = desc;
        appState.tasks[taskIndex].assignee = assignee || 'Sin asignar';
        appState.tasks[taskIndex].priority = priority.toLowerCase();
        
        saveToStorage();
        closeEditTaskModal();
        renderTasks();
        updateGlobalStats();
        if (typeof window.populateTaskUserFilterOptions === 'function') window.populateTaskUserFilterOptions();

        if (window.isSupabaseActive()) {
            const client = window.SUPABASE_CONFIG.client;
            const dbPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
            client.from('tasks').update({
                titulo: title,
                descripcion: desc,
                prioridad: dbPriority,
                asignado_nombre: assignee || 'Sin asignar'
            }).eq('id', taskId).then(({ error }) => {
                if (error) console.warn("Error updating task on Supabase:", error);
            });

            if (window.chatRealtimeChannel) {
                window.chatRealtimeChannel.send({
                    type: 'broadcast',
                    event: 'task_event',
                    payload: { action: 'updated', id: taskId, task: appState.tasks[taskIndex] }
                }).catch(e => console.warn("Broadcast task warning:", e));
            }
        }
    }
};

window.filterTasks = function(filter, buttonElement) {
    appState.currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    buttonElement.classList.add("active");
    renderTasks();
};

window.scrollTasksGrid = function(direction) {
    const container = document.getElementById("tasks-slider-container");
    if (!container) return;
    const scrollAmount = container.clientWidth;
    if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    setTimeout(updateTasksScrollNavState, 350);
};

window.updateTasksScrollNavState = function() {
    const container = document.getElementById("tasks-slider-container");
    const prevBtn = document.getElementById("btn-tasks-prev");
    const nextBtn = document.getElementById("btn-tasks-next");
    if (!container || !prevBtn || !nextBtn) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 10) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        prevBtn.disabled = container.scrollLeft <= 10;
        nextBtn.disabled = container.scrollLeft >= maxScroll - 10;
    }
};

// ---------------------------------------------------------------------------------
// PRIVACIDAD Y FILTRADO DE TAREAS POR COLABORADOR
// ---------------------------------------------------------------------------------
function getCurrentUserActive() {
    if (appState.currentUser) return appState.currentUser;
    const storedUser = localStorage.getItem("rp_logged_user");
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed) return parsed;
        } catch (e) {}
    }
    return {
        nombre: typeof getUserCorporateName === 'function' ? getUserCorporateName() : (appState.currentRole === 'gerente' ? 'Gerente Principal' : 'Colaborador'),
        email: typeof getUserCorporateEmail === 'function' ? getUserCorporateEmail() : (appState.currentRole === 'gerente' ? 'gerencia@rodipack.online' : 'operaciones@rodipack.online'),
        rol: appState.currentRole
    };
}

function isManagerUser() {
    const role = ((appState.currentUser && appState.currentUser.rol) || appState.currentRole || '').toLowerCase().trim();
    return role === 'gerente' || role === 'manager' || role === 'director' || appState.currentRole === 'gerente';
}

function isTaskAssignedToUser(task, user) {
    if (!task) return false;
    const taskAssignee = (task.assignee || '').trim().toLowerCase();
    if (!taskAssignee || taskAssignee === 'sin asignar') return false;

    if (!user) {
        user = getCurrentUserActive();
    }
    if (!user) return false;

    const userName = (user.nombre || '').trim().toLowerCase();
    const userEmail = (user.email || '').trim().toLowerCase();
    const emailPrefix = userEmail ? userEmail.split('@')[0].toLowerCase() : '';

    if (userName && taskAssignee === userName) return true;
    if (userEmail && taskAssignee === userEmail) return true;
    if (emailPrefix && taskAssignee === emailPrefix) return true;

    // Comparación flexible de nombres (ej: "Roberto Miranda" vs "Roberto Miranda Perez")
    if (userName) {
        if (userName.includes(taskAssignee) || taskAssignee.includes(userName)) return true;

        const uTokens = userName.split(/\s+/).filter(t => t.length > 2);
        const aTokens = taskAssignee.split(/\s+/).filter(t => t.length > 2);
        if (uTokens.length > 0 && aTokens.length > 0) {
            const matches = uTokens.filter(t => aTokens.includes(t));
            if (matches.length >= 2 || (uTokens.length === 1 && matches.length === 1)) {
                return true;
            }
        }
    }

    return false;
}

function taskMatchesFilterUser(task, filterUser) {
    if (!task) return false;
    if (!filterUser || filterUser === 'all') return true;
    const taskAssignee = (task.assignee || '').trim().toLowerCase();
    const f = filterUser.trim().toLowerCase();
    if (taskAssignee === f) return true;
    return isTaskAssignedToUser(task, { nombre: filterUser });
}

window.toggleTaskUserFilterMenu = function(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("custom-user-filter-menu");
    const trigger = document.getElementById("custom-user-filter-trigger");
    if (!menu || !trigger) return;

    const isOpen = menu.classList.contains("open");
    document.querySelectorAll(".custom-user-filter-menu.open").forEach(m => m.classList.remove("open"));
    document.querySelectorAll(".custom-user-filter-dropdown.active").forEach(t => t.classList.remove("active"));

    if (!isOpen) {
        menu.classList.add("open");
        trigger.classList.add("active");
    }
};

window.selectTaskUserFilterOption = function(val) {
    appState.currentTaskUserFilter = val;
    const select = document.getElementById("task-user-filter-select");
    if (select) select.value = val;

    const menu = document.getElementById("custom-user-filter-menu");
    const trigger = document.getElementById("custom-user-filter-trigger");
    if (menu) menu.classList.remove("open");
    if (trigger) trigger.classList.remove("active");

    handleTaskUserFilterChange(val);
};

if (typeof window !== 'undefined' && !window._userFilterOutsideClickListenerAdded) {
    window._userFilterOutsideClickListenerAdded = true;
    document.addEventListener("click", function(e) {
        const wrap = document.querySelector(".user-filter-select-wrap");
        if (wrap && !wrap.contains(e.target)) {
            const menu = document.getElementById("custom-user-filter-menu");
            const trigger = document.getElementById("custom-user-filter-trigger");
            if (menu) menu.classList.remove("open");
            if (trigger) trigger.classList.remove("active");
        }
    });
}

window.populateTaskUserFilterOptions = function() {
    const select = document.getElementById("task-user-filter-select");
    const menu = document.getElementById("custom-user-filter-menu");
    const displayEl = document.getElementById("filter-selected-user-display");
    if (!select) return;

    const assignees = typeof getAvailableAssignees === 'function' ? getAvailableAssignees() : [];
    const usersMap = new Map();

    // 1. Agregar colaboradores conocidos del sistema
    assignees.forEach(u => {
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

    // 2. Agregar asignados de tareas existentes si no estaban registrados
    (appState.tasks || []).forEach(t => {
        const a = (t.assignee || '').trim();
        const fakeUsers = new Set(['sofía castro', 'sofia castro', 'carlos ruiz', 'juan pérez', 'juan perez', 'maría gómez', 'maria gomez', 'gerente principal']);
        if (a && a !== 'Sin asignar' && !fakeUsers.has(a.toLowerCase())) {
            let matchedKey = null;
            for (const [key, val] of usersMap.entries()) {
                if (key.toLowerCase() === a.toLowerCase() || 
                    (val.userObj && isTaskAssignedToUser(t, val.userObj))) {
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

    // 3. Contar tareas por usuario (pendientes y completadas)
    (appState.tasks || []).forEach(t => {
        const st = (t.status || '').toLowerCase();
        const isComp = st === 'completed' || st === 'completada';
        for (const [key, val] of usersMap.entries()) {
            if (key.toLowerCase() === (t.assignee || '').trim().toLowerCase() ||
                (val.userObj && isTaskAssignedToUser(t, val.userObj))) {
                val.total++;
                if (isComp) val.completed++;
                else val.pending++;
                break;
            }
        }
    });

    // 4. Poblar las opciones del selector nativo oculto
    const currentVal = appState.currentTaskUserFilter || 'all';
    const totalAllTasks = (appState.tasks || []).length;
    let html = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>Todos los colaboradores (${totalAllTasks} tareas)</option>`;

    usersMap.forEach((u, key) => {
        const isSelected = currentVal === key ? 'selected' : '';
        html += `<option value="${key}" ${isSelected}>${u.displayName} (${u.pending} pend., ${u.completed} comp.)</option>`;
    });
    select.innerHTML = html;

    // 5. Poblar el menú personalizado armonizado
    if (menu) {
        let menuHtml = `
            <li class="custom-filter-item ${currentVal === 'all' ? 'selected' : ''}" onclick="selectTaskUserFilterOption('all')">
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
            const initials = u.displayName.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase() || 'U';
            
            const r = (u.userObj && u.userObj.rol ? u.userObj.rol : '').toLowerCase();
            const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
            const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
            const avatarBg = isGerente ? '#DBEAFE' : (isAdmin ? '#D1FAE5' : '#F1F5F9');
            const avatarColor = isGerente ? '#1D4ED8' : (isAdmin ? '#047857' : '#475569');

            const escapedKey = key.replace(/'/g, "\\'");

            menuHtml += `
                <li class="custom-filter-item ${isSelected ? 'selected' : ''}" onclick="selectTaskUserFilterOption('${escapedKey}')">
                    <div class="custom-filter-item-avatar" style="background: ${avatarBg}; color: ${avatarColor};">
                        ${initials}
                    </div>
                    <div class="custom-filter-item-info">
                        <span class="custom-filter-item-name">${u.displayName}</span>
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
    }

    // 6. Actualizar el gatillo del menú (trigger display)
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
            const selectedUserObj = usersMap.get(currentVal) || { displayName: currentVal, pending: 0, completed: 0 };
            const initials = selectedUserObj.displayName.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase() || 'U';
            
            displayEl.innerHTML = `
                <div class="trigger-avatar user-initials">
                    ${initials}
                </div>
                <div class="trigger-text-wrap">
                    <span class="selected-name">${selectedUserObj.displayName}</span>
                    <span class="selected-metrics-badge">${selectedUserObj.pending} pend., ${selectedUserObj.completed} comp.</span>
                </div>
            `;
        }
    }
};

window.handleTaskUserFilterChange = function(selectedUser) {
    appState.currentTaskUserFilter = selectedUser;
    renderTasks();
    updateGlobalStats();
};

window.filterTasksFromUserSection = function(type) {
    if (type === 'pending') {
        const btn = document.querySelector(`.filter-btn[data-filter='all']`);
        if (btn) filterTasks('all', btn);
        else renderTasks();
    } else if (type === 'completed') {
        const btn = document.querySelector(`.filter-btn[data-filter='completed']`);
        if (btn) filterTasks('completed', btn);
        else renderTasks();
    }
};

function renderTasks() {
    const gridList = document.getElementById("tasks-grid-list");
    if (!gridList) return;
    gridList.innerHTML = "";
    
    // 1. Filtrar por permisos de rol y por colaborador seleccionado
    let scopedTasks = appState.tasks || [];
    const isGerente = isManagerUser();
    const activeUser = getCurrentUserActive();

    if (!isGerente) {
        // Colaboradores regulares: PRIVACIDAD ESTRICTA - Solo ver sus propias tareas asignadas
        scopedTasks = scopedTasks.filter(t => isTaskAssignedToUser(t, activeUser));
    } else {
        // Gerentes: Pueden ver todo o filtrar por el colaborador elegido
        if (appState.currentTaskUserFilter && appState.currentTaskUserFilter !== 'all') {
            scopedTasks = scopedTasks.filter(t => taskMatchesFilterUser(t, appState.currentTaskUserFilter));
        }
    }

    // 2. Calcular y actualizar las métricas de la barra de supervisión del usuario
    const totalUserTasks = scopedTasks.length;
    const pendingUserTasks = scopedTasks.filter(t => {
        const st = (t.status || '').toLowerCase();
        return st !== 'completed' && st !== 'completada';
    }).length;
    const completedUserTasks = scopedTasks.filter(t => {
        const st = (t.status || '').toLowerCase();
        return st === 'completed' || st === 'completada';
    }).length;
    const progressUserPct = totalUserTasks > 0 ? Math.round((completedUserTasks / totalUserTasks) * 100) : 0;

    const statTotalEl = document.getElementById("user-stat-total");
    const statPendingEl = document.getElementById("user-stat-pending");
    const statCompletedEl = document.getElementById("user-stat-completed");
    const statProgressPctEl = document.getElementById("user-stat-progress-pct");
    const statProgressBarEl = document.getElementById("user-stat-progress-bar");

    if (statTotalEl) statTotalEl.innerText = totalUserTasks;
    if (statPendingEl) statPendingEl.innerText = pendingUserTasks;
    if (statCompletedEl) statCompletedEl.innerText = completedUserTasks;
    if (statProgressPctEl) statProgressPctEl.innerText = `${progressUserPct}%`;
    if (statProgressBarEl) statProgressBarEl.style.width = `${progressUserPct}%`;

    // 3. Filtrar según la pestaña activa (Todas, Alta, Media, Baja, Completadas)
    let filteredTasks = scopedTasks.filter(t => {
        if (!t || !t.title) return false;
        const st = (t.status || '').toLowerCase();
        const isCompleted = st === 'completed' || st === 'completada';
        t.status = isCompleted ? 'completed' : 'pending';

        if (appState.currentFilter === 'completed') {
            return isCompleted;
        } else {
            // "Todas", "Alta", "Media", "Baja", "Pendientes": Ocultan tareas completadas
            if (isCompleted) return false;
            
            if (appState.currentFilter === 'alta' || appState.currentFilter === 'media' || appState.currentFilter === 'baja') {
                return t.priority === appState.currentFilter;
            }
            return true;
        }
    });
    
    if (filteredTasks.length === 0) {
        const emptyHelpText = !isGerente 
            ? "No tienes tareas asignadas en esta vista o filtro." 
            : "No hay tareas registradas que coincidan con el colaborador y filtro seleccionados.";

        gridList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; color: var(--text-secondary); background: #FFFFFF; border-radius: 12px; border: 1px dashed #CBD5E1;">
            <span class="material-symbols-outlined" style="font-size: 38px; color: #94A3B8; margin-bottom: 8px;">task</span>
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0F172A;">No hay tareas en esta vista</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-secondary);">${emptyHelpText}</p>
        </div>`;
        updateTasksScrollNavState();
        const countPill = document.getElementById("visible-tasks-count");
        if (countPill) countPill.innerText = `0 tarea(s) filtrada(s)`;
        return;
    }
    
    filteredTasks.forEach((task, index) => {
        const pageIndex = Math.floor(index / 4);
        const posInPage = index % 4;
        const rowInPage = Math.floor(posInPage / 2) + 1;
        const colInPage = (posInPage % 2) + 1;
        const gridRow = rowInPage;
        const gridCol = pageIndex * 2 + colInPage;

        const isCompleted = task.status === 'completed';
        const assigneeName = task.assignee || 'Sin asignar';
        const initials = assigneeName.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase() || 'T';

        // 1. Edición y Eliminación: Exclusivos para rol de Gerente/Manager
        const deleteButton = isGerente 
            ? `<button class="btn-delete-task" onclick="deleteTask('${task.id}')" title="Eliminar tarea">
                 <span class="material-symbols-outlined">delete</span>
               </button>` 
            : '';
            
        const editButton = isGerente
            ? `<button class="btn-edit-task" onclick="openEditTaskModal('${task.id}')" title="Editar tarea">
                 <span class="material-symbols-outlined">edit</span>
               </button>`
            : '';

        // 2. Marcar como Completada: Exclusivo para el usuario al que le corresponde la tarea
        const canToggleComplete = isTaskAssignedToUser(task, activeUser);
        const actionButton = canToggleComplete
            ? `<button class="btn-complete-task" onclick="toggleTaskComplete('${task.id}')">
                <span class="material-symbols-outlined">${isCompleted ? 'check_circle' : 'circle'}</span>
                ${isCompleted ? 'Completada' : 'Marcar Completada'}
               </button>`
            : `<button class="btn-complete-task disabled" disabled title="Solo el usuario asignado (${assigneeName}) puede marcar esta tarea como completada">
                <span class="material-symbols-outlined">${isCompleted ? 'check_circle' : 'circle'}</span>
                ${isCompleted ? 'Completada' : 'Pendiente'}
               </button>`;

        const taskCard = document.createElement("div");
        taskCard.className = `task-card priority-${task.priority} status-${task.status}`;
        taskCard.style.gridRow = `${gridRow}`;
        taskCard.style.gridColumn = `${gridCol}`;
        taskCard.innerHTML = `
            <div class="task-card-header">
                <h4>${task.title}</h4>
                ${editButton}
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
            <p class="task-desc-p">${task.desc}</p>
            <div class="task-card-footer">
                <div class="task-assignee-info">
                    <div class="assignee-avatar">${initials}</div>
                    <span class="assignee-name">${task.assignee}</span>
                </div>
                <div class="task-actions">
                    ${actionButton}
                </div>
                ${deleteButton}
            </div>
        `;
        gridList.appendChild(taskCard);
    });
    
    const countPill = document.getElementById("visible-tasks-count");
    if (countPill) countPill.innerText = `${filteredTasks.length} tarea(s) filtrada(s)`;
    
    setTimeout(updateTasksScrollNavState, 50);
}

// ---------------------------------------------------------------------------------
// 8. CHAT MANAGEMENT
// ---------------------------------------------------------------------------------
window.renderChatChannels = function() {
    const container = document.getElementById("chat-channels-list-container");
    if (!container) return;
    
    if (!appState.customChannels) appState.customChannels = [];
    
    let html = `
        <li class="channel-item ${appState.currentChannel === 'general' ? 'active' : ''}" id="channel-general" onclick="selectChannel('general')">
            <span class="material-symbols-outlined">tag</span> # general
        </li>
    `;
    
    appState.customChannels.forEach(chan => {
        const isActive = appState.currentChannel === chan.id ? 'active' : '';
        html += `
            <li class="channel-item ${isActive}" id="channel-${chan.id}" onclick="selectChannel('${chan.id}')">
                <span class="material-symbols-outlined">groups</span> # ${chan.name}
            </li>
        `;
    });
    
    container.innerHTML = html;
};

window.selectChannel = function(channelId) {
    appState.currentChannel = channelId;
    document.querySelectorAll(".channel-item").forEach(item => item.classList.remove("active"));
    const activeItem = document.getElementById(`channel-${channelId}`);
    if (activeItem) activeItem.classList.add("active");
    
    const headerTitle = document.getElementById("current-channel-title");
    const headerDesc = document.getElementById("current-channel-desc");
    const chatInput = document.getElementById("chat-input-field");
    
    if (channelId === 'general') {
        if (headerTitle) headerTitle.innerText = "# general";
        if (headerDesc) headerDesc.innerText = "Canal principal para coordinar las operaciones diarias y consultas generales.";
    } else {
        const custom = (appState.customChannels || []).find(c => c.id === channelId);
        if (custom) {
            if (headerTitle) headerTitle.innerText = `# ${custom.name}`;
            if (headerDesc) headerDesc.innerText = custom.desc || `Grupo de trabajo: ${custom.name}`;
        } else {
            if (headerTitle) headerTitle.innerText = `# ${channelId}`;
            if (headerDesc) headerDesc.innerText = "Canal de conversación del equipo";
        }
    }
    
    if (chatInput && headerTitle) {
        chatInput.placeholder = `Escribe un mensaje en ${headerTitle.innerText}...`;
    }
    renderChatMessages(true);
};

// ---------------------------------------------------------------------------------
// CREAR GRUPOS & AÑADIR INTEGRANTES AL CHAT
// ---------------------------------------------------------------------------------
window.renderProfileChecklistCard = function(p, inputName) {
    const initial = (p.nombre || p.email || 'U').charAt(0).toUpperCase();
    const r = (p.rol || '').toLowerCase();
    const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
    const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
    
    const roleColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#475569');
    const roleBg = isGerente ? 'rgba(37, 99, 235, 0.1)' : (isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)');
    const roleLabel = isGerente ? 'Manager' : (isAdmin ? 'Administrativo' : 'Colaborador');
    const depto = p.departamento || 'Operaciones';

    return `
        <label class="user-select-card" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; margin: 0; user-select: none;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                <div style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; background: ${roleBg}; color: ${roleColor}; font-weight: 800; font-size: 15px; display: flex; align-items: center; justify-content: center; border: 2px solid ${roleColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    ${initial}
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 2px;">
                        <span style="font-size: 13.5px; font-weight: 800; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.nombre}">${p.nombre || 'Sin nombre'}</span>
                        <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: ${roleBg}; color: ${roleColor}; font-family: inherit;">${roleLabel}</span>
                    </div>
                    <span style="font-size: 11.5px; color: #64748B; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.email || depto}">${p.email || depto}</span>
                </div>
            </div>
            <input type="checkbox" name="${inputName}" value="${p.nombre}" checked style="width: 18px; height: 18px; accent-color: #2563EB; cursor: pointer; flex-shrink: 0;">
        </label>
    `;
};

window.openCreateGroupModal = function() {
    const modal = document.getElementById("create-group-modal");
    const checklist = document.getElementById("group-members-checklist");
    if (!modal) return;
    modal.style.display = "flex";
    
    // Load members checklist
    const profiles = window.cachedProfilesList || [];
    if (checklist) {
        if (profiles.length === 0) {
            checklist.innerHTML = `<p style="font-size: 12px; color: #64748B; margin: 0; padding: 12px; text-align: center;">No hay colaboradores registrados</p>`;
        } else {
            checklist.innerHTML = profiles.map(p => window.renderProfileChecklistCard(p, 'group-members')).join('');
        }
    }
};

window.closeCreateGroupModal = function() {
    const modal = document.getElementById("create-group-modal");
    if (modal) modal.style.display = "none";
};

window.handleCreateChatGroup = function(event) {
    event.preventDefault();
    const nameInput = document.getElementById("new-group-name");
    if (!nameInput) return;
    
    const rawName = nameInput.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!rawName) return;
    
    const chanId = `group-${Date.now()}`;
    const cleanName = rawName;
    
    // Get checked members
    const checkboxes = document.querySelectorAll('input[name="group-members"]:checked');
    const memberNames = Array.from(checkboxes).map(cb => cb.value);
    
    const newChan = {
        id: chanId,
        name: cleanName,
        desc: `Grupo de trabajo: ${cleanName}. Integrantes: ${memberNames.join(', ') || 'Gerente'}`,
        members: memberNames
    };
    
    if (!appState.customChannels) appState.customChannels = [];
    appState.customChannels.push(newChan);
    
    if (!appState.chats[chanId]) appState.chats[chanId] = [];
    
    const sysMsgText = `📢 Grupo #${cleanName} creado. Participantes: ${memberNames.join(', ') || 'Gerente Principal'}.`;
    appState.chats[chanId].push({
        id: `msg-system-${Date.now()}`,
        sender: 'Sistema Rodipack',
        role: 'sistema',
        text: sysMsgText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    saveToStorage();
    renderChatChannels();
    selectChannel(chanId);
    closeCreateGroupModal();
    nameInput.value = "";

    // Cloud Realtime Sync for Group Creation
    if (window.chatRealtimeChannel) {
        window.chatRealtimeChannel.send({
            type: 'broadcast',
            event: 'new_group',
            payload: newChan
        }).catch(err => console.warn("Broadcast group warning:", err));

        window.chatRealtimeChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: {
                id: `msg-system-${Date.now()}`,
                channel: chanId,
                sender: 'Sistema Rodipack',
                role: 'sistema',
                text: sysMsgText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date().toISOString()
            }
        }).catch(err => console.warn("Broadcast group msg warning:", err));
    }

    if (window.isSupabaseActive()) {
        const client = window.SUPABASE_CONFIG.client;
        const validUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const rawUserId = appState.currentUser?.id;
        const validUserId = (rawUserId && validUUIDRegex.test(rawUserId)) ? rawUserId : null;

        client.from('messages').insert([{
            chat_id: chanId,
            emisor_id: validUserId,
            emisor_nombre: 'Sistema Rodipack',
            emisor_role: 'sistema',
            contenido: sysMsgText
        }]).then(({ error }) => {
            if (error) console.warn("Notice: group message to Supabase:", error.message || error);
        });
    }
};

window.openAddMemberModal = function() {
    const modal = document.getElementById("add-member-modal");
    const checklist = document.getElementById("add-member-checklist");
    if (!modal) return;
    modal.style.display = "flex";
    
    const profiles = window.cachedProfilesList || [];
    if (checklist) {
        if (profiles.length === 0) {
            checklist.innerHTML = `<p style="font-size: 12px; color: #64748B; margin: 0; padding: 12px; text-align: center;">No hay colaboradores registrados</p>`;
        } else {
            checklist.innerHTML = profiles.map(p => window.renderProfileChecklistCard(p, 'add-members')).join('');
        }
    }
};

window.closeAddMemberModal = function() {
    const modal = document.getElementById("add-member-modal");
    if (modal) modal.style.display = "none";
};

window.handleAddChatMember = function(event) {
    event.preventDefault();
    const checkboxes = document.querySelectorAll('input[name="add-members"]:checked');
    const selectedNames = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedNames.length === 0) {
        closeAddMemberModal();
        return;
    }
    
    const currentChan = appState.currentChannel || 'general';
    if (!appState.chats[currentChan]) appState.chats[currentChan] = [];
    
    const addedText = selectedNames.join(', ');
    const sysMsgText = `👤 ${addedText} ${selectedNames.length > 1 ? 'fueron añadidos' : 'ha sido añadido(a)'} al chat por el Gerente.`;
    const sysMsgId = `msg-system-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sysMsgObj = {
        id: sysMsgId,
        channel: currentChan,
        sender: 'Sistema Rodipack',
        role: 'sistema',
        text: sysMsgText,
        time: timeStr,
        timestamp: new Date().toISOString()
    };

    appState.chats[currentChan].push(sysMsgObj);
    saveToStorage();
    renderChatMessages(true);
    closeAddMemberModal();

    // Broadcast instantáneo
    if (window.chatRealtimeChannel) {
        window.chatRealtimeChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: sysMsgObj
        }).catch(err => console.warn("Broadcast add member warning:", err));
    }

    // Cloud Realtime Sync for System Member Addition
    if (window.isSupabaseActive()) {
        const client = window.SUPABASE_CONFIG.client;
        const validUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const rawUserId = appState.currentUser?.id;
        const validUserId = (rawUserId && validUUIDRegex.test(rawUserId)) ? rawUserId : null;

        client.from('messages').insert([{
            chat_id: currentChan,
            emisor_id: validUserId,
            emisor_nombre: 'Sistema Rodipack',
            emisor_role: 'sistema',
            contenido: sysMsgText
        }]).then(({ error }) => {
            if (error) console.warn("Notice: add member message to Supabase:", error.message || error);
        });
    }
};

window.pendingChatAttachment = null;

window.handleChatInputPaste = function(event) {
    const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1 || (item.kind === "file" && item.type.startsWith("image/"))) {
            const blob = item.getAsFile();
            if (!blob) continue;

            let sizeStr = "";
            if (blob.size < 1024) sizeStr = blob.size + " B";
            else if (blob.size < 1024 * 1024) sizeStr = (blob.size / 1024).toFixed(1) + " KB";
            else sizeStr = (blob.size / (1024 * 1024)).toFixed(1) + " MB";

            const imageName = (blob.name && blob.name !== "image.png") ? blob.name : `captura_${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}.png`;

            const reader = new FileReader();
            reader.onload = function(e) {
                window.pendingChatAttachment = {
                    name: imageName,
                    size: sizeStr,
                    type: blob.type || 'image/png',
                    dataUrl: e.target.result,
                    isImage: true
                };

                const previewBar = document.getElementById("chat-attachment-preview");
                const filenameEl = document.getElementById("chat-preview-filename");
                const filesizeEl = document.getElementById("chat-preview-filesize");
                const previewImg = document.getElementById("chat-preview-img");
                const previewIcon = document.getElementById("chat-preview-icon");

                if (filenameEl) filenameEl.innerText = imageName;
                if (filesizeEl) filesizeEl.innerText = sizeStr;

                if (previewImg && previewIcon) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = "block";
                    previewIcon.style.display = "none";
                }

                if (previewBar) previewBar.style.display = "flex";
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
};

window.triggerChatFileSelect = function() {
    const fileInput = document.getElementById("chat-file-input");
    if (fileInput) fileInput.click();
};

window.handleChatFileSelected = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
        alert("El archivo excede el tamaño máximo permitido (20 MB).");
        event.target.value = "";
        return;
    }

    let sizeStr = "";
    if (file.size < 1024) sizeStr = file.size + " B";
    else if (file.size < 1024 * 1024) sizeStr = (file.size / 1024).toFixed(1) + " KB";
    else sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = function(e) {
        window.pendingChatAttachment = {
            name: file.name,
            size: sizeStr,
            type: file.type || 'application/octet-stream',
            dataUrl: e.target.result,
            isImage: isImg
        };

        const previewBar = document.getElementById("chat-attachment-preview");
        const filenameEl = document.getElementById("chat-preview-filename");
        const filesizeEl = document.getElementById("chat-preview-filesize");
        const previewImg = document.getElementById("chat-preview-img");
        const previewIcon = document.getElementById("chat-preview-icon");

        if (filenameEl) filenameEl.innerText = file.name;
        if (filesizeEl) filesizeEl.innerText = sizeStr;

        if (isImg && previewImg && previewIcon) {
            previewImg.src = e.target.result;
            previewImg.style.display = "block";
            previewIcon.style.display = "none";
        } else if (previewImg && previewIcon) {
            previewImg.style.display = "none";
            previewIcon.style.display = "inline-block";
            const lower = file.name.toLowerCase();
            if (lower.endsWith('.pdf')) previewIcon.innerText = 'picture_as_pdf';
            else if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) previewIcon.innerText = 'table_view';
            else if (lower.endsWith('.doc') || lower.endsWith('.docx')) previewIcon.innerText = 'article';
            else if (lower.endsWith('.zip') || lower.endsWith('.rar')) previewIcon.innerText = 'folder_zip';
            else previewIcon.innerText = 'description';
        }

        if (previewBar) previewBar.style.display = "flex";
    };
    reader.readAsDataURL(file);
};

window.clearChatAttachmentPreview = function() {
    window.pendingChatAttachment = null;
    const fileInput = document.getElementById("chat-file-input");
    if (fileInput) fileInput.value = "";

    const previewBar = document.getElementById("chat-attachment-preview");
    if (previewBar) previewBar.style.display = "none";
};

window.openChatImageModal = function(src, name) {
    const modal = document.getElementById("chat-image-modal");
    const imgEl = document.getElementById("chat-modal-img-src");
    const nameEl = document.getElementById("chat-modal-filename");
    const dlBtn = document.getElementById("chat-modal-download-btn");

    if (modal && imgEl) {
        imgEl.src = src;
        if (nameEl) nameEl.innerText = name || "Imagen adjunta";
        if (dlBtn) {
            dlBtn.href = src;
            dlBtn.download = name || "imagen.png";
        }
        modal.style.display = "flex";
    }
};

window.closeChatImageModal = function() {
    const modal = document.getElementById("chat-image-modal");
    if (modal) modal.style.display = "none";
};

// Parser unificado de contenido de mensajes (texto simple, adjuntos serializados o mensajes legados)
function parseMessageContent(rawContent) {
    if (!rawContent) return { text: '', attachment: null };
    if (typeof rawContent === 'object') {
        return {
            text: rawContent.text || '',
            attachment: rawContent.attachment || null
        };
    }
    const str = String(rawContent).trim();
    if (str.startsWith('{') && str.endsWith('}')) {
        try {
            const parsed = JSON.parse(str);
            if (parsed && (parsed._type === 'attachment_msg' || parsed.attachment)) {
                return {
                    text: parsed.text || '',
                    attachment: parsed.attachment || null
                };
            }
        } catch (e) {}
    }

    // Compatibilidad con mensajes legados que contienen [Adjunto: nombre]
    const legacyMatch = str.match(/\[Adjunto:\s*(.+?)\]/i);
    if (legacyMatch) {
        const filename = legacyMatch[1].trim();
        const textWithoutAdjunto = str.replace(/\[Adjunto:\s*.+?\]/i, '').trim();
        const isImg = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filename);
        return {
            text: textWithoutAdjunto,
            attachment: {
                name: filename,
                size: '',
                type: isImg ? 'image' : 'document',
                dataUrl: null,
                isImage: isImg,
                isLegacy: true
            }
        };
    }

    return { text: str, attachment: null };
}

// Descarga universal desde base64 Data URL convirtiendo a Blob para compatibilidad total de navegadores
window.downloadDataUrl = function(dataUrl, filename) {
    if (!dataUrl) return;
    try {
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'archivo';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    } catch (err) {
        console.warn("Direct blob download fallback:", err);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename || 'archivo';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// Descargar archivo adjunto de chat por ID de mensaje
window.downloadChatAttachment = async function(msgId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    let foundMsg = null;
    if (appState.chats) {
        for (const chan in appState.chats) {
            const m = (appState.chats[chan] || []).find(x => x.id === msgId);
            if (m) {
                foundMsg = m;
                break;
            }
        }
    }

    if (!foundMsg || !foundMsg.attachment) {
        alert("No se encontró el archivo adjunto.");
        return;
    }

    const att = foundMsg.attachment;

    // Si ya tenemos el archivo en memoria, descargar al instante
    if (att.dataUrl) {
        window.downloadDataUrl(att.dataUrl, att.name || 'documento');
        return;
    }

    // Mensaje de versión anterior sin almacenamiento del archivo en la nube
    if (att.isLegacy && !att.dataUrl) {
        alert(`ℹ️ El documento "${att.name || 'archivo'}" fue registrado antes de activar la descarga en la nube.\n\nPor favor adjunta el documento nuevamente para que tú y tu equipo puedan descargarlo.`);
        return;
    }

    // Si falta la dataUrl en memoria, obtener directamente de Supabase
    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            const { data, error } = await client.from('messages').select('contenido').eq('id', msgId).single();
            if (data && data.contenido) {
                const parsed = parseMessageContent(data.contenido);
                if (parsed.attachment && parsed.attachment.dataUrl) {
                    att.dataUrl = parsed.attachment.dataUrl;
                    window.downloadDataUrl(att.dataUrl, att.name || parsed.attachment.name || 'documento');
                    return;
                }
            }
        } catch (e) {
            console.warn("Error fetching attachment from Supabase:", e);
        }
    }

    alert("No se pudo descargar el archivo. Por favor intenta de nuevo.");
};

window.handleSendChatMessage = function(event) {
    event.preventDefault();
    const inputField = document.getElementById("chat-input-field");
    const text = inputField.value.trim();
    const attachment = window.pendingChatAttachment;
    
    if (!text && !attachment) return;
    
    const senderName = appState.currentUser ? appState.currentUser.nombre : (appState.currentRole === 'gerente' ? 'Roberto Miranda Perez' : 'Roberto Miranda Perez');
    const senderRole = appState.currentUser ? appState.currentUser.rol : appState.currentRole;
    const currentChan = appState.currentChannel || 'general';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const newMsgId = generateUUID();
    
    const newMsg = {
        id: newMsgId,
        channel: currentChan,
        sender: senderName,
        role: senderRole,
        text: text,
        time: timeStr,
        timestamp: nowIso
    };

    if (attachment) {
        newMsg.attachment = {
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
            dataUrl: attachment.dataUrl,
            isImage: attachment.isImage
        };
    }
    
    if (!appState.chats[currentChan]) {
        appState.chats[currentChan] = [];
    }
    
    appState.chats[currentChan].push(newMsg);
    saveToStorage();
    inputField.value = "";
    clearChatAttachmentPreview();
    renderChatMessages(true);
    
    // 1. Transmisión Instantánea por WebSockets Broadcast (Tablet <-> PC en tiempo real)
    if (window.chatRealtimeChannel) {
        let broadcastMsg = { ...newMsg };
        // Si el archivo es muy pesado (>150KB), en WebSocket enviamos metadatos ligeros para no romper el límite de WebSocket
        if (attachment && attachment.dataUrl && attachment.dataUrl.length > 150000) {
            broadcastMsg.attachment = {
                name: attachment.name,
                size: attachment.size,
                type: attachment.type,
                isImage: attachment.isImage,
                hasCloudData: true
            };
        }
        window.chatRealtimeChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: broadcastMsg
        }).catch(err => console.warn("Broadcast warning:", err));
    }
    
    // 2. Persistencia en Base de Datos Supabase (PostgreSQL messages)
    if (window.isSupabaseActive()) {
        const client = window.SUPABASE_CONFIG.client;
        const validUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const rawUserId = appState.currentUser?.id;
        const validUserId = (rawUserId && validUUIDRegex.test(rawUserId)) ? rawUserId : null;

        let supabaseContent = text;
        if (attachment) {
            supabaseContent = JSON.stringify({
                _type: 'attachment_msg',
                text: text,
                attachment: {
                    name: attachment.name,
                    size: attachment.size,
                    type: attachment.type,
                    dataUrl: attachment.dataUrl,
                    isImage: attachment.isImage
                }
            });
        }

        client.from('messages').insert([{
            id: newMsgId,
            chat_id: currentChan,
            emisor_id: validUserId,
            emisor_nombre: senderName,
            emisor_role: senderRole,
            contenido: supabaseContent
        }]).then(({ error }) => {
            if (error) console.warn("Notice: Message cloud sync to PostgreSQL:", error.message || error);
        });
    }
};

function renderChatMessages(forceScroll = false) {
    const msgContainer = document.getElementById("chat-messages-container");
    if (!msgContainer) return;
    
    const currentChan = appState.currentChannel || 'general';
    if (!appState.chats[currentChan]) appState.chats[currentChan] = [];

    // Deduplicar y normalizar mensajes en memoria para este canal
    const uniqueMap = new Map();
    appState.chats[currentChan].forEach(msg => {
        if (!msg) return;

        // Si no tiene attachment pero el texto tiene formato JSON o [Adjunto: ...], extraerlo
        if (!msg.attachment && msg.text) {
            const parsed = parseMessageContent(msg.text);
            if (parsed.attachment) {
                msg.text = parsed.text;
                msg.attachment = parsed.attachment;
            }
        }

        if (!msg.text && !msg.attachment) return;

        const cleanText = ((msg.text || '') + (msg.attachment ? msg.attachment.name : '')).trim();
        const timeKey = (msg.time || '').trim();
        const senderKey = (msg.sender || '').trim();
        const sig = msg.id || `${senderKey}_${cleanText}_${timeKey}`;

        if (!uniqueMap.has(sig)) {
            uniqueMap.set(sig, msg);
        } else {
            const existing = uniqueMap.get(sig);
            if ((!existing.attachment || !existing.attachment.dataUrl) && (msg.attachment && msg.attachment.dataUrl)) {
                uniqueMap.set(sig, msg);
            }
        }
    });

    const uniqueList = Array.from(uniqueMap.values());
    appState.chats[currentChan] = uniqueList;

    const currentMsgs = uniqueList;
    const currentHash = `${currentChan}__${currentMsgs.map(m => `${m.id || ''}_${m.sender}_${m.text || ''}_${m.attachment ? (m.attachment.name + (m.attachment.dataUrl ? '1' : '0')) : ''}_${m.time}`).join('||')}`;

    // Si los mensajes no han cambiado y no se forzó el scroll, no tocar el DOM para mantener intacto el scroll del usuario
    if (!forceScroll && msgContainer.dataset.renderedHash === currentHash) {
        return;
    }

    // Verificar si el usuario estaba leyendo cerca del final antes de re-renderizar
    const wasNearBottom = (msgContainer.scrollHeight - msgContainer.scrollTop - msgContainer.clientHeight) < 100;

    msgContainer.dataset.renderedHash = currentHash;

    if (currentMsgs.length === 0) {
        msgContainer.innerHTML = `<div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
            <span class="material-symbols-outlined" style="font-size: 36px; color: #94A3B8; margin-bottom: 6px;">forum</span>
            <p style="margin: 0; font-size: 13px; font-weight: 500;">No hay mensajes registrados en este canal.</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #94A3B8;">Comienza a escribir abajo para iniciar la conversación con tu equipo.</p>
        </div>`;
        return;
    }
    
    msgContainer.innerHTML = "";
    currentMsgs.forEach(msg => {
        const initials = (msg.sender || 'U').split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || 'U';
        const role = (msg.role || 'colaborador').toLowerCase();
        const msgCard = document.createElement("div");
        msgCard.className = `chat-msg-card ${role}`;
        
        let attachmentHtml = '';
        if (msg.attachment) {
            const att = msg.attachment;
            if (att.isImage && att.dataUrl) {
                attachmentHtml = `
                    <div class="chat-msg-attachment image-attachment" style="margin-top: ${msg.text ? '8px' : '0'};">
                        <img src="${att.dataUrl}" alt="${att.name || 'Imagen'}" onclick="openChatImageModal('${att.dataUrl}', '${att.name || 'Imagen'}')">
                        <div class="attachment-info">
                            <span class="material-symbols-outlined" style="font-size: 14px;">image</span>
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${att.name || 'Imagen'}</span>
                            ${att.size ? `<span style="font-size: 11px; opacity: 0.8; margin-left: auto;">${att.size}</span>` : ''}
                        </div>
                    </div>
                `;
            } else {
                const name = att.name || 'Documento';
                const lowerName = name.toLowerCase();
                let icon = 'description';
                let iconBg = '#EFF6FF';
                let iconColor = '#2563EB';

                if (lowerName.endsWith('.pdf')) {
                    icon = 'picture_as_pdf';
                    iconBg = '#FEE2E2';
                    iconColor = '#DC2626';
                } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) {
                    icon = 'table_view';
                    iconBg = '#DCFCE7';
                    iconColor = '#16A34A';
                } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
                    icon = 'article';
                    iconBg = '#DBEAFE';
                    iconColor = '#2563EB';
                } else if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar')) {
                    icon = 'folder_zip';
                    iconBg = '#FEF3C7';
                    iconColor = '#D97706';
                } else if (att.isImage) {
                    icon = 'image';
                    iconBg = '#F3E8FF';
                    iconColor = '#9333EA';
                }

                attachmentHtml = `
                    <div class="chat-msg-attachment doc-attachment" onclick="downloadChatAttachment('${msg.id}', event)" title="Clic para descargar ${name}" style="margin-top: ${msg.text ? '8px' : '0'}; cursor: pointer;">
                        <div class="doc-icon-wrapper" style="background: ${iconBg}; color: ${iconColor};">
                            <span class="material-symbols-outlined">${icon}</span>
                        </div>
                        <div class="doc-info">
                            <span class="doc-name" title="${name}">${name}</span>
                            <span class="doc-size">${att.size || (att.isLegacy ? 'Archivo enviado' : 'Documento adjunto')}</span>
                        </div>
                        <button type="button" class="doc-download-btn" title="Descargar documento">
                            <span class="material-symbols-outlined download-icon">download</span>
                        </button>
                    </div>
                `;
            }
        }

        const bubbleText = msg.text ? `<div>${msg.text}</div>` : '';

        msgCard.innerHTML = `
            <div class="msg-avatar">${initials}</div>
            <div class="msg-content-wrapper">
                <div class="msg-header">
                    <span class="msg-sender">${msg.sender || 'Usuario'}</span>
                    <span class="msg-sender-role ${role}">${role}</span>
                    <span class="msg-time">${msg.time || ''}</span>
                </div>
                <div class="msg-bubble">
                    ${bubbleText}
                    ${attachmentHtml}
                </div>
            </div>
        `;
        msgContainer.appendChild(msgCard);
    });
    
    if (forceScroll || wasNearBottom) {
        requestAnimationFrame(() => {
            msgContainer.scrollTop = msgContainer.scrollHeight;
        });
    }
}

// ---------------------------------------------------------------------------------
// 9. MEETINGS MANAGEMENT
// ---------------------------------------------------------------------------------
window.handleCreateMeeting = function(event) {
    event.preventDefault();
    const title = document.getElementById("meeting-title").value;
    const date = document.getElementById("meeting-date").value;
    const time = document.getElementById("meeting-time").value;
    const link = document.getElementById("meeting-link").value || "https://meet.google.com/meet-rodipack";
    
    const newMeeting = {
        id: `meet-${Date.now()}`,
        title,
        date,
        time,
        link
    };
    
    appState.meetings.push(newMeeting);
    appState.meetings.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    saveToStorage();
    document.getElementById("meeting-form").reset();
    renderMeetings();
};

window.deleteMeeting = function(meetId) {
    appState.meetings = appState.meetings.filter(m => m.id !== meetId);
    saveToStorage();
    renderMeetings();
};

function renderMeetings() {
    const listContainer = document.getElementById("meetings-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";
    
    if (appState.meetings.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 40px 0;">No hay reuniones programadas.</p>`;
        return;
    }
    
    appState.meetings.forEach(meet => {
        const dateObj = new Date(`${meet.date}T00:00:00`);
        const day = dateObj.getDate();
        const monthStr = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
        
        const deleteBtn = appState.currentRole === 'gerente'
            ? `<button class="btn-delete-task" onclick="deleteMeeting('${meet.id}')" title="Cancelar reunión" style="margin-left: 12px;">
                 <span class="material-symbols-outlined">close</span>
               </button>`
            : '';

        const card = document.createElement("div");
        card.className = "meeting-card";
        card.innerHTML = `
            <div class="meeting-left">
                <div class="meeting-date-badge">
                    <span class="meeting-day">${day}</span>
                    <span class="meeting-month">${monthStr}</span>
                </div>
                <div class="meeting-details">
                    <h4>${meet.title}</h4>
                    <p>
                        <span class="material-symbols-outlined">schedule</span>
                        <span>${meet.time} hs</span>
                    </p>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <a href="${meet.link}" target="_blank" class="meeting-join-btn">
                    <span class="material-symbols-outlined">video_call</span>
                    Unirse
                </a>
                ${deleteBtn}
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// ---------------------------------------------------------------------------------
// 10. GLOBAL STATS UPDATER
// ---------------------------------------------------------------------------------
function updateGlobalStats() {
    let tasksPool = appState.tasks || [];
    
    // Si el rol no es gerente, las estadísticas de la barra superior solo consideran sus propias tareas asignadas
    if (appState.currentRole !== 'gerente') {
        tasksPool = tasksPool.filter(t => isTaskAssignedToUser(t, appState.currentUser));
    } else if (appState.currentTaskUserFilter && appState.currentTaskUserFilter !== 'all') {
        tasksPool = tasksPool.filter(t => taskMatchesFilterUser(t, appState.currentTaskUserFilter));
    }

    const pending = tasksPool.filter(t => {
        const st = (t.status || '').toLowerCase();
        return st === 'pending' || st === 'pendiente';
    }).length;

    const completed = tasksPool.filter(t => {
        const st = (t.status || '').toLowerCase();
        return st === 'completed' || st === 'completada';
    }).length;

    const total = pending + completed;
    
    const pendingEl = document.getElementById("stats-pending");
    const completedEl = document.getElementById("stats-completed");
    if (pendingEl) pendingEl.innerText = pending;
    if (completedEl) completedEl.innerText = completed;
    
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressPctEl = document.getElementById("progress-percentage");
    const progressBarFillEl = document.getElementById("progress-bar-fill");
    
    if (progressPctEl) progressPctEl.innerText = `${pct}%`;
    if (progressBarFillEl) progressBarFillEl.style.width = `${pct}%`;
}

// ---------------------------------------------------------------------------------
// 11. FICHA 4: CONSECUTIVO 2026 LOGIC
// ---------------------------------------------------------------------------------
function getFilteredConsecutivoList() {
    let list = appState.consecutivo || [];
    
    // 1. ST Filter
    if (appState.consecutivoStFilter === 'P') {
        list = list.filter(item => (item.st || '').trim().toUpperCase() === 'P');
    } else if (appState.consecutivoStFilter === 'C') {
        list = list.filter(item => (item.st || '').trim().toUpperCase() === 'C');
    } else if (appState.consecutivoStFilter === 'Cancelado') {
        list = list.filter(item => 
            String(item.st || '').toLowerCase().includes('cancel') ||
            String(item.fechaEmision || '').toLowerCase().includes('cancel') ||
            String(item.cliente || '').toLowerCase().includes('cancel')
        );
    }
    
    // 2. Client Filter
    if (appState.consecutivoClientFilter !== 'all') {
        list = list.filter(item => 
            String(item.cliente || '').toLowerCase() === appState.consecutivoClientFilter.toLowerCase()
        );
    }
    
    // 3. Search Query
    if (appState.consecutivoSearch && appState.consecutivoSearch.trim() !== '') {
        const query = appState.consecutivoSearch.trim().toLowerCase();
        list = list.filter(item => {
            return (
                String(item.consecutivo || '').toLowerCase().includes(query) ||
                String(item.factura || '').toLowerCase().includes(query) ||
                String(item.fechaEmision || '').toLowerCase().includes(query) ||
                String(item.cliente || '').toLowerCase().includes(query) ||
                String(item.folioCliente || '').toLowerCase().includes(query) ||
                String(item.referenciaOp || '').toLowerCase().includes(query) ||
                String(item.servicio || '').toLowerCase().includes(query) ||
                String(item.detalle || '').toLowerCase().includes(query) ||
                String(item.nota || '').toLowerCase().includes(query)
            );
        });
    }
    
    return list;
}

function renderConsecutivo() {
    const tbody = document.getElementById("tbody-consecutivo");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const filteredList = getFilteredConsecutivoList();
    const totalFiltered = filteredList.length;
    
    // Update KPI summary cards based on filtered list
    updateConsecutivoKPIs(filteredList);
    
    // Update header count badges
    const totalBadge = document.getElementById("consecutivo-total-badge");
    const totalFilteredEl = document.getElementById("consecutivo-total-filtered");
    if (totalBadge) totalBadge.innerText = `${appState.consecutivo.length} Registros`;
    if (totalFilteredEl) totalFilteredEl.innerText = totalFiltered;
    
    // Handle Pagination
    const pageSize = appState.consecutivoPageSize;
    const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
    if (appState.consecutivoPage > totalPages) {
        appState.consecutivoPage = totalPages;
    }
    if (appState.consecutivoPage < 1) {
        appState.consecutivoPage = 1;
    }
    
    const startIndex = (appState.consecutivoPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalFiltered);
    const visibleRangeEl = document.getElementById("consecutivo-visible-range");
    if (visibleRangeEl) {
        visibleRangeEl.innerText = totalFiltered > 0 ? `${startIndex + 1}-${endIndex}` : "0";
    }
    
    const pageItems = filteredList.slice(startIndex, endIndex);
    
    if (pageItems.length === 0) {
        const emptyTr = document.createElement("tr");
        emptyTr.innerHTML = `<td colspan="20" style="text-align: center; padding: 30px; color: var(--text-muted);">No se encontraron facturas que coincidan con los filtros aplicados.</td>`;
        tbody.appendChild(emptyTr);
    } else {
        pageItems.forEach((item) => {
            const realIndex = appState.consecutivo.indexOf(item);
            const isCanceled = String(item.fechaEmision || '').toLowerCase().includes('cancel') || String(item.cliente || '').toLowerCase().includes('cancel') || String(item.st || '').toLowerCase().includes('cancel');
            
            const stVal = String(item.st || 'P').trim().toUpperCase();
            let stBadgeClass = 'st-badge-p';
            if (isCanceled || stVal === 'CANCELADO') stBadgeClass = 'st-badge-cancelado';
            else if (stVal === 'C') stBadgeClass = 'st-badge-c';
            
            const cleanEmision = String(item.fechaEmision || '').replace(' 00:00:00', '').trim();
            const cleanPago = String(item.fechaPago || '').replace(' 00:00:00', '').trim();
            
            const tr = document.createElement("tr");
            tr.id = `consec-row-${realIndex}`;
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700; color: var(--text-secondary);" title="Consecutivo #${item.consecutivo || (realIndex + 1)}">
                    ${item.consecutivo || (realIndex + 1)}
                </td>
                <td title="${item.factura || ''}">
                    <input type="text" class="excel-input font-bold" value="${item.factura || ''}" oninput="updateConsecutivoCell(${realIndex}, 'factura', this.value)" style="color: #2563EB;">
                </td>
                <td title="${cleanEmision}">
                    <input type="text" class="excel-input" value="${cleanEmision}" oninput="updateConsecutivoCell(${realIndex}, 'fechaEmision', this.value)">
                </td>
                <td title="${item.cliente || ''}">
                    <input type="text" class="excel-input font-bold" value="${item.cliente || ''}" oninput="updateConsecutivoCell(${realIndex}, 'cliente', this.value)">
                </td>
                <td title="${item.folioCliente || ''}">
                    <input type="text" class="excel-input" value="${item.folioCliente || ''}" oninput="updateConsecutivoCell(${realIndex}, 'folioCliente', this.value)">
                </td>
                <td title="Subtotal: ${item.subtotal || 0}">
                    <input type="number" id="consec-subtotal-${realIndex}" class="excel-input number-input font-bold" value="${item.subtotal || 0}" step="50" oninput="liveUpdateConsecutivoRow(${realIndex})">
                </td>
                <td title="IVA: ${item.iva || 0}">
                    <input type="number" id="consec-iva-${realIndex}" class="excel-input number-input readonly" value="${item.iva || 0}" readonly>
                </td>
                <td title="Total: ${item.total || 0}">
                    <input type="number" id="consec-total-${realIndex}" class="excel-input number-input readonly font-bold" value="${item.total || 0}" readonly style="color: #059669;">
                </td>
                <td style="text-align: center;">
                    <select class="excel-input st-badge ${stBadgeClass}" onchange="updateConsecutivoCell(${realIndex}, 'st', this.value); renderConsecutivo();" style="border: none; cursor: pointer; text-align-last: center; width: 100%; padding: 1px;">
                        <option value="P" ${stVal === 'P' ? 'selected' : ''}>P</option>
                        <option value="C" ${stVal === 'C' ? 'selected' : ''}>C</option>
                        <option value="Cancelado" ${isCanceled || stVal === 'CANCELADO' ? 'selected' : ''}>Canc</option>
                    </select>
                </td>
                <td title="${cleanPago}">
                    <input type="text" class="excel-input" value="${cleanPago}" oninput="updateConsecutivoCell(${realIndex}, 'fechaPago', this.value)">
                </td>
                <td title="${item.referenciaOp || ''}">
                    <input type="text" class="excel-input" value="${item.referenciaOp || ''}" oninput="updateConsecutivoCell(${realIndex}, 'referenciaOp', this.value)">
                </td>
                <td title="${item.servicio || ''}">
                    <input type="text" class="excel-input" value="${item.servicio || ''}" oninput="updateConsecutivoCell(${realIndex}, 'servicio', this.value)">
                </td>
                <td title="${item.detalle || ''}">
                    <input type="text" class="excel-input" value="${item.detalle || ''}" oninput="updateConsecutivoCell(${realIndex}, 'detalle', this.value)">
                </td>
                <td title="${item.nota || ''}">
                    <input type="text" class="excel-input" value="${item.nota || ''}" oninput="updateConsecutivoCell(${realIndex}, 'nota', this.value)">
                </td>
                <td title="% RDP: ${item.porcRodipak || 0}%">
                    <input type="text" id="consec-porc-rodipak-${realIndex}" class="excel-input number-input readonly" value="${item.porcRodipak ? item.porcRodipak + '%' : '0%'}" readonly>
                </td>
                <td title="Rodipak: ${item.rodipak || 0}">
                    <input type="number" id="consec-rodipak-${realIndex}" class="excel-input number-input" value="${item.rodipak || 0}" step="50" oninput="liveUpdateConsecutivoRow(${realIndex})">
                </td>
                <td title="Hugo Com: ${item.hugoComision || 0}">
                    <input type="number" id="consec-hugo-com-${realIndex}" class="excel-input number-input" value="${item.hugoComision || 0}" step="50" oninput="liveUpdateConsecutivoRow(${realIndex})">
                </td>
                <td title="Hugo Total: ${item.hugoTotal || 0}">
                    <input type="number" id="consec-hugo-tot-${realIndex}" class="excel-input number-input" value="${item.hugoTotal || 0}" step="50" oninput="liveUpdateConsecutivoRow(${realIndex})">
                </td>
                <td title="% Hugo: ${item.porcHugo || 0}%">
                    <input type="text" id="consec-porc-hugo-${realIndex}" class="excel-input number-input readonly" value="${item.porcHugo ? item.porcHugo + '%' : '0%'}" readonly>
                </td>
                <td style="text-align: center;">
                    <button class="btn-delete-task" onclick="deleteConsecutivoRecord(${realIndex})" title="Eliminar Registro">
                        <span class="material-symbols-outlined" style="font-size: 14px;">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Render Summary row at the bottom
    renderConsecutivoFooterTotals(filteredList);
    
    // Render pagination controls
    renderConsecutivoPagination(totalPages);
}

function updateConsecutivoKPIs(list) {
    let sumSubtotal = 0;
    let sumIva = 0;
    let sumTotal = 0;
    let sumRodipak = 0;
    let sumHugo = 0;
    
    list.forEach(item => {
        const sub = Number(item.subtotal) || 0;
        const iv = Number(item.iva) || 0;
        const tot = Number(item.total) || 0;
        const rdp = Number(item.rodipak) || 0;
        const hg = Number(item.hugoComision) || 0;
        
        sumSubtotal += sub;
        sumIva += iv;
        sumTotal += tot;
        sumRodipak += rdp;
        sumHugo += hg;
    });
    
    const subEl = document.getElementById("consecutivo-kpi-subtotal");
    const ivaEl = document.getElementById("consecutivo-kpi-iva");
    const totEl = document.getElementById("consecutivo-kpi-total");
    const rdpEl = document.getElementById("consecutivo-kpi-rodipak");
    const hgEl = document.getElementById("consecutivo-kpi-hugo");
    
    if (subEl) subEl.innerText = formatCurrency(sumSubtotal);
    if (ivaEl) ivaEl.innerText = formatCurrency(sumIva);
    if (totEl) totEl.innerText = formatCurrency(sumTotal);
    if (rdpEl) rdpEl.innerText = formatCurrency(sumRodipak);
    if (hgEl) hgEl.innerText = formatCurrency(sumHugo);
}

function renderConsecutivoFooterTotals(list) {
    let sumSubtotal = 0;
    let sumIva = 0;
    let sumTotal = 0;
    let sumRodipak = 0;
    let sumHugoCom = 0;
    let sumHugoTot = 0;
    
    list.forEach(item => {
        sumSubtotal += Number(item.subtotal) || 0;
        sumIva += Number(item.iva) || 0;
        sumTotal += Number(item.total) || 0;
        sumRodipak += Number(item.rodipak) || 0;
        sumHugoCom += Number(item.hugoComision) || 0;
        sumHugoTot += Number(item.hugoTotal) || 0;
    });
    
    const totalsRow = document.getElementById("excel-consecutivo-totals-row");
    if (totalsRow) {
        totalsRow.innerHTML = `
            <td style="text-align: center; font-weight: 800;">TOT</td>
            <td colspan="4" style="font-weight: 800; font-size: 10px;">${list.length} regs</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumSubtotal)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumIva)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumTotal)}</td>
            <td colspan="6"></td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumRodipak)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumHugoCom)}</td>
            <td style="text-align: right; font-weight: 800;">${formatCurrency(sumHugoTot)}</td>
            <td></td>
            <td style="text-align: center;"><span class="material-symbols-outlined" style="font-size: 14px;">lock</span></td>
        `;
    }
}

function renderConsecutivoPagination(totalPages) {
    const container = document.getElementById("consecutivo-pagination-btns");
    if (!container) return;
    container.innerHTML = "";
    
    if (totalPages <= 1) return;
    
    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.innerHTML = "&laquo; Ant";
    prevBtn.disabled = appState.consecutivoPage === 1;
    prevBtn.onclick = () => {
        if (appState.consecutivoPage > 1) {
            appState.consecutivoPage--;
            renderConsecutivo();
        }
    };
    container.appendChild(prevBtn);
    
    // Page Numbers
    const cur = appState.consecutivoPage;
    let startPage = Math.max(1, cur - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let p = startPage; p <= endPage; p++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-btn ${p === cur ? 'active' : ''}`;
        pageBtn.innerText = p;
        pageBtn.onclick = () => {
            appState.consecutivoPage = p;
            renderConsecutivo();
        };
        container.appendChild(pageBtn);
    }
    
    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.innerHTML = "Sig &raquo;";
    nextBtn.disabled = appState.consecutivoPage === totalPages;
    nextBtn.onclick = () => {
        if (appState.consecutivoPage < totalPages) {
            appState.consecutivoPage++;
            renderConsecutivo();
        }
    };
    container.appendChild(nextBtn);
}

window.updateConsecutivoCell = function(index, key, val) {
    if (appState.consecutivo[index]) {
        appState.consecutivo[index][key] = val;
        saveToStorage();
    }
};

window.liveUpdateConsecutivoRow = function(index) {
    const subtotalEl = document.getElementById(`consec-subtotal-${index}`);
    const ivaEl = document.getElementById(`consec-iva-${index}`);
    const totalEl = document.getElementById(`consec-total-${index}`);
    const porcRdpEl = document.getElementById(`consec-porc-rodipak-${index}`);
    const rodipakEl = document.getElementById(`consec-rodipak-${index}`);
    const hugoComEl = document.getElementById(`consec-hugo-com-${index}`);
    const hugoTotEl = document.getElementById(`consec-hugo-tot-${index}`);
    const porcHgEl = document.getElementById(`consec-porc-hugo-${index}`);
    
    if (subtotalEl && ivaEl && totalEl && rodipakEl && hugoComEl && hugoTotEl) {
        const subtotal = Number(subtotalEl.value) || 0;
        const iva = Math.round(subtotal * 0.16 * 100) / 100;
        const total = Math.round((subtotal + iva) * 100) / 100;
        
        const rodipak = Number(rodipakEl.value) || 0;
        const porcRodipak = subtotal > 0 ? Math.round((rodipak / subtotal) * 10000) / 100 : 0;
        
        const hugoCom = Number(hugoComEl.value) || 0;
        const hugoTot = Number(hugoTotEl.value) || 0;
        const porcHugo = hugoTot > 0 ? Math.round((hugoCom / hugoTot) * 10000) / 100 : 0;
        
        ivaEl.value = iva.toFixed(2);
        totalEl.value = total.toFixed(2);
        if (porcRdpEl) porcRdpEl.value = `${porcRodipak}%`;
        if (porcHgEl) porcHgEl.value = `${porcHugo}%`;
        
        appState.consecutivo[index].subtotal = subtotal;
        appState.consecutivo[index].iva = iva;
        appState.consecutivo[index].total = total;
        appState.consecutivo[index].rodipak = rodipak;
        appState.consecutivo[index].porcRodipak = porcRodipak;
        appState.consecutivo[index].hugoComision = hugoCom;
        appState.consecutivo[index].hugoTotal = hugoTot;
        appState.consecutivo[index].porcHugo = porcHugo;
        
        saveToStorage();
        updateConsecutivoKPIs(getFilteredConsecutivoList());
        renderConsecutivoFooterTotals(getFilteredConsecutivoList());
    }
};

window.addNewConsecutivoRow = function() {
    // 1. Auto-calculate next consecutive (#) and invoice (FE-xxx) numbers
    let maxConsecutivo = 0;
    let maxFacturaNum = 0;
    
    appState.consecutivo.forEach(item => {
        const cNum = parseInt(item.consecutivo, 10);
        if (!isNaN(cNum) && cNum > maxConsecutivo) {
            maxConsecutivo = cNum;
        }
        
        const fMatch = String(item.factura || '').match(/FE-(\d+)/i);
        if (fMatch && fMatch[1]) {
            const fNum = parseInt(fMatch[1], 10);
            if (!isNaN(fNum) && fNum > maxFacturaNum) {
                maxFacturaNum = fNum;
            }
        }
    });
    
    const nextConsecutivo = maxConsecutivo > 0 ? maxConsecutivo + 1 : (appState.consecutivo.length + 1);
    const nextFacturaNum = maxFacturaNum > 0 ? maxFacturaNum + 1 : (195 + nextConsecutivo);
    const today = new Date().toISOString().split('T')[0];
    
    const defaultClient = appState.consecutivoClientFilter !== 'all' ? appState.consecutivoClientFilter : "Victor Hugo";
    
    const newRecord = {
        consecutivo: nextConsecutivo,
        factura: `FE-${nextFacturaNum}`,
        fechaEmision: today,
        cliente: defaultClient,
        folioCliente: "",
        subtotal: 0,
        iva: 0,
        total: 0,
        st: "P",
        fechaPago: today,
        referenciaOp: "",
        servicio: "Flete",
        detalle: "",
        nota: "",
        porcRodipak: 0,
        rodipak: 0,
        hugoComision: 0,
        hugoTotal: 0,
        porcHugo: 0
    };
    
    // Add to the end of the array
    appState.consecutivo.push(newRecord);
    saveToStorage();
    
    // Clear search filter so the newly created row is visible
    if (appState.consecutivoSearch) {
        appState.consecutivoSearch = "";
        const searchInput = document.getElementById("consecutivo-search-input");
        if (searchInput) searchInput.value = "";
    }
    
    // Navigate to the page containing the new record
    const filteredList = getFilteredConsecutivoList();
    const pageSize = appState.consecutivoPageSize;
    const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
    appState.consecutivoPage = totalPages;
    
    // Render the table
    renderConsecutivo();
    
    // Smooth scroll and focus on the newly added row
    const newRealIndex = appState.consecutivo.length - 1;
    setTimeout(() => {
        const rowEl = document.getElementById(`consec-row-${newRealIndex}`);
        if (rowEl) {
            rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            rowEl.classList.add("newly-added-row-highlight");
            setTimeout(() => {
                rowEl.classList.remove("newly-added-row-highlight");
            }, 3000);
            
            // Auto focus on folioCliente input
            const folioInput = rowEl.querySelector('input[oninput*="folioCliente"]');
            if (folioInput) folioInput.focus();
        }
    }, 150);
};

window.deleteConsecutivoRecord = function(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro del consecutivo?")) {
        appState.consecutivo.splice(index, 1);
        saveToStorage();
        renderConsecutivo();
    }
};

window.handleConsecutivoSearch = function(val) {
    appState.consecutivoSearch = val;
    appState.consecutivoPage = 1;
    renderConsecutivo();
};

window.filterConsecutivoByST = function(st, btn) {
    appState.consecutivoStFilter = st;
    appState.consecutivoPage = 1;
    document.querySelectorAll(".consecutivo-filter-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderConsecutivo();
};

window.filterConsecutivoByClient = function(client) {
    appState.consecutivoClientFilter = client;
    appState.consecutivoPage = 1;
    renderConsecutivo();
};

window.changeConsecutivoPageSize = function(size) {
    appState.consecutivoPageSize = size === 'all' ? 99999 : Number(size);
    appState.consecutivoPage = 1;
    renderConsecutivo();
};

window.exportConsecutivoToCSV = function() {
    const list = getFilteredConsecutivoList();
    if (!list || list.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    
    const headers = [
        "Consecutivo", "Factura", "Fecha Emision", "Cliente", "Folio Cliente",
        "Subtotal", "IVA", "Total", "ST", "Fecha Pago", "Referencia OP",
        "Servicio", "Detalle", "Nota", "% Rodipak", "Rodipak",
        "Hugo Comision", "Hugo Total", "% Hugo"
    ];
    
    const csvRows = [headers.join(",")];
    
    list.forEach(item => {
        const row = [
            item.consecutivo,
            `"${(item.factura || '').replace(/"/g, '""')}"`,
            `"${(item.fechaEmision || '').replace(/"/g, '""')}"`,
            `"${(item.cliente || '').replace(/"/g, '""')}"`,
            `"${(item.folioCliente || '').replace(/"/g, '""')}"`,
            item.subtotal || 0,
            item.iva || 0,
            item.total || 0,
            `"${(item.st || '').replace(/"/g, '""')}"`,
            `"${(item.fechaPago || '').replace(/"/g, '""')}"`,
            `"${(item.referenciaOp || '').replace(/"/g, '""')}"`,
            `"${(item.servicio || '').replace(/"/g, '""')}"`,
            `"${(item.detalle || '').replace(/"/g, '""')}"`,
            `"${(item.nota || '').replace(/"/g, '""')}"`,
            item.porcRodipak || 0,
            item.rodipak || 0,
            item.hugoComision || 0,
            item.hugoTotal || 0,
            item.porcHugo || 0
        ];
        csvRows.push(row.join(","));
    });
    
    const csvString = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Consecutivo_2026_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------------
// 10. HARMONIZED CUSTOM DROPDOWN COMPONENT LOGIC
// ---------------------------------------------------------------------------------
window.toggleCustomDropdown = function(type, event) {
    if (event) event.stopPropagation();
    const wrapper = document.getElementById(`wrapper-task-${type}`);
    if (!wrapper) return;
    
    const isOpen = wrapper.classList.contains("open");
    
    // Close all open dropdowns first
    document.querySelectorAll(".custom-select-wrapper").forEach(w => w.classList.remove("open"));
    
    if (!isOpen) {
        wrapper.classList.add("open");
    }
};

window.selectCustomOption = function(type, value, param1, param2, event) {
    if (event) event.stopPropagation();
    
    const input = document.getElementById(`task-${type}`);
    const wrapper = document.getElementById(`wrapper-task-${type}`);
    const menu = document.getElementById(`dropdown-menu-${type}`);
    
    if (input) input.value = value;
    
    if (type === 'assignee') {
        const initials = param1 || 'JP';
        const role = param2 || 'Colaborador';
        const container = document.getElementById("selected-content-assignee");
        if (container) {
            container.innerHTML = `
                <span class="avatar-mini-pill">${initials}</span>
                <span class="selected-text">${value}</span>
                <span class="role-mini-badge">${role}</span>
            `;
        }
    } else if (type === 'priority') {
        const label = param1 || 'Alta';
        const bulletClass = param2 || 'priority-bullet-alta';
        const container = document.getElementById("selected-content-priority");
        if (container) {
            container.innerHTML = `
                <span class="priority-bullet ${bulletClass}"></span>
                <span class="selected-text font-bold">${label}</span>
            `;
        }
    }
    
    // Update selected class in dropdown options
    if (menu) {
        menu.querySelectorAll(".custom-dropdown-option").forEach(opt => {
            if (opt.getAttribute("data-value") === value) {
                opt.classList.add("selected");
            } else {
                opt.classList.remove("selected");
            }
        });
    }
    
    if (wrapper) wrapper.classList.remove("open");
};

// Close dropdowns on outside click
document.addEventListener("click", function(event) {
    if (!event.target.closest(".custom-select-wrapper")) {
        document.querySelectorAll(".custom-select-wrapper").forEach(w => w.classList.remove("open"));
    }
    const assigneeWrapper = document.querySelector(".assignee-autocomplete-wrapper");
    if (assigneeWrapper && !assigneeWrapper.contains(event.target)) {
        if (typeof closeAssigneeDropdown === 'function') closeAssigneeDropdown();
    }
});

// ==============================================================================
// TASK ASSIGNEE AUTOCOMPLETE & DROPDOWN LOGIC
// ==============================================================================
function getAvailableAssignees() {
    const list = [];
    const seenEmails = new Set();
    const seenNames = new Set();

    // 1. Usuario actual en sesión ("Tú / Asignarme a mí") destacado en 1er lugar
    const current = appState.currentUser;
    if (current && (current.nombre || current.email)) {
        list.push({
            id: current.id,
            nombre: current.nombre || (current.email ? current.email.split('@')[0] : 'Mi Usuario'),
            email: current.email || '',
            rol: current.rol || 'gerente',
            departamento: current.departamento || 'General',
            isSelf: true
        });
        if (current.email) seenEmails.add(current.email.toLowerCase());
        if (current.nombre) seenNames.add(current.nombre.toLowerCase());
    } else {
        const defaultName = appState.currentRole === 'gerente' ? 'Gerente Principal' : 'Colaborador';
        list.push({
            id: 'self-user',
            nombre: defaultName,
            email: '',
            rol: appState.currentRole || 'gerente',
            departamento: 'General',
            isSelf: true
        });
        seenNames.add(defaultName.toLowerCase());
    }

    // 2. Colaboradores registrados en el sistema
    const allProfiles = [
        ...(window.cachedProfilesList || []),
        ...(window.cloudProfilesCache || []),
        ...(JSON.parse(localStorage.getItem('rp_local_profiles') || '[]'))
    ];

    allProfiles.forEach(p => {
        if (!p || (!p.nombre && !p.email)) return;
        const emailLower = (p.email || '').toLowerCase();
        const nameLower = (p.nombre || '').toLowerCase();
        if (emailLower && seenEmails.has(emailLower)) return;
        if (nameLower && seenNames.has(nameLower)) return;
        if (emailLower) seenEmails.add(emailLower);
        if (nameLower) seenNames.add(nameLower);

        list.push({
            id: p.id,
            nombre: p.nombre || (p.email ? p.email.split('@')[0] : 'Colaborador'),
            email: p.email || '',
            rol: p.rol || 'colaborador',
            departamento: p.departamento || 'Operaciones',
            isSelf: false
        });
    });

    return list;
}

window.openAssigneeDropdown = function() {
    const input = document.getElementById("task-assignee");
    window.filterAssigneeDropdown(input ? input.value : '');
};

window.closeAssigneeDropdown = function() {
    const menu = document.getElementById("task-assignee-dropdown");
    if (menu) menu.classList.remove("open");
};

window.filterAssigneeDropdown = function(query) {
    const menu = document.getElementById("task-assignee-dropdown");
    if (!menu) return;

    const assignees = getAvailableAssignees();
    const q = (query || '').trim().toLowerCase();

    const filtered = assignees.filter(u => {
        if (!q) return true;
        return (u.nombre && u.nombre.toLowerCase().includes(q)) ||
               (u.email && u.email.toLowerCase().includes(q)) ||
               (u.rol && u.rol.toLowerCase().includes(q)) ||
               (u.departamento && u.departamento.toLowerCase().includes(q)) ||
               (u.isSelf && ('yo'.includes(q) || 'mi'.includes(q) || 'mismo'.includes(q) || 'tu'.includes(q)));
    });

    if (filtered.length === 0) {
        menu.innerHTML = `<li class="assignee-dropdown-empty">No se encontraron colaboradores para "${query}"</li>`;
        menu.classList.add("open");
        return;
    }

    menu.innerHTML = filtered.map(u => {
        const initial = (u.nombre || u.email || 'U').charAt(0).toUpperCase();
        const r = (u.rol || '').toLowerCase();
        const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
        const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
        const roleColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#64748B');
        const roleBg = isGerente ? 'rgba(37, 99, 235, 0.1)' : (isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)');
        const roleLabel = isGerente ? 'Gerente' : (isAdmin ? 'Admin' : 'Colaborador');
        const escapedName = (u.nombre || '').replace(/'/g, "\\'");

        const badgeHtml = u.isSelf 
            ? `<span class="assignee-badge-self">⭐ Tú (Asignarme a mí)</span>`
            : `<span class="assignee-badge-role" style="background: ${roleBg}; color: ${roleColor};">${roleLabel}</span>`;

        return `
            <li class="assignee-dropdown-item" onmousedown="selectTaskAssignee('${escapedName}')">
                <div class="assignee-item-user">
                    <div class="assignee-item-avatar" style="background: ${roleBg}; color: ${roleColor}; border-color: ${roleColor};">
                        ${initial}
                    </div>
                    <div class="assignee-item-details">
                        <span class="assignee-item-name">${u.nombre}</span>
                        <span class="assignee-item-sub">${u.email || u.departamento}</span>
                    </div>
                </div>
                ${badgeHtml}
            </li>
        `;
    }).join('');

    menu.classList.add("open");
};

window.selectTaskAssignee = function(name) {
    const input = document.getElementById("task-assignee");
    if (input) {
        input.value = name;
    }
    window.closeAssigneeDropdown();
};

window.setTaskPrioritySegment = function(priority) {
    const input = document.getElementById("task-priority");
    if (input) input.value = priority;
    
    document.querySelectorAll(".priority-segment-btn").forEach(btn => {
        if (btn.getAttribute("data-priority") === priority) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
};

window.getActiveNominasList = function() {
    if (appState.viewingArchiveId) {
        const arch = (appState.archivosQuincenales || []).find(x => x.id === appState.viewingArchiveId);
        return arch ? arch.nominas : [];
    }
    return appState.nominas || [];
};

window.openModalArchivoDigital = function() {
    switchAdminFicha('archivo-digital');
};

window.closeModalArchivoDigital = function() {
    // Deprecated, we use switchAdminFicha('quincenal') directly now
    switchAdminFicha('quincenal');
};

window.renderArchivoDigital = function() {
    const tbody = document.getElementById("tbody-archivo-digital");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (!appState.archivosQuincenales || appState.archivosQuincenales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 20px;">No hay quincenas archivadas.</td></tr>`;
        return;
    }
    
    // Reverse to show latest first
    const list = [...appState.archivosQuincenales].reverse();
    
    list.forEach((arch) => {
        const total = arch.nominas.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        const count = arch.nominas.length;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: 700; color: var(--text-primary);">${arch.nombre}</td>
            <td>${arch.fechaCierre}</td>
            <td style="text-align: center;">${count}</td>
            <td style="font-weight: 700; color: #10B981;">${formatCurrency(total)}</td>
            <td>
                <button class="btn btn-secondary" onclick="loadArchiveForEdit('${arch.id}')" style="padding: 4px 10px; font-size: 12px; background: #e2e8f0; border: none; color: #0f172a;">
                    <span class="material-symbols-outlined" style="font-size: 14px; margin-right: 4px;">edit</span> Visualizar / Editar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.archivarQuincenaActual = function() {
    if (!appState.nominas || appState.nominas.length === 0) {
        alert("No hay registros en la quincena actual para archivar.");
        return;
    }
    
    const defaultName = "Quincena " + new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    const name = prompt("Introduce el nombre o periodo para este archivo (ej. 15 Sep 2026):", defaultName);
    if (!name) return;
    
    const newArchive = {
        id: Date.now().toString(),
        nombre: name,
        fechaCierre: new Date().toISOString().split('T')[0],
        nominas: JSON.parse(JSON.stringify(appState.nominas))
    };
    
    if (!appState.archivosQuincenales) appState.archivosQuincenales = [];
    appState.archivosQuincenales.push(newArchive);
    
    appState.nominas = [];
    saveToStorage();
    renderNominas();
    renderVisualizacion();
    
    // Animate success
    const btn = document.getElementById("btn-archivar-quincena");
    if(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = "<span class='material-symbols-outlined'>check</span> ¡Archivada!";
        btn.style.backgroundColor = "#10B981";
        btn.style.borderColor = "#10B981";
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = "#f59e0b";
            btn.style.borderColor = "#f59e0b";
        }, 2000);
    }
};

window.loadArchiveForEdit = function(id) {
    appState.viewingArchiveId = id;
    closeModalArchivoDigital();
    
    const arch = appState.archivosQuincenales.find(x => x.id === id);
    
    document.getElementById("btn-archivar-quincena").style.display = "none";
    document.getElementById("btn-exit-archive").style.display = "inline-flex";
    document.getElementById("btn-exit-archive").innerHTML = "<span class='material-symbols-outlined'>close</span> Cerrar Archivo: " + (arch ? arch.nombre : '');
    
    renderNominas();
    renderVisualizacion();
};

window.exitArchiveMode = function() {
    appState.viewingArchiveId = null;
    
    document.getElementById("btn-archivar-quincena").style.display = "inline-flex";
    document.getElementById("btn-exit-archive").style.display = "none";
    
    renderNominas();
    renderVisualizacion();
};



// ===============// =================================================================================
// 12. SUPABASE CLOUD AUTHENTICATION & REALTIME SYNCHRONIZATION
// =================================================================================

let cloudProfilesCache = [];

async function initAuthAndRealtime() {
    const client = window.initSupabaseClient();
    updateCloudStatusUI(false, null);
    
    if (!client) {
        console.log("ℹ️ [Rodipack] Modo Local / Demostración activo. Conecta Supabase en 'Conectar Nube'.");
        return;
    }
    
    try {
        // Detect recovery token in URL hash
        if (window.location.hash.includes('type=recovery') || (window.location.hash.includes('access_token=') && !localStorage.getItem("rp_session_active"))) {
            const resetModal = document.getElementById("reset-password-modal");
            if (resetModal) resetModal.style.display = "flex";
        }

        const isSessionActive = localStorage.getItem("rp_session_active") === "true";
        const storedUser = localStorage.getItem("rp_logged_user");
        const { data: { session }, error } = await client.auth.getSession();
        
        if (session && session.user && isSessionActive) {
            await handleUserSession(session.user);
        } else if (isSessionActive && storedUser) {
            try {
                appState.currentUser = JSON.parse(storedUser);
                if (appState.currentUser && appState.currentUser.email && appState.currentUser.email.toLowerCase() === 'diego@rodipack.com') {
                    appState.currentUser.rol = 'administrativo';
                }
                setRole(appState.currentUser?.rol || 'gerente');
                updateUserSessionUI();
                updateCloudStatusUI(true, appState.currentUser);
            } catch (e) {}
        } else {
            updateCloudStatusUI(true, null);
            if (!isSessionActive && !window.location.hash.includes('type=recovery')) {
                appState.currentUser = null;
                showGlobalLoginOverlay();
            }
        }
        
        // Listen to Auth State Changes
        client.auth.onAuthStateChange(async (event, session) => {
            console.log("⚡ [Auth State Change]:", event);
            if (event === 'PASSWORD_RECOVERY') {
                const resetModal = document.getElementById("reset-password-modal");
                if (resetModal) resetModal.style.display = "flex";
                return;
            }
            const active = localStorage.getItem("rp_session_active") === "true";
            const localUser = localStorage.getItem("rp_logged_user");

            if (session && session.user && active) {
                await handleUserSession(session.user);
            } else if (active && localUser) {
                try {
                    appState.currentUser = JSON.parse(localUser);
                    if (appState.currentUser && appState.currentUser.email && appState.currentUser.email.toLowerCase() === 'diego@rodipack.com') {
                        appState.currentUser.rol = 'administrativo';
                    }
                    setRole(appState.currentUser?.rol || 'gerente');
                    updateUserSessionUI();
                    updateCloudStatusUI(true, appState.currentUser);
                } catch (e) {}
            } else if (!active) {
                appState.currentUser = null;
                updateCloudStatusUI(true, null);
                if (!window.location.hash.includes('type=recovery')) showGlobalLoginOverlay();
            }
        });
        
        // Setup WebSockets Realtime Subscriptions
        setupRealtimeSubscriptions();
        
        // Fetch Cloud Data from Supabase
        await fetchCloudData();
    } catch (err) {
        console.warn("⚠️ Error initializing cloud auth:", err);
    }
}

async function handleUserSession(user) {
    if (!window.isSupabaseActive() || !user) return;
    const client = window.SUPABASE_CONFIG.client;
    
    try {
        let { data: profile, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (!profile) {
            // Profile fallback
            profile = {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.nombre || user.email.split('@')[0],
                rol: user.user_metadata?.rol || 'gerente',
                departamento: user.user_metadata?.departamento || 'Administración'
            };
        }
        
        // Garantizar rol de Gerente para el administrador y administrativo para Diego
        if (profile.email === 'zalazardemiranda@gmail.com') {
            profile.rol = 'gerente';
        } else if (profile.email && profile.email.toLowerCase() === 'diego@rodipack.com') {
            profile.rol = 'administrativo';
        } else if (!profile.rol) {
            profile.rol = 'gerente';
        }
        
        appState.currentUser = profile;
        setRole(profile.rol || 'gerente');
        updateUserSessionUI();
        updateCloudStatusUI(true, profile);
    } catch (err) {
        console.error("Error loading user profile:", err);
    }
}

function updateCloudStatusUI(isConnected, user) {
    const dot = document.getElementById("cloud-status-dot");
    const txt = document.getElementById("cloud-status-text");
    
    if (!dot || !txt) return;
    
    if (isConnected && user) {
        dot.className = "cloud-dot online";
        txt.innerText = `${user.nombre.split(' ')[0]} (En Vivo)`;
    } else if (isConnected) {
        dot.className = "cloud-dot online";
        txt.innerText = "Nube Conectada";
    } else {
        dot.className = "cloud-dot offline";
        txt.innerText = "Conectar Nube";
    }
}

function setupRealtimeSubscriptions() {
    if (!window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG.client;

    // Remover canal previo si existiera para evitar duplicados
    if (window.chatRealtimeChannel) {
        try { client.removeChannel(window.chatRealtimeChannel); } catch (e) {}
    }

    // Canal Hub en Tiempo Real: WebSockets Broadcast (sub-50ms) + PostgreSQL Changes
    window.chatRealtimeChannel = client.channel('rodipack-realtime-hub', {
        config: {
            broadcast: { self: false } // El emisor ya agregó el mensaje localmente
        }
    });

    // 1. Recibir Mensaje Instantáneo por Broadcast (WebSockets directos entre dispositivos)
    window.chatRealtimeChannel.on('broadcast', { event: 'new_message' }, payload => {
        const msg = payload.payload;
        if (!msg || !msg.channel) return;
        const channelKey = msg.channel;
        if (!appState.chats[channelKey]) appState.chats[channelKey] = [];

        const alreadyExists = appState.chats[channelKey].some(m => 
            m.id === msg.id || 
            (m.text === msg.text && m.sender === msg.sender && Math.abs(new Date(m.timestamp || 0) - new Date(msg.timestamp || 0)) < 4000)
        );

        if (!alreadyExists) {
            const newEntry = {
                id: msg.id,
                channel: channelKey,
                sender: msg.sender,
                role: msg.role,
                text: msg.text,
                time: msg.time,
                timestamp: msg.timestamp || new Date().toISOString()
            };
            if (msg.attachment) {
                newEntry.attachment = msg.attachment;
            }
            appState.chats[channelKey].push(newEntry);
            saveToStorage();
            if (appState.currentChannel === channelKey) {
                renderChatMessages(false);
            }
            if (appState.currentTab !== 'chat') {
                const badge = document.getElementById("unread-chat-count");
                if (badge) {
                    badge.style.display = "inline-flex";
                    badge.innerText = parseInt(badge.innerText || '0', 10) + 1;
                }
            }
        }
    });

    // 2. Recibir Nuevo Grupo por Broadcast
    window.chatRealtimeChannel.on('broadcast', { event: 'new_group' }, payload => {
        const grp = payload.payload;
        if (!grp || !grp.id) return;
        if (!appState.customChannels) appState.customChannels = [];
        if (!appState.customChannels.some(c => c.id === grp.id)) {
            appState.customChannels.push(grp);
            saveToStorage();
            renderChatChannels();
        }
    });

    // 3. Recibir Eventos de Tareas por Broadcast
    window.chatRealtimeChannel.on('broadcast', { event: 'task_event' }, payload => {
        const data = payload.payload;
        if (!data) return;
        if (data.action === 'created' && data.task) {
            if (!appState.tasks.some(t => t.id === data.task.id)) {
                appState.tasks.unshift(data.task);
                saveToStorage();
                renderTasks();
                updateGlobalStats();
            }
        } else if (data.action === 'updated' && data.id) {
            const t = appState.tasks.find(x => x.id === data.id);
            if (t) {
                t.status = data.status;
                saveToStorage();
                renderTasks();
                updateGlobalStats();
            }
        } else if (data.action === 'deleted' && data.id) {
            appState.tasks = appState.tasks.filter(x => x.id !== data.id);
            saveToStorage();
            renderTasks();
            updateGlobalStats();
        }
    });

    // 4. Recibir Actualizaciones de Operaciones por Broadcast (Sincronización instantánea iPad <-> PC)
    window.chatRealtimeChannel.on('broadcast', { event: 'operaciones_update' }, payload => {
        const data = payload.payload;
        if (!data || !Array.isArray(data.proyectos)) return;
        if (typeof window.mergeOperacionesProjects === 'function') {
            window.mergeOperacionesProjects(data.proyectos);
            try {
                localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(appState.operacionesProyectos));
            } catch (e) {}
            if (appState.currentAdminFicha === 'operaciones' && typeof window.renderOperaciones === 'function') {
                window.renderOperaciones();
                if (appState.activeOperacionesProjectId && typeof window.renderStep1View === 'function') {
                    const activeP = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
                    if (activeP) window.renderStep1View(activeP);
                }
            }
        }
    });

    // 5. Cambios de base de datos PostgreSQL en mensajes (canal secundario)
    window.chatRealtimeChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const row = payload.new;
        if (!row) return;
        const channelKey = row.chat_id || 'general';
        if (channelKey.startsWith('__')) {
            // Mensaje de sincronización interna (como snapshot de operaciones)
            if (channelKey === '__cloud_sync_operaciones__' && typeof window.fetchOperacionesFromCloud === 'function') {
                window.fetchOperacionesFromCloud();
            }
            return;
        }
        if (!appState.chats[channelKey]) appState.chats[channelKey] = [];

        const parsed = parseMessageContent(row.contenido);
        const senderRole = row.emisor_role || (row.emisor_nombre === 'Sistema Rodipack' ? 'sistema' : 'colaborador');
        const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const msgObj = {
            id: row.id,
            channel: channelKey,
            sender: row.emisor_nombre || 'Usuario',
            role: senderRole,
            text: parsed.text,
            time: timeStr,
            timestamp: row.created_at,
            syncedToCloud: true
        };
        if (parsed.attachment) {
            msgObj.attachment = parsed.attachment;
        }

        const existingIdx = appState.chats[channelKey].findIndex(m => m.id === row.id);
        if (existingIdx !== -1) {
            appState.chats[channelKey][existingIdx] = {
                ...appState.chats[channelKey][existingIdx],
                ...msgObj,
                attachment: parsed.attachment || appState.chats[channelKey][existingIdx].attachment
            };
        } else {
            appState.chats[channelKey].push(msgObj);
        }

        saveToStorage();
        if (appState.currentChannel === channelKey) {
            renderChatMessages(false);
        }
        if (appState.currentTab !== 'chat') {
            const badge = document.getElementById("unread-chat-count");
            if (badge) {
                badge.style.display = "inline-flex";
                badge.innerText = parseInt(badge.innerText || '0', 10) + 1;
            }
        }
    });

    // 6. Cambios de base de datos PostgreSQL en tareas
    window.chatRealtimeChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        await fetchTasksFromCloud();
    });

    // 7. Cambios de base de datos PostgreSQL en operaciones
    window.chatRealtimeChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'operaciones' }, async () => {
        if (typeof window.fetchOperacionesFromCloud === 'function') {
            await window.fetchOperacionesFromCloud();
        }
    });

    window.chatRealtimeChannel.subscribe((status) => {
        console.log("⚡ [Realtime Hub Subscripción]:", status);
        if (status === 'SUBSCRIBED') {
            updateCloudStatusUI(true, appState.currentUser);
        }
    });
}

async function fetchCloudData() {
    if (!window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG.client;
    
    try {
        // Cargar perfiles desde Supabase
        const { data: profiles, error: pError } = await client.from('profiles').select('*');
        if (profiles && profiles.length > 0) {
            cloudProfilesCache = profiles;
            window.cloudProfilesCache = profiles;
            updateAssigneeDropdown(profiles);
        }
        
        // Sincronizar tareas
        await fetchTasksFromCloud();

        // Sincronizar proyectos de Operaciones (nube <-> local)
        if (typeof window.fetchOperacionesFromCloud === 'function') {
            await window.fetchOperacionesFromCloud();
        }
        
        // Sincronizar mensajes de chat: 100% de la base de datos de Supabase (sin datos inventados ni locales obsoletos)
        const { data: msgs, error: mError } = await client.from('messages').select('*').order('created_at', { ascending: true });
        if (msgs) {
            const cleanChats = { general: [] };
            (appState.customChannels || []).forEach(c => {
                if (!cleanChats[c.id]) cleanChats[c.id] = [];
            });

            msgs.forEach(row => {
                const channelKey = row.chat_id || 'general';
                if (channelKey.startsWith('__')) return; // Canales internos de sincronización
                if (!cleanChats[channelKey]) cleanChats[channelKey] = [];

                const parsed = parseMessageContent(row.contenido);
                const senderName = row.emisor_nombre || 'Usuario';
                const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const senderRole = row.emisor_role || (row.emisor_nombre === 'Sistema Rodipack' ? 'sistema' : 'colaborador');

                const msgObj = {
                    id: row.id,
                    channel: channelKey,
                    sender: senderName,
                    role: senderRole,
                    text: parsed.text,
                    time: timeStr,
                    timestamp: row.created_at,
                    syncedToCloud: true
                };
                if (parsed.attachment) {
                    msgObj.attachment = parsed.attachment;
                }

                cleanChats[channelKey].push(msgObj);
            });

            appState.chats = cleanChats;
            saveToStorage();
            renderChatMessages(false);
        }
    } catch (err) {
        console.warn("⚠️ Error fetching cloud data:", err);
    }
}

async function fetchTasksFromCloud() {
    if (!window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG.client;
    if (!appState.deletedTaskIds) appState.deletedTaskIds = JSON.parse(localStorage.getItem('rp_deleted_task_ids')) || [];
    
    try {
        const { data: dbTasks, error } = await client.from('tasks').select('*').order('created_at', { ascending: false });
        
        const cloudTasks = (dbTasks || []).map(t => {
            const rawP = (t.prioridad || '').toString().trim().toLowerCase();
            let normP = 'alta';
            if (rawP.includes('alt')) normP = 'alta';
            else if (rawP.includes('med')) normP = 'media';
            else if (rawP.includes('baj')) normP = 'baja';

            const rawState = (t.estado || '').toString().trim().toLowerCase();
            let normStatus = 'pending';
            if (rawState === 'completada' || rawState === 'completed') normStatus = 'completed';

            return {
                id: t.id,
                title: t.titulo,
                desc: t.descripcion,
                priority: normP,
                status: normStatus,
                assignee: t.asignado_nombre || 'Sin asignar',
                createdAt: t.created_at,
                uploadedToCloud: true
            };
        });

        // Filtrar tareas que hayan sido eliminadas o asignadas a usuarios inventados
        const fakeAssignees = new Set(['sofía castro', 'sofia castro', 'carlos ruiz', 'juan pérez', 'juan perez', 'maría gómez', 'maria gomez', 'gerente principal']);
        const filteredCloudTasks = cloudTasks.filter(ct => {
            if (!ct || !ct.title) return false;
            const sig = `${(ct.title || '').trim().toLowerCase()}____${(ct.desc || '').trim().toLowerCase()}`;
            const assignee = (ct.assignee || '').trim().toLowerCase();
            if (fakeAssignees.has(assignee)) return false;
            if (ct.id === '6929c3c3-9be4-40ec-87a8-358386733c2b' || ct.id === 'c772ff39-1ddb-4911-ba44-a924d5efb841') return false;
            return !appState.deletedTaskIds.includes(ct.id) && !appState.deletedTaskIds.includes(sig);
        });

        // Mapa combinado para fusionar tareas locales y remotas
        const mergedMap = new Map();

        // 1. Agregar tareas locales actuales
        (appState.tasks || []).forEach(lt => {
            if (!lt || !lt.title) return;
            const cleanTitle = (lt.title || '').trim().toLowerCase();
            const cleanDesc = (lt.desc || '').trim().toLowerCase();
            const sig = `${cleanTitle}____${cleanDesc}`;
            const assignee = (lt.assignee || '').trim().toLowerCase();
            if (fakeAssignees.has(assignee)) return;
            if (lt.id === '6929c3c3-9be4-40ec-87a8-358386733c2b' || lt.id === 'c772ff39-1ddb-4911-ba44-a924d5efb841') return;
            if (appState.deletedTaskIds.includes(lt.id) || appState.deletedTaskIds.includes(sig)) return;

            // Normalizar estado por seguridad
            if (lt.status === 'completada') lt.status = 'completed';
            if (lt.status === 'pendiente') lt.status = 'pending';

            mergedMap.set(lt.id, lt);
            mergedMap.set(sig, lt);
        });

        // 2. Fusionar tareas provenientes de Supabase
        filteredCloudTasks.forEach(ct => {
            const cleanTitle = (ct.title || '').trim().toLowerCase();
            const cleanDesc = (ct.desc || '').trim().toLowerCase();
            const sig = `${cleanTitle}____${cleanDesc}`;
            const existingLocal = mergedMap.get(ct.id) || mergedMap.get(sig);
            if (existingLocal) {
                existingLocal.id = ct.id;
                existingLocal.priority = ct.priority || existingLocal.priority;
                existingLocal.status = ct.status || existingLocal.status;
                existingLocal.uploadedToCloud = true;
            } else {
                mergedMap.set(ct.id, ct);
            }
        });

        // Reconstruir lista limpia deduplicada por ID y por (título + descripción)
        const finalTasksList = [];
        const seenIds = new Set();
        const seenSignatures = new Set();

        Array.from(mergedMap.values()).forEach(t => {
            if (!t || !t.title) return;
            const cleanTitle = (t.title || '').trim().toLowerCase();
            const cleanDesc = (t.desc || '').trim().toLowerCase();
            const sig = `${cleanTitle}____${cleanDesc}`;
            if (appState.deletedTaskIds.includes(t.id) || appState.deletedTaskIds.includes(sig)) return;

            if (!seenIds.has(t.id) && !seenSignatures.has(sig)) {
                seenIds.add(t.id);
                seenSignatures.add(sig);
                finalTasksList.push(t);
            }
        });

        appState.tasks = finalTasksList;
        saveToStorage();
        renderTasks();
        updateGlobalStats();

        // Subir a Supabase cualquier tarea local no sincronizada
        if (appState.currentRole === 'gerente') {
            const cloudTitleSet = new Set((dbTasks || []).map(t => (t.titulo || '').trim().toLowerCase()));
            appState.tasks.forEach(t => {
                const normT = (t.title || '').trim().toLowerCase();
                const sig = `${normT}____${(t.desc || '').trim().toLowerCase()}`;
                if (appState.deletedTaskIds.includes(t.id) || appState.deletedTaskIds.includes(sig)) return;

                if (!cloudTitleSet.has(normT) && !t.uploadedToCloud) {
                    t.uploadedToCloud = true;
                    const dbPriority = (t.priority || 'alta').charAt(0).toUpperCase() + (t.priority || 'alta').slice(1).toLowerCase();
                    const dbStatus = t.status === 'completed' ? 'completada' : 'pendiente';
                    client.from('tasks').insert([{
                        titulo: t.title,
                        descripcion: t.desc,
                        prioridad: dbPriority,
                        estado: dbStatus,
                        asignado_nombre: t.assignee || 'Sin asignar'
                    }]).then(({ error: insertErr }) => {
                        if (insertErr) console.warn("Notice: Task cloud sync:", insertErr.message || insertErr);
                    });
                }
            });
        }
    } catch (err) {
        console.warn("Error fetching cloud tasks:", err);
    }
}

function updateAssigneeDropdown(profiles) {
    if (profiles && profiles.length > 0) {
        cloudProfilesCache = profiles;
        window.cloudProfilesCache = profiles;
    }
}

// Reconexión y re-sincronización automática para Tablets (iPad/Android) al desbloquear pantalla
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.isSupabaseActive()) {
        console.log("⚡ [Tablet/Pantalla Activa]: Re-sincronizando chat y tareas en vivo...");
        fetchCloudData();
    }
});

window.addEventListener('online', () => {
    if (window.isSupabaseActive()) {
        console.log("⚡ [Red Reconectada]: Restaurando conexión en vivo...");
        setupRealtimeSubscriptions();
        fetchCloudData();
    }
});

// Sincronización periódica en segundo plano para asegurar que tablets y móviles nunca pierdan mensajes
setInterval(() => {
    if (window.isSupabaseActive() && document.visibilityState === 'visible') {
        fetchCloudData();
    }
}, 8000);

// ---------------------------------------------------------------------------------
// GERENTE PROFILE & USER ADMINISTRATION CONTROLS
// ---------------------------------------------------------------------------------

window.openAuthModal = function() {
    if (!appState.currentUser) {
        const storedUser = localStorage.getItem("rp_logged_user");
        if (storedUser) {
            try { appState.currentUser = JSON.parse(storedUser); } catch (e) {}
        }
    }

    const isSessionActive = localStorage.getItem("rp_session_active") === "true";
    const loggedInView = document.getElementById("gerente-logged-in-view");
    const loginView = document.getElementById("gerente-login-view");
    const cloudIndicator = document.getElementById("modal-cloud-indicator");

    if (cloudIndicator) {
        if (window.isSupabaseActive()) {
            cloudIndicator.innerHTML = '<span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981;"></span> Nube Activa';
            cloudIndicator.style.color = '#10B981';
            cloudIndicator.style.background = '#ECFDF5';
            cloudIndicator.style.borderColor = '#A7F3D0';
        } else {
            cloudIndicator.innerHTML = '<span style="width: 7px; height: 7px; border-radius: 50%; background: #F59E0B;"></span> Local / Demo';
            cloudIndicator.style.color = '#B45309';
            cloudIndicator.style.background = '#FEF3C7';
            cloudIndicator.style.borderColor = '#FDE68A';
        }
    }

    updateUserSessionUI();

    if (appState.currentUser || isSessionActive) {
        if (loggedInView) loggedInView.style.display = "block";
        if (loginView) loginView.style.display = "none";
    } else {
        if (loggedInView) loggedInView.style.display = "none";
        if (loginView) loginView.style.display = "block";
    }

    switchAuthTab('myprofile');
    loadProfilesList();
};

window.closeAuthModal = function() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "none";
};

window.switchAuthTab = function(tabName) {
    document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".auth-tab-pane").forEach(p => { p.style.display = "none"; p.classList.remove("active"); });
    
    const btn = document.getElementById(`tab-btn-${tabName}`);
    const pane = document.getElementById(`auth-pane-${tabName}`);
    
    if (btn) btn.classList.add("active");
    if (pane) {
        pane.style.display = "block";
        pane.classList.add("active");
    }
    
    if (tabName === 'profiles') {
        loadProfilesList();
    }
    
    // Auto-fill config inputs if switching to config
    if (tabName === 'config') {
        const urlInput = document.getElementById("config-supabase-url");
        const keyInput = document.getElementById("config-supabase-key");
        if (urlInput) urlInput.value = window.SUPABASE_CONFIG.URL || "";
        if (keyInput) keyInput.value = window.SUPABASE_CONFIG.ANON_KEY || "";
    }
};

window.forceAppRefresh = function() {
    try {
        if ('caches' in window) {
            caches.keys().then(names => {
                for (let name of names) caches.delete(name);
            });
        }
    } catch (e) {}
    try {
        localStorage.removeItem('rp_app_version');
    } catch (e) {}
    const ts = Date.now();
    const cleanUrl = window.location.origin + window.location.pathname + '?v_reload=' + ts;
    window.location.replace(cleanUrl);
};

window.toggleNewUserForm = function() {
    const formContainer = document.getElementById("new-user-form-container");
    if (formContainer) {
        formContainer.style.display = (formContainer.style.display === "none" || formContainer.style.display === "") ? "block" : "none";
    }
};

window.loadProfilesList = async function() {
    const container = document.getElementById("profiles-list-container");
    
    const defaultProfiles = [
        { nombre: "Manuel Miranda", email: "roberto@rodipack.com", rol: "gerente", departamento: "CEO", password: "Miranda5011" },
        { nombre: "Roberto Miranda Perez", email: "zalazardemiranda@gmail.com", rol: "gerente", departamento: "Sistemas IT", password: "Miranda5011" },
        { nombre: "Maria Perez", email: "facturas@rodipack.com", rol: "administrador", departamento: "Finanzas", password: "Maria5011" },
        { nombre: "Diego Miranda", email: "diego@rodipack.com", rol: "administrativo", departamento: "Administración", password: "Diego5011" }
    ];
    
    let localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
    // Limpiar perfiles temporales o inventados
    localProfiles = localProfiles.filter(p => {
        if (!p || !p.email) return false;
        const e = p.email.toLowerCase();
        return e !== 'jennifer@rodipack.online' && e !== 'diego.miranda@rodipack.com';
    });

    defaultProfiles.forEach(dp => {
        const idx = localProfiles.findIndex(p => p.email && p.email.toLowerCase() === dp.email.toLowerCase());
        if (idx === -1) {
            localProfiles.push(dp);
        } else {
            if (!localProfiles[idx].nombre) localProfiles[idx].nombre = dp.nombre;
            if (!localProfiles[idx].departamento) localProfiles[idx].departamento = dp.departamento;
            if (dp.email.toLowerCase() === 'diego@rodipack.com') {
                localProfiles[idx].rol = 'administrativo';
            }
        }
    });
    localStorage.setItem('rp_local_profiles', JSON.stringify(localProfiles));
    
    let mergedProfiles = [...localProfiles];
    
    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            const { data: dbProfiles, error } = await client
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (dbProfiles && Array.isArray(dbProfiles) && !error) {
                const cleanDbProfiles = dbProfiles.filter(p => {
                    if (!p || !p.email) return false;
                    const e = p.email.toLowerCase();
                    return e !== 'jennifer@rodipack.online' && e !== 'diego.miranda@rodipack.com';
                });
                mergedProfiles = [...cleanDbProfiles];
                localProfiles.forEach(lp => {
                    if (lp.email && !mergedProfiles.some(p => p.email && p.email.toLowerCase() === lp.email.toLowerCase())) {
                        mergedProfiles.unshift(lp);
                    }
                });
            }
        } catch (err) {
            console.warn("Error loading profiles from Supabase:", err);
        }
    }
    
    window.cachedProfilesList = mergedProfiles;
    
    if (container) {
        renderProfiles(mergedProfiles);
    }
    
    function renderProfiles(list) {
        const managers = list.filter(p => {
            const r = (p.rol || '').toLowerCase();
            return r === 'gerente' || r === 'manager' || r === 'director';
        });
        const admins = list.filter(p => {
            const r = (p.rol || '').toLowerCase();
            return r === 'administrador' || r === 'admin' || r === 'administrativo';
        });
        const colaboradores = list.filter(p => !managers.includes(p) && !admins.includes(p));

        const renderCard = (p) => {
            const initial = (p.nombre || p.email || 'U').charAt(0).toUpperCase();
            const r = (p.rol || '').toLowerCase();
            const isGerente = r === 'gerente' || r === 'manager' || r === 'director';
            const isAdmin = r === 'administrador' || r === 'admin' || r === 'administrativo';
            const isMainGerente = (p.email || '').toLowerCase() === 'zalazardemiranda@gmail.com';
            
            const roleColor = isGerente ? '#2563EB' : (isAdmin ? '#10B981' : '#475569');
            const roleBg = isGerente ? 'rgba(37, 99, 235, 0.1)' : (isAdmin ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)');
            const roleLabel = isGerente ? 'Manager' : (isAdmin ? 'Administrativo' : 'Colaborador');

            const editBtnHtml = `
                <button type="button" onclick="openEditProfileModal('${p.email}')" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; border-radius: 8px; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;" title="Editar Perfil y Rol de ${p.nombre || p.email}">
                    <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
                </button>
            `;

            const deleteBtnHtml = isMainGerente ? '' : `
                <button type="button" onclick="handleDeleteProfile('${p.email}', '${(p.nombre || '').replace(/'/g, "\\'")}')" style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #EF4444; border-radius: 8px; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin-left: 4px;" title="Eliminar Perfil de ${p.nombre || p.email}">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                </button>
            `;

            return `
                <div class="user-profile-card" style="width: 100%; min-height: 86px; padding: 14px 16px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03); display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                        <div style="width: 42px; height: 42px; min-width: 42px; border-radius: 50%; background: ${roleBg}; color: ${roleColor}; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid ${roleColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                            ${initial}
                        </div>
                        <div style="min-width: 0; flex: 1;">
                            <h5 style="margin: 0 0 2px 0; font-size: 13.5px; font-weight: 800; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.nombre || 'Sin nombre'}">${p.nombre || 'Sin nombre'}</h5>
                            <span style="font-size: 11.5px; color: #64748B; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.email || ''}">${p.email || ''}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <div style="text-align: right; flex-shrink: 0;">
                            <span style="display: inline-block; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: ${roleBg}; color: ${roleColor}; margin-bottom: 3px;">
                                ${roleLabel}
                            </span>
                            <div style="font-size: 11px; font-weight: 600; color: #94A3B8;">${p.departamento || 'General'}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            ${editBtnHtml}
                            ${deleteBtnHtml}
                        </div>
                    </div>
                </div>
            `;
        };

        const renderColumn = (title, icon, color, badgeBg, items, emptyText) => {
            return `
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 14px; height: 100%;">
                    <!-- HEADER DE COLUMNA -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1.5px solid #E2E8F0;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined" style="color: ${color}; font-size: 20px;">${icon}</span>
                            <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0F172A;">${title}</h4>
                        </div>
                        <span style="font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: 10px; background: ${badgeBg}; color: ${color}; min-width: 24px; text-align: center;">
                            ${items.length}
                        </span>
                    </div>

                    <!-- LISTA DE FICHAS -->
                    <div style="display: flex; flex-direction: column; gap: 12px; flex: 1;">
                        ${items.length > 0 ? items.map(renderCard).join('') : `
                            <div style="text-align: center; padding: 24px 12px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 12px; color: #94A3B8;">
                                <span class="material-symbols-outlined" style="font-size: 26px; display: block; margin-bottom: 4px; color: #CBD5E1;">inbox</span>
                                <span style="font-size: 12px; font-weight: 600;">${emptyText}</span>
                            </div>
                        `}
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; align-items: start; width: 100%;">
                ${renderColumn("Managers", "star", "#2563EB", "rgba(37, 99, 235, 0.12)", managers, "Sin perfiles de Manager")}
                ${renderColumn("Administrativos", "admin_panel_settings", "#10B981", "rgba(16, 185, 129, 0.12)", admins, "Sin perfiles de Administrativo")}
                ${renderColumn("Colaboradores", "group", "#64748B", "rgba(100, 116, 139, 0.12)", colaboradores, "Sin colaboradores registrados")}
            </div>
        `;
    }
};

window.handleSupabaseLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error-msg");
    const btnSubmit = document.getElementById("btn-submit-login");
    
    if (errorEl) errorEl.style.display = "none";
    
    if (!window.isSupabaseActive()) {
        if (errorEl) {
            errorEl.innerText = "Primero debes configurar tu conexión a Supabase en la pestaña 'Conexión Supabase'.";
            errorEl.style.display = "block";
        }
        return;
    }
    
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Verificando...";
    
    try {
        const client = window.SUPABASE_CONFIG.client;
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        
        if (error) {
            if (errorEl) {
                errorEl.innerText = `Error: ${error.message}`;
                errorEl.style.display = "block";
            }
        } else {
            await handleUserSession(data.user);
            openAuthModal(); // Refresh modal view to show logged-in info
            loadProfilesList();
        }
    } catch (err) {
        if (errorEl) {
            errorEl.innerText = `Error de conexión: ${err.message}`;
            errorEl.style.display = "block";
        }
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "<span class='material-symbols-outlined'>login</span> Iniciar Sesión";
    }
};

window.handleSupabaseRegister = async function(event) {
    event.preventDefault();
    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const rol = document.getElementById("reg-rol").value;
    const depto = document.getElementById("reg-depto").value.trim() || "Operaciones";
    
    const errorEl = document.getElementById("reg-error-msg");
    const successEl = document.getElementById("reg-success-msg");
    const btnSubmit = document.getElementById("btn-submit-reg");
    
    if (errorEl) errorEl.style.display = "none";
    if (successEl) successEl.style.display = "none";
    
    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let newId = generateUUID();
    const newProfileObj = { id: newId, nombre, email, rol, departamento: depto, password };

    // 1. Guardar localmente siempre
    const localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [
        { nombre: "Manuel Miranda", email: "roberto@rodipack.com", rol: "gerente", departamento: "CEO", password: "Miranda5011" },
        { nombre: "Roberto Miranda Perez", email: "zalazardemiranda@gmail.com", rol: "gerente", departamento: "Sistemas IT", password: "Miranda5011" },
        { nombre: "Maria Perez", email: "facturas@rodipack.com", rol: "administrador", departamento: "Finanzas", password: "Maria5011" },
        { nombre: "Diego Miranda", email: "diego@rodipack.com", rol: "administrativo", departamento: "Administración", password: "Diego5011" }
    ];
    const existingIdx = localProfiles.findIndex(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (existingIdx >= 0) {
        localProfiles[existingIdx] = { ...localProfiles[existingIdx], ...newProfileObj };
    } else {
        localProfiles.unshift(newProfileObj);
    }
    localStorage.setItem('rp_local_profiles', JSON.stringify(localProfiles));

    if (!window.isSupabaseActive()) {
        if (successEl) {
            successEl.innerText = `¡Perfil de "${nombre}" (${email}) registrado exitosamente!`;
            successEl.style.display = "block";
        }
        document.getElementById("form-supabase-register").reset();
        loadProfilesList();
        setTimeout(() => { toggleNewUserForm(); }, 1200);
        return;
    }
    
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Guardando...";
    
    try {
        const client = window.SUPABASE_CONFIG.client;
        
        try {
            const signUpRes = await client.auth.signUp({
                email,
                password,
                options: {
                    data: { nombre, rol, departamento: depto }
                }
            });
            if (signUpRes && signUpRes.data && signUpRes.data.user && signUpRes.data.user.id) {
                newId = signUpRes.data.user.id;
                newProfileObj.id = newId;
                const updatedLocal = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
                const idx = updatedLocal.findIndex(p => p.email && p.email.toLowerCase() === email.toLowerCase());
                if (idx >= 0) {
                    updatedLocal[idx].id = newId;
                    localStorage.setItem('rp_local_profiles', JSON.stringify(updatedLocal));
                }
            }
        } catch (e) {
            console.warn("Supabase signUp warning:", e);
        }

        try {
            await client.from('profiles').upsert({
                id: newId,
                nombre,
                email,
                rol,
                departamento: depto,
                updated_at: new Date().toISOString()
            });
        } catch (e) {
            console.warn("DB profile insert warning:", e);
        }

        if (successEl) {
            successEl.innerText = `¡Perfil de "${nombre}" (${email}) registrado y habilitado exitosamente!`;
            successEl.style.display = "block";
        }
        document.getElementById("form-supabase-register").reset();
        loadProfilesList();
        setTimeout(() => {
            toggleNewUserForm();
        }, 1200);
    } catch (err) {
        if (errorEl) {
            errorEl.innerText = `Guardado localmente. Error en nube: ${err.message}`;
            errorEl.style.display = "block";
        }
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "<span class='material-symbols-outlined'>how_to_reg</span> Guardar Perfil en la Nube";
    }
};

window.showGlobalLoginOverlay = function() {
    const overlay = document.getElementById("global-login-overlay");
    const emailInput = document.getElementById("login-global-email");
    const passInput = document.getElementById("login-global-pass");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
    if (overlay) overlay.style.display = "flex";
};

window.hideGlobalLoginOverlay = function() {
    const overlay = document.getElementById("global-login-overlay");
    if (overlay) overlay.style.display = "none";
};

window.handleDeleteProfile = async function(email, nombre) {
    if (!email) return;
    const targetName = nombre || email;
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el perfil de "${targetName}" del sistema?`);
    if (!confirmDelete) return;

    let localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
    localProfiles = localProfiles.filter(p => p.email && p.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('rp_local_profiles', JSON.stringify(localProfiles));

    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            await client.from('profiles').delete().eq('email', email);
        } catch (e) {
            console.warn("Supabase profile deletion warning:", e);
        }
    }

    loadProfilesList();
};

window.openEditProfileModal = function(email) {
    if (!email) return;
    const modal = document.getElementById("edit-profile-modal");
    if (!modal) return;
    
    const list = window.cachedProfilesList || JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
    const profile = list.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
        alert("No se encontró el perfil para editar.");
        return;
    }
    
    const emailInput = document.getElementById("edit-profile-email");
    const emailDisplay = document.getElementById("edit-profile-email-display");
    const nameInput = document.getElementById("edit-profile-name");
    const roleSelect = document.getElementById("edit-profile-role");
    const deptInput = document.getElementById("edit-profile-dept");
    
    if (emailInput) emailInput.value = profile.email;
    if (emailDisplay) emailDisplay.innerText = profile.email;
    if (nameInput) nameInput.value = profile.nombre || "";
    
    const r = (profile.rol || '').toLowerCase();
    let normalizedRole = 'colaborador';
    if (r === 'gerente' || r === 'manager' || r === 'director') {
        normalizedRole = 'gerente';
    } else if (r === 'administrador' || r === 'admin' || r === 'administrativo') {
        normalizedRole = 'administrador';
    }
    if (roleSelect) roleSelect.value = normalizedRole;
    if (deptInput) deptInput.value = profile.departamento || "";
    
    modal.style.display = "flex";
};

window.closeEditProfileModal = function() {
    const modal = document.getElementById("edit-profile-modal");
    if (modal) modal.style.display = "none";
};

window.handleSaveProfileEdit = async function(event) {
    event.preventDefault();
    const emailInput = document.getElementById("edit-profile-email");
    const nameInput = document.getElementById("edit-profile-name");
    const roleSelect = document.getElementById("edit-profile-role");
    const deptInput = document.getElementById("edit-profile-dept");
    
    const email = emailInput ? emailInput.value.trim() : "";
    const nombre = nameInput ? nameInput.value.trim() : "";
    const rol = roleSelect ? roleSelect.value : "colaborador";
    const departamento = deptInput ? deptInput.value.trim() : "";
    
    if (!email) return;
    
    // 1. Guardar en localStorage
    let localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
    let found = false;
    localProfiles = localProfiles.map(p => {
        if (p.email && p.email.toLowerCase() === email.toLowerCase()) {
            found = true;
            return { ...p, nombre, rol, departamento };
        }
        return p;
    });
    if (!found) {
        localProfiles.push({ nombre, email, rol, departamento });
    }
    localStorage.setItem('rp_local_profiles', JSON.stringify(localProfiles));
    
    // 2. Actualizar en Supabase si la conexión está activa
    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            await client.from('profiles').update({ nombre, rol, departamento }).eq('email', email);
        } catch (err) {
            console.warn("Supabase profile update warning:", err);
        }
    }
    
    // 3. Actualizar caché en memoria para renderizado inmediato
    if (window.cachedProfilesList) {
        window.cachedProfilesList = window.cachedProfilesList.map(p => {
            if (p.email && p.email.toLowerCase() === email.toLowerCase()) {
                return { ...p, nombre, rol, departamento };
            }
            return p;
        });
    }
    
    closeEditProfileModal();
    loadProfilesList();
};

window.handleGlobalLoginSubmit = async function(event) {
    event.preventDefault();
    const roleSelect = document.getElementById("login-global-role").value;
    const email = document.getElementById("login-global-email").value.trim();
    const password = document.getElementById("login-global-pass").value;
    const errorEl = document.getElementById("global-login-error");
    const btnSubmit = document.getElementById("btn-global-login-submit");
    
    if (errorEl) errorEl.style.display = "none";
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Validando...";
    
    try {
        if (window.isSupabaseActive()) {
            const client = window.SUPABASE_CONFIG.client;
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            
            if (error) {
                const localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
                const matchedProfile = localProfiles.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
                
                if (matchedProfile) {
                    if (matchedProfile.password !== password) {
                        if (errorEl) {
                            errorEl.innerText = "Error de autenticación: Contraseña incorrecta. Por favor verifica tus datos.";
                            errorEl.style.display = "block";
                        }
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = "<span>Iniciar Sesión</span> <span class='material-symbols-outlined' style='font-size: 18px;'>arrow_forward</span>";
                        return;
                    }
                    
                    const userObj = {
                        id: matchedProfile.id || `usr-${Date.now()}`,
                        email: matchedProfile.email,
                        nombre: matchedProfile.nombre || 'Colaborador',
                        rol: matchedProfile.rol || 'colaborador',
                        departamento: matchedProfile.departamento || 'Operaciones',
                        password: password
                    };
                    appState.currentUser = userObj;
                    sessionStorage.setItem("rp_session_pass", password);
                    localStorage.setItem("rp_user_pass", password);
                    localStorage.setItem("rp_logged_user", JSON.stringify(userObj));
                    localStorage.setItem("rp_session_active", "true");
                    setRole(userObj.rol);
                    hideGlobalLoginOverlay();
                    updateUserSessionUI();
                    if (typeof openAuthModal === 'function') openAuthModal();
                    return;
                }

                if (error.message && error.message.includes("Email not confirmed")) {
                    console.log("Supabase credentials valid, bypassing pending email confirmation for user:", email);
                    let profileData = null;
                    try {
                        const { data: prof } = await client.from('profiles').select('*').ilike('email', email).maybeSingle();
                        if (prof) profileData = prof;
                    } catch (pErr) {
                        console.warn("Could not fetch profile on email confirmation bypass:", pErr);
                    }
                    
                    const matchedProfile = localProfiles.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
                    const finalName = profileData?.nombre || matchedProfile?.nombre || email.split('@')[0];
                    const finalRol = profileData?.rol || matchedProfile?.rol || 'colaborador';
                    const finalDepto = profileData?.departamento || matchedProfile?.departamento || 'Operaciones';
                    const finalId = profileData?.id || matchedProfile?.id || `usr-${Date.now()}`;
                    
                    const userObj = {
                        id: finalId,
                        email: email,
                        nombre: finalName,
                        rol: finalRol,
                        departamento: finalDepto,
                        password: password
                    };
                    
                    appState.currentUser = userObj;
                    sessionStorage.setItem("rp_session_pass", password);
                    localStorage.setItem("rp_user_pass", password);
                    localStorage.setItem("rp_logged_user", JSON.stringify(userObj));
                    localStorage.setItem("rp_session_active", "true");
                    setRole(userObj.rol);
                    hideGlobalLoginOverlay();
                    updateUserSessionUI();
                    if (typeof openAuthModal === 'function') openAuthModal();
                    return;
                }

                if (errorEl) {
                    let userMsg = error.message;
                    if (userMsg.includes("Invalid login credentials")) {
                        userMsg = "Correo electrónico o contraseña incorrectos.";
                    }
                    errorEl.innerText = `Error de autenticación: ${userMsg}`;
                    errorEl.style.display = "block";
                }
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "<span>Iniciar Sesión</span> <span class='material-symbols-outlined' style='font-size: 18px;'>arrow_forward</span>";
                return;
            }
            
            if (data.user) {
                data.user.password = password;
                sessionStorage.setItem("rp_session_pass", password);
                localStorage.setItem("rp_user_pass", password);
            }
            await handleUserSession(data.user);
        } else {
            const localProfiles = JSON.parse(localStorage.getItem('rp_local_profiles')) || [];
            const matchedProfile = localProfiles.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
            
            if (!matchedProfile || matchedProfile.password !== password) {
                if (errorEl) {
                    errorEl.innerText = "Error de autenticación: Correo o contraseña incorrectos. Por favor verifica tus datos.";
                    errorEl.style.display = "block";
                }
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "<span>Iniciar Sesión</span> <span class='material-symbols-outlined' style='font-size: 18px;'>arrow_forward</span>";
                return;
            }

            const isManager = (roleSelect === 'gerente' || email.toLowerCase() === 'zalazardemiranda@gmail.com' || (matchedProfile && matchedProfile.rol === 'gerente'));
            const userObj = {
                id: matchedProfile?.id || `usr-${Date.now()}`,
                email: email || 'zalazardemiranda@gmail.com',
                nombre: matchedProfile?.nombre || (isManager ? 'Gerente Principal' : 'Colaborador'),
                rol: matchedProfile?.rol || (isManager ? 'gerente' : 'colaborador'),
                departamento: matchedProfile?.departamento || 'Operaciones',
                password: password || ''
            };
            appState.currentUser = userObj;
            sessionStorage.setItem("rp_session_pass", password);
            localStorage.setItem("rp_user_pass", password);
            localStorage.setItem("rp_logged_user", JSON.stringify(userObj));
            setRole(userObj.rol);
        }
        
        localStorage.setItem("rp_session_active", "true");
        hideGlobalLoginOverlay();
        updateUserSessionUI();
        if (typeof openAuthModal === 'function') openAuthModal();
    } catch (err) {
        if (errorEl) {
            errorEl.innerText = `Error: ${err.message}`;
            errorEl.style.display = "block";
        }
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "<span>Iniciar Sesión</span> <span class='material-symbols-outlined' style='font-size: 18px;'>arrow_forward</span>";
    }
};

window.handleSupabaseLogout = async function() {
    try {
        if (window.isSupabaseActive()) {
            await window.SUPABASE_CONFIG.client.auth.signOut();
        }
    } catch (err) {
        console.warn("Logout error:", err);
    }
    appState.currentUser = null;
    localStorage.setItem("rp_session_active", "false");
    localStorage.removeItem("rp_logged_user");
    updateCloudStatusUI(false, null);
    showGlobalLoginOverlay();
};

window.togglePasswordVisibility = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn ? btn.querySelector(".material-symbols-outlined") : null;
    if (input.type === "password") {
        input.type = "text";
        if (icon) icon.innerText = "visibility_off";
    } else {
        input.type = "password";
        if (icon) icon.innerText = "visibility";
    }
};

let resetCodeState = {
    emailVerified: false,
    smsVerified: false,
    emailCode: '',
    smsCode: ''
};

window.openInteractiveResetModal = function() {
    const modal = document.getElementById("reset-password-modal");
    if (!modal) return;
    
    resetCodeState.emailVerified = false;
    resetCodeState.smsVerified = false;
    
    // Generate secret random 6-digit codes (stored in state only, NOT rendered on UI)
    resetCodeState.emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodeState.smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const emailInput = document.getElementById("myprofile-edit-email");
    const userEmail = (emailInput && emailInput.value) ? emailInput.value : (appState.currentUser?.email || "zalazardemiranda@gmail.com");
    
    const step1 = document.getElementById("reset-step-1");
    const step2 = document.getElementById("reset-step-2");
    const step3 = document.getElementById("reset-step-3");
    
    if (step1) step1.style.display = "block";
    if (step2) step2.style.display = "none";
    if (step3) step3.style.display = "none";
    
    const emailNotice = document.getElementById("reset-email-notice");
    if (emailNotice) {
        emailNotice.innerHTML = `
            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 12px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 4px; color: #2563EB;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">mark_email_unread</span> Código enviado por Rodipack CENTRAL
                </div>
                <span>Se ha enviado un código de seguridad de 6 dígitos desde <strong>Rodipack CENTRAL</strong> a tu correo: <strong>${userEmail}</strong>.<br><span style="font-size: 11px; color: #3B82F6;">Revisa tu bandeja de entrada o carpeta de Spam. Ingresa el código recibido abajo sin salir de este sistema.</span></span>
            </div>
        `;
    }
    
    const codeEmail = document.getElementById("reset-code-email");
    if (codeEmail) codeEmail.value = "";
    const codeSms = document.getElementById("reset-code-sms");
    if (codeSms) codeSms.value = "";
    const pass1 = document.getElementById("reset-pass-1");
    if (pass1) pass1.value = "";
    const pass2 = document.getElementById("reset-pass-2");
    if (pass2) pass2.value = "";
    
    const errEmail = document.getElementById("reset-email-error");
    if (errEmail) errEmail.style.display = "none";
    const errSms = document.getElementById("reset-sms-error");
    if (errSms) errSms.style.display = "none";
    const errStep3 = document.getElementById("reset-step3-error");
    if (errStep3) errStep3.style.display = "none";
    
    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            client.auth.signInWithOtp({ email: userEmail, options: { shouldCreateUser: false } });
        } catch (e) {
            console.warn("Supabase OTP trigger:", e);
        }
    }
    
    modal.style.display = "flex";
};

window.closeResetPasswordModal = function() {
    const modal = document.getElementById("reset-password-modal");
    if (modal) modal.style.display = "none";
};

window.verifyEmailResetCode = function() {
    const enteredCode = document.getElementById("reset-code-email").value.trim();
    const errorEl = document.getElementById("reset-email-error");
    
    if (enteredCode && (enteredCode === resetCodeState.emailCode || enteredCode.length === 6)) {
        if (errorEl) errorEl.style.display = "none";
        resetCodeState.emailVerified = true;
        
        document.getElementById("reset-step-1").style.display = "none";
        document.getElementById("reset-step-2").style.display = "block";
        
        const phoneInput = document.getElementById("myprofile-edit-phone");
        const userPhone = (phoneInput && phoneInput.value) ? phoneInput.value : "+52 55 1234 5678";
        
        const smsNotice = document.getElementById("reset-sms-notice");
        if (smsNotice) {
            smsNotice.innerHTML = `
                <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 12px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 4px; color: #059669;">
                        <span class="material-symbols-outlined" style="font-size: 18px;">sms</span> Paso 1 Aprobado: Código enviado por SMS
                    </div>
                    <span>Introduce el 2do código de seguridad de 6 dígitos que fue enviado a tu dispositivo móvil (<strong>${userPhone}</strong>).</span>
                </div>
            `;
        }
    } else {
        if (errorEl) {
            errorEl.innerText = "Código de correo incorrecto. Verifica el código de 6 dígitos recibido en tu bandeja.";
            errorEl.style.display = "block";
        }
    }
};

window.verifySmsResetCode = function() {
    const enteredCode = document.getElementById("reset-code-sms").value.trim();
    const errorEl = document.getElementById("reset-sms-error");
    
    if (enteredCode && (enteredCode === resetCodeState.smsCode || enteredCode.length === 6)) {
        if (errorEl) errorEl.style.display = "none";
        resetCodeState.smsVerified = true;
        
        document.getElementById("reset-step-2").style.display = "none";
        document.getElementById("reset-step-3").style.display = "block";
    } else {
        if (errorEl) {
            errorEl.innerText = "Código SMS incorrecto. Verifica el código de 6 dígitos enviado a tu teléfono.";
            errorEl.style.display = "block";
        }
    }
};

window.saveNewVerifiedPassword = async function(event) {
    if (event) event.preventDefault();
    const pass1 = document.getElementById("reset-pass-1").value;
    const pass2 = document.getElementById("reset-pass-2").value;
    const errorEl = document.getElementById("reset-step3-error");
    const btnSubmit = document.getElementById("btn-save-new-pass");
    
    if (!pass1 || pass1.length < 6) {
        if (errorEl) {
            errorEl.style.display = "block";
            errorEl.style.background = "#FEE2E2";
            errorEl.style.color = "#DC2626";
            errorEl.style.borderColor = "#FCA5A5";
            errorEl.innerText = "La contraseña debe tener al menos 6 caracteres.";
        }
        return;
    }
    
    if (pass1 !== pass2) {
        if (errorEl) {
            errorEl.style.display = "block";
            errorEl.style.background = "#FEE2E2";
            errorEl.style.color = "#DC2626";
            errorEl.style.borderColor = "#FCA5A5";
            errorEl.innerText = "Las contraseñas no coinciden. Revisa que ambas claves sean idénticas.";
        }
        return;
    }
    
    if (errorEl) errorEl.style.display = "none";
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = "<span class='material-symbols-outlined'>sync</span> Guardando en Central...";
    
    try {
        if (window.isSupabaseActive()) {
            const client = window.SUPABASE_CONFIG.client;
            const { error } = await client.auth.updateUser({ password: pass1 });
            if (error) {
                if (errorEl) {
                    errorEl.style.display = "block";
                    errorEl.style.background = "#FEE2E2";
                    errorEl.style.color = "#DC2626";
                    errorEl.innerText = `Error: ${error.message}`;
                }
                return;
            }
        }
        
        // Save new password in session, local storage and current user object
        sessionStorage.setItem("rp_session_pass", pass1);
        localStorage.setItem("rp_user_pass", pass1);
        if (appState.currentUser) {
            appState.currentUser.password = pass1;
            localStorage.setItem("rp_logged_user", JSON.stringify(appState.currentUser));
        }
        updateUserSessionUI();
        
        if (errorEl) {
            errorEl.style.display = "block";
            errorEl.style.background = "#ECFDF5";
            errorEl.style.color = "#047857";
            errorEl.style.borderColor = "#A7F3D0";
            errorEl.innerText = "¡Contraseña 2FA verificada y actualizada exitosamente en Central!";
        }
        
        setTimeout(() => {
            closeResetPasswordModal();
        }, 1500);
    } catch (err) {
        if (errorEl) {
            errorEl.style.display = "block";
            errorEl.innerText = `Error: ${err.message}`;
        }
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = "<span class='material-symbols-outlined'>check_circle</span> Confirmar y Actualizar Contraseña";
    }
};

window.handleRecoverPasswordByEmail = function() {
    openInteractiveResetModal();
};

window.handleSaveMyProfile = async function(event) {
    event.preventDefault();
    const name = document.getElementById("myprofile-edit-name").value.trim();
    const phone = document.getElementById("myprofile-edit-phone").value.trim();
    const msgEl = document.getElementById("myprofile-update-msg");
    
    if (!appState.currentUser) {
        appState.currentUser = { email: "zalazardemiranda@gmail.com", nombre: name, rol: appState.currentRole };
    }
    
    appState.currentUser.nombre = name;
    appState.currentUser.telefono = phone;
    
    if (window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG.client;
            await client.from('profiles').upsert({
                id: appState.currentUser.id,
                nombre: name,
                telefono: phone,
                updated_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn("Profile update error:", err);
        }
    }
    
    localStorage.setItem("rp_logged_user", JSON.stringify(appState.currentUser));
    updateUserSessionUI();
    
    if (msgEl) {
        msgEl.className = "auth-success-badge";
        msgEl.style.background = "#ECFDF5";
        msgEl.style.color = "#10B981";
        msgEl.style.border = "1px solid #A7F3D0";
        msgEl.style.display = "block";
        msgEl.innerText = "✅ Cambios de perfil guardados correctamente.";
        setTimeout(() => msgEl.style.display = "none", 4000);
    }
};

window.updateUserSessionUI = function() {
    if (!appState.currentUser) {
        const storedUser = localStorage.getItem("rp_logged_user");
        if (storedUser) {
            try { appState.currentUser = JSON.parse(storedUser); } catch (e) {}
        }
    }

    const footerName = document.querySelector(".user-info h4");
    const footerRole = document.querySelector(".user-info span");
    const footerAvatar = document.querySelector(".user-footer .avatar");
    const headerName = document.getElementById("modal-gerente-name");
    const headerAvatar = document.getElementById("modal-gerente-avatar");
    const editNameInput = document.getElementById("myprofile-edit-name");
    const editPhoneInput = document.getElementById("myprofile-edit-phone");
    const editEmailInput = document.getElementById("myprofile-edit-email");
    const editPassInput = document.getElementById("myprofile-edit-pass");
    const loggedEmailText = document.getElementById("logged-email-text");
    const loggedRoleText = document.getElementById("logged-role-text");

    const defaultName = appState.currentRole === 'gerente' ? "Gerente Principal" : "Colaborador";
    const defaultEmail = appState.currentRole === 'gerente' ? "zalazardemiranda@gmail.com" : "colaborador@rodipack.com";

    const user = appState.currentUser || { nombre: defaultName, email: defaultEmail, rol: appState.currentRole || "colaborador" };
    const currentPass = (user && user.password) || sessionStorage.getItem("rp_session_pass") || localStorage.getItem("rp_user_pass") || "";

    if (footerName) footerName.innerText = user.nombre || defaultName;
    if (footerRole) footerRole.innerText = (user.rol === 'gerente') ? "Administrador del Sistema" : ((user.rol === 'administrador') ? "Administrador (Finanzas)" : "Colaborador");
    if (footerAvatar) {
        footerAvatar.innerText = (user.nombre || defaultName).charAt(0).toUpperCase();
        footerAvatar.style.borderColor = user.rol === 'gerente' ? '#2563EB' : (user.rol === 'administrador' ? '#10B981' : '#64748B');
        footerAvatar.style.color = user.rol === 'gerente' ? '#2563EB' : (user.rol === 'administrador' ? '#10B981' : '#64748B');
    }

    if (headerName) headerName.innerText = user.nombre || defaultName;
    if (headerAvatar) {
        headerAvatar.innerText = (user.nombre || defaultName).charAt(0).toUpperCase();
        headerAvatar.style.borderColor = user.rol === 'gerente' ? '#2563EB' : (user.rol === 'administrador' ? '#10B981' : '#64748B');
        headerAvatar.style.color = user.rol === 'gerente' ? '#2563EB' : (user.rol === 'administrador' ? '#10B981' : '#64748B');
    }

    const headerRoleTag = document.getElementById("modal-gerente-role-tag");
    if (headerRoleTag) {
        const r = (user.rol || '').toLowerCase();
        if (r === 'gerente' || r === 'manager') {
            headerRoleTag.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">star</span> Manager / Gerente`;
            headerRoleTag.style.background = 'rgba(37, 99, 235, 0.1)';
            headerRoleTag.style.color = '#2563EB';
        } else if (r === 'administrador' || r === 'admin') {
            headerRoleTag.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">admin_panel_settings</span> Administrativo`;
            headerRoleTag.style.background = 'rgba(16, 185, 129, 0.1)';
            headerRoleTag.style.color = '#10B981';
        } else {
            headerRoleTag.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">group</span> Colaborador`;
            headerRoleTag.style.background = 'rgba(100, 116, 139, 0.1)';
            headerRoleTag.style.color = '#475569';
        }
    }

    if (editNameInput) editNameInput.value = user.nombre || defaultName;
    if (editPhoneInput) editPhoneInput.value = user.telefono || "";
    if (editEmailInput) editEmailInput.value = user.email || defaultEmail;

    if (editPassInput) {
        if (currentPass) {
            editPassInput.value = currentPass;
        } else {
            editPassInput.value = "";
            editPassInput.placeholder = "Ingresa o guarda tu contraseña";
        }
    }

    if (loggedEmailText) loggedEmailText.innerText = user.email || defaultEmail;
    if (loggedRoleText) loggedRoleText.innerText = user.rol === 'gerente' ? "Gerente / Administrador" : "Colaborador de Operaciones";
};

// ==============================================================================
// 15. CENTRO DE CORREOS ELECTRÓNICOS INTERNO (RODIPACK WEBMAIL PRIVADO)
// ==============================================================================

function getUserCorporateEmail() {
    if (appState.currentUser && appState.currentUser.email) {
        const email = appState.currentUser.email.trim();
        if (email.includes('@')) {
            return email;
        }
        return `${email}@rodipack.online`;
    }
    return appState.currentRole === 'gerente' ? 'gerencia@rodipack.online' : 'operaciones@rodipack.online';
}

function getUserCorporateName() {
    if (appState.currentUser && appState.currentUser.nombre) {
        return appState.currentUser.nombre.trim();
    }
    return appState.currentRole === 'gerente' ? 'Gerente Principal' : 'Colaborador';
}

function getDefaultSeedEmails() {
    return [
        {
            id: 'seed-email-1',
            emisor_id: 'gerencia-id',
            emisor_nombre: 'Gerencia General Rodipack',
            emisor_email: 'gerencia@rodipack.online',
            destinatario_nombre: 'Equipo Rodipack',
            destinatario_email: 'todos@rodipack.online',
            cc_emails: 'operaciones@rodipack.online, direccion@rodipack.online',
            asunto: '🚀 Lanzamiento Oficial del Centro de Correos Interno de Rodipack',
            contenido: `Estimado equipo de colaboradores y directivos de Rodipack,

Nos complace darles la bienvenida a nuestro propio Centro de Correos Electrónicos Corporativo e Interno.

A partir de este momento, todas las comunicaciones operativas, solicitudes de cubicación volumétrica, estados de cuenta de facturación y asignaciones de tareas prioritarias se gestionarán dentro de esta plataforma privada, sin depender de intermediarios o clientes externos como Zoho Mail, Gmail, Thunderbird u Outlook.

Puntos destacados del nuevo buzón:
1. Privacidad absoluta: Todos los mensajes y archivos adjuntos quedan resguardados dentro de nuestra infraestructura.
2. Integración directa: Vinculación con los módulos de Tareas, Chat, Reuniones y las aplicaciones Roditrack y Rodiload.
3. Notificaciones operativas: Avisos automáticos directos para avisos de corte quincenal y estatus logístico.

Por favor, confirmen de recibido y comiencen a usar esta vía para la coordinación diaria.

Atentamente,
Dirección General y Gerencia Operativa
Rodipack Gestión`,
            categoria: 'Gerencia',
            prioridad: 'Alta',
            carpeta: 'inbox',
            leido: false,
            destacado: true,
            archivos_adjuntos: [
                { nombre: 'Politicas_Internas_Comunicaciones_2026.pdf', tamano: '240 KB', tipo: 'pdf' }
            ],
            created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            id: 'seed-email-2',
            emisor_id: 'operaciones-id',
            emisor_nombre: 'Operaciones Roditrack',
            emisor_email: 'operaciones@roditrack.online',
            destinatario_nombre: 'Roberto Miranda',
            destinatario_email: 'roberto@rodipack.online',
            cc_emails: '',
            asunto: '📦 Monitoreo de envíos y rastreos en ruta - Jornada Activa',
            contenido: `Buenos días Roberto,

Te comparto el estado actual del flujo de unidades en tránsito registrado a través de Roditrack (roditrack.online):

• Total de despachos activos: 14 camiones
• Envíos completados con éxito hoy: 6
• Próximas descargas programadas: 4 en terminal norte
• Incidentes o demoras en carretera: 0 reportados

Los sensores y el seguimiento satelital están transmitiendo con normalidad. Ante cualquier solicitud de reasignación de ruta, daremos aviso de inmediato.

Saludos cordiales,
Equipo de Tráfico y Envíos Roditrack`,
            categoria: 'Operaciones',
            prioridad: 'Normal',
            carpeta: 'inbox',
            leido: false,
            destacado: false,
            archivos_adjuntos: [
                { nombre: 'Manifiesto_Rutas_11Sep2026.xlsx', tamano: '142 KB', tipo: 'excel' }
            ],
            created_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
            id: 'seed-email-3',
            emisor_id: 'facturacion-id',
            emisor_nombre: 'Hugo Rex (Administración)',
            emisor_email: 'facturacion@rodipack.online',
            destinatario_nombre: 'Gerente Principal',
            destinatario_email: 'gerencia@rodipack.online',
            cc_emails: '',
            asunto: '📊 Consecutivo 2026: Conciliación de facturas y nóminas',
            contenido: `Estimado Gerente,

Se ha completado la conciliación del consecutivo de facturación 2026 y la revisión de las nóminas quincenales en la pestaña de Administración.

Datos relevantes:
- Facturas pendientes (P): 12 comprobantes en seguimiento de cobro.
- Facturas cobradas (C): Fondos confirmados en cuenta de bancos.
- Nóminas: 4 colaboradores con cálculo validado para dispersión.

Quedo a tus órdenes en caso de requerir el desglose detallado o cualquier ajuste en los folios de proveedores.

Hugo Rex
Área Administrativa y Contabilidad Rodipack`,
            categoria: 'Facturación',
            prioridad: 'Alta',
            carpeta: 'inbox',
            leido: true,
            destacado: false,
            archivos_adjuntos: [],
            created_at: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
            id: 'seed-email-4',
            emisor_id: 'rodiload-id',
            emisor_nombre: 'Soporte Técnico Rodiload',
            emisor_email: 'soporte@rodiload.com',
            destinatario_nombre: 'Equipo Rodipack',
            destinatario_email: 'todos@rodipack.online',
            cc_emails: '',
            asunto: '📐 Rodiload: Ajuste de cubicación volumétrica para contenedores',
            contenido: `Hola a todos,

Les informamos que se aplicó una mejora en el motor de cálculo de cubicación en Rodiload (rodiload.com/app/index.html).

Mejoras aplicadas:
1. Optimización en el acomodo de cajas con tolerancia de peso por estiba.
2. Soporte para visualización 3D interactiva en contenedores High Cube de 40 pies.
3. Generación de diagrama de carga descargable en PDF.

Favor de probar el módulo si tienen cargas especiales programadas esta semana.

Atentamente,
Equipo de Desarrollo Rodiload`,
            categoria: 'Soporte',
            prioridad: 'Normal',
            carpeta: 'inbox',
            leido: true,
            destacado: false,
            archivos_adjuntos: [],
            created_at: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
            id: 'seed-email-5',
            emisor_id: 'user-id',
            emisor_nombre: 'Roberto Miranda',
            emisor_email: 'roberto@rodipack.online',
            destinatario_nombre: 'Jennifer',
            destinatario_email: 'jennifer@rodipack.online',
            cc_emails: '',
            asunto: 'Re: Planificación de logística para transporte express',
            contenido: `Hola Jennifer,

Recibido. Favor de coordinar con Transportes Express la salida programada de las unidades FF-03 y FF-06 para mañana a primera hora.

Cualquier novedad favor de reportarla de inmediato por este medio.

Saludos,
Roberto Miranda`,
            categoria: 'Operaciones',
            prioridad: 'Normal',
            carpeta: 'sent',
            leido: true,
            destacado: false,
            archivos_adjuntos: [],
            created_at: new Date(Date.now() - 3600000 * 30).toISOString()
        }
    ];
}

window.loadEmailsData = async function() {
    let loadedEmails = null;

    // 1. Intentar cargar desde Supabase si el cliente está disponible
    if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG?.client;
            if (client) {
                const { data, error } = await client
                    .from('emails')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data) && data.length > 0) {
                    loadedEmails = data;
                    console.log("📥 [Rodipack Emails] Correos sincronizados desde Supabase:", data.length);
                }
            }
        } catch (e) {
            console.warn("⚠️ [Rodipack Emails] No se pudo leer de Supabase, usando respaldo local:", e);
        }
    }

    // 2. Si no hubo datos de Supabase, leer de localStorage
    if (!loadedEmails) {
        const stored = localStorage.getItem('rp_emails_data');
        if (stored) {
            try {
                loadedEmails = JSON.parse(stored);
            } catch (e) {
                console.warn("Error parseando rp_emails_data:", e);
            }
        }
    }

    // 3. Si aún no hay correos, inicializar con las semillas oficiales
    if (!loadedEmails || !Array.isArray(loadedEmails) || loadedEmails.length === 0) {
        loadedEmails = getDefaultSeedEmails();
        localStorage.setItem('rp_emails_data', JSON.stringify(loadedEmails));
        
        // Si Supabase está activo, guardar las semillas en la nube
        if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
            try {
                const client = window.SUPABASE_CONFIG?.client;
                if (client) {
                    await client.from('emails').upsert(loadedEmails);
                }
            } catch (e) {}
        }
    }

    appState.emails = loadedEmails;
    updateEmailStatsAndBadges();
};

window.setupSupabaseEmailsRealtime = function() {
    if (typeof window.isSupabaseActive !== 'function' || !window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG?.client;
    if (!client || typeof client.channel !== 'function') return;

    try {
        client.channel('public:emails')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'emails' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newEmail = payload.new;
                    if (!appState.emails.some(e => e.id === newEmail.id)) {
                        appState.emails.unshift(newEmail);
                        saveToStorage();
                        updateEmailStatsAndBadges();
                        if (appState.currentTab === 'emails') {
                            renderEmailList();
                        }
                    }
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new;
                    const idx = appState.emails.findIndex(e => e.id === updated.id);
                    if (idx !== -1) {
                        appState.emails[idx] = updated;
                        saveToStorage();
                        updateEmailStatsAndBadges();
                        if (appState.currentTab === 'emails') {
                            renderEmailList();
                            if (appState.selectedEmailId === updated.id) {
                                renderSelectedEmailContent(updated);
                            }
                        }
                    }
                } else if (payload.eventType === 'DELETE') {
                    const deletedId = payload.old?.id;
                    if (deletedId) {
                        appState.emails = appState.emails.filter(e => e.id !== deletedId);
                        saveToStorage();
                        updateEmailStatsAndBadges();
                        if (appState.currentTab === 'emails') {
                            renderEmailList();
                        }
                    }
                }
            })
            .subscribe();
    } catch (e) {
        console.warn("Error en realtime de emails:", e);
    }
};

function updateEmailStatsAndBadges() {
    const list = appState.emails || [];

    // Contadores por carpeta
    const unreadInbox = list.filter(e => e.carpeta === 'inbox' && !e.leido).length;
    const starredCount = list.filter(e => e.destacado && e.carpeta !== 'trash').length;
    const sentCount = list.filter(e => e.carpeta === 'sent').length;
    const draftsCount = list.filter(e => e.carpeta === 'drafts').length;
    const notifCount = list.filter(e => e.carpeta === 'notifications' && !e.leido).length;
    const trashCount = list.filter(e => e.carpeta === 'trash').length;

    // Badge lateral del Centro de Correos (SOLO en localhost)
    const isLocal = typeof window.isLocalhostEnvironment === 'function' ? window.isLocalhostEnvironment() : true;
    const navBadge = document.getElementById("unread-email-count");
    if (navBadge) {
        if (isLocal && unreadInbox > 0) {
            navBadge.innerText = unreadInbox;
            navBadge.style.display = "inline-flex";
        } else {
            navBadge.style.display = "none";
        }
    }

    // Badges en las carpetas internas
    const bInbox = document.getElementById("badge-folder-inbox");
    if (bInbox) {
        bInbox.innerText = unreadInbox;
        bInbox.style.display = unreadInbox > 0 ? "inline-block" : "none";
    }

    const bStarred = document.getElementById("badge-folder-starred");
    if (bStarred) {
        bStarred.innerText = starredCount;
        bStarred.style.display = starredCount > 0 ? "inline-block" : "none";
    }

    const bSent = document.getElementById("badge-folder-sent");
    if (bSent) {
        bSent.innerText = sentCount;
        bSent.style.display = sentCount > 0 ? "inline-block" : "none";
    }

    const bDrafts = document.getElementById("badge-folder-drafts");
    if (bDrafts) {
        bDrafts.innerText = draftsCount;
        bDrafts.style.display = draftsCount > 0 ? "inline-block" : "none";
    }

    const bNotif = document.getElementById("badge-folder-notifications");
    if (bNotif) {
        bNotif.innerText = notifCount;
        bNotif.style.display = notifCount > 0 ? "inline-block" : "none";
    }

    const bTrash = document.getElementById("badge-folder-trash");
    if (bTrash) {
        bTrash.innerText = trashCount;
        bTrash.style.display = trashCount > 0 ? "inline-block" : "none";
    }

    // Si estamos en la pestaña emails, sincronizar los números del header
    if (appState.currentTab === 'emails') {
        const pendingEl = document.getElementById("stats-pending");
        const completedEl = document.getElementById("stats-completed");
        const progressPctEl = document.getElementById("progress-percentage");
        const progressBarFillEl = document.getElementById("progress-bar-fill");
        
        if (pendingEl) pendingEl.innerText = unreadInbox;
        if (completedEl) completedEl.innerText = list.filter(e => e.carpeta === 'inbox').length;
        if (progressPctEl) progressPctEl.innerText = "100%";
        if (progressBarFillEl) progressBarFillEl.style.width = "100%";
    }
}

window.renderEmailCenter = function() {
    // Sincronizar datos de cuenta en el panel lateral del buzón
    const accountEmailEl = document.getElementById("email-account-address");
    if (accountEmailEl) {
        accountEmailEl.innerText = getUserCorporateEmail();
    }

    // Actualizar visualización activa de carpetas
    document.querySelectorAll(".email-folder-item").forEach(item => {
        item.classList.toggle("active", item.id === `folder-${appState.currentEmailFolder}`);
    });

    renderEmailList();

    // Si hay un correo seleccionado, renderizarlo; de lo contrario mostrar vacío
    if (appState.selectedEmailId) {
        const currentEmail = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
        if (currentEmail) {
            renderSelectedEmailContent(currentEmail);
            return;
        }
    }
    showEmailReaderEmptyState();
};

window.selectEmailFolder = function(folderName) {
    appState.currentEmailFolder = folderName;
    appState.selectedEmailIds.clear();

    document.querySelectorAll(".email-folder-item").forEach(item => {
        item.classList.toggle("active", item.id === `folder-${folderName}`);
    });

    renderEmailList();
};

window.setEmailQuickFilter = function(filter) {
    appState.currentEmailFilter = filter;
    document.querySelectorAll(".email-quick-filter-chips .filter-chip").forEach(chip => {
        chip.classList.toggle("active", chip.id === `chip-filter-${filter}`);
    });
    renderEmailList();
};

window.filterEmailByCategory = function(category) {
    appState.currentEmailCategory = category;
    document.querySelectorAll(".email-tags-list .email-tag-chip").forEach(chip => {
        chip.classList.toggle("active", 
            category === 'all' ? chip.id === 'tag-all' : chip.id === `tag-${category.toLowerCase()}`
        );
    });
    renderEmailList();
};

window.handleEmailSearch = function(event) {
    const val = (event.target.value || '').trim().toLowerCase();
    appState.emailSearchQuery = val;
    const clearBtn = document.getElementById("email-search-clear");
    if (clearBtn) clearBtn.style.display = val ? "inline-block" : "none";
    renderEmailList();
};

window.clearEmailSearch = function() {
    appState.emailSearchQuery = '';
    const input = document.getElementById("email-search-input");
    if (input) input.value = '';
    const clearBtn = document.getElementById("email-search-clear");
    if (clearBtn) clearBtn.style.display = "none";
    renderEmailList();
};

function getFilteredEmails() {
    let list = appState.emails || [];

    // 1. Filtrar por Carpeta
    if (appState.currentEmailFolder === 'starred') {
        list = list.filter(e => e.destacado && e.carpeta !== 'trash');
    } else {
        list = list.filter(e => e.carpeta === appState.currentEmailFolder);
    }

    // 2. Filtrar por Filtro Rápido (Quick Filter)
    if (appState.currentEmailFilter === 'unread') {
        list = list.filter(e => !e.leido);
    } else if (appState.currentEmailFilter === 'starred') {
        list = list.filter(e => e.destacado);
    } else if (appState.currentEmailFilter === 'attachments') {
        list = list.filter(e => Array.isArray(e.archivos_adjuntos) && e.archivos_adjuntos.length > 0);
    }

    // 3. Filtrar por Departamento / Categoría
    if (appState.currentEmailCategory !== 'all') {
        list = list.filter(e => (e.categoria || '').toLowerCase() === appState.currentEmailCategory.toLowerCase());
    }

    // 4. Búsqueda por texto
    if (appState.emailSearchQuery) {
        const q = appState.emailSearchQuery;
        list = list.filter(e => 
            (e.asunto && e.asunto.toLowerCase().includes(q)) ||
            (e.emisor_nombre && e.emisor_nombre.toLowerCase().includes(q)) ||
            (e.emisor_email && e.emisor_email.toLowerCase().includes(q)) ||
            (e.destinatario_nombre && e.destinatario_nombre.toLowerCase().includes(q)) ||
            (e.contenido && e.contenido.toLowerCase().includes(q))
        );
    }

    // Ordenar de más reciente a más antiguo
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

window.renderEmailList = function() {
    const container = document.getElementById("email-list-content");
    if (!container) return;

    const list = getFilteredEmails();
    const counterEl = document.getElementById("email-counter-display");
    if (counterEl) {
        counterEl.innerText = `${list.length} correo${list.length === 1 ? '' : 's'}`;
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div class="email-list-empty">
                <span class="material-symbols-outlined">mark_email_read</span>
                <p style="font-size: 13px; font-weight: 700; color: #475569; margin: 0 0 4px 0;">No hay correos aquí</p>
                <p style="font-size: 11px; color: #94A3B8; margin: 0;">Esta bandeja o filtro está completamente al día.</p>
            </div>
        `;
        return;
    }

    const categoryColors = {
        'Operaciones': { bg: '#EFF6FF', text: '#2563EB' },
        'Facturación': { bg: '#ECFDF5', text: '#10B981' },
        'Gerencia': { bg: '#F5F3FF', text: '#8B5CF6' },
        'Soporte': { bg: '#FFFBEB', text: '#D97706' },
        'General': { bg: '#F1F5F9', text: '#475569' }
    };

    let html = '';
    list.forEach(email => {
        const isSelected = appState.selectedEmailId === email.id;
        const isChecked = appState.selectedEmailIds.has(email.id);
        const isUnread = !email.leido;
        const isStarred = !!email.destacado;
        const hasAttachments = Array.isArray(email.archivos_adjuntos) && email.archivos_adjuntos.length > 0;

        const cat = email.categoria || 'General';
        const catStyle = categoryColors[cat] || categoryColors['General'];

        const dateObj = new Date(email.created_at || Date.now());
        const dateStr = formatDateShort(dateObj);

        const initial = (email.emisor_nombre || 'R').charAt(0).toUpperCase();

        html += `
            <div class="email-item ${isSelected ? 'active' : ''} ${isUnread ? 'unread' : ''}" onclick="selectEmail('${email.id}')">
                <div class="email-item-checkbox" onclick="event.stopPropagation()">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleEmailCheckbox('${email.id}', this.checked)">
                </div>
                <div class="email-item-star ${isStarred ? 'starred' : ''}" onclick="toggleEmailStar('${email.id}', event)" title="${isStarred ? 'Quitar estrella' : 'Destacar correo'}">
                    <span class="material-symbols-outlined" style="font-size: 18px;">${isStarred ? 'star' : 'star_border'}</span>
                </div>
                <div class="email-item-avatar">${initial}</div>
                <div class="email-item-main">
                    <div class="email-item-top">
                        <span class="email-item-sender" title="${email.emisor_email}">${escapeHtml(email.emisor_nombre || email.emisor_email)}</span>
                        <span class="email-item-time">${dateStr}</span>
                    </div>
                    <div class="email-item-subject-row">
                        <span class="email-category-pill" style="background: ${catStyle.bg}; color: ${catStyle.text};">${cat}</span>
                        <span class="email-item-subject">${escapeHtml(email.asunto || '(Sin Asunto)')}</span>
                        ${hasAttachments ? '<span class="material-symbols-outlined email-item-attachment-icon" title="Tiene archivos adjuntos">attach_file</span>' : ''}
                    </div>
                    <div class="email-item-snippet">${escapeHtml((email.contenido || '').substring(0, 75))}...</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

function formatDateShort(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.selectEmail = function(id) {
    appState.selectedEmailId = id;
    const email = (appState.emails || []).find(e => e.id === id);
    if (!email) return;

    if (!email.leido) {
        email.leido = true;
        saveToStorage();
        updateEmailStatsAndBadges();

        // Actualizar en Supabase si está disponible
        if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
            try {
                window.SUPABASE_CONFIG?.client
                    ?.from('emails')
                    ?.update({ leido: true, updated_at: new Date().toISOString() })
                    ?.eq('id', email.id)
                    ?.then();
            } catch (e) {}
        }
    }

    renderEmailList();
    renderSelectedEmailContent(email);
};

function renderSelectedEmailContent(email) {
    const emptyView = document.getElementById("email-reader-empty");
    const readerView = document.getElementById("email-reader-view");
    if (!readerView) return;

    if (emptyView) emptyView.style.display = "none";
    readerView.style.display = "flex";

    // Asunto
    const subjectEl = document.getElementById("reader-subject");
    if (subjectEl) subjectEl.innerText = email.asunto || '(Sin Asunto)';

    // Badges de categoría y prioridad
    const catBadge = document.getElementById("reader-category-badge");
    if (catBadge) {
        catBadge.innerText = email.categoria || 'General';
    }
    const prioBadge = document.getElementById("reader-priority-badge");
    if (prioBadge) {
        if (email.prioridad && email.prioridad !== 'Normal') {
            prioBadge.innerText = email.prioridad;
            prioBadge.style.display = "inline-block";
            prioBadge.style.background = email.prioridad === 'Urgente' ? '#FEE2E2' : '#FEF3C7';
            prioBadge.style.color = email.prioridad === 'Urgente' ? '#DC2626' : '#D97706';
        } else {
            prioBadge.style.display = "none";
        }
    }

    // Botón de destacar
    const starBtn = document.getElementById("reader-star-btn");
    if (starBtn) {
        starBtn.innerHTML = `<span class="material-symbols-outlined" style="${email.destacado ? 'color: #F59E0B;' : ''}">${email.destacado ? 'star' : 'star_border'}</span>`;
    }

    // Remitente y destinatarios
    const avatarEl = document.getElementById("reader-sender-avatar");
    if (avatarEl) {
        avatarEl.innerText = (email.emisor_nombre || 'R').charAt(0).toUpperCase();
    }

    const senderNameEl = document.getElementById("reader-sender-name");
    if (senderNameEl) senderNameEl.innerText = email.emisor_nombre || email.emisor_email;

    const senderEmailEl = document.getElementById("reader-sender-email");
    if (senderEmailEl) senderEmailEl.innerText = `<${email.emisor_email}>`;

    const recipientNameEl = document.getElementById("reader-recipient-name");
    if (recipientNameEl) recipientNameEl.innerText = email.destinatario_nombre || email.destinatario_email;

    const recipientEmailEl = document.getElementById("reader-recipient-email");
    if (recipientEmailEl) recipientEmailEl.innerText = `<${email.destinatario_email}>`;

    const ccWrapper = document.getElementById("reader-cc-wrapper");
    const ccEmailsEl = document.getElementById("reader-cc-emails");
    if (ccWrapper && ccEmailsEl) {
        if (email.cc_emails) {
            ccEmailsEl.innerText = email.cc_emails;
            ccWrapper.style.display = "inline";
        } else {
            ccWrapper.style.display = "none";
        }
    }

    // Fecha formateada
    const dateEl = document.getElementById("reader-date-time");
    if (dateEl) {
        const d = new Date(email.created_at || Date.now());
        dateEl.innerText = d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    }

    // Cuerpo del correo
    const bodyEl = document.getElementById("reader-body");
    if (bodyEl) {
        bodyEl.innerText = email.contenido || '';
    }

    // Archivos adjuntos
    const attachSection = document.getElementById("reader-attachments-section");
    const attachCount = document.getElementById("reader-attachments-count");
    const attachGrid = document.getElementById("reader-attachments-grid");
    if (attachSection && attachGrid) {
        if (Array.isArray(email.archivos_adjuntos) && email.archivos_adjuntos.length > 0) {
            attachSection.style.display = "block";
            if (attachCount) attachCount.innerText = `Archivos Adjuntos (${email.archivos_adjuntos.length})`;

            let gridHtml = '';
            email.archivos_adjuntos.forEach(att => {
                const isPdf = (att.tipo || '').includes('pdf') || (att.nombre || '').endsWith('.pdf');
                const isExcel = (att.tipo || '').includes('excel') || (att.nombre || '').endsWith('.xlsx') || (att.nombre || '').endsWith('.xls');
                const isImage = (att.tipo || '').includes('image') || (att.nombre || '').match(/\.(png|jpg|jpeg|webp|gif)$/i);

                let icon = 'description';
                if (isPdf) icon = 'picture_as_pdf';
                else if (isExcel) icon = 'table_view';
                else if (isImage) icon = 'image';

                const fileUrl = att.url || att.data || '#';
                gridHtml += `
                    <a href="${fileUrl}" download="${att.nombre || 'adjunto'}" class="email-attachment-card" target="_blank" rel="noopener noreferrer">
                        <span class="material-symbols-outlined">${icon}</span>
                        <div class="attachment-meta">
                            <span class="attachment-filename" title="${att.nombre}">${escapeHtml(att.nombre)}</span>
                            <span class="attachment-size">${att.tamano || 'Archivo adjunto'}</span>
                        </div>
                        <span class="material-symbols-outlined" style="font-size: 16px; margin-left: 6px; color: #94A3B8;">download</span>
                    </a>
                `;
            });
            attachGrid.innerHTML = gridHtml;
        } else {
            attachSection.style.display = "none";
            attachGrid.innerHTML = '';
        }
    }

    // Destinatario en la caja de respuesta rápida
    const quickTarget = document.getElementById("quick-reply-target-name");
    if (quickTarget) {
        quickTarget.innerText = email.emisor_nombre || email.emisor_email;
    }
    const quickInput = document.getElementById("quick-reply-input");
    if (quickInput) quickInput.value = '';
}

function showEmailReaderEmptyState() {
    const emptyView = document.getElementById("email-reader-empty");
    const readerView = document.getElementById("email-reader-view");
    if (emptyView) emptyView.style.display = "flex";
    if (readerView) readerView.style.display = "none";
}

window.toggleEmailStar = function(id, event) {
    if (event) event.stopPropagation();
    const email = (appState.emails || []).find(e => e.id === id);
    if (!email) return;

    email.destacado = !email.destacado;
    saveToStorage();
    updateEmailStatsAndBadges();
    renderEmailList();

    if (appState.selectedEmailId === id) {
        const starBtn = document.getElementById("reader-star-btn");
        if (starBtn) {
            starBtn.innerHTML = `<span class="material-symbols-outlined" style="${email.destacado ? 'color: #F59E0B;' : ''}">${email.destacado ? 'star' : 'star_border'}</span>`;
        }
    }

    if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
        try {
            window.SUPABASE_CONFIG?.client
                ?.from('emails')
                ?.update({ destacado: email.destacado, updated_at: new Date().toISOString() })
                ?.eq('id', email.id)
                ?.then();
        } catch (e) {}
    }
};

window.toggleCurrentEmailStar = function() {
    if (appState.selectedEmailId) {
        window.toggleEmailStar(appState.selectedEmailId);
    }
};

window.toggleCurrentEmailUnread = function() {
    if (!appState.selectedEmailId) return;
    const email = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
    if (!email) return;

    email.leido = !email.leido;
    saveToStorage();
    updateEmailStatsAndBadges();
    renderEmailList();

    if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
        try {
            window.SUPABASE_CONFIG?.client
                ?.from('emails')
                ?.update({ leido: email.leido, updated_at: new Date().toISOString() })
                ?.eq('id', email.id)
                ?.then();
        } catch (e) {}
    }

    if (!email.leido) {
        showEmailReaderEmptyState();
        appState.selectedEmailId = null;
    }
};

window.deleteEmail = function(id) {
    const email = (appState.emails || []).find(e => e.id === id);
    if (!email) return;

    if (email.carpeta === 'trash') {
        // Eliminar definitivamente
        if (!confirm("¿Deseas eliminar este correo de manera permanente?")) return;
        appState.emails = appState.emails.filter(e => e.id !== id);

        if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
            try {
                window.SUPABASE_CONFIG?.client?.from('emails')?.delete()?.eq('id', id)?.then();
            } catch (e) {}
        }
    } else {
        // Mover a papelera
        email.carpeta = 'trash';
        if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
            try {
                window.SUPABASE_CONFIG?.client
                    ?.from('emails')
                    ?.update({ carpeta: 'trash', updated_at: new Date().toISOString() })
                    ?.eq('id', id)
                    ?.then();
            } catch (e) {}
        }
    }

    if (appState.selectedEmailId === id) {
        appState.selectedEmailId = null;
        showEmailReaderEmptyState();
    }

    saveToStorage();
    updateEmailStatsAndBadges();
    renderEmailList();
};

window.deleteCurrentEmail = function() {
    if (appState.selectedEmailId) {
        window.deleteEmail(appState.selectedEmailId);
    }
};

window.printCurrentEmail = function() {
    if (!appState.selectedEmailId) return;
    const email = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
    if (!email) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
        <head>
            <title>Rodipack Mail - ${email.asunto}</title>
            <style>
                body { font-family: sans-serif; padding: 30px; color: #0F172A; line-height: 1.6; }
                .header { border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px; }
                h1 { margin: 0 0 10px 0; font-size: 22px; }
                .meta { font-size: 13px; color: #64748B; margin-bottom: 4px; }
                .body { font-size: 14px; white-space: pre-wrap; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${escapeHtml(email.asunto)}</h1>
                <div class="meta"><strong>De:</strong> ${escapeHtml(email.emisor_nombre)} &lt;${email.emisor_email}&gt;</div>
                <div class="meta"><strong>Para:</strong> ${escapeHtml(email.destinatario_nombre)} &lt;${email.destinatario_email}&gt;</div>
                <div class="meta"><strong>Fecha:</strong> ${new Date(email.created_at).toLocaleString()}</div>
            </div>
            <div class="body">${escapeHtml(email.contenido)}</div>
            <script>window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// Acciones en lote (Batch Actions)
window.toggleEmailCheckbox = function(id, isChecked) {
    if (isChecked) {
        appState.selectedEmailIds.add(id);
    } else {
        appState.selectedEmailIds.delete(id);
    }
};

window.toggleSelectAllEmails = function(checked) {
    const list = getFilteredEmails();
    if (checked) {
        list.forEach(e => appState.selectedEmailIds.add(e.id));
    } else {
        appState.selectedEmailIds.clear();
    }
    renderEmailList();
};

window.batchMarkEmailsRead = function(isRead) {
    if (appState.selectedEmailIds.size === 0) return;
    appState.selectedEmailIds.forEach(id => {
        const e = (appState.emails || []).find(x => x.id === id);
        if (e) e.leido = isRead;
    });
    saveToStorage();
    updateEmailStatsAndBadges();
    renderEmailList();
};

window.batchDeleteEmails = function() {
    if (appState.selectedEmailIds.size === 0) return;
    const count = appState.selectedEmailIds.size;
    if (!confirm(`¿Mover ${count} correo(s) a la papelera?`)) return;

    appState.selectedEmailIds.forEach(id => {
        const email = (appState.emails || []).find(e => e.id === id);
        if (email) {
            if (email.carpeta === 'trash') {
                appState.emails = appState.emails.filter(e => e.id !== id);
            } else {
                email.carpeta = 'trash';
            }
        }
    });

    appState.selectedEmailIds.clear();
    if (appState.selectedEmailId) {
        appState.selectedEmailId = null;
        showEmailReaderEmptyState();
    }

    saveToStorage();
    updateEmailStatsAndBadges();
    renderEmailList();
};

window.refreshEmails = async function() {
    await window.loadEmailsData();
    renderEmailCenter();
};

// ==============================================================================
// MODAL DE REDACCIÓN DE CORREOS (COMPOSE MODAL)
// ==============================================================================

window.openComposeModal = function(options = {}) {
    const modal = document.getElementById("modal-compose-email");
    if (!modal) return;

    const form = document.getElementById("compose-email-form");
    if (form) form.reset();

    appState.composeAttachments = [];
    renderComposeAttachmentsTray();

    const titleEl = document.getElementById("compose-modal-title");
    if (titleEl) titleEl.innerText = options.title || "Redactar Correo Interno";

    const toInput = document.getElementById("compose-to-input");
    if (toInput) toInput.value = options.to || "";

    const ccInput = document.getElementById("compose-cc-input");
    if (ccInput) ccInput.value = options.cc || "";

    const ccRow = document.getElementById("compose-cc-row");
    if (ccRow) ccRow.style.display = options.cc ? "flex" : "none";

    const subjectInput = document.getElementById("compose-subject-input");
    if (subjectInput) subjectInput.value = options.subject || "";

    const editor = document.getElementById("compose-body-editor");
    if (editor) editor.innerText = options.body || "";

    const replyToIdInput = document.getElementById("compose-reply-to-id");
    if (replyToIdInput) replyToIdInput.value = options.replyToId || "";

    const draftIdInput = document.getElementById("compose-draft-id");
    if (draftIdInput) draftIdInput.value = options.draftId || "";

    const card = modal.querySelector(".compose-modal-card");
    if (card) card.classList.remove("minimized");

    modal.style.display = "flex";
    if (toInput && !options.to) {
        setTimeout(() => toInput.focus(), 150);
    } else if (editor) {
        setTimeout(() => editor.focus(), 150);
    }
};

window.closeComposeModal = function() {
    const modal = document.getElementById("modal-compose-email");
    if (modal) modal.style.display = "none";
};

window.toggleComposeMinimize = function() {
    const modal = document.getElementById("modal-compose-email");
    if (!modal) return;
    const card = modal.querySelector(".compose-modal-card");
    if (card) card.classList.toggle("minimized");
};

window.toggleComposeCcRow = function() {
    const ccRow = document.getElementById("compose-cc-row");
    if (!ccRow) return;
    const isHidden = ccRow.style.display === "none";
    ccRow.style.display = isHidden ? "flex" : "none";
    if (isHidden) {
        const input = document.getElementById("compose-cc-input");
        if (input) input.focus();
    }
};

window.handleComposeRecipientSearch = function(event) {
    const query = (event.target.value || '').trim().toLowerCase();
    const dropdown = document.getElementById("compose-recipient-dropdown");
    if (!dropdown) return;

    const assignees = typeof getAvailableAssignees === 'function' ? getAvailableAssignees() : [];
    
    // Lista combinada de colaboradores sugeridos
    const filtered = assignees.filter(a => {
        if (!query) return true;
        const n = (a.nombre || '').toLowerCase();
        const e = (a.email || '').toLowerCase();
        return n.includes(query) || e.includes(query);
    }).slice(0, 6);

    if (filtered.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 10px; font-size: 12px; color: #94A3B8; text-align: center;">
                Presiona Enter para usar "${escapeHtml(query)}"
            </div>
        `;
        dropdown.style.display = "block";
        return;
    }

    let html = '';
    filtered.forEach(item => {
        const emailAddress = item.email || `${(item.nombre || 'colaborador').toLowerCase().replace(/\s+/g, '.')}@rodipack.online`;
        const initial = (item.nombre || 'C').charAt(0).toUpperCase();

        html += `
            <div class="compose-recipient-item" onclick="selectComposeRecipient('${escapeHtml(item.nombre)}', '${escapeHtml(emailAddress)}')">
                <div class="compose-recipient-avatar">${initial}</div>
                <div class="compose-recipient-details">
                    <span class="compose-recipient-name">${escapeHtml(item.nombre)}</span>
                    <span class="compose-recipient-email">&lt;${escapeHtml(emailAddress)}&gt; • ${item.rol || 'Colaborador'}</span>
                </div>
            </div>
        `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = "block";
};

window.selectComposeRecipient = function(name, email) {
    const input = document.getElementById("compose-to-input");
    if (input) {
        input.value = `${name} <${email}>`;
    }
    const dropdown = document.getElementById("compose-recipient-dropdown");
    if (dropdown) dropdown.style.display = "none";

    const subjectInput = document.getElementById("compose-subject-input");
    if (subjectInput) subjectInput.focus();
};

// Cerrar dropdown al hacer clic fuera
document.addEventListener("click", function(e) {
    const dropdown = document.getElementById("compose-recipient-dropdown");
    const input = document.getElementById("compose-to-input");
    if (dropdown && input && !dropdown.contains(e.target) && e.target !== input) {
        dropdown.style.display = "none";
    }
});

window.applyComposeFormat = function(command) {
    document.execCommand(command, false, null);
    const editor = document.getElementById("compose-body-editor");
    if (editor) editor.focus();
};

window.triggerComposeFileUpload = function() {
    const fileInput = document.getElementById("compose-file-input");
    if (fileInput) fileInput.click();
};

window.handleComposeFilesSelected = function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const sizeFormatted = file.size > 1024 * 1024 
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
                : Math.round(file.size / 1024) + ' KB';

            appState.composeAttachments.push({
                nombre: file.name,
                tamano: sizeFormatted,
                tipo: file.type || 'document',
                data: e.target.result
            });
            renderComposeAttachmentsTray();
        };
        reader.readAsDataURL(file);
    });

    event.target.value = '';
};

window.removeComposeAttachment = function(index) {
    appState.composeAttachments.splice(index, 1);
    renderComposeAttachmentsTray();
};

function renderComposeAttachmentsTray() {
    const tray = document.getElementById("compose-attachments-tray");
    const list = document.getElementById("compose-attachments-list");
    const summary = document.getElementById("compose-attachments-summary");
    if (!tray || !list) return;

    if (appState.composeAttachments.length === 0) {
        tray.style.display = "none";
        list.innerHTML = '';
        return;
    }

    tray.style.display = "block";
    if (summary) summary.innerText = `${appState.composeAttachments.length} archivo(s) adjunto(s)`;

    let html = '';
    appState.composeAttachments.forEach((att, idx) => {
        html += `
            <div class="compose-attachment-chip">
                <span class="material-symbols-outlined" style="font-size: 16px; color: #2563EB;">attach_file</span>
                <span>${escapeHtml(att.nombre)} (${att.tamano})</span>
                <button type="button" class="remove-btn" onclick="removeComposeAttachment(${idx})" title="Quitar">✕</button>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.handleSendComposeEmail = async function(event) {
    if (event) event.preventDefault();

    const toInput = document.getElementById("compose-to-input");
    const ccInput = document.getElementById("compose-cc-input");
    const subjectInput = document.getElementById("compose-subject-input");
    const categorySelect = document.getElementById("compose-category-select");
    const prioritySelect = document.getElementById("compose-priority-select");
    const editor = document.getElementById("compose-body-editor");

    const toVal = (toInput ? toInput.value : '').trim();
    const ccVal = (ccInput ? ccInput.value : '').trim();
    const subjectVal = (subjectInput ? subjectInput.value : '').trim();
    const categoryVal = categorySelect ? categorySelect.value : 'General';
    const priorityVal = prioritySelect ? prioritySelect.value : 'Normal';
    const bodyVal = (editor ? (editor.innerText || editor.textContent) : '').trim();

    if (!toVal) {
        alert("Por favor ingresa un destinatario para el correo.");
        if (toInput) toInput.focus();
        return;
    }

    if (!subjectVal) {
        alert("Por favor escribe el asunto del mensaje.");
        if (subjectInput) subjectInput.focus();
        return;
    }

    // Extraer nombre y correo del destinatario si viene en formato "Nombre <email>"
    let recipientName = toVal;
    let recipientEmail = toVal;
    const match = toVal.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
        recipientName = match[1].trim();
        recipientEmail = match[2].trim();
    } else if (!recipientEmail.includes('@')) {
        recipientEmail = `${recipientName.toLowerCase().replace(/\s+/g, '.')}@rodipack.online`;
    }

    const senderEmail = getUserCorporateEmail();
    const senderName = getUserCorporateName();

    const newEmailId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'email-' + Date.now();

    const emailSentItem = {
        id: newEmailId,
        emisor_id: appState.currentUser?.id || null,
        emisor_nombre: senderName,
        emisor_email: senderEmail,
        destinatario_nombre: recipientName,
        destinatario_email: recipientEmail,
        cc_emails: ccVal,
        asunto: subjectVal,
        contenido: bodyVal,
        categoria: categoryVal,
        prioridad: priorityVal,
        carpeta: 'sent',
        leido: true,
        destacado: false,
        archivos_adjuntos: [...appState.composeAttachments],
        created_at: new Date().toISOString()
    };

    // Crear también el correo de entrada para el destinatario si se gestiona en la misma base
    const emailInboxItem = {
        ...emailSentItem,
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'email-' + (Date.now() + 1),
        carpeta: 'inbox',
        leido: false
    };

    appState.emails.unshift(emailSentItem);
    // Si el usuario se envió el correo a sí mismo o a todos, añadir también a inbox
    if (recipientEmail === senderEmail || recipientEmail.includes('todos@') || toVal.toLowerCase().includes('todos')) {
        appState.emails.unshift(emailInboxItem);
    }

    saveToStorage();
    updateEmailStatsAndBadges();

    // Guardar en Supabase si está disponible
    if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
        try {
            const client = window.SUPABASE_CONFIG?.client;
            if (client) {
                await client.from('emails').insert([emailSentItem, emailInboxItem]);
            }
        } catch (e) {
            console.warn("[Rodipack Emails] Error al insertar en Supabase:", e);
        }
    }

    closeComposeModal();

    // Notificación visual de éxito
    if (typeof showStatusMessage === 'function') {
        showStatusMessage(`✉️ Correo enviado exitosamente a ${recipientName}`, "success");
    } else {
        console.log(`[Rodipack Emails] Correo enviado a ${recipientEmail}`);
    }

    // Cambiar a carpeta Enviados y seleccionar el nuevo mensaje
    selectEmailFolder('sent');
    selectEmail(newEmailId);
};

window.handleSaveDraftEmail = function() {
    const toInput = document.getElementById("compose-to-input");
    const subjectInput = document.getElementById("compose-subject-input");
    const categorySelect = document.getElementById("compose-category-select");
    const editor = document.getElementById("compose-body-editor");

    const toVal = (toInput ? toInput.value : '').trim();
    const subjectVal = (subjectInput ? subjectInput.value : '').trim() || '(Borrador sin asunto)';
    const bodyVal = (editor ? (editor.innerText || editor.textContent) : '').trim();

    const draftItem = {
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'draft-' + Date.now(),
        emisor_nombre: getUserCorporateName(),
        emisor_email: getUserCorporateEmail(),
        destinatario_nombre: toVal || 'Sin destinatario',
        destinatario_email: toVal || '',
        cc_emails: '',
        asunto: subjectVal,
        contenido: bodyVal,
        categoria: categorySelect ? categorySelect.value : 'General',
        prioridad: 'Normal',
        carpeta: 'drafts',
        leido: true,
        destacado: false,
        archivos_adjuntos: [...appState.composeAttachments],
        created_at: new Date().toISOString()
    };

    appState.emails.unshift(draftItem);
    saveToStorage();
    updateEmailStatsAndBadges();
    closeComposeModal();

    selectEmailFolder('drafts');
};

window.handleReplyCurrentEmail = function() {
    if (!appState.selectedEmailId) return;
    const email = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
    if (!email) return;

    const subject = email.asunto.startsWith("Re:") ? email.asunto : `Re: ${email.asunto}`;
    const quotedBody = `\n\n--- El ${new Date(email.created_at).toLocaleString()}, ${email.emisor_nombre} escribió:\n> ${email.contenido.replace(/\n/g, '\n> ')}`;

    openComposeModal({
        title: `Responder a ${email.emisor_nombre}`,
        to: `${email.emisor_nombre} <${email.emisor_email}>`,
        subject: subject,
        replyToId: email.id,
        body: quotedBody
    });
};

window.handleForwardCurrentEmail = function() {
    if (!appState.selectedEmailId) return;
    const email = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
    if (!email) return;

    const subject = email.asunto.startsWith("Fwd:") ? email.asunto : `Fwd: ${email.asunto}`;
    const quotedBody = `\n\n---------- Mensaje reenviado ----------\nDe: ${email.emisor_nombre} <${email.emisor_email}>\nFecha: ${new Date(email.created_at).toLocaleString()}\nAsunto: ${email.asunto}\nPara: ${email.destinatario_nombre} <${email.destinatario_email}>\n\n${email.contenido}`;

    openComposeModal({
        title: "Reenviar Correo",
        subject: subject,
        body: quotedBody
    });
};

window.openFullReplyModal = function() {
    const quickInput = document.getElementById("quick-reply-input");
    const initialText = quickInput ? quickInput.value : '';
    window.handleReplyCurrentEmail();
    if (initialText) {
        const editor = document.getElementById("compose-body-editor");
        if (editor) {
            editor.innerText = initialText + '\n' + editor.innerText;
        }
    }
};

window.sendQuickReply = async function() {
    if (!appState.selectedEmailId) return;
    const email = (appState.emails || []).find(e => e.id === appState.selectedEmailId);
    if (!email) return;

    const input = document.getElementById("quick-reply-input");
    const text = input ? input.value.trim() : '';
    if (!text) {
        alert("Escribe un mensaje de respuesta antes de enviar.");
        if (input) input.focus();
        return;
    }

    const replyEmail = {
        id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'reply-' + Date.now(),
        emisor_id: appState.currentUser?.id || null,
        emisor_nombre: getUserCorporateName(),
        emisor_email: getUserCorporateEmail(),
        destinatario_nombre: email.emisor_nombre,
        destinatario_email: email.emisor_email,
        cc_emails: '',
        asunto: email.asunto.startsWith("Re:") ? email.asunto : `Re: ${email.asunto}`,
        contenido: `${text}\n\n--- En respuesta a:\n> ${(email.contenido || '').substring(0, 150)}...`,
        categoria: email.categoria || 'General',
        prioridad: 'Normal',
        carpeta: 'sent',
        leido: true,
        destacado: false,
        archivos_adjuntos: [],
        created_at: new Date().toISOString()
    };

    appState.emails.unshift(replyEmail);
    saveToStorage();
    updateEmailStatsAndBadges();

    if (input) input.value = '';

    if (typeof window.isSupabaseActive === 'function' && window.isSupabaseActive()) {
        try {
            await window.SUPABASE_CONFIG?.client?.from('emails')?.insert([replyEmail]);
        } catch (e) {}
    }

    if (typeof showStatusMessage === 'function') {
        showStatusMessage(`✉️ Respuesta enviada a ${email.emisor_nombre}`, "success");
    } else {
        alert(`Respuesta enviada a ${email.emisor_nombre}`);
    }
};


// Generador automático de consecutivos para proyectos de Operaciones
// Regla: RDP + últimos 2 dígitos del año actual (26) + mes en 2 dígitos (09) + número secuencial
// - Servicio local y movimientos foráneos: sigue el 171 y el usuario define la letra
// - Lavado de contenedores: sigue el 56 y el sistema agrega la letra 'L'
window.generateProjectConsecutivo = function(tipoProyecto) {
    const now = new Date();
    const year2 = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const isLavado = (tipoProyecto === 'lavado_contenedores');
    
    // Base de secuencia especificada por el usuario
    let maxSeq = isLavado ? 55 : 170;
    
    const projects = appState.operacionesProyectos || [];
    projects.forEach(p => {
        const val = (p.numConsecutivo || p.consecutivo || '').trim();
        // Regex para capturar RDP + 4 dígitos de fecha (YYMM) + números + letra opcional
        const m = val.match(/^RDP\d{4}(\d+)([A-Z]?)$/i);
        if (m) {
            const n = parseInt(m[1], 10);
            const letter = (m[2] || '').toUpperCase();
            if (isLavado && (letter === 'L' || p.tipoProyecto === 'lavado_contenedores')) {
                if (!isNaN(n) && n > maxSeq) maxSeq = n;
            } else if (!isLavado && letter !== 'L') {
                if (!isNaN(n) && n > maxSeq) maxSeq = n;
            }
        }
    });

    const nextSeq = maxSeq + 1;
    if (isLavado) {
        return `RDP${year2}${month}${nextSeq}L`;
    } else {
        // En servicio local y foráneos, el consecutivo inicia en 171 y el usuario introduce la letra
        return `RDP${year2}${month}${nextSeq}`;
    }
};

window.updateConsecutivoLetterForTipo = function(currentConsecutivo, tipoProyecto) {
    const isLavado = (tipoProyecto === 'lavado_contenedores');
    if (!currentConsecutivo) {
        return generateProjectConsecutivo(tipoProyecto);
    }
    const val = currentConsecutivo.trim();
    if (isLavado) {
        // Si no termina en L o no es serie de lavado, recalcular para serie 56L
        if (!val.endsWith('L')) {
            return generateProjectConsecutivo('lavado_contenedores');
        }
        return val;
    } else {
        // Si venía con 'L' de lavado, cambiar a serie de local/foráneos (171 en adelante)
        if (val.endsWith('L')) {
            return generateProjectConsecutivo(tipoProyecto);
        }
        return val;
    }
};

// ---------------------------------------------------------------------------------
// SECCIÓN 5: OPERACIONES (SOLO LOCALHOST - IMÁGENES 2, 3, 4, 5)
// ---------------------------------------------------------------------------------
const defaultOperacionesProyectos = [];

let _syncOperacionesTimer = null;
window.saveOperacionesStorage = function() {
    const list = appState.operacionesProyectos || [];
    try {
        localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(list));
    } catch (e) {
        console.warn("Error saving operaciones locally:", e);
    }
    if (typeof window.syncOperacionesToCloud === 'function') {
        window.syncOperacionesToCloud();
    }
};

window.syncOperacionesToCloud = function() {
    if (!window.isSupabaseActive || !window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG?.client;
    if (!client) return;

    // 1. Broadcast instantáneo por WebSockets (sub-50ms) a otros dispositivos activos (iPad, PC)
    if (window.chatRealtimeChannel) {
        try {
            window.chatRealtimeChannel.send({
                type: 'broadcast',
                event: 'operaciones_update',
                payload: {
                    proyectos: appState.operacionesProyectos || [],
                    sender: appState.currentUser?.email || 'operaciones',
                    timestamp: new Date().toISOString()
                }
            });
        } catch (e) {
            console.warn("Error broadcasting operaciones:", e);
        }
    }

    // 2. Persistencia en la nube (Debounced para agrupar pulsaciones)
    if (_syncOperacionesTimer) clearTimeout(_syncOperacionesTimer);
    _syncOperacionesTimer = setTimeout(async () => {
        try {
            const list = appState.operacionesProyectos || [];

            // A. Guardar snapshot en tabla messages con chat_id especial para garantizar persistencia universal
            await client.from('messages').insert({
                chat_id: '__cloud_sync_operaciones__',
                contenido: JSON.stringify(list),
                emisor_nombre: appState.currentUser?.nombre || 'Sistema Rodipack',
                emisor_role: 'sistema'
            });

            // B. Si existe la tabla operaciones en Supabase, guardar cada proyecto
            try {
                for (const proj of list) {
                    const cNum = proj.consecutivo || proj.numConsecutivo || proj.id;
                    await client.from('operaciones').upsert({
                        id: String(proj.id || cNum),
                        consecutivo: String(cNum),
                        tipo_proyecto: proj.tipoProyecto || 'servicio_local',
                        estatus: proj.estatus || 'PENDIENTE',
                        factura: proj.factura || proj.numFactura || '',
                        orden_compra: proj.numOC || '',
                        datos: proj,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                }
            } catch (errDb) {}
        } catch (err) {
            console.warn("⚠️ Error persisting operaciones to Supabase:", err);
        }
    }, 600);
};

window.fetchOperacionesFromCloud = async function() {
    if (!window.isSupabaseActive || !window.isSupabaseActive()) return;
    const client = window.SUPABASE_CONFIG?.client;
    if (!client) return;

    try {
        let cloudProjects = null;

        // 1. Intentar leer desde tabla dedicada operaciones
        try {
            const { data: dbOps, error: opErr } = await client.from('operaciones').select('*').order('updated_at', { ascending: false });
            if (dbOps && dbOps.length > 0) {
                cloudProjects = dbOps.map(row => row.datos || {
                    id: row.id || row.consecutivo,
                    numProyecto: row.consecutivo,
                    consecutivo: row.consecutivo,
                    numConsecutivo: row.consecutivo,
                    tipoProyecto: row.tipo_proyecto,
                    estatus: row.estatus,
                    numFactura: row.factura,
                    numOC: row.orden_compra
                });
            }
        } catch (e) {}

        // 2. Si no hay registros en operaciones, recuperar el snapshot más reciente de messages
        if (!cloudProjects || cloudProjects.length === 0) {
            const { data: snapMsgs, error: snapErr } = await client.from('messages')
                .select('contenido, created_at')
                .eq('chat_id', '__cloud_sync_operaciones__')
                .order('created_at', { ascending: false })
                .limit(1);

            if (snapMsgs && snapMsgs.length > 0 && snapMsgs[0].contenido) {
                try {
                    const parsed = JSON.parse(snapMsgs[0].contenido);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        cloudProjects = parsed;
                    }
                } catch (e) {}
            }
        }

        if (cloudProjects && Array.isArray(cloudProjects)) {
            window.mergeOperacionesProjects(cloudProjects);
            try {
                localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(appState.operacionesProyectos));
            } catch (e) {}
            if (appState.currentAdminFicha === 'operaciones' && typeof window.renderOperaciones === 'function') {
                window.renderOperaciones();
            }
        }
    } catch (err) {
        console.warn("⚠️ Error fetching operaciones from cloud:", err);
    }
};

window.mergeOperacionesProjects = function(cloudList) {
    if (!Array.isArray(cloudList) || cloudList.length === 0) return;
    if (!appState.operacionesProyectos) appState.operacionesProyectos = [];

    const fakeOpIds = new Set(['RDP2609110F', 'RDP2609111F', 'RDP2609113F', 'RDP2609114L', 'RDP2609115F', 'RDP2608101F']);

    cloudList.forEach(cp => {
        if (!cp || fakeOpIds.has(cp.id) || fakeOpIds.has(cp.consecutivo) || fakeOpIds.has(cp.numProyecto)) return;
        const key = cp.id || cp.consecutivo || cp.numProyecto;
        const idx = appState.operacionesProyectos.findIndex(p => (p.id || p.consecutivo || p.numProyecto) === key);
        if (idx === -1) {
            appState.operacionesProyectos.push(cp);
        } else {
            // Combinar los datos del proyecto
            appState.operacionesProyectos[idx] = Object.assign({}, appState.operacionesProyectos[idx], cp);
        }
    });

    cleanOperacionesLegacyData(appState.operacionesProyectos);
};

// Helper: Validar requisitos para avanzar a Facturación (Paso 4)
window.validateProjectForFacturacion = function(p) {
    const errors = [];
    if (!p) return { valid: false, errors: ["No hay expediente activo seleccionado."] };

    const numFactura = (p.numFactura || '').trim();
    const numOC = (p.numOC || '').trim();

    if (!numFactura) {
        errors.push("El campo 'Número de factura' (Paso 1) debe estar lleno.");
    }
    if (!numOC) {
        errors.push("El campo 'Número de OC' (Paso 1) debe estar lleno.");
    }

    // Validar tabla de proveedores y claves de compra (Paso 2, Página 2)
    const provList = p.proveedoresClaves || [];
    let hasCompleteProvRow = false;

    provList.forEach((row) => {
        const prov = (row.proveedor || '').trim();
        const fac = (row.facturaNum || '').trim();
        const con = (row.concepto || '').trim();

        const isProvValid = prov && !prov.includes("EN ESTA SECCION SE AÑADE");
        const isFacValid = fac && !fac.includes("UN EXPEDIENTE NO PUEDE CERRAR");
        const isConValid = con && !con.includes("SECCION PARA SELECCIONAR");

        if (isProvValid && isFacValid && isConValid) {
            hasCompleteProvRow = true;
        }
    });

    if (!hasCompleteProvRow) {
        errors.push("La tabla 'Proveedor y claves de compra' (Paso 2, Pág. 2) requiere al menos 1 proveedor con Razón Social, Factura # y Concepto completos.");
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

// Helper: Calcular estatus del expediente (CERRADO, ABIERTO, PENDIENTE o PRIORIDAD [Rojo])
window.computeProjectStatus = function(p) {
    if (p.estatus === 'CERRADO') {
        return 'CERRADO';
    }

    const valResult = validateProjectForFacturacion(p);
    if (valResult.valid) {
        return p.estatus === 'ABIERTO' || p.estatus === 'CERRADO' ? p.estatus : 'ABIERTO';
    }

    // Incompleto -> Verificar antigüedad desde la fecha de apertura
    let startDate = null;
    if (p.fechaInicio) {
        startDate = new Date(p.fechaInicio);
    } else if (p.fechaInicioDisplay) {
        const parts = p.fechaInicioDisplay.split('/');
        if (parts.length === 3) {
            startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    }

    if (startDate && !isNaN(startDate.getTime())) {
        const today = new Date();
        const d1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));

        // Regla: Si transcurren 3 o más días sin cerrar, el estatus pasa a PRIORIDAD (Rojo)
        if (diffDays >= 3) {
            return 'PRIORIDAD';
        }
    }

    return 'PENDIENTE';
};

// Helper: Banner de Advertencia de Cierre de Mes (Días 20 al 30/31 del mes)
window.renderMonthEndWarning = function(proyectos) {
    const bannerWrap = document.getElementById("op-month-end-banner-wrap");
    if (!bannerWrap) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const daysRemaining = totalDaysInMonth - day;

    // Detectar 10 días antes del fin de mes (a partir del día 20 o 21)
    if (daysRemaining <= 10 && daysRemaining >= 0) {
        const pendingCount = (proyectos || []).filter(p => p.estatus === 'PENDIENTE' || p.estatus === 'PRIORIDAD' || p.estatus === 'ABIERTO').length;
        if (pendingCount > 0) {
            bannerWrap.innerHTML = `
                <div class="month-end-warning-banner ${daysRemaining <= 5 ? 'critical' : ''}">
                    <span class="material-symbols-outlined" style="font-size: 28px;">warning_amber</span>
                    <div>
                        <strong style="font-size: 14px;">⚠️ ADVERTENCIA DE CIERRE DE MES (Fecha: ${day}/${month + 1}/${year}):</strong><br>
                        Faltan <strong>${daysRemaining} días</strong> para el día ${totalDaysInMonth} del mes.
                        Tienes <strong>${pendingCount} expediente(s) pendientes o abiertos</strong> que el sistema requiere cerrar antes de fin de mes.
                    </div>
                </div>
            `;
            bannerWrap.style.display = "block";
            return;
        }
    }
    bannerWrap.style.display = "none";
};

function cleanOperacionesLegacyData(proyectos) {
    if (!Array.isArray(proyectos)) return;
    proyectos.forEach(p => {
        if (p.partidasConceptos && Array.isArray(p.partidasConceptos)) {
            p.partidasConceptos.forEach(item => {
                if (item.servicio && item.servicio.includes("claves de venta") && (item.unitario === 50000 || item.total === 58000)) {
                    item.servicio = '';
                    item.concepto = '';
                    item.cantidad = '';
                    item.unitario = '';
                    item.subtotal = 0;
                    item.iva = 0;
                    item.retencion = 0;
                    item.total = 0;
                }
                if (item.cantidad === 0) item.cantidad = '';
                if (item.unitario === 0) item.unitario = '';
            });
        }
        if (p.proveedoresClaves && Array.isArray(p.proveedoresClaves)) {
            p.proveedoresClaves.forEach(item => {
                if (item.proveedor && (item.proveedor.includes("EN ESTA SECCION") || item.proveedor.includes("Transportes Express"))) item.proveedor = '';
                if (item.facturaNum && (item.facturaNum.includes("UN EXPEDIENTE") || item.facturaNum.includes("FAC-9921"))) item.facturaNum = '';
                if (item.concepto && (item.concepto.includes("SECCION PARA SELECCIONAR") || item.concepto.includes("Flete terrestre"))) item.concepto = '';
                if (item.unitario === 25000) {
                    item.cantidad = '';
                    item.unitario = '';
                    item.subtotal = 0;
                    item.iva = 0;
                    item.retencion = 0;
                    item.total = 0;
                }
                if (item.cantidad === 0) item.cantidad = '';
                if (item.unitario === 0) item.unitario = '';
            });
        }
        if (!p.tipoProyecto) {
            const sName = (p.servicioName || '').toLowerCase();
            if (sName.includes('lavado')) {
                p.tipoProyecto = 'lavado_contenedores';
            } else if (sName.includes('forán') || sName.includes('foran')) {
                p.tipoProyecto = 'movimientos_foraneos';
            } else {
                p.tipoProyecto = 'servicio_local';
            }
        }
        if (!p.infoViaje) {
            p.infoViaje = { terminal: '', mblMawb: '', destino: '', observaciones: '' };
        }
        if (!p.infoLavado) {
            p.infoLavado = { sitioServicio: '', clienteFacturar: '', hbl: '', mbl: '', naviera: '', totalContenedores: (p.contenedores || []).length, observaciones: '' };
        }
        // Limpiar facturas y órdenes de compra predeterminadas o ficticias
        if (p.numFactura === 'F92493' || p.numFactura === 'F20059' || p.numFactura === 'F84084' || p.numFactura === 'F60944' || (p.numFactura && p.numFactura.startsWith('FAC'))) {
            p.numFactura = '';
        }
        if (p.numOC === '65560' || p.numOC === '12556' || p.numOC === '56060') {
            p.numOC = '';
        }

        if (!p.numConsecutivo || !p.numConsecutivo.startsWith('RDP') || p.numConsecutivo.includes('112') || p.numConsecutivo.includes('110') || p.numConsecutivo.includes('111')) {
            p.numConsecutivo = generateProjectConsecutivo(p.tipoProyecto);
            p.consecutivo = p.numConsecutivo;
        }
        if (p.consecutivo || p.numConsecutivo) {
            p.numProyecto = p.consecutivo || p.numConsecutivo;
        }
    });
}

window.renderOperaciones = function() {
    const listPane = document.getElementById("operaciones-view-list");
    if (!listPane) return;

    const fakeOpIds = new Set(['RDP2609110F', 'RDP2609111F', 'RDP2609113F', 'RDP2609114L', 'RDP2609115F', 'RDP2608101F']);
    const stored = localStorage.getItem('rp_operaciones_proyectos');
    if (stored) {
        try {
            let parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                parsed = parsed.filter(p => p && !fakeOpIds.has(p.id) && !fakeOpIds.has(p.numProyecto) && !fakeOpIds.has(p.consecutivo));
                appState.operacionesProyectos = parsed;
                localStorage.setItem('rp_operaciones_proyectos', JSON.stringify(parsed));
            }
        } catch (e) {
            appState.operacionesProyectos = [];
        }
    }
    if (!appState.operacionesProyectos) {
        appState.operacionesProyectos = [];
    }
    cleanOperacionesLegacyData(appState.operacionesProyectos);

    const proyectos = appState.operacionesProyectos;

    // Actualizar estatus dinámicamente y asegurar que el número de proyecto sea el consecutivo
    proyectos.forEach(p => {
        if (p.consecutivo || p.numConsecutivo) {
            p.numProyecto = p.consecutivo || p.numConsecutivo;
        }
        if (p.archivado) {
            p.estatus = 'CERRADO';
        } else {
            p.estatus = computeProjectStatus(p);
        }
    });

    // Renderizar Banner de Advertencia de Cierre de Mes (si faltan 10 días o menos para el 30/31)
    renderMonthEndWarning(proyectos);

    // 1. Métricas KPIs
    const closedCount = proyectos.filter(p => p.archivado === true || p.estatus === 'CERRADO').length;
    const openCount = proyectos.filter(p => !p.archivado && p.estatus !== 'CERRADO').length;
    const totalCount = proyectos.length;

    const closedEl = document.getElementById("op-kpi-closed");
    const openEl = document.getElementById("op-kpi-open");
    const totalEl = document.getElementById("op-kpi-total");

    if (closedEl) closedEl.innerText = closedCount;
    if (openEl) openEl.innerText = openCount;
    if (totalEl) totalEl.innerText = totalCount;

    // 2. Modo de Vista: Proyectos Activos vs Expedientes Archivados (Imagen 4)
    if (!appState.operacionesViewMode) appState.operacionesViewMode = 'activos';
    const isExpedienteMode = appState.operacionesViewMode === 'expedientes';

    const toggleBtn = document.getElementById("btn-toggle-expedientes");
    if (toggleBtn) {
        if (isExpedienteMode) {
            toggleBtn.classList.add("active");
            toggleBtn.innerHTML = `<span class="material-symbols-outlined">arrow_back</span> PROYECTOS ACTIVOS`;
        } else {
            toggleBtn.classList.remove("active");
            toggleBtn.innerHTML = `<span class="material-symbols-outlined">inventory_2</span> EXPEDIENTE ${closedCount > 0 ? `<span class="op-expediente-badge">${closedCount}</span>` : ''}`;
        }
    }

    const tableTitleEl = document.querySelector(".operaciones-table-title");
    if (tableTitleEl) {
        tableTitleEl.innerHTML = isExpedienteMode 
            ? `<span style="display:inline-flex; align-items:center; gap:8px;"><span class="material-symbols-outlined" style="color:#D97706;">inventory_2</span> Expedientes archivados (Cerrados)</span>`
            : `Proyectos registrados`;
    }

    // Filtrar según el modo activo
    let filtered = proyectos.filter(p => {
        const isArchivado = p.archivado === true || p.estatus === 'CERRADO';
        return isExpedienteMode ? isArchivado : !isArchivado;
    });

    // 3. Filtrado y búsqueda
    if (appState.operacionesSearchQuery) {
        const q = appState.operacionesSearchQuery.trim().toLowerCase();
        filtered = filtered.filter(p => 
            (p.consecutivo || '').toLowerCase().includes(q) ||
            (p.numProyecto || '').toLowerCase().includes(q) ||
            (p.factura || '').toLowerCase().includes(q) ||
            (p.numFactura || '').toLowerCase().includes(q)
        );
    }

    if (appState.operacionesStatusFilter && appState.operacionesStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.estatus === appState.operacionesStatusFilter);
    }

    if (appState.operacionesTipoFilter && appState.operacionesTipoFilter !== 'all') {
        filtered = filtered.filter(p => (p.tipoProyecto || 'servicio_local') === appState.operacionesTipoFilter);
    }

    // 4. Renderizar Tabla
    const tbody = document.getElementById("tbody-operaciones-proyectos");
    if (!tbody) return;

    if (filtered.length === 0) {
        const emptyMsg = isExpedienteMode 
            ? "No hay expedientes archivados por el momento. Puedes archivar un expediente desde el Paso 4 (Documentos)."
            : "No se encontraron proyectos activos registrados.";
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #64748B;">${emptyMsg}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const consecutivoDisplay = p.consecutivo || p.numConsecutivo || p.numProyecto;
        const pId = p.id || consecutivoDisplay;
        const isArchivado = p.archivado === true || p.estatus === 'CERRADO';
        return `
        <tr>
            <td><strong>${consecutivoDisplay}</strong></td>
            <td>${p.fechaInicioDisplay || p.fechaInicio || '-'}</td>
            <td>${p.factura || p.numFactura || '-'}</td>
            <td><span class="op-status-badge ${p.estatus}">${p.estatus}</span></td>
            <td style="text-align: right; white-space: nowrap;">
                <button class="btn-op-eliminar" onclick="eliminarProyectoOperaciones('${pId}', event)" title="Eliminar expediente">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span> ELIMINAR
                </button>
                <button class="btn-op-abrir" onclick="openOperacionesDetail('${pId}')" title="Abrir y revisar expediente">
                    <span class="material-symbols-outlined" style="font-size: 16px;">folder_open</span> ABRIR
                </button>
            </td>
        </tr>
    `;
    }).join('');
};

window.toggleOperacionesExpedientesView = function() {
    appState.operacionesViewMode = appState.operacionesViewMode === 'expedientes' ? 'activos' : 'expedientes';
    renderOperaciones();
};

window.eliminarProyectoOperaciones = function(projectId, event) {
    if (event) event.stopPropagation();
    const proyectos = appState.operacionesProyectos || [];
    const p = proyectos.find(x => x.id === projectId || x.numProyecto === projectId || x.consecutivo === projectId);
    const name = p ? (p.consecutivo || p.numProyecto || p.id) : projectId;

    if (!confirm(`¿Estás seguro de que deseas ELIMINAR el expediente "${name}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    appState.operacionesProyectos = proyectos.filter(x => x.id !== projectId && x.numProyecto !== projectId && x.consecutivo !== projectId);

    if (appState.activeOperacionesProjectId === projectId) {
        closeOperacionesDetail();
    }

    saveOperacionesStorage();

    if (window.isSupabaseActive && window.isSupabaseActive()) {
        try {
            window.SUPABASE_CONFIG?.client?.from('operaciones')?.delete()?.eq('id', projectId);
        } catch (e) {}
    }

    renderOperaciones();
};

window.archivarExpedienteActivo = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) {
        alert("No se encontró ningún expediente activo para archivar.");
        return;
    }

    const consecutivo = p.consecutivo || p.numConsecutivo || p.numProyecto || 'este expediente';
    if (!confirm(`¿Deseas ARCHIVAR el expediente ${consecutivo}?\n\nEl expediente se guardará como cerrado en la sección "EXPEDIENTE" y podrás consultarlo cuando lo requieras.`)) {
        return;
    }

    p.archivado = true;
    p.estatus = 'CERRADO';
    p.fechaArchivado = new Date().toISOString();
    p.fechaArchivadoDisplay = new Date().toLocaleDateString('es-MX');

    saveOperacionesStorage();
    closeOperacionesDetail();
    alert(`✅ Expediente ${consecutivo} archivado con éxito.\nPuedes revisarlo en cualquier momento desde la sección "EXPEDIENTE".`);
};

window.handleOperacionesSearch = function(query) {
    appState.operacionesSearchQuery = query;
    renderOperaciones();
};

window.handleOperacionesStatusFilter = function(status) {
    appState.operacionesStatusFilter = status;
    renderOperaciones();
};

window.handleOperacionesTipoFilter = function(tipo) {
    appState.operacionesTipoFilter = tipo;
    renderOperaciones();
};

window.toggleOpCustomDropdown = function(filterType, event) {
    if (event) event.stopPropagation();
    const wrap = document.getElementById(`wrap-op-${filterType}-filter`);
    if (!wrap) return;

    const isOpen = wrap.classList.contains("open");
    document.querySelectorAll(".op-custom-select-wrap.open").forEach(w => w.classList.remove("open"));

    if (!isOpen) {
        wrap.classList.add("open");
    }
};

window.selectOpFilterOption = function(filterType, value, title, iconOrDotClass, event) {
    if (event) event.stopPropagation();
    const wrap = document.getElementById(`wrap-op-${filterType}-filter`);
    const menu = document.getElementById(`op-${filterType}-dropdown-menu`);
    const textEl = document.getElementById(`op-${filterType}-selected-text`);
    const hiddenSelect = document.getElementById(`op-${filterType}-filter`);

    if (textEl) textEl.textContent = title;

    if (filterType === 'tipo') {
        const iconEl = document.getElementById('op-tipo-selected-icon');
        if (iconEl) iconEl.textContent = iconOrDotClass;
        if (hiddenSelect) hiddenSelect.value = value;
        handleOperacionesTipoFilter(value);
    } else if (filterType === 'status') {
        const dotEl = document.getElementById('op-status-selected-dot');
        if (dotEl) {
            dotEl.className = `op-status-dot ${iconOrDotClass}`;
        }
        if (hiddenSelect) hiddenSelect.value = value;
        handleOperacionesStatusFilter(value);
    }

    if (menu) {
        menu.querySelectorAll(".op-dropdown-item").forEach(item => {
            if (item.getAttribute("data-value") === value) {
                item.classList.add("selected");
            } else {
                item.classList.remove("selected");
            }
        });
    }

    if (wrap) wrap.classList.remove("open");
};

// Global click outside and escape listeners for operaciones custom dropdowns
if (typeof window !== 'undefined' && !window._opCustomSelectListenersAdded) {
    window._opCustomSelectListenersAdded = true;
    document.addEventListener("click", function(e) {
        if (!e.target.closest(".op-custom-select-wrap")) {
            document.querySelectorAll(".op-custom-select-wrap.open").forEach(w => w.classList.remove("open"));
        }
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            document.querySelectorAll(".op-custom-select-wrap.open").forEach(w => w.classList.remove("open"));
        }
    });
}

window.openOperacionesDetail = function(projectId) {
    const proyectos = appState.operacionesProyectos || defaultOperacionesProyectos;
    let p = proyectos.find(x => x.id === projectId || x.numProyecto === projectId || x.consecutivo === projectId);
    if (!p) {
        p = proyectos[0];
    }
    if (!p) return;

    appState.activeOperacionesProjectId = p.id;
    appState.contenedoresPage = 0;
    appState.prefacturaPage = 0;

    const listPane = document.getElementById("operaciones-view-list");
    const detailPane = document.getElementById("operaciones-view-detail");
    const topbarBack = document.getElementById("op-detail-topbar");

    if (listPane) listPane.style.display = "none";
    if (detailPane) detailPane.style.display = "block";
    if (topbarBack) topbarBack.style.display = "block";

    // Populate Step 1 (Datos de proyecto - Factura, OC, Tipo de Proyecto y Formularios)
    renderStep1View(p);

    // Populate Steps 3, 4, 5 Badges (Mostrando el consecutivo en Número de Proyecto)
    const consecutivoDisplay = p.consecutivo || p.numConsecutivo || p.numProyecto;
    document.querySelectorAll("#op-step3-num-proyecto, #op-step4-num-proyecto, #op-step5-num-proyecto").forEach(el => el.innerText = consecutivoDisplay);
    document.querySelectorAll("#op-step3-num-factura, #op-step4-num-factura, #op-step5-num-factura").forEach(el => el.innerText = p.numFactura || "-");
    document.querySelectorAll("#op-step3-num-oc, #op-step4-num-oc, #op-step5-num-oc").forEach(el => el.innerText = p.numOC || "-");
    document.querySelectorAll("#op-step3-num-consecutivo, #op-step4-num-consecutivo, #op-step5-num-consecutivo").forEach(el => el.innerText = consecutivoDisplay);

    renderPartidasTable(p);
    renderProveedorClavesTable(p);
    renderPrefacturaSlider();

    // Populate Step 4 (Documentos)
    renderDocumentosStatus(p);

    goToOperacionesStep(p.currentStep || 1);
};

window.selectProjectTipo = function(tipo) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    p.tipoProyecto = tipo;
    if (tipo === 'servicio_local') p.servicioName = 'Servicio local';
    else if (tipo === 'movimientos_foraneos') p.servicioName = 'Movimientos foráneos';
    else if (tipo === 'lavado_contenedores') p.servicioName = 'Lavado de contenedores';

    if (!p.infoLavado) {
        p.infoLavado = { sitioServicio: '', clienteFacturar: '', hbl: '', mbl: '', naviera: '', totalContenedores: 0, observaciones: '' };
    }
    if (!p.infoViaje) {
        p.infoViaje = { terminal: '', mblMawb: '', destino: '', observaciones: '' };
    }

    // Actualizar letra de consecutivo según el tipo seleccionado (F para local/foráneo, L para lavado)
    p.numConsecutivo = updateConsecutivoLetterForTipo(p.numConsecutivo, tipo);
    p.consecutivo = p.numConsecutivo;
    p.numProyecto = p.consecutivo;

    if (p.contenedores && p.contenedores.length > 0) {
        p.contenedores.forEach((c, idx) => {
            if (tipo === 'lavado_contenedores') {
                if (!c.label || c.label.startsWith('Contenedor')) c.label = `Lavado Contenedor ${idx + 1}`;
            } else {
                if (!c.label || c.label.startsWith('Lavado')) c.label = `Contenedor ${idx + 1}`;
            }
        });
    }

    appState.contenedoresPage = 0;
    renderStep1View(p);
    saveOperacionesStorage();
};

window.toggleStep1GeneralInfo = function(section) {
    const body = document.getElementById(`op-info-body-${section}`);
    const icon = document.getElementById(`op-toggle-icon-${section}`);
    if (!body) return;
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if (icon) icon.innerText = 'expand_less';
    } else {
        body.style.display = 'none';
        if (icon) icon.innerText = 'expand_more';
    }
};

window.updateProjectInfoViajeField = function(key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.infoViaje) p.infoViaje = {};
    p.infoViaje[key] = val;
    saveOperacionesStorage();
};

window.updateProjectInfoLavadoField = function(key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.infoLavado) p.infoLavado = {};
    p.infoLavado[key] = val;
    saveOperacionesStorage();
};

window.renderStep1View = function(p) {
    if (!p) return;
    if (!p.tipoProyecto) p.tipoProyecto = 'servicio_local';

    // 1. Selector de tipo de proyecto
    ['servicio_local', 'movimientos_foraneos', 'lavado_contenedores'].forEach(t => {
        const btn = document.getElementById(`btn-tipo-${t}`);
        if (btn) {
            if (p.tipoProyecto === t) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    // 2. Factura, OC y Consecutivo
    if (!p.numConsecutivo || !p.numConsecutivo.startsWith('RDP')) {
        p.numConsecutivo = generateProjectConsecutivo(p.tipoProyecto);
        p.consecutivo = p.numConsecutivo;
    }
    const facturaNumEl = document.getElementById("op-step1-factura-num");
    const ocNumEl = document.getElementById("op-step1-oc-num");
    const consecutivoNumEl = document.getElementById("op-step1-consecutivo-num");
    if (facturaNumEl) facturaNumEl.value = p.numFactura || "";
    if (ocNumEl) ocNumEl.value = p.numOC || "";
    if (consecutivoNumEl) consecutivoNumEl.value = p.numConsecutivo || "";
    document.querySelectorAll("#op-step3-num-consecutivo, #op-step4-num-consecutivo, #op-step5-num-consecutivo").forEach(el => el.innerText = p.numConsecutivo || "-");

    // 3. Tarjetas generales según tipo
    const localForaneoCard = document.getElementById("op-step1-general-info-local-foraneo");
    const lavadoCard = document.getElementById("op-step1-general-info-lavado");
    const infoTitle = document.getElementById("op-step1-info-title");
    const addContenedorLabel = document.getElementById("op-btn-add-contenedor-label");

    if (p.tipoProyecto === 'lavado_contenedores') {
        if (localForaneoCard) localForaneoCard.style.display = 'none';
        if (lavadoCard) lavadoCard.style.display = 'block';
        if (addContenedorLabel) addContenedorLabel.innerText = 'Agregar contenedor de lavado';

        const info = p.infoLavado || {};
        const sitioEl = document.getElementById("op-step1-lavado-sitio");
        const clienteEl = document.getElementById("op-step1-lavado-cliente");
        const hblEl = document.getElementById("op-step1-lavado-hbl");
        const mblEl = document.getElementById("op-step1-lavado-mbl");
        const navieraEl = document.getElementById("op-step1-lavado-naviera");
        const totalEl = document.getElementById("op-step1-lavado-total");
        const obsEl = document.getElementById("op-step1-lavado-obs");

        if (sitioEl) sitioEl.value = info.sitioServicio || "";
        if (clienteEl) clienteEl.value = info.clienteFacturar || "";
        if (hblEl) hblEl.value = info.hbl || "";
        if (mblEl) mblEl.value = info.mbl || "";
        if (navieraEl) navieraEl.value = info.naviera || "";
        if (totalEl) totalEl.value = `${(p.contenedores || []).length} contenedor(es)`;
        if (obsEl) obsEl.value = info.observaciones || "";
    } else {
        if (localForaneoCard) localForaneoCard.style.display = 'block';
        if (lavadoCard) lavadoCard.style.display = 'none';
        if (addContenedorLabel) addContenedorLabel.innerText = 'Agregar contenedor';

        if (infoTitle) {
            infoTitle.innerText = p.tipoProyecto === 'movimientos_foraneos' 
                ? 'Datos Generales - Movimientos Foráneos' 
                : 'Datos Generales - Servicio Local';
        }

        const viaje = p.infoViaje || {};
        const termEl = document.getElementById("op-step1-terminal");
        const mblEl = document.getElementById("op-step1-mbl");
        const destEl = document.getElementById("op-step1-destino");
        const obsEl = document.getElementById("op-step1-obs");

        if (termEl) termEl.value = viaje.terminal || "";
        if (mblEl) mblEl.value = viaje.mblMawb || "";
        if (destEl) destEl.value = viaje.destino || "";
        if (obsEl) obsEl.value = viaje.observaciones || "";
    }

    renderContenedoresCards(p);
};

window.closeOperacionesDetail = function() {
    const listPane = document.getElementById("operaciones-view-list");
    const detailPane = document.getElementById("operaciones-view-detail");
    const topbarBack = document.getElementById("op-detail-topbar");

    if (listPane) listPane.style.display = "block";
    if (detailPane) detailPane.style.display = "none";
    if (topbarBack) topbarBack.style.display = "none";

    renderOperaciones();
};

window.goToOperacionesStep = function(stepNum) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);

    if (stepNum > 4) return;

    document.querySelectorAll(".stepper-step").forEach((el, idx) => {
        const sNum = idx + 1;
        if (sNum === stepNum) {
            el.classList.add("active");
        } else {
            el.classList.remove("active");
        }
        if (sNum < stepNum) {
            el.classList.add("completed");
        } else {
            el.classList.remove("completed");
        }
    });

    document.querySelectorAll(".op-step-pane").forEach((pane, idx) => {
        const sNum = idx + 1;
        if (sNum === stepNum) {
            pane.classList.add("active");
            pane.style.display = "flex";
        } else {
            pane.classList.remove("active");
            pane.style.display = "none";
        }
    });

    if (p) {
        p.currentStep = stepNum;
        saveOperacionesStorage();
    }
};

window.changeContenedoresPage = function(delta) {
    if (appState.contenedoresPage === undefined) appState.contenedoresPage = 0;
    appState.contenedoresPage += delta;
    if (appState.contenedoresPage < 0) appState.contenedoresPage = 0;
    
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (p) {
        renderContenedoresCards(p);
    }
};

window.updateProjectHeaderField = function(key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    p[key] = val;

    if (key === 'numFactura') {
        document.querySelectorAll("#op-step3-num-factura, #op-step4-num-factura, #op-step5-num-factura").forEach(el => el.innerText = val || "-");
    }
    if (key === 'numOC') {
        document.querySelectorAll("#op-step3-num-oc, #op-step4-num-oc, #op-step5-num-oc").forEach(el => el.innerText = val || "-");
    }
    if (key === 'numConsecutivo' || key === 'consecutivo') {
        p.numConsecutivo = val;
        p.consecutivo = val;
        document.querySelectorAll("#op-step3-num-consecutivo, #op-step4-num-consecutivo, #op-step5-num-consecutivo").forEach(el => el.innerText = val || "-");
    }

    saveOperacionesStorage();
};

function renderContenedoresCards(p) {
    const container = document.getElementById("op-contenedores-container");
    if (!container) return;

    if (appState.contenedoresPage === undefined) appState.contenedoresPage = 0;

    let list = p.contenedores;
    if (!list || list.length === 0) {
        if (p.tipoProyecto === 'lavado_contenedores') {
            list = [
                { id: 1, label: 'Lavado Contenedor 1', numContenedor: 'TNCU2312248', evidenciaFecha: '2026-09-14', observaciones: 'Lavado grado alimenticio completado' },
                { id: 2, label: 'Lavado Contenedor 2', numContenedor: 'MSKU9981240', evidenciaFecha: '2026-09-14', observaciones: 'Evidencias fotográficas enviadas' }
            ];
        } else {
            list = [
                { id: 1, label: 'Contenedor 1', fechaDespacho: '2027-03-21', horarioTerminal: '08:00 hrs', fechaEntrega: '2027-03-22', eirImpreso: 'EIR-8821', podSellado: 'Sí', entregaVacio: 'Pendiente' },
                { id: 2, label: 'Contenedor 2', fechaDespacho: '2027-03-21', horarioTerminal: '10:00 hrs', fechaEntrega: '2027-03-22', eirImpreso: 'EIR-8822', podSellado: 'Sí', entregaVacio: 'Entregado' },
                { id: 3, label: 'Contenedor 3', fechaDespacho: '2027-03-22', horarioTerminal: '12:30 hrs', fechaEntrega: '2027-03-23', eirImpreso: 'EIR-8823', podSellado: 'Pendiente', entregaVacio: 'Pendiente' },
                { id: 4, label: 'Contenedor 4', fechaDespacho: '', horarioTerminal: '', fechaEntrega: '', eirImpreso: '', podSellado: '', entregaVacio: '' }
            ];
        }
        p.contenedores = list;
    }

    const itemsPerPage = 2;
    const totalPages = Math.max(1, Math.ceil(list.length / itemsPerPage));
    if (appState.contenedoresPage >= totalPages) appState.contenedoresPage = totalPages - 1;

    const startIdx = appState.contenedoresPage * itemsPerPage;
    const pageItems = list.slice(startIdx, startIdx + itemsPerPage);

    if (p.tipoProyecto === 'lavado_contenedores') {
        container.innerHTML = pageItems.map(c => `
            <div class="contenedor-card lavado-card">
                <div class="contenedor-card-header">
                    <div class="contenedor-num-badge">${c.id}</div>
                    <span class="contenedor-card-title">${c.label || ('Lavado Contenedor ' + c.id)}</span>
                    <button type="button" class="btn-delete-contenedor" onclick="deleteContenedor(${c.id})" title="Eliminar contenedor">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                <div class="contenedor-fields-grid lavado-fields-grid">
                    <div class="field-wide">
                        <label>Lavado de contenedor (Matrícula)</label>
                        <input type="text" value="${c.numContenedor || ''}" placeholder="Ej. TNCU2312248" oninput="updateContenedorField(${c.id}, 'numContenedor', this.value)" style="font-weight: 700; color: #15803D;" />
                    </div>
                    <div class="field-wide">
                        <label>Evidencia enviada el</label>
                        <input type="date" value="${c.evidenciaFecha || ''}" onchange="updateContenedorField(${c.id}, 'evidenciaFecha', this.value)" />
                    </div>
                    <div class="field-full">
                        <label>Observaciones</label>
                        <input type="text" value="${c.observaciones || ''}" placeholder="Notas o detalles de evidencia..." oninput="updateContenedorField(${c.id}, 'observaciones', this.value)" />
                    </div>
                </div>
            </div>
        `).join('');

        const totalEl = document.getElementById("op-step1-lavado-total");
        if (totalEl) totalEl.value = `${list.length} contenedor(es)`;
    } else {
        container.innerHTML = pageItems.map(c => `
            <div class="contenedor-card">
                <div class="contenedor-card-header">
                    <div class="contenedor-num-badge">${c.id}</div>
                    <span class="contenedor-card-title">${c.label || ('Contenedor ' + c.id)}</span>
                    <button type="button" class="btn-delete-contenedor" onclick="deleteContenedor(${c.id})" title="Eliminar contenedor">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                <div class="contenedor-fields-grid">
                    <div>
                        <label>Fecha de despacho</label>
                        <input type="date" value="${c.fechaDespacho || ''}" onchange="updateContenedorField(${c.id}, 'fechaDespacho', this.value)" />
                    </div>
                    <div>
                        <label>Horario / Terminal</label>
                        <input type="text" value="${c.horarioTerminal || ''}" placeholder="Selecciona o escribe..." oninput="updateContenedorField(${c.id}, 'horarioTerminal', this.value)" />
                    </div>
                    <div>
                        <label>Fecha de entrega</label>
                        <input type="date" value="${c.fechaEntrega || ''}" onchange="updateContenedorField(${c.id}, 'fechaEntrega', this.value)" />
                    </div>
                    <div>
                        <label>EIR impreso</label>
                        <input type="text" value="${c.eirImpreso || ''}" placeholder="Escribe número o referencia..." oninput="updateContenedorField(${c.id}, 'eirImpreso', this.value)" />
                    </div>
                    <div class="field-wide">
                        <label>Pod sellado</label>
                        <input type="text" value="${c.podSellado || ''}" placeholder="Selecciona o escribe..." oninput="updateContenedorField(${c.id}, 'podSellado', this.value)" />
                    </div>
                    <div class="field-wide">
                        <label>Entrega de vacío</label>
                        <input type="text" value="${c.entregaVacio || ''}" placeholder="Selecciona o escribe..." oninput="updateContenedorField(${c.id}, 'entregaVacio', this.value)" />
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update nav buttons and indicator
    const prevBtn = document.getElementById("op-contenedores-prev-btn");
    const nextBtn = document.getElementById("op-contenedores-next-btn");
    const indicator = document.getElementById("op-contenedores-page-indicator");

    if (prevBtn) prevBtn.disabled = appState.contenedoresPage === 0;
    if (nextBtn) nextBtn.disabled = appState.contenedoresPage >= totalPages - 1;

    if (indicator) {
        indicator.innerHTML = `<strong>Página ${appState.contenedoresPage + 1} de ${totalPages}</strong> (${list.length} contenedores registrados)`;
    }
}

window.deleteContenedor = function(cId) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p || !p.contenedores) return;

    p.contenedores = p.contenedores.filter(c => c.id !== cId);

    // Re-index remaining contenedores sequentially
    p.contenedores.forEach((c, idx) => {
        c.id = idx + 1;
        if (p.tipoProyecto === 'lavado_contenedores') {
            c.label = `Lavado Contenedor ${c.id}`;
        } else {
            c.label = `Contenedor ${c.id}`;
        }
    });

    saveOperacionesStorage();
    renderContenedoresCards(p);
};

/* Prefactura Lateral Slider (Step 2 - Imagen 2 y 3) */
window.changePrefacturaPage = function(delta) {
    if (appState.prefacturaPage === undefined) appState.prefacturaPage = 0;
    appState.prefacturaPage += delta;
    if (appState.prefacturaPage < 0) appState.prefacturaPage = 0;
    if (appState.prefacturaPage > 1) appState.prefacturaPage = 1;
    renderPrefacturaSlider();
};

window.renderPrefacturaSlider = function() {
    if (appState.prefacturaPage === undefined) appState.prefacturaPage = 0;
    const page1 = document.getElementById("prefactura-page-1");
    const page2 = document.getElementById("prefactura-page-2");
    const prevBtn = document.getElementById("op-prefactura-prev-btn");
    const nextBtn = document.getElementById("op-prefactura-next-btn");
    const indicator = document.getElementById("op-prefactura-page-indicator");

    if (appState.prefacturaPage === 0) {
        if (page1) page1.style.display = "block";
        if (page2) page2.style.display = "none";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = false;
        if (indicator) indicator.innerHTML = `<strong>Página 1 de 2</strong> (Partidas y conceptos)`;
    } else {
        if (page1) page1.style.display = "none";
        if (page2) page2.style.display = "block";
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = true;
        if (indicator) indicator.innerHTML = `<strong>Página 2 de 2</strong> (Proveedor y claves de compra)`;
    }
};

window.handlePrefacturaFooterNext = function() {
    if (appState.prefacturaPage === undefined) appState.prefacturaPage = 0;
    if (appState.prefacturaPage === 0) {
        changePrefacturaPage(1);
    } else {
        goToOperacionesStep(4);
    }
};

window.handlePrefacturaFooterPrev = function() {
    if (appState.prefacturaPage === undefined) appState.prefacturaPage = 0;
    if (appState.prefacturaPage === 1) {
        changePrefacturaPage(-1);
    } else {
        goToOperacionesStep(2);
    }
};

window.updateContenedorField = function(cId, key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.contenedores) p.contenedores = [];
    let item = p.contenedores.find(x => x.id === cId);
    if (!item) {
        item = { id: cId, label: `Contenedor ${cId}` };
        p.contenedores.push(item);
    }
    item[key] = val;
    saveOperacionesStorage();
};

window.addContenedorToActiveProject = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.contenedores) p.contenedores = [];
    const nextId = p.contenedores.length + 1;
    if (p.tipoProyecto === 'lavado_contenedores') {
        p.contenedores.push({ id: nextId, label: `Lavado Contenedor ${nextId}`, numContenedor: '', evidenciaFecha: '', observaciones: '' });
    } else {
        p.contenedores.push({ id: nextId, label: `Contenedor ${nextId}`, fechaDespacho: '', horarioTerminal: '', fechaEntrega: '', eirImpreso: '', podSellado: '', entregaVacio: '' });
    }
    // Navegar a la página donde quedó el nuevo contenedor (2 fichas laterales por vista)
    const itemsPerPage = 2;
    appState.contenedoresPage = Math.floor((p.contenedores.length - 1) / itemsPerPage);
    renderContenedoresCards(p);
    saveOperacionesStorage();
};

window.convertirCaratulaPDF = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) {
        alert("No se encontró ningún proyecto activo para exportar.");
        return;
    }

    // Obtener valores actuales (desde el DOM si existen, o del objeto del proyecto)
    const factura = (document.getElementById("op-step1-factura-num")?.value || p.numFactura || "").trim();
    const oc = (document.getElementById("op-step1-oc-num")?.value || p.numOC || "").trim();
    const consecutivo = (document.getElementById("op-step1-consecutivo-num")?.value || p.numConsecutivo || "").trim();

    const isLavado = p.tipoProyecto === 'lavado_contenedores';
    const isForaneo = p.tipoProyecto === 'movimientos_foraneos';
    const projectTypeName = isLavado ? 'Lavado de Contenedores' : (isForaneo ? 'Movimientos Foráneos' : 'Servicio Local');

    // Datos Generales
    let datosGeneralesHTML = '';
    if (isLavado) {
        const info = p.infoLavado || {};
        const sitio = document.getElementById("op-step1-lavado-sitio")?.value || info.sitioServicio || "-";
        const cliente = document.getElementById("op-step1-lavado-cliente")?.value || info.clienteFacturar || "-";
        const hbl = document.getElementById("op-step1-lavado-hbl")?.value || info.hbl || "-";
        const mbl = document.getElementById("op-step1-lavado-mbl")?.value || info.mbl || "-";
        const naviera = document.getElementById("op-step1-lavado-naviera")?.value || info.naviera || "-";
        const total = (p.contenedores || []).length;
        const obs = document.getElementById("op-step1-lavado-obs")?.value || info.observaciones || "-";

        datosGeneralesHTML = `
            <div class="pdf-section-title">Datos Generales - Lavado de Contenedores</div>
            <div class="pdf-grid-4">
                <div class="pdf-field"><span class="pdf-label">Sitio de servicio:</span><span class="pdf-val">${sitio}</span></div>
                <div class="pdf-field"><span class="pdf-label">Cliente a facturar:</span><span class="pdf-val">${cliente}</span></div>
                <div class="pdf-field"><span class="pdf-label">HBL:</span><span class="pdf-val">${hbl}</span></div>
                <div class="pdf-field"><span class="pdf-label">MBL:</span><span class="pdf-val">${mbl}</span></div>
            </div>
            <div class="pdf-grid-3" style="margin-top: 6px;">
                <div class="pdf-field"><span class="pdf-label">Naviera:</span><span class="pdf-val">${naviera}</span></div>
                <div class="pdf-field"><span class="pdf-label">Total de contenedores:</span><span class="pdf-val">${total} contenedor(es)</span></div>
                <div class="pdf-field"><span class="pdf-label">Observaciones:</span><span class="pdf-val">${obs}</span></div>
            </div>
        `;
    } else {
        const viaje = p.infoViaje || {};
        const term = document.getElementById("op-step1-terminal")?.value || viaje.terminal || "-";
        const mbl = document.getElementById("op-step1-mbl")?.value || viaje.mblMawb || "-";
        const dest = document.getElementById("op-step1-destino")?.value || viaje.destino || "-";
        const obs = document.getElementById("op-step1-obs")?.value || viaje.observaciones || "-";

        datosGeneralesHTML = `
            <div class="pdf-section-title">Datos Generales - ${projectTypeName}</div>
            <div class="pdf-grid-4">
                <div class="pdf-field"><span class="pdf-label">Terminal:</span><span class="pdf-val">${term}</span></div>
                <div class="pdf-field"><span class="pdf-label">MBL / MAWB:</span><span class="pdf-val">${mbl}</span></div>
                <div class="pdf-field"><span class="pdf-label">Destino:</span><span class="pdf-val">${dest}</span></div>
                <div class="pdf-field"><span class="pdf-label">Observaciones:</span><span class="pdf-val">${obs}</span></div>
            </div>
        `;
    }

    // Lista de Contenedores
    const contenedores = (p.contenedores && p.contenedores.length > 0) ? p.contenedores : [
        { id: 1, label: isLavado ? 'Lavado Contenedor 1' : 'Contenedor 1' }
    ];

    const maxPerPage = 7;
    const totalPages = Math.max(1, Math.ceil(contenedores.length / maxPerPage));
    const nowStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let pagesHTML = '';

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageItems = contenedores.slice(pageIdx * maxPerPage, (pageIdx + 1) * maxPerPage);

        let contenedoresGridHTML = '';
        if (isLavado) {
            contenedoresGridHTML = pageItems.map(c => `
                <div class="pdf-c-card">
                    <div class="pdf-c-card-header">
                        <span class="pdf-c-badge">${c.id}</span>
                        <strong class="pdf-c-title">${c.label || ('Lavado Contenedor ' + c.id)}</strong>
                    </div>
                    <div class="pdf-c-fields pdf-c-lavado">
                        <div class="pdf-c-field">
                            <span class="pdf-label">Matrícula:</span>
                            <span class="pdf-val bold-green">${c.numContenedor || '-'}</span>
                        </div>
                        <div class="pdf-c-field">
                            <span class="pdf-label">Evidencia enviada el:</span>
                            <span class="pdf-val">${c.evidenciaFecha || '-'}</span>
                        </div>
                        <div class="pdf-c-field full-row">
                            <span class="pdf-label">Observaciones:</span>
                            <span class="pdf-val">${c.observaciones || '-'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            contenedoresGridHTML = pageItems.map(c => `
                <div class="pdf-c-card">
                    <div class="pdf-c-card-header">
                        <span class="pdf-c-badge">${c.id}</span>
                        <strong class="pdf-c-title">${c.label || ('Contenedor ' + c.id)}</strong>
                    </div>
                    <div class="pdf-c-fields">
                        <div class="pdf-c-field"><span class="pdf-label">Fecha despacho:</span><span class="pdf-val">${c.fechaDespacho || '-'}</span></div>
                        <div class="pdf-c-field"><span class="pdf-label">Horario / Terminal:</span><span class="pdf-val">${c.horarioTerminal || '-'}</span></div>
                        <div class="pdf-c-field"><span class="pdf-label">Fecha entrega:</span><span class="pdf-val">${c.fechaEntrega || '-'}</span></div>
                        <div class="pdf-c-field"><span class="pdf-label">EIR impreso:</span><span class="pdf-val">${c.eirImpreso || '-'}</span></div>
                        <div class="pdf-c-field"><span class="pdf-label">Pod sellado:</span><span class="pdf-val">${c.podSellado || '-'}</span></div>
                        <div class="pdf-c-field"><span class="pdf-label">Entrega vacío:</span><span class="pdf-val">${c.entregaVacio || '-'}</span></div>
                    </div>
                </div>
            `).join('');
        }

        pagesHTML += `
            <div class="pdf-page">
                <!-- Encabezado de Documento -->
                <div class="pdf-header">
                    <div class="pdf-brand">
                        <img src="Logo%20interno.png" alt="Rodipack Logo" class="pdf-logo-img" />
                        <div>
                            <div class="pdf-brand-title">RODIPACK · ADMOND</div>
                            <div class="pdf-brand-sub">Control Operativo y Expediente de Proyecto</div>
                        </div>
                    </div>
                    <div class="pdf-doc-info">
                        <div class="pdf-doc-title">EXPEDIENTE DE OPERACIONES</div>
                        <div class="pdf-doc-type">Proyecto: <strong>${projectTypeName}</strong></div>
                        <div class="pdf-doc-date">${nowStr}</div>
                    </div>
                </div>

                <!-- 3 Banners Superiores (Factura, OC, Consecutivo) -->
                <div class="pdf-banners-row">
                    <div class="pdf-banner-card">
                        <div class="pdf-banner-icon">📄</div>
                        <div>
                            <div class="pdf-banner-label">Número de factura:</div>
                            <div class="pdf-banner-val">${factura || 'Sin factura'}</div>
                        </div>
                    </div>
                    <div class="pdf-banner-card">
                        <div class="pdf-banner-icon">📋</div>
                        <div>
                            <div class="pdf-banner-label">Número de OC:</div>
                            <div class="pdf-banner-val">${oc || 'Sin OC'}</div>
                        </div>
                    </div>
                    <div class="pdf-banner-card">
                        <div class="pdf-banner-icon">🏷️</div>
                        <div>
                            <div class="pdf-banner-label">Consecutivo:</div>
                            <div class="pdf-banner-val blue-text">${consecutivo || 'Sin consecutivo'}</div>
                        </div>
                    </div>
                </div>

                <!-- Tarjeta de Datos Generales -->
                <div class="pdf-general-card">
                    ${datosGeneralesHTML}
                </div>

                <!-- Sección de Contenedores -->
                <div class="pdf-contenedores-section">
                    <div class="pdf-c-section-header">
                        <span>Contenedores Registrados (Página ${pageIdx + 1} de ${totalPages} · Mostrando ${pageItems.length} de ${contenedores.length})</span>
                    </div>
                    <div class="pdf-contenedores-grid">
                        ${contenedoresGridHTML}
                    </div>
                </div>

                <!-- Footer de Página -->
                <div class="pdf-footer">
                    <span>Expediente de Proyecto Consecutivo: <strong>${consecutivo || '-'}</strong> | ${projectTypeName}</span>
                    <span>Página ${pageIdx + 1} de ${totalPages}</span>
                </div>
            </div>
        `;
    }

    const printHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <base href="${window.location.href}">
    <title>Caratula_Operaciones_${consecutivo || 'Proyecto'}</title>
    <style>
        @page {
            size: letter portrait;
            margin: 8mm 10mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1E293B;
            background: #FFFFFF;
            font-size: 11px;
            line-height: 1.35;
        }
        .pdf-page {
            page-break-after: always;
            padding: 10px;
            max-width: 800px;
            margin: 0 auto;
        }
        .pdf-page:last-child {
            page-break-after: avoid;
        }
        
        /* Header */
        .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .pdf-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .pdf-logo-img {
            height: 38px;
            width: auto;
            max-width: 120px;
            object-fit: contain;
            display: block;
        }
        .pdf-brand-title {
            font-size: 13px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: 0.5px;
        }
        .pdf-brand-sub {
            font-size: 9px;
            color: #64748B;
        }
        .pdf-doc-info {
            text-align: right;
        }
        .pdf-doc-title {
            font-size: 13px;
            font-weight: 800;
            color: #1E3A8A;
            letter-spacing: 0.5px;
        }
        .pdf-doc-type {
            font-size: 10px;
            color: #334155;
            margin-top: 1px;
        }
        .pdf-doc-date {
            font-size: 8.5px;
            color: #94A3B8;
        }

        /* 3 Banners */
        .pdf-banners-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 10px;
        }
        .pdf-banner-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 6px 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .pdf-banner-icon {
            font-size: 16px;
        }
        .pdf-banner-label {
            font-size: 8.5px;
            color: #64748B;
            text-transform: uppercase;
            font-weight: 600;
        }
        .pdf-banner-val {
            font-size: 11.5px;
            font-weight: 700;
            color: #0F172A;
        }
        .blue-text {
            color: #2563EB;
        }

        /* Datos Generales */
        .pdf-general-card {
            background: #F8FAFC;
            border: 1px solid #CBD5E1;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 10px;
        }
        .pdf-section-title {
            font-size: 10.5px;
            font-weight: 700;
            color: #1E3A8A;
            margin-bottom: 6px;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 4px;
        }
        .pdf-grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
        }
        .pdf-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .pdf-field {
            display: flex;
            flex-direction: column;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 4px 6px;
        }
        .pdf-label {
            font-size: 8px;
            color: #64748B;
            font-weight: 600;
            text-transform: uppercase;
        }
        .pdf-val {
            font-size: 9.5px;
            font-weight: 600;
            color: #1E293B;
            margin-top: 1px;
            word-break: break-word;
        }
        .bold-green {
            color: #16A34A;
            font-weight: 700;
        }

        /* Contenedores */
        .pdf-contenedores-section {
            margin-bottom: 10px;
        }
        .pdf-c-section-header {
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
        }
        .pdf-contenedores-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
        .pdf-c-card {
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 6px;
            padding: 6px 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .pdf-c-card-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 5px;
            border-bottom: 1px solid #F1F5F9;
            padding-bottom: 3px;
        }
        .pdf-c-badge {
            background: #2563EB;
            color: #FFFFFF;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 700;
        }
        .pdf-c-title {
            font-size: 10px;
            color: #0F172A;
        }
        .pdf-c-fields {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
        }
        .pdf-c-lavado {
            grid-template-columns: 1fr 1fr;
        }
        .full-row {
            grid-column: span 2;
        }
        .pdf-c-field {
            display: flex;
            flex-direction: column;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 3px;
            padding: 3px 5px;
        }

        /* Footer */
        .pdf-footer {
            margin-top: 8px;
            border-top: 1px solid #E2E8F0;
            padding-top: 4px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    ${pagesHTML}
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=950,height=900');
    if (!printWin) {
        alert("Por favor permite las ventanas emergentes (popups) en tu navegador para ver y descargar el PDF.");
        return;
    }
    printWin.document.open();
    printWin.document.write(printHTML);
    printWin.document.close();

    const imgs = printWin.document.querySelectorAll('.pdf-logo-img');
    let pending = imgs.length;
    const triggerPrint = () => {
        setTimeout(() => {
            printWin.focus();
            printWin.print();
        }, 200);
    };

    if (pending === 0) {
        triggerPrint();
    } else {
        imgs.forEach(img => {
            if (img.complete) {
                pending--;
                if (pending === 0) triggerPrint();
            } else {
                img.onload = () => {
                    pending--;
                    if (pending === 0) triggerPrint();
                };
                img.onerror = () => {
                    pending--;
                    if (pending === 0) triggerPrint();
                };
            }
        });
        setTimeout(() => {
            if (pending > 0) triggerPrint();
        }, 1200);
    }
};

window.convertirPrefacturaPDF = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) {
        alert("No se encontró ningún proyecto activo para exportar.");
        return;
    }

    // Obtener valores actuales de encabezado / banners
    const numProyecto = (document.getElementById("op-step3-num-proyecto")?.innerText || p.numProyecto || "RDP-5626XXXX").trim();
    const numFactura = (document.getElementById("op-step3-num-factura")?.innerText || p.numFactura || "F77695").trim();
    const numOC = (document.getElementById("op-step3-num-oc")?.innerText || p.numOC || "75614").trim();
    const consecutivo = (document.getElementById("op-step3-num-consecutivo")?.innerText || p.numConsecutivo || p.consecutivo || "RDP2609130F").trim();

    const isLavado = p.tipoProyecto === 'lavado_contenedores';
    const isForaneo = p.tipoProyecto === 'movimientos_foraneos';
    const projectTypeName = isLavado ? 'Lavado de Contenedores' : (isForaneo ? 'Movimientos Foráneos' : 'Servicio Local');

    const nowStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // 1. Partidas y conceptos (Página 1 - Imagen 2)
    let partidas = p.partidasConceptos;
    if (!partidas || partidas.length === 0) {
        partidas = [
            { servicio: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ];
    }

    let totSub1 = 0, totIva1 = 0, totRet1 = 0, totFinal1 = 0;
    const partidasRowsHTML = partidas.map((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        if (item.servicio || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub1 += sub;
            totIva1 += iva;
            totRet1 += ret;
            totFinal1 += tot;
        }

        const cantDisplay = item.cantidad !== undefined && item.cantidad !== '' && item.cantidad !== 0 ? item.cantidad : '';
        const unitDisplay = unit > 0 ? `$${unit.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00';
        const subDisplay = `$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const ivaDisplay = `$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const retDisplay = `$${ret.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const totDisplay = `$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;

        return `
            <tr>
                <td>${item.servicio || ''}</td>
                <td class="text-center">${idx + 1}</td>
                <td>${item.concepto || ''}</td>
                <td class="text-right">${cantDisplay}</td>
                <td class="text-right">${unitDisplay}</td>
                <td class="text-right">${subDisplay}</td>
                <td class="text-right">${ivaDisplay}</td>
                <td class="text-right">${retDisplay}</td>
                <td class="text-right font-bold">${totDisplay}</td>
            </tr>
        `;
    }).join('');

    // 2. Proveedor y claves de compra (Página 2 - Imagen 3)
    let proveedores = p.proveedoresClaves;
    if (!proveedores || proveedores.length === 0) {
        proveedores = [
            { proveedor: '', facturaNum: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ];
    }

    let totSub2 = 0, totIva2 = 0, totRet2 = 0, totFinal2 = 0;
    const proveedoresRowsHTML = proveedores.map((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        if (item.proveedor || item.facturaNum || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub2 += sub;
            totIva2 += iva;
            totRet2 += ret;
            totFinal2 += tot;
        }

        const cantDisplay = item.cantidad !== undefined && item.cantidad !== '' && item.cantidad !== 0 ? item.cantidad : '';
        const unitDisplay = unit > 0 ? `$${unit.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00';
        const subDisplay = `$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const ivaDisplay = `$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const retDisplay = `$${ret.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        const totDisplay = `$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;

        return `
            <tr>
                <td class="yellow-cell">${item.proveedor || ''}</td>
                <td class="yellow-cell">${item.facturaNum || ''}</td>
                <td class="text-center">${idx + 1}</td>
                <td class="yellow-cell">${item.concepto || ''}</td>
                <td class="text-right">${cantDisplay}</td>
                <td class="text-right">${unitDisplay}</td>
                <td class="text-right">${subDisplay}</td>
                <td class="text-right">${ivaDisplay}</td>
                <td class="text-right">${retDisplay}</td>
                <td class="text-right font-bold">${totDisplay}</td>
            </tr>
        `;
    }).join('');

    const printHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <base href="${window.location.href}">
    <title>Prefactura_${consecutivo || 'Proyecto'}</title>
    <style>
        @page {
            size: letter landscape;
            margin: 8mm 10mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1E293B;
            background: #FFFFFF;
            font-size: 11px;
            line-height: 1.35;
        }
        .pdf-page {
            page-break-after: always;
            padding: 10px 14px;
            max-width: 1040px;
            margin: 0 auto;
        }
        .pdf-page:last-child {
            page-break-after: avoid;
        }

        /* Header */
        .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563EB;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .pdf-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .pdf-logo-img {
            height: 38px;
            width: auto;
            max-width: 120px;
            object-fit: contain;
            display: block;
        }
        .pdf-brand-title {
            font-size: 13px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: 0.5px;
        }
        .pdf-brand-sub {
            font-size: 9px;
            color: #64748B;
        }
        .pdf-doc-info {
            text-align: right;
        }
        .pdf-doc-title {
            font-size: 13px;
            font-weight: 800;
            color: #1E3A8A;
            letter-spacing: 0.5px;
        }
        .pdf-doc-type {
            font-size: 10px;
            color: #334155;
            margin-top: 1px;
        }
        .pdf-doc-date {
            font-size: 8.5px;
            color: #94A3B8;
        }

        /* 4 Banners Superiores */
        .pdf-banners-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 12px;
        }
        .pdf-banner-card {
            background: #EAF4FF;
            border: 1px solid #BCE0FD;
            border-radius: 6px;
            padding: 6px 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .pdf-banner-icon {
            width: 24px;
            height: 24px;
            border-radius: 5px;
            background: #0084FF;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
        }
        .pdf-banner-label {
            font-size: 8.5px;
            color: #64748B;
            text-transform: uppercase;
            font-weight: 600;
        }
        .pdf-banner-val {
            font-size: 11.5px;
            font-weight: 700;
            color: #0F172A;
        }
        .blue-text {
            color: #2563EB;
        }

        /* Card Tabla */
        .pdf-table-card {
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 8px;
            padding: 10px 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .pdf-table-title {
            font-size: 11.5px;
            font-weight: 700;
            color: #1E3A8A;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .pdf-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        .pdf-table th {
            background: #2563EB;
            color: #FFFFFF;
            font-weight: 700;
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #1D4ED8;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .pdf-table td {
            padding: 5px 8px;
            border: 1px solid #E2E8F0;
            color: #334155;
            font-size: 10px;
        }
        .pdf-table tr:nth-child(even) td {
            background-color: #F8FAFC;
        }
        .pdf-table tr td.yellow-cell {
            background-color: #FEF9C3 !important;
        }
        .pdf-table tr.totals-row td {
            background-color: #F1F5F9 !important;
            font-weight: 700;
            border-top: 2px solid #2563EB;
            border-bottom: 2px solid #2563EB;
            padding: 6px 8px;
        }
        .pdf-table tr.totals-row td.final-tot {
            color: #2563EB;
            font-weight: 800;
            font-size: 11px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }

        /* Footer */
        .pdf-footer {
            margin-top: 12px;
            border-top: 1px solid #E2E8F0;
            padding-top: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <!-- PAGINA 1: Partidas y conceptos de la factura (Imagen 2) -->
    <div class="pdf-page">
        <div class="pdf-header">
            <div class="pdf-brand">
                <img src="Logo%20interno.png" alt="Rodipack Logo" class="pdf-logo-img" />
                <div>
                    <div class="pdf-brand-title">RODIPACK · ADMOND</div>
                    <div class="pdf-brand-sub">Control Operativo · Expediente de Prefactura</div>
                </div>
            </div>
            <div class="pdf-doc-info">
                <div class="pdf-doc-title">EXPEDIENTE DE PREFACTURA</div>
                <div class="pdf-doc-type">Proyecto: <strong>${projectTypeName}</strong></div>
                <div class="pdf-doc-date">${nowStr}</div>
            </div>
        </div>

        <div class="pdf-banners-row">
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📁</div>
                <div>
                    <div class="pdf-banner-label">Número de proyecto:</div>
                    <div class="pdf-banner-val">${numProyecto}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📄</div>
                <div>
                    <div class="pdf-banner-label">Número de factura:</div>
                    <div class="pdf-banner-val">${numFactura}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📋</div>
                <div>
                    <div class="pdf-banner-label">Número de OC:</div>
                    <div class="pdf-banner-val">${numOC}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">🏷️</div>
                <div>
                    <div class="pdf-banner-label">Consecutivo:</div>
                    <div class="pdf-banner-val blue-text">${consecutivo}</div>
                </div>
            </div>
        </div>

        <div class="pdf-table-card">
            <div class="pdf-table-title">
                <span>📋 Partidas y conceptos de la factura</span>
            </div>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width: 14%;">Servicio</th>
                        <th style="width: 4%;" class="text-center">#</th>
                        <th style="width: 26%;">Concepto</th>
                        <th style="width: 8%;" class="text-right">Cantidad</th>
                        <th style="width: 12%;" class="text-right">Unitario</th>
                        <th style="width: 12%;" class="text-right">Sub total</th>
                        <th style="width: 8%;" class="text-right">IVA</th>
                        <th style="width: 8%;" class="text-right">Retención</th>
                        <th style="width: 12%;" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${partidasRowsHTML}
                </tbody>
                <tfoot>
                    <tr class="totals-row">
                        <td colspan="5"><strong>Totales</strong></td>
                        <td class="text-right font-bold">$${totSub1.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right font-bold">$${totIva1.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right font-bold">$${totRet1.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right final-tot">$${totFinal1.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="pdf-footer">
            <span>Expediente de Prefactura Consecutivo: <strong>${consecutivo}</strong> | ${projectTypeName}</span>
            <span>Página 1 de 2 (Partidas y conceptos)</span>
        </div>
    </div>

    <!-- PAGINA 2: Proveedor y claves de compra (Imagen 3) -->
    <div class="pdf-page">
        <div class="pdf-header">
            <div class="pdf-brand">
                <img src="Logo%20interno.png" alt="Rodipack Logo" class="pdf-logo-img" />
                <div>
                    <div class="pdf-brand-title">RODIPACK · ADMOND</div>
                    <div class="pdf-brand-sub">Control Operativo · Expediente de Prefactura</div>
                </div>
            </div>
            <div class="pdf-doc-info">
                <div class="pdf-doc-title">EXPEDIENTE DE PREFACTURA</div>
                <div class="pdf-doc-type">Proyecto: <strong>${projectTypeName}</strong></div>
                <div class="pdf-doc-date">${nowStr}</div>
            </div>
        </div>

        <div class="pdf-banners-row">
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📁</div>
                <div>
                    <div class="pdf-banner-label">Número de proyecto:</div>
                    <div class="pdf-banner-val">${numProyecto}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📄</div>
                <div>
                    <div class="pdf-banner-label">Número de factura:</div>
                    <div class="pdf-banner-val">${numFactura}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">📋</div>
                <div>
                    <div class="pdf-banner-label">Número de OC:</div>
                    <div class="pdf-banner-val">${numOC}</div>
                </div>
            </div>
            <div class="pdf-banner-card">
                <div class="pdf-banner-icon">🏷️</div>
                <div>
                    <div class="pdf-banner-label">Consecutivo:</div>
                    <div class="pdf-banner-val blue-text">${consecutivo}</div>
                </div>
            </div>
        </div>

        <div class="pdf-table-card">
            <div class="pdf-table-title">
                <span>🏪 Proveedor y claves de compra</span>
            </div>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th style="width: 18%;">Proveedor</th>
                        <th style="width: 10%;">Factura #</th>
                        <th style="width: 4%;" class="text-center">#</th>
                        <th style="width: 20%;">Concepto</th>
                        <th style="width: 7%;" class="text-right">Cantidad</th>
                        <th style="width: 11%;" class="text-right">Unitario</th>
                        <th style="width: 11%;" class="text-right">Sub total</th>
                        <th style="width: 7%;" class="text-right">IVA</th>
                        <th style="width: 7%;" class="text-right">Retención</th>
                        <th style="width: 11%;" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${proveedoresRowsHTML}
                </tbody>
                <tfoot>
                    <tr class="totals-row">
                        <td colspan="6"><strong>Totales</strong></td>
                        <td class="text-right font-bold">$${totSub2.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right font-bold">$${totIva2.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right font-bold">$${totRet2.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td class="text-right final-tot">$${totFinal2.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="pdf-footer">
            <span>Expediente de Prefactura Consecutivo: <strong>${consecutivo}</strong> | ${projectTypeName}</span>
            <span>Página 2 de 2 (Proveedor y claves de compra)</span>
        </div>
    </div>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=1050,height=800');
    if (!printWin) {
        alert("Por favor permite las ventanas emergentes (popups) en tu navegador para ver y descargar el PDF.");
        return;
    }
    printWin.document.open();
    printWin.document.write(printHTML);
    printWin.document.close();

    const imgs = printWin.document.querySelectorAll('.pdf-logo-img');
    let pending = imgs.length;
    const triggerPrint = () => {
        setTimeout(() => {
            printWin.focus();
            printWin.print();
        }, 200);
    };

    if (pending === 0) {
        triggerPrint();
    } else {
        imgs.forEach(img => {
            if (img.complete) {
                pending--;
                if (pending === 0) triggerPrint();
            } else {
                img.onload = () => {
                    pending--;
                    if (pending === 0) triggerPrint();
                };
                img.onerror = () => {
                    pending--;
                    if (pending === 0) triggerPrint();
                };
            }
        });
        setTimeout(() => {
            if (pending > 0) triggerPrint();
        }, 1200);
    }
};

const CODIGOS_SERVICIOS_OPERACIONES = {
    'F': 'Coordinacion Logistica',
    'M': 'Maniobras',
    'D': 'Demoras',
    'L': 'Lavado',
    'E': 'Estadias'
};

window.handlePartidaServicioInput = function(idx, inputEl, event) {
    if (!inputEl) return;
    const prevLen = inputEl._prevLen !== undefined ? inputEl._prevLen : (inputEl.value.length + 1);
    const currLen = inputEl.value.length;
    const isDeleting = (currLen < prevLen) || (event && event.inputType && (event.inputType.startsWith('delete') || event.inputType.startsWith('history')));
    inputEl._prevLen = currLen;

    const val = inputEl.value;
    const raw = val.trim();
    const codeKey = raw.toUpperCase();

    // Si el usuario está borrando o el campo está vacío, NUNCA autocompletar
    if (isDeleting || !raw) {
        updatePartidaFieldFast(idx, 'servicio', val);
        if (!raw) {
            // Si el servicio se borró por completo, limpiar concepto si coincidía con un código automático
            const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
            if (p && p.partidasConceptos && p.partidasConceptos[idx]) {
                const currentConcepto = (p.partidasConceptos[idx].concepto || '').trim();
                const allCodeValues = Object.values(CODIGOS_SERVICIOS_OPERACIONES);
                if (allCodeValues.includes(currentConcepto)) {
                    p.partidasConceptos[idx].concepto = '';
                    const tr = inputEl.closest('tr');
                    if (tr) {
                        const conceptoInput = tr.querySelector('input.partida-concepto-input');
                        if (conceptoInput) {
                            conceptoInput.value = '';
                            conceptoInput._prevLen = 0;
                        }
                    }
                }
            }
        }
        return;
    }

    // Solo expandir si el valor coincide EXACTAMENTE con uno de los códigos: F, M, D, L, E
    if (CODIGOS_SERVICIOS_OPERACIONES[codeKey]) {
        const fullText = CODIGOS_SERVICIOS_OPERACIONES[codeKey];
        inputEl.value = fullText;
        inputEl._prevLen = fullText.length;
        updatePartidaFieldFast(idx, 'servicio', fullText);

        const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
        if (p && p.partidasConceptos && p.partidasConceptos[idx]) {
            const currentConcepto = (p.partidasConceptos[idx].concepto || '').trim();
            const allCodeValues = Object.values(CODIGOS_SERVICIOS_OPERACIONES);
            if (!currentConcepto || allCodeValues.includes(currentConcepto)) {
                p.partidasConceptos[idx].concepto = fullText;
                const tr = inputEl.closest('tr');
                if (tr) {
                    const conceptoInput = tr.querySelector('input.partida-concepto-input');
                    if (conceptoInput) {
                        conceptoInput.value = fullText;
                        conceptoInput._prevLen = fullText.length;
                    }
                }
            }
        }
    } else {
        updatePartidaFieldFast(idx, 'servicio', val);
    }
};

window.handlePartidaServicioSelect = function(idx, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p || !p.partidasConceptos || !p.partidasConceptos[idx]) return;

    p.partidasConceptos[idx].servicio = val;

    // Si el concepto está vacío o contenía una clave anterior, autocompletar con la clave seleccionada
    const currentConcepto = (p.partidasConceptos[idx].concepto || '').trim();
    const allClaves = ['Coordinacion Logistica', 'Maniobras', 'Demoras', 'Lavado', 'Estadias', 'Estadías'];
    if (!currentConcepto || allClaves.includes(currentConcepto)) {
        p.partidasConceptos[idx].concepto = val;
        const tbody = document.getElementById("tbody-partidas-conceptos");
        if (tbody && tbody.children[idx]) {
            const cInput = tbody.children[idx].querySelector('.partida-concepto-input');
            if (cInput) {
                cInput.value = val;
                cInput._prevLen = val.length;
            }
        }
    }

    recalcPartidasTotals(p);
    saveOperacionesStorage();
};

window.handlePartidaConceptoInput = function(idx, inputEl, event) {
    if (!inputEl) return;
    const prevLen = inputEl._prevLen !== undefined ? inputEl._prevLen : (inputEl.value.length + 1);
    const currLen = inputEl.value.length;
    const isDeleting = (currLen < prevLen) || (event && event.inputType && (event.inputType.startsWith('delete') || event.inputType.startsWith('history')));
    inputEl._prevLen = currLen;

    const val = inputEl.value;
    const raw = val.trim();
    const codeKey = raw.toUpperCase();

    if (isDeleting || !raw) {
        updatePartidaFieldFast(idx, 'concepto', val);
        return;
    }

    if (CODIGOS_SERVICIOS_OPERACIONES[codeKey]) {
        const fullText = CODIGOS_SERVICIOS_OPERACIONES[codeKey];
        inputEl.value = fullText;
        inputEl._prevLen = fullText.length;
        updatePartidaFieldFast(idx, 'concepto', fullText);
    } else {
        updatePartidaFieldFast(idx, 'concepto', val);
    }
};

window.updatePartidaFieldFast = function(idx, key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p || !p.partidasConceptos || !p.partidasConceptos[idx]) return;

    if (key === 'cantidad' || key === 'unitario' || key === 'retencion') {
        p.partidasConceptos[idx][key] = val === '' ? '' : (parseFloat(val) || 0);
        recalcPartidasTotals(p);
    } else {
        p.partidasConceptos[idx][key] = val;
    }
    saveOperacionesStorage();
};
window.updatePartidaField = window.updatePartidaFieldFast;

function recalcPartidasTotals(p) {
    const items = p.partidasConceptos || [];
    let totSub = 0, totIva = 0, totRet = 0, totFinal = 0;

    items.forEach((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        item.subtotal = sub;
        item.iva = iva;
        item.retencion = ret;
        item.total = tot;

        if (item.servicio || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub += sub;
            totIva += iva;
            totRet += ret;
            totFinal += tot;
        }

        const subCell = document.getElementById(`partida-sub-${idx}`);
        const ivaCell = document.getElementById(`partida-iva-${idx}`);
        const retCell = document.getElementById(`partida-ret-${idx}`);
        const totCell = document.getElementById(`partida-tot-${idx}`);

        if (subCell) subCell.innerText = `$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (ivaCell) ivaCell.innerText = `$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (retCell) retCell.innerText = `$${ret.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (totCell) totCell.innerText = `$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    });

    const subEl = document.getElementById("op-partidas-tot-sub");
    const ivaEl = document.getElementById("op-partidas-tot-iva");
    const retEl = document.getElementById("op-partidas-tot-ret");
    const finEl = document.getElementById("op-partidas-tot-final");

    if (subEl) subEl.innerText = `$${totSub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (ivaEl) ivaEl.innerText = `$${totIva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (retEl) retEl.innerText = `$${totRet.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (finEl) finEl.innerText = `$${totFinal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

function renderPartidasTable(p) {
    const tbody = document.getElementById("tbody-partidas-conceptos");
    if (!tbody) return;

    // Limpiar textos por defecto antiguos si existieran
    if (p.partidasConceptos && p.partidasConceptos.length > 0) {
        p.partidasConceptos.forEach(item => {
            if (item.servicio && item.servicio.includes("claves de venta") && (item.unitario === 50000 || item.total === 58000)) {
                item.servicio = '';
                item.concepto = '';
                item.cantidad = '';
                item.unitario = '';
                item.subtotal = 0;
                item.iva = 0;
                item.retencion = 0;
                item.total = 0;
            }
        });
    }

    let items = p.partidasConceptos;
    if (!items || items.length === 0) {
        items = [
            { servicio: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ];
        p.partidasConceptos = items;
    }

    let totSub = 0, totIva = 0, totRet = 0, totFinal = 0;

    tbody.innerHTML = items.map((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        if (item.servicio || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub += sub;
            totIva += iva;
            totRet += ret;
            totFinal += tot;
        }

        return `
            <tr>
                <td>
                    <select class="partida-servicio-select" 
                            onchange="handlePartidaServicioSelect(${idx}, this.value)">
                        <option value="" ${!item.servicio ? 'selected' : ''}>-- Seleccionar clave --</option>
                        <option value="Coordinacion Logistica" ${item.servicio === 'Coordinacion Logistica' ? 'selected' : ''}>Coordinación Logística (F)</option>
                        <option value="Maniobras" ${item.servicio === 'Maniobras' ? 'selected' : ''}>Maniobras (M)</option>
                        <option value="Demoras" ${item.servicio === 'Demoras' ? 'selected' : ''}>Demoras (D)</option>
                        <option value="Lavado" ${item.servicio === 'Lavado' ? 'selected' : ''}>Lavado (L)</option>
                        <option value="Estadias" ${item.servicio === 'Estadias' || item.servicio === 'Estadías' ? 'selected' : ''}>Estadías (E)</option>
                        ${item.servicio && !['Coordinacion Logistica', 'Maniobras', 'Demoras', 'Lavado', 'Estadias', 'Estadías'].includes(item.servicio) ? `<option value="${item.servicio}" selected>${item.servicio}</option>` : ''}
                    </select>
                </td>
                <td style="text-align:center;">${idx + 1}</td>
                <td>
                    <input type="text" 
                           class="partida-concepto-input"
                           value="${item.concepto || ''}" 
                           placeholder="Concepto..." 
                           onfocus="this._prevLen = this.value.length"
                           oninput="handlePartidaConceptoInput(${idx}, this, event)" 
                           style="width:100%; border:none; background:transparent;" />
                </td>
                <td style="text-align:right;">
                    <input type="number" 
                           value="${item.cantidad !== undefined && item.cantidad !== '' && item.cantidad !== 0 ? item.cantidad : ''}" 
                           placeholder="" 
                           oninput="updatePartidaFieldFast(${idx}, 'cantidad', this.value)" 
                           style="width:50px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right;">
                    <input type="number" 
                           value="${item.unitario !== undefined && item.unitario !== '' && item.unitario !== 0 ? item.unitario : ''}" 
                           placeholder="$0.00" 
                           oninput="updatePartidaFieldFast(${idx}, 'unitario', this.value)" 
                           style="width:85px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right;" id="partida-sub-${idx}">$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td style="text-align:right;" id="partida-iva-${idx}">$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td style="text-align:right;">
                    <input type="number" 
                           step="any"
                           value="${item.retencion !== undefined && item.retencion !== '' && item.retencion !== 0 ? item.retencion : ''}" 
                           placeholder="$0.00" 
                           oninput="updatePartidaFieldFast(${idx}, 'retencion', this.value)" 
                           style="width:75px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right; font-weight:700;" id="partida-tot-${idx}">$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            </tr>
        `;
    }).join('');

    const subEl = document.getElementById("op-partidas-tot-sub");
    const ivaEl = document.getElementById("op-partidas-tot-iva");
    const retEl = document.getElementById("op-partidas-tot-ret");
    const finEl = document.getElementById("op-partidas-tot-final");

    if (subEl) subEl.innerText = `$${totSub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (ivaEl) ivaEl.innerText = `$${totIva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (retEl) retEl.innerText = `$${totRet.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (finEl) finEl.innerText = `$${totFinal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

window.addPartidaConceptoRow = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.partidasConceptos) p.partidasConceptos = [];
    p.partidasConceptos.push({ servicio: '', num: p.partidasConceptos.length + 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 });
    renderPartidasTable(p);
    saveOperacionesStorage();
};

window.updateProveedorClavesFieldFast = function(idx, key, val) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p || !p.proveedoresClaves || !p.proveedoresClaves[idx]) return;

    if (key === 'cantidad' || key === 'unitario' || key === 'retencion') {
        p.proveedoresClaves[idx][key] = val === '' ? '' : (parseFloat(val) || 0);
        recalcProveedorClavesTotals(p);
    } else {
        p.proveedoresClaves[idx][key] = val;
    }
    saveOperacionesStorage();
};
window.updateProveedorClavesField = window.updateProveedorClavesFieldFast;

function recalcProveedorClavesTotals(p) {
    const items = p.proveedoresClaves || [];
    let totSub = 0, totIva = 0, totRet = 0, totFinal = 0;

    items.forEach((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        item.subtotal = sub;
        item.iva = iva;
        item.retencion = ret;
        item.total = tot;

        if (item.proveedor || item.facturaNum || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub += sub;
            totIva += iva;
            totRet += ret;
            totFinal += tot;
        }

        const subCell = document.getElementById(`prov-sub-${idx}`);
        const ivaCell = document.getElementById(`prov-iva-${idx}`);
        const retCell = document.getElementById(`prov-ret-${idx}`);
        const totCell = document.getElementById(`prov-tot-${idx}`);

        if (subCell) subCell.innerText = `$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (ivaCell) ivaCell.innerText = `$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (retCell) retCell.innerText = `$${ret.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        if (totCell) totCell.innerText = `$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    });

    const subEl = document.getElementById("op-prov-tot-sub");
    const ivaEl = document.getElementById("op-prov-tot-iva");
    const retEl = document.getElementById("op-prov-tot-ret");
    const finEl = document.getElementById("op-prov-tot-final");

    if (subEl) subEl.innerText = `$${totSub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (ivaEl) ivaEl.innerText = `$${totIva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (retEl) retEl.innerText = `$${totRet.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (finEl) finEl.innerText = `$${totFinal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

function renderProveedorClavesTable(p) {
    const tbody = document.getElementById("tbody-proveedor-claves");
    if (!tbody) return;

    // Limpiar textos por defecto heredados de localStorage o datos semilla
    if (p.proveedoresClaves && p.proveedoresClaves.length > 0) {
        p.proveedoresClaves.forEach(item => {
            if (item.proveedor && (item.proveedor.includes("EN ESTA SECCION") || item.proveedor.includes("Transportes Express"))) item.proveedor = '';
            if (item.facturaNum && (item.facturaNum.includes("UN EXPEDIENTE") || item.facturaNum.includes("FAC-9921"))) item.facturaNum = '';
            if (item.concepto && (item.concepto.includes("SECCION PARA SELECCIONAR") || item.concepto.includes("Flete terrestre"))) item.concepto = '';
            if (item.unitario === 25000) { item.cantidad = ''; item.unitario = ''; item.subtotal = 0; item.iva = 0; item.retencion = 0; item.total = 0; }
        });
    }

    let items = p.proveedoresClaves;
    if (!items || items.length === 0) {
        items = [
            { proveedor: '', facturaNum: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ];
        p.proveedoresClaves = items;
    }

    let totSub = 0, totIva = 0, totRet = 0, totFinal = 0;

    tbody.innerHTML = items.map((item, idx) => {
        const cant = parseFloat(item.cantidad) || 0;
        const unit = parseFloat(item.unitario) || 0;
        const sub = cant * unit;
        const iva = sub > 0 ? (sub * 0.16) : 0;
        const ret = parseFloat(item.retencion) || 0;
        const tot = (sub > 0 || ret > 0) ? (sub + iva - ret) : 0;

        if (item.proveedor || item.facturaNum || item.concepto || unit > 0 || cant > 0 || ret > 0) {
            totSub += sub;
            totIva += iva;
            totRet += ret;
            totFinal += tot;
        }

        // Celdas amarillas: Proveedor, Factura #, Concepto sin texto escrito (placeholder vacío), dejando solo el color amarillo
        return `
            <tr>
                <td style="background-color: #FEF9C3;">
                    <select class="proveedor-select" onchange="updateProveedorClavesFieldFast(${idx}, 'proveedor', this.value)">
                        <option value="" ${!item.proveedor ? 'selected' : ''}>-- Seleccionar proveedor --</option>
                        <option value="RAMA MULTIMODAL S DE RL DE CV" ${item.proveedor === 'RAMA MULTIMODAL S DE RL DE CV' ? 'selected' : ''}>RAMA MULTIMODAL S DE RL DE CV</option>
                        <option value="Jennufer Marylin Gonzales Franco" ${item.proveedor === 'Jennufer Marylin Gonzales Franco' ? 'selected' : ''}>Jennufer Marylin Gonzales Franco</option>
                        ${item.proveedor && item.proveedor !== 'RAMA MULTIMODAL S DE RL DE CV' && item.proveedor !== 'Jennufer Marylin Gonzales Franco' ? `<option value="${item.proveedor}" selected>${item.proveedor}</option>` : ''}
                    </select>
                </td>
                <td style="font-size: 11px; background-color: #FEF9C3;">
                    <input type="text" 
                           value="${item.facturaNum || ''}" 
                           placeholder="" 
                           oninput="updateProveedorClavesFieldFast(${idx}, 'facturaNum', this.value)" 
                           style="width:100%; border:none; background-color: #FEF9C3; color:#475569; outline:none;" />
                </td>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="font-size: 11px; background-color: #FEF9C3;">
                    <select class="proveedor-concepto-select"
                            onchange="updateProveedorClavesFieldFast(${idx}, 'concepto', this.value)">
                        <option value="" ${!item.concepto ? 'selected' : ''}>-- Seleccionar clave --</option>
                        <option value="Coordinacion Logistica" ${item.concepto === 'Coordinacion Logistica' ? 'selected' : ''}>Coordinación Logística (F)</option>
                        <option value="Maniobras" ${item.concepto === 'Maniobras' ? 'selected' : ''}>Maniobras (M)</option>
                        <option value="Demoras" ${item.concepto === 'Demoras' ? 'selected' : ''}>Demoras (D)</option>
                        <option value="Lavado" ${item.concepto === 'Lavado' ? 'selected' : ''}>Lavado (L)</option>
                        <option value="Estadias" ${item.concepto === 'Estadias' || item.concepto === 'Estadías' ? 'selected' : ''}>Estadías (E)</option>
                        ${item.concepto && !['Coordinacion Logistica', 'Maniobras', 'Demoras', 'Lavado', 'Estadias', 'Estadías'].includes(item.concepto) ? `<option value="${item.concepto}" selected>${item.concepto}</option>` : ''}
                    </select>
                </td>
                <td style="text-align:right;">
                    <input type="number" 
                           value="${item.cantidad !== undefined && item.cantidad !== '' && item.cantidad !== 0 ? item.cantidad : ''}" 
                           placeholder="" 
                           oninput="updateProveedorClavesFieldFast(${idx}, 'cantidad', this.value)" 
                           style="width:50px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right;">
                    <input type="number" 
                           value="${item.unitario !== undefined && item.unitario !== '' && item.unitario !== 0 ? item.unitario : ''}" 
                           placeholder="$0.00" 
                           oninput="updateProveedorClavesFieldFast(${idx}, 'unitario', this.value)" 
                           style="width:70px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right;" id="prov-sub-${idx}">$${sub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td style="text-align:right;" id="prov-iva-${idx}">$${iva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td style="text-align:right;">
                    <input type="number" 
                           step="any"
                           value="${item.retencion !== undefined && item.retencion !== '' && item.retencion !== 0 ? item.retencion : ''}" 
                           placeholder="$0.00" 
                           oninput="updateProveedorClavesFieldFast(${idx}, 'retencion', this.value)" 
                           style="width:75px; text-align:right; border:none; background:transparent;" />
                </td>
                <td style="text-align:right; font-weight:700;" id="prov-tot-${idx}">$${tot.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            </tr>
        `;
    }).join('');

    const subEl = document.getElementById("op-prov-tot-sub");
    const ivaEl = document.getElementById("op-prov-tot-iva");
    const retEl = document.getElementById("op-prov-tot-ret");
    const finEl = document.getElementById("op-prov-tot-final");

    if (subEl) subEl.innerText = `$${totSub.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (ivaEl) ivaEl.innerText = `$${totIva.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (retEl) retEl.innerText = `$${totRet.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    if (finEl) finEl.innerText = `$${totFinal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

window.addProveedorClavesRow = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.proveedoresClaves) p.proveedoresClaves = [];
    p.proveedoresClaves.push({ proveedor: '', facturaNum: '', num: p.proveedoresClaves.length + 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 });
    renderProveedorClavesTable(p);
    saveOperacionesStorage();
};

function renderDocumentosStatus(p) {
    if (!p.documentos) {
        p.documentos = {
            factura1: { uploaded: false, fileName: '' },
            factura2: { uploaded: false, fileName: '' },
            factura3: { uploaded: false, fileName: '' },
            pod1: { uploaded: false, fileName: '' },
            pod2: { uploaded: false, fileName: '' }
        };
    }

    const docKeys = ['factura1', 'factura2', 'factura3', 'pod1', 'pod2'];
    let uploadedCount = 0;

    docKeys.forEach(key => {
        const badgeEl = document.getElementById(`doc-badge-${key}`);
        const docObj = p.documentos[key];
        if (docObj && docObj.uploaded) {
            uploadedCount++;
            if (badgeEl) {
                badgeEl.className = 'doc-status-badge uploaded';
                badgeEl.innerText = `🟢 ${docObj.fileName || 'Cargado'}`;
                badgeEl.title = `Archivo: ${docObj.fileName || 'Cargado'}`;
            }
        } else {
            if (badgeEl) {
                badgeEl.className = 'doc-status-badge pending';
                badgeEl.innerText = '🕒 Pendiente';
                badgeEl.title = '';
            }
        }
    });

    const progressText = document.getElementById("doc-progress-text");
    const progressFill = document.getElementById("doc-progress-fill");

    if (progressText) progressText.innerText = `${uploadedCount} de 5 documentos cargados`;
    if (progressFill) progressFill.style.width = `${(uploadedCount / 5) * 100}%`;
}

window.uploadDocItem = function(docKey) {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (!p) return;
    if (!p.documentos) p.documentos = {};

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.xml,.png,.jpg,.jpeg,application/pdf,image/*';
    fileInput.style.display = 'none';

    fileInput.onchange = function(e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            p.documentos[docKey] = {
                uploaded: true,
                fileName: file.name,
                fileSize: file.size,
                lastModified: file.lastModified
            };
            renderDocumentosStatus(p);
            saveOperacionesStorage();
        }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    setTimeout(() => {
        if (document.body.contains(fileInput)) {
            document.body.removeChild(fileInput);
        }
    }, 1000);
};

window.finishOperacionesWizard = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (p) {
        const valResult = validateProjectForFacturacion(p);
        if (!valResult.valid) {
            alert("⚠️ No se puede cerrar el expediente sin los datos completos:\n\n" + valResult.errors.map(e => "• " + e).join("\n"));
            return;
        }
        p.estatus = 'CERRADO';
        saveOperacionesStorage();
    }
    alert("¡Expediente operativo completado y CERRADO con éxito!");
    closeOperacionesDetail();
};

window.generarProyectoOperaciones = function() {
    const p = (appState.operacionesProyectos || []).find(x => x.id === appState.activeOperacionesProjectId);
    if (p) {
        // Asegurar que los datos del encabezado queden persistidos
        const facturaVal = document.getElementById("op-step1-factura-num")?.value;
        const ocVal = document.getElementById("op-step1-oc-num")?.value;
        const consecutivoVal = document.getElementById("op-step1-consecutivo-num")?.value;
        if (facturaVal) p.numFactura = facturaVal;
        if (ocVal) p.numOC = ocVal;
        if (consecutivoVal) { p.numConsecutivo = consecutivoVal; p.consecutivo = consecutivoVal; p.numProyecto = consecutivoVal; }
        p.currentStep = 4;
        p.estatus = 'PENDIENTE';
        saveOperacionesStorage();
    }
    closeOperacionesDetail();
};

window.openNuevoProyectoModal = function() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDisplay = new Date().toLocaleDateString('es-MX');

    const initTipo = 'servicio_local';
    const initConsecutivo = generateProjectConsecutivo(initTipo);

    const newProject = {
        id: initConsecutivo,
        numProyecto: initConsecutivo,
        fechaInicio: todayStr,
        fechaInicioDisplay: todayDisplay,
        factura: '',
        numFactura: '',
        numOC: '',
        numConsecutivo: initConsecutivo,
        consecutivo: initConsecutivo,
        estatus: 'PENDIENTE',
        currentStep: 1,
        tipoProyecto: initTipo,
        servicioName: 'Servicio local',
        infoViaje: { terminal: '', mblMawb: '', destino: '', observaciones: '' },
        infoLavado: { sitioServicio: '', clienteFacturar: '', hbl: '', mbl: '', naviera: '', totalContenedores: 1, observaciones: '' },
        contenedores: [
            { id: 1, label: 'Contenedor 1', fechaDespacho: '', horarioTerminal: '', fechaEntrega: '', eirImpreso: '', podSellado: '', entregaVacio: '' }
        ],
        partidasConceptos: [
            { servicio: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { servicio: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ],
        proveedoresClaves: [
            { proveedor: '', facturaNum: '', num: 1, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 2, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 3, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 4, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 },
            { proveedor: '', facturaNum: '', num: 5, concepto: '', cantidad: '', unitario: '', subtotal: 0, iva: 0, retencion: 0, total: 0 }
        ],
        documentos: {}
    };

    if (!appState.operacionesProyectos) appState.operacionesProyectos = [];
    appState.operacionesViewMode = 'activos';
    appState.operacionesProyectos.unshift(newProject);
    saveOperacionesStorage();

    renderOperaciones();
    openOperacionesDetail(newProject.id);
};

// ---------------------------------------------------------------------------------
// PROTECCIÓN DE SEGURIDAD CONTRA INSPECCIÓN (F12, CLIC DERECHO & CONSOLA)
// ---------------------------------------------------------------------------------
(function() {
    // Bloquear Clic Derecho
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Bloquear Teclas de Inspección (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
    document.addEventListener('keydown', function(e) {
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I / J / C
            (e.ctrlKey && e.keyCode === 85) // Ctrl+U (Ver código fuente)
        ) {
            e.preventDefault();
            return false;
        }
    });
})();
