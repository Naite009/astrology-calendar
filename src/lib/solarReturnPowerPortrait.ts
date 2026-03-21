import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

// ─── Types ──────────────────────────────────────────────────────────
export interface PowerSource {
  planet: string;
  sign: string;
  house: number | null;
  reason: string;
}

export interface PowerSection {
  title: string;
  emoji: string;
  summary: string;
  sources: PowerSource[];
}

export interface PowerLeak {
  pattern: string;
  trigger: string;
  antidote: string;
}

export interface PowerPortrait {
  driveEngine: PowerSection;
  sustainStyle: PowerSection;
  burnoutPattern: PowerSection;
  realignmentTool: PowerSection;
  powerLeaks: PowerLeak[];
  oneLineMantra: string;
}

// ─── Helpers ────────────────────────────────────────────────────────
const HOUSE_PLAIN: Record<number, string> = {
  1: 'your identity and self-image', 2: 'your finances and self-worth', 3: 'communication and learning',
  4: 'home and family', 5: 'creativity and romance', 6: 'health and daily routines',
  7: 'partnerships and relationships', 8: 'shared resources and deep change', 9: 'travel and big-picture goals',
  10: 'career and public role', 11: 'friendships and community', 12: 'inner work and quiet reflection',
};

const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const SIGN_MODALITY: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

const DRIVE_BY_SIGN: Record<string, string> = {
  Aries: 'You start fast and lead through action -- your drive comes from being first and doing it yourself',
  Taurus: 'You are driven by building something lasting -- steady effort toward tangible results keeps you going',
  Gemini: 'Curiosity and variety fuel your engine -- you need mental stimulation and multiple projects',
  Cancer: 'Protecting what matters drives you -- your ambition is strongest when it serves people you love',
  Leo: 'Recognition and creative pride power your drive -- you need to feel your work matters and is seen',
  Virgo: 'Improvement drives you -- you stay motivated when there is a problem to solve or a process to refine',
  Libra: 'Partnership and fairness fuel your action -- you fight hardest when something feels unjust',
  Scorpio: 'Intensity and depth drive you -- you are unstoppable when emotionally invested, but will not bother with surface-level goals',
  Sagittarius: 'Meaning and freedom power your engine -- you need to believe in what you are chasing',
  Capricorn: 'Long-term ambition drives you -- you are built for sustained effort toward measurable achievement',
  Aquarius: 'Innovation and independence fuel you -- you push hardest against systems that feel outdated',
  Pisces: 'Inspiration and compassion drive your action -- you are most powerful when channeling something bigger than yourself',
};

const SUSTAIN_BY_MODALITY: Record<string, string> = {
  Cardinal: 'You are a starter -- you ignite projects with energy but may lose steam once the novelty fades. Your staying power comes from having someone or something to initiate for.',
  Fixed: 'You are built to endure -- once committed, you do not quit. Your risk is not burnout from effort, it is burnout from refusing to let go of something that is no longer working.',
  Mutable: 'You sustain through adaptation -- you shift strategies instead of grinding. Your strength is flexibility, but you can scatter energy across too many pivots.',
};

const getSaturnBurnout = (house: number | null, sign: string): string => {
  const houseTheme: Record<number, string> = {
    1: 'overworking your identity -- trying to be everything to everyone until you collapse',
    2: 'financial anxiety -- overworking for security that never feels like enough',
    3: 'mental overload -- saying yes to every conversation, errand, and obligation',
    4: 'family duty exhaustion -- carrying the emotional weight of your household',
    5: 'performance pressure -- turning every creative act into a test of your worth',
    6: 'health neglect through overwork -- grinding through routines until your body forces you to stop',
    7: 'relationship sacrifice -- giving up your needs to keep partnerships stable',
    8: 'control and trust issues -- exhausting yourself managing other peoples crises or money',
    9: 'meaning burnout -- constantly searching for purpose without pausing to live',
    10: 'career obsession -- defining your worth entirely through professional achievement',
    11: 'social exhaustion -- overcommitting to groups, causes, and friends at your own expense',
    12: 'invisible burnout -- silently carrying burdens nobody sees until you shut down completely',
  };
  return house ? (houseTheme[house] || 'overextending yourself in ways you do not notice until it is too late') : 'overextending yourself in ways you do not notice until it is too late';
};

const getMoonRealignment = (sign: string): string => {
  const moonRecharge: Record<string, string> = {
    Aries: 'Physical movement -- a hard workout, a solo walk, or doing something competitive resets your nervous system',
    Taurus: 'Sensory comfort -- good food, a bath, soft music, or time in nature brings you back to yourself',
    Gemini: 'Talking it out -- a good conversation, journaling, or reading something interesting clears your head',
    Cancer: 'Home and nurture -- cooking, being with family, or curling up somewhere safe restores your center',
    Leo: 'Creative expression -- making something, performing, or receiving genuine appreciation refills your tank',
    Virgo: 'Organizing and fixing -- cleaning a closet, making a list, or solving a practical problem calms you down',
    Libra: 'Beauty and connection -- time with someone you love, a beautiful environment, or art brings you peace',
    Scorpio: 'Solitude and depth -- time alone to process, intense music, or a brutally honest conversation with yourself',
    Sagittarius: 'Adventure and perspective -- a drive with no destination, learning something new, or laughing resets everything',
    Capricorn: 'Accomplishment -- completing even a small task, making a plan, or seeing measurable progress calms your system',
    Aquarius: 'Space and freedom -- time alone with no obligations, weird hobbies, or thinking about big ideas recharges you',
    Pisces: 'Surrender and escape -- sleep, water, music, meditation, or letting yourself cry clears the emotional backlog',
  };
  return moonRecharge[sign] || 'Finding whatever makes your body relax and your mind go quiet';
};

const getNNDirection = (sign: string): string => {
  const nnPath: Record<string, string> = {
    Aries: 'trusting your own instincts instead of waiting for permission -- act first, adjust later',
    Taurus: 'choosing stability over drama -- building something real instead of chasing intensity',
    Gemini: 'staying curious and flexible instead of clinging to one rigid truth',
    Cancer: 'letting yourself need people instead of pretending you can handle everything alone',
    Leo: 'putting yourself out there creatively instead of hiding in the crowd',
    Virgo: 'focusing on what is practical and useful instead of getting lost in idealism',
    Libra: 'learning to collaborate and compromise instead of insisting on doing it your way',
    Scorpio: 'going deep and committed instead of staying on the surface where it feels safe',
    Sagittarius: 'choosing meaning and big-picture truth over comfortable routines',
    Capricorn: 'building real-world structures instead of depending on emotional security alone',
    Aquarius: 'thinking about the collective instead of only what benefits you personally',
    Pisces: 'surrendering control and trusting intuition instead of analyzing everything to death',
  };
  return nnPath[sign] || 'growing toward what feels unfamiliar but true';
};

// ─── Power Leaks ────────────────────────────────────────────────────
function detectPowerLeaks(analysis: SolarReturnAnalysis, natalChart: NatalChart): PowerLeak[] {
  const leaks: PowerLeak[] = [];
  const planets = natalChart.planets || {};
  const srHouses = analysis.planetSRHouses || {};

  // Mars retrograde → forcing
  const mars = Object.entries(analysis.houseOverlays).find(([_, o]) => o);
  if (analysis.retrogrades?.planets?.includes('Mars')) {
    leaks.push({
      pattern: 'Forcing',
      trigger: 'Your drive and motivation energy is in review mode this year — pushing harder does not get results faster',
      antidote: 'Slow down, revisit old plans, and let frustrated energy redirect itself before acting',
    });
  }

  // Saturn on angles → freeze
  const saturnH = srHouses['Saturn'];
  if (saturnH === 1 || saturnH === 10) {
    const satArea = saturnH === 1 ? 'your identity' : 'your career';
    leaks.push({
      pattern: 'Freezing',
      trigger: `Responsibility is concentrated in ${satArea} -- self-doubt and imposter syndrome can paralyze you`,
      antidote: 'Take the smallest possible action every day. Consistent small steps always beat waiting for the perfect moment.',
    });
  }

  // Neptune prominent → escapism
  const neptuneH = srHouses['Neptune'];
  if (neptuneH === 1 || neptuneH === 7 || neptuneH === 10) {
    const nepArea = HOUSE_PLAIN[neptuneH] || 'a key area';
    leaks.push({
      pattern: 'Escapism',
      trigger: `Your imagination is extra active in ${nepArea} -- confusion, avoidance, or numbing instead of dealing with reality`,
      antidote: 'Schedule daily grounding: 5 minutes of body awareness, a walk, or writing down one true thing.',
    });
  }

  // Pluto square/opposition to Sun or Moon → overcorrecting
  const plutoAspects = analysis.srToNatalAspects?.filter(a =>
    (a.planet1 === 'Pluto' || a.planet2 === 'Pluto') &&
    (a.type === 'Square' || a.type === 'Opposition')
  ) || [];
  if (plutoAspects.length > 0) {
    leaks.push({
      pattern: 'Overcorrecting',
      trigger: 'Deep change energy is strong this year -- the urge to blow everything up and start over when what is needed is targeted change',
      antidote: 'Before making big decisions, wait 72 hours. Transform one thing at a time instead of everything at once.',
    });
  }

  // Uranus on MC/ASC → restlessness
  const uranusH = srHouses['Uranus'];
  if (uranusH === 1 || uranusH === 10) {
    const uArea = uranusH === 1 ? 'your identity' : 'your career';
    leaks.push({
      pattern: 'Restlessness',
      trigger: `Sudden urges to change ${uArea} can destabilize what is working`,
      antidote: 'Experiment in low-stakes areas first. Not every impulse needs to become a life decision.',
    });
  }

  return leaks;
}

// ─── Main Generator ────────────────────────────────────────────────
export function generatePowerPortrait(
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
): PowerPortrait {
  const planets = natalChart.planets || {};
  const srPlanets = srChart.planets || {};
  const srHouses = analysis.planetSRHouses || {};

  // ── 1. DRIVE ENGINE (Mars + Sun + dominant modality) ──
  const mars = planets['Mars'];
  const srMars = srPlanets['Mars'];
  const sun = planets['Sun'];
  const marsSign = mars?.sign || 'Aries';
  const marsSRHouse = srHouses['Mars'];

  const driveSources: PowerSource[] = [];
  if (mars) {
    driveSources.push({
      planet: 'Mars',
      sign: mars.sign,
      house: null,
      reason: DRIVE_BY_SIGN[mars.sign] || 'Your Mars drives action in its own unique way',
    });
  }
  if (srMars && marsSRHouse) {
    driveSources.push({
      planet: 'Mars (this year)',
      sign: srMars.sign || marsSign,
      house: marsSRHouse,
      reason: `This year your drive is channeled into ${HOUSE_PLAIN[marsSRHouse] || 'a specific life area'} -- that is where you'll feel the most urgency to act`,
    });
  }
  if (sun) {
    driveSources.push({
      planet: 'Sun',
      sign: sun.sign,
      house: null,
      reason: `Your core identity in ${sun.sign} shapes what you consider worth fighting for`,
    });
  }

  // ── 2. SUSTAIN STYLE (dominant modality) ──
  const modalCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const sustainSources: PowerSource[] = [];
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'];
  for (const pName of personalPlanets) {
    const p = planets[pName];
    if (p?.sign) {
      const mod = SIGN_MODALITY[p.sign];
      if (mod) {
        modalCounts[mod as keyof typeof modalCounts]++;
        sustainSources.push({
          planet: pName,
          sign: p.sign,
          house: null,
          reason: `${pName} in ${p.sign} (${mod}) -- ${mod === 'Cardinal' ? 'initiates' : mod === 'Fixed' ? 'sustains' : 'adapts'}`,
        });
      }
    }
  }
  const dominantModality = Object.entries(modalCounts).sort((a, b) => b[1] - a[1])[0][0];

  // ── 3. BURNOUT PATTERN (Saturn + 6th house + 12th house) ──
  const saturn = planets['Saturn'];
  const saturnSRHouse = srHouses['Saturn'];
  const burnoutSources: PowerSource[] = [];
  if (saturn) {
    burnoutSources.push({
      planet: 'Commitment & responsibility (lifelong)',
      sign: saturn.sign,
      house: null,
      reason: 'Your lifelong pressure point — the area where you naturally overwork and under-rest',
    });
  }
  if (saturnSRHouse) {
    burnoutSources.push({
      planet: 'Saturn (this year)',
      sign: srPlanets['Saturn']?.sign || saturn?.sign || '',
      house: saturnSRHouse,
      reason: getSaturnBurnout(saturnSRHouse, srPlanets['Saturn']?.sign || ''),
    });
  }
  // 6th house planets = work overload
  const sixthHousePlanets = analysis.houseOverlays?.filter(o => o.srHouse === 6) || [];
  for (const overlay of sixthHousePlanets) {
    burnoutSources.push({
      planet: overlay.planet,
      sign: '',
      house: 6,
      reason: `${overlay.planet} is in your health and daily routine area this year -- adds load to your schedule and body`,
    });
  }

  // ── 4. REALIGNMENT TOOL (Moon + North Node) ──
  const moon = planets['Moon'];
  const nn = planets['NorthNode'];
  const moonSign = moon?.sign || 'Cancer';
  const nnSign = nn?.sign || '';
  const realignSources: PowerSource[] = [];
  if (moon) {
    realignSources.push({
      planet: 'Moon',
      sign: moon.sign,
      house: null,
      reason: getMoonRealignment(moon.sign),
    });
  }
  if (nn && nnSign) {
    realignSources.push({
      planet: 'North Node',
      sign: nnSign,
      house: null,
      reason: `Your growth direction: ${getNNDirection(nnSign)}`,
    });
  }
  // SR Moon adds yearly emotional reset style
  if (analysis.moonSign) {
    realignSources.push({
      planet: 'Moon (this year)',
      sign: analysis.moonSign,
      house: analysis.moonHouse?.house || null,
      reason: `This year's emotional reset: ${getMoonRealignment(analysis.moonSign)}`,
    });
  }

  // ── Power Leaks ──
  const powerLeaks = detectPowerLeaks(analysis, natalChart);

  // ── Mantra ──
  const element = SIGN_ELEMENT[marsSign] || 'Fire';
  const mantras: Record<string, string> = {
    Fire: 'I move fast, but I choose where. My power is direction, not just speed.',
    Earth: 'I build slowly and it lasts. My power is patience that becomes unstoppable.',
    Air: 'I see all angles. My power is knowing which idea to commit to -- and committing.',
    Water: 'I feel everything. My power is using that depth as fuel, not drowning in it.',
  };

  return {
    driveEngine: {
      title: 'Where Your Drive Comes From',
      emoji: '🔥',
      summary: DRIVE_BY_SIGN[marsSign] || 'Your Mars drives your action style',
      sources: driveSources,
    },
    sustainStyle: {
      title: 'How You Sustain Effort',
      emoji: '⚡',
      summary: SUSTAIN_BY_MODALITY[dominantModality] || 'Your natural rhythm for sustained effort',
      sources: sustainSources,
    },
    burnoutPattern: {
      title: 'Your Burnout Pattern',
      emoji: '🔋',
      summary: getSaturnBurnout(saturnSRHouse || null, saturn?.sign || ''),
      sources: burnoutSources,
    },
    realignmentTool: {
      title: 'What Brings You Back to Center',
      emoji: '🧭',
      summary: getMoonRealignment(moonSign),
      sources: realignSources,
    },
    powerLeaks,
    oneLineMantra: mantras[element] || mantras.Fire,
  };
}
