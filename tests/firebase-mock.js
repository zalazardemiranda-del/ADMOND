// Mock para Firebase SDK en pruebas automatizadas Playwright
(function() {
    'use strict';
    if (!window.firebase) {
        window.firebase = {
            apps: [],
            initializeApp: function(config) {
                const app = { name: '[DEFAULT]', options: config };
                window.firebase.apps = [app];
                return app;
            },
            app: function() {
                return window.firebase.apps[0] || window.firebase.initializeApp({});
            },
            auth: function() {
                return {
                    currentUser: null,
                    signInWithEmailAndPassword: async function(email) {
                        return { user: { uid: 'usr_test_1', email: email } };
                    },
                    createUserWithEmailAndPassword: async function(email) {
                        return { user: { uid: 'usr_test_1', email: email } };
                    },
                    signOut: async function() {},
                    onAuthStateChanged: function(cb) {
                        cb(null);
                        return function() {};
                    },
                    updatePassword: async function() {},
                    sendPasswordResetEmail: async function() {}
                };
            },
            firestore: function() {
                const makeDoc = function(docId) {
                    return {
                        id: docId,
                        set: async function() {},
                        get: async function() { return { exists: false, data: function() { return null; } }; },
                        delete: async function() {},
                        onSnapshot: function(cb) { return function() {}; }
                    };
                };
                const makeCol = function(colName) {
                    return {
                        doc: function(id) { return makeDoc(id); },
                        where: function() { return makeCol(colName); },
                        orderBy: function() { return makeCol(colName); },
                        limit: function() { return makeCol(colName); },
                        get: async function() { return { empty: true, forEach: function() {} }; },
                        onSnapshot: function(cb) { return function() {}; }
                    };
                };
                return {
                    collection: function(name) { return makeCol(name); },
                    enablePersistence: async function() {}
                };
            }
        };
    }
})();
