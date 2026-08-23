/**
 * The accuracy suite: runs all 20 reference people through the chart math and
 * through the reading engines, then scores both.
 *
 * Math is graded against frozen independent values. Copy is graded against the
 * house writing rules. Both halves are reported per person and in total.
 */

import { auditPersonMath, formatArcmin, formatLongitude, type PersonMathAudit } from './accuracyAudit';
import { lintReading, LINT_RULES, type LintResult } from './readingLint';
import { REFERENCE_PEOPLE, type ReferencePerson } from '@/test/fixtures/referencePeople';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildPersonalDailyGuidance } from '../personalDailyGuidance';
import { buildPersonalMercuryRxSentence } from '../mercuryRetroPersonal';
import { synthesizePlanet } from '../planetSynthesis';
import {
  computeAspects,
  computeDignity,
  toAbsoluteDegree,
  type ChartPlanet,
} from '../chartDecoderLogic';
import { calculateNatalChart } from '../astrology';

/** Fixed sky moment so the suite is reproducible run to run. */
export const AUDIT_SKY_DATE = '2026-06-15';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const lonOf = (p?: { sign?: string; degree?: number; minutes?: number } | null): number | null => {
  const i = p?.sign ? SIGNS.indexOf(p.sign) : -1;
  if (i < 0) return null;
  return i * 30 + (p!.degree || 0) + (p!.minutes || 0) / 60;
};

/** Which house a longitude falls in, from the chart's own cusps. */
const houseOf = (chart: NatalChart, lon: number | null): number | null => {
  if (lon === null || !chart.houseCusps) return null;
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = lonOf((chart.houseCusps as Record<string, { sign: string; degree: number; minutes: number }>)[`house${i}`]);
    if (c === null) return null;
    cusps.push(c);
  }
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const span = ((end - start) % 360 + 360) % 360;
    const from = ((lon - start) % 360 + 360) % 360;
    if (from < span) return i + 1;
  }
  return null;
};

const MAJOR = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

const toChartPlanets = (chart: NatalChart): ChartPlanet[] => {
  const out: ChartPlanet[] = [];
  for (const name of [...MAJOR, 'Ascendant']) {
    const p = (chart.planets as Record<string, { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined>)[name];
    if (!p?.sign) continue;
    out.push({
      name: name === 'Ascendant' ? 'Ascendant' : name,
      sign: p.sign,
      degree: (p.degree || 0) + (p.minutes || 0) / 60,
      retrograde: !!p.isRetrograde,
      house: houseOf(chart, lonOf(p)),
    });
  }
  return out;
};

export interface PersonReadingAudit {
  id: string;
  name: string;
  lints: LintResult[];
  errorCount: number;
  warningCount: number;
  score: number;
}

export interface PersonReport {
  math: PersonMathAudit;
  reading: PersonReadingAudit;
}

export interface SuiteReport {
  generatedAt: string;
  skyDate: string;
  people: PersonReport[];
  totals: {
    peopleCount: number;
    bodyChecks: number;
    bodyPass: number;
    bodyClose: number;
    bodyFail: number;
    invariantChecks: number;
    invariantPass: number;
    mathScore: number;
    readingBlocks: number;
    lintErrors: number;
    lintWarnings: number;
    readingScore: number;
    rulesChecked: number;
  };
  ruleBreakdown: Array<{ rule: string; hits: number; severity: 'error' | 'warning' }>;
}

/** The transiting sky used for the daily-guidance readings. */
export function auditSky(): { moonSign: string; moonDegree: number; moonMinutes: number; mercurySign: string } {
  const sky = calculateNatalChart(AUDIT_SKY_DATE, '12:00', 0, 'London, UK') as Record<
    string,
    { sign: string; degree: number; minutes: number }
  >;
  return {
    moonSign: sky.Moon?.sign ?? 'Aries',
    moonDegree: sky.Moon?.degree ?? 0,
    moonMinutes: sky.Moon?.minutes ?? 0,
    mercurySign: sky.Mercury?.sign ?? 'Gemini',
  };
}

/** Generate the copy blocks the suite grades for one person. */
export function generateReadingBlocks(
  person: ReferencePerson,
  chart: NatalChart,
): Array<{ source: string; text: string }> {
  const sky = auditSky();
  const blocks: Array<{ source: string; text: string }> = [];

  const daily = buildPersonalDailyGuidance({
    moonSign: sky.moonSign,
    moonDegree: sky.moonDegree,
    moonMinutes: sky.moonMinutes,
    moonPhaseName: 'First Quarter',
    isBalsamic: false,
    chart,
  });
  blocks.push({ source: 'personalDailyGuidance.reflection', text: daily.reflection });
  blocks.push({ source: 'personalDailyGuidance.journalPrompt', text: daily.journalPrompt });

  blocks.push({
    source: 'mercuryRetroPersonal',
    text: buildPersonalMercuryRxSentence(chart, sky.mercurySign),
  });

  const planets = toChartPlanets(chart);
  const aspects = computeAspects(planets);
  for (const planet of planets) {
    if (planet.name === 'Ascendant') continue;
    const dignity = computeDignity(planet.name, planet.sign, true);
    const s = synthesizePlanet(planet, aspects, dignity);
    blocks.push({
      source: `planetSynthesis.${planet.name}`,
      text: [s.look, s.tension, s.help].filter(Boolean).join(' '),
    });
  }

  // Keep the absolute-degree helper honest while we are here.
  void toAbsoluteDegree(planets[0]?.sign ?? 'Aries', planets[0]?.degree ?? 0);
  void person;

  return blocks;
}

/** Run the whole suite. Pure computation, no network. */
export function runAccuracySuite(people: ReferencePerson[] = REFERENCE_PEOPLE): SuiteReport {
  const reports: PersonReport[] = [];
  const ruleHits = new Map<string, { hits: number; severity: 'error' | 'warning' }>();

  for (const person of people) {
    const math = auditPersonMath(person);
    const blocks = generateReadingBlocks(person, math.chart);
    const lints = blocks.map((b) => lintReading(b.text, b.source, { name: person.name }));

    for (const lint of lints) {
      for (const f of lint.findings) {
        const cur = ruleHits.get(f.rule) ?? { hits: 0, severity: f.severity };
        cur.hits += 1;
        ruleHits.set(f.rule, cur);
      }
    }

    const errorCount = lints.reduce((a, l) => a + l.errorCount, 0);
    const warningCount = lints.reduce((a, l) => a + l.warningCount, 0);
    reports.push({
      math,
      reading: {
        id: person.id,
        name: person.name,
        lints,
        errorCount,
        warningCount,
        score: lints.length ? lints.reduce((a, l) => a + l.score, 0) / lints.length : 1,
      },
    });
  }

  const bodyChecks = reports.reduce((a, r) => a + r.math.bodies.length, 0);
  const bodyPass = reports.reduce((a, r) => a + r.math.passCount, 0);
  const bodyClose = reports.reduce((a, r) => a + r.math.closeCount, 0);
  const bodyFail = reports.reduce((a, r) => a + r.math.failCount, 0);
  const invariantChecks = reports.reduce((a, r) => a + r.math.invariants.length, 0);
  const invariantPass = reports.reduce((a, r) => a + r.math.invariants.filter((i) => i.ok).length, 0);
  const readingBlocks = reports.reduce((a, r) => a + r.reading.lints.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    skyDate: AUDIT_SKY_DATE,
    people: reports,
    totals: {
      peopleCount: reports.length,
      bodyChecks,
      bodyPass,
      bodyClose,
      bodyFail,
      invariantChecks,
      invariantPass,
      mathScore: bodyChecks + invariantChecks
        ? (bodyPass + bodyClose * 0.5 + invariantPass) / (bodyChecks + invariantChecks)
        : 0,
      readingBlocks,
      lintErrors: reports.reduce((a, r) => a + r.reading.errorCount, 0),
      lintWarnings: reports.reduce((a, r) => a + r.reading.warningCount, 0),
      readingScore: reports.length ? reports.reduce((a, r) => a + r.reading.score, 0) / reports.length : 1,
      rulesChecked: LINT_RULES.length,
    },
    ruleBreakdown: [...ruleHits.entries()]
      .map(([rule, v]) => ({ rule, hits: v.hits, severity: v.severity }))
      .sort((a, b) => b.hits - a.hits),
  };
}

const pct = (v: number): string => `${(v * 100).toFixed(1)}%`;

/** Markdown scorecard, for the terminal or a saved report. */
export function formatSuiteMarkdown(report: SuiteReport): string {
  const t = report.totals;
  const lines: string[] = [];
  lines.push('# Accuracy suite');
  lines.push('');
  lines.push(`Run: ${report.generatedAt}`);
  lines.push(`People: ${t.peopleCount} | Sky moment for readings: ${report.skyDate}`);
  lines.push('');
  lines.push('## Headline');
  lines.push('');
  lines.push('| Area | Score | Detail |');
  lines.push('| --- | --- | --- |');
  lines.push(`| Chart math | ${pct(t.mathScore)} | ${t.bodyPass}/${t.bodyChecks} positions inside tolerance, ${t.bodyClose} close, ${t.bodyFail} off |`);
  lines.push(`| Structural invariants | ${pct(t.invariantPass / Math.max(1, t.invariantChecks))} | ${t.invariantPass}/${t.invariantChecks} held |`);
  lines.push(`| Reading voice | ${pct(t.readingScore)} | ${t.lintErrors} errors, ${t.lintWarnings} warnings across ${t.readingBlocks} blocks, ${t.rulesChecked} rules |`);
  lines.push('');

  lines.push('## Per person');
  lines.push('');
  lines.push('| Person | Birth data | Math | Positions off | Invariants | Reading errors |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const r of report.people) {
    const off = r.math.bodies
      .filter((b) => b.status === 'fail' || b.status === 'missing')
      .map((b) => `${b.body} ${formatArcmin(b.deltaArcmin)}`)
      .join(', ');
    const badInv = r.math.invariants.filter((i) => !i.ok).length;
    lines.push(
      `| ${r.math.name} | ${r.math.birthLine} | ${pct(r.math.score)} | ${off || 'none'} | ${badInv === 0 ? 'all ok' : `${badInv} broken`} | ${r.reading.errorCount} |`,
    );
  }
  lines.push('');

  if (report.ruleBreakdown.length) {
    lines.push('## Writing rules triggered');
    lines.push('');
    lines.push('| Rule | Severity | Hits |');
    lines.push('| --- | --- | --- |');
    for (const r of report.ruleBreakdown) lines.push(`| ${r.rule} | ${r.severity} | ${r.hits} |`);
    lines.push('');
  }

  const problems = report.people.filter(
    (r) => r.math.failCount > 0 || r.math.invariants.some((i) => !i.ok) || r.reading.errorCount > 0,
  );
  if (problems.length) {
    lines.push('## Findings to fix');
    lines.push('');
    for (const r of problems) {
      lines.push(`### ${r.math.name}`);
      lines.push('');
      for (const b of r.math.bodies.filter((x) => x.status === 'fail' || x.status === 'missing')) {
        lines.push(
          `- ${b.body}: expected ${formatLongitude(b.expected)}, app gives ${formatLongitude(b.actual)} (off by ${formatArcmin(b.deltaArcmin)}, limit ${b.limit}')${b.note ? `. ${b.note}` : ''}`,
        );
      }
      for (const i of r.math.invariants.filter((x) => !x.ok)) {
        lines.push(`- Invariant broken: ${i.name}. ${i.detail}`);
      }
      for (const l of r.reading.lints) {
        for (const f of l.findings.filter((x) => x.severity === 'error')) {
          lines.push(`- ${l.source}: [${f.rule}] ${f.message} "${f.excerpt}"`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
