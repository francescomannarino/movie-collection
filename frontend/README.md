# Movie Collection - Frontend

Frontend dell'applicazione Movie Collection WebApp.

## Configurazione

### Requisiti
- Node.js (versione 18 o superiore)
- Backend API in esecuzione sulla porta 3001

### Installazione
```bash
cd frontend
npm install
```

### Avvio

#### Sviluppo (porta 3000)
```bash
npm start
```

Il frontend sarà disponibile su `http://localhost:3000`

#### Opzioni alternative
```bash
npm run dev     # Alias per npm start
npm run serve   # Alias per npm start
```

## Funzionalità

### Libreria
- Visualizzazione collezione film
- Filtri per formato (DVD/Blu-ray)
- Ordinamento per titolo, anno, voto, data aggiunta
- Ricerca nella libreria personale
- Gestione formati (aggiunta/rimozione DVD/Blu-ray)

### Ricerca e Aggiunta
- Ricerca film su TMDB
- Suggerimenti di ricerca in tempo reale
- Aggiunta film alla collezione con selezione formati
- Visualizzazione dettagli completi film

### Backup e Ripristino
- Export collezione in JSON, CSV, MongoDB
- Import da backup precedenti
- Statistiche collezione dettagliate

## Struttura

```
frontend/
├── public/
│   ├── css/
│   │   └── styles.css    # Stili CSS
│   ├── js/
│   │   ├── api.js        # Servizio API
│   │   ├── app.js        # Logica applicazione
│   │   └── ui.js         # Componenti UI
│   ├── images/
│   │   └── favicon.ico
│   └── index.html        # Pagina principale
└── package.json
```

## Comunicazione con Backend

Il frontend si collega automaticamente al backend:
- **Localhost**: `http://localhost:3001/api`
- **Rete Locale**: `http://[IP_HOST]:3001/api`

La configurazione è automatica basata sull'URL da cui si accede al frontend.

## Deploy

### Sviluppo Locale
```bash
# Avvio standard per sviluppo
npm start

# Il frontend sarà disponibile su http://localhost:3000
# Si collegherà automaticamente al backend su localhost:3001
```

### Deploy Separato (Frontend e Backend su macchine diverse)

Il progetto include uno script di build automatico per gestire il deploy su macchine separate.

#### Script di Build
Lo script `build.sh` prepara automaticamente il frontend per il deploy:

```bash
# Build per sviluppo locale (backend su localhost:3001)
npm run build

# Build per produzione con backend specifico
BACKEND_URL=http://192.168.1.20:3001 npm run build

# Build predefinito per produzione
npm run build:prod

# Test del build localmente
npm run serve:build
```

#### Processo di Build
Lo script di build:
1. 📁 **Copia** tutti i file dalla cartella `public/` in `dist/`
2. ⚙️ **Genera** un `config.js` personalizzato con l'URL del backend specificato
3. 📝 **Modifica** `index.html` per caricare la configurazione corretta
4. ✅ **Crea** una cartella `dist/` pronta per il deploy

#### Deploy Step-by-Step

1. **Prepara il build:**
   ```bash
   # Specifica l'IP/URL del tuo backend
   BACKEND_URL=http://192.168.1.20:3001 npm run build
   ```

2. **Copia i file sul server:**
   ```bash
   # Esempio con rsync
   rsync -av --delete dist/ user@frontend-server:/var/www/movie-collection/
   
   # Esempio con scp
   scp -r dist/* user@frontend-server:/var/www/movie-collection/
   ```

3. **Configura il server web:**
   ```nginx
   # Esempio nginx
   server {
       listen 3000;
       server_name localhost;
       
       location / {
           root /var/www/movie-collection;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

#### Configurazione Automatica vs Manuale

**Modalità Automatica (sviluppo):**
- Il frontend rileva automaticamente l'IP della macchina
- Si collega al backend sulla stessa macchina (porta 3001)

**Modalità Manuale (produzione):**
- Lo script di build configura l'URL del backend specifico
- Perfetto per deploy su macchine separate

#### Struttura dopo il Build
```
dist/
├── config.js          ← Configurazione generata per il backend specificato
├── index.html         ← Modificato per caricare config.js locale  
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── app.js
│   └── ui.js
├── images/
│   └── favicon.ico
└── sw.js
```

#### Vantaggi dello Script di Build
- ✅ **Automatizza** il processo di deploy
- ✅ **Gestisce** automaticamente i riferimenti ai file
- ✅ **Permette** configurazioni diverse per ambienti diversi  
- ✅ **Crea** una cartella pronta per il deploy
- ✅ **Mantiene** il codice sorgente pulito

#### Note Tecniche

**Gestione dei Path:**
- In **sviluppo**: `index.html` carica `../config.js` (dalla cartella parent)
- In **produzione**: lo script di build modifica automaticamente il path in `config.js` (stessa cartella)

**File di Configurazione:**
- `config.js` (root): configurazione per sviluppo con modalità `auto`
- `dist/config.js` (generato): configurazione per produzione con modalità `manual`

## Caratteristiche

### Responsive Design
- Ottimizzato per desktop, tablet e smartphone
- Layout adattivo con griglia responsive
- Touch-friendly per dispositivi mobili

### Performance
- Caching intelligente delle richieste API
- Lazy loading delle immagini
- Debouncing per ricerche ottimizzate

### Compatibilità
- Supporto browser moderni
- Compatibilità cross-platform
- Ottimizzato per reti locali (LAN)

## API Configuration

Il frontend è configurato per comunicare con il backend tramite la classe `ApiService` che:
- Rileva automaticamente l'ambiente (localhost vs rete locale)
- Gestisce la cache delle richieste
- Fornisce gestione errori centralizzata
- Supporta tutte le funzionalità API del backend
