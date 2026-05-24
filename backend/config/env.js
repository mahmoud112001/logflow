require('dotenv').config();

// Required environment variables
const REQUIRED_VARS = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'NODE_ENV'];

// Validate all required vars are present
REQUIRED_VARS.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Frozen config — no mutations allowed at runtime
const config = Object.freeze({
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV,
});

module.exports = config;
