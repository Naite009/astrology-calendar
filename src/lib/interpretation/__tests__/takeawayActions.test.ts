import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { actionText, buildSummaryActions, buildTakeawayAction, type TakeawayCategory } from '../takeawayActions';
import { TryThisAction } from '@/components/TryThisAction';
import { generateNatalPortrait } from '@/lib/natalPortraitEngine';
import { buildStrengthContract } from '@/lib/soulStrengthContract';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildFullPdfDoc } from '@/lib/soulAgreementsExport';

const summary = {
  whatToPractice: 'Practice letting others help you and sharing your responsibilities, even when you know you could do it better yourself.',
  whatToWatchFor: "Watch for the tendency to over-analyze people's motives or use your intellect as a shield against feeling vulnerable.",
  whatToBuild: 'Build a sense of self-worth that is not entirely dependent on your productivity, discipline, or how well you manage crises.',
  whatToGive: 'Give people honest communication rather than making them guess what you want.',
  integration: 'Stay connected while setting clear boundaries.',
};

describe('theme-aware weekly Natal actions', () => {
  it('keeps the three requested mechanisms distinct and concrete', () => {
    const actions = buildSummaryActions(summary);
    expect(actions.whatToPractice?.category).toBe('sharing');
    expect(actionText(actions.whatToPractice ?? buildTakeawayAction(''))).toMatch(/Do not redo their part unless there is a real consequence/);
    expect(actions.whatToWatchFor?.category).toBe('motives');
    expect(actions.whatToWatchFor?.behaviors.join(' ')).toMatch(/what I know, what I am guessing/);
    expect(actions.whatToBuild?.category).toBe('selfWorth');
    expect(actions.whatToBuild?.behaviors).toHaveLength(3);
    expect(actions.whatToGive).toBeDefined();
    expect(actions.integration).toBeDefined();
  });

  it.each<[TakeawayCategory, string]>([
    ['relationships', 'Build mutual trust in close relationships'],
    ['boundaries', 'Set boundaries without an apology'],
    ['emotions', 'Name vulnerable feelings before reacting'],
    ['selfWorth', 'Build self-worth outside achievement'],
    ['communication', 'Speak clearly instead of expecting others to guess'],
    ['perfectionism', 'Watch for perfectionism and control'],
    ['rest', 'Make room for pleasure and play'],
    ['direction', 'Explore a new approach'],
  ])('selects %s actions from the takeaway, not identity', (category, pattern) => {
    const action = buildTakeawayAction(pattern);
    expect(action.category).toBe(category);
    expect(action.behaviors.length).toBeGreaterThanOrEqual(1);
    expect(action.behaviors.length).toBeLessThanOrEqual(3);
    expect(actionText(action)).toMatch(/this week/);
    expect(actionText(action)).not.toMatch(/be more vulnerable|work on self-worth|trust more|diagnos|trauma|destiny|—/i);
  });

  it('uses context only when the takeaway does not name a mechanism', () => {
    expect(buildTakeawayAction('Try another response', { context: 'Communication and speaking clearly' }).category).toBe('communication');
    expect(buildTakeawayAction('Rest this week', { context: 'Control and perfectionism' }).category).toBe('rest');
  });

  it('handles missing/old saved action fields and child wording', () => {
    expect(Object.keys(buildSummaryActions(summary))).toHaveLength(5);
    expect(buildSummaryActions({ whatToPractice: '' })).toEqual({});
    expect(actionText(buildTakeawayAction(summary.whatToPractice, { stage: 'child' }))).toMatch(/trusted adult/);
  });

  it('renders an accessible visible Try this label', () => {
    const html = renderToStaticMarkup(createElement(TryThisAction, { action: buildTakeawayAction(summary.whatToPractice) }));
    expect(html).toContain('Try this:');
    expect(html).toContain('Choose one task this week');
  });

  it('adds actions to all generated Natal advice and keeps chart inputs unchanged', () => {
    const chart = {
      id: 'action-fixture', name: 'Different client', birthDate: '1993-11-07', birthTime: '11:30', birthLocation: 'La Serena, Chile',
      planets: { Sun: { sign: 'Scorpio', degree: 15, minutes: 11 }, Moon: { sign: 'Leo', degree: 19, minutes: 23 }, Saturn: { sign: 'Aquarius', degree: 23, minutes: 43 }, Mercury: { sign: 'Scorpio', degree: 11, minutes: 50 }, Venus: { sign: 'Libra', degree: 28, minutes: 0 } },
      houseCusps: { house1: { sign: 'Capricorn', degree: 24, minutes: 5 } },
    } as unknown as NatalChart;
    const before = JSON.stringify(chart);
    const portrait = generateNatalPortrait(chart);
    for (const domain of [portrait.relationshipBlueprint, portrait.careerMoneyMap, portrait.emotionalArchitecture, portrait.healthVitality, portrait.shadowGrowth, portrait.spiritualKarmic]) expect(domain.tryThis?.behaviors.length).toBeGreaterThan(0);
    expect(portrait.importantAspects.every(a => a.tryThis)).toBe(true);
    expect(portrait.lifetimeWisdom.actions?.saturn).toBeDefined();
    expect(portrait.powerPortrait.tryThis).toBeDefined();
    expect(portrait.synthesis.tryThis).toBeDefined();
    expect(portrait.synthesis.dynamics.every(d => d.tryThis)).toBe(true);
    const contract = buildStrengthContract(chart, summary);
    expect(contract.actions?.howToUse).toHaveLength(contract.howToUse.length);
    expect(JSON.stringify(chart)).toBe(before);
  });

  it('includes the same behavioral actions in the full summary PDF without requiring regeneration', () => {
    const pdf = buildFullPdfDoc({ name: 'Test client' }, [], summary, {
      headline: 'Strength-Based Contract', coreStrength: 'You can finish a task.', strengths: [], howToUse: [], costWhenOverused: 'You may overwork.', commitment: 'I will stop at a planned time.',
    });
    const output = [...pdf.output().matchAll(/\(([^\n]*)\) Tj/g)].map(match => match[1]).join(' ');
    expect(output).toContain('Try this:');
    // PDF layout may wrap a sentence into separate text operations.
    expect(output).toContain('what I know');
    expect(output).toContain('what I am guessing');
    expect(output).toContain('achievement or usefulness');
  });
});