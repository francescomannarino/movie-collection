const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const tmdbService = require('../config/tmdb');
const { modifyLimiter } = require('../middleware/rateLimiter');

// GET /api/movies - Recupera tutti i film della collezione
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'dateAdded', 
      sortOrder = 'desc',
      format,
      genre,
      search,
      year
    } = req.query;

    // Costruisci filtri
    const filters = {};
    
    if (format) {
      if (format === 'dvd') filters['formats.dvd'] = true;
      if (format === 'bluray') filters['formats.bluray'] = true;
    }
    
    if (genre) {
      filters.genres = { $in: [genre] };
    }
    
    if (year) {
      filters.year = parseInt(year);
    }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Costruisci ordinamento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Esegui query con paginazione
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [movies, totalCount] = await Promise.all([
      Movie.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Movie.countDocuments(filters)
    ]);

    // Calcola metadati paginazione
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        movies,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          format,
          genre,
          search,
          year,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id - Recupera un singolo film
router.get('/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Film non trovato'
      });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/movies - Aggiungi nuovo film alla collezione
router.post('/', modifyLimiter, async (req, res, next) => {
  try {
    const { tmdbId, formats } = req.body;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        error: 'ID TMDB richiesto'
      });
    }

    if (!formats || (!formats.dvd && !formats.bluray)) {
      return res.status(400).json({
        success: false,
        error: 'Almeno un formato (DVD o Blu-ray) deve essere selezionato'
      });
    }

    // Controlla se il film esiste già
    const existingMovie = await Movie.findOne({ tmdbId });
    if (existingMovie) {
      // Aggiorna i formati se il film esiste già
      existingMovie.formats.dvd = existingMovie.formats.dvd || formats.dvd;
      existingMovie.formats.bluray = existingMovie.formats.bluray || formats.bluray;
      await existingMovie.save();

      return res.json({
        success: true,
        message: 'Formati aggiornati per il film esistente',
        data: existingMovie
      });
    }

    // Recupera dettagli da TMDB
    const movieDetails = await tmdbService.getMovieDetails(tmdbId);

    // Crea nuovo film
    const newMovie = new Movie({
      ...movieDetails,
      formats: {
        dvd: formats.dvd || false,
        bluray: formats.bluray || false
      }
    });

    await newMovie.save();

    res.status(201).json({
      success: true,
      message: 'Film aggiunto alla collezione',
      data: newMovie
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/movies/:id - Modifica formati posseduti
router.put('/:id', modifyLimiter, async (req, res, next) => {
  try {
    const { formats } = req.body;

    if (!formats || (!formats.dvd && !formats.bluray)) {
      return res.status(400).json({
        success: false,
        error: 'Almeno un formato deve essere selezionato'
      });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { 
        formats: {
          dvd: formats.dvd || false,
          bluray: formats.bluray || false
        }
      },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Film non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Formati aggiornati',
      data: movie
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/movies/:id - Rimuovi film dalla collezione
router.delete('/:id', modifyLimiter, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Film non trovato'
      });
    }

    res.json({
      success: true,
      message: 'Film rimosso dalla collezione',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/stats/summary - Statistiche della collezione
router.get('/stats/summary', async (req, res, next) => {
  try {
    const [
      totalMovies,
      dvdCount,
      blurayCount,
      bothFormatsCount,
      genreStats,
      yearStats
    ] = await Promise.all([
      Movie.countDocuments(),
      Movie.countDocuments({ 'formats.dvd': true }),
      Movie.countDocuments({ 'formats.bluray': true }),
      Movie.countDocuments({ 'formats.dvd': true, 'formats.bluray': true }),
      Movie.aggregate([
        { $unwind: '$genres' },
        { $group: { _id: '$genres', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Movie.aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalMovies,
        formats: {
          dvd: dvdCount,
          bluray: blurayCount,
          both: bothFormatsCount
        },
        topGenres: genreStats,
        moviesByYear: yearStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
