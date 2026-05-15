export type PlayerRole = "murderer" | "detective";

export type Relationship =
  | "Ex-spouse"
  | "Coworker"
  | "Neighbor"
  | "Business partner"
  | "Sibling"
  | "Roommate"
  | "Secret affair"
  | "Former friend";

export type Motive =
  | "Revenge"
  | "Jealousy"
  | "Financial gain"
  | "Blackmail"
  | "Fear of exposure"
  | "Rage"
  | "Cover-up"
  | "Inheritance";

export type ChoiceCategory = "entry" | "method" | "cleanup" | "staging" | "alibi";
export type DetectiveCategory = "scene" | "forensics" | "witnesses" | "records";

export type HiddenValues = {
  evidenceGenerated: number;
  suspicion: number;
  timelineRisk: number;
  witnessRisk: number;
  cleanupScore: number;
  misdirectionScore: number;
};

export type MurdererChoice = {
  id: string;
  category: ChoiceCategory;
  label: string;
  description: string;
  effects: HiddenValues;
  clueTags: string[];
  tradeoff: string;
};

export type DetectiveAction = {
  id: string;
  category: DetectiveCategory;
  label: string;
  description: string;
  pressure: keyof HiddenValues;
  clueTags: string[];
  suspicionDelta: number;
};

export type Clue = {
  id: string;
  title: string;
  body: string;
  kind: "physical" | "forensic" | "witness" | "timeline" | "motive" | "misdirection";
  tags: string[];
  reveals?: {
    relationship?: Relationship;
    motive?: Motive;
    entryMethod?: string;
    weaponMethod?: string;
  };
  missedReason?: string;
};

export type CaseRound = {
  roundNumber: number;
  murdererChoices: MurdererChoice[];
  detectiveActions: DetectiveAction[];
  revealedClueIds: string[];
};

export type FinalAccusation = {
  relationship: Relationship | "";
  motive: Motive | "";
  entryMethod: string;
  weaponMethod: string;
};

export type GameResult = {
  outcome: "murderer-win" | "detective-win" | "partial-solve";
  score: number;
  summary: string;
  missedClues: Clue[];
  recap: string[];
};

export type TurnPhase =
  | "home"
  | "roleAssignment"
  | "passDevice"
  | "murdererTurn"
  | "detectiveTurn"
  | "caseFile"
  | "finalAccusation"
  | "results";

export type GameState = {
  id: string;
  phase: TurnPhase;
  currentRole: PlayerRole;
  roundNumber: number;
  maxRounds: number;
  murdererRelationship: Relationship;
  murdererMotive: Motive;
  entryMethod?: string;
  weaponMethod?: string;
  hidden: HiddenValues;
  rounds: CaseRound[];
  discoveredClues: Clue[];
  suspicionMeter: number;
  timelineConfidence: number;
  relationshipPossibilities: Relationship[];
  motivePossibilities: Motive[];
  finalAccusation?: FinalAccusation;
  result?: GameResult;
};
