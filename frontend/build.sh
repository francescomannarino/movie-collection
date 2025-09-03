#!/bin/bash
# build.sh - Script per preparare il frontend per il deploy
# ========================================================

set -e

# Configurazione
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
BUILD_DIR="./dist"
SOURCE_DIR="./public"

echo "🏗️  Preparazione frontend per deploy..."
echo "🔗 Backend URL: $BACKEND_URL"

# Pulisci directory di build precedente
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copia tutti i file dalla cartella public
echo "📁 Copia file statici..."
cp -r "$SOURCE_DIR"/* "$BUILD_DIR/"

# Crea config.js personalizzato per il deploy
echo "⚙️  Configurazione backend..."
cat > "$BUILD_DIR/config.js" << EOF
// Configurazione Frontend - Movie Collection WebApp (Deploy Build)
// ================================================================

const CONFIG = {
    api: {
        baseUrl: '$BACKEND_URL',
        port: 3001,
        mode: 'manual',
        timeout: 10000,
        enableCache: true,
        cacheDuration: 5 * 60 * 1000
    },
    
    environment: {
        debug: false,
        nodeEnv: 'production'
    },
    
    ui: {
        itemsPerPage: 20,
        enableAnimations: true,
        defaultTheme: 'light'
    }
};

// Funzione per ottenere la configurazione API
function getApiConfig() {
    return CONFIG.api;
}

// Funzioni di utilità
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('📝 Configurazione aggiornata:', CONFIG);
}

function validateConfig() {
    const apiConfig = getApiConfig();
    const errors = [];
    
    if (!apiConfig.baseUrl) {
        errors.push('URL base API non specificato');
    }
    
    if (errors.length > 0) {
        console.error('❌ Errori di configurazione:', errors);
        return false;
    }
    
    console.log('✅ Configurazione valida');
    return true;
}

function debugConfig() {
    if (CONFIG.environment.debug) {
        console.group('🔧 Configurazione Movie Collection App');
        console.log('API Config:', getApiConfig());
        console.log('Environment:', CONFIG.environment);
        console.log('UI Config:', CONFIG.ui);
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
EOF

# Modifica index.html per caricare config.js dalla stessa cartella
echo "📝 Aggiornamento riferimenti..."
sed -i.bak 's|src="../config.js"|src="config.js"|g' "$BUILD_DIR/index.html"
rm -f "$BUILD_DIR/index.html.bak" 2>/dev/null || true

echo "✅ Build completato!"
echo "📦 File pronti per deploy in: $BUILD_DIR"
echo ""
echo "🚀 Per deployare:"
echo "   1. Copia il contenuto di $BUILD_DIR sul server web"
echo "   2. Configura il server per servire i file statici"
echo "   3. Assicurati che il backend sia raggiungibile su: $BACKEND_URL"
echo ""
echo "📋 Contenuto directory build:"
ls -la "$BUILD_DIR"