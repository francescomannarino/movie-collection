# 🎬 Movie Collection WebApp

Una webapp completa per gestire la tua collezione personale di film in formato DVD e Blu-ray, con integrazione TMDB per la ricerca e informazioni sui film.

## 🏗️ Architettura Separata

Il progetto è strutturato con **frontend** e **backend** separati per permettere deployment indipendenti:

- **Frontend**: Applicazione web statica (porta 3000)
- **Backend**: API REST con Express.js (porta 3001) 
- **Database**: MongoDB (porta 27017)

Questa architettura permette di deployare i componenti su macchine diverse per scalabilità e flessibilità.

## ✨ Caratteristiche Principali

- **📚 Libreria Personale**: Visualizza la tua collezione con poster, titoli e formati posseduti
- **🔍 Ricerca Avanzata**: Cerca film su TMDB con autocompletamento
- **💾 Backup e Ripristino**: Export/import in formato JSON, MongoDB e CSV
- **📱 Design Responsive**: Interfaccia moderna e adattiva per tutti i dispositivi
- **🎯 Filtri e Ordinamento**: Organizza la collezione per formato, anno, genere
- **📊 Statistiche**: Panoramica completa della tua collezione

## 🚀 Installazione Rapida

### Prerequisiti

- **Node.js** (versione 16 o superiore)
- **MongoDB** (locale o cloud)
- **Account TMDB** per API key gratuita

### Opzione 1: Setup Completo (Raccomandato)

#### 1. Backend Setup
```bash
cd backend

# Installa dipendenze backend
npm install

# Copia il template delle variabili di ambiente
cp env.template .env

# Configura .env con i tuoi valori:
# MONGODB_URI=mongodb://localhost:27017/movie-collection
# TMDB_API_KEY=la_tua_api_key_qui
# PORT=3001

# Setup database
npm run setup

# Avvia backend (porta 3001)
npm start
```

#### 2. Frontend Setup
```bash
cd frontend

# Installa dipendenze frontend
npm install

# Avvia frontend (porta 3000)
npm start
```

#### 3. Accesso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

### Opzione 2: Setup Legacy (Monolitico)

```bash
# Dalla cartella root del progetto
npm install
cp env.template .env
npm run setup
npm start
```

**Nota**: Il setup legacy avvia tutto sulla porta 3000 ma è deprecato. Si raccomanda l'uso della struttura separata.

## 📚 Guide Dettagliate

Per approfondimenti e configurazioni avanzate, consulta le seguenti guide:

- **[🚀 Quick Start Guide](QUICK_START.md)** - Guida rapida per iniziare subito
- **[📱 Frontend Guide](frontend/README.md)** - Documentazione frontend separato
- **[🔧 Backend Guide](backend/README.md)** - Documentazione backend API
- **🐳 [Docker Setup Guide](DOCKER_SETUP.md)** - Configurazione completa con Docker
- **⚙️ [PM2 Production Guide](PM2_GUIDE.md)** - Deploy in produzione con PM2

## 🛠️ Comandi Disponibili

### Backend (cartella backend/)
```bash
npm start          # Avvia backend (produzione)
npm run dev        # Modalità sviluppo con nodemon
npm run setup      # Setup database iniziale
npm run pm2:start  # Avvia con PM2
```

### Frontend (cartella frontend/)
```bash
npm start          # Avvia frontend su porta 3000
npm run dev        # Alias per npm start
npm run serve      # Alias per npm start
```

### Legacy (cartella root)
```bash
npm start          # Avvia server monolitico (deprecato)
npm run dev        # Modalità sviluppo (deprecato)
npm run setup      # Setup database (deprecato)
```

## 📋 API Endpoints

### Film Collection

- `GET /api/movies` - Lista film con filtri e paginazione
- `GET /api/movies/:id` - Dettagli singolo film
- `POST /api/movies` - Aggiungi film alla collezione
- `PUT /api/movies/:id` - Modifica formati posseduti
- `DELETE /api/movies/:id` - Rimuovi film dalla collezione
- `GET /api/movies/stats/summary` - Statistiche collezione

### Ricerca TMDB

- `GET /api/search/:query` - Cerca film su TMDB
- `GET /api/search/suggestions/:query` - Suggerimenti veloci
- `GET /api/search/details/:tmdbId` - Dettagli completi film

### Backup e Export

- `GET /api/backup/export/json` - Export JSON
- `GET /api/backup/export/mongodb` - Export MongoDB
- `GET /api/backup/export/csv` - Export CSV
- `POST /api/backup/import` - Import da backup
- `GET /api/backup/stats` - Statistiche backup

### Utility

- `GET /api/health` - Stato del server

## 🗄️ Guida MongoDB Compass

### Installazione

1. Scarica **MongoDB Compass** da: https://www.mongodb.com/products/compass
2. Installa e avvia l'applicazione

### Connessione

1. Apri MongoDB Compass
2. Inserisci la connection string: `mongodb://localhost:27017`
3. Clicca **Connect**

### Navigazione

1. Seleziona il database: `movie-collection`
2. Apri la collezione: `movies`
3. Esplora i documenti dei tuoi film

### Query Utili

```javascript
// Tutti i film
{}

// Solo film in DVD
{"formats.dvd": true}

// Solo film in Blu-ray
{"formats.bluray": true}

// Film con entrambi i formati
{"formats.dvd": true, "formats.bluray": true}

// Film per anno
{"year": 2023}

// Film per genere
{"genres": "Action"}

// Film aggiunti di recente
{"dateAdded": {"$gte": new Date("2024-01-01")}}

// Ricerca per titolo (case-insensitive)
{"title": {"$regex": "matrix", "$options": "i"}}
```

## 🏗️ Struttura del Progetto

### Nuova Struttura Separata (Raccomandata)

```
movie_collection_webapp/
├── backend/                # Backend API (porta 3001)
│   ├── config/             # Configurazioni
│   │   ├── database.js     # Connessione MongoDB
│   │   └── tmdb.js         # Servizio TMDB API
│   ├── middleware/         # Middleware Express
│   │   ├── errorHandler.js # Gestione errori
│   │   └── rateLimiter.js  # Rate limiting
│   ├── models/             # Modelli MongoDB
│   │   └── Movie.js        # Schema film
│   ├── routes/             # Route API
│   │   ├── movies.js       # Gestione collezione
│   │   ├── search.js       # Ricerca TMDB
│   │   └── backup.js       # Export/import
│   ├── server.js           # Server Express
│   ├── setup.js            # Script setup
│   ├── package.json        # Dipendenze backend
│   └── env.template        # Template variabili
├── frontend/               # Frontend SPA (porta 3000)
│   ├── public/
│   │   ├── index.html      # Pagina principale
│   │   ├── css/
│   │   │   └── styles.css  # Stili CSS
│   │   ├── js/
│   │   │   ├── api.js      # Servizio API (punta a :3001)
│   │   │   ├── ui.js       # Componenti UI
│   │   │   └── app.js      # App principale
│   │   └── images/         # Immagini
│   ├── package.json        # Dipendenze frontend
│   └── README.md           # Documentazione frontend
├── README.md               # Documentazione principale
└── [file legacy...]        # File della struttura precedente
```

### Struttura Legacy (Deprecata)

I file della struttura monolitica sono ancora presenti nella root per compatibilità ma si raccomanda l'uso della nuova struttura separata.

## 🎨 Funzionalità Frontend

### Sezione Libreria

- **Griglia responsive** di film con poster
- **Filtri avanzati** per formato, genere, anno
- **Ricerca locale** nella collezione
- **Ordinamento** per data, titolo, anno, voto
- **Paginazione** per collezioni grandi
- **Modal dettagli** con tutte le informazioni

### Sezione Ricerca

- **Ricerca TMDB** con autocompletamento
- **Suggerimenti in tempo reale**
- **Selezione formati** DVD/Blu-ray
- **Indicazione film già posseduti**
- **Paginazione risultati**

### Sezione Backup

- **Export multipli**: JSON, MongoDB, CSV
- **Import intelligente**: merge o sostituzione
- **Statistiche collezione**
- **Gestione errori dettagliata**

## 🔧 Configurazione Avanzata

### Rate Limiting

Modifica in `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minuti
RATE_LIMIT_MAX_REQUESTS=100    # Max richieste
```

### MongoDB Cloud

Per usare MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-collection
```

### HTTPS in Produzione

Per produzione, configura reverse proxy (nginx) o usa servizi cloud.

## 🐛 Risoluzione Problemi

### Errore Connessione MongoDB

```bash
# Verifica che MongoDB sia in esecuzione
mongod --version

# Su macOS con Homebrew
brew services start mongodb-community

# Su Ubuntu
sudo systemctl start mongod
```

### Errore TMDB API

1. Verifica la tua API key su: https://www.themoviedb.org/settings/api
2. Controlla che sia inserita correttamente in `.env`
3. Verifica la connessione internet

### Porta già in uso

```bash
# Cambia porta in .env
PORT=3001

# O termina processo esistente
lsof -ti:3000 | xargs kill -9
```

### Problemi di dipendenze

```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install
```

## 📊 Schema Database

### Collezione Movies

```javascript
{
  _id: ObjectId,
  tmdbId: Number,              // ID univoco TMDB
  title: String,               // Titolo localizzato
  originalTitle: String,       // Titolo originale
  year: Number,                // Anno di uscita
  posterUrl: String,           // URL poster TMDB
  overview: String,            // Descrizione
  formats: {                   // Formati posseduti
    dvd: Boolean,
    bluray: Boolean
  },
  dateAdded: Date,             // Data aggiunta alla collezione
  genres: [String],            // Generi del film
  runtime: Number,             // Durata in minuti
  voteAverage: Number,         // Voto medio (0-10)
  releaseDate: Date,           // Data rilascio originale
  createdAt: Date,             // Timestamp creazione
  updatedAt: Date              // Timestamp ultima modifica
}
```

### Indici Database

- `tmdbId` (unique) - Prevenire duplicati
- `title, originalTitle` (text) - Ricerca testuale
- `year` - Filtro per anno
- `genres` - Filtro per genere
- `dateAdded` - Ordinamento cronologico

## 🚀 Deploy in Produzione

### Deploy Separato su Tre Macchine

#### Macchina 1: Frontend (Porta 3000)
```bash
# Su macchina frontend
cd frontend
npm install --production
npm start

# O con nginx
nginx -c /path/to/nginx.conf
```

#### Macchina 2: Backend API (Porta 3001)
```bash
# Su macchina backend
cd backend
npm install --production

# Configura .env per produzione
NODE_ENV=production
MONGODB_URI=mongodb://[IP_MONGODB]:27017/movie-collection
TMDB_API_KEY=your_api_key
PORT=3001

# Avvia con PM2
npm run pm2:start:prod
```

#### Macchina 3: MongoDB (Porta 27017)
```bash
# Su macchina database
mongod --bind_ip_all --port 27017

# O con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Deploy Legacy (Una Macchina)

```bash
# Dalla root del progetto
npm install --production

# Configura .env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/movie-collection
TMDB_API_KEY=...
PORT=80

# Avvia con PM2
pm2 start server.js --name "movie-collection"
pm2 save
pm2 startup
```

### Backup Automatici

Crea script cron per backup automatici:

```bash
# Crontab per backup giornaliero
0 2 * * * curl http://localhost:3000/api/backup/export/json > /backups/movies-$(date +\%Y\%m\%d).json
```

## 🤝 Contributi

Questo è un progetto personale, ma suggerimenti e miglioramenti sono benvenuti!

## 📄 Licenza

MIT License - Usa liberamente per i tuoi progetti personali.

## 🔮 Sviluppi Futuri

- [ ] Autenticazione utenti
- [ ] Collezioni multiple
- [ ] Wishlist film da acquistare
- [ ] Integrazione con servizi streaming
- [ ] App mobile companion
- [ ] Condivisione collezioni
- [ ] Raccomandazioni AI

---

**Buona gestione della tua collezione di film! 🎬✨**
