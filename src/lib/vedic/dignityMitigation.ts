/**
 * Dignity is never read in isolation in Jyotish.
 *
 * After a graha is found exalted or debilitated, classical practice asks a
 * second question: is that condition modified? For debility that means the
 * neecha bhanga conditions. For exaltation it means the qualifiers that can
 * limit an otherwise strong placement (dusthana lordship or occupation,
 * combustion, malefic glance, weak divisional support).
 *
 * Everything here is deterministic whole-sign logic. Nothing is estimated.
 *
 * The output is deliberately layered so the reader can see where astronomy
 * ends and interpretation begins:
 *   fact        the classical condition, stated as fact
 *   tradition   what the classical texts say the condition means, in general terms
 *   modern      this app's psychological reading, clearly marked as interpretation
 */

import { VedicChart, VedicBody } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { SIGN_LORDS, exaltationSign, signIndex } from './vedicDignity';
import { mutualDrishti, castsFrom } from './drishti';
import { VargaChart, isVargottama } from './divisionalCharts';

const KENDRA = [1, 4, 7, 10];
const DUSTHANA = [6, 8, 12];

/** Function each graha stands for, used for the traditional line. */
const SOLAR_FUNCTION: Record<VedicPlanet, string> = {
  Sun: 'autonomy, authority and self-definition',
  Moon: 'emotional steadiness, comfort and receptivity',
  Mars: 'drive, assertion and physical courage',
  Mercury: 'reasoning, speech and skill',
  Jupiter: 'expansion, teaching and belief',
  Venus: 'valuing, pleasure and relating',
  Saturn: 'structure, endurance and responsibility',
  Rahu: 'appetite for the unfamiliar',
  Ketu: 'detachment and prior mastery',
};

const MODERN_READING: Partial<Record<VedicPlanet, string>> = {
  Sun: 'weighing other people\u2019s reactions heavily before claiming authority',
  Moon: 'needing more deliberate self-soothing than most people assume is normal',
  Mars: 'holding anger in and acting only once it has built up',
  Mercury: 'thinking in images and impressions before it can be put into words',
  Jupiter: 'trusting proof over optimism, and building belief slowly',
  Venus: 'expressing care through usefulness rather than through romance',
  Saturn: 'taking on responsibility early and finding it hard to hand back',
  Rahu: 'chasing what is unfamiliar without a map for it',
  Ketu: 'walking away from things that others would keep fighting for',
};

export interface DignityAudit {
  planet: VedicPlanet;
  sign: string;
  house: number | null;
  dignity: 'exalted' | 'debilitated';
  /** The dispositor, i.e. the lord of the sign the graha sits in. */
  dispositor: VedicPlanet;
  dispositorLine: string;
  /** Conditions that cancel or soften a debility (neecha bhanga). */
  mitigations: string[];
  /** Conditions that limit an otherwise exalted graha. */
  qualifiers: string[];
  /** Divisional and other support notes. */
  support: string[];
  fact: string;
  tradition: string;
  modern: string;
  /** One-line net read, always hedged. */
  verdict: string;
}

function houseFrom(fromSign: string, targetSign: string): number | null {
  const a = signIndex(fromSign);
  const b = signIndex(targetSign);
  if (a === -1 || b === -1) return null;
  return ((b - a + 12) % 12) + 1;
}

function condition(chart: VedicChart, p: VedicPlanet): string {
  const b = chart.byName[p];
  if (!b) return `${p} is not on this chart`;
  const bits = [`${p} in ${b.sign}`];
  if (b.house) bits.push(`house ${b.house}`);
  if (b.dignity !== 'neutral') bits.push(b.dignity);
  if (b.retrograde) bits.push('retrograde');
  return bits.join(', ');
}

/**
 * Full dignity audit for every exalted or debilitated graha on the chart.
 * navamsa is optional; when supplied it adds divisional reinforcement notes.
 */
export function auditDignities(chart: VedicChart, navamsa?: VargaChart): DignityAudit[] {
  const out: DignityAudit[] = [];
  const moon = chart.byName.Moon;

  for (const body of chart.bodies) {
    if (body.dignity !== 'exalted' && body.dignity !== 'debilitated') continue;

    const dispositor = SIGN_LORDS[body.sign];
    const dispBody = dispositor ? chart.byName[dispositor] : undefined;

    const mitigations: string[] = [];
    const qualifiers: string[] = [];
    const support: string[] = [];

    // Dispositor condition, which matters in both directions.
    const dispHouseFromLagna = dispBody?.house ?? null;
    const dispHouseFromMoon = dispBody && moon ? houseFrom(moon.sign, dispBody.sign) : null;

    if (body.dignity === 'debilitated') {
      // Classical neecha bhanga conditions.
      if (dispBody && dispHouseFromLagna && KENDRA.includes(dispHouseFromLagna)) {
        mitigations.push(`${dispositor}, the lord of ${body.sign}, sits in house ${dispHouseFromLagna}, an angle from the lagna.`);
      }
      if (dispBody && dispHouseFromMoon && KENDRA.includes(dispHouseFromMoon)) {
        mitigations.push(`${dispositor}, the lord of ${body.sign}, is in an angle counted from the Moon (house ${dispHouseFromMoon} from the Moon).`);
      }
      const exaltLord = (Object.keys(SIGN_LORDS) as string[])
        .length > 0
        ? (['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as VedicPlanet[])
            .find(p => exaltationSign(p) === body.sign)
        : undefined;
      if (exaltLord) {
        const ex = chart.byName[exaltLord];
        const exHouse = ex?.house ?? null;
        const exFromMoon = ex && moon ? houseFrom(moon.sign, ex.sign) : null;
        if (ex && ((exHouse && KENDRA.includes(exHouse)) || (exFromMoon && KENDRA.includes(exFromMoon)))) {
          mitigations.push(`${exaltLord}, the graha exalted in ${body.sign}, sits in an angle${exHouse ? ` (house ${exHouse})` : ''}.`);
        }
      }
      if (dispBody && dispBody.sign === body.sign) {
        mitigations.push(`${dispositor} sits in the same sign as ${body.name}, so the sign lord and its occupant are together.`);
      }
      if (dispBody && mutualDrishti(body, dispBody)) {
        mitigations.push(`${body.name} and ${dispositor} glance at each other, which classically links them.`);
      }
      if (dispBody && chart.byName[body.name] && dispBody.sign !== body.sign) {
        const swapped = SIGN_LORDS[dispBody.sign] === body.name;
        if (swapped) mitigations.push(`${body.name} and ${dispositor} have exchanged signs (parivartana), a strong classical modifier.`);
      }
      if (body.house && KENDRA.includes(body.house)) {
        mitigations.push(`${body.name} itself sits in house ${body.house}, an angle, which some traditions count toward cancellation.`);
      }
      if (body.retrograde) {
        mitigations.push(`${body.name} is retrograde, which several classical authorities treat as adding strength (cheshta bala).`);
      }
      if (navamsa) {
        const n = navamsa.byName[body.name];
        if (n && (n.dignity === 'exalted' || n.dignity === 'own sign')) {
          support.push(`In the Navamsa (D9), ${body.name} recovers to ${n.dignity} in ${n.sign}, so the placement is stronger over time than it looks in the birth chart alone.`);
        } else if (n && n.dignity === 'debilitated') {
          support.push(`In the Navamsa (D9), ${body.name} is also debilitated, so the condition repeats rather than being offset.`);
        }
        if (isVargottama(chart, navamsa, body.name)) {
          support.push(`${body.name} is vargottama: the same sign in the birth chart and the Navamsa, which classically stabilises it.`);
        }
      }
    } else {
      // Exaltation qualifiers.
      if (body.house && DUSTHANA.includes(body.house)) {
        qualifiers.push(`It sits in house ${body.house}, one of the difficult houses, so the strength operates in a demanding area rather than an easy one.`);
      }
      const ruled = Object.entries(SIGN_LORDS)
        .filter(([, lord]) => lord === body.name)
        .map(([sign]) => sign);
      if (chart.lagnaSign) {
        const ruledHouses = ruled
          .map(s => houseFrom(chart.lagnaSign as string, s))
          .filter((n): n is number => !!n);
        const badLordship = ruledHouses.filter(n => DUSTHANA.includes(n));
        if (badLordship.length) {
          qualifiers.push(`${body.name} also rules house ${badLordship.join(' and ')}, so its strength carries those responsibilities with it.`);
        }
      }
      const malefics: VedicPlanet[] = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
      const glancers = malefics.filter(m => {
        const mb = chart.byName[m];
        if (!mb) return false;
        return castsFrom(chart, mb).some(d => d.sign === body.sign);
      });
      if (glancers.length) {
        qualifiers.push(`${glancers.join(' and ')} glance${glancers.length === 1 ? 's' : ''} at ${body.sign}, so the placement is pressured rather than untroubled.`);
      }
      const sun = chart.byName.Sun;
      if (sun && body.name !== 'Sun' && sun.sign === body.sign && Math.abs(sun.degree - body.degree) < 8) {
        qualifiers.push(`${body.name} is close to the Sun in the same sign, which classical texts read as combustion, dimming its independent expression.`);
      }
      if (navamsa) {
        const n = navamsa.byName[body.name];
        if (n && (n.dignity === 'exalted' || n.dignity === 'own sign')) {
          support.push(`The Navamsa (D9) confirms it: ${body.name} is ${n.dignity} there too, so the strength holds up under the finer chart.`);
        } else if (n && n.dignity === 'debilitated') {
          qualifiers.push(`In the Navamsa (D9), ${body.name} falls to debilitated, so the birth-chart strength is not matched at the finer level.`);
        }
        if (isVargottama(chart, navamsa, body.name)) {
          support.push(`${body.name} is vargottama, the same sign in the birth chart and the Navamsa, which is a genuine mark of durability.`);
        }
      }
    }

    const dispositorLine = dispBody
      ? `${body.sign} is ruled by ${dispositor}, and that ruler's own condition (${condition(chart, dispositor)}) is part of how this placement actually performs.`
      : `${body.sign} is ruled by ${dispositor}, which is not on this chart, so the dispositor check cannot be completed.`;

    const fact = body.dignity === 'debilitated'
      ? `${body.name} is placed in ${body.sign}, its sign of debilitation.`
      : `${body.name} is placed in ${body.sign}, its sign of exaltation.`;

    const tradition = body.dignity === 'debilitated'
      ? `Classical texts read this as ${SOLAR_FUNCTION[body.name]} requiring more conscious development than it would in a comfortable sign.`
      : `Classical texts read this as ${SOLAR_FUNCTION[body.name]} having unusually favourable conditions to work in.`;

    const modern = MODERN_READING[body.name]
      ? `This app's interpretation, which is interpretation rather than classical text: it may show up as ${MODERN_READING[body.name]}.`
      : 'This app offers no separate psychological reading for this graha beyond the classical statement above.';

    const verdict = body.dignity === 'debilitated'
      ? (mitigations.length
          ? `Modified debility. ${mitigations.length} classical cancellation condition${mitigations.length === 1 ? '' : 's'} apply${mitigations.length === 1 ? '' : ''} here, so this should not be read as a simple weakness.`
          : 'Unmodified by the cancellation conditions this app checks, so the classical reading stands as written, and the function is likely to develop through experience rather than arrive ready-made.')
      : (qualifiers.length
          ? `Qualified strength. The exaltation is real, but ${qualifiers.length} condition${qualifiers.length === 1 ? '' : 's'} here mean it does not operate unopposed.`
          : 'Clean exaltation by the checks this app runs, with no dusthana placement, malefic glance or combustion limiting it.');

    out.push({
      planet: body.name,
      sign: body.sign,
      house: body.house,
      dignity: body.dignity,
      dispositor,
      dispositorLine,
      mitigations,
      qualifiers,
      support,
      fact,
      tradition,
      modern,
      verdict,
    });
  }

  return out;
}

/** Compact one-line summary for the chart-logic boxes. */
export function dignityAuditLine(a: DignityAudit): string {
  const mod = a.dignity === 'debilitated'
    ? (a.mitigations.length ? `neecha bhanga conditions present (${a.mitigations.length})` : 'no cancellation conditions found')
    : (a.qualifiers.length ? `qualified (${a.qualifiers.length})` : 'unqualified');
  return `${a.planet} ${a.dignity} in ${a.sign}${a.house ? `, house ${a.house}` : ''}; dispositor ${a.dispositor}; ${mod}`;
}

/** Does a body have a modified debility? Used by prose to avoid overstating. */
export function debilityIsModified(audits: DignityAudit[], planet: VedicPlanet): boolean {
  const a = audits.find(x => x.planet === planet && x.dignity === 'debilitated');
  return !!a && a.mitigations.length > 0;
}

export type { VedicBody };
