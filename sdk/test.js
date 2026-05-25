const logger = require('./src/index');

logger.init({
  apiKey: 'Enter your API key here', 
  appName: 'Enter your app name here',               
  baseURL: 'http://localhost:5000'
});

async function run() {
  // 3 INFO logs
  await logger.log('Server started successfully on port 3000', 'INFO');
  await logger.log('Database connection established', 'INFO');
  await logger.log('User logged in successfully', 'INFO');

  // 4 WARN logs
  await logger.log('Database query took 2s — consider indexing', 'WARN');
  await logger.log('Cache miss on key user:123', 'WARN');
  await logger.log('Memory usage exceeded 80%', 'WARN');
  await logger.log('Payment retry attempt #2', 'WARN');

  // 5 ERROR logs
  await logger.log('Unhandled exception caught in middleware', 'ERROR');
  await logger.log('Payment failed — gateway timeout', 'ERROR');
  await logger.log('Database connection lost', 'ERROR');
  await logger.log('Failed to send email notification', 'ERROR');
  await logger.log('Authentication service is unreachable', 'ERROR');

console.log('All logs sent!');

}

run();