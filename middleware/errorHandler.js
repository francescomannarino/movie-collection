// Middleware per gestione errori centralizzata
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Errore:', err);

  // Errori di validazione Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Errore risorsa non trovata Mongoose
  if (err.name === 'CastError') {
    error = {
      message: 'Risorsa non trovata',
      statusCode: 404
    };
  }

  // Errore duplicato MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      message: `Film già presente nella collezione: ${value}`,
      statusCode: 400
    };
  }

  // Errori di connessione MongoDB
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    error = {
      message: 'Errore di connessione al database',
      statusCode: 500
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware per gestire rotte non trovate
const notFound = (req, res, next) => {
  const error = new Error(`Rotta non trovata - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
