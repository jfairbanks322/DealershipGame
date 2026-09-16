const QUESTION_GROUPS = {
  absurd: [
    { prompt: "Live with one deeply inconvenient feature…", options: ["Permanent clown shoes", "A personal fog machine", "A laugh-track entrance", "Glittery sneezes"] },
    { prompt: "Be followed everywhere by…", options: ["One dramatic goose", "A tiny marching band", "Three curious raccoons", "A judgmental mime"] },
    { prompt: "Replace your normal voice with…", options: ["A movie-trailer voice", "A tiny robot voice", "An opera voice", "A pirate whisper"] },
    { prompt: "Wake up tomorrow as…", options: ["A house cat", "A garden gnome", "A very smart pigeon", "A celebrity's dog"] },
    { prompt: "Have to wear one theme forever…", options: ["Disco cowboy", "Fancy wizard", "Tropical detective", "Victorian athlete"] },
    { prompt: "Discover your home is secretly…", options: ["A low-budget spaceship", "A wizard's waiting room", "A reality-show set", "A polite monster's lair"] },
    { prompt: "Gain one useless talent…", options: ["Perfectly fold fitted sheets", "Guess any dog's name", "Speak fluent dolphin", "Juggle only potatoes"] },
    { prompt: "Be dramatically announced by…", options: ["A royal trumpet", "A wrestling commentator", "A choir of children", "A nervous town crier"] },
    { prompt: "Spend a week trapped inside…", options: ["A giant furniture store", "A theme park after dark", "A luxury pet hotel", "A medieval castle gift shop"] },
    { prompt: "Turn into one object when startled…", options: ["A traffic cone", "A beanbag chair", "A garden flamingo", "A vending machine"] }
  ],
  food: [
    { prompt: "Eat one chaotic pizza topping…", options: ["Gummy bears", "Breakfast cereal", "Pickles and honey", "Mac and cheese"] },
    { prompt: "Drink everything for a month from…", options: ["A baby bottle", "A soup ladle", "A fancy goblet", "A giant novelty straw"] },
    { prompt: "Have every meal served…", options: ["On a tiny plate", "As a sandwich", "Inside a bread bowl", "On a spinning tray"] },
    { prompt: "Live in a world where it rains…", options: ["Popcorn", "Mashed potatoes", "Cold spaghetti", "Whipped cream"] },
    { prompt: "Smell permanently like…", options: ["Fresh cookies", "Movie-theater popcorn", "Garlic bread", "Maple syrup"] },
    { prompt: "Compete on a cooking show using only…", options: ["Gas-station snacks", "Breakfast leftovers", "Foods shaped like circles", "Ingredients chosen by a child"] },
    { prompt: "Replace birthday cake with…", options: ["A nacho tower", "A giant pancake", "A mountain of fries", "One enormous dumpling"] },
    { prompt: "Have a kitchen appliance that only makes…", options: ["Perfect toast", "Endless queso", "Tiny pancakes", "One flawless meatball"] },
    { prompt: "Attend a formal dinner where everyone must…", options: ["Eat with tongs", "Wear lobster bibs", "Narrate every bite", "Trade plates every minute"] },
    { prompt: "Let one condiment become a personality trait…", options: ["Spicy mustard", "Ranch dressing", "Hot sauce", "Fancy mayonnaise"] }
  ],
  socialChaos: [
    { prompt: "Accidentally send your boss…", options: ["A dramatic breakup text", "A blurry foot photo", "A voice note of you singing", "A mysterious single emoji"] },
    { prompt: "Enter every party by…", options: ["Doing a cartwheel", "Introducing an imaginary friend", "Announcing a fake award", "Starting a conga line"] },
    { prompt: "Get caught doing one thing in public…", options: ["Practicing an acceptance speech", "Arguing with a mannequin", "Dancing with headphones on", "Rehearsing a fake accent"] },
    { prompt: "Have your phone autocorrect every message into…", options: ["Pirate slang", "Corporate jargon", "Romantic poetry", "Passive-aggressive compliments"] },
    { prompt: "Go viral for…", options: ["Falling very gracefully", "A confused interview", "Inventing a bad dance", "Reviewing your own cooking"] },
    { prompt: "Be forced to end every conversation with…", options: ["Finger guns", "A deep bow", "A magic trick", "A whispered catchphrase"] },
    { prompt: "Host a dinner party for…", options: ["Your childhood teachers", "Ten amateur magicians", "Your exes' parents", "A room of professional clowns"] },
    { prompt: "Let your partner choose your…", options: ["Profile picture for a year", "Karaoke song tonight", "Nickname at work", "Outfit for a reunion"] },
    { prompt: "Have everyone hear one sound when you lie…", options: ["A sad trombone", "A microwave beep", "A goat scream", "A game-show buzzer"] },
    { prompt: "Spend a day communicating only through…", options: ["Charades", "Song lyrics", "Sticky notes", "Animal impressions"] }
  ],
  weirdPowers: [
    { prompt: "Choose one underwhelming superpower…", options: ["Warm any chair", "Summon exact change", "Never lose a sock", "Know when toast is ready"] },
    { prompt: "Teleport, but only to…", options: ["Public libraries", "Hotel lobbies", "Any parking lot", "Places with a fountain"] },
    { prompt: "Read the mind of…", options: ["Houseplants", "Babies", "Dogs at the park", "People choosing snacks"] },
    { prompt: "Control one oddly specific thing…", options: ["Elevator music", "Traffic-cone placement", "Fortune-cookie messages", "The temperature of pillows"] },
    { prompt: "Pause time only while…", options: ["Brushing your teeth", "Holding a banana", "Standing in line", "Wearing sunglasses indoors"] },
    { prompt: "Become invisible whenever…", options: ["You hiccup", "Someone says your name", "You eat cheese", "You feel embarrassed"] },
    { prompt: "Talk to one category of object…", options: ["Old furniture", "Vending machines", "Shoes", "Kitchen appliances"] },
    { prompt: "Always know…", options: ["The nearest clean bathroom", "Who took the last snack", "When someone needs a nap", "Which checkout line is fastest"] },
    { prompt: "Summon one thing once a day…", options: ["A warm towel", "A perfect taco", "A dramatic cape", "A very supportive duck"] },
    { prompt: "Change the weather, but only to…", options: ["Light confetti", "Gentle bubbles", "Warm breezes", "Cinematic fog"] }
  ],
  randomLife: [
    { prompt: "Replace your car horn with…", options: ["A polite cough", "A dolphin noise", "A tiny applause", "Your own voice saying hello"] },
    { prompt: "Use one ridiculous bed forever…", options: ["A giant hamburger", "A race car", "A pirate ship", "A floating cloud"] },
    { prompt: "Adopt a household pet with a job…", options: ["A cat accountant", "A dog therapist", "A parrot receptionist", "A hamster security guard"] },
    { prompt: "Make one object enormous…", options: ["Your coffee mug", "Your bathtub", "Your couch", "Your umbrella"] },
    { prompt: "Spend a year living in…", options: ["A converted lighthouse", "A fancy treehouse", "A retired airplane", "A giant shoe"] },
    { prompt: "Have one soundtrack follow your life…", options: ["Sitcom music", "Epic movie score", "Smooth jazz", "Video-game sound effects"] },
    { prompt: "Get one questionable luxury…", options: ["A butler for your pets", "A bedroom snack bar", "A personal bubble machine", "A chauffeur-driven golf cart"] },
    { prompt: "Celebrate a new national holiday for…", options: ["Naps", "Breakfast for dinner", "Bad puns", "Wearing pajamas outside"] },
    { prompt: "Make one tiny inconvenience dramatic…", options: ["Opening mail", "Choosing a show", "Taking out trash", "Finding matching socks"] },
    { prompt: "Have your future predicted by…", options: ["A talking goldfish", "A haunted toaster", "A suspicious fortune cookie", "A very confident toddler"] }
  ]
};

const CATEGORY_IDS = {
  absurd: "absurd",
  food: "food-chaos",
  socialChaos: "social-chaos",
  weirdPowers: "weird-powers",
  randomLife: "random-life"
};

module.exports = Object.entries(QUESTION_GROUPS).flatMap(([group, questions]) => {
  const category = CATEGORY_IDS[group];
  return questions.map((question, questionIndex) => {
    const id = `silly-${category}-${String(questionIndex + 1).padStart(3, "0")}`;
    return {
      id,
      category,
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({
        id: `${id}-${String.fromCharCode(97 + optionIndex)}`,
        text
      }))
    };
  });
});
