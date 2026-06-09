// ── Centralised error handler (must have 4 params) ───────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${req.method} ${req.path}]`, err.message);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid resource ID' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already exists` });
  }

  res.status(err.statusCode || 500).json({
    error:   err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// ── 404 handler ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

// ── AppError helper: throw structured errors from controllers ─────────────────
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, notFound, AppError };
