const COOP_SECTIONS = Object.freeze([
  {
    id: "character",
    icon: "◇",
    label: "The main character",
    prompt: "Describe a character who could lead this story.",
    guidance: "Write one complete sentence. Give them a name or use they/them so later ideas can connect.",
    placeholder: "Marlow is a nervous magician whose shadow is much braver than they are.",
    bridge: "Every unforgettable story begins with somebody worth following.",
    fallback: "A curious stranger arrives carrying a secret they do not yet understand."
  },
  {
    id: "setting",
    icon: "▣",
    label: "Where it begins",
    prompt: "Describe the place where the story begins.",
    guidance: "Use one complete sentence with a vivid sight, sound, smell, or texture.",
    placeholder: "The train station smells like cinnamon and hums even when no trains are moving.",
    bridge: "Their world comes into focus.",
    fallback: "The day begins in a place that seems ordinary until someone looks more closely."
  },
  {
    id: "goal",
    icon: "◎",
    label: "The secret goal",
    prompt: "Describe something the character badly wants, even if it seems impossible.",
    guidance: "Write a complete sentence that identifies the character or uses they/them.",
    placeholder: "They want to return a stolen thunderstorm before anyone notices it is missing.",
    bridge: "Before long, one desire becomes impossible to ignore.",
    fallback: "They want to fix a mistake before sunset, although they have no idea where to begin."
  },
  {
    id: "comic-action",
    icon: "↯",
    label: "Comic chaos",
    prompt: "Describe an action that happens that would make someone laugh.",
    guidance: "Write one complete sentence in present tense. Make the action clear enough to picture.",
    placeholder: "A flock of pigeons steals the mayor's speech and performs it as a dance.",
    bridge: "Then the ordinary rules collapse in spectacular fashion.",
    fallback: "A very serious goose interrupts the moment and refuses to explain why."
  },
  {
    id: "complication",
    icon: "!",
    label: "The bigger problem",
    prompt: "Describe a problem that suddenly makes everything harder.",
    guidance: "Use one complete sentence. Include who or what is affected by the problem.",
    placeholder: "Every door in the building now opens into the same crowded broom closet.",
    bridge: "Unfortunately, the situation becomes even stranger.",
    fallback: "The easiest solution disappears, and the clock begins moving twice as fast."
  },
  {
    id: "reaction",
    icon: "⁂",
    label: "The crowd reacts",
    prompt: "Describe a reaction a group of people might have.",
    guidance: "Write a complete sentence naming the group and showing what they do—not only how they feel.",
    placeholder: "The entire marching band gasps, forms a circle, and begins offering wildly unhelpful advice.",
    bridge: "Everyone nearby responds at once.",
    fallback: "The witnesses exchange one enormous gasp and immediately begin arguing about a plan."
  },
  {
    id: "choice",
    icon: "◆",
    label: "The bold choice",
    prompt: "Describe a surprising decision the main character makes.",
    guidance: "Use one complete sentence with the character's name or they/them and a strong action verb.",
    placeholder: "They hand the only map to their enemy and decide to follow the echo instead.",
    bridge: "With no perfect option left, one decision changes everything.",
    fallback: "They choose the riskier path and invite everyone else to come with them."
  },
  {
    id: "ending",
    icon: "✦",
    label: "The final image",
    prompt: "Describe the last image the audience sees at the end of the story.",
    guidance: "Write one complete sentence in present tense. Make it visual and leave us with a feeling.",
    placeholder: "At sunrise, one tiny umbrella floats above the city while everyone below begins to cheer.",
    bridge: "At last, one final image remains.",
    fallback: "As morning arrives, the characters look back once and then step together into whatever comes next."
  }
]);

function normalizeCoopSentence(value) {
  let sentence = String(value || "").replace(/\s+/g, " ").trim();
  if (!sentence) return "";
  const firstLetter = sentence.search(/[A-Za-z]/);
  if (firstLetter >= 0) sentence = `${sentence.slice(0, firstLetter)}${sentence[firstLetter].toUpperCase()}${sentence.slice(firstLetter + 1)}`;
  if (!/[.!?][\"'’”)]*$/.test(sentence)) sentence += ".";
  return sentence;
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

function coopStoryText(selections = []) {
  return buildCoopStory(selections).map((part) => `${part.bridge} ${part.text}`).join("\n\n");
}

if (typeof module !== "undefined" && module.exports) module.exports = { COOP_SECTIONS, normalizeCoopSentence, buildCoopStory, coopStoryText };
if (typeof window !== "undefined") window.StoryCoop = { COOP_SECTIONS, normalizeCoopSentence, buildCoopStory, coopStoryText };
