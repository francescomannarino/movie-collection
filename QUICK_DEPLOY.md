# 🚀 Guida Rapida Deploy Separato

Guida veloce per deployare frontend, backend e MongoDB su tre macchine diverse.

## 📋 Prerequisiti

- **3 macchine/server** con accesso di rete tra loro
- **Node.js** installato su macchine frontend e backend  
- **MongoDB** installato su macchina database (o Docker)
- **API Key TMDB** ([ottienila qui](https://www.themoviedb.org/settings/api))

## 🏗️ Architettura Target

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Macchina A)  │    │   (Macchina B)  │    │   (Macchina C)  │
│   Porta: 3000   │◄──►│   Porta: 3001   │◄──►│   Porta: 27017  │
│                 │    │                 │    │                 │
│ - Interfaccia   │    │ - API REST      │    │ - MongoDB       │
│ - HTML/CSS/JS   │    │ - Express.js    │    │ - Collezione    │
│ - http-server   │    │ - TMDB Service  │    │ - Indici        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Step 1: Setup Database (Macchina C)

### Opzione A: MongoDB Nativo
```bash
# Installa MongoDB
# Ubuntu/Debian
sudo apt-get install -y mongodb

# CentOS/RHEL
sudo yum install -y mongodb-server

# Avvia MongoDB accessibile da rete
mongod --bind_ip_all --port 27017 --dbpath /data/db

# Verifica connessione
mongo --host [IP_MACCHINA_C]:27017
```

### Opzione B: Docker
```bash
# Installa Docker se necessario
# Avvia MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v /data/db:/data/db \
  mongo:latest

# Verifica
docker ps
```

### Test Connessione
```bash
# Da altra macchina
mongo --host [IP_MACCHINA_C]:27017 --eval "db.adminCommand('ismaster')"
```

## 🔧 Step 2: Setup Backend API (Macchina B)

```bash
# Clona/copia il progetto
cd /path/to/movie_collection_webapp/backend

# Installa dipendenze
npm install --production

# Configura ambiente
cp env.template .env

# Modifica .env con i valori corretti:
cat > .env << EOF
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://[IP_MACCHINA_C]:27017/movie-collection
TMDB_API_KEY=your_tmdb_api_key_here
EOF

# Setup database iniziale
npm run setup

# Avvia backend in produzione
npm run pm2:start:prod

# Verifica stato
npm run pm2:status

# Test API
curl http://localhost:3001/api/health
```

### Verifica Connettività
```bash
# Test da macchina frontend
curl http://[IP_MACCHINA_B]:3001/api/health

# Output atteso:
# {"status":"OK","timestamp":"...","environment":"production","version":"1.0.0"}
```

## 🌐 Step 3: Setup Frontend (Macchina A)

```bash
# Clona/copia il progetto
cd /path/to/movie_collection_webapp/frontend

# Installa dipendenze
npm install --production

# Avvia frontend
npm start

# Frontend ora accessibile su http://[IP_MACCHINA_A]:3000
```

### Configurazione Automatica
Il frontend rileva automaticamente l'IP della macchina backend:
- Se accedi tramite `http://[IP_MACCHINA_A]:3000`, si collega a `http://[IP_MACCHINA_A]:3001/api`
- Per collegarlo a macchina diversa, modifica `frontend/public/js/api.js`:

```javascript
// In frontend/public/js/api.js, modifica il metodo getBackendUrl():
getBackendUrl() {
    // Forza connessione a macchina backend specifica
    return 'http://[IP_MACCHINA_B]:3001/api';
}
```

## ✅ Step 4: Verifica Setup Completo

### Test Connettività Completa
```bash
# 1. Test MongoDB
mongo --host [IP_MACCHINA_C]:27017 --eval "db.movies.count()"

# 2. Test Backend API  
curl http://[IP_MACCHINA_B]:3001/api/health

# 3. Test Frontend
curl http://[IP_MACCHINA_A]:3000

# 4. Test Frontend → Backend
# Apri browser su http://[IP_MACCHINA_A]:3000
# Controlla console browser per connessioni API
```

### Test Funzionalità
1. **Apri browser**: `http://[IP_MACCHINA_A]:3000`
2. **Cerca un film**: Prova a cercare "Matrix"
3. **Aggiungi alla collezione**: Seleziona formati e aggiungi
4. **Verifica database**: 
   ```bash
   mongo --host [IP_MACCHINA_C]:27017
   use movie-collection
   db.movies.find().pretty()
   ```

## 🔧 Risoluzione Problemi

### Frontend non si collega al Backend
```bash
# Verifica CORS nel backend
curl -H "Origin: http://[IP_MACCHINA_A]:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://[IP_MACCHINA_B]:3001/api/health

# Verifica firewall
sudo ufw allow 3001  # Ubuntu
sudo firewall-cmd --permanent --add-port=3001/tcp  # CentOS
```

### Backend non si collega a MongoDB
```bash
# Test connessione diretta
mongo --host [IP_MACCHINA_C]:27017

# Verifica MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Verifica porte aperte
sudo netstat -tlnp | grep 27017
```

### Controllo Log
```bash
# Backend logs
cd backend && npm run pm2:logs

# Frontend logs
cd frontend && npm start  # Verifica output console

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## 🔄 Restart e Maintenance

### Restart Servizi
```bash
# Restart MongoDB
sudo systemctl restart mongod

# Restart Backend
cd backend && npm run pm2:restart

# Restart Frontend
cd frontend && pkill -f http-server && npm start
```

### Backup Automatico
```bash
# Su macchina backend, crea script cron
cat > /etc/cron.daily/movie-backup << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
curl http://localhost:3001/api/backup/export/json > /backups/movies-$DATE.json
EOF

chmod +x /etc/cron.daily/movie-backup
```

## 📊 Monitoring

### Status Check Script
```bash
cat > check-status.sh << 'EOF'
#!/bin/bash
echo "=== Movie Collection Status ==="
echo "Database: $(mongo --host [IP_MACCHINA_C]:27017 --quiet --eval 'db.adminCommand("ismaster").ismaster' 2>/dev/null && echo "OK" || echo "ERROR")"
echo "Backend:  $(curl -s http://[IP_MACCHINA_B]:3001/api/health | grep -q OK && echo "OK" || echo "ERROR")"
echo "Frontend: $(curl -s http://[IP_MACCHINA_A]:3000 | grep -q Movie && echo "OK" || echo "ERROR")"
EOF

chmod +x check-status.sh
```

---

🎬 **Setup completato!** La tua Movie Collection è ora distribuita su tre macchine separate e pronta per l'uso!

Per assistenza dettagliata consulta:
- [Frontend Guide](frontend/README.md)
- [Backend Guide](backend/README.md)
- [README Principale](README.md)
