const TOPIC_GROUPS = {
  random: [
    "Gas station food", "Crocs", "Karaoke", "Aliens", "Bad tattoos", "Road trips",
    "Pineapple on pizza", "Reality TV", "Weird smells", "Being late", "Your phone battery",
    "Squirrels", "Fast food", "Public bathrooms", "Roller coasters", "Group chats",
    "Tiny spoons", "Hotel breakfasts", "Unnecessary sequels", "Fancy water", "Theme parks",
    "Parallel parking", "Midnight snacks", "Celebrity impressions", "Elevator music", "Airport security",
    "Board games", "Matching outfits", "Voice messages", "Grocery shopping", "Rainy weekends",
    "Bad haircuts", "Spicy food", "Fortune cookies", "Online reviews", "Garage sales",
    "Escape rooms", "Dance floors", "Pet costumes", "Long lines", "Awkward silences",
    "Inside jokes", "Conspiracy theories", "Unexpected naps", "People watching"
  ],
  nostalgia: [
    "Childhood summers", "School lunches", "First car", "Childhood bedroom", "Saturday mornings",
    "High school", "Family vacations", "Childhood friends", "Favorite toys", "Your hometown",
    "First concert", "Teenage years", "Snow days", "Sleepovers", "School dances",
    "Birthday parties", "Old cartoons", "Your first job", "Family traditions", "Summer camp",
    "The school bus", "Arcade games", "Handwritten notes", "Childhood fears", "Old photographs",
    "Holiday mornings", "Neighborhood games", "Favorite teacher", "First crush", "Mall culture",
    "Mixtapes", "Landline phones", "Video stores", "Field trips", "Childhood chores",
    "After-school snacks", "Old family car", "Prom night", "College days", "First apartment",
    "Concert tickets", "Yearbook photos", "Family recipes", "Childhood pets", "Early internet"
  ],
  life: [
    "Success", "Failure", "Confidence", "Being alone", "Social media", "Money", "Work",
    "Ambition", "Getting older", "Happiness", "Stress", "Change", "Risk", "Routine",
    "Forgiveness", "Free time", "Self discipline", "Starting something", "Quitting something",
    "Your reputation", "Making decisions", "Personal style", "Being misunderstood", "Competition",
    "Giving advice", "Taking advice", "Leadership", "Creative people", "Making mistakes",
    "A perfect day", "Your comfort zone", "Big cities", "Small towns", "Being spontaneous",
    "Keeping secrets", "Meeting strangers", "Learning new things", "Your best quality", "Patience",
    "Asking for help", "Making plans", "Canceling plans", "Sunday evenings", "Your dream job",
    "Waking up early"
  ],
  relationships: [
    "Trust", "Jealousy", "Love", "Dating", "Marriage", "Commitment", "Flirting", "Chemistry",
    "First dates", "Texting", "Being ignored", "Exes", "Red flags", "Green flags",
    "Vulnerability", "Affection", "Arguments", "Apologies", "Living together",
    "Long-distance relationships", "Meeting the family", "Shared finances", "Pet names",
    "Double dates", "Quality time", "Giving gifts", "Receiving compliments", "Mixed signals",
    "Emotional availability", "Relationship advice", "Being protective", "Making up",
    "Date nights", "Sharing food", "Remembering birthdays", "Public proposals", "Couples costumes",
    "Different schedules", "Personal space", "Old love letters", "The friend zone", "Blind dates",
    "Mutual friends", "Keeping in touch", "Falling in love"
  ],
  deep: [
    "Regret", "Your biggest fear", "Second chances", "Family", "Loneliness", "Trusting someone",
    "The future", "Having children", "Growing old", "Losing someone", "Starting over", "Home",
    "What matters most", "Feeling understood", "Life after death", "A meaningful life",
    "Personal legacy", "Changing your mind", "Being remembered", "Inner peace", "Moral courage",
    "The truth", "Sacrifice", "Belonging", "Grief", "Hope", "Finding purpose", "Chosen family",
    "Breaking patterns", "Feeling safe", "Unconditional love", "Your younger self", "Your future self",
    "A hard goodbye", "Being enough", "Life priorities", "Emotional honesty", "A fresh start",
    "Keeping promises", "Feeling proud", "Being vulnerable", "Making amends", "Fate", "Free will",
    "What home means"
  ],
  adult: [
    "Sexual chemistry", "Physical attraction", "Kissing", "Intimacy", "Turn-ons",
    "Sleeping together", "Casual dating", "Sexual compatibility", "Attraction",
    "Relationship boundaries", "PDA", "Making the first move", "Romantic tension",
    "Private affection", "Morning after"
  ]
};

const TOPICS = Object.entries(TOPIC_GROUPS).flatMap(([category, items]) =>
  items.map((text, index) => ({
    id: `${category}-${String(index + 1).padStart(3, "0")}`,
    text,
    category,
    adultTopic: category === "adult",
    active: true
  }))
);

module.exports = TOPICS;
