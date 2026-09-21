/**
 * Section Archetypes — short "what does this mean" labels for the Natal Portrait.
 *
 * Every label is one or two words (e.g. "Magnetic Leader") and is always paired
 * with the exact placement it came from, so nothing reads as a verdict or a
 * personality type. Labels are shorthand for the section below them, never a
 * replacement for the evidence.
 */

import type { NatalChart } from '@/hooks/useNatalChart';
import type { NatalPortrait } from '@/lib/natalPortraitEngine';
import { getReliableAscendant } from '@/lib/chartDataValidation';
import {
  bigThreeCard,
  blendCard,
  emphasisCard,
  FACTOR_JOB,
  type Element,
  type ShorthandCard,
} from '@/lib/interpretation/shorthandDescriptor';

export interface SectionArchetype {
  /** One or two words. */
  label: string;
  /** Plain sentence naming the placements the label came from. */
  why: string;
  /**
   * Shared shorthand-descriptor standard (src/lib/interpretation/shorthandDescriptor.ts):
   * the eight-part card behind the label — factors, what each contributes, the
   * blend, what to say out loud, how it may show up, growth edge, reasoning.
   */
  card?: ShorthandCard | null;
  /** Extra "so what?" cards, e.g. element plus modality emphasis. */
  extraCards?: ShorthandCard[];
}

const SIGN_ADJ: Record<string, string> = {
  Aries: 'Bold',
  Taurus: 'Steady',
  Gemini: 'Quick',
  Cancer: 'Protective',
  Leo: 'Radiant',
  Virgo: 'Precise',
  Libra: 'Balanced',
  Scorpio: 'Magnetic',
  Sagittarius: 'Far-Seeing',
  Capricorn: 'Strategic',
  Aquarius: 'Independent',
  Pisces: 'Intuitive',
};

const SIGN_NOUN: Record<string, string> = {
  Aries: 'Starter',
  Taurus: 'Builder',
  Gemini: 'Messenger',
  Cancer: 'Protector',
  Leo: 'Leader',
  Virgo: 'Craftsperson',
  Libra: 'Diplomat',
  Scorpio: 'Investigator',
  Sagittarius: 'Explorer',
  Capricorn: 'Strategist',
  Aquarius: 'Visionary',
  Pisces: 'Empath',
};

const ELEMENT_ADJ: Record<string, string> = {
  Fire: 'Driven',
  Earth: 'Grounded',
  Air: 'Analytical',
  Water: 'Feeling',
};

const MODALITY_NOUN: Record<string, string> = {
  Cardinal: 'Initiator',
  Fixed: 'Sustainer',
  Mutable: 'Adapter',
};

const HOUSE_NOUN: Record<number, string> = {
  1: 'Self-Definer',
  2: 'Resource-Holder',
  3: 'Communicator',
  4: 'Home-Maker',
  5: 'Creator',
  6: 'Craftsperson',
  7: 'Partner',
  8: 'Depth-Diver',
  9: 'Seeker',
  10: 'Builder',
  11: 'Connector',
  12: 'Inward Thinker',
};

const PLANET_LABEL: Record<string, string> = {
  Sun: 'Identity-Led',
  Moon: 'Feeling-Led',
  Mercury: 'Mind-Led',
  Venus: 'Connection-Led',
  Mars: 'Action-Led',
  Jupiter: 'Growth-Led',
  Saturn: 'Structure-Led',
  Uranus: 'Change-Led',
  Neptune: 'Imagination-Led',
  Pluto: 'Depth-Led',
  Chiron: 'Sensitivity-Led',
  NorthNode: 'Growth-Led',
};

const PATTERN_LABEL: Record<string, string> = {
  'Grand Trine': 'Easy Flow',
  'T-Square': 'Pressure Point',
  'Grand Cross': 'Four-Way Pull',
  'Yod': 'Odd Angle',
  'Stellium': 'Concentrated Focus',
  'Kite': 'Focused Flow',
  'Mystic Rectangle': 'Balanced Tension',
  'Cradle': 'Supported Dip',
};

const adj = (sign?: string) => (sign && SIGN_ADJ[sign]) || '';
const noun = (sign?: string) => (sign && SIGN_NOUN[sign]) || '';

const topKey = (counts: Record<string, number> | undefined): string => {
  if (!counts) return '';
  let best = '';
  let bestN = -1;
  for (const [k, n] of Object.entries(counts)) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return bestN > 0 ? best : '';
};

const pair = (a: string, b: string, fallback: string): string => {
  const out = [a, b].filter(Boolean).join(' ').trim();
  return out || fallback;
};

const domainLabel = (
  portrait: NatalPortrait,
  domain: keyof NatalPortrait,
  sectionNoun: string,
): SectionArchetype | null => {
  const d = portrait[domain] as { keyPlanets?: { name: string; sign: string; house: number }[] } | undefined;
  const key = d?.keyPlanets?.[0];
  if (!key?.sign) return null;
  const second = d?.keyPlanets?.[1];
  const card = blendCard({
    factors: [
      {
        label: `${key.name} in ${key.sign}${key.house ? `, house ${key.house}` : ''}`,
        contributes: FACTOR_JOB[key.name] ?? 'what this area of the chart is working with',
        sign: key.sign,
        body: key.name,
        house: key.house ?? null,
      },
      ...(second?.sign
        ? [
            {
              label: `${second.name} in ${second.sign}${second.house ? `, house ${second.house}` : ''}`,
              contributes: FACTOR_JOB[second.name] ?? 'a second factor shaping the same area',
              sign: second.sign,
              body: second.name,
              house: second.house ?? null,
            },
          ]
        : []),
    ],
    fallbackNoun: sectionNoun,
  });
  return {
    label: card?.label ?? pair(adj(key.sign), sectionNoun, sectionNoun),
    why: `From ${key.name} in ${key.sign}${key.house ? ` (house ${key.house})` : ''}.`,
    card,
  };
};

/**
 * Build the short label for each Natal Portrait section from that section's own
 * strongest placement. Returns only the sections where real chart data exists.
 */
export function buildSectionArchetypes(
  portrait: NatalPortrait,
  chart: NatalChart,
): Record<string, SectionArchetype> {
  const out: Record<string, SectionArchetype> = {};
  const lp = portrait.lifePurpose;
  const asc = getReliableAscendant(chart);

  // 1. Life Purpose — the Big Three combined.
  if (lp?.sunSign && lp.sunSign !== 'unknown' && lp.moonSign && lp.moonSign !== 'unknown') {
    const risingPart = lp.risingSign && lp.risingSign !== 'unknown' ? `, ${lp.risingSign} rising` : '';
    const big = bigThreeCard({
      sunSign: lp.sunSign,
      moonSign: lp.moonSign,
      risingSign: lp.risingSign && lp.risingSign !== 'unknown' ? lp.risingSign : (asc?.sign ?? null),
    });
    out.lifePurpose = {
      label: big?.label ?? pair(adj(lp.sunSign), noun(lp.moonSign), `${noun(lp.sunSign)} Core`),
      why: `Sun in ${lp.sunSign} + Moon in ${lp.moonSign}${risingPart}.`,
      card: big,
    };
  }

  // 2. Top themes — element and modality weight of the ten major planets.
  const el = topKey(lp?.elementBreakdown);
  const mod = topKey(lp?.modalityBreakdown);
  if (el || mod) {
    const total = Object.values(lp?.elementBreakdown ?? {}).reduce((a, b) => a + b, 0) || 10;
    const elCard = el
      ? emphasisCard({
          kind: 'element',
          value: el,
          count: lp?.elementBreakdown?.[el] ?? 0,
          total,
          secondary:
            Object.keys(lp?.elementBreakdown ?? {})
              .filter((e) => e !== el)
              .sort((a, b) => (lp?.elementBreakdown?.[b] ?? 0) - (lp?.elementBreakdown?.[a] ?? 0))[0] ?? null,
        })
      : null;
    const modCard = mod
      ? emphasisCard({
          kind: 'modality',
          value: mod,
          count: lp?.modalityBreakdown?.[mod] ?? 0,
          total: Object.values(lp?.modalityBreakdown ?? {}).reduce((a, b) => a + b, 0) || total,
        })
      : null;
    out.topThemes = {
      label:
        elCard?.label ?? pair(ELEMENT_ADJ[el] || '', MODALITY_NOUN[mod] || '', `${MODALITY_NOUN[mod] || 'Even'} Weight`),
      why: `Most-weighted element ${el || 'even'}, most-weighted modality ${mod || 'even'} (ten major planets).`,
      card: elCard,
      extraCards: [modCard].filter((c): c is ShorthandCard => !!c),
    };
  }

  // 3. Soul Agreements — nodal direction.
  const nnSign = portrait.lifetimeWisdom?.northNodeSign;
  if (nnSign && nnSign !== 'unknown') {
    out.soulAgreements = {
      label: pair(adj(nnSign), 'Path', 'Growth Path'),
      why: `From the North Node in ${nnSign}${portrait.lifetimeWisdom.northNodeHouse ? ` (house ${portrait.lifetimeWisdom.northNodeHouse})` : ''}.`,
    };
  }

  // 4-9. Domain deep dives.
  const domains: [keyof NatalPortrait, string, string][] = [
    ['relationshipBlueprint', 'Partner', 'relationship'],
    ['careerMoneyMap', 'Builder', 'career'],
    ['emotionalArchitecture', 'Anchor', 'emotional'],
    ['healthVitality', 'Pacer', 'health'],
    ['shadowGrowth', 'Changer', 'shadow'],
    ['spiritualKarmic', 'Seeker', 'spiritual'],
  ];
  for (const [domain, sectionNoun, key] of domains) {
    const label = domainLabel(portrait, domain, sectionNoun);
    if (label) out[key] = label;
  }

  // 10. House emphasis — busiest house.
  const busiest = [...(portrait.houseEmphasis || [])]
    .filter(h => (h.majorPlanets?.length ?? h.planets?.length ?? 0) > 0)
    .sort((a, b) => (b.majorPlanets?.length ?? b.planets.length) - (a.majorPlanets?.length ?? a.planets.length))[0];
  if (busiest) {
    out.houseEmphasis = {
      label: pair('', HOUSE_NOUN[busiest.house] || 'House Focus', 'House Focus'),
      why: `House ${busiest.house} carries the most bodies (${busiest.countLabel || busiest.planets.join(', ')}).`,
    };
  }

  // 11. Power portrait — Mars, the drive planet.
  const mars = chart.planets?.Mars;
  if (mars?.sign) {
    out.powerPortrait = {
      label: pair(adj(mars.sign), 'Engine', 'Drive Engine'),
      why: `From Mars in ${mars.sign}.`,
    };
  }

  // 12. Dominant planets — highest-scoring body.
  const captain = portrait.dominantPlanets?.captain;
  if (captain && PLANET_LABEL[captain]) {
    out.dominantPlanets = {
      label: PLANET_LABEL[captain],
      why: `${captain === 'NorthNode' ? 'North Node' : captain} scores highest for dominance in this chart.`,
    };
  }

  // 13. Patterns — strongest major pattern, if one is present.
  const topPattern = portrait.patterns?.[0];
  if (topPattern) {
    out.patterns = {
      label: PATTERN_LABEL[topPattern.name] || 'Shaped Wiring',
      why: `From the ${topPattern.name}${topPattern.planets?.length ? ` (${topPattern.planets.join(', ')})` : ''}.`,
    };
  } else {
    out.patterns = {
      label: 'Open Weave',
      why: 'No major planetary pattern is formed within the standard orbs, so single placements carry the weight here.',
    };
  }

  // 14. Lifetime wisdom — Saturn.
  const saturnSign = portrait.lifetimeWisdom?.saturnSign;
  if (saturnSign && saturnSign !== 'unknown') {
    out.lifetimeWisdom = {
      label: pair(adj(saturnSign), 'Maturity', 'Maturity Curve'),
      why: `From Saturn in ${saturnSign}${portrait.lifetimeWisdom.saturnHouse ? ` (house ${portrait.lifetimeWisdom.saturnHouse})` : ''}.`,
    };
  }

  // Ascendant stays available for the header line.
  if (asc?.sign && !out.lifePurpose) {
    out.lifePurpose = {
      label: pair(adj(asc.sign), noun(asc.sign), 'Core Blend'),
      why: `From the ${asc.sign} Ascendant (Sun or Moon data is incomplete).`,
    };
  }

  return out;
}
