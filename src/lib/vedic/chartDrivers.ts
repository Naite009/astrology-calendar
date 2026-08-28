/**
 * The three things that actually run the chart.
 *
 * The Vedic tab produces a lot of material, and every card used to claim equal
 * importance. Classical practice does not work that way: a handful of factors
 * carry the chart and the rest colors it. This picks the small set that
 * matters, with the reason each one made the list, so the reader has somewhere
 * to start before the detail.
 *
 * Selection order, which is fixed rather than scored guesswork:
 *   1. The lagna lord, because it stands for the person.
 *   2. The Atmakaraka, the highest-degree graha, which Jaimini reads as the
 *      thing the life keeps returning to.
 *   3. The current mahadasha lord, because it owns the years you are in.
 * A fourth slot goes to the strongest or most strained graha when it is not
 * already listed, since that one tends to be felt whether or not it is asked for.
 */

import { VedicChart } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { PlanetCondition } from './strength';
import { KarakaAssignment } from './karakas';
import { CurrentDasha } from './vimshottariDasha';
import { housePlain } from './interpretations/plainMeaning';

export interface ChartDriver {
  role: 'Runs the chart' | 'Keeps coming back' | 'Owns these years' | 'Loudest right now';
  graha: VedicPlanet;
  /** Sign, house and condition in one line, so the claim is checkable. */
  placement: string;
  conditionIndex: number | null;
  band: PlanetCondition['band'] | null;
  /** Why this graha is on the list at all. */
  why: string;
  /** What to expect from it in behavior. */
  reads: string;
}

export interface ChartDriverGate {
  drivers: ChartDriver[];
  /** One short paragraph tying the three together. */
  summary: string;
  note: string;
}

export const DRIVER_GATE_NOTE =
  'Everything further down the tab is detail on top of these. If you only read one card, read this one: the rest of the page explains where these came from and what modifies them.';

const BAND_PLAIN: Record<PlanetCondition['band'], string> = {
  strong: 'in strong condition, so it does its job without much help',
  workable: 'in workable condition, so it delivers when you give it structure',
  strained: 'in strained condition, so it needs support rather than more demands',
};

const ROLE_READS: Record<ChartDriver['role'], (graha: VedicPlanet, house: number | null) => string> = {
  'Runs the chart': (g, h) => `Because ${g} rules your rising sign, your general condition tracks its condition. ${h ? `It works out of the area of ${housePlain(h)}, so that part of life is where you tend to build your sense of yourself.` : 'Its house needs an accurate birth time to place.'}`,
  'Keeps coming back': (g, h) => `${g} sits at the highest degree in your chart, which Jaimini reads as the theme the life keeps circling. ${h ? `It operates through ${housePlain(h)}, so that is usually where the same lesson turns up in different clothes.` : ''}`,
  'Owns these years': (g, h) => `You are in the ${g} mahadasha, so ${g} is currently setting the agenda regardless of how strong it looks in the chart. ${h ? `Its natal seat is ${housePlain(h)}, which is the department the period keeps pulling you toward.` : ''}`,
  'Loudest right now': (g, h) => `${g} stands out by condition, so it tends to be felt whether or not you are working on it. ${h ? `It shows up through ${housePlain(h)}.` : ''}`,
};

function line(chart: VedicChart, graha: VedicPlanet, cond?: PlanetCondition): string {
  const b = chart.byName[graha];
  if (!b) return `${graha}: not present in this chart`;
  const bits = [`${graha} in ${b.sign}`];
  if (b.house) bits.push(`house ${b.house}`);
  if (b.dignity !== 'neutral') bits.push(b.dignity);
  bits.push(b.nakshatra.name);
  if (cond) bits.push(`condition ${cond.index}/100`);
  return bits.join(' · ');
}

export function buildChartDrivers(
  chart: VedicChart,
  conditions: PlanetCondition[],
  karakas: KarakaAssignment[],
  current: CurrentDasha | null,
): ChartDriverGate | null {
  const byBody = new Map(conditions.map(c => [c.body, c]));
  const drivers: ChartDriver[] = [];
  const used = new Set<VedicPlanet>();

  const add = (role: ChartDriver['role'], graha: VedicPlanet | null | undefined, why: string) => {
    if (!graha || used.has(graha) || !chart.byName[graha]) return;
    const cond = byBody.get(graha);
    used.add(graha);
    drivers.push({
      role,
      graha,
      placement: line(chart, graha, cond),
      conditionIndex: cond?.index ?? null,
      band: cond?.band ?? null,
      why,
      reads: ROLE_READS[role](graha, chart.byName[graha]!.house),
    });
  };

  add(
    'Runs the chart',
    chart.lagnaLord,
    chart.lagnaSign
      ? `${chart.lagnaLord} rules ${chart.lagnaSign}, your rising sign, so it stands for you.`
      : 'Ruler of the rising sign.',
  );

  const ak = karakas.find(k => k.karaka === 'Atmakaraka');
  add('Keeps coming back', ak?.planet, 'Highest degree in the chart, which is the Jaimini definition of the Atmakaraka.');

  add(
    'Owns these years',
    current?.maha.lord,
    current ? `The ${current.maha.lord} mahadasha is the period you are living in now.` : 'Current mahadasha lord.',
  );

  if (drivers.length < 4 && conditions.length) {
    const notUsed = conditions.filter(c => !used.has(c.body));
    const strongest = notUsed[0];
    const weakest = notUsed[notUsed.length - 1];
    const pick = strongest && weakest
      ? (100 - strongest.index <= weakest.index ? strongest : weakest)
      : strongest || weakest;
    if (pick) {
      add(
        'Loudest right now',
        pick.body,
        pick.band === 'strained'
          ? `${pick.body} scores ${pick.index} out of 100 on condition, the most strained graha not already listed.`
          : `${pick.body} scores ${pick.index} out of 100 on condition, the strongest graha not already listed.`,
      );
    }
  }

  if (!drivers.length) return null;

  const summary = (() => {
    const names = drivers.map(d => d.graha);
    const strained = drivers.filter(d => d.band === 'strained').map(d => d.graha);
    const strong = drivers.filter(d => d.band === 'strong').map(d => d.graha);
    const parts: string[] = [];
    parts.push(
      `Your chart is mostly run by ${names.slice(0, 3).join(', ')}. ${drivers[0].graha} stands for you, ${drivers[1] ? `${drivers[1].graha} is the theme that keeps returning, ` : ''}${current ? `and ${current.maha.lord} owns the current stretch of years.` : 'and the current period sets the pace.'}`,
    );
    if (strong.length && strained.length) {
      parts.push(
        `${strong.join(' and ')} ${strong.length > 1 ? 'are' : 'is'} ${BAND_PLAIN.strong}, while ${strained.join(' and ')} ${strained.length > 1 ? 'are' : 'is'} ${BAND_PLAIN.strained}. That split is the working tension in the chart, and most of the detail below is a variation on it.`,
      );
    } else if (strained.length) {
      parts.push(`All of ${strained.join(' and ')} ${strained.length > 1 ? 'are' : 'is'} ${BAND_PLAIN.strained}, so the chart tends to reward slower plans and honest capacity over pushing.`);
    } else {
      parts.push('None of these are in poor condition, so the chart tends to respond to effort rather than needing repair first.');
    }
    return parts.join(' ');
  })();

  return { drivers, summary, note: DRIVER_GATE_NOTE };
}
