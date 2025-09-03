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

### Server Web Semplice
Il frontend è una Single Page Application (SPA) statica che può essere servita da qualsiasi server web:

```bash
# Usando http-server (incluso nelle dipendenze)
npm start

# Usando nginx, Apache, o altro server web
# Servire la cartella public/ sulla porta desiderata
```

### Deploy Separato
Per deployare frontend e backend su macchine diverse:

1. **Frontend**: Servire la cartella `public/` su una macchina (porta 3000)
2. **Backend**: Eseguire il backend su un'altra macchina (porta 3001)
3. **Configurazione**: Il frontend rileverà automaticamente l'IP e si collegherà al backend sulla porta 3001

### Esempio con nginx
```nginx
server {
    listen 3000;
    server_name localhost;
    
    location / {
        root /path/to/frontend/public;
        try_files $uri $uri/ /index.html;
    }
}
```

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
