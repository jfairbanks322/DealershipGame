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
  if (beatIndex % 5 === 0) {
    return [ranked[1], ranked[2], ranked[0]];
  }
  if (beatIndex % 5 === 1) {
    return [ranked[0], ranked[1], ranked[2]];
  }
  if (beatIndex % 5 === 2) {
    return [ranked[0], ranked[2], ranked[1]];
  }
  if (beatIndex % 5 === 3) {
    return [ranked[2], ranked[0], ranked[1]];
  }
  return [ranked[1], ranked[0], ranked[2]];
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

module.exports = CHAOS_EVENTS.slice(0, 10);
