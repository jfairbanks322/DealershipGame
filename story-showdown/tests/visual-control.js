const fs = require("fs");
const path = require("path");
const { io } = require("socket.io-client");

const code = String(process.argv[2] || "").toUpperCase();
const event = process.argv[3];
if (!code || !event) throw new Error("Usage: node tests/visual-control.js CODE teacher:event");
const stored = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "games.json"), "utf8"));
const game = stored.games.find((item) => item.code === code);
if (!game) throw new Error("Visual test game not found.");
const socket = io("http://127.0.0.1:3040", { transports: ["websocket"], reconnection: false });
socket.on("connect", () => socket.emit(event, { code, teacherToken: game.teacherToken }, (response) => {
  if (!response?.ok) {
    console.error(response?.error || "Visual control failed.");
    process.exitCode = 1;
  }
  socket.disconnect();
}));
setTimeout(() => { console.error("Visual control timed out."); process.exit(1); }, 3000).unref();
