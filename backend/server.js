require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import configurazioni e middleware
const connectDB = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { config, getCorsConfig, printConfigInfo } = require('./config');

// Import routes
const movieRoutes = require('./routes/movies');
const searchRoutes = require('./routes/search');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = config.server.port;

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
      upgradeInsecureRequests: config.security.upgradeInsecureRequests ? [] : null
    }
  },
  // Disabilita HSTS in sviluppo per evitare problemi con HTTP su LAN
  hsts: config.security.enableHSTS
}));

// Middleware CORS - Configurato dinamicamente per frontend separato e accesso LAN
app.use(cors(getCorsConfig()));

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

// Il backend non serve più file statici - questi sono gestiti dal frontend separato

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
    environment: config.server.environment,
    version: '1.0.0',
    server: {
      host: config.server.host,
      port: config.server.port
    }
  });
});

// Endpoint per configurazione CORS (solo in sviluppo)
if (config.server.environment === 'development') {
  const { addCorsOrigin, removeCorsOrigin } = require('./config');
  
  app.get('/api/config/cors', (req, res) => {
    res.json({
      environment: config.server.environment,
      customOrigins: config.cors.customOrigins,
      developmentPatterns: config.cors.developmentPatterns.map(p => p.toString())
    });
  });
  
  app.post('/api/config/cors/add', (req, res) => {
    const { origin } = req.body;
    if (!origin) {
      return res.status(400).json({ error: 'Origin richiesto' });
    }
    
    try {
      addCorsOrigin(origin);
      res.json({ 
        success: true, 
        message: `Origine ${origin} aggiunta`,
        customOrigins: config.cors.customOrigins 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete('/api/config/cors/remove', (req, res) => {
    const { origin } = req.body;
    if (!origin) {
      return res.status(400).json({ error: 'Origin richiesto' });
    }
    
    try {
      removeCorsOrigin(origin);
      res.json({ 
        success: true, 
        message: `Origine ${origin} rimossa`,
        customOrigins: config.cors.customOrigins 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/backup', backupRoutes);

// Il backend non serve il frontend - rimuovo catch-all route

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

// Avvio server su tutti gli indirizzi di rete
const server = app.listen(PORT, config.server.host, () => {
  printConfigInfo();
});

module.exports = app;
