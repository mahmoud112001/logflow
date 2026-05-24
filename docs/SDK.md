# LogFlow SDK

## Overview

`logflow-sdk` is a lightweight Node.js package for sending structured log entries to a LogFlow backend. It wraps the LogFlow REST API in a simple two-method interface — `init()` and `log()` — so developers can add structured logging to any Node.js application in under a minute.

The SDK is designed to be fire-and-forget: it never throws on network failure and never blocks your application's execution path.

## Installation

```bash
npm install logflow-sdk
```

The SDK has a single production dependency: `axios`.

## Getting Your API Key

1. Log in to the LogFlow dashboard.
2. On the **Dashboard** page, locate the **API Key** card at the top of the page.
3. Click the copy button next to your API key.

Your API key is permanent and tied to your developer account. Keep it secret — anyone with your key can post logs to applications you own.

## Setup

Call `init()` once at application startup, before any `log()` calls:

```js
const logger = require('logflow-sdk');

logger.init({
  apiKey: 'your-api-key',        // from the LogFlow dashboard
  appName: 'my-app',             // must match an application you own
  baseURL: 'http://localhost:5000' // optional — defaults to http://localhost:5000
});
```

Because Node.js caches modules, every `require('logflow-sdk')` in your app returns the same singleton instance. You only need to call `init()` once.

## Methods

### init(options)

Configures the logger. Must be called before `log()`. Throws synchronously if any option is invalid.

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | string | Yes | Your LogFlow API key from the dashboard |
| `appName` | string | Yes | The name of your LogFlow application (no spaces) |
| `baseURL` | string | No | Base URL of the LogFlow backend (default: `http://localhost:5000`) |

**Validation rules:**

- `apiKey` must be a non-empty string → throws `LogFlow: apiKey is required and must be a string`
- `appName` must be a non-empty string with no whitespace → throws `LogFlow: appName is required and must not contain spaces`
- `baseURL` must be a non-empty string → throws `LogFlow: baseURL must be a valid string`

Trailing slashes in `baseURL` are stripped automatically.

### log(message, level)

Sends a log entry to the LogFlow backend. Async and fire-and-forget — safe to call without `await`.

| Param | Type | Valid values | Description |
|---|---|---|---|
| `message` | string | Any non-empty string | The log message to record |
| `level` | string | `INFO`, `WARN`, `ERROR` | Severity level of the entry |

Throws synchronously (before any network call) if:
- `init()` has not been called → `LogFlow: call init() before log()`
- `message` is empty or not a string → `LogFlow: message must be a non-empty string`
- `level` is not one of the valid values → `LogFlow: level must be one of INFO, WARN, ERROR`

Network failures are caught internally and reported via `console.warn`. They do not throw.

## Full Integration Example

A minimal Express.js server using all three log levels:

```js
const express = require('express');
const logger = require('logflow-sdk');

// Initialise once at startup
logger.init({
  apiKey: process.env.LOGFLOW_API_KEY,
  appName: 'my-express-app',
  baseURL: process.env.LOGFLOW_URL || 'http://localhost:5000'
});

const app = express();
app.use(express.json());

app.listen(3000, () => {
  logger.log('Server started on port 3000', 'INFO');
});

app.post('/orders', async (req, res) => {
  try {
    // ... process order ...
    logger.log('Order created successfully', 'INFO');
    res.status(201).json({ status: 'ok' });
  } catch (err) {
    logger.log(`Order creation failed: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res, next) => {
  logger.log(`404 — route not found: ${req.path}`, 'WARN');
  res.status(404).json({ error: 'Not found' });
});
```

## Error Handling

**`init()` throws synchronously** for invalid configuration. Wrap it in a try/catch if you want to handle misconfiguration gracefully, or let it crash at startup (which is usually the right behaviour — a misconfigured logger should fail loudly during development).

```js
try {
  logger.init({ apiKey: '', appName: 'my-app' });
} catch (err) {
  console.error('Logger config error:', err.message);
  process.exit(1);
}
```

**`log()` never throws on network failure.** If the HTTP request to the LogFlow backend fails (network error, server down, timeout), the SDK catches the error and emits a warning:

```
[LogFlow] Failed to send log: Network Error
```

Your application continues running normally. Log failures are non-fatal by design.

**Validate before deploying.** If `log()` calls are silently failing, check:
- Your `apiKey` is correct and copied in full from the dashboard
- Your `appName` matches exactly (case-sensitive) the application name in LogFlow
- Your `baseURL` points to the correct LogFlow backend

## How Ownership Validation Works

When the SDK POSTs a log, the LogFlow backend performs an ownership check:

1. The server finds the application by `appName`.
2. The server finds the developer whose `apiKey` matches the supplied key.
3. It compares the application's `owner` to the developer's `_id`.
4. If they match → the log is accepted and stored.
5. If they don't match → the server returns `403 Forbidden`.

A `403` is treated as a network-level failure by the SDK and reported via `console.warn`:

```
[LogFlow] Failed to send log: Request failed with status code 403
```

This means you can only post logs to applications you own. You cannot post to another developer's application even if you know its name.
