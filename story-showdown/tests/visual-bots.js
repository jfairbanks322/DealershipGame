const { io } = require("socket.io-client");

const code = String(process.argv[2] || "").toUpperCase();
const baseUrl = process.argv[3] || "http://127.0.0.1:3040";
if (!code) throw new Error("Pass the visual test game code.");

const bots = ["Jordan", "Sam"].map((name) => {
  const socket = io(baseUrl, { transports: ["websocket"], reconnection: true });
  socket.on("connect", () => socket.emit("student:join", { code, name }, (response) => {
    if (!response?.ok && !/already being used/i.test(response?.error || "")) console.error(`${name}: ${response?.error}`);
  }));
  socket.on("state", (state) => {
    if (state.phase === "writing" && !state.round.mySubmission) {
      socket.emit("student:submit", { text: `${name} followed the impossible signal into the auditorium, where every empty chair was applauding.` });
    }
    if (state.phase === "voting") {
      const choice = state.round.entries.find((entry) => !entry.own);
      if (choice && state.round.myVote !== choice.id) socket.emit("student:vote", { submissionId: choice.id });
    }
  });
  return socket;
});

console.log(`Visual bots joined ${code}.`);
process.on("SIGINT", () => { bots.forEach((bot) => bot.disconnect()); process.exit(0); });
