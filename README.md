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

You can pause and resume. Accounts, sessions, completed reports, checked menu prices, ready status, and penalties are stored in SQLite. Log in and select a saved game to reopen it. Unfinished calculations do not save. Incorrect math shows the correct calculation and saves the corrected price for the chosen markup, so the student can submit. Each round allows exactly one new item; existing menu prices can still be adjusted. Legacy unfinished drafts do not block submission.

## Included

- 50 curated restaurant names, 32 signs and 16 colors, shared between the browser and server. Names can be reused; owner names distinguish restaurants.
- 34 menu items: 5 in round 1, 5 more in round 2, then 3 more each round. Older unlocked products remain available.
- One new menu item per round, plus price adjustments to existing products.
- Required server-validated markup dollars and selling price; money rounds to the nearest cent.
- Free corrections in rounds 1–5; at most one penalty in each of rounds 6–10, rising by the configured base each round ($5, $10, $15, $20, $25 with the default).
- Ten promotions from round 3, plus no promotion. Offers show revenue/cost previews and include food costs for all free items and companion products.
- Deterministic sales simulation based on product popularity, price relative to customer expectations, price sensitivity, menu breadth, promotion, and shared round conditions.
- Item-by-item sales and profit reports, a receipt-style round summary, top-earner spotlight, and season history.
- Original vector illustrations for the 34-item catalog, a ten-round progress strip, and earned/locked badge filters.
- Public room leaderboard with restaurant and owner names, projector mode, and a shareable room link.
- Universal career-profit and best-game rankings based only on completed games.
- 50 server-awarded account badges; feature up to three, with the first displayed on the classroom board.
- Teacher pause/resume, readiness dashboard, round attendance controls, and CSV export of round results.
- During planning, teachers can skip an unsubmitted owner for the current round and restore them before simulation. Skipped rounds have no sales or math penalty; previously purchased bonus effects and hint fees still count; saved menu remains. Participation resets next round, with one new menu item required that round rather than catch-up items. At least one owner must submit; all other owners must submit or be skipped. CSV exports mark skipped rounds.
- Light/dark toggle remembers the browser preference and starts from the device theme. Switching themes preserves in-progress form entries.
- Twelve original vector mascot avatars, selectable at registration or from My avatar, saved to accounts and displayed on leaderboards. Existing accounts receive the Chef Sprout avatar through an additive database migration.
- Responsive desktop/mobile interface and keyboard-accessible forms. Press F outside form fields for fullscreen; Esc exits.

## Simulation and accounting

All money is stored as integer cents. Markup is a percentage of cost, not profit margin. Students choose 0–500% markup, calculate markup dollars rounded to cents, and add those dollars to cost. Wrong checks show the corrected markup dollars and selling price and save that price. Students may purchase a $5 worked-example hint once per round.

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

The test suite covers catalog progression, 70 distinct badge definitions, pricing and rounding, promotion accounting, teacher authorization, persistence across restart, repeated incorrect checks, a full two-player ten-round game, duplicate-run protection, account login/logout, private player data, and completed-game career records.

For browser QA, install/provide Playwright separately, start a disposable preview server, then run:

```sh
TEST_URL=http://localhost:3040 node tests/browser-flow.js
```

`PLAYWRIGHT_MODULE` can point to an existing Playwright package. This test creates disposable test accounts and a game, so use a separate database with `DB_PATH`. Browser screenshots go to ignored `output/business-math-flow/`.

## Curriculum expansion

The current game is published as `cost-markup-v1`. Every game stores its lesson version and a snapshot of its rules/catalog/promotions. Pricing checks, submission requirements, and promotion accounting now have lesson-level entry points. Career scores are tagged and compared by lesson version. No new discount exercises are enabled yet. See [lesson-development.md](docs/lesson-development.md) for the module contract and the remaining steps to add next week’s lesson without changing existing games.

Classroom load regression (`npm test`) exercises 40 concurrent owner accounts through ten rounds, with concurrent pricing/submission/polling requests, skip/restore authorization, stale teacher controls, and return after a missed round. This is an API load simulation on one local machine, not a guarantee of Railway or school-network performance. Browser attendance coverage is in `tests/attendance-flow.js`.

## Supply & Demand lesson

Choose **Supply & Demand** in the teacher's Lesson dropdown when creating a new classroom. Cost & Markup remains the default and existing rooms retain their original lesson. Accounts and cosmetic badges are shared; career leaderboards have a lesson selector and separate scores.

Supply & Demand runs ten rounds. Add one new item each round, choose its selling price and units to prepare, and optionally adjust existing menu decisions. No calculation answers, math penalties, or promotions are used. Prices and stock carry forward until changed; inventory is prepared fresh each round. Students pay for all prepared units, and leftovers expire. Sales are limited by stock. Round reports show wanted, prepared, sold, leftover units, missed sales and profit with a discussion prompt.

Ten announced market events vary customer traffic, input costs and price sensitivity. Competing restaurants selling the same item influence demand modestly through their relative prices; this is a simplified teaching simulation, not a fixed-size shared customer market. Supply mode awards basic participation/sales/profit/completion badges, not math-check badges. Teachers retain pause, skip/restore, public leaderboard and export controls.

`tests/supply-demand.test.js` verifies economics, ten-round play and score separation; `tests/supply-flow.js` covers teacher selection and browser gameplay.

### Reset or delete a classroom

The room owner's teacher dashboard includes **Manage this game** for both lessons. Type the room code to confirm either action. Reset keeps the code, lesson settings, and restaurant roster, clearing menus and round progress and returning to the round-one lobby. Delete removes the classroom entirely. Both remove that classroom's completed-game career scores; other games, accounts, and earned badges remain. Download results before clearing a game if you need a copy. Stale confirmations are rejected when the room has changed.

### Student quick start

When round one opens, each student sees a four-step guide for their selected lesson. They can skip it or reopen **How to play** during planning. Completion is saved with their classroom progress across logins and devices. Resetting the classroom makes the guide available automatically again.

### Sabotage wheel (both lessons)

From round 2, before submitting, a student may spend earned profit for an optional sabotage spin: $10 / 35%, $20 / 60%, or $30 / 85% success. A success unlocks another paid attempt, up to three in one round. Each follow-up reduces the selected tier’s odds by 15 percentage points (minimum 5%); any failure ends that player’s attempts for the round. The server draws the result; the wheel animates that saved outcome. Success charges the target a $40 equipment-repair expense. Each restaurant may be targeted only once per round, whether the attempt succeeds or misses. Skipped players cannot spin or be selected. Costs are charged immediately, included once in round fees and career totals, and remain charged if the teacher subsequently skips a player. Reset clears the wheel history along with other game progress.

Targets receive a saved popup with the outcome when viewing their game, including after reconnecting. Successful attempts conceal the attacker; a failure reveals their identity to all targets from that round. Acknowledging it dismisses it across sessions. Wheel costs are in-game money only.

### Paulie's mystery boxes

In either lesson, students can buy one optional $5 box per round starting in round 2, before submitting. All 30 humorous outcomes are equally likely: 13 rewards, 12 mishaps, and 5 duds. Rewards pay $10–$20 before the purchase price; mishaps add $2–$10 in expenses; duds have no additional effect. Net changes are limited to −$15 through +$15 per box. Students must have $5 in earned profit. The server saves each result, so reloads cannot reroll it. Delivery history, totals, round fees/credits, and career scores include the effect exactly once. A classroom reset clears delivery history.

From round 6, Vinnie's **$300 super secret box** replaces Paulie's offer, with 30 new stories and the same 13/12/5 distribution. The purchase requires $300 available profit. As selected for classroom balance, rewards and mishaps scale Paulie's **net** results by 10: rewards pay $350–$450 (net +$50–$150), mishaps return $150–$230 as partial refunds (net −$150–$70), and duds return nothing (net −$300). Existing saved results retain their original price and outcome. The one-box-per-round limit is shared across the vendor transition.

### Bonus achievements

The collection now has 70 cosmetic badges, including 10 mystery-box and 10 sabotage achievements. Box badges recognize first deliveries, reward/mishap/dud outcomes, buying from both cousins, three deliveries in a game, and a profitable Vinnie box. Sabotage badges recognize first spins, wins and misses, low-cost wins, premium misses, trying all prices, three spins or successes in one game, and being targeted successfully or unsuccessfully. Existing saved events are evaluated at startup; older games retain only their latest outgoing sabotage, so missing historical spins are not inferred. Badges persist on the account after a game reset and never modify profit.


### Classroom controls and round flow

From round 2, students first see an optional sabotage/mystery-box choice screen, with a button to continue straight to menu planning. The choice is saved per round. Hints in the math lesson cost $5 once per round and are available even without existing profit (the fee can make profit negative). Hints show a worked example and steps; Supply & Demand has no math hints or penalties.

After simulation, a saved leaderboard recap shows every owner's rank and movement since the previous round's settled totals. Teachers get live activity and per-student check counts, correction status, penalties, hints, boxes, spins, menu size, and submission status. Teacher-only controls can reopen individual submissions, waive the current round's math penalty, and toggle sabotage, boxes, or hints. Controls are version checked, and existing purchases remain charged when a bonus is disabled. The event log retains the latest 500 events and displays the latest 100; historical actions before this update are not reconstructed. Only teachers can see the activity log and hidden sabotage identities.
