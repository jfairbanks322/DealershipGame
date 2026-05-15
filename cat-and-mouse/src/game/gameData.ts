import { Clue, DetectiveAction, Motive, MurdererChoice, Relationship } from "./types";

export const relationships: Relationship[] = [
  "Ex-spouse",
  "Coworker",
  "Neighbor",
  "Business partner",
  "Sibling",
  "Roommate",
  "Secret affair",
  "Former friend"
];

export const motives: Motive[] = [
  "Revenge",
  "Jealousy",
  "Financial gain",
  "Blackmail",
  "Fear of exposure",
  "Rage",
  "Cover-up",
  "Inheritance"
];

export const entryMethods = ["Force the back door", "Use a copied key", "Slip through an open window", "Arrive as a welcome visitor"];
export const weaponMethods = ["Kitchen knife", "Blunt object from the room", "Poisoned drink", "Stage a fall"];

const effects = (
  evidenceGenerated: number,
  suspicion: number,
  timelineRisk: number,
  witnessRisk: number,
  cleanupScore: number,
  misdirectionScore: number
) => ({
  evidenceGenerated,
  suspicion,
  timelineRisk,
  witnessRisk,
  cleanupScore,
  misdirectionScore
});

export const murdererDecisionDeck: Array<{ id: string; title: string; choices: MurdererChoice[] }> = [
  {
    id: "entry",
    title: "Means of Entry",
    choices: [
      {
        id: "entry-forced-door",
        category: "entry",
        label: "Force the back door",
        description: "Fast and plausible as a break-in, but it leaves tool marks.",
        effects: effects(18, 8, 4, 6, 0, 10),
        clueTags: ["entry", "forced", "tool-marks"],
        tradeoff: "Strong misdirection, noisy physical evidence."
      },
      {
        id: "entry-copied-key",
        category: "entry",
        label: "Use a copied key",
        description: "Quiet entry with less damage, but it points to someone close.",
        effects: effects(8, 14, 6, 2, 0, 2),
        clueTags: ["entry", "key", "close-access"],
        tradeoff: "Clean scene, higher relationship suspicion."
      },
      {
        id: "entry-open-window",
        category: "entry",
        label: "Slip through an open window",
        description: "Low planning, low certainty, and a decent chance of transfer evidence.",
        effects: effects(13, 5, 8, 8, 0, 4),
        clueTags: ["entry", "window", "fiber"],
        tradeoff: "Flexible story, more witness and trace risk."
      },
      {
        id: "entry-invited",
        category: "entry",
        label: "Arrive as a welcome visitor",
        description: "No forced entry, but the victim's habits may reveal the connection.",
        effects: effects(6, 12, 10, 5, 0, 0),
        clueTags: ["entry", "invited", "known-person"],
        tradeoff: "Few entry clues, dangerous timeline clues."
      }
    ]
  },
  {
    id: "method",
    title: "Weapon or Method",
    choices: [
      {
        id: "method-knife",
        category: "method",
        label: "Kitchen knife",
        description: "Available and personal, with blood evidence hard to fully control.",
        effects: effects(22, 10, 3, 5, -5, 0),
        clueTags: ["method", "knife", "blood"],
        tradeoff: "Direct and decisive, but messy."
      },
      {
        id: "method-blunt-object",
        category: "method",
        label: "Blunt object from the room",
        description: "Improvised and deniable, though impact patterns linger.",
        effects: effects(16, 7, 4, 4, -2, 2),
        clueTags: ["method", "impact", "room-object"],
        tradeoff: "Lower planning signal, moderate forensic risk."
      },
      {
        id: "method-poison",
        category: "method",
        label: "Poisoned drink",
        description: "Quiet and controlled, but toxicology can turn the case sharply.",
        effects: effects(10, 15, 12, 3, 4, 0),
        clueTags: ["method", "toxicology", "drink"],
        tradeoff: "Subtle until tested, then very specific."
      },
      {
        id: "method-staged-fall",
        category: "method",
        label: "Stage a fall",
        description: "Low weapon trail, but the body may contradict the scene.",
        effects: effects(12, 8, 9, 2, 1, 8),
        clueTags: ["method", "fall", "body-position"],
        tradeoff: "Good cover story, vulnerable to body analysis."
      }
    ]
  },
  {
    id: "cleanup",
    title: "Cleanup Attempt",
    choices: [
      {
        id: "cleanup-bleach",
        category: "cleanup",
        label: "Use bleach aggressively",
        description: "Removes some traces while announcing that cleanup happened.",
        effects: effects(10, 12, 2, 1, 14, -2),
        clueTags: ["cleanup", "bleach", "overcleaned"],
        tradeoff: "Better trace control, obvious consciousness of guilt."
      },
      {
        id: "cleanup-targeted",
        category: "cleanup",
        label: "Wipe only touched surfaces",
        description: "Careful and less obvious, but imperfect under forensic light.",
        effects: effects(7, 5, 3, 0, 10, 1),
        clueTags: ["cleanup", "prints", "partial-wipe"],
        tradeoff: "Balanced, with hidden forensic exposure."
      },
      {
        id: "cleanup-none",
        category: "cleanup",
        label: "Leave quickly",
        description: "Avoids cleanup tells while leaving more raw evidence.",
        effects: effects(20, 2, 6, 6, -8, 4),
        clueTags: ["cleanup", "uncontrolled", "panic"],
        tradeoff: "Less suspicious behavior, more evidence."
      }
    ]
  },
  {
    id: "staging",
    title: "Staging or Misdirection",
    choices: [
      {
        id: "staging-burglary",
        category: "staging",
        label: "Stage a burglary",
        description: "Creates an alternate theory if detectives chase the missing items.",
        effects: effects(9, 7, 3, 3, 0, 14),
        clueTags: ["staging", "burglary", "missing-items"],
        tradeoff: "Powerful cover if not over-examined."
      },
      {
        id: "staging-message",
        category: "staging",
        label: "Send a fake text",
        description: "Can bend the timeline, but digital records are unforgiving.",
        effects: effects(8, 10, 16, 1, 0, 8),
        clueTags: ["staging", "phone", "fake-text"],
        tradeoff: "Timeline cover with digital risk."
      },
      {
        id: "staging-domestic",
        category: "staging",
        label: "Point toward a domestic fight",
        description: "Uses existing tension, but may expose the real relationship.",
        effects: effects(7, 13, 5, 2, 0, 10),
        clueTags: ["staging", "relationship", "domestic"],
        tradeoff: "Directs suspicion, but close ties become central."
      }
    ]
  },
  {
    id: "alibi",
    title: "Alibi Behavior",
    choices: [
      {
        id: "alibi-crowded-bar",
        category: "alibi",
        label: "Appear at a crowded bar",
        description: "Many witnesses, but camera timestamps may narrow the window.",
        effects: effects(5, 4, 13, 10, 0, 5),
        clueTags: ["alibi", "bar", "camera"],
        tradeoff: "Human cover, technical risk."
      },
      {
        id: "alibi-home-alone",
        category: "alibi",
        label: "Stay home alone",
        description: "Simple story with few contradictions and almost no support.",
        effects: effects(2, 8, 6, 0, 0, 0),
        clueTags: ["alibi", "unsupported"],
        tradeoff: "Hard to disprove, hard to believe."
      },
      {
        id: "alibi-helpful",
        category: "alibi",
        label: "Become overly helpful",
        description: "Gives you influence over the search, but draws behavioral suspicion.",
        effects: effects(6, 14, 5, 4, 0, 7),
        clueTags: ["alibi", "helpful", "behavior"],
        tradeoff: "Information access at a social cost."
      }
    ]
  }
];

export const detectiveActionDeck: Array<{ id: string; title: string; actions: DetectiveAction[] }> = [
  {
    id: "scene",
    title: "Scene Work",
    actions: [
      {
        id: "inspect-entry",
        category: "scene",
        label: "Inspect entry point",
        description: "Look for forced access, key use, window transfer, or signs of a welcome arrival.",
        pressure: "evidenceGenerated",
        clueTags: ["entry", "forced", "key", "window", "invited"],
        suspicionDelta: 6
      },
      {
        id: "search-room",
        category: "scene",
        label: "Search room",
        description: "Read what was disturbed, staged, removed, or left too perfect.",
        pressure: "misdirectionScore",
        clueTags: ["staging", "burglary", "missing-items", "domestic"],
        suspicionDelta: 5
      }
    ]
  },
  {
    id: "forensics",
    title: "Forensics",
    actions: [
      {
        id: "analyze-body",
        category: "forensics",
        label: "Analyze body",
        description: "Compare injuries, position, and timing against the apparent story.",
        pressure: "evidenceGenerated",
        clueTags: ["method", "knife", "impact", "fall", "body-position"],
        suspicionDelta: 8
      },
      {
        id: "run-forensic-test",
        category: "forensics",
        label: "Run forensic test",
        description: "Spend lab capacity on trace, toxicology, wipe patterns, and residue.",
        pressure: "cleanupScore",
        clueTags: ["toxicology", "drink", "cleanup", "bleach", "prints", "blood"],
        suspicionDelta: 9
      }
    ]
  },
  {
    id: "witnesses",
    title: "People",
    actions: [
      {
        id: "interview-witness",
        category: "witnesses",
        label: "Interview witness",
        description: "Ask neighbors, staff, and regulars what felt out of rhythm.",
        pressure: "witnessRisk",
        clueTags: ["witness", "bar", "known-person", "behavior", "window"],
        suspicionDelta: 6
      },
      {
        id: "investigate-motive",
        category: "witnesses",
        label: "Investigate motive",
        description: "Trace debts, grudges, intimacy, access, and old conflict.",
        pressure: "suspicion",
        clueTags: ["motive", "relationship", "close-access", "domestic"],
        suspicionDelta: 8
      }
    ]
  },
  {
    id: "records",
    title: "Records",
    actions: [
      {
        id: "check-cameras",
        category: "records",
        label: "Check cameras",
        description: "Review doorbells, street cameras, bars, rideshares, and store footage.",
        pressure: "timelineRisk",
        clueTags: ["camera", "bar", "phone", "timeline"],
        suspicionDelta: 7
      },
      {
        id: "review-timeline",
        category: "records",
        label: "Review timeline",
        description: "Build a minute-by-minute board and test every claimed movement.",
        pressure: "timelineRisk",
        clueTags: ["timeline", "fake-text", "unsupported", "invited"],
        suspicionDelta: 8
      }
    ]
  }
];

export const clueLibrary: Clue[] = [
  {
    id: "entry-truth",
    title: "Entry Story Does Not Hold",
    body: "The point of entry contains a detail that contradicts the first explanation.",
    kind: "physical",
    tags: ["entry", "forced", "key", "window", "invited"],
    missedReason: "A deeper entry inspection would have tested the cover story."
  },
  {
    id: "tool-marks",
    title: "Fresh Tool Marks",
    body: "The door frame has fresh pry marks with paint dust still caught in the splintering.",
    kind: "physical",
    tags: ["entry", "forced", "tool-marks"],
    missedReason: "The staged break-in could have been challenged at the door."
  },
  {
    id: "key-scratch",
    title: "Copied Key Scratch",
    body: "The lock shows a shallow repeated scratch consistent with a poorly cut duplicate key.",
    kind: "physical",
    tags: ["entry", "key", "close-access"],
    missedReason: "Lock work would have pointed toward someone with private access."
  },
  {
    id: "fiber-sill",
    title: "Window Sill Fiber",
    body: "A dark fiber is caught in the window track where someone squeezed through.",
    kind: "forensic",
    tags: ["entry", "window", "fiber"],
    missedReason: "The window transfer evidence remained untested."
  },
  {
    id: "method-truth",
    title: "Method Hidden in the Injuries",
    body: "The body tells a more precise story than the room does.",
    kind: "forensic",
    tags: ["method", "knife", "impact", "fall", "body-position", "toxicology"],
    missedReason: "Body analysis would have narrowed the true method."
  },
  {
    id: "blood-castoff",
    title: "Blood Castoff Pattern",
    body: "A fine arc of blood under the cabinet lip escaped the cleanup attempt.",
    kind: "forensic",
    tags: ["method", "knife", "blood", "cleanup"],
    missedReason: "The blood pattern was still available beneath the obvious surfaces."
  },
  {
    id: "impact-shadow",
    title: "Impact Shadow",
    body: "Dust around a missing tabletop object leaves a clean outline and a matching impact wound.",
    kind: "physical",
    tags: ["method", "impact", "room-object"],
    missedReason: "Searching the room would have tied the improvised weapon to the scene."
  },
  {
    id: "toxicology-hit",
    title: "Toxicology Flag",
    body: "The victim's glass contains residue that does not belong in an ordinary drink.",
    kind: "forensic",
    tags: ["method", "toxicology", "drink"],
    missedReason: "A lab action could have turned a subtle method into hard evidence."
  },
  {
    id: "overcleaned-floor",
    title: "Overcleaned Floor",
    body: "One section of the floor is cleaner than the rest, with bleach residue under the baseboard.",
    kind: "forensic",
    tags: ["cleanup", "bleach", "overcleaned"],
    missedReason: "The cleanup itself was evidence of a controlled scene."
  },
  {
    id: "partial-print",
    title: "Partial Wipe Pattern",
    body: "A cabinet pull has one smeared ridge pattern where someone wiped too quickly.",
    kind: "forensic",
    tags: ["cleanup", "prints", "partial-wipe"],
    missedReason: "Targeted cleanup still left a partial print trail."
  },
  {
    id: "burglary-too-neat",
    title: "Burglary Too Neat",
    body: "The missing items are obvious, portable, and oddly unrelated to the victim's most valuable possessions.",
    kind: "misdirection",
    tags: ["staging", "burglary", "missing-items"],
    missedReason: "The staged theft could have been separated from the actual motive."
  },
  {
    id: "fake-text-window",
    title: "Fake Text Window",
    body: "The phone activity creates a convenient gap, but the movement data does not match a living user.",
    kind: "timeline",
    tags: ["staging", "phone", "fake-text", "timeline"],
    missedReason: "Records review would have challenged the digital timeline."
  },
  {
    id: "camera-gap",
    title: "Camera Gap",
    body: "A street camera catches a narrow arrival window that puts pressure on the alibi.",
    kind: "timeline",
    tags: ["camera", "bar", "timeline"],
    missedReason: "Camera work could have narrowed the alibi."
  },
  {
    id: "unsupported-alibi",
    title: "Unsupported Alibi",
    body: "The alibi is simple, but it has no independent anchor during the key minutes.",
    kind: "timeline",
    tags: ["alibi", "unsupported", "timeline"],
    missedReason: "A minute-by-minute review would have exposed the unsupported gap."
  },
  {
    id: "witness-saw-familiar",
    title: "Familiar Visitor",
    body: "A witness remembers the victim did not sound alarmed when the visitor arrived.",
    kind: "witness",
    tags: ["witness", "known-person", "invited"],
    missedReason: "Witness work would have weakened the stranger theory."
  },
  {
    id: "relationship-thread",
    title: "Private Relationship Thread",
    body: "The victim's messages point toward a private relationship conflict.",
    kind: "motive",
    tags: ["motive", "relationship", "close-access", "domestic"],
    missedReason: "Motive work could have identified the relationship behind the crime."
  },
  {
    id: "motive-pressure",
    title: "Motive Pressure Point",
    body: "A private note identifies the pressure that made the confrontation urgent.",
    kind: "motive",
    tags: ["motive", "relationship", "domestic"],
    missedReason: "The motive was discoverable through interviews and records."
  },
  {
    id: "helpful-behavior",
    title: "Too Helpful",
    body: "The helpful witness keeps steering attention back to a theory that benefits them.",
    kind: "witness",
    tags: ["alibi", "helpful", "behavior", "witness"],
    missedReason: "Behavioral interviewing would have exposed the steering attempt."
  }
];
