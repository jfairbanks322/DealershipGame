const QUESTION_GROUPS = {
  turnOns: [
    { prompt: "Choose the kind of dirty talk that turns you on most…", options: ["Praise and worship", "Explicit descriptions", "Playful teasing", "Commands and obedience"] },
    { prompt: "Want your partner to initiate by…", options: ["Pressing you against a wall", "Pulling you into their lap", "Kneeling in front of you", "Undressing you very slowly"] },
    { prompt: "Hear the hottest thing in the moment…", options: ["Tell me exactly what you want", "Be good for me", "Don't stop", "I want to watch you finish"] },
    { prompt: "Receive a sext that includes…", options: ["A detailed fantasy", "A nude photo", "A direct invitation", "A voice note saying what they want"] },
    { prompt: "Watch your partner…", options: ["Undress slowly", "Touch themselves", "Use a toy", "Pose nude for you"] },
    { prompt: "Choose the kind of nude photo you would most want…", options: ["A full-body mirror shot", "A suggestive close-up", "A shower photo", "A playful almost-reveal"] },
    { prompt: "Build secret tension while out together with…", options: ["A hand high on your thigh", "A very explicit text", "A whispered promise", "Knowing one of you skipped underwear"] },
    { prompt: "Spend the first five minutes of private time…", options: ["Making out fully clothed", "Getting naked immediately", "Giving a slow striptease", "Telling each other what happens next"] },
    { prompt: "Choose an outfit made to be removed…", options: ["Lace or lingerie", "A suit with nothing underneath", "A robe and no underwear", "Harnesses or body straps"] },
    { prompt: "Feel most desired when your partner…", options: ["Cannot keep their hands off you", "Stares while you undress", "Says exactly what they want to do", "Asks you to take control"] }
  ],
  oralTouch: [
    { prompt: "Prefer receiving oral sex with…", options: ["A long, slow tease", "A steady proven rhythm", "Direct verbal feedback", "Fast, intense focus"] },
    { prompt: "While giving oral, want your partner to…", options: ["Be very vocal", "Guide you with their hand", "Hold eye contact", "Relax and let you lead"] },
    { prompt: "Choose the oral-sex setup…", options: ["Take turns slowly", "Sixty-nine together", "One person receives all the attention", "Switch whenever the mood changes"] },
    { prompt: "Want more focused touch on…", options: ["Neck and ears", "Chest and nipples", "Inner thighs", "Genitals immediately"] },
    { prompt: "Prefer hands and fingers that are…", options: ["Slow and exploratory", "Firm and consistent", "Guided exactly where you want", "Paired with a toy"] },
    { prompt: "Add lube that is…", options: ["Silky and neutral", "Warming", "Cooling", "Flavored for oral play"] },
    { prompt: "Try mutual masturbation by…", options: ["Watching side by side", "Taking turns performing", "Guiding each other's hands", "Using toys on yourselves"] },
    { prompt: "Use a mirror so you can…", options: ["Watch oral sex", "See a favorite position", "Watch yourselves touch", "Keep eye contact through the reflection"] },
    { prompt: "Explore anal play at the level of…", options: ["Talking about it only", "External touch", "A small toy with plenty of lube", "Not interested—hard boundary"] },
    { prompt: "Let oral sex end with…", options: ["Receiving until climax", "Switching before climax", "Both taking a turn", "Deciding in the moment"] }
  ],
  positionsPace: [
    { prompt: "Choose the position that feels hottest tonight…", options: ["Partner on top", "Face-to-face underneath", "From behind", "Seated face-to-face"] },
    { prompt: "For deep, intense penetration, choose…", options: ["From behind on the bed", "Face-to-face with legs raised", "Standing against a wall", "Side-by-side with one leg lifted"] },
    { prompt: "For slow, connected sex, choose…", options: ["Spooning", "Seated in each other's lap", "Classic face-to-face", "One partner at the edge of the bed"] },
    { prompt: "Decide who controls the movement…", options: ["The person on top", "The person underneath", "Switch control halfway", "Move together without a leader"] },
    { prompt: "Pick the rhythm that sounds best…", options: ["Slow and deep", "Hard and fast", "Steady without changing", "Constantly shifting pace"] },
    { prompt: "Make a quickie happen in…", options: ["The shower", "A locked bedroom", "A private hotel bathroom", "The kitchen after everyone is gone"] },
    { prompt: "Keep eye contact during…", options: ["Oral sex", "Penetration", "Using a toy", "The moment one of you climaxes"] },
    { prompt: "Bring a vibrator into penetration by using it on…", options: ["The receiving partner", "The penetrating partner", "Both partners together", "Whoever wants the next turn"] },
    { prompt: "Focus penetration tonight on…", options: ["Vaginal sex", "Anal sex with preparation", "Fingers or toys", "Skipping penetration entirely"] },
    { prompt: "Handle climax timing by…", options: ["Trying to finish together", "Making one partner finish first", "Edging each other before either finishes", "Dropping the goal and following pleasure"] }
  ],
  kinkPlay: [
    { prompt: "Choose the kind of restraint you would try…", options: ["Wrists held by hand", "Soft cuffs", "Wrists tied above the head", "No restraint—keep movement free"] },
    { prompt: "Choose a spanking intensity…", options: ["Playful and light", "Firm enough to sting", "Build from light to hard", "No spanking"] },
    { prompt: "Wear a blindfold while your partner…", options: ["Teases with their mouth", "Uses a toy", "Changes between hot and cold", "Decides where to touch next"] },
    { prompt: "Try power play with…", options: ["You in charge", "Your partner in charge", "Switching roles", "No hierarchy—just playful directions"] },
    { prompt: "Follow a command to…", options: ["Stay perfectly still", "Ask permission to touch", "Hold eye contact", "Describe exactly what you want"] },
    { prompt: "Experiment with orgasm control through…", options: ["Edging several times", "Asking permission to finish", "One partner choosing the timing", "No control—finish whenever you want"] },
    { prompt: "Try temperature play with…", options: ["Ice along the body", "Warm massage oil", "Body-safe candle wax", "Alternating warm and cold"] },
    { prompt: "Add one toy for a more intense night…", options: ["A powerful vibrator", "A remote-controlled toy", "A plug with plenty of lube", "A couples' vibrator"] },
    { prompt: "Feel about visible marks afterward…", options: ["Love them anywhere private", "Only very faint marks", "Ask before every mark", "No marks at all"] },
    { prompt: "Make a kink scene feel safest with…", options: ["A clear safe word", "A yes-maybe-no list", "Planned aftercare", "All three together"] }
  ],
  fantasiesBoundaries: [
    { prompt: "Handle a threesome fantasy by…", options: ["Keep it as dirty talk", "Choose a person together someday", "Try role-play with toys instead", "Mark it as off-limits"] },
    { prompt: "Watch explicit content together that is…", options: ["Chosen by you", "Chosen by your partner", "Something you both browse for", "Not part of your sex life"] },
    { prompt: "Choose a more explicit role-play…", options: ["Strangers hooking up", "Boss and eager assistant", "Dominant and submissive", "Performer and devoted fan"] },
    { prompt: "Record something intimate as…", options: ["Audio only", "A nude video without faces", "An explicit video kept private", "Never record—phones stay away"] },
    { prompt: "Create an exhibitionist feeling safely with…", options: ["Sex in front of a mirror", "A high private window", "Pretending someone might walk in", "Keeping everything fully secluded"] },
    { prompt: "If another person entered the fantasy, prefer…", options: ["Someone of your gender", "Someone of your partner's gender", "Another couple", "No additional person"] },
    { prompt: "Set the boundary for consensual non-monogamy at…", options: ["Fantasy and conversation only", "Flirting or kissing", "A shared sexual experience", "Complete exclusivity"] },
    { prompt: "Choose where climax happens…", options: ["Inside with agreed protection", "On a partner's body", "In a partner's mouth", "Wherever is easiest to clean up"] },
    { prompt: "Reveal your most private fantasy by…", options: ["Whispering it during sex", "Sending it in a message", "Writing both fantasies and swapping", "Only sharing if directly asked"] },
    { prompt: "Revisit hard limits and fantasies…", options: ["Before every spicy game", "In a monthly sex check-in", "Whenever something new comes up", "With an always-open invitation to talk"] }
  ]
};

const CATEGORY_IDS = {
  turnOns: "turn-ons",
  oralTouch: "oral-touch",
  positionsPace: "positions-pace",
  kinkPlay: "kink-play",
  fantasiesBoundaries: "fantasies-boundaries"
};

module.exports = Object.entries(QUESTION_GROUPS).flatMap(([group, questions]) => {
  const category = CATEGORY_IDS[group];
  return questions.map((question, questionIndex) => {
    const id = `after-dark-${category}-${String(questionIndex + 1).padStart(3, "0")}`;
    return {
      id,
      category,
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({
        id: `${id}-${String.fromCharCode(97 + optionIndex)}`,
        text
      }))
    };
  });
});
