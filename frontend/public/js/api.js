// API Service per comunicazione con il backend
class ApiService {
    constructor() {
        // Aspetta che la configurazione sia caricata
        this.configLoaded = this.waitForConfig();
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // Default 5 minuti (può essere sovrascritto dalla config)
        
        // Inizializza quando la configurazione è pronta
        this.configLoaded.then(() => {
            this.initializeFromConfig();
        });
    }

    // Aspetta che la configurazione globale sia disponibile
    async waitForConfig() {
        let attempts = 0;
        const maxAttempts = 50; // 5 secondi max
        
        while (!window.getApiConfig && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.getApiConfig) {
            console.warn('⚠️ Configurazione non trovata, uso impostazioni di fallback');
            return false;
        }
        
        return true;
    }

    // Inizializza il servizio con la configurazione caricata
    initializeFromConfig() {
        try {
            const apiConfig = window.getApiConfig ? window.getApiConfig() : null;
            
            if (apiConfig) {
                this.baseUrl = `${apiConfig.baseUrl}/api`;
                this.cacheTimeout = apiConfig.cacheDuration || this.cacheTimeout;
                this.timeout = apiConfig.timeout || 10000;
                this.enableCache = apiConfig.enableCache !== false;
                
                console.log('✅ API Service configurato:', {
                    baseUrl: this.baseUrl,
                    timeout: this.timeout,
                    cacheEnabled: this.enableCache,
                    cacheDuration: this.cacheTimeout
                });
            } else {
                // Fallback alla configurazione automatica
                this.baseUrl = this.getBackendUrlFallback();
                console.warn('⚠️ Uso configurazione di fallback:', this.baseUrl);
            }
        } catch (error) {
            console.error('❌ Errore inizializzazione API Service:', error);
            this.baseUrl = this.getBackendUrlFallback();
        }
    }

    // Configurazione di fallback (metodo originale)
    getBackendUrlFallback() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // In sviluppo locale o quando si accede tramite localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//localhost:3001/api`;
        }
        
        // Quando si accede tramite IP di rete (LAN), usa lo stesso IP per il backend
        return `${protocol}//${hostname}:3001/api`;
    }

    // Ottieni l'URL base corrente (per debug)
    getCurrentBaseUrl() {
        return this.baseUrl || this.getBackendUrlFallback();
    }

    // Metodo generico per richieste HTTP
    async request(endpoint, options = {}) {
        // Aspetta che la configurazione sia caricata
        await this.configLoaded;
        
        const url = `${this.getCurrentBaseUrl()}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };
        
        // Aggiungi timeout se configurato
        if (this.timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            config.signal = controller.signal;
            
            try {
                console.log(`🔄 API Request: ${config.method || 'GET'} ${url} (timeout: ${this.timeout}ms)`);
                
                const response = await fetch(url, config);
                clearTimeout(timeoutId);
                
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Errore HTTP: ${response.status}`);
                }

                console.log(`✅ API Response: ${url}`, data);
                return data;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error(`Timeout della richiesta (${this.timeout}ms): ${url}`);
                }
                console.error(`❌ API Error: ${url}`, error);
                throw error;
            }
        } else {
            // Fallback senza timeout
            try {
                console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
                
                const response = await fetch(url, config);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Errore HTTP: ${response.status}`);
                }

                console.log(`✅ API Response: ${url}`, data);
                return data;
            } catch (error) {
                console.error(`❌ API Error: ${url}`, error);
                throw error;
            }
        }
    }

    // Cache helper
    getCached(key) {
        // Se la cache è disabilitata, non restituire nulla
        if (!this.enableCache) {
            return null;
        }
        
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('📦 Usando cache per:', key);
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        // Se la cache è disabilitata, non salvare nulla
        if (!this.enableCache) {
            return;
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache pulita');
    }

    // ============ MOVIE ENDPOINTS ============

    // Ottieni tutti i film della collezione
    async getMovies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/movies${queryString ? `?${queryString}` : ''}`;
        
        const cacheKey = `movies_${queryString}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const response = await this.request(endpoint);
        this.setCache(cacheKey, response);
        return response;
    }

    // Ottieni un singolo film
    async getMovie(id) {
        const cacheKey = `movie_${id}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const response = await this.request(`/movies/${id}`);
        this.setCache(cacheKey, response);
        return response;
    }

    // Aggiungi film alla collezione
    async addMovie(movieData) {
        const response = await this.request('/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
        
        // Invalida cache
        this.clearCache();
        return response;
    }

    // Aggiorna formati di un film
    async updateMovie(id, formats) {
        const response = await this.request(`/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ formats })
        });
        
        // Invalida cache
        this.clearCache();
        return response;
    }

    // Rimuovi film dalla collezione
    async deleteMovie(id) {
        const response = await this.request(`/movies/${id}`, {
            method: 'DELETE'
        });
        
        // Invalida cache
        this.clearCache();
        return response;
    }

    // Ottieni statistiche della collezione
    async getMovieStats() {
        const cacheKey = 'movie_stats';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const response = await this.request('/movies/stats/summary');
        this.setCache(cacheKey, response);
        return response;
    }

    // ============ SEARCH ENDPOINTS ============

    // Cerca film su TMDB
    async searchMovies(query, page = 1) {
        if (!query || query.trim().length < 2) {
            return { success: true, data: { results: [], pagination: {} } };
        }

        const endpoint = `/search/${encodeURIComponent(query.trim())}?page=${page}`;
        return await this.request(endpoint);
    }

    // Ottieni suggerimenti di ricerca
    async getSearchSuggestions(query) {
        if (!query || query.trim().length < 2) {
            return { success: true, data: { suggestions: [] } };
        }

        const endpoint = `/search/suggestions/${encodeURIComponent(query.trim())}`;
        return await this.request(endpoint);
    }

    // Ottieni dettagli completi di un film da TMDB
    async getMovieDetails(tmdbId) {
        const cacheKey = `tmdb_details_${tmdbId}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const response = await this.request(`/search/details/${tmdbId}`);
        this.setCache(cacheKey, response);
        return response;
    }

    // ============ BACKUP ENDPOINTS ============

    // Export collezione in JSON
    async exportJSON() {
        const response = await fetch(`${this.baseUrl}/backup/export/json`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante export');
        }
        return response.blob();
    }

    // Export collezione MongoDB-compatible
    async exportMongoDB() {
        const response = await fetch(`${this.baseUrl}/backup/export/mongodb`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante export');
        }
        return response.blob();
    }

    // Export collezione in CSV
    async exportCSV() {
        const response = await fetch(`${this.baseUrl}/backup/export/csv`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Errore durante export');
        }
        return response.blob();
    }

    // Import da backup
    async importBackup(file, mode = 'merge') {
        const formData = new FormData();
        formData.append('backupFile', file);
        formData.append('mode', mode);

        const response = await fetch(`${this.baseUrl}/backup/import`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante import');
        }

        // Invalida cache
        this.clearCache();
        return data;
    }

    // Ottieni statistiche per backup
    async getBackupStats() {
        const cacheKey = 'backup_stats';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        const response = await this.request('/backup/stats');
        this.setCache(cacheKey, response);
        return response;
    }

    // ============ HEALTH CHECK ============

    // Controlla stato del server
    async healthCheck() {
        try {
            const response = await this.request('/health');
            return response;
        } catch (error) {
            console.error('❌ Health check fallito:', error);
            return { status: 'ERROR', error: error.message };
        }
    }

    // ============ DEBUG E CONFIGURAZIONE ============

    // Ottieni informazioni di debug
    getDebugInfo() {
        const apiConfig = window.getApiConfig ? window.getApiConfig() : null;
        return {
            currentBaseUrl: this.getCurrentBaseUrl(),
            timeout: this.timeout,
            enableCache: this.enableCache,
            cacheTimeout: this.cacheTimeout,
            cacheSize: this.cache.size,
            configLoaded: this.configLoaded,
            apiConfig: apiConfig,
            fallbackUrl: this.getBackendUrlFallback()
        };
    }

    // Ricarica configurazione
    async reloadConfig() {
        console.log('🔄 Ricaricamento configurazione API...');
        await this.initializeFromConfig();
        console.log('✅ Configurazione ricaricata');
    }

    // Test connessione con informazioni dettagliate
    async testConnection() {
        console.log('🔍 Test connessione API...');
        console.log('Debug Info:', this.getDebugInfo());
        
        try {
            const start = Date.now();
            const health = await this.healthCheck();
            const duration = Date.now() - start;
            
            console.log(`✅ Connessione OK (${duration}ms):`, health);
            return { success: true, duration, health };
        } catch (error) {
            console.error('❌ Test connessione fallito:', error);
            return { success: false, error: error.message };
        }
    }
}

// Istanza globale del servizio API
const api = new ApiService();

// Utility per gestire errori API
function handleApiError(error, defaultMessage = 'Si è verificato un errore') {
    console.error('API Error:', error);
    
    let message = defaultMessage;
    if (error.message) {
        message = error.message;
    }
    
    // Mostra notifica di errore
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        alert(message);
    }
    
    return message;
}

// Utility per download di file
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Debounce utility per ottimizzare le ricerche
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
