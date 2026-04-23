# Feast Haven Manager

Feast Haven Manager is a classroom business simulation where students run a restaurant under pressure. The teacher launches one shared event for the class, and each student works through a 5-step decision chain that changes revenue, guest confidence, staff morale, trust, and the long-term condition of the restaurant.

## What The Live App Includes

- teacher-controlled class session open/close flow
- student accounts with saved progress
- 8 restaurant staff members with individual morale and trust
- 10 authored Feast Haven event chains
- persistent restaurant state between events:
  - guest confidence
  - kitchen stability
  - staff burnout
  - supply control
  - brand heat
- lingering effects that carry from one event into the next
- three class leaderboards:
  - overall
  - revenue
  - culture
- timing analytics for the teacher dashboard
- printable end-of-game awards report

## Core Loop

1. The teacher opens the class session.
2. The teacher launches a global Feast Haven event for the whole class.
3. Students choose which staff member to consult and work through a 5-step event chain.
4. Each choice affects the current case and the restaurant's future condition.
5. When the case resolves, the leaderboard updates and the next event starts from the new restaurant state.

## Local Run

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Default Teacher Login

- Username: `teacher`
- Password: `showroom`

Change that after first deploy from the teacher settings panel.

## Data And Persistence

- SQLite data is stored at [data/dealership-manager.db](/Users/josh/Documents/New project/data/dealership-manager.db) by default.
  The filename is still legacy under the hood so existing saves stay intact.
- You can override the storage directory with `DATA_DIR`.
- On Railway, the app automatically uses `/app/data` if a volume is mounted there.

## Deploy To Railway

This project is already configured for Railway.

### Included setup

- [railway.json](/Users/josh/Documents/New project/railway.json)
  - starts the app with `node server.js`
  - uses `/health` as the healthcheck path
  - expects persistent storage at `/app/data`
- [server.js](/Users/josh/Documents/New project/server.js)
  - respects `PORT`
  - respects `DATA_DIR` or `RAILWAY_VOLUME_MOUNT_PATH`
  - exposes `GET /health`
  - shuts down cleanly on `SIGTERM`

### Railway steps

1. Push this repo to GitHub.
2. Create a Railway project from the repo.
3. Add a Volume to the web service.
4. Mount that Volume at `/app/data`.
5. Deploy.
6. Open the generated Railway URL.

### Important deployment note

This app uses SQLite. If you do not mount a persistent Railway Volume, student accounts and class progress will be lost on redeploy.

## Teacher-Facing Notes

- Event chains are currently authored from the preset library in [event-templates.js](/Users/josh/Documents/New project/event-templates.js).
- Each completed case stores the full chain of decisions, not just the final click.
- Low morale or trust can still create future penalties.
- Students can lose the game if an employee's morale or trust collapses far enough.

## Extra Routes

- [public/student-cheat-sheet.html](/Users/josh/Documents/New project/public/student-cheat-sheet.html) is a print-friendly Feast Haven student quick-start guide.
- [public/awards-report.html](/Users/josh/Documents/New project/public/awards-report.html) is the teacher-facing printable awards report.
- [public/prediction-market.html](/Users/josh/Documents/New project/public/prediction-market.html) is a separate side lesson prototype and is not required for the Feast Haven launch.
- [public/wrestlepad.html](/Users/josh/Documents/New project/public/wrestlepad.html) is a standalone professional-wrestling stat-grid prototype inspired by the daily lineup format of StatPad-style games.
  - WrestlePad now loads its numbers from [public/wrestlepad-stats.snapshot.js](/Users/josh/Documents/New project/public/wrestlepad-stats.snapshot.js), which is generated from [data/wrestlepad-stats-source.json](/Users/josh/Documents/New project/data/wrestlepad-stats-source.json).
  - Rebuild that browser snapshot with `npm run build:wrestlepad-stats` after updating the source file.
  - WrestlePad also loads a local portrait manifest from [public/wrestlepad-portraits.snapshot.js](/Users/josh/Documents/New project/public/wrestlepad-portraits.snapshot.js), with images cached under [public/assets/wrestlers](/Users/josh/Documents/New project/public/assets/wrestlers).
  - Refresh those cached profile images with `npm run fetch:wrestlepad-portraits` after updating the `wikimedia` mappings in [data/wrestlepad-stats-source.json](/Users/josh/Documents/New project/data/wrestlepad-stats-source.json).
