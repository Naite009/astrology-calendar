// Eclipse-to-Natal-Node cross-reference synthesis
// Connects eclipse sign themes to the user's natal nodal axis

import { SPILLER_NODE_DATA, SPILLER_HOUSE_OVERLAYS } from '@/lib/nodeSpillerData';
import type { ZodiacSign } from '@/lib/astrology/signTeacher';
import { getSignInfo } from '@/lib/astrology/signTeacher';

export interface EclipseNodeSynthesis {
  nnSign: string;
  snSign: string;
  nnSpiller: typeof SPILLER_NODE_DATA[string];
  snSpiller: typeof SPILLER_NODE_DATA[string];
  elementConnection: 'same-as-sn' | 'same-as-nn' | 'neither';
  modalityConnection: 'same-as-sn' | 'same-as-nn' | 'neither';
  connectionNarrative: string;
  patternSentences: string[];
  releaseGuidance: string[];
  growthGuidance: string[];
  journalPrompts: string[];
  nnHouseOverlay: typeof SPILLER_HOUSE_OVERLAYS[number] | null;
  snHouseOverlay: typeof SPILLER_HOUSE_OVERLAYS[number] | null;
}

const SIGN_SHADOW_THEMES: Record<string, string[]> = {
  Aries: ['impulsiveness', 'selfishness', 'impatience', 'aggression'],
  Taurus: ['stubbornness', 'comfort addiction', 'possessiveness', 'resistance to change'],
  Gemini: ['scattered energy', 'superficiality', 'nervous chatter', 'commitment avoidance'],
  Cancer: ['clinginess', 'emotional manipulation', 'hiding behind family', 'moodiness'],
  Leo: ['ego inflation', 'needing validation', 'drama', 'performance over authenticity'],
  Virgo: ['perfectionism', 'self-criticism', 'over-analyzing', 'controlling through detail'],
  Libra: ['people-pleasing', 'indecision', 'codependency', 'conflict avoidance'],
  Scorpio: ['power games', 'emotional intensity as control', 'obsession', 'suspicion'],
  Sagittarius: ['preachiness', 'restlessness', 'over-promising', 'truth as weapon'],
  Capricorn: ['workaholism', 'emotional coldness', 'status-seeking', 'rigidity'],
  Aquarius: ['emotional detachment', 'contrarianism', 'hiding in group identity', 'intellectualizing feelings'],
  Pisces: ['escapism', 'martyrdom', 'confusion', 'avoiding practical reality'],
};

function getOppositeSign(sign: ZodiacSign): ZodiacSign {
  return getSignInfo(sign).opposite;
}

export function synthesizeEclipseWithNodes(
  eclipseSign: ZodiacSign,
  eclipseType: 'solar' | 'lunar',
  eclipseNodal: 'north' | 'south',
  eclipseHouse: number | null,
  nnSign: ZodiacSign,
  snSign: ZodiacSign,
  nnHouse: number | null,
  snHouse: number | null,
): EclipseNodeSynthesis {
  const eclipseInfo = getSignInfo(eclipseSign);
  const nnInfo = getSignInfo(nnSign);
  const snInfo = getSignInfo(snSign);

  const nnSpiller = SPILLER_NODE_DATA[nnSign];
  const snSpiller = SPILLER_NODE_DATA[getOppositeSign(nnSign)];

  // Element connections
  const elementConnection =
    eclipseInfo.element === snInfo.element ? 'same-as-sn' :
    eclipseInfo.element === nnInfo.element ? 'same-as-nn' : 'neither';

  const modalityConnection =
    eclipseInfo.modality === snInfo.modality ? 'same-as-sn' :
    eclipseInfo.modality === nnInfo.modality ? 'same-as-nn' : 'neither';

  // Build connection narrative
  let connectionNarrative = '';
  if (elementConnection === 'same-as-sn') {
    connectionNarrative = `This ${eclipseSign} eclipse shares the ${eclipseInfo.element} element with your ${snSign} South Node. The ${eclipseInfo.element} themes this eclipse stirs — ${SIGN_SHADOW_THEMES[eclipseSign]?.slice(0, 2).join(', ')} — can pull you back into South Node comfort patterns. The eclipse is showing you WHERE you default to ${snSign} habits even when they no longer serve you. Your ${nnSign} North Node says: the real work is in a different direction entirely.`;
  } else if (elementConnection === 'same-as-nn') {
    connectionNarrative = `This ${eclipseSign} eclipse shares the ${eclipseInfo.element} element with your ${nnSign} North Node. The eclipse themes actively support your growth direction — the ${eclipseInfo.element} energy is flowing toward your destiny, not away from it. Use this eclipse to lean into ${nnSign} qualities: ${nnSpiller?.tendenciesToDevelop?.slice(0, 2).join(', ') || 'growth and expansion'}.`;
  } else {
    connectionNarrative = `This ${eclipseSign} eclipse is in ${eclipseInfo.element}, which doesn't directly share an element with either node. It acts as a catalyst — a side angle that illuminates your nodal axis indirectly. Pay attention to how ${eclipseSign} themes (${SIGN_SHADOW_THEMES[eclipseSign]?.slice(0, 2).join(', ')}) interact with your ${snSign} comfort zone and your ${nnSign} growth edge.`;
  }

  // Pattern sentences — the "I keep doing X but nothing changes" recognition
  // IMPORTANT: tendenciesToLeaveBehind in nnSpiller are the SOUTH NODE habits to release
  // (the data is keyed by NN sign and describes what the SN defaults look like)
  const eclipseShadows = SIGN_SHADOW_THEMES[eclipseSign] || [];
  const snTendencies = nnSpiller?.tendenciesToLeaveBehind?.slice(0, 3) || [];
  const nnGrowth = nnSpiller?.tendenciesToDevelop?.slice(0, 3) || [];

  const patternSentences: string[] = [];

  if (elementConnection === 'same-as-sn') {
    patternSentences.push(
      `Look for this pattern: "I keep ${eclipseShadows[0] || 'optimizing'} but nothing actually changes." That's the ${snSign} South Node talking through ${eclipseSign} methods.`
    );
    patternSentences.push(
      `The eclipse is revealing: the METHOD (${eclipseSign}-style ${eclipseShadows.slice(0, 2).join('/')}) isn't broken — the GOAL might be. Your ${nnSign} North Node says: go ${nnInfo.element === 'Water' ? 'deeper emotionally' : nnInfo.element === 'Fire' ? 'bolder' : nnInfo.element === 'Air' ? 'wider in perspective' : 'more practical'}, not harder at what you've been doing.`
    );
  } else {
    const snHabitExplained = snTendencies[0] || `${snSign} comfort zone`;
    const nnGrowthExplained = nnGrowth[0] || `${nnSign} growth`;

    patternSentences.push(
      `Your South Node is in ${snSign} — that's your comfort zone, the autopilot behavior you fall back on when life gets stressful. ` +
      `One of those autopilot patterns is: "${snHabitExplained}." ` +
      `Think of it like a path you've walked a thousand times — it's easy, but it doesn't lead anywhere new.`
    );
    patternSentences.push(
      `This eclipse is nudging you OFF that familiar path. Instead of defaulting to ${snSign} habits, ` +
      `the eclipse is asking you to practice ${nnSign} energy — specifically: "${nnGrowthExplained}." ` +
      `That's your North Node direction. It feels unfamiliar and uncomfortable precisely because it IS your growth edge.`
    );
    patternSentences.push(
      `The nodes are generational — millions of people share your ${nnSign}/${snSign} nodal axis. ` +
      `But the HOUSE they fall in makes them deeply personal to you` +
      `${nnHouse ? `. Your North Node is in your ${nnHouse}th house, so this growth plays out in ${SPILLER_HOUSE_OVERLAYS[nnHouse]?.focus || 'that specific life area'}` : ''}. ` +
      `The sign tells you the HOW (${nnSign}-style); the house tells you the WHERE (which part of YOUR life).`
    );
  }

  if (snTendencies.length > 1) {
    patternSentences.push(
      `Other ${snSign} South Node patterns to watch during this eclipse: "${snTendencies.slice(1).join('"; "')}" — if any of these show up, that's your signal to pause and consciously choose the North Node path.`
    );
  }

  // Release guidance (SN + eclipse sign)
  const releaseGuidance: string[] = [];
  if (eclipseNodal === 'south') {
    releaseGuidance.push(`This is a South Node eclipse — release energy is amplified. What ${eclipseSign} habit has run its course?`);
  }
  releaseGuidance.push(
    ...(nnSpiller?.tendenciesToLeaveBehind?.slice(0, 3) || []).map(
      t => `Release: ${t}`
    )
  );
  if (eclipseShadows.length > 0) {
    releaseGuidance.push(
      `Eclipse-specific release: ${eclipseSign} ${eclipseShadows[0]} that's keeping you in ${snSign} patterns`
    );
  }

  // Growth guidance (NN)
  const growthGuidance: string[] = [];
  if (eclipseNodal === 'north') {
    growthGuidance.push(`This is a North Node eclipse — growth doors are opening. Step toward what feels unfamiliar but right.`);
  }
  growthGuidance.push(
    ...(nnSpiller?.tendenciesToDevelop?.slice(0, 3) || []).map(
      t => `Develop: ${t}`
    )
  );

  // Journal prompts synthesizing all pieces
  const journalPrompts: string[] = [
    `Where in my life am I using ${eclipseSign} methods (${eclipseShadows.slice(0, 2).join(', ')}) to avoid ${nnSign} growth?`,
    `What would my ${nnSign} North Node say about how I'm handling the area of life this eclipse is activating${eclipseHouse ? ` (my ${eclipseHouse}th house)` : ''}?`,
    `Am I running the \"${snTendencies[0] || snSign + ' default'}\" pattern right now? What's one concrete step toward ${nnSign} instead?`,
  ];

  if (eclipseHouse && nnHouse) {
    journalPrompts.push(
      `How do my ${eclipseHouse}th house themes connect to my ${nnHouse}th house North Node destiny?`
    );
  }

  const nnHouseOverlay = nnHouse ? SPILLER_HOUSE_OVERLAYS[nnHouse] ?? null : null;
  const snHouseOverlay = snHouse ? SPILLER_HOUSE_OVERLAYS[snHouse] ?? null : null;

  return {
    nnSign,
    snSign,
    nnSpiller,
    snSpiller,
    elementConnection,
    modalityConnection,
    connectionNarrative,
    patternSentences,
    releaseGuidance,
    growthGuidance,
    journalPrompts,
    nnHouseOverlay,
    snHouseOverlay,
  };
}
