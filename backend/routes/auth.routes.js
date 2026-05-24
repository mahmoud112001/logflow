const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout } = require('../controllers/auth.controller');

const router = express.Router();

// Protects login endpoint — 10 attempts per 15-minute window
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

module.exports = router;
