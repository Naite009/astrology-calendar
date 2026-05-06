// Personalized Transit Interpretation System
// Generates interpretations based on: transit planet + aspect + natal planet + natal house + natal sign

interface PersonalizedTransitResult {
  meaning: string;
  howItFeels: string;
}

// Aspect modifiers - how the aspect type colors the transit
const ASPECT_MODIFIERS = {
  conjunction: {
    energy: 'fused, unavoidable',
    experience: 'right on top of you, not at arm\'s length',
    action: 'You cannot file this one away or pretend it is happening to someone else',
    challenge: 'No distance from it. You will not be able to step back and analyze',
  },
  trine: {
    energy: 'easy, low-resistance',
    experience: 'doors open without you forcing them',
    action: 'Reach out, send the email, take the meeting. It only pays off if you act',
    challenge: 'It is so easy to coast that the window closes without you using it',
  },
  square: {
    energy: 'pressure that will not let up',
    experience: 'cornered, irritable, tired of the same fight',
    action: 'Something has to actually change. Patching it will not work this time',
    challenge: 'You will pick fights, blame people, or freeze. The discomfort is the point',
  },
  opposition: {
    energy: 'mirrored, externalized',
    experience: 'one specific person keeps showing up acting out the part of you you have not owned',
    action: 'The fight or attraction with them is really about you. Notice what you are projecting',
    challenge: 'Blaming the other person, or swinging from one extreme to the other',
  },
  sextile: {
    energy: 'a quiet, easy-to-miss opening',
    experience: 'a small intro, a small idea, a useful conversation',
    action: 'You have to actually reach out, ask, or follow up. It will not chase you',
    challenge: 'Looks too small to bother with, so you skip it',
  },
};

// Natal planet meanings - what part of you is being activated
const NATAL_PLANET_MEANINGS: Record<string, { area: string; feels: string }> = {
  Sun: { area: 'your confidence and how visible you are willing to be', feels: 'whether you take up space in a room or shrink' },
  Moon: { area: 'what you need in order to feel safe and at home in your body', feels: 'your gut, your appetite, your sleep, your need for the people you trust' },
  Mercury: { area: 'how your brain runs and how you talk to people', feels: 'whether you can find words, focus, return texts, and follow a conversation' },
  Venus: { area: 'who you are drawn to, what you spend on, and how lovable you feel', feels: 'your appetite for closeness, beauty, food, sex, and being chosen' },
  Mars: { area: 'your drive, your fight, and your sex drive', feels: 'how fast your fuse is and how hard you can push' },
  Jupiter: { area: 'how big you let your life get and how much you say yes to', feels: 'whether things feel lucky and abundant or stuck and small' },
  Saturn: { area: 'what you make yourself do, even when you do not feel like it', feels: 'the weight of your responsibilities and whether you trust yourself to carry them' },
  Uranus: { area: 'the part of you that cannot fake it anymore', feels: 'restlessness, the urge to quit, the urge to tell the truth out loud' },
  Neptune: { area: 'how you check out, daydream, and blur the lines', feels: 'how foggy, sensitive, tired, or escapist you are running' },
  Pluto: { area: 'what you obsess over and what you have to rebuild from the ground up', feels: 'fixation, intensity, the sense that something has to die so you can move on' },
  NorthNode: { area: 'the unfamiliar move your life keeps asking you to make', feels: 'awkward, shaky, like a beginner on purpose' },
  SouthNode: { area: 'the role you can do in your sleep that has stopped feeding you', feels: 'easy, automatic, quietly draining' },
  Chiron: { area: 'the old wound you keep bumping into in this area', feels: 'a flinch, a numbness, a story you have told yourself a hundred times' },
  Ascendant: { area: 'how you walk into a room and how strangers read you', feels: 'your face, your body language, your first 10 seconds with anyone' },
  Midheaven: { area: 'what you are publicly known for and where your name shows up', feels: 'work, status, being watched, being judged' },
};

// House meanings - WHERE in life this plays out
const HOUSE_CONTEXTS: Record<number, { domain: string; examples: string }> = {
  1: { domain: 'how you walk into a room and how strangers read you', examples: 'your face, your body, your style, your first impression, your physical energy' },
  2: { domain: 'money, possessions, and how worthy of good things you feel', examples: 'your bank account, what you own, what you charge, what you let yourself have' },
  3: { domain: 'daily talking, texting, and your immediate circle', examples: 'siblings, neighbors, group chats, errands, short trips, what you read' },
  4: { domain: 'home, family, and your private inner life', examples: 'your parents, where you live, your roots, what you only show people you trust' },
  5: { domain: 'play, dating, kids, and what you make for fun', examples: 'flirting, hobbies, your kids, creative projects, gambling, what makes you laugh' },
  6: { domain: 'your daily job, body, and routines', examples: 'your job, your boss, your coworkers, your gym, your sleep, your symptoms, your pets' },
  7: { domain: 'one-on-one relationships you are formally in', examples: 'your spouse, your business partner, your therapist, your lawyer, your closest rival' },
  8: { domain: 'sex, money you share with others, and what you cannot control', examples: 'intimacy, debt, taxes, inheritance, your partner\'s money, deep change' },
  9: { domain: 'travel, what you believe, and the bigger picture', examples: 'long trips, school, religion, foreign cultures, court cases, publishing' },
  10: { domain: 'your career, your reputation, and what you are known for', examples: 'your job title, your boss, your public name, your achievements, what people google about you' },
  11: { domain: 'friends, groups, and what you are working toward', examples: 'your friends, your community, your goals, your network, social media, your future' },
  12: { domain: 'what you do alone, what you hide, and what is bigger than you', examples: 'private grief, secrets, hospitals, recovery, sleep, dreams, time you spend offline' },
};

// Sign modifiers - HOW the natal planet expresses
const SIGN_EXPRESSION: Record<string, string> = {
  Aries: 'fast, blunt, and not waiting for permission',
  Taurus: 'slowly, with its feet planted, and not interested in being rushed',
  Gemini: 'with a lot of words, a lot of questions, and one foot already moving on',
  Cancer: 'cautiously, from behind a shell, and only after checking who is safe',
  Leo: 'out loud, on stage, needing to be seen and credited',
  Virgo: 'with a list, a fix, and a quiet running critique',
  Libra: 'by checking with the other person first and softening the edges',
  Scorpio: 'all-in or not at all, watching everything, trusting almost no one',
  Sagittarius: 'big, loud, hopeful, and ready to move on the second it gets boring',
  Capricorn: 'with a plan, a long timeline, and very little patience for excuses (yours or theirs)',
  Aquarius: 'from a step back, on its own terms, refusing to do it the way everyone else does',
  Pisces: 'softly, dreamily, with a porous sense of where you end and the other person begins',
};

// Transit planet intentions - what the outer planet is trying to DO
const TRANSIT_PLANET_ACTIONS: Record<string, { verb: string; effect: string; timeline: string }> = {
  Pluto: {
    verb: 'forces a slow, deep rebuild in this part of your life',
    effect: 'something here that is fake, propped up, or kept on life support starts breaking down. You will fixate on it, sometimes feel scared of it, and by the end you will not recognize the old version of yourself in this area',
    timeline: 'This is a 1-3 year process that goes much deeper than you think it will'
  },
  Neptune: {
    verb: 'softens, blurs, and slowly dissolves the edges in this part of your life',
    effect: 'you will be more tired, more sensitive, more pulled toward escape (sleep, scrolling, drinking, fantasizing). Creative and spiritual work flows; deadlines and hard decisions feel impossible. You will romanticize people and situations',
    timeline: 'This is a 1-2 year sensitizing, slow and easy to miss until you look back'
  },
  Uranus: {
    verb: 'shakes loose whatever you have been faking in this area',
    effect: 'you suddenly want out, want to tell the truth, want to quit, want to move. Plans you thought were locked in get blown up. Boredom becomes intolerable',
    timeline: 'Sudden shocks across about a year, but the change sticks'
  },
  Saturn: {
    verb: 'puts pressure on this part of your life until only what is real survives',
    effect: 'extra responsibility, delays, the sense of being tested. If you have been winging it here, you will get caught. If you have been doing the real work, this is where you finally get credit for it',
    timeline: '2-3 year reality check'
  },
  Jupiter: {
    verb: 'opens this part of your life up and makes it bigger',
    effect: 'opportunities show up, doors open, you say yes to more, you spend more, you travel, you grow. Watch for overcommitting and over-promising',
    timeline: 'About a year of expansion, with the best window in the middle'
  },
  Mars: {
    verb: 'turns up the heat fast in this area',
    effect: 'more drive, more urgency, shorter fuse, more sex drive, more "go right now." You will get a lot done and you will pick fights more easily',
    timeline: 'A few intense days to a couple weeks'
  },
  Sun: {
    verb: 'shines a spotlight on this area for a few days',
    effect: 'attention comes here, you feel more visible, things in this part of your life come into focus',
    timeline: 'Brief annual spotlight, a few days'
  },
  Venus: {
    verb: 'softens and sweetens this part of your life for a few days',
    effect: 'love, beauty, money, and small pleasures show up more easily. Good for asking, flirting, and indulging',
    timeline: 'A brief window, a few days'
  },
  Mercury: {
    verb: 'lights up the talking, texting, and thinking in this area',
    effect: 'more conversations, more ideas, more inbox, more decisions. Helpful for figuring things out, risky for signing things',
    timeline: 'A quick mental burst, a few days'
  },
  Moon: {
    verb: 'briefly turns up the feelings and the body sense in this area',
    effect: 'mood shifts, gut reactions, cravings, the sense of "I just need to be home/held/fed"',
    timeline: 'Hours, then it moves on'
  },
};

// Generate personalized transit interpretation
export function getPersonalizedTransitInterpretation(
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null,
  natalSign: string | null
): PersonalizedTransitResult {
  const aspectMod = ASPECT_MODIFIERS[aspect as keyof typeof ASPECT_MODIFIERS] || ASPECT_MODIFIERS.conjunction;
  const natalMeaning = NATAL_PLANET_MEANINGS[natalPlanet] || { area: 'this part of your psyche', feels: 'your inner experience' };
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const signExpr = natalSign ? SIGN_EXPRESSION[natalSign] : null;
  const transitAction = TRANSIT_PLANET_ACTIONS[transitPlanet] || TRANSIT_PLANET_ACTIONS.Sun;

  // Build the meaning sentence
  let meaning = `Transit ${transitPlanet} ${transitAction.verb}. It is making a ${aspect} to your natal ${natalPlanet}, which governs ${natalMeaning.area}`;
  
  if (houseContext) {
    meaning += ` in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house of ${houseContext.domain}`;
  }
  
  meaning += `. ${aspectMod.action}. ${transitAction.timeline}.`;

  // Build the "how it feels" sentence - this is the personal part
  let howItFeels = '';
  
  // Start with aspect-specific feeling
  if (aspect === 'trine') {
    howItFeels = `This one is low-resistance. Things in this area open up if you actually walk through the door. Easy to sleep through if you do not act`;
  } else if (aspect === 'square') {
    howItFeels = `This one will not let up. You will feel cornered and irritable in this area until you actually change something, not just patch it`;
  } else if (aspect === 'opposition') {
    howItFeels = `One specific person keeps showing up acting out the part of your ${natalPlanet} you have not owned. The fight or attraction is really about you`;
  } else if (aspect === 'conjunction') {
    howItFeels = `It is right on top of you, not at arm\'s length. Whatever ${transitPlanet} does, it does it through your ${natalPlanet} for the duration`;
  } else if (aspect === 'sextile') {
    howItFeels = `A small, easy-to-miss opening. A useful intro, a small idea, a quick conversation. Only pays off if you reach out`;
  }

  // Add house-specific sensation
  if (houseContext && natalHouse) {
    howItFeels += `. Because your ${natalPlanet} lives in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this plays out through ${houseContext.examples}`;
  }

  // Add sign coloring
  if (signExpr && natalSign) {
    howItFeels += `. Your ${natalPlanet} in ${natalSign} processes this ${signExpr}`;
  }

  howItFeels += '.';

  return { meaning, howItFeels };
}

// Specific interpretation generators for major outer planet transits
export function getPlutoTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null,
  natalSign: string | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  
  // Base Pluto feeling by aspect
  let baseFeel = '';
  switch (aspect) {
    case 'conjunction':
      baseFeel = `Pluto is fused with your ${natalPlanet}. Something here that you have outgrown but kept propping up starts breaking down on its own. You will fixate on it, sometimes feel scared of what is being uncovered, and by the end you will not recognize the old version of yourself in this area`;
      break;
    case 'trine':
      baseFeel = `Pluto deepens your ${natalPlanet} without the crisis. You can do hard inner work, end something cleanly, or reclaim power here without it blowing your life up. The change still happens, just with less wreckage`;
      break;
    case 'square':
      baseFeel = `Pluto squeezes your ${natalPlanet}. Something you have been controlling, hiding, or refusing to look at gets forced into the open. You will obsess, fight to keep things the same, and lose that fight. The way out is to stop defending the old version`;
      break;
    case 'opposition':
      baseFeel = `Pluto faces your ${natalPlanet} through one specific person who is acting out exactly the power dynamic you have not handled in yourself. A boss, partner, family member, or rival becomes the mirror. You cannot win by controlling them`;
      break;
    case 'sextile':
      baseFeel = `Pluto offers your ${natalPlanet} a quiet way to do the deep work. A therapist, a hard conversation, a confession, a clean ending. It will not force you, but it is open if you take it`;
      break;
    default:
      baseFeel = `Pluto is activating your ${natalPlanet}`;
  }

  // Add house context
  if (houseContext && natalHouse) {
    baseFeel += `. In your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this manifests through ${houseContext.examples}`;
  }

  // Add natal planet-specific Pluto feeling
  const planetSpecific = getPlutoPlanetSpecific(natalPlanet, aspect);
  if (planetSpecific) {
    baseFeel += `. ${planetSpecific}`;
  }

  return baseFeel;
}

function getPlutoPlanetSpecific(natalPlanet: string, aspect: string): string {
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  const specifics: Record<string, { hard: string; soft: string }> = {
    Moon: {
      hard: 'Old feelings about your mother, your home, or who fed you as a kid surface without warning. You may feel raw, possessive, jealous, or suddenly distrust your own gut. Cravings get intense. Crying or rage out of nowhere is normal here',
      soft: 'You can finally talk about the family stuff or feel the old grief without drowning in it. Therapy works. Your gut gets sharper and harder to lie to'
    },
    Sun: {
      hard: 'Who you have been telling people you are stops fitting. A title, a role, a position, or a relationship with a father figure or boss falls apart. You will feel invisible or attacked before you feel rebuilt',
      soft: 'You step into more authority without having to fight for it. People listen when you talk. You stop apologizing for taking up space'
    },
    Mercury: {
      hard: 'You will obsess over one conversation, one text, one fact. You might dig up information you cannot un-know. Your words land harder than you mean them to. People remember what you say right now',
      soft: 'You can research, investigate, write, or have the conversation that everyone has been avoiding. People will tell you things they have never told anyone'
    },
    Venus: {
      hard: 'You will fixate on one person. Either you cannot stop wanting them, or you cannot stop being jealous, or a relationship that has been quietly dead actually ends. Money you tied up with someone gets messy too',
      soft: 'A relationship gets deeper and more honest, or you let one end with grace. You stop chasing people who do not want you back'
    },
    Mars: {
      hard: 'Rage you did not know was in there comes up. Power fights at work or in bed. Your sex drive spikes or crashes. You may quit a job in one afternoon. Watch the body: injuries, fevers, surgery come up here',
      soft: 'You can finally do the hard thing you have been avoiding. You stop wasting energy on fights you do not need to have, and you win the ones you pick'
    },
    NorthNode: {
      hard: 'Life clears the path for you the hard way. Things that were distracting you (a job, a relationship, a city) end. You are being pushed onto the road you were avoiding',
      soft: 'The next step on your path opens up and the people who are supposed to help you start showing up'
    },
    Ascendant: {
      hard: 'Your body and your face start changing. People treat you differently in public, sometimes as more intimidating than you feel. You may want a haircut, a tattoo, a new name. The old surface is being shed',
      soft: 'You walk into rooms with more weight. People sense it without you trying. You stop performing the old version of yourself'
    },
    Midheaven: {
      hard: 'Your job title, your reputation, or what you are known for breaks down. You may get fired, walk away, or have a public misstep. The thing being torn out is something you had outgrown anyway',
      soft: 'You quietly grow into more public power. Your work gets more serious, more your own, and harder to dismiss'
    },
  };

  const spec = specifics[natalPlanet];
  if (!spec) return '';
  return isHard ? spec.hard : spec.soft;
}

// Helper function
function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export function getNeptuneTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Neptune blurs your ${natalPlanet}. You will second-guess what you actually want, feel more tired and sensitive than usual, and get pulled toward escape (sleep, scrolling, drinking, romanticizing someone who is not who they seem). Do not sign anything important and do not believe the version of people in your head right now`;
  } else {
    baseFeel = `Neptune softens your ${natalPlanet}. Music hits harder, dreams get vivid, and you can let your guard down with the right people. Good for art, prayer, rest, and being kind to yourself. Still a bad time to lend money or believe the salesman`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. In your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, the fog or the inspiration shows up through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getUranusTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Uranus jolts your ${natalPlanet}. You will get restless fast, want to quit, want to tell the truth out loud, or want to leave. Plans you thought were locked in get blown up. Whatever you have been faking here, you stop faking. Try not to torch everything in one night`;
  } else {
    baseFeel = `Uranus opens up your ${natalPlanet} in a way that does not break things. You can try the new approach, leave the role you have outgrown, or say the thing you have been holding back, without it costing you everything`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The shake-up lands in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getSaturnTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Saturn presses on your ${natalPlanet}. Extra responsibility, delays, the sense of being tested. If you have been winging it here, you will get caught. If you have been doing the real work, this is where you finally get credit, just slower than you wanted`;
  } else {
    baseFeel = `Saturn steadies your ${natalPlanet}. Effort starts paying off, structures hold, and what you build now is going to last. Good for commitments, contracts, and finishing things you started`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The pressure or the payoff lands in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getJupiterTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  
  let baseFeel = `Jupiter opens up your ${natalPlanet}. Opportunities show up here, you say yes more, you spend more, you travel more, you grow`;
  
  if (aspect === 'square' || aspect === 'opposition') {
    baseFeel = `Jupiter opens up your ${natalPlanet} but you will overdo it. You will overcommit, overspend, over-promise, or believe the hype. Take the opportunity, just cut it in half before you sign`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The growth lands in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}
