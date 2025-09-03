// Configurazione Backend - Movie Collection WebApp
// ===============================================

const config = {
    // Configurazione server
    server: {
        port: process.env.PORT || 3001,
        host: '0.0.0.0', // Ascolta su tutti gli indirizzi di rete
        environment: process.env.NODE_ENV || 'development'
    },

    // Configurazione CORS
    cors: {
        // Origini permesse in produzione
        productionOrigins: [
            'https://yourdomain.com',
            'https://www.yourdomain.com'
        ],
        
        // Pattern per origini di sviluppo
        developmentPatterns: [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
            /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
            /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/
        ],
        
        // Origini personalizzate (possono essere aggiunte tramite variabili d'ambiente)
        customOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []
    },

    // Configurazione sicurezza
    security: {
        // Abilita HSTS solo in produzione
        enableHSTS: process.env.NODE_ENV === 'production',
        
        // Abilita upgrade a HTTPS solo in produzione
        upgradeInsecureRequests: process.env.NODE_ENV === 'production',
        
        // Rate limiting
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minuti
            max: process.env.NODE_ENV === 'production' ? 100 : 1000 // 100 req/15min in prod, 1000 in dev
        }
    },

    // Configurazione database
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/movieCollection',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // Configurazione TMDB
    tmdb: {
        apiKey: process.env.TMDB_API_KEY,
        baseUrl: 'https://api.themoviedb.org/3',
        imageBaseUrl: 'https://image.tmdb.org/t/p/'
    },

    // Configurazione logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableRequestLogging: true,
        enableDetailedErrors: process.env.NODE_ENV !== 'production'
    }
};

// Funzione per ottenere la configurazione CORS dinamica
function getCorsConfig() {
    if (config.server.environment === 'production') {
        return {
            origin: [...config.cors.productionOrigins, ...config.cors.customOrigins],
            credentials: true
        };
    }

    // In sviluppo, usa funzione dinamica per validare origini
    return {
        origin: function(origin, callback) {
            // Permetti richieste senza origin (es. app mobile, Postman)
            if (!origin) {
                return callback(null, true);
            }

            // Controlla origini personalizzate
            if (config.cors.customOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Controlla pattern di sviluppo
            const isAllowed = config.cors.developmentPatterns.some(pattern => 
                pattern.test(origin)
            );

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`⚠️ Origine CORS non permessa: ${origin}`);
                callback(new Error('Non permesso da CORS'));
            }
        },
        credentials: true
    };
}

// Funzione per aggiungere origini CORS personalizzate
function addCorsOrigin(origin) {
    if (!config.cors.customOrigins.includes(origin)) {
        config.cors.customOrigins.push(origin);
        console.log(`✅ Aggiunta origine CORS: ${origin}`);
    }
}

// Funzione per rimuovere origini CORS personalizzate
function removeCorsOrigin(origin) {
    const index = config.cors.customOrigins.indexOf(origin);
    if (index > -1) {
        config.cors.customOrigins.splice(index, 1);
        console.log(`❌ Rimossa origine CORS: ${origin}`);
    }
}

// Funzione per ottenere l'indirizzo IP locale
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    
    // Restituisce il primo IP trovato
    for (const name of Object.keys(results)) {
        if (results[name].length > 0) {
            return results[name][0];
        }
    }
    return 'localhost';
}

// Funzione per stampare informazioni di configurazione
function printConfigInfo() {
    const localIP = getLocalIP();
    console.log(`
🎬 Movie Collection WebApp - Backend Configuration
🚀 Server: http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}
🌐 URL Locale: http://localhost:${config.server.port}
📱 URL LAN: http://${localIP}:${config.server.port}
📊 Ambiente: ${config.server.environment}
🔒 CORS: ${config.server.environment === 'production' ? 'Produzione' : 'Sviluppo (permissivo)'}
📅 Avviato il: ${new Date().toLocaleString('it-IT')}

💡 Per configurare il frontend:
   Modalità auto: il frontend rileverà automaticamente l'IP
   Modalità manuale: imposta baseUrl in frontend/config.js
  `);

    if (config.server.environment === 'development') {
        console.log('🔧 Origini CORS permesse:');
        console.log('  - localhost:* (qualsiasi porta)');
        console.log('  - 127.0.0.1:* (qualsiasi porta)');
        console.log('  - 192.168.x.x:* (reti private)');
        console.log('  - 10.x.x.x:* (reti private)');
        console.log('  - 172.16-31.x.x:* (reti private)');
        
        if (config.cors.customOrigins.length > 0) {
            console.log('  - Origini personalizzate:', config.cors.customOrigins);
        }
    }
}

module.exports = {
    config,
    getCorsConfig,
    addCorsOrigin,
    removeCorsOrigin,
    getLocalIP,
    printConfigInfo
};
