require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import configurazioni e middleware
const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const movieRoutes = require('./routes/movies');
const searchRoutes = require('./routes/search');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Connessione MongoDB
connectDB();

// Middleware di sicurezza con configurazione ottimizzata per LAN
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://image.tmdb.org", "https://via.placeholder.com"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      connectSrc: ["'self'"],
      // Rimuovi upgrade-insecure-requests per sviluppo locale
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  // Disabilita HSTS in sviluppo per evitare problemi con HTTP su LAN
  hsts: process.env.NODE_ENV === 'production'
}));

// Middleware CORS - Configurato per accesso LAN
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Sostituire con il dominio di produzione
    : function(origin, callback) {
        // In sviluppo, permetti tutte le origini dalla rete locale
        if (!origin || 
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/)) {
          callback(null, true);
        } else {
          callback(new Error('Non permesso da CORS'));
        }
      },
  credentials: true
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware specifico per migliorare la compatibilità mobile
app.use((req, res, next) => {
  // Headers per migliorare la compatibilità cross-browser e mobile
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Forza UTF-8 per tutte le risposte
  res.charset = 'utf-8';
  
  next();
});

// Serve file statici con headers appropriati per LAN
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: function (res, path, stat) {
    // Headers per migliorare la compatibilità mobile e LAN
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Headers specifici per CSS e JS
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css; charset=utf-8');
    }
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Logging middleware con informazioni dettagliate per debug LAN
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const realIP = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  console.log(`  IP: ${realIP} | User-Agent: ${userAgent.substring(0, 100)}...`);
  
  // Log specifico per richieste di file statici da mobile
  if (req.url.includes('.css') || req.url.includes('.js')) {
    console.log(`  📱 Richiesta file statico: ${req.url}`);
  }
  
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/backup', backupRoutes);

// Serve frontend per tutte le altre rotte
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware per gestione errori
app.use(notFound);
app.use(errorHandler);

// Gestione graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM ricevuto, chiusura server...');
  server.close(() => {
    console.log('✅ Server chiuso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT ricevuto, chiusura server...');
  server.close(() => {
    console.log('✅ Server chiuso');
    process.exit(0);
  });
});

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

// Avvio server su tutti gli indirizzi di rete
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`
🎬 Movie Collection WebApp
🚀 Server avviato sulla porta ${PORT}
🌐 URL Locale: http://localhost:${PORT}
📱 URL LAN: http://${localIP}:${PORT}
📊 Ambiente: ${process.env.NODE_ENV || 'development'}
📅 Avviato il: ${new Date().toLocaleString('it-IT')}

💡 Per accedere da smartphone/tablet:
   Usa l'URL LAN: http://${localIP}:${PORT}
  `);
});

module.exports = app;
