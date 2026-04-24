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

const CHAOS_EVENTS = [
  makeEvent({
    id: "lobster-mascot-hostage",
    category: "Mascot Disaster",
    pressure: "Absurd",
    headline: "A rented lobster mascot refuses to leave the lobby until Feast Haven names him assistant manager",
    body:
      "The mascot was hired for a seafood promo. Now he is blocking the host stand, chanting 'claws before laws,' and children are tipping him in dinner rolls.",
    beats: [
      beat("opening", "The lobby has become a crustacean labor rally", "Guests are laughing, filming, and slowly realizing nobody is in control.", "elena", "Marisol says the lobby can survive weird. It cannot survive looking kidnapped by a lobster with demands.", [
        action("lm-open-negotiate", "Negotiate with the lobster in public and make it feel like dinner theater.", "The room loves the bit until the lobster asks for dental and a parking spot.", [2, 1, -2, { elena: [1, 1], jake: [1, 0], tasha: [-1, -1] }]),
        action("lm-open-remove", "Quietly remove the mascot through the service hall before the joke becomes policy.", "You regain the host stand, but half the room boos like you just fired Santa.", [-1, -2, 1, { elena: [1, 2], marcus: [-1, -1] }]),
        action("lm-open-hire", "Name him 'Assistant Manager of Vibes' for one hour and use the crowd.", "Revenue spikes, but staff immediately ask whether costumes outrank training now.", [3, 1, -3, { jake: [1, 1], elena: [-2, -2], tasha: [-1, -2] }])
      ]),
      beat("contract", "The mascot reveals the contract has no end time", "He found a loophole and is now demanding a shellfish-free break room.", "marcus", "Omar says the staff are one chant away from joining the lobster out of pure boredom.", [
        action("lm-contract-buyout", "Pay the mascot extra to leave and bury the loophole immediately.", "It is expensive, but the lobby stops being a labor-law aquarium.", [-2, 1, 2, { marcus: [1, 2], elena: [1, 1] }]),
        action("lm-contract-counter", "Counter with free calamari and a fake title instead of cash.", "The mascot accepts, then loudly asks if calamari is a coworker.", [1, -1, -2, { marcus: [-1, -2], tasha: [-1, 0] }]),
        action("lm-contract-union", "Let staff vote whether the lobster stays as morale entertainment.", "The vote is hilarious until the kitchen realizes democracy just added a mascot to the shift.", [0, 2, -1, { marcus: [2, 1], tasha: [-2, -2], priya: [-1, -1] }])
      ]),
      beat("kitchen", "Chef Renata says the seafood special now feels personal", "The lobster is staring through the pass like a haunted corporate logo.", "tasha", "Chef Renata wants the mascot out before every seafood order starts feeling like a betrayal.", [
        action("lm-kitchen-pause", "Pause the seafood special and sell the story as ethical comedy.", "Guests applaud. Margins scream quietly into the walk-in.", [-3, 2, 3, { tasha: [1, 2], elena: [1, 1] }]),
        action("lm-kitchen-ignore", "Keep selling seafood and tell the kitchen not to be emotionally managed by felt claws.", "The line moves, but the staff now describe you as 'pro-boil.'", [3, -2, -3, { tasha: [-3, -4], priya: [-1, -2] }]),
        action("lm-kitchen-duel", "Stage a fake chef-versus-lobster peace summit at the pass.", "The bit lands, then the lobster demands final approval on bisque language.", [2, 1, -2, { tasha: [0, -1], jake: [1, 1], elena: [-1, -1] }])
      ]),
      beat("internet", "The hashtag #FreeTheLobster is trending locally", "A rival restaurant posts that Feast Haven mistreats shellfish and employees equally.", "jake", "Adrian wants the internet energy captured before it turns into a cartoon picket line.", [
        action("lm-internet-own", "Post a clear joke statement and announce the lobster's graceful retirement.", "You control the tone, but the lobster refuses retirement unless there is cake.", [1, 2, 2, { jake: [1, 2], elena: [1, 1] }]),
        action("lm-internet-fight", "Reply to the rival restaurant with a spicy lobster meme war.", "Students at nearby tables love it. Adults with money look confused and tired.", [2, -1, -3, { jake: [2, 1], elena: [-2, -2] }]),
        action("lm-internet-silent", "Stay silent and hope people get bored by dessert.", "They do not get bored. They make fan art.", [0, -2, -3, { jake: [-1, -2], devon: [-1, -1] }])
      ]),
      beat("final", "The lobster asks for a farewell speech during peak seating", "The lobby is split between chanting guests and exhausted staff who want their restaurant back.", "devon", "Parker says the exit matters: if the lobster leaves badly, the night becomes a meme instead of a memory.", [
        action("lm-final-parade", "Give the lobster a 90-second farewell parade and then hard-close the bit.", "It costs dignity, saves the lobby, and somehow sells six desserts.", [1, 2, 2, { devon: [2, 2], elena: [1, 1], tasha: [0, 1] }]),
        action("lm-final-ban", "Ban mascot promotions permanently in front of the staff.", "The team feels protected. Marketing quietly dies inside.", [-1, 1, 1, { elena: [1, 2], jake: [-2, -2], tasha: [1, 1] }]),
        action("lm-final-extend", "Book the lobster for brunch because the numbers are too good.", "Revenue pops and credibility collapses like a wet cardboard shell.", [4, -3, -4, { elena: [-2, -3], tasha: [-2, -3], marcus: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "miracle-soup-cult",
    category: "Wellness Panic",
    pressure: "Extreme",
    headline: "A guest claims the tomato soup cured her bad knee and now a wellness crowd is demanding medical soup flights",
    body:
      "The soup is normal. The guest is doing lunges by table seven. Twenty people have arrived asking whether the bisque helps with taxes.",
    beats: [
      beat("opening", "The dining room wants soup science", "Phones are out, spoons are raised, and the soup pot has become a shrine.", "nina", "Celia says the floor needs language before servers accidentally prescribe dinner.", [
        action("ms-open-disclaimer", "Tell servers to say the soup is delicious, not medical.", "It is legally sane and commercially boring in a room that came for miracles.", [-1, 1, 3, { nina: [1, 2], elena: [1, 1] }]),
        action("ms-open-play", "Lean into 'emotionally restorative soup' without promising anything physical.", "The wording dances nicely until a guest asks if insurance covers it.", [2, 1, -1, { nina: [1, 1], jake: [1, 1], devon: [-1, 0] }]),
        action("ms-open-cups", "Sell tiny 'placebo shooters' as a joke special.", "The joke prints money and also creates a line of people asking for second opinions.", [4, -1, -3, { nina: [2, 1], tasha: [-2, -2], elena: [-1, -1] }])
      ]),
      beat("kitchen", "Chef Renata is offended that her soup is now a medical device", "She says if one more person asks about antioxidants, she is replacing the garnish with a cease-and-desist.", "tasha", "Chef Renata wants the food respected before the kitchen becomes a pharmacy with candles.", [
        action("ms-kitchen-respect", "Rebrand the special around craft, not cures, and let Renata explain the recipe.", "The kitchen feels seen, but miracle-seekers treat technique like a downgrade.", [-1, 1, 2, { tasha: [2, 3], priya: [1, 1], jake: [-1, -1] }]),
        action("ms-kitchen-secret", "Let guests believe the recipe is secret and mysterious.", "Mystery sells bowls and annoys everyone who knows the secret is basil.", [3, 0, -2, { tasha: [-2, -3], jake: [1, 1] }]),
        action("ms-kitchen-batch", "Make a second batch fast before the crowd flips.", "You protect sales and risk quality dropping exactly when everyone is watching.", [2, -2, -2, { tasha: [-1, -2], priya: [-1, -1], nina: [1, 0] }])
      ]),
      beat("guest", "A guest wants a refund because the soup did not fix his shoulder", "He brought before-and-after photos. They are both just his shoulder.", "devon", "Parker says the refund answer will set whether Feast Haven sold food or hope.", [
        action("ms-guest-refund", "Refund him once and clearly state the restaurant makes no health claims.", "You pay for a clean boundary and avoid the world's dumbest lawsuit.", [-2, 1, 3, { devon: [2, 2], elena: [1, 1] }]),
        action("ms-guest-replace", "Offer another soup and say healing takes patience.", "The table laughs until someone writes that on a napkin like policy.", [1, 0, -3, { devon: [-1, -2], nina: [1, 0] }]),
        action("ms-guest-nope", "Refuse the refund because soup is not a chiropractor.", "The logic is perfect. The video is not.", [1, -2, -2, { devon: [-1, -1], elena: [-1, -2] }])
      ]),
      beat("press", "A local news van arrives for a segment called Soup or Scam?", "The reporter asks whether Feast Haven is healing people or exploiting them.", "elena", "Marisol says the next sentence either makes Feast Haven charming or extremely sue-able.", [
        action("ms-press-humble", "Say the only miracle is good hospitality and better tomatoes.", "It is charming, safe, and less viral than everyone hoped.", [0, 2, 3, { elena: [2, 3], tasha: [1, 1] }]),
        action("ms-press-joke", "Joke that the soup cured low morale in the kitchen.", "The quote lands, but Chef Renata now looks like exhibit A.", [2, 0, -2, { elena: [1, 1], tasha: [-2, -2] }]),
        action("ms-press-hide", "Decline the interview and keep serving.", "The story writes itself, and somehow the soup looks guiltier.", [1, -2, -3, { elena: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The soup crowd wants a weekly healing night", "It would sell out, irritate staff, and possibly summon regulators with clipboards.", "marcus", "Omar says the support crew cannot keep resetting tables for people doing wellness squats between courses.", [
        action("ms-final-food", "Retire the miracle language and keep the soup as a normal menu star.", "You sacrifice a fad and keep a restaurant instead of a soup church.", [1, 2, 3, { marcus: [1, 2], tasha: [2, 2], elena: [1, 1] }]),
        action("ms-final-night", "Run one clearly comedic 'Soup Night' with disclaimers everywhere.", "It is profitable, exhausting, and only barely less ridiculous than doing nothing.", [3, 0, -1, { marcus: [-1, -1], nina: [1, 1], jake: [1, 1] }]),
        action("ms-final-subscription", "Launch a soup subscription before the trend dies.", "Money floods in until the first customer asks for a diagnosis receipt.", [4, -3, -4, { marcus: [-2, -3], elena: [-2, -3], tasha: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "tiny-horse-reservation",
    category: "Dining Room Animal",
    pressure: "Extreme",
    headline: "The mayor arrives with a tiny emotional-support horse wearing a bow tie and expects a table for three",
    body:
      "The horse is adorable, powerful, and already eating centerpiece flowers. The mayor says his date gets anxious without him.",
    beats: [
      beat("opening", "The front door is staring at a hoofed VIP problem", "Guests are whispering, the horse is posing, and the waitlist is asking if ponies count toward party size.", "elena", "Marisol says denying the mayor looks hostile, but seating a horse looks like the restaurant has surrendered to whimsy.", [
        action("th-open-seat", "Seat the mayor in a corner and treat the horse like a mobility concern.", "The mayor is grateful, but one guest asks if their ferret can have the patio.", [2, 0, -2, { elena: [1, 1], devon: [-1, -1], marcus: [-1, -1] }]),
        action("th-open-policy", "Pause seating and verify what the restaurant is legally required to allow.", "It is slower and safer, but the mayor looks publicly challenged.", [-1, -1, 3, { elena: [1, 2], devon: [1, 1] }]),
        action("th-open-patio", "Offer the patio with VIP treatment and a flower-free zone.", "It feels like a compromise until the patio guests realize they are now in a barn-adjacent experience.", [1, 1, 0, { elena: [1, 1], marcus: [-1, -1] }])
      ]),
      beat("damage", "The horse eats the handwritten reservation book", "Half the night is now in the animal and Marisol looks like she may resign into the chandelier.", "devon", "Parker says the next move has to recover data without making the mayor defensive.", [
        action("th-damage-admit", "Tell guests exactly what happened and rebuild the waitlist by phone confirmations.", "It sounds insane, but honesty makes the chaos weirdly credible.", [-1, 2, 2, { devon: [2, 2], elena: [1, 1] }]),
        action("th-damage-cover", "Call it a 'reservation system disruption' and quietly scramble.", "Professional wording cannot hide hoof-shaped bite marks.", [1, -2, -3, { devon: [-1, -2], elena: [-2, -2] }]),
        action("th-damage-mayor", "Ask the mayor to help explain because his horse caused the problem.", "Accountability is fair, but now the mayor feels ambushed during appetizers.", [0, -1, 1, { devon: [1, 1], elena: [-1, -1], jake: [-1, 0] }])
      ]),
      beat("kitchen", "Chef Renata refuses to send carrots to table twelve", "She says rewarding the horse teaches everybody the wrong lesson about boundaries.", "tasha", "Chef Renata wants the dining room to stop turning the kitchen into a petting zoo pantry.", [
        action("th-kitchen-boundary", "Refuse horse snacks and explain the kitchen serves guests, not livestock.", "The kitchen cheers. The mayor's table gets frostier than the sorbet.", [0, -1, 2, { tasha: [2, 3], elena: [-1, -1] }]),
        action("th-kitchen-carrots", "Send one controlled carrot plate to stop the flower damage.", "It saves the decor and tells every employee boundaries are negotiable with enough hooves.", [1, 1, -2, { tasha: [-2, -3], marcus: [-1, -1] }]),
        action("th-kitchen-menu", "Create a fake 'mayoral carrot amuse-bouche' and sell the joke.", "Guests laugh, the mayor beams, and Chef Renata calls it clown farming.", [3, 1, -1, { tasha: [-3, -3], jake: [1, 1] }])
      ]),
      beat("public", "A guest posts that Feast Haven gives better service to horses than humans", "The comments are split between animal lovers and people who want normal dinner.", "jake", "Adrian says the public story has to be funny without making regular guests feel like extras.", [
        action("th-public-human", "Comp delayed human tables before making any horse jokes online.", "You repair resentment first, but it costs real money.", [-2, 3, 3, { jake: [1, 2], elena: [1, 1] }]),
        action("th-public-viral", "Post one polished photo of the bow-tie horse and ride the attention.", "The internet loves it. The ignored tables do not.", [3, -2, -2, { jake: [2, 1], devon: [-1, -1] }]),
        action("th-public-delete", "Ask guests not to post animal content from inside the dining room.", "It sounds controlling and guarantees five more posts.", [0, -2, -3, { jake: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("final", "The mayor wants to make Feast Haven his official horse-friendly dinner spot", "This could mean publicity, chaos, or a permanent hay budget.", "marcus", "Omar says support staff need a policy before they spend their lives sweeping oats from fine dining carpet.", [
        action("th-final-policy", "Write a clear animal accommodation policy and apply it even to powerful guests.", "It is the least funny answer and probably the only one that survives next week.", [0, 2, 4, { marcus: [2, 3], elena: [1, 1], devon: [1, 1] }]),
        action("th-final-event", "Offer one controlled charity patio event with the horse and strict rules.", "It monetizes the chaos while keeping it fenced, mostly.", [2, 1, 0, { marcus: [0, 1], jake: [1, 1], tasha: [-1, -1] }]),
        action("th-final-brand", "Rebrand the patio as 'The Stable Table' for VIP animal nights.", "Revenue jumps briefly before staff morale steps directly into a metaphorical puddle.", [4, -3, -4, { marcus: [-3, -4], tasha: [-2, -2], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "forbidden-lasagna-volcano",
    category: "Fake Secret Menu",
    pressure: "High",
    headline: "TikTok invented a fake secret menu item called the Forbidden Lasagna Volcano and guests are demanding it",
    body:
      "It does not exist. It looks dangerous. It is somehow trending with the phrase 'ask for extra lava.'",
    beats: [
      beat("opening", "The floor is being asked for lava", "Servers are improvising wildly and one table is chanting 'volcano' like a sports arena.", "nina", "Celia says every server needs the same answer before the fake item becomes real through panic.", [
        action("fl-open-deny", "Clearly say the item is fake and offer real specials instead.", "Accurate, safe, and greeted like you personally cancelled fun.", [-1, -1, 2, { nina: [1, 2], jake: [-1, -1] }]),
        action("fl-open-limited", "Create a small legal version and sell it as a controlled pop-up.", "You capture demand, but now the kitchen is building a meme under pressure.", [3, 1, -1, { nina: [1, 1], tasha: [-2, -2], priya: [-1, -1] }]),
        action("fl-open-mystery", "Tell guests the volcano is 'not available to everyone' and let scarcity work.", "Sales climb and trust falls into the cheese.", [4, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("kitchen", "Chef Renata sees a photo and says the volcano is a structural crime", "The kitchen can make something close, but it will slow everything and stain the plates orange.", "tasha", "Chef Renata wants to know whether the menu is led by chefs or by teenagers with ring lights.", [
        action("fl-kitchen-no", "Let Renata kill the item and protect the actual menu.", "The kitchen trusts you. The dining room booing is audible from the dish pit.", [-2, -1, 2, { tasha: [2, 3], priya: [1, 1], jake: [-1, -1] }]),
        action("fl-kitchen-test", "Authorize one test batch with a hard stop if tickets back up.", "It is disciplined chaos until everyone argues about what counts as back up.", [1, 1, 0, { tasha: [0, 1], nina: [1, 1], marcus: [-1, 0] }]),
        action("fl-kitchen-fullsend", "Make the volcano real for tonight only.", "The room erupts. So does the ticket printer.", [4, -3, -3, { tasha: [-3, -4], priya: [-2, -3], marcus: [-1, -1] }])
      ]),
      beat("safety", "One guest asks whether the lava is supposed to smoke", "It is steam. Probably. The table has already named it Mount Feast.", "priya", "Imani says the line needs a safety answer before novelty outruns basic competence.", [
        action("fl-safety-stop", "Stop selling volcanoes until the process is tested and plated safely.", "You look responsible and kill the rush of hype at the worst possible moment.", [-2, 1, 3, { priya: [2, 3], tasha: [1, 1] }]),
        action("fl-safety-script", "Keep selling but require a server script and manager check on each order.", "It slows the danger without fully stopping the circus.", [1, 0, 1, { priya: [1, 1], nina: [0, 1], jake: [-1, 0] }]),
        action("fl-safety-waiver", "Make guests jokingly sign a 'lava waiver.'", "Funny for thirty seconds, terrifying in screenshots forever.", [2, -2, -4, { priya: [-2, -3], elena: [-2, -3] }])
      ]),
      beat("rival", "Food Heaven posts that their volcano has 'real lava energy'", "Now the fake secret menu item has become a fake arms race.", "jake", "Adrian wants to win the attention war without turning dinner into a dare.", [
        action("fl-rival-ignore", "Ignore Food Heaven and redirect the room to Feast Haven's real strengths.", "Mature, safe, and deeply unsatisfying to everyone holding a phone.", [-1, 1, 2, { jake: [-1, 0], elena: [1, 1] }]),
        action("fl-rival-classy", "Post a chef-led version that makes the joke look polished, not desperate.", "You compete without looking feral, though the kitchen pays for the polish.", [2, 1, 1, { jake: [1, 2], tasha: [-1, -1] }]),
        action("fl-rival-war", "Start a volcano challenge and dare Food Heaven to match it.", "The internet is thrilled. Your insurance agent develops a twitch.", [4, -2, -4, { jake: [2, 1], elena: [-2, -3], tasha: [-2, -2] }])
      ]),
      beat("final", "Guests now expect secret menu chaos every week", "If you shut it down, you lose momentum. If you feed it, the menu becomes a rumor hostage.", "elena", "Marisol says the brand needs a boundary that still lets Feast Haven feel alive.", [
        action("fl-final-seasonal", "Create a controlled monthly off-menu feature chosen by the kitchen.", "You turn chaos into structure without killing fun.", [2, 2, 2, { elena: [2, 2], tasha: [1, 1], nina: [1, 1] }]),
        action("fl-final-ban", "Ban secret menu language completely.", "Clear, protective, and likely to make students invent a worse one by lunch.", [-1, 0, 1, { elena: [1, 1], jake: [-2, -2], nina: [-1, -1] }]),
        action("fl-final-chase", "Keep chasing whatever TikTok invents next.", "The money is loud. The operation is louder.", [4, -3, -4, { elena: [-2, -3], tasha: [-3, -4], marcus: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "proposal-breakup-cake",
    category: "Romance Catastrophe",
    pressure: "Extreme",
    headline: "A proposal cake is delivered to the wrong table, where a couple is actively breaking up",
    body:
      "The cake says 'Say Yes Forever.' The woman at the table says 'This is exactly the problem.' The actual proposer is watching from across the room.",
    beats: [
      beat("opening", "Two relationships are now on fire and one has frosting", "The room is silent in the way rooms get silent right before becoming evidence.", "devon", "Parker says speed matters, but the wrong apology could ruin two tables at once.", [
        action("pc-open-swap", "Remove the cake fast and apologize privately to both tables.", "You reduce spectacle but make the breakup table feel handled like a spill.", [-1, 0, 2, { devon: [1, 2], elena: [1, 1] }]),
        action("pc-open-own", "Publicly own the mistake before anyone invents a worse story.", "Honest, brave, and maybe exactly the public humiliation nobody asked for.", [0, -1, 1, { devon: [1, 1], jake: [-1, -1] }]),
        action("pc-open-comp", "Comp both tables immediately and let money apologize first.", "It buys time, but now every person in the room knows disaster has a menu price.", [-3, 1, 0, { devon: [0, 1], marcus: [-1, -1] }])
      ]),
      beat("proposer", "The actual proposer wants the moment rebuilt right now", "He is pale, holding a ring, and asking whether the kitchen can 'reset romance.'", "jake", "Adrian wants to save the sale and the story, but the room is already emotionally bruised.", [
        action("pc-proposer-delay", "Delay the proposal setup and rebuild it away from the breakup table.", "You protect the moment, but the proposer feels like romance is on hold with the apps.", [-1, 1, 2, { jake: [1, 2], elena: [1, 1] }]),
        action("pc-proposer-now", "Help him propose now and ride the emotional whiplash.", "If she says yes, legendary. If not, Feast Haven becomes a romance crime scene.", [3, -2, -3, { jake: [1, 0], devon: [-2, -2] }]),
        action("pc-proposer-cancel", "Encourage him to postpone entirely and protect the relationship from the room.", "Wise and possibly devastating to tonight's bill.", [-2, 2, 2, { jake: [-1, -1], devon: [2, 2] }])
      ]),
      beat("breakup", "The breakup table says Feast Haven made the breakup worse", "They want the cake boxed, comped, and possibly used as legal symbolism.", "nina", "Celia says the floor needs compassion without making the restaurant responsible for the relationship.", [
        action("pc-breakup-care", "Comp dessert, apologize, and give them a quiet exit path.", "It is humane and expensive, and it keeps the table from becoming a stage.", [-2, 2, 2, { nina: [2, 2], devon: [1, 1] }]),
        action("pc-breakup-boundary", "Apologize for the cake but do not comp the whole meal.", "Fair on paper, emotionally flammable in person.", [0, -2, -1, { nina: [-1, -2], elena: [0, -1] }]),
        action("pc-breakup-joke", "Offer to change the frosting to 'Say No Forever' as a tension breaker.", "One person laughs. Unfortunately, not the person paying.", [1, -3, -4, { nina: [-3, -4], jake: [1, 0] }])
      ]),
      beat("staff", "The pastry cook insists the ticket was unreadable", "Front of house blames kitchen. Kitchen blames handwriting. Romance blames everyone.", "tasha", "Chef Renata wants the staff conflict handled before every special occasion order becomes a booby trap.", [
        action("pc-staff-system", "Create a manager verification rule for all celebration messages tonight.", "It slows service and prevents frosting-based tragedy.", [-1, 2, 3, { tasha: [1, 2], nina: [1, 1], devon: [1, 1] }]),
        action("pc-staff-blame", "Find the single person who misread the ticket and make the lesson clear.", "Fast accountability can become lazy justice.", [0, -2, -2, { tasha: [-1, -2], nina: [-2, -3] }]),
        action("pc-staff-move", "Tell everyone to move on because the guests need recovery, not a staff trial.", "The room steadies while the actual system stays cursed.", [1, 0, -2, { tasha: [-1, -1], devon: [1, 0] }])
      ]),
      beat("final", "Both tables are waiting for the final gesture", "One wants dignity. One wants magic. The staff want cake tickets written in block letters forever.", "elena", "Marisol says Feast Haven can end this as a story about care, chaos, or cowardice.", [
        action("pc-final-private", "Give each table a separate private recovery gesture and keep the room out of it.", "Not viral, not cheap, and probably the most adult ending available.", [-2, 3, 3, { elena: [2, 3], devon: [1, 1] }]),
        action("pc-final-toast", "Offer a gentle public toast about love, timing, and restaurant humility.", "It could heal the room or make everyone wish the floor would open.", [1, 0, -1, { elena: [1, 0], jake: [1, 0] }]),
        action("pc-final-freecake", "Send free celebration cakes to nearby tables as a goodwill splash.", "The room enjoys dessert. The staff learns mistakes multiply into free labor.", [-3, 1, -1, { elena: [-1, -1], tasha: [-2, -2], marcus: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "clown-convention-brunch",
    category: "Group Booking Chaos",
    pressure: "Absurd",
    headline: "A clown convention booked brunch under a normal name and now the lobby is full of honking shoes",
    body:
      "Forty professional clowns have arrived for omelets. A child's birthday party is also here. Nobody knows if this is a blessing, a lawsuit, or both.",
    beats: [
      beat("opening", "The lobby sounds like a bicycle horn avalanche", "Some kids are delighted, some are crying, and adults cannot tell which clowns are guests.", "elena", "Marisol says the host stand needs order before brunch becomes a parade route.", [
        action("cc-open-zone", "Separate the clown group and birthday party into clear zones.", "It reduces confusion, though it makes the dining room look like a treaty map.", [-1, 2, 2, { elena: [2, 2], marcus: [1, 1] }]),
        action("cc-open-embrace", "Welcome the chaos and announce a surprise circus brunch.", "The energy explodes, and so does the seating plan.", [3, 1, -3, { elena: [-1, -2], jake: [2, 1], devon: [-1, -1] }]),
        action("cc-open-limit", "Ask the clowns to remove props inside the dining room.", "Reasonable, safe, and received like you banned joy.", [0, -2, 1, { elena: [1, 1], jake: [-1, -1] }])
      ]),
      beat("birthday", "The birthday child thinks the clowns were hired for him", "His parents did not pay for this and are now wondering if they should be grateful or terrified.", "devon", "Parker says the birthday table needs clarity without making the child feel rejected by forty strangers.", [
        action("cc-birthday-gift", "Offer a small staff-led birthday moment separate from the clowns.", "It protects the child and keeps the clowns from unionizing the song.", [-1, 2, 2, { devon: [2, 2], elena: [1, 1] }]),
        action("cc-birthday-clowns", "Ask two clowns to join the birthday song with strict limits.", "Magical if controlled, horrifying if one pulls out a trombone.", [2, 1, -1, { devon: [0, 1], jake: [1, 1], marcus: [-1, -1] }]),
        action("cc-birthday-ignore", "Do nothing and hope the family treats it as bonus entertainment.", "They treat it as unpaid chaos with balloons.", [1, -2, -3, { devon: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("kitchen", "Chef Renata says clown orders are destroying ticket flow", "Every ticket says 'extra silly' and one clown asked for a pancake shaped like regret.", "tasha", "Chef Renata needs a menu boundary before the kitchen becomes an improv troupe.", [
        action("cc-kitchen-fixed", "Move the clown group to a fixed brunch menu immediately.", "The line stabilizes, but the clowns start reviewing the word 'fixed.'", [0, 1, 2, { tasha: [2, 3], priya: [1, 1] }]),
        action("cc-kitchen-custom", "Allow custom clown orders because the ticket average is huge.", "Revenue climbs while the kitchen's last nerve puts on a tiny hat and leaves.", [4, -3, -3, { tasha: [-3, -4], priya: [-2, -3] }]),
        action("cc-kitchen-feature", "Create one silly special that satisfies the bit without customizing everything.", "It is clever, but still adds one more weird plate during rush.", [2, 1, 0, { tasha: [0, 1], jake: [1, 1] }])
      ]),
      beat("complaints", "Regular brunch guests say the room has become too much", "One table asks if mimosas are cheaper because they include clown trauma.", "nina", "Celia says staff need a way to protect normal guests without insulting paying clowns.", [
        action("cc-complaints-comp", "Offer quiet comps to the most disrupted tables.", "It buys peace and bleeds money in tiny brunch cuts.", [-3, 2, 1, { nina: [1, 2], marcus: [-1, -1] }]),
        action("cc-complaints-move", "Move upset tables to the calmest section and reset pacing.", "It is operationally hard but fair.", [-1, 2, 2, { nina: [2, 2], devon: [1, 1], marcus: [-1, 0] }]),
        action("cc-complaints-joke", "Make light jokes about the unexpected entertainment.", "Some guests laugh. Others wanted eggs, not coping strategies.", [1, -2, -2, { nina: [-1, -2], elena: [-1, -1] }])
      ]),
      beat("final", "The clowns want to book monthly", "They tip well, disrupt everything, and may be the most loyal nightmare Feast Haven has ever had.", "marcus", "Omar says support staff deserve a vote before brunch becomes honk-based forever.", [
        action("cc-final-private", "Offer private-room clown brunch only with strict booking terms.", "It keeps the money and contains the honking.", [2, 2, 2, { marcus: [2, 2], elena: [1, 1], tasha: [1, 1] }]),
        action("cc-final-decline", "Decline future clown convention bookings during public brunch.", "Morale rises, revenue sighs dramatically.", [-2, 1, 1, { marcus: [1, 2], tasha: [2, 2], jake: [-1, -1] }]),
        action("cc-final-theme", "Launch monthly Circus Brunch for the cash.", "The money is real. So are the staff resignation jokes.", [4, -3, -4, { marcus: [-3, -4], tasha: [-2, -3], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "goose-sous-chef",
    category: "Kitchen Animal",
    pressure: "Absurd",
    headline: "Chef Renata adopts a goose she calls Sous-Goose and claims it improves kitchen discipline",
    body:
      "The goose wears a tiny neckerchief, hates Theo, and has already chased a delivery driver into the basil.",
    beats: [
      beat("opening", "There is a goose in the prep area", "Chef Renata says it is emotional support. The goose says nothing, but with menace.", "tasha", "Chef Renata insists the goose has lowered lateness by creating fear-based punctuality.", [
        action("gs-open-remove", "Remove the goose from food areas immediately.", "Food safety improves. Chef Renata looks betrayed by both you and nature.", [0, -1, 3, { tasha: [-2, -3], priya: [1, 1], luis: [1, 1] }]),
        action("gs-open-office", "Move Sous-Goose to the office while you decide policy.", "A compromise until the office printer becomes territorial.", [0, 0, 1, { tasha: [0, 1], marcus: [-1, -1] }]),
        action("gs-open-allow", "Let the goose stay for one shift because morale is weirdly up.", "The kitchen moves faster, mostly away from the goose.", [2, 1, -3, { tasha: [2, 1], luis: [-2, -3], marcus: [-1, -1] }])
      ]),
      beat("incident", "Sous-Goose bites Theo during a rush", "Theo says it was intentional. The goose maintains eye contact.", "luis", "Theo wants leadership to admit a goose cannot be a supervisor.", [
        action("gs-incident-care", "Document the bite, treat Theo, and remove the goose from service.", "Correct, expensive, and deeply humiliating to write on a form.", [-1, 2, 3, { luis: [2, 3], tasha: [-1, -2] }]),
        action("gs-incident-joke", "Call it a 'performance review peck' and keep service moving.", "The line laughs until Theo stops laughing.", [2, -3, -3, { luis: [-4, -4], tasha: [1, 0] }]),
        action("gs-incident-talk", "Make Chef Renata apologize and explain the goose boundaries herself.", "It forces ownership, but Renata may defend the bird like family.", [0, 0, 1, { luis: [1, 1], tasha: [-1, -1] }])
      ]),
      beat("health", "A health inspector arrives and locks eyes with Sous-Goose", "The inspector has seen things. Not this.", "priya", "Imani says the restaurant needs truth, speed, and zero bird-related improvisation.", [
        action("gs-health-honest", "Disclose the goose incident and show immediate corrective action.", "It is embarrassing and survivable if the action is real.", [-1, 1, 3, { priya: [2, 3], tasha: [-1, -1] }]),
        action("gs-health-hide", "Hide the goose in the alley until inspection ends.", "The goose honks. The alley echoes. Truth returns with feathers.", [1, -3, -4, { priya: [-3, -4], elena: [-2, -2] }]),
        action("gs-health-office", "Claim the goose is an office visitor and keep it away from food.", "Technically better, morally slippery, and still very much a goose.", [0, -1, -1, { priya: [-1, -2], marcus: [-1, -1] }])
      ]),
      beat("staff", "Half the kitchen wants the goose gone; half wants merch", "Someone has already designed a Sous-Goose sticker.", "jake", "Adrian thinks the story could be funny if it stops being operationally insane.", [
        action("gs-staff-merch", "Retire the goose from service but sell one charity sticker.", "You preserve the joke without keeping the hazard.", [2, 2, 1, { jake: [2, 2], tasha: [0, 1], luis: [1, 1] }]),
        action("gs-staff-ban", "Ban goose merch and all bird jokes until trust recovers.", "Serious, safe, and somehow makes the goose more legendary.", [-1, 0, 1, { jake: [-2, -2], luis: [1, 1] }]),
        action("gs-staff-mascot", "Make Sous-Goose the unofficial kitchen mascot outside service hours.", "Morale spikes until someone asks who cleans mascot droppings.", [2, 0, -2, { jake: [1, 1], marcus: [-2, -2], priya: [-1, -1] }])
      ]),
      beat("final", "Chef Renata asks to keep the goose as a personal inspiration animal", "The staff is waiting to see whether talent lets people ignore obvious boundaries.", "devon", "Parker says this is now less about birds and more about whether rules apply to stars.", [
        action("gs-final-boundary", "Respect Renata, ban animals from operations, and give her another support plan.", "It is firm without making her the villain.", [0, 3, 4, { devon: [2, 3], tasha: [0, 1], luis: [1, 1] }]),
        action("gs-final-exception", "Allow Renata a limited non-service goose exception.", "You keep your chef happy and teach everyone exceptions wear feathers.", [2, -2, -3, { devon: [-2, -3], luis: [-2, -3], priya: [-1, -2] }]),
        action("gs-final-firebird", "Tell Renata the goose leaves or she does.", "Clear, dramatic, and possibly self-destructive if she calls it.", [-3, -2, 1, { tasha: [-4, -4], priya: [-1, -1], luis: [1, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "espresso-machine-screams",
    category: "Haunted Equipment",
    pressure: "High",
    headline: "The espresso machine starts making human-sounding screams every time someone orders a latte",
    body:
      "Maintenance says it is probably steam pressure. Guests say it is definitely a ghost named Kevin.",
    beats: [
      beat("opening", "The cafe station is screaming", "Every latte sounds like a tiny haunted opera and brunch is choosing sides.", "nina", "Celia says servers need one explanation before guests start asking whether decaf is cursed.", [
        action("em-open-stop", "Stop espresso drinks until maintenance checks it.", "Safe and costly, especially with half the room holding brunch menus.", [-2, 1, 3, { nina: [1, 2], priya: [1, 1] }]),
        action("em-open-joke", "Tell guests the machine is dramatic but safe while you monitor it.", "The joke lands until the next cappuccino sounds like a lawsuit.", [2, 0, -2, { nina: [1, 1], elena: [-1, -1] }]),
        action("em-open-kevin", "Name the ghost Kevin and sell 'Haunted Lattes.'", "Revenue jumps. Credibility gets dragged into the spirit realm.", [4, -1, -4, { nina: [2, 1], elena: [-2, -3], tasha: [-1, -1] }])
      ]),
      beat("maintenance", "The repair tech says it might be unsafe, or might just need a part", "The machine screams during the word 'unsafe.'", "marcus", "Omar says support staff are tired of cleaning around equipment that sounds like it is begging.", [
        action("em-maintenance-part", "Shut it down and order the part immediately.", "The boring choice protects everyone and murders coffee revenue.", [-3, 1, 3, { marcus: [2, 3], nina: [0, 1] }]),
        action("em-maintenance-window", "Run espresso only during short monitored windows.", "It balances money and risk until Kevin hits a high note during dessert.", [1, 0, -1, { marcus: [0, 1], nina: [1, 0], elena: [-1, -1] }]),
        action("em-maintenance-ignore", "Keep using it because the tech did not say definitely unsafe.", "That is a very expensive way to interpret uncertainty.", [3, -3, -4, { marcus: [-3, -4], nina: [-2, -2] }])
      ]),
      beat("guest", "A guest claims the scream triggered their anxiety and wants the whole meal comped", "Another table asks if Kevin can scream happy birthday.", "devon", "Parker says the response must respect discomfort without rewarding every supernatural invoice.", [
        action("em-guest-care", "Comp the affected guest's drinks and move them to a quieter section.", "Reasonable, humane, and still leaves Kevin unsolved.", [-1, 2, 2, { devon: [2, 2], nina: [1, 1] }]),
        action("em-guest-fullcomp", "Comp the whole meal to keep the complaint from spreading.", "It buys silence from one table and teaches the rest to fear-order espresso.", [-4, 1, 0, { devon: [0, 1], marcus: [-1, -1] }]),
        action("em-guest-refuse", "Refuse the comp because the machine noise was disclosed.", "Technically clean, emotionally haunted.", [1, -2, -2, { devon: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("marketing", "The haunted latte clip hits 80,000 views", "People are showing up just to hear Kevin scream into foam.", "jake", "Adrian wants to capture the wave without turning Feast Haven into a ghost cafe.", [
        action("em-marketing-retire", "Post that Kevin is retiring for safety and invite guests back for normal coffee.", "Responsible, mildly charming, and less profitable than a ghost.", [-1, 2, 3, { jake: [0, 1], elena: [1, 1] }]),
        action("em-marketing-limited", "Run one final inspected Haunted Latte hour before shutdown.", "It is contained spectacle with a real chance of looking reckless.", [2, 0, -1, { jake: [2, 1], marcus: [-1, -1] }]),
        action("em-marketing-merch", "Sell Kevin stickers while the machine keeps screaming.", "The internet loves it. The repair tech stops making eye contact.", [3, -2, -4, { jake: [2, 1], marcus: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "The machine finally dies mid-scream", "The room applauds. Staff are unsure whether to clap or evacuate.", "elena", "Marisol says the final story needs to protect both safety and the restaurant's sense of humor.", [
        action("em-final-replace", "Replace the machine and make Kevin a one-night legend.", "Clean ending, big cost, good story.", [-2, 3, 4, { elena: [2, 3], nina: [1, 1], marcus: [1, 1] }]),
        action("em-final-repair", "Repair the old machine and keep costs down.", "Financially sensible, emotionally suspicious.", [1, 0, -1, { marcus: [1, 1], nina: [-1, -1] }]),
        action("em-final-display", "Put the dead machine in the lobby as Kevin's shrine.", "Funny, viral, and deeply confusing for a restaurant trying to look premium.", [2, -1, -3, { elena: [-2, -3], jake: [1, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "mystery-caviar-sprinkles",
    category: "Luxury Mistake",
    pressure: "Extreme",
    headline: "A server accidentally serves $3,000 caviar to a kids table as 'fancy sprinkles'",
    body:
      "The children loved it. The parents think it was included. Chef Renata is staring at the empty tin like it owed her money.",
    beats: [
      beat("opening", "The most expensive mistake in the room is on chicken fingers", "The kids are asking for more black sprinkles and the kitchen is losing oxygen.", "nina", "Celia says the table needs an answer before anyone sees the actual invoice.", [
        action("mc-open-own", "Own the mistake and do not charge the family for the caviar.", "Ethically clean, financially painful, and the kids still want seconds.", [-4, 2, 3, { nina: [2, 2], tasha: [-1, -1] }]),
        action("mc-open-split", "Explain the error and ask the parents to cover a small portion.", "Reasonable to accounting, awkward to humans who ordered nuggets.", [-2, -1, 0, { nina: [-1, -1], marcus: [1, 1] }]),
        action("mc-open-hide", "Pretend it was a chef surprise and absorb it quietly.", "The table is delighted, but the staff learns luxury inventory can vanish into vibes.", [-3, 1, -2, { nina: [0, 1], tasha: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("kitchen", "Chef Renata demands a culprit and a lockbox", "The line is now treating every garnish like jewelry.", "tasha", "Chef Renata wants accountability before the next mistake becomes truffle crayons.", [
        action("mc-kitchen-system", "Create a luxury-item signout system immediately.", "The kitchen feels protected and the line slows down around paperwork.", [-1, 1, 3, { tasha: [2, 3], priya: [1, 1], marcus: [1, 1] }]),
        action("mc-kitchen-blame", "Identify the server mistake and discipline it hard.", "Fast accountability may miss why the tin was reachable at all.", [0, -2, -2, { tasha: [0, 1], nina: [-3, -4] }]),
        action("mc-kitchen-lock", "Lock all premium ingredients away for manager approval.", "Safe, slow, and likely to make dinner service feel like a bank heist.", [-2, 0, 2, { tasha: [1, 1], jake: [-1, -1], priya: [-1, 0] }])
      ]),
      beat("parents", "The parents post that Feast Haven gives children caviar", "The comments are half impressed and half furious about pricing.", "jake", "Adrian wants the public angle handled before luxury mistake becomes brand identity.", [
        action("mc-parents-humble", "Reply that it was a mistake, the family was not charged, and controls are changing.", "Transparent, mature, and not especially glamorous.", [0, 2, 3, { jake: [1, 2], elena: [1, 1] }]),
        action("mc-parents-luxury", "Frame it as an accidental example of Feast Haven hospitality.", "Sounds premium until people ask if all mistakes are this unequal.", [2, 0, -2, { jake: [2, 1], marcus: [-1, -1] }]),
        action("mc-parents-silence", "Do not respond and let the story stay cute.", "Cute curdles fast when the price leaks.", [1, -2, -3, { jake: [-1, -2], elena: [-1, -2] }])
      ]),
      beat("inventory", "Omar finds two more premium items stored casually", "Apparently the saffron has been living next to crayons for a week.", "marcus", "Omar says support staff cannot protect expensive inventory if nobody tells them what counts as expensive.", [
        action("mc-inventory-train", "Train all staff on high-value inventory and storage rules.", "It costs time and prevents very dumb future losses.", [-1, 2, 3, { marcus: [2, 3], tasha: [1, 1], nina: [1, 1] }]),
        action("mc-inventory-managers", "Restrict premium storage knowledge to managers only.", "Control increases and trust decreases.", [0, -1, 1, { marcus: [-1, -2], tasha: [1, 1], nina: [-1, -1] }]),
        action("mc-inventory-delay", "Wait until after service to avoid derailing the night.", "Revenue survives while the next expensive mistake waits patiently.", [2, -1, -2, { marcus: [-2, -3], tasha: [-1, -1] }])
      ]),
      beat("final", "A food blogger asks to order 'the kids caviar experience'", "This could become a profitable luxury joke or the worst lesson possible.", "elena", "Marisol says the final choice decides whether Feast Haven learns discipline or monetizes its own mistake.", [
        action("mc-final-controlled", "Create a real premium tasting add-on with clear pricing and adult presentation.", "You turn the accident into a controlled product without insulting the lesson.", [3, 2, 2, { elena: [2, 2], tasha: [1, 1], marcus: [1, 1] }]),
        action("mc-final-no", "Refuse to monetize the mistake and focus on fixing process.", "Principled, less fun, and safer for trust.", [-1, 2, 3, { elena: [1, 2], tasha: [2, 2] }]),
        action("mc-final-kids", "Launch a playful 'fancy sprinkles' kids upgrade.", "Money arrives wearing a tiny tuxedo and carrying reputational dynamite.", [4, -3, -4, { elena: [-2, -3], tasha: [-2, -3], marcus: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "food-heaven-drone",
    category: "Rival Sabotage",
    pressure: "Extreme",
    headline: "Food Heaven's promo drone hovers outside the window dropping coupons onto Feast Haven tables",
    body:
      "The drone is tiny, smug, and somehow playing smooth jazz. Guests are catching rival coupons between courses.",
    beats: [
      beat("opening", "A drone is coupon-bombing the dining room", "The window tables are ducking. One guest has started folding coupons into little planes.", "elena", "Marisol says the room needs calm before Feast Haven looks bullied by a flying toaster.", [
        action("fd-open-move", "Move window tables and explain the disruption plainly.", "You protect guests, but the rival visibly owns the window.", [-1, 2, 1, { elena: [2, 2], devon: [1, 1] }]),
        action("fd-open-ignore", "Keep service normal and avoid giving the drone power.", "That sounds strong until a coupon lands in the soup.", [2, -2, -3, { elena: [-1, -2], nina: [-1, -1] }]),
        action("fd-open-show", "Turn it into a joke and offer to match coupons for affected tables.", "Guests laugh. Margins cry. Food Heaven gets exactly the chaos it wanted.", [-2, 1, -1, { elena: [1, 1], jake: [2, 1], marcus: [-2, -2] }])
      ]),
      beat("staff", "Theo wants to knock the drone down with a baguette", "The staff are ranking throwable breads by accuracy.", "luis", "Theo says dignity requires action. HR would probably phrase it differently.", [
        action("fd-staff-stop", "Tell staff nobody throws anything and document the incident.", "Mature, legal, and painfully unsatisfying.", [0, 0, 3, { luis: [-1, 0], marcus: [1, 2], elena: [1, 1] }]),
        action("fd-staff-bread", "Let Theo wave a baguette near the window as a warning.", "Morale spikes for fourteen seconds and liability wakes up angry.", [1, 1, -3, { luis: [2, 1], elena: [-2, -2], marcus: [-1, -2] }]),
        action("fd-staff-capture", "Have staff film the drone calmly as evidence.", "Less satisfying than bread, much more useful later.", [0, 1, 2, { luis: [0, 1], elena: [1, 1], jake: [1, 1] }])
      ]),
      beat("guests", "Guests ask if Feast Haven will honor the rival coupons", "The coupons say 'Escape to Food Heaven.' Subtlety is dead.", "jake", "Adrian wants to keep guests from literally leaving with appetizers still warm.", [
        action("fd-guests-match", "Match the coupon only for tables directly disrupted by the drone.", "Expensive but targeted, and it keeps guests in seats.", [-2, 2, 1, { jake: [2, 2], marcus: [-1, -1] }]),
        action("fd-guests-refuse", "Refuse to honor rival coupons on principle.", "Dignified and possibly followed by empty tables.", [0, -2, 0, { jake: [-1, -2], elena: [1, 1] }]),
        action("fd-guests-counter", "Offer a smaller Feast Haven loyalty perk instead.", "Balanced, but some guests will compare math mid-bite.", [-1, 1, 1, { jake: [1, 1], marcus: [0, 1] }])
      ]),
      beat("rival", "Food Heaven denies responsibility while the drone still says Food Heaven", "Their manager calls it 'an autonomous enthusiasm device.'", "marcus", "Omar says the next move should protect the business without turning staff into mall cops.", [
        action("fd-rival-formal", "Send formal notice and preserve video evidence.", "Slow, strong, and less fun than launching a soup cannon.", [0, 0, 3, { marcus: [2, 3], elena: [1, 1] }]),
        action("fd-rival-public", "Publicly call out Food Heaven with the footage.", "It rallies fans and escalates the war at the same time.", [2, 0, -1, { marcus: [0, 1], jake: [2, 1], elena: [-1, -1] }]),
        action("fd-rival-prank", "Send a staff member across the street in a fake mustache with Feast Haven coupons.", "Hilarious, petty, and impossible to defend in a meeting.", [2, -2, -4, { marcus: [-2, -3], elena: [-2, -3], jake: [1, 0] }])
      ]),
      beat("final", "The drone battery dies and lands in the patio fountain", "Guests cheer. Someone asks if Feast Haven planned the finale.", "devon", "Parker says the ending should make Feast Haven look composed, not merely luckier than a drone battery.", [
        action("fd-final-classy", "Thank guests for patience, document everything, and avoid gloating.", "Classy, stable, and unlikely to trend.", [0, 2, 3, { devon: [2, 2], elena: [1, 1], marcus: [1, 1] }]),
        action("fd-final-charity", "Turn the recovered drone into a charity auction joke.", "Funny, positive, and still a little poking-the-rival-bear.", [2, 2, 1, { devon: [1, 2], jake: [1, 1], marcus: [0, 1] }]),
        action("fd-final-trophy", "Mount the drone behind the bar as a war trophy.", "The staff loves it. Legal probably does not.", [2, -1, -3, { devon: [-1, -1], elena: [-2, -3], jake: [2, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "celebrity-impersonator-fight",
    category: "Identity Circus",
    pressure: "High",
    headline: "Two different celebrity impersonators arrive claiming Feast Haven promised them the same VIP table",
    body:
      "One is a fake Elvis. One is a fake Gordon Ramsay. Neither is famous, both are furious, and guests think this is planned entertainment.",
    beats: [
      beat("opening", "The lobby has become a fame-adjacent argument", "Fake Elvis is pointing at fake Gordon with a breadstick. Fake Gordon is insulting the garnish.", "elena", "Marisol says the first decision determines whether this is a booking issue or a dinner-theater incident.", [
        action("ci-open-separate", "Separate both impersonators and verify who actually booked.", "Order improves while guests boo the loss of free entertainment.", [-1, 1, 2, { elena: [2, 2], devon: [1, 1] }]),
        action("ci-open-play", "Treat it like surprise entertainment while checking the reservation.", "The room loves it until the fake insults get personal.", [3, 1, -2, { elena: [-1, -1], jake: [2, 1] }]),
        action("ci-open-table", "Seat them together and hope comedy solves logistics.", "Comedy solves nothing. It multiplies with accents.", [2, -2, -3, { elena: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("reservation", "Both have screenshots that look almost real", "One screenshot says 'VIP-ish.' The other uses three fire emojis as confirmation.", "marcus", "Omar says the paperwork is so fake it may have achieved honesty by accident.", [
        action("ci-reservation-proof", "Require deposit proof before giving either VIP treatment.", "Fair, defensible, and wildly unpopular with men in costume.", [0, -1, 2, { marcus: [2, 2], elena: [1, 1] }]),
        action("ci-reservation-split", "Split one VIP setup into two smaller experiences.", "It keeps both in-house and makes actual VIP mean almost nothing.", [2, 0, -2, { marcus: [-1, -1], jake: [1, 1] }]),
        action("ci-reservation-comp", "Comp both appetizers while you investigate.", "Peace arrives covered in margin loss.", [-3, 1, 0, { marcus: [-1, -1], nina: [1, 1] }])
      ]),
      beat("kitchen", "Fake Gordon walks into the kitchen to critique risotto", "Chef Renata has stopped blinking.", "tasha", "Chef Renata wants the kitchen protected from strangers doing premium cable cosplay.", [
        action("ci-kitchen-eject", "Remove fake Gordon from the kitchen immediately.", "The kitchen trusts you. The dining room loses a subplot.", [0, 1, 2, { tasha: [2, 3], priya: [1, 1] }]),
        action("ci-kitchen-photo", "Allow one controlled kitchen photo, then remove him.", "It buys cooperation and irritates everyone with standards.", [1, 0, -1, { tasha: [-1, -2], jake: [1, 1] }]),
        action("ci-kitchen-bit", "Let Chef Renata roast him back for the room.", "Iconic, viral, and one sentence from a guest complaint.", [3, 0, -3, { tasha: [2, 1], elena: [-2, -2] }])
      ]),
      beat("floor", "Fake Elvis starts singing apologies to nearby tables", "It is either charming recovery or a hostage concert.", "nina", "Celia says the floor needs a volume limit before every table becomes part of the show.", [
        action("ci-floor-limit", "Set a strict one-song limit and comp affected drinks only if needed.", "Structured, fair, and still surreal.", [1, 1, 2, { nina: [2, 2], devon: [1, 1] }]),
        action("ci-floor-let", "Let the song finish because guests are recording and smiling.", "The clip does well. The quiet anniversary table does not.", [2, -1, -2, { nina: [-1, -1], elena: [-1, -1] }]),
        action("ci-floor-stop", "Stop the song mid-chorus.", "Efficient, icy, and somehow makes you the villain in an Elvis conflict.", [0, -2, 0, { nina: [-1, -2], jake: [-1, -1] }])
      ]),
      beat("final", "Both impersonators offer to return monthly as 'Feast Haven Legends Night'", "The numbers could work. So could a migraine.", "jake", "Adrian says the restaurant can either package the weird or protect the brand from fake celebrity gravity.", [
        action("ci-final-curated", "Offer one curated theme night with contracts, deposits, and volume rules.", "You monetize the chaos with guardrails.", [3, 2, 1, { jake: [2, 2], elena: [1, 1], tasha: [0, 1] }]),
        action("ci-final-decline", "Decline future impersonator events and protect normal dining.", "Calm returns. So does slightly less money.", [-1, 1, 2, { jake: [-1, -1], elena: [1, 2], tasha: [1, 1] }]),
        action("ci-final-open", "Book a full celebrity impersonator series immediately.", "The calendar fills and brand dignity leaves through the emergency exit.", [4, -3, -4, { jake: [1, 1], elena: [-3, -4], tasha: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "glitter-bomb-reviewer",
    category: "Reviewer Meltdown",
    pressure: "Extreme",
    headline: "A one-star reviewer opens a complaint envelope and accidentally glitter-bombs the host stand",
    body:
      "He says he mailed it as a metaphor. Now Marisol is sparkling with rage and the lobby looks like a cursed craft store.",
    beats: [
      beat("opening", "The host stand is glittering like a crime scene", "Guests are coughing, filming, and asking if this is part of the Feast Haven aesthetic.", "elena", "Marisol wants the reviewer removed, the lobby cleaned, and someone to acknowledge that glitter is forever.", [
        action("gb-open-remove", "Remove the reviewer calmly and start cleanup immediately.", "Safe and firm, but the reviewer says you are silencing feedback.", [-1, 1, 2, { elena: [2, 3], marcus: [1, 1] }]),
        action("gb-open-listen", "Let the reviewer explain while staff clean around him.", "It looks open-minded and feels like making staff sweep humiliation.", [0, -2, -2, { elena: [-3, -4], marcus: [-1, -1] }]),
        action("gb-open-joke", "Make a joke about adding sparkle to service recovery.", "Some guests laugh. Marisol does not, and she controls the front door.", [1, -1, -3, { elena: [-4, -4], jake: [1, 0] }])
      ]),
      beat("cleanup", "Omar says glitter has entered the reservation keyboard", "Every keystroke now looks festive and expensive.", "marcus", "Omar says support work cannot be treated like magic just because the mess is funny.", [
        action("gb-clean-close", "Temporarily close the host stand and clean it properly.", "It slows seating and proves hidden labor matters.", [-2, 1, 3, { marcus: [2, 3], elena: [1, 1] }]),
        action("gb-clean-wipe", "Do a fast visible wipe-down and keep seating.", "The lobby moves and glitter migrates into every future decision.", [2, -2, -2, { marcus: [-3, -4], elena: [-1, -1] }]),
        action("gb-clean-team", "Pull extra staff to help cleanup before service collapses.", "It protects the front but steals hands from the floor.", [-1, 0, 2, { marcus: [2, 2], nina: [-1, -1], jake: [-1, 0] }])
      ]),
      beat("reviewer", "The reviewer wants to discuss his original complaint now", "Apparently the glitter was about soup temperature and emotional neglect.", "devon", "Parker says bad behavior cannot erase a legitimate complaint if one exists.", [
        action("gb-reviewer-boundary", "Hear the complaint after setting a clear boundary about the glitter incident.", "It is fair and exhausting in exactly the adult way.", [0, 2, 3, { devon: [2, 3], elena: [1, 1] }]),
        action("gb-reviewer-ban", "Ban him immediately and refuse to discuss the old complaint.", "Satisfying, risky, and likely to produce a sequel review.", [1, -2, -2, { devon: [-1, -2], elena: [1, 1] }]),
        action("gb-reviewer-comp", "Offer a small comp to calm him before the review gets worse.", "It may lower heat and teaches glitter economics.", [-2, -1, -2, { devon: [-1, -2], marcus: [-1, -1] }])
      ]),
      beat("staff", "Staff start joking that complaints now come with party supplies", "The jokes are funny until Marisol says she feels disposable.", "nina", "Celia says morale depends on whether leadership treats the mess as harm or content.", [
        action("gb-staff-validate", "Acknowledge the staff impact publicly and thank cleanup labor directly.", "Not flashy, but it repairs the room from the inside.", [0, 3, 3, { nina: [2, 2], elena: [2, 3], marcus: [1, 1] }]),
        action("gb-staff-meme", "Let staff make one internal glitter joke to release tension.", "It helps some people and lands badly for the people still sparkling.", [1, 0, -1, { nina: [1, 1], elena: [-1, -2] }]),
        action("gb-staff-ignore", "Keep everyone focused on guests and move past the emotion.", "The shift recovers on the surface and rots underneath.", [2, -3, -3, { nina: [-2, -3], elena: [-3, -4], marcus: [-2, -2] }])
      ]),
      beat("final", "The reviewer offers to update the review if Feast Haven responds 'with humility'", "Nobody trusts his definition of humility.", "jake", "Adrian says the public response needs spine, not revenge glitter.", [
        action("gb-final-public", "Post a calm public response: address the service issue, reject the glitter behavior, and explain the fix.", "Balanced, clear, and not nearly as satisfying as a comeback.", [1, 3, 4, { jake: [1, 2], elena: [2, 2], devon: [1, 1] }]),
        action("gb-final-private", "Keep the response private and avoid feeding the spectacle.", "Quiet reduces oxygen and may let his version dominate.", [0, 0, 0, { jake: [-1, -1], elena: [1, 1] }]),
        action("gb-final-clapback", "Post a witty glitter clapback from the restaurant account.", "The internet cheers while future serious guests reconsider you.", [3, -2, -4, { jake: [2, 1], elena: [-2, -3], devon: [-1, -2] }])
      ])
    ]
  })
];

const NEXT_LEVEL_CHAOS_EVENTS = [
  makeEvent({
    id: "robot-host-roulette",
    category: "Technology Coup",
    pressure: "Extreme",
    headline: "A rented AI host stand starts seating guests by 'VIP face symmetry score' and somehow the room trusts it",
    body:
      "The robot was supposed to greet people and light up. Instead, it is reshuffling the waitlist, flattering rich guests, and calling regulars 'mid-priority humans.'",
    beats: [
      beat("opening", "The host stand has joined the class war", "Guests are laughing until they realize the robot is actually giving away better tables.", "elena", "Marisol says killing the robot instantly may look panicked, but letting it keep seating people makes Feast Haven look like it outsources fairness to a toaster.", [
        action("rh-open-kill", "Shut the robot down publicly and take back the list by hand.", "The room loses the spectacle and regains an adult.", [-1, 1, 3, { elena: [2, 3], marcus: [1, 1] }]),
        action("rh-open-shadow", "Leave the robot on but quietly override every bad seat assignment.", "It preserves the illusion and doubles the front-desk workload.", [1, 0, -1, { elena: [-1, -2], marcus: [-1, -1], devon: [1, 0] }]),
        action("rh-open-spin", "Call it a beta feature and lean into the weirdness while you monitor it.", "People film it happily right up until the first obvious snub.", [2, 1, -2, { jake: [1, 1], elena: [-1, -1] }]),
        action("rh-open-upgrade", "Ask Marisol to feed the robot manual VIP rules and try to train it live.", "It looks proactive and gives the machine a bigger vocabulary for bias.", [2, -1, -3, { elena: [-2, -3], priya: [-1, 0] }])
      ]),
      beat("waitlist", "A donor's assistant and a teacher both got bumped behind a guy with shiny loafers", "Now the dining room thinks Feast Haven has either a broken robot or a philosophy.", "devon", "Parker says whoever you fix first becomes the story everybody repeats.", [
        action("rh-waitlist-fair", "Reset the order strictly by original check-in time and explain the robot glitched.", "It is fair, slow, and annoys the people who already sat down.", [-2, 2, 3, { devon: [2, 2], elena: [1, 1] }]),
        action("rh-waitlist-donor", "Rescue the donor first and hope money calms the rest of the room.", "The cash risk drops and the ethics risk starts doing cartwheels.", [2, -1, -2, { marcus: [0, 1], elena: [-1, -2], devon: [-1, -1] }]),
        action("rh-waitlist-teacher", "Rescue the teacher first and make the fairness case out loud.", "Morally satisfying, financially dangerous, and very public.", [-1, 1, 2, { devon: [2, 3], marcus: [-1, -1] }]),
        action("rh-waitlist-comp", "Keep the robot order but send apology drinks and desserts to the bumped tables.", "It buys compliance with sugar and teaches the machine nothing.", [-3, 1, -1, { marcus: [-2, -2], elena: [0, -1] }])
      ]),
      beat("staff", "Theo says the robot is now promising ticket times no kitchen can hit", "It has started telling tables their entrees will arrive 'in a crisp and elegant seven minutes.'", "luis", "Theo says front-of-house chaos is one thing, but algorithmic lying with a smile is a whole new flavor of disrespect.", [
        action("rh-staff-truth", "Force the robot into a scripted honesty mode and post real wait estimates.", "The dining room gets grumpier and the kitchen finally stops swearing at the host stand.", [-1, 1, 3, { luis: [2, 3], tasha: [1, 1], elena: [1, 1] }]),
        action("rh-staff-cover", "Let servers smooth over the fake times table by table.", "It keeps the room soft while loading all the stress onto humans.", [1, 0, -2, { luis: [-2, -3], nina: [-1, -2], devon: [-1, -1] }]),
        action("rh-staff-throttle", "Slow seatings until the kitchen catches up, even if the lobby gets ugly.", "The line steadies while the entrance starts looking like a union grievance.", [-2, 0, 1, { luis: [1, 2], tasha: [2, 2], elena: [-1, -1] }]),
        action("rh-staff-race", "Push the kitchen to chase the robot promises for one big rush.", "Revenue smiles and the line starts plating with revenge in its heart.", [3, -2, -3, { luis: [-3, -4], tasha: [-2, -3], priya: [-1, -2] }])
      ]),
      beat("public", "A local blogger posts 'Feast Haven replaced prejudice with software'", "The caption is funny enough to spread and serious enough to hurt.", "jake", "Adrian says the statement has to sound human, accountable, and not like it was written by the robot's lawyer.", [
        action("rh-public-own", "Own the failure, explain the fix, and make the robot the punchline instead of the policy.", "It is humble and expensive because humility always is.", [-1, 2, 3, { jake: [1, 2], elena: [2, 2] }]),
        action("rh-public-minimize", "Call it a demo glitch and avoid sounding dramatic.", "It sounds calm to you and dismissive to everyone else.", [0, -1, -2, { jake: [-1, -2], elena: [-1, -1] }]),
        action("rh-public-pivot", "Turn the attention into a joke promo about 'real humans only' this weekend.", "It softens the story while making the mistake feel marketable.", [2, 0, -1, { jake: [2, 1], marcus: [-1, -1] }]),
        action("rh-public-blame-vendor", "Blame the rental company hard and make them the villain.", "It protects the brand for an hour and makes Feast Haven sound allergic to responsibility.", [1, -1, -3, { jake: [0, 1], elena: [-2, -2] }])
      ]),
      beat("final", "The vendor offers a free upgrade if Feast Haven keeps the robot for one more month", "The robot has become a traffic magnet, a fairness nightmare, and weirdly beloved by teenagers.", "marcus", "Omar says the question is not whether the robot can work. It is whether your staff can keep working around it.", [
        action("rh-final-return", "Return the robot, eat the embarrassment, and train the human host team harder.", "You lose the gimmick and keep the restaurant.", [-1, 2, 4, { marcus: [2, 3], elena: [2, 2], devon: [1, 1] }]),
        action("rh-final-guardrails", "Keep it only as a greeter with no decision power and visible human override.", "It preserves the novelty and turns management into full-time robot babysitting.", [1, 1, 1, { marcus: [0, 1], elena: [-1, 0], devon: [1, 1] }]),
        action("rh-final-vip", "Keep it and market the robot as a premium experience for high spenders.", "Money goes up and your regulars start feeling algorithmically poor.", [4, -2, -4, { elena: [-3, -4], devon: [-2, -3], marcus: [-1, -2] }]),
        action("rh-final-auction", "Let the dining room vote live on the robot's fate during dessert.", "Participatory, viral, and a terrible way to set labor policy.", [2, 0, -2, { jake: [2, 1], elena: [-1, -2], marcus: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "funeral-wedding-collision",
    category: "Private Room Disaster",
    pressure: "High",
    headline: "A wedding rehearsal dinner and a memorial luncheon were booked under the same last name and are now sharing one decorated room",
    body:
      "One side ordered champagne towers. The other ordered framed photos and soft piano. The floral arch has become an emotional weapon.",
    beats: [
      beat("opening", "Two families just walked into opposite definitions of a banner day", "The room says 'Forever Begins Here.' The memorial slideshow is loading beside it.", "elena", "Marisol says the first sentence to both families decides whether Feast Haven looks compassionate, incompetent, or both.", [
        action("fw-open-own", "Own the mistake immediately to both groups and separate them before assigning blame.", "Honest, brutal, and the only approach that starts from reality.", [-2, 2, 3, { elena: [2, 3], devon: [1, 1] }]),
        action("fw-open-delay", "Stall one group in the bar while you quietly salvage the room for the other.", "It buys time and guarantees one side feels ranked second in human importance.", [0, -1, -1, { elena: [-1, -2], marcus: [-1, -1] }]),
        action("fw-open-upgrade", "Offer the wedding the nicer dining room and move the memorial to a calmer private space.", "Operationally neat and morally radioactive if anyone says it out loud.", [2, -2, -3, { elena: [-2, -3], devon: [-1, -1] }]),
        action("fw-open-split", "Use screens, staff, and music shifts to split the room in two for one impossible hour.", "Ingenious on paper and weirdly medieval in practice.", [1, 0, -2, { elena: [1, 0], devon: [-1, -1], marcus: [-1, 0] }])
      ]),
      beat("decor", "The memorial family is standing under the neon sign meant for the couple", "Meanwhile the wedding party found the memorial portrait table and thinks it is a haunted seating chart.", "devon", "Parker says décor choices are now emotional triage with candles.", [
        action("fw-decor-strip", "Strip the room down to neutral basics and rebuild from zero.", "It removes the insult and destroys the timeline.", [-3, 1, 2, { devon: [2, 2], marcus: [-1, -1] }]),
        action("fw-decor-prioritize-grief", "Protect the memorial atmosphere first and ask the wedding to absorb the bland room.", "Compassion wins and one bride's aunt starts using the phrase 'unforgivable beige.'", [-1, 1, 2, { devon: [2, 3], jake: [-1, -1] }]),
        action("fw-decor-prioritize-wedding", "Keep the wedding visuals intact and soften the memorial with private apologies and comps.", "The sales team inside your soul loves it. The rest of your soul files a protest.", [3, -3, -4, { devon: [-2, -3], elena: [-2, -2] }]),
        action("fw-decor-dual", "Quickly customize two smaller spaces with partial décor and targeted staff support.", "Fairer, harder, and one wrong flower away from another crisis.", [-1, 2, 1, { devon: [1, 2], elena: [1, 1], marcus: [-1, 0] }])
      ]),
      beat("kitchen", "Both parties now want rushed service because both believe they are the one who got bumped", "The kitchen has one timing grid and zero patience for competing grief and sparkle.", "tasha", "Chef Renata says the line can prioritize dignity, accuracy, or speed. It cannot flawlessly improvise all three.", [
        action("fw-kitchen-memorial", "Prioritize the memorial for calm pacing and let the wedding wait with honest updates.", "Kind, human, and risky if the wedding equates delay with disrespect.", [-1, 1, 2, { tasha: [2, 2], devon: [1, 1], jake: [-1, -1] }]),
        action("fw-kitchen-wedding", "Prioritize the wedding's timed moments and keep the memorial fed steadily behind it.", "Commercially rational and emotionally cold if anyone notices the order of values.", [2, -1, -2, { tasha: [-1, -1], devon: [-1, -2] }]),
        action("fw-kitchen-simplify", "Cut both menus down and explain that precision beats pageantry right now.", "You preserve service by admitting reality out loud.", [-2, 2, 3, { tasha: [2, 3], priya: [1, 1], marcus: [1, 1] }]),
        action("fw-kitchen-push", "Ask the line to full-send both events at once and chase the schedule with adrenaline.", "For a while, everything moves. Then the mistakes breed.", [3, -2, -3, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("family", "A wedding uncle and a memorial cousin are now arguing in the hall about who got 'the cursed room'", "Both families want a manager, a gesture, and an answer they can repeat later.", "nina", "Celia says the answer has to feel fair, not mathematically equal.", [
        action("fw-family-tailored", "Offer different recovery gestures based on what each group actually lost.", "Thoughtful, defensible, and likely to be compared anyway.", [-2, 2, 2, { nina: [2, 2], devon: [1, 1] }]),
        action("fw-family-identical", "Give both groups the exact same comp package and script.", "Equal is neat. Fair is not always neat.", [-3, 0, -1, { nina: [0, 1], marcus: [-1, -1] }]),
        action("fw-family-emotion", "Spend extra time with the memorial family and trust the wedding to survive some inconvenience.", "Morally strong and commercially dangerous if the wedding expected center stage.", [-1, 1, 1, { nina: [2, 3], jake: [-2, -2] }]),
        action("fw-family-money", "Throw enough free alcohol and dessert at the wedding to mute the optics fast.", "The noise drops and the dignity bill rises.", [-4, -1, -2, { marcus: [-2, -2], nina: [-1, -1] }])
      ]),
      beat("final", "Both families ask whether Feast Haven can ever be trusted with another private event", "This is now about tomorrow's business, not just tonight's cleanup.", "marcus", "Omar says the fix has to change the system, not just the tone of the apology.", [
        action("fw-final-system", "Create a written dual-verification booking protocol and personally walk both families through it.", "Boring, expensive, and exactly how trust is rebuilt.", [-1, 2, 4, { marcus: [2, 3], elena: [2, 2], nina: [1, 1] }]),
        action("fw-final-credit", "Offer both groups future event credits and hope goodwill survives memory.", "It is generous, but it postpones the day your mistake becomes costly again.", [-3, 1, 0, { marcus: [0, 1], devon: [1, 1] }]),
        action("fw-final-pr", "Post about the beautiful resilience of families without naming the disaster.", "It smells like spin to anyone who was actually there.", [1, -2, -3, { jake: [1, 0], elena: [-2, -2] }]),
        action("fw-final-room-ban", "Stop booking simultaneous private events until Feast Haven can actually support them cleanly.", "Protective, painful, and a direct hit to revenue.", [-4, 2, 2, { marcus: [1, 2], devon: [2, 2], tasha: [1, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "balloon-review-blackmail",
    category: "Reviewer Circus",
    pressure: "Absurd",
    headline: "A disguised food critic is roaming the dining room as a balloon artist, twisting every complaint into sculptures and live reviews",
    body:
      "He has already made a balloon lobster labeled 'dry' and a balloon chef hat labeled 'defensive.' Guests are tipping him to roast the menu.",
    beats: [
      beat("opening", "The first balloon complaint gets applause", "Now every table thinks criticism comes with entertainment value.", "jake", "Adrian says if you shut him down too fast, he becomes a martyr. If you let him keep going, he becomes the maître d' of humiliation.", [
        action("br-open-stop", "Stop the balloon act immediately and frame it as guest-disruption policy.", "Firm, reasonable, and instantly interpreted as fear by half the room.", [0, 1, 2, { jake: [-1, 0], elena: [1, 2] }]),
        action("br-open-watch", "Let him continue while management quietly tracks what he says and who he is hitting.", "Smart, strategic, and awful for staff in the moment.", [1, -1, -1, { jake: [1, 0], nina: [-1, -2], elena: [-1, -1] }]),
        action("br-open-buy", "Hire him on the spot for one controlled hour and try to redirect the crowd energy.", "You grab the mic and validate the stunt at the same time.", [2, 0, -2, { jake: [2, 1], marcus: [-1, -1] }]),
        action("br-open-mirror", "Send Adrian to publicly charm him table by table and outshine the bit with actual service.", "It works if Adrian lands every read and fails spectacularly if he misses one.", [1, 2, 0, { jake: [1, 2], devon: [1, 1] }])
      ]),
      beat("staff", "Celia says servers are now afraid to approach any table holding balloons", "A bad shift is one thing. A bad shift with props is another.", "nina", "Celia wants to know whether management values open feedback more than staff dignity when both are happening with squeaky animals.", [
        action("br-staff-boundary", "Tell staff they can step away from any table using the balloon artist to heckle them.", "Healthy for the team, dangerous for check averages.", [-2, 1, 2, { nina: [2, 3], devon: [1, 1] }]),
        action("br-staff-endure", "Ask staff to stay warm and professional no matter what gets twisted.", "Polished on the floor, corrosive in the break room.", [1, -1, -2, { nina: [-2, -3], devon: [-1, -2] }]),
        action("br-staff-manager", "Route all critic-facing tables through managers only until the stunt dies down.", "Protective, but it turns every manager into a live shield.", [-1, 1, 1, { nina: [1, 2], elena: [-1, -1], marcus: [-1, 0] }]),
        action("br-staff-joke", "Encourage staff to volley back with one-liners if they keep it clean.", "Morale spikes for the witty and collapses for the quiet.", [2, 0, -2, { nina: [-1, -2], jake: [2, 1], devon: [-1, -1] }])
      ]),
      beat("truth", "You learn he really is a reviewer and he has not posted yet", "Now this is not a clown problem. It is a leverage problem with balloons.", "devon", "Parker says the review is still unwritten, which means the next move matters more than the first one.", [
        action("br-truth-meeting", "Invite him to a private meeting and separate the complaint from the performance.", "Adult, fair, and likely to bore the guests who came for balloon violence.", [-1, 2, 3, { devon: [2, 3], elena: [1, 1] }]),
        action("br-truth-comp", "Offer a comp before the review drops and hope he feels respected.", "Maybe it softens him. Maybe it trains him.", [-3, 0, -2, { marcus: [-1, -2], devon: [-1, -1] }]),
        action("br-truth-public", "Challenge him publicly to review the food, not the spectacle he created.", "Strong spine, risky optics, and one bad quote away from disaster.", [1, -1, 0, { devon: [1, 1], jake: [1, 0], elena: [-1, -1] }]),
        action("br-truth-escort", "Escort him out now that you know what game he is playing.", "Clean and satisfying until the review starts with 'They removed me for honesty.'", [0, -2, -2, { devon: [0, 1], nina: [1, 1] }])
      ]),
      beat("guests", "Regular guests start requesting custom balloon reviews of their meals", "A weird side business has appeared inside your actual business.", "elena", "Marisol says the room now needs a rule about whether entertainment can rank the food in public while people are still chewing.", [
        action("br-guests-ban", "Ban live table-by-table reviews while guests are dining.", "Reasonable, enforceable, and less exciting than chaos usually is.", [-1, 1, 2, { elena: [2, 2], nina: [1, 1] }]),
        action("br-guests-ticket", "Turn it into an optional after-dinner balloon roast with house rules.", "Structured fun that still attaches Feast Haven to the circus.", [2, 1, 0, { jake: [1, 1], marcus: [-1, -1], elena: [0, 1] }]),
        action("br-guests-freefor", "Let the room play and trust the food to survive the attention.", "Confidence is admirable. So is not setting your own building on fire for content.", [3, -2, -3, { nina: [-2, -3], elena: [-1, -2], tasha: [-1, -1] }]),
        action("br-guests-redirect", "Offer a chef meet-and-greet or dessert sampling instead of performance critique.", "You redirect attention back to hospitality, but not everyone came for hospitality.", [-1, 2, 1, { elena: [1, 2], tasha: [1, 1], jake: [-1, 0] }])
      ]),
      beat("final", "The reviewer asks whether Feast Haven wants him back for a formal ticketed 'Truth Night'", "The room made money. The staff lost peace. Your brand is now standing at a weird fork in the road holding a balloon eel.", "marcus", "Omar says the question is not whether people would pay. It is whether they should decide your operating model.", [
        action("br-final-decline", "Decline the offer and reinforce Feast Haven as a restaurant, not a roast venue.", "Less flashy, more stable, and not everybody's favorite ending.", [-1, 2, 4, { marcus: [2, 3], nina: [2, 2], elena: [1, 1] }]),
        action("br-final-limited", "Run one tightly controlled quarterly event with clear staff protections.", "It monetizes the weirdness without fully marrying it.", [2, 1, 1, { marcus: [0, 1], jake: [1, 1], nina: [-1, -1] }]),
        action("br-final-series", "Launch a weekly review cabaret before the hype cools.", "The money is immediate and the identity crisis arrives gift-wrapped.", [4, -2, -4, { marcus: [-2, -3], nina: [-3, -4], elena: [-2, -2] }]),
        action("br-final-clapback", "Write your own public review of the reviewer's behavior and go to war.", "Cathartic, combustible, and not what calm businesses usually do.", [2, -1, -3, { jake: [2, 1], elena: [-2, -2], devon: [-1, -1] }])
      ])
    ]
  }),
  makeEvent({
    id: "spice-club-meltdown",
    category: "Tasting Night Liability",
    pressure: "Extreme",
    headline: "An underground hot-sauce club has turned normal service into an unofficial heat challenge with waiver cards and tears",
    body:
      "Guests are filming each other, asking for off-menu sauces, and treating basic self-preservation like a personality flaw.",
    beats: [
      beat("opening", "The room smells like vinegar, ego, and danger", "A table just asked whether milk counts as surrender.", "jake", "Adrian says the crowd is spending well, but one brave idiot away from becoming a cautionary tale.", [
        action("sc-open-stop", "Stop all challenge behavior immediately and return the room to normal dining.", "Safe, clear, and greeted like you canceled a sporting event.", [-2, 1, 3, { jake: [-1, 0], nina: [1, 1], elena: [1, 2] }]),
        action("sc-open-rules", "Allow the challenge only with strict portions, timing, and manager supervision.", "It creates order while announcing that this now officially exists.", [1, 1, 0, { jake: [1, 1], marcus: [-1, 0], priya: [1, 1] }]),
        action("sc-open-lean", "Lean in and market a one-night Feast of Fire special on the fly.", "Revenue glows. Liability starts sweating through the wallpaper.", [4, 0, -3, { jake: [2, 1], elena: [-2, -2], tasha: [-1, -1] }]),
        action("sc-open-divert", "Redirect the club into a patio or side section with a reduced menu and medical disclaimers.", "Thoughtful and operationally ugly.", [0, 2, 1, { elena: [1, 1], marcus: [-1, -1], nina: [1, 1] }])
      ]),
      beat("kitchen", "The line is being asked for sauces Chef Renata never approved", "Theo says people are combining ingredients like vengeance is a flavor profile.", "tasha", "Chef Renata says the next answer decides whether the kitchen is still cooking dinner or producing dares.", [
        action("sc-kitchen-lock", "Lock the menu to approved sauces only and refuse all custom heat builds.", "The kitchen regains control and the spice crowd starts chanting 'cowardice.'", [-1, 1, 2, { tasha: [2, 3], luis: [2, 2], priya: [1, 1] }]),
        action("sc-kitchen-tier", "Create a short heat ladder with measured portions and clear staff signoff.", "Controlled, smart, and still more circus than the kitchen wanted tonight.", [2, 1, 0, { tasha: [1, 1], luis: [0, 1], priya: [1, 1] }]),
        action("sc-kitchen-freestyle", "Let the line improvise based on what guests ask for.", "The tips might be real. So will the mistakes.", [3, -2, -3, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }]),
        action("sc-kitchen-bar", "Shift the heat experience to the bar and keep the kitchen out of the stunt.", "It protects the line and dumps the chaos onto whoever pours drinks.", [1, 0, 1, { tasha: [2, 2], marcus: [-1, 0], jake: [0, 1] }])
      ]),
      beat("medical", "One guest says he cannot feel his ears and refuses to lose the challenge", "His friends are cheering like that is somehow relevant.", "devon", "Parker says the room is watching whether Feast Haven values autonomy, dignity, or obvious signs of poor judgment.", [
        action("sc-medical-stop", "Stop the challenge for that table, bring water and dairy, and call it on safety grounds.", "Protective, unpopular, and very hard to argue with once ears enter the conversation.", [-1, 2, 3, { devon: [2, 3], nina: [1, 1] }]),
        action("sc-medical-choice", "Let him choose whether to continue after a clear warning.", "Respectful in theory, reckless once his friends start filming the speech.", [1, -1, -2, { devon: [-1, -2], elena: [-1, -1] }]),
        action("sc-medical-private", "Move the table out of sight before making the call.", "Smart for optics, risky if it looks like you hid a preventable problem.", [0, 1, 0, { devon: [1, 1], elena: [1, 0], marcus: [-1, 0] }]),
        action("sc-medical-compete", "Offer a smaller replacement round so he can save face without winning.", "Creative and weirdly diplomatic, but still centers the stunt.", [-1, 0, -1, { devon: [1, 1], jake: [1, 0], nina: [-1, -1] }])
      ]),
      beat("public", "The club wants Feast Haven to post a live leaderboard before dessert", "Now the event can either become a contained story or a branded bad idea.", "elena", "Marisol says a leaderboard turns foolishness into policy faster than any waiver ever could.", [
        action("sc-public-no", "Refuse the leaderboard and frame the night as food, not combat.", "Principled, less thrilling, and easier to defend in daylight.", [-1, 2, 3, { elena: [2, 3], jake: [-1, -1] }]),
        action("sc-public-soft", "Post a playful heat ladder with no names and no winners.", "Balanced, but still evidence that management helped shape the game.", [1, 1, 0, { elena: [1, 1], jake: [1, 1] }]),
        action("sc-public-score", "Post the leaderboard with prizes and milk-based tiebreakers.", "The room erupts and your future legal discovery folder gets thicker.", [4, -1, -4, { elena: [-2, -3], marcus: [-2, -2], tasha: [-1, -1] }]),
        action("sc-public-charity", "Turn the scoreboard into a charity pledge board and cool the ego factor.", "Smart reframing, but some guests came to conquer, not donate.", [0, 2, 1, { elena: [1, 2], marcus: [1, 1], jake: [0, 1] }])
      ]),
      beat("final", "The club wants a monthly residency", "The night made money, stressed the staff, and introduced dairy triage as a workflow.", "marcus", "Omar says recurring revenue is only exciting when it does not also require a recovery cart.", [
        action("sc-final-decline", "Decline a residency and keep Feast Haven focused on actual hospitality.", "Calmer, safer, and guaranteed to disappoint the people who confuse pain with branding.", [-1, 2, 4, { marcus: [2, 3], tasha: [2, 2], nina: [1, 1] }]),
        action("sc-final-curate", "Offer a rare chef-led tasting with fixed spice levels and real guardrails.", "You keep the spend and cut the nonsense, mostly.", [2, 1, 1, { marcus: [1, 1], tasha: [1, 1], jake: [0, 1] }]),
        action("sc-final-residency", "Launch the residency and own the heat-night identity.", "Profitable, loud, and brutal on every employee who has to mop around it.", [4, -3, -4, { marcus: [-2, -3], tasha: [-3, -4], nina: [-2, -2] }]),
        action("sc-final-license", "License the concept to a cheaper venue and keep Feast Haven's name off the hottest parts.", "Clever, strategic, and likely to make the club feel used.", [1, 0, 0, { marcus: [1, 2], jake: [-1, -1], elena: [0, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "cryo-pod-celebrity",
    category: "Celebrity Demands",
    pressure: "High",
    headline: "A celebrity wellness host demands her portable cryotherapy pod be wheeled beside table eight so she can 'chill between bites'",
    body:
      "The pod is loud, frosty, impossible to ignore, and leaking condensation toward three expensive handbags.",
    beats: [
      beat("opening", "Table eight wants dinner at subzero", "The celebrity says the pod is part of the brand experience and therefore part of the reservation.", "elena", "Marisol says saying yes makes the room bizarre; saying no risks a public tantrum with followers.", [
        action("cp-open-deny", "Deny the pod in the dining room and offer a private staging area instead.", "Clean rule, immediate conflict, no fog machine by the appetizer course.", [0, 1, 3, { elena: [2, 2], devon: [1, 1] }]),
        action("cp-open-private", "Offer a premium side lounge setup and frame it as an upgrade, not a rejection.", "Elegant, costly, and dependent on the celebrity enjoying your wording.", [-2, 2, 2, { elena: [1, 2], marcus: [-1, -1] }]),
        action("cp-open-allow", "Allow the pod tableside for one course and monitor the room.", "Attention spikes and normal dinner quietly leaves the chat.", [3, -1, -2, { jake: [1, 1], elena: [-1, -1] }]),
        action("cp-open-monetize", "Package the pod as a sponsored one-night spectacle and lean into it hard.", "The numbers perk up while dignity wraps itself in a blanket and disappears.", [4, 0, -4, { elena: [-2, -3], marcus: [0, -1], tasha: [-1, -1] }])
      ]),
      beat("floor", "Guests nearby are cold, annoyed, and suddenly very aware of vapor", "One table wants moved. Another wants a selfie. Another wants to know whether dry ice is now garnish.", "nina", "Celia says the floor needs one rule that respects paying guests without creating a second VIP class by accident.", [
        action("cp-floor-move", "Move the most affected tables first and be blunt about why.", "Helpful and expensive, with a side of social hierarchy.", [-2, 2, 1, { nina: [1, 2], elena: [1, 1] }]),
        action("cp-floor-offer", "Offer affected tables a choice: move, comp dessert, or stay with extra attention.", "Flexible and fair, though it turns one pod into six mini-negotiations.", [-2, 2, 2, { nina: [2, 2], devon: [1, 1], marcus: [-1, -1] }]),
        action("cp-floor-ignore", "Keep service moving and trust the celebrity table to pay for the inconvenience they cause.", "Bold theory. Weak hospitality.", [2, -2, -3, { nina: [-2, -3], devon: [-1, -1] }]),
        action("cp-floor-upcharge", "Offer the nearby tables a discounted 'wellness row' experience to make the weirdness feel intentional.", "Creative, funny, and one screenshot away from looking like parody.", [1, 0, -2, { nina: [0, 1], jake: [1, 1], elena: [-1, -1] }])
      ]),
      beat("kitchen", "Condensation is now dripping toward a service lane and Chef Renata is furious", "The pod is not in the kitchen, but somehow it has still become the kitchen's problem.", "tasha", "Chef Renata says the next answer needs to favor physics over celebrity mythology.", [
        action("cp-kitchen-stop", "Stop the pod service until the floor is safe and dry.", "The chef relaxes. The celebrity becomes a weather event.", [0, 1, 3, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("cp-kitchen-reroute", "Reroute traffic, mats, and staff around the pod for the rest of the meal.", "Operationally heroic and wildly unfair to everyone carrying hot plates.", [1, 0, 0, { tasha: [-1, -2], luis: [-1, -2], priya: [-1, -1] }]),
        action("cp-kitchen-speed", "Rush the celebrity table to shorten the pod's time on the floor.", "You reduce exposure and tell the kitchen one table outranks the whole night.", [2, -1, -2, { tasha: [-2, -3], nina: [-1, -1] }]),
        action("cp-kitchen-tech", "Call the pod crew into the back hall and require them to solve the runoff before service continues.", "Correct, confrontational, and likely to go public.", [-1, 1, 2, { tasha: [1, 2], elena: [1, 1], marcus: [0, 1] }])
      ]),
      beat("public", "The celebrity starts livestreaming and calls Feast Haven 'wellness-curious but not committed'", "Now every choice doubles as marketing material for someone else.", "jake", "Adrian says if you react to the stream instead of the room, you lose the room twice.", [
        action("cp-public-room", "Ignore the stream and manage the actual guests in front of you first.", "Boring, disciplined, and usually what grown businesses do.", [0, 2, 2, { jake: [-1, 0], nina: [1, 1], elena: [1, 1] }]),
        action("cp-public-join", "Send a manager to charm the livestream and steer the narrative live.", "High-wire, high-reward, and one awkward sentence from collapse.", [2, 1, 0, { jake: [2, 1], elena: [1, 1] }]),
        action("cp-public-snark", "Answer the jab with a polished but pointed house line about hospitality over stunts.", "Feels amazing for eight seconds and brittle by morning.", [1, -1, -3, { jake: [1, 0], elena: [-2, -2] }]),
        action("cp-public-partner", "Offer a one-night partnership post if she keeps the rest of dinner private and controlled.", "Smart if she wants the deal. Humiliating if she wanted the fight.", [1, 0, 1, { jake: [1, 2], marcus: [-1, -1] }])
      ]),
      beat("final", "Her team offers to bring the pod back for a filmed mini-series", "You can smell the sponsorship money and the staff revolt at the same time.", "marcus", "Omar says the right answer depends on whether Feast Haven is a restaurant that occasionally hosts nonsense or a nonsense studio that occasionally serves dinner.", [
        action("cp-final-no", "Decline the mini-series and put a hard line around dining-room equipment.", "The boundaries are expensive and worth it.", [-1, 2, 4, { marcus: [2, 3], tasha: [2, 2], elena: [1, 1] }]),
        action("cp-final-private", "Offer a paid private-room production package with safety rules and premium fees.", "Contained chaos is still chaos, but at least it has walls.", [2, 1, 1, { marcus: [1, 1], elena: [1, 1], tasha: [0, 1] }]),
        action("cp-final-brand", "Make Feast Haven the official chill-dining home of the series.", "Money surges and so does the sense that your carpet will never emotionally recover.", [4, -2, -4, { marcus: [-2, -3], nina: [-2, -2], tasha: [-2, -3] }]),
        action("cp-final-license", "Take the sponsorship money but insist the pod stays outside and off the restaurant floor.", "Practical, shrewd, and likely to annoy everyone equally.", [1, 1, 1, { marcus: [2, 2], elena: [0, 1], jake: [-1, 0] }])
      ])
    ]
  }),

  makeEvent({
    id: "truffle-pig-vip-night",
    category: "Animal Spectacle",
    pressure: "Absurd",
    headline: "An investor arrives with a tuxedoed truffle pig and says the pig should personally 'choose deserving guests' for the secret course",
    body:
      "The pig is cute, expensive-looking, and already rooting through a floral arrangement like it owns voting rights.",
    beats: [
      beat("opening", "The investor thinks the pig is brand gold", "The dining room thinks the pig is adorable until it sniffs a purse and sneezes on a candle.", "elena", "Marisol says if the pig starts deciding who gets special treatment, the host stand might as well clock out.", [
        action("tp-open-boundary", "Welcome the investor warmly but ban the pig from influencing service decisions.", "Professional, sane, and a direct challenge to a rich person's imagination.", [0, 1, 3, { elena: [2, 3], marcus: [1, 1] }]),
        action("tp-open-symbolic", "Let the pig 'choose' one ceremonial table while the real list stays human.", "Cute enough to work, fragile enough to go wrong instantly.", [2, 1, 0, { elena: [1, 1], jake: [1, 1] }]),
        action("tp-open-vip", "Let the pig lead a true VIP gimmick and lean into the spectacle.", "Big attention, weak ethics, strong smell risk.", [4, -1, -3, { elena: [-2, -3], nina: [-1, -1] }]),
        action("tp-open-private", "Move the investor and pig into a more private experience before the room fully commits to the bit.", "Smart containment that risks insulting the investor's need for audience.", [-1, 2, 1, { elena: [1, 2], devon: [1, 1] }])
      ]),
      beat("floor", "Guests are now competing for the pig's affection", "One table has offered salami. Another has begun making snorting noises with alarming confidence.", "jake", "Adrian says the room is two minutes from turning hospitality into livestock lobbying.", [
        action("tp-floor-stop", "Shut down all pig bribery immediately and reset expectations.", "Necessary, stiff, and guaranteed to disappoint the fun tables first.", [-1, 1, 2, { jake: [-1, 0], nina: [1, 1], elena: [1, 1] }]),
        action("tp-floor-host", "Turn it into one timed pig parade led by staff, then end it cleanly.", "Structured absurdity beats freestyle absurdity, usually.", [2, 1, 0, { jake: [1, 2], devon: [1, 1], marcus: [-1, 0] }]),
        action("tp-floor-let", "Let guests play with the moment and keep service flexible around it.", "The room has energy and zero discipline.", [3, -2, -2, { nina: [-2, -3], devon: [-1, -1], elena: [-1, -1] }]),
        action("tp-floor-upsell", "Offer a paid truffle add-on to every table the pig sniffs near.", "Clever revenue, ethically weird, and one sneeze away from parody.", [3, 0, -2, { jake: [2, 1], marcus: [-1, -1] }])
      ]),
      beat("kitchen", "Chef Renata says the pig is now near ingredients it absolutely cannot be near", "The investor claims the pig has a refined palate. The kitchen claims the pig has hooves.", "tasha", "Chef Renata says tonight can be fancy, funny, or sanitary. Pick two.", [
        action("tp-kitchen-hardline", "Keep the pig fully out of the back and defend the line hard.", "Correct, crisp, and likely to trigger a donor sulk.", [0, 1, 3, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("tp-kitchen-window", "Allow one supervised kitchen-window appearance and nothing beyond that.", "A compromise with just enough opening for future nonsense.", [1, 0, 1, { tasha: [0, 1], luis: [0, 1], jake: [1, 0] }]),
        action("tp-kitchen-photo", "Stage a chef-and-pig photo for social and get it over with.", "Memorable, marketable, and borderline insulting to actual cooks.", [2, 0, -1, { tasha: [-1, -2], jake: [1, 1], elena: [1, 0] }]),
        action("tp-kitchen-tour", "Let the investor and pig do a mini kitchen tour to preserve the relationship.", "Relationship management meets a food-safety fever dream.", [3, -2, -4, { tasha: [-3, -4], luis: [-2, -3], priya: [-2, -2] }])
      ]),
      beat("public", "A clip of the pig 'choosing' a table is exploding online", "Now people want reservations specifically to be judged by livestock.", "nina", "Celia says the response decides whether Feast Haven looks charming, elitist, or fully deranged.", [
        action("tp-public-human", "Post that all guests are served by people, not pigs, and thank everyone for the laugh.", "Clear, warm, and slightly less fun than the internet hoped.", [-1, 2, 3, { nina: [2, 3], elena: [1, 1] }]),
        action("tp-public-playful", "Lean into the joke but clarify it was a one-night stunt.", "Charming if everyone believes the last sentence.", [2, 1, 0, { nina: [1, 1], jake: [1, 1] }]),
        action("tp-public-exclusive", "Create a secret-course waitlist for guests 'selected by the pig.'", "The exclusivity sells and your integrity starts chewing the furniture.", [4, -1, -4, { nina: [-2, -3], elena: [-2, -2], marcus: [-1, -1] }]),
        action("tp-public-silent", "Say nothing and let the clip burn itself out.", "Silence rarely beats a pig in a tuxedo.", [0, -1, -2, { nina: [-1, -2], jake: [-1, -1] }])
      ]),
      beat("final", "The investor offers to fund a permanent 'Porcine Pairing Program' if Feast Haven commits", "You can almost hear the money oinking.", "marcus", "Omar says the question is not whether the pig can make cash. It is whether the staff can respect themselves while it does.", [
        action("tp-final-decline", "Decline the program and keep the pig as a one-night story.", "Stable, human, and mildly heartbreaking to the people who love a rich-animal gimmick.", [-1, 2, 4, { marcus: [2, 3], tasha: [2, 2], nina: [1, 1] }]),
        action("tp-final-charity", "Turn the pig into an annual charity stunt with strict boundaries and zero service power.", "Manageable weirdness with a reason to exist.", [2, 1, 1, { marcus: [1, 2], elena: [1, 1], jake: [1, 1] }]),
        action("tp-final-launch", "Launch the full program and let the pig become part of the brand.", "Profitable, unequal, and spiritually exhausting.", [4, -2, -4, { marcus: [-2, -3], elena: [-2, -2], nina: [-2, -3] }]),
        action("tp-final-membership", "Create a premium truffle club and use the pig only for private members.", "Smart money, awkward optics, softer chaos.", [3, 0, -1, { marcus: [1, 1], jake: [1, 0], elena: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "silent-retreat-buyout",
    category: "Concept Clash",
    pressure: "High",
    headline: "A mindfulness influencer bought half the dining room for a paid silent retreat, but normal dinner guests keep wandering into the zone",
    body:
      "The retreat guests expect whisperless enlightenment. The regular guests expect to ask for ranch without violating a vow.",
    beats: [
      beat("opening", "The room has been split into silence and normal humanity", "One side is meditating over tea. The other just asked whether the silent side is a cult.", "elena", "Marisol says Feast Haven can host weird, but not if nobody can tell which rules belong to which table.", [
        action("sr-open-clear", "Mark the retreat section clearly and brief every arriving guest before seating.", "Organized, slightly awkward, and the least harmful way to explain paid silence.", [-1, 2, 3, { elena: [2, 3], devon: [1, 1] }]),
        action("sr-open-soft", "Keep the vibe subtle and trust staff to redirect people quietly.", "Elegant until the fifth loud birthday greeting crosses the line.", [1, 0, -1, { elena: [0, 1], devon: [-1, -1], nina: [-1, -1] }]),
        action("sr-open-enforce", "Treat the whole front half of the room as low-volume and ask normal guests to adapt.", "The retreat loves it. The rest of civilization does not.", [0, -2, -2, { elena: [1, 1], jake: [-1, -1], nina: [-1, -2] }]),
        action("sr-open-upgrade", "Move the retreat into the better side of the room since they prepaid for the concept.", "Operationally neat, reputationally risky, and very visible.", [2, -1, -2, { elena: [-1, -2], marcus: [0, -1] }])
      ]),
      beat("floor", "A regular table keeps laughing loudly and the retreat host wants them removed", "The loud table says they bought dinner, not monastery probation.", "nina", "Celia says whoever you protect here becomes the brand promise for the night.", [
        action("sr-floor-move-retreat", "Move the retreat deeper into privacy and absorb the inconvenience yourself.", "Fairer to the public, expensive to the premium buyers.", [-2, 1, 1, { nina: [1, 2], elena: [1, 1], marcus: [-1, -1] }]),
        action("sr-floor-move-loud", "Move the loud table and explain the contracted environment.", "Defensible if done well, infuriating if done even slightly badly.", [0, -1, 0, { nina: [0, 1], devon: [-1, -1], elena: [-1, -1] }]),
        action("sr-floor-balance", "Ask both sides for compromise and reset expectations equally.", "Adult and unsatisfying, which is often a sign it may be right.", [-1, 2, 2, { nina: [2, 2], devon: [1, 1] }]),
        action("sr-floor-comp", "Offer enough comps that both sides stop arguing long enough to finish eating.", "Peace through cash works until someone asks whether silence now has a price tag.", [-4, 1, -1, { marcus: [-2, -2], nina: [0, 1] }])
      ]),
      beat("staff", "Staff are whispering so much that service speed is collapsing", "Parker says the retreat is now controlling speech patterns in parts of the room that were never sold.", "devon", "Parker wants clarity: are they serving a concept, or are they serving a dining room with lungs?", [
        action("sr-staff-normal", "Tell staff to serve normally outside the retreat zone and stop overcompensating.", "Clear and healthy, though the retreat leader calls it spiritually disruptive.", [1, 1, 1, { devon: [2, 2], nina: [1, 1] }]),
        action("sr-staff-whisper", "Keep staff whispering across the full floor to preserve the vibe.", "Aesthetic success. Operational disaster.", [0, -2, -2, { devon: [-2, -3], nina: [-2, -2], jake: [-1, -1] }]),
        action("sr-staff-signal", "Use cards, gestures, and minimal speech in the retreat zone only.", "Smart, weird, and surprisingly effective if everyone commits.", [0, 2, 2, { devon: [1, 2], nina: [1, 2], elena: [1, 1] }]),
        action("sr-staff-host", "Assign Parker solely to the retreat so the rest of the staff can work normally.", "Protective and a little unfair to your most adaptable employee.", [-1, 1, 1, { devon: [-1, -1], nina: [1, 1], jake: [1, 0] }])
      ]),
      beat("public", "A guest posts 'Feast Haven yelled at us for laughing near soup'", "The retreat host posts 'Feast Haven failed to hold sacred silence.' You are somehow losing both markets.", "jake", "Adrian says the statement cannot sound like you are embarrassed by either side existing.", [
        action("sr-public-both", "Acknowledge both experiences and explain the room division more clearly than you did the first time.", "Balanced and painfully humble.", [-1, 2, 3, { jake: [1, 2], elena: [2, 2] }]),
        action("sr-public-retreat", "Defend the retreat concept and frame the disruption as guest disrespect.", "Some admire the backbone. Others hear contempt for normal diners.", [1, -2, -2, { jake: [1, 0], nina: [-1, -2] }]),
        action("sr-public-fun", "Defend the normal guests and gently mock paid silence as unrealistic in a restaurant.", "Funny, blunt, and a betrayal to a paying event host.", [2, -1, -3, { jake: [2, 1], elena: [-2, -2] }]),
        action("sr-public-none", "Say nothing and handle the contracts privately.", "Quiet keeps the fire small if nobody else pours gasoline on it.", [0, 0, 1, { jake: [-1, 0], marcus: [1, 1] }])
      ]),
      beat("final", "The influencer wants to book a six-week silent dinner series", "The money is serious and so is the chance your staff mutinies into spoken word.", "marcus", "Omar says recurring concept nights only work if operations are built for them, not just bribed into surviving them.", [
        action("sr-final-no", "Decline the series and keep the experiment a one-night story.", "You lose premium money and keep a coherent restaurant.", [-2, 2, 3, { marcus: [2, 3], devon: [2, 2], nina: [1, 1] }]),
        action("sr-final-private", "Offer a private-room version only with hard boundaries and separate staffing.", "Contained, workable, and still high-maintenance.", [2, 1, 1, { marcus: [1, 1], devon: [1, 1], elena: [1, 1] }]),
        action("sr-final-launch", "Launch the public series and rebrand one side of the room around it.", "Profitable, divisive, and built on the assumption that your staff enjoy whisper cardio.", [4, -2, -4, { marcus: [-2, -3], devon: [-2, -3], nina: [-2, -2] }]),
        action("sr-final-membership", "Create a subscription supper club off-hours instead of mixing it with normal dinner.", "Strategic, slower, and annoyingly sensible.", [1, 2, 2, { marcus: [2, 2], elena: [1, 1], jake: [-1, 0] }])
      ])
    ]
  }),

  makeEvent({
    id: "fake-prince-auction",
    category: "Scam Spectacle",
    pressure: "Extreme",
    headline: "A man claiming to be a minor European prince is turning a public proposal into a paid auction for 'royal blessings' between courses",
    body:
      "Guests are bidding for proximity to the proposal. Nobody knows who invited him. He has business cards, a sash, and zero shame.",
    beats: [
      beat("opening", "The prince has monetized your dining room without asking", "Half the room thinks it is part of the show. The other half thinks Feast Haven hired a con artist in velvet.", "elena", "Marisol says the first move decides whether this is a disruption, a security issue, or a branded feature by default.", [
        action("fp-open-remove", "Stop the auction immediately and verify who he is before he takes another dollar.", "Firm and correct, though the room hates having the story interrupted.", [0, 1, 3, { elena: [2, 3], devon: [1, 1] }]),
        action("fp-open-observe", "Let it continue for a few minutes while you quietly gather facts and staff positions.", "Strategic, risky, and built on your belief that scams improve with patience.", [1, -1, -1, { elena: [-1, -1], devon: [0, 1], marcus: [1, 1] }]),
        action("fp-open-redirect", "Take over the microphone and turn the energy back toward the couple before confronting him.", "Smooth if you land it, catastrophic if he refuses to yield.", [2, 1, 0, { jake: [2, 1], elena: [1, 1] }]),
        action("fp-open-partner", "Publicly fold him into the moment for one minute to avoid a scene, then plan your exit.", "Short-term grace, long-term proof you legitimized nonsense.", [2, 0, -2, { jake: [1, 0], elena: [-1, -2] }])
      ]),
      beat("money", "Guests ask whether Feast Haven will honor the 'royal blessing receipts'", "Apparently the prince sold priority photos, cake slices, and one signed napkin.", "marcus", "Omar says the longer the payment confusion lives, the more it starts smelling like the house participated.", [
        action("fp-money-void", "Announce clearly that Feast Haven did not authorize the sales and will not honor them.", "Legally clean, emotionally messy, and terrible for the people already holding napkins.", [0, -1, 3, { marcus: [2, 3], elena: [1, 1] }]),
        action("fp-money-limited", "Honor only the smallest promises yourself to calm the room quickly.", "Fast relief and dangerous precedent.", [-3, 1, -1, { marcus: [-2, -2], devon: [1, 1] }]),
        action("fp-money-refund", "Collect names and offer targeted recovery to the most misled guests after the fact.", "Measured, fair, and not instantly satisfying to anyone.", [-2, 1, 2, { marcus: [1, 2], devon: [1, 1] }]),
        action("fp-money-blame", "Push all angry guests directly back toward the prince and keep Feast Haven at arm's length.", "Technically fair. Practically volcanic.", [1, -2, -3, { marcus: [0, 1], elena: [-2, -2] }])
      ]),
      beat("proposal", "The actual proposer now says the prince made the moment tacky beyond repair", "He still wants to propose tonight, but not inside a room that feels swindled.", "jake", "Adrian says the couple's recovery matters because the whole scam attached itself to their life event.", [
        action("fp-proposal-private", "Move the proposal into a quieter private recovery moment and rebuild dignity first.", "Less grand, more human, and probably the right kind of boring.", [-2, 2, 3, { jake: [1, 2], devon: [1, 1] }]),
        action("fp-proposal-public", "Help them reclaim the room publicly with a stripped-down real proposal.", "Can be beautiful. Can also feel like Act Two of the same chaos.", [2, 0, 0, { jake: [2, 1], elena: [1, 0] }]),
        action("fp-proposal-delay", "Encourage the couple to postpone entirely and let the restaurant absorb the blame.", "Emotionally wise, commercially painful.", [-3, 2, 2, { jake: [-1, -1], devon: [2, 2] }]),
        action("fp-proposal-compensate", "Offer a huge recovery package if they let Feast Haven restage the proposal another night.", "Strategic, expensive, and still a reminder that the first moment broke.", [-4, 1, 1, { marcus: [-1, -2], jake: [1, 1] }])
      ]),
      beat("public", "Guests are already posting side-by-side clips of the prince and your staff reacting", "The room wants a villain and a winner before dessert lands.", "nina", "Celia says the statement cannot sound like the restaurant is shocked by a scam it let rent space in real time.", [
        action("fp-public-accountable", "Acknowledge the failure to stop unauthorized activity fast enough and explain the immediate fix.", "Responsible, unsexy, and credibility-building.", [-1, 2, 3, { nina: [2, 3], elena: [2, 2] }]),
        action("fp-public-comedic", "Lean into the absurdity and call the prince 'self-appointed royalty.'", "It gets laughs and risks making the harmed guests part of the joke.", [2, -1, -1, { nina: [1, 1], jake: [1, 0], devon: [-1, -1] }]),
        action("fp-public-legal", "Say as little as possible and prepare formal legal language.", "Safe, stiff, and socially bloodless.", [0, 0, 1, { nina: [-1, 0], marcus: [2, 2] }]),
        action("fp-public-deflect", "Center the couple and refuse to discuss the prince at all.", "Emotionally graceful, strategically incomplete.", [1, 1, 0, { nina: [1, 1], jake: [1, 1], marcus: [-1, 0] }])
      ]),
      beat("final", "Security confirms the prince is just a local event grifter with excellent posture", "He offers to split tonight's take if Feast Haven books him for a monthly 'royal supper.'", "tasha", "Chef Renata says if the answer is yes, she is naming the next dish Betrayal Reduction.", [
        action("fp-final-ban", "Ban him, refund what you reasonably can, and lock down event access rules.", "No glamour, no confusion, and no second date with a fraud.", [-2, 2, 4, { tasha: [2, 3], marcus: [2, 2], elena: [1, 1] }]),
        action("fp-final-audit", "Do not book him, but study why the room was so vulnerable to him and rebuild the event process.", "Slower to satisfy, stronger for next week.", [-1, 2, 3, { marcus: [2, 3], devon: [1, 1], elena: [1, 1] }]),
        action("fp-final-feature", "Book him for a controlled satire night and keep the money under your roof.", "Monetizes the lesson and stains the lesson.", [4, -2, -4, { tasha: [-2, -3], marcus: [-2, -2], nina: [-1, -2] }]),
        action("fp-final-revenge", "Coordinate a public sting-style humiliation next time he appears.", "Satisfying movie logic. Bad management logic.", [2, -1, -3, { jake: [2, 1], elena: [-1, -2], marcus: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "ice-swan-blackout",
    category: "Gala Collapse",
    pressure: "Extreme",
    headline: "A ten-foot ice swan for a donor gala is melting into the power strips while the lights flicker and the donor speeches are about to begin",
    body:
      "The sculpture cost too much, the floor is slick, and the event planner keeps saying 'we can still save the mood' like mood is waterproof.",
    beats: [
      beat("opening", "The swan is weeping onto the marble", "Guests still think it looks elegant. Staff know it looks electrical.", "marcus", "Omar says every second spent preserving beauty is a second spent gambling with infrastructure.", [
        action("is-open-kill", "Kill power to the affected zone and move guests before the swan becomes a lawsuit.", "Safe, visible, and disastrous for ambiance.", [-2, 1, 3, { marcus: [2, 3], devon: [1, 1] }]),
        action("is-open-mop", "Keep the gala moving while staff quietly control the melt and cables.", "Steady optics, fragile safety.", [2, 0, -2, { marcus: [-1, -2], devon: [-1, -1], elena: [0, 1] }]),
        action("is-open-move-swan", "Try to move the swan intact before speeches begin.", "Heroic and exactly the kind of sentence that ends with someone slipping.", [1, -1, -3, { marcus: [-2, -2], luis: [-1, -1] }]),
        action("is-open-own", "Pause the gala, explain the hazard, and visibly reset the room around safety first.", "Dignified if delivered well, humiliating if delivered badly.", [-1, 2, 2, { marcus: [1, 2], elena: [1, 2] }])
      ]),
      beat("donors", "The host donor insists the swan stays because it symbolizes resilience", "Another donor says the symbolism now feels more like drainage.", "elena", "Marisol says the room needs leadership, not interpretive ice poetry.", [
        action("is-donor-override", "Override the host donor and remove the swan anyway.", "Strong, safe, and socially expensive.", [-1, 1, 2, { elena: [2, 3], marcus: [1, 1] }]),
        action("is-donor-consensus", "Build quick donor consensus before acting so nobody feels singled out.", "Diplomatic and slower than water.", [0, 1, 0, { elena: [1, 1], devon: [1, 1], marcus: [-1, 0] }]),
        action("is-donor-saveface", "Offer the donor a grand replacement centerpiece so the swan can disappear without losing face.", "Clever, costly, and often worth it.", [-3, 2, 2, { elena: [1, 2], jake: [1, 1] }]),
        action("is-donor-surrender", "Let the swan stay through speeches and pray physics respects philanthropy.", "The speeches may survive. Your luck may not.", [2, -2, -4, { marcus: [-3, -3], elena: [-1, -2] }])
      ]),
      beat("kitchen", "The blackout risk now threatens hot holding and timing for plated courses", "Chef Renata says if the line loses power mid-push, your elegant gala becomes a room full of lukewarm regret.", "tasha", "Chef Renata wants a call that protects food safety before anyone starts describing soggy fish as artistic adversity.", [
        action("is-kitchen-simplify", "Simplify the menu immediately so the kitchen can survive partial power and pacing changes.", "Smart, humbling, and likely to upset the event planner's brochure fantasies.", [-2, 2, 3, { tasha: [2, 3], luis: [1, 1], priya: [1, 1] }]),
        action("is-kitchen-race", "Push the current menu out fast before power fails for real.", "Brave if you are lucky, devastating if you are not.", [3, -1, -2, { tasha: [-2, -3], luis: [-1, -2], priya: [-1, -2] }]),
        action("is-kitchen-hold", "Pause service until facilities confirms the load is stable.", "Safe and brutally visible to hungry donors.", [-3, 1, 1, { tasha: [1, 2], marcus: [1, 1], jake: [-1, -1] }]),
        action("is-kitchen-divert", "Move some finishing to backup stations and buy the line breathing room.", "Operationally solid and punishing on labor.", [-1, 1, 2, { tasha: [1, 1], luis: [-1, -1], priya: [1, 1] }])
      ]),
      beat("public", "Guests are posting the melting swan as metaphor and omen", "Now the gala needs a narrative, not just dry floor mats.", "jake", "Adrian says the room will forgive the problem faster than it forgives denial about the problem.", [
        action("is-public-humor", "Use one calm joke, then pivot hard to how the evening is being cared for.", "Human and nimble, provided the joke lands above waterline.", [1, 1, 1, { jake: [2, 1], elena: [1, 1] }]),
        action("is-public-honest", "Be plainly honest that the sculpture is being removed for safety and service integrity.", "Trustworthy, unglamorous, adult.", [-1, 2, 3, { jake: [1, 2], marcus: [1, 1] }]),
        action("is-public-spin", "Call the melt intentional and part of a live art finale.", "Works only if every guest forgets how electricity functions.", [2, -2, -4, { jake: [1, 0], elena: [-2, -2] }]),
        action("is-public-silent", "Say nothing and let the room infer what it wants.", "Silence is not a narrative. It is a vacancy.", [0, -1, -2, { jake: [-1, -2], elena: [-1, -1] }])
      ]),
      beat("final", "The donor asks whether Feast Haven should still host next year's gala", "Tonight can become proof of resilience or proof of fragile polish.", "devon", "Parker says your answer should promise fewer swans and more competence without sounding like panic in a blazer.", [
        action("is-final-protocol", "Pitch a new event-safety protocol and own the lessons of tonight directly.", "Strong trust builder, weak instant ego salve.", [-1, 2, 4, { devon: [2, 3], marcus: [2, 2], elena: [1, 1] }]),
        action("is-final-credit", "Offer a generous make-good package and hope the donor mostly remembers that.", "Costly, useful, and not a substitute for credibility.", [-4, 1, 1, { marcus: [-1, -2], devon: [1, 1] }]),
        action("is-final-upscale", "Promise an even grander gala next year with bigger spectacle and upgraded tech.", "Ambitious, lucrative, and exactly how people end up with two swans.", [3, -1, -3, { marcus: [-1, -1], tasha: [-1, -2], elena: [1, 0] }]),
        action("is-final-boutique", "Limit future galas to smaller, tighter events you can actually control well.", "Less flashy, more survivable, and a direct hit to scale.", [-2, 2, 2, { devon: [2, 2], tasha: [1, 1], marcus: [1, 1] }])
      ])
    ]
  }),

  makeEvent({
    id: "casino-chip-tipping",
    category: "Private Event Money",
    pressure: "High",
    headline: "A charity casino night started tipping staff with custom chips, and now nobody agrees whether those chips are real money, fake money, or a tax problem",
    body:
      "Servers have stacks of chips in their aprons, the host claims everything is redeemable, and Omar says the cash-out drawer suddenly feels cursed.",
    beats: [
      beat("opening", "The first chip hits the tray like a legal question", "Staff are excited because the tips look huge. Management is less excited because the chips say things like '$50 maybe.'", "marcus", "Omar says this can become either a morale win or an accounting horror story before entrees land.", [
        action("cc-open-ban", "Ban chip tipping immediately until redemption is verified.", "Clean books, disappointed staff, safer tomorrow.", [-1, 1, 3, { marcus: [2, 3], nina: [-1, -1], jake: [-1, -1] }]),
        action("cc-open-hold", "Let staff accept chips but log every one for later review.", "Orderly compromise with a side of administrative suffering.", [1, 1, 1, { marcus: [1, 2], nina: [1, 1], jake: [1, 1] }]),
        action("cc-open-cash", "Cash the chips out internally tonight so staff feel protected right away.", "Great for morale and dangerous if the host is playing Monopoly with confidence.", [-4, 2, -1, { marcus: [-2, -2], nina: [2, 2], jake: [2, 2] }]),
        action("cc-open-ignore", "Treat the chips like normal tips and deal with the math after service.", "Popular, sloppy, and one bad count from being tomorrow's panic.", [3, -1, -3, { marcus: [-3, -4], nina: [1, 1], jake: [1, 1] }])
      ]),
      beat("host", "The event host says the chips are charity-backed but gets weirdly vague when asked for paperwork", "He keeps saying 'the spirit of the thing is very liquid.'", "elena", "Marisol says vague rich-people confidence is not an accepted payment processor.", [
        action("cc-host-paper", "Require immediate written redemption terms before the event continues.", "Awkward, correct, and not how hosts like to be managed mid-cocktail.", [0, 1, 3, { elena: [2, 3], marcus: [1, 1] }]),
        action("cc-host-trust", "Trust the host verbally for tonight and preserve the event energy.", "Smooth in the moment, expensive if charisma turns out not to be currency.", [2, 0, -2, { elena: [0, 1], marcus: [-2, -2] }]),
        action("cc-host-sponsor", "Call the charity sponsor directly and verify the chip pool through them.", "Smart, but it risks embarrassing the host and slowing the room.", [-1, 1, 2, { elena: [1, 2], marcus: [2, 2] }]),
        action("cc-host-fee", "Offer to convert chips on-site for a handling fee and make the house the bank.", "Enterprising, dangerous, and one spreadsheet away from self-inflicted misery.", [3, -1, -4, { marcus: [-3, -4], elena: [-1, -2] }])
      ]),
      beat("staff", "Servers are now comparing chip hauls and getting territorial about tables", "What began as charity glamour is becoming casino labor politics.", "nina", "Celia says if management is fuzzy about value, staff will invent value and then defend it with feelings.", [
        action("cc-staff-pool", "Pool all chip tips for the night and split them once redemption is real.", "Fair, calming, and not everyone's favorite interpretation of luck.", [-1, 2, 2, { nina: [2, 3], jake: [-1, -1], devon: [1, 1] }]),
        action("cc-staff-holdings", "Let everyone keep their own chips but require a signed count sheet.", "Clear enough for paperwork, spiky enough for team trust.", [1, 0, 0, { nina: [-1, -1], jake: [1, 1], devon: [0, 1] }]),
        action("cc-staff-cash", "Advance a partial guaranteed payout per server and reconcile later.", "Protective and financially brave in exactly the wrong direction.", [-4, 2, -1, { nina: [2, 2], jake: [2, 2], marcus: [-2, -2] }]),
        action("cc-staff-delay", "Tell staff no tips are counted until tomorrow morning verification.", "Orderly and deeply unpopular after a flashy event.", [0, -1, 1, { nina: [-2, -2], jake: [-1, -1], marcus: [1, 2] }])
      ]),
      beat("fraud", "One stack of chips appears to be from a totally different event company", "Now the room might be generous, confused, or actively counterfeit-adjacent.", "devon", "Parker says the tone matters: if you accuse too fast, the room freezes. If you wait too long, the room gets smarter than you.", [
        action("cc-fraud-freeze", "Freeze chip handling immediately and document everything in front of key witnesses.", "The energy dies and the facts survive.", [-2, 1, 3, { devon: [2, 3], marcus: [2, 2] }]),
        action("cc-fraud-quiet", "Quietly isolate the suspicious chips and keep the rest of the event moving.", "Elegant if you are right, catastrophic if you are too subtle.", [1, 0, -1, { devon: [1, 1], marcus: [-1, -1] }]),
        action("cc-fraud-host", "Confront the host privately and let him solve the optics before you do.", "Fastest route if he is honest, dumbest if he is not.", [1, -1, -2, { devon: [0, 1], elena: [-1, -1], marcus: [-1, -1] }]),
        action("cc-fraud-public", "Call the problem out publicly and invite anyone holding chips to verify them now.", "Transparent, humiliating, and likely to dominate the event's memory.", [0, 0, 1, { devon: [1, 2], elena: [-1, -2], jake: [-1, -1] }])
      ]),
      beat("final", "The charity asks whether Feast Haven can host the casino night annually", "The event raised money, stressed accounting, and made everyone briefly wonder whether velvet chips count as wages.", "tasha", "Chef Renata says this is the rare problem where the food was not the issue and she would like to keep it that way.", [
        action("cc-final-cashonly", "Agree to host again only with cashless verified digital tipping and written controls.", "Responsible and less glamorous than gamblers prefer.", [1, 2, 4, { marcus: [2, 3], nina: [1, 1], tasha: [1, 1] }]),
        action("cc-final-private", "Agree only if the event stays fully private-room and operationally isolated.", "Manageable, profitable, and narrower than the client wants.", [2, 1, 1, { marcus: [1, 1], elena: [1, 1], devon: [1, 1] }]),
        action("cc-final-launch", "Make casino night a signature recurring spectacle and optimize around the chaos.", "Big money, big mess, bigger audit vibes.", [4, -2, -4, { marcus: [-2, -3], nina: [-2, -2], devon: [-1, -1] }]),
        action("cc-final-no", "Decline future casino events and protect the restaurant from fake-money theater.", "Cleaner life, smaller top line, better sleep.", [-2, 2, 2, { marcus: [2, 2], tasha: [1, 1], nina: [1, 1] }])
      ])
    ]
  })
];

module.exports = NEXT_LEVEL_CHAOS_EVENTS;
