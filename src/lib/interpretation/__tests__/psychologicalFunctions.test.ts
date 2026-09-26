import { describe, expect, it } from 'vitest';
import {
  PSYCHOLOGICAL_BODIES,
  getPsychologicalFunction,
  synthesizePsychologicalAspect,
} from '../psychologicalFunctions';

describe('psychological function library', () => {
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
    expect(trine.aspectDynamic).toMatch(/cooperate easily/i);
    expect(square.aspectDynamic).toMatch(/friction|problem-solving/i);
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
});