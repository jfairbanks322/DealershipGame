# Google Apps Script Prototype

This folder is a parallel Google-hosted prototype of the dealership game. It does **not** replace the Node/Railway app in the rest of the repo.

## What It Does

- serves a Google Apps Script web app
- stores game data in Google Sheets
- supports teacher login, student registration/login, session open/close, leaderboard updates, a live teacher dashboard, and branching case chains
- currently ships with seven classroom-ready events:
  - `commission-crisis`
  - `price-typo`
  - `beatles-blowup`
  - `test-drive-ghost`
  - `pre-delivery-scratch`
  - `lunch-thief`
  - `lot-football-disaster`

## Why It Exists

Some schools block outside hosting but allow Google-hosted tools more easily. This gives you a Google-native path to test without losing the existing Railway version.

## Fastest Setup

1. Go to [script.new](https://script.new/) while logged into the Google account you want to deploy from.
2. Create a new Apps Script project.
3. In that project, create files matching the files in this folder:
   - `appsscript.json`
   - `GameData.gs`
   - `Store.gs`
   - `Logic.gs`
   - `Index.html`
   - `Styles.html`
   - `Client.html`
4. Paste in the contents from this folder.
5. Save the project.
6. Run `dmSetupSpreadsheet` once from the Apps Script editor.
7. Approve the requested Google permissions.
8. The function will create a Google Sheet for the game data and wire the project to it.

## Deploy As A Web App

1. In Apps Script, click `Deploy` -> `New deployment`.
2. Choose type `Web app`.
3. Set:
   - `Execute as`: `Me`
   - `Who has access`: start with your school domain or `Anyone with the link` if your policy allows it
4. Deploy.
5. Open the web app URL.

## Default Teacher Login

- Username: `teacher`
- Password: `showroom`

## Notes

- This is now a fuller Google classroom build, but it still does not yet match every single Node/Railway feature.
- The current Node/Railway project remains untouched and can keep running.
- The Google version is the right place to test school-network compatibility first, then we can keep porting any remaining admin polish over as needed.
