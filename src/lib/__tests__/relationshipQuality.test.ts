import { describe, it, expect } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '../natalChartCalculation';
import {
  buildRelationshipContext,
  needsFamilyRelation,
  calculateCrossAspects,
  coreAspects,
  isAutomaticNodalMirror,
  rankTopContacts,
  calculateHouseOverlaysAccurate,
  overlayClusters,
  scoreRelationship,
  buildPairReading,
  sanitizeRelationshipText,
  findForbiddenRelationshipPhrases,
  collectStrings,
  kindFromFocus,
  familyRelationFrom,
  legacyKarmicFocus,
  ADVANCED_SYNASTRY_BODIES,
  describeDirectionalContact,
  describeDirectionalFromParts,
  SYMBOLIC_LENS_HEADING,
  SYMBOLIC_LENS_NOTE,
  symbolicEmphasisLabel,
  symbolicEmphasisLine,
  symbolicShareLine,
  symbolicTheme,
} from '@/lib/relationship';

interface Fixture {
  id: string;
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezoneId: string;
  place: string;
}

function buildChart(f: Fixture): NatalChart {
  const calc = calculateNatalFromInput({
    birthDate: f.date,
    birthTime: f.time,
    birthLocation: f.place,
    latitude: f.latitude,
    longitude: f.longitude,
    timezoneId: f.timezoneId,
    placeName: f.place,
    placeConfidence: 'high',
    placeSource: 'manual',
  } as any);

  const planets: Record<string, any> = {};
  for (const [key, pos] of Object.entries(calc.positions)) {
    const stored = toStoredPosition(pos as any);
    planets[key] = { ...stored, isRetrograde: stored.isRetrograde ?? false };
  }
  const houseCusps: Record<string, any> = {};
  if (calc.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const c = (calc.houseCusps as any)[`house${i}`];
      houseCusps[`house${i}`] = { sign: c.sign, degree: c.degree, minutes: c.minutes };
    }
  }
  if (houseCusps.house1) planets.Ascendant = { ...houseCusps.house1, seconds: 0, isRetrograde: false };

  return {
    id: f.id,
    name: f.name,
    birthDate: f.date,
    birthTime: f.time,
    birthLocation: f.place,
    timezoneId: f.timezoneId,
    latitude: f.latitude,
    longitude: f.longitude,
    placeName: f.place,
    planets: planets as any,
    houseCusps: houseCusps as any,
  } as NatalChart;
}

// Ava Kravitz — the reference minor chart used across the interpretation repair.
const AVA: Fixture = {
  id: 'ava',
  name: 'Ava Kravitz',
  date: '2011-05-19',
  time: '18:06',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  place: 'West Hills, California, United States',
};

// Max — Ava's boyfriend. Also a minor: this pair is the TEEN ROMANTIC reference
// case. They are NOT siblings, and nothing about their ages or shared surname-like
// fixture ids may cause the app to read them as family.
const MAX: Fixture = {
  id: 'max',
  name: 'Max Levin',
  date: '2014-02-08',
  time: '09:20',
  latitude: 34.2011,
  longitude: -118.6317,
  timezoneId: 'America/Los_Angeles',
  place: 'West Hills, California, United States',
};

// Jamie — an unrelated minor, used for the FAMILY/sibling context checks so that
// family behaviour is never tested through the Ava + Max dating pair.
const JAMIE: Fixture = {
  id: 'jamie',
  name: 'Jamie Ruiz',
  date: '2013-03-04',
  time: '14:35',
  latitude: 34.0522,
  longitude: -118.2437,
  timezoneId: 'America/Los_Angeles',
  place: 'Los Angeles, California, United States',
};

// An unrelated adult pair, for adult-context checks.
const DANA: Fixture = {
  id: 'dana',
  name: 'Dana Reyes',
  date: '1984-11-02',
  time: '07:45',
  latitude: 41.8781,
  longitude: -87.6298,
  timezoneId: 'America/Chicago',
  place: 'Chicago, Illinois, United States',
};

const SAM: Fixture = {
  id: 'sam',
  name: 'Sam Okafor',
  date: '1982-06-14',
  time: '21:10',
  latitude: 40.7128,
  longitude: -74.006,
  timezoneId: 'America/New_York',
  place: 'New York, New York, United States',
};

const ava = buildChart(AVA);
const max = buildChart(MAX);
const jamie = buildChart(JAMIE);
const dana = buildChart(DANA);
const sam = buildChart(SAM);

// Fixed "now": Ava 15, Max 12, Jamie 13 — all minors.
const NOW = new Date('2026-09-07T00:00:00Z');

/** Family/sibling checks use an unrelated minor pair, never Ava + Max. */
function siblingContext() {
  return buildRelationshipContext({
    kind: 'family',
    familyRelation: 'siblings',
    chart1: ava,
    chart2: jamie,
    now: NOW,
  });
}

/** Ava + Max: teen dating. Romance stays on; adult framing stays off. */
function teenRomanticContext() {
  return buildRelationshipContext({ kind: 'romantic', chart1: ava, chart2: max, now: NOW });
}

describe('Relationship context — kind, family exactness, age gates', () => {
  it('never maps neutral/all to romance', () => {
    expect(kindFromFocus('all')).toBe('neutral');
    const ctx = buildRelationshipContext({ kind: 'neutral', chart1: dana, chart2: sam, now: NOW });
    expect(ctx.allowRomantic).toBe(false);
    expect(ctx.allowSexual).toBe(false);
    expect(ctx.allowMarriage).toBe(false);
    expect(ctx.sections).not.toContain('romanticAttraction');
    expect(ctx.sections).not.toContain('longTermPartnership');
  });

  it('requires an exact family relation before family analysis is meaningful', () => {
    const unresolved = buildRelationshipContext({ kind: 'family', chart1: ava, chart2: jamie, now: NOW });
    expect(unresolved.familyRelation).toBeNull();
    expect(needsFamilyRelation(unresolved)).toBe(true);

    const resolved = siblingContext();
    expect(needsFamilyRelation(resolved)).toBe(false);
    expect(resolved.familyRelation).toBe('siblings');
    expect(resolved.label).toContain('Siblings');
  });

  it('suppresses romance, sex, marriage and business for a minor sibling pair', () => {
    const ctx = siblingContext();
    expect(ctx.kind).toBe('family');
    expect(ctx.involvesMinor).toBe(true);
    // Youngest stage wins: Max is 12 at the fixed "now", so the whole reading is
    // written at the younger person's stage, never the older one's.
    expect(ctx.stage).toBe('teen');
    expect(
      buildRelationshipContext({
        kind: 'family',
        familyRelation: 'siblings',
        chart1: ava,
        chart2: jamie,
        ageOverrides: [15, 9],
        now: NOW,
      }).stage
    ).toBe('child');
    expect(ctx.allowRomantic).toBe(false);
    expect(ctx.allowSexual).toBe(false);
    expect(ctx.allowMarriage).toBe(false);
    expect(ctx.allowBusiness).toBe(false);
    expect(ctx.sections).not.toContain('romanticAttraction');
    expect(ctx.sections).not.toContain('businessCollaboration');
  });

  it('reads a teen romantic pair as teen dating, never as family, and never sexualised', () => {
    const ctx = teenRomanticContext();
    expect(ctx.kind).toBe('romantic');
    expect(ctx.familyRelation).toBeNull();
    expect(ctx.label).not.toMatch(/family|sibling/i);
    expect(ctx.label).toMatch(/teen/i);
    expect(ctx.stage).toBe('teen');
    expect(ctx.involvesMinor).toBe(true);
    expect(ctx.isTeenRomance).toBe(true);
    // Romance is kept, because it is the relationship they actually have.
    expect(ctx.allowRomantic).toBe(true);
    expect(ctx.sections).toContain('romanticAttraction');
    // Adult framing is off.
    expect(ctx.allowSexual).toBe(false);
    expect(ctx.allowMarriage).toBe(false);
    expect(ctx.allowBusiness).toBe(false);
    expect(ctx.sections).not.toContain('longTermPartnership');
    expect(ctx.sections).not.toContain('businessCollaboration');
    // Developmentally appropriate priorities are added.
    for (const key of ['trustAndSupport', 'sharedInterests', 'conflictAndRecovery', 'boundariesAndPacing', 'confidenceAndGrowth']) {
      expect(ctx.sections).toContain(key as any);
    }
  });

  it('still refuses romantic framing when a child (pre-teen) is involved', () => {
    const ctx = buildRelationshipContext({
      kind: 'romantic',
      chart1: ava,
      chart2: max,
      ageOverrides: [15, 9],
      now: NOW,
    });
    expect(ctx.stage).toBe('child');
    expect(ctx.allowRomantic).toBe(false);
    expect(ctx.isTeenRomance).toBe(false);
  });

  it('uses adult context and sections for two adults', () => {
    const ctx = buildRelationshipContext({ kind: 'romantic', chart1: dana, chart2: sam, now: NOW });
    expect(ctx.stage).toBe('adult');
    expect(ctx.allowRomantic).toBe(true);
    expect(ctx.allowMarriage).toBe(true);
    expect(ctx.sections).toContain('romanticAttraction');
  });

  it('bridges legacy vocabulary without inventing romance or losing family exactness', () => {
    expect(kindFromFocus('romantic')).toBe('romantic');
    expect(kindFromFocus('family')).toBe('family');
    expect(familyRelationFrom(null)).toBeNull();
    expect(familyRelationFrom({ relationType: 'siblings' } as any)).toBe('siblings');
    // A legacy API that cannot express "neutral" gets the least presumptuous option.
    expect(legacyKarmicFocus('neutral')).toBe('friendship');
    expect(legacyKarmicFocus('romantic')).toBe('romance');
  });
});

describe('Synastry engine — one aspect/orb/body implementation', () => {
  const aspects = calculateCrossAspects(ava, max);

  it('always reports real geometry: separation matches the aspect angle within the orb', () => {
    expect(aspects.length).toBeGreaterThan(0);
    for (const a of aspects) {
      expect(Math.abs(a.separation - a.aspectAngle)).toBeLessThanOrEqual(a.maxOrb + 0.051);
      expect(a.orb).toBeLessThanOrEqual(a.maxOrb);
      expect(a.aspect).toBeTruthy();
    }
  });

  it('does not force contacts to conjunction', () => {
    const kinds = new Set(aspects.map((a) => a.aspect));
    expect(kinds.size).toBeGreaterThan(1);
    for (const a of aspects.filter((x) => x.aspect === 'conjunction')) {
      expect(a.separation).toBeLessThanOrEqual(a.maxOrb + 0.051);
    }
  });

  it('keeps direction/ownership explicit and correct', () => {
    for (const a of aspects) {
      expect(a.fromOwner).toBe(ava.name);
      expect(a.toOwner).toBe(max.name);
      expect(a.label).toContain(ava.name);
      expect(a.label).toContain(max.name);
    }
  });

  it('excludes minor bodies from core contacts unless explicitly enabled', () => {
    for (const a of coreAspects(aspects)) {
      expect(ADVANCED_SYNASTRY_BODIES).not.toContain(a.fromBody as any);
      expect(ADVANCED_SYNASTRY_BODIES).not.toContain(a.toBody as any);
    }
    const advanced = calculateCrossAspects(ava, max, { includeAdvancedBodies: true });
    expect(advanced.length).toBeGreaterThanOrEqual(aspects.length);
  });

  it('never treats a North Node as a fallback for a missing body', () => {
    const stripped = {
      ...max,
      planets: { ...(max.planets as any) },
    } as NatalChart;
    delete (stripped.planets as any).Venus;
    const withoutVenus = calculateCrossAspects(ava, stripped);
    expect(withoutVenus.some((a) => a.toBody === 'Venus')).toBe(false);
    // The rest of the contacts still resolve normally.
    expect(withoutVenus.length).toBeGreaterThan(0);
  });

  it('flags the automatic North Node / South Node mirror so it cannot count as evidence', () => {
    const mirror = {
      fromBody: 'NorthNode',
      toBody: 'SouthNode',
      aspect: 'opposition',
    } as any;
    expect(isAutomaticNodalMirror(mirror)).toBe(true);
    expect(isAutomaticNodalMirror({ fromBody: 'Sun', toBody: 'Moon', aspect: 'opposition' } as any)).toBe(false);

    const reading = buildPairReading(ava, jamie, siblingContext());
    const evidence = reading.sections.flatMap((s) => s.items.flatMap((i) => i.evidence));
    // No reading item may cite a node-to-node contact: it is geometry both charts
    // produce automatically, not evidence about the pair.
    expect(
      evidence.some((e) => /(north ?node)[^\n]{0,40}(south ?node)/i.test(e) || /(south ?node)[^\n]{0,40}(north ?node)/i.test(e))
    ).toBe(false);
  });

  it('ranks the most useful contacts first and keeps the list short', () => {
    const top = rankTopContacts(aspects, 5);
    expect(top.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].weight).toBeGreaterThanOrEqual(top[i].weight);
    }
  });
});

describe('House overlays — real cusps, labelled fallback', () => {
  it('uses stored cusps when they exist', () => {
    const overlays = calculateHouseOverlaysAccurate(ava, max, { stage: 'child' });
    expect(overlays.length).toBeGreaterThan(0);
    for (const o of overlays) {
      expect(o.method).toBe('cusps');
      expect(o.approximationNote).toBeUndefined();
      expect(o.house).toBeGreaterThanOrEqual(1);
      expect(o.house).toBeLessThanOrEqual(12);
    }
  });

  it('labels the whole-sign approximation when cusps are unavailable', () => {
    const noCusps = { ...max, houseCusps: undefined } as unknown as NatalChart;
    const overlays = calculateHouseOverlaysAccurate(ava, noCusps, { stage: 'child' }).filter(
      (o) => o.houseOwner === noCusps.name
    );
    expect(overlays.length).toBeGreaterThan(0);
    for (const o of overlays) {
      expect(o.method).toContain('whole-sign');
      expect(o.approximationNote).toBeTruthy();
    }
  });

  it('builds clusters from the ten planets only', () => {
    const clusters = overlayClusters(calculateHouseOverlaysAccurate(ava, max, { stage: 'child' }));
    for (const c of clusters) {
      expect(c.bodies.length).toBeGreaterThanOrEqual(2);
      expect(c.bodies).not.toContain('NorthNode');
      expect(c.bodies).not.toContain('SouthNode');
      expect(c.bodies).not.toContain('Chiron');
      expect(c.arena).toBeTruthy();
    }
  });
});

describe('Context scoring — no averaging of unrelated categories', () => {
  it('shows no headline number in neutral mode', () => {
    const ctx = buildRelationshipContext({ kind: 'neutral', chart1: dana, chart2: sam, now: NOW });
    const score = scoreRelationship(calculateCrossAspects(dana, sam), ctx);
    expect(score.overall).toBeNull();
    expect(score.dimensions.length).toBeGreaterThan(0);
    expect(score.disclaimer).toBeTruthy();
  });

  it('uses context-appropriate dimensions and backs each with evidence', () => {
    const sibling = siblingContext();
    const siblingScore = scoreRelationship(calculateCrossAspects(ava, jamie), sibling);
    const keys = siblingScore.dimensions.map((d) => d.key);
    expect(keys).not.toContain('warmthAndAttraction');
    expect(keys).not.toContain('commitmentAndStability');
    for (const d of siblingScore.dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(5);
      expect(d.score).toBeLessThanOrEqual(95);
      expect(d.meaning).toBeTruthy();
    }

    const romantic = buildRelationshipContext({ kind: 'romantic', chart1: dana, chart2: sam, now: NOW });
    const romanticKeys = scoreRelationship(calculateCrossAspects(dana, sam), romantic).dimensions.map((d) => d.key);
    expect(romanticKeys).toContain('warmthAndAttraction');
  });
});

describe('Pair reading — minor sibling regression (Ava + Jamie)', () => {
  const reading = buildPairReading(ava, jamie, siblingContext());
  const text = collectStrings(reading).join('\n');

  it('reads as a sibling relationship in age-appropriate language', () => {
    expect(reading.context.kind).toBe('family');
    expect(reading.context.familyRelation).toBe('siblings');
    expect(reading.sections.map((s) => s.key)).not.toContain('romanticAttraction');
    expect(reading.bottomLine.length).toBeGreaterThan(40);
    expect(reading.methodNote).toBeTruthy();
  });

  it('contains no romantic, sexual, marriage or business-partnership framing', () => {
    expect(text).not.toMatch(/\b(sexual|sexually|lovers?|marriage|marry|spouse|dating|soulmate|business partner)\b/i);
  });

  it('contains no fate, past-life, karmic-debt or destiny certainty', () => {
    expect(text).not.toMatch(/\b(past life|past-life|previous lifetime|karmic debt|soul contract|destined|fated|meant to be)\b/i);
  });

  it('contains no safety, clinical, trauma or medical claims', () => {
    expect(text).not.toMatch(/\b(abuse|abusive|toxic|narcissist\w*|gaslight\w*|manipulative|dangerous|high[- ]risk|diagnos\w*|trauma|PTSD|therapy|therapist|hotline)\b/i);
  });

  it('promises nothing about money, duration or outcomes', () => {
    expect(text).not.toMatch(/\b(guaranteed|will definitely|financial success|wealth|studies show|research proves|lifetime commitment)\b/i);
  });

  it('passes the shared forbidden-phrase scan', () => {
    expect(findForbiddenRelationshipPhrases(collectStrings(reading).join('\n'), reading.context)).toEqual([]);
  });

  it('grounds every reading item in named chart evidence', () => {
    const items = reading.sections.flatMap((s) => s.items);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.evidence.length).toBeGreaterThan(0);
      expect(item.statement.length).toBeGreaterThan(20);
      expect(item.evidence.join(' ')).toMatch(/Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|MC|Node|Chiron|house/i);
    }
  });

  it('leads with the constructive expression before any growth edge', () => {
    const items = reading.sections.flatMap((s) => s.items).filter((i) => i.growthEdge);
    for (const item of items) {
      expect(item.statement).not.toBe(item.growthEdge);
      expect(item.statement.length).toBeGreaterThan(0);
    }
  });
});

describe('Pair reading — Ava + Max TEEN ROMANTIC regression', () => {
  const ctx = teenRomanticContext();
  const reading = buildPairReading(ava, max, ctx);
  const text = collectStrings(reading).join('\n');

  it('renders as teen dating, not family or siblings', () => {
    expect(reading.context.kind).toBe('romantic');
    expect(reading.context.isTeenRomance).toBe(true);
    expect(reading.context.familyRelation).toBeNull();
    // House arenas legitimately mention "siblings"/"family" as life areas; what must
    // never appear is the pair being FRAMED as siblings or family.
    expect(text).not.toMatch(/read as a family|family relationship between|as siblings\b|your (?:brother|sister)\b|sibling (?:bond|dynamic|relationship)/i);
    expect(reading.context.label).toMatch(/dating/i);
    expect(reading.score.label).toMatch(/teen dating/i);
  });

  it('keeps age-appropriate romantic sections and drops adult-partnership ones', () => {
    const keys = reading.sections.map((s) => s.key);
    expect(keys).toContain('romanticAttraction');
    expect(keys).toContain('trustAndSupport');
    expect(keys).toContain('conflictAndRecovery');
    expect(keys).toContain('boundariesAndPacing');
    expect(keys).toContain('confidenceAndGrowth');
    expect(keys).not.toContain('longTermPartnership');
    expect(keys).not.toContain('businessCollaboration');
  });

  it('scores teen dating on age-appropriate dimensions only', () => {
    const keys = reading.score.dimensions.map((d) => d.key);
    expect(keys).toContain('warmthAndAttraction');
    expect(keys).toContain('emotionalFit');
    expect(keys).not.toContain('commitmentAndStability');
    expect(reading.score.disclaimer).toBeTruthy();
  });

  it('uses no sexualised or adult-relationship language', () => {
    expect(text).not.toMatch(
      /\b(sexual|sexually|sexual chemistry|erotic|eros|lust|seduc\w*|bedroom|physical intimacy|marriage|married|marry|spouse|husband|wife|wedding|cohabit\w*|living together|moving in together|dominance and surrender|family[- ]building|financial partnership|joint finances|soulmate)\b/i
    );
    expect(text).not.toMatch(/keep (?:their|your) hands off/i);
    expect(findForbiddenRelationshipPhrases(text, ctx)).toEqual([]);
  });

  it('makes no fate, safety, clinical or outcome promises', () => {
    expect(text).not.toMatch(/\b(past[- ]life|karmic debt|soul contract|destined|fated|meant to be)\b/i);
    expect(text).not.toMatch(/\b(abusive|toxic|gaslight\w*|manipulative|dangerous|high[- ]risk|trauma|therapy|hotline)\b/i);
    expect(text).not.toMatch(/\b(guaranteed|will definitely|will last|financial success|wealth)\b/i);
  });

  it('grounds every teen-dating item in real chart evidence', () => {
    for (const item of reading.sections.flatMap((s) => s.items)) {
      expect(item.evidence.length).toBeGreaterThan(0);
      expect(item.evidence.join(' ')).toMatch(/Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|MC|Node|Chiron|house/i);
    }
  });
});

describe('Pair reading — second pair (adults, non-family) stays clean too', () => {
  it('keeps neutral mode neutral and evidence-backed', () => {
    const ctx = buildRelationshipContext({ kind: 'neutral', chart1: dana, chart2: sam, now: NOW });
    const reading = buildPairReading(dana, sam, ctx);
    expect(reading.score.overall).toBeNull();
    expect(findForbiddenRelationshipPhrases(collectStrings(reading).join('\n'), ctx)).toEqual([]);
    const text = collectStrings(reading).join('\n');
    expect(text).not.toMatch(/\b(romantic chemistry|sexual|marriage)\b/i);
  });

  it('allows adult romantic sections when that context is actually chosen', () => {
    const ctx = buildRelationshipContext({ kind: 'romantic', chart1: dana, chart2: sam, now: NOW });
    const reading = buildPairReading(dana, sam, ctx);
    expect(reading.sections.map((s) => s.key)).toContain('romanticAttraction');
    expect(findForbiddenRelationshipPhrases(collectStrings(reading).join('\n'), ctx)).toEqual([]);
  });
});

describe('Relationship language sanitizer', () => {
  it('removes fate and past-life certainty', () => {
    const out = sanitizeRelationshipText('You knew each other in a past life and this is destined to last forever.');
    expect(out).not.toMatch(/past life/i);
    expect(out).not.toMatch(/destined/i);
  });

  it('removes safety, clinical and trauma claims', () => {
    const out = sanitizeRelationshipText('This is a high-risk, toxic bond; he will gaslight you, so contact the hotline.');
    expect(out).not.toMatch(/high-risk|toxic|gaslight|hotline/i);
  });

  it('keeps teen romance readable while removing adult and sexual framing', () => {
    const ctx = teenRomanticContext();
    const out = sanitizeRelationshipText(
      'Their sexual chemistry is intense, marriage is likely, and they will end up living together with joint finances.',
      ctx
    );
    expect(out).not.toMatch(/sexual|marriage|living together|joint finances/i);
    expect(out).toMatch(/liking|attraction|spark|together/i);
  });

  it('strips romantic and sexual wording in a minor family context', () => {
    const ctx = siblingContext();
    const out = sanitizeRelationshipText('There is strong sexual chemistry and marriage potential here.', ctx);
    expect(out).not.toMatch(/sexual|marriage/i);
  });
});


describe('Directional synastry — who feels what', () => {
  const ctx = teenRomanticContext();

  it('describes Ava Venus trine Max Pluto from both sides, in teen-appropriate words', () => {
    const d = describeDirectionalFromParts(
      {
        fromOwner: 'Ava Kravitz',
        fromBody: 'Venus',
        toOwner: 'Max Levin',
        toBody: 'Pluto',
        aspect: 'trine',
        orb: 1.2,
      },
      ctx
    );
    expect(d.aspectLine).toBe("Ava Kravitz's Venus trine Max Levin's Pluto");
    expect(d.orbLine).toMatch(/orb 1\.2°/);
    // Roles are named, and they are not the same role.
    expect(d.a.roleLine).toMatch(/Ava Kravitz is the Venus person/);
    expect(d.b.roleLine).toMatch(/Max Levin is the Pluto person/);
    // Venus side: drawn / valued / affected in attraction and relating.
    expect(d.a.feels).toMatch(/drawn|valued/i);
    // Pluto side: focused / invested / fascinated — never "obsessed".
    expect(d.b.feels).toMatch(/focused|invested|fascinated/i);
    // Possibility, not certainty.
    expect(d.a.feels).toMatch(/\bmay\b/);
    expect(d.b.feels).toMatch(/\bmay\b/);
    // Both work-well and growth-edge lines exist, plus a one-line summary.
    expect(d.worksWell.length).toBeGreaterThan(20);
    expect(d.growthEdge.length).toBeGreaterThan(20);
    expect(d.summary).toMatch(/Ava Kravitz.*Max Levin/);
    const all = [d.a.feels, d.b.feels, d.worksWell, d.growthEdge, d.summary].join(' ');
    expect(all).not.toMatch(/obsess|erotic|sexual|dominance and surrender|hands off/i);
    expect(findForbiddenRelationshipPhrases(all, ctx)).toEqual([]);
  });

  it('does not treat the two roles as interchangeable', () => {
    const forward = describeDirectionalFromParts(
      { fromOwner: 'Ava', fromBody: 'Venus', toOwner: 'Max', toBody: 'Pluto', aspect: 'trine', orb: 1.2 },
      ctx
    );
    const reverse = describeDirectionalFromParts(
      { fromOwner: 'Max', fromBody: 'Pluto', toOwner: 'Ava', toBody: 'Venus', aspect: 'trine', orb: 1.2 },
      ctx
    );
    expect(forward.a.feels).not.toBe(reverse.a.feels);
  });

  it('attaches a full directional breakdown to every ranked contact card', () => {
    const reading = buildPairReading(ava, max, ctx);
    const strongest = reading.sections.find((s) => s.key === 'strongestAspects');
    expect(strongest && strongest.items.length).toBeTruthy();
    for (const item of strongest!.items) {
      const d = item.directional;
      expect(d).toBeTruthy();
      expect(d!.aspectLine).toMatch(/'s .+ (conjunction|trine|sextile|square|opposition)/);
      expect(d!.orbLine).toMatch(/orb \d/);
      expect(d!.a.roleLine).toContain('is the');
      expect(d!.b.roleLine).toContain('is the');
      expect(d!.worksWell).toBeTruthy();
      expect(d!.growthEdge).toBeTruthy();
      expect(d!.summary).toBeTruthy();
    }
  });

  it('uses core directional roles for teens without adult framing', () => {
    const reading = buildPairReading(ava, max, ctx);
    const text = collectStrings(reading).join('\n');
    expect(text).not.toMatch(/obsess|erotic|\bsexual\b|dominance and surrender|hands off|marriage/i);
    for (const body of ['Venus', 'Mars', 'Pluto']) {
      // if the pair has such a contact, it is always described from both sides
      const items = reading.sections
        .flatMap((s) => s.items)
        .filter((i) => i.directional && (i.directional.a.body === body || i.directional.b.body === body));
      for (const i of items) {
        expect(i.directional!.a.feels).toMatch(/\bmay\b/);
        expect(i.directional!.b.feels).toMatch(/\bmay\b/);
      }
    }
  });
});

describe('Symbolic / spiritual layer framing', () => {
  const ctx = teenRomanticContext();

  it('never presents the internal weighting as a probability', () => {
    const line = symbolicEmphasisLine(33, ["Ava's Venus trine Max's Pluto (1.2° orb)"]);
    expect(line).not.toMatch(/probability: ?\d/i);
    expect(line).toMatch(/not a probability/i);
    expect(line).toMatch(/symbolic emphasis/i);
    expect(line).toMatch(/Venus trine/);
    expect(symbolicEmphasisLabel(33)).toBe('moderate symbolic emphasis');
    expect(symbolicShareLine('Growth-direction contacts', 67)).toMatch(/internal share/i);
  });

  it('replaces opaque pseudo-diagnostic labels with plain symbolic themes plus chart basis', () => {
    const theme = symbolicTheme('twin_flame');
    expect(theme.label).not.toMatch(/twin flame/i);
    expect(theme.label).toMatch(/symbolic|mirror/i);
    expect(theme.chartBasis).toMatch(/Pluto|Node|Sun\/Moon/);
    expect(theme.description).toMatch(/symbolic/i);
    for (const key of ['twin_flame', 'completion', 'catalyst', 'soul_family', 'karmic_lesson', 'new_contract'] as const) {
      const t = symbolicTheme(key);
      expect(t.label).not.toMatch(/twin flame|karmic debt|soul contract/i);
      expect(t.chartBasis.length).toBeGreaterThan(20);
    }
  });

  it('labels the spiritual lens as optional and interpretive', () => {
    expect(SYMBOLIC_LENS_HEADING).toMatch(/symbolic/i);
    expect(SYMBOLIC_LENS_HEADING).toMatch(/optional/i);
    expect(SYMBOLIC_LENS_NOTE).toMatch(/interpretive/i);
    expect(SYMBOLIC_LENS_NOTE).toMatch(/not a measurement/i);
  });

  it('sanitises the old pseudo-diagnostic strings anywhere they appear', () => {
    const raw =
      'Twin Flame Connection. Past Life Probability: 33% • Soul Growth Focus: 67%. Mirror relationship for radical romantic self-awareness. He is obsessed and they FATED LOVE, meant to be, dominance and surrender.';
    const clean = sanitizeRelationshipText(raw, ctx);
    expect(clean).not.toMatch(/twin flame/i);
    expect(clean).not.toMatch(/past[- ]life probability/i);
    expect(clean).not.toMatch(/soul growth focus/i);
    expect(clean).not.toMatch(/fated love/i);
    expect(clean).not.toMatch(/meant to be/i);
    expect(clean).not.toMatch(/obsess/i);
    expect(clean).not.toMatch(/dominance and surrender/i);
    expect(findForbiddenRelationshipPhrases(clean, ctx)).toEqual([]);
  });

  it('forbids the pseudo-diagnostic phrases for teen romantic output', () => {
    const bad = [
      'Twin Flame',
      'Past Life Probability: 40%',
      'FATED LOVE',
      'destined romantic meeting',
      'meant to be',
      'obsessive attachment',
      "can't keep hands off each other",
      'dominance and surrender',
    ];
    for (const phrase of bad) {
      expect(findForbiddenRelationshipPhrases(phrase, ctx).length).toBeGreaterThan(0);
    }
  });
});
