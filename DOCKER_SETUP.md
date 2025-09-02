# 🐳 Docker Setup - Movie Collection WebApp

Questa guida ti aiuterà a installare e avviare l'applicazione Movie Collection utilizzando Docker.

## 📋 Prerequisiti

- Docker installato sul tuo sistema ([Guida installazione Docker](https://docs.docker.com/get-docker/))
- Docker Compose installato ([Guida installazione Docker Compose](https://docs.docker.com/compose/install/))
- Chiave API di TMDB ([Ottieni qui](https://www.themoviedb.org/settings/api))

## 🚀 Avvio Rapido

### 1. Configurazione delle variabili d'ambiente

Copia il file di configurazione Docker:
```bash
cp docker.env .env
```

Modifica il file `.env` e inserisci la tua chiave API di TMDB:
```bash
# Apri il file .env con il tuo editor preferito
nano .env

# Modifica questa riga inserendo la tua API key
TMDB_API_KEY=la_tua_api_key_qui
```

### 2. Avvio dell'applicazione

Avvia tutti i servizi con un singolo comando:
```bash
docker-compose up -d
```

Questo comando:
- Scarica l'immagine MongoDB
- Costruisce l'immagine dell'applicazione
- Avvia entrambi i container in background

### 3. Verifica dello stato

Controlla che tutti i container siano avviati:
```bash
docker-compose ps
```

Dovresti vedere:
```
Name                        Command               State           Ports
-------------------------------------------------------------------------
movie-collection-app   docker-entrypoint.sh npm ...   Up      0.0.0.0:3000->3000/tcp
movie-collection-db    docker-entrypoint.sh mongod     Up      0.0.0.0:27017->27017/tcp
```

### 4. Accesso all'applicazione

L'applicazione sarà disponibile su:
- **Locale**: http://localhost:3000
- **LAN**: http://[il-tuo-ip]:3000

## 📊 Monitoraggio

### Visualizza i log

Tutti i servizi:
```bash
docker-compose logs -f
```

Solo l'applicazione:
```bash
docker-compose logs -f movie-app
```

Solo il database:
```bash
docker-compose logs -f mongodb
```

### Controllo salute dei container

```bash
docker-compose exec movie-app curl http://localhost:3000/api/health
```

## 🛠️ Gestione

### Arresto dell'applicazione

```bash
docker-compose down
```

### Arresto con rimozione volumi (⚠️ cancella tutti i dati)

```bash
docker-compose down -v
```

### Ricostruzione dell'immagine

Se hai modificato il codice:
```bash
docker-compose build movie-app
docker-compose up -d
```

### Riavvio di un singolo servizio

```bash
docker-compose restart movie-app
```

## 💾 Backup e Persistenza

### Backup del database

```bash
# Crea un backup del database MongoDB
docker-compose exec mongodb mongodump --db movie-collection --out /tmp/backup

# Copia il backup dal container al sistema host
docker cp movie-collection-db:/tmp/backup ./mongodb-backup
```

### Ripristino del database

```bash
# Copia il backup nel container
docker cp ./mongodb-backup movie-collection-db:/tmp/restore

# Ripristina il database
docker-compose exec mongodb mongorestore --db movie-collection /tmp/restore/movie-collection
```

## 🔧 Configurazione Avanzata

### Variabili d'ambiente disponibili

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `TMDB_API_KEY` | Chiave API di TMDB | Obbligatoria |
| `PORT` | Porta dell'applicazione | 3000 |
| `NODE_ENV` | Ambiente di esecuzione | production |
| `MONGODB_URI` | URI del database MongoDB | mongodb://mongodb:27017/movie-collection |
| `RATE_LIMIT_MAX_REQUESTS` | Limite richieste per finestra temporale | 100 |
| `RATE_LIMIT_WINDOW_MS` | Finestra temporale rate limiting (ms) | 900000 |

### Personalizzazione porte

Per cambiare la porta dell'applicazione, modifica il file `docker-compose.yml`:

```yaml
services:
  movie-app:
    ports:
      - "8080:3000"  # Cambia 3000 con la porta desiderata
```

## 🐛 Risoluzione Problemi

### L'applicazione non si avvia

1. Verifica che la chiave API di TMDB sia corretta nel file `.env`
2. Controlla i log: `docker-compose logs movie-app`
3. Verifica che MongoDB sia avviato: `docker-compose logs mongodb`

### Errori di connessione al database

```bash
# Riavvia il database
docker-compose restart mongodb

# Verifica la connettività
docker-compose exec movie-app ping mongodb
```

### Porta già in uso

Se la porta 3000 è già occupata:
```bash
# Trova il processo che usa la porta 3000
lsof -i :3000

# Oppure cambia porta nel docker-compose.yml
```

### Pulire tutto e ricominciare

```bash
# Ferma tutti i container
docker-compose down

# Rimuovi immagini, volumi e network
docker-compose down --rmi all -v --remove-orphans

# Pulisci il sistema Docker (opzionale)
docker system prune -a

# Ricostruisci tutto
docker-compose up -d --build
```

## 📱 Accesso da Mobile

L'applicazione è ottimizzata per l'accesso da dispositivi mobile sulla rete LAN. 

1. Trova l'IP del tuo computer:
   ```bash
   # Linux/macOS
   ip route get 1 | awk '{print $7}' | head -1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

2. Accedi da mobile: `http://[IP-DEL-TUO-COMPUTER]:3000`

## 🔒 Sicurezza

- I container utilizzano utenti non-root
- MongoDB non è esposto esternamente (solo sulla rete Docker)
- Rate limiting attivo per le API
- Headers di sicurezza configurati

## 📈 Performance

- Immagine Alpine per dimensioni ridotte
- Multi-stage build per ottimizzazione
- Health checks per monitoraggio automatico
- Volumi persistenti per i dati

---

Per ulteriore supporto, consulta la documentazione principale nel file `README.md`.
