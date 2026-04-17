const DM_DEFAULT_TEACHER_USERNAME = "teacher";
const DM_DEFAULT_TEACHER_PASSWORD = "showroom";
const DM_DEFAULT_SALES_GOAL = 75;

const DM_STAFF_MEMBERS = [
  { id: "jake", name: "Jake", title: "Floor Sales", badge: "Closer" },
  { id: "nina", name: "Nina", title: "Online Sales", badge: "CRM" },
  { id: "marcus", name: "Marcus", title: "Accounting", badge: "Numbers" },
  { id: "tasha", name: "Tasha", title: "Service Bay", badge: "Shop" },
  { id: "elena", name: "Elena", title: "Marketing", badge: "Brand" }
];

const DM_DEFAULT_STUDENT_STATE = {
  sales: 0,
  satisfaction: 72,
  reputation: 68
};

const DM_EVENT_TEMPLATES = [
  {
    id: "commission-crisis",
    category: "Commission Dispute",
    pressure: "High",
    headline: "An accounting error may have cost Jake a major commission payout",
    body:
      "Jake storms in saying his paycheck is short by $1,800. Marcus says the deal files were processed correctly. The dispute is getting loud enough that the rest of the dealership is starting to take sides.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "Your first move determines whether this becomes a sales-floor revolt, a policy review, or a fairness reset.",
        consultants: {
          jake: {
            prompt: "Jake feels cheated and wants immediate action before the whole floor decides management never protects sales.",
            options: [
              {
                id: "comm-jake-hear-out",
                label: "Hear Jake out fully and promise a same-day review of the two deals he flagged.",
                outcome: "Jake feels seen, and you buy a little emotional room before the dispute gets bigger.",
                nextNodeId: "deal-review",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 1,
                  staff: { jake: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "comm-jake-calm-down",
                label: "Tell Jake to calm down and wait until accounting verifies the numbers.",
                outcome: "The room gets quieter, but Jake reads it as management siding with the back office before checking the facts.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    jake: { morale: -3, trust: -4 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus has the paperwork ready and believes the real issue may be sloppy expectations or a vague pay-plan rule.",
            options: [
              {
                id: "comm-marcus-line-review",
                label: "Review the deal jackets with Marcus line by line before taking anyone's side.",
                outcome: "You slow the drama down and move the dispute toward evidence instead of emotion.",
                nextNodeId: "deal-review",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 3,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "comm-marcus-rerun",
                label: "Have Marcus re-run the entire commission report in case the issue is wider than one salesperson.",
                outcome: "The review feels fairer, but now the whole store senses the compensation process may be shakier than expected.",
                nextNodeId: "policy-loophole",
                effects: {
                  sales: 1,
                  satisfaction: 0,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 2, trust: 3 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the truth may be buried in deal attribution, lead ownership, and who actually touched the customer first.",
            options: [
              {
                id: "comm-nina-credit-check",
                label: "Ask Nina to verify whether lead ownership or split-credit rules affected the payout.",
                outcome: "The dispute becomes less emotional and more procedural, which helps if the numbers are messier than anyone admits.",
                nextNodeId: "policy-loophole",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    nina: { morale: 2, trust: 3 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "comm-nina-rumor-check",
                label: "Use Nina to learn how far the rumor has already spread before it poisons the room.",
                outcome: "You get a better read on the culture risk, even if it does not fix the math yet.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    nina: { morale: 1, trust: 2 },
                    elena: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      },
      "deal-review": {
        title: "The files are being reviewed and the real question is how transparent you will be",
        body: "Marcus finds either an actual entry error or a gray area in the pay plan. You need to resolve the money issue without teaching the team the wrong lesson.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the correction to be precise, documented, and consistent with the pay plan going forward.",
            options: [
              {
                id: "comm-review-marcus-fix",
                label: "Correct the error immediately, document it, and explain exactly what changed.",
                outcome: "The dealership takes a short-term financial hit, but trust rises because the correction is clean and visible.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 2, trust: 4 },
                    jake: { morale: 4, trust: 5 }
                  }
                }
              },
              {
                id: "comm-review-marcus-quiet",
                label: "Fix the pay quietly and move on without saying much more to the store.",
                outcome: "The immediate fire cools, but people still wonder what almost got hidden.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 0, trust: 1 },
                    jake: { morale: 2, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake wants the fix to feel like management actually values the sales floor, not like a reluctant correction.",
            options: [
              {
                id: "comm-review-jake-face",
                label: "Meet with Jake directly, explain the fix, and set a better review process for future commission disputes.",
                outcome: "Jake feels respected, and the floor sees leadership acting like fairness is part of performance.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    jake: { morale: 4, trust: 4 },
                    marcus: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "comm-review-jake-take-it",
                label: "Tell Jake the corrected money is the answer and the argument ends now.",
                outcome: "The dealership moves on fast, but the emotional damage heals more slowly than the payroll line.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -1,
                  reputation: 0,
                  staff: {
                    jake: { morale: 0, trust: -1 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "policy-loophole": {
        title: "The numbers may be less wrong than the policy is vague",
        body: "The dispute has exposed a gray area in the pay plan. Now the dealership has to choose whether it protects consistency, culture, or short-term peace.",
        consultants: {
          marcus: {
            prompt: "Marcus wants a written standard so the store stops relitigating compensation case by case.",
            options: [
              {
                id: "comm-policy-marcus-rewrite",
                label: "Interpret this one in Jake's favor, then rewrite the policy immediately for future deals.",
                outcome: "The floor feels treated fairly, and the dealership comes out of the mess with a cleaner standard.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 1, trust: 2 },
                    jake: { morale: 3, trust: 4 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "comm-policy-marcus-strict",
                label: "Enforce the current accounting interpretation and tell the floor consistency matters most.",
                outcome: "The rule becomes clear, but sales leaves feeling like the dealership wrote clarity in accounting's favor.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 3, trust: 3 },
                    jake: { morale: -4, trust: -4 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the real answer is a cleaner credit and commission trail that nobody can reinterpret later.",
            options: [
              {
                id: "comm-policy-nina-system",
                label: "Use Nina to tighten lead attribution and commission visibility across departments.",
                outcome: "It is not glamorous, but the next dispute becomes less likely because the system is harder to game or misunderstand.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    marcus: { morale: 1, trust: 2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "comm-policy-nina-split",
                label: "Split the difference now and promise a deeper policy review later.",
                outcome: "The room cools off, but some people hear compromise where they wanted clarity.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    nina: { morale: 1, trust: 2 },
                    jake: { morale: 1, trust: 1 },
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "rumor-spread": {
        title: "The commission dispute is now bigger than the paycheck itself",
        body: "People are whispering that the dealership underpays sales when it can. The next move determines whether you stabilize the room or let culture turn on itself.",
        consultants: {
          elena: {
            prompt: "Elena thinks the team needs a short, credible message before the room invents a permanent story.",
            options: [
              {
                id: "comm-rumor-elena-brief",
                label: "Address the team briefly and say the review is underway with a clear timeline.",
                outcome: "The rumor loses some oxygen because leadership sounds present instead of absent.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    jake: { morale: 1, trust: 1 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "comm-rumor-elena-private",
                label: "Keep the issue private and hope the room settles once the money is handled.",
                outcome: "The dealership avoids a public scene, but the silence makes the rumor feel more believable.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    elena: { morale: -1, trust: -2 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina wants the store to be transparent enough that this does not become a permanent sales-vs-accounting scar.",
            options: [
              {
                id: "comm-rumor-nina-audit",
                label: "Announce a quick commission audit so the team sees fairness instead of favoritism.",
                outcome: "It creates tension for a day, but the store looks more serious about getting compensation right.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    nina: { morale: 2, trust: 3 },
                    marcus: { morale: 0, trust: 1 },
                    jake: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "comm-rumor-nina-shut-down",
                label: "Tell everyone it is private and shut down the conversation hard.",
                outcome: "The noise stops faster, but the dealership sounds more secretive than confident.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    nina: { morale: -1, trust: -1 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "price-typo",
    category: "Listing Error",
    pressure: "High",
    headline: "A listing typo made a customer think a car was for sale at $200",
    body:
      "Nina posted a vehicle online at $200 instead of $20,000. The customer took screenshots, came straight to the dealership, and is now insisting the store honor the listed price while the team argues around them.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "Your first conversation decides whether the dealership treats this as a customer negotiation, a liability problem, or a brand issue.",
        consultants: {
          nina: {
            prompt: "Nina is mortified and wants to show exactly how the typo happened before anyone assumes she was careless on purpose.",
            options: [
              {
                id: "price-nina-audit",
                label: "Review the listing with Nina and pull every screenshot-worthy detail immediately.",
                outcome: "You get the facts fast, and the dealership looks more deliberate than panicked.",
                nextNodeId: "liability-review",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: { nina: { morale: 1, trust: 3 } }
                }
              },
              {
                id: "price-nina-remove",
                label: "Tell Nina to pull the listing now and document the error while you handle the customer.",
                outcome: "The store stops the spread, but now the conversation shifts to what the screenshots already captured.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: { nina: { morale: 0, trust: 2 } }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus is already thinking about false advertising claims, screenshots, and what the dealership can defend.",
            options: [
              {
                id: "price-marcus-liability",
                label: "Ask Marcus what the store is actually obligated to do before anyone makes a promise.",
                outcome: "The dealership gets legally sharper, even if the customer gets louder while you assess the risk.",
                nextNodeId: "liability-review",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: 3,
                  staff: { marcus: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "price-marcus-goodwill",
                label: "Have Marcus outline the cheapest goodwill path that still looks serious.",
                outcome: "You start shaping a realistic exit ramp before the confrontation hardens.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    marcus: { morale: 2, trust: 3 },
                    nina: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena is worried the screenshot becomes a local bait-and-switch story before the store even settles the conversation in front of it.",
            options: [
              {
                id: "price-elena-monitor",
                label: "Ask Elena to monitor review and social channels while you work the in-store problem.",
                outcome: "The dealership becomes more alert to reputation fallout before it fully arrives.",
                nextNodeId: "public-risk",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 3,
                  staff: { elena: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "price-elena-message",
                label: "Use Elena to help craft a calm explanation in case the customer wants a public answer.",
                outcome: "The store sounds steadier and less defensive, even before the legal side is fully settled.",
                nextNodeId: "liability-review",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    elena: { morale: 2, trust: 3 },
                    marcus: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      },
      "liability-review": {
        title: "The typo is obvious, but screenshots still make it risky",
        body: "The dealership still has to choose whether to be firm, flexible, or overly dramatic in its recovery.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the store to explain the typo clearly without accidentally offering a bad precedent.",
            options: [
              {
                id: "price-liability-marcus-firm",
                label: "Decline the $200 demand clearly, explain the typo, and offer a modest goodwill step.",
                outcome: "The dealership protects itself without sounding completely cold, though the customer may still be unhappy.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    nina: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "price-liability-marcus-escalate",
                label: "Escalate the decision to ownership or legal guidance before giving the customer a final answer.",
                outcome: "The dealership becomes safer legally, but slower and more corporate in the eyes of the customer.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 2, trust: 3 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina wants the store to own the typo while still making it obvious the intended price was never really $200.",
            options: [
              {
                id: "price-liability-nina-own",
                label: "Own the mistake openly and pair that honesty with a realistic concession.",
                outcome: "The customer may still be disappointed, but the dealership sounds human and credible.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 4,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    elena: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "price-liability-nina-hide",
                label: "Minimize the mistake and focus only on correcting the listing going forward.",
                outcome: "The technical fix happens, but the customer leaves feeling the dealership never really acknowledged the confusion it caused.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -2,
                  reputation: -3,
                  staff: {
                    nina: { morale: -1, trust: -2 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-negotiation": {
        title: "The customer may not expect a $200 car anymore, but they do expect something",
        body: "Once the shock fades, the real dealership question becomes how much goodwill to offer without rewarding bad-faith pressure.",
        consultants: {
          jake: {
            prompt: "Jake thinks the customer can still be converted if the store gives them something they can walk away bragging about.",
            options: [
              {
                id: "price-negotiation-jake-addons",
                label: "Let Jake work the customer toward the real price with service perks or add-ons.",
                outcome: "The store protects more margin than a cash discount, and the customer still feels they won something.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 2,
                  staff: {
                    jake: { morale: 3, trust: 3 },
                    marcus: { morale: 0, trust: 0 }
                  }
                }
              },
              {
                id: "price-negotiation-jake-no-deal",
                label: "Refuse any concession and tell Jake to hold the line on the real price.",
                outcome: "The dealership protects the gross, but the customer is far more likely to leave angry than converted.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: -3,
                  reputation: -3,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    marcus: { morale: 2, trust: 2 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena cares less about the exact concession than about whether the customer leaves feeling respected instead of tricked.",
            options: [
              {
                id: "price-negotiation-elena-recovery",
                label: "Have Elena help shape a respectful recovery message with a modest goodwill offer.",
                outcome: "The dealership comes across as accountable instead of combative, even if the customer does not love the answer.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 4,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "price-negotiation-elena-minimal",
                label: "Offer only a dry explanation and move on once the corrected price is stated.",
                outcome: "The dealership sounds more correct than caring, and that tone may travel farther than the typo itself.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -2,
                  reputation: -3,
                  staff: { elena: { morale: -1, trust: -2 } }
                }
              }
            ]
          }
        }
      },
      "public-risk": {
        title: "The screenshot may become the story",
        body: "Even if the in-store conversation settles, the dealership may still face an online accusation that it tried to bait customers with a fake price.",
        consultants: {
          elena: {
            prompt: "Elena wants the dealership to respond calmly before the screenshot defines the store.",
            options: [
              {
                id: "price-public-elena-public",
                label: "Prepare a calm public response and invite the customer into a private resolution path.",
                outcome: "The store does not erase the mistake, but it looks more serious and less slippery online.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 5,
                  staff: { elena: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "price-public-elena-wait",
                label: "Wait and respond only if the customer actually posts.",
                outcome: "The dealership stays quiet longer, but loses the initiative if the screenshot starts moving fast.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: -2,
                  staff: { elena: { morale: -1, trust: -1 } }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants the public story to avoid any wording that sounds like the store admitted more liability than it should.",
            options: [
              {
                id: "price-public-marcus-safe",
                label: "Use Marcus to keep the explanation careful and legally safe while still acknowledging the error.",
                outcome: "The language is cleaner legally, though a little colder emotionally.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    marcus: { morale: 2, trust: 2 },
                    elena: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "price-public-marcus-ignore",
                label: "Ignore the public side and assume the issue stays local to the showroom.",
                outcome: "If the screenshot travels, the dealership looks unprepared and oddly silent.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -4,
                  staff: {
                    marcus: { morale: 0, trust: -1 },
                    elena: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "beatles-blowup",
    category: "Team Conflict",
    pressure: "Moderate",
    headline: "A Beatles argument has turned Nina and Tasha into open workplace enemies",
    body:
      "A break-room debate about whether The Beatles are overrated escalated onto the dealership floor. Nina and Tasha are now refusing to speak unless they absolutely have to, and Jake is enjoying the spectacle far too much.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The music argument is silly, but the professionalism problem is real. Your first move decides whether you cool the people, the audience, or the customer impact.",
        consultants: {
          nina: {
            prompt: "Nina thinks Tasha got way too personal over a dumb opinion and embarrassed her in front of the team.",
            options: [
              {
                id: "beatles-nina-hear",
                label: "Hear Nina out fully before reducing it to 'just music.'",
                outcome: "Nina feels respected, and you get a clearer read on what actually made the argument personal.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 1,
                  staff: { nina: { morale: 2, trust: 3 } }
                }
              },
              {
                id: "beatles-nina-behavior",
                label: "Tell Nina the topic does not matter anymore, only the workplace behavior does.",
                outcome: "The standard gets clearer, though Nina also feels like the emotional side got compressed too fast.",
                nextNodeId: "customer-heard",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    nina: { morale: -1, trust: 1 },
                    tasha: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha says Nina turned a playful take into a personal shot and made her look ridiculous.",
            options: [
              {
                id: "beatles-tasha-hear",
                label: "Hear Tasha out fully and separate the pride issue from the professionalism issue.",
                outcome: "Tasha feels seen, and you keep the dealership from treating service like the automatic problem child.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 1,
                  staff: { tasha: { morale: 2, trust: 3 } }
                }
              },
              {
                id: "beatles-tasha-stop",
                label: "Tell Tasha the argument has to stop now no matter who started it.",
                outcome: "The immediate noise comes down, but the deeper annoyance may harden if nobody feels heard.",
                nextNodeId: "customer-heard",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: { tasha: { morale: -1, trust: 1 } }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake is absolutely treating the whole thing like free entertainment and is pulling other people into it.",
            options: [
              {
                id: "beatles-jake-stop",
                label: "Tell Jake to stop feeding the drama before the whole floor turns into an audience.",
                outcome: "The argument loses some oxygen because the dealership is no longer rewarding it with attention.",
                nextNodeId: "customer-heard",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    nina: { morale: 1, trust: 1 },
                    tasha: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "beatles-jake-let-laugh",
                label: "Let Jake keep it light as long as the actual shouting stops.",
                outcome: "The mood seems easier for a moment, but the dealership starts treating public disrespect like harmless flavor.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    jake: { morale: 2, trust: 0 },
                    nina: { morale: -2, trust: -2 },
                    tasha: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-heard": {
        title: "Customers noticed the tension and now the dealership looks goofy and distracted",
        body: "The store has to decide whether to use humor, apology, or discipline to reset the room.",
        consultants: {
          jake: {
            prompt: "Jake thinks the best move is to laugh once, redirect, and not act like the dealership just had a cultural emergency.",
            options: [
              {
                id: "beatles-customer-jake-defuse",
                label: "Use a quick joke to defuse the moment, then redirect everyone back to work.",
                outcome: "If the tone lands, the store feels human instead of brittle, and the argument loses some power.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 2,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    nina: { morale: 0, trust: 0 },
                    tasha: { morale: 0, trust: 0 }
                  }
                }
              },
              {
                id: "beatles-customer-jake-ignore",
                label: "Pretend nothing happened and hope the awkwardness burns itself out.",
                outcome: "The moment passes faster, but the dealership feels less in control of its own tone.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -2,
                  staff: { jake: { morale: 1, trust: 0 } }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants a simple professional apology and a hard pivot back to customer work.",
            options: [
              {
                id: "beatles-customer-marcus-apology",
                label: "Apologize professionally and move the team back on task immediately.",
                outcome: "The dealership sounds more mature, even if the moment loses some of its accidental charm.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 2, trust: 3 },
                    nina: { morale: 0, trust: 1 },
                    tasha: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "beatles-customer-marcus-pull-away",
                label: "Pull Nina and Tasha away immediately even if the work flow takes a hit.",
                outcome: "The discipline is clear, but the dealership pays a small operational cost for the hard reset.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    marcus: { morale: 1, trust: 2 },
                    nina: { morale: -1, trust: 0 },
                    tasha: { morale: -1, trust: 0 }
                  }
                }
              }
            ]
          }
        }
      },
      "friendship-strain": {
        title: "The argument is cooling down, but the relationship damage could outlast the joke",
        body: "Your next move decides whether the dealership pushes immediate cooperation or actually repairs the working relationship.",
        consultants: {
          nina: {
            prompt: "Nina is willing to be professional, but only if the conversation stops acting like her frustration was trivial.",
            options: [
              {
                id: "beatles-friendship-nina-private-then-joint",
                label: "Speak to both privately first, then bring them together for a short reset.",
                outcome: "It takes more time, but the dealership gets a more durable repair than a forced handshake.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    nina: { morale: 2, trust: 3 },
                    tasha: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "beatles-friendship-nina-immediate",
                label: "Require immediate cooperation and separate the personal issue from work on the spot.",
                outcome: "The dealership gets operational compliance quickly, but the friendship damage stays mostly untreated.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    nina: { morale: -1, trust: 0 },
                    tasha: { morale: -1, trust: 0 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants proof that the store cares about respect, not just about getting everyone quiet again.",
            options: [
              {
                id: "beatles-friendship-tasha-joint-reset",
                label: "Meet with both together and reset expectations around respect, jokes, and public disagreements.",
                outcome: "The conflict does not disappear, but the dealership gets a usable working boundary back.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    tasha: { morale: 2, trust: 2 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "beatles-friendship-tasha-tomorrow",
                label: "Let them cool off for the day and revisit the issue tomorrow when pride is lower.",
                outcome: "The heat drops, but the store loses a little teamwork until the repair conversation actually happens.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    tasha: { morale: 1, trust: 1 },
                    nina: { morale: 0, trust: 0 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "test-drive-ghost",
    category: "Vehicle Control",
    pressure: "High",
    headline: "A customer took a test-drive vehicle and has been gone for five hours",
    body:
      "Jake sent a customer out alone in a used SUV that should have been back in 30 minutes. The customer is not responding, the vehicle is still missing, and ownership wants an answer now.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "The first conversation decides whether this becomes a customer recovery problem, a paperwork problem, or a missing-vehicle incident.",
        consultants: {
          jake: {
            prompt: "Jake is embarrassed, defensive, and insists the customer looked completely legitimate when they left.",
            options: [
              {
                id: "ghost-jake-call-first",
                label: "Have Jake call the customer once more while you review the route and timing.",
                outcome: "You buy a few facts quickly, but the dealership still looks like it let the problem drift too long.",
                nextNodeId: "customer-answers",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 0,
                  staff: { jake: { morale: 1, trust: 1 } }
                }
              },
              {
                id: "ghost-jake-paperwork",
                label: "Sit with Jake and audit every piece of the test-drive paperwork before anyone improvises more.",
                outcome: "The room slows down, but the dealership finally starts acting like this is a real incident.",
                nextNodeId: "paperwork-gap",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: 3,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "ghost-jake-escalate",
                label: "Treat it as a formal incident immediately and tell Jake this is no longer a wait-and-see situation.",
                outcome: "Jake feels the pressure, but the dealership stops pretending the missing vehicle will solve itself.",
                nextNodeId: "incident-escalation",
                effects: {
                  sales: 0,
                  satisfaction: -1,
                  reputation: 4,
                  staff: {
                    jake: { morale: -4, trust: -2 },
                    marcus: { morale: 2, trust: 2 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants to know whether the license copy, insurance proof, and signed release were all captured correctly.",
            options: [
              {
                id: "ghost-marcus-audit",
                label: "Let Marcus audit the file and document the incident before the dealership talks bigger.",
                outcome: "You protect the store from blind panic, but now the paperwork either saves you or exposes you.",
                nextNodeId: "paperwork-gap",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "ghost-marcus-insurance",
                label: "Have Marcus prepare the insurance and incident trail right now in case the vehicle is truly gone.",
                outcome: "The dealership gets legally sharper fast, even if everyone feels the situation just became more serious.",
                nextNodeId: "incident-escalation",
                effects: {
                  sales: 0,
                  satisfaction: -1,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina wants to verify the customer's digital trail, contact info, and whether the lead itself looks real.",
            options: [
              {
                id: "ghost-nina-verify",
                label: "Let Nina verify the customer's contact info and lead history immediately.",
                outcome: "The dealership gets a cleaner picture of who left with the SUV and whether the original lead was solid.",
                nextNodeId: "paperwork-gap",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    nina: { morale: 2, trust: 3 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "ghost-nina-gather",
                label: "Have Nina quietly gather every data point before the dealership confronts anyone.",
                outcome: "You avoid premature drama, but you are still spending more time in discovery than recovery.",
                nextNodeId: "customer-answers",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: { nina: { morale: 2, trust: 2 } }
                }
              }
            ]
          }
        }
      },
      "customer-answers": {
        title: "The customer finally answers, but the explanation may be real or may be cover",
        body: "The customer says they lost track of time and hints the SUV may be making a strange noise. You have to decide whether to de-escalate, press harder, or protect the store first.",
        consultants: {
          tasha: {
            prompt: "Tasha wants to know the symptoms and location before anyone assumes the customer is lying.",
            options: [
              {
                id: "ghost-followup-tasha-recovery",
                label: "Let Tasha guide a professional recovery based on the customer's description.",
                outcome: "If the vehicle really is having trouble, the dealership looks prepared instead of reckless.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    tasha: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "ghost-followup-tasha-doubt",
                label: "Use Tasha only to challenge the story and test whether the breakdown claim makes sense.",
                outcome: "You may catch a lie, but the customer also feels the dealership is moving toward suspicion instead of help.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: 0,
                  staff: {
                    tasha: { morale: 1, trust: 1 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena is already worried this turns into a local joke about the longest test drive in town.",
            options: [
              {
                id: "ghost-followup-elena-contain",
                label: "Ask Elena to prepare a quiet containment plan in case the story starts spreading.",
                outcome: "The dealership stays ready for the reputation side without making the moment even louder.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 4,
                  staff: { elena: { morale: 3, trust: 3 } }
                }
              },
              {
                id: "ghost-followup-elena-ignore",
                label: "Keep Elena out of it and focus only on getting the SUV physically back first.",
                outcome: "You simplify the moment, but the store is flatter-footed if the customer or bystanders start posting.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: -1,
                  staff: { elena: { morale: -1, trust: -1 } }
                }
              }
            ]
          }
        }
      },
      "paperwork-gap": {
        title: "The real danger may be that the store let the vehicle leave without a clean file",
        body: "Marcus finds the test-drive file is incomplete. Now the dealership has to decide whether to fix the process honestly or hide how sloppy the release was.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the incident documented cleanly and the solo-drive process tightened immediately.",
            options: [
              {
                id: "ghost-paperwork-marcus-fix",
                label: "Back Marcus, document the gap, and tighten the release policy immediately.",
                outcome: "It hurts in the short term, but the dealership looks more disciplined and learns from the scare.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    jake: { morale: -3, trust: -2 }
                  }
                }
              },
              {
                id: "ghost-paperwork-marcus-patch",
                label: "Tell Marcus to patch the file quietly and avoid making it a bigger internal story.",
                outcome: "The room calms down faster, but the dealership learns that serious mistakes can be cleaned up after the fact.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: -3,
                  staff: {
                    marcus: { morale: -2, trust: -3 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake wants one chance to fix the aftermath without turning it into a career-defining mistake.",
            options: [
              {
                id: "ghost-paperwork-jake-own",
                label: "Have Jake own the mistake, help document it, and learn the new release standard.",
                outcome: "Jake hates the embarrassment, but the dealership gets accountability without a full public blowup.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    jake: { morale: -1, trust: 2 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "ghost-paperwork-jake-cover",
                label: "Shield Jake from the paperwork fallout and treat it like a shared dealership miss.",
                outcome: "The floor feels protected, but accounting sees another example of standards bending for sales.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 0,
                  reputation: -2,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    marcus: { morale: -3, trust: -3 }
                  }
                }
              }
            ]
          }
        }
      },
      "incident-escalation": {
        title: "The dealership has to decide how formal this becomes",
        body: "The vehicle is still out, ownership is agitated, and the next move determines whether the store looks steady or panicked.",
        consultants: {
          marcus: {
            prompt: "Marcus wants a clean incident trail so the dealership is not improvising if outside parties get involved.",
            options: [
              {
                id: "ghost-incident-marcus-formal",
                label: "Let Marcus formalize the incident and protect the dealership first.",
                outcome: "It is uncomfortable, but the store finally looks in control instead of hopeful.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "ghost-incident-marcus-delay",
                label: "Tell Marcus to wait a little longer before formal escalation.",
                outcome: "You buy a little relational flexibility, but the dealership still looks soft on vehicle control.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    marcus: { morale: -2, trust: -3 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the real risk is that a bizarre story outruns the dealership before the facts are settled.",
            options: [
              {
                id: "ghost-incident-elena-prepare",
                label: "Use Elena to prepare a calm ownership and customer-facing message in case this turns public.",
                outcome: "The store does not look more fun, but it does look more mature if the story leaks.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 4,
                  staff: { elena: { morale: 2, trust: 3 } }
                }
              },
              {
                id: "ghost-incident-elena-skip",
                label: "Keep Elena out of it and treat this strictly as internal risk management.",
                outcome: "The dealership stays focused, but it is slower to shape the reputation side if the story gets silly in public.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: -1,
                  staff: { elena: { morale: -1, trust: -1 } }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "pre-delivery-scratch",
    category: "Delivery Damage",
    pressure: "High",
    headline: "A sold vehicle was scratched in service just hours before delivery",
    body:
      "Tasha was fixing a minor issue on a sold vehicle and accidentally scratched the side panel. The customer is due later today, Jake already promised a smooth handoff, and nobody agrees on whether to disclose it now or try to fix it first.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "Your first conversation decides whether the dealership treats this as a customer-trust issue, a service-quality issue, or a cost problem.",
        consultants: {
          tasha: {
            prompt: "Tasha is upset but honest. She wants to know whether the store values transparency or only speed.",
            options: [
              {
                id: "scratch-tasha-assess",
                label: "Thank Tasha for owning it and assess the damage before anyone makes promises.",
                outcome: "The dealership gets grounded facts first, even if the room gets more nervous while you inspect.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 3,
                  staff: { tasha: { morale: 2, trust: 4 } }
                }
              },
              {
                id: "scratch-tasha-fix-fast",
                label: "Ask Tasha if the scratch can be repaired before pickup without changing the schedule.",
                outcome: "You keep the sale in focus, but the dealership is already leaning toward speed over clarity.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 0,
                  staff: {
                    tasha: { morale: 0, trust: 1 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "scratch-tasha-quiet",
                label: "Tell Tasha to keep it quiet until you decide whether the customer ever needs to hear about it.",
                outcome: "The store may buy time, but the bay now feels pressure to hide a mistake instead of manage it.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    tasha: { morale: -3, trust: -4 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake is terrified of losing the deal and wants the problem solved before the customer ever notices.",
            options: [
              {
                id: "scratch-jake-disclose-plan",
                label: "Tell Jake to prepare for a professional, honest disclosure once the repair options are clear.",
                outcome: "Jake hates it, but the dealership starts acting like customer trust matters more than surprise avoidance.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    jake: { morale: -1, trust: 1 },
                    tasha: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "scratch-jake-buy-time",
                label: "Have Jake buy time with the customer while service sees what can realistically be repaired today.",
                outcome: "The dealership preserves flexibility, but now Jake is walking a dangerous line between helpful and misleading.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 0,
                  staff: { jake: { morale: 2, trust: 1 } }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena sees the review-risk side immediately and wants the customer experience handled with real care.",
            options: [
              {
                id: "scratch-elena-message",
                label: "Ask Elena to help frame a calm, trust-protecting customer conversation.",
                outcome: "The store sounds more thoughtful, even though the operational problem still has to be solved.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 2,
                  satisfaction: 2,
                  reputation: 4,
                  staff: { elena: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "scratch-elena-stay-out",
                label: "Keep Elena out of it and treat the scratch as a pure operations issue.",
                outcome: "The room gets simpler, but the dealership loses some emotional intelligence in the recovery.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -2,
                  staff: { elena: { morale: -2, trust: -2 } }
                }
              }
            ]
          }
        }
      },
      "repair-window": {
        title: "The scratch can be hidden quickly or repaired correctly later",
        body: "Service says a fast touch-up may make the damage less obvious today, but a better repair would take longer. Now the store has to choose honesty, speed, or controlled compromise.",
        consultants: {
          tasha: {
            prompt: "Tasha wants the customer to understand the difference between a same-day touch-up and a proper repair.",
            options: [
              {
                id: "scratch-repair-tasha-honest",
                label: "Use Tasha's assessment and explain the repair reality honestly to the customer.",
                outcome: "The customer may not love the news, but the dealership comes across as credible instead of slippery.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 5,
                  staff: {
                    tasha: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "scratch-repair-tasha-rush",
                label: "Push the quick touch-up and hope the customer never sees what almost happened.",
                outcome: "The handoff may survive today, but the dealership becomes more dependent on quiet fixes than honest recovery.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    tasha: { morale: -2, trust: -3 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus wants a delivery choice that the dealership can afford without inviting a bigger claim later.",
            options: [
              {
                id: "scratch-repair-marcus-delay",
                label: "Delay delivery, repair it properly, and protect the store from a worse comeback later.",
                outcome: "You lose time and maybe some excitement, but the dealership looks more serious about doing things right.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    tasha: { morale: 2, trust: 2 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "scratch-repair-marcus-choice",
                label: "Offer the customer a clear choice between delayed perfection or a same-day goodwill solution.",
                outcome: "The dealership gives up some margin, but gains credibility by letting the customer participate in the recovery.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 4,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 1, trust: 2 },
                    elena: { morale: 2, trust: 2 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-decision": {
        title: "The real test is how directly the dealership talks to the customer",
        body: "The customer is close to pickup time and expects a perfect handoff. Your next move decides whether the store looks honest, evasive, or surprisingly caring.",
        consultants: {
          jake: {
            prompt: "Jake believes he can save the deal if he stays in front of the customer's emotions.",
            options: [
              {
                id: "scratch-customer-jake-own",
                label: "Let Jake apologize directly and own the recovery with a clear plan.",
                outcome: "If Jake stays grounded, the customer may feel personally taken care of instead of managed.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 2,
                  staff: {
                    jake: { morale: 2, trust: 2 },
                    tasha: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "scratch-customer-jake-vague",
                label: "Have Jake buy time with vague delivery language and avoid the real issue for now.",
                outcome: "The moment feels easier for a little while, but the store risks looking deceptive the second the truth surfaces.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -2,
                  reputation: -4,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    elena: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena wants the conversation to sound human, apologetic, and oriented toward saving trust.",
            options: [
              {
                id: "scratch-customer-elena-recovery",
                label: "Use Elena to help shape a recovery package and follow-up plan before the customer arrives.",
                outcome: "The dealership looks organized and sincere instead of surprised and defensive.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 4,
                  reputation: 5,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    jake: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "scratch-customer-elena-minimal",
                label: "Offer only a minimal apology and assume the vehicle itself will do most of the talking.",
                outcome: "The dealership protects margin better, but the customer may feel the emotional damage was dismissed.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    elena: { morale: -1, trust: -1 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "lunch-thief",
    category: "Workplace Culture",
    pressure: "Moderate",
    headline: "Staff think Marcus keeps eating lunches out of the break-room fridge",
    body:
      "For the third time this month, someone's lunch is gone. Today the whispers are all pointing at Marcus. Tasha is furious, Jake is turning it into a joke, and Marcus says the accusation is ridiculous.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This starts as a small issue, but your first move decides whether it becomes a rumor problem, a fairness problem, or an office-culture reset.",
        consultants: {
          marcus: {
            prompt: "Marcus is offended and insists people are blaming him because he is easy to joke about.",
            options: [
              {
                id: "lunch-marcus-private",
                label: "Speak privately with Marcus and ask directly what he knows about the missing lunches.",
                outcome: "You protect Marcus's dignity while still treating the issue like a real team concern.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: { marcus: { morale: 1, trust: 3 } }
                }
              },
              {
                id: "lunch-marcus-warning",
                label: "Warn Marcus that if he is involved, it stops now whether the lunches were labeled or not.",
                outcome: "The message is clear, but Marcus feels more accused than investigated.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    marcus: { morale: -3, trust: -3 },
                    tasha: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha is furious because this is the second time her lunch has disappeared during a long shift.",
            options: [
              {
                id: "lunch-tasha-hear",
                label: "Hear Tasha out and make it clear the break-room issue is not being laughed off.",
                outcome: "Tasha feels backed up, and the bay sees leadership taking even small frustrations seriously.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: { tasha: { morale: 3, trust: 4 } }
                }
              },
              {
                id: "lunch-tasha-proof",
                label: "Tell Tasha not to accuse anyone without proof while you investigate quietly.",
                outcome: "The room gets a little fairer, though the people missing lunches still feel irritated.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    tasha: { morale: -1, trust: 1 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake is absolutely making it worse by treating the whole thing like break-room entertainment.",
            options: [
              {
                id: "lunch-jake-stop",
                label: "Tell Jake to stop fueling the rumor before the joke turns into bullying.",
                outcome: "The room gets a little less loud, and leadership looks more serious about respect.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    marcus: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "lunch-jake-laugh",
                label: "Let the joking continue as long as nobody gets openly cruel.",
                outcome: "It keeps the mood light for a moment, but the dealership gets sloppier about respect.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    jake: { morale: 2, trust: 0 },
                    marcus: { morale: -3, trust: -4 },
                    tasha: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      },
      "policy-reset": {
        title: "The dealership needs a fridge rule or a trust rule",
        body: "Marcus admits he has eaten unlabeled leftovers before, even if he denies taking today's lunch. Now the store needs a policy that fixes the problem without humiliating people.",
        consultants: {
          marcus: {
            prompt: "Marcus wants a simple standard so the issue stops being personal and starts being clear.",
            options: [
              {
                id: "lunch-policy-marcus-clear",
                label: "Set a clear labeling and no-touch policy, then move on without theatrics.",
                outcome: "It is not dramatic, but the dealership gets a professional answer to a petty source of resentment.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 1, trust: 2 },
                    tasha: { morale: 2, trust: 3 },
                    elena: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "lunch-policy-marcus-apology",
                label: "Have Marcus apologize for contributing to the confusion even if he denies taking the lunch in question.",
                outcome: "The gesture repairs some trust, though Marcus feels a little unfairly drafted into symbolic repentance.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    marcus: { morale: -1, trust: 1 },
                    tasha: { morale: 3, trust: 3 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the store needs a quick tone reset so the lunch issue does not linger as a petty identity for the team.",
            options: [
              {
                id: "lunch-policy-elena-humor",
                label: "Use light humor plus a clear rule so the room resets without feeling policed.",
                outcome: "If the delivery lands well, the dealership gets both relief and clarity out of a ridiculous problem.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    elena: { morale: 2, trust: 3 },
                    tasha: { morale: 1, trust: 1 },
                    marcus: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "lunch-policy-elena-heavy",
                label: "Go formal, post a zero-tolerance notice, and make the whole room take the fridge seriously.",
                outcome: "The theft probably stops, but the dealership feels a little overmanaged over something that started with leftovers.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    elena: { morale: -1, trust: 0 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "rumor-room": {
        title: "The bigger issue is now rumor and respect",
        body: "Even if the lunch mystery is never perfectly solved, the dealership still has to decide whether public teasing and whisper networks are acceptable culture.",
        consultants: {
          jake: {
            prompt: "Jake does not think the rumor is a big deal, which is exactly why it keeps spreading.",
            options: [
              {
                id: "lunch-rumor-jake-apology",
                label: "Make Jake apologize for turning a staff complaint into a running joke.",
                outcome: "It is awkward, but the line between humor and disrespect becomes clearer across the store.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    marcus: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "lunch-rumor-jake-ignore",
                label: "Let Jake's joking fade naturally as long as nobody escalates the accusation.",
                outcome: "The room may move on, but it also learns that casual humiliation is tolerated when the topic seems silly enough.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    marcus: { morale: -2, trust: -3 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants proof that management will solve small disrespect before it becomes one more reason people stop trusting the store.",
            options: [
              {
                id: "lunch-rumor-tasha-brief",
                label: "Address the team briefly about respect, property, and not convicting coworkers by rumor.",
                outcome: "The dealership sounds adult again, and the lunch issue stops feeling like a school cafeteria subplot.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    tasha: { morale: 2, trust: 3 },
                    marcus: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "lunch-rumor-tasha-replace-only",
                label: "Replace the lunches and leave the culture lesson for another day.",
                outcome: "People appreciate the gesture, but the room still feels a little petty and unresolved underneath.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 0,
                  staff: {
                    tasha: { morale: 1, trust: 1 },
                    marcus: { morale: 0, trust: 0 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    id: "lot-football-disaster",
    category: "Lot Safety",
    pressure: "High",
    headline: "Tasha crashed into Jake's customer while playing catch on the lot",
    body:
      "Tasha was tossing a football with a waiting service customer and slammed into another customer Jake was actively showing a car to. The customer is angry, the lot is staring, and now the dealership has a professionalism and liability mess at once.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "This is part safety incident, part customer recovery problem, and part staff-judgment issue. Your first move shapes which side gets stabilized first.",
        consultants: {
          tasha: {
            prompt: "Tasha feels terrible but also thinks everyone is acting like a freak accident means she has zero judgment.",
            options: [
              {
                id: "football-tasha-injury",
                label: "Ask Tasha exactly what happened and whether the customer appears hurt.",
                outcome: "You ground the dealership in the actual risk first instead of just the embarrassment.",
                nextNodeId: "injury-concern",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 2,
                  staff: { tasha: { morale: 0, trust: 2 } }
                }
              },
              {
                id: "football-tasha-step-off",
                label: "Tell Tasha to step off the lot immediately while you stabilize the customers.",
                outcome: "The scene gets less chaotic, though Tasha feels very publicly benched.",
                nextNodeId: "deal-danger",
                effects: {
                  sales: 1,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    tasha: { morale: -3, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake is furious because his live customer may now associate the dealership with chaos and getting body-checked by service.",
            options: [
              {
                id: "football-jake-customer-needs",
                label: "Ask Jake what the customer needs right now to stay engaged instead of walking.",
                outcome: "You move the conversation toward recovery instead of blame, which helps if the sale is still alive.",
                nextNodeId: "deal-danger",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 1,
                  staff: { jake: { morale: 2, trust: 2 } }
                }
              },
              {
                id: "football-jake-stay-calm",
                label: "Tell Jake to stay professional and not turn the collision into a public fight.",
                outcome: "The lot cools a little, even if Jake hates not getting to vent in the moment.",
                nextNodeId: "injury-concern",
                effects: {
                  sales: 1,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    tasha: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus sees incident paperwork, liability exposure, and compensation questions the second the customer says their shoulder hurts.",
            options: [
              {
                id: "football-marcus-document",
                label: "Have Marcus start a clean incident record while you stay with the customer.",
                outcome: "The dealership looks more controlled and less improvisational if this turns into a formal complaint.",
                nextNodeId: "injury-concern",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 3,
                  staff: { marcus: { morale: 2, trust: 3 } }
                }
              },
              {
                id: "football-marcus-comp",
                label: "Ask Marcus what kind of goodwill or compensation the store can realistically absorb.",
                outcome: "You get useful guardrails fast, though it may feel like the dealership jumped to money before care.",
                nextNodeId: "deal-danger",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 1, trust: 2 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "injury-concern": {
        title: "The customer may actually be hurt, which changes the whole tone of the event",
        body: "The customer says their shoulder hurts and wants to sit down. Your next move determines whether the dealership looks caring, defensive, or overly casual.",
        consultants: {
          marcus: {
            prompt: "Marcus wants the incident documented and the dealership protected without making the customer feel processed instead of cared for.",
            options: [
              {
                id: "football-injury-marcus-balance",
                label: "Stay with the customer while Marcus documents the basics and prepares for a formal complaint if needed.",
                outcome: "The dealership looks both caring and competent, which is exactly what this kind of moment demands.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 3,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 2, trust: 3 },
                    tasha: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "football-injury-marcus-minimize",
                label: "Minimize the incident as an accident and keep the documentation very light unless the customer pushes.",
                outcome: "The store avoids drama now, but looks much worse if the customer decides the dealership did not take the injury seriously.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: -3,
                  reputation: -5,
                  staff: {
                    marcus: { morale: -1, trust: -2 },
                    tasha: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants to apologize directly and show she did not treat the collision like a joke.",
            options: [
              {
                id: "football-injury-tasha-apology",
                label: "Let Tasha apologize directly once the customer is settled and not overwhelmed.",
                outcome: "The apology helps the moment feel human and accountable instead of corporate and evasive.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 3,
                  staff: { tasha: { morale: 1, trust: 2 } }
                }
              },
              {
                id: "football-injury-tasha-away",
                label: "Keep Tasha away from the customer and manage the apology through leadership instead.",
                outcome: "The interaction becomes safer and more controlled, but also a little less personal.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    tasha: { morale: -2, trust: -1 },
                    jake: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      },
      "deal-danger": {
        title: "Jake's customer is now deciding whether this store feels safe and serious enough to buy from",
        body: "Even if nobody is badly hurt, the sale is wobbling. The dealership needs either a recovery experience or a professionalism reset fast.",
        consultants: {
          jake: {
            prompt: "Jake wants one clean chance to re-center the visit and make the customer feel taken care of instead of collateral damage.",
            options: [
              {
                id: "football-deal-jake-recover",
                label: "Let Jake recover the deal with a direct apology and a calmer, more private vehicle walkaround.",
                outcome: "If Jake keeps the emotion controlled, the sale has a real chance to survive the chaos.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 2,
                  staff: {
                    jake: { morale: 3, trust: 3 },
                    tasha: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "football-deal-jake-goodwill",
                label: "Save the customer experience with a goodwill gesture and immediate move inside.",
                outcome: "The dealership spends some margin, but looks far more serious about recovery than about excuses.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 4,
                  reputation: 4,
                  staff: {
                    jake: { morale: 2, trust: 2 },
                    marcus: { morale: -1, trust: -1 },
                    elena: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena wants the customer to feel the dealership can still be thoughtful even after a ridiculous public mistake.",
            options: [
              {
                id: "football-deal-elena-message",
                label: "Use Elena to shape a calmer recovery message and keep the moment from becoming dealership lore.",
                outcome: "The customer experience feels more intentional, and the store is less likely to get defined by one stupid story.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 5,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    jake: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "football-deal-elena-ignore",
                label: "Keep the recovery bare-bones and assume the customer mainly wants to move on fast.",
                outcome: "The sale may survive, but the dealership misses a chance to turn embarrassment into trust-building.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -1,
                  reputation: -2,
                  staff: { elena: { morale: -1, trust: -1 } }
                }
              }
            ]
          }
        }
      }
    }
  }
];

function dmGetEventLibrary_() {
  return DM_EVENT_TEMPLATES;
}

function dmGetEventPreset_(presetId) {
  return dmGetEventLibrary_().find(function(preset) {
    return preset.id === presetId;
  }) || null;
}

function dmGetNodeDefinition_(preset, nodeId) {
  return preset && preset.nodes ? preset.nodes[nodeId] || null : null;
}
