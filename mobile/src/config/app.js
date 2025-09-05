import { getApiConfig, getBackendConfig } from './backend.js'

// App configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Movie Collection',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Configurazione API - ora gestita dal sistema di backend centralizzato
  get apiBaseUrl() {
    return getApiConfig().baseUrl
  },
  
  // Accesso alla configurazione completa del backend
  get backend() {
    return getBackendConfig()
  },
  
  // Performance settings
  performance: {
    virtualScrollThreshold: 50,
    imageLoadingDelay: 100,
    searchDebounceMs: 300,
    animationDuration: 300
  },
  
  // UI settings
  ui: {
    itemsPerPage: 20,
    maxRecentMovies: 10,
    maxSuggestions: 5,
    maxRecentSearches: 5
  },
  
  // PWA settings
  pwa: {
    enableNotifications: true,
    enableBackgroundSync: true,
    cacheMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    offlineTimeout: 3000
  },
  
  // Animation settings
  animations: {
    staggerDelay: 0.05,
    springConfig: {
      stiffness: 300,
      damping: 30
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Theme settings
  theme: {
    defaultMode: 'dark',
    defaultAccent: 'golden',
    supportSystemTheme: true
  }
}

// Feature flags
export const FEATURES = {
  pullToRefresh: true,
  hapticFeedback: true,
  offlineMode: true,
  pushNotifications: false, // Disabled by default
  backgroundSync: true,
  installPrompt: true,
  shareApi: true,
  exportData: true
}

// API endpoints - ora gestiti dal sistema di backend centralizzato
export const API_ENDPOINTS = {
  get movies() {
    return getBackendConfig().endpoints.movies
  },
  get search() {
    return getBackendConfig().endpoints.search
  },
  get health() {
    return getBackendConfig().endpoints.health
  },
  get stats() {
    return getBackendConfig().endpoints.stats
  },
  get backup() {
    return getBackendConfig().endpoints.backup
  },
  get tmdbSearch() {
    return getBackendConfig().endpoints.tmdbSearch
  },
  get tmdbDetails() {
    return getBackendConfig().endpoints.tmdbDetails
  },
  get tmdbSuggestions() {
    return getBackendConfig().endpoints.tmdbSuggestions
  }
}

// Cache keys
export const CACHE_KEYS = {
  movies: 'movies',
  search: 'search-results',
  stats: 'collection-stats',
  recentSearches: 'recent-searches',
  userPreferences: 'user-preferences'
}

// Error messages
export const ERROR_MESSAGES = {
  networkError: 'Impossibile connettersi al server',
  movieNotFound: 'Film non trovato',
  addMovieError: 'Errore nell\'aggiunta del film',
  updateMovieError: 'Errore nell\'aggiornamento del film',
  deleteMovieError: 'Errore nella rimozione del film',
  searchError: 'Errore nella ricerca',
  exportError: 'Errore nell\'esportazione dei dati',
  genericError: 'Si è verificato un errore imprevisto'
}

// Success messages
export const SUCCESS_MESSAGES = {
  movieAdded: 'Film aggiunto alla collezione',
  movieUpdated: 'Film aggiornato con successo',
  movieRemoved: 'Film rimosso dalla collezione',
  dataExported: 'Dati esportati con successo',
  appInstalled: 'App installata con successo',
  linkCopied: 'Link copiato negli appunti'
}

export default APP_CONFIG
