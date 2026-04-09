# Dealership Manager

A lightweight classroom Business Management simulation where students act as the manager of a car dealership.

## What It Does

- student accounts with saved dealership progress
- a teacher login for session control
- five staff personalities with morale and trust meters
- teacher-launched global dealership events
- branching case chains where students choose which employee to consult first
- a running leaderboard based on dealership revenue
- SQLite storage for student accounts, case history, and final event outcomes

## Core Loop

1. The teacher opens the class session.
2. The teacher launches one global dealership event for the whole class.
3. Students choose which employee to consult, then work through a personalized chain of follow-up actions.
4. Each choice updates:
   - revenue
   - customer satisfaction
   - dealership reputation
   - staff morale
   - staff trust
5. When the case resolves, the leaderboard reorders in real time based on the total event outcome.

## Run It

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Default Teacher Login

- Username: `teacher`
- Password: `showroom`

## Data

- The sim stores data in [data/dealership-manager.db](/Users/josh/Documents/New project/data/dealership-manager.db).
- The original stock-market database is left untouched in [data/stock-arena.db](/Users/josh/Documents/New project/data/stock-arena.db).
- You can override the storage location with the `DATA_DIR` environment variable.
- On Railway, the app will automatically use `/app/data` if that volume mount exists.

## Deploy To Railway

This project is now set up to deploy cleanly on Railway.

### What is already configured

- [railway.json](/Users/josh/Documents/New project/railway.json) sets:
  - `node server.js` as the start command
  - `/health` as the healthcheck path
  - `/app/data` as the required mounted volume path
- [server.js](/Users/josh/Documents/New project/server.js) now:
  - respects `DATA_DIR` or `RAILWAY_VOLUME_MOUNT_PATH`
  - exposes `GET /health`
  - shuts down cleanly on `SIGTERM`

### Railway setup steps

1. Push this project to GitHub.
2. In Railway, create a new project from that GitHub repo.
3. Add a Volume to the web service and mount it at `/app/data`.
4. Deploy the service.
5. Open the generated Railway domain.

### Important notes

- This app uses SQLite, so the mounted volume is required if you want student data to persist between deploys.
- The default teacher login is still `teacher / showroom`, so change that after first deploy from the teacher settings screen.
- Railway will provide the `PORT` automatically. The app already respects that.

## Current MVP Notes

- Teachers currently launch event chains from a preset library.
- The intended custom-content workflow is manual authoring, not in-app AI generation.
- Each completed event stores the full case result, not just the last action in the chain.
- Low morale and low trust can create automatic penalties on future outcomes.
- The leaderboard is primarily ranked by `revenue`, with team health used as a tie-breaker.
