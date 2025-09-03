const axios = require('axios');

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.imageBaseUrl = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';
    
    // Cache per le ricerche recenti (durata 10 minuti)
    this.searchCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minuti
    
    // Configurazione axios con rate limiting
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      params: {
        api_key: this.apiKey,
        language: 'it-IT' // Lingua italiana per i risultati
      }
    });

    // Interceptor per gestire errori e rate limiting
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.warn('⚠️ Rate limit TMDB raggiunto, riprova tra poco');
          throw new Error('Rate limit raggiunto. Riprova tra qualche secondo.');
        }
        if (error.response?.status === 401) {
          throw new Error('API Key TMDB non valida');
        }
        throw error;
      }
    );
  }

  // Cerca film per query
  async searchMovies(query, page = 1) {
    if (!query || query.trim().length < 2) {
      throw new Error('Query di ricerca troppo breve');
    }

    const cacheKey = `search_${query}_${page}`;
    
    // Controlla cache
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Risultato dalla cache per:', query);
        return cached.data;
      }
      this.searchCache.delete(cacheKey);
    }

    try {
      console.log('🔍 Ricerca TMDB per:', query);
      const response = await this.client.get('/search/movie', {
        params: {
          query: query.trim(),
          page,
          include_adult: false
        }
      });

      const results = response.data.results.map(movie => ({
        tmdbId: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        posterUrl: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
        overview: movie.overview || '',
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        genreIds: movie.genre_ids || []
      }));

      const data = {
        results,
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages,
        currentPage: page
      };

      // Salva in cache
      this.searchCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      // Pulisci cache se troppo grande
      if (this.searchCache.size > 100) {
        const oldestKey = this.searchCache.keys().next().value;
        this.searchCache.delete(oldestKey);
      }

      return data;
    } catch (error) {
      console.error('❌ Errore ricerca TMDB:', error.message);
      throw new Error(`Errore nella ricerca: ${error.message}`);
    }
  }

  // Ottieni dettagli completi di un film
  async getMovieDetails(tmdbId) {
    try {
      console.log('📋 Recupero dettagli film TMDB ID:', tmdbId);
      const response = await this.client.get(`/movie/${tmdbId}`);
      
      const movie = response.data;
      return {
        tmdbId: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        posterUrl: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
        overview: movie.overview || '',
        runtime: movie.runtime,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        genres: movie.genres ? movie.genres.map(g => g.name) : []
      };
    } catch (error) {
      console.error('❌ Errore dettagli film TMDB:', error.message);
      throw new Error(`Errore nel recuperare i dettagli: ${error.message}`);
    }
  }

  // Test connessione API
  async testConnection() {
    try {
      console.log('🧪 Test connessione TMDB API...');
      await this.client.get('/configuration');
      console.log('✅ Connessione TMDB API funzionante');
      return true;
    } catch (error) {
      console.error('❌ Test connessione TMDB fallito:', error.message);
      return false;
    }
  }

  // Pulisci cache
  clearCache() {
    this.searchCache.clear();
    console.log('🧹 Cache TMDB pulita');
  }
}

module.exports = new TMDBService();
