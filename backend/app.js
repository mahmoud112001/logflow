const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const { sendError } = require('./utils/response');
const { NODE_ENV } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const appRoutes = require('./routes/app.routes');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/users', authRoutes);
app.use('/api/applications', appRoutes);

// ── 404 handler ─────────────────────────────────────────────
app.all('*', (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
);

// ── Global error handler ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Normalise known Mongoose / JWT error types into AppErrors
  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  if (err.code === 11000) {
    // Extract the duplicated field name from keyValue
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 400, `${field} already exists`);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return sendError(res, 400, message);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired. Please log in again');
  }

  // Known operational errors (AppError instances)
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  // Unknown / programmer errors
  if (NODE_ENV === 'development') {
    return res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }

  // Production — hide internal details
  return sendError(res, 500, 'Something went wrong');
});

module.exports = app;
