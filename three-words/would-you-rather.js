const QUESTION_GROUPS = {
  play: [
    { prompt: "Spend a surprise free evening doing…", options: ["Karaoke night", "Arcade games", "Trivia at a bar", "A movie marathon"] },
    { prompt: "Enter a couples competition in…", options: ["Mini golf", "A bake-off", "An escape room", "A dance battle"] },
    { prompt: "Become internet-famous for…", options: ["A dance trend", "A cooking disaster", "A pet video", "A bizarre interview"] },
    { prompt: "Adopt an unusual household mascot…", options: ["A tiny goat", "A chatty parrot", "A sleepy duck", "A miniature horse"] },
    { prompt: "Commit to one ridiculous tradition…", options: ["Matching costumes", "Weekly theme dinners", "A secret handshake", "Annual talent shows"] },
    { prompt: "Only eat one snack style for a month…", options: ["Sweet treats", "Salty crunch", "Spicy snacks", "Breakfast foods"] },
    { prompt: "Be known at every party as…", options: ["The perfect host", "The dance starter", "The funny storyteller", "The early escape artist"] },
    { prompt: "Take on a silly weekend challenge…", options: ["Thrift-store outfits", "No-phone scavenger hunt", "Amateur improv class", "Mystery recipe night"] },
    { prompt: "Control one thing on every road trip…", options: ["The playlist", "The snack supply", "The scenic detours", "The arrival time"] },
    { prompt: "Receive a surprise gift that is…", options: ["Handmade", "Practical", "A total prank", "A mystery experience"] },
    { prompt: "Choose the comedy style that always wins…", options: ["Dry and clever", "Chaotic and loud", "Goofy and wholesome", "Dark and unexpected"] },
    { prompt: "Spend a rainy day building…", options: ["A blanket fort", "An enormous puzzle", "A ridiculous cake", "A living-room obstacle course"] }
  ],
  everyday: [
    { prompt: "Make your shared home feel…", options: ["Cozy and calm", "Clean and minimal", "Colorful and creative", "Busy and social"] },
    { prompt: "Start a perfect Saturday by…", options: ["Sleeping in", "Getting outside early", "Making a big breakfast", "Finishing errands first"] },
    { prompt: "Handle dinner on a tired night with…", options: ["Takeout favorites", "A simple home meal", "Leftovers", "Snacks pretending to be dinner"] },
    { prompt: "Split household chores by…", options: ["A fixed schedule", "Whoever notices first", "Favorite and least-favorite jobs", "Doing everything together"] },
    { prompt: "Use an unexpected $500 for…", options: ["A weekend away", "Something for the home", "Savings", "A memorable dinner"] },
    { prompt: "Recharge after a packed week by…", options: ["Staying completely home", "Seeing close friends", "Exploring somewhere new", "Tackling a project"] },
    { prompt: "Plan important things with…", options: ["A detailed calendar", "A loose outline", "Last-minute decisions", "One planner taking the lead"] },
    { prompt: "Keep in touch during a busy day through…", options: ["Quick texts", "Funny photos", "A lunch call", "Catching up at night"] },
    { prompt: "Create maximum comfort with…", options: ["Soft blankets", "Favorite food", "Perfect music", "A spotless room"] },
    { prompt: "Reset after a minor disagreement by…", options: ["Talking immediately", "Taking quiet time", "Using humor", "Doing something kind first"] },
    { prompt: "Turn errands into…", options: ["A speed run", "A casual outing", "Separate missions", "An excuse for treats"] },
    { prompt: "Protect one daily ritual no matter what…", options: ["Morning coffee", "Dinner together", "An evening walk", "Bedtime conversation"] }
  ],
  adventure: [
    { prompt: "Book the next dream trip to…", options: ["A tropical beach", "A huge city", "A quiet mountain town", "A historic countryside"] },
    { prompt: "Travel somewhere new by…", options: ["Road trip", "Overnight train", "Quick flight", "Cruise ship"] },
    { prompt: "Try one adrenaline activity together…", options: ["Skydiving", "Whitewater rafting", "Zip-lining", "Roller coasters"] },
    { prompt: "Spend a night outdoors in…", options: ["A tent", "A cozy cabin", "A camper van", "A treehouse"] },
    { prompt: "Explore a new city by…", options: ["Following a food tour", "Wandering without a plan", "Visiting every landmark", "Asking locals for ideas"] },
    { prompt: "Say yes to a surprise that involves…", options: ["Concert tickets", "A mystery flight", "A new class", "A last-minute party"] },
    { prompt: "Live somewhere completely different for…", options: ["One month", "Six months", "A full year", "The rest of your life"] },
    { prompt: "Choose a vacation pace that is…", options: ["Packed with plans", "Mostly relaxing", "Half planned, half open", "Entirely spontaneous"] },
    { prompt: "Chase one natural wonder…", options: ["The northern lights", "A total eclipse", "A volcano", "A giant waterfall"] },
    { prompt: "Learn an adventurous skill together…", options: ["Scuba diving", "Skiing", "Sailing", "Rock climbing"] },
    { prompt: "Take the scenic route if it adds…", options: ["Thirty minutes", "Two hours", "A full day", "Never—get there fast"] },
    { prompt: "Choose a once-in-a-lifetime view from…", options: ["A mountain peak", "A hot-air balloon", "A glass-bottom boat", "A rooftop at midnight"] }
  ],
  connection: [
    { prompt: "Feel most loved through…", options: ["Thoughtful words", "Undivided time", "Helpful actions", "Physical affection"] },
    { prompt: "Celebrate an anniversary with…", options: ["A fancy night out", "A meaningful trip", "A quiet night in", "Recreating a first date"] },
    { prompt: "Receive an apology that begins with…", options: ["I understand why", "I was wrong", "How can I fix this", "I want to listen"] },
    { prompt: "Get support after a terrible day through…", options: ["Advice and solutions", "A long hug", "Space to decompress", "A welcome distraction"] },
    { prompt: "Have an important relationship check-in…", options: ["On a regular schedule", "Whenever something feels off", "During a walk", "Over a relaxed dinner"] },
    { prompt: "Work through conflict by…", options: ["Talking it out now", "Writing thoughts first", "Taking a short break", "Finding the compromise"] },
    { prompt: "Build closeness most easily through…", options: ["Deep conversation", "Shared adventures", "Everyday routines", "Laughing together"] },
    { prompt: "Make a big shared decision by…", options: ["Listing pros and cons", "Following instinct", "Taking turns leading", "Waiting until both agree"] },
    { prompt: "Keep a favorite relationship memory as…", options: ["A framed photo", "A handwritten story", "A saved souvenir", "A private tradition"] },
    { prompt: "Spend social time as a couple with…", options: ["One close pair", "A big friend group", "Family", "Mostly just each other"] },
    { prompt: "Show everyday affection with…", options: ["Frequent compliments", "Small surprises", "Casual touch", "Doing helpful things"] },
    { prompt: "Balance togetherness and space by…", options: ["Sharing most free time", "Planning separate hobbies", "Checking in day by day", "Keeping one solo night weekly"] }
  ],
  future: [
    { prompt: "Picture an ideal long-term home in…", options: ["A lively city", "A quiet suburb", "A small town", "The countryside"] },
    { prompt: "Prioritize extra income toward…", options: ["Financial security", "Travel and experiences", "A dream home", "Helping family"] },
    { prompt: "Build a future that feels…", options: ["Stable and peaceful", "Ambitious and exciting", "Flexible and spontaneous", "Rooted in community"] },
    { prompt: "Take a major career opportunity that requires…", options: ["Moving far away", "Working longer hours", "Starting over", "Temporary long distance"] },
    { prompt: "Create future family traditions around…", options: ["Holiday gatherings", "Annual trips", "Weekly meals", "Community service"] },
    { prompt: "Approach a risky shared dream by…", options: ["Going all in", "Saving first", "Testing it gradually", "Keeping it a hobby"] },
    { prompt: "Imagine retirement spent…", options: ["Traveling constantly", "Near family", "Running a passion project", "Somewhere warm and quiet"] },
    { prompt: "Choose the most important thing to pass on…", options: ["Financial stability", "Strong values", "Family stories", "A spirit of adventure"] },
    { prompt: "Face getting older by…", options: ["Planning carefully", "Staying curious", "Prioritizing health", "Taking life as it comes"] },
    { prompt: "Make room for children in the future by…", options: ["Definitely parenting", "Possibly parenting", "Building chosen family", "Keeping life child-free"] },
    { prompt: "Define a successful life together by…", options: ["Feeling deeply connected", "Creating financial freedom", "Making a difference", "Collecting great experiences"] },
    { prompt: "Set the pace for your next big chapter by…", options: ["Moving quickly", "Planning for a year", "Waiting for the right feeling", "Letting circumstances decide"] }
  ]
};

const WOULD_YOU_RATHER_QUESTIONS = Object.entries(QUESTION_GROUPS).flatMap(([category, questions]) =>
  questions.map((question, questionIndex) => {
    const id = `${category}-${String(questionIndex + 1).padStart(3, "0")}`;
    return {
      id,
      category,
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({
        id: `${id}-${String.fromCharCode(97 + optionIndex)}`,
        text
      }))
    };
  })
);

module.exports = WOULD_YOU_RATHER_QUESTIONS;
