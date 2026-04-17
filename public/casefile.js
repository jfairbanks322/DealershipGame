const CASE = {
  title: "The Falloway Disappearance",
  location: "Johnson County, Central Indiana",
  actionBudget: 14,
  intro: [
    "Sam Falloway, 36, leaves home at 8:03 p.m. telling her family she is headed to a girls' night out. By morning, nobody has seen or heard from her.",
    "Her husband Henry has a private gambling problem, her daughter Tina has a public reputation for explosive fights, and Tommy was sleeping over at Rick Loman's house the same night she vanished.",
    "The town already thinks it knows this story. Your job is to find out whether the obvious story is the true one."
  ],
  designNotes: [
    "You have limited investigative hours before the sheriff expects a charging recommendation.",
    "Some leads deepen the wrong suspect. Some quietly clear them. The game will not tell you which is which.",
    "Pin the clues that actually change your theory. You can accuse early, but weak theories collapse."
  ],
  suspects: {
    henry: {
      id: "henry",
      name: "Henry Falloway",
      relation: "Husband, 39, landscaping business owner",
      summary: "Small-town logic says the husband did it. Henry also happens to be hiding a gambling spiral and missing business money.",
      visibleWhen: [],
      tags: ["Obvious spouse motive", "Financial secrecy"],
      notes: [
        { requires: [], text: "Henry admits the company was bleeding money, but only after you press him." },
        { requires: ["ledger-repayments"], text: "Sam was tracking repayments, not discovering them for the first time." },
        { requires: ["ga-token"], text: "A recovery meeting sign-in places Henry away from the meet-up window after 7:45 p.m." }
      ]
    },
    tina: {
      id: "tina",
      name: "Tina Falloway",
      relation: "Daughter, 19",
      summary: "Town gossip still remembers old screaming matches and the night she once shouted that she wished Sam were dead.",
      visibleWhen: [],
      tags: ["Public volatility", "Missing-hours lie"],
      notes: [
        { requires: [], text: "Tina is evasive about where she was, but she is more protective than explosive." },
        { requires: ["tina-deliveries-secret"], text: "She was secretly driving food deliveries to help Henry repay the missing business money." },
        { requires: ["delivery-logs"], text: "Her delivery route keeps her moving for most of the window when Sam disappeared." },
        { requires: ["relationship-repaired"], text: "Multiple people place the mother-daughter relationship on much steadier ground in recent weeks." }
      ]
    },
    rick: {
      id: "rick",
      name: "Rick Loman",
      relation: "Father of Tommy's friend Bryson",
      summary: "Rick and Sam were high-school sweethearts. In a county this small, that kind of history never really dies.",
      visibleWhen: [],
      tags: ["Old flame rumor", "Child connection"],
      notes: [
        { requires: [], text: "Rick was close enough to the family to matter, which makes gossip travel faster than facts." },
        { requires: ["rick-sleepover"], text: "Tommy was already at Rick's house with Bryson that night, exactly as planned." },
        { requires: ["rumor-affair"], text: "Several neighbors insist Sam and Rick still looked flirty, but none can place them together that night." },
        { requires: ["bryson-truck"], text: "Bryson remembers a dark truck creeping near Rick's street earlier in the week, not Rick leaving with Sam." }
      ]
    },
    jack: {
      id: "jack",
      name: "Jack Mercer",
      relation: "Tina's ex-boyfriend, 24",
      summary: "He is not on the original board because nobody volunteers his name until the family shame around Tina starts unraveling.",
      visibleWhenAny: ["jack-contact", "keepsake-box", "plate-hit"],
      tags: ["Hidden thread", "Possessive ex"],
      notes: [
        { requires: ["keepsake-box"], text: "His name surfaces first as a buried piece of Tina's past, not a suspect anyone mentions out loud." },
        { requires: ["jack-contact"], text: "Jack was back in Tina's messages under new numbers and believed Sam pushed Tina to leave him." },
        { requires: ["pizza-report"], text: "He had already been showing up at Tina's delivery pickup spots, asking when she was working." },
        { requires: ["sam-warning-text"], text: "Sam agreed to meet him once, privately, and told him to leave Tina alone afterward." },
        { requires: ["plate-hit"], text: "A partial plate and vehicle lookup place Jack's borrowed Tacoma at the edge of the case long before he is formally named." },
        { requires: ["greenhouse-argument"], text: "A witness heard a man at the old greenhouse road rant that Sam did not get to decide who Tina belonged to." }
      ]
    }
  },
  evidence: {
    "ledger-repayments": {
      id: "ledger-repayments",
      title: "Restitution Spreadsheet",
      kind: "financial",
      body:
        "Sam kept a private workbook listing exact repayment amounts back into Henry's company account. Several entries are marked in green with short notes like <strong>meeting chip saved</strong> and <strong>no more cash advances</strong>.",
      pins: ["henry", "money"]
    },
    "j-note": {
      id: "j-note",
      title: "Handwritten Note: 'J keeps circling Tina'",
      kind: "personal",
      body:
        "A half-folded page in Sam's desk reads: <strong>J keeps circling Tina. Tell H? No. He'll explode.</strong> It is the first sign Sam was hiding a different problem from Henry.",
      pins: ["unknown", "tina"]
    },
    "henry-admission": {
      id: "henry-admission",
      title: "Henry's Money Admission",
      kind: "personal",
      body:
        "Henry admits he diverted company cash into sports betting and online gambling. He expected that confession to become the whole case the second Sam vanished.",
      pins: ["henry", "money"]
    },
    "henry-recovery": {
      id: "henry-recovery",
      title: "Quiet Recovery Arrangement",
      kind: "personal",
      body:
        "Henry says Sam found out weeks earlier, demanded the money be repaid, and made him start meetings. They hid it because they were trying to keep the family from collapsing under gossip.",
      pins: ["henry", "family"]
    },
    "ga-token": {
      id: "ga-token",
      title: "Meeting Token and Sign-In",
      kind: "witness",
      body:
        "The church recovery group confirms Henry signed in shortly after 7:45 p.m. and stayed long enough for the breakout circle. It does not make him innocent, but it narrows the window.",
      pins: ["henry", "timeline"]
    },
    "tina-deliveries-secret": {
      id: "tina-deliveries-secret",
      title: "Tina's Secret Side Job",
      kind: "personal",
      body:
        "Tina was quietly driving food deliveries at night. She says it was her idea, not Sam's, and the cash was helping patch the hole Henry left behind.",
      pins: ["tina", "money"]
    },
    "relationship-repaired": {
      id: "relationship-repaired",
      title: "Recent Peace at Home",
      kind: "witness",
      body:
        "The loudest mother-daughter fights were weeks old. More recent messages and friends describe Sam and Tina as exhausted but rebuilt, not at war.",
      pins: ["tina", "family"]
    },
    "old-ex-shadow": {
      id: "old-ex-shadow",
      title: "Unwanted Ex Resurfacing",
      kind: "personal",
      body:
        "Tina finally admits an ex had started slipping back into her life from new numbers. She refuses to name him at first because she thinks it will pull the whole town into her private mess.",
      pins: ["unknown", "tina"]
    },
    "rick-sleepover": {
      id: "rick-sleepover",
      title: "Planned Sleepover",
      kind: "witness",
      body:
        "Rick confirms Tommy was with him and Bryson as planned. Sam arranged it earlier, which means Rick's connection to the family was real, but not necessarily secret.",
      pins: ["rick", "timeline"]
    },
    "rumor-affair": {
      id: "rumor-affair",
      title: "County Affair Rumor",
      kind: "rumor",
      body:
        "Neighbors and little-league parents describe Sam and Rick as close enough to feed speculation, but nobody offers a hard sighting that puts them together on disappearance night.",
      pins: ["rick", "gossip"]
    },
    "cover-story": {
      id: "cover-story",
      title: "No Girls' Night Existed",
      kind: "witness",
      body:
        "Sam's friend Lila confirms there was no girls' night scheduled at all. Sam asked her to cover if Henry asked questions, then stopped replying.",
      pins: ["sam", "timeline"]
    },
    "sam-private-meet": {
      id: "sam-private-meet",
      title: "Lila's Uneasy Text",
      kind: "digital",
      body:
        "Lila saved Sam's last message to her: <strong>If Henry asks, just say I'm on my way. I need to deal with Tina's problem quietly.</strong> Sam was protecting someone from Henry's reaction.",
      pins: ["sam", "tina"]
    },
    "delivery-logs": {
      id: "delivery-logs",
      title: "Delivery App Route",
      kind: "digital",
      body:
        "The app map shows Tina picking up and dropping off orders from 7:54 p.m. through 9:18 p.m. across Franklin and Whiteland. She lied, but the lie was about money, not murder.",
      pins: ["tina", "timeline"]
    },
    "jack-contact": {
      id: "jack-contact",
      title: "Deleted Messages to Jack Mercer",
      kind: "digital",
      body:
        "Recovered texts identify the ex as Jack Mercer. His messages frame Tina's side job as proof that Sam was controlling her life and keeping them apart.",
      pins: ["jack", "tina"]
    },
    "sam-warning-text": {
      id: "sam-warning-text",
      title: "Sam's Last Arranged Meeting",
      kind: "digital",
      body:
        "One restored message from Sam to Jack reads: <strong>I will meet you once. After tonight you stay away from Tina.</strong> It was sent shortly before she left home.",
      pins: ["jack", "timeline"]
    },
    "truck-sighting": {
      id: "truck-sighting",
      title: "Gas Station Sighting",
      kind: "witness",
      body:
        "A clerk at the gas station off State Road 44 remembers Sam's CR-V trailing a dark Tacoma toward the old greenhouse road. He jotted part of the plate after the drivers' argument looked heated.",
      pins: ["jack", "timeline"]
    },
    "bryson-truck": {
      id: "bryson-truck",
      title: "Bryson's Truck Memory",
      kind: "witness",
      body:
        "Bryson remembers the same dark truck creeping past Rick's street earlier in the week. He says Tommy's mom looked angry after she noticed it.",
      pins: ["jack", "rick"]
    },
    "pizza-report": {
      id: "pizza-report",
      title: "Pickup Counter Complaint",
      kind: "witness",
      body:
        "A restaurant shift lead remembers Jack hanging around the pickup shelves and asking when Tina was working. He insisted Sam had her 'running routes for family debt.'",
      pins: ["jack", "motive"]
    },
    "greenhouse-argument": {
      id: "greenhouse-argument",
      title: "Old Greenhouse Road Argument",
      kind: "witness",
      body:
        "A groundskeeper near the shuttered greenhouse remembers a man shouting, <strong>You don't get to decide who she belongs to.</strong> A woman answered, <strong>She isn't yours.</strong>",
      pins: ["jack", "motive"]
    },
    "greenhouse-trace": {
      id: "greenhouse-trace",
      title: "Fresh Damage on the Roadside",
      kind: "financial",
      body:
        "Broken red lens fragments and fresh gouging marks sit beside the greenhouse pull-off. The clerk's partial plate and the damage pattern fit an older dark Tacoma, not Henry's truck or Rick's SUV.",
      pins: ["jack", "vehicle"]
    },
    "porch-camera": {
      id: "porch-camera",
      title: "Porch Camera Pass",
      kind: "witness",
      body:
        "A neighbor's doorbell clip shows Sam leaving alone, getting into her CR-V without hesitation, and a dark Tacoma rolling past the block minutes before she pulls away. There is no struggle at the house.",
      pins: ["timeline", "vehicle"]
    },
    "circling-truck": {
      id: "circling-truck",
      title: "Truck Circling the Block",
      kind: "witness",
      body:
        "Two neighboring homes captured the same dark Tacoma easing past the Falloways' street on separate evenings that week. Someone was watching the house before Sam vanished.",
      pins: ["jack", "surveillance"]
    },
    "burner-calls": {
      id: "burner-calls",
      title: "Prepaid Number Calls",
      kind: "digital",
      body:
        "Sam's phone log shows six short calls from an unsaved prepaid number on the day she vanished, including two just before she left. She never calls it back after 8 p.m.",
      pins: ["unknown", "timeline"]
    },
    "map-pin": {
      id: "map-pin",
      title: "Greenhouse Route Cache",
      kind: "digital",
      body:
        "Sam's maps history contains a freshly loaded route to Old Wren Greenhouse Road. She was not wandering. She knew where she was going before she lied about girls' night.",
      pins: ["sam", "timeline"]
    },
    "bookkeeper-confirmation": {
      id: "bookkeeper-confirmation",
      title: "Bookkeeper Confirmation",
      kind: "financial",
      body:
        "Mallory Pike, Henry's bookkeeper, confirms Sam already knew about the missing money and had been quietly logging every repayment deposit. The secret was ugly, but it was already in recovery mode.",
      pins: ["henry", "money"]
    },
    "keepsake-box": {
      id: "keepsake-box",
      title: "Keepsake Box From Jack",
      kind: "personal",
      body:
        "In Tina's closet sits an old photo strip, a county-fair wristband, and an apology card signed by Jack Mercer. Tina did not want to talk about him, but she never fully erased him either.",
      pins: ["jack", "tina"]
    },
    "tina-draft": {
      id: "tina-draft",
      title: "Unsent Draft on Tina's Phone",
      kind: "digital",
      body:
        "An unsent note reads: <strong>Mom said she'll handle Jack tonight. If Dad finds out he'll make it worse.</strong> Tina expected Sam to intervene before the night was over.",
      pins: ["jack", "sam"]
    },
    "plate-hit": {
      id: "plate-hit",
      title: "Partial Plate Match",
      kind: "witness",
      body:
        "The gas-station plate fragment and neighborhood footage narrow to a dark Tacoma registered through Jack Mercer's uncle's lawn-supply account. Jack is known to drive it.",
      pins: ["jack", "vehicle"]
    }
  },
  leads: [
    {
      id: "office-search",
      category: "Home",
      title: "Search Sam's home office",
      subtitle: "Desk drawers, planner, and work files",
      summary: "Sam worked from home most of the week. Her office may tell you what she was hiding before she left.",
      cost: 1,
      options: [
        {
          id: "office-financials",
          label: "Follow the money trail",
          summary: "Start with spreadsheets, envelopes, and anything tied to Henry's company.",
          outcome:
            "You find the private repayment workbook Sam built after learning Henry stole money from the business. She was documenting restitution, not uncovering a fresh betrayal.",
          evidence: ["ledger-repayments"]
        },
        {
          id: "office-scraps",
          label: "Read the handwritten scraps",
          summary: "Ignore the neat folders and start where people hide panic.",
          outcome:
            "A folded note in Sam's desk mentions somebody identified only as J circling Tina again. Sam did not want Henry to know yet, which means she was protecting the family from a second crisis.",
          evidence: ["j-note"]
        }
      ]
    },
    {
      id: "neighborhood-canvass",
      category: "Field",
      title: "Canvass the Falloway block",
      subtitle: "Doorbells, porch lights, and the kind of neighbors who always notice",
      summary: "The disappearance starts at a quiet house on a quiet street. Quiet streets remember more than people think.",
      cost: 1,
      options: [
        {
          id: "porch-clips",
          label: "Collect nearby doorbell clips",
          summary: "Treat the block like a stitched-together timeline.",
          outcome:
            "The best clip shows Sam leaving alone while a dark Tacoma glides past the block minutes earlier. Whatever danger found her, it was not a break-in at home.",
          evidence: ["porch-camera", "circling-truck"]
        },
        {
          id: "neighbor-talk",
          label: "Knock on doors and listen for patterns",
          summary: "Look for repeated unease, not one dramatic memory.",
          outcome:
            "Two neighbors separately mention the same dark Tacoma crawling past the house earlier that week. Sam had noticed it too and looked unsettled when she did.",
          evidence: ["circling-truck"]
        }
      ]
    },
    {
      id: "sam-phone",
      category: "Digital",
      title: "Review Sam's phone",
      subtitle: "Call log, route cache, and the messages she stopped answering",
      summary: "If Sam staged the girls' night lie, her phone may show whether she was lured, prepared, or both.",
      cost: 1,
      options: [
        {
          id: "sam-phone-calls",
          label: "Work the recent calls first",
          summary: "Start with whatever was pressuring her in real time.",
          outcome:
            "Sam's phone was getting short calls from an unsaved prepaid number right before she left. The pattern looks less like social chatter and more like somebody pushing for a meeting.",
          evidence: ["burner-calls"]
        },
        {
          id: "sam-phone-maps",
          label: "Dig through maps and location cache",
          summary: "See whether she was heading somewhere planned.",
          outcome:
            "A fresh route to Old Wren Greenhouse Road is cached in Sam's maps history. She did not drift there accidentally; she was on her way to a private rendezvous.",
          evidence: ["map-pin"]
        }
      ]
    },
    {
      id: "henry-interview",
      category: "Interview",
      title: "Interview Henry",
      subtitle: "Money trouble, marriage pressure, and the last time he saw Sam",
      summary: "Henry expects to be treated like the prime suspect. The question is whether that makes him guilty or merely ready.",
      cost: 1,
      options: [
        {
          id: "henry-money",
          label: "Press him about the missing company money",
          summary: "Force the ugliest secret into the open first.",
          outcome:
            "Henry admits the gambling debt and the stolen company money. He breaks before he gets defensive, which feels less like a killer blindsided by accusation and more like a man already living inside shame.",
          evidence: ["henry-admission", "henry-recovery"]
        },
        {
          id: "henry-evening",
          label: "Rebuild his timeline minute by minute",
          summary: "Treat his routine like a map instead of a confession booth.",
          outcome:
            "Henry says Sam left saying she needed one calm night. He produces a recovery token and says Sam had been forcing him to earn trust back week by week.",
          evidence: ["henry-recovery", "ga-token"]
        }
      ]
    },
    {
      id: "company-office",
      category: "Financial",
      title: "Visit Henry's company office",
      subtitle: "Bookkeeping records, deposit slips, and who knew what",
      summary: "If Henry's money secret is real, somebody besides the marriage probably had to help clean it up.",
      cost: 1,
      requires: {
        evidenceAny: ["ledger-repayments", "henry-admission", "henry-recovery"]
      },
      options: [
        {
          id: "bookkeeper-talk",
          label: "Interview the bookkeeper",
          summary: "Ask the person who had to touch the numbers, not just hear about them.",
          outcome:
            "Mallory Pike confirms Sam already knew about the theft and had been quietly tracking every repayment deposit. The office expected scandal, not a disappearance.",
          evidence: ["bookkeeper-confirmation"]
        },
        {
          id: "deposit-review",
          label: "Review the repayment deposits",
          summary: "Let paperwork strip the emotion out of Henry's story.",
          outcome:
            "Deposit slips match Sam's private workbook almost line for line. Henry may still be a liar, but on this subject the lie has already broken open.",
          evidence: ["bookkeeper-confirmation"]
        }
      ]
    },
    {
      id: "tina-interview",
      category: "Interview",
      title: "Interview Tina",
      subtitle: "Public anger, private guilt, unknown hours",
      summary: "Tina looks suspicious because she is hiding something. That does not tell you whether the thing she is hiding matters most.",
      cost: 1,
      options: [
        {
          id: "tina-direct",
          label: "Call out the missing-hours lie",
          summary: "Make her choose between telling you where she was and looking worse.",
          outcome:
            "Tina finally admits she was driving deliveries to help Henry pay the money back. She lied because she did not want the town learning she was propping the family up at night.",
          evidence: ["tina-deliveries-secret"]
        },
        {
          id: "tina-patient",
          label: "Treat the lie as fear, not guilt",
          summary: "Give Tina room to tell the story she thinks will destroy her socially.",
          outcome:
            "Tina says things with Sam had actually been better lately. She also admits an ex had started contacting her again from fresh numbers, and Sam hated how quiet she had become about it.",
          evidence: ["tina-deliveries-secret", "relationship-repaired", "old-ex-shadow"]
        }
      ]
    },
    {
      id: "tina-room",
      category: "Home",
      title: "Search Tina's room",
      subtitle: "Keepsakes, chargers, and the things she was too embarrassed to throw away",
      summary: "Tina is hiding something that feels personal before it feels criminal. Her room may tell you which one.",
      cost: 1,
      requires: {
        evidenceAny: ["tina-deliveries-secret", "old-ex-shadow", "relationship-repaired"]
      },
      options: [
        {
          id: "closet-box",
          label: "Open the keepsake box in the closet",
          summary: "Look for the relationship she will not name aloud.",
          outcome:
            "The box is full of old remnants from Jack Mercer. Tina wanted distance, but not the humiliation of admitting he was back in her orbit.",
          evidence: ["keepsake-box"]
        },
        {
          id: "charging-cable",
          label: "Check the phone drafts and notes backup",
          summary: "Search the places people talk to themselves before they confess to others.",
          outcome:
            "One unsent draft says Sam promised she would handle Jack that night because Henry would only make things worse. Tina knew something was happening and hid it badly.",
          evidence: ["tina-draft"]
        }
      ]
    },
    {
      id: "rick-interview",
      category: "Interview",
      title: "Interview Rick",
      subtitle: "Old history, town gossip, and Tommy's sleepover",
      summary: "Rick is the kind of suspect a county practically writes by itself: handsome history, too close to the family, and already wrapped in rumors.",
      cost: 1,
      options: [
        {
          id: "rick-rumor",
          label: "Lean into the affair rumor",
          summary: "See what Rick does when the ugliest local gossip is spoken out loud.",
          outcome:
            "Rick denies anything physical, but he has heard the rumors for years. He admits he and Sam understood each other a little too easily, which is exactly the kind of answer people mistake for proof.",
          evidence: ["rick-sleepover", "rumor-affair"]
        },
        {
          id: "rick-kids",
          label: "Stay on the kid timeline",
          summary: "Use Tommy and Bryson as anchors instead of flirtation rumors.",
          outcome:
            "Rick walks you through pizza, a movie, and the boys falling asleep in Bryson's room. The timeline is domestic, ordinary, and frustratingly consistent.",
          evidence: ["rick-sleepover"]
        }
      ]
    },
    {
      id: "friends-check",
      category: "Social",
      title: "Check Sam's friends",
      subtitle: "Did the girls' night story exist at all?",
      summary: "If Sam lied about where she was going, the lie itself may point harder than the destination.",
      cost: 1,
      options: [
        {
          id: "friends-thread",
          label: "Review the group chat",
          summary: "Treat the alibi as paperwork.",
          outcome:
            "The group thread is dead that night. Nobody was meeting Sam anywhere, which means the story she gave Henry was built for the family alone.",
          evidence: ["cover-story"]
        },
        {
          id: "friends-lila",
          label: "Call Lila directly",
          summary: "Talk to the one friend Sam trusted to cover for her.",
          outcome:
            "Lila confirms there was no girls' night and reads back Sam's last message: if Henry asks, say I'm on my way. Sam said she needed to handle Tina's problem quietly.",
          evidence: ["cover-story", "sam-private-meet"]
        }
      ]
    },
    {
      id: "delivery-logs",
      category: "Digital",
      title: "Pull Tina's delivery records",
      subtitle: "App route, timestamps, and pickup trail",
      summary: "Tina's confession only matters if her phone places her where she says it does.",
      cost: 1,
      requires: {
        evidenceAny: ["tina-deliveries-secret"]
      },
      options: [
        {
          id: "delivery-route",
          label: "Map the route minute by minute",
          summary: "Test the lie against timestamps instead of emotion.",
          outcome:
            "The route shows Tina moving across the county during the disappearance window. Her secrecy deepens the mess, but it also quietly clears her from the core act.",
          evidence: ["delivery-logs"]
        },
        {
          id: "delivery-pickups",
          label: "Cross-check pickup receipts",
          summary: "See who could have seen Tina working.",
          outcome:
            "Receipt times line up with the app route, confirming the job was real and routine. Whoever Sam went to meet, Tina was already chasing orders.",
          evidence: ["delivery-logs"]
        }
      ]
    },
    {
      id: "meeting-sheet",
      category: "Verification",
      title: "Verify Henry's meeting alibi",
      subtitle: "Church basement sign-in and sponsor memory",
      summary: "Henry's shame makes him look guilty. You still need to know whether it makes him present.",
      cost: 1,
      requires: {
        evidenceAny: ["henry-admission", "henry-recovery"]
      },
      options: [
        {
          id: "meeting-register",
          label: "Check the sign-in sheet",
          summary: "Take the institutional route.",
          outcome:
            "The sign-in sheet and token match Henry's account. It does not turn him into a saint. It does make the easy arrest harder to sustain.",
          evidence: ["ga-token"]
        },
        {
          id: "meeting-sponsor",
          label: "Talk to the meeting sponsor",
          summary: "See whether anyone remembers Henry as more than a name on paper.",
          outcome:
            "The sponsor remembers Henry because Sam had started driving him there some weeks. He says Henry sat through the full opening circle before leaving.",
          evidence: ["ga-token"]
        }
      ]
    },
    {
      id: "deleted-phone",
      category: "Digital",
      title: "Restore Tina's deleted messages",
      subtitle: "Old phone backup and unsent drafts",
      summary: "You only get here if you think Tina is protecting somebody instead of only herself.",
      cost: 1,
      requires: {
        evidenceAny: ["j-note", "old-ex-shadow", "sam-private-meet", "keepsake-box", "tina-draft"]
      },
      options: [
        {
          id: "deleted-texts",
          label: "Recover the deleted thread",
          summary: "Pull the messages she tried hardest to erase.",
          outcome:
            "The deleted thread belongs to Jack Mercer. He talks like Tina was stolen from him and blames Sam for every boundary Tina tried to keep.",
          evidence: ["jack-contact", "sam-warning-text"]
        },
        {
          id: "backup-scan",
          label: "Scan the old cloud backup",
          summary: "Look for what Tina forgot to scrub elsewhere.",
          outcome:
            "Photos and backed-up texts identify Jack and show he was still circling Tina from burner numbers. One saved line from Sam says she will meet him once, then end it.",
          evidence: ["jack-contact", "sam-warning-text"]
        }
      ]
    },
    {
      id: "gas-station",
      category: "Field",
      title: "Canvass the gas station off State Road 44",
      subtitle: "The last public place Sam may have been seen",
      summary: "If there was no girls' night, then the first useful witness may sit between home and wherever Sam really went.",
      cost: 2,
      requires: {
        evidenceAll: ["cover-story"]
      },
      options: [
        {
          id: "gas-clerk",
          label: "Talk to the clerk who closes nights",
          summary: "Use memory and instinct before hunting for cameras.",
          outcome:
            "The clerk remembers Sam arguing through her rolled-down window, then following a dark Tacoma south toward the old greenhouse road. He wrote down part of the plate because the exchange felt wrong.",
          evidence: ["truck-sighting"]
        },
        {
          id: "gas-camera",
          label: "Pull whatever camera angles survived",
          summary: "Accept blurry footage if the timing is good enough.",
          outcome:
            "The footage is grainy, but it supports the clerk's story: Sam's CR-V left after a dark Tacoma, not toward any restaurant district where a girls' night would make sense.",
          evidence: ["truck-sighting"]
        }
      ]
    },
    {
      id: "plate-lookup",
      category: "Verification",
      title: "Run the truck plate fragment",
      subtitle: "Gas-station note, neighborhood clips, and vehicle records",
      summary: "You do not need a full plate if the same truck keeps wandering through the same small county.",
      cost: 1,
      requires: {
        evidenceAny: ["truck-sighting", "circling-truck"]
      },
      options: [
        {
          id: "plate-records",
          label: "Cross-check county vehicle records",
          summary: "Treat the truck like the suspect before you know the suspect's name.",
          outcome:
            "The partial plate and dark Tacoma narrow to a vehicle linked to Jack Mercer's uncle's lawn-supply account. Jack is the one known to use it.",
          evidence: ["plate-hit"]
        },
        {
          id: "plate-body-shop",
          label: "Check for recent repairs on older Tacomas",
          summary: "Look for who suddenly needed to fix a rear lens.",
          outcome:
            "A local body shop remembers Jack asking whether they could cheaply replace a cracked rear lens on a borrowed Tacoma. He never came back for the formal estimate.",
          evidence: ["plate-hit"]
        }
      ]
    },
    {
      id: "tommy-bryson",
      category: "Witness",
      title: "Talk to Tommy and Bryson",
      subtitle: "Children notice patterns adults dismiss",
      summary: "Tommy cannot solve the case, but he may remember what adults wrote off as background noise.",
      cost: 1,
      requires: {
        evidenceAll: ["rick-sleepover"]
      },
      options: [
        {
          id: "tommy-first",
          label: "Ask Tommy what felt strange lately",
          summary: "Let him talk around the edges instead of straight to the night itself.",
          outcome:
            "Tommy says his mom got angry the week before when a truck kept passing Rick's street. He did not know the driver, only that Sam called him 'that boy' under her breath.",
          evidence: ["bryson-truck"]
        },
        {
          id: "bryson-first",
          label: "Ask Bryson what adults missed",
          summary: "Children sometimes remember vehicles better than motives.",
          outcome:
            "Bryson remembers a dark truck creeping past the house more than once. He assumed it belonged to a landscaper until Sam stepped outside and stared it down.",
          evidence: ["bryson-truck"]
        }
      ]
    },
    {
      id: "pizza-spot",
      category: "Field",
      title: "Visit Tina's pickup spots",
      subtitle: "See who noticed her working and who noticed her being watched",
      summary: "If Jack built his theory about Tina's side job from somewhere, witnesses should exist where she collected orders.",
      cost: 1,
      requires: {
        evidenceAny: ["jack-contact", "keepsake-box", "plate-hit"]
      },
      options: [
        {
          id: "pizza-manager",
          label: "Talk to the pizza shift lead",
          summary: "Start where Tina made repeat pickups.",
          outcome:
            "The shift lead remembers Jack asking what time Tina usually came through and muttering that Sam had her 'working off family sins.' His obsession sounds moral in his own mouth and coercive in everyone else's.",
          evidence: ["pizza-report"]
        },
        {
          id: "pickup-counters",
          label: "Check multiple pickup counters",
          summary: "Look for a pattern instead of one memory.",
          outcome:
            "Two pickup workers remember the same man waiting around for Tina's orders and asking whether her mother made her take the shifts. The phrase is too specific to be random gossip.",
          evidence: ["pizza-report"]
        }
      ]
    },
    {
      id: "greenhouse-road",
      category: "Field",
      title: "Work the old greenhouse road",
      subtitle: "Shuttered property south of town",
      summary: "The road is quiet, off the main drag, and the kind of place people choose when they need privacy without looking planned.",
      cost: 2,
      requires: {
        evidenceAny: ["sam-warning-text", "map-pin"],
        evidenceAll: ["truck-sighting"]
      },
      options: [
        {
          id: "greenhouse-witness",
          label: "Talk to the groundskeeper",
          summary: "Find the human ear before the physical trace.",
          outcome:
            "The groundskeeper heard a man yelling that Sam did not get to decide who Tina belonged to. He did not come forward because he thought it was another domestic argument that burned itself out.",
          evidence: ["greenhouse-argument"]
        },
        {
          id: "greenhouse-trace",
          label: "Search the shoulder and pull-off",
          summary: "Treat the road like a hasty staging ground.",
          outcome:
            "Fresh lens fragments and road gouges suggest a rough departure from the pull-off. The damage does not fit Henry's truck or Rick's family vehicle; it does fit the kind of Tacoma the clerk described.",
          evidence: ["greenhouse-trace"]
        }
      ]
    }
  ],
  timeline: [
    { time: "7:38 p.m.", text: "An unsaved prepaid number calls Sam twice in quick succession.", requires: ["burner-calls"] },
    { time: "7:45 p.m.", text: "Henry signs into a recovery meeting across town.", requires: ["ga-token"] },
    { time: "7:52 p.m.", text: "Sam asks Lila to cover for a fake girls' night.", requires: ["cover-story"] },
    { time: "7:58 p.m.", text: "A dark Tacoma rolls past the Falloway block just before Sam leaves.", requires: ["porch-camera"] },
    { time: "8:03 p.m.", text: "Doorbell camera shows Sam leaving home alone in the CR-V.", requires: [] },
    { time: "8:11 p.m.", text: "Sam's maps route points her toward Old Wren Greenhouse Road.", requires: ["map-pin"] },
    { time: "8:00-9:18 p.m.", text: "Tina is running deliveries across Franklin and Whiteland.", requires: ["delivery-logs"] },
    { time: "8:18 p.m.", text: "Gas station clerk sees Sam tailing a dark Tacoma toward the greenhouse road.", requires: ["truck-sighting"] },
    { time: "8:27 p.m.", text: "An argument erupts on the greenhouse road about who gets to decide Tina's life.", requires: ["greenhouse-argument"] },
    { time: "Later", text: "Vehicle damage suggests someone left the roadside fast and angry.", requires: ["greenhouse-trace"] }
  ],
  accusation: {
    departureOptions: [
      {
        value: "girls-night-real",
        label: "She really was going to meet girlfriends and the rest is coincidence."
      },
      {
        value: "meet-rick",
        label: "She was heading to a private meetup with Rick."
      },
      {
        value: "meet-jack",
        label: "She used the girls' night story to meet Tina's ex without Henry finding out."
      },
      {
        value: "confront-henry-bookkeeper",
        label: "She was confronting someone else about Henry's company money."
      }
    ],
    secretOptions: [
      { value: "henry-gambling", label: "Henry's gambling theft and repayment plan" },
      { value: "rick-rumor", label: "The county's affair rumor around Rick" },
      { value: "tina-diagnosis", label: "Old gossip around Tina's diagnosis" },
      { value: "random-abduction", label: "The idea that a stranger grabbed Sam at random" }
    ],
    clearsTinaOptions: [
      { value: "delivery-logs", label: "Tina's delivery route and pickup timestamps" },
      { value: "relationship-repaired", label: "Proof the mother-daughter relationship had improved" },
      { value: "henry-recovery", label: "Henry admitting the money problem" },
      { value: "rick-sleepover", label: "Rick confirming Tommy's sleepover" }
    ]
  }
};

const refs = {
  app: document.getElementById("app"),
  restartButton: document.getElementById("restart-button")
};

let state = createInitialState();

refs.restartButton.addEventListener("click", resetCase);
render();

function createInitialState() {
  return {
    mode: "intro",
    hoursLeft: CASE.actionBudget,
    selectedLeadId: null,
    completedLeads: [],
    evidenceIds: [],
    pinnedEvidenceIds: [],
    actionLog: [],
    accusation: {
      suspect: "",
      departure: "",
      secret: "",
      proof: "",
      clearsTina: ""
    },
    result: null,
    clock: 0
  };
}

function resetCase() {
  state = createInitialState();
  render();
}

function render() {
  refs.restartButton.classList.toggle("hidden", state.mode === "intro");

  if (state.mode === "intro") {
    refs.app.innerHTML = renderIntro();
    attachIntroEvents();
    syncAutomationHooks();
    return;
  }

  if (state.mode === "accusation") {
    refs.app.innerHTML = `
      ${renderDashboard()}
      ${renderAccusationPanel()}
    `;
    attachInvestigationEvents();
    attachAccusationEvents();
    syncAutomationHooks();
    return;
  }

  if (state.mode === "result") {
    refs.app.innerHTML = `
      ${renderResultPanel()}
      ${renderDashboard(true)}
    `;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    attachInvestigationEvents();
    attachResultEvents();
    syncAutomationHooks();
    return;
  }

  refs.app.innerHTML = renderDashboard();
  attachInvestigationEvents();
  syncAutomationHooks();
}

function renderIntro() {
  return `
    <section class="intro-card">
      <div class="intro-grid">
        <div class="brief-stack">
          <div class="section-head">
            <p class="eyebrow">Case 001</p>
            <span class="mode-pill">${escapeHtml(CASE.location)}</span>
          </div>
          <h2 class="display">A domestic disappearance with too many believable lies.</h2>
          ${CASE.intro.map((line) => `<p class="brief-line">${escapeHtml(line)}</p>`).join("")}
          <div class="board-row">
            <span class="clue-pill">One hidden suspect</span>
            <span class="clue-pill">${CASE.actionBudget} investigative hours</span>
            <span class="clue-pill">Multi-part accusation</span>
          </div>
          <div class="result-actions">
            <button id="start-btn" type="button" class="primary-button">Open the case board</button>
          </div>
        </div>
        <div class="intro-notes">
          <article class="intro-note">
            <p class="eyebrow">Known on day one</p>
            <div class="empty-stack">
              <p class="muted">Henry hid gambling losses inside his landscaping company.</p>
              <p class="muted">Tina has old public fights with Sam hanging over her reputation.</p>
              <p class="muted">Rick's history with Sam gives the county something dirty to whisper about.</p>
            </div>
          </article>
          <article class="intro-note">
            <p class="eyebrow">How this prototype plays</p>
            <div class="empty-stack">
              ${CASE.designNotes.map((line) => `<p class="muted">${escapeHtml(line)}</p>`).join("")}
            </div>
          </article>
        </div>
      </div>
    </section>
  `;
}

function renderDashboard(isReadOnly = false) {
  const availableLeads = getAvailableLeads();
  const selectedLead = getSelectedLead(availableLeads);

  return `
    ${renderCasePulse(availableLeads, isReadOnly)}
    <section class="dashboard">
      <div id="scene-focus" class="panel scene-panel">
        <div class="status-row">
          <div class="panel-stack">
            <p class="eyebrow">Investigation Board</p>
            <h2>${escapeHtml(CASE.title)}</h2>
            <p class="panel-copy">Choose your leads carefully. The system only records what you actually earned.</p>
          </div>
          <div class="board-row">
            <span class="mode-pill">${state.mode === "result" ? "Case closed" : "Lead phase"}</span>
            <span class="board-pill">${state.hoursLeft} hours left</span>
            <span class="board-pill">${state.evidenceIds.length} clues unlocked</span>
          </div>
        </div>

        <div class="metric-grid">
          <article class="metric-card">
            <span class="eyebrow">Pressure</span>
            <strong>${state.hoursLeft <= 3 ? "Closing fast" : state.hoursLeft <= 6 ? "Building" : "Manageable"}</strong>
          </article>
          <article class="metric-card">
            <span class="eyebrow">Hidden Thread</span>
            <strong>${hasEvidence("jack-contact") ? "Surfacing" : "Buried under family lies"}</strong>
          </article>
          <article class="metric-card">
            <span class="eyebrow">Accusation</span>
            <strong>${state.evidenceIds.length >= 4 ? "Available" : "Thin theory"}</strong>
          </article>
        </div>

        ${renderSceneCard(selectedLead, isReadOnly)}
        ${renderLeadBoard(availableLeads, selectedLead?.id, isReadOnly)}
      </div>

      <aside class="side-column">
        <section id="suspects-panel" class="panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Suspects</p>
              <h3>Who the case points at</h3>
            </div>
            <span class="board-pill">${getVisibleSuspects().length} on board</span>
          </div>
          <div class="suspect-grid">${renderSuspectCards()}</div>
        </section>

        <section id="evidence-panel" class="panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Evidence</p>
              <h3>What you can actually prove</h3>
            </div>
            <span class="board-pill">${state.pinnedEvidenceIds.length} pinned</span>
          </div>
          <div class="evidence-grid">${renderEvidenceCards()}</div>
        </section>

        <section id="timeline-panel" class="timeline-card">
          <div class="timeline-header">
            <div>
              <p class="eyebrow">Timeline</p>
              <h3>Night of the disappearance</h3>
            </div>
          </div>
          <div class="timeline-stack">${renderTimeline()}</div>
        </section>

        <section id="log-panel" class="log-card">
          <div class="section-head">
            <div>
              <p class="eyebrow">Case Log</p>
              <h3>Your investigation trail</h3>
            </div>
          </div>
          <div class="log-stack">${renderActionLog()}</div>
        </section>
      </aside>
    </section>
    ${renderMobileDock(isReadOnly)}
  `;
}

function renderCasePulse(availableLeads, isReadOnly) {
  const completion = Math.round((state.evidenceIds.length / Object.keys(CASE.evidence).length) * 100);
  const visibleSuspects = getVisibleSuspects().length;
  const pinned = state.pinnedEvidenceIds.length;
  return `
    <section class="pulse-card">
      <div class="pulse-top">
        <div class="pulse-copy">
          <p class="eyebrow">Case Pulse</p>
          <h2>${state.mode === "result" ? "Verdict entered" : "The case is still moving under the surface."}</h2>
          <p class="panel-copy">
            ${hasEvidence("jack-contact") || hasEvidence("plate-hit")
              ? "The hidden thread is now active. Every new clue should be tested against Jack, not just the household."
              : "The family secrets are loud enough to drown out the real threat. Push beyond the obvious suspects."}
          </p>
        </div>
        <div class="pulse-stack">
          <span class="mode-pill">${state.hoursLeft} hours left</span>
          <span class="board-pill">${availableLeads.length} open leads</span>
          <span class="board-pill">${visibleSuspects} suspects on board</span>
        </div>
      </div>
      <div class="progress-track" aria-hidden="true">
        <span class="progress-fill" style="width: ${Math.max(8, completion)}%"></span>
      </div>
      <div class="pulse-grid">
        <article class="pulse-stat">
          <span class="eyebrow">Clue Depth</span>
          <strong>${completion}%</strong>
          <p class="muted">${state.evidenceIds.length} of ${Object.keys(CASE.evidence).length} known fragments recovered.</p>
        </article>
        <article class="pulse-stat">
          <span class="eyebrow">Board Shape</span>
          <strong>${pinned} pinned</strong>
          <p class="muted">${pinned ? "You are starting to build a theory instead of a rumor pile." : "No pinned theory yet. Useful, but scattered."}</p>
        </article>
        <article class="pulse-stat">
          <span class="eyebrow">Mobile Flow</span>
          <strong>${isReadOnly ? "Review mode" : state.evidenceIds.length >= 4 ? "Ready to accuse" : "Investigate"}</strong>
          <p class="muted">${isReadOnly ? "Scroll the board and compare what you proved to what you skipped." : "Jump between focus, leads, evidence, and suspects with the quick nav below."}</p>
        </article>
      </div>
      <nav class="jump-strip" aria-label="Case board quick jump">
        <a class="jump-chip" href="#scene-focus">Focus</a>
        <a class="jump-chip" href="#lead-board-section">Leads</a>
        <a class="jump-chip" href="#suspects-panel">Suspects</a>
        <a class="jump-chip" href="#evidence-panel">Evidence</a>
        <a class="jump-chip" href="#timeline-panel">Timeline</a>
        <a class="jump-chip" href="#log-panel">Log</a>
      </nav>
    </section>
  `;
}

function renderSceneCard(selectedLead, isReadOnly) {
  if (!selectedLead) {
    if (state.mode === "result") {
      return `
        <section class="empty-state">
          <p class="eyebrow">Lead Board Closed</p>
          <p class="muted">You have already submitted a theory. The board remains here so you can review what you missed or what finally mattered.</p>
        </section>
      `;
    }

    return `
      <section class="empty-state">
        <p class="eyebrow">No Fresh Lead Selected</p>
        <p class="muted">Either your hours are gone or every unlocked lead has been worked. If the theory holds, move to accusation. If not, restart and chase a different chain.</p>
      </section>
    `;
  }

  const completedEntry = state.actionLog.find((entry) => entry.leadId === selectedLead.id) || null;

  return `
    <section class="scene-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(selectedLead.category)}</p>
          <h3>${escapeHtml(selectedLead.title)}</h3>
        </div>
        <span class="lead-meta">${selectedLead.cost} ${selectedLead.cost === 1 ? "hour" : "hours"}</span>
      </div>
      <div class="scene-copy">
        <p>${escapeHtml(selectedLead.subtitle)}</p>
        <p>${escapeHtml(selectedLead.summary)}</p>
      </div>
      ${
        state.completedLeads.includes(selectedLead.id)
          ? `
            <div class="empty-state">
              <p class="eyebrow">Lead already worked</p>
              <p class="muted">${completedEntry ? escapeHtml(completedEntry.choice) : "This lead is already in your log."}</p>
              <p class="muted">${completedEntry ? escapeHtml(completedEntry.outcome) : "Review the evidence board and case log for what it changed."}</p>
            </div>
          `
          : isReadOnly
            ? `<div class="empty-state"><p class="muted">Lead resolution is disabled because the case has already been submitted.</p></div>`
          : `
            <div class="choice-list">
              ${selectedLead.options
                .map(
                  (option) => `
                    <button class="choice-button" type="button" data-run-lead="${selectedLead.id}" data-option-id="${option.id}">
                      <strong>${escapeHtml(option.label)}</strong>
                      <span>${escapeHtml(option.summary)}</span>
                    </button>
                  `
                )
                .join("")}
            </div>
          `
      }
    </section>
  `;
}

function renderLeadBoard(availableLeads, selectedLeadId, isReadOnly) {
  const unlockedIds = new Set(availableLeads.map((lead) => lead.id));
  const orderedLeads = buildOrderedLeads(availableLeads, selectedLeadId);
  const completedCount = state.completedLeads.length;

  return `
    <section id="lead-board-section" class="lead-board">
      <div class="section-head">
        <div>
          <p class="eyebrow">Available Leads</p>
          <h3>Choose the next pressure point</h3>
        </div>
        <div class="board-row">
          <span class="board-pill">${availableLeads.length} open</span>
          <span class="board-pill">${completedCount} completed</span>
        </div>
        ${
          !isReadOnly
            ? `<button id="accuse-button" type="button" class="primary-button" ${state.evidenceIds.length < 4 ? "disabled" : ""}>Make an accusation</button>`
            : ""
        }
      </div>
      ${orderedLeads
        .map((lead) => {
          const completed = state.completedLeads.includes(lead.id);
          const available = unlockedIds.has(lead.id);
          const locked = !completed && !available;
          return `
            <article class="lead-card ${lead.id === selectedLeadId ? "selected" : ""} ${completed ? "completed" : ""} ${locked ? "locked" : ""}">
              <div class="lead-header">
                <div>
                  <p class="eyebrow">${escapeHtml(lead.category)}</p>
                  <h4>${escapeHtml(lead.title)}</h4>
                </div>
                <span class="lead-meta">${lead.cost} ${lead.cost === 1 ? "hour" : "hours"}</span>
              </div>
              <p class="muted">${escapeHtml(lead.subtitle)}</p>
              <div class="lead-topline">
                ${completed ? `<span class="kind-pill kind-pill-personal">Completed</span>` : ""}
                ${locked ? `<span class="kind-pill kind-pill-rumor">Locked</span>` : ""}
                ${available ? `<span class="kind-pill kind-pill-digital">Open lead</span>` : ""}
              </div>
              <button
                class="lead-select"
                type="button"
                data-select-lead="${lead.id}"
                ${locked ? "disabled" : ""}
              >
                ${completed ? "Review lead" : available ? "Inspect lead" : "Need more evidence"}
              </button>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderSuspectCards() {
  return getVisibleSuspects()
    .map((suspect) => {
      const notes = suspect.notes.filter((note) => note.requires.every(hasEvidence));
      return `
        <article class="suspect-card ${suspect.id === "jack" ? "hidden-suspect" : ""}">
          <div class="suspect-header">
            <div>
              <p class="eyebrow">${escapeHtml(suspect.relation)}</p>
              <h4 class="suspect-name">${escapeHtml(suspect.name)}</h4>
            </div>
          </div>
          <p class="muted">${escapeHtml(suspect.summary)}</p>
          <div class="suspect-tags">
            ${suspect.tags.map((tag, index) => `<span class="suspect-tag ${index === 0 ? "primary" : ""}">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <ul class="suspect-notes">
            ${notes.map((note) => `<li>${escapeHtml(note.text)}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");
}

function renderEvidenceCards() {
  const evidence = getUnlockedEvidence();
  if (!evidence.length) {
    return `
      <div class="empty-state">
        <p class="muted">Your case file is still blank. Work a lead and the evidence board will start taking shape.</p>
      </div>
    `;
  }

  return evidence
    .map((item) => {
      const pinned = state.pinnedEvidenceIds.includes(item.id);
      return `
        <article class="evidence-card ${pinned ? "pinned" : ""}">
          <div class="evidence-header">
            <div>
              <p class="eyebrow">${escapeHtml(item.title)}</p>
              <div class="evidence-meta">
                <span class="kind-pill kind-pill-${item.kind}">${escapeHtml(capitalize(item.kind))}</span>
              </div>
            </div>
            <button class="pin-button" type="button" data-pin-evidence="${item.id}">
              ${pinned ? "Unpin" : "Pin clue"}
            </button>
          </div>
          <p class="evidence-body">${item.body}</p>
        </article>
      `;
    })
    .join("");
}

function renderTimeline() {
  return CASE.timeline
    .map((entry) => {
      const visible = entry.requires.every(hasEvidence);
      return `
        <div class="timeline-row ${visible ? "" : "timeline-card locked-row"}">
          <span class="timeline-time">${escapeHtml(entry.time)}</span>
          <p class="muted">${visible ? escapeHtml(entry.text) : "Timeline segment still dark."}</p>
        </div>
      `;
    })
    .join("");
}

function renderActionLog() {
  if (!state.actionLog.length) {
    return `
      <div class="empty-state">
        <p class="muted">The log fills with each lead you choose, so you can see the shape of your theory instead of just the answer screen.</p>
      </div>
    `;
  }

  return [...state.actionLog]
    .reverse()
    .map(
      (entry) => `
        <article class="log-entry">
          <p class="eyebrow">${escapeHtml(entry.lead)} · ${entry.cost} ${entry.cost === 1 ? "hour" : "hours"}</p>
          <strong>${escapeHtml(entry.choice)}</strong>
          <p>${escapeHtml(entry.outcome)}</p>
          ${entry.found?.length ? `<div class="board-row">${entry.found.map((item) => `<span class="clue-pill">${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        </article>
      `
    )
    .join("");
}

function renderMobileDock(isReadOnly) {
  if (isReadOnly) {
    return "";
  }

  const accuseTarget = state.evidenceIds.length >= 4 ? "#accuse-button" : "#lead-board-section";
  return `
    <nav class="mobile-dock" aria-label="Mobile case navigation">
      <a href="#scene-focus" class="dock-link">Focus</a>
      <a href="#lead-board-section" class="dock-link">Leads</a>
      <a href="#evidence-panel" class="dock-link">Evidence</a>
      <a href="${accuseTarget}" class="dock-link dock-link-accent">Accuse</a>
    </nav>
  `;
}

function renderAccusationPanel() {
  const proofOptions = getUnlockedEvidence().map((item) => ({ value: item.id, label: item.title }));
  return `
    <section class="accusation-card">
      <div class="accusation-header">
        <div>
          <p class="eyebrow">Final Theory</p>
          <h2>Submit a charging recommendation</h2>
        </div>
        <span class="mode-pill">${state.hoursLeft} hours left</span>
      </div>
      <p class="result-copy">
        This is where shallow true-crime logic usually falls apart. Choose the killer, the hidden reason Sam left home, the family secret
        that distorted the first day of the case, the proof that most directly points to the killer, and the clue that truly clears Tina.
      </p>
      <div class="question-grid">
        <article class="question-card">
          <label>
            Who killed Sam Falloway?
            <select id="accuse-suspect">
              ${renderSelectOptions(
                [
                  { value: "", label: "Choose a suspect" },
                  ...getVisibleSuspects().map((suspect) => ({ value: suspect.id, label: suspect.name }))
                ],
                state.accusation.suspect
              )}
            </select>
          </label>
        </article>
        <article class="question-card">
          <label>
            Why did Sam lie about girls' night?
            <select id="accuse-departure">
              ${renderSelectOptions([{ value: "", label: "Choose a theory" }, ...CASE.accusation.departureOptions], state.accusation.departure)}
            </select>
          </label>
        </article>
        <article class="question-card">
          <label>
            Which family secret distorted the case first?
            <select id="accuse-secret">
              ${renderSelectOptions([{ value: "", label: "Choose the misleading secret" }, ...CASE.accusation.secretOptions], state.accusation.secret)}
            </select>
          </label>
        </article>
        <article class="question-card">
          <label>
            What is your strongest direct proof?
            <select id="accuse-proof">
              ${renderSelectOptions([{ value: "", label: "Choose a piece of evidence" }, ...proofOptions], state.accusation.proof)}
            </select>
          </label>
        </article>
        <article class="question-card">
          <label>
            What actually clears Tina?
            <select id="accuse-clears-tina">
              ${renderSelectOptions([{ value: "", label: "Choose the real clearing clue" }, ...CASE.accusation.clearsTinaOptions], state.accusation.clearsTina)}
            </select>
          </label>
        </article>
      </div>
      <div class="result-actions">
        <button id="submit-accusation" type="button" class="primary-button">Lock the theory</button>
        <button id="back-to-board" type="button" class="ghost-button">Return to case board</button>
      </div>
    </section>
  `;
}

function renderResultPanel() {
  const result = state.result;
  return `
    <section class="result-card">
      <div class="result-header">
        <div>
          <p class="eyebrow">Case Result</p>
          <h2>${escapeHtml(result.headline)}</h2>
        </div>
        <span class="result-score">${result.score}/100</span>
      </div>
      <p class="result-copy">${escapeHtml(result.summary)}</p>
      <div class="result-breakdown">
        ${result.breakdown
          .map(
            (line) => `
              <div class="result-line">
                <span>${escapeHtml(line.label)}</span>
                <strong>${line.points}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="question-grid">
        <article class="question-card">
          <p class="eyebrow">What actually happened</p>
          <p>
            Sam discovered Jack Mercer had resumed contacting Tina and thought she could shut him down without dragging Henry into another volatile family scene.
            She used the girls' night story as cover, met Jack on the old greenhouse road, and the confrontation turned fatal when he refused to accept that Tina was done with him.
          </p>
        </article>
        <article class="question-card">
          <p class="eyebrow">Why the case felt muddy</p>
          <p>
            Henry's embezzlement, Tina's secret delivery route, and the Rick rumor were all true enough to look like motive. That is what made them dangerous.
          </p>
        </article>
      </div>
      <div class="result-actions">
        <button id="review-board" type="button" class="ghost-button">Review the board</button>
        <button id="restart-result" type="button" class="primary-button">Restart case</button>
      </div>
    </section>
  `;
}

function attachIntroEvents() {
  const startButton = document.getElementById("start-btn");
  startButton?.addEventListener("click", () => {
    state.mode = "investigation";
    state.selectedLeadId = getAvailableLeads()[0]?.id || null;
    render();
    scrollSelectorIntoViewOnNextPaint(".pulse-card");
  });
}

function attachInvestigationEvents() {
  document.querySelectorAll("[data-select-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLeadId = button.dataset.selectLead;
      render();
    });
  });

  document.querySelectorAll("[data-run-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      runLead(button.dataset.runLead, button.dataset.optionId);
    });
  });

  document.querySelectorAll("[data-pin-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
      togglePinnedEvidence(button.dataset.pinEvidence);
    });
  });

  const accuseButton = document.getElementById("accuse-button");
  accuseButton?.addEventListener("click", () => {
    if (state.evidenceIds.length < 4) {
      return;
    }
    state.mode = "accusation";
    render();
  });
}

function attachAccusationEvents() {
  document.getElementById("back-to-board")?.addEventListener("click", () => {
    state.mode = "investigation";
    render();
    scrollSelectorIntoViewOnNextPaint(".pulse-card");
  });

  document.getElementById("submit-accusation")?.addEventListener("click", submitAccusation);

  [
    ["accuse-suspect", "suspect"],
    ["accuse-departure", "departure"],
    ["accuse-secret", "secret"],
    ["accuse-proof", "proof"],
    ["accuse-clears-tina", "clearsTina"]
  ].forEach(([id, field]) => {
    document.getElementById(id)?.addEventListener("change", (event) => {
      state.accusation[field] = event.target.value;
    });
  });
}

function attachResultEvents() {
  document.getElementById("review-board")?.addEventListener("click", () => {
    document.querySelector(".dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("restart-result")?.addEventListener("click", resetCase);
}

function runLead(leadId, optionId) {
  const lead = CASE.leads.find((item) => item.id === leadId);
  if (!lead || state.completedLeads.includes(lead.id)) {
    return;
  }

  const option = lead.options.find((item) => item.id === optionId);
  if (!option) {
    return;
  }

  state.completedLeads.push(lead.id);
  state.hoursLeft = Math.max(0, state.hoursLeft - lead.cost);
  addEvidence(option.evidence);
  state.actionLog.push({
    leadId: lead.id,
    lead: lead.title,
    choice: option.label,
    outcome: option.outcome,
    cost: lead.cost,
    found: option.evidence.map((evidenceId) => CASE.evidence[evidenceId]?.title || evidenceId)
  });

  if (state.selectedLeadId === lead.id) {
    const nextLead = getAvailableLeads()[0];
    state.selectedLeadId = nextLead?.id || null;
  }

  if (!getAvailableLeads().length || state.hoursLeft === 0) {
    state.mode = "accusation";
  }

  render();
}

function addEvidence(evidenceIds) {
  evidenceIds.forEach((evidenceId) => {
    if (!state.evidenceIds.includes(evidenceId)) {
      state.evidenceIds.push(evidenceId);
    }
  });
}

function togglePinnedEvidence(evidenceId) {
  if (state.pinnedEvidenceIds.includes(evidenceId)) {
    state.pinnedEvidenceIds = state.pinnedEvidenceIds.filter((id) => id !== evidenceId);
  } else {
    state.pinnedEvidenceIds = [...state.pinnedEvidenceIds, evidenceId];
  }
  render();
}

function submitAccusation() {
  const values = state.accusation;
  if (!values.suspect || !values.departure || !values.secret || !values.proof || !values.clearsTina) {
    return;
  }

  const proofIsCorrect = ["sam-warning-text", "greenhouse-argument", "greenhouse-trace", "truck-sighting"].includes(values.proof);
  const breakdown = [
    {
      label: "Correct killer",
      points: values.suspect === "jack" ? "+45" : "+0"
    },
    {
      label: "Why Sam left home",
      points: values.departure === "meet-jack" ? "+20" : "+0"
    },
    {
      label: "Misleading family secret",
      points: values.secret === "henry-gambling" ? "+15" : "+0"
    },
    {
      label: "Strongest direct proof",
      points: proofIsCorrect ? "+10" : "+0"
    },
    {
      label: "What clears Tina",
      points: values.clearsTina === "delivery-logs" ? "+10" : "+0"
    }
  ];

  const score =
    (values.suspect === "jack" ? 45 : 0)
    + (values.departure === "meet-jack" ? 20 : 0)
    + (values.secret === "henry-gambling" ? 15 : 0)
    + (proofIsCorrect ? 10 : 0)
    + (values.clearsTina === "delivery-logs" ? 10 : 0);

  let headline = "The case slips through your hands";
  let summary =
    "You built a theory, but it leaned too hard on surface scandal. In this town, believable secrets can still be the wrong story.";

  if (score >= 85) {
    headline = "You break the case open";
    summary =
      "The pattern holds: Sam lied to meet Jack privately, Henry's gambling scandal clouded the first wave of suspicion, Tina's route clears her, and the greenhouse-road thread finally exposes the man nobody volunteered.";
  } else if (score >= 60) {
    headline = "You point the case in the right direction";
    summary =
      "Your theory starts landing on the real shape of the crime, but parts of the affidavit would still be vulnerable without cleaner logic or stronger proof.";
  }

  if (values.suspect === "henry") {
    summary =
      "Henry looks terrible on paper, but the repayment records and recovery timeline keep pulling the case away from him. The arrest would not hold.";
  } else if (values.suspect === "tina") {
    summary =
      "Tina's lie makes her easy to blame, but the delivery route cuts through the hysteria. The case punishes gossip faster than it solves the disappearance.";
  } else if (values.suspect === "rick") {
    summary =
      "Rick fits the county's favorite rumor, not the actual trail. The more you rely on the affair story, the less attention stays on the digital thread around Tina.";
  }

  state.result = {
    score,
    headline,
    summary,
    breakdown
  };
  state.mode = "result";
  render();
  scrollSelectorIntoViewOnNextPaint(".result-card");
}

function getVisibleSuspects() {
  return Object.values(CASE.suspects).filter((suspect) => {
    const visibleWhen = suspect.visibleWhen || [];
    const visibleWhenAny = suspect.visibleWhenAny || [];
    const allPass = visibleWhen.every(hasEvidence);
    const anyPass = !visibleWhenAny.length || visibleWhenAny.some(hasEvidence);
    return allPass && anyPass;
  });
}

function getUnlockedEvidence() {
  return state.evidenceIds
    .map((id) => CASE.evidence[id])
    .filter(Boolean)
    .sort((left, right) => Number(state.pinnedEvidenceIds.includes(right.id)) - Number(state.pinnedEvidenceIds.includes(left.id)));
}

function getAvailableLeads() {
  return CASE.leads.filter((lead) => {
    if (state.completedLeads.includes(lead.id)) {
      return false;
    }

    const requires = lead.requires || {};
    const evidenceAllOkay = (requires.evidenceAll || []).every(hasEvidence);
    const evidenceAnyList = requires.evidenceAny || [];
    const evidenceAnyOkay = !evidenceAnyList.length || evidenceAnyList.some(hasEvidence);
    const leadsAllOkay = (requires.leadsAll || []).every((leadId) => state.completedLeads.includes(leadId));

    return evidenceAllOkay && evidenceAnyOkay && leadsAllOkay;
  });
}

function buildOrderedLeads(availableLeads, selectedLeadId) {
  const availableSet = new Set(availableLeads.map((lead) => lead.id));
  return [...CASE.leads].sort((left, right) => {
    const rankLeft = getLeadRank(left.id, selectedLeadId, availableSet);
    const rankRight = getLeadRank(right.id, selectedLeadId, availableSet);
    if (rankLeft !== rankRight) {
      return rankLeft - rankRight;
    }
    return left.title.localeCompare(right.title);
  });
}

function getLeadRank(leadId, selectedLeadId, availableSet) {
  if (leadId === selectedLeadId) {
    return 0;
  }
  if (availableSet.has(leadId)) {
    return 1;
  }
  if (state.completedLeads.includes(leadId)) {
    return 2;
  }
  return 3;
}

function getSelectedLead(availableLeads) {
  const selected = CASE.leads.find((lead) => lead.id === state.selectedLeadId);
  if (selected && (availableLeads.some((lead) => lead.id === selected.id) || state.completedLeads.includes(selected.id))) {
    return selected;
  }

  return availableLeads[0] || null;
}

function hasEvidence(evidenceId) {
  return state.evidenceIds.includes(evidenceId);
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");
}

function syncAutomationHooks() {
  window.render_game_to_text = renderGameToText;
  window.advanceTime = advanceTime;
}

function renderGameToText() {
  const payload = {
    mode: state.mode,
    hoursLeft: state.hoursLeft,
    selectedLead: state.selectedLeadId,
    completedLeads: [...state.completedLeads],
    evidence: state.evidenceIds.map((id) => CASE.evidence[id]?.title || id),
    pinnedEvidence: [...state.pinnedEvidenceIds],
    visibleSuspects: getVisibleSuspects().map((suspect) => suspect.name),
    openLeadCount: getAvailableLeads().length,
    actionLogLength: state.actionLog.length,
    score: state.result?.score || null,
    coordinateSystem: "Text interface only; no gameplay coordinates."
  };
  return JSON.stringify(payload);
}

function advanceTime(ms) {
  state.clock += Number(ms) || 0;
  return state.clock;
}

function scrollSelectorIntoViewOnNextPaint(selector) {
  window.requestAnimationFrame(() => {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ block: "start" });
      return;
    }
    window.scrollTo(0, 0);
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
