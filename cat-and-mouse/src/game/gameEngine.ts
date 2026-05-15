import {
  clueLibrary,
  detectiveActionDeck,
  entryMethods,
  motives,
  murdererDecisionDeck,
  relationships,
  weaponMethods
} from "./gameData";
import {
  CaseRound,
  Clue,
  DetectiveAction,
  FinalAccusation,
  GameResult,
  GameState,
  HiddenValues,
  MurdererChoice,
  Relationship
} from "./types";

const emptyHidden: HiddenValues = {
  evidenceGenerated: 0,
  suspicion: 0,
  timelineRisk: 0,
  witnessRisk: 0,
  cleanupScore: 0,
  misdirectionScore: 0
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const unique = <T,>(items: T[]) => Array.from(new Set(items));

const addHidden = (left: HiddenValues, right: HiddenValues): HiddenValues => ({
  evidenceGenerated: left.evidenceGenerated + right.evidenceGenerated,
  suspicion: left.suspicion + right.suspicion,
  timelineRisk: left.timelineRisk + right.timelineRisk,
  witnessRisk: left.witnessRisk + right.witnessRisk,
  cleanupScore: left.cleanupScore + right.cleanupScore,
  misdirectionScore: left.misdirectionScore + right.misdirectionScore
});

export const getMurdererDecisionCards = () => murdererDecisionDeck.slice(0, 5);
export const getDetectiveActionCards = () => detectiveActionDeck;

export function createNewGame(): GameState {
  const murdererRelationship = pick(relationships);
  const murdererMotive = pick(motives);
  const relationshipPossibilities = unique([murdererRelationship, pick(relationships), pick(relationships), pick(relationships)]);

  return {
    id: `case-${Date.now()}`,
    phase: "roleAssignment",
    currentRole: "murderer",
    roundNumber: 1,
    maxRounds: 3,
    murdererRelationship,
    murdererMotive,
    hidden: { ...emptyHidden },
    rounds: [],
    discoveredClues: [],
    suspicionMeter: 8,
    timelineConfidence: 12,
    relationshipPossibilities,
    motivePossibilities: unique([pick(motives), pick(motives), pick(motives)])
  };
}

export function applyMurdererChoices(game: GameState, choices: MurdererChoice[]): GameState {
  const nextHidden = choices.reduce((hidden, choice) => addHidden(hidden, choice.effects), game.hidden);
  const entryChoice = choices.find((choice) => choice.category === "entry");
  const methodChoice = choices.find((choice) => choice.category === "method");
  const currentRound: CaseRound = {
    roundNumber: game.roundNumber,
    murdererChoices: choices,
    detectiveActions: [],
    revealedClueIds: []
  };

  return {
    ...game,
    currentRole: "detective",
    phase: "passDevice",
    entryMethod: entryChoice?.label ?? game.entryMethod,
    weaponMethod: methodChoice?.label ?? game.weaponMethod,
    hidden: {
      evidenceGenerated: clamp(nextHidden.evidenceGenerated),
      suspicion: clamp(nextHidden.suspicion),
      timelineRisk: clamp(nextHidden.timelineRisk),
      witnessRisk: clamp(nextHidden.witnessRisk),
      cleanupScore: clamp(nextHidden.cleanupScore),
      misdirectionScore: clamp(nextHidden.misdirectionScore)
    },
    rounds: [...game.rounds, currentRound]
  };
}

export function applyDetectiveActions(game: GameState, actions: DetectiveAction[]): GameState {
  const revealed = revealClues(game, actions);
  const discoveredClues = mergeClues(game.discoveredClues, revealed);
  const latestRound = game.rounds[game.rounds.length - 1];
  const updatedRounds = game.rounds.map((round) =>
    round === latestRound
      ? {
          ...round,
          detectiveActions: actions,
          revealedClueIds: revealed.map((clue) => clue.id)
        }
      : round
  );

  const baseSuspicion = actions.reduce((total, action) => total + action.suspicionDelta, game.suspicionMeter);
  const clueSuspicion = revealed.length * 5 + Math.floor(game.hidden.suspicion / 8);
  const timelineConfidence = clamp(
    game.timelineConfidence + actions.filter((action) => action.pressure === "timelineRisk").length * 12 + Math.floor(game.hidden.timelineRisk / 7)
  );
  const nextRound = game.roundNumber + 1;
  const shouldAccuse = nextRound > game.maxRounds;

  return {
    ...game,
    phase: shouldAccuse ? "finalAccusation" : "passDevice",
    currentRole: shouldAccuse ? "detective" : "murderer",
    roundNumber: shouldAccuse ? game.roundNumber : nextRound,
    rounds: updatedRounds,
    discoveredClues,
    suspicionMeter: clamp(baseSuspicion + clueSuspicion - Math.floor(game.hidden.misdirectionScore / 10)),
    timelineConfidence,
    relationshipPossibilities: updateRelationshipPossibilities(game, discoveredClues),
    motivePossibilities: unique([
      ...game.motivePossibilities,
      ...discoveredClues
        .map((clue) => clue.reveals?.motive)
        .filter((motive): motive is NonNullable<typeof motive> => Boolean(motive))
    ])
  };
}

function revealClues(game: GameState, actions: DetectiveAction[]): Clue[] {
  const selectedTags = unique(actions.flatMap((action) => action.clueTags));
  const murdererTags = unique(game.rounds.flatMap((round) => round.murdererChoices.flatMap((choice) => choice.clueTags)));
  const alreadyFound = new Set(game.discoveredClues.map((clue) => clue.id));
  const pressure = actions.reduce((total, action) => total + game.hidden[action.pressure], 0) / Math.max(actions.length, 1);
  const uncertainty = Math.floor(Math.random() * 16);
  const revealBudget = clamp(Math.floor((pressure + game.hidden.evidenceGenerated - game.hidden.cleanupScore / 2 + uncertainty) / 22), 1, 4);

  return clueLibrary
    .filter((clue) => !alreadyFound.has(clue.id))
    .filter((clue) => clue.tags.some((tag) => selectedTags.includes(tag) && murdererTags.includes(tag)))
    .sort((left, right) => scoreClue(right, game, selectedTags) - scoreClue(left, game, selectedTags))
    .slice(0, revealBudget)
    .map((clue) => personalizeClue(clue, game));
}

function scoreClue(clue: Clue, game: GameState, selectedTags: string[]) {
  const tagMatch = clue.tags.filter((tag) => selectedTags.includes(tag)).length * 10;
  const motiveBoost = clue.reveals?.motive === game.murdererMotive ? 12 : 0;
  const relationBoost = clue.reveals?.relationship === game.murdererRelationship ? 12 : 0;
  return tagMatch + motiveBoost + relationBoost + Math.floor(Math.random() * 8);
}

function personalizeClue(clue: Clue, game: GameState): Clue {
  if (clue.id === "relationship-thread") {
    return {
      ...clue,
      body: `The victim's recent messages point toward a private conflict with a ${game.murdererRelationship.toLowerCase()}.`,
      reveals: { ...clue.reveals, relationship: game.murdererRelationship }
    };
  }

  if (clue.id === "motive-pressure") {
    return {
      ...clue,
      body: `Notes in the victim's case folder suggest the pressure point was ${game.murdererMotive.toLowerCase()}.`,
      reveals: { ...clue.reveals, motive: game.murdererMotive }
    };
  }

  if (clue.id === "entry-truth") {
    return {
      ...clue,
      body: `The scene is most consistent with ${game.entryMethod?.toLowerCase() ?? "the chosen entry method"}, not the first story.`,
      reveals: { ...clue.reveals, entryMethod: game.entryMethod }
    };
  }

  if (clue.id === "method-truth") {
    return {
      ...clue,
      body: `The injury pattern points toward ${game.weaponMethod?.toLowerCase() ?? "the chosen method"}.`,
      reveals: { ...clue.reveals, weaponMethod: game.weaponMethod }
    };
  }

  return clue;
}

function mergeClues(existing: Clue[], incoming: Clue[]) {
  const clueMap = new Map(existing.map((clue) => [clue.id, clue]));
  incoming.forEach((clue) => clueMap.set(clue.id, clue));
  return Array.from(clueMap.values());
}

function updateRelationshipPossibilities(game: GameState, clues: Clue[]): Relationship[] {
  const foundRelationship = clues.find((clue) => clue.reveals?.relationship)?.reveals?.relationship;
  if (!foundRelationship) {
    return game.relationshipPossibilities;
  }
  return unique([foundRelationship, ...game.relationshipPossibilities]);
}

export function scoreFinalAccusation(game: GameState, accusation: FinalAccusation): GameState {
  let score = 0;
  const recap: string[] = [];

  if (accusation.relationship === game.murdererRelationship) {
    score += 25;
    recap.push("The Detective identified the true relationship.");
  }
  if (accusation.motive === game.murdererMotive) {
    score += 25;
    recap.push("The motive was correctly pinned down.");
  }
  if (accusation.entryMethod === game.entryMethod) {
    score += 20;
    recap.push("The entry story matched the physical scene.");
  }
  if (accusation.weaponMethod === game.weaponMethod) {
    score += 20;
    recap.push("The method matched the forensic read.");
  }

  const evidenceBonus = Math.floor(game.discoveredClues.length * 3 + game.suspicionMeter / 10 + game.timelineConfidence / 12);
  score = clamp(score + evidenceBonus, 0, 100);

  const outcome: GameResult["outcome"] = score >= 78 ? "detective-win" : score >= 48 ? "partial-solve" : "murderer-win";
  const result: GameResult = {
    outcome,
    score,
    summary:
      outcome === "detective-win"
        ? "The Detective built a tight enough case to break the cover story."
        : outcome === "partial-solve"
          ? "The case lands with real answers, but the cover story leaves room for doubt."
          : "The Murderer preserved enough uncertainty to walk away from the accusation.",
    missedClues: getMissedClues(game),
    recap: recap.length ? recap : ["The final theory missed the strongest connective tissue in the case."]
  };

  return {
    ...game,
    phase: "results",
    finalAccusation: accusation,
    result
  };
}

function getMissedClues(game: GameState): Clue[] {
  const found = new Set(game.discoveredClues.map((clue) => clue.id));
  return clueLibrary
    .filter((clue) => !found.has(clue.id))
    .filter((clue) => clue.tags.some((tag) => ["motive", "relationship", "entry", "method", "timeline"].includes(tag)))
    .slice(0, 4);
}
