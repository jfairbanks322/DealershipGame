# Classroom Stock Arena

A lightweight classroom stock market simulation game with:

- student accounts and saved portfolios
- a once-per-class market open/close flow
- 10 fake companies seeded from your class roster
- a running leaderboard
- teacher-created events that change stock prices
- a teacher admin system for roster management, company editing, settings, and resets
- SQLite storage for safer multi-user updates than the original JSON prototype
- teacher-side student password resets so returning students can recover access without losing progress

## Run it

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Default teacher login

- Username: `teacher`
- Password: `market-open`

## Notes

- The live app now stores game data in [data/stock-arena.db](/Users/josh/Documents/New project/data/stock-arena.db).
- [data/store.json](/Users/josh/Documents/New project/data/store.json) is kept as a legacy backup from the original prototype and is only used to seed the database if the SQLite file does not exist yet.
- Teacher events immediately update stock prices and the leaderboard.
- Student login sessions still reset when the server restarts, but saved accounts, portfolios, market state, and events remain in SQLite.
- The teacher dashboard can update starting cash, edit company profiles and prices, reset student passwords, reset student portfolios, delete student accounts, reset the market board, or fully reset the game.
