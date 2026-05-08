/**
 * Morning Cosmic Weather digest — fully deterministic.
 *
 * No AI. No hallucination. Pure ephemeris + the user's natal chart.
 *
 * Designed to be read on a phone in bed in 30 seconds. The 5 things that
 * actually matter at 6am:
 *   1. Moon: sign, phase, void status
 *   2. The dominant story (one line, derived from tightest aspects)
 *   3. Heads-up flags (only if true today)
 *   4. Do / Avoid
 *   5. Personal hit (only if a transit is within 1° of a natal point today)
 */

import { getMoonPhase, getPlanetaryPositions, calculateDailyAspects } from './astrology';
import { getVOCMoonDetails, formatVOCTime } from './voidOfCourseMoon';
import { calculateTransitAlerts } from './transitAlerts';
import { formatSkyBlockForEmail, buildSkyEntries } from './cosmicWeatherSkyBlock';
import type { NatalChart } from '@/hooks/useNatalChart';

const SIGN_SYMBOL: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ELEMENT: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

// Mood per element, written as what you'll FEEL/DO, not abstract jargon.
const MOON_MOOD: Record<string, { mood: string; doIt: string; avoid: string }> = {
  fire:  { mood: 'restless, impatient, wants to move', doIt: 'workout, hard conversations, ship something', avoid: 'long meetings, sitting still' },
  earth: { mood: 'practical, grounded, wants results', doIt: 'cook, clean, finances, body care', avoid: 'big abstract decisions, risk' },
  air:   { mood: 'social, talky, head over heart', doIt: 'calls, writing, brainstorming', avoid: 'going inward alone too long' },
  water: { mood: 'tender, intuitive, easily flooded', doIt: 'rest, journal, time with people who get you', avoid: 'crowds, doomscrolling, hard logic' },
};

const PHASE_LINE: Record<string, string> = {
  'New Moon': 'fresh start day, plant the seed',
  'Waxing Crescent': 'building momentum, small steps',
  'First Quarter': 'push through resistance',
  'Waxing Gibbous': 'refine and adjust',
  'Full Moon': 'peak intensity, things come to light',
  'Waning Gibbous': 'integrate what you learned',
  'Last Quarter': 'release, let things go',
  'Waning Crescent': 'rest, clear, prepare for the new cycle',
  'Balsamic Moon': 'rest, clear, prepare for the new cycle',
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const ASPECT_FEEL: Record<string, string> = {
  conjunction: 'fused with',
  opposition: 'pulling against',
  square: 'rubbing against',
  trine: 'flowing with',
  sextile: 'opening to',
};

// One-line read of a natal hit, written as what you'll notice.
function personalHitLine(transitPlanet: string, aspect: string, natalPlanet: string): string {
  const verbs: Record<string, string> = {
    Sun: 'who you are today',
    Moon: 'how you feel today',
    Mercury: 'how you think and talk',
    Venus: 'love, money, what you want',
    Mars: 'your drive and edge',
    Jupiter: 'where you reach for more',
    Saturn: 'where you feel the weight',
  };
  const target = verbs[natalPlanet] || `your natal ${natalPlanet}`;
  const flavor: Record<string, string> = {
    Jupiter: 'something opens, an opportunity or a yes',
    Saturn: 'a delay, a no, or a real-world reality check',
    Uranus: 'a surprise, a shake-up, an unexpected pivot',
    Neptune: 'fog, dreaminess, hard to see straight, sleep more',
    Pluto: 'something heavy surfaces, a power dynamic shifts',
    Mars: 'spike of energy or irritation, watch the temper',
    Venus: 'softness lands, a kindness, a beautiful thing',
    Mercury: 'conversations move fast, words land',
  };
  const f = flavor[transitPlanet] || `${transitPlanet} touches your chart`;
  return `${PLANET_GLYPH[transitPlanet] || ''} ${transitPlanet} ${ASPECT_FEEL[aspect] || aspect} ${PLANET_GLYPH[natalPlanet] || ''} natal ${natalPlanet}: ${f} around ${target}.`;
}

export interface MorningDigestArgs {
  date: Date;
  natalChart: NatalChart | null;
  recipientName?: string;
}

export function buildMorningDigest({ date, natalChart, recipientName }: MorningDigestArgs): string {
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const firstName = recipientName?.split(/\s+/)[0];
  const greeting = firstName ? `Good morning, ${firstName}.` : 'Good morning.';

  // ── 1. Moon ──────────────────────────────────────────────────────
  const positions = getPlanetaryPositions(date);
  const moonSign = positions.moon.sign;
  const moonDeg = positions.moon.degree;
  const phase = getMoonPhase(date);
  const voc = getVOCMoonDetails(date);
  const element = ELEMENT[moonSign] || 'air';
  const mood = MOON_MOOD[element];

  const moonLine = `${SIGN_SYMBOL[moonSign] || ''} Moon in ${moonSign} (${moonDeg}°), ${phase.phaseName.toLowerCase()}. The mood is ${mood.mood}. ${PHASE_LINE[phase.phaseName] ? PHASE_LINE[phase.phaseName] + '.' : ''}`.trim();

  let vocLine = '';
  if (voc.isCurrentlyVOC && voc.end) {
    vocLine = `Moon is void of course until ${formatVOCTime(voc.end)} ET. Don't kick off anything new before then. After, Moon enters ${voc.moonEntersSign}.`;
  } else if (voc.isVOC && voc.start && voc.end) {
    vocLine = `Heads up: Moon goes void of course at ${formatVOCTime(voc.start)} ET and stays there until ${formatVOCTime(voc.end)} ET. Don't start anything new in that window.`;
  }

  // ── 2. Dominant story (one line from tightest aspect today) ──────
  let storyLine = `Today's strongest current: ${element} energy, so lean into ${mood.doIt.split(',')[0].trim()}.`;
  try {
    const aspects = (calculateDailyAspects as any)(date) || [];
    // Find the tightest (smallest orb) aspect among slow planets, ignoring Moon
    const SLOW = new Set(['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
    const slowOnly = aspects
      .filter((a: any) => SLOW.has(a.planet1) && SLOW.has(a.planet2))
      .sort((a: any, b: any) => (a.orb ?? 99) - (b.orb ?? 99));
    const top = slowOnly[0];
    if (top) {
      const orbStr = top.orb != null ? `${Number(top.orb).toFixed(1)}°` : '';
      const feel = ASPECT_FEEL[top.aspect] || top.aspect;
      storyLine = `Strongest current: ${PLANET_GLYPH[top.planet1] || ''} ${top.planet1} ${feel} ${PLANET_GLYPH[top.planet2] || ''} ${top.planet2} ${orbStr ? `(${orbStr} orb)` : ''}. That's the texture of the day for everyone.`;
    }
  } catch { /* ignore */ }

  // ── 3. Heads-up flags ────────────────────────────────────────────
  const flags: string[] = [];
  try {
    const retro = getRetrogradeDisplay(date);
    if (retro?.activeRetrogrades?.length) {
      const names = retro.activeRetrogrades.map((r: any) => r.planet).join(', ');
      flags.push(`Currently retrograde: ${names}.`);
    }
  } catch { /* ignore */ }

  // Late-degree planet → ingress soon
  const PERSONAL = ['Sun', 'Mercury', 'Venus', 'Mars'] as const;
  for (const name of PERSONAL) {
    const p = (positions as any)[name.toLowerCase()];
    if (p && p.degree >= 28) {
      flags.push(`${PLANET_GLYPH[name]} ${name} is at ${p.degree}° ${p.sign}, about to change signs.`);
    }
  }

  // ── 4. Do / Avoid ────────────────────────────────────────────────
  const doLine = `Good for: ${mood.doIt}.`;
  const avoidLine = `Avoid: ${mood.avoid}${vocLine ? '; signing/launching during the void window' : ''}.`;

  // ── 5. Personal hits (within 1° today) ───────────────────────────
  const personalLines: string[] = [];
  if (natalChart) {
    try {
      const alerts = calculateTransitAlerts(natalChart, date)
        .filter(a => a.orb <= 1.5 && (a.alertType === 'exact' || a.motion === 'applying'))
        .sort((a, b) => a.orb - b.orb)
        .slice(0, 2);
      for (const a of alerts) {
        personalLines.push(personalHitLine(a.transitPlanet, a.aspectType, a.natalPlanet));
      }
    } catch { /* ignore */ }
  }

  // ── Compose ──────────────────────────────────────────────────────
  const sky = formatSkyBlockForEmail(date);

  const sections: string[] = [];
  sections.push(`${greeting} Here's the sky for ${dateLabel}.`);
  sections.push(sky);
  sections.push(`THE MOON\n${moonLine}${vocLine ? '\n' + vocLine : ''}`);
  sections.push(`THE STORY\n${storyLine}`);
  if (flags.length) sections.push(`HEADS UP\n${flags.map(f => '• ' + f).join('\n')}`);
  sections.push(`DO / AVOID\n• ${doLine}\n• ${avoidLine}`);
  if (personalLines.length) {
    sections.push(`FOR YOU TODAY\n${personalLines.map(l => '• ' + l).join('\n')}`);
  } else if (natalChart) {
    sections.push(`FOR YOU TODAY\nNo planet is sitting on a sensitive point of your chart within 1° today. Move with the collective weather above.`);
  }
  sections.push(`Want the full reading? Open the app for the long version.`);

  return sections.join('\n\n');
}
