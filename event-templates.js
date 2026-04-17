const fx = (sales, satisfaction, reputation, staff = {}) => ({
  sales,
  satisfaction,
  reputation,
  staff
});

const st = (morale, trust) => ({ morale, trust });

module.exports = [
  {
    id: "rotting-return",
    category: "Return Nightmare",
    pressure: "High",
    headline: "A customer demands to return a week-old car and there is a rotting animal in the trunk",
    body:
      "A customer storms in claiming Nina promised a 30-day return policy online. The vehicle now reeks, the interior looks trashed, and a dead animal in the trunk is so decomposed nobody can identify it.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The dealership has a promise dispute, a disgusting vehicle problem, and a furious customer all at once.",
        consultants: {
          nina: {
            prompt: "Nina wants the message thread reviewed before anyone decides she promised too much.",
            options: [
              {
                id: "rr-open-nina-thread",
                label: "Review the message thread with Nina before responding to the customer.",
                outcome: "You start with facts instead of panic.",
                nextNodeId: "promise-review",
                effects: fx(-1, 0, 3, {
                  nina: st(1, 3),
                  marcus: st(1, 1)
                })
              },
              {
                id: "rr-open-nina-front",
                label: "Put Nina in front of the customer immediately to explain what she meant.",
                outcome: "The customer gets an answer fast, but Nina feels exposed before the store has its story straight.",
                nextNodeId: "showroom-containment",
                effects: fx(0, -1, -2, {
                  nina: st(-4, -4),
                  jake: st(1, 0)
                })
              },
              {
                id: "rr-open-nina-calm",
                label: "Have Nina keep the customer calm while you inspect the vehicle first.",
                outcome: "You buy breathing room and separate the promise issue from the condition issue.",
                nextNodeId: "contamination-triage",
                effects: fx(0, 2, 1, {
                  nina: st(2, 2),
                  tasha: st(1, 1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants policy and documentation sorted before the dealership casually agrees to anything.",
            options: [
              {
                id: "rr-open-marcus-freeze",
                label: "Freeze any return talk until Marcus verifies policy and documents the claim.",
                outcome: "The store looks disciplined, even if the customer hates the slower pace.",
                nextNodeId: "promise-review",
                effects: fx(-1, -1, 3, {
                  marcus: st(3, 4),
                  nina: st(-1, -1)
                })
              },
              {
                id: "rr-open-marcus-deny",
                label: "Let Marcus tell the customer used cars are not casually returnable.",
                outcome: "The policy line is clear, but the room gets harder immediately.",
                nextNodeId: "showroom-containment",
                effects: fx(0, -3, -3, {
                  marcus: st(1, 2),
                  elena: st(-1, -1)
                })
              },
              {
                id: "rr-open-marcus-cost",
                label: "Have Marcus start documenting cleanup, depreciation, and condition exposure.",
                outcome: "You turn a disgusting shock into a controlled business problem fast.",
                nextNodeId: "contamination-triage",
                effects: fx(-1, 0, 2, {
                  marcus: st(2, 3),
                  tasha: st(1, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants the car quarantined and inspected before anyone pretends this is only a policy disagreement.",
            options: [
              {
                id: "rr-open-tasha-inspect",
                label: "Have Tasha inspect the car and tell you exactly how bad it is.",
                outcome: "You trade speed for hard truth.",
                nextNodeId: "contamination-triage",
                effects: fx(-1, 1, 3, {
                  tasha: st(3, 4),
                  nina: st(0, 0)
                })
              },
              {
                id: "rr-open-tasha-quarantine",
                label: "Move the vehicle off the public lot and quarantine it before the showroom smells it too.",
                outcome: "The grossest part of the scene gets contained fast.",
                nextNodeId: "contamination-triage",
                effects: fx(-1, 2, 2, {
                  tasha: st(2, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "rr-open-tasha-hide",
                label: "Ask whether service can deodorize and clean it before the customer gains more leverage.",
                outcome: "You move toward concealment before you know what was actually promised.",
                nextNodeId: "showroom-containment",
                effects: fx(0, -2, -3, {
                  tasha: st(-3, -4),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the main job is stopping a loud customer from poisoning the showroom.",
            options: [
              {
                id: "rr-open-jake-exchange",
                label: "Have Jake pivot the customer toward an exchange instead of a pure return.",
                outcome: "The customer sees a path forward, but the store still has not answered what Nina promised.",
                nextNodeId: "showroom-containment",
                effects: fx(2, 1, 0, {
                  jake: st(2, 2),
                  nina: st(-1, -1)
                })
              },
              {
                id: "rr-open-jake-blame",
                label: "Let Jake argue that Nina never had authority to promise returns anyway.",
                outcome: "The blame shifts quickly and the dealership starts to look disorganized.",
                nextNodeId: "promise-review",
                effects: fx(0, -2, -2, {
                  jake: st(1, 1),
                  nina: st(-4, -4)
                })
              },
              {
                id: "rr-open-jake-stall",
                label: "Tell Jake to buy time while service and accounting look underneath the story.",
                outcome: "The room stays calmer, but Jake is now carrying a crisis he cannot fully explain.",
                nextNodeId: "contamination-triage",
                effects: fx(1, 1, 1, {
                  jake: st(1, 2),
                  tasha: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "promise-review": {
        title: "The messages are vague enough to be dangerous",
        body: "Nina never typed the exact words 'full return,' but the thread is loose enough that the customer clearly walked away with that impression.",
        consultants: {
          nina: {
            prompt: "Nina wants the dealership to distinguish sloppy wording from a deliberate promise.",
            options: [
              {
                id: "rr-promise-nina-own",
                label: "Let Nina admit the wording was loose and help craft the correction herself.",
                outcome: "The apology feels human instead of coached.",
                nextNodeId: "customer-settlement",
                effects: fx(-1, 3, 3, {
                  nina: st(1, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "rr-promise-nina-defend",
                label: "Back Nina's interpretation and insist the customer heard what they wanted to hear.",
                outcome: "You protect your employee, but the dealership sounds more defensive than fair.",
                nextNodeId: "team-fallout",
                effects: fx(0, -2, -3, {
                  nina: st(2, 1),
                  marcus: st(0, 1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants the final answer tied to policy language, not to whoever seems most emotional.",
            options: [
              {
                id: "rr-promise-marcus-goodwill",
                label: "Use policy as the baseline, but pair it with a documented goodwill option.",
                outcome: "The dealership sounds firm without sounding petty.",
                nextNodeId: "customer-settlement",
                effects: fx(-2, 2, 4, {
                  marcus: st(2, 3),
                  nina: st(0, 1)
                })
              },
              {
                id: "rr-promise-marcus-hardline",
                label: "Make Marcus enforce policy strictly and refuse anything that resembles a return.",
                outcome: "The rule stays clean, but the room gets colder.",
                nextNodeId: "team-fallout",
                effects: fx(1, -3, -2, {
                  marcus: st(2, 3),
                  jake: st(-1, -1),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "contamination-triage": {
        title: "The car is clearly a sanitation problem now, not just a resale problem",
        body: "Tasha confirms the interior needs deep cleaning, the trunk is a biohazard scene, and the customer is trying to fold that condition into the return argument.",
        consultants: {
          tasha: {
            prompt: "Tasha wants the dealership to treat the condition honestly and stop pretending appearance fixes this.",
            options: [
              {
                id: "rr-triage-tasha-doc",
                label: "Photograph and document the condition before negotiating anything.",
                outcome: "You anchor the next conversation in reality.",
                nextNodeId: "customer-settlement",
                effects: fx(-1, 2, 4, {
                  tasha: st(3, 4),
                  marcus: st(1, 1)
                })
              },
              {
                id: "rr-triage-tasha-blame",
                label: "Have Tasha confront the customer about how the car ended up in this state.",
                outcome: "The truth may be satisfying, but the tone gets harsher fast.",
                nextNodeId: "team-fallout",
                effects: fx(0, -3, -3, {
                  tasha: st(1, 1),
                  elena: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants to stop the gross-out factor from turning into a public story people repeat all week.",
            options: [
              {
                id: "rr-triage-elena-private",
                label: "Move the customer into a private office and keep the scene away from the showroom.",
                outcome: "The dealership looks calmer and more controlled.",
                nextNodeId: "customer-settlement",
                effects: fx(0, 3, 3, {
                  elena: st(3, 4),
                  jake: st(1, 1)
                })
              },
              {
                id: "rr-triage-elena-spin",
                label: "Treat the condition like a weird one-off and focus on smoothing optics instead of facts.",
                outcome: "The store may look composed for a moment, but trust gets thinner underneath it.",
                nextNodeId: "team-fallout",
                effects: fx(1, -1, -3, {
                  elena: st(-1, -2),
                  tasha: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "showroom-containment": {
        title: "The customer is loud, the showroom is watching, and every word now shapes the dealership's tone",
        body: "Even before the final decision, the dealership has to decide whether it wants to look compassionate, slippery, or combative in front of everyone else.",
        consultants: {
          jake: {
            prompt: "Jake wants to get the customer out of the showroom with a quieter conversation and a path forward.",
            options: [
              {
                id: "rr-show-jake-private",
                label: "Move the customer into a quieter negotiation and work toward an exchange or trade assist.",
                outcome: "The volume drops and the store regains enough dignity to think clearly.",
                nextNodeId: "customer-settlement",
                effects: fx(2, 2, 2, {
                  jake: st(2, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "rr-show-jake-promise",
                label: "Let Jake keep making save promises before policy and service are aligned.",
                outcome: "The customer may stay engaged, but the dealership risks stacking promises on promises.",
                nextNodeId: "team-fallout",
                effects: fx(2, 0, -3, {
                  jake: st(3, 2),
                  marcus: st(-2, -2),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the room to feel professionally handled even if the final answer is still 'no.'",
            options: [
              {
                id: "rr-show-elena-empathy",
                label: "Lead with empathy and privacy before discussing what the dealership can actually do.",
                outcome: "The customer feels less like a combatant and more like someone being managed carefully.",
                nextNodeId: "customer-settlement",
                effects: fx(0, 4, 4, {
                  elena: st(4, 4),
                  nina: st(1, 1)
                })
              },
              {
                id: "rr-show-elena-minimize",
                label: "Keep the conversation short and transactional so it does not become bigger drama.",
                outcome: "The dealership looks brisk, though not especially caring.",
                nextNodeId: "team-fallout",
                effects: fx(1, -1, -2, {
                  elena: st(-1, -1),
                  jake: st(1, 0)
                })
              }
            ]
          }
        }
      },
      "customer-settlement": {
        title: "Now the dealership has to choose what kind of business pain it can live with",
        body: "The facts are clear enough. What remains is deciding how much goodwill, exchange help, or hard policy the store can stand behind.",
        consultants: {
          marcus: {
            prompt: "Marcus wants any resolution documented cleanly so goodwill does not quietly become policy.",
            options: [
              {
                id: "rr-settle-marcus-trade",
                label: "Offer a documented trade assist or exchange support instead of a full unwind.",
                outcome: "The dealership absorbs a manageable hit and keeps the solution anchored in business reality.",
                nextNodeId: null,
                effects: fx(-2, 3, 4, {
                  marcus: st(2, 3),
                  jake: st(1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "rr-settle-marcus-deny",
                label: "Deny the return but clearly document the condition, cleanup, and actual message trail.",
                outcome: "The store protects itself, though the customer leaves far from happy.",
                nextNodeId: null,
                effects: fx(1, -2, 1, {
                  marcus: st(3, 4),
                  elena: st(-1, -1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake wants a visible save so the showroom remembers the recovery instead of the smell.",
            options: [
              {
                id: "rr-settle-jake-upgrade",
                label: "Turn the whole mess into a guided move into a cleaner replacement vehicle.",
                outcome: "It costs the dealership something, but transforms the moment into a salvageable sale.",
                nextNodeId: null,
                effects: fx(2, 4, 2, {
                  jake: st(3, 3),
                  nina: st(0, 1)
                })
              },
              {
                id: "rr-settle-jake-firm",
                label: "Hold the line on a limited solution and refuse to let the customer bully the store.",
                outcome: "The store keeps its spine, though the customer experience ends on a hard note.",
                nextNodeId: null,
                effects: fx(1, -1, -1, {
                  jake: st(2, 1),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "team-fallout": {
        title: "Even if the customer leaves, the staff now wants to know whether leadership values clarity or scapegoats",
        body: "The return fight has turned inward. Nina feels exposed, service feels used, and the team is reading how you handle blame just as closely as how you handled the customer.",
        consultants: {
          nina: {
            prompt: "Nina wants to know whether sloppy wording becomes a lesson or a scarlet letter here.",
            options: [
              {
                id: "rr-fallout-nina-coach",
                label: "Coach Nina privately and tighten online message rules without making her the store villain.",
                outcome: "The lesson lands without poisoning trust.",
                nextNodeId: null,
                effects: fx(0, 1, 4, {
                  nina: st(2, 4),
                  elena: st(1, 1)
                })
              },
              {
                id: "rr-fallout-nina-public",
                label: "Make Nina own the confusion publicly so everyone sees the standard.",
                outcome: "The line is clear, but so is the humiliation.",
                nextNodeId: null,
                effects: fx(0, -1, 1, {
                  nina: st(-5, -5),
                  jake: st(1, 0)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha thinks the bigger issue is departments throwing each other forward without facts.",
            options: [
              {
                id: "rr-fallout-tasha-process",
                label: "Reset how online, service, and sales coordinate before promises hit customers.",
                outcome: "The team sees leadership fix the system instead of just assigning shame.",
                nextNodeId: null,
                effects: fx(0, 1, 5, {
                  tasha: st(3, 4),
                  nina: st(1, 2),
                  jake: st(0, 0)
                })
              },
              {
                id: "rr-fallout-tasha-shrug",
                label: "Treat it like one bizarre exception and move on before it consumes the week.",
                outcome: "The store regains speed, but everybody learns messy coordination is survivable here.",
                nextNodeId: null,
                effects: fx(1, 0, -2, {
                  tasha: st(-1, -1),
                  nina: st(-2, -2),
                  marcus: st(-1, -1)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "minivan-bet-meltdown",
    category: "Bet Meltdown",
    pressure: "Medium",
    headline: "Jake dumped a Monster on Marcus's desk over a stupid minivan bet",
    body:
      "Jake bet Marcus he would sell 10 minivans this month. He sold 8 actual minivans and now wants two SUVs to count because they 'basically look like minivans.' Marcus refused to pay, so Jake dumped a Monster Energy drink across his desk and paperwork.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The bet is dumb, but the property damage, public disrespect, and department tension are very real.",
        consultants: {
          jake: {
            prompt: "Jake thinks Marcus is hiding behind technicalities and wants the whole store to know it.",
            options: [
              {
                id: "mb-open-jake-terms",
                label: "Hear Jake's version and ask exactly what the original bet terms were.",
                outcome: "You start with the actual dispute instead of just the bad behavior.",
                nextNodeId: "bet-review",
                effects: fx(0, 0, 2, {
                  jake: st(2, 3),
                  marcus: st(0, 0)
                })
              },
              {
                id: "mb-open-jake-conduct",
                label: "Tell Jake the desk drenching matters more right now than whether the SUVs count.",
                outcome: "The professionalism line becomes clear, but Jake feels instantly unheard.",
                nextNodeId: "damage-control",
                effects: fx(0, 0, 2, {
                  jake: st(-3, -2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "mb-open-jake-private",
                label: "Pull Jake away from the floor and make clear this will not become a public showroom fight.",
                outcome: "You reduce the spectacle fast, though Jake still wants validation.",
                nextNodeId: "floor-gossip",
                effects: fx(0, 0, 1, {
                  jake: st(-1, 1),
                  elena: st(1, 1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus thinks the bet was obviously about literal minivans and now his desk is ruined because Jake cannot lose gracefully.",
            options: [
              {
                id: "mb-open-marcus-files",
                label: "Review what was damaged on Marcus's desk before weighing the bet itself.",
                outcome: "You treat the stunt like a business problem instead of a silly prank.",
                nextNodeId: "damage-control",
                effects: fx(-1, 0, 3, {
                  marcus: st(2, 4),
                  jake: st(-1, -1)
                })
              },
              {
                id: "mb-open-marcus-terms",
                label: "Have Marcus walk you through what the bet actually was and why he refused to pay.",
                outcome: "You start separating the childish bet from the real question of fairness.",
                nextNodeId: "bet-review",
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  jake: st(-1, -1)
                })
              },
              {
                id: "mb-open-marcus-back",
                label: "Back Marcus immediately and tell him the bet is over because Jake crossed a line.",
                outcome: "You sound decisive, but the sales floor now sees an answer before a hearing.",
                nextNodeId: "floor-gossip",
                effects: fx(0, 0, -1, {
                  marcus: st(2, 2),
                  jake: st(-5, -5)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the real danger is sales and accounting turning one dumb wager into a department war.",
            options: [
              {
                id: "mb-open-nina-rumor",
                label: "Ask Nina how fast the argument is spreading across the store.",
                outcome: "You start managing the social blast radius instead of only the liquid on the desk.",
                nextNodeId: "floor-gossip",
                effects: fx(0, 0, 2, {
                  nina: st(2, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "mb-open-nina-credit",
                label: "Ask Nina whether the two SUVs were ever pitched internally as part of Jake's minivan push.",
                outcome: "The fairness question gets more nuanced than a simple outburst story.",
                nextNodeId: "bet-review",
                effects: fx(0, 0, 1, {
                  nina: st(1, 2),
                  jake: st(0, 0)
                })
              },
              {
                id: "mb-open-nina-stayout",
                label: "Keep Nina out because this should stay between sales and accounting.",
                outcome: "You keep the circle small, but lose one of the few people reading the wider room.",
                nextNodeId: "damage-control",
                effects: fx(0, 0, -1, {
                  nina: st(-2, -2),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena sees culture damage first. The desk drenching is becoming lunch-break entertainment.",
            options: [
              {
                id: "mb-open-elena-culture",
                label: "Ask Elena how ugly the vibe already feels to the rest of the staff.",
                outcome: "You start with the culture consequences instead of pretending this is only between two people.",
                nextNodeId: "floor-gossip",
                effects: fx(0, 0, 2, {
                  elena: st(2, 3),
                  jake: st(0, 0)
                })
              },
              {
                id: "mb-open-elena-calm",
                label: "Use Elena to cool the room while you sort the facts privately.",
                outcome: "The atmosphere steadies, which makes a fair decision easier to land.",
                nextNodeId: "bet-review",
                effects: fx(0, 0, 3, {
                  elena: st(3, 3),
                  marcus: st(1, 1)
                })
              },
              {
                id: "mb-open-elena-ignore",
                label: "Tell Elena this is not a culture issue, just two coworkers acting immature.",
                outcome: "The language sounds tidy, but the staff already knows it feels bigger than that.",
                nextNodeId: "damage-control",
                effects: fx(0, 0, -2, {
                  elena: st(-2, -2),
                  nina: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "bet-review": {
        title: "The bet terms were sloppy enough to invite an argument, but not sloppy enough to justify a desk shower",
        body: "Jake and Marcus never wrote the bet down. Most staff assumed it meant literal minivans, but Jake spent the month bragging that he was moving 'family boxes,' which included two large SUVs in his own head.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the ruling to separate the childish bet from the desk damage and still show that words matter.",
            options: [
              {
                id: "mb-review-marcus-split",
                label: "Rule that Jake lost the bet, but admit the terms were vague enough for a smaller compromise.",
                outcome: "The decision feels measured rather than purely punitive.",
                nextNodeId: "payout-ruling",
                effects: fx(0, 1, 3, {
                  marcus: st(1, 2),
                  jake: st(-1, 1)
                })
              },
              {
                id: "mb-review-marcus-hardline",
                label: "Rule flatly for Marcus and make clear the SUVs never counted.",
                outcome: "The logic is clean, even if the floor reads it as cold.",
                nextNodeId: "discipline-ruling",
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  jake: st(-4, -4)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the fairest answer is the one that reduces future department score-settling, not just this week's yelling.",
            options: [
              {
                id: "mb-review-nina-mediate",
                label: "Treat the bet like a mediation issue, settle the money question, and forbid side wagers across departments.",
                outcome: "The store learns something useful from a very dumb conflict.",
                nextNodeId: "payout-ruling",
                effects: fx(0, 1, 4, {
                  nina: st(2, 3),
                  marcus: st(1, 1),
                  jake: st(0, 1)
                })
              },
              {
                id: "mb-review-nina-dismiss",
                label: "Call the bet meaningless and focus entirely on the conduct issue instead.",
                outcome: "You avoid validating the wager, but Jake feels like the fairness question got buried.",
                nextNodeId: "discipline-ruling",
                effects: fx(0, 0, 1, {
                  nina: st(1, 2),
                  jake: st(-3, -3)
                })
              }
            ]
          }
        }
      },
      "damage-control": {
        title: "The desk, paperwork, and office mood all need repair now",
        body: "Monster is in Marcus's papers, on a keyboard, and all over the office. What looked like a joke has become actual disruption and cost.",
        consultants: {
          marcus: {
            prompt: "Marcus wants repayment, documentation, and a clear signal that accounting is not open season.",
            options: [
              {
                id: "mb-damage-marcus-repay",
                label: "Have Jake repay damaged materials and help reconstruct what was ruined.",
                outcome: "The consequence feels tangible and connected to the act itself.",
                nextNodeId: "discipline-ruling",
                effects: fx(-1, 0, 4, {
                  marcus: st(2, 4),
                  jake: st(-2, -1)
                })
              },
              {
                id: "mb-damage-marcus-clean",
                label: "Make the focus immediate cleanup and restoration before the discipline conversation.",
                outcome: "The dealership gets functional again fast, though the emotional score remains unsettled.",
                nextNodeId: "payout-ruling",
                effects: fx(-1, 0, 2, {
                  marcus: st(1, 2),
                  jake: st(-1, 0)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the office chaos matters because the whole store is reading this like permission for theatrical revenge.",
            options: [
              {
                id: "mb-damage-elena-reset",
                label: "Clean the scene, then address the whole store on respect between departments.",
                outcome: "The desk gets fixed and the culture gets a line drawn under it.",
                nextNodeId: "discipline-ruling",
                effects: fx(-1, 0, 4, {
                  elena: st(3, 4),
                  marcus: st(1, 1),
                  jake: st(-1, -1)
                })
              },
              {
                id: "mb-damage-elena-private",
                label: "Keep the reset private so the dealership does not look even more ridiculous in public.",
                outcome: "The shame stays smaller, but so does the lesson for everyone else.",
                nextNodeId: "payout-ruling",
                effects: fx(-1, 0, 1, {
                  elena: st(1, 2),
                  jake: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "floor-gossip": {
        title: "The staff are already taking sides and turning the bet into dealership mythology",
        body: "Sales thinks Marcus is humorless, accounting thinks Jake is a man-child, and the rest of the store is enjoying the spectacle far too much.",
        consultants: {
          nina: {
            prompt: "Nina thinks the gossip is about to do more damage than the original bet ever could.",
            options: [
              {
                id: "mb-gossip-nina-team",
                label: "Address the staff briefly and shut down the side-taking before it hardens.",
                outcome: "You cut off the audience effect that is keeping this alive.",
                nextNodeId: "discipline-ruling",
                effects: fx(0, 0, 4, {
                  nina: st(2, 3),
                  elena: st(1, 1),
                  jake: st(-1, 0)
                })
              },
              {
                id: "mb-gossip-nina-ignore",
                label: "Ignore the gossip and trust the ruling to calm everyone later.",
                outcome: "Maybe that works. Maybe the departments just keep narrating the story themselves.",
                nextNodeId: "payout-ruling",
                effects: fx(0, 0, -2, {
                  nina: st(-1, -1),
                  marcus: st(-1, -1),
                  jake: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the room to stop treating public humiliation as fun office content.",
            options: [
              {
                id: "mb-gossip-elena-private",
                label: "Meet privately with Jake and Marcus first, then reset the tone with the broader team.",
                outcome: "You keep some dignity intact while still addressing the bigger cultural ripple.",
                nextNodeId: "discipline-ruling",
                effects: fx(0, 0, 3, {
                  elena: st(3, 4),
                  marcus: st(1, 2),
                  jake: st(0, 1)
                })
              },
              {
                id: "mb-gossip-elena-laughoff",
                label: "Let the store laugh it off as long as nobody escalates again.",
                outcome: "The moment stays light, and the professionalism standard gets lighter with it.",
                nextNodeId: "payout-ruling",
                effects: fx(0, 0, -3, {
                  elena: st(-2, -2),
                  marcus: st(-2, -2),
                  jake: st(1, 0)
                })
              }
            ]
          }
        }
      },
      "payout-ruling": {
        title: "You still need a final answer on the bet itself",
        body: "Even after the cleanup, both Jake and Marcus are waiting to see whether leadership thinks the SUVs count, the compromise counts, or only the lesson counts.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the ruling to preserve logic and not reward theatrical pressure.",
            options: [
              {
                id: "mb-payout-marcus-split",
                label: "Rule that the SUVs do not count, but pay a symbolic split to close the argument cleanly.",
                outcome: "The dealership gets closure without pretending the logic changed.",
                nextNodeId: null,
                effects: fx(-1, 0, 3, {
                  marcus: st(1, 2),
                  jake: st(0, 1)
                })
              },
              {
                id: "mb-payout-marcus-zero",
                label: "Rule for Marcus completely and make the bet loss part of Jake's lesson.",
                outcome: "The principle is crisp, though Jake leaves feeling publicly defeated.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  jake: st(-3, -3)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake wants to walk away feeling like the dealership did not let accounting hide behind smug technicality.",
            options: [
              {
                id: "mb-payout-jake-compromise",
                label: "Give Jake partial credit for the SUVs as a one-time compromise and outlaw future side bets.",
                outcome: "He does not win cleanly, but he also does not leave feeling humiliated.",
                nextNodeId: null,
                effects: fx(-1, 1, 2, {
                  jake: st(2, 2),
                  marcus: st(-1, 0)
                })
              },
              {
                id: "mb-payout-jake-nocredit",
                label: "Tell Jake the bet was about literal minivans and that is the end of it.",
                outcome: "The dealership sounds consistent, though not especially warm.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  jake: st(-2, -2),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "discipline-ruling": {
        title: "The money question matters, but the desk shower still needs a real consequence",
        body: "Everyone now knows Jake crossed a line. What they are waiting to see is whether leadership believes that means a real consequence or just an awkward lecture.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the discipline to show that accounting does not exist to be mocked or physically trashed.",
            options: [
              {
                id: "mb-discipline-marcus-writeup",
                label: "Issue a formal write-up tied to property damage and conduct across departments.",
                outcome: "The consequence is clear, documented, and hard to laugh off.",
                nextNodeId: null,
                effects: fx(0, 0, 4, {
                  marcus: st(3, 4),
                  jake: st(-4, -4)
                })
              },
              {
                id: "mb-discipline-marcus-repair",
                label: "Use repayment, cleanup, and a direct apology instead of a formal write-up this time.",
                outcome: "The punishment feels concrete and restorative without locking into a larger HR moment.",
                nextNodeId: null,
                effects: fx(-1, 0, 3, {
                  marcus: st(2, 3),
                  jake: st(-2, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the discipline to calm the culture, not just satisfy one department for a day.",
            options: [
              {
                id: "mb-discipline-elena-mediate",
                label: "Pair the consequence with a mediated reset between sales and accounting.",
                outcome: "The store gets accountability and a path back to functioning respect.",
                nextNodeId: null,
                effects: fx(-1, 1, 5, {
                  elena: st(3, 4),
                  marcus: st(1, 2),
                  jake: st(-1, 1)
                })
              },
              {
                id: "mb-discipline-elena-warning",
                label: "Give a hard warning and move on before the incident consumes the whole week.",
                outcome: "The dealership regains speed, though some staff will wonder whether the line was really that firm.",
                nextNodeId: null,
                effects: fx(0, 0, 1, {
                  elena: st(1, 1),
                  jake: st(-1, 0),
                  marcus: st(0, 0)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "ex-husband-drama",
    category: "Relationship Fallout",
    pressure: "Medium",
    headline: "Tasha is dating Elena's ex-husband and the dealership is starting to feel radioactive",
    body:
      "Tasha recently started dating a new man, and Elena has now discovered it is her ex-husband. The tension between them is stiff and obvious, while Jake is treating the whole thing like premium dealership comedy content.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is private life spilling hard into public work, and the dealership is already feeling the temperature change.",
        consultants: {
          elena: {
            prompt: "Elena is trying to stay composed, but she feels blindsided and humiliated by how close the whole thing is to home.",
            options: [
              {
                id: "eh-open-elena-hear",
                label: "Hear Elena out privately before deciding how big the intervention needs to be.",
                outcome: "Elena feels respected, which lowers the odds that the hurt turns into open retaliation.",
                nextNodeId: "boundary-setting",
                effects: fx(0, 0, 2, {
                  elena: st(2, 4),
                  tasha: st(0, 0)
                })
              },
              {
                id: "eh-open-elena-separate",
                label: "Tell Elena you are sorry, but this is private life and she has to keep it separate from work.",
                outcome: "The principle is fair, though Elena hears it as being told to swallow something huge instantly.",
                nextNodeId: "workflow-freeze",
                effects: fx(0, 0, 1, {
                  elena: st(-3, -2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "eh-open-elena-document",
                label: "Treat Elena's concern like the start of a real workplace disruption and document it.",
                outcome: "The dealership takes the tension seriously without pretending it is already a legal case.",
                nextNodeId: "boundary-setting",
                effects: fx(0, 0, 3, {
                  elena: st(1, 3),
                  marcus: st(1, 2)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha is defensive and says she is not doing anything wrong just because the relationship is awkward for Elena.",
            options: [
              {
                id: "eh-open-tasha-hear",
                label: "Hear Tasha's side before deciding whether this is mainly emotion, gossip, or workflow damage.",
                outcome: "Tasha feels less ambushed, which makes professionalism easier to demand later.",
                nextNodeId: "boundary-setting",
                effects: fx(0, 0, 2, {
                  tasha: st(2, 3),
                  elena: st(0, 0)
                })
              },
              {
                id: "eh-open-tasha-boundary",
                label: "Tell Tasha immediately that whatever she does personally cannot create drama at work.",
                outcome: "The line is clear, though Tasha feels judged before she feels heard.",
                nextNodeId: "workflow-freeze",
                effects: fx(0, 0, 1, {
                  tasha: st(-2, -1),
                  elena: st(1, 1)
                })
              },
              {
                id: "eh-open-tasha-ignore",
                label: "Minimize the issue and say the dealership will not manage anyone's dating life.",
                outcome: "You avoid overreaching, but you also leave the room to figure out its own messy rules.",
                nextNodeId: "gossip-spread",
                effects: fx(0, 0, -2, {
                  tasha: st(1, 0),
                  elena: st(-2, -2),
                  jake: st(1, 0)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the whole dealership is too tense and that a few jokes are helping everyone cope.",
            options: [
              {
                id: "eh-open-jake-stop",
                label: "Tell Jake to stop making jokes immediately because he is feeding the fire.",
                outcome: "The audience effect drops, which gives the actual conflict less oxygen.",
                nextNodeId: "gossip-spread",
                effects: fx(0, 0, 3, {
                  jake: st(-2, -1),
                  elena: st(1, 1),
                  tasha: st(1, 1)
                })
              },
              {
                id: "eh-open-jake-heard",
                label: "Ask Jake how much of this has already become open-floor gossip.",
                outcome: "You get a clearer sense of how private this still is, if at all.",
                nextNodeId: "gossip-spread",
                effects: fx(0, 0, 1, {
                  jake: st(1, 2),
                  elena: st(0, 0)
                })
              },
              {
                id: "eh-open-jake-letjoke",
                label: "Let Jake keep the jokes light as long as they do not become cruel.",
                outcome: "You hope humor diffuses things, but it mostly teaches the room that leadership is comfortable with cheap commentary.",
                nextNodeId: "workflow-freeze",
                effects: fx(0, 0, -3, {
                  jake: st(1, 0),
                  elena: st(-3, -3),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus does not care who dates whom, but he absolutely cares if departments stop functioning because of it.",
            options: [
              {
                id: "eh-open-marcus-impact",
                label: "Ask Marcus whether the tension is already affecting deadlines or handoffs.",
                outcome: "You measure the operational damage instead of assuming it.",
                nextNodeId: "workflow-freeze",
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  elena: st(0, 0),
                  tasha: st(0, 0)
                })
              },
              {
                id: "eh-open-marcus-neutral",
                label: "Use Marcus as a neutral observer while you gather both sides privately.",
                outcome: "The whole thing feels less like emotional chaos and more like leadership is actually managing it.",
                nextNodeId: "boundary-setting",
                effects: fx(0, 0, 3, {
                  marcus: st(2, 3),
                  elena: st(1, 1),
                  tasha: st(1, 1)
                })
              },
              {
                id: "eh-open-marcus-stayout",
                label: "Tell Marcus to stay out because this is personal, not operational.",
                outcome: "You protect privacy, though you may miss the moment it becomes a workflow issue.",
                nextNodeId: "gossip-spread",
                effects: fx(0, 0, -1, {
                  marcus: st(-1, -1),
                  jake: st(1, 0)
                })
              }
            ]
          }
        }
      },
      "boundary-setting": {
        title: "Both women are keeping it together, but only barely",
        body: "Elena is hurt, Tasha is defensive, and neither of them wants to be the one who looks unprofessional first.",
        consultants: {
          elena: {
            prompt: "Elena wants room to be honest about the discomfort without being painted as unstable or jealous.",
            options: [
              {
                id: "eh-boundary-elena-private",
                label: "Set private boundaries first, then bring them together for a work-only reset.",
                outcome: "You slow the pace down, but you give both a real chance to arrive calm enough for a useful conversation.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 1, 4, {
                  elena: st(2, 4),
                  tasha: st(1, 2)
                })
              },
              {
                id: "eh-boundary-elena-publicline",
                label: "Draw a strict professionalism line immediately and skip the emotional processing piece.",
                outcome: "The expectation is clear, though the resentment has nowhere graceful to go.",
                nextNodeId: "culture-reset",
                effects: fx(0, 0, 2, {
                  elena: st(-1, 0),
                  tasha: st(-1, 0),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants to know whether she is being judged for her dating choice or only for how she behaves at work.",
            options: [
              {
                id: "eh-boundary-tasha-behavior",
                label: "Make clear the dealership is not judging her relationship, only workplace behavior and respect.",
                outcome: "Tasha becomes less defensive because the line feels fair rather than moralizing.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 1, 4, {
                  tasha: st(2, 4),
                  elena: st(1, 1)
                })
              },
              {
                id: "eh-boundary-tasha-distance",
                label: "Temporarily reduce direct overlap between Tasha and Elena while emotions cool.",
                outcome: "The tension drops quickly, though the move also confirms the issue is shaping the workplace.",
                nextNodeId: "culture-reset",
                effects: fx(-1, 0, 2, {
                  tasha: st(1, 2),
                  elena: st(1, 2),
                  marcus: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "gossip-spread": {
        title: "Jake's jokes and hallway whispers are turning a painful situation into dealership entertainment",
        body: "The issue is no longer just between Elena and Tasha. Other staff are now treating it like serialized drama.",
        consultants: {
          jake: {
            prompt: "Jake swears the jokes are harmless, but the laughter keeps the whole issue hot.",
            options: [
              {
                id: "eh-gossip-jake-apology",
                label: "Make Jake apologize and stop turning the relationship into public content.",
                outcome: "The room loses its loudest amplifier, which helps everything else come down a notch.",
                nextNodeId: "culture-reset",
                effects: fx(0, 0, 4, {
                  jake: st(-2, 0),
                  elena: st(2, 3),
                  tasha: st(1, 1)
                })
              },
              {
                id: "eh-gossip-jake-private",
                label: "Correct Jake privately and trust the rest of the team to read the change in tone.",
                outcome: "The dealership gets a quieter reset, though some of the gossip machine remains intact.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 0, 2, {
                  jake: st(-1, 1),
                  elena: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants leadership to show that mockery is not the culture tax she has to pay for showing up hurt.",
            options: [
              {
                id: "eh-gossip-elena-teamline",
                label: "Address the whole team on gossip, dignity, and customer-facing professionalism.",
                outcome: "The standard becomes public, which is exactly what the rumor mill needed.",
                nextNodeId: "culture-reset",
                effects: fx(0, 0, 5, {
                  elena: st(2, 4),
                  jake: st(-1, -1),
                  tasha: st(1, 1)
                })
              },
              {
                id: "eh-gossip-elena-quiet",
                label: "Keep the response private so Elena does not feel even more exposed than she already does.",
                outcome: "Dignity is preserved, though the wider team learns less from it.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 0, 2, {
                  elena: st(2, 3),
                  jake: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "workflow-freeze": {
        title: "The emotional tension is now starting to break real work",
        body: "Marketing requests are slowing down, service communication is clipped, and what started as private pain is turning into operational drag.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the dealership to treat workflow failure as the non-negotiable line even if the relationship issue stays messy.",
            options: [
              {
                id: "eh-work-marcus-assign",
                label: "Reset responsibilities and communication rules so the work can keep moving.",
                outcome: "The dealership becomes more functional quickly, even if not especially warm.",
                nextNodeId: "culture-reset",
                effects: fx(1, 0, 4, {
                  marcus: st(2, 3),
                  elena: st(0, 1),
                  tasha: st(0, 1)
                })
              },
              {
                id: "eh-work-marcus-mediate",
                label: "Use the workflow issue as the reason to bring Elena and Tasha into a direct conversation now.",
                outcome: "The practical stakes give the mediation a purpose bigger than personal closure.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 0, 3, {
                  marcus: st(1, 2),
                  elena: st(1, 1),
                  tasha: st(1, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha does not want to be painted as the person who brought drama into the shop.",
            options: [
              {
                id: "eh-work-tasha-cooperate",
                label: "Make cooperation the standard now and promise the personal conversation gets its own space later.",
                outcome: "The work gets protected, even if the personal hurt stays unfinished.",
                nextNodeId: "culture-reset",
                effects: fx(1, 0, 2, {
                  tasha: st(0, 1),
                  elena: st(0, 1)
                })
              },
              {
                id: "eh-work-tasha-talknow",
                label: "Let Tasha air the tension directly with Elena now before it keeps poisoning tasks.",
                outcome: "The risk is higher, but so is the chance of finally breaking the freeze honestly.",
                nextNodeId: "direct-mediation",
                effects: fx(0, 0, 2, {
                  tasha: st(1, 2),
                  elena: st(0, 1)
                })
              }
            ]
          }
        }
      },
      "direct-mediation": {
        title: "The core tension has to be faced directly now",
        body: "You have enough information to stop pretending this will fix itself. The next move determines whether the dealership remembers this as a rough reset or the beginning of lasting bitterness.",
        consultants: {
          elena: {
            prompt: "Elena wants to be able to say what hurt without being forced to bless the relationship itself.",
            options: [
              {
                id: "eh-mediate-elena-boundaries",
                label: "Run a direct meeting focused only on respect, boundaries, and work behavior going forward.",
                outcome: "The conversation stays uncomfortable but useful, which is exactly what the dealership needed.",
                nextNodeId: null,
                effects: fx(0, 1, 5, {
                  elena: st(2, 4),
                  tasha: st(1, 3),
                  marcus: st(1, 1)
                })
              },
              {
                id: "eh-mediate-elena-feelings",
                label: "Give Elena more room to process than the room can really sustain as a business conversation.",
                outcome: "She feels heard, but the meeting drifts away from what the dealership can actually govern.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  elena: st(3, 3),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants the final message to be that she can work here professionally without apologizing for her private life.",
            options: [
              {
                id: "eh-mediate-tasha-workline",
                label: "Center the resolution on future behavior, communication, and no more public jokes from anyone.",
                outcome: "The dealership gets a practical peace instead of a forced emotional miracle.",
                nextNodeId: null,
                effects: fx(1, 1, 4, {
                  tasha: st(2, 3),
                  elena: st(1, 2),
                  jake: st(-1, -1)
                })
              },
              {
                id: "eh-mediate-tasha-distance",
                label: "Pair the conversation with temporary distance in how Elena and Tasha work together.",
                outcome: "The peace comes with structural support, which lowers the chance of a quick relapse.",
                nextNodeId: null,
                effects: fx(0, 0, 3, {
                  tasha: st(1, 2),
                  elena: st(1, 2),
                  marcus: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "culture-reset": {
        title: "The dealership now needs a broader answer about gossip, dignity, and emotional spillover",
        body: "Even if Elena and Tasha stabilize, the whole store has learned something about how publicly playable personal pain can become here.",
        consultants: {
          jake: {
            prompt: "Jake is the obvious culture accelerant here, whether he means to be or not.",
            options: [
              {
                id: "eh-culture-jake-stop",
                label: "Set a clear no-jokes line around coworkers' personal pain and enforce it.",
                outcome: "The rule feels overdue, and the room immediately becomes less cheap.",
                nextNodeId: null,
                effects: fx(0, 0, 5, {
                  jake: st(-2, -2),
                  elena: st(2, 3),
                  tasha: st(1, 1)
                })
              },
              {
                id: "eh-culture-jake-soft",
                label: "Give Jake a softer warning and hope the room takes the hint.",
                outcome: "The tone improves some, though the lesson stays blurrier than ideal.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  jake: st(-1, 0),
                  elena: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the outcome to make the dealership feel safe again, not just controlled.",
            options: [
              {
                id: "eh-culture-elena-reset",
                label: "Reset the team's expectations around gossip, respect, and private pain becoming public sport.",
                outcome: "The dealership feels more adult and much less like a rumor machine.",
                nextNodeId: null,
                effects: fx(0, 1, 5, {
                  elena: st(3, 4),
                  tasha: st(1, 2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "eh-culture-elena-minimal",
                label: "Keep the reset narrow so the situation can fade without becoming a whole staff seminar.",
                outcome: "The week moves faster, though the culture lesson lands more softly than it could have.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  elena: st(1, 2),
                  jake: st(0, 0),
                  tasha: st(0, 1)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "tiktok-sunroof",
    category: "TikTok Sunroof Disaster",
    pressure: "High",
    headline: "Tasha fell through a customer's sunroof while filming one of Nina's dealership TikToks",
    body:
      "Nina has been using TikToks to promote the dealership and asking employees to join viral dances. Tasha climbed onto a customer's vehicle during one of them, slipped, went through the sunroof, and now expects the company to cover her medical bills.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is now an injury question, a damaged-customer-property question, and a judgment question all at once.",
        consultants: {
          tasha: {
            prompt: "Tasha is hurt, embarrassed, and insists she was helping the dealership's marketing push when she fell.",
            options: [
              {
                id: "ts-open-tasha-care",
                label: "Start with Tasha's condition and get her immediate care before the blame talk.",
                outcome: "The dealership looks humane first, which matters in a mess like this.",
                nextNodeId: "injury-triage",
                effects: fx(-1, 1, 2, {
                  tasha: st(2, 4),
                  nina: st(0, 0)
                })
              },
              {
                id: "ts-open-tasha-why",
                label: "Ask Tasha why she thought standing on a customer's car for a dance was acceptable.",
                outcome: "The accountability question lands immediately, though Tasha feels interrogated while injured.",
                nextNodeId: "liability-review",
                effects: fx(0, -1, 0, {
                  tasha: st(-3, -2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "ts-open-tasha-workers",
                label: "Tell Tasha you need to determine whether this counts as work activity before promising anything.",
                outcome: "The company angle becomes central fast, which Tasha does not love but Marcus absolutely does.",
                nextNodeId: "injury-triage",
                effects: fx(0, 0, 1, {
                  tasha: st(-1, 0),
                  marcus: st(2, 2)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina says the TikToks were helping traffic and insists nobody told Tasha to stand on a customer's actual car.",
            options: [
              {
                id: "ts-open-nina-process",
                label: "Have Nina walk you through exactly what was planned, approved, and filmed.",
                outcome: "You start separating actual direction from chaotic improvisation.",
                nextNodeId: "liability-review",
                effects: fx(0, 0, 3, {
                  nina: st(1, 3),
                  marcus: st(1, 1)
                })
              },
              {
                id: "ts-open-nina-video",
                label: "Find out whether the video exists and whether it has already been posted anywhere.",
                outcome: "You start controlling the public-risk side before it controls you.",
                nextNodeId: "viral-fallout",
                effects: fx(0, 0, 2, {
                  nina: st(1, 2),
                  elena: st(1, 1)
                })
              },
              {
                id: "ts-open-nina-scold",
                label: "Scold Nina first for turning the dealership into a content circus.",
                outcome: "The seriousness is obvious, but the immediate injury and customer-damage questions remain unsorted.",
                nextNodeId: "liability-review",
                effects: fx(0, -1, -1, {
                  nina: st(-4, -4),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus sees damaged customer property, possible medical expense, and a huge question about whether this was sanctioned work at all.",
            options: [
              {
                id: "ts-open-marcus-doc",
                label: "Have Marcus document the damage and incident immediately before stories drift.",
                outcome: "The dealership gets a clear record while everyone still remembers what happened.",
                nextNodeId: "liability-review",
                effects: fx(-1, 0, 3, {
                  marcus: st(3, 4),
                  nina: st(0, 0)
                })
              },
              {
                id: "ts-open-marcus-customer",
                label: "Ask Marcus what the dealership can reasonably offer the customer whose car was damaged.",
                outcome: "You start from the external relationship instead of the internal argument.",
                nextNodeId: "viral-fallout",
                effects: fx(-1, 1, 2, {
                  marcus: st(2, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "ts-open-marcus-hold",
                label: "Tell Marcus to hold the paperwork for a moment while you check on Tasha personally.",
                outcome: "The room feels more human, though the record is now a step behind the chaos.",
                nextNodeId: "injury-triage",
                effects: fx(0, 1, 0, {
                  marcus: st(-1, -1),
                  tasha: st(1, 2)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena understands exactly how fast a falling-through-the-sunroof TikTok could become the dealership's identity for a week.",
            options: [
              {
                id: "ts-open-elena-brand",
                label: "Ask Elena to think about containment before the story becomes public content.",
                outcome: "You treat the reputational blast radius like a real part of the event, which it is.",
                nextNodeId: "viral-fallout",
                effects: fx(0, 0, 3, {
                  elena: st(3, 4),
                  nina: st(1, 1)
                })
              },
              {
                id: "ts-open-elena-customer",
                label: "Use Elena to help frame the apology to the customer whose car was damaged.",
                outcome: "The store sounds much less chaotic than the actual event was.",
                nextNodeId: "injury-triage",
                effects: fx(-1, 2, 3, {
                  elena: st(2, 3),
                  tasha: st(0, 0)
                })
              },
              {
                id: "ts-open-elena-stayout",
                label: "Keep Elena out because this is operations and liability, not marketing image.",
                outcome: "You keep the circle tight, though the public-risk side keeps moving without guidance.",
                nextNodeId: "liability-review",
                effects: fx(0, 0, -2, {
                  elena: st(-2, -2),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "injury-triage": {
        title: "Tasha is hurt, the customer is shocked, and nobody agrees yet on what the company owes",
        body: "Medical attention, damaged property, and responsibility are colliding before the dust has even settled.",
        consultants: {
          tasha: {
            prompt: "Tasha wants the dealership to acknowledge that she was helping a company promotion when she got hurt.",
            options: [
              {
                id: "ts-injury-tasha-care",
                label: "Get Tasha proper medical care first and reserve the compensation decision until facts are cleaner.",
                outcome: "The dealership looks humane without rushing into a legal conclusion.",
                nextNodeId: "compensation-decision",
                effects: fx(-2, 2, 3, {
                  tasha: st(3, 4),
                  marcus: st(0, 1)
                })
              },
              {
                id: "ts-injury-tasha-skeptical",
                label: "Stay skeptical about company responsibility while still arranging basic care.",
                outcome: "The compassion is there, but so is the warning that this may not be covered the way Tasha expects.",
                nextNodeId: "compensation-decision",
                effects: fx(-1, 0, 1, {
                  tasha: st(-1, -1),
                  marcus: st(1, 2)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants to show visible care so the customer and staff do not conclude the dealership is cold and reckless.",
            options: [
              {
                id: "ts-injury-elena-both",
                label: "Pair care for Tasha with a thoughtful apology and immediate support for the customer.",
                outcome: "The dealership looks responsible to both internal and external eyes.",
                nextNodeId: "compensation-decision",
                effects: fx(-2, 3, 4, {
                  elena: st(3, 4),
                  tasha: st(1, 1),
                  nina: st(0, 0)
                })
              },
              {
                id: "ts-injury-elena-minimal",
                label: "Keep the response practical and avoid sounding more guilty than necessary.",
                outcome: "The tone stays controlled, though not especially warm.",
                nextNodeId: "compensation-decision",
                effects: fx(-1, 0, 1, {
                  elena: st(0, 1),
                  tasha: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "liability-review": {
        title: "Nobody agrees on whether the fall was sanctioned work or reckless freelancing",
        body: "The core issue becomes whether Nina's content push created the conditions for the stunt or whether Tasha went far beyond any reasonable instruction.",
        consultants: {
          marcus: {
            prompt: "Marcus wants a clean line between approved marketing activity and obviously unsafe improvisation.",
            options: [
              {
                id: "ts-liability-marcus-line",
                label: "Define the stunt as outside approved work and separate that from basic care and customer repair.",
                outcome: "The company protects itself without pretending nobody got hurt.",
                nextNodeId: "content-policy",
                effects: fx(-1, 0, 3, {
                  marcus: st(3, 4),
                  tasha: st(-2, -2),
                  nina: st(-1, -1)
                })
              },
              {
                id: "ts-liability-marcus-shared",
                label: "Treat it as a leadership failure too and accept the dealership helped create the unsafe culture.",
                outcome: "The dealership absorbs more responsibility, but the conclusion feels honest.",
                nextNodeId: "compensation-decision",
                effects: fx(-2, 1, 4, {
                  marcus: st(1, 2),
                  tasha: st(2, 3),
                  nina: st(0, 1)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina wants to admit the content culture got loose without taking the full blame for Tasha climbing a customer's car.",
            options: [
              {
                id: "ts-liability-nina-own",
                label: "Have Nina own the loose culture and help build stricter content boundaries going forward.",
                outcome: "The accountability feels real without becoming total self-sacrifice.",
                nextNodeId: "content-policy",
                effects: fx(-1, 1, 4, {
                  nina: st(1, 3),
                  tasha: st(1, 1),
                  elena: st(1, 1)
                })
              },
              {
                id: "ts-liability-nina-distance",
                label: "Let Nina insist she never approved anything this reckless and move the burden onto Tasha.",
                outcome: "The line may protect Nina, but it also turns the recovery into a blame contest.",
                nextNodeId: "compensation-decision",
                effects: fx(0, -1, -1, {
                  nina: st(1, 1),
                  tasha: st(-3, -3),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "viral-fallout": {
        title: "The real danger may be the clip itself if it is already on a phone somewhere",
        body: "A ridiculous visual plus a damaged customer vehicle is exactly the kind of thing that can turn into a local meme before the dealership even finishes apologizing.",
        consultants: {
          elena: {
            prompt: "Elena wants the story contained before it becomes the week's defining dealership anecdote.",
            options: [
              {
                id: "ts-viral-elena-contain",
                label: "Pull the video, apologize to the customer, and tighten the message before anyone else does it for you.",
                outcome: "The dealership looks responsive rather than clueless.",
                nextNodeId: "content-policy",
                effects: fx(-1, 2, 5, {
                  elena: st(4, 4),
                  nina: st(0, 1)
                })
              },
              {
                id: "ts-viral-elena-spin",
                label: "Treat it like a weird viral near-miss and try to shape the story before it shapes you.",
                outcome: "If it lands, it softens the embarrassment. If it misses, it looks heartless.",
                nextNodeId: "content-policy",
                effects: fx(0, -1, -4, {
                  elena: st(-2, -2),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants a boring, controlled response because lawsuits and screenshots age forever.",
            options: [
              {
                id: "ts-viral-marcus-lockdown",
                label: "Treat the clip as evidence, lock the story down, and avoid cleverness entirely.",
                outcome: "The dealership looks sober and defensible, even if not especially charming.",
                nextNodeId: "compensation-decision",
                effects: fx(-1, 0, 3, {
                  marcus: st(3, 4),
                  elena: st(-1, -1)
                })
              },
              {
                id: "ts-viral-marcus-customerfirst",
                label: "Focus first on the customer and Tasha, then circle back to the digital mess once the people side is stable.",
                outcome: "The priorities feel right, though the clip risk stays live longer.",
                nextNodeId: "compensation-decision",
                effects: fx(-1, 2, 1, {
                  marcus: st(1, 2),
                  tasha: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "compensation-decision": {
        title: "The company now has to decide what support looks like without teaching the wrong lesson",
        body: "Tasha wants her medical bills covered, the customer wants their car made right, and everyone is watching to see how leadership defines responsibility.",
        consultants: {
          marcus: {
            prompt: "Marcus wants to split care, customer repair, and company responsibility into separate buckets.",
            options: [
              {
                id: "ts-comp-marcus-partial",
                label: "Cover immediate care and customer repair, then decide longer-term employee coverage after review.",
                outcome: "The dealership responds responsibly without making a rushed blanket promise.",
                nextNodeId: null,
                effects: fx(-3, 2, 4, {
                  marcus: st(2, 3),
                  tasha: st(1, 2),
                  nina: st(0, 0)
                })
              },
              {
                id: "ts-comp-marcus-deny",
                label: "Repair the customer's car but deny that the company owes Tasha more than basic immediate help.",
                outcome: "The line is financially clean, though it leaves Tasha feeling abandoned.",
                nextNodeId: null,
                effects: fx(-2, -1, 0, {
                  marcus: st(2, 3),
                  tasha: st(-4, -4)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants the final answer to acknowledge the dealership benefited from the stunt culture until it went bad.",
            options: [
              {
                id: "ts-comp-tasha-shared",
                label: "Acknowledge shared responsibility and support Tasha while clearly ending unsafe marketing participation.",
                outcome: "The resolution feels humane and honest, even if it costs more.",
                nextNodeId: null,
                effects: fx(-4, 2, 3, {
                  tasha: st(3, 4),
                  nina: st(0, 1),
                  elena: st(1, 1)
                })
              },
              {
                id: "ts-comp-tasha-reckless",
                label: "Call the stunt reckless enough that company support must stay limited despite the injury.",
                outcome: "The rule sounds tough and consistent, though morale pays for it.",
                nextNodeId: null,
                effects: fx(-2, -1, 1, {
                  tasha: st(-5, -5),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "content-policy": {
        title: "Even if the immediate mess settles, the dealership cannot keep making content this way",
        body: "The class-clown version of dealership marketing just smashed into property damage, injury, and customer trust.",
        consultants: {
          nina: {
            prompt: "Nina still believes short-form content can work, but not if safety is optional.",
            options: [
              {
                id: "ts-policy-nina-guardrails",
                label: "Keep the TikToks, but add approvals, location rules, and a strict no-customer-property line.",
                outcome: "The dealership keeps the energy while finally acting like an adult about it.",
                nextNodeId: null,
                effects: fx(1, 1, 5, {
                  nina: st(2, 4),
                  elena: st(1, 1),
                  marcus: st(1, 1)
                })
              },
              {
                id: "ts-policy-nina-stop",
                label: "Shut the TikTok program down entirely until the dealership proves it can handle content responsibly.",
                outcome: "The risk drops hard, though so does the creative momentum Nina had built.",
                nextNodeId: null,
                effects: fx(-1, 0, 3, {
                  nina: st(-4, -4),
                  marcus: st(2, 2)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the dealership to stay modern without confusing viral energy with permissionless chaos.",
            options: [
              {
                id: "ts-policy-elena-reset",
                label: "Reset the content strategy around safer, sharper brand storytelling instead of stunts.",
                outcome: "The dealership keeps its voice and loses the circus energy that created the crash.",
                nextNodeId: null,
                effects: fx(1, 1, 4, {
                  elena: st(3, 4),
                  nina: st(1, 2),
                  tasha: st(0, 0)
                })
              },
              {
                id: "ts-policy-elena-freeze",
                label: "Freeze all employee performance content until trust inside the building is rebuilt.",
                outcome: "The tone becomes safer immediately, though the team may feel newly overmanaged.",
                nextNodeId: null,
                effects: fx(0, 0, 3, {
                  elena: st(1, 2),
                  nina: st(-2, -2),
                  tasha: st(0, 0)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "sleep-detox-breakdown",
    category: "Sleep Detox Breakdown",
    pressure: "High",
    headline: "Marcus has not slept in 48 hours and his accounting mistakes are now costing the dealership money",
    body:
      "Marcus says staying awake for 48 hours is his new method to 'detox his mind.' Meanwhile, several accounting mistakes are starting to affect pay, paperwork, and dealership profitability.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is health, judgment, money, and leadership colliding in the office at once.",
        consultants: {
          marcus: {
            prompt: "Marcus insists he is actually more mentally clear than usual and thinks everyone is overreacting.",
            options: [
              {
                id: "sd-open-marcus-hear",
                label: "Hear Marcus out, but ask directly what work may have been affected.",
                outcome: "You keep the conversation humane while pulling it toward real consequences.",
                nextNodeId: "audit-scramble",
                effects: fx(0, 0, 2, {
                  marcus: st(1, 3),
                  jake: st(0, 0)
                })
              },
              {
                id: "sd-open-marcus-home",
                label: "Tell Marcus he is done for the day and cannot keep touching dealership money in this state.",
                outcome: "The line is immediate, though Marcus feels embarrassed and challenged.",
                nextNodeId: "health-intervention",
                effects: fx(-1, 0, 3, {
                  marcus: st(-3, -2),
                  nina: st(1, 1)
                })
              },
              {
                id: "sd-open-marcus-scan",
                label: "Keep Marcus present just long enough to identify what he may have touched before removing him.",
                outcome: "The dealership gets better forensic help, even if the decision feels less clean.",
                nextNodeId: "audit-scramble",
                effects: fx(0, 0, 2, {
                  marcus: st(-1, 1),
                  nina: st(0, 0)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake does not care about Marcus's wellness theory. He cares that bad numbers are already costing him and the floor money.",
            options: [
              {
                id: "sd-open-jake-impacts",
                label: "Ask Jake what errors are already hitting deals or commissions.",
                outcome: "You start from the business damage customers and staff can actually feel.",
                nextNodeId: "deal-fallout",
                effects: fx(0, 0, 1, {
                  jake: st(1, 2),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "sd-open-jake-calm",
                label: "Tell Jake to stay out of the office drama while you assess whether Marcus can still function.",
                outcome: "You keep the floor from becoming a second crisis source.",
                nextNodeId: "health-intervention",
                effects: fx(0, 0, 1, {
                  jake: st(-1, 0),
                  elena: st(1, 1)
                })
              },
              {
                id: "sd-open-jake-audit",
                label: "Use Jake's frustration as a prompt to audit every recent payout or deal Marcus touched.",
                outcome: "The review becomes broader, which improves fairness and raises pressure.",
                nextNodeId: "audit-scramble",
                effects: fx(-1, 0, 3, {
                  jake: st(1, 2),
                  marcus: st(-2, -2)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina worries that if Marcus is this impaired, CRM-to-accounting handoffs may also be compromised in ways nobody sees yet.",
            options: [
              {
                id: "sd-open-nina-cross",
                label: "Have Nina cross-check deals and handoffs against accounting records immediately.",
                outcome: "You start building a second source of truth fast.",
                nextNodeId: "audit-scramble",
                effects: fx(0, 0, 3, {
                  nina: st(2, 3),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "sd-open-nina-quiet",
                label: "Tell Nina to work quietly in the background while you handle Marcus directly.",
                outcome: "The investigation stays controlled, though slower and more isolated.",
                nextNodeId: "health-intervention",
                effects: fx(0, 0, 1, {
                  nina: st(1, 1),
                  marcus: st(0, 0)
                })
              },
              {
                id: "sd-open-nina-culture",
                label: "Ask Nina whether Marcus has been talking about this detox idea openly and whether anyone tried to stop it.",
                outcome: "You start treating the issue as a leadership culture problem too.",
                nextNodeId: "deal-fallout",
                effects: fx(0, 0, 2, {
                  nina: st(1, 2),
                  elena: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena can feel the dealership drifting toward panic because nobody knows whether Marcus is unwell, stubborn, or both.",
            options: [
              {
                id: "sd-open-elena-tone",
                label: "Use Elena to help keep the staff calm while you make a clear decision on Marcus.",
                outcome: "The atmosphere becomes less chaotic, which matters when the office is already unstable.",
                nextNodeId: "health-intervention",
                effects: fx(0, 0, 2, {
                  elena: st(2, 3),
                  jake: st(0, 0)
                })
              },
              {
                id: "sd-open-elena-visible",
                label: "Ask Elena how visible Marcus's condition has become to the rest of the store.",
                outcome: "You get a better read on whether this is still contained or already eroding trust broadly.",
                nextNodeId: "deal-fallout",
                effects: fx(0, 0, 2, {
                  elena: st(2, 2),
                  marcus: st(0, 0)
                })
              },
              {
                id: "sd-open-elena-stayout",
                label: "Keep Elena out of it because this is an office issue, not a culture issue.",
                outcome: "The scope stays narrow, though the room may still interpret the silence on its own.",
                nextNodeId: "audit-scramble",
                effects: fx(0, 0, -1, {
                  elena: st(-2, -2),
                  nina: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "audit-scramble": {
        title: "The deeper review shows mistakes across commissions, deal jackets, and lender paperwork",
        body: "This is not one typo. The lack of sleep is now showing up in multiple places where the dealership needs absolute precision.",
        consultants: {
          nina: {
            prompt: "Nina wants a structured cross-check so the store can know the size of the damage before customers discover it for you.",
            options: [
              {
                id: "sd-audit-nina-full",
                label: "Launch a full cross-check of recent deals before more bad numbers escape.",
                outcome: "The dealership slows down, but it stops bleeding blind.",
                nextNodeId: "control-plan",
                effects: fx(-2, 0, 5, {
                  nina: st(3, 4),
                  marcus: st(-1, -1),
                  jake: st(0, 1)
                })
              },
              {
                id: "sd-audit-nina-targeted",
                label: "Focus only on the deals most likely to be wrong so the office can keep moving.",
                outcome: "You regain some control without fully freezing the dealership.",
                nextNodeId: "trust-repair",
                effects: fx(-1, 0, 2, {
                  nina: st(2, 2),
                  marcus: st(0, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus still believes he can fix his own mess if you just give him a little more time and less humiliation.",
            options: [
              {
                id: "sd-audit-marcus-remove",
                label: "Remove Marcus from the work and let others audit without his hands on the controls.",
                outcome: "The dealership gets safer quickly, even if Marcus feels deeply embarrassed.",
                nextNodeId: "control-plan",
                effects: fx(-1, 0, 4, {
                  marcus: st(-4, -4),
                  nina: st(1, 1)
                })
              },
              {
                id: "sd-audit-marcus-assist",
                label: "Let Marcus assist the review under supervision so you can understand the damage faster.",
                outcome: "The store gets better context, but it still relies partly on the person who caused the mess.",
                nextNodeId: "trust-repair",
                effects: fx(0, 0, 1, {
                  marcus: st(-1, 1),
                  nina: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "health-intervention": {
        title: "The question becomes whether this is mainly a performance issue, a wellness issue, or both",
        body: "Marcus insists the no-sleep streak is intentional and useful, which means leadership now has to decide how hard to intervene for his sake and the dealership's sake.",
        consultants: {
          marcus: {
            prompt: "Marcus wants to be treated like a rational adult making an eccentric choice, not like a danger to himself and everyone else.",
            options: [
              {
                id: "sd-health-marcus-home",
                label: "Send Marcus home and make clear he cannot return to critical accounting work without rest.",
                outcome: "The boundary is compassionate and firm at the same time.",
                nextNodeId: "control-plan",
                effects: fx(-1, 0, 4, {
                  marcus: st(-2, 1),
                  elena: st(1, 1)
                })
              },
              {
                id: "sd-health-marcus-negotiate",
                label: "Negotiate a shorter removal and a monitored return so Marcus feels less punished.",
                outcome: "The re-entry feels gentler, though the message gets blurrier too.",
                nextNodeId: "trust-repair",
                effects: fx(0, 0, 1, {
                  marcus: st(0, 1),
                  jake: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the office to understand leadership can care about Marcus and still refuse to let impaired judgment stay in control.",
            options: [
              {
                id: "sd-health-elena-tone",
                label: "Frame the intervention as care plus responsibility, not punishment plus embarrassment.",
                outcome: "The store sees a manager protecting both a person and a business.",
                nextNodeId: "control-plan",
                effects: fx(0, 1, 4, {
                  elena: st(3, 4),
                  marcus: st(1, 2),
                  nina: st(1, 1)
                })
              },
              {
                id: "sd-health-elena-private",
                label: "Keep the tone private and narrow so the whole store does not turn Marcus into a spectacle.",
                outcome: "The dignity stays intact, though the broader trust lesson lands more quietly.",
                nextNodeId: "trust-repair",
                effects: fx(0, 0, 2, {
                  elena: st(2, 3),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "deal-fallout": {
        title: "The dealership can already feel the cost in live business",
        body: "Commission confusion, incorrect paperwork, and delayed funding are now hitting people who did nothing except trust the office to be stable.",
        consultants: {
          jake: {
            prompt: "Jake wants visible correction because the floor is already acting like accounting is a liability.",
            options: [
              {
                id: "sd-fallout-jake-fix",
                label: "Correct any employee-facing mistakes immediately before resentment compounds.",
                outcome: "The dealership regains credibility because it stops debating harm that is already obvious.",
                nextNodeId: "trust-repair",
                effects: fx(-2, 0, 4, {
                  jake: st(2, 3),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "sd-fallout-jake-wait",
                label: "Tell the floor to wait until the full review is complete before any corrections happen.",
                outcome: "The process stays orderly, though the trust cost keeps rising while people wait.",
                nextNodeId: "control-plan",
                effects: fx(0, 0, 0, {
                  jake: st(-3, -3),
                  marcus: st(0, 1)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina wants the final answer to include how the dealership will restore confidence in the office after this.",
            options: [
              {
                id: "sd-fallout-nina-transparent",
                label: "Be transparent about the review and what is being corrected so the rumor gap stays small.",
                outcome: "The store sounds honest, which keeps fear from becoming its own second crisis.",
                nextNodeId: "trust-repair",
                effects: fx(-1, 0, 4, {
                  nina: st(2, 3),
                  elena: st(1, 1)
                })
              },
              {
                id: "sd-fallout-nina-quiet",
                label: "Keep the review tightly contained and only tell people what directly affects them.",
                outcome: "The communication stays clean, though some staff will assume the worst in the silence.",
                nextNodeId: "control-plan",
                effects: fx(0, 0, 1, {
                  nina: st(0, 1),
                  jake: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "control-plan": {
        title: "The dealership needs a durable control plan now, not just a dramatic morning",
        body: "You have contained the most immediate damage. The final step is deciding how the office regains reliability once Marcus is no longer treated as a one-man unquestioned system.",
        consultants: {
          nina: {
            prompt: "Nina wants stronger cross-checks so the dealership is never this dependent on one impaired person again.",
            options: [
              {
                id: "sd-control-nina-checks",
                label: "Add cross-checks between accounting, CRM, and deal files so errors cannot hide in one desk.",
                outcome: "The dealership gets slower in a healthy way and much harder to destabilize.",
                nextNodeId: null,
                effects: fx(0, 1, 5, {
                  nina: st(3, 4),
                  marcus: st(0, 1),
                  jake: st(1, 1)
                })
              },
              {
                id: "sd-control-nina-light",
                label: "Make only a light process change and trust this was a one-off wake-up call.",
                outcome: "The office regains speed faster, though some staff quietly doubt the lesson really stuck.",
                nextNodeId: null,
                effects: fx(1, 0, 1, {
                  nina: st(0, 1),
                  marcus: st(0, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants a path back that is not simply public humiliation followed by permanent mistrust.",
            options: [
              {
                id: "sd-control-marcus-return",
                label: "Give Marcus a structured return plan with oversight instead of pretending nothing happened.",
                outcome: "The dealership balances grace with guardrails, which gives the recovery a chance to be real.",
                nextNodeId: null,
                effects: fx(0, 1, 4, {
                  marcus: st(1, 3),
                  nina: st(1, 1),
                  jake: st(0, 0)
                })
              },
              {
                id: "sd-control-marcus-strip",
                label: "Strip Marcus's critical responsibilities for now and rebuild trust only much later.",
                outcome: "The controls get stronger immediately, even if Marcus leaves feeling broken by the verdict.",
                nextNodeId: null,
                effects: fx(0, 0, 3, {
                  marcus: st(-5, -5),
                  nina: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "trust-repair": {
        title: "The final job is restoring trust with people who now feel the office can hurt them without warning",
        body: "It is not enough to fix the numbers. The staff and affected customers need to believe leadership took the instability seriously and did not just smooth it over.",
        consultants: {
          jake: {
            prompt: "Jake wants proof that if accounting errors hurt salespeople, leadership will not hide behind patience forever.",
            options: [
              {
                id: "sd-trust-jake-direct",
                label: "Reconcile the affected deals and communicate the corrections directly to everyone impacted.",
                outcome: "The store feels more fair because the repair is visible, not theoretical.",
                nextNodeId: null,
                effects: fx(-2, 0, 5, {
                  jake: st(3, 4),
                  marcus: st(0, 0),
                  elena: st(1, 1)
                })
              },
              {
                id: "sd-trust-jake-minimal",
                label: "Correct only the biggest issues and move on before the dealership gets stuck living in the mess.",
                outcome: "The week moves faster, though some people feel leadership valued momentum over full fairness.",
                nextNodeId: null,
                effects: fx(-1, 0, 1, {
                  jake: st(0, 1),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the story inside the building to become 'leadership handled it' instead of 'accounting nearly came apart.'",
            options: [
              {
                id: "sd-trust-elena-message",
                label: "Pair the corrections with a thoughtful internal reset on trust, coverage, and asking for help earlier.",
                outcome: "The dealership feels wiser instead of merely exhausted.",
                nextNodeId: null,
                effects: fx(-1, 1, 5, {
                  elena: st(3, 4),
                  marcus: st(1, 2),
                  nina: st(1, 1)
                })
              },
              {
                id: "sd-trust-elena-quiet",
                label: "Keep the trust repair quiet and trust time to smooth the edges.",
                outcome: "That may work for some people. Others will simply remember the silence.",
                nextNodeId: null,
                effects: fx(0, 0, 1, {
                  elena: st(1, 1),
                  jake: st(-1, -1),
                  nina: st(-1, -1)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "church-flyer-disaster",
    category: "Community Backlash",
    pressure: "High",
    headline: "Elena's edgy ad copy with swear words was printed and delivered to schools and churches",
    body:
      "Trying to help the dealership go viral, Elena wrote this week's printed marketing ads with several swear words. Those flyers were delivered to schools and churches, and complaints are starting to come in fast.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is a branding problem, a community problem, and an approval problem at the same time.",
        consultants: {
          elena: {
            prompt: "Elena says the copy was bold on purpose, but she never intended for it to land in schools and churches.",
            options: [
              {
                id: "cf-open-elena-walk",
                label: "Have Elena walk you through the concept, the wording, and how distribution happened.",
                outcome: "You start with the creative and operational facts before anyone rushes to villainize her.",
                nextNodeId: "approval-trail",
                effects: fx(0, 0, 2, {
                  elena: st(1, 3),
                  marcus: st(0, 0)
                })
              },
              {
                id: "cf-open-elena-recall",
                label: "Tell Elena to help pull the campaign immediately before you do anything else.",
                outcome: "Containment starts fast, though the questions about judgment are still waiting.",
                nextNodeId: "community-backlash",
                effects: fx(-1, 0, 3, {
                  elena: st(-1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-open-elena-scold",
                label: "Scold Elena first for thinking profanity was smart for print marketing.",
                outcome: "The seriousness is obvious, but the dealership still has no phone plan right now.",
                nextNodeId: "customer-traffic",
                effects: fx(0, -1, -1, {
                  elena: st(-4, -4),
                  jake: st(0, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants to know who approved what, how much this cost, and how expensive the cleanup is about to become.",
            options: [
              {
                id: "cf-open-marcus-cost",
                label: "Ask Marcus for the financial and legal exposure before you speak publicly.",
                outcome: "You anchor the response in real stakes instead of pure embarrassment.",
                nextNodeId: "approval-trail",
                effects: fx(0, 0, 3, {
                  marcus: st(2, 4),
                  elena: st(-1, -1)
                })
              },
              {
                id: "cf-open-marcus-stop",
                label: "Tell Marcus to stop distribution and preserve every version of the ad immediately.",
                outcome: "The dealership becomes more defensible and slightly less chaotic.",
                nextNodeId: "community-backlash",
                effects: fx(-1, 0, 3, {
                  marcus: st(2, 3),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-open-marcus-cheap",
                label: "Ask Marcus for the cheapest way to make the complaints go away without overreacting.",
                outcome: "Containment becomes the goal, though not necessarily trust.",
                nextNodeId: "customer-traffic",
                effects: fx(0, -1, -2, {
                  marcus: st(1, 1),
                  elena: st(-1, -1)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina sees the digital and community blowback forming at the same time and wants a clean explanation fast.",
            options: [
              {
                id: "cf-open-nina-reaction",
                label: "Ask Nina what complaints are already coming in and how people are framing them.",
                outcome: "You get a real-time read on the shape of the backlash before it fully hardens.",
                nextNodeId: "community-backlash",
                effects: fx(0, 0, 2, {
                  nina: st(2, 3),
                  elena: st(0, 0)
                })
              },
              {
                id: "cf-open-nina-copy",
                label: "Have Nina help draft a cleaner explanation while you investigate how this happened.",
                outcome: "The dealership becomes much better prepared to answer without sounding stunned or defensive.",
                nextNodeId: "approval-trail",
                effects: fx(0, 1, 3, {
                  nina: st(2, 3),
                  elena: st(0, 1)
                })
              },
              {
                id: "cf-open-nina-stayout",
                label: "Keep Nina out because print marketing is Elena's lane and this is her mess.",
                outcome: "The ownership sounds neat, but the store loses some of its best communication discipline.",
                nextNodeId: "customer-traffic",
                effects: fx(0, 0, -1, {
                  nina: st(-2, -2),
                  elena: st(-1, -1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the whole thing is embarrassing, but he is also wondering whether the ad at least got people talking.",
            options: [
              {
                id: "cf-open-jake-customer",
                label: "Ask Jake what customers on the floor are saying right now.",
                outcome: "You hear quickly whether this still feels like community backlash or already feels like in-store distrust too.",
                nextNodeId: "customer-traffic",
                effects: fx(0, 0, 1, {
                  jake: st(1, 2),
                  elena: st(0, 0)
                })
              },
              {
                id: "cf-open-jake-serious",
                label: "Tell Jake this is not a 'buzz is buzz' situation and shut down that framing fast.",
                outcome: "The dealership avoids sliding into fake-edgy denial.",
                nextNodeId: "community-backlash",
                effects: fx(0, 0, 2, {
                  jake: st(-1, 0),
                  elena: st(0, 0)
                })
              },
              {
                id: "cf-open-jake-traffic",
                label: "Check whether the ad actually increased traffic before you decide how apologetic to be.",
                outcome: "You get more business context, but the moral problem does not get smaller while you wait.",
                nextNodeId: "approval-trail",
                effects: fx(0, -1, -1, {
                  jake: st(1, 1),
                  marcus: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "community-backlash": {
        title: "Parents, church staff, and community members are now calling and posting",
        body: "The issue has moved beyond awkwardness into community trust. People are not just confused; they are offended and deciding what your dealership stands for.",
        consultants: {
          nina: {
            prompt: "Nina wants to answer quickly, clearly, and without doubling down on the edgy tone.",
            options: [
              {
                id: "cf-backlash-nina-apology",
                label: "Issue a clear apology, stop distribution, and acknowledge the copy was inappropriate for the audience it reached.",
                outcome: "The dealership sounds responsible instead of cagey.",
                nextNodeId: "public-response",
                effects: fx(-1, 2, 5, {
                  nina: st(3, 4),
                  elena: st(-1, 0)
                })
              },
              {
                id: "cf-backlash-nina-soft",
                label: "Use softer wording about 'tone missing the mark' without fully owning the profanity issue.",
                outcome: "The response sounds polished, though some people will hear it as avoiding the plain truth.",
                nextNodeId: "discipline-reset",
                effects: fx(0, 0, 1, {
                  nina: st(1, 2),
                  elena: st(0, 0)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants to fix it, but she is afraid a full apology makes her look incompetent and disposable.",
            options: [
              {
                id: "cf-backlash-elena-own",
                label: "Have Elena own the tone mistake directly and help lead the cleanup.",
                outcome: "The accountability feels real, which gives the apology much more weight.",
                nextNodeId: "public-response",
                effects: fx(-1, 2, 4, {
                  elena: st(0, 2),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-backlash-elena-defend",
                label: "Let Elena argue the ad was meant to be bold and the distribution mistake changed the context.",
                outcome: "There is logic to it, but it still sounds like the dealership is explaining profanity to churches.",
                nextNodeId: "discipline-reset",
                effects: fx(0, -2, -4, {
                  elena: st(1, 0),
                  marcus: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "approval-trail": {
        title: "Nobody seems fully sure how the ad got approved, which may be as bad as the words themselves",
        body: "Now the dealership has a second problem: whether Elena acted alone, whether someone waved it through, or whether nobody was actually reviewing print marketing closely at all.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the final answer to address governance, not just embarrassment.",
            options: [
              {
                id: "cf-approval-marcus-process",
                label: "Treat this as a failed approval process and build a formal review step for future print campaigns.",
                outcome: "The dealership sounds like it learned something deeper than 'do not swear at churches.'",
                nextNodeId: "discipline-reset",
                effects: fx(0, 1, 5, {
                  marcus: st(3, 4),
                  elena: st(0, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-approval-marcus-blame",
                label: "Place the problem squarely on Elena's judgment and keep the larger process out of it.",
                outcome: "The accountability looks simple, though the system that let it happen stays mostly untouched.",
                nextNodeId: "discipline-reset",
                effects: fx(0, 0, 1, {
                  marcus: st(1, 2),
                  elena: st(-4, -4)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the store needs a cleaner path from idea to approved public message or this will happen again in a different form.",
            options: [
              {
                id: "cf-approval-nina-modern",
                label: "Use this to build a clearer marketing review chain that still allows bold ideas with guardrails.",
                outcome: "The dealership keeps creativity alive without pretending chaos is a strategy.",
                nextNodeId: "public-response",
                effects: fx(0, 1, 4, {
                  nina: st(3, 4),
                  elena: st(1, 1)
                })
              },
              {
                id: "cf-approval-nina-lockdown",
                label: "Shift to a much tighter, less risky approval process even if it makes marketing slower and safer.",
                outcome: "The risk collapses quickly, though so does some of the energy Elena was chasing.",
                nextNodeId: "discipline-reset",
                effects: fx(-1, 0, 3, {
                  nina: st(1, 2),
                  elena: st(-2, -2)
                })
              }
            ]
          }
        }
      },
      "customer-traffic": {
        title: "The ad may have drawn eyes, but now those eyes are mixed with disgust and disbelief",
        body: "Jake can see that some people are talking about the dealership, but it is not clean buzz. The room now has to decide whether any bump in attention matters when the trust cost is this ugly.",
        consultants: {
          jake: {
            prompt: "Jake thinks there may be a sales angle left if the dealership can separate the buzz from the backlash.",
            options: [
              {
                id: "cf-traffic-jake-separate",
                label: "Treat any traffic bump as irrelevant and center the response on community repair instead.",
                outcome: "The dealership sounds like it still knows what matters most.",
                nextNodeId: "public-response",
                effects: fx(0, 1, 4, {
                  jake: st(0, 1),
                  elena: st(0, 0)
                })
              },
              {
                id: "cf-traffic-jake-buzz",
                label: "Lean into the idea that the ad did cut through the noise, just maybe too hard.",
                outcome: "The reasoning may be technically true and emotionally disastrous.",
                nextNodeId: "discipline-reset",
                effects: fx(1, -2, -5, {
                  jake: st(1, 0),
                  elena: st(1, 1),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants one chance to prove this can be recovered without branding her as a reckless embarrassment forever.",
            options: [
              {
                id: "cf-traffic-elena-reset",
                label: "Let Elena help rewrite the message and lead a cleaner follow-up campaign once the apology is out.",
                outcome: "The dealership salvages some marketing credibility by showing it can correct course professionally.",
                nextNodeId: "public-response",
                effects: fx(0, 1, 4, {
                  elena: st(1, 3),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-traffic-elena-bench",
                label: "Pull Elena fully out of the public response so the cleanup does not sound self-protective.",
                outcome: "The store looks safer, though Elena now feels publicly benched by the very thing she created.",
                nextNodeId: "discipline-reset",
                effects: fx(0, 0, 2, {
                  elena: st(-4, -4),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "public-response": {
        title: "The dealership's public answer will define whether this becomes a bad week or a lasting stain",
        body: "By now, people know what happened. The final decision is how fully the dealership owns it and what tone it wants the community to remember.",
        consultants: {
          nina: {
            prompt: "Nina wants the response to be plain, human, and impossible to misread.",
            options: [
              {
                id: "cf-public-nina-plain",
                label: "Use a plain apology, clear ownership, and a promise that the campaign is gone.",
                outcome: "The dealership sounds grounded and mature, which is exactly what this crisis needs.",
                nextNodeId: null,
                effects: fx(-1, 2, 5, {
                  nina: st(3, 4),
                  elena: st(0, 1)
                })
              },
              {
                id: "cf-public-nina-corporate",
                label: "Use a polished corporate statement that sounds safe but slightly distant.",
                outcome: "The response is tidy, though not especially warm.",
                nextNodeId: null,
                effects: fx(0, 0, 2, {
                  nina: st(1, 2),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants the dealership to say only what it can defend and not promise a moral awakening it cannot maintain.",
            options: [
              {
                id: "cf-public-marcus-factual",
                label: "Issue a factual apology focused on the distribution mistake, removed materials, and corrected standard.",
                outcome: "The dealership sounds controlled and responsible, though not especially soulful.",
                nextNodeId: null,
                effects: fx(0, 1, 3, {
                  marcus: st(2, 3),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-public-marcus-silent",
                label: "Keep the response minimal and trust the flyers' removal to do most of the work.",
                outcome: "The noise may die down, but the silence leaves room for others to define the story.",
                nextNodeId: null,
                effects: fx(0, -1, -3, {
                  marcus: st(1, 1),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "discipline-reset": {
        title: "The store still needs to decide how much of this lands on Elena and how much lands on the system around her",
        body: "Even with the public response handled, the staff is waiting to see whether this becomes a lesson in guardrails, a public shaming, or a quiet shrug.",
        consultants: {
          elena: {
            prompt: "Elena knows the copy was hers, but she wants the final outcome to reflect the sloppy approval chain too.",
            options: [
              {
                id: "cf-discipline-elena-coach",
                label: "Give Elena a hard coaching moment, remove the campaign, and rebuild her role with stronger approval rules.",
                outcome: "The consequence is real, but so is the path forward.",
                nextNodeId: null,
                effects: fx(0, 0, 4, {
                  elena: st(-1, 2),
                  marcus: st(1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-discipline-elena-burn",
                label: "Make Elena the clear public example so nobody mistakes edgy for smart again.",
                outcome: "The line is unmistakable, though the humiliation may poison more than it fixes.",
                nextNodeId: null,
                effects: fx(0, -1, 1, {
                  elena: st(-5, -5),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus thinks the best discipline is one that also forces a real review process into existence.",
            options: [
              {
                id: "cf-discipline-marcus-process",
                label: "Tie Elena's consequence to a broader print-approval process so the dealership actually learns something.",
                outcome: "The response feels less like scapegoating and more like a genuine operational correction.",
                nextNodeId: null,
                effects: fx(0, 0, 5, {
                  marcus: st(3, 4),
                  elena: st(-1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "cf-discipline-marcus-warning",
                label: "Issue a sharp warning and move on once the community fire is contained.",
                outcome: "The week recovers faster, though some staff will wonder if the lesson was too cheap.",
                nextNodeId: null,
                effects: fx(0, 0, 1, {
                  marcus: st(1, 1),
                  elena: st(-2, -2)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "gym-ego-spiral",
    category: "Showroom Conduct",
    pressure: "Moderate",
    headline: "Jake's gym obsession is turning into a customer-facing ego circus",
    body:
      "Jake has become weirdly obsessed with his body, keeps fishing for compliments from customers, and the rest of the dealership is getting fed up with the constant flexing.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The issue sounds silly, but it is now visible enough that customers and staff are both reacting to it.",
        consultants: {
          jake: {
            prompt: "Jake thinks he is being charismatic and says people just wish they had his confidence.",
            options: [
              {
                id: "ge-open-jake-direct",
                label: "Tell Jake immediately that the gym comments stop now.",
                outcome: "The line is clear early, even if Jake feels clipped fast.",
                nextNodeId: "incident-log",
                effects: fx(0, 1, 2, {
                  jake: st(-2, -1),
                  nina: st(1, 1),
                  elena: st(1, 1)
                })
              },
              {
                id: "ge-open-jake-hear",
                label: "Hear Jake out fully before deciding whether this is confidence or a real problem.",
                outcome: "You get more context, but Jake also reads the pause as a chance to keep defending the act.",
                nextNodeId: "incident-log",
                effects: fx(0, 0, 1, {
                  jake: st(1, 2),
                  nina: st(-1, -1)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina says the comments are getting embarrassing and making the online-to-showroom handoff feel less professional.",
            options: [
              {
                id: "ge-open-nina-pattern",
                label: "Ask Nina to map the pattern so you are not reacting to one awkward moment.",
                outcome: "You start with evidence instead of annoyance.",
                nextNodeId: "incident-log",
                effects: fx(0, 1, 2, {
                  nina: st(2, 3),
                  marcus: st(1, 1)
                })
              },
              {
                id: "ge-open-nina-fast",
                label: "Use Nina's frustration as enough proof and move straight toward correction.",
                outcome: "The response is faster, though Jake may feel judged by secondhand reports.",
                nextNodeId: "incident-log",
                effects: fx(0, 0, 1, {
                  nina: st(1, 1),
                  jake: st(-2, -2)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena says the vibe is starting to feel less confident and more thirsty, which is not helping the brand.",
            options: [
              {
                id: "ge-open-elena-brand",
                label: "Treat it as a showroom-brand issue before it becomes a review problem.",
                outcome: "You frame the issue around customer comfort, not just Jake's ego.",
                nextNodeId: "incident-log",
                effects: fx(0, 2, 3, {
                  elena: st(2, 3),
                  jake: st(-1, -1)
                })
              },
              {
                id: "ge-open-elena-private",
                label: "Keep it private for now and avoid making a weird issue feel bigger than it is.",
                outcome: "You slow the public drama, though the pattern keeps developing underneath.",
                nextNodeId: "incident-log",
                effects: fx(0, 0, 0, {
                  elena: st(1, 1),
                  nina: st(-1, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus thinks the whole thing is ridiculous but professionally dangerous because it invites complaints nobody needs.",
            options: [
              {
                id: "ge-open-marcus-policy",
                label: "Frame it immediately as a professionalism issue, not a personality issue.",
                outcome: "The store gets a standard to point at instead of a vague feeling.",
                nextNodeId: "incident-log",
                effects: fx(0, 1, 3, {
                  marcus: st(2, 3),
                  jake: st(-2, -1)
                })
              },
              {
                id: "ge-open-marcus-wait",
                label: "Tell Marcus to stay calm while you see whether a real customer incident is already brewing.",
                outcome: "You avoid overcorrecting too early, though the room still feels slippery.",
                nextNodeId: "incident-log",
                effects: fx(0, 0, 1, {
                  marcus: st(0, 1),
                  jake: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "incident-log": {
        title: "It is not one joke; it is a pattern now",
        body: "Multiple staff can name awkward comments Jake made to customers this week, and one customer even asked Nina if the store 'always does this.'",
        consultants: {
          nina: {
            prompt: "Nina wants the problem tied clearly to customer comfort before the team shrugs it off as harmless Jake behavior.",
            options: [
              {
                id: "ge-log-nina-specific",
                label: "Collect a few specific examples and use them in a direct coaching talk.",
                outcome: "Your correction will be harder for Jake to dismiss as vague overreaction.",
                nextNodeId: "customer-moment",
                effects: fx(0, 2, 3, {
                  nina: st(2, 2),
                  jake: st(-1, -2)
                })
              },
              {
                id: "ge-log-nina-teamline",
                label: "Reset the whole team's customer-facing tone instead of isolating Jake immediately.",
                outcome: "The dealership gets a broader standard, though Jake may miss that he is the center of it.",
                nextNodeId: "customer-moment",
                effects: fx(0, 1, 2, {
                  nina: st(1, 2),
                  jake: st(0, 0),
                  elena: st(1, 1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake says everybody is too sensitive and claims customers laugh because they like him.",
            options: [
              {
                id: "ge-log-jake-feedback",
                label: "Tell Jake that charm only counts if the customer feels comfortable, not trapped in his self-talk.",
                outcome: "You connect the issue to sales skill rather than humiliation.",
                nextNodeId: "customer-moment",
                effects: fx(1, 1, 2, {
                  jake: st(-1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "ge-log-jake-dismiss",
                label: "Let Jake keep his swagger for now and trust the numbers to tell you if it is really a problem.",
                outcome: "The correction is delayed, and the team notices.",
                nextNodeId: "customer-moment",
                effects: fx(1, -1, -2, {
                  jake: st(2, 2),
                  nina: st(-2, -2),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "customer-moment": {
        title: "A real customer interaction now forces the issue",
        body: "Jake jokes to a browsing couple that he could probably 'carry the front end of this thing' and the customer laughs awkwardly while the partner looks ready to leave.",
        consultants: {
          jake: {
            prompt: "Jake wants to smooth it over himself and prove he can recover the moment.",
            options: [
              {
                id: "ge-customer-jake-recover",
                label: "Let Jake recover it himself, but warn him this is his last chance.",
                outcome: "You preserve his dignity, though the store is still trusting Jake to clean up Jake's mess.",
                nextNodeId: "team-friction",
                effects: fx(1, 0, 0, {
                  jake: st(1, 1),
                  nina: st(-1, -1)
                })
              },
              {
                id: "ge-customer-jake-pull",
                label: "Pull Jake out immediately and take over the customer interaction yourself.",
                outcome: "The customer feels safer, even if Jake is furious at the embarrassment.",
                nextNodeId: "team-friction",
                effects: fx(0, 3, 3, {
                  jake: st(-3, -4),
                  elena: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the biggest risk is the customer leaving with a story about the dealership being weird, not impressive.",
            options: [
              {
                id: "ge-customer-elena-reframe",
                label: "Re-center the moment on the customer's needs and quietly reset the tone.",
                outcome: "The couple feels seen again instead of stuck inside Jake's performance.",
                nextNodeId: "team-friction",
                effects: fx(1, 3, 4, {
                  elena: st(2, 3),
                  jake: st(-1, -2)
                })
              },
              {
                id: "ge-customer-elena-joke",
                label: "Use humor to defuse it and move on before it hardens into discomfort.",
                outcome: "The tension drops, but the standard is still fuzzy underneath it.",
                nextNodeId: "team-friction",
                effects: fx(1, 1, 1, {
                  elena: st(1, 1),
                  jake: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "team-friction": {
        title: "Now the staff wants to know whether confidence buys special treatment",
        body: "Nina and Marcus both think Jake keeps getting grace because he sells. Tasha says she is tired of the floor acting like professionalism is optional if you are funny enough.",
        consultants: {
          marcus: {
            prompt: "Marcus wants a real standard that applies whether the problem comes from bad math or a loud personality.",
            options: [
              {
                id: "ge-team-marcus-standard",
                label: "Set a blunt customer-conduct standard for everyone and tie Jake's issue to that rule.",
                outcome: "The rule lands as structure, not just a mood swing.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 4, {
                  marcus: st(2, 3),
                  nina: st(1, 1),
                  jake: st(-2, -2)
                })
              },
              {
                id: "ge-team-marcus-private",
                label: "Handle Jake privately and avoid making a broad store policy out of a weird personal phase.",
                outcome: "The store stays quieter, though some people will still wonder whether standards depend on who broke them.",
                nextNodeId: "final-reset",
                effects: fx(0, 0, 1, {
                  marcus: st(-1, -1),
                  jake: st(0, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants proof that management will protect the room from clown behavior before everyone just starts ignoring it.",
            options: [
              {
                id: "ge-team-tasha-direct",
                label: "Be direct that Jake's behavior is not harmless if the rest of the team is carrying the discomfort.",
                outcome: "The team feels seen, though Jake takes it personally.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 3, {
                  tasha: st(2, 3),
                  nina: st(1, 1),
                  jake: st(-3, -3)
                })
              },
              {
                id: "ge-team-tasha-soft",
                label: "Ask the team for patience while you coach Jake instead of turning this into a public correction.",
                outcome: "You buy time, though patience is getting thin.",
                nextNodeId: "final-reset",
                effects: fx(0, -1, -1, {
                  tasha: st(-1, -2),
                  nina: st(-1, -1),
                  jake: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "final-reset": {
        title: "The last move is deciding whether Jake leaves this as better coached or just more resentful",
        body: "Jake can tell the building is fed up. What happens now determines whether this becomes a professionalism reset or the start of a deeper sales-floor resentment.",
        consultants: {
          jake: {
            prompt: "Jake wants one clean chance to keep his swagger without feeling like management broke him in front of the team.",
            options: [
              {
                id: "ge-final-jake-coach",
                label: "Coach Jake around confidence, customer reading, and when charm becomes self-obsession.",
                outcome: "The lesson has teeth without turning into humiliation.",
                nextNodeId: null,
                effects: fx(2, 2, 4, {
                  jake: st(1, 2),
                  nina: st(1, 1),
                  elena: st(1, 1)
                })
              },
              {
                id: "ge-final-jake-bench",
                label: "Bench Jake from the floor briefly so the message cannot be misunderstood.",
                outcome: "The line becomes unmistakable, though Jake's trust takes a real hit.",
                nextNodeId: null,
                effects: fx(-1, 1, 3, {
                  jake: st(-4, -5),
                  nina: st(2, 2),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the recovery to be visible enough that customers and staff both feel the room has changed.",
            options: [
              {
                id: "ge-final-elena-reset",
                label: "Pair Jake's coaching with a visible showroom tone reset for the full team.",
                outcome: "The dealership comes out looking more intentional than reactive.",
                nextNodeId: null,
                effects: fx(1, 3, 5, {
                  elena: st(2, 3),
                  nina: st(1, 2),
                  jake: st(-1, 0)
                })
              },
              {
                id: "ge-final-elena-minimal",
                label: "Keep the correction quiet and trust the awkward week to fade out on its own.",
                outcome: "The incident cools down, though the store never fully hears a standard from you.",
                nextNodeId: null,
                effects: fx(1, 0, 0, {
                  elena: st(-1, -1),
                  nina: st(-1, -1),
                  jake: st(1, 1)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "airpods-ultimatum",
    category: "Service Meltdown",
    pressure: "High",
    headline: "Tasha lost her AirPods in a customer's car and is spiraling into open anger",
    body:
      "Tasha cannot find her AirPods after an oil change, nobody is helping her contact the customer, and she has started muttering that she is going to burn the place down if she cannot listen to Jelly Roll while she works.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is partly about lost AirPods, but mostly about whether the store helps people when a small problem starts turning into a big one.",
        consultants: {
          tasha: {
            prompt: "Tasha is furious, embarrassed, and convinced nobody cares because it is her problem instead of the dealership's.",
            options: [
              {
                id: "ap-open-tasha-hear",
                label: "Hear Tasha out fully before you decide what the dealership owes her.",
                outcome: "She feels seen, which lowers the heat enough to think clearly.",
                nextNodeId: "customer-trace",
                effects: fx(0, 1, 1, {
                  tasha: st(2, 3),
                  jake: st(0, 0)
                })
              },
              {
                id: "ap-open-tasha-language",
                label: "Address the threat language immediately before anything else.",
                outcome: "The line is clear, but Tasha feels you cared more about tone than help.",
                nextNodeId: "customer-trace",
                effects: fx(0, -1, 1, {
                  tasha: st(-3, -3),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the customer can probably be traced fast if people stop acting helpless and use the system properly.",
            options: [
              {
                id: "ap-open-nina-trace",
                label: "Have Nina pull the service records and customer contact trail immediately.",
                outcome: "The situation becomes solvable instead of theatrical.",
                nextNodeId: "customer-trace",
                effects: fx(0, 1, 2, {
                  nina: st(2, 3),
                  tasha: st(1, 1)
                })
              },
              {
                id: "ap-open-nina-later",
                label: "Tell Nina to stay on sales work while you decide whether this deserves dealership time.",
                outcome: "You preserve workflow, but Tasha sees that as one more brush-off.",
                nextNodeId: "customer-trace",
                effects: fx(0, -1, -1, {
                  nina: st(0, 1),
                  tasha: st(-2, -3)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake thinks this is becoming a whole store drama over earbuds, but he admits some people have been teasing Tasha instead of helping.",
            options: [
              {
                id: "ap-open-jake-names",
                label: "Use Jake to find out who ignored the issue and who turned it into a joke.",
                outcome: "You start seeing the culture problem around the missing AirPods, not just the missing AirPods themselves.",
                nextNodeId: "customer-trace",
                effects: fx(0, 0, 1, {
                  jake: st(1, 1),
                  tasha: st(1, 1)
                })
              },
              {
                id: "ap-open-jake-shrug",
                label: "Tell Jake this is not a sales problem and keep him out of it.",
                outcome: "The room stays simpler, but you lose a chance to understand how the teasing started spreading.",
                nextNodeId: "customer-trace",
                effects: fx(0, 0, 0, {
                  jake: st(-1, -1),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants to know whether the dealership is about to own a personal-property claim because no one followed clean checkout habits.",
            options: [
              {
                id: "ap-open-marcus-policy",
                label: "Treat it immediately as a process and liability issue, not just a missing item.",
                outcome: "The store gets more serious fast, even if Tasha still wants empathy first.",
                nextNodeId: "customer-trace",
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  tasha: st(-1, 0)
                })
              },
              {
                id: "ap-open-marcus-soft",
                label: "Tell Marcus to hold the policy lecture until you know whether the AirPods are even in the car.",
                outcome: "You keep the situation more human, though Marcus thinks the store is drifting.",
                nextNodeId: "customer-trace",
                effects: fx(0, 1, 0, {
                  marcus: st(-1, -1),
                  tasha: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "customer-trace": {
        title: "The customer can probably be reached, but nobody took ownership of doing it",
        body: "The records are there. The real problem is that multiple people assumed somebody else would help Tasha, so nothing happened for days.",
        consultants: {
          nina: {
            prompt: "Nina can contact the customer cleanly and quickly if you want this handled like a real service recovery.",
            options: [
              {
                id: "ap-trace-nina-call",
                label: "Have Nina contact the customer professionally and ask them to check the car.",
                outcome: "The request sounds respectful instead of desperate.",
                nextNodeId: "bay-friction",
                effects: fx(0, 2, 3, {
                  nina: st(2, 2),
                  tasha: st(1, 2)
                })
              },
              {
                id: "ap-trace-nina-text",
                label: "Send a quick text and hope the customer responds without making it a bigger thing.",
                outcome: "It is faster, though not especially reassuring to Tasha.",
                nextNodeId: "bay-friction",
                effects: fx(0, 1, 1, {
                  nina: st(1, 1),
                  tasha: st(0, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants the contact logged and wants everyone to stop freelancing around personal property in customer vehicles.",
            options: [
              {
                id: "ap-trace-marcus-doc",
                label: "Log the issue formally and make the customer contact part of a documented follow-up.",
                outcome: "The store acts like a business, not a group chat.",
                nextNodeId: "bay-friction",
                effects: fx(0, 1, 3, {
                  marcus: st(2, 3),
                  tasha: st(0, 1)
                })
              },
              {
                id: "ap-trace-marcus-minimize",
                label: "Tell Marcus not to turn missing AirPods into a whole incident report yet.",
                outcome: "The paperwork stays lighter, though Marcus now thinks your standards are floating.",
                nextNodeId: "bay-friction",
                effects: fx(0, 0, -1, {
                  marcus: st(-2, -2),
                  tasha: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "bay-friction": {
        title: "The service bay is now fighting about the response more than the earbuds",
        body: "Tasha is convinced the store only acted because she blew up. Other employees are split between feeling sorry for her and feeling exhausted by the drama.",
        consultants: {
          tasha: {
            prompt: "Tasha wants to know whether the dealership is actually backing her or just calming her down until she shuts up.",
            options: [
              {
                id: "ap-bay-tasha-support",
                label: "Tell Tasha directly that the store should have helped sooner and you are correcting that.",
                outcome: "The anger softens because she finally hears accountability from management.",
                nextNodeId: "threat-fallout",
                effects: fx(0, 2, 3, {
                  tasha: st(3, 4),
                  nina: st(1, 1)
                })
              },
              {
                id: "ap-bay-tasha-boundary",
                label: "Tell Tasha the store can help, but not while she talks like she wants to torch the building.",
                outcome: "The boundary is fair, though she still feels half-abandoned.",
                nextNodeId: "threat-fallout",
                effects: fx(0, 0, 1, {
                  tasha: st(-2, -3),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake knows who teased Tasha and who decided helping her was not worth stopping work.",
            options: [
              {
                id: "ap-bay-jake-stop",
                label: "Use Jake to shut down the teasing and make the room act like adults.",
                outcome: "The service bay loses some of the cheap comedy, which is good for everybody.",
                nextNodeId: "threat-fallout",
                effects: fx(0, 1, 2, {
                  jake: st(1, 1),
                  tasha: st(1, 2)
                })
              },
              {
                id: "ap-bay-jake-ignore",
                label: "Ignore the teasing and focus only on whether the AirPods are recovered.",
                outcome: "The practical problem stays central, but the disrespect underneath it remains fully alive.",
                nextNodeId: "threat-fallout",
                effects: fx(0, -1, -2, {
                  tasha: st(-2, -3),
                  jake: st(1, 0)
                })
              }
            ]
          }
        }
      },
      "threat-fallout": {
        title: "Now you have to decide how serious the threat language really is",
        body: "The AirPods may still turn up, but Tasha's threat is now part of the story too. The store wants to know whether you see it as venting, a real safety issue, or both.",
        consultants: {
          marcus: {
            prompt: "Marcus thinks threatening to burn the place down is not a colorful joke when customers and staff can hear it.",
            options: [
              {
                id: "ap-threat-marcus-writeup",
                label: "Issue a formal warning for the language while still helping resolve the loss.",
                outcome: "The standard is consistent, though Tasha may feel punished on the same day she finally got help.",
                nextNodeId: "final-reset",
                effects: fx(0, 0, 2, {
                  marcus: st(2, 3),
                  tasha: st(-3, -4)
                })
              },
              {
                id: "ap-threat-marcus-context",
                label: "Treat the threat as meltdown language tied to feeling ignored, not as the whole problem.",
                outcome: "You keep the response proportionate, though Marcus worries the store is going soft.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 0, {
                  marcus: st(-1, -1),
                  tasha: st(2, 2)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the store needs a response that feels fair to bystanders too, not just to Tasha.",
            options: [
              {
                id: "ap-threat-elena-both",
                label: "Address both failures clearly: the store ignored her too long, and threatening language is not okay.",
                outcome: "People hear both accountability and boundary, which gives the room a better chance to reset.",
                nextNodeId: "final-reset",
                effects: fx(0, 2, 4, {
                  elena: st(2, 3),
                  tasha: st(1, 2),
                  nina: st(1, 1)
                })
              },
              {
                id: "ap-threat-elena-soft",
                label: "Keep it mostly restorative and avoid a formal discipline moment unless it happens again.",
                outcome: "The room stays less tense, though some staff may feel the line got blurry.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 1, {
                  elena: st(1, 1),
                  marcus: st(-1, -1),
                  tasha: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "final-reset": {
        title: "The last move decides whether this becomes an AirPods story or a trust story",
        body: "By now the dealership has shown its hand. The final choice is whether you leave behind a stronger service culture or just a half-contained grudge.",
        consultants: {
          nina: {
            prompt: "Nina thinks the best close is one that leaves a usable follow-up system instead of another weird memory everyone resents.",
            options: [
              {
                id: "ap-final-nina-process",
                label: "Create a clean follow-up rule for lost items and customer property contact going forward.",
                outcome: "The problem turns into a real operating lesson instead of dealership folklore.",
                nextNodeId: null,
                effects: fx(0, 2, 5, {
                  nina: st(2, 3),
                  marcus: st(1, 2),
                  tasha: st(1, 2)
                })
              },
              {
                id: "ap-final-nina-quiet",
                label: "Keep the wrap-up quiet and trust the situation to cool off once the AirPods question is closed.",
                outcome: "The drama fades, though the deeper lesson stays underbuilt.",
                nextNodeId: null,
                effects: fx(0, 0, 0, {
                  nina: st(0, 1),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants to know whether she matters to the store only when she explodes loudly enough.",
            options: [
              {
                id: "ap-final-tasha-rebuild",
                label: "Rebuild trust directly with Tasha and make the support standard visible to the whole bay.",
                outcome: "The ending feels more human and more durable.",
                nextNodeId: null,
                effects: fx(1, 3, 4, {
                  tasha: st(3, 4),
                  jake: st(1, 1),
                  nina: st(1, 1)
                })
              },
              {
                id: "ap-final-tasha-hardline",
                label: "Close the issue with a final reminder that personal items are personal responsibility.",
                outcome: "The rule is clear, but Tasha hears it as the store learning almost nothing about why she snapped.",
                nextNodeId: null,
                effects: fx(0, -1, -2, {
                  tasha: st(-4, -5),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "closet-side-hustle",
    category: "Website Misuse",
    pressure: "High",
    headline: "Nina has been using the dealership website to sell her own luxury clothes and half the staff knows",
    body:
      "Nina has been quietly using the company website to list and sell her own high-end clothes. Elena stayed quiet for profit, Jake stayed quiet for a favor, Tasha respects the hustle, and Marcus does not know yet.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is no longer just Nina freelancing. It is quickly becoming an integrity problem with multiple people tangled in it.",
        consultants: {
          nina: {
            prompt: "Nina says the listings were temporary, harmless, and honestly a smart use of dead website space.",
            options: [
              {
                id: "cs-open-nina-full",
                label: "Push Nina for the full truth immediately: what sold, who knew, and how long this has been happening.",
                outcome: "The honesty comes faster, even if Nina feels cornered.",
                nextNodeId: "profit-map",
                effects: fx(0, 0, 2, {
                  nina: st(-1, -2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "cs-open-nina-soft",
                label: "Keep Nina calm first so she keeps talking instead of going defensive.",
                outcome: "You get more openness, though the situation still looks bad on the facts.",
                nextNodeId: "profit-map",
                effects: fx(0, 1, 1, {
                  nina: st(1, 2),
                  elena: st(0, 0)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena admits she knew, but she says the site looked more alive and she saw a chance to skim a little upside without hurting car sales.",
            options: [
              {
                id: "cs-open-elena-admit",
                label: "Make Elena explain exactly what she took and why she thought this was remotely acceptable.",
                outcome: "You turn the issue into a leadership-and-judgment problem instead of just a website quirk.",
                nextNodeId: "profit-map",
                effects: fx(0, 0, 2, {
                  elena: st(-2, -2),
                  nina: st(-1, -1)
                })
              },
              {
                id: "cs-open-elena-brand",
                label: "Treat Elena's part of it as a misuse-of-brand issue first.",
                outcome: "The problem gets framed around the dealership's identity instead of just the money.",
                nextNodeId: "profit-map",
                effects: fx(0, 1, 3, {
                  elena: st(-1, 0),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake tries to laugh it off and acts like everybody keeps a side deal or two going when the store is quiet.",
            options: [
              {
                id: "cs-open-jake-favor",
                label: "Dig into what Jake wanted in exchange for his silence.",
                outcome: "The situation gets uglier, but at least it stops pretending to be harmless hustle.",
                nextNodeId: "profit-map",
                effects: fx(0, -1, -2, {
                  jake: st(-2, -3),
                  nina: st(-1, -1)
                })
              },
              {
                id: "cs-open-jake-culture",
                label: "Use Jake to understand how normalized this has become around the building.",
                outcome: "You get a better culture read than a cleaner moral read.",
                nextNodeId: "profit-map",
                effects: fx(0, 0, 1, {
                  jake: st(1, 1),
                  tasha: st(1, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha respects the hustle and thinks the bigger question is why the store website was loose enough for this to happen at all.",
            options: [
              {
                id: "cs-open-tasha-system",
                label: "Treat Tasha's take as a clue that the process weakness may be bigger than Nina alone.",
                outcome: "You start thinking beyond one employee's side hustle.",
                nextNodeId: "profit-map",
                effects: fx(0, 1, 2, {
                  tasha: st(1, 2),
                  marcus: st(1, 1)
                })
              },
              {
                id: "cs-open-tasha-shrug",
                label: "Ignore Tasha's admiration and keep the focus tight on Nina's conduct.",
                outcome: "The accountability line is cleaner, though the broader culture lesson is still hiding.",
                nextNodeId: "profit-map",
                effects: fx(0, 0, 1, {
                  tasha: st(-1, -1),
                  nina: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "profit-map": {
        title: "This was not solo misconduct; it was a small conspiracy",
        body: "You now know Nina listed the items, Elena wanted profit, Jake wanted a date favor, and Tasha treated it like clever dealership folklore. The only person still in the dark is Marcus.",
        consultants: {
          nina: {
            prompt: "Nina says the whole thing can still disappear quietly if you just pull the listings before Marcus sees them.",
            options: [
              {
                id: "cs-map-nina-pull",
                label: "Pull every listing immediately before the misuse spreads any further.",
                outcome: "Containment starts now, even if accountability is still coming.",
                nextNodeId: "exposure-risk",
                effects: fx(0, 0, 2, {
                  nina: st(-1, 0),
                  elena: st(-1, -1)
                })
              },
              {
                id: "cs-map-nina-keep",
                label: "Leave the listings up briefly while you trace the full money flow.",
                outcome: "The investigation gets cleaner, but the misuse continues under your watch.",
                nextNodeId: "exposure-risk",
                effects: fx(1, -1, -3, {
                  nina: st(1, 1),
                  marcus: st(-1, -1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the real danger is not the clothes themselves but Marcus discovering that multiple people treated the website like their own playground.",
            options: [
              {
                id: "cs-map-elena-own",
                label: "Have Elena help prepare a truthful account before Marcus finds fragments and explodes.",
                outcome: "The story gets more coherent before the inevitable accountability conversation.",
                nextNodeId: "exposure-risk",
                effects: fx(0, 1, 3, {
                  elena: st(1, 2),
                  nina: st(0, 1)
                })
              },
              {
                id: "cs-map-elena-distance",
                label: "Separate Elena from the problem and treat her silence as secondary to Nina's conduct.",
                outcome: "The lines get simpler, though the selective accountability is obvious to the people who know more.",
                nextNodeId: "exposure-risk",
                effects: fx(0, -1, -2, {
                  elena: st(-3, -4),
                  nina: st(0, 0)
                })
              }
            ]
          }
        }
      },
      "exposure-risk": {
        title: "Now the question is whether Marcus hears it from you or from the wreckage",
        body: "Accounting is one weird report or one customer screenshot away from discovering that the dealership website has been moonlighting as a boutique.",
        consultants: {
          marcus: {
            prompt: "Marcus can either hear this cleanly from leadership or discover it sideways and assume the building is rotten.",
            options: [
              {
                id: "cs-risk-marcus-tell",
                label: "Tell Marcus the truth before he discovers it alone.",
                outcome: "The blast is real, but at least it is not paired with betrayal by omission.",
                nextNodeId: "culture-crack",
                effects: fx(0, 0, 4, {
                  marcus: st(1, 3),
                  nina: st(-2, -3),
                  elena: st(-1, -1)
                })
              },
              {
                id: "cs-risk-marcus-delay",
                label: "Delay Marcus until you have the whole problem cleaned up first.",
                outcome: "You buy time, though the trust cost gets sharper if he finds out another way.",
                nextNodeId: "culture-crack",
                effects: fx(0, -1, -3, {
                  marcus: st(-3, -4),
                  nina: st(1, 1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the only thing that matters is whether the website mess becomes public enough to hurt showroom traffic.",
            options: [
              {
                id: "cs-risk-jake-contain",
                label: "Contain the website optics first, then come back for the internal reckoning.",
                outcome: "The outside blast radius shrinks, but the inside ethics issue keeps simmering.",
                nextNodeId: "culture-crack",
                effects: fx(1, 0, 0, {
                  jake: st(1, 1),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "cs-risk-jake-clean",
                label: "Tell Jake this is bigger than optics and you are done treating it like a funny hustle story.",
                outcome: "The tone firms up, even if Jake thinks management has no sense of proportion.",
                nextNodeId: "culture-crack",
                effects: fx(0, 1, 2, {
                  jake: st(-2, -2),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "culture-crack": {
        title: "The real damage is that too many people decided the rules were optional",
        body: "This is now a culture question. Multiple people took something from the misconduct: money, leverage, entertainment, or admiration.",
        consultants: {
          tasha: {
            prompt: "Tasha will respect almost any decision as long as it feels honest about the hustle and honest about the line.",
            options: [
              {
                id: "cs-culture-tasha-wide",
                label: "Treat this as a store culture failure, not just Nina's side hustle.",
                outcome: "The responsibility spreads where it belongs, though more people feel the heat.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 4, {
                  tasha: st(2, 3),
                  nina: st(-2, -2),
                  elena: st(-2, -2),
                  jake: st(-1, -1)
                })
              },
              {
                id: "cs-culture-tasha-nina",
                label: "Keep the main consequence on Nina and stop the sprawl before it turns into a whole-store tribunal.",
                outcome: "The response stays narrower, though the people who know the truth will feel the selectivity.",
                nextNodeId: "final-reset",
                effects: fx(0, -1, -2, {
                  tasha: st(-1, -1),
                  nina: st(-4, -4),
                  elena: st(0, 0),
                  jake: st(0, 0)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus thinks the only way to restore order is to make misuse, silence, and side deals all part of the same correction.",
            options: [
              {
                id: "cs-culture-marcus-audit",
                label: "Run a full misuse review of the site and make everybody involved answer for their piece.",
                outcome: "The building gets cleaner, even if the week gets much more painful.",
                nextNodeId: "final-reset",
                effects: fx(-1, 0, 5, {
                  marcus: st(3, 4),
                  nina: st(-3, -4),
                  elena: st(-2, -3),
                  jake: st(-2, -2)
                })
              },
              {
                id: "cs-culture-marcus-fast",
                label: "Shut the scheme down, return what you can, and avoid dragging the whole store through a long audit.",
                outcome: "The store moves faster, though some rot stays less examined than Marcus would like.",
                nextNodeId: "final-reset",
                effects: fx(0, 0, 1, {
                  marcus: st(-1, -2),
                  nina: st(-1, -1),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "final-reset": {
        title: "The last choice decides whether this ends as a quiet cleanup or a real integrity reset",
        body: "Everybody now understands what happened. What they remember next will come from the consequence structure you choose.",
        consultants: {
          nina: {
            prompt: "Nina wants a way back that is serious without ending her credibility forever.",
            options: [
              {
                id: "cs-final-nina-repair",
                label: "Keep Nina employed but strip the side-hustle access, require repayment, and rebuild trust under strict guardrails.",
                outcome: "The consequence is real and the store gets to test whether repair is possible.",
                nextNodeId: null,
                effects: fx(0, 1, 4, {
                  nina: st(-1, 1),
                  marcus: st(2, 2),
                  elena: st(0, 1)
                })
              },
              {
                id: "cs-final-nina-burn",
                label: "Make Nina the example and let everybody see exactly what misusing dealership assets costs.",
                outcome: "The line becomes unmistakable, though fear replaces some trust.",
                nextNodeId: null,
                effects: fx(0, -1, 3, {
                  nina: st(-5, -6),
                  jake: st(-1, -2),
                  elena: st(-1, -1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants the ending to prove that the dealership is not run by side deals and selective silence.",
            options: [
              {
                id: "cs-final-marcus-process",
                label: "Pair discipline with a hard reset on website permissions, approvals, and ethics expectations.",
                outcome: "The store comes out stricter, but also more believable.",
                nextNodeId: null,
                effects: fx(0, 2, 6, {
                  marcus: st(3, 4),
                  nina: st(-2, 0),
                  elena: st(-1, 0),
                  jake: st(-1, -1)
                })
              },
              {
                id: "cs-final-marcus-quiet",
                label: "Keep the consequence tight and quiet once the misuse is gone from the site.",
                outcome: "The scandal stays smaller, though the building is left to guess which lessons really mattered.",
                nextNodeId: null,
                effects: fx(0, 0, 0, {
                  marcus: st(-2, -2),
                  nina: st(0, 1),
                  elena: st(0, 0)
                })
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "daycare-breakdown",
    category: "Workplace Boundaries",
    pressure: "High",
    headline: "Marcus keeps bringing his sister's kids to the dealership and everyone is done with it",
    body:
      "Marcus has been bringing in his six- and seven-year-old niece and nephew. They run around the showroom, roast customers, drew on the walls, and broke the staff toilet. The whole store is fed up.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The kids are a sympathy story and a professionalism disaster at the same time.",
        consultants: {
          marcus: {
            prompt: "Marcus says childcare fell apart and he is just trying to survive a rough family stretch without abandoning work.",
            options: [
              {
                id: "dd-open-marcus-hear",
                label: "Hear Marcus out fully before you draw a line.",
                outcome: "You understand the human problem before you impose the workplace solution.",
                nextNodeId: "damage-scan",
                effects: fx(0, 1, 1, {
                  marcus: st(2, 3),
                  tasha: st(0, 0)
                })
              },
              {
                id: "dd-open-marcus-stop",
                label: "Tell Marcus immediately that the kids cannot stay here anymore.",
                outcome: "The boundary is clear, even if the compassion part comes later.",
                nextNodeId: "damage-scan",
                effects: fx(0, 0, 2, {
                  marcus: st(-3, -4),
                  tasha: st(1, 1),
                  jake: st(1, 1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake says customers are noticing, and one of the kids just hit him with a 'your momma' joke in front of a live deal.",
            options: [
              {
                id: "dd-open-jake-customer",
                label: "Treat this first as a customer-experience crisis.",
                outcome: "The business impact gets centered fast.",
                nextNodeId: "damage-scan",
                effects: fx(0, 1, 2, {
                  jake: st(1, 2),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "dd-open-jake-humor",
                label: "Tell Jake to stop clowning about it and help you understand the real disruption.",
                outcome: "The tone gets more useful, though Jake is annoyed you did not just laugh with him.",
                nextNodeId: "damage-scan",
                effects: fx(0, 0, 1, {
                  jake: st(-1, 0),
                  marcus: st(0, 0)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha thinks the kids are now a straight-up safety and sanity problem, especially after the toilet fiasco.",
            options: [
              {
                id: "dd-open-tasha-safety",
                label: "Treat Tasha's warning as a service-bay safety issue, not just a nuisance issue.",
                outcome: "The standard gets more serious right away.",
                nextNodeId: "damage-scan",
                effects: fx(0, 1, 3, {
                  tasha: st(2, 3),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "dd-open-tasha-soft",
                label: "Ask Tasha for patience while you find out what Marcus is dealing with at home.",
                outcome: "The empathy is real, but patience inside the bay is almost gone.",
                nextNodeId: "damage-scan",
                effects: fx(0, -1, -1, {
                  tasha: st(-2, -3),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena says the dealership is starting to feel chaotic in a way customers will remember for all the wrong reasons.",
            options: [
              {
                id: "dd-open-elena-brand",
                label: "Treat it as a professionalism and brand issue before another customer story leaves the building.",
                outcome: "The room gets reminded that vibes are operational too.",
                nextNodeId: "damage-scan",
                effects: fx(0, 2, 3, {
                  elena: st(2, 3),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "dd-open-elena-private",
                label: "Keep the issue private and avoid turning Marcus's family emergency into gossip.",
                outcome: "The dignity stays intact for now, even if the disruption keeps running.",
                nextNodeId: "damage-scan",
                effects: fx(0, 0, 1, {
                  elena: st(1, 1),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "damage-scan": {
        title: "The damage is wider than anybody was admitting",
        body: "The walls are marked up, the staff toilet is out of service, and at least one customer complained after being roasted by children in the showroom.",
        consultants: {
          marcus: {
            prompt: "Marcus is embarrassed now, but he still wants you to see the childcare problem before you see only the mess.",
            options: [
              {
                id: "dd-scan-marcus-own",
                label: "Make Marcus own the full business impact instead of hiding behind the childcare emergency.",
                outcome: "The empathy stays, but the facts stop getting softened.",
                nextNodeId: "customer-flashpoint",
                effects: fx(0, 0, 3, {
                  marcus: st(-2, -2),
                  jake: st(1, 1),
                  tasha: st(1, 1)
                })
              },
              {
                id: "dd-scan-marcus-help",
                label: "Focus first on finding Marcus a temporary path out of the childcare spiral.",
                outcome: "The human side improves, though the rest of the staff still wants the damage acknowledged.",
                nextNodeId: "customer-flashpoint",
                effects: fx(0, 1, 0, {
                  marcus: st(2, 3),
                  tasha: st(-1, -1)
                })
              }
            ]
          },
          jake: {
            prompt: "Jake says the kids turning on customers is what moved this from annoying to untenable.",
            options: [
              {
                id: "dd-scan-jake-customer",
                label: "Document the customer-facing incidents and treat them as the line that got crossed.",
                outcome: "The standard becomes obvious and defensible.",
                nextNodeId: "customer-flashpoint",
                effects: fx(0, 1, 3, {
                  jake: st(1, 2),
                  marcus: st(-1, -2)
                })
              },
              {
                id: "dd-scan-jake-downplay",
                label: "Downplay the customer jokes for now and keep the focus on the property damage.",
                outcome: "The facts stay simpler, though the customer side remains underplayed.",
                nextNodeId: "customer-flashpoint",
                effects: fx(0, -1, -2, {
                  jake: st(-1, -1),
                  elena: st(-1, -1)
                })
              }
            ]
          }
        }
      },
      "customer-flashpoint": {
        title: "A customer complaint now forces a decision",
        body: "A parent customer says they do not care what Marcus is going through at home; they care that the dealership looked chaotic and unserious while they were trying to shop.",
        consultants: {
          elena: {
            prompt: "Elena wants to recover the customer's trust without turning Marcus into a public villain in the middle of the showroom.",
            options: [
              {
                id: "dd-customer-elena-recover",
                label: "Recover the customer personally and separate the apology from Marcus's private hardship.",
                outcome: "The customer sees leadership instead of excuses.",
                nextNodeId: "staff-fairness",
                effects: fx(1, 3, 4, {
                  elena: st(2, 3),
                  marcus: st(-1, -1)
                })
              },
              {
                id: "dd-customer-elena-explain",
                label: "Explain the family hardship context and ask the customer for grace.",
                outcome: "The appeal is human, though not every customer wants to process your staffing compassion story.",
                nextNodeId: "staff-fairness",
                effects: fx(0, 1, 0, {
                  elena: st(1, 1),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          tasha: {
            prompt: "Tasha thinks the customer should get a clean apology and the staff should get proof that rules still exist.",
            options: [
              {
                id: "dd-customer-tasha-line",
                label: "Apologize cleanly and make it obvious the situation will not repeat.",
                outcome: "The response lands as competent instead of wobbly.",
                nextNodeId: "staff-fairness",
                effects: fx(0, 2, 4, {
                  tasha: st(2, 3),
                  marcus: st(-2, -2)
                })
              },
              {
                id: "dd-customer-tasha-soft",
                label: "Keep the apology gentle and avoid promising a hard line until you talk to Marcus again.",
                outcome: "The room stays kinder, though less confident.",
                nextNodeId: "staff-fairness",
                effects: fx(0, 0, 0, {
                  tasha: st(-1, -1),
                  marcus: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "staff-fairness": {
        title: "Now the staff wants to know whether family hardship exempts someone from basic standards",
        body: "The toilet is still broken, the walls still need cleaning, and everyone wants to know whether Marcus is being protected because he is usually the rule guy.",
        consultants: {
          tasha: {
            prompt: "Tasha says people could tolerate almost anything if they believed the rule stayed the same for everybody.",
            options: [
              {
                id: "dd-fairness-tasha-standard",
                label: "Set a clear no-kids-at-work boundary and make it apply starting now.",
                outcome: "The room exhales because the line finally exists.",
                nextNodeId: "final-reset",
                effects: fx(0, 1, 4, {
                  tasha: st(2, 3),
                  jake: st(1, 1),
                  marcus: st(-3, -4)
                })
              },
              {
                id: "dd-fairness-tasha-grace",
                label: "Give Marcus one last temporary grace window, but make the boundary explicit after that.",
                outcome: "The compassion stays alive, though some staff still feel the fairness wobble.",
                nextNodeId: "final-reset",
                effects: fx(0, 0, 1, {
                  tasha: st(-1, -2),
                  marcus: st(1, 1)
                })
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants a path that does not erase the fact that he was trying to keep showing up to work.",
            options: [
              {
                id: "dd-fairness-marcus-plan",
                label: "Work with Marcus on a short-term childcare plan that gets the kids out of the building immediately.",
                outcome: "The problem gets solved with dignity instead of just punishment.",
                nextNodeId: "final-reset",
                effects: fx(0, 2, 3, {
                  marcus: st(2, 3),
                  elena: st(1, 1),
                  tasha: st(0, 0)
                })
              },
              {
                id: "dd-fairness-marcus-warning",
                label: "Issue a formal warning and make Marcus solve the childcare issue entirely on his own.",
                outcome: "The standard hardens fast, though Marcus may never quite hear care in it.",
                nextNodeId: "final-reset",
                effects: fx(0, 0, 2, {
                  marcus: st(-4, -5),
                  tasha: st(1, 1),
                  jake: st(1, 1)
                })
              }
            ]
          }
        }
      },
      "final-reset": {
        title: "The ending decides whether this becomes a compassion story or a favoritism story",
        body: "Everybody now knows what happened. What they remember will depend on whether your final move feels humane, fair, and believable at the same time.",
        consultants: {
          marcus: {
            prompt: "Marcus wants to keep his job, his dignity, and some version of trust from the people who now think he let family chaos invade the store.",
            options: [
              {
                id: "dd-final-marcus-repair",
                label: "Require Marcus to repair the workplace damage and rebuild trust through visible follow-through.",
                outcome: "The consequence is concrete without feeling purely punitive.",
                nextNodeId: null,
                effects: fx(0, 2, 4, {
                  marcus: st(1, 2),
                  tasha: st(1, 2),
                  jake: st(1, 1)
                })
              },
              {
                id: "dd-final-marcus-bench",
                label: "Bench Marcus from work until the childcare situation is stable and the damage is fully addressed.",
                outcome: "The building sees a hard line, though Marcus's trust takes a serious shot.",
                nextNodeId: null,
                effects: fx(-1, 0, 3, {
                  marcus: st(-5, -6),
                  tasha: st(1, 1),
                  jake: st(1, 1)
                })
              }
            ]
          },
          elena: {
            prompt: "Elena wants the store to come out of this with a clearer sense that compassion and professionalism can coexist.",
            options: [
              {
                id: "dd-final-elena-balance",
                label: "Close with a balanced team message: compassion for hardship, zero ambiguity on workplace standards.",
                outcome: "The dealership sounds steadier and more adult than it did when the chaos started.",
                nextNodeId: null,
                effects: fx(0, 3, 5, {
                  elena: st(2, 3),
                  marcus: st(0, 1),
                  tasha: st(1, 1),
                  jake: st(1, 1)
                })
              },
              {
                id: "dd-final-elena-quiet",
                label: "Keep the wrap-up quiet and hope the building moves on once the kids stop appearing.",
                outcome: "The mess fades, though the standards lesson never lands with full force.",
                nextNodeId: null,
                effects: fx(0, 0, 0, {
                  elena: st(0, 1),
                  marcus: st(1, 1),
                  tasha: st(-1, -1)
                })
              }
            ]
          }
        }
      }
    }
  }
];
