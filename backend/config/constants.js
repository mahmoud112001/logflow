// Shared constants — frozen to prevent runtime mutation
const constants = Object.freeze({
  LOG_LEVELS: Object.freeze(['INFO', 'WARN', 'ERROR']),
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_OPTIONS: Object.freeze({
    RECENT: '-updatedAt',
    MOST_OCCURRED: '-count',
  }),
});

module.exports = constants;
