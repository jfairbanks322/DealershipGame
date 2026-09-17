const CATEGORIES = {
  "Story starters": [
    "The envelope had your name on it, but the handwriting belonged to someone who had disappeared years ago.",
    "At exactly 3:17 every afternoon, every clock in town stopped for one minute.",
    "Begin with a character discovering that the school library has a thirteenth floor.",
    "The last bus of the night arrives, but its route number is blank.",
    "A stranger returns something your character never knew they had lost.",
    "Everyone receives the same text message except your main character.",
    "Open with the sentence: ‘This is not how a Tuesday is supposed to sound.’",
    "Your character finds a key labeled with tomorrow’s date.",
    "A new student seems to know every person in school before being introduced."
  ],
  "Suspense and mystery": [
    "Write a scene in which a harmless sound becomes increasingly suspicious.",
    "A trophy disappears from a locked display case during lunch. Reveal one surprising clue.",
    "Your character is certain someone has been inside their room, but nothing is missing.",
    "Write the moment a detective realizes the witness is describing the wrong day.",
    "Every photo from a class trip contains the same unknown person in the background.",
    "A voicemail arrives from the owner of a phone that has been disconnected for years.",
    "Two friends follow a trail of chalk arrows that only appears after sunset.",
    "Describe a suspenseful search without using the words dark, scared, or suddenly.",
    "The school’s lost-and-found contains an object connected to an unsolved local mystery."
  ],
  "Comedy": [
    "Write a serious argument between two characters about an extremely unimportant topic.",
    "A student accidentally becomes the substitute teacher for ten minutes.",
    "Create an advertisement for a product that solves a problem nobody has.",
    "Write dialogue between a person trying to be mysterious and someone who keeps misunderstanding them.",
    "The school mascot refuses to leave the costume after the game.",
    "A character’s attempt to look cool is ruined by a very polite goose.",
    "Write a scene where every small lie makes a school announcement more ridiculous.",
    "A robot gives technically correct but completely unhelpful life advice.",
    "Describe the world’s least effective supervillain giving an inspiring speech."
  ],
  "Poetry — Rhyming": [
    "Write an 8–12 line rhyming poem about a school locker that guards a surprising secret.",
    "Create a playful rhyming poem in which Monday and Friday argue over who matters more.",
    "Write a rhyming ballad about a tiny mistake that grows into a legendary adventure.",
    "Compose a poem with an ABAB rhyme scheme about finding courage in an unexpected place.",
    "Write a humorous rhyming poem from the perspective of a phone stuck at one percent battery.",
    "Create a rhyming poem where each stanza adds a stranger sound coming from the attic.",
    "Write a rhyming ode to an ordinary object that deserves far more appreciation.",
    "Compose a rhyming poem about two rivals who discover they make an excellent team.",
    "Write a rhyming poem that begins cheerfully but ends with one mysterious final couplet."
  ],
  "Poetry — Free verse": [
    "Write a free-verse poem about the five seconds before someone says something brave.",
    "Create a non-rhyming poem that turns a crowded hallway into a river of voices and motion.",
    "Write a free-verse poem from the perspective of a shadow that wants to choose its own direction.",
    "Compose a non-rhyming poem using colors and textures to describe a memory without naming it.",
    "Write a free-verse poem about outgrowing something you once thought would last forever.",
    "Create a non-rhyming poem in which silence behaves like a character entering the room.",
    "Write a free-verse poem that captures the feeling of receiving unexpected good news.",
    "Compose a non-rhyming poem about a city at midnight using at least three surprising comparisons.",
    "Write a free-verse poem that begins with a question and ends with a completely different question."
  ],
  "Finish the story": [
    "Finish the story: The substitute teacher wrote one sentence on the board—then every classroom door locked at once.",
    "Finish the story: When the final note of the concert faded, someone in the empty balcony began to applaud.",
    "Finish the story: The map was useless until your character noticed it matched the lines on their own hand.",
    "Finish the story: Everyone forgot the championship game except the player who scored the winning point.",
    "Finish the story: The dragon returned the stolen treasure with a note that read, ‘You are going to need this.’",
    "Finish the story: At lunch, a student receives a receipt for something they will not buy until tomorrow.",
    "Finish the story: The town’s funniest person stops laughing after hearing a joke nobody else can remember.",
    "Finish the story: A poem found inside an old yearbook adds a new line every time someone reads it.",
    "Finish the story: The rescue team reaches the island and discovers the missing explorer has built a thriving city."
  ],
  "Connect the start and end": [
    "Connect the start and end. Start: ‘Maya missed the bus by eleven seconds.’ End: ‘That was how she became mayor for a day.’ Show every important step between them.",
    "Connect the start and end. Start: ‘The trophy case was completely empty.’ End: ‘They returned the moon rock before sunrise.’ Explain how point A led to point B.",
    "Connect the start and end. Start: ‘Noah promised he would not press the red button.’ End: ‘The penguins accepted his apology.’ Build the chain of events between them.",
    "Connect the start and end. Start: ‘The kingdom banned magic at noon.’ End: ‘By dinner, the royal chef was a dragon.’ Make each surprising turn feel earned.",
    "Connect the start and end. Start: ‘A poem appeared on the principal’s door.’ End: ‘The entire school answered in rhyme.’ Explain how the change spread.",
    "Connect the start and end. Start: ‘The power went out during rehearsal.’ End: ‘The audience called it the greatest show of the year.’ Show how the disaster became a success.",
    "Connect the start and end. Start: ‘The detective found a clean white feather.’ End: ‘The missing robot was waiting at the airport.’ Create a logical trail from clue to discovery.",
    "Connect the start and end. Start: ‘Lena deleted the mysterious message.’ End: ‘Ten years later, she finally sent it.’ Bridge the two moments with the choices that changed her.",
    "Connect the start and end. Start: ‘The cafeteria served only blue food.’ End: ‘Nobody ever complained about Tuesdays again.’ Explain the strange journey from point A to point B."
  ],
  "Science fiction": [
    "A colony on Mars receives its first package from Earth in twelve years.",
    "Your character can borrow five minutes from their future self, but repayment is due today.",
    "Write a scene aboard a ship whose navigation computer has developed stage fright.",
    "Every person is assigned one question they may ask an all-knowing machine.",
    "A city discovers the moon is broadcasting a countdown.",
    "Memories can be traded like music files. Your character receives one by mistake.",
    "A student’s science-fair project opens a tiny doorway to another planet.",
    "Write from the perspective of the first plant grown beneath an alien sun.",
    "The newest phone update lets users hear messages sent from one day in the future."
  ],
  "Fantasy": [
    "The kingdom’s last dragon applies for a job at the royal bakery.",
    "Magic works only when someone tells the complete truth.",
    "A map redraws itself whenever its owner makes a difficult decision.",
    "Write about a knight whose armor offers constant, unwanted advice.",
    "A character inherits a castle that appears for only one hour each week.",
    "Every spell has an unexpected but oddly useful side effect.",
    "The village monster quietly protects everyone from something worse.",
    "A wizard’s apprentice discovers that shadows have their own language.",
    "The royal crown chooses a completely unexpected successor."
  ],
  "Realistic fiction": [
    "Two longtime friends want the same role in the school play.",
    "A character must admit they were given credit for someone else’s idea.",
    "Write about the five minutes before an important tryout or audition.",
    "A new job forces your character to work with someone they misjudged.",
    "A family tradition changes, and one person is determined to save it.",
    "Your character finds an honest note tucked inside a used textbook.",
    "Write a scene where a small act of kindness changes an uncomfortable day.",
    "A student has one lunch period to repair a damaged friendship.",
    "Your character must choose between keeping a promise and telling the truth."
  ],
  "Dialogue challenges": [
    "Write a conversation in which both speakers want the same thing but believe they disagree.",
    "Create a tense scene using dialogue only; never name the setting directly.",
    "One speaker may ask only questions, while the other refuses to answer directly.",
    "Write a conversation between a time traveler and the person whose locker they are hiding in.",
    "Two rivals are trapped in an elevator and must cooperate.",
    "A character tries to apologize without using the words sorry, mistake, or fault.",
    "Write dialogue where one character knows a secret and the other almost guesses it.",
    "Create a conversation between a student and a future version of themselves.",
    "Two characters describe the same event so differently that it sounds like two separate days."
  ],
  "Plot twists": [
    "Write a short scene that makes the reader reconsider the first sentence at the end.",
    "A character wins exactly what they wanted and discovers why nobody else wanted it.",
    "The apparent villain has been leaving warnings, not threats.",
    "End a normal school-day scene by revealing an impossible audience.",
    "The treasure map leads back to the place where the journey began.",
    "A character learns that their rival has secretly been helping them.",
    "The rescue mission succeeds, but the rescued person refuses to leave.",
    "The mysterious coded message turns out to be instructions for something ordinary—with extraordinary stakes.",
    "A narrator reveals one final detail that changes who the reader trusts."
  ],
  "Character challenges": [
    "Create a brave character who is afraid of being noticed.",
    "Write about a perfectionist forced to improvise in public.",
    "Introduce a character through the contents of their backpack.",
    "A usually quiet character decides to interrupt an important ceremony.",
    "Write from the viewpoint of someone who always assumes the best about people.",
    "Create a rival who is difficult to dislike.",
    "Show a character changing their mind without directly stating it.",
    "A character receives praise for the one skill they wish they did not have.",
    "Write a decision scene for someone whose greatest strength is also their biggest weakness."
  ],
  "Setting descriptions": [
    "Describe an empty gym after a championship without mentioning the game’s result.",
    "Make an ordinary bus stop feel like the beginning of an adventure.",
    "Describe a room using only sounds, textures, and temperatures.",
    "Turn a crowded cafeteria into a setting for an epic quest.",
    "Describe a familiar neighborhood after one impossible detail has changed.",
    "Make a bright summer afternoon feel unsettling without using weather clichés.",
    "Describe a hidden room that reflects the personality of the person who built it.",
    "Create a setting that feels welcoming to one character and threatening to another.",
    "Describe the last open store in a town during a power outage."
  ],
  "Perspective changes": [
    "Retell a familiar fairy tale from the viewpoint of an overlooked side character.",
    "Write a school fire drill from the perspective of the alarm.",
    "Describe an argument from the viewpoint of a pet in the room.",
    "Tell the same brief event first as a victory, then as a disaster.",
    "Write from the perspective of a borrowed object that is never returned.",
    "Narrate a surprise party from the viewpoint of someone who guessed the surprise immediately.",
    "Describe a thunderstorm from the perspective of a house.",
    "Retell a heroic rescue from the viewpoint of the person who caused the problem.",
    "Write a scene from the perspective of a rumor as it moves through a school."
  ],
  "Extremely strange or absurd scenarios": [
    "The principal announces that gravity will be optional until Friday.",
    "Every vending machine in town begins offering surprisingly specific advice.",
    "A committee of squirrels has filed a formal complaint against your character.",
    "The school’s Wi-Fi password becomes sentient and refuses to be shared.",
    "Write about a courtroom trial in which the defendant is a missing left sock.",
    "For one day, metaphors become literal the moment someone says them.",
    "A perfectly normal sandwich is elected mayor by a landslide.",
    "Your character wakes up as the final boss of a video game they have never played.",
    "All mirrors begin showing people five minutes late."
  ]
};

const LENGTHS = [
  { responseLength: "short", timerSeconds: 120, suggestion: "2–4 sentences" },
  { responseLength: "medium", timerSeconds: 240, suggestion: "1–2 paragraphs" },
  { responseLength: "long", timerSeconds: 360, suggestion: "3–5 paragraphs" }
];

const ROUND_FORMATS = Object.freeze([
  { id: "story", label: "Story Spark", icon: "✦", summary: "Write from a genre or story prompt.", sourceLabel: "Prompt", writingLabel: "Your response", placeholder: "Start writing here…" },
  { id: "vivid", label: "Make It Vivid", icon: "◈", summary: "Transform a plain sentence into a sensory scene.", sourceLabel: "Plain description", writingLabel: "Your vivid rewrite", placeholder: "Let the reader see, hear, and feel the moment…" },
  { id: "hero", label: "Create the Hero", icon: "⚔", summary: "Invent a protagonist built for a specific scenario.", sourceLabel: "Scenario", writingLabel: "Your protagonist", placeholder: "Show who this hero is beneath the obvious answer…" },
  { id: "villain", label: "Create the Villain", icon: "♜", summary: "Design a layered antagonist with believable motives.", sourceLabel: "Scenario", writingLabel: "Your antagonist", placeholder: "Create a villain who believes they are making the right choice…" }
]);

const WORKSHOP_PROMPTS = {
  vivid: [
    "The hallway was crowded and noisy.",
    "A storm moved over the town.",
    "The old house looked frightening.",
    "She was nervous before the audition.",
    "The kitchen smelled good.",
    "The team celebrated after the final whistle.",
    "The forest was quiet at night.",
    "He opened the mysterious box.",
    "The city was busy in the morning."
  ],
  hero: [
    "At sunrise, everyone in town forgets the previous day—except one person.",
    "An underwater city has twelve hours of oxygen left, and the escape route has vanished.",
    "At a school where every lie becomes visible, someone is being framed by a truth.",
    "The royal crown disappears on the morning it must choose the next ruler.",
    "A young Mars colony receives a rescue signal from a place where nobody has ever lived.",
    "A championship team loses its coach minutes before the final game begins.",
    "Books are vanishing from a library, along with every reader’s memory of them.",
    "Two rival cities must share the only bridge before a once-in-a-century flood arrives.",
    "The smallest dragon in the kingdom is the only creature who can enter a collapsing mountain."
  ],
  villain: [
    "A city has learned how to buy and sell time, but only one person controls the price.",
    "An enchanted forest is being made perfectly safe, one wild creature at a time.",
    "A school’s new principal can guarantee success—but only by choosing every student’s future.",
    "A celebrated inventor promises to end loneliness with companions who never disagree.",
    "The keeper of a magical archive has begun erasing every story that causes conflict.",
    "A space station commander refuses to let anyone return to a damaged Earth.",
    "The kingdom’s most beloved hero wants to outlaw fear, sadness, and every other painful emotion.",
    "A famous detective secretly creates mysteries so the city will always need them.",
    "The guardian of a perfect virtual world will do anything to stop its citizens from waking up."
  ]
};

const storyPrompts = Object.entries(CATEGORIES).flatMap(([category, texts], categoryIndex) =>
  texts.map((text, index) => {
    const length = LENGTHS[(categoryIndex + index) % LENGTHS.length];
    return {
      id: `starter-${categoryIndex + 1}-${index + 1}`,
      text,
      category,
      format: "story",
      source: "",
      criteria: [],
      writingLabel: "Your response",
      placeholder: "Start writing here…",
      difficulty: ["accessible", "intermediate", "challenge"][(index + categoryIndex) % 3],
      ...length
    };
  })
);

const WORKSHOP_DETAILS = {
  vivid: {
    category: "Description Lab",
    task: "Rewrite the plain description as a vivid scene. Keep the same basic event, but make the reader experience it.",
    criteria: ["Sensory detail", "Precise verbs", "Fresh comparison"],
    suggestions: ["4–6 vivid sentences", "1 sensory paragraph", "2 layered paragraphs"]
  },
  hero: {
    category: "Character Lab — Hero",
    task: "Create the main character for this scenario. Give them a goal, a fear, a contradiction, and one choice only they would make.",
    criteria: ["Clear motivation", "Strength and flaw", "Memorable detail"],
    suggestions: ["1 character snapshot", "1–2 focused paragraphs", "A full character profile"]
  },
  villain: {
    category: "Character Lab — Villain",
    task: "Create the antagonist for this scenario. Give them a believable goal, a persuasive reason, a dangerous flaw, and a line they refuse to cross.",
    criteria: ["Believable motive", "Threat and humanity", "Distinctive presence"],
    suggestions: ["1 character snapshot", "1–2 focused paragraphs", "A full character profile"]
  }
};

const workshopPrompts = Object.entries(WORKSHOP_PROMPTS).flatMap(([format, sources], formatIndex) => {
  const details = WORKSHOP_DETAILS[format];
  const roundFormat = ROUND_FORMATS.find((item) => item.id === format);
  return sources.map((source, index) => {
    const lengthIndex = (formatIndex + index) % LENGTHS.length;
    const length = LENGTHS[lengthIndex];
    return {
      id: `${format}-${index + 1}`,
      format,
      source,
      text: details.task,
      category: details.category,
      criteria: details.criteria,
      writingLabel: roundFormat.writingLabel,
      placeholder: roundFormat.placeholder,
      difficulty: ["accessible", "intermediate", "challenge"][(index + formatIndex) % 3],
      responseLength: length.responseLength,
      timerSeconds: length.timerSeconds,
      suggestion: details.suggestions[lengthIndex]
    };
  });
});

const prompts = [...storyPrompts, ...workshopPrompts];

module.exports = { prompts, categories: Object.keys(CATEGORIES), roundFormats: ROUND_FORMATS };
