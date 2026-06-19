# Quizly — Online Quiz Platform

A full-stack quiz application built with React, Express, and SQLite.

## Features

- User authentication (register/login)
- Browse and search public quizzes
- Take quizzes with timed sessions
- View results and scores
- Admin dashboard for managing quizzes and users
- Create and edit quizzes

## Tech Stack

**Frontend:** React 18, React Router, Vite, Lucide React Icons
**Backend:** Express 5, better-sqlite3, JWT, bcryptjs

## Getting Started

```bash
# Install dependencies
npm install

# Start the API server (port 4000)
node server/index.js

# In another terminal, start the frontend dev server (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

## Production Build

```bash
npm run build
npm start
```

The Express server serves the built frontend from `dist/` and handles API requests.

## Deploy on Render

1. Push this repo to GitHub
2. Create a **New Web Service** on [Render](https://dashboard.render.com)
3. Connect your repo — `render.yaml` is included with the correct settings
4. Render builds with `npm install && npm run build` and starts with `npm start`

> Note: SQLite data is ephemeral on Render's free tier. For production, migrate to PostgreSQL.
