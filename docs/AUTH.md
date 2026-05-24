# Authentication & Authorization

## Two Auth Systems

LogFlow uses two independent authentication mechanisms for two distinct actors:

| System | Used by | Transport | Protects |
|---|---|---|---|
| **JWT Cookie** | Developer (via browser dashboard) | `httpOnly` cookie | Dashboard routes, management API |
| **API Key** | SDK (programmatic log posting) | `x-api-key` request header | Log ingestion endpoint |

Neither system replaces the other. A developer's browser session cannot post logs on behalf of an SDK, and an SDK API key cannot access the dashboard API.

## JWT Auth Flow

### Step-by-step

1. **Register** — `POST /api/users/register` with `{ username, email, password }`. The server hashes the password with bcrypt, generates a UUID `apiKey`, saves the developer, and returns the created account.

2. **Login** — `POST /api/users/login` with `{ email, password }`. The server fetches the developer by email, compares the submitted password against the stored bcrypt hash, signs a JWT, and sets it as an `httpOnly` cookie on the response.

3. **Cookie set** — The JWT is written as an `httpOnly`, `sameSite: strict` cookie named `jwt`. It is never accessible to JavaScript running on the page.

4. **Protected route access** — On every subsequent request to a protected endpoint, the browser automatically sends the cookie. The `protect` middleware validates it and attaches the developer to `req.developer`.

5. **Logout** — `POST /api/users/logout` clears the cookie by setting it to an empty value with `maxAge: 0`.

### Token payload

```json
{ "id": "<developer._id>" }
```

The payload contains only the developer's MongoDB ObjectId. No sensitive data is embedded in the token.

### Storage

Tokens are stored exclusively in an `httpOnly` cookie. They are never returned in the response body or stored in `localStorage`.

### Expiry

Controlled by the `JWT_EXPIRES_IN` environment variable (e.g. `7d`, `24h`, `30d`). Expired tokens are rejected by the `protect` middleware with a `401` response.

## protect Middleware Flow

`middleware/auth.js` — applied to all dashboard API routes.

1. Extract the `jwt` cookie from `req.cookies`.
2. If missing → throw `401 No token provided`.
3. Verify the token using `jwt.verify(token, JWT_SECRET)`. If expired or tampered → throw `401 Invalid or expired token`.
4. Decode the payload to get `id`.
5. Query the database: `Developer.findById(id)`.
6. If the developer no longer exists → throw `401 Developer not found`.
7. Attach the developer document to `req.developer`.
8. Call `next()`.

## API Key Auth Flow

`middleware/apiKey.js` — applied only to `POST /api/applications/:name/logs`.

1. Extract the `x-api-key` header from the request.
2. If missing → throw `401 API key required`.
3. Look up the application by `:name` parameter: `Application.findOne({ name })`.
4. If not found → throw `404 Application not found`.
5. Look up the developer whose `apiKey` matches the supplied key: `Developer.findOne({ apiKey })`.
6. If no developer found → throw `401 Invalid API key`.
7. Compare `application.owner` with `developer._id`. If they don't match → throw `403 Forbidden — you do not own this application`.
8. Attach both `req.application` and `req.developer` for use in the log controller.
9. Call `next()`.

## Security Decisions

**`httpOnly` cookie vs `localStorage`**
JWTs in `localStorage` are readable by any JavaScript on the page, making them vulnerable to XSS attacks. An `httpOnly` cookie is never accessible to scripts — the browser manages it and sends it automatically, removing the attack surface entirely.

**Same error for wrong email and wrong password**
Both failure cases return the same generic message: `"Invalid email or password"`. Returning distinct messages (e.g. `"Email not found"` vs `"Wrong password"`) would let an attacker enumerate valid email addresses by observing the response. A uniform message prevents this.

**API key stability**
The `apiKey` is generated at registration and never changes, even if the developer updates their password. This ensures that SDK integrations already deployed in production continue to work after a password change without any reconfiguration.

**Rate limiting on `/login`**
`express-rate-limit` restricts the login endpoint to **10 requests per 15 minutes per IP**. This throttles brute-force password guessing without affecting legitimate users.
