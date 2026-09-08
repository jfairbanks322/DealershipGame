# THREE WORDS

THREE WORDS is a private, real-time game for two people who are getting to know each other. Players answer unpredictable topics using exactly three words, then guess which responses their partner actually wrote.

Choose **Classic** for a quick 10-question game with different prompts, or **Compatibility** for 20 shared prompts and a playful, category-by-category connection report.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open `http://localhost:3040`, create a room, and share its invite link with the second player.

## What is included

- Exactly two players per private room
- Classic 10-question and Compatibility 20-question modes
- Animated compatibility report covering answer alignment, mutual guess accuracy, balance, and six expandable connection categories
- Six-character room codes and shareable invite URLs
- 240 broad topics across funny, nostalgic, personal, relationship, meaningful, and occasional tasteful adult categories
- Exact three-word validation with punctuation-aware counting
- Unlimited topic passes with no penalty
- Server-side private answers during phase one
- Current-question-only answer choices during phase two
- Three hand-authored, topic-specific decoys for every prompt, with a broader category fallback and optional external generator hook
- Independent scoring, complete answer review, and coordinated rematches
- Browser refresh and brief-disconnect recovery using anonymous session tokens
- Responsive phone, tablet, and desktop layouts

## Privacy model

Answers stay on the server during the answer phase. During guessing, a browser receives only its current topic and three unlabeled choices. Future answers and correctness flags are not preloaded into client-side JavaScript.

## Railway deployment

The repository root is the deployable THREE WORDS service. Railway can use the included `railway.json` configuration:

- Build from the repository root.
- Start with `npm start` or `node server.js`.
- Health check: `/health`
- Keep one replica. Active rooms are currently stored in server memory.

Railway supplies `PORT` automatically. The server binds to `0.0.0.0` by default.

Rooms survive browser refreshes but not a Railway restart or redeploy. Persistent rooms and multiple replicas would require moving the existing room model to Supabase/Redis and adding shared Socket.IO pub/sub.

## Optional fake-answer service

The built-in generator requires no API or paid service. To connect a compatible external generator later, set:

- `FAKE_ANSWER_API_URL`
- `FAKE_ANSWER_API_KEY` (optional)

If the external service fails or returns invalid answers, the local generator is used automatically.

## Verify

```bash
npm run check
npm test
```

The test suite covers room creation, two-player limits, both game modes, ready/start flow, three-word validation, passing, answer privacy, 20-question shared-prompt play, all 40 compatibility guesses, report calculations, scoring, review, reconnect, and rematches.

## Story Showdown

The existing classroom creative-writing game is preserved in [`story-showdown/`](story-showdown/README.md). It remains independently runnable and deployable by setting a Railway service's Root Directory to `/story-showdown`.
