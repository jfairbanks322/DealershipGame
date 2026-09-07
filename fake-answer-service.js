const POOLS = {
  random: {
    positive: [
      "Surprisingly worth trying", "Honestly pretty delightful", "Unexpectedly very satisfying",
      "Always good company", "Way better together", "Absolutely worth experiencing",
      "Pure uncomplicated fun", "Strangely quite charming", "Low-key genuinely wonderful",
      "Instant mood booster", "Perfectly harmless entertainment", "Would happily repeat"
    ],
    negative: [
      "Hard pass forever", "Absolutely not happening", "Deeply overrated honestly",
      "Mostly unnecessary chaos", "Somehow always disappointing", "Better from afar",
      "Instant regret material", "Not remotely appealing", "Way too much",
      "Please just stop", "Actively ruins everything", "Never worth it"
    ],
    mixed: [
      "Depends on company", "Funny until inconvenient", "Good in theory",
      "Needlessly complicated somehow", "Interesting but exhausting", "Fine in moderation",
      "Context changes everything", "Sometimes weirdly comforting", "Equal parts delightful",
      "Could surprise me", "One-time experience only", "Memorable for sure"
    ],
    playful: [
      "Pure chaotic energy", "Main character behavior", "An acquired taste",
      "Iconic for reasons", "Unreasonably strong opinions", "Plot twist incoming",
      "Peak human weirdness", "Secretly rather brilliant", "Comedy writes itself",
      "Certified conversation starter", "Bold choice honestly", "Harmless little adventure"
    ]
  },
  nostalgia: {
    warm: [
      "Warm fuzzy memories", "Simpler happier times", "Would gladly revisit",
      "Comforting and familiar", "Still feels joyful", "Pure childhood magic",
      "Always feels special", "Beautifully frozen moments", "Happiness without effort",
      "Nothing felt better", "Forever worth remembering", "Home in miniature"
    ],
    bittersweet: [
      "Sweet but complicated", "A little bittersweet", "Gone too quickly",
      "Better in memory", "Beautiful and painful", "Happiness with edges",
      "Joy mixed sadness", "Feels strangely distant", "Miss those days",
      "Time changed everything", "Tender complicated memories", "Comfort with longing"
    ],
    playful: [
      "Core memory unlocked", "Mostly beautiful chaos", "Peak childhood energy",
      "Embarrassing but iconic", "Questionable fashion choices", "Zero adult supervision",
      "Pure weekend freedom", "Maximum sugar energy", "Definitely felt cooler",
      "Legendary family story", "Chaos worth remembering", "Tiny dramatic masterpiece"
    ],
    reflective: [
      "Feels like yesterday", "Time moved differently", "Everything seemed bigger",
      "We knew less", "Life felt slower", "Memory softens everything",
      "Some details vanished", "Growing up happened", "Never fully leaves",
      "Shaped me quietly", "Different person then", "Still feels important"
    ]
  },
  life: {
    optimistic: [
      "Worth the effort", "Learning every day", "Scary but rewarding",
      "Growth takes courage", "Better things ahead", "Progress over perfection",
      "Small steps matter", "Possibility feels exciting", "Absolutely worth protecting",
      "Keep moving forward", "Hard work compounds", "Choose hope anyway"
    ],
    cautious: [
      "Harder than expected", "Needs honest reflection", "Proceed with care",
      "Balance matters most", "Timing changes everything", "Risk needs purpose",
      "Boundaries protect peace", "Slow down first", "Consequences matter too",
      "Think before leaping", "Pressure distorts judgment", "Not always simple"
    ],
    honest: [
      "Still figuring it", "Necessary but exhausting", "More complicated lately",
      "Changes with time", "Depends on perspective", "Some days hurt",
      "Usually worth discussing", "Often deeply personal", "Everyone handles differently",
      "No perfect answer", "Context really matters", "Messy but manageable"
    ],
    driven: [
      "Discipline beats motivation", "Ambition needs balance", "Consistency creates results",
      "Goals need action", "Comfort limits growth", "Make it happen",
      "Earned not given", "Focus changes outcomes", "Keep standards high",
      "Patience builds momentum", "Failure teaches faster", "Confidence follows action"
    ]
  },
  relationships: {
    warm: [
      "Beautiful when mutual", "Trust comes first", "Rare and precious",
      "Safety with sparks", "Respect makes magic", "Love needs friendship",
      "Kindness matters daily", "Honesty builds closeness", "Laughter keeps lightness",
      "Softness feels brave", "Teamwork builds home", "Connection feels effortless"
    ],
    cautious: [
      "Actions over promises", "Timing matters enormously", "Mixed signals hurt",
      "Trust breaks quietly", "Boundaries need respect", "Chemistry cannot compensate",
      "Consistency reveals intentions", "Listen to patterns", "Jealousy needs honesty",
      "Pressure kills connection", "Resentment grows silently", "Avoiding issues backfires"
    ],
    practical: [
      "Communication changes everything", "Effort matters daily", "Needs real intention",
      "Complicated but worthwhile", "Patience honesty laughter", "Repair requires accountability",
      "Expectations need discussing", "Space can help", "Shared values matter",
      "Conflict needs kindness", "Apologies require change", "Partnership takes practice"
    ],
    playful: [
      "Flirting stays fun", "Inside jokes forever", "Best friend energy",
      "Cute until annoying", "Texting creates mysteries", "Date nights matter",
      "Steal their fries", "Laugh through awkwardness", "Sparks plus comfort",
      "Matching chaos levels", "Keep choosing fun", "Romance needs surprise"
    ]
  },
  deep: {
    hopeful: [
      "Hope still matters", "We keep going", "Healing remains possible",
      "Love leaves light", "Meaning grows slowly", "Tomorrow can change",
      "Grace makes room", "Courage survives fear", "People can rebuild",
      "Peace comes eventually", "Connection sustains us", "Light always returns"
    ],
    heavy: [
      "Heavy but human", "Terrifying and necessary", "Love leaves echoes",
      "Loss changes everything", "Some wounds linger", "Truth can hurt",
      "Grief moves strangely", "Fear speaks loudly", "Nothing stays forever",
      "Hard goodbyes remain", "Regret gets heavy", "Silence carries weight"
    ],
    reflective: [
      "Worth thinking about", "Different for everyone", "Meaning takes time",
      "The quiet truth", "Perspective changes answers", "No simple conclusion",
      "Life teaches slowly", "Memory shapes meaning", "Values reveal priorities",
      "Questions matter too", "Understanding takes patience", "We become stories"
    ],
    uncertain: [
      "Impossible to predict", "Hard to explain", "Nobody truly knows",
      "Maybe both things", "Certainty feels impossible", "Answers keep changing",
      "Depends what follows", "Still searching honestly", "Mystery remains intact",
      "Ask me later", "Somewhere between everything", "Words feel insufficient"
    ]
  },
  adult: {
    warm: [
      "Mutual trust first", "Connection changes everything", "Private and meaningful",
      "Exciting when mutual", "Vulnerability with sparks", "Comfort creates closeness",
      "Warmth plus chemistry", "Affection feels grounding", "Trust makes freedom",
      "Intimacy needs safety"
    ],
    cautious: [
      "Boundaries create safety", "Respect is essential", "Communication prevents confusion",
      "Consent stays central", "Pressure ruins everything", "Trust before intensity",
      "Clarity protects feelings", "Listen very carefully", "Comfort matters most",
      "Expectations need honesty"
    ],
    direct: [
      "Better with communication", "Chemistry needs comfort", "Intention matters deeply",
      "Confidence feels attractive", "Compatibility takes honesty", "Attraction needs substance",
      "Timing still matters", "Honesty makes closeness", "Everyone wants differently",
      "Connection beats performance"
    ],
    playful: [
      "Playful honest electric", "Sparks worth exploring", "Flirting builds anticipation",
      "Eye contact matters", "Confidence changes energy", "Tension can sparkle",
      "Keep things playful", "Slow can simmer", "Mystery adds excitement",
      "Laughter helps everything"
    ]
  }
};

function normalizedWords(value) {
  return String(value || "")
    .normalize("NFKC")
    .match(/[\p{L}\p{N}]+(?:['’\-‐‑–—][\p{L}\p{N}]+)*/gu) || [];
}

function normalizeAnswer(value) {
  const words = normalizedWords(value);
  if (words.length !== 3) return null;

  return words.map((word, index) => {
    let formatted = word
      .replace(/[’]/g, "'")
      .replace(/[‐‑–—]/g, "-")
      .toLocaleLowerCase("en-US")
      .replace(/^i(?='|$)/, "I");
    if (index === 0) formatted = formatted.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("en-US"));
    return formatted;
  }).join(" ");
}

function flattenPool(category) {
  const groups = POOLS[category] || POOLS.life;
  return Object.entries(groups).flatMap(([tone, answers]) =>
    answers.map((answer) => ({ tone, answer: normalizeAnswer(answer) }))
  ).filter((entry) => entry.answer);
}

function hash(input) {
  let value = 2166136261;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function sharedWordCount(first, second) {
  const firstWords = new Set(normalizedWords(first).map((word) => word.toLocaleLowerCase("en-US")));
  return normalizedWords(second)
    .map((word) => word.toLocaleLowerCase("en-US"))
    .filter((word) => firstWords.has(word)).length;
}

function pickLocalFakes(topic, realAnswer) {
  const formattedRealAnswer = normalizeAnswer(realAnswer) || String(realAnswer || "").trim();
  const ranked = flattenPool(topic.category)
    .filter((entry) => entry.answer.toLocaleLowerCase("en-US") !== formattedRealAnswer.toLocaleLowerCase("en-US"))
    .map((entry) => ({
      ...entry,
      overlap: sharedWordCount(formattedRealAnswer, entry.answer),
      order: hash(`${topic.id}:${formattedRealAnswer}:${entry.answer}`)
    }))
    .sort((first, second) => first.overlap - second.overlap || first.order - second.order);

  const first = ranked[0];
  const second = ranked.find((entry) =>
    entry.tone !== first?.tone && sharedWordCount(first?.answer || "", entry.answer) === 0
  ) || ranked.find((entry) => entry.tone !== first?.tone) || ranked[1];

  return [first?.answer, second?.answer].filter(Boolean);
}

async function generateFakeAnswers(topic, realAnswer) {
  const formattedRealAnswer = normalizeAnswer(realAnswer) || String(realAnswer || "").trim();
  const endpoint = process.env.FAKE_ANSWER_API_URL;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.FAKE_ANSWER_API_KEY
            ? { authorization: `Bearer ${process.env.FAKE_ANSWER_API_KEY}` }
            : {})
        },
        body: JSON.stringify({ topic: topic.text, category: topic.category, realAnswer: formattedRealAnswer })
      });
      if (response.ok) {
        const data = await response.json();
        const valid = (Array.isArray(data.answers) ? data.answers : [])
          .map(normalizeAnswer)
          .filter(Boolean)
          .filter((answer) => answer.toLocaleLowerCase("en-US") !== formattedRealAnswer.toLocaleLowerCase("en-US"));
        const unique = [...new Map(valid.map((answer) => [answer.toLocaleLowerCase("en-US"), answer])).values()];
        if (unique.length >= 2) return unique.slice(0, 2);
      }
    } catch (error) {
      console.warn("External fake-answer service unavailable; using local fallback.", error.message);
    }
  }

  return pickLocalFakes(topic, formattedRealAnswer);
}

function getPoolSizes() {
  return Object.fromEntries(Object.keys(POOLS).map((category) => [category, flattenPool(category).length]));
}

module.exports = {
  generateFakeAnswers,
  getPoolSizes,
  normalizeAnswer,
  normalizedWords,
  pickLocalFakes
};
