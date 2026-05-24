// Must be first — validates and loads all env vars before anything else
require('./config/env');

const connectDB = require('./config/db');
const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');

// Register before any async work so sync throws are caught immediately
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

// Connect to DB then start listening
connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`)
  );

  // Graceful shutdown on unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err.message);
    server.close(() => process.exit(1));
  });
});
