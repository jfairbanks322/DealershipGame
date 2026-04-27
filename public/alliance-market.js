const TEAM_DEFINITIONS = [
  {
    id: "apex",
    name: "Mirror Mile",
    accent: "gold",
    identity: "Fast sellers who flip knockoff fashion and designer shoes for quick cash.",
    perk: "Gets +$2 every time this team sells supply.",
    trait: { greed: 0.66, loyalty: 0.42, aggression: 0.48 }
  },
  {
    id: "cinder",
    name: "Dockside Run",
    accent: "ember",
    identity: "Cheap buyers who know how to grab fashion drops for less.",
    perk: "Buys supply for $2 less.",
    trait: { greed: 0.82, loyalty: 0.28, aggression: 0.66 }
  },
  {
    id: "halcyon",
    name: "Night Market",
    accent: "teal",
    identity: "Alliance builders who profit most when fashion sales are shared.",
    perk: "Gets +$3 per ally when selling instead of +$2.",
    trait: { greed: 0.44, loyalty: 0.74, aggression: 0.32 }
  },
  {
    id: "velvet",
    name: "Back Alley",
    accent: "violet",
    identity: "Saboteurs who ruin rival shoe drops for the lowest cost.",
    perk: "Delay Shipment and Hijack Supply cost $2 less.",
    trait: { greed: 0.56, loyalty: 0.35, aggression: 0.7 }
  }
];

const SECRET_OBJECTIVES = [
  {
    id: "influence-crown",
    title: "Influence Crown",
    description: "Finish the game with the highest influence on the board.",
    score(team, rankedTeams) {
      return rankedTeams[0]?.id === team.id ? 16 : 0;
    },
    progress(team, rankedTeams) {
      return rankedTeams[0]?.id === team.id ? "You are currently leading the influence race." : "You need to own the room by the final vote.";
    }
  },
  {
    id: "cash-stack",
    title: "Cash Stack",
    description: "End at $95 cash or better, even if your reputation gets messy.",
    score(team) {
      return team.cash >= 95 ? 16 : 0;
    },
    progress(team) {
      return `Current cash: $${team.cash}. Target: $95.`;
    }
  },
  {
    id: "trust-network",
    title: "Trust Network",
    description: "End the game with two active pacts and reputation above 55.",
    score(team, rankedTeams, state) {
      return getAlliesForTeam(state, team.id).length >= 2 && team.reputation >= 55 ? 16 : 0;
    },
    progress(team, rankedTeams, state) {
      return `${getAlliesForTeam(state, team.id).length} pacts active. Reputation ${team.reputation}.`;
    }
  },
  {
    id: "beautiful-monster",
    title: "Beautiful Monster",
    description: "Betray at least one ally and still finish in the top two.",
    score(team, rankedTeams) {
      return rankedTeams.slice(0, 2).some((entry) => entry.id === team.id) && team.betrayals >= 1 ? 18 : 0;
    },
    progress(team) {
      return `${team.betrayals} betrayals logged. You still need a top-two finish.`;
    }
  }
];

const PROPOSALS = [
  {
    id: "sneaker-craze",
    title: "Sneaker Craze",
    focus: "influence",
    sellBonus: 6,
    description: "Designer basketball shoes are hot right now, so every sale pays more this round.",
    resolve() {
      return `Designer basketball shoes are hot tonight. Any team that sells supply this round gets a better payout.`;
    }
  },
  {
    id: "night-market-rush",
    title: "Night Market Rush",
    focus: "reputation",
    sellBonus: 5,
    description: "A busy night crowd wants knockoff fashion, so supply sells for more this round.",
    resolve() {
      return `Street demand spikes tonight. Knockoff fashion sells fast and for better money.`;
    }
  },
  {
    id: "tourist-weekend",
    title: "Tourist Weekend",
    focus: "cash",
    sellBonus: 4,
    description: "Extra buyers are in town looking for cheap designer looks, so every sale is worth a little more.",
    resolve() {
      return `Tourists flood the area. Every sale pays a little better this round.`;
    }
  },
  {
    id: "supplier-panic",
    title: "Supplier Panic",
    focus: "alliance",
    sellBonus: 3,
    description: "Fashion suppliers get nervous, but alliances help teams stay stocked and paid.",
    resolve() {
      state.deals
        .filter((deal) => deal.status === "active")
        .forEach((deal) => {
          const from = getTeamById(deal.fromId);
          const to = getTeamById(deal.toId);
          if (from) {
            from.cash += 2;
          }
          if (to) {
            to.cash += 2;
          }
        });
      return `Suppliers get jumpy, but active alliances smooth things out. Every allied crew gets a small cash bonus.`;
    }
  }
];

const ROUND_EVENTS = [
  {
    id: "police-sweep",
    title: "Police Sweep",
    detail(state) {
      const target = [...state.teams].sort((a, b) => b.suspicion - a.suspicion)[0];
      if (!target || target.suspicion < 12) {
        return "The police sweep turns up nothing. Everyone kept their heads down just enough.";
      }
      target.reputation -= 7;
      target.cash -= 4;
      target.suspicion = Math.max(0, target.suspicion - 8);
      return `${target.name} gets clipped by a police sweep and loses 7 street cred plus $4 from the fashion stash.`;
    }
  },
  {
    id: "truck-delay",
    title: "Truck Delay",
    detail(state) {
      const owner = [...state.teams].sort((a, b) => b.contracts.length - a.contracts.length)[0];
      if (!owner || owner.contracts.length === 0) {
        return "The truck delay does not hit hard because no crew is sitting on much supply yet.";
      }
      owner.cash -= 6;
      owner.influence += 2;
      return `${owner.name} takes a truck delay on a shoe shipment, loses $6, but gains 2 supplier pull by surviving it.`;
    }
  },
  {
    id: "viral-post",
    title: "Viral Post",
    detail(state) {
      const winner = [...state.teams].sort((a, b) => b.reputation - a.reputation)[0];
      winner.cash += 6;
      return `${winner.name} rides a viral outfit post and turns buzz into $6 fast.`;
    }
  },
  {
    id: "supplier-mixup",
    title: "Supplier Mix-Up",
    detail(state) {
      const teamsUnderPressure = state.teams.filter((team) => team.reputation < 44);
      if (!teamsUnderPressure.length) {
        return "A supplier mix-up almost causes problems, but every crew keeps things moving.";
      }
      teamsUnderPressure.forEach((team) => {
        team.cash -= 3;
        team.influence -= 1;
      });
      return `A supplier mix-up hurts ${teamsUnderPressure.map((team) => team.name).join(", ")} for being too messy and underprepared with their fashion drops.`;
    }
  }
];

const CONTRACT_NAMES = [
  "Knockoff Sneaker Drop",
  "Replica Designer Shoe Crate",
  "Fake Streetwear Bundle",
  "Counterfeit Jersey Drop",
  "Designer Basketball Shoe Restock",
  "Knockoff Fashion Box",
  "Replica Hoodie Shipment",
  "Fake Sneaker Vault",
  "Streetwear Copy Crate"
];

const SHOCK_DEFINITIONS = {
  scandal: {
    label: "Police Raid",
    apply(team) {
      team.reputation -= 10;
      team.influence -= 3;
      team.suspicion += 6;
      return `${team.name} gets raided: -10 street cred, -3 supplier pull, heat climbs.`;
    }
  },
  merger: {
    label: "Hot Supplier Tip",
    apply(team) {
      team.cash += 10;
      team.influence += 4;
      team.reputation -= 2;
      return `${team.name} gets a hot supplier tip: +$10 cash, +4 supplier pull, but the crew looks a little too greedy.`;
    }
  },
  labor: {
    label: "Shipment Delay",
    apply(team) {
      team.cash -= 8;
      team.reputation -= 6;
      return `${team.name} gets hit by a shipment delay and loses $8 plus 6 street cred.`;
    }
  },
  regulation: {
    label: "Market Crackdown",
    apply(team, state) {
      const exposedTeams = state.teams.filter((entry) => entry.suspicion >= 16);
      if (!exposedTeams.length) {
        team.reputation += 2;
        return `${team.name} slips through the crackdown cleanly and even gains 2 street cred.`;
      }
      exposedTeams.forEach((entry) => {
        entry.cash -= 4;
        entry.influence -= 2;
      });
      return `The crackdown hits exposed crews: ${exposedTeams.map((entry) => entry.name).join(", ")} each lose $4 and 2 supplier pull.`;
    }
  }
};

const DEAL_TYPES = {
  formal: {
    label: "Strong Alliance",
    chip: "formal",
    description: "Stronger public alliance. Helps both teams more, but betrayal becomes much more costly.",
    apply() {
      return true;
    }
  },
  handshake: {
    label: "Loose Alliance",
    chip: "handshake",
    description: "Lighter alliance. Easier to make and easier to break.",
    apply() {
      return true;
    }
  }
};

const SHADOW_CARD_DEFINITIONS = {
  "private-brief": {
    label: "Private Brief",
    targeted: false,
    chip: "brief",
    description: "A private note from the teacher. It does not consume a turn and can be archived after reading.",
    apply() {
      return { ok: true, summary: "Private brief reviewed." };
    }
  },
  "insider-tip": {
    label: "Insider Tip",
    targeted: false,
    chip: "tip",
    description: "Spend your turn cashing in hidden information tied to the current board proposal.",
    apply(actor) {
      const proposal = getCurrentProposal();
      if (!proposal) {
        return { ok: false, summary: "No live proposal remains to exploit." };
      }
      if (proposal.focus === "influence") {
        actor.influence += 6;
      } else if (proposal.focus === "reputation") {
        actor.reputation += 7;
      } else if (proposal.focus === "cash") {
        actor.cash += 12;
      } else {
        actor.influence += 3;
        actor.reputation += 3;
      }
      actor.suspicion += 1;
      return { ok: true, summary: `${actor.name} cashes an insider tip and tilts the ${proposal.title} race.` };
    }
  },
  "rumor-card": {
    label: "Rumor Card",
    targeted: true,
    chip: "rumor",
    description: "Quietly bruise a rival's reputation and add friction to their next negotiation.",
    apply(actor, target) {
      if (!target) {
        return { ok: false, summary: "Choose a rival to hit with the rumor first." };
      }
      target.reputation -= 6;
      target.influence -= 2;
      actor.influence += 2;
      actor.suspicion += 2;
      return { ok: true, summary: `${actor.name} drops a rumor on ${target.name} and dents their standing.` };
    }
  },
  "blackmail-file": {
    label: "Blackmail File",
    targeted: true,
    chip: "blackmail",
    description: "Exploit a rival's vulnerability for money and leverage, but your own suspicion spikes hard.",
    apply(actor, target) {
      if (!target) {
        return { ok: false, summary: "Choose a rival before trying to cash the blackmail file." };
      }
      actor.cash += 10;
      actor.influence += 4;
      actor.suspicion += 8;
      target.cash -= 5;
      target.reputation -= 7;
      return { ok: true, summary: `${actor.name} squeezes ${target.name} with blackmail and walks away richer and dirtier.` };
    }
  },
  "leak-ledger": {
    label: "Leak Ledger",
    targeted: true,
    chip: "ledger",
    description: "Expose operational weakness in a rival and clip both their cash and influence.",
    apply(actor, target) {
      if (!target) {
        return { ok: false, summary: "Choose a rival before leaking the ledger." };
      }
      target.cash -= 6;
      target.influence -= 4;
      actor.reputation -= 1;
      actor.influence += 3;
      actor.suspicion += 4;
      return { ok: true, summary: `${actor.name} leaks damaging numbers on ${target.name} and steals board momentum.` };
    }
  },
  "secret-offer": {
    label: "Secret Offer",
    targeted: false,
    chip: "offer",
    description: "A private backchannel offer from another firm. Accepting or rejecting it consumes your seat's turn.",
    apply() {
      return { ok: true, summary: "Secret offer reviewed." };
    }
  },
  "blackmail-demand": {
    label: "Blackmail Demand",
    targeted: false,
    chip: "demand",
    description: "A private coercive demand from another firm. Complying or resisting consumes your seat's turn.",
    apply() {
      return { ok: true, summary: "Blackmail demand reviewed." };
    }
  }
};

const HIDDEN_AGENDA_DEFINITIONS = {
  "wedge-driver": {
    label: "Wedge Driver",
    bonus: 14,
    description: "Break at least one pact, then finish with no active pacts at all.",
    isComplete(team) {
      return team.betrayals >= 1 && getDealsForTeam(team.id).length === 0;
    },
    progress(team) {
      return `${team.betrayals} betrayals logged · ${getDealsForTeam(team.id).length} active pacts remaining.`;
    },
    applyPressure(team) {
      team.reputation -= 5;
      team.suspicion += 4;
      return `${team.name} shows visible internal strain and loses 5 reputation while suspicion climbs.`;
    }
  },
  "sleeper-exit": {
    label: "Sleeper Exit",
    bonus: 16,
    description: "Form or accept at least one pact, then end with no pacts and at least $80 cash.",
    isComplete(team) {
      return team.everHadPact && getDealsForTeam(team.id).length === 0 && team.cash >= 80;
    },
    progress(team) {
      return `${team.everHadPact ? "Pact history established" : "No pact history yet"} · ${getDealsForTeam(team.id).length} pacts active · $${team.cash} cash.`;
    },
    applyPressure(team) {
      team.cash -= 6;
      team.influence -= 3;
      return `${team.name} looks boxed in by its own positioning and bleeds $6 cash plus 3 influence.`;
    }
  },
  "poison-partner": {
    label: "Poison Partner",
    bonus: 15,
    description: "Land at least one hostile move against an ally and still finish with another live pact on the board.",
    isComplete(team) {
      return team.attacksOnAllies >= 1 && getDealsForTeam(team.id).length >= 1;
    },
    progress(team) {
      return `${team.attacksOnAllies} ally attacks logged · ${getDealsForTeam(team.id).length} pacts still live.`;
    },
    applyPressure(team) {
      team.influence -= 4;
      team.reputation -= 4;
      return `${team.name} sends mixed signals to the room and loses 4 influence plus 4 reputation.`;
    }
  },
  "kingmaker-denial": {
    label: "Kingmaker Denial",
    bonus: 18,
    description: "Privately target one rival. That rival must not finish first, and you must send at least one covert message.",
    requiresTarget: true,
    isComplete(team, rankedTeams, state, agenda) {
      const targetId = agenda.targetTeamId;
      return team.covertMessagesSent >= 1 && rankedTeams[0]?.id !== targetId;
    },
    progress(team, rankedTeams, state, agenda) {
      const target = agenda.targetTeamId ? getTeamById(agenda.targetTeamId) : null;
      const targetStanding = rankedTeams.findIndex((entry) => entry.id === agenda.targetTeamId);
      return `${team.covertMessagesSent} covert messages sent · target ${target?.name || "none"} currently ${targetStanding === -1 ? "off board" : `ranked #${targetStanding + 1}`}.`;
    },
    applyPressure(team) {
      team.influence -= 4;
      team.suspicion += 3;
      return `${team.name} looks increasingly desperate in the power struggle and drops 4 influence while suspicion rises.`;
    }
  }
};

const MAX_ROUNDS = 8;
const MAX_OPEN_CONTRACTS = 4;

const state = {
  round: 1,
  maxRounds: MAX_ROUNDS,
  selectedTeamId: "apex",
  currentProposalIndex: 0,
  gameOver: false,
  teams: [],
  contracts: [],
  deals: [],
  logs: [],
  teamsActedThisRound: [],
  briefRevealed: false,
  teacherTargetId: "cinder",
  dealTargetId: "cinder",
  dealType: "formal",
  shadowRecipientId: "apex",
  shadowCardType: "private-brief",
  shadowNote: "",
  covertRecipientId: "cinder",
  covertMessageType: "secret-offer",
  covertDealType: "handshake",
  covertNote: "",
  counterintelTargetId: "cinder",
  counterintelMode: "standard",
  deceptionTargetId: "cinder",
  agendaRecipientId: "apex",
  agendaType: "wedge-driver",
  agendaTargetId: "cinder",
  agendaNote: ""
};

const elements = {
  roundIndicator: document.getElementById("round-indicator"),
  proposalFocus: document.getElementById("proposal-focus"),
  playerTeamLabel: document.getElementById("player-team-label"),
  teamSelectGrid: document.getElementById("team-select-grid"),
  teacherPanel: document.getElementById("teacher-panel"),
  dealPanel: document.getElementById("deal-panel"),
  warRoomName: document.getElementById("war-room-name"),
  playerSummary: document.getElementById("player-summary"),
  proposalTitle: document.getElementById("proposal-title"),
  proposalPanel: document.getElementById("proposal-panel"),
  contractBoard: document.getElementById("contract-board"),
  factionBoard: document.getElementById("faction-board"),
  dealBoard: document.getElementById("deal-board"),
  leaderboardPanel: document.getElementById("leaderboard-panel"),
  logPanel: document.getElementById("log-panel"),
  debriefPanel: document.getElementById("debrief-panel"),
  resetGameBtn: document.getElementById("reset-game-btn"),
  lobbyActionBtn: document.getElementById("lobby-action-btn"),
  prActionBtn: document.getElementById("pr-action-btn"),
  toggleBriefBtn: document.getElementById("toggle-brief-btn"),
  holdPositionBtn: document.getElementById("hold-position-btn")
};

function createInitialTeam(definition, index) {
  const objective = SECRET_OBJECTIVES[index % SECRET_OBJECTIVES.length];
  return {
    id: definition.id,
    name: definition.name,
    accent: definition.accent,
    identity: definition.identity,
    perk: definition.perk,
    trait: definition.trait,
    control: "human",
    cash: 60 - index * 3,
    influence: 22 + index * 2,
    reputation: 52 + index * 3,
    contracts: [],
    suspicion: 4 + index * 2,
    betrayals: 0,
    objectiveId: objective.id,
    alliedWith: [],
    inbox: [],
    agendas: [],
    everHadPact: false,
    attacksOnAllies: 0,
    covertMessagesSent: 0,
    agendaShieldCharges: 0,
    intelReports: [],
    decoyCoverSignals: 0,
    falseTrafficSignals: 0,
    plantedStrainSignals: 0
  };
}

function resetGame() {
  state.round = 1;
  state.currentProposalIndex = 0;
  state.gameOver = false;
  state.teams = TEAM_DEFINITIONS.map(createInitialTeam);
  state.contracts = [];
  state.deals = [];
  state.logs = [];
  state.teamsActedThisRound = [];
  state.selectedTeamId = "apex";
  state.teacherTargetId = "cinder";
  state.dealTargetId = "cinder";
  state.dealType = "formal";
  state.shadowRecipientId = "apex";
  state.shadowCardType = "private-brief";
  state.shadowNote = "";
  state.covertRecipientId = "cinder";
  state.covertMessageType = "secret-offer";
  state.covertDealType = "handshake";
  state.covertNote = "";
  state.counterintelTargetId = "cinder";
  state.counterintelMode = "standard";
  state.deceptionTargetId = "cinder";
  state.agendaRecipientId = "apex";
  state.agendaType = "wedge-driver";
  state.agendaTargetId = "cinder";
  state.agendaNote = "";
  state.briefRevealed = false;

  for (let index = 0; index < MAX_OPEN_CONTRACTS; index += 1) {
    state.contracts.push(generateContract(state));
  }

  getTeamById("apex").influence += 4;
  logEvent("Opening Bell", "The market opens with four crews, live fashion and sneaker drops, and enough money in the room to make everyone dangerous.");
  render();
}

function generateContract(currentState, forcedTitle = null) {
  const existingTitles = new Set(currentState.contracts.map((contract) => contract.title));
  const availableTitle = forcedTitle
    || CONTRACT_NAMES.find((title) => !existingTitles.has(title))
    || `Mystery Fashion Lot ${Math.ceil(Math.random() * 99)}`;
  return {
    id: `contract-${Math.random().toString(36).slice(2, 9)}`,
    title: availableTitle,
    sector: "Fashion + Shoes",
    value: 10 + Math.floor(Math.random() * 10),
    influenceCost: 5 + Math.floor(Math.random() * 5),
    ownerId: null
  };
}

function getActiveTeam() {
  return state.teams.find((team) => team.id === state.selectedTeamId);
}

function getCurrentProposal() {
  if (state.gameOver) {
    return null;
  }
  return PROPOSALS[state.currentProposalIndex % PROPOSALS.length];
}

function getObjectiveForTeam(team) {
  return SECRET_OBJECTIVES.find((objective) => objective.id === team.objectiveId);
}

function getTeamById(teamId) {
  return state.teams.find((team) => team.id === teamId);
}

function getAlliesForTeam(currentState, teamId) {
  return currentState.teams.filter((team) => team.id !== teamId && team.alliedWith.includes(teamId));
}

function getDealsForTeam(teamId) {
  return state.deals.filter((deal) => deal.status === "active" && (deal.fromId === teamId || deal.toId === teamId));
}

function getActiveDealBetween(teamAId, teamBId) {
  return state.deals.find((deal) => {
    if (deal.status !== "active") {
      return false;
    }
    return (deal.fromId === teamAId && deal.toId === teamBId) || (deal.fromId === teamBId && deal.toId === teamAId);
  }) || null;
}

function makeAlliance(teamA, teamB) {
  if (!teamA.alliedWith.includes(teamB.id)) {
    teamA.alliedWith.push(teamB.id);
  }
  if (!teamB.alliedWith.includes(teamA.id)) {
    teamB.alliedWith.push(teamA.id);
  }
}

function breakAlliance(teamA, teamB) {
  teamA.alliedWith = teamA.alliedWith.filter((allyId) => allyId !== teamB.id);
  teamB.alliedWith = teamB.alliedWith.filter((allyId) => allyId !== teamA.id);
}

function logEvent(tag, message) {
  state.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    round: state.round,
    tag,
    message
  });
  state.logs = state.logs.slice(0, 22);
}

function createDeal(actor, target, type) {
  if (!target || actor.id === target.id || getActiveDealBetween(actor.id, target.id)) {
    return false;
  }
  const definition = DEAL_TYPES[type];
  if (!definition || !definition.apply(actor, target)) {
    return false;
  }
  makeAlliance(actor, target);
  actor.everHadPact = true;
  target.everHadPact = true;
  state.deals.push({
    id: `deal-${Math.random().toString(36).slice(2, 9)}`,
    fromId: actor.id,
    toId: target.id,
    type,
    status: "active",
    roundCreated: state.round
  });
  return true;
}

function assignHiddenAgenda(teamId, agendaType, targetTeamId, note) {
  const team = getTeamById(teamId);
  const definition = HIDDEN_AGENDA_DEFINITIONS[agendaType];
  if (!team || !definition) {
    return;
  }
  team.agendas.unshift({
    id: `agenda-${Math.random().toString(36).slice(2, 9)}`,
    type: agendaType,
    targetTeamId: definition.requiresTarget ? targetTeamId : null,
    note: note?.trim() || "",
    roundAssigned: state.round,
    roundsUnmet: 0,
    pressureHits: 0
  });
  const target = definition.requiresTarget ? getTeamById(targetTeamId) : null;
  const targetText = target ? ` targeting ${target.name}` : "";
  logEvent("Teacher Agenda", `${team.name} receives a hidden agenda: ${definition.label}${targetText}.`);
  render();
}

function createShadowCard(type, note) {
  return {
    id: `shadow-${Math.random().toString(36).slice(2, 9)}`,
    type,
    note: note?.trim() || "",
    status: "ready",
    roundDelivered: state.round
  };
}

function deliverShadowCard(teamId, type, note) {
  const team = getTeamById(teamId);
  const definition = SHADOW_CARD_DEFINITIONS[type];
  if (!team || !definition) {
    return;
  }
  team.inbox.unshift(createShadowCard(type, note));
  const label = definition.label.toLowerCase();
  const article = /^[aeiou]/.test(label) ? "an" : "a";
  logEvent("Secret Note", `${team.name} receives ${article} ${label}.`);
  render();
}

function archiveShadowCard(team, cardId) {
  const card = team.inbox.find((entry) => entry.id === cardId);
  if (!card) {
    return;
  }
  card.status = "archived";
  logEvent("Private Brief", `${team.name} archives a private message out of the active stack.`);
  render();
}

function deliverCovertMessage(senderId, recipientId, type, note, dealType = "handshake") {
  const sender = getTeamById(senderId);
  const recipient = getTeamById(recipientId);
  if (!sender || !recipient || sender.id === recipient.id) {
    return { ok: false, summary: "Choose another firm before sending a covert message." };
  }

  const definition = SHADOW_CARD_DEFINITIONS[type];
  if (!definition) {
    return { ok: false, summary: "That covert message type is not supported." };
  }

  recipient.inbox.unshift({
    id: `shadow-${Math.random().toString(36).slice(2, 9)}`,
    type,
    note: note?.trim() || "",
    status: "ready",
    roundDelivered: state.round,
    fromId: sender.id,
    dealType
  });
  sender.covertMessagesSent += 1;
  sender.suspicion += type === "blackmail-demand" ? 2 : 1;
  return { ok: true, summary: `${sender.name} slips a private ${definition.label.toLowerCase()} to ${recipient.name}.` };
}

function closeDealsBetween(teamA, teamB, nextStatus) {
  state.deals.forEach((deal) => {
    const samePair = (deal.fromId === teamA.id && deal.toId === teamB.id) || (deal.fromId === teamB.id && deal.toId === teamA.id);
    if (samePair && deal.status === "active") {
      deal.status = nextStatus;
      deal.closedRound = state.round;
    }
  });
}

function takeContract(team, contract, mode) {
  if (!contract || contract.ownerId) {
    return false;
  }

  const baseCost = contract.value;
  const buyCost = team.id === "cinder" ? Math.max(6, baseCost - 2) : baseCost;
  if (team.cash < buyCost) {
    return false;
  }

  team.cash -= buyCost;
  team.influence += team.id === "apex" ? 2 : 1;
  team.reputation += 1;

  contract.ownerId = team.id;
  team.contracts.push(contract.id);
  return true;
}

function getCurrentSellPrice() {
  const proposal = getCurrentProposal();
  const base = 12;
  if (!proposal) {
    return base;
  }
  return base + (proposal.sellBonus || 0);
}

function sellSupply(team) {
  const contractId = team.contracts[0];
  if (!contractId) {
    return false;
  }

  const payout = getCurrentSellPrice() + getAlliesForTeam(state, team.id).length * (team.id === "halcyon" ? 3 : 2) + (team.id === "apex" ? 2 : 0);
  team.cash += payout;
  team.contracts = team.contracts.filter((entry) => entry !== contractId);

  const contract = state.contracts.find((entry) => entry.id === contractId);
  if (contract) {
    contract.ownerId = "sold";
  }

  team.reputation += 1;
  return true;
}

function leakAgainstTeam(actor, target) {
  if (actor.alliedWith.includes(target.id)) {
    actor.attacksOnAllies += 1;
  }
  const sabotageCost = actor.id === "velvet" ? 2 : 4;
  if (actor.cash < sabotageCost) {
    return false;
  }
  actor.cash -= sabotageCost;
  target.cash = Math.max(0, target.cash - 6);
  target.reputation -= 2;
  actor.suspicion += 2;
  return true;
}

function hostileTakeover(actor, target) {
  const targetContractId = target.contracts[0];
  const hijackCost = actor.id === "velvet" ? 6 : 8;
  if (!targetContractId || actor.cash < hijackCost) {
    return false;
  }

  if (actor.alliedWith.includes(target.id)) {
    actor.attacksOnAllies += 1;
  }

  actor.cash -= hijackCost;
  target.reputation -= 3;
  actor.suspicion += 3;

  target.contracts = target.contracts.filter((contractId) => contractId !== targetContractId);
  actor.contracts.push(targetContractId);

  const contract = state.contracts.find((entry) => entry.id === targetContractId);
  if (contract) {
    contract.ownerId = actor.id;
  }
  return true;
}

function betrayAlliance(actor, target) {
  const deal = getActiveDealBetween(actor.id, target.id);
  if (!deal) {
    return false;
  }

  breakAlliance(actor, target);
  closeDealsBetween(actor, target, "broken");
  actor.betrayals += 1;
  actor.cash += 8;
  actor.reputation -= 4;
  actor.suspicion += 4;
  target.reputation -= 3;
  target.cash = Math.max(0, target.cash - 6);
  return true;
}

function runPrCampaign(team) {
  if (team.cash < 4) {
    return false;
  }
  team.cash -= 4;
  team.reputation += 2;
  team.suspicion = Math.max(0, team.suspicion - 4);
  return true;
}

function lobbyProposal(team) {
  return sellSupply(team);
}

function holdPosition(team) {
  team.suspicion = Math.max(0, team.suspicion - 1);
  return true;
}

function buyCoverStory(team) {
  if (team.cash < 6) {
    return { ok: false, summary: "You need $6 cash to buy a Cover Story card." };
  }
  team.cash -= 6;
  team.agendaShieldCharges += 1;
  team.suspicion = Math.max(0, team.suspicion - 1);
  return { ok: true, summary: `${team.name} buys a Cover Story card and sets up a private shield against the next agenda-pressure hit.` };
}

function hireCrisisConsultant(team) {
  if (team.cash < 10) {
    return { ok: false, summary: "You need $10 cash to hire a Crisis Consultant." };
  }
  if (!team.agendas.length) {
    return { ok: false, summary: "No hidden agenda is active for this team right now." };
  }
  team.cash -= 10;
  team.agendas.forEach((agenda) => {
    agenda.roundsUnmet = Math.max(0, (agenda.roundsUnmet || 0) - 1);
  });
  team.suspicion = Math.max(0, team.suspicion - 2);
  team.reputation += 1;
  return { ok: true, summary: `${team.name} hires a Crisis Consultant, cools suspicion, and buys time on its hidden agendas.` };
}

function buyDecoyCover(team) {
  if (team.cash < 5) {
    return { ok: false, summary: "You need $5 cash to stage a Decoy Cover asset." };
  }
  team.cash -= 5;
  team.decoyCoverSignals += 1;
  team.reputation += 1;
  return { ok: true, summary: `${team.name} stages a Decoy Cover asset and now looks better protected than it really is.` };
}

function launchFalseTraffic(team) {
  if (team.cash < 4) {
    return { ok: false, summary: "You need $4 cash to launch False Traffic." };
  }
  team.cash -= 4;
  team.falseTrafficSignals += 1;
  team.suspicion += 1;
  return { ok: true, summary: `${team.name} seeds false backchannel traffic to muddy future intel sweeps.` };
}

function plantControlledLeak(actor, targetId) {
  const target = getTeamById(targetId);
  if (!target || target.id === actor.id) {
    return { ok: false, summary: "Choose a rival before planting a Controlled Leak." };
  }
  if (actor.cash < 6) {
    return { ok: false, summary: "You need $6 cash to plant a Controlled Leak." };
  }
  actor.cash -= 6;
  actor.influence += 1;
  actor.suspicion += 2;
  target.plantedStrainSignals += 1;
  return { ok: true, summary: `${actor.name} plants a Controlled Leak around ${target.name} and makes that firm look more strained than it really is.` };
}

function buildCounterintelSignals(target, mode) {
  const unresolvedAgendas = target.agendas.filter((agenda) => {
    const definition = HIDDEN_AGENDA_DEFINITIONS[agenda.type];
    return definition && !definition.isComplete(target, getRankedTeams(true), state, agenda);
  });
  const maxUnmet = unresolvedAgendas.reduce((max, agenda) => Math.max(max, agenda.roundsUnmet || 0), 0);
  const isCleanSweep = mode === "clean";
  const fakeStrain = !isCleanSweep && target.plantedStrainSignals > 0;
  const fakeCover = !isCleanSweep && target.decoyCoverSignals > 0;
  const fakeTraffic = !isCleanSweep && target.falseTrafficSignals > 0;

  let pressureSignal = "No active hidden strain detected";
  if (maxUnmet >= 2 || unresolvedAgendas.some((agenda) => (agenda.pressureHits || 0) > 0)) {
    pressureSignal = "High hidden strain risk";
  } else if (unresolvedAgendas.length || fakeStrain) {
    pressureSignal = "Low hidden strain signal";
  }

  let coverSignal = target.agendaShieldCharges > 0
    ? `Cover assets detected (${target.agendaShieldCharges})`
    : "No active cover assets detected";
  if (!target.agendaShieldCharges && fakeCover) {
    coverSignal = `Cover assets detected (${target.decoyCoverSignals})`;
  }

  let covertSignal = target.covertMessagesSent >= 2
    ? "Heavy backchannel traffic"
    : target.covertMessagesSent >= 1
      ? "Some backchannel traffic"
      : "No meaningful backchannel traffic detected";
  if (target.covertMessagesSent === 0 && fakeTraffic) {
    covertSignal = target.falseTrafficSignals >= 2
      ? "Heavy backchannel traffic"
      : "Some backchannel traffic";
  }

  return {
    pressureSignal,
    coverSignal,
    covertSignal
  };
}

function runCounterintelSweep(actor, targetId, mode = "standard") {
  const target = getTeamById(targetId);
  if (!target || target.id === actor.id) {
    return { ok: false, summary: "Choose a rival before running a counterintelligence sweep." };
  }
  const isCleanSweep = mode === "clean";
  const cost = isCleanSweep ? 11 : 7;
  if (actor.cash < cost) {
    return { ok: false, summary: `You need $${cost} cash to investigate that team.` };
  }

  actor.cash -= cost;
  actor.influence += 1;
  actor.suspicion += isCleanSweep ? 2 : 1;

  const {
    pressureSignal,
    coverSignal,
    covertSignal
  } = buildCounterintelSignals(target, mode);

  actor.intelReports.unshift({
    id: `intel-${Math.random().toString(36).slice(2, 9)}`,
    round: state.round,
    targetId: target.id,
    mode,
    pressureSignal,
    coverSignal,
    covertSignal
  });
  actor.intelReports = actor.intelReports.slice(0, 6);

  return { ok: true, summary: `${actor.name} investigates ${target.name} and saves a private note.` };
}

function playShadowCard(team, cardId, targetId) {
  const card = team.inbox.find((entry) => entry.id === cardId && entry.status === "ready");
  if (!card) {
    return { ok: false, summary: "That shadow card is no longer live." };
  }

  const definition = SHADOW_CARD_DEFINITIONS[card.type];
  if (!definition) {
    return { ok: false, summary: "That shadow card type is not recognized." };
  }

  const target = definition.targeted ? getTeamById(targetId) : null;
  if (target && team.alliedWith.includes(target.id)) {
    team.attacksOnAllies += 1;
  }
  const result = definition.apply(team, target, state, card);
  if (!result.ok) {
    return result;
  }

  card.status = "played";
  card.targetId = target?.id || null;
  card.playedRound = state.round;
  return result;
}

function respondToCovertCard(team, cardId, response) {
  const card = team.inbox.find((entry) => entry.id === cardId && entry.status === "ready");
  if (!card) {
    return { ok: false, summary: "That covert card is no longer available." };
  }

  const sender = getTeamById(card.fromId);
  if (!sender) {
    return { ok: false, summary: "The sender for that covert card no longer exists." };
  }

  if (card.type === "secret-offer") {
    if (response === "accept") {
      if (!getActiveDealBetween(sender.id, team.id)) {
        makeAlliance(sender, team);
        sender.everHadPact = true;
        team.everHadPact = true;
        state.deals.push({
          id: `deal-${Math.random().toString(36).slice(2, 9)}`,
          fromId: sender.id,
          toId: team.id,
          type: card.dealType || "handshake",
          status: "active",
          roundCreated: state.round
        });
        if ((card.dealType || "handshake") === "formal") {
          sender.influence += 3;
          team.influence += 3;
          sender.reputation += 2;
          team.reputation += 2;
        } else {
          sender.influence += 2;
          team.influence += 2;
          sender.reputation += 1;
          team.reputation += 1;
        }
      }
      card.status = "accepted";
      return { ok: true, summary: `${team.name} accepts a private offer from ${sender.name} and turns it into a live pact.` };
    }

    card.status = "rejected";
    sender.reputation -= 2;
    team.influence += 1;
    return { ok: true, summary: `${team.name} rejects ${sender.name}'s private offer and keeps the leverage for itself.` };
  }

  if (card.type === "blackmail-demand") {
    if (response === "comply") {
      team.cash -= 8;
      team.reputation -= 2;
      sender.cash += 8;
      sender.influence += 2;
      card.status = "complied";
      return { ok: true, summary: `${team.name} quietly complies with ${sender.name}'s blackmail demand and pays to make it go away.` };
    }

    team.reputation -= 4;
    sender.suspicion += 8;
    sender.reputation -= 5;
    card.status = "resisted";
    return { ok: true, summary: `${team.name} resists ${sender.name}'s blackmail demand and forces the dirt into daylight.` };
  }

  return { ok: false, summary: "That covert card cannot be responded to." };
}

function applyTeacherShock(type, teamId) {
  const definition = SHOCK_DEFINITIONS[type];
  const target = getTeamById(teamId);
  if (!definition || !target) {
    return;
  }
  const message = definition.apply(target, state);
  logEvent("Teacher Shock", message);
  clampStats();
  render();
}

function toggleTeamControl(teamId) {
  const team = getTeamById(teamId);
  if (!team) {
    return;
  }
  team.control = team.control === "human" ? "ai" : "human";
  logEvent("Seat Shift", `${team.name} is now ${team.control === "ai" ? "AI autopilot" : "a student-controlled seat"}.`);

  if (team.id === state.selectedTeamId && team.control === "ai" && !state.gameOver) {
    processAutomaticSeats();
  } else {
    render();
  }
}

function clampStats() {
  state.teams.forEach((team) => {
    team.cash = Math.max(0, Math.round(team.cash));
    team.influence = Math.max(0, Math.min(99, Math.round(team.influence)));
    team.reputation = Math.max(0, Math.min(99, Math.round(team.reputation)));
    team.suspicion = Math.max(0, Math.min(99, Math.round(team.suspicion)));
  });
}

function applyHiddenAgendaPressure() {
  const rankedByBaseScore = getRankedTeams(true);
  state.teams.forEach((team) => {
    team.agendas.forEach((agenda) => {
      const definition = HIDDEN_AGENDA_DEFINITIONS[agenda.type];
      if (!definition) {
        return;
      }

      if (definition.isComplete(team, rankedByBaseScore, state, agenda)) {
        agenda.roundsUnmet = 0;
        return;
      }

      agenda.roundsUnmet += 1;
      const shouldTrigger = agenda.roundsUnmet >= 2 && agenda.roundsUnmet % 2 === 0;
      if (!shouldTrigger) {
        return;
      }

      if (team.agendaShieldCharges > 0) {
        team.agendaShieldCharges -= 1;
        logEvent("Damage Control", `${team.name} absorbs a wave of pressure behind the scenes and keeps it from spilling into public view.`);
        return;
      }

      agenda.pressureHits += 1;
      const message = definition.applyPressure(team, rankedByBaseScore, state, agenda);
      logEvent("Internal Strain", message);
    });
  });
}

function getProposalScore(team, proposal) {
  if (proposal.focus === "influence") {
    return team.influence;
  }
  if (proposal.focus === "reputation") {
    return team.reputation;
  }
  if (proposal.focus === "cash") {
    return team.cash;
  }
  if (proposal.focus === "alliance") {
    return getAlliesForTeam(state, team.id).length * 18 + team.reputation;
  }
  return 0;
}

function resolveProposal() {
  const proposal = getCurrentProposal();
  const message = proposal.resolve(state);
  logEvent("Board Vote", message);
}

function resolveRoundEvent() {
  const event = ROUND_EVENTS[(state.round - 1) % ROUND_EVENTS.length];
  logEvent(event.title, event.detail(state));
}

function refillOpenContracts() {
  const openCount = state.contracts.filter((contract) => !contract.ownerId).length;
  for (let index = openCount; index < MAX_OPEN_CONTRACTS; index += 1) {
    state.contracts.push(generateContract(state));
  }
}

function findNextSeatId(currentId) {
  const order = state.teams.map((team) => team.id);
  const currentIndex = order.indexOf(currentId);
  for (let step = 1; step <= order.length; step += 1) {
    const candidateId = order[(currentIndex + step) % order.length];
    if (!state.teamsActedThisRound.includes(candidateId)) {
      return candidateId;
    }
  }
  return null;
}

function completeRoundIfNeeded() {
  if (state.teamsActedThisRound.length < state.teams.length) {
    return false;
  }

  resolveProposal();
  resolveRoundEvent();
  applyHiddenAgendaPressure();
  clampStats();
  refillOpenContracts();

  state.round += 1;
  state.currentProposalIndex += 1;
  state.teamsActedThisRound = [];
  state.briefRevealed = false;

  if (state.round > state.maxRounds) {
    state.gameOver = true;
    logEvent("Market Closed", "The final bell hits. Alliances are over; now the scorekeeping starts.");
    return true;
  }

  state.selectedTeamId = state.teams[0].id;
  logEvent("New Round", `Round ${state.round} opens with ${getCurrentProposal().title} at the center of the room.`);
  return true;
}

function advanceSeatAfterTurn(actor) {
  state.teamsActedThisRound.push(actor.id);
  if (completeRoundIfNeeded()) {
    return;
  }
  const nextSeatId = findNextSeatId(actor.id);
  if (nextSeatId) {
    state.selectedTeamId = nextSeatId;
    state.briefRevealed = false;
  }
}

function runAiTurn(team) {
  const openContracts = state.contracts.filter((contract) => !contract.ownerId);
  const allies = getAlliesForTeam(state, team.id);
  const rivals = state.teams.filter((entry) => entry.id !== team.id);
  const targetsWithContracts = rivals.filter((entry) => entry.contracts.length > 0);
  const nonAllies = rivals.filter((entry) => !team.alliedWith.includes(entry.id));

  if (team.contracts.length > 0 && Math.random() < 0.45) {
    if (sellSupply(team)) {
      logEvent("Sell Supply", `${team.name} moves product and cashes in on the current street demand.`);
      return;
    }
  }

  if (targetsWithContracts.length && team.trait.aggression > 0.58 && Math.random() < 0.3) {
    const target = targetsWithContracts[Math.floor(Math.random() * targetsWithContracts.length)];
    if (hostileTakeover(team, target)) {
      logEvent("Hijack Supply", `${team.name} hijacks supply from ${target.name}.`);
      return;
    }
  }

  if (nonAllies.length && team.trait.loyalty > 0.52 && Math.random() < 0.28) {
    const partner = nonAllies[Math.floor(Math.random() * nonAllies.length)];
    if (createDeal(team, partner, "handshake")) {
      logEvent("Alliance", `${team.name} teams up with ${partner.name}.`);
      return;
    }
  }

  if (openContracts.length) {
    const contract = [...openContracts].sort((left, right) => left.value - right.value)[0];
    if (takeContract(team, contract, "aggressive")) {
      logEvent("Buy Supply", `${team.name} buys ${contract.title}.`);
      return;
    }
  }

  if (allies.length && Math.random() > team.trait.loyalty + 0.25) {
    const ally = allies[Math.floor(Math.random() * allies.length)];
    if (betrayAlliance(team, ally)) {
      logEvent("Betrayal", `${team.name} betrays ${ally.name} for a quick cash grab.`);
      return;
    }
  }

  if (nonAllies.length && Math.random() < team.trait.aggression) {
    const target = nonAllies[Math.floor(Math.random() * nonAllies.length)];
    if (leakAgainstTeam(team, target)) {
      logEvent("Delay Shipment", `${team.name} slows down ${target.name}'s shipment.`);
      return;
    }
  }

  if (runPrCampaign(team) && Math.random() < 0.4) {
    logEvent("Lay Low", `${team.name} lays low and cools things down for a round.`);
    return;
  }

  holdPosition(team);
  logEvent("Pass", `${team.name} waits for a better opening.`);
}

function processAutomaticSeats() {
  while (!state.gameOver) {
    const active = getActiveTeam();
    if (!active || active.control === "human") {
      break;
    }
    runAiTurn(active);
    clampStats();
    advanceSeatAfterTurn(active);
  }
  render();
}

function performActiveAction(action) {
  if (state.gameOver) {
    return;
  }

  const actor = getActiveTeam();
  let performed = false;

  if (action.type === "contract") {
    const contract = state.contracts.find((entry) => entry.id === action.contractId);
    performed = takeContract(actor, contract, action.mode);
    if (performed) {
      logEvent("Buy Supply", `${actor.name} buys ${contract.title}.`);
    }
  } else if (action.type === "sell") {
    performed = sellSupply(actor);
    if (performed) {
      logEvent("Sell Supply", `${actor.name} sells supply for $${getCurrentSellPrice()} plus any alliance bonus.`);
    }
  } else if (action.type === "deal") {
    const target = getTeamById(action.targetId);
    performed = createDeal(actor, target, action.dealType);
    if (performed) {
      logEvent("Alliance", `${actor.name} makes an alliance with ${target.name}.`);
    }
  } else if (action.type === "ally") {
    const target = getTeamById(action.targetId);
    performed = createDeal(actor, target, "handshake");
    if (performed) {
      logEvent("Alliance", `${actor.name} makes an alliance with ${target.name}.`);
    }
  } else if (action.type === "leak") {
    const target = getTeamById(action.targetId);
    if (target) {
      performed = leakAgainstTeam(actor, target);
      if (performed) {
        logEvent("Delay Shipment", `${actor.name} delays ${target.name}'s shipment and costs them money.`);
      }
    }
  } else if (action.type === "hostile") {
    const target = getTeamById(action.targetId);
    if (target) {
      performed = hostileTakeover(actor, target);
      if (performed) {
        logEvent("Hijack Supply", `${actor.name} hijacks supply from ${target.name}.`);
      }
    }
  } else if (action.type === "betray") {
    const target = getTeamById(action.targetId);
    if (target) {
      performed = betrayAlliance(actor, target);
      if (performed) {
        logEvent("Betrayal", `${actor.name} betrays ${target.name} for a quick cash grab.`);
      }
    }
  } else if (action.type === "pr") {
    performed = runPrCampaign(actor);
    if (performed) {
      logEvent("Lay Low", `${actor.name} lays low and cools things down.`);
    }
  } else if (action.type === "hold") {
    performed = holdPosition(actor);
    if (performed) {
      logEvent("Pass", `${actor.name} passes and waits for a better opening.`);
    }
  } else if (action.type === "shadow-card") {
    const result = playShadowCard(actor, action.cardId, action.targetId);
    performed = result.ok;
    if (performed) {
      logEvent("Shadow Play", result.summary);
    } else {
      logEvent("Shadow Stall", result.summary);
    }
  } else if (action.type === "covert-send") {
    const result = deliverCovertMessage(actor.id, action.targetId, action.messageType, action.note, action.dealType);
    performed = result.ok;
    if (performed) {
      logEvent("Secret Deal", result.summary);
    } else {
      logEvent("Secret Deal", result.summary);
    }
  } else if (action.type === "covert-response") {
    const result = respondToCovertCard(actor, action.cardId, action.response);
    performed = result.ok;
    if (performed) {
      logEvent("Secret Deal", result.summary);
    } else {
      logEvent("Secret Deal", result.summary);
    }
  }

  if (!performed) {
    logEvent("No Move", `${actor.name} tried a move it could not afford or complete.`);
    render();
    return;
  }

  clampStats();
  advanceSeatAfterTurn(actor);
  processAutomaticSeats();
}

function calculateBaseScore(team) {
  return team.cash;
}

function getAgendaBonus(team, rankedTeams) {
  return team.agendas.reduce((total, agenda) => {
    const definition = HIDDEN_AGENDA_DEFINITIONS[agenda.type];
    if (!definition) {
      return total;
    }
    return total + (definition.isComplete(team, rankedTeams, state, agenda) ? definition.bonus : 0);
  }, 0);
}

function calculateNetWorth(team) {
  return team.cash;
}

function getRankedTeams(baseOnly = false) {
  return [...state.teams]
    .map((team) => ({ ...team, score: baseOnly ? calculateBaseScore(team) : calculateNetWorth(team) }))
    .sort((left, right) => (
      right.score - left.score
      || right.contracts.length - left.contracts.length
      || right.influence - left.influence
      || right.reputation - left.reputation
    ));
}

function renderTeamSelect() {
  elements.teamSelectGrid.innerHTML = state.teams.map((team) => {
    const seatState = state.selectedTeamId === team.id
      ? "Your turn"
      : state.teamsActedThisRound.includes(team.id)
        ? "Done this round"
        : team.control === "ai"
          ? "AI autopilot"
          : "Waiting";
    return `
      <div class="team-choice readonly ${state.selectedTeamId === team.id ? "active" : ""}">
        <span class="team-accent ${team.accent}">${team.name}</span>
        <h3>${team.identity}</h3>
        <p class="section-copy"><strong>Best at:</strong> ${team.perk}</p>
        <p class="section-copy"><strong>${seatState}</strong> · ${team.control === "human" ? "Student crew" : "Computer-run"}</p>
      </div>
    `;
  }).join("");
}

function renderTeacherPanel() {
  const activeTeam = getActiveTeam();
  elements.teacherPanel.innerHTML = `
    <div class="metrics-grid">
      <div class="info-tile">
        <span class="metric-label">Active Crew</span>
        <strong class="metric-value">${activeTeam.name}</strong>
        <p class="player-note">${activeTeam.control === "human" ? "Students should be making this move." : "AI will move automatically when it becomes active."}</p>
      </div>
      <div class="info-tile">
        <span class="metric-label">Round Progress</span>
        <strong class="metric-value">${state.teamsActedThisRound.length} / ${state.teams.length} seats used</strong>
        <p class="player-note">${state.maxRounds - state.round + 1 > 0 ? `${state.maxRounds - state.round + 1} rounds left after this one.` : "Final cash-out window."}</p>
      </div>
    </div>
    <div class="teacher-seat-grid">
      ${state.teams.map((team) => `
        <div class="teacher-seat-tile">
          <span class="team-accent ${team.accent}">${team.name}</span>
          <p class="player-note">${team.control === "human" ? "Human seat" : "AI autopilot"} · ${state.teamsActedThisRound.includes(team.id) ? "Already moved" : "Still live"}</p>
          <button type="button" class="small-action" data-toggle-control="${team.id}">${team.control === "human" ? "Switch To AI" : "Switch To Human"}</button>
        </div>
      `).join("")}
    </div>
    <div class="teacher-shock-panel">
      <label class="stacked-label">
        Event target
        <select id="teacher-target-select">
          ${state.teams.map((team) => `<option value="${team.id}" ${state.teacherTargetId === team.id ? "selected" : ""}>${team.name}</option>`).join("")}
        </select>
      </label>
      <div class="shock-actions">
        ${Object.entries(SHOCK_DEFINITIONS).map(([key, value]) => `
          <button type="button" class="small-action" data-shock="${key}">${value.label}</button>
        `).join("")}
      </div>
    </div>
  `;

  elements.teacherPanel.querySelectorAll("[data-toggle-control]").forEach((button) => {
    button.addEventListener("click", () => toggleTeamControl(button.dataset.toggleControl));
  });

  const teacherTargetSelect = elements.teacherPanel.querySelector("#teacher-target-select");
  teacherTargetSelect?.addEventListener("change", (event) => {
    state.teacherTargetId = event.target.value;
  });

  elements.teacherPanel.querySelectorAll("[data-shock]").forEach((button) => {
    button.addEventListener("click", () => applyTeacherShock(button.dataset.shock, state.teacherTargetId));
  });
}

function renderDealPanel() {
  elements.dealPanel.innerHTML = `
    <div class="objective-card">
      <span class="team-accent gold">Goal</span>
      <strong>Finish with the most money.</strong>
      <p class="player-note">You are trying to buy knockoff fashion and shoes, sell at the right time, and beat the other teams in cash.</p>
    </div>
    <div class="walkthrough-steps">
      <div class="step-card">
        <span class="step-number">1</span>
        <strong>Check the sell price</strong>
        <p class="player-note">Look at the This Round card first. A higher sell price means it may be a good time to cash out.</p>
      </div>
      <div class="step-card">
        <span class="step-number">2</span>
        <strong>Pick one move</strong>
        <p class="player-note">Choose one action only: Buy Supply, Sell Supply, Make Alliance, Delay Shipment, Hijack Supply, or End Turn.</p>
      </div>
      <div class="step-card">
        <span class="step-number">3</span>
        <strong>Use your team edge</strong>
        <p class="player-note">Every team is best at one thing. Check your Team Brief before you choose.</p>
      </div>
      <div class="step-card">
        <span class="step-number">4</span>
        <strong>Pass to the next team</strong>
        <p class="player-note">After your move, end your turn. When all teams go, the round wraps up and a new one begins.</p>
      </div>
    </div>
    <div class="objective-card">
      <span class="team-accent teal">Simple Strategy</span>
      <p class="player-note">No supply yet? Buy supply or make an alliance. Holding supply? Sell when the price looks strong. Need to slow a rival? Use sabotage.</p>
    </div>
  `;
}

function getTurnAdvice(player, allies) {
  if (player.contracts.length > 0 && getCurrentSellPrice() >= 16) {
    return {
      label: "Best next step",
      title: "Selling is a strong option right now.",
      body: `You have ${player.contracts.length} supply drop${player.contracts.length === 1 ? "" : "s"}, and the sell price is high at $${getCurrentSellPrice()}. Cashing out now is simple and safe.`,
      checklist: [
        "Press Sell Supply if you want quick money now.",
        allies.length ? `You also get an alliance bonus from ${allies.length} ally${allies.length === 1 ? "" : "ies"}.` : "You do not have an alliance bonus yet.",
        "If you think the price may rise again later, you can hold instead."
      ]
    };
  }

  if (player.contracts.length === 0) {
    return {
      label: "Best next step",
      title: "You need inventory first.",
      body: "You cannot make money from selling until you are holding supply.",
      checklist: [
        "Buy Supply if you want the fastest path to future profit.",
        "Make Alliance if you want a bonus when you sell later.",
        "End Turn if you want to play it safe this round."
      ]
    };
  }

  return {
    label: "Best next step",
    title: "You have options this round.",
    body: `You are holding ${player.contracts.length} supply drop${player.contracts.length === 1 ? "" : "s"} and the sell price is $${getCurrentSellPrice()}.`,
    checklist: [
      "Sell now if you want guaranteed money.",
      "Make Alliance if you want a bigger sale bonus later.",
      "Sabotage a rival if someone else is pulling ahead."
    ]
  };
}

function renderPlayerSummary() {
  const player = getActiveTeam();
  elements.playerTeamLabel.textContent = player.name;
  elements.warRoomName.textContent = `${player.name} Briefing`;
  elements.toggleBriefBtn.textContent = state.briefRevealed ? "Hide Team Brief" : "Open Team Brief";

  const allies = getAlliesForTeam(state, player.id);
  if (!state.briefRevealed) {
    elements.playerSummary.innerHTML = `
      <div class="objective-card masked-brief">
        <span class="team-accent ${player.accent}">Team Brief Hidden</span>
        <strong>Pass the device to ${player.name}</strong>
        <p class="player-note">Show the brief when that team is ready. Hide it again before passing to the next team.</p>
      </div>
    `;
    return;
  }

  const turnAdvice = getTurnAdvice(player, allies);
  elements.playerSummary.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-chip">
        <span class="metric-label">Cash</span>
        <strong class="metric-value good">$${player.cash}</strong>
      </div>
      <div class="metric-chip">
        <span class="metric-label">Supply</span>
        <strong class="metric-value">${player.contracts.length}</strong>
      </div>
      <div class="metric-chip">
        <span class="metric-label">Allies</span>
        <strong class="metric-value">${allies.length}</strong>
      </div>
    </div>
    <div class="objective-card">
      <span class="team-accent ${player.accent}">Your Turn</span>
      <strong>Pick one move, then pass.</strong>
      <p class="player-note">Start by checking the sell price, then choose one move: buy supply, sell supply, make an alliance, delay a rival, hijack supply, or end your turn.</p>
    </div>
    <div class="objective-card">
      <span class="team-accent ${player.accent}">${turnAdvice.label}</span>
      <strong>${turnAdvice.title}</strong>
      <p class="player-note">${turnAdvice.body}</p>
      <div class="turn-checklist">
        ${turnAdvice.checklist.map((item) => `<p class="player-note">${item}</p>`).join("")}
      </div>
    </div>
    <div class="objective-card">
      <span class="team-accent ${player.accent}">Crew Edge</span>
      <strong>${player.name}</strong>
      <p class="player-note">${player.identity}</p>
      <p class="player-note"><strong>Best at:</strong> ${player.perk}</p>
    </div>
    <div class="objective-card">
      <span class="team-accent ${player.accent}">Current Position</span>
      <p class="player-note">${allies.length ? `Allied with ${allies.map((team) => team.name).join(", ")}.` : "No active allies right now."}</p>
      <p class="player-note">${player.contracts.length ? `You are holding ${player.contracts.length} supply drops.` : "You are not holding any supply yet."}</p>
    </div>
  `;
}

function renderHiddenAgendasMarkup(team, rankedTeams) {
  if (!team.agendas.length) {
    return `<div class="empty-state">No hidden agenda is assigned to this team right now.</div>`;
  }

  return team.agendas.map((agenda) => {
    const definition = HIDDEN_AGENDA_DEFINITIONS[agenda.type];
    const target = agenda.targetTeamId ? getTeamById(agenda.targetTeamId) : null;
    const complete = definition?.isComplete(team, rankedTeams, state, agenda);
    return `
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge demand">${definition?.label || "Agenda"}</span>
            <h3>Bonus ${definition?.bonus || 0} points</h3>
          </div>
          <strong class="contract-value ${complete ? "success" : ""}">${complete ? "Live" : "Pending"}</strong>
        </div>
        <p class="contract-meta">${definition?.description || ""}</p>
        ${target ? `<p class="player-note">Target rival: ${target.name}</p>` : ""}
        ${agenda.note ? `<p class="player-note shadow-note">${escapeHtml(agenda.note)}</p>` : ""}
        <p class="player-note">${definition?.progress(team, rankedTeams, state, agenda) || ""}</p>
        <p class="player-note">Pressure hits: ${agenda.pressureHits || 0} · unmet rounds: ${agenda.roundsUnmet || 0}</p>
      </div>
    `;
  }).join("");
}

function renderProtectionDeskMarkup(team) {
  return `
    <div class="metrics-grid">
      <div class="info-tile">
        <span class="metric-label">Cover Ready</span>
        <strong class="metric-value">${team.agendaShieldCharges}</strong>
        <p class="player-note">Each Cover Story blocks one future pressure hit.</p>
      </div>
      <div class="info-tile">
        <span class="metric-label">Cash On Hand</span>
        <strong class="metric-value good">$${team.cash}</strong>
        <p class="player-note">Staying safe costs money, but it can save your team later.</p>
      </div>
    </div>
    <div class="deal-type-grid compact-grid">
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge brief">Cover Story Card</span>
            <h3>Cost $6</h3>
          </div>
          <strong class="contract-value">Block</strong>
        </div>
        <p class="contract-meta">Blocks the next pressure hit that would otherwise hurt your team.</p>
        <button type="button" class="action-button" data-protection-action="cover-story" ${state.gameOver ? "disabled" : ""}>Buy Cover</button>
      </div>
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge tip">Crisis Consultant</span>
            <h3>Cost $10</h3>
          </div>
          <strong class="contract-value">Recover</strong>
        </div>
        <p class="contract-meta">Calms things down, lowers suspicion, and gives your team breathing room.</p>
        <button type="button" class="action-button" data-protection-action="crisis-consultant" ${state.gameOver ? "disabled" : ""}>Get Help</button>
      </div>
    </div>
  `;
}

function renderDeceptionDeskMarkup(team, deceptionTargets) {
  return `
    <div class="metrics-grid">
      <div class="info-tile">
        <span class="metric-label">Decoy Cover</span>
        <strong class="metric-value">${team.decoyCoverSignals}</strong>
        <p class="player-note">Fake protection that can fool standard sweeps into reporting cover assets.</p>
      </div>
      <div class="info-tile">
        <span class="metric-label">False Traffic</span>
        <strong class="metric-value">${team.falseTrafficSignals}</strong>
        <p class="player-note">Fake chatter that can make your wire look busier than it really is.</p>
      </div>
    </div>
    <div class="deal-type-grid compact-grid">
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge handshake">Decoy Cover</span>
            <h3>Cost $5</h3>
          </div>
          <strong class="contract-value">Fake Shield</strong>
        </div>
        <p class="contract-meta">Makes standard sweeps more likely to think you have real cover assets ready.</p>
        <button type="button" class="action-button" data-deception-action="decoy-cover" ${state.gameOver ? "disabled" : ""}>Stage Decoy Cover</button>
      </div>
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge demand">False Traffic</span>
            <h3>Cost $4</h3>
          </div>
          <strong class="contract-value">Static</strong>
        </div>
        <p class="contract-meta">Flood the wire so standard sweeps read covert activity that may not really exist.</p>
        <button type="button" class="action-button" data-deception-action="false-traffic" ${state.gameOver ? "disabled" : ""}>Launch False Traffic</button>
      </div>
    </div>
    <label class="stacked-label">
      Controlled Leak target
      <select id="deception-target-select">
        ${deceptionTargets.map((entry) => `<option value="${entry.id}" ${state.deceptionTargetId === entry.id ? "selected" : ""}>${entry.name}</option>`).join("")}
      </select>
    </label>
    <div class="shadow-card">
      <div class="contract-head">
        <div>
          <span class="alliance-badge brief">Controlled Leak</span>
          <h3>Cost $6</h3>
        </div>
        <strong class="contract-value">False Strain</strong>
      </div>
      <p class="contract-meta">Make one rival look more strained to standard sweeps without revealing your hand publicly.</p>
      <button type="button" class="action-button" id="plant-controlled-leak-btn" ${state.gameOver ? "disabled" : ""}>Plant Controlled Leak</button>
    </div>
  `;
}

function renderCounterintelDeskMarkup(team, intelTargets) {
  const reports = team.intelReports.length
    ? team.intelReports.map((report) => {
        const target = getTeamById(report.targetId);
        return `
          <div class="shadow-card">
            <div class="contract-head">
              <div>
                <span class="alliance-badge offer">Round ${report.round} check</span>
                <h3>${target?.name || "Unknown Target"}</h3>
              </div>
              <strong class="contract-value">Intel</strong>
            </div>
            <p class="player-note">${report.pressureSignal}</p>
            <p class="player-note">${report.coverSignal}</p>
            <p class="player-note">${report.covertSignal}</p>
          </div>
        `;
      }).join("")
    : `<div class="empty-state">No investigation notes yet. Check a rival team to get a rough read on them.</div>`;

  return `
    <div class="metrics-grid">
      <div class="info-tile">
        <span class="metric-label">Check Cost</span>
        <strong class="metric-value">$7</strong>
        <p class="player-note">Use your turn to get a rough read on one rival team.</p>
      </div>
      <div class="info-tile">
        <span class="metric-label">Notes Saved</span>
        <strong class="metric-value">${team.intelReports.length}</strong>
        <p class="player-note">You only get clues, not the full truth.</p>
      </div>
    </div>
    <label class="stacked-label">
      Check this team
      <select id="counterintel-target-select">
        ${intelTargets.map((entry) => `<option value="${entry.id}" ${state.counterintelTargetId === entry.id ? "selected" : ""}>${entry.name}</option>`).join("")}
      </select>
    </label>
    <button type="button" class="hero-button" id="run-counterintel-btn" ${state.gameOver ? "disabled" : ""}>Investigate Team</button>
    <div class="shadow-inbox">${reports}</div>
  `;
}

function renderShadowInboxMarkup(team) {
  const liveCards = team.inbox.filter((card) => card.status === "ready");
  if (!liveCards.length) {
    return `<div class="empty-state">No private notes are waiting for this crew right now.</div>`;
  }

  const rivalOptions = state.teams
    .filter((entry) => entry.id !== team.id)
    .map((entry) => `<option value="${entry.id}">${entry.name}</option>`)
    .join("");

  return liveCards.map((card) => {
    const definition = SHADOW_CARD_DEFINITIONS[card.type];
    const sender = card.fromId ? getTeamById(card.fromId) : null;
    return `
      <div class="shadow-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge ${definition.chip}">${definition.label}</span>
            <h3>Round ${card.roundDelivered} delivery</h3>
          </div>
          <strong class="contract-value">${definition.targeted ? "Targeted" : "Private"}</strong>
        </div>
        ${sender ? `<p class="player-note">From ${sender.name}${card.dealType ? ` · ${card.dealType === "formal" ? DEAL_TYPES.formal.label : DEAL_TYPES.handshake.label}` : ""}</p>` : ""}
        <p class="contract-meta">${definition.description}</p>
        ${card.note ? `<p class="player-note shadow-note">${escapeHtml(card.note)}</p>` : ""}
        ${definition.targeted ? `
          <label class="stacked-label">
            Choose rival
            <select data-shadow-target="${card.id}">
              ${rivalOptions}
            </select>
          </label>
        ` : ""}
        <div class="faction-actions">
          ${renderShadowActionButtons(card)}
          <button type="button" class="small-action" data-shadow-archive="${card.id}">Archive</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderShadowActionButtons(card) {
  if (card.type === "secret-offer") {
    return `
      <button type="button" class="action-button" data-covert-response="accept" data-covert-card="${card.id}">Accept Offer</button>
      <button type="button" class="small-action" data-covert-response="reject" data-covert-card="${card.id}">Reject Offer</button>
    `;
  }
  if (card.type === "blackmail-demand") {
    return `
      <button type="button" class="action-button" data-covert-response="comply" data-covert-card="${card.id}">Comply</button>
      <button type="button" class="small-action" data-covert-response="resist" data-covert-card="${card.id}">Resist</button>
    `;
  }
  return `<button type="button" class="action-button" data-shadow-play="${card.id}">${card.type === "private-brief" ? "Mark Reviewed" : "Play This Card"}</button>`;
}

function renderShadowOutboxMarkup(player, covertTargets) {
  return `
    <label class="stacked-label">
      Recipient
      <select id="covert-recipient-select">
        ${covertTargets.map((team) => `<option value="${team.id}" ${state.covertRecipientId === team.id ? "selected" : ""}>${team.name}</option>`).join("")}
      </select>
    </label>
    <label class="stacked-label">
      Private note
      <textarea id="covert-note-input" rows="3" placeholder="Optional note only that team will see.">${escapeHtml(state.covertNote)}</textarea>
    </label>
    <p class="player-note">This sends a private alliance offer. They can accept or reject it on their turn.</p>
    <button type="button" id="send-covert-message-btn" class="hero-button" ${state.gameOver ? "disabled" : ""}>Send Secret Deal</button>
  `;
}

function bindShadowInboxEvents(team) {
  elements.playerSummary.querySelectorAll("[data-shadow-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const cardId = button.dataset.shadowPlay;
      const card = team.inbox.find((entry) => entry.id === cardId);
      if (!card) {
        return;
      }
      if (card.type === "private-brief") {
        archiveShadowCard(team, cardId);
        return;
      }
      const targetSelect = elements.playerSummary.querySelector(`[data-shadow-target="${cardId}"]`);
      const targetId = targetSelect?.value || null;
      performActiveAction({
        type: "shadow-card",
        cardId,
        targetId
      });
    });
  });

  elements.playerSummary.querySelectorAll("[data-shadow-archive]").forEach((button) => {
    button.addEventListener("click", () => archiveShadowCard(team, button.dataset.shadowArchive));
  });

  elements.playerSummary.querySelectorAll("[data-covert-response]").forEach((button) => {
    button.addEventListener("click", () => {
      performActiveAction({
        type: "covert-response",
        cardId: button.dataset.covertCard,
        response: button.dataset.covertResponse
      });
    });
  });
}

function bindProtectionDeskEvents() {
  elements.playerSummary.querySelectorAll("[data-protection-action]").forEach((button) => {
    button.addEventListener("click", () => {
      performActiveAction({ type: button.dataset.protectionAction });
    });
  });
}

function bindDeceptionDeskEvents() {
  elements.playerSummary.querySelector("#deception-target-select")?.addEventListener("change", (event) => {
    state.deceptionTargetId = event.target.value;
  });
  elements.playerSummary.querySelectorAll("[data-deception-action]").forEach((button) => {
    button.addEventListener("click", () => {
      performActiveAction({ type: button.dataset.deceptionAction });
    });
  });
  elements.playerSummary.querySelector("#plant-controlled-leak-btn")?.addEventListener("click", () => {
    performActiveAction({
      type: "controlled-leak",
      targetId: state.deceptionTargetId
    });
  });
}

function bindCounterintelDeskEvents() {
  elements.playerSummary.querySelector("#counterintel-target-select")?.addEventListener("change", (event) => {
    state.counterintelTargetId = event.target.value;
  });
  elements.playerSummary.querySelector("#run-counterintel-btn")?.addEventListener("click", () => {
    performActiveAction({
      type: "counterintel-scan",
      targetId: state.counterintelTargetId,
      mode: "standard"
    });
  });
}

function bindShadowOutboxEvents() {
  elements.playerSummary.querySelector("#covert-recipient-select")?.addEventListener("change", (event) => {
    state.covertRecipientId = event.target.value;
  });
  elements.playerSummary.querySelector("#covert-note-input")?.addEventListener("input", (event) => {
    state.covertNote = event.target.value;
  });
  elements.playerSummary.querySelector("#send-covert-message-btn")?.addEventListener("click", () => {
    const note = state.covertNote;
    state.covertNote = "";
    performActiveAction({
      type: "covert-send",
      targetId: state.covertRecipientId,
      messageType: "secret-offer",
      dealType: "handshake",
      note
    });
  });
}

function renderProposalPanel() {
  const proposal = getCurrentProposal();
  elements.roundIndicator.textContent = `${Math.min(state.round, state.maxRounds)} / ${state.maxRounds}`;
  elements.proposalFocus.textContent = proposal ? `$${getCurrentSellPrice()}` : "Closed";
  elements.proposalTitle.textContent = proposal ? proposal.title : "Session Over";

  if (!proposal) {
    elements.proposalPanel.innerHTML = `<div class="empty-state">The game is over. Use the results panel below to inspect the outcome.</div>`;
    return;
  }

  elements.proposalPanel.innerHTML = `
    <div class="proposal-detail">
      <span class="proposal-tag ${proposal.focus}">Sell price: $${getCurrentSellPrice()}</span>
      <p class="proposal-copy">${proposal.description}</p>
    </div>
    <div class="proposal-stats">
      <div class="proposal-stat">
        <span class="mini-label">Step 1</span>
        <strong>Check this sell price first</strong>
      </div>
      <div class="proposal-stat">
        <span class="mini-label">Step 2</span>
        <strong>Then choose one move</strong>
      </div>
      <div class="proposal-stat">
        <span class="mini-label">Alliance bonus</span>
        <strong>$2 per ally when you sell</strong>
      </div>
      <div class="proposal-stat">
        <span class="mini-label">Goal</span>
        <strong>Most cash wins</strong>
      </div>
    </div>
  `;
}

function renderContractBoard() {
  const openContracts = state.contracts.filter((contract) => !contract.ownerId);
  if (!openContracts.length) {
    elements.contractBoard.innerHTML = `<div class="empty-state">No open contracts right now. Finish the round and more opportunities will appear.</div>`;
    return;
  }

  elements.contractBoard.innerHTML = openContracts.map((contract) => `
    <div class="contract-card">
      <div class="contract-head">
        <div>
          <span class="contract-tag">${contract.sector}</span>
          <h3>${contract.title}</h3>
        </div>
        <strong class="contract-value">$${contract.value}</strong>
      </div>
      <p class="contract-meta">Buy this now. On a later turn, use Sell Supply to turn it into cash.</p>
      <div class="contract-actions">
        <button type="button" class="action-button" data-contract-action="aggressive" data-contract-id="${contract.id}" ${state.gameOver ? "disabled" : ""}>Buy Supply</button>
      </div>
    </div>
  `).join("");

  elements.contractBoard.querySelectorAll("[data-contract-action]").forEach((button) => {
    button.addEventListener("click", () => performActiveAction({
      type: "contract",
      mode: button.dataset.contractAction,
      contractId: button.dataset.contractId
    }));
  });
}

function renderFactionBoard() {
  const activeTeam = getActiveTeam();
  elements.factionBoard.innerHTML = state.teams.map((team) => {
    const allies = getAlliesForTeam(state, team.id);
    const deal = getActiveDealBetween(activeTeam.id, team.id);
    const isActive = team.id === activeTeam.id;
    return `
      <div class="faction-card ${isActive ? "player" : ""}">
        <div class="faction-head">
          <div>
            <span class="team-accent ${team.accent}">${team.name}</span>
            <h3>${team.identity}</h3>
          </div>
          <span class="alliance-badge ${allies.length === 0 ? "fragile" : ""}">
            ${allies.length === 0 ? "No allies" : `${allies.length} allies`}
          </span>
        </div>
        <div class="faction-metrics">
          <span class="mini-label">Cash $${team.cash} · Supply ${team.contracts.length} · Allies ${allies.length}</span>
          <p class="faction-copy"><strong>Best at:</strong> ${team.perk}</p>
          ${deal ? `<p class="player-note">Working with you: ${DEAL_TYPES[deal.type].label}</p>` : ""}
        </div>
        ${isActive ? "" : `
          <div class="faction-actions">
            ${deal ? "" : `<button type="button" class="small-action" data-faction-action="ally" data-target-id="${team.id}" ${state.gameOver ? "disabled" : ""}>Make Alliance</button>`}
            <button type="button" class="small-action" data-faction-action="leak" data-target-id="${team.id}" ${state.gameOver ? "disabled" : ""}>Delay Shipment</button>
            <button type="button" class="small-action" data-faction-action="hostile" data-target-id="${team.id}" ${state.gameOver || team.contracts.length === 0 ? "disabled" : ""}>Hijack Supply</button>
            ${deal ? `<button type="button" class="small-action" data-faction-action="betray" data-target-id="${team.id}" ${state.gameOver ? "disabled" : ""}>Betray</button>` : ""}
          </div>
        `}
      </div>
    `;
  }).join("");

  elements.factionBoard.querySelectorAll("[data-faction-action]").forEach((button) => {
    button.addEventListener("click", () => performActiveAction({
      type: button.dataset.factionAction,
      targetId: button.dataset.targetId
    }));
  });
}

function renderDealBoard() {
  const activeDeals = state.deals.filter((deal) => deal.status === "active");
  if (!activeDeals.length) {
    elements.dealBoard.innerHTML = `<div class="empty-state">No alliances yet. Teams can make one from the Other Teams panel.</div>`;
    return;
  }

  elements.dealBoard.innerHTML = activeDeals.map((deal) => {
    const fromTeam = getTeamById(deal.fromId);
    const toTeam = getTeamById(deal.toId);
    return `
      <div class="contract-card">
        <div class="contract-head">
          <div>
            <span class="alliance-badge ${DEAL_TYPES[deal.type].chip}">${DEAL_TYPES[deal.type].label}</span>
            <h3>${fromTeam.name} + ${toTeam.name}</h3>
          </div>
          <strong class="contract-value">R${deal.roundCreated}</strong>
        </div>
        <p class="contract-meta">${DEAL_TYPES[deal.type].description}</p>
      </div>
    `;
  }).join("");
}

function renderLeaderboard() {
  const ranked = getRankedTeams();
  elements.leaderboardPanel.innerHTML = ranked.map((team, index) => `
    <div class="leader-row ${team.id === state.selectedTeamId ? "player-row" : ""}">
      <div class="leader-rank">${index + 1}</div>
      <div>
        <h3 class="leader-name">${team.name}</h3>
        <div class="leader-metrics">
          <span class="mini-label">Cash $${team.cash} · Supply ${team.contracts.length} · Allies ${getAlliesForTeam(state, team.id).length}</span>
        </div>
      </div>
      <strong class="leader-score">$${team.score}</strong>
    </div>
  `).join("");
}

function renderLogs() {
  elements.logPanel.innerHTML = state.logs.map((entry) => `
    <div class="log-entry">
      <div class="log-entry-inner">
        <span class="log-tag">Round ${entry.round} · ${entry.tag}</span>
        <p>${entry.message}</p>
      </div>
    </div>
  `).join("");
}

function renderDebrief() {
  if (!state.gameOver) {
    elements.debriefPanel.innerHTML = `
      <div class="debrief-copy">
        <p>Each round, every team gets one move. Then the sell price stays live, an event hits, and the next round begins.</p>
        <p>The win condition is simple: finish with the most cash.</p>
      </div>
    `;
    return;
  }

  const ranked = getRankedTeams();
  elements.debriefPanel.innerHTML = `
    <div class="debrief-copy">
      <p>The market is shut down. Here is how the crews finished after the last round of knockoff sales.</p>
    </div>
    <div class="debrief-rankings">
      ${ranked.map((team, index) => {
        return `
          <div class="leader-row ${team.id === state.selectedTeamId ? "player-row" : ""}">
            <div class="leader-rank">${index + 1}</div>
            <div>
              <h3 class="leader-name">${team.name}</h3>
              <div class="leader-metrics">
                <span class="mini-label">Cash $${team.cash} · Supply ${team.contracts.length} · Allies ${getDealsForTeam(team.id).length}</span>
              </div>
            </div>
            <strong class="leader-score">$${team.score}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function render() {
  elements.lobbyActionBtn.disabled = state.gameOver;
  elements.prActionBtn.disabled = state.gameOver;
  elements.holdPositionBtn.disabled = state.gameOver;
  renderTeamSelect();
  renderTeacherPanel();
  renderDealPanel();
  renderPlayerSummary();
  renderProposalPanel();
  renderContractBoard();
  renderFactionBoard();
  renderDealBoard();
  renderLeaderboard();
  renderLogs();
  renderDebrief();
}

function bindGlobalEvents() {
  elements.resetGameBtn.addEventListener("click", resetGame);
  elements.lobbyActionBtn.addEventListener("click", () => performActiveAction({ type: "sell" }));
  elements.prActionBtn.addEventListener("click", () => performActiveAction({ type: "pr" }));
  elements.holdPositionBtn.addEventListener("click", () => performActiveAction({ type: "hold" }));
  elements.toggleBriefBtn.addEventListener("click", () => {
    state.briefRevealed = !state.briefRevealed;
    renderPlayerSummary();
  });
}

function renderGameToText() {
  const ranked = getRankedTeams();
  const activeTeam = getActiveTeam();
  const proposal = getCurrentProposal();
  const payload = {
    coordinateSystem: "DOM UI, no spatial coordinates. Read current market state from cards and controls.",
    mode: state.gameOver ? "finished" : "active",
    round: state.round,
    maxRounds: state.maxRounds,
    activeSeat: activeTeam.name,
    activeSeatControl: activeTeam.control,
    proposal: proposal ? { title: proposal.title, sellPrice: getCurrentSellPrice() } : null,
    seatProgress: {
      acted: [...state.teamsActedThisRound],
      remaining: state.teams.filter((team) => !state.teamsActedThisRound.includes(team.id)).map((team) => team.name)
    },
    activeTeam: {
      cash: activeTeam.cash,
      supply: activeTeam.contracts.length,
      allies: getAlliesForTeam(state, activeTeam.id).map((team) => team.name),
      briefRevealed: state.briefRevealed
    },
    openContracts: state.contracts
      .filter((contract) => !contract.ownerId)
      .map((contract) => ({ title: contract.title, value: contract.value, sector: contract.sector })),
    deals: state.deals
      .filter((deal) => deal.status === "active")
      .map((deal) => ({
        type: deal.type,
        from: getTeamById(deal.fromId).name,
        to: getTeamById(deal.toId).name
      })),
    standings: ranked.map((team) => ({
      name: team.name,
      score: team.score,
      cash: team.cash,
      supply: team.contracts.length,
      allies: getAlliesForTeam(state, team.id).length,
      control: team.control
    })),
    recentLog: state.logs.slice(0, 6).map((entry) => ({ round: entry.round, tag: entry.tag, message: entry.message }))
  };
  return JSON.stringify(payload);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

window.render_game_to_text = renderGameToText;
window.advanceTime = () => {
  render();
};

bindGlobalEvents();
resetGame();
