/**
 * Gochara: transits read the Jyotish way.
 *
 * Two differences from the Western tab, both deliberate:
 *  - Transits are counted by SIGN from the natal Moon (the classical reference)
 *    and also by whole-sign house from the lagna, not by degree aspects.
 *  - Only the slow grahas plus the nodes are read for timing. The Moon's own
 *    transit is reported as the day's flavour, never as a life event.
 *
 * Sade Sati is included because it is the single most asked-about transit in
 * Jyotish, and it is described as a pressure period, never as a disaster.
 */

import { buildLiveSkyChart } from '@/lib/liveSkyChart';
import { lahiriAyanamsa } from './ayanamsa';
import { VedicChart } from './siderealChart';
import { VedicPlanet, getNakshatra } from './nakshatras';
import { signIndex, signFromIndex, vedicDignity, VedicDignity } from './vedicDignity';

export interface GocharaTransit {
  graha: VedicPlanet;
  sign: string;
  degree: number;
  retrograde: boolean;
  dignity: VedicDignity;
  nakshatra: string;
  /** Sign count from the natal Moon, 1 to 12 */
  fromMoon: number;
  /** Whole-sign house from the natal lagna */
  house: number | null;
  /** Classical verdict of that count from the Moon */
  quality: 'favourable' | 'mixed' | 'difficult';
  plain: string;
}

const SLOW: VedicPlanet[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];

/** Classical favourable houses from the natal Moon for each graha. */
const GOOD_FROM_MOON: Record<VedicPlanet, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 10, 11],
};

const HOUSE_FOCUS: Record<number, string> = {
  1: 'your body, how you come across, and what you are willing to start',
  2: 'money you hold, what you say, and your immediate family',
  3: 'siblings, short trips, courage and everyday communication',
  4: 'home, land, your mother, and whether you feel settled',
  5: 'children, creative output, study and what you enjoy',
  6: 'work routine, health habits, debts and disputes',
  7: 'partnership, negotiation and the people who deal with you directly',
  8: 'shared money, secrets, sudden change and things you cannot control',
  9: 'belief, teachers, long travel and your father',
  10: 'career, public standing and what you are known for',
  11: 'income, networks, gains and older siblings',
  12: 'letting go, private life, sleep, expenses and time spent away from people',
};

const GRAHA_PRESSURE: Partial<Record<VedicPlanet, { good: string; hard: string }>> = {
  Jupiter: {
    good: 'tends to widen this area: more opportunity, more people offering things, more room than usual',
    hard: 'tends to overcommit this area: saying yes to more than fits, or expense growing alongside the opportunity',
  },
  Saturn: {
    good: 'tends to reward steady work in this area, so slow effort here usually holds',
    hard: 'tends to slow this area down and ask for proof: delay, extra responsibility, and less patience for shortcuts',
  },
  Rahu: {
    good: 'tends to push you into unfamiliar territory in this area, which is uncomfortable but usually productive',
    hard: 'tends to make this area feel urgent and never quite enough, so it is worth checking whether the hunger is actually yours',
  },
  Ketu: {
    good: 'tends to reduce your attachment in this area, which frees attention for elsewhere',
    hard: 'tends to drain interest from this area, so things you used to care about here can feel flat',
  },
};

function norm360(v: number) { return ((v % 360) + 360) % 360; }

export interface GocharaReport {
  when: Date;
  ayanamsa: number;
  transits: GocharaTransit[];
  moonToday: GocharaTransit | null;
  sadeSati: SadeSati | null;
  /** The dasha lord's own transit, which classical timing weighs most */
  dashaLordTransit: GocharaTransit | null;
}

export interface SadeSati {
  active: boolean;
  phase: 'rising' | 'peak' | 'setting' | null;
  plain: string;
}

function sadeSati(natalMoonSign: string, saturnSign: string): SadeSati {
  const d = (signIndex(saturnSign) - signIndex(natalMoonSign) + 12) % 12;
  if (d === 11) return {
    active: true, phase: 'rising',
    plain: 'Saturn is in the sign before your natal Moon, which begins the period Jyotish calls Sade Sati. The classical description is a long stretch of being asked to carry more and complain less. In practice the first third usually shows as tiredness and a sense that things need reorganising, not as catastrophe. It is a maturing period, and this app does not treat it as a prediction of loss.',
  };
  if (d === 0) return {
    active: true, phase: 'peak',
    plain: 'Saturn is in the same sign as your natal Moon, the middle of Sade Sati. This is the part classical texts weigh most: emotional load is heavier, patience is thinner, and things that were being held together loosely tend to need proper fixing. It is also the part that builds the most durable competence, and it does end.',
  };
  if (d === 1) return {
    active: true, phase: 'setting',
    plain: 'Saturn is in the sign after your natal Moon, the closing third of Sade Sati. The pressure is usually easing while the responsibilities taken on earlier remain. Most people describe this stretch as tired but steadier.',
  };
  return {
    active: false, phase: null,
    plain: `Saturn is currently ${d} signs from your natal Moon, so you are not in Sade Sati. It returns whenever Saturn reaches the sign before your Moon again.`,
  };
}

export function buildGochara(
  vedic: VedicChart,
  dashaLord?: VedicPlanet | null,
  when: Date = new Date(),
): GocharaReport | null {
  const sky = buildLiveSkyChart(when);
  const ayan = lahiriAyanamsa(when);
  const moonNatal = vedic.byName.Moon;
  if (!moonNatal) return null;

  const NAME_MAP: Partial<Record<string, VedicPlanet>> = {
    Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
    Jupiter: 'Jupiter', Saturn: 'Saturn',
    NorthNode: 'Rahu', 'North Node': 'Rahu', 'True Node': 'Rahu',
  };

  const SIGN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  /** Positions are stored as sign plus degree, so rebuild the tropical longitude. */
  const toLongitude = (p: { sign?: string; degree?: number; minutes?: number; seconds?: number }): number => {
    const idx = SIGN_ORDER.indexOf(p.sign || '');
    if (idx === -1) return 0;
    return idx * 30 + (p.degree || 0) + (p.minutes || 0) / 60 + (p.seconds || 0) / 3600;
  };


  const build = (graha: VedicPlanet, tropicalLon: number, retro: boolean): GocharaTransit => {
    const lon = norm360(tropicalLon - ayan);
    const sign = signFromIndex(Math.floor(lon / 30));
    const degree = lon % 30;
    const fromMoon = ((signIndex(sign) - signIndex(moonNatal.sign) + 12) % 12) + 1;
    const house = vedic.lagnaSign ? ((signIndex(sign) - signIndex(vedic.lagnaSign) + 12) % 12) + 1 : null;
    const good = GOOD_FROM_MOON[graha].includes(fromMoon);
    const quality: GocharaTransit['quality'] = good ? 'favourable' : [4, 8, 12].includes(fromMoon) ? 'difficult' : 'mixed';
    const press = GRAHA_PRESSURE[graha];
    const focus = house ? HOUSE_FOCUS[house] : null;

    const plain = [
      `${graha} is transiting ${sign}${retro ? ', retrograde' : ''}, which is ${fromMoon === 1 ? 'the same sign as' : `${fromMoon} signs from`} your natal Moon.`,
      house ? `From your rising sign that is house ${house}, so it is working on ${focus}.` : '',
      press ? `Classically this ${good ? press.good : press.hard}.` : '',
      quality === 'difficult'
        ? 'Counted from the Moon this is one of the harder positions, which classical texts read as needing more rest and fewer new commitments rather than as bad luck.'
        : quality === 'favourable'
          ? 'Counted from the Moon this is one of the supportive positions, so effort here tends to go further than usual.'
          : 'Counted from the Moon this is a mixed position, so it depends more on what you do with it than on the transit itself.',
    ].filter(Boolean).join(' ');

    return {
      graha, sign, degree, retrograde: retro,
      dignity: vedicDignity(graha, sign),
      nakshatra: getNakshatra(lon).name,
      fromMoon, house, quality, plain,
    };
  };

  const transits: GocharaTransit[] = [];
  let moonToday: GocharaTransit | null = null;
  let saturnSign: string | null = null;

  type SkyPos = { sign?: string; degree?: number; minutes?: number; seconds?: number; isRetrograde?: boolean };
  const entries = Object.entries(sky.planets) as [string, SkyPos | undefined][];

  for (const [name, p] of entries) {
    const graha = NAME_MAP[name];
    if (!graha || !p) continue;
    const lon = toLongitude(p);
    const t = build(graha, lon, !!p.isRetrograde);
    if (graha === 'Saturn') saturnSign = t.sign;
    if (graha === 'Moon') { moonToday = t; continue; }
    if (SLOW.includes(graha)) transits.push(t);
    if (graha === 'Rahu') transits.push(build('Ketu', norm360(lon + 180), true));
  }

  // Also surface the current dasha lord's transit, whatever speed it is.
  let dashaLordTransit: GocharaTransit | null = null;
  if (dashaLord) {
    const match = entries.find(([n]) => NAME_MAP[n] === dashaLord)?.[1];
    if (match) dashaLordTransit = build(dashaLord, toLongitude(match), !!match.isRetrograde);
    else if (dashaLord === 'Ketu') {
      const node = entries.find(([n]) => NAME_MAP[n] === 'Rahu')?.[1];
      if (node) dashaLordTransit = build('Ketu', norm360(toLongitude(node) + 180), true);
    }
  }



  return {
    when,
    ayanamsa: ayan,
    transits: transits.sort((a, b) => a.graha.localeCompare(b.graha)),
    moonToday,
    sadeSati: saturnSign ? sadeSati(moonNatal.sign, saturnSign) : null,
    dashaLordTransit,
  };
}

export const GOCHARA_NOTE =
  'Jyotish reads transits by sign rather than by exact degree, and it counts them from the natal Moon as well as from the rising sign. Only the slow grahas are read for timing, plus whichever graha currently runs your dasha period, because a transit tends to matter most when it belongs to the period you are already in.';
