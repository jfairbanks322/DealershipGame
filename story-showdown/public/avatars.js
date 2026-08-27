const AVATAR_CHOICES = Object.freeze([
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "owl", emoji: "🦉", label: "Owl" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
  { id: "robot", emoji: "🤖", label: "Robot" },
  { id: "planet", emoji: "🪐", label: "Planet" },
  { id: "octopus", emoji: "🐙", label: "Octopus" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly" },
  { id: "wolf", emoji: "🐺", label: "Wolf" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn" },
  { id: "tiger", emoji: "🐯", label: "Tiger" },
  { id: "frog", emoji: "🐸", label: "Frog" },
  { id: "rocket", emoji: "🚀", label: "Rocket" }
]);

function normalizeAvatarId(value) {
  const id = String(value || "");
  return AVATAR_CHOICES.some((avatar) => avatar.id === id) ? id : AVATAR_CHOICES[0].id;
}

function avatarFor(value) {
  const id = normalizeAvatarId(value);
  return AVATAR_CHOICES.find((avatar) => avatar.id === id);
}

if (typeof module !== "undefined" && module.exports) module.exports = { AVATAR_CHOICES, normalizeAvatarId, avatarFor };
if (typeof window !== "undefined") window.StoryAvatars = { AVATAR_CHOICES, normalizeAvatarId, avatarFor };
