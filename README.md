# 🎬 Movie Collection WebApp

Una webapp completa per gestire la tua collezione personale di film in formato DVD e Blu-ray, con integrazione TMDB per la ricerca e informazioni sui film.

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

### 1. Clone e Setup

```bash
# Clona il repository (o scarica i file)
cd movie_collection_webapp

# Installa dipendenze
npm install

# Copia il template delle variabili di ambiente
cp env.template .env
```

### 2. Configurazione

Modifica il file `.env` con i tuoi valori:

```env
# Database MongoDB
MONGODB_URI=mongodb://localhost:27017/movie-collection

# TMDB API (registrati su https://www.themoviedb.org/settings/api)
TMDB_API_KEY=la_tua_api_key_qui

# Configurazione Server
PORT=3000
NODE_ENV=development
```

### 3. Inizializzazione

```bash
# Esegui setup automatico
npm run setup

# Avvia il server
npm start
```

### 4. Accesso

Apri il browser su: **http://localhost:3000**

## 📚 Guide Dettagliate

Per approfondimenti e configurazioni avanzate, consulta le seguenti guide:

- **[🚀 Quick Start Guide](QUICK_START.md)** - Guida rapida per iniziare subito
- **🐳 [Docker Setup Guide](DOCKER_SETUP.md)** - Configurazione completa con Docker
- **⚙️ [PM2 Production Guide](PM2_GUIDE.md)** - Deploy in produzione con PM2

## 🛠️ Comandi Disponibili

```bash
# Avvio normale
npm start

# Modalità sviluppo (auto-reload)
npm run dev

# Setup iniziale
npm run setup

# Setup senza dati di esempio
npm run setup -- --no-samples
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

```
movie_collection_webapp/
├── config/                 # Configurazioni
│   ├── database.js         # Connessione MongoDB
│   └── tmdb.js            # Servizio TMDB API
├── middleware/             # Middleware Express
│   ├── errorHandler.js    # Gestione errori
│   └── rateLimiter.js     # Rate limiting
├── models/                 # Modelli MongoDB
│   └── Movie.js           # Schema film
├── routes/                 # Route API
│   ├── movies.js          # Gestione collezione
│   ├── search.js          # Ricerca TMDB
│   └── backup.js          # Export/import
├── public/                 # Frontend
│   ├── index.html         # Pagina principale
│   ├── css/
│   │   └── styles.css     # Stili CSS
│   ├── js/
│   │   ├── api.js         # Servizio API
│   │   ├── ui.js          # Componenti UI
│   │   └── app.js         # App principale
│   └── images/            # Immagini
├── server.js              # Server Express
├── setup.js               # Script setup
├── package.json           # Dipendenze
├── env.template           # Template variabili
└── README.md              # Documentazione
```

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

### Variabili di Ambiente

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
TMDB_API_KEY=...
PORT=80
```

### Build e Avvio

```bash
# Installa dipendenze di produzione
npm install --production

# Avvia con PM2
npm install -g pm2
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
