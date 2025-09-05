import axios from 'axios'
import { getApiConfig, getEndpointUrl, testBackendConnection } from '../config/backend.js'

// Crea istanza axios con configurazione centralizzata
function createApiClient() {
  const apiConfig = getApiConfig()
  
  return axios.create({
    baseURL: `${apiConfig.baseUrl}/api`,
    timeout: apiConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Istanza axios principale
let apiClient = createApiClient()

// Funzione per ricreare il client con nuova configurazione
export function recreateApiClient() {
  apiClient = createApiClient()
  return apiClient
}

// Funzione per configurare gli interceptor
function setupInterceptors(client) {
  const apiConfig = getApiConfig()
  
  // Request interceptor per logging e configurazione dinamica
  client.interceptors.request.use(
    (config) => {
      if (apiConfig.debug) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      }
      return config
    },
    (error) => {
      console.error('❌ Request Error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor per gestione errori e retry
  client.interceptors.response.use(
    (response) => {
      if (apiConfig.debug) {
        console.log(`✅ API Response: ${response.config.url} - ${response.status}`)
      }
      return response.data
    },
    async (error) => {
      const config = error.config
      
      // Implementa retry logic
      if (!config || !config.__retryCount) {
        config.__retryCount = 0
      }
      
      const shouldRetry = config.__retryCount < apiConfig.retryAttempts &&
                         (!error.response || error.response.status >= 500)
      
      if (shouldRetry) {
        config.__retryCount++
        
        if (apiConfig.debug) {
          console.warn(`🔄 Retry attempt ${config.__retryCount}/${apiConfig.retryAttempts} for ${config.url}`)
        }
        
        // Attesa prima del retry
        await new Promise(resolve => setTimeout(resolve, apiConfig.retryDelay))
        
        return client(config)
      }
      
      console.error('❌ Response Error:', error)
      
      if (error.response) {
        // Server ha risposto con errore
        const message = error.response.data?.error || error.response.data?.message || 'Errore del server'
        return Promise.reject(new Error(message))
      } else if (error.request) {
        // Richiesta fatta ma nessuna risposta
        return Promise.reject(new Error('Impossibile connettersi al server'))
      } else {
        // Errore nella configurazione della richiesta
        return Promise.reject(new Error('Errore nella configurazione della richiesta'))
      }
    }
  )
}

// Configura gli interceptor per il client principale
setupInterceptors(apiClient)

// Funzione per riconfigurare completamente il client
export function reconfigureApiClient() {
  apiClient = createApiClient()
  setupInterceptors(apiClient)
  return apiClient
}

// Movie API endpoints
export const movieAPI = {
  // Get movies with filters and pagination
  async getMovies(params = {}) {
    const response = await apiClient.get('/movies', { params })
    return response
  },

  // Get single movie by ID
  async getMovie(movieId) {
    const response = await apiClient.get(`/movies/${movieId}`)
    return response
  },

  // Add movie to collection
  async addMovie(tmdbId, formats) {
    const response = await apiClient.post('/movies', {
      tmdbId,
      formats
    })
    return response
  },

  // Update movie formats
  async updateMovie(movieId, formats) {
    const response = await apiClient.put(`/movies/${movieId}`, {
      formats
    })
    return response
  },

  // Delete movie from collection
  async deleteMovie(movieId) {
    const response = await apiClient.delete(`/movies/${movieId}`)
    return response
  },

  // Get collection statistics
  async getStats() {
    const response = await apiClient.get('/movies/stats/summary')
    return response
  }
}

// Search API endpoints
export const searchAPI = {
  // Search movies on TMDB
  async searchMovies(query, page = 1) {
    const response = await apiClient.get(`/search/${encodeURIComponent(query)}`, {
      params: { page }
    })
    return response
  },

  // Get quick suggestions
  async getSuggestions(query) {
    const response = await apiClient.get(`/search/suggestions/${encodeURIComponent(query)}`)
    return response
  },

  // Get movie details from TMDB
  async getMovieDetails(tmdbId) {
    const response = await apiClient.get(`/search/details/${tmdbId}`)
    return response
  }
}

// Health check API
export const healthAPI = {
  async checkHealth() {
    const response = await apiClient.get('/health')
    return response
  }
}

// Network status utilities con configurazione centralizzata
export const networkUtils = {
  // Controlla se online
  isOnline: () => navigator.onLine,
  
  // Test connessione all'API usando configurazione centralizzata
  async testConnection() {
    try {
      const result = await testBackendConnection()
      return result.connected
    } catch (error) {
      console.warn('Connection test failed:', error.message)
      return false
    }
  },
  
  // Test connessione con dettagli
  async testConnectionDetailed() {
    return await testBackendConnection()
  },
  
  // Configura listener di rete
  setupNetworkListeners(onOnline, onOffline) {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  },
  
  // Monitora connessione automaticamente
  startConnectionMonitoring(callback) {
    const apiConfig = getApiConfig()
    const connectivity = apiConfig.backend?.connectivity || { healthCheckInterval: 30000 }
    
    if (!connectivity.autoHealthCheck) {
      return null
    }
    
    const interval = setInterval(async () => {
      const result = await this.testConnectionDetailed()
      callback(result)
    }, connectivity.healthCheckInterval)
    
    return () => clearInterval(interval)
  }
}

// Image utilities for TMDB
export const imageUtils = {
  // Get poster URL with size
  getPosterUrl: (path, size = 'w500') => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
  },
  
  // Get backdrop URL with size
  getBackdropUrl: (path, size = 'w1280') => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
  },
  
  // Get multiple poster sizes for responsive images
  getPosterSrcSet: (path) => {
    if (!path) return null
    
    const sizes = ['w185', 'w342', 'w500', 'w780']
    return sizes
      .map(size => `${imageUtils.getPosterUrl(path, size)} ${size.substring(1)}w`)
      .join(', ')
  },
  
  // Preload image
  preloadImage: (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }
}

// Cache utilities
export const cacheUtils = {
  // Cache key generators
  getCacheKey: (endpoint, params = {}) => {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${endpoint}${paramString ? `?${paramString}` : ''}`
  },
  
  // Simple in-memory cache
  cache: new Map(),
  
  // Get from cache
  get: (key) => {
    const item = cacheUtils.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      cacheUtils.cache.delete(key)
      return null
    }
    
    return item.data
  },
  
  // Set in cache
  set: (key, data, ttl = 300000) => { // 5 minutes default
    cacheUtils.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  },
  
  // Clear cache
  clear: () => {
    cacheUtils.cache.clear()
  }
}

// Configuration utilities
export const configUtils = {
  // Ottieni informazioni sulla configurazione corrente
  getConfigInfo() {
    const { getConfigInfo } = require('../config/backend.js')
    return getConfigInfo()
  },
  
  // Ricarica configurazione
  async reloadConfiguration() {
    reconfigureApiClient()
    
    const apiConfig = getApiConfig()
    if (apiConfig.debug) {
      console.log('🔄 Configurazione API ricaricata')
    }
    
    return this.getConfigInfo()
  },
  
  // Testa configurazione corrente
  async testCurrentConfiguration() {
    const configInfo = this.getConfigInfo()
    const connectionTest = await networkUtils.testConnectionDetailed()
    
    return {
      ...configInfo,
      connection: connectionTest
    }
  }
}

// Export default API object
export default {
  movies: movieAPI,
  search: searchAPI,
  health: healthAPI,
  network: networkUtils,
  images: imageUtils,
  cache: cacheUtils,
  config: configUtils
}
