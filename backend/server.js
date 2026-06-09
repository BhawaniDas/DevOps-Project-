require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const connectDB              = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startSlackWorker }   = require('./utils/slackWorker');
const authRoutes             = require('./routes/authRoutes');
const userRoutes             = require('./routes/userRoutes');
const taskRoutes             = require('./routes/taskRoutes');

// ── Boot ─────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

connectDB().then(startSlackWorker);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.CORS_ORIGIN || '*',
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter (generous — auth routes have their own tighter limiter)
app.use(rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            500,
  standardHeaders: true,
  legacyHeaders:  false,
}));

// ── Health check (no auth required — used by Docker/ALB) ─────────────────────
app.get('/health', (_, res) => res.json({
  status:      'ok',
  timestamp:   new Date().toISOString(),
  uptime:      process.uptime(),
  environment: process.env.NODE_ENV || 'development',
  version:     '3.0.0',
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 TaskDash API v3 — port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

module.exports = app;
