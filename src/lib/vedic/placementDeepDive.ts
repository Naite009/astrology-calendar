/**
 * Per-planet deep dive for the Vedic tab.
 *
 * For every graha we assemble: the technical line, the sign statement, the
 * house statement, the nakshatra layer, the dignity note, and the classical
 * combinations that actually apply to this chart. Deterministic lookups only.
 */

import { VedicChart, VedicBody, formatDegree } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { nakshatraCopy } from './interpretations/nakshatraCopy';
import { dignityGloss, SIGN_LORDS } from './vedicDignity';
import { PLANET_IN_SIGN, PLANET_IN_HOUSE, CLASSIC_COMBOS, VSign } from './interpretations/placementCopy';
import { PLANET_ROLE } from './interpretations/planetCopy';
import { housePlain as houseTheme } from './interpretations/plainMeaning';

export interface PlacementDeepDive {
  planet: VedicPlanet;
  technical: string;
  role: string;
  signLine: string;
  houseLine: string | null;
  nakshatraLine: string | null;
  dignityLine: string | null;
  lordshipLine: string | null;
}

export interface ComboHit {
  label: string;
  text: string;
}

const ORDER: VedicPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function lordshipLine(chart: VedicChart, body: VedicBody): string | null {
  if (!chart.lagnaSign) return null;
  const ruled = Object.entries(SIGN_LORDS)
    .filter(([, lord]) => lord === body.name)
    .map(([sign]) => sign);
  if (!ruled.length) return null;

  const signsList = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const lagnaIdx = signsList.indexOf(chart.lagnaSign);
  const nums = ruled
    .map(sign => ((signsList.indexOf(sign) - lagnaIdx + 12) % 12) + 1)
    .sort((a, b) => a - b);
  const themes = nums.map(n => `house ${n} (${houseTheme(n)})`).join(' and ');
  return `Because ${body.name} rules ${ruled.join(' and ')} in your chart, it carries ${themes}. Wherever ${body.name} sits, those areas of life travel with it.`;
}

export function buildPlacementDeepDives(chart: VedicChart): PlacementDeepDive[] {
  const out: PlacementDeepDive[] = [];

  for (const planet of ORDER) {
    const body = chart.byName[planet];
    if (!body) continue;

    const signCopy = PLANET_IN_SIGN[planet]?.[body.sign as VSign] || null;
    const houseCopy = body.house ? PLANET_IN_HOUSE[planet]?.[body.house] || null : null;
    const nk = nakshatraCopy(body.nakshatra.name);

    out.push({
      planet,
      technical: `${planet} ${formatDegree(body.degree)} ${body.sign}${body.house ? `, house ${body.house}` : ''}, ${body.nakshatra.name} pada ${body.nakshatra.pada}, lord ${body.nakshatra.lord}${body.dignity !== 'neutral' ? `, ${body.dignity}` : ''}${body.retrograde ? ', retrograde' : ''}`,
      role: `${planet} runs ${PLANET_ROLE[planet]}.`,
      signLine: signCopy || `In ${body.sign}, ${planet} takes on that sign's way of operating.`,
      houseLine: houseCopy
        ? `In house ${body.house}, the area of life this lands on is ${houseTheme(body.house)}. ${houseCopy}`
        : chart.hasBirthTime
          ? null
          : 'House placement needs an accurate birth time before it can be named.',
      nakshatraLine: nk
        ? `Inside ${body.sign} it sits in ${body.nakshatra.name} pada ${body.nakshatra.pada}, ruled by ${body.nakshatra.lord}, which narrows it further: ${nk.essence}. The usable side is ${nk.gift}.`
        : null,
      dignityLine: body.dignity !== 'neutral'
        ? `Classically ${planet} is ${body.dignity} in ${body.sign}, which reads as: it ${dignityGloss(body.dignity)}.`
        : null,
      lordshipLine: lordshipLine(chart, body),
    });
  }

  return out;
}

export function findComboHits(chart: VedicChart): ComboHit[] {
  const get = (p: VedicPlanet) => {
    const b = chart.byName[p];
    return b ? { sign: b.sign, house: b.house } : undefined;
  };
  return CLASSIC_COMBOS.filter(c => {
    try { return c.test(get); } catch { return false; }
  }).map(c => ({ label: c.label, text: c.text }));
}
