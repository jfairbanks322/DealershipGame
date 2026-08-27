const AVATAR_CHOICES = Object.freeze([
  { id: "dragon", src: "/assets/avatars/dragon.jpg", label: "Dragon" },
  { id: "elf", src: "/assets/avatars/elf.jpg", label: "Elf" },
  { id: "fairy", src: "/assets/avatars/fairy.jpg", label: "Fairy" },
  { id: "wizard", src: "/assets/avatars/wizard.jpg", label: "Wizard" },
  { id: "dwarf", src: "/assets/avatars/dwarf.jpg", label: "Dwarf" },
  { id: "knight", src: "/assets/avatars/knight.jpg", label: "Knight" },
  { id: "goblin", src: "/assets/avatars/goblin.jpg", label: "Goblin" },
  { id: "mermaid", src: "/assets/avatars/mermaid.jpg", label: "Mermaid" },
  { id: "centaur", src: "/assets/avatars/centaur.jpg", label: "Centaur" },
  { id: "witch", src: "/assets/avatars/witch.jpg", label: "Witch" },
  { id: "playwright", src: "/assets/avatars/playwright.jpg", label: "Playwright" },
  { id: "detective", src: "/assets/avatars/detective.jpg", label: "Detective" },
  { id: "raven-poet", src: "/assets/avatars/raven-poet.jpg", label: "Raven Poet" },
  { id: "pirate", src: "/assets/avatars/pirate.jpg", label: "Pirate" },
  { id: "inventor", src: "/assets/avatars/inventor.jpg", label: "Inventor" },
  { id: "scholar", src: "/assets/avatars/scholar.jpg", label: "Scholar" },
  { id: "musketeer", src: "/assets/avatars/musketeer.jpg", label: "Musketeer" },
  { id: "masked-bard", src: "/assets/avatars/masked-bard.jpg", label: "Masked Bard" },
  { id: "jester", src: "/assets/avatars/jester.jpg", label: "Jester" },
  { id: "explorer", src: "/assets/avatars/explorer.jpg", label: "Explorer" },
  { id: "vampire", src: "/assets/avatars/vampire.jpg", label: "Vampire" },
  { id: "werewolf", src: "/assets/avatars/werewolf.jpg", label: "Werewolf" },
  { id: "mummy", src: "/assets/avatars/mummy.jpg", label: "Mummy" },
  { id: "ice-spirit", src: "/assets/avatars/ice-spirit.jpg", label: "Ice Spirit" },
  { id: "frankenstein", src: "/assets/avatars/frankenstein.jpg", label: "Frankenstein" },
  { id: "swamp-monster", src: "/assets/avatars/swamp-monster.jpg", label: "Swamp Monster" },
  { id: "doll", src: "/assets/avatars/doll.jpg", label: "Storybook Doll" },
  { id: "skeleton", src: "/assets/avatars/skeleton.jpg", label: "Skeleton" },
  { id: "pumpkin-scarecrow", src: "/assets/avatars/pumpkin-scarecrow.jpg", label: "Pumpkin" },
  { id: "plague-doctor", src: "/assets/avatars/plague-doctor.jpg", label: "Plague Doctor" },
  { id: "astronaut", src: "/assets/avatars/astronaut.jpg", label: "Astronaut" },
  { id: "robot", src: "/assets/avatars/robot.jpg", label: "Robot" },
  { id: "alien", src: "/assets/avatars/alien.jpg", label: "Alien" },
  { id: "cyberpunk", src: "/assets/avatars/cyberpunk.jpg", label: "Cyberpunk" },
  { id: "time-traveler", src: "/assets/avatars/time-traveler.jpg", label: "Time Traveler" },
  { id: "mad-scientist", src: "/assets/avatars/mad-scientist.jpg", label: "Mad Scientist" },
  { id: "space-pirate", src: "/assets/avatars/space-pirate.jpg", label: "Space Pirate" },
  { id: "cowboy", src: "/assets/avatars/cowboy.jpg", label: "Cowboy" },
  { id: "young-adventurer", src: "/assets/avatars/young-adventurer.jpg", label: "Young Adventurer" },
  { id: "deep-sea-diver", src: "/assets/avatars/deep-sea-diver.jpg", label: "Deep-Sea Diver" },
  { id: "toy-knight", src: "/assets/avatars/toy-knight.jpg", label: "Toy Knight" },
  { id: "chicken-detective", src: "/assets/avatars/chicken-detective.jpg", label: "Chicken Detective" },
  { id: "writer-cat", src: "/assets/avatars/writer-cat.jpg", label: "Writer Cat" },
  { id: "wizard-puppet", src: "/assets/avatars/wizard-puppet.jpg", label: "Wizard Puppet" },
  { id: "tea-frog", src: "/assets/avatars/tea-frog.jpg", label: "Tea Frog" },
  { id: "bookish-beast", src: "/assets/avatars/bookish-beast.jpg", label: "Bookish Beast" },
  { id: "toast-hero", src: "/assets/avatars/toast-hero.jpg", label: "Toast Hero" },
  { id: "party-yeti", src: "/assets/avatars/party-yeti.jpg", label: "Party Yeti" },
  { id: "mime", src: "/assets/avatars/mime.jpg", label: "Mime" },
  { id: "raccoon-artist", src: "/assets/avatars/raccoon-artist.jpg", label: "Raccoon Artist" }
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
