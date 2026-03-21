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

const SIGN_ARCHETYPE: Record<string, { becoming: string; keyword: string; mode: string; headline_verb: string; plain: string; dailyLooksLike: string }> = {
  Aries:       { becoming: 'the initiator', keyword: 'courage', mode: 'asserting', headline_verb: 'leads', plain: 'starting things on your own even when nobody gives you permission', dailyLooksLike: 'Speaking up first. Volunteering. Making the decision instead of waiting. Feeling impatient with people who hesitate.' },
  Taurus:      { becoming: 'the builder', keyword: 'stability', mode: 'grounding', headline_verb: 'builds', plain: 'creating something solid and real that you can touch, keep, and rely on', dailyLooksLike: 'Investing in quality over speed. Cooking real meals. Saving money. Finishing what you started before starting something new.' },
  Gemini:      { becoming: 'the communicator', keyword: 'curiosity', mode: 'connecting', headline_verb: 'questions everything', plain: 'learning new things, talking to new people, and staying mentally flexible', dailyLooksLike: 'Reading more. Taking a class. Starting conversations with strangers. Writing things down. Saying yes to invitations.' },
  Cancer:      { becoming: 'the nurturer', keyword: 'belonging', mode: 'protecting', headline_verb: 'protects what matters', plain: 'creating emotional safety for yourself and the people who matter most', dailyLooksLike: 'Making your home feel like a sanctuary. Calling family. Cooking for people. Letting yourself cry when you need to. Setting boundaries around who gets access to your inner world.' },
  Leo:         { becoming: 'the creator', keyword: 'self-expression', mode: 'shining', headline_verb: 'shines', plain: 'letting people see the real you — your talents, your joy, your creative fire', dailyLooksLike: 'Making art, even if it\'s imperfect. Accepting compliments. Taking the stage. Posting the thing. Playing with children or your inner child.' },
  Virgo:       { becoming: 'the healer', keyword: 'refinement', mode: 'serving', headline_verb: 'heals through practice', plain: 'getting practical about what actually works in your daily life and health', dailyLooksLike: 'Fixing the broken thing. Meal prepping. Making the doctor\'s appointment. Organizing your space. Helping someone with a specific, useful skill.' },
  Libra:       { becoming: 'the harmonizer', keyword: 'balance', mode: 'relating', headline_verb: 'finds the balance', plain: 'learning how to be fair, graceful, and honest in your closest relationships', dailyLooksLike: 'Having the hard conversation with kindness. Compromising without losing yourself. Making your environment beautiful. Asking "what do YOU want?" and meaning it.' },
  Scorpio:     { becoming: 'the transformer', keyword: 'depth', mode: 'excavating', headline_verb: 'goes deeper', plain: 'going beneath the surface to deal with what you\'ve been avoiding', dailyLooksLike: 'Therapy. Honest conversations about money, sex, or power. Cutting off what\'s draining you. Sitting with uncomfortable emotions instead of numbing them.' },
  Sagittarius: { becoming: 'the explorer', keyword: 'expansion', mode: 'seeking', headline_verb: 'seeks the horizon', plain: 'broadening your worldview through travel, education, or new philosophies', dailyLooksLike: 'Planning a trip. Signing up for a course. Reading about something outside your comfort zone. Saying "I don\'t know" and being excited about it.' },
  Capricorn:   { becoming: 'the architect', keyword: 'mastery', mode: 'building', headline_verb: 'earns it', plain: 'getting serious about your long-term goals and doing the hard work to earn your place', dailyLooksLike: 'Making a 5-year plan. Showing up consistently even when nobody\'s watching. Taking on more responsibility. Saying no to shortcuts.' },
  Aquarius:    { becoming: 'the visionary', keyword: 'innovation', mode: 'liberating', headline_verb: 'breaks the mold', plain: 'finding your people and contributing something original to the group', dailyLooksLike: 'Joining a community. Questioning rules that don\'t make sense. Trying a completely different approach. Standing up for someone even when it\'s unpopular.' },
  Pisces:      { becoming: 'the mystic', keyword: 'intuition', mode: 'dissolving', headline_verb: 'trusts the unseen', plain: 'trusting your inner knowing and letting go of the need to control everything', dailyLooksLike: 'Meditating, even for 5 minutes. Paying attention to dreams. Creating art without a plan. Saying "I just have a feeling about this." Resting without guilt. Spending time near water.' },
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
  return SIGN_ARCHETYPE[sign] || { becoming: 'an evolving self', keyword: 'growth', mode: 'transforming', headline_verb: 'transforms', plain: 'growing into a new version of yourself', dailyLooksLike: 'Paying attention to what feels different. Trying new approaches. Being honest about what no longer fits.' };
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
      description: `Your main job this year: ${sunArch.plain}${srSunHouse ? `, especially in the area of ${HOUSE_ARENA[srSunHouse] || 'life'}` : ''}. In daily life this looks like: ${sunArch.dailyLooksLike}`,
    },
    {
      label: 'Outer Presentation',
      placement: `${srAscSign} Rising`,
      keyword: ascArch.keyword,
      description: `People will experience you this year as someone who is ${ascArch.plain}. In daily life this looks like: ${ascArch.dailyLooksLike}`,
    },
    {
      label: 'Soul Growth Edge',
      placement: `North Node in ${nodeSign}${nodeHouse ? `, ${ordinal(nodeHouse)} House` : ''}`,
      keyword: nodeArch.keyword,
      description: `The uncomfortable-but-necessary stretch: ${nodeArch.plain}${nodeHouse ? `, specifically through ${HOUSE_ARENA[nodeHouse] || 'this life area'}` : ''}. This won't feel natural — that's the point. In daily life this looks like: ${nodeArch.dailyLooksLike}`,
    },
  ];

  // Headline — proper sentence with full title case
  const titleCase = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  // ascArch.becoming = e.g. "the healer", headline_verb = e.g. "heals through practice"
  const headline = `${titleCase(ascArch.becoming)} Who ${titleCase(sunArch.headline_verb)}`;

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

  parts.push(`This year, your main job is ${sunArch.plain}${sunHouse ? ` — especially in the area of ${HOUSE_ARENA[sunHouse] || 'life'}` : ''}. That's what this year's purpose energy is asking you to practice. In daily life, this looks like: ${sunArch.dailyLooksLike}`);

  if (ascSign !== sunSign) {
    parts.push(`At the same time, people will experience you differently this year. Your Rising sign energy means you're learning to be someone who is ${ascArch.plain}. In practice: ${ascArch.dailyLooksLike}`);
  } else {
    parts.push(`With both your purpose and your outer presentation pointing in the same direction, there's no gap between who you're becoming and how people see you — what you feel inside matches what others experience. That's rare and powerful.`);
  }

  // Avoid repeating the same keyword/plain if node matches sun or asc
  if (nodeSign === sunSign && nodeSign === ascSign) {
    parts.push(`Your North Node is also in ${nodeSign}${nodeHouse ? ` (${ordinal(nodeHouse)} House — ${HOUSE_ARENA[nodeHouse] || 'life'})` : ''}, which means everything this year points in the same direction. There's no split energy — your purpose, your presentation, and your growth edge are all asking the same thing of you. So do more of it, more often, more deliberately. In practice that means: ${sunArch.dailyLooksLike}${nodeHouse ? ` Pay special attention to how this shows up in ${HOUSE_ARENA[nodeHouse] || 'this area'} — that's the specific life domain where this work lands hardest.` : ''}`);
  } else if (nodeSign === sunSign) {
    parts.push(`Your growth edge (North Node) is in the same sign as your Sun — ${nodeSign}${nodeHouse ? `, in the ${ordinal(nodeHouse)} House` : ''}. The stretch isn't about doing something completely different; it's about going deeper into what you're already learning, specifically through ${HOUSE_ARENA[nodeHouse || 0] || 'this area of life'}.`);
  } else {
    parts.push(`The stretch this year comes from your North Node in ${nodeSign}${nodeHouse ? ` (${ordinal(nodeHouse)} House)` : ''}: ${nodeArch.plain}. This won't feel natural — and that's exactly why it matters. In daily life: ${nodeArch.dailyLooksLike}`);
  }

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
