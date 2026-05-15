# Cat and Mouse

An Expo React Native prototype for a two-player asynchronous strategy game.

One player is the Murderer, building a cover story through risky choices. The other is the Detective, spending limited actions to uncover logical clues before making a final accusation.

## Run

```bash
npm install
npm run start
```

## Two-Device LAN Test

Start the temporary multiplayer server on your computer:

```bash
npm run multiplayer
```

Find your computer's LAN IP address, then start Expo:

```bash
npm run start
```

Open the app on both devices. On the first device:

1. Enter `http://YOUR_LAN_IP:8787` in the LAN Multiplayer Test server field.
2. Tap **Host as Murderer**.
3. Share the generated case code shown in the sync banner.

On the second device:

1. Enter the same server URL.
2. Enter the case code.
3. Tap **Join as Detective**.

Both devices poll the local server every few seconds. This is only a prototype transport for testing; the game state shape is intentionally the same object that a future Supabase table can store.

## Railway Link Test

This project can also run as a single Railway-hosted web app. Railway serves both:

- The Expo web build from `dist/`
- The temporary multiplayer API from `server.js`

Deploy the `cat-and-mouse` directory to Railway. The included `railway.json` uses:

```bash
npm run build
npm run serve
```

After Railway gives you a public URL:

1. Open the Railway URL on device one.
2. Tap **Host as Murderer**.
3. Send the displayed Detective join link or case code to device two.
4. Device two opens the link, then taps **Join as Detective**.

On Railway, the server URL field should already be set to the site URL automatically.

## Prototype Notes

- Local state is persisted with AsyncStorage.
- The app is playable on one device with a pass-device screen between private turns.
- The app is also testable on two devices using the temporary LAN/Railway server in `server.js`.
- `src/game/gameEngine.ts` contains random case generation, turn resolution, clue logic, suspicion scoring, and final result scoring.
- Supabase can be added later by syncing `GameState` after each engine transition. Search for `SUPABASE_SYNC_POINT`.
