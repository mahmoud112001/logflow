const axios = require('axios');

// Accepted log severity levels
const VALID_LEVELS = ['INFO', 'WARN', 'ERROR'];

class Logger {
  constructor() {
    this._apiKey = null;
    this._appName = null;
    this._baseURL = null;
    this._initialized = false;
  }

  // Configure the logger — must be called before log()
  init({ apiKey, appName, baseURL = 'http://localhost:5000' } = {}) {
    // Validate apiKey
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('LogFlow: apiKey is required and must be a string');
    }

    // Validate appName — no whitespace allowed
    if (!appName || typeof appName !== 'string' || !/^\S+$/.test(appName)) {
      throw new Error('LogFlow: appName is required and must not contain spaces');
    }

    // Validate baseURL
    if (!baseURL || typeof baseURL !== 'string') {
      throw new Error('LogFlow: baseURL must be a valid string');
    }

    this._apiKey = apiKey;
    this._appName = appName;
    // Strip trailing slash to avoid double-slash in URLs
    this._baseURL = baseURL.replace(/\/$/, '');
    this._initialized = true;
  }

  // Send a log entry — fire-and-forget, never throws on network failure
  async log(message, level) {
    // Guard: init() must be called first
    if (!this._initialized) {
      throw new Error('LogFlow: call init() before log()');
    }

    // Validate message
    if (!message || typeof message !== 'string') {
      throw new Error('LogFlow: message must be a non-empty string');
    }

    // Validate level against allowed values
    if (!VALID_LEVELS.includes(level)) {
      throw new Error(`LogFlow: level must be one of ${VALID_LEVELS.join(', ')}`);
    }

    const url = `${this._baseURL}/api/applications/${this._appName}/logs`;

    try {
      // POST the log entry to the LogFlow backend
      await axios.post(
        url,
        { message, level },
        { headers: { 'x-api-key': this._apiKey, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      // Never crash the caller's app — warn silently instead
      console.warn(`[LogFlow] Failed to send log: ${err.message}`);
    }
  }
}

module.exports = Logger;
