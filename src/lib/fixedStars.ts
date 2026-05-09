/**
 * Fixed Star Activation Module
 *
 * Compares natal points against the major fixed-star database, adjusted
 * for precession from J2000 to the birth year (~50.29" / year).
 *
 * RULES (strict, per spec):
 *   - Degree-only matching. No sign-based matching.
 *   - Only the listed natal points are checked: Asc, MC, Sun, Moon,
 *     Mercury, Venus, Mars, Jupiter, Saturn, North Node.
 *   - Orbs:
 *       Asc / MC               2°
 *       Sun / Moon             2°
 *       Mercury / Venus / Mars 1.5°
 *       Jupiter / Saturn       1°
 *       North Node             1°
 *   - Untriggered stars are not interpreted.
 */

import type { NatalChart } from '@/hooks/useNatalChart';

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const PRECESSION_ARCSEC_PER_YEAR = 50.29;

export interface FixedStar {
  name: string;
  /** Ecliptic longitude at J2000 in decimal degrees (0–360). */
  j2000Lon: number;
  /** One-line interpretive theme (the star's traditional nature). */
  theme: string;
}

/**
 * Major fixed stars with traditional astrological significance.
 * Longitudes are J2000 ecliptic; precession is applied at lookup time.
 * (Sources: Vivian Robson, Bernadette Brady, Constellations of Words.)
 */
export const FIXED_STARS: FixedStar[] = [
  // Aries
  { name: 'Difda',        j2000Lon:   2.78, theme: 'self-undoing through fear; pressure to break out of confinement.' }, // 2°47' Ari
  { name: 'Algenib',      j2000Lon:   9.15, theme: 'sharp mind, decisive speech, ambition that needs an outlet.' },     // 9°09' Ari
  { name: 'Alpheratz',    j2000Lon:  14.30, theme: 'independence, freedom of movement, popularity earned by honesty.' },// 14°18' Ari
  { name: 'Baten Kaitos', j2000Lon:  21.93, theme: 'forced change of place; emigration, accidents, sudden displacements.' }, // 21°56' Ari
  { name: 'Mirach',       j2000Lon:   0.40 + 30, theme: 'beauty, devotion, attracting good through love.' }, // 0°24' Tau
  // Taurus
  { name: 'Hamal',        j2000Lon:   7.65 + 30, theme: 'pioneering drive; can become aggressive or impatient.' },       // 7°39' Tau
  { name: 'Schedar',      j2000Lon:   7.78 + 30, theme: 'queenly poise, demand for respect, public visibility.' },        // 7°47' Tau
  { name: 'Menkar',       j2000Lon:  14.32 + 30, theme: 'inheritance of collective burdens; throat issues, public scapegoating.' }, // 14°19' Tau
  { name: 'Algol',        j2000Lon:  26.17 + 30, theme: 'intense, primal power. The buried rage that, once owned, becomes formidable strength.' }, // 26°10' Tau
  // Gemini
  { name: 'Alcyone',      j2000Lon:   0.00 + 60, theme: 'something to cry about; eyes, vision, sorrow that becomes wisdom.' }, // 0°00' Gem (Pleiades)
  { name: 'Aldebaran',    j2000Lon:   9.78 + 60, theme: 'integrity tested; honor and worldly success at the cost of strict ethics.' }, // 9°47' Gem
  { name: 'Rigel',        j2000Lon:  16.83 + 60, theme: 'teaching through technical mastery; lasting reputation built by craft.' }, // 16°50' Gem
  { name: 'Bellatrix',    j2000Lon:  20.95 + 60, theme: 'female warrior; quick honors followed by sudden reversals.' }, // 20°57' Gem
  { name: 'Capella',      j2000Lon:  21.85 + 60, theme: 'curiosity, learning, freedom of thought; restlessness.' }, // 21°51' Gem
  { name: 'Mintaka',      j2000Lon:  22.40 + 60, theme: 'turning point; good fortune mixed with sudden change.' }, // 22°24' Gem
  { name: 'El Nath',      j2000Lon:  22.58 + 60, theme: 'bull horn; pushing through obstacles, neck of the matter.' }, // 22°34' Gem
  { name: 'Alnilam',      j2000Lon:  23.47 + 60, theme: 'public scandal turned to fame; brief, intense recognition.' }, // 23°28' Gem
  { name: 'Polaris',      j2000Lon:  28.57 + 60, theme: 'guiding star; clear direction, spiritual pole, leadership through example.' }, // 28°34' Gem
  { name: 'Betelgeuse',   j2000Lon:  28.75 + 60, theme: 'warrior crown; great success and lasting honor, with a fall risk.' }, // 28°45' Gem
  // Cancer
  { name: 'Sirius',       j2000Lon:  14.08 + 90, theme: 'sacred fire; brilliance, fame, the sense of being on a mission.' }, // 14°05' Can
  { name: 'Canopus',      j2000Lon:  14.97 + 90, theme: 'old voyager; long journeys, leadership through experience, navigation.' }, // 14°58' Can
  { name: 'Castor',       j2000Lon:  20.23 + 90, theme: 'sudden fame and sudden loss; writing, brothers, twin themes.' }, // 20°14' Can
  { name: 'Pollux',       j2000Lon:  23.22 + 90, theme: 'subtle aggression; brilliance with a cruel edge if pushed.' }, // 23°13' Can
  { name: 'Procyon',      j2000Lon:  25.78 + 90, theme: 'rapid rise, sudden fall; quick wit, impulsive choices.' }, // 25°47' Can
  // Leo
  { name: 'Praesepe',     j2000Lon:   7.32 + 120, theme: 'beehive cluster; storms, eyes, swarming events.' }, // 7°19' Leo
  { name: 'North Asellus',j2000Lon:   7.55 + 120, theme: 'patience pays; slow steady gain, good for endurance work.' }, // 7°33' Leo
  { name: 'South Asellus',j2000Lon:   8.72 + 120, theme: 'patience pays; honesty rewarded over time.' }, // 8°43' Leo
  { name: 'Alphard',      j2000Lon:  27.27 + 120, theme: 'lone heart; passion, poison, drama; emotional intensity.' }, // 27°16' Leo
  { name: 'Regulus',      j2000Lon:   0.00 + 150, theme: 'royal star of success — only if vengeance is renounced. A rise that requires integrity.' }, // 0°00' Vir
  // Virgo
  { name: 'Zosma',        j2000Lon:  11.32 + 150, theme: 'the victim made wise; suffering that becomes service to others.' }, // 11°19' Vir
  { name: 'Denebola',     j2000Lon:  21.62 + 150, theme: 'going against society; misfortune followed by recovery.' }, // 21°37' Vir
  // Libra
  { name: 'Vindemiatrix', j2000Lon:  10.05 + 180, theme: 'widow-maker; sudden loss, focus, harvest after grief.' }, // 10°03' Lib
  { name: 'Algorab',      j2000Lon:  13.42 + 180, theme: 'destructiveness, scavenger work; repulse and lies if misused.' }, // 13°25' Lib
  { name: 'Spica',        j2000Lon:  23.83 + 180, theme: 'pure gift; protection, brilliance, an unfair advantage that arrives unearned.' }, // 23°50' Lib
  { name: 'Arcturus',     j2000Lon:  24.23 + 180, theme: 'guardian and pathfinder; success through different paths, prosperity.' }, // 24°14' Lib
  // Scorpio
  { name: 'Acrux',        j2000Lon:  11.85 + 210, theme: 'Southern Cross; spiritual burden, justice, ceremonial role.' }, // 11°51' Sco
  { name: 'Alphecca',     j2000Lon:  12.30 + 210, theme: 'crown of value; honor, marriage, artistic recognition.' }, // 12°18' Sco
  { name: 'South Scale',  j2000Lon:  15.13 + 210, theme: 'unrewarded effort; injustice that must be metabolized.' }, // 15°08' Sco (Zubenelgenubi)
  { name: 'North Scale',  j2000Lon:  19.33 + 210, theme: 'good karma returning; honor through service.' }, // 19°20' Sco (Zubeneschamali)
  { name: 'Unukalhai',    j2000Lon:  22.08 + 210, theme: 'serpent heart; chronic accidents, immune system; healing knowledge.' }, // 22°05' Sco
  { name: 'Agena',        j2000Lon:  23.82 + 210, theme: 'good health, high honors; moral position from a friend.' }, // 23°49' Sco
  { name: 'Bungula',      j2000Lon:  29.55 + 210, theme: 'Toliman; position of power and friendship, sometimes envied.' }, // 29°33' Sco
  // Sagittarius
  { name: 'Antares',      j2000Lon:   9.77 + 240, theme: 'rival of Mars; high stakes, courage, sudden reversals; obsessive focus.' }, // 9°46' Sag
  { name: 'Rastaban',     j2000Lon:  11.97 + 240, theme: 'dragon\'s eye; loss through people, accidents, criminal influences if unconscious.' }, // 11°58' Sag
  { name: 'Sabik',        j2000Lon:  17.97 + 240, theme: 'wasted energy on lost causes; ethical struggles in love.' }, // 17°58' Sag
  { name: 'Ras Alhague',  j2000Lon:  22.50 + 240, theme: 'serpent bearer; healing, poison, addictive personalities and their cure.' }, // 22°30' Sag
  { name: 'Lesath',       j2000Lon:  24.07 + 240, theme: 'scorpion sting; danger of acid, surgery, transformation through crisis.' }, // 24°04' Sag
  { name: 'Acumen',       j2000Lon:  28.18 + 240, theme: 'enduring attacks; immune system, eyesight; resilience under sustained pressure.' }, // 28°11' Sag
  // Capricorn
  { name: 'Facies',       j2000Lon:   8.32 + 270, theme: 'piercing glance; ruthless focus, leadership in dangerous fields.' }, // 8°19' Cap
  { name: 'Vega',         j2000Lon:  15.32 + 270, theme: 'falling vulture; charisma, the arts, success that comes and goes.' }, // 15°19' Cap
  // Aquarius
  { name: 'Altair',       j2000Lon:   1.78 + 300, theme: 'soaring eagle; daring, decisive action, sudden honors.' }, // 1°47' Aqu
  { name: 'Albireo',      j2000Lon:   1.27 + 300, theme: 'beauty in contrast; refined taste, partnership themes.' }, // 1°16' Aqu
  { name: 'Giedi',        j2000Lon:   3.83 + 300, theme: 'sacrifice and offering; mysterious circumstances, strange paths to power.' }, // 3°50' Aqu
  { name: 'Dabih',        j2000Lon:   4.05 + 300, theme: 'reserved trust; gain through serious associates, suspicion if pushed.' }, // 4°03' Aqu
  { name: 'Sadalsuud',    j2000Lon:  23.40 + 300, theme: 'luckiest of the lucky; fortune through unexpected channels.' }, // 23°24' Aqu
  // Pisces
  { name: 'Sadalmelik',   j2000Lon:   3.32 + 330, theme: 'king\'s lucky one; good fortune through occult or healing work.' }, // 3°19' Pis
  { name: 'Fomalhaut',    j2000Lon:   3.87 + 330, theme: 'one of the four royal stars; lasting fame if integrity holds; otherwise downfall.' }, // 3°52' Pis
  { name: 'Deneb Adige',  j2000Lon:   5.32 + 330, theme: 'swan tail; ideals, intelligence, gift for science or contemplation.' }, // 5°19' Pis
  { name: 'Achernar',     j2000Lon:  15.32 + 330, theme: 'river\'s end; success in religion, public life, philosophy.' }, // 15°19' Pis
  { name: 'Markab',       j2000Lon:  23.50 + 330, theme: 'Pegasus saddle; honor and wealth from steady work; danger from fire or weapons.' }, // 23°30' Pis
  { name: 'Scheat',       j2000Lon:  29.40 + 330, theme: 'extreme misfortune through water if unconscious; depth of vision if integrated.' }, // 29°24' Pis
];

/** Apply precession from J2000 to the birth year (sidereal → tropical drift). */
export function precessedLongitude(j2000Lon: number, birthYear: number): number {
  const years = birthYear - 2000;
  const driftDeg = (years * PRECESSION_ARCSEC_PER_YEAR) / 3600;
  return ((j2000Lon + driftDeg) % 360 + 360) % 360;
}

/** Convert sign + degree + minutes (+ seconds) to absolute ecliptic longitude. */
function pointLongitude(sign: string, deg: number, min = 0, sec = 0): number {
  const idx = SIGNS.indexOf(sign);
  if (idx < 0) return NaN;
  return idx * 30 + deg + min / 60 + sec / 3600;
}

function fromLongitude(lon: number): { sign: string; deg: number; min: number } {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const inSign = norm - idx * 30;
  let deg = Math.floor(inSign);
  let min = Math.round((inSign - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  return { sign: SIGNS[idx % 12], deg, min };
}

/** Orb in degrees for each natal point. Returns null if point is not eligible. */
function orbFor(point: string): number | null {
  switch (point) {
    case 'Ascendant':
    case 'Midheaven':
      return 2.0;
    case 'Sun':
    case 'Moon':
      return 2.0;
    case 'Mercury':
    case 'Venus':
    case 'Mars':
      return 1.5;
    case 'Jupiter':
    case 'Saturn':
      return 1.0;
    case 'NorthNode':
      return 1.0;
    default:
      return null;
  }
}

const POINT_LABEL: Record<string, string> = {
  Ascendant: 'Ascendant',
  Midheaven: 'Midheaven',
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  NorthNode: 'North Node',
};

export interface FixedStarHit {
  star: string;
  theme: string;
  point: string;          // natal point label (e.g. "Sun", "Ascendant")
  orb: number;            // exact orb in degrees (>= 0)
  starPosition: string;   // formatted, precessed ("26°10' Taurus")
  natalPosition: string;  // formatted natal point ("27°15' Taurus")
  interpretation: string; // 1–2 sentence narrative
}

/** Pull each eligible natal point's longitude. Ascendant uses houseCusps.house1
 *  per Ascendant-source-of-truth memory; MC uses houseCusps.house10. */
function gatherNatalPoints(chart: NatalChart): Array<{ key: string; lon: number; pretty: string }> {
  const out: Array<{ key: string; lon: number; pretty: string }> = [];
  const p = chart.planets || {};

  // Ascendant: houseCusps.house1 wins, fallback to planets.Ascendant
  const asc = chart.houseCusps?.house1
    ? { sign: chart.houseCusps.house1.sign, deg: chart.houseCusps.house1.degree, min: chart.houseCusps.house1.minutes || 0 }
    : p.Ascendant
      ? { sign: p.Ascendant.sign, deg: p.Ascendant.degree, min: p.Ascendant.minutes || 0 }
      : null;
  if (asc) {
    const lon = pointLongitude(asc.sign, asc.deg, asc.min);
    if (!isNaN(lon)) out.push({ key: 'Ascendant', lon, pretty: `${asc.deg}°${String(asc.min).padStart(2,'0')}' ${asc.sign}` });
  }

  // Midheaven: houseCusps.house10
  const mc = chart.houseCusps?.house10
    ? { sign: chart.houseCusps.house10.sign, deg: chart.houseCusps.house10.degree, min: chart.houseCusps.house10.minutes || 0 }
    : null;
  if (mc) {
    const lon = pointLongitude(mc.sign, mc.deg, mc.min);
    if (!isNaN(lon)) out.push({ key: 'Midheaven', lon, pretty: `${mc.deg}°${String(mc.min).padStart(2,'0')}' ${mc.sign}` });
  }

  const eligible: Array<keyof typeof p> = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','NorthNode'];
  for (const key of eligible) {
    const pos = p[key];
    if (!pos) continue;
    const lon = pointLongitude(pos.sign, pos.degree, pos.minutes || 0, pos.seconds || 0);
    if (isNaN(lon)) continue;
    out.push({
      key: String(key),
      lon,
      pretty: `${pos.degree}°${String(pos.minutes || 0).padStart(2,'0')}' ${pos.sign}`,
    });
  }
  return out;
}

function birthYearFromChart(chart: NatalChart): number {
  // birthDate is a string like "1985-07-12" or similar. Parse year defensively.
  const m = (chart.birthDate || '').match(/(\d{4})/);
  if (m) return parseInt(m[1], 10);
  return new Date().getFullYear();
}

/**
 * Find every star–point pair within orb. Strict: only listed points,
 * only degree-distance, no sign-based matches. Returns sorted by tightness.
 */
export function findFixedStarActivations(chart: NatalChart): FixedStarHit[] {
  if (!chart) return [];
  const year = birthYearFromChart(chart);
  const points = gatherNatalPoints(chart);
  const hits: FixedStarHit[] = [];

  for (const star of FIXED_STARS) {
    const starLon = precessedLongitude(star.j2000Lon, year);
    const starPretty = (() => {
      const f = fromLongitude(starLon);
      return `${f.deg}°${String(f.min).padStart(2,'0')}' ${f.sign}`;
    })();

    for (const pt of points) {
      const orbAllowed = orbFor(pt.key);
      if (orbAllowed == null) continue;
      let diff = Math.abs(starLon - pt.lon);
      if (diff > 180) diff = 360 - diff;
      if (diff > orbAllowed) continue;
      hits.push({
        star: star.name,
        theme: star.theme,
        point: POINT_LABEL[pt.key] || pt.key,
        orb: Math.round(diff * 100) / 100,
        starPosition: starPretty,
        natalPosition: pt.pretty,
        interpretation: buildInterpretation(star, POINT_LABEL[pt.key] || pt.key),
      });
    }
  }

  hits.sort((a, b) => a.orb - b.orb);
  return hits;
}

function buildInterpretation(star: FixedStar, point: string): string {
  const pointFlavor: Record<string, string> = {
    'Ascendant': 'It marks the body and the way you arrive in a room.',
    'Midheaven': 'It marks your public role and how the world reads you.',
    'Sun': 'It colors your core sense of self and life direction.',
    'Moon': 'It colors your emotional baseline and what feels safe.',
    'Mercury': 'It colors how you think and speak.',
    'Venus': 'It colors what you love and what you find beautiful.',
    'Mars': 'It colors your drive and how you fight for what you want.',
    'Jupiter': 'It colors your beliefs and where you tend to expand.',
    'Saturn': 'It colors your discipline and where life tests you over time.',
    'North Node': 'It colors the direction your life is asking you to grow toward.',
  };
  return `${star.name} sits on your ${point}: ${star.theme} ${pointFlavor[point] || ''}`.trim();
}

/**
 * Check if any of the user's fixed-star activations are being lit up by
 * today's transiting planets. Returns hits where a transit is within 1°
 * of the natal point that already carries the fixed star.
 *
 * `transitLongitudes` is a map like { Sun: 145.2, Mars: 88.4, ... }.
 */
export function findActiveFixedStarsToday(
  chart: NatalChart,
  transitLongitudes: Record<string, number>,
): Array<FixedStarHit & { triggeredBy: string }> {
  const baseHits = findFixedStarActivations(chart);
  if (!baseHits.length) return [];
  const points = gatherNatalPoints(chart);
  const lonByKey = new Map(points.map(p => [POINT_LABEL[p.key] || p.key, p.lon]));
  const out: Array<FixedStarHit & { triggeredBy: string }> = [];

  for (const hit of baseHits) {
    const natalLon = lonByKey.get(hit.point);
    if (natalLon == null) continue;
    for (const [planet, tLon] of Object.entries(transitLongitudes)) {
      let diff = Math.abs(tLon - natalLon);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 1.0) {
        out.push({ ...hit, triggeredBy: planet });
        break;
      }
    }
  }
  return out;
}
