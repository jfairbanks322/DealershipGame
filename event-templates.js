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
  if (!Array.isArray(options) || options.length < 3) {
    return options || [];
  }
  const ranked = [...options].sort((a, b) => optionScore(a) - optionScore(b));
  const patternsByCount = {
    3: [
      [1, 2, 0],
      [0, 1, 2],
      [0, 2, 1],
      [2, 0, 1],
      [1, 0, 2]
    ],
    4: [
      [1, 3, 0, 2],
      [2, 0, 3, 1],
      [3, 1, 2, 0],
      [0, 2, 1, 3],
      [2, 3, 0, 1]
    ]
  };
  const patterns = patternsByCount[ranked.length];
  if (!patterns) {
    return ranked;
  }
  return patterns[beatIndex % patterns.length].map((index) => ranked[index]);
}

function makeNodes(beats) {
  return Object.fromEntries(
    beats.map((entry, index) => {
      const nextNodeId = index + 1 < beats.length ? beats[index + 1].id : null;
      const orderedOptions = orderOptionsForDecision(entry.options, index);
      return [
        entry.id,
        {
          title: entry.title,
          body: entry.body,
          consultants: {
            [entry.consultantId]: {
              prompt: entry.prompt,
              options: orderedOptions.map((option) =>
                opt(option.id, option.label, option.outcome, nextNodeId, effect(option.effects))
              )
            }
          }
        }
      ];
    })
  );
}

function makeEvent({ id, category, pressure, headline, body, beats }) {
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

const FEAST_HAVEN_EVENTS = [
  makeEvent({
    id: "influencer-hates-everything",
    category: "Public Relations",
    pressure: "Extreme",
    headline: "A local influencer with two million followers is live-streaming from table six and loudly hating every single detail",
    body:
      "She says the water feels judgmental, the lighting is 'emotionally beige,' and your bread basket is apparently a personal betrayal.",
    beats: [
      beat("opening", "The stream starts nasty and gets louder", "Nearby tables are now listening to her instead of their own conversations.", "nina", "Celia says the room can survive one loud guest. It cannot survive becoming her content background.", [
        action("ih-open-side", "Send a composed manager check-in and invite her to explain the real issue off camera.", "You slow the spectacle and make her work harder to perform outrage.", [0, 2, 3, { nina: [1, 2], elena: [1, 1] }]),
        action("ih-open-overfix", "Flood the table with small corrections, treats, and apologies before she asks.", "The table looks cared for, but now the stream reads Feast Haven as panicky prey.", [1, 1, 0, { nina: [1, 1], devon: [0, 1], marcus: [-1, -1] }]),
        action("ih-open-shadow", "Ignore the commentary and simply execute perfect service around her.", "It preserves dignity, but she gets to narrate the silence as guilt.", [1, 0, 1, { nina: [0, 1], jake: [1, 0] }]),
        action("ih-open-buyoff", "Offer a comp package if she ends the stream and resets the tone.", "She hears the offer as weakness and says 'they're negotiating with my ring light.'", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("staff", "Adrian wants to charm her while Marisol wants boundaries", "The floor is split between winning her over and refusing to perform for her audience.", "jake", "Adrian says confidence can flip the room. Marisol says overplaying charm turns staff into props.", [
        action("ih-staff-escort", "Assign one polished point person and ask everyone else to stop orbiting the stream.", "The service lane calms down and the room stops feeling like open audition night.", [0, 2, 2, { jake: [1, 1], elena: [2, 2] }]),
        action("ih-staff-leanin", "Let Adrian freestyle a warm, funny recovery and hope charisma outruns the criticism.", "The table softens a little, but the restaurant now depends on one personality staying perfect.", [2, 1, 0, { jake: [2, 2], elena: [-1, -1] }]),
        action("ih-staff-script", "Give every staff member a tight script and forbid improvising around her.", "Consistency improves, but the room suddenly feels corporate and brittle.", [-1, 1, 2, { nina: [1, 2], jake: [-1, -2] }]),
        action("ih-staff-clapback", "Let a fed-up server answer one of her complaints with a little edge.", "The internet loves conflict until your restaurant becomes the villain in episode one.", [2, -2, -4, { jake: [-2, -3], nina: [-2, -2], devon: [-1, -1] }])
      ]),
      beat("menu", "She declares the special 'fake luxury for people afraid of seasoning'", "Now guests are ordering around her commentary instead of around the menu.", "tasha", "Chef Renata says changing the plate for a camera is surrender. Keeping it unchanged may be expensive pride.", [
        action("ih-menu-explain", "Offer one concise chef explanation of the dish's intent, then stop feeding the narrative.", "You defend the food without turning dinner into debate club.", [0, 1, 3, { tasha: [2, 2], nina: [1, 1] }]),
        action("ih-menu-tweak", "Quietly adjust her plate and say the kitchen can personalize within reason.", "The flexibility helps, but it trains the room to expect revisions from the line.", [1, 1, 0, { tasha: [0, -1], priya: [-1, -1], devon: [1, 1] }]),
        action("ih-menu-offramp", "Guide her toward simpler dishes and frame it as finding her style, not fixing yours.", "It lowers the chance of disaster while gently conceding she set the agenda.", [1, 0, 1, { nina: [1, 1], tasha: [0, 1] }]),
        action("ih-menu-counter", "Send out a dramatically richer replacement dish just to prove her wrong on camera.", "The visual is gorgeous and reads exactly like the restaurant lost its cool.", [2, -2, -3, { tasha: [-2, -3], priya: [-1, -2], elena: [-1, -1] }])
      ]),
      beat("internet", "Comments start asking whether Feast Haven always melts down like this", "Her audience is now writing your reputation in real time.", "elena", "Marisol says the digital answer should protect the room first and the ego second.", [
        action("ih-internet-room", "Post nothing yet and focus on turning the live in-room experience around for actual guests.", "It sacrifices the first online punch and protects the people physically paying tonight.", [0, 2, 2, { elena: [2, 2], marcus: [1, 1] }]),
        action("ih-internet-statement", "Post a brief hospitality-minded statement while the service recovery is still underway.", "It shows steadiness, though some guests now feel like part of a press release.", [0, 1, 2, { elena: [1, 2], nina: [1, 1] }]),
        action("ih-internet-highlight", "Clip the one moment she smiled and circulate that instead.", "Smart spin if noticed, risky spin if the full stream keeps getting worse.", [2, 0, 0, { elena: [1, 1], jake: [1, 0] }]),
        action("ih-internet-war", "Dunk on the influencer from the restaurant account and let the internet pick a side.", "A short hit of applause becomes a long week of screenshots.", [3, -2, -4, { elena: [-3, -4], nina: [-1, -2] }])
      ]),
      beat("final", "She is about to post a final verdict and asks whether Feast Haven wants a last word", "The whole room can feel the decision coming.", "devon", "Parker says this is where you choose between dignity, theater, and panic.", [
        action("ih-final-grace", "Thank her for coming, own the rough edges, and make no special ask about the post.", "The ending is mature enough to unsettle the outrage machine.", [0, 2, 4, { devon: [2, 2], elena: [1, 2], nina: [1, 1] }]),
        action("ih-final-invite", "Invite her back for a controlled second try on your terms another night.", "It keeps a bridge alive without promising surrender.", [1, 1, 1, { devon: [1, 1], nina: [1, 1] }]),
        action("ih-final-balance", "Ask if she would include both the mistakes and the recovery in fairness to staff.", "Reasonable, but it subtly centers your pain over her audience's spectacle.", [1, 0, 1, { devon: [1, 1], jake: [0, 1] }]),
        action("ih-final-deal", "Offer a future comped private tasting if she softens the post tonight.", "She leaves smiling and you spend the next month sounding bribey in high definition.", [2, -2, -4, { devon: [-2, -3], elena: [-2, -2], marcus: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "grandma-secret-menu-takeover",
    category: "Kitchen Intrusion",
    pressure: "High",
    headline: "An elderly guest claims Chef Renata stole her family recipe and now demands to cook it herself in your kitchen",
    body:
      "She brought an apron, a casserole dish, and three cousins who keep saying 'let Nonna work.'",
    beats: [
      beat("opening", "Grandma has entered the building with legal confidence and paprika", "The front room loves her. The kitchen absolutely does not.", "elena", "Marisol says the crowd sees a lovable grandma. Chef Renata sees an unauthorized heat source.", [
        action("gs-open-listen", "Hear her out fully in a side room before anyone promises access or denies anything dramatic.", "You slow the theater and buy enough space to separate story from stunt.", [0, 2, 3, { elena: [2, 2], tasha: [1, 1] }]),
        action("gs-open-show", "Invite her to explain the recipe tableside while management verifies the claim.", "The room enjoys the pageant, but you accidentally upgraded a complaint into programming.", [2, 1, 0, { elena: [1, 1], jake: [1, 1], tasha: [-1, -1] }]),
        action("gs-open-badge", "Offer a supervised kitchen look-through instead of a cooking takeover.", "It sounds respectful and still risks turning the line into family court.", [1, 1, 1, { elena: [1, 1], tasha: [0, -1] }]),
        action("gs-open-bounce", "Shut it down immediately and tell her no guest ever enters the kitchen, end of story.", "Technically clean, emotionally radioactive, and now the cousins are filming you as a villain.", [1, -2, -4, { elena: [-1, -2], tasha: [1, 1], nina: [-1, -1] }])
      ]),
      beat("claim", "Grandma produces a handwritten recipe card with matching sauce stains", "Chef Renata insists dozens of families make similar dishes and refuses to be tried by index card.", "tasha", "Chef Renata wants dignity. The room wants a showdown and maybe a sample.", [
        action("gs-claim-compare", "Have Renata compare the recipe privately and identify overlap without admitting theft.", "You keep the chef respected while acknowledging the guest might not be entirely delusional.", [0, 1, 3, { tasha: [2, 2], priya: [1, 1] }]),
        action("gs-claim-dual", "Propose a blind taste comparison later instead of an immediate kitchen coup.", "It feels fair-minded, though everyone hears 'food trial' and gets excited.", [1, 1, 1, { tasha: [1, 1], elena: [1, 1] }]),
        action("gs-claim-credit", "Offer to recognize the family's influence on a limited special if they calm the room.", "Clever diplomacy, but it edges close to rewarding pressure tactics.", [2, 0, 0, { nina: [1, 1], tasha: [-1, -1] }]),
        action("gs-claim-admit", "Suggest there may have been 'borrowing' and try to settle it with free dinner and compliments.", "The apology sounds like a confession and now everybody smells lawsuit lasagna.", [1, -2, -4, { tasha: [-3, -4], marcus: [-1, -1] }])
      ]),
      beat("kitchen", "The cousins now want Grandma to do a quick live demo for authenticity", "Theo says if one civilian touches the line, the whole shift becomes folklore with burns.", "luis", "Theo says every second spent on this stunt comes directly out of paying guests' dinner times.", [
        action("gs-kitchen-demo", "Offer a controlled cold-prep demo at a banquet side station far away from the line.", "You preserve safety while giving the family a stage that isn't attached to live knives.", [0, 2, 2, { luis: [2, 2], tasha: [1, 1], elena: [1, 1] }]),
        action("gs-kitchen-taster", "Let Grandma season one test ramekin under direct chef supervision.", "It scratches the ritual itch without fully handing her the ship.", [1, 1, 1, { luis: [1, 1], tasha: [0, 1] }]),
        action("gs-kitchen-delay", "Promise a future guest-chef event if they stop disrupting service tonight.", "Useful if they trust you, flimsy if they read it as polite eviction theater.", [1, 0, 1, { elena: [1, 1], marcus: [0, 1] }]),
        action("gs-kitchen-yolo", "Let Grandma cook one real batch on the line so the room can witness history.", "The room erupts. So does your ticket timing, your staffing map, and Chef Renata's blood pressure.", [3, -3, -4, { luis: [-2, -3], tasha: [-4, -4], priya: [-2, -2] }])
      ]),
      beat("public", "Guests are now divided between Team Nonna and Team Chef", "Your dining room has become a pasta referendum with cocktails.", "jake", "Adrian says a good joke could diffuse it. Marisol says the wrong joke elects a side.", [
        action("gs-public-toast", "Frame it publicly as two proud traditions, not a theft trial, and move the room back toward dinner.", "You give guests a story to enjoy without giving them a verdict to enforce.", [0, 2, 2, { jake: [1, 1], elena: [2, 2] }]),
        action("gs-public-feature", "Turn the dispute into a one-night charity tasting vote with strict structure.", "Entertaining and money-friendly, but it rewards disruption with spotlight.", [2, 0, 0, { jake: [1, 1], marcus: [0, 1], tasha: [-1, -1] }]),
        action("gs-public-separate", "Reseat the family to a quieter corner and keep service moving elsewhere.", "Operationally sensible, emotionally easy to read as a soft exile.", [1, 1, 0, { elena: [1, 1], nina: [1, 0] }]),
        action("gs-public-pick", "Publicly back Chef Renata hard and tell the room the accusation is insulting nonsense.", "The kitchen feels defended and the family instantly upgrades the story to oppression with parmesan.", [2, -2, -4, { tasha: [2, 2], elena: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("final", "Grandma says she will leave quietly if Feast Haven handles the recipe question with respect", "She wants acknowledgement, not necessarily ownership of the building.", "marcus", "Omar says this is the point where you decide whether tonight ends as a scene or a legend people actually like.", [
        action("gs-final-documented", "Offer a respectful follow-up with the family, chef, and written notes after service, then send dessert to the table tonight.", "It is unflashy, grown-up, and probably the only version that survives sunrise.", [0, 2, 4, { marcus: [2, 2], tasha: [2, 2], elena: [1, 1] }]),
        action("gs-final-special", "Create a future collaboration night if both sides agree after tempers cool.", "It preserves possibility without pretending tonight proved anything.", [1, 1, 2, { marcus: [1, 1], tasha: [0, 1], jake: [1, 1] }]),
        action("gs-final-gift", "Send the family home with a lavish care package and no formal acknowledgment either way.", "Kind and strategically ambiguous, though it leaves the core claim floating in the air.", [-1, 1, 2, { marcus: [1, 1], elena: [1, 1] }]),
        action("gs-final-brand", "Put Grandma on camera with Chef Renata tonight and announce the 'stolen recipe summit.'", "The clip is huge. So is the chance you just built recurring chaos as a business model.", [4, -2, -4, { marcus: [-2, -3], tasha: [-3, -4], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "surprise-health-inspection-chaos",
    category: "Compliance Crisis",
    pressure: "Extreme",
    headline: "A health inspector walks in right as the kitchen is slammed, short-staffed, and messier than anybody wants to admit",
    body:
      "The fryer station is behind, a prep cart is sweating suspiciously, and Theo just whispered the sentence 'please let this be a fake inspector.'",
    beats: [
      beat("opening", "The inspector arrives exactly when the line is weakest", "Everyone suddenly notices every towel, every label, and every pan that was going to be handled 'in thirty seconds.'", "priya", "Imani says panic cleanup always looks more guilty than honest triage.", [
        action("sh-open-truth", "Acknowledge the rush, assign one escort, and show exactly how the team is stabilizing the mess in real time.", "You lose the fantasy of perfection and gain the inspector's respect for reality under pressure.", [0, 2, 4, { priya: [2, 2], tasha: [1, 2] }]),
        action("sh-open-freeze", "Pause all nonessential tickets for five minutes and clean hard before the walkthrough deepens.", "It costs momentum, but the room gets visibly safer fast.", [-2, 1, 3, { priya: [2, 2], devon: [-1, -1], marcus: [1, 1] }]),
        action("sh-open-channel", "Keep service running but move one strong staffer to shadow-fix hazards as the inspector moves.", "Operationally elegant, but one missed detail will look deliberate.", [1, 0, 1, { priya: [1, 1], tasha: [0, 1], luis: [-1, -1] }]),
        action("sh-open-hide", "Move questionable items out of sight first and answer questions later.", "The room moves faster for three minutes and then becomes a trust fire.", [2, -3, -4, { priya: [-3, -4], tasha: [-2, -3] }])
      ]),
      beat("walkthrough", "The inspector spots rushed labeling and an overcrowded cold shelf", "Nothing is catastrophic yet, but the mood says one more bad answer could turn this into a lesson.", "marcus", "Omar says the team needs one version of reality before half-answers create a second problem.", [
        action("sh-walkthrough-log", "Produce logs, fix what can be fixed on the spot, and document the corrections openly.", "It is meticulous and slightly humiliating, which is still better than guessing.", [-1, 2, 3, { marcus: [2, 3], priya: [1, 1] }]),
        action("sh-walkthrough-context", "Explain the staffing squeeze clearly while taking responsibility for the misses.", "It humanizes the chaos without sounding like you are asking for pity points.", [0, 1, 2, { marcus: [1, 2], devon: [1, 1] }]),
        action("sh-walkthrough-delegate", "Push technical questions directly to Chef Renata and keep management on guest flow.", "Reasonable if coordinated, risky if it looks like leadership ducking the heat.", [1, 0, 1, { tasha: [1, 1], marcus: [-1, -1] }]),
        action("sh-walkthrough-minimize", "Downplay the issues as normal rush-night clutter and hope confidence carries it.", "Confidence is not sanitizer and the inspector knows that better than you do.", [2, -2, -4, { marcus: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("dining-room", "Guests are noticing the inspection and staff tension", "A rumor is spreading that Feast Haven is 'getting shut down live.'", "elena", "Marisol says the room needs calm facts, not fearful whisper theater.", [
        action("sh-dining-steady", "Brief the floor with one calm sentence for guests and keep service composed, not secretive.", "The room stops inventing apocalypse and starts eating again.", [0, 2, 2, { elena: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("sh-dining-quiet", "Tell staff to avoid mentioning the inspection at all unless directly asked.", "It prevents overtalking but makes every nervous glance feel suspicious.", [1, 0, 0, { elena: [0, 1], nina: [-1, -1] }]),
        action("sh-dining-flex", "Offer small gestures to tables nearest the walkthrough to keep them warm.", "Helpful for hospitality, though it quietly signals that something really is wrong.", [-1, 1, 1, { elena: [1, 1], devon: [1, 1] }]),
        action("sh-dining-lie", "Tell guests the inspector is a private consultant doing a compliment audit.", "It is funny until one guest knows exactly what a county badge looks like.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("kitchen", "Chef Renata wants to yank two menu items because the line is too unstable to promise them safely", "Sales will hurt, but so will pretending the line is fine.", "tasha", "Chef Renata says discipline matters most when it feels most expensive.", [
        action("sh-kitchen-cut", "Cut the two vulnerable items and protect the rest of service from compounding mistakes.", "It shrinks the menu and increases the chance the night ends with fewer regrets.", [-2, 2, 3, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("sh-kitchen-throttle", "Keep the items on but cap how many can be sold each wave.", "Clever, but it requires the kind of line coordination that is already under stress.", [0, 1, 1, { tasha: [1, 1], luis: [0, 1] }]),
        action("sh-kitchen-push", "Keep the full menu and demand cleaner execution without changing the load.", "You preserve top-line potential and ask the line to become magical under scrutiny.", [2, -1, -2, { tasha: [-2, -3], luis: [-1, -2], priya: [-1, -1] }]),
        action("sh-kitchen-bury", "Quietly send questionable prep through faster before the inspector loops back.", "The speed helps until it turns into evidence instead of dinner.", [3, -3, -4, { tasha: [-3, -4], priya: [-3, -4] }])
      ]),
      beat("final", "The inspector says the score depends on how Feast Haven handles the rest of the night", "You are not dead yet. You are being watched.", "devon", "Parker says the best ending is the one that proves learning while the dining room is still breathing.", [
        action("sh-final-plan", "Submit a specific correction plan, finish service with discipline, and follow through visibly.", "It is not glamorous, but it is exactly what grown-up trust looks like.", [0, 2, 4, { devon: [2, 2], marcus: [1, 2], tasha: [1, 1] }]),
        action("sh-final-audit", "Invite a post-service mini debrief with the inspector and key leads before anyone clocks out.", "It costs energy and buys real institutional memory.", [-1, 2, 3, { devon: [1, 2], marcus: [2, 2], priya: [1, 1] }]),
        action("sh-final-sprint", "Keep the room alive first and promise the paperwork tomorrow when the pressure drops.", "Not reckless, but it leans on later discipline from the same team that is currently smoking.", [1, 0, 1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("sh-final-smooth", "Focus on charming the inspector with hospitality and hope the human vibe outweighs the misses.", "Pleasantness helps. Not as much as refrigeration logs.", [2, -2, -4, { devon: [-1, -2], marcus: [-2, -3], priya: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "table-that-wont-leave",
    category: "Floor Management",
    pressure: "High",
    headline: "A group has occupied a prime table for hours, barely ordered, and now peak service is building around them",
    body:
      "They keep saying they are 'just catching up,' which apparently requires one shared fries order and the square footage of three real reservations.",
    beats: [
      beat("opening", "The prime table has become a low-budget lease agreement", "Marisol can feel money dying every time a new walk-in sees that table occupied by four waters and one basket.", "elena", "Marisol says this needs tact because the table is not technically breaking rules, just abusing vibes.", [
        action("tw-open-checkin", "Send a warm check-in that subtly resets the expectation of ordering or wrapping up.", "It is humane, professional, and puts the pressure back where it belongs.", [1, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("tw-open-dessert", "Offer dessert or coffee and see whether increased spend justifies the time.", "It buys data, though possibly at the cost of making them even more comfortable.", [2, 1, 0, { jake: [1, 1], elena: [0, 1] }]),
        action("tw-open-wait", "Leave them alone a little longer and protect the hospitality ideal.", "Kind in theory, expensive in prime-time reality.", [0, 0, 1, { elena: [-1, -1], marcus: [-1, -1] }]),
        action("tw-open-boot", "Tell them directly the table is needed and they must leave within minutes.", "Fast, efficient, and one offended group text away from being your problem all weekend.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("pressure", "Walk-ins and a reservation are now both eyeing the table", "The room can sense there is a bottleneck and begins assigning blame with their eyebrows.", "devon", "Parker says how you balance fairness and urgency here teaches the whole floor what 'guest care' really means.", [
        action("tw-pressure-options", "Offer the long-stay group a comfortable move to the lounge if they want to keep talking.", "You preserve their dignity and reclaim the revenue seat with the least public friction.", [1, 2, 2, { devon: [2, 2], elena: [1, 2] }]),
        action("tw-pressure-hold", "Honor their occupancy but transparently quote longer waits to incoming guests.", "Honest and fair, though it makes the host stand eat the cost of your principles.", [-1, 1, 1, { elena: [-1, -1], devon: [1, 1] }]),
        action("tw-pressure-purchase", "Require a real second round of ordering if they want to remain through peak hours.", "Commercially logical, socially risky, and maybe exactly the rule you wish already existed.", [2, 0, 1, { marcus: [1, 1], nina: [-1, -1] }]),
        action("tw-pressure-fake", "Tell the group another reservation is arriving in two minutes even if that part is exaggerated.", "The lie solves tonight's problem and creates tomorrow's story if spotted.", [2, -2, -4, { devon: [-2, -3], elena: [-2, -2] }])
      ]),
      beat("staff", "Adrian says flipping the table matters; Celia says embarrassing them will poison the room", "Now staff tension is matching guest tension.", "nina", "Celia says table turns matter. So does not making the whole dining room watch a public eviction.", [
        action("tw-staff-align", "Call a quick floor huddle and settle on one tone before anyone freelances the encounter.", "It costs a minute and prevents five different management philosophies from walking to the same table.", [0, 2, 2, { nina: [2, 2], jake: [1, 1], elena: [1, 1] }]),
        action("tw-staff-lead", "Let Adrian handle it solo with his strongest charm and thickest skin.", "He may pull it off, though it turns a system problem into one personality gamble.", [2, 0, 0, { jake: [2, 2], nina: [-1, -1] }]),
        action("tw-staff-manager", "Take the conversation yourself so the staff do not absorb the emotional fallout.", "Protective leadership, but you may miss the subtle floor cues your host sees better.", [0, 1, 1, { devon: [1, 1], elena: [1, 1] }]),
        action("tw-staff-loud", "Use a very visible manager walkover to signal urgency to everyone nearby.", "The message lands with the whole room, which is exactly why the whole room now hates being there.", [1, -2, -3, { nina: [-2, -2], jake: [-1, -1], elena: [-1, -2] }])
      ]),
      beat("public", "A nearby guest jokes that Feast Haven should start charging rent", "The whole section laughs, which means the social temperature just changed.", "jake", "Adrian says humor could save the mood. Marisol says humor could also crown a loser in public.", [
        action("tw-public-light", "Use one light joke privately with the long-stay group and then pivot to options.", "Handled right, it releases pressure without making them the punchline.", [1, 1, 1, { jake: [1, 1], devon: [1, 1] }]),
        action("tw-public-protect", "Ignore the side jokes and keep all communication strictly dignified.", "It avoids cheap laughs and keeps the restaurant feeling grown-up.", [0, 2, 2, { elena: [1, 2], nina: [1, 1] }]),
        action("tw-public-barter", "Offer the table a to-go dessert if they free the prime seat now.", "It is a soft landing that teaches expensive lessons about incentives.", [-1, 1, 1, { marcus: [-1, -1], devon: [1, 1] }]),
        action("tw-public-roast", "Join the joke publicly and try to shame the table into self-awareness.", "The room laughs once and remembers you as the manager who weaponized sarcasm.", [2, -3, -4, { jake: [-2, -2], elena: [-2, -3] }])
      ]),
      beat("final", "Peak service is ending and the policy question remains", "Tonight can pass, but this will happen again if the team learns nothing useful from it.", "marcus", "Omar says the support team would love a rule that does not require psychic diplomacy every Friday night.", [
        action("tw-final-policy", "Create a clear peak-hour seating guideline and train staff to offer graceful lounge transitions.", "It is less dramatic than revenge and much better than repeating tonight forever.", [0, 2, 4, { marcus: [2, 2], elena: [2, 2], nina: [1, 1] }]),
        action("tw-final-soft", "Keep it unwritten but coach the team on cues and escalation timing.", "Flexible and human, though it depends heavily on everyone reading the room the same way.", [1, 1, 1, { marcus: [1, 1], elena: [1, 1] }]),
        action("tw-final-menu", "Introduce a peak lounge menu specifically designed to relocate long campers profitably.", "Creative, slightly manipulative, and maybe exactly the kind of trick that works.", [2, 1, 0, { marcus: [0, 1], devon: [1, 1], jake: [1, 1] }]),
        action("tw-final-post", "Post a blunt social rule about table time limits and call it transparency.", "Efficient online. In person it makes dinner feel like parking enforcement with candles.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2], jake: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "mystery-food-critic",
    category: "Critical Review",
    pressure: "Extreme",
    headline: "Word reaches the staff that a famous anonymous food critic is in the building, but nobody knows who it is",
    body:
      "Now every quiet diner looks dangerous, every note app looks fatal, and Adrian has already accused three innocent accountants of being culinary snipers.",
    beats: [
      beat("opening", "The rumor hits before the appetizers do", "Service changes instantly because everyone is now acting for an invisible judge.", "jake", "Adrian says the only safe move is to raise the whole room. Celia says panic excellence usually looks like panic.", [
        action("mc-open-whole", "Tell the team to sharpen service across every table rather than chase one mystery guest.", "It is operationally expensive and morally clean, which is a rare pairing.", [0, 2, 4, { jake: [1, 1], nina: [2, 2], elena: [1, 1] }]),
        action("mc-open-shortlist", "Quietly identify two or three likely critics and watch those tables a little closer.", "Focused enough to feel smart, risky enough to make regular guests feel backgrounded.", [1, 1, 1, { jake: [1, 1], elena: [0, 1] }]),
        action("mc-open-manager", "Have managers sweep the room more often and let the staff keep normal rhythms.", "Calm leadership helps, though the line still feels unseen if the kitchen is the real test.", [0, 1, 2, { devon: [1, 1], tasha: [0, 1] }]),
        action("mc-open-hunt", "Actively interrogate tells, hover near note-taking guests, and try to crack the critic fast.", "The room immediately senses prey energy coming off the staff.", [2, -2, -4, { jake: [-2, -3], nina: [-2, -2], elena: [-1, -2] }])
      ]),
      beat("kitchen", "Chef Renata wants to know whether to send her boldest plates or her safest ones", "The critic could reward ambition or punish the wrong flourish.", "tasha", "Chef Renata says cooking scared is ugly. Cooking reckless for applause is uglier.", [
        action("mc-kitchen-clean", "Run the sharpest, cleanest version of the normal menu and trust disciplined execution.", "Less cinematic, more sustainable, and very hard to attack honestly.", [0, 2, 3, { tasha: [2, 2], priya: [1, 1], luis: [1, 1] }]),
        action("mc-kitchen-bold", "Let the chef fire one or two signature flexes at suspicious tables only.", "Potentially brilliant, potentially obvious, and absolutely harder on the line.", [2, 0, 1, { tasha: [1, 1], luis: [0, 1], priya: [-1, -1] }]),
        action("mc-kitchen-balance", "Keep the whole menu normal but allow one surprise touch if a table clearly values craft.", "Thoughtful and nuanced, though it asks the floor to read minds under pressure.", [1, 1, 1, { tasha: [1, 1], jake: [0, 1] }]),
        action("mc-kitchen-showboat", "Start sending theatrical extras to every table that seems remotely important.", "Nothing says 'we are normal' like desperate smoke, spoons, and over-garnished panic.", [3, -2, -4, { tasha: [-2, -3], priya: [-1, -2], luis: [-1, -1] }])
      ]),
      beat("room", "A quiet diner in a corner is taking notes while another table is clearly industry people", "The team is drifting toward uneven service because everyone is guessing prestige.", "elena", "Marisol says the room will remember how it was treated whether or not one secret critic exists.", [
        action("mc-room-reset", "Rebalance attention immediately and treat the whole room as if the critic could be anywhere.", "The floor feels less glamorous and much more competent.", [0, 2, 3, { elena: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("mc-room-scout", "Keep two likely tables under extra watch but assign backup hospitality to the rest.", "A plausible compromise with a thin margin for accidental neglect.", [1, 1, 1, { elena: [1, 1], devon: [1, 1] }]),
        action("mc-room-concierge", "Have Parker float to smooth any table that looks under-served while the staff sniff out the critic.", "It works because Parker is excellent, which is not a scalable strategy.", [1, 0, 1, { devon: [2, 2], marcus: [0, 1] }]),
        action("mc-room-prioritize", "Blatantly prioritize the likely critic tables and tell yourself the upside justifies it.", "The upside may exist. So does every ignored anniversary dinner around them.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2], devon: [-1, -1] }])
      ]),
      beat("twist", "One guest complains that service suddenly feels fake and overperformed", "You may be impressing the critic while alienating normal humans.", "devon", "Parker says the restaurant cannot become a stage play with bread plates.", [
        action("mc-twist-ground", "Dial the room back into natural service and trust the fundamentals to carry the night.", "It lowers the temperature and makes the confidence look earned instead of rehearsed.", [0, 2, 3, { devon: [2, 2], jake: [1, 1] }]),
        action("mc-twist-explain", "Offer the guest a candid apology for the uneven feel without mentioning the critic rumor.", "Honest and useful, though it confirms they were not imagining the weirdness.", [-1, 2, 2, { devon: [1, 2], elena: [1, 1] }]),
        action("mc-twist-pivot", "Reassign that guest to your strongest server and smooth them personally.", "Good recovery at one table, modestly expensive to the rest of the room.", [1, 1, 0, { jake: [1, 1], devon: [1, 1] }]),
        action("mc-twist-double", "Keep the elevated performance because one annoyed table is worth risking for a critic review.", "That sentence will sound worse to you tomorrow than it does right now.", [2, -2, -4, { devon: [-2, -3], elena: [-2, -2] }])
      ]),
      beat("final", "The rumor may have been real, fake, or both, and nobody gets a reveal tonight", "Now you have to decide what lesson the team takes from the paranoia.", "marcus", "Omar says the cleanest systems are the ones that do not need secret royalty to behave well.", [
        action("mc-final-standard", "Train the team around critic-proof consistency instead of critic-specific heroics.", "It is not glamorous, which is exactly why it builds something real.", [0, 2, 4, { marcus: [2, 2], nina: [1, 2], jake: [1, 1] }]),
        action("mc-final-watch", "Keep a quiet VIP-awareness protocol for future high-stakes nights only.", "Reasonable if used sparingly, dangerous if it becomes a class system with appetizers.", [1, 1, 1, { marcus: [1, 1], elena: [1, 1] }]),
        action("mc-final-hybrid", "Create one premium touch the whole room gets whenever the team suspects scrutiny.", "It makes special feel scalable, even if the margins sigh softly.", [-1, 1, 2, { marcus: [1, 1], devon: [1, 1], tasha: [0, 1] }]),
        action("mc-final-chase", "Turn critic hunts into a standing internal game so staff stay 'sharp.'", "You will absolutely stay sharp. You may also stay weird forever.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2], jake: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "allergy-maybe-situation",
    category: "Guest Safety",
    pressure: "Extreme",
    headline: "A guest claims serious allergies, then keeps changing what those allergies actually are",
    body:
      "First it was dairy, then garlic, then 'maybe nightshades spiritually,' and now the table is asking whether truffle oil counts as a mushroom or a lifestyle.",
    beats: [
      beat("opening", "The ticket is becoming a medical choose-your-own-adventure", "The guest sounds anxious, sincere, inconsistent, and very ready to sue the concept of dinner.", "nina", "Celia says the only wrong move is pretending ambiguity is safe just because the table sounds unsure.", [
        action("as-open-clarify", "Pause ordering and walk the guest through a precise written allergy confirmation before firing anything.", "It is slower than they want and safer than they realize.", [-1, 2, 4, { nina: [2, 2], priya: [1, 1] }]),
        action("as-open-manager", "Have a manager take over the allergy conversation and keep one server from freelancing the risk.", "It centralizes the risk well, though it can make the guest feel clinically escalated.", [0, 2, 2, { devon: [1, 2], nina: [1, 1] }]),
        action("as-open-simple", "Guide them firmly toward the simplest low-risk dish you can safely explain.", "Practical and useful, though it may frustrate a guest who wanted broader freedom.", [1, 1, 1, { tasha: [1, 1], nina: [0, 1] }]),
        action("as-open-guess", "Use your best judgment from the shifting story and try to keep dinner moving.", "Nothing says confidence like gambling on whether 'maybe garlic' was metaphorical.", [2, -3, -4, { nina: [-3, -4], priya: [-2, -3], tasha: [-1, -1] }])
      ]),
      beat("kitchen", "Chef Renata wants a hard line if the table cannot define the risk", "The line can execute safety. It cannot execute vibes-based immunology.", "tasha", "Chef Renata says uncertain guests deserve care, not improvisation dressed as empathy.", [
        action("as-kitchen-boundary", "Set a clear boundary: Feast Haven can only guarantee meals against confirmed allergens actually named.", "Firm, respectful, and much safer than pretending the kitchen understands mystical produce categories.", [0, 2, 3, { tasha: [2, 2], priya: [1, 1], luis: [1, 1] }]),
        action("as-kitchen-safeplate", "Offer a highly controlled custom plate from a narrow ingredient set and document every modifier.", "A strong compromise, though it adds real labor and still relies on the guest agreeing to specifics.", [0, 1, 2, { tasha: [1, 1], priya: [1, 1], luis: [0, 1] }]),
        action("as-kitchen-package", "Recommend sealed or minimally handled items wherever possible and explain why.", "A little unromantic, but elegant enough if explained with care.", [-1, 1, 2, { tasha: [1, 2], nina: [1, 1] }]),
        action("as-kitchen-hero", "Promise the kitchen can 'figure something out' no matter how fuzzy the allergy list remains.", "You just made optimism legally spicy.", [2, -2, -4, { tasha: [-3, -4], priya: [-2, -3], luis: [-1, -1] }])
      ]),
      beat("table", "The rest of the party is now rolling their eyes and pushing the guest to 'just pick something'", "The guest is getting flustered and the social pressure is making the answers worse.", "devon", "Parker says the safest answer may require protecting the anxious guest from their own table.", [
        action("as-table-protect", "Calm the table, center the allergic guest, and slow the group until the information is usable.", "You trade table speed for actual care, which is probably the point.", [-1, 2, 3, { devon: [2, 2], nina: [1, 1] }]),
        action("as-table-split", "Take the rest of the table's orders first and return to the allergy order once the pressure is lower.", "Smart pacing, though it can make the guest feel singled out if handled clumsily.", [0, 1, 2, { devon: [1, 2], elena: [1, 1] }]),
        action("as-table-prep", "Offer to bring a safe drink and bread alternative while the guest decides carefully.", "Hospitable and useful, though it still delays the real decision.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("as-table-joke", "Diffuse the tension with a joke about the menu surviving an interrogation better than most suspects.", "One cousin laughs. The guest hears 'your fear is a bit.'", [1, -2, -4, { devon: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("risk", "The guest changes one item again after the food is nearly ready", "Now the kitchen, the clock, and the trust level are all looking at you.", "priya", "Imani says last-second changes are fine when they are preferences. They are not fine when they are safety reversals.", [
        action("as-risk-refire", "Refire the dish from a clean reset and absorb the time hit rather than debate the timeline.", "Expensive and deeply preferable to finding out the hard way.", [-2, 2, 3, { priya: [2, 2], tasha: [1, 1] }]),
        action("as-risk-reconfirm", "Stop the ticket and require one final signed verbal confirmation before anything leaves the pass.", "Cautious and smart, if a little dramatic for the rest of the table.", [-1, 2, 2, { priya: [2, 2], nina: [1, 1] }]),
        action("as-risk-fallback", "Switch them to the safest simplest emergency fallback plate and explain the limitation plainly.", "Not exciting, but safely boring can be a beautiful sentence.", [0, 1, 2, { priya: [1, 1], devon: [1, 1] }]),
        action("as-risk-push", "Send the original dish because the guest is obviously confused and probably overthinking it.", "That thought should never have made it this far down your spinal cord.", [2, -3, -4, { priya: [-3, -4], tasha: [-2, -3], nina: [-2, -2] }])
      ]),
      beat("final", "Dinner ends safely, but the policy question is now staring back at the team", "Tonight worked because everyone stayed alert. Next time luck may be less helpful.", "marcus", "Omar says unclear allergies create huge emotional labor, operational drag, and genuine risk all at once.", [
        action("as-final-policy", "Create a crystal-clear allergy protocol for uncertain or changing claims and train the whole floor on it.", "It is the boring hero move and that is exactly why it wins.", [0, 2, 4, { marcus: [2, 2], nina: [2, 2], priya: [1, 1] }]),
        action("as-final-card", "Add a quick written allergy confirmation card for high-risk tables to reduce memory chaos.", "Useful and a little formal, but easier than reconstructing panic from scratch.", [-1, 2, 3, { marcus: [2, 2], devon: [1, 1] }]),
        action("as-final-menu", "Build a small clearly marked low-risk menu path for complicated cases.", "A thoughtful operational tool with some menu-design cost.", [-1, 1, 2, { tasha: [1, 1], nina: [1, 1], marcus: [1, 1] }]),
        action("as-final-vibes", "Tell staff to trust their instincts with allergy tables because scripts make guests defensive.", "Instinct is lovely for jazz and terrible for liability.", [1, -2, -4, { marcus: [-2, -3], nina: [-2, -3], priya: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "power-outage-dinner-service",
    category: "Infrastructure Failure",
    pressure: "Extreme",
    headline: "Half the restaurant loses power during dinner service and now Feast Haven is trying to serve by candlelight and panic",
    body:
      "One side still has music and refrigeration. The other side has darkness, dead point-of-sale screens, and three guests loudly asking if this is immersive theater.",
    beats: [
      beat("opening", "The lights cut and the room immediately splits in two realities", "The dark side looks abandoned. The bright side looks guilty for existing.", "elena", "Marisol says the first five minutes determine whether this feels managed or haunted.", [
        action("po-open-zones", "Immediately zone the room into lit service, pause zones, and unsafe zones with clear guest communication.", "You sacrifice some romance and gain control over the physics of dinner.", [-1, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("po-open-candles", "Move candles, lanterns, and staff to keep as many tables active as possible.", "Creative and guest-friendly, though it leans on a lot of moving parts staying coordinated.", [1, 1, 1, { elena: [1, 1], marcus: [-1, -1] }]),
        action("po-open-comp", "Offer immediate flexibility and optional transfers to lit tables if they open up.", "Hospitable and calming, but it may create a second crisis around table equity.", [-2, 2, 1, { devon: [1, 1], elena: [1, 2] }]),
        action("po-open-bluff", "Pretend service can continue normally while the team sorts it out behind the scenes.", "Nothing says calm like asking servers to memorize darkness on the fly.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("kitchen", "The line still has partial power, but expo is slowing and printed tickets are gone", "Chef Renata can cook some things and cannot see half the path to getting them out.", "tasha", "Chef Renata says menu ambition just became a luxury item.", [
        action("po-kitchen-reduce", "Cut the menu to the safest hot sellers and one cold fallback path until systems stabilize.", "You protect execution by admitting the restaurant is no longer fully normal.", [-2, 2, 3, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("po-kitchen-manual", "Switch to manual verbal fire calls and handwritten expo boards for the affected side.", "Functional if disciplined, catastrophic if anyone assumes instead of confirms.", [0, 1, 2, { tasha: [1, 1], priya: [1, 1], luis: [0, 1] }]),
        action("po-kitchen-split", "Keep the full menu but route only complicated tickets to the lit side first.", "A clever patch that may still bottleneck exactly where the room feels it most.", [1, 0, 1, { tasha: [0, 1], luis: [0, 1] }]),
        action("po-kitchen-push", "Demand full-speed service and trust that adrenaline will cover the missing systems.", "Adrenaline is not a ticketing platform or a temperature log.", [2, -2, -4, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("guests", "Some guests are thrilled by the drama while others are furious about safety and timing", "The room is no longer one room. It is three emotional countries sharing bread baskets.", "jake", "Adrian says the tone should feel intentional. Parker says it should feel honest.", [
        action("po-guests-honest", "Give a concise honest update, clear options, and a real sense of what still works.", "It cools the angriest people even if it dims the fun for the adventurous ones.", [0, 2, 3, { jake: [1, 1], devon: [2, 2], elena: [1, 1] }]),
        action("po-guests-romance", "Frame the outage lightly as an unexpected candlelight service for tables willing to stay.", "Great for some couples, alienating for anyone who came to simply eat food with electricity.", [1, 1, 0, { jake: [2, 1], devon: [0, 1] }]),
        action("po-guests-priority", "Prioritize the most frustrated tables first with comps and exits while rewarding patient tables later.", "Strategically fair, emotionally messy, and maybe exactly right if communicated well.", [-2, 1, 2, { devon: [1, 1], marcus: [-1, -1] }]),
        action("po-guests-spin", "Tell guests the issue is minor even though half the room is visibly running on candles and hope.", "They have eyes, and unfortunately those eyes still work without power.", [1, -2, -4, { jake: [-2, -2], devon: [-2, -3] }])
      ]),
      beat("systems", "Card readers are patchy, the POS is delayed, and Omar is asking how to close checks in the dark", "Now the outage is no longer ambiance. It is math.", "marcus", "Omar says sloppy money handling is how one chaotic night turns into three bad mornings.", [
        action("po-systems-manual", "Move to a documented manual close process with manager signoff on every affected check.", "Slow, annoying, and beautifully resistant to tomorrow's confusion.", [-1, 1, 3, { marcus: [2, 3], devon: [1, 1] }]),
        action("po-systems-batch", "Let servers hold slips and settle everything in a controlled batch once power stabilizes.", "It preserves flow, though every minute adds memory risk.", [1, 0, 1, { marcus: [0, 1], nina: [-1, -1] }]),
        action("po-systems-cash", "Strongly encourage cash or simple flat settlements for guests who want a quick exit.", "Useful in practice, slightly clumsy in optics, better than pretending terminals work.", [0, 1, 1, { marcus: [1, 1], elena: [1, 1] }]),
        action("po-systems-wing", "Let individual servers solve payment however they can and sort discrepancies tomorrow.", "A brave little sentence with a massive hangover hidden inside it.", [2, -2, -4, { marcus: [-3, -4], nina: [-2, -2], devon: [-1, -1] }])
      ]),
      beat("final", "The power company gives a vague update and Feast Haven must decide how the rest of the night ends", "There is no perfect finish, only tradeoffs with candles.", "devon", "Parker says the final call should protect trust first and ego second.", [
        action("po-final-controlled", "Close the unsafe half, finish the safe half with reduced service, and end the night intentionally.", "It is smaller than the dream and much larger than a disaster.", [-2, 2, 4, { devon: [2, 2], elena: [2, 2], marcus: [1, 1] }]),
        action("po-final-salvage", "Keep a lean version of service going everywhere that can physically support it.", "Ambitious and workable only if discipline holds for one more long stretch.", [1, 1, 1, { devon: [1, 1], tasha: [0, 1] }]),
        action("po-final-rebook", "Close service early, comp selectively, and aggressively rebook goodwill for later nights.", "Painful tonight, potentially wise for the week.", [-3, 2, 2, { devon: [1, 2], marcus: [1, 1], jake: [-1, -1] }]),
        action("po-final-max", "Chase full revenue anyway because outages are not going to pay the bills for you.", "That sentence ends with slips, burns, chargebacks, and a very sincere apology post.", [3, -3, -4, { devon: [-3, -4], marcus: [-2, -3], tasha: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "staff-group-chat-revolt",
    category: "Staff Culture",
    pressure: "High",
    headline: "The staff group chat is exploding and nearly every message is some version of 'management has lost the plot'",
    body:
      "Screens are buzzing, morale is leaking into memes, and Omar says the dish pit now has a better understanding of leadership than leadership does.",
    beats: [
      beat("opening", "You realize the revolt is not private anymore", "Multiple employees are reading the thread between tables and nobody is pretending otherwise.", "marcus", "Omar says the worst response is acting shocked that people complained after giving them things to complain about.", [
        action("gc-open-own", "Address the team directly, acknowledge the frustration, and promise a same-night debrief after service.", "It does not erase the anger, but it keeps people from feeling surveilled and ignored at once.", [0, 2, 3, { marcus: [2, 2], devon: [1, 1], nina: [1, 1] }]),
        action("gc-open-scan", "Quietly read enough of the thread to understand patterns before saying anything big.", "Useful and measured, though staff may still feel watched if your timing looks too psychic.", [1, 1, 1, { marcus: [1, 1], elena: [0, 1] }]),
        action("gc-open-captains", "Pull one trusted person from the floor and one from the kitchen to help you interpret the grievance temperature.", "A smart coalition move if they believe you actually want truth.", [0, 1, 2, { marcus: [1, 2], tasha: [1, 1], nina: [1, 1] }]),
        action("gc-open-threat", "Warn the staff that disrespect in private channels still has consequences at work.", "Nothing soothes a group revolt like proving the group chat was right.", [1, -3, -4, { marcus: [-3, -4], nina: [-2, -3], tasha: [-2, -2] }])
      ]),
      beat("content", "Some complaints are fair, some are petty, and one meme about you is unfortunately incredible", "Now you have to decide whether to react to tone, truth, or both.", "devon", "Parker says people gossip for style but revolt for substance.", [
        action("gc-content-themes", "Respond to the underlying themes only and refuse to litigate every spicy line item tonight.", "It keeps the conversation adult without pretending the snark was the real problem.", [0, 2, 3, { devon: [2, 2], marcus: [1, 1] }]),
        action("gc-content-specifics", "Pick two concrete complaints you can fix quickly and show action before speeches.", "Visible movement buys credibility, though it may make larger issues feel postponed.", [1, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("gc-content-civility", "Ask for a more respectful tone first, then offer to discuss substance after that.", "Reasonable in principle, risky when the team thinks tone is all management ever hears.", [0, 0, 1, { devon: [-1, -1], nina: [-1, -2] }]),
        action("gc-content-roast", "Make a joke about the meme being better than your actual staff training materials.", "Self-awareness gets a laugh and then leaves everybody wondering if anything real will change.", [2, -1, -2, { devon: [-1, -1], marcus: [-1, -1] }])
      ]),
      beat("operations", "The chat complaints are bleeding into live service decisions", "Adrian and Celia are now passive-aggressively proving each other's points with actual guests nearby.", "nina", "Celia says this stops being culture and starts being sabotage if nobody resets the floor right now.", [
        action("gc-ops-reset", "Reassign the hottest pairings for the night and protect the dining room first.", "It may feel like avoidance to some, but it stops the guest-facing collateral damage.", [0, 2, 2, { nina: [2, 2], jake: [1, 1], devon: [1, 1] }]),
        action("gc-ops-standards", "State one non-negotiable expectation for live service while promising the bigger conversation later.", "Clear and stabilizing if your tone sounds like leadership instead of panic.", [1, 1, 1, { nina: [1, 1], devon: [1, 1] }]),
        action("gc-ops-floor", "Work the floor yourself aggressively to absorb some of the emotional spillover.", "Protective and admirable, though it can hide the fact that the team system itself still hurts.", [0, 1, 1, { devon: [2, 2], marcus: [0, 1] }]),
        action("gc-ops-callout", "Call out one obvious complainer publicly to warn the rest of the staff back into line.", "A thrilling idea if your goal is to turn private resentment into organized unity against you.", [1, -3, -4, { nina: [-3, -4], jake: [-2, -2], marcus: [-1, -2] }])
      ]),
      beat("debrief", "Service ends and the team expects some kind of response that matters", "If you hold a fake listening session, they will smell it before the chairs cool off.", "tasha", "Chef Renata says people can survive hard standards. They quit unclear standards faster.", [
        action("gc-debrief-structure", "Run a short structured debrief with two truths, one fix now, and one fix scheduled.", "It feels disciplined rather than defensive, which the room badly needs.", [0, 2, 4, { tasha: [2, 2], marcus: [1, 1], devon: [1, 1] }]),
        action("gc-debrief-small", "Speak to the team in role clusters first instead of forcing one giant emotional town hall.", "Smart for nuance, though some staff may suspect issues are being diluted into safer smaller pockets.", [1, 1, 1, { tasha: [1, 1], nina: [1, 1], luis: [1, 1] }]),
        action("gc-debrief-anon", "Set up an anonymous follow-up form and promise written action by tomorrow.", "Potentially useful, but the team may crave a human answer tonight, not just a digital slot machine.", [0, 1, 2, { marcus: [1, 2], devon: [0, 1] }]),
        action("gc-debrief-lecture", "Explain to the team how much pressure management is under and why the chat felt unfair.", "A deeply human impulse and an almost guaranteed own goal.", [1, -2, -4, { tasha: [-2, -3], marcus: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The group chat will survive tonight. The question is whether the trust can", "Now the team is measuring follow-through, not language.", "elena", "Marisol says culture repairs happen in patterns, not speeches.", [
        action("gc-final-rhythm", "Create a recurring staff pulse check with visible action follow-ups and role-based feedback lanes.", "It is work, which is why it might actually be leadership.", [0, 2, 4, { elena: [2, 2], marcus: [2, 2], nina: [1, 1] }]),
        action("gc-final-board", "Post a weekly issue board showing what management heard, changed, and could not change yet.", "Transparency earns real points if you can survive the honesty it requires.", [-1, 2, 3, { elena: [2, 2], marcus: [1, 1] }]),
        action("gc-final-captains", "Formalize a couple of staff liaisons who surface concerns before they become meme storms.", "Useful if trusted, risky if it turns into unofficial politics club.", [1, 1, 1, { elena: [1, 1], devon: [1, 1] }]),
        action("gc-final-mute", "Ban all work chat outside scheduling and hope silence looks like peace.", "Silence is peace the same way unplugging a fire alarm is quiet.", [1, -2, -4, { elena: [-2, -3], marcus: [-2, -3], nina: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "wrong-proposal",
    category: "Romance Disaster",
    pressure: "Extreme",
    headline: "A proposal dessert lands on the wrong table and now one happy surprise and one emotional disaster are fighting for the same room",
    body:
      "The cake says 'Marry Me, Olivia.' Unfortunately, it is now in front of two people named Gary and Linda who were mid-argument about refinancing.",
    beats: [
      beat("opening", "The wrong table now owns the loudest dessert in the building", "One side of the room is horrified, the actual proposer is frozen, and the wrong table looks personally attacked by buttercream.", "devon", "Parker says speed matters, but panic frosting is still panic.", [
        action("wp-open-remove", "Remove the dessert quickly and apologize to both tables with minimal theater.", "You reduce splash damage, though the wrong table still feels drafted into someone else's life plan.", [0, 1, 3, { devon: [1, 2], elena: [1, 1] }]),
        action("wp-open-own", "Own the error openly in one sentence before the room invents a worse version.", "Brave and clarifying, though it amplifies the publicness of everybody's feelings.", [0, 0, 2, { devon: [1, 1], jake: [0, 1] }]),
        action("wp-open-pivot", "Turn the dessert into a temporary 'celebration plate mix-up' and redirect fast.", "A smooth phrase helps, unless someone can still clearly read 'Marry Me, Olivia.'", [1, 0, 1, { devon: [1, 1], elena: [0, 1] }]),
        action("wp-open-compfirst", "Lead with comps and vouchers before anyone has processed what happened.", "Money is helpful. It is not an eraser for emotional shrapnel.", [-2, 0, -1, { marcus: [-1, -1], devon: [0, 1] }])
      ]),
      beat("proposer", "The actual proposer still wants the moment tonight", "He is pale, committed, and asking if the room can possibly be reset without smelling cursed.", "jake", "Adrian says momentum matters. Marisol says the room now contains too much secondhand intimacy.", [
        action("wp-proposer-reset", "Move the proposal to a quieter area and rebuild it only if both partners still want that energy.", "It preserves dignity better than trying to outrun the residue with champagne.", [0, 2, 3, { jake: [1, 1], elena: [1, 2] }]),
        action("wp-proposer-delay", "Encourage a sincere postponement and help salvage the night in smaller ways.", "Possibly the wisest move and definitely the least cinematic.", [-1, 2, 2, { devon: [2, 2], jake: [-1, -1] }]),
        action("wp-proposer-private", "Offer a stripped-down private version with no spectacle and no more cake theatrics.", "A balanced middle road if the couple values intimacy more than choreography.", [1, 1, 1, { jake: [1, 1], devon: [1, 1] }]),
        action("wp-proposer-force", "Recreate the full proposal in the same room immediately so the mistake does not 'win.'", "A bold sentence that sounds much worse once you imagine the wrong table still chewing through it.", [3, -2, -4, { jake: [-2, -2], devon: [-2, -3] }])
      ]),
      beat("wrongtable", "The wrong table says Feast Haven just turned their bad night into a public sideshow", "They are not wrong, which is deeply inconvenient.", "nina", "Celia says the apology has to recognize harm without pretending the restaurant broke their relationship.", [
        action("wp-wrongtable-care", "Apologize specifically, comp their dessert and exit route, and stop talking before it becomes accidental therapy.", "It feels humane without over-claiming responsibility for their whole life.", [-1, 2, 3, { nina: [2, 2], devon: [1, 1] }]),
        action("wp-wrongtable-boundary", "Acknowledge the service mistake, offer a modest make-good, and protect the staff from becoming emotional referees.", "Fair and controlled, though a colder table may hear it as procedural triage.", [0, 1, 1, { nina: [1, 1], marcus: [1, 1] }]),
        action("wp-wrongtable-space", "Move them to a more private table if they want to keep talking away from the room.", "Useful and kind if they still want to stay in a restaurant at all.", [-1, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("wp-wrongtable-joke", "Try a tension-breaking line about Feast Haven not usually accelerating difficult conversations.", "The joke has a tiny chance to land and an enormous chance to become your obituary.", [1, -2, -4, { nina: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("room", "Other diners are now whispering and filming because humans are awful in groups", "The room wants resolution, and unfortunately it is not their room.", "elena", "Marisol says your job is to keep one mistake from becoming community theater.", [
        action("wp-room-curtain", "Tighten the room quietly: no staff gossip, no visible clusters, no extra spectacle.", "You lower the emotional oxygen without pretending nothing happened.", [0, 2, 2, { elena: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("wp-room-distract", "Use pacing, music, and smooth service touches to pull attention back toward dinner.", "A subtle recovery that works only if the staff stop staring too.", [1, 1, 1, { elena: [1, 1], devon: [1, 1] }]),
        action("wp-room-comp", "Quietly send a little extra warmth to the nearest affected tables to keep goodwill stable.", "Helpful, though it risks teaching the room that chaos brings perks.", [-1, 1, 1, { marcus: [-1, -1], elena: [1, 1] }]),
        action("wp-room-comment", "Ask guests directly to stop filming because this is a private moment.", "Morally correct, operationally likely to make the phones rise higher out of spite.", [0, -2, -3, { elena: [-2, -2], jake: [-1, -1] }])
      ]),
      beat("final", "The room survives, but now Feast Haven needs a safer romance protocol", "You have learned too much about cake routing and human vulnerability tonight.", "marcus", "Omar says the support crew would love for 'proposal operations' to become less improvisational than weather.", [
        action("wp-final-protocol", "Create a clear proposal checklist with coded delivery confirmation and one single point person.", "Unromantic on paper, extremely romantic in practice if it prevents catastrophe.", [0, 2, 4, { marcus: [2, 2], elena: [2, 2], devon: [1, 1] }]),
        action("wp-final-private", "Offer future proposal packages only in more controlled zones or private rooms.", "A sensible hedge that trims some spontaneity along with the risk.", [0, 1, 2, { marcus: [1, 1], elena: [1, 1] }]),
        action("wp-final-confirm", "Require guest-side confirmation language just before dessert service, even if it kills some surprise.", "A little less magical and a lot less catastrophic.", [-1, 2, 3, { marcus: [2, 2], devon: [1, 1] }]),
        action("wp-final-ban", "Stop hosting proposals entirely because love is clearly too operationally volatile.", "The cleanest answer emotionally and the laziest one strategically.", [-2, 0, 0, { jake: [-2, -2], elena: [-1, -1], marcus: [1, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "free-meal-tiktok-hack",
    category: "Policy Abuse",
    pressure: "High",
    headline: "A viral TikTok claims diners can get free meals at Feast Haven by saying a certain phrase, and now tables keep trying it",
    body:
      "The phrase is 'Chef sent me.' Chef definitely did not send them. Unfortunately the internet did.",
    beats: [
      beat("opening", "The first table uses the phrase with suspicious confidence", "By the third try, the floor realizes this is not a coincidence and tonight is about to become coupons with acting.", "nina", "Celia says the first response sets whether this becomes a fun rumor or a loot box.", [
        action("fm-open-verify", "Train staff to respond warmly but verify every claimed comp through one manager checkpoint.", "You preserve hospitality without handing the menu over to folklore.", [0, 2, 4, { nina: [2, 2], marcus: [1, 1] }]),
        action("fm-open-script", "Give the room one playful script that explains the phrase is fake and redirects to real specials.", "Smart and graceful if every server actually uses the same words.", [1, 1, 2, { nina: [1, 2], jake: [1, 1] }]),
        action("fm-open-oneoff", "Honor one or two tables softly while you figure out how big the trend is.", "Merciful in the moment and likely to widen the stampede immediately.", [1, 0, 0, { marcus: [-1, -1], nina: [0, 1] }]),
        action("fm-open-all", "Comp anyone who says it tonight and hope the goodwill offsets the madness.", "An inspiring policy if your goal is to sponsor the internet personally.", [3, -2, -4, { marcus: [-3, -4], nina: [-2, -2] }])
      ]),
      beat("spread", "Now guests are whispering the phrase to each other before staff even arrive", "The hack is turning from stunt into mini-game.", "elena", "Marisol says the room needs one visible truth before the rumor acquires furniture.", [
        action("fm-spread-front", "Have the host stand gently clarify the rumor to incoming parties before seating.", "You cut the surprise factor without making the room feel scolded.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("fm-spread-table", "Let servers explain it table by table only when it comes up.", "Less disruptive to honest diners, slower against a fast rumor.", [1, 1, 1, { nina: [1, 1], jake: [1, 1] }]),
        action("fm-spread-sign", "Post a subtle but clear note that social media 'free phrase' claims are not valid promotions.", "Transparent and useful, though it makes the trend feel officially real.", [0, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("fm-spread-shame", "Laugh off the guests trying it so the room sees how silly the trend is.", "Nothing tells a crowd to double down like public embarrassment with witnesses.", [1, -2, -4, { elena: [-2, -3], nina: [-2, -2] }])
      ]),
      beat("staff", "Adrian says some regulars should get a pass while Omar says fairness is collapsing", "Now the issue is not just policy. It is equity.", "marcus", "Omar says staff morale drops fast when fake confidence gets rewarded more than normal decency.", [
        action("fm-staff-fair", "Hold one consistent rule for everyone and let staff comp only for real service recovery.", "Boring fairness is usually the kind that survives payroll.", [0, 2, 3, { marcus: [2, 2], nina: [1, 1], jake: [-1, -1] }]),
        action("fm-staff-regulars", "Allow tight manager discretion for true regulars but document every comp in real time.", "Flexible and human if your managers are disciplined enough to avoid vibes-only favoritism.", [1, 1, 1, { marcus: [1, 1], devon: [1, 1] }]),
        action("fm-staff-alt", "Offer a tiny social-media special instead of free meals so the trend has a safer landing spot.", "A clever redirect that may calm the room while still feeding the algorithm a snack.", [1, 0, 1, { nina: [1, 1], jake: [1, 0], marcus: [-1, -1] }]),
        action("fm-staff-wing", "Tell the staff to use their judgment and hope the room somehow experiences that as consistency.", "The internet is inconsistent enough without adding your servers to the experiment.", [2, -2, -4, { marcus: [-3, -4], nina: [-1, -2], devon: [-1, -1] }])
      ]),
      beat("internet", "A guest is filming the denial and narrating it like a consumer-rights scandal", "Now the phrase is not just a hack. It is content.", "jake", "Adrian says the response needs enough confidence to look intentional and enough warmth to avoid becoming a villain clip.", [
        action("fm-internet-explain", "Respond on camera with a calm explanation of real promotions and real service-recovery policies.", "It is less flashy than outrage and much harder to make look sinister.", [0, 2, 3, { jake: [1, 2], elena: [1, 1] }]),
        action("fm-internet-pivot", "Offer the table a real menu item or promo they can honestly talk about instead.", "Useful if they want a story more than a fight, risky if they smell bait.", [1, 1, 1, { jake: [1, 1], nina: [1, 1] }]),
        action("fm-internet-brief", "Keep the explanation minimal and refuse to negotiate with the camera itself.", "Strong boundary, slightly cold optics.", [0, 1, 1, { jake: [0, 1], devon: [1, 1] }]),
        action("fm-internet-clap", "Tell the guest the app owes them the free meal, not the restaurant.", "Funny in the kitchen later, devastating when clipped over sad violin music.", [2, -2, -4, { jake: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The trend will probably return unless Feast Haven closes the loop", "Tonight taught the room that rumor management is now a hospitality skill.", "devon", "Parker says the best policy sounds consistent even when guests meet it in different moods.", [
        action("fm-final-policy", "Publish a simple comp-and-promotion policy internally and train every front-facing role on the language.", "It lacks viral sparkle and wins the next three Saturdays anyway.", [0, 2, 4, { devon: [2, 2], nina: [2, 2], marcus: [1, 1] }]),
        action("fm-final-micro", "Launch one tiny legitimate social offer so the internet has a real landing pad instead of fake folklore.", "A strategic pressure valve that needs careful limits.", [1, 1, 1, { jake: [1, 1], nina: [1, 1] }]),
        action("fm-final-qr", "Create a QR page listing live promotions so staff can redirect any hack instantly.", "Operationally smart, though it adds one more thing to maintain.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("fm-final-catchphrase", "Lean in and create rotating secret phrases as a brand stunt.", "Congratulations on turning policy abuse into your marketing department.", [3, -2, -4, { marcus: [-2, -3], nina: [-2, -2], elena: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "kitchen-equipment-meltdown",
    category: "Operations Breakdown",
    pressure: "Extreme",
    headline: "Multiple key pieces of kitchen equipment start failing in the middle of service and the line is turning into interpretive cooking",
    body:
      "The salamander is dead, one cooler is warm, and the mixer just made a sound Theo described as 'legally concerning.'",
    beats: [
      beat("opening", "The first failure is annoying. The second is a pattern", "By the third failure, the kitchen stops swearing in sentences and starts swearing in weather systems.", "tasha", "Chef Renata says the next decision is whether Feast Haven protects standards or cosplays normal service until collapse.", [
        action("ke-open-triage", "Run a hard triage on what equipment matters most tonight and cut anything that depends on dead gear.", "The line hates losing range and loves not drowning.", [-2, 2, 4, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("ke-open-patch", "Shift stations and work around the failures one workaround at a time.", "Ingenious if coordinated, exhausting if the failures keep multiplying.", [0, 1, 2, { tasha: [1, 1], luis: [1, 1] }]),
        action("ke-open-frontwarn", "Alert the floor immediately that ticket times and menu availability are unstable.", "Operationally healthy, though the host stand immediately starts absorbing the screams.", [-1, 1, 3, { elena: [1, 1], devon: [1, 1], tasha: [1, 1] }]),
        action("ke-open-pretend", "Keep the full menu live and pray the remaining machines discover grit and patriotism.", "The machines do not care about patriotism.", [2, -2, -4, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("cooler", "One cooler is now reading warm enough to make Imani stare into the middle distance", "Food safety is no longer theoretical.", "priya", "Imani says this is where 'maybe okay' becomes a very expensive personality trait.", [
        action("ke-cooler-quarantine", "Quarantine questionable items immediately and rebuild the usable menu around what is still safe.", "It hurts inventory and protects the one thing you cannot comp back into existence.", [-3, 2, 4, { priya: [2, 3], tasha: [1, 2] }]),
        action("ke-cooler-transfer", "Move critical product aggressively into safe storage and document temperatures as you go.", "A sharp move if the team stays organized under pressure.", [-1, 1, 3, { priya: [2, 2], marcus: [1, 1] }]),
        action("ke-cooler-priority", "Use the highest-risk items first while carefully narrowing the rest of the menu.", "Operationally clever, ethically safe only if the reads are genuinely solid.", [1, 0, 1, { priya: [0, 1], tasha: [1, 1] }]),
        action("ke-cooler-hope", "Leave the cooler alone for now because opening and shuffling it will only make people panic.", "Correct: people will panic later, with more evidence.", [2, -3, -4, { priya: [-3, -4], tasha: [-2, -3] }])
      ]),
      beat("floor", "Guests are beginning to notice weird pacing and strange substitutions", "The dining room does not know the gear is dying. It only knows dinner is acting suspicious.", "elena", "Marisol says the truth has to arrive before the conspiracy theories do.", [
        action("ke-floor-honest", "Explain the reduced menu and timing pressure before tables feel blindsided by improvisation.", "Guests dislike bad news less than they dislike being lied to by garnish.", [-1, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("ke-floor-guided", "Steer tables confidently toward the safest strongest surviving dishes without overexplaining every failure.", "A good middle road if staff can all sing from the same hymn sheet.", [1, 1, 1, { elena: [1, 1], jake: [1, 1] }]),
        action("ke-floor-recovery", "Use comps and extras strategically where the equipment failures hit hardest.", "Hospitable and costly, but at least the damage is intentional.", [-2, 1, 1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("ke-floor-blame", "Tell tables a supplier issue is causing the weirdness instead of admitting internal breakdowns.", "A lie with exactly the kind of legs that ends up shaking hands with tomorrow.", [1, -2, -4, { elena: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("repair", "A repair tech can maybe come, but only if you decide now which failure matters most", "You cannot save everything, so now priorities become policy.", "marcus", "Omar says the team will remember whether leadership saved revenue, safety, or sanity first.", [
        action("ke-repair-safety", "Prioritize the cooler and food safety systems above all else.", "It may not sell the most tonight, but it protects the entire week from becoming regret stew.", [-2, 2, 4, { marcus: [2, 2], priya: [2, 2], tasha: [1, 1] }]),
        action("ke-repair-throughput", "Prioritize the equipment that restores the highest dinner throughput fastest.", "Commercially logical and a little morally spicy if the safety problem is merely 'managed.'", [2, 0, 0, { marcus: [0, 1], tasha: [1, 1] }]),
        action("ke-repair-balance", "Ask the tech for the fastest stabilizing patch now and book the deeper fix immediately after service.", "A pragmatic split if you trust your short-term controls not to slip.", [1, 1, 1, { marcus: [1, 1], priya: [1, 1] }]),
        action("ke-repair-wait", "Delay repairs until morning so you are not making stressed decisions in a rush.", "Morning loves decisions that night should have made better.", [1, -2, -4, { marcus: [-2, -3], tasha: [-1, -2], priya: [-1, -2] }])
      ]),
      beat("final", "The line survives, barely, and Feast Haven now needs a real resilience plan", "Tonight cannot just become folklore and scar tissue.", "devon", "Parker says the guest experience only feels magical when the operation underneath is boringly prepared.", [
        action("ke-final-maintenance", "Build a real preventive maintenance calendar with failure backups and menu contingencies.", "It is the opposite of sexy and the exact reason sexy nights keep happening.", [0, 2, 4, { devon: [1, 1], marcus: [2, 2], tasha: [2, 2] }]),
        action("ke-final-buffer", "Create a lean emergency menu and floor script for equipment-down nights.", "Smart and operationally honest, with less capital cost than pretending machines are immortal.", [0, 1, 3, { devon: [1, 1], elena: [1, 1], tasha: [1, 1] }]),
        action("ke-final-audit", "Run a full post-mortem with kitchen and floor before replacing anything impulsively.", "A useful pause, as long as it becomes action instead of therapy cosplay.", [-1, 2, 2, { marcus: [1, 2], tasha: [1, 1] }]),
        action("ke-final-luck", "Trust that tonight was a freak event and keep the budget pointed elsewhere.", "Luck is not a maintenance philosophy, though it does have a nice low monthly payment.", [2, -2, -4, { marcus: [-2, -3], tasha: [-2, -3], priya: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "rival-restaurant-spy",
    category: "Competitive Threat",
    pressure: "High",
    headline: "Someone inside Feast Haven may be quietly feeding information to a competitor across town",
    body:
      "Reservation patterns, menu changes, staffing gaps, and private event notes keep becoming suspiciously public two hours later.",
    beats: [
      beat("opening", "The rumor starts small and lands hard", "Now everyone is glancing at everyone else like the bread service is bugged.", "marcus", "Omar says nothing destroys trust faster than a leak hunt with no discipline.", [
        action("rs-open-discreet", "Treat it as a serious operational concern, but limit the suspicion circle until you have facts.", "You keep the room from turning into amateur counterintelligence karaoke.", [0, 2, 3, { marcus: [2, 2], devon: [1, 1] }]),
        action("rs-open-access", "Quietly narrow who can see sensitive updates while you test where the leak could be coming from.", "A smart containment move that signals seriousness without declaring war.", [1, 1, 2, { marcus: [1, 2], elena: [1, 1] }]),
        action("rs-open-watch", "Do nothing public and simply start observing patterns for a day or two.", "Measured, though it also gives the rival more room if your read is correct.", [1, 0, 1, { marcus: [1, 1], elena: [0, 1] }]),
        action("rs-open-accuse", "Call an immediate all-staff confrontation and demand the spy identify themselves.", "There are certainly faster ways to teach a team not to trust you, but not many.", [1, -3, -4, { marcus: [-3, -4], nina: [-2, -2], tasha: [-2, -2] }])
      ]),
      beat("bait", "Marisol suggests planting a harmless fake detail to see whether it leaks", "It is elegant if controlled and ugly if it hits the wrong person.", "elena", "Marisol says a clean test beats a dirty accusation, but only if the collateral damage is near zero.", [
        action("rs-bait-safe", "Plant a low-stakes fake detail in a narrow channel and watch for it to surface externally.", "Disciplined, useful, and less cruel than turning staff into trap bait broadly.", [1, 2, 3, { elena: [2, 2], marcus: [1, 1] }]),
        action("rs-bait-split", "Use two different harmless fake details with two different groups to isolate the path faster.", "Sharp detective work, though the added complexity raises the chance of accidental confusion internally.", [1, 1, 2, { elena: [1, 2], marcus: [1, 1] }]),
        action("rs-bait-manual", "Skip bait and tighten all verbal communication protocols instead.", "Safer for culture, slower for truth.", [0, 1, 1, { elena: [1, 1], nina: [1, 1] }]),
        action("rs-bait-public", "Tell the staff you are planting fake details and whoever repeats them is done.", "A threat disguised as strategy usually succeeds at only one of those jobs.", [1, -2, -4, { elena: [-2, -3], marcus: [-2, -2] }])
      ]),
      beat("suspect", "A plausible suspect emerges, but the evidence is still circumstantial and messy", "The team could be right, wrong, or self-soothing with a convenient villain.", "devon", "Parker says certainty always feels better than truth right before it becomes a mistake.", [
        action("rs-suspect-private", "Have one private fact-finding conversation with the suspect and keep the tone investigative, not theatrical.", "You preserve dignity while testing whether the person helps clarify the gaps.", [0, 2, 2, { devon: [2, 2], marcus: [1, 1] }]),
        action("rs-suspect-audit", "Review access patterns, shift overlaps, and who actually benefits before speaking to anyone.", "Slower, colder, and much harder to regret.", [0, 1, 3, { marcus: [2, 2], devon: [1, 1] }]),
        action("rs-suspect-restrict", "Move the suspect temporarily off sensitive information while you investigate quietly.", "Protective and potentially fair, though they will absolutely feel the shadow of it.", [1, 1, 1, { devon: [1, 1], elena: [1, 1] }]),
        action("rs-suspect-example", "Make an example of the suspect fast to show the team leadership is not asleep.", "That works best in organizations that enjoy lawsuits and guilt.", [2, -3, -4, { devon: [-3, -4], marcus: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("rival", "Food Heaven seems to know exactly which private event you are short-staffed for", "Now the leak has real market impact.", "jake", "Adrian says the rival deserves a counterpunch. Omar says internal leaks are not fixed by external tantrums.", [
        action("rs-rival-harden", "Protect the vulnerable event operationally first and leave the rival reaction for later.", "It is less satisfying than revenge and much more helpful to the people paying you.", [0, 2, 3, { jake: [0, 1], marcus: [1, 1], devon: [1, 1] }]),
        action("rs-rival-misdirect", "Feed the competitor one more harmless decoy while quietly reinforcing your real weak spot.", "A sneaky move that works if the team stays coordinated.", [1, 1, 1, { jake: [1, 1], elena: [1, 1] }]),
        action("rs-rival-neutral", "Say nothing to the rival and make sure Feast Haven simply outperforms the hit.", "Proud, practical, and dependent on execution not slipping again.", [1, 0, 1, { jake: [1, 1], tasha: [1, 1] }]),
        action("rs-rival-fight", "Publicly call out the rival for spying and dare them to deny it.", "You might look bold. You will definitely look less in control of your own house.", [2, -2, -4, { jake: [1, 0], marcus: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The leak path becomes clearer, and now Feast Haven needs a long-term response", "Culture, access, trust, and consequences are all on the same plate now.", "nina", "Celia says the team needs to feel protected without feeling permanently watched.", [
        action("rs-final-guardrails", "Build tighter information guardrails, role-based access, and a fair investigation standard for future incidents.", "It protects the business without teaching the team to breathe through keyholes.", [0, 2, 4, { nina: [2, 2], marcus: [2, 2], elena: [1, 1] }]),
        action("rs-final-rebuild", "Pair the security changes with a direct trust rebuild conversation so the room does not just feel policed.", "Harder work, better payoff, and much less lazy than pure suspicion systems.", [-1, 2, 3, { nina: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("rs-final-liaisons", "Reduce leak risk by routing sensitive info through a small lead circle instead of everyone at once.", "Useful if the team trusts the lead circle not to become a tiny monarchy.", [1, 1, 1, { nina: [1, 1], marcus: [1, 1] }]),
        action("rs-final-lockdown", "Treat every internal detail like state secrets from now on and drastically limit transparency.", "You might stop leaks. You will definitely start a new kind of resentment economy.", [1, -2, -4, { nina: [-2, -3], marcus: [-2, -3], devon: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "celebrity-walk-in",
    category: "VIP Pressure",
    pressure: "Extreme",
    headline: "A celebrity walks in unannounced with a large group and expects immediate VIP treatment despite a packed room",
    body:
      "Three phones are already out, two bodyguards look bored, and the host stand just went from elegant to hostage negotiation with perfume.",
    beats: [
      beat("opening", "The celebrity group wants the room to bend", "Regular guests are watching to see whether status outranks fairness tonight.", "elena", "Marisol says the first answer sets the moral architecture of the whole dining room.", [
        action("cw-open-options", "Offer the celebrity group the best realistic options you can create without torching other booked guests.", "It is calm, fair-ish, and still glamorous enough to avoid instant offense.", [1, 2, 3, { elena: [2, 2], devon: [1, 1] }]),
        action("cw-open-private", "See whether a private or semi-private compromise can absorb the group with less room-wide fallout.", "Good if available, awkward if it feels like hiding a meteor behind a fern.", [1, 1, 2, { elena: [1, 2], marcus: [0, 1] }]),
        action("cw-open-stagger", "Split the party into two adjacent service tracks and treat it like a planned event that definitely was not planned.", "Operationally clever, socially delicate, and hard on pacing.", [2, 1, 0, { devon: [1, 1], elena: [0, 1] }]),
        action("cw-open-bump", "Immediately displace regular guests to create a throne zone worthy of fame.", "Fast, obvious, and exactly the kind of move people never forget in a good way.", [3, -3, -4, { elena: [-3, -4], nina: [-2, -2], devon: [-1, -1] }])
      ]),
      beat("staff", "Adrian wants to wow them; Celia is furious about what this says to reservations", "The team is deciding whether this is business, betrayal, or both.", "nina", "Celia says one celebrity cannot become a walking policy exception without cost.", [
        action("cw-staff-fair", "State one fairness boundary for the room while still asking the team to execute polished service.", "It gives the staff something moral to stand on while they do the hard work anyway.", [0, 2, 3, { nina: [2, 2], jake: [1, 1], elena: [1, 1] }]),
        action("cw-staff-hero", "Let Adrian lead the table experience while management protects everyone else from ripple damage.", "Smart if roles stay clean, messy if the celebrity orbit starts eating your floor.", [1, 1, 1, { jake: [2, 2], nina: [-1, -1] }]),
        action("cw-staff-compensate", "Quietly soften the impact on displaced or delayed guests before resentment hardens.", "Costly, fair, and often cheaper than the reputation bill.", [-2, 2, 2, { devon: [1, 1], marcus: [-1, -1], nina: [1, 1] }]),
        action("cw-staff-starstruck", "Tell the team to make this the only table that really matters tonight.", "A surprisingly efficient way to turn the whole restaurant into a lesson about status resentment.", [2, -2, -4, { nina: [-2, -3], jake: [1, 0], elena: [-2, -2] }])
      ]),
      beat("kitchen", "Chef Renata says the celebrity wants heavy menu flexibility and impossible timing", "The ask is not just VIP. It is custom chaos.", "tasha", "Chef Renata says the room can worship fame if it wants; the line still runs on physics.", [
        action("cw-kitchen-curate", "Offer a curated limited menu for the celebrity group and present it as bespoke restraint, not limitation.", "It protects the line while preserving the illusion that this was all thoughtful.", [1, 2, 3, { tasha: [2, 2], priya: [1, 1], luis: [1, 1] }]),
        action("cw-kitchen-frontload", "Prioritize the celebrity party's first wave, then snap back to normal queue discipline.", "A compromise that may work if the room does not feel the pause too sharply.", [2, 0, 1, { tasha: [1, 1], luis: [0, 1] }]),
        action("cw-kitchen-custom", "Accept a handful of customizations but cap them with visible manager control.", "Reasonable, though celebrity groups often multiply 'just one ask' like rabbits in sunglasses.", [1, 1, 1, { tasha: [0, 1], priya: [0, 1] }]),
        action("cw-kitchen-yes", "Promise the full fantasy menu experience because saying no to fame feels bad.", "Chef Renata would like a minute alone with your confidence.", [3, -2, -4, { tasha: [-3, -4], priya: [-2, -3], luis: [-1, -2] }])
      ]),
      beat("public", "The room is now filming both the celebrity and how Feast Haven handles the celebrity", "This is service and PR at the same time.", "jake", "Adrian says attention can become free marketing. Marisol says attention can also become a fairness trial.", [
        action("cw-public-balance", "Keep the room feeling included without turning the celebrity table into a public exhibit.", "Harder than it sounds, which is usually where the best management lives.", [0, 2, 3, { jake: [1, 1], elena: [2, 2] }]),
        action("cw-public-celebrate", "Lean into the buzz just enough to make the room feel lucky, not secondary.", "A delicate social trick that can absolutely work if nobody overplays it.", [2, 1, 0, { jake: [1, 1], devon: [1, 1] }]),
        action("cw-public-buffer", "Create visual and service buffers so other diners feel protected from the circus.", "Less glamorous, more humane, slightly colder on the celebrity side.", [0, 1, 2, { elena: [1, 2], devon: [1, 1] }]),
        action("cw-public-milk", "Exploit the moment aggressively for content because free reach is free reach.", "There is no quicker route from 'classy celebrity drop-in' to 'restaurant behaves like an intern.'", [3, -2, -4, { jake: [2, 1], elena: [-2, -3] }])
      ]),
      beat("final", "The celebrity's team hints they might come back if tonight feels special enough", "Now the question is whether recurring celebrity chaos is a strategy or a symptom.", "marcus", "Omar says prestige is nice until operations begin subsidizing ego every weekend.", [
        action("cw-final-terms", "Invite future VIP visits only through clear advance protocols that protect the room and staff.", "It is not dazzled, which is a very good sign in a manager.", [0, 2, 4, { marcus: [2, 2], elena: [2, 2], tasha: [1, 1] }]),
        action("cw-final-package", "Create a controlled premium walk-in package for rare high-profile disruptions.", "Strategic if kept rare, dangerous if the staff start reading it as celebrity tax season.", [1, 1, 1, { marcus: [1, 1], jake: [1, 1] }]),
        action("cw-final-favorites", "Keep it informal and handle future celebrity visits case by case with manager discretion.", "Flexible and likely to create inconsistency the second memory gets involved.", [1, 0, 1, { marcus: [0, 1], elena: [1, 1] }]),
        action("cw-final-brand", "Reorient part of Feast Haven around courting famous walk-ins because tonight proved the concept.", "Tonight proved fame exists. It did not prove your staff deserve this forever.", [3, -2, -4, { marcus: [-2, -3], elena: [-2, -2], tasha: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "kids-gone-wild-table",
    category: "Guest Conduct",
    pressure: "High",
    headline: "A table's kids are now sprinting, shrieking, and disrupting the dining room while the parents ignore almost all of it",
    body:
      "One child has discovered the host stand bell, another is under a neighboring table, and the parents are deep in a conversation about charter schools.",
    beats: [
      beat("opening", "The kids are no longer mildly energetic; they are a roving event", "Nearby tables are starting to look trapped instead of amused.", "elena", "Marisol says this has to be handled before the room decides Feast Haven is a daycare with stemware.", [
        action("kg-open-parent", "Approach the parents warmly but directly and ask for their help resetting the kids' behavior.", "It preserves adult dignity while making the responsibility impossible to ignore.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("kg-open-divert", "Offer quick activity sheets, kid snacks, and service pacing tricks to lower the chaos temperature.", "Helpful and kind, though it risks turning staff into unpaid enrichment coordinators.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("kg-open-stage", "Move the table subtly toward a less disruptive zone if one can be found fast.", "Operationally smart if available, socially tricky if it feels like exile.", [1, 1, 1, { elena: [1, 1], nina: [1, 0] }]),
        action("kg-open-ignore", "Wait a little longer because maybe the children will tire themselves out naturally.", "Children treat that logic like a challenge coin.", [1, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("safety", "One child nearly collides with Omar carrying glassware", "Now the issue is no longer just atmosphere. It is bluntly physical.", "marcus", "Omar says one accident will make everybody suddenly remember the last twenty minutes very clearly.", [
        action("kg-safety-stop", "Draw a clear safety boundary immediately and explain that running service lanes cannot continue.", "It is the kind of line that should have existed ten minutes ago and still matters now.", [0, 2, 3, { marcus: [2, 2], elena: [1, 1] }]),
        action("kg-safety-helper", "Assign one staffer briefly to help steer traffic while the parents get organized.", "Protective in the moment, dangerous as a precedent if it becomes your job to parent strangers.", [-1, 1, 1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("kg-safety-box", "Bring the kids' food or dessert faster so the table has a stronger anchor to sit them down.", "Sometimes practical, sometimes sugar-powered miscalculation.", [1, 0, 1, { jake: [1, 1], marcus: [0, 1] }]),
        action("kg-safety-snap", "Use a sharp public tone because safety is now too urgent for softness.", "Urgency is fair. Public embarrassment still detonates in dining rooms.", [1, -2, -4, { marcus: [-2, -3], elena: [-2, -2] }])
      ]),
      beat("room", "Other guests are beginning to comment and compare your response to 'real restaurants'", "Now your decision is part parenting issue, part brand issue.", "nina", "Celia says the room needs to see standards without seeing cruelty.", [
        action("kg-room-visible", "Let nearby tables see that management has acted, then protect their experience quietly from there.", "People mostly want reassurance that someone is steering the ship.", [0, 2, 2, { nina: [1, 2], elena: [1, 1] }]),
        action("kg-room-gift", "Soften the nearby tables with small gestures while you stabilize the family situation.", "Costly, kind, and probably worth less than the boundary itself if used alone.", [-1, 1, 1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("kg-room-move", "Offer to move especially affected neighboring tables if they prefer distance.", "Supportive, though it can feel like the wrong people are being displaced.", [-2, 1, 1, { elena: [1, 1], nina: [1, 1] }]),
        action("kg-room-joke", "Play it off with a family-friendly joke about 'future line cooks in training.'", "One parent may smile. The trapped anniversary table absolutely will not.", [1, -1, -3, { nina: [-2, -2], elena: [-1, -1] }])
      ]),
      beat("parents", "The parents insist the kids are 'just expressive' and say other guests should relax", "Now the real conflict has finally introduced itself.", "devon", "Parker says this is where warmth without firmness becomes cowardice in a nice blazer.", [
        action("kg-parents-firm", "Stay warm, stay calm, and make the standard non-negotiable regardless of parenting philosophy.", "You stop debating child psychology and start managing the room you actually run.", [0, 2, 3, { devon: [2, 2], elena: [1, 1] }]),
        action("kg-parents-options", "Offer the family practical choices: settle the table, step outside briefly, or shift to a calmer service path.", "Choice architecture works surprisingly well when the current option is embarrassment.", [0, 1, 2, { devon: [1, 2], elena: [1, 1] }]),
        action("kg-parents-empathy", "Acknowledge parenting stress first, then redirect to the impact on the room.", "A humane way to lower their defensiveness before the boundary lands.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("kg-parents-escalate", "Tell them bluntly that if they cannot control the kids they may need to leave now.", "Sometimes true, often combustible when it is step one instead of step four.", [1, -2, -4, { devon: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The family settles down, leaves, or both, and now the policy question remains", "Feast Haven cannot redesign childhood, but it can decide how it handles dining room chaos next time.", "marcus", "Omar says support staff deserve a policy that protects both safety and their sanity.", [
        action("kg-final-guideline", "Build a child conduct and safety response guideline that protects the room without sounding anti-family.", "This is how you become predictable in a good way.", [0, 2, 4, { marcus: [2, 2], elena: [2, 2], devon: [1, 1] }]),
        action("kg-final-toolkit", "Create a small family hospitality toolkit so staff have non-chaotic first responses before conflict begins.", "Practical and kind, especially when paired with real boundaries.", [0, 1, 3, { devon: [1, 2], nina: [1, 1] }]),
        action("kg-final-zones", "Experiment with seating families more intentionally during peak hours without making it feel punitive.", "Operationally useful and socially delicate.", [1, 1, 1, { elena: [1, 1], marcus: [1, 1] }]),
        action("kg-final-ban", "Quietly decide Feast Haven should discourage families with young kids during busy nights.", "That is a policy, yes. It is also a reputation boomerang dressed as operational wisdom.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2], devon: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "everything-sold-out-disaster",
    category: "Supply Failure",
    pressure: "Extreme",
    headline: "A supplier issue means Feast Haven is out of multiple key menu items right in the middle of peak service",
    body:
      "No salmon, no brioche, no key dessert garnish, and the printer is still enthusiastically trying to sell all of them to the room.",
    beats: [
      beat("opening", "The menu is lying faster than the staff can update it", "Guests are ordering into a disappearing reality.", "elena", "Marisol says the first move is to stop new disappointments before fixing the old ones.", [
        action("sd-open-freeze", "Freeze all affected menu language immediately and brief every front-facing person with one clean update.", "Boring excellence arrives right on time for once.", [-1, 2, 4, { elena: [2, 2], nina: [1, 1], devon: [1, 1] }]),
        action("sd-open-sellaround", "Have the floor aggressively steer guests toward strong substitutes before they notice the holes.", "Effective if done skillfully, annoying if guests feel managed instead of informed.", [1, 1, 1, { jake: [1, 1], nina: [1, 1] }]),
        action("sd-open-hostwarn", "Warn incoming parties at the door while letting seated tables learn during ordering.", "Useful for new guests, rough for already-seated people who discover the truth late.", [0, 1, 2, { elena: [1, 2], devon: [0, 1] }]),
        action("sd-open-hide", "Keep the menu live and just explain item-by-item when the disappointment happens.", "Congratulations on choosing serial letdowns as a service model.", [2, -2, -4, { elena: [-2, -3], nina: [-2, -2] }])
      ]),
      beat("kitchen", "Chef Renata can rework some dishes, but not all of them, and not without consequences", "The line can pivot. It cannot pretend physics did not happen in receiving.", "tasha", "Chef Renata says improvisation is expensive when it is multiplied by sixty tickets.", [
        action("sd-kitchen-tight", "Authorize a sharply edited temporary menu the kitchen can execute confidently with what remains.", "It hurts variety and protects the line from becoming a rumor mill with sauté pans.", [-2, 2, 4, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("sd-kitchen-rebuild", "Rebuild a few star dishes around substitute ingredients and train the floor fast.", "Strong if the subs are honest strengths, dangerous if they are grief with garnish.", [1, 1, 1, { tasha: [1, 1], nina: [1, 1] }]),
        action("sd-kitchen-premium", "Push the remaining premium inventory harder and let scarcity create urgency.", "Profitable in bursts, awkward if the room senses the squeeze play.", [2, 0, 0, { marcus: [0, 1], tasha: [-1, -1] }]),
        action("sd-kitchen-franken", "Tell the kitchen to 'make it work' however needed and keep the full shape of the menu alive.", "A beautiful slogan for people who do not have to plate the consequences.", [2, -2, -4, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("guests", "Several tables are now reacting differently: some are understanding, some feel bait-and-switched", "This is now a trust problem as much as a food problem.", "nina", "Celia says the room can forgive shortage faster than it forgives surprise shortage.", [
        action("sd-guests-plain", "Tell affected tables early, plainly, and with strong alternatives already ready to suggest.", "Guests dislike missing items less when they can feel you respected their time.", [0, 2, 3, { nina: [2, 2], devon: [1, 1] }]),
        action("sd-guests-curate", "Have the servers recommend substitute journeys as if they were deliberate nightly features.", "It can feel polished, though some guests will still resent the costume on the shortage.", [1, 1, 1, { nina: [1, 1], jake: [1, 1] }]),
        action("sd-guests-soften", "Use selective comp touches where the sold-out item was clearly the main draw.", "Fair and expensive, but cheaper than full-blown betrayal energy.", [-2, 1, 1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("sd-guests-deflect", "Blame the supplier loudly and repeatedly so guests know it is not your fault.", "True-ish, childish-sounding, and not nearly as reassuring as you hope.", [1, -1, -3, { nina: [-1, -2], marcus: [-1, -1] }])
      ]),
      beat("staff", "The floor is getting snippy because nobody enjoys apologizing for inventory they never controlled", "Resentment is rising sideways now.", "devon", "Parker says staff need relief and coherence or they will start emotionally refunding themselves.", [
        action("sd-staff-reset", "Give the staff one reset huddle with the updated menu path and permission to stop overselling what's gone.", "Clarity is not glamorous and still feels like oxygen in a rush.", [0, 2, 2, { devon: [2, 2], nina: [1, 1], elena: [1, 1] }]),
        action("sd-staff-triage", "Assign your strongest communicators to the most affected sections and protect the weakest from the worst tables.", "A smart tactical use of people, if your strongest do not burn out instantly.", [1, 1, 1, { devon: [1, 1], jake: [1, 1] }]),
        action("sd-staff-reward", "Promise a post-shift meal or bonus gesture if the team pushes through the shortage cleanly.", "Helpful morale glue, though it does not solve live confusion on its own.", [-1, 1, 1, { devon: [1, 2], marcus: [-1, -1] }]),
        action("sd-staff-pressure", "Tell the team to stop complaining and sell harder because revenue still matters.", "True and astonishingly unhelpful, which is a difficult combo to pull off.", [2, -2, -4, { devon: [-3, -4], nina: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("final", "Peak service ends and Feast Haven now needs a shortage playbook, not just a survivor story", "Tonight cannot remain a one-off excuse.", "marcus", "Omar says shortages become culture problems when leadership treats them like weather instead of systems.", [
        action("sd-final-playbook", "Build a shortage protocol covering menu freezes, guest scripts, substitute tiers, and inventory escalation.", "It is exactly the kind of preparation that makes future chaos look boring.", [0, 2, 4, { marcus: [2, 2], elena: [2, 2], tasha: [1, 1] }]),
        action("sd-final-buffer", "Create inventory buffers for truly critical items and clearer supplier-warning thresholds.", "Operationally smart, if the budget can tolerate looking wiser tomorrow than today.", [-1, 1, 3, { marcus: [2, 2], tasha: [1, 1] }]),
        action("sd-final-liveboard", "Add a live sold-out board visible to staff and maybe even to guests in limited form.", "Potentially elegant if maintained, potentially embarrassing if it feels like a scoreboard of failure.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("sd-final-upcharge", "Use future shortages to push remaining premium items harder so at least the pain pays.", "Pain does often pay. Usually in reputation first.", [2, -2, -4, { marcus: [-2, -3], nina: [-2, -2], tasha: [-1, -1] }])
      ])
    ]
  })
];

module.exports = FEAST_HAVEN_EVENTS;
