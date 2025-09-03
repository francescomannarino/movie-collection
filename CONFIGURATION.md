# Configurazione Movie Collection WebApp

Questa guida spiega come configurare l'indirizzo IP del backend e gestire la comunicazione frontend-backend.

## Configurazione Frontend

Il frontend utilizza il file `frontend/config.js` per configurare la connessione al backend.

### Modalità Automatica (Consigliata)

La modalità automatica rileva automaticamente l'indirizzo IP basandosi sul browser:

```javascript
// frontend/config.js
const CONFIG = {
    api: {
        mode: 'auto',  // Modalità automatica
        port: 3001     // Porta del backend
    }
};
```

**Come funziona:**
- Se accedi tramite `localhost` o `127.0.0.1` → usa `localhost:3001`
- Se accedi tramite IP di rete (es. `192.168.1.100`) → usa lo stesso IP per il backend

### Modalità Manuale

Per specificare un indirizzo IP fisso:

```javascript
// frontend/config.js
const CONFIG = {
    api: {
        mode: 'manual',                    // Modalità manuale
        baseUrl: 'http://192.168.1.100',  // IP fisso del backend
        port: 3001
    }
};
```

### Altre Opzioni di Configurazione

```javascript
const CONFIG = {
    api: {
        baseUrl: 'http://192.168.1.100',
        port: 3001,
        mode: 'auto', // 'auto' o 'manual'
        timeout: 10000,           // Timeout richieste (ms)
        enableCache: true,        // Abilita cache API
        cacheDuration: 300000     // Durata cache (5 minuti)
    },
    
    environment: {
        debug: true,              // Abilita logging debug
        nodeEnv: 'development'
    },
    
    ui: {
        itemsPerPage: 20,         // Film per pagina
        enableAnimations: true,   // Abilita animazioni
        defaultTheme: 'light'     // Tema predefinito
    }
};
```

## Configurazione Backend

Il backend utilizza il file `backend/config.js` per la configurazione CORS e server.

### Configurazione Base

```javascript
// backend/config.js
const config = {
    server: {
        port: 3001,
        host: '0.0.0.0',  // Ascolta su tutti gli indirizzi
        environment: 'development'
    },
    
    cors: {
        // Origini personalizzate
        customOrigins: [
            'http://192.168.1.50:3000',  // Esempio: altro dispositivo
        ]
    }
};
```

### Variabili d'Ambiente

Puoi usare variabili d'ambiente per la configurazione:

```bash
# backend/.env
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://192.168.1.50:3000,http://192.168.1.60:3000
```

## Esempi di Configurazione per Scenari Comuni

### 1. Sviluppo Locale

**Frontend:** Modalità auto (default)
```javascript
mode: 'auto'
```

**Backend:** Configurazione default
- Il backend accetta connessioni da `localhost` e IP di rete locali

### 2. Accesso da Smartphone/Tablet nella Stessa Rete

**Scenario:** PC con IP `192.168.1.100`, smartphone che accede all'app

**Frontend:** Modalità auto (consigliata)
```javascript
mode: 'auto'  // Rileva automaticamente l'IP
```

**Oppure modalità manuale:**
```javascript
mode: 'manual',
baseUrl: 'http://192.168.1.100'
```

**Backend:** Configurazione default (già supporta reti locali)

### 3. IP Statico Personalizzato

**Frontend:**
```javascript
mode: 'manual',
baseUrl: 'http://10.0.0.50'  // IP personalizzato
```

**Backend:** Aggiungere origine se necessario
```javascript
customOrigins: ['http://10.0.0.60:3000']  // IP del dispositivo frontend
```

### 4. Produzione

**Frontend:**
```javascript
mode: 'manual',
baseUrl: 'https://api.yourdomain.com'
```

**Backend:**
```javascript
server: {
    environment: 'production'
},
cors: {
    productionOrigins: [
        'https://yourdomain.com',
        'https://www.yourdomain.com'
    ]
}
```

## Risoluzione Problemi

### Errore CORS

Se vedi errori CORS nella console:

1. **Verifica la configurazione frontend:** Assicurati che l'URL del backend sia corretto
2. **Controlla i log del backend:** Dovrebbe mostrare le origini permesse
3. **Aggiungi origine personalizzata** (solo sviluppo):

```bash
# Chiamata API per aggiungere origine
curl -X POST http://localhost:3001/api/config/cors/add \
  -H "Content-Type: application/json" \
  -d '{"origin": "http://192.168.1.50:3000"}'
```

### Timeout delle Richieste

Se le richieste vanno in timeout:

```javascript
// frontend/config.js
api: {
    timeout: 30000  // Aumenta timeout a 30 secondi
}
```

### Cache Problemi

Per disabilitare la cache durante il debug:

```javascript
// frontend/config.js
api: {
    enableCache: false
}
```

## Debug

### Frontend Debug

Apri la console del browser e usa:

```javascript
// Informazioni di configurazione
window.debugConfig();

// Test connessione API
api.testConnection();

// Informazioni debug API
api.getDebugInfo();
```

### Backend Debug

I log del backend mostrano:
- Origini CORS permesse
- Richieste ricevute con IP di origine
- Configurazione attiva

## Script di Avvio Rapido

Crea un file `start.sh` per avviare rapidamente l'applicazione:

```bash
#!/bin/bash
echo "🎬 Avvio Movie Collection WebApp..."

# Avvia backend
cd backend
npm start &
BACKEND_PID=$!

# Avvia frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "✅ Applicazione avviata!"

# Cleanup al termine
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

## Note Finali

- La modalità **auto** è consigliata per la maggior parte degli scenari
- Il backend è configurato per accettare connessioni da reti locali private
- In produzione, specifica sempre origini CORS esplicite per sicurezza
- Usa il debug per verificare la configurazione attiva
