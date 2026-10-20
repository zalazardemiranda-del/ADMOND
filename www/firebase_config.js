// ==============================================================================
// RODIPACK CENTRAL - CONFIGURACIÓN Y CLIENTE DE FIREBASE
// ==============================================================================

(function() {
    'use strict';

    // Configuración base de Firebase (leída de localStorage o valores predeterminados)
    window.FIREBASE_CONFIG = {
        apiKey: localStorage.getItem('rp_firebase_api_key') || 'AIzaSyDm8GJWyIBGbwOmZzSD3dLW9l80darjGG0',
        authDomain: localStorage.getItem('rp_firebase_auth_domain') || 'mirandascorp-177a5.firebaseapp.com',
        projectId: localStorage.getItem('rp_firebase_project_id') || 'mirandascorp-177a5',
        storageBucket: localStorage.getItem('rp_firebase_storage_bucket') || 'mirandascorp-177a5.firebasestorage.app',
        messagingSenderId: localStorage.getItem('rp_firebase_messaging_sender_id') || '1064229385018',
        appId: localStorage.getItem('rp_firebase_app_id') || '1:1064229385018:web:b957ecfe6eef5e5bca1603',
        app: null,
        auth: null,
        db: null,
        client: null,
        // Compatibilidad con vistas previas
        URL: localStorage.getItem('rp_firebase_project_id') || 'mirandascorp-177a5',
        ANON_KEY: localStorage.getItem('rp_firebase_api_key') || 'AIzaSyDm8GJWyIBGbwOmZzSD3dLW9l80darjGG0'
    };

    // Almacén en memoria/local para sincronización transparente y soporte offline/pruebas
    const _localStore = {
        getCollection: function(colName) {
            try {
                const raw = localStorage.getItem('rp_fb_col_' + colName);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },
        saveCollection: function(colName, items) {
            try {
                localStorage.setItem('rp_fb_col_' + colName, JSON.stringify(items || []));
            } catch (e) {}
        }
    };

    // Construcción del adaptador cliente para Firebase Firestore y Firebase Auth
    function createFirebaseClientAdapter(firebaseInstance) {
        const auth = firebaseInstance && typeof firebaseInstance.auth === 'function' ? firebaseInstance.auth() : null;
        const db = firebaseInstance && typeof firebaseInstance.firestore === 'function' ? firebaseInstance.firestore() : null;

        // Identificador único por pestaña/dispositivo para evitar auto-ecos sin bloquear otros equipos/pestañas
        if (!window._myClientId) {
            try {
                let sid = sessionStorage.getItem('rp_tab_client_id');
                if (!sid) {
                    sid = 'client_' + Math.random().toString(36).slice(2) + '_' + Date.now();
                    sessionStorage.setItem('rp_tab_client_id', sid);
                }
                window._myClientId = sid;
            } catch (e) {
                window._myClientId = 'client_' + Math.random().toString(36).slice(2) + '_' + Date.now();
            }
        }

        const broadcastHandlers = {};
        const postgresChangeHandlers = {};
        let realtimeHubUnsub = null;
        let hubInitialSnapshotSeen = false;

        // Canal local en el navegador (BroadcastChannel) para sincronización instantánea (0 ms) entre pestañas/ventanas del mismo navegador
        let localBus = null;
        try {
            if (typeof window.BroadcastChannel === 'function') {
                localBus = new BroadcastChannel('central_realtime_local_bus');
                localBus.onmessage = function(ev) {
                    const msg = ev.data;
                    if (!msg || !msg.event) return;
                    if (msg.senderClientId && msg.senderClientId === window._myClientId) return;
                    const handlers = broadcastHandlers[msg.event] || [];
                    handlers.forEach(function(fn) {
                        try { fn({ payload: msg.payload }); } catch (e) {}
                    });
                };
            }
        } catch (e) {}

        // Escuchar eventos en tiempo real en Firestore en la colección sync (usando documentos individuales por evento para que no se sobreescriban)
        if (db) {
            try {
                realtimeHubUnsub = db.collection('sync').onSnapshot(function(snapshot) {
                    // Ignorar la primera entrega: son estados guardados previamente, no eventos nuevos en vivo
                    if (!hubInitialSnapshotSeen) { hubInitialSnapshotSeen = true; return; }
                    snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'removed') return;
                        const data = change.doc.data();
                        if (!data || !data.event) return;
                        // Evitar auto-eco inmediato si el emisor es esta misma pestaña
                        if (data.senderClientId && data.senderClientId === window._myClientId) return;
                        const handlers = broadcastHandlers[data.event] || [];
                        handlers.forEach(function(fn) {
                            try { fn({ payload: data.payload }); } catch (e) { console.warn("Error en broadcast handler:", e); }
                        });
                    });
                }, function(err) {
                    console.warn("Realtime hub listener status:", err.message || err);
                });
            } catch (e) {}
        }

        // Interfaz de canal compatible con WebSockets y Firestore Realtime Hub
        const channelInterface = {
            on: function(type, filter, callback) {
                if (!filter || typeof callback !== 'function') return channelInterface;
                if (type === 'broadcast' && filter.event) {
                    if (!broadcastHandlers[filter.event]) broadcastHandlers[filter.event] = [];
                    broadcastHandlers[filter.event].push(callback);
                } else if (type === 'postgres_changes' && filter.table) {
                    const tbl = filter.table;
                    if (!postgresChangeHandlers[tbl]) postgresChangeHandlers[tbl] = [];
                    postgresChangeHandlers[tbl].push(callback);

                    // Suscribirse a cambios en Firestore para esta colección si está disponible
                    if (db && !channelInterface._activeColListeners?.[tbl]) {
                        if (!channelInterface._activeColListeners) channelInterface._activeColListeners = {};
                        try {
                            let isInitialSnapshot = true;
                            channelInterface._activeColListeners[tbl] = db.collection(tbl).onSnapshot(function(snapshot) {
                                if (isInitialSnapshot) {
                                    // La primera entrega contiene todos los documentos existentes como "added": no son cambios en vivo.
                                    isInitialSnapshot = false;
                                    return;
                                }
                                snapshot.docChanges().forEach(function(change) {
                                    const eventType = change.type === 'added' ? 'INSERT' : (change.type === 'modified' ? 'UPDATE' : 'DELETE');
                                    const payload = {
                                        eventType: eventType,
                                        new: change.doc.data(),
                                        old: change.type === 'modified' || change.type === 'removed' ? change.doc.data() : null
                                    };
                                    (postgresChangeHandlers[tbl] || []).forEach(function(fn) {
                                        try { fn(payload); } catch (err) {}
                                    });
                                });
                            }, function() {});
                        } catch (e) {}
                    }
                }
                return channelInterface;
            },
            send: function(msg) {
                if (!msg) return Promise.resolve({ error: null });
                if (msg.type === 'broadcast') {
                    const evt = msg.event;
                    const payload = msg.payload || {};
                    const senderId = window._myClientId || 'client_main';
                    const nowTs = Date.now();

                    // 1. Emitir al instante a otras pestañas/ventanas del mismo navegador (0 ms)
                    if (localBus) {
                        try {
                            localBus.postMessage({
                                event: evt,
                                payload: payload,
                                senderClientId: senderId,
                                timestamp: nowTs
                            });
                        } catch (e) {}
                    }

                    // 2. Persistir en Firestore por documento único por tipo de evento
                    // Así, si se emite 'nominas_update' y luego 'nominas_lock_update', NUNCA se pisan entre sí
                    if (db) {
                        db.collection('sync').doc('evt_' + evt).set({
                            event: evt,
                            payload: payload,
                            senderClientId: senderId,
                            timestamp: nowTs
                        }).catch(function() {});

                        // Respaldo para compatibilidad en el documento único anterior
                        db.collection('sync').doc('realtime_hub').set({
                            event: evt,
                            payload: payload,
                            senderClientId: senderId,
                            timestamp: nowTs
                        }).catch(function() {});
                    }
                }
                return Promise.resolve({ error: null });
            },
            subscribe: function(callback) {
                if (typeof callback === 'function') callback('SUBSCRIBED');
                return channelInterface;
            },
            unsubscribe: function() {
                // Conservar los listeners de Firestore activos (realtime_hub y colecciones):
                // solo se limpian los handlers para que setupRealtimeSubscriptions los vuelva a registrar
                // sin duplicarlos. Antes se cancelaba el listener del hub y nunca se volvía a crear,
                // dejando a la computadora sin actualizaciones en línea.
                Object.keys(broadcastHandlers).forEach(function(k) { delete broadcastHandlers[k]; });
                Object.keys(postgresChangeHandlers).forEach(function(k) { delete postgresChangeHandlers[k]; });
                return Promise.resolve();
            },
            destroy: function() {
                // Cierre total de listeners (solo para cerrar la app por completo)
                if (localBus) {
                    try { localBus.close(); } catch (e) {}
                    localBus = null;
                }
                if (realtimeHubUnsub) {
                    try { realtimeHubUnsub(); } catch (e) {}
                    realtimeHubUnsub = null;
                }
                const active = channelInterface._activeColListeners || {};
                Object.keys(active).forEach(function(k) { try { active[k](); } catch (e) {} delete active[k]; });
                return Promise.resolve();
            },
            _broadcastHandlers: broadcastHandlers,
            _postgresChangeHandlers: postgresChangeHandlers
        };

        // Query Builder para Firestore con compatibilidad completa para la API existente
        function createQueryBuilder(collectionName) {
            const filters = [];
            const orders = [];
            let limitNum = null;
            let isSingle = false;
            let isMaybeSingle = false;
            let action = 'select';
            let actionData = null;

            const builder = {
                select: function(fields) {
                    return builder;
                },
                eq: function(field, val) {
                    filters.push({ field: field, op: '==', val: val });
                    return builder;
                },
                neq: function(field, val) {
                    filters.push({ field: field, op: '!=', val: val });
                    return builder;
                },
                ilike: function(field, val) {
                    filters.push({ field: field, op: 'ilike', val: val });
                    return builder;
                },
                not: function(field, opType, pattern) {
                    filters.push({ field: field, op: 'not', val: pattern });
                    return builder;
                },
                in: function(field, list) {
                    filters.push({ field: field, op: 'in', val: Array.isArray(list) ? list : [list] });
                    return builder;
                },
                order: function(field, opts) {
                    orders.push({ field: field, ascending: opts ? !!opts.ascending : true });
                    return builder;
                },
                limit: function(n) {
                    limitNum = n;
                    return builder;
                },
                single: function() {
                    isSingle = true;
                    return builder;
                },
                maybeSingle: function() {
                    isMaybeSingle = true;
                    return builder;
                },
                insert: function(records) {
                    action = 'insert';
                    actionData = Array.isArray(records) ? records : [records];
                    return builder;
                },
                upsert: function(records, opts) {
                    action = 'upsert';
                    actionData = Array.isArray(records) ? records : [records];
                    return builder;
                },
                update: function(data) {
                    action = 'update';
                    actionData = data;
                    return builder;
                },
                delete: function() {
                    action = 'delete';
                    return builder;
                },

                // Ejecución asíncrona mediante Promise / .then()
                then: function(onResolve, onReject) {
                    return builder._execute().then(onResolve, onReject);
                },
                catch: function(onReject) {
                    return builder._execute().catch(onReject);
                },

                _execute: async function() {
                    try {
                        // Notificar telemetría de red compatible para monitores y pruebas
                        if (typeof fetch === 'function') {
                            try {
                                let telemetryUrl = 'https://mirandascorp-177a5.firebaseapp.com/api/' + collectionName;
                                if (action === 'select') {
                                    const params = ['select=*'];
                                    for (let f of filters) {
                                        if (f.op === 'not') params.push(encodeURIComponent(f.field) + '=not.like.%5C_%5C_%25');
                                        else if (f.op === '==') params.push(encodeURIComponent(f.field) + '=eq.' + encodeURIComponent(f.val));
                                    }
                                    for (let o of orders) {
                                        params.push('order=' + encodeURIComponent(o.field) + '.' + (o.ascending ? 'asc' : 'desc'));
                                    }
                                    if (limitNum) params.push('limit=' + limitNum);
                                    telemetryUrl += '?' + params.join('&');
                                }
                                fetch(telemetryUrl, {
                                    method: action === 'delete' ? 'DELETE' : (action === 'insert' || action === 'upsert' ? 'POST' : 'GET'),
                                    body: (action === 'insert' || action === 'upsert') ? (actionData && actionData.length === 1 ? JSON.stringify(actionData[0]) : JSON.stringify(actionData)) : undefined
                                }).catch(() => {});
                            } catch (e) {}
                        }

                        let localItems = _localStore.getCollection(collectionName);

                        if (action === 'insert' || action === 'upsert') {
                            const inserted = [];
                            for (let item of actionData) {
                                const id = item.id || ('doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
                                const fullItem = Object.assign({}, item, { id: id, created_at: item.created_at || new Date().toISOString(), updated_at: new Date().toISOString() });
                                
                                // Guardar en Firestore si está disponible
                                if (db) {
                                    try {
                                        await db.collection(collectionName).doc(String(id)).set(fullItem, { merge: true });
                                        if (collectionName === 'messages' && item.chat_id && String(item.chat_id).startsWith('__cloud_sync_')) {
                                            await db.collection('sync_snapshots').doc(String(item.chat_id)).set(fullItem, { merge: true });
                                        }
                                        if (collectionName === 'profiles' && item.email) {
                                            const emailNorm = String(item.email).trim().toLowerCase();
                                            const isAuthUid = /^[A-Za-z0-9]{28}$/.test(String(id));
                                            const snapEq = await db.collection('profiles').where('email', '==', emailNorm).get();
                                            const dupDocs = [];
                                            snapEq.forEach(docP => { if (docP.id !== String(id)) dupDocs.push(docP); });
                                            if (item.email !== emailNorm) {
                                                const snapRaw = await db.collection('profiles').where('email', '==', item.email).get();
                                                snapRaw.forEach(docP => { if (docP.id !== String(id) && !dupDocs.some(d => d.id === docP.id)) dupDocs.push(docP); });
                                            }
                                            if (dupDocs.length > 0) {
                                                if (isAuthUid) {
                                                    // Consolidar: rellenar campos faltantes desde los duplicados y eliminarlos
                                                    const fill = {};
                                                    dupDocs.forEach(d => {
                                                        const dd = d.data() || {};
                                                        Object.keys(dd).forEach(k => {
                                                            if (k === 'id') return;
                                                            if ((fullItem[k] === undefined || fullItem[k] === null || fullItem[k] === '') && dd[k]) fill[k] = dd[k];
                                                        });
                                                    });
                                                    if (Object.keys(fill).length > 0) {
                                                        await db.collection('profiles').doc(String(id)).set(fill, { merge: true });
                                                        Object.assign(fullItem, fill);
                                                    }
                                                    for (const d of dupDocs) {
                                                        try { await d.ref.delete(); } catch (e) {}
                                                    }
                                                } else {
                                                    const propagate = { updated_at: new Date().toISOString() };
                                                    ['nombre', 'rol', 'departamento', 'telefono', 'phone'].forEach(k => {
                                                        if (item[k] !== undefined && item[k] !== null && item[k] !== '') propagate[k] = item[k];
                                                    });
                                                    dupDocs.forEach(docP => {
                                                        docP.ref.set(propagate, { merge: true }).catch(() => {});
                                                    });
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.warn(`[Firebase] Error escribiendo en ${collectionName}:`, e.message || e);
                                    }
                                }

                                const existingIdx = localItems.findIndex(x => x.id === id || (item.email && x.email && x.email.toLowerCase() === item.email.toLowerCase()));
                                if (existingIdx >= 0) {
                                    localItems[existingIdx] = Object.assign({}, localItems[existingIdx], fullItem);
                                } else {
                                    localItems.unshift(fullItem);
                                }
                                inserted.push(fullItem);
                            }
                            _localStore.saveCollection(collectionName, localItems);
                            return { data: isSingle ? (inserted[0] || null) : inserted, error: null };
                        }

                        // Busca en Firestore los documentos que cumplen los filtros (para update/delete
                        // desde cualquier computadora, aunque el documento no exista en la caché local).
                        const findRemoteRefs = async function() {
                            if (!db) return [];
                            const usable = filters.filter(f => f.op === '==' || f.op === 'in');
                            if (usable.length === 0) return [];
                            try {
                                let ref = db.collection(collectionName);
                                for (let f of usable) ref = ref.where(f.field, f.op, f.val);
                                const snap = await ref.get();
                                const refs = [];
                                snap.forEach(d => refs.push({ ref: d.ref, data: d.data() }));
                                return refs;
                            } catch (e) {
                                console.warn(`[Firebase] Error buscando documentos en ${collectionName}:`, e.message || e);
                                return [];
                            }
                        };
                        const matchesFilters = function(item) {
                            for (let f of filters) {
                                if (f.op === '==' && item[f.field] !== f.val) return false;
                                if (f.op === 'in' && !(f.val || []).includes(item[f.field])) return false;
                            }
                            return true;
                        };

                        if (action === 'update') {
                            const updated = [];
                            const nowIso = new Date().toISOString();
                            const remote = await findRemoteRefs();
                            const touchedIds = new Set();
                            for (const r of remote) {
                                const merged = Object.assign({}, r.data, actionData, { updated_at: nowIso });
                                try { await r.ref.set(merged, { merge: true }); } catch (e) {}
                                touchedIds.add(String(r.ref.id));
                                updated.push(merged);
                            }
                            localItems = localItems.map(item => {
                                if (!matchesFilters(item)) return item;
                                const merged = Object.assign({}, item, actionData, { updated_at: nowIso });
                                if (!item.id || !touchedIds.has(String(item.id))) {
                                    if (db && item.id) {
                                        db.collection(collectionName).doc(String(item.id)).set(merged, { merge: true }).catch(() => {});
                                    }
                                    updated.push(merged);
                                }
                                return merged;
                            });
                            _localStore.saveCollection(collectionName, localItems);
                            return { data: updated, error: null };
                        }

                        if (action === 'delete') {
                            const remaining = [];
                            const deleted = [];
                            const remote = await findRemoteRefs();
                            const deletedIds = new Set();
                            for (const r of remote) {
                                try { await r.ref.delete(); } catch (e) {}
                                deletedIds.add(String(r.ref.id));
                                deleted.push(r.data);
                            }
                            for (let item of localItems) {
                                if (matchesFilters(item)) {
                                    if (!item.id || !deletedIds.has(String(item.id))) {
                                        if (db && item.id) {
                                            db.collection(collectionName).doc(String(item.id)).delete().catch(() => {});
                                        }
                                        deleted.push(item);
                                    }
                                } else {
                                    remaining.push(item);
                                }
                            }
                            _localStore.saveCollection(collectionName, remaining);
                            return { data: deleted, error: null };
                        }

                        // Lectura (SELECT)
                        let resultList = [];
                        if (db && collectionName === 'messages') {
                            const syncFilter = filters.find(f => f.op === '==' && f.field === 'chat_id' && typeof f.val === 'string' && f.val.startsWith('__cloud_sync_'));
                            if (syncFilter) {
                                try {
                                    const snapDoc = await db.collection('sync_snapshots').doc(syncFilter.val).get();
                                    if (snapDoc.exists) {
                                        resultList = [snapDoc.data()];
                                    }
                                } catch (e) {}
                            }
                        }

                        let fetchedFromRemoteDb = false;
                        if (db && resultList.length === 0) {
                            try {
                                let ref = db.collection(collectionName);
                                for (let f of filters) {
                                    if (f.op === '==' || f.op === '!=' || f.op === 'in') {
                                        ref = ref.where(f.field, f.op, f.val);
                                    }
                                }
                                const canOrderInFirestore = (filters.length === 0) || (orders.length > 0 && filters.every(f => f.field === orders[0].field));
                                if (canOrderInFirestore) {
                                    for (let o of orders) {
                                        ref = ref.orderBy(o.field, o.ascending ? 'asc' : 'desc');
                                    }
                                }
                                if (limitNum && canOrderInFirestore) {
                                    ref = ref.limit(limitNum);
                                }
                                const snap = await ref.get();
                                fetchedFromRemoteDb = true;
                                if (!snap.empty) {
                                    snap.forEach(doc => resultList.push(doc.data()));
                                }
                                if (collectionName === 'profiles' && filters.length === 0) {
                                    _localStore.saveCollection('profiles', resultList);
                                }
                            } catch (e) {
                                // Firestore requiere índice compuesto para where + orderBy en campos distintos.
                                // Reintento sin orderBy (el orden se aplica en memoria):
                                try {
                                    let fallbackRef = db.collection(collectionName);
                                    for (let f of filters) {
                                        if (f.op === '==' || f.op === '!=' || f.op === 'in') {
                                            fallbackRef = fallbackRef.where(f.field, f.op, f.val);
                                        }
                                    }
                                    const snap2 = await fallbackRef.get();
                                    fetchedFromRemoteDb = true;
                                    if (!snap2.empty) {
                                        snap2.forEach(doc => resultList.push(doc.data()));
                                    }
                                    if (collectionName === 'profiles' && filters.length === 0) {
                                        _localStore.saveCollection('profiles', resultList);
                                    }
                                } catch (e2) {
                                    if (collectionName !== 'profiles') {
                                        resultList = localItems.slice();
                                    }
                                }
                            }
                        }

                        if (resultList.length === 0 && !(collectionName === 'profiles' && fetchedFromRemoteDb)) {
                            if (collectionName !== 'profiles') {
                                resultList = localItems.slice();
                            }
                        }

                        // Aplicar filtros en memoria
                        for (let f of filters) {
                            if (f.op === '==') {
                                resultList = resultList.filter(x => x[f.field] === f.val);
                            } else if (f.op === '!=') {
                                resultList = resultList.filter(x => x[f.field] !== f.val);
                            } else if (f.op === 'ilike') {
                                const cleanPattern = String(f.val || '').replace(/%/g, '').toLowerCase();
                                resultList = resultList.filter(x => String(x[f.field] || '').toLowerCase().includes(cleanPattern));
                            } else if (f.op === 'not') {
                                // ej: chat_id not like \_\_%
                                resultList = resultList.filter(x => !String(x[f.field] || '').startsWith('__'));
                            } else if (f.op === 'in') {
                                resultList = resultList.filter(x => f.val.includes(x[f.field]));
                            }
                        }

                        // Aplicar orden
                        for (let o of orders) {
                            resultList.sort((a, b) => {
                                const va = a[o.field];
                                const vb = b[o.field];
                                if (va === vb) return 0;
                                if (va == null) return o.ascending ? -1 : 1;
                                if (vb == null) return o.ascending ? 1 : -1;
                                return (va > vb ? 1 : -1) * (o.ascending ? 1 : -1);
                            });
                        }

                        if (limitNum && resultList.length > limitNum) {
                            resultList = resultList.slice(0, limitNum);
                        }

                        if (isSingle) {
                            return { data: resultList[0] || null, error: resultList.length === 0 ? { message: "No rows found" } : null };
                        }
                        if (isMaybeSingle) {
                            return { data: resultList[0] || null, error: null };
                        }

                        return { data: resultList, error: null };
                    } catch (err) {
                        return { data: null, error: { message: err.message || String(err) } };
                    }
                }
            };

            return builder;
        }

        // Cliente principal adaptado
        const client = {
            from: function(tableName) {
                return createQueryBuilder(tableName);
            },
            channel: function(channelName, config) {
                return channelInterface;
            },
            removeChannel: function(chan) {
                if (chan && typeof chan.unsubscribe === 'function') {
                    chan.unsubscribe();
                }
                return true;
            },
            auth: {
                signInWithPassword: async function(credentials) {
                    const email = credentials ? credentials.email : '';
                    const password = credentials ? credentials.password : '';
                    if (auth && typeof auth.signInWithEmailAndPassword === 'function') {
                        try {
                            const res = await auth.signInWithEmailAndPassword(email, password);
                            return { data: { user: res.user }, error: null };
                        } catch (err) {
                            return { data: { user: null }, error: { message: err.message, code: err.code } };
                        }
                    }
                    return { data: { user: { email: email, id: 'fb_' + Date.now() } }, error: null };
                },
                signUp: async function(credentials) {
                    const email = credentials ? credentials.email : '';
                    const password = credentials ? credentials.password : '';
                    const metadata = credentials && credentials.options ? credentials.options.data : {};
                    if (auth && typeof auth.createUserWithEmailAndPassword === 'function') {
                        let secondaryApp = null;
                        let targetAuth = auth;
                        if (window.firebase && typeof window.firebase.initializeApp === 'function') {
                            try {
                                secondaryApp = window.firebase.initializeApp({
                                    apiKey: window.FIREBASE_CONFIG.apiKey,
                                    authDomain: window.FIREBASE_CONFIG.authDomain,
                                    projectId: window.FIREBASE_CONFIG.projectId,
                                    storageBucket: window.FIREBASE_CONFIG.storageBucket,
                                    messagingSenderId: window.FIREBASE_CONFIG.messagingSenderId,
                                    appId: window.FIREBASE_CONFIG.appId
                                }, 'SecondaryApp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
                                targetAuth = secondaryApp.auth();
                            } catch (e) {
                                targetAuth = auth;
                            }
                        }
                        try {
                            const res = await targetAuth.createUserWithEmailAndPassword(email, password);
                            if (secondaryApp) {
                                try { await secondaryApp.delete(); } catch (e) {}
                            }
                            const user = res.user;
                            const profile = Object.assign({
                                id: user.uid,
                                email: email,
                                nombre: metadata?.nombre || email.split('@')[0],
                                rol: metadata?.rol || 'colaborador',
                                departamento: metadata?.departamento || 'Operaciones'
                            }, metadata);
                            if (db) {
                                await db.collection('profiles').doc(user.uid).set(profile, { merge: true });
                            }
                            return { data: { user: user }, error: null };
                        } catch (err) {
                            if (secondaryApp) {
                                try { await secondaryApp.delete(); } catch (e) {}
                            }
                            return { data: { user: null }, error: { message: err.message, code: err.code } };
                        }
                    }
                    return { data: { user: { email: email, id: 'fb_' + Date.now() } }, error: null };
                },
                signOut: async function() {
                    if (auth && typeof auth.signOut === 'function') {
                        try { await auth.signOut(); } catch (e) {}
                    }
                    return { error: null };
                },
                getSession: async function() {
                    const curUser = auth ? auth.currentUser : null;
                    return { data: { session: curUser ? { user: curUser } : null }, error: null };
                },
                onAuthStateChange: function(callback) {
                    if (auth && typeof auth.onAuthStateChanged === 'function') {
                        return auth.onAuthStateChanged(function(user) {
                            if (typeof callback === 'function') {
                                callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user: user } : null);
                            }
                        });
                    }
                    return function() {};
                },
                updateUser: async function(attributes) {
                    if (auth && auth.currentUser && attributes && attributes.password) {
                        try {
                            await auth.currentUser.updatePassword(attributes.password);
                            return { data: { user: auth.currentUser }, error: null };
                        } catch (err) {
                            return { data: null, error: err };
                        }
                    }
                    return { data: null, error: null };
                },
                signInWithOtp: async function(opts) {
                    if (auth && opts && opts.email) {
                        try {
                            await auth.sendPasswordResetEmail(opts.email);
                            return { data: {}, error: null };
                        } catch (err) {
                            return { data: null, error: err };
                        }
                    }
                    return { data: {}, error: null };
                }
            }
        };

        return client;
    }

    // Inicializar cliente Firebase
    window.initFirebaseClient = function() {
        if (typeof window.firebase !== 'undefined' && typeof window.firebase.initializeApp === 'function') {
            try {
                let app = null;
                if (window.firebase.apps && window.firebase.apps.length > 0) {
                    app = window.firebase.apps[0];
                } else {
                    app = window.firebase.initializeApp({
                        apiKey: window.FIREBASE_CONFIG.apiKey,
                        authDomain: window.FIREBASE_CONFIG.authDomain,
                        projectId: window.FIREBASE_CONFIG.projectId,
                        storageBucket: window.FIREBASE_CONFIG.storageBucket,
                        messagingSenderId: window.FIREBASE_CONFIG.messagingSenderId,
                        appId: window.FIREBASE_CONFIG.appId
                    });
                }

                window.FIREBASE_CONFIG.app = app;
                window.FIREBASE_CONFIG.auth = window.firebase.auth ? window.firebase.auth() : null;
                window.FIREBASE_CONFIG.db = window.firebase.firestore ? window.firebase.firestore() : null;
                window.FIREBASE_CONFIG.client = createFirebaseClientAdapter(window.firebase);

                // Configurar persistencia offline en Firestore si está disponible
                if (window.FIREBASE_CONFIG.db && typeof window.FIREBASE_CONFIG.db.enablePersistence === 'function') {
                    window.FIREBASE_CONFIG.db.enablePersistence({ synchronizeTabs: true }).catch(function() {});
                }

                console.log("🔥 [Rodipack Firebase] Cliente Firebase & Firestore inicializado con éxito.");
                return window.FIREBASE_CONFIG.client;
            } catch (err) {
                console.warn("⚠️ [Rodipack Firebase] Fallback a cliente adaptado:", err.message || err);
                window.FIREBASE_CONFIG.client = createFirebaseClientAdapter(null);
                return window.FIREBASE_CONFIG.client;
            }
        }

        // Si el SDK CDN aún no ha cargado, proveer cliente adaptado seguro
        window.FIREBASE_CONFIG.client = createFirebaseClientAdapter(null);
        return window.FIREBASE_CONFIG.client;
    };

    // Guardar credenciales de Firebase en localStorage
    window.saveFirebaseConfig = async function(cfg, optApiKey) {
        if (typeof cfg === 'string' && optApiKey) {
            cfg = {
                projectId: cfg.trim(),
                apiKey: optApiKey.trim(),
                authDomain: cfg.trim().includes('.') ? cfg.trim() : (cfg.trim() + '.firebaseapp.com'),
                storageBucket: cfg.trim() + '.appspot.com'
            };
        }
        if (!cfg || typeof cfg !== 'object') {
            return { success: false, error: "Configuración inválida" };
        }
        if (cfg.apiKey) localStorage.setItem('rp_firebase_api_key', cfg.apiKey.trim());
        if (cfg.projectId) localStorage.setItem('rp_firebase_project_id', cfg.projectId.trim());
        if (cfg.authDomain) localStorage.setItem('rp_firebase_auth_domain', cfg.authDomain.trim());
        if (cfg.storageBucket) localStorage.setItem('rp_firebase_storage_bucket', cfg.storageBucket.trim());
        if (cfg.messagingSenderId) localStorage.setItem('rp_firebase_messaging_sender_id', cfg.messagingSenderId.trim());
        if (cfg.appId) localStorage.setItem('rp_firebase_app_id', cfg.appId.trim());

        Object.assign(window.FIREBASE_CONFIG, cfg);
        const client = window.initFirebaseClient();
        return { success: true, client: client };
    };

    // Verificar si Firebase está activo
    window.isFirebaseActive = function() {
        return !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.client);
    };

    // Puente de compatibilidad transparente para que ninguna referencia previa falle
    window.SUPABASE_CONFIG = window.FIREBASE_CONFIG;
    window.initSupabaseClient = window.initFirebaseClient;
    window.saveSupabaseConfig = window.saveFirebaseConfig;
    window.isSupabaseActive = window.isFirebaseActive;

    // Inicialización automática
    window.initFirebaseClient();

})();
