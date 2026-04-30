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
    id: "influencer-hates-everything",
    category: "Public Relations",
    pressure: "Extreme",
    headline: "A local influencer with two million followers is live-streaming from your dining room and hating every second of it out loud",
    body:
      "Every complaint is getting clipped, captioned, and applauded by strangers before dessert even lands.",
    beats: [
      beat("opening", "The first rant goes viral before appetizers clear", "Nearby tables are now watching the influencer instead of the menu.", "nina", "Celia says the fix has to calm the room, not just win one argument.", [
        action("ih-open-host", "Assign one polished point person to handle the influencer and quietly protect the rest of the floor.", "The room sees control instead of panic, and your staff stops getting pulled into content.", [0, 2, 4, { nina: [2, 2], elena: [1, 1], devon: [1, 1] }]),
        action("ih-open-gift", "Send a small courtesy item and hope generosity changes the tone before the stream gets meaner.", "It softens the moment a little, though it risks teaching the room how to negotiate with a phone lens.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("ih-open-observe", "Let the team keep normal service while you watch for whether the outrage burns itself out.", "You avoid feeding the performance, but the audience now thinks silence might be your whole strategy.", [1, 0, 1, { elena: [-1, -1], devon: [0, 1] }]),
        action("ih-open-confront", "Tell the influencer to stop filming other guests and cut the stream or leave immediately.", "It feels decisive right up until the clip makes you look like the villain of a restaurant thriller.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("staff", "The kitchen wants to know whether to rush a replacement plate for every complaint", "Now optics and ticket flow are colliding.", "tasha", "Chef Renata says chasing every critique could wreck the line for everyone else.", [
        action("ih-staff-targeted", "Only remake dishes when the criticism is concrete and the kitchen can actually improve the result.", "You look responsive without turning the line into a panic-powered apology machine.", [0, 2, 3, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("ih-staff-fast", "Push priority remakes for the influencer and try to win the next clip outright.", "It might flip the story, but your other tables can feel who just became more important than they are.", [2, 0, 1, { jake: [1, 1], tasha: [-1, -1], elena: [-1, -1] }]),
        action("ih-staff-note", "Keep the plates moving and offer to discuss feedback after the meal instead of during it.", "Professional and restrained, though it can read as chilly when the complaints are public and theatrical.", [0, 1, 2, { nina: [1, 1], tasha: [0, 1] }]),
        action("ih-staff-everything", "Tell the kitchen to remake every criticized dish immediately so nothing negative stays on camera.", "The line starts serving the stream instead of the restaurant.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("room", "Other guests are asking if tonight is some kind of stunt dinner", "The room now needs a clear read on whether management is steering.", "elena", "Marisol says people can forgive a scene faster than they forgive feeling ignored inside one.", [
        action("ih-room-clarify", "Quietly reassure nearby tables that the team is protecting their evening first and adjusting around the disruption.", "The message is calm, adult, and mercifully free of internet energy.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("ih-room-extra", "Send a small extra to the closest tables so irritation turns into a story about good recovery.", "Kind and useful, though a few guests now scan the room for what level of chaos earns freebies.", [-1, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("ih-room-spin", "Frame the moment as an unexpected media situation the team is handling confidently.", "It sounds polished, but some people hear 'yes, we let this happen to you on purpose.'", [1, 1, 1, { nina: [1, 1], jake: [1, 0] }]),
        action("ih-room-blame", "Tell the room directly that the influencer is being unreasonable and dramatic.", "Tempting, human, and catastrophically easy to clip out of context.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("countermove", "The influencer asks what Feast Haven is doing to fix its 'attitude problem'", "Now they want a public answer instead of private service recovery.", "devon", "Parker says the next move should end the performance, not widen the stage.", [
        action("ih-counter-private", "Offer a short off-camera conversation with management and keep the floor out of the discussion.", "You refuse the bait without sounding afraid of the feedback.", [0, 2, 4, { devon: [2, 2], nina: [1, 1] }]),
        action("ih-counter-written", "Invite them to share concrete issues in writing so the team can respond carefully and accurately.", "It slows the drama down, though it also sounds a little formal for a phone-first audience.", [-1, 2, 2, { devon: [1, 2], marcus: [1, 1] }]),
        action("ih-counter-oncamera", "Answer once on camera with a composed statement about standards, respect, and guest care.", "It could settle things, but it also confirms that management now performs by request.", [1, 1, 1, { nina: [1, 1], devon: [0, 1] }]),
        action("ih-counter-clapback", "Let your sharpest manager give one cutting line and try to win the internet with confidence.", "Three people in the room love it. The algorithm loves it more.", [2, -2, -4, { devon: [-2, -3], nina: [-2, -2] }])
      ]),
      beat("final", "The stream ends, but your next move decides whether the story lingers", "Now you need the follow-up that guests remember after the comments stop moving.", "marcus", "Omar says the room will judge whether tonight changed a system or just created a memory.", [
        action("ih-final-review", "Document the incident, brief the team, and build a simple protocol for disruptive live-stream situations.", "Not glamorous, but it turns chaos into institutional memory instead of superstition.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1], elena: [1, 1] }]),
        action("ih-final-message", "Post a short statement about guest respect and privacy without naming the influencer.", "Measured and useful, though still a little risky because it keeps the story breathing online.", [1, 1, 2, { nina: [1, 1], marcus: [1, 1] }]),
        action("ih-final-credit", "Offer the influencer a private return invitation so you get one more chance to reshape the narrative.", "Strategic, but your staff may hear that the loudest person won a second date.", [1, 0, 1, { nina: [0, 1], tasha: [-1, -1], elena: [-1, -1] }]),
        action("ih-final-war", "Post your own public rebuttal thread explaining why the influencer was unfair and uninformed.", "It satisfies the soul and torches the week.", [2, -2, -4, { marcus: [-2, -3], nina: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "grandma-secret-menu-takeover",
    category: "Kitchen Invasion",
    pressure: "High",
    headline: "An elderly guest says your chef stole her family recipe and now she wants to march into your kitchen and make the dish herself",
    body:
      "She is furious, charming, publicly supported by three cousins, and somehow already wearing an apron.",
    beats: [
      beat("opening", "Grandma announces the theft claim in the dining room", "Half the room thinks this is adorable. The other half thinks it is a lawsuit with pearls.", "elena", "Marisol says the first goal is respect without surrendering your kitchen to pure folklore.", [
        action("gm-open-private", "Move the conversation to a quiet area, thank her for raising it, and treat the claim seriously without validating it yet.", "The room sees dignity instead of a duel, and you keep your options wide.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("gm-open-listen", "Let her explain the recipe at the table while a manager takes notes and promises a review.", "Warm and patient, though the performance keeps growing legs in front of an audience.", [0, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("gm-open-taste", "Offer a complimentary tasting comparison right away so the issue feels practical instead of personal.", "Creative and diplomatic, though a few guests now feel like they bought tickets to food court.", [1, 1, 1, { jake: [1, 1], tasha: [0, 1] }]),
        action("gm-open-dismiss", "Explain that recipes are not unique and ask her not to disrupt service again.", "Legally crisp, emotionally radioactive.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2], tasha: [-1, -1] }])
      ]),
      beat("kitchen", "She now insists the only real proof is letting her cook it herself", "The room is waiting to see whether management protects standards or embraces theater.", "tasha", "Chef Renata says the kitchen is not a public square, but outright refusal could make her look defensive.", [
        action("gm-kitchen-demo", "Offer a supervised off-line recipe conversation with the chef after service instead of live kitchen access.", "You respect the guest while protecting food safety and command.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("gm-kitchen-side", "Invite her to suggest one ingredient or technique from just outside the line while staff execute the dish.", "It shares a little stage without giving away the building.", [1, 1, 1, { tasha: [1, 1], elena: [1, 1] }]),
        action("gm-kitchen-later", "Promise a future private cooking event if the family wants to celebrate the dish properly.", "Smart long-term thinking, though it can sound like elegant postponement in a hot moment.", [0, 1, 2, { nina: [1, 1], tasha: [0, 1] }]),
        action("gm-kitchen-yes", "Let her into the working kitchen now with a borrowed coat and a sentimental smile.", "What could possibly go wrong besides all of service.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("truth", "A cook quietly says the menu item probably was inspired by a staff family recipe years ago", "Now the issue may be morally gray instead of obviously false.", "marcus", "Omar says honesty matters, but timing and proof matter too.", [
        action("gm-truth-check", "Privately verify the story with staff records and keep the guest updated without overpromising.", "It slows the drama down and turns rumor into fact-finding.", [0, 2, 3, { marcus: [2, 2], tasha: [1, 1] }]),
        action("gm-truth-honor", "Acknowledge that recipes often carry family roots and offer to credit her influence if the story checks out.", "Thoughtful and humane, though slightly risky before all the facts land.", [0, 1, 2, { marcus: [1, 1], elena: [1, 1] }]),
        action("gm-truth-chef", "Let the chef speak directly with her now and trust culinary pride to sort the nuance cleanly.", "It could produce respect or a second fire in the same room.", [1, 1, 1, { tasha: [1, 1], nina: [0, 1] }]),
        action("gm-truth-cover", "Tell the team to say the recipe is unquestionably original until the family leaves.", "Short-term control, long-term rot.", [2, -2, -4, { marcus: [-2, -3], tasha: [-1, -2], nina: [-1, -1] }])
      ]),
      beat("guests", "Nearby tables are now asking whether Grandma is allowed to finish the dish", "The room wants resolution, and it wants it to be entertaining.", "jake", "Adrian says a little showmanship might help, but only if it still feels like a restaurant first.", [
        action("gm-guests-contained", "Thank the room for their patience and keep the focus on service while you resolve the matter privately.", "It is not flashy, which is exactly why it works.", [0, 2, 3, { jake: [1, 1], elena: [1, 1] }]),
        action("gm-guests-toast", "Invite the family to share a short story about the dish while the kitchen sends a polished version.", "Warm and memorable, though it also extends the spectacle with your blessing.", [1, 1, 1, { jake: [1, 1], nina: [1, 1] }]),
        action("gm-guests-special", "Turn it into a one-night 'Grandma's Legacy Plate' and let the room order it.", "Clever if the story ends well, dangerous if the origin dispute gets messier.", [2, 0, 1, { jake: [1, 1], marcus: [-1, -1] }]),
        action("gm-guests-joke", "Defuse the room with a joke about kitchen coups and family takeovers.", "If everyone laughs you are brilliant. If they do not, you mocked a personal claim in public.", [1, -2, -4, { jake: [-2, -2], elena: [-1, -2] }])
      ]),
      beat("final", "The family wants to know how Feast Haven will honor what happened", "Now the restaurant decides whether tonight becomes conflict, collaboration, or folklore.", "devon", "Parker says the closing move should feel generous without making policy out of chaos.", [
        action("gm-final-credit", "If the claim checks out, offer menu-note credit and a future hosted family recipe night under chef supervision.", "You protect standards while turning conflict into a structured relationship.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1], elena: [1, 1] }]),
        action("gm-final-followup", "Promise a written follow-up with the family after reviewing the recipe history and staff notes.", "Less cinematic, more responsible, and sometimes that is the better hospitality.", [-1, 2, 3, { marcus: [2, 2], devon: [1, 1] }]),
        action("gm-final-gift", "Send the family home with a generous meal package and a handwritten note while you revisit the menu later.", "Kind and human, though it may feel like consolation instead of resolution.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("gm-final-ban", "Tell the family they are no longer welcome if they keep making accusations about the menu.", "It ends the conversation and starts a much bigger one.", [2, -2, -4, { devon: [-2, -3], elena: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "surprise-health-inspection-chaos",
    category: "Compliance",
    pressure: "Extreme",
    headline: "A health inspector walks in at the exact moment your kitchen is slammed, understaffed, and alarmingly behind on cleanup",
    body:
      "There is steam, clutter, a suspiciously brave dish pile, and the sudden feeling that everyone has forgotten how sinks work.",
    beats: [
      beat("opening", "The inspector asks to begin immediately", "The line is drowning and the clipboard is smiling.", "marcus", "Omar says the worst mistake now is pretending the kitchen is calmer than it is.", [
        action("hi-open-truth", "Acknowledge the rush, assign one escort, and keep the inspection moving with honest answers and visible corrections.", "It costs composure, but buys credibility.", [0, 2, 4, { marcus: [2, 2], tasha: [1, 1], priya: [1, 1] }]),
        action("hi-open-delay", "Ask for a brief delay so the line can stabilize before the walkthrough begins.", "Reasonable on paper, though it may read like a request for magical disappearing evidence.", [0, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("hi-open-front", "Send a manager to host the inspector while the kitchen keeps pushing tickets and correcting what it can.", "Practical, but now the escort may be selling confidence your line cannot consistently support.", [1, 1, 1, { devon: [1, 1], tasha: [0, 1] }]),
        action("hi-open-polish", "Rush everyone to 'clean up the optics' before the inspector reaches the hot stations.", "A great way to look like someone who thinks optics are the same thing as safety.", [2, -2, -4, { tasha: [-2, -3], priya: [-1, -2], marcus: [-1, -1] }])
      ]),
      beat("line", "The inspector notices a messy prep station and wants to watch how corrections are made", "Now process matters more than speeches.", "tasha", "Chef Renata says one clean correction can help, but chaos theater will not.", [
        action("hi-line-correct", "Pause the affected station, fix the issue fully, and narrate the correction plainly without defensiveness.", "It slows output for a minute and strengthens trust for longer.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("hi-line-reassign", "Shift that prep to a cleaner station and keep service flowing while someone resets the original area.", "Operationally smart, though it risks looking like a dance around root cause.", [1, 1, 1, { tasha: [1, 1], luis: [1, 0] }]),
        action("hi-line-batch", "Let the current tickets finish, then deep-clean the station once the rush softens.", "Realistic, but the inspector is here now, not in a calmer alternate universe.", [1, 0, 1, { tasha: [0, 1], marcus: [-1, -1] }]),
        action("hi-line-hide", "Move questionable items off the station so the inspector can keep walking.", "Congratulations on inventing the world's least convincing magic trick.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], marcus: [-1, -2] }])
      ]),
      beat("floor", "Guests are starting to notice a serious inspection is happening mid-service", "The dining room now needs confidence without fiction.", "elena", "Marisol says guests can handle inconvenience much better than mystery.", [
        action("hi-floor-calm", "Tell nearby tables there is an active inspection and the team is prioritizing safe, careful service.", "The honesty feels steady instead of alarming.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("hi-floor-soft", "Explain there may be slower pacing tonight because the kitchen is working through a compliance visit.", "Clear enough to help, mild enough not to turn the room into rumor math.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("hi-floor-hospitality", "Lean hard into extra touchpoints and comps so guests remember warmth more than delay.", "Generous and useful, though it can suggest something is more wrong than you say.", [-1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("hi-floor-cover", "Tell the room the delay is due to a private event issue so nobody connects it to inspection pressure.", "A lie that only works if nobody sees the inspector with their own eyes.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("findings", "The inspector flags documentation gaps along with the visible mess", "You now have operational and paperwork trouble at the same time.", "devon", "Parker says the fix has to show control, not exhaustion with a clipboard.", [
        action("hi-findings-prioritize", "Separate urgent safety fixes from post-shift paperwork fixes and confirm that plan clearly.", "It shows maturity and keeps the team from solving everything badly at once.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1] }]),
        action("hi-findings-own", "Take responsibility for the documentation gap and assign one manager to close it before end of night.", "Responsible and slightly painful, but the pain is pointed in the right place.", [0, 1, 3, { devon: [1, 2], marcus: [1, 1] }]),
        action("hi-findings-share", "Split the paperwork among several staff so no one manager gets buried.", "Fast, though it raises the odds that four rushed fixes become four new mistakes.", [1, 1, 1, { devon: [0, 1], marcus: [0, 1] }]),
        action("hi-findings-argue", "Challenge the inspector on the gray areas so the final report feels less severe.", "Bold if you are spotless, unwise if your dish pit is auditioning for a documentary.", [2, -2, -4, { devon: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("final", "The inspection is ending, but the team looks rattled and exposed", "The last choice is about recovery culture as much as public score.", "nina", "Celia says what staff hear after a hard inspection will shape the next month of behavior.", [
        action("hi-final-brief", "Hold a calm after-action brief that names failures, protects dignity, and assigns non-dramatic follow-up fixes.", "That is how you turn a bad night into cleaner habits instead of cleaner stories.", [0, 2, 4, { nina: [2, 2], tasha: [1, 1], marcus: [1, 1] }]),
        action("hi-final-training", "Announce a quick retraining block for the problem areas and frame it as skill reinforcement, not punishment.", "Useful and fair, though a few exhausted people will still hear one more meeting.", [-1, 2, 3, { nina: [1, 2], tasha: [1, 1] }]),
        action("hi-final-thanks", "Thank everyone for surviving a brutal night and save the harder process conversation for tomorrow.", "Compassionate, but it leaves the lesson a little blurry in the moment it is freshest.", [0, 1, 2, { nina: [1, 1], elena: [1, 1] }]),
        action("hi-final-purge", "Call out the sloppiest station publicly so the whole team understands the cost of weakness.", "Fear travels fast. So does resentment.", [2, -2, -4, { nina: [-2, -2], tasha: [-2, -3], priya: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "table-that-wont-leave",
    category: "Floor Control",
    pressure: "High",
    headline: "A group has occupied a prime table for hours, barely ordered, and now peak service is forming a polite traffic jam around them",
    body:
      "They are cheerful, comfortable, and somehow immune to the social signals of an entire restaurant.",
    beats: [
      beat("opening", "The section is jammed because the biggest table is functionally a living room now", "Your waiting list is staring at that booth like it owes them money.", "jake", "Adrian says the trick is moving them without making the whole room feel hustled.", [
        action("tw-open-checkin", "Have their server do a warm check-in that offers dessert, coffee, or the check depending on their mood.", "It tests intent without accusing them of camping.", [0, 2, 3, { jake: [2, 2], nina: [1, 1] }]),
        action("tw-open-manager", "Send a manager to thank them for visiting and mention that the room is heading into a heavy reservation wave.", "Direct and respectful, though it subtly changes their night from private to managed.", [0, 1, 2, { elena: [1, 1], jake: [1, 1] }]),
        action("tw-open-upsell", "Offer a premium after-dinner item so their presence starts paying like the space it occupies.", "Commercially clever, though it may deepen the stay you are trying to end.", [1, 1, 1, { jake: [1, 1], marcus: [0, 1] }]),
        action("tw-open-rush", "Tell the server to drop the check unprompted and start clearing aggressively around them.", "A bold way to communicate contempt using plates.", [2, -2, -4, { jake: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("queue", "The wait list is now asking why an empty-glasses table matters more than their reservation", "This is becoming a fairness problem, not just a pacing one.", "elena", "Marisol says people tolerate delay better than visible unfairness.", [
        action("tw-queue-transparency", "Explain that the team is actively turning the table and update the wait list with honest timing.", "It does not speed the room up, but it keeps trust from leaking out the front door.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("tw-queue-perk", "Give the waiting guests a small courtesy while you buy a little more patience.", "Helpful, but it can train the lobby to expect compensation for normal bottlenecks.", [-1, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("tw-queue-shift", "Reconfigure other tables creatively to seat some of the waiting parties faster.", "Smart if the floor can absorb it, messy if it bends the rest of service sideways.", [1, 1, 1, { devon: [1, 1], marcus: [0, 1] }]),
        action("tw-queue-blame", "Tell the lobby that one table is refusing to leave so they know exactly where the delay comes from.", "You may win one grim nod and lose the moral high ground in a single sentence.", [1, -2, -4, { elena: [-2, -3], jake: [-1, -1] }])
      ]),
      beat("pressure", "The group says they are still 'thinking about one more thing'", "Now the table is aware of the pressure and testing what happens next.", "devon", "Parker says the next move should set a boundary without sounding like panic in a blazer.", [
        action("tw-pressure-choice", "Offer a clear choice: continue with one final round or settle up and move to the lounge area.", "It gives them agency while making the restaurant's needs unmistakably real.", [0, 2, 4, { devon: [2, 2], jake: [1, 1] }]),
        action("tw-pressure-window", "Give them a gentle time frame by referencing the next reservation on the table with appreciation, not irritation.", "Useful and honest, though some guests hear clocks very personally.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("tw-pressure-host", "Send the host to help 'transition' the experience as if it were standard premium service.", "Elegant if landed well, awkward if it feels like eviction in perfume.", [1, 1, 1, { elena: [1, 1], devon: [0, 1] }]),
        action("tw-pressure-switch", "Move their belongings to a nearby high-top before getting explicit permission so the room can turn faster.", "Operationally exciting. Hospitality-wise: absolutely not.", [2, -2, -4, { devon: [-2, -3], elena: [-2, -2] }])
      ]),
      beat("online", "One guest at the table starts joking online about being 'bullied out by fancy people'", "Now optics are threatening to outrun facts.", "nina", "Celia says the room should feel guided, not punished, even if the internet is itching for a villain.", [
        action("tw-online-soft", "Reframe the conversation around guest flow and comfort for everyone, not one table's behavior.", "It is the rare sentence that sounds fair to both the campers and the crowd.", [0, 2, 3, { nina: [2, 2], devon: [1, 1] }]),
        action("tw-online-compromise", "Offer to move them comfortably and provide a small courtesy so the story ends with dignity.", "Costly, but sometimes the cheapest way to buy silence is grace.", [-1, 1, 2, { nina: [1, 1], marcus: [0, 1] }]),
        action("tw-online-ignore", "Keep the conversation offline and trust that a tiny post will not become a bigger one.", "Often true, occasionally catastrophic, always a gamble.", [1, 1, 1, { nina: [0, 1], jake: [1, 1] }]),
        action("tw-online-correct", "Correct the guest sharply by listing exactly how long they have occupied the table and what they ordered.", "Factually tempting, spiritually disastrous.", [1, -2, -4, { nina: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("final", "The table finally prepares to move, but your team needs a lasting rule for this problem", "One booth should not be able to hold the whole house hostage twice.", "marcus", "Omar says policy should support the floor before resentment grows roots.", [
        action("tw-final-policy", "Set a soft late-stage table management policy with lounge transition language and manager support.", "Now the team has a shared tool instead of private improvisation.", [0, 2, 4, { marcus: [2, 2], jake: [1, 1], elena: [1, 1] }]),
        action("tw-final-zones", "Create clearer linger-friendly zones so prime turn tables and hangout spaces stop fighting each other.", "Slightly more complex, but much smarter for the long game.", [-1, 2, 3, { devon: [2, 1], marcus: [1, 1] }]),
        action("tw-final-checks", "Train servers to feel out intent earlier and position the check more gracefully before crunch time.", "Solid floor craft, though still dependent on individual confidence.", [0, 1, 2, { jake: [1, 1], nina: [1, 1] }]),
        action("tw-final-fee", "Create a hard linger fee for any table that stays beyond a set time.", "Nothing says warmth like monetized resentment.", [2, -2, -4, { marcus: [-2, -3], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "mystery-food-critic",
    category: "High Stakes Service",
    pressure: "High",
    headline: "You hear a famous anonymous food critic is in the building, but no one knows which table it is",
    body:
      "The room immediately becomes too polite, too nervous, and just weird enough to ruin itself without help.",
    beats: [
      beat("opening", "Staff start whispering guesses before water hits every table", "The critic may be watching. So may twelve innocent people with soup.", "nina", "Celia says the wrong move is treating one table like royalty and the rest like witness statements.", [
        action("mc-open-all", "Tell the floor to raise consistency for every table rather than hunting for one special guest.", "The room gets sharper service without the stink of favoritism.", [0, 2, 4, { nina: [2, 2], devon: [1, 1], jake: [1, 1] }]),
        action("mc-open-watch", "Quietly identify two or three likely critic profiles and keep a closer eye on those sections.", "Practical, though now the rest of the room may receive your leftover attention.", [1, 1, 1, { nina: [1, 1], elena: [0, 1] }]),
        action("mc-open-chef", "Have the chef choose one showcase dish to send selectively if the right table reveals itself.", "Potentially brilliant, but it turns the night into a guessing game with garnish.", [1, 0, 1, { tasha: [1, 1], nina: [0, 1] }]),
        action("mc-open-hunt", "Tell the team to figure out who the critic is as fast as possible and prioritize them above all else.", "The critic may or may not love attention. Regular guests almost never do.", [2, -2, -4, { nina: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("suspect", "A quiet solo diner orders modestly but takes notes between bites", "Half the staff is now spiritually certain they found the critic.", "elena", "Marisol says certainty without evidence is how service becomes performance art.", [
        action("mc-suspect-normal", "Keep service excellent but normal at the suspected table while watching the rest of the room too.", "If they are the critic, you look poised. If not, nobody else got punished for the rumor.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("mc-suspect-softprobe", "Have a manager stop by naturally and learn whether the diner has any specific interest in the menu.", "Useful if done lightly, risky if it smells like an identity check in a napkin wrapper.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("mc-suspect-upgrade", "Quietly enhance that table's service pacing and detail without announcing why.", "Smart if your guess is right, awkward if a nearby regular notices the energy shift.", [1, 1, 1, { nina: [1, 1], jake: [1, 0] }]),
        action("mc-suspect-ask", "Ask directly whether they are the critic so the team can 'serve them appropriately.'", "A sentence no critic has ever wanted to hear from a functioning restaurant.", [2, -2, -4, { elena: [-2, -3], nina: [-2, -2] }])
      ]),
      beat("kitchen", "The chef wants to send off-menu amuse-bouches to likely critic tables", "Refinement and fairness are now arm wrestling in the pass.", "tasha", "Chef Renata says a perfect extra bite could change the story. Omar says so can a regular guest noticing the game.", [
        action("mc-kitchen-room", "Use the same extra touch for several tables that fit the night's pacing instead of one suspected critic.", "It feels like generosity, not worship.", [0, 2, 4, { tasha: [2, 2], marcus: [1, 1] }]),
        action("mc-kitchen-hold", "Keep the menu honest and let the food stand on what was promised to everyone.", "Principled and clean, though it passes on a real chance to create delight.", [0, 1, 2, { tasha: [1, 1], nina: [1, 1] }]),
        action("mc-kitchen-selective", "Send one tiny signature extra to the strongest suspect table and nowhere else.", "It could be magic. It could also be the start of a fairness whisper campaign.", [1, 1, 1, { tasha: [1, 1], elena: [0, 1] }]),
        action("mc-kitchen-stage", "Hold a conspicuous chef visit for the suspected critic so they know how seriously you take their opinion.", "Nothing says anonymous like a spotlight and three servers pretending not to stare.", [2, -2, -4, { tasha: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("staff", "The hunt is making the team tense and weird with ordinary guests", "Now the critic might not be the biggest risk in the room anymore.", "devon", "Parker says fear of one guest is already damaging service for fifty others.", [
        action("mc-staff-reset", "Reset the floor with one message: stop guessing, serve every table like a return guest you want back.", "The room relaxes and the service gets cleaner almost instantly.", [0, 2, 4, { devon: [2, 2], jake: [1, 1], nina: [1, 1] }]),
        action("mc-staff-pair", "Pair calmer veterans with your most jumpy staff so sections steady out without a big speech.", "Subtle and helpful, though it only solves the symptom for tonight.", [0, 1, 2, { devon: [1, 1], jake: [1, 1] }]),
        action("mc-staff-rules", "Give the team a tighter script and more checkpoints so nobody freelances in panic.", "It improves consistency, but can flatten the warmth right out of the room.", [1, 1, 1, { nina: [1, 1], jake: [-1, -1] }]),
        action("mc-staff-pressure", "Remind everyone that one bad mistake tonight could cost the restaurant dearly.", "Technically true, functionally poisonous.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -2], nina: [-1, -1] }])
      ]),
      beat("final", "A staffer thinks they finally confirmed the critic on the way out", "Now you decide what kind of last impression is still worth making.", "marcus", "Omar says the final move should feel like hospitality, not a résumé toss.", [
        action("mc-final-thank", "Thank the guest sincerely for dining and invite honest feedback without fishing for identity or praise.", "If they are the critic, it lands well. If not, it still sounds like a real restaurant.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("mc-final-note", "Send a discreet handwritten thank-you to the table with no mention of the rumor.", "Warm and polished, though maybe one notch more intentional than necessary.", [0, 1, 2, { marcus: [1, 1], elena: [1, 1] }]),
        action("mc-final-gift", "Send a small parting gift to hedge your bets and hope the generosity gets remembered.", "Good if graceful, a little calculated if obvious.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("mc-final-reveal", "Ask them privately for the review publication timeline so the team can prepare.", "Prepared for what: your own embarrassment?", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "allergy-maybe-situation",
    category: "Guest Safety",
    pressure: "Extreme",
    headline: "A guest says they have serious allergies, but the list keeps changing every time someone tries to confirm it",
    body:
      "The room is tightening, the kitchen is nervous, and nobody wants the word 'maybe' anywhere near an EpiPen scenario.",
    beats: [
      beat("opening", "The guest names three serious allergies, then casually orders a dish that appears to contain one of them", "Your server is already doing mental cartwheels.", "nina", "Celia says the worst trap here is pretending the contradictions make the risk less real.", [
        action("al-open-reset", "Pause ordering, restate every claimed allergy carefully, and confirm what is medical versus preference before any food is fired.", "It is slower than everyone wants and safer than everyone needs.", [0, 2, 4, { nina: [2, 2], tasha: [1, 1], elena: [1, 1] }]),
        action("al-open-safe", "Guide them toward a few low-risk dishes while still documenting the inconsistent answers clearly.", "Helpful and calming, though still dependent on shaky guest information.", [0, 1, 2, { nina: [1, 1], devon: [1, 1] }]),
        action("al-open-manager", "Bring in a manager immediately so the conversation feels serious and the pressure leaves the server.", "Smart support, but it also raises the social temperature at the table.", [1, 1, 1, { nina: [1, 1], devon: [1, 1] }]),
        action("al-open-assume", "Assume the guest is exaggerating because the story keeps changing and just note the first version.", "A breathtaking way to gamble with both lungs and lawsuits.", [2, -2, -4, { nina: [-2, -3], tasha: [-1, -2] }])
      ]),
      beat("kitchen", "The kitchen asks whether to treat the situation like a full severe-allergy protocol", "A cautious overreaction could stall service. An underreaction could become the only story in town.", "tasha", "Chef Renata says ambiguity is not the same thing as safety.", [
        action("al-kitchen-full", "Use full allergy protocol for the confirmed list, even if the guest is messy about communicating it.", "It costs time, but the kitchen sleeps better and so do you.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("al-kitchen-limited", "Use a narrowed protocol based only on the allergens the guest repeats consistently.", "Efficient, but it leaves a little too much power in a confused conversation.", [1, 1, 1, { tasha: [1, 1], priya: [0, 1] }]),
        action("al-kitchen-offmenu", "Offer a custom simplified plate built from ingredients the guest explicitly approves one by one.", "Safe-ish and guest-centered, though it burns coordination fast.", [-1, 2, 2, { tasha: [1, 2], luis: [0, 1] }]),
        action("al-kitchen-standard", "Prepare the dish normally and trust the guest to send it back if anything feels wrong.", "That is not a protocol. That is a prayer in uniform.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("table", "The guest now changes one allergy again after the plate is nearly ready", "Everyone feels trapped between being skeptical and being reckless.", "elena", "Marisol says the guest may be inconsistent and still deserve a process that protects them.", [
        action("al-table-restart", "Restart the order calmly, explain why, and protect the guest from their own moving target.", "Nobody loves the delay, but everybody understands the logic.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("al-table-waiver", "Ask the guest to sign off verbally on the final allergy list before the dish is served.", "Clarifying, though a little formal unless your tone is careful and kind.", [0, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("al-table-limited", "Offer drinks and extra time while the kitchen re-checks only the newly mentioned concern.", "It preserves momentum, but still assumes the rest of the story is finally stable.", [1, 1, 1, { nina: [1, 1], devon: [0, 1] }]),
        action("al-table-push", "Suggest they simply choose something easier so the kitchen can stop reworking the order.", "Possibly true. Absolutely the wrong tone.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("room", "Nearby guests are noticing the extended delay and extra staff attention", "Now a safety issue is becoming a pacing issue.", "devon", "Parker says safety can remain the priority without making every surrounding table feel abandoned.", [
        action("al-room-balance", "Reallocate one support person to shore up neighboring tables while the allergy case stays tightly managed.", "The room feels tended without diluting the seriousness of the main issue.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1] }]),
        action("al-room-update", "Quietly update affected nearby tables that a special dietary safety issue is causing a brief delay.", "Transparent and decent, though not every guest loves hearing the word 'safety issue' over bread.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("al-room-comp", "Send quick extras to the slowest neighboring tables so frustration stays low.", "Useful in the moment, though it costs margin every time ambiguity walks in.", [-1, 1, 1, { marcus: [0, 1], devon: [1, 1] }]),
        action("al-room-rush", "Push all other tickets faster to make up for the delay at the allergy table.", "Wonderful way to create two problems from one.", [2, -2, -4, { tasha: [-2, -2], luis: [-1, -1], priya: [-1, -1] }])
      ]),
      beat("final", "The meal lands safely, but the team knows this will happen again", "What policy you build next decides whether the next version feels calmer or angrier.", "marcus", "Omar says the lesson is not that guests are annoying. It is that messy information still needs a sturdy process.", [
        action("al-final-protocol", "Build a simple allergy clarification protocol with a final confirmed list before any order enters the line.", "You just turned a panic-prone moment into a repeatable system.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1], tasha: [1, 1] }]),
        action("al-final-training", "Train servers on how to distinguish medical allergy, sensitivity, and preference without sounding skeptical.", "That makes the next conversation shorter, safer, and less weird.", [-1, 2, 3, { nina: [2, 2], elena: [1, 1] }]),
        action("al-final-manager", "Require manager approval on any changing allergy list so no single server carries the whole burden.", "Supportive and safe, though it adds weight to already fragile moments.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("al-final-blacklist", "Quietly mark the guest as unreliable and tell the team not to indulge this kind of behavior again.", "Emotionally understandable, operationally reckless, morally cheap.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2], elena: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "power-outage-dinner-service",
    category: "Infrastructure Failure",
    pressure: "Extreme",
    headline: "Half the restaurant loses power during dinner service and the room instantly splits into darkness, confusion, and candlelit optimism",
    body:
      "The right side can still hear jazz. The left side can hear somebody asking whether the freezer is humming.",
    beats: [
      beat("opening", "One side of the dining room goes dark while the kitchen loses selected equipment", "The room is now operating on vibe, flashlights, and raw nerve.", "devon", "Parker says the first choice is whether to shrink the night or bluff your way through it.", [
        action("po-open-scope", "Immediately map what still works, freeze unsafe zones, and shrink service to what the team can actually support.", "You lose some sales and keep the room from turning into folklore.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1], elena: [1, 1] }]),
        action("po-open-candles", "Lean into ambience on the dining room side while quietly checking the kitchen's real operating limits.", "Useful for guest mood, provided the back line is not secretly collapsing.", [1, 1, 1, { elena: [1, 1], devon: [1, 1] }]),
        action("po-open-pause", "Pause all new seating until the team understands the outage footprint, even if the lobby gets irritated.", "Painful now, but it stops you from selling a service the room cannot deliver.", [-1, 2, 3, { elena: [1, 2], devon: [1, 1] }]),
        action("po-open-normal", "Keep seating and firing normally while you trust the outage will resolve quickly.", "Nothing says confidence like guessing with refrigeration on the line.", [2, -2, -4, { devon: [-2, -3], tasha: [-1, -2] }])
      ]),
      beat("guests", "Tables are asking whether dinner is still safe and whether checks will be adjusted", "Now the room needs truth without fear contagion.", "elena", "Marisol says calm honesty feels fancier than evasive smiling in the dark.", [
        action("po-guests-clear", "Tell guests exactly which areas are affected, what still works, and what the team is doing to keep service safe.", "Specificity lowers panic better than charm ever will.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("po-guests-options", "Offer guests a choice to stay with a reduced menu, relocate, or settle up early without penalty.", "Fair and empowering, though it does invite some exits.", [0, 1, 3, { elena: [1, 2], marcus: [1, 1] }]),
        action("po-guests-soft", "Keep messaging light and upbeat while avoiding too much detail until the system stabilizes.", "The tone helps, but ambiguity has a short shelf life.", [1, 1, 1, { nina: [1, 1], devon: [0, 1] }]),
        action("po-guests-minimize", "Say it is 'basically nothing' so the room does not overreact.", "That works right up until someone notices the basically dark wall.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("kitchen", "The line can still produce some food, but timing and holding conditions are getting ugly", "Chef Renata wants a call before the kitchen starts improvising history.", "tasha", "Chef Renata says a smaller honest menu beats a bigger lie every single time.", [
        action("po-kitchen-reduce", "Cut to a limited outage menu built around equipment you know is safe and stable.", "You lose variety and regain control.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("po-kitchen-batch", "Batch a few safest items fast so the dining room stays moving while you diagnose the rest.", "Smart in short bursts, though not a substitute for a real outage plan.", [1, 1, 1, { tasha: [1, 1], luis: [1, 1] }]),
        action("po-kitchen-hold", "Keep the full menu alive only for tables already seated and cut future orders gradually.", "Merciful to current guests, but it lengthens the period where too many things can go wrong.", [0, 1, 2, { tasha: [0, 1], priya: [1, 1] }]),
        action("po-kitchen-push", "Tell the line to hustle harder and keep every station live so the outage does not cost momentum.", "A motivational poster disguised as a safety plan.", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("money", "The owner wants to know how aggressive you plan to be with comps and canceled items", "Now survival math is staring hospitality in the face.", "marcus", "Omar says fairness and panic generosity are not the same thing.", [
        action("po-money-targeted", "Comp only the clearly affected failures while protecting trust with direct, specific adjustments.", "That feels deliberate instead of desperate.", [0, 2, 3, { marcus: [2, 2], nina: [1, 1] }]),
        action("po-money-flat", "Offer a modest outage credit to all affected tables for consistency and speed.", "Simple and decent, though expensive if the outage is broader than first thought.", [-1, 1, 2, { marcus: [1, 1], devon: [1, 1] }]),
        action("po-money-future", "Issue future-visit cards instead of heavy same-night discounts to preserve tonight's cash flow.", "Strategic, but some guests may read it as borrowing patience from tomorrow.", [1, 1, 1, { marcus: [1, 1], elena: [0, 1] }]),
        action("po-money-none", "Avoid comps entirely because the outage was outside the restaurant's control.", "Also outside the guests' control, unfortunately.", [1, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("final", "Power is returning unevenly, and the room needs a clean ending", "The night can still finish as resilience or confusion.", "jake", "Adrian says people remember how a shaky night ended even more than how it started.", [
        action("po-final-close", "Close the weakest zones, finish strong in the safe areas, and thank guests with a steady final update.", "It is not glamorous, but it feels competent all the way to the door.", [0, 2, 4, { jake: [1, 1], devon: [2, 2], elena: [1, 1] }]),
        action("po-final-extend", "Offer lingering dessert or drinks only to the tables that rode out the outage best.", "A nice touch if the team still has legs and product.", [1, 1, 1, { jake: [1, 1], nina: [1, 1] }]),
        action("po-final-reset", "Reopen sections gradually as power returns instead of pretending the whole room is normal again instantly.", "Cautious and smart, even if a few empty tables stare at you accusingly.", [0, 1, 3, { devon: [1, 2], tasha: [1, 1] }]),
        action("po-final-rally", "Announce to the room that Feast Haven 'beat the blackout' and return to normal service immediately.", "Bold. Premature. Memorable for the wrong reason if anything flickers again.", [2, -2, -4, { devon: [-2, -3], jake: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "staff-group-chat-revolt",
    category: "Internal Culture",
    pressure: "High",
    headline: "You discover the staff group chat is exploding with complaints about management and half the team assumes you have already seen it",
    body:
      "The screenshots are spicy, the memes are accurate enough to sting, and morale is now wearing sneakers and running around the building.",
    beats: [
      beat("opening", "A manager gets shown the group chat mid-shift", "The messages are funny, brutal, and suspiciously specific about leadership failures.", "marcus", "Omar says the first move decides whether this becomes truth-telling, spying, or a mutiny with Wi-Fi.", [
        action("gc-open-hold", "Say nothing publicly yet, gather the core complaints, and avoid turning private venting into instant courtroom drama.", "It buys thought before ego starts talking.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1] }]),
        action("gc-open-ack", "Privately tell a trusted staff lead you know the team is upset and you want a real conversation after the rush.", "It signals maturity, though it may still raise anxiety about who showed you what.", [0, 1, 2, { marcus: [1, 1], nina: [1, 1] }]),
        action("gc-open-observe", "Keep the shift moving and watch whether the complaints match what the floor already feels like.", "Useful, but it risks looking passive if people know you know.", [1, 1, 1, { devon: [1, 1], jake: [0, 1] }]),
        action("gc-open-bust", "Walk into pre-bus and announce that management sees everything and disloyalty has consequences.", "A bold approach if your dream is to lose trust in HD.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -2], jake: [-1, -1] }])
      ]),
      beat("shift", "The complaints mention understaffing, mixed messages, and favoritism", "Unfortunately, the chat is not inventing all of this.", "devon", "Parker says the team will notice whether leadership addresses the substance or only the disrespect.", [
        action("gc-shift-fix", "Quietly solve one visible pain point during the shift so the team sees action before speeches.", "Small competence lands harder than big wounded feelings.", [0, 2, 4, { devon: [2, 2], marcus: [1, 1], elena: [1, 1] }]),
        action("gc-shift-note", "Take the issues seriously on paper and promise a focused debrief after service.", "A respectable move, though the team may grade you on whether tomorrow actually arrives.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("gc-shift-lead", "Ask one respected veteran to help stabilize the floor while you sort the emotional smoke later.", "Pragmatic, but it leans on peer leadership instead of management courage.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("gc-shift-search", "Start trying to identify exactly who wrote the harshest messages so you know where the problem lives.", "The problem lives in the messages, unfortunately not just in the senders.", [2, -2, -4, { devon: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("meeting", "Staff want to know whether there will be consequences for what was said", "You need accountability without turning honest frustration into a crime scene.", "nina", "Celia says if people only learn 'never say it out loud,' the culture gets quieter and worse.", [
        action("gc-meeting-amnesty", "Offer a short amnesty window for honest feedback and keep the focus on patterns, not authors.", "That tells the team the point is repair, not revenge.", [0, 2, 4, { nina: [2, 2], marcus: [1, 1] }]),
        action("gc-meeting-boundaries", "Separate tone from substance: unacceptable disrespect gets named, but the complaints still get addressed.", "Balanced and adult, though harder to deliver without sounding rehearsed.", [0, 1, 3, { nina: [1, 2], devon: [1, 1] }]),
        action("gc-meeting-structured", "Collect concerns anonymously and move everything into a formal improvement agenda.", "Safe and sensible, but a little sterile for a crew that is clearly boiling over.", [1, 1, 1, { nina: [1, 1], elena: [1, 1] }]),
        action("gc-meeting-warning", "Tell the team group chats are for logistics, not criticism, and formal complaints must go upward only.", "A brilliant way to make the next group chat private and nuclear.", [2, -2, -4, { nina: [-2, -3], marcus: [-1, -2] }])
      ]),
      beat("truth", "Some complaints are petty, but some are uncomfortably correct", "Now management has to choose humility or posture.", "jake", "Adrian says the floor can smell fake ownership from across the room.", [
        action("gc-truth-own", "Publicly own the specific management misses that are real and outline what changes first.", "It stings for thirty seconds and heals for weeks.", [0, 2, 4, { jake: [1, 1], nina: [2, 2], devon: [1, 1] }]),
        action("gc-truth-share", "Acknowledge the truth while also explaining the pressures management has been carrying poorly.", "Human and nuanced, though a few staff may hear it as partial excuse.", [0, 1, 2, { jake: [1, 1], devon: [1, 1] }]),
        action("gc-truth-pilot", "Pick one complaint to solve fast and one to revisit after more data instead of promising everything.", "Disciplined and believable, if not emotionally satisfying in the moment.", [1, 1, 1, { marcus: [1, 1], devon: [1, 1] }]),
        action("gc-truth-spin", "Remind everyone that every workplace has negativity and that perspective matters.", "True in the way rain is wet and unhelpful.", [2, -2, -4, { jake: [-2, -2], nina: [-2, -3], marcus: [-1, -1] }])
      ]),
      beat("final", "The staff is waiting to see whether tonight was a release valve or a turning point", "What you formalize next decides whether the chat becomes quieter or healthier.", "elena", "Marisol says trust grows when people see there is now a safer room than the group thread.", [
        action("gc-final-rhythm", "Set a recurring staff pulse check with one visible fix tracked each cycle so venting has a better outlet than gossip.", "You just gave frustration somewhere more useful to live.", [0, 2, 4, { elena: [2, 2], marcus: [1, 1], nina: [1, 1] }]),
        action("gc-final-leads", "Create a rotating staff rep structure so concerns reach management before they become meme format.", "Strong and fair, though it depends on follow-through more than charm.", [-1, 2, 3, { elena: [2, 1], devon: [1, 1] }]),
        action("gc-final-clarity", "Tighten communication norms and scheduling consistency first so the loudest friction point actually improves.", "Practical and grounded, if slightly narrower than the full emotional problem.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("gc-final-surveillance", "Announce that unofficial staff channels will now be monitored for brand protection and workplace respect.", "You do not actually want the culture that sentence builds.", [2, -2, -4, { elena: [-2, -3], marcus: [-1, -2], nina: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "wrong-proposal",
    category: "Emotional Disaster",
    pressure: "Extreme",
    headline: "A proposal dessert is delivered to the wrong table, and the table that received it is absolutely not in a proposing mood",
    body:
      "Across the room the real proposer is standing up. At the wrong table, someone just whispered 'what is happening' like it was a curse.",
    beats: [
      beat("opening", "The dessert lands at the wrong table with the message still intact", "The room freezes, then begins choosing sides emotionally at high speed.", "elena", "Marisol says the first ten seconds decide whether this becomes tender recovery or public spectacle.", [
        action("wp-open-retrieve", "Pull the dessert back immediately with a sincere apology and move the wrong table into private service recovery.", "Fast, humble, and just barely ahead of total collapse.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("wp-open-own", "A manager steps in instantly, apologizes in full view, and asks both affected tables for thirty seconds of grace.", "Riskier in public, but sometimes public calm prevents public mythmaking.", [0, 1, 3, { elena: [1, 2], devon: [1, 1] }]),
        action("wp-open-pivot", "Quietly tell the wrong table it was a kitchen mix-up while the real proposal setup gets delayed.", "Useful for speed, though it may feel a little thin if emotions already sparked.", [1, 1, 1, { nina: [1, 1], jake: [0, 1] }]),
        action("wp-open-joke", "Try to lighten the moment with humor about surprise romance and adventurous pastry routing.", "Comedy is a sword made of soap here.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("real", "The actual proposer is now shaken and asking whether the moment is ruined", "Now you have one humiliated couple and one disappointed one.", "jake", "Adrian says the repair needs to feel intentional, not patched together with frosting and hope.", [
        action("wp-real-reset", "Offer a full reset with time, privacy, and a cleaner stage once the wrong table is cared for.", "It costs momentum and gives the proposal an actual chance to feel meaningful again.", [0, 2, 4, { jake: [2, 2], elena: [1, 1] }]),
        action("wp-real-alt", "Move the proposal to a quieter location and rebuild the moment with less audience pressure.", "Smart and elegant, though not every proposer wants the dream scene rewritten on the fly.", [0, 1, 2, { jake: [1, 1], devon: [1, 1] }]),
        action("wp-real-fast", "Push ahead quickly before nerves worsen and try to salvage energy through speed.", "It can work, but haste can make a proposal feel like an emergency drill.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("wp-real-comp", "Offer a heavy discount immediately and frame that as the main way to make it right.", "Money helps, but romance is not a receipt problem.", [1, -2, -4, { jake: [-2, -2], marcus: [-1, -1] }])
      ]),
      beat("wrongtable", "The wrong table turns out to be mid-argument and deeply embarrassed", "This is no longer cute collateral damage.", "nina", "Celia says the recovery must restore dignity before hospitality gets credit for anything else.", [
        action("wp-wrong-private", "Move them into private care, apologize without making them narrate their emotions, and give them space to reset.", "That is the rare recovery move that understands shame has volume.", [0, 2, 4, { nina: [2, 2], elena: [1, 1] }]),
        action("wp-wrong-comp", "Comp the table generously and keep the conversation short so they can leave with minimum friction.", "Kind and useful, though it can feel transactional if the emotional tone is ignored.", [0, 1, 2, { nina: [1, 1], marcus: [1, 1] }]),
        action("wp-wrong-care", "Ask what would help them feel most comfortable from here: privacy, reseating, a pause, or a quick exit.", "Excellent hospitality, though it asks stressed guests to think clearly while still hot.", [1, 1, 1, { nina: [1, 1], devon: [1, 1] }]),
        action("wp-wrong-minimize", "Tell them it was just a dessert mix-up and not to take it too personally.", "A strong candidate for the sentence least likely to work tonight.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("room", "Other guests are now following the drama like prestige television", "You need the room to release the story without feeding on it.", "devon", "Parker says discretion should become visible without becoming theatrical.", [
        action("wp-room-soften", "Quiet the room through steady service, subtle pacing, and zero extra commentary from staff.", "The restaurant starts feeling like a restaurant again.", [0, 2, 3, { devon: [2, 2], jake: [1, 1] }]),
        action("wp-room-redirect", "Time a service reset so new plates, fresh drinks, and attention pull eyes away from the incident.", "Operationally smart and socially soothing.", [1, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("wp-room-toast", "Create a small elegant moment for the real proposal table so the room has a better ending to focus on.", "Potentially beautiful, though it still keeps the whole room involved in someone else's life.", [1, 1, 1, { jake: [1, 1], nina: [0, 1] }]),
        action("wp-room-explain", "Tell curious guests what happened so they understand the staff is handling it responsibly.", "You do not need a plot recap to deliver dessert.", [1, -2, -4, { devon: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("final", "Both tables are calmer, and now the team needs a permanent fix", "Romance should not require incident response twice.", "marcus", "Omar says the root cause matters as much as the apology poetry.", [
        action("wp-final-protocol", "Build a locked verification step for custom celebration items before any plate leaves the pass.", "Boring excellence saves the most dramatic nights.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1], tasha: [1, 1] }]),
        action("wp-final-tags", "Add visible coded markers and one verbal confirmation point for proposal or surprise-service plates.", "Practical and fast, though still dependent on human attention under pressure.", [0, 1, 3, { marcus: [1, 2], tasha: [1, 1] }]),
        action("wp-final-owner", "Assign one manager as the owner for all high-emotion custom moments each night.", "Solid leadership, though one more thing now lives on one person's back.", [1, 1, 1, { devon: [1, 1], elena: [1, 1] }]),
        action("wp-final-ban", "Stop offering proposal desserts altogether so this can never happen again.", "A dramatic answer to a process problem.", [1, -2, -4, { marcus: [-2, -3], jake: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "free-meal-tiktok-hack",
    category: "Trend Panic",
    pressure: "High",
    headline: "A viral trend says customers can get free meals by saying a specific phrase, and now half your room is trying it with suspicious confidence",
    body:
      "Some people are joking. Some are testing you. A few are clearly ready to argue for sport.",
    beats: [
      beat("opening", "The phrase starts spreading from table to table", "One server laughs. Another looks like they want a new career.", "devon", "Parker says the response needs consistency more than swagger.", [
        action("fm-open-script", "Give the whole team one calm script: the phrase is not a valid promotion, but management can address actual service issues case by case.", "Consistency snuffs out the game better than improvisation.", [0, 2, 4, { devon: [2, 2], nina: [1, 1], jake: [1, 1] }]),
        action("fm-open-manager", "Route every phrase-user to a manager so servers stay out of the social media tug-of-war.", "Protective and clean, though it can flood management fast.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("fm-open-light", "Treat the first few attempts lightly and redirect with humor before the trend fully hardens.", "Could work if the room is playful, dangerous if it reads as inconsistent enforcement.", [1, 1, 1, { jake: [1, 1], elena: [0, 1] }]),
        action("fm-open-fear", "Tell staff to shut it down hard so nobody gets the idea this nonsense will work.", "What guests hear is not 'policy.' It is 'hostility.'", [2, -2, -4, { devon: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("social", "Guests start recording the staff response itself", "Now the policy is also content.", "nina", "Celia says if the team sounds smug, the internet will cut out the part where the guest started it.", [
        action("fm-social-steady", "Respond the same way on and off camera, and keep the tone factual and almost boring.", "Boring is a surprisingly powerful anti-viral technology.", [0, 2, 4, { nina: [2, 2], devon: [1, 1] }]),
        action("fm-social-sign", "Post a small house notice clarifying that social media phrases are not promotions or payment methods.", "Clear and useful, though it risks making the stunt feel officially recognized.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("fm-social-message", "Post your own short online clarification while service continues inside.", "Helpful, but it splits attention during the exact moment the room needs focus.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("fm-social-clapback", "Have the restaurant account mock the trend so guests know you are not easy prey.", "The comments section would like to invite you to regret that.", [2, -2, -4, { nina: [-2, -3], devon: [-1, -1] }])
      ]),
      beat("edgecase", "One table uses the phrase after genuinely botched service", "Now fake claims and real recovery are sitting in the same chair.", "marcus", "Omar says fairness is harder when bad actors accidentally pick the right moment.", [
        action("fm-edgecase-separate", "Treat the service failure on its own merits and say the phrase itself remains irrelevant to the decision.", "That preserves both justice and policy.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1] }]),
        action("fm-edgecase-partial", "Offer a partial recovery tied to the mistake, not the trend, and explain that distinction clearly.", "Reasonable and teachable, though a little more legwork is required at the table.", [0, 1, 3, { marcus: [1, 2], devon: [1, 1] }]),
        action("fm-edgecase-gift", "Comp more generously than usual so the table does not become a bigger performance.", "Effective in the moment, but it can accidentally confirm the hack if overheard badly.", [1, 1, 1, { marcus: [1, 1], elena: [0, 1] }]),
        action("fm-edgecase-deny", "Refuse any recovery because you do not want the trend to look like leverage.", "A hard line that punishes the wrong variable.", [1, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("staff", "Servers are starting to improvise wildly different responses", "One room, five policies, instant chaos.", "jake", "Adrian says people can handle a scam trend. They cannot handle a team contradicting itself table by table.", [
        action("fm-staff-reset", "Pause for a 60-second floor reset so everyone gets the same language, escalation path, and limit on comps.", "Tiny interruption, huge reduction in drift.", [0, 2, 4, { jake: [2, 2], nina: [1, 1], devon: [1, 1] }]),
        action("fm-staff-sheet", "Put the response script in writing at the host stand and service station for quick reference.", "Not glamorous, extremely stabilizing.", [0, 1, 3, { jake: [1, 2], devon: [1, 1] }]),
        action("fm-staff-veterans", "Let the most seasoned staff handle the noisy tables while newer people focus on regular service.", "Strong triage, though it concentrates strain on the same few shoulders.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("fm-staff-freestyle", "Trust individual personalities to manage the trend creatively at each table.", "Creative in the way a grease fire is warm.", [2, -2, -4, { jake: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("final", "The trend quiets, but you know it will come back on another weekend", "Now you need a rule that protects margin without making the place feel defensive.", "elena", "Marisol says good policy should be memorable to staff and invisible to normal guests.", [
        action("fm-final-policy", "Build a micro-policy for fake social promotions that protects managers' discretion for real service recovery.", "Flexible where it should be, firm where it must be.", [0, 2, 4, { elena: [2, 2], marcus: [1, 1], nina: [1, 1] }]),
        action("fm-final-training", "Add one short trend-response module to pre-shift so the team can defuse the next wave faster.", "Practical and probably overdue.", [-1, 2, 3, { elena: [1, 2], devon: [1, 1] }]),
        action("fm-final-menu", "Create clearly posted real promotions so fake ones stand out as nonsense faster.", "Smart if your brand can support more overt offers.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("fm-final-penalty", "Add a mandatory fee for anyone who tries a social media phrase scam during service.", "The comments section would like that very much.", [2, -2, -4, { elena: [-2, -3], marcus: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "kitchen-equipment-meltdown",
    category: "Operations Failure",
    pressure: "Extreme",
    headline: "Multiple key pieces of kitchen equipment start failing at the worst possible time and the line is suddenly one bad sound away from mutiny",
    body:
      "The printer stutters, a burner dies, refrigeration gets moody, and the fry station starts bargaining with gravity.",
    beats: [
      beat("opening", "The line realizes this is not one breakdown but a cluster", "Every next ticket now feels personally offensive to the kitchen.", "tasha", "Chef Renata says the first call has to trade fantasy for survival.", [
        action("ke-open-triage", "Triage the failures fast, shut down the riskiest stations, and rebuild the menu around what still works cleanly.", "Brutal but honest. The kitchen can work with honest.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("ke-open-tech", "Call emergency repair immediately while the line keeps a reduced version of full service alive.", "Smart if repair is quick, stressful if the machines laugh at you.", [1, 1, 1, { tasha: [1, 1], devon: [0, 1] }]),
        action("ke-open-shift", "Redistribute production creatively across still-working equipment before cutting anything publicly.", "Resourceful, though a little too dependent on perfect execution under stress.", [0, 1, 2, { luis: [1, 1], priya: [1, 1] }]),
        action("ke-open-push", "Tell the kitchen to muscle through normal service while you wait for more complete failure information.", "A management style best described as 'let's discover the bottom together.'", [2, -2, -4, { tasha: [-2, -3], luis: [-2, -2], priya: [-2, -2] }])
      ]),
      beat("menu", "Front of house needs to know what they can still sell with confidence", "A confused floor can wreck trust faster than a broken grill.", "devon", "Parker says the menu needs clarity more than optimism.", [
        action("ke-menu-cut", "Issue a stripped but reliable outage menu and tell the floor exactly what to stop promising.", "The room loses choice and gains honesty.", [0, 2, 4, { devon: [2, 2], elena: [1, 1], nina: [1, 1] }]),
        action("ke-menu-tier", "Create green-light, caution, and paused items so servers can steer guests without full menu collapse.", "Nuanced and useful, though harder to communicate cleanly at speed.", [1, 1, 1, { devon: [1, 1], nina: [1, 1] }]),
        action("ke-menu-discretion", "Let veteran servers freestyle alternatives table by table so the room feels more personalized.", "Good hands can make this sing. Average hands can make it lie.", [1, 0, 1, { jake: [1, 1], elena: [0, 1] }]),
        action("ke-menu-hide", "Keep the printed menu unchanged and hope charm fills the gaps once orders start missing.", "Charm has many powers. Actual inventory is not one of them.", [2, -2, -4, { devon: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("guests", "Delays are now visible and tables are noticing the weird substitutions", "Transparency is about to become a financial decision.", "elena", "Marisol says guests can handle bad news earlier better than confusing news later.", [
        action("ke-guests-early", "Tell affected tables early that the kitchen is operating on limited equipment and guide them toward the strongest options.", "The honesty buys patience and protects your team from inventing miracles.", [0, 2, 3, { elena: [2, 2], nina: [1, 1] }]),
        action("ke-guests-perk", "Pair the bad news with a small goodwill touch so the limitation feels cared for instead of dumped.", "Helpful, though not every problem needs a snack-shaped apology.", [-1, 1, 2, { elena: [1, 1], marcus: [1, 1] }]),
        action("ke-guests-delay", "Wait to say more until the kitchen confirms exactly how bad the failures really are.", "Understandable, but silence gets expensive if the tables wait too long.", [1, 1, 1, { devon: [0, 1], nina: [1, 1] }]),
        action("ke-guests-spin", "Tell tables the kitchen is 'trying something new tonight' to make the outages sound intentional.", "A lie plated with garnish is still a lie.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("staff", "The line is irritated that management wants calm while the machines are falling apart", "Morale is now an operating variable.", "marcus", "Omar says staff can tolerate hard nights better than delusional instructions.", [
        action("ke-staff-own", "Acknowledge the strain plainly, cut nonessential asks, and give the kitchen one realistic win condition for the night.", "Respectful, clear, and strangely energizing.", [0, 2, 4, { marcus: [2, 2], tasha: [1, 1], luis: [1, 1], priya: [1, 1] }]),
        action("ke-staff-rotate", "Rotate the most broken stations so no one person eats all the equipment rage.", "Fair and humane, though slightly less efficient.", [-1, 2, 2, { marcus: [2, 1], luis: [1, 1], priya: [1, 1] }]),
        action("ke-staff-bonus", "Promise a make-good perk later if everyone drags the night across the finish line now.", "Motivating if trusted, hollow if the team already doubts follow-through.", [1, 1, 1, { marcus: [1, 1], tasha: [0, 1] }]),
        action("ke-staff-grit", "Tell the line this is where professionals prove themselves and leave it at that.", "Inspiring in movies, infuriating in aprons.", [2, -2, -4, { marcus: [-2, -3], tasha: [-1, -2], luis: [-1, -1], priya: [-1, -1] }])
      ]),
      beat("final", "The kitchen survives, but you now know your systems are brittle", "The next choice decides whether this was bad luck or bad planning with a costume on.", "devon", "Parker says recovery should strengthen systems, not just celebrate endurance.", [
        action("ke-final-plan", "Build a real equipment contingency plan with reduced menus, vendor contacts, and ownership rules for outages.", "That is how tonight becomes training data instead of legend.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1], marcus: [1, 1] }]),
        action("ke-final-maintain", "Raise preventative maintenance and pre-shift equipment checks even if it costs time and budget.", "Less exciting than heroics, more useful than heroics.", [-1, 2, 3, { tasha: [2, 1], devon: [1, 1] }]),
        action("ke-final-cross", "Cross-train the floor and line more aggressively so outages do not isolate the same few people next time.", "Strong long-term culture move, though slower to pay off.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("ke-final-cheap", "Postpone repairs that still 'mostly work' and trust the team to be more adaptable next time.", "That sentence is how next time starts worse.", [2, -2, -4, { devon: [-2, -3], tasha: [-2, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "rival-restaurant-spy",
    category: "Competitive Threat",
    pressure: "High",
    headline: "You suspect someone inside Feast Haven is quietly feeding information to a competing restaurant across town",
    body:
      "Reservations keep getting undercut, specials leak early, and your team's confidence is starting to creak.",
    beats: [
      beat("opening", "The suspicion is real, but the proof is not", "One wrong accusation could hurt worse than the leak itself.", "marcus", "Omar says paranoia is expensive unless you turn it into evidence.", [
        action("rs-open-discreet", "Lock down sensitive information quietly and start tracking access patterns before confronting anyone.", "Cold, patient, and exactly the right kind of annoying to a real spy.", [0, 2, 4, { marcus: [2, 2], devon: [1, 1] }]),
        action("rs-open-circle", "Shrink advance planning to a smaller leadership circle until the source becomes clearer.", "Protective, though the rest of the staff may feel the trust pinch quickly.", [0, 1, 2, { marcus: [1, 1], nina: [1, 1] }]),
        action("rs-open-bait", "Float one low-stakes false detail to a narrow group and see whether it leaks outward.", "Smart if tightly controlled, dangerous if the bait itself causes confusion.", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("rs-open-accuse", "Confront the employee you find most suspicious and demand an explanation before the shift spreads.", "Nothing says calm investigation like a public leap off a cliff.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("impact", "The latest leak involves a special menu and a supplier negotiation", "Now the issue affects both revenue and pride.", "tasha", "Chef Renata says the kitchen can survive competition. It cannot survive acting sloppy about it.", [
        action("rs-impact-rotate", "Adjust the special quietly, protect the supplier conversation, and limit future access by relevance.", "It costs some ego and saves a lot more than ego.", [0, 2, 4, { tasha: [2, 2], priya: [1, 1], luis: [1, 1] }]),
        action("rs-impact-confirm", "Check which leak caused real harm and avoid overcorrecting every rumor as if it were espionage.", "Disciplined and smart, though it delays the emotional relief of 'doing something big.'", [0, 1, 3, { marcus: [1, 2], tasha: [1, 1] }]),
        action("rs-impact-counter", "Rush a competing surprise special out early so the rival's leaked info becomes stale.", "Bold and clever, but it can force your own team into reactive sloppiness.", [1, 1, 1, { tasha: [1, 1], jake: [0, 1] }]),
        action("rs-impact-lock", "Punish the whole staff by heavily restricting information and blaming leaks for the loss of trust.", "Group punishment is a beautiful way to create more reasons to leak.", [2, -2, -4, { tasha: [-1, -2], marcus: [-2, -3], elena: [-1, -1] }])
      ]),
      beat("suspects", "Two people now look possible for very different reasons", "One is careless. One is secretive. Neither is proven.", "elena", "Marisol says secretive and guilty are cousins, not twins.", [
        action("rs-suspects-process", "Investigate behaviors and access logs, not personalities, before narrowing anything further.", "That is how adults avoid turning intuition into defamation.", [0, 2, 4, { elena: [2, 2], marcus: [1, 1] }]),
        action("rs-suspects-checkin", "Hold neutral one-on-one check-ins about process sensitivity without naming the leak theory yet.", "Useful and less explosive, though the guilty party may get a courtesy warning.", [0, 1, 2, { elena: [1, 1], devon: [1, 1] }]),
        action("rs-suspects-monitor", "Increase quiet monitoring on the top suspects while keeping the wider team flow normal.", "Effective if subtle, ugly if it starts feeling personal without cause.", [1, 1, 1, { marcus: [1, 1], elena: [0, 1] }]),
        action("rs-suspects-gossip", "Let the suspicion circulate informally so the guilty person feels pressure and slips.", "Or the innocent person does.", [2, -2, -4, { elena: [-2, -3], marcus: [-1, -2], nina: [-1, -1] }])
      ]),
      beat("culture", "People can feel that trust is changing even if nobody says the word spy aloud", "Now morale and secrecy are starting to shake hands.", "devon", "Parker says the team needs security without the feeling of living in a thriller.", [
        action("rs-culture-clarity", "Explain that sensitive planning is being tightened because of competitive leakage risk, not because management has decided anyone is guilty.", "It is the rare security move that still treats people like grownups.", [0, 2, 3, { devon: [2, 2], elena: [1, 1] }]),
        action("rs-culture-values", "Re-center the team on trust, professionalism, and what information actually belongs in the building.", "Good values language, though a little abstract if fear is already humming.", [0, 1, 2, { devon: [1, 1], marcus: [1, 1] }]),
        action("rs-culture-small", "Say very little and keep the changes operational so the staff does not spiral into narratives.", "Calm on the surface, but secrecy invites its own fiction.", [1, 1, 1, { devon: [0, 1], nina: [1, 1] }]),
        action("rs-culture-loyalty", "Make everyone publicly affirm loyalty to Feast Haven and condemn whoever is betraying the house.", "Nothing builds trust like mandatory theater.", [2, -2, -4, { devon: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("final", "You finally identify the likely source, but the team never saw the investigation", "The ending now has to balance justice, deterrence, and culture.", "nina", "Celia says how you close this will teach the team whether truth arrives calmly or theatrically.", [
        action("rs-final-formal", "Handle the evidence formally, remove access appropriately, and communicate only what the team truly needs to know.", "Clean process keeps the building from becoming a rumor tomb.", [0, 2, 4, { nina: [2, 2], marcus: [1, 1], devon: [1, 1] }]),
        action("rs-final-private", "Confront the person privately, secure an explanation, and decide consequences without a public spectacle.", "Thoughtful and controlled, though it may feel softer than some staff expect if the leak was costly.", [0, 1, 3, { nina: [1, 2], elena: [1, 1] }]),
        action("rs-final-system", "Focus the closing message more on new safeguards than on the individual who failed them.", "Wise if the goal is prevention, slightly unsatisfying if people crave resolution.", [1, 1, 1, { devon: [1, 1], marcus: [1, 1] }]),
        action("rs-final-example", "Expose the spy publicly so the whole team learns what betrayal looks like when caught.", "They will learn something, just maybe not the thing you wanted.", [2, -2, -4, { nina: [-2, -3], devon: [-1, -2], elena: [-1, -1] }])
      ])
    ]
  }),

  makeEvent({
    id: "celebrity-walk-in",
    category: "VIP Pressure",
    pressure: "High",
    headline: "A celebrity walks in unannounced with a large group and expects immediate VIP treatment on a night when the room is already tight",
    body:
      "The phones are up, the entourage is confident, and several paying guests suddenly look like they picked the wrong night to be normal.",
    beats: [
      beat("opening", "The celebrity wants a prime section now, not after a wait", "So does the reservation book, unfortunately.", "elena", "Marisol says the decision has to protect the room you actually sold, not just the headline you might get.", [
        action("cw-open-balance", "Offer the celebrity a strong but realistic accommodation that does not displace already committed guests unfairly.", "You honor the moment without making your own reservations meaningless.", [0, 2, 4, { elena: [2, 2], devon: [1, 1] }]),
        action("cw-open-private", "Use a semi-private area creatively and sell it as intentional exclusivity rather than second-best timing.", "Smart and stylish, though it only works if the group buys the framing.", [1, 1, 1, { elena: [1, 1], jake: [1, 1] }]),
        action("cw-open-stagger", "Seat part of the party now and fold the rest in once a committed reservation clears naturally.", "Operationally workable, socially risky with status-sensitive guests.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("cw-open-bump", "Displace a regular booked table because the publicity upside seems too big to ignore.", "You can absolutely buy buzz by selling out the room that trusted you first.", [2, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("room", "Nearby tables quickly recognize the celebrity and start watching how you respond", "The room is now grading your fairness in real time.", "nina", "Celia says the rest of the house needs to feel managed, not demoted.", [
        action("cw-room-visible", "Increase visible care for the surrounding room so nobody feels abandoned to chase one famous table.", "People can forgive glamour faster than they can forgive neglect.", [0, 2, 4, { nina: [2, 2], jake: [1, 1], marcus: [1, 1] }]),
        action("cw-room-honest", "Be lightly transparent with impacted tables that an unplanned large-party arrival is straining pacing tonight.", "Honest enough to lower suspicion, gentle enough not to sound chaotic.", [0, 1, 2, { nina: [1, 1], elena: [1, 1] }]),
        action("cw-room-perks", "Target small extras to the guests most visibly affected by the disruption.", "A useful salve, though it can get expensive and still not answer fairness.", [-1, 1, 1, { marcus: [1, 1], nina: [1, 1] }]),
        action("cw-room-spin", "Tell guests that celebrity nights are part of what makes Feast Haven exciting.", "Maybe for the celebrity. Not for the couple now waiting behind the fern.", [1, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("entourage", "The celebrity's team starts asking for off-menu favors and tighter privacy control", "You now need boundaries that still feel premium.", "devon", "Parker says the line between VIP service and operational fantasy gets thin very fast.", [
        action("cw-entourage-boundary", "Offer a curated yes-list of premium accommodations and decline the rest cleanly and early.", "Luxury with edges is still luxury if the edges are elegant.", [0, 2, 4, { devon: [2, 2], tasha: [1, 1] }]),
        action("cw-entourage-manager", "Keep all special requests moving through one manager so the rest of the team stops getting fragmented.", "Protective and sane, though it loads one person heavily.", [0, 1, 2, { devon: [1, 1], nina: [1, 1] }]),
        action("cw-entourage-case", "Approve only the requests that also benefit the room's flow and image, then quietly defer the rest.", "Strategic and workable, if not entirely transparent.", [1, 1, 1, { devon: [1, 1], elena: [0, 1] }]),
        action("cw-entourage-anything", "Tell the team to say yes to everything because a good celebrity story is priceless.", "Then you discover the price in labor, timing, and rage.", [2, -2, -4, { devon: [-2, -3], tasha: [-1, -2], nina: [-1, -1] }])
      ]),
      beat("kitchen", "The celebrity asks for menu changes that will stress the line", "Now prestige is arguing with ticket times.", "tasha", "Chef Renata says fame does not lower the laws of throughput.", [
        action("cw-kitchen-feasible", "Approve only the customizations the kitchen can execute well without punishing the rest of the board.", "You protect quality instead of cosplaying as limitless.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("cw-kitchen-signature", "Offer a chef-guided alternative that feels special without blowing up line discipline.", "Very strong move if the celebrity values being guided more than being obeyed.", [0, 1, 3, { tasha: [1, 2], devon: [1, 1] }]),
        action("cw-kitchen-oneoff", "Grant one high-visibility custom ask and hold the line against the rest.", "Could land well, could invite a second and third ask immediately.", [1, 1, 1, { tasha: [1, 1], luis: [0, 1] }]),
        action("cw-kitchen-overrule", "Order the kitchen to make it happen no matter what because the guest matters more tonight.", "To whom, exactly, is the rest of the menu being served then?", [2, -2, -4, { tasha: [-2, -3], luis: [-1, -2], priya: [-1, -2] }])
      ]),
      beat("final", "The celebrity leaves happy enough, but the room remembers how you handled power", "Now you choose the lesson the team takes from it.", "marcus", "Omar says if the building learns that status overrides structure, next weekend gets uglier before it gets richer.", [
        action("cw-final-policy", "Build a clear large-VIP walk-in protocol that protects prior reservations and defines premium boundaries.", "That is how star power stops becoming random weather.", [0, 2, 4, { marcus: [2, 2], elena: [1, 1], devon: [1, 1] }]),
        action("cw-final-debrief", "Debrief what worked and where the room felt unfair so future VIP nights do less collateral damage.", "Thoughtful and useful, even if not especially glamorous.", [-1, 2, 3, { marcus: [2, 1], nina: [1, 1] }]),
        action("cw-final-pr", "Quietly leverage the celebrity visit in future marketing while keeping the staff-focused lessons separate.", "Strategic, though a little too tidy if the team still feels bruised.", [1, 1, 1, { nina: [1, 1], marcus: [0, 1] }]),
        action("cw-final-legend", "Celebrate the night as proof that Feast Haven always bends for stars and high-profile moments.", "You just taught the room who really owns the floor.", [2, -2, -4, { marcus: [-2, -3], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "kids-gone-wild-table",
    category: "Dining Room Disruption",
    pressure: "High",
    headline: "A table of children is running through the restaurant, screaming, and turning chair legs into parkour while the parents scroll like nothing is happening",
    body:
      "The room has entered the dangerous zone where sympathy for kids is losing to fear of flying forks.",
    beats: [
      beat("opening", "The first lap around the dining room gets nervous laughs", "The second lap starts hitting servers' fight-or-flight systems.", "elena", "Marisol says the parents need a path back to authority before the whole room starts parenting for them.", [
        action("kg-open-parent", "Address the parents early, kindly, and specifically about safety and disruption before resentment hardens around the room.", "Clear, respectful, and timely enough to still feel like hospitality.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("kg-open-kids", "Offer the table a few child-friendly distractions and reset the energy without making it a scolding scene.", "Helpful if the parents are reachable, limited if they are determined to vanish emotionally.", [0, 1, 2, { elena: [1, 1], jake: [1, 1] }]),
        action("kg-open-server", "Have the server test the temperature with a soft table check before a manager steps in.", "It can work, though it places a lot of social labor on one already exposed person.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("kg-open-shame", "Call out the running loudly enough that the parents cannot pretend not to notice anymore.", "They notice. So does every table with ears.", [2, -2, -4, { elena: [-2, -3], jake: [-1, -2] }])
      ]),
      beat("room", "Nearby diners are getting visibly irritated and one server nearly collides with a child", "Now this is safety, not just annoyance.", "devon", "Parker says once staff safety enters the room, the line gets firmer whether parents like it or not.", [
        action("kg-room-boundary", "Set a firmer boundary with the parents that the children must remain seated or the meal needs to conclude.", "It is direct, justified, and still framed around safety instead of judgment.", [0, 2, 4, { devon: [2, 2], elena: [1, 1], marcus: [1, 1] }]),
        action("kg-room-relocate", "Offer a faster-finishing setup or more secluded corner if the family wants help settling the kids.", "Compassionate and practical, though it can feel like reward if read badly.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("kg-room-repair", "Stabilize the neighboring tables first with apologies and service touches while one manager handles the family.", "Good triage, though it leaves the source problem alive a little longer.", [1, 1, 1, { nina: [1, 1], marcus: [1, 1] }]),
        action("kg-room-threat", "Warn the family that staff will call security if one child runs again.", "There may be a world where that is the first move. This is not it.", [1, -2, -4, { devon: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("parents", "The parents say the kids are 'just energetic' and the restaurant should be more understanding", "Now tone matters as much as policy.", "jake", "Adrian says the answer has to respect the family without asking the room to absorb the risk.", [
        action("kg-parents-reframe", "Acknowledge the challenge of dining with kids and calmly return to the non-negotiable safety issue.", "That keeps empathy from dissolving the actual boundary.", [0, 2, 4, { jake: [2, 2], elena: [1, 1] }]),
        action("kg-parents-choice", "Offer a choice between resetting the table with support or packing the meal to go if the room cannot settle.", "Fair and practical, though still likely to sting the parents' pride.", [0, 1, 2, { jake: [1, 1], devon: [1, 1] }]),
        action("kg-parents-speed", "Prioritize their remaining food and check so an easier exit becomes attractive without open conflict.", "Smartly indirect, though it can feel manipulative if noticed.", [1, 1, 1, { jake: [1, 1], marcus: [0, 1] }]),
        action("kg-parents-lecture", "Explain that good parents do not let children behave this way in a nice restaurant.", "Probably true to someone. Catastrophic from you.", [2, -2, -4, { jake: [-2, -3], elena: [-1, -2] }])
      ]),
      beat("staff", "The staff is split between sympathy and complete emotional collapse", "The room has become a cultural Rorschach test.", "marcus", "Omar says the team needs to know management will not let them eat chaos in silence.", [
        action("kg-staff-support", "Back the team clearly, reassign the most exposed section, and keep one manager owning the family conversation.", "Support becomes visible instead of theoretical.", [0, 2, 4, { marcus: [2, 2], nina: [1, 1], devon: [1, 1] }]),
        action("kg-staff-relief", "Rotate a calmer veteran into the section and pull the most rattled server off the hot edge for ten minutes.", "Very humane, a little costly, absolutely worth considering.", [-1, 2, 2, { marcus: [2, 1], jake: [1, 1] }]),
        action("kg-staff-focus", "Tell the team to stay professional and push through while management handles the family directly.", "Strong if the team trusts the handling; thinner if they think 'push through' means 'eat it.'", [1, 1, 1, { marcus: [1, 1], devon: [0, 1] }]),
        action("kg-staff-grit", "Remind everyone that dealing with families is just part of hospitality and not to be dramatic.", "A dazzling way to set morale on fire using logic.", [2, -2, -4, { marcus: [-2, -3], nina: [-1, -1], jake: [-1, -2] }])
      ]),
      beat("final", "The family leaves, but the room and the team are still buzzing", "You now need a policy that protects joy without tolerating chaos.", "nina", "Celia says the goal is a family-friendly room, not a lawless one.", [
        action("kg-final-policy", "Set a child-safety response policy that gives staff language, escalation steps, and early manager support.", "It turns an emotional mess into a professional tool.", [0, 2, 4, { nina: [2, 2], elena: [1, 1], marcus: [1, 1] }]),
        action("kg-final-family", "Add a few subtle family-support touches so prevention starts earlier next time.", "Smart and generous, though not a substitute for real boundaries.", [0, 1, 2, { elena: [1, 1], nina: [1, 1] }]),
        action("kg-final-zones", "Create clearer seating guidance for young families during the busiest windows.", "Operationally smart, though it walks close to sounding exclusionary if framed poorly.", [1, 1, 1, { devon: [1, 1], elena: [0, 1] }]),
        action("kg-final-ban", "Adopt a strict no-children-under-ten rule during peak service.", "Easy to enforce, easier to hate, and probably not the restaurant you actually want to run.", [2, -2, -4, { nina: [-2, -3], elena: [-1, -2] }])
      ])
    ]
  }),

  makeEvent({
    id: "everything-sold-out-disaster",
    category: "Supply Failure",
    pressure: "High",
    headline: "A supplier miss leaves you out of multiple signature items right as the dinner rush hits full speed",
    body:
      "The menu still looks confident. The walk-in does not.",
    beats: [
      beat("opening", "The team realizes several anchor dishes are already gone", "This is not one substitution. It is a personality transplant for the menu.", "tasha", "Chef Renata says the first move should cut fantasy before the floor sells it.", [
        action("so-open-trim", "Cut the unavailable items immediately and rebuild the live menu around what the kitchen can still execute strongly.", "Painful, but strength is now more valuable than breadth.", [0, 2, 4, { tasha: [2, 2], luis: [1, 1], priya: [1, 1] }]),
        action("so-open-sub", "Design guided substitutes for the sold-out anchors so servers can redirect with confidence.", "Smart if the substitutes are genuinely good, dangerous if they feel like emotional coupons.", [1, 1, 1, { tasha: [1, 1], jake: [1, 1] }]),
        action("so-open-stage", "Leave the menu mostly intact for seated tables and sell out items progressively as needed.", "This preserves optionality but multiplies disappointment one table at a time.", [0, 1, 2, { devon: [0, 1], elena: [1, 1] }]),
        action("so-open-stretch", "Try to make the remaining product cover the missing dishes with creative portioning and language.", "Nothing builds trust like surprise half-reality.", [2, -2, -4, { tasha: [-2, -3], marcus: [-1, -1] }])
      ]),
      beat("front", "The first guests hit the sold-out wall and immediately ask what else is missing", "Confidence is now a front-door currency.", "elena", "Marisol says honesty delivered well still feels better than optimism delivered late.", [
        action("so-front-clear", "Tell guests early which signatures are gone and steer them toward what the kitchen is strongest on tonight.", "Clarity lowers resentment because nobody feels ambushed.", [0, 2, 4, { elena: [2, 2], nina: [1, 1] }]),
        action("so-front-curate", "Have the host and servers frame the night around a 'chef-forward limited board' so scarcity sounds intentional but not false.", "Elegant if carefully worded, slippery if oversold.", [1, 1, 1, { elena: [1, 1], jake: [1, 1] }]),
        action("so-front-perk", "Offer a small dessert or drink pathway for guests visibly disappointed by a missing signature.", "Helpful to the mood, expensive as a habit.", [-1, 1, 2, { marcus: [1, 1], nina: [1, 1] }]),
        action("so-front-wait", "Let guests settle in before revealing what is sold out so they are already invested in staying.", "That is not hospitality. That is bait wearing candles.", [1, -2, -4, { elena: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("staff", "Servers want a simple story, not five improvisations about supply chains", "If the floor drifts, the room will drift harder.", "devon", "Parker says the team needs a short honest language set, not TED Talks.", [
        action("so-staff-script", "Give the floor a concise sold-out script plus the best redirect pairings for every missing item.", "People serve better when they do not have to invent courage and copy at once.", [0, 2, 4, { devon: [2, 2], jake: [1, 1], nina: [1, 1] }]),
        action("so-staff-lead", "Let veterans anchor the heaviest explanation tables while newer staff mirror their phrasing.", "Good triage, though a little reliant on who can carry emotional weight tonight.", [1, 1, 1, { jake: [1, 1], devon: [0, 1] }]),
        action("so-staff-board", "Post a live sold-out board at the service station so the team's facts stay current.", "Quietly powerful, if someone actually keeps it current under fire.", [0, 1, 3, { devon: [1, 2], marcus: [1, 1] }]),
        action("so-staff-freestyle", "Let each server explain the shortages in their own style so the room still feels personal.", "Personal is not the same thing as consistent, sadly.", [2, -2, -4, { devon: [-2, -3], nina: [-1, -1] }])
      ]),
      beat("money", "The owner wants to know whether to discount aggressively to offset disappointment", "Margin and trust are both staring at you with crossed arms.", "marcus", "Omar says generosity is strongest when it is targeted, not panicked.", [
        action("so-money-targeted", "Use specific recovery only where a missing signature materially changed the guest's decision.", "That keeps fairness visible without setting your margins on fire.", [0, 2, 3, { marcus: [2, 2], nina: [1, 1] }]),
        action("so-money-upgrade", "Offer smart value swaps so guests feel guided toward something strong rather than downgraded into compromise.", "That preserves both dignity and dollars when the substitutes genuinely sing.", [1, 1, 2, { marcus: [1, 1], jake: [1, 1] }]),
        action("so-money-small", "Give a modest universal courtesy to tables most delayed by the menu pivot.", "Simple and decent, if slightly blunt as a financial instrument.", [-1, 1, 1, { marcus: [1, 1], devon: [1, 1] }]),
        action("so-money-none", "Offer nothing because shortages are a supplier problem, not a restaurant problem.", "To the guest, they are extremely a restaurant problem.", [1, -2, -4, { marcus: [-2, -3], nina: [-1, -2] }])
      ]),
      beat("final", "You make it through service, but sold-out nights cannot keep feeling improvised", "The next move should build resilience, not just a prettier apology.", "nina", "Celia says trust grows when scarcity is managed before it arrives at table seven.", [
        action("so-final-forecast", "Tighten forecasting, backup supplier plans, and pre-service sold-out decision rules for signature items.", "That is boring in the exact way sustainable restaurants need.", [0, 2, 4, { nina: [2, 2], tasha: [1, 1], marcus: [1, 1] }]),
        action("so-final-design", "Rebalance the menu so fewer dishes depend on the same vulnerable supply points.", "A smart strategic fix with slower visible payoff.", [-1, 2, 3, { tasha: [2, 1], marcus: [1, 1] }]),
        action("so-final-alert", "Create an internal sold-out trigger system so front and back of house sync faster on future shortages.", "Strong operational glue, even if less glamorous than menu reinvention.", [0, 1, 2, { devon: [1, 1], elena: [1, 1] }]),
        action("so-final-premium", "Raise prices on the remaining available signatures whenever shortages hit so the night still pencils out.", "A finance move written by a cartoon silk villain.", [2, -2, -4, { nina: [-2, -3], marcus: [-1, -2] }])
      ])
    ]
  })
];

module.exports = FEAST_HAVEN_EVENTS.slice(0, 12);
