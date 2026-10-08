// ==============================================================================
// RODIPACK CENTRAL - CONFIGURACIÓN Y CLIENTE DE SUPABASE
// ==============================================================================

window.SUPABASE_CONFIG = {
    URL: localStorage.getItem('rp_supabase_url') || 'https://fwrwqhdntccxgtqlyuux.supabase.co',
    ANON_KEY: localStorage.getItem('rp_supabase_anon_key') || 'sb_publishable_ueIjJmXAzHIu2NQc3FzLMg_Nq3SsUYR',
    client: null
};

// Inicializar cliente Supabase si las credenciales están disponibles
window.initSupabaseClient = function() {
    const url = window.SUPABASE_CONFIG.URL.trim();
    const key = window.SUPABASE_CONFIG.ANON_KEY.trim();
    
    if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            window.SUPABASE_CONFIG.client = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });
            console.log("⚡ [Rodipack Supabase] Cliente inicializado correctamente.");
            return window.SUPABASE_CONFIG.client;
        } catch (err) {
            console.error("❌ Error al instanciar cliente Supabase:", err);
            return null;
        }
    }
    return null;
};

// Guardar credenciales de Supabase en localStorage
window.saveSupabaseConfig = async function(url, key) {
    if (!url || !key) return { success: false, error: "URL y Anon Key son requeridos" };
    
    localStorage.setItem('rp_supabase_url', url.trim());
    localStorage.setItem('rp_supabase_anon_key', key.trim());
    window.SUPABASE_CONFIG.URL = url.trim();
    window.SUPABASE_CONFIG.ANON_KEY = key.trim();
    
    const client = window.initSupabaseClient();
    if (!client) {
        return { success: false, error: "No se pudo conectar. Verifica tus credenciales." };
    }
    
    return { success: true, client };
};

// Verificar si Supabase está activo
window.isSupabaseActive = function() {
    return !!(window.SUPABASE_CONFIG.client && window.SUPABASE_CONFIG.URL && window.SUPABASE_CONFIG.ANON_KEY);
};
