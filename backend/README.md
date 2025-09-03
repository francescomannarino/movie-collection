# Movie Collection - Backend API

Backend API per l'applicazione Movie Collection WebApp.

## Configurazione

### Requisiti
- Node.js (versione 18 o superiore)
- MongoDB in esecuzione
- API Key di TMDB

### Installazione
```bash
cd backend
npm install
```

### Configurazione Ambiente
Copia il file `env.template` in `.env` e configura le variabili:

```bash
cp env.template .env
```

Modifica il file `.env` con i tuoi valori:
```
MONGODB_URI=mongodb://localhost:27017/movie_collection
TMDB_API_KEY=your_tmdb_api_key_here
NODE_ENV=development
PORT=3001
```

### Avvio

#### Sviluppo
```bash
npm run dev
```

#### Produzione
```bash
npm start
```

#### Setup Database
```bash
npm run setup
```

## API Endpoints

Il backend espone le seguenti API sulla porta **3001**:

### Movies
- `GET /api/movies` - Lista film della collezione
- `GET /api/movies/:id` - Dettagli film specifico
- `POST /api/movies` - Aggiungi film alla collezione
- `PUT /api/movies/:id` - Aggiorna formati film
- `DELETE /api/movies/:id` - Rimuovi film dalla collezione
- `GET /api/movies/stats/summary` - Statistiche collezione

### Search
- `GET /api/search/:query` - Ricerca film su TMDB
- `GET /api/search/suggestions/:query` - Suggerimenti ricerca
- `GET /api/search/details/:tmdbId` - Dettagli film da TMDB

### Backup
- `GET /api/backup/export/json` - Export collezione JSON
- `GET /api/backup/export/mongodb` - Export MongoDB-compatible
- `GET /api/backup/export/csv` - Export CSV
- `POST /api/backup/import` - Import da backup
- `GET /api/backup/stats` - Statistiche backup

### Health
- `GET /api/health` - Health check del servizio

## Deploy con PM2

### Avvio
```bash
npm run pm2:start
```

### Produzione
```bash
npm run pm2:start:prod
```

### Gestione
```bash
npm run pm2:status    # Stato processi
npm run pm2:logs      # Visualizza log
npm run pm2:restart   # Riavvia applicazione
npm run pm2:stop      # Ferma applicazione
```

## Struttura

```
backend/
├── config/          # Configurazioni database e TMDB
├── middleware/      # Middleware Express
├── models/          # Modelli MongoDB
├── routes/          # Route API
├── server.js        # Server principale
├── setup.js         # Script setup database
└── ecosystem.config.js # Configurazione PM2
```

## CORS e Sicurezza

Il backend è configurato per accettare richieste:
- Da localhost (porte qualsiasi)
- Da indirizzi IP della rete locale (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- Con supporto per deployment separato frontend/backend

## Docker

Il backend include configurazione Docker:

```bash
docker-compose up -d
```

Questo avvierà MongoDB e il backend in container separati.
