// Configurazione Backend - Movie Collection Mobile App
// ===================================================

/**
 * Configurazione centralizzata per la gestione del backend
 * Questo file centralizza tutti i puntamenti al backend per facilitare
 * eventuali cambi di configurazione senza dover modificare ogni singolo file.
 */

// Configurazione base del backend
const BACKEND_CONFIG = {
  // Configurazione API Backend
  api: {
    // URL base del backend API
    // Esempi:
    //   - Sviluppo locale: 'http://localhost:3001'
    //   - Rete locale: 'http://192.168.1.100:3001'
    //   - Produzione: 'https://api.yourdomain.com'
    //   - Docker: 'http://movie-backend:3001'
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    
    // Porta del backend (usata per auto-configurazione)
    port: import.meta.env.VITE_API_PORT || 3001,
    
    // Modalità di configurazione
    // 'auto': determina automaticamente l'URL basandosi sull'hostname corrente
    // 'manual': usa l'URL specificato in baseUrl
    // 'env': usa esclusivamente le variabili d'ambiente
    mode: import.meta.env.VITE_API_MODE || 'auto',
    
    // Timeout per le richieste API (in millisecondi)
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    
    // Numero di tentativi di riconnessione
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
    
    // Intervallo tra i tentativi di riconnessione (in millisecondi)
    retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
    
    // Abilita cache API
    enableCache: import.meta.env.VITE_API_CACHE_ENABLED !== 'false',
    
    // Durata cache API (in millisecondi) - default 5 minuti
    cacheDuration: parseInt(import.meta.env.VITE_API_CACHE_DURATION) || 5 * 60 * 1000
  },
  
  // Configurazione degli endpoint
  endpoints: {
    // Endpoint principali
    movies: '/api/movies',
    search: '/api/search',
    health: '/api/health',
    stats: '/api/movies/stats/summary',
    backup: '/api/backup',
    
    // Endpoint TMDB (tramite backend)
    tmdbSearch: '/api/search',
    tmdbDetails: '/api/search/details',
    tmdbSuggestions: '/api/search/suggestions'
  },
  
  // Configurazione connettività
  connectivity: {
    // Intervallo per il controllo della connessione (in millisecondi)
    healthCheckInterval: 30000,
    
    // Timeout per il controllo della connessione
    healthCheckTimeout: 5000,
    
    // Abilita controllo automatico della connessione
    autoHealthCheck: true,
    
    // Abilita modalità offline
    enableOfflineMode: true,
    
    // Tempo di attesa prima di considerare offline (in millisecondi)
    offlineTimeout: 3000
  },
  
  // Configurazione ambiente
  environment: {
    // Modalità debug
    debug: import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true',
    
    // Ambiente di esecuzione
    nodeEnv: import.meta.env.MODE || 'development',
    
    // Abilita logging dettagliato
    verbose: import.meta.env.VITE_VERBOSE === 'true'
  }
}

/**
 * Funzione per ottenere la configurazione API dinamica
 * Gestisce la logica di auto-determinazione dell'URL del backend
 */
export function getApiConfig() {
  const config = { ...BACKEND_CONFIG.api }
  
  // Se la modalità è 'env', usa solo le variabili d'ambiente
  if (config.mode === 'env') {
    return config
  }
  
  // Se la modalità è 'auto', determina automaticamente l'URL
  if (config.mode === 'auto') {
    // In ambiente di sviluppo Vite, usa localhost
    if (import.meta.env.DEV) {
      config.baseUrl = `http://localhost:${config.port}`
      return config
    }
    
    // In produzione, cerca di determinare l'URL dal browser
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      
      // Se siamo su localhost o 127.0.0.1
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        config.baseUrl = `${protocol}//localhost:${config.port}`
      } else {
        // Usa lo stesso hostname del frontend
        config.baseUrl = `${protocol}//${hostname}:${config.port}`
      }
    }
  }
  
  return config
}

/**
 * Funzione per ottenere l'URL completo di un endpoint
 */
export function getEndpointUrl(endpointKey, pathParams = {}) {
  const apiConfig = getApiConfig()
  const endpoint = BACKEND_CONFIG.endpoints[endpointKey]
  
  if (!endpoint) {
    throw new Error(`Endpoint '${endpointKey}' non trovato nella configurazione`)
  }
  
  let url = `${apiConfig.baseUrl}${endpoint}`
  
  // Sostituisci i parametri del path
  Object.keys(pathParams).forEach(key => {
    url = url.replace(`:${key}`, pathParams[key])
  })
  
  return url
}

/**
 * Funzione per ottenere la configurazione completa del backend
 */
export function getBackendConfig() {
  return {
    ...BACKEND_CONFIG,
    api: getApiConfig()
  }
}

/**
 * Funzione per aggiornare la configurazione runtime
 */
export function updateBackendConfig(newConfig) {
  Object.assign(BACKEND_CONFIG, newConfig)
  
  if (BACKEND_CONFIG.environment.debug) {
    console.log('📝 Configurazione backend aggiornata:', BACKEND_CONFIG)
  }
}

/**
 * Funzione per validare la configurazione
 */
export function validateBackendConfig() {
  const apiConfig = getApiConfig()
  const errors = []
  
  // Validazione URL base
  if (!apiConfig.baseUrl) {
    errors.push('URL base API non specificato')
  } else {
    try {
      new URL(apiConfig.baseUrl)
    } catch {
      errors.push('URL base API non valido')
    }
  }
  
  // Validazione porta
  if (!apiConfig.port || isNaN(apiConfig.port) || apiConfig.port < 1 || apiConfig.port > 65535) {
    errors.push('Porta backend non valida (deve essere tra 1 e 65535)')
  }
  
  // Validazione timeout
  if (apiConfig.timeout < 1000) {
    errors.push('Timeout API troppo basso (minimo 1000ms)')
  }
  
  // Validazione tentativi di riconnessione
  if (apiConfig.retryAttempts < 0 || apiConfig.retryAttempts > 10) {
    errors.push('Numero di tentativi di riconnessione non valido (0-10)')
  }
  
  // Validazione endpoint
  const requiredEndpoints = ['movies', 'search', 'health']
  requiredEndpoints.forEach(endpoint => {
    if (!BACKEND_CONFIG.endpoints[endpoint]) {
      errors.push(`Endpoint '${endpoint}' mancante`)
    }
  })
  
  if (errors.length > 0) {
    console.error('❌ Errori di configurazione backend:', errors)
    return { valid: false, errors }
  }
  
  if (BACKEND_CONFIG.environment.debug) {
    console.log('✅ Configurazione backend valida')
  }
  
  return { valid: true, errors: [] }
}

/**
 * Funzione per debug della configurazione
 */
export function debugBackendConfig() {
  if (BACKEND_CONFIG.environment.debug) {
    console.group('🔧 Configurazione Backend Movie Collection Mobile')
    console.log('API Config:', getApiConfig())
    console.log('Endpoints:', BACKEND_CONFIG.endpoints)
    console.log('Connectivity:', BACKEND_CONFIG.connectivity)
    console.log('Environment:', BACKEND_CONFIG.environment)
    
    if (typeof window !== 'undefined') {
      console.log('Current URL:', window.location.href)
      console.log('Hostname:', window.location.hostname)
      console.log('Protocol:', window.location.protocol)
    }
    
    console.groupEnd()
  }
}

/**
 * Funzione per testare la connettività al backend
 */
export async function testBackendConnection() {
  try {
    const healthUrl = getEndpointUrl('health')
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: BACKEND_CONFIG.connectivity.healthCheckTimeout
    })
    
    if (response.ok) {
      if (BACKEND_CONFIG.environment.debug) {
        console.log('✅ Connessione al backend OK')
      }
      return { connected: true, status: response.status }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    if (BACKEND_CONFIG.environment.debug) {
      console.warn('❌ Connessione al backend fallita:', error.message)
    }
    return { connected: false, error: error.message }
  }
}

/**
 * Funzione per ottenere informazioni sulla configurazione corrente
 */
export function getConfigInfo() {
  const apiConfig = getApiConfig()
  const validation = validateBackendConfig()
  
  return {
    apiUrl: apiConfig.baseUrl,
    mode: apiConfig.mode,
    environment: BACKEND_CONFIG.environment.nodeEnv,
    debug: BACKEND_CONFIG.environment.debug,
    valid: validation.valid,
    errors: validation.errors,
    endpoints: Object.keys(BACKEND_CONFIG.endpoints).length,
    cacheEnabled: apiConfig.enableCache,
    offlineMode: BACKEND_CONFIG.connectivity.enableOfflineMode
  }
}

// Esporta la configurazione per uso diretto
export default BACKEND_CONFIG

// Auto-validazione in sviluppo
if (import.meta.env.DEV) {
  // Valida e debugga la configurazione all'avvio
  setTimeout(() => {
    validateBackendConfig()
    debugBackendConfig()
  }, 100)
}
