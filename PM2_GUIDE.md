# 🚀 Guida PM2 per Movie Collection WebApp

Questa guida ti mostrerà come utilizzare PM2 per gestire la tua applicazione Movie Collection WebApp (frontend + Express) su un server di produzione.

## 📋 Indice

1. [Installazione PM2](#installazione-pm2)
2. [Configurazione PM2](#configurazione-pm2)
3. [File di Configurazione Ecosystem](#file-di-configurazione-ecosystem)
4. [Comandi PM2 Essenziali](#comandi-pm2-essenziali)
5. [Monitoraggio e Log](#monitoraggio-e-log)
6. [Configurazione Ambiente Produzione](#configurazione-ambiente-produzione)
7. [Backup e Ripristino](#backup-e-ripristino)
8. [Troubleshooting](#troubleshooting)

## 📦 Installazione PM2

### Installazione Globale

```bash
# Installa PM2 globalmente
npm install -g pm2

# Verifica installazione
pm2 --version
```

### Installazione Locale (Alternativa)

```bash
# Installa PM2 localmente nel progetto
npm install --save-dev pm2

# Aggiungi script nel package.json
"scripts": {
  "pm2:start": "pm2 start ecosystem.config.js",
  "pm2:stop": "pm2 stop ecosystem.config.js",
  "pm2:restart": "pm2 restart ecosystem.config.js"
}
```

## ⚙️ Configurazione PM2

### 1. File di Configurazione Ecosystem

Crea il file `ecosystem.config.js` nella root del progetto:

```javascript
module.exports = {
  apps: [{
    // Configurazione principale applicazione
    name: 'movie-collection-webapp',
    script: 'server.js',
    
    // Configurazione istanze
    instances: 1, // o 'max' per utilizzare tutti i core CPU
    exec_mode: 'fork', // o 'cluster' per multiple istanze
    
    // Configurazione ambiente
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Configurazione log
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configurazione restart automatico
    watch: false, // Non usare in produzione
    ignore_watch: ['node_modules', 'logs', 'public/images'],
    
    // Configurazione memoria e performance
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Configurazione restart automatico su crash
    autorestart: true,
    
    // Configurazione graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Variabili d'ambiente specifiche
    env_vars: {
      'MONGODB_URI': 'mongodb://localhost:27017/movie_collection',
      'TMDB_API_KEY': 'your_tmdb_api_key_here'
    }
  }]
};
```

### 2. Configurazione Avanzata per Produzione

Per un ambiente di produzione più robusto:

```javascript
module.exports = {
  apps: [{
    name: 'movie-collection-webapp',
    script: 'server.js',
    
    // Configurazione cluster per performance
    instances: 'max', // Utilizza tutti i core CPU
    exec_mode: 'cluster',
    
    // Ambiente produzione
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: process.env.MONGODB_URI,
      TMDB_API_KEY: process.env.TMDB_API_KEY
    },
    
    // Configurazione log avanzata
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Configurazione memoria e performance
    max_memory_restart: '1G',
    min_uptime: '30s',
    max_restarts: 5,
    restart_delay: 4000,
    
    // Configurazione avanzata
    autorestart: true,
    watch: false,
    
    // Health check
    health_check_grace_period: 3000,
    
    // Configurazione cron per restart programmati
    cron_restart: '0 2 * * *', // Restart ogni giorno alle 2:00 AM
    
    // Configurazione source map e debugging
    source_map_support: true,
    disable_source_map_support: false
  }]
};
```

## 📁 Struttura Directory

Crea la struttura necessaria per i log:

```bash
# Crea directory per i log
mkdir -p logs

# Crea file .gitignore per i log (se non esiste già)
echo "logs/*.log" >> .gitignore
```

## 🚀 Comandi PM2 Essenziali

### Avvio e Gestione Applicazione

```bash
# Avvia applicazione con configurazione ecosystem
pm2 start ecosystem.config.js

# Avvia in ambiente produzione
pm2 start ecosystem.config.js --env production

# Avvia applicazione singola (senza ecosystem)
pm2 start server.js --name "movie-webapp"

# Restart applicazione
pm2 restart movie-collection-webapp

# Reload applicazione (zero-downtime)
pm2 reload movie-collection-webapp

# Stop applicazione
pm2 stop movie-collection-webapp

# Delete applicazione
pm2 delete movie-collection-webapp

# Stop tutte le applicazioni
pm2 stop all
```

### Monitoraggio e Status

```bash
# Mostra status di tutte le applicazioni
pm2 status

# Mostra informazioni dettagliate
pm2 show movie-collection-webapp

# Monitor in tempo reale
pm2 monit

# Lista processi con dettagli
pm2 list

# Mostra log in tempo reale
pm2 logs

# Mostra log specifici
pm2 logs movie-collection-webapp

# Flush tutti i log
pm2 flush
```

### Gestione Startup

```bash
# Salva configurazione corrente
pm2 save

# Genera script di startup
pm2 startup

# Rimuovi startup
pm2 unstartup

# Resurrect processi salvati
pm2 resurrect
```

## 📊 Monitoraggio e Log

### Configurazione Log Rotation

```bash
# Installa modulo log rotation
pm2 install pm2-logrotate

# Configura log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
```

### Monitoraggio Web (PM2 Plus)

```bash
# Collega a PM2 Plus per monitoraggio web
pm2 link <secret_key> <public_key>

# Disconnetti da PM2 Plus
pm2 unlink
```

## 🔧 Configurazione Ambiente Produzione

### 1. File .env per Produzione

Crea un file `.env.production`:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/movie_collection_prod
TMDB_API_KEY=your_production_tmdb_api_key
```

### 2. Script di Deploy

Crea `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Iniziando deploy Movie Collection WebApp..."

# Aggiorna codice
git pull origin main

# Installa dipendenze
npm ci --only=production

# Restart applicazione PM2
pm2 restart ecosystem.config.js --env production

# Verifica status
pm2 status

echo "✅ Deploy completato!"
```

### 3. Configurazione Nginx (Opzionale)

Se usi Nginx come reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 💾 Backup e Ripristino

### Backup Configurazione PM2

```bash
# Salva configurazione
pm2 save

# Backup file ecosystem
cp ecosystem.config.js ecosystem.config.js.backup

# Backup dump PM2
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
```

### Ripristino

```bash
# Ripristina da dump
pm2 resurrect

# Ripristina da file ecosystem
pm2 start ecosystem.config.js
```

## 🔍 Troubleshooting

### Problemi Comuni

#### 1. Applicazione non si avvia

```bash
# Verifica log errori
pm2 logs movie-collection-webapp --err

# Verifica configurazione
pm2 show movie-collection-webapp

# Restart con debug
pm2 restart movie-collection-webapp --update-env
```

#### 2. Memoria insufficiente

```bash
# Verifica utilizzo memoria
pm2 monit

# Aumenta limite memoria in ecosystem.config.js
max_memory_restart: '1G'
```

#### 3. Troppi restart

```bash
# Verifica log per errori ricorrenti
pm2 logs movie-collection-webapp

# Aumenta min_uptime in ecosystem.config.js
min_uptime: '30s'
```

### Comandi di Debug

```bash
# Informazioni sistema
pm2 info

# Verifica configurazione
pm2 prettylist

# Reset counter restart
pm2 reset movie-collection-webapp

# Reload configurazione
pm2 reload ecosystem.config.js
```

## 📝 Best Practices

### 1. Configurazione Produzione

- ✅ Usa `exec_mode: 'cluster'` per performance
- ✅ Imposta `max_memory_restart` appropriato
- ✅ Configura log rotation
- ✅ Usa variabili d'ambiente per configurazioni sensibili
- ✅ Imposta `watch: false` in produzione

### 2. Monitoraggio

- ✅ Controlla regolarmente `pm2 monit`
- ✅ Configura alert per crash
- ✅ Monitora utilizzo memoria e CPU
- ✅ Verifica log errori giornalmente

### 3. Manutenzione

- ✅ Fai backup regolari della configurazione
- ✅ Testa deploy in ambiente staging
- ✅ Documenta modifiche alla configurazione
- ✅ Pianifica restart programmati se necessario

## 🎯 Esempio Completo di Utilizzo

```bash
# 1. Prepara ambiente
mkdir -p logs
npm ci --only=production

# 2. Avvia applicazione
pm2 start ecosystem.config.js --env production

# 3. Verifica status
pm2 status
pm2 logs movie-collection-webapp --lines 50

# 4. Salva configurazione per auto-start
pm2 save
pm2 startup

# 5. Test restart
pm2 restart movie-collection-webapp

# 6. Monitora
pm2 monit
```

## 📞 Supporto

Per problemi specifici:

1. Verifica log: `pm2 logs movie-collection-webapp`
2. Controlla status: `pm2 show movie-collection-webapp`
3. Consulta documentazione ufficiale: [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Nota**: Questa guida è specifica per la Movie Collection WebApp. Adatta le configurazioni alle tue esigenze specifiche di produzione.
