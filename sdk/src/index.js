const Logger = require('./Logger');

// Export a singleton — Node.js module caching ensures every require() gets the same instance
const logger = new Logger();

module.exports = logger;
