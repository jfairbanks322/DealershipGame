const POOLS = {
  random: [
    "Chaotic but delightful", "Honestly kind of iconic", "Better than expected", "Hard pass forever",
    "Weirdly comforting somehow", "Always worth trying", "Funny from distance", "Depends on company",
    "Unreasonably strong opinions", "A necessary adventure", "Pure unpredictable energy", "Not my thing"
  ],
  nostalgia: [
    "Simpler happier times", "Sweet but complicated", "Feels like yesterday", "Warm fuzzy memories",
    "Mostly beautiful chaos", "Gone way too fast", "Better in memory", "Comforting and familiar",
    "A little bittersweet", "Core memory unlocked", "Would gladly revisit", "Time moved differently"
  ],
  life: [
    "Still figuring it", "Necessary but exhausting", "Worth the effort", "Balance matters most",
    "Easier said than done", "Learning every day", "Scary but rewarding", "Quietly very important",
    "Changes with time", "More complicated lately", "Needs honest reflection", "Absolutely worth protecting"
  ],
  relationships: [
    "Communication changes everything", "Beautiful when mutual", "Effort matters daily", "Trust comes first",
    "Complicated but worthwhile", "Actions over promises", "Patience honesty laughter", "Rare and precious",
    "Needs real intention", "Safety with sparks", "Respect makes magic", "Timing matters enormously"
  ],
  deep: [
    "Terrifying and necessary", "Changes everything eventually", "Hard to explain", "Worth thinking about",
    "Heavy but human", "Different for everyone", "Hope still matters", "The quiet truth",
    "Impossible to predict", "Love leaves echoes", "We keep going", "Meaning takes time"
  ],
  adult: [
    "Mutual trust first", "Better with communication", "Playful honest electric", "Connection changes everything",
    "Chemistry needs comfort", "Private and meaningful", "Exciting when mutual", "Boundaries make safety",
    "Confidence feels attractive", "Respect is essential", "Intention matters deeply", "Vulnerability with sparks"
  ]
};

function normalizedWords(value) {
  return String(value || "").toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
}

function hash(input) {
  let value = 2166136261;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function pickLocalFakes(topic, realAnswer) {
  const realWords = new Set(normalizedWords(realAnswer));
  const pool = POOLS[topic.category] || POOLS.life;
  const ranked = pool
    .filter((candidate) => normalizedWords(candidate).length === 3)
    .filter((candidate) => candidate.toLowerCase() !== String(realAnswer).toLowerCase())
    .map((candidate) => ({
      candidate,
      overlap: normalizedWords(candidate).filter((word) => realWords.has(word)).length,
      order: hash(`${topic.id}:${realAnswer}:${candidate}`)
    }))
    .sort((a, b) => a.overlap - b.overlap || a.order - b.order);

  return ranked.slice(0, 2).map((entry) => entry.candidate);
}

async function generateFakeAnswers(topic, realAnswer) {
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
        body: JSON.stringify({ topic: topic.text, category: topic.category, realAnswer })
      });
      if (response.ok) {
        const data = await response.json();
        const candidates = Array.isArray(data.answers) ? data.answers : [];
        const valid = candidates
          .map((answer) => String(answer || "").trim())
          .filter((answer) => normalizedWords(answer).length === 3)
          .filter((answer) => answer.toLowerCase() !== String(realAnswer).toLowerCase());
        if (new Set(valid.map((answer) => answer.toLowerCase())).size >= 2) {
          return [...new Map(valid.map((answer) => [answer.toLowerCase(), answer])).values()].slice(0, 2);
        }
      }
    } catch (error) {
      console.warn("External fake-answer service unavailable; using local fallback.", error.message);
    }
  }

  return pickLocalFakes(topic, realAnswer);
}

module.exports = { generateFakeAnswers, normalizedWords, pickLocalFakes };
