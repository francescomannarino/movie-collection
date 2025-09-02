const rateLimit = require('express-rate-limit');

// Rate limiter generale per tutte le API
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minuti
  max: process.env.NODE_ENV === 'development' ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // 1000 in dev, 100 in prod
  message: {
    error: 'Troppe richieste da questo IP, riprova più tardi.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Restituisce info rate limit negli header `RateLimit-*`
  legacyHeaders: false, // Disabilita header `X-RateLimit-*`
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit superato per IP: ${req.ip}`);
    res.status(429).json({
      error: 'Troppe richieste da questo IP, riprova più tardi.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

// Rate limiter più restrittivo per ricerche TMDB
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === 'development' ? 200 : 20, // 200 in dev, 20 in prod
  message: {
    error: 'Troppe ricerche, riprova tra un minuto.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit ricerca superato per IP: ${req.ip}`);
    res.status(429).json({
      error: 'Troppe ricerche, riprova tra un minuto.',
      retryAfter: 60
    });
  }
});

// Rate limiter per operazioni di modifica
const modifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === 'development' ? 300 : 30, // 300 in dev, 30 in prod
  message: {
    error: 'Troppe operazioni di modifica, riprova tra un minuto.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  searchLimiter,
  modifyLimiter
};
