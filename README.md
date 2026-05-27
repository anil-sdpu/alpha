# Alpha Coaching Classes — Tuition Management System

This workspace contains a Node.js backend and a React frontend scaffold for the Alpha Coaching Classes tuition management system.

## Structure

- `backend/` — Express API server with MySQL connection, JWT auth, and sample routes.
- `frontend/` — Vite + React + Tailwind UI scaffold.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and configure your MySQL settings.
2. From the workspace root, install dependencies:

```bash
npm install
```

3. Start the backend and frontend in development mode:

```bash
npm run dev
```

## Development

- Backend: `npm run dev --workspace=backend`
- Frontend: `npm run dev --workspace=frontend`

## Notes

- The frontend proxies `/api` requests to `http://localhost:4000`.
- The backend exposes sample endpoints for login, students, classes, and subjects.
- Add database tables and schema to match the requirements before using the full application.
