const INITIAL_CASH = 40;
const TRADE_SIZE = 5;
const LIVE_POLL_MS = 10000;
const GOLD_MARKET_ART = {
  sharedPoolLive: "/assets/gold-market/shared-pool-live.png",
  privateBets: "/assets/gold-market/private-bets.png",
  newMarketPublished: "/assets/gold-market/new-market-published.png",
  waitingForTeacher: "/assets/gold-market/waiting-for-teacher.png",
  noLiveMarkets: "/assets/gold-market/no-live-markets.png",
  disciplinedTrader: "/assets/gold-market/disciplined-trader.png",
  chasingLosses: "/assets/gold-market/chasing-losses.png",
  fomo: "/assets/gold-market/fomo.png",
  finalDebrief: "/assets/gold-market/final-debrief.png",
  marketClosed: "/assets/gold-market/market-closed.png",
  walletRefilled: "/assets/gold-market/wallet-refilled.png",
  stayInCash: "/assets/gold-market/stay-in-cash.png",
  resolvedNo: "/assets/gold-market/resolved-no.png",
  resolvedYes: "/assets/gold-market/resolved-yes.png",
  resultsBoard: "/assets/gold-market/results-board.png"
};

const DEMO_MARKET_DEFS = [
  {
    id: "storm",
    title: "Harbor City closes schools tomorrow",
    desk: "Weather desk",
    category: "Evidence-led",
    description: "A coastal district is watching an offshore storm line and trying to decide whether to cancel classes.",
    resolution: 1,
    lesson: "This market moved mostly on fresh evidence. The crowd did not need to be loud for the price to become more accurate.",
    rounds: [
      {
        price: 0.34,
        evidence: 52,
        hype: 18,
        signal: "Satellite models show a storm band forming, but track confidence is still mixed.",
        why: "Early meteorology models, not social chatter, are responsible for most of the opening move.",
        tag: "Evidence-led"
      },
      {
        price: 0.48,
        evidence: 68,
        hype: 24,
        signal: "Freight companies start delaying morning routes and local districts open emergency calls.",
        why: "Real institutions are reacting, which usually matters more than vibes.",
        tag: "Logistics confirms risk"
      },
      {
        price: 0.66,
        evidence: 81,
        hype: 21,
        signal: "The county weather office upgrades to a winter storm warning with heavy accumulation odds.",
        why: "A stronger official signal pushed the probability higher for a concrete reason.",
        tag: "Warning upgrade"
      },
      {
        price: 0.84,
        evidence: 93,
        hype: 19,
        signal: "Superintendent email draft leaks and bus contractors begin stand-down prep.",
        why: "Once operational plans move, the market becomes much less speculative.",
        tag: "Operational confirmation"
      }
    ]
  },
  {
    id: "album",
    title: "Pop star Vanta drops a surprise album tonight",
    desk: "Culture desk",
    category: "Rumor surge",
    description: "Fans are reading every social post as a clue, and the market is getting jumpy.",
    resolution: 0,
    lesson: "Crowd enthusiasm can push a market sharply higher even when the underlying evidence is weak.",
    rounds: [
      {
        price: 0.58,
        evidence: 29,
        hype: 72,
        signal: "A blurry screenshot and a cryptic emoji thread send fan accounts into a frenzy.",
        why: "This is mostly a sentiment move. The story feels exciting, but the proof is thin.",
        tag: "Rumor surge"
      },
      {
        price: 0.74,
        evidence: 27,
        hype: 87,
        signal: "A trending countdown hashtag convinces thousands of traders that tonight has to be the night.",
        why: "Attention is outrunning information. This is where FOMO can feel like certainty.",
        tag: "Meme acceleration"
      },
      {
        price: 0.39,
        evidence: 44,
        hype: 54,
        signal: "The artist's producer posts from a studio in another country, undercutting the release theory.",
        why: "One good contradiction can puncture a hype-driven market fast.",
        tag: "Contradiction lands"
      },
      {
        price: 0.16,
        evidence: 71,
        hype: 20,
        signal: "Midnight passes with no release and streaming editors say nothing is queued.",
        why: "When hard evidence finally catches up, the market collapses back toward reality.",
        tag: "Clock ran out"
      }
    ]
  },
  {
    id: "labor",
    title: "Metro Transit reaches a labor deal by Friday",
    desk: "Policy desk",
    category: "Balanced uncertainty",
    description: "Negotiators are still talking, but both sides keep floating selective leaks to influence the public.",
    resolution: 0,
    lesson: "Some markets stay genuinely uncertain for a while. Uncertainty is not a license to overbet.",
    rounds: [
      {
        price: 0.47,
        evidence: 46,
        hype: 33,
        signal: "Union members say talks improved, but management refuses to discuss pay numbers publicly.",
        why: "The market opens near the middle because the story is balanced and incomplete.",
        tag: "Balanced uncertainty"
      },
      {
        price: 0.42,
        evidence: 57,
        hype: 29,
        signal: "A city budget memo shows less room for concessions than traders expected.",
        why: "A quieter document moved the odds more than louder commentary.",
        tag: "Budget pressure"
      },
      {
        price: 0.55,
        evidence: 49,
        hype: 41,
        signal: "A television hit from one negotiator creates optimism, but no draft agreement appears.",
        why: "This is a softer move because the new information is partly theater.",
        tag: "Narrative swing"
      },
      {
        price: 0.28,
        evidence: 79,
        hype: 18,
        signal: "Weekend service contingency plans go public and both sides schedule more talks for next week.",
        why: "Preparation for failure is a strong clue that a deadline deal is unlikely.",
        tag: "Deadline slipping"
      }
    ]
  }
];

const refs = {
  metricsStrip: document.getElementById("metrics-strip"),
  workPanel: document.getElementById("work-panel"),
  roundHeading: document.getElementById("round-heading"),
  roundStatus: document.getElementById("round-status"),
  marketGrid: document.getElementById("market-grid"),
  newsPanel: document.getElementById("news-panel"),
  behaviorPanel: document.getElementById("behavior-panel"),
  journalPanel: document.getElementById("journal-panel"),
  footerPanel: document.getElementById("footer-panel"),
  finishPanel: document.getElementById("finish-panel"),
  marketPopup: document.getElementById("market-popup"),
  marketPopupTitle: document.getElementById("market-popup-title"),
  marketPopupDescription: document.getElementById("market-popup-description"),
  marketPopupMeta: document.getElementById("market-popup-meta")
};

let state = createDemoState();

document.addEventListener("click", handleClick);
render();
bootstrapBoard();
setInterval(() => {
  bootstrapBoard(false);
}, LIVE_POLL_MS);

window.render_game_to_text = renderGameToText;
window.advanceTime = async () => {
  render();
};

function createBaseState(mode) {
  return {
    mode,
    viewerRole: mode === "demo" ? "student" : "guest",
    canTrade: mode !== "live",
    round: 0,
    cash: mode === "demo" ? INITIAL_CASH : 0,
    discipline: 100,
    stress: 16,
    finished: false,
    isSubmitting: false,
    flags: {
      fomo: 0,
      chasing: 0,
      concentration: 0,
      rebalanced: 0
    },
    journal: [],
    markets: [],
    workBoard: null,
    popupAlert: null,
    finalReport: null,
    initialized: true
  };
}

function createDemoState() {
  const nextState = createBaseState("demo");
  nextState.journal = [
    createJournalEntry("Round 1 opens. Prices are probabilities, not promises. Start small and read the reasons.", [], "Round 1")
  ];
  nextState.markets = DEMO_MARKET_DEFS.map((definition) => ({
    ...definition,
    status: "active",
    probability: Math.round(definition.rounds[0].price * 100),
    basePrice: definition.rounds[0].price,
    price: definition.rounds[0].price,
    priceOffset: 0,
    yesShares: 0,
    noShares: 0,
    lastDelta: 0,
    finalHoldings: null
  }));
  nextState.workBoard = null;
  return nextState;
}

async function bootstrapBoard(showErrors = true, preserveState = true, announceUpdates = true) {
  try {
    const response = await fetch("/api/prediction-markets");
    if (!response.ok) {
      throw new Error("Could not load the live class market feed.");
    }
    const payload = await response.json();
    const liveMarkets = Array.isArray(payload.markets) ? payload.markets : [];

    if (liveMarkets.length || payload.viewerRole !== "guest" || payload.workBoard?.available) {
      state = createLiveState(payload, preserveState ? state : null, announceUpdates);
    } else if (state.mode !== "demo") {
      state = createDemoState();
    }
    render();
  } catch (error) {
    if (state.mode !== "demo") {
      state = createDemoState();
      render();
    }
    if (showErrors) {
      console.warn(error.message || "Prediction market feed unavailable.");
    }
  }
}

function createLiveState(payload, previousState, announceUpdates = true) {
  const feedMarkets = Array.isArray(payload?.markets) ? payload.markets : [];
  const nextState = createBaseState("live");
  const priorLiveState = previousState?.mode === "live" ? previousState : null;
  const previousById = new Map((priorLiveState?.markets || []).map((market) => [market.id, market]));
  const viewerRole = payload?.viewerRole || "guest";
  const canTrade = Boolean(payload?.canTrade);
  const liveCash = Number(payload?.portfolio?.cash);

  nextState.viewerRole = viewerRole;
  nextState.canTrade = canTrade;
  nextState.cash = Number.isFinite(liveCash) ? liveCash : 0;
  nextState.workBoard = normalizeWorkBoard(payload?.workBoard);
  nextState.discipline = priorLiveState?.discipline ?? 100;
  nextState.stress = priorLiveState?.stress ?? 16;
  nextState.flags = priorLiveState
    ? { ...priorLiveState.flags }
    : {
        fomo: 0,
        chasing: 0,
        concentration: 0,
        rebalanced: 0
      };
  nextState.journal = priorLiveState ? [...priorLiveState.journal] : [];
  nextState.popupAlert = priorLiveState?.popupAlert || null;

  nextState.markets = feedMarkets.map((entry) => {
    const previousMarket = previousById.get(entry.id);
    const basePrice = clamp(Number(entry.probability || 50) / 100, 0.05, 0.95);
    const resolvedValue = entry.resolution === "yes" ? 1 : entry.resolution === "no" ? 0 : null;
    const currentPrice = entry.status === "active"
      ? clamp(Number(entry.currentProbability || entry.probability || 50) / 100, 0.01, 0.99)
      : resolvedValue === null
        ? basePrice
        : resolvedValue;

    return {
      id: entry.id,
      title: entry.title,
      desk: entry.desk || "Class Market",
      category: entry.category || "Classroom question",
      description: entry.description,
      lesson: entry.status === "resolved"
        ? `Teacher settled this market ${String(entry.resolution || "").toUpperCase()}. Debrief what information was actually worth trusting.`
        : "This market came directly from your teacher dashboard, so the class can trade a question tailored to the room.",
      rounds: [
        {
          price: basePrice,
          evidence: clampPercent(entry.evidence),
          hype: clampPercent(entry.hype),
          signal: entry.description,
          why: entry.status === "active"
            ? `Teacher opened this market at ${Math.round(basePrice * 100)}c YES. Students should decide whether that line feels justified.`
            : `This market is settled. Use the final result to discuss whether confidence and evidence matched reality.`,
          tag: entry.category || "Classroom question"
        }
      ],
      resolution: resolvedValue,
      status: entry.status,
      probability: Math.round(basePrice * 100),
      currentProbability: Math.round(currentPrice * 100),
      basePrice,
      price: currentPrice,
      yesPool: roundToTwo(entry.yesPool),
      noPool: roundToTwo(entry.noPool),
      totalPool: roundToTwo(entry.totalPool),
      yesShares: entry.finalHoldings ? 0 : roundToTwo(entry.yesShares),
      noShares: entry.finalHoldings ? 0 : roundToTwo(entry.noShares),
      lastDelta: previousMarket ? currentPrice - previousMarket.price : 0,
      finalHoldings: entry.finalHoldings || null,
      publishedAt: entry.publishedAt,
      resolvedAt: entry.resolvedAt,
      updatedAt: entry.updatedAt
    };
  });

  const addedMarkets = nextState.markets.filter((market) => !previousById.has(market.id));
  if (!priorLiveState) {
    nextState.journal.unshift(
      createJournalEntry(
        canTrade
          ? "Teacher-published class markets are live. Every student trade now moves the same shared class odds, while your personal position stays private."
          : "Teacher-published class markets are live. This view is read-only, and individual student bettors stay private while the shared class line moves.",
        [canTrade ? "Shared pool" : "Observer mode"],
        "Live board"
      )
    );
  } else if (addedMarkets.length) {
    nextState.journal.unshift(
      createJournalEntry(
        `${addedMarkets.length} new class market${addedMarkets.length === 1 ? " is" : "s are"} live: ${addedMarkets.map((market) => market.title).join(" · ")}.`,
        ["Live update"],
        "Live board"
      )
    );
  }

  if (announceUpdates) {
    const newestMarket = addedMarkets[0] || (previousState?.mode !== "live" && nextState.markets.length ? nextState.markets[0] : null);
    if (newestMarket) {
      const frame = getMarketFrame(nextState, newestMarket);
      nextState.popupAlert = {
        marketId: newestMarket.id,
        title: newestMarket.title,
        description: newestMarket.description,
        desk: newestMarket.desk,
        probability: newestMarket.probability,
        evidence: frame.evidence,
        hype: frame.hype
      };
    }
  }

  settleResolvedLiveMarkets(nextState, previousById);

  nextState.journal = nextState.journal.slice(0, 12);
  nextState.finished = nextState.markets.length > 0 && nextState.markets.every((market) => market.status !== "active");
  if (nextState.finished) {
    nextState.finalReport = buildFinalReport(nextState);
  }
  return nextState;
}

function normalizeWorkBoard(workBoard) {
  if (!workBoard || typeof workBoard !== "object") {
    return {
      available: false,
      canWork: false,
      workDate: null,
      tasks: [],
      completedTask: null
    };
  }

  return {
    available: Boolean(workBoard.available),
    canWork: Boolean(workBoard.canWork),
    workDate: workBoard.workDate || null,
    tasks: Array.isArray(workBoard.tasks) ? workBoard.tasks : [],
    completedTask: workBoard.completedTask || null
  };
}

function settleResolvedLiveMarkets(nextState, previousById) {
  for (const market of nextState.markets) {
    if (market.status !== "resolved" || market.resolution === null) {
      continue;
    }

    const previousMarket = previousById.get(market.id);
    if (!previousMarket || previousMarket.finalHoldings || !market.finalHoldings) {
      continue;
    }

    const final = market.finalHoldings;

    if (final.yesShares || final.noShares) {
      nextState.journal.unshift(
        createJournalEntry(
          `${market.title} resolved ${market.resolution ? "YES" : "NO"}. Your shared-market payout settled ${formatMoney(final.payout)} on the server.`,
          ["Settlement"],
          "Live board"
        )
      );
    }
  }
}

async function handleClick(event) {
  if (event.target.closest("[data-popup-close]")) {
    state.popupAlert = null;
    renderPopup();
    return;
  }

  const workButton = event.target.closest("[data-work-task][data-work-choice]");
  if (workButton) {
    await completeWorkTask(workButton.dataset.workTask, workButton.dataset.workChoice);
    return;
  }

  const tradeButton = event.target.closest("[data-trade]");
  if (tradeButton) {
    await executeTrade(tradeButton.dataset.marketId, tradeButton.dataset.trade);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;
  if (action === "advance") {
    advanceRound();
    return;
  }

  if (action === "refresh") {
    bootstrapBoard(false);
    return;
  }

  if (action === "restart") {
    if (state.mode === "live") {
      bootstrapBoard(false, false, false);
    } else {
      state = createDemoState();
      render();
    }
  }
}

async function completeWorkTask(taskId, choiceId) {
  if (state.mode !== "live" || state.isSubmitting || !state.canTrade || !state.workBoard?.canWork) {
    return;
  }

  const task = state.workBoard.tasks.find((entry) => entry.id === taskId);
  const choice = task?.choices?.find((entry) => entry.id === choiceId);
  if (!task || !choice) {
    return;
  }

  state.isSubmitting = true;
  render();
  try {
    const response = await fetch("/api/prediction-markets/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskId,
        choiceId
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Could not complete that work task.");
    }

    const nextState = createLiveState(payload, state, false);
    const completed = nextState.workBoard?.completedTask;
    nextState.discipline = clamp((state.discipline ?? 100) + 4, 0, 100);
    nextState.stress = clamp((state.stress ?? 16) - 4, 0, 100);
    nextState.flags.rebalanced += 1;
    nextState.journal.unshift(
      createJournalEntry(
        completed
          ? `You completed ${task.title} and earned ${formatMoney(completed.payout)} in steady off-market income.`
          : `You completed ${task.title} for steady off-market income.`,
        [
          "Steady income",
          completed?.wasCorrect ? "Accuracy bonus" : "Completion pay"
        ],
        "Work board"
      )
    );
    nextState.journal = nextState.journal.slice(0, 12);
    state = nextState;
  } catch (error) {
    state.journal.unshift(createJournalEntry(error.message || "Could not complete that work task.", ["Work blocked"], "Work board"));
    state.journal = state.journal.slice(0, 12);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

async function executeTrade(marketId, tradeKey) {
  if (state.finished || state.isSubmitting) {
    return;
  }

  const market = state.markets.find((entry) => entry.id === marketId);
  if (!market || market.status !== "active") {
    return;
  }

  if (state.mode === "live" && !state.canTrade) {
    state.journal.unshift(createJournalEntry("This view is read-only. Students can move the shared market, but bettor identities stay private.", ["Observer mode"], "Live board"));
    state.journal = state.journal.slice(0, 12);
    render();
    return;
  }

  const cashBefore = state.cash;
  const [direction, side] = tradeKey.split("-");
  const shareKey = side === "yes" ? "yesShares" : "noShares";
  const unitPrice = side === "yes" ? market.price : 1 - market.price;
  const tradeCost = unitPrice * TRADE_SIZE;
  const stamp = state.mode === "live" ? "Live board" : `Round ${state.round + 1}`;

  if (state.mode === "live") {
    state.isSubmitting = true;
    render();
    try {
      const response = await fetch("/api/prediction-markets/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          marketId,
          trade: tradeKey,
          quantity: TRADE_SIZE
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Could not place that trade.");
      }

      const nextState = createLiveState(payload, state, false);
      const updatedMarket = nextState.markets.find((entry) => entry.id === marketId) || market;
      evaluateBehavior(nextState, updatedMarket, direction, side, tradeCost, cashBefore);
      nextState.journal.unshift(
        createJournalEntry(
          `You ${direction === "buy" ? "bought" : "sold"} ${TRADE_SIZE} ${side.toUpperCase()} shares in ${market.title} at ${formatCents(unitPrice)} each. The shared class odds updated for everyone, but your position stayed private.`,
          buildTradeTags(nextState, updatedMarket, direction, side),
          stamp
        )
      );
      nextState.journal = nextState.journal.slice(0, 12);
      state = nextState;
    } catch (error) {
      state.journal.unshift(createJournalEntry(error.message || "Could not place that trade.", ["Trade blocked"], stamp));
      state.journal = state.journal.slice(0, 12);
    } finally {
      state.isSubmitting = false;
      render();
    }
    return;
  }

  if (direction === "buy" && tradeCost > state.cash + 0.001) {
    state.journal.unshift(createJournalEntry(`Not enough cash to buy ${TRADE_SIZE} ${side.toUpperCase()} shares in ${market.title}.`, ["Sizing check"], stamp));
    state.journal = state.journal.slice(0, 12);
    render();
    return;
  }

  if (direction === "sell" && market[shareKey] < TRADE_SIZE) {
    state.journal.unshift(createJournalEntry(`You do not own ${TRADE_SIZE} ${side.toUpperCase()} shares to trim in ${market.title}.`, ["Position check"], stamp));
    state.journal = state.journal.slice(0, 12);
    render();
    return;
  }

  if (direction === "buy") {
    market[shareKey] += TRADE_SIZE;
    state.cash -= tradeCost;
  } else {
    market[shareKey] -= TRADE_SIZE;
    state.cash += tradeCost;
    state.flags.rebalanced += 1;
    state.discipline = clamp(state.discipline + 2, 0, 100);
    state.stress = clamp(state.stress - 3, 0, 100);
  }

  const drift = getTradeDrift(direction, side);
  market.priceOffset = clamp(market.priceOffset + drift, -0.12, 0.12);
  market.price = clamp(market.basePrice + market.priceOffset, 0.05, 0.95);
  evaluateBehavior(state, market, direction, side, tradeCost, cashBefore);

  const verb = direction === "buy" ? "bought" : "sold";
  state.journal.unshift(
    createJournalEntry(
      `You ${verb} ${TRADE_SIZE} ${side.toUpperCase()} shares in ${market.title} at ${formatCents(unitPrice)} each.`,
      buildTradeTags(state, market, direction, side),
      stamp
    )
  );
  state.journal = state.journal.slice(0, 12);
  render();
}

function getTradeDrift(direction, side) {
  const pressure = direction === "buy" ? 0.014 : -0.014;
  return side === "yes" ? pressure : pressure * -1;
}

function evaluateBehavior(targetState, market, direction, side, tradeCost, cashBefore) {
  if (direction !== "buy") {
    return;
  }

  const totalValue = getPortfolioValue(targetState);
  const exposure = getMarketExposure(market);
  const currentRound = getMarketFrame(targetState, market);
  const hypeLead = currentRound.hype - currentRound.evidence;
  const sizingRatio = tradeCost / Math.max(cashBefore, 0.01);

  if (hypeLead >= 20) {
    targetState.flags.fomo += 1;
    targetState.discipline = clamp(targetState.discipline - 6, 0, 100);
    targetState.stress = clamp(targetState.stress + 6, 0, 100);
  }

  if ((market.lastDelta < -0.08 && side === "yes") || (market.lastDelta > 0.08 && side === "no")) {
    targetState.flags.chasing += 1;
    targetState.discipline = clamp(targetState.discipline - 9, 0, 100);
    targetState.stress = clamp(targetState.stress + 8, 0, 100);
  }

  if (exposure / Math.max(totalValue, 1) > 0.45 || sizingRatio > 0.45) {
    targetState.flags.concentration += 1;
    targetState.discipline = clamp(targetState.discipline - 7, 0, 100);
    targetState.stress = clamp(targetState.stress + 5, 0, 100);
  }
}

function buildTradeTags(targetState, market, direction, side) {
  const tags = [];
  const frame = getMarketFrame(targetState, market);
  if (direction === "buy" && frame.hype > frame.evidence + 20) {
    tags.push("FOMO risk");
  }
  if (direction === "buy" && ((market.lastDelta < -0.08 && side === "yes") || (market.lastDelta > 0.08 && side === "no"))) {
    tags.push("Chasing losses");
  }
  if (getMarketExposure(market) / Math.max(getPortfolioValue(targetState), 1) > 0.45) {
    tags.push("Heavy size");
  }
  if (!tags.length) {
    tags.push("Position updated");
  }
  return tags;
}

function advanceRound() {
  if (state.mode === "live") {
    bootstrapBoard(false);
    return;
  }

  if (state.finished) {
    return;
  }

  const finalRoundIndex = DEMO_MARKET_DEFS[0].rounds.length - 1;
  if (state.round >= finalRoundIndex) {
    resolveDemoMarkets();
    return;
  }

  const previousValue = getPortfolioValue(state);
  state.round += 1;

  for (const market of state.markets) {
    const previousPrice = market.price;
    market.basePrice = market.rounds[state.round].price;
    market.priceOffset *= 0.35;
    market.price = clamp(market.basePrice + market.priceOffset, 0.05, 0.95);
    market.lastDelta = market.price - previousPrice;
  }

  const nextValue = getPortfolioValue(state);
  const delta = nextValue - previousValue;
  const summary = delta >= 0
    ? `Marked-to-market, your book improved by ${formatMoney(delta)} as prices updated.`
    : `Marked-to-market, your book slipped ${formatMoney(Math.abs(delta))}. Notice what that does to your emotions.`;

  state.stress = clamp(state.stress + (delta < 0 ? 7 : -2), 0, 100);
  if (getLargestExposureRatio(state) > 0.5) {
    state.stress = clamp(state.stress + 4, 0, 100);
  }

  state.journal.unshift(createJournalEntry(`Round ${state.round + 1} begins. ${summary}`, ["New information"], `Round ${state.round + 1}`));
  state.journal = state.journal.slice(0, 12);
  render();
}

function resolveDemoMarkets() {
  let payouts = 0;

  for (const market of state.markets) {
    const yesShares = market.yesShares;
    const noShares = market.noShares;
    const payout = yesShares * market.resolution + noShares * (1 - market.resolution);
    payouts += payout;
    market.finalHoldings = { yesShares, noShares, payout };
    market.yesShares = 0;
    market.noShares = 0;
    market.status = "resolved";
    market.basePrice = market.resolution ? 1 : 0;
    market.price = market.basePrice;
    market.priceOffset = 0;
  }

  state.cash += payouts;
  state.finished = true;
  state.finalReport = buildFinalReport(state);
  state.journal.unshift(createJournalEntry(`All markets resolved. Final bankroll: ${formatMoney(state.cash)}.`, ["Session complete"], "Resolved"));
  state.journal = state.journal.slice(0, 12);
  render();
}

function buildFinalReport(targetState) {
  const profit = targetState.cash - INITIAL_CASH;
  const archetype = getArchetype(targetState);
  const lessons = [];

  if (targetState.flags.fomo > 0) {
    lessons.push("You leaned into at least one hype-heavy market where crowd energy was stronger than evidence.");
  }
  if (targetState.flags.chasing > 0) {
    lessons.push("You added risk after a price moved against you, which is a classic chasing-losses pattern.");
  }
  if (targetState.flags.concentration > 0) {
    lessons.push("A large share of your bankroll sat in one story at least once. Concentration can make emotions louder than facts.");
  }
  if (targetState.flags.rebalanced > 0) {
    lessons.push("You trimmed risk at least once. That is the kind of boring discipline that protects forecasters.");
  }
  if (!lessons.length) {
    lessons.push("You kept the session measured. That matters because forecasting should feel more like analysis than adrenaline.");
  }

  return {
    profit,
    archetype,
    lessons
  };
}

function getArchetype(targetState) {
  if (targetState.discipline >= 78 && targetState.flags.chasing === 0 && getLargestExposureRatio(targetState) < 0.45) {
    return {
      title: "Evidence-led Forecaster",
      summary: "You treated prices as clues, not dares. That is the healthiest way to use a prediction market."
    };
  }

  if (targetState.flags.chasing >= 2 || targetState.stress >= 72 || targetState.flags.fomo >= 2) {
    return {
      title: "Tilted Bettor",
      summary: "Your session drifted toward comeback behavior and emotional sizing. That is where market learning starts to look like gambling."
    };
  }

  if (targetState.flags.concentration >= 2) {
    return {
      title: "Story-Chasing Speculator",
      summary: "One or two narratives pulled too much of your bankroll. The story may have felt good, but the sizing got dangerous."
    };
  }

  return {
    title: "Mixed Signal Trader",
    summary: "You noticed some signals well, but your sizing and sentiment control were inconsistent. The lesson is not just what you believed, but how you behaved."
  };
}

function render() {
  refs.roundHeading.textContent = state.mode === "live"
    ? state.finished
      ? "Live Markets Settled"
      : "Live Class Markets"
    : state.finished
      ? "Markets Resolved"
      : `Round ${state.round + 1}`;
  refs.roundStatus.innerHTML = renderRoundPills();
  refs.metricsStrip.innerHTML = renderMetrics();
  refs.workPanel.innerHTML = renderWorkBoard();
  refs.marketGrid.innerHTML = state.markets.length
    ? state.markets.map(renderMarketCard).join("")
    : renderEmptyMarketState();
  refs.newsPanel.innerHTML = state.markets.length ? state.markets.map(renderNewsCard).join("") : "";
  refs.behaviorPanel.innerHTML = renderBehaviorPanel();
  refs.journalPanel.innerHTML = renderJournal();
  refs.footerPanel.innerHTML = renderFooter();
  refs.finishPanel.classList.toggle("pm-hidden", !state.finished);
  refs.finishPanel.innerHTML = state.finished ? renderFinishPanel() : "";
  renderPopup();
}

function renderPopup() {
  const alert = state.popupAlert;
  refs.marketPopup.classList.toggle("pm-hidden", !alert);
  if (!alert) {
    return;
  }

  refs.marketPopupTitle.textContent = alert.title;
  refs.marketPopupDescription.textContent = alert.description;
  refs.marketPopupMeta.innerHTML = [
    `<span class="pm-badge pm-badge-good">${escapeHtml(alert.desk)}</span>`,
    `<span class="pm-badge pm-badge-muted">Opening YES ${escapeHtml(String(alert.probability))}c</span>`,
    `<span class="pm-badge pm-badge-muted">Evidence ${escapeHtml(String(alert.evidence))}</span>`,
    `<span class="pm-badge pm-badge-warn">Hype ${escapeHtml(String(alert.hype))}</span>`
  ].join("");
}

function renderEmptyMarketState() {
  const title = state.mode === "live" && !state.canTrade
    ? "Waiting for the class board"
    : "No live class markets yet";
  const copy = state.mode === "live" && !state.canTrade
    ? "This observer board is ready, but it stays quiet until the teacher opens a classroom market."
    : "Ask your teacher to publish one from the dashboard, or refresh in a moment.";
  const art = state.mode === "live" && !state.canTrade
    ? GOLD_MARKET_ART.waitingForTeacher
    : GOLD_MARKET_ART.noLiveMarkets;
  const alt = state.mode === "live" && !state.canTrade
    ? "Waiting for teacher graphic"
    : "No live markets graphic";

  return `
    <article class="pm-market-card pm-empty-state">
      <img class="pm-empty-state-art" src="${art}" alt="${escapeHtml(alt)}" />
      <strong>${title}</strong>
      <p class="pm-subtext">${copy}</p>
    </article>
  `;
}

function renderRoundPills() {
  const activeMarkets = state.markets.filter((market) => market.status === "active").length;
  const exposureRatio = getOpenRiskRatio(state);
  const concentration = getLargestExposureRatio(state);
  const totalPool = roundToTwo(state.markets.reduce((sum, market) => sum + Number(market.totalPool || 0), 0));
  if (state.mode === "live" && !state.canTrade) {
    return [
      `<span class="pm-pill pm-pill-muted">${state.viewerRole === "teacher" ? "Teacher read-only" : "Observer read-only"}</span>`,
      `<span class="pm-pill pm-pill-muted">Bettors stay private</span>`,
      `<span class="pm-pill pm-pill-muted">${activeMarkets} live market${activeMarkets === 1 ? "" : "s"}</span>`,
      `<span class="pm-pill pm-pill-muted">Shared pool ${totalPool} shares</span>`
    ].join("");
  }
  return [
    `<span class="pm-pill pm-pill-muted">${state.mode === "live" ? "Shared class pool" : "Guided demo"}</span>`,
    state.mode === "live" ? `<span class="pm-pill pm-pill-muted">Positions stay private</span>` : "",
    `<span class="pm-pill pm-pill-muted">Cash ${formatMoney(state.cash)}</span>`,
    `<span class="pm-pill ${state.discipline >= 70 ? "pm-pill-good" : "pm-pill-warn"}">Discipline ${Math.round(state.discipline)}</span>`,
    `<span class="pm-pill ${state.stress < 55 ? "pm-pill-good" : "pm-pill-warn"}">Stress ${Math.round(state.stress)}</span>`,
    `<span class="pm-pill ${exposureRatio < 0.55 ? "pm-pill-muted" : "pm-pill-warn"}">Open risk ${Math.round(exposureRatio * 100)}%</span>`,
    `<span class="pm-pill ${concentration < 0.45 ? "pm-pill-muted" : "pm-pill-warn"}">Largest market ${Math.round(concentration * 100)}%</span>`
  ].filter(Boolean).join("");
}

function renderMetrics() {
  if (state.mode === "live" && !state.canTrade) {
    const activeMarkets = state.markets.filter((market) => market.status === "active").length;
    const resolvedMarkets = state.markets.filter((market) => market.status === "resolved").length;
    const averageLine = state.markets.length
      ? Math.round(state.markets.reduce((sum, market) => sum + market.price, 0) / state.markets.length * 100)
      : 0;
    const totalPool = roundToTwo(state.markets.reduce((sum, market) => sum + Number(market.totalPool || 0), 0));
    return [
      renderMetricCard("Markets on board", `${state.markets.length}`, `${activeMarkets} active · ${resolvedMarkets} settled`),
      renderMetricCard("Average YES line", `${averageLine}c`, "Odds move when students trade into the shared pool"),
      renderMetricCard("Shared liquidity", `${totalPool}`, "Combined YES and NO pool size across visible markets"),
      renderMetricCard("Bettor privacy", "Private", "Students see the line move, not who moved it")
    ].join("");
  }

  const bankroll = getPortfolioValue(state);
  const profit = bankroll - INITIAL_CASH;
  const exposure = getTotalExposure(state);
  const correctOutcomes = state.finished ? countCorrectOutcomes(state) : "--";

  return [
    renderMetricCard("Portfolio value", formatMoney(bankroll), profit >= 0 ? `Up ${formatMoney(profit)}` : `Down ${formatMoney(Math.abs(profit))}`),
    renderMetricCard("Cash on hand", formatMoney(state.cash), `${formatMoney(exposure)} still at risk`),
    renderMetricCard("Discipline score", `${Math.round(state.discipline)}`, state.discipline >= 70 ? "Sizing still under control" : "Emotion is entering the room"),
    renderMetricCard("Correct calls", `${correctOutcomes}`, state.finished ? "Markets where your held side won" : state.mode === "live" ? "Teacher resolves these from the dashboard" : "Resolve the board to score")
  ].join("");
}

function countCorrectOutcomes(targetState) {
  return targetState.markets.reduce((count, market) => {
    const final = market.finalHoldings;
    if (!final) {
      return count;
    }
    if ((market.resolution === 1 && final.yesShares > 0) || (market.resolution === 0 && final.noShares > 0)) {
      return count + 1;
    }
    return count;
  }, 0);
}

function renderMetricCard(label, value, subtext) {
  return `
    <article class="pm-metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <p class="pm-subtext">${subtext}</p>
    </article>
  `;
}

function renderWorkBoard() {
  if (state.mode !== "live") {
    return `
      <article class="pm-work-summary">
        <img src="${GOLD_MARKET_ART.walletRefilled}" alt="Wallet refilled graphic" />
        <strong>Daily work opens on the live classroom board</strong>
        <p class="pm-subtext">When your teacher is using the shared class market, students can complete one steady-pay task per day to earn reliable wallet money outside the market.</p>
      </article>
    `;
  }

  if (!state.canTrade) {
    return `
      <article class="pm-work-summary">
        <img src="${GOLD_MARKET_ART.walletRefilled}" alt="Wallet refilled graphic" />
        <strong>Students can earn steady money here</strong>
        <p class="pm-subtext">The class work board gives each student one dependable way to add cash each day. It is slower than a lucky trade, but much more reliable.</p>
      </article>
    `;
  }

  const workBoard = state.workBoard || normalizeWorkBoard(null);
  if (!workBoard.available) {
    return `
      <article class="pm-work-summary">
        <img src="${GOLD_MARKET_ART.waitingForTeacher}" alt="Waiting for teacher graphic" />
        <strong>No off-market work board yet</strong>
        <p class="pm-subtext">Refresh in a moment if the class session was just opened. Your steady-pay task board loads alongside the live classroom market.</p>
      </article>
    `;
  }

  if (!workBoard.canWork && workBoard.completedTask) {
    const completed = workBoard.completedTask;
    return `
      <article class="pm-work-summary">
        <img src="${GOLD_MARKET_ART.walletRefilled}" alt="Wallet refilled graphic" />
        <strong>Today’s steady-pay work is complete</strong>
        <p class="pm-subtext">
          You finished <strong>${escapeHtml(completed.title)}</strong> and added <strong>${formatMoney(completed.payout)}</strong>
          to your class market wallet${completed.wasCorrect && completed.accuracyBonus > 0 ? `, including a ${formatMoney(completed.accuracyBonus)} accuracy bonus` : ""}.
        </p>
        <div class="pm-warning-list">
          <span class="pm-pill pm-pill-good">One work action per day</span>
          <span class="pm-pill pm-pill-muted">${escapeHtml(completed.type)}</span>
          <span class="pm-pill ${completed.wasCorrect ? "pm-pill-good" : "pm-pill-muted"}">${completed.wasCorrect ? "Bonus earned" : "Completion pay earned"}</span>
        </div>
      </article>
    `;
  }

  return `
    <article class="pm-work-summary">
      <img src="${GOLD_MARKET_ART.walletRefilled}" alt="Wallet refilled graphic" />
      <strong>Reliable money beats desperate money</strong>
      <p class="pm-subtext">Choose one task for today. Every task pays a steady base amount, and a correct answer adds a bonus. It is slower than a hot market, but safer and dependable.</p>
      <div class="pm-warning-list">
        <span class="pm-pill pm-pill-good">One task per day</span>
        <span class="pm-pill pm-pill-muted">Base pay always guaranteed</span>
        <span class="pm-pill pm-pill-muted">Accuracy earns extra</span>
      </div>
    </article>
    <div class="pm-work-grid">
      ${workBoard.tasks.map(renderWorkTaskCard).join("")}
    </div>
  `;
}

function renderWorkTaskCard(task) {
  const art = getWorkTaskArt(task.artKey);
  return `
    <article class="pm-work-card">
      <img src="${art}" alt="${escapeHtml(task.title)} artwork" />
      <div class="pm-line-item">
        <div>
          <p class="pm-panel-label">${escapeHtml(task.type)}</p>
          <h3>${escapeHtml(task.title)}</h3>
        </div>
        <span class="pm-badge pm-badge-good">Up to ${formatMoney(task.maxPay)}</span>
      </div>
      <p class="pm-subtext">${escapeHtml(task.description)}</p>
      <p>${escapeHtml(task.prompt)}</p>
      <div class="pm-work-payline">
        <span class="pm-badge pm-badge-muted">Base pay ${formatMoney(task.basePay)}</span>
        <span class="pm-badge pm-badge-good">Accuracy bonus ${formatMoney(task.bonusPay)}</span>
      </div>
      <div class="pm-choice-list">
        ${(task.choices || []).map((choice) => `
          <button
            class="pm-button pm-button-secondary pm-choice-button"
            type="button"
            data-work-task="${task.id}"
            data-work-choice="${choice.id}"
            ${state.isSubmitting ? "disabled" : ""}
          >
            ${escapeHtml(choice.label)}
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function getWorkTaskArt(artKey) {
  const artMap = {
    disciplinedTrader: GOLD_MARKET_ART.disciplinedTrader,
    stayInCash: GOLD_MARKET_ART.stayInCash,
    walletRefilled: GOLD_MARKET_ART.walletRefilled,
    privateBets: GOLD_MARKET_ART.privateBets,
    sharedPoolLive: GOLD_MARKET_ART.sharedPoolLive
  };
  return artMap[artKey] || GOLD_MARKET_ART.walletRefilled;
}

function renderMarketCard(market) {
  const frame = getMarketFrame(state, market);
  const yesCost = formatMoney(market.price * TRADE_SIZE);
  const noCost = formatMoney((1 - market.price) * TRADE_SIZE);
  const exposure = getMarketExposure(market);
  const observerMode = state.mode === "live" && !state.canTrade;
  const tradeDisabled = market.status !== "active" || state.finished || state.isSubmitting || observerMode;
  const moveLabel = market.status === "resolved"
    ? `Settled ${market.resolution ? "YES" : "NO"}`
    : market.lastDelta === 0
      ? state.mode === "live" ? "Shared line unchanged since last refresh" : "Waiting for the next signal"
      : `${market.lastDelta > 0 ? "Up" : "Down"} ${Math.round(Math.abs(market.lastDelta) * 100)}c since last move`;
  const firstTileLabel = observerMode ? "YES pool" : "Your YES shares";
  const firstTileValue = observerMode ? roundToTwo(market.yesPool) : market.yesShares;
  const secondTileLabel = observerMode ? "NO pool" : "Your NO shares";
  const secondTileValue = observerMode ? roundToTwo(market.noPool) : market.noShares;
  const thirdTileLabel = observerMode ? "Shared pool" : state.mode === "live" ? "Private position value" : "Current market value";
  const thirdTileValue = observerMode ? `${roundToTwo(market.totalPool)} shares` : formatMoney(exposure);
  const fourthTileLabel = observerMode ? "Access" : "Trade size";
  const fourthTileValue = observerMode ? "Read-only" : `${yesCost} YES / ${noCost} NO`;

  return `
    <article class="pm-market-card">
      <div class="pm-market-top">
        <div class="pm-market-title">
          <p class="pm-panel-label">${escapeHtml(market.desk)}</p>
          <h3>${escapeHtml(market.title)}</h3>
          <p class="pm-market-copy">${escapeHtml(market.description)}</p>
        </div>
        <div class="pm-market-price">
          <span class="pm-caption">${state.mode === "live" ? "YES line" : "YES price"}</span>
          <strong>${formatCents(market.price)}</strong>
          <span class="pm-caption">${moveLabel}</span>
        </div>
      </div>

      <div class="pm-price-bar">
        <div class="pm-price-fill" style="width: ${market.price * 100}%"></div>
      </div>

      <div class="pm-tag-row">
        <span class="pm-badge ${market.status === "resolved" ? "pm-badge-warn" : "pm-badge-good"}">${escapeHtml(frame.tag)}</span>
        <span class="pm-badge ${frame.hype > frame.evidence ? "pm-badge-warn" : "pm-badge-muted"}">Hype ${frame.hype}</span>
        <span class="pm-badge ${frame.evidence >= frame.hype ? "pm-badge-good" : "pm-badge-muted"}">Evidence ${frame.evidence}</span>
        <span class="pm-badge pm-badge-muted">${market.status === "active" ? "Live" : "Resolved"}</span>
      </div>

      <div class="pm-position-grid">
        <div class="pm-mini-tile">
          <span>${firstTileLabel}</span>
          <strong>${firstTileValue}</strong>
        </div>
        <div class="pm-mini-tile">
          <span>${secondTileLabel}</span>
          <strong>${secondTileValue}</strong>
        </div>
        <div class="pm-mini-tile">
          <span>${thirdTileLabel}</span>
          <strong>${thirdTileValue}</strong>
        </div>
        <div class="pm-mini-tile">
          <span>${fourthTileLabel}</span>
          <strong>${fourthTileValue}</strong>
        </div>
      </div>

      <div class="pm-action-grid">
        <button class="pm-button pm-button-primary pm-button-small" data-trade="buy-yes" data-market-id="${market.id}" ${tradeDisabled ? "disabled" : ""}>
          Buy YES
        </button>
        <button class="pm-button pm-button-secondary pm-button-small" data-trade="buy-no" data-market-id="${market.id}" ${tradeDisabled ? "disabled" : ""}>
          Buy NO
        </button>
        <button class="pm-button pm-button-ghost pm-button-small" data-trade="sell-yes" data-market-id="${market.id}" ${tradeDisabled ? "disabled" : ""}>
          Sell YES
        </button>
        <button class="pm-button pm-button-ghost pm-button-small" data-trade="sell-no" data-market-id="${market.id}" ${tradeDisabled ? "disabled" : ""}>
          Sell NO
        </button>
      </div>
      ${state.mode === "live"
        ? `<p class="pm-subtext">${observerMode ? "This board shows the class-wide odds and pool totals. Individual student bettors are hidden." : "Your holdings are private to you. Every trade still nudges the shared class line for everyone."}</p>`
        : ""}
    </article>
  `;
}

function renderNewsCard(market) {
  const frame = getMarketFrame(state, market);
  return `
    <article class="pm-news-card">
      <div class="pm-line-item">
        <strong>${escapeHtml(market.title)}</strong>
        <span class="pm-caption">${escapeHtml(market.desk)}</span>
      </div>
      <p>${escapeHtml(frame.signal)}</p>
      <div class="pm-stack">
        <div>
          <div class="pm-line-item">
            <span class="pm-caption">Evidence weight</span>
            <span class="pm-caption">${frame.evidence}/100</span>
          </div>
          <div class="pm-signal-bar"><div class="pm-signal-fill-evidence" style="width: ${frame.evidence}%"></div></div>
        </div>
        <div>
          <div class="pm-line-item">
            <span class="pm-caption">Crowd hype</span>
            <span class="pm-caption">${frame.hype}/100</span>
          </div>
          <div class="pm-signal-bar"><div class="pm-signal-fill-hype" style="width: ${frame.hype}%"></div></div>
        </div>
      </div>
      <p class="pm-subtext">${escapeHtml(frame.why)}</p>
    </article>
  `;
}

function renderBehaviorPanel() {
  const warnings = getWarnings(state);
  const mentor = getMentorAdvice(state);
  const positiveArt = state.mode === "live" && state.canTrade && state.discipline >= 70
    ? renderArtCard(GOLD_MARKET_ART.disciplinedTrader, "Disciplined trader badge", "Disciplined trader", "Strong sessions come from patience, sizing discipline, and not treating every move like a dare.")
    : renderArtCard(GOLD_MARKET_ART.stayInCash, "Stay in cash graphic", "Stay in cash", "Sitting out is sometimes the smartest play. A disciplined no-trade decision still teaches the lesson.");
  const riskCards = [
    renderArtCard(GOLD_MARKET_ART.fomo, "FOMO warning badge", "FOMO risk", "When excitement outruns evidence, a market can feel certain long before it deserves to."),
    renderArtCard(GOLD_MARKET_ART.chasingLosses, "Chasing losses badge", "Chasing losses", "Trying to win your feelings back after a bad move is where forecasting starts to slide into gambling.")
  ];
  if (state.mode === "live") {
    riskCards.unshift(
      renderArtCard(
        state.canTrade ? GOLD_MARKET_ART.sharedPoolLive : GOLD_MARKET_ART.privateBets,
        state.canTrade ? "Shared pool live graphic" : "Private bets graphic",
        state.canTrade ? "Shared pool live" : "Private bets",
        state.canTrade
          ? "Every student trade nudges the same class odds. The crowd can move the number together fast."
          : "The line is public, but the individual student behind each trade stays hidden from this board."
      )
    );
  }

  return `
    <article class="pm-behavior-card">
      <strong>Current read</strong>
      <p>${mentor}</p>
      <div class="pm-warning-list">
        ${warnings.map((warning) => `<span class="pm-pill ${warning.level === "warn" ? "pm-pill-warn" : "pm-pill-muted"}">${warning.label}</span>`).join("")}
      </div>
    </article>
    <article class="pm-behavior-card">
      <strong>Healthy market habits</strong>
      <div class="pm-lesson-list">
        <span class="pm-badge pm-badge-good">Size small enough to think clearly</span>
        <span class="pm-badge pm-badge-good">Ask what evidence changed, not just what price changed</span>
        <span class="pm-badge pm-badge-good">Trimming risk is not weakness</span>
      </div>
      ${positiveArt}
    </article>
    <article class="pm-behavior-card">
      <strong>What can go wrong</strong>
      <div class="pm-lesson-list">
        <span class="pm-badge pm-badge-warn">FOMO after viral rumors</span>
        <span class="pm-badge pm-badge-warn">Chasing a loss to feel in control again</span>
        <span class="pm-badge pm-badge-warn">Treating a forecast like a personal identity battle</span>
      </div>
      <div class="pm-badge-grid">
        ${riskCards.join("")}
      </div>
    </article>
  `;
}

function renderArtCard(src, alt, title, copy) {
  return `
    <div class="pm-art-card">
      <img src="${src}" alt="${escapeHtml(alt)}" />
      <strong>${escapeHtml(title)}</strong>
      <p class="pm-subtext">${escapeHtml(copy)}</p>
    </div>
  `;
}

function getWarnings(targetState) {
  if (targetState.mode === "live" && !targetState.canTrade) {
    return [
      { label: "Read-only board", level: "muted" },
      { label: "Bettor identities hidden", level: "muted" }
    ];
  }

  const warnings = [];
  const exposureRatio = getOpenRiskRatio(targetState);
  const concentration = getLargestExposureRatio(targetState);

  if (exposureRatio > 0.7) {
    warnings.push({ label: "Too much bankroll in play", level: "warn" });
  } else {
    warnings.push({ label: "Risk load manageable", level: "muted" });
  }

  if (concentration > 0.45) {
    warnings.push({ label: "One story dominates your book", level: "warn" });
  }

  if (targetState.flags.fomo > 0) {
    warnings.push({ label: "Buzz pulled you at least once", level: "warn" });
  }

  if (targetState.flags.chasing > 0) {
    warnings.push({ label: "Comeback behavior detected", level: "warn" });
  }

  if (targetState.stress < 55 && warnings.length === 1) {
    warnings.push({ label: "Emotions still under control", level: "muted" });
  }

  return warnings;
}

function getMentorAdvice(targetState) {
  if (targetState.mode === "live" && !targetState.canTrade) {
    return "You are watching the shared class board in observer mode. Students move the odds together, but the identity behind each trade stays private.";
  }
  if (targetState.mode === "live" && !targetState.markets.length) {
    return "No live class markets are published right now. Once your teacher posts one from the dashboard, this board will switch over automatically.";
  }
  if (targetState.stress >= 72) {
    return "Your stress level is high. In a real market, this is where people stop forecasting and start trying to win their feelings back.";
  }
  if (targetState.flags.chasing > 0) {
    return "A recent trade looks like a comeback attempt. Pause and ask whether the underlying evidence improved, or whether you just hated the last move.";
  }
  if (targetState.flags.fomo > 0 && targetState.flags.fomo >= targetState.flags.rebalanced) {
    return "The crowd has influenced you at least once. A prediction market can teach signal reading, but only if you stay suspicious of excitement.";
  }
  if (getLargestExposureRatio(targetState) > 0.45) {
    return "You have a concentrated book. One strong opinion can teach a lesson, but oversizing one narrative makes the emotional swing much harder to manage.";
  }
  return "Your book is still fairly measured. Keep focusing on why the market moved and whether the move came from actual evidence.";
}

function renderJournal() {
  return state.journal.map((entry) => `
    <article class="pm-journal-entry">
      <div class="pm-line-item">
        <strong>${escapeHtml(entry.message)}</strong>
        <time>${escapeHtml(entry.label)}</time>
      </div>
      <div class="pm-tag-row">
        ${entry.tags.map((tag) => `<span class="pm-badge ${tag.includes("risk") || tag.includes("loss") || tag.includes("Heavy") ? "pm-badge-warn" : "pm-badge-muted"}">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function createJournalEntry(message, tags = [], label = "Market") {
  return {
    message,
    tags,
    label
  };
}

function renderFooter() {
  if (state.mode === "live") {
    const liveHeading = state.canTrade
      ? state.finished
        ? "All visible markets are settled for now"
        : state.isSubmitting
          ? "Submitting your trade to the shared class pool"
          : "This is one shared class market"
      : state.finished
        ? "Shared board settled"
        : "Observer view of the shared board";
    const liveCopy = state.canTrade
      ? state.finished
        ? "Resolved markets stay on the board so you can debrief them. Refresh when the teacher publishes the next question."
        : "Each 5-share trade posts to the server, moves the class odds for everyone, and keeps your personal position private from other students."
      : state.finished
        ? "Markets are settled, but bettor identities remain hidden. Refresh when the next classroom question goes live."
        : "Students can move these odds from their own accounts. This page stays read-only unless you are logged in as a student.";
    return `
      <div class="pm-footer-copy">
        <p class="pm-panel-label">Next step</p>
        <h2>${liveHeading}</h2>
        <p class="pm-subtext">${liveCopy}</p>
      </div>
      <div class="pm-button-row">
        <button class="pm-button ${state.finished ? "pm-button-primary" : "pm-button-secondary"}" data-action="refresh" ${state.isSubmitting ? "disabled" : ""}>
          ${state.isSubmitting ? "Submitting trade..." : state.finished ? "Check for next market" : "Refresh live board"}
        </button>
      </div>
    `;
  }

  const finalRoundIndex = DEMO_MARKET_DEFS[0].rounds.length - 1;
  const buttonLabel = state.finished
    ? "Restart simulation"
    : state.round >= finalRoundIndex
      ? "Resolve markets"
      : `Advance to round ${state.round + 2}`;

  return `
    <div class="pm-footer-copy">
      <p class="pm-panel-label">Next step</p>
      <h2>${state.finished ? "Run it again with different habits" : "Move the clock when you are ready"}</h2>
      <p class="pm-subtext">
        ${state.finished
          ? "Try a second run where you size smaller, fade the rumor market, and trim risk after a big move."
          : "Prediction markets teach best when students can stop, talk through their trades, and explain whether a move came from evidence or temptation."}
      </p>
    </div>
    <div class="pm-button-row">
      <button class="pm-button ${state.finished ? "pm-button-primary" : "pm-button-secondary"}" data-action="${state.finished ? "restart" : "advance"}">
        ${buttonLabel}
      </button>
      ${state.finished ? "" : `<button class="pm-button pm-button-ghost" data-action="restart">Restart run</button>`}
    </div>
  `;
}

function renderFinishPanel() {
  if (state.mode === "live" && !state.canTrade) {
    return `
      <div class="pm-finish-showcase">
        <img src="${GOLD_MARKET_ART.resultsBoard}" alt="Results board graphic" />
        <img src="${GOLD_MARKET_ART.finalDebrief}" alt="Final debrief graphic" />
      </div>
      <div class="pm-finish-header">
        <p class="pm-panel-label">Debrief</p>
        <h2>Shared board settled</h2>
        <p class="pm-subtext">The class markets are resolved. Use the outcome cards below to discuss whether crowd action and actual evidence lined up.</p>
      </div>
      <div class="pm-finish-grid">
        <article class="pm-resolution-card">
          <img class="pm-resolution-card-art" src="${GOLD_MARKET_ART.privateBets}" alt="Private bets graphic" />
          <span>Privacy rule</span>
          <strong class="pm-score-big">Private</strong>
          <p class="pm-subtext">Students can see the shared odds move, but this board does not reveal who placed each trade.</p>
        </article>
        <article class="pm-resolution-card">
          <img class="pm-resolution-card-art" src="${GOLD_MARKET_ART.marketClosed}" alt="Market closed graphic" />
          <strong>Classroom takeaway</strong>
          <div class="pm-resolution-list">
            <p>Watch how quickly a crowd can move a number even when the underlying evidence is uneven.</p>
            <p>Debrief whether the market was reading truth, reading hype, or simply reacting to itself.</p>
          </div>
        </article>
      </div>
      <div class="pm-resolution-list" style="margin-top: 16px;">
        ${state.markets.map((market) => renderResolutionCard(market)).join("")}
      </div>
    `;
  }

  const report = state.finalReport || buildFinalReport(state);
  const disciplineArt = state.discipline >= 70
    ? GOLD_MARKET_ART.disciplinedTrader
    : state.flags.chasing > 0
      ? GOLD_MARKET_ART.chasingLosses
      : state.flags.fomo > 0
        ? GOLD_MARKET_ART.fomo
        : GOLD_MARKET_ART.stayInCash;
  const disciplineAlt = state.discipline >= 70
    ? "Disciplined trader badge"
    : state.flags.chasing > 0
      ? "Chasing losses badge"
      : state.flags.fomo > 0
        ? "FOMO badge"
        : "Stay in cash graphic";
  return `
    <div class="pm-finish-showcase">
      <img src="${GOLD_MARKET_ART.resultsBoard}" alt="Results board graphic" />
      <img src="${GOLD_MARKET_ART.finalDebrief}" alt="Final debrief graphic" />
    </div>
    <div class="pm-finish-header">
      <p class="pm-panel-label">Debrief</p>
      <h2>${report.archetype.title}</h2>
      <p class="pm-subtext">${report.archetype.summary}</p>
    </div>

    <div class="pm-finish-grid">
      <article class="pm-resolution-card">
        <img class="pm-resolution-card-art" src="${disciplineArt}" alt="${escapeHtml(disciplineAlt)}" />
        <span>Final bankroll</span>
        <strong class="pm-score-big">${formatMoney(state.cash)}</strong>
        <p class="pm-subtext">
          ${report.profit >= 0 ? `Net gain: ${formatMoney(report.profit)}.` : `Net loss: ${formatMoney(Math.abs(report.profit))}.`}
          Money matters, but the bigger lesson is whether your process stayed evidence-led.
        </p>
        <div class="pm-warning-list">
          <span class="pm-pill ${state.discipline >= 70 ? "pm-pill-good" : "pm-pill-warn"}">Discipline ${Math.round(state.discipline)}</span>
          <span class="pm-pill ${state.flags.fomo ? "pm-pill-warn" : "pm-pill-muted"}">FOMO flags ${state.flags.fomo}</span>
          <span class="pm-pill ${state.flags.chasing ? "pm-pill-warn" : "pm-pill-muted"}">Chasing flags ${state.flags.chasing}</span>
        </div>
      </article>

      <article class="pm-resolution-card">
        <img class="pm-resolution-card-art" src="${report.profit >= 0 ? GOLD_MARKET_ART.resolvedYes : GOLD_MARKET_ART.resolvedNo}" alt="${report.profit >= 0 ? "Resolved yes graphic" : "Resolved no graphic"}" />
        <strong>Key takeaways</strong>
        <div class="pm-resolution-list">
          ${report.lessons.map((lesson) => `<p>${lesson}</p>`).join("")}
        </div>
      </article>
    </div>

    <div class="pm-resolution-list" style="margin-top: 16px;">
      ${state.markets.map((market) => renderResolutionCard(market)).join("")}
    </div>
  `;
}

function renderResolutionCard(market) {
  const final = market.finalHoldings || { yesShares: 0, noShares: 0, payout: 0 };
  const resolutionText = market.resolution === 1 ? "YES resolved" : market.resolution === 0 ? "NO resolved" : "Open market";
  const observerMode = state.mode === "live" && !state.canTrade;
  const art = market.resolution === 1
    ? GOLD_MARKET_ART.resolvedYes
    : market.resolution === 0
      ? GOLD_MARKET_ART.resolvedNo
      : GOLD_MARKET_ART.marketClosed;
  return `
    <article class="pm-resolution-card">
      <img class="pm-resolution-card-art" src="${art}" alt="${escapeHtml(resolutionText)} graphic" />
      <div class="pm-line-item">
        <strong>${escapeHtml(market.title)}</strong>
        <span>${escapeHtml(resolutionText)}</span>
      </div>
      <p class="pm-subtext">${escapeHtml(market.lesson)}</p>
      <div class="pm-tag-row">
        ${observerMode
          ? `
            <span class="pm-badge pm-badge-muted">Final YES line ${market.resolution === 1 ? "100c" : market.resolution === 0 ? "0c" : formatCents(market.price)}</span>
            <span class="pm-badge pm-badge-muted">Pool ${roundToTwo(market.totalPool)} shares</span>
            <span class="pm-badge pm-badge-good">Bettors private</span>
          `
          : `
            <span class="pm-badge pm-badge-muted">Held YES: ${final.yesShares}</span>
            <span class="pm-badge pm-badge-muted">Held NO: ${final.noShares}</span>
            <span class="pm-badge ${final.payout > 0 ? "pm-badge-good" : "pm-badge-warn"}">Payout ${formatMoney(final.payout)}</span>
          `}
      </div>
    </article>
  `;
}

function getMarketFrame(targetState, market) {
  const index = Math.min(targetState.round, market.rounds.length - 1);
  return market.rounds[index];
}

function getMarketExposure(market) {
  return market.yesShares * market.price + market.noShares * (1 - market.price);
}

function getTotalExposure(targetState) {
  if (targetState.mode === "live" && !targetState.canTrade) {
    return 0;
  }
  if (targetState.finished) {
    return 0;
  }
  return targetState.markets.reduce((sum, market) => sum + getMarketExposure(market), 0);
}

function getPortfolioValue(targetState) {
  return targetState.cash + getTotalExposure(targetState);
}

function getOpenRiskRatio(targetState) {
  return getTotalExposure(targetState) / Math.max(getPortfolioValue(targetState), 1);
}

function getLargestExposureRatio(targetState) {
  const totalValue = Math.max(getPortfolioValue(targetState), 1);
  if (!targetState.markets.length) {
    return 0;
  }
  return Math.max(...targetState.markets.map((market) => getMarketExposure(market) / totalValue));
}

function renderGameToText() {
  const payload = {
    mode: state.mode === "live" ? "live" : state.finished ? "resolved" : "trading",
    viewerRole: state.viewerRole,
    canTrade: state.canTrade,
    round: state.mode === "live" ? null : state.round + 1,
    cash: roundToTwo(state.cash),
    portfolioValue: roundToTwo(getPortfolioValue(state)),
    discipline: Math.round(state.discipline),
    stress: Math.round(state.stress),
    flags: state.flags,
    markets: state.markets.map((market) => {
      const frame = getMarketFrame(state, market);
      return {
        id: market.id,
        title: market.title,
        status: market.status,
        yesPrice: roundToTwo(market.price),
        yesPool: roundToTwo(market.yesPool),
        noPool: roundToTwo(market.noPool),
        evidence: frame.evidence,
        hype: frame.hype,
        yesShares: market.yesShares,
        noShares: market.noShares,
        exposure: roundToTwo(getMarketExposure(market)),
        resolution: market.resolution
      };
    }),
    workBoard: state.workBoard
      ? {
          available: state.workBoard.available,
          canWork: state.workBoard.canWork,
          completedTask: state.workBoard.completedTask
            ? {
                title: state.workBoard.completedTask.title,
                payout: state.workBoard.completedTask.payout,
                wasCorrect: state.workBoard.completedTask.wasCorrect
              }
            : null,
          tasks: (state.workBoard.tasks || []).map((task) => ({
            id: task.id,
            title: task.title,
            maxPay: task.maxPay
          }))
        }
      : null,
    note: "Coordinates are not used in this DOM-based simulator. Demo mode uses local trades; live mode uses server-backed shared market pools with private student positions."
  };
  return JSON.stringify(payload);
}

function formatMoney(value) {
  return `$${roundToTwo(value).toFixed(2)}`;
}

function formatCents(probability) {
  return `${Math.round(probability * 100)}c`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToTwo(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
