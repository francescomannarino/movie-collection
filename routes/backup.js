const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const multer = require('multer');
const { modifyLimiter } = require('../middleware/rateLimiter');

// Configurazione multer per upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Solo file JSON sono consentiti'), false);
    }
  }
});

// GET /api/export/json - Export collezione in JSON
router.get('/export/json', async (req, res, next) => {
  try {
    console.log('📤 Inizio export JSON della collezione');
    
    const movies = await Movie.find({}).sort({ dateAdded: -1 }).lean();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalMovies: movies.length,
      movies: movies.map(movie => ({
        tmdbId: movie.tmdbId,
        title: movie.title,
        originalTitle: movie.originalTitle,
        year: movie.year,
        posterUrl: movie.posterUrl,
        overview: movie.overview,
        formats: movie.formats,
        dateAdded: movie.dateAdded,
        genres: movie.genres,
        runtime: movie.runtime,
        voteAverage: movie.voteAverage,
        releaseDate: movie.releaseDate
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="movie-collection-${new Date().toISOString().split('T')[0]}.json"`);
    
    console.log(`✅ Export JSON completato: ${movies.length} film esportati`);
    res.json(exportData);
  } catch (error) {
    console.error('❌ Errore export JSON:', error.message);
    next(error);
  }
});

// GET /api/export/mongodb - Export MongoDB-compatible
router.get('/export/mongodb', async (req, res, next) => {
  try {
    console.log('📤 Inizio export MongoDB della collezione');
    
    const movies = await Movie.find({}).sort({ dateAdded: -1 }).lean();
    
    // Formato MongoDB con ObjectId e metadati
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        database: 'movie-collection',
        collection: 'movies',
        totalDocuments: movies.length
      },
      documents: movies
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="movie-collection-mongodb-${new Date().toISOString().split('T')[0]}.json"`);
    
    console.log(`✅ Export MongoDB completato: ${movies.length} documenti esportati`);
    res.json(exportData);
  } catch (error) {
    console.error('❌ Errore export MongoDB:', error.message);
    next(error);
  }
});

// GET /api/export/csv - Export in formato CSV
router.get('/export/csv', async (req, res, next) => {
  try {
    console.log('📤 Inizio export CSV della collezione');
    
    const movies = await Movie.find({}).sort({ dateAdded: -1 }).lean();
    
    // Header CSV
    const csvHeader = [
      'ID TMDB',
      'Titolo',
      'Titolo Originale',
      'Anno',
      'Generi',
      'DVD',
      'Blu-ray',
      'Voto Medio',
      'Durata (min)',
      'Data Aggiunta',
      'Descrizione'
    ].join(',');

    // Converti film in righe CSV
    const csvRows = movies.map(movie => [
      movie.tmdbId,
      `"${movie.title.replace(/"/g, '""')}"`,
      `"${movie.originalTitle.replace(/"/g, '""')}"`,
      movie.year,
      `"${(movie.genres || []).join('; ')}"`,
      movie.formats.dvd ? 'Sì' : 'No',
      movie.formats.bluray ? 'Sì' : 'No',
      movie.voteAverage || '',
      movie.runtime || '',
      new Date(movie.dateAdded).toLocaleDateString('it-IT'),
      `"${(movie.overview || '').replace(/"/g, '""').substring(0, 200)}"`
    ].join(','));

    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="movie-collection-${new Date().toISOString().split('T')[0]}.csv"`);
    
    // Aggiungi BOM per Excel
    res.write('\ufeff');
    res.end(csvContent);
    
    console.log(`✅ Export CSV completato: ${movies.length} film esportati`);
  } catch (error) {
    console.error('❌ Errore export CSV:', error.message);
    next(error);
  }
});

// POST /api/import - Import da backup JSON
router.post('/import', modifyLimiter, upload.single('backupFile'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File di backup richiesto'
      });
    }

    console.log('📥 Inizio import da backup');

    const backupData = JSON.parse(req.file.buffer.toString());
    
    // Validazione formato backup
    if (!backupData.movies && !backupData.documents) {
      return res.status(400).json({
        success: false,
        error: 'Formato backup non valido'
      });
    }

    const movies = backupData.movies || backupData.documents || [];
    
    if (!Array.isArray(movies)) {
      return res.status(400).json({
        success: false,
        error: 'Dati film non validi nel backup'
      });
    }

    const { mode = 'merge' } = req.body; // 'merge' o 'replace'
    
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Se modalità replace, svuota la collezione
    if (mode === 'replace') {
      const deletedCount = await Movie.deleteMany({});
      console.log(`🗑️ Collezione svuotata: ${deletedCount.deletedCount} film rimossi`);
    }

    // Importa ogni film
    for (const movieData of movies) {
      try {
        const existingMovie = await Movie.findOne({ tmdbId: movieData.tmdbId });
        
        if (existingMovie && mode === 'merge') {
          // Aggiorna formati esistenti
          const updatedFormats = {
            dvd: existingMovie.formats.dvd || movieData.formats?.dvd || false,
            bluray: existingMovie.formats.bluray || movieData.formats?.bluray || false
          };
          
          await Movie.findByIdAndUpdate(existingMovie._id, {
            formats: updatedFormats
          });
          updatedCount++;
        } else if (!existingMovie || mode === 'replace') {
          // Crea nuovo film
          const newMovie = new Movie({
            tmdbId: movieData.tmdbId,
            title: movieData.title,
            originalTitle: movieData.originalTitle,
            year: movieData.year,
            posterUrl: movieData.posterUrl,
            overview: movieData.overview || '',
            formats: movieData.formats || { dvd: false, bluray: false },
            genres: movieData.genres || [],
            runtime: movieData.runtime,
            voteAverage: movieData.voteAverage,
            releaseDate: movieData.releaseDate ? new Date(movieData.releaseDate) : null,
            dateAdded: movieData.dateAdded ? new Date(movieData.dateAdded) : new Date()
          });
          
          await newMovie.save();
          importedCount++;
        } else {
          skippedCount++;
        }
      } catch (movieError) {
        console.error(`❌ Errore importazione film ${movieData.title}:`, movieError.message);
        errors.push({
          movie: movieData.title,
          error: movieError.message
        });
      }
    }

    console.log(`✅ Import completato: ${importedCount} importati, ${updatedCount} aggiornati, ${skippedCount} saltati`);

    res.json({
      success: true,
      message: 'Import completato',
      data: {
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length,
        errorDetails: errors.slice(0, 10) // Mostra solo i primi 10 errori
      }
    });
  } catch (error) {
    console.error('❌ Errore import:', error.message);
    next(error);
  }
});

// GET /api/backup/stats - Statistiche per backup
router.get('/stats', async (req, res, next) => {
  try {
    const [totalMovies, oldestMovie, newestMovie] = await Promise.all([
      Movie.countDocuments(),
      Movie.findOne().sort({ dateAdded: 1 }).lean(),
      Movie.findOne().sort({ dateAdded: -1 }).lean()
    ]);

    res.json({
      success: true,
      data: {
        totalMovies,
        oldestMovie: oldestMovie ? {
          title: oldestMovie.title,
          dateAdded: oldestMovie.dateAdded
        } : null,
        newestMovie: newestMovie ? {
          title: newestMovie.title,
          dateAdded: newestMovie.dateAdded
        } : null,
        lastBackupSuggestion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Suggerisci backup tra 7 giorni
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
