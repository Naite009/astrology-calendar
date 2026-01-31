// Complete Human Design Authority Encyclopedia
// All 7 Authority types with comprehensive decision-making guidance

export interface HDAuthorityData {
  authority: string;
  name: string;
  center: string;
  forTypes: string[];
  overview: string;
  howItWorks: string;
  decisionProcess: string[];
  timeline: string;
  whatItFeelsLike: string;
  practiceExercises: string[];
  commonMistakes: string[];
  questionsToAsk: string[];
  integrationWithStrategy: string;
}

export const AUTHORITY_DATA: Record<string, HDAuthorityData> = {
  'Emotional': {
    authority: 'Emotional',
    name: 'Emotional Authority (Solar Plexus)',
    center: 'Solar Plexus',
    forTypes: ['Generator', 'Manifesting Generator', 'Manifestor', 'Projector'],
    overview: "Emotional Authority means you experience life through an emotional wave. You have no truth in the now - clarity comes only with time. This is the most common authority, affecting about 50% of people.",
    howItWorks: "Your Solar Plexus creates an emotional wave that moves from hope to pain and back again. Every decision needs to be felt through the full wave before clarity emerges. You're not looking for a specific feeling, but for a consistent knowing that remains true at different emotional points.",
    decisionProcess: [
      "Receive an invitation/opportunity/question",
      "Notice your initial emotional response (but don't decide yet)",
      "Wait through your wave - experience the decision at emotional highs and lows",
      "Notice what remains consistent across the wave",
      "When you have a 'knowing' that doesn't change with your mood, you have clarity",
      "Communicate your decision"
    ],
    timeline: "Small decisions: Sleep on it (24-48 hours). Medium decisions: A few days to a week. Big life decisions: Wait through multiple wave cycles - weeks or even months. There is no specific timeline; you're waiting for clarity, not a deadline.",
    whatItFeelsLike: "Emotional clarity feels like a deep, settled knowing that doesn't fluctuate with your mood. Even when your wave moves to hope or pain, your knowing about the decision stays consistent. It's not excitement (that's the high of your wave) - it's certainty.",
    practiceExercises: [
      "Track your emotional wave for a month - note the highs, lows, and neutral zones",
      "For small decisions, practice noting how you feel at different times of day",
      "Keep a decision journal: note initial response, responses over time, final clarity",
      "Practice saying 'I need to sit with this' instead of deciding in the moment",
      "Identify your wave pattern: Tribal (need-based), Individual (spiky), or Abstract (hope to pain)"
    ],
    commonMistakes: [
      "Making decisions at the top of the wave (excitement that crashes)",
      "Making decisions at the bottom (pessimism that lifts)",
      "Looking for a specific emotion instead of clarity",
      "Setting artificial deadlines for emotional decisions",
      "Explaining your emotions instead of just waiting for clarity"
    ],
    questionsToAsk: [
      "Have I felt this decision at different emotional points?",
      "Does my sense of this stay consistent even when my mood changes?",
      "Am I deciding from excitement or from clarity?",
      "Am I trying to escape an emotional low by deciding?",
      "Have I given this enough time?"
    ],
    integrationWithStrategy: "Your Strategy (Wait to Respond, Wait for Invitation, etc.) brings opportunities to you. Your Authority (waiting through the wave) determines which of those opportunities is correct. Strategy gets the opportunity; Authority clarifies the response."
  },
  
  'Sacral': {
    authority: 'Sacral',
    name: 'Sacral Authority',
    center: 'Sacral',
    forTypes: ['Generator', 'Manifesting Generator'],
    overview: "Sacral Authority means your gut response in the moment is your truth. You have access to pure life force energy that responds with sounds: 'uh-huh' (yes), 'uhn-uhn' (no), or silence (wait/not now).",
    howItWorks: "Your Sacral Center responds to life through sounds - not words, but visceral responses. When something is correct for you, your gut says 'uh-huh' or makes a sound of excitement. When it's not, you get 'uhn-uhn' or pulling away. This happens instantly.",
    decisionProcess: [
      "Something/someone comes to you (remember: you respond, you don't initiate)",
      "Notice your immediate gut response - sound or sensation",
      "Honor that response - 'uh-huh' means proceed, 'uhn-uhn' means don't",
      "If you can't get a clear response, ask for the question to be rephrased as yes/no",
      "Trust the response even if your mind disagrees"
    ],
    timeline: "The Sacral responds in the moment. However, the question must be present - you can't get a Sacral response to something abstract or in the future. For future decisions, wait until the moment arrives.",
    whatItFeelsLike: "The Sacral response is physical and immediate. 'Uh-huh' feels like a pulling forward, expansion, or excitement in the belly. 'Uhn-uhn' feels like contraction, pulling back, or closing down. It's before thought - pure bodily knowing.",
    practiceExercises: [
      "Have someone ask you simple yes/no questions and notice your gut sounds",
      "Pay attention to what makes you 'light up' throughout your day",
      "Practice making sounds instead of words when possible",
      "Notice the difference between mind-yes (should) and Sacral-yes (uh-huh)",
      "Ask yourself: 'Does this give me energy or drain my energy?'"
    ],
    commonMistakes: [
      "Ignoring your Sacral and using your mind to decide",
      "Saying 'yes' when your Sacral said 'uhn-uhn' to be polite",
      "Trying to get a Sacral response to abstract questions",
      "Overriding 'uhn-uhn' because you think you should want something",
      "Exhausting your Sacral by doing things that don't get 'uh-huh'"
    ],
    questionsToAsk: [
      "What does my gut say? (Listen for the sound, not words)",
      "Does this light me up?",
      "Do I have energy for this?",
      "Can this question be made more specific/present?",
      "Am I overriding my 'uhn-uhn' to please someone?"
    ],
    integrationWithStrategy: "As a Generator/MG, you Wait to Respond. Something comes to you, then your Sacral responds. Don't initiate and then try to get a Sacral response - it doesn't work. Wait → Something appears → Sacral responds → You act."
  },
  
  'Splenic': {
    authority: 'Splenic',
    name: 'Splenic Authority',
    center: 'Spleen',
    forTypes: ['Manifestor', 'Projector'],
    overview: "Splenic Authority is the oldest form of awareness - pure survival intuition. It speaks once, quietly, in the moment, and does not repeat. It knows what's healthy, safe, and correct for you right now.",
    howItWorks: "Your Spleen speaks as an instant knowing - a hit, a flash, a quiet voice. It's not logical and often can't be explained. The Spleen is about survival in the moment: it knows what's good for you and what's not. But it speaks only once.",
    decisionProcess: [
      "Pay attention to the first, instant knowing when something comes to you",
      "Trust it even if you can't explain why",
      "Do not wait or try to repeat the knowing - the Spleen doesn't repeat",
      "If you missed it, wait for a new moment (new information, new opportunity)",
      "Act on the knowing - it's time-sensitive"
    ],
    timeline: "Splenic knowing is instantaneous and applies to the present moment. It's not about the future. Each moment brings new information and new splenic awareness. You can't save up splenic hits for later.",
    whatItFeelsLike: "Splenic intuition feels like a quiet 'knowing' - not loud, not emotional. It might be a soft voice, a slight pulling toward or away, or just a sense of 'yes' or 'no.' It's subtle and can be easily overridden by the mind.",
    practiceExercises: [
      "Practice stillness to hear your subtle splenic voice",
      "Notice instant reactions before your mind kicks in",
      "Trust your first instinct about people and places",
      "Pay attention to what feels healthy vs. unhealthy in the moment",
      "Practice acting on splenic hits without explaining them"
    ],
    commonMistakes: [
      "Waiting for the splenic hit to repeat (it won't)",
      "Trying to explain or rationalize the knowing",
      "Overriding intuition with mental reasoning",
      "Confusing fear with splenic awareness",
      "Looking for a loud voice when the Spleen whispers"
    ],
    questionsToAsk: [
      "What was my first, instant knowing?",
      "Am I overriding my intuition with my mind?",
      "Does this feel healthy for me right now?",
      "Did I hear it and just not trust it?",
      "Am I trying to force an old splenic knowing into a new moment?"
    ],
    integrationWithStrategy: "Your Strategy brings opportunities to you. The Spleen responds instantly to tell you whether they're correct. Don't look for splenic guidance before the opportunity arrives - it only speaks in the present moment."
  },
  
  'Ego Manifested': {
    authority: 'Ego Manifested',
    name: 'Ego Manifested Authority',
    center: 'Heart/Ego → Throat',
    forTypes: ['Manifestor'],
    overview: "Ego Manifested Authority is rare and powerful. Your Heart/Ego Center connects directly to your Throat, so you can hear your truth by declaring 'I will' or 'I won't.' What your heart wills, you must do.",
    howItWorks: "With this Authority, you hear your truth through your declarations. When you say 'I will do X' and it's true, you'll feel a willpower surge. When it's not correct, the statement will feel hollow. You manifest by declaring your will.",
    decisionProcess: [
      "Make 'I will' or 'I won't' statements about the decision",
      "Notice which declarations give you a surge of willpower",
      "The statement that feels powerful and true is your answer",
      "Inform others of your decision (Manifestor Strategy)",
      "Act on your will"
    ],
    timeline: "Ego Manifested Authority works in the moment of declaration. You don't need to wait, but you do need to speak your will out loud or in clear internal statements to know your truth.",
    whatItFeelsLike: "When you declare something correct for you, there's a surge of willpower - a feeling of 'yes, this is what I want.' Wrong declarations feel hollow, forced, or like you're just saying words. The right declaration empowers you.",
    practiceExercises: [
      "Practice making 'I will' statements about small daily choices",
      "Notice the difference between a powerful declaration and a hollow one",
      "Keep a journal of declarations that proved true",
      "Practice informing others of your will (Manifestor Strategy)",
      "Notice what your heart truly wants beneath social conditioning"
    ],
    commonMistakes: [
      "Making decisions from the mind instead of making declarations",
      "Promising things that aren't truly your will",
      "Not speaking your truth out loud",
      "Confusing social expectations with what your heart wants",
      "Overusing willpower on things that aren't correct for you"
    ],
    questionsToAsk: [
      "When I declare 'I will do this,' does it feel powerful?",
      "Is this what my heart truly wants?",
      "Am I making promises to please others or from my will?",
      "Does my declaration come with a surge of willpower?",
      "Have I informed others of my will?"
    ],
    integrationWithStrategy: "As a Manifestor, you initiate and inform. Your Ego Authority tells you what to initiate - through powerful declarations. Speak your will, notice the power surge, then inform others and act."
  },
  
  'Ego Projected': {
    authority: 'Ego Projected',
    name: 'Ego Projected Authority',
    center: 'Heart/Ego → G Center',
    forTypes: ['Projector'],
    overview: "Ego Projected Authority means your Heart connects to your G Center (identity), but not to your Throat. You hear your truth by listening to what you promise yourself - what you will have, be, or become.",
    howItWorks: "With this Authority, you make decisions based on what your heart and identity want together. It's not about what you'll do, but who you'll be. Listen to statements like 'I will have X' or 'I will be X' - your truth is in identity-aligned willpower.",
    decisionProcess: [
      "Consider the decision in terms of identity: 'Who will I be if I do this?'",
      "Make 'I will have' or 'I will be' statements",
      "Notice which statements align with who you truly are",
      "The statement that feels both powerful and identity-aligned is your answer",
      "Wait for recognition/invitation (Projector Strategy) to act"
    ],
    timeline: "This Authority works through internal reflection. Take time to sit with decisions and make statements about identity and having. You don't need to rush, but you also don't need extended waiting like Emotional Authority.",
    whatItFeelsLike: "Correct decisions feel aligned with who you truly are - there's a sense of 'this is me' combined with willpower. Wrong decisions feel like trying to be someone you're not, or wanting something that doesn't fit your identity.",
    practiceExercises: [
      "Practice 'I will have' and 'I will be' statements daily",
      "Journal about what aligns with your true identity",
      "Notice decisions that make you feel more like yourself",
      "Distinguish between ego-wants and identity-aligned will",
      "Wait for invitations and check them against your identity"
    ],
    commonMistakes: [
      "Deciding based on action ('I will do') instead of identity ('I will be')",
      "Ignoring whether decisions align with your true self",
      "Making promises that don't serve your identity",
      "Acting without invitation (Projector not-self)",
      "Confusing conditioned identity with true self"
    ],
    questionsToAsk: [
      "Who will I be if I do this?",
      "Does this align with my true identity?",
      "Is this what I truly want for myself?",
      "Am I waiting for proper recognition and invitation?",
      "Does my will support who I'm becoming?"
    ],
    integrationWithStrategy: "As a Projector, wait for recognition and invitation. When invitations come, use your Ego Projected Authority to determine if they align with who you are and what you want to have or be. Identity + Will = Your Answer."
  },
  
  'Self-Projected': {
    authority: 'Self-Projected',
    name: 'Self-Projected Authority',
    center: 'G Center → Throat',
    forTypes: ['Projector'],
    overview: "Self-Projected Authority means your G Center (identity) connects directly to your Throat. You hear your truth by talking it out - when you speak about possibilities, you'll hear what's true for you in your own voice.",
    howItWorks: "With this Authority, you need to speak to know. Your identity speaks through your Throat, so by talking about options, you hear your truth. This requires trusted sounding boards - people who let you talk without influencing your direction.",
    decisionProcess: [
      "Find a trusted sounding board - someone who listens without advising",
      "Talk about the decision, the options, how you feel about each",
      "Listen to yourself as you speak - your truth will reveal itself",
      "Notice which direction feels aligned with who you are",
      "The decision that sounds and feels 'like you' is correct"
    ],
    timeline: "You need time to talk things through. This isn't rushed, but it's also not emotional waiting. Give yourself space to have conversations (even with yourself) until you hear your truth.",
    whatItFeelsLike: "When you speak your truth, there's recognition - 'yes, that's it.' It sounds like you, feels aligned with your identity, and has a rightness when you hear it. Wrong options sound hollow or forced when you try to speak them as true.",
    practiceExercises: [
      "Find 2-3 trusted sounding boards who can listen without advising",
      "Practice thinking out loud about daily decisions",
      "Record yourself talking through options and listen back",
      "Notice when your voice changes - more alive, more 'you'",
      "Practice speaking without needing answers from your listener"
    ],
    commonMistakes: [
      "Deciding in your head without speaking",
      "Asking for advice instead of using sounding boards",
      "Taking on others' opinions when you speak with them",
      "Rushing the process without enough talking time",
      "Not trusting what you hear yourself say"
    ],
    questionsToAsk: [
      "What do I hear when I talk about this?",
      "Does this sound like me when I speak it?",
      "Am I giving myself enough time to talk this through?",
      "Are my sounding boards truly neutral?",
      "What did I hear myself say that felt true?"
    ],
    integrationWithStrategy: "As a Projector, wait for recognition and invitation. When invitations come, talk about them with trusted sounding boards. Your truth will emerge through your voice - then wait for the right invitation to act."
  },
  
  'Mental': {
    authority: 'Mental',
    name: 'Mental/Environmental Authority',
    center: 'None below Throat',
    forTypes: ['Projector'],
    overview: "Mental (or Environmental) Authority means you have no inner authority below the Throat. Your decisions come through talking with trusted others, time, and most importantly - place. Where you are matters enormously.",
    howItWorks: "Without a defined motor or awareness center below the Throat, you make decisions through external reflection. You need sounding boards (not advisors), time to process, and the right environment. Place and people matter more for you than almost anyone else.",
    decisionProcess: [
      "Find multiple trusted sounding boards - people who won't tell you what to do",
      "Talk about the decision from multiple angles, with different people",
      "Notice how you feel in different environments when considering options",
      "Give yourself significant time - at least 7 days for big decisions",
      "Notice what emerges consistently across conversations and environments"
    ],
    timeline: "Mental Authority requires extended time. For significant decisions, wait at least 7 days. This isn't about emotions - it's about allowing clarity to emerge through conversation, environment, and lunar cycles. Don't rush.",
    whatItFeelsLike: "Clarity for Mental Authority feels like a gradual knowing that emerges over time. It's not a flash of insight or emotional clarity - it's more like a 'of course, that's obvious now' that develops through the process.",
    practiceExercises: [
      "Cultivate 5-7 trusted sounding boards for different life areas",
      "Practice noticing how environment affects your thinking",
      "Keep a decision journal that tracks time, place, and conversations",
      "Learn your lunar cycle (28 days) and how it affects your clarity",
      "Practice patience - your process takes time and that's correct"
    ],
    commonMistakes: [
      "Deciding alone in your head",
      "Seeking advice instead of sounding boards",
      "Rushing decisions that need time",
      "Ignoring the impact of environment on your clarity",
      "Thinking you 'should' have inner certainty like others"
    ],
    questionsToAsk: [
      "Have I talked about this with enough different people?",
      "How do I feel about this in different environments?",
      "Have I given myself enough time?",
      "Am I seeking advice or using sounding boards?",
      "What's consistent across all my conversations?"
    ],
    integrationWithStrategy: "As a Projector, wait for recognition and invitation. Your Authority means invitations need extensive processing - talk about them, feel them in different places, and give yourself time. The right answer will emerge through the process."
  },
  
  'Lunar': {
    authority: 'Lunar',
    name: 'Lunar Authority',
    center: 'None (All Centers Undefined)',
    forTypes: ['Reflector'],
    overview: "Lunar Authority is unique to Reflectors, who have no defined centers. You make decisions by waiting through a full lunar cycle (approximately 29 days), allowing the moon to move through each of your open centers before you have clarity.",
    howItWorks: "With all centers undefined, you're deeply affected by the moon's transit through each gate and center. By waiting 29 days, you experience the decision from every possible energetic perspective. What remains consistent throughout the cycle is your truth.",
    decisionProcess: [
      "Receive an invitation or decision to make",
      "Commit to waiting through a full lunar cycle (29+ days)",
      "Track how you feel about the decision as the moon moves through signs",
      "Notice what stays consistent vs. what fluctuates",
      "After the full cycle, identify what remained true throughout",
      "Make your decision based on that consistent knowing"
    ],
    timeline: "Major decisions require a full 29-day lunar cycle. Smaller decisions may take less time, but significant life changes need the complete cycle. This isn't optional - it's how Reflectors achieve clarity.",
    whatItFeelsLike: "Lunar clarity feels like a deep, unshakeable knowing that has survived every energetic shift of the month. It's not emotional certainty (that changes) or mental conviction (that shifts) - it's the one thread that remained true no matter where the moon was.",
    practiceExercises: [
      "Track the moon's position and your mood/clarity daily for several months",
      "Keep a lunar decision journal for important choices",
      "Notice which moon phases give you most clarity",
      "Build a relationship with the moon as your decision partner",
      "Practice patience - 29 days is your process, not a flaw"
    ],
    commonMistakes: [
      "Trying to decide faster than the lunar cycle allows",
      "Ignoring the impact of lunar transits on your perspective",
      "Making major decisions during challenging moon phases",
      "Thinking you should be able to decide like others",
      "Not tracking your experience through the cycle"
    ],
    questionsToAsk: [
      "Have I waited a full lunar cycle?",
      "What has stayed consistent throughout the month?",
      "Am I being pressured to decide before my cycle is complete?",
      "How did I feel about this at different moon phases?",
      "What remains true regardless of who I'm around?"
    ],
    integrationWithStrategy: "As a Reflector, your Strategy is to wait 29 days before major decisions. This IS your Authority - they're integrated. The lunar cycle is both how opportunities mature and how clarity emerges. Trust your timeline."
  }
};

// Get authority data by authority string
export const getAuthorityData = (authority: string): HDAuthorityData | undefined => {
  return AUTHORITY_DATA[authority];
};

// Get all authorities
export const ALL_AUTHORITIES = Object.keys(AUTHORITY_DATA);
