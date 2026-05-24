const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Developer = require('../models/Developer');
const { JWT_SECRET } = require('../config/env');

const protect = catchAsync(async (req, res, next) => {
  // Token must come from the cookie, never the Authorization header
  const token = req.cookies.jwt;
  if (!token) return next(new AppError('Not authenticated. Please log in', 401));

  // JWT errors (invalid / expired) bubble up through catchAsync to global handler
  const decoded = jwt.verify(token, JWT_SECRET);

  // Fetch developer and include apiKey for downstream use
  const developer = await Developer.findById(decoded.id).select('+apiKey');
  if (!developer) return next(new AppError('Developer no longer exists', 401));

  // Attach to req so controllers don't need to re-query
  req.developer = developer;
  next();
});

module.exports = protect;
