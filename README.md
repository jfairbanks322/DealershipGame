# Counter Culture — Business Math

A browser-based, teacher-led multiplayer fast-food simulation. Each student owns a personalized restaurant, sets prices through checked markup calculations, and competes over ten rounds.

## Play locally

Requires **Node.js 22.13+**; Node 24 is recommended. No third-party runtime dependencies.

```sh
npm start
```

Open [localhost:3040](http://localhost:3040). Register an account. Use **Teacher login** on the first page to sign in or create a teacher account with your account credentials and the local development teacher key **`classroom-local`**. Set your own `TEACHER_KEY` environment variable to replace the local default. Verified teacher access lasts for that login session. The teacher account manages the room; students use separate accounts/devices and the six-character room code.

1. Teacher creates a competition and chooses the math penalty (default $5).
2. Students join and choose one of 50 restaurant names, 32 signs, and 16 colors. Custom names are rejected for new restaurants; existing saved names remain intact.
3. Teacher starts round 1.
4. Students add one item, calculate and save its price, optionally adjust existing prices, and submit.
5. Teacher simulates once everyone is ready, discusses the results, then opens the next round.
6. Round 10 completes the game and records career results automatically.

You can pause and resume. Accounts, sessions, completed reports, checked menu prices, ready status, and penalties are stored in SQLite. Log in and select a saved game to reopen it. Unfinished calculations do not save. Only a correct math check saves a menu price. Each round allows exactly one new item; existing menu prices can still be adjusted. Legacy unfinished drafts do not block submission.

## Included

- 50 curated restaurant names, 32 signs and 16 colors, shared between the browser and server. Names can be reused; owner names distinguish restaurants.
- 34 menu items: 5 in round 1, 5 more in round 2, then 3 more each round. Older unlocked products remain available.
- One new menu item per round, plus price adjustments to existing products.
- Required server-validated markup dollars and selling price; money rounds to the nearest cent.
- Free corrections in rounds 1–5; at most one configurable penalty in each of rounds 6–10.
- Ten promotions from round 3, plus no promotion. Offers show revenue/cost previews and include food costs for all free items and companion products.
- Deterministic sales simulation based on product popularity, price relative to customer expectations, price sensitivity, menu breadth, promotion, and shared round conditions.
- Item-by-item sales and profit reports, a receipt-style round summary, top-earner spotlight, and season history.
- Original vector illustrations for the 34-item catalog, a ten-round progress strip, and earned/locked badge filters.
- Public room leaderboard with restaurant and owner names, projector mode, and a shareable room link.
- Universal career-profit and best-game rankings based only on completed games.
- 50 server-awarded account badges; feature up to three, with the first displayed on the classroom board.
- Teacher pause/resume, readiness dashboard, round attendance controls, and CSV export of round results.
- During planning, teachers can skip an unsubmitted owner for the current round and restore them before simulation. Skipped rounds have no sales, expenses, or math penalty; saved menu remains. Participation resets next round, with one new menu item required that round rather than catch-up items. At least one owner must submit; all other owners must submit or be skipped. CSV exports mark skipped rounds.
- Light/dark toggle remembers the browser preference and starts from the device theme. Switching themes preserves in-progress form entries.
- Twelve original vector mascot avatars, selectable at registration or from My avatar, saved to accounts and displayed on leaderboards. Existing accounts receive the Chef Sprout avatar through an additive database migration.
- Responsive desktop/mobile interface and keyboard-accessible forms. Press F outside form fields for fullscreen; Esc exits.

## Simulation and accounting

All money is stored as integer cents. Markup is a percentage of cost, not profit margin. Students choose 0–500% markup, calculate markup dollars rounded to cents, and add those dollars to cost. Wrong checks receive a formula hint without supplying the answer.

Each product has its own expected price, popularity, and price sensitivity. Higher prices generally reduce demand; more menu items share customer attention. The simulation uses the same round conditions for everyone and has no random rerolls. Restaurants do not directly steal customers from one another in this first version.

Profit = revenue − food costs − advertising fees − math penalties. There are no inventory purchases, staffing costs, rent, or loans yet. Only sold/served units incur food cost. Bundle revenue and companion costs are attributed to the featured item; companion products can also sell separately. Happy hour discounts half the orders (rounded down), keeping the other orders at full price. Tied profit receives equal leaderboard rank; tied winners each receive a win, while Photo Finish requires a sole winner.

Badges are cosmetic and have no financial advantage. Thresholds and the demand model are initial tuning values for classroom playtesting. Completion badges may be earned in a solo room; competitive badges require at least two restaurants.

## Railway deployment

The root app replaces Three Words on the existing Railway service. `railway.json` starts `node server.js` and checks `/health`.

Before deploying:

1. Keep the service Root Directory at the repository root.
2. Attach a **persistent volume**, mounted at `/data` (or another chosen path).
3. Set `TEACHER_KEY` to a private value of at least 12 characters. Students do not need this key.
4. Use Node 24 and **one replica**. Railway sets `PORT` and `RAILWAY_VOLUME_MOUNT_PATH` automatically.
5. Deploy the repository changes to the existing service.

Production refuses to start without the persistent volume or teacher key. The database is always created at `RAILWAY_VOLUME_MOUNT_PATH/business-math.db`; local `DB_PATH` overrides cannot redirect production saves outside the volume. Configure Railway volume backups before classroom use. See the [Railway volume documentation](https://docs.railway.com/volumes).

Authentication uses salted scrypt hashes and random, hashed sessions in HttpOnly/SameSite cookies (Secure in production). Hosting requires the teacher key; room control and exports require ownership. Password recovery and account administration are not implemented in this first version.

These source changes do not themselves publish to Railway. Three Words remains separately runnable in `three-words/` and is not served by this application.

## Verification

```sh
npm run check
npm test
```

The test suite covers catalog progression, 50 distinct badge definitions, pricing and rounding, promotion accounting, teacher authorization, persistence across restart, repeated incorrect checks, a full two-player ten-round game, duplicate-run protection, account login/logout, private player data, and completed-game career records.

For browser QA, install/provide Playwright separately, start a disposable preview server, then run:

```sh
TEST_URL=http://localhost:3040 node tests/browser-flow.js
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright package. This test creates disposable test accounts and a game, so use a separate database with `DB_PATH`. Browser screenshots go to ignored `output/business-math-flow/`.

## Curriculum expansion

The current game is published as `cost-markup-v1`. Every game stores its lesson version and a snapshot of its rules/catalog/promotions. Pricing checks, submission requirements, and promotion accounting now have lesson-level entry points. Career scores are tagged and compared by lesson version. No new discount exercises are enabled yet. See [lesson-development.md](docs/lesson-development.md) for the module contract and the remaining steps to add next week’s lesson without changing existing games.

Classroom load regression (`npm test`) exercises 40 concurrent owner accounts through ten rounds, with concurrent pricing/submission/polling requests, skip/restore authorization, stale teacher controls, and return after a missed round. This is an API load simulation on one local machine, not a guarantee of Railway or school-network performance. Browser attendance coverage is in `tests/attendance-flow.js`.
