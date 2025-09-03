# 🧪 Test Setup Separato

Guida per testare il nuovo setup separato frontend/backend.

## 🚀 Test Rapido

### 1. Test Backend (Porta 3001)

```bash
cd backend

# Installa dipendenze
npm install

# Crea file .env di test
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/movie-collection-test
TMDB_API_KEY=your_api_key_here
EOF

# Setup database di test (opzionale)
npm run setup

# Avvia backend
npm run dev
```

**Verifica**: Apri `http://localhost:3001/api/health` - dovresti vedere:
```json
{"status":"OK","timestamp":"...","environment":"development","version":"1.0.0"}
```

### 2. Test Frontend (Porta 3000)

```bash
# In un nuovo terminale
cd frontend

# Installa dipendenze
npm install

# Avvia frontend
npm start
```

**Verifica**: Apri `http://localhost:3000` - dovresti vedere l'interfaccia Movie Collection.

### 3. Test Comunicazione Frontend ↔ Backend

1. **Apri il browser** su `http://localhost:3000`
2. **Apri Developer Tools** (F12)
3. **Vai alla tab Console**
4. **Cerca un film** (es. "Matrix")

**Risultato Atteso**: 
- Console mostra richieste a `http://localhost:3001/api/search/...`
- I risultati della ricerca vengono visualizzati
- Nessun errore CORS

## 🔧 Risoluzione Problemi

### Backend non si avvia
```bash
# Verifica MongoDB
mongo --version
mongod --version

# Avvia MongoDB se necessario
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux

# Verifica porta libera
lsof -ti:3001 | xargs kill -9
```

### Frontend non si collega al Backend
```bash
# Verifica che backend sia raggiungibile
curl http://localhost:3001/api/health

# Controlla errori CORS nella console browser
# Controlla URL API in frontend/public/js/api.js
```

### Errori di dipendenze
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist Test Completo

- [ ] Backend si avvia su porta 3001
- [ ] Frontend si avvia su porta 3000  
- [ ] API health check risponde
- [ ] Frontend carica senza errori
- [ ] Ricerca film funziona
- [ ] Aggiunta film alla collezione funziona
- [ ] Visualizzazione libreria funziona
- [ ] Export/import backup funziona

## 🌐 Test Deploy Simulato

Per simulare deploy su macchine separate:

### Backend "remoto"
```bash
cd backend
# Modifica server.js per accettare connessioni da qualsiasi IP
npm start
```

### Frontend con backend remoto
```bash
cd frontend
# Modifica frontend/public/js/api.js:
# getBackendUrl() { return 'http://[TUO_IP]:3001/api'; }
npm start
```

### Test da dispositivo mobile
```bash
# Trova il tuo IP locale
ipconfig getifaddr en0  # macOS
ip route get 1 | awk '{print $7}'  # Linux

# Accedi da smartphone/tablet a:
# http://[TUO_IP]:3000
```

## 📊 Monitoring Test

### Performance Test
```bash
# Test carico API
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/health"

# Dove curl-format.txt contiene:
# time_total: %{time_total}s
```

### Memory Usage
```bash
# Monitora memoria
ps aux | grep node
top -p $(pgrep node)
```

## 🎯 Test Scenarios

### Scenario 1: Primo utilizzo
1. Database vuoto
2. Cerca e aggiungi primo film
3. Verifica che appaia in libreria
4. Prova export backup

### Scenario 2: Collezione esistente
1. Import backup di test
2. Naviga libreria
3. Prova filtri e ricerca
4. Modifica formati film

### Scenario 3: Deploy production-like
1. NODE_ENV=production
2. MongoDB remoto
3. Test da rete locale
4. Verifica performance

---

🎬 **Test completato con successo?** Il setup separato è pronto per l'uso!
