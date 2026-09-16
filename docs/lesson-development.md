# Adding the next Business Math lesson

## Current lesson

`cost-markup-v1` is the only published lesson. It keeps the current ten-round cost/markup game, including its existing marketing promotions. No additional discount-calculation exercises are enabled yet.

Teacher login is available on the landing page. It checks both account credentials and the teacher access key, then stores verified teacher access in the authenticated session. Hosting also accepts the existing access-key path for compatibility. A verified teacher session can create multiple classrooms without resubmitting the key. Only a room's owner can control that room.

## What is now separated

- `lib/lessons/index.js`: published lesson registry, version lookup, snapshot creation, and draft serialization.
- `lib/lessons/markup-v1.js`: current pricing exercise, required draft fields, readiness validation, and default rules.
- `lib/lessons/marketing-offers-v1.js`: existing promotion accounting, reusable by the next lesson.
- `lib/game.js`: shared round flow, attempts, once-per-round penalties, saving validated menu data, and sales simulation.
- `server.js`: authentication, room membership, persistence, host controls, and API routing.

Each game saves a `lessonId` and its own copy of the lesson rules, product catalog, and promotion definitions. Changes to defaults for a new game do not rewrite these snapshots. Old games without lesson metadata resolve to the original cost/markup lesson and receive metadata on their next save. Legacy restaurant names are preserved when reading/rejoining existing games; new restaurants must use the curated list.

Published lesson implementations are versioned code: keep `cost-markup-v1` available and do not change its behavior when releasing a new lesson. Create a new ID/module when formulas or accounting change. Snapshotting data does not automatically version JavaScript code.

## Lesson module contract

A module exports:

- `id`: unique, permanent versioned identifier.
- `label`: teacher-facing lesson name.
- `rules`: serializable defaults (`totalRounds`, `practiceRounds`, `promotionsFromRound`, `maxMarkup`, `catalog`, `promotions`).
- `draftFields`: allowed input field names. Shared draft saving retains only these fields.
- `checkPricing(item, values, rules)`: returns `{correct, message, menuPatch}`. Only server-computed `menuPatch` fields are written to the validated menu. Invalid input structure can throw an error with `status = 400`; an incorrect mathematical answer returns `correct: false` and follows the shared attempt/penalty logic.
- `readyError(game, player)`: returns a blocking message or null. Extra exercises can block submission here.
- `calculateOffer(player, entry, rules)`: returns per-order revenue, cost, units, expected value, promotion demand factor, fees, and the existing optional happy-hour accounting fields. A discount lesson can use validated discount data from the menu entry here.

The existing `/check`, `/draft`, `/ready`, and simulation paths call these lesson functions. Students cannot choose a lesson version or replace a rules snapshot after joining; the teacher selects a published lesson when creating the game.

## Adding discounts next week

1. Create a new lesson module, for example `discounts-v1`; leave the original lesson unchanged.
2. Decide the lesson sequence: markup first, then discount amount, final sale price, and profit after discount.
3. Add the new draft fields and server-side checks. Return the validated amounts in `menuPatch`, and use them in the lesson's offer accounting.
4. Add the corresponding student input controls, formula hints, and report labels to the browser. These discount-specific controls are intentionally not implemented yet.
5. Add the lesson to the registry only after its UI and tests are ready. Teacher lesson options already come from that registry.
6. Add a lesson selector to the career leaderboard UI when a second lesson is published. The API already accepts `?lessonId=...`; career records are tagged by lesson, and comparisons default to the original cost/markup lesson. Unknown/unpublished IDs are rejected.
7. Run tests for both lesson versions, including a saved original game resumed after the new release, wrong-answer penalties, rounding, discounted sales accounting, and separate career rankings.

The same player accounts, avatars, and earned badges carry across games. Career profit/best-game comparisons are isolated by lesson version. Gameplay balancing, badge eligibility for a new curriculum, and customer-demand changes still need deliberate review when implementing that new lesson.
