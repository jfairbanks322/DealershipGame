const fx = (sales, satisfaction, reputation, staff = {}) => ({
  sales,
  satisfaction,
  reputation,
  staff
});

const st = (morale, trust) => ({ morale, trust });

const opt = (id, label, outcome, nextNodeId, effects) => ({
  id,
  label,
  outcome,
  nextNodeId,
  effects
});

const effect = ([sales, satisfaction, reputation, staff = {}]) =>
  fx(
    sales,
    satisfaction,
    reputation,
    Object.fromEntries(
      Object.entries(staff).map(([staffId, [morale, trust]]) => [staffId, st(morale, trust)])
    )
  );

const action = (id, label, outcome, effects) => ({ id, label, outcome, effects });

const beat = (id, title, body, consultantId, prompt, options) => ({
  id,
  title,
  body,
  consultantId,
  prompt,
  options
});

function optionScore(option) {
  const resolved = effect(option.effects);
  return (
    resolved.sales +
    resolved.satisfaction +
    resolved.reputation +
    Object.values(resolved.staff || {}).reduce((sum, entry) => sum + entry.morale + entry.trust, 0)
  );
}

function orderOptionsForDecision(options, beatIndex) {
  const ranked = [...options].sort((a, b) => optionScore(a) - optionScore(b));
  const patterns = [
    [1, 3, 0, 2],
    [2, 0, 3, 1],
    [3, 1, 2, 0],
    [0, 2, 1, 3],
    [2, 3, 0, 1]
  ];
  return patterns[beatIndex % patterns.length].map((index) => ranked[index]);
}

function makeNodes(beats) {
  return Object.fromEntries(
    beats.map((entry, index) => {
      const nextNodeId = index + 1 < beats.length ? beats[index + 1].id : null;
      return [
        entry.id,
        {
          title: entry.title,
          body: entry.body,
          consultants: {
            [entry.consultantId]: {
              prompt: entry.prompt,
              options: orderOptionsForDecision(entry.options, index).map((option) =>
                opt(option.id, option.label, option.outcome, nextNodeId, effect(option.effects))
              )
            }
          }
        }
      ];
    })
  );
}

const CONSULTANTS = ["nina", "marcus", "tasha", "elena", "devon"];
const STEP_LABELS = ["forecast", "pricing", "operations", "people", "policy"];
const STEP_TITLES = [
  "Forecast The Pressure",
  "Set The Money Strategy",
  "Protect The Operation",
  "Manage The People Cost",
  "Lock The Policy"
];

const STRONG_STAFF = [
  { nina: [2, 2], marcus: [1, 1] },
  { marcus: [2, 2], priya: [1, 1] },
  { tasha: [2, 2], devon: [1, 1] },
  { elena: [2, 2], luis: [1, 1] },
  { devon: [2, 2], nina: [1, 1] }
];

const STRAINED_STAFF = [
  { nina: [-2, -2], marcus: [-1, -1] },
  { marcus: [-2, -3], priya: [-1, -1] },
  { tasha: [-2, -3], devon: [-1, -1] },
  { elena: [-2, -2], luis: [-1, -2] },
  { devon: [-2, -3], nina: [-1, -1] }
];

function staffLift(index) {
  return STRONG_STAFF[index % STRONG_STAFF.length];
}

function staffHit(index) {
  return STRAINED_STAFF[index % STRAINED_STAFF.length];
}

function businessOptions(id, lever, index, flavor = {}) {
  const slug = `${id}-${STEP_LABELS[index]}`;
  const bestLabel = flavor.best || `Build a measured ${lever} plan with clear limits, one owner, and a public explanation of the tradeoff.`;
  const marginLabel = flavor.margin || `Protect margin by raising value, bundling carefully, or narrowing the offer before costs outrun demand.`;
  const goodwillLabel = flavor.goodwill || `Spend short-term money on guest trust, then tighten the system once the room is calmer.`;
  const gambleLabel = flavor.gamble || `Keep sales moving with a fast promise and hope the team can clean up the operational details later.`;

  return [
    action(
      `${slug}-measured`,
      bestLabel,
      "The booth gives up a little instant momentum, but the decision has clean ownership, defensible numbers, and fewer surprises later.",
      [2, 2, 4, staffLift(index)]
    ),
    action(
      `${slug}-margin`,
      marginLabel,
      "Revenue improves and the math is easier to defend, though some guests and crew feel the choice before they understand it.",
      [4, -1, 1, { marcus: [1, 2], priya: [1, 1] }]
    ),
    action(
      `${slug}-goodwill`,
      goodwillLabel,
      "People appreciate the care, but the team has to absorb the cost and prevent guests from treating the exception like the new rule.",
      [-2, 4, 2, { elena: [2, 2], devon: [1, 1] }]
    ),
    action(
      `${slug}-gamble`,
      gambleLabel,
      "It looks efficient for a moment, then the hidden cost shows up in rework, confused guests, and a crew that feels set up.",
      [3, -4, -5, staffHit(index)]
    )
  ];
}

function makeBusinessEvent({ id, category, pressure = "High", headline, body, lever, beats: authoredBeats }) {
  const beats = STEP_LABELS.map((stepId, index) => {
    const authored = authoredBeats[index] || {};
    return beat(
      stepId,
      authored.title || STEP_TITLES[index],
      authored.body || "The fairground problem is broad enough that one quick fix will only move the pressure somewhere else.",
      authored.consultantId || CONSULTANTS[index % CONSULTANTS.length],
      authored.prompt || "Choose the management move that best balances revenue, trust, capacity, and long-term standards.",
      businessOptions(id, lever, index, authored.options || {})
    );
  });

  return {
    id,
    category,
    pressure,
    headline,
    body,
    rootNodeId: beats[0].id,
    nodes: makeNodes(beats)
  };
}

const COUNTY_FAIR_EVENTS = [
  makeBusinessEvent({
    id: "supplier-cost-spike",
    category: "Supply Chain",
    pressure: "Extreme",
    headline: "Your main food supplier raises prices mid-fair and says the next delivery only comes if you accept the new rate",
    body: "Food costs jump, menus are already printed, and every booth manager has a different theory about whether to pay, pivot, or bluff.",
    lever: "supplier and menu-cost",
    beats: [
      { title: "The invoice changes overnight", body: "Mabel says the new prices make the best sellers barely profitable. Gus wants proof before anyone panics." },
      { title: "Menu prices no longer match reality", body: "Lila can keep selling at the posted price, but every order may quietly lose money." },
      { title: "A cheaper backup vendor appears", body: "The quote is attractive, but delivery timing, quality, and reliability are all question marks." },
      { title: "Staff argue over quality versus survival", body: "The food crew hates substitutions. The ticket booth hates explaining surprise price changes." },
      { title: "The fair board wants a vendor policy", body: "This will not be the last supplier squeeze unless the booth creates rules before the next invoice lands." }
    ]
  }),
  makeBusinessEvent({
    id: "premium-price-backlash",
    category: "Pricing Strategy",
    headline: "Your team launches premium fair bundles, but guests accuse you of turning fun into a luxury tax",
    body: "The bundles make strong money, but families are comparing prices loudly and rivals are calling your booth greedy.",
    lever: "premium pricing",
    beats: [
      { title: "The bundle sells and annoys people", body: "Revenue is up, but the line mood is getting sharp enough to cut ribbon." },
      { title: "Competitors undercut you with simpler offers", body: "Their margins may be worse, but their signs are easier to understand." },
      { title: "The best-selling bundle strains inventory", body: "Every premium order pulls supplies from regular guests who still expect normal service." },
      { title: "Staff feel trapped defending the price", body: "Lila and Ruby want language they can stand behind instead of apologizing all shift." },
      { title: "You need a pricing rule for the rest of the fair", body: "The booth has to decide whether premium pricing is a strategy, a test, or a mistake." }
    ]
  }),
  makeBusinessEvent({
    id: "labor-shortfall-rush",
    category: "Staffing Coverage",
    pressure: "Extreme",
    headline: "Two workers call out before the busiest evening, and every area claims they are the one place that cannot be short-staffed",
    body: "Lines are already forming, overtime is expensive, and moving one person creates a hole somewhere else.",
    lever: "staffing coverage",
    beats: [
      { title: "The schedule collapses at 4:30", body: "Everyone can explain why their station is essential, and irritatingly, most of them are correct." },
      { title: "Overtime is available but costly", body: "Paying extra could save the night or eat the margin the booth was counting on." },
      { title: "Cross-training is suddenly not theoretical", body: "Scout can float, but a rushed assignment can create new mistakes in front of guests." },
      { title: "The crew watches who gets protected", body: "A staffing call is also a respect call, and the team will remember the pattern." },
      { title: "You need a coverage model for tomorrow", body: "Luck is not a staffing strategy, even if it did show up once with a name tag." }
    ]
  }),
  makeBusinessEvent({
    id: "inventory-shrink-mystery",
    category: "Inventory Control",
    headline: "Prize inventory is disappearing faster than sales, and nobody can tell if it is theft, bad counts, or generous employees",
    body: "Gus has a furious spreadsheet, June has an incomplete count sheet, and the prize wall is developing suspicious empty spots.",
    lever: "inventory control",
    beats: [
      { title: "The count does not match the wall", body: "The missing inventory is real enough to cost money, but the explanation is still foggy." },
      { title: "A new prize limit could slow sales", body: "Guests love winning big. The booth loves not bleeding plush animals into the atmosphere." },
      { title: "Staff want trust, not surveillance", body: "Too much control may insult honest workers; too little control tells the problem to continue." },
      { title: "A rival booth hints your games are rigged", body: "The inventory issue is becoming a reputation issue before the facts are settled." },
      { title: "The booth needs audit rules", body: "A fair prize system has to feel generous without being financially haunted." }
    ]
  }),
  makeBusinessEvent({
    id: "customer-refund-wave",
    category: "Customer Retention",
    pressure: "High",
    headline: "One refund turns into a wave of guests demanding money back for delays, weather, prices, and vibes",
    body: "Some complaints are fair, some are nonsense, and the booth cannot afford to teach everyone that yelling is a coupon.",
    lever: "refund policy",
    beats: [
      { title: "The first refund gets noticed", body: "Ruby handled one upset family kindly, and now four nearby guests are testing the boundary." },
      { title: "The line starts comparing outcomes", body: "Inconsistent exceptions become public policy when everyone is standing two feet apart." },
      { title: "The cash drawer feels the kindness", body: "Refunds protect reputation, but they also turn revenue into an inspirational memory." },
      { title: "Staff want permission to say no", body: "Frontline workers need a policy that keeps them from negotiating every complaint from scratch." },
      { title: "You need a recovery ladder", body: "The booth needs levels: apology, replacement, credit, refund, and when to stop." }
    ]
  }),
  makeBusinessEvent({
    id: "forecasting-demand-surge",
    category: "Demand Forecasting",
    pressure: "Extreme",
    headline: "A local radio shoutout sends sudden demand to one booth, but ordering enough for the surge could leave you with expensive leftovers",
    body: "The crowd spike could be a goldmine or a one-hour mirage. The team has to decide how much to scale without gambling the whole budget.",
    lever: "demand forecast",
    beats: [
      { title: "Demand jumps without warning", body: "Boone is thrilled. Marcus is already asking whether excitement is a spreadsheet category." },
      { title: "Buying more stock locks in risk", body: "A bigger order protects sales if the crowd stays, but leftover perishables punish optimism." },
      { title: "Capacity becomes the bottleneck", body: "Even with enough stock, the booth may not have enough hands, fryers, or patience." },
      { title: "Other booths want shared traffic", body: "Allies are asking for cross-promos while rivals are quietly hoping you overextend." },
      { title: "You need a surge playbook", body: "The next spike should feel like an opportunity, not a surprise exam with napkins." }
    ]
  }),
  makeBusinessEvent({
    id: "vendor-quality-failure",
    category: "Quality Control",
    headline: "A discount vendor delivers supplies that look fine on paper but keep creating quality complaints at the booth",
    body: "The cheaper input protects margins until customers notice. Now the team has to decide what quality is worth.",
    lever: "quality control",
    beats: [
      { title: "The first complaints sound subjective", body: "Some guests say the product tastes off. Others are still buying. That makes the decision annoyingly gray." },
      { title: "Switching vendors costs money immediately", body: "The better supplier can deliver, but only at a price that hurts tonight's margin." },
      { title: "Staff morale slips with every complaint", body: "Mabel hates serving something she would not defend, and Scout is tired of absorbing the reaction." },
      { title: "Reviews start mentioning consistency", body: "The problem is moving from individual taste to public trust." },
      { title: "You need a quality threshold", body: "The booth has to decide what it will never compromise, even when the cheap option smiles." }
    ]
  }),
  makeBusinessEvent({
    id: "capacity-line-bottleneck",
    category: "Capacity Planning",
    pressure: "High",
    headline: "Your booth is popular enough to create a line problem, and the line problem is starting to cost sales",
    body: "Long lines make the booth look successful until guests leave, staff rush, and nearby attractions complain about blocked walkways.",
    lever: "line capacity",
    beats: [
      { title: "The line becomes its own attraction", body: "People assume the booth is worth waiting for, but the wait is beginning to eat the win." },
      { title: "Speeding up may lower quality", body: "Shorter service time helps revenue if it does not create wrong orders and angry returns." },
      { title: "A second station needs investment", body: "Adding capacity costs money before it proves whether the demand will stay." },
      { title: "The crew starts cutting corners", body: "Under pressure, people invent shortcuts. Some are brilliant. Some are future incident reports." },
      { title: "You need a queue standard", body: "The booth needs a plan for when popularity becomes operational debt." }
    ]
  }),
  makeBusinessEvent({
    id: "cashless-payment-crash",
    category: "Payment Systems",
    pressure: "Extreme",
    headline: "The card system crashes during peak hours, forcing teams to decide how much business to keep moving offline",
    body: "Cash is limited, receipts are messy, and every minute offline creates a choice between lost sales and risky recordkeeping.",
    lever: "payment continuity",
    beats: [
      { title: "The card readers go dark", body: "Lila can still talk to guests, but the register is currently a decorative tablet." },
      { title: "Manual payments could save sales", body: "Writing things down keeps the line alive, but bad records can become tomorrow's mystery loss." },
      { title: "Some guests only have cards", body: "Turning them away is clean and costly. Trusting them is generous and risky." },
      { title: "Staff disagree on who tracks what", body: "Without clear roles, everyone is half-solving the same problem." },
      { title: "You need a downtime process", body: "The next outage should trigger a checklist, not a group improv scene." }
    ]
  }),
  makeBusinessEvent({
    id: "sponsor-discount-demand",
    category: "Sponsor Negotiation",
    headline: "A sponsor demands a steep employee-family discount that would flood your booth with low-margin orders",
    body: "Their money helped pay for the fair, but their discount request could crowd out full-price customers during the busiest hours.",
    lever: "sponsor discount",
    beats: [
      { title: "The sponsor asks publicly", body: "Saying no risks a relationship. Saying yes risks teaching every partner to negotiate in front of a line." },
      { title: "The discount could overload capacity", body: "Low-margin volume is still work, and work still needs staff, supplies, and space." },
      { title: "Other sponsors hear about it", body: "One special deal can multiply faster than cotton candy rumors." },
      { title: "Staff worry about fairness", body: "They are the ones who will explain why some guests pay less for creating more work." },
      { title: "You need partner-benefit rules", body: "Sponsorship should support the fair, not quietly hijack booth economics." }
    ]
  }),
  makeBusinessEvent({
    id: "weather-demand-pivot",
    category: "Market Adaptation",
    pressure: "High",
    headline: "A sudden cold snap kills demand for cold drinks and creates a rush for hot food your booth barely planned to sell",
    body: "The forecast was wrong, guests are chilly, and the inventory mix now looks like it was chosen by a beach towel.",
    lever: "weather pivot",
    beats: [
      { title: "Demand flips in one hour", body: "Prize Pig Lemonade is staring at a mountain of cold cups while people ask for soup that does not exist." },
      { title: "Discounting cold stock may protect cash", body: "Moving inventory helps, but training guests to wait for discounts can create tomorrow's problem." },
      { title: "Hot-menu ingredients are limited", body: "A pivot can work only if the kitchen can execute without wrecking the rest of the fair." },
      { title: "Staff want a clear priority", body: "Nobody wants to chase six half-plans through a cold, cranky crowd." },
      { title: "You need a weather-based menu rule", body: "Forecast mistakes are survivable if the booth knows when and how to pivot." }
    ]
  }),
  makeBusinessEvent({
    id: "shared-equipment-conflict",
    category: "Resource Allocation",
    headline: "Three booths need the same shared freezer, and whoever gets priority can make money while the others lose product",
    body: "The freezer schedule was vague, inventory is thawing, and alliances are suddenly very interested in fairness.",
    lever: "shared equipment",
    beats: [
      { title: "The freezer becomes the bottleneck", body: "Everyone's emergency is real, which is unhelpful when the freezer has one door." },
      { title: "Priority rules affect revenue", body: "The highest-margin booth can justify priority, but the smaller booths may see favoritism." },
      { title: "A rental unit is available at a painful price", body: "Buying capacity solves the fight if the numbers can survive the invoice." },
      { title: "Alliances pressure the decision", body: "Helping one partner can look like betraying another, even when the math is honest." },
      { title: "You need a shared-resource policy", body: "Equipment rules should exist before everyone is holding thawing inventory and feelings." }
    ]
  })
];

module.exports = COUNTY_FAIR_EVENTS;
