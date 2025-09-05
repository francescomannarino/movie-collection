# 🚀 Quick Start - Movie Collection Mobile

## Avvio Rapido

### 1. Prerequisiti
Assicurati che il backend sia in esecuzione:
```bash
cd ../backend
npm start
```
Il backend deve essere accessibile su `http://localhost:3001`

### 2. Installa le dipendenze
```bash
cd mobile
npm install
```

### 3. Avvia in modalità sviluppo
```bash
npm run dev
```

L'app sarà disponibile su: **http://localhost:3001**

### 4. Testa su mobile
- Apri l'URL su un dispositivo mobile nella stessa rete
- Oppure usa Chrome DevTools > Device Simulation

## 📱 Test PWA

### Installazione
1. Apri l'app in Chrome/Safari
2. Verrà mostrato il prompt di installazione
3. Clicca "Installa" per aggiungere alla home screen

### Modalità Offline
1. Apri DevTools > Application > Service Workers
2. Attiva "Offline" per testare la modalità offline
3. L'app continuerà a funzionare con i dati in cache

## 🎨 Funzionalità da Testare

### Animazioni Native-Like
- **Pull-to-refresh** - Tira verso il basso nella collezione
- **Swipe gestures** - Scorri le card per azioni rapide
- **Haptic feedback** - Tocca i bottoni per sentire le vibrazioni
- **Smooth transitions** - Naviga tra le schermate

### Componenti UI
- **Bottom Navigation** - Tap doppio per scroll to top
- **Search in tempo reale** - Digita per cercare film
- **Modal Details** - Tap su un film per i dettagli
- **Format Selection** - Toggle DVD/Blu-ray

### PWA Features
- **Install Prompt** - Installa come app nativa
- **Offline Mode** - Funziona senza connessione
- **Background Sync** - Sincronizza quando torni online
- **Push Notifications** - (se implementate)

## 🔧 Configurazione

### Variabili Ambiente
Crea un file `.env` nella cartella mobile:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME="Movie Collection"
VITE_APP_VERSION="1.0.0"
```

### Network Access
Per testare su dispositivi fisici:
1. Trova il tuo IP locale: `ipconfig getifaddr en0` (Mac) o `ipconfig` (Windows)
2. Accedi da mobile: `http://TUO_IP:3001`

## 📊 Performance Testing

### Chrome DevTools
1. Apri DevTools > Lighthouse
2. Seleziona "Progressive Web App"
3. Clicca "Generate report"
4. Target: Score > 90

### Mobile Testing
- **iOS Safari** - Test completo PWA
- **Chrome Android** - Install prompt e features
- **Network throttling** - Testa con 3G lento

## 🎬 Demo Flow

### Primo Utilizzo
1. **Home Screen** - Vedi il greeting e stats vuote
2. **Search** - Cerca "Oppenheimer" o "Barbie"  
3. **Add Movie** - Seleziona formati e aggiungi
4. **Collection** - Vedi il film aggiunto
5. **Details** - Tap per aprire modal dettagli

### Gestione Collezione
1. **Filter & Sort** - Prova i filtri nella collezione
2. **Edit Formats** - Modifica i formati posseduti
3. **Remove Movie** - Rimuovi un film
4. **Export Data** - Esporta la collezione (Settings)

## 🚨 Troubleshooting

### Backend non raggiungibile
- Verifica che il backend sia su porta 3001
- Controlla il CORS nel backend per permettere localhost:3001

### Animazioni lente
- Disabilita "Reduce Motion" nelle impostazioni sistema
- Verifica GPU acceleration in DevTools

### PWA non installabile
- Deve essere servito via HTTPS (in produzione)
- Manifest.json deve essere valido
- Service Worker deve essere registrato

### Offline non funziona
- Verifica Service Worker in DevTools > Application
- Cache deve contenere i file statici
- API responses devono essere cached

## 🎯 Prossimi Passi

1. **Personalizza** - Modifica colori e animazioni
2. **Estendi** - Aggiungi nuove funzionalità
3. **Deploy** - Metti in produzione su Vercel/Netlify
4. **Monitora** - Aggiungi analytics e error tracking

---

🎬 **Buon divertimento con la tua collezione cinematografica!**
