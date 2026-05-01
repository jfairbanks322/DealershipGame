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
    id: "drive-thru-line-from-hell",
    category: "Traffic Crisis",
    pressure: "Extreme",
    headline: "Your drive-thru line is wrapped around the building, into the street, and everybody thinks their chicken sandwich is a constitutional right",
    body: "Cars are blocking traffic, horns are starting to sing, and the city suddenly cares very deeply about your lunch rush.",
    beats: [
      beat("opening", "The line is backing into real traffic", "The problem is now bigger than customer patience.", "elena", "Marisol says the first move has to reduce street chaos, not just soothe one angry car.", [
        action("dt-open-flow", "Assign one staffer to direct lane flow and move overflow cars toward a temporary staging pattern while service keeps moving.", "You protect safety first and buy the kitchen a little breathing room.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("dt-open-app", "Push guests toward mobile pickup messaging and hope the line thins without a hard intervention.", "It helps some, but not enough to solve the street problem quickly.", [1, 1, 1, { elena: [1, 1], nina: [1, 1] }]),
        action("dt-open-warn", "Tell the team to move faster and trust the line will shrink if service gets more urgent.", "Speed matters, but street geometry does not care about pep talks.", [1, 0, 1, { devon: [1, 0], tasha: [-1, -1] }]),
        action("dt-open-ignore", "Let the line stay put and assume traffic complaints are outside the restaurant’s problem.", "It is technically one position a person can have.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("orders", "Cars are now waiting so long that several customers forgot what they wanted", "Delay is starting to mutate into confusion.", "devon", "Parker says the next win is shortening decision time, not pretending the menu got simpler.", [
        action("dt-orders-simplify", "Offer a temporary fast-lane menu with your most reliable items so the queue moves with fewer custom tangles.", "You sacrifice some variety and regain control of time.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1] }]),
        action("dt-orders-doublecheck", "Keep the full menu, but require order confirmation before cars reach payment.", "Better accuracy, though the pace still drags.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("dt-orders-upsell", "Tell staff to keep normal upsell habits so average ticket size offsets the jam.", "Financially understandable, operationally risky.", [1, 1, 0, { marcus: [1, 1], devon: [0, 1] }]),
        action("dt-orders-freestyle", "Let each headset worker improvise their own solution to keep cars moving.", "That is one way to create six different drive-thrus in one building.", [2, -2, -4, { devon: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("window", "By the payment window, customers are already angry before bags appear", "The team needs a recovery tone, not just functioning fryers.", "nina", "Celia says guests will forgive waiting faster than they forgive feeling dismissed while waiting.", [
        action("dt-window-script", "Give the window crew one short apology-and-clarity script plus honest wait expectations.", "The tone gets steadier and fewer cars escalate into full drama.", [0, 2, 3, { nina: [2, 2], jake: [1, 1] }]),
        action("dt-window-token", "Offer a small return coupon to the worst waits while keeping the line emotionally cooler.", "Helpful, though it trains some guests to see delay as negotiation space.", [-1, 1, 2, { nina: [1, 1], marcus: [1, 1] }]),
        action("dt-window-update", "Have runners update cars stuck near the turn with brief status checks and no promises.", "Human contact helps, even if it does not create fries faster.", [0, 1, 2, { jake: [1, 1], devon: [1, 1] }]),
        action("dt-window-tough", "Tell staff to stop apologizing and focus on speed because feelings are slowing the line down.", "Morale and customer patience would both like a word.", [2, -2, -4, { nina: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("city", "Someone says they already called the police about the traffic mess", "Now public optics and compliance are joining lunch.", "marcus", "Omar says if outside pressure is coming anyway, the restaurant should look organized before it looks defensive.", [
        action("dt-city-document", "Document the traffic mitigation steps, keep one manager free for outside communication, and keep the lane plan visible.", "That gives you facts instead of panic if officials show up.", [0, 2, 4, { marcus: [2, 2], elena: [1, 1] }]),
        action("dt-city-cones", "Create a more formal temporary cone pattern and redirect arriving cars before they trap the street.", "Smart if the team can actually maintain it under pressure.", [0, 1, 3, { devon: [1, 2], elena: [1, 1] }]),
        action("dt-city-close-lobby", "Shift staff from the lobby to the lane and accept a rougher in-store experience for a while.", "It might be the right trade, but it hurts a different set of guests immediately.", [1, 1, 1, { devon: [1, 1], nina: [-1, -1] }]),
        action("dt-city-deny", "Argue that off-property traffic is not your responsibility and refuse to adjust the pattern.", "An impressively brittle hill to choose.", [2, -2, -4, { marcus: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The rush finally starts easing, but this cannot become tomorrow’s tradition", "Now you need a lasting fix instead of post-rush amnesia.", "tasha", "Chef Renata says the best ending is a cleaner system, not a heroic story told three times.", [
        action("dt-final-plan", "Build a peak-rush drive-thru overflow plan with a reduced menu, traffic pattern, and dedicated outside role.", "You just turned a recurring nightmare into a repeatable playbook.", [0, 2, 4, { tasha: [2, 2], devon: [1, 1], elena: [1, 1] }]),
        action("dt-final-staffing", "Add one peak-hour lane support shift even if payroll takes a hit, because the current chaos costs more.", "A little expensive and very sane.", [-1, 2, 3, { marcus: [1, 1], devon: [2, 1] }]),
        action("dt-final-signage", "Install clearer pre-menu signage so guests decide earlier and hesitate less in the lane.", "Not a full cure, but a meaningful friction reducer.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("dt-final-hope", "Keep everything basically the same and trust the team to hustle harder next time.", "A management classic for people who enjoy repeats.", [2, -2, -4, { tasha: [-2, -3], devon: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "wrong-order-domino-effect",
    category: "Accuracy Breakdown",
    pressure: "Extreme",
    headline: "One wrong order has triggered a chain reaction of wrong bags, wrong drinks, and multiple customers who now believe your whole building is guessing",
    body: "The bags are out, the receipts are useless, and every correction seems to create one more victim.",
    beats: [
      beat("opening", "You realize this is not one bad handoff but several", "The line is still moving, which is both impressive and terrifying.", "devon", "Parker says the first decision is whether to pause the bleed or keep guessing under pressure.", [
        action("wo-open-pause", "Pause the lane for a fast reset, match bags to tickets, and stop the error chain before it grows.", "You lose a little speed and save a lot of future anger.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1] }]),
        action("wo-open-runners", "Add one runner to verify bag names and contents while the lane keeps moving more carefully.", "Helpful if the team stays disciplined, but still vulnerable to momentum mistakes.", [0, 1, 2, { jake: [1, 1], devon: [1, 1] }]),
        action("wo-open-apology", "Keep the line moving and handle corrections only as complaints reach the window.", "It reduces immediate interruption, but the dominoes keep falling farther down the line.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("wo-open-blame", "Call out the likely staff mistake over headset so everyone knows who caused this.", "Accuracy does not improve when panic picks a villain.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("customers", "Three cars now insist their orders were also wrong", "Some are right. Some are guessing. All are annoyed.", "nina", "Celia says the team needs a recovery policy that feels fair and fast, not random and apologetic.", [
        action("wo-customers-triage", "Triage claims by checking receipts and obvious mismatches, then fix the most certain errors first.", "Not everyone loves waiting for proof, but the response looks grounded instead of frantic.", [0, 2, 3, { nina: [2, 2], marcus: [1, 1] }]),
        action("wo-customers-replace", "Replace questioned items generously for the next few cars to restore goodwill quickly.", "It cools tempers, though it invites a few opportunists into the confusion.", [-1, 1, 2, { nina: [1, 1], marcus: [0, 1] }]),
        action("wo-customers-lane", "Direct wrong-order claims into a separate short correction pull-off lane so the main line can keep moving.", "Operationally strong if the parking lot can handle it.", [1, 1, 1, { devon: [1, 1], elena: [1, 1] }]),
        action("wo-customers-hardline", "Assume most claims are exaggerated and challenge customers before replacing anything.", "A bold way to turn a mistake into a feud.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("systems", "The team cannot tell whether the root problem was headset input, bag labeling, or handoff chaos", "Without a root cause, every fix is partly theater.", "marcus", "Omar says tonight needs a usable explanation, not a comforting one.", [
        action("wo-systems-audit", "Run a fast root-cause audit between rush bursts and pick one temporary verification point to stabilize the line.", "That is how you stop solving three possible problems badly at once.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1] }]),
        action("wo-systems-tags", "Tag every bag with car position and order initials until the rush settles.", "It slows the line slightly and clears the fog meaningfully.", [0, 1, 3, { marcus: [1, 2], jake: [1, 1] }]),
        action("wo-systems-twoeyes", "Require a second set of eyes only on large or complex orders so the line is not crushed completely.", "Reasonable, though it leaves the easy-looking mistakes free to keep lying.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("wo-systems-guess", "Let each station fix the issue however they think makes sense.", "And now the chaos has branches.", [2, -2, -4, { marcus: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("crew", "Staff are starting to get snappy with each other on headset", "Accuracy and morale are now tugging in opposite directions.", "elena", "Marisol says a sharp team can still recover. A fighting team usually invents new problems first.", [
        action("wo-crew-reset", "Do a 30-second reset: one corrective tone, one lane plan, no blame language, and one escalation person.", "The emotional temperature drops just enough for the thinking to come back.", [0, 2, 4, { elena: [2, 2], devon: [1, 1], jake: [1, 1] }]),
        action("wo-crew-shift", "Move one calmer worker into the handoff point and one rattled worker into a simpler station.", "Useful, though it solves more symptom than system.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("wo-crew-reward", "Promise the team a small post-rush treat if they keep the lane from falling apart.", "Motivating for some, a little flimsy for others.", [1, 1, 1, { jake: [1, 1], marcus: [0, 1] }]),
        action("wo-crew-pressure", "Remind the crew that mistakes are unacceptable and everyone should feel the urgency right now.", "They do feel something, yes.", [2, -2, -4, { elena: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("final", "The line stabilizes, but confidence took a hit", "Now you decide whether this becomes a one-off mess or a fixable pattern.", "tasha", "Chef Renata says recovery ends when the next rush goes better, not when tonight stops yelling.", [
        action("wo-final-protocol", "Create a wrong-order cascade protocol with a reset threshold, correction lane, and verification owner.", "That is the difference between embarrassment and learning.", [0, 2, 4, { tasha: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("wo-final-drill", "Run a brief crew drill on bag verification and headset handoff before the next busy shift.", "Slightly annoying, very useful.", [-1, 2, 3, { devon: [2, 1], jake: [1, 1] }]),
        action("wo-final-tech", "Review whether labeling or POS shortcuts are adding risk before spending more on new tools.", "Careful and sensible, though not instantly satisfying.", [0, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("wo-final-writeup", "Write up the likely person who started the chain and move on.", "A clean answer if your goal is a dirty culture.", [2, -2, -4, { tasha: [-2, -2], devon: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "mobile-order-flood",
    category: "Digital Overload",
    pressure: "Extreme",
    headline: "A sudden surge of mobile orders has buried the kitchen while in-store guests are starting to feel like background extras in their own lunch",
    body: "The app is humming, the lobby is glaring, and the team is about to learn what split-demand resentment feels like.",
    beats: [
      beat("opening", "The app queue explodes faster than the lobby can understand", "Digital demand and visible demand are now in a custody battle.", "devon", "Parker says the first call is whether you balance channels or chase the invisible queue.", [
        action("mo-open-balance", "Set a controlled production ratio so app, drive-thru, and counter orders all keep moving instead of one lane eating the building.", "Nobody gets perfection, but the whole system stays alive.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1] }]),
        action("mo-open-app-priority", "Prioritize app timing because those customers already paid and expect precision.", "Defensible, though your visible guests can feel demoted fast.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("mo-open-lobby-protect", "Protect lobby pacing first so the room in front of you does not sour visibly.", "Emotionally smart, but the app backlog can become its own public disaster.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("mo-open-hustle", "Tell the team to just work harder and try not to think about where the orders came from.", "A deeply spiritual operations plan.", [2, -2, -4, { devon: [-2, -3], tasha: [-1, -2] }])
      ]),
      beat("guests", "Counter customers start asking why people with phones seem to matter more than people with faces", "Fairness is becoming visible.", "elena", "Marisol says the room needs language that sounds deliberate instead of defensive.", [
        action("mo-guests-honest", "Explain that the restaurant is balancing prepaid digital orders with live service and adjusting pacing across both.", "Specific enough to sound fair, calm enough not to inflame it.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("mo-guests-board", "Post temporary wait guidance for each order channel so guests see the strain as a system, not favoritism.", "Useful, though it can scare people if the numbers look brutal.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("mo-guests-perk", "Offer a small lobby-only courtesy item to soften the feeling of being ignored.", "That helps the mood, though it adds more work to the same strained system.", [-1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("mo-guests-dismiss", "Tell guests the app is simply part of modern business and they need to be patient.", "True in theory, flammable in practice.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("kitchen", "The line wants permission to cut customizations and simplify production", "Speed is whispering dangerous things into quality’s ear.", "tasha", "Chef Renata says simplification is only useful if it stays honest to what guests think they bought.", [
        action("mo-kitchen-limited", "Temporarily limit the most disruptive customizations and communicate the change clearly across all channels.", "That buys capacity without hiding the rules from guests.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("mo-kitchen-batch", "Batch your safest high-volume items first so the queue starts shrinking somewhere.", "Good triage, though edge orders feel the pain more sharply.", [1, 1, 1, { tasha: [1, 1], luis: [1, 1] }]),
        action("mo-kitchen-fastlane", "Create a rapid lane for simple app items while the rest of the line handles the harder mess.", "Smart if the order mix supports it.", [0, 1, 2, { priya: [1, 1], luis: [1, 1] }]),
        action("mo-kitchen-swap", "Quietly substitute similar ingredients on complex mobile orders so the kitchen can catch up.", "A bold interpretation of consent.", [2, -2, -4, { tasha: [-2, -3], priya: [-1, -2] }])
      ]),
      beat("systems", "Now you need to decide whether to throttle the digital channel itself", "Protecting demand can still destroy service if timing lies too loudly.", "marcus", "Omar says strong systems sometimes mean saying 'not right now' to money.", [
        action("mo-systems-throttle", "Throttle mobile availability or quote longer pickup times so the app stops feeding a lie into the kitchen.", "A little painful and extremely grown-up.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1] }]),
        action("mo-systems-window", "Temporarily pause only the heaviest menu items on the app while keeping simpler orders open.", "A more surgical version of honesty.", [0, 1, 3, { marcus: [1, 2], tasha: [1, 1] }]),
        action("mo-systems-hide", "Leave app promises unchanged but warn pickup guests individually as they arrive.", "It looks flexible and acts expensive.", [1, 1, 1, { devon: [0, 1], nina: [1, 1] }]),
        action("mo-systems-fullsend", "Keep the app fully open because turning away demand would feel like weakness.", "Revenue loves this for about twelve minutes.", [2, -2, -4, { marcus: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("final", "The flood slows, but the weak points are now obvious", "The last move decides whether the next spike looks familiar or avoidable.", "nina", "Celia says the building needs a digital-rush plan, not a motivational speech about adaptability.", [
        action("mo-final-playbook", "Build a mobile surge playbook with throttles, channel ratios, and simplified menu triggers.", "Now the next flood has somewhere to go besides your team’s bloodstream.", [0, 2, 4, { nina: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("mo-final-training", "Train managers on when to slow digital intake before lobby resentment becomes visible.", "Quietly excellent leadership work.", [-1, 2, 3, { marcus: [2, 1], elena: [1, 1] }]),
        action("mo-final-layout", "Rework pickup flow and lobby signage so digital guests stop colliding physically with everyone else.", "Not as dramatic, very helpful.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("mo-final-memory", "Trust that everyone learned enough from the stress and leave the system alone.", "The stress learned something too.", [2, -2, -4, { nina: [-2, -3], devon: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "register-goes-down",
    category: "POS Crash",
    pressure: "Extreme",
    headline: "Your main register system crashes mid-rush, and now the line is growing while the building rediscovers pencils, panic, and the concept of math",
    body: "Receipts are gone, card flow is weird, and every second the line waits is creating a new amateur accountant.",
    beats: [
      beat("opening", "The register freezes and does not come back", "The queue is still arriving as if nothing happened.", "marcus", "Omar says the first move is choosing a slower real process over a faster imaginary one.", [
        action("rg-open-manual", "Switch to a clean manual fallback for the simplest items and designate one person to track every order and payment.", "You trade elegance for survival and keep the truth intact.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1] }]),
        action("rg-open-card", "Use a mobile backup payment option for cards and keep cash logging separate.", "Useful if the signal and discipline both hold.", [1, 1, 1, { marcus: [1, 1], jake: [1, 1] }]),
        action("rg-open-pause", "Pause new orders briefly while the team sets up the fallback flow cleanly.", "Painful up front, steadier five minutes later.", [-1, 2, 3, { devon: [1, 2], elena: [1, 1] }]),
        action("rg-open-memory", "Take orders from memory and sort the totals out later once the rush passes.", "A romantic idea if your love language is loss.", [2, -2, -4, { marcus: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("line", "Customers can see things are broken and are already asking if they should leave", "Now speed and trust are both on the clock.", "elena", "Marisol says guests will usually stay for a problem if the process looks more competent than unlucky.", [
        action("rg-line-clear", "Tell guests exactly what is down, what still works, and what the realistic wait tradeoff is.", "Clear bad news beats mysterious bad news almost every time.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("rg-line-short", "Offer a smaller temporary menu so manual ordering and price recall stay manageable.", "A little disappointing, a lot more stable.", [0, 1, 3, { elena: [1, 2], tasha: [1, 1] }]),
        action("rg-line-guided", "Have a greeter warn arriving guests before they fully commit to the line.", "Excellent expectation setting, though some revenue walks away on purpose.", [-1, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("rg-line-spin", "Insist it is just a minor glitch and keep everyone queued with no real update.", "Hope is not a POS system.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("crew", "Staff are split between taking orders, running food, and improvising payment logic", "The building is about to create five new unofficial policies.", "devon", "Parker says role clarity now matters more than hustle energy.", [
        action("rg-crew-roles", "Hard-assign roles for manual orders, payment, expo, and line communication so nobody freelances the crisis.", "Structure calms the room faster than speed alone.", [0, 2, 4, { devon: [2, 2], jake: [1, 1], nina: [1, 1] }]),
        action("rg-crew-veterans", "Put the most experienced crew on taking and reconciling orders while newer staff handle simpler movement tasks.", "A good triage move, though it stacks strain unevenly.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("rg-crew-sheet", "Write a quick price cheat sheet for top items and let the line keep moving off that.", "Useful and a little fragile, but better than memory roulette.", [1, 1, 1, { marcus: [1, 1], jake: [0, 1] }]),
        action("rg-crew-pressure", "Tell everyone to just stay calm and figure it out together as they go.", "Cooperative chaos is still chaos.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("money", "You now have to decide how strict to be on missing items, uncertain totals, and payment disputes", "A broken system is suddenly a character test.", "nina", "Celia says fairness should feel intentional, not desperate or stingy.", [
        action("rg-money-floor", "Use a simple fairness floor: when the team cannot verify perfectly, default slightly in the guest’s favor but document it.", "It protects trust without turning the room into a giveaway festival.", [0, 2, 3, { nina: [2, 2], marcus: [1, 1] }]),
        action("rg-money-tight", "Require confirmation for every disputed total, even if it slows the line more.", "Safer for margin, rougher for momentum.", [1, 1, 1, { marcus: [1, 1], nina: [0, 1] }]),
        action("rg-money-bucket", "Offer a flat inconvenience discount on affected orders to simplify decisions.", "Clean and kind, though it costs more broadly than the mistakes probably deserve.", [-1, 1, 2, { nina: [1, 1], marcus: [0, 1] }]),
        action("rg-money-hard", "Assume the guests are wrong unless they can prove otherwise.", "That is one philosophy a line can experience.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The register finally restarts, but the rush has already told you what broke culturally", "Now you decide whether tonight becomes a story or a better system.", "tasha", "Chef Renata says recovery means the next failure is less dramatic, not more inspirational.", [
        action("rg-final-fallback", "Build a real register-outage fallback kit with simplified pricing, role cards, and manual ticket controls.", "Now the next crash meets a plan instead of improvisation.", [0, 2, 4, { tasha: [2, 2], marcus: [1, 1], devon: [1, 1] }]),
        action("rg-final-drill", "Practice one short no-register drill before a busy shift so the team can switch modes cleanly.", "Not glamorous. Very effective.", [-1, 2, 3, { devon: [2, 1], marcus: [1, 1] }]),
        action("rg-final-backup", "Invest in stronger backup payment and manual print tools before the next peak period.", "A sensible systems answer if budget allows.", [0, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("rg-final-shrug", "Treat the crash as a freak event and avoid overbuilding around it.", "Which is exactly how freak events become habits.", [2, -2, -4, { tasha: [-2, -2], marcus: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "staff-no-show",
    category: "Staffing Breakdown",
    pressure: "Extreme",
    headline: "Two employees do not show up during peak hours, and your carefully planned shift now looks like a prank played on tomorrow’s morale",
    body: "The building is short-handed, the rush is not sympathetic, and every task suddenly has to count twice.",
    beats: [
      beat("opening", "You are missing two people and the lunch wave is already here", "This is no longer a staffing issue. It is a triage problem wearing an apron.", "devon", "Parker says the first move is narrowing the mission before the building pretends it can still do everything.", [
        action("sn-open-triage", "Cut nonessential tasks immediately and rebuild the shift around only the services the team can deliver cleanly.", "You lose some polish and keep the core operation alive.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1] }]),
        action("sn-open-callins", "Start calling backups while the current team holds the line with a temporary reduced flow.", "Helpful if someone answers, stressful if nobody does.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("sn-open-leaders", "Pull managers and strongest cross-trained staff into active production right away.", "Smart and necessary, though it leaves fewer eyes for the bigger picture.", [1, 1, 1, { devon: [1, 1], elena: [0, 1] }]),
        action("sn-open-hide", "Pretend nothing changed and ask everyone to move faster so guests do not notice.", "Guests will notice. Staff will too.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("service", "The team is deciding what should fall first: speed, cleanliness, hospitality, or complexity", "You cannot protect every metric at once.", "tasha", "Chef Renata says the wrong simplification is one that hides risk instead of reducing it.", [
        action("sn-service-simplify", "Simplify the menu and service steps so the remaining crew can execute fewer things more reliably.", "Less variety, more competence, much lower collapse risk.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("sn-service-delay", "Protect quality fully and accept visibly longer waits rather than trimming the product.", "Honorable, though the room may turn on the pace faster than you expect.", [0, 1, 2, { tasha: [1, 1], elena: [1, 1] }]),
        action("sn-service-shift", "Move one back-of-house person forward temporarily and tighten kitchen flow around that trade.", "Creative and plausible, but it weakens two places at once if misjudged.", [1, 1, 1, { luis: [1, 0], priya: [1, 0], elena: [0, 1] }]),
        action("sn-service-skip", "Let cleanliness and reset discipline slide because speed has to win right now.", "There is a genre of disaster that begins exactly like this.", [2, -2, -4, { tasha: [-2, -3], marcus: [-1, -2] }])
      ]),

      beat("guests", "The room is starting to feel the shortage", "Now the story becomes either patience or neglect.", "elena", "Marisol says guests forgive strain faster when the strain has a face and a plan.", [
        action("sn-guests-honest", "Tell guests service is running short-handed and set realistic expectations before frustration grows teeth.", "That kind of honesty buys more grace than management usually expects.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("sn-guests-target", "Protect the most delayed guests with quick check-ins and small service recoveries.", "A useful patch, though it depends on spotting the right emotional fires.", [-1, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("sn-guests-quiet", "Say very little and keep the team moving so the shortage does not become a bigger mood problem.", "Sometimes silence works. Sometimes it feels like indifference wearing a name tag.", [1, 1, 1, { devon: [0, 1], elena: [0, 1] }]),
        action("sn-guests-excuse", "Blame the missing employees openly so customers understand why their wait is bad.", "Cathartic and immature in equal measure.", [1, -2, -4, { elena: [-2, -3], devon: [-1, -1] }])
      ]),

      beat("crew", "The remaining team is getting resentful fast", "Short staffing is now becoming a trust test.", "marcus", "Omar says the danger is not just exhaustion. It is the feeling that leadership thinks this is normal.", [
        action("sn-crew-own", "Acknowledge the strain plainly, cut nonessential asks, and tell the crew exactly what success looks like for tonight.", "Clarity makes the burden feel shared instead of dumped.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1], tasha: [1, 1] }]),
        action("sn-crew-rotate", "Rotate the ugliest duties so no one person absorbs all the understaffed misery.", "Fair and humane, even if it costs some efficiency.", [-1, 2, 2, { marcus: [2, 1], jake: [1, 1], nina: [1, 1] }]),
        action("sn-crew-incentive", "Promise a future reward or preferred shifts for the team members who carry tonight.", "Potentially motivating, potentially eye-roll material if trust is already low.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("sn-crew-grit", "Frame tonight as a chance for the real professionals to prove themselves.", "They may prove something about leadership instead.", [2, -2, -4, { marcus: [-2, -3], tasha: [-1, -2] }])
      ]),

      beat("final", "The shift survives, but the absence damage will linger", "The last move decides whether this becomes burnout or a stronger staffing system.", "nina", "Celia says the smartest close protects tomorrow’s trust, not just today’s sales report.", [
        action("sn-final-coverage", "Build a clearer call-off backup tree and short-handed service mode before the next peak shift.", "That is how tonight becomes planning instead of folklore.", [0, 2, 4, { nina: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("sn-final-cross", "Invest more in cross-training so fewer absences can destabilize the whole building.", "A slower fix, but a very real one.", [-1, 2, 3, { devon: [2, 1], tasha: [1, 1] }]),
        action("sn-final-attendance", "Tighten attendance consequences and communicate them more clearly to the team.", "Fair if paired with support, but brittle if treated as the whole answer.", [0, 1, 2, { marcus: [1, 1], nina: [1, 1] }]),
        action("sn-final-shame", "Use the next meeting to make a public example of the no-shows.", "That will definitely create a feeling in the room.", [2, -2, -4, { nina: [-2, -2], marcus: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "fresh-only-takeover",
    category: "Custom Order Panic",
    pressure: "High",
    headline: "One customer demanding everything fresh has inspired half the line to do the same, and now your speed model is collapsing in real time",
    body: "Fresh sounds noble until every fryer and grill hears it at once.",
    beats: [
      beat("opening", "One 'fresh only' demand becomes contagious", "Guests are watching each other learn a dangerous new hobby.", "jake", "Adrian says the first move is deciding whether this is a service expectation or a system exploit.", [
        action("fo-open-rule", "Define clearly what the restaurant can freshly make on request and what timing tradeoff that creates.", "That puts boundaries on the craze without insulting the people asking.", [0, 2, 4, { jake: [2, 2], devon: [1, 1] }]),
        action("fo-open-case", "Handle the first few requests individually and hope the trend stops growing.", "Maybe it does. Maybe you teach the room a new cheat code.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("fo-open-premium", "Offer 'fresh on request' as a slower premium path so the line self-sorts by patience.", "Clever if guests accept the tradeoff as real.", [0, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("fo-open-mock", "Have the crew roll their eyes and make it clear these requests are ridiculous.", "A strong cultural statement, unfortunately against your own guests.", [2, -2, -4, { jake: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("line", "The kitchen is slowing badly under custom timing demands", "Freshness and throughput are now enemies in the same headset.", "tasha", "Chef Renata says the answer is not 'yes to everything.' It is controlled honesty.", [
        action("fo-line-window", "Batch normal orders but pull only limited fresh requests into a separate slower cadence.", "You preserve the line while honoring some of the demand.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("fo-line-cap", "Cap fresh-only requests per wave and communicate that the wait will be longer if guests choose that path.", "Fair and slightly frustrating, which is better than impossible.", [0, 1, 3, { tasha: [1, 2], devon: [1, 1] }]),
        action("fo-line-shift", "Move one person to managing fresh requests so the rest of the line keeps more normal rhythm.", "A decent compromise if labor can handle it.", [1, 1, 1, { luis: [1, 0], priya: [1, 0], jake: [1, 1] }]),
        action("fo-line-allfresh", "Try to honor every fresh request exactly as asked with no menu or timing adjustments.", "A deeply respectful path to collapse.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("guests", "Customers are now comparing whose food looked fresher", "The room is turning into a very petty science fair.", "elena", "Marisol says you need one truth everyone hears, not fifteen little explanations.", [
        action("fo-guests-message", "Explain clearly that standard food is fresh and safe, while made-to-order waits will vary if guests request them.", "That reframes the conversation before misinformation hardens into certainty.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("fo-guests-sign", "Post a temporary note about made-to-order timing so the decision feels transparent instead of mysterious.", "Useful, if a little bureaucratic for fries.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("fo-guests-compare", "Lean into explaining which items truly benefit from made-to-order timing and which do not.", "Educational and slightly risky if the tone gets too technical.", [1, 1, 1, { nina: [1, 1], jake: [0, 1] }]),
        action("fo-guests-fight", "Tell guests the trend is nonsense and that they are slowing everyone else down.", "Emotionally understandable. Professionally terrible.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("crew", "The team is annoyed that social pressure is rewriting the whole service model", "Now the resentment is internal too.", "marcus", "Omar says the crew will tolerate hard policies better than wobbly ones.", [
        action("fo-crew-policy", "Give the team one firm fresh-request policy and one escalation point so they stop improvising under pressure.", "Consistency lowers both anger and confusion.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1], jake: [1, 1] }]),
        action("fo-crew-support", "Keep checking in with the line and front counter so nobody feels singled out by the weird demand spike.", "Supportive and good for tone, though lighter on actual system control.", [0, 1, 2, { marcus: [1, 1], jake: [1, 1] }]),
        action("fo-crew-incentive", "Offer a small post-rush perk if the team stays disciplined through the nonsense.", "Useful for morale if the promise feels real.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("fo-crew-toughen", "Tell the crew to stop letting customers control the building and just push through.", "A stirring speech delivered directly into burnout.", [2, -2, -4, { marcus: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("final", "The rush fades, but the concept is now out in the world", "The next time this hits should feel less contagious.", "nina", "Celia says trends become habits when the restaurant refuses to define them first.", [
        action("fo-final-standard", "Create a clear fresh-on-request standard with timing, menu limits, and staff language.", "Now the craze meets a rule instead of a shrug.", [0, 2, 4, { nina: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("fo-final-menu", "Adjust menu wording so standard items do not sound stale by implication.", "Smart branding work with long-term benefits.", [-1, 2, 3, { nina: [2, 1], elena: [1, 1] }]),
        action("fo-final-layout", "Rework expo and timing flow so occasional fresh requests do not shatter everything.", "Operationally healthy, though more background than headline.", [0, 1, 2, { tasha: [1, 1], devon: [1, 1] }]),
        action("fo-final-ban", "Ban all fresh-only requests outright and post it aggressively.", "You solved the issue and created a new one wearing all caps.", [2, -2, -4, { nina: [-2, -2], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "delivery-app-glitch",
    category: "Platform Glitch",
    pressure: "Extreme",
    headline: "A delivery app glitch is duplicating orders, and now your kitchen is producing food for customers who may not even exist",
    body: "Tickets are multiplying, riders are confused, and the grill now has the haunted feeling of serving ghosts for profit.",
    beats: [
      beat("opening", "Duplicate delivery tickets are piling up", "The app thinks demand tripled. Reality has not confirmed it.", "marcus", "Omar says the first call is whether to trust the platform or trust the evidence in front of you.", [
        action("da-open-verify", "Pause high-volume duplicate tickets long enough to verify the pattern before the kitchen commits more food.", "A little slower, far less foolish.", [0, 2, 4, { marcus: [2, 2], tasha: [1, 1] }]),
        action("da-open-split", "Keep normal in-house orders moving while one person isolates the suspicious delivery flood.", "A strong compromise if the isolating person stays focused.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("da-open-platform", "Contact the delivery platform immediately while the line makes only the earliest duplicates already in motion.", "Sensibly cautious, though support speed may not love you back.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("da-open-fullsend", "Make every order as printed until someone official tells you to stop.", "The ghosts appreciate your professionalism.", [2, -2, -4, { tasha: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("kitchen", "The line wants to know whether to keep using real product on dubious tickets", "Waste and service are now arguing in the fryer oil.", "tasha", "Chef Renata says a fake order burns just as much inventory as a real one.", [
        action("da-kitchen-hold", "Hold suspicious duplicates in a pending queue until the pattern is clearer while real orders stay live.", "That protects inventory without collapsing the rest of service.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("da-kitchen-partial", "Prep only the longest-lead components for duplicates so you can finish quickly if they turn out real.", "Clever and flexible, though not foolproof.", [1, 1, 1, { luis: [1, 1], priya: [1, 1] }]),
        action("da-kitchen-cap", "Cap duplicate fulfillment at a small number per menu item until the platform responds.", "Strong damage control, but some true edge cases may wait longer than they deserve.", [0, 1, 2, { tasha: [1, 1], marcus: [1, 1] }]),
        action("da-kitchen-burn", "Keep firing the duplicates because wasted food is better than delayed platform metrics.", "There are many ways to lose money. This one is especially crunchy.", [2, -2, -4, { tasha: [-2, -3], luis: [-1, -2] }])
      ]),
      beat("drivers", "Delivery drivers are arriving angry because pickup times and bag counts make no sense", "Now the glitch has human witnesses.", "elena", "Marisol says confused drivers can become either partners or accelerants.", [
        action("da-drivers-brief", "Brief drivers honestly that the platform is glitching and tell them exactly which orders are being verified.", "They may still be annoyed, but at least the annoyance has coordinates.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("da-drivers-staging", "Create a small staging area for drivers so the front counter does not become a shouting museum.", "Very useful if space allows.", [0, 1, 3, { elena: [1, 2], devon: [1, 1] }]),
        action("da-drivers-scan", "Ask drivers to confirm order details before pickup so obvious duplicates die earlier.", "Helpful, though some drivers are sprinting against their own timers.", [1, 1, 1, { elena: [1, 1], marcus: [0, 1] }]),
        action("da-drivers-stall", "Tell drivers to wait quietly because the kitchen will sort it out when it sorts it out.", "A crisp strategy if your goal is a louder lobby.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -1] }])
      ]),
      beat("platform", "The delivery company is finally responding, but their first advice is slow and generic", "Corporate support has entered the chat wearing khakis.", "nina", "Celia says the next move should protect your restaurant first, not the app’s dignity.", [
        action("da-platform-local", "Follow only the parts of platform guidance that match what your team is actually seeing on the ground.", "You cooperate without surrendering common sense.", [0, 2, 4, { nina: [2, 2], marcus: [1, 1] }]),
        action("da-platform-log", "Document every duplicate and every hold so you can press for reimbursement later.", "Less dramatic, very valuable.", [0, 1, 3, { marcus: [2, 1], nina: [1, 1] }]),
        action("da-platform-pause", "Temporarily reduce delivery menu availability while the app stabilizes, even if support is vague about it.", "A brave and sane decision if in-house service is also wobbling.", [1, 1, 1, { devon: [1, 1], nina: [1, 1] }]),
        action("da-platform-obey", "Keep following the platform blindly because they own the tickets.", "And apparently your judgment too.", [2, -2, -4, { nina: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("final", "The glitch settles, but your team now knows the app can lie loudly", "The next outage should meet a system, not a shrug.", "devon", "Parker says the restaurant needs a platform-failure playbook before the next digital hallucination arrives.", [
        action("da-final-playbook", "Build a delivery-glitch playbook with verification triggers, hold rules, and driver communication steps.", "That is how ghost demand becomes manageable demand.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1], tasha: [1, 1] }]),
        action("da-final-throttle", "Set clearer local thresholds for when delivery gets throttled or simplified during digital instability.", "A little revenue caution, a lot of sanity.", [-1, 2, 3, { devon: [2, 1], nina: [1, 1] }]),
        action("da-final-train", "Train the team to spot duplicate patterns faster and escalate with less noise.", "Useful and disciplined, if a little unglamorous.", [0, 1, 2, { marcus: [1, 1], elena: [1, 1] }]),
        action("da-final-trust", "Assume the app will probably behave next time and avoid adding more process.", "Technology loves confidence like that.", [2, -2, -4, { devon: [-2, -2], marcus: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "ice-cream-machine-conspiracy",
    category: "Trust Meltdown",
    pressure: "High",
    headline: "Customers are accusing your staff of pretending the ice cream machine is broken, and now half the lobby is filming like they’re uncovering a corporate cover-up",
    body: "The machine may be down, but the confidence with which people now hate that fact is fully operational.",
    beats: [
      beat("opening", "The first accusation spreads faster than the dessert menu", "Suddenly everyone is an investigative journalist with a phone case.", "nina", "Celia says the first move should protect trust, not win an argument against dessert emotions.", [
        action("ic-open-show", "Explain clearly what is actually wrong with the machine and what timeline the team knows, without getting cute.", "Plain truth looks stronger than performative innocence.", [0, 2, 4, { nina: [2, 2], elena: [1, 1] }]),
        action("ic-open-alt", "Offer an immediate dessert alternative and keep the explanation short so the line does not become a TED Talk.", "Helpful, though some guests now think the substitute proves the cover-up.", [0, 1, 2, { nina: [1, 1], jake: [1, 1] }]),
        action("ic-open-manager", "Bring a manager out to answer the first few complaints so the crew is not fighting a conspiracy alone.", "Strong support, though it also legitimizes the spectacle a bit.", [1, 1, 1, { devon: [1, 1], nina: [1, 1] }]),
        action("ic-open-joke", "Make a sarcastic joke about the machine’s reputation and hope people laugh instead of escalate.", "One funny table does not pay for the four furious ones.", [2, -2, -4, { nina: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("proof", "Guests want evidence that the machine is genuinely down", "Now the issue is somewhere between maintenance and courtroom theater.", "marcus", "Omar says you need proof that preserves control, not proof that turns the lobby into a field trip.", [
        action("ic-proof-logged", "Show a simple maintenance note or service report summary without exposing internal chaos theatrically.", "That gives legitimacy without surrendering the building.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("ic-proof-visual", "Let a manager briefly inspect the machine in view of the lobby so people see it is not a fake story.", "Useful optics, though risky if the crowd reads it like a performance.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("ic-proof-altfree", "Comp a small alternate dessert to the loudest doubters and move the line forward.", "It buys peace and may accidentally reward suspicion.", [-1, 1, 2, { nina: [1, 1], marcus: [1, 1] }]),
        action("ic-proof-none", "Refuse to explain anything because guests are not entitled to machine details.", "Technically a sentence. Practically gasoline.", [1, -2, -4, { marcus: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("filming", "Now multiple people are filming staff reactions more than the actual machine", "The story is becoming about attitude instead of dessert.", "elena", "Marisol says staff need a safe response path before the internet starts editing personalities.", [
        action("ic-filming-script", "Give staff a clean script: acknowledge the outage, offer alternatives, and escalate hostility to one manager.", "It makes the room less likely to harvest chaos from random reactions.", [0, 2, 4, { elena: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("ic-filming-zone", "Move the loudest complainers toward a manager conversation point away from the main counter flow.", "Smart for operations, though it can feel like selecting the stars of the show.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("ic-filming-sign", "Post a quick dessert outage notice so the team is not repeating itself fifty times.", "Simple and stabilizing, if a little sterile.", [1, 1, 1, { elena: [1, 1], marcus: [0, 1] }]),
        action("ic-filming-ban", "Tell the team to confront anyone recording and demand they stop immediately.", "A bold move if you want the videos to get way better.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("crew", "Staff are getting cynical and snippy about the whole thing", "The machine may be broken, but now so is the emotional suspension.", "devon", "Parker says the team needs permission to stay human without turning bitter in public.", [
        action("ic-crew-support", "Acknowledge the absurdity privately, reset the tone publicly, and keep one leader owning the hardest guest interactions.", "That lets the crew feel seen without letting sarcasm run service.", [0, 2, 4, { devon: [2, 2], jake: [1, 1], nina: [1, 1] }]),
        action("ic-crew-rotate", "Rotate the dessert counter exposure so the same two people do not absorb every conspiracy speech.", "Fair and smart, though slightly more complex to coordinate.", [-1, 2, 2, { devon: [2, 1], jake: [1, 1] }]),
        action("ic-crew-incentive", "Promise a small post-rush reward if everyone keeps the tone steady through the nonsense.", "Not a cure, but a decent morale patch.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("ic-crew-eye-roll", "Let staff show a little natural annoyance because the guests are being ridiculous.", "They are ridiculous. They are also paying and filming.", [2, -2, -4, { devon: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The lobby calms, but the myth of your machine is now stronger than reality", "You need a future-proof answer to a very modern nonsense loop.", "tasha", "Chef Renata says if dessert failure becomes folklore, the only cure is disciplined consistency.", [
        action("ic-final-comms", "Create a simple outage communication protocol and dessert alternative plan for future machine failures.", "Now the next breakdown meets process instead of vibes.", [0, 2, 4, { tasha: [2, 2], nina: [1, 1], elena: [1, 1] }]),
        action("ic-final-maintain", "Improve preventative maintenance and visible service logging so the outage story stays more credible next time.", "Good systems work with reputational upside.", [-1, 2, 3, { tasha: [2, 1], marcus: [1, 1] }]),
        action("ic-final-menu", "Strengthen alternative dessert offerings so the machine matters less emotionally when it fails.", "A smart hedge, though not a full trust answer.", [0, 1, 2, { jake: [1, 1], nina: [1, 1] }]),
        action("ic-final-silence", "Say less next time and never dignify the conspiracy with explanation.", "Conspiracies adore silence.", [2, -2, -4, { tasha: [-2, -2], nina: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "kids-meal-toy-black-market",
    category: "Lobby Chaos",
    pressure: "High",
    headline: "Customers are trading cash and bargaining over kids meal toys in your lobby like you accidentally opened a tiny plastic stock exchange",
    body: "Parents are negotiating, children are screaming, and one teenager appears to be cornering the dragon figure market.",
    beats: [
      beat("opening", "The lobby turns into a toy trading pit", "The line is still trying to function beside a very small economic collapse.", "elena", "Marisol says the first move should protect safety and flow before deciding how adorable the nonsense is.", [
        action("km-open-separate", "Move toy discussions away from the pickup path and set a clear no-blocking rule for the lobby.", "You do not solve the frenzy yet, but you keep the building usable.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("km-open-limit", "Stop handing out visible toy assortments at the counter and shift to simpler bag distribution.", "A little colder, much less combustible.", [0, 1, 2, { elena: [1, 1], jake: [1, 1] }]),
        action("km-open-monitor", "Let the trading continue informally while a manager keeps a close eye on whether it stays harmless.", "Maybe the market self-cools. Maybe it learns confidence.", [1, 1, 1, { devon: [1, 1], nina: [0, 1] }]),
        action("km-open-cheer", "Treat it like a fun community moment and encourage the energy while service keeps going.", "The toy pit thanks you for the endorsement.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -1] }])
      ]),
      beat("parents", "Some parents love the chaos, others are complaining it feels sketchy", "The same lobby now has two competing moral universes.", "nina", "Celia says you need one policy that sounds sane to both the amused and the alarmed.", [
        action("km-parents-policy", "Say clearly that guests may trade privately only if they do not block service, pressure others, or exchange cash inside the queue.", "That gives the building a spine without declaring war on toys.", [0, 2, 4, { nina: [2, 2], elena: [1, 1] }]),
        action("km-parents-soft", "Ask families to keep it calm and low-key without spelling out exact rules yet.", "Gentle and decent, though not very protective if the frenzy keeps growing.", [0, 1, 2, { nina: [1, 1], devon: [1, 1] }]),
        action("km-parents-window", "Allow a short end-of-meal trading window instead of lobby haggling during peak flow.", "A clever compromise if people actually listen to clocks.", [1, 1, 1, { jake: [1, 1], elena: [1, 0] }]),
        action("km-parents-ban", "Confiscate the energy immediately and tell families no exchanging anything, anywhere, period.", "Sometimes authority works. Sometimes it makes the toddlers unionize.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("counter", "Staff are being pressured to swap toys or promise specific ones", "Now the market wants supply chain leverage.", "marcus", "Omar says if the team becomes part of the trade system, fairness dies first.", [
        action("km-counter-random", "Reinforce that toys are distributed randomly and staff cannot negotiate inventory at the counter.", "Clear, boring, and very stabilizing.", [0, 2, 4, { marcus: [2, 2], jake: [1, 1] }]),
        action("km-counter-sign", "Post a small note explaining random distribution and no item guarantees.", "Useful and impersonal, which helps keep arguments cooler.", [0, 1, 3, { marcus: [1, 2], elena: [1, 1] }]),
        action("km-counter-limit", "Allow one quiet courtesy swap only when the line is light and the item is available.", "Kind in theory, but now everybody thinks the rule has secret doors.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("km-counter-favor", "Let charismatic customers talk staff into special toy picks to reduce scene-making.", "A graceful invitation to chaos.", [2, -2, -4, { marcus: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("safety", "The crowding is getting louder and younger kids are now getting upset", "The plastic economy is approaching real emotional costs.", "devon", "Parker says once the environment feels unsafe, the toy argument is no longer the real issue.", [
        action("km-safety-space", "Break up the crowding, protect the pickup lane, and move any remaining toy discussion outside the main service path.", "You reset the building around its actual purpose again.", [0, 2, 4, { devon: [2, 2], elena: [1, 1] }]),
        action("km-safety-manage", "Have one manager actively supervise the lobby while the rush peaks so the energy never fully self-governs.", "More labor, much less entropy.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("km-safety-comp", "Offer upset kids a consolation solution before the tears recruit more parents into the drama.", "Kind and expensive, though occasionally the fastest path back to peace.", [-1, 1, 1, { nina: [1, 1], devon: [0, 1] }]),
        action("km-safety-ignore", "Wait for the frenzy to burn itself out because toys are not worth overmanaging.", "Neither are concussions, but here we are.", [2, -2, -4, { devon: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The market cools, but now your team needs a repeatable toy policy", "A tiny collectible should not hold your lobby hostage twice.", "jake", "Adrian says the smartest policy protects both the fun and the floor.", [
        action("km-final-policy", "Create a simple toy distribution and trading policy focused on random assignment, no counter bargaining, and no blocked flow.", "That is how a novelty stays a novelty.", [0, 2, 4, { jake: [2, 2], elena: [1, 1], marcus: [1, 1] }]),
        action("km-final-alt", "Add a low-drama backup option for guests who do not care which toy they get but want the tension gone.", "A nice pressure valve if communicated cleanly.", [-1, 2, 2, { jake: [1, 2], nina: [1, 1] }]),
        action("km-final-display", "Display the current assortment more clearly so fewer guests act shocked by randomness at the counter.", "Helpful, though it may also intensify demand for rare pieces.", [0, 1, 2, { elena: [1, 1], jake: [1, 1] }]),
        action("km-final-kill", "Drop toys entirely because the whole concept is not worth the chaos.", "A dramatic cure for a manageable disease.", [2, -2, -4, { jake: [-2, -2], nina: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "secret-menu-chaos",
    category: "Viral Menu Disruption",
    pressure: "High",
    headline: "A viral post has sent waves of customers ordering complicated secret-menu hacks your staff was never trained to make quickly",
    body: "Everybody thinks they found the cheat code to lunch. The kitchen thinks it found a curse.",
    beats: [
      beat("opening", "The first few secret-menu requests seem funny until they stop being few", "Now the unofficial menu is trying to annex the official one.", "jake", "Adrian says the team needs one answer before the room invents its own truth.", [
        action("sm-open-clarify", "Clarify that the store can only guarantee official menu items, while some custom builds may be possible with longer waits.", "It preserves flexibility without pretending internet fiction is company policy.", [0, 2, 4, { jake: [2, 2], devon: [1, 1] }]),
        action("sm-open-case", "Handle secret-menu hacks case by case and let staff accept only what feels easy enough.", "Kind of practical, kind of dangerous.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("sm-open-softyes", "Say yes to simple versions and no to the absurd ones, even if the line between them shifts.", "Reasonable, but uneven if not tightly explained.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("sm-open-humor", "Mock the hacks lightly so people understand the restaurant is not taking them seriously.", "Internet people famously love that.", [2, -2, -4, { jake: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("kitchen", "The line is losing rhythm because every hack requires translation and extra thought", "Speed dies by a thousand customizations.", "tasha", "Chef Renata says hidden menus are most dangerous when they borrow real ingredients but fake real workflow.", [
        action("sm-kitchen-cap", "Cap custom builds to combinations the line can execute reliably and reject the rest cleanly.", "That protects quality without turning the kitchen into a fan-fiction workshop.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("sm-kitchen-template", "Create a few allowed custom templates that staff can use instead of interpreting every hack from scratch.", "A smart middle path if the team can memorize them fast.", [0, 1, 3, { tasha: [1, 2], devon: [1, 1] }]),
        action("sm-kitchen-slow", "Honor the requests more generously but warn customers that the wait will be meaningfully longer.", "Fair, though the pace cost keeps spreading outward.", [1, 1, 1, { tasha: [1, 1], nina: [0, 1] }]),
        action("sm-kitchen-freestyle", "Let the kitchen improvise whatever sounds close enough to the hack and hope customers stay thrilled by confidence.", "A delicious strategy if accuracy is optional.", [2, -2, -4, { tasha: [-2, -3], luis: [-1, -2] }])
      ]),
      beat("counter", "Guests are now recording whether staff 'know the secret menu'", "Competence is being judged against mythology.", "elena", "Marisol says the building needs a script that makes normal ordering feel respectable again.", [
        action("sm-counter-script", "Use one calm script: official items are guaranteed, customizations are limited, and wait times rise with complexity.", "That turns the secret menu back into a guest choice instead of a staff exam.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("sm-counter-board", "Post temporary guidance about custom-order limits so the argument is no longer purely verbal.", "A little stiff, a lot clearer.", [0, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("sm-counter-lite", "Let veteran staff quietly steer guests toward official equivalents that sound close enough.", "Operationally useful, ethically a tiny bit slippery.", [1, 1, 1, { jake: [1, 1], elena: [0, 1] }]),
        action("sm-counter-prove", "Challenge guests to show proof of the hack before the restaurant will even discuss it.", "And now lunch is a debate club.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("crew", "The team is split between wanting firmer boundaries and wanting easier appeasement", "The room can feel that indecision.", "marcus", "Omar says mixed internal philosophy becomes mixed guest treatment almost instantly.", [
        action("sm-crew-reset", "Reset the team with one definition of what counts as allowed customization and what requires a no.", "The line gets steadier the moment the ambiguity shrinks.", [0, 2, 4, { marcus: [2, 2], jake: [1, 1], tasha: [1, 1] }]),
        action("sm-crew-escalate", "Require any hack beyond the approved range to go through one manager or one lead.", "Strong control, though it creates a bottleneck if overused.", [0, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("sm-crew-priority", "Let the team say yes more often only during slower moments, then tighten back up when the rush spikes.", "Flexible and smart if everybody can read the same room the same way.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("sm-crew-rant", "Encourage staff to vent back at the weirdest requests so the nonsense stops feeling rewarded.", "What could the cameras possibly do with that.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The wave fades, but the internet is not done with you", "Now you choose whether the next viral post hurts less.", "nina", "Celia says the best defense is a policy people can understand before they decide to be clever.", [
        action("sm-final-policy", "Build a secret-menu policy around guaranteed official items, limited approved custom builds, and clear wait tradeoffs.", "It is not glamorous, which is why it works.", [0, 2, 4, { nina: [2, 2], devon: [1, 1], tasha: [1, 1] }]),
        action("sm-final-comms", "Tighten menu and app wording so custom limits are obvious before guests ever reach the counter.", "A subtle but smart shield.", [-1, 2, 3, { nina: [2, 1], elena: [1, 1] }]),
        action("sm-final-training", "Teach staff three or four safe redirect phrases so they stop feeling ambushed by internet mythology.", "Useful, repeatable, and mercifully boring.", [0, 1, 2, { jake: [1, 1], nina: [1, 1] }]),
        action("sm-final-publicwar", "Post a mocking response online about how the secret menu is not real and guests should grow up.", "A managerial urge, not a strategy.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "drive-thru-influencer-traffic-jam",
    category: "Spectacle Crisis",
    pressure: "Extreme",
    headline: "A cluster of influencers has set up cameras in your drive-thru lane to film content, and now the line is part restaurant, part production set, part civic nuisance",
    body: "Tripods are blooming near bumpers and your drive-thru is becoming a terrible documentary.",
    beats: [
      beat("opening", "The camera crew is physically slowing the lane", "This is now a safety problem wearing a ring light.", "elena", "Marisol says the building needs lane control before it needs brand control.", [
        action("di-open-safety", "Set a hard safety boundary around lane flow first and move content creators out of the vehicle path immediately.", "That makes your priorities legible to everyone with eyes.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("di-open-manager", "Send one manager to work only the influencer cluster while the rest of the team preserves normal service.", "A good use of leadership if the lane is not already too fragile.", [1, 1, 1, { devon: [1, 1], nina: [1, 1] }]),
        action("di-open-coexist", "Try to let filming continue with polite nudges while the drive-thru squeezes around it.", "Optimistic geometry.", [0, 1, 2, { elena: [1, 1], jake: [1, 1] }]),
        action("di-open-viral", "Lean into the spectacle and hope the content upside outweighs the operational damage.", "A thrilling way to outsource judgment to traffic.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("cars", "Regular customers are getting angry that the lane is now content instead of commerce", "The audience did not consent to starring in this.", "nina", "Celia says the next move has to make normal guests feel protected, not exploited.", [
        action("di-cars-separate", "Create a visible alternate flow for normal cars if possible and explain that the team is correcting the disruption.", "You cannot erase the circus, but you can stop ticketing everybody to it.", [0, 2, 4, { nina: [2, 2], elena: [1, 1] }]),
        action("di-cars-update", "Give waiting drivers short direct updates and honest timing so frustration stays attached to facts.", "A very human fix for a very ridiculous problem.", [0, 1, 2, { nina: [1, 1], jake: [1, 1] }]),
        action("di-cars-perk", "Offer affected drivers a small make-good so the spectacle costs them less emotionally.", "Helpful in mood, costly in precedent.", [-1, 1, 1, { marcus: [0, 1], nina: [1, 1] }]),
        action("di-cars-shrug", "Act as if the lane chaos is just part of a fun day and guests should relax.", "The guests respectfully decline.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("creators", "The influencers want special handling because they claim the exposure helps you", "The lane is now negotiating its own ransom note.", "marcus", "Omar says free publicity is expensive when it arrives with traffic liability.", [
        action("di-creators-boundary", "Thank them for the attention, but separate any special accommodation from the active lane immediately.", "You accept the compliment and reject the chaos.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("di-creators-relocate", "Offer a safer off-lane spot for filming if they want to keep creating without blocking operations.", "Smart if they are interested in content more than dominance.", [0, 1, 3, { devon: [1, 2], elena: [1, 1] }]),
        action("di-creators-standard", "Treat them as normal customers and refuse any content-driven exceptions.", "Fair and clean, though it may waste a chance to de-escalate more gracefully.", [1, 1, 1, { marcus: [1, 1], nina: [0, 1] }]),
        action("di-creators-deal", "Promise freebies or priority if they keep you looking good on camera.", "An exciting partnership between panic and bad incentives.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("city", "Traffic complaints are escalating and someone mentions local enforcement", "Now operations and legality are finally meeting each other.", "devon", "Parker says a clean legal posture matters more than cleverness the second outside attention appears.", [
        action("di-city-comply", "Treat traffic safety as non-negotiable, document your mitigation, and comply fast if officials appear.", "That protects the restaurant even if it bruises the vibe.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1] }]),
        action("di-city-close", "Temporarily close or reroute the lane if that is the only safe way to stop the gridlock.", "Painful and responsible in equal measure.", [-1, 2, 3, { devon: [2, 1], elena: [1, 1] }]),
        action("di-city-lobby", "Push arriving customers inside instead of the lane while you sort the outside mess.", "A workable pivot if the dining room can absorb the shock.", [1, 1, 1, { elena: [1, 1], nina: [0, 1] }]),
        action("di-city-deflect", "Insist the city should manage the street while you keep selling food.", "A thrilling interpretation of civic coexistence.", [2, -2, -4, { devon: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("final", "The cameras finally leave, but the story definitely will not", "You need a cleaner future than today’s spectacle.", "tasha", "Chef Renata says any event policy that starts with 'maybe we could use the chaos' is already in trouble.", [
        action("di-final-policy", "Write a clear content-and-traffic policy for drive-thru filming, with safety boundaries and escalation ownership.", "That is how you keep tomorrow from cosplaying as today.", [0, 2, 4, { tasha: [2, 2], devon: [1, 1], nina: [1, 1] }]),
        action("di-final-zone", "Designate an optional safe media spot away from operations so attention never has to occupy the lane again.", "Clever if you really expect repeat interest.", [0, 1, 2, { nina: [1, 1], elena: [1, 1] }]),
        action("di-final-team", "Train the crew on how to respond when content creation turns into obstruction or guest unfairness.", "Quietly excellent prevention work.", [-1, 2, 3, { devon: [2, 1], marcus: [1, 1] }]),
        action("di-final-embrace", "Keep the whole thing loose because viral attention is usually good for business eventually.", "Eventually is doing terrifying work in that sentence.", [2, -2, -4, { tasha: [-2, -2], nina: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "hundred-burger-challenge-crew",
    category: "Spectacle Order",
    pressure: "Extreme",
    headline: "A loud group announces a timed 100-burger challenge, expects priority service, and immediately turns your restaurant into a crowd event",
    body: "They brought a timer, a ring light, and the dangerous certainty that your kitchen owes them a show.",
    beats: [
      beat("opening", "The challenge group wants the kitchen to treat them like a live event", "Everyone else wants lunch, not a front-row seat to dietary theater.", "jake", "Adrian says the first move is deciding whether this is a customer order or a private production trying to hijack your shift.", [
        action("hb-open-boundary", "Treat it as a large custom order with normal queue rules, not a priority event, and say so clearly.", "You keep the building a restaurant first and a spectacle second.", [0, 2, 4, { jake: [2, 2], devon: [1, 1] }]),
        action("hb-open-window", "Offer a scheduled production window if they want that volume without wrecking the current rush.", "Fair and operationally smart, though not as flattering to their ego.", [0, 1, 3, { elena: [1, 2], marcus: [1, 1] }]),
        action("hb-open-partial", "Accept a smaller immediate portion and let the rest follow if the line can absorb it.", "A workable compromise if they value content more than total purity.", [1, 1, 1, { jake: [1, 1], tasha: [0, 1] }]),
        action("hb-open-priority", "Bump the whole challenge forward because the crowd energy might be good for buzz.", "A fantastic way to announce that attention outranks fairness.", [2, -2, -4, { jake: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("kitchen", "The kitchen wants to know if you expect them to actually make 100 burgers right now", "Their faces suggest they already know the wrong answer.", "tasha", "Chef Renata says volume can be impressive or reckless depending on whether the rest of the building still exists afterward.", [
        action("hb-kitchen-capacity", "Give the kitchen a realistic cap and timing plan based on current traffic, not on the group’s enthusiasm.", "That respects both spectacle and reality, with much more reality.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("hb-kitchen-batch", "Batch the challenge in waves so normal orders still have oxygen.", "Smart triage, though the crowd may not love the pacing.", [1, 1, 1, { tasha: [1, 1], luis: [1, 1] }]),
        action("hb-kitchen-prep", "Shift the team into a temporary high-volume mode for the challenge and accept some collateral delay elsewhere.", "Potentially worthwhile if you control the fallout carefully.", [0, 1, 2, { tasha: [1, 1], devon: [0, 1] }]),
        action("hb-kitchen-hero", "Ask the kitchen to just crush all 100 immediately and trust morale to survive.", "The grill hears your optimism and declines.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("crowd", "The challenge is drawing attention from other guests and random onlookers", "Now the lobby is getting ideas.", "nina", "Celia says the room should never feel like regular guests paid to fund someone else’s stunt.", [
        action("hb-crowd-separate", "Contain the challenge energy physically and keep nearby guests updated so they do not feel hijacked by it.", "That protects normal customers from becoming unwilling extras.", [0, 2, 3, { nina: [2, 2], elena: [1, 1] }]),
        action("hb-crowd-reframe", "Frame it as one unusual order the team is fitting into regular service, not the star of the building.", "A useful tone correction, if consistently backed by action.", [0, 1, 2, { nina: [1, 1], jake: [1, 1] }]),
        action("hb-crowd-perk", "Offer a tiny goodwill gesture to the sections most visibly affected by the commotion.", "Kind, though again you are paying for somebody else’s spectacle.", [-1, 1, 1, { marcus: [0, 1], nina: [1, 1] }]),
        action("hb-crowd-hype", "Turn the whole room into a hype zone and hope the buzz makes everyone forget the delays.", "Crowds remember delays surprisingly well.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("money", "The group is now arguing about discounts because they are 'bringing business'", "They want influencer economics with burger logistics.", "marcus", "Omar says volume and value are not the same thing once labor, disruption, and fairness enter the room.", [
        action("hb-money-standard", "Keep pricing standard and tie any accommodation only to actual service issues, not the existence of the challenge.", "That protects the principle that attention is not a coupon.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("hb-money-package", "Offer a clearly defined pre-agreed bulk package only if it does not undercut guests already waiting.", "Commercially smart if the math is disciplined.", [1, 1, 1, { marcus: [1, 1], devon: [1, 1] }]),
        action("hb-money-future", "Offer a future-event discussion rather than renegotiating the current rush around their stunt.", "Helpful if they are serious, less useful if they wanted immediate leverage.", [0, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("hb-money-cave", "Give them a flashy discount because the crowd makes the moment feel bigger than the margin loss.", "A thrilling way to reward operational hostage-taking.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("final", "The challenge ends, but now everyone wants to know whether this can happen again", "Policy is about to meet burger mythology.", "devon", "Parker says the best answer will respect business upside without letting stunts draft your labor plan.", [
        action("hb-final-policy", "Create a large-volume challenge policy with advance notice, no rush priority, and protected service standards.", "That turns chaos into a framework instead of a sequel.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1], tasha: [1, 1] }]),
        action("hb-final-events", "Channel future stunt groups into scheduled event windows where the building can profit without bleeding out.", "Smart and slightly opportunistic in the good way.", [0, 1, 3, { devon: [1, 2], nina: [1, 1] }]),
        action("hb-final-guardrails", "Write specific labor and volume guardrails before entertaining any future giant challenge orders.", "Very sensible, if less fun than the crowd would like.", [0, 1, 2, { tasha: [1, 1], devon: [1, 1] }]),
        action("hb-final-ban", "Ban anything theatrical forever because the restaurant should never feel weird again.", "Restaurants disagree with your dream.", [2, -2, -4, { devon: [-2, -2], nina: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "mascot-meltdown",
    category: "Promo Disaster",
    pressure: "High",
    headline: "Your store mascot shows up for a promo and immediately starts acting chaotic, knocking things over and frightening children instead of delighting them",
    body: "The costume is huge, the judgment is tiny, and the dining room is wondering whether this was always part of the plan.",
    beats: [
      beat("opening", "The mascot enters and the room reacts badly fast", "The promo now feels like a wildlife incident.", "elena", "Marisol says the first job is restoring physical calm, not defending the brand character’s artistic freedom.", [
        action("mm-open-pull", "Pull the mascot off the floor immediately and reset the room before deciding anything else.", "You lose the promo and save the building from becoming a memory children retell angrily.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("mm-open-manager", "Send a manager to control the mascot route and shorten the appearance drastically.", "A decent salvage if the performer is recoverable.", [1, 1, 1, { elena: [1, 1], jake: [1, 1] }]),
        action("mm-open-zone", "Confine the mascot to one visible photo area and keep them away from active lanes and tables.", "That contains the weirdness without pretending it is gone.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("mm-open-hope", "Let the act continue and trust the room will warm up once the mascot settles in.", "The mascot has given no sign of wanting to settle in.", [2, -2, -4, { elena: [-2, -3], devon: [-1, -2] }])
      ]),
      beat("guests", "Parents are upset, teens are filming, and the mascot just knocked over a drink tower", "So now the promo has liquid stakes.", "nina", "Celia says you need to choose whether the story becomes apology, comedy, or liability.", [
        action("mm-guests-direct", "Apologize directly to affected guests, clear the mess fast, and separate recovery from the show itself.", "That tells the room the restaurant still knows what it is.", [0, 2, 4, { nina: [2, 2], jake: [1, 1] }]),
        action("mm-guests-soft", "Use humor carefully while making practical recoveries so the moment feels less threatening.", "It can work, but only if the tone stays more kind than cute.", [1, 1, 1, { nina: [1, 1], elena: [1, 1] }]),
        action("mm-guests-perk", "Comp the directly disrupted tables quickly so resentment does not fossilize.", "Helpful, though it costs margin and does not fix the mascot logic.", [-1, 1, 2, { marcus: [0, 1], nina: [1, 1] }]),
        action("mm-guests-spin", "Act like this is all part of a fun spontaneous promo experience.", "It is spontaneous, at least.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("performer", "The mascot performer insists they are 'committing to the bit'", "Unfortunately, the bit is now actively expensive.", "marcus", "Omar says talent freedom is not the same thing as operational permission.", [
        action("mm-performer-end", "End the performance immediately and debrief the performer off-floor before any future appearance.", "A strong boundary looks wiser than a reckless bit looks brave.", [0, 2, 4, { marcus: [2, 2], elena: [1, 1] }]),
        action("mm-performer-script", "Give the performer a tighter script and one last short chance only in a controlled space.", "Potentially salvageable, though it still asks the room to trust a shaky actor twice.", [0, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("mm-performer-handler", "Assign a staff handler to control every mascot interaction for the rest of the promo.", "A smart containment move if you cannot fully cancel fast enough.", [1, 1, 1, { jake: [1, 1], elena: [1, 0] }]),
        action("mm-performer-defend", "Back the performer publicly so the staff sees management standing by the brand character.", "The brand character just scared a six-year-old with a tray.", [2, -2, -4, { marcus: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("crew", "Staff are embarrassed and unsure whether they should keep smiling through this", "Now internal trust is wobbling too.", "devon", "Parker says the team should hear that the restaurant saw the chaos too, not just the 'activation.'", [
        action("mm-crew-reset", "Acknowledge to staff that the promo went off the rails and that safety and service are back in charge.", "That one sentence restores a surprising amount of dignity.", [0, 2, 4, { devon: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("mm-crew-support", "Reassign a few staff positions so the most shaken people are not trapped in the hottest guest reactions.", "Fair and helpful, though lighter on the bigger lesson.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("mm-crew-bonus", "Offer a small reward for the team surviving the promo mess with grace.", "Not terrible, though the crew may want competence more than snacks.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("mm-crew-deny", "Tell the team to stay upbeat because the promo was mostly successful overall.", "They were there.", [2, -2, -4, { devon: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The mascot is gone, but the building needs a memory of this that helps", "Some promos deserve to become policies quickly.", "tasha", "Chef Renata says chaos only becomes useful after you stop pretending it was charisma.", [
        action("mm-final-protocol", "Create a live-promo safety protocol with performer boundaries, handler rules, and a fast shutdown trigger.", "Now the next mascot answers to a system instead of a mood.", [0, 2, 4, { tasha: [2, 2], devon: [1, 1], elena: [1, 1] }]),
        action("mm-final-screen", "Vet future performers harder and use shorter, more controlled appearances.", "Less exciting, much more adult.", [0, 1, 3, { marcus: [1, 2], elena: [1, 1] }]),
        action("mm-final-zone", "Move all future character promos into defined photo windows instead of free-roaming service time.", "A very good compromise between marketing and sanity.", [0, 1, 2, { jake: [1, 1], elena: [1, 1] }]),
        action("mm-final-double", "Double down on bigger mascot energy next time so the room understands the vibe better.", "Yes, the problem was definitely insufficient chaos literacy.", [2, -2, -4, { tasha: [-2, -2], devon: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "free-food-hack-flash-mob",
    category: "Mob Pressure",
    pressure: "Extreme",
    headline: "A crowd rushes in shouting a viral phrase they claim gets them free food, and they are loud, coordinated, and not leaving just because logic showed up",
    body: "The dining room is becoming a slogan, and your team is now standing between internet confidence and an actual register.",
    beats: [
      beat("opening", "The flash mob hits the counter all at once", "Normal guests are frozen between entertainment and fear.", "elena", "Marisol says the first move should separate real service from performative pressure fast.", [
        action("ff-open-control", "Re-establish physical order first: one line, one spokesperson if needed, and normal guests protected from the surge.", "That makes the room a restaurant again before it becomes a debate hall.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("ff-open-script", "Use one calm script that the phrase is not a valid promotion and actual service complaints will be handled separately.", "Clear and steady, though the crowd may still test your patience.", [0, 1, 2, { nina: [1, 1], devon: [1, 1] }]),
        action("ff-open-managers", "Flood the front with managers so the team does not get individually cornered by the mob energy.", "Strong support, but it can also make the incident feel even more consequential.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("ff-open-argue", "Debate the phrase publicly with the loudest guests and try to out-logic the stunt.", "The phrase came from the internet. It did not come for nuance.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("room", "Other guests are now asking whether they should even stay", "Trust is leaking out of the walls.", "nina", "Celia says the room needs to see that the team protects normal guests before it protects pride.", [
        action("ff-room-priority", "Protect regular guest service lanes and offer anyone caught in the disruption a clear path forward or out.", "That makes fairness visible instead of theoretical.", [0, 2, 4, { nina: [2, 2], elena: [1, 1] }]),
        action("ff-room-update", "Quietly update seated guests that a coordinated disruption is being handled and their orders remain the priority.", "Calm, direct, and surprisingly reassuring.", [0, 1, 2, { nina: [1, 1], jake: [1, 1] }]),
        action("ff-room-perk", "Offer a small inconvenience recovery to the most affected normal guests while the surge gets contained.", "Helpful but costly, and it does not solve the crowd itself.", [-1, 1, 1, { marcus: [0, 1], nina: [1, 1] }]),
        action("ff-room-shrug", "Treat the whole thing as mostly harmless noise so the crowd does not feel too powerful.", "The crowd is absolutely listening for that kind of weakness.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("policy", "The crowd is demanding a visible answer about the 'hack' now", "Silence looks weak. Sloppiness looks permanent.", "marcus", "Omar says the answer should make the policy stronger than the slogan.", [
        action("ff-policy-clear", "State plainly that viral phrases do not create promotions, while real service recovery remains management’s call.", "That preserves both policy and discretion.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("ff-policy-sign", "Post a temporary notice that online claims are not valid offers and direct real concerns to a manager.", "Very useful if the crowd is feeding on ambiguity.", [0, 1, 3, { elena: [1, 2], marcus: [1, 1] }]),
        action("ff-policy-minimal", "Say as little as possible and rely on repeated polite refusals instead of one big answer.", "This can work if the room is small. Mobs are rarely small in spirit.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("ff-policy-freebie", "Give one small free item to calm the room and hope the crowd dissolves once it feels seen.", "Congratulations on publishing your new promotion live in person.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("team", "Staff are rattled and worried that every future rush can now be weaponized by a phrase", "The culture risk is catching up to the crowd risk.", "devon", "Parker says the crew needs to know they are not expected to negotiate with chaos alone.", [
        action("ff-team-path", "Create a clean escalation path so frontline staff can refuse calmly and hand off pressure quickly.", "That gives the team backbone without demanding heroics.", [0, 2, 4, { devon: [2, 2], elena: [1, 1], nina: [1, 1] }]),
        action("ff-team-rotate", "Rotate who handles the loudest guests so no one person absorbs the whole wave.", "Fair and stabilizing, though not a full system by itself.", [0, 1, 2, { devon: [1, 1], jake: [1, 1] }]),
        action("ff-team-support", "Promise the crew a debrief and support after the surge so they know leadership sees the strain.", "Helpful for morale, lighter on immediate control.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("ff-team-grit", "Tell the team to stand their ground and stop letting nonsense shake them.", "Everyone loves being handed a slogan to fight a slogan.", [2, -2, -4, { devon: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("final", "The crowd thins, but the stunt definitely worked on your attention", "The building needs a stronger immune system now.", "tasha", "Chef Renata says the best anti-hack policy is one that is clear before the next hack ever enters the door.", [
        action("ff-final-protocol", "Build a viral-stunt protocol around queue control, policy language, and manager discretion for true service issues.", "That turns mob energy into a manageable pattern instead of a fresh wound.", [0, 2, 4, { tasha: [2, 2], devon: [1, 1], marcus: [1, 1] }]),
        action("ff-final-signage", "Use clearer promotion signage and app messaging so fake offers have less space to breathe.", "A subtle shield that helps more than it sounds like it would.", [-1, 2, 3, { nina: [2, 1], elena: [1, 1] }]),
        action("ff-final-drill", "Practice one quick disruptive-crowd drill so the team stops freezing when slogans become pressure.", "Very smart and slightly exhausting.", [0, 1, 2, { devon: [1, 1], jake: [1, 1] }]),
        action("ff-final-post", "Publicly shame the crowd online so future stunt groups know you are not easy prey.", "A tempting strategy with a deeply online downside.", [2, -2, -4, { tasha: [-2, -2], nina: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "fry-shortage-panic",
    category: "Core Item Failure",
    pressure: "Extreme",
    headline: "You run out of fries mid-rush and customers react like civilization itself has slipped off the tray",
    body: "People are bargaining, accusing, and staring at the menu board like it personally betrayed them.",
    beats: [
      beat("opening", "The fry bins are empty and the room notices immediately", "Your most emotional side item just became philosophy.", "elena", "Marisol says the first move should control expectation before anger gets creative.", [
        action("fp-open-clear", "Tell guests immediately that fries are out, what substitutes exist, and how long any recovery might realistically take.", "Bad news delivered early still counts as hospitality.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("fp-open-sub", "Offer simple substitute options right away so the line does not stall in collective disbelief.", "Practical and helpful, though not everyone wanted onion rings to become political.", [0, 1, 2, { jake: [1, 1], elena: [1, 1] }]),
        action("fp-open-limit", "Quietly stop selling fry combos first while the team checks whether any frozen backup can be salvaged.", "A little strategic, a little dangerous if word gets out unevenly.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("fp-open-hide", "Keep taking fry orders until the kitchen absolutely forces the truth out of you.", "There is no version of that reveal that gets kinder later.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("line", "Combo meals, drive-thru timing, and value perception are all now tangled together", "The fry problem is secretly three problems in a trench coat.", "devon", "Parker says the real call is whether you want a cleaner line or a more offended one.", [
        action("fp-line-reprice", "Adjust combos transparently or allow easy substitutions so guests do not feel like they are paying for fiction.", "That protects trust better than pretending fries were spiritually optional.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1] }]),
        action("fp-line-credit", "Offer a modest make-good only on the most clearly impacted combo orders.", "Targeted and fair, though it requires staff judgment at speed.", [0, 1, 2, { marcus: [1, 1], nina: [1, 1] }]),
        action("fp-line-pivot", "Push guests toward other bundles and premium sides so the average ticket survives the shortage.", "Commercially smart, but risky if it sounds like you are monetizing disappointment.", [1, 1, 1, { jake: [1, 1], marcus: [0, 1] }]),
        action("fp-line-shrug", "Tell guests the combos are basically the same and fries are not the point anyway.", "Many of them would disagree with passionate volume.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("supply", "The team is scrambling to figure out whether more fries can appear fast enough to matter", "Hope is now doing inventory work.", "tasha", "Chef Renata says the wrong move is building a service promise around a maybe.", [
        action("fp-supply-confirm", "Confirm exactly what backup stock, nearby transfer, or alternate fry timing is truly possible before promising anything.", "Reality has never looked so beautiful.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("fp-supply-partial", "Recover fries only for certain channels or certain meal blocks if supply comes back unevenly.", "Operationally smart, though harder to explain cleanly.", [0, 1, 3, { tasha: [1, 2], devon: [1, 1] }]),
        action("fp-supply-rush", "Have someone urgently source fries from another location while the team keeps service cautious.", "Potentially great if the transfer is real and quick.", [1, 1, 1, { marcus: [1, 1], tasha: [0, 1] }]),
        action("fp-supply-promise", "Announce that fries should be back soon before you actually know that is true.", "A confidence-based inventory model.", [2, -2, -4, { tasha: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("guests", "Customers are now demanding refunds, answers, or explanations that feel almost personal", "The room is treating potatoes like trust.", "nina", "Celia says people are not just mad about fries. They are mad about surprise, fairness, and feeling dumb at the counter.", [
        action("fp-guests-fair", "Match your response to the real inconvenience: substitutions, partial credits, or fast exits where appropriate.", "The room may still be annoyed, but the logic holds.", [0, 2, 3, { nina: [2, 2], marcus: [1, 1] }]),
        action("fp-guests-human", "Let managers handle the hottest reactions personally so the line staff do not become the face of the shortage.", "Supportive and stabilizing, though management bandwidth gets thin.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("fp-guests-convert", "Turn the moment into a push for featured substitutes and hope some people feel delighted instead of deprived.", "This can work, but only if the delight feels earned, not salesy.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("fp-guests-combat", "Argue that fries are not worth this level of reaction and the guests need perspective.", "An unforgettable lesson in escalation.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The shortage passes, but the building now knows fries are basically social glue", "The next shortage should feel more boring than this one did.", "marcus", "Omar says mature systems make even stupidly emotional shortages look less dramatic.", [
        action("fp-final-buffer", "Build a stronger fry buffer and a shortage response plan around combos, substitutions, and signage.", "That is the kind of boring plan that saves chaotic afternoons.", [0, 2, 4, { marcus: [2, 2], tasha: [1, 1], devon: [1, 1] }]),
        action("fp-final-menu", "Clarify substitution policy and combo language before the next rush so guests do not feel ambushed by shortages.", "A quiet but powerful expectation fix.", [-1, 2, 3, { nina: [2, 1], elena: [1, 1] }]),
        action("fp-final-sourcing", "Create a faster emergency transfer process for core items that regularly drive emotional demand.", "Operationally useful and slightly humbling.", [0, 1, 2, { marcus: [1, 1], tasha: [1, 1] }]),
        action("fp-final-minimize", "Treat the whole incident as an overreaction and avoid redesigning around one weird rush.", "It was weird. It was also data.", [2, -2, -4, { marcus: [-2, -2], nina: [-1, -2] }])
      ])
    ]
  })
];

module.exports = FEAST_HAVEN_EVENTS.slice(0, 15);
