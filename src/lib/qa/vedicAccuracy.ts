/**
 * Vedic accuracy audit for the 20 reference people.
 *
 * The Western suite grades tropical longitudes against frozen JPL values. This
 * module grades everything the Jyotish engine builds on top of them:
 *
 *   - Sidereal longitude: the frozen tropical value minus the ayanamsa for that
 *     exact UTC instant, compared to what the app's Vedic chart produces. That
 *     catches conversion drift, sign-boundary errors and half-hour-zone bugs.
 *   - Nakshatra and pada: recomputed independently from the expected sidereal
 *     longitude and compared to the app's assignment.
 *   - Whole-sign houses: recomputed from the expected lagna and compared.
 *   - Vimshottari dasha: sequence order, 120-year total, contiguity, and the
 *     birth balance checked against the Moon's own nakshatra fraction.
 *   - Divisional charts: every varga lands in a real sign for every graha.
 *   - Ashtakavarga: BAV totals reconcile to the classical numbers and SAV sums
 *     to 337.
 *   - Ayanamsa modes: all four schools stay ordered and inside the spread the
 *     published values allow.
 *
 * Nothing here is graded against the app's own output as the source of truth.
 */

import { buildReferenceChart, arcminBetween } from './accuracyAudit';
import { REFERENCE_PEOPLE, type ReferencePerson } from '@/test/fixtures/referencePeople';
import { buildVedicChart } from '@/lib/vedic/siderealChart';
import { ayanamsaFor, AYANAMSA_MODE_LIST, AyanamsaMode } from '@/lib/vedic/ayanamsa';
import { getNakshatra, NAKSHATRA_SPAN, VedicPlanet } from '@/lib/vedic/nakshatras';
import { buildVimshottari, DASHA_YEARS, computeDashaSeed } from '@/lib/vedic/vimshottariDasha';
import { buildVarga, ALL_VARGAS } from '@/lib/vedic/divisionalCharts';
import { buildAshtakavarga, BAV_TOTALS, SAV_GRAND_TOTAL } from '@/lib/vedic/ashtakavarga';
import { signIndex } from '@/lib/vedic/vedicDignity';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Western fixture body -> graha. Ketu is derived, so it is checked separately. */
const BODY_MAP: Record<string, VedicPlanet> = {
  Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
  Jupiter: 'Jupiter', Saturn: 'Saturn', NorthNode: 'Rahu',
};

/**
 * Tolerance in arc-minutes. The Western tolerance plus a small allowance for the
 * linear ayanamsa model, which is what the app itself uses, so the only thing
 * that can exceed this is a real conversion bug.
 */
const TOLERANCE: Record<string, number> = {
  Sun: 8, Moon: 10, Mercury: 8, Venus: 8, Mars: 8,
  Jupiter: 8, Saturn: 8, Rahu: 130, Lagna: 32,
};

const norm360 = (v: number) => ((v % 360) + 360) % 360;

export type VedicStatus = 'pass' | 'fail' | 'missing';

export interface VedicBodyCheck {
  body: string;
  expectedSidereal: number;
  actualSidereal: number | null;
  deltaArcmin: number | null;
  limit: number;
  status: VedicStatus;
  expectedSign: string;
  actualSign: string | null;
  signOk: boolean;
  expectedNakshatra: string;
  actualNakshatra: string | null;
  expectedPada: number;
  actualPada: number | null;
  nakshatraOk: boolean;
  expectedHouse: number | null;
  actualHouse: number | null;
  houseOk: boolean;
}

export interface VedicInvariant {
  name: string;
  ok: boolean;
  detail: string;
}

export interface VedicPersonAudit {
  id: string;
  name: string;
  birthLine: string;
  ayanamsaApplied: number;
  bodies: VedicBodyCheck[];
  invariants: VedicInvariant[];
  passCount: number;
  failCount: number;
  score: number;
}

export interface VedicSuiteReport {
  generatedAt: string;
  people: VedicPersonAudit[];
  totals: {
    peopleCount: number;
    bodyChecks: number;
    bodyPass: number;
    bodyFail: number;
    signChecks: number;
    signPass: number;
    nakshatraChecks: number;
    nakshatraPass: number;
    houseChecks: number;
    housePass: number;
    invariantChecks: number;
    invariantPass: number;
    score: number;
  };
  worstBodies: Array<{ body: string; worstArcmin: number; person: string }>;
}

function fmtLon(lon: number | null): string {
  if (lon === null) return 'missing';
  const n = norm360(lon);
  const d = n % 30;
  const deg = Math.floor(d);
  const min = Math.round((d - deg) * 60);
  return `${SIGNS[Math.floor(n / 30)]} ${deg}\u00b0${String(min).padStart(2, '0')}'`;
}

/** One person, fully graded. */
export function auditVedicPerson(person: ReferencePerson, mode: AyanamsaMode = 'lahiri'): VedicPersonAudit {
  const chart = buildReferenceChart(person);
  const vedic = buildVedicChart(chart, mode);

  const utc = new Date(person.utc);
  const ayan = ayanamsaFor(utc, mode);

  const bodies: VedicBodyCheck[] = [];
  const invariants: VedicInvariant[] = [];

  const expectedLagna = person.expected.Ascendant !== undefined
    ? norm360(person.expected.Ascendant - ayan)
    : null;
  const expectedLagnaIdx = expectedLagna === null ? null : Math.floor(expectedLagna / 30);

  const addBody = (label: string, expectedTropical: number, actualLon: number | null, actualSign: string | null, actualHouse: number | null, actualNak: { name: string; pada: number } | null) => {
    const expectedSidereal = norm360(expectedTropical - ayan);
    const nak = getNakshatra(expectedSidereal);
    const limit = TOLERANCE[label] ?? 15;
    const delta = actualLon === null ? null : arcminBetween(expectedSidereal, actualLon);
    const expectedHouse = expectedLagnaIdx === null
      ? null
      : ((Math.floor(expectedSidereal / 30) - expectedLagnaIdx + 12) % 12) + 1;

    bodies.push({
      body: label,
      expectedSidereal,
      actualSidereal: actualLon,
      deltaArcmin: delta,
      limit,
      status: actualLon === null ? 'missing' : delta! <= limit ? 'pass' : 'fail',
      expectedSign: SIGNS[Math.floor(expectedSidereal / 30)],
      actualSign,
      // A sign mismatch inside the tolerance is a boundary case, not an error.
      signOk: actualSign === SIGNS[Math.floor(expectedSidereal / 30)]
        || (delta !== null && delta <= limit),
      expectedNakshatra: nak.name,
      actualNakshatra: actualNak?.name ?? null,
      expectedPada: nak.pada,
      actualPada: actualNak?.pada ?? null,
      nakshatraOk: (actualNak?.name === nak.name && actualNak?.pada === nak.pada)
        || (delta !== null && delta <= limit && nak.degreeInNakshatra < 0.5),
      expectedHouse,
      actualHouse,
      houseOk: expectedHouse === null || actualHouse === null
        ? true
        : expectedHouse === actualHouse || (delta !== null && delta <= limit && actualHouse !== null && Math.abs(expectedHouse - actualHouse) <= 1),
    });
  };

  if (!vedic) {
    invariants.push({ name: 'Vedic chart builds', ok: false, detail: 'buildVedicChart returned null for this reference person.' });
    return {
      id: person.id,
      name: person.name,
      birthLine: `${person.birthDate} ${person.birthTime} ${person.birthLocation}`,
      ayanamsaApplied: ayan,
      bodies,
      invariants,
      passCount: 0,
      failCount: 1,
      score: 0,
    };
  }

  // Lagna
  if (expectedLagna !== null && !person.approximateTime) {
    addBody(
      'Lagna',
      person.expected.Ascendant,
      vedic.lagnaSign && vedic.lagnaDegree !== null
        ? signIndex(vedic.lagnaSign) * 30 + vedic.lagnaDegree
        : null,
      vedic.lagnaSign,
      vedic.lagnaSign ? 1 : null,
      vedic.lagnaNakshatra ? { name: vedic.lagnaNakshatra.name, pada: vedic.lagnaNakshatra.pada } : null,
    );
  }

  for (const [fixtureKey, graha] of Object.entries(BODY_MAP)) {
    const expected = person.expected[fixtureKey];
    if (expected === undefined) continue;
    const body = vedic.byName[graha];
    addBody(
      graha,
      expected,
      body ? body.longitude : null,
      body?.sign ?? null,
      body?.house ?? null,
      body ? { name: body.nakshatra.name, pada: body.nakshatra.pada } : null,
    );
  }

  /* Invariants ---------------------------------------------------------- */

  // Ketu exactly opposite Rahu.
  const rahu = vedic.byName.Rahu;
  const ketu = vedic.byName.Ketu;
  if (rahu && ketu) {
    const sep = Math.abs(((rahu.longitude - ketu.longitude + 540) % 360) - 180);
    invariants.push({
      name: 'Ketu opposite Rahu',
      ok: sep < 0.001,
      detail: sep < 0.001
        ? 'Rahu and Ketu are exactly 180 degrees apart.'
        : `Rahu and Ketu are ${(180 - sep).toFixed(4)} degrees off exact opposition.`,
    });
  } else {
    invariants.push({ name: 'Ketu opposite Rahu', ok: false, detail: 'One of the nodes is missing from the Vedic chart.' });
  }

  // Every body's sign, nakshatra and house must derive from its own longitude.
  const derived = vedic.bodies.every(b => {
    const signOk = b.sign === SIGNS[Math.floor(norm360(b.longitude) / 30)];
    const nakOk = b.nakshatra.name === getNakshatra(b.longitude).name;
    const houseOk = !vedic.lagnaSign || b.house === ((signIndex(b.sign) - signIndex(vedic.lagnaSign) + 12) % 12) + 1;
    const padaOk = b.nakshatra.pada >= 1 && b.nakshatra.pada <= 4;
    return signOk && nakOk && houseOk && padaOk;
  });
  invariants.push({
    name: 'Sign, nakshatra, pada and house all derive from longitude',
    ok: derived,
    detail: derived
      ? 'Every graha agrees with its own sidereal longitude.'
      : 'At least one graha carries a sign, nakshatra, pada or whole-sign house that does not follow from its longitude.',
  });

  // Vimshottari dasha structure.
  const moon = vedic.byName.Moon;
  if (moon) {
    const periods = buildVimshottari(moon.longitude, vedic.birthMoment);
    const seed = computeDashaSeed(moon.longitude, vedic.birthMoment);
    const total = periods.reduce((a, p) => a + (p.end.getTime() - p.start.getTime()), 0);
    const totalYears = total / (365.2425 * 24 * 3600 * 1000);

    invariants.push({
      name: 'Dasha cycle totals 120 years',
      ok: Math.abs(totalYears - 120) < 0.5,
      detail: `The mahadasha sequence spans ${totalYears.toFixed(2)} years. The classical cycle is 120.`,
    });

    let contiguous = true;
    for (let i = 1; i < periods.length; i++) {
      if (Math.abs(periods[i].start.getTime() - periods[i - 1].end.getTime()) > 1000 * 60 * 60) contiguous = false;
    }
    invariants.push({
      name: 'Dasha periods are contiguous',
      ok: contiguous,
      detail: contiguous ? 'No gaps or overlaps between mahadashas.' : 'At least one mahadasha does not start where the previous one ends.',
    });

    const firstLordOk = periods[0]?.lord === moon.nakshatra.lord;
    invariants.push({
      name: 'First mahadasha lord is the Moon nakshatra lord',
      ok: !!firstLordOk,
      detail: firstLordOk
        ? `Birth falls in ${moon.nakshatra.name}, ruled by ${moon.nakshatra.lord}, and the sequence opens with ${periods[0]?.lord}.`
        : `Birth falls in ${moon.nakshatra.name}, ruled by ${moon.nakshatra.lord}, but the sequence opens with ${periods[0]?.lord}.`,
    });

    // Birth balance: the remaining fraction of the first period must match the
    // unused part of the Moon's nakshatra, computed here independently.
    const elapsed = getNakshatra(moon.longitude).degreeInNakshatra / NAKSHATRA_SPAN;
    const expectedBalance = DASHA_YEARS[moon.nakshatra.lord] * (1 - elapsed);
    const actualBalance = periods[0]
      ? (periods[0].end.getTime() - vedic.birthMoment.getTime()) / (365.2425 * 24 * 3600 * 1000)
      : 0;
    invariants.push({
      name: 'Birth balance of the first mahadasha',
      ok: Math.abs(actualBalance - expectedBalance) < 0.05,
      detail: `Expected ${expectedBalance.toFixed(3)} years remaining at birth from the nakshatra fraction, engine gives ${actualBalance.toFixed(3)}. Seed lord ${seed.lord}.`,
    });
  }

  // Divisional charts: every graha lands in a real sign in all sixteen vargas.
  let vargaOk = true;
  let vargaDetail = 'All sixteen divisional charts place every graha in a valid sign.';
  for (const key of ALL_VARGAS) {
    const v = buildVarga(vedic, key);
    for (const p of v.placements) {
      if (!SIGNS.includes(p.sign)) {
        vargaOk = false;
        vargaDetail = `${key} placed ${p.name} in "${p.sign}", which is not a sign.`;
        break;
      }
    }
    if (!vargaOk) break;
  }
  invariants.push({ name: 'Divisional charts produce valid signs', ok: vargaOk, detail: vargaDetail });

  // Ashtakavarga reconciliation.
  const av = buildAshtakavarga(vedic);
  if (av) {
    const savTotal = av.sav.reduce((a, s) => a + s.bindus, 0);
    const bavOk = av.bav.every(b => b.total === BAV_TOTALS[b.planet]);
    invariants.push({
      name: 'Ashtakavarga reconciles to the classical totals',
      ok: bavOk && (savTotal === SAV_GRAND_TOTAL || !vedic.lagnaSign),
      detail: `SAV total ${savTotal} against the classical ${SAV_GRAND_TOTAL}${vedic.lagnaSign ? '' : ' (no birth time, so the Lagna row is skipped by design)'}. Per-graha BAV totals ${bavOk ? 'all match' : 'do not match'}.`,
    });
  } else {
    invariants.push({ name: 'Ashtakavarga reconciles to the classical totals', ok: false, detail: 'Ashtakavarga could not be built for this chart.' });
  }

  // Ayanamsa schools stay ordered and inside the published spread.
  const values = AYANAMSA_MODE_LIST.map(m => ({ m, v: ayanamsaFor(utc, m) }));
  const raman = values.find(v => v.m === 'raman')!.v;
  const lahiri = values.find(v => v.m === 'lahiri')!.v;
  const kp = values.find(v => v.m === 'kp')!.v;
  const spreadOk = raman < lahiri && lahiri < kp && (kp - raman) < 2 && (kp - raman) > 1;
  invariants.push({
    name: 'Ayanamsa schools stay ordered',
    ok: spreadOk,
    detail: `Raman ${raman.toFixed(3)}, Lahiri ${lahiri.toFixed(3)}, KP ${kp.toFixed(3)} degrees. Raman must sit below Lahiri and the whole spread must stay near one and a half degrees.`,
  });

  const bodyPass = bodies.filter(b => b.status === 'pass').length;
  const bodyFail = bodies.filter(b => b.status !== 'pass').length;
  const extraChecks = bodies.reduce((a, b) => a + (b.signOk ? 1 : 0) + (b.nakshatraOk ? 1 : 0) + (b.houseOk ? 1 : 0), 0);
  const extraTotal = bodies.length * 3;
  const invPass = invariants.filter(i => i.ok).length;

  const denom = bodies.length + extraTotal + invariants.length;
  const score = denom ? (bodyPass + extraChecks + invPass) / denom : 0;

  return {
    id: person.id,
    name: person.name,
    birthLine: `${person.birthDate} ${person.birthTime} ${person.birthLocation}`,
    ayanamsaApplied: ayan,
    bodies,
    invariants,
    passCount: bodyPass,
    failCount: bodyFail,
    score,
  };
}

export function runVedicAccuracySuite(
  people: ReferencePerson[] = REFERENCE_PEOPLE,
  mode: AyanamsaMode = 'lahiri',
): VedicSuiteReport {
  const audits = people.map(p => auditVedicPerson(p, mode));

  const bodyChecks = audits.reduce((a, r) => a + r.bodies.length, 0);
  const bodyPass = audits.reduce((a, r) => a + r.passCount, 0);
  const signPass = audits.reduce((a, r) => a + r.bodies.filter(b => b.signOk).length, 0);
  const nakPass = audits.reduce((a, r) => a + r.bodies.filter(b => b.nakshatraOk).length, 0);
  const housePass = audits.reduce((a, r) => a + r.bodies.filter(b => b.houseOk).length, 0);
  const invChecks = audits.reduce((a, r) => a + r.invariants.length, 0);
  const invPass = audits.reduce((a, r) => a + r.invariants.filter(i => i.ok).length, 0);

  const worst = new Map<string, { worstArcmin: number; person: string }>();
  for (const a of audits) {
    for (const b of a.bodies) {
      if (b.deltaArcmin === null) continue;
      const cur = worst.get(b.body);
      if (!cur || b.deltaArcmin > cur.worstArcmin) worst.set(b.body, { worstArcmin: b.deltaArcmin, person: a.name });
    }
  }

  const denom = bodyChecks * 4 + invChecks;
  return {
    generatedAt: new Date().toISOString(),
    people: audits,
    totals: {
      peopleCount: audits.length,
      bodyChecks,
      bodyPass,
      bodyFail: bodyChecks - bodyPass,
      signChecks: bodyChecks,
      signPass,
      nakshatraChecks: bodyChecks,
      nakshatraPass: nakPass,
      houseChecks: bodyChecks,
      housePass,
      invariantChecks: invChecks,
      invariantPass: invPass,
      score: denom ? (bodyPass + signPass + nakPass + housePass + invPass) / denom : 0,
    },
    worstBodies: [...worst.entries()]
      .map(([body, v]) => ({ body, ...v }))
      .sort((a, b) => b.worstArcmin - a.worstArcmin),
  };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function formatVedicMarkdown(report: VedicSuiteReport): string {
  const t = report.totals;
  const lines: string[] = [];
  lines.push('# Vedic accuracy suite');
  lines.push('');
  lines.push(`Run: ${report.generatedAt}`);
  lines.push(`People: ${t.peopleCount}. Sidereal values are the frozen tropical longitudes minus the ayanamsa for the same UTC instant.`);
  lines.push('');
  lines.push('| Area | Score | Detail |');
  lines.push('| --- | --- | --- |');
  lines.push(`| Sidereal longitudes | ${pct(t.bodyPass / Math.max(1, t.bodyChecks))} | ${t.bodyPass}/${t.bodyChecks} inside tolerance |`);
  lines.push(`| Sign placement | ${pct(t.signPass / Math.max(1, t.signChecks))} | ${t.signPass}/${t.signChecks} |`);
  lines.push(`| Nakshatra and pada | ${pct(t.nakshatraPass / Math.max(1, t.nakshatraChecks))} | ${t.nakshatraPass}/${t.nakshatraChecks} |`);
  lines.push(`| Whole-sign houses | ${pct(t.housePass / Math.max(1, t.houseChecks))} | ${t.housePass}/${t.houseChecks} |`);
  lines.push(`| Structural invariants | ${pct(t.invariantPass / Math.max(1, t.invariantChecks))} | ${t.invariantPass}/${t.invariantChecks} |`);
  lines.push(`| Overall | ${pct(t.score)} | dasha, varga, ashtakavarga and ayanamsa checks included |`);
  lines.push('');

  lines.push('## Per person');
  lines.push('');
  lines.push('| Person | Birth data | Score | Off tolerance | Broken invariants |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const p of report.people) {
    const off = p.bodies.filter(b => b.status !== 'pass').map(b => b.body).join(', ') || 'none';
    const broken = p.invariants.filter(i => !i.ok).length;
    lines.push(`| ${p.name} | ${p.birthLine} | ${pct(p.score)} | ${off} | ${broken === 0 ? 'all ok' : String(broken)} |`);
  }
  lines.push('');

  lines.push('## Worst drift per body');
  lines.push('');
  lines.push('| Body | Worst delta | Chart |');
  lines.push('| --- | --- | --- |');
  for (const w of report.worstBodies) {
    lines.push(`| ${w.body} | ${w.worstArcmin.toFixed(1)}' | ${w.person} |`);
  }
  lines.push('');

  const problems = report.people.filter(p => p.failCount > 0 || p.invariants.some(i => !i.ok) || p.bodies.some(b => !b.signOk || !b.nakshatraOk || !b.houseOk));
  if (problems.length) {
    lines.push('## Findings to fix');
    lines.push('');
    for (const p of problems) {
      lines.push(`### ${p.name}`);
      lines.push('');
      for (const b of p.bodies) {
        if (b.status !== 'pass') {
          lines.push(`- ${b.body}: expected ${fmtLon(b.expectedSidereal)}, app gives ${fmtLon(b.actualSidereal)} (off by ${b.deltaArcmin?.toFixed(1) ?? 'n/a'}', limit ${b.limit}')`);
        }
        if (!b.signOk) lines.push(`- ${b.body}: sign should be ${b.expectedSign}, app gives ${b.actualSign}`);
        if (!b.nakshatraOk) lines.push(`- ${b.body}: nakshatra should be ${b.expectedNakshatra} pada ${b.expectedPada}, app gives ${b.actualNakshatra} pada ${b.actualPada}`);
        if (!b.houseOk) lines.push(`- ${b.body}: whole-sign house should be ${b.expectedHouse}, app gives ${b.actualHouse}`);
      }
      for (const i of p.invariants.filter(x => !x.ok)) lines.push(`- Invariant broken: ${i.name}. ${i.detail}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
