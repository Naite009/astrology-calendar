/**
 * Builds a comprehensive deterministic plain-text Cosmic Weather report
 * for a given date. All planetary positions are calculated at LOCAL MIDNIGHT
 * of that date in the user's timezone — that anchor is stated explicitly
 * at the top of every report so the recipient knows what moment is shown.
 *
 * Includes:
 * - Header with the exact computation moment + timezone
 * - Today's lunar phase (with exact time if a major phase falls today)
 * - Full planetary positions table
 * - Retrograde status for every planet (Mercury → Pluto)
 * - Today's planet-to-planet aspects (within standard orbs)
 * - 3-day window before + 3-day window after: stations, ingresses,
 *   exact lunar phases, and notable exact aspects
 */

import * as Astronomy from 'astronomy-engine';
import {
  getPlanetaryPositions,
  getMoonPhase,
  getExactLunarPhase,
  isPlanetRetrograde,
  calculateDailyAspects,
  type PlanetaryPositions,
  type Aspect,
} from './astrology';
import { computeIngresses, getStationDates } from './retrogradePatterns';

const PLANET_BODIES: Array<[string, Astronomy.Body]> = [
  ['Sun', Astronomy.Body.Sun],
  ['Moon', Astronomy.Body.Moon],
  ['Mercury', Astronomy.Body.Mercury],
  ['Venus', Astronomy.Body.Venus],
  ['Mars', Astronomy.Body.Mars],
  ['Jupiter', Astronomy.Body.Jupiter],
  ['Saturn', Astronomy.Body.Saturn],
  ['Uranus', Astronomy.Body.Uranus],
  ['Neptune', Astronomy.Body.Neptune],
  ['Pluto', Astronomy.Body.Pluto],
];

const RETRO_BODIES: Array<[string, Astronomy.Body]> = PLANET_BODIES.filter(
  ([n]) => n !== 'Sun' && n !== 'Moon'
);

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const fmtDateTime = (d: Date) =>
  d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

const fmtDateShort = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function planetRow(name: string, p: PlanetaryPositions[keyof PlanetaryPositions], retro: boolean) {
  if (!p) return '';
  const glyph = PLANET_GLYPH[name] || '';
  const pos = (p as any).fullDegree || `${(p as any).degree}° ${(p as any).signName}`;
  return `  ${glyph} ${name.padEnd(8)} ${pos}${retro ? '  ℞ retrograde' : ''}`;
}

function aspectsBlock(aspects: Aspect[], maxOrb = 4): string {
  const filtered = aspects
    .filter(a => parseFloat(a.orb) <= maxOrb)
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
  if (!filtered.length) return '  (no major aspects within 4° today)';
  return filtered
    .map(a => {
      const p1 = a.planet1.charAt(0).toUpperCase() + a.planet1.slice(1);
      const p2 = a.planet2.charAt(0).toUpperCase() + a.planet2.slice(1);
      const tag = a.applying ? 'applying ↗' : 'separating ↘';
      return `  ${PLANET_GLYPH[p1] || ''} ${p1} ${a.symbol} ${PLANET_GLYPH[p2] || ''} ${p2}  (${a.type}, orb ${a.orb}°, ${tag})`;
    })
    .join('\n');
}

interface WindowEvent {
  date: Date;
  label: string;
}

function collectWindowEvents(centerDate: Date, daysEachSide: number): WindowEvent[] {
  const events: WindowEvent[] = [];
  const start = new Date(centerDate); start.setDate(start.getDate() - daysEachSide);
  const end = new Date(centerDate); end.setDate(end.getDate() + daysEachSide);

  // Stations (retrograde / direct) for each planet
  for (const [name, body] of RETRO_BODIES) {
    try {
      const stations = getStationDates(body, centerDate);
      for (const s of stations) {
        if (s.retrograde.date >= start && s.retrograde.date <= end) {
          events.push({
            date: s.retrograde.date,
            label: `${PLANET_GLYPH[name]} ${name} stations RETROGRADE at ${s.retrograde.degree} — ${fmtDateTime(s.retrograde.date)}`,
          });
        }
        if (s.direct.date >= start && s.direct.date <= end) {
          events.push({
            date: s.direct.date,
            label: `${PLANET_GLYPH[name]} ${name} stations DIRECT at ${s.direct.degree} — ${fmtDateTime(s.direct.date)}`,
          });
        }
      }
    } catch { /* ignore */ }
  }

  // Ingresses (sign changes) for each planet across the window
  for (const [name, body] of PLANET_BODIES) {
    try {
      const ings = computeIngresses(body, name, start, end);
      for (const ing of ings) {
        events.push({
          date: ing.date,
          label: `${PLANET_GLYPH[name]} ${name} enters ${ing.toSign} (leaves ${ing.fromSign}) — ${fmtDateTime(ing.date)}`,
        });
      }
    } catch { /* ignore */ }
  }

  // Exact lunar phases in the window
  for (let i = -daysEachSide; i <= daysEachSide; i++) {
    const d = new Date(centerDate); d.setDate(d.getDate() + i);
    const ex = getExactLunarPhase(d);
    if (ex) {
      events.push({
        date: ex.time,
        label: `${ex.emoji} ${ex.type} at ${ex.position} — ${fmtDateTime(ex.time)}${ex.name ? ` (${ex.name})` : ''}`,
      });
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  // Dedupe identical labels
  const seen = new Set<string>();
  return events.filter(e => {
    const k = e.label;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface BuildReportOptions {
  date: Date;
  /** Optional recipient name (personalizes greeting). */
  recipientName?: string;
  /** Number of days to look back / forward for the surrounding events window. */
  windowDays?: number;
}

export function buildCosmicWeatherEmail(opts: BuildReportOptions): { subject: string; body: string } {
  const { date, recipientName, windowDays = 3 } = opts;

  // Anchor moment used for the snapshot: local midnight of the chosen day.
  const anchor = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzAbbr = anchor.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();

  const planets = getPlanetaryPositions(anchor);
  const moonPhase = getMoonPhase(anchor);
  const exactLunar = getExactLunarPhase(anchor);
  const aspects = calculateDailyAspects(planets);

  // Retrograde status for every classical planet
  const retroFlags: Record<string, boolean> = {};
  for (const [name, body] of RETRO_BODIES) {
    retroFlags[name] = isPlanetRetrograde(body, anchor);
  }

  const before = collectWindowEvents(anchor, windowDays).filter(e => e.date < anchor);
  const after = collectWindowEvents(anchor, windowDays).filter(e => e.date >= anchor);

  const lines: string[] = [];

  lines.push(`COSMIC WEATHER — ${fmtDate(anchor)}`);
  lines.push('═'.repeat(60));
  lines.push('');
  if (recipientName) lines.push(`Hi ${recipientName},`);
  lines.push(
    `All positions below are computed for LOCAL MIDNIGHT of this date —`,
    `${fmtDateTime(anchor)} (${tzName}, ${tzAbbr}).`,
    `The Moon moves ~13° per day, so its position drifts as the day progresses;`,
    `the other planets barely move within a single day.`
  );
  lines.push('');

  // ─── Top-of-email highlights ────────────────────────────────────────
  lines.push('━━━ HIGHLIGHTS (3 days before → 3 days after) ━━━');
  lines.push('');
  if (before.length) {
    lines.push('RECENT (last 3 days):');
    before.forEach(e => lines.push(`  • ${fmtDateShort(e.date)} — ${e.label}`));
    lines.push('');
  } else {
    lines.push('RECENT (last 3 days): (no stations, ingresses, or exact lunar phases)');
    lines.push('');
  }
  if (after.length) {
    lines.push('UPCOMING (next 3 days):');
    after.forEach(e => lines.push(`  • ${fmtDateShort(e.date)} — ${e.label}`));
    lines.push('');
  } else {
    lines.push('UPCOMING (next 3 days): (no stations, ingresses, or exact lunar phases)');
    lines.push('');
  }

  // ─── Moon today ─────────────────────────────────────────────────────
  lines.push('━━━ THE MOON TODAY ━━━');
  lines.push('');
  lines.push(`  Phase: ${moonPhase.phaseIcon} ${moonPhase.phaseName} — ${(moonPhase.illumination * 100).toFixed(0)}% illuminated`);
  lines.push(`  Position at local midnight: ${(planets.moon as any).fullDegree}`);
  if (exactLunar) {
    lines.push(`  ★ EXACT ${exactLunar.type} today at ${fmtDateTime(exactLunar.time)} — ${exactLunar.position}`);
  }
  lines.push('');

  // ─── Planetary positions ────────────────────────────────────────────
  lines.push('━━━ PLANETARY POSITIONS ━━━');
  lines.push('');
  for (const [name] of PLANET_BODIES) {
    const key = name.toLowerCase() as keyof PlanetaryPositions;
    lines.push(planetRow(name, planets[key] as any, !!retroFlags[name]));
  }
  if (planets.northNode) lines.push(`  ☊ N.Node   ${(planets.northNode as any).fullDegree || ''}`);
  if (planets.chiron) lines.push(`  ⚷ Chiron   ${(planets.chiron as any).fullDegree || ''}`);
  if (planets.lilith) lines.push(`  ⚸ Lilith   ${(planets.lilith as any).fullDegree || ''}`);
  lines.push('');

  // ─── Retrograde status ──────────────────────────────────────────────
  lines.push('━━━ RETROGRADE STATUS ━━━');
  lines.push('');
  const retroNow = RETRO_BODIES.filter(([n]) => retroFlags[n]).map(([n]) => n);
  const directNow = RETRO_BODIES.filter(([n]) => !retroFlags[n]).map(([n]) => n);
  lines.push(`  Retrograde: ${retroNow.length ? retroNow.join(', ') : '(none)'}`);
  lines.push(`  Direct:     ${directNow.join(', ')}`);
  lines.push('');

  // ─── Today's aspects ────────────────────────────────────────────────
  lines.push('━━━ TODAY\'S ASPECTS (within 4° orb) ━━━');
  lines.push('');
  lines.push(aspectsBlock(aspects, 4));
  lines.push('');

  lines.push('─'.repeat(60));
  lines.push('Generated by your Astrology Calendar.');

  const subject = `Cosmic Weather — ${fmtDate(anchor)}`;
  return { subject, body: lines.join('\n') };
}

// ─── Recipients (saved to localStorage) ───────────────────────────────

export interface EmailRecipient {
  name: string;
  email: string;
}

const RECIPIENTS_KEY = 'cosmic-weather-email-recipients';

export function loadRecipients(): EmailRecipient[] {
  try {
    const raw = localStorage.getItem(RECIPIENTS_KEY);
    return raw ? (JSON.parse(raw) as EmailRecipient[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipient(r: EmailRecipient): EmailRecipient[] {
  const list = loadRecipients();
  const existing = list.findIndex(x => x.email.toLowerCase() === r.email.toLowerCase());
  if (existing >= 0) list[existing] = r;
  else list.push(r);
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(list));
  return list;
}

export function deleteRecipient(email: string): EmailRecipient[] {
  const list = loadRecipients().filter(r => r.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(list));
  return list;
}
