# PaisaBuddy MERN App

PaisaBuddy is now structured as a simple MERN application:

- `src/` contains the React + Vite frontend
- `backend/` contains the Node.js + Express + MongoDB backend
- live stock data is fetched by the backend at runtime
- user-added investments are stored in MongoDB and shown in the Investments tab

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Data: MongoDB for user data and investments, live stock requests from Yahoo Finance

## Project structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- app.js
|   |   `-- server.js
|-- src/
|   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- types.ts
|   `-- styles/
|-- .env.example
|-- vercel.json
|-- package.json
`-- vite.config.ts
```

## Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
npm install --prefix backend
```

3. Copy `.env.example` to `.env` and update values if needed.

4. Make sure MongoDB is running locally or update `MONGO_URI`.

## Run the app

Start frontend and backend together:

```bash
npm run dev
```

Frontend:

- [http://localhost:5173](http://localhost:5173)

Backend health check:

- [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Vercel deployment

The root app is configured for Vercel as a Vite frontend using [vercel.json](/E:/Paisabuddy%20Financial%20Website/vercel.json).

- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites are enabled so client-side routing works after refresh

Important:

- `requirements.txt` was intentionally removed because it caused Vercel to mis-detect the repo as a Python project.
- The existing Express + MongoDB backend is not automatically deployed by this Vercel frontend setup.
- If you want the full MERN app online, deploy `backend/` separately on a Node host such as Render, Railway, or a Vercel serverless/API rewrite migration.

## Features

- lightweight login that creates or updates a user in MongoDB
- dashboard summary generated from saved investments
- `+ Investments` button to add custom investments
- active investments section for user-added holdings
- improved stock market graph with current-day data fetched by the backend
- cleaner, simpler UI with responsive layouts

## API endpoints

- `POST /api/auth/login`
- `GET /api/dashboard/:userId`
- `GET /api/investments?userId=<id>`
- `POST /api/investments`
- `GET /api/stocks/overview`

## Notes

- Live stock responses depend on network availability from the backend.
- If live market data is unavailable, the backend falls back to sample market data so the UI still works.
- `requirements.txt` is included for environment prerequisites, even though the app itself is Node.js based.
