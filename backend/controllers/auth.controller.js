const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const authService = require('../services/auth.service');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

// Single source of truth for cookie config — used by all three handlers
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Only safe, non-sensitive fields sent to the client
const safeDevData = (dev) => ({
  id: dev._id,
  username: dev.username,
  email: dev.email,
  apiKey: dev.apiKey,
});

// register — creates account, signs token, sets cookie
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const { developer } = await authService.registerDeveloper({ username, email, password });

  // Token generated here; registerDeveloper intentionally doesn't return one
  const token = jwt.sign({ id: developer._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie('jwt', token, cookieOptions);
  sendSuccess(res, 201, { developer: safeDevData(developer) }, 'Registration successful');
});

// login — validates credentials, sets cookie
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password are required', 400));

  const { developer, token } = await authService.loginDeveloper({ email, password });
  res.cookie('jwt', token, cookieOptions);
  sendSuccess(res, 200, { developer: safeDevData(developer) }, 'Login successful');
});

// logout — clears the JWT cookie; no auth required
const logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt', cookieOptions);
  sendSuccess(res, 200, {}, 'Logged out successfully');
});

module.exports = { register, login, logout };
