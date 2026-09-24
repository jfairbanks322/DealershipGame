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

From round 2, before submitting, a student may spend earned profit for an optional sabotage spin: $10 / 35%, $20 / 60%, or $30 / 85% success. A success unlocks another paid attempt, up to three in one round. Each follow-up reduces the selected tier’s odds by 15 percentage points (minimum 5%); any failure ends that player’s attempts for the round. The server draws the result; the wheel animates that saved outcome. Teachers choose between next-round sales theft and a $40 equipment-repair expense. New rooms default to sales theft; existing rooms retain repair mode until the teacher switches. Each restaurant may be targeted only once per round, whether the attempt succeeds or misses. Skipped players cannot spin or be selected. Costs are charged immediately, included once in round fees and career totals, and remain charged if the teacher subsequently skips a player. Reset clears the wheel history along with other game progress.

Targets receive a saved popup with the outcome when viewing their game, including after reconnecting. Successful attempts conceal the attacker; a failure reveals their identity to all targets from that round. Acknowledging it dismisses it across sessions. Wheel costs are in-game money only.

### Paulie's mystery boxes

In either lesson, students can buy one optional $5 box per round starting in round 2, before submitting. All 30 humorous outcomes are equally likely: 13 rewards, 12 mishaps, and 5 duds. Rewards pay $10–$20 before the purchase price; mishaps add $2–$10 in expenses; duds have no additional effect. Net changes are limited to −$15 through +$15 per box. Students must have $5 in earned profit. The server saves each result, so reloads cannot reroll it. Delivery history, totals, round fees/credits, and career scores include the effect exactly once. A classroom reset clears delivery history.

Boxes upgrade automatically: Paulie’s $5 Truck Box in rounds 2–3; Vinnie’s $300 Super Secret Box in rounds 4–5; $500 Mega Crate in rounds 6–7; $750 Colossal Container in rounds 8–9; $1,000 Monster Box in round 10. Each has 30 equally likely outcomes (13 rewards, 12 mishaps, 5 duds). Reward/mishap net results scale Paulie’s by 1×, 10×, 20×, 30×, and 50× respectively. Duds return nothing and lose the full purchase price. Later reward ranges are +$50–$150, +$100–$300, +$150–$450, and +$250–$750; mishap loss ranges are $70–$150, $140–$300, $210–$450, and $350–$750. Purchase requires enough available profit. Each reveal and saved history shows purchase cost, money received/refund/extra expense, and the overall gain or loss, with plain-language explanations. Existing saved results retain their original accounting. One purchase per round applies in both lessons.

### Bonus achievements

The collection now has 70 cosmetic badges, including 10 mystery-box and 10 sabotage achievements. Box badges recognize first deliveries, reward/mishap/dud outcomes, buying from both cousins, three deliveries in a game, and a profitable Vinnie box. Sabotage badges recognize first spins, wins and misses, low-cost wins, premium misses, trying all prices, three spins or successes in one game, and being targeted successfully or unsuccessfully. Existing saved events are evaluated at startup; older games retain only their latest outgoing sabotage, so missing historical spins are not inferred. Badges persist on the account after a game reset and never modify profit.


### Classroom controls and round flow

Students start each planning round at a checklist and their core decisions. Alliances, sabotage, and mystery boxes are grouped under a collapsed Optional moves section; there is no mandatory bonus screen. Hints in the math lesson cost $5 once per round and are available even without existing profit (the fee can make profit negative). Hints show a worked example and steps; Supply & Demand has no math hints or penalties.

After simulation, a saved leaderboard recap shows every owner's rank and movement since the previous round's settled totals. Teachers get live activity and per-student check counts, correction status, penalties, hints, boxes, spins, menu size, and submission status. Teacher-only controls can reopen individual submissions, waive the current round's math penalty, and toggle sabotage, boxes, or hints. Controls are version checked, and existing purchases remain charged when a bonus is disabled. The event log retains the latest 500 events and displays the latest 100; historical actions before this update are not reconstructed. Only teachers can see the activity log and hidden sabotage identities.

### Supply & Demand market decisions

Every round includes customer-traffic, supplier-cost, and price-sensitivity clues tied to that round's simulation conditions. Students must explicitly save a main clue, a demand forecast, and a price/stock plan before submitting. All choices are qualitative; there are no markup calculations or right/wrong math penalties. Plans do not automatically change menu prices or stock: students implement their choices in the existing price-and-stock form. The round report preserves the plan for comparison with sales, leftovers, missed sales, and profit. Teachers see the plan in their live student table and activity feed. A new plan is required each round; existing already-submitted rounds remain intact.

### Private math answer tracker

Cost & Markup teachers see per-student right/wrong pricing-check totals for the current round and entire game. Each check is one attempt: both markup dollars and selling price must be correct for a right answer. Retries and practice rounds count; waiving a penalty does not erase an attempt. New counters are stored with the game but stripped from student API responses and excluded from public leaderboards. Earlier attempts without an exact recorded verdict are shown as unclassified rather than guessed. A classroom reset clears these game-specific totals. Supply & Demand price/stock saves are not counted as math answers.

### Free guided math

Every Cost & Markup student, including existing players, has free “Walk me through it” help enabled by default. Choose a menu item, choose a markup, then practice percent-to-decimal, markup dollars, and selling price in three steps. Incorrect guided steps never add a penalty; completing all three saves the price and records one assisted correct pricing check. Prior penalties remain unless the teacher waives them. Incomplete walkthroughs persist and can be resumed after login.

Teachers can turn guidance off or on for each student. The private dashboard distinguishes independent and assisted pricing checks by round and game, plus separate guided-step successes and retries. Using a walkthrough for an item or buying the round hint marks subsequent corresponding checks as assisted. Earlier checks have no assistance classification. Reset clears the game-specific practice history and restores the default availability. Supply & Demand has no guided math.

### Alliances and backstabbing

Students can form one alliance of 2–4 owners through invitations and acceptance in the lobby or open planning. A full alliance cannot accept more members; pending invitations do not reserve a slot. Any member may invite. Leaving is allowed before any ally submits; teachers can dissolve a group. With at least two non-skipped members, an enabled alliance saves each participating restaurant 3% of ingredient costs (rounded per menu item), in either lesson. There is no shared money or combined leaderboard.

In sales-theft mode, a successful spin transfers 10% of one target’s next-round gross sales. Targeting an ally instead uses 15% for two members, 20% for three, or 25% for four. The percentage and payout round are frozen at the attempt; subsequent membership changes or teacher switches cannot erase or resize it. The target loses the same amount the attacker receives, once, rounded to cents, after all next-round sales are calculated and before leaderboards/achievements/career results. It is a share of revenue, not profit; losses can make profit negative. A skipped target generates no sales and pays zero; an attacker skipped in the payout round still receives their previously earned claim. Claims do not repeat. Round-10 sales spins are blocked because no round 11 exists; round-9 claims settle in round 10.

Successful attempts are presented as anonymous outside attacks. The target and other allies receive persisted notifications with no attacker identity, backstab flag, percentage, or alliance size in their anonymous event data. A failed backstab, or a failed later attempt in a round containing a backstab, announces the attacker to every player and exposes their previous targets that round. No innocent student is named as the attacker. Alliance informational notices do not consume a target slot or unlock victim achievements.

The teacher’s **Alliances & sabotage rules** panel enables/disables alliances, dissolves groups, switches sabotage modes, and lists pending/completed thefts. Disabling alliances suspends savings and new backstab bonuses but keeps memberships. Disabling sabotage blocks new spins only. Repair mode retains $40 target damage with no attacker payout. The teacher-only activity feed records attempts and settled payouts. Students’ round reports show savings, stolen income, and stolen losses. Reset clears alliances, invitations, claims, and notifications while preserving teacher mode/settings.

### Optional direct and indirect competition lesson

In a Supply & Demand room, the teacher can turn **Competition challenges** on under **Direct & indirect competition** before starting or between rounds. It is off by default for new and existing games and cannot be changed during planning, while paused, or after completion. The Cost & Markup game is unaffected. Reset retains the setting but clears answers and counts.

The ten scenarios contain 15 classification questions: one per round in rounds 1–5, then two per round in rounds 6–10. Students classify a business and choose a reason based on the stated customer need, offer, and occasion. A grocery deli selling the same hot lunches can be direct competition; groceries for preparing lunch at home can be indirect. Rounds 1–2 have no economic effect. From round 3, students also select a business response and explain its tradeoff. One answer submission is saved per round before feedback is revealed. Incorrect answers carry no penalties and still satisfy the submission requirement. Actual price/stock and market strategy decisions remain required.

Responses from round 3 affect the simulated competitor pressure on demand, with scenario-dependent benefits: value advertising costs $8 once per round; distinctive ingredients increase per-unit ingredient costs 4% (rounded to cents); easier pickup costs $10 once per round; keeping the current approach adds no expense but accepts competitor pressure. No response automatically changes menu prices or stock. Classification/reasoning accuracy does not affect money. Demand increases do not guarantee sales when prices are high or stock is limited. Campaign costs are charged at simulation, not when answering, and skipped students incur no competition campaign costs. These effects coexist with alliances, sabotage, and mystery boxes.

Student feedback explains each classification and the response tradeoff; the round report saves the response, effects, and debrief with the campaign fee included in total fees. The private teacher tracker shows right/answered totals for classification, classification reasoning, and response reasoning for the round and game, with per-student answer history. Response reasoning checks whether the explanation matches the chosen action, not whether the action was the most profitable. Teacher aggregates are absent from student responses and public leaderboards. Historical reports remain unchanged if the teacher later disables the lesson.

### Clearer round flow and lesson presets

A server-generated checklist uses the same saved decisions as submission validation. It shows the current lesson’s required challenge/strategy/item steps, optional reading/review reminders, and submission state. “Take me to my next step” scrolls and focuses the relevant section. Reminders never add submission requirements; incorrect math or competition answers still allow submission under the existing rules. Review & submit shows the actual saved menu, lists all missing required decisions, and warns that unsaved form edits are not included. After submission, students see a saved confirmation and how many classmates are still deciding. Read/review acknowledgments persist for the round; saving another price clears the review reminder.

Optional moves and extra math help live in disclosures, with the free walkthrough still available directly on each pricing form. Live sabotage notifications continue to appear immediately, even when optional moves are collapsed. Disclosure state is preserved across updates while the page remains open. Pending sales transfers are shown separately from already-settled profit, without exposing anonymous incoming attacker identities or percentages.

Results lead with factual “What helped / What hurt / Try next round” observations and an expandable ledger separating sales, food, campaigns, boxes, sabotage costs and transfers, hints, and penalties. Planning charges/credits are labelled as already included; unknown historical fees retain an explicit residual category. Alliance savings are already deducted from food costs. Detailed item reports, learning feedback, and rank updates remain expandable.

The teacher dashboard leads with the next action, readiness, missing decisions, check-in suggestions from recorded corrections/feedback, and quick attendance/reopen/waiver controls. Learning data, activity, settings, and game management remain available in expandable sections. Check-in signals and assessment counts remain private to the teacher.

Presets can be applied only in the lobby or between rounds, with owner authorization and an expected room version. Core lesson disables boxes, sabotage, alliances, paid hints, and competition challenges. Competition focus is Supply & Demand only: it enables competition challenges while leaving those optional extras off. Full game enables boxes, alliances, sales-theft sabotage, and either competition challenges (Supply & Demand) or paid hints (Cost & Markup). Each preset describes its switches before application. Presets preserve individual guided-help settings, memberships, previous purchases, results, and scheduled transfers. Manual changes display as Custom settings if they no longer match a preset.

### Optional discount / markdown lesson

In a Cost & Markup room, open **Lesson settings, presets & game management → Discounts & markdowns**. The teacher can switch it on/off in the lobby or between rounds (while not paused). It is off by default and does not apply to Supply & Demand.

When enabled, rounds 1–2 retain markup practice; rounds 3–10 require both a new item's markup calculation and a markdown calculation on one chosen menu item. Students choose 5–75% off the regular selling price, round the markdown amount to cents, then subtract it to find the sale price. A free worked walkthrough remains available. Incorrect math saves corrected values and uses the existing shared, once-per-round penalty (none in rounds 1–5). Teacher-only tracking separates markdown checks and identifies assisted checks.

The discount affects simulated demand and revenue for that round only. Base prices remain saved; every new round needs a fresh markdown decision. Changing the selected item's base price requires recalculating its markdown before submission. This lesson replaces other promotions while active so discounts do not stack. Results show the regular price, markdown, sale price, units sold, and item profit. No changes to earlier saved reports or scores.
