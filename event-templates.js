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
    id: "open-close-kitchen-feud",
    category: "Kitchen Culture",
    pressure: "High",
    headline: "Morning kitchen staff walked into a disaster and closing staff says leadership set them up to fail",
    body:
      "Opening cooks say the kitchen was left filthy, half-stocked, and impossible to start from clean. Closing staff says the restaurant stayed open an extra hour, nobody got backup, and they were already drowning when they were finally cut loose.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The morning line wants accountability. The closing team wants someone to admit they were pushed too far.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants photos, prep sheets, and a real timeline before anyone starts acting offended.",
            options: [
              opt("ocf-open-renata", "Audit the close with Renata and compare the kitchen state to actual closing expectations.", "You start with standards instead of emotion, which gives the whole shift a better chance to stay grounded.", "closing-audit", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 2), luis: st(0, 1) })),
              opt("ocf-open-renata-line", "Back Renata immediately and treat the messy close as obvious kitchen failure.", "The standard sounds strong, but the closing crew feels condemned before anyone hears why they stayed late.", "blame-spillover", fx(1, -1, 1, { tasha: st(1, 2), luis: st(-3, -3), priya: st(-1, -1) }))
            ]
          },
          luis: {
            prompt: "Theo says closing got buried after the dining room stayed open late and the manager kept seating tables.",
            options: [
              opt("ocf-open-theo", "Walk the close from Theo's side and ask exactly where the extra hour broke the routine.", "The closing team feels heard, which lowers the chance of pure kitchen mutiny.", "closing-audit", fx(0, 1, 2, { luis: st(2, 3), tasha: st(-1, -1), priya: st(0, 1) })),
              opt("ocf-open-theo-push", "Tell Theo that staying late explains fatigue, not leaving the next shift a disaster.", "You keep the accountability line clear, but Theo instantly hears it as another lecture.", "blame-spillover", fx(1, -1, 1, { luis: st(-2, -3), priya: st(0, 0), tasha: st(1, 1) }))
            ]
          }
        }
      },
      "closing-audit": {
        title: "Both sides are right in the most annoying possible way",
        body: "The close was sloppy, but it also ran almost an hour beyond normal because the floor kept taking tables. The failure was shared, but nobody wants shared blame.",
        consultants: {
          priya: {
            prompt: "Imani wants a reset that protects the next open without pretending the close was working under normal conditions.",
            options: [
              opt("ocf-audit-priya", "Create a split responsibility fix: kitchen resets, plus a hard last-seat cutoff for the floor.", "The solution feels fair because it changes the system instead of naming one villain.", "manager-fault", fx(1, 3, 4, { priya: st(3, 4), luis: st(1, 2), tasha: st(1, 1), devon: st(1, 1) })),
              opt("ocf-audit-priya-tough", "Require the close to stay until the kitchen is reset no matter how late the floor runs.", "It protects tomorrow, but the kitchen hears more punishment than support.", "manager-fault", fx(2, -1, 1, { priya: st(1, 1), luis: st(-2, -2), tasha: st(1, 1) }))
            ]
          },
          devon: {
            prompt: "Parker says this became a kitchen war because nobody wants to admit the front kept feeding late tickets into a sinking ship.",
            options: [
              opt("ocf-audit-parker", "Trace exactly who kept seating tables late and how that changed the close.", "The room gets uncomfortable, but suddenly the story is more accurate.", "manager-fault", fx(0, 2, 3, { devon: st(2, 3), elena: st(1, 1), luis: st(1, 1) })),
              opt("ocf-audit-parker-soft", "Handle the floor's role quietly so the kitchen team can move on fast.", "You protect people from embarrassment, but risk the same bad pattern next week.", "manager-fault", fx(1, 0, 0, { devon: st(1, 1), elena: st(-1, -1), tasha: st(-1, -1) }))
            ]
          }
        }
      },
      "blame-spillover": {
        title: "Now the room is choosing sides instead of solving the close",
        body: "Opening staff feel disrespected. Closing staff feel scapegoated. The next move will decide whether this becomes a standards reset or a kitchen cold war.",
        consultants: {
          priya: {
            prompt: "Imani thinks the only way out is a written close-open handoff that nobody can fake next time.",
            options: [
              opt("ocf-blame-priya", "Launch a written close-open checklist and require both sides to sign it for the next week.", "You turn a feelings fight into an operational receipt everyone can see.", "manager-fault", fx(1, 2, 4, { priya: st(2, 3), luis: st(1, 1), tasha: st(1, 1) })),
              opt("ocf-blame-priya-side", "Let opening staff vent now and worry about systems later.", "The pressure releases briefly, but the kitchen still has no new structure.", "manager-fault", fx(0, -1, -1, { priya: st(-1, -2), luis: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol says the host stand heard all of this and the floor is now treating kitchen chaos like gossip content.",
            options: [
              opt("ocf-blame-marisol", "Address the whole team before preshift and frame it as a service-system failure, not a personality war.", "The room gets one clear story instead of three emotional versions.", "manager-fault", fx(1, 2, 3, { elena: st(2, 2), devon: st(1, 1), tasha: st(1, 1) })),
              opt("ocf-blame-marisol-private", "Keep the conversation behind the kitchen doors and try to contain the embarrassment.", "It protects dignity, but the floor still senses something ugly happened.", "manager-fault", fx(0, 0, 1, { elena: st(1, 1), devon: st(-1, -1) }))
            ]
          }
        }
      },
      "manager-fault": {
        title: "The final question is whether leadership will own the extra-hour decision",
        body: "Everyone now knows the kitchen mess did not happen in a vacuum. If you dodge that part, nobody will trust the rest of the fix.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants you to own the bad late-seat decision without erasing the kitchen's sloppy close.",
            options: [
              opt("ocf-final-own", "Own the extra-hour leadership mistake and pair it with new close standards for everyone.", "The kitchen hears both accountability and respect, which gives the repair a chance to stick.", null, fx(3, 4, 4, { tasha: st(2, 3), luis: st(2, 3), priya: st(2, 2), devon: st(1, 1) })),
              opt("ocf-final-half", "Acknowledge the long close, but keep most of the blame on the team that left the mess.", "You sound partially fair, but not fully brave enough to calm the resentment.", null, fx(2, 0, 0, { tasha: st(0, 1), luis: st(-2, -3), priya: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker thinks the restaurant needs one practical concession now so the next close does not immediately become a loyalty test.",
            options: [
              opt("ocf-final-support", "Add a hard last-seat cutoff and emergency backup help when the room runs late.", "People still grumble, but now they believe leadership learned something concrete.", null, fx(2, 3, 3, { devon: st(2, 3), elena: st(1, 2), luis: st(1, 2), priya: st(1, 1) })),
              opt("ocf-final-toughness", "Keep the staffing model exactly the same and demand tougher closes from now on.", "It sounds tough, but the next bad night will probably explode faster.", null, fx(2, -2, -2, { devon: st(-2, -2), luis: st(-2, -2), priya: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "hard-burger-ticket-war",
    category: "Execution Failure",
    pressure: "High",
    headline: "Wait staff says the kitchen keeps sending out wrong dishes, and the line says the tickets are unreadable",
    body:
      "Guests are getting bad plates and everyone has an explanation. The line says the tickets look like a ransom note. The floor says nobody should mistake 'hamburger' for 'hard burger' and send out an overcooked hockey puck.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The whole service chain is blaming the step before it, and guests are already feeling it.",
        consultants: {
          nina: {
            prompt: "Celia says the kitchen is using bad handwriting as an excuse for sloppy attention.",
            options: [
              opt("hbt-open-celia", "Review the floor tickets with Celia and compare them to the plates that actually hit the table.", "You make the argument evidence-based fast, which keeps the dining room from becoming pure finger-pointing.", "ticket-audit", fx(0, 1, 2, { nina: st(2, 3), luis: st(-1, -1), priya: st(0, 1) })),
              opt("hbt-open-celia-line", "Back the floor immediately and tell the kitchen a burger should never become a charcoal brick.", "Guests feel defended, but the line hears disrespect before the facts are sorted.", "kitchen-pushback", fx(1, 1, 1, { nina: st(1, 2), luis: st(-3, -3), priya: st(-2, -2) }))
            ]
          },
          luis: {
            prompt: "Theo says the tickets are so messy that the line is basically deciphering them under fire.",
            options: [
              opt("hbt-open-theo", "Stand at the line and have Theo show you exactly which tickets are causing the worst misses.", "The kitchen finally feels like someone is looking at the real bottleneck.", "ticket-audit", fx(0, 1, 2, { luis: st(2, 3), nina: st(-1, -1), priya: st(1, 1) })),
              opt("hbt-open-theo-guest", "Tell Theo that unreadable tickets are still less embarrassing than wrong food landing in front of guests.", "The standard is fair, but Theo hears it as another front-of-house loyalty test.", "kitchen-pushback", fx(1, -1, 0, { luis: st(-2, -3), nina: st(1, 1) }))
            ]
          }
        }
      },
      "ticket-audit": {
        title: "The tickets are messy, but the line is also guessing too confidently",
        body: "Handwriting is a problem. So is kitchen pride. The mistakes are happening because two weak habits are colliding under pressure.",
        consultants: {
          priya: {
            prompt: "Imani wants a system change that slows the mistakes without slowing the whole kitchen into a crawl.",
            options: [
              opt("hbt-audit-imani", "Standardize ticket marks, circles, and modifier shorthand before the next rush.", "The restaurant suddenly has one language instead of six improvised ones.", "guest-fallout", fx(1, 3, 4, { priya: st(3, 4), nina: st(1, 1), luis: st(1, 1) })),
              opt("hbt-audit-imani-verify", "Require verbal read-backs on any ticket that looks even slightly unclear.", "It is slower, but the kitchen can no longer hide behind bad guesses.", "guest-fallout", fx(0, 2, 3, { priya: st(2, 3), luis: st(1, 2), nina: st(1, 1) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the guest-facing damage matters most because tables do not care whose handwriting started it.",
            options: [
              opt("hbt-audit-adrian", "Focus first on table recovery and coach the internal process after the rush.", "You protect the room in the short term, but the workflow fix gets delayed.", "guest-fallout", fx(2, 2, 1, { jake: st(2, 2), nina: st(0, 1), luis: st(-1, -1) })),
              opt("hbt-audit-adrian-team", "Have Adrian help rewrite guest-facing order checks so the floor shares more of the fix.", "The floor loses some innocence, but the kitchen stops feeling dumped on.", "guest-fallout", fx(1, 2, 3, { jake: st(1, 2), luis: st(1, 1), nina: st(1, 1) }))
            ]
          }
        }
      },
      "kitchen-pushback": {
        title: "Now the line and floor are arguing about respect, not just tickets",
        body: "Once the tone hardened, everyone started remembering old slights. The actual food problem is at risk of becoming secondary.",
        consultants: {
          devon: {
            prompt: "Parker thinks the only way to cool this down is to rebuild the handoff in public so both sides stop rewriting history.",
            options: [
              opt("hbt-push-parker", "Run a mock handoff with floor and line together so everyone sees where the confusion begins.", "The room hates how awkward it is, which is exactly why it works.", "guest-fallout", fx(1, 2, 4, { devon: st(2, 3), nina: st(1, 1), luis: st(1, 1), priya: st(1, 1) })),
              opt("hbt-push-parker-soft", "Correct the tone privately and hope the service chain calms itself down.", "The temperature falls a little, but the broken handoff is still broken.", "guest-fallout", fx(0, 0, 0, { devon: st(1, 1), nina: st(-1, -1), luis: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants one clear standard that lets the line say no to unreadable tickets without sounding insubordinate.",
            options: [
              opt("hbt-push-renata", "Give the kitchen permission to reject unreadable tickets once, but require the floor to rewrite them immediately.", "It creates friction up front, but far less embarrassment once food starts leaving the pass.", "guest-fallout", fx(1, 2, 3, { tasha: st(2, 3), luis: st(2, 3), nina: st(-1, 0) })),
              opt("hbt-push-renata-hard", "Tell Renata the kitchen still has to make judgment calls because the floor cannot stop to rewrite every mess.", "Speed survives, but trust in the handoff erodes even more.", "guest-fallout", fx(1, -2, -2, { tasha: st(-2, -2), luis: st(-2, -3), nina: st(1, 1) }))
            ]
          }
        }
      },
      "guest-fallout": {
        title: "The dining room now wants to know whether the restaurant learned anything",
        body: "A few guests have already had dishes remade. You need a closing move that stabilizes both the room and the team behind it.",
        consultants: {
          nina: {
            prompt: "Celia wants the final answer to prove the floor will not be left holding the embarrassment alone next rush.",
            options: [
              opt("hbt-final-celia", "Train the full service chain together before the next shift and document the new ticket rules.", "The restaurant looks more serious because everyone shares the repair.", null, fx(3, 4, 4, { nina: st(2, 3), luis: st(1, 2), priya: st(1, 1), devon: st(1, 1) })),
              opt("hbt-final-celia-fast", "Patch tonight's mistakes, refund a few plates, and trust the team to work it out naturally.", "Guests may calm down, but the staff still knows the process is shaky.", null, fx(2, 1, 0, { nina: st(-1, -2), luis: st(-1, -1) }))
            ]
          },
          priya: {
            prompt: "Imani wants to end this with a system everyone will remember under pressure.",
            options: [
              opt("hbt-final-imani", "Create one visual ticket cheat sheet and make it part of every preshift for a week.", "The solution is a little boring, which is exactly why it might survive the rush.", null, fx(2, 3, 4, { priya: st(2, 3), luis: st(1, 1), nina: st(1, 1) })),
              opt("hbt-final-imani-hard", "Punish the loudest offenders and move on without formalizing anything else.", "The message lands, but the restaurant is still one bad scribble away from repeating itself.", null, fx(2, -1, -1, { priya: st(-1, -1), nina: st(-2, -2), luis: st(-2, -2) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "viral-gossip-backfire",
    category: "Reputation",
    pressure: "High",
    headline: "The hostess keeps filming behind-the-scenes gossip videos and now the staff cannot tell what is real anymore",
    body:
      "Marisol says the behind-the-scenes clips are helping Feast Haven go viral, but she keeps revealing staff drama and inventing wild claims when the real gossip is not juicy enough. Now the staff are furious, suspicious, and watching each other differently.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is not just a social media problem. It is a trust problem hiding inside a marketing excuse.",
        consultants: {
          elena: {
            prompt: "Marisol insists she is building hype and says the staff should be grateful someone is making the restaurant interesting.",
            options: [
              opt("vgb-open-marisol", "Review the actual clips with Marisol before deciding whether this is bold marketing or reckless gossip.", "You start with evidence, which gives you a chance to separate attention from damage.", "staff-trust-crack", fx(0, 1, 2, { elena: st(1, 2), devon: st(1, 1), nina: st(-1, -1) })),
              opt("vgb-open-marisol-line", "Tell Marisol immediately that staff drama is not content and she needs to stop filming.", "The line is clear, but Marisol instantly shifts into self-defense mode.", "staff-trust-crack", fx(0, 0, 1, { elena: st(-2, -2), devon: st(-1, -1), nina: st(1, 1) }))
            ]
          },
          devon: {
            prompt: "Parker says Marisol crossed a line, but also worries a public crackdown will turn this into even bigger drama.",
            options: [
              opt("vgb-open-parker", "Use Parker to understand what staff think was revealed, exaggerated, and fully invented.", "You map the emotional damage before choosing the punishment.", "staff-trust-crack", fx(0, 2, 2, { devon: st(2, 3), nina: st(1, 1), elena: st(0, 1) })),
              opt("vgb-open-parker-cover", "Ask Parker to quietly help Marisol pull the worst clips down before anyone else sees them.", "The cleanup starts fast, but it also risks looking like protection for the wrong person.", "staff-trust-crack", fx(0, 0, -1, { devon: st(1, 1), elena: st(1, 1), nina: st(-1, -2) }))
            ]
          }
        }
      },
      "staff-trust-crack": {
        title: "Now the staff want to know whether any of their private moments are safe here",
        body: "Some clips are real, some are exaggerated, and one or two are total fiction. That mix is what makes the betrayal so hard to calm down.",
        consultants: {
          nina: {
            prompt: "Celia wants this treated like a trust violation, not a cute social media accident.",
            options: [
              opt("vgb-crack-celia", "Take staff statements and address the fabricated claims as seriously as the real gossip.", "The room finally hears that lying for virality is its own offense.", "public-fallout", fx(0, 3, 4, { nina: st(2, 3), elena: st(-1, -1), devon: st(1, 1) })),
              opt("vgb-crack-celia-soft", "Focus only on the clips that are objectively untrue and ignore the real gossip for now.", "It is cleaner legally, but emotionally flatter than the staff hoped for.", "public-fallout", fx(0, 1, 1, { nina: st(0, 1), elena: st(0, 1) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the real danger is that guests or ex-staff will start quoting the videos back to the room.",
            options: [
              opt("vgb-crack-adrian", "Prepare one guest-facing line and one staff-facing line so nobody improvises the story badly.", "You stop the damage from spreading in six different versions at once.", "public-fallout", fx(1, 2, 3, { jake: st(2, 2), elena: st(0, 1), devon: st(1, 1) })),
              opt("vgb-crack-adrian-hide", "Treat it purely as an internal issue and hope the clips die before the public notices.", "It keeps things quieter short-term, but the restaurant now depends on luck.", "public-fallout", fx(0, -1, -2, { jake: st(-1, -1), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "public-fallout": {
        title: "The final damage depends on whether this is framed as recklessness, betrayal, or forgivable chaos",
        body: "The staff do not all want the same thing. Some want discipline. Some want privacy restored. Some want to know whether leadership will protect favorites.",
        consultants: {
          devon: {
            prompt: "Parker wants Marisol held accountable without destroying every good thing she has built at the front door.",
            options: [
              opt("vgb-fallout-parker", "Suspend the filming, force a direct apology, and rebuild a real content policy before anything goes live again.", "The restaurant loses the chaos, keeps a future path, and sounds like it finally has standards.", "final-standard", fx(1, 3, 4, { devon: st(2, 3), elena: st(-1, 0), nina: st(2, 2), jake: st(1, 1) })),
              opt("vgb-fallout-parker-save", "Let Marisol stay visible publicly, but quietly strip her access to staff spaces and private moments.", "It protects brand momentum, but the staff may still smell favoritism.", "final-standard", fx(1, 0, 0, { devon: st(0, 1), elena: st(1, 1), nina: st(-2, -3) }))
            ]
          },
          elena: {
            prompt: "Marisol says the restaurant only cares now because the videos worked, and that hurts almost as much as being accused.",
            options: [
              opt("vgb-fallout-marisol", "Acknowledge the creative upside, but make it clear that fabricated staff stories killed the trust budget.", "You sound fair without being weak, which gives the apology a chance to matter.", "final-standard", fx(1, 2, 3, { elena: st(1, 2), devon: st(1, 1), nina: st(1, 1) })),
              opt("vgb-fallout-marisol-hard", "Treat the whole thing as disloyalty and remove Marisol from anything brand-facing immediately.", "The message is clear, but the punishment may feel more emotional than strategic.", "final-standard", fx(0, 0, 1, { elena: st(-3, -4), devon: st(-2, -2), nina: st(1, 1) }))
            ]
          }
        }
      },
      "final-standard": {
        title: "The final move decides whether the restaurant feels safer or just quieter",
        body: "By now, the videos matter less than the culture signal you leave behind.",
        consultants: {
          nina: {
            prompt: "Celia wants one final move that tells the staff their private life is not just raw content waiting to happen.",
            options: [
              opt("vgb-final-celia", "Publish a strict no-gossip content rule and train the whole team on what can and cannot ever be filmed.", "It feels bigger than one person, which is exactly why the room can finally breathe again.", null, fx(2, 4, 4, { nina: st(2, 3), devon: st(1, 1), elena: st(0, 1) })),
              opt("vgb-final-celia-small", "End the incident with a one-time warning and a promise to be more careful.", "The scandal may end, but the trust repair does not really begin.", null, fx(1, -1, -2, { nina: st(-2, -3), devon: st(-1, -1), elena: st(1, 1) }))
            ]
          },
          jake: {
            prompt: "Adrian thinks the restaurant also needs a new story fast so the scandal is not the only thing people remember this week.",
            options: [
              opt("vgb-final-adrian", "Pair the discipline with a cleaner, guest-facing campaign that puts the focus back on the food and room.", "You close the wound faster because the restaurant stops staring at it.", null, fx(3, 2, 3, { jake: st(2, 2), elena: st(1, 1), nina: st(1, 1) })),
              opt("vgb-final-adrian-quiet", "Stay silent publicly and make this a purely internal repair.", "That can work, but only if the clips truly stop traveling.", null, fx(1, 1, 0, { jake: st(0, 1), nina: st(1, 1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "emotional-support-date",
    category: "Guest Policy",
    pressure: "Medium",
    headline: "The host seated a guest with a badly behaved dog because he called it his emotional support date",
    body:
      "A man charmed his way in and Parker let him sit with his dog at a table after he called it his 'emotional support date.' Now the dog is barking, lunging for food, and making the whole room question whether Feast Haven has any standards.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The room is split between thinking this is absurd, awkward, or somehow still manageable.",
        consultants: {
          devon: {
            prompt: "Parker says the guest sounded persuasive, the room was backed up, and the dog only started acting wild after it was seated.",
            options: [
              opt("esd-open-parker", "Get Parker's full read before deciding whether this was kindness, bad judgment, or both.", "You start by understanding the decision instead of only reacting to the spectacle.", "policy-gap", fx(0, 1, 2, { devon: st(2, 3), elena: st(-1, 0), jake: st(0, 1) })),
              opt("esd-open-parker-line", "Tell Parker immediately that funny explanations are not the same thing as policy.", "The lesson is obvious, but Parker feels hung out to dry before the fix is even clear.", "dining-room-chaos", fx(0, -1, 1, { devon: st(-2, -3), elena: st(1, 1) }))
            ]
          },
          elena: {
            prompt: "Marisol is embarrassed because the front door standard just dissolved in full view of the dining room.",
            options: [
              opt("esd-open-marisol", "Have Marisol walk you through what the host stand should have done and where the judgment slipped.", "You anchor the incident in front-door standards instead of just vibes.", "policy-gap", fx(0, 1, 3, { elena: st(2, 3), devon: st(-1, -1) })),
              opt("esd-open-marisol-room", "Put Marisol on guest recovery immediately before the dog wrecks another table.", "The room gets attention fast, but the internal lesson gets delayed.", "dining-room-chaos", fx(1, 2, 1, { elena: st(1, 1), devon: st(0, 1) }))
            ]
          }
        }
      },
      "policy-gap": {
        title: "It turns out nobody can explain the policy the same way",
        body: "Some people think emotional support claims should be treated like service animals. Others think this was obviously nonsense. Guests now care less about the law than whether the restaurant looks serious.",
        consultants: {
          jake: {
            prompt: "Adrian wants the dog out before the room turns this into the only thing anyone remembers tonight.",
            options: [
              opt("esd-gap-adrian", "Move fast, apologize to affected tables, and relocate or remove the guest before the room gets uglier.", "The dining room sees action instead of endless policy confusion.", "staff-standard", fx(2, 3, 2, { jake: st(2, 2), elena: st(1, 1), devon: st(-1, -1) })),
              opt("esd-gap-adrian-soft", "Try to compromise by moving the guest to a quieter corner and hoping the dog settles.", "It feels gentler, but the dog has not actually agreed to the plan.", "staff-standard", fx(0, -2, -1, { jake: st(-1, -1), elena: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata says the kitchen should not have to guess whether a barking dog belongs in a room full of food.",
            options: [
              opt("esd-gap-renata", "Treat it as a food and room-control issue and remove the dog from the equation quickly.", "The standard sounds less sentimental, but much more defensible under pressure.", "staff-standard", fx(1, 2, 3, { tasha: st(2, 3), elena: st(1, 1), devon: st(-1, -1) })),
              opt("esd-gap-renata-policy", "Pause and verify the exact accommodation policy before forcing the next move.", "The caution protects you legally, but the room gets more time to unravel.", "staff-standard", fx(0, 0, 2, { tasha: st(1, 1), devon: st(0, 1) }))
            ]
          }
        }
      },
      "dining-room-chaos": {
        title: "Now the issue is not the dog alone, it is whether the room thinks you are in control",
        body: "Nearby tables are reacting. Staff are improvising explanations. The guest keeps acting like everyone else is the problem.",
        consultants: {
          nina: {
            prompt: "Celia wants one clean guest-facing script so nobody says something dumb while trying to help.", 
            options: [
              opt("esd-chaos-celia", "Give the floor one guest script and one internal line so the room stops getting six versions.", "The restaurant suddenly sounds coordinated again, which calms more than one table.", "staff-standard", fx(1, 3, 3, { nina: st(2, 3), jake: st(1, 1), elena: st(1, 1) })),
              opt("esd-chaos-celia-free", "Let each table be handled naturally so the service feels less robotic.", "It sounds nicer in theory than it plays in a barking dining room.", "staff-standard", fx(0, -1, -1, { nina: st(-1, -2), jake: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker wants a path that corrects the mistake without making the whole front door feel publicly incompetent.",
            options: [
              opt("esd-chaos-parker", "Own that the host stand made the wrong judgment and fix it calmly without turning Parker into a spectacle.", "The correction lands cleaner because it is honest without being cruel.", "staff-standard", fx(1, 2, 3, { devon: st(1, 2), elena: st(1, 1), nina: st(1, 1) })),
              opt("esd-chaos-parker-cover", "Protect Parker publicly and describe the issue as a one-off guest misunderstanding.", "It saves face, but the staff may quietly call it favoritism.", "staff-standard", fx(1, 0, 0, { devon: st(2, 2), elena: st(-1, -2), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "staff-standard": {
        title: "The final move is whether this becomes a joke, a precedent, or a real standard",
        body: "Everyone will remember what happened here the next time a charming guest tries to freestyle the rules.",
        consultants: {
          elena: {
            prompt: "Marisol wants the front door protected by a rule that still leaves room for real compassion when it matters.",
            options: [
              opt("esd-final-marisol", "Write a front-door animal policy, train the stand, and make escalation mandatory on edge cases.", "The next weird guest will still happen, but the room will no longer wing it.", null, fx(2, 3, 4, { elena: st(2, 3), devon: st(1, 2), nina: st(1, 1) })),
              opt("esd-final-marisol-soft", "Tell the host stand to use better judgment next time and leave the rest unwritten.", "It sounds flexible, but not especially safe.", null, fx(1, -1, -1, { elena: st(-1, -1), devon: st(0, 1) }))
            ]
          },
          devon: {
            prompt: "Parker wants to recover from the mistake without losing all confidence at the front door.",
            options: [
              opt("esd-final-parker", "Coach Parker directly, let them own the recovery, and keep them visible in the next clean service moment.", "You correct the error without turning one bad call into permanent panic.", null, fx(2, 2, 2, { devon: st(2, 3), elena: st(1, 1) })),
              opt("esd-final-parker-pull", "Pull Parker off the stand for a while and let someone steadier hold the door.", "The immediate risk drops, but Parker may hear it as trust leaving the room.", null, fx(1, 0, 1, { devon: st(-2, -3), elena: st(1, 1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "buffalo-breakdown",
    category: "Inventory Failure",
    pressure: "High",
    headline: "The buffalo wing special is out of buffalo sauce and it is only Wednesday",
    body:
      "Feast Haven pushed the weekly special hard and now one of the core ingredients is gone halfway through the week. No one wants to own the slip-up, and the room is trying to decide whether this was ordering, overselling, or pure negligence.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The special is already printed, guests are asking for it, and every department has a reason this is someone else's fault.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants inventory counts, ticket volume, and the exact moment the kitchen realized the special was living on borrowed time.",
            options: [
              opt("bb-open-renata", "Audit the actual inventory and sales pace with Chef Renata before blaming the floor.", "You start with facts and avoid a fake certainty that would only inflame the next argument.", "supply-trace", fx(0, 1, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("bb-open-renata-line", "Back the kitchen immediately and assume the floor oversold the special irresponsibly.", "The cooks feel protected, but the floor hears blame arriving before the count is even done.", "service-scramble", fx(0, -1, 0, { tasha: st(1, 1), nina: st(-2, -2), elena: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol says the host stand was still seating people with the special pitch because nobody told the front door to stop.",
            options: [
              opt("bb-open-marisol", "Trace exactly when the front should have been told to stop selling the special.", "You shift the question from blame to communication failure, which is much more useful.", "supply-trace", fx(0, 2, 3, { elena: st(2, 3), devon: st(1, 1), tasha: st(0, 1) })),
              opt("bb-open-marisol-room", "Focus first on how to speak to guests now that the special is effectively fake.", "The room gets triage fast, but the root cause waits in the dark.", "service-scramble", fx(1, 2, 1, { elena: st(1, 1), nina: st(1, 1) }))
            ]
          }
        }
      },
      "supply-trace": {
        title: "Everyone contributed one small piece to the failure",
        body: "Ordering lagged, the kitchen stretched the stock optimistically, and the front kept selling it longer than anyone should have. Nobody is innocent enough to lecture everyone else.",
        consultants: {
          priya: {
            prompt: "Imani wants the fix to be boring, visible, and impossible to misunderstand next time.",
            options: [
              opt("bb-trace-imani", "Create a live special-count board that the kitchen and floor both update during service.", "It sounds almost too simple, which is exactly why people might finally use it.", "guest-recovery", fx(1, 3, 4, { priya: st(3, 4), tasha: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("bb-trace-imani-kitchen", "Give the kitchen full control over when a special is cut off, even if the floor hates the timing.", "It protects supply better, but centralizes the resentment too.", "guest-recovery", fx(1, 1, 2, { priya: st(1, 2), tasha: st(2, 2), nina: st(-1, -1) }))
            ]
          },
          nina: {
            prompt: "Celia wants the floor looped in earlier so guests stop hearing great pitches for things that are already half gone.",
            options: [
              opt("bb-trace-celia", "Set a mandatory floor alert the moment stock hits the final third of any promoted item.", "Guests still hear the special, just not after the truth has changed.", "guest-recovery", fx(1, 2, 3, { nina: st(2, 3), elena: st(1, 1), tasha: st(0, 1) })),
              opt("bb-trace-celia-blunt", "Tell the floor to sell smarter and stop relying on kitchen rescue when specials get tight.", "There is truth in it, but not much teamwork.", "guest-recovery", fx(1, -1, -1, { nina: st(-1, -1), elena: st(-1, -1), tasha: st(1, 1) }))
            ]
          }
        }
      },
      "service-scramble": {
        title: "Guests are still ordering something the restaurant does not fully have",
        body: "If the guest script is weak, the inventory problem becomes a trust problem in under ten minutes.",
        consultants: {
          jake: {
            prompt: "Adrian wants a substitution path that feels generous, not like a desperate save after a bad sell.",
            options: [
              opt("bb-scramble-adrian", "Offer a clear substitute and a small comp so tables do not feel baited.", "The room takes the pivot better when it feels intentional instead of evasive.", "guest-recovery", fx(1, 3, 2, { jake: st(2, 2), nina: st(1, 1), elena: st(1, 1) })),
              opt("bb-scramble-adrian-tight", "Push the remaining stock to the loudest tables and quietly steer everyone else elsewhere.", "It may save a few check averages, but the fairness cost is ugly if people compare notes.", "guest-recovery", fx(2, -2, -2, { jake: st(1, 1), nina: st(-1, -2), elena: st(-2, -2) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants the kitchen protected from a wave of improvisation that will only create new mistakes.", 
            options: [
              opt("bb-scramble-renata", "Cut the special cleanly and stop any half-measure improvisations before they reach the pass.", "It costs some sales now, but saves a bigger mess ten tickets later.", "guest-recovery", fx(0, 2, 3, { tasha: st(2, 3), priya: st(1, 1), luis: st(1, 1) })),
              opt("bb-scramble-renata-stretch", "Tell the kitchen to stretch what is left into modified versions for the rest of the night.", "You buy time, but invite inconsistency the second the room gets busy again.", "guest-recovery", fx(1, -1, -2, { tasha: st(-2, -2), priya: st(-1, -1), luis: st(1, 1) }))
            ]
          }
        }
      },
      "guest-recovery": {
        title: "The final move is whether this feels like scarcity, incompetence, or a restaurant that adjusted well under pressure",
        body: "By the end of tonight, guests will remember either the shortage or the recovery. Staff will remember whether the fix was fair.",
        consultants: {
          elena: {
            prompt: "Marisol wants the final standard to stop the host stand from ever selling blind into a dead special again.",
            options: [
              opt("bb-final-marisol", "Make special inventory visible across the whole room and require real-time updates from kitchen to floor.", "It is not glamorous, but it would have prevented almost every part of this disaster.", null, fx(2, 3, 4, { elena: st(2, 3), nina: st(1, 2), tasha: st(1, 1), priya: st(1, 1) })),
              opt("bb-final-marisol-quiet", "Patch the communication privately and avoid announcing a bigger policy reset.", "It may work once, but it also keeps the lesson soft and forgettable.", null, fx(1, 0, 0, { elena: st(0, 1), nina: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants leadership to admit the shortage was shared, not just dropped on the kitchen at the last second.", 
            options: [
              opt("bb-final-renata", "Own the shared failure publicly and pair it with a simple special-tracking system everyone must use.", "The accountability lands because nobody gets to pretend they were the only responsible adult in the room.", null, fx(3, 3, 4, { tasha: st(2, 3), priya: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("bb-final-renata-kitchen", "Frame the kitchen as the main control point and let the floor adapt around that.", "It sounds decisive, but the floor may feel blamed for a problem it could not fully see.", null, fx(2, 0, 1, { tasha: st(2, 2), nina: st(-2, -2), elena: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "busser-flirt-slowdown",
    category: "Floor Discipline",
    pressure: "Medium",
    headline: "The busser keeps flirting with customers and they love it, but the room is falling behind",
    body:
      "Omar has started charming customers so much that some tables now expect him to stop and banter. The guests enjoy it, but resets are slower, other staff are jealous, and Feast Haven is starting to feel uneven.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is one of those annoying problems where the behavior is good for the vibe right up until it becomes bad for the shift.",
        consultants: {
          marcus: {
            prompt: "Omar says he is building the guest experience, not doing anything wrong, and nobody complained until coworkers got salty about it.",
            options: [
              opt("bfs-open-omar", "Hear Omar out and find out how much of this is hospitality versus how much is missed reset work.", "You treat the issue like a real leadership call instead of instant jealousy management.", "room-jealousy", fx(0, 2, 2, { marcus: st(2, 3), jake: st(-1, -1), nina: st(-1, -1) })),
              opt("bfs-open-omar-line", "Tell Omar immediately that charm stops being charming when tables are not reset on time.", "The standard is fair, but Omar hears it as punishment for being naturally good with people.", "room-jealousy", fx(0, -1, 0, { marcus: st(-2, -2), jake: st(1, 1), nina: st(1, 1) }))
            ]
          },
          nina: {
            prompt: "Celia thinks Omar is getting away with something nobody else would be allowed to do during a rush.",
            options: [
              opt("bfs-open-celia", "Let Celia explain exactly how the flirting is slowing the service chain, not just annoying the floor.", "The complaint becomes more credible when it is tied to actual missed duties.", "room-jealousy", fx(0, 1, 2, { nina: st(2, 3), marcus: st(-1, -1), jake: st(0, 1) })),
              opt("bfs-open-celia-jealous", "Call out the jealousy angle immediately and make Celia prove the problem is operational.", "You challenge the tone, but risk making a real service issue sound petty.", "room-jealousy", fx(0, -1, -1, { nina: st(-2, -2), marcus: st(1, 1) }))
            ]
          }
        }
      },
      "room-jealousy": {
        title: "The room is now arguing about fairness, charisma, and who gets judged by different rules",
        body: "Omar is not the only person affected anymore. Adrian feels shown up, Celia feels standards are uneven, and guests are starting to notice who gets extra attention.",
        consultants: {
          jake: {
            prompt: "Adrian thinks Omar is freelancing the floor role without taking the harder guest-facing consequences servers live with all shift.",
            options: [
              opt("bfs-jealous-adrian", "Redraw the line between friendly table touchpoints and actual busser duties so nobody is guessing.", "The room suddenly has language for what crossed the line and what did not.", "guest-signal", fx(1, 2, 3, { jake: st(2, 2), marcus: st(1, 1), nina: st(1, 1) })),
              opt("bfs-jealous-adrian-side", "Protect the servers' territory and tell Omar to stop any table lingering immediately.", "It solves the jealousy fast, but also erases the one part guests actually liked.", "guest-signal", fx(0, -1, -1, { jake: st(1, 1), marcus: st(-2, -3) }))
            ]
          },
          elena: {
            prompt: "Marisol says the real issue is that the room now feels inconsistent depending on which table Omar likes best.", 
            options: [
              opt("bfs-jealous-marisol", "Treat this like a service-consistency problem, not a morality problem, and rebalance the floor touchpoints.", "The standard lands better because it sounds guest-focused instead of personal.", "guest-signal", fx(1, 3, 3, { elena: st(2, 3), marcus: st(1, 1), nina: st(1, 1) })),
              opt("bfs-jealous-marisol-quiet", "Leave the guest banter mostly alone and only push Omar harder on the resets.", "It may work if he adjusts, but the fairness question will still linger.", "guest-signal", fx(1, 0, 0, { elena: st(0, 1), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "guest-signal": {
        title: "Now the guests are part of the story too",
        body: "Some tables clearly love Omar. Others are noticing delays, uneven attention, and a room that looks less organized than it should.",
        consultants: {
          devon: {
            prompt: "Parker thinks Omar can keep the warmth if someone else fixes the pacing and role clarity around him.", 
            options: [
              opt("bfs-signal-parker", "Keep Omar's guest warmth, but give him tighter reset triggers and a visible duty checklist.", "You preserve the upside without pretending hospitality has no timing cost.", "final-balance", fx(2, 3, 3, { devon: st(2, 3), marcus: st(2, 2), nina: st(1, 1) })),
              opt("bfs-signal-parker-shift", "Move Omar further off the floor and use him mostly on back-end resets for a while.", "The room gets faster, but the human spark disappears with it.", "final-balance", fx(1, 0, 1, { devon: st(0, 1), marcus: st(-2, -2) }))
            ]
          },
          marcus: {
            prompt: "Omar still thinks the attention is good for business and says nobody is angry when they are flirting back.", 
            options: [
              opt("bfs-signal-omar", "Coach Omar on 'fast charm' instead of 'full conversation' so the room still moves.", "The correction feels respectful because it keeps his strength while trimming the excess.", "final-balance", fx(2, 2, 2, { marcus: st(2, 3), jake: st(1, 1), nina: st(1, 1) })),
              opt("bfs-signal-omar-hard", "Frame the whole thing as unprofessional and strip the warmth out of it entirely.", "The room gets safer, but also flatter and more resentful.", "final-balance", fx(0, -1, -1, { marcus: st(-3, -3), jake: st(1, 1), nina: st(1, 1) }))
            ]
          }
        }
      },
      "final-balance": {
        title: "The final move is whether the room learns balance or just fear",
        body: "Omar is not a villain. The room is not crazy. Your job is deciding what kind of hospitality Feast Haven actually rewards.",
        consultants: {
          elena: {
            prompt: "Marisol wants one final standard everyone can live with, not just a weird one-time talk about flirting.", 
            options: [
              opt("bfs-final-marisol", "Define a guest-warmth standard that still protects role clarity, reset timing, and fairness on the floor.", "The room gets a real cultural answer instead of another whispered exception.", null, fx(3, 3, 4, { elena: st(2, 3), marcus: st(2, 2), nina: st(1, 1), jake: st(1, 1) })),
              opt("bfs-final-marisol-warning", "End it with a one-time warning and trust people to self-correct.", "That may calm tonight, but it leaves the same fairness debate waiting for the next rush.", null, fx(1, 0, -1, { elena: st(-1, -1), nina: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar wants to know whether being genuinely great with guests counts for anything if it annoys coworkers.", 
            options: [
              opt("bfs-final-omar", "Tell Omar his guest warmth matters, but only when the role is still fully handled behind it.", "The message lands because it does not shame the strength, only the drift.", null, fx(2, 2, 2, { marcus: st(2, 3), nina: st(1, 1), jake: st(1, 1) })),
              opt("bfs-final-omar-shut", "Make the issue purely about duty completion and refuse to discuss the guest upside at all.", "The clarity is real, but so is the missed coaching opportunity.", null, fx(1, -1, 0, { marcus: st(-2, -2), nina: st(1, 1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "chef-mad-scientist-menu",
    category: "Menu Innovation",
    pressure: "Medium",
    headline: "Chef Renata's wild weekly experiments are exciting customers and breaking the kitchen's brain",
    body:
      "Chef Renata keeps forcing ambitious new dishes into the menu cycle: peanut-butter sloppy joes, BBQ chip tacos, chicken and pancakes. Some become cult hits. Some bomb immediately. The bigger problem is that ordering, prep, and training are turning into weekly chaos.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The creativity is real. So is the operational drag. The restaurant now has to decide what kind of chaos it is willing to romanticize.",
        consultants: {
          tasha: {
            prompt: "Chef Renata says the restaurant will die boring if every new idea is strangled by spreadsheet fear.",
            options: [
              opt("cms-open-renata", "Hear Renata out and separate the creative upside from the operational damage it is causing.", "You avoid reducing the whole issue to 'chef bad' and give the conversation real shape.", "line-friction", fx(0, 1, 2, { tasha: st(2, 3), luis: st(1, 1), priya: st(-1, -1) })),
              opt("cms-open-renata-line", "Tell Renata immediately that the menu is not a weekly science fair if the line cannot execute it.", "The constraint is real, but it lands as disrespect before it lands as leadership.", "line-friction", fx(0, -1, 0, { tasha: st(-2, -3), luis: st(1, 1), priya: st(1, 1) }))
            ]
          },
          priya: {
            prompt: "Imani says the experiments might be fine if they did not keep ambushing prep, pars, and line memory every week.",
            options: [
              opt("cms-open-imani", "Walk the prep and supply burden with Imani before deciding how much innovation the kitchen can actually absorb.", "You start with execution reality, which is exactly where the strain is hiding.", "line-friction", fx(0, 2, 3, { priya: st(2, 3), tasha: st(0, 1), luis: st(1, 1) })),
              opt("cms-open-imani-speed", "Tell Imani the kitchen simply needs to adapt faster if Feast Haven wants to stay interesting.", "That may sound visionary, but it mostly sounds like extra work with no guardrails.", "line-friction", fx(0, -1, -1, { priya: st(-2, -2), tasha: st(1, 1) }))
            ]
          }
        }
      },
      "line-friction": {
        title: "The deeper issue is not creativity, it is how often the room has to relearn itself",
        body: "Theo loves the swings when they land. Imani hates the instability. The floor hates selling things that may vanish or confuse guests midweek.",
        consultants: {
          luis: {
            prompt: "Theo thinks the weird dishes are worth it because they make Feast Haven feel alive instead of generic.",
            options: [
              opt("cms-friction-theo", "Keep the experiments, but cut them down to one controlled launch at a time with full prep buy-in.", "You preserve the spark without making every week feel like kitchen roulette.", "floor-consequence", fx(2, 2, 3, { luis: st(2, 3), tasha: st(1, 1), priya: st(1, 1) })),
              opt("cms-friction-theo-free", "Give Renata broad room to keep experimenting and tell the line to embrace the identity shift.", "The passion is real, but the chaos becomes policy instead of a side effect.", "floor-consequence", fx(1, -1, -2, { luis: st(2, 2), priya: st(-3, -3), nina: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol says the host stand is tired of selling items that sound like jokes unless the room is actually ready to stand behind them.", 
            options: [
              opt("cms-friction-marisol", "Require a front-of-house sign-off before any experimental dish goes public.", "The launch gets slower, but the room stops promising things it does not understand.", "floor-consequence", fx(1, 3, 4, { elena: st(2, 3), nina: st(1, 2), tasha: st(-1, 0) })),
              opt("cms-friction-marisol-late", "Let the kitchen experiment first and teach the floor after the dish proves itself.", "That sounds efficient until the room is blindsided mid-service again.", "floor-consequence", fx(1, -1, -1, { elena: st(-1, -2), nina: st(-2, -2) }))
            ]
          }
        }
      },
      "floor-consequence": {
        title: "The restaurant now has to choose whether weird is worth being difficult",
        body: "Guests are intrigued, but not always delighted. The kitchen is energized, but not always ready. The room is living inside that contradiction.",
        consultants: {
          nina: {
            prompt: "Celia wants the menu to stop making the floor sound ridiculous when a guest asks the obvious follow-up question.", 
            options: [
              opt("cms-floor-celia", "Create a limited innovation board with simple scripts, ingredients, and fallback swaps before launch.", "The dishes stay playful, but the room no longer sounds like it is improvising the explanation.", "final-identity", fx(2, 3, 4, { nina: st(2, 3), elena: st(1, 1), tasha: st(0, 1), priya: st(1, 1) })),
              opt("cms-floor-celia-cut", "Pull the strangest dishes entirely and make the menu more stable for a while.", "The room gets calmer, but the chef may hear it as creative surrender.", "final-identity", fx(1, 1, 2, { nina: st(1, 1), tasha: st(-2, -3), luis: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata says the restaurant should not chase personality only when it is easy and safe.", 
            options: [
              opt("cms-floor-renata", "Keep the innovation identity, but cap it with prep discipline, ordering limits, and one test window at a time.", "You finally make creativity pay rent instead of living free in operations.", "final-identity", fx(3, 2, 3, { tasha: st(2, 3), luis: st(1, 1), priya: st(1, 2) })),
              opt("cms-floor-renata-chaos", "Back Renata's instinct almost completely and let the room adapt around the chef's imagination.", "If it works, it sings. If it misses, it misses in public.", "final-identity", fx(2, -2, -2, { tasha: st(2, 2), luis: st(1, 1), priya: st(-2, -3), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "final-identity": {
        title: "This is really a decision about what Feast Haven is trying to be",
        body: "A safer room. A stranger room. A more famous room. A more disciplined room. The final call shapes more than a menu.",
        consultants: {
          tasha: {
            prompt: "Renata wants to know whether leadership still believes Feast Haven should feel alive and surprising.", 
            options: [
              opt("cms-final-renata", "Commit to creative identity, but only inside a strict pilot system the whole restaurant can support.", "The restaurant keeps its edge and finally builds a frame strong enough to carry it.", null, fx(3, 3, 4, { tasha: st(2, 3), priya: st(1, 2), luis: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("cms-final-renata-narrow", "Shrink experimentation sharply and tell Renata the room needs predictability more than flair right now.", "The shift gets calmer fast, but some of Feast Haven's personality goes with it.", null, fx(2, 1, 1, { tasha: st(-3, -4), luis: st(-1, -1), priya: st(1, 1) }))
            ]
          },
          priya: {
            prompt: "Imani wants one final answer she can actually trust while she is standing in the middle of a rush.", 
            options: [
              opt("cms-final-imani", "Set one launch calendar, one prep standard, and one fallback rule for every future experiment.", "It sounds rigid enough to save the room without killing the chef.", null, fx(2, 3, 4, { priya: st(2, 3), tasha: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("cms-final-imani-handwave", "Keep the conversation inspirational and trust the kitchen to feel its way through it week by week.", "That may sound supportive, but it solves almost none of the repeated pain.", null, fx(1, -1, -2, { priya: st(-2, -3), nina: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "silverware-collapse",
    category: "Supply Failure",
    pressure: "High",
    headline: "Someone ordered one fork, one knife, and one spoon instead of one hundred of each",
    body:
      "The new silverware shipment arrived and the entire restaurant now effectively has one place setting. The person responsible says it was a computer error. The rest of the staff says a real adult should have noticed before the order went through.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "It is funny for maybe ten seconds and then instantly becomes a full service catastrophe.",
        consultants: {
          elena: {
            prompt: "Marisol handled or approved the front-of-house order flow and says the system glitched in a way nobody would have caught.",
            options: [
              opt("sc-open-marisol", "Walk the order trail with Marisol before deciding whether this was negligence, bad software, or both.", "You resist the urge to laugh and start with the kind of fact pattern that might actually help.", "service-improv", fx(0, 1, 2, { elena: st(1, 2), devon: st(1, 1), nina: st(0, 1) })),
              opt("sc-open-marisol-line", "Tell Marisol a whole restaurant does not end up with one fork unless someone was not paying attention.", "The frustration is fair, but the accusation lands before the system story is tested.", "service-improv", fx(0, -1, 0, { elena: st(-2, -3), devon: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker says they saw the order screen at some point and also thought something looked strange, but nobody stopped to verify it.", 
            options: [
              opt("sc-open-parker", "Use Parker to reconstruct who saw the order, who shrugged, and when the bad assumption became policy.", "You turn one absurd mistake into a chain-of-attention problem, which is closer to the truth.", "service-improv", fx(0, 2, 3, { devon: st(2, 3), elena: st(0, 1) })),
              opt("sc-open-parker-protect", "Protect Parker from the blame map and focus only on the final approver.", "It keeps things cleaner politically, but maybe cleaner than the real failure deserves.", "service-improv", fx(0, 0, 0, { devon: st(1, 1), elena: st(-1, -1) }))
            ]
          }
        }
      },
      "service-improv": {
        title: "Now the restaurant has to survive service with almost no silverware",
        body: "Guests still need to eat. The fix you choose now will decide whether this becomes a funny story or a humiliating one.",
        consultants: {
          nina: {
            prompt: "Celia wants a guest-facing plan immediately because the floor cannot keep saying 'we're working on it' to every table.", 
            options: [
              opt("sc-improv-celia", "Pivot to a visible rolling-sanitize system and explain the shortage before guests discover it by surprise.", "The room may not love it, but it respects being told the truth before the awkwardness lands.", "blame-accountability", fx(1, 2, 2, { nina: st(2, 3), jake: st(1, 1), elena: st(0, 1) })),
              opt("sc-improv-celia-hide", "Try to quietly recycle silverware table to table and hope nobody notices the delay pattern.", "It feels slick until one frustrated table compares notes with another.", "blame-accountability", fx(1, -2, -2, { nina: st(-1, -2), jake: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar wants the bussing loop redesigned immediately because the whole room now depends on his reset timing.", 
            options: [
              opt("sc-improv-omar", "Make bussing and reset the temporary heartbeat of the shift and reassign support to protect it.", "The dining room gets slower but far more survivable.", "blame-accountability", fx(1, 2, 3, { marcus: st(3, 4), devon: st(1, 1), nina: st(1, 1) })),
              opt("sc-improv-omar-push", "Tell Omar to simply move faster and keep the current staffing pattern.", "It sounds decisive, but it mostly turns one bad order into burnout math.", "blame-accountability", fx(0, -1, -1, { marcus: st(-2, -3), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "blame-accountability": {
        title: "Once service is patched, everyone wants the same answer: who owns this",
        body: "A funny systems error is still a systems error. The room is now watching whether leadership will solve the joke or just survive it.",
        consultants: {
          elena: {
            prompt: "Marisol says she will own what is hers, but not every click that passed through three other sets of eyes too.", 
            options: [
              opt("sc-blame-marisol", "Treat it as a chain failure and fix the approval process instead of publicly hanging one person.", "The answer sounds grown-up enough that people may actually trust the fix.", "final-protocol", fx(1, 2, 4, { elena: st(1, 2), devon: st(1, 1), nina: st(1, 1), marcus: st(1, 1) })),
              opt("sc-blame-marisol-direct", "Make the final approver own it publicly because someone needs to be visibly responsible.", "The room gets its villain, but maybe not its best lesson.", "final-protocol", fx(1, -1, 1, { elena: st(-3, -4), devon: st(-1, -1), nina: st(1, 1) }))
            ]
          },
          devon: {
            prompt: "Parker thinks the real embarrassment is how many people saw something odd and kept moving anyway.", 
            options: [
              opt("sc-blame-parker", "Use the mistake to create a two-person verification rule on every critical order.", "The room may groan, but it will never forget why the rule exists.", "final-protocol", fx(1, 2, 4, { devon: st(2, 3), elena: st(1, 1), nina: st(1, 1) })),
              opt("sc-blame-parker-soft", "Keep the process light and trust people to be more careful after this humiliation.", "It saves time now, but invites future overconfidence.", "final-protocol", fx(1, 0, 0, { devon: st(0, 1), marcus: st(-1, -1) }))
            ]
          }
        }
      },
      "final-protocol": {
        title: "The final move is whether this becomes a one-night disaster or a permanent story about how Feast Haven learns",
        body: "Staff will laugh about the one-fork night forever. The question is whether they also remember the rule that came out of it.",
        consultants: {
          marcus: {
            prompt: "Omar wants the last move to respect how much hidden labor carried the room through this absurd shift.", 
            options: [
              opt("sc-final-omar", "Create a supply verification ritual and credit the support staff who kept service from collapsing entirely.", "The fix lands stronger because it honors both the lesson and the people who saved the room.", null, fx(2, 3, 4, { marcus: st(2, 3), devon: st(1, 1), nina: st(1, 1), elena: st(1, 1) })),
              opt("sc-final-omar-funny", "Lean into the comedy of the night and trust the staff to remember the embarrassment on their own.", "It may become a legendary story, but not necessarily a better system.", null, fx(1, 0, -1, { marcus: st(-1, -1), devon: st(-1, -1) }))
            ]
          },
          elena: {
            prompt: "Marisol wants to recover her credibility without pretending the order was no big deal.", 
            options: [
              opt("sc-final-marisol", "Own the miss, help design the new verification path, and make the process correction part of your leadership reset.", "It gives the room a reason to trust that the embarrassment produced an adult response.", null, fx(2, 2, 3, { elena: st(2, 3), devon: st(1, 1), nina: st(1, 1) })),
              opt("sc-final-marisol-protect", "Contain the blame tightly and move on once the new silverware finally arrives.", "The immediate wound may close, but the cultural lesson stays blurry.", null, fx(1, -1, -1, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "dirty-dishes-war",
    category: "Operations Conflict",
    pressure: "High",
    headline: "Dirty dishes keep landing in front of guests and now the whole service chain is at war",
    body:
      "Plates are coming back with spots, lipstick, or stuck-on grime. The dish side says kitchen plates are impossible to wash when they come back caked. The floor says guests should never be the ones catching it. The kitchen is furious at both of them.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The problem touches every handoff in the building, which is why nobody feels fully guilty and everybody feels fully annoyed.",
        consultants: {
          marcus: {
            prompt: "Omar says the dishes are being sent back filthy enough to require a miracle, not a rinse cycle.", 
            options: [
              opt("ddw-open-omar", "Walk the dish flow with Omar and see exactly what is hitting the pit and what is leaving it.", "You start where the hidden labor lives, which usually makes the truth show up faster.", "handoff-failure", fx(0, 2, 3, { marcus: st(2, 3), tasha: st(-1, -1), nina: st(0, 1) })),
              opt("ddw-open-omar-floor", "Tell Omar guest-visible dirty plates matter more than how impossible the pit feels right now.", "The guest standard is right, but the pit hears it as leadership seeing only the end of the chain.", "guest-embarrassment", fx(0, -1, 0, { marcus: st(-2, -3), nina: st(1, 1) }))
            ]
          },
          nina: {
            prompt: "Celia says the floor is catching the embarrassment while everyone else debates texture, grease, and excuses.", 
            options: [
              opt("ddw-open-celia", "Start with the guest-facing failures and document exactly what tables are seeing.", "The room gets immediate validation that guest embarrassment is not a side issue.", "handoff-failure", fx(0, 1, 2, { nina: st(2, 3), marcus: st(-1, -1), tasha: st(0, 1) })),
              opt("ddw-open-celia-blame", "Treat the dish pit as the primary failure until someone proves otherwise.", "The simplicity feels satisfying right up until the rest of the chain pushes back hard.", "guest-embarrassment", fx(0, -1, -1, { nina: st(1, 1), marcus: st(-3, -4), tasha: st(-1, -1) }))
            ]
          }
        }
      },
      "handoff-failure": {
        title: "The restaurant is discovering that every station is dirty in a different way",
        body: "Kitchen sends back rough plates, dish is rushed, and floor checks are inconsistent. The problem survives because each step thinks the next one should catch it.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants the kitchen held accountable for what hits the pit without pretending the dish side gets a free pass.", 
            options: [
              opt("ddw-handoff-renata", "Set a scrape-and-rinse standard before anything leaves kitchen hands for the pit.", "The kitchen hates it at first, which is usually how you know the standard mattered.", "guest-embarrassment", fx(1, 2, 4, { tasha: st(1, 2), marcus: st(2, 2), priya: st(1, 1), luis: st(1, 1) })),
              opt("ddw-handoff-renata-pit", "Leave the kitchen flow alone and force dish to improve under the current mess load.", "That keeps the line moving, but asks the pit to solve everybody else's bad habits.", "guest-embarrassment", fx(1, -1, -1, { tasha: st(1, 1), marcus: st(-3, -4) }))
            ]
          },
          devon: {
            prompt: "Parker says the floor also needs a final plate check because no guest should be the true last quality control step.", 
            options: [
              opt("ddw-handoff-parker", "Build a quick plate-check habit into the floor handoff before anything touches the table.", "It adds seconds, but saves the room from full public embarrassment.", "guest-embarrassment", fx(1, 3, 3, { devon: st(2, 3), nina: st(1, 1), jake: st(1, 1) })),
              opt("ddw-handoff-parker-speed", "Keep the floor moving fast and trust kitchen-plus-dish to solve it upstream.", "The pacing survives, but so do the ugly surprises.", "guest-embarrassment", fx(1, -1, -2, { devon: st(-1, -1), nina: st(-1, -1) }))
            ]
          }
        }
      },
      "guest-embarrassment": {
        title: "Now guests are part of the story and the room wants visible control back",
        body: "The staff conflict is no longer private. Dirty plates change how guests read the entire restaurant, not just the dish station.",
        consultants: {
          jake: {
            prompt: "Adrian wants a recovery move that protects tables now, even if the internal fix takes another day to fully land.", 
            options: [
              opt("ddw-guest-adrian", "Comp affected tables, apologize directly, and slow the service chain just enough to protect the next hour.", "The room may lose some speed, but it stops bleeding dignity in public.", "final-standard", fx(1, 4, 3, { jake: st(2, 2), nina: st(1, 1), marcus: st(1, 1) })),
              opt("ddw-guest-adrian-quiet", "Handle complaints table by table and avoid turning the issue into a whole-room slowdown.", "That can work if the dirty plates stop immediately. If they do not, the damage doubles.", "final-standard", fx(1, 0, 0, { jake: st(1, 1), nina: st(-1, -1) }))
            ]
          },
          marcus: {
            prompt: "Omar wants the pit protected from becoming the single scapegoat for a three-stage failure.", 
            options: [
              opt("ddw-guest-omar", "Frame the problem as a full-chain reset and make each station own one non-negotiable check.", "It sounds less dramatic than blame, but much more likely to survive next week.", "final-standard", fx(1, 2, 4, { marcus: st(2, 3), tasha: st(1, 1), devon: st(1, 1), nina: st(1, 1) })),
              opt("ddw-guest-omar-pit", "Put the burden mainly on dish because guests do not care how the grime got there.", "The logic is clean, but the culture gets uglier instantly.", "final-standard", fx(1, -1, -1, { marcus: st(-3, -4), tasha: st(1, 1), nina: st(1, 1) }))
            ]
          }
        }
      },
      "final-standard": {
        title: "The final move decides whether this becomes a quality standard or just another ugly service memory",
        body: "Everyone now agrees the problem is real. The last question is whether the restaurant fixes the chain or only the loudest symptom.",
        consultants: {
          tasha: {
            prompt: "Chef Renata wants one full-chain standard, not a vague promise that everyone will try harder next time.", 
            options: [
              opt("ddw-final-renata", "Create a three-stop cleanliness standard: kitchen scrape, dish clarity, floor check.", "It is operationally obvious enough to actually outlive the argument.", null, fx(2, 3, 4, { tasha: st(2, 3), marcus: st(2, 2), devon: st(1, 1), nina: st(1, 1) })),
              opt("ddw-final-renata-hard", "Punish the most visibly responsible people and trust the rest of the chain to self-correct.", "The blame lands, but the process still leaks.", null, fx(1, -1, -1, { tasha: st(-1, -1), marcus: st(-2, -2), nina: st(-1, -1) }))
            ]
          },
          devon: {
            prompt: "Parker wants guests to feel the restaurant got more serious, not more defensive.", 
            options: [
              opt("ddw-final-parker", "Pair the internal standard with one quiet guest-recovery protocol so embarrassment never lingers unanswered.", "The fix feels complete because it respects both the operation and the guest memory.", null, fx(2, 4, 4, { devon: st(2, 3), jake: st(1, 1), nina: st(1, 1), marcus: st(1, 1) })),
              opt("ddw-final-parker-speed", "Restore full pace quickly and trust the new standards to work without much extra visibility.", "That may save time, but not necessarily confidence.", null, fx(1, 0, 0, { devon: st(0, 1), nina: st(-1, -1) }))
            ]
          }
        }
      }
    }
  },
  {
    id: "food-heaven-rivalry",
    category: "Competitive Threat",
    pressure: "High",
    headline: "A new restaurant called FOOD HEAVEN just opened across the street and the whole staff is rattled",
    body:
      "The new place is visible from Feast Haven's front windows. Some staff are openly competitive. Some are anxious. Some are already wondering whether the better opportunity might be across the street. The room feels jumpy and personal.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "A rival can energize a restaurant or hollow it out from the inside before the first guest even defects.",
        consultants: {
          elena: {
            prompt: "Marisol wants Feast Haven to respond visibly and confidently before FOOD HEAVEN defines the story for both restaurants.", 
            options: [
              opt("fhr-open-marisol", "Start with Marisol and map how the room is reading the competitor from the front door out.", "You begin with mood, optics, and what guests are already quietly comparing.", "staff-anxiety", fx(1, 1, 2, { elena: st(2, 3), devon: st(1, 1), jake: st(1, 1) })),
              opt("fhr-open-marisol-line", "Tell Marisol this only matters if guests actually leave and refuse to feed the panic early.", "The calm is intentional, but the room may hear it as denial instead of steadiness.", "staff-anxiety", fx(0, -1, -1, { elena: st(-1, -2), devon: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata takes the rival personally and says the only answer is to out-execute them every single night.", 
            options: [
              opt("fhr-open-renata", "Let Renata explain where the kitchen can realistically compete without burning itself alive.", "You respect the pride without blindly swallowing the adrenaline.", "staff-anxiety", fx(1, 1, 2, { tasha: st(2, 3), luis: st(1, 1), priya: st(1, 1) })),
              opt("fhr-open-renata-push", "Back Renata's urgency and tell the team this is war now.", "The energy spike is real, but so is the risk that fear becomes policy.", "staff-anxiety", fx(2, -1, -2, { tasha: st(2, 2), luis: st(1, 1), priya: st(-1, -1), devon: st(-1, -1) }))
            ]
          }
        }
      },
      "staff-anxiety": {
        title: "The bigger problem is not guests leaving first, it is staff imagining a future without Feast Haven",
        body: "People are comparing, speculating, and projecting their own frustrations onto the competitor. That makes every normal shift problem feel sharper.",
        consultants: {
          nina: {
            prompt: "Celia thinks the staff need a believable internal plan or they will start treating every rough shift as proof the other place is better.", 
            options: [
              opt("fhr-anxiety-celia", "Address the team directly and define what Feast Haven will compete on besides panic and pride.", "The room gets a real internal narrative instead of rumor and insecurity.", "guest-battle", fx(1, 3, 4, { nina: st(2, 3), devon: st(1, 1), elena: st(1, 1) })),
              opt("fhr-anxiety-celia-silent", "Keep the staff talk minimal and focus only on guest-facing execution.", "You avoid overdramatizing it, but leave too much fear to breed quietly.", "guest-battle", fx(1, 0, 0, { nina: st(-1, -1), devon: st(-1, -1) }))
            ]
          },
          luis: {
            prompt: "Theo is half-competitive and half-curious whether FOOD HEAVEN might actually value the kitchen more.", 
            options: [
              opt("fhr-anxiety-theo", "Treat Theo's curiosity seriously and talk about what would make the current kitchen worth staying loyal to.", "The conversation gets more honest than the usual 'be grateful you work here' line.", "guest-battle", fx(0, 2, 2, { luis: st(2, 3), tasha: st(1, 1), priya: st(1, 1) })),
              opt("fhr-anxiety-theo-loyalty", "Shut down any talk of leaving and frame it as disloyal during a competitive moment.", "It may sound strong, but insecurity rarely gets healthier when cornered.", "guest-battle", fx(1, -2, -2, { luis: st(-3, -4), tasha: st(1, 1), priya: st(-1, -1) }))
            ]
          }
        }
      },
      "guest-battle": {
        title: "Now the question is whether Feast Haven responds with identity, fear, or theater",
        body: "Guests are already comparing menus, energy, and staff mood. One bad overreaction could make FOOD HEAVEN look stronger than they actually are.",
        consultants: {
          jake: {
            prompt: "Adrian wants a visible answer that makes the room feel alive and confident again, not defensive and twitchy.", 
            options: [
              opt("fhr-battle-adrian", "Launch a calm, confident floor campaign built around what Feast Haven already does well.", "The room stops feeling hunted and starts sounding intentional again.", "final-position", fx(3, 2, 3, { jake: st(2, 3), elena: st(1, 1), nina: st(1, 1) })),
              opt("fhr-battle-adrian-fomo", "Mirror the rival aggressively and try to beat them move for move right away.", "It may feel exciting, but it also makes Feast Haven look reactive instead of sure of itself.", "final-position", fx(2, -1, -2, { jake: st(1, 1), elena: st(-1, -1), tasha: st(-1, -1) }))
            ]
          },
          tasha: {
            prompt: "Chef Renata wants the kitchen to answer with quality and pacing, not gimmicky panic.", 
            options: [
              opt("fhr-battle-renata", "Compete by tightening execution, reducing avoidable mistakes, and letting the room feel sharper for a week.", "It is not flashy, but it is the kind of answer staff can actually sustain.", "final-position", fx(2, 3, 4, { tasha: st(2, 3), priya: st(1, 2), luis: st(1, 1) })),
              opt("fhr-battle-renata-war", "Push the kitchen into a prove-yourself sprint and dare them to outwork the competitor immediately.", "The pride lands, but so does the fatigue.", "final-position", fx(2, -1, -1, { tasha: st(2, 2), priya: st(-1, -1), luis: st(0, 1) }))
            ]
          }
        }
      },
      "final-position": {
        title: "The final move is what story Feast Haven tells itself about competition",
        body: "A rival restaurant changes things most when your own staff start narrating your weaknesses for you. The last move has to change that story.",
        consultants: {
          elena: {
            prompt: "Marisol wants the front of house to feel proud again, not like it is secretly waiting to lose the comparison.", 
            options: [
              opt("fhr-final-marisol", "Unify the room around one identity: warmer service, steadier standards, and zero panic theater.", "The restaurant does not need to be louder than the rival if it sounds more sure of itself.", null, fx(3, 4, 4, { elena: st(2, 3), devon: st(1, 2), nina: st(1, 1), jake: st(1, 1) })),
              opt("fhr-final-marisol-prove", "Keep the rivalry front and center and turn every preshift into an anti-FOOD-HEAVEN speech.", "That can energize some people, but also exhaust everyone else fast.", null, fx(2, -1, -1, { elena: st(1, 1), devon: st(-1, -1), nina: st(-1, -1) }))
            ]
          },
          luis: {
            prompt: "Theo wants to know whether the restaurant will compete hard enough to be worth staying loyal to.", 
            options: [
              opt("fhr-final-theo", "Show the staff a real improvement plan so loyalty feels earned, not demanded.", "The room settles because the future stops sounding like empty pride and starts sounding like direction.", null, fx(2, 3, 3, { luis: st(2, 3), priya: st(1, 1), tasha: st(1, 1), nina: st(1, 1) })),
              opt("fhr-final-theo-loyalty", "Demand loyalty first and promise the restaurant will figure out the rest through attitude.", "That may sound bold, but mostly to the people who are not the most tempted to leave.", null, fx(1, -2, -2, { luis: st(-3, -4), devon: st(-1, -1), nina: st(-1, -1) }))
            ]
          }
        }
      }
    }
  }
];
