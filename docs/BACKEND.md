# Backend Documentation

## Architecture

LogFlow's backend follows the **MVC pattern** with a dedicated service layer to keep controllers thin:

```
HTTP Request
    ↓
Routes          (app.routes.js, auth.routes.js, log.routes.js)
    ↓
Middleware      (auth.js — JWT protect, apiKey.js — API key validation)
    ↓
Controllers     (app.controller.js, auth.controller.js, log.controller.js)
    ↓
Services        (app.service.js, auth.service.js, log.service.js)
    ↓
Models          (Developer.js, Application.js, Log.js)
    ↓
MongoDB
```

Controllers handle HTTP concerns (request parsing, response shaping). Services contain business logic and database calls. This separation makes logic reusable and independently testable.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB via Mongoose 8 |
| Auth tokens | jsonwebtoken |
| Password hashing | bcryptjs |
| Security headers | helmet |
| Rate limiting | express-rate-limit |
| Environment | dotenv |
| Dev server | nodemon |

## Project Structure

```
backend/
├── config/
│   ├── constants.js      ← Shared constants (VALID_LEVELS, etc.)
│   ├── db.js             ← Mongoose connection setup
│   └── env.js            ← Environment variable validation and export
├── controllers/
│   ├── app.controller.js ← CRUD handlers for applications
│   ├── auth.controller.js← Register, login, logout, /me handlers
│   └── log.controller.js ← Log creation and retrieval handlers
├── middleware/
│   ├── apiKey.js         ← Validates x-api-key header, attaches app + developer
│   └── auth.js           ← protect(): validates JWT cookie, attaches req.developer
├── models/
│   ├── Application.js    ← Mongoose schema for registered applications
│   ├── Developer.js      ← Mongoose schema for developer accounts
│   └── Log.js            ← Mongoose schema for log entries (upsert model)
├── routes/
│   ├── app.routes.js     ← /api/applications routes
│   ├── auth.routes.js    ← /api/users routes
│   └── log.routes.js     ← /api/applications/:name/logs routes
├── services/
│   ├── app.service.js    ← Application business logic (create, list, delete)
│   ├── auth.service.js   ← Register/login logic, token generation
│   └── log.service.js    ← Log upsert logic, filtering, pagination, chart data
├── utils/
│   ├── AppError.js       ← Custom error class with statusCode + status fields
│   ├── catchAsync.js     ← Wraps async controllers to forward errors to Express
│   ├── paginate.js       ← Reusable pagination helper (skip, limit, meta)
│   └── response.js       ← Standardised success/error response formatters
├── app.js                ← Express app setup: middleware, routes, error handler
└── server.js             ← Entry point: DB connect → server listen
```

## API Endpoints

### Auth Endpoints — `/api/users`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/users/register` | None | `{ username, email, password }` | `{ status, data: { developer } }` |
| `POST` | `/api/users/login` | None | `{ email, password }` | Sets `jwt` cookie; `{ status, data: { developer } }` |
| `POST` | `/api/users/logout` | JWT Cookie | — | Clears cookie; `{ status, message }` |
| `GET` | `/api/users/me` | JWT Cookie | — | `{ status, data: { developer } }` |

### Application Endpoints — `/api/applications`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/applications` | JWT Cookie | `{ name }` | `{ status, data: { application } }` |
| `GET` | `/api/applications` | JWT Cookie | — | `{ status, data: { applications } }` |
| `DELETE` | `/api/applications/:name` | JWT Cookie | — | `{ status, message }` |

### Log Endpoints — `/api/applications/:name/logs`

| Method | Endpoint | Auth | Headers | Query Params | Response |
|---|---|---|---|---|---|
| `POST` | `/api/applications/:name/logs` | API Key | `x-api-key` | — | `{ status, data: { log } }` |
| `GET` | `/api/applications/:name/logs` | JWT Cookie | — | `page`, `limit`, `level`, `search`, `sort` | `{ status, data: { logs, pagination } }` |
| `GET` | `/api/applications/:name/logs/charts` | JWT Cookie | — | — | `{ status, data: { byLevel, byDay } }` |

**Log query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Results per page |
| `level` | string | — | Filter by `INFO`, `WARN`, or `ERROR` |
| `search` | string | — | Substring match on `message` |
| `sort` | string | `newest` | `newest` or `oldest` |

## Business Rules

**Log deduplication (upsert):** When a log entry arrives, the backend checks for an existing document with the same `message`, `level`, and `application`. If found, it increments `count` and updates `updatedAt` (last occurrence). If not found, a new document is created with `count: 1`. This keeps repeated log lines collapsed rather than creating noise.

**Immutable `createdAt`:** `createdAt` is set on first creation only and never updated, recording the first time a log entry was seen. `updatedAt` reflects the most recent occurrence.

**Application name rules:** Names must be globally unique across all developers and must not contain whitespace. Enforced at the model level with a regex validator and a unique index.

**API key ownership:** When the SDK POSTs a log, the `apiKey.js` middleware looks up the application by name, then verifies the application's `owner` matches the developer whose `apiKey` was supplied. A mismatch returns `403 Forbidden`. Developers cannot log to applications they don't own.

## Error Handling

All errors flow through a single Express global error handler registered at the bottom of `app.js`.

**`AppError`** — a subclass of `Error` with `statusCode` and `status` (e.g. `'fail'` for 4xx, `'error'` for 5xx). Thrown from services and controllers for expected failures.

**`catchAsync`** — wraps every async controller function so unhandled promise rejections are forwarded to `next(err)` without boilerplate try/catch in every handler.

**`response.js`** — provides `sendSuccess(res, data, statusCode)` and `sendError(res, message, statusCode)` for consistent response shapes across all endpoints.

Named error types surfaced to the client:

| Scenario | Status |
|---|---|
| Invalid credentials | 401 |
| Missing or invalid JWT | 401 |
| Missing or invalid API key | 401 |
| API key / app ownership mismatch | 403 |
| Resource not found | 404 |
| Duplicate application name | 409 |
| Validation failure | 400 |
| Unexpected server error | 500 |

## Security

| Measure | Implementation |
|---|---|
| Security headers | `helmet` applied globally in `app.js` |
| CORS | Restricted to `FRONTEND_URL` with `credentials: true` |
| Rate limiting | `express-rate-limit`: 10 requests per 15 minutes on `/api/users/login` |
| Session tokens | `httpOnly` cookie — inaccessible to JavaScript, XSS-safe |
| Password storage | `bcryptjs` with salt rounds (never stored in plaintext) |
| API key exposure | Returned once on register; stored in DB, never re-transmitted on login |
