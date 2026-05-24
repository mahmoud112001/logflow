// Wraps async route handlers — forwards any rejection to Express error handler
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

module.exports = catchAsync;
