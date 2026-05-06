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
    howItFeels = `This feels like a supportive wind at your back - ${transitPlanet}'s transformative power works WITH your ${natalPlanet}`;
  } else if (aspect === 'square') {
    howItFeels = `This feels like pressure you cannot ignore - ${transitPlanet} is forcing your ${natalPlanet} to evolve through friction`;
  } else if (aspect === 'opposition') {
    howItFeels = `This feels like encountering yourself in a mirror - others may trigger your ${natalPlanet} themes`;
  } else if (aspect === 'conjunction') {
    howItFeels = `This feels all-consuming - ${transitPlanet}'s energy merges completely with your ${natalPlanet}`;
  } else if (aspect === 'sextile') {
    howItFeels = `This feels like a gentle opening - ${transitPlanet} offers gifts to your ${natalPlanet} if you reach for them`;
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
      baseFeel = `Pluto is fused with your ${natalPlanet}. You are being taken apart and rebuilt in this area. There is no escaping the depth work`;
      break;
    case 'trine':
      baseFeel = `Pluto empowers your ${natalPlanet} from a supportive angle. Transformation flows naturally - you access power without the crisis`;
      break;
    case 'square':
      baseFeel = `Pluto pressures your ${natalPlanet} through friction. Something must change. You feel blocked, obsessed, or forced to confront what you have avoided`;
      break;
    case 'opposition':
      baseFeel = `Pluto faces your ${natalPlanet} across the chart. Power dynamics with others force you to reclaim what you have projected outward`;
      break;
    case 'sextile':
      baseFeel = `Pluto offers transformation to your ${natalPlanet} gently. If you lean in, deep change is available without the intensity of harder aspects`;
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
      hard: 'Your emotional patterns are being dredged up from the depths. Old wounds with mother/nurturers surface. You may feel emotionally raw, possessive, or unable to trust your instincts until they are purified',
      soft: 'Your emotional intelligence deepens naturally. You access powerful intuition and can help others transform their feelings'
    },
    Sun: {
      hard: 'Your very identity is being deconstructed. Who you thought you were must die for who you are becoming to emerge. Ego battles, power struggles with father figures, or loss of status may occur',
      soft: 'Your personal power consolidates. You step into authority naturally and can influence situations without force'
    },
    Mercury: {
      hard: 'Your thought patterns are being overhauled. Obsessive thinking, intense conversations, or discovering hidden information is likely. Your words carry more weight but may cut deeper than intended',
      soft: 'Your mind gains penetrating insight. Research, investigation, and deep conversations come easily'
    },
    Venus: {
      hard: 'Your relationships and values are being transformed through intensity. Obsessive attractions, jealousy, or the death of relationships that no longer serve you. What you love changes forever',
      soft: 'You attract powerful connections and can transform relationships gracefully. Beauty and pleasure gain depth'
    },
    Mars: {
      hard: 'Your will and drive are being forged in fire. Rage may surface. Power struggles demand you fight for what matters or walk away. Sexual energy intensifies and may feel overwhelming',
      soft: 'Your assertion becomes strategic and effective. You accomplish what you set out to do and can transform conflict into cooperation'
    },
    NorthNode: {
      hard: 'Your soul purpose is being burned into clarity. Life circumstances force you onto your path through elimination of distractions. This is fated transformation toward your destiny',
      soft: 'Your evolutionary direction is supported by deep forces. Transformation accelerates your growth toward what you came here to become'
    },
    Ascendant: {
      hard: 'Your persona and physical body are transforming. Others see you differently. You may look different, project more intensity, or be seen as threatening even when you are not trying',
      soft: 'You project personal power without trying. People sense your depth and may defer to your presence naturally'
    },
    Midheaven: {
      hard: 'Your career and public role are being dismantled and rebuilt. Status changes, loss of reputation, or complete career transformation. What you are known for must die for your true calling to emerge',
      soft: 'Professional power grows organically. You gain influence and authority in your field without destructive power struggles'
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
    baseFeel = `Neptune is dissolving clarity around your ${natalPlanet}. You may feel confused, disillusioned, or seduced by fantasy in this area. What seemed solid becomes uncertain`;
  } else {
    baseFeel = `Neptune sensitizes your ${natalPlanet} gently. Intuition, creativity, and spiritual connection flow more easily. Dreams feel more vivid`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. In your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this fog or inspiration affects ${houseContext.examples}`;
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
    baseFeel = `Uranus is electrifying your ${natalPlanet} through disruption. Expect sudden changes, restlessness, or breakthroughs that shatter old patterns. You cannot stay the same here`;
  } else {
    baseFeel = `Uranus awakens your ${natalPlanet} with exciting possibilities. Innovation and freedom feel available without the chaos of harder aspects`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The lightning strikes in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
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
    baseFeel = `Saturn is testing your ${natalPlanet} through restriction. Delays, obstacles, or heavy responsibility press down. Only what is real and mature survives this`;
  } else {
    baseFeel = `Saturn stabilizes your ${natalPlanet} supportively. Discipline pays off, structures solidify, and lasting achievements become possible`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The tests or rewards manifest in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getJupiterTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  
  let baseFeel = `Jupiter expands your ${natalPlanet}. Growth, opportunity, and optimism flow toward this part of you`;
  
  if (aspect === 'square' || aspect === 'opposition') {
    baseFeel = `Jupiter expands your ${natalPlanet} but may over-promise. Watch for excess, overconfidence, or scattered energy. Opportunity comes with a need for discernment`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. Blessings or expansion touch your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}
