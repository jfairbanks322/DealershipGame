# THREE WORDS

THREE WORDS is a private, real-time game for two people who are getting to know each other. Each player answers ten unpredictable topics using exactly three words, then guesses which responses their partner actually wrote.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open `http://localhost:3040`, create a room, and share its invite link with the second player.

## What is included

- Exactly two players per private room
- Six-character room codes and shareable invite URLs
- 240 broad topics across funny, nostalgic, personal, relationship, meaningful, and occasional tasteful adult categories
- Exact three-word validation with punctuation-aware counting
- Unlimited topic passes with no penalty
- Server-side private answers during phase one
- Current-question-only answer choices during phase two
- Category-aware local fake-answer generation, with an optional external generator hook
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

The full-flow test covers room creation, two-player limits, ready/start flow, three-word validation, passing, answer privacy, all twenty answers and guesses, scoring, review, reconnect, and rematch topic replacement.

## Story Showdown

The existing classroom creative-writing game is preserved in [`story-showdown/`](story-showdown/README.md). It remains independently runnable and deployable by setting a Railway service's Root Directory to `/story-showdown`.
