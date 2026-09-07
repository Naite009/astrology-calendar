/**
 * Regression coverage for the shared interpretation standard.
 *
 * Three layers are locked down here:
 *  1. The standard text itself still contains every required rule.
 *  2. Every AI edge function that writes about a person inherits it.
 *  3. The deterministic guard catches the phrasings the standard forbids and
 *     leaves compliant copy alone.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  INTERPRETATION_STANDARD,
  INTERPRETATION_OUTPUT_STRUCTURE,
  INTERPRETATION_REQUIREMENTS,
  auditInterpretationStandard,
  withInterpretationStandard,
  INTERPRETATION_SECTION_ORDER,
} from '@/lib/interpretation';
import { lintInterpretiveText } from '@/lib/interpretation/interpretationGuard';
import { lintReading } from '@/lib/qa/readingLint';

const ROOT = process.cwd();
const FUNCTIONS_DIR = path.join(ROOT, 'supabase', 'functions');

/** Every edge function that produces interpretive text about a person. */
const INTERPRETIVE_FUNCTIONS = [
  'analyze-health-symptom', 'ask-astrology', 'ask-sky-today', 'cosmic-weather',
  'cosmic-weather-collective', 'cosmic-weather-email', 'cosmic-weather-what-matters',
  'family-pair-reading', 'family-system-reading', 'find-lunar-theme',
  'generate-hd-narrative', 'generate-intentions', 'generate-narrative',
  'generate-sr-ai-reading', 'generate-sr-narrative', 'interpret-cards',
  'interpret-hexagram', 'interpret-tarot-spread', 'soul-agreements',
  'your-weather-today',
];

/** Data-extraction / plumbing functions that must NOT be forced to carry it. */
const NON_INTERPRETIVE_FUNCTIONS = [
  'parse-chart-image', 'parse-hd-chart', 'extract-document-text', 'get-document',
  'send-daily-emails', 'gate-probe',
];

describe('the standard text', () => {
  it('contains every required rule', () => {
    const audit = auditInterpretationStandard(INTERPRETATION_STANDARD);
    expect(audit.missing.map(m => m.id)).toEqual([]);
    expect(audit.ok).toBe(true);
  });

  it('names each requirement exactly once so none can be quietly dropped', () => {
    for (const req of INTERPRETATION_REQUIREMENTS) {
      expect(req.pattern.test(INTERPRETATION_STANDARD), req.id).toBe(true);
    }
  });

  it('explicitly prohibits unsupported pathology and trauma claims', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/never turn ordinary astrological tension into pathology/i);
    expect(INTERPRETATION_STANDARD).toMatch(/trauma, abuse, addiction, neurodivergence, mental illness/i);
    expect(INTERPRETATION_STANDARD).toMatch(/narcissistic, manipulative, abusive, toxic, obsessive, controlling, or deceptive/i);
    expect(INTERPRETATION_STANDARD).toMatch(/only reference such context if the user explicitly supplied it/i);
  });

  it('requires chart-factor grounding', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/traceable to a specific placement, aspect, house, dignity, or pattern/i);
    expect(INTERPRETATION_STANDARD).toMatch(/No free-floating personality claims/i);
  });

  it('requires constructive-first phrasing', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/describe the functional, working expression of a placement BEFORE any challenge/);
  });

  it('requires synthesis from multiple placements instead of isolated labels', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/combine them into one pattern and explain why the combination matters/i);
    expect(INTERPRETATION_STANDARD).toMatch(/never reduce a whole person to their Sun sign, Moon sign, rising sign, one aspect, or one house/i);
    expect(INTERPRETATION_STANDARD).toMatch(/One isolated placement cannot carry a sweeping conclusion/i);
  });

  it('bans deterministic wording but allows it for calculations', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/no "this means you will", "you are destined to", "this guarantees"/i);
    expect(INTERPRETATION_STANDARD).toMatch(/allowed only when describing an astronomical calculation/i);
  });

  it('keeps the four interpretive levels and the teaching layer', () => {
    expect(INTERPRETATION_STANDARD).toMatch(/core temperament or baseline pattern; context-dependent expression; possible shadow or growth edge; mature or integrated expression/i);
    expect(INTERPRETATION_STANDARD).toMatch(/name the exact placements and aspects that produced each statement/i);
  });

  it('has a full-chart structure with all nine sections and a synthesis bar', () => {
    for (const label of [
      'Core temperament', 'Emotional style', 'Communication and thinking',
      'Relationships and connection', 'Motivation and drive',
      'Strengths and natural assets', 'Growth edges', 'Integrated or mature expression',
      'Final synthesis',
    ]) {
      expect(INTERPRETATION_OUTPUT_STRUCTURE).toContain(label);
    }
    expect(INTERPRETATION_OUTPUT_STRUCTURE).toMatch(/FINAL SYNTHESIS BAR/);
    expect(INTERPRETATION_OUTPUT_STRUCTURE).toMatch(/at least three independent chart factors/);
    expect(INTERPRETATION_OUTPUT_STRUCTURE).toMatch(/never copy these words or traits/);
  });

  it('keeps the client section order aligned with the prompt structure', () => {
    expect(INTERPRETATION_SECTION_ORDER).toHaveLength(9);
    expect(INTERPRETATION_SECTION_ORDER[0].key).toBe('core_temperament');
    expect(INTERPRETATION_SECTION_ORDER[8].key).toBe('synthesis');
  });
});

describe('withInterpretationStandard', () => {
  it('appends the standard after the feature prompt so the standard wins', () => {
    const out = withInterpretationStandard('You write daily weather.');
    expect(out.indexOf('You write daily weather.')).toBeLessThan(out.indexOf('INTERPRETATION STANDARD'));
    expect(auditInterpretationStandard(out).ok).toBe(true);
  });

  it('only adds the full-chart structure when asked', () => {
    expect(auditInterpretationStandard(withInterpretationStandard('x')).hasOutputStructure).toBe(false);
    expect(auditInterpretationStandard(withInterpretationStandard('x', { fullChart: true })).hasOutputStructure).toBe(true);
  });

  it('keeps feature-specific extras', () => {
    expect(withInterpretationStandard('x', { extra: 'Return JSON only.' })).toMatch(/Return JSON only\.$/);
  });

  it('reports missing requirements for a prompt that never inherited the standard', () => {
    const audit = auditInterpretationStandard('You are an astrologer. Be insightful.');
    expect(audit.ok).toBe(false);
    expect(audit.missing.length).toBe(INTERPRETATION_REQUIREMENTS.length);
  });
});

describe('every interpretive edge function inherits the standard', () => {
  for (const name of INTERPRETIVE_FUNCTIONS) {
    it(`${name} imports and applies it`, () => {
      const src = fs.readFileSync(path.join(FUNCTIONS_DIR, name, 'index.ts'), 'utf8');
      expect(src).toContain('../_shared/interpretationStandard.ts');
      expect(src).toMatch(/withInterpretationStandard\(/);
    });
  }

  it('does not force it onto extraction or plumbing functions', () => {
    for (const name of NON_INTERPRETIVE_FUNCTIONS) {
      const file = path.join(FUNCTIONS_DIR, name, 'index.ts');
      if (!fs.existsSync(file)) continue;
      expect(fs.readFileSync(file, 'utf8')).not.toContain('withInterpretationStandard');
    }
  });

  it('leaves no interpretive function calling a model with a bare system prompt', () => {
    for (const name of INTERPRETIVE_FUNCTIONS) {
      const src = fs.readFileSync(path.join(FUNCTIONS_DIR, name, 'index.ts'), 'utf8');
      const bare = [...src.matchAll(/role:\s*"system",\s*content:\s*([A-Za-z_$][\w$]*)/g)]
        .map(m => m[1])
        .filter(v => v !== 'withInterpretationStandard');
      expect(bare, `${name} has an unwrapped system prompt`).toEqual([]);
    }
  });
});

describe('deterministic output guard', () => {
  const grounded = [
    'She tends to think things through before speaking, which comes from Mercury in Capricorn in the 3rd house, the part of the chart about everyday communication.',
    'Under pressure she may over-analyze when a decision feels unclear, especially with Saturn square that Mercury.',
    'At its most mature, the same caution reads as reliable judgment people lean on.',
  ].join(' ');

  it('passes grounded, tendency-phrased copy', () => {
    const res = lintInterpretiveText(grounded, { requireChartFactors: true });
    expect(res.findings).toEqual([]);
    expect(res.ok).toBe(true);
  });

  it('flags diagnosis labels as errors', () => {
    const res = lintInterpretiveText('You are controlling and you are manipulative in relationships.');
    expect(res.findings.some(f => f.category === 'pathology' && f.severity === 'error')).toBe(true);
  });

  it('flags inferred trauma and abuse history', () => {
    expect(lintInterpretiveText('This points to childhood trauma around belonging.').errorCount).toBeGreaterThan(0);
    expect(lintInterpretiveText('You were abandoned early in life.').errorCount).toBeGreaterThan(0);
    expect(lintInterpretiveText('Your chart proves trauma.').errorCount).toBeGreaterThan(0);
  });

  it('flags deterministic promises', () => {
    expect(lintInterpretiveText('You are destined to marry late.').findings.some(f => f.category === 'determinism')).toBe(true);
    expect(lintInterpretiveText('This means you will lose the job.').errorCount).toBeGreaterThan(0);
    expect(lintInterpretiveText('You never feel safe in a group.').findings.some(f => f.category === 'determinism')).toBe(true);
  });

  it('flags identity-essentializing wording', () => {
    expect(lintInterpretiveText('This is just who you are.').findings.some(f => f.category === 'essentializing')).toBe(true);
  });

  it('flags generic filler with no chart factor attached', () => {
    expect(lintInterpretiveText('You are very intuitive.').findings.some(f => f.category === 'filler')).toBe(true);
  });

  it('accepts the same trait when a chart factor supports it in the sentence', () => {
    const ok = lintInterpretiveText('You are very intuitive because Moon conjunct Neptune sits right on the Ascendant.');
    expect(ok.findings.some(f => f.category === 'filler')).toBe(false);
  });

  it('flags flattening a person to one sign', () => {
    expect(lintInterpretiveText('As a Scorpio, you are always suspicious.').findings.some(f => f.category === 'flattening')).toBe(true);
  });

  it('flags an emphatic claim with no factor in the sentence', () => {
    expect(lintInterpretiveText('She is profoundly guarded.').findings.some(f => f.category === 'unsupported_claim')).toBe(true);
  });

  it('errors when a long interpretation names no chart factor at all', () => {
    const vague = 'You tend to hold back at first and then commit fully. '.repeat(6);
    expect(lintInterpretiveText(vague, { requireChartFactors: true }).errorCount).toBeGreaterThan(0);
    expect(lintInterpretiveText(vague).errorCount).toBe(0);
  });
});

describe('QA reading lint inherits the standard rules', () => {
  it('reports pathology through the shared category name', () => {
    const res = lintReading('You are abusive when Mars is triggered.', 'test');
    expect(res.findings.some(f => f.rule === 'interpretation-standard:pathology')).toBe(true);
    expect(res.errorCount).toBeGreaterThan(0);
  });

  it('does not penalize compliant copy', () => {
    const res = lintReading(
      'You tend to plan before you move, which fits Mercury in Capricorn in the 3rd house, the everyday-thinking part of the chart. Under stress you may double-check things that were already fine.',
      'test',
    );
    expect(res.findings.filter(f => f.rule.startsWith('interpretation-standard'))).toEqual([]);
  });
});
