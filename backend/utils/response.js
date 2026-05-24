// Single source of truth for all JSON response shapes

// 2xx responses with optional data payload and message
const sendSuccess = (res, statusCode, data = {}, message = '') =>
  res.status(statusCode).json({ status: 'success', message, data });

// Error responses with a plain message string
const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({ status: 'error', message });

module.exports = { sendSuccess, sendError };
