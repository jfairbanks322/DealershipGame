const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

loadEnvFile();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const RAILWAY_DATA_DIR = "/app/data";
const DATA_DIR = process.env.DATA_DIR
  || process.env.RAILWAY_VOLUME_MOUNT_PATH
  || (fs.existsSync(RAILWAY_DATA_DIR) ? RAILWAY_DATA_DIR : null)
  || path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "dealership-manager.db");
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_COOKIE = "dealership_manager_session";

const DEFAULT_TEACHER_USERNAME = "teacher";
const DEFAULT_TEACHER_PASSWORD = "showroom";
const DEFAULT_SALES_GOAL = 75;
const DEFAULT_STUDENT_STATE = {
  sales: 0,
  satisfaction: 72,
  reputation: 68
};
const SCORE_WEIGHTS = {
  revenue: 0.65,
  morale: 0.25,
  trust: 0.1
};
const REVENUE_TUNING = {
  positiveMultiplier: 3,
  negativeMultiplier: 2,
  cleanExecutionFloor: 2
};
const GLOBAL_EVENT_TEMPLATES = require("./event-templates");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const STAFF_MEMBERS = [
  {
    id: "jake",
    name: "Jake",
    title: "Floor Sales",
    summary: "Big-energy closer who wants freedom, speed, and visible wins.",
    tension: "Gets irritated by rules and long approval chains.",
    defaultMorale: 68,
    defaultTrust: 62,
    preferences: {
      speed: 3,
      autonomy: 2,
      recognition: 3,
      process: -2,
      discipline: -1,
      fairness: 1,
      publicAccountability: -2,
      customerCare: 1
    }
  },
  {
    id: "nina",
    name: "Nina",
    title: "Online Sales",
    summary: "Process-driven lead manager who cares about clean handoffs and follow-up.",
    tension: "Loses patience when people ignore the CRM or steal credit.",
    defaultMorale: 74,
    defaultTrust: 70,
    preferences: {
      process: 3,
      fairness: 3,
      transparency: 2,
      customerCare: 2,
      discipline: 1,
      speed: -1,
      publicAccountability: -1,
      recognition: 1
    }
  },
  {
    id: "marcus",
    name: "Marcus",
    title: "Accounting",
    summary: "Careful, blunt, and protective of margins, paperwork, and policy.",
    tension: "Hates rushed promises that create financial messes later.",
    defaultMorale: 66,
    defaultTrust: 67,
    preferences: {
      discipline: 3,
      transparency: 3,
      process: 2,
      fairness: 1,
      riskControl: 3,
      speed: -2,
      creativity: -1,
      publicAccountability: -1
    }
  },
  {
    id: "tasha",
    name: "Tasha",
    title: "Service Bay",
    summary: "Experienced technician who values realistic timelines and quality work.",
    tension: "Pushes back hard when sales promises work the shop cannot deliver.",
    defaultMorale: 71,
    defaultTrust: 68,
    preferences: {
      quality: 3,
      respect: 3,
      realisticWorkload: 3,
      transparency: 1,
      speed: -2,
      recognition: 1,
      publicAccountability: -1
    }
  },
  {
    id: "elena",
    name: "Elena",
    title: "Marketing",
    summary: "Creative and optimistic promoter who wants the dealership to feel modern.",
    tension: "Gets frustrated when every idea is judged only by same-day numbers.",
    defaultMorale: 75,
    defaultTrust: 69,
    preferences: {
      creativity: 3,
      autonomy: 2,
      customerCare: 2,
      recognition: 1,
      discipline: -1,
      process: -1,
      fairness: 1
    }
  }
];

const SCENARIO_PRESETS = [
  {
    id: "lead-dispute",
    category: "Sales Conflict",
    pressure: "Moderate",
    headline: "Jake and Nina both claim the same customer lead",
    body:
      "Nina says she nurtured the buyer online for two days. Jake says he did the in-person close and should get full credit. The rest of the team is watching how you handle fairness.",
    staffFocus: ["jake", "nina"],
    options: [
      {
        id: "crm-review",
        label: "Pause the argument and review the CRM before assigning credit.",
        outcome: "You slow the room down, verify the timeline, and set a rule that documented lead work matters.",
        effects: {
          sales: 6,
          satisfaction: 2,
          reputation: 4,
          staff: {
            nina: { morale: 6, trust: 8 },
            jake: { morale: -2, trust: 2 },
            marcus: { morale: 2, trust: 3 }
          }
        }
      },
      {
        id: "split-credit",
        label: "Split the deal and move on quickly.",
        outcome: "The fight cools off fast, but nobody feels like the standard is especially clear.",
        effects: {
          sales: 7,
          satisfaction: 1,
          reputation: 1,
          staff: {
            jake: { morale: 2, trust: 1 },
            nina: { morale: 1, trust: 0 }
          }
        }
      },
      {
        id: "closer-wins",
        label: "Give Jake full credit because he closed the customer in person.",
        outcome: "You reward the immediate result, but the online side feels exposed and undercut.",
        effects: {
          sales: 8,
          satisfaction: -1,
          reputation: -3,
          staff: {
            jake: { morale: 5, trust: 4 },
            nina: { morale: -7, trust: -8 },
            elena: { morale: -2, trust: -1 }
          }
        }
      },
      {
        id: "public-warning",
        label: "Warn both employees publicly and demand no more arguing on the floor.",
        outcome: "You restore surface order immediately, but the team reads it as embarrassment instead of leadership.",
        effects: {
          sales: 4,
          satisfaction: -3,
          reputation: -5,
          staff: {
            jake: { morale: -3, trust: -4 },
            nina: { morale: -4, trust: -5 },
            tasha: { morale: -1, trust: -2 },
            elena: { morale: -1, trust: -2 }
          }
        }
      }
    ]
  },
  {
    id: "repair-promise",
    category: "Customer Promise",
    pressure: "High",
    headline: "Jake promised a repair turnaround the service bay cannot hit",
    body:
      "A customer was told their certified SUV would be ready by tomorrow. Tasha says the repair is a three-day job and the bay is already overloaded.",
    staffFocus: ["jake", "tasha"],
    options: [
      {
        id: "reset-customer",
        label: "Call the customer yourself, reset expectations, and back the service timeline.",
        outcome: "You protect trust with the customer and show the service team you will not let them be set up to fail.",
        effects: {
          sales: 5,
          satisfaction: 3,
          reputation: 5,
          staff: {
            tasha: { morale: 6, trust: 8 },
            jake: { morale: -2, trust: 1 },
            marcus: { morale: 2, trust: 3 }
          }
        }
      },
      {
        id: "make-it-happen",
        label: "Tell Tasha to find a way to make the promise happen.",
        outcome: "The customer leaves happy today, but the shop absorbs the stress and resents the pressure.",
        effects: {
          sales: 9,
          satisfaction: 1,
          reputation: -3,
          staff: {
            tasha: { morale: -8, trust: -8 },
            jake: { morale: 4, trust: 3 },
            nina: { morale: -1, trust: -1 }
          }
        }
      },
      {
        id: "approval-rule",
        label: "Pull Jake and Tasha together and create a repair approval rule going forward.",
        outcome: "It takes a little time, but everyone leaves with a clearer operating standard.",
        effects: {
          sales: 6,
          satisfaction: 2,
          reputation: 4,
          staff: {
            jake: { morale: 1, trust: 3 },
            tasha: { morale: 4, trust: 5 },
            nina: { morale: 1, trust: 2 },
            marcus: { morale: 2, trust: 2 }
          }
        }
      }
    ]
  },
  {
    id: "ad-budget",
    category: "Budget Call",
    pressure: "Moderate",
    headline: "Elena wants more ad spend while Marcus says cash discipline matters",
    body:
      "Foot traffic is flat. Elena wants to launch a bold local campaign this weekend. Marcus argues the dealership has already missed two gross-profit targets this month.",
    staffFocus: ["elena", "marcus"],
    options: [
      {
        id: "test-budget",
        label: "Approve a smaller test campaign with a clear success metric.",
        outcome: "You fund the idea without pretending the budget is unlimited, and both departments feel heard.",
        effects: {
          sales: 7,
          satisfaction: 2,
          reputation: 4,
          staff: {
            elena: { morale: 5, trust: 6 },
            marcus: { morale: 2, trust: 4 }
          }
        }
      },
      {
        id: "full-greenlight",
        label: "Approve Elena's full plan and push for fast leads.",
        outcome: "The energy rises quickly, but accounting worries you are rewarding confidence more than discipline.",
        effects: {
          sales: 9,
          satisfaction: 1,
          reputation: -1,
          staff: {
            elena: { morale: 7, trust: 5 },
            marcus: { morale: -5, trust: -6 }
          }
        }
      },
      {
        id: "deny-spend",
        label: "Deny the spend and tell marketing to do more with the current budget.",
        outcome: "You protect the short-term budget, but the team feels like new ideas die at your desk.",
        effects: {
          sales: 4,
          satisfaction: -1,
          reputation: -3,
          staff: {
            elena: { morale: -7, trust: -7 },
            marcus: { morale: 4, trust: 3 }
          }
        }
      }
    ]
  },
  {
    id: "payroll-friction",
    category: "Compensation",
    pressure: "High",
    headline: "Jake says the new bonus structure is unfair",
    body:
      "Jake believes internet leads are being counted in a way that hurts his bonus. Nina says the current structure is the first system that finally protects online work from being swallowed by the showroom.",
    staffFocus: ["jake", "nina", "marcus"],
    options: [
      {
        id: "review-panel",
        label: "Review the plan with Marcus and publish a transparent scorecard.",
        outcome: "You do not solve everything overnight, but you show the team that pay decisions will be explained, not improvised.",
        effects: {
          sales: 6,
          satisfaction: 1,
          reputation: 5,
          staff: {
            jake: { morale: 1, trust: 4 },
            nina: { morale: 2, trust: 5 },
            marcus: { morale: 3, trust: 4 }
          }
        }
      },
      {
        id: "side-with-jake",
        label: "Adjust the bonus plan immediately to keep the floor happy.",
        outcome: "You lower the tension on the showroom side fast, but the online team sees the move as political.",
        effects: {
          sales: 8,
          satisfaction: -1,
          reputation: -3,
          staff: {
            jake: { morale: 6, trust: 5 },
            nina: { morale: -6, trust: -7 },
            marcus: { morale: -2, trust: -3 }
          }
        }
      },
      {
        id: "hold-line",
        label: "Refuse changes and tell everyone the plan is final.",
        outcome: "You protect consistency, but you also tell the staff there is no room for feedback.",
        effects: {
          sales: 4,
          satisfaction: -2,
          reputation: -4,
          staff: {
            jake: { morale: -6, trust: -6 },
            nina: { morale: 1, trust: 0 },
            elena: { morale: -1, trust: -2 }
          }
        }
      }
    ]
  },
  {
    id: "service-backlog",
    category: "Workload",
    pressure: "High",
    headline: "The service bay is overloaded and Tasha says burnout is coming",
    body:
      "Warranty jobs and pre-sale inspections stacked up all week. Tasha wants fewer rush promises. Jake argues delayed reconditioning is already costing deals.",
    staffFocus: ["tasha", "jake", "marcus"],
    options: [
      {
        id: "slow-bookings",
        label: "Reduce intake temporarily and protect the service team's pace.",
        outcome: "You take a short-term hit, but the shop can breathe and quality stays intact.",
        effects: {
          sales: 5,
          satisfaction: 2,
          reputation: 4,
          staff: {
            tasha: { morale: 7, trust: 8 },
            jake: { morale: -3, trust: -1 }
          }
        }
      },
      {
        id: "temporary-help",
        label: "Bring in temporary support and reshuffle priorities for the week.",
        outcome: "The fix costs coordination, but it gives the shop help without stopping the front end cold.",
        effects: {
          sales: 7,
          satisfaction: 3,
          reputation: 3,
          staff: {
            tasha: { morale: 5, trust: 6 },
            marcus: { morale: -1, trust: 0 },
            jake: { morale: 2, trust: 1 }
          }
        }
      },
      {
        id: "push-harder",
        label: "Ask the service team to push through the backlog one more week.",
        outcome: "You keep deals moving right now, but the shop reads it as leadership borrowing against their energy.",
        effects: {
          sales: 9,
          satisfaction: -2,
          reputation: -4,
          staff: {
            tasha: { morale: -9, trust: -8 },
            jake: { morale: 4, trust: 2 },
            marcus: { morale: 1, trust: 0 }
          }
        }
      }
    ]
  },
  {
    id: "online-price",
    category: "Customer Complaint",
    pressure: "Moderate",
    headline: "A buyer says the online price did not match the in-store number",
    body:
      "The customer is angry, Elena worries about a public review, and Marcus says honoring the lower number would erase the front-end gross on the deal.",
    staffFocus: ["nina", "marcus", "elena"],
    options: [
      {
        id: "honor-price",
        label: "Honor the advertised number and own the mistake.",
        outcome: "You lose profit on the deal, but customers and staff see that your word still matters.",
        effects: {
          sales: 6,
          satisfaction: 6,
          reputation: 7,
          staff: {
            nina: { morale: 3, trust: 5 },
            marcus: { morale: -4, trust: -2 },
            elena: { morale: 3, trust: 4 }
          }
        }
      },
      {
        id: "compromise",
        label: "Offer a compromise package instead of the full discount.",
        outcome: "The customer calms down enough to stay engaged, and you protect some margin without looking evasive.",
        effects: {
          sales: 7,
          satisfaction: 3,
          reputation: 4,
          staff: {
            nina: { morale: 1, trust: 2 },
            marcus: { morale: 2, trust: 3 },
            elena: { morale: 2, trust: 3 }
          }
        }
      },
      {
        id: "policy-defense",
        label: "Defend policy and tell the customer the in-store number stands.",
        outcome: "You save margin on paper, but the customer experience and the team's confidence in your judgment both dip.",
        effects: {
          sales: 4,
          satisfaction: -6,
          reputation: -7,
          staff: {
            nina: { morale: -4, trust: -5 },
            marcus: { morale: 3, trust: 2 },
            elena: { morale: -5, trust: -5 }
          }
        }
      }
    ]
  },
  {
    id: "weekend-hours",
    category: "Scheduling",
    pressure: "Moderate",
    headline: "A holiday weekend means everyone wants a different staffing plan",
    body:
      "Jake wants the floor fully staffed for walk-ins. Nina wants staggered digital coverage. Tasha says the shop needs a realistic limit, not wishful scheduling.",
    staffFocus: ["jake", "nina", "tasha"],
    options: [
      {
        id: "shared-plan",
        label: "Create a cross-department schedule with posted coverage expectations.",
        outcome: "It takes a little more planning up front, but the dealership walks into the weekend with fewer surprises.",
        effects: {
          sales: 7,
          satisfaction: 2,
          reputation: 5,
          staff: {
            jake: { morale: 2, trust: 3 },
            nina: { morale: 3, trust: 4 },
            tasha: { morale: 3, trust: 4 }
          }
        }
      },
      {
        id: "floor-first",
        label: "Prioritize the sales floor and tell the other teams to adjust around it.",
        outcome: "The showroom gets what it wants, but support teams feel they are once again the ones absorbing the cost.",
        effects: {
          sales: 8,
          satisfaction: -1,
          reputation: -3,
          staff: {
            jake: { morale: 5, trust: 4 },
            nina: { morale: -4, trust: -4 },
            tasha: { morale: -5, trust: -4 }
          }
        }
      },
      {
        id: "strict-limits",
        label: "Cap weekend activity to protect workload and avoid overtime.",
        outcome: "The dealership stays controlled, but some obvious selling opportunities walk out the door.",
        effects: {
          sales: 5,
          satisfaction: 1,
          reputation: 2,
          staff: {
            jake: { morale: -4, trust: -2 },
            nina: { morale: 1, trust: 1 },
            tasha: { morale: 4, trust: 5 },
            marcus: { morale: 2, trust: 2 }
          }
        }
      }
    ]
  },
  {
    id: "brand-partnership",
    category: "Promotion",
    pressure: "Moderate",
    headline: "Elena has a local influencer partnership idea that could boost traffic fast",
    body:
      "The campaign would be loud, local, and risky. Marcus is skeptical. Jake loves the attention. Nina wants clear lead tracking before money moves.",
    staffFocus: ["elena", "jake", "nina", "marcus"],
    options: [
      {
        id: "pilot-with-tracking",
        label: "Approve the partnership but require trackable offers and lead tags.",
        outcome: "You give marketing room to run while still protecting the dealership from fuzzy reporting.",
        effects: {
          sales: 8,
          satisfaction: 2,
          reputation: 4,
          staff: {
            elena: { morale: 5, trust: 6 },
            nina: { morale: 3, trust: 4 },
            marcus: { morale: 1, trust: 3 },
            jake: { morale: 2, trust: 1 }
          }
        }
      },
      {
        id: "full-send",
        label: "Launch it immediately and worry about tracking later.",
        outcome: "The energy spike is real, but so is the confusion when the team tries to sort out who owns the new business.",
        effects: {
          sales: 10,
          satisfaction: 0,
          reputation: -2,
          staff: {
            elena: { morale: 7, trust: 4 },
            nina: { morale: -4, trust: -5 },
            marcus: { morale: -4, trust: -5 },
            jake: { morale: 4, trust: 2 }
          }
        }
      },
      {
        id: "pass-for-now",
        label: "Pass on the idea and stay focused on proven channels.",
        outcome: "You keep the process tidy, but the store loses some creative momentum.",
        effects: {
          sales: 4,
          satisfaction: 0,
          reputation: -2,
          staff: {
            elena: { morale: -6, trust: -6 },
            marcus: { morale: 3, trust: 2 }
          }
        }
      }
    ]
  },
  {
    id: "cash-gap",
    category: "Financial Control",
    pressure: "High",
    headline: "Marcus found a paperwork gap that could delay three deals funding",
    body:
      "Sales wants the deals delivered today. Marcus says the lender packets are incomplete and the store could eat a painful chargeback if you rush it.",
    staffFocus: ["marcus", "jake", "nina"],
    options: [
      {
        id: "pause-deliveries",
        label: "Pause the deliveries, fix the files, and explain the delay clearly.",
        outcome: "You trade speed for discipline, but you protect the dealership from avoidable damage.",
        effects: {
          sales: 5,
          satisfaction: 2,
          reputation: 6,
          staff: {
            marcus: { morale: 5, trust: 7 },
            jake: { morale: -4, trust: -2 },
            nina: { morale: 1, trust: 1 }
          }
        }
      },
      {
        id: "deliver-anyway",
        label: "Push the deals through and tell Marcus to patch the files after.",
        outcome: "You book the immediate deliveries, but the office sees you gambling with dealership credibility.",
        effects: {
          sales: 10,
          satisfaction: -1,
          reputation: -7,
          staff: {
            marcus: { morale: -8, trust: -9 },
            jake: { morale: 5, trust: 4 },
            nina: { morale: -2, trust: -2 }
          }
        }
      },
      {
        id: "team-audit",
        label: "Assign a fast cross-team audit and release the clean deals first.",
        outcome: "The solution is messier than a simple yes or no, but it keeps the store moving without abandoning standards.",
        effects: {
          sales: 7,
          satisfaction: 2,
          reputation: 4,
          staff: {
            marcus: { morale: 3, trust: 5 },
            jake: { morale: 1, trust: 1 },
            nina: { morale: 2, trust: 3 }
          }
        }
      }
    ]
  },
  {
    id: "review-spike",
    category: "Reputation",
    pressure: "Moderate",
    headline: "Three negative reviews hit at once and staff disagree on the response",
    body:
      "Elena wants a public response plan, Jake wants to call the customers directly, and Nina thinks the store needs a follow-up process before saying anything online.",
    staffFocus: ["elena", "jake", "nina"],
    options: [
      {
        id: "public-and-private",
        label: "Respond publicly with empathy and assign direct follow-up calls.",
        outcome: "You show the public the store is listening while giving the team a concrete recovery plan.",
        effects: {
          sales: 7,
          satisfaction: 5,
          reputation: 7,
          staff: {
            elena: { morale: 4, trust: 5 },
            jake: { morale: 2, trust: 2 },
            nina: { morale: 3, trust: 4 }
          }
        }
      },
      {
        id: "call-only",
        label: "Handle everything privately and stay quiet online.",
        outcome: "Some customers may appreciate the personal touch, but the public story remains unanswered.",
        effects: {
          sales: 6,
          satisfaction: 2,
          reputation: 1,
          staff: {
            jake: { morale: 3, trust: 3 },
            elena: { morale: -3, trust: -4 },
            nina: { morale: 1, trust: 1 }
          }
        }
      },
      {
        id: "defend-store",
        label: "Push back and defend the dealership's side of the story.",
        outcome: "The team sees decisiveness, but customers read the tone as defensive and cold.",
        effects: {
          sales: 4,
          satisfaction: -5,
          reputation: -8,
          staff: {
            elena: { morale: -5, trust: -6 },
            nina: { morale: -2, trust: -3 },
            jake: { morale: 1, trust: 0 }
          }
        }
      }
    ]
  }
];

const UNUSED_LEGACY_EVENT_TEMPLATES = [
  {
    id: "delivery-breakdown",
    category: "Delivery Breakdown",
    pressure: "High",
    headline: "A same-day delivery promise is collapsing across the dealership",
    body:
      "A customer is furious that their vehicle is not ready, the paperwork packet is missing one lender document, and the team is already blaming each other in front of weekend traffic.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you talk to first?",
        body: "Your first conversation shapes what kind of problem this becomes: customer trust issue, service issue, or process issue.",
        consultants: {
          jake: {
            prompt: "Jake wants to save the delivery right now and hates slowing things down.",
            options: [
              {
                id: "jake-pressure-shop",
                label: "Tell Jake to keep the customer hot while service pushes the car out today.",
                outcome: "Jake buys time with the customer, but the store is now leaning on speed instead of certainty.",
                nextNodeId: "service-aftershock",
                effects: {
                  sales: 8,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    jake: { morale: 3, trust: 2 },
                    tasha: { morale: -5, trust: -4 }
                  }
                }
              },
              {
                id: "jake-reset-expectation",
                label: "Have Jake reset the expectation and stop promising delivery times he cannot confirm.",
                outcome: "Jake is annoyed, but the situation stays grounded in reality instead of bravado.",
                nextNodeId: "customer-recovery",
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    jake: { morale: -3, trust: 0 },
                    tasha: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "jake-offer-freebie",
                label: "Let Jake keep the delivery alive with a free accessory package.",
                outcome: "The customer may stay in the deal, but you are masking a systems issue with giveaway money.",
                nextNodeId: "paperwork-scramble",
                effects: {
                  sales: 6,
                  satisfaction: 2,
                  reputation: 0,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    marcus: { morale: -2, trust: -3 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina sees the CRM trail and believes the handoff failed long before the customer arrived.",
            options: [
              {
                id: "nina-trace-handoff",
                label: "Let Nina map the full lead handoff and show where the dealership lost control.",
                outcome: "You get clarity fast, but now the team needs to answer for a broken process in public view.",
                nextNodeId: "internal-blowback",
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    nina: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "nina-customer-update",
                label: "Have Nina take over communication and give the customer a clean written update.",
                outcome: "The customer finally gets a coherent message, but the floor team feels exposed.",
                nextNodeId: "customer-recovery",
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 4,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "nina-document-first",
                label: "Pause everything until Nina verifies what was promised and what is missing.",
                outcome: "You slow the moment down, but you stop the dealership from improvising blind.",
                nextNodeId: "paperwork-scramble",
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    nina: { morale: 4, trust: 5 },
                    marcus: { morale: 2, trust: 2 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus says the lender packet is incomplete and the store will be eating risk if delivery happens now.",
            options: [
              {
                id: "marcus-stop-delivery",
                label: "Back Marcus and stop the delivery until the lender packet is clean.",
                outcome: "The customer is unhappy, but the dealership is no longer gambling with funding risk.",
                nextNodeId: "customer-recovery",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    jake: { morale: -3, trust: -2 }
                  }
                }
              },
              {
                id: "marcus-partial-release",
                label: "Ask Marcus what can be fixed quickly enough to keep part of the deal moving.",
                outcome: "You avoid a full shutdown, but now the office is rushing under pressure.",
                nextNodeId: "paperwork-scramble",
                effects: {
                  sales: 5,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 0, trust: 2 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "marcus-deliver-anyway",
                label: "Tell Marcus to worry about the paperwork after the customer takes the vehicle.",
                outcome: "The delivery may happen, but the financial risk gets pushed downstream into your dealership.",
                nextNodeId: "funding-fallout",
                effects: {
                  sales: 9,
                  satisfaction: 0,
                  reputation: -4,
                  staff: {
                    marcus: { morale: -6, trust: -7 },
                    jake: { morale: 3, trust: 2 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha says the vehicle is not actually ready and the shop is tired of being volunteered for miracles.",
            options: [
              {
                id: "tasha-back-shop",
                label: "Back Tasha publicly and refuse to release the vehicle until the work is right.",
                outcome: "You protect quality, but now someone has to repair the customer relationship.",
                nextNodeId: "customer-recovery",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 5,
                  staff: {
                    tasha: { morale: 5, trust: 6 },
                    jake: { morale: -3, trust: -3 }
                  }
                }
              },
              {
                id: "tasha-quick-fix",
                label: "Ask Tasha what minimum work can be completed to preserve the delivery window.",
                outcome: "You buy options, but now the store is walking a line between quality and speed.",
                nextNodeId: "service-aftershock",
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 0,
                  staff: {
                    tasha: { morale: -1, trust: 1 },
                    jake: { morale: 2, trust: 1 }
                  }
                }
              },
              {
                id: "tasha-rush-order",
                label: "Tell Tasha the shop has to absorb the pain and get the car out today.",
                outcome: "You may save the delivery, but the service team reads it as another example of being sacrificed for sales.",
                nextNodeId: "service-aftershock",
                effects: {
                  sales: 8,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    tasha: { morale: -7, trust: -6 },
                    jake: { morale: 3, trust: 2 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena is already thinking about the review risk and how fast a delivery complaint could spread online.",
            options: [
              {
                id: "elena-reputation-plan",
                label: "Ask Elena for a containment plan before the customer posts publicly.",
                outcome: "You start protecting the dealership's reputation immediately, but the internal issue still has to be solved.",
                nextNodeId: "customer-recovery",
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    elena: { morale: 4, trust: 4 },
                    marcus: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "elena-stall-social",
                label: "Have Elena keep the customer calm with VIP treatment and follow-up messaging.",
                outcome: "The customer feels seen, but the real dealership issue is still moving under the surface.",
                nextNodeId: "internal-blowback",
                effects: {
                  sales: 5,
                  satisfaction: 3,
                  reputation: 2,
                  staff: {
                    elena: { morale: 3, trust: 3 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "elena-wait",
                label: "Tell Elena not to touch it until the dealership decides what actually happened.",
                outcome: "You avoid overcommunicating too early, but you lose the chance to shape the story.",
                nextNodeId: "paperwork-scramble",
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    elena: { morale: -2, trust: -2 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-recovery": {
        title: "The customer will either stay with the store or turn into a public problem",
        body: "Now that the dealership understands the issue, you need someone to stabilize the customer-facing side before the entire event turns into a review spiral.",
        consultants: {
          nina: {
            prompt: "Nina wants to own the update, document every promise, and remove ambiguity.",
            options: [
              {
                id: "nina-clean-timeline",
                label: "Let Nina send a clean timeline and ownership plan for the deal.",
                outcome: "The customer gets clarity, and the store regains a little professionalism.",
                nextNodeId: null,
                effects: {
                  sales: 6,
                  satisfaction: 4,
                  reputation: 4,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "nina-assign-followup",
                label: "Have Nina coordinate the handoff but keep Jake as the customer face.",
                outcome: "It is messier than a single owner, but both sides stay involved and the deal has a chance to recover.",
                nextNodeId: null,
                effects: {
                  sales: 7,
                  satisfaction: 2,
                  reputation: 2,
                  staff: {
                    nina: { morale: 2, trust: 2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "nina-note-only",
                label: "Use Nina only for documentation and hope the customer settles down on their own.",
                outcome: "The file gets cleaner, but the customer feels the dealership is talking to itself instead of to them.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -2,
                  reputation: -2,
                  staff: {
                    nina: { morale: 1, trust: 1 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake wants to save the relationship personally and turn the problem into a save.",
            options: [
              {
                id: "jake-own-recovery",
                label: "Let Jake own the apology and earn the deal back face to face.",
                outcome: "If Jake controls his tone, the customer may stay because someone finally took responsibility.",
                nextNodeId: null,
                effects: {
                  sales: 8,
                  satisfaction: 2,
                  reputation: 1,
                  staff: {
                    jake: { morale: 3, trust: 2 },
                    nina: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "jake-gift-card",
                label: "Let Jake save the deal with more concessions and a premium handoff.",
                outcome: "The customer may stay, but the store is paying to cover leadership mistakes.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 4,
                  reputation: 0,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    marcus: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "jake-tough-love",
                label: "Tell Jake to be direct and stop over-explaining the delay.",
                outcome: "A blunt delivery may save time, but it also risks making the customer feel dismissed.",
                nextNodeId: "reputation-aftershock",
                effects: {
                  sales: 4,
                  satisfaction: -3,
                  reputation: -4,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    elena: { morale: -2, trust: -3 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena is focused on preventing a visible review spiral and wants a reputation-safe recovery.",
            options: [
              {
                id: "elena-vip-recovery",
                label: "Use Elena to shape a customer recovery package and protect the public story.",
                outcome: "The customer feels the dealership is trying to make things right before the story spills outward.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 5,
                  reputation: 5,
                  staff: {
                    elena: { morale: 4, trust: 4 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "elena-script-only",
                label: "Ask Elena for language but keep everyone else handling the real recovery.",
                outcome: "The message improves, but ownership still feels split across the store.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    elena: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "elena-postpone",
                label: "Delay all customer-facing recovery until the internal issue is perfectly cleaned up.",
                outcome: "The store sounds careful, but the silence gives frustration more room to grow.",
                nextNodeId: "reputation-aftershock",
                effects: {
                  sales: 2,
                  satisfaction: -3,
                  reputation: -5,
                  staff: {
                    elena: { morale: -2, trust: -2 },
                    nina: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "service-aftershock": {
        title: "The shop feels dumped on and the next issue is internal",
        body: "Even if the customer is still in play, your dealership now has an internal service-versus-sales problem that can spill into the rest of the weekend.",
        consultants: {
          tasha: {
            prompt: "Tasha wants a real boundary, not another speech about teamwork.",
            options: [
              {
                id: "tasha-new-rule",
                label: "Create a no-promise rule without service signoff.",
                outcome: "The bay finally feels protected, and future chaos becomes a little less likely.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    tasha: { morale: 5, trust: 6 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "tasha-one-time-push",
                label: "Ask Tasha for one last push and promise to revisit workload after the weekend.",
                outcome: "The bay may comply once, but only if the team believes you mean the follow-up.",
                nextNodeId: "internal-blowback",
                effects: {
                  sales: 6,
                  satisfaction: 0,
                  reputation: -1,
                  staff: {
                    tasha: { morale: -2, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "tasha-suck-it-up",
                label: "Tell Tasha the dealership cannot stop for one angry shift.",
                outcome: "You might keep things moving now, but resentment hardens inside the shop.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: -2,
                  reputation: -4,
                  staff: {
                    tasha: { morale: -6, trust: -7 },
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus thinks the real answer is policy discipline, not emotional repair.",
            options: [
              {
                id: "marcus-escalation-policy",
                label: "Put a signoff checkpoint in place for delivery promises and rush repairs.",
                outcome: "It slows the floor slightly, but it protects the dealership from repeating the same failure.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    tasha: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "marcus-measure-loss",
                label: "Ask Marcus to quantify the real cost so the team understands what this chaos is doing.",
                outcome: "The numbers make the conflict less personal and more visible to everyone.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 0,
                  reputation: 3,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "marcus-stay-out",
                label: "Keep Marcus out of it and let sales and service sort it out themselves.",
                outcome: "You avoid another voice in the conflict, but the dealership loses the chance to set a real standard.",
                nextNodeId: "internal-blowback",
                effects: {
                  sales: 5,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    marcus: { morale: -2, trust: -2 },
                    tasha: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the store also needs to manage what the weekend team is hearing and saying about the situation.",
            options: [
              {
                id: "elena-team-message",
                label: "Have Elena help frame the recovery so the team hears one clear message.",
                outcome: "The dealership feels more coordinated, even if the underlying tension is still there.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    elena: { morale: 3, trust: 3 },
                    tasha: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "elena-customer-first",
                label: "Keep Elena focused only on the customer-facing story and ignore the internal fallout.",
                outcome: "The external optics improve, but the store remains split underneath.",
                nextNodeId: "internal-blowback",
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 1,
                  staff: {
                    elena: { morale: 2, trust: 2 },
                    tasha: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "elena-hold",
                label: "Tell Elena this is not a messaging problem and keep her out of it.",
                outcome: "You keep the issue operational, but the team loses someone who could have helped contain the tone.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    elena: { morale: -3, trust: -3 }
                  }
                }
              }
            ]
          }
        }
      },
      "paperwork-scramble": {
        title: "The dealership found the paper trail gap, but time is still working against you",
        body: "The next issue is whether the store cleans up the paperwork with discipline or starts improvising around it.",
        consultants: {
          marcus: {
            prompt: "Marcus wants to slow everything down long enough to protect funding.",
            options: [
              {
                id: "marcus-fix-and-explain",
                label: "Fix the file fully and explain the delay clearly to everyone involved.",
                outcome: "The dealership looks less fast, but more credible and controlled.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 2,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    nina: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "marcus-triage",
                label: "Tell Marcus to triage only what is necessary to keep the deal moving.",
                outcome: "The immediate problem may clear, but the dealership learns that process standards bend under pressure.",
                nextNodeId: "funding-fallout",
                effects: {
                  sales: 6,
                  satisfaction: 0,
                  reputation: -1,
                  staff: {
                    marcus: { morale: -1, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "marcus-hide-gap",
                label: "Minimize the gap and push the store to act like everything is fine.",
                outcome: "That may keep the moment alive, but it stores risk instead of resolving it.",
                nextNodeId: "funding-fallout",
                effects: {
                  sales: 8,
                  satisfaction: -1,
                  reputation: -5,
                  staff: {
                    marcus: { morale: -5, trust: -6 },
                    nina: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina wants the file and customer timeline aligned so the handoff stops breaking.",
            options: [
              {
                id: "nina-rebuild-handoff",
                label: "Use Nina to rebuild the handoff from lead to delivery and patch the process.",
                outcome: "It is not glamorous, but the dealership stops losing control between departments.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    nina: { morale: 4, trust: 5 },
                    marcus: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "nina-customer-buffer",
                label: "Keep Nina on customer updates while everyone else races the file.",
                outcome: "The customer stays calmer, but the internal process still depends on pressure.",
                nextNodeId: "funding-fallout",
                effects: {
                  sales: 6,
                  satisfaction: 2,
                  reputation: 1,
                  staff: {
                    nina: { morale: 2, trust: 2 },
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "nina-side-channel",
                label: "Let Nina solve it through unofficial workarounds and favors.",
                outcome: "It may work today, but it teaches the dealership to depend on side channels instead of standards.",
                nextNodeId: null,
                effects: {
                  sales: 6,
                  satisfaction: 0,
                  reputation: -2,
                  staff: {
                    nina: { morale: 1, trust: 0 },
                    marcus: { morale: -2, trust: -3 }
                  }
                }
              }
            ]
          }
        }
      },
      "internal-blowback": {
        title: "The original customer problem is turning into a dealership culture problem",
        body: "Your next move determines whether the event becomes a one-day conflict or a lasting scar between departments.",
        consultants: {
          marcus: {
            prompt: "Marcus wants standards written down before everyone rewrites the story in their own favor.",
            options: [
              {
                id: "blowback-scorecard",
                label: "Document the failure points and create a clear accountability rule.",
                outcome: "It is uncomfortable, but the store comes out with a cleaner operating standard.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 5,
                  staff: {
                    marcus: { morale: 4, trust: 4 },
                    nina: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "blowback-soften",
                label: "Ask Marcus to keep it quiet so the team can move on without more tension.",
                outcome: "The room calms down faster, but the dealership learns less from the failure.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 0,
                  reputation: -1,
                  staff: {
                    marcus: { morale: -2, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the team needs one visible recovery message or the story will keep mutating.",
            options: [
              {
                id: "blowback-reset-tone",
                label: "Use Elena to reset the tone and frame the recovery for the staff.",
                outcome: "The dealership becomes less reactive because people finally hear the same message.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    elena: { morale: 3, trust: 3 },
                    tasha: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "blowback-skip",
                label: "Keep Elena out of it and let the departments cool off on their own.",
                outcome: "Nothing explodes right away, but the resentment stays under the floorboards.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    elena: { morale: -2, trust: -2 },
                    tasha: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants proof that the store understands what it costs the bay every time this happens.",
            options: [
              {
                id: "blowback-back-bay",
                label: "Back Tasha and redesign the promise flow around real shop capacity.",
                outcome: "You give the bay something concrete, and morale damage stops spreading as fast.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    tasha: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "blowback-balance",
                label: "Tell Tasha the solution has to protect sales and service equally.",
                outcome: "The answer sounds fair, but the bay may hear it as another delay instead of a fix.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    tasha: { morale: -1, trust: -1 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          }
        }
      },
      "funding-fallout": {
        title: "The hidden risk is now financial",
        body: "Because the dealership kept moving without a clean foundation, the issue has turned into a funding and credibility problem.",
        consultants: {
          marcus: {
            prompt: "Marcus wants to contain the damage before it turns into a store-wide margin hit.",
            options: [
              {
                id: "funding-mar-stop",
                label: "Let Marcus stop the damage and rebuild the file the right way.",
                outcome: "You lose momentum, but you stop a much worse financial hit from compounding.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 4, trust: 5 }
                  }
                }
              },
              {
                id: "funding-mar-minimize",
                label: "Ask Marcus to minimize the hit quietly and keep the front end selling.",
                outcome: "The weekend survives, but the dealership absorbs a quiet margin leak and weaker standards.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    marcus: { morale: -2, trust: -3 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the damage can still be contained if the customer and file stay synchronized from here.",
            options: [
              {
                id: "funding-nina-sync",
                label: "Use Nina to keep the customer aligned while the file is corrected.",
                outcome: "The problem becomes survivable because the dealership finally moves in one direction.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 3,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "funding-nina-spin",
                label: "Have Nina smooth it over with updates while the store keeps improvising.",
                outcome: "The communication sounds better than the reality, and that gap eventually costs trust.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: -1,
                  staff: {
                    nina: { morale: 1, trust: 1 },
                    marcus: { morale: -1, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      },
      "reputation-aftershock": {
        title: "The dealership now has a review problem on top of everything else",
        body: "A frustrated customer or bystander is about to shape the public version of the story unless someone handles it well.",
        consultants: {
          elena: {
            prompt: "Elena wants to intervene before the complaint becomes the dealership's new first impression.",
            options: [
              {
                id: "rep-elena-recover",
                label: "Have Elena lead a calm recovery and public-response plan.",
                outcome: "The dealership does not erase the mistake, but it looks more serious about fixing it.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 4,
                  reputation: 6,
                  staff: {
                    elena: { morale: 4, trust: 4 }
                  }
                }
              },
              {
                id: "rep-elena-delay",
                label: "Tell Elena to wait until the customer actually posts.",
                outcome: "The store reacts too late, and the public version of the story gets shaped elsewhere.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: -2,
                  reputation: -5,
                  staff: {
                    elena: { morale: -2, trust: -3 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake wants to call the customer directly and try to win them back with pure sales instinct.",
            options: [
              {
                id: "rep-jake-call",
                label: "Let Jake try to win the customer back personally.",
                outcome: "The save might work if the tone is right, but it also risks another overpromise.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 0,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "rep-jake-backoff",
                label: "Keep Jake away from the customer and handle the recovery more carefully.",
                outcome: "You lose some sales flair, but the store avoids turning a frustration into another aggressive moment.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    jake: { morale: -2, trust: -1 },
                    elena: { morale: 1, trust: 1 }
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
    id: "promo-overload",
    category: "Promo Overload",
    pressure: "High",
    headline: "A weekend campaign worked too well and now the dealership cannot absorb the traffic cleanly",
    body:
      "Lead volume spiked, the floor is double-booking appointments, the service lane is getting surprise walk-ins, and accounting says the store is promising numbers it cannot support.",
    rootNodeId: "opening",
    nodes: {
      opening: {
        title: "Who do you go to first?",
        body: "The dealership is not failing in one place. Your first conversation decides whether you chase the traffic, the process gap, or the margin risk.",
        consultants: {
          elena: {
            prompt: "Elena sees huge momentum and wants to protect the promotion while the store still has attention.",
            options: [
              {
                id: "promo-elena-ride-wave",
                label: "Keep the campaign running and figure out the chaos behind it.",
                outcome: "Traffic stays hot, but the store is now under pressure to prove it can execute.",
                nextNodeId: "capacity-crack",
                effects: {
                  sales: 9,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    elena: { morale: 4, trust: 4 },
                    nina: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "promo-elena-throttle",
                label: "Ask Elena to throttle the campaign until operations can breathe.",
                outcome: "You protect the store from collapse, but some obvious demand cools off.",
                nextNodeId: "capacity-crack",
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    elena: { morale: -2, trust: 0 },
                    tasha: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "promo-elena-segment",
                label: "Have Elena segment the promotion so only the best-fit leads keep coming through.",
                outcome: "You lose some volume, but the dealership gains a chance to handle demand more intelligently.",
                nextNodeId: "lead-ownership",
                effects: {
                  sales: 6,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    nina: { morale: 2, trust: 2 }
                  }
                }
              }
            ]
          },
          nina: {
            prompt: "Nina thinks the real problem is that the dealership has lost control of lead routing and confirmations.",
            options: [
              {
                id: "promo-nina-lock-crm",
                label: "Put Nina in charge of all incoming lead routing and confirmations for the day.",
                outcome: "The store becomes more coordinated immediately, but the floor resents the tighter gatekeeping.",
                nextNodeId: "lead-ownership",
                effects: {
                  sales: 6,
                  satisfaction: 2,
                  reputation: 4,
                  staff: {
                    nina: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "promo-nina-workaround",
                label: "Ask Nina to patch the system quietly without changing how the floor works.",
                outcome: "The day survives, but the dealership learns to rely on quiet heroics instead of structure.",
                nextNodeId: "margin-slip",
                effects: {
                  sales: 7,
                  satisfaction: 1,
                  reputation: -1,
                  staff: {
                    nina: { morale: 1, trust: 1 },
                    jake: { morale: 1, trust: 0 }
                  }
                }
              },
              {
                id: "promo-nina-customer-first",
                label: "Have Nina slow the intake enough to protect accurate customer follow-up.",
                outcome: "The store looks more controlled, even though some raw traffic gets turned away.",
                nextNodeId: "customer-expectation",
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 4,
                  staff: {
                    nina: { morale: 3, trust: 4 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the dealership should embrace the chaos and close as many deals as possible while demand is hot.",
            options: [
              {
                id: "promo-jake-floor-all-in",
                label: "Let Jake pack the floor and focus on pure conversion.",
                outcome: "You may spike volume, but the store is now depending on aggressive improvisation.",
                nextNodeId: "margin-slip",
                effects: {
                  sales: 10,
                  satisfaction: -2,
                  reputation: -2,
                  staff: {
                    jake: { morale: 4, trust: 3 },
                    marcus: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "promo-jake-appointments-only",
                label: "Tell Jake the floor only gets confirmed appointments and qualified walk-ins.",
                outcome: "The store feels less explosive, but the team handles each customer with more control.",
                nextNodeId: "customer-expectation",
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    jake: { morale: -2, trust: -1 },
                    nina: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "promo-jake-blame-system",
                label: "Let Jake keep selling while everyone else cleans up the system behind him.",
                outcome: "That protects Jake's speed, but the rest of the store starts feeling like support staff for one department.",
                nextNodeId: "capacity-crack",
                effects: {
                  sales: 8,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    jake: { morale: 3, trust: 2 },
                    nina: { morale: -3, trust: -3 },
                    tasha: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      },
      "capacity-crack": {
        title: "The store's capacity is the next problem",
        body: "The promotion did its job. Now the dealership has to decide whether to protect customer expectations or keep betting on raw volume.",
        consultants: {
          tasha: {
            prompt: "Tasha says operations are already stretched and the service lane cannot absorb sales promises by magic.",
            options: [
              {
                id: "cap-tasha-capacity",
                label: "Let Tasha define the real operational capacity for the weekend.",
                outcome: "The dealership becomes more honest, and fewer promises collapse later.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: 3,
                  reputation: 5,
                  staff: {
                    tasha: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "cap-tasha-push",
                label: "Push Tasha to absorb one more surge and sort it out after the weekend.",
                outcome: "The store keeps moving, but the service team absorbs the cost emotionally and operationally.",
                nextNodeId: null,
                effects: {
                  sales: 7,
                  satisfaction: -2,
                  reputation: -4,
                  staff: {
                    tasha: { morale: -6, trust: -6 },
                    jake: { morale: 2, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena thinks the campaign can be reshaped instead of shut down completely.",
            options: [
              {
                id: "cap-elena-reshape",
                label: "Use Elena to reshape the offer around what the dealership can actually deliver.",
                outcome: "The store loses some volume but protects the value of the promotion and the customer experience.",
                nextNodeId: null,
                effects: {
                  sales: 6,
                  satisfaction: 3,
                  reputation: 4,
                  staff: {
                    elena: { morale: 3, trust: 4 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "cap-elena-ignore",
                label: "Keep Elena chasing volume and hope operations catches up.",
                outcome: "The marketing win keeps growing while the actual dealership gets shakier underneath it.",
                nextNodeId: null,
                effects: {
                  sales: 8,
                  satisfaction: -2,
                  reputation: -3,
                  staff: {
                    elena: { morale: 2, trust: 1 },
                    tasha: { morale: -3, trust: -3 }
                  }
                }
              }
            ]
          }
        }
      },
      "lead-ownership": {
        title: "The next fight is over who owns the opportunity",
        body: "Now that the dealership has some structure back, the floor and online team are watching whether your system feels fair.",
        consultants: {
          nina: {
            prompt: "Nina wants clean ownership rules before the day turns into a credit war.",
            options: [
              {
                id: "lead-nina-rule",
                label: "Back Nina's ownership rules and enforce documented lead claims.",
                outcome: "The system becomes clearer and future lead disputes become easier to manage.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 5,
                  staff: {
                    nina: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -2 }
                  }
                }
              },
              {
                id: "lead-nina-flex",
                label: "Use Nina's system as a guide but let managers keep flexibility on hot deals.",
                outcome: "The rule feels practical, but some ambiguity still survives in the culture.",
                nextNodeId: null,
                effects: {
                  sales: 6,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    nina: { morale: 2, trust: 2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake thinks rules are fine until they stop closers from closing.",
            options: [
              {
                id: "lead-jake-performance",
                label: "Give Jake a performance exception for same-day closes.",
                outcome: "The floor feels powerful, but the online team sees the dealership drifting back toward politics.",
                nextNodeId: null,
                effects: {
                  sales: 8,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    jake: { morale: 4, trust: 3 },
                    nina: { morale: -4, trust: -4 }
                  }
                }
              },
              {
                id: "lead-jake-no-exception",
                label: "Tell Jake the system matters more than short-term emotion.",
                outcome: "Jake cools down eventually, but the dealership keeps its structure.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    jake: { morale: -3, trust: -2 },
                    nina: { morale: 2, trust: 3 }
                  }
                }
              }
            ]
          }
        }
      },
      "margin-slip": {
        title: "The store is selling volume faster than it is protecting margin",
        body: "The next decision is whether you treat this as a finance and discipline issue or keep chasing speed.",
        consultants: {
          marcus: {
            prompt: "Marcus says the dealership is starting to promise numbers that will bleed gross if nobody intervenes.",
            options: [
              {
                id: "margin-marcus-tighten",
                label: "Let Marcus tighten the deal structure before the weekend gets more expensive.",
                outcome: "The store stops leaking money, even if some deals feel harder to close.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    marcus: { morale: 4, trust: 5 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "margin-marcus-later",
                label: "Tell Marcus to survive the weekend first and sort out the margin on Monday.",
                outcome: "That keeps the floor happy now, but it teaches the dealership to accept sloppy profitability.",
                nextNodeId: null,
                effects: {
                  sales: 7,
                  satisfaction: -1,
                  reputation: -3,
                  staff: {
                    marcus: { morale: -3, trust: -4 },
                    jake: { morale: 2, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the store should close first and worry about margin quality later.",
            options: [
              {
                id: "margin-jake-hot",
                label: "Back Jake and keep the dealership in full conversion mode.",
                outcome: "You win some immediate volume, but the store becomes more comfortable ignoring the hidden cost.",
                nextNodeId: null,
                effects: {
                  sales: 8,
                  satisfaction: 0,
                  reputation: -4,
                  staff: {
                    jake: { morale: 4, trust: 3 },
                    marcus: { morale: -4, trust: -5 }
                  }
                }
              },
              {
                id: "margin-jake-balance",
                label: "Tell Jake the store only wins if the deals are good deals.",
                outcome: "You cool the floor down, but you also give the dealership a healthier standard for the rush.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    jake: { morale: -2, trust: -1 },
                    marcus: { morale: 2, trust: 3 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-expectation": {
        title: "The store now has to decide how honest it wants to be with customers",
        body: "You prevented some chaos internally, but the real question now is whether the dealership manages expectations clearly enough to keep trust.",
        consultants: {
          nina: {
            prompt: "Nina wants the dealership to overcommunicate now so the day does not end in avoidable complaints.",
            options: [
              {
                id: "cust-nina-transparent",
                label: "Use Nina to set clean expectations with every affected customer.",
                outcome: "The day feels more controlled because customers know what the store can and cannot do.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 4,
                  reputation: 5,
                  staff: {
                    nina: { morale: 3, trust: 4 }
                  }
                }
              },
              {
                id: "cust-nina-selective",
                label: "Only update the customers most likely to become problems.",
                outcome: "You save time, but the dealership still feels inconsistent from one customer to the next.",
                nextNodeId: null,
                effects: {
                  sales: 6,
                  satisfaction: 1,
                  reputation: 1,
                  staff: {
                    nina: { morale: 1, trust: 1 },
                    elena: { morale: 0, trust: 1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena wants to shape the tone of the experience before frustration becomes public disappointment.",
            options: [
              {
                id: "cust-elena-vip",
                label: "Let Elena create a customer-experience buffer around the overload.",
                outcome: "The store still feels busy, but not careless, and customers read more grace into the delay.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 5,
                  reputation: 4,
                  staff: {
                    elena: { morale: 3, trust: 4 }
                  }
                }
              },
              {
                id: "cust-elena-minimal",
                label: "Keep Elena out of it and treat this as an operations-only problem.",
                outcome: "The store becomes cleaner operationally, but misses the emotional part of the customer experience.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
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
                  staff: {
                    jake: { morale: 1, trust: 1 }
                  }
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
              },
              {
                id: "ghost-marcus-wait",
                label: "Tell Marcus to hold off on formal steps while the floor tries to get the vehicle back quietly.",
                outcome: "The room stays calmer for a moment, but the dealership loses valuable time if the situation is worse than it looks.",
                nextNodeId: "customer-answers",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: -2,
                  staff: {
                    marcus: { morale: -2, trust: -3 },
                    jake: { morale: 1, trust: 0 }
                  }
                }
              }
            ]
          },
          tasha: {
            prompt: "Tasha wants to know whether the SUV broke down, has a tracker, or left with a known issue nobody mentioned.",
            options: [
              {
                id: "ghost-tasha-tracker",
                label: "Ask Tasha whether the SUV has a tracker or service note that explains the delay.",
                outcome: "You treat the store problem like a real vehicle problem first, which gives the dealership better facts quickly.",
                nextNodeId: "customer-answers",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    tasha: { morale: 2, trust: 3 },
                    jake: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "ghost-tasha-breakdown",
                label: "Assume the SUV may have failed mechanically and prepare recovery around that possibility.",
                outcome: "The dealership looks more responsible if the vehicle really did go down, but sales hates the implication.",
                nextNodeId: "customer-answers",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    tasha: { morale: 3, trust: 3 },
                    jake: { morale: -2, trust: -1 }
                  }
                }
              },
              {
                id: "ghost-tasha-ignore-service",
                label: "Keep service out of it and treat the whole thing as a customer-control failure.",
                outcome: "The explanation stays simpler, but you lose a useful line of inquiry and the bay feels dismissed.",
                nextNodeId: "incident-escalation",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    tasha: { morale: -2, trust: -2 },
                    marcus: { morale: 1, trust: 1 }
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
                  staff: {
                    nina: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "ghost-nina-dismiss",
                label: "Tell Nina this is a floor problem and keep her focused on fresh leads.",
                outcome: "The floor keeps control, but the dealership gives up useful evidence that could have narrowed the risk fast.",
                nextNodeId: "incident-escalation",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    nina: { morale: -2, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
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
          jake: {
            prompt: "Jake wants to keep the tone soft and get the SUV back before ownership hears anything worse.",
            options: [
              {
                id: "ghost-followup-jake-calm",
                label: "Let Jake stay calm, get the location, and preserve the relationship while the car comes back.",
                outcome: "The recovery feels smoother, but the dealership still has to decide whether Jake has learned anything from it.",
                nextNodeId: null,
                effects: {
                  sales: 5,
                  satisfaction: 2,
                  reputation: 1,
                  staff: {
                    jake: { morale: 2, trust: 1 }
                  }
                }
              },
              {
                id: "ghost-followup-jake-pressure",
                label: "Tell Jake to push hard and make it clear the dealership expects the SUV back immediately.",
                outcome: "The vehicle may come back faster, but the tone raises the chance that the customer turns into a complaint.",
                nextNodeId: null,
                effects: {
                  sales: 4,
                  satisfaction: -2,
                  reputation: -2,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    elena: { morale: -1, trust: -1 }
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
                  staff: {
                    elena: { morale: 3, trust: 3 }
                  }
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
                  staff: {
                    elena: { morale: -1, trust: -1 }
                  }
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
                  staff: {
                    elena: { morale: 2, trust: 3 }
                  }
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
                  staff: {
                    elena: { morale: -1, trust: -1 }
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
                  staff: {
                    jake: { morale: 3, trust: 4 }
                  }
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
              },
              {
                id: "comm-jake-private-warning",
                label: "Warn Jake not to make it a public fight while you gather facts privately.",
                outcome: "You protect professionalism first, but the floor still senses something is wrong.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    jake: { morale: -1, trust: 0 },
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
              },
              {
                id: "comm-marcus-back-office",
                label: "Back Marcus immediately and tell the floor accounting will not be second-guessed publicly.",
                outcome: "Accounting feels protected, but the floor reads it as management choosing structure over fairness.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    marcus: { morale: 3, trust: 3 },
                    jake: { morale: -5, trust: -5 }
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
              },
              {
                id: "comm-nina-stay-out",
                label: "Keep Nina out of it and limit the dispute to sales and accounting.",
                outcome: "The conflict stays narrower, but you lose a useful neutral perspective on what actually happened.",
                nextNodeId: "deal-review",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 0,
                  staff: {
                    nina: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena is less interested in the math than in how fast one ugly paycheck story can tank trust across the store.",
            options: [
              {
                id: "comm-elena-culture-read",
                label: "Ask Elena how the rest of the team is interpreting the conflict already.",
                outcome: "You get ahead of the culture damage even before the numbers are fully settled.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    elena: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "comm-elena-calm-room",
                label: "Use Elena to calm the broader staff mood while you work the dispute privately.",
                outcome: "The dealership feels steadier, but the underlying commission problem still needs a real answer.",
                nextNodeId: "deal-review",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    elena: { morale: 2, trust: 2 },
                    jake: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "comm-elena-ignore",
                label: "Ignore the culture angle and focus only on the math.",
                outcome: "The analysis stays clean, but the room keeps filling the silence with its own story.",
                nextNodeId: "rumor-spread",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    elena: { morale: -1, trust: -2 }
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
                  staff: {
                    tasha: { morale: 2, trust: 4 }
                  }
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
                  staff: {
                    jake: { morale: 2, trust: 1 }
                  }
                }
              },
              {
                id: "scratch-jake-smooth-over",
                label: "Let Jake try to smooth it over however he thinks best if the customer notices.",
                outcome: "You protect the chance of a save, but the dealership also risks turning one mistake into two.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 4,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    jake: { morale: 2, trust: 0 },
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          marcus: {
            prompt: "Marcus is already thinking about cost exposure, paperwork, and what kind of goodwill the store can absorb.",
            options: [
              {
                id: "scratch-marcus-document",
                label: "Have Marcus document the incident and prepare realistic compensation options immediately.",
                outcome: "The dealership gets financially organized fast, even if sales thinks the room got too serious too early.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    marcus: { morale: 3, trust: 4 },
                    jake: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "scratch-marcus-cost-only",
                label: "Ask Marcus only for the cheapest path that avoids a big margin hit.",
                outcome: "You control the numbers better, but the dealership risks treating the customer like an accounting problem.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    marcus: { morale: 1, trust: 1 },
                    elena: { morale: -1, trust: -1 }
                  }
                }
              },
              {
                id: "scratch-marcus-wait",
                label: "Tell Marcus to hold off until service knows whether the scratch can disappear today.",
                outcome: "You keep the paperwork lighter for a moment, but the store becomes less prepared if the customer reacts badly.",
                nextNodeId: "repair-window",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 0,
                  staff: {
                    marcus: { morale: -1, trust: -1 }
                  }
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
                  staff: {
                    elena: { morale: 3, trust: 4 }
                  }
                }
              },
              {
                id: "scratch-elena-goodwill",
                label: "Use Elena to build a goodwill option in case the customer needs a reason to stay calm.",
                outcome: "You give the dealership more recovery room, but the profit hit may grow.",
                nextNodeId: "customer-decision",
                effects: {
                  sales: 2,
                  satisfaction: 2,
                  reputation: 3,
                  staff: {
                    elena: { morale: 2, trust: 3 },
                    marcus: { morale: -1, trust: -1 }
                  }
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
                  staff: {
                    elena: { morale: -2, trust: -2 }
                  }
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
                  staff: {
                    nina: { morale: 1, trust: 3 }
                  }
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
                  staff: {
                    nina: { morale: 0, trust: 2 }
                  }
                }
              },
              {
                id: "price-nina-scold",
                label: "Scold Nina on the spot and make it clear this mistake cannot happen again.",
                outcome: "The accountability is visible, but the dealership loses some trust exactly when it needs calm thinking.",
                nextNodeId: "public-risk",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    nina: { morale: -5, trust: -5 },
                    jake: { morale: 1, trust: 0 }
                  }
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
                  staff: {
                    marcus: { morale: 3, trust: 4 }
                  }
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
              },
              {
                id: "price-marcus-stay-back",
                label: "Tell Marcus to stay out of it until the customer situation is calmer.",
                outcome: "The room feels less legalistic, but the dealership risks improvising a costly promise.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: -1,
                  staff: {
                    marcus: { morale: -1, trust: -2 },
                    jake: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake thinks the customer knows the price was a typo and is trying to bully the store into a win.",
            options: [
              {
                id: "price-jake-read-room",
                label: "Ask Jake what the customer is actually asking for beyond the headline number.",
                outcome: "The dealership gets a better feel for whether this can still become a real sale instead of a showdown.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    jake: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "price-jake-keep-cool",
                label: "Warn Jake to stay professional and not turn the issue into a public floor fight.",
                outcome: "The floor stays calmer, though Jake feels like management is capping his instincts.",
                nextNodeId: "public-risk",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    jake: { morale: -1, trust: 0 },
                    nina: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "price-jake-handle-it",
                label: "Let Jake handle the customer while you sort the back-end facts.",
                outcome: "You keep momentum, but the store also hands a delicate pricing mistake to its most instinctive closer.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 3,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    jake: { morale: 2, trust: 1 },
                    elena: { morale: -1, trust: -1 }
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
                  staff: {
                    elena: { morale: 3, trust: 4 }
                  }
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
              },
              {
                id: "price-elena-ignore",
                label: "Ignore the public-risk angle and focus only on the customer in front of you.",
                outcome: "The conversation stays simpler, but the dealership has no plan if the screenshot escapes the showroom.",
                nextNodeId: "customer-negotiation",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: -2,
                  staff: {
                    elena: { morale: -2, trust: -2 }
                  }
                }
              }
            ]
          }
        }
      },
      "liability-review": {
        title: "The typo is obvious, but screenshots still make it risky",
        body: "Marcus believes the price is clearly a typo, but the dealership still has to choose whether to be firm, flexible, or overly dramatic in its recovery.",
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
                    jake: { morale: -1, trust: -1 }
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
                  staff: {
                    elena: { morale: -1, trust: -2 }
                  }
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
                  staff: {
                    elena: { morale: 3, trust: 4 }
                  }
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
                  staff: {
                    elena: { morale: -1, trust: -1 }
                  }
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
                  staff: {
                    marcus: { morale: 1, trust: 3 }
                  }
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
              },
              {
                id: "lunch-marcus-dismiss",
                label: "Assume the rumor is probably nonsense and focus on bigger dealership problems.",
                outcome: "The lunch issue seems tiny, but the staff learns management ignores petty frustration until it turns toxic.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    marcus: { morale: 0, trust: 0 },
                    tasha: { morale: -3, trust: -3 }
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
                  staff: {
                    tasha: { morale: 3, trust: 4 }
                  }
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
              },
              {
                id: "lunch-tasha-replace",
                label: "Replace the missing lunch and promise an immediate fix to the fridge problem.",
                outcome: "The gesture helps, but now you actually need a system instead of just a sandwich reimbursement.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 1,
                  staff: {
                    tasha: { morale: 2, trust: 2 },
                    marcus: { morale: 0, trust: 0 }
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
                id: "lunch-jake-source",
                label: "Ask Jake exactly what he has seen versus what he is just repeating.",
                outcome: "You turn the gossip into information, even if Jake still wishes this were more fun than policy.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    jake: { morale: 0, trust: 1 }
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
          },
          elena: {
            prompt: "Elena thinks the real issue is that the break room now feels petty, tense, and a little childish.",
            options: [
              {
                id: "lunch-elena-culture",
                label: "Ask Elena how widespread the irritation is before you set a tone for the room.",
                outcome: "You get a better read on whether the problem is lunch theft or a broader professionalism slide.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 1,
                  reputation: 2,
                  staff: {
                    elena: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "lunch-elena-humor",
                label: "Ask Elena whether a light-touch reset could solve this without a big crackdown.",
                outcome: "The idea may keep morale lighter, but it only works if the staff is still willing to laugh with you.",
                nextNodeId: "policy-reset",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    elena: { morale: 1, trust: 1 },
                    tasha: { morale: -1, trust: 0 }
                  }
                }
              },
              {
                id: "lunch-elena-stay-out",
                label: "Keep Elena out of it and treat the fridge like a simple operations nuisance.",
                outcome: "The issue stays narrower, but the store also misses the culture lesson inside it.",
                nextNodeId: "rumor-room",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    elena: { morale: -1, trust: -1 }
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
                  staff: {
                    nina: { morale: 2, trust: 3 }
                  }
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
              },
              {
                id: "beatles-nina-cool-off",
                label: "Ask Nina to cool off first and save the deeper conversation for later.",
                outcome: "The heat drops, but the actual relationship problem remains waiting under the floorboards.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    nina: { morale: -1, trust: 0 }
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
                  staff: {
                    tasha: { morale: 2, trust: 3 }
                  }
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
                  staff: {
                    tasha: { morale: -1, trust: 1 }
                  }
                }
              },
              {
                id: "beatles-tasha-private",
                label: "Offer Tasha a private reset conversation with Nina later once both cool off.",
                outcome: "You lower the drama now and preserve a path back to teamwork if the store follows through.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    tasha: { morale: 1, trust: 2 },
                    nina: { morale: 0, trust: 1 }
                  }
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
                id: "beatles-jake-facts",
                label: "Ask Jake exactly what customers or staff overheard before you decide how public this became.",
                outcome: "You turn the chaos into useful information, even if Jake still seems way too amused by it.",
                nextNodeId: "customer-heard",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    jake: { morale: 0, trust: 1 }
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
          },
          marcus: {
            prompt: "Marcus thinks the argument is ridiculous but cares that the store now sounds unprofessional to customers.",
            options: [
              {
                id: "beatles-marcus-professionalism",
                label: "Ask Marcus what customers or staff actually heard and treat this as a professionalism review.",
                outcome: "The store gets a sober read on the disruption, even if nobody enjoys Marcus being right about standards.",
                nextNodeId: "customer-heard",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    marcus: { morale: 1, trust: 2 }
                  }
                }
              },
              {
                id: "beatles-marcus-neutral",
                label: "Use Marcus as a neutral fact-check before speaking to Nina or Tasha again.",
                outcome: "The dealership gets a cleaner story, but the emotional repair still waits for later.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "beatles-marcus-stay-out",
                label: "Tell Marcus to stay out of it so the conflict does not feel like a tribunal.",
                outcome: "The room stays less formal, but you lose a useful read on how public the blowup really was.",
                nextNodeId: "friendship-strain",
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 0,
                  staff: {
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "customer-heard": {
        title: "Customers noticed the tension and now the dealership looks goofy and distracted",
        body: "A customer made a music joke, people laughed awkwardly, and now the store has to decide whether to use humor, apology, or discipline to reset the room.",
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
                  staff: {
                    jake: { morale: 1, trust: 0 }
                  }
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
        body: "Nina and Tasha now want to avoid each other. Your next move decides whether the dealership pushes immediate cooperation or actually repairs the working relationship.",
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
                  staff: {
                    tasha: { morale: 0, trust: 2 }
                  }
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
              },
              {
                id: "football-tasha-why",
                label: "Ask Tasha why she was playing catch on the lot during business hours in the first place.",
                outcome: "You address judgment early, but the customer-facing side waits while the internal tone sharpens.",
                nextNodeId: "professionalism-breakdown",
                effects: {
                  sales: 1,
                  satisfaction: -1,
                  reputation: 0,
                  staff: {
                    tasha: { morale: -2, trust: -3 }
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
                  staff: {
                    jake: { morale: 2, trust: 2 }
                  }
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
              },
              {
                id: "football-jake-handle-sale",
                label: "Let Jake focus only on saving the deal while you handle the rest of the lot chaos.",
                outcome: "The sale gets attention, but the rest of the dealership still needs someone to look like a manager.",
                nextNodeId: "deal-danger",
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: 0,
                  staff: {
                    jake: { morale: 2, trust: 1 }
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
                  staff: {
                    marcus: { morale: 2, trust: 3 }
                  }
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
              },
              {
                id: "football-marcus-wait",
                label: "Tell Marcus to hold off until you know whether the customer is actually injured or just angry.",
                outcome: "The room feels less formal, but the dealership becomes slower to protect itself if the complaint grows.",
                nextNodeId: "professionalism-breakdown",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -1,
                  staff: {
                    marcus: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          },
          elena: {
            prompt: "Elena knows this could become a 'you will not believe what happened at this dealership' story if anyone films or posts it.",
            options: [
              {
                id: "football-elena-message",
                label: "Ask Elena to help shape the apology tone while you contain the in-person damage.",
                outcome: "The dealership sounds more human and less chaotic, even if the scene itself was ridiculous.",
                nextNodeId: "deal-danger",
                effects: {
                  sales: 1,
                  satisfaction: 1,
                  reputation: 3,
                  staff: {
                    elena: { morale: 2, trust: 3 }
                  }
                }
              },
              {
                id: "football-elena-monitor",
                label: "Have Elena watch for social fallout while you focus on the injured and angry customers.",
                outcome: "The store becomes more alert to the public version of the event before it fully forms.",
                nextNodeId: "professionalism-breakdown",
                effects: {
                  sales: 1,
                  satisfaction: 0,
                  reputation: 2,
                  staff: {
                    elena: { morale: 2, trust: 2 }
                  }
                }
              },
              {
                id: "football-elena-stay-out",
                label: "Keep Elena out of it and treat the whole mess as a pure operations and safety problem.",
                outcome: "The response stays simpler, but the store loses a useful recovery voice for the customers watching it.",
                nextNodeId: "injury-concern",
                effects: {
                  sales: 2,
                  satisfaction: -1,
                  reputation: -2,
                  staff: {
                    elena: { morale: -2, trust: -2 }
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
                  staff: {
                    tasha: { morale: 1, trust: 2 }
                  }
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
                  staff: {
                    elena: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      },
      "professionalism-breakdown": {
        title: "The whole lot is now learning what kind of behavior leadership actually tolerates",
        body: "People are laughing about the football collision, which means the next move is about discipline and culture as much as customer recovery.",
        consultants: {
          tasha: {
            prompt: "Tasha knows she crossed a line, but wants correction that feels fair instead of performative.",
            options: [
              {
                id: "football-prof-tasha-private",
                label: "Correct Tasha privately after the crisis and reset customer-facing boundaries for the lot.",
                outcome: "The dealership protects dignity while still drawing a clear line about judgment on the lot.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    tasha: { morale: -1, trust: 1 },
                    jake: { morale: 0, trust: 1 }
                  }
                }
              },
              {
                id: "football-prof-tasha-public",
                label: "Make a visible example of Tasha so everyone understands the dealership is done with the nonsense.",
                outcome: "The line gets very clear, but the store also risks looking reactive and humiliating in public.",
                nextNodeId: null,
                effects: {
                  sales: 2,
                  satisfaction: 0,
                  reputation: 1,
                  staff: {
                    tasha: { morale: -5, trust: -4 },
                    marcus: { morale: 1, trust: 1 }
                  }
                }
              }
            ]
          },
          jake: {
            prompt: "Jake wants the team joking to stop because every laugh makes his customer recovery harder.",
            options: [
              {
                id: "football-prof-jake-team-reset",
                label: "Address the whole team about customer-facing professionalism once the immediate scene is stable.",
                outcome: "The store gets a broader culture correction instead of only one employee getting all the blame.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 1,
                  reputation: 4,
                  staff: {
                    jake: { morale: 1, trust: 2 },
                    tasha: { morale: 0, trust: 1 },
                    elena: { morale: 1, trust: 1 }
                  }
                }
              },
              {
                id: "football-prof-jake-ignore",
                label: "Ignore the team laughter for now and focus only on the two customers involved.",
                outcome: "The priority stays tight, but the dealership also signals that visible silliness is acceptable if the sale is urgent enough.",
                nextNodeId: null,
                effects: {
                  sales: 3,
                  satisfaction: 0,
                  reputation: -3,
                  staff: {
                    jake: { morale: 1, trust: 0 },
                    tasha: { morale: -1, trust: -1 }
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
];

const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

initializeDatabase();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(req, res, pathname);
      return;
    }

    if (pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        status: "healthy",
        dataDir: DATA_DIR,
        dbPath: DB_PATH
      });
      return;
    }

    if (pathname === "/") {
      sendFile(res, path.join(PUBLIC_DIR, "index.html"));
      return;
    }

    sendStatic(res, pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Something went wrong on the server." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Dealership manager sim running at http://${HOST}:${PORT}`);
  console.log(`Teacher login: ${DEFAULT_TEACHER_USERNAME} / ${DEFAULT_TEACHER_PASSWORD}`);
  console.log(`Data directory: ${DATA_DIR}`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down cleanly...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref?.();

  server.close(() => {
    try {
      db.close?.();
    } catch (error) {
      console.error("Failed to close database cleanly:", error);
    }
    clearTimeout(forceExitTimer);
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

async function handleApi(req, res, pathname) {
  const session = getSession(req);

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");

    if (!username || !displayName || password.length < 4) {
      sendJson(res, 400, { error: "Provide a display name, username, and a password with at least 4 characters." });
      return;
    }

    if (getUserByUsername(username)) {
      sendJson(res, 409, { error: "That username is already taken." });
      return;
    }

    const userId = crypto.randomUUID();
    runInTransaction(() => {
      db.prepare(
        `INSERT INTO users (id, username, display_name, password_hash, sales, satisfaction, reputation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        username,
        displayName,
        hashPassword(password),
        DEFAULT_STUDENT_STATE.sales,
        DEFAULT_STUDENT_STATE.satisfaction,
        DEFAULT_STUDENT_STATE.reputation,
        new Date().toISOString()
      );
      seedStudentStaff(userId);
      const currentRoundId = getGameState().currentRoundId;
      if (currentRoundId) {
        const round = getRoundById(currentRoundId);
        const preset = round ? getRoundPreset(round) : null;
        if (preset) {
          createCaseFile(currentRoundId, userId, preset);
        }
      }
    });

    const sid = createSession({ userId, isAdmin: false });
    setSessionCookie(res, sid);
    sendJson(res, 201, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const user = getUserByUsername(username);

    if (!user || user.password_hash !== hashPassword(password)) {
      sendJson(res, 401, { error: "Invalid username or password." });
      return;
    }

    const sid = createSession({ userId: user.id, isAdmin: false });
    setSessionCookie(res, sid);
    sendJson(res, 200, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/login") {
    const body = await readJsonBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const settings = getSettings();

    if (username !== settings.teacherUsername || hashPassword(password) !== settings.teacherPasswordHash) {
      sendJson(res, 401, { error: "Invalid teacher login." });
      return;
    }

    const sid = createSession({ userId: null, isAdmin: true });
    setSessionCookie(res, sid);
    sendJson(res, 200, buildBootstrapPayload(sessions.get(sid)));
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    clearSession(req, res);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/respond") {
    if (!session?.userId) {
      sendJson(res, 401, { error: "Log in as a student to respond." });
      return;
    }

    const body = await readJsonBody(req);
    const optionId = String(body.optionId || "").trim();

    if (!optionId) {
      sendJson(res, 400, { error: "Choose a response option." });
      return;
    }

    try {
      runInTransaction(() => submitResponse(session.userId, optionId));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/settings") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const settings = getSettings();
    const nextUsername = body.teacherUsername ? normalizeUsername(body.teacherUsername) : settings.teacherUsername;
    const nextSalesGoal = Math.round(Number(body.salesGoal));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!nextUsername) {
      sendJson(res, 400, { error: "Teacher username cannot be blank." });
      return;
    }

    if (!Number.isFinite(nextSalesGoal) || nextSalesGoal < 20 || nextSalesGoal > 500) {
      sendJson(res, 400, { error: "Sales goal must be between 20 and 500." });
      return;
    }

    const isCredentialChange = nextUsername !== settings.teacherUsername || newPassword.length > 0;
    if (isCredentialChange) {
      if (hashPassword(currentPassword) !== settings.teacherPasswordHash) {
        sendJson(res, 400, { error: "Current teacher password is required to change teacher login settings." });
        return;
      }
      if (newPassword && newPassword.length < 4) {
        sendJson(res, 400, { error: "New teacher password must be at least 4 characters." });
        return;
      }
    }

    setSetting("teacher_username", nextUsername);
    setSetting("sales_goal", String(nextSalesGoal));
    if (newPassword) {
      setSetting("teacher_password_hash", hashPassword(newPassword));
    }

    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/session") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    runInTransaction(() => updateSessionState(Boolean(body.isOpen)));
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/round/publish") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const presetId = String(body.presetId || "").trim();
    const headline = String(body.headline || "").trim();
    const roundBody = String(body.body || "").trim();

    try {
      runInTransaction(() => publishRound(presetId, headline, roundBody));
      sendJson(res, 200, buildBootstrapPayload(session));
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/round/close") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    runInTransaction(() => closeCurrentRound());
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/student/password") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");
    const nextPassword = String(body.password || "");

    if (nextPassword.length < 4) {
      sendJson(res, 400, { error: "Student passwords must be at least 4 characters." });
      return;
    }

    if (!getUserById(userId)) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hashPassword(nextPassword), userId);
    clearStudentSessions(userId);
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/student/delete") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const userId = String(body.userId || "");

    if (!getUserById(userId)) {
      sendJson(res, 404, { error: "Student account not found." });
      return;
    }

    db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    clearStudentSessions(userId);
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/reset") {
    if (!session?.isAdmin) {
      sendJson(res, 401, { error: "Teacher access required." });
      return;
    }

    const body = await readJsonBody(req);
    const scope = String(body.scope || "");

    if (!["results", "full"].includes(scope)) {
      sendJson(res, 400, { error: "Unknown reset scope." });
      return;
    }

    runInTransaction(() => resetSimulation(scope));
    if (scope === "full") {
      clearAllStudentSessions();
    }
    sendJson(res, 200, buildBootstrapPayload(session));
    return;
  }

  sendJson(res, 404, { error: "Route not found." });
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_open INTEGER NOT NULL DEFAULT 0,
      session_number INTEGER NOT NULL DEFAULT 0,
      round_number INTEGER NOT NULL DEFAULT 0,
      current_round_id TEXT,
      last_opened_at TEXT,
      last_closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      sales REAL NOT NULL,
      satisfaction INTEGER NOT NULL,
      reputation INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff_state (
      user_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      morale INTEGER NOT NULL,
      trust INTEGER NOT NULL,
      PRIMARY KEY (user_id, staff_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS manager_flags (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value INTEGER NOT NULL,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      preset_id TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      body TEXT NOT NULL,
      pressure TEXT NOT NULL,
      staff_focus_json TEXT NOT NULL,
      options_json TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS case_files (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      current_node_id TEXT NOT NULL,
      current_phase TEXT NOT NULL,
      selected_consultant_id TEXT,
      status TEXT NOT NULL,
      context_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      resolved_at TEXT,
      UNIQUE (round_id, user_id),
      FOREIGN KEY (round_id) REFERENCES rounds (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS case_choices (
      id TEXT PRIMARY KEY,
      case_file_id TEXT NOT NULL,
      step_index INTEGER NOT NULL,
      node_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      consultant_id TEXT,
      action_id TEXT,
      label TEXT NOT NULL,
      summary TEXT NOT NULL,
      sales_delta REAL NOT NULL,
      satisfaction_delta INTEGER NOT NULL,
      reputation_delta INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_file_id) REFERENCES case_files (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      option_label TEXT NOT NULL,
      outcome_text TEXT NOT NULL,
      note_text TEXT NOT NULL,
      sales_delta REAL NOT NULL,
      satisfaction_delta INTEGER NOT NULL,
      reputation_delta INTEGER NOT NULL,
      submitted_at TEXT NOT NULL,
      UNIQUE (round_id, user_id),
      FOREIGN KEY (round_id) REFERENCES rounds (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS response_staff_effects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      morale_delta INTEGER NOT NULL,
      trust_delta INTEGER NOT NULL,
      FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_responses_round ON responses (round_id);
    CREATE INDEX IF NOT EXISTS idx_responses_user ON responses (user_id);
    CREATE INDEX IF NOT EXISTS idx_case_files_round ON case_files (round_id);
    CREATE INDEX IF NOT EXISTS idx_case_files_user ON case_files (user_id);
    CREATE INDEX IF NOT EXISTS idx_case_choices_case ON case_choices (case_file_id);
  `);

  const settingsCount = db.prepare(`SELECT COUNT(*) AS count FROM settings`).get().count;
  if (settingsCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  runInTransaction(() => {
    clearAllTables();
    setSetting("teacher_username", DEFAULT_TEACHER_USERNAME);
    setSetting("teacher_password_hash", hashPassword(DEFAULT_TEACHER_PASSWORD));
    setSetting("sales_goal", String(DEFAULT_SALES_GOAL));
    db.prepare(
      `INSERT INTO game_state (id, is_open, session_number, round_number, current_round_id, last_opened_at, last_closed_at)
       VALUES (1, 0, 0, 0, NULL, NULL, NULL)`
    ).run();
  });
}

function clearAllTables() {
  db.exec(`
    DELETE FROM case_choices;
    DELETE FROM case_files;
    DELETE FROM response_staff_effects;
    DELETE FROM responses;
    DELETE FROM rounds;
    DELETE FROM manager_flags;
    DELETE FROM staff_state;
    DELETE FROM users;
    DELETE FROM game_state;
    DELETE FROM settings;
  `);
}

function buildBootstrapPayload(session) {
  return {
    user: session?.userId ? serializeUser(session.userId) : null,
    isAdmin: Boolean(session?.isAdmin),
    game: getGameState(),
    rules: {
      salesGoal: getSalesGoal()
    },
    currentRound: getCurrentRound(session),
    rounds: getRecentRounds(8, session),
    leaderboard: computeLeaderboard(),
    presets: session?.isAdmin ? getPresetLibrary() : null,
    admin: session?.isAdmin ? buildAdminPayload() : null
  };
}

function getSettings() {
  const rows = db.prepare(`SELECT key, value FROM settings`).all();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    teacherUsername: map.teacher_username || DEFAULT_TEACHER_USERNAME,
    teacherPasswordHash: map.teacher_password_hash || hashPassword(DEFAULT_TEACHER_PASSWORD),
    salesGoal: Math.round(Number(map.sales_goal || DEFAULT_SALES_GOAL))
  };
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, String(value));
}

function getSalesGoal() {
  return getSettings().salesGoal;
}

function getGameState() {
  const row = db.prepare(
    `SELECT is_open, session_number, round_number, current_round_id, last_opened_at, last_closed_at
     FROM game_state
     WHERE id = 1`
  ).get();
  return {
    isOpen: Boolean(row?.is_open),
    sessionNumber: row?.session_number || 0,
    roundNumber: row?.round_number || 0,
    currentRoundId: row?.current_round_id || null,
    hasActiveRound: Boolean(row?.current_round_id),
    lastOpenedAt: row?.last_opened_at || null,
    lastClosedAt: row?.last_closed_at || null
  };
}

function getPresetLibrary() {
  return GLOBAL_EVENT_TEMPLATES.map((preset) => ({
    id: preset.id,
    category: preset.category,
    pressure: preset.pressure,
    headline: preset.headline,
    body: preset.body,
    rootNodeId: preset.rootNodeId,
    openingConsultants: Object.keys(getNodeDefinition(preset, preset.rootNodeId)?.consultants || {})
  }));
}

function getScenarioPreset(presetId) {
  return GLOBAL_EVENT_TEMPLATES.find((preset) => preset.id === presetId) || null;
}

function getRoundPreset(row) {
  const stored = parseJsonValue(row?.options_json, null);
  if (stored?.generatedPreset) {
    return stored.generatedPreset;
  }
  return getScenarioPreset(row?.preset_id);
}

function getUserById(userId) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, sales, satisfaction, reputation, created_at
     FROM users
     WHERE id = ?`
  ).get(userId);
}

function getUserByUsername(username) {
  return db.prepare(
    `SELECT id, username, display_name, password_hash, sales, satisfaction, reputation, created_at
     FROM users
     WHERE username = ?`
  ).get(username);
}

function getStaffMember(staffId) {
  return STAFF_MEMBERS.find((member) => member.id === staffId) || null;
}

function getManagerFlags(userId) {
  const rows = db.prepare(
    `SELECT key, value FROM manager_flags WHERE user_id = ?`
  ).all(userId);
  return Object.fromEntries(rows.map((row) => [row.key, Number(row.value)]));
}

function setManagerFlag(userId, key, value) {
  db.prepare(
    `INSERT INTO manager_flags (user_id, key, value) VALUES (?, ?, ?)
     ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`
  ).run(userId, key, Math.max(0, Math.min(6, Math.round(Number(value || 0)))));
}

function getRecentDecisionRows(userId, limit = 6) {
  return db.prepare(
    `SELECT r.category, r.pressure, p.option_label, p.sales_delta, p.satisfaction_delta, p.reputation_delta
     FROM responses p
     JOIN rounds r ON r.id = p.round_id
     WHERE p.user_id = ?
     ORDER BY datetime(p.submitted_at) DESC, p.rowid DESC
     LIMIT ?`
  ).all(userId, limit);
}

function createCaseFile(roundId, userId, preset) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR IGNORE INTO case_files
     (id, round_id, user_id, current_node_id, current_phase, selected_consultant_id, status, context_json, updated_at, resolved_at)
     VALUES (?, ?, ?, ?, 'consultant', NULL, 'active', ?, ?, NULL)`
  ).run(
    crypto.randomUUID(),
    roundId,
    userId,
    preset.rootNodeId,
    JSON.stringify({
      stepIndex: 1,
      visitedConsultants: [],
      visitedNodes: [preset.rootNodeId],
      chainLog: []
    }),
    now
  );
}

function ensureCaseFile(roundId, userId) {
  if (getUserLossState(userId)) {
    return null;
  }
  const round = getRoundById(roundId);
  if (!round) {
    return null;
  }
  const existing = getCaseFile(roundId, userId);
  if (existing) {
    return existing;
  }
  const preset = getRoundPreset(round);
  if (!preset) {
    return null;
  }
  createCaseFile(roundId, userId, preset);
  return getCaseFile(roundId, userId);
}

function getCaseFile(roundId, userId) {
  return db.prepare(
    `SELECT id, round_id, user_id, current_node_id, current_phase, selected_consultant_id, status, context_json, updated_at, resolved_at
     FROM case_files
     WHERE round_id = ? AND user_id = ?`
  ).get(roundId, userId);
}

function getCaseChoices(caseFileId) {
  return db.prepare(
    `SELECT id, step_index, node_id, phase, consultant_id, action_id, label, summary,
            sales_delta, satisfaction_delta, reputation_delta, created_at
     FROM case_choices
     WHERE case_file_id = ?
     ORDER BY step_index ASC, datetime(created_at) ASC, rowid ASC`
  ).all(caseFileId);
}

function getNodeDefinition(preset, nodeId) {
  return preset?.nodes?.[nodeId] || null;
}

function getNodeConsultantDefinition(node, consultantId) {
  return node?.consultants?.[consultantId] || null;
}

function getAvailableConsultants(node, context) {
  const all = Object.keys(node?.consultants || {});
  const visited = new Set(context?.visitedConsultants || []);
  const fresh = all.filter((id) => !visited.has(id));
  return fresh.length ? fresh : all;
}

function summarizeCaseChoices(choices) {
  return choices.reduce(
    (totals, choice) => {
      if (choice.phase === "consultant") {
        totals.consultantCount += 1;
        return totals;
      }

      totals.actionCount += 1;
      totals.salesDelta += Number(choice.sales_delta ?? choice.salesDelta ?? 0);
      totals.satisfactionDelta += Number(choice.satisfaction_delta ?? choice.satisfactionDelta ?? 0);
      totals.reputationDelta += Number(choice.reputation_delta ?? choice.reputationDelta ?? 0);
      return totals;
    },
    {
      actionCount: 0,
      consultantCount: 0,
      salesDelta: 0,
      satisfactionDelta: 0,
      reputationDelta: 0
    }
  );
}

function getMaxChainSteps(preset, nodeId, visited = new Set()) {
  if (!preset || !nodeId || visited.has(nodeId)) {
    return 1;
  }

  const node = getNodeDefinition(preset, nodeId);
  if (!node) {
    return 1;
  }

  const nextNodeIds = Array.from(
    new Set(
      Object.values(node.consultants || {})
        .flatMap((consultant) => (consultant.options || []).map((option) => option.nextNodeId))
        .filter(Boolean)
    )
  );

  if (!nextNodeIds.length) {
    return 1;
  }

  const nextVisited = new Set(visited);
  nextVisited.add(nodeId);

  return 1 + Math.max(...nextNodeIds.map((nextNodeId) => getMaxChainSteps(preset, nextNodeId, nextVisited)));
}

function toShortText(value, fallback, maxLength = 220) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return (text || fallback).slice(0, maxLength);
}

function seedStudentStaff(userId) {
  db.prepare(`DELETE FROM staff_state WHERE user_id = ?`).run(userId);
  db.prepare(`DELETE FROM manager_flags WHERE user_id = ?`).run(userId);
  STAFF_MEMBERS.forEach((staff) => {
    db.prepare(
      `INSERT INTO staff_state (user_id, staff_id, morale, trust) VALUES (?, ?, ?, ?)`
    ).run(userId, staff.id, staff.defaultMorale, staff.defaultTrust);
  });
}

function serializeUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  const staffRows = db.prepare(
    `SELECT staff_id, morale, trust FROM staff_state WHERE user_id = ?`
  ).all(userId);
  const staffMap = new Map(staffRows.map((row) => [row.staff_id, row]));
  const staff = STAFF_MEMBERS.map((member) => {
    const current = staffMap.get(member.id);
    return {
      id: member.id,
      name: member.name,
      title: member.title,
      summary: member.summary,
      tension: member.tension,
      morale: clampPercent(current?.morale ?? member.defaultMorale),
      trust: clampPercent(current?.trust ?? member.defaultTrust)
    };
  });

  const avgMorale = roundNumber(staff.reduce((sum, member) => sum + member.morale, 0) / staff.length, 1);
  const avgTrust = roundNumber(staff.reduce((sum, member) => sum + member.trust, 0) / staff.length, 1);
  const teamHealth = roundNumber((user.satisfaction + user.reputation + avgMorale + avgTrust) / 4, 1);
  const lossState = buildLossState(staff);
  const aggregateScore = computeAggregateScore(user.sales, avgMorale, avgTrust);
  const decoratedStaff = staff.map((member) => ({
    ...member,
    hasQuit: Boolean(lossState && lossState.staffId === member.id)
  }));
  const lowestMorale = Math.min(...staff.map((member) => member.morale));
  const currentRoundId = getGameState().currentRoundId;
  const currentResponse = currentRoundId ? getResponseForRound(currentRoundId, userId) : null;
  const managerFlags = getManagerFlags(userId);

  const decisionHistory = db.prepare(
    `SELECT r.id, r.round_number, r.headline, p.option_label, p.outcome_text, p.note_text,
            p.sales_delta, p.satisfaction_delta, p.reputation_delta, p.submitted_at
     FROM responses p
     JOIN rounds r ON r.id = p.round_id
     WHERE p.user_id = ?
     ORDER BY datetime(p.submitted_at) DESC, p.rowid DESC
     LIMIT 8`
  ).all(userId).map((row) => ({
    roundId: row.id,
    roundNumber: row.round_number,
    headline: row.headline,
    optionLabel: row.option_label,
    outcomeText: row.outcome_text,
    noteText: row.note_text,
    salesDelta: row.sales_delta,
    satisfactionDelta: row.satisfaction_delta,
    reputationDelta: row.reputation_delta,
    submittedAt: row.submitted_at
  }));

  const warnings = [];
  if (lossState) {
    warnings.push(lossState.message);
    warnings.push("This dealership is out of the competition until the teacher resets standings.");
  } else if (lowestMorale < 35) {
    const atRisk = staff.filter((member) => member.morale < 35).map((member) => member.name).join(", ");
    warnings.push(`${atRisk} is close to burnout. Future decisions may trigger hidden sales penalties.`);
  }
  if (!lossState && avgTrust < 50) {
    warnings.push("Team trust in your leadership is shaky. Future customer situations may be harder to stabilize.");
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    sales: roundNumber(user.sales, 0),
    satisfaction: clampPercent(user.satisfaction),
    reputation: clampPercent(user.reputation),
    avgMorale,
    avgTrust,
    teamHealth,
    aggregateScore,
    isEliminated: Boolean(lossState),
    lossState,
    staff: decoratedStaff,
    warnings,
    managerProfile: buildManagerProfile(managerFlags),
    currentResponse,
    decisionHistory
  };
}

function computeLeaderboard() {
  return db.prepare(
    `SELECT id FROM users ORDER BY display_name COLLATE NOCASE ASC`
  ).all().map((row) => serializeUser(row.id))
    .filter(Boolean)
    .sort((a, b) => {
      if (Number(a.isEliminated) !== Number(b.isEliminated)) {
        return Number(a.isEliminated) - Number(b.isEliminated);
      }
      if (b.aggregateScore !== a.aggregateScore) {
        return b.aggregateScore - a.aggregateScore;
      }
      if (b.sales !== a.sales) {
        return b.sales - a.sales;
      }
      if (b.teamHealth !== a.teamHealth) {
        return b.teamHealth - a.teamHealth;
      }
      return b.reputation - a.reputation;
    })
    .map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      displayName: entry.displayName,
      username: entry.username,
      sales: entry.sales,
      aggregateScore: entry.aggregateScore,
      satisfaction: entry.satisfaction,
      reputation: entry.reputation,
      avgMorale: entry.avgMorale,
      avgTrust: entry.avgTrust,
      teamHealth: entry.teamHealth,
      isEliminated: entry.isEliminated,
      lossState: entry.lossState
    }));
}

function buildAdminPayload() {
  const settings = getSettings();
  const leaderboard = computeLeaderboard();
  const detailedStudents = leaderboard.map((entry) => {
    const detail = serializeUser(entry.id) || {};
    return {
      ...detail,
      rank: entry.rank,
      responseStats: getUserResponseStats(entry.id),
      lowestMorale: Math.min(...(detail.staff || []).map((member) => member.morale)),
      lowestTrust: Math.min(...(detail.staff || []).map((member) => member.trust)),
      atRiskCount: (detail.staff || []).filter((member) => member.morale < 40 || member.trust < 40).length
    };
  });
  const currentRoundId = getGameState().currentRoundId;
  const students = leaderboard.map((entry) => {
    const detail = detailedStudents.find((student) => student.id === entry.id) || null;
    const responded = currentRoundId ? Boolean(getResponseForRound(currentRoundId, entry.id)) : false;
    const caseFile = currentRoundId ? getCaseFile(currentRoundId, entry.id) : null;
    const progressState = entry.isEliminated
      ? {
          label: entry.lossState?.name ? `Lost: ${entry.lossState.name} quit` : "Lost",
          tone: "closed"
        }
      : responded
        ? {
            label: "Completed",
            tone: "open"
          }
        : {
            label: buildCaseProgressLabel(caseFile),
            tone: "muted"
          };
    return {
      ...entry,
      award: null,
      managerProfile: detail?.managerProfile || null,
      respondedToCurrentRound: responded,
      progressLabel: progressState.label,
      progressTone: progressState.tone,
      joinedAt: getUserById(entry.id)?.created_at || null
    };
  });
  const awards = assignStudentAwards(detailedStudents);
  const awardMap = new Map(awards.map((award) => [award.studentId, award]));
  students.forEach((student) => {
    student.award = awardMap.get(student.id) || null;
  });

  const averageSales = students.length
    ? roundNumber(students.reduce((sum, student) => sum + student.sales, 0) / students.length, 1)
    : 0;
  const averageMorale = students.length
    ? roundNumber(students.reduce((sum, student) => sum + student.avgMorale, 0) / students.length, 1)
    : 0;

  const recentResponses = db.prepare(
    `SELECT p.id, p.option_label, p.sales_delta, p.satisfaction_delta, p.reputation_delta, p.submitted_at,
            u.display_name, u.username, r.round_number, r.headline
     FROM responses p
     JOIN users u ON u.id = p.user_id
     JOIN rounds r ON r.id = p.round_id
     ORDER BY datetime(p.submitted_at) DESC, p.rowid DESC
     LIMIT 14`
  ).all().map((row) => ({
    id: row.id,
    studentName: row.display_name,
    username: row.username,
    roundNumber: row.round_number,
    headline: row.headline,
    optionLabel: row.option_label,
    salesDelta: row.sales_delta,
    satisfactionDelta: row.satisfaction_delta,
    reputationDelta: row.reputation_delta,
    submittedAt: row.submitted_at
  }));

  return {
    settings: {
      teacherUsername: settings.teacherUsername,
      salesGoal: settings.salesGoal
    },
    metrics: {
      studentCount: students.length,
      averageSales,
      averageMorale,
      activeResponses: getCurrentRound(null)?.responseCount || 0,
      topStudent: leaderboard[0] || null
    },
    students,
    awards,
    recentResponses
  };
}

function getUserResponseStats(userId) {
  const row = db.prepare(
    `SELECT COUNT(*) AS response_count,
            COALESCE(SUM(sales_delta), 0) AS total_sales_delta,
            COALESCE(SUM(satisfaction_delta), 0) AS total_satisfaction_delta,
            COALESCE(SUM(reputation_delta), 0) AS total_reputation_delta,
            COALESCE(SUM(CASE WHEN sales_delta > 0 THEN 1 ELSE 0 END), 0) AS positive_sales_count,
            COALESCE(SUM(CASE WHEN sales_delta < 0 THEN 1 ELSE 0 END), 0) AS negative_sales_count,
            COALESCE(SUM(CASE WHEN satisfaction_delta > 0 THEN 1 ELSE 0 END), 0) AS positive_satisfaction_count,
            COALESCE(SUM(CASE WHEN reputation_delta > 0 THEN 1 ELSE 0 END), 0) AS positive_reputation_count,
            COALESCE(MAX(sales_delta), 0) AS best_sales_event,
            COALESCE(MIN(sales_delta), 0) AS worst_sales_event
     FROM responses
     WHERE user_id = ?`
  ).get(userId);

  return {
    responseCount: Number(row?.response_count || 0),
    totalSalesDelta: Number(row?.total_sales_delta || 0),
    totalSatisfactionDelta: Number(row?.total_satisfaction_delta || 0),
    totalReputationDelta: Number(row?.total_reputation_delta || 0),
    positiveSalesCount: Number(row?.positive_sales_count || 0),
    negativeSalesCount: Number(row?.negative_sales_count || 0),
    positiveSatisfactionCount: Number(row?.positive_satisfaction_count || 0),
    positiveReputationCount: Number(row?.positive_reputation_count || 0),
    bestSalesEvent: Number(row?.best_sales_event || 0),
    worstSalesEvent: Number(row?.worst_sales_event || 0)
  };
}

function assignStudentAwards(students) {
  const awardLibrary = buildAwardLibrary();
  const sortedStudents = [...students].sort((a, b) => {
    if (b.aggregateScore !== a.aggregateScore) {
      return b.aggregateScore - a.aggregateScore;
    }
    return (a.rank || 999) - (b.rank || 999);
  });
  const availableAwards = [...awardLibrary];
  const assignments = [];

  sortedStudents.forEach((student, index) => {
    if (!availableAwards.length) {
      return;
    }

    let bestIndex = 0;
    let bestScore = -Infinity;
    availableAwards.forEach((award, awardIndex) => {
      const score = Number(award.score(student, students));
      if (score > bestScore) {
        bestScore = score;
        bestIndex = awardIndex;
      }
    });

    const [award] = availableAwards.splice(bestIndex, 1);
    assignments.push({
      studentId: student.id,
      studentName: student.displayName,
      title: award.title,
      subtitle: award.subtitle,
      reason: award.reason(student, students),
      sortOrder: index + 1
    });
  });

  return assignments.sort((a, b) => a.studentName.localeCompare(b.studentName));
}

function buildAwardLibrary() {
  return [
    {
      id: "rainmaker",
      title: "The Rainmaker",
      subtitle: "Top-line revenue driver",
      score: (student) => student.sales * 10 + student.aggregateScore,
      reason: (student) => `Generated ${formatAwardRevenue(student.sales)} and kept the dealership moving financially.`
    },
    {
      id: "culture_builder",
      title: "Culture Builder",
      subtitle: "Highest morale footprint",
      score: (student) => student.avgMorale * 8 + student.teamHealth,
      reason: (student) => `Finished with ${formatAwardPercent(student.avgMorale)} average morale and kept people from burning out.`
    },
    {
      id: "trusted_leader",
      title: "Trusted Leader",
      subtitle: "Strongest trust in management",
      score: (student) => student.avgTrust * 8 + student.teamHealth,
      reason: (student) => `Held team trust at ${formatAwardPercent(student.avgTrust)}, which means the staff kept believing in your calls.`
    },
    {
      id: "customer_whisperer",
      title: "Customer Whisperer",
      subtitle: "Best customer-facing instincts",
      score: (student) => student.satisfaction * 6 + student.responseStats.positiveSatisfactionCount * 8 + student.responseStats.positiveReputationCount * 4,
      reason: (student) => `Customer satisfaction stayed at ${formatAwardPercent(student.satisfaction)} and your choices consistently landed well with the public-facing side of the dealership.`
    },
    {
      id: "reputation_shield",
      title: "Reputation Shield",
      subtitle: "Protected the dealership name",
      score: (student) => student.reputation * 7 + student.responseStats.totalReputationDelta * 5,
      reason: (student) => `Closed with ${formatAwardPercent(student.reputation)} reputation and kept the store's image steadier than most.`
    },
    {
      id: "balanced_boss",
      title: "Balanced Boss",
      subtitle: "Best all-around operator",
      score: (student) => student.teamHealth * 7 + student.aggregateScore * 3 - Math.abs(student.avgMorale - student.avgTrust),
      reason: (student) => `Balanced revenue, morale, and trust into a ${formatAwardPercent(student.teamHealth)} team-health finish.`
    },
    {
      id: "systems_builder",
      title: "Systems Builder",
      subtitle: "Process-first manager",
      score: (student) => (student.managerProfile?.title === "Systems Builder" ? 500 : 0) + student.reputation * 4 + student.avgTrust * 2,
      reason: (student) => `Your dealership read like a process-driven shop that values structure and follow-through.`
    },
    {
      id: "people_first",
      title: "People-First Leader",
      subtitle: "Human-centered manager",
      score: (student) => (student.managerProfile?.title === "People-First Leader" ? 500 : 0) + student.avgMorale * 4 + student.satisfaction * 3,
      reason: (student) => `You consistently protected people and relationships, and the store felt it.`
    },
    {
      id: "growth_promoter",
      title: "Growth Promoter",
      subtitle: "Most momentum-friendly brand instincts",
      score: (student) => (student.managerProfile?.title === "Growth Promoter" ? 500 : 0) + student.sales * 4 + student.reputation * 2,
      reason: (student) => `You leaned into visibility and momentum without losing the store completely in the process.`
    },
    {
      id: "fast_closer",
      title: "Fast Lane Closer",
      subtitle: "Most decisive operator",
      score: (student) => (student.managerProfile?.title === "Fast-Moving Closer" ? 500 : 0) + student.responseStats.bestSalesEvent * 20 + student.sales * 3,
      reason: (student) => `Your biggest single-event revenue swing hit ${formatSignedAwardRevenue(student.responseStats.bestSalesEvent)}, and your style stayed aggressively decisive.`
    },
    {
      id: "resilience_engine",
      title: "Resilience Engine",
      subtitle: "Survived the roughest culture drag",
      score: (student) => (!student.isEliminated ? 300 : 0) + (100 - Math.min(student.lowestMorale, student.lowestTrust)) * 4 + student.aggregateScore,
      reason: (student) => `Kept the dealership alive even with low points like ${formatAwardPercent(student.lowestMorale)} morale / ${formatAwardPercent(student.lowestTrust)} trust at the floor.`
    },
    {
      id: "steady_hand",
      title: "Steady Hand",
      subtitle: "Most consistent under pressure",
      score: (student) => student.responseStats.responseCount * 20 - student.responseStats.negativeSalesCount * 8 + student.avgTrust * 2,
      reason: (student) => `Stayed comparatively stable across ${student.responseStats.responseCount} scored decisions without drifting into chaos.`
    },
    {
      id: "showroom_anchor",
      title: "Showroom Anchor",
      subtitle: "Held the floor together",
      score: (student) => student.avgTrust * 3 + student.avgMorale * 3 + student.responseStats.positiveReputationCount * 10,
      reason: (student) => `Your dealership felt like it had an adult in charge when the room got weird.`
    },
    {
      id: "profit_protector",
      title: "Profit Protector",
      subtitle: "Defended the bottom line",
      score: (student) => student.aggregateScore * 5 + student.responseStats.totalSalesDelta * 4 - student.responseStats.negativeSalesCount * 5,
      reason: (student) => `Protected the financial side of the dealership better than most, finishing at ${formatAwardScore(student.aggregateScore)} overall score.`
    },
    {
      id: "comeback_manager",
      title: "Comeback Manager",
      subtitle: "Recovered from shaky moments",
      score: (student) => (!student.isEliminated ? 200 : 0) + student.atRiskCount * 20 + student.responseStats.positiveSalesCount * 12 + student.teamHealth * 2,
      reason: (student) => `Worked through visible danger signs and still kept the dealership functional by the end.`
    },
    {
      id: "hard_lesson",
      title: "Hard Lesson Award",
      subtitle: "Most memorable management warning",
      score: (student) => (student.isEliminated ? 800 : 0) + (100 - student.lowestTrust) * 3 + (100 - student.lowestMorale) * 3,
      reason: (student) => student.isEliminated
        ? `${student.lossState?.name || "A staff member"} quitting made this the clearest lesson in how fast culture can break.`
        : `Came closest to the edge without fully losing the dealership, which made the management lesson impossible to miss.`
    }
  ];
}

function formatAwardRevenue(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}k`;
}

function formatSignedAwardRevenue(value) {
  const number = Math.round(Number(value || 0));
  return `${number >= 0 ? "+" : "-"}$${Math.abs(number).toLocaleString()}k`;
}

function formatAwardPercent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

function formatAwardScore(value) {
  return Number(value || 0).toFixed(1);
}

function getRoundById(roundId) {
  return db.prepare(
    `SELECT id, preset_id, round_number, category, headline, body, pressure, staff_focus_json,
            options_json, status, created_at, closed_at
     FROM rounds
     WHERE id = ?`
  ).get(roundId);
}

function getCurrentRound(session) {
  const currentRoundId = getGameState().currentRoundId;
  if (!currentRoundId) {
    return null;
  }
  const round = getRoundById(currentRoundId);
  if (!round) {
    return null;
  }
  return serializeRound(round, session);
}

function getRecentRounds(limit = 8, session) {
  return db.prepare(
    `SELECT id, preset_id, round_number, category, headline, body, pressure, staff_focus_json,
            options_json, status, created_at, closed_at
     FROM rounds
     ORDER BY round_number DESC, datetime(created_at) DESC
     LIMIT ?`
  ).all(limit).map((row) => serializeRound(row, session));
}

function serializeRound(row, session) {
  const isAdmin = Boolean(session?.isAdmin);
  const responseCount = db.prepare(`SELECT COUNT(*) AS count FROM responses WHERE round_id = ?`).get(row.id).count;
  const totalStudents = db.prepare(`SELECT COUNT(*) AS count FROM users`).get().count;
  const currentUserResponse = session?.userId ? getResponseForRound(row.id, session.userId) : null;
  const preset = getRoundPreset(row);
  const existingCaseFile = session?.userId ? getCaseFile(row.id, session.userId) : null;
  const caseFile = session?.userId ? (existingCaseFile || ensureCaseFile(row.id, session.userId)) : null;
  const studentCase = caseFile ? serializeCaseFile(caseFile, row, preset) : null;

  return {
    id: row.id,
    presetId: row.preset_id,
    roundNumber: row.round_number,
    category: row.category,
    headline: row.headline,
    body: row.body,
    pressure: row.pressure,
    staffFocus: parseJsonValue(row.staff_focus_json, []),
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    responseCount,
    totalStudents,
    responseRate: totalStudents ? Math.round((responseCount / totalStudents) * 100) : 0,
    topChoiceLabel: null,
    consultants: isAdmin ? Object.keys(getNodeDefinition(preset, preset?.rootNodeId)?.consultants || {}) : undefined,
    userResponse: currentUserResponse,
    studentCase,
    completedCount: responseCount,
    inProgressCount: db.prepare(`SELECT COUNT(*) AS count FROM case_files WHERE round_id = ? AND status = 'active'`).get(row.id).count,
    teacherSnapshot: isAdmin ? buildTeacherEventSnapshot(row.id, preset) : null
  };
}

function serializeCaseFile(caseFile, round, preset) {
  const context = parseJsonValue(caseFile.context_json, {});
  const node = getNodeDefinition(preset, caseFile.current_node_id);
  const selectedConsultant = caseFile.selected_consultant_id ? getStaffMember(caseFile.selected_consultant_id) : null;
  const consultantDefinition = selectedConsultant ? getNodeConsultantDefinition(node, selectedConsultant.id) : null;
  const rawChoices = getCaseChoices(caseFile.id);
  const cumulativeImpact = summarizeCaseChoices(rawChoices);
  const choiceLog = rawChoices.map((choice) => ({
    stepIndex: choice.step_index,
    nodeId: choice.node_id,
    phase: choice.phase,
    consultantId: choice.consultant_id,
    actionId: choice.action_id,
    label: choice.label,
    summary: choice.summary,
    salesDelta: choice.sales_delta,
    satisfactionDelta: choice.satisfaction_delta,
    reputationDelta: choice.reputation_delta,
    createdAt: choice.created_at
  }));

  return {
    id: caseFile.id,
    status: caseFile.status,
    lossState: context.lossState || null,
    currentNodeId: caseFile.current_node_id,
    currentPhase: caseFile.current_phase,
    selectedConsultantId: caseFile.selected_consultant_id || null,
    stepIndex: Number(context.stepIndex || 1),
    availableConsultants: caseFile.current_phase === "consultant"
      ? getAvailableConsultants(node, context).map((staffId) => {
          const staff = getStaffMember(staffId);
          return {
            id: staffId,
            name: staff?.name || staffId,
            title: staff?.title || ""
          };
        })
      : [],
    currentPromptTitle: node?.title || round.headline,
    currentPromptBody: caseFile.current_phase === "action"
      ? consultantDefinition?.prompt || node?.body || round.body
      : node?.body || round.body,
    selectedConsultant: selectedConsultant
      ? {
          id: selectedConsultant.id,
          name: selectedConsultant.name,
          title: selectedConsultant.title
        }
      : null,
    actionOptions: caseFile.current_phase === "action"
      ? (consultantDefinition?.options || []).map((option) => ({
          id: option.id,
          label: option.label
        }))
      : [],
    visitedConsultants: context.visitedConsultants || [],
    choiceLog,
    cumulativeImpact: {
      actionCount: cumulativeImpact.actionCount,
      consultantCount: cumulativeImpact.consultantCount,
      salesDelta: roundNumber(cumulativeImpact.salesDelta, 0),
      satisfactionDelta: roundNumber(cumulativeImpact.satisfactionDelta, 0),
      reputationDelta: roundNumber(cumulativeImpact.reputationDelta, 0)
    },
    totalSteps: Math.max(Number(context.stepIndex || 1), getMaxChainSteps(preset, preset?.rootNodeId || caseFile.current_node_id))
  };
}

function buildCaseProgressLabel(caseFile) {
  if (!caseFile) {
    return "Waiting";
  }
  if (caseFile.status === "lost") {
    return "Lost";
  }
  if (caseFile.status === "resolved") {
    return "Completed";
  }
  const context = parseJsonValue(caseFile.context_json, {});
  const step = Number(context.stepIndex || 1);
  if (caseFile.current_phase === "consultant") {
    return `Choosing staff for step ${step}`;
  }
  return `Action ready at step ${step}`;
}

function buildTeacherEventSnapshot(roundId, preset) {
  const openingRows = db.prepare(
    `SELECT consultant_id
     FROM case_choices
     WHERE phase = 'consultant'
       AND step_index = 1
       AND case_file_id IN (SELECT id FROM case_files WHERE round_id = ?)`
  ).all(roundId);
  const consultantCounts = {};
  openingRows.forEach((row) => {
    consultantCounts[row.consultant_id] = (consultantCounts[row.consultant_id] || 0) + 1;
  });

  const activeNodeRows = db.prepare(
    `SELECT current_node_id, COUNT(*) AS count
     FROM case_files
     WHERE round_id = ? AND status = 'active'
     GROUP BY current_node_id`
  ).all(roundId);

  return {
    openingConsultants: Object.keys(getNodeDefinition(preset, preset?.rootNodeId)?.consultants || {}).map((staffId) => ({
      staffId,
      count: consultantCounts[staffId] || 0
    })),
    activeNodes: activeNodeRows
      .map((row) => ({
        nodeId: row.current_node_id,
        title: getNodeDefinition(preset, row.current_node_id)?.title || row.current_node_id,
        count: Number(row.count || 0)
      }))
      .sort((a, b) => b.count - a.count)
  };
}

function getResponseForRound(roundId, userId) {
  const row = db.prepare(
    `SELECT id, option_id, option_label, outcome_text, note_text, sales_delta,
            satisfaction_delta, reputation_delta, submitted_at
     FROM responses
     WHERE round_id = ? AND user_id = ?`
  ).get(roundId, userId);

  if (!row) {
    return null;
  }

  const staffEffects = db.prepare(
    `SELECT staff_id, morale_delta, trust_delta
     FROM response_staff_effects
     WHERE response_id = ?`
  ).all(row.id).map((effect) => ({
    staffId: effect.staff_id,
    moraleDelta: effect.morale_delta,
    trustDelta: effect.trust_delta
  }));

  return {
    id: row.id,
    optionId: row.option_id,
    optionLabel: row.option_label,
    outcomeText: row.outcome_text,
    noteText: row.note_text,
    salesDelta: row.sales_delta,
    satisfactionDelta: row.satisfaction_delta,
    reputationDelta: row.reputation_delta,
    submittedAt: row.submitted_at,
    staffEffects
  };
}

function updateSessionState(isOpen) {
  const current = getGameState();
  if (isOpen === current.isOpen) {
    return;
  }

  if (isOpen) {
    db.prepare(
      `UPDATE game_state
       SET is_open = 1, session_number = ?, last_opened_at = ?
       WHERE id = 1`
    ).run(current.sessionNumber + 1, new Date().toISOString());
    return;
  }

  closeCurrentRound();
  db.prepare(
    `UPDATE game_state
     SET is_open = 0, last_closed_at = ?
     WHERE id = 1`
  ).run(new Date().toISOString());
}

function closeCurrentRound() {
  const current = getGameState();
  if (!current.currentRoundId) {
    return;
  }

  db.prepare(
    `UPDATE rounds
     SET status = 'closed', closed_at = ?
     WHERE id = ?`
  ).run(new Date().toISOString(), current.currentRoundId);

  db.prepare(
    `UPDATE case_files
     SET status = CASE WHEN status IN ('resolved', 'lost') THEN status ELSE 'closed' END,
         updated_at = ?,
         resolved_at = CASE WHEN status IN ('resolved', 'lost') THEN resolved_at ELSE ? END
     WHERE round_id = ?`
  ).run(new Date().toISOString(), new Date().toISOString(), current.currentRoundId);

  db.prepare(`UPDATE game_state SET current_round_id = NULL WHERE id = 1`).run();
}

function publishRound(presetId, customHeadline, customBody) {
  const game = getGameState();
  if (!game.isOpen) {
    throw new Error("Open the class session before launching a scenario.");
  }
  const preset = getScenarioPreset(presetId);
  if (!preset) {
    throw new Error("That scenario preset could not be found.");
  }

  closeCurrentRound();

  const roundId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const nextRoundNumber = game.roundNumber + 1;

  db.prepare(
    `INSERT INTO rounds
     (id, preset_id, round_number, category, headline, body, pressure, staff_focus_json, options_json, status, created_at, closed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NULL)`
  ).run(
    roundId,
    presetId,
    nextRoundNumber,
    preset.category,
    customHeadline || preset.headline,
    customBody || preset.body,
    preset.pressure,
    JSON.stringify([]),
    JSON.stringify({}),
    createdAt
  );

  db.prepare(
    `UPDATE game_state SET current_round_id = ?, round_number = ? WHERE id = 1`
  ).run(roundId, nextRoundNumber);

  const users = db.prepare(`SELECT id FROM users`).all();
  users.forEach((user) => createCaseFile(roundId, user.id, preset));
}

function submitResponse(userId, optionId) {
  const game = getGameState();
  if (!game.isOpen) {
    throw new Error("The class session is currently closed.");
  }

  const lossState = getUserLossState(userId);
  if (lossState) {
    throw new Error(`${lossState.name} already quit your dealership. You are out of the game until standings are reset.`);
  }

  if (!game.currentRoundId) {
    throw new Error("There is no active dealership situation right now.");
  }

  if (getResponseForRound(game.currentRoundId, userId)) {
    throw new Error("You already resolved the current global event.");
  }

  const round = getRoundById(game.currentRoundId);
  if (!round || round.status !== "active") {
    throw new Error("That round is no longer active.");
  }
  const preset = getRoundPreset(round);
  const caseFile = ensureCaseFile(round.id, userId);
  if (!preset || !caseFile || caseFile.status !== "active") {
    throw new Error("Your dealership does not have an active case for this event.");
  }

  if (caseFile.current_phase === "consultant") {
    chooseConsultant(caseFile, preset, optionId);
    return;
  }

  if (caseFile.current_phase === "action") {
    chooseAction(caseFile, round, preset, optionId);
    return;
  }

  throw new Error("This case can no longer be advanced.");
}

function mergeStaffEffects(base, extra) {
  const merged = {};
  const ids = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
  ids.forEach((staffId) => {
    merged[staffId] = {
      morale: Math.round(Number(base?.[staffId]?.morale || 0) + Number(extra?.[staffId]?.morale || 0)),
      trust: Math.round(Number(base?.[staffId]?.trust || 0) + Number(extra?.[staffId]?.trust || 0))
    };
  });
  return merged;
}

function chooseConsultant(caseFile, preset, consultantId) {
  const context = parseJsonValue(caseFile.context_json, {});
  const node = getNodeDefinition(preset, caseFile.current_node_id);
  const available = getAvailableConsultants(node, context);
  if (!available.includes(consultantId)) {
    throw new Error("That staff member is not available for this step.");
  }

  const consultant = getStaffMember(consultantId);
  const nextContext = {
    ...context,
    selectedConsultantId: consultantId,
    visitedConsultants: Array.from(new Set([...(context.visitedConsultants || []), consultantId]))
  };

  db.prepare(
    `UPDATE case_files
     SET current_phase = 'action', selected_consultant_id = ?, context_json = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    consultantId,
    JSON.stringify(nextContext),
    new Date().toISOString(),
    caseFile.id
  );

  db.prepare(
    `INSERT INTO case_choices
     (id, case_file_id, step_index, node_id, phase, consultant_id, action_id, label, summary, sales_delta, satisfaction_delta, reputation_delta, created_at)
     VALUES (?, ?, ?, ?, 'consultant', ?, NULL, ?, ?, 0, 0, 0, ?)`
  ).run(
    crypto.randomUUID(),
    caseFile.id,
    Number(context.stepIndex || 1),
    caseFile.current_node_id,
    consultantId,
    consultant?.name || consultantId,
    `${consultant?.name || consultantId} gave you their lens on the situation.`,
    new Date().toISOString()
  );
}

function chooseAction(caseFile, round, preset, actionId) {
  const context = parseJsonValue(caseFile.context_json, {});
  const node = getNodeDefinition(preset, caseFile.current_node_id);
  const consultantId = caseFile.selected_consultant_id;
  const consultantDefinition = getNodeConsultantDefinition(node, consultantId);
  const option = (consultantDefinition?.options || []).find((entry) => entry.id === actionId);
  if (!option) {
    throw new Error("That action is not available for the selected staff member.");
  }

  const baseEffects = option.effects || {};
  const dynamicOutcome = evaluateDynamicOutcome(
    caseFile.user_id,
    {
      ...round,
      category: round.category,
      pressure: round.pressure,
      staff_focus_json: JSON.stringify([consultantId])
    },
    option,
    baseEffects
  );
  const staffEffects = mergeStaffEffects(baseEffects.staff || {}, dynamicOutcome.staffEffects || {});
  const lossAfterAction = applyDealershipOutcome(caseFile.user_id, dynamicOutcome, staffEffects);
  applyManagerFlagChanges(caseFile.user_id, dynamicOutcome.flagChanges);
  const resolvedOutcome = lossAfterAction
    ? {
        ...dynamicOutcome,
        note: `${dynamicOutcome.note} ${lossAfterAction.message} Your dealership is out of the game.`.trim()
      }
    : dynamicOutcome;

  const nextNodeId = option.nextNodeId || null;
  const nextStep = Number(context.stepIndex || 1) + 1;
  const nextContext = {
    ...context,
    selectedConsultantId: null,
    chainLog: [
      ...(context.chainLog || []),
      {
        nodeId: caseFile.current_node_id,
        consultantId,
        actionId: option.id,
        label: option.label,
        note: dynamicOutcome.note
      }
    ],
    stepIndex: nextNodeId ? nextStep : Number(context.stepIndex || 1),
    visitedNodes: nextNodeId
      ? Array.from(new Set([...(context.visitedNodes || []), nextNodeId]))
      : context.visitedNodes || []
  };

  db.prepare(
    `INSERT INTO case_choices
     (id, case_file_id, step_index, node_id, phase, consultant_id, action_id, label, summary, sales_delta, satisfaction_delta, reputation_delta, created_at)
     VALUES (?, ?, ?, ?, 'action', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    caseFile.id,
    Number(context.stepIndex || 1),
    caseFile.current_node_id,
    consultantId,
    option.id,
    option.label,
    `${option.outcome} ${resolvedOutcome.note}`.trim(),
    resolvedOutcome.salesDelta,
    resolvedOutcome.satisfactionDelta,
    resolvedOutcome.reputationDelta,
    new Date().toISOString()
  );

  if (lossAfterAction) {
    resolveCaseFile(
      caseFile,
      round,
      option,
      resolvedOutcome,
      {
        ...nextContext,
        lossState: lossAfterAction
      },
      staffEffects,
      "lost"
    );
    return;
  }

  if (nextNodeId) {
    db.prepare(
      `UPDATE case_files
       SET current_node_id = ?, current_phase = 'consultant', selected_consultant_id = NULL,
           context_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      nextNodeId,
      JSON.stringify(nextContext),
      new Date().toISOString(),
      caseFile.id
    );
    return;
  }

  resolveCaseFile(caseFile, round, option, resolvedOutcome, nextContext, staffEffects);
}

function applyDealershipOutcome(userId, dynamicOutcome, staffEffects) {
  const user = getUserById(userId);
  db.prepare(
    `UPDATE users
     SET sales = ?, satisfaction = ?, reputation = ?
     WHERE id = ?`
  ).run(
    Math.max(0, roundNumber(user.sales + dynamicOutcome.salesDelta, 0)),
    clampPercent(user.satisfaction + dynamicOutcome.satisfactionDelta),
    clampPercent(user.reputation + dynamicOutcome.reputationDelta),
    userId
  );

  Object.entries(staffEffects).forEach(([staffId, deltas]) => {
    const current = db.prepare(
      `SELECT morale, trust FROM staff_state WHERE user_id = ? AND staff_id = ?`
    ).get(userId, staffId);
    const nextMorale = clampPercent((current?.morale ?? 65) + Number(deltas.morale || 0));
    const nextTrust = clampPercent((current?.trust ?? 65) + Number(deltas.trust || 0));
    db.prepare(
      `INSERT INTO staff_state (user_id, staff_id, morale, trust)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, staff_id) DO UPDATE SET morale = excluded.morale, trust = excluded.trust`
    ).run(userId, staffId, nextMorale, nextTrust);
  });

  return getUserLossState(userId);
}

function resolveCaseFile(caseFile, round, option, dynamicOutcome, nextContext, staffEffects, status = "resolved") {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE case_files
     SET status = ?, current_phase = ?, selected_consultant_id = NULL,
         context_json = ?, updated_at = ?, resolved_at = ?
     WHERE id = ?`
  ).run(status, status, JSON.stringify(nextContext), now, now, caseFile.id);

  const totals = summarizeCaseChoices(getCaseChoices(caseFile.id));
  const responseId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO responses
     (id, round_id, user_id, option_id, option_label, outcome_text, note_text,
      sales_delta, satisfaction_delta, reputation_delta, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    responseId,
    round.id,
    caseFile.user_id,
    option.id,
    option.label,
    option.outcome,
    dynamicOutcome.note,
    roundNumber(totals.salesDelta, 0),
    roundNumber(totals.satisfactionDelta, 0),
    roundNumber(totals.reputationDelta, 0),
    now
  );

  Object.entries(staffEffects).forEach(([staffId, deltas]) => {
    db.prepare(
      `INSERT INTO response_staff_effects (response_id, staff_id, morale_delta, trust_delta)
       VALUES (?, ?, ?, ?)`
    ).run(responseId, staffId, Math.round(Number(deltas.morale || 0)), Math.round(Number(deltas.trust || 0)));
  });
}

function evaluateDynamicOutcome(userId, round, option, baseEffects) {
  const profile = inferDecisionProfile(round, option, baseEffects);
  const user = serializeUser(userId);
  const flags = getManagerFlags(userId);
  const recentRows = getRecentDecisionRows(userId, 5);
  const focusedStaffIds = Array.isArray(parseJsonValue(round.staff_focus_json, []))
    ? parseJsonValue(round.staff_focus_json, [])
    : [];
  const staffEffects = {};
  const noteParts = [];
  const flagChanges = buildFlagChanges(profile);

  let salesDelta = computeRevenueDelta(baseEffects, profile);
  let satisfactionDelta = Math.round(Number(baseEffects.satisfaction || 0));
  let reputationDelta = Math.round(Number(baseEffects.reputation || 0));

  user.staff.forEach((staffMember) => {
    const role = getStaffMember(staffMember.id);
    const alignment = computePreferenceAlignment(role?.preferences || {}, profile);
    const isFocused = focusedStaffIds.includes(staffMember.id);
    const adjustment = convertAlignmentToStaffAdjustment(alignment, staffMember, profile, isFocused);
    if (adjustment.morale !== 0 || adjustment.trust !== 0) {
      staffEffects[staffMember.id] = adjustment;
    }
  });

  noteParts.push(describeDecisionFrame(round, profile));

  if (user.avgMorale > 82 && user.avgTrust > 78) {
    salesDelta += 2;
    reputationDelta += 1;
    noteParts.push("Because your team is already aligned, they carried the decision with extra momentum.");
  }

  if (user.staff.some((staff) => staff.morale < 35)) {
    salesDelta -= 3;
    reputationDelta -= 2;
    noteParts.push("A low-morale employee slowed execution behind the scenes, so the dealership could not fully capitalize on your choice.");
  }

  if (user.avgTrust < 50 && profile.customerCare >= 2) {
    satisfactionDelta -= 2;
    noteParts.push("Even though the decision sounded right, weak trust in leadership made the follow-through feel inconsistent.");
  }

  if ((flags.system_discipline || 0) >= 3 && profile.process + profile.discipline + profile.transparency >= 4) {
    reputationDelta += 2;
    if (["Financial Control", "Compensation", "Scheduling", "Budget Call"].includes(round.category)) {
      salesDelta += 1;
    }
    noteParts.push("The systems you have been building made this decision easier for the dealership to execute cleanly.");
  }

  if ((flags.customer_trust || 0) >= 3 && profile.customerCare >= 2) {
    satisfactionDelta += 2;
    reputationDelta += 1;
    noteParts.push("Because customers increasingly expect fair treatment from your store, the response landed better than it would have earlier.");
  }

  if ((flags.speed_pressure || 0) >= 3 && profile.speed >= 2 && profile.discipline < 2) {
    salesDelta += 1;
    satisfactionDelta -= 2;
    reputationDelta -= 2;
    noteParts.push("The dealership is getting faster at rushing decisions, which helped the immediate result but quietly weakened consistency.");
  }

  if ((flags.team_resentment || 0) >= 3 && profile.publicAccountability + profile.forcefulness >= 3) {
    reputationDelta -= 1;
    Object.keys(staffEffects).forEach((staffId) => {
      staffEffects[staffId].trust -= 1;
    });
    noteParts.push("Because the staff has built up some resentment, the harder tone of this decision cost you more trust than usual.");
  }

  if ((flags.creative_confidence || 0) >= 3 && ["Promotion", "Budget Call"].includes(round.category) && profile.creativity >= 2) {
    salesDelta += 2;
    satisfactionDelta += 1;
    noteParts.push("Your dealership has become more confident at executing visible ideas, so the creative move generated extra lift.");
  }

  if (isResultsFirstStreak(recentRows) && profile.speed + profile.forcefulness >= 3) {
    reputationDelta -= 1;
    const lowestTrustStaff = [...user.staff].sort((a, b) => a.trust - b.trust)[0];
    if (lowestTrustStaff) {
      const current = staffEffects[lowestTrustStaff.id] || { morale: 0, trust: 0 };
      staffEffects[lowestTrustStaff.id] = { morale: current.morale - 1, trust: current.trust - 2 };
      noteParts.push(`${lowestTrustStaff.name} read the decision as another sign that results matter more than consistency.`);
    }
  }

  if (isBalancedStreak(recentRows) && profile.fairness + profile.transparency + profile.customerCare >= 3) {
    satisfactionDelta += 1;
    reputationDelta += 1;
    noteParts.push("Your recent pattern of balanced management gave the team and customers more confidence in this call.");
  }

  const rewardBonus = computeRevenueRewardBonus(user, {
    profile,
    baseEffects,
    salesDelta,
    satisfactionDelta,
    reputationDelta
  });
  if (rewardBonus !== 0) {
    salesDelta += rewardBonus;
    if (rewardBonus > 0) {
      noteParts.push(`Strong morale and dealership reputation created a +$${rewardBonus}k reward bonus on this outcome.`);
    } else {
      noteParts.push(`Weak morale and reputation shaved $${Math.abs(rewardBonus)}k off the result before it hit the board.`);
    }
  }

  const cultureNote = describeCultureState(user, flags);
  if (cultureNote) {
    noteParts.push(cultureNote);
  }

  const topStaffReaction = describeTopStaffReaction(user.staff, mergeStaffEffects(baseEffects.staff || {}, staffEffects));
  if (topStaffReaction) {
    noteParts.unshift(topStaffReaction);
  }

  return {
    salesDelta: roundNumber(salesDelta, 0),
    satisfactionDelta: Math.round(satisfactionDelta),
    reputationDelta: Math.round(reputationDelta),
    staffEffects,
    flagChanges,
    note: noteParts.length
      ? noteParts.join(" ")
      : "The result was shaped by the current culture of your dealership, not just the button you clicked."
  };
}

function inferDecisionProfile(round, option, baseEffects) {
  const label = String(option.label || "").toLowerCase();
  const profile = {
    speed: 0,
    process: 0,
    discipline: 0,
    transparency: 0,
    fairness: 0,
    customerCare: 0,
    creativity: 0,
    autonomy: 0,
    quality: 0,
    respect: 0,
    recognition: 0,
    forcefulness: 0,
    publicAccountability: 0,
    realisticWorkload: 0,
    riskControl: 0
  };

  const categoryBoosts = {
    "Sales Conflict": { fairness: 2, process: 1, recognition: 1 },
    "Customer Promise": { customerCare: 2, quality: 1, speed: 1, transparency: 1 },
    "Budget Call": { discipline: 2, creativity: 2, riskControl: 1 },
    Compensation: { fairness: 2, transparency: 2, discipline: 1 },
    Workload: { realisticWorkload: 3, quality: 2, speed: 1, respect: 1 },
    "Customer Complaint": { customerCare: 3, transparency: 2 },
    Scheduling: { process: 2, fairness: 2, realisticWorkload: 1 },
    Promotion: { creativity: 3, autonomy: 1, recognition: 1 },
    "Financial Control": { discipline: 3, transparency: 2, riskControl: 2 },
    Reputation: { customerCare: 2, transparency: 2, recognition: 1 }
  };

  applyDimensionBoosts(profile, categoryBoosts[round.category] || {});

  if (label.includes("review") || label.includes("audit")) {
    applyDimensionBoosts(profile, { process: 2, transparency: 2, discipline: 1, riskControl: 1 });
  }
  if (label.includes("rule") || label.includes("approval") || label.includes("scorecard") || label.includes("tracking")) {
    applyDimensionBoosts(profile, { process: 2, discipline: 2, transparency: 1 });
  }
  if (label.includes("split") || label.includes("shared") || label.includes("compromise")) {
    applyDimensionBoosts(profile, { fairness: 2, respect: 1 });
  }
  if (label.includes("honor") || label.includes("respond publicly") || label.includes("call the customer") || label.includes("follow-up")) {
    applyDimensionBoosts(profile, { customerCare: 2, transparency: 1 });
  }
  if (label.includes("approve") || label.includes("launch") || label.includes("partnership") || label.includes("campaign")) {
    applyDimensionBoosts(profile, { creativity: 2, autonomy: 1, recognition: 1 });
  }
  if (label.includes("deny") || label.includes("refuse") || label.includes("hold line") || label.includes("defend")) {
    applyDimensionBoosts(profile, { discipline: 1, forcefulness: 1 });
  }
  if (label.includes("push") || label.includes("make it happen") || label.includes("deliver anyway") || label.includes("floor-first")) {
    applyDimensionBoosts(profile, { speed: 2, forcefulness: 1, recognition: 1 });
  }
  if (label.includes("public") || label.includes("warn")) {
    applyDimensionBoosts(profile, { publicAccountability: 2, forcefulness: 2 });
  }
  if (label.includes("protect") || label.includes("quality") || label.includes("slow") || label.includes("limit")) {
    applyDimensionBoosts(profile, { quality: 1, realisticWorkload: 2, discipline: 1 });
  }
  if (baseEffects.sales >= 8) {
    profile.speed += 1;
  }
  if (baseEffects.satisfaction >= 3) {
    profile.customerCare += 1;
  }
  if (baseEffects.reputation >= 3) {
    profile.transparency += 1;
    profile.discipline += 1;
  }

  return profile;
}

function applyDimensionBoosts(target, boosts) {
  Object.entries(boosts).forEach(([key, value]) => {
    target[key] = (target[key] || 0) + Number(value || 0);
  });
}

function computeRevenueDelta(baseEffects, profile) {
  const rawBaseSales = Number(baseEffects.sales || 0);
  let tuned = rawBaseSales >= 0
    ? rawBaseSales * REVENUE_TUNING.positiveMultiplier
    : rawBaseSales * REVENUE_TUNING.negativeMultiplier;

  const hasHealthyCustomerShape = Number(baseEffects.satisfaction || 0) >= 0 && Number(baseEffects.reputation || 0) >= 0;
  if (rawBaseSales >= 0 && hasHealthyCustomerShape) {
    tuned += REVENUE_TUNING.cleanExecutionFloor;
  }

  if (profile.customerCare + profile.fairness + profile.transparency >= 5 && rawBaseSales >= 0) {
    tuned += 1;
  }

  return roundNumber(tuned, 0);
}

function computeRevenueRewardBonus(user, outcome) {
  const { profile, baseEffects, salesDelta, satisfactionDelta, reputationDelta } = outcome;
  let bonus = 0;

  if (user.avgMorale >= 80) {
    bonus += 2;
  } else if (user.avgMorale >= 68) {
    bonus += 1;
  } else if (user.avgMorale < 45) {
    bonus -= 1;
  }

  if (user.reputation >= 82) {
    bonus += 3;
  } else if (user.reputation >= 70) {
    bonus += 2;
  } else if (user.reputation >= 58) {
    bonus += 1;
  } else if (user.reputation < 40) {
    bonus -= 2;
  }

  if (salesDelta >= 4 && satisfactionDelta >= 1 && reputationDelta >= 1) {
    bonus += 1;
  }

  if (profile.customerCare + profile.fairness + profile.transparency >= 5 && user.avgMorale >= 60) {
    bonus += 1;
  }

  if (Number(baseEffects.sales || 0) < 0 && (satisfactionDelta < 0 || reputationDelta < 0)) {
    bonus = Math.min(bonus, 0);
  }

  return roundNumber(bonus, 0);
}

function computePreferenceAlignment(preferences, profile) {
  return Object.entries(preferences).reduce((sum, [dimension, weight]) => {
    return sum + Number(weight || 0) * Number(profile[dimension] || 0);
  }, 0);
}

function convertAlignmentToStaffAdjustment(alignment, staffMember, profile, isFocused) {
  let morale = 0;
  let trust = 0;

  if (alignment >= 16) {
    morale += isFocused ? 3 : 2;
    trust += isFocused ? 3 : 2;
  } else if (alignment >= 8) {
    morale += 2;
    trust += isFocused ? 2 : 1;
  } else if (alignment <= -16) {
    morale -= isFocused ? 3 : 2;
    trust -= isFocused ? 4 : 2;
  } else if (alignment <= -8) {
    morale -= 1;
    trust -= isFocused ? 2 : 1;
  }

  if (staffMember.morale < 45 && alignment > 0) {
    morale += 1;
    trust += 1;
  }
  if (staffMember.trust < 45 && (profile.transparency >= 2 || profile.fairness >= 2)) {
    trust += 1;
  }
  if (staffMember.morale > 80 && alignment < 0) {
    morale -= 1;
  }
  if (profile.publicAccountability >= 2 && isFocused) {
    trust -= 1;
  }

  return { morale, trust };
}

function buildFlagChanges(profile) {
  const systemScore = profile.process + profile.discipline + profile.transparency - profile.speed - profile.forcefulness;
  const customerScore = profile.customerCare + profile.fairness + profile.transparency - profile.forcefulness;
  const resentmentScore = profile.forcefulness + profile.publicAccountability - profile.fairness - profile.respect;
  const speedScore = profile.speed + profile.recognition + profile.forcefulness - profile.discipline - profile.process;
  const creativeScore = profile.creativity + profile.autonomy - profile.discipline;

  return {
    system_discipline: scoreToFlagDelta(systemScore),
    customer_trust: scoreToFlagDelta(customerScore),
    team_resentment: scoreToFlagDelta(resentmentScore),
    speed_pressure: scoreToFlagDelta(speedScore),
    creative_confidence: scoreToFlagDelta(creativeScore)
  };
}

function applyManagerFlagChanges(userId, flagChanges) {
  const current = getManagerFlags(userId);
  Object.entries(flagChanges || {}).forEach(([key, delta]) => {
    if (!delta) {
      return;
    }
    setManagerFlag(userId, key, (current[key] || 0) + Number(delta));
  });
}

function describeTopStaffReaction(staffState, staffEffects) {
  const strongest = Object.entries(staffEffects)
    .map(([staffId, delta]) => ({
      staff: staffState.find((member) => member.id === staffId),
      weight: Math.abs(delta.morale || 0) + Math.abs(delta.trust || 0),
      delta
    }))
    .filter((entry) => entry.staff && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)[0];

  if (!strongest) {
    return "";
  }

  const { staff, delta } = strongest;
  const total = (delta.morale || 0) + (delta.trust || 0);
  if (total >= 4) {
    return `${staff.name} felt especially backed by this choice, which strengthened the dealership's internal follow-through.`;
  }
  if (total <= -4) {
    return `${staff.name} took this decision personally, and that reaction changed how smoothly the result played out.`;
  }
  return `${staff.name} noticed the call, even if the effect was more subtle than the headline result.`;
}

function describeDecisionFrame(round, profile) {
  if (profile.process + profile.discipline + profile.transparency >= 6) {
    return `This was a structure-first response in a ${round.category.toLowerCase()} situation, so the dealership treated it like a policy signal, not just a one-time fix.`;
  }
  if (profile.customerCare + profile.fairness >= 5) {
    return `This was a relationship-first response, which changed how both staff and customers interpreted your priorities.`;
  }
  if (profile.speed + profile.forcefulness >= 5) {
    return `This was a momentum-first response, so the immediate result came quickly but the long-tail consequences mattered more.`;
  }
  if (profile.creativity + profile.autonomy >= 4) {
    return `This response gave the dealership permission to move more boldly, which can help if the team is ready to execute it.`;
  }
  return `The decision landed as a measured management call rather than a simple right-or-wrong answer.`;
}

function describeCultureState(user, flags) {
  if (user.avgMorale < 50) {
    return "Because morale is already strained, even a reasonable decision can create more drag than it would in a healthier store.";
  }
  if (user.avgTrust < 50) {
    return "Because trust in leadership is fragile, the team watched your tone and consistency as closely as the decision itself.";
  }
  if ((flags.system_discipline || 0) >= 3) {
    return "The dealership is starting to behave like it has real operating standards, which changes how future problems compound.";
  }
  if ((flags.speed_pressure || 0) >= 3) {
    return "The store is starting to expect fast answers from you, which helps urgency but can make sloppy habits easier to normalize.";
  }
  return "";
}

function buildLossState(staff) {
  const quitter = [...staff]
    .filter((member) => member.morale <= 0 || member.trust <= 0)
    .sort((a, b) => Math.min(a.morale, a.trust) - Math.min(b.morale, b.trust))[0];
  if (!quitter) {
    return null;
  }

  const trigger = quitter.morale <= 0 && quitter.trust <= 0
    ? "morale and trust"
    : quitter.morale <= 0
      ? "morale"
      : "trust";

  return {
    staffId: quitter.id,
    name: quitter.name,
    trigger,
    message: trigger === "morale and trust"
      ? `${quitter.name} quit after both morale and trust collapsed.`
      : trigger === "morale"
        ? `${quitter.name} quit after morale hit zero.`
        : `${quitter.name} quit after trust in management hit zero.`
  };
}

function getUserLossState(userId) {
  const staffRows = db.prepare(
    `SELECT staff_id, morale, trust FROM staff_state WHERE user_id = ?`
  ).all(userId);
  if (!staffRows.length) {
    return null;
  }

  const staffMap = new Map(staffRows.map((row) => [row.staff_id, row]));
  const staff = STAFF_MEMBERS.map((member) => {
    const current = staffMap.get(member.id);
    return {
      id: member.id,
      name: member.name,
      morale: clampPercent(current?.morale ?? member.defaultMorale),
      trust: clampPercent(current?.trust ?? member.defaultTrust)
    };
  });

  return buildLossState(staff);
}

function computeAggregateScore(sales, avgMorale, avgTrust) {
  const salesGoal = Math.max(1, getSalesGoal());
  const normalizedRevenue = Math.min(160, Math.max(0, Number(sales || 0)) / salesGoal * 100);
  return roundNumber(
    normalizedRevenue * SCORE_WEIGHTS.revenue
      + Number(avgMorale || 0) * SCORE_WEIGHTS.morale
      + Number(avgTrust || 0) * SCORE_WEIGHTS.trust,
    1
  );
}

function scoreToFlagDelta(score) {
  if (score >= 5) {
    return 2;
  }
  if (score >= 2) {
    return 1;
  }
  if (score <= -5) {
    return -2;
  }
  if (score <= -2) {
    return -1;
  }
  return 0;
}

function isResultsFirstStreak(rows) {
  if (rows.length < 3) {
    return false;
  }
  return rows.slice(0, 3).every((row) => Number(row.sales_delta) >= 7 && (Number(row.satisfaction_delta) < 2 || Number(row.reputation_delta) < 2));
}

function isBalancedStreak(rows) {
  if (rows.length < 3) {
    return false;
  }
  return rows.slice(0, 3).every((row) => Number(row.sales_delta) >= 5 && Number(row.satisfaction_delta) >= 1 && Number(row.reputation_delta) >= 1);
}

function buildManagerProfile(flags) {
  const discipline = flags.system_discipline || 0;
  const customerTrust = flags.customer_trust || 0;
  const resentment = flags.team_resentment || 0;
  const speed = flags.speed_pressure || 0;
  const creative = flags.creative_confidence || 0;

  if (discipline >= 3 && customerTrust >= 2) {
    return {
      title: "Balanced Operator",
      summary: "You are building a manager profile that blends structure with trust."
    };
  }
  if (discipline >= 3) {
    return {
      title: "Systems Builder",
      summary: "Your choices are teaching the dealership to rely on process and follow-through."
    };
  }
  if (customerTrust >= 3) {
    return {
      title: "People-First Leader",
      summary: "Your decisions are making fairness and customer care part of the store's identity."
    };
  }
  if (creative >= 3) {
    return {
      title: "Growth Promoter",
      summary: "You are building confidence around bold visibility and momentum plays."
    };
  }
  if (speed >= 3 && resentment < 3) {
    return {
      title: "Fast-Moving Closer",
      summary: "You lean toward decisive, results-driven calls that keep the dealership moving."
    };
  }
  if (resentment >= 3) {
    return {
      title: "Pressure Manager",
      summary: "Your leadership style is drifting toward hard-edged control, and the team can feel it."
    };
  }
  return {
    title: "Developing Manager",
    summary: "Your leadership style is still taking shape as the dealership responds to your pattern of choices."
  };
}

function resetSimulation(scope) {
  const settings = getSettings();
  closeCurrentRound();
  db.prepare(
    `UPDATE game_state
     SET is_open = 0, session_number = 0, round_number = 0, current_round_id = NULL, last_opened_at = NULL, last_closed_at = NULL
     WHERE id = 1`
  ).run();

  db.prepare(`DELETE FROM response_staff_effects`).run();
  db.prepare(`DELETE FROM responses`).run();
  db.prepare(`DELETE FROM rounds`).run();

  if (scope === "results") {
    db.prepare(
      `UPDATE users SET sales = ?, satisfaction = ?, reputation = ?`
    ).run(DEFAULT_STUDENT_STATE.sales, DEFAULT_STUDENT_STATE.satisfaction, DEFAULT_STUDENT_STATE.reputation);
    const users = db.prepare(`SELECT id FROM users`).all();
    users.forEach((user) => seedStudentStaff(user.id));
    return;
  }

  db.prepare(`DELETE FROM staff_state`).run();
  db.prepare(`DELETE FROM users`).run();
  setSetting("teacher_username", settings.teacherUsername);
  setSetting("teacher_password_hash", settings.teacherPasswordHash);
  setSetting("sales_goal", settings.salesGoal);
}

function runInTransaction(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function clearStudentSessions(userId) {
  for (const [sid, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(sid);
    }
  }
}

function clearAllStudentSessions() {
  for (const [sid, session] of sessions.entries()) {
    if (session.userId) {
      sessions.delete(sid);
    }
  }
}

function createSession(session) {
  const sid = crypto.randomUUID();
  sessions.set(sid, {
    ...session,
    createdAt: Date.now()
  });
  return sid;
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sid = cookies[SESSION_COOKIE];
  if (!sid || !sessions.has(sid)) {
    return null;
  }
  return sessions.get(sid);
}

function clearSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sid = cookies[SESSION_COOKIE];
  if (sid) {
    sessions.delete(sid);
  }
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
}

function setSessionCookie(res, sid) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax`);
}

function parseCookies(value) {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }
      acc[entry.slice(0, separatorIndex)] = decodeURIComponent(entry.slice(separatorIndex + 1));
      return acc;
    }, {});
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Could not parse JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sendStatic(res, pathname) {
  const safePath = pathname.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendJson(res, 404, { error: "File not found." });
    return;
  }

  sendFile(res, filePath);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml; charset=utf-8"
    }[ext] || "application/octet-stream";

  const headers = { "Content-Type": contentType };
  if ([".html", ".css", ".js"].includes(ext)) {
    headers["Cache-Control"] = "no-store";
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function parseJsonValue(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function hashPassword(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function roundNumber(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}
