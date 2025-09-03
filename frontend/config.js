// Configurazione Frontend - Movie Collection WebApp
// ================================================

const CONFIG = {
    // Configurazione API Backend
    api: {
        // URL base del backend API
        // Esempi:
        //   - Sviluppo locale: 'http://localhost:3001'
        //   - Rete locale: 'http://192.168.1.100:3001'
        //   - Produzione: 'https://api.yourdomain.com'
        baseUrl: 'http://localhost:3001',
        
        // Porta del backend (usata per auto-configurazione se baseUrl è 'auto')
        port: 3001,
        
        // Modalità di configurazione
        // 'auto': determina automaticamente l'URL basandosi sull'hostname corrente
        // 'manual': usa l'URL specificato in baseUrl
        mode: 'auto',
        
        // Timeout per le richieste API (in millisecondi)
        timeout: 10000,
        
        // Abilita cache API
        enableCache: true,
        
        // Durata cache API (in millisecondi) - default 5 minuti
        cacheDuration: 5 * 60 * 1000
    },
    
    // Configurazione ambiente
    environment: {
        // Modalità debug
        debug: true,
        
        // Ambiente di esecuzione
        nodeEnv: 'development'
    },
    
    // Configurazione UI
    ui: {
        // Numero di film per pagina
        itemsPerPage: 20,
        
        // Abilita animazioni
        enableAnimations: true,
        
        // Tema predefinito
        defaultTheme: 'light'
    }
};

// Funzione per ottenere la configurazione API
function getApiConfig() {
    if (CONFIG.api.mode === 'auto') {
        // Determina automaticamente l'URL del backend
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // In sviluppo locale o quando si accede tramite localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return {
                ...CONFIG.api,
                baseUrl: `${protocol}//localhost:${CONFIG.api.port}`
            };
        }
        
        // Quando si accede tramite IP di rete (LAN), usa lo stesso IP per il backend
        return {
            ...CONFIG.api,
            baseUrl: `${protocol}//${hostname}:${CONFIG.api.port}`
        };
    }
    
    // Modalità manuale - usa l'URL specificato
    return CONFIG.api;
}

// Funzione per aggiornare la configurazione runtime
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('📝 Configurazione aggiornata:', CONFIG);
}

// Funzione per validare la configurazione
function validateConfig() {
    const apiConfig = getApiConfig();
    const errors = [];
    
    if (!apiConfig.baseUrl) {
        errors.push('URL base API non specificato');
    }
    
    if (!apiConfig.port || isNaN(apiConfig.port)) {
        errors.push('Porta backend non valida');
    }
    
    if (apiConfig.timeout < 1000) {
        errors.push('Timeout API troppo basso (minimo 1000ms)');
    }
    
    if (errors.length > 0) {
        console.error('❌ Errori di configurazione:', errors);
        return false;
    }
    
    console.log('✅ Configurazione valida');
    return true;
}

// Funzione per debug della configurazione
function debugConfig() {
    if (CONFIG.environment.debug) {
        console.group('🔧 Configurazione Movie Collection App');
        console.log('API Config:', getApiConfig());
        console.log('Environment:', CONFIG.environment);
        console.log('UI Config:', CONFIG.ui);
        console.log('Hostname corrente:', window.location.hostname);
        console.log('Protocol corrente:', window.location.protocol);
        console.groupEnd();
    }
}

// Esporta configurazione per uso globale
window.CONFIG = CONFIG;
window.getApiConfig = getApiConfig;
window.updateConfig = updateConfig;
window.validateConfig = validateConfig;
window.debugConfig = debugConfig;

// Valida configurazione all'avvio
document.addEventListener('DOMContentLoaded', () => {
    validateConfig();
    debugConfig();
});

// Esporta per moduli ES6 se necessario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        getApiConfig,
        updateConfig,
        validateConfig,
        debugConfig
    };
}
