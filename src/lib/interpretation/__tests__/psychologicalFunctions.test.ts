import { describe, expect, it } from 'vitest';
import {
  PSYCHOLOGICAL_BODIES,
  getPsychologicalFunction,
  describeHouseEmphasis,
  getHouseArena,
  synthesizePsychologicalAspect,
} from '../psychologicalFunctions';

describe('psychological function library', () => {
  const vagueHousePhrases = /how you meet the world|region of life|life arena|comes up naturally|comes up in conversation|where this energy plays out|this part of life|activated|shows up strongly|themes around/i;

  it('gives all twelve houses concrete attention, conflict, outward signs, and a question', () => {
    for (let house = 1; house <= 12; house += 1) {
      const text = describeHouseEmphasis(house, ['Sun', 'Mercury', 'Venus'], { isStellium: true });
      expect(text).toMatch(/pay close attention/i);
      expect(text).toMatch(/repeating choice/i);
      expect(text).toMatch(/other people may notice/i);
      expect(text).toMatch(/question this house keeps asking/i);
      expect(text).toMatch(/Sun, Mercury, Venus/);
      expect(text).toMatch(/stellium/i);
      expect(text).not.toMatch(vagueHousePhrases);
      expect(getHouseArena(house)).not.toMatch(vagueHousePhrases);
    }
  });

  it('makes different houses describe materially different lived concerns', () => {
    expect(describeHouseEmphasis(1, ['Sun', 'Moon', 'Mercury'])).toMatch(/confidence|appearance|independent/i);
    expect(describeHouseEmphasis(6, ['Sun', 'Moon', 'Mercury'])).toMatch(/routines|work|standards|overwork/i);
    expect(describeHouseEmphasis(12, ['Sun', 'Moon', 'Mercury'])).toMatch(/solitude|hidden habits|private|alone/i);
  });
  it('covers every required body and angle', () => {
    expect(PSYCHOLOGICAL_BODIES).toEqual(expect.arrayContaining([
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus',
      'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'SouthNode', 'Ascendant', 'MC',
    ]));
    for (const body of PSYCHOLOGICAL_BODIES) {
      const definition = getPsychologicalFunction(body);
      expect(definition?.shortFunction).toBeTruthy();
      expect(definition?.psychologicalFunction).toBeTruthy();
      expect(definition?.healthyExpression).toBeTruthy();
      expect(definition?.protectiveOrShadowExpression).toBeTruthy();
      expect(definition?.questionsForReflection.length).toBeGreaterThan(0);
    }
  });

  it('reads Venus opposite Saturn as relational function meeting structure without determinism', () => {
    const reading = synthesizePsychologicalAspect({ bodyA: 'Venus', bodyB: 'Saturn', aspect: 'opposition' });
    const text = JSON.stringify(reading);
    expect(text).toMatch(/relating|bonding/i);
    expect(text).toMatch(/authority|structure|rules/i);
    expect(text).toMatch(/opposite poles|alternate|other people/i);
    expect(text).toMatch(/cannot identify a person or event/i);
    expect(text).not.toMatch(/your father caused|proves/i);
  });

  it('distinguishes Moon square Saturn from Venus square Saturn', () => {
    const moon = synthesizePsychologicalAspect({ bodyA: 'Moon', bodyB: 'Saturn', aspect: 'square' });
    const venus = synthesizePsychologicalAspect({ bodyA: 'Venus', bodyB: 'Saturn', aspect: 'square' });
    expect(moon.functionA).toMatch(/emotional regulation|security needs/i);
    expect(venus.functionA).toMatch(/relating|values|social bonding/i);
    expect(moon.reflectionQuestion).not.toBe(venus.reflectionQuestion);
  });

  it('distinguishes Mercury trine Jupiter from Mercury square Jupiter', () => {
    const trine = synthesizePsychologicalAspect({ bodyA: 'Mercury', bodyB: 'Jupiter', aspect: 'trine' });
    const square = synthesizePsychologicalAspect({ bodyA: 'Mercury', bodyB: 'Jupiter', aspect: 'square' });
    expect(trine.aspectDynamic).toMatch(/cooperate|without much resistance/i);
    expect(square.aspectDynamic).toMatch(/disagree|friction|pressure|problem-solving/i);
    expect(trine.reflectionQuestion).not.toBe(square.reflectionQuestion);
  });

  it('includes sign and house context', () => {
    const reading = synthesizePsychologicalAspect({
      bodyA: 'Mercury', bodyB: 'Jupiter', aspect: 'trine',
      signA: 'Capricorn', houseA: 3, signB: 'Virgo', houseB: 11,
    });
    expect(reading.signHouseContext).toMatch(/Mercury in Capricorn/);
    expect(reading.signHouseContext).toMatch(/House 3/);
    expect(reading.signHouseContext).toMatch(/Jupiter in Virgo/);
    expect(reading.signHouseContext).toMatch(/House 11/);
  });

  it('keeps child and teen Mars/Venus copy nonsexualized', () => {
    for (const stage of ['child', 'teen'] as const) {
      const reading = synthesizePsychologicalAspect({ bodyA: 'Venus', bodyB: 'Mars', aspect: 'square', stage });
      expect(JSON.stringify(reading)).not.toMatch(/sexual|erotic|libido/i);
    }
  });

  it('gives the requested high-value pairs distinct function-derived narratives', () => {
    const cases = [
      ['Venus', 'Saturn', 'opposition'],
      ['Moon', 'Saturn', 'square'],
      ['Mercury', 'Jupiter', 'trine'],
      ['Mars', 'Pluto', 'square'],
      ['Venus', 'Neptune', 'opposition'],
      ['Moon', 'Uranus', 'square'],
    ] as const;
    const readings = cases.map(([bodyA, bodyB, aspect]) => synthesizePsychologicalAspect({ bodyA, bodyB, aspect, orb: 1.5 }));
    expect(new Set(readings.map(r => r.title)).size).toBe(readings.length);
    expect(new Set(readings.map(r => r.aspectDynamic)).size).toBe(readings.length);
    expect(new Set(readings.map(r => r.watchFor)).size).toBe(readings.length);
    expect(readings[3].aspectDynamic).toMatch(/drive|intensity|power/i);
    expect(readings[4].aspectDynamic).toMatch(/pleasure|affection|ideal|blur/i);
    expect(readings[5].aspectDynamic).toMatch(/comfort|security|freedom|disruption/i);
  });

  it('does not reuse one generic square narrative across unrelated pairs', () => {
    const marsPluto = synthesizePsychologicalAspect({ bodyA: 'Mars', bodyB: 'Pluto', aspect: 'square' });
    const moonSaturn = synthesizePsychologicalAspect({ bodyA: 'Moon', bodyB: 'Saturn', aspect: 'square' });
    expect(marsPluto.title).not.toBe(moonSaturn.title);
    expect(marsPluto.aspectDynamic).not.toBe(moonSaturn.aspectDynamic);
    expect(marsPluto.howThisCanShowUp).not.toEqual(moonSaturn.howThisCanShowUp);
  });

  it('keeps every child and teen pairing free of adult-only language', () => {
    for (const stage of ['child', 'teen'] as const) {
      for (const body of PSYCHOLOGICAL_BODIES) {
        if (body === 'Saturn') continue;
        const reading = synthesizePsychologicalAspect({ bodyA: body, bodyB: 'Saturn', aspect: 'square', stage });
        expect(JSON.stringify(reading)).not.toMatch(/sexual|erotic|libido|spouse|marriage|mortgage|salary|dating history/i);
      }
    }
  });
});