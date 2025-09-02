# 🚀 Quick Start Guide

## Avvio Rapido in 3 Passi

### 1. Configura le variabili di ambiente

Copia e modifica il file di configurazione:

```bash
cp env.template .env
```

Modifica `.env` e inserisci la tua TMDB API key:
- Registrati gratuitamente su: https://www.themoviedb.org/signup
- Vai su: https://www.themoviedb.org/settings/api
- Copia la tua API Key e sostituisci `your_tmdb_api_key_here` nel file `.env`

### 2. Assicurati che MongoDB sia in esecuzione

**Su macOS:**
```bash
brew services start mongodb-community
```

**Su Ubuntu/Linux:**
```bash
sudo systemctl start mongod
```

**Con Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Avvia l'applicazione

```bash
# Setup iniziale (crea database e indici)
npm run setup

# Avvia il server
npm start
```

## 🌐 Accesso

Apri il browser su: **http://localhost:3000**

## ✅ Test Rapido

1. Vai alla sezione **"Ricerca"**
2. Cerca "Matrix" 
3. Seleziona formati (DVD/Blu-ray)
4. Clicca **"Aggiungi"**
5. Torna alla **"Libreria"** per vedere il film aggiunto

## 🔧 Comandi Utili

```bash
npm start        # Avvia server
npm run dev      # Modalità sviluppo
npm run setup    # Setup iniziale
```

## 🆘 Problemi Comuni

**Errore MongoDB?**
- Verifica che MongoDB sia in esecuzione
- Controlla l'URI in `.env`

**Errore TMDB API?**
- Verifica la tua API key
- Controlla la connessione internet

**Porta occupata?**
- Cambia `PORT=3001` in `.env`

---

**Enjoy your movie collection! 🎬**
