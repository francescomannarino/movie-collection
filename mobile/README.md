# 🎬 Movie Collection Mobile App

Una **Progressive Web App (PWA)** moderna e performante per gestire la tua collezione di film con un design nativo e animazioni fluide.

## ✨ Caratteristiche Principali

### 🎨 Design Native-Like
- **Glassmorphism & Neumorphism** - Effetti visivi moderni
- **Color Palette Cinematografica** - Colori deep blues, golden accents, rich blacks
- **Typography Nativa** - Font system SF Pro (iOS) / Roboto (Android)
- **Iconografia Animata** - Lucide React icons con micro-interazioni

### 📱 Esperienza Mobile Ottimizzata
- **Bottom Navigation** animata con badge e indicatori
- **Pull-to-refresh** con animazione personalizzata
- **Swipe gestures** per navigazione e azioni rapide
- **Modal sheets** che scivolano dal basso
- **Status bar simulata** con supporto notch/dynamic island
- **Haptic feedback** simulato con vibrazioni

### 🚀 Performance & PWA
- **60fps animations** costanti con GPU acceleration
- **Virtual scrolling** per liste lunghe
- **Image lazy loading** con placeholder blur
- **Service Worker** per caching intelligente e offline mode
- **Code splitting** per bundle ottimizzati
- **Installabile** come app nativa

### 🎭 Effetti Cinematografici
- **Parallax scrolling** per header e hero sections
- **Blur effects** dietro modali e overlay
- **Film grain texture** overlays
- **Spotlight effects** sui poster featured
- **Particle effects** per azioni speciali
- **Smooth transitions** tra schermate

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI
- **Framer Motion** - Animazioni avanzate
- **React Spring** - Animazioni fisiche
- **Tailwind CSS** - Styling utility-first
- **Zustand** - State management leggero
- **Vite** - Build tool veloce
- **PWA** - Service Worker e manifest

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js 18+
- Backend Movie Collection in esecuzione su `localhost:3001`

### Installazione

```bash
cd mobile
npm install
```

### Sviluppo

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3001`

### Build di Produzione

```bash
npm run build
npm run preview
```

## 📱 Schermate

### 🏠 Home Screen
- Greeting personalizzato con ora del giorno
- Statistiche animate della collezione
- Film aggiunti di recente con carousel
- Generi preferiti con contatori
- Quick actions per navigazione rapida

### 📚 Collection Screen
- Griglia responsiva con MovieCard animate
- Filtri avanzati (formato, genere, anno, ricerca)
- Ordinamento multiplo con indicatori visivi
- Infinite scrolling ottimizzato
- Pull-to-refresh per aggiornare

### 🔍 Search Screen
- Ricerca in tempo reale su TMDB
- Suggerimenti rapidi con debounce
- Selezione formati (DVD/Blu-ray) con toggle animati
- Risultati con poster e dettagli
- Cronologia ricerche recenti

### ⚙️ Settings Screen
- Toggle tema scuro/chiaro animato
- Selezione colori accent personalizzati
- Esportazione dati collezione
- Condivisione app nativa
- Informazioni dispositivo e app

### 🎬 Movie Detail Modal
- Modal full-screen con backdrop blur
- Poster e backdrop parallax
- Dettagli completi film (trama, generi, cast)
- Gestione formati posseduti
- Azioni: aggiungi, modifica, rimuovi, condividi

## 🎯 Ottimizzazioni Performance

### Bundle Splitting
```javascript
manualChunks: {
  vendor: ['react', 'react-dom'],
  animation: ['framer-motion', 'react-spring'],
  icons: ['lucide-react']
}
```

### Caching Strategy
- **Static Assets**: Cache First
- **API Calls**: Network First con fallback
- **TMDB Images**: Cache First con placeholder offline

### Animation Performance
- **GPU Acceleration**: `transform: translateZ(0)`
- **Will Change**: Proprietà ottimizzate
- **Reduced Motion**: Supporto preferenze utente

## 🔧 Configurazione

### Variabili Ambiente
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME="Movie Collection"
VITE_APP_VERSION="1.0.0"
```

### PWA Manifest
- **Theme Color**: `#0f0f23` (Cinema Dark)
- **Display Mode**: `standalone`
- **Orientation**: `portrait`
- **Shortcuts**: Cerca Film, Collezione

## 📊 Metriche Performance Target

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Frame Rate**: 60fps costanti
- **Bundle Size**: < 200KB gzipped

## 🎨 Design System

### Colori
```css
cinema: {
  950: '#0a0f1a', // Background principale
  900: '#0f172a', // Superficie scura
  800: '#1e293b', // Card background
  // ... gradazioni complete
}

golden: {
  500: '#eab308', // Accent principale
  400: '#facc15', // Hover states
  // ... gradazioni complete
}
```

### Animazioni
```css
/* Timing curves native-like */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Stagger animations */
transition-delay: index * 0.1s;
```

## 🚀 Deploy & Installazione

### Build
```bash
npm run build
```

### Servire
```bash
npm run serve
```

### PWA Install
L'app mostrerà automaticamente il prompt di installazione su dispositivi supportati.

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🎬 Credits

Creato con ❤️ per gli amanti del cinema.
- **TMDB API** per i dati dei film
- **Lucide React** per le icone
- **Framer Motion** per le animazioni
