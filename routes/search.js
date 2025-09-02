const express = require('express');
const router = express.Router();
const tmdbService = require('../config/tmdb');
const { searchLimiter } = require('../middleware/rateLimiter');

// GET /api/search/:query - Cerca film su TMDB
router.get('/:query', searchLimiter, async (req, res, next) => {
  try {
    const { query } = req.params;
    const { page = 1 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query di ricerca deve contenere almeno 2 caratteri'
      });
    }

    console.log(`🔍 Ricerca film per: "${query}" (pagina ${page})`);

    const searchResults = await tmdbService.searchMovies(query, parseInt(page));

    // Aggiungi informazioni su quali film sono già nella collezione
    const Movie = require('../models/Movie');
    const tmdbIds = searchResults.results.map(movie => movie.tmdbId);
    const existingMovies = await Movie.find({ tmdbId: { $in: tmdbIds } }).lean();
    const existingMoviesMap = new Map(existingMovies.map(movie => [movie.tmdbId, movie]));

    const resultsWithStatus = searchResults.results.map(movie => ({
      ...movie,
      inCollection: existingMoviesMap.has(movie.tmdbId),
      ownedFormats: existingMoviesMap.has(movie.tmdbId) 
        ? existingMoviesMap.get(movie.tmdbId).formats
        : null
    }));

    res.json({
      success: true,
      data: {
        results: resultsWithStatus,
        pagination: {
          currentPage: searchResults.currentPage,
          totalPages: searchResults.totalPages,
          totalResults: searchResults.totalResults
        },
        query: query.trim()
      }
    });
  } catch (error) {
    console.error('❌ Errore ricerca:', error.message);
    next(error);
  }
});

// GET /api/search/suggestions/:query - Suggerimenti di ricerca (più veloce)
router.get('/suggestions/:query', searchLimiter, async (req, res, next) => {
  try {
    const { query } = req.params;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Ricerca solo la prima pagina per suggerimenti veloci
    const searchResults = await tmdbService.searchMovies(query, 1);
    
    // Prendi solo i primi 5 risultati per i suggerimenti
    const suggestions = searchResults.results.slice(0, 5).map(movie => ({
      tmdbId: movie.tmdbId,
      title: movie.title,
      year: movie.year,
      posterUrl: movie.posterUrl
    }));

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('❌ Errore suggerimenti:', error.message);
    next(error);
  }
});

// GET /api/search/details/:tmdbId - Dettagli completi di un film da TMDB
router.get('/details/:tmdbId', async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    if (!tmdbId || isNaN(parseInt(tmdbId))) {
      return res.status(400).json({
        success: false,
        error: 'ID TMDB non valido'
      });
    }

    console.log(`📋 Recupero dettagli per TMDB ID: ${tmdbId}`);

    const movieDetails = await tmdbService.getMovieDetails(parseInt(tmdbId));

    // Controlla se il film è già nella collezione
    const Movie = require('../models/Movie');
    const existingMovie = await Movie.findOne({ tmdbId: parseInt(tmdbId) }).lean();

    res.json({
      success: true,
      data: {
        ...movieDetails,
        inCollection: !!existingMovie,
        ownedFormats: existingMovie ? existingMovie.formats : null,
        collectionId: existingMovie ? existingMovie._id : null
      }
    });
  } catch (error) {
    console.error('❌ Errore dettagli film:', error.message);
    next(error);
  }
});

module.exports = router;
