/**
 * Identity Shift Engine
 * Synthesizes SR Sun + SR Ascendant + North Node → "Who you are becoming this year"
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

export interface IdentityShift {
  headline: string;           // e.g. "From Protector to Pioneer"
  becomingNarrative: string;  // 3-5 sentence synthesis
  srSunSign: string;
  srSunHouse: number | null;
  srAscSign: string;
  northNodeSign: string;
  northNodeHouse: number | null;
  pillars: IdentityPillar[];
  tensionNote: string | null; // if SR Sun and Node are in tension
}

export interface IdentityPillar {
  label: string;       // "Purpose Direction", "Outer Presentation", "Soul Growth"
  placement: string;   // e.g. "Leo in the 10th"
  keyword: string;
  description: string;
}

const SIGN_ARCHETYPE: Record<string, { becoming: string; keyword: string; mode: string }> = {
  Aries:       { becoming: 'the initiator', keyword: 'courage', mode: 'asserting' },
  Taurus:      { becoming: 'the builder', keyword: 'stability', mode: 'grounding' },
  Gemini:      { becoming: 'the communicator', keyword: 'curiosity', mode: 'connecting' },
  Cancer:      { becoming: 'the nurturer', keyword: 'belonging', mode: 'protecting' },
  Leo:         { becoming: 'the creator', keyword: 'self-expression', mode: 'shining' },
  Virgo:       { becoming: 'the healer', keyword: 'refinement', mode: 'serving' },
  Libra:       { becoming: 'the harmonizer', keyword: 'balance', mode: 'relating' },
  Scorpio:     { becoming: 'the transformer', keyword: 'depth', mode: 'excavating' },
  Sagittarius: { becoming: 'the explorer', keyword: 'expansion', mode: 'seeking' },
  Capricorn:   { becoming: 'the architect', keyword: 'mastery', mode: 'building' },
  Aquarius:    { becoming: 'the visionary', keyword: 'innovation', mode: 'liberating' },
  Pisces:      { becoming: 'the mystic', keyword: 'transcendence', mode: 'dissolving' },
};

const HOUSE_ARENA: Record<number, string> = {
  1: 'personal identity and self-presentation',
  2: 'finances, resources, and self-worth',
  3: 'communication, learning, and neighborhood',
  4: 'home, family, and emotional roots',
  5: 'creativity, romance, and joy',
  6: 'health, routines, and daily service',
  7: 'partnerships and committed relationships',
  8: 'shared resources, intimacy, and transformation',
  9: 'travel, education, and worldview',
  10: 'career, public reputation, and legacy',
  11: 'community, friendships, and future vision',
  12: 'solitude, spirituality, and inner work',
};

function getSignArch(sign: string) {
  return SIGN_ARCHETYPE[sign] || { becoming: 'an evolving self', keyword: 'growth', mode: 'transforming' };
}

export function generateIdentityShift(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart
): IdentityShift {
  const srSun = srChart.planets?.Sun;
  const srSunSign = srSun?.sign || 'Unknown';
  const srSunHouse = analysis.sunHouse.house;

  // SR Ascendant sign from house cusp 1
  const srAsc = srChart.houseCusps?.house1;
  const srAscSign = srAsc?.sign || 'Unknown';

  // North Node — check SR first, fallback to natal
  const srNode = srChart.planets?.NorthNode;
  const natalNode = natalChart.planets?.NorthNode;
  const nodeSign = srNode?.sign || natalNode?.sign || 'Unknown';
  const nodeHouse = analysis.nodesFocus?.house || null;

  const sunArch = getSignArch(srSunSign);
  const ascArch = getSignArch(srAscSign);
  const nodeArch = getSignArch(nodeSign);

  // Build pillars
  const pillars: IdentityPillar[] = [
    {
      label: 'Purpose Direction',
      placement: `${srSunSign}${srSunHouse ? ` in the ${ordinal(srSunHouse)} House` : ''}`,
      keyword: sunArch.keyword,
      description: `Your vital energy this year is channeled through ${sunArch.mode}${srSunHouse ? ` in the arena of ${HOUSE_ARENA[srSunHouse] || 'life'}` : ''}. You are learning to embody ${sunArch.becoming}.`,
    },
    {
      label: 'Outer Presentation',
      placement: `${srAscSign} Rising`,
      keyword: ascArch.keyword,
      description: `The world meets you this year as ${ascArch.becoming}. Your instinctive approach to new situations is colored by ${ascArch.mode} — this is the mask that becomes the face.`,
    },
    {
      label: 'Soul Growth Edge',
      placement: `North Node in ${nodeSign}${nodeHouse ? `, ${ordinal(nodeHouse)} House` : ''}`,
      keyword: nodeArch.keyword,
      description: `Your evolutionary direction pulls you toward ${nodeArch.keyword} and ${nodeArch.mode}${nodeHouse ? ` through ${HOUSE_ARENA[nodeHouse] || 'this life area'}` : ''}. This is unfamiliar territory — and exactly where growth lives.`,
    },
  ];

  // Headline
  const headline = `Becoming ${ascArch.becoming.replace('the ', 'The ')} Who ${sunArch.mode.charAt(0).toUpperCase() + sunArch.mode.slice(1)}`;

  // Main narrative
  const becomingNarrative = buildNarrative(srSunSign, srSunHouse, srAscSign, nodeSign, nodeHouse, sunArch, ascArch, nodeArch);

  // Tension check — if Sun and Node are in square/opposition signs
  const tensionNote = detectTension(srSunSign, nodeSign);

  return {
    headline,
    becomingNarrative,
    srSunSign, srSunHouse,
    srAscSign,
    northNodeSign: nodeSign,
    northNodeHouse: nodeHouse,
    pillars,
    tensionNote,
  };
}

function buildNarrative(
  sunSign: string, sunHouse: number | null,
  ascSign: string,
  nodeSign: string, nodeHouse: number | null,
  sunArch: ReturnType<typeof getSignArch>,
  ascArch: ReturnType<typeof getSignArch>,
  nodeArch: ReturnType<typeof getSignArch>
): string {
  const parts: string[] = [];

  parts.push(`This year, your identity is being reshaped. The Solar Return Sun in ${sunSign}${sunHouse ? ` (${ordinal(sunHouse)} House)` : ''} directs your vital energy toward ${sunArch.keyword} — you are learning what it means to live as ${sunArch.becoming}.`);

  if (ascSign !== sunSign) {
    parts.push(`Meanwhile, ${ascSign} Rising gives you a new social skin: people encounter your ${ascArch.keyword} first. The way you walk into rooms, start conversations, and handle first impressions is shifting toward ${ascArch.mode}.`);
  } else {
    parts.push(`With both your Sun and Ascendant in ${sunSign}, there is no gap between who you are becoming and how the world sees you — an unusually integrated year where inner purpose and outer presentation align.`);
  }

  parts.push(`The North Node in ${nodeSign}${nodeHouse ? ` (${ordinal(nodeHouse)} House)` : ''} marks the growth edge: ${nodeArch.keyword}. This is where the universe is asking you to stretch beyond comfort. The integration of ${sunArch.keyword}, ${ascArch.keyword}, and ${nodeArch.keyword} defines who you are becoming this year.`);

  return parts.join(' ');
}

function detectTension(sunSign: string, nodeSign: string): string | null {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const si = SIGNS.indexOf(sunSign);
  const ni = SIGNS.indexOf(nodeSign);
  if (si < 0 || ni < 0) return null;

  const diff = Math.abs(si - ni);
  const normalized = diff > 6 ? 12 - diff : diff;

  if (normalized === 3) {
    return `There is creative tension between your ${sunSign} Sun purpose and your ${nodeSign} North Node growth direction. You may feel pulled between what energizes you and what your soul is asking you to learn. This friction is productive — it forces integration rather than choosing one over the other.`;
  }
  if (normalized === 6) {
    return `Your ${sunSign} Sun sits opposite your ${nodeSign} North Node — a powerful polarity axis. You are being asked to balance self-expression with soul growth, finding ways to honor both without sacrificing either.`;
  }
  return null;
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
