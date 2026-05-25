<div align="center">

<img src="https://img.shields.io/badge/LogFlow-Log%20Management%20Platform-6366f1?style=for-the-badge&logoColor=white" alt="LogFlow" />

<br />
<br />

> **A full-stack developer log management platform** — send structured logs from any Node.js app, monitor them in real-time through a beautiful dashboard, and manage everything through a lightweight SDK.

<br />

## **Project video:** https://screenrec.com/share/WX0Im7o5KE

<br />

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [SDK Usage](#-sdk-usage)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Git Conventions](#-git-conventions)

---

## 🔍 Overview

**LogFlow** is a log management SaaS platform built for developers who want structured, real-time visibility into what's happening inside their applications.

Instead of scanning raw terminal output or digging through log files, developers install the `logflow-sdk` npm package into their app, call two methods, and immediately start seeing clean, categorized log entries in a live dashboard — with filtering, sorting, pagination, and analytics charts out of the box.

LogFlow is composed of **three independent packages**:

| Package | Description |
|---|---|
| `backend/` | REST API built with Node.js, Express, and MongoDB |
| `frontend/` | React dashboard built with Vite and Tailwind CSS |
| `sdk/` | Lightweight npm package (`logflow-sdk`) for sending logs |

---

## ✨ Features

### 👤 Developer Account
- Secure registration and login with hashed passwords (bcrypt)
- JWT authentication stored in `httpOnly` cookies (XSS-safe)
- Unique API key per developer — auto-generated, permanent, and visible on the dashboard
- Rate-limited login endpoint (10 req / 15 min) to prevent brute force attacks

### 📦 Application Management
- Create named applications (globally unique, no whitespace)
- Delete applications with a confirmation prompt
- View all your applications in a responsive card grid

### 📋 Log Management
- Log entries have three severity levels: `INFO`, `WARN`, `ERROR`
- **Upsert deduplication**: identical messages increment a `count` field instead of creating duplicates
- `createdAt` = first occurrence (immutable), `updatedAt` = last occurrence (always fresh)
- Full filtering: by level, by message substring search
- Sorting: by most recent (default) or most occurred
- Pagination: 10 per page, with total count and page range display

### 📊 Analytics Charts
- **Pie chart** — live ratio of INFO / WARN / ERROR log levels
- **Line graph** — log activity per day over the last 7 days (3 separate lines per level)

### 🔌 SDK (`logflow-sdk`)
- Two-method API: `init()` and `log()`
- Fire-and-forget: network failures never crash the caller's app
- Input validation before any network call
- Node.js module caching ensures singleton behavior

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Developer App                        │
│                                                             │
│   const logger = require('logflow-sdk')                    │
│   logger.init({ apiKey, appName })                         │
│   logger.log('Server started', 'INFO')  ──────────────┐    │
└───────────────────────────────────────────────────────│────┘
                                                        │ POST /api/applications/:name/logs
                                                        │ Header: x-api-key
                                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express REST API                         │
│                                                             │
│  Routes → Middleware → Controllers → Services → Models     │
│                                                             │
│  Auth:    JWT cookie  (dashboard sessions)                 │
│  SDK:     x-api-key header (log ingestion only)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │    MongoDB      │
              │                 │
              │  developers     │
              │  applications   │
              │  logs           │
              └─────────────────┘
                        ▲
                        │ Axios + withCredentials
┌─────────────────────────────────────────────────────────────┐
│                   React Dashboard                           │
│                                                             │
│  Login / Register → Dashboard → App Detail → Charts        │
│                                                             │
│  Vite proxy: /api → localhost:5000 (dev)                   │
└─────────────────────────────────────────────────────────────┘
```

### MVC + Service Layer (Backend)
```
HTTP Request
     ↓
  Routes          (auth.routes.js · app.routes.js · log.routes.js)
     ↓
  Middleware       (auth.js — JWT guard · apiKey.js — SDK auth)
     ↓
  Controllers      (parse req · call service · send response)
     ↓
  Services         (business logic · DB calls · upsert logic)
     ↓
  Models           (Developer · Application · Log)
     ↓
  MongoDB
```

---

## 🖼 Screenshots

<div align="center">

### Login & Register
<img src="./screenshots/Screenshot 2026-05-24 213125.png" width="700" />

### Dashboard — API Key + Applications
<img src="./screenshots/Screenshot 2026-05-24 213141.png" width="700" />
<img src="./screenshots/Screenshot 2026-05-24 213250.png" width="700" />

### Application Detail — Logs Table
<img src="./screenshots/Screenshot 2026-05-24 213343.png" width="700" />
<img src="./screenshots/Screenshot 2026-05-24 213409.png" width="700" />

### Filtering & Search
<img src="./screenshots/Screenshot 2026-05-24 213442.png" width="700" />
<img src="./screenshots/Screenshot 2026-05-24 213456.png" width="700" />

### Charts — Pie + Line Graph
<img src="./screenshots/Screenshot 2026-05-24 213525.png" width="700" />
<img src="./screenshots/Screenshot 2026-05-24 213602.png" width="700" />

</div>

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 or higher |
| MongoDB | Local or Atlas |
| npm | 9 or higher |

### 1 — Clone the repository

```bash
git clone https://github.com/mahmoud112001/logflow.git
cd logflow
```

### 2 — Start the Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/logflow
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
# ✅  MongoDB connected: localhost
# ✅  Server running on port 5000 in development mode
```

### 3 — Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
# ✅  VITE ready at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 4 — Register & Create an App

1. Go to `/register` → create your account
2. Your **API key** is shown on the dashboard
3. Click **Create** and enter an app name (no spaces)

---

## 🔌 SDK Usage

### Install

```bash
npm install logflow-sdk
```

### Setup

```js
const logger = require('logflow-sdk');

// Call once at startup
logger.init({
  apiKey: 'your-api-key',       // from the LogFlow dashboard
  appName: 'my-app',            // must match an app you created
  baseURL: 'http://localhost:5000'  // default value
});
```

### Send Logs

```js
logger.log('Server started on port 3000', 'INFO');
logger.log('Slow DB query detected — 2.4s', 'WARN');
logger.log('Unhandled exception in /orders', 'ERROR');
```

### Real-world Express Example

```js
const express = require('express');
const logger = require('logflow-sdk');

logger.init({
  apiKey: process.env.LOGFLOW_API_KEY,
  appName: 'my-express-app',
});

const app = express();

app.listen(3000, () => {
  logger.log('Server is live', 'INFO');
});

app.post('/checkout', async (req, res) => {
  try {
    // ... process payment
    logger.log('Payment completed', 'INFO');
    res.json({ ok: true });
  } catch (err) {
    logger.log(`Payment error: ${err.message}`, 'ERROR');
    res.status(500).json({ error: 'Payment failed' });
  }
});
```

> `log()` is fire-and-forget. Network failures go to `console.warn` — your app **never crashes** due to a logging failure.

---

## 📡 API Reference

### Auth — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users` | None | Register a new developer |
| `POST` | `/api/users/login` | None | Login (sets JWT cookie) |
| `POST` | `/api/users/logout` | JWT Cookie | Logout (clears cookie) |

### Applications — `/api/applications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/applications` | JWT Cookie | Get all your applications |
| `POST` | `/api/applications` | JWT Cookie | Create an application |
| `GET` | `/api/applications/:name` | JWT Cookie | Get application by name |
| `DELETE` | `/api/applications/:name` | JWT Cookie | Delete an application |

### Logs — `/api/applications/:name/logs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/applications/:name/logs` | JWT Cookie | Get logs (filterable, paginated) |
| `POST` | `/api/applications/:name/logs` | `x-api-key` header | Post a log (SDK use) |

**GET log query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Results per page (max 100) |
| `level` | string | — | Filter: `INFO`, `WARN`, or `ERROR` |
| `search` | string | — | Substring match on message |
| `sort` | string | `recent` | `recent` or `most_occurred` |

---

## 🔐 Security

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs — 12 salt rounds |
| JWT storage | `httpOnly` cookie — never in `localStorage` |
| CORS | Locked to `FRONTEND_URL` with `credentials: true` |
| Security headers | `helmet` applied globally |
| Rate limiting | 10 login attempts per 15 minutes per IP |
| API key auth | Server verifies key ownership before accepting logs |
| Enumeration protection | Same error message for wrong email or wrong password |

---

## 🌍 Environment Variables

Create `backend/.env`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Express server port |
| `MONGO_URI` | ✅ Yes | — | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | — | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry (e.g. `1d`, `7d`) |
| `NODE_ENV` | No | `development` | Set `production` in deployment |
| `FRONTEND_URL` | ✅ Yes | — | Allowed CORS origin |

---

## 📁 Project Structure

```
logflow/
├── backend/
│   ├── config/
│   │   ├── constants.js        ← LOG_LEVELS, pagination, sort options
│   │   ├── db.js               ← Mongoose connection
│   │   └── env.js              ← Env validation + frozen config
│   ├── controllers/
│   │   ├── app.controller.js   ← Application CRUD handlers
│   │   ├── auth.controller.js  ← Register, login, logout
│   │   └── log.controller.js   ← Get logs, post log
│   ├── middleware/
│   │   ├── auth.js             ← JWT cookie guard (protect)
│   │   └── apiKey.js           ← API key ownership validation
│   ├── models/
│   │   ├── Developer.js        ← User schema + bcrypt + apiKey gen
│   │   ├── Application.js      ← App schema + whitespace validator
│   │   └── Log.js              ← Log schema + compound unique index
│   ├── routes/
│   │   ├── auth.routes.js      ← /api/users
│   │   ├── app.routes.js       ← /api/applications
│   │   └── log.routes.js       ← /api/applications/:name/logs
│   ├── services/
│   │   ├── auth.service.js     ← Register/login business logic
│   │   ├── app.service.js      ← Application CRUD logic
│   │   └── log.service.js      ← Log upsert, filter, paginate
│   ├── utils/
│   │   ├── AppError.js         ← Operational error class
│   │   ├── catchAsync.js       ← Async error forwarding wrapper
│   │   ├── paginate.js         ← Pagination helper
│   │   └── response.js         ← Unified response formatters
│   ├── app.js                  ← Express setup, routes, error handler
│   └── server.js               ← Entry point, DB connect, process guards
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── FilterBar.jsx   ← Debounced search + level + sort controls
│       │   ├── LogCharts.jsx   ← Pie (level ratio) + Line (7-day) charts
│       │   ├── LogTable.jsx    ← Table with badges, truncation, skeletons
│       │   ├── Navbar.jsx      ← Fixed top bar with auth state
│       │   ├── Pagination.jsx  ← Range display + Prev/Next controls
│       │   └── PrivateRoute.jsx← Route guard → redirect to /login
│       ├── context/
│       │   └── AuthContext.jsx ← Global auth state + localStorage persistence
│       ├── hooks/
│       │   └── useAuth.js      ← Context hook with guard
│       ├── pages/
│       │   ├── AppDetail.jsx   ← Logs table + charts tabs
│       │   ├── Dashboard.jsx   ← API key card + application grid
│       │   ├── Login.jsx       ← Login form
│       │   ├── Register.jsx    ← Register form
│       │   └── NotFound.jsx    ← 404 page
│       └── services/
│           ├── api.js          ← Axios instance + error interceptor
│           ├── auth.service.js ← Auth API calls
│           └── app.service.js  ← App + log API calls
│
├── sdk/
│   └── src/
│       ├── Logger.js           ← Logger class: init() + log()
│       └── index.js            ← Singleton export
│
├── docs/
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── SCHEMA.md
│   ├── AUTH.md
│   └── SDK.md
│
└── README.md
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Backend](./docs/BACKEND.md) | API endpoints, MVC architecture, error handling, security |
| [Frontend](./docs/FRONTEND.md) | Pages, components, state management, API integration |
| [Database Schema](./docs/SCHEMA.md) | Models, fields, relations, indexes |
| [Authentication](./docs/AUTH.md) | JWT flow, API key flow, security decisions |
| [SDK](./docs/SDK.md) | Full SDK reference, integration guide, error handling |

---

## 🔀 Git Conventions

### Commit Prefixes

| Prefix | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Dependencies, config, tooling |
| `docs` | Documentation only |
| `refactor` | Restructure without behavior change |
| `test` | Tests |
| `style` | Formatting, whitespace |

**Example:**
```bash
git commit -m "feat(auth): add JWT middleware with cookie-based token storage"
git commit -m "fix(log): correct upsert filter to include application scope"
git commit -m "docs: add SDK integration example to README"
```

### Branch Prefixes

| Prefix | Usage |
|---|---|
| `feature/` | New functionality |
| `bugfix/` | Non-critical bug fix |
| `hotfix/` | Urgent production fix |
| `docs/` | Documentation updates |
| `chore/` | Maintenance tasks |

---

<div align="center">

Built with ❤️ using Node.js · Express · MongoDB · React · Vite

</div>