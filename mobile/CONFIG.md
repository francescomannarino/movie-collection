# Configurazione Backend - Movie Collection Mobile App

Questo documento descrive il sistema di configurazione centralizzata per la parte mobile dell'applicazione Movie Collection.

## Panoramica

Il sistema di configurazione centralizzata permette di gestire tutti i puntamenti al backend in modo semplice e flessibile, facilitando eventuali cambi di configurazione senza dover modificare ogni singolo file.

## File di Configurazione

### `src/config/backend.js`
File principale che contiene tutta la configurazione del backend:
- URL e endpoint API
- Configurazione connettività
- Impostazioni retry e timeout
- Modalità debug e logging

### `src/config/app.js`
Configurazione generale dell'app, ora integrata con il sistema backend centralizzato.

## Variabili d'Ambiente

Crea un file `.env.local` nella directory mobile con le seguenti variabili:

```env
# Configurazione API Backend
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PORT=3001
VITE_API_MODE=auto
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000
VITE_API_CACHE_ENABLED=true
VITE_API_CACHE_DURATION=300000

# Configurazione App
VITE_APP_NAME=Movie Collection
VITE_APP_VERSION=1.0.0

# Debug
VITE_DEBUG=false
VITE_VERBOSE=false
```

## Modalità di Configurazione

### Auto (Raccomandato)
```env
VITE_API_MODE=auto
```
- Determina automaticamente l'URL del backend
- In sviluppo usa `localhost:3001`
- In produzione usa lo stesso hostname del frontend

### Manual
```env
VITE_API_MODE=manual
VITE_API_BASE_URL=http://192.168.1.100:3001
```
- Usa l'URL specificato esattamente

### Environment Only
```env
VITE_API_MODE=env
```
- Usa solo le variabili d'ambiente, ignora auto-detection

## Esempi di Configurazione

### Sviluppo Locale
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_MODE=auto
VITE_DEBUG=true
```

### Rete Locale (LAN)
```env
VITE_API_BASE_URL=http://192.168.1.100:3001
VITE_API_MODE=manual
VITE_DEBUG=false
```

### Produzione
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_MODE=manual
VITE_API_TIMEOUT=15000
VITE_DEBUG=false
```

### Docker/Container
```env
VITE_API_BASE_URL=http://movie-backend:3001
VITE_API_MODE=manual
VITE_DEBUG=false
```

## Utilizzo nel Codice

### Importazione Base
```javascript
import { getApiConfig, getEndpointUrl, testBackendConnection } from '../config/backend.js'
```

### Ottenere Configurazione API
```javascript
const apiConfig = getApiConfig()
console.log('Backend URL:', apiConfig.baseUrl)
```

### Ottenere URL Endpoint
```javascript
const moviesUrl = getEndpointUrl('movies')
const movieUrl = getEndpointUrl('movies', { id: 123 }) // con parametri
```

### Testare Connessione
```javascript
const connectionResult = await testBackendConnection()
if (connectionResult.connected) {
  console.log('Backend raggiungibile')
} else {
  console.error('Backend non raggiungibile:', connectionResult.error)
}
```

### Servizio API
Il servizio API in `src/services/api.js` utilizza automaticamente la configurazione centralizzata:

```javascript
import api from '../services/api.js'

// Test configurazione
const configInfo = await api.config.testCurrentConfiguration()
console.log('Configurazione:', configInfo)

// Ricarica configurazione
await api.config.reloadConfiguration()
```

## Funzionalità Avanzate

### Retry Automatico
Il sistema implementa retry automatico per richieste fallite:
- Configurable tramite `VITE_API_RETRY_ATTEMPTS`
- Delay configurabile tramite `VITE_API_RETRY_DELAY`
- Solo per errori server (5xx) o timeout

### Monitoraggio Connessione
```javascript
import { networkUtils } from '../services/api.js'

// Avvia monitoraggio automatico
const stopMonitoring = networkUtils.startConnectionMonitoring((result) => {
  if (!result.connected) {
    console.warn('Connessione al backend persa')
  }
})

// Ferma monitoraggio
stopMonitoring()
```

### Cache Intelligente
- Cache automatica delle risposte API
- Configurabile tramite `VITE_API_CACHE_ENABLED`
- Durata configurabile tramite `VITE_API_CACHE_DURATION`

## Debug e Logging

Abilita debug per vedere log dettagliati:
```env
VITE_DEBUG=true
VITE_VERBOSE=true
```

Questo mostrerà:
- Richieste API in uscita
- Risposte API
- Tentativi di retry
- Informazioni di configurazione
- Test di connettività

## Validazione Configurazione

Il sistema valida automaticamente la configurazione all'avvio e fornisce errori dettagliati in caso di problemi.

Per validare manualmente:
```javascript
import { validateBackendConfig, debugBackendConfig } from '../config/backend.js'

const validation = validateBackendConfig()
if (!validation.valid) {
  console.error('Errori di configurazione:', validation.errors)
}

debugBackendConfig() // Mostra configurazione corrente
```
