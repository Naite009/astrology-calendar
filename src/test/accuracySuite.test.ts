/**
 * Automated accuracy suite.
 *
 * Runs 20 reference people through the app's own chart math and reading
 * engines, grades both, and writes a scorecard to qa-reports/accuracy.md.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runAccuracySuite, formatSuiteMarkdown, type SuiteReport } from '@/lib/qa/runAccuracySuite';
import { REFERENCE_PEOPLE } from './fixtures/referencePeople';
import { lintReading } from '@/lib/qa/readingLint';

let report: SuiteReport;

beforeAll(() => {
  report = runAccuracySuite();
  const dir = path.resolve(process.cwd(), 'qa-reports');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'accuracy.md'), formatSuiteMarkdown(report), 'utf8');
  fs.writeFileSync(path.join(dir, 'accuracy.json'), JSON.stringify(
    { ...report, people: report.people.map((p) => ({ ...p, math: { ...p.math, chart: undefined } })) },
    null,
    2,
  ), 'utf8');
  fs.appendFileSync(path.join(dir, 'accuracy.md'), semanticSection(), 'utf8');
}, 120000);

// ── End-to-end semantic integrity (chart math -> evidence map -> prose gate) ──
// Position math alone cannot catch readings that omit planets, invent aspects or
// overstate thin evidence, so every reference chart is also run through the
// Natal Portrait evidence map and the shared prose validator with planted errors.
import { buildChartStoryMap, PLANETS } from '@/lib/interpretation/chartStoryMap';
import { validatePersonReading, validationContextFor } from '@/lib/interpretation/personReadingValidator';
const SEM_NOW = new Date('2026-06-15T12:00:00Z');
function semanticChecks() {
  return report.people.map((p) => {
    const chart = p.math.chart!;
    const m = buildChartStoryMap(chart, { now: SEM_NOW });
    const ctx = validationContextFor(m);
    const missingPlanets = PLANETS.filter((b) => !m.chains.some((c) => c.bodies.includes(b)));
    const rulers = Object.keys(m.houseRulers).length;
    const chain = (b: string) => m.chains.find((c) => c.bodies.includes(b))!;
    const base = (howItWorks: string, evidenceIds?: string[]) => {
      const a = chain('Mercury'), b = chain('Saturn');
      const sig = { name: 'The Test', plainMeaning: 'She can look calm while working things out privately before she speaks up.', chainIds: [a.id, b.id], evidenceIds: evidenceIds ?? [a.steps[0], b.steps[0], a.steps[1] ?? b.steps[1]], howItWorks, inWork: 'x', inRelationships: 'x', underStress: 'x', tension: 'x', tensionEvidenceIds: m.tensions.filter((t) => t.mustAddress).map((t) => t.evidenceIds[t.evidenceIds.length - 1]), healthyExpression: 'x' };
      return validatePersonReading({ headline: 'x', centralTension: 'x', signatures: [sig, sig, sig], collisions: [], whenLost: 'x', whatSteadies: 'x', transitsNow: [], clientQuestions: ['?'] } as never, ctx);
    };
    const real = new Set(m.allowedAspects.map((a) => [a.a, a.b].sort().join('|')));
    const pair = PLANETS.flatMap((x) => PLANETS.map((y) => [x, y])).find(([x, y]) => x !== y && !real.has([x, y].sort().join('|')));
    const inventedCaught = !pair || base(`${pair[0]} square ${pair[1]} shapes her.`).some((e) => e.includes('not in the chart'));
    const sat = m.placements.Saturn;
    const purposeCaught = base(`Saturn in ${sat.sign} means she is here to change the world.`, [chain('Saturn').steps[0], chain('Saturn').steps[0], chain('Mercury').steps[0]]).length > 0;
    return { name: p.math.name, missingPlanets, rulers, angleAspects: m.allowedAspects.some((a) => ['Ascendant', 'Midheaven', 'Descendant', 'IC'].includes(a.a) || ['Ascendant', 'Midheaven', 'Descendant', 'IC'].includes(a.b)), inventedCaught, purposeCaught };
  });
}
function semanticSection() {
  const rows = semanticChecks();
  const ok = rows.filter((r) => !r.missingPlanets.length && r.rulers === 12 && r.inventedCaught && r.purposeCaught).length;
  return `\n## End-to-end semantic integrity\n\n${ok}/${rows.length} charts: all 10 planets have evidence chains, 12 house rulers, invented aspect rejected, single-placement life-purpose claim rejected. This checks the evidence map and prose gate, not live AI prose quality.\n\n| Person | Missing planets | House rulers | Angle aspects | Invented aspect caught | Purpose claim caught |\n| --- | --- | --- | --- | --- | --- |\n${rows.map((r) => `| ${r.name} | ${r.missingPlanets.join(', ') || 'none'} | ${r.rulers} | ${r.angleAspects ? 'yes' : 'none in orb'} | ${r.inventedCaught} | ${r.purposeCaught} |`).join('\n')}\n`;
}
describe('end-to-end semantic integrity', () => {
  it('every reference chart keeps all planets and rulers in the evidence map and the prose gate rejects planted errors', () => {
    const bad = semanticChecks().filter((r) => r.missingPlanets.length || r.rulers !== 12 || !r.inventedCaught || !r.purposeCaught);
    expect(bad).toEqual([]);
  }, 60000);
});

describe('reference fixture set', () => {
  it('covers 20 people with distinct timezone and hemisphere cases', () => {
    expect(REFERENCE_PEOPLE).toHaveLength(20);
    expect(new Set(REFERENCE_PEOPLE.map((p) => p.timezone)).size).toBeGreaterThanOrEqual(15);
    expect(REFERENCE_PEOPLE.some((p) => p.lat < 0)).toBe(true);
    expect(REFERENCE_PEOPLE.some((p) => p.utcOffsetHours % 1 !== 0)).toBe(true);
  });
});

describe('chart math against independent reference values', () => {
  it('resolves every timezone and daylight saving offset correctly', () => {
    const wrong = report.people.filter((p) => !p.math.timezone.ok);
    expect(wrong.map((p) => `${p.math.name}: ${p.math.timezone.detail}`)).toEqual([]);
  });

  it('places the Sun and Moon inside tolerance for every person', () => {
    const off = report.people.flatMap((p) =>
      p.math.bodies
        .filter((b) => ['Sun', 'Moon'].includes(b.body) && b.status !== 'pass')
        .map((b) => `${p.math.name} ${b.body}: ${b.deltaArcmin?.toFixed(1)}' off`),
    );
    expect(off).toEqual([]);
  });

  it('places every planet inside tolerance for every person', () => {
    const off = report.people.flatMap((p) =>
      p.math.bodies
        .filter((b) => b.status === 'fail' || b.status === 'missing')
        .map((b) => `${p.math.name} ${b.body}: ${b.status}, ${b.deltaArcmin?.toFixed(1) ?? '—'}' off`),
    );
    expect(off).toEqual([]);
  });

  it('holds every structural invariant', () => {
    const broken = report.people.flatMap((p) =>
      p.math.invariants.filter((i) => !i.ok).map((i) => `${p.math.name}: ${i.name} (${i.detail})`),
    );
    expect(broken).toEqual([]);
  });

  it('scores overall chart math at or above 95 percent', () => {
    expect(report.totals.mathScore).toBeGreaterThanOrEqual(0.95);
  });
});

describe('reading voice rules', () => {
  it('produces readings for every person', () => {
    expect(report.totals.readingBlocks).toBeGreaterThan(report.totals.peopleCount * 5);
  });

  it('never uses an em dash in generated copy', () => {
    const hits = report.people.flatMap((p) =>
      p.reading.lints.flatMap((l) =>
        l.findings.filter((f) => f.rule === 'no-em-dash').map((f) => `${p.math.name} ${l.source}: ${f.excerpt}`),
      ),
    );
    expect(hits).toEqual([]);
  });

  it('has no writing errors anywhere', () => {
    const errors = report.people.flatMap((p) =>
      p.reading.lints.flatMap((l) =>
        l.findings.filter((f) => f.severity === 'error').map((f) => `${p.math.name} ${l.source} [${f.rule}] ${f.message}`),
      ),
    );
    expect(errors).toEqual([]);
  });
});

describe('lint rules themselves', () => {
  it('catches the things it is supposed to catch', () => {
    const bad = lintReading(
      "Hey, you. This is a big one \u2014 you are Libra, people-pleasing and moody, and the mechanism will meet someone. undefined",
      'self-test',
    );
    const rules = bad.findings.map((f) => f.rule);
    expect(rules).toContain('no-em-dash');
    expect(rules).toContain('no-chitchat-opener');
    expect(rules).toContain('no-vague-labels');
    expect(rules).toContain('no-placeholder-leak');
    expect(bad.errorCount).toBeGreaterThan(0);
  });

  it('passes clean copy', () => {
    const good = lintReading(
      'Saturn sits in your 10th house, so work is where the pressure lands. You may take on more than you can carry, then resent the people who let you. Say what your limit is before the week starts.',
      'self-test',
    );
    expect(good.errorCount).toBe(0);
  });
});
