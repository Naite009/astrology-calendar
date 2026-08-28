/**
 * Dasha read together with gochara, which is how Jyotish actually judges timing.
 *
 * A period says what the years are about. A transit says whether this month
 * cooperates. Read apart they contradict each other constantly, which is why
 * classical practice reads them as one statement: the dasha lord's own transit
 * matters most, the antardasha lord's transit sets the near-term tone, and a
 * slow transit that has nothing to do with the running period is background.
 *
 * Nothing here predicts events. It describes what the current combination
 * tends to make easy and what it tends to make expensive.
 */

import { VedicChart } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { CurrentDasha, formatDashaRange } from './vimshottariDasha';
import { GocharaReport, GocharaTransit } from './gochara';
import { PlanetCondition } from './strength';
import { housePlain } from './interpretations/plainMeaning';

export interface DashaTransitLine {
  label: string;
  graha: VedicPlanet;
  transit: GocharaTransit | null;
  /** How much weight this line carries in the read. */
  weight: 'primary' | 'secondary' | 'background';
  plain: string;
}

export interface DashaGocharaSynthesis {
  headline: string;
  lines: DashaTransitLine[];
  /** The combined read, two or three sentences. */
  verdict: string;
  /** What the combination makes easy right now. */
  worksNow: string[];
  /** What it makes expensive right now. */
  costsNow: string[];
  note: string;
}

export const DASHA_GOCHARA_NOTE =
  'Timing in Jyotish is a two-key system. The dasha says which subject the years are teaching, and the transit says whether the room is cooperating today. A strong transit inside an unrelated period usually passes without much trace, and a modest transit belonging to the running period can be the thing you remember. This card reads the two together rather than side by side.';

const AGENDA: Record<VedicPlanet, string> = {
  Sun: 'standing, authority and being seen doing the thing rather than assisting with it',
  Moon: 'home, care, emotional maintenance and the people you feel responsible for',
  Mars: 'effort, conflict, property and finishing things that need force',
  Mercury: 'communication, trade, paperwork, learning and negotiation',
  Jupiter: 'growth, teaching, advice, children and the widening of your options',
  Venus: 'relationship, comfort, money spent on quality and anything to do with taste',
  Saturn: 'structure, endurance, obligation and the slow building of something that lasts',
  Rahu: 'appetite, unfamiliar territory, ambition and the areas you have no template for',
  Ketu: 'reduction, letting go, specialised skill and losing interest in what used to hold you',
};

function transitFor(report: GocharaReport, graha: VedicPlanet): GocharaTransit | null {
  if (report.dashaLordTransit?.graha === graha) return report.dashaLordTransit;
  if (report.moonToday?.graha === graha) return report.moonToday;
  return report.transits.find(t => t.graha === graha) || null;
}

function verdictWord(t: GocharaTransit | null): string {
  if (!t) return 'not currently visible in the slow sky';
  return t.netVerdict === 'works'
    ? 'currently in a position that supports action'
    : t.netVerdict === 'maintenance'
      ? 'currently in a position that asks for upkeep rather than launch'
      : 'currently in a genuinely mixed position';
}

export function buildDashaGocharaSynthesis(
  chart: VedicChart,
  current: CurrentDasha | null,
  gochara: GocharaReport | null,
  conditions: PlanetCondition[],
): DashaGocharaSynthesis | null {
  if (!current || !gochara) return null;

  const byBody = new Map(conditions.map(c => [c.body, c]));
  const mahaLord = current.maha.lord;
  const antarLord = current.antar?.subLord ?? null;

  const lines: DashaTransitLine[] = [];

  const mahaTransit = transitFor(gochara, mahaLord);
  const mahaNatal = chart.byName[mahaLord];
  const mahaCond = byBody.get(mahaLord);

  lines.push({
    label: `${mahaLord} mahadasha, ${formatDashaRange(current.maha)}`,
    graha: mahaLord,
    transit: mahaTransit,
    weight: 'primary',
    plain:
      `These years are about ${AGENDA[mahaLord]}. ` +
      (mahaNatal ? `Natally ${mahaLord} sits in ${mahaNatal.sign}${mahaNatal.house ? `, in the area of ${housePlain(mahaNatal.house)}` : ''}${mahaCond ? `, in ${mahaCond.band} condition at ${mahaCond.index} out of 100` : ''}. ` : '') +
      `In the sky it is ${verdictWord(mahaTransit)}` +
      (mahaTransit ? `, moving through ${mahaTransit.sign}${mahaTransit.house ? `, your ${mahaTransit.house}th house area` : ''}. ` : '. ') +
      (mahaTransit
        ? mahaTransit.netVerdict === 'works'
          ? 'That is the useful combination: the period and the sky are asking for the same thing, so effort here compounds.'
          : mahaTransit.netVerdict === 'maintenance'
            ? 'That is the slower combination: the subject is still the subject, but the sky is asking you to consolidate rather than expand it.'
            : 'That is the mixed combination: the subject is live, and results depend on picking one thread instead of several.'
        : 'When the period lord is not in the slow-transit set, judge the period by its own indications and use the transits below only as weather.'),
  });

  if (antarLord) {
    const antarTransit = transitFor(gochara, antarLord);
    const antarNatal = chart.byName[antarLord];
    const antarCond = byBody.get(antarLord);
    lines.push({
      label: `${antarLord} antardasha${current.antar ? `, ${formatDashaRange(current.antar)}` : ''}`,
      graha: antarLord,
      transit: antarTransit,
      weight: 'secondary',
      plain:
        `Inside those years, this shorter stretch bends the subject toward ${AGENDA[antarLord]}. ` +
        (antarNatal ? `Your ${antarLord} is in ${antarNatal.sign}${antarNatal.house ? `, working through ${housePlain(antarNatal.house)}` : ''}${antarCond ? `, condition ${antarCond.index} out of 100` : ''}. ` : '') +
        `In the sky it is ${verdictWord(antarTransit)}. ` +
        (mahaLord === antarLord
          ? 'The period lord and the sub-period lord are the same graha, which classical texts read as the most concentrated stretch of the whole mahadasha.'
          : 'Where the two lords want different things, the mahadasha wins on subject and the antardasha wins on timing.'),
    });
  }

  for (const t of gochara.transits) {
    if (t.graha === mahaLord || t.graha === antarLord) continue;
    lines.push({
      label: `${t.graha} transiting ${t.sign}`,
      graha: t.graha,
      transit: t,
      weight: 'background',
      plain:
        `${t.graha} does not run your current period, so read this as background pressure rather than as the story. ` +
        (t.netVerdict === 'works'
          ? 'It is in a supportive position, which mostly means it will not get in the way.'
          : t.netVerdict === 'maintenance'
            ? 'It is in a position that asks for upkeep, so expect it to add friction to unrelated plans rather than to create events of its own.'
            : 'It is mixed, so it colors the period without changing its subject.'),
    });
  }

  const worksNow: string[] = [];
  const costsNow: string[] = [];

  const primary = lines[0];
  if (primary.transit?.netVerdict === 'works') {
    worksNow.push(`Anything that belongs to ${AGENDA[mahaLord]}, especially in the area of ${primary.transit.house ? housePlain(primary.transit.house) : 'whatever house the period lord is crossing'}.`);
  } else {
    costsNow.push(`Trying to force fast results out of ${AGENDA[mahaLord]} while the period lord is in a position that asks for consolidation.`);
    worksNow.push(`Repair, tidying and finishing work inside ${AGENDA[mahaLord]}, which lands well even when new launches do not.`);
  }

  const blocked = gochara.transits.filter(t => t.vedha.blocked);
  if (blocked.length) {
    costsNow.push(
      `Counting on the easy version of ${blocked.map(t => `${t.graha} in ${t.sign}`).join(' and ')}. The classical obstruction rule is active there, so the opening exists but needs pushing.`,
    );
  }

  const weak = gochara.transits.filter(t => t.bindus.savBand === 'weak');
  if (weak.length) {
    costsNow.push(
      `Starting something new in ${weak.map(t => t.sign).join(' or ')}. Those signs hold below-average Ashtakavarga support, so the same effort returns less there.`,
    );
  }

  const strong = gochara.transits.filter(t => t.bindus.savBand === 'strong');
  if (strong.length) {
    worksNow.push(
      `Work routed through ${strong.map(t => `${t.sign}${t.house ? ` (your ${t.house}th house)` : ''}`).join(' and ')}, which holds above-average Ashtakavarga support right now.`,
    );
  }

  if (gochara.sadeSati?.active) {
    costsNow.push('Adding new obligations during Sade Sati. The load already on you is the classical reading of this stretch, and the useful move is subtraction.');
  }

  const antarPart = antarLord && antarLord !== mahaLord ? `, with ${antarLord} steering the next stretch of it` : '';
  const headline = `${mahaLord} period${antarPart}, and the sky is ${primary.transit ? (primary.transit.netVerdict === 'works' ? 'cooperating' : primary.transit.netVerdict === 'maintenance' ? 'asking for patience' : 'mixed') : 'neutral on it'}.`;

  const verdict =
    `Read together: the years belong to ${AGENDA[mahaLord]}, and ${primary.transit ? `${mahaLord} in the sky is ${verdictWord(primary.transit)}` : `${mahaLord} is not in the slow-transit set, so judge it from the period itself`}. ` +
    (antarLord && antarLord !== mahaLord ? `The ${antarLord} sub-period narrows the near term toward ${AGENDA[antarLord]}. ` : '') +
    (gochara.bindusAvailable
      ? 'Both the obstruction rule and the Ashtakavarga scores have been applied above, so the verdicts already account for the two classical filters rather than reading the transits at face value.'
      : 'The Ashtakavarga filter could not be applied to this chart, so the transit verdicts are the classical count only.');

  return {
    headline,
    lines,
    verdict,
    worksNow,
    costsNow,
    note: DASHA_GOCHARA_NOTE,
  };
}
