module.exports = {
  apps: [{
    // Configurazione principale applicazione
    name: 'movie-collection-webapp',
    script: 'server.js',
    
    // Configurazione istanze
    instances: 1, // Cambia a 'max' per utilizzare tutti i core CPU
    exec_mode: 'fork', // Cambia a 'cluster' per multiple istanze
    
    // Configurazione ambiente sviluppo
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    
    // Configurazione ambiente produzione
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Aggiungi qui le tue variabili d'ambiente per produzione
      // MONGODB_URI: 'mongodb://localhost:27017/movie_collection_prod',
      // TMDB_API_KEY: 'your_production_tmdb_api_key'
    },
    
    // Configurazione log
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Configurazione restart automatico
    watch: false, // Non usare in produzione
    ignore_watch: ['node_modules', 'logs', 'public/images'],
    
    // Configurazione memoria e performance
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 2000,
    
    // Configurazione restart automatico su crash
    autorestart: true,
    
    // Configurazione graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Source map support per debugging
    source_map_support: true
  }],

  // Configurazione per deploy (opzionale)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/movie-collection-webapp.git',
      path: '/var/www/movie-collection-webapp',
      'post-deploy': 'npm ci --only=production && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
