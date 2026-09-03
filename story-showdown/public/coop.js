const COOP_STORY_FRAMES = Object.freeze([
  {
    id: "last-bell",
    title: "The Last Bell Mystery",
    genre: "Mystery comedy",
    tone: "tense, funny, and surprising",
    hero: "Rowan",
    setting: "Inside a nearly empty school after the final bell",
    problem: "the announcements are predicting events that have not happened yet",
    opening: "Inside a nearly empty school after the final bell, Rowan discovers that the announcements are predicting events that have not happened yet."
  },
  {
    id: "midnight-museum",
    title: "Midnight at the Museum",
    genre: "Eerie adventure",
    tone: "mysterious, energetic, and witty",
    hero: "Avery",
    setting: "Inside a history museum after closing time",
    problem: "one exhibit has vanished and left muddy footprints behind",
    opening: "Inside a history museum after closing time, Avery notices that one exhibit has vanished and left muddy footprints behind."
  },
  {
    id: "floating-festival",
    title: "The Floating Festival",
    genre: "Absurd fantasy",
    tone: "colorful, playful, and high-stakes",
    hero: "Jordan",
    setting: "During a crowded town festival where gravity has begun to fail",
    problem: "only one mysterious object still stays firmly on the ground",
    opening: "During a crowded town festival where gravity has begun to fail, Jordan finds the only mysterious object that still stays firmly on the ground."
  },
  {
    id: "last-bus",
    title: "The Last Bus to Anywhere",
    genre: "Surreal journey",
    tone: "strange, suspenseful, and funny",
    hero: "Kai",
    setting: "On a late-night bus that keeps stopping in impossible places",
    problem: "every passenger has received the same unexplained ticket",
    opening: "On a late-night bus that keeps stopping in impossible places, Kai realizes that every passenger has received the same unexplained ticket."
  },
  {
    id: "library-storm",
    title: "The Storm in the Library",
    genre: "Magical suspense",
    tone: "atmospheric, urgent, and clever",
    hero: "Morgan",
    setting: "Inside a library where a thunderstorm is trapped between the shelves",
    problem: "opening the wrong book makes the storm stronger",
    opening: "Inside a library where a thunderstorm is trapped between the shelves, Morgan discovers that opening the wrong book makes the storm stronger."
  },
  {
    id: "message-tomorrow",
    title: "A Message from Tomorrow",
    genre: "Science-fiction comedy",
    tone: "fast, strange, and hopeful",
    hero: "Sage",
    setting: "In a neighborhood preparing for the biggest celebration of the year",
    problem: "a voice message from tomorrow warns that one tiny mistake will ruin everything",
    opening: "In a neighborhood preparing for the biggest celebration of the year, Sage receives a voice message from tomorrow warning that one tiny mistake will ruin everything."
  }
]);

const COOP_TOPIC_GROUPS = Object.freeze([
  { category: "People & relationships", topics: ["Friendship", "Trust", "Belonging", "Family", "Teamwork", "Rivalry", "Mentorship", "First Impressions", "Misunderstandings", "Second Chances"] },
  { category: "Growing up", topics: ["Identity", "Independence", "Responsibility", "Peer Pressure", "Ambition", "Making Mistakes", "New Beginnings", "Personal Growth", "Reputation", "Finding Your Voice"] },
  { category: "Emotions & character", topics: ["Courage", "Fear", "Hope", "Jealousy", "Regret", "Grief", "Joy", "Anger", "Empathy", "Forgiveness"] },
  { category: "Values & choices", topics: ["Honesty", "Loyalty", "Kindness", "Fairness", "Justice", "Freedom", "Sacrifice", "Perseverance", "Curiosity", "Consequences"] },
  { category: "School & community", topics: ["School Life", "Leadership", "Community", "Rules", "Tradition", "Change", "Cooperation", "Competition", "Citizenship", "Helping Others"] },
  { category: "Technology & the future", topics: ["Artificial Intelligence", "Robots", "Space Exploration", "Future Cities", "Virtual Reality", "Time Travel", "Inventions", "Privacy", "Digital Identity", "Scientific Discovery"] },
  { category: "Nature & environment", topics: ["Climate Change", "Conservation", "Weather", "Oceans", "Wilderness", "Animals", "Natural Disasters", "Seasons", "Gardens", "Human Impact"] },
  { category: "Arts & culture", topics: ["Music", "Storytelling", "Visual Art", "Dance", "Film", "Fashion", "Food", "Folklore", "Language", "Celebration"] },
  { category: "Adventure & mystery", topics: ["Exploration", "Hidden Secrets", "Treasure", "Escape", "Discovery", "Travel", "Unsolved Mysteries", "Risk", "Survival", "Lost Places"] },
  { category: "Imagination & wonder", topics: ["Magic", "Superheroes", "Monsters", "Myths", "Dreams", "Alternate Worlds", "Transformation", "Strange Visitors", "Lost Civilizations", "The Impossible"] }
]);

const COOP_TOPICS = Object.freeze(COOP_TOPIC_GROUPS.flatMap((group) => group.topics.map((label) => ({
  id: label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  label,
  category: group.category
}))));

const COOP_SECTIONS = Object.freeze([
  {
    id: "character",
    icon: "◇",
    label: "Who we follow",
    prompt: "Give {hero} one defining trait, flaw, or unusual ability.",
    topicNudge: "Let the trait reveal something about {topic}.",
    stem: "{hero} is",
    guidance: "Write only the words that finish the sentence. Begin with a description such as “a nervous inventor…”",
    placeholder: "a cautious inventor who can hear when objects are lying",
    bridge: "First, we learn who is stepping into the problem.",
    fallback: "a determined problem-solver who is braver than they realize"
  },
  {
    id: "setting",
    icon: "▣",
    label: "The atmosphere",
    prompt: "Add one sensory detail that belongs in the shared setting.",
    topicNudge: "Use the detail to hint at {topic}.",
    stem: "{setting},",
    guidance: "Continue with something visible, audible, or physical. Keep it connected to the place in the story brief.",
    placeholder: "the lights flicker whenever someone tells the truth",
    bridge: "The setting adds a clue and establishes the mood.",
    fallback: "every light flickers as though the building is trying to send a warning"
  },
  {
    id: "goal",
    icon: "◎",
    label: "The clear objective",
    prompt: "What does {hero} decide they must accomplish to solve the shared problem?",
    topicNudge: "Let {topic} shape why the goal matters.",
    stem: "{hero} wants to",
    guidance: "Begin with an action verb. Your answer should directly address the problem in the story brief.",
    placeholder: "find the source of the impossible messages before anyone else hears them",
    bridge: "Now the story has a goal that can drive every later action.",
    fallback: "solve the mystery before the situation spreads beyond control"
  },
  {
    id: "comic-action",
    icon: "↯",
    label: "The first escalation",
    prompt: "Describe a funny action that would make someone laugh and make this same problem more chaotic.",
    topicNudge: "Connect the comic moment to {topic}.",
    stem: "The first sign that things are going wrong is when",
    guidance: "Write a short who-does-what clause. Connect the joke to the setting, goal, or central problem.",
    placeholder: "the school mascot grabs the only clue and escapes on a rolling chair",
    bridge: "The attempt begins, and the pressure immediately turns ridiculous.",
    fallback: "a very serious goose steals the most important clue and refuses to give it back"
  },
  {
    id: "complication",
    icon: "!",
    label: "The major setback",
    prompt: "Add a setback caused by the shared problem or by the attempt to solve it.",
    topicNudge: "Make the setback test something important about {topic}.",
    stem: "The situation becomes more difficult because",
    guidance: "Explain a direct cause. This should make the established goal harder—not introduce an unrelated adventure.",
    placeholder: "every attempt to stop the announcements makes them louder",
    bridge: "But the first plan fails and creates a larger obstacle.",
    fallback: "the easiest solution accidentally makes the original problem twice as powerful"
  },
  {
    id: "reaction",
    icon: "⁂",
    label: "The group reacts",
    prompt: "Describe what the nearby group does in response to the growing problem.",
    topicNudge: "Let the reaction reveal something about {topic}.",
    stem: "Meanwhile, the people nearby",
    guidance: "Begin with a plural action verb such as “gather,” “run,” or “start.” Show behavior instead of only an emotion.",
    placeholder: "form three committees and immediately disagree about everything",
    bridge: "The consequences spread, forcing everyone nearby to respond.",
    fallback: "gather around the scene and begin offering completely contradictory advice"
  },
  {
    id: "choice",
    icon: "◆",
    label: "The decisive choice",
    prompt: "What surprising action does {hero} take to face the central problem?",
    topicNudge: "Make the choice say something about {topic}.",
    stem: "With no easy option left, {hero} decides to",
    guidance: "Begin with an action verb. Make the choice respond to the goal, setback, or group reaction already established.",
    placeholder: "trust the least reliable person in the room and follow their plan",
    bridge: "At the climax, all that pressure forces one decisive choice.",
    fallback: "take the riskiest available path and ask everyone else to help"
  },
  {
    id: "ending",
    icon: "✦",
    label: "The changed world",
    prompt: "Show one final image that proves how the shared problem ended.",
    topicNudge: "Leave the audience with one final thought about {topic}.",
    stem: "In the end,",
    guidance: "Write a visual clause showing the result. Echo the protagonist, setting, problem, or an earlier funny detail.",
    placeholder: "the loudspeaker plays one quiet thank-you message as every door finally unlocks",
    bridge: "The resolution shows what changed because of the choice.",
    fallback: "the place settles into calm as one final clue proves that the mystery is over"
  }
]);

function coopFrameById(frameId) {
  return COOP_STORY_FRAMES.find((frame) => frame.id === frameId) || COOP_STORY_FRAMES[0];
}

function coopTopicById(topicId) {
  return COOP_TOPICS.find((topic) => topic.id === topicId) || null;
}

function renderCoopTemplate(value, frame = COOP_STORY_FRAMES[0], topic = null) {
  return String(value || "")
    .replaceAll("{hero}", frame.hero)
    .replaceAll("{setting}", frame.setting)
    .replaceAll("{problem}", frame.problem)
    .replaceAll("{topic}", topic?.label || "the class topic");
}

function coopSectionsForFrame(frame = COOP_STORY_FRAMES[0], topic = null) {
  return COOP_SECTIONS.map((section) => ({
    ...section,
    prompt: `${renderCoopTemplate(section.prompt, frame, topic)}${topic ? ` ${renderCoopTemplate(section.topicNudge, frame, topic)}` : ""}`,
    stem: renderCoopTemplate(section.stem, frame, topic),
    fallback: renderCoopTemplate(section.fallback, frame, topic)
  }));
}

function normalizeCoopSentence(value) {
  let sentence = String(value || "").replace(/\s+/g, " ").trim();
  if (!sentence) return "";
  const firstLetter = sentence.search(/[A-Za-z]/);
  if (firstLetter >= 0) sentence = `${sentence.slice(0, firstLetter)}${sentence[firstLetter].toUpperCase()}${sentence.slice(firstLetter + 1)}`;
  if (!/[.!?][\"'’”)]*$/.test(sentence)) sentence += ".";
  return sentence;
}

function formatCoopAnswer(sectionId, value, frame = COOP_STORY_FRAMES[0], topic = null) {
  const section = coopSectionsForFrame(frame, topic).find((item) => item.id === sectionId);
  if (!section) return normalizeCoopSentence(value);
  let fragment = String(value || "").replace(/\s+/g, " ").trim();
  if (!fragment) return "";
  if (fragment.toLocaleLowerCase().startsWith(section.stem.toLocaleLowerCase())) fragment = fragment.slice(section.stem.length).trim();
  fragment = fragment.replace(/^[\s,.:;…-]+/, "").trim();
  const punctuationMatch = fragment.match(/[!?][\"'’”)]*$/);
  const punctuation = punctuationMatch ? punctuationMatch[0] : ".";
  fragment = fragment.replace(/[.!?]+[\"'’”)]*$/, "").trim();
  const firstLetter = fragment.search(/[A-Za-z]/);
  if (firstLetter >= 0 && !(fragment[firstLetter] === "I" && !/[A-Za-z]/.test(fragment[firstLetter + 1] || ""))) {
    fragment = `${fragment.slice(0, firstLetter)}${fragment[firstLetter].toLowerCase()}${fragment.slice(firstLetter + 1)}`;
  }
  return normalizeCoopSentence(`${section.stem} ${fragment}${punctuation}`);
}

function buildCoopStory(selections = []) {
  const bySection = new Map(selections.map((selection) => [selection.sectionId, selection]));
  return COOP_SECTIONS.map((section) => {
    const selection = bySection.get(section.id);
    if (!selection) return null;
    return {
      sectionId: section.id,
      label: section.label,
      icon: section.icon,
      bridge: section.bridge,
      text: normalizeCoopSentence(selection.text),
      studentName: selection.studentName || "The class"
    };
  }).filter(Boolean);
}

function coopStoryText(selections = [], frame = null) {
  const opening = frame?.opening ? `${normalizeCoopSentence(frame.opening)}\n\n` : "";
  return `${opening}${buildCoopStory(selections).map((part) => `${part.bridge} ${part.text}`).join("\n\n")}`;
}

const api = {
  COOP_STORY_FRAMES,
  COOP_TOPIC_GROUPS,
  COOP_TOPICS,
  COOP_SECTIONS,
  coopFrameById,
  coopTopicById,
  coopSectionsForFrame,
  renderCoopTemplate,
  normalizeCoopSentence,
  formatCoopAnswer,
  buildCoopStory,
  coopStoryText
};

if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") window.StoryCoop = api;
