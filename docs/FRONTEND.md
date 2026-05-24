# Frontend Documentation

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| React | 18 | UI component framework |
| Vite | 5 | Build tool and dev server |
| React Router | v6 | Client-side routing |
| Axios | 1 | HTTP client with interceptors |
| Tailwind CSS | 3 | Utility-first styling |
| recharts | 2 | Chart components (pie, line) |
| react-hot-toast | 2 | Non-intrusive toast notifications |

## Project Structure

```
frontend/src/
├── components/
│   ├── FilterBar.jsx     ← Search input, level dropdown, sort toggle for log views
│   ├── LogCharts.jsx     ← Pie chart (level ratio) + line chart (logs per day)
│   ├── LogTable.jsx      ← Paginated log table with level badges and message truncation
│   ├── Navbar.jsx        ← Top navigation bar with developer name and logout button
│   ├── Pagination.jsx    ← "X–Y of Z results" with Prev/Next controls
│   └── PrivateRoute.jsx  ← Route guard that redirects unauthenticated users to /login
├── context/
│   └── AuthContext.jsx   ← Global auth state provider (developer object + setDeveloper)
├── hooks/
│   └── useAuth.js        ← Convenience hook: returns { developer, setDeveloper } from context
├── pages/
│   ├── AppDetail.jsx     ← Per-application view: logs table tab + charts tab
│   ├── Dashboard.jsx     ← Application grid, API key display, create/delete applications
│   ├── Login.jsx         ← Login form
│   ├── NotFound.jsx      ← 404 fallback page
│   └── Register.jsx      ← Registration form
├── services/
│   ├── api.js            ← Axios instance: baseURL, withCredentials, error interceptor
│   ├── app.service.js    ← API calls for application CRUD
│   └── auth.service.js   ← API calls for register, login, logout, /me
├── App.jsx               ← Route definitions (public + private)
├── index.css             ← Tailwind directives + global styles
└── main.jsx              ← React root: wraps app in AuthProvider, renders to DOM
```

## Pages

### Login / Register

Minimal, centered forms. On success, the auth service stores the developer object in `AuthContext` and React Router navigates to `/dashboard`. On failure, `react-hot-toast` shows the error message. Both pages redirect already-authenticated users away from `/login` and `/register` to `/dashboard`.

### Dashboard

The main landing page after login. Contains two sections:

**API Key card** — displays the developer's `apiKey` with a one-click copy button. The key is fetched from `AuthContext` (already available from the `/me` call on page load). A success toast confirms the copy.

**Application grid** — lists all applications owned by the developer. Each card shows the application name and a delete button. A "New Application" form at the top accepts a name and creates the application via `POST /api/applications`. Deleting an application removes it and all associated logs.

### AppDetail

Accessed at `/applications/:name`. Contains two tabs:

**Logs Table tab** — the primary view.

- **FilterBar** — three controls rendered above the table:
  - Search input: filters log messages by substring match (debounced)
  - Level filter dropdown: `All`, `INFO`, `WARN`, `ERROR`
  - Sort control: `Newest first` / `Oldest first`
- **LogTable** — columns: `Level` (badge), `Message` (truncated to ~80 chars with title tooltip for full text), `Count`, `First Seen` (`createdAt`), `Last Seen` (`updatedAt`). Level badges are color-coded: INFO → blue, WARN → yellow, ERROR → red.
- **Pagination** — shows `X–Y of Z results` and Prev/Next buttons. Buttons are disabled at the first and last pages respectively.

**Charts tab** — two charts rendered side by side:

- **Pie chart** — log count broken down by level (INFO / WARN / ERROR). Powered by `recharts PieChart`. Empty state shown if no logs.
- **Line chart** — total logs per day over the past 7 days. Powered by `recharts LineChart`. X-axis shows short date labels; Y-axis shows count.

## State Management

**`AuthContext`** — holds the authenticated `developer` object (id, username, email, apiKey). Persisted to `localStorage` so the session survives a page refresh. `setDeveloper(null)` on logout clears both context and storage.

**Local state per page** — each page manages its own data with `useState` and `useEffect`. There is no global data store; data is re-fetched on mount and on filter/pagination changes. `react-hot-toast` handles transient UI feedback without additional state.

## API Integration

**Axios instance** (`services/api.js`):
- `baseURL` set to `/api` (proxied to backend in development)
- `withCredentials: true` — ensures the `jwt` cookie is included in every request
- **Response interceptor** — extracts `error.response.data.message` from all failed responses and rejects with a plain `Error` object, so every `catch` block receives a simple `err.message` string

**Vite proxy** (`vite.config.js`):
- `/api` requests are proxied to `http://localhost:5000` during development
- Eliminates CORS issues in development without modifying backend CORS config
- In production, a reverse proxy (e.g. nginx) handles the same routing

## Auth Flow (Frontend)

**`PrivateRoute`** — wraps all protected routes in `App.jsx`. Reads `developer` from `AuthContext`. If `null`, redirects to `/login`. If present, renders the child route.

**On app load** — `AuthContext` attempts to restore the developer from `localStorage`. If found, it calls `GET /api/users/me` to verify the session is still valid. If the cookie has expired or been cleared, the `/me` call fails, `setDeveloper(null)` is called, and the user is redirected to `/login` on their next navigation to a protected route.

**Public routes** — `/login` and `/register` are accessible without authentication. Authenticated users visiting these routes are redirected to `/dashboard`.
