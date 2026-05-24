const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Application = require('../models/Application');
const Developer = require('../models/Developer');

const validateApiKey = catchAsync(async (req, res, next) => {
  // Key must come from the x-api-key header, never query params or body
  const providedKey = req.headers['x-api-key'];
  if (!providedKey) return next(new AppError('API key is required', 401));

  // Resolve the target application from the route param
  const application = await Application.findOne({ name: req.params.name });
  if (!application) return next(new AppError('Application not found', 404));

  // Look up developer by the provided key
  const developer = await Developer.findOne({ apiKey: providedKey });
  if (!developer) return next(new AppError('Invalid API key', 401));

  // Enforce ownership — key holder must own this specific application
  if (developer._id.toString() !== application.owner.toString()) {
    return next(new AppError('Forbidden: API key does not belong to this application', 403));
  }

  // Attach both to req so the log controller skips redundant DB calls
  req.developer = developer;
  req.application = application;
  next();
});

module.exports = validateApiKey;
