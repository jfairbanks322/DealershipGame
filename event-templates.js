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

module.exports = [
  {
    id: "allergen-near-miss",
    category: "Guest Safety",
    pressure: "Extreme",
    headline: "A teen at a birthday table used an EpiPen after your staff promised the fries were allergen-safe",
    body:
      "The guest is breathing again, but the parents are furious, the server is crying, and the kitchen insists cross-contact was always possible. Nobody knows yet whether this was a bad promise, a bad process, or both.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you pull in first?",
        body: "This is already bigger than a comped dessert. One wrong instinct turns a near-miss into a trust collapse.",
        consultants: {
          nina: {
            prompt: "Celia admits she told the table the fries were safe because the kitchen had served them to 'careful' guests before.",
            options: [
              opt("an-open-celia-audit", "Freeze the table conversation and reconstruct exactly what Celia promised and what she was told.", "You slow the panic down long enough to find out whether the promise was invented or inherited.", "triage", fx(0, 1, 2, { nina: st(1, 2), tasha: st(-1, 0), priya: st(0, 1) })),
              opt("an-open-celia-protect", "Protect Celia first and treat this as an unlucky guest reaction until proven otherwise.", "You buy her emotional cover, but the family immediately senses the restaurant is choosing itself first.", "triage", fx(0, -2, -2, { nina: st(2, 2), tasha: st(-1, -1), devon: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata says the kitchen never approved a blanket allergy guarantee and wants the ingredient chain pulled apart immediately.",
            options: [
              opt("an-open-renata-trace", "Audit the fryer, ingredients, and prep flow with Chef Renata before anyone speaks in absolutes again.", "You start with hard facts, which may anger the family in the moment but protects the truth.", "triage", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 1), nina: st(-1, -1) })),
              opt("an-open-renata-deflect", "Tell Renata to stay in the background while the floor tries to keep the family calm.", "The dining room gets attention fast, but the kitchen now feels like leadership is afraid of the facts.", "triage", fx(1, -1, -1, { tasha: st(-2, -3), nina: st(1, 1) }))
            ]
          }
        }
      },
      triage: {
        title: "The family wants an answer before they decide whether to call a lawyer, an ambulance, or the internet",
        body: "You do not yet know whether the restaurant caused the reaction, but you do know your staff spoke more confidently than your systems deserved.",
        consultants: {
          devon: {
            prompt: "Parker thinks the family needs visible care right now, even if the final facts are still moving.",
            options: [
              opt("an-triage-parker-care", "Cover the medical bill tonight, document everything, and tell the family you are treating this like a real safety failure until proven otherwise.", "You look serious and humane, but you also expose the restaurant to a costly admission if the facts shift later.", "fallout", fx(-1, 3, 3, { devon: st(2, 3), nina: st(1, 1), tasha: st(0, 1) })),
              opt("an-triage-parker-tight", "Offer immediate care and documentation, but stop short of admitting the restaurant caused the reaction.", "The balance is careful, though the family may hear caution as self-protection and the staff may hear legal fear outranking human clarity.", "fallout", fx(1, -2, -2, { devon: st(0, 1), nina: st(-1, -1), tasha: st(-1, -2) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the room is watching and worries one loud scene could make every table feel unsafe.",
            options: [
              opt("an-triage-adrian-room", "Move nearby tables, own that there was an allergen incident, and protect the rest of the room from guessing badly.", "You lose some immediate revenue, but you stop the dining room from building its own version of the story.", "fallout", fx(-1, 2, 3, { jake: st(2, 2), elena: st(1, 1), nina: st(0, 1) })),
              opt("an-triage-adrian-hide", "Contain the scene as tightly as possible and hope the rest of the dining room never understands what happened.", "If it works, the night survives. If it leaks, the concealment becomes part of the offense.", "fallout", fx(1, -2, -3, { jake: st(1, 1), devon: st(-1, -1), elena: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "Now the real issue is whether Feast Haven had an unsafe system or just an unsafe conversation",
        body: "The fryer may be risky, the staff training may be weak, and the family may post before your internal story is even settled.",
        consultants: {
          priya: {
            prompt: "Imani wants allergen language stripped down to only what the kitchen can actually guarantee under pressure.",
            options: [
              opt("an-fallout-imani-system", "Ban all verbal allergen guarantees unless a manager and kitchen lead both clear the item in writing.", "It is heavy-handed, but nobody can casually improvise safety again.", "final", fx(1, 3, 4, { priya: st(2, 3), tasha: st(1, 2), nina: st(-1, 0), devon: st(1, 1) })),
              opt("an-fallout-imani-soft", "Retrain quietly and keep the public message focused on a one-time misunderstanding.", "It sounds calmer, but the room knows the underlying system is still mostly trust-based and the family may feel the restaurant learned just enough to survive the headlines.", "final", fx(1, -2, -3, { priya: st(-1, -2), tasha: st(-1, -1), nina: st(0, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks the restaurant's name will live or die on whether people hear honesty or spin in the next few hours.",
            options: [
              opt("an-fallout-marisol-honest", "Publish a brief, factual statement that a guest safety incident occurred and Feast Haven is reviewing procedures immediately.", "The transparency hurts, but it also keeps the restaurant from sounding slippery.", "final", fx(0, 2, 4, { elena: st(2, 3), jake: st(-1, -1), devon: st(1, 1) })),
              opt("an-fallout-marisol-silent", "Say nothing publicly until every internal fact is nailed down.", "That protects against overstatement, but silence rarely sounds caring after a safety scare.", "final", fx(1, -1, -2, { elena: st(-1, -2), jake: st(1, 1) }))
            ]
          }
        }
      },
      final: {
        title: "The final call is whether you punish a person, rebuild a system, or try to survive both",
        body: "Celia made the promise, but leadership allowed a culture where confidence outran certainty. The staff are watching whether you understand that difference.",
        consultants: {
          nina: {
            prompt: "Celia is ashamed, but she also says she learned the bad habit from watching other people reassure tables the same way.",
            options: [
              opt("an-final-celia-system", "Discipline Celia, but pair it with a restaurant-wide allergen protocol reset so the blame does not stop at the weakest link.", "The accountability lands because it is individual and systemic at the same time.", null, fx(2, 3, 4, { nina: st(0, 1), tasha: st(1, 1), priya: st(1, 1), devon: st(1, 1) })),
              opt("an-final-celia-sacrifice", "Make Celia the clear public lesson and end the incident there.", "The staff understand the warning, but many also decide leadership learned less than it claimed.", null, fx(1, -1, -2, { nina: st(-4, -4), devon: st(-1, -2), jake: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants you to accept slower service and fewer promises if that is what real safety requires from now on.",
            options: [
              opt("an-final-renata-slower", "Choose the slower, harder allergen standard and tell the team guest safety now outranks speed and charm.", "You lose some flexibility, but gain a standard people can defend under pressure.", null, fx(1, 4, 4, { tasha: st(2, 3), priya: st(1, 2), nina: st(-1, 0), jake: st(-1, -1) })),
              opt("an-final-renata-balance", "Keep the language softer so the room can still move fast on normal nights.", "It feels practical, but the next close call will look like proof you chose convenience again.", null, fx(2, 0, -2, { tasha: st(-2, -3), priya: st(-1, -1), nina: st(0, 1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "payroll-overtime-freeze",
    category: "Labor Crisis",
    pressure: "Extreme",
    headline: "Weekend overtime is missing and the staff are threatening to walk before a sold-out Saturday",
    body:
      "Dozens of overtime hours did not show up on checks. Some staff say it is a payroll glitch. Others say this is exactly what employers call theft when they think people are too busy to fight it.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you meet first?",
        body: "You can either calm the room, find the truth, or accidentally prove the worst version of both.",
        consultants: {
          marcus: {
            prompt: "Omar says support staff lost real money they needed for bills and nobody trusts a promise to 'fix it Monday' anymore.",
            options: [
              opt("po-open-omar-ledger", "Audit every missing hour with Omar and start building a public correction list immediately.", "You show the room this is not being buried in management language.", "triage", fx(0, 2, 2, { marcus: st(2, 3), nina: st(1, 1), devon: st(1, 1) })),
              opt("po-open-omar-delay", "Ask Omar to calm people down until accounting verifies the total quietly.", "You buy a little time, but also ask the wronged people to become your shield.", "triage", fx(1, -2, -2, { marcus: st(-3, -4), devon: st(-1, -1), nina: st(-1, -1) }))
            ]
          },
          priya: {
            prompt: "Imani says the kitchen is deciding right now whether the restaurant values precision only when it protects management.",
            options: [
              opt("po-open-imani-hours", "Have Imani help verify kitchen clocks, cut sheets, and overtime gaps before anybody works another unpaid minute.", "The room respects the seriousness, even if it makes the crisis feel larger.", "triage", fx(0, 2, 3, { priya: st(2, 3), tasha: st(1, 1), luis: st(1, 1) })),
              opt("po-open-imani-trust", "Tell Imani the restaurant will make this right and needs the kitchen to trust leadership through service first.", "That request might have worked before the missing checks landed.", "triage", fx(1, -2, -2, { priya: st(-3, -4), luis: st(-1, -1), tasha: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you have to decide whether money, service, or trust takes the first hit",
        body: "If you pay fast, the cash pinch gets ugly. If you wait, the walkout risk gets ugly. If you split the difference, everyone may hate the half-measure.",
        consultants: {
          jake: {
            prompt: "Adrian says a floor walkout on a sold-out night could damage the brand in one public, unforgettable swing.",
            options: [
              opt("po-triage-adrian-advance", "Issue emergency advances tonight and accept the financial pain before the dining room sees staff fury.", "It is expensive and slightly chaotic, but it proves the restaurant understands whose money was missing.", "fallout", fx(-2, 3, 2, { jake: st(2, 2), nina: st(1, 1), elena: st(1, 1) })),
              opt("po-triage-adrian-service", "Hold the line through service and promise corrected pay on the next cycle.", "Revenue survives tonight, but every smile on the floor now has a grudge under it.", "fallout", fx(2, -2, -3, { jake: st(-1, -1), nina: st(-2, -3), marcus: st(-2, -2) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata says asking people to cook through stolen time is how kitchens decide they are done trusting you.",
            options: [
              opt("po-triage-renata-close", "Reduce service capacity, pay what you can now, and stop pretending a full rush matters more than the payroll breach.", "You sacrifice short-term money to keep the moral hierarchy straight.", "fallout", fx(-1, 3, 4, { tasha: st(2, 3), priya: st(2, 3), luis: st(1, 2) })),
              opt("po-triage-renata-full", "Keep full service, ask for professionalism, and argue that the restaurant needs tonight's revenue to repair the checks.", "The logic may even be true, but the room will hear it as their pain funding its own apology.", "fallout", fx(2, -3, -3, { tasha: st(-3, -4), priya: st(-2, -3), luis: st(-1, -2) }))
            ]
          }
        }
      },
      fallout: {
        title: "The staff now care as much about respect as the missing dollars themselves",
        body: "Some people can survive a payroll mistake. Fewer can survive being told the mistake mattered less than service.",
        consultants: {
          elena: {
            prompt: "Marisol thinks the room needs one clear message that does not sound like legal cover written by a coward.",
            options: [
              opt("po-fallout-marisol-own", "Tell the whole staff the restaurant failed them, outline the repayment path, and invite questions in public.", "The vulnerability is expensive, but the honesty creates room for trust to come back.", "final", fx(0, 3, 4, { elena: st(2, 3), devon: st(1, 1), nina: st(1, 1), marcus: st(1, 1) })),
              opt("po-fallout-marisol-controlled", "Keep the message short, legal, and highly controlled so leadership does not overpromise.", "It protects management language better than it protects the room.", "final", fx(1, -1, -2, { elena: st(-1, -2), devon: st(-1, -1), marcus: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker says the swing staff are deciding whether this is a bad accident or the moment they start job hunting.",
            options: [
              opt("po-fallout-parker-stay", "Offer retention pay or extra protected hours to the most shaken staff so they do not bolt after the correction lands.", "It buys time and goodwill, but also tells everyone how scared leadership really is.", "final", fx(-1, 2, 2, { devon: st(2, 3), marcus: st(1, 1), nina: st(1, 1) })),
              opt("po-fallout-parker-principle", "Refuse special treatment and argue the repaired checks should be enough once the mistake is fixed.", "It sounds clean, but people do not always leave because the math is wrong; they leave because the meaning is.", "final", fx(1, -2, -2, { devon: st(-2, -3), marcus: st(-1, -1), nina: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The last choice is what Feast Haven learns about power when payroll breaks",
        body: "You can survive this as a cash problem, a trust problem, or both. The final signal decides which version sticks.",
        consultants: {
          marcus: {
            prompt: "Omar wants leadership to act like labor is not a favor the restaurant gives out when convenient.",
            options: [
              opt("po-final-omar-guardrail", "Build a visible overtime verification rule and let staff see the protection before they need it again.", "You turn the crisis into a worker-facing safeguard instead of a one-time apology tour.", null, fx(1, 3, 4, { marcus: st(2, 3), devon: st(1, 2), nina: st(1, 1), priya: st(1, 1) })),
              opt("po-final-omar-moveon", "Fix the checks and push hard to put the whole thing behind the room quickly.", "The money may be restored, but the memory is now free to harden however people like.", null, fx(2, -1, -2, { marcus: st(-2, -3), devon: st(-1, -1), priya: st(-1, -1) }))
            ]
          },
          priya: {
            prompt: "Imani wants to know whether the restaurant will protect labor when doing so is annoying, expensive, and operationally inconvenient.",
            options: [
              opt("po-final-imani-principle", "Choose the worker-protection standard even if it limits future scheduling flexibility.", "The room may not love every future rule, but it will understand what the rules are protecting.", null, fx(1, 4, 4, { priya: st(2, 3), tasha: st(1, 1), marcus: st(1, 1), luis: st(1, 1) })),
              opt("po-final-imani-lean", "Keep the protection softer so leadership can still move fast during rough weeks.", "That preserves managerial comfort better than worker confidence.", null, fx(2, -1, -2, { priya: st(-2, -3), tasha: st(-1, -1), marcus: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "anonymous-health-tip",
    category: "Inspection Threat",
    pressure: "Extreme",
    headline: "An anonymous tip says Feast Haven is about to get a surprise health inspection in the middle of a slammed service",
    body:
      "Nobody knows whether the tip is real, but everyone suddenly sees every unlabeled container, every rushed sanitizer bucket, and every weak shortcut as a possible disaster waiting at the door.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you trust first?",
        body: "You have very little time to decide whether this is paranoia, a sabotage rumor, or the warning that saves the restaurant.",
        consultants: {
          tasha: {
            prompt: "Chef Renata says if the inspector walks in right now, the kitchen will pass some things and absolutely not pass others.",
            options: [
              opt("ah-open-renata-honest", "Get the blunt kitchen truth from Renata before anyone plays brave.", "You start with the facts people usually avoid until the clipboard is already in the room.", "triage", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("ah-open-renata-confidence", "Tell Renata not to spook the staff until you know the tip is real.", "You protect the mood, but also spend precious minutes pretending uncertainty is safety.", "triage", fx(1, -1, -2, { tasha: st(-2, -3), priya: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks a visible panic spiral at the host stand will tell guests something is badly wrong even before any inspector appears.",
            options: [
              opt("ah-open-marisol-calm", "Keep the front calm while quietly triggering an internal compliance check in the back.", "The room stays graceful on the surface while you decide how deep the problem really is.", "triage", fx(1, 1, 2, { elena: st(2, 2), devon: st(1, 1), jake: st(1, 1) })),
              opt("ah-open-marisol-hide", "Say almost nothing and hope the rumor dies before it turns into visible scrambling.", "If the tip is fake, you look composed. If it is real, you just burned your warning shot.", "triage", fx(2, -2, -3, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you must choose whether to cut capacity, correct honestly, or gamble on getting lucky",
        body: "The real cost of doing the right thing may be immediate revenue. The real cost of gambling may be far worse.",
        consultants: {
          priya: {
            prompt: "Imani wants service slowed and weak points corrected now, even if it wrecks the pace of the night.",
            options: [
              opt("ah-triage-imani-slow", "Reduce output, relabel everything, refresh sanitizer, and accept a brutal hit to service flow.", "You trade speed for survivability and make the restaurant look intentionally serious instead of accidentally dirty.", "fallout", fx(-1, 3, 4, { priya: st(2, 3), tasha: st(1, 2), luis: st(1, 1) })),
              opt("ah-triage-imani-patch", "Correct only the most obvious problems and keep most of service moving.", "It is practical if luck holds and humiliating if luck walks in with a badge.", "fallout", fx(1, -1, -2, { priya: st(-2, -3), tasha: st(-1, -1), luis: st(-1, -1) }))
            ]
          },
          jake: {
            prompt: "Adrian worries guests will punish Feast Haven tonight if the floor suddenly feels clipped, apologetic, and behind.",
            options: [
              opt("ah-triage-adrian-honest", "Tell the floor to under-promise, stretch ticket times, and protect the standard over the vibe.", "You may lose a chunk of tonight's goodwill, but you stop service charm from hiding operational risk.", "fallout", fx(0, 2, 2, { jake: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("ah-triage-adrian-vibe", "Keep the dining room lively and trust the back of house to catch up without anyone feeling the slowdown too hard.", "The room may stay warm, but it also becomes one more place where the truth is delayed for optics.", "fallout", fx(2, -2, -3, { jake: st(1, 1), nina: st(-1, -2), tasha: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "Whether or not the inspector shows, the restaurant now knows what kind of standards it really keeps under fear",
        body: "A fake tip can still reveal a real weakness. A real inspection can still become survivable if leadership stops pretending image and safety are the same thing.",
        consultants: {
          devon: {
            prompt: "Parker thinks the worst version of this night is staff realizing Feast Haven only takes rules seriously when it thinks punishment is near.",
            options: [
              opt("ah-fallout-parker-culture", "Address the whole team and admit the rumor exposed habits leadership should have fixed before fear forced the issue.", "The honesty stings, but it keeps the lesson from shrinking into gossip about whoever placed the tip.", "final", fx(0, 3, 4, { devon: st(2, 3), elena: st(1, 1), priya: st(1, 1), marcus: st(1, 1) })),
              opt("ah-fallout-parker-source", "Focus the team on finding who tipped and why before you dig too deeply into the habits it exposed.", "That may satisfy the hurt pride of the room, but it turns attention away from the weakness everybody just saw.", "final", fx(1, -1, -2, { devon: st(-1, -2), elena: st(-1, -1), priya: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar says hidden labor always gets ignored until somebody with authority might finally notice it.",
            options: [
              opt("ah-fallout-omar-support", "Protect the sanitation and reset labor that actually keeps the room passing-ready, even if it means leaner service for a while.", "It is not glamorous, but it tells the invisible parts of the restaurant they finally matter in planning.", "final", fx(0, 3, 3, { marcus: st(2, 3), devon: st(1, 1), tasha: st(1, 1) })),
              opt("ah-fallout-omar-reset", "Return to normal staffing as fast as possible once the scare passes.", "You recover speed, but also teach the room that standards are a temporary mood, not a structure.", "final", fx(2, -1, -2, { marcus: st(-2, -3), devon: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The final move is deciding whether Feast Haven learns from a threat or merely survives one",
        body: "A restaurant can pass an inspection and still fail the deeper test of what it expects from itself when nobody is watching.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants a smaller, stricter kitchen if that is what it takes to stop flirting with preventable violations.",
            options: [
              opt("ah-final-renata-standard", "Adopt the stricter operating standard even though it will slow prep and expose sloppy habits more often.", "You become harder to run and harder to embarrass in the same move.", null, fx(1, 4, 4, { tasha: st(2, 3), priya: st(1, 2), luis: st(1, 1), marcus: st(1, 1) })),
              opt("ah-final-renata-flex", "Keep the standard looser so the room can still move with improvisational speed.", "That protects tonight's identity better than tomorrow's credibility.", null, fx(2, 0, -2, { tasha: st(-2, -3), priya: st(-1, -1), marcus: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol wants the guest experience protected, but not by pretending the back of house can live forever on adrenaline and half-compliance.",
            options: [
              opt("ah-final-marisol-balance", "Rebuild the standard in a way guests can feel through steadier pacing, cleaner details, and fewer frantic saves.", "The room stays elegant because the operation underneath it gets less dishonest.", null, fx(2, 3, 4, { elena: st(2, 3), jake: st(1, 1), devon: st(1, 1), tasha: st(1, 1) })),
              opt("ah-final-marisol-mask", "Keep most of the visible polish and trust the rough edges not to cost you too much later.", "That may hold for a while, but only if luck stays more loyal than standards.", null, fx(2, -1, -2, { elena: st(-1, -2), devon: st(-1, -1), tasha: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "double-booked-private-room",
    category: "Reservation Crisis",
    pressure: "Extreme",
    headline: "A wedding rehearsal dinner and a memorial dinner were both promised the same private room",
    body:
      "Both parties have emails, deposits, and strong emotions. One group is celebrating a beginning. The other is honoring a death. There is no clean solution, only damage you get to choose.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you pull in first?",
        body: "The facts matter, but so does the emotional weight of who hears what, when, and from whom.",
        consultants: {
          elena: {
            prompt: "Marisol says the booking notes are a mess and the front door will be the first thing both families punish if the explanation sounds weak.",
            options: [
              opt("db-open-marisol-record", "Rebuild the reservation trail with Marisol before speaking to either party in detail.", "You avoid improvising a lie, even if it buys neither family any comfort in the moment.", "triage", fx(0, 1, 2, { elena: st(2, 3), devon: st(1, 1), jake: st(0, 1) })),
              opt("db-open-marisol-fast", "Speak to the louder family first and hope speed feels more respectful than certainty.", "You may buy one side's patience, but the weaker fact pattern can still destroy both conversations.", "triage", fx(1, -2, -2, { elena: st(-2, -3), devon: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker thinks the first party you contact will remember your tone as much as your solution.",
            options: [
              opt("db-open-parker-order", "Decide who has the stronger documentation and speak to them first from a position of clarity.", "It sounds cold, but it prevents a sympathy-first conversation from collapsing under bad facts.", "triage", fx(0, 1, 3, { devon: st(2, 3), elena: st(1, 1) })),
              opt("db-open-parker-grief", "Speak to the memorial family first because the emotional stakes feel harder to relocate cleanly.", "The instinct is humane, but the wedding family may later hear that emotion overruled the paper trail and the room may now owe two explanations instead of one.", "triage", fx(0, -2, -1, { devon: st(1, 1), elena: st(-1, -1), jake: st(-1, -2) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you have to choose what kind of unfairness you can live with",
        body: "Someone will lose the room they thought they had. The real question is whether you displace grief, joy, money, or all three at once.",
        consultants: {
          jake: {
            prompt: "Adrian thinks the wedding party will cause the louder public blast if they feel their night was hijacked.",
            options: [
              opt("db-triage-adrian-buyout", "Offer the wedding party the private room and create an expensive, highly personal recovery plan for the memorial dinner.", "You choose the louder damage to avoid and inherit the quieter damage that may feel morally worse.", "fallout", fx(-2, -1, -2, { jake: st(1, 1), elena: st(-1, -1), devon: st(-1, -1) })),
              opt("db-triage-adrian-community", "Protect the memorial dinner in the private room and ask the wedding party to accept a lavish public-space recovery instead.", "The moral logic is clear to some and outrageous to others, which is what makes it so dangerous.", "fallout", fx(-1, 1, 0, { jake: st(-1, -2), devon: st(1, 1), elena: st(1, 1) }))
            ]
          },
          nina: {
            prompt: "Celia thinks splitting the room or staggering both events may save money while insulting everyone equally.",
            options: [
              opt("db-triage-celia-split", "Offer a carefully redesigned split plan and let both parties decide whether they prefer compromise to displacement.", "It is creative and practical, but can also sound like leadership forgot what either event means.", "fallout", fx(1, -1, -1, { nina: st(2, 2), elena: st(-1, -1), devon: st(-1, -1) })),
              opt("db-triage-celia-fullcomp", "Own the double-book, relocate one party entirely, and absorb the brutal financial recovery hit yourself.", "It is expensive and painful, but at least one family experiences a clean standard instead of a weird half-fix.", "fallout", fx(-3, 2, 3, { nina: st(1, 2), elena: st(1, 1), devon: st(1, 1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The bigger issue now is whether Feast Haven responds like a business, a neighbor, or a coward",
        body: "The displaced party may forgive a loss more easily than they forgive feeling processed. Staff are also watching which values leadership hides behind when money and humanity clash.",
        consultants: {
          marcus: {
            prompt: "Omar says the staff can help carry dignity for whichever family loses the room if leadership stops speaking like a spreadsheet first.", 
            options: [
              opt("db-fallout-omar-dignity", "Build a high-touch recovery team around the displaced party so the night feels cared for even if it is no longer ideal.", "You cannot erase the mistake, but you can keep it from feeling casual.", "final", fx(-1, 3, 3, { marcus: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("db-fallout-omar-transaction", "Keep the recovery tight, efficient, and compensation-focused so the logistics stay under control.", "The money may be fair, but the emotional temperature stays colder than the room needs.", "final", fx(0, -1, -2, { marcus: st(-1, -2), devon: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks the restaurant's character is now on trial, not just its booking process.",
            options: [
              opt("db-fallout-marisol-own", "State plainly that Feast Haven failed both parties and explain the recovery without euphemisms.", "The honesty hurts, but it keeps the apology from sounding machine-made.", "final", fx(0, 2, 4, { elena: st(2, 3), devon: st(1, 1), jake: st(-1, -1) })),
              opt("db-fallout-marisol-soft", "Use softer language about miscommunication and overlapping expectations to lower the heat.", "It may reduce the immediate sting, but can also sound like nobody is really owning the wound.", "final", fx(1, 0, -1, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The last choice is whether Feast Haven learns compassion, process, or both",
        body: "A double-book can happen anywhere. The lasting judgment comes from what the restaurant protects when it cannot protect everyone.",
        consultants: {
          devon: {
            prompt: "Parker wants a booking standard that never lets emotional events get handled like generic table blocks again.",
            options: [
              opt("db-final-parker-protocol", "Build a stricter private-event confirmation system with human verification before any emotionally high-stakes booking is finalized.", "It adds friction to the process, but protects the room from exactly this kind of moral wreckage.", null, fx(1, 3, 4, { devon: st(2, 3), elena: st(1, 1), nina: st(1, 1) })),
              opt("db-final-parker-light", "Keep the booking system flexible and trust better attention to solve what went wrong here.", "That may save time, but it teaches the room the lesson only halfway.", null, fx(2, -1, -2, { devon: st(-2, -3), elena: st(-1, -1) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the restaurant also has to decide whether it values clean process more than emotional instinct the next time this kind of call arrives.",
            options: [
              opt("db-final-adrian-values", "Write a values-based escalation rule so grief, community, and once-in-a-lifetime events are not treated as interchangeable bookings.", "The standard gets messier on paper and much clearer in the soul of the room.", null, fx(1, 4, 4, { jake: st(1, 2), devon: st(1, 1), elena: st(1, 1) })),
              opt("db-final-adrian-business", "Keep the future rule centered on deposits, contracts, and commercial clarity alone.", "It is defensible and efficient, but the room will quietly understand what compassion is worth when it costs money.", null, fx(2, 0, 0, { jake: st(1, 1), devon: st(-1, -1), elena: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "refrigeration-blackout",
    category: "Food Safety",
    pressure: "Extreme",
    headline: "The walk-in cooler died overnight and thousands of dollars in food may no longer be safe to serve",
    body:
      "The repair tech is delayed, reservations are packed, and the kitchen is staring at product that might still be cold enough to use or might be one reckless gamble away from making people sick.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you turn to first?",
        body: "This is the kind of problem that makes every later explanation sound cheap if the early judgment is weak.",
        consultants: {
          tasha: {
            prompt: "Chef Renata says some of the product is gone no matter how much it hurts, and she wants leadership to say that out loud now.",
            options: [
              opt("rb-open-renata-safe", "Start with the strictest safe-use assumption and let Renata mark what is dead before anyone counts lost dollars.", "You choose fear over wishful thinking, which is often how safety survives.", "triage", fx(-1, 2, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("rb-open-renata-salvage", "Push Renata to identify every borderline item that might still be saveable.", "The money pressure is real, but you start the day teaching the kitchen what kind of gamble leadership is willing to ask for.", "triage", fx(1, -1, -2, { tasha: st(-3, -4), priya: st(-1, -1), luis: st(-1, -1) }))
            ]
          },
          priya: {
            prompt: "Imani wants temperature logs, timestamps, and actual evidence before the room gets bullied by panic or optimism.",
            options: [
              opt("rb-open-imani-logs", "Use Imani to build the fact pattern before deciding what gets dumped and what survives.", "You delay the emotional reaction long enough to find out whether the food is unsafe or merely expensive.", "triage", fx(0, 1, 3, { priya: st(2, 3), tasha: st(1, 1) })),
              opt("rb-open-imani-fast", "Skip the deep log work and make a quick leadership call so the room can move.", "Speed feels strong until you realize it mostly means fewer facts with the same liability.", "triage", fx(1, -1, -2, { priya: st(-2, -3), tasha: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you decide whether Feast Haven eats the loss, trims the menu, or quietly rolls the dice",
        body: "The safest path is financially brutal. The most profitable path is morally radioactive if it goes badly.",
        consultants: {
          nina: {
            prompt: "Celia thinks the floor can survive a brutal menu cut if guests hear the truth before they hear excuses.",
            options: [
              opt("rb-triage-celia-cut", "Slash the menu hard, tell the room why, and stop selling anything even slightly doubtful.", "The revenue pain is immediate, but so is the relief of knowing you are not feeding people uncertainty.", "fallout", fx(-2, 3, 4, { nina: st(2, 3), jake: st(1, 1), elena: st(1, 1) })),
              opt("rb-triage-celia-soft", "Keep the menu looking broad and quietly steer tables away from the riskiest items.", "It feels commercially clever, but one slip makes the concealment part of the crime.", "fallout", fx(1, -2, -3, { nina: st(-2, -3), jake: st(-1, -1), elena: st(-1, -1) }))
            ]
          },
          jake: {
            prompt: "Adrian worries a huge menu collapse on a packed night will make guests feel like Feast Haven cannot run itself.",
            options: [
              opt("rb-triage-adrian-compete", "Use creativity to rebuild the night's menu around unquestionably safe product and sell confidence through adaptation.", "You still lose money, but not all dignity, and the room sees resilience instead of panic.", "fallout", fx(0, 2, 2, { jake: st(2, 2), nina: st(1, 1), tasha: st(0, 1) })),
              opt("rb-triage-adrian-stretch", "Keep as much of the original menu as possible and trust the kitchen to judge close calls on the fly.", "If everyone is perfect, maybe it works. If one decision is wrong, the restaurant deserves what follows.", "fallout", fx(2, -3, -4, { jake: st(-1, -2), tasha: st(-3, -4), priya: st(-2, -3) }))
            ]
          }
        }
      },
      fallout: {
        title: "The room now understands what leadership chose to protect first",
        body: "Staff can handle bad luck. They struggle more with discovering whether management's first reflex under pressure is caution, image, or margin.",
        consultants: {
          marcus: {
            prompt: "Omar says the bussing and support crew will be the ones cleaning up the guest experience if leadership tried to act normal on a broken night.",
            options: [
              opt("rb-fallout-omar-support", "Rebuild staffing and pacing around the reduced menu so the room does not break itself trying to fake normal.", "It is a quieter, smaller night, but a much more honest one.", "final", fx(0, 3, 3, { marcus: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("rb-fallout-omar-pressure", "Keep the room running hot and ask support staff to absorb the weirdness as best they can.", "The night may look fuller from a distance, but the hidden labor will remember who was asked to carry the lie.", "final", fx(1, -2, -2, { marcus: st(-3, -4), devon: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol says guests will forgive scarcity faster than they forgive feeling tricked.",
            options: [
              opt("rb-fallout-marisol-transparent", "Tell the affected tables there was a refrigeration failure and Feast Haven chose safety over pretending.", "You may look wounded, but not dishonest, and that matters more than a polished lie.", "final", fx(0, 2, 4, { elena: st(2, 3), nina: st(1, 1), jake: st(-1, -1) })),
              opt("rb-fallout-marisol-vague", "Use softer 'supply issue' language and protect the restaurant from sounding operationally broken.", "It preserves image in the short term while quietly betting that nobody asks the next question.", "final", fx(1, 0, -1, { elena: st(0, 1), nina: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The last call is what Feast Haven teaches itself about risk when money and safety collide",
        body: "Every restaurant says guest safety comes first. The room has now watched what that sentence costs when it is suddenly true.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants a future rule that makes the expensive call easier, not just nobler, next time.",
            options: [
              opt("rb-final-renata-rule", "Create a hard discard standard and emergency backup menu so no one ever has to negotiate safety from scratch again.", "You pay for the lesson in systems now instead of panic later.", null, fx(1, 4, 4, { tasha: st(2, 3), priya: st(1, 2), luis: st(1, 1), nina: st(1, 1) })),
              opt("rb-final-renata-flex", "Keep more discretion in the hands of leadership so you can stay nimble during future shortages.", "That preserves freedom, but also preserves the temptation to talk yourself into risk when the dollars get loud.", null, fx(2, -1, -2, { tasha: st(-2, -3), priya: st(-1, -1), nina: st(-1, -1) }))
            ]
          },
          priya: {
            prompt: "Imani wants the room to know that evidence, not appetite, decides what stays on the line after a failure like this.",
            options: [
              opt("rb-final-imani-evidence", "Build the recovery standard around logs, temps, timestamps, and written approval, even if it feels bureaucratic.", "It is colder on paper and warmer for the people eating the food.", null, fx(1, 3, 4, { priya: st(2, 3), tasha: st(1, 1), marcus: st(1, 1) })),
              opt("rb-final-imani-instinct", "Trust stronger judgment and better leadership attention next time instead of heavier rules.", "That sounds mature until stress, cost, and hope all show up together again.", null, fx(2, -1, -2, { priya: st(-2, -3), tasha: st(-1, -1), marcus: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "fake-id-liquor-night",
    category: "Alcohol Liability",
    pressure: "Extreme",
    headline: "A guest with a fake ID was served alcohol and now there is video of the room realizing they might be underage",
    body:
      "The ID looked decent, the guest looked young in hindsight, and someone at a nearby table started filming the second the argument broke out. This can become a legal issue, a staffing issue, and a reputation issue before dessert.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you handle first?",
        body: "The teenager, the server, the phone camera, and the rest of the dining room all feel urgent at once.",
        consultants: {
          nina: {
            prompt: "Celia says the ID scanned, the table pressured her, and she is now terrified this mistake will follow her forever.",
            options: [
              opt("fi-open-celia-facts", "Get the serving sequence from Celia immediately before fear rewrites her memory.", "You center the facts first, which is kinder than it feels and safer than panic.", "triage", fx(0, 1, 2, { nina: st(1, 2), devon: st(1, 1), jake: st(0, 1) })),
              opt("fi-open-celia-pull", "Pull Celia off the floor immediately and treat the whole thing like a probable serve-to-minor incident.", "It protects the room and the law, but also tells Celia you may already be done believing her.", "triage", fx(0, 0, 1, { nina: st(-3, -4), devon: st(1, 1) }))
            ]
          },
          devon: {
            prompt: "Parker thinks the filming is about to turn a messy judgment call into content.",
            options: [
              opt("fi-open-parker-room", "Use Parker to separate the filming table from the underage dispute before the whole room turns into an audience.", "You stop the spectacle from multiplying while the legal facts are still fragile.", "triage", fx(0, 2, 2, { devon: st(2, 3), elena: st(1, 1), jake: st(1, 1) })),
              opt("fi-open-parker-focus", "Ignore the filming for now and treat the underage service question as the only issue that matters.", "Legally, that may be true. Socially, the camera is becoming its own problem in real time.", "triage", fx(1, -1, -2, { devon: st(-1, -1), elena: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you choose between maximum legal caution and maximum room control",
        body: "The strictest path may inflame the room. The smoothest path may look like concealment later.",
        consultants: {
          jake: {
            prompt: "Adrian wants the alcohol off the table, the guest out of the room, and the rest of service saved before this becomes theater.", 
            options: [
              opt("fi-triage-adrian-clean", "End the service immediately, remove the drinks, and move the table out before the rest of the room learns more than it should.", "The visible control is strong, but the guest may feel pushed instead of handled with proper care.", "fallout", fx(0, 1, 2, { jake: st(2, 2), devon: st(1, 1), nina: st(0, 1) })),
              opt("fi-triage-adrian-soft", "Keep the scene calm, verify the ID issue further, and avoid turning the whole room into a legal stage.", "It sounds humane, but can look dangerously slow if the guest truly is underage.", "fallout", fx(1, -2, -2, { jake: st(-1, -1), nina: st(-1, -2), devon: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks the restaurant has to look serious enough that no clip can plausibly accuse it of shrugging this off.",
            options: [
              opt("fi-triage-marisol-serious", "Document everything, preserve the scan record, and make a visible managerial intervention that leaves no doubt this is being treated as real.", "You lose some vibe, but gain a cleaner public posture if the video spreads.", "fallout", fx(0, 2, 3, { elena: st(2, 3), devon: st(1, 1), nina: st(0, 1) })),
              opt("fi-triage-marisol-mask", "Keep the intervention discreet so the room can keep pretending this was just a weird ID check at dinner.", "It may soften the moment, but only if nobody later asks why the room looked so determined not to notice.", "fallout", fx(1, -1, -2, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The bigger question is whether this was a mistake, a systems gap, or a standard you were hoping luck would carry",
        body: "The camera may move on. The staff will not. They are deciding whether ID policy at Feast Haven is real or performative.",
        consultants: {
          priya: {
            prompt: "Imani wants the room to admit that 'it scanned' and 'it was safe' are not the same sentence.", 
            options: [
              opt("fi-fallout-imani-standard", "Tighten ID verification beyond scanning and require second-eyes review on borderline guests.", "It is slower and far more defensible, which is exactly the point.", "final", fx(1, 3, 4, { priya: st(2, 3), nina: st(1, 1), devon: st(1, 1) })),
              opt("fi-fallout-imani-blame", "Treat this mainly as a server mistake and avoid overcomplicating the alcohol standard for everyone else.", "You get clarity fast, but maybe the wrong kind of clarity.", "final", fx(1, -1, -1, { priya: st(-1, -1), nina: st(-2, -3), devon: st(-1, -1) }))
            ]
          },
          nina: {
            prompt: "Celia wants to know whether leadership understands how much social pressure lives inside an 'obvious' ID decision during a rush.", 
            options: [
              opt("fi-fallout-celia-coach", "Discipline the serve, but rebuild the culture so staff know management would rather absorb awkwardness than risk this again.", "The consequence lands without teaching the floor that smoothness matters more than law.", "final", fx(1, 2, 3, { nina: st(0, 1), jake: st(1, 1), devon: st(1, 1) })),
              opt("fi-fallout-celia-harsh", "Make Celia the warning and lean on fear to tighten every future alcohol call.", "People may get stricter, but not necessarily wiser or more supported.", "final", fx(1, -2, -2, { nina: st(-4, -4), jake: st(-1, -1), devon: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The last move is whether Feast Haven chooses comfort, fear, or a real standard",
        body: "A room can get faster after a scare, or safer after a scare. Sometimes those are not the same direction.",
        consultants: {
          devon: {
            prompt: "Parker wants a clear alcohol standard that protects the room without making staff feel abandoned when guests push back.", 
            options: [
              opt("fi-final-parker-protocol", "Create a hard stop policy with visible manager backup anytime age feels remotely questionable.", "You may lose a few easy sales, but you stop asking frontline people to guess the legal line alone.", null, fx(1, 4, 4, { devon: st(2, 3), nina: st(1, 2), elena: st(1, 1) })),
              opt("fi-final-parker-flex", "Keep more discretion at table level so the room can still feel smooth and adult when IDs get awkward.", "That preserves grace better than certainty.", null, fx(2, -1, -2, { devon: st(-2, -3), nina: st(-1, -2), elena: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol wants the public-facing recovery to sound calm without sounding casual about the law.", 
            options: [
              opt("fi-final-marisol-public", "Pair the stronger alcohol standard with a direct internal message that Feast Haven would rather be embarrassed than illegal.", "The room may laugh nervously, but nobody will mistake the hierarchy of what matters.", null, fx(1, 3, 4, { elena: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("fi-final-marisol-quiet", "Keep the standard stronger but the messaging softer so the restaurant can move on quickly.", "It reduces fatigue, though it also risks shrinking the lesson into folklore instead of policy and leaving the floor unsure whether leadership is embarrassed or merely eager to forget.", null, fx(1, -2, -2, { elena: st(0, 0), devon: st(-1, -2), nina: st(-1, -2) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "cash-drawer-accusation",
    category: "Trust Breach",
    pressure: "High",
    headline: "The front register is short $1,400 and two trusted employees are quietly blaming each other",
    body:
      "The shortage is large enough to matter, small enough to create doubt, and ugly enough to poison the room. No one has proof. Everyone has a theory. The wrong move could punish innocence or reward theft.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you start with?",
        body: "This is not just a money problem. It is a room-poison problem and a fairness problem at the same time.",
        consultants: {
          elena: {
            prompt: "Marisol says she closed the register cleanly and thinks someone touched the cash after the host stand handed it off.",
            options: [
              opt("cd-open-marisol-trace", "Rebuild the cash handoff from Marisol's side before anyone gets labeled a liar.", "You choose process before accusation, which is slower and safer.", "triage", fx(0, 1, 2, { elena: st(2, 3), devon: st(1, 1), marcus: st(0, 1) })),
              opt("cd-open-marisol-believe", "Back Marisol's version early because she has earned trust and the shortage is too large to shrug off.", "You honor history, but history is not evidence, and the room knows it.", "triage", fx(0, -1, -1, { elena: st(2, 2), devon: st(-1, -2), marcus: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker says they touched the area briefly but did not take anything and now feel like the flexible person is about to become the convenient suspect.",
            options: [
              opt("cd-open-parker-timeline", "Get Parker's exact movements and who else floated through the zone before the cash was locked.", "You stop the room from turning flexibility into automatic guilt.", "triage", fx(0, 1, 2, { devon: st(2, 3), elena: st(0, 1), marcus: st(0, 1) })),
              opt("cd-open-parker-distance", "Pull Parker off sensitive duties immediately until the shortage is resolved.", "It protects the drawer but also feels suspiciously close to a verdict.", "triage", fx(0, -1, 0, { devon: st(-3, -4), elena: st(1, 1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you must choose whether privacy, certainty, or speed matters most",
        body: "Searching people may be humiliating. Waiting may destroy evidence. Quietly eating the loss may reward whoever took it, if anyone did.",
        consultants: {
          marcus: {
            prompt: "Omar says support staff already assume leadership will search the people with the least power first.", 
            options: [
              opt("cd-triage-omar-audit", "Lock the area down, review access, receipts, and time stamps, and refuse any bag searches without stronger cause.", "It preserves dignity, but may cost you the fastest path to an answer.", "fallout", fx(-1, 2, 3, { marcus: st(2, 3), devon: st(1, 1), elena: st(1, 1) })),
              opt("cd-triage-omar-search", "Require immediate bag checks for anyone who touched the register zone.", "You may catch something, but you also teach the room what trust is worth the second cash goes missing.", "fallout", fx(0, -3, -3, { marcus: st(-3, -4), devon: st(-2, -3), elena: st(-2, -2) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks if you look indecisive, the whole staff will start writing their own scandal around the shortage.", 
            options: [
              opt("cd-triage-adrian-firm", "Suspend access, name the seriousness of the theft possibility, and make it clear the room is under review.", "The tone is strong, though not necessarily fair enough to keep innocent people steady.", "fallout", fx(0, -1, -1, { jake: st(2, 2), elena: st(-1, -1), devon: st(-1, -1) })),
              opt("cd-triage-adrian-loss", "Absorb the shortage for now and avoid a public manhunt without better proof.", "You protect the room from humiliation, but maybe not from the lesson that theft is survivable.", "fallout", fx(-2, 1, -1, { jake: st(-1, -1), marcus: st(1, 1), devon: st(1, 1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The staff now care less about the missing money than what your investigation says about justice",
        body: "The room can survive financial loss. It struggles more when leadership looks either weak, biased, or casually willing to humiliate its own people.",
        consultants: {
          nina: {
            prompt: "Celia says front-of-house trust will rot fast if this becomes a vibes-based witch hunt.", 
            options: [
              opt("cd-fallout-celia-standard", "Create a cash-control standard immediately so the investigation is attached to a future fix, not just raw suspicion.", "The room hates the tighter controls less because they can at least see the lesson forming.", "final", fx(0, 2, 3, { nina: st(2, 3), elena: st(1, 1), devon: st(1, 1) })),
              opt("cd-fallout-celia-whisper", "Keep the investigation narrow and discreet so the room does not spiral any further.", "It may lower noise, but also leaves people free to imagine whatever version of the truth wounds them most.", "final", fx(0, -1, -1, { nina: st(-1, -2), elena: st(-1, -1), devon: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol wants to know whether earned trust still counts for anything when the room gets ugly.", 
            options: [
              opt("cd-fallout-marisol-balance", "Say trust matters, but not enough to replace evidence, and hold everyone to the same process.", "It is not especially comforting, but it is fair in a way the room can understand.", "final", fx(1, 2, 4, { elena: st(1, 2), devon: st(1, 2), marcus: st(1, 1) })),
              opt("cd-fallout-marisol-status", "Quietly weigh long-term loyalty more heavily than weaker staff standing when interpreting the evidence.", "It may feel practical, but the room will eventually learn what kind of hierarchy you really believe in.", "final", fx(1, -2, -3, { elena: st(1, 1), devon: st(-2, -3), marcus: st(-2, -2) }))
            ]
          }
        }
      },
      final: {
        title: "The last move is deciding what Feast Haven values more: trust, proof, or deterrence",
        body: "A room that loses cash can recover. A room that loses faith in justice usually recovers much slower.",
        consultants: {
          devon: {
            prompt: "Parker wants a system where flexible staff are not forever one shortage away from becoming the easiest suspect.", 
            options: [
              opt("cd-final-parker-system", "Install stronger cash controls, dual verification, and cleaner shift boundaries so future suspicion has less room to breathe.", "You do not solve human nature, but you make it much harder to weaponize ambiguity.", null, fx(1, 3, 4, { devon: st(2, 3), elena: st(1, 1), nina: st(1, 1), marcus: st(1, 1) })),
              opt("cd-final-parker-fear", "Lean on deterrence, surveillance, and zero-trust language so everyone feels the danger of touching cash carelessly.", "It may reduce theft and increase resentment in almost equal measure.", null, fx(1, -2, -1, { devon: st(-2, -3), marcus: st(-1, -2), nina: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar wants the final lesson to protect innocent people at least as much as it protects dollars.", 
            options: [
              opt("cd-final-omar-dignity", "Make dignity part of the rule: stronger controls, clearer proof thresholds, and no humiliating shortcuts without cause.", "The room still fears theft, but not quite as much as it fears leadership anymore.", null, fx(0, 4, 4, { marcus: st(2, 3), devon: st(1, 1), elena: st(1, 1) })),
              opt("cd-final-omar-hardline", "Teach that money missing will always trigger an aggressive response because softness invites more of it.", "That may be true, but the room will now define safety and fear in very similar terms.", null, fx(2, -1, -1, { marcus: st(-2, -3), devon: st(-1, -2), elena: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "influencer-review-shakedown",
    category: "Reputation Extortion",
    pressure: "High",
    headline: "A local influencer says she will bury Feast Haven online unless the restaurant comps her whole party and gives private kitchen access",
    body:
      "She has a large local following, enough reach to hurt, and exactly the kind of smirk that tells you she has done this before. If you fold, the room learns one lesson. If you refuse, the internet may learn another.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you bring in first?",
        body: "This is part marketing problem, part ethics problem, and part courage problem.",
        consultants: {
          elena: {
            prompt: "Marisol says the influencer can absolutely wound the room online, but rewarding extortion teaches a worse lesson if word gets around.", 
            options: [
              opt("ir-open-marisol-read", "Let Marisol assess whether this is bluff, ego, or a practiced shakedown before you answer.", "You start by reading the threat instead of merely reacting to it.", "triage", fx(0, 1, 2, { elena: st(2, 3), jake: st(1, 1), devon: st(1, 1) })),
              opt("ir-open-marisol-hard", "Tell Marisol the restaurant will not be blackmailed and should answer with immediate firmness.", "The principle is clean. The consequences might not be, especially if firmness gets read as vanity instead of control.", "triage", fx(0, -2, -3, { elena: st(1, 1), jake: st(1, 1), devon: st(-1, -2) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the optics are brutal if the influencer posts first and frames Feast Haven as rude, cheap, and scared.", 
            options: [
              opt("ir-open-adrian-room", "Map the guest-facing risk with Adrian before deciding how much public damage the room can absorb.", "You treat the threat like a reputational event instead of a personal insult.", "triage", fx(0, 1, 2, { jake: st(2, 2), elena: st(1, 1) })),
              opt("ir-open-adrian-pride", "Refuse to let fear of a review control the answer at all.", "That protects dignity beautifully and strategy only if the review truly does not land. If it does, the room may discover leadership chose pride over positioning.", "triage", fx(1, -2, -3, { jake: st(1, 1), elena: st(-1, -2), devon: st(-1, -2) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you must choose whether to pay the ransom, hold the line, or do something uncomfortably in between",
        body: "A free meal is cheap. A public precedent is not. Neither is a nasty viral narrative if she decides to swing.",
        consultants: {
          nina: {
            prompt: "Celia thinks a polite refusal with a legitimate hospitality offer is the only way to stay principled without sounding petty.", 
            options: [
              opt("ir-triage-celia-middle", "Offer a normal service recovery path but refuse any special treatment tied to review pressure.", "You stay polite without rewarding the tactic itself.", "fallout", fx(0, 2, 2, { nina: st(2, 3), elena: st(1, 1), jake: st(0, 1) })),
              opt("ir-triage-celia-comp", "Comp most of the experience quietly and hope the review threat disappears with the bill.", "You may save the night, but the room just watched extortion work in real time.", "fallout", fx(-1, 0, -2, { nina: st(-2, -3), elena: st(-1, -1), jake: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata is furious that somebody demanding leverage thinks the kitchen is a prop for content.", 
            options: [
              opt("ir-triage-renata-boundary", "Refuse the private access completely and make it clear the kitchen is not available for coercive perks.", "The boundary is morally obvious and commercially dangerous in exactly the right ratio.", "fallout", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("ir-triage-renata-show", "Give limited kitchen access if it is the price of keeping the room out of an ugly online war.", "The problem may calm down, but the kitchen will remember what got traded away to buy quiet.", "fallout", fx(1, -1, -2, { tasha: st(-3, -4), priya: st(-1, -1), luis: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The room now understands whether Feast Haven is brave, strategic, or merely lucky",
        body: "If she posts, you need a response. If she does not, the staff still saw what happened and drew conclusions about your backbone.",
        consultants: {
          devon: {
            prompt: "Parker thinks the staff will tolerate almost any public outcome better than they will tolerate leadership feeling purchasable.", 
            options: [
              opt("ir-fallout-parker-principle", "Tell the team directly that Feast Haven may absorb some reputational pain, but it will not reward extortion as policy.", "The room may not feel safer, but it does feel less ashamed.", "final", fx(0, 3, 3, { devon: st(2, 3), elena: st(1, 1), jake: st(1, 1) })),
              opt("ir-fallout-parker-results", "Keep the internal message pragmatic and focused on minimizing online fallout, not grand principles.", "That may sound mature, though it leaves the staff to decide for themselves what leadership just sold.", "final", fx(1, 0, -1, { devon: st(-1, -1), elena: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks if a review does hit, the reply has to sound calm and adult instead of petty and wounded.", 
            options: [
              opt("ir-fallout-marisol-public", "Respond publicly with facts, professionalism, and a visible refusal to bargain under pressure.", "The tone may not win the whole internet, but it gives the room a spine worth standing behind.", "final", fx(0, 2, 4, { elena: st(2, 3), jake: st(1, 1), devon: st(1, 1) })),
              opt("ir-fallout-marisol-ignore", "Say nothing publicly and trust the post to pass without feeding it oxygen.", "Silence can be wisdom or weakness depending on how the clip lands and how long it breathes.", "final", fx(1, -1, -1, { elena: st(0, 1), jake: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The final move is whether Feast Haven builds a policy around pressure or around fear",
        body: "This will happen again in some form. The room is now deciding whether leadership learned a tactic or a standard.",
        consultants: {
          jake: {
            prompt: "Adrian wants a future playbook so nobody has to negotiate ethics from scratch every time somebody flexes online reach.", 
            options: [
              opt("ir-final-adrian-playbook", "Create a clear comp-and-content policy that separates normal hospitality from coercion and keeps access decisions out of panic mode.", "You lower the drama of the next threat by taking improvisation off the menu.", null, fx(1, 3, 4, { jake: st(2, 3), elena: st(1, 1), devon: st(1, 1) })),
              opt("ir-final-adrian-instinct", "Keep the response flexible so leadership can read each influencer case on its own emotional weather.", "That preserves room to maneuver and room to rationalize.", null, fx(2, -1, -2, { jake: st(-1, -1), elena: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants one final guarantee that the kitchen will never again become a bargaining chip for someone else's threat campaign.", 
            options: [
              opt("ir-final-renata-boundary", "Set a non-negotiable kitchen-access rule and accept that some publicity is not worth the price of self-respect.", "The room may lose a few easy wins and gain a clearer soul.", null, fx(0, 4, 4, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1), elena: st(1, 1) })),
              opt("ir-final-renata-access", "Allow carefully controlled access when the reputational stakes feel high enough.", "That sounds measured until every future exception arrives insisting it is special too.", null, fx(2, -1, -1, { tasha: st(-2, -3), priya: st(-1, -1), elena: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "food-poisoning-rumor",
    category: "Public Health Rumor",
    pressure: "Extreme",
    headline: "Three tables posted that Feast Haven made them sick, but nobody can prove whether the restaurant caused it",
    body:
      "The posts are spreading faster than the facts. Some guests got sick hours later. Others just feel uneasy now. The kitchen swears the food was clean. The room is deciding whether certainty matters more than fear.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you listen to first?",
        body: "You do not yet know whether the restaurant harmed anyone. You do know that waiting too long can look like guilt and speaking too fast can become a lie.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants timestamps, ticket records, temperatures, and ingredient overlap before Feast Haven says one public word.", 
            options: [
              opt("fp-open-renata-facts", "Start with the kitchen evidence and treat the rumor like a real safety investigation, not a PR event.", "You prioritize truth even though fear is moving faster than truth can.", "triage", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("fp-open-renata-deny", "Back the kitchen instinctively and assume the posts are exaggeration unless proven otherwise.", "Confidence may steady the staff and later look painfully arrogant if the facts turn.", "triage", fx(1, -2, -3, { tasha: st(1, 1), priya: st(-1, -1), elena: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol thinks silence will read like guilt if the posts keep running without any visible response from the restaurant.", 
            options: [
              opt("fp-open-marisol-hold", "Draft a holding statement that acknowledges the concern without claiming a conclusion you do not yet have.", "You buy a little public trust without pretending certainty.", "triage", fx(0, 2, 2, { elena: st(2, 3), jake: st(1, 1), devon: st(1, 1) })),
              opt("fp-open-marisol-wait", "Stay quiet until the internal facts are stronger than the internet noise.", "If the facts clear you, great. If they do not, the silence becomes evidence people write themselves.", "triage", fx(1, -1, -2, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you decide whether Feast Haven shrinks the menu, closes temporarily, or keeps serving under a cloud",
        body: "A public scare does not need to be true to become expensive. The hard part is deciding whether caution will look responsible or guilty.",
        consultants: {
          priya: {
            prompt: "Imani wants the suspected overlap items off the menu until the ingredient chain is fully understood.", 
            options: [
              opt("fp-triage-imani-cut", "Pull the overlapping items immediately and accept the public implication that the rumor might be real.", "You sacrifice certainty to protect people from being the test case.", "fallout", fx(-1, 3, 4, { priya: st(2, 3), tasha: st(1, 2), nina: st(1, 1) })),
              opt("fp-triage-imani-keep", "Keep the menu running while you investigate so the restaurant does not convict itself prematurely.", "That preserves revenue and also asks the next guest to trust a room you are still actively checking.", "fallout", fx(2, -2, -3, { priya: st(-3, -4), tasha: st(-1, -1), nina: st(-1, -1) }))
            ]
          },
          nina: {
            prompt: "Celia says the floor is being asked questions it cannot answer and every table can feel the uncertainty already.", 
            options: [
              opt("fp-triage-celia-script", "Give the floor one honest script: concern acknowledged, facts under review, and a narrower menu until then.", "The room may not relax, but it stops sounding random and afraid.", "fallout", fx(0, 2, 3, { nina: st(2, 3), jake: st(1, 1), elena: st(1, 1) })),
              opt("fp-triage-celia-free", "Let each server read the table and handle the concern naturally.", "That sounds human, right until six different versions of the truth start walking around the room.", "fallout", fx(1, -1, -2, { nina: st(-2, -3), jake: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The real battle now is whether Feast Haven sounds cautious, guilty, or humane",
        body: "If the restaurant caused the illness, honesty matters. If it did not, restraint still matters. Either way, tone decides how much people trust the next fact you give them.",
        consultants: {
          jake: {
            prompt: "Adrian worries guests will remember panic longer than they remember nuance.", 
            options: [
              opt("fp-fallout-adrian-calm", "Keep the room calm, limit overdrama, and let the recovery message sound steady instead of desperate.", "You preserve some dignity for the night, though some will call it too polished for the moment and a few staff will wonder whether optics are still quietly outranking truth.", "final", fx(1, -1, -1, { jake: st(1, 1), elena: st(0, 0), nina: st(-1, -2) })),
              opt("fp-fallout-adrian-hardtruth", "Tell the floor to stop selling normalcy and act like the restaurant may be in a genuine safety event.", "You lose atmosphere and gain moral seriousness in one expensive move.", "final", fx(-1, 3, 4, { jake: st(-1, -1), nina: st(1, 1), elena: st(1, 1) }))
            ]
          },
          marcus: {
            prompt: "Omar says support staff always end up carrying public fear in their body long before management decides what the official truth is.", 
            options: [
              opt("fp-fallout-omar-support", "Scale the room down, support the staff openly, and stop pretending full-speed service is compatible with a credible investigation.", "It costs money, but it stops asking people to perform certainty they do not feel.", "final", fx(-1, 3, 3, { marcus: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("fp-fallout-omar-push", "Keep the room running hard so the rumor does not visibly own the building.", "The energy may save tables and silently crush the people carrying it.", "final", fx(2, -2, -2, { marcus: st(-3, -4), devon: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The final move is what Feast Haven believes transparency should cost",
        body: "You may eventually be cleared, blamed, or remain uncertain. The deeper lesson is whether the restaurant tells the truth only when the truth is easy.",
        consultants: {
          elena: {
            prompt: "Marisol wants a public standard that prevents the next rumor from becoming a vacuum where fear writes the whole story.", 
            options: [
              opt("fp-final-marisol-standard", "Create a public-facing incident response standard built on early acknowledgment, narrow facts, and visible caution.", "It is not flashy, but it makes the room sound adult under stress.", null, fx(1, 3, 4, { elena: st(2, 3), nina: st(1, 1), jake: st(1, 1), devon: st(1, 1) })),
              opt("fp-final-marisol-pride", "Keep future messaging tighter so the restaurant never looks more worried than necessary.", "That protects posture better than it protects trust.", null, fx(2, -1, -2, { elena: st(-1, -2), nina: st(-1, -1), devon: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants the restaurant to accept that caution can bruise a kitchen's pride without insulting its competence.", 
            options: [
              opt("fp-final-renata-caution", "Choose the stricter future rule: if a plausible safety rumor lands, the kitchen proves itself through evidence and reduced risk, not wounded pride.", "It costs ego and earns credibility.", null, fx(1, 4, 4, { tasha: st(2, 3), priya: st(1, 2), luis: st(1, 1) })),
              opt("fp-final-renata-defend", "Lean harder into protecting the kitchen's name so rumors never get the satisfaction of reshaping the menu too fast.", "That may feel honorable right up to the next moment when caution was the wiser form of honor.", null, fx(2, 0, -2, { tasha: st(1, 1), priya: st(-1, -1), luis: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "corporate-buyout-vs-fundraiser",
    category: "Values Conflict",
    pressure: "Extreme",
    headline: "A corporate client offers huge money to buy out tonight's room, but a student scholarship fundraiser is already booked and counting on you",
    body:
      "The corporate client can solve cash stress in one night. The fundraiser is tied to local students, community trust, and people who believed Feast Haven meant what it said when it took the booking. Somebody gets disappointed. The question is what that disappointment says about you.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you call in first?",
        body: "This is one of those problems where the profitable answer and the honorable answer keep changing places depending on what kind of person is talking.",
        consultants: {
          jake: {
            prompt: "Adrian says the buyout money could stabilize the restaurant fast and may be too large to dismiss out of principle alone.", 
            options: [
              opt("cb-open-adrian-money", "Run the buyout numbers honestly with Adrian before deciding whether this is rescue money or soul-selling money.", "You treat the temptation as real instead of pretending money does not matter to a stressed room, but the staff can already feel which side of the scale your eyes went to first.", "triage", fx(1, -2, -2, { jake: st(1, 1), elena: st(-1, -2), devon: st(-1, -2) })),
              opt("cb-open-adrian-reject", "Dismiss the buyout instinctively because the fundraiser was promised the room first.", "The principle is clean and may also be financially naive in a week where cash is tight, which means the room could later resent being inspired instead of stabilized.", "triage", fx(-1, 1, 2, { jake: st(-1, -2), elena: st(1, 1), devon: st(1, 2) }))
            ]
          },
          devon: {
            prompt: "Parker says the fundraiser families will not experience cancellation as a business decision; they will experience it as betrayal.", 
            options: [
              opt("cb-open-parker-community", "Map the human fallout of bumping the fundraiser before the corporate number starts sounding too simple.", "You force the room to remember what community trust feels like when it has faces attached.", "triage", fx(0, 2, 3, { devon: st(2, 3), elena: st(1, 1), jake: st(-1, -1) })),
              opt("cb-open-parker-split", "Look immediately for a split solution so nobody has to lose outright if logistics can be stretched.", "The creativity is admirable and may still insult both sides if the compromise feels cheap, improvised, or obviously driven by fear of choosing.", "triage", fx(0, -2, -1, { devon: st(1, 1), elena: st(0, 0), jake: st(-1, -1) }))
            ]
          }
        }
      },
      triage: {
        title: "Now you must decide whether Feast Haven is a business that serves the community or a community space that must survive as a business",
        body: "Both stories are true. The pain comes from deciding which one outranks the other when the dollars get obscene.",
        consultants: {
          elena: {
            prompt: "Marisol says the front door will never sound the same again if it has to explain why local students were displaced for richer strangers.", 
            options: [
              opt("cb-triage-marisol-honor", "Honor the fundraiser booking and refuse the buyout, even if the financial opportunity hurts to watch walk away.", "The room keeps its word and loses a giant cushion in the same breath.", "fallout", fx(-2, 3, 4, { elena: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("cb-triage-marisol-sell", "Take the buyout and build the richest recovery package you can for the fundraiser elsewhere.", "The money is real. So is the lesson about what promises are worth when better money appears.", "fallout", fx(3, -2, -3, { elena: st(-3, -4), devon: st(-2, -3), nina: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar thinks the staff should not have to choose between community identity and making payroll next month if a smarter split can exist.", 
            options: [
              opt("cb-triage-omar-split", "Offer the corporate client a partial-room premium experience and protect the fundraiser as the center of the night.", "It is an awkward compromise that may preserve enough money and enough dignity to be worth trying, though both sides may still leave believing they were treated as a problem to be managed.", "fallout", fx(1, -2, -2, { marcus: st(1, 2), devon: st(0, 0), elena: st(-1, 0) })),
              opt("cb-triage-omar-clarity", "Reject the split and choose one side cleanly so nobody experiences a half-kept promise.", "The moral geometry gets simpler and the wound gets deeper for whoever loses, which means leadership will own a sharper but more coherent anger.", "fallout", fx(0, -2, 0, { marcus: st(0, 1), devon: st(-1, -1), elena: st(-1, -1) }))
            ]
          }
        }
      },
      fallout: {
        title: "The room now knows what Feast Haven worships when pressure is serious enough",
        body: "If you chose money, the community is judging you. If you chose principle, your finances are judging you. If you chose compromise, everyone is judging the quality of it.",
        consultants: {
          nina: {
            prompt: "Celia thinks the staff need a coherent story or they will explain the decision to guests from their own private resentment.", 
            options: [
              opt("cb-fallout-celia-story", "Give the room one honest script about why the decision was made and what value it was protecting.", "The pain does not disappear, but at least it stops being random and contradictory.", "final", fx(0, 2, 3, { nina: st(2, 3), elena: st(1, 1), jake: st(1, 1) })),
              opt("cb-fallout-celia-free", "Let each staff member speak naturally so the response feels more human than corporate.", "That may sound warm and also create six versions of the restaurant's soul by midnight.", "final", fx(1, -1, -2, { nina: st(-2, -3), elena: st(-1, -1) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks if you refused the money, the staff need to hear that the sacrifice had a practical future, not just a noble glow.", 
            options: [
              opt("cb-fallout-adrian-plan", "Pair the values decision with a concrete financial plan so the room does not feel like principle means drift.", "You keep the restaurant from sounding righteous and strategically helpless at the same time.", "final", fx(1, 2, 2, { jake: st(2, 2), elena: st(1, 1), marcus: st(1, 1) })),
              opt("cb-fallout-adrian-pride", "Lean on the moral win alone and trust the room to feel proud enough to absorb the cost.", "Pride can steady a night. It cannot always steady payroll or trust by itself.", "final", fx(0, 0, -1, { jake: st(0, 1), marcus: st(-1, -1) }))
            ]
          }
        }
      },
      final: {
        title: "The final move is deciding whether Feast Haven should be easier to trust or easier to monetize",
        body: "No restaurant gets to avoid this forever. The deeper question is what kind of promise your room is willing to become famous for keeping.",
        consultants: {
          devon: {
            prompt: "Parker wants a future standard so community events never again feel one rich phone call away from deletion.", 
            options: [
              opt("cb-final-parker-protect", "Create a protected-booking policy for community and mission-driven events, even if it limits future flexibility.", "You make the room slightly less agile and far more believable.", null, fx(0, 4, 4, { devon: st(2, 3), elena: st(1, 1), nina: st(1, 1) })),
              opt("cb-final-parker-open", "Keep future high-value buyouts open as a strategic option if the numbers are big enough.", "That keeps the business nimble and the room morally negotiable.", null, fx(2, -1, -2, { devon: st(-2, -3), elena: st(-1, -2), nina: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar wants the final lesson to help the staff answer a simple question: what does Feast Haven stand for when standing for it costs money?", 
            options: [
              opt("cb-final-omar-values", "Define the room publicly as a business with limits that still refuses to sell every promise to the highest bidder.", "It may not solve every future dilemma, but it gives the staff a spine to recognize.", null, fx(1, 3, 4, { marcus: st(2, 3), devon: st(1, 1), elena: st(1, 1), jake: st(1, 1) })),
              opt("cb-final-omar-market", "Define the room more openly as a business that must maximize survival when major money appears.", "That may be honest and also harder for the community-facing heart of the room to un-hear.", null, fx(2, 0, -1, { marcus: st(-1, -1), devon: st(-1, -2), elena: st(-1, -1) }))
            ]
          }
        }
      }
    }
  }
];
