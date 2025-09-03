const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalTitle: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1800,
    max: new Date().getFullYear() + 10
  },
  posterUrl: {
    type: String,
    default: null
  },
  overview: {
    type: String,
    default: ''
  },
  formats: {
    dvd: {
      type: Boolean,
      default: false
    },
    bluray: {
      type: Boolean,
      default: false
    }
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  genres: [{
    type: String,
    trim: true
  }],
  runtime: {
    type: Number,
    min: 0
  },
  voteAverage: {
    type: Number,
    min: 0,
    max: 10
  },
  releaseDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indici per ottimizzare le query
movieSchema.index({ title: 'text', originalTitle: 'text' });
movieSchema.index({ year: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ dateAdded: -1 });

// Validazione custom per assicurarsi che almeno un formato sia selezionato
movieSchema.pre('save', function(next) {
  if (!this.formats.dvd && !this.formats.bluray) {
    const error = new Error('Almeno un formato (DVD o Blu-ray) deve essere selezionato');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Metodo per ottenere i formati posseduti come array
movieSchema.methods.getOwnedFormats = function() {
  const formats = [];
  if (this.formats.dvd) formats.push('DVD');
  if (this.formats.bluray) formats.push('Blu-ray');
  return formats;
};

// Metodo statico per cercare film per titolo
movieSchema.statics.searchByTitle = function(query) {
  return this.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

module.exports = mongoose.model('Movie', movieSchema);
