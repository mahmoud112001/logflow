const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Derives page, limit, and skip from raw req.query
const getPagination = (query) => {
  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  // Clamp limit to MAX_LIMIT ceiling
  const limit = Math.min(parseInt(query.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = getPagination;
