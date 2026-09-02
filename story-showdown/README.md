# Story Showdown

Story Showdown is a teacher-led, real-time creative-writing competition for high-school classrooms. A teacher hosts from a projected dashboard; students join from any modern browser with a five-character code and a temporary display name.

The core loop is fully functional for classrooms of up to 30 students with 144 prompts across 16 categories—including rhyming poetry, free verse, suspense, comedy, fantasy, finish-the-story, and connect-the-start-and-end challenges. It includes student-selected preset avatars, fixed random teams, server-authoritative writing timers, draft recovery, automatic submission, private moderation, randomized anonymous presentation, one-vote ballots, own-response blocking, tie resolution, team scoring, podium reveals, running writer rankings by total and per-round average podium points, score corrections, final standings, CSV export, and a printable Save-as-PDF report.

## Technology and architecture

- Node.js and Express serve the application and export endpoints.
- Socket.IO synchronizes teacher actions and role-filtered student state in real time.
- The server owns timers, teams, eligibility, votes, placements, and scores. Browser clocks are display-only.
- Active games persist to one JSON file using an atomic temporary-file rename.
- Teacher actions require a 192-bit token created with the game. The token stays in that teacher browser's local storage and is verified for every privileged socket action and export.
- Student reconnection uses a separate random session token. It restores the same display name, team, and current draft from the same browser when possible.
- Students choose from 70 illustrated, school-safe character avatars. Avatars reconnect with the same session and are never attached to anonymous presentation or voting entries.
- Individual leaderboards rank podium points by cumulative total and average per completed round entered. They appear between rounds and at the finale, and are hidden when the teacher disables writer-name reveals.

This build intentionally collects no email address, account, camera, microphone, or other unnecessary student information.

## Run locally

Requirements: Node.js 18 or newer.

```bash
cd story-showdown
npm install
npm start
```

Open `http://localhost:3040`. Teacher and student routes are also available directly at `/teacher.html` and `/student.html`.

Optional environment variables are listed in `.env.example`:

- `PORT`: HTTP port. Defaults to `3040`; Railway supplies this automatically.
- `HOST`: bind address. Defaults to `0.0.0.0`.
- `STORY_SHOWDOWN_DATA_FILE`: explicit persistence file path.
- `MAX_GAMES`: maximum retained games. Defaults to `100`.

No external API, database, OAuth provider, or third-party account is required.

## Deploy on Railway

This repository contains several apps, so configure Story Showdown as an isolated service:

1. Connect the GitHub repository to a new Railway service.
2. In **Service → Settings → Source**, set **Root Directory** to `/story-showdown`.
3. Railway will detect `package.json`; use `npm start` as the start command if it is not selected automatically.
4. In **Networking**, generate a public Railway domain. The app already binds to Railway's injected `PORT`.
5. Set the health-check path to `/health` (`/api/health` remains available as an alias).
6. Attach a Railway Volume to this service with mount path `/app/data`. Railway supplies `RAILWAY_VOLUME_MOUNT_PATH`, and the app automatically stores `games.json` there.
7. Keep the service at **one replica**. This version keeps the live Socket.IO room and authoritative game state in one Node process; multiple replicas would require Redis/pub-sub plus shared database persistence.

A volume is strongly recommended. Without it, running games survive normal process operation but the JSON file is on Railway's ephemeral deployment filesystem and can be lost on redeploy. If the service is configured to sleep, allow it to wake before class and keep the teacher dashboard open during play.

Current Railway documentation describes [root directories for isolated monorepo services](https://docs.railway.com/deployments/monorepo), [persistent volume mount paths](https://docs.railway.com/volumes), and [deployment health checks](https://docs.railway.com/deployments/healthchecks).

## Test

```bash
npm test
npm run smoke
```

`npm test` validates all 144 prompts and the 16-category structure. `npm run smoke` runs both the detailed six-student, two-round rehearsal and a complete 30-student capacity round. The capacity rehearsal also confirms a full room still permits valid reconnects and rejects a 31st student.

## Classroom operation notes

- Use HTTPS in production; Railway's generated domain provides it.
- Treat the teacher browser as the control key. Do not share its browser profile or final export URL.
- The built-in language flagger is only a teacher review aid. It never automatically punishes or publicly labels a student.
- Persistence is optimized for one classroom service, not horizontal scaling or district-wide archival. For multiple replicas or long-term records, migrate game state to PostgreSQL and use the Socket.IO Redis adapter.
- CSV contains prompts, writers, teams, responses, placements, vote counts, points, and team totals. The printable report can be saved as PDF from the browser print dialog.
