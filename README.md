# Borderland Trail

Immersive event landing page and lightweight Node API for the IEEE multi-round challenge.

## Run locally

1. Install Node.js 20+.
2. In this directory run `npm install`.
3. Copy `.env.example` to `.env` and add `MONGODB_URI` if MongoDB is available.
4. Run `npm run dev`, then visit `http://localhost:4173`.

Without MongoDB, the app uses a persistent dummy JSON database: `data/rounds.json` and `data/teams.json`. Test registration locally and new teams will be retained in `teams.json`. With `MONGODB_URI` set, the server seeds `borderland_trail.rounds` on first run and persists submitted teams in `borderland_trail.teams`.

## API

- `GET /api/health` — service/storage status
- `GET /api/rounds` — all suit data
- `GET /api/rounds/:slug` — a specific suit
- `POST /api/teams` — `{ "name": "The Wildcards" }`

## Creative direction

The interface takes its cues from typographic playing-card concepts and card-event work seen on Dribbble, paired with the high-contrast, editorial prompt language shown on Leonardo. It uses original CSS-based playing-card motifs and no downloaded third-party artwork.

