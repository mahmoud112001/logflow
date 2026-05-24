# LogFlow — Application Log Management Platform

## Overview

LogFlow is a full-stack log management platform that lets developers send structured log entries from their applications and monitor them through a real-time dashboard. It consists of a Node.js/Express backend, a React dashboard, and a lightweight npm SDK that developers install in their own apps to start logging in minutes.

## Project Structure

LogFlow is organized as a monorepo with three independently runnable packages:

```
logflow/
├── backend/          ← Express REST API + MongoDB
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/         ← React dashboard (Vite)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── sdk/              ← npm package for app logging
│   ├── src/
│   └── package.json
├── docs/             ← project documentation
└── screenshots/      ← UI and demo assets
```

Each package has its own `package.json` and can be developed, tested, and deployed independently.

## Build & Start

### Install dependencies

Install each package dependencies individually:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../sdk
npm install
```

### Start the backend

Create `backend/.env` and then run:

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` for the dashboard.

### Build for production

```bash
cd frontend
npm run build
```

Preview the built frontend:

```bash
npm run preview
```

### SDK usage

The `sdk` package is published as `logflow-sdk`. In your own application:

```bash
npm install logflow-sdk
```

Then use:

```js
const logger = require('logflow-sdk');

logger.init({ apiKey: 'your-api-key', appName: 'my-app' });
logger.log('Server started', 'INFO');
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm 9+

### 1. Backend Setup

```bash
git clone https://github.com/mahmoud112001/logflow
cd logflow/backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev
# API running at http://localhost:5000
```

### 2. Frontend Setup

```bash
cd logflow/frontend
npm install
npm run dev
# Dashboard running at http://localhost:5173
```

### 3. SDK Setup

In your application:

```bash
npm install logflow-sdk
```

```js
const logger = require('logflow-sdk');

logger.init({ apiKey: 'your-api-key', appName: 'my-app' });
logger.log('Server started', 'INFO');
```

## Screenshots

All screenshots in the `screenshots/` folder are shown below.

<div style="display:flex; flex-wrap: wrap; gap: 10px;">
<img src="./screenshots/Screenshot%202026-05-24%20213125.png" alt="Screenshot 2026-05-24 213125" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213141.png" alt="Screenshot 2026-05-24 213141" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213250.png" alt="Screenshot 2026-05-24 213250" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213343.png" alt="Screenshot 2026-05-24 213343" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213409.png" alt="Screenshot 2026-05-24 213409" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213442.png" alt="Screenshot 2026-05-24 213442" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213456.png" alt="Screenshot 2026-05-24 213456" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213525.png" alt="Screenshot 2026-05-24 213525" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213602.png" alt="Screenshot 2026-05-24 213602" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213717.png" alt="Screenshot 2026-05-24 213717" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213728.png" alt="Screenshot 2026-05-24 213728" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213741.png" alt="Screenshot 2026-05-24 213741" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20213758.png" alt="Screenshot 2026-05-24 213758" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20214028.png" alt="Screenshot 2026-05-24 214028" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20214356.png" alt="Screenshot 2026-05-24 214356" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20214526.png" alt="Screenshot 2026-05-24 214526" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20214732.png" alt="Screenshot 2026-05-24 214732" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20215102.png" alt="Screenshot 2026-05-24 215102" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20215129.png" alt="Screenshot 2026-05-24 215129" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20220353.png" alt="Screenshot 2026-05-24 220353" width="300" />
<img src="./screenshots/Screenshot%202026-05-24%20220444.png" alt="Screenshot 2026-05-24 220444" width="300" />
</div>

> Add a demo GIF as `screenshots/demo.gif` and include it here if you want an animated preview.

## Documentation

| Document | Description |
|---|---|
| [Backend](./docs/BACKEND.md) | API endpoints, architecture, middleware |
| [Frontend](./docs/FRONTEND.md) | Dashboard features, component structure |
| [Database Schema](./docs/SCHEMA.md) | Models, fields, relations, indexes |
| [Authentication](./docs/AUTH.md) | Auth flow, JWT, API key system |
| [SDK](./docs/SDK.md) | SDK usage, methods, integration guide |

## Environment Variables

Create `backend/.env` with the following:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration (e.g. `1d`, `7d`, `30d`) |
| `NODE_ENV` | No | `development` | Set to `production` in deployed environments |
| `FRONTEND_URL` | Yes | — | Frontend origin allowed by CORS (e.g. `http://localhost:5173`) |

## Git Conventions

### Commit Prefixes

| Prefix | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Dependency updates, tooling, config |
| `docs` | Documentation only |
| `refactor` | Code restructuring without behaviour change |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace, no logic change |

### Branch Prefixes

| Prefix | When to use |
|---|---|
| `feature/` | New functionality |
| `bugfix/` | Non-critical bug fix |
| `hotfix/` | Urgent production fix |
| `docs/` | Documentation updates |
| `chore/` | Maintenance tasks |
