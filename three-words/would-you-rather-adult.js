const QUESTION_GROUPS = {
  chemistry: [
    { prompt: "Feel your partner signal that they want you with…", options: ["A bold whisper", "A long, lingering kiss", "A suggestive text", "A playful touch in passing"] },
    { prompt: "Turn up the tension through…", options: ["Hours of teasing", "A direct invitation", "Flirty banter all day", "A slow dance at home"] },
    { prompt: "Have your partner initiate by…", options: ["Pulling you in close", "Telling you exactly what they want", "Setting a romantic scene", "Surprising you in the shower"] },
    { prompt: "Dress for a private night in with…", options: ["Lingerie", "Nothing at all", "An oversized shirt", "A fully dressed-up look"] },
    { prompt: "Build anticipation before a date with…", options: ["A detailed text", "A mysterious hint", "A revealing photo", "A whispered promise"] },
    { prompt: "Be seduced most easily by…", options: ["Confidence", "Tenderness", "Humor", "A little mystery"] },
    { prompt: "Start a steamy night with…", options: ["A deep make-out session", "A couples massage", "A shared shower", "A drink and honest flirting"] },
    { prompt: "Choose the private setting that feels hottest…", options: ["A luxury hotel", "A candlelit bedroom", "A secluded cabin", "The living room after midnight"] },
    { prompt: "Hear your partner say…", options: ["Tell me what you want", "I've been thinking about you", "Tonight is all yours", "Come closer"] },
    { prompt: "Keep desire alive during a busy week through…", options: ["Sexting", "Scheduled private time", "Quick stolen kisses", "A surprise bedroom plan"] }
  ],
  bedroom: [
    { prompt: "Set the bedroom mood with…", options: ["Low lights and music", "Bright lights and eye contact", "Complete darkness", "Candles and silence"] },
    { prompt: "Choose the pace that sounds best tonight…", options: ["Slow and sensual", "Playful and teasing", "Intense and passionate", "Let it change as you go"] },
    { prompt: "Make private time happen most often…", options: ["Early in the morning", "Right after a date", "Late at night", "Whenever the mood hits"] },
    { prompt: "Spend more time on…", options: ["Kissing", "Full-body touch", "Talking about what feels good", "The main event"] },
    { prompt: "Choose the soundscape…", options: ["A sexy playlist", "Only each other", "A movie in the background", "Rain or ambient sounds"] },
    { prompt: "Take the lead by…", options: ["Giving clear directions", "Guiding with your hands", "Choosing the position", "Letting your partner set the pace"] },
    { prompt: "Add a little edge with…", options: ["A blindfold", "Light restraints", "A playful command", "A gentle spanking"] },
    { prompt: "Focus tonight on…", options: ["Your partner's pleasure", "Your own pleasure", "Taking turns", "Finishing together"] },
    { prompt: "Try a change of scenery in…", options: ["The shower", "A hotel balcony with privacy", "The kitchen after dark", "A secluded outdoor spot"] },
    { prompt: "End a long dry spell with…", options: ["A planned all-night date", "A spontaneous quickie", "A slow reconnection", "Sharing fantasies first"] }
  ],
  exploration: [
    { prompt: "Explore something new together through…", options: ["A couples' toy", "Role-play", "A new position", "An erotic game"] },
    { prompt: "Share a fantasy by…", options: ["Saying it face-to-face", "Writing it down", "Acting out a tame version", "Choosing from a fantasy list"] },
    { prompt: "Pick a role-play mood…", options: ["Strangers meeting at a bar", "Boss and assistant", "Secret admirer", "A custom scenario you invent"] },
    { prompt: "Bring one item into the bedroom…", options: ["A vibrator", "Massage oil", "A blindfold", "A couples' card deck"] },
    { prompt: "Watch something sexy together that is…", options: ["Romantic and sensual", "Bold and explicit", "Playful and funny", "Chosen separately as a surprise"] },
    { prompt: "Experiment with control by…", options: ["Taking turns being in charge", "Using a safe word", "Following a playful set of rules", "Keeping things completely equal"] },
    { prompt: "Try a private challenge involving…", options: ["No hands for a while", "Keeping the lights on", "Watching each other", "Making the other person ask"] },
    { prompt: "Choose a fantasy getaway…", options: ["A clothing-optional resort", "A secluded honeymoon suite", "An adults-only cruise", "A weekend with no clothes at home"] },
    { prompt: "Make a consensual photo or video that is…", options: ["Suggestive but clothed", "Nude but anonymous", "Explicit and private", "Skip recording and stay present"] },
    { prompt: "Open the relationship conversation by discussing…", options: ["A shared fantasy only", "Watching but not joining", "A possible third person", "Keeping exclusivity non-negotiable"] }
  ],
  communication: [
    { prompt: "Talk about sexual preferences…", options: ["Before anything starts", "In the moment", "During a relaxed check-in", "By text when there's less pressure"] },
    { prompt: "Respond to a new request with…", options: ["An enthusiastic yes", "Questions before deciding", "A smaller trial version", "A clear no without guilt"] },
    { prompt: "Let your partner know something is not working by…", options: ["Giving direct words", "Guiding them differently", "Pausing to reset", "Talking afterward"] },
    { prompt: "Check consent during an intense moment with…", options: ["A clear verbal check-in", "A traffic-light safe word", "A hand signal", "Frequent yes-or-no questions"] },
    { prompt: "Handle mismatched desire tonight by…", options: ["Cuddling without expectations", "Helping the interested partner", "Planning another night", "Finding a lower-key middle ground"] },
    { prompt: "Share your yes, maybe, and no list…", options: ["Out loud together", "In separate written lists", "Through a couples app", "One topic at a time"] },
    { prompt: "Ask for more of what you like with…", options: ["Specific instructions", "Positive encouragement", "A demonstration", "A conversation outside the bedroom"] },
    { prompt: "Recover from an awkward bedroom moment by…", options: ["Laughing together", "Stopping and talking", "Switching to something familiar", "Taking a break and cuddling"] },
    { prompt: "Keep intimate details private by…", options: ["Sharing nothing with friends", "Sharing only generalities", "Agreeing on specifics first", "Allowing one trusted confidant"] },
    { prompt: "Revisit boundaries…", options: ["Before every new experience", "During a monthly check-in", "Whenever desire changes", "Only when someone asks"] }
  ],
  aftercare: [
    { prompt: "Want right after an intense intimate moment…", options: ["Close cuddling", "Reassuring words", "Water and a snack", "A little quiet space"] },
    { prompt: "Feel most cared for afterward through…", options: ["Being held", "A warm shower together", "A gentle debrief", "Falling asleep touching"] },
    { prompt: "Spend the morning after by…", options: ["Staying in bed", "Making breakfast together", "Taking a long shower", "Going out for coffee"] },
    { prompt: "Hear the best post-sex compliment…", options: ["You make me feel safe", "That was incredibly hot", "I love learning your body", "I feel so close to you"] },
    { prompt: "Reconnect after trying something vulnerable with…", options: ["A long hug", "Talking through every detail", "A silly comfort show", "A planned check-in tomorrow"] },
    { prompt: "Keep the intimate mood going with…", options: ["Skin-to-skin cuddling", "A second round later", "A shared bath", "Pillow talk"] },
    { prompt: "Handle one partner feeling unexpectedly emotional by…", options: ["Holding them quietly", "Asking what they need", "Offering reassurance", "Giving space nearby"] },
    { prompt: "Create an aftercare ritual around…", options: ["Fresh sheets", "Favorite snacks", "A private playlist", "Three honest check-in questions"] },
    { prompt: "Check in the next day through…", options: ["A sweet text", "A direct conversation", "A flirty callback", "A quiet affectionate gesture"] },
    { prompt: "End the night feeling…", options: ["Desired", "Emotionally close", "Relaxed and safe", "Excited for next time"] }
  ]
};

module.exports = Object.entries(QUESTION_GROUPS).flatMap(([category, questions]) =>
  questions.map((question, questionIndex) => {
    const id = `adult-${category}-${String(questionIndex + 1).padStart(3, "0")}`;
    return {
      id,
      category,
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({
        id: `${id}-${String.fromCharCode(97 + optionIndex)}`,
        text
      }))
    };
  })
);
