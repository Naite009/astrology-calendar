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
        l.findings.filter((f) => f.rule === 'no-em-dash').map((f) => `${p.name} ${l.source}: ${f.excerpt}`),
      ),
    );
    expect(hits).toEqual([]);
  });

  it('has no writing errors anywhere', () => {
    const errors = report.people.flatMap((p) =>
      p.reading.lints.flatMap((l) =>
        l.findings.filter((f) => f.severity === 'error').map((f) => `${p.name} ${l.source} [${f.rule}] ${f.message}`),
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
