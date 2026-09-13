/**
 * CANONICAL plain-language summary of the app's symbolic ("karmic") contacts.
 *
 * The old presentation showed an opaque headline label ("Catalyst Connection")
 * plus bare numbers ("86 / 1 / 1 / 6") with no explanation of the scale, the
 * source contacts, or whose planet was whose. That is replaced here by:
 *
 *  - fully labelled COUNTS of actually detected contacts (never a bare score),
 *  - per-category evidence: exact aspect, exact orb, and whose planet is whose,
 *  - an optional, clearly symbolic theme derived from the listed contacts only,
 *  - a Big Picture written from the strongest detected evidence,
 *  - a glossary of the app's own category words.
 *
 * Nothing here may express duration, destiny, probability or a verdict about
 * either person. Every surface (Synastry tabs, 5 Essential Questions, PDF
 * export) renders this one object so the wording can never drift apart.
 */

import { KarmicAnalysis, KarmicIndicator } from '@/lib/karmicAnalysis';
import { RelationshipContext } from './relationshipContext';
import { SYMBOLIC_LENS_NOTE, symbolicTheme } from './symbolicFraming';

export type KarmicCategoryKey =
  | 'growth'
  | 'past_pattern'
  | 'intensity'
  | 'healing'
  | 'structure'
  | 'timing';

export interface KarmicEvidenceLine {
  /** e.g. "Ava Kravitz's North Node trine Max Levin's Venus" */
  contact: string;
  /** e.g. "orb 2°14'" or "house placement (no orb)" */
  orbText: string;
  /** Plain-language note about what this single contact may show up as. */
  note: string;
}

export interface KarmicCategory {
  key: KarmicCategoryKey;
  /** Fully labelled count, e.g. "1 growth-related contact". */
  label: string;
  count: number;
  /** What this category means in this app, in plain English. */
  plainMeaning: string;
  /** Expandable "Why this appears" evidence. */
  evidence: KarmicEvidenceLine[];
}

export interface KarmicGlossaryEntry {
  term: string;
  meaning: string;
}

export interface KarmicSummary {
  /** True when at least one real contact was detected. */
  hasEvidence: boolean;
  categories: KarmicCategory[];
  /** Written from the strongest detected contacts, never from canned category copy. */
  bigPicture: string;
  /** Optional symbolic theme. Null whenever symbolic framing is not permitted. */
  symbolic: {
    heading: string;
    label: string;
    explanation: string;
    derivedFrom: string[];
    note: string;
  } | null;
  glossary: KarmicGlossaryEntry[];
  /** Shown next to the counts so no one reads them as scores or odds. */
  countsNote: string;
  doesNotMean: string[];
}

const THEME_TO_CATEGORY: Record<KarmicIndicator['theme'], KarmicCategoryKey> = {
  soul_growth: 'growth',
  past_life: 'past_pattern',
  transformation: 'intensity',
  healing: 'healing',
  karmic_debt: 'structure',
  fated: 'timing',
};

const CATEGORY_ORDER: KarmicCategoryKey[] = [
  'growth',
  'past_pattern',
  'intensity',
  'healing',
  'structure',
  'timing',
];

const CATEGORY_NOUN: Record<KarmicCategoryKey, { singular: string; plural: string }> = {
  growth: { singular: 'growth-related contact', plural: 'growth-related contacts' },
  past_pattern: {
    singular: 'symbolic past-pattern contact',
    plural: 'symbolic past-pattern contacts',
  },
  intensity: {
    singular: 'intensity/transformation contact',
    plural: 'intensity/transformation contacts',
  },
  healing: {
    singular: 'healing/sensitivity contact',
    plural: 'healing/sensitivity contacts',
  },
  structure: {
    singular: 'structure/steadiness contact',
    plural: 'structure/steadiness contacts',
  },
  timing: { singular: 'symbolic timing contact', plural: 'symbolic timing contacts' },
};

const CATEGORY_MEANING_ADULT: Record<KarmicCategoryKey, string> = {
  growth:
    'Contacts involving the lunar nodes that this app reads as stretch: areas where being around each other may pull each person slightly outside their usual habits.',
  past_pattern:
    'Contacts this app reads as familiarity. Something in the pairing may feel already known. That is imagery about a repeating pattern, not information about anyone\u2019s history.',
  intensity:
    'Pluto and 8th-house contacts, read as depth of investment. At best this shows up as caring a lot; under strain the stakes can feel bigger than the moment warrants.',
  healing:
    'Chiron contacts, read as sensitivity. Certain topics may land harder here than they would with other people, in both directions.',
  structure:
    'Saturn contacts, read as weight and steadiness. These can show up as reliability, and also as caution, rules or holding back.',
  timing:
    'Vertex contacts, read symbolically as "the timing stood out". It says nothing about how long anything lasts.',
};

const CATEGORY_MEANING_TEEN: Record<KarmicCategoryKey, string> = {
  growth:
    'Node contacts this app reads as stretch: being around each other may nudge each of them to try things they would not try alone.',
  past_pattern:
    'Contacts this app reads as familiarity. The connection may feel easy or already known quite quickly. It is imagery about a pattern, not a story about the past.',
  intensity:
    'Pluto contacts, read as how strongly things land. Feelings here may run hot: very close one week, very stung the next. Noticing that is useful right now.',
  healing:
    'Chiron contacts, read as sensitivity. Some subjects may be tender for one or both of them, so teasing can land harder than intended.',
  structure:
    'Saturn contacts, read as seriousness. This pairing may feel steady, and it may also feel cautious or a bit rule-bound.',
  timing:
    'Vertex contacts, read symbolically as "the timing felt notable". It says nothing about how long they stay together.',
};

const CONTACT_NOTE_ADULT: Partial<Record<KarmicIndicator['type'], string>> = {
  north_node: 'Read as a stretch point rather than a requirement.',
  south_node: 'Read as familiarity, not as evidence about the past.',
  saturn: 'Can read as steadying, and can read as cautious.',
  pluto: 'Read as depth of investment, not as control or fate.',
  chiron: 'Read as a tender spot to handle gently on both sides.',
  twelfth_house: 'A house placement, so there is no orb to quote.',
  eighth_house: 'A house placement, so there is no orb to quote.',
  vertex: 'A symbolic timing marker only.',
};

const CONTACT_NOTE_TEEN: Partial<Record<KarmicIndicator['type'], string>> = {
  north_node: 'May show up as trying something new because the other one is there.',
  south_node: 'May show up as feeling comfortable together very quickly.',
  saturn: 'May show up as being the sensible one, or as holding back.',
  pluto: 'May show up as things mattering a lot, in both directions.',
  chiron: 'May show up as a topic where jokes sting more than expected.',
  twelfth_house: 'A house placement, so there is no orb to quote.',
  eighth_house: 'A house placement, so there is no orb to quote.',
  vertex: 'A symbolic timing marker only.',
};

const HOUSE_LABEL: Record<string, string> = {
  '12th House': '12th house',
  '8th House': '8th house',
};

export function formatKarmicOrb(orb: number | undefined): string {
  if (orb === undefined || Number.isNaN(orb)) return 'house placement (no orb)';
  const deg = Math.floor(orb);
  const min = Math.round((orb - deg) * 60);
  const carry = min === 60;
  return `orb ${carry ? deg + 1 : deg}\u00b0${String(carry ? 0 : min).padStart(2, '0')}'`;
}

export function formatKarmicBody(body: string): string {
  if (body === 'SouthNode') return 'South Node';
  if (body === 'NorthNode') return 'North Node';
  return body;
}

function personLabel(name: string | undefined, fallback: string): string {
  const clean = (name || '').trim();
  return clean.length > 0 ? clean : fallback;
}

/** "Ava's Venus square Max's Pluto" / "Max's Moon in Ava's 8th house". */
export function karmicContactLine(
  ind: KarmicIndicator,
  fallbackA = 'Person A',
  fallbackB = 'Person B',
): string {
  const ownerA = personLabel(ind.owner1, fallbackA);
  const ownerB = personLabel(ind.owner2, fallbackB);
  const house = HOUSE_LABEL[ind.planet2];
  if (house) {
    return `${ownerA}'s ${formatKarmicBody(ind.planet1)} falls in ${ownerB}'s ${house}`;
  }
  return `${ownerA}'s ${formatKarmicBody(ind.planet1)} ${ind.aspect || 'contact'} ${ownerB}'s ${formatKarmicBody(
    ind.planet2,
  )}`;
}

function sortStrength(a: KarmicIndicator, b: KarmicIndicator): number {
  if (b.weight !== a.weight) return b.weight - a.weight;
  const orbA = a.orb ?? 99;
  const orbB = b.orb ?? 99;
  return orbA - orbB;
}

function buildBigPicture(
  indicators: KarmicIndicator[],
  categories: KarmicCategory[],
  teen: boolean,
  names: [string, string],
): string {
  if (indicators.length === 0) {
    return teen
      ? 'None of the symbolic contacts this app looks for show up between these two charts. That is not a problem, it just means this section has nothing concrete to point at.'
      : 'None of the symbolic contacts this app tracks appear between these two charts, so there is nothing here worth building an interpretation on.';
  }

  const strongest = [...indicators].sort(sortStrength).slice(0, 3);
  const lines = strongest.map(
    (ind) => `${karmicContactLine(ind, names[0], names[1])} (${formatKarmicOrb(ind.orb)})`,
  );
  const leading = [...categories].sort((a, b) => b.count - a.count)[0];
  const leadWord: Record<KarmicCategoryKey, string> = {
    growth: 'stretch and trying new things',
    past_pattern: 'a sense of familiarity',
    intensity: 'how strongly things land',
    healing: 'sensitive spots',
    structure: 'steadiness and caution',
    timing: 'notable timing',
  };

  const evidenceSentence = `The strongest evidence here is: ${lines.join('; ')}.`;
  const themeSentence = leading
    ? `Taken together these lean toward ${leadWord[leading.key]}, which is why that shows the highest count.`
    : '';
  const closing = teen
    ? 'What may matter now is how these show up day to day: how it feels to be around each other, what gets talked about, and how quickly things are patched up after a bad moment.'
    : 'These are the contacts to weigh. Everything else in this section is commentary on them.';

  return [evidenceSentence, themeSentence, closing].filter(Boolean).join(' ');
}

const GLOSSARY: KarmicGlossaryEntry[] = [
  {
    term: 'Growth-related',
    meaning:
      'A contact to one of the lunar nodes. This app reads it as a stretch point: something one person may try more of because the other is around.',
  },
  {
    term: 'Past-pattern',
    meaning:
      'A South Node or 12th-house contact. Read as familiarity, a sense of "already known". It is imagery about a repeating pattern, not a claim about anyone\u2019s history or a past life.',
  },
  {
    term: 'Transformation / intensity',
    meaning:
      'A Pluto or 8th-house contact. Read as how much is invested and how strongly things land, in both directions.',
  },
  {
    term: 'Healing / sensitivity',
    meaning:
      'A Chiron contact. Read as a tender subject, where words may land harder than intended. It is not a diagnosis or a claim about anyone\u2019s wounds.',
  },
  {
    term: 'Nodal',
    meaning:
      'Anything involving the Moon\u2019s nodes (North Node and South Node), the two points this app uses for the growth and familiarity categories.',
  },
];

const DOES_NOT_MEAN_ADULT = [
  'It does not predict how long the relationship lasts, or whether it should.',
  'It is not a probability, a score out of anything, or evidence about past lives.',
  'It says nothing about either person\u2019s character, health or history.',
];

const DOES_NOT_MEAN_TEEN = [
  'It does not say how long they stay together, or whether they should.',
  'It is not a score, a percentage, or a prediction.',
  'It says nothing about either of them being good or bad for the other.',
];

export function buildKarmicSummary(
  analysis: KarmicAnalysis | null | undefined,
  ctx?: RelationshipContext | null,
  personAName?: string,
  personBName?: string,
): KarmicSummary {
  const teen = Boolean(ctx?.involvesMinor);
  const names: [string, string] = [
    personLabel(personAName ?? ctx?.people?.[0]?.name, 'Person A'),
    personLabel(personBName ?? ctx?.people?.[1]?.name, 'Person B'),
  ];
  const indicators = analysis?.indicators ?? [];
  const meanings = teen ? CATEGORY_MEANING_TEEN : CATEGORY_MEANING_ADULT;
  const notes = teen ? CONTACT_NOTE_TEEN : CONTACT_NOTE_ADULT;

  const categories: KarmicCategory[] = CATEGORY_ORDER.map((key) => {
    const matching = indicators
      .filter((ind) => THEME_TO_CATEGORY[ind.theme] === key)
      .sort(sortStrength);
    const noun = CATEGORY_NOUN[key];
    return {
      key,
      count: matching.length,
      label: `${matching.length} ${matching.length === 1 ? noun.singular : noun.plural}`,
      plainMeaning: meanings[key],
      evidence: matching.map((ind) => ({
        contact: karmicContactLine(ind, names[0], names[1]),
        orbText: formatKarmicOrb(ind.orb),
        note: notes[ind.type] || 'One detected contact.',
      })),
    };
    // Categories with a count of 0 are filtered out below: a labelled count only
    // appears when it comes from contacts that were actually detected.
  }).filter((cat) => cat.count > 0);

  const allowSymbolic = ctx ? ctx.allowSymbolic : true;
  const theme = analysis ? symbolicTheme(analysis.karmicType) : null;
  const derivedFrom = [...indicators]
    .sort(sortStrength)
    .slice(0, 4)
    .map((ind) => `${karmicContactLine(ind, names[0], names[1])} (${formatKarmicOrb(ind.orb)})`);

  return {
    hasEvidence: indicators.length > 0,
    categories,
    bigPicture: buildBigPicture(indicators, categories, teen, names),
    symbolic:
      allowSymbolic && theme && indicators.length > 0
        ? {
            heading: 'Optional symbolic theme',
            label: theme.label,
            explanation: teen
              ? `${theme.description} This is an optional way of describing the contacts listed above. It is not a type of relationship, and it says nothing about how long anything lasts.`
              : `${theme.description} It is a way of describing the contacts listed above, nothing more.`,
            derivedFrom,
            note: SYMBOLIC_LENS_NOTE,
          }
        : null,
    glossary: GLOSSARY,
    countsNote:
      'These are counts of contacts actually found between the two charts, not scores or ratings. A higher count means more contacts of that kind, not a stronger or better relationship.',
    doesNotMean: teen ? DOES_NOT_MEAN_TEEN : DOES_NOT_MEAN_ADULT,
  };
}

/** Plain-text rendering used by PDF/print exports so they match the screen. */
export function renderKarmicSummaryText(summary: KarmicSummary): string {
  const parts: string[] = [];
  parts.push('The Big Picture: ' + summary.bigPicture);
  if (summary.categories.length > 0) {
    parts.push(summary.countsNote);
    summary.categories.forEach((cat) => {
      const evidence = cat.evidence
        .map((e) => `${e.contact} (${e.orbText})`)
        .join('; ');
      parts.push(`${cat.label} — ${cat.plainMeaning} Why this appears: ${evidence}.`);
    });
  }
  if (summary.symbolic) {
    parts.push(
      `${summary.symbolic.heading}: ${summary.symbolic.label}. ${summary.symbolic.explanation} Derived from: ${summary.symbolic.derivedFrom.join('; ')}.`,
    );
  }
  parts.push('What this does not mean: ' + summary.doesNotMean.join(' '));
  parts.push(
    'Glossary: ' + summary.glossary.map((g) => `${g.term} — ${g.meaning}`).join(' '),
  );
  return parts.join('\n\n');
}

export default buildKarmicSummary;
